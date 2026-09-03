import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import { PageWrapper } from "../GlobalStyles";

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
  shadowLg:   "0 12px 32px rgba(0,0,0,0.16)",
  radius:     "8px",
  radiusSm:   "6px",
  font:       "'DM Sans', 'Inter', system-ui, sans-serif",
};

/* ─────────────────────────────────────────────────────────────
   STATUS COLOR CODING CONFIG
   ───────────────────────────────────────────────────────────── */
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
    icon: "●",
  },
  [BED_STATUS.AVAILABLE]: {
    color: T.green,
    light: T.greenLt,
    dark: T.greenDk,
    border: T.greenBorder,
    label: "Available",
    icon: "✓",
  },
  [BED_STATUS.NOT_CLEANED]: {
    color: T.amber,
    light: T.amberLt,
    dark: T.amberDk,
    border: T.amberBorder,
    label: "Not Cleaned",
    icon: "🧹",
  },
  [BED_STATUS.RESERVED]: {
    color: T.purple,
    light: T.purpleLt,
    dark: T.purpleDk,
    border: T.purpleBorder,
    label: "Reserved",
    icon: "◆",
  },
  [BED_STATUS.MAINTENANCE]: {
    color: T.gray,
    light: T.grayLt,
    dark: T.grayDk,
    border: T.grayBorder,
    label: "Maintenance",
    icon: "🔧",
  },
};

/* ─────────────────────────────────────────────────────────────
   ANIMATIONS
   ───────────────────────────────────────────────────────────── */
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const popIn = keyframes`from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); }`;
const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.35; }`;
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;

/* ─────────────────────────────────────────────────────────────
   BED ICON SVG
   ───────────────────────────────────────────────────────────── */
const BedMiniSVG = ({ color = "#64748b", size = 20 }) => (
  <svg width={size} height={Math.round(size * 0.7)} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M1 14V3C1 2.45 1.45 2 2 2C2.55 2 3 2.45 3 3V9H13V5C13 4.45 13.45 4 14 4H22C22.55 4 23 4.45 23 5V14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 10H23" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M5 6C5 5.45 5.45 5 6 5H8C8.55 5 9 5.45 9 6C9 6.55 8.55 7 8 7H6C5.45 7 5 6.55 5 6Z" fill={color}/>
    <path d="M2 14V16M22 14V16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   STYLED COMPONENTS (Responsive & Screen-Adaptive)
   ───────────────────────────────────────────────────────────── */
const PageInner = styled.div`
  padding: clamp(10px, 1.2vw, 20px);
  background: ${T.bg};
  min-height: 100vh;
  font-family: ${T.font};
  width: 100%;
  box-sizing: border-box;
`;

/* ── Top Bar ── */
const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const PageTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.05rem, 1.3vw, 1.35rem);
  font-weight: 800;
  color: ${T.textMain};
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.01em;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const OccupancyChip = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${T.white};
  border: 1px solid ${T.border};
  padding: 6px 14px;
  border-radius: 20px;
  font-size: clamp(0.75rem, 0.9vw, 0.85rem);
  font-weight: 700;
  color: ${T.textMain};
  box-shadow: ${T.shadowSm};
`;

const ProgressTrack = styled.div`
  width: clamp(60px, 6vw, 100px);
  height: 7px;
  background: ${T.grayLt};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${p => p.pct}%;
  background: ${p => p.pct > 80 ? T.red : p.pct > 50 ? T.amber : T.green};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const RefreshBtn = styled.button`
  height: 34px;
  padding: 0 14px;
  font-size: clamp(0.75rem, 0.85vw, 0.82rem);
  font-weight: 700;
  font-family: ${T.font};
  border: 1px solid ${T.border};
  border-radius: ${T.radiusSm};
  background: ${T.white};
  cursor: pointer;
  color: ${T.primaryDk};
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.12s;
  box-shadow: ${T.shadowSm};
  &:hover {
    background: ${T.primaryLt};
    border-color: ${T.primaryMd};
  }
  .spin { animation: ${spin} 0.8s linear infinite; }
