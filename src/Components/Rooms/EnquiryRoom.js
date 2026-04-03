import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import { PageWrapper, colors } from "../GlobalStyles";

/* ─── Animations ─────────────────────────────────────────── */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;
const fadeInScale = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
`;

/* ─── Layout ─────────────────────────────────────────────── */
const PageInner = styled.div`
  padding: 16px;
  background: ${colors.background};
  min-height: 100vh;
`;
const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;
const PageTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
  &::before {
    content: "";
    display: inline-block;
    width: 4px; height: 20px;
    background: ${colors.primary};
    border-radius: 2px;
  }
`;
const RefreshBtn = styled.button`
  padding: 6px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  background: white;
  cursor: pointer;
  color: ${colors.primary};
  transition: all 0.15s;
  &:hover { background: ${colors.tabBg}; }
`;

/* ─── Legend ─────────────────────────────────────────────── */
const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 6px 14px;
  flex-wrap: wrap;
`;
const LegendDot = styled.span`
  display: inline-block;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: ${(p) => p.color};
  flex-shrink: 0;
`;
const LegendLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${colors.textMuted};
  margin-right: 10px;
`;

/* ─── Stats ───────────────────────────────────────────────── */
const StatsRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;
const StatCard = styled.div`
  flex: 1 1 100px;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
`;
const StatValue = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${(p) => p.color || colors.textMain};
  line-height: 1;
`;
const StatLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 500;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

/* ─── Block ──────────────────────────────────────────────── */
const BlockCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  animation: ${slideUp} 0.35s ease both;
  animation-delay: ${(p) => p.index * 60}ms;
`;
const BlockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: ${colors.tabBg};
  border-bottom: 1px solid ${colors.border};
`;
const BlockName = styled.h3`
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
  .icon { font-size: 1rem; }
`;
const BlockMeta = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;
const Badge = styled.span`
  font-size: 0.7rem; font-weight: 600;
  padding: 2px 8px; border-radius: 20px;
  background: ${(p) => p.bg || colors.border};
  color: ${(p) => p.color || colors.textMain};
`;
const BlockBody = styled.div`
  padding: 14px 16px;
`;

/* ─── Floor ──────────────────────────────────────────────── */
const FloorSection = styled.div`
  margin-bottom: 18px;
  &:last-child { margin-bottom: 0; }
`;
const FloorLabel = styled.div`
  display: flex; align-items: center; gap: 8px;
  font-size: 0.78rem; font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase; letter-spacing: 0.06em;
  margin-bottom: 10px;
  &::after { content: ""; flex: 1; height: 1px; background: ${colors.border}; }
`;

/* ─── Room Grid ──────────────────────────────────────────── */
const RoomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  @media (max-width: 480px) { grid-template-columns: 1fr 1fr; gap: 8px; }
`;

/* ─── Status colour maps ─────────────────────────────────── */
const ROOM_STATUS_COLORS = {
  available:     { border: "#86efac", header: "#dcfce7", dot: "#22c55e" },
  occupied:      { border: "#fca5a5", header: "#fee2e2", dot: "#ef4444" },
  "not-cleaned": { border: "#fde047", header: "#fef9c3", dot: "#eab308" },
  maintenance:   { border: "#d1d5db", header: "#f3f4f6", dot: "#9ca3af" },
  partial:       { border: "#93c5fd", header: "#dbeafe", dot: "#3b82f6" },
  reserved:      { border: "#c084fc", header: "#faf5ff", dot: "#9333ea" },
};

const BED_COLORS = {
  "Available":               "#22c55e",
  "Occupied":                "#ef4444",
  "Available (Not Cleaned)": "#eab308",
  "Maintenance":             "#9ca3af",
  "Reserved":                "#9333ea",
};

function getRoomOverallStatus(beds) {
  if (!beds?.length) return "available";
  const s = beds.map((b) => b.status);
  if (s.every((x) => x === "Maintenance"))             return "maintenance";
  if (s.every((x) => x === "Occupied"))                return "occupied";
  if (s.every((x) => x === "Reserved"))                return "reserved";
  if (s.every((x) => x === "Available (Not Cleaned)")) return "not-cleaned";
  if (s.some((x) => x === "Occupied") && s.some((x) => x !== "Occupied")) return "partial";
  if (s.some((x) => x === "Reserved") && !s.some((x) => x === "Occupied")) return "reserved";
  if (s.some((x) => x === "Available (Not Cleaned)") && !s.some((x) => x === "Occupied")) return "not-cleaned";
  return "available";
}

