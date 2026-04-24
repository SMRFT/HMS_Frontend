import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import { PageWrapper, colors } from "../GlobalStyles";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
   ───────────────────────────────────────────────────────────── */
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
  borderSoft: "#f1f5f9",
  surface:    "#ffffff",
  bg:         "#f8fafc",
  bgDeep:     "#f1f5f9",
  textMain:   "#0f172a",
  textMuted:  "#64748b",
  shadow:     "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:   "0 4px 12px rgba(0,0,0,0.1)",
  shadowLg:   "0 20px 60px rgba(0,0,0,0.22)",
  radius:     "10px",
  radiusSm:   "6px",
  font:       "'DM Sans', 'Segoe UI', sans-serif",
};

/* ─────────────────────────────────────────────────────────────
   STATUS CONFIG
   ───────────────────────────────────────────────────────────── */
const BED_STATUS = {
  AVAILABLE:    "Available",
  OCCUPIED:     "Occupied",
  NOT_CLEANED:  "Available (Not Cleaned)",
  MAINTENANCE:  "Maintenance",
  RESERVED:     "Reserved",
};

const STATUS_CFG = {
  [BED_STATUS.AVAILABLE]:   { color: T.green,  light: T.greenLt,  dark: T.greenDk,  label: "Available",   icon: "✓" },
  [BED_STATUS.OCCUPIED]:    { color: T.red,    light: T.redLt,    dark: T.redDk,    label: "Occupied",    icon: "●" },
  [BED_STATUS.NOT_CLEANED]: { color: T.amber,  light: T.amberLt,  dark: T.amberDk,  label: "Not Cleaned", icon: "~" },
  [BED_STATUS.MAINTENANCE]: { color: T.gray,   light: T.grayLt,   dark: T.grayDk,   label: "Maintenance", icon: "✕" },
  [BED_STATUS.RESERVED]:    { color: T.purple, light: T.purpleLt, dark: T.purpleDk, label: "Reserved",    icon: "◆" },
};

const ROOM_CFG = {
  available:    { border: "#86efac", bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)", dot: T.green,  label: "Available"   },
  occupied:     { border: "#fca5a5", bg: "linear-gradient(135deg,#fff5f5,#fee2e2)", dot: T.red,    label: "Occupied"    },
  "not-cleaned":{ border: "#fcd34d", bg: "linear-gradient(135deg,#fffdf0,#fef3c7)", dot: T.amber,  label: "Not Cleaned" },
  maintenance:  { border: "#d1d5db", bg: "linear-gradient(135deg,#fafafa,#f3f4f6)", dot: T.gray,   label: "Maintenance" },
  partial:      { border: "#93c5fd", bg: "linear-gradient(135deg,#f0f7ff,#dbeafe)", dot: T.blue,   label: "Partial"     },
  reserved:     { border: "#c084fc", bg: "linear-gradient(135deg,#faf5ff,#ede9fe)", dot: T.purple, label: "Reserved"    },
};

