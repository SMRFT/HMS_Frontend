import { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { toast } from "react-toastify";

import {
  PageWrapper,
  Container,
  colors,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
} from "../GlobalStyles";
import apiRequest from "../../Auth/apiRequest";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  primary:    "#0d9488",
  primaryLt:  "#f0fdfa",
  primaryMd:  "#99f6e4",
  danger:     "#ef4444",
  warn:       "#f59e0b",
  purple:     "#a855f7",
  purpleLt:   "#fdf4ff",
  gray50:     "#f9fafb",
  gray100:    "#f3f4f6",
  gray200:    "#e5e7eb",
  gray400:    "#9ca3af",
  gray500:    "#6b7280",
  gray700:    "#374151",
  gray900:    "#111827",
  white:      "#ffffff",
  radius:     "8px",
  radiusSm:   "6px",
  shadow:     "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:   "0 4px 12px rgba(0,0,0,0.08)",
  font:       "'DM Sans', 'Segoe UI', sans-serif",
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn   = keyframes`from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}`;
const pulse    = keyframes`0%,100%{opacity:1}50%{opacity:.4}`;
const slideUp  = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;

// ─── Layout ────────────────────────────────────────────────────────────────────
const Card = styled.div`
  background: ${T.white};
  border: 1px solid ${T.gray200};
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: ${T.shadow};
  animation: ${fadeIn} .3s ease both;
`;

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
  font-size: .92rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: .04em;
`;

const CardTitle = styled.div`
  font-size: .7rem;
  font-weight: 700;
  color: ${T.primary};
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${T.gray200};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

// ─── Field ─────────────────────────────────────────────────────────────────────
const FieldLabel = styled.label`
  display: block;
  font-size: .7rem;
  font-weight: 600;
  color: ${T.gray500};
  margin-bottom: 4px;
  letter-spacing: .02em;
`;

const FieldNote = styled.span`
  font-size: .6rem;
  font-weight: 600;
  color: ${T.purple};
  margin-left: 5px;
`;

// ─── Input with optional icon inside ──────────────────────────────────────────
const InputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 36px;
  padding: 0 ${p => p.hasBtn ? '36px' : '10px'} 0 10px;
  font-size: .82rem;
  font-family: ${T.font};
  color: ${T.gray900};
  background: ${p => p.readOnly ? T.gray50 : T.white};
  border: 1.5px solid ${T.gray200};
  border-radius: ${T.radiusSm};
  outline: none;
  box-sizing: border-box;
  transition: border-color .15s, box-shadow .15s;
  cursor: ${p => p.readOnly ? 'default' : 'text'};

  &:focus {
    border-color: ${T.primary};
    box-shadow: 0 0 0 3px rgba(13,148,136,.1);
  }

  &::placeholder {
    color: ${T.gray400};
    font-size: .78rem;
  }

  &:disabled {
    background: ${T.gray100};
    color: ${T.gray400};
    cursor: not-allowed;
  }
`;

const SearchIconBtn = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-left: 1.5px solid ${T.gray200};
  border-radius: 0 ${T.radiusSm} ${T.radiusSm} 0;
  color: ${p => p.disabled ? T.gray400 : T.primary};
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  font-size: .9rem;
  transition: background .15s, color .15s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: ${T.primaryLt};
    color: ${T.primary};
  }
`;

// Input + optional search button
const Field = ({ label, note, value, onChange, onKeyDown, onSearch, readOnly, disabled, placeholder, type = "text", fullWidth }) => (
  <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
    <FieldLabel>
      {label}
      {note && <FieldNote>{note}</FieldNote>}
    </FieldLabel>
    <InputWrap>
      <StyledInput
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={placeholder}
        hasBtn={!!onSearch}
      />
      {onSearch && (
        <SearchIconBtn type="button" onClick={onSearch} disabled={disabled} title="Search">
          🔍
        </SearchIconBtn>
      )}
    </InputWrap>
  </div>
);

// ─── Banners ──────────────────────────────────────────────────────────────────
const Banner = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: ${T.radiusSm};
  font-size: .8rem;
  font-weight: 600;
  border: 1.5px solid ${p => p.variant === 'purple' ? '#d8b4fe' : '#fcd34d'};
  background: ${p => p.variant === 'purple' ? T.purpleLt : '#fffbeb'};
  color: ${p => p.variant === 'purple' ? '#6b21a8' : '#92400e'};
  animation: ${fadeIn} .3s ease;
`;

// ─── Buttons ─────────────────────────────────────────────────────────────────
const Btn = styled.button`
  height: 36px;
  padding: 0 18px;
  font-size: .82rem;
  font-weight: 600;
  font-family: ${T.font};
  border-radius: ${T.radiusSm};
  border: 1.5px solid ${p => p.secondary ? T.gray200 : 'transparent'};
  background: ${p => p.secondary ? T.white : T.primary};
  color: ${p => p.secondary ? T.gray700 : T.white};
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? .5 : 1};
  transition: all .15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover:not(:disabled) {
    background: ${p => p.secondary ? T.gray50 : '#0b7a70'};
    border-color: ${p => p.secondary ? T.gray200 : 'transparent'};
  }
