import React, { useState, useEffect, useRef } from "react";
import {
  PageWrapper,
  Container,
  Input,
  Select,
  Button,
  Table,
  Th,
  Td,
  Tr,
  Label,
  FormRow,
  FormContent,
  ControlsContainer,
  SearchContainer,
  InputWrapper,
  ButtonContainer,
  TableWrapper,
  colors,
} from "../GlobalStyles";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";

// ─── Styled Components ───────────────────────────────────────────────────────

const PageHeader = styled.div`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: white;
  padding: 18px 24px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
`;

const PageSubtitle = styled.p`
  margin: 3px 0 0;
  font-size: 0.8rem;
  opacity: 0.8;
`;

const Drawer = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 0 0 8px 8px;
  max-height: ${(p) => (p.open ? "800px" : "0")};
  overflow: hidden;
  transition: max-height 0.35s ease;
`;

const DrawerInner = styled.div`
  padding: 20px 24px 16px;
  overflow-y: auto;
  max-height: 780px;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: ${colors.tabBg};
  border-bottom: 1px solid ${colors.border};
  font-weight: 600;
  font-size: 0.88rem;
  color: ${colors.primary};
`;

const SectionLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.textMuted};
  margin: 16px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid ${colors.border};
`;

const AvailRow = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr 1fr;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed ${colors.border};
  &:last-child { border-bottom: none; }
`;

const AvailLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  color: ${colors.textMain};
  cursor: pointer;
  input[type="checkbox"] {
    width: 15px;
    height: 15px;
    accent-color: ${colors.primary};
    cursor: pointer;
  }
`;

const FlagGroup = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  padding: 4px 0;
`;

const FlagItem = styled.label`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.88rem;
  font-weight: 500;
  color: ${colors.textMain};
  cursor: pointer;
  input[type="checkbox"] {
    width: 15px;
    height: 15px;
    accent-color: ${colors.primary};
    cursor: pointer;
  }
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ToggleTrack = styled.div`
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: ${(p) => (p.on ? "#ef4444" : "#cbd5e1")};
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
`;

const ToggleThumb = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 3px;
  left: ${(p) => (p.on ? "21px" : "3px")};
  transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
`;

const ToggleText = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${(p) => (p.on ? "#ef4444" : colors.textMuted)};
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  background: ${(p) =>
    p.variant === "green" ? "#dcfce7" :
      p.variant === "red" ? "#fee2e2" : "#f1f5f9"};
  color: ${(p) =>
    p.variant === "green" ? "#16a34a" :
      p.variant === "red" ? "#dc2626" : colors.textMuted};
`;

const ActionBtn = styled.button`
  padding: 4px 11px;
  border: none;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  background: ${(p) => (p.danger ? "#fee2e2" : colors.tabBg)};
  color: ${(p) => (p.danger ? "#dc2626" : colors.primary)};
  &:hover {
    background: ${(p) => (p.danger ? "#fecaca" : "#b2dfdb")};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  color: ${colors.textMuted};
  font-size: 0.9rem;
`;

const SearchInput = styled(Input)`
  min-width: 220px;
`;

const ErrorText = styled.span`
  color: #dc2626;
  font-size: 0.73rem;
  margin-top: 3px;
  display: block;
`;

const CountText = styled.div`
  color: ${colors.textMuted};
  font-size: 0.82rem;
  align-self: flex-end;
`;

const DisabledInput = styled(Input)`
  background: #f8fafc;
  color: ${colors.textMuted};
  cursor: not-allowed;
`;

// ─── Pagination Styles ────────────────────────────────────────────────────────

const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 4px;
  flex-wrap: wrap;
  gap: 12px;
