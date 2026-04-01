import { useState, useEffect, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
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
  NoResults,
} from "../GlobalStyles";
import apiRequest from "../../Auth/apiRequest";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn   = keyframes`from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}`;
const pulse    = keyframes`0%,100%{opacity:1}50%{opacity:.45}`;
const slideUp2 = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;

// ─── Room Picker Styled Components ────────────────────────────────────────────
const RMC  = styled(ModalContainer)`max-width:960px;max-height:88vh;`;
const RMB  = styled(ModalBody)`background:#f8fafc;padding:14px;`;
const FBR  = styled.div`display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:flex-end;`;
const FFR  = styled.div`display:flex;flex-direction:column;gap:2px;flex:1 1 120px;`;
const FLR  = styled.label`font-size:.68rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;`;
const FIR  = styled.input`height:28px;padding:0 7px;font-size:.75rem;border:1px solid #d1d5db;border-radius:4px;background:#fff;outline:none;width:100%;box-sizing:border-box;&:focus{border-color:#0d9488;}`;
const FBR2 = styled.button`height:28px;padding:0 14px;font-size:.75rem;font-weight:600;border-radius:4px;border:none;cursor:pointer;background:${p=>p.clear?'#6b7280':'#0d9488'};color:#fff;align-self:flex-end;&:hover{opacity:.88;}`;
const LBar = styled.div`display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;padding:6px 12px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;`;
const LI   = styled.div`display:flex;align-items:center;gap:5px;font-size:.72rem;font-weight:500;color:#6b7280;`;
const LD   = styled.span`display:inline-block;width:12px;height:12px;border-radius:3px;background:${p=>p.c};flex-shrink:0;`;
const BS2  = styled.div`background:#fff;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:14px;overflow:hidden;animation:${slideUp2} .25s ease both;animation-delay:${p=>p.i*40}ms;`;
const BH2  = styled.div`padding:7px 12px;background:#f0fdf4;border-bottom:1px solid #e5e7eb;font-size:.78rem;font-weight:700;color:#0d9488;`;
const FG2  = styled.div`padding:10px 12px;`;
const FL2  = styled.div`font-size:.68rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;display:flex;align-items:center;gap:6px;&::after{content:"";flex:1;height:1px;background:#e5e7eb;}`;
const RG2  = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:8px;margin-bottom:10px;`;
const rC   = {
  available:   { bg:"#f0fdf4", br:"#86efac", hd:"#dcfce7" },
  occupied:    { bg:"#fff1f2", br:"#fca5a5", hd:"#fee2e2" },
  maintenance: { bg:"#fffbeb", br:"#fcd34d", hd:"#fef3c7" },
  partial:     { bg:"#eff6ff", br:"#93c5fd", hd:"#dbeafe" },
};
const RC   = styled.div`
  border:1.5px solid ${p=>rC[p.s]?.br||'#e5e7eb'};border-radius:7px;overflow:hidden;
  cursor:${p=>(p.s==='occupied'||p.s==='maintenance')?'not-allowed':'pointer'};
  opacity:${p=>(p.s==='occupied'||p.s==='maintenance')?.72:1};
  background:${p=>rC[p.s]?.bg||'#fff'};transition:box-shadow .18s,transform .18s;
  ${p=>(p.s!=='occupied'&&p.s!=='maintenance')&&'&:hover{box-shadow:0 4px 14px rgba(0,0,0,.13);transform:translateY(-2px);}'}
