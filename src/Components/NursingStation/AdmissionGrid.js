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
  padding: 7px 10px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  box-shadow: ${T.shadowSm};
`;

const SearchInp = styled.input`
  width: 240px;
  height: 28px;
  padding: 0 8px 0 26px;
  font-size: 0.74rem;
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

export default function AdmissionGrid({ data, loading, onBedClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(BED_STATUS.AVAILABLE); // Always default to Available

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

  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!data || !Array.isArray(data)) return [];

    return data.map(b => {
      const floors = {};
      Object.entries(b.floors || {}).forEach(([floor, rooms]) => {
        const matchedRooms = rooms.map(room => {
          const matchedBeds = (room.beds || []).filter(bed => {
            if (selectedStatus !== "ALL" && bed.status !== selectedStatus) return false;
            if (!q) return true;
            return (
              String(room.room_number || "").toLowerCase().includes(q) ||
              String(bed.bed_number || "").toLowerCase().includes(q) ||
              String(room.room_type || "").toLowerCase().includes(q)
            );
          });
          if (matchedBeds.length > 0) {
            return { ...room, beds: matchedBeds };
          }
          return null;
        }).filter(Boolean);

        if (matchedRooms.length > 0) {
          floors[floor] = matchedRooms;
        }
      });
      return { ...b, floors };
    }).filter(b => Object.keys(b.floors).length > 0);
  }, [data, searchTerm, selectedStatus]);

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
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: ".74rem", color: T.textMuted }}>🔍</span>
          <SearchInp
            type="text"
            placeholder="Search Room / Bed..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ fontSize: "0.72rem", color: T.textMuted, fontWeight: 700 }}>
          💡 Showing <strong style={{ color: T.greenDk }}>Available Beds</strong> by default. Click any <strong style={{ color: T.greenDk }}>Green</strong> bed to admit a patient, or click filter pills above to view other statuses.
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
            .sort(([fA], [fB]) => Number(fA) - Number(fB))
            .map(([floor, rooms]) => (
              <FloorWrap key={floor}>
                <FloorTitle>Floor {floor}</FloorTitle>

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
                            const cfg = STATUS_CFG[bed.status] || STATUS_CFG[BED_STATUS.MAINTENANCE];

                            return (
                              <BedTile
                                key={bdIdx}
                                cfg={cfg}
                                selectable={isAv}
                                title={isAv ? `Bed ${bed.bed_number} — Click to assign` : `Bed ${bed.bed_number} — ${bed.status}`}
                                onClick={() => isAv && onBedClick(room, bed)}
                              >
                                {isOcc && <OccupiedDot />}
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
    </GridContainer>
  );
}
