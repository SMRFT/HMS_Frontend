import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";

import {
  PageWrapper,
  Container,
  FormContent,
  FormRow,
  InputWrapper,
  Label,
  Input,
  Select,
  ButtonContainer,
  Button,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  colors,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  SearchRow,
  SearchInput,
  NoResults,
} from "../GlobalStyles";
import apiRequest from "../../Auth/apiRequest";

// ─── Local Styled Components ─────────────────────────────────────────────────

const Header = ({ children }) => (
  <div style={{
    background: colors.surface,
    padding: "12px 24px",
    borderBottom: `1px solid ${colors.border}`,
    fontSize: "0.85rem",
    color: colors.textMuted,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}>
    {children}
  </div>
);

const HospitalBadge = ({ children }) => (
  <div style={{
    background: "#ff8c42",
    color: "white",
    padding: "6px 16px",
    fontWeight: 600,
    fontSize: "0.85rem",
    letterSpacing: "0.5px",
  }}>
    {children}
  </div>
);

const InlineSearchButton = ({ onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      position: "absolute",
      right: "4px",
      top: "26px",
      padding: "5px 10px",
      background: disabled ? colors.border : colors.primary,
      color: "white",
      border: "none",
      borderRadius: "4px",
      fontSize: "0.75rem",
      cursor: disabled ? "not-allowed" : "pointer",
      zIndex: 2,
    }}
  >
    🔍
  </button>
);

const FilterSection = styled.div`
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
`;

const FilterRow = styled(FormRow)`
  align-items: flex-end;
`;

const TableSection = styled.div`
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
`;

const TableControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ShowEntries = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: ${colors.textMuted};
`;

const EntriesSelect = styled(Select)`
  width: 72px;
  height: 30px;
  padding: 0 6px;
`;

const ReadOnlyInput = styled(Input)`
  background: #f8fafc;
  color: ${colors.textMuted};
  cursor: default;
`;

const SectionLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${colors.primary};
  letter-spacing: 0.8px;
  text-transform: uppercase;
  padding: 8px 0 4px;
  border-bottom: 1px solid ${colors.border};
  margin-bottom: 6px;
  grid-column: 1 / -1;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 600;
  background: ${({ variant }) =>
    variant === "active"    ? "#dcfce7" :
    variant === "cancelled" ? "#fee2e2" :
    "#fef9c3"};
  color: ${({ variant }) =>
    variant === "active"    ? "#166534" :
    variant === "cancelled" ? "#991b1b" :
    "#854d0e"};
`;

const ActionBtn = styled.button`
  background: none;
  border: 1px solid ${({ danger }) => danger ? colors.danger : colors.border};
  color: ${({ danger }) => danger ? colors.danger : colors.textMuted};
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 0.75rem;
  cursor: pointer;
  margin: 0 2px;
  transition: all 0.15s;
  &:hover {
    background: ${({ danger }) => danger ? "#fee2e2" : "#f1f5f9"};
  }
`;

// ─── Room Search Modal ────────────────────────────────────────────────────────

