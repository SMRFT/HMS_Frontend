import React, { useState, useEffect, useRef, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container,
  PageWrapper,
  colors,
} from "../GlobalStyles";

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
  from { opacity: 0; transform: scale(0.92) translateY(6px); }
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
    width: 4px;
    height: 20px;
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
  width: 10px;
  height: 10px;
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

/* ─── Block Card ─────────────────────────────────────────── */
const BlockCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
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
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #b2dfdb;
  }
`;

const BlockName = styled.h3`
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;

  .icon {
    font-size: 1rem;
  }
`;

const BlockMeta = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Badge = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  background: ${(p) => p.bg || colors.border};
  color: ${(p) => p.color || colors.textMain};
`;

const Chevron = styled.span`
  font-size: 0.7rem;
  color: ${colors.textMuted};
  transition: transform 0.2s;
  transform: ${(p) => (p.open ? "rotate(180deg)" : "rotate(0deg)")};
`;

const BlockBody = styled.div`
  padding: ${(p) => (p.open ? "14px 16px" : "0")};
  max-height: ${(p) => (p.open ? "9999px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.2s;
`;

/* ─── Floor ──────────────────────────────────────────────── */
const FloorSection = styled.div`
  margin-bottom: 18px;
  &:last-child { margin-bottom: 0; }
`;

const FloorLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${colors.border};
  }
`;

/* ─── Room Grid & Cards ──────────────────────────────────── */
const RoomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
`;

const RoomCard = styled.div`
  border: 1px solid ${colors.border};
  border-radius: 8px;
  overflow: visible;
  background: ${colors.surface};
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const RoomTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  background: #f1f5f9;
  border-bottom: 1px solid ${colors.border};
`;

const RoomNumber = styled.span`
  font-weight: 700;
  font-size: 0.82rem;
  color: ${colors.textMain};
`;

const RoomTypeBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  background: ${colors.tabBg};
  color: ${colors.primary};
  white-space: nowrap;
`;

const BedGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 8px 10px;
`;

/* ─── Bed Chip with hover tooltip ────────────────────────── */
const BedWrapper = styled.div`
  position: relative;
  flex: 1 1 auto;
  min-width: 52px;
`;

const BedChip = styled.div`
  text-align: center;
  padding: 4px 6px;
  border-radius: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.02em;
  cursor: ${(p) => (p.hasPatient || p.notCleaned ? "pointer" : "default")};
  transition: filter 0.15s, transform 0.15s;
  position: relative;

  background-color: ${(p) =>
    p.status === "Available"
      ? colors.success
      : p.status === "Occupied"
        ? colors.danger
        : p.status === "Available (Not Cleaned)"
          ? "#f59e0b"
          : "#f59e0b"};

  &:hover {
    filter: brightness(1.08);
    transform: scale(1.04);
  }
`;

/* ─── Patient Tooltip ─────────────────────────────────────── */
const PatientTooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: white;
  border-radius: 8px;
  padding: 10px 12px;
  min-width: 200px;
  max-width: 260px;
  z-index: 9999;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  animation: ${fadeInScale} 0.15s ease;
  pointer-events: none;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: #1e293b;
  }
`;

const TooltipTitle = styled.div`
  font-size: 0.78rem;
  font-weight: 700;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  padding-bottom: 5px;
  color: #7dd3fc;
`;

const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.7rem;
  margin-bottom: 3px;

  span:first-child {
    color: #94a3b8;
    flex-shrink: 0;
  }
  span:last-child {
    color: #e2e8f0;
    text-align: right;
    word-break: break-word;
  }
`;

/* ─── Cleaned Checkbox inside Tooltip ────────────────────── */
const CleanedRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding-top: 7px;
  border-top: 1px solid rgba(255,255,255,0.15);
  pointer-events: all;
