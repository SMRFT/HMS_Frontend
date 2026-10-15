import React from "react";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const popIn = keyframes`from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); }`;
const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.45; }`;

const T = {
  primary: "#0d9488",
  primaryDark: "#0f766e",
  red: "#dc2626",
  redLight: "#fee2e2",
  redDark: "#991b1b",
  border: "#e2e8f0",
  textMain: "#1e293b",
  textMuted: "#64748b",
  bgSubtle: "#f8fafc",
  white: "#ffffff",
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: ${fadeIn} 0.15s ease;
`;

const ModalBox = styled.div`
  background: ${T.white};
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
  animation: ${popIn} 0.18s cubic-bezier(0.16, 1, 0.3, 1);
`;

const ModalHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: #fef2f2;
  border-bottom: 1.5px solid #fecaca;
  border-radius: 12px 12px 0 0;
`;

const ModalTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 800;
  color: ${T.textMain};
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const CloseBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #fca5a5;
  background: #ffffff;
  cursor: pointer;
  font-size: 1.1rem;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  &:hover {
    background: #fee2e2;
    color: #dc2626;
  }
`;

const ModalBody = styled.div`
  padding: 18px;
`;

const OccupantHighlight = styled.div`
  background: #fff5f5;
  border: 1.5px solid #fecaca;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 14px;
`;

const OccupantHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #fca5a5;
`;

const OccupantAvatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: ${T.red};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.35);
`;

const OccupantName = styled.div`
  font-size: 1rem;
  font-weight: 800;
  color: ${T.redDark};
  line-height: 1.2;
`;

const OccupantTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: ${T.red};
  font-weight: 700;
  margin-top: 3px;
`;

const PulsingDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${T.red};
  animation: ${pulse} 1.2s ease-in-out infinite;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 14px;
  font-size: 0.8rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DKey = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const DVal = styled.span`
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e293b;
  word-break: break-word;
`;

const InfoSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  padding: 12px 14px;
  margin-bottom: 14px;
`;

const InfoTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const NoticeBox = styled.div`
  background: #fefce8;
  border: 1px solid #fef08a;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.74rem;
  color: #854d0e;
  line-height: 1.45;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
`;

const ModalFoot = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 6px;
`;

const FootBtn = styled.button`
  height: 34px;
  padding: 0 18px;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
  }