/* ─── Room Card ──────────────────────────────────────────── */
const RoomCard = styled.div`
  border: 1.5px solid ${(p) => ROOM_STATUS_COLORS[p.roomstatus]?.border || "#e5e7eb"};
  border-radius: 8px;
  overflow: visible;
  background: ${colors.surface};
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
  &:hover {
    box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    transform: translateY(-2px);
  }
`;
const RoomTop = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 10px;
  background: ${(p) => ROOM_STATUS_COLORS[p.roomstatus]?.header || "#f1f5f9"};
  border-bottom: 1px solid ${(p) => ROOM_STATUS_COLORS[p.roomstatus]?.border || "#e5e7eb"};
  border-radius: 6px 6px 0 0;
`;
const RoomNumber = styled.span`
  font-weight: 700; font-size: 0.82rem; color: ${colors.textMain};
`;
const RoomStatusPill = styled.span`
  font-size: 0.63rem; font-weight: 700;
  padding: 1px 7px; border-radius: 10px;
  background: ${(p) => ROOM_STATUS_COLORS[p.roomstatus]?.dot || "#9ca3af"};
  color: #fff; text-transform: capitalize; white-space: nowrap;
`;
const BedGrid = styled.div`
  display: flex; flex-wrap: wrap; gap: 5px; padding: 8px 10px;
`;
const BedChip = styled.div`
  flex: 1 1 auto; min-width: 44px;
  text-align: center; padding: 5px 4px;
  border-radius: 5px; font-size: 0.72rem; font-weight: 700;
  color: #fff; cursor: pointer;
  transition: filter 0.15s, transform 0.15s, box-shadow 0.15s;
  background: ${(p) => BED_COLORS[p.status] || "#9ca3af"};
  opacity: ${(p) => (p.status === "Maintenance" ? 0.6 : 1)};
  pointer-events: ${(p) => (p.status === "Maintenance" ? "none" : "auto")};
  &:hover {
    filter: brightness(1.1);
    transform: scale(1.06);
    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  }
`;

/* ─── Modal primitives ───────────────────────────────────── */
const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 10000;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
`;
const Modal = styled.div`
  background: #fff;
  border-radius: 12px;
  width: 100%; max-width: ${(p) => p.width || "480px"};
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: ${fadeInScale} 0.2s ease;
  scrollbar-width: thin;
`;
const ModalHead = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #e5e7eb;
  background: ${(p) => p.bg || "#f8fafc"};
  border-radius: 12px 12px 0 0;
  position: sticky; top: 0; z-index: 1;
`;
const ModalTitle = styled.div`
  font-size: 0.92rem; font-weight: 700; color: #111827;
  display: flex; align-items: center; gap: 8px;
  flex: 1; min-width: 0;
`;
const CloseBtn = styled.button`
  width: 30px; height: 30px;
  border-radius: 50%;
  border: 1.5px solid #cbd5e1;
  background: #f1f5f9;
  cursor: pointer;
  font-size: 1.1rem;
  color: #374151;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  &:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }
`;
const ModalBody = styled.div`padding: 18px;`;

/* ─── Detail section ─────────────────────────────────────── */
const DetailSection = styled.div`
  background: #f8fafc; border: 1px solid #e5e7eb;
  border-radius: 8px; padding: 12px 14px; margin-bottom: 14px;
`;
const DetailSectionTitle = styled.div`
  font-size: 0.72rem; font-weight: 700; color: ${colors.primary};
  text-transform: uppercase; letter-spacing: 0.05em;
  margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