`;
const RCT  = styled.div`display:flex;align-items:center;justify-content:space-between;padding:5px 8px;background:${p=>rC[p.s]?.hd||'#f1f5f9'};border-bottom:1px solid ${p=>rC[p.s]?.br||'#e5e7eb'};`;
const RNum = styled.span`font-size:.78rem;font-weight:700;color:#111827;`;
const RSP  = styled.span`font-size:.6rem;font-weight:700;padding:1px 6px;border-radius:10px;background:${p=>p.s==='available'?'#22c55e':p.s==='occupied'?'#ef4444':p.s==='maintenance'?'#f59e0b':'#3b82f6'};color:#fff;text-transform:capitalize;`;
const BRow = styled.div`display:flex;flex-wrap:wrap;gap:4px;padding:6px 8px;`;
const BC   = styled.button`
  flex:1 1 auto;min-width:44px;text-align:center;padding:3px 5px;border-radius:4px;
  font-size:.67rem;font-weight:600;border:1.5px solid transparent;
  cursor:${p=>p.disabled?'not-allowed':'pointer'};color:#fff;
  background:${p=>p.bs==='Available'?'#22c55e':p.bs==='Occupied'?'#ef4444':'#f59e0b'};
  opacity:${p=>p.disabled?.55:1};&:hover:not(:disabled){filter:brightness(1.1);}
`;
const RT2  = styled.span`font-size:.6rem;color:#6b7280;padding:0 8px 4px;display:block;`;
const Skel = styled.div`height:100px;border-radius:7px;background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:${pulse} 1.4s ease-in-out infinite;`;
const NR   = styled.div`text-align:center;padding:30px;color:#6b7280;font-size:.8rem;`;

// ─── Bed Fallback Modal ───────────────────────────────────────────────────────
const BedModal = ({ room, onClose, onSelect }) => {
  if (!room) return null;
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <ModalHeader>
          <ModalTitle>Select Bed — Room {room.room_number}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalBody>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, padding:12 }}>
            {(room.beds || []).map((bed, i) => {
              const avail = bed.status === "Available";
              return (
                <BC
                  key={i} bs={bed.status} disabled={!avail}
                  style={{ minWidth:70, height:42, fontSize:".82rem", flex:"1 1 70px" }}
                  onClick={() => avail && onSelect(bed.bed_number, room)}
                >
                  {bed.bed_number}<br/>
                  <span style={{ fontSize:".6rem", opacity:.85 }}>{bed.status}</span>
                </BC>
              );
            })}
            {(!room.beds || room.beds.length === 0) && <NR>No beds configured.</NR>}
          </div>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

// ─── Room Status Helper ────────────────────────────────────────────────────────
const getRoomStatus = beds => {
  if (!beds?.length) return "available";
  const s = beds.map(b => b.status);
  if (s.every(x => x === "Maintenance")) return "maintenance";
  if (s.every(x => x === "Occupied"))    return "occupied";
  if (s.some(x => x === "Occupied") && s.some(x => x === "Available")) return "partial";
  return "available";
};

// ─── Already Shifted Banner ───────────────────────────────────────────────────
const ShiftedBanner = styled.div`
  background: #fef3c7;
  border: 1.5px solid #f59e0b;
  border-radius: 8px;
  padding: 12px 18px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #92400e;
  grid-column: 1 / -1;
`;

// ─── Local Styled Components ──────────────────────────────────────────────────
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
const FilterRow = styled(FormRow)`align-items: flex-end;`;

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
const EntriesSelect = styled(Select)`width:72px;height:30px;padding:0 6px;`;

const ReadOnlyInput = styled(Input)`
  background: #f8fafc;
  color: ${colors.textMuted};
  cursor: default;
`;

const DisabledInput = styled(Input)`
  background: #f1f5f9;
  color: #9ca3af;
  cursor: not-allowed;
  pointer-events: none;
`;

const SectionLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${colors.primary};
  letter-spacing: 0.8px;
  text-transform: uppercase;
  padding: 8px 0 4px;
  border-bottom: 1px solid ${colors.border};
  margin-bottom: 2px;
  grid-column: 1 / -1;
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
  &:hover { background: ${({ danger }) => danger ? "#fee2e2" : "#f1f5f9"}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({ open, record, onClose, onSave, baseUrl }) => {
  const [newRoomNo, setNewRoomNo] = useState("");
  const [newBedNo,  setNewBedNo]  = useState("");
  const [showRoom,  setShowRoom]  = useState(false);
  const [showBed,   setShowBed]   = useState(false);
  const [selRoom,   setSelRoom]   = useState(null);
  const [allRooms,  setAllRooms]  = useState([]);
  const [loadRooms, setLoadRooms] = useState(false);
  const [rFilter,   setRFilter]   = useState({ room_number:"", block:"", floor:"" });

  useEffect(() => {
    if (record) {
      setNewRoomNo(record.newRoomNo || "");
      setNewBedNo(record.newBedNo   || "");
    }
  }, [record]);

  const fetchAllRooms = async (fo = {}) => {
    setLoadRooms(true);
    try {
      const f = { ...rFilter, ...fo };
      const p = new URLSearchParams();
      if (f.room_number) p.append("room_number", f.room_number);
      if (f.block)       p.append("block",       f.block);
      if (f.floor)       p.append("floor",       f.floor);
      const q   = p.toString() ? `?${p.toString()}` : "";
      const res = await apiRequest(`${baseUrl}search-rooms/${q}`, "GET");
      setAllRooms(Array.isArray(res) ? res : res.data || []);
    } catch { setAllRooms([]); }
    finally { setLoadRooms(false); }
  };

  const grouped = (() => {
    const g = {};
    allRooms.forEach(r => {
      const bl = r.block || "UNKNOWN", fl = r.floor ?? "?";
      if (!g[bl]) g[bl] = {};
      if (!g[bl][fl]) g[bl][fl] = [];
      g[bl][fl].push(r);
    });
    return g;
  })();

  const handleRoomClick = room => {
    const s = getRoomStatus(room.beds);
    if (s === "occupied" || s === "maintenance") return;
    setSelRoom(room); setShowRoom(false); setShowBed(true);
  };

  const handleBedSelect = (bedNo, room) => {
    const r = room || selRoom;
    if (!r) return;
    setNewRoomNo(r.room_number);
    setNewBedNo(bedNo);
    setShowBed(false); setShowRoom(false);
    toast.success(`Room ${r.room_number} / Bed ${bedNo} selected`);
  };

  if (!open || !record) return null;

  return (
    <>
      <ModalOverlay>
        <ModalContainer style={{ maxWidth: 480 }}>
          <ModalHeader>
            <ModalTitle>Edit Room Shifting — #{record.shifting_id}</ModalTitle>
            <CloseButton onClick={onClose}>✕</CloseButton>
          </ModalHeader>
          <ModalBody>
            <div style={{ background:"#fef3c7", border:"1px solid #f59e0b", borderRadius:6, padding:"8px 12px", marginBottom:12, fontSize:".8rem", color:"#92400e" }}>
              ⚠️ Editing will create a new shifting record and mark the current one inactive.
            </div>
            <FormRow>
              <InputWrapper>
                <Label>New Room No</Label>
                <ReadOnlyInput value={newRoomNo} readOnly placeholder="Click 🔍 to pick room" />
                <InlineSearchButton onClick={() => { setShowRoom(true); fetchAllRooms(); }} />
              </InputWrapper>
              <InputWrapper>
                <Label>New Bed No</Label>
                <ReadOnlyInput value={newBedNo} readOnly placeholder="Auto-filled" style={{ background:"#f3f4f6" }} />
              </InputWrapper>
            </FormRow>
            <ButtonContainer>
              <Button secondary type="button" onClick={onClose}>Cancel</Button>
              <Button
                type="button"
                onClick={() => onSave(record.shifting_id, { newRoomNo, newBedNo }, record.ipNumber)}
                disabled={!newRoomNo || !newBedNo}
              >
                💾 Update
              </Button>
            </ButtonContainer>
          </ModalBody>
        </ModalContainer>
      </ModalOverlay>

      {/* Room picker inside Edit */}
      {showRoom && (
        <ModalOverlay onClick={() => setShowRoom(false)}>
          <RMC onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🏨 Select Room</ModalTitle>
              <CloseButton onClick={() => setShowRoom(false)}>×</CloseButton>
            </ModalHeader>
            <RMB>
              <FBR>
                {[["room_number","Room Number","e.g. 101"],["block","Block","e.g. A"]].map(([k,lbl,ph]) => (
                  <FFR key={k}>
                    <FLR>{lbl}</FLR>
                    <FIR placeholder={ph} value={rFilter[k]}
                      onChange={e => setRFilter(p => ({ ...p, [k]:e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && fetchAllRooms()} />
                  </FFR>
                ))}
                <FFR>
                  <FLR>Floor</FLR>
                  <FIR type="number" placeholder="e.g. 2" value={rFilter.floor}
                    onChange={e => setRFilter(p => ({ ...p, floor:e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && fetchAllRooms()} />
                </FFR>
                <FBR2 onClick={() => fetchAllRooms()}>Search</FBR2>
                <FBR2 clear onClick={() => { setRFilter({ room_number:"", block:"", floor:"" }); fetchAllRooms({ room_number:"", block:"", floor:"" }); }}>Clear</FBR2>
              </FBR>
              <LBar>
                {[["#22c55e","Available"],["#3b82f6","Partial"],["#ef4444","Occupied"],["#f59e0b","Maintenance"]].map(([c,l]) => (
                  <LI key={l}><LD c={c}/>{l}</LI>
                ))}
              </LBar>
              {loadRooms ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))", gap:8 }}>
                  {Array.from({ length:12 }).map((_, i) => <Skel key={i} />)}
                </div>
              ) : Object.keys(grouped).length === 0 ? <NR>No rooms found.</NR>
              : Object.entries(grouped).map(([block, floors], bIdx) => (
                <BS2 key={block} i={bIdx}>
                  <BH2>🏢 Block {block}</BH2>
                  {Object.entries(floors).sort(([a],[b]) => Number(a) - Number(b)).map(([floor, rooms]) => (
                    <FG2 key={floor}>
                      <FL2>Floor {floor}</FL2>
                      <RG2>
                        {rooms.map(room => {
                          const s = getRoomStatus(room.beds);
                          return (
                            <RC key={room.room_number} s={s} onClick={() => handleRoomClick(room)}>
                              <RCT s={s}><RNum>{room.room_number}</RNum><RSP s={s}>{s==="partial"?"Partial":s}</RSP></RCT>
                              <RT2>{room.room_type}{room.room_category?` · ${room.room_category}`:""}</RT2>
                              <BRow>
                                {(room.beds||[]).map((bed,i) => (
                                  <BC key={i} bs={bed.status} disabled={bed.status !== "Available"}
                                    onClick={e => { if (bed.status==="Available"){e.stopPropagation();handleBedSelect(bed.bed_number,room);} }}>
                                    {bed.bed_number}
                                  </BC>
                                ))}
                              </BRow>
                            </RC>
                          );
                        })}
                      </RG2>
                    </FG2>
                  ))}
                </BS2>
              ))}
            </RMB>
          </RMC>
        </ModalOverlay>
      )}

      {showBed && selRoom && (
        <BedModal room={selRoom} onClose={() => setShowBed(false)} onSelect={handleBedSelect} />
      )}
    </>
  );
};

// ─── Empty Form ───────────────────────────────────────────────────────────────
const EMPTY = {
  uhid:            "",
  ipNumber:        "",
  ipserial_number: "",
  name:            "",
  age:             "",
  gender:          "",
  area:            "",
  city:            "",
  state:           "",
  zipcode:         "",
  admittedOn:      "",
  admittedTime:    "",
  roomNo:          "",
  bedNo:           "",
  newRoomNo:       "",
  newBedNo:        "",
  has_shifted:     false,  // ← true means already shifted
};

const buildAddress = ({ area, city, state, zipcode } = {}) =>
  [area, city, state, zipcode].filter(Boolean).join(", ");

// ─── Main Component ───────────────────────────────────────────────────────────
const RoomShifting = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [form,           setForm]       = useState(EMPTY);
  const [showRoom,       setShowRoom]   = useState(false);
  const [showBed,        setShowBed]    = useState(false);
  const [selRoom,        setSelRoom]    = useState(null);
  const [allRooms,       setAllRooms]   = useState([]);
  const [loadRooms,      setLoadRooms]  = useState(false);
  const [rFilter,        setRFilter]    = useState({ room_number:"", block:"", floor:"" });

  const [shiftings,      setShiftings]  = useState([]);
  const [entriesPerPage, setEntries]    = useState(15);
  const [editRecord,     setEditRecord] = useState(null);
  const [editOpen,       setEditOpen]   = useState(false);

  const [filters, setFilters] = useState({
    fromDate: new Date().toISOString().split("T")[0],
    toDate:   new Date().toISOString().split("T")[0],
    uhid:     "",
    ipNumber: "",
  });

  const todayDisplay = new Date().toLocaleDateString("en-GB");

  // Has this admission already been shifted (has active, non-cancelled shift)?
  const alreadyShifted = form.has_shifted === true;

  // ── Fetch shifting history ─────────────────────────────────────────────────
  const fetchShiftings = async () => {
    try {
      const p = new URLSearchParams();
      if (filters.fromDate) p.append("from_date", filters.fromDate);
      if (filters.toDate)   p.append("to_date",   filters.toDate);
      if (filters.uhid)     p.append("uhid",      filters.uhid);
      if (filters.ipNumber) p.append("ip_number", filters.ipNumber);
      const res  = await apiRequest(`${HmsBaseUrl}room-shifting/?${p.toString()}`, "GET");
      const data = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
      setShiftings(data);
    } catch (err) { console.error("fetchShiftings:", err); }
  };

  useEffect(() => { fetchShiftings(); }, []);

  // ── Rooms fetch ───────────────────────────────────────────────────────────
  const fetchAllRooms = async (fo = {}) => {
    setLoadRooms(true);
    try {
      const f = { ...rFilter, ...fo };
      const p = new URLSearchParams();
      if (f.room_number) p.append("room_number", f.room_number);
      if (f.block)       p.append("block",       f.block);
      if (f.floor)       p.append("floor",       f.floor);
      const q   = p.toString() ? `?${p.toString()}` : "";
      const res = await apiRequest(`${HmsBaseUrl}search-rooms/${q}`, "GET");
      setAllRooms(Array.isArray(res) ? res : res.data || []);
    } catch { setAllRooms([]); }
    finally { setLoadRooms(false); }
  };

  const grouped = (() => {
    const g = {};
    allRooms.forEach(r => {
      const bl = r.block || "UNKNOWN", fl = r.floor ?? "?";
      if (!g[bl]) g[bl] = {};
      if (!g[bl][fl]) g[bl][fl] = [];
      g[bl][fl].push(r);
    });
    return g;
  })();

  const handleRoomClick = room => {
    const s = getRoomStatus(room.beds);
    if (s === "occupied" || s === "maintenance") return;
    setSelRoom(room); setShowRoom(false); setShowBed(true);
  };

  const handleBedSelect = (bedNo, room) => {
    const r = room || selRoom;
    if (!r) return;
    setForm(p => ({ ...p, newRoomNo: r.room_number, newBedNo: bedNo }));
    setShowBed(false); setShowRoom(false);
    toast.success(`Room ${r.room_number} / Bed ${bedNo} selected`);
  };

  // ── Fetch by UHID ─────────────────────────────────────────────────────────
  const fetchByUHID = async () => {
    const uhid = form.uhid.trim();
    if (!uhid) return toast.warning("Enter UHID");

    try {
      const res = await apiRequest(
        `${HmsBaseUrl}get_active_admission/?uhid=${encodeURIComponent(uhid)}`,
        "GET"
      );

      const adm     = res?.data?.data ?? res?.data ?? res;
      const patient = adm?.patient || {};

      if (!adm?.ipNumber && !adm?.uhid) {
        return toast.error("No active admission found");
      }

      setForm(prev => ({
        ...prev,
        uhid:            adm.uhid             || "",
        ipNumber:        adm.ipNumber         || "",
        ipserial_number: String(adm.ipserial_number ?? ""),
        admittedOn:      adm.admissionDate    || "",
        admittedTime:    adm.admissionTime    || "",
        roomNo:          adm.roomNo           || "",
        bedNo:           adm.bedNo            || "",
        name:            patient.patientname  || "",
        age:             patient.age          || "",
        gender:          patient.gender       || "",
        city:            patient.city         || "",
        state:           patient.state        || "",
        area:            patient.area         || "",
        zipcode:         patient.zipcode      || "",
        has_shifted:     adm.has_shifted      || false,
        newRoomNo:       "",
        newBedNo:        "",
      }));

      if (adm.has_shifted) {
        toast.info("Admission already shifted. You can edit or cancel the existing shift.");
      } else {
        toast.success(`Admission loaded: ${adm.ipNumber}`);
      }

    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to fetch admission");
    }
  };

  // ── Fetch by IP Number ────────────────────────────────────────────────────
  const fetchByIP = async () => {
    const ip = form.ipNumber.trim();
    if (!ip) return toast.warning("Enter IP Number");
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}get_active_admission/?ip_number=${encodeURIComponent(ip)}`,
        "GET"
      );

      const adm     = res?.data?.data ?? res?.data ?? res;
      const patient = adm?.patient || {};

      if (!adm?.ipNumber && !adm?.uhid) {
        return toast.error("No active admission found");
      }

      setForm(prev => ({
        ...prev,
        uhid:            adm.uhid             || "",
        ipNumber:        adm.ipNumber         || "",
        ipserial_number: String(adm.ipserial_number ?? ""),
        admittedOn:      adm.admissionDate    || "",
        admittedTime:    adm.admissionTime    || "",
        roomNo:          adm.roomNo           || "",
        bedNo:           adm.bedNo            || "",
        name:            patient.patientname  || "",
        age:             patient.age          || "",
        gender:          patient.gender       || "",
        city:            patient.city         || "",
        state:           patient.state        || "",
        area:            patient.area         || "",
        zipcode:         patient.zipcode      || "",
        has_shifted:     adm.has_shifted      || false,
        newRoomNo:       "",
        newBedNo:        "",
      }));

      if (adm.has_shifted) {
        toast.info("Admission already shifted. You can edit the existing shift.");
      } else {
        toast.success(`Admission loaded: ${adm.ipNumber}`);
      }

    } catch (err) {
      toast.error(err?.message || "Admission not found");
    }
  };

  const handleReset = () => setForm(EMPTY);

  // ── Save Shift ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const { uhid, ipNumber, newRoomNo, newBedNo } = form;

    if (!ipNumber && !uhid) return toast.warning("Enter UHID or IP Number first");
    if (!newRoomNo || !newBedNo) return toast.warning("Select a new room and bed");

    const payload = { ip_number: ipNumber, uhid, newRoomNo, newBedNo };

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
      toast.error(
        err?.response?.data?.error || err?.message || "An error occurred while shifting room"
      );
    }
  };

  // ── Edit save — passes ip_number for the PATCH URL ─────────────────────────
const handleEditSave = async (shiftingId, updates, ipNumber) => {
  try {
    const ip = ipNumber || form.ipNumber;
    const res = await apiRequest(
      `${HmsBaseUrl}room-shifting/${encodeURIComponent(ip)}/update/`,  // ← add /update/
      "PATCH",
      { shifting_id: shiftingId, ...updates }
    );
    if (res.success || res.message) {
      toast.success("Updated successfully — new shifting record created");
      setEditOpen(false);
      fetchShiftings();
    } else { toast.error(res.error || "Update failed"); }
  } catch { toast.error("Update failed"); }
};

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
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
                onKeyDown={e => e.key === "Enter" && fetchByUHID()}
                placeholder="Enter UHID"
              />
              <InlineSearchButton onClick={fetchByUHID} />
            </InputWrapper>

            <InputWrapper>
              <Label>IP Number</Label>
              <Input
                type="text"
                value={form.ipNumber}
                onChange={e => setForm(p => ({ ...p, ipNumber: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && fetchByIP()}
                placeholder="Enter IP No"
              />
              <InlineSearchButton onClick={fetchByIP} />
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

          {/* ── Already-shifted banner ── */}
          {alreadyShifted && (
            <FormRow>
              <ShiftedBanner>
                ⚠️ This patient has already been shifted to a new room. To make changes, use
                the&nbsp;<strong>Edit</strong>
                button in the shifting history table below.
              </ShiftedBanner>
            </FormRow>
          )}

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
            <InputWrapper style={{ gridColumn: "1 / -1" }}>
              <Label>Address</Label>
              <ReadOnlyInput value={buildAddress(form)} readOnly />
            </InputWrapper>
          </FormRow>

          {/* ── Current Room ── */}
          <FormRow>
            <SectionLabel>Current Room</SectionLabel>

            <InputWrapper>
              <Label>Current Room No</Label>
              <ReadOnlyInput value={form.roomNo} readOnly />
            </InputWrapper>

            <InputWrapper>
              <Label>Current Bed No</Label>
              <ReadOnlyInput value={form.bedNo} readOnly />
            </InputWrapper>
          </FormRow>

          {/* ── New Room Assignment ── */}
          <FormRow>
            <SectionLabel>New Room Assignment</SectionLabel>

            <InputWrapper>
              <Label>New Room No</Label>
              {alreadyShifted ? (
                <DisabledInput value={form.newRoomNo} readOnly placeholder="Already shifted" />
              ) : (
                <>
                  <ReadOnlyInput
                    value={form.newRoomNo}
                    readOnly
                    placeholder="Click 🔍 to search rooms"
                  />
                  <InlineSearchButton onClick={() => { setShowRoom(true); fetchAllRooms(); }} />
                </>
              )}
            </InputWrapper>

            <InputWrapper>
              <Label>New Bed No</Label>
              {alreadyShifted ? (
                <DisabledInput value={form.newBedNo} readOnly placeholder="Already shifted" />
              ) : (
                <ReadOnlyInput
                  value={form.newBedNo}
                  readOnly
                  placeholder="Auto-filled on room selection"
                  style={{ background: "#f3f4f6" }}
                />
              )}
            </InputWrapper>

            <InputWrapper>
              <Label>Shifting Date</Label>
              <ReadOnlyInput
                value={todayDisplay}
                readOnly
                title="Shifting date & time recorded automatically by server"
              />
            </InputWrapper>
          </FormRow>

          <ButtonContainer>
            <Button secondary type="button" onClick={handleReset}>🔄 Reset</Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={alreadyShifted}
              style={alreadyShifted ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              title={alreadyShifted ? "Already shifted — use Edit" : ""}
            >
              💾 Save Shift
            </Button>
          </ButtonContainer>
        </FormContent>

        {/* ── Filters ── */}
        <FilterSection>
          <FilterRow>
            <InputWrapper>
              <Label>From Date</Label>
              <Input type="date" value={filters.fromDate}
                onChange={e => setFilters(p => ({ ...p, fromDate: e.target.value }))} />
            </InputWrapper>
            <InputWrapper>
              <Label>To Date</Label>
              <Input type="date" value={filters.toDate}
                onChange={e => setFilters(p => ({ ...p, toDate: e.target.value }))} />
            </InputWrapper>
            <InputWrapper>
              <Label>UHID</Label>
              <Input value={filters.uhid}
                onChange={e => setFilters(p => ({ ...p, uhid: e.target.value }))} />
            </InputWrapper>
            <InputWrapper>
              <Label>IP Number</Label>
              <Input value={filters.ipNumber}
                onChange={e => setFilters(p => ({ ...p, ipNumber: e.target.value }))} />
            </InputWrapper>
            <div style={{ display:"flex", alignItems:"flex-end" }}>
              <Button type="button" onClick={fetchShiftings}>🔍 Search</Button>
            </div>
          </FilterRow>
        </FilterSection>

        {/* ── Shifting History Table ── */}
        <TableSection>
          <TableControls>
            <ShowEntries>
              Show
              <EntriesSelect value={entriesPerPage} onChange={e => setEntries(Number(e.target.value))}>
                {[10,15,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
              </EntriesSelect>
              entries
            </ShowEntries>
            <span style={{ fontSize:"0.8rem", color:colors.textMuted }}>{shiftings.length} record(s)</span>
          </TableControls>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Actions</Th>
                  <Th>Shift #</Th>
                  <Th>UHID</Th>
                  <Th>IP Number</Th>
                  <Th>IP Serial</Th>
                  <Th>Patient Name</Th>
                  <Th>Old Room / Bed</Th>
                  <Th>New Room / Bed</Th>
                  <Th>Shifting Date &amp; Time</Th>
                </tr>
              </thead>
              <tbody>
                {shiftings.length === 0 ? (
                  <Tr>
                    <Td colSpan="10" style={{ textAlign:"center", padding:"40px", color:colors.textMuted }}>
                      No room shifting records found
                    </Td>
                  </Tr>
                ) : (
                  shiftings.slice(0, entriesPerPage).map((s, idx) => {
                    const shiftId     = s.shifting_id || s._id;

                    const shiftDateStr = s.shiftingDateTime
                      ? new Date(s.shiftingDateTime).toLocaleString("en-GB", {
                          day:"2-digit", month:"2-digit", year:"numeric",
                          hour:"2-digit", minute:"2-digit",
                        })
                      : "-";

                    return (
                      <Tr key={`${shiftId}-${idx}`}>
                        <Td>
                            <>
                              <ActionBtn
                                type="button"
                                title="Edit (creates new record)"
                                onClick={() => { setEditRecord({ ...s }); setEditOpen(true); }}
                              >
                                ✏️ Edit
                              </ActionBtn>
                            </>
                        </Td>
                        <Td style={{ fontWeight:700, color:colors.primary }}>{shiftId}</Td>
                        <Td>{s.uhid            || "-"}</Td>
                        <Td>{s.ipNumber        || "-"}</Td>
                        <Td>{s.ipserial_number || "-"}</Td>
                        <Td>{s.patient_name    || "-"}</Td>
                        <Td>{`${form.roomNo||"-"} / ${form.bedNo}`}</Td>
                        <Td>{`${s.newRoomNo||"-"} / ${s.newBedNo||"-"}`}</Td>
                        <Td>{shiftDateStr}</Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </TableSection>
      </Container>

      {/* ══ ROOM PICKER MODAL ══════════════════════════════════════════════ */}
      {showRoom && (
        <ModalOverlay onClick={() => setShowRoom(false)}>
          <RMC onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🏨 Select Room</ModalTitle>
              <CloseButton onClick={() => setShowRoom(false)}>×</CloseButton>
            </ModalHeader>
            <RMB>
              <FBR>
                {[["room_number","Room Number","e.g. 101"],["block","Block","e.g. A"]].map(([k,lbl,ph]) => (
                  <FFR key={k}>
                    <FLR>{lbl}</FLR>
                    <FIR placeholder={ph} value={rFilter[k]}
                      onChange={e => setRFilter(p => ({ ...p, [k]:e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && fetchAllRooms()} />
                  </FFR>
                ))}
                <FFR>
                  <FLR>Floor</FLR>
                  <FIR type="number" placeholder="e.g. 2" value={rFilter.floor}
                    onChange={e => setRFilter(p => ({ ...p, floor:e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && fetchAllRooms()} />
                </FFR>
                <FBR2 onClick={() => fetchAllRooms()}>Search</FBR2>
                <FBR2 clear onClick={() => {
                  setRFilter({ room_number:"", block:"", floor:"" });
                  fetchAllRooms({ room_number:"", block:"", floor:"" });
                }}>Clear</FBR2>
              </FBR>

              <LBar>
                {[["#22c55e","Available"],["#3b82f6","Partial"],["#ef4444","Occupied"],["#f59e0b","Maintenance"]].map(([c,l]) => (
                  <LI key={l}><LD c={c}/>{l}</LI>
                ))}
              </LBar>

              {loadRooms ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))", gap:8 }}>
                  {Array.from({ length:12 }).map((_, i) => <Skel key={i} />)}
                </div>
              ) : Object.keys(grouped).length === 0 ? <NR>No rooms found.</NR>
              : Object.entries(grouped).map(([block, floors], bIdx) => (
                <BS2 key={block} i={bIdx}>
                  <BH2>🏢 Block {block}</BH2>
                  {Object.entries(floors).sort(([a],[b]) => Number(a) - Number(b)).map(([floor, rooms]) => (
                    <FG2 key={floor}>
                      <FL2>Floor {floor}</FL2>
                      <RG2>
                        {rooms.map(room => {
                          const s = getRoomStatus(room.beds);
                          return (
                            <RC key={room.room_number} s={s} onClick={() => handleRoomClick(room)}>
                              <RCT s={s}>
                                <RNum>{room.room_number}</RNum>
                                <RSP s={s}>{s === "partial" ? "Partial" : s}</RSP>
                              </RCT>
                              <RT2>{room.room_type}{room.room_category ? ` · ${room.room_category}` : ""}</RT2>
                              <BRow>
                                {(room.beds || []).map((bed, i) => (
                                  <BC key={i} bs={bed.status} disabled={bed.status !== "Available"}
                                    onClick={e => {
                                      if (bed.status === "Available") {
                                        e.stopPropagation();
                                        handleBedSelect(bed.bed_number, room);
                                      }
                                    }}>
                                    {bed.bed_number}
                                  </BC>
                                ))}
                              </BRow>
                            </RC>
                          );
                        })}
                      </RG2>
                    </FG2>
                  ))}
                </BS2>
              ))}
            </RMB>
          </RMC>
        </ModalOverlay>
      )}

      {showBed && selRoom && (
        <BedModal room={selRoom} onClose={() => setShowBed(false)} onSelect={handleBedSelect} />
      )}

      {/* Edit Modal */}
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