`;

/* ── 1. Search & Filter Bar ── */
const FilterToolbar = styled.div`
  background: ${T.white};
  border: 1px solid ${T.border};
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  box-shadow: ${T.shadowSm};

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 550px) {
    grid-template-columns: 1fr;
  }
`;

const SearchInputWrap = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInp = styled.input`
  width: 100%;
  height: 34px;
  padding: 0 10px 0 32px;
  font-size: clamp(0.78rem, 0.9vw, 0.86rem);
  font-family: ${T.font};
  border: 1.5px solid ${T.border};
  border-radius: 6px;
  background: ${T.bg};
  color: ${T.textMain};
  outline: none;
  box-sizing: border-box;
  transition: all 0.15s;
  &:focus {
    background: #fff;
    border-color: ${T.primary};
    box-shadow: 0 0 0 3px rgba(13,148,136,0.15);
  }
  &::placeholder { color: ${T.textMuted}; }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.84rem;
  color: ${T.textMuted};
  pointer-events: none;
`;

const FilterSelect = styled.select`
  width: 100%;
  box-sizing: border-box;
  height: 34px;
  padding: 0 10px;
  font-size: clamp(0.75rem, 0.85vw, 0.82rem);
  font-weight: 600;
  font-family: ${T.font};
  border: 1.5px solid ${T.border};
  border-radius: 6px;
  background: ${T.bg};
  color: ${T.textMain};
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
  &:focus { border-color: ${T.primary}; }
`;

/* ── 2. Color Coding Legend & Filter Strip ── */
const ColorLegendStrip = styled.div`
  background: ${T.white};
  border: 1px solid ${T.border};
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  box-shadow: ${T.shadowSm};
`;

const LegendHeader = styled.div`
  font-size: clamp(0.7rem, 0.8vw, 0.78rem);
  font-weight: 800;
  color: ${T.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LegendBadgesGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const ColorCodePill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: clamp(0.72rem, 0.85vw, 0.82rem);
  font-weight: 700;
  font-family: ${T.font};
  border: 1.5px solid ${p => p.active ? p.cfg.color : p.cfg.border};
  background: ${p => p.active ? p.cfg.color : p.cfg.light};
  color: ${p => p.active ? "#ffffff" : p.cfg.dark};
  cursor: pointer;
  transition: all 0.12s ease;
  user-select: none;

  &:hover {
    border-color: ${p => p.cfg.color};
    transform: translateY(-1px);
    box-shadow: 0 3px 10px ${p => p.cfg.color}33;
  }
`;

const ColorDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.active ? "#ffffff" : p.color};
  flex-shrink: 0;
`;

const CountBubble = styled.span`
  font-size: clamp(0.64rem, 0.75vw, 0.72rem);
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 10px;
  background: ${p => p.active ? "rgba(255,255,255,0.3)" : "#ffffff"};
  color: ${p => p.active ? "#ffffff" : p.cfg.dark};
  border: ${p => p.active ? "none" : `1px solid ${p.cfg.border}`};
`;

const ResetFilterBtn = styled.button`
  background: ${T.grayLt};
  border: 1px solid ${T.border};
  border-radius: 15px;
  padding: 5px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  color: ${T.textMuted};
  cursor: pointer;
  transition: all 0.12s;
  &:hover {
    background: #fee2e2;
    border-color: #fca5a5;
    color: ${T.red};
  }
`;

/* ── 3. Block & Floor Hierarchy ── */
const BlockWrap = styled.div`
  margin-bottom: 16px;
`;

const BlockTitle = styled.div`
  font-size: clamp(0.82rem, 0.95vw, 0.96rem);
  font-weight: 800;
  color: ${T.primaryDk};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  &::after {
    content: "";
    flex: 1;
    height: 1.5px;
    background: ${T.primaryMd};
  }
`;

const FloorWrap = styled.div`
  margin-bottom: 12px;
`;

const FloorTitle = styled.div`
  font-size: clamp(0.7rem, 0.8vw, 0.78rem);
  font-weight: 700;
  color: ${T.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

/* ── 4. Responsive Room Grid & Cards ── */
const RoomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(240px, 18vw, 320px), 1fr));
  gap: clamp(8px, 1vw, 14px);
`;

const RoomCard = styled.div`
  background: ${T.white};
  border: 1.5px solid ${p => p.hasOccupied ? T.redBorder : T.border};
  border-radius: 8px;
  box-shadow: ${T.shadowSm};
  overflow: hidden;
  transition: all 0.14s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: ${p => p.hasOccupied ? T.red : T.primary};
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  }
`;

const RoomHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  background: ${p => p.hasOccupied ? "#fff5f5" : "#f8fafc"};
  border-bottom: 1px solid ${p => p.hasOccupied ? "#fee2e2" : T.border};
`;

const RoomNo = styled.div`
  font-size: clamp(0.84rem, 0.95vw, 0.94rem);
  font-weight: 800;
  color: ${T.textMain};
`;

const RoomMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CategoryTag = styled.span`
  font-size: clamp(0.6rem, 0.7vw, 0.68rem);
  font-weight: 700;
  color: ${T.textMuted};
  background: ${T.white};
  border: 1px solid ${T.border};
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BedCountPill = styled.span`
  font-size: clamp(0.6rem, 0.7vw, 0.68rem);
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 10px;
  background: ${p => p.occupied > 0 ? T.redLt : T.greenLt};
  color: ${p => p.occupied > 0 ? T.redDk : T.greenDk};
`;

/* ── Uniform Color-Coded Bed Tile ── */
const BedTilesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(68px, 5.5vw, 84px), 1fr));
  gap: clamp(5px, 0.5vw, 8px);
  padding: 8px 10px;