`;
const DetailRow = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 10px; padding: 4px 0;
  border-bottom: 1px solid #f1f5f9;
  &:last-child { border-bottom: none; }
`;
const DetailKey = styled.span`
  font-size: 0.75rem; color: #6b7280; flex-shrink: 0; font-weight: 500;
`;
const DetailVal = styled.span`
  font-size: 0.75rem; color: #111827; font-weight: 600;
  text-align: right; word-break: break-word;
`;
const StatusBadgeInModal = styled.div`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 20px;
  font-size: 0.75rem; font-weight: 700;
  background: ${(p) => (BED_COLORS[p.status] || "#9ca3af") + "22"};
  color: ${(p) => BED_COLORS[p.status] || "#9ca3af"};
  border: 1.5px solid ${(p) => BED_COLORS[p.status] || "#9ca3af"};
  margin-bottom: 14px;
`;
const StatusDot = styled.span`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${(p) => BED_COLORS[p.status] || "#9ca3af"};
  display: inline-block; flex-shrink: 0;
`;

/* ─── Cleaned toggle ─────────────────────────────────────── */
const CleanedToggleRow = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 10px 14px;
  background: ${(p) => (p.cleaned ? "#f0fdf4" : p.isdisabled ? "#f9fafb" : "#fffbeb")};
  border: 1.5px solid ${(p) => (p.cleaned ? "#86efac" : p.isdisabled ? "#e5e7eb" : "#fde047")};
  border-radius: 8px; margin-bottom: 14px;
`;
const CleanedToggleLabel = styled.div`
  font-size: 0.78rem; font-weight: 600;
  color: ${(p) => (p.cleaned ? "#166534" : p.isdisabled ? "#9ca3af" : "#92400e")};
  display: flex; align-items: center; gap: 6px;
`;
const CleanedCheckbox = styled.input`
  width: 18px; height: 18px;
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  accent-color: #22c55e;
  flex-shrink: 0;
`;

/* ─── Buttons ────────────────────────────────────────────── */
const ActionRow = styled.div`
  display: flex; gap: 8px; justify-content: flex-end;
  padding-top: 10px; border-top: 1px solid #e5e7eb; margin-top: 4px;
`;
const Btn = styled.button`
  height: 34px; padding: 0 18px;
  font-size: 0.78rem; font-weight: 600;
  border-radius: 6px; border: none; cursor: pointer;
  background: ${(p) =>
    p.danger    ? "#fee2e2"
  : p.success   ? "#22c55e"
  : p.secondary ? "#e5e7eb"
  : p.purple    ? "#9333ea"
  :                colors.primary};
  color: ${(p) =>
    p.danger    ? "#dc2626"
  : p.success   ? "#fff"
  : p.secondary ? "#374151"
  : p.purple    ? "#fff"
  :                "#fff"};
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
  pointer-events: ${(p) => (p.disabled ? "none" : "auto")};
  transition: opacity 0.15s, filter 0.15s;
  &:hover { filter: brightness(0.93); }
`;

/* ─── Confirm / IP input ─────────────────────────────────── */
const ConfirmText = styled.p`
  font-size: 0.88rem; color: #374151; margin: 0 0 6px; line-height: 1.55;
`;
const ConfirmSub = styled.p`
  font-size: 0.78rem; color: #6b7280; margin: 0 0 16px;