`;

const PaginationInfo = styled.span`
  font-size: 0.85rem;
  color: ${colors.textMuted};
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageBtn = styled.button`
  min-width: 34px;
  height: 34px;
  padding: 0 8px;
  border: 1px solid ${(p) => (p.active ? colors.primary : colors.border)};
  border-radius: 6px;
  background: ${(p) => (p.active ? colors.primary : colors.surface)};
  color: ${(p) => (p.active ? "white" : colors.text)};
  font-size: 0.82rem;
  font-weight: ${(p) => (p.active ? 700 : 400)};
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.disabled ? 0.4 : 1)};
  transition: all 0.15s;
  &:hover:not(:disabled) {
    background: ${(p) => (p.active ? colors.primaryDark : colors.tabBg)};
    border-color: ${colors.primary};
  }
`;

const PageSizeSelect = styled.select`
  height: 30px;
  padding: 0 8px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  font-size: 0.82rem;
  background: ${colors.surface};
  color: ${colors.text};
  cursor: pointer;
`;

// ─── Searchable Composition Dropdown ─────────────────────────────────────────

const ComboWrapper = styled.div`
  position: relative;
`;

const ComboInput = styled(Input)`
  cursor: text;
`;

const ComboDropdown = styled.ul`
  position: absolute;
  z-index: 1000;
  top: calc(100% + 3px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
  padding: 4px 0;
  list-style: none;
`;

const ComboOption = styled.li`
  padding: 8px 12px;
  font-size: 0.88rem;
  cursor: pointer;
  color: ${colors.textMain};
  background: ${(p) => (p.highlighted ? "#f0fdfa" : "transparent")};
  &:hover { background: #f0fdfa; color: ${colors.primary}; }
`;

const ComboEmpty = styled.li`
  padding: 10px 12px;
  font-size: 0.84rem;
  color: ${colors.textMuted};
  list-style: none;
`;

const CompositionTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f766e;
  margin-top: 4px;
