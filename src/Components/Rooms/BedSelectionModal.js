import React, { useState, useMemo } from "react";
import styled from "styled-components";

const BedMiniSVG = ({ color = "#64748b", size = 18 }) => (
  <svg width={size} height={Math.round(size * 0.7)} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M1 14V3C1 2.45 1.45 2 2 2C2.55 2 3 2.45 3 3V9H13V5C13 4.45 13.45 4 14 4H22C22.55 4 23 4.45 23 5V14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1 10H23" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M5 6C5 5.45 5.45 5 6 5H8C8.55 5 9 5.45 9 6C9 6.55 8.55 7 8 7H6C5.45 7 5 6.55 5 6Z" fill={color} />
    <path d="M2 14V16M22 14V16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(4px);
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const Box = styled.div`
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 780px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 44px rgba(15, 23, 42, 0.25);
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 16px;
  background: #f0fdfa;
  border-bottom: 1px solid #ccfbf1;
`;

const Title = styled.div`
  font-size: 0.96rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const CatPill = styled.span`
  font-size: 0.66rem;
  font-weight: 700;
  color: #0f766e;
  background: #ffffff;
  border: 1px solid #99f6e4;
  padding: 2px 8px;
  border-radius: 99px;
  text-transform: uppercase;
`;

const BackBtn = styled.button`
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: #f1f5f9;
  }
`;

const CloseBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #fee2e2;
    color: #dc2626;
    border-color: #fca5a5;
  }
`;

const Body = styled.div`
  padding: 14px 16px;
  overflow-y: auto;
  flex: 1;
`;

const BedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
  max-height: 54vh;
  overflow-y: auto;
  padding: 2px;
`;

const BedTile = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 76px;
  padding: 8px 6px;
  border-radius: 8px;
  border: 1.5px solid ${p => p.cfg.border};
  background: ${p => p.cfg.light};
  cursor: ${p => (p.clickable ? "pointer" : "not-allowed")};
  opacity: ${p => (p.clickable ? 1 : 0.72)};
  transition: all 0.14s ease;

  &:hover {
    ${p =>
      p.clickable &&
      `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border-color: ${p.cfg.color};
    `}
  }
`;

const getBedCfg = (bed) => {
  const bs = String(bed.status || bed.bed_status || "Available").trim().toLowerCase();
  if (bs === "available") return { key: "Available", color: "#16a34a", light: "#dcfce7", border: "#86efac", label: "Available" };
  if (bs === "occupied") return { key: "Occupied", color: "#dc2626", light: "#fee2e2", border: "#fca5a5", label: "Occupied" };
  if (bs.includes("clean")) return { key: "Not Cleaned", color: "#d97706", light: "#fef3c7", border: "#fde047", label: "Not Cleaned" };
  if (bs === "reserved" || bs === "booked") return { key: "Reserved", color: "#7c3aed", light: "#ede9fe", border: "#d8b4fe", label: "Reserved" };
  return { key: "Maintenance", color: "#64748b", light: "#f1f5f9", border: "#cbd5e1", label: "Maintenance" };
};

export const RoomSummaryCardBody = ({ room }) => {
  const beds = room.beds || [];
  const total = beds.length;
  const counts = useMemo(() => {
    let available = 0, occupied = 0, notCleaned = 0, reserved = 0, maintenance = 0;
    beds.forEach(b => {
      const k = getBedCfg(b).key;
      if (k === "Available") available++;
      else if (k === "Occupied") occupied++;
      else if (k === "Not Cleaned") notCleaned++;
      else if (k === "Reserved") reserved++;
      else maintenance++;
    });
    return { available, occupied, notCleaned, reserved, maintenance };
  }, [beds]);

  const occPct = total > 0 ? Math.round((counts.occupied / total) * 100) : 0;

  return (
    <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.7rem", color: "#64748b" }}>
        <span>Total Beds: <strong style={{ color: "#0f172a" }}>{total}</strong></span>
        <span>{occPct}% Occupied</span>
      </div>

      <div style={{ width: "100%", height: 5, borderRadius: 99, background: "#f1f5f9", overflow: "hidden", display: "flex" }}>
        {counts.occupied > 0 && <div style={{ width: `${(counts.occupied / total) * 100}%`, background: "#dc2626" }} />}
        {counts.reserved > 0 && <div style={{ width: `${(counts.reserved / total) * 100}%`, background: "#7c3aed" }} />}
        {counts.notCleaned > 0 && <div style={{ width: `${(counts.notCleaned / total) * 100}%`, background: "#d97706" }} />}
        {counts.available > 0 && <div style={{ width: `${(counts.available / total) * 100}%`, background: "#16a34a" }} />}
        {counts.maintenance > 0 && <div style={{ width: `${(counts.maintenance / total) * 100}%`, background: "#64748b" }} />}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {counts.available > 0 && (
          <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" }}>
            ✓ {counts.available} Ready
          </span>
        )}
        {counts.occupied > 0 && (
          <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" }}>
            ● {counts.occupied} Occ
          </span>
        )}
        {counts.notCleaned > 0 && (
          <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "#fef3c7", color: "#b45309", border: "1px solid #fde047" }}>
            🧹 {counts.notCleaned} Unclean
          </span>
        )}
        {counts.reserved > 0 && (
          <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "#ede9fe", color: "#6d28d9", border: "1px solid #d8b4fe" }}>
            ◆ {counts.reserved} Res
          </span>
        )}
        {counts.maintenance > 0 && (
          <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" }}>
            🔧 {counts.maintenance} Maint
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 5, borderTop: "1px dashed #e2e8f0", fontSize: "0.66rem", fontWeight: 700, color: "#0f766e", marginTop: "auto" }}>
        <span>{counts.available > 0 ? "Click to select bed" : "Click to view beds"}</span>
        <span>→</span>
      </div>
    </div>
  );
};