`;

const BtnRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
`;

// ─── Status badge ─────────────────────────────────────────────────────────────
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: .68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  color: #fff;
  background: ${p =>
    p.s === 'available'   ? '#22c55e' :
    p.s === 'occupied'    ? '#ef4444' :
    p.s === 'not cleaned' ? '#f59e0b' :
    p.s === 'booked'      ? '#a855f7' :
    p.s === 'reserved'    ? '#a855f7' :
    p.s === 'maintenance' ? '#6b7280' :
    p.s === 'partial'     ? '#3b82f6' :
    p.s === 'active'      ? '#22c55e' :
                            '#9ca3af'};
`;

// ─── Table ────────────────────────────────────────────────────────────────────
const TableWrap = styled.div`
  overflow-x: auto;
  border: 1px solid ${T.gray200};
  border-radius: ${T.radius};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: .78rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 10px 12px;
  font-size: .68rem;
  font-weight: 700;
  color: ${T.gray500};
  text-transform: uppercase;
  letter-spacing: .06em;
  background: ${T.gray50};
  border-bottom: 1px solid ${T.gray200};
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 10px 12px;
  color: ${T.gray700};
  border-bottom: 1px solid ${T.gray100};
  vertical-align: middle;
`;

const Tr = styled.tr`
  transition: background .1s;
  &:hover { background: ${T.gray50}; }
  &:last-child td { border-bottom: none; }
`;

const ActionBtn = styled.button`
  background: none;
  border: 1px solid ${T.gray200};
  color: ${T.gray500};
  border-radius: 4px;
  padding: 3px 8px;
  font-size: .72rem;
  cursor: pointer;
  transition: all .12s;
  &:hover { background: ${T.gray50}; border-color: ${T.primary}; color: ${T.primary}; }
`;

// ─── Room Picker Styled Components ────────────────────────────────────────────
const RMC = styled(ModalContainer)`max-width: 980px; max-height: 88vh;`;
const RMB = styled(ModalBody)`background: ${T.gray50}; padding: 16px;`;

const FBR = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  align-items: flex-end;
  background: ${T.white};
  border: 1px solid ${T.gray200};
  border-radius: ${T.radiusSm};
  padding: 10px 12px;
`;

const FFR = styled.div`display: flex; flex-direction: column; gap: 3px; flex: 1 1 120px;`;
const FLR = styled.label`font-size: .68rem; font-weight: 700; color: ${T.gray500}; text-transform: uppercase; letter-spacing: .04em;`;

const FIR = styled.input`
  height: 32px;
  padding: 0 8px;
  font-size: .78rem;
  border: 1.5px solid ${T.gray200};
  border-radius: ${T.radiusSm};
  background: ${T.white};
  outline: none;
  width: 100%;
  box-sizing: border-box;
  font-family: ${T.font};
  &:focus { border-color: ${T.primary}; box-shadow: 0 0 0 3px rgba(13,148,136,.1); }
`;

const FBR2 = styled.button`
  height: 32px;
  padding: 0 14px;
  font-size: .78rem;
  font-weight: 600;
  border-radius: ${T.radiusSm};
  border: none;
  cursor: pointer;
  background: ${p => p.clear ? T.gray500 : T.primary};
  color: #fff;
  align-self: flex-end;
  transition: opacity .12s;
  &:hover { opacity: .88; }
`;

const LBar = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  padding: 8px 12px;
  background: ${T.white};
  border: 1px solid ${T.gray200};
  border-radius: ${T.radiusSm};
