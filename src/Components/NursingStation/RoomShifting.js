import { useState, useEffect, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import { toast } from "react-toastify";

import {
  PageWrapper,
  Container,
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
  color: white;
  padding: 14px 20px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;
const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
`;
const PageSubtitle = styled.p`
  margin: 2px 0 0;
  font-size: 0.75rem;
  opacity: 0.85;
  color: #fff;
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
  width: 100%;
  box-sizing: border-box;
  background: ${T.white};
  border: 1px solid ${T.gray200};
  border-radius: ${T.radiusSm};
  padding: 10px 12px;
`;

const FFR = styled.div`display: flex; flex-direction: column; gap: 3px; flex: 1 1 140px; min-width: 120px;`;
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

const FSelR = styled.select`
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
  cursor: pointer;
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
const BedMiniSVG = ({ color = "#64748b", size = 16 }) => (
  <svg width={size} height={Math.round(size * 0.7)} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M1 14V3C1 2.45 1.45 2 2 2C2.55 2 3 2.45 3 3V9H13V5C13 4.45 13.45 4 14 4H22C22.55 4 23 4.45 23 5V14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1 10H23" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M5 6C5 5.45 5.45 5 6 5H8C8.55 5 9 5.45 9 6C9 6.55 8.55 7 8 7H6C5.45 7 5 6.55 5 6Z" fill={color} />
    <path d="M2 14V16M22 14V16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const RG2 = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 8px;
  margin-bottom: 10px;
`;

const RC = styled.div`
  border: 1.5px solid ${p => p.hasOccupied ? "#fca5a5" : "#e2e8f0"};
  border-radius: 7px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: all 0.14s ease;
  display: flex;
  flex-direction: column;
  &:hover {
    border-color: ${p => p.hasOccupied ? "#ef4444" : "#0d9488"};
    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  }
`;

const RCT = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 8px;
  background: ${p => p.hasOccupied ? "#fff5f5" : "#f8fafc"};
  border-bottom: 1px solid ${p => p.hasOccupied ? "#fee2e2" : "#e2e8f0"};
`;

const RNum = styled.span`
  font-size: 0.78rem;
  font-weight: 800;
  color: #0f172a;
`;

const CategoryTag = styled.span`
  font-size: 0.58rem;
  font-weight: 700;
  color: #64748b;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 1px 5px;
  border-radius: 4px;
  text-transform: uppercase;
  max-width: 95px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BedCountPill = styled.span`
  font-size: 0.58rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 10px;
  background: ${p => p.available > 0 ? "#dcfce7" : "#fee2e2"};
  color: ${p => p.available > 0 ? "#15803d" : "#b91c1c"};
`;

const BRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 5px;
  padding: 6px 8px;
`;

const BC = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 3px;
  height: 48px;
  border-radius: 5px;
  border: 1.5px solid ${p => p.cfg?.border || "#cbd5e1"};
  background: ${p => p.cfg?.light || "#f1f5f9"};
  cursor: ${p => p.isAv ? "pointer" : "not-allowed"};
  opacity: ${p => p.isAv ? 1 : 0.65};
  transition: all 0.12s ease;
  outline: none;
  user-select: none;
  box-sizing: border-box;

  ${p => p.isAv && css`
    &:hover {
      transform: scale(1.05);
      border-color: ${p.cfg?.color || "#16a34a"};
      box-shadow: 0 2px 8px rgba(22, 163, 74, 0.25);
    }
  `}
`;

const Skel = styled.div`height: 100px; border-radius: 7px; background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%); background-size: 200% 100%; animation: ${pulse} 1.4s ease-in-out infinite;`;
const NR = styled.div`text-align: center; padding: 30px; color: ${T.gray400}; font-size: .82rem;`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getRoomStatus = beds => {
  if (!beds?.length) return "available";
  const s = beds.map(b => (b.status || ""));
  if (s.every(x => x === "Maintenance"))             return "maintenance";
  if (s.every(x => x === "Occupied"))                return "occupied";
  if (s.every(x => x === "Reserved"))                return "reserved";
  if (s.every(x => x === "Available - Not Cleaned")) return "not cleaned";
  // mixed occupied + available/not-cleaned → partial
  if (s.some(x => x === "Occupied") && s.some(x => x === "Available" || x === "Available - Not Cleaned")) return "partial";
  if (s.some(x => x === "Occupied"))                 return "partial";
  if (s.some(x => x === "Reserved"))                 return "reserved";
  if (s.some(x => x === "Available - Not Cleaned"))  return "not cleaned";
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
  const [statusFilter, setStatusFilter] = useState("Available");
  const [filter,   setFilter]   = useState({ room_number: "", block: "", category: "", nursing_station: "" });

  const fetchRooms = async (fo = {}) => {
    setLoading(true);
    try {
      const f = { ...filter, ...fo };
      const p = new URLSearchParams();
      if (f.room_number) p.append("room_number", f.room_number);
      if (f.block && f.block !== "ALL") p.append("block", f.block);
      if (f.category && f.category !== "ALL") p.append("room_category", f.category);
      if (f.nursing_station && f.nursing_station !== "ALL") p.append("nursing_station", f.nursing_station);
      const res = await apiRequest(
        `${baseUrl}admission-room-search/${p.toString() ? `?${p}` : ""}`,
        "GET"
      );
      const rooms = Array.isArray(res)
        ? res
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setAllRooms(rooms);
    } catch (err) {
      console.error("fetchRooms error:", err);
      setAllRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const roomFilterOptions = useMemo(() => {
    const blocks = new Set();
    const categories = new Set();
    const stations = new Set();
    allRooms.forEach(r => {
      if (r.block) blocks.add(r.block);
      const cat = r.room_category || r.room_type;
      if (cat) categories.add(cat);
      if (r.nursing_station) stations.add(r.nursing_station);
    });
    return {
      blocks: Array.from(blocks).sort(),
      categories: Array.from(categories).sort(),
      stations: Array.from(stations).sort(),
    };
  }, [allRooms]);

  const grouped = useMemo(() => {
    const g = {};
    allRooms
      .filter(r => {
        if (filter.block && filter.block !== "ALL" && String(r.block || "").toLowerCase() !== filter.block.toLowerCase()) return false;
        if (filter.category && filter.category !== "ALL") {
          const cat = String(r.room_category || r.room_type || "");
          if (cat.toLowerCase() !== filter.category.toLowerCase()) return false;
        }
        if (filter.nursing_station && filter.nursing_station !== "ALL") {
          const st = String(r.nursing_station || "");
          if (st.toLowerCase() !== filter.nursing_station.toLowerCase()) return false;
        }
        if (filter.room_number && !String(r.room_number || "").toLowerCase().includes(filter.room_number.toLowerCase())) return false;
        return true;
      })
      .map(r => {
        const beds = (r.beds || []).filter(b => {
          if (statusFilter === "ALL") return true;
          const bs = (b.status || b.bed_status || "").toLowerCase();
          if (statusFilter === "Available") return bs === "available";
          if (statusFilter === "Occupied") return bs === "occupied";
          if (statusFilter === "Not Cleaned") return bs.includes("clean");
          if (statusFilter === "Reserved") return bs === "reserved" || bs === "booked";
          if (statusFilter === "Maintenance") return bs === "maintenance" || bs === "blocked";
          return true;
        });
        return { ...r, filteredBeds: beds };
      })
      .filter(r => statusFilter === "ALL" || r.filteredBeds.length > 0)
      .forEach(r => {
        const bl = r.block || "MAIN BLOCK";
        const fl = r.nursing_station || (r.floor ? `Floor ${r.floor}` : "General Ward");
        if (!g[bl]) g[bl] = {};
        if (!g[bl][fl]) g[bl][fl] = [];
        g[bl][fl].push(r);
      });
    return g;
  }, [allRooms, filter, statusFilter]);

  const roomStats = useMemo(() => {
    let total = 0, available = 0, occupied = 0, notCleaned = 0, reserved = 0, maintenance = 0;
    allRooms.forEach(room => {
      (room.beds || []).forEach(b => {
        total++;
        const bs = (b.status || b.bed_status || "").toLowerCase();
        if (bs === "available") available++;
        else if (bs === "occupied") occupied++;
        else if (bs.includes("clean")) notCleaned++;
        else if (bs === "reserved" || bs === "booked") reserved++;
        else maintenance++;
      });
    });
    return { total, available, occupied, notCleaned, reserved, maintenance };
  }, [allRooms]);

  const handleRoomClick = room => {
    if (getRoomStatus(room.beds) === "maintenance") return;
    const hasAvail = (room.beds||[]).some(b => b.status === "Available");
    if (!hasAvail) return;
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
              <FFR>
                <FLR>Room No</FLR>
                <FIR
                  placeholder="e.g. 101"
                  value={filter.room_number}
                  onChange={e => setFilter(p => ({ ...p, room_number: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && fetchRooms()}
                />
              </FFR>

              <FFR>
                <FLR>Block</FLR>
                <FSelR
                  value={filter.block || "ALL"}
                  onChange={e => setFilter(p => ({ ...p, block: e.target.value }))}
                >
                  <option value="ALL">🏢 All Blocks</option>
                  {roomFilterOptions.blocks.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </FSelR>
              </FFR>

              <FFR>
                <FLR>Category</FLR>
                <FSelR
                  value={filter.category || "ALL"}
                  onChange={e => setFilter(p => ({ ...p, category: e.target.value }))}
                >
                  <option value="ALL">🏷️ All Categories</option>
                  {roomFilterOptions.categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </FSelR>
              </FFR>

              <FFR>
                <FLR>Nursing Station</FLR>
                <FSelR
                  value={filter.nursing_station || "ALL"}
                  onChange={e => setFilter(p => ({ ...p, nursing_station: e.target.value }))}
                >
                  <option value="ALL">🩺 All Stations</option>
                  {roomFilterOptions.stations.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </FSelR>
              </FFR>

              <FBR2 onClick={() => fetchRooms()}>Search</FBR2>
              <FBR2
                clear
                onClick={() => {
                  const cl = { room_number: "", block: "", category: "", nursing_station: "" };
                  setFilter(cl);
                  setStatusFilter("Available");
                  fetchRooms(cl);
                }}
              >
                Clear
              </FBR2>
            </FBR>

            {/* Bed Status Filter Pills */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12, padding: "8px 12px", background: "#ffffff", border: `1px solid ${T.gray200}`, borderRadius: T.radiusSm }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: T.gray500, textTransform: "uppercase" }}>
                  🎨 Status Filter:
                </span>
                {[
                  { status: "ALL", label: "All Beds", count: roomStats.total, color: T.primary, light: "#f0fdfa", border: "#99f6e4" },
                  { status: "Available", label: "Available", count: roomStats.available, color: "#16a34a", light: "#dcfce7", border: "#86efac" },
                  { status: "Occupied", label: "Occupied", count: roomStats.occupied, color: "#dc2626", light: "#fee2e2", border: "#fca5a5" },
                  { status: "Not Cleaned", label: "Not Cleaned", count: roomStats.notCleaned, color: "#d97706", light: "#fef3c7", border: "#fde047" },
                  { status: "Reserved", label: "Reserved", count: roomStats.reserved, color: "#7c3aed", light: "#ede9fe", border: "#d8b4fe" },
                  { status: "Maintenance", label: "Maintenance", count: roomStats.maintenance, color: "#64748b", light: "#f1f5f9", border: "#cbd5e1" },
                ].map(item => {
                  const active = statusFilter === item.status;
                  return (
                    <button
                      key={item.status}
                      type="button"
                      onClick={() => setStatusFilter(prev => prev === item.status ? "ALL" : item.status)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "3px 9px",
                        borderRadius: 20,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        border: `1.5px solid ${active ? item.color : item.border}`,
                        background: active ? item.color : item.light,
                        color: active ? "#ffffff" : item.color,
                        cursor: "pointer",
                        transition: "all 0.12s ease",
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "#ffffff" : item.color }} />
                      <span>{item.label}</span>
                      <span style={{
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        padding: "0 4px",
                        borderRadius: 10,
                        background: active ? "rgba(255,255,255,0.3)" : "#ffffff",
                        color: active ? "#ffffff" : item.color,
                        border: active ? "none" : `1px solid ${item.border}`,
                      }}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: "0.68rem", color: T.gray500 }}>
                Defaulting to <strong style={{ color: "#16a34a" }}>Available</strong> beds
              </div>
            </div>

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))", gap: 8 }}>
                {Array.from({ length: 12 }).map((_, i) => <Skel key={i} />)}
              </div>
            ) : Object.keys(grouped).length === 0 ? <NR>No rooms found matching filter.</NR>
            : Object.entries(grouped).map(([block, floors], bIdx) => (
              <BS2 key={block} i={bIdx}>
                <BH2>🏢 Block {block}</BH2>
                {Object.entries(floors).map(([floor, rooms]) => (
                  <FG2 key={floor}>
                    <FL2>📍 {floor}</FL2>
                    <RG2>
                      {rooms.map(room => {
                        const availableBeds = (room.beds || []).filter(bd => (bd.status || bd.bed_status || "").toLowerCase() === "available").length;
                        const occupiedBeds = (room.beds || []).filter(bd => (bd.status || bd.bed_status || "").toLowerCase() === "occupied").length;
                        const hasOcc = occupiedBeds > 0;

                        return (
                          <RC key={room.room_number} hasOccupied={hasOcc}>
                            <RCT hasOccupied={hasOcc}>
                              <RNum>Room {room.room_number}</RNum>
                              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                <CategoryTag>{room.room_type || room.room_category || "General"}</CategoryTag>
                                <BedCountPill available={availableBeds}>
                                  {availableBeds}/{room.beds?.length || 0} Ready
                                </BedCountPill>
                              </div>
                            </RCT>
                            <BRow>
                              {(room.filteredBeds || room.beds || []).map((bed, i) => {
                                const bs = (bed.status || bed.bed_status || "Available").trim();
                                const bsLower = bs.toLowerCase();
                                const isAv = bsLower === "available";
                                const isOcc = bsLower === "occupied";
                                const isCl = bsLower.includes("clean");
                                const isRes = bsLower === "reserved" || bsLower === "booked";

                                const cfg = isAv
                                  ? { color: "#16a34a", light: "#dcfce7", border: "#86efac", label: "Ready" }
                                  : isOcc
                                  ? { color: "#dc2626", light: "#fee2e2", border: "#fca5a5", label: "Occupied" }
                                  : isCl
                                  ? { color: "#d97706", light: "#fef3c7", border: "#fde047", label: "Unclean" }
                                  : isRes
                                  ? { color: "#7c3aed", light: "#ede9fe", border: "#d8b4fe", label: "Reserved" }
                                  : { color: "#64748b", light: "#f1f5f9", border: "#cbd5e1", label: "Blocked" };

                                return (
                                  <BC
                                    key={i}
                                    cfg={cfg}
                                    isAv={isAv}
                                    disabled={!isAv}
                                    title={isAv ? `✅ Bed ${bed.bed_number} — Click to select` : `Bed ${bed.bed_number} (${bs})`}
                                    onClick={e => {
                                      if (isAv) {
                                        e.stopPropagation();
                                        handleBedSelect(bed.bed_number, room);
                                      }
                                    }}
                                  >
                                    <BedMiniSVG color={cfg.color} size={15} />
                                    <span style={{ fontSize: ".66rem", fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
                                      B{bed.bed_number}
                                    </span>
                                    <span style={{ fontSize: ".48rem", fontWeight: 700, color: cfg.color, textTransform: "uppercase" }}>
                                      {cfg.label}
                                    </span>
                                  </BC>
                                );
                              })}
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
const RoomShifting = ({ patient, onClose, onSaved }) => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [activeTab,     setActiveTab] = useState("create");
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

  const fetchShiftings = async (customFilters = null) => {
    try {
      const isFilterObj = customFilters && typeof customFilters === "object" && !customFilters._reactName && !customFilters.nativeEvent && !customFilters.target;
      const activeFilters = isFilterObj ? customFilters : filters;
      const p = new URLSearchParams();
      if (activeFilters.fromDate) p.append("from_date", activeFilters.fromDate);
      if (activeFilters.toDate)   p.append("to_date",   activeFilters.toDate);
      if (activeFilters.uhid)     p.append("uhid",      activeFilters.uhid.trim());
      if (activeFilters.ipNumber) p.append("ip_number", activeFilters.ipNumber.trim());
      const res  = await apiRequest(`${HmsBaseUrl}room-shifting/?${p}`, "GET");
      const data = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
      setShiftings(data);
    } catch (err) { console.error("fetchShiftings:", err); }
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      fromDate: new Date().toISOString().split("T")[0],
      toDate:   new Date().toISOString().split("T")[0],
      uhid: "", ipNumber: "",
    };
    setFilters(defaultFilters);
    fetchShiftings(defaultFilters);
  };

  useEffect(() => {
    if (patient) {
      const uhid = patient.uhid || patient.patient_details?.uhid;
      const ipNumber = patient.ipNumber || patient.patient_details?.ipNumber;
      if (uhid || ipNumber) {
        const newFilters = { ...filters, uhid: uhid || "", ipNumber: ipNumber || "" };
        setFilters(newFilters);
        if (ipNumber) loadAdmission({ ip_number: ipNumber });
        else loadAdmission({ uhid: uhid });
        fetchShiftings(newFilters);
      }
    } else {
      fetchShiftings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient]);

  const loadAdmission = async (params) => {
    try {
      const qs  = new URLSearchParams(params).toString();
      const res = await apiRequest(`${HmsBaseUrl}get_active_admission/?${qs}`, "GET");
      if (!res.success) {
        setForm(prev => ({
          ...EMPTY,
          uhid: params.uhid !== undefined ? params.uhid : prev.uhid,
          ipNumber: params.ip_number !== undefined ? params.ip_number : prev.ipNumber,
        }));
        return toast.error(res.error || res.message || "No active admission found");
      }
      const adm = res?.data?.data ?? res?.data ?? res;
      const patient = adm?.patient || {};

      if (!adm?.ipNumber && !adm?.uhid) {
        setForm(prev => ({
          ...EMPTY,
          uhid: params.uhid !== undefined ? params.uhid : prev.uhid,
          ipNumber: params.ip_number !== undefined ? params.ip_number : prev.ipNumber,
        }));
        return toast.error("No active admission found");
      }

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
      if (res.success || res.message) { 
        toast.success("Room shifted successfully!"); 
        handleReset(); 
        if (onSaved && typeof onSaved === "function") {
          onSaved();
        } else {
          fetchShiftings(); 
        }
      }
      else toast.error(res.error || "Failed to shift room");
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "An error occurred");
    }
  };

  const handleEditSave = async (shiftingId, updates, ipNumber) => {
    try {
      const ip  = ipNumber || form.ipNumber;
      const res = await apiRequest(`${HmsBaseUrl}room-shifting/${encodeURIComponent(ip)}/update/`, "PUT", { shifting_id: shiftingId, ...updates });
      if (res.success || res.message) { toast.success("Updated — new shifting record created"); setEditOpen(false); fetchShiftings(); }
      else toast.error(res.error || "Update failed");
    } catch { toast.error("Update failed"); }
  };

  return (
    <PageWrapper style={{ fontFamily: T.font }}>
      <Container>

        {/* ── Header with Tabs ── */}
        <PageHeader>
          <div>
            <PageTitle>🏥 Room Shifting</PageTitle>
            <PageSubtitle>Patient Room &amp; Bed Shifting Management</PageSubtitle>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { id: "create", label: "+ Shift Room" },
              { id: "list", label: "📋 Shifting List" }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "list") fetchShiftings();
                }}
                style={
                  activeTab === tab.id
                    ? {
                        background: "white",
                        color: "#0d9488",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 14px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }
                    : {
                        background: "rgba(255,255,255,0.18)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.35)",
                        borderRadius: 6,
                        padding: "6px 14px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </PageHeader>

        {activeTab === "create" && (
          <>
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
                ⚠️ This patient has already been shifted. Use <strong style={{ margin: "0 4px" }}>Edit</strong> in the shifting history tab.
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
          </>
        )}

        {activeTab === "list" && (
          /* ── Filters & Table ── */
          <Card>
            <CardTitle>📋 Shifting History</CardTitle>
            <Grid style={{ marginBottom: 14 }}>
              <Field label="From Date" value={filters.fromDate} type="date"
                onChange={e => setFilters(p => ({ ...p, fromDate: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && fetchShiftings(filters)} />
              <Field label="To Date" value={filters.toDate} type="date"
                onChange={e => setFilters(p => ({ ...p, toDate: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && fetchShiftings(filters)} />
              <Field label="UHID" value={filters.uhid}
                onChange={e => setFilters(p => ({ ...p, uhid: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && fetchShiftings(filters)} />
              <Field label="IP Number" value={filters.ipNumber}
                onChange={e => setFilters(p => ({ ...p, ipNumber: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && fetchShiftings(filters)} />
            </Grid>
            <BtnRow style={{ justifyContent: "flex-start", gap: 8, marginBottom: 16 }}>
              <Btn type="button" onClick={() => fetchShiftings(filters)}>🔍 Search</Btn>
              <Btn type="button" style={{ background: "#94a3b8" }} onClick={handleResetFilters}>↺ Reset</Btn>
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
        )}
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