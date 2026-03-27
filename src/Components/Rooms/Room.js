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

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 28px;
  border-radius: 10px;
  width: 100%;
  max-width: 440px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
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

  @media (max-width: 1100px) {
    grid-template-columns: 3fr 2fr;
  }
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

const FullRow = styled.div`margin-bottom: 12px;`;

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

const CheckboxRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
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

const ReadOnlyInput = styled(Input)`
  background: #f1f5f9 !important;
  color: ${colors.textMuted};
  cursor: not-allowed;
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

  const fetch = async (search = "") => {
    setLoading(true);
    try {
      const url = search ? `${HmsBaseUrl}${apiEndpoint}?search=${encodeURIComponent(search)}` : `${HmsBaseUrl}${apiEndpoint}`;
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
            debRef.current = setTimeout(() => fetch(e.target.value), 300);
          }}
          onFocus={() => { setOpen(true); if (!options.length) fetch(""); }}
          placeholder={placeholder}
          style={{ flex: 1, padding: "9px 10px", border: "none", outline: "none", fontSize: "0.88rem", minWidth: 0 }}
        />
        <span onClick={() => { setOpen((p) => !p); if (!open) fetch(query); }}
          style={{ padding: "0 9px", cursor: "pointer", color: colors.textMuted, fontSize: "0.68rem", userSelect: "none", flexShrink: 0 }}>▼</span>
        {(displayLabel || value) && (
          <span onClick={(e) => { e.stopPropagation(); setDisplayLabel(""); setQuery(""); setOpen(false); onChange(""); }}
            style={{ padding: "0 8px", cursor: "pointer", color: "#9ca3af", fontSize: "0.85rem", userSelect: "none", flexShrink: 0 }}>✕</span>
        )}
      </DropBox>
      {open && (
        <DropList>
          {loading
            ? <DropItem style={{ color: "#9ca3af", cursor: "default" }}>Loading…</DropItem>
            : options.length === 0
              ? <DropItem style={{ color: "#9ca3af", cursor: "default" }}>No results</DropItem>
              : options.map((opt, i) => (
                <DropItem key={opt[valueField] || i} selected={opt[valueField] === value}
                  onMouseDown={() => { setDisplayLabel(opt[labelField]); setQuery(""); setOpen(false); onChange(opt[valueField]); }}>
                  {opt[labelField]}
                </DropItem>
              ))}
        </DropList>
      )}
    </DropWrapper>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Room = () => {
  const navigate = useNavigate();

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [serviceTaxes, setServiceTaxes] = useState([]);
  const [activeTab, setActiveTab] = useState("services");
  const [editingId, setEditingId] = useState(null);

  const defaultRoomForm = {
    room_number: "", description: "", room_category: "", block: "",
    floor: "", phone_extension: "", nursing_station: "", capacity: "1",
    admission_fee: "", room_advance: "", room_type: "WARD",
    room_blocked: false, blocked_reason: "",
    include_in_final_bill: true, enable_luxury_tax: false,
  };
  const [roomForm, setRoomForm] = useState(defaultRoomForm);

  const defaultService = {
    description: "", priority: "", amount: "", service_tax: "",
    tax_inclusive: false, chargeable_for_bystander: false,
    chargeable_for_booking: false, enable_this_service: true, doctors_fee: false,
  };
  const [serviceForm, setServiceForm] = useState(defaultService);
  const [roomServices, setRoomServices] = useState([]);
  const [editingServiceIdx, setEditingServiceIdx] = useState(null);

  const defaultBed = { bed_number: "", bed_status: "Available", blocked: false, blocked_reason: "" };
  const [bedForm, setBedForm] = useState(defaultBed);
  const [roomBeds, setRoomBeds] = useState([]);
  const [editingBedIdx, setEditingBedIdx] = useState(null);

  const defaultKit = { kit_item: "", priority: "", amount: "", enable_item: true };
  const [kitForm, setKitForm] = useState(defaultKit);
  const [roomKits, setRoomKits] = useState([]);
  const [editingKitIdx, setEditingKitIdx] = useState(null);

  const [newBlockName, setNewBlockName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  // Computed fields
  const computedOccupancy = roomBeds.filter((b) => b.bed_status === "Occupied").length;
  const computedStatus = roomForm.room_blocked ? "Blocked" : roomBeds.some((b) => b.bed_status === "Occupied") ? "Occupied" : "Available";

  useEffect(() => { fetchRooms(); fetchBlocks(); fetchCategories(); fetchServiceTaxes(); }, []);

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
  const fetchServiceTaxes = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}service-tax/`, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setServiceTaxes(list.filter((t) => t.is_active !== false));
    } catch { /* optional */ }
  };

  const handleRoomChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoomForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleReset = () => {
    setEditingId(null); setRoomForm(defaultRoomForm);
    setRoomServices([]); setRoomBeds([]); setRoomKits([]);
    setActiveTab("services");
  };

  const handleEdit = (room) => {
    setEditingId(room.room_number);
    setRoomForm({
      room_number: room.room_number || "", description: room.description || "",
      room_category: room.room_category || "", block: room.block || "",
      floor: room.floor || "", phone_extension: room.phone_extension || "",
      nursing_station: room.nursing_station || "", capacity: room.capacity || "1",
      admission_fee: room.admission_fee || "", room_advance: room.room_advance || "",
      room_type: room.room_type || "WARD", room_blocked: room.room_blocked || false,
      blocked_reason: room.blocked_reason || "",
      include_in_final_bill: room.include_in_final_bill ?? true,
      enable_luxury_tax: room.enable_luxury_tax || false,
    });
    setRoomServices(room.services || []);
    setRoomBeds(room.beds || []);
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
    if (!roomForm.floor) return toast.warning("Floor is required");
    if (roomForm.room_blocked && !roomForm.blocked_reason.trim()) return toast.warning("Blocking reason required");

    const payload = { ...roomForm, occupancy: computedOccupancy, room_status: computedStatus, services: roomServices, beds: roomBeds, room_kits: roomKits };
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
    } else { setRoomServices([...roomServices, { ...serviceForm }]); toast.success("Service added"); }
    setServiceForm(defaultService);
  };
  const editService = (i) => { setServiceForm({ ...roomServices[i] }); setEditingServiceIdx(i); };
  const removeService = (i) => {
    if (!window.confirm("Remove service?")) return;
    setRoomServices(roomServices.filter((_, idx) => idx !== i)); toast.info("Removed");
  };

  // Beds
  const addBed = () => {
    if (!bedForm.bed_number.trim()) return toast.warning("Bed number required");
    if (bedForm.blocked && !bedForm.blocked_reason.trim()) return toast.warning("Blocking reason required");
    if (editingBedIdx !== null) {
      const u = [...roomBeds]; u[editingBedIdx] = { ...bedForm };
      setRoomBeds(u); setEditingBedIdx(null); toast.success("Bed updated");
    } else { setRoomBeds([...roomBeds, { ...bedForm }]); toast.success("Bed added"); }
    setBedForm(defaultBed);
  };
  const editBed = (i) => { setEditingBedIdx(i); setBedForm({ ...roomBeds[i] }); };
  const removeBed = (i) => {
    if (!window.confirm("Remove bed?")) return;
    setRoomBeds(roomBeds.filter((_, idx) => idx !== i)); toast.info("Removed");
  };

  // Kits
  const addKit = () => {
    if (!kitForm.kit_item) return toast.warning("Please select kit item");
    if (!kitForm.amount) return toast.warning("Please enter amount");
    if (editingKitIdx !== null) {
      const u = [...roomKits]; u[editingKitIdx] = { ...kitForm };
      setRoomKits(u); setEditingKitIdx(null); toast.success("Kit updated");
    } else { setRoomKits([...roomKits, { ...kitForm }]); toast.success("Kit added"); }
    setKitForm(defaultKit);
  };
  const editKit = (i) => { setEditingKitIdx(i); setKitForm({ ...roomKits[i] }); };
  const removeKit = (i) => {
    if (!window.confirm("Remove kit?")) return;
    setRoomKits(roomKits.filter((_, idx) => idx !== i)); toast.info("Removed");
  };

  const getKitLabel = (k) => typeof k.kit_item === "object" && k.kit_item?.name ? k.kit_item.name : k.kit_item || "—";

  return (
    <PageWrapper>
      <Container>
        <SectionHeader style={{ padding: "0 24px", marginTop: 20 }}>
          <h3>Room Management</h3>
        </SectionHeader>

        <FormContent style={{ paddingTop: 16 }}>
          <form onSubmit={handleSubmit}>
            <PageLayout>

              {/* ════════════════ LEFT PANE — 3 columns ════════════════ */}
              <LeftPane>
                <PanelTitle>Room Details</PanelTitle>

                {/* Row 1: Room Number | Description | Room Category */}
                <FieldGrid>
                  <InputWrapper>
                    <Label required>Room Number</Label>
                    <Input type="text" name="room_number" value={roomForm.room_number}
                      onChange={handleRoomChange} placeholder="e.g. R-101" required />
                  </InputWrapper>
                  <InputWrapper>
                    <Label required>Description</Label>
                    <Input type="text" name="description" value={roomForm.description}
                      onChange={handleRoomChange} placeholder="Room description" />
                  </InputWrapper>
                  <InputWrapper>
                    <Label required style={{ display: "flex", alignItems: "center" }}>
                      Room Category
                      <InlineAddBtn
                        type="button"
                        onClick={() => navigate("/RoomCategory")}
                      >
                        +
                      </InlineAddBtn>
                    </Label>
                    <Select name="room_category" value={roomForm.room_category} onChange={handleRoomChange} required>
                      <option value="">--Select--</option>
                      {categories.map((c) => <option key={c.room_category_id} value={c.name}>{c.name}</option>)}
                    </Select>
                  </InputWrapper>
                </FieldGrid>

                {/* Row 2: Block | Floor | Phone Extension */}
                <FieldGrid>
                  <InputWrapper>
                    <Label required style={{ display: "flex", alignItems: "center" }}>
                      Block
                      <InlineAddBtn
                        type="button"
                        onClick={() => navigate("/Block")}
                      >
                        +
                      </InlineAddBtn>
                    </Label>
                    <Select name="block" value={roomForm.block} onChange={handleRoomChange} required>
                      <option value="">--Select--</option>
                      {blocks.map((b) => <option key={b.block_id} value={b.block_name}>{b.block_name}</option>)}
                    </Select>
                  </InputWrapper>
                  <InputWrapper>
                    <Label required>Floor</Label>
                    <Input type="number" name="floor" value={roomForm.floor}
                      onChange={handleRoomChange} placeholder="e.g. 1" required />
                  </InputWrapper>
                  <InputWrapper>
                    <Label>Phone Extension</Label>
                    <Input type="text" name="phone_extension" value={roomForm.phone_extension}
                      onChange={handleRoomChange} placeholder="e.g. 1234" />
                  </InputWrapper>
                </FieldGrid>

                {/* Row 3: Nursing Station | Capacity | Occupancy */}
                <FieldGrid>
                  <InputWrapper>
                    <Label required>Nursing Station</Label>
                    <Select name="nursing_station" value={roomForm.nursing_station} onChange={handleRoomChange}>
                      <option value="">--Select--</option>
                      <option value="MICU">MICU</option>
                      <option value="SICU">SICU</option>
                    </Select>
                  </InputWrapper>
                  <InputWrapper>
                    <Label required>Capacity</Label>
                    <Input type="number" name="capacity" value={roomForm.capacity}
                      onChange={handleRoomChange} min="1" />
                  </InputWrapper>
                  <InputWrapper>
                    <Label>Occupancy</Label>
                    <ReadOnlyInput type="text" value={computedOccupancy} readOnly
                      title="Auto-calculated from occupied beds" />
                  </InputWrapper>
                </FieldGrid>

                {/* Row 4: Admission Fee | Room Advance | Room Blocked */}
                <FieldGrid>
                  <InputWrapper>
                    <Label>Admission Fee</Label>
                    <Input type="number" name="admission_fee" value={roomForm.admission_fee}
                      onChange={handleRoomChange} step="0.01" placeholder="0.00" />
                  </InputWrapper>
                  <InputWrapper>
                    <Label>Room Advance</Label>
                    <Input type="number" name="room_advance" value={roomForm.room_advance}
                      onChange={handleRoomChange} step="0.01" placeholder="0.00" />
                  </InputWrapper>
                  <InputWrapper>
                    <Label>Room Blocked</Label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <ToggleSwitch type="button" on={roomForm.room_blocked}
                        onClick={() => setRoomForm((p) => ({
                          ...p, room_blocked: !p.room_blocked,
                          blocked_reason: !p.room_blocked ? p.blocked_reason : "",
                        }))} />
                      <StatusBadge color={roomForm.room_blocked ? colors.danger : colors.textMuted}>
                        {roomForm.room_blocked ? "Blocked" : "No"}
                      </StatusBadge>
                    </div>
                  </InputWrapper>
                </FieldGrid>

                {/* Blocking Reason */}
                {roomForm.room_blocked && (
                  <FullRow>
                    <InputWrapper>
                      <Label required>Blocking Reason</Label>
                      <Input type="text" name="blocked_reason" value={roomForm.blocked_reason}
                        onChange={handleRoomChange} placeholder="Reason for blocking" required />
                    </InputWrapper>
                  </FullRow>
                )}

                <Divider />

                {/* Row 5: Room Status (read-only) | Room Type */}
                <TwoCol>
                  <InputWrapper>
                    <Label>Room Status</Label>
                    <ReadOnlyInput type="text" value={computedStatus} readOnly />
                  </InputWrapper>
                  <InputWrapper>
                    <Label>Room Type</Label>
                    <Select name="room_type" value={roomForm.room_type} onChange={handleRoomChange}>
                      <option value="ICU">ICU</option>
                      <option value="CCU">CCU</option>
                      <option value="ICCU">ICCU</option>
                      <option value="NICU">NICU</option>
                      <option value="CASUALTY">CASUALTY</option>
                      <option value="OTHERS">OTHERS</option>
                    </Select>
                  </InputWrapper>
                </TwoCol>

                {/* Checkboxes */}
                <CheckboxRow>
                  <CheckboxLabel>
                    <input type="checkbox" name="include_in_final_bill"
                      checked={roomForm.include_in_final_bill} onChange={handleRoomChange} />
                    Include in Final Bill
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <input type="checkbox" name="enable_luxury_tax"
                      checked={roomForm.enable_luxury_tax} onChange={handleRoomChange} />
                    Enable Luxury Tax
                  </CheckboxLabel>
                </CheckboxRow>
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

                {/* Services Tab */}
                {activeTab === "services" && (
                  <TabPanel>
                    <InputWrapper style={{ marginBottom: 10 }}>
                      <Label required>Description</Label>
                      <SearchableDropdown
                        apiEndpoint="roomservice-description/"
                        value={serviceForm.description}
                        onChange={(val) => setServiceForm((p) => ({ ...p, description: val }))}
                        placeholder="Search service…"
                        labelField="description" valueField="description"
                      />
                    </InputWrapper>

                    <CheckboxRow>
                      <CheckboxLabel>
                        <input type="checkbox" checked={serviceForm.chargeable_for_bystander}
                          onChange={(e) => setServiceForm((p) => ({ ...p, chargeable_for_bystander: e.target.checked }))} />
                        Chargeable For Bystander
                      </CheckboxLabel>
                      <CheckboxLabel>
                        <input type="checkbox" checked={serviceForm.chargeable_for_booking}
                          onChange={(e) => setServiceForm((p) => ({ ...p, chargeable_for_booking: e.target.checked }))} />
                        Chargeable For Booking
                      </CheckboxLabel>
                      <CheckboxLabel>
                        <input type="checkbox" checked={serviceForm.enable_this_service}
                          onChange={(e) => setServiceForm((p) => ({ ...p, enable_this_service: e.target.checked }))} />
                        Enable This Service
                      </CheckboxLabel>
                      <CheckboxLabel>
                        <input type="checkbox" checked={serviceForm.doctors_fee}
                          onChange={(e) => setServiceForm((p) => ({ ...p, doctors_fee: e.target.checked }))} />
                        Doctor's Fee
                      </CheckboxLabel>
                    </CheckboxRow>

                    <TwoCol style={{ marginBottom: 10 }}>
                      <InputWrapper>
                        <Label>Priority</Label>
                        <Input type="number" value={serviceForm.priority}
                          onChange={(e) => setServiceForm((p) => ({ ...p, priority: e.target.value }))}
                          placeholder="Priority" />
                      </InputWrapper>
                      <InputWrapper>
                        <Label>Amount</Label>
                        <Input type="number" value={serviceForm.amount}
                          onChange={(e) => setServiceForm((p) => ({ ...p, amount: e.target.value }))}
                          placeholder="0.00" step="0.01" />
                      </InputWrapper>
                    </TwoCol>

                    <ButtonContainer style={{ justifyContent: "flex-end", marginTop: 0, paddingTop: 10, borderTop: `1px solid ${colors.border}` }}>
                      {editingServiceIdx !== null && (
                        <SmallBtn secondary type="button" onClick={() => { setEditingServiceIdx(null); setServiceForm(defaultService); }}>
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
                          <Tr><Th>Description</Th><Th>Charge</Th><Th>Priority</Th><Th>Action</Th></Tr>
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

                {/* Beds Tab */}
                {activeTab === "beds" && (
                  <TabPanel>
                    <SubFormGrid>
                      <InputWrapper>
                        <Label>Bed Number</Label>
                        <Input value={bedForm.bed_number}
                          onChange={(e) => setBedForm((p) => ({ ...p, bed_number: e.target.value }))}
                          placeholder="e.g. B-101" />
                      </InputWrapper>
                      <InputWrapper>
                        <Label>Status</Label>
                        <Select value={bedForm.bed_status}
                          onChange={(e) => setBedForm((p) => ({ ...p, bed_status: e.target.value }))}>
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Maintenance">Maintenance</option>
                        </Select>
                      </InputWrapper>
                    </SubFormGrid>

                    <SubFormGrid>
                    <InputWrapper>
                        <Label>Blocked</Label>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                          <ToggleSwitch type="button" on={bedForm.blocked}
                            onClick={() => setBedForm((p) => ({ ...p, blocked: !p.blocked, blocked_reason: !p.blocked ? p.blocked_reason : "" }))} />
                          <StatusBadge color={bedForm.blocked ? colors.danger : colors.textMuted}>
                            {bedForm.blocked ? "Yes" : "No"}
                          </StatusBadge>
                        </div>
                      </InputWrapper>
                      {bedForm.blocked && (
                        <InputWrapper>
                          <Label required>Blocking Reason</Label>
                          <Input value={bedForm.blocked_reason}
                            onChange={(e) => setBedForm((p) => ({ ...p, blocked_reason: e.target.value }))}
                            placeholder="Reason" />
                        </InputWrapper>
                      )}
                      </SubFormGrid>

                    <ButtonContainer style={{ justifyContent: "flex-end", marginTop: 0, paddingTop: 10, borderTop: `1px solid ${colors.border}` }}>
                      {editingBedIdx !== null && (
                        <SmallBtn secondary type="button" onClick={() => { setEditingBedIdx(null); setBedForm(defaultBed); }}>✕ Cancel</SmallBtn>
                      )}
                      <SmallBtn type="button" onClick={addBed}>{editingBedIdx !== null ? "✓ Update" : "+ Add"}</SmallBtn>
                    </ButtonContainer>

                    <TableWrapper style={{ marginTop: 10 }}>
                      <Table>
                        <thead>
                          <Tr><Th>Bed No</Th><Th>Status</Th><Th>Blocked</Th><Th>Action</Th></Tr>
                        </thead>
                        <tbody>
                          {roomBeds.length === 0
                            ? <Tr><Td colSpan="4" style={{ textAlign: "center", color: "#9ca3af" }}>No data available</Td></Tr>
                            : roomBeds.map((b, i) => (
                              <Tr key={i} style={{ background: editingBedIdx === i ? "#f0fdf4" : "" }}>
                                <Td>{b.bed_number}</Td>
                                <Td>
                                  <StatusBadge color={b.bed_status === "Available" ? colors.success : b.bed_status === "Occupied" ? colors.danger : colors.secondary}>
                                    {b.bed_status}
                                  </StatusBadge>
                                </Td>
                                <Td><StatusBadge color={b.blocked ? colors.danger : colors.success}>{b.blocked ? "Yes" : "No"}</StatusBadge></Td>
                                <Td>
                                  <ActionCell>
                                    <SmallBtn type="button" onClick={() => editBed(i)}>Edit</SmallBtn>
                                    <SmallBtn danger type="button" onClick={() => removeBed(i)}>Delete</SmallBtn>
                                  </ActionCell>
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
                      <InputWrapper>
                        <Label>Kit Item</Label>
                        <SearchableDropdown
                          apiEndpoint="room-kit-description/"
                          value={kitForm.kit_item}
                          onChange={(val) => setKitForm((p) => ({ ...p, kit_item: val }))}
                          placeholder="Search kit item…" labelField="name" />
                      </InputWrapper>
                      <InputWrapper>
                        <Label>Priority</Label>
                        <Input type="number" value={kitForm.priority}
                          onChange={(e) => setKitForm((p) => ({ ...p, priority: e.target.value }))} placeholder="Priority" />
                      </InputWrapper>
                    </SubFormGrid>
                      <InputWrapper>
                        <Label>Amount</Label>
                        <Input type="number" value={kitForm.amount}
                          onChange={(e) => setKitForm((p) => ({ ...p, amount: e.target.value }))} placeholder="0.00" step="0.01" />
                      </InputWrapper>

                    <ButtonContainer style={{ justifyContent: "flex-end", marginTop: 0, paddingTop: 10, borderTop: `1px solid ${colors.border}` }}>
                      {editingKitIdx !== null && (
                        <SmallBtn secondary type="button" onClick={() => { setEditingKitIdx(null); setKitForm(defaultKit); }}>✕ Cancel</SmallBtn>
                      )}
                      <SmallBtn type="button" onClick={addKit}>{editingKitIdx !== null ? "✓ Update" : "+ Add"}</SmallBtn>
                    </ButtonContainer>

                    <TableWrapper style={{ marginTop: 10 }}>
                      <Table>
                        <thead>
                          <Tr><Th>Kit Item</Th><Th>Priority</Th><Th>Amount</Th><Th>Enabled</Th><Th>Action</Th></Tr>
                        </thead>
                        <tbody>
                          {roomKits.length === 0
                            ? <Tr><Td colSpan="5" style={{ textAlign: "center", color: "#9ca3af" }}>No data available</Td></Tr>
                            : roomKits.map((k, i) => (
                              <Tr key={i} style={{ background: editingKitIdx === i ? "#f0fdf4" : "" }}>
                                <Td>{getKitLabel(k)}</Td>
                                <Td>{k.priority || "—"}</Td>
                                <Td>{k.amount || "—"}</Td>
                                <Td><StatusBadge color={k.enable_item ? colors.success : "#9ca3af"}>{k.enable_item ? "✓" : "✗"}</StatusBadge></Td>
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

        {/* Room List */}
        <div style={{ padding: "0 24px 32px" }}>
          <SectionHeader style={{ padding: 0, marginTop: 0, marginBottom: 14 }}>
            <h3>Room List</h3>
          </SectionHeader>
          <TableWrapper>
            <Table>
              <thead>
                <Tr>
                  <Th>Room No</Th><Th>Description</Th><Th>Block</Th><Th>Category</Th>
                  <Th>Type</Th><Th>Floor</Th><Th>Capacity</Th><Th>Occupancy</Th><Th>Status</Th><Th>Actions</Th>
                </Tr>
              </thead>
              <tbody>
                {rooms.length === 0
                  ? <Tr><Td colSpan="10" style={{ textAlign: "center", color: "#9ca3af" }}>No rooms found</Td></Tr>
                  : rooms.map((r) => (
                    <Tr key={r.id || r.room_number}>
                      <Td style={{ fontWeight: 600 }}>{r.room_number}</Td>
                      <Td>{r.description || "—"}</Td>
                      <Td>{r.block}</Td>
                      <Td>{r.room_category}</Td>
                      <Td>{r.room_type}</Td>
                      <Td>{r.floor}</Td>
                      <Td>{r.capacity}</Td>
                      <Td>{r.occupancy ?? 0}</Td>
                      <Td>
                        <StatusBadge color={r.room_blocked ? colors.danger : colors.success}>
                          {r.room_blocked ? "Blocked" : "Active"}
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