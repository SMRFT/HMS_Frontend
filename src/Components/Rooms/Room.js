import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container,
  PageWrapper,
  FormContent,
  InputWrapper,
  Label,
  Input,
  Button,
  ButtonContainer,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  SectionHeader,
  Select,
} from "../GlobalStyles";
import styled from "styled-components";

// ─── Styled ───────────────────────────────────────────────────────────────────
const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #dee2e6;
  margin-bottom: 0;
`;
const TabButton = styled.button`
  padding: 8px 20px;
  background: ${(p) => (p.active ? "#fff" : "#f8f9fa")};
  border: 1px solid ${(p) => (p.active ? "#dee2e6" : "#dee2e6")};
  border-bottom: ${(p) => (p.active ? "2px solid #fff" : "none")};
  margin-bottom: ${(p) => (p.active ? "-2px" : "0")};
  cursor: pointer;
  font-weight: ${(p) => (p.active ? "600" : "400")};
  color: ${(p) => (p.active ? "#0d9488" : "#555")};
  font-size: 0.88rem;
  outline: none;
  &:hover { background: #fff; }
`;
const TabPanel = styled.div`
  border: 1px solid #dee2e6;
  border-top: none;
  padding: 16px;
  background: #fff;
  border-radius: 0 0 6px 6px;
`;
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
`;
const InlineAddBtn = styled.button`
  margin-left: 6px;
  background: #0d9488;
  color: #fff;
  border: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  &:hover { background: #0b7a70; }
`;
const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #374151;
  cursor: pointer;
  user-select: none;
  input { width: 14px; height: 14px; accent-color: #0d9488; cursor: pointer; }
`;
const ToggleSwitch = styled.button`
  width: 48px;
  height: 26px;
  border-radius: 13px;
  border: none;
  cursor: pointer;
  background: ${(p) => (p.on ? "#ef4444" : "#d1d5db")};
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
  &::after {
    content: "";
    position: absolute;
    top: 3px;
    left: ${(p) => (p.on ? "25px" : "3px")};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.25);
  }
`;
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: ${(p) => p.cols || "1fr 1fr"};
  gap: 12px;
`;
const SplitLayout = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
`;
const LeftPane = styled.div`
  flex: 0 0 360px;
  min-width: 300px;
  border-right: 1px solid #e5e7eb;
  padding-right: 24px;
`;
const RightPane = styled.div`
  flex: 1;
  min-width: 380px;
`;
const SubFormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  align-items: end;
  margin-bottom: 10px;
`;

// ─── Searchable Dropdown (for Services & Kits) ────────────────────────────────
const SearchableDropdown = ({ apiEndpoint, value, onChange, placeholder = "Search...", labelField = "description" }) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayLabel, setDisplayLabel] = useState("");
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!value) { setDisplayLabel(""); setQuery(""); return; }
    const cached = options.find((o) => o.id === value);
    if (cached) { setDisplayLabel(cached[labelField]); return; }
    apiRequest(`${HmsBaseUrl}${apiEndpoint}`, "GET").then((res) => {
      const all = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      const found = all.find((o) => o.id === value);
      if (found) setDisplayLabel(found[labelField]);
    });
  }, [value]);

  const fetchOptions = async (search = "") => {
    setLoading(true);
    try {
      const url = search ? `${HmsBaseUrl}${apiEndpoint}?search=${encodeURIComponent(search)}` : `${HmsBaseUrl}${apiEndpoint}`;
      const res = await apiRequest(url, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setOptions(list.filter((o) => o.is_active !== false));
    } catch { setOptions([]); } finally { setLoading(false); }
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "6px", background: "#fff", overflow: "hidden" }}>
        <input
          type="text"
          value={open ? query : displayLabel}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => fetchOptions(e.target.value), 300); }}
          onFocus={() => { setOpen(true); if (options.length === 0) fetchOptions(""); }}
          placeholder={placeholder}
          style={{ flex: 1, padding: "7px 10px", border: "none", outline: "none", fontSize: "0.875rem" }}
        />
        <span onClick={() => { setOpen((p) => !p); if (!open) fetchOptions(query); }} style={{ padding: "0 8px", cursor: "pointer", color: "#6b7280", fontSize: "0.7rem" }}>▼</span>
        {(displayLabel || value) && <span onClick={(e) => { e.stopPropagation(); setDisplayLabel(""); setQuery(""); setOpen(false); onChange(""); }} style={{ padding: "0 6px", cursor: "pointer", color: "#9ca3af", fontSize: "0.8rem" }}>✕</span>}
      </div>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #d1d5db", borderTop: "none", borderRadius: "0 0 6px 6px", maxHeight: "180px", overflowY: "auto", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          {loading ? <div style={{ padding: "10px 12px", color: "#9ca3af", fontSize: "0.85rem" }}>Loading...</div>
            : options.length === 0 ? <div style={{ padding: "10px 12px", color: "#9ca3af", fontSize: "0.85rem" }}>No results</div>
            : options.map((opt) => (
              <div key={opt.id} onMouseDown={() => { onChange(opt.id); setDisplayLabel(opt[labelField]); setOpen(false); setQuery(""); }}
                style={{ padding: "8px 12px", cursor: "pointer", fontSize: "0.875rem", background: opt.id === value ? "#f0fdf4" : "#fff", color: opt.id === value ? "#0d9488" : "#111827", borderBottom: "1px solid #f3f4f6" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                onMouseLeave={(e) => (e.currentTarget.style.background = opt.id === value ? "#f0fdf4" : "#fff")}>
                {opt[labelField]}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Room Component ──────────────────────────────────────────────────────
const Room = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("services");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // ── Room form ──
  const defaultRoom = {
    room_number: "", description: "", room_category: "", block: "",
    floor: "", phone_extension: "", nursing_station: "", capacity: "",
    admission_fee: "", room_advance: "", room_type: "WARD",
    room_blocked: false, blocking_reason: "",
    include_in_final_bill: true, enable_luxury_tax: false,
  };
  const [formData, setFormData] = useState(defaultRoom);

  // ── Sub-item arrays (JSON) ──
  const [roomServices, setRoomServices] = useState([]);
  const [roomBeds, setRoomBeds] = useState([]);
  const [roomKits, setRoomKits] = useState([]);

  // ── Service form ──
  const defaultService = { description: "", priority: "", amount: "", chargeable_for_bystander: false, chargeable_for_booking: false, enable_this_service: true, doctors_fee: false };
  const [serviceForm, setServiceForm] = useState(defaultService);
  const [editingServiceIdx, setEditingServiceIdx] = useState(null);

  // ── Bed form ──
  const defaultBed = { bed_number: "", bed_status: "Available", blocked: false, blocked_reason: "" };
  const [bedForm, setBedForm] = useState(defaultBed);
  const [editingBedIdx, setEditingBedIdx] = useState(null);

  // ── Kit form ──
  const defaultKit = { kit_item: "", priority: "", amount: "", enable_item: true };
  const [kitForm, setKitForm] = useState(defaultKit);
  const [editingKitIdx, setEditingKitIdx] = useState(null);

  // ── Modals ──
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newBlockName, setNewBlockName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      const [roomsRes, blocksRes, catsRes] = await Promise.all([
        apiRequest(`${HmsBaseUrl}room/`, "GET"),
        apiRequest(`${HmsBaseUrl}block/`, "GET"),
        apiRequest(`${HmsBaseUrl}room-category/`, "GET"),
      ]);
      const unwrap = (r) => Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : [];
      setRooms(unwrap(roomsRes));
      setBlocks(unwrap(blocksRes));
      setCategories(unwrap(catsRes));
    } catch { toast.error("Failed to load data"); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  // ── Modals ──
  const saveBlock = async () => {
    if (!newBlockName.trim()) return toast.warning("Block name required");
    try {
      const res = await apiRequest(`${HmsBaseUrl}block/`, "POST", { block_name: newBlockName, is_active: true });
      if (res && !res.error) { setNewBlockName(""); toast.success("Block added"); setShowBlockModal(false); fetchInitialData(); }
      else toast.error(res?.error || "Failed");
    } catch { toast.error("Failed to add block"); }
  };
  const saveCategory = async () => {
    if (!newCategoryName.trim()) return toast.warning("Category name required");
    try {
      const res = await apiRequest(`${HmsBaseUrl}room-category/`, "POST", { name: newCategoryName, is_active: true });
      if (res && !res.error) { setNewCategoryName(""); toast.success("Category added"); setShowCategoryModal(false); fetchInitialData(); }
      else toast.error(res?.error || "Failed");
    } catch { toast.error("Failed to add category"); }
  };

  // ── Service sub-item handlers ──
  const addService = () => {
    if (!serviceForm.description) return toast.warning("Select a description");
    if (!serviceForm.amount) return toast.warning("Enter amount");
    if (editingServiceIdx !== null) {
      const updated = [...roomServices];
      updated[editingServiceIdx] = { ...updated[editingServiceIdx], ...serviceForm };
      setRoomServices(updated); setEditingServiceIdx(null); toast.info("Service updated");
    } else {
      setRoomServices([...roomServices, { ...serviceForm }]); toast.success("Service added");
    }
    setServiceForm(defaultService);
  };
  const editService = (i) => { setServiceForm({ ...roomServices[i] }); setEditingServiceIdx(i); };
  const removeService = (i) => {
    setRoomServices(roomServices.filter((_, idx) => idx !== i));
    if (editingServiceIdx === i) { setEditingServiceIdx(null); setServiceForm(defaultService); }
  };

  // ── Bed sub-item handlers ──
  const addBed = () => {
    if (!bedForm.bed_number) return toast.warning("Bed number required");
    if (editingBedIdx !== null) {
      const updated = [...roomBeds];
      updated[editingBedIdx] = { ...updated[editingBedIdx], ...bedForm };
      setRoomBeds(updated); setEditingBedIdx(null); toast.info("Bed updated");
    } else {
      setRoomBeds([...roomBeds, { ...bedForm }]); toast.success("Bed added");
    }
    setBedForm(defaultBed);
  };
  const editBed = (i) => { setBedForm({ ...roomBeds[i] }); setEditingBedIdx(i); };
  const removeBed = (i) => {
    setRoomBeds(roomBeds.filter((_, idx) => idx !== i));
    if (editingBedIdx === i) { setEditingBedIdx(null); setBedForm(defaultBed); }
  };

  // ── Kit sub-item handlers ──
  const addKit = () => {
    if (!kitForm.kit_item) return toast.warning("Select a kit item");
    if (editingKitIdx !== null) {
      const updated = [...roomKits];
      updated[editingKitIdx] = { ...updated[editingKitIdx], ...kitForm };
      setRoomKits(updated); setEditingKitIdx(null); toast.info("Kit updated");
    } else {
      setRoomKits([...roomKits, { ...kitForm }]); toast.success("Kit item added");
    }
    setKitForm(defaultKit);
  };
  const editKit = (i) => { setKitForm({ ...roomKits[i] }); setEditingKitIdx(i); };
  const removeKit = (i) => {
    setRoomKits(roomKits.filter((_, idx) => idx !== i));
    if (editingKitIdx === i) { setEditingKitIdx(null); setKitForm(defaultKit); }
  };

  // ── Main Save ──
  const handleSave = async () => {
    if (!formData.room_number) return toast.error("Room Number is required");
    if (!formData.block) return toast.error("Block is required");
    if (!formData.nursing_station) return toast.error("Nursing Station is required");
    if (!formData.capacity) return toast.error("Capacity is required");

    const payload = {
      ...formData,
      beds: roomBeds,
      services: roomServices,
      kits: roomKits,
    };

    try {
      if (isEditing) {
        const res = await apiRequest(`${HmsBaseUrl}room/${editId}/`, "PUT", payload);
        if (res && !res.error) { toast.success("Room updated successfully"); resetForm(); fetchInitialData(); }
        else toast.error(res?.error || "Update failed");
      } else {
        const res = await apiRequest(`${HmsBaseUrl}room/`, "POST", payload);
        if (res && !res.error) { toast.success("Room created successfully"); resetForm(); fetchInitialData(); }
        else toast.error(res?.error || "Create failed");
      }
    } catch { toast.error("Failed to save room"); }
  };

  const resetForm = () => {
    setFormData(defaultRoom);
    setRoomBeds([]); setRoomServices([]); setRoomKits([]);
    setIsEditing(false); setEditId(null);
    setEditingBedIdx(null); setEditingServiceIdx(null); setEditingKitIdx(null);
    setBedForm(defaultBed); setServiceForm(defaultService); setKitForm(defaultKit);
  };

  const handleEdit = (room) => {
    setFormData({
      room_number: room.room_number || "",
      description: room.description || "",
      room_category: room.room_category || "",
      block: room.block || "",
      floor: room.floor || "",
      phone_extension: room.phone_extension || "",
      nursing_station: room.nursing_station || "",
      capacity: room.capacity || "",
      admission_fee: room.admission_fee || "",
      room_advance: room.room_advance || "",
      room_type: room.room_type || "WARD",
      room_blocked: room.room_blocked || false,
      blocking_reason: room.blocking_reason || "",
      include_in_final_bill: room.include_in_final_bill ?? true,
      enable_luxury_tax: room.enable_luxury_tax || false,
    });
    setRoomBeds(room.beds || []);
    setRoomServices(room.services || []);
    setRoomKits(room.kits || []);
    setEditId(room.id);
    setIsEditing(true);
    setEditingBedIdx(null); setEditingServiceIdx(null); setEditingKitIdx(null);
    setBedForm(defaultBed); setServiceForm(defaultService); setKitForm(defaultKit);
    window.scrollTo(0, 0);
  };

  // ── Soft delete: is_active = false ──
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}room/${id}/`, "DELETE");
      if (res && !res.error) { toast.success("Room deleted"); fetchInitialData(); }
      else toast.error(res?.error || "Delete failed");
    } catch { toast.error("Failed to delete room"); }
  };

  const getDescLabel = (svc) => svc.description_detail?.description || svc.description_label || svc.description || "—";
  const getKitLabel = (k) => k.kit_item_detail?.name || k.kit_item_label || k.kit_item || "—";

  return (
    <PageWrapper>
      <Container>
        <SectionHeader><h3>Room Master</h3></SectionHeader>

        {/* ── Block Modal ── */}
        {showBlockModal && (
          <ModalOverlay>
            <ModalContent>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 style={{ margin: 0 }}>Add Block</h4>
                <Button danger onClick={() => setShowBlockModal(false)} style={{ padding: "4px 10px" }}>✕</Button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <Input value={newBlockName} onChange={(e) => setNewBlockName(e.target.value)} placeholder="Block Name" />
                <Button onClick={saveBlock}>Save</Button>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: 12, maxHeight: 180, overflowY: "auto" }}>
                <strong style={{ fontSize: "0.85rem" }}>Existing Blocks:</strong>
                <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                  {blocks.map((b) => <li key={b.block_id} style={{ fontSize: "0.85rem", marginBottom: 4 }}>{b.block_name}</li>)}
                </ul>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* ── Category Modal ── */}
        {showCategoryModal && (
          <ModalOverlay>
            <ModalContent>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 style={{ margin: 0 }}>Add Category</h4>
                <Button danger onClick={() => setShowCategoryModal(false)} style={{ padding: "4px 10px" }}>✕</Button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Category Name" />
                <Button onClick={saveCategory}>Save</Button>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: 12, maxHeight: 180, overflowY: "auto" }}>
                <strong style={{ fontSize: "0.85rem" }}>Existing Categories:</strong>
                <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                  {categories.map((c) => <li key={c.room_category_id} style={{ fontSize: "0.85rem", marginBottom: 4 }}>{c.name}</li>)}
                </ul>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}

        <FormContent>
          <SplitLayout>
            {/* ════════════════ LEFT PANE ════════════════ */}
            <LeftPane>
              <FormGrid cols="1fr 1fr" style={{ marginBottom: 0 }}>

                {/* Row 1 */}
                <InputWrapper>
                  <Label required>Room Number</Label>
                  <Input name="room_number" value={formData.room_number} onChange={handleChange} placeholder="Room No." />
                </InputWrapper>
                <InputWrapper>
                  <Label required>Description</Label>
                  <Input name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
                </InputWrapper>

                {/* Row 2 */}
                <InputWrapper>
                  <Label>Room Category</Label>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Select name="room_category" value={formData.room_category} onChange={handleChange} style={{ flex: 1 }}>
                      <option value="">--Select--</option>
                      {categories.map((c) => <option key={c.room_category_id} value={c.name}>{c.name}</option>)}
                    </Select>
                  </div>
                </InputWrapper>
                <InputWrapper style={{ gridColumn: "span 1" }} />

                {/* Row 3 */}
                <InputWrapper>
                  <Label required>
                    Block
                    <InlineAddBtn type="button" onClick={() => setShowBlockModal(true)} title="Add Block">+</InlineAddBtn>
                  </Label>
                  <Select name="block" value={formData.block} onChange={handleChange}>
                    <option value="">--Select--</option>
                    {blocks.map((b) => <option key={b.block_id} value={b.block_name}>{b.block_name}</option>)}
                  </Select>
                </InputWrapper>
                <InputWrapper>
                  <Label>Floor</Label>
                  <Input type="number" name="floor" value={formData.floor} onChange={handleChange} placeholder="Floor" />
                </InputWrapper>

                {/* Row 4 */}
                <InputWrapper>
                  <Label>Phone Extension</Label>
                  <Input name="phone_extension" value={formData.phone_extension} onChange={handleChange} placeholder="Ext." />
                </InputWrapper>
                <InputWrapper />

                {/* Row 5 */}
                <InputWrapper>
                  <Label required>Nursing Station</Label>
                  <Select name="nursing_station" value={formData.nursing_station} onChange={handleChange}>
                    <option value="">--Select--</option>
                    <option value="NS1">NS1</option>
                    <option value="NS2">NS2</option>
                    <option value="NS3">NS3</option>
                    <option value="MAIN">MAIN</option>
                  </Select>
                </InputWrapper>
                <InputWrapper>
                  <Label required>Capacity</Label>
                  <Input type="number" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="No. of beds" />
                </InputWrapper>

                {/* Row 6 */}
                <InputWrapper>
                  <Label>Admission Fee</Label>
                  <Input type="number" name="admission_fee" value={formData.admission_fee} onChange={handleChange} placeholder="0.00" />
                </InputWrapper>
                <InputWrapper>
                  <Label>Room Advance</Label>
                  <Input type="number" name="room_advance" value={formData.room_advance} onChange={handleChange} placeholder="0.00" />
                </InputWrapper>

                {/* Row 7: Room Blocked toggle */}
                <InputWrapper>
                  <Label>Room Blocked</Label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                    <ToggleSwitch
                      type="button"
                      on={formData.room_blocked}
                      onClick={() => setFormData((p) => ({ ...p, room_blocked: !p.room_blocked, blocking_reason: !p.room_blocked ? p.blocking_reason : "" }))}
                    />
                    <span style={{ fontSize: "0.85rem", color: formData.room_blocked ? "#ef4444" : "#6b7280" }}>
                      {formData.room_blocked ? "Yes" : "No"}
                    </span>
                  </div>
                </InputWrapper>
                <InputWrapper>
                  <Label>Room Type</Label>
                  <Select name="room_type" value={formData.room_type} onChange={handleChange}>
                    <option value="WARD">WARD</option>
                    <option value="PRIVATE">PRIVATE</option>
                    <option value="ICU">ICU</option>
                    <option value="SEMI-PRIVATE">SEMI-PRIVATE</option>
                  </Select>
                </InputWrapper>

                {/* Blocking Reason - full width, only when blocked */}
                {formData.room_blocked && (
                  <InputWrapper style={{ gridColumn: "span 2" }}>
                    <Label required>Blocking Reason</Label>
                    <Input name="blocking_reason" value={formData.blocking_reason} onChange={handleChange} placeholder="Reason for blocking" />
                  </InputWrapper>
                )}

                {/* Checkboxes */}
                <InputWrapper style={{ gridColumn: "span 2" }}>
                  <div style={{ display: "flex", gap: 24, marginTop: 4 }}>
                    <CheckboxLabel>
                      <input type="checkbox" name="include_in_final_bill" checked={formData.include_in_final_bill} onChange={handleChange} />
                      Include in Final Bill
                    </CheckboxLabel>
                    <CheckboxLabel>
                      <input type="checkbox" name="enable_luxury_tax" checked={formData.enable_luxury_tax} onChange={handleChange} />
                      Enable Luxury Tax
                    </CheckboxLabel>
                  </div>
                </InputWrapper>
              </FormGrid>

              <ButtonContainer style={{ marginTop: 16 }}>
                <Button secondary type="button" onClick={resetForm}>✕ Cancel</Button>
                <Button type="button" onClick={handleSave}>
                  {isEditing ? "💾 Update" : "💾 Save"}
                </Button>
              </ButtonContainer>
            </LeftPane>

            {/* ════════════════ RIGHT PANE (Tabs) ════════════════ */}
            <RightPane>
              <TabContainer>
                <TabButton active={activeTab === "services"} onClick={() => setActiveTab("services")}>Services</TabButton>
                <TabButton active={activeTab === "beds"} onClick={() => setActiveTab("beds")}>Bed</TabButton>
                <TabButton active={activeTab === "kits"} onClick={() => setActiveTab("kits")}>Room Kit Items</TabButton>
              </TabContainer>

              {/* ── Services Tab ── */}
              {activeTab === "services" && (
                <TabPanel>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                    {/* Left: Description + Priority + Amount */}
                    <div style={{ flex: "1 1 260px" }}>
                      <InputWrapper style={{ marginBottom: 10 }}>
                        <Label required>Description</Label>
                        <SearchableDropdown
                          apiEndpoint="roomservice-description/"
                          value={serviceForm.description}
                          onChange={(val) => setServiceForm((p) => ({ ...p, description: val }))}
                          placeholder="Search description..."
                          labelField="description"
                        />
                      </InputWrapper>
                      <div style={{ display: "flex", gap: 10 }}>
                        <InputWrapper style={{ flex: 1 }}>
                          <Label>Priority</Label>
                          <Input type="number" value={serviceForm.priority} onChange={(e) => setServiceForm((p) => ({ ...p, priority: e.target.value }))} placeholder="Priority" />
                        </InputWrapper>
                        <InputWrapper style={{ flex: 1 }}>
                          <Label>Amount</Label>
                          <Input type="number" value={serviceForm.amount} onChange={(e) => setServiceForm((p) => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
                        </InputWrapper>
                      </div>
                    </div>
                    {/* Right: Checkboxes */}
                    <div style={{ flex: "0 1 220px", display: "flex", flexDirection: "column", gap: 10, paddingTop: 20 }}>
                      <CheckboxLabel>
                        <input type="checkbox" checked={serviceForm.chargeable_for_bystander} onChange={(e) => setServiceForm((p) => ({ ...p, chargeable_for_bystander: e.target.checked }))} />
                        Chargeable For Bystander
                      </CheckboxLabel>
                      <CheckboxLabel>
                        <input type="checkbox" checked={serviceForm.chargeable_for_booking} onChange={(e) => setServiceForm((p) => ({ ...p, chargeable_for_booking: e.target.checked }))} />
                        Chargeable For Booking
                      </CheckboxLabel>
                      <CheckboxLabel>
                        <input type="checkbox" checked={serviceForm.enable_this_service} onChange={(e) => setServiceForm((p) => ({ ...p, enable_this_service: e.target.checked }))} />
                        Enable This Service
                      </CheckboxLabel>
                      <CheckboxLabel>
                        <input type="checkbox" checked={serviceForm.doctors_fee} onChange={(e) => setServiceForm((p) => ({ ...p, doctors_fee: e.target.checked }))} />
                        Doctor's Fee
                      </CheckboxLabel>
                    </div>
                  </div>
                  <ButtonContainer style={{ marginBottom: 12 }}>
                    {editingServiceIdx !== null && (
                      <Button secondary type="button" onClick={() => { setEditingServiceIdx(null); setServiceForm(defaultService); }}>✕ Cancel</Button>
                    )}
                    <Button type="button" onClick={addService}>{editingServiceIdx !== null ? "+ Update" : "+ Add"}</Button>
                  </ButtonContainer>
                  <TableWrapper>
                    <Table>
                      <thead><Tr><Th>Description</Th><Th>Charge</Th><Th>Priority</Th><Th>Action</Th></Tr></thead>
                      <tbody>
                        {roomServices.length === 0 ? (
                          <Tr><Td colSpan="4" style={{ textAlign: "center", color: "#9ca3af" }}>No data available in table</Td></Tr>
                        ) : roomServices.map((s, i) => (
                          <Tr key={i} style={{ background: editingServiceIdx === i ? "#f0fdf4" : "" }}>
                            <Td>{getDescLabel(s)}</Td>
                            <Td>{s.amount || "—"}</Td>
                            <Td>{s.priority || "—"}</Td>
                            <Td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <Button style={{ padding: "4px 10px", fontSize: "0.8rem" }} onClick={() => editService(i)}>Edit</Button>
                                <Button danger style={{ padding: "4px 10px", fontSize: "0.8rem" }} onClick={() => removeService(i)}>Delete</Button>
                              </div>
                            </Td>
                          </Tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrapper>
                </TabPanel>
              )}

              {/* ── Beds Tab ── */}
              {activeTab === "beds" && (
                <TabPanel>
                  <SubFormGrid>
                    <InputWrapper>
                      <Label>Bed Number</Label>
                      <Input value={bedForm.bed_number} onChange={(e) => setBedForm((p) => ({ ...p, bed_number: e.target.value }))} placeholder="e.g. B-101" />
                    </InputWrapper>
                    <InputWrapper>
                      <Label>Status</Label>
                      <Select value={bedForm.bed_status} onChange={(e) => setBedForm((p) => ({ ...p, bed_status: e.target.value }))}>
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Maintenance">Maintenance</option>
                      </Select>
                    </InputWrapper>
                    <InputWrapper>
                      <Label>Blocked</Label>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <ToggleSwitch
                          type="button"
                          on={bedForm.blocked}
                          onClick={() => setBedForm((p) => ({ ...p, blocked: !p.blocked, blocked_reason: !p.blocked ? p.blocked_reason : "" }))}
                        />
                        <span style={{ fontSize: "0.82rem", color: bedForm.blocked ? "#ef4444" : "#6b7280" }}>{bedForm.blocked ? "Yes" : "No"}</span>
                      </div>
                    </InputWrapper>
                    {bedForm.blocked && (
                      <InputWrapper style={{ gridColumn: "span 3" }}>
                        <Label required>Blocking Reason</Label>
                        <Input value={bedForm.blocked_reason} onChange={(e) => setBedForm((p) => ({ ...p, blocked_reason: e.target.value }))} placeholder="Reason" />
                      </InputWrapper>
                    )}
                  </SubFormGrid>
                  <ButtonContainer style={{ marginBottom: 12 }}>
                    {editingBedIdx !== null && (
                      <Button secondary type="button" onClick={() => { setEditingBedIdx(null); setBedForm(defaultBed); }}>✕ Cancel</Button>
                    )}
                    <Button type="button" onClick={addBed}>{editingBedIdx !== null ? "+ Update" : "+ Add"}</Button>
                  </ButtonContainer>
                  <TableWrapper>
                    <Table>
                      <thead><Tr><Th>Bed No</Th><Th>Status</Th><Th>Blocked</Th><Th>Action</Th></Tr></thead>
                      <tbody>
                        {roomBeds.length === 0 ? (
                          <Tr><Td colSpan="4" style={{ textAlign: "center", color: "#9ca3af" }}>No data available in table</Td></Tr>
                        ) : roomBeds.map((b, i) => (
                          <Tr key={i} style={{ background: editingBedIdx === i ? "#f0fdf4" : "" }}>
                            <Td>{b.bed_number}</Td>
                            <Td><span style={{ color: b.bed_status === "Available" ? "#16a34a" : b.bed_status === "Occupied" ? "#ef4444" : "#f59e0b", fontWeight: 600 }}>{b.bed_status}</span></Td>
                            <Td><span style={{ color: b.blocked ? "#ef4444" : "#16a34a", fontWeight: 600 }}>{b.blocked ? "Yes" : "No"}</span></Td>
                            <Td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <Button style={{ padding: "4px 10px", fontSize: "0.8rem" }} onClick={() => editBed(i)}>Edit</Button>
                                <Button danger style={{ padding: "4px 10px", fontSize: "0.8rem" }} onClick={() => removeBed(i)}>Delete</Button>
                              </div>
                            </Td>
                          </Tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrapper>
                </TabPanel>
              )}

              {/* ── Room Kit Tab ── */}
              {activeTab === "kits" && (
                <TabPanel>
                  <SubFormGrid>
                    <InputWrapper>
                      <Label>Kit Item Name</Label>
                      <SearchableDropdown
                        apiEndpoint="room-kit-description/"
                        value={kitForm.kit_item}
                        onChange={(val) => setKitForm((p) => ({ ...p, kit_item: val }))}
                        placeholder="Search kit item..."
                        labelField="name"
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <Label>Priority</Label>
                      <Input type="number" value={kitForm.priority} onChange={(e) => setKitForm((p) => ({ ...p, priority: e.target.value }))} placeholder="Priority" />
                    </InputWrapper>
                    <InputWrapper>
                      <Label>Amount</Label>
                      <Input type="number" value={kitForm.amount} onChange={(e) => setKitForm((p) => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
                    </InputWrapper>
                    <InputWrapper>
                      <CheckboxLabel style={{ marginTop: 8 }}>
                        <input type="checkbox" checked={kitForm.enable_item} onChange={(e) => setKitForm((p) => ({ ...p, enable_item: e.target.checked }))} />
                        Enable Item
                      </CheckboxLabel>
                    </InputWrapper>
                  </SubFormGrid>
                  <ButtonContainer style={{ marginBottom: 12 }}>
                    {editingKitIdx !== null && (
                      <Button secondary type="button" onClick={() => { setEditingKitIdx(null); setKitForm(defaultKit); }}>✕ Cancel</Button>
                    )}
                    <Button type="button" onClick={addKit}>{editingKitIdx !== null ? "+ Update" : "+ Add"}</Button>
                  </ButtonContainer>
                  <TableWrapper>
                    <Table>
                      <thead><Tr><Th>Kit Item</Th><Th>Priority</Th><Th>Amount</Th><Th>Enabled</Th><Th>Action</Th></Tr></thead>
                      <tbody>
                        {roomKits.length === 0 ? (
                          <Tr><Td colSpan="5" style={{ textAlign: "center", color: "#9ca3af" }}>No data available in table</Td></Tr>
                        ) : roomKits.map((k, i) => (
                          <Tr key={i} style={{ background: editingKitIdx === i ? "#f0fdf4" : "" }}>
                            <Td>{getKitLabel(k)}</Td>
                            <Td>{k.priority || "—"}</Td>
                            <Td>{k.amount || "—"}</Td>
                            <Td><span style={{ color: k.enable_item ? "#16a34a" : "#9ca3af", fontWeight: 600 }}>{k.enable_item ? "✓" : "✗"}</span></Td>
                            <Td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <Button style={{ padding: "4px 10px", fontSize: "0.8rem" }} onClick={() => editKit(i)}>Edit</Button>
                                <Button danger style={{ padding: "4px 10px", fontSize: "0.8rem" }} onClick={() => removeKit(i)}>Delete</Button>
                              </div>
                            </Td>
                          </Tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrapper>
                </TabPanel>
              )}
            </RightPane>
          </SplitLayout>
        </FormContent>

        {/* ── Room List ── */}
        <div style={{ padding: "0 24px 24px" }}>
          <h4 style={{ color: "#0d9488", marginBottom: 16 }}>Room List</h4>
          <TableWrapper>
            <Table>
              <thead>
                <Tr>
                  <Th>Room No</Th>
                  <Th>Description</Th>
                  <Th>Block</Th>
                  <Th>Category</Th>
                  <Th>Type</Th>
                  <Th>Floor</Th>
                  <Th>Capacity</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </thead>
              <tbody>
                {rooms.length === 0 ? (
                  <Tr><Td colSpan="9" style={{ textAlign: "center", color: "#9ca3af" }}>No rooms found</Td></Tr>
                ) : rooms.map((r) => (
                  <Tr key={r.id}>
                    <Td>{r.room_number}</Td>
                    <Td>{r.description || "—"}</Td>
                    <Td>{r.block}</Td>
                    <Td>{r.room_category}</Td>
                    <Td>{r.room_type}</Td>
                    <Td>{r.floor}</Td>
                    <Td>{r.capacity}</Td>
                    <Td>
                      <span style={{ color: r.room_blocked ? "#ef4444" : "#16a34a", fontWeight: 600, fontSize: "0.82rem" }}>
                        {r.room_blocked ? "Blocked" : "Active"}
                      </span>
                    </Td>
                    <Td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button style={{ padding: "5px 12px", fontSize: "0.8rem" }} onClick={() => handleEdit(r)}>Edit</Button>
                        <Button danger style={{ padding: "5px 12px", fontSize: "0.8rem" }} onClick={() => handleDelete(r.id)}>Delete</Button>
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

export default Room;