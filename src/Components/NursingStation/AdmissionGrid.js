import React from "react";
import styled, { keyframes } from "styled-components";

const T = {
  primary:    "#0d9488",
  primaryDk:  "#0f766e",
  primaryLt:  "#f0fdfa",
  primaryMd:  "#99f6e4",
  green:      "#16a34a",
  greenLt:    "#dcfce7",
  greenDk:    "#14532d",
  red:        "#dc2626",
  redLt:      "#fee2e2",
  redDk:      "#7f1d1d",
  amber:      "#d97706",
  amberLt:    "#fef3c7",
  amberDk:    "#78350f",
  purple:     "#7c3aed",
  purpleLt:   "#ede9fe",
  purpleDk:   "#4c1d95",
  gray:       "#6b7280",
  grayLt:     "#f3f4f6",
  grayDk:     "#1f2937",
  blue:       "#2563eb",
  blueLt:     "#dbeafe",
  white:      "#ffffff",
  border:     "#e5e7eb",
  textMain:   "#0f172a",
  textMuted:  "#64748b",
  shadow:     "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
  radius:     "10px",
};

const BED_STATUS = {
  AVAILABLE:    "Available",
  OCCUPIED:     "Occupied",
  NOT_CLEANED:  "Not Cleaned",
  MAINTENANCE:  "Maintenance",
  RESERVED:     "Reserved",
};

const STATUS_CFG = {
  [BED_STATUS.AVAILABLE]:   { color: T.green,  light: T.greenLt,  dark: T.greenDk,  label: "Available"   },
  [BED_STATUS.OCCUPIED]:    { color: T.red,    light: T.redLt,    dark: T.redDk,    label: "Occupied"    },
  [BED_STATUS.NOT_CLEANED]: { color: T.amber,  light: T.amberLt,  dark: T.amberDk,  label: "Not Cleaned" },
  [BED_STATUS.MAINTENANCE]: { color: T.gray,   light: T.grayLt,   dark: T.grayDk,   label: "Maintenance" },
  [BED_STATUS.RESERVED]:    { color: T.purple, light: T.purpleLt, dark: T.purpleDk, label: "Reserved"    },
};

const ROOM_CFG = {
  available:    { border: "#86efac", bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)", dot: T.green, label: "Available" },
  occupied:     { border: "#fca5a5", bg: "linear-gradient(135deg,#fff5f5,#fee2e2)", dot: T.red, label: "Occupied" },
  "not-cleaned":{ border: "#fcd34d", bg: "linear-gradient(135deg,#fffdf0,#fef3c7)", dot: T.amber, label: "Not Cleaned" },
  maintenance:  { border: "#d1d5db", bg: "linear-gradient(135deg,#fafafa,#f3f4f6)", dot: T.gray, label: "Maintenance" },
  partial:      { border: "#93c5fd", bg: "linear-gradient(135deg,#f0f7ff,#dbeafe)", dot: T.blue, label: "Partial" },
  reserved:     { border: "#c084fc", bg: "linear-gradient(135deg,#faf5ff,#ede9fe)", dot: T.purple, label: "Reserved" },
};

function getRoomStatus(beds) {
  if (!beds?.length) return "available";
  const s = beds.map((b) => b.status);
  if (s.every((x) => x === BED_STATUS.MAINTENANCE))   return "maintenance";
  if (s.every((x) => x === BED_STATUS.OCCUPIED))      return "occupied";
  if (s.every((x) => x === BED_STATUS.RESERVED))      return "reserved";
  if (s.every((x) => x === BED_STATUS.NOT_CLEANED))   return "not-cleaned";
  if (s.some((x) => x === BED_STATUS.OCCUPIED))       return "partial";
  if (s.some((x) => x === BED_STATUS.NOT_CLEANED))    return "not-cleaned";
  if (s.some((x) => x === BED_STATUS.RESERVED))       return "reserved";
  return "available";
}

function calcStats(data) {
  let total = 0, available = 0, occupied = 0, maintenance = 0, notCleaned = 0, reserved = 0;
  data.forEach((b) =>
    Object.values(b.floors).forEach((rooms) =>
      rooms.forEach((room) =>
        (room.beds || []).forEach((bed) => {
          total++;
          if      (bed.status === BED_STATUS.AVAILABLE)   available++;
          else if (bed.status === BED_STATUS.OCCUPIED)    occupied++;
          else if (bed.status === BED_STATUS.NOT_CLEANED) notCleaned++;
          else if (bed.status === BED_STATUS.RESERVED)    reserved++;
          else                                            maintenance++;
        })
      )
    )
  );
  return { total, available, occupied, maintenance, notCleaned, reserved };
}

