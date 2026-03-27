import React, { useState, useEffect, useCallback } from "react";
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
import apiRequest from "../../Auth/apiRequest"

// ─── Styled Helpers ───────────────────────────────────────────────────────────
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
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ErrorText = styled.span`
  color: ${colors.danger};
  font-size: 0.75rem;
  margin-top: 4px;
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

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(p) => (p.supplier ? "#dbeafe" : "#fef3c7")};
  color: ${(p) => (p.supplier ? "#1d4ed8" : "#92400e")};
`;

const Toast = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  padding: 12px 20px;
  border-radius: 8px;
  background: ${(p) => (p.error ? colors.danger : colors.success)};
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

const LoadingDot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${colors.textMuted};
  margin: 0 2px;
  animation: pulse 1s infinite;
  @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
`;

const SearchInput = styled(Input)`
  min-width: 260px;
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const SUPPLIER_TYPES = ["SUPPLIER", "MANUFACTURER"];
const PAYMENT_TERMS = ["CHEQUE", "CASH", "DD"];
const COUNTRY = "India"; // default country for state/city

const EMPTY_FORM = {
  supplier_type: "",
  name: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  contact_person: "",
  phone: "",
  email: "",
  gstin: "",
  payment_terms: "",
};

// ─── Main Component ───────────────────────────────────────────────────────────
const VendorMaster = () => {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // State / City
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // ── Load India states on mount ─────────────────────────────────────────────
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: COUNTRY }),
        });
        const data = await res.json();
        if (!data.error && data.data?.states) {
          setStates(data.data.states.map((s) => s.name).sort());
        }
      } catch {
        console.error("Failed to load states");
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, []);

  // ── Load cities when state changes ────────────────────────────────────────
  useEffect(() => {
    if (!form.state) {
      setCities([]);
      return;
    }
    const fetchCities = async () => {
      setLoadingCities(true);
      setCities([]);
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/state/cities",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: COUNTRY, state: form.state }),
          }
        );
        const data = await res.json();
        if (!data.error && Array.isArray(data.data)) {
          setCities(data.data.sort());
        }
      } catch {
        console.error("Failed to load cities");
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [form.state]);

  // ── API helpers ────────────────────────────────────────────────────────────
  const fetchVendors = useCallback(async () => {
    try {
      const response = await apiRequest(`${baseUrl}vendors/`, "GET");
      if (response.success) {
        setVendors(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      showToast("Failed to fetch vendors", "error");
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Form Handlers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset city when state changes
      if (name === "state") updated.city = "";
      return updated;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.supplier_type) errs.supplier_type = "Type is required";
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.address_line1.trim()) errs.address_line1 = "Address Line 1 is required";
    if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin)) {
      errs.gstin = "Invalid GSTIN format";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Invalid email address";
    }
    if (form.phone && !/^\+?[0-9]{7,15}$/.test(form.phone)) {
      errs.phone = "Invalid phone number";
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const url = editId ? `${baseUrl}vendors/${editId}/` : `${baseUrl}vendors/`;
      const method = editId ? "PUT" : "POST";
      const response = await apiRequest(url, method, form);
      if (response.success) {
        showToast(editId ? "Vendor updated successfully" : "Vendor added successfully");
        setForm(EMPTY_FORM);
        setEditId(null);
        setShowForm(false);
        fetchVendors();
      } else {
        showToast(JSON.stringify(response.data || response.error), "error");
      }
    } catch (error) {
      console.error("Error saving vendor:", error);
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vendor) => {
    setForm({
      supplier_type: vendor.supplier_type || "",
      name: vendor.name || "",
      address_line1: vendor.address_line1 || "",
      address_line2: vendor.address_line2 || "",
      city: vendor.city || "",
      state: vendor.state || "",
      pincode: vendor.pincode || "",
      contact_person: vendor.contact_person || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      gstin: vendor.gstin || "",
      payment_terms: vendor.payment_terms || "",
    });
    setEditId(vendor.vendor_id);
    setShowForm(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      const response = await apiRequest(`${baseUrl}vendors/${id}/`, "DELETE");
      if (response.success) {
        showToast("Vendor deleted successfully");
        fetchVendors();
      } else {
        showToast("Delete failed", "error");
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
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
  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.name?.toLowerCase().includes(q) ||
      v.supplier_type?.toLowerCase().includes(q) ||
      v.gstin?.toLowerCase().includes(q) ||
      v.contact_person?.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q)
    );
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      {toast && <Toast error={toast.type === "error"}>{toast.msg}</Toast>}

      <Container>
        {/* Header */}
        <PageHeader>
          <div>
            <PageTitle>🏢 Vendor Master</PageTitle>
            <PageSubtitle>Manage suppliers and manufacturers</PageSubtitle>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              style={{ background: "white", color: colors.primary }}
            >
              + Add Vendor
            </Button>
          )}
        </PageHeader>

        <FormContent>
          {/* ── Form ── */}
          {showForm && (
            <FormCard>
              <FormCardHeader>
                🏢 {editId ? "Edit Vendor Details" : "Add New Vendor"}
              </FormCardHeader>
              <div style={{ padding: "20px" }}>
                {/* Row 1 */}
                <FormRow>
                  <InputWrapper>
                    <Label required>Supplier / Manufacturer</Label>
                    <Select
                      name="supplier_type"
                      value={form.supplier_type}
                      onChange={handleChange}
                      style={errors.supplier_type ? { borderColor: colors.danger } : {}}
                    >
                      <option value="">-- Select Type --</option>
                      {SUPPLIER_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                    {errors.supplier_type && <ErrorText>{errors.supplier_type}</ErrorText>}
                  </InputWrapper>

                  <InputWrapper>
                    <Label required>Name</Label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter vendor name"
                      style={errors.name ? { borderColor: colors.danger } : {}}
                    />
                    {errors.name && <ErrorText>{errors.name}</ErrorText>}
                  </InputWrapper>

                  <InputWrapper>
                    <Label required>Address Line 1</Label>
                    <Input
                      name="address_line1"
                      value={form.address_line1}
                      onChange={handleChange}
                      placeholder="Street / Door No."
                      style={errors.address_line1 ? { borderColor: colors.danger } : {}}
                    />
                    {errors.address_line1 && <ErrorText>{errors.address_line1}</ErrorText>}
                  </InputWrapper>

                  <InputWrapper>
                    <Label>Address Line 2</Label>
                    <Input
                      name="address_line2"
                      value={form.address_line2}
                      onChange={handleChange}
                      placeholder="Area / Landmark"
                    />
                  </InputWrapper>
                </FormRow>

                {/* Row 2 */}
                <FormRow>
                  <InputWrapper>
                    <Label>State</Label>
                    <Select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      disabled={loadingStates}
                    >
                      <option value="">
                        {loadingStates ? "Loading states..." : "-- Select State --"}
                      </option>
                      {states.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  </InputWrapper>

                  <InputWrapper>
                    <Label>City</Label>
                    <Select
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      disabled={!form.state || loadingCities}
                    >
                      <option value="">
                        {loadingCities
                          ? "Loading cities..."
                          : !form.state
                          ? "Select state first"
                          : "-- Select City --"}
                      </option>
                      {cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                    {(loadingCities) && (
                      <div style={{ position: "absolute", right: 36, top: 36 }}>
                        <LoadingDot style={{ animationDelay: "0s" }} />
                        <LoadingDot style={{ animationDelay: "0.2s" }} />
                        <LoadingDot style={{ animationDelay: "0.4s" }} />
                      </div>
                    )}
                  </InputWrapper>

                  <InputWrapper>
                    <Label>Pincode</Label>
                    <Input
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 636007"
                      maxLength={10}
                    />
                  </InputWrapper>

                  <InputWrapper>
                    <Label>Contact Person</Label>
                    <Input
                      name="contact_person"
                      value={form.contact_person}
                      onChange={handleChange}
                      placeholder="Contact person name"
                    />
                  </InputWrapper>
                </FormRow>

                {/* Row 3 */}
                <FormRow>
                  <InputWrapper>
                    <Label>Phone</Label>
                    <Input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="e.g. 06380630184"
                      style={errors.phone ? { borderColor: colors.danger } : {}}
                    />
                    {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
                  </InputWrapper>

                  <InputWrapper>
                    <Label>Email</Label>
                    <Input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="vendor@example.com"
                      style={errors.email ? { borderColor: colors.danger } : {}}
                    />
                    {errors.email && <ErrorText>{errors.email}</ErrorText>}
                  </InputWrapper>

                  <InputWrapper>
                    <Label>GSTIN</Label>
                    <Input
                      name="gstin"
                      value={form.gstin}
                      onChange={(e) =>
                        handleChange({
                          target: { name: "gstin", value: e.target.value.toUpperCase() },
                        })
                      }
                      placeholder="e.g. 33AAHCA7054L1ZJ"
                      maxLength={15}
                      style={errors.gstin ? { borderColor: colors.danger } : {}}
                    />
                    {errors.gstin && <ErrorText>{errors.gstin}</ErrorText>}
                  </InputWrapper>

                  <InputWrapper>
                    <Label>Payment Terms</Label>
                    <Select
                      name="payment_terms"
                      value={form.payment_terms}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Terms --</option>
                      {PAYMENT_TERMS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                  </InputWrapper>
                </FormRow>

                <ButtonContainer>
                  <Button secondary onClick={handleCancel}>
                    ✕ Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : editId ? "✔ Update Vendor" : "✔ Save Vendor"}
                  </Button>
                </ButtonContainer>
              </div>
            </FormCard>
          )}

          {/* ── Table ── */}
          <SectionTitle>
            <h3>Vendor List</h3>
          </SectionTitle>

          <ControlsContainer>
            <SearchContainer>
              <InputWrapper>
                <Label>Search</Label>
                <SearchInput
                  placeholder="Search by name, type, GSTIN, city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputWrapper>
            </SearchContainer>
            <div style={{ color: colors.textMuted, fontSize: "0.85rem", alignSelf: "flex-end" }}>
              {filtered.length} vendor(s) found
            </div>
          </ControlsContainer>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Name</Th>
                  <Th>Type</Th>
                  <Th>Address</Th>
                  <Th>City / State</Th>
                  <Th>GSTIN</Th>
                  <Th>Contact Person</Th>
                  <Th>Phone</Th>
                  <Th>Payment Terms</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <EmptyState>
                        No vendors found. Click "Add Vendor" to get started.
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  filtered.map((vendor, idx) => (
                    <Tr key={vendor.vendor_id}>
                      <Td>{idx + 1}</Td>
                      <Td style={{ fontWeight: 600, minWidth: 160 }}>{vendor.name}</Td>
                      <Td>
                        <Badge supplier={vendor.supplier_type === "SUPPLIER"}>
                          {vendor.supplier_type}
                        </Badge>
                      </Td>
                      <Td style={{ maxWidth: 180, fontSize: "0.82rem" }}>
                        {[vendor.address_line1, vendor.address_line2]
                          .filter(Boolean)
                          .join(", ")}
                      </Td>
                      <Td>
                        {[vendor.city, vendor.state].filter(Boolean).join(", ") || "—"}
                      </Td>
                      <Td style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                        {vendor.gstin || "—"}
                      </Td>
                      <Td>{vendor.contact_person || "—"}</Td>
                      <Td>{vendor.phone || "—"}</Td>
                      <Td>{vendor.payment_terms || "—"}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <ActionBtn onClick={() => handleEdit(vendor)}>Edit</ActionBtn>
                          <ActionBtn danger onClick={() => handleDelete(vendor.vendor_id)}>
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

export default VendorMaster;