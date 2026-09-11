import React, { useState, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS — Vivid & Clean Hospital Palette
   ───────────────────────────────────────────────────────────── */
const T = {
  primary:    "#0d9488",
  primaryDk:  "#0f766e",
  primaryLt:  "#f0fdfa",
  primaryMd:  "#ccfbf1",
  green:      "#16a34a",
  greenLt:    "#dcfce7",
  greenDk:    "#15803d",
  greenBorder:"#86efac",
  red:        "#dc2626",
  redLt:      "#fee2e2",
  redDk:      "#b91c1c",
  redBorder:  "#fca5a5",
  amber:      "#d97706",
  amberLt:    "#fef3c7",
  amberDk:    "#b45309",
  amberBorder:"#fde047",
  purple:     "#7c3aed",
  purpleLt:   "#ede9fe",
  purpleDk:   "#6d28d9",
  purpleBorder:"#d8b4fe",
  gray:       "#64748b",
  grayLt:     "#f1f5f9",
  grayDk:     "#334155",
  grayBorder: "#cbd5e1",
  white:      "#ffffff",
  border:     "#e2e8f0",
  bg:         "#f8fafc",
  textMain:   "#0f172a",
  textMuted:  "#64748b",
  shadowSm:   "0 1px 3px rgba(0,0,0,0.06)",
  shadowMd:   "0 4px 14px rgba(0,0,0,0.08)",
  radius:     "8px",
  radiusSm:   "5px",
  font:       "'DM Sans', 'Inter', system-ui, sans-serif",
};

const BED_STATUS = {
  OCCUPIED:     "Occupied",
  AVAILABLE:    "Available",
  NOT_CLEANED:  "Not Cleaned",
  RESERVED:     "Reserved",
  MAINTENANCE:  "Maintenance",
};

const STATUS_CFG = {
  [BED_STATUS.OCCUPIED]: {
    color: T.red,
    light: T.redLt,
    dark: T.redDk,
    border: T.redBorder,
    label: "Occupied",
  },
  [BED_STATUS.AVAILABLE]: {
    color: T.green,
    light: T.greenLt,
    dark: T.greenDk,
    border: T.greenBorder,
    label: "Available",
  },
  [BED_STATUS.NOT_CLEANED]: {
    color: T.amber,
    light: T.amberLt,
    dark: T.amberDk,
    border: T.amberBorder,
    label: "Not Cleaned",
  },
  [BED_STATUS.RESERVED]: {
    color: T.purple,
    light: T.purpleLt,
    dark: T.purpleDk,
    border: T.purpleBorder,
    label: "Reserved",
  },
  [BED_STATUS.MAINTENANCE]: {
    color: T.gray,
    light: T.grayLt,
    dark: T.grayDk,
    border: T.grayBorder,
    label: "Maintenance",
  },
};

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.35; }`;
const fadeUp = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); }`;

/* ── Mini Bed Icon ── */
const BedMiniSVG = ({ color = "#64748b", size = 18 }) => (
  <svg width={size} height={Math.round(size * 0.7)} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M1 14V3C1 2.45 1.45 2 2 2C2.55 2 3 2.45 3 3V9H13V5C13 4.45 13.45 4 14 4H22C22.55 4 23 4.45 23 5V14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 10H23" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M5 6C5 5.45 5.45 5 6 5H8C8.55 5 9 5.45 9 6C9 6.55 8.55 7 8 7H6C5.45 7 5 6.55 5 6Z" fill={color}/>
    <path d="M2 14V16M22 14V16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

/* ── Styled Components ── */
const GridContainer = styled.div`
  padding: 10px 14px;
  background: ${T.bg};
  font-family: ${T.font};
`;

const FilterToolbar = styled.div`
  background: ${T.white};
  border: 1px solid ${T.border};
  border-radius: 7px;
  padding: 8px 12px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: ${T.shadowSm};
`;

const FilterGroup = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 550px) {
    grid-template-columns: 1fr;
  }
`;

const SearchInpWrap = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInp = styled.input`
  width: 100%;
  box-sizing: border-box;
  height: 32px;
  padding: 0 8px 0 28px;
  font-size: 0.76rem;
  font-family: ${T.font};
  border: 1px solid ${T.border};
  border-radius: 5px;
  background: ${T.bg};
  color: ${T.textMain};
  outline: none;
  &:focus {
    background: #fff;
    border-color: ${T.primary};
    box-shadow: 0 0 0 2px rgba(13,148,136,0.15);
  }
  &::placeholder { color: ${T.textMuted}; }
