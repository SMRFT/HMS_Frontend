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
  colors,
} from "../GlobalStyles";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

// ─── Local Styled Components ──────────────────────────────────────────────────

const TabContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  border-bottom: 2px solid ${colors.border};
  background: ${colors.background};
`;

const TabButton = styled.button`
  padding: 10px 16px;
  background: ${(p) => (p.active ? "#fff" : colors.background)};
  border: 1px solid ${(p) => (p.active ? colors.border : "transparent")};
  border-bottom: ${(p) => (p.active ? "2px solid #fff" : `1px solid ${colors.border}`)};
  margin-bottom: ${(p) => (p.active ? "-2px" : "0")};
  cursor: pointer;
  font-weight: ${(p) => (p.active ? "600" : "400")};
  color: ${(p) => (p.active ? colors.primary : colors.textMuted)};
  font-size: 0.85rem;
  outline: none;
  transition: all 0.2s;
  white-space: nowrap;
  &:hover { background: #fff; color: ${colors.primary}; }
`;

const TabPanel = styled.div`
  border: 1px solid ${colors.border};
  border-top: none;
  padding: 16px;
  background: #fff;
  border-radius: 0 0 8px 8px;
  min-height: 320px;
`;

const InlineAddBtn = styled.button`
  margin-left: 6px;
  background: ${colors.primary};
  color: #fff;
  border: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
  &:hover { background: ${colors.primaryDark}; }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.83rem;
  color: ${colors.textMain};
  cursor: pointer;
  user-select: none;
  input {
    width: 14px;
    height: 14px;
    accent-color: ${colors.primary};
    cursor: pointer;
    flex-shrink: 0;
  }
`;

const ToggleSwitch = styled.button`
  width: 42px;
  height: 22px;
  border-radius: 11px;
  border: none;
  cursor: pointer;
  background: ${(p) => (p.on ? colors.danger : "#d1d5db")};
  position: relative;
  transition: background 0.3s;
  flex-shrink: 0;
  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: ${(p) => (p.on ? "22px" : "2px")};
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.3s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
`;

/* ── Main layout: Left (3fr) | Right (2fr) ── */
const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const LeftPane = styled.div`
  border-right: 1px solid ${colors.border};
  padding-right: 24px;

  @media (max-width: 860px) {
    border-right: none;
    padding-right: 0;
    border-bottom: 1px solid ${colors.border};
    padding-bottom: 20px;
  }
`;

const RightPane = styled.div`
  min-width: 0;
`;

/* 3-column grid for room fields */
const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 14px;
  margin-bottom: 12px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

/* 2-column grid */
const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 14px;
  margin-bottom: 12px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

/* Sub-grid for beds/kits forms */
const SubFormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  align-items: end;
  margin-bottom: 10px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`;

const PanelTitle = styled.h4`
  color: ${colors.primary};
  margin: 0 0 12px;
  font-size: 0.93rem;
  font-weight: 600;
`;

const StatusBadge = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${(p) => p.color || colors.textMain};
`;

const ActionCell = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
`;

const SmallBtn = styled(Button)`
  padding: 4px 10px;
  font-size: 0.8rem;
`;

const Divider = styled.div`
  border-top: 1px dashed ${colors.border};
  margin: 12px 0;
`;

// ─── Searchable Dropdown ──────────────────────────────────────────────────────

const DropWrapper = styled.div`position: relative;`;

const DropBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
  &:focus-within {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(13,148,136,0.1);
  }
`;

const DropList = styled.div`
  position: absolute;
  top: 100%; left: 0; right: 0;
  background: #fff;
  border: 1px solid ${colors.border};
  border-top: none;
  border-radius: 0 0 6px 6px;
  max-height: 190px;
  overflow-y: auto;
  z-index: 999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const DropItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.86rem;
  background: ${(p) => (p.selected ? "#f0fdf4" : "#fff")};
  color: ${(p) => (p.selected ? colors.primary : colors.textMain)};
  border-bottom: 1px solid #f3f4f6;
  &:hover { background: #f0fdf4; }
`;

const SearchableDropdown = ({
  apiEndpoint, value, onChange,
  placeholder = "Search...",
  labelField = "description",
  valueField = "id",
}) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayLabel, setDisplayLabel] = useState("");
  const wrapRef = useRef(null);
  const debRef = useRef(null);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (!value) { setDisplayLabel(""); setQuery(""); return; }
    const c = options.find((o) => o[valueField] === value);
    if (c) { setDisplayLabel(c[labelField]); return; }
    apiRequest(`${HmsBaseUrl}${apiEndpoint}`, "GET").then((res) => {
      const all = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      const f = all.find((o) => o[valueField] === value);
      if (f) setDisplayLabel(f[labelField]);
    }).catch(() => {});
  }, [value, options, apiEndpoint, labelField, valueField, HmsBaseUrl]);

  const fetchOptions = async (search = "") => {
    setLoading(true);
    try {
      const url = search
        ? `${HmsBaseUrl}${apiEndpoint}?search=${encodeURIComponent(search)}`
        : `${HmsBaseUrl}${apiEndpoint}`;
      const res = await apiRequest(url, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setOptions(list.filter((o) => o.is_active !== false));
    } catch { setOptions([]); }
    finally { setLoading(false); }
  };

  return (
    <DropWrapper ref={wrapRef}>
      <DropBox>
        <input
          type="text"
          value={open ? query : displayLabel}
          onChange={(e) => {
            setQuery(e.target.value); setOpen(true);
            clearTimeout(debRef.current);
            debRef.current = setTimeout(() => fetchOptions(e.target.value), 300);
          }}
          onFocus={() => { setOpen(true); if (!options.length) fetchOptions(""); }}
          placeholder={placeholder}
          style={{ flex: 1, padding: "9px 10px", border: "none", outline: "none", fontSize: "0.88rem", minWidth: 0 }}
        />
        <span
          onClick={() => { setOpen((p) => !p); if (!open) fetchOptions(query); }}
          style={{ padding: "0 9px", cursor: "pointer", color: colors.textMuted, fontSize: "0.68rem", userSelect: "none", flexShrink: 0 }}
        >▼</span>
        {(displayLabel || value) && (
          <span
            onClick={(e) => { e.stopPropagation(); setDisplayLabel(""); setQuery(""); setOpen(false); onChange(""); }}
            style={{ padding: "0 8px", cursor: "pointer", color: "#9ca3af", fontSize: "0.85rem", userSelect: "none", flexShrink: 0 }}
          >✕</span>
        )}
      </DropBox>
      {open && (
        <DropList>
          {loading
            ? <DropItem style={{ color: "#9ca3af", cursor: "default" }}>Loading…</DropItem>
            : options.length === 0
              ? <DropItem style={{ color: "#9ca3af", cursor: "default" }}>No results</DropItem>
              : options.map((opt, i) => (
                <DropItem
                  key={opt[valueField] || i}
                  selected={opt[valueField] === value}
                  onMouseDown={() => { setDisplayLabel(opt[labelField]); setQuery(""); setOpen(false); onChange(opt[valueField]); }}
                >
                  {opt[labelField]}
                </DropItem>
              ))}
        </DropList>
      )}
    </DropWrapper>
  );
};

// ─── Helper: generate beds array from capacity ────────────────────────────────
// Merges existing bed data so edits are preserved when capacity changes
const generateBeds = (capacity, existingBeds = []) => {
  const count = parseInt(capacity, 10);
  if (!count || count < 1) return [];
  return Array.from({ length: count }, (_, i) => {
    const existing = existingBeds[i];
    return existing
      ? { ...existing }
      : { bed_number: `B-${String(i + 1).padStart(2, "0")}`, blocked: false, blocked_reason: "" };
  });
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Room = () => {
  const navigate = useNavigate();
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [nursingStations, setNursingStations] = useState([]);
  const [activeTab, setActiveTab] = useState("services");
  const [editingId, setEditingId] = useState(null);

  // ── Room form ──
  const defaultRoomForm = {
    room_number: "",
    description: "",
    room_category: "",
    block: "",
    phone_extension: "",
    nursing_station: "",
    capacity: "1",
    room_status: "Available",   // Available | Maintenance | Blocked
  };
  const [roomForm, setRoomForm] = useState(defaultRoomForm);

  // ── Services ──
  const defaultService = { description: "", priority: "", amount: "" };
  const [serviceForm, setServiceForm] = useState(defaultService);
  const [roomServices, setRoomServices] = useState([]);
  const [editingServiceIdx, setEditingServiceIdx] = useState(null);

  // ── Beds — auto-generated from capacity ──
  // Each bed: { bed_number, blocked, blocked_reason }
  // bed_status is derived: blocked → "Blocked", else "Available"
  const [roomBeds, setRoomBeds] = useState([]);

  // ── Kits ──
  const defaultKit = { kit_item: "", priority: "", amount: "" };
  const [kitForm, setKitForm] = useState(defaultKit);
  const [roomKits, setRoomKits] = useState([]);
  const [editingKitIdx, setEditingKitIdx] = useState(null);

  // ─── Fetch master data ───────────────────────────────────────────────────────
  useEffect(() => {
    fetchRooms();
    fetchBlocks();
    fetchCategories();
    fetchNursingStations();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}room/`, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setRooms(list.filter((r) => r.is_active !== false));
    } catch { toast.error("Failed to fetch rooms"); }
  };

  const fetchBlocks = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}block/`, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setBlocks(list.filter((b) => b.is_active !== false));
    } catch { toast.error("Failed to fetch blocks"); }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}room-category/`, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setCategories(list.filter((c) => c.is_active !== false));
    } catch { toast.error("Failed to fetch categories"); }
  };

  const fetchNursingStations = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}nursingstation/`, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setNursingStations(list.filter((n) => n.is_active !== false));
    } catch { /* optional */ }
  };

  // ─── Room form handlers ──────────────────────────────────────────────────────
  const handleRoomChange = (e) => {
    const { name, value } = e.target;

    if (name === "capacity") {
      // Re-generate beds preserving existing edits
      const newBeds = generateBeds(value, roomBeds);
      setRoomBeds(newBeds);
    }

    setRoomForm((p) => ({ ...p, [name]: value }));
  };

  const handleReset = () => {
    setEditingId(null);
    setRoomForm(defaultRoomForm);
    setRoomServices([]);
    setRoomBeds(generateBeds(1));
    setRoomKits([]);
    setActiveTab("services");
  };

  const handleEdit = (room) => {
    setEditingId(room.room_number);
    setRoomForm({
      room_number: room.room_number || "",
      description: room.description || "",
      room_category: room.room_category || "",
      block: room.block || "",
      phone_extension: room.phone_extension || "",
      nursing_station: room.nursing_station || "",
      capacity: String(room.capacity || 1),
      room_status: room.room_status || "Available",
    });
    // Normalise existing beds
    const existing = (room.beds || []).map((b) => ({
      bed_number: b.bed_number || "",
      blocked: b.blocked || false,
      blocked_reason: b.blocked_reason || "",
    }));
    // Fill up to capacity if saved beds < capacity
    const cap = parseInt(room.capacity || 1, 10);
    const merged = generateBeds(cap, existing);
    setRoomBeds(merged);
    setRoomServices(room.services || []);
    setRoomKits(room.room_kits || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}room/${id}/`, "DELETE");
      if (res && !res.error) { toast.success("Room deleted"); fetchRooms(); }
      else toast.error(res?.error || "Delete failed");
    } catch { toast.error("Failed to delete room"); }
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomForm.room_number.trim()) return toast.warning("Room number is required");
    if (!roomForm.block) return toast.warning("Please select a block");
    if (!roomForm.room_category) return toast.warning("Please select a room category");

    // Derive bed_status from blocked flag before sending
    const bedsPayload = roomBeds.map((b) => ({
      ...b,
      bed_status: b.blocked ? "Blocked" : "Available",
    }));

    // Occupancy = non-blocked beds that are actually occupied
    // (since we removed the Occupied status, occupancy stays as count of non-blocked here)
    const occupancy = bedsPayload.filter((b) => b.bed_status === "Available").length;

    const payload = {
      ...roomForm,
      occupancy,
      services: roomServices,
      beds: bedsPayload,
      room_kits: roomKits,
    };

    try {
      if (editingId) {
        const res = await apiRequest(`${HmsBaseUrl}room/${editingId}/`, "PUT", payload);
        if (res && !res.error) { toast.success("Room updated"); handleReset(); fetchRooms(); }
        else toast.error(res?.error || "Update failed");
      } else {
        const res = await apiRequest(`${HmsBaseUrl}room/`, "POST", payload);
        if (res && !res.error) { toast.success("Room added"); handleReset(); fetchRooms(); }
        else toast.error(res?.error || "Create failed");
      }
    } catch { toast.error("Failed to save room"); }
  };

  // ─── Services ────────────────────────────────────────────────────────────────
  const addService = () => {
    if (!serviceForm.description) return toast.warning("Please select a service");
    if (!serviceForm.amount) return toast.warning("Please enter amount");
    if (editingServiceIdx !== null) {
      const u = [...roomServices];
      u[editingServiceIdx] = { ...serviceForm };
      setRoomServices(u);
      setEditingServiceIdx(null);
      toast.success("Service updated");
    } else {
      setRoomServices([...roomServices, { ...serviceForm }]);
      toast.success("Service added");
    }
    setServiceForm(defaultService);
  };

  const editService = (i) => { setServiceForm({ ...roomServices[i] }); setEditingServiceIdx(i); };

  const removeService = (i) => {
    if (!window.confirm("Remove service?")) return;
    setRoomServices(roomServices.filter((_, idx) => idx !== i));
    toast.info("Removed");
  };

  // ─── Beds ────────────────────────────────────────────────────────────────────
  // Update a single bed field inline
  const updateBed = (idx, field, val) => {
    setRoomBeds((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      // Clear reason when unblocking
      if (field === "blocked" && !val) updated[idx].blocked_reason = "";
      return updated;
    });
  };

  // ─── Kits ────────────────────────────────────────────────────────────────────
  const addKit = () => {
    if (!kitForm.kit_item) return toast.warning("Please select kit item");
    if (!kitForm.amount) return toast.warning("Please enter amount");
    if (editingKitIdx !== null) {
      const u = [...roomKits];
      u[editingKitIdx] = { ...kitForm };
      setRoomKits(u);
      setEditingKitIdx(null);
      toast.success("Kit updated");
    } else {
      setRoomKits([...roomKits, { ...kitForm }]);
      toast.success("Kit added");
    }
    setKitForm(defaultKit);
  };

  const editKit = (i) => { setEditingKitIdx(i); setKitForm({ ...roomKits[i] }); };

  const removeKit = (i) => {
    if (!window.confirm("Remove kit?")) return;
    setRoomKits(roomKits.filter((_, idx) => idx !== i));
    toast.info("Removed");
  };

  const getKitLabel = (k) =>
    typeof k.kit_item === "object" && k.kit_item?.name ? k.kit_item.name : k.kit_item || "—";

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>
        <SectionHeader style={{ padding: "0 24px", marginTop: 20 }}>
          <h3>Room Management</h3>
        </SectionHeader>

        <FormContent style={{ paddingTop: 16 }}>
          <form onSubmit={handleSubmit}>
            <PageLayout>

              {/* ════════════════ LEFT PANE ════════════════ */}
              <LeftPane>
                <PanelTitle>Room Details</PanelTitle>

                {/* Row 1: Room Number | Description | Room Category */}
                <FieldGrid>
                  <InputWrapper>
                    <Label required>Room Number</Label>
                    <Input
                      type="text" name="room_number" value={roomForm.room_number}
                      onChange={handleRoomChange} placeholder="e.g. R-101" required
                    />
                  </InputWrapper>

                  <InputWrapper>
                    <Label>Description</Label>
                    <Input
                      type="text" name="description" value={roomForm.description}
                      onChange={handleRoomChange} placeholder="Room description"
                    />
                  </InputWrapper>

                  <InputWrapper>
                    <Label required style={{ display: "flex", alignItems: "center" }}>
                      Room Category
                      <InlineAddBtn type="button" onClick={() => navigate("/RoomCategory")}>+</InlineAddBtn>
                    </Label>
                    <Select name="room_category" value={roomForm.room_category} onChange={handleRoomChange} required>
                      <option value="">--Select--</option>
                      {categories.map((c) => (
                        <option key={c.room_category_id} value={c.name}>{c.name}</option>
                      ))}
                    </Select>
                  </InputWrapper>
                </FieldGrid>

                {/* Row 2: Block | Phone Extension | Nursing Station */}
                <FieldGrid>
                  <InputWrapper>
                    <Label required style={{ display: "flex", alignItems: "center" }}>
                      Block
                      <InlineAddBtn type="button" onClick={() => navigate("/Block")}>+</InlineAddBtn>
                    </Label>
                    <Select name="block" value={roomForm.block} onChange={handleRoomChange} required>
                      <option value="">--Select--</option>
                      {blocks.map((b) => (
                        <option key={b.block_id} value={b.block_name}>{b.block_name}</option>
                      ))}
                    </Select>
                  </InputWrapper>

                  <InputWrapper>
                    <Label>Phone Extension</Label>
                    <Input
                      type="text" name="phone_extension" value={roomForm.phone_extension}
                      onChange={handleRoomChange} placeholder="e.g. 1234"
                    />
                  </InputWrapper>

                  <InputWrapper>
                    <Label>Nursing Station</Label>
                    <Select name="nursing_station" value={roomForm.nursing_station} onChange={handleRoomChange}>
                      <option value="">--Select--</option>
                      {nursingStations.map((ns) => (
                        <option key={ns.id || ns.name} value={ns.name}>{ns.name}</option>
                      ))}
                    </Select>
                  </InputWrapper>
                </FieldGrid>

                {/* Row 3: Capacity | Room Status */}
                <TwoCol>
                  <InputWrapper>
                    <Label required>Capacity</Label>
                    <Input
                      type="number" name="capacity" value={roomForm.capacity}
                      onChange={handleRoomChange} min="1"
                    />
                  </InputWrapper>

                  <InputWrapper>
                    <Label>Room Status</Label>
                    <Select name="room_status" value={roomForm.room_status} onChange={handleRoomChange}>
                      <option value="Available">Available</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Blocked">Blocked</option>
                    </Select>
                  </InputWrapper>
                </TwoCol>
              </LeftPane>

              {/* ════════════════ RIGHT PANE — Tabs ════════════════ */}
              <RightPane>
                <TabContainer>
                  {[
                    { key: "services", label: "Services", count: roomServices.length },
                    { key: "beds", label: "Bed", count: roomBeds.length },
                    { key: "kits", label: "Room Kit Items", count: roomKits.length },
                  ].map(({ key, label, count }) => (
                    <TabButton key={key} type="button" active={activeTab === key} onClick={() => setActiveTab(key)}>
                      {label} ({count})
                    </TabButton>
                  ))}
                </TabContainer>

                {/* ── Services Tab ── */}
                {activeTab === "services" && (
                  <TabPanel>
                    <InputWrapper style={{ marginBottom: 10 }}>
                      <Label required>Description</Label>
                      <SearchableDropdown
                        apiEndpoint="roomservice-description/"
                        value={serviceForm.description}
                        onChange={(val) => setServiceForm((p) => ({ ...p, description: val }))}
                        placeholder="Search service…"
                        labelField="description"
                        valueField="description"
                      />
                    </InputWrapper>

                    <TwoCol style={{ marginBottom: 10 }}>
                      <InputWrapper>
                        <Label>Priority</Label>
                        <Input
                          type="number" value={serviceForm.priority}
                          onChange={(e) => setServiceForm((p) => ({ ...p, priority: e.target.value }))}
                          placeholder="Priority"
                        />
                      </InputWrapper>
                      <InputWrapper>
                        <Label>Amount</Label>
                        <Input
                          type="number" value={serviceForm.amount}
                          onChange={(e) => setServiceForm((p) => ({ ...p, amount: e.target.value }))}
                          placeholder="0.00" step="0.01"
                        />
                      </InputWrapper>
                    </TwoCol>

                    <ButtonContainer
                      style={{ justifyContent: "flex-end", marginTop: 0, paddingTop: 10, borderTop: `1px solid ${colors.border}` }}
                    >
                      {editingServiceIdx !== null && (
                        <SmallBtn
                          secondary type="button"
                          onClick={() => { setEditingServiceIdx(null); setServiceForm(defaultService); }}
                        >
                          ✕ Cancel
                        </SmallBtn>
                      )}
                      <SmallBtn type="button" onClick={addService}>
                        {editingServiceIdx !== null ? "✓ Update" : "+ Add"}
                      </SmallBtn>
                    </ButtonContainer>

                    <TableWrapper style={{ marginTop: 10 }}>
                      <Table>
                        <thead>
                          <Tr><Th>Description</Th><Th>Amount</Th><Th>Priority</Th><Th>Action</Th></Tr>
                        </thead>
                        <tbody>
                          {roomServices.length === 0
                            ? <Tr><Td colSpan="4" style={{ textAlign: "center", color: "#9ca3af" }}>No data available in table</Td></Tr>
                            : roomServices.map((svc, i) => (
                              <Tr key={i} style={{ background: editingServiceIdx === i ? "#f0fdf4" : "" }}>
                                <Td>{svc.description}</Td>
                                <Td>{svc.amount}</Td>
                                <Td>{svc.priority || "—"}</Td>
                                <Td>
                                  <ActionCell>
                                    <SmallBtn type="button" onClick={() => editService(i)}>Edit</SmallBtn>
                                    <SmallBtn danger type="button" onClick={() => removeService(i)}>Delete</SmallBtn>
                                  </ActionCell>
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
                    {roomBeds.length === 0 ? (
                      <p style={{ color: "#9ca3af", textAlign: "center", marginTop: 40 }}>
                        Set a capacity in Room Details to auto-generate beds.
                      </p>
                    ) : (
                      <TableWrapper>
                        <Table>
                          <thead>
                            <Tr>
                              <Th>#</Th>
                              <Th>Bed Number</Th>
                              <Th>Blocked</Th>
                              <Th>Blocking Reason</Th>
                            </Tr>
                          </thead>
                          <tbody>
                            {roomBeds.map((bed, i) => (
                              <Tr key={i}>
                                <Td style={{ color: colors.textMuted, fontSize: "0.82rem" }}>{i + 1}</Td>
                                <Td>
                                  <Input
                                    value={bed.bed_number}
                                    onChange={(e) => updateBed(i, "bed_number", e.target.value)}
                                    placeholder={`B-${String(i + 1).padStart(2, "0")}`}
                                    style={{ padding: "5px 8px", fontSize: "0.84rem" }}
                                  />
                                </Td>
                                <Td>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <ToggleSwitch
                                      type="button"
                                      on={bed.blocked}
                                      onClick={() => updateBed(i, "blocked", !bed.blocked)}
                                    />
                                    <StatusBadge color={bed.blocked ? colors.danger : colors.textMuted}>
                                      {bed.blocked ? "Yes" : "No"}
                                    </StatusBadge>
                                  </div>
                                </Td>
                                <Td>
                                  {bed.blocked ? (
                                    <Input
                                      value={bed.blocked_reason}
                                      onChange={(e) => updateBed(i, "blocked_reason", e.target.value)}
                                      placeholder="Reason for blocking"
                                      style={{ padding: "5px 8px", fontSize: "0.84rem" }}
                                    />
                                  ) : (
                                    <span style={{ color: "#d1d5db", fontSize: "0.82rem" }}>—</span>
                                  )}
                                </Td>
                              </Tr>
                            ))}
                          </tbody>
                        </Table>
                      </TableWrapper>
                    )}
                  </TabPanel>
                )}

                {/* ── Room Kit Items Tab ── */}
                {activeTab === "kits" && (
                  <TabPanel>
                    <SubFormGrid>
                      <InputWrapper>
                        <Label>Kit Item</Label>
                        <SearchableDropdown
                          apiEndpoint="room-kititems/"
                          value={kitForm.kit_item}
                          onChange={(val) => setKitForm((p) => ({ ...p, kit_item: val }))}
                          placeholder="Search kit item…"
                          labelField="name"
                          valueField="name"
                        />
                      </InputWrapper>
                      <InputWrapper>
                        <Label>Priority</Label>
                        <Input
                          type="number" value={kitForm.priority}
                          onChange={(e) => setKitForm((p) => ({ ...p, priority: e.target.value }))}
                          placeholder="Priority"
                        />
                      </InputWrapper>
                      <InputWrapper>
                        <Label>Amount</Label>
                        <Input
                          type="number" value={kitForm.amount}
                          onChange={(e) => setKitForm((p) => ({ ...p, amount: e.target.value }))}
                          placeholder="0.00" step="0.01"
                        />
                      </InputWrapper>
                    </SubFormGrid>

                    <ButtonContainer
                      style={{ justifyContent: "flex-end", marginTop: 0, paddingTop: 10, borderTop: `1px solid ${colors.border}` }}
                    >
                      {editingKitIdx !== null && (
                        <SmallBtn
                          secondary type="button"
                          onClick={() => { setEditingKitIdx(null); setKitForm(defaultKit); }}
                        >
                          ✕ Cancel
                        </SmallBtn>
                      )}
                      <SmallBtn type="button" onClick={addKit}>
                        {editingKitIdx !== null ? "✓ Update" : "+ Add"}
                      </SmallBtn>
                    </ButtonContainer>

                    <TableWrapper style={{ marginTop: 10 }}>
                      <Table>
                        <thead>
                          <Tr><Th>Kit Item</Th><Th>Priority</Th><Th>Amount</Th><Th>Action</Th></Tr>
                        </thead>
                        <tbody>
                          {roomKits.length === 0
                            ? <Tr><Td colSpan="4" style={{ textAlign: "center", color: "#9ca3af" }}>No data available</Td></Tr>
                            : roomKits.map((k, i) => (
                              <Tr key={i} style={{ background: editingKitIdx === i ? "#f0fdf4" : "" }}>
                                <Td>{getKitLabel(k)}</Td>
                                <Td>{k.priority || "—"}</Td>
                                <Td>{k.amount || "—"}</Td>
                                <Td>
                                  <ActionCell>
                                    <SmallBtn type="button" onClick={() => editKit(i)}>Edit</SmallBtn>
                                    <SmallBtn danger type="button" onClick={() => removeKit(i)}>Delete</SmallBtn>
                                  </ActionCell>
                                </Td>
                              </Tr>
                            ))}
                        </tbody>
                      </Table>
                    </TableWrapper>
                  </TabPanel>
                )}
              </RightPane>
            </PageLayout>

            {/* Form Actions */}
            <ButtonContainer style={{ marginTop: 20 }}>
              <Button secondary type="button" onClick={handleReset}>✕ Cancel</Button>
              <Button type="submit">{editingId ? "💾 Update Room" : "💾 Save"}</Button>
            </ButtonContainer>
          </form>
        </FormContent>

        {/* ── Room List ── */}
        <div style={{ padding: "0 24px 32px" }}>
          <SectionHeader style={{ padding: 0, marginTop: 0, marginBottom: 14 }}>
            <h3>Room List</h3>
          </SectionHeader>
          <TableWrapper>
            <Table>
              <thead>
                <Tr>
                  <Th>Room No</Th><Th>Description</Th><Th>Block</Th><Th>Category</Th>
                  <Th>Nursing Station</Th><Th>Capacity</Th><Th>Status</Th><Th>Actions</Th>
                </Tr>
              </thead>
              <tbody>
                {rooms.length === 0
                  ? <Tr><Td colSpan="8" style={{ textAlign: "center", color: "#9ca3af" }}>No rooms found</Td></Tr>
                  : rooms.map((r) => (
                    <Tr key={r.id || r.room_number}>
                      <Td style={{ fontWeight: 600 }}>{r.room_number}</Td>
                      <Td>{r.description || "—"}</Td>
                      <Td>{r.block}</Td>
                      <Td>{r.room_category}</Td>
                      <Td>{r.nursing_station || "—"}</Td>
                      <Td>{r.capacity}</Td>
                      <Td>
                        <StatusBadge
                          color={
                            r.room_status === "Available"
                              ? colors.success
                              : r.room_status === "Blocked"
                              ? colors.danger
                              : colors.secondary
                          }
                        >
                          {r.room_status || "Available"}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <ActionCell>
                          <SmallBtn type="button" onClick={() => handleEdit(r)}>Edit</SmallBtn>
                          <SmallBtn danger type="button" onClick={() => handleDelete(r.room_number)}>Delete</SmallBtn>
                        </ActionCell>
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