`;

const BedTile = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 6px 4px;
  height: clamp(50px, 4.2vw, 62px);
  border-radius: 6px;
  border: 1.5px solid ${p => p.cfg.border};
  background: ${p => p.cfg.light};
  cursor: ${p => p.status === BED_STATUS.MAINTENANCE ? "not-allowed" : "pointer"};
  opacity: ${p => p.status === BED_STATUS.MAINTENANCE ? 0.5 : 1};
  transition: all 0.12s ease;
  outline: none;
  user-select: none;

  ${p => p.status !== BED_STATUS.MAINTENANCE && css`
    &:hover {
      transform: scale(1.05);
      border-color: ${p.cfg.color};
      box-shadow: 0 3px 10px ${p.cfg.color}33;
    }
  `}
`;

const BedNoText = styled.span`
  font-size: clamp(0.7rem, 0.8vw, 0.8rem);
  font-weight: 800;
  color: ${p => p.cfg.dark};
  line-height: 1;
`;

const BedStatusText = styled.span`
  font-size: clamp(0.54rem, 0.6vw, 0.62rem);
  font-weight: 700;
  color: ${p => p.cfg.color};
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
`;

const OccupiedDot = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${T.red};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

/* ── Modal (Patient Details on Click) ── */
const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: ${fadeIn} 0.12s ease;
`;

const ModalBox = styled.div`
  background: ${T.white};
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${T.shadowLg};
  animation: ${popIn} 0.16s ease;
`;

const ModalHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${p => p.bg || "#f8fafc"};
  border-bottom: 1px solid ${T.border};
  border-radius: 12px 12px 0 0;
`;

const ModalTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 800;
  color: ${T.textMain};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseBtn = styled.button`
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 1px solid ${T.border};
  background: #fff;
  cursor: pointer;
  font-size: 1rem;
  color: ${T.textMuted};
  display: flex; align-items: center; justify-content: center;
  &:hover { background: #fee2e2; color: #dc2626; }
`;

const ModalBody = styled.div`padding: 16px;`;

const PatientHighlight = styled.div`
  background: #fff5f5;
  border: 1.5px solid #fecaca;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;
`;

const PatientHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const PatientAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${T.red};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 800;
  flex-shrink: 0;
`;

const PatientName = styled.div`
  font-size: 0.96rem;
  font-weight: 800;
  color: ${T.redDk};
  line-height: 1.2;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 10px;
  font-size: 0.78rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const DKey = styled.span`
  font-size: 0.62rem;
  font-weight: 600;
  color: ${T.textMuted};
  text-transform: uppercase;
`;

