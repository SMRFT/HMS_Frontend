import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0faf8 0%, #e8f5e9 100%);
  padding: 1.5rem 2rem;
  font-family: inherit;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  animation: ${fadeIn} 0.35s ease;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.9rem;
  border-bottom: 2px solid #f0f0f0;
`;

const PageTitle = styled.h1`
  font-size: 1.35rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
  align-items: center;
`;

const MetaChip = styled.span`
  background: linear-gradient(135deg, #e0f2f1, #e8f5e9);
  border: 1.5px solid #b2dfdb;
  border-radius: 20px;
  padding: 0.25rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #00695c;
`;

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TabRow = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e0f2f1;
  margin-bottom: 1.25rem;
`;

const Tab = styled.button`
  padding: 0.6rem 1.75rem;
  border: none;
  background: ${(p) =>
    p.active ? "linear-gradient(135deg,#00897b,#00695c)" : "#f5f5f5"};
  color: ${(p) => (p.active ? "white" : "#666")};
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 10px 10px 0 0;
  transition: all 0.2s;
  &:hover {
    filter: brightness(1.08);
  }
`;

// ─── Buttons ──────────────────────────────────────────────────────────────────

const Btn = styled.button`
  padding: ${(p) => (p.sm ? "0.3rem 0.85rem" : "0.45rem 1.2rem")};
  border: none;
  border-radius: ${(p) => (p.sm ? "20px" : "8px")};
  background: ${(p) => p.bg || "#eee"};
  color: ${(p) => p.color || "#333"};
  font-weight: 700;
  font-size: ${(p) => (p.sm ? "0.75rem" : "0.82rem")};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid ${(p) => p.border || "transparent"};
  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
`;

// ─── TAT Filter ───────────────────────────────────────────────────────────────

const TATFilterRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  align-items: center;
`;

const TATFilterBtn = styled.button`
  padding: 0.3rem 0.85rem;
  border: 2px solid
    ${(p) => (p.active ? p.borderColor || "#00897b" : "#e0e0e0")};
  border-radius: 20px;
  background: ${(p) => (p.active ? p.bg || "#e0f2f1" : "white")};
  color: ${(p) => (p.active ? p.color || "#00695c" : "#888")};
  font-weight: 700;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    filter: brightness(0.96);
  }
`;

// ─── Table ────────────────────────────────────────────────────────────────────

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e0f2f1;
`;

const PrintTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
`;

const PTh = styled.th`
  background: linear-gradient(135deg, #00897b, #00695c);
  color: white;
  padding: 0.6rem 0.85rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.3px;
  white-space: nowrap;
`;

const PTd = styled.td`
  padding: 0.5rem 0.85rem;
  border-bottom: 1px solid #e0f2f1;
  color: #333;
  font-size: 0.8rem;
  background: ${(p) => (p.alt ? "#f8fffe" : "white")};
  vertical-align: middle;
`;

const TotalRow = styled.tr`
  td {
    background: #e8f5e9 !important;
    font-weight: 800;
    color: #00695c;
    font-size: 0.85rem;
  }
`;

// ─── Badges (self-contained, no imports needed) ───────────────────────────────

const TATBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.22rem 0.55rem;
  border-radius: 10px;
  white-space: nowrap;
  ${(p) => {
    switch (p.status) {
      case "completed":
        return `background:linear-gradient(135deg,#c8e6c9,#a5d6a7); color:#1b5e20;`;
      case "completed_late":
        return `background:linear-gradient(135deg,#ffe0b2,#ffcc80); color:#bf360c;`;
      case "overdue":
        return `background:linear-gradient(135deg,#ffcdd2,#ef9a9a); color:#b71c1c;`;
      case "on_track":
        return `background:linear-gradient(135deg,#e3f2fd,#bbdefb); color:#0d47a1;`;
      case "waiting":
        return `background:linear-gradient(135deg,#f5f5f5,#eeeeee); color:#9e9e9e;`;
      default:
        return `background:#f5f5f5; color:#9e9e9e;`;
    }
  }}
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  ${(p) => {
    if (!p.hasReport)
      return `background:linear-gradient(135deg,#e3f2fd,#bbdefb);color:#1565c0;`;
    if (p.approved)
      return `background:linear-gradient(135deg,#c8e6c9,#a5d6a7);color:#2e7d32;`;
    return `background:linear-gradient(135deg,#fff9c4,#fff59d);color:#f57f17;`;
  }}
