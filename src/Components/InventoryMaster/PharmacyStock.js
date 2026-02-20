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
  CheckboxWrapper,
  Checkbox,
  colors,
} from "../GlobalStyles";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest"

// ─── Extra Styled Helpers ────────────────────────────────────────────────────
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

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(p) => (p.type === "yes" ? "#dcfce7" : "#f1f5f9")};
  color: ${(p) => (p.type === "yes" ? colors.success : colors.textMuted)};
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
  padding: 10px 0;
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

const SearchInput = styled(Input)`
  min-width: 240px;
`;

// ─── Constants ───────────────────────────────────────────────────────────────
const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const GROUPS = ["IP Pharmacy", "OP Pharmacy"];
const CATEGORIES = [
  "Tablet", "Syrup", "Capsule", "Injection", "Ointment",
  "Drops", "Inhaler", "Powder", "Gel", "Suspension",
];
const CLASSIFICATIONS = [
  "General Ward", "ICU", "OPD", "Emergency",
  "Surgery", "Pediatrics", "Gynecology", "Oncology",
];
const DOSAGES = [
  "5mg", "10mg", "25mg", "50mg", "100mg", "200mg",
  "250mg", "500mg", "1g", "5ml", "10ml", "15ml", "30ml",
];

const EMPTY_FORM = {
  item_first_name: "",
  item_last_name: "",
  group: "",
  category: "",
  classification: "",
  hsn: "",
  dosage: "",
  shelf_no: "",
  rack_no: "",
  high_risk: false,
  look_alike: false,
  sound_alike: false,
  reorder_level: "",
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

  // ── API helpers ────────────────────────────────────────────────────────────
  const fetchItems = async () => {
    try {
      const response = await apiRequest(`${baseUrl}pharmacy-items/`, "GET");
      if (response.success) {
        setItems(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching pharmacy items:", error);
      showToast("Failed to fetch items", "error");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Form Handlers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.item_first_name.trim()) errs.item_first_name = "First name is required";
    if (!form.group) errs.group = "Group is required";
    if (!form.category) errs.category = "Category is required";
    if (!form.classification) errs.classification = "Classification is required";
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
      const response = await apiRequest(url, method, {
        ...form,
        reorder_level: Number(form.reorder_level) || 0,
      });
      if (response.success) {
        showToast(editId ? "Item updated successfully" : "Item added successfully");
        setForm(EMPTY_FORM);
        setEditId(null);
        setShowForm(false);
        fetchItems();
      } else {
        showToast(JSON.stringify(response.data || response.error), "error");
      }
    } catch (error) {
      console.error("Error saving pharmacy item:", error);
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      item_first_name: item.item_first_name,
      item_last_name: item.item_last_name || "",
      group: item.group,
      category: item.category,
      classification: item.classification,
      hsn: item.hsn || "",
      dosage: item.dosage || "",
      shelf_no: item.shelf_no || "",
      rack_no: item.rack_no || "",
      high_risk: item.high_risk,
      look_alike: item.look_alike,
      sound_alike: item.sound_alike,
      reorder_level: item.reorder_level,
    });
    setEditId(item.item_id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const response = await apiRequest(`${baseUrl}pharmacy-items/${id}/`, "DELETE");
      if (response.success) {
        showToast("Item deleted successfully");
        fetchItems();
      } else {
        showToast("Delete failed", "error");
      }
    } catch (error) {
      console.error("Error deleting pharmacy item:", error);
      showToast("Delete failed", "error");
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
    setErrors({});
  };

  // ── Filtered Items ─────────────────────────────────────────────────────────
  const filtered = items.filter((it) => {
    const q = search.toLowerCase();
    return (
      it.item_first_name?.toLowerCase().includes(q) ||
      it.item_last_name?.toLowerCase().includes(q) ||
      it.group?.toLowerCase().includes(q) ||
      it.category?.toLowerCase().includes(q)
    );
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 8,
            background: toast.type === "error" ? colors.danger : colors.success,
            color: "white",
            fontWeight: 600,
            fontSize: "0.9rem",
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
            <Button onClick={() => setShowForm(true)} style={{ background: "white", color: colors.primary }}>
              + Add New Item
            </Button>
          )}
        </PageHeader>

        <FormContent>
          {/* ── Add / Edit Form ── */}
          {showForm && (
            <FormCard>
              <FormCardHeader>
                {editId ? "✏️ Edit Pharmacy Item" : "➕ Add New Pharmacy Item"}
              </FormCardHeader>
              <div style={{ padding: "20px" }}>
                {/* Row 1 */}
                <FormRow>
                  <InputWrapper>
                    <Label required>Item First Name</Label>
                    <Input
                      name="item_first_name"
                      value={form.item_first_name}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      style={errors.item_first_name ? { borderColor: colors.danger } : {}}
                    />
                    {errors.item_first_name && (
                      <span style={{ color: colors.danger, fontSize: "0.75rem", marginTop: 4 }}>
                        {errors.item_first_name}
                      </span>
                    )}
                  </InputWrapper>

                  <InputWrapper>
                    <Label>Item Last Name</Label>
                    <Input
                      name="item_last_name"
                      value={form.item_last_name}
                      onChange={handleChange}
                      placeholder="Enter last name"
                    />
                  </InputWrapper>

                  <InputWrapper>
                    <Label required>Group</Label>
                    <Select
                      name="group"
                      value={form.group}
                      onChange={handleChange}
                      style={errors.group ? { borderColor: colors.danger } : {}}
                    >
                      <option value="">-- Select Group --</option>
                      {GROUPS.map((g) => <option key={g}>{g}</option>)}
                    </Select>
                    {errors.group && (
                      <span style={{ color: colors.danger, fontSize: "0.75rem", marginTop: 4 }}>
                        {errors.group}
                      </span>
                    )}
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
                </FormRow>

                {/* Row 2 */}
                <FormRow>
                  <InputWrapper>
                    <Label required>Classification</Label>
                    <Select
                      name="classification"
                      value={form.classification}
                      onChange={handleChange}
                      style={errors.classification ? { borderColor: colors.danger } : {}}
                    >
                      <option value="">-- Select Classification --</option>
                      {CLASSIFICATIONS.map((c) => <option key={c}>{c}</option>)}
                    </Select>
                    {errors.classification && (
                      <span style={{ color: colors.danger, fontSize: "0.75rem", marginTop: 4 }}>
                        {errors.classification}
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

                  <InputWrapper>
                    <Label>Dosage</Label>
                    <Select name="dosage" value={form.dosage} onChange={handleChange}>
                      <option value="">-- Select Dosage --</option>
                      {DOSAGES.map((d) => <option key={d}>{d}</option>)}
                    </Select>
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

                {/* Row 3 */}
                <FormRow>
                  <InputWrapper>
                    <Label>Shelf No.</Label>
                    <Input
                      name="shelf_no"
                      value={form.shelf_no}
                      onChange={handleChange}
                      placeholder="e.g. A1"
                    />
                  </InputWrapper>

                  <InputWrapper>
                    <Label>Rack No.</Label>
                    <Input
                      name="rack_no"
                      value={form.rack_no}
                      onChange={handleChange}
                      placeholder="e.g. R3"
                    />
                  </InputWrapper>

                  {/* Checkboxes in one cell spanning 2 cols */}
                  <InputWrapper style={{ gridColumn: "span 2" }}>
                    <Label>Special Flags</Label>
                    <CheckGroup>
                      <CheckItem>
                        <input
                          type="checkbox"
                          name="high_risk"
                          checked={form.high_risk}
                          onChange={handleChange}
                        />
                        🔴 High Risk
                      </CheckItem>
                      <CheckItem>
                        <input
                          type="checkbox"
                          name="look_alike"
                          checked={form.look_alike}
                          onChange={handleChange}
                        />
                        👁️ Look-Alike
                      </CheckItem>
                      <CheckItem>
                        <input
                          type="checkbox"
                          name="sound_alike"
                          checked={form.sound_alike}
                          onChange={handleChange}
                        />
                        🔊 Sound-Alike
                      </CheckItem>
                    </CheckGroup>
                  </InputWrapper>
                </FormRow>

                <ButtonContainer>
                  <Button secondary onClick={handleCancel}>
                    ✕ Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : editId ? "✔ Update Item" : "✔ Add Item"}
                  </Button>
                </ButtonContainer>
              </div>
            </FormCard>
          )}

          {/* ── Table Section ── */}
          <SectionTitle>
            <h3>Pharmacy Items List</h3>
          </SectionTitle>

          <ControlsContainer>
            <SearchContainer>
              <InputWrapper>
                <Label>Search</Label>
                <SearchInput
                  placeholder="Search by name, group, category..."
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
                  <Th>First Name</Th>
                  <Th>Last Name</Th>
                  <Th>Group</Th>
                  <Th>Category</Th>
                  <Th>Classification</Th>
                  <Th>HSN</Th>
                  <Th>Dosage</Th>
                  <Th>Shelf</Th>
                  <Th>Rack</Th>
                  <Th>Reorder Lvl</Th>
                  <Th>High Risk</Th>
                  <Th>Look-Alike</Th>
                  <Th>Sound-Alike</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={15}>
                      <EmptyState>No pharmacy items found. Click "Add New Item" to get started.</EmptyState>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <Tr key={item.item_id}>
                      <Td>{idx + 1}</Td>
                      <Td style={{ fontWeight: 600 }}>{item.item_first_name}</Td>
                      <Td>{item.item_last_name || "—"}</Td>
                      <Td>
                        <Badge type="yes">{item.group}</Badge>
                      </Td>
                      <Td>{item.category}</Td>
                      <Td>{item.classification}</Td>
                      <Td>{item.hsn || "—"}</Td>
                      <Td>{item.dosage || "—"}</Td>
                      <Td>{item.shelf_no || "—"}</Td>
                      <Td>{item.rack_no || "—"}</Td>
                      <Td style={{ textAlign: "center" }}>{item.reorder_level}</Td>
                      <Td>
                        <Badge type={item.high_risk ? "yes" : "no"}>
                          {item.high_risk ? "Yes" : "No"}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge type={item.look_alike ? "yes" : "no"}>
                          {item.look_alike ? "Yes" : "No"}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge type={item.sound_alike ? "yes" : "no"}>
                          {item.sound_alike ? "Yes" : "No"}
                        </Badge>
                      </Td>
                      <Td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <ActionBtn onClick={() => handleEdit(item)}>Edit</ActionBtn>
                          <ActionBtn danger onClick={() => handleDelete(item.item_id)}>
                            Delete
                          </ActionBtn>
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