const DVal = styled.span`
  font-weight: 700;
  color: ${T.textMain};
  word-break: break-word;
`;

const InfoSection = styled.div`
  background: #f8fafc;
  border: 1px solid ${T.border};
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
`;

const InfoTitle = styled.div`
  font-size: 0.68rem;
  font-weight: 800;
  color: ${T.primaryDk};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
`;

const CleanActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  background: ${p => p.cleaned ? "#f0fdf4" : "#fffbeb"};
  border: 1px solid ${p => p.cleaned ? "#86efac" : "#fde047"};
  border-radius: 8px;
  margin-bottom: 12px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  border-top: 1px solid ${T.border};
  padding-top: 12px;
  margin-top: 8px;
`;

const ModalBtn = styled.button`
  height: 34px;
  padding: 0 16px;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: ${T.font};
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${p => p.purple ? T.purple : p.secondary ? "#f1f5f9" : T.primary};
  color: ${p => p.secondary ? T.textMain : "#fff"};
  &:hover { opacity: 0.9; }
`;

const IPInput = styled.input`
  width: 100%;
  height: 34px;
  padding: 0 10px;
  font-size: 0.84rem;
  font-family: ${T.font};
  border: 1px solid ${T.border};
  border-radius: 6px;
  background: #fff;
  color: ${T.textMain};
  margin-top: 6px;
  margin-bottom: 10px;
  box-sizing: border-box;
  outline: none;
  &:focus { border-color: ${T.primary}; }
`;

const EmptyNotice = styled.div`
  text-align: center;
  padding: 50px 16px;
  color: ${T.textMuted};
  background: ${T.white};
  border: 1px solid ${T.border};
  border-radius: 8px;
  font-size: 0.88rem;