`;

const ScanTypeBadge = styled.span`
  display: inline-block;
  font-size: 0.58rem;
  font-weight: 800;
  padding: 0.12rem 0.4rem;
  border-radius: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 0.3rem;
  vertical-align: middle;
  ${(p) => {
    switch (p.type) {
      case "DOPPLER":
        return `background:#e3f2fd; color:#1565c0;`;
      case "ANC":
        return `background:#fce4ec; color:#880e4f;`;
      case "OBSTETRIC":
        return `background:#f3e5f5; color:#6a1b9a;`;
      default:
        return `background:#e8f5e9; color:#2e7d32;`;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #bbb;
  font-size: 1rem;
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const TAT_FILTER_OPTIONS = [
  {
    value: "all",
    label: "All",
    bg: "#e0f2f1",
    color: "#00695c",
    borderColor: "#00897b",
  },
  {
    value: "completed",
    label: "✅ Completed",
    bg: "#c8e6c9",
    color: "#1b5e20",
    borderColor: "#43a047",
  },
  {
    value: "completed_late",
    label: "⚠️ Late Done",
    bg: "#ffe0b2",
    color: "#bf360c",
    borderColor: "#fb8c00",
  },
  {
    value: "overdue",
    label: "🔴 Overdue",
    bg: "#ffcdd2",
    color: "#b71c1c",
    borderColor: "#e53935",
  },
  {
    value: "on_track",
    label: "🟢 On Track",
    bg: "#bbdefb",
    color: "#0d47a1",
    borderColor: "#1e88e5",
  },
  {
    value: "waiting",
    label: "⏳ Waiting",
    bg: "#eeeeee",
    color: "#757575",
    borderColor: "#9e9e9e",
  },
];

const tatIcon = (status) => {
  switch (status) {
    case "completed":
      return "✅";
    case "completed_late":
      return "⚠️";
    case "overdue":
      return "🔴";
    case "on_track":
      return "🟢";
    case "waiting":
      return "⏳";
    default:
      return "—";
  }
};
// Formats total seconds → "00:00:00"  (or "—" if null)
const formatTATDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return "—";
  const total = Math.abs(Math.round(seconds)); // ← now expects SECONDS
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const formatTATDisplay = (tat_info) => {
  if (!tat_info || tat_info.status === "unknown") return "—";
  const timeStr = formatTATDuration(tat_info.elapsed_minutes);
  switch (tat_info.status) {
    case "completed":
      return `✅ Done ${timeStr}`;
    case "completed_late":
      return `⚠️ Done ${timeStr} (Late)`;
    case "overdue":
      return `🔴 Overdue ${timeStr}`;
    case "on_track":
      return `🟢 ${timeStr} elapsed`;
    case "waiting":
      return `⏳ Awaiting check-in`;
    default:
      return timeStr;
  }
};

const formatSlotDisplay = (dt) => {
  if (!dt) return "—";
  try {
    const s = String(dt);
    const hasOffset = s.includes("+") || s.endsWith("Z");
    const d = hasOffset ? new Date(s) : new Date(s + "Z");
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dt;
  }
};

const formatDateOnly = (dt) => {
  if (!dt) return "—";
  try {
    const s = String(dt);
    const hasOffset = s.includes("+") || s.endsWith("Z");
    const d = hasOffset ? new Date(s) : new Date(s + "Z");
    return d.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dt;
  }
};

// ─── Print helpers ────────────────────────────────────────────────────────────

const printCountHTML = (countData, fromDate, toDate, billTypeLabel) => {
  const w = window.open("", "_blank");
  w.document.write(`
    <html><head><title>Count Report</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;font-size:13px;}
      h2{color:#00695c;margin-bottom:4px;}
      p{color:#666;margin-top:0;}
      table{width:100%;border-collapse:collapse;margin-top:12px;}
      th{background:#00897b;color:white;padding:8px 12px;text-align:left;}
      td{padding:7px 12px;border-bottom:1px solid #e0f2f1;}
      tr:nth-child(even) td{background:#f8fffe;}
      .total td{background:#e8f5e9;font-weight:800;color:#00695c;}
    </style></head><body>
    <h2>🔬 Investigation Count Report</h2>
    <p>📅 ${fromDate} → ${toDate} &nbsp;|&nbsp; 🏷 ${billTypeLabel} &nbsp;|&nbsp; Total Items: ${countData.reduce((a, r) => a + r.count, 0)}</p>
    <table>
      <thead><tr><th>Sl.No</th><th>Item Name</th><th>Count</th></tr></thead>
      <tbody>
        ${countData.map((r) => `<tr><td>${r.slNo}</td><td>${r.itemName}</td><td><b>${r.count}</b></td></tr>`).join("")}
        <tr class="total"><td colspan="2">Total</td><td>${countData.reduce((a, r) => a + r.count, 0)}</td></tr>
      </tbody>
    </table>
    </body></html>
  `);
  w.document.close();
  w.print();
};

// Compact print format: "20 May 26" on line 1, "04:19:32 PM" on line 2
const formatSlotPrint = (dt) => {
  if (!dt) return "—";
  try {
    const s = String(dt);
    const hasOffset = s.includes("+") || s.endsWith("Z");
    const d = hasOffset ? new Date(s) : new Date(s + "Z");
    const date = d.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
    const time = d
      .toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .toUpperCase();
    return `${date}\n${time}`;
  } catch {
    return dt;
  }
};

const printTATHTML = (rows, fromDate, toDate, billTypeLabel, filterLabel) => {
  const w = window.open("", "_blank");
  w.document.write(`
    <html><head><title>TAT Report</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;font-size:11px;}
      h2{color:#00695c;margin-bottom:4px;}
      p{color:#666;margin-top:0;}
      table{width:100%;border-collapse:collapse;margin-top:12px;}
      th{background:#00897b;color:white;padding:6px 8px;text-align:left;white-space:nowrap;}
      td{padding:5px 8px;border-bottom:1px solid #e0f2f1;vertical-align:middle;white-space:nowrap;}
      tr:nth-child(even) td{background:#f8fffe;}
    </style></head><body>
    <h2>⏱ TAT Report — ${filterLabel}</h2>
    <p>📅 ${fromDate} → ${toDate} &nbsp;|&nbsp; 🏷 ${billTypeLabel} &nbsp;|&nbsp; Records: ${rows.length}</p>
    <table>
      <thead><tr>
        <th>Sl.No</th>
        <th>Bill No</th>
        <th>UHID</th>
        <th>Patient</th>
        <th>Age</th>
        <th>Gender</th>
        <th>Item</th>
        <th>Scan Type</th>
        <th>Bill Date</th>
        <th>Referred By</th>
        <th>Payment</th>
        <th>Patient In</th>
        <th>Scan Started</th>
        <th>Waiting Time</th>
        <th>Dispatch</th>
        <th>Status</th>
        <th>TAT (Elapsed)</th>
        <th>TAT Limit</th>
      </tr></thead>
      <tbody>
        ${rows
          .map(
            (r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${r.investBillNo || "—"}</td>
            <td>${r.uhid || "—"}</td>
            <td>${r.patientName || "—"}</td>
            <td>${r.age || "—"}</td>
            <td>${r.gender || "—"}</td>
            <td>${r.itemName || "—"}</td>
            <td>${r.scan_type || "—"}</td>
            <td>${formatDateOnly(r.investBillDate)}</td>
            <td>${r.referredBy || "—"}</td>
            <td>${r.paymentStatus || "—"}</td>
            <td>${r.report?.patientIn_DateTime ? formatSlotDisplay(r.report.patientIn_DateTime) : "—"}</td>
            <td>${r.report?.scan_started_DateTime ? formatSlotDisplay(r.report.scan_started_DateTime) : "—"}</td>
            <td>${r.tat_info?.waiting_seconds != null ? formatTATDuration(r.tat_info.waiting_seconds) : "—"}</td>
            <td>${r.report?.dispatch_DateTime ? formatSlotDisplay(r.report.dispatch_DateTime) : "—"}</td>
            <td>${!r.hasReport ? "Pending" : r.report?.is_approved ? "Approved" : "Reported"}</td>
            <td>${r.tat_info && r.tat_info.status !== "unknown" ? r.tat_info.label : "—"}</td>
            <td>${r.tat_info?.tat_seconds != null ? formatTATDuration(r.tat_info.tat_seconds) : "—"}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    </body></html>
  `);
  w.document.close();
  w.print();
};

// ─── Main Component ───────────────────────────────────────────────────────────

const RDPrint = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const rows = state?.rows || [];
  const fromDate = state?.fromDate || "—";
  const toDate = state?.toDate || "—";
  const billTypeLabel = state?.billTypeLabel || "—";

  const [tab, setTab] = useState("count");
  const [tatFilter, setTatFilter] = useState("all");

  // ── Count data ─────────────────────────────────────────────────────────────
  const countData = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      const name = r.itemName || "Unknown";
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).map(([itemName, count], i) => ({
      slNo: i + 1,
      itemName,
      count,
    }));
  }, [rows]);

  // ── TAT filtered rows ──────────────────────────────────────────────────────
  const tatRows = useMemo(() => {
    if (tatFilter === "all") return rows;
    return rows.filter((r) => r.tat_info?.status === tatFilter);
  }, [rows, tatFilter]);

  // ── TAT counts per status ──────────────────────────────────────────────────
  const tatCounts = useMemo(() => {
    const counts = { all: rows.length };
    TAT_FILTER_OPTIONS.forEach(({ value }) => {
      if (value !== "all")
        counts[value] = rows.filter((r) => r.tat_info?.status === value).length;
    });
    return counts;
  }, [rows]);

  const activeFilterLabel =
    TAT_FILTER_OPTIONS.find((o) => o.value === tatFilter)?.label || "All";

  if (!state || rows.length === 0) {
    return (
      <PageWrapper>
        <ContentCard>
          <TopBar>
            <PageTitle>🖨️ Print</PageTitle>
            <Btn
              bg="linear-gradient(135deg,#757575,#616161)"
              color="white"
              onClick={() => navigate(-1)}
            >
              ← Back
            </Btn>
          </TopBar>
          <EmptyState>
            No data to display. Please go back and try again.
          </EmptyState>
        </ContentCard>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <ContentCard>
        {/* Top bar */}
        <TopBar>
          <PageTitle>🖨️ Print — {billTypeLabel} Investigations</PageTitle>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {tab === "count" && (
              <Btn
                bg="linear-gradient(135deg,#ff7043,#e64a19)"
                color="white"
                onClick={() =>
                  printCountHTML(countData, fromDate, toDate, billTypeLabel)
                }
              >
                🖨️ Print Count
              </Btn>
            )}
            {tab === "tat" && (
              <Btn
                bg="linear-gradient(135deg,#ff7043,#e64a19)"
                color="white"
                onClick={() =>
                  printTATHTML(
                    tatRows,
                    fromDate,
                    toDate,
                    billTypeLabel,
                    activeFilterLabel,
                  )
                }
              >
                🖨️ Print TAT
              </Btn>
            )}
            <Btn
              bg="linear-gradient(135deg,#757575,#616161)"
              color="white"
              onClick={() => navigate(-1)}
            >
              ← Back
            </Btn>
          </div>
        </TopBar>

        {/* Meta info */}
        <MetaRow>
          <MetaChip>
            📅 {fromDate} → {toDate}
          </MetaChip>
          <MetaChip>🏷 {billTypeLabel}</MetaChip>
          <MetaChip>📋 {rows.length} Records</MetaChip>
        </MetaRow>

        {/* Tabs */}
        <TabRow>
          <Tab active={tab === "count"} onClick={() => setTab("count")}>
            📊 Count
          </Tab>
          <Tab active={tab === "tat"} onClick={() => setTab("tat")}>
            ⏱ TAT
          </Tab>
        </TabRow>

        {/* ── COUNT TAB ──────────────────────────────────────────────────── */}
        {tab === "count" && (
          <TableWrapper>
            <PrintTable>
              <thead>
                <tr>
                  <PTh>Sl.No</PTh>
                  <PTh>Item Name</PTh>
                  <PTh>Count</PTh>
                </tr>
              </thead>
              <tbody>
                {countData.map((r, i) => (
                  <tr key={r.itemName}>
                    <PTd alt={i % 2 === 1}>{r.slNo}</PTd>
                    <PTd alt={i % 2 === 1}>{r.itemName}</PTd>
                    <PTd alt={i % 2 === 1}>
                      <strong style={{ color: "#00695c", fontSize: "0.88rem" }}>
                        {r.count}
                      </strong>
                    </PTd>
                  </tr>
                ))}
                <TotalRow>
                  <PTd colSpan={2}>Total</PTd>
                  <PTd>{countData.reduce((a, r) => a + r.count, 0)}</PTd>
                </TotalRow>
              </tbody>
            </PrintTable>
          </TableWrapper>
        )}

        {/* ── TAT TAB ────────────────────────────────────────────────────── */}
        {tab === "tat" && (
          <>
            <TATFilterRow>
              <span
                style={{ fontSize: "0.78rem", fontWeight: 700, color: "#555" }}
              >
                Filter by TAT:
              </span>
              {TAT_FILTER_OPTIONS.map((opt) => (
                <TATFilterBtn
                  key={opt.value}
                  active={tatFilter === opt.value}
                  bg={opt.bg}
                  color={opt.color}
                  borderColor={opt.borderColor}
                  onClick={() => setTatFilter(opt.value)}
                >
                  {opt.label}
                  <span style={{ marginLeft: "0.3rem", opacity: 0.75 }}>
                    ({tatCounts[opt.value] ?? 0})
                  </span>
                </TATFilterBtn>
              ))}
            </TATFilterRow>

            <TableWrapper>
              <PrintTable>
                <thead>
                  <tr>
                    <PTh>Sl.No</PTh>
                    <PTh>Bill No</PTh>
                    <PTh>UHID</PTh>
                    <PTh>Patient</PTh>
                    <PTh>Age</PTh>
                    <PTh>Gender</PTh>
                    <PTh>Item</PTh>
                    <PTh>Scan Type</PTh>
                    <PTh>Bill Date</PTh>
                    <PTh>Referred By</PTh>
                    <PTh>Payment</PTh>
                    <PTh>Patient In</PTh>
                    <PTh>Scan Started</PTh> {/* ← ADD */}
                    <PTh>Waiting Time</PTh> {/* ← ADD */}
                    <PTh>Dispatch</PTh>
                    <PTh>Status</PTh>
                    <PTh>TAT (Elapsed)</PTh>
                    <PTh>TAT Limit</PTh>
                  </tr>
                </thead>
                <tbody>
                  {tatRows.length > 0 ? (
                    tatRows.map((r, i) => (
                      <tr key={`${r.investBillNo}-${r.item_id}-${i}`}>
                        <PTd alt={i % 2 === 1}>{i + 1}</PTd>
                        <PTd alt={i % 2 === 1}>{r.investBillNo || "—"}</PTd>
                        <PTd alt={i % 2 === 1}>{r.uhid || "—"}</PTd>
                        <PTd alt={i % 2 === 1}>{r.patientName || "—"}</PTd>
                        <PTd alt={i % 2 === 1}>{r.age || "—"}</PTd>
                        <PTd alt={i % 2 === 1}>{r.gender || "—"}</PTd>
                        <PTd alt={i % 2 === 1}>{r.itemName || "—"}</PTd>
                        <PTd alt={i % 2 === 1}>{r.scan_type || "—"}</PTd>
                        <PTd alt={i % 2 === 1}>
                          {formatDateOnly(r.investBillDate)}
                        </PTd>
                        <PTd alt={i % 2 === 1}>{r.referredBy || "—"}</PTd>
                        <PTd alt={i % 2 === 1}>
                          <StatusBadge
                            hasReport={r.paymentStatus === "Paid"}
                            approved={r.paymentStatus === "Paid"}
                          >
                            {r.paymentStatus === "Paid"
                              ? "✅ Paid"
                              : "⏳ Pending"}
                          </StatusBadge>
                        </PTd>

                        {/* Patient In */}
                        <PTd alt={i % 2 === 1} style={{ whiteSpace: "nowrap" }}>
                          {formatSlotDisplay(r.report?.patientIn_DateTime)}
                        </PTd>

                        {/* Scan Started */}
                        <PTd alt={i % 2 === 1} style={{ whiteSpace: "nowrap" }}>
                          {r.report?.scan_started_DateTime ? (
                            formatSlotDisplay(r.report.scan_started_DateTime)
                          ) : (
                            <span style={{ color: "#bbb" }}>—</span>
                          )}
                        </PTd>

                        {/* Waiting Time */}
                        <PTd alt={i % 2 === 1} style={{ whiteSpace: "nowrap" }}>
                          {r.tat_info?.waiting_seconds != null ? (
                            <TATBadge status="on_track">
                              ⏳ {formatTATDuration(r.tat_info.waiting_seconds)}
                            </TATBadge>
                          ) : (
                            <span style={{ color: "#bbb" }}>—</span>
                          )}
                        </PTd>

                        {/* Dispatch */}
                        <PTd alt={i % 2 === 1} style={{ whiteSpace: "nowrap" }}>
                          {formatSlotDisplay(r.report?.dispatch_DateTime)}
                        </PTd>

                        {/* Status */}
                        <PTd alt={i % 2 === 1}>
                          {!r.hasReport ? (
                            <StatusBadge hasReport={false}>
                              ⏳ Pending
                            </StatusBadge>
                          ) : r.report?.is_approved ? (
                            <StatusBadge hasReport approved>
                              ✓ Approved
                            </StatusBadge>
                          ) : (
                            <StatusBadge hasReport>⏱ Reported</StatusBadge>
                          )}
                        </PTd>

                        {/* TAT Elapsed */}
                        <PTd alt={i % 2 === 1} style={{ whiteSpace: "nowrap" }}>
                          {r.tat_info && r.tat_info.status !== "unknown" ? (
                            <TATBadge status={r.tat_info.status}>
                              {" "}
                              {/* ← r not row */}
                              {tatIcon(r.tat_info.status)} {r.tat_info.label}{" "}
                              {/* ← r not row */}
                            </TATBadge>
                          ) : (
                            <span style={{ color: "#bbb" }}>—</span>
                          )}
                        </PTd>

                        {/* TAT Limit */}
                        <PTd alt={i % 2 === 1} style={{ whiteSpace: "nowrap" }}>
                          {r.tat_info?.tat_seconds != null ? (
                            <span
                              style={{
                                fontSize: "0.8rem",
                                color: "#555",
                                fontWeight: 600,
                              }}
                            >
                              {formatTATDuration(r.tat_info.tat_seconds)}
                            </span>
                          ) : (
                            <span style={{ color: "#bbb" }}>—</span>
                          )}
                        </PTd>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={18}>
                        <EmptyState>No records for this TAT status</EmptyState>
                      </td>
                    </tr>
                  )}
                </tbody>
              </PrintTable>
            </TableWrapper>
          </>
        )}
      </ContentCard>
    </PageWrapper>
  );
};

export default RDPrint;