function getRoomStatus(beds) {
  if (!beds?.length) return "available";
  const s = beds.map((b) => b.status);
  if (s.every((x) => x === BED_STATUS.MAINTENANCE))   return "maintenance";
  if (s.every((x) => x === BED_STATUS.OCCUPIED))      return "occupied";
  if (s.every((x) => x === BED_STATUS.RESERVED))      return "reserved";
  if (s.every((x) => x === BED_STATUS.NOT_CLEANED))   return "not-cleaned";
  if (s.some((x) => x === BED_STATUS.OCCUPIED) &&
      s.some((x) => x === BED_STATUS.AVAILABLE || x === BED_STATUS.NOT_CLEANED))
    return "partial";
  if (s.some((x) => x === BED_STATUS.OCCUPIED))       return "partial";
  if (s.some((x) => x === BED_STATUS.RESERVED) &&
      !s.some((x) => x === BED_STATUS.OCCUPIED))      return "reserved";
  if (s.some((x) => x === BED_STATUS.NOT_CLEANED) &&
      !s.some((x) => x === BED_STATUS.OCCUPIED))      return "not-cleaned";
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

/* ─────────────────────────────────────────────────────────────
   ANIMATIONS
   ───────────────────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; } 50% { opacity: 0.45; }
`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
`;
const shimmer = keyframes`
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
`;
const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

/* ─────────────────────────────────────────────────────────────
   BED ICON SVG
   ───────────────────────────────────────────────────────────── */
const BedIconSVG = ({ color = "#9ca3af", small = false }) => {
  const w = small ? 26 : 34;
  const h = small ? 17 : 22;
  return (
    <svg viewBox="0 0 36 24" width={w} height={h} xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}>
      <rect x="1" y="11" width="34" height="11" rx="2" fill={color} opacity="0.9" />
      <rect x="3" y="9" width="30" height="8" rx="1.5" fill={color} opacity="0.55" />
      <rect x="22" y="7" width="9" height="6" rx="1.5" fill={color} opacity="0.95" />
      <rect x="1" y="5" width="4" height="17" rx="1.5" fill={color} opacity="0.85" />
      <rect x="31" y="9" width="4" height="13" rx="1.5" fill={color} opacity="0.85" />
      <rect x="3"  y="21" width="3" height="3" rx="1" fill={color} opacity="0.65" />
      <rect x="30" y="21" width="3" height="3" rx="1" fill={color} opacity="0.65" />
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   LAYOUT
   ───────────────────────────────────────────────────────────── */
const PageInner = styled.div`
  padding: 16px 18px;
  background: ${T.bg};
  min-height: 100vh;
  font-family: ${T.font};
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
`;

const PageTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: ${T.primaryDk};
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.02em;
  &::before {
    content: "";
    display: inline-block;
    width: 3px; height: 18px;
    background: linear-gradient(180deg, ${T.primary}, ${T.primaryDk});
    border-radius: 2px;
  }
`;

const TopActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

const RefreshBtn = styled.button`
  height: 30px;
  padding: 0 12px;
  font-size: 0.72rem;
  font-weight: 700;
  font-family: ${T.font};
  border: 1.5px solid ${T.primaryMd};
  border-radius: ${T.radiusSm};
  background: ${T.primaryLt};
  cursor: pointer;
  color: ${T.primaryDk};
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s;
  letter-spacing: 0.01em;
  &:hover {
    background: ${T.primaryMd};
    border-color: ${T.primary};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px ${T.primary}33;
  }
  &:active { transform: translateY(0); }
`;

/* ─── Legend ──────────────────────────────────────────────── */
const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 3px 10px;
  background: ${T.white};
  border: 1px solid ${T.border};
  border-radius: 7px;
  padding: 5px 12px;
  flex-wrap: wrap;
  box-shadow: ${T.shadow};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  font-weight: 600;
  color: ${T.textMuted};
`;

const LegendDot = styled.span`
  width: 7px; height: 7px;
  border-radius: 50%;
  background: ${p => p.color};
  flex-shrink: 0;
`;

/* ─── Stats ───────────────────────────────────────────────── */
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  margin-bottom: 14px;
  @media (max-width: 700px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 400px) { grid-template-columns: repeat(2, 1fr); }
`;

const StatCard = styled.div`
  background: ${T.white};
  border: 1px solid ${T.border};
  border-radius: 8px;
  padding: 9px 12px;
  display: flex;
  align-items: center;
  gap: 9px;
  box-shadow: ${T.shadow};
  animation: ${fadeUp} 0.25s ease both;
  animation-delay: ${(p) => p.i * 35}ms;
  position: relative;
  overflow: hidden;
  &::after {
    content: "";
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: ${p => p.accent};
    border-radius: 8px 0 0 8px;
  }
`;

const StatIcon = styled.div`
  width: 28px; height: 28px;
  border-radius: 7px;
  background: ${p => p.bg};
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`;

const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: 800;
  color: ${(p) => p.color || T.textMain};
  line-height: 1;
  letter-spacing: -0.03em;
`;

const StatLabel = styled.div`
  font-size: 0.6rem;
  font-weight: 600;
  color: ${T.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
`;

/* ─── Block ──────────────────────────────────────────────── */
const BlockCard = styled.div`
  background: ${T.white};
  border: 1px solid ${T.border};
  border-radius: ${T.radius};
  overflow: hidden;
  margin-bottom: 14px;
  box-shadow: ${T.shadow};
  animation: ${fadeUp} 0.3s ease both;
  animation-delay: ${(p) => p.index * 50}ms;
`;

const BlockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 14px;
  background: linear-gradient(135deg, ${T.primaryLt} 0%, #e0fdf4 100%);
  border-bottom: 1px solid ${T.primaryMd}88;
`;

const BlockName = styled.div`
  font-size: 0.82rem;
  font-weight: 800;
  color: ${T.primaryDk};
  display: flex;
  align-items: center;
  gap: 7px;
  letter-spacing: -0.01em;
`;

const BlockMiniStats = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
`;

const MiniBadge = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
  background: ${(p) => p.bg};
  color: ${(p) => p.color};
  border: 1px solid ${(p) => p.color}33;
  display: flex;
  align-items: center;
  gap: 3px;
  letter-spacing: 0.01em;
`;

const BlockBody = styled.div`
  padding: 12px 14px;
`;

/* ─── Floor ──────────────────────────────────────────────── */
const FloorSection = styled.div`
  margin-bottom: 16px;
  &:last-child { margin-bottom: 0; }
`;

const FloorLabel = styled.div`
  display: flex; align-items: center; gap: 7px;
  font-size: 0.67rem; font-weight: 800;
  color: ${T.primary};
  text-transform: uppercase; letter-spacing: 0.09em;
  margin-bottom: 10px;
  &::before {
    content: "";
    display: inline-block; width: 6px; height: 6px;
    border-radius: 50%;
    background: ${T.primary};
    box-shadow: 0 0 0 3px ${T.primaryMd};
  }
  &::after {
    content: ""; flex: 1; height: 1px;
    background: linear-gradient(90deg, ${T.primaryMd}, transparent);
  }
`;

/* ─── Room Grid ──────────────────────────────────────────── */
const RoomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
  gap: 8px;
  @media (max-width: 480px) { grid-template-columns: 1fr 1fr; gap: 6px; }
`;

/* ─── Room Card ──────────────────────────────────────────── */
const RoomCard = styled.div`
  border: 1.5px solid ${(p) => ROOM_CFG[p.rs]?.border || T.border};
  border-radius: 8px;
  overflow: hidden;
  background: ${T.white};
  box-shadow: ${T.shadow};
  transition: box-shadow 0.18s, transform 0.18s;
  &:hover {
    box-shadow: 0 6px 18px ${(p) => ROOM_CFG[p.rs]?.dot || T.gray}2a;
    transform: translateY(-2px);
  }
`;

const RoomTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 9px;
  background: ${(p) => ROOM_CFG[p.rs]?.bg || T.grayLt};
  border-bottom: 1px solid ${(p) => ROOM_CFG[p.rs]?.border || T.border}88;
`;

const RoomNumber = styled.span`
  font-weight: 800;
  font-size: 0.82rem;
  color: ${T.textMain};
  letter-spacing: -0.02em;
`;

const RoomStatusPill = styled.span`
  font-size: 0.56rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  background: ${(p) => ROOM_CFG[p.rs]?.dot || T.gray};
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
`;

const RoomTypeTag = styled.div`
  font-size: 0.6rem;
  color: ${T.textMuted};
  padding: 2px 9px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
`;

/* ─── Bed Grid ───────────────────────────────────────────── */
const BedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(62px, 1fr));
  gap: 5px;
  padding: 7px 8px 8px;
`;

/* ─── Bed Card ───────────────────────────────────────────── */
const BedCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 3px 5px;
  border-radius: 7px;
  border: 1.5px solid ${(p) => STATUS_CFG[p.status]?.color || T.gray}40;
  background: ${(p) => STATUS_CFG[p.status]?.light || T.grayLt};
  cursor: ${(p) => (p.status === BED_STATUS.MAINTENANCE ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.status === BED_STATUS.MAINTENANCE ? 0.5 : 1)};
  transition: all 0.16s;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: ${(p) => STATUS_CFG[p.status]?.color || T.gray};
    opacity: 0;
    transition: opacity 0.16s;
    border-radius: 5px;
  }

  ${(p) =>
    p.status !== BED_STATUS.MAINTENANCE &&
    css`
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px ${STATUS_CFG[p.status]?.color || T.gray}44;
        border-color: ${STATUS_CFG[p.status]?.color || T.gray};
        &::before { opacity: 0.07; }
      }
    `}
`;

const BedLabel = styled.div`
  font-size: 0.62rem;
  font-weight: 800;
  color: ${(p) => STATUS_CFG[p.status]?.dark || T.grayDk};
  letter-spacing: 0.01em;
  z-index: 1;
`;

const BedStatusMini = styled.div`
  font-size: 0.52rem;
  font-weight: 600;
  color: ${(p) => STATUS_CFG[p.status]?.color || T.gray};
  z-index: 1;
  white-space: nowrap;
`;

const NoBeds = styled.div`
  font-size: 0.7rem;
  color: ${T.textMuted};
  padding: 6px 4px;
  text-align: center;
  grid-column: 1 / -1;
`;

/* ─── Modal ──────────────────────────────────────────────── */
const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const Modal = styled.div`
  background: ${T.white};
  border-radius: 14px;
  width: 100%;
  max-width: ${(p) => p.width || "460px"};
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${T.shadowLg};
  animation: ${popIn} 0.2s ease;
  scrollbar-width: thin;
`;

const ModalHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${T.border};
  background: ${(p) => p.bg || T.bg};
  border-radius: 14px 14px 0 0;
  position: sticky; top: 0; z-index: 1;
`;

const ModalTitle = styled.div`
  font-size: 0.86rem;
  font-weight: 800;
  color: ${T.textMain};
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  letter-spacing: -0.01em;
`;

const CloseBtn = styled.button`
  width: 26px; height: 26px;
  border-radius: 50%;
  border: 1.5px solid ${T.border};
  background: ${T.white};
  cursor: pointer;
  font-size: 1rem;
  color: ${T.textMuted};
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
  &:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }
`;

const ModalBody = styled.div`padding: 14px 16px;`;

/* ─── Big bed preview in modal ───────────────────────────── */
const ModalBedPreview = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 10px;
  background: ${(p) => STATUS_CFG[p.status]?.light || T.grayLt};
  border: 1.5px solid ${(p) => STATUS_CFG[p.status]?.color || T.gray}33;
  margin-bottom: 12px;
`;

const ModalBedInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ModalBedNumber = styled.div`
  font-size: 1rem;
  font-weight: 800;
  color: ${(p) => STATUS_CFG[p.status]?.dark || T.grayDk};
  letter-spacing: -0.02em;
`;

const ModalStatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.69rem;
  font-weight: 700;
  background: ${(p) => STATUS_CFG[p.status]?.color || T.gray}18;
  color: ${(p) => STATUS_CFG[p.status]?.color || T.gray};
  border: 1.5px solid ${(p) => STATUS_CFG[p.status]?.color || T.gray}33;
  width: fit-content;
`;

const StatusDot = styled.span`
  width: 6px; height: 6px;
  border-radius: 50%;
  background: ${(p) => STATUS_CFG[p.status]?.color || T.gray};
  flex-shrink: 0;
`;

/* ─── Detail section ──────────────────────────────────────── */
const Section = styled.div`
  background: ${T.bg};
  border: 1px solid ${T.borderSoft};
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
`;

const SectionTitle = styled.div`
  font-size: 0.63rem;
  font-weight: 800;
  color: ${T.primary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 3px 0;
  border-bottom: 1px solid ${T.borderSoft};
  &:last-child { border-bottom: none; }
`;

const RowKey = styled.span`
  font-size: 0.7rem;
  color: ${T.textMuted};
  flex-shrink: 0;
  font-weight: 500;
`;

const RowVal = styled.span`
  font-size: 0.7rem;
  color: ${T.textMain};
  font-weight: 700;
  text-align: right;
  word-break: break-word;
`;

/* ─── Cleaned toggle ──────────────────────────────────────── */
const CleanRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  background: ${(p) =>
    p.cleaned ? "#f0fdf4" : p.disabled ? T.bg : "#fffbeb"};
  border: 1.5px solid ${(p) =>
    p.cleaned ? "#86efac" : p.disabled ? T.border : "#fde047"};
  border-radius: 8px;
  margin-bottom: 10px;
`;

const CleanLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 600;
  color: ${(p) =>
    p.cleaned ? T.greenDk : p.disabled ? T.textMuted : T.amberDk};
  display: flex;
  align-items: center;
  gap: 5px;
`;

const CleanCheck = styled.input`
  width: 17px; height: 17px;
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  accent-color: ${T.green};
  flex-shrink: 0;
`;

/* ─── Buttons ─────────────────────────────────────────────── */
const ActionRow = styled.div`
  display: flex;
  gap: 7px;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid ${T.borderSoft};
  margin-top: 4px;
`;

const Btn = styled.button`
  height: 32px;
  padding: 0 16px;
  font-size: 0.72rem;
  font-weight: 700;
  font-family: ${T.font};
  border-radius: ${T.radiusSm};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  background: ${(p) =>
    p.danger    ? "#fee2e2"
  : p.success   ? T.green
  : p.secondary ? T.grayLt
  : p.purple    ? T.purple
  :               T.primary};
  color: ${(p) =>
    p.danger    ? "#dc2626"
  : p.success   ? T.white
  : p.secondary ? T.grayDk
  : p.purple    ? T.white
  :               T.white};
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
  pointer-events: ${(p) => (p.disabled ? "none" : "auto")};
  transition: filter 0.15s, transform 0.1s, box-shadow 0.15s;
  letter-spacing: 0.01em;
  &:hover {
    filter: brightness(0.92);
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0,0,0,0.15);
  }
  &:active { transform: translateY(0); filter: brightness(0.88); }
`;

/* ─── Book form ───────────────────────────────────────────── */
const IPInput = styled.input`
  width: 100%;
  height: 36px;
  padding: 0 11px;
  font-size: 0.82rem;
  font-family: ${T.font};
  border: 1.5px solid ${T.border};
  border-radius: ${T.radiusSm};
  background: ${T.white};
  color: ${T.textMain};
  margin-bottom: 12px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus {
    border-color: ${T.primary};
    box-shadow: 0 0 0 3px ${T.primaryMd}66;
  }
  &::placeholder { color: ${T.textMuted}; font-size: 0.76rem; }
`;

const BookNote = styled.p`
  font-size: 0.73rem;
  color: ${T.textMuted};
  margin: 0 0 12px;
  line-height: 1.5;
`;

/* ─── Skeletons / Empty ───────────────────────────────────── */
const SkeletonBlock = styled.div`
  height: 110px;
  border-radius: ${T.radius};
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 400% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  margin-bottom: 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 50px 20px;
  color: ${T.textMuted};
  .icon { font-size: 2.4rem; margin-bottom: 10px; opacity: 0.3; }
  p { font-size: 0.84rem; margin: 0; }
`;

/* ─────────────────────────────────────────────────────────────
   BED DETAIL MODAL
   ───────────────────────────────────────────────────────────── */
const BedDetailModal = ({ bed, room, onClose, onCleanedChange, onBook }) => {
  const [cleaning,    setCleaning]    = useState(false);
  const [localClean,  setLocalClean]  = useState(false);
  const [showBook,    setShowBook]    = useState(false);
  const [bookIp,      setBookIp]      = useState("");
  const [booking,     setBooking]     = useState(false);

  const isOccupied    = bed.status === BED_STATUS.OCCUPIED;
  const isNotCleaned  = bed.status === BED_STATUS.NOT_CLEANED;
  const isAvailable   = bed.status === BED_STATUS.AVAILABLE;
  const isReserved    = bed.status === BED_STATUS.RESERVED;

  const canClean       = isNotCleaned && !localClean;
  const cleanDisabled  = cleaning || !canClean;
  const showCleanRow   = isNotCleaned || isOccupied;
  const isMarkedClean  = bed.is_roomCleaned === true || localClean;

  const cfg = STATUS_CFG[bed.status] || STATUS_CFG[BED_STATUS.MAINTENANCE];

  const handleClean = async () => {
    if (cleanDisabled) return;
    setCleaning(true);
    try {
      await onCleanedChange({
        room_no:        room.room_number,
        bed_no:         bed.bed_number,
        is_roomCleaned: true,
        ip_number:      bed.ip_number   || "",
        shifting_id:    bed.shifting_id || "",
      });
      setLocalClean(true);
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
    } catch {
      // error toast inside onBook
    } finally {
      setBooking(false);
    }
  };

  const headerBg = ROOM_CFG[getRoomStatus([bed])]?.bg || T.bg;

  return (
    <Overlay onClick={onClose}>
      <Modal width="440px" onClick={(e) => e.stopPropagation()}>

        <ModalHead bg={headerBg}>
          <ModalTitle>
            🛏️ Bed {bed.bed_number} — Room {room.room_number}
          </ModalTitle>
          <CloseBtn onClick={onClose} title="Close">×</CloseBtn>
        </ModalHead>

        <ModalBody>

          {/* Bed preview — horizontal layout to save space */}
          <ModalBedPreview status={bed.status}>
            <BedIconSVG color={cfg.color} />
            <ModalBedInfo>
              <ModalBedNumber status={bed.status}>Bed {bed.bed_number}</ModalBedNumber>
              <ModalStatusBadge status={bed.status}>
                <StatusDot status={bed.status} />
                {cfg.label}
              </ModalStatusBadge>
            </ModalBedInfo>
          </ModalBedPreview>

          {/* Room info */}
          <Section>
            <SectionTitle>🏨 Room Details</SectionTitle>
            <Row><RowKey>Room No.</RowKey><RowVal>{room.room_number}</RowVal></Row>
            <Row><RowKey>Room Type</RowKey><RowVal>{room.room_type || "—"}</RowVal></Row>
            <Row><RowKey>Block</RowKey><RowVal>{room.block || "—"}</RowVal></Row>
            <Row><RowKey>Bed No.</RowKey><RowVal>{bed.bed_number}</RowVal></Row>
          </Section>

          {/* Patient info */}
          {(isOccupied || isNotCleaned) && bed.patient?.patientname && (
            <Section>
              <SectionTitle>👤 Patient Details</SectionTitle>
              <Row><RowKey>Name</RowKey><RowVal>{bed.patient.patientname}</RowVal></Row>
              {bed.patient.uhid        && <Row><RowKey>UHID</RowKey><RowVal>{bed.patient.uhid}</RowVal></Row>}
              {bed.ip_number           && <Row><RowKey>IP Number</RowKey><RowVal>{bed.ip_number}</RowVal></Row>}
              {bed.patient.age         && <Row><RowKey>Age / Gender</RowKey><RowVal>{bed.patient.age}{bed.patient.gender ? ` / ${bed.patient.gender}` : ""}</RowVal></Row>}
              {bed.patient.mobilePhone && <Row><RowKey>Mobile</RowKey><RowVal>{bed.patient.mobilePhone}</RowVal></Row>}
            </Section>
          )}

          {/* Reservation info */}
          {isReserved && bed.booking && (
            <Section>
              <SectionTitle>📋 Reservation Details</SectionTitle>
              {bed.booking.ip_number && <Row><RowKey>IP Number</RowKey><RowVal>{bed.booking.ip_number}</RowVal></Row>}
              {bed.booking.uhid      && <Row><RowKey>UHID</RowKey><RowVal>{bed.booking.uhid}</RowVal></Row>}
              {bed.booking.booked_at && (
                <Row>
                  <RowKey>Booked At</RowKey>
                  <RowVal>{new Date(bed.booking.booked_at).toLocaleString("en-IN")}</RowVal>
                </Row>
              )}
            </Section>
          )}

          {/* Clean toggle */}
          {showCleanRow && (
            <CleanRow cleaned={isMarkedClean} disabled={cleanDisabled}>
              <CleanLabel cleaned={isMarkedClean} disabled={cleanDisabled}>
                {isMarkedClean
                  ? "✅ Room marked as Cleaned"
                  : isOccupied
                    ? "🔒 Cannot clean — room is Occupied"
                    : canClean
                      ? "🧹 Mark Room as Cleaned"
                      : "🔒 Already cleaned"}
              </CleanLabel>
              <CleanCheck
                type="checkbox"
                checked={isMarkedClean}
                disabled={cleanDisabled}
                onChange={handleClean}
              />
            </CleanRow>
          )}

          {/* Book form */}
          {showBook && isAvailable && (
            <Section style={{ marginBottom: 10 }}>
              <SectionTitle>📋 Reserve Room</SectionTitle>
              <BookNote>
                Enter the IP Number for{" "}
                <strong>Room {room.room_number} / Bed {bed.bed_number}</strong>.
              </BookNote>
              <IPInput
                placeholder="Enter IP Number"
                value={bookIp}
                onChange={(e) => setBookIp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBook()}
                autoFocus
              />
              <ActionRow style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
                <Btn secondary onClick={() => { setShowBook(false); setBookIp(""); }}>Cancel</Btn>
                <Btn onClick={handleBook} disabled={booking || !bookIp.trim()}>
                  {booking ? "Reserving…" : "✓ Confirm Reserve"}
                </Btn>
              </ActionRow>
            </Section>
          )}

          {/* Actions */}
          <ActionRow>
            <Btn secondary onClick={onClose}>Close</Btn>
            {isAvailable && !showBook && (
              <Btn purple onClick={() => setShowBook(true)}>📋 Book / Reserve</Btn>
            )}
          </ActionRow>

        </ModalBody>
      </Modal>
    </Overlay>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────────── */
const EnquiryRoom = () => {
  const [data,        setData]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selectedBed, setSelectedBed] = useState(null);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchEnquiryData(); }, []);

  const fetchEnquiryData = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`${HmsBaseUrl}room-enquiry/`, "GET");
      const apiData  = response?.data || response;
      if (!Array.isArray(apiData)) { setData([]); return; }

      const grouped = {};
      apiData.forEach((floorEntry) => {
        const floor = floorEntry.floor;
        (floorEntry.rooms || []).forEach((room) => {
          const blockName = room.block || "UNKNOWN BLOCK";
          if (!grouped[blockName])
            grouped[blockName] = { block: { block_name: blockName }, floors: {} };
          if (!grouped[blockName].floors[floor])
            grouped[blockName].floors[floor] = [];
          grouped[blockName].floors[floor].push({ ...room, id: `${room.room_number}_${floor}` });
        });
      });

      setData(Object.values(grouped));
    } catch (err) {
      console.error("Room enquiry error:", err);
      toast.error("Failed to fetch room enquiry data");
    } finally {
      setLoading(false);
    }
  };

  const handleCleanedChange = useCallback(async (payload) => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}update-room-cleaned/`, "PATCH", payload);
      if (res.success || res.message) {
        toast.success(`Bed ${payload.bed_no} marked as cleaned ✓`);
        fetchEnquiryData();
      } else {
        toast.error(res.error || "Failed to update cleaned status");
      }
    } catch {
      toast.error("Failed to update cleaned status");
    }
  }, [HmsBaseUrl]);

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
  }, [HmsBaseUrl]);

  const stats = calcStats(data);

  const blockStats = (blockData) => {
    let available = 0, occupied = 0, notCleaned = 0, maintenance = 0, reserved = 0;
    Object.values(blockData.floors).forEach((rooms) =>
      rooms.forEach((room) =>
        (room.beds || []).forEach((bed) => {
          if      (bed.status === BED_STATUS.AVAILABLE)   available++;
          else if (bed.status === BED_STATUS.OCCUPIED)    occupied++;
          else if (bed.status === BED_STATUS.NOT_CLEANED) notCleaned++;
          else if (bed.status === BED_STATUS.RESERVED)    reserved++;
          else                                            maintenance++;
        })
      )
    );
    return { available, occupied, notCleaned, maintenance, reserved };
  };

  const bedTooltip = (bed) => {
    const base = `Bed ${bed.bed_number}`;
    if (bed.status === BED_STATUS.AVAILABLE)   return `${base} — Available`;
    if (bed.status === BED_STATUS.OCCUPIED)    return `${base} — Occupied${bed.patient?.patientname ? ` · ${bed.patient.patientname}` : ""}`;
    if (bed.status === BED_STATUS.NOT_CLEANED) return `${base} — Needs Cleaning`;
    if (bed.status === BED_STATUS.MAINTENANCE) return `${base} — Under Maintenance`;
    if (bed.status === BED_STATUS.RESERVED)    return `${base} — Reserved${bed.booking?.ip_number ? ` · IP ${bed.booking.ip_number}` : ""}`;
    return base;
  };

  const STAT_ITEMS = [
    { label: "Total",       value: stats.total,       color: T.primaryDk, accent: T.primary, icon: "🏥", bg: T.primaryLt },
    { label: "Available",   value: stats.available,   color: T.greenDk,   accent: T.green,   icon: "✓",  bg: T.greenLt   },
    { label: "Occupied",    value: stats.occupied,    color: T.redDk,     accent: T.red,     icon: "●",  bg: T.redLt     },
    { label: "Not Cleaned", value: stats.notCleaned,  color: T.amberDk,   accent: T.amber,   icon: "~",  bg: T.amberLt   },
    { label: "Reserved",    value: stats.reserved,    color: T.purpleDk,  accent: T.purple,  icon: "◆",  bg: T.purpleLt  },
    { label: "Maint.",      value: stats.maintenance, color: T.grayDk,    accent: T.gray,    icon: "✕",  bg: T.grayLt    },
  ];

  const LEGEND_ITEMS = [
    { status: BED_STATUS.AVAILABLE,   color: T.green  },
    { status: BED_STATUS.OCCUPIED,    color: T.red    },
    { status: BED_STATUS.NOT_CLEANED, color: T.amber  },
    { status: BED_STATUS.RESERVED,    color: T.purple },
    { status: BED_STATUS.MAINTENANCE, color: T.gray   },
  ];

  return (
    <PageWrapper>
      <PageInner>

        {/* ── Top Bar ── */}
        <TopBar>
          <PageTitle>Room Enquiry</PageTitle>
          <TopActions>
            <Legend>
              {LEGEND_ITEMS.map(({ status, color }) => (
                <LegendItem key={status}>
                  <LegendDot color={color} />
                  {STATUS_CFG[status].label}
                </LegendItem>
              ))}
            </Legend>
            <RefreshBtn onClick={fetchEnquiryData}>🔄 Refresh</RefreshBtn>
          </TopActions>
        </TopBar>

        {/* ── Stats ── */}
        {!loading && data.length > 0 && (
          <StatsRow>
            {STAT_ITEMS.map((s, i) => (
              <StatCard key={s.label} i={i} accent={s.accent}>
                <StatIcon bg={s.bg}>{s.icon}</StatIcon>
                <StatInfo>
                  <StatValue color={s.color}>{s.value}</StatValue>
                  <StatLabel>{s.label}</StatLabel>
                </StatInfo>
              </StatCard>
            ))}
          </StatsRow>
        )}

        {/* ── Skeleton ── */}
        {loading && <><SkeletonBlock /><SkeletonBlock /><SkeletonBlock /></>}

        {/* ── Empty ── */}
        {!loading && data.length === 0 && (
          <EmptyState>
            <div className="icon">🏨</div>
            <p>No rooms configured or active.</p>
          </EmptyState>
        )}

        {/* ── Block Cards ── */}
        {!loading && data.map((blockData, index) => {
          const bs = blockStats(blockData);
          return (
            <BlockCard key={index} index={index}>

              <BlockHeader>
                <BlockName>🏢 {blockData.block.block_name}</BlockName>
                <BlockMiniStats>
                  {bs.available   > 0 && <MiniBadge bg={T.greenLt}  color={T.green}>{bs.available} Avail</MiniBadge>}
                  {bs.occupied    > 0 && <MiniBadge bg={T.redLt}    color={T.red}>{bs.occupied} Occ</MiniBadge>}
                  {bs.notCleaned  > 0 && <MiniBadge bg={T.amberLt}  color={T.amber}>{bs.notCleaned} Unclean</MiniBadge>}
                  {bs.reserved    > 0 && <MiniBadge bg={T.purpleLt} color={T.purple}>{bs.reserved} Res</MiniBadge>}
                  {bs.maintenance > 0 && <MiniBadge bg={T.grayLt}   color={T.gray}>{bs.maintenance} Maint</MiniBadge>}
                </BlockMiniStats>
              </BlockHeader>

              <BlockBody>
                {Object.keys(blockData.floors).length === 0 ? (
                  <NoBeds>No rooms in this block.</NoBeds>
                ) : (
                  Object.entries(blockData.floors)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([floor, rooms]) => (
                      <FloorSection key={floor}>
                        <FloorLabel>Floor {floor}</FloorLabel>
                        <RoomGrid>
                          {rooms.map((room) => {
                            const rs = getRoomStatus(room.beds);
                            return (
                              <RoomCard key={room.room_number} rs={rs}>
                                <RoomTop rs={rs}>
                                  <RoomNumber>{room.room_number}</RoomNumber>
                                  <RoomStatusPill rs={rs}>{ROOM_CFG[rs]?.label || rs}</RoomStatusPill>
                                </RoomTop>
                                {room.room_type && (
                                  <RoomTypeTag>{room.room_type}</RoomTypeTag>
                                )}
                                <BedGrid>
                                  {!room.beds || room.beds.length === 0 ? (
                                    <NoBeds>No Beds</NoBeds>
                                  ) : (
                                    room.beds.map((bed, i) => {
                                      const cfg = STATUS_CFG[bed.status] || STATUS_CFG[BED_STATUS.MAINTENANCE];
                                      return (
                                        <BedCard
                                          key={i}
                                          status={bed.status}
                                          title={bedTooltip(bed)}
                                          onClick={() =>
                                            bed.status !== BED_STATUS.MAINTENANCE &&
                                            setSelectedBed({ bed, room })
                                          }
                                        >
                                          <BedIconSVG color={cfg.color} small />
                                          <BedLabel status={bed.status}>{bed.bed_number}</BedLabel>
                                          <BedStatusMini status={bed.status}>{cfg.label}</BedStatusMini>
                                        </BedCard>
                                      );
                                    })
                                  )}
                                </BedGrid>
                              </RoomCard>
                            );
                          })}
                        </RoomGrid>
                      </FloorSection>
                    ))
                )}
              </BlockBody>
            </BlockCard>
          );
        })}

      </PageInner>

      {/* ── Bed Detail Modal ── */}
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