`;

/* ─────────────────────────────────────────────────────────────
   DETAIL MODAL COMPONENT
   ───────────────────────────────────────────────────────────── */
const BedDetailModal = ({ bed, room, onClose, onCleanedChange, onBook }) => {
  const [cleaning,   setCleaning]   = useState(false);
  const [showBook,   setShowBook]   = useState(false);
  const [bookIp,     setBookIp]     = useState("");
  const [booking,    setBooking]    = useState(false);

  const isOccupied   = bed.status === BED_STATUS.OCCUPIED;
  const isNotCleaned = bed.status === BED_STATUS.NOT_CLEANED;
  const isAvailable  = bed.status === BED_STATUS.AVAILABLE;
  const isReserved   = bed.status === BED_STATUS.RESERVED;
  const isClean      = bed.is_roomCleaned === true;
  const p            = bed.patient || {};
  const cfg          = STATUS_CFG[bed.status] || STATUS_CFG[BED_STATUS.MAINTENANCE];

  const handleClean = async () => {
    setCleaning(true);
    try {
      await onCleanedChange({
        room_no:        room.room_number,
        bed_no:         bed.bed_number,
        is_roomCleaned: true,
        ip_number:      bed.ip_number   || "",
        shifting_id:    bed.shifting_id || "",
      });
      onClose();
    } finally {
      setCleaning(false);
    }
  };

  const handleBook = async () => {
    if (!bookIp.trim()) { toast.warning("Enter IP Number"); return; }
    setBooking(true);
    try {
      await onBook({
        ip_number:   bookIp.trim(),
        room_number: room.room_number,
        bed_number:  bed.bed_number,
        room_type:   room.room_type || "",
      });
      setShowBook(false);
      onClose();
    } finally {
      setBooking(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <ModalHead bg={cfg.light}>
          <ModalTitle>
            <span>🛏️ Bed {bed.bed_number}</span>
            <span style={{ color: T.textMuted }}>· Room {room.room_number}</span>
            <span style={{ fontSize: "0.68rem", padding: "3px 8px", borderRadius: 10, background: cfg.color, color: "#fff", fontWeight: 700 }}>
              {cfg.label}
            </span>
          </ModalTitle>
          <CloseBtn onClick={onClose}>×</CloseBtn>
        </ModalHead>

        <ModalBody>
          {/* Patient Details Section */}
          {(isOccupied || isNotCleaned) && p.patientname ? (
            <PatientHighlight>
              <PatientHeader>
                <PatientAvatar>{p.patientname.charAt(0)}</PatientAvatar>
                <div>
                  <PatientName>{p.patientname}</PatientName>
                  <span style={{ fontSize: "0.72rem", color: T.red, fontWeight: 700 }}>
                    {isOccupied ? "Currently Admitted Patient" : "Previous Patient (Discharged)"}
                  </span>
                </div>
              </PatientHeader>

              <DetailGrid>
                <DetailItem>
                  <DKey>UHID</DKey>
                  <DVal>{p.uhid || "—"}</DVal>
                </DetailItem>
                <DetailItem>
                  <DKey>IP Number</DKey>
                  <DVal style={{ color: T.redDk }}>{bed.ip_number || "—"}</DVal>
                </DetailItem>
                <DetailItem>
                  <DKey>Age / Gender</DKey>
                  <DVal>{p.age ? `${p.age} Y` : "—"}{p.gender ? ` / ${p.gender}` : ""}</DVal>
                </DetailItem>
                <DetailItem>
                  <DKey>Mobile</DKey>
                  <DVal>{p.mobilePhone || "—"}</DVal>
                </DetailItem>
                <DetailItem style={{ gridColumn: "1 / -1" }}>
                  <DKey>Admitting Doctor</DKey>
                  <DVal>{p.admittingDoctor || "—"}</DVal>
                </DetailItem>
                {p.admissionDateTime && (
                  <DetailItem style={{ gridColumn: "1 / -1" }}>
                    <DKey>Date of Admission</DKey>
                    <DVal>{p.admissionDateTime.replace("T", " ").slice(0, 16)}</DVal>
                  </DetailItem>
                )}
              </DetailGrid>
            </PatientHighlight>
          ) : null}

          {/* Room Information */}
          <InfoSection>
            <InfoTitle>🏨 Room Information</InfoTitle>
            <DetailGrid>
              <DetailItem>
                <DKey>Room No</DKey>
                <DVal>{room.room_number}</DVal>
              </DetailItem>
              <DetailItem>
                <DKey>Bed No</DKey>
                <DVal>Bed {bed.bed_number}</DVal>
              </DetailItem>
              <DetailItem>
                <DKey>Category / Type</DKey>
                <DVal>{room.room_category || room.room_type || "General"}</DVal>
              </DetailItem>
              <DetailItem>
                <DKey>Block &amp; Floor</DKey>
                <DVal>{room.block || "Main Block"} · Floor {room.floor ?? "—"}</DVal>
              </DetailItem>
            </DetailGrid>
          </InfoSection>

          {/* Reserved Details */}
          {isReserved && bed.booking && (
            <InfoSection style={{ background: "#faf5ff", borderColor: "#e9d5ff" }}>
              <InfoTitle style={{ color: T.purpleDk }}>📋 Reservation Details</InfoTitle>
              <DetailGrid>
                <DetailItem>
                  <DKey>IP Number</DKey>
                  <DVal>{bed.booking.ip_number || "—"}</DVal>
                </DetailItem>
                <DetailItem>
                  <DKey>UHID</DKey>
                  <DVal>{bed.booking.uhid || "—"}</DVal>
                </DetailItem>
              </DetailGrid>
            </InfoSection>
          )}

          {/* Housekeeping Action */}
          {(isNotCleaned || isOccupied) && (
            <CleanActionBar cleaned={isClean}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: isClean ? T.greenDk : T.amberDk }}>
                {isClean ? "✅ Bed is clean & sanitized" : isOccupied ? "🔒 Room is occupied" : "🧹 Needs cleaning before next admission"}
              </span>
              {isNotCleaned && !isClean && (
                <button
                  onClick={handleClean}
                  disabled={cleaning}
                  style={{
                    padding: "5px 12px",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    background: T.green,
                    color: "#fff",
                    border: "none",
                    borderRadius: 5,
                    cursor: "pointer",
                  }}
                >
                  {cleaning ? "Marking…" : "✓ Mark Clean"}
                </button>
              )}
            </CleanActionBar>
          )}

          {/* Reserve Bed Form */}
          {showBook && isAvailable && (
            <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: T.purpleDk }}>Enter IP Number to reserve:</span>
              <IPInput
                placeholder="e.g. S026/500017"
                value={bookIp}
                onChange={e => setBookIp(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleBook()}
                autoFocus
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <ModalBtn secondary onClick={() => setShowBook(false)}>Cancel</ModalBtn>
                <ModalBtn purple onClick={handleBook} disabled={booking || !bookIp.trim()}>
                  {booking ? "Reserving…" : "Confirm Reserve"}
                </ModalBtn>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <ActionButtons>
            <ModalBtn secondary onClick={onClose}>Close</ModalBtn>
            {isAvailable && !showBook && (
              <ModalBtn purple onClick={() => setShowBook(true)}>📋 Reserve Bed</ModalBtn>
            )}
          </ActionButtons>
        </ModalBody>
      </ModalBox>
    </Overlay>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN ENQUIRY ROOM COMPONENT
   ───────────────────────────────────────────────────────────── */
const EnquiryRoom = () => {
  const [data,           setData]           = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedBed,     setSelectedBed]     = useState(null);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [selectedStatus,  setSelectedStatus]  = useState("ALL");
  const [selectedBlock,   setSelectedBlock]   = useState("ALL");
  const [selectedCategory,setSelectedCategory]= useState("ALL");
  const [selectedStation, setSelectedStation] = useState("ALL");

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const fetchEnquiryData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`${HmsBaseUrl}room-enquiry/`, "GET");
      const apiData  = response?.data || response;
      if (!Array.isArray(apiData)) { setData([]); return; }

      const grouped = {};
      apiData.forEach((floorEntry) => {
        (floorEntry.rooms || []).forEach((room) => {
          const blockName = room.block || "MAIN BLOCK";
          const stationName = room.nursing_station || (floorEntry.floor ? `Floor ${floorEntry.floor}` : "General Ward");
          if (!grouped[blockName])
            grouped[blockName] = { block: { block_name: blockName }, floors: {} };
          if (!grouped[blockName].floors[stationName])
            grouped[blockName].floors[stationName] = [];
          grouped[blockName].floors[stationName].push({ ...room, id: `${room.room_number}_${stationName}` });
        });
      });

      setData(Object.values(grouped));
    } catch (err) {
      console.error("Room enquiry error:", err);
      toast.error("Failed to fetch room enquiry data");
    } finally {
      setLoading(false);
    }
  }, [HmsBaseUrl]);

  useEffect(() => {
    fetchEnquiryData();
  }, [fetchEnquiryData]);

  const handleCleanedChange = useCallback(async (payload) => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}update-room-cleaned/`, "PUT", payload);
      if (res.success || res.message) {
        toast.success(`Bed ${payload.bed_no} marked as cleaned ✓`);
        fetchEnquiryData();
      } else {
        toast.error(res.error || "Failed to update cleaned status");
      }
    } catch {
      toast.error("Failed to update cleaned status");
    }
  }, [HmsBaseUrl, fetchEnquiryData]);

  const handleBook = useCallback(async (payload) => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}book-room/`, "POST", payload);
      if (res.success || res.message) {
        toast.success(`Room ${payload.room_number} / Bed ${payload.bed_number} reserved ✓`);
        fetchEnquiryData();
      } else {
        toast.error(res.error || "Failed to reserve room");
        throw new Error(res.error || "Failed");
      }
    } catch (err) {
      toast.error(err.message || "Failed to reserve room");
      throw err;
    }
  }, [HmsBaseUrl, fetchEnquiryData]);

  /* ── Stats ── */
  const stats = useMemo(() => {
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
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, available, occupied, maintenance, notCleaned, reserved, occupancyRate };
  }, [data]);

  /* ── Filter Options ── */
  const filterOptions = useMemo(() => {
    const blocks = new Set();
    const categories = new Set();
    const stations = new Set();
    data.forEach(b => {
      if (b.block?.block_name) blocks.add(b.block.block_name);
      Object.entries(b.floors || {}).forEach(([f, rooms]) => {
        rooms.forEach(r => {
          const cat = r.room_category || r.room_type;
          if (cat) categories.add(cat);
          if (r.nursing_station) stations.add(r.nursing_station);
        });
      });
    });
    return {
      blocks: Array.from(blocks).sort(),
      categories: Array.from(categories).sort(),
      stations: Array.from(stations).sort(),
    };
  }, [data]);

  /* ── Filter Data ── */
  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return data
      .filter(b => selectedBlock === "ALL" || b.block.block_name === selectedBlock)
      .map(b => {
        const filteredFloors = {};

        Object.entries(b.floors).forEach(([floor, rooms]) => {
          if (selectedStation !== "ALL" && String(floor).toLowerCase() !== selectedStation.toLowerCase()) return;

          const matchedRooms = rooms
            .filter(room => {
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
                const pName = String(bed.patient?.patientname || "").toLowerCase();
                const uhid = String(bed.patient?.uhid || "").toLowerCase();
                const ipNo = String(bed.ip_number || bed.booking?.ip_number || "").toLowerCase();

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
            filteredFloors[floor] = matchedRooms;
          }
        });

        return { ...b, floors: filteredFloors };
      })
      .filter(b => Object.keys(b.floors).length > 0);
  }, [data, searchTerm, selectedStatus, selectedBlock, selectedCategory, selectedStation]);

  const LEGEND_ITEMS = [
    { status: BED_STATUS.OCCUPIED,    cfg: STATUS_CFG[BED_STATUS.OCCUPIED],    count: stats.occupied },
    { status: BED_STATUS.AVAILABLE,   cfg: STATUS_CFG[BED_STATUS.AVAILABLE],   count: stats.available },
    { status: BED_STATUS.NOT_CLEANED, cfg: STATUS_CFG[BED_STATUS.NOT_CLEANED], count: stats.notCleaned },
    { status: BED_STATUS.RESERVED,    cfg: STATUS_CFG[BED_STATUS.RESERVED],    count: stats.reserved },
    { status: BED_STATUS.MAINTENANCE, cfg: STATUS_CFG[BED_STATUS.MAINTENANCE], count: stats.maintenance },
  ];

  const handleStatusToggle = (status) => {
    setSelectedStatus(prev => (prev === status ? "ALL" : status));
  };

  return (
    <PageWrapper>
      <PageInner>

        {/* ── Top Bar ── */}
        <TopBar>
          <PageTitle>🛏️ Room &amp; Bed Occupancy Enquiry</PageTitle>

          <HeaderActions>
            <OccupancyChip>
              <span>Occupancy: <strong>{stats.occupancyRate}%</strong></span>
              <ProgressTrack><ProgressFill pct={stats.occupancyRate} /></ProgressTrack>
              <span style={{ color: T.textMuted }}>({stats.occupied}/{stats.total} Beds)</span>
            </OccupancyChip>

            <RefreshBtn onClick={fetchEnquiryData} disabled={loading}>
              <span className={loading ? "spin" : ""}>🔄</span>
              {loading ? "Loading…" : "Refresh"}
            </RefreshBtn>
          </HeaderActions>
        </TopBar>

        {/* ── 1. Search & Filter Bar (Top) ── */}
        <FilterToolbar>
          <SearchInputWrap>
            <SearchIcon>🔍</SearchIcon>
            <SearchInp
              type="text"
              placeholder="Search Room, Bed, Patient, UHID, IP..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </SearchInputWrap>

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
            <option value="ALL">🩺 All Stations / Floors</option>
            {filterOptions.stations.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </FilterSelect>
        </FilterToolbar>

        {/* ── 2. Color Coding Legend & Quick Status Filter Strip ── */}
        <ColorLegendStrip>
          <LegendHeader>
            <span>🎨 Color Coding:</span>
          </LegendHeader>

          <LegendBadgesGroup>
            {LEGEND_ITEMS.map(({ status, cfg, count }) => {
              const active = selectedStatus === status;
              return (
                <ColorCodePill
                  key={status}
                  cfg={cfg}
                  active={active}
                  onClick={() => handleStatusToggle(status)}
                  title={`Filter by ${cfg.label}`}
                >
                  <ColorDot color={cfg.color} active={active} />
                  <span>{cfg.label}</span>
                  <CountBubble cfg={cfg} active={active}>{count}</CountBubble>
                </ColorCodePill>
              );
            })}

            {selectedStatus !== "ALL" && (
              <ResetFilterBtn onClick={() => setSelectedStatus("ALL")}>
                ✕ Reset Filter
              </ResetFilterBtn>
            )}
          </LegendBadgesGroup>
        </ColorLegendStrip>

        {/* ── 3. Room Cards Grid ── */}
        {loading ? (
          <EmptyNotice>⏳ Loading rooms and beds…</EmptyNotice>
        ) : filteredData.length === 0 ? (
          <EmptyNotice>🏨 No rooms match the selected filter.</EmptyNotice>
        ) : (
          filteredData.map((b, bIdx) => (
            <BlockWrap key={bIdx}>
              <BlockTitle>🏢 {b.block.block_name}</BlockTitle>

              {Object.entries(b.floors)
                .map(([floor, rooms]) => (
                  <FloorWrap key={floor}>
                    <FloorTitle>📍 {floor}</FloorTitle>

                    <RoomGrid>
                      {rooms.map(room => {
                        const occupiedCount = (room.beds || []).filter(bd => bd.status === BED_STATUS.OCCUPIED).length;
                        const hasOcc = occupiedCount > 0;

                        return (
                          <RoomCard key={room.room_number} hasOccupied={hasOcc}>
                            <RoomHeader hasOccupied={hasOcc}>
                              <RoomNo>Room {room.room_number}</RoomNo>
                              <RoomMeta>
                                <CategoryTag>{room.room_category || room.room_type || "General"}</CategoryTag>
                                <BedCountPill occupied={occupiedCount}>
                                  {occupiedCount}/{room.beds?.length || 0}
                                </BedCountPill>
                              </RoomMeta>
                            </RoomHeader>

                            <BedTilesGrid>
                              {(room.beds || []).map((bed, bdIdx) => {
                                const isOcc = bed.status === BED_STATUS.OCCUPIED;
                                const isMaint = bed.status === BED_STATUS.MAINTENANCE;
                                const cfg = STATUS_CFG[bed.status] || STATUS_CFG[BED_STATUS.MAINTENANCE];

                                return (
                                  <BedTile
                                    key={bdIdx}
                                    status={bed.status}
                                    cfg={cfg}
                                    title={`Bed ${bed.bed_number} — ${bed.status}${bed.patient?.patientname ? ` (${bed.patient.patientname})` : ""}`}
                                    onClick={() => !isMaint && setSelectedBed({ bed, room })}
                                  >
                                    {isOcc && <OccupiedDot />}
                                    <BedMiniSVG
                                      color={cfg.color}
                                      size={18}
                                    />
                                    <BedNoText cfg={cfg}>B{bed.bed_number}</BedNoText>
                                    <BedStatusText cfg={cfg}>
                                      {cfg.label}
                                    </BedStatusText>
                                  </BedTile>
                                );
                              })}
                            </BedTilesGrid>
                          </RoomCard>
                        );
                      })}
                    </RoomGrid>
                  </FloorWrap>
                ))}
            </BlockWrap>
          ))
        )}

      </PageInner>

      {/* ── Patient & Bed Detail Modal (Opens when clicked) ── */}
      {selectedBed && (
        <BedDetailModal
          bed={selectedBed.bed}
          room={selectedBed.room}
          onClose={() => setSelectedBed(null)}
          onCleanedChange={handleCleanedChange}
          onBook={handleBook}
        />
      )}
    </PageWrapper>
  );
};

export default EnquiryRoom;