`;
const LI = styled.div`display: flex; align-items: center; gap: 5px; font-size: .72rem; font-weight: 500; color: ${T.gray500};`;
const LD = styled.span`display: inline-block; width: 10px; height: 10px; border-radius: 3px; background: ${p => p.c}; flex-shrink: 0;`;

const BS2 = styled.div`
  background: ${T.white};
  border: 1px solid ${T.gray200};
  border-radius: ${T.radius};
  margin-bottom: 12px;
  overflow: hidden;
  animation: ${slideUp} .22s ease both;
  animation-delay: ${p => p.i * 40}ms;
`;
const BH2 = styled.div`padding: 8px 14px; background: ${T.primaryLt}; border-bottom: 1px solid ${T.gray200}; font-size: .8rem; font-weight: 700; color: ${T.primary};`;
const FG2 = styled.div`padding: 12px 14px;`;
const FL2 = styled.div`font-size: .68rem; font-weight: 700; color: ${T.gray500}; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; &::after { content: ""; flex: 1; height: 1px; background: ${T.gray200}; }`;
const RG2 = styled.div`display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin-bottom: 8px;`;

const rC = {
  available:    { bg: "#f0fdf4", br: "#86efac", hd: "#dcfce7" },
  occupied:     { bg: "#fff1f2", br: "#fca5a5", hd: "#fee2e2" },
  "not cleaned":{ bg: "#fffbeb", br: "#fcd34d", hd: "#fef3c7" },
  partial:      { bg: "#eff6ff", br: "#93c5fd", hd: "#dbeafe" },
  booked:       { bg: "#fdf4ff", br: "#d8b4fe", hd: "#f3e8ff" },
  reserved:     { bg: "#fdf4ff", br: "#d8b4fe", hd: "#f3e8ff" },
  maintenance:  { bg: "#f3f4f6", br: "#d1d5db", hd: "#e5e7eb" },
};

const RC = styled.div`
  border: 1.5px solid ${p => rC[p.s]?.br || T.gray200};
  border-radius: 7px;
  overflow: hidden;
  cursor: ${p => ['occupied','booked','reserved','not cleaned'].includes(p.s) ? 'not-allowed' : 'pointer'};
  opacity: ${p => ['occupied','booked','reserved','not cleaned'].includes(p.s) ? 0.7 : 1};
  background: ${p => rC[p.s]?.bg || T.white};
  transition: box-shadow .15s, transform .15s;
  &:hover:not([style*="not-allowed"]) { box-shadow: 0 4px 12px rgba(0,0,0,.1); }
`;

const RCT = styled.div`display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; background: ${p => rC[p.s]?.hd || '#f1f5f9'}; border-bottom: 1px solid ${p => rC[p.s]?.br || T.gray200};`;
const RNum = styled.span`font-size: .8rem; font-weight: 700; color: ${T.gray900};`;
const RSP = styled.span`
  font-size: .58rem; font-weight: 700; padding: 2px 6px; border-radius: 10px; text-transform: capitalize; color: #fff;
  background: ${p =>
    p.s === 'available'   ? '#22c55e' :
    p.s === 'occupied'    ? '#ef4444' :
    p.s === 'not cleaned' ? '#f59e0b' :
    p.s === 'booked'      ? '#a855f7' :
    p.s === 'reserved'    ? '#a855f7' :
    p.s === 'maintenance' ? '#6b7280' : '#3b82f6'};
`;

const BRow = styled.div`display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px;`;
const BC = styled.button`
  flex: 1 1 auto;
  min-width: 40px;
  text-align: center;
  padding: 3px 5px;
  border-radius: 4px;
  font-size: .66rem;
  font-weight: 600;
  border: none;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  color: #fff;
  background: ${p =>
    p.bs === "Available"             ? "#22c55e" :
    p.bs === "Available - Not Cleaned" ? "#f59e0b" :
    p.bs === "Occupied"              ? "#ef4444" :
    p.bs === "Reserved"              ? "#a855f7" :
    p.bs === "Booked"                ? "#a855f7" :
    p.bs === "Maintenance"           ? "#6b7280" : "#6b7280"};
  opacity: ${p => p.disabled ? .5 : 1};
  transition: filter .1s;
  &:hover:not(:disabled) { filter: brightness(1.1); }
