import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container, PageWrapper, FormContent, InputWrapper, Label, Input,
  Button, ButtonContainer, TableWrapper, Table, Th, Td, Tr, SectionHeader,
} from "../GlobalStyles";

// ─── Searchable Dropdown ──────────────────────────────────────────────────────
const SearchableDropdown = ({ value, onChange, placeholder = "Search..." }) => {
  const [query, setQuery]             = useState("");
  const [options, setOptions]         = useState([]);
  const [open, setOpen]               = useState(false);
  const [loading, setLoading]         = useState(false);
  const [displayLabel, setDisplayLabel] = useState("");
  const wrapperRef  = useRef(null);
  const debounceRef = useRef(null);
  const HmsBaseUrl  = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!value) { setDisplayLabel(""); setQuery(""); return; }
    const cached = options.find((o) => o.id === value);
    if (cached) { setDisplayLabel(cached.description); return; }
    apiRequest(`${HmsBaseUrl}roomservice-description/`, "GET").then((res) => {
      const all = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      const found = all.find((o) => o.id === value);
      if (found) setDisplayLabel(found.description);
    });
  }, [value]);

  const fetchOptions = async (search = "") => {
    setLoading(true);
    try {
      const url = search ? `${HmsBaseUrl}roomservice-description/?search=${encodeURIComponent(search)}` : `${HmsBaseUrl}roomservice-description/`;
      const res = await apiRequest(url, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setOptions(list.filter((o) => o.is_active !== false));
    } catch { setOptions([]); } finally { setLoading(false); }
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", overflow: "hidden" }}>
        <input
          type="text"
          value={open ? query : displayLabel}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => fetchOptions(e.target.value), 300); }}
          onFocus={() => { setOpen(true); if (options.length === 0) fetchOptions(""); }}
          placeholder={placeholder}
          style={{ flex: 1, padding: "8px 12px", border: "none", outline: "none", fontSize: "0.9rem" }}
        />
        <span onClick={() => { setOpen((p) => !p); if (!open) fetchOptions(query); }} style={{ padding: "0 10px", cursor: "pointer", color: "#6b7280", fontSize: "0.75rem", userSelect: "none" }}>▼</span>
        {(displayLabel || value) && (
          <span onClick={(e) => { e.stopPropagation(); setDisplayLabel(""); setQuery(""); setOpen(false); onChange(""); }} style={{ padding: "0 8px", cursor: "pointer", color: "#9ca3af", fontSize: "0.85rem", userSelect: "none" }}>✕</span>
        )}
      </div>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #d1d5db", borderTop: "none", borderRadius: "0 0 6px 6px", maxHeight: 200, overflowY: "auto", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          {loading ? <div style={{ padding: "10px 12px", color: "#9ca3af", fontSize: "0.85rem" }}>Loading...</div>
            : options.length === 0 ? <div style={{ padding: "10px 12px", color: "#9ca3af", fontSize: "0.85rem" }}>No results found</div>
            : options.map((opt) => (
              <div key={opt.id} onMouseDown={() => { setDisplayLabel(opt.description); setQuery(""); setOpen(false); onChange(opt.id); }}
                style={{ padding: "9px 12px", cursor: "pointer", fontSize: "0.9rem", background: opt.id === value ? "#f0fdf4" : "#fff", color: opt.id === value ? "#0d9488" : "#111827", borderBottom: "1px solid #f3f4f6" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                onMouseLeave={(e) => (e.currentTarget.style.background = opt.id === value ? "#f0fdf4" : "#fff")}>
                {opt.description}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

// ─── Checkbox helper ──────────────────────────────────────────────────────────
const CheckboxField = ({ label, name, checked, onChange }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.9rem", color: "#374151", userSelect: "none" }}>
    <input type="checkbox" name={name} checked={checked} onChange={onChange} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#0d9488" }} />
    {label}
  </label>
);

// ─── Service Component ────────────────────────────────────────────────────────
const Service = () => {
  const [services, setServices] = useState([]);

  const defaultForm = {
    description: "", priority: "", amount: "",
    chargeable_for_bystander: false, chargeable_for_booking: false,
    enable_this_service: true, doctors_fee: false,
  };
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}service/`, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setServices(list);
    } catch { toast.error("Failed to fetch services"); }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEdit = (svc) => {
    setEditingId(svc.id);
    setFormData({
      description:               svc.description,
      priority:                  svc.priority || "",
      amount:                    svc.amount,
      chargeable_for_bystander:  svc.chargeable_for_bystander ?? false,
      chargeable_for_booking:    svc.chargeable_for_booking   ?? false,
      enable_this_service:       svc.enable_this_service      ?? true,
      doctors_fee:               svc.doctors_fee              ?? false,
    });
    window.scrollTo(0, 0);
  };

  // Soft delete: backend sets is_active = false
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service? (It will be set inactive)")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}service/${id}/`, "DELETE");
      if (res && !res.error) { toast.success("Service deleted"); fetchServices(); }
      else toast.error(res?.error || "Delete failed");
    } catch { toast.error("Failed to delete service"); }
  };

  const handleReset = () => { setEditingId(null); setFormData(defaultForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description) return toast.warning("Please select a description");
    if (!formData.amount)      return toast.warning("Please enter an amount");

    try {
      if (editingId) {
        const res = await apiRequest(`${HmsBaseUrl}service/${editingId}/`, "PUT", formData);
        if (res && !res.error) { toast.success("Service updated"); handleReset(); fetchServices(); }
        else toast.error(res?.error || "Update failed");
      } else {
        const res = await apiRequest(`${HmsBaseUrl}service/`, "POST", formData);
        if (res && !res.error) { toast.success("Service added"); handleReset(); fetchServices(); }
        else toast.error(res?.error || "Create failed");
      }
    } catch { toast.error("Failed to save service"); }
  };

  const getDescLabel = (svc) => svc.description_detail?.description || svc.description || "—";

  return (
    <PageWrapper>
      <Container>
        <SectionHeader><h3>Service Management</h3></SectionHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 16 }}>

              {/* Left: description + priority + amount */}
              <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 14 }}>
                <InputWrapper>
                  <Label required>Description</Label>
                  <SearchableDropdown value={formData.description} onChange={(val) => setFormData((p) => ({ ...p, description: val }))} placeholder="Search description..." />
                </InputWrapper>
                <div style={{ display: "flex", gap: 16 }}>
                  <InputWrapper style={{ flex: 1 }}>
                    <Label>Priority</Label>
                    <Input type="number" name="priority" value={formData.priority} onChange={handleInputChange} placeholder="e.g. 1" min="1" />
                  </InputWrapper>
                  <InputWrapper style={{ flex: 1 }}>
                    <Label required>Amount</Label>
                    <Input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="0.00" step="0.01" required />
                  </InputWrapper>
                </div>
              </div>

              {/* Right: checkboxes */}
              <div style={{ flex: "0 1 260px", display: "flex", flexDirection: "column", gap: 14, paddingTop: 24 }}>
                <CheckboxField label="Chargeable For Bystander" name="chargeable_for_bystander" checked={formData.chargeable_for_bystander} onChange={handleInputChange} />
                <CheckboxField label="Chargeable For Booking"   name="chargeable_for_booking"   checked={formData.chargeable_for_booking}   onChange={handleInputChange} />
                <CheckboxField label="Enable This Service"      name="enable_this_service"       checked={formData.enable_this_service}       onChange={handleInputChange} />
                <CheckboxField label="Doctor's Fee"             name="doctors_fee"               checked={formData.doctors_fee}               onChange={handleInputChange} />
              </div>
            </div>

            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>✕ Cancel</Button>
              <Button type="submit">{editingId ? "+ Update" : "+ Add Service"}</Button>
            </ButtonContainer>
          </form>
        </FormContent>

        <div style={{ padding: "0 24px 24px" }}>
          <h4 style={{ color: "#0d9488", marginBottom: 16 }}>Service List</h4>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Description</Th><Th>Priority</Th><Th>Amount</Th>
                  <Th>Bystander</Th><Th>Booking</Th><Th>Enabled</Th><Th>Doctor Fee</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <Tr><Td colSpan="8" style={{ textAlign: "center" }}>No services found</Td></Tr>
                ) : services.map((svc) => (
                  <Tr key={svc.id}>
                    <Td>{getDescLabel(svc)}</Td>
                    <Td>{svc.priority || "—"}</Td>
                    <Td>{svc.amount}</Td>
                    {["chargeable_for_bystander", "chargeable_for_booking", "enable_this_service", "doctors_fee"].map((flag) => (
                      <Td key={flag} style={{ textAlign: "center" }}>
                        <span style={{ color: svc[flag] ? "#16a34a" : "#9ca3af", fontWeight: 600, fontSize: "1rem" }}>{svc[flag] ? "✓" : "✗"}</span>
                      </Td>
                    ))}
                    <Td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button style={{ padding: "5px 12px", fontSize: "0.8rem" }} onClick={() => handleEdit(svc)}>Edit</Button>
                        <Button danger style={{ padding: "5px 12px", fontSize: "0.8rem" }} onClick={() => handleDelete(svc.id)}>Delete</Button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </div>
      </Container>
    </PageWrapper>
  );
};

export default Service;