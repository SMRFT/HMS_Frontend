import React, { useState, useEffect } from "react";
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
  max-height: ${(p) => (p.open ? "700px" : "0")};
  overflow: hidden;
  transition: max-height 0.35s ease;
`;

const DrawerInner = styled.div`
  padding: 20px 24px 16px;
  overflow-y: auto;
  max-height: 680px;
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
    p.variant === "red"   ? "#fee2e2" : "#f1f5f9"};
  color: ${(p) =>
    p.variant === "green" ? "#16a34a" :
    p.variant === "red"   ? "#dc2626" : colors.textMuted};
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

// HSN read-only display (add mode) — shows the auto-generated value
const HsnReadOnly = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  background: #f0fdf4;
  font-family: monospace;
  font-size: 0.9rem;
  font-weight: 700;
  color: #16a34a;
  letter-spacing: 1px;
`;

const HsnTag = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  background: #16a34a;
  color: white;
  padding: 1px 5px;
  border-radius: 8px;
  letter-spacing: 0.3px;
`;

// ─── Constants ───────────────────────────────────────────────────────────────

const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const EMPTY_FORM = {
  item_name: "",
  item_last_name: "",
  category: "",
  hsn: "",
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
  const [items, setItems]           = useState([]);
  const [categories, setCategories] = useState([]);   // ← from API
  const [nextHsn, setNextHsn]       = useState("");   // ← auto-generated preview
  const [form, setForm]             = useState(EMPTY_FORM);
  const [editId, setEditId]         = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState({});
  const [toast, setToast]           = useState(null);

  // ── API ──────────────────────────────────────────────────────────────────

  const fetchItems = async () => {
    try {
      const res = await apiRequest(`${baseUrl}pharmacy-items/`, "GET");
      if (res.success) setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast("Failed to fetch items", "error");
    }
  };

  // Fetch categories from pharmacy-category endpoint
  const fetchCategories = async () => {
    try {
      const res = await apiRequest(`${baseUrl}pharmacy-category/`, "GET");
      // Accept both response shapes: res.data (array) or res itself (array)
      const list = Array.isArray(res?.data) ? res.data
                 : Array.isArray(res)        ? res
                 : [];
      setCategories(list);
    } catch {
      showToast("Failed to fetch categories", "error");
    }
  };

  // Derive the next HSN from the existing items list
  const computeNextHsn = (itemList) => {
    if (!itemList || itemList.length === 0) return "00001";
    // Collect valid numeric HSN values
    const nums = itemList
      .map((it) => parseInt(it.hsn, 10))
      .filter((n) => !isNaN(n));
    if (nums.length === 0) return "00001";
    const max = Math.max(...nums);
    return String(max + 1).padStart(5, "0");
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  // Recompute preview whenever items list changes and we're in add mode
  useEffect(() => {
    if (!editId) {
      setNextHsn(computeNextHsn(items));
    }
  }, [items, editId]);

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
    if (!form.category)         e.category  = "Category is required";
    if (form.is_blocked && !form.blocked_reason.trim())
      e.blocked_reason = "Reason required when blocked";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const url    = editId ? `${baseUrl}pharmacy-items/${editId}/` : `${baseUrl}pharmacy-items/`;
      const method = editId ? "PUT" : "POST";

      const payload = {
        ...form,
        is_active:      true,
        reorder_level:  Number(form.reorder_level) || 0,
        // HSN: on add, omit it entirely so the backend auto-generates;
        //      on edit, send whatever the user sees (existing value)
        ...(editId ? { hsn: form.hsn } : {}),
        IP_shelf_no:    form.IP_available ? form.IP_shelf_no : "",
        IP_rack_no:     form.IP_available ? form.IP_rack_no  : "",
        OP_shelf_no:    form.OP_available ? form.OP_shelf_no : "",
        OP_rack_no:     form.OP_available ? form.OP_rack_no  : "",
        G_shelf_no:     form.G_available  ? form.G_shelf_no  : "",
        G_rack_no:      form.G_available  ? form.G_rack_no   : "",
        blocked_reason: form.is_blocked   ? form.blocked_reason : "",
      };

      // Remove hsn key entirely on POST so backend generates it
      if (!editId) delete payload.hsn;

      const res = await apiRequest(url, method, payload);
      if (res.success) {
        showToast(editId ? "Item updated" : "Item added");
        setForm(EMPTY_FORM);
        setEditId(null);
        setShowForm(false);
        fetchItems(); // refreshes items → recomputes nextHsn
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
      item_name:      item.item_name      || "",
      item_last_name: item.item_last_name || "",
      category:       item.category       || "",
      hsn:            item.hsn            || "",
      high_risk:      !!item.high_risk,
      look_alike:     !!item.look_alike,
      sound_alike:    !!item.sound_alike,
      reorder_level:  item.reorder_level  ?? "",
      IP_available:   item.IP_available   !== false,
      IP_shelf_no:    item.IP_shelf_no    || "",
      IP_rack_no:     item.IP_rack_no     || "",
      OP_available:   item.OP_available   !== false,
      OP_shelf_no:    item.OP_shelf_no    || "",
      OP_rack_no:     item.OP_rack_no     || "",
      G_available:    item.G_available    !== false,
      G_shelf_no:     item.G_shelf_no     || "",
      G_rack_no:      item.G_rack_no      || "",
      is_blocked:     !!item.is_blocked,
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

  const filtered = items.filter((it) => {
    const q = search.toLowerCase();
    return (
      it.item_name?.toLowerCase().includes(q) ||
      it.item_last_name?.toLowerCase().includes(q) ||
      it.category?.toLowerCase().includes(q) ||
      it.hsn?.toLowerCase().includes(q)
    );
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      {/* Toast */}
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

            {/* Basic Info */}
            <SectionLabel>Basic Information</SectionLabel>
            <FormRow>

              <InputWrapper>
                <Label>Item Name *</Label>
                <Input name="item_name" value={form.item_name} onChange={handleChange}
                  placeholder="Generic / brand name"
                  style={errors.item_name ? { borderColor: "#dc2626" } : {}} />
                {errors.item_name && <ErrorText>{errors.item_name}</ErrorText>}
              </InputWrapper>

              <InputWrapper>
                <Label>Item Last Name</Label>
                <Input name="item_last_name" value={form.item_last_name} onChange={handleChange}
                  placeholder="Salt / compound name" />
              </InputWrapper>

              {/* Category — populated from API */}
              <InputWrapper>
                <Label>Category *</Label>
                <Select name="category" value={form.category} onChange={handleChange}
                  style={errors.category ? { borderColor: "#dc2626" } : {}}>
                  <option value="">-- Select --</option>
                  {categories.length === 0 ? (
                    <option disabled>Loading…</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_name}>
                        {cat.category_name}
                      </option>
                    ))
                  )}
                </Select>
                {errors.category && <ErrorText>{errors.category}</ErrorText>}
              </InputWrapper>

              {/* HSN — auto on add, editable on edit */}
              <InputWrapper>
                <Label>HSN Code</Label>
                {editId ? (
                  <Input
                    name="hsn"
                    value={form.hsn}
                    onChange={handleChange}
                    placeholder="HSN code"
                    style={{ fontFamily: "monospace", letterSpacing: "1px" }}
                  />
                ) : (
                  <HsnReadOnly>
                    {nextHsn || "—"}
                  </HsnReadOnly>
                )}
              </InputWrapper>

              <InputWrapper>
                <Label>Reorder Level</Label>
                <Input name="reorder_level" type="number" value={form.reorder_level}
                  onChange={handleChange} placeholder="0" min="0" />
              </InputWrapper>

            </FormRow>

            {/* Special Flags */}
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

            {/* Availability */}
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

            {/* Status */}
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

        <FormContent style={{ marginTop: 20 }}>
          {/* Search */}
          <ControlsContainer>
            <SearchContainer>
              <InputWrapper>
                <Label>Search</Label>
                <SearchInput
                  placeholder="Search by name, category, HSN…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputWrapper>
            </SearchContainer>
            <CountText>{filtered.length} item(s) found</CountText>
          </ControlsContainer>

          {/* Table */}
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Item Name</Th>
                  <Th>Last Name</Th>
                  <Th>Category</Th>
                  <Th>HSN</Th>
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={17}>
                      <EmptyState>No items found. Click "+ Add New Item" to get started.</EmptyState>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <Tr key={item.item_id}>
                      <Td>{idx + 1}</Td>
                      <Td style={{ fontWeight: 600 }}>{item.item_name}</Td>
                      <Td>{item.item_last_name || "—"}</Td>
                      <Td>{item.category}</Td>
                      <Td style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{item.hsn || "—"}</Td>
                      <Td style={{ textAlign: "center" }}>{item.reorder_level}</Td>
                      <Td><Badge variant={item.high_risk   ? "green" : ""}>{item.high_risk   ? "Yes" : "No"}</Badge></Td>
                      <Td><Badge variant={item.look_alike  ? "green" : ""}>{item.look_alike  ? "Yes" : "No"}</Badge></Td>
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
        </FormContent>
      </Container>
    </PageWrapper>
  );
};

export default PharmacyItemMaster;