`;

// ─── Searchable Dropdown Component ───────────────────────────────────────────

const CompositionSelect = ({ compositions, value, onChange, error }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedLabel = compositions.find(
    (c) => String(c.composition_id) === String(value)
  )?.composition_name || "";

  const filtered = query.trim()
    ? compositions.filter((c) =>
      c.composition_name.toLowerCase().includes(query.toLowerCase())
    )
    : compositions;

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (comp) => {
    onChange(comp.composition_id);
    setOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    onChange("");
    setQuery("");
  };

  return (
    <ComboWrapper ref={wrapperRef}>
      <ComboInput
        readOnly={!!selectedLabel && !open}
        value={open ? query : selectedLabel}
        placeholder="Search composition…"
        style={error ? { borderColor: "#dc2626" } : {}}
        onFocus={() => { setOpen(true); setQuery(""); }}
        onChange={(e) => setQuery(e.target.value)}
      />
      {selectedLabel && !open && (
        <CompositionTag>
          🧪 {selectedLabel}
          <span
            style={{ cursor: "pointer", fontWeight: 700, color: "#dc2626" }}
            onClick={handleClear}
            title="Clear"
          >
            ×
          </span>
        </CompositionTag>
      )}
      {open && (
        <ComboDropdown>
          {filtered.length === 0 ? (
            <ComboEmpty>No compositions found</ComboEmpty>
          ) : (
            filtered.map((comp) => (
              <ComboOption
                key={comp.composition_id}
                highlighted={String(comp.composition_id) === String(value)}
                onMouseDown={() => handleSelect(comp)}
              >
                {comp.composition_name}
              </ComboOption>
            ))
          )}
        </ComboDropdown>
      )}
    </ComboWrapper>
  );
};

// ─── Pagination Hook ──────────────────────────────────────────────────────────

const usePagination = (data, defaultPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  useEffect(() => { setCurrentPage(1); }, [data.length, pageSize]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const pageData = data.slice(startIdx, startIdx + pageSize);

  const goTo = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => setPageSize(Number(size));

  return { currentPage, pageSize, totalPages, pageData, goTo, handlePageSizeChange, startIdx };
};

// ─── Pagination Component ─────────────────────────────────────────────────────

const Pagination = ({ currentPage, totalPages, pageSize, totalItems, startIdx, goTo, onPageSizeChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const endIdx = Math.min(startIdx + pageSize, totalItems);

  return (
    <PaginationWrapper>
      <PaginationInfo>
        Showing <strong>{totalItems === 0 ? 0 : startIdx + 1}–{endIdx}</strong> of{" "}
        <strong>{totalItems}</strong> item(s)
        &nbsp;|&nbsp; Rows per page:{" "}
        <PageSizeSelect value={pageSize} onChange={(e) => onPageSizeChange(e.target.value)}>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </PageSizeSelect>
      </PaginationInfo>

      <PaginationControls>
        <PageBtn onClick={() => goTo(1)} disabled={currentPage === 1}>«</PageBtn>
        <PageBtn onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}>‹</PageBtn>
        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <PageBtn key={`e-${idx}`} disabled style={{ cursor: "default" }}>…</PageBtn>
          ) : (
            <PageBtn key={p} active={p === currentPage} onClick={() => goTo(p)}>{p}</PageBtn>
          )
        )}
        <PageBtn onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages}>›</PageBtn>
        <PageBtn onClick={() => goTo(totalPages)} disabled={currentPage === totalPages}>»</PageBtn>
      </PaginationControls>
    </PaginationWrapper>
  );
};

// ─── Constants ───────────────────────────────────────────────────────────────

const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const EMPTY_FORM = {
  item_name: "",
  item_last_name: "",
  category: "",   // stores category_id (number as string)
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

// ─── Component ───────────────────────────────────────────────────────────────

const PharmacyItemMaster = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [compositions, setCompositions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingItemName, setTrackingItemName] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);

  const handleTrackItem = async (item) => {
    setTrackingItemName(item.item_name);
    setTrackingModalOpen(true);
    setTrackingData(null);
    setTrackingLoading(true);
    try {
      const res = await apiRequest(`${baseUrl}get_pharmacy_item_tracking/?item_id=${item.item_id}`, "GET");
      if (res.success) {
        setTrackingData(res.data);
      } else {
        showToast(res.error || "Failed to fetch tracking data", "error");
      }
    } catch (err) {
      showToast("Error fetching tracking data", "error");
    } finally {
      setTrackingLoading(false);
    }
  };

  // ── Lookup helpers ────────────────────────────────────────────────────────
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

  // ── Filtered + sorted alphabetically by item_name ────────────────────────
  const filtered = items
    .filter((it) => {
      const q = search.toLowerCase();
      const catName = getCategoryName(it.category).toLowerCase();
      return (
        it.item_name?.toLowerCase().includes(q) ||
        it.item_last_name?.toLowerCase().includes(q) ||
        catName.includes(q) ||
        it.hsn?.toLowerCase().includes(q) ||
        it.brand_name?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (a.item_name || "").localeCompare(b.item_name || ""));

  const { currentPage, pageSize, totalPages, pageData, goTo, handlePageSizeChange, startIdx } =
    usePagination(filtered, 10);

  // ── API ──────────────────────────────────────────────────────────────────

  const fetchItems = async () => {
    try {
      const res = await apiRequest(`${baseUrl}pharmacy-items/`, "GET");
      if (res.success) setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast("Failed to fetch items", "error");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiRequest(`${baseUrl}pharmacy-category/`, "GET");
      const list = Array.isArray(res?.data) ? res.data
        : Array.isArray(res) ? res : [];
      setCategories(list);
    } catch {
      showToast("Failed to fetch categories", "error");
    }
  };

  const fetchCompositions = async () => {
    try {
      const res = await apiRequest(`${baseUrl}chemical-composition/`, "GET");
      const list = Array.isArray(res?.data) ? res.data
        : Array.isArray(res) ? res : [];
      setCompositions(list);
    } catch {
      showToast("Failed to fetch compositions", "error");
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchCompositions();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.item_name.trim()) e.item_name = "Item name is required";
    if (!form.category) e.category = "Category is required";
    if (form.is_blocked && !form.blocked_reason.trim())
      e.blocked_reason = "Reason required when blocked";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const url = editId ? `${baseUrl}pharmacy-items/${editId}/` : `${baseUrl}pharmacy-items/`;
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
      if (res.success) {
        showToast(editId ? "Item updated" : "Item added");
        setForm(EMPTY_FORM);
        setEditId(null);
        setShowForm(false);
        fetchItems();
      } else {
        showToast(JSON.stringify(res.data || res.error), "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      item_name: item.item_name || "",
      item_last_name: item.item_last_name || "",
      category: item.category != null
        ? String(item.category) : "",
      hsn: item.hsn || "",
      brand_name: item.brand_name || "",
      chemical_composition: item.chemical_composition != null
        ? String(item.chemical_composition) : "",
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
    setShowForm(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const res = await apiRequest(`${baseUrl}pharmacy-items/${id}/`, "DELETE");
      if (res.success) { showToast("Item deleted"); fetchItems(); }
      else showToast("Delete failed", "error");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
    setErrors({});
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      {toast && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 9999,
          padding: "10px 18px", borderRadius: 6,
          background: toast.type === "error" ? "#dc2626" : "#16a34a",
          color: "white", fontWeight: 600, fontSize: "0.875rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
        }}>
          {toast.msg}
        </div>
      )}

      <Container>
        {/* ── Header ── */}
        <PageHeader>
          <div>
            <PageTitle>💊 Pharmacy Item Master</PageTitle>
            <PageSubtitle>Manage pharmacy inventory items</PageSubtitle>
          </div>
          <Button
            onClick={() => { setShowForm((p) => !p); if (showForm) handleCancel(); }}
            style={{ background: "white", color: colors.primary, fontSize: "0.85rem", padding: "7px 16px" }}
          >
            {showForm ? "✕ Close" : "+ Add New Item"}
          </Button>
        </PageHeader>

        {/* ── Slide-down Form Drawer ── */}
        <Drawer open={showForm}>
          <DrawerHeader>
            {editId ? "✏️ Edit Pharmacy Item" : "➕ New Pharmacy Item"}
            <span style={{ color: colors.textMuted, fontWeight: 400, fontSize: "0.8rem" }}>
              Fields marked * are required
            </span>
          </DrawerHeader>
          <DrawerInner>

            <SectionLabel>Basic Information</SectionLabel>
            <FormRow>
              <InputWrapper>
                <Label>Item Name *</Label>
                <Input
                  name="item_name"
                  value={form.item_name}
                  onChange={handleChange}
                  placeholder="Generic / brand name"
                  style={errors.item_name ? { borderColor: "#dc2626" } : {}}
                />
                {errors.item_name && <ErrorText>{errors.item_name}</ErrorText>}
              </InputWrapper>

              <InputWrapper>
                <Label>Item Last Name</Label>
                <Input
                  name="item_last_name"
                  value={form.item_last_name}
                  onChange={handleChange}
                  placeholder="Salt / compound name"
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Brand Name</Label>
                <Input
                  name="brand_name"
                  value={form.brand_name}
                  onChange={handleChange}
                  placeholder="e.g. Crocin, Dolo"
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Category *</Label>
                <Select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={errors.category ? { borderColor: "#dc2626" } : {}}
                >
                  <option value="">-- Select --</option>
                  {categories.length === 0 ? (
                    <option disabled>Loading…</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))
                  )}
                </Select>
                {errors.category && <ErrorText>{errors.category}</ErrorText>}
              </InputWrapper>

              <InputWrapper>
                <Label>HSN Code</Label>
                <Input
                  name="hsn"
                  value={form.hsn}
                  onChange={handleChange}
                  placeholder="Enter HSN code"
                  style={{ fontFamily: "monospace", letterSpacing: "1px" }}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Reorder Level</Label>
                <Input
                  name="reorder_level"
                  type="number"
                  value={form.reorder_level}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </InputWrapper>
            </FormRow>

            <SectionLabel>Chemical Composition</SectionLabel>
            <FormRow columns="1fr 1fr">
              <InputWrapper>
                <Label>Chemical Composition</Label>
                <CompositionSelect
                  compositions={compositions}
                  value={form.chemical_composition}
                  onChange={(id) => {
                    setForm((p) => ({ ...p, chemical_composition: id ? String(id) : "" }));
                  }}
                  error={errors.chemical_composition}
                />
                {errors.chemical_composition && (
                  <ErrorText>{errors.chemical_composition}</ErrorText>
                )}
              </InputWrapper>
            </FormRow>

            <SectionLabel>Special Flags</SectionLabel>
            <FlagGroup>
              <FlagItem>
                <input type="checkbox" name="high_risk" checked={form.high_risk} onChange={handleChange} />
                🔴 High Risk
              </FlagItem>
              <FlagItem>
                <input type="checkbox" name="look_alike" checked={form.look_alike} onChange={handleChange} />
                👁️ Look-Alike
              </FlagItem>
              <FlagItem>
                <input type="checkbox" name="sound_alike" checked={form.sound_alike} onChange={handleChange} />
                🔊 Sound-Alike
              </FlagItem>
            </FlagGroup>

            <SectionLabel>Pharmacy Availability &amp; Location</SectionLabel>

            <AvailRow>
              <AvailLabel>
                <input type="checkbox" name="IP_available" checked={form.IP_available} onChange={handleChange} />
                IP Pharmacy
              </AvailLabel>
              {form.IP_available ? (
                <>
                  <InputWrapper style={{ margin: 0 }}>
                    <Label>Shelf No.</Label>
                    <Input name="IP_shelf_no" value={form.IP_shelf_no} onChange={handleChange} placeholder="e.g. A1" />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Label>Rack No.</Label>
                    <Input name="IP_rack_no" value={form.IP_rack_no} onChange={handleChange} placeholder="e.g. R3" />
                  </InputWrapper>
                </>
              ) : (
                <>
                  <DisabledInput disabled placeholder="N/A" />
                  <DisabledInput disabled placeholder="N/A" />
                </>
              )}
            </AvailRow>

            <AvailRow>
              <AvailLabel>
                <input type="checkbox" name="OP_available" checked={form.OP_available} onChange={handleChange} />
                OP Pharmacy
              </AvailLabel>
              {form.OP_available ? (
                <>
                  <InputWrapper style={{ margin: 0 }}>
                    <Label>Shelf No.</Label>
                    <Input name="OP_shelf_no" value={form.OP_shelf_no} onChange={handleChange} placeholder="e.g. B2" />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Label>Rack No.</Label>
                    <Input name="OP_rack_no" value={form.OP_rack_no} onChange={handleChange} placeholder="e.g. R5" />
                  </InputWrapper>
                </>
              ) : (
                <>
                  <DisabledInput disabled placeholder="N/A" />
                  <DisabledInput disabled placeholder="N/A" />
                </>
              )}
            </AvailRow>

            <AvailRow>
              <AvailLabel>
                <input type="checkbox" name="G_available" checked={form.G_available} onChange={handleChange} />
                General
              </AvailLabel>
              {form.G_available ? (
                <>
                  <InputWrapper style={{ margin: 0 }}>
                    <Label>Shelf No.</Label>
                    <Input name="G_shelf_no" value={form.G_shelf_no} onChange={handleChange} placeholder="e.g. C3" />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Label>Rack No.</Label>
                    <Input name="G_rack_no" value={form.G_rack_no} onChange={handleChange} placeholder="e.g. R7" />
                  </InputWrapper>
                </>
              ) : (
                <>
                  <DisabledInput disabled placeholder="N/A" />
                  <DisabledInput disabled placeholder="N/A" />
                </>
              )}
            </AvailRow>

            <SectionLabel>Status</SectionLabel>
            <FormRow style={{ alignItems: "flex-start" }}>
              <InputWrapper>
                <Label>Block Item</Label>
                <ToggleWrapper>
                  <ToggleTrack
                    on={form.is_blocked}
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        is_blocked: !p.is_blocked,
                        blocked_reason: !p.is_blocked ? p.blocked_reason : "",
                      }))
                    }
                  >
                    <ToggleThumb on={form.is_blocked} />
                  </ToggleTrack>
                  <ToggleText on={form.is_blocked}>
                    {form.is_blocked ? "Blocked" : "Not Blocked"}
                  </ToggleText>
                </ToggleWrapper>
              </InputWrapper>

              {form.is_blocked && (
                <InputWrapper>
                  <Label>Reason *</Label>
                  <Input
                    name="blocked_reason"
                    value={form.blocked_reason}
                    onChange={handleChange}
                    placeholder="Reason for blocking"
                    style={errors.blocked_reason ? { borderColor: "#dc2626" } : {}}
                  />
                  {errors.blocked_reason && <ErrorText>{errors.blocked_reason}</ErrorText>}
                </InputWrapper>
              )}
            </FormRow>

            <ButtonContainer>
              <Button secondary onClick={handleCancel}>✕ Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving…" : editId ? "✔ Update Item" : "✔ Add Item"}
              </Button>
            </ButtonContainer>
          </DrawerInner>
        </Drawer>

        {/* ── Table ── */}
        <FormContent style={{ marginTop: 20 }}>
          <ControlsContainer>
            <SearchContainer>
              <InputWrapper>
                <Label>Search</Label>
                <SearchInput
                  placeholder="Search by name, category, HSN, brand…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputWrapper>
            </SearchContainer>
            <CountText>{filtered.length} item(s) found</CountText>
          </ControlsContainer>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Item Name ↑</Th>
                  <Th>Last Name</Th>
                  <Th>Brand</Th>
                  <Th>Category</Th>
                  <Th>HSN</Th>
                  <Th>Composition</Th>
                  <Th>Reorder</Th>
                  <Th>High Risk</Th>
                  <Th>Look-Alike</Th>
                  <Th>Sound-Alike</Th>
                  <Th>IP</Th>
                  <Th>IP Shelf / Rack</Th>
                  <Th>OP</Th>
                  <Th>OP Shelf / Rack</Th>
                  <Th>G</Th>
                  <Th>G Shelf / Rack</Th>
                  <Th>Blocked</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={19}>
                      <EmptyState>No items found. Click "+ Add New Item" to get started.</EmptyState>
                    </td>
                  </tr>
                ) : (
                  pageData.map((item, idx) => (
                    <Tr key={item.item_id}>
                      <Td>{startIdx + idx + 1}</Td>
                      <Td style={{ fontWeight: 600 }}>{item.item_name}</Td>
                      <Td>{item.item_last_name || "—"}</Td>
                      <Td>{item.brand_name || "—"}</Td>
                      <Td>{getCategoryName(item.category)}</Td>
                      <Td style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{item.hsn || "—"}</Td>
                      <Td style={{ fontSize: "0.82rem" }}>{getCompositionName(item.chemical_composition)}</Td>
                      <Td style={{ textAlign: "center" }}>{item.reorder_level}</Td>
                      <Td><Badge variant={item.high_risk ? "green" : ""}>{item.high_risk ? "Yes" : "No"}</Badge></Td>
                      <Td><Badge variant={item.look_alike ? "green" : ""}>{item.look_alike ? "Yes" : "No"}</Badge></Td>
                      <Td><Badge variant={item.sound_alike ? "green" : ""}>{item.sound_alike ? "Yes" : "No"}</Badge></Td>
                      <Td><Badge variant={item.IP_available ? "green" : ""}>{item.IP_available ? "Yes" : "No"}</Badge></Td>
                      <Td style={{ fontSize: "0.8rem" }}>
                        {item.IP_available ? `${item.IP_shelf_no || "—"} / ${item.IP_rack_no || "—"}` : "—"}
                      </Td>
                      <Td><Badge variant={item.OP_available ? "green" : ""}>{item.OP_available ? "Yes" : "No"}</Badge></Td>
                      <Td style={{ fontSize: "0.8rem" }}>
                        {item.OP_available ? `${item.OP_shelf_no || "—"} / ${item.OP_rack_no || "—"}` : "—"}
                      </Td>
                      <Td><Badge variant={item.G_available ? "green" : ""}>{item.G_available ? "Yes" : "No"}</Badge></Td>
                      <Td style={{ fontSize: "0.8rem" }}>
                        {item.G_available ? `${item.G_shelf_no || "—"} / ${item.G_rack_no || "—"}` : "—"}
                      </Td>
                      <Td>
                        {item.is_blocked
                          ? <Badge variant="red">🔒 {item.blocked_reason || "Blocked"}</Badge>
                          : <Badge>No</Badge>}
                      </Td>
                      <Td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <ActionBtn onClick={() => handleTrackItem(item)} style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>Track</ActionBtn>
                          <ActionBtn onClick={() => handleEdit(item)}>Edit</ActionBtn>
                          <ActionBtn danger onClick={() => handleDelete(item.item_id)}>Delete</ActionBtn>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>

          {/* ── Pagination ── */}
          {filtered.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filtered.length}
              startIdx={startIdx}
              goTo={goTo}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </FormContent>
      </Container>

      {/* TRACKING MODAL */}
      {trackingModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "12px", width: "800px", maxWidth: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "20px 24px", background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>Track Item: {trackingItemName}</h2>
              <button onClick={() => setTrackingModalOpen(false)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>

            <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
              {trackingLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>Loading tracking data...</div>
              ) : trackingData ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                    <div style={{ padding: "20px", background: colors.primary + "10", borderRadius: "12px", border: `1px solid ${colors.primary}30` }}>
                      <div style={{ fontSize: "0.9rem", color: colors.textMuted, fontWeight: "600" }}>Total Current Stock</div>
                      <div style={{ fontSize: "2rem", fontWeight: "700", color: colors.primary, marginTop: "8px" }}>{trackingData.total_stock}</div>
                    </div>
                    <div style={{ padding: "20px", background: colors.primary + "10", borderRadius: "12px", border: `1px solid ${colors.primary}30` }}>
                      <div style={{ fontSize: "0.9rem", color: colors.textMuted, fontWeight: "600" }}>Times Procured</div>
                      <div style={{ fontSize: "2rem", fontWeight: "700", color: colors.primary, marginTop: "8px" }}>{trackingData.times_procured}</div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: colors.textMain }}>Batch History</h3>
                  {trackingData.batches && trackingData.batches.length > 0 ? (
                    <TableWrapper style={{ maxHeight: "300px", overflowY: "auto" }}>
                      <Table>
                        <thead style={{ position: "sticky", top: 0, background: colors.tableHeaderBg, zIndex: 1 }}>
                          <tr>
                            <Th>Batch Number</Th>
                            <Th>Procured Date</Th>
                            <Th>Expiry Date</Th>
                            <Th>GRN No.</Th>
                            <Th>Initial Stock</Th>
                            <Th>Current Stock</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {trackingData.batches.map((b, idx) => (
                            <Tr key={idx}>
                              <Td><strong>{b.batch_number}</strong></Td>
                              <Td>{b.procured_date}</Td>
                              <Td>
                                <Badge variant={new Date(b.expiry_date.split('-').reverse().join('-')) < new Date() ? "red" : "green"}>
                                  {b.expiry_date}
                                </Badge>
                              </Td>
                              <Td>{b.grn_number}</Td>
                              <Td>{b.total_stock}</Td>
                              <Td><strong style={{ color: colors.primary }}>{b.current_stock}</strong></Td>
                            </Tr>
                          ))}
                        </tbody>
                      </Table>
                    </TableWrapper>
                  ) : (
                    <div style={{ textAlign: "center", padding: "30px", background: "#f8fafc", borderRadius: "8px", color: colors.textMuted }}>
                      No procurement history found for this item.
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>Failed to load data.</div>
              )}
            </div>

            <div style={{ padding: "16px 24px", background: "#f8fafc", borderTop: `1px solid ${colors.border}`, display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => setTrackingModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

    </PageWrapper>
  );
};

export default PharmacyItemMaster;