const BedSelectionModal = ({ room, onClose, onBack, onSelectBed, onViewOccupant }) => {
  const [bedSearch, setBedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const beds = room?.beds || [];

  const counts = useMemo(() => {
    const c = { ALL: beds.length, Available: 0, Occupied: 0, "Not Cleaned": 0, Reserved: 0, Maintenance: 0 };
    beds.forEach(b => {
      const k = getBedCfg(b).key;
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [beds]);

  const visibleBeds = useMemo(() => {
    const q = bedSearch.toLowerCase().trim();
    return beds.filter(b => {
      const cfg = getBedCfg(b);
      if (statusFilter !== "ALL" && cfg.key !== statusFilter) return false;
      if (!q) return true;
      const bNo = String(b.bed_number || "").toLowerCase();
      const pName = String(b.patient?.patientname || b.patient?.name || "").toLowerCase();
      const uhid = String(b.patient?.uhid || "").toLowerCase();
      const ipNo = String(b.ip_number || b.patient?.ip_number || "").toLowerCase();
      return bNo.includes(q) || pName.includes(q) || uhid.includes(q) || ipNo.includes(q);
    });
  }, [beds, bedSearch, statusFilter]);

  if (!room) return null;

  const filterChips = [
    { key: "ALL", label: "All", color: "#0d9488", light: "#f0fdfa", border: "#99f6e4" },
    { key: "Available", label: "Available", color: "#16a34a", light: "#dcfce7", border: "#86efac" },
    { key: "Occupied", label: "Occupied", color: "#dc2626", light: "#fee2e2", border: "#fca5a5" },
    { key: "Not Cleaned", label: "Not Cleaned", color: "#d97706", light: "#fef3c7", border: "#fde047" },
    { key: "Reserved", label: "Reserved", color: "#7c3aed", light: "#ede9fe", border: "#d8b4fe" },
    { key: "Maintenance", label: "Maintenance", color: "#64748b", light: "#f1f5f9", border: "#cbd5e1" },
  ];

  return (
    <Overlay onClick={onClose}>
      <Box onClick={e => e.stopPropagation()}>
        <Head>
          <Title>
            <span>🛏️ Select Bed — Room {room.room_number}</span>
            <CatPill>{room.room_category || room.room_type || "General"}</CatPill>
          </Title>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {onBack && <BackBtn type="button" onClick={onBack}>← Back to Rooms</BackBtn>}
            <CloseBtn type="button" onClick={onClose}>×</CloseBtn>
          </div>
        </Head>

        <Body>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
              📍 {room.nursing_station || "General Ward"} &nbsp;•&nbsp; 🏢 {room.block || "MAIN BLOCK"} &nbsp;•&nbsp; {beds.length} Beds
            </div>
            {beds.length > 6 && (
              <input
                type="text"
                placeholder="🔍 Search bed #, patient, UHID..."
                value={bedSearch}
                onChange={e => setBedSearch(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.75rem",
                  minWidth: 210,
                  outline: "none",
                }}
              />
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {filterChips
              .filter(c => c.key === "ALL" || counts[c.key] > 0)
              .map(c => {
                const active = statusFilter === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setStatusFilter(prev => (prev === c.key ? "ALL" : c.key))}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 9px",
                      borderRadius: 99,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      border: `1.5px solid ${active ? c.color : c.border}`,
                      background: active ? c.color : c.light,
                      color: active ? "#ffffff" : c.color,
                      cursor: "pointer",
                    }}
                  >
                    <span>{c.label}</span>
                    <span style={{
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      padding: "0 5px",
                      borderRadius: 99,
                      background: active ? "rgba(255,255,255,0.28)" : "#ffffff",
                      color: active ? "#ffffff" : c.color,
                    }}>
                      {counts[c.key]}
                    </span>
                  </button>
                );
              })}
          </div>

          {visibleBeds.length === 0 ? (
            <div style={{ textAlign: "center", padding: 28, color: "#64748b", fontSize: "0.84rem" }}>
              No beds match the selected filter.
            </div>
          ) : (
            <BedGrid>
              {visibleBeds.map((bed, idx) => {
                const cfg = getBedCfg(bed);
                const pName = bed.patient?.patientname || bed.patient?.name || "";
                const isAv = cfg.key === "Available";
                const isOcc = cfg.key === "Occupied" || Boolean(pName);
                const clickable = isAv || (isOcc && Boolean(onViewOccupant));

                return (
                  <BedTile
                    key={idx}
                    type="button"
                    cfg={cfg}
                    clickable={clickable}
                    title={
                      isAv
                        ? `✅ Bed ${bed.bed_number} — Available (Click to select)`
                        : isOcc
                        ? `🛏️ Bed ${bed.bed_number} — Occupied by ${pName || "Patient"} (Click to view)`
                        : `Bed ${bed.bed_number} (${cfg.label})`
                    }
                    onClick={() => {
                      if (isAv) onSelectBed(bed.bed_number, room);
                      else if (isOcc && onViewOccupant) onViewOccupant({ bed, room });
                    }}
                  >
                    <BedMiniSVG color={cfg.color} size={19} />
                    <span style={{ fontSize: "0.76rem", fontWeight: 800, color: cfg.color, lineHeight: 1.1 }}>
                      Bed {bed.bed_number}
                    </span>
                    <span style={{
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      color: cfg.color,
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {pName ? `👤 ${pName.split(" ")[0]}` : cfg.label}
                    </span>
                  </BedTile>
                );
              })}
            </BedGrid>
          )}
        </Body>
      </Box>
    </Overlay>
  );
};

const FLOOR_ORDER = [
  "first floor",
  "first suit",
  "second floor",
  "second suit",
  "third floor",
  "chemo ward",
  "dialysis",
  "recovery ward",
  "micu",
  "nicu",
];

export const getFloorSortRank = (floorName) => {
  const key = String(floorName || "").trim().toLowerCase();
  const idx = FLOOR_ORDER.indexOf(key);
  return idx !== -1 ? idx : FLOOR_ORDER.length;
};

export const sortRoomsByFloorOrder = (rooms) => {
  return [...(rooms || [])].sort((a, b) => {
    const fa = a.nursing_station || (a.floor ? `Floor ${a.floor}` : "General Ward");
    const fb = b.nursing_station || (b.floor ? `Floor ${b.floor}` : "General Ward");
    const ra = getFloorSortRank(fa);
    const rb = getFloorSortRank(fb);
    if (ra !== rb) return ra - rb;
    if (fa.toLowerCase() !== fb.toLowerCase()) return fa.localeCompare(fb);
    return String(a.room_number || "").localeCompare(String(b.room_number || ""), undefined, { numeric: true });
  });
};

export const groupRoomsList = (rooms) => {
  const g = {};
  (rooms || []).forEach(r => {
    const bl = r.block || "MAIN BLOCK";
    const fl = r.nursing_station || (r.floor ? `Floor ${r.floor}` : "General Ward");
    if (!g[bl]) g[bl] = {};
    if (!g[bl][fl]) g[bl][fl] = [];
    g[bl][fl].push(r);
  });
  Object.keys(g).forEach(bl => {
    const sortedFloors = {};
    Object.keys(g[bl])
      .sort((a, b) => {
        const ra = getFloorSortRank(a);
        const rb = getFloorSortRank(b);
        return ra !== rb ? ra - rb : a.localeCompare(b);
      })
      .forEach(fl => {
        sortedFloors[fl] = g[bl][fl];
      });
    g[bl] = sortedFloors;
  });
  return g;
};

export const RoomPaginationBar = ({ page, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }) => {
  if (totalItems === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10,
      padding: "8px 12px",
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
        <span>Showing <strong style={{ color: "#0f172a" }}>{start}–{end}</strong> of <strong style={{ color: "#0f172a" }}>{totalItems}</strong> rooms</span>
        {onPageSizeChange && (
          <label style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: "2px 6px",
                borderRadius: 5,
                border: "1px solid #cbd5e1",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#0f172a",
                background: "#f8fafc",
              }}
            >
              {[10, 15, 20, 25].map(sz => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid #cbd5e1",
            background: page <= 1 ? "#f1f5f9" : "#ffffff",
            color: page <= 1 ? "#94a3b8" : "#0f172a",
            fontSize: "0.72rem",
            fontWeight: 700,
            cursor: page <= 1 ? "not-allowed" : "pointer",
          }}
        >
          ← Prev
        </button>

        {pages.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            style={{
              minWidth: 28,
              height: 28,
              padding: "0 6px",
              borderRadius: 6,
              border: `1px solid ${p === page ? "#0d9488" : "#cbd5e1"}`,
              background: p === page ? "#0d9488" : "#ffffff",
              color: p === page ? "#ffffff" : "#0f172a",
              fontSize: "0.72rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid #cbd5e1",
            background: page >= totalPages ? "#f1f5f9" : "#ffffff",
            color: page >= totalPages ? "#94a3b8" : "#0f172a",
            fontSize: "0.72rem",
            fontWeight: 700,
            cursor: page >= totalPages ? "not-allowed" : "pointer",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default BedSelectionModal;