const fadeUp = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.35}`;
const broomWiggle = keyframes`0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}`;

const BedIconSVG = ({ color = "#9ca3af", size = 36, status }) => {
  const h = Math.round(size * 0.65);
  const showPerson = status === BED_STATUS.OCCUPIED;
  return (
    <svg viewBox="0 0 52 36" width={size} height={h} xmlns="http://www.w3.org/2000/svg" style={{ display: "block", flexShrink: 0 }}>
      <rect x="2" y="20" width="48" height="11" rx="2.5" fill={color} opacity="0.9" />
      <rect x="5" y="15" width="42" height="8" rx="2" fill={color} opacity="0.45" />
      <rect x="31" y="12" width="12" height="7" rx="2" fill={color} opacity="0.97" />
      <rect x="33" y="14" width="4" height="2" rx="1" fill="#fff" opacity="0.3" />
      <rect x="1" y="9" width="5" height="22" rx="2" fill={color} opacity="0.92" />
      <rect x="46" y="16" width="5" height="15" rx="2" fill={color} opacity="0.92" />
      <rect x="5" y="18" width="42" height="2" rx="1" fill={color} opacity="0.25" />
      <rect x="4" y="29" width="4" height="5" rx="1" fill={color} opacity="0.65" />
      <rect x="44" y="29" width="4" height="5" rx="1" fill={color} opacity="0.65" />
      {showPerson && (
        <g opacity="0.75">
          <circle cx="37" cy="11" r="3.2" fill={color} />
          <rect x="10" y="15" width="22" height="5" rx="2" fill={color} opacity="0.4" />
        </g>
      )}
      {status === BED_STATUS.NOT_CLEANED && (
        <g>
          <line x1="42" y1="4" x2="35" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="34" cy="15" rx="3" ry="1.5" fill={color} opacity="0.8" />
        </g>
      )}
      {status === BED_STATUS.MAINTENANCE && (
        <g>
          <rect x="38" y="5" width="8" height="6" rx="1.5" fill={color} opacity="0.7" />
          <path d="M40 5 Q42 1 44 5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
      {status === BED_STATUS.RESERVED && (
        <polygon points="42,2 46,6 42,10 38,6" fill={color} opacity="0.8" />
      )}
    </svg>
  );
};

const OccupiedDot = styled.span`position:absolute;top:5px;right:5px;width:6px;height:6px;border-radius:50%;background:${T.red};animation:${pulse} 1.6s ease-in-out infinite;box-shadow:0 0 0 2px ${T.redLt};z-index:2;`;
const BroomBadge = styled.span`position:absolute;top:3px;right:4px;font-size:.58rem;display:inline-block;animation:${broomWiggle} 1.8s ease-in-out infinite;transform-origin:bottom center;z-index:2;`;

const StatsRow = styled.div`display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:14px;@media (max-width:700px){grid-template-columns:repeat(3,1fr);}@media (max-width:400px){grid-template-columns:repeat(2,1fr);}`;
const StatCard = styled.div`background:${T.white};border:1px solid ${T.border};border-radius:8px;padding:9px 12px;display:flex;align-items:center;gap:9px;box-shadow:${T.shadow};animation:${fadeUp} .25s ease both;animation-delay:${p=>p.i*35}ms;position:relative;overflow:hidden;&::after{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:${p=>p.accent};border-radius:8px 0 0 8px;}`;
const StatIcon = styled.div`width:28px;height:28px;border-radius:7px;background:${p=>p.bg};display:flex;align-items:center;justify-content:center;font-size:.75rem;flex-shrink:0;`;
const StatInfo = styled.div`display:flex;flex-direction:column;gap:1px;min-width:0;`;
const StatValue = styled.div`font-size:1.2rem;font-weight:800;color:${p=>p.color||T.textMain};line-height:1;letter-spacing:-.03em;`;
const StatLabel = styled.div`font-size:.6rem;font-weight:600;color:${T.textMuted};text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;`;

const BlockCard = styled.div`background:${T.white};border:1px solid ${T.border};border-radius:${T.radius};overflow:hidden;margin-bottom:14px;box-shadow:${T.shadow};animation:${fadeUp} .3s ease both;animation-delay:${p=>p.index*50}ms;`;
const BlockHeader = styled.div`display:flex;align-items:center;justify-content:space-between;padding:9px 14px;background:linear-gradient(135deg,${T.primaryLt} 0%,#e0fdf4 100%);border-bottom:1px solid ${T.primaryMd}88;`;
const BlockName = styled.div`font-size:.82rem;font-weight:800;color:${T.primaryDk};display:flex;align-items:center;gap:7px;letter-spacing:-.01em;`;
const BlockMiniStats = styled.div`display:flex;gap:5px;flex-wrap:wrap;`;
const MiniBadge = styled.span`font-size:.62rem;font-weight:700;padding:2px 7px;border-radius:20px;background:${p=>p.bg};color:${p=>p.color};border:1px solid ${p=>p.color}33;display:flex;align-items:center;gap:3px;letter-spacing:.01em;`;
const BlockBody = styled.div`padding:12px 14px;`;
const FloorSection = styled.div`margin-bottom:16px;&:last-child{margin-bottom:0;}`;
const FloorLabel = styled.div`display:flex;align-items:center;gap:7px;font-size:.67rem;font-weight:800;color:${T.primary};text-transform:uppercase;letter-spacing:.09em;margin-bottom:10px;&::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:${T.primary};box-shadow:0 0 0 3px ${T.primaryMd};}&::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,${T.primaryMd},transparent);}`;
const RoomGridSt = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:8px;@media (max-width:480px){grid-template-columns:1fr 1fr;gap:6px;}`;
const RoomCard = styled.div`border:1.5px solid ${p=>ROOM_CFG[p.rs]?.border||T.border};border-radius:8px;overflow:hidden;background:${T.white};box-shadow:${T.shadow};transition:box-shadow .18s,transform .18s;&:hover{box-shadow:0 6px 18px ${p=>ROOM_CFG[p.rs]?.dot||T.gray}2a;transform:translateY(-2px);}`;
const RoomTop = styled.div`display:flex;align-items:center;justify-content:space-between;padding:6px 9px;background:${p=>ROOM_CFG[p.rs]?.bg||T.grayLt};border-bottom:1px solid ${p=>ROOM_CFG[p.rs]?.border||T.border}88;`;
const RoomNumber = styled.span`font-weight:800;font-size:.82rem;color:${T.textMain};letter-spacing:-.02em;`;
const RoomStatusPill = styled.span`font-size:.56rem;font-weight:800;padding:2px 7px;border-radius:12px;background:${T.white}99;color:${p=>ROOM_CFG[p.rs]?.dot};text-transform:capitalize;letter-spacing:.02em;border:1px solid ${p=>ROOM_CFG[p.rs]?.border};`;
const BedWrap = styled.div`display:flex;flex-wrap:wrap;gap:5px;padding:8px 9px;background:${T.white};`;
const BedCard = styled.button`position:relative;flex:1 1 auto;min-width:62px;padding:6px 4px;border-radius:6px;background:${p=>p.cfg.light};border:1.5px solid ${p=>p.cfg.color}33;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:${p=>p.selectable?'pointer':'not-allowed'};opacity:${p=>p.selectable?1:.65};transition:all .15s;&:hover{border-color:${p=>p.cfg.color};${p=>p.selectable?'transform:translateY(-1px);':''}}`;
const BedNum = styled.div`font-size:.65rem;font-weight:800;color:${p=>p.cfg.dark};`;
const BedLabel = styled.div`font-size:.5rem;font-weight:700;color:${p=>p.cfg.dark};text-transform:uppercase;letter-spacing:.04em;`;

export default function AdmissionGrid({ data, loading, onBedClick }) {
  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Loading grid data...</div>;
  }
  if (!data || data.length === 0) {
    return <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>No rooms found.</div>;
  }

  const st = calcStats(data);
  const totalOccupancy = st.total > 0 ? ((st.occupied / st.total) * 100).toFixed(0) : 0;

  return (
    <div style={{ padding: "10px 0" }}>
      <StatsRow>
        <StatCard i={0} accent={T.primary}>
          <StatIcon bg={T.primaryLt}>🛏️</StatIcon>
          <StatInfo><StatValue color={T.primaryDk}>{st.total}</StatValue><StatLabel>Total Beds</StatLabel></StatInfo>
        </StatCard>
        <StatCard i={1} accent={T.green}>
          <StatIcon bg={T.greenLt}>✅</StatIcon>
          <StatInfo><StatValue color={T.greenDk}>{st.available}</StatValue><StatLabel>Available</StatLabel></StatInfo>
        </StatCard>
        <StatCard i={2} accent={T.red}>
          <StatIcon bg={T.redLt}>🤒</StatIcon>
          <StatInfo><StatValue color={T.redDk}>{st.occupied}</StatValue><StatLabel>Occupied</StatLabel></StatInfo>
        </StatCard>
        <StatCard i={3} accent={T.amber}>
          <StatIcon bg={T.amberLt}>🧹</StatIcon>
          <StatInfo><StatValue color={T.amberDk}>{st.notCleaned}</StatValue><StatLabel>Not Cleaned</StatLabel></StatInfo>
        </StatCard>
        <StatCard i={4} accent={T.purple}>
          <StatIcon bg={T.purpleLt}>🔒</StatIcon>
          <StatInfo><StatValue color={T.purpleDk}>{st.reserved}</StatValue><StatLabel>Reserved</StatLabel></StatInfo>
        </StatCard>
        <StatCard i={5} accent={T.gray}>
          <StatIcon bg={T.grayLt}>🔧</StatIcon>
          <StatInfo><StatValue color={T.grayDk}>{st.maintenance}</StatValue><StatLabel>Maintenance</StatLabel></StatInfo>
        </StatCard>
      </StatsRow>

      {data.map((blockEntry, bIndex) => {
        const blockName = blockEntry.block?.block_name || "Block";
        const fkeys = Object.keys(blockEntry.floors).sort((a,b)=>parseInt(a)-parseInt(b));
        let bAv = 0, bOc = 0, bNc = 0;
        fkeys.forEach(f => blockEntry.floors[f].forEach(r => (r.beds||[]).forEach(b => {
          if (b.status === BED_STATUS.AVAILABLE) bAv++;
          else if (b.status === BED_STATUS.OCCUPIED) bOc++;
          else if (b.status === BED_STATUS.NOT_CLEANED) bNc++;
        })));

        return (
          <BlockCard key={bIndex} index={bIndex}>
            <BlockHeader>
              <BlockName>🏢 {blockName}</BlockName>
              <BlockMiniStats>
                <MiniBadge bg={T.greenLt} color={T.greenDk}>✅ {bAv}</MiniBadge>
                <MiniBadge bg={T.redLt} color={T.redDk}>🤒 {bOc}</MiniBadge>
                {bNc > 0 && <MiniBadge bg={T.amberLt} color={T.amberDk}>🧹 {bNc}</MiniBadge>}
              </BlockMiniStats>
            </BlockHeader>
            <BlockBody>
              {fkeys.map(floor => (
                <FloorSection key={floor}>
                  <FloorLabel>Floor {floor}</FloorLabel>
                  <RoomGridSt>
                    {blockEntry.floors[floor].map(room => {
                      const rs = getRoomStatus(room.beds);
                      const rConfig = ROOM_CFG[rs] || ROOM_CFG.available;
                      return (
                        <RoomCard key={room.id} rs={rs}>
                          <RoomTop rs={rs}>
                            <RoomNumber>{room.room_number}</RoomNumber>
                            <RoomStatusPill rs={rs}>{rConfig.label || rs}</RoomStatusPill>
                          </RoomTop>
                          <BedWrap>
                            {(room.beds || []).map(bed => {
                              const bCfg = STATUS_CFG[bed.status] || STATUS_CFG[BED_STATUS.AVAILABLE];
                              const isAv = bed.status === BED_STATUS.AVAILABLE;
                              return (
                                <BedCard 
                                  key={bed.bed_number} 
                                  cfg={bCfg} 
                                  selectable={isAv}
                                  onClick={() => isAv && onBedClick(room, bed)}
                                  title={isAv ? "Click to admit" : bed.status}
                                >
                                  {bed.status === BED_STATUS.OCCUPIED && <OccupiedDot />}
                                  {bed.status === BED_STATUS.NOT_CLEANED && <BroomBadge>🧹</BroomBadge>}
                                  <BedIconSVG color={bCfg.color} size={26} status={bed.status} />
                                  <BedNum cfg={bCfg}>{bed.bed_number}</BedNum>
                                  <BedLabel cfg={bCfg}>{bCfg.label}</BedLabel>
                                </BedCard>
                              );
                            })}
                          </BedWrap>
                        </RoomCard>
                      );
                    })}
                  </RoomGridSt>
                </FloorSection>
              ))}
            </BlockBody>
          </BlockCard>
        );
      })}
    </div>
  );
}