`;
const IPInput = styled.input`
  width: 100%; height: 36px; padding: 0 10px;
  font-size: 0.82rem; border: 1.5px solid #d1d5db;
  border-radius: 6px; background: #fff; color: #111827;
  margin-bottom: 14px; box-sizing: border-box; outline: none;
  &:focus { border-color: ${colors.primary}; box-shadow: 0 0 0 2px #ccfbf1; }
`;

/* ─── Skeleton / Empty ───────────────────────────────────── */
const SkeletonBlock = styled.div`
  height: 120px; border-radius: 10px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: ${pulse} 1.5s ease-in-out infinite;
  margin-bottom: 16px;
`;
const EmptyState = styled.div`
  text-align: center; padding: 60px 20px; color: ${colors.textMuted};
  .icon { font-size: 2.5rem; margin-bottom: 12px; opacity: 0.4; }
  p { font-size: 0.9rem; margin: 0; }
`;
const NoBeds = styled.span`
  font-size: 0.75rem; color: ${colors.textMuted}; padding: 4px 0;
`;

/* ─── Helpers ────────────────────────────────────────────── */
function statusLabel(s) {
  const map = {
    "Available":               "Available",
    "Occupied":                "Occupied",
    "Available (Not Cleaned)": "Not Cleaned",
    "Maintenance":             "Maintenance",
    "Reserved":                "Reserved",
  };
  return map[s] || s;
}

function calcStats(data) {
  let total = 0, available = 0, occupied = 0, maintenance = 0, notCleaned = 0, reserved = 0;
  data.forEach((b) =>
    Object.values(b.floors).forEach((rooms) =>
      rooms.forEach((room) =>
        (room.beds || []).forEach((bed) => {
          total++;
          if      (bed.status === "Available")               available++;
          else if (bed.status === "Occupied")                occupied++;
          else if (bed.status === "Available (Not Cleaned)") notCleaned++;
          else if (bed.status === "Reserved")                reserved++;
          else                                               maintenance++;
        })
      )
    )
  );
  return { total, available, occupied, maintenance, notCleaned, reserved };
}

/* ════════════════════════════════════════════════════════════
   BED DETAIL MODAL
   ════════════════════════════════════════════════════════════ */
const BedDetailModal = ({ bed, room, onClose, onCleanedChange, onBook }) => {
  const [cleaning,    setCleaning]    = useState(false);
  const [isCleaned,   setIsCleaned]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bookIp,      setBookIp]      = useState("");
  const [booking,     setBooking]     = useState(false);

  const isOccupied   = bed.status === "Occupied";
  const isNotCleaned = bed.status === "Available (Not Cleaned)";
  const isAvailable  = bed.status === "Available";
  const isReserved   = bed.status === "Reserved";

  // Only enable checkbox when bed is actively occupied AND not yet cleaned
  const canMarkCleaned   = bed.is_roomActive === false && bed.is_roomCleaned === false && !isCleaned;
  const checkboxDisabled = !canMarkCleaned || cleaning;
  const showCleaned      = isOccupied || isNotCleaned;
  const isMarkedCleaned  = bed.is_roomCleaned === true || isCleaned;

  const handleClean = async () => {
    if (checkboxDisabled) return;
    setCleaning(true);
    try {
      await onCleanedChange({
        room_no:        room.room_number,
        bed_no:         bed.bed_number,
        is_roomCleaned: true,
        ip_number:      bed.ip_number   || "",
        shifting_id:    bed.shifting_id || "",
      });
      setIsCleaned(true);
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
      setShowConfirm(false);
      onClose();
    } catch {
      // error toast handled inside onBook
    } finally {
      setBooking(false);
    }
  };

  const headerBg = ROOM_STATUS_COLORS[getRoomOverallStatus([bed])]?.header || "#f8fafc";

  return (
    <Overlay onClick={onClose}>
      <Modal width="480px" onClick={(e) => e.stopPropagation()}>

        <ModalHead bg={headerBg}>
          <ModalTitle>🛏️ Bed {bed.bed_number} — Room {room.room_number}</ModalTitle>
          <CloseBtn onClick={onClose} title="Close">×</CloseBtn>
        </ModalHead>

        <ModalBody>

          {/* Status pill */}
          <StatusBadgeInModal status={bed.status}>
            <StatusDot status={bed.status} />
            {statusLabel(bed.status)}
          </StatusBadgeInModal>

          {/* Room info */}
          <DetailSection>
            <DetailSectionTitle>🏨 Room Details</DetailSectionTitle>
            <DetailRow><DetailKey>Room No.</DetailKey><DetailVal>{room.room_number}</DetailVal></DetailRow>
            <DetailRow><DetailKey>Room Type</DetailKey><DetailVal>{room.room_type || "—"}</DetailVal></DetailRow>
            <DetailRow><DetailKey>Block</DetailKey><DetailVal>{room.block || "—"}</DetailVal></DetailRow>
            <DetailRow><DetailKey>Bed No.</DetailKey><DetailVal>{bed.bed_number}</DetailVal></DetailRow>
          </DetailSection>

          {/* Patient info */}
          {(isOccupied || isNotCleaned) && bed.patient?.patientname && (
            <DetailSection>
              <DetailSectionTitle>👤 Patient Details</DetailSectionTitle>
              <DetailRow><DetailKey>Name</DetailKey><DetailVal>{bed.patient.patientname}</DetailVal></DetailRow>
              {bed.patient.uhid        && <DetailRow><DetailKey>UHID</DetailKey><DetailVal>{bed.patient.uhid}</DetailVal></DetailRow>}
              {bed.ip_number           && <DetailRow><DetailKey>IP Number</DetailKey><DetailVal>{bed.ip_number}</DetailVal></DetailRow>}
              {bed.patient.age         && <DetailRow><DetailKey>Age / Gender</DetailKey><DetailVal>{bed.patient.age}{bed.patient.gender ? ` / ${bed.patient.gender}` : ""}</DetailVal></DetailRow>}
              {bed.patient.mobilePhone && <DetailRow><DetailKey>Mobile</DetailKey><DetailVal>{bed.patient.mobilePhone}</DetailVal></DetailRow>}
            </DetailSection>
          )}

          {/* Reservation info */}
          {isReserved && bed.booking && (
            <DetailSection>
              <DetailSectionTitle>📋 Reservation Details</DetailSectionTitle>
              {bed.booking.ip_number && <DetailRow><DetailKey>IP Number</DetailKey><DetailVal>{bed.booking.ip_number}</DetailVal></DetailRow>}
              {bed.booking.uhid      && <DetailRow><DetailKey>UHID</DetailKey><DetailVal>{bed.booking.uhid}</DetailVal></DetailRow>}
              {bed.booking.booked_at && (
                <DetailRow>
                  <DetailKey>Booked At</DetailKey>
                  <DetailVal>{new Date(bed.booking.booked_at).toLocaleString("en-IN")}</DetailVal>
                </DetailRow>
              )}
            </DetailSection>
          )}

          {/* Cleaned toggle */}
          {showCleaned && (
            <CleanedToggleRow cleaned={isMarkedCleaned} isdisabled={checkboxDisabled ? 1 : 0}>
              <CleanedToggleLabel cleaned={isMarkedCleaned} isdisabled={checkboxDisabled ? 1 : 0}>
                {isMarkedCleaned
                  ? "✅ Room marked as Cleaned"
                  : checkboxDisabled
                    ? "🔒 Cannot mark — bed not active or already cleaned"
                    : "🧹 Mark Room as Cleaned"}
              </CleanedToggleLabel>
              <CleanedCheckbox
                type="checkbox"
                checked={isMarkedCleaned}
                disabled={checkboxDisabled}
                onChange={handleClean}
              />
            </CleanedToggleRow>
          )}

          {/* Actions — Book only for Available */}
          <ActionRow>
            <Btn secondary onClick={onClose}>Close</Btn>
            {isAvailable && (
              <Btn success onClick={() => setShowConfirm(true)}>📋 Book / Reserve</Btn>
            )}
          </ActionRow>

        </ModalBody>
      </Modal>

      {/* Confirm sub-modal */}
      {showConfirm && (
        <Overlay onClick={() => setShowConfirm(false)}>
          <Modal width="380px" onClick={(e) => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle>📋 Reserve Room</ModalTitle>
              <CloseBtn onClick={() => setShowConfirm(false)} title="Close">×</CloseBtn>
            </ModalHead>
            <ModalBody>
              <ConfirmText>
                Are you sure you want to reserve{" "}
                <strong>Room {room.room_number} / Bed {bed.bed_number}</strong>?
              </ConfirmText>
              <ConfirmSub>Enter the IP Number of the patient to link this reservation.</ConfirmSub>
              <IPInput
                placeholder="Enter IP Number"
                value={bookIp}
                onChange={(e) => setBookIp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBook()}
                autoFocus
              />
              <ActionRow>
                <Btn secondary onClick={() => setShowConfirm(false)}>Cancel</Btn>
                <Btn onClick={handleBook} disabled={booking || !bookIp.trim()}>
                  {booking ? "Reserving…" : "Yes, Reserve"}
                </Btn>
              </ActionRow>
            </ModalBody>
          </Modal>
        </Overlay>
      )}
    </Overlay>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
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
          grouped[blockName].floors[floor].push({
            ...room,
            id: `${room.room_number}_${floor}`,
          });
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

  const blockBedStats = (blockData) => {
    let available = 0, occupied = 0, notCleaned = 0, maintenance = 0, reserved = 0;
    Object.values(blockData.floors).forEach((rooms) =>
      rooms.forEach((room) =>
        (room.beds || []).forEach((bed) => {
          if      (bed.status === "Available")               available++;
          else if (bed.status === "Occupied")                occupied++;
          else if (bed.status === "Available (Not Cleaned)") notCleaned++;
          else if (bed.status === "Reserved")                reserved++;
          else                                               maintenance++;
        })
      )
    );
    return { available, occupied, notCleaned, maintenance, reserved };
  };

  const roomStatusDisplayLabel = (rs) => ({
    available:     "Available",
    occupied:      "Occupied",
    "not-cleaned": "Not Cleaned",
    maintenance:   "Maintenance",
    partial:       "Partial",
    reserved:      "Reserved",
  }[rs] || rs);

  return (
    <PageWrapper>
      <PageInner>

        {/* Top Bar */}
        <TopBar>
          <PageTitle>Room Enquiry</PageTitle>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Legend>
              <LegendDot color="#22c55e" /><LegendLabel>Available</LegendLabel>
              <LegendDot color="#ef4444" /><LegendLabel>Occupied</LegendLabel>
              <LegendDot color="#eab308" /><LegendLabel>Not Cleaned</LegendLabel>
              <LegendDot color="#9333ea" /><LegendLabel>Reserved</LegendLabel>
              <LegendDot color="#9ca3af" /><LegendLabel>Maintenance</LegendLabel>
            </Legend>
            <RefreshBtn onClick={fetchEnquiryData}>🔄 Refresh</RefreshBtn>
          </div>
        </TopBar>

        {/* Stats */}
        {!loading && data.length > 0 && (
          <StatsRow>
            <StatCard><StatValue>{stats.total}</StatValue><StatLabel>Total Beds</StatLabel></StatCard>
            <StatCard><StatValue color="#22c55e">{stats.available}</StatValue><StatLabel>Available</StatLabel></StatCard>
            <StatCard><StatValue color="#ef4444">{stats.occupied}</StatValue><StatLabel>Occupied</StatLabel></StatCard>
            <StatCard><StatValue color="#eab308">{stats.notCleaned}</StatValue><StatLabel>Not Cleaned</StatLabel></StatCard>
            <StatCard><StatValue color="#9333ea">{stats.reserved}</StatValue><StatLabel>Reserved</StatLabel></StatCard>
            <StatCard><StatValue color="#9ca3af">{stats.maintenance}</StatValue><StatLabel>Maintenance</StatLabel></StatCard>
          </StatsRow>
        )}

        {/* Skeletons */}
        {loading && <><SkeletonBlock /><SkeletonBlock /><SkeletonBlock /></>}

        {/* Empty */}
        {!loading && data.length === 0 && (
          <EmptyState>
            <div className="icon">🏨</div>
            <p>No rooms configured or active.</p>
          </EmptyState>
        )}

        {/* Block Cards — always expanded, no toggle */}
        {!loading && data.map((blockData, index) => {
          const bs = blockBedStats(blockData);
          return (
            <BlockCard key={index} index={index}>

              {/* Header — no chevron, no click handler */}
              <BlockHeader>
                <BlockName>
                  <span className="icon">🏢</span>
                  {blockData.block.block_name}
                </BlockName>
              </BlockHeader>

              {/* Body — always visible */}
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
                            const rs = getRoomOverallStatus(room.beds);
                            return (
                              <RoomCard key={room.room_number} roomstatus={rs}>
                                <RoomTop roomstatus={rs}>
                                  <RoomNumber>{room.room_number}</RoomNumber>
                                  <RoomStatusPill roomstatus={rs}>
                                    {roomStatusDisplayLabel(rs)}
                                  </RoomStatusPill>
                                </RoomTop>
                                <BedGrid>
                                  {!room.beds || room.beds.length === 0 ? (
                                    <NoBeds>No Beds</NoBeds>
                                  ) : (
                                    room.beds.map((bed, i) => (
                                      <BedChip
                                        key={i}
                                        status={bed.status}
                                        title={`Bed ${bed.bed_number} — ${statusLabel(bed.status)}`}
                                        onClick={() => setSelectedBed({ bed, room })}
                                      >
                                        {bed.bed_number}
                                      </BedChip>
                                    ))
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

      {/* Bed Detail Modal */}
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