`;

const CleanedCheckbox = styled.input`
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: #22c55e;
`;

const CleanedLabel = styled.label`
  font-size: 0.7rem;
  color: ${(p) => (p.checked ? "#86efac" : "#fca5a5")};
  font-weight: 600;
  cursor: pointer;
  user-select: none;
`;

/* ─── Stats Row ──────────────────────────────────────────── */
const StatsRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  flex: 1 1 120px;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
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

/* ─── Empty State ────────────────────────────────────────── */
const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${colors.textMuted};

  .icon {
    font-size: 2.5rem;
    margin-bottom: 12px;
    opacity: 0.4;
  }

  p {
    font-size: 0.9rem;
    margin: 0;
  }
`;

/* ─── Loading ────────────────────────────────────────────── */
const SkeletonBlock = styled.div`
  height: 120px;
  border-radius: 10px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: ${pulse} 1.5s ease-in-out infinite;
  margin-bottom: 16px;
`;

const NoBeds = styled.span`
  font-size: 0.75rem;
  color: ${colors.textMuted};
  padding: 4px 0;
`;

/* ─── Bed Component with Hover Tooltip and Cleaned Checkbox ─ */
const BedWithTooltip = ({ bed, roomNumber, onCleanedChange }) => {
  const [visible,  setVisible]  = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const wrapperRef = useRef(null);
  const hideTimer  = useRef(null);

  const hasPatient  = bed.patient && bed.patient.patientname;
  const notCleaned  = bed.status === "Available (Not Cleaned)";
  const showTooltip = hasPatient || notCleaned;

  const show = () => {
    if (!showTooltip) return;
    clearTimeout(hideTimer.current);
    setVisible(true);
  };

  const hide = () => {
    hideTimer.current = setTimeout(() => setVisible(false), 200);
  };

  const keepOpen = () => clearTimeout(hideTimer.current);

  const handleCleanedChange = async (e) => {
    e.stopPropagation();
    const newCleaned = e.target.checked;
    setCleaning(true);
    try {
      await onCleanedChange({
        room_no:      roomNumber,
        bed_no:       bed.bed_number,
        is_roomCleaned: newCleaned,
        ip_number:    bed.ip_number   || "",
        shifting_id:  bed.shifting_id || "",
      });
    } finally {
      setCleaning(false);
    }
  };

  return (
    <BedWrapper
      ref={wrapperRef}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <BedChip
        status={bed.status}
        hasPatient={hasPatient}
        notCleaned={notCleaned}
        title={bed.status}
      >
        {bed.bed_number}
      </BedChip>

      {visible && showTooltip && (
        <PatientTooltip onMouseEnter={keepOpen} onMouseLeave={hide}>
          <TooltipTitle>
            {bed.status === "Occupied"
              ? "🛏️ Occupied Bed"
              : bed.status === "Available (Not Cleaned)"
                ? "🧹 Not Cleaned"
                : `Bed ${bed.bed_number}`}
          </TooltipTitle>

          {hasPatient && (
            <>
              <TooltipRow>
                <span>Patient</span>
                <span>{bed.patient.patientname || "—"}</span>
              </TooltipRow>
              {bed.patient.uhid && (
                <TooltipRow>
                  <span>UHID</span>
                  <span>{bed.patient.uhid}</span>
                </TooltipRow>
              )}
              {bed.ip_number && (
                <TooltipRow>
                  <span>IP No</span>
                  <span>{bed.ip_number}</span>
                </TooltipRow>
              )}
              {bed.patient.age && (
                <TooltipRow>
                  <span>Age / Gender</span>
                  <span>{bed.patient.age}{bed.patient.gender ? ` / ${bed.patient.gender}` : ""}</span>
                </TooltipRow>
              )}
              {bed.patient.mobilePhone && (
                <TooltipRow>
                  <span>Mobile</span>
                  <span>{bed.patient.mobilePhone}</span>
                </TooltipRow>
              )}
            </>
          )}

          {/* Cleaned checkbox — only for non-cleaned beds */}
          {notCleaned && (
            <CleanedRow onClick={e => e.stopPropagation()}>
              <CleanedCheckbox
                type="checkbox"
                id={`clean-${roomNumber}-${bed.bed_number}`}
                checked={false}
                disabled={cleaning}
                onChange={handleCleanedChange}
              />
              <CleanedLabel
                htmlFor={`clean-${roomNumber}-${bed.bed_number}`}
                checked={false}
              >
                {cleaning ? "Updating…" : "Mark as Cleaned"}
              </CleanedLabel>
            </CleanedRow>
          )}

          {/* For occupied beds, show current cleaned state */}
          {bed.status === "Occupied" && (
            <CleanedRow onClick={e => e.stopPropagation()}>
              <CleanedCheckbox
                type="checkbox"
                id={`clean-occ-${roomNumber}-${bed.bed_number}`}
                checked={false}
                disabled={cleaning}
                onChange={handleCleanedChange}
              />
              <CleanedLabel
                htmlFor={`clean-occ-${roomNumber}-${bed.bed_number}`}
                checked={false}
              >
                {cleaning ? "Updating…" : "Mark Cleaned (on discharge)"}
              </CleanedLabel>
            </CleanedRow>
          )}
        </PatientTooltip>
      )}
    </BedWrapper>
  );
};