`;

const formatAdmissionDateTime = (dtStr) => {
  if (!dtStr) return "—";
  try {
    const dt = new Date(dtStr);
    if (!isNaN(dt.getTime())) {
      return dt.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  } catch (e) {}
  return String(dtStr).replace("T", " ").slice(0, 16);
};

const OccupiedBedDetailModal = ({ bed, room, onClose }) => {
  if (!bed) return null;

  const p = bed.patient || {};
  const patientName = p.patientname || p.name || "Admitted Patient";
  const avatarChar = patientName.trim().charAt(0).toUpperCase() || "P";
  const isOccupied = (bed.status || "").toLowerCase() === "occupied";
  const statusLabel = bed.status || "Occupied";

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHead>
          <ModalTitle>
            <span>🛏️ Bed {bed.bed_number}</span>
            <span style={{ color: "#64748b", fontWeight: 600 }}>
              · Room {room?.room_number || "—"}
            </span>
            <span
              style={{
                fontSize: "0.68rem",
                padding: "2px 8px",
                borderRadius: 10,
                background: isOccupied ? "#dc2626" : "#d97706",
                color: "#ffffff",
                fontWeight: 800,
                letterSpacing: "0.03em",
              }}
            >
              {statusLabel}
            </span>
          </ModalTitle>
          <CloseBtn onClick={onClose} title="Close">×</CloseBtn>
        </ModalHead>

        <ModalBody>
          {/* Patient Details (When occupied by whom) */}
          <OccupantHighlight>
            <OccupantHeader>
              <OccupantAvatar>{avatarChar}</OccupantAvatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <OccupantName>{patientName}</OccupantName>
                <OccupantTag>
                  <PulsingDot />
                  {isOccupied ? "Currently Admitted Patient" : "Previous Patient Occupant"}
                </OccupantTag>
              </div>
            </OccupantHeader>

            <DetailGrid>
              <DetailItem>
                <DKey>UHID</DKey>
                <DVal style={{ fontFamily: "monospace" }}>{p.uhid || "—"}</DVal>
              </DetailItem>
              <DetailItem>
                <DKey>IP Number</DKey>
                <DVal style={{ color: T.redDark, fontFamily: "monospace" }}>
                  {bed.ip_number || p.ip_number || "—"}
                </DVal>
              </DetailItem>
              <DetailItem>
                <DKey>Age / Gender</DKey>
                <DVal>
                  {p.age ? `${p.age} ${p.age_type || "Y"}` : "—"}
                  {p.gender ? ` / ${p.gender}` : ""}
                </DVal>
              </DetailItem>
              <DetailItem>
                <DKey>Contact Phone</DKey>
                <DVal>{p.mobilePhone || "—"}</DVal>
              </DetailItem>
              <DetailItem style={{ gridColumn: "1 / -1" }}>
                <DKey>Admitting Doctor</DKey>
                <DVal style={{ color: "#0d9488" }}>{p.admittingDoctor || "—"}</DVal>
              </DetailItem>
              <DetailItem style={{ gridColumn: "1 / -1" }}>
                <DKey>Date &amp; Time of Admission</DKey>
                <DVal style={{ color: "#0f766e" }}>
                  {formatAdmissionDateTime(p.admissionDateTime)}
                </DVal>
              </DetailItem>
              {p.is_high_risk && (
                <DetailItem style={{ gridColumn: "1 / -1" }}>
                  <DKey>High Risk Reason</DKey>
                  <DVal style={{ color: "#dc2626" }}>
                    ⚠️ {p.high_risk_reason || "Marked as High Risk Patient"}
                  </DVal>
                </DetailItem>
              )}
            </DetailGrid>
          </OccupantHighlight>

          {/* Room Location Details */}
          {room && (
            <InfoSection>
              <InfoTitle>🏨 Room Information</InfoTitle>
              <DetailGrid>
                <DetailItem>
                  <DKey>Room No</DKey>
                  <DVal>Room {room.room_number}</DVal>
                </DetailItem>
                <DetailItem>
                  <DKey>Bed No</DKey>
                  <DVal>Bed {bed.bed_number}</DVal>
                </DetailItem>
                <DetailItem>
                  <DKey>Category / Type</DKey>
                  <DVal>{room.room_type || room.room_category || "General"}</DVal>
                </DetailItem>
                <DetailItem>
                  <DKey>Block &amp; Floor</DKey>
                  <DVal>
                    {room.block ? `Block ${room.block}` : "Main"} · Floor {room.floor ?? "—"}
                  </DVal>
                </DetailItem>
                {room.nursing_station && (
                  <DetailItem style={{ gridColumn: "1 / -1" }}>
                    <DKey>Nursing Station</DKey>
                    <DVal>{room.nursing_station}</DVal>
                  </DetailItem>
                )}
              </DetailGrid>
            </InfoSection>
          )}

          {/* Non-assignable warning */}
          <NoticeBox>
            <span style={{ fontSize: "1rem" }}>⚠️</span>
            <div>
              <strong>Bed is not selectable:</strong> This bed is currently occupied by <strong>{patientName}</strong> since{" "}
              {formatAdmissionDateTime(p.admissionDateTime)}. Please choose an <strong>Available (Ready)</strong> bed to proceed.
            </div>
          </NoticeBox>

          <ModalFoot>
            <FootBtn type="button" onClick={onClose}>
              Back to Room Search
            </FootBtn>
          </ModalFoot>
        </ModalBody>
      </ModalBox>
    </Overlay>
  );
};

export default OccupiedBedDetailModal;
