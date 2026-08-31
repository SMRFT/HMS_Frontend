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

// ─── Local Styled Components ──────────────────────────────────────────────────
const PageHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  padding: 11px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px 6px 0 0;
  margin-bottom: 16px;
`;

const PageTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: .04em;
`;

const TabContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  border-bottom: 2px solid ${colors.border};
  background: ${colors.background};
`;

const TabButton = styled.button`
  padding: 9px 18px;
  background: ${(p) => (p.active ? "#fff" : colors.background)};
  border: 1px solid ${(p) => (p.active ? colors.border : "transparent")};
  border-bottom: ${(p) => (p.active ? "2px solid #fff" : `1px solid ${colors.border}`)};
  margin-bottom: ${(p) => (p.active ? "-2px" : "0")};
  cursor: pointer;
  font-weight: ${(p) => (p.active ? "700" : "500")};
  color: ${(p) => (p.active ? colors.primary : colors.textMuted)};
  font-size: 0.86rem;
  outline: none;
  transition: all 0.2s;
  white-space: nowrap;
  &:hover { background: #fff; color: ${colors.primary}; }
`;

const TabPanel = styled.div`
  border: 1px solid ${colors.border};
  border-top: none;
  padding: 12px;
  background: #fff;
  border-radius: 0 0 8px 8px;
  min-height: 260px;
`;

const ToggleSwitch = styled.button`
  width: 38px;
  height: 20px;
  border-radius: 10px;
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
    left: ${(p) => (p.on ? "20px" : "2px")};
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.3s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
`;

/* ── Main layout ── */
const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const LeftPane = styled.div`
  border-right: 1px solid ${colors.border};
  padding-right: 20px;

  @media (max-width: 960px) {
    border-right: none;
    padding-right: 0;
    border-bottom: 1px solid ${colors.border};
    padding-bottom: 16px;
  }
`;

const RightPane = styled.div`
  min-width: 0;
`;

/* Compact 3-column grid */
const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 12px;
  margin-bottom: 8px;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

/* 2-column grid */
const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  margin-bottom: 8px;

  @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

/* Sub-grid for kits form */
const SubFormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  align-items: end;
  margin-bottom: 8px;

  @media (max-width: 560px) { grid-template-columns: 1fr 1fr; }
`;

const PanelTitle = styled.h4`
  color: ${colors.primary};
  margin: 0 0 10px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const StatusBadge = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${(p) => p.color || colors.textMain};
`;

const ActionCell = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const SmallBtn = styled(Button)`
  padding: 3px 9px;
  font-size: 0.78rem;
`;

/* Compact overrides */
const CInputWrapper = styled(InputWrapper)`margin-bottom: 0;`;
const CLabel = styled(Label)`font-size: 0.78rem; margin-bottom: 3px;`;
const CInput = styled(Input)`padding: 6px 9px; font-size: 0.85rem; height: 32px;`;
const CSelect = styled(Select)`padding: 6px 9px; font-size: 0.85rem; height: 32px;`;

// ─── Searchable Dropdown ──────────────────────────────────────────────────────

const DropWrapper = styled.div`position: relative;`;

const DropBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  background: #fff;
  height: 32px;
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
  max-height: 180px;
  overflow-y: auto;
  z-index: 999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const DropItem = styled.div`
  padding: 7px 10px;
  cursor: pointer;
  font-size: 0.84rem;
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
    const cached = options.find((o) => String(o[valueField]) === String(value));
    if (cached) { setDisplayLabel(cached[labelField]); return; }
    apiRequest(`${HmsBaseUrl}${apiEndpoint}`, "GET")
      .then((res) => {
        const all = Array.isArray(res) ? res
          : Array.isArray(res?.data) ? res.data
          : Array.isArray(res?.results) ? res.results : [];
        const found = all.find((o) => String(o[valueField]) === String(value));
        if (found) setDisplayLabel(found[labelField]);
      }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const fetchOptions = async (search = "") => {
    setLoading(true);
    try {
      const url = search
        ? `${HmsBaseUrl}${apiEndpoint}?search=${encodeURIComponent(search)}`
        : `${HmsBaseUrl}${apiEndpoint}`;
      const res = await apiRequest(url, "GET");
      const list = Array.isArray(res) ? res
        : Array.isArray(res?.data) ? res.data
        : Array.isArray(res?.results) ? res.results : [];
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
          style={{ flex: 1, padding: "0 9px", border: "none", outline: "none", fontSize: "0.85rem", minWidth: 0, background: "transparent", height: "100%" }}
        />
        <span onClick={() => { setOpen((p) => !p); if (!open) fetchOptions(query); }}
          style={{ padding: "0 8px", cursor: "pointer", color: colors.textMuted, fontSize: "0.65rem", userSelect: "none", flexShrink: 0 }}>▼</span>
        {(displayLabel || value) && (
          <span onClick={(e) => { e.stopPropagation(); setDisplayLabel(""); setQuery(""); setOpen(false); onChange(""); }}
            style={{ padding: "0 7px", cursor: "pointer", color: "#9ca3af", fontSize: "0.82rem", userSelect: "none", flexShrink: 0 }}>✕</span>
        )}
      </DropBox>
      {open && (
        <DropList>
          {loading
            ? <DropItem style={{ color: "#9ca3af", cursor: "default" }}>Loading…</DropItem>
            : options.length === 0
              ? <DropItem style={{ color: "#9ca3af", cursor: "default" }}>No results</DropItem>
              : options.map((opt, i) => (
                <DropItem key={opt[valueField] ?? i}
                  selected={String(opt[valueField]) === String(value)}
                  onMouseDown={() => { setDisplayLabel(opt[labelField]); setQuery(""); setOpen(false); onChange(opt[valueField]); }}>
                  {opt[labelField]}
                </DropItem>
              ))}
        </DropList>
      )}
    </DropWrapper>
  );
};

// ─── Bed helpers ──────────────────────────────────────────────────────────────
const makeBed = (index) => ({ bed_number: String(index + 1), blocked: false, blocked_reason: "" });

const generateBeds = (capacity, existingBeds = []) => {
  const count = parseInt(capacity, 10);
  if (!count || count < 1) return [];
  return Array.from({ length: count }, (_, i) =>
    existingBeds[i] ? { ...existingBeds[i] } : makeBed(i)
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Room = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [nursingStations, setNursingStations] = useState([]);
  const [activeTab, setActiveTab] = useState("services");
  const [editingId, setEditingId] = useState(null);

  const defaultRoomForm = {
    room_number: "", description: "", room_category: "", block: "",
    phone_extension: "", nursing_station: "", capacity: "1", room_status: "Available",
  };
  const [roomForm, setRoomForm] = useState(defaultRoomForm);

  // Services — start EMPTY
  const defaultService = { description: "", priority: "", amount: "" };
  const [serviceForm, setServiceForm] = useState(defaultService);
  const [roomServices, setRoomServices] = useState([]);
  const [editingServiceIdx, setEditingServiceIdx] = useState(null);

  // Beds — 1 bed to match default capacity of 1
  const [roomBeds, setRoomBeds] = useState([makeBed(0)]);

  // Kits — start EMPTY
  const defaultKit = { kit_item: "", priority: "", amount: "" };
  const [kitForm, setKitForm] = useState(defaultKit);
  const [roomKits, setRoomKits] = useState([]);
  const [editingKitIdx, setEditingKitIdx] = useState(null);

  useEffect(() => {
    fetchRooms(); fetchBlocks(); fetchCategories(); fetchNursingStations();
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
      const list = Array.isArray(res) ? res
        : Array.isArray(res?.data) ? res.data
        : Array.isArray(res?.results) ? res.results : [];
      setNursingStations(list.filter((n) => n.is_active !== false));
    } catch { /* optional */ }
  };

  const handleRoomChange = (e) => {
    const { name, value } = e.target;
    if (name === "capacity") {
      const clamped = Math.max(1, parseInt(value, 10) || 1);
      setRoomBeds(generateBeds(clamped, roomBeds));
      setRoomForm((p) => ({ ...p, [name]: String(clamped) }));
      return;
    }
    setRoomForm((p) => ({ ...p, [name]: value }));
  };

  const handleReset = () => {
    setEditingId(null);
    setRoomForm(defaultRoomForm);
    setRoomServices([]);
    setRoomBeds([makeBed(0)]);
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
    const existing = (room.beds || []).map((b) => ({
      bed_number: b.bed_number || "",
      blocked: b.blocked || false,
      blocked_reason: b.blocked_reason || "",
    }));
    setRoomBeds(generateBeds(parseInt(room.capacity || 1, 10), existing));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomForm.room_number.trim()) return toast.warning("Room number is required");
    if (!roomForm.block) return toast.warning("Please select a block");
    if (!roomForm.room_category) return toast.warning("Please select a room category");

    const bedsPayload = roomBeds.map((b) => ({ ...b, bed_status: b.blocked ? "Blocked" : "Available" }));
    const occupancy = bedsPayload.filter((b) => b.bed_status === "Available").length;
    const payload = { ...roomForm, occupancy, services: roomServices, beds: bedsPayload, room_kits: roomKits };

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

  // Services
  const addService = () => {
    if (!serviceForm.description) return toast.warning("Please select a service");
    if (!serviceForm.amount) return toast.warning("Please enter amount");
    if (editingServiceIdx !== null) {
      const u = [...roomServices]; u[editingServiceIdx] = { ...serviceForm };
      setRoomServices(u); setEditingServiceIdx(null); toast.success("Service updated");
    } else {
      setRoomServices([...roomServices, { ...serviceForm }]); toast.success("Service added");
    }
    setServiceForm(defaultService);
  };
  const editService = (i) => { setServiceForm({ ...roomServices[i] }); setEditingServiceIdx(i); };
  const removeService = (i) => {
    if (!window.confirm("Remove service?")) return;
    setRoomServices(roomServices.filter((_, idx) => idx !== i));
    if (editingServiceIdx === i) { setEditingServiceIdx(null); setServiceForm(defaultService); }
    toast.info("Removed");
  };

  // Beds
  const updateBed = (idx, field, val) => {
    setRoomBeds((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      if (field === "blocked" && !val) updated[idx].blocked_reason = "";
      return updated;
    });
  };
  const removeBed = (idx) => {
    if (!window.confirm("Remove this bed?")) return;
    setRoomBeds((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      const newCap = Math.max(1, updated.length);
      setRoomForm((f) => ({ ...f, capacity: String(newCap) }));
      return updated.length ? updated : [makeBed(0)];
    });
  };

  // Kits
  const addKit = () => {
    if (!kitForm.kit_item) return toast.warning("Please select kit item");
    if (!kitForm.amount) return toast.warning("Please enter amount");
    if (editingKitIdx !== null) {
      const u = [...roomKits]; u[editingKitIdx] = { ...kitForm };
      setRoomKits(u); setEditingKitIdx(null); toast.success("Kit updated");
    } else {
      setRoomKits([...roomKits, { ...kitForm }]); toast.success("Kit added");
    }
    setKitForm(defaultKit);
  };
  const editKit = (i) => { setEditingKitIdx(i); setKitForm({ ...roomKits[i] }); };
  const removeKit = (i) => {
    if (!window.confirm("Remove kit?")) return;
    setRoomKits(roomKits.filter((_, idx) => idx !== i));
    if (editingKitIdx === i) { setEditingKitIdx(null); setKitForm(defaultKit); }
    toast.info("Removed");
  };
  const getKitLabel = (k) =>
    typeof k.kit_item === "object" && k.kit_item?.name ? k.kit_item.name : k.kit_item || "—";

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>
        <PageHeader>
          <PageTitle>🏥 Room Management</PageTitle>
        </PageHeader>

        <FormContent style={{ paddingTop: 12 }}>
          <form onSubmit={handleSubmit}>
            <PageLayout>

              {/* ════ LEFT PANE ════ */}
              <LeftPane>
                <PanelTitle>Room Details</PanelTitle>

                <FieldGrid>
                  <CInputWrapper>
                    <CLabel required>Room Number</CLabel>
                    <CInput type="text" name="room_number" value={roomForm.room_number}
                      onChange={handleRoomChange} placeholder="e.g. R-101" required />
                  </CInputWrapper>

                  <CInputWrapper>
                    <CLabel>Description</CLabel>
                    <CInput type="text" name="description" value={roomForm.description}
                      onChange={handleRoomChange} placeholder="Room description" />
                  </CInputWrapper>

                  <CInputWrapper>
                    <CLabel required>Room Category</CLabel>
                    <CSelect name="room_category" value={roomForm.room_category}
                      onChange={handleRoomChange} required>
                      <option value="">--Select--</option>
                      {categories.map((c) => (
                        <option key={c.room_category_id} value={c.name}>{c.name}</option>
                      ))}
                    </CSelect>
                  </CInputWrapper>
                </FieldGrid>

                <FieldGrid>
                  <CInputWrapper>
                    <CLabel required>Block</CLabel>
                    <CSelect name="block" value={roomForm.block}
                      onChange={handleRoomChange} required>
                      <option value="">--Select--</option>
                      {blocks.map((b) => (
                        <option key={b.block_id} value={b.block_name}>{b.block_name}</option>
                      ))}
                    </CSelect>
                  </CInputWrapper>

                  <CInputWrapper>
                    <CLabel>Phone Extension</CLabel>
                    <CInput type="text" name="phone_extension" value={roomForm.phone_extension}
                      onChange={handleRoomChange} placeholder="e.g. 1234" />
                  </CInputWrapper>

                  <CInputWrapper>
                    <CLabel>Nursing Station</CLabel>
                    <CSelect name="nursing_station" value={roomForm.nursing_station}
                      onChange={handleRoomChange}>
                      <option value="">--Select--</option>
                      {nursingStations.map((b) => (
                        <option key={b.ward_id} value={b.ward_name}>{b.ward_name}</option>
                      ))}
                    </CSelect>
                  </CInputWrapper>
                </FieldGrid>

                <TwoCol>
                  <CInputWrapper>
                    <CLabel required>Capacity</CLabel>
                    <CInput type="number" name="capacity" value={roomForm.capacity}
                      onChange={handleRoomChange} min="1" />
                  </CInputWrapper>

                  <CInputWrapper>
                    <CLabel>Room Status</CLabel>
                    <CSelect name="room_status" value={roomForm.room_status} onChange={handleRoomChange}>
                      <option value="Available">Available</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Blocked">Blocked</option>
                    </CSelect>
                  </CInputWrapper>
                </TwoCol>

                {/* Actions placed right below the form fields */}
                <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${colors.border}` }}>
                  <Button secondary type="button" onClick={handleReset}
                    style={{ padding: "6px 16px", fontSize: "0.82rem" }}>
                    ✕ Cancel
                  </Button>
                  <Button type="submit" style={{ padding: "6px 16px", fontSize: "0.82rem" }}>
                    {editingId ? "💾 Update Room" : "💾 Save"}
                  </Button>
                </div>
              </LeftPane>

              {/* ════ RIGHT PANE ════ */}
              <RightPane>
                <TabContainer>
                  {[
                    { key: "services", label: "Services", count: roomServices.length },
                    { key: "beds",     label: "Bed",      count: roomBeds.length },
                    { key: "kits",     label: "Room Kit Items", count: roomKits.length },
                  ].map(({ key, label, count }) => (
                    <TabButton key={key} type="button" active={activeTab === key}
                      onClick={() => setActiveTab(key)}>
                      {label} ({count})
                    </TabButton>
                  ))}
                </TabContainer>

                {/* Services Tab */}
                {activeTab === "services" && (
                  <TabPanel>
                    <CInputWrapper style={{ marginBottom: 8 }}>
                      <CLabel required>Description</CLabel>
                      <SearchableDropdown
                        apiEndpoint="roomservice-description/"
                        value={serviceForm.description}
                        onChange={(val) => setServiceForm((p) => ({ ...p, description: val }))}
                        placeholder="Search description…"
                        labelField="description_name"
                        valueField="description_name"
                      />
                    </CInputWrapper>

                    <TwoCol style={{ marginBottom: 8 }}>
                      <CInputWrapper>
                        <CLabel>Priority</CLabel>
                        <CInput type="number" value={serviceForm.priority}
                          onChange={(e) => setServiceForm((p) => ({ ...p, priority: e.target.value }))}
                          placeholder="Priority" />
                      </CInputWrapper>
                      <CInputWrapper>
                        <CLabel>Amount</CLabel>
                        <CInput type="number" value={serviceForm.amount}
                          onChange={(e) => setServiceForm((p) => ({ ...p, amount: e.target.value }))}
                          placeholder="0.00" step="0.01" />
                      </CInputWrapper>
                    </TwoCol>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6,
                      paddingTop: 8, borderTop: `1px solid ${colors.border}`, marginBottom: 10 }}>
                      {editingServiceIdx !== null && (
                        <SmallBtn secondary type="button"
                          onClick={() => { setEditingServiceIdx(null); setServiceForm(defaultService); }}>
                          ✕ Cancel
                        </SmallBtn>
                      )}
                      <SmallBtn type="button" onClick={addService}>
                        {editingServiceIdx !== null ? "✓ Update" : "+ Add"}
                      </SmallBtn>
                    </div>

                    <TableWrapper>
                      <Table>
                        <thead>
                          <Tr><Th>Description</Th><Th>Amount</Th><Th>Priority</Th><Th>Action</Th></Tr>
                        </thead>
                        <tbody>
                          {roomServices.length === 0 ? (
                            <Tr><Td colSpan="4" style={{ textAlign: "center", color: "#9ca3af", padding: "20px 0", fontSize: "0.82rem" }}>
                              No services added yet
                            </Td></Tr>
                          ) : roomServices.map((svc, i) => (
                            <Tr key={i} style={{ background: editingServiceIdx === i ? "#f0fdf4" : "" }}>
                              <Td style={{ fontSize: "0.82rem" }}>{svc.description || "—"}</Td>
                              <Td style={{ fontSize: "0.82rem" }}>{svc.amount || "—"}</Td>
                              <Td style={{ fontSize: "0.82rem" }}>{svc.priority || "—"}</Td>
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

                {/* Beds Tab */}
                {activeTab === "beds" && (
                  <TabPanel>
                    <TableWrapper>
                      <Table>
                        <thead>
                          <Tr>
                            <Th style={{ width: 30 }}>#</Th>
                            <Th>Bed No.</Th>
                            <Th style={{ width: 90 }}>Blocked</Th>
                            <Th>Reason</Th>
                            <Th style={{ width: 44 }}>Del</Th>
                          </Tr>
                        </thead>
                        <tbody>
                          {roomBeds.map((bed, i) => (
                            <Tr key={i}>
                              <Td style={{ color: colors.textMuted, fontSize: "0.78rem" }}>{i + 1}</Td>
                              <Td>
                                <CInput value={bed.bed_number}
                                  onChange={(e) => updateBed(i, "bed_number", e.target.value)}
                                  placeholder={`B-${String(i + 1).padStart(2, "0")}`}
                                  style={{ width: "100%", padding: "4px 7px", fontSize: "0.82rem", height: 28 }} />
                              </Td>
                              <Td>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                  <ToggleSwitch type="button" on={bed.blocked}
                                    onClick={() => updateBed(i, "blocked", !bed.blocked)} />
                                  <StatusBadge color={bed.blocked ? colors.danger : colors.textMuted}
                                    style={{ fontSize: "0.76rem" }}>
                                    {bed.blocked ? "Yes" : "No"}
                                  </StatusBadge>
                                </div>
                              </Td>
                              <Td>
                                {bed.blocked ? (
                                  <CInput value={bed.blocked_reason}
                                    onChange={(e) => updateBed(i, "blocked_reason", e.target.value)}
                                    placeholder="Reason…"
                                    style={{ width: "100%", padding: "4px 7px", fontSize: "0.82rem", height: 28 }} />
                                ) : (
                                  <span style={{ color: "#d1d5db", fontSize: "0.78rem" }}>—</span>
                                )}
                              </Td>
                              <Td>
                                <SmallBtn danger type="button" onClick={() => removeBed(i)}
                                  style={{ padding: "2px 7px", fontSize: "0.75rem" }}>✕</SmallBtn>
                              </Td>
                            </Tr>
                          ))}
                        </tbody>
                      </Table>
                    </TableWrapper>
                  </TabPanel>
                )}

                {/* Room Kit Items Tab */}
                {activeTab === "kits" && (
                  <TabPanel>
                    <SubFormGrid>
                      <CInputWrapper>
                        <CLabel>Kit Item</CLabel>
                        <SearchableDropdown
                          apiEndpoint="room-kititems/"
                          value={kitForm.kit_item}
                          onChange={(val) => setKitForm((p) => ({ ...p, kit_item: val }))}
                          placeholder="Search kit…"
                          labelField="kit_name"
                          valueField="kit_name"
                        />
                      </CInputWrapper>
                      <CInputWrapper>
                        <CLabel>Priority</CLabel>
                        <CInput type="number" value={kitForm.priority}
                          onChange={(e) => setKitForm((p) => ({ ...p, priority: e.target.value }))}
                          placeholder="Priority" />
                      </CInputWrapper>
                      <CInputWrapper>
                        <CLabel>Amount</CLabel>
                        <CInput type="number" value={kitForm.amount}
                          onChange={(e) => setKitForm((p) => ({ ...p, amount: e.target.value }))}
                          placeholder="0.00" step="0.01" />
                      </CInputWrapper>
                    </SubFormGrid>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6,
                      paddingTop: 8, borderTop: `1px solid ${colors.border}`, marginBottom: 10 }}>
                      {editingKitIdx !== null && (
                        <SmallBtn secondary type="button"
                          onClick={() => { setEditingKitIdx(null); setKitForm(defaultKit); }}>
                          ✕ Cancel
                        </SmallBtn>
                      )}
                      <SmallBtn type="button" onClick={addKit}>
                        {editingKitIdx !== null ? "✓ Update" : "+ Add"}
                      </SmallBtn>
                    </div>

                    <TableWrapper>
                      <Table>
                        <thead>
                          <Tr><Th>Kit Item</Th><Th>Priority</Th><Th>Amount</Th><Th>Action</Th></Tr>
                        </thead>
                        <tbody>
                          {roomKits.length === 0 ? (
                            <Tr><Td colSpan="4" style={{ textAlign: "center", color: "#9ca3af", padding: "20px 0", fontSize: "0.82rem" }}>
                              No kit items added yet
                            </Td></Tr>
                          ) : roomKits.map((k, i) => (
                            <Tr key={i} style={{ background: editingKitIdx === i ? "#f0fdf4" : "" }}>
                              <Td style={{ fontSize: "0.82rem" }}>{getKitLabel(k) || "—"}</Td>
                              <Td style={{ fontSize: "0.82rem" }}>{k.priority || "—"}</Td>
                              <Td style={{ fontSize: "0.82rem" }}>{k.amount || "—"}</Td>
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
          </form>
        </FormContent>

        {/* ── Room List ── */}
        <div style={{ padding: "0 20px 28px" }}>
          <SectionHeader style={{ padding: 0, marginTop: 4, marginBottom: 12 }}>
            <h3 style={{ fontSize: "0.95rem" }}>Room List</h3>
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
                {rooms.length === 0 ? (
                  <Tr><Td colSpan="8" style={{ textAlign: "center", color: "#9ca3af" }}>No rooms found</Td></Tr>
                ) : rooms.map((r) => (
                  <Tr key={r.id || r.room_number}>
                    <Td style={{ fontWeight: 600, fontSize: "0.82rem" }}>{r.room_number}</Td>
                    <Td style={{ fontSize: "0.82rem" }}>{r.description || "—"}</Td>
                    <Td style={{ fontSize: "0.82rem" }}>{r.block}</Td>
                    <Td style={{ fontSize: "0.82rem" }}>{r.room_category}</Td>
                    <Td style={{ fontSize: "0.82rem" }}>{r.nursing_station || "—"}</Td>
                    <Td style={{ fontSize: "0.82rem" }}>{r.capacity}</Td>
                    <Td>
                      <StatusBadge color={
                        r.room_status === "Available" ? colors.success
                          : r.room_status === "Blocked" ? colors.danger
                          : colors.secondary
                      }>
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