const RoomSearchModal = ({ open, onClose, onSelect, baseUrl }) => {
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter]   = useState({ room_number: "", block: "", floor: "" });

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filter.room_number) p.append("room_number", filter.room_number);
      if (filter.block)       p.append("block",       filter.block);
      if (filter.floor)       p.append("floor",       filter.floor);
      const q   = p.toString() ? `?${p.toString()}` : "";
      const res = await apiRequest(`${baseUrl}search-rooms/${q}`, "GET");
      setRooms(Array.isArray(res) ? res : res.data || []);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [filter, baseUrl]);

  useEffect(() => { if (open) search(); }, [open]);

  if (!open) return null;

  return (
    <ModalOverlay>
      <ModalContainer style={{ maxWidth: 700 }}>
        <ModalHeader>
          <ModalTitle>Search Available Rooms</ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>
        <ModalBody>
          <SearchRow>
            <SearchInput
              placeholder="Room No"
              value={filter.room_number}
              onChange={e => setFilter(p => ({ ...p, room_number: e.target.value }))}
            />
            <SearchInput
              placeholder="Block"
              value={filter.block}
              onChange={e => setFilter(p => ({ ...p, block: e.target.value }))}
            />
            <SearchInput
              placeholder="Floor"
              value={filter.floor}
              onChange={e => setFilter(p => ({ ...p, floor: e.target.value }))}
            />
            <Button type="button" onClick={search}>🔍 Search</Button>
          </SearchRow>

          {loading ? (
            <NoResults>Loading rooms…</NoResults>
          ) : rooms.length === 0 ? (
            <NoResults>No rooms found</NoResults>
          ) : (
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>Room No</Th>
                    <Th>Bed No</Th>
                    <Th>Room Type</Th>
                    <Th>Block</Th>
                    <Th>Floor</Th>
                    <Th>Status</Th>
                    <Th>Select</Th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r, i) => (
                    <Tr key={i}>
                      <Td>{r.room_number || r.roomNo}</Td>
                      <Td>{r.bed_number  || r.bedNo}</Td>
                      <Td>{r.room_type   || "-"}</Td>
                      <Td>{r.block       || "-"}</Td>
                      <Td>{r.floor       || "-"}</Td>
                      <Td>
                        <Badge variant={r.is_available ? "active" : "cancelled"}>
                          {r.is_available ? "Available" : "Occupied"}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          type="button"
                          style={{ padding: "3px 10px", fontSize: "0.75rem" }}
                          onClick={() => { onSelect(r); onClose(); }}
                        >
                          Select
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          )}
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const EditModal = ({ open, record, onClose, onSave, baseUrl }) => {
  const [newRoom, setNewRoom] = useState("");
  const [newBed,  setNewBed]  = useState("");
  const [roomModal, setRoomModal] = useState(false);

  useEffect(() => {
    if (record) {
      setNewRoom(record.newRoomNo || "");
      setNewBed(record.newBedNo  || "");
    }
  }, [record]);

  if (!open || !record) return null;

  return (
    <ModalOverlay>
      <ModalContainer style={{ maxWidth: 440 }}>
        <ModalHeader>
          <ModalTitle>Edit Room Shifting</ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>
        <ModalBody>
          <FormRow>
            <InputWrapper>
              <Label>New Room No</Label>
              <ReadOnlyInput value={newRoom} readOnly placeholder="Click 🔍 to pick room" />
              <InlineSearchButton onClick={() => setRoomModal(true)} />
            </InputWrapper>
            <InputWrapper>
              <Label>New Bed No</Label>
              <Input value={newBed} onChange={e => setNewBed(e.target.value)} />
            </InputWrapper>
          </FormRow>
          <ButtonContainer>
            <Button secondary type="button" onClick={onClose}>Cancel</Button>
            <Button
              type="button"
              onClick={() =>
                onSave(record._id || record.shiftingId, { newRoomNo: newRoom, newBedNo: newBed })
              }
            >
              💾 Update
            </Button>
          </ButtonContainer>
        </ModalBody>
      </ModalContainer>

      <RoomSearchModal
        open={roomModal}
        onClose={() => setRoomModal(false)}
        baseUrl={baseUrl}
        onSelect={r => {
          setNewRoom(r.room_number || r.roomNo);
          setNewBed(r.bed_number  || r.bedNo);
          setRoomModal(false);
        }}
      />
    </ModalOverlay>
  );
};

// ─── Empty Form State ─────────────────────────────────────────────────────────

const EMPTY = {
  uhid:             "",
  ipNumber:         "",
  ipserial_number:  "",
  name:             "",
  age:              "",
  gender:           "",
  address:          "",
  admittedOn:       "",
  admittedTime:     "",
  currentRoomNo:    "",
  currentBedNo:     "",
  newRoomNo:        "",
  newBedNo:         "",
};

// ─── Main Component ───────────────────────────────────────────────────────────

const RoomShifting = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [form, setForm]              = useState(EMPTY);
  const [roomModal, setRoomModal]    = useState(false);
  const [shiftings, setShiftings]    = useState([]);
  const [entriesPerPage, setEntries] = useState(15);
  const [editRecord, setEditRecord]  = useState(null);
  const [editOpen,   setEditOpen]    = useState(false);

  const [filters, setFilters] = useState({
    fromDate: new Date().toISOString().split("T")[0],
    toDate:   new Date().toISOString().split("T")[0],
    uhid:     "",
    ipNumber: "",
  });

  // Today's date shown (read-only); actual shifting date/time comes from backend
  const todayDisplay = new Date().toLocaleDateString("en-GB");

  // ── Fetch shifting records ─────────────────────────────────────────────────
  const fetchShiftings = async () => {
    try {
      const p = new URLSearchParams();
      if (filters.fromDate) p.append("from_date", filters.fromDate);
      if (filters.toDate)   p.append("to_date",   filters.toDate);
      if (filters.uhid)     p.append("uhid",      filters.uhid);
      if (filters.ipNumber) p.append("ip_no",     filters.ipNumber);
      const res = await apiRequest(`${HmsBaseUrl}room-shifting/?${p.toString()}`, "GET");
      const data = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
      setShiftings(data);
    } catch (err) {
      console.error("Fetch shiftings error:", err);
    }
  };

  useEffect(() => { fetchShiftings(); }, []);

  // ── Fetch patient by UHID ─────────────────────────────────────────────────
  const fetchPatientByUHID = async () => {
    const uhid = form.uhid.trim();
    if (!uhid) return toast.warning("Enter UHID");
    try {
      const res = await apiRequest(`${HmsBaseUrl}op-patient/${encodeURIComponent(uhid)}/`, "GET");
      if (!res.success) { toast.error(res.error || "Patient not found"); return; }
      const d = res.data;
      setForm(p => ({
        ...p,
        name:    [d.salutation, d.firstName, d.middleName, d.lastName].filter(Boolean).join(" "),
        age:     d.age     || "",
        gender:  d.gender  || "",
        address: d.permanent_address || d.address || "",
      }));
      toast.success("Patient loaded");
    } catch {
      toast.error("Failed to fetch patient");
    }
  };

  // ── Fetch admission by IP Number ──────────────────────────────────────────
  const fetchAdmissionByIP = async () => {
    const ip = form.ipNumber.trim();
    if (!ip) return toast.warning("Enter IP Number");
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}admission/?ip_number=${encodeURIComponent(ip)}`, "GET"
      );
      if (!res.success) throw new Error(res.error || "Not found");
      const list =
        Array.isArray(res.data?.data) ? res.data.data :
        Array.isArray(res.data)       ? res.data       : [];
      if (!list.length) return toast.error("No admission found for this IP Number");
      const adm = list[0];

      let admDate = "", admTime = "";
      if (adm.admissionDateTime) {
        const dt = new Date(adm.admissionDateTime);
        admDate  = dt.toISOString().split("T")[0];
        admTime  = dt.toTimeString().slice(0, 8);
      }

      // Last active room from room_details array
      const activeRoom =
        adm.room_details?.find(r => r.is_roomActive) || adm.room_details?.[0];

      setForm(p => ({
        ...p,
        uhid:            adm.uhid             || "",
        ipNumber:        adm.ipNumber         || ip,
        ipserial_number: adm.ipserial_number  || "",
        admittedOn:      admDate,
        admittedTime:    admTime,
        currentRoomNo:   activeRoom?.roomNo   || adm.roomNo || "",
        currentBedNo:    activeRoom?.bedNo    || adm.bedNo  || "",
        name:    adm.name || [adm.firstName, adm.lastName].filter(Boolean).join(" ") || p.name,
        age:     adm.age    || p.age,
        gender:  adm.gender || p.gender,
        address: adm.permanent_address || adm.address || p.address,
      }));
      toast.success(`Admission loaded: ${adm.ipNumber || ip}`);
    } catch (err) {
      toast.error(err.message || "Admission not found");
    }
  };

  // ── Handle room selection from modal ─────────────────────────────────────
  const handleRoomSelect = (r) => {
    setForm(p => ({
      ...p,
      newRoomNo: r.room_number || r.roomNo || "",
      newBedNo:  r.bed_number  || r.bedNo  || "",
    }));
  };

  // ── Reset form ────────────────────────────────────────────────────────────
  const handleReset = () => setForm(EMPTY);

  // ── Save shift ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const { uhid, ipNumber, newRoomNo, newBedNo, currentRoomNo, currentBedNo } = form;
    if (!uhid && !ipNumber)      return toast.warning("Enter UHID or IP Number");
    if (!newRoomNo || !newBedNo) return toast.warning("Select a new room and bed");

    const payload = {
      uhid,
      ip_no:      ipNumber,
      newRoomNo,
      newBedNo,
      oldRoomNo:  currentRoomNo,
      oldBedNo:   currentBedNo,
    };

    try {
      const res = await apiRequest(`${HmsBaseUrl}room-shifting/`, "POST", payload);
      if (res.success || res.message) {
        toast.success("Room shifted successfully!");
        handleReset();
        fetchShiftings();
      } else {
        toast.error(res.error || "Failed to shift room");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while shifting room");
    }
  };

  // ── Edit save ────────────────────────────────────────────────────────────
  const handleEditSave = async (shiftingId, updates) => {
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}room-shifting/${shiftingId}/`, "PATCH", updates
      );
      if (res.success || res.message) {
        toast.success("Updated successfully");
        setEditOpen(false);
        fetchShiftings();
      } else {
        toast.error(res.error || "Update failed");
      }
    } catch {
      toast.error("Update failed");
    }
  };

  // ── Cancel shifting ───────────────────────────────────────────────────────
  const handleCancel = async (shiftingId) => {
    if (!window.confirm("Cancel this room shifting record?")) return;
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}room-shifting/${shiftingId}/cancel/`, "POST"
      );
      if (res.success || res.message) {
        toast.success("Shifting cancelled");
        fetchShiftings();
      } else {
        toast.error(res.error || "Cancel failed");
      }
    } catch {
      toast.error("Cancel failed");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      <Header>
        <span>Home / Room Shifting</span>
        <HospitalBadge>SHANMUGA HOSPITAL LTD</HospitalBadge>
      </Header>

      <Container>
        <FormContent>

          {/* ── Patient Lookup ── */}
          <FormRow>
            <SectionLabel>Patient Lookup</SectionLabel>

            <InputWrapper>
              <Label>UHID</Label>
              <Input
                type="text"
                value={form.uhid}
                onChange={e => setForm(p => ({ ...p, uhid: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && fetchPatientByUHID()}
                placeholder="Search by UHID"
              />
              <InlineSearchButton onClick={fetchPatientByUHID} />
            </InputWrapper>

            <InputWrapper>
              <Label>IP Number</Label>
              <Input
                type="text"
                value={form.ipNumber}
                onChange={e => setForm(p => ({ ...p, ipNumber: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && fetchAdmissionByIP()}
                placeholder="Search by IP No"
              />
              <InlineSearchButton onClick={fetchAdmissionByIP} />
            </InputWrapper>

            <InputWrapper>
              <Label>IP Serial No</Label>
              <ReadOnlyInput value={form.ipserial_number} readOnly />
            </InputWrapper>

            <InputWrapper>
              <Label>Patient Name</Label>
              <ReadOnlyInput value={form.name} readOnly />
            </InputWrapper>
          </FormRow>

          {/* ── Patient Details ── */}
          <FormRow>
            <SectionLabel>Patient Details</SectionLabel>

            <InputWrapper>
              <Label>Age</Label>
              <ReadOnlyInput value={form.age} readOnly />
            </InputWrapper>

            <InputWrapper>
              <Label>Gender</Label>
              <ReadOnlyInput value={form.gender} readOnly />
            </InputWrapper>

            <InputWrapper>
              <Label>Admitted On</Label>
              <ReadOnlyInput type="date" value={form.admittedOn} readOnly />
            </InputWrapper>

            <InputWrapper>
              <Label>Admitted Time</Label>
              <ReadOnlyInput type="time" value={form.admittedTime} readOnly />
            </InputWrapper>
          </FormRow>

          <FormRow>
            <InputWrapper style={{ gridColumn: "span 4" }}>
              <Label>Address</Label>
              <ReadOnlyInput value={form.address} readOnly />
            </InputWrapper>
          </FormRow>

          {/* ── Current Room ── */}
          <FormRow>
            <SectionLabel>Current Room</SectionLabel>

            <InputWrapper>
              <Label>Current Room No</Label>
              <ReadOnlyInput value={form.currentRoomNo} readOnly />
            </InputWrapper>

            <InputWrapper>
              <Label>Current Bed No</Label>
              <ReadOnlyInput value={form.currentBedNo} readOnly />
            </InputWrapper>
          </FormRow>

          {/* ── New Room Assignment ── */}
          <FormRow>
            <SectionLabel>New Room Assignment</SectionLabel>

            <InputWrapper>
              <Label>New Room No</Label>
              <ReadOnlyInput
                value={form.newRoomNo}
                readOnly
                placeholder="Click 🔍 to search"
              />
              <InlineSearchButton onClick={() => setRoomModal(true)} />
            </InputWrapper>

            <InputWrapper>
              <Label>New Bed No</Label>
              <Input
                value={form.newBedNo}
                onChange={e => setForm(p => ({ ...p, newBedNo: e.target.value }))}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Shifting Date</Label>
              <ReadOnlyInput
                value={todayDisplay}
                readOnly
                title="Shifting date & time are recorded automatically by the server"
              />
            </InputWrapper>
          </FormRow>

          <ButtonContainer>
            <Button secondary type="button" onClick={handleReset}>
              🔄 Reset
            </Button>
            <Button type="button" onClick={handleSubmit}>
              💾 Save Shift
            </Button>
          </ButtonContainer>
        </FormContent>

        {/* ── Filters ── */}
        <FilterSection>
          <FilterRow>
            <InputWrapper>
              <Label>From Date</Label>
              <Input
                type="date"
                value={filters.fromDate}
                onChange={e => setFilters(p => ({ ...p, fromDate: e.target.value }))}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>To Date</Label>
              <Input
                type="date"
                value={filters.toDate}
                onChange={e => setFilters(p => ({ ...p, toDate: e.target.value }))}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>UHID</Label>
              <Input
                value={filters.uhid}
                onChange={e => setFilters(p => ({ ...p, uhid: e.target.value }))}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>IP Number</Label>
              <Input
                value={filters.ipNumber}
                onChange={e => setFilters(p => ({ ...p, ipNumber: e.target.value }))}
              />
            </InputWrapper>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <Button type="button" onClick={fetchShiftings}>
                🔍 Search
              </Button>
            </div>
          </FilterRow>
        </FilterSection>

        {/* ── Shifting Records Table ── */}
        <TableSection>
          <TableControls>
            <ShowEntries>
              Show
              <EntriesSelect
                value={entriesPerPage}
                onChange={e => setEntries(Number(e.target.value))}
              >
                {[10, 15, 25, 50, 100].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </EntriesSelect>
              entries
            </ShowEntries>
            <span style={{ fontSize: "0.8rem", color: colors.textMuted }}>
              {shiftings.length} record(s)
            </span>
          </TableControls>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Actions</Th>
                  <Th>UHID</Th>
                  <Th>IP No</Th>
                  <Th>IP Serial</Th>
                  <Th>Patient Name</Th>
                  <Th>Admission Date</Th>
                  <Th>Old Room / Bed</Th>
                  <Th>New Room / Bed</Th>
                  <Th>Shifting Date & Time</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {shiftings.length === 0 ? (
                  <Tr>
                    <Td
                      colSpan="10"
                      style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}
                    >
                      No room shifting records found
                    </Td>
                  </Tr>
                ) : (
                  shiftings.slice(0, entriesPerPage).map((s, idx) => {
                    const isCancelled = s.is_cancelled === true;
                    const status      = isCancelled ? "cancelled" : "active";
                    const shiftId     = s._id || s.shiftingId;

                    const admDateStr = s.admissionDate
                      ? new Date(s.admissionDate).toLocaleDateString("en-GB")
                      : "-";

                    const shiftDateStr = s.shiftingDate
                      ? new Date(s.shiftingDate).toLocaleString("en-GB", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })
                      : "-";

                    return (
                      <Tr key={shiftId || idx}>
                        <Td>
                          {!isCancelled ? (
                            <>
                              <ActionBtn
                                type="button"
                                title="Edit"
                                onClick={() => { setEditRecord(s); setEditOpen(true); }}
                              >
                                ✏️ Edit
                              </ActionBtn>
                              <ActionBtn
                                type="button"
                                danger
                                title="Cancel"
                                onClick={() => handleCancel(shiftId)}
                              >
                                ✕ Cancel
                              </ActionBtn>
                            </>
                          ) : (
                            <span style={{ fontSize: "0.75rem", color: colors.textMuted }}>—</span>
                          )}
                        </Td>
                        <Td>{s.uhid          || "-"}</Td>
                        <Td>{s.ip_no || s.ipNumber || "-"}</Td>
                        <Td>{s.ipserial_number || "-"}</Td>
                        <Td>{s.patient_name || s.name || "-"}</Td>
                        <Td>{admDateStr}</Td>
                        <Td>{`${s.oldRoomNo || "-"} / ${s.oldBedNo || "-"}`}</Td>
                        <Td>{`${s.newRoomNo || "-"} / ${s.newBedNo || "-"}`}</Td>
                        <Td>{shiftDateStr}</Td>
                        <Td>
                          <Badge variant={status}>{status.toUpperCase()}</Badge>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </TableSection>
      </Container>

      {/* ── Room Search Modal ── */}
      <RoomSearchModal
        open={roomModal}
        onClose={() => setRoomModal(false)}
        baseUrl={HmsBaseUrl}
        onSelect={handleRoomSelect}
      />

      {/* ── Edit Modal ── */}
      <EditModal
        open={editOpen}
        record={editRecord}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
        baseUrl={HmsBaseUrl}
      />
    </PageWrapper>
  );
};

export default RoomShifting;