`;

const FilterSelect = styled.select`
  width: 100%;
  box-sizing: border-box;
  height: 32px;
  padding: 0 8px;
  font-size: 0.76rem;
  font-family: ${T.font};
  border: 1px solid ${T.border};
  border-radius: 5px;
  background: ${T.bg};
  color: ${T.textMain};
  outline: none;
  cursor: pointer;
  &:focus {
    background: #fff;
    border-color: ${T.primary};
    box-shadow: 0 0 0 2px rgba(13,148,136,0.15);
  }
`;

const ColorLegendStrip = styled.div`
  background: ${T.white};
  border: 1px solid ${T.border};
  border-radius: 7px;
  padding: 6px 10px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  box-shadow: ${T.shadowSm};
`;

const ColorCodePill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 700;
  font-family: ${T.font};
  border: 1.5px solid ${p => p.active ? p.cfg.color : p.cfg.border};
  background: ${p => p.active ? p.cfg.color : p.cfg.light};
  color: ${p => p.active ? "#ffffff" : p.cfg.dark};
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    border-color: ${p => p.cfg.color};
    transform: translateY(-1px);
  }
`;

const ColorDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${p => p.active ? "#ffffff" : p.color};
  flex-shrink: 0;
`;

const CountBubble = styled.span`
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0 4px;
  border-radius: 10px;
  background: ${p => p.active ? "rgba(255,255,255,0.3)" : "#ffffff"};
  color: ${p => p.active ? "#ffffff" : p.cfg.dark};
  border: ${p => p.active ? "none" : `1px solid ${p.cfg.border}`};
`;

const BlockWrap = styled.div`
  margin-bottom: 12px;
  animation: ${fadeUp} 0.25s ease both;
`;

const BlockTitle = styled.div`
  font-size: 0.76rem;
  font-weight: 800;
  color: ${T.primaryDk};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${T.primaryMd};
  }
`;

const FloorWrap = styled.div`
  margin-bottom: 8px;
