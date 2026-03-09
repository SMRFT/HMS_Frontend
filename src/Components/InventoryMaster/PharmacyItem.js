import React, { useState, useEffect } from "react";
import {
  PageWrapper,
  Container,
  SectionTitle,
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

// ─── Styled Helpers ──────────────────────────────────────────────────────────

const PageHeader = styled.div`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: white;
  padding: 20px 30px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.3px;
`;

const PageSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 0.85rem;
  opacity: 0.85;
`;

const FormCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  margin-bottom: 24px;
`;

const FormCardHeader = styled.div`
  padding: 14px 20px;
  border-bottom: 1px solid ${colors.border};
  background: ${colors.tabBg};
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  font-size: 0.9rem;
  color: ${colors.primary};
`;

const SectionDivider = styled.div`
  margin: 18px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1.5px solid ${colors.border};
  font-weight: 700;
  font-size: 0.85rem;
  color: ${colors.primary};
  letter-spacing: 0.4px;
  text-transform: uppercase;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(p) =>
    p.type === "yes" ? "#dcfce7" : p.type === "blocked" ? "#fee2e2" : "#f1f5f9"};
  color: ${(p) =>
    p.type === "yes" ? colors.success : p.type === "blocked" ? colors.danger : colors.textMuted};
`;

const ActionBtn = styled.button`
  padding: 5px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(p) => (p.danger ? "#fee2e2" : colors.tabBg)};
  color: ${(p) => (p.danger ? colors.danger : colors.primary)};
  &:hover {
    background: ${(p) => (p.danger ? "#fecaca" : "#b2dfdb")};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 50px 20px;
  color: ${colors.textMuted};
  font-size: 0.95rem;
`;

const CheckGroup = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
  padding: 8px 0;
`;

const CheckItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${colors.textMain};
  cursor: pointer;
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: ${colors.primary};
    cursor: pointer;
  }
`;

/* Toggle for is_blocked */
const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ToggleTrack = styled.div`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: ${(p) => (p.on ? colors.danger : "#cbd5e1")};
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
`;

const ToggleThumb = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 3px;
  left: ${(p) => (p.on ? "23px" : "3px")};
  transition: left 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
`;

const ToggleLabel = styled.span`
  font-size: 0.88rem;
  font-weight: 600;
  color: ${(p) => (p.on ? colors.danger : colors.textMuted)};
`;

const SearchInput = styled(Input)`
  min-width: 240px;
`;

// ─── Constants ───────────────────────────────────────────────────────────────

const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const CATEGORIES = [
  "Tablet", "Syrup", "Capsule", "Injection", "Ointment",
  "Drops", "Inhaler", "Powder", "Gel", "Suspension",
];

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
  is_active: true,
};

// ─── Main Component ──────────────────────────────────────────────────────────

const PharmacyItemMaster = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // ── API ────────────────────────────────────────────────────────────────────

  const fetchItems = async () => {
    try {
      const response = await apiRequest(`${baseUrl}pharmacy-items/`, "GET");
      if (response.success) {
        setItems(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      showToast("Failed to fetch items", "error");
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleToggleBlocked = () => {
    setForm((prev) => ({
      ...prev,
      is_blocked: !prev.is_blocked,
      blocked_reason: !prev.is_blocked ? prev.blocked_reason : "",
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.item_name.trim()) errs.item_name = "Item name is required";
    if (!form.category) errs.category = "Category is required";
    if (form.is_blocked && !form.blocked_reason.trim())
      errs.blocked_reason = "Reason is required when blocked";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const url = editId
        ? `${baseUrl}pharmacy-items/${editId}/`
        : `${baseUrl}pharmacy-items/`;
      const method = editId ? "PUT" : "POST";
      const payload = {
        ...form,
        reorder_level: Number(form.reorder_level) || 0,
        // clear shelf/rack if not available
        IP_shelf_no: form.IP_available ? form.IP_shelf_no : "",
        IP_rack_no: form.IP_available ? form.IP_rack_no : "",
        OP_shelf_no: form.OP_available ? form.OP_shelf_no : "",
        OP_rack_no: form.OP_available ? form.OP_rack_no : "",
        G_shelf_no: form.G_available ? form.G_shelf_no : "",
        G_rack_no: form.G_available ? form.G_rack_no : "",
        blocked_reason: form.is_blocked ? form.blocked_reason : "",
      };
      const response = await apiRequest(url, method, payload);
      if (response.success) {
        showToast(editId ? "Item updated successfully" : "Item added successfully");
        setForm(EMPTY_FORM);
        setEditId(null);
        setShowForm(false);
        fetchItems();
      } else {
        showToast(JSON.stringify(response.data || response.error), "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      item_name: item.item_name || "",
      item_last_name: item.item_last_name || "",
      category: item.category || "",
      hsn: item.hsn || "",
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
      is_active: item.is_active !== false,
    });
    setEditId(item.item_id);
    setShowForm(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item? This action cannot be undone.")) return;
    try {
      const response = await apiRequest(`${baseUrl}pharmacy-items/${id}/`, "DELETE");
      if (response.success) {
        showToast("Item deleted successfully");
        fetchItems();
      } else {
        showToast("Delete failed", "error");
      }
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
    setErrors({});
  };

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = items.filter((it) => {
    const q = search.toLowerCase();
    return (
      it.item_name?.toLowerCase().includes(q) ||
      it.item_last_name?.toLowerCase().includes(q) ||
      it.category?.toLowerCase().includes(q) ||
      it.hsn?.toLowerCase().includes(q)
    );
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed", top: 20, right: 20, zIndex: 9999,
            padding: "12px 20px", borderRadius: 8,
            background: toast.type === "error" ? colors.danger : colors.success,
            color: "white", fontWeight: 600, fontSize: "0.9rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {toast.msg}
        </div>
      )}

      <Container>
        {/* Header */}
        <PageHeader>
          <div>
            <PageTitle>💊 Pharmacy Item Master</PageTitle>
            <PageSubtitle>Manage pharmacy inventory items</PageSubtitle>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              style={{ background: "white", color: colors.primary }}
            >
              + Add New Item
            </Button>
          )}
        </PageHeader>

        <FormContent>
          {/* ── Form ── */}
          {showForm && (
            <FormCard>
              <FormCardHeader>
                {editId ? "✏️ Edit Pharmacy Item" : "➕ Add New Pharmacy Item"}
              </FormCardHeader>
              <div style={{ padding: "20px" }}>

                {/* ── Basic Info ── */}
                <SectionDivider>Basic Information</SectionDivider>
                <FormRow>
                  <InputWrapper>
                    <Label required>Item Name</Label>
                    <Input
                      name="item_name"
                      value={form.item_name}
                      onChange={handleChange}
                      placeholder="Enter item name"
                      style={errors.item_name ? { borderColor: colors.danger } : {}}
                    />
                    {errors.item_name && (
                      <span style={{ color: colors.danger, fontSize: "0.75rem", marginTop: 4 }}>
                        {errors.item_name}
                      </span>
                    )}
                  </InputWrapper>

                  <InputWrapper>
                    <Label>Item Last Name</Label>
                    <Input
                      name="item_last_name"
                      value={form.item_last_name}
                      onChange={handleChange}
                      placeholder="Enter last name (optional)"
                    />
                  </InputWrapper>

                  <InputWrapper>
                    <Label required>Category</Label>
                    <Select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      style={errors.category ? { borderColor: colors.danger } : {}}
                    >
                      <option value="">-- Select Category --</option>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </Select>
                    {errors.category && (
                      <span style={{ color: colors.danger, fontSize: "0.75rem", marginTop: 4 }}>
                        {errors.category}
                      </span>
                    )}
                  </InputWrapper>

                  <InputWrapper>
                    <Label>HSN Code</Label>
                    <Input
                      name="hsn"
                      value={form.hsn}
                      onChange={handleChange}
                      placeholder="Enter HSN code"
                    />
                  </InputWrapper>
                </FormRow>

                <FormRow>
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

                {/* ── Special Flags ── */}
                <SectionDivider>Special Flags</SectionDivider>
                <CheckGroup>
                  <CheckItem>
                    <input type="checkbox" name="high_risk" checked={form.high_risk} onChange={handleChange} />
                    🔴 High Risk
                  </CheckItem>
                  <CheckItem>
                    <input type="checkbox" name="look_alike" checked={form.look_alike} onChange={handleChange} />
                    👁️ Look-Alike
                  </CheckItem>
                  <CheckItem>
                    <input type="checkbox" name="sound_alike" checked={form.sound_alike} onChange={handleChange} />
                    🔊 Sound-Alike
                  </CheckItem>
                </CheckGroup>

                {/* ── IP Pharmacy ── */}
                <SectionDivider>IP Pharmacy</SectionDivider>
                <CheckGroup style={{ marginBottom: 10 }}>
                  <CheckItem>
                    <input type="checkbox" name="IP_available" checked={form.IP_available} onChange={handleChange} />
                    IP Available
                  </CheckItem>
                </CheckGroup>
                {form.IP_available && (
                  <FormRow>
                    <InputWrapper>
                      <Label>IP Shelf No.</Label>
                      <Input
                        name="IP_shelf_no"
                        value={form.IP_shelf_no}
                        onChange={handleChange}
                        placeholder="e.g. A1"
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <Label>IP Rack No.</Label>
                      <Input
                        name="IP_rack_no"
                        value={form.IP_rack_no}
                        onChange={handleChange}
                        placeholder="e.g. R3"
                      />
                    </InputWrapper>
                  </FormRow>
                )}

                {/* ── OP Pharmacy ── */}
                <SectionDivider>OP Pharmacy</SectionDivider>
                <CheckGroup style={{ marginBottom: 10 }}>
                  <CheckItem>
                    <input type="checkbox" name="OP_available" checked={form.OP_available} onChange={handleChange} />
                    OP Available
                  </CheckItem>
                </CheckGroup>
                {form.OP_available && (
                  <FormRow>
                    <InputWrapper>
                      <Label>OP Shelf No.</Label>
                      <Input
                        name="OP_shelf_no"
                        value={form.OP_shelf_no}
                        onChange={handleChange}
                        placeholder="e.g. B2"
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <Label>OP Rack No.</Label>
                      <Input
                        name="OP_rack_no"
                        value={form.OP_rack_no}
                        onChange={handleChange}
                        placeholder="e.g. R5"
                      />
                    </InputWrapper>
                  </FormRow>
                )}

                {/* ── General ── */}
                <SectionDivider>General</SectionDivider>
                <CheckGroup style={{ marginBottom: 10 }}>
                  <CheckItem>
                    <input type="checkbox" name="G_available" checked={form.G_available} onChange={handleChange} />
                    G Available
                  </CheckItem>
                </CheckGroup>
                {form.G_available && (
                  <FormRow>
                    <InputWrapper>
                      <Label>G Shelf No.</Label>
                      <Input
                        name="G_shelf_no"
                        value={form.G_shelf_no}
                        onChange={handleChange}
                        placeholder="e.g. C3"
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <Label>G Rack No.</Label>
                      <Input
                        name="G_rack_no"
                        value={form.G_rack_no}
                        onChange={handleChange}
                        placeholder="e.g. R7"
                      />
                    </InputWrapper>
                  </FormRow>
                )}

                {/* ── Block & Active ── */}
                <SectionDivider>Status</SectionDivider>
                <FormRow>
                  <InputWrapper>
                    <Label>Blocked</Label>
                    <ToggleWrapper>
                      <ToggleTrack on={form.is_blocked} onClick={handleToggleBlocked}>
                        <ToggleThumb on={form.is_blocked} />
                      </ToggleTrack>
                      <ToggleLabel on={form.is_blocked}>
                        {form.is_blocked ? "Blocked" : "Not Blocked"}
                      </ToggleLabel>
                    </ToggleWrapper>
                  </InputWrapper>

                  {form.is_blocked && (
                    <InputWrapper>
                      <Label required>Blocked Reason</Label>
                      <Input
                        name="blocked_reason"
                        value={form.blocked_reason}
                        onChange={handleChange}
                        placeholder="Enter reason for blocking"
                        style={errors.blocked_reason ? { borderColor: colors.danger } : {}}
                      />
                      {errors.blocked_reason && (
                        <span style={{ color: colors.danger, fontSize: "0.75rem", marginTop: 4 }}>
                          {errors.blocked_reason}
                        </span>
                      )}
                    </InputWrapper>
                  )}

                  <InputWrapper>
                    <Label>Active</Label>
                    <CheckGroup>
                      <CheckItem>
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={form.is_active}
                          onChange={handleChange}
                        />
                        Is Active
                      </CheckItem>
                    </CheckGroup>
                  </InputWrapper>
                </FormRow>

                <ButtonContainer>
                  <Button secondary onClick={handleCancel}>✕ Cancel</Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : editId ? "✔ Update Item" : "✔ Add Item"}
                  </Button>
                </ButtonContainer>
              </div>
            </FormCard>
          )}

          {/* ── Table ── */}
          <SectionTitle>
            <h3>Pharmacy Items List</h3>
          </SectionTitle>

          <ControlsContainer>
            <SearchContainer>
              <InputWrapper>
                <Label>Search</Label>
                <SearchInput
                  placeholder="Search by name, category, HSN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputWrapper>
            </SearchContainer>
            <div style={{ color: colors.textMuted, fontSize: "0.85rem", alignSelf: "flex-end" }}>
              {filtered.length} item(s) found
            </div>
          </ControlsContainer>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Item Name</Th>
                  <Th>Last Name</Th>
                  <Th>Category</Th>
                  <Th>HSN</Th>
                  <Th>Reorder Lvl</Th>
                  <Th>High Risk</Th>
                  <Th>Look-Alike</Th>
                  <Th>Sound-Alike</Th>
                  <Th>IP</Th>
                  <Th>IP Shelf/Rack</Th>
                  <Th>OP</Th>
                  <Th>OP Shelf/Rack</Th>
                  <Th>G</Th>
                  <Th>G Shelf/Rack</Th>
                  <Th>Blocked</Th>
                  <Th>Active</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={18}>
                      <EmptyState>No pharmacy items found. Click "+ Add New Item" to get started.</EmptyState>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <Tr key={item.item_id}>
                      <Td>{idx + 1}</Td>
                      <Td style={{ fontWeight: 600 }}>{item.item_name}</Td>
                      <Td>{item.item_last_name || "—"}</Td>
                      <Td>{item.category}</Td>
                      <Td>{item.hsn || "—"}</Td>
                      <Td style={{ textAlign: "center" }}>{item.reorder_level}</Td>
                      <Td><Badge type={item.high_risk ? "yes" : "no"}>{item.high_risk ? "Yes" : "No"}</Badge></Td>
                      <Td><Badge type={item.look_alike ? "yes" : "no"}>{item.look_alike ? "Yes" : "No"}</Badge></Td>
                      <Td><Badge type={item.sound_alike ? "yes" : "no"}>{item.sound_alike ? "Yes" : "No"}</Badge></Td>
                      <Td><Badge type={item.IP_available ? "yes" : "no"}>{item.IP_available ? "Yes" : "No"}</Badge></Td>
                      <Td style={{ fontSize: "0.82rem" }}>
                        {item.IP_available ? `${item.IP_shelf_no || "—"} / ${item.IP_rack_no || "—"}` : "—"}
                      </Td>
                      <Td><Badge type={item.OP_available ? "yes" : "no"}>{item.OP_available ? "Yes" : "No"}</Badge></Td>
                      <Td style={{ fontSize: "0.82rem" }}>
                        {item.OP_available ? `${item.OP_shelf_no || "—"} / ${item.OP_rack_no || "—"}` : "—"}
                      </Td>
                      <Td><Badge type={item.G_available ? "yes" : "no"}>{item.G_available ? "Yes" : "No"}</Badge></Td>
                      <Td style={{ fontSize: "0.82rem" }}>
                        {item.G_available ? `${item.G_shelf_no || "—"} / ${item.G_rack_no || "—"}` : "—"}
                      </Td>
                      <Td>
                        <Badge type={item.is_blocked ? "blocked" : "no"}>
                          {item.is_blocked ? `🔒 ${item.blocked_reason || "Blocked"}` : "No"}
                        </Badge>
                      </Td>
                      <Td><Badge type={item.is_active ? "yes" : "no"}>{item.is_active ? "Active" : "Inactive"}</Badge></Td>
                      <Td>
                        <div style={{ display: "flex", gap: 6 }}>
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