`;

const RT2 = styled.span`font-size: .62rem; color: ${T.gray500}; padding: 0 8px 5px; display: block;`;
const Skel = styled.div`height: 100px; border-radius: 7px; background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%); background-size: 200% 100%; animation: ${pulse} 1.4s ease-in-out infinite;`;
const NR = styled.div`text-align: center; padding: 30px; color: ${T.gray400}; font-size: .82rem;`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getRoomStatus = beds => {
  if (!beds?.length) return "available";
  const s = beds.map(b => (b.status || "").toLowerCase());
  if (s.every(x => x === "maintenance")) return "maintenance";
  if (s.every(x => x === "occupied")) return "occupied";
  if (s.every(x => x === "reserved" || x === "booked")) return "booked";
  if (s.every(x => x === "occupied" || x === "reserved" || x === "booked")) return "occupied";
  if (s.some(x => x === "occupied" || x === "reserved" || x === "booked") && s.some(x => x === "available" || x === "available - not cleaned")) return "partial";
  if (s.every(x => x === "available - not cleaned")) return "not cleaned";
  return "available";
};

const isBedSelectable = bed => bed.status === "Available";

const formatDuration = (start, end) => {
  if (!start) return "-";
  const s = new Date(start), e = end ? new Date(end) : new Date();
  const ms = e - s;
  if (isNaN(ms) || ms < 0) return "-";
  const days = Math.floor(ms / 86400000), hours = Math.floor((ms % 86400000) / 3600000), mins = Math.floor((ms % 3600000) / 60000);
  if (days > 0)  return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const buildAddress = ({ area, city, state, zipcode } = {}) =>
  [area, city, state, zipcode].filter(Boolean).join(", ");

// ─── Bed Modal ────────────────────────────────────────────────────────────────
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: 12 }}>
            {(room.beds || []).map((bed, i) => {
              const avail = isBedSelectable(bed);
              return (
                <BC key={i} bs={bed.status} disabled={!avail}
                  style={{ minWidth: 72, height: 44, fontSize: ".82rem", flex: "1 1 72px" }}
                  onClick={() => avail && onSelect(bed.bed_number, room)}>
                  {bed.bed_number}<br />
                  <span style={{ fontSize: ".6rem", opacity: .85 }}>{bed.status}</span>
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

// ─── Room Picker Modal ────────────────────────────────────────────────────────
const RoomPickerModal = ({ title, onClose, onSelect, baseUrl }) => {
  const [allRooms, setAllRooms] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [showBed,  setShowBed]  = useState(false);
  const [selRoom,  setSelRoom]  = useState(null);
  const [filter,   setFilter]   = useState({ room_number: "", block: "", floor: "" });

  const fetchRooms = async (fo = {}) => {
    setLoading(true);
    try {
      const f = { ...filter, ...fo };
      const p = new URLSearchParams();
      if (f.room_number) p.append("room_number", f.room_number);
      if (f.block)       p.append("block",       f.block);
      if (f.floor)       p.append("floor",       f.floor);
      const res = await apiRequest(`${baseUrl}search-rooms/${p.toString() ? `?${p}` : ""}`, "GET");
      setAllRooms(Array.isArray(res) ? res : res.data || []);
    } catch { setAllRooms([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRooms(); }, []);

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
    if (["occupied","maintenance","booked","not cleaned","reserved"].includes(getRoomStatus(room.beds))) return;
    setSelRoom(room); setShowBed(true);
  };

  const handleBedSelect = (bedNo, room) => {
    const r = room || selRoom;
    if (!r) return;
    onSelect(r.room_number, bedNo);
    toast.success(`Room ${r.room_number} / Bed ${bedNo} selected`);
  };

  return (
    <>
      <ModalOverlay onClick={onClose}>
        <RMC onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>🏨 {title || "Select Room"}</ModalTitle>
            <CloseButton onClick={onClose}>×</CloseButton>
          </ModalHeader>
          <RMB>
            <FBR>
              {[["room_number","Room No","e.g. 101"], ["block","Block","e.g. A"]].map(([k, lbl, ph]) => (
                <FFR key={k}>
                  <FLR>{lbl}</FLR>
                  <FIR placeholder={ph} value={filter[k]}
                    onChange={e => setFilter(p => ({ ...p, [k]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && fetchRooms()} />
                </FFR>
              ))}
              <FFR>
                <FLR>Floor</FLR>
                <FIR type="number" placeholder="e.g. 2" value={filter.floor}
                  onChange={e => setFilter(p => ({ ...p, floor: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && fetchRooms()} />
              </FFR>
              <FBR2 onClick={() => fetchRooms()}>Search</FBR2>
              <FBR2 clear onClick={() => { const cl = { room_number: "", block: "", floor: "" }; setFilter(cl); fetchRooms(cl); }}>Clear</FBR2>
            </FBR>

            <LBar>
              {[["#22c55e","Available"],["#f59e0b","Not Cleaned"],["#ef4444","Occupied"],["#a855f7","Reserved/Booked"],["#6b7280","Maintenance"]].map(([c, l]) => (
                <LI key={l}><LD c={c} />{l}</LI>
              ))}
            </LBar>

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 8 }}>
                {Array.from({ length: 12 }).map((_, i) => <Skel key={i} />)}
              </div>
            ) : Object.keys(grouped).length === 0 ? <NR>No rooms found.</NR>
            : Object.entries(grouped).map(([block, floors], bIdx) => (
              <BS2 key={block} i={bIdx}>
                <BH2>🏢 Block {block}</BH2>
                {Object.entries(floors).sort(([a], [b]) => Number(a) - Number(b)).map(([floor, rooms]) => (
                  <FG2 key={floor}>
                    <FL2>Floor {floor}</FL2>
                    <RG2>
                      {rooms.map(room => {
                        const s = getRoomStatus(room.beds);
                        return (
                          <RC key={room.room_number} s={s} onClick={() => handleRoomClick(room)}>
                            <RCT s={s}>
                              <RNum>{room.room_number}</RNum>
                              <RSP s={s}>{s === "partial" ? "Partial" : s === "not cleaned" ? "Not Cleaned" : s.charAt(0).toUpperCase() + s.slice(1)}</RSP>
                            </RCT>
                            <RT2>{room.room_type}{room.room_category ? ` · ${room.room_category}` : ""}</RT2>
                            <BRow>
                              {(room.beds || []).map((bed, i) => (
                                <BC key={i} bs={bed.status} disabled={!isBedSelectable(bed)}
                                  onClick={e => { if (isBedSelectable(bed)) { e.stopPropagation(); handleBedSelect(bed.bed_number, room); } }}>
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
      {showBed && selRoom && <BedModal room={selRoom} onClose={() => setShowBed(false)} onSelect={handleBedSelect} />}
    </>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({ open, record, onClose, onSave, baseUrl }) => {
  const [newRoomNo, setNewRoomNo] = useState("");
  const [newBedNo,  setNewBedNo]  = useState("");
  const [showRoom,  setShowRoom]  = useState(false);

  useEffect(() => {
    if (record) { setNewRoomNo(record.newRoomNo || ""); setNewBedNo(record.newBedNo || ""); }
  }, [record]);

  if (!open || !record) return null;

  return (
    <>
      <ModalOverlay>
        <ModalContainer style={{ maxWidth: 480 }}>
          <ModalHeader>
            <ModalTitle>Edit Shift — #{record.shifting_id}</ModalTitle>
            <CloseButton onClick={onClose}>✕</CloseButton>
          </ModalHeader>
          <ModalBody style={{ padding: 20 }}>
            <Banner variant="warn" style={{ marginBottom: 14 }}>
              ⚠️ Editing creates a new record and marks this one inactive.
            </Banner>
            <Grid style={{ marginBottom: 16 }}>
              <Field
                label="New Room No"
                value={newRoomNo}
                readOnly
                placeholder="Click 🔍 to pick a room"
                onSearch={() => setShowRoom(true)}
              />
              <Field
                label="New Bed No"
                value={newBedNo}
                readOnly
                placeholder="Auto-filled"
              />
            </Grid>
            <BtnRow>
              <Btn secondary type="button" onClick={onClose}>Cancel</Btn>
              <Btn type="button"
                onClick={() => onSave(record.shifting_id, { newRoomNo, newBedNo }, record.ipNumber)}
                disabled={!newRoomNo || !newBedNo}>
                💾 Update
              </Btn>
            </BtnRow>
          </ModalBody>
        </ModalContainer>
      </ModalOverlay>

      {showRoom && (
        <RoomPickerModal
          title="Select New Room (Edit)"
          baseUrl={baseUrl}
          onClose={() => setShowRoom(false)}
          onSelect={(roomNo, bedNo) => { setNewRoomNo(roomNo); setNewBedNo(bedNo); setShowRoom(false); }}
        />
      )}
    </>
  );
};

// ─── EMPTY FORM ───────────────────────────────────────────────────────────────
const EMPTY = {
  uhid: "", ipNumber: "", ipserial_number: "",
  name: "", age: "", gender: "",
  area: "", city: "", state: "", zipcode: "",
  admittedOn: "", admittedTime: "",
  roomNo: "", bedNo: "",
  newRoomNo: "", newBedNo: "",
  has_shifted: false,
  has_reservation: false,
  reservedRoomNo: "", reservedBedNo: "",
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const RoomShifting = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [form,          setForm]      = useState(EMPTY);
  const [showRoom,      setShowRoom]  = useState(false);
  const [shiftings,     setShiftings] = useState([]);
  const [entriesPerPage,setEntries]   = useState(15);
  const [editRecord,    setEditRecord]= useState(null);
  const [editOpen,      setEditOpen]  = useState(false);
  const [filters, setFilters] = useState({
    fromDate: new Date().toISOString().split("T")[0],
    toDate:   new Date().toISOString().split("T")[0],
    uhid: "", ipNumber: "",
  });

  const todayDisplay  = new Date().toLocaleDateString("en-GB");
  const alreadyShifted = form.has_shifted === true;

  const fetchShiftings = async () => {
    try {
      const p = new URLSearchParams();
      if (filters.fromDate) p.append("from_date", filters.fromDate);
      if (filters.toDate)   p.append("to_date",   filters.toDate);
      if (filters.uhid)     p.append("uhid",      filters.uhid);
      if (filters.ipNumber) p.append("ip_number", filters.ipNumber);
      const res  = await apiRequest(`${HmsBaseUrl}room-shifting/?${p}`, "GET");
      const data = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
      setShiftings(data);
    } catch (err) { console.error("fetchShiftings:", err); }
  };

  useEffect(() => { fetchShiftings(); }, []);

  const loadAdmission = async (params) => {
    try {
      const qs  = new URLSearchParams(params).toString();
      const res = await apiRequest(`${HmsBaseUrl}get_active_admission/?${qs}`, "GET");
      const adm = res?.data?.data ?? res?.data ?? res;
      const patient = adm?.patient || {};

      if (!adm?.ipNumber && !adm?.uhid) return toast.error("No active admission found");

      const hasRes = adm.has_reservation === true;
      setForm(prev => ({
        ...prev,
        uhid:            adm.uhid              || "",
        ipNumber:        adm.ipNumber          || "",
        ipserial_number: String(adm.ipserial_number ?? ""),
        admittedOn:      adm.admissionDate     || "",
        admittedTime:    adm.admissionTime     || "",
        roomNo:          adm.roomNo            || "",
        bedNo:           adm.bedNo             || "",
        name:            patient.patientname   || "",
        age:             patient.age           || "",
        gender:          patient.gender        || "",
        city:            patient.city          || "",
        state:           patient.state         || "",
        area:            patient.area          || "",
        zipcode:         patient.zipcode       || "",
        has_shifted:     adm.has_shifted       || false,
        has_reservation: hasRes,
        reservedRoomNo:  adm.reservedRoomNo    || "",
        reservedBedNo:   adm.reservedBedNo     || "",
        newRoomNo: (!adm.has_shifted && hasRes) ? adm.reservedRoomNo : "",
        newBedNo:  (!adm.has_shifted && hasRes) ? adm.reservedBedNo  : "",
      }));

      if (adm.has_shifted) toast.info("Already shifted — use Edit in the table.");
      else if (hasRes) toast.success(`Loaded: ${adm.ipNumber} — Reserved room auto-filled.`);
      else toast.success(`Admission loaded: ${adm.ipNumber}`);
    } catch (err) {
      toast.error(err?.message || "Failed to fetch admission");
    }
  };

  const fetchByUHID = () => { const u = form.uhid.trim(); if (!u) return toast.warning("Enter UHID"); loadAdmission({ uhid: u }); };
  const fetchByIP   = () => { const ip = form.ipNumber.trim(); if (!ip) return toast.warning("Enter IP Number"); loadAdmission({ ip_number: ip }); };
  const handleReset = () => setForm(EMPTY);

  const handleSubmit = async () => {
    const { uhid, ipNumber, newRoomNo, newBedNo } = form;
    if (!ipNumber && !uhid) return toast.warning("Enter UHID or IP Number first");
    if (!newRoomNo || !newBedNo) return toast.warning("Select a new room and bed");
    try {
      const res = await apiRequest(`${HmsBaseUrl}room-shifting/`, "POST", { ip_number: ipNumber, uhid, newRoomNo, newBedNo });
      if (res.success || res.message) { toast.success("Room shifted successfully!"); handleReset(); fetchShiftings(); }
      else toast.error(res.error || "Failed to shift room");
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "An error occurred");
    }
  };

  const handleEditSave = async (shiftingId, updates, ipNumber) => {
    try {
      const ip  = ipNumber || form.ipNumber;
      const res = await apiRequest(`${HmsBaseUrl}room-shifting/${encodeURIComponent(ip)}/update/`, "PATCH", { shifting_id: shiftingId, ...updates });
      if (res.success || res.message) { toast.success("Updated — new shifting record created"); setEditOpen(false); fetchShiftings(); }
      else toast.error(res.error || "Update failed");
    } catch { toast.error("Update failed"); }
  };

  return (
    <PageWrapper style={{ fontFamily: T.font }}>
      <Container>

        {/* ── Header ── */}
        <PageHeader>
          <PageTitle>🏥 Room Shifting</PageTitle>
        </PageHeader>

        {/* ── Patient Lookup ── */}
        <Card>
          <CardTitle>🔎 Patient Lookup</CardTitle>
          <Grid>
            <Field label="UHID" value={form.uhid}
              onChange={e => setForm(p => ({ ...p, uhid: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && fetchByUHID()}
              onSearch={fetchByUHID}
              placeholder="Enter UHID" />
            <Field label="IP Number" value={form.ipNumber}
              onChange={e => setForm(p => ({ ...p, ipNumber: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && fetchByIP()}
              onSearch={fetchByIP}
              placeholder="Enter IP No" />
            <Field label="IP Serial No" value={form.ipserial_number} readOnly />
            <Field label="Patient Name" value={form.name} readOnly />
          </Grid>
        </Card>

        {/* ── Banners ── */}
        {form.has_reservation && !alreadyShifted && (
          <Banner variant="purple" style={{ marginBottom: 12 }}>
            🟣 Pre-reserved: <strong style={{ marginLeft: 4 }}>Room {form.reservedRoomNo} / Bed {form.reservedBedNo}</strong>&nbsp;— auto-filled below. You may change if needed.
          </Banner>
        )}
        {alreadyShifted && (
          <Banner variant="warn" style={{ marginBottom: 12 }}>
            ⚠️ This patient has already been shifted. Use <strong style={{ margin: "0 4px" }}>Edit</strong> in the history table below.
          </Banner>
        )}

        {/* ── Patient Details ── */}
        <Card>
          <CardTitle>👤 Patient Details</CardTitle>
          <Grid>
            <Field label="Age"           value={form.age}         readOnly />
            <Field label="Gender"        value={form.gender}      readOnly />
            <Field label="Admitted On"   value={form.admittedOn}  readOnly type="date" />
            <Field label="Admitted Time" value={form.admittedTime}readOnly type="time" />
            <Field label="Address" value={buildAddress(form)} readOnly fullWidth />
          </Grid>
        </Card>

        {/* ── Room Assignment ── */}
        <Card>
          <CardTitle>🛏️ Room Assignment</CardTitle>
          <Grid>
            <Field label="Current Room No" value={form.roomNo} readOnly />
            <Field label="Current Bed No"  value={form.bedNo}  readOnly />
          </Grid>

          <div style={{ height: 1, background: T.gray200, margin: "14px 0" }} />

          <Grid>
            <Field
              label="New Room No"
              note={form.has_reservation && !alreadyShifted ? "(Pre-reserved)" : ""}
              value={form.newRoomNo}
              readOnly
              placeholder={alreadyShifted ? "Already shifted" : "Click 🔍 to search"}
              onSearch={alreadyShifted ? undefined : () => setShowRoom(true)}
              disabled={alreadyShifted}
            />
            <Field
              label="New Bed No"
              value={form.newBedNo}
              readOnly
              placeholder="Auto-filled on selection"
              disabled={alreadyShifted}
            />
            <Field label="Shifting Date" value={todayDisplay} readOnly />
          </Grid>

          <BtnRow style={{ marginTop: 16 }}>
            <Btn secondary type="button" onClick={handleReset}>🔄 Reset</Btn>
            <Btn type="button" onClick={handleSubmit} disabled={alreadyShifted}
              title={alreadyShifted ? "Already shifted — use Edit" : ""}>
              💾 Save Shift
            </Btn>
          </BtnRow>
        </Card>

        {/* ── Filters ── */}
        <Card>
          <CardTitle>📋 Shifting History</CardTitle>
          <Grid style={{ marginBottom: 14 }}>
            <Field label="From Date" value={filters.fromDate} type="date"
              onChange={e => setFilters(p => ({ ...p, fromDate: e.target.value }))} />
            <Field label="To Date" value={filters.toDate} type="date"
              onChange={e => setFilters(p => ({ ...p, toDate: e.target.value }))} />
            <Field label="UHID" value={filters.uhid}
              onChange={e => setFilters(p => ({ ...p, uhid: e.target.value }))} />
            <Field label="IP Number" value={filters.ipNumber}
              onChange={e => setFilters(p => ({ ...p, ipNumber: e.target.value }))} />
          </Grid>
          <BtnRow style={{ justifyContent: "flex-start", gap: 8, marginBottom: 16 }}>
            <Btn type="button" onClick={fetchShiftings}>🔍 Search</Btn>
          </BtnRow>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".8rem", color: T.gray500 }}>
              Show
              <select value={entriesPerPage} onChange={e => setEntries(Number(e.target.value))}
                style={{ height: 30, padding: "0 6px", border: `1px solid ${T.gray200}`, borderRadius: T.radiusSm, fontSize: ".8rem", background: T.white }}>
                {[10, 15, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              entries
            </div>
            <span style={{ fontSize: ".78rem", color: T.gray400 }}>{shiftings.length} record(s)</span>
          </div>

          <TableWrap>
            <Table>
              <thead>
                <tr>
                  {["Shift #","UHID","IP Number","IP Serial","Patient Name","Room / Bed","Shifting Date & Time","Duration","Status","Actions"].map(h => (
                    <Th key={h}>{h}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shiftings.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: "center", padding: 40, color: T.gray400, fontSize: ".82rem" }}>
                      No room shifting records found
                    </td>
                  </tr>
                ) : (
                  shiftings.slice(0, entriesPerPage).map((s, idx) => {
                    const shiftId = s.shifting_id || s._id;
                    const shiftDateStr = s.shiftingDateTime
                      ? new Date(s.shiftingDateTime).toLocaleString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" })
                      : "-";
                    const duration = formatDuration(s.startDateTime, s.endDateTime || null);
                    const isActive = s.is_roomActive;

                    return (
                      <Tr key={`${shiftId}-${idx}`}>
                        <Td style={{ fontWeight: 700, color: T.primary }}>
                          {shiftId}
                          {s.edited_from && <span title={`Edited from ${s.edited_from}`} style={{ fontSize: ".6rem", color: T.gray400, marginLeft: 4 }}>✏️</span>}
                        </Td>
                        <Td>{s.uhid              || "-"}</Td>
                        <Td>{s.ipNumber          || "-"}</Td>
                        <Td>{s.ipserial_number   || "-"}</Td>
                        <Td style={{ fontWeight: 500 }}>{s.patient_name || "-"}</Td>
                        <Td><span style={{ fontFamily: "monospace", fontSize: ".8rem" }}>{`${s.newRoomNo||"-"} / ${s.newBedNo||"-"}`}</span></Td>
                        <Td style={{ whiteSpace: "nowrap" }}>{shiftDateStr}</Td>
                        <Td>
                          <span style={{ fontSize: ".76rem", fontWeight: 600, color: isActive ? T.primary : T.gray400 }}>
                            {duration}
                            {isActive && <span style={{ fontSize: ".6rem", color: "#22c55e", marginLeft: 4 }}>(ongoing)</span>}
                          </span>
                        </Td>
                        <Td>
                          <Badge s={isActive ? "active" : "inactive"}>{isActive ? "Active" : "Inactive"}</Badge>
                        </Td>
                        <Td>
                          {isActive && (
                            <ActionBtn type="button" onClick={() => { setEditRecord({ ...s }); setEditOpen(true); }}>
                              ✏️ Edit
                            </ActionBtn>
                          )}
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </TableWrap>
        </Card>
      </Container>

      {showRoom && (
        <RoomPickerModal
          title="Select New Room"
          baseUrl={HmsBaseUrl}
          onClose={() => setShowRoom(false)}
          onSelect={(roomNo, bedNo) => { setForm(p => ({ ...p, newRoomNo: roomNo, newBedNo: bedNo })); setShowRoom(false); }}
        />
      )}

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