/* ─── Helpers ────────────────────────────────────────────── */
function calcStats(data) {
  let total = 0, available = 0, occupied = 0, maintenance = 0, notCleaned = 0;
  data.forEach((b) =>
    Object.values(b.floors).forEach((rooms) =>
      rooms.forEach((room) =>
        (room.beds || []).forEach((bed) => {
          total++;
          if (bed.status === "Available") available++;
          else if (bed.status === "Occupied") occupied++;
          else if (bed.status === "Available (Not Cleaned)") notCleaned++;
          else maintenance++;
        })
      )
    )
  );
  return { total, available, occupied, maintenance, notCleaned };
}

/* ─── Component ──────────────────────────────────────────── */
const EnquiryRoom = () => {
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [openBlocks, setOpenBlocks] = useState({});
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
          if (!grouped[blockName]) {
            grouped[blockName] = { block: { block_name: blockName }, floors: {} };
          }
          if (!grouped[blockName].floors[floor]) grouped[blockName].floors[floor] = [];
          grouped[blockName].floors[floor].push({
            ...room,
            id: `${room.room_number}_${floor}`,
          });
        });
      });

      const result = Object.values(grouped);
      setData(result);
      const defaults = {};
      result.forEach((_, i) => { defaults[i] = true; });
      setOpenBlocks(defaults);
    } catch (error) {
      console.error("Room enquiry error:", error);
      toast.error("Failed to fetch room enquiry data");
    } finally {
      setLoading(false);
    }
  };

  // ── Handle is_roomCleaned update ─────────────────────────────────────────
  const handleCleanedChange = useCallback(async (payload) => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}update-room-cleaned/`, "PATCH", payload);
      if (res.success || res.message) {
        toast.success(`Bed ${payload.bed_no} marked as cleaned ✓`);
        // Refresh data to reflect new status
        await fetchEnquiryData();
      } else {
        toast.error(res.error || "Failed to update cleaned status");
      }
    } catch (err) {
      console.error("Cleaned update error:", err);
      toast.error("Failed to update cleaned status");
    }
  }, [HmsBaseUrl]);

  const toggleBlock = (index) =>
    setOpenBlocks((prev) => ({ ...prev, [index]: !prev[index] }));

  const stats = calcStats(data);

  const blockBedStats = (blockData) => {
    let available = 0, occupied = 0, notCleaned = 0;
    Object.values(blockData.floors).forEach((rooms) =>
      rooms.forEach((room) =>
        (room.beds || []).forEach((bed) => {
          if (bed.status === "Available") available++;
          else if (bed.status === "Occupied") occupied++;
          else if (bed.status === "Available (Not Cleaned)") notCleaned++;
        })
      )
    );
    return { available, occupied, notCleaned };
  };

  return (
    <PageWrapper>
      <PageInner>

        {/* Top Bar */}
        <TopBar>
          <PageTitle>Room Enquiry</PageTitle>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <Legend>
              <LegendDot color={colors.success} />
              <LegendLabel>Available</LegendLabel>
              <LegendDot color={colors.danger} />
              <LegendLabel>Occupied</LegendLabel>
              <LegendDot color="#f59e0b" />
              <LegendLabel>Not Cleaned / Maintenance</LegendLabel>
            </Legend>
            <RefreshBtn onClick={fetchEnquiryData}>🔄 Refresh</RefreshBtn>
          </div>
        </TopBar>

        {/* Stats */}
        {!loading && data.length > 0 && (
          <StatsRow>
            <StatCard>
              <StatValue color={colors.textMain}>{stats.total}</StatValue>
              <StatLabel>Total Beds</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue color={colors.success}>{stats.available}</StatValue>
              <StatLabel>Available</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue color={colors.danger}>{stats.occupied}</StatValue>
              <StatLabel>Occupied</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue color="#f59e0b">{stats.notCleaned}</StatValue>
              <StatLabel>Not Cleaned</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue color="#9ca3af">{stats.maintenance}</StatValue>
              <StatLabel>Maintenance</StatLabel>
            </StatCard>
          </StatsRow>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <>
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock />
          </>
        )}

        {/* Empty */}
        {!loading && data.length === 0 && (
          <EmptyState>
            <div className="icon">🏨</div>
            <p>No rooms configured or active.</p>
          </EmptyState>
        )}

        {/* Block Cards */}
        {!loading && data.map((blockData, index) => {
          const bs     = blockBedStats(blockData);
          const isOpen = !!openBlocks[index];

          return (
            <BlockCard key={index} index={index}>
              <BlockHeader onClick={() => toggleBlock(index)}>
                <BlockName>
                  <span className="icon">🏢</span>
                  Block {blockData.block.block_name}
                </BlockName>
                <BlockMeta>
                  <Badge bg="#dcfce7" color="#16a34a">{bs.available} free</Badge>
                  <Badge bg="#fee2e2" color="#dc2626">{bs.occupied} taken</Badge>
                  {bs.notCleaned > 0 && (
                    <Badge bg="#fef3c7" color="#d97706">{bs.notCleaned} not cleaned</Badge>
                  )}
                  <Chevron open={isOpen}>▼</Chevron>
                </BlockMeta>
              </BlockHeader>

              <BlockBody open={isOpen}>
                {Object.keys(blockData.floors).length === 0 ? (
                  <NoBeds>No rooms in this block.</NoBeds>
                ) : (
                  Object.entries(blockData.floors).map(([floor, rooms]) => (
                    <FloorSection key={floor}>
                      <FloorLabel>Floor {floor}</FloorLabel>
                      <RoomGrid>
                        {rooms.map((room) => (
                          <RoomCard key={room.room_number}>
                            <RoomTop>
                              <RoomNumber>{room.room_number}</RoomNumber>
                              <RoomTypeBadge>{room.room_type}</RoomTypeBadge>
                            </RoomTop>
                            <BedGrid>
                              {!room.beds || room.beds.length === 0 ? (
                                <NoBeds>No Beds</NoBeds>
                              ) : (
                                room.beds.map((bed, i) => (
                                  <BedWithTooltip
                                    key={i}
                                    bed={bed}
                                    roomNumber={room.room_number}
                                    onCleanedChange={handleCleanedChange}
                                  />
                                ))
                              )}
                            </BedGrid>
                          </RoomCard>
                        ))}
                      </RoomGrid>
                    </FloorSection>
                  ))
                )}
              </BlockBody>
            </BlockCard>
          );
        })}

      </PageInner>
    </PageWrapper>
  );
};

export default EnquiryRoom;