`;

const FloorTitle = styled.div`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${T.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
`;

const RoomGridSt = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 8px;
`;

const RoomCard = styled.div`
  background: ${T.white};
  border: 1.5px solid ${p => p.hasOccupied ? T.redBorder : T.border};
  border-radius: 7px;
  box-shadow: ${T.shadowSm};
  overflow: hidden;
  transition: all 0.14s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: ${p => p.hasOccupied ? T.red : T.primary};
    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  }
`;

const RoomHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 8px;
  background: ${p => p.hasOccupied ? "#fff5f5" : "#f8fafc"};
  border-bottom: 1px solid ${p => p.hasOccupied ? "#fee2e2" : T.border};
`;

const RoomNo = styled.div`
  font-size: 0.78rem;
  font-weight: 800;
  color: ${T.textMain};
`;

const CategoryTag = styled.span`
  font-size: 0.58rem;
  font-weight: 700;
  color: ${T.textMuted};
  background: ${T.white};
  border: 1px solid ${T.border};
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
  background: ${p => p.available > 0 ? T.greenLt : T.redLt};
  color: ${p => p.available > 0 ? T.greenDk : T.redDk};
`;

const BedTilesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(66px, 1fr));
  gap: 5px;
  padding: 6px 8px;
`;

const BedTile = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 5px 4px;
  height: 48px;
  border-radius: 5px;
  border: 1.5px solid ${p => p.cfg.border};
  background: ${p => p.cfg.light};
  cursor: ${p => p.selectable ? "pointer" : "not-allowed"};
  opacity: ${p => p.selectable ? 1 : 0.6};
  transition: all 0.12s ease;
  outline: none;
  user-select: none;

  ${p => p.selectable && css`
    &:hover {
      transform: scale(1.05);
      border-color: ${p.cfg.color};
      box-shadow: 0 2px 8px ${p.cfg.color}33;
    }
  `}
`;

const BedNoText = styled.span`
  font-size: 0.66rem;
  font-weight: 800;
  color: ${p => p.cfg.dark};
  line-height: 1;
`;

const BedStatusText = styled.span`
  font-size: 0.5rem;
  font-weight: 700;
  color: ${p => p.cfg.color};
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
`;

const OccupiedDot = styled.span`
  position: absolute;
  top: 3px;
  right: 3px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${T.red};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const HighRiskBadge = styled.span`
  position: absolute;
  top: 1px;
  left: 2px;
  font-size: 0.65rem;
  line-height: 1;
  animation: ${pulse} 1.2s ease-in-out infinite;
`;

/* ── Floating Hover Card (Patient Details on Hover) ── */
const HoverCard = styled.div`
  position: fixed;
  top: ${p => p.top}px;
  left: ${p => p.left}px;
  transform: ${p => p.placement === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)"};
  width: 280px;
  background: #ffffff;
  border-radius: 9px;
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.22), 0 4px 6px -2px rgba(0, 0, 0, 0.08);
  border: 1.5px solid ${p => p.isHighRisk ? "#fca5a5" : "#cbd5e1"};
  z-index: 99999;
  pointer-events: none;
  animation: ${fadeIn} 0.12s ease both;
  overflow: hidden;
  font-family: ${T.font};
`;

const HoverHead = styled.div`
  background: ${p => p.isHighRisk ? "linear-gradient(135deg, #fef2f2, #fee2e2)" : "linear-gradient(135deg, #f8fafc, #f1f5f9)"};
  padding: 8px 12px;
  border-bottom: 1px solid ${p => p.isHighRisk ? "#fecaca" : "#e2e8f0"};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HoverTitle = styled.div`
  font-size: 0.82rem;
  font-weight: 800;
  color: ${p => p.isHighRisk ? "#991b1b" : "#0f172a"};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HoverBody = styled.div`
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.72rem;
  background: #fff;
`;

const HoverRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

const HoverLbl = styled.span`
  color: #64748b;
  font-weight: 600;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const HoverVal = styled.span`
  color: #1e293b;
  font-weight: 700;
  text-align: right;
  word-break: break-word;
`;

const HoverAlert = styled.div`
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-left: 3px solid #dc2626;
  border-radius: 5px;
  padding: 5px 8px;
  margin-top: 4px;
  font-size: 0.68rem;
  color: #991b1b;
`;

export default function AdmissionGrid({ data, loading, onBedClick, doctors = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(BED_STATUS.AVAILABLE); // Always default to Available
  const [selectedBlock, setSelectedBlock] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStation, setSelectedStation] = useState("ALL");
  const [hoveredBed, setHoveredBed] = useState(null);

  const getDoctorName = (docVal) => {
    if (!docVal) return "-";
    let strVal = String(docVal).trim();
    if (!strVal || strVal === "Dr." || strVal === "-") return "-";

    const cleanId = strVal.replace(/^Dr\.\s*/i, "").trim();

    if (doctors && Array.isArray(doctors) && doctors.length > 0) {
      const match = doctors.find(d => 
        String(d.employeeId || "").trim() === cleanId || 
        String(d.employee_id || "").trim() === cleanId || 
        String(d.id || "").trim() === cleanId ||
        String(d.employeeName || "").trim().toLowerCase() === cleanId.toLowerCase()
      );
      if (match) {
        const empName = match.employeeName || match.employee_name || match.name || cleanId;
        return empName.startsWith("Dr.") ? empName : `Dr. ${empName}`;
      }
    }

    if (!/^\d+$/.test(cleanId) && cleanId.length > 1) {
      return strVal.startsWith("Dr.") ? strVal : `Dr. ${strVal}`;
    }

    return strVal.startsWith("Dr.") ? strVal : `Dr. ${strVal}`;
  };

  const getPatientName = (p, ipNumber) => {
    if (!p) return ipNumber ? `Patient (${ipNumber})` : "Occupied";
    const name = p.patientname || p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.first_name;
    if (name && name.trim()) return name.trim();
    return ipNumber ? `Patient (${ipNumber})` : "Occupied";
  };

  const stats = useMemo(() => {
    let total = 0, available = 0, occupied = 0, notCleaned = 0, reserved = 0, maintenance = 0;
    (data || []).forEach(b => {
      Object.values(b.floors || {}).forEach(rooms => {
        rooms.forEach(room => {
          (room.beds || []).forEach(bed => {
            total++;
            if (bed.status === BED_STATUS.AVAILABLE) available++;
            else if (bed.status === BED_STATUS.OCCUPIED) occupied++;
            else if (bed.status === BED_STATUS.NOT_CLEANED) notCleaned++;
            else if (bed.status === BED_STATUS.RESERVED) reserved++;
            else maintenance++;
          });
        });
      });
    });
    return { total, available, occupied, notCleaned, reserved, maintenance };
  }, [data]);

  const filterOptions = useMemo(() => {
    const blocks = new Set();
    const categories = new Set();
    const stations = new Set();
    (data || []).forEach(b => {
      if (b.block?.block_name) blocks.add(b.block.block_name);
      Object.values(b.floors || {}).forEach(rooms => {
        rooms.forEach(room => {
          const blk = room.block || b.block?.block_name;
          if (blk) blocks.add(blk);
          const cat = room.room_category || room.room_type;
          if (cat) categories.add(cat);
          if (room.nursing_station) stations.add(room.nursing_station);
        });
      });
    });
    return {
      blocks: Array.from(blocks).sort(),
      categories: Array.from(categories).sort(),
      stations: Array.from(stations).sort(),
    };
  }, [data]);

  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!data || !Array.isArray(data)) return [];

    return data
      .filter(b => selectedBlock === "ALL" || b.block?.block_name === selectedBlock)
      .map(b => {
        const floors = {};
        Object.entries(b.floors || {}).forEach(([floor, rooms]) => {
          const matchedRooms = rooms
            .filter(room => {
              if (selectedBlock !== "ALL") {
                const rBlk = String(room.block || b.block?.block_name || "");
                if (rBlk.toLowerCase() !== selectedBlock.toLowerCase()) return false;
              }
              if (selectedCategory !== "ALL") {
                const rCat = String(room.room_category || room.room_type || "");
                if (rCat.toLowerCase() !== selectedCategory.toLowerCase()) return false;
              }
              if (selectedStation !== "ALL") {
                const rSt = String(room.nursing_station || "");
                if (rSt.toLowerCase() !== selectedStation.toLowerCase()) return false;
              }
              return true;
            })
            .map(room => {
              const matchedBeds = (room.beds || []).filter(bed => {
                if (selectedStatus !== "ALL" && bed.status !== selectedStatus) return false;
                if (!q) return true;
                const rNo = String(room.room_number || "").toLowerCase();
                const bNo = String(bed.bed_number || "").toLowerCase();
                const rCat = String(room.room_category || room.room_type || "").toLowerCase();
                const rSt = String(room.nursing_station || "").toLowerCase();
                const pName = String(bed.patient?.patientname || bed.patient?.name || "").toLowerCase();
                const uhid = String(bed.patient?.uhid || "").toLowerCase();
                const ipNo = String(bed.ip_number || "").toLowerCase();
                return (
                  rNo.includes(q) ||
                  bNo.includes(q) ||
                  rCat.includes(q) ||
                  rSt.includes(q) ||
                  pName.includes(q) ||
                  uhid.includes(q) ||
                  ipNo.includes(q)
                );
              });
              if (matchedBeds.length > 0) {
                return { ...room, beds: matchedBeds };
              }
              return null;
            })
            .filter(Boolean);

          if (matchedRooms.length > 0) {
            floors[floor] = matchedRooms;
          }
        });
        return { ...b, floors };
      })
      .filter(b => Object.keys(b.floors).length > 0);
  }, [data, searchTerm, selectedStatus, selectedBlock, selectedCategory, selectedStation]);

  const handleMouseEnter = (bed, room, e) => {
    if (bed.status !== BED_STATUS.OCCUPIED && !bed.patient?.patientname && !bed.patient?.name && !bed.patient?.uhid) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isTop = rect.top > 230;
    const top = isTop ? rect.top - 8 : rect.bottom + 8;
    const left = rect.left + rect.width / 2;
    setHoveredBed({ bed, room, top, left, placement: isTop ? "top" : "bottom" });
  };

  const handleMouseLeave = () => {
    setHoveredBed(null);
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>⏳ Loading room grid...</div>;
  }
  if (!data || data.length === 0) {
    return <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>🏨 No rooms found.</div>;
  }

  const LEGEND_ITEMS = [
    { status: "ALL",                  cfg: { color: T.primaryDk, light: T.primaryLt, dark: T.primaryDk, border: T.primary, label: "All Beds" }, count: stats.total },
    { status: BED_STATUS.AVAILABLE,   cfg: STATUS_CFG[BED_STATUS.AVAILABLE],   count: stats.available },
    { status: BED_STATUS.OCCUPIED,    cfg: STATUS_CFG[BED_STATUS.OCCUPIED],    count: stats.occupied },
    { status: BED_STATUS.NOT_CLEANED, cfg: STATUS_CFG[BED_STATUS.NOT_CLEANED], count: stats.notCleaned },
    { status: BED_STATUS.RESERVED,    cfg: STATUS_CFG[BED_STATUS.RESERVED],    count: stats.reserved },
    { status: BED_STATUS.MAINTENANCE, cfg: STATUS_CFG[BED_STATUS.MAINTENANCE], count: stats.maintenance },
  ];

  return (
    <GridContainer>
      {/* ── 1. Search & Filter Bar ── */}
      <FilterToolbar>
        <FilterGroup>
          <SearchInpWrap>
            <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: ".74rem", color: T.textMuted }}>🔍</span>
            <SearchInp
              type="text"
              placeholder="Search Room / Bed / Patient..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </SearchInpWrap>

          <FilterSelect
            value={selectedBlock}
            onChange={e => setSelectedBlock(e.target.value)}
          >
            <option value="ALL">🏢 All Blocks</option>
            {filterOptions.blocks.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">🏷️ All Categories</option>
            {filterOptions.categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={selectedStation}
            onChange={e => setSelectedStation(e.target.value)}
          >
            <option value="ALL">🩺 All Stations</option>
            {filterOptions.stations.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </FilterSelect>
        </FilterGroup>

        <div style={{ fontSize: "0.72rem", color: T.textMuted, fontWeight: 700 }}>
          💡 Showing <strong style={{ color: T.greenDk }}>Available Beds</strong> by default. Click any <strong style={{ color: T.greenDk }}>Green</strong> bed to admit a patient.
        </div>
      </FilterToolbar>

      {/* ── 2. Color Coding Legend Bar ── */}
      <ColorLegendStrip>
        <div style={{ fontSize: "0.65rem", fontWeight: 800, color: T.textMuted, textTransform: "uppercase" }}>
          🎨 Bed Status Filter:
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {LEGEND_ITEMS.map(({ status, cfg, count }) => {
            const active = selectedStatus === status;
            return (
              <ColorCodePill
                key={status}
                cfg={cfg}
                active={active}
                onClick={() => setSelectedStatus(status)}
                title={`Filter by ${cfg.label}`}
              >
                <ColorDot color={cfg.color} active={active} />
                <span>{cfg.label}</span>
                <CountBubble cfg={cfg} active={active}>{count}</CountBubble>
              </ColorCodePill>
            );
          })}
        </div>
      </ColorLegendStrip>

      {/* ── 3. Room Cards Grid ── */}
      {filteredData.map((b, bIdx) => (
        <BlockWrap key={bIdx}>
          <BlockTitle>🏢 {b.block?.block_name || "Main Block"}</BlockTitle>

          {Object.entries(b.floors || {})
            .map(([floor, rooms]) => (
              <FloorWrap key={floor}>
                <FloorTitle>📍 {floor}</FloorTitle>

                <RoomGridSt>
                  {rooms.map(room => {
                    const availableBeds = (room.beds || []).filter(bd => bd.status === BED_STATUS.AVAILABLE).length;
                    const occupiedBeds = (room.beds || []).filter(bd => bd.status === BED_STATUS.OCCUPIED).length;

                    return (
                      <RoomCard key={room.id || room.room_number} hasOccupied={occupiedBeds > 0}>
                        <RoomHeader hasOccupied={occupiedBeds > 0}>
                          <RoomNo>Room {room.room_number}</RoomNo>
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <CategoryTag>{room.room_type || room.room_category || "General"}</CategoryTag>
                            <BedCountPill available={availableBeds}>
                              {availableBeds}/{room.beds?.length || 0} Ready
                            </BedCountPill>
                          </div>
                        </RoomHeader>

                        <BedTilesGrid>
                          {(room.beds || []).map((bed, bdIdx) => {
                            const isAv = bed.status === BED_STATUS.AVAILABLE;
                            const isOcc = bed.status === BED_STATUS.OCCUPIED;
                            const isHr = Boolean(bed.patient?.is_high_risk);
                            const cfg = STATUS_CFG[bed.status] || STATUS_CFG[BED_STATUS.MAINTENANCE];

                            return (
                              <BedTile
                                key={bdIdx}
                                cfg={cfg}
                                selectable={isAv}
                                title={isAv ? `Bed ${bed.bed_number} — Click to assign` : `Bed ${bed.bed_number} — ${bed.status}`}
                                onClick={() => isAv && onBedClick(room, bed)}
                                onMouseEnter={(e) => handleMouseEnter(bed, room, e)}
                                onMouseLeave={handleMouseLeave}
                              >
                                {isOcc && <OccupiedDot />}
                                {isHr && <HighRiskBadge title="High Risk Patient">⚠️</HighRiskBadge>}
                                <BedMiniSVG color={cfg.color} size={16} />
                                <BedNoText cfg={cfg}>B{bed.bed_number}</BedNoText>
                                <BedStatusText cfg={cfg}>{isAv ? "Ready" : cfg.label}</BedStatusText>
                              </BedTile>
                            );
                          })}
                        </BedTilesGrid>
                      </RoomCard>
                    );
                  })}
                </RoomGridSt>
              </FloorWrap>
            ))}
        </BlockWrap>
      ))}

      {/* ── Floating Hover Card Popover ── */}
      {hoveredBed && (() => {
        const { bed, room, top, left, placement } = hoveredBed;
        const p = bed.patient || {};
        const pName = getPatientName(p, bed.ip_number);
        const docName = getDoctorName(p.admittingDoctor);
        const isHr = Boolean(p.is_high_risk);

        return (
          <HoverCard top={top} left={left} placement={placement} isHighRisk={isHr}>
            <HoverHead isHighRisk={isHr}>
              <HoverTitle isHighRisk={isHr}>
                <span>👤</span> {pName}
              </HoverTitle>
              <span style={{
                fontSize: "0.6rem",
                fontWeight: 800,
                padding: "2px 6px",
                borderRadius: 4,
                background: isHr ? "#fee2e2" : "#dcfce7",
                color: isHr ? "#b91c1c" : "#15803d"
              }}>
                {isHr ? "⚠️ HIGH RISK" : "OCCUPIED"}
              </span>
            </HoverHead>
            <HoverBody>
              <HoverRow>
                <HoverLbl>Room / Bed</HoverLbl>
                <HoverVal>Room {room.room_number} / Bed {bed.bed_number}</HoverVal>
              </HoverRow>
              {p.uhid && (
                <HoverRow>
                  <HoverLbl>UHID</HoverLbl>
                  <HoverVal style={{ color: "#0d9488" }}>{p.uhid}</HoverVal>
                </HoverRow>
              )}
              {bed.ip_number && (
                <HoverRow>
                  <HoverLbl>IP No</HoverLbl>
                  <HoverVal style={{ color: "#6d28d9" }}>{bed.ip_number}</HoverVal>
                </HoverRow>
              )}
              {(p.age || p.gender) && (
                <HoverRow>
                  <HoverLbl>Age / Gender</HoverLbl>
                  <HoverVal>{[p.age ? `${p.age} Y` : "", p.gender].filter(Boolean).join(" / ")}</HoverVal>
                </HoverRow>
              )}
              {p.mobilePhone && (
                <HoverRow>
                  <HoverLbl>Phone</HoverLbl>
                  <HoverVal>{p.mobilePhone}</HoverVal>
                </HoverRow>
              )}
              {docName && docName !== "-" && (
                <HoverRow>
                  <HoverLbl>Doctor</HoverLbl>
                  <HoverVal>{docName}</HoverVal>
                </HoverRow>
              )}
              {isHr && (
                <HoverAlert>
                  <div style={{ fontWeight: 800, marginBottom: 2 }}>⚠️ High Risk Alert:</div>
                  <div><strong>Reason:</strong> {p.high_risk_reason || "Critical observation"}</div>
                  {p.high_risk_date && (
                    <div style={{ fontSize: "0.62rem", color: "#b91c1c", marginTop: 2 }}>
                      <strong>Risk Identified:</strong> {p.high_risk_date}
                    </div>
                  )}
                </HoverAlert>
              )}
            </HoverBody>
          </HoverCard>
        );
      })()}
    </GridContainer>
  );
}
