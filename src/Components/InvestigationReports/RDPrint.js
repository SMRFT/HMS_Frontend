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
  padding: 0.6rem 0.75rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.74rem;
  letter-spacing: 0.3px;
  white-space: nowrap;
`;

const PTd = styled.td`
  padding: 0.45rem 0.75rem;
  border-bottom: 1px solid #e0f2f1;
  color: #333;
  font-size: 0.78rem;
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

// ─── Badges ───────────────────────────────────────────────────────────────────

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
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  font-size: 0.67rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  ${(p) => {
    if (!p.hasReport)
      return `background:linear-gradient(135deg,#e3f2fd,#bbdefb);color:#1565c0;`;
    if (p.dispatched)
      return `background:linear-gradient(135deg,#b3e5fc,#81d4fa);color:#01579b;`;
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

const PatientTypeBadge = styled.span`
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  white-space: nowrap;
  ${(p) =>
    p.type === "IP"
      ? `background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;`
      : `background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;`}
`;

const CustomerTypeBadge = styled.span`
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  white-space: nowrap;
  ${(p) => {
    const t = (p.type || "").toUpperCase();
    if (t.includes("INSURANCE")) {
      return `background: #fef3c7; color: #92400e; border: 1px solid #fde68a;`;
    }
    if (t.includes("CORPORATE")) {
      return `background: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff;`;
    }
    if (t.includes("CAMP") || t.includes("SCHEME")) {
      return `background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;`;
    }
    return `background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1;`;
  }}
`;

const PriceBadge = styled.span`
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.12rem 0.45rem;
  border-radius: 5px;
  background: #e0f2f1;
  color: #00695c;
  border: 1px solid #b2dfdb;
  white-space: nowrap;
  vertical-align: middle;
`;



const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #bbb;
  font-size: 1rem;
`;

// ─── Patient Info Cell ────────────────────────────────────────────────────────

const PatientStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  min-width: 120px;
`;

const PatientName = styled.span`
  font-weight: 700;
  font-size: 0.8rem;
  color: #00695c;
  line-height: 1.2;
`;

const PatientMeta = styled.span`
  font-size: 0.7rem;
  color: #666;
`;

// ─── Time Stack Cell ──────────────────────────────────────────────────────────

const TimeStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  min-width: 115px;
`;

const TimeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.28rem;
  font-size: 0.69rem;
  line-height: 1.3;
`;

const TimeLabel = styled.span`
  font-weight: 700;
  color: ${(p) => p.color || "#555"};
  min-width: 14px;
  flex-shrink: 0;
`;

const TimeValue = styled.span`
  color: #444;
  font-variant-numeric: tabular-nums;
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

const SLOT_FILTER_OPTIONS = [
  {
    value: "all",
    label: "All",
    bg: "#e0f2f1",
    color: "#00695c",
    borderColor: "#00897b",
  },
  {
    value: "on_time",
    label: "✅ On Time",
    bg: "#c8e6c9",
    color: "#1b5e20",
    borderColor: "#43a047",
  },
  {
    value: "late",
    label: "🔴 Late",
    bg: "#ffcdd2",
    color: "#b71c1c",
    borderColor: "#e53935",
  },
  {
    value: "not_arrived",
    label: "⏳ Not Arrived",
    bg: "#eeeeee",
    color: "#757575",
    borderColor: "#9e9e9e",
  },
  {
    value: "no_slot",
    label: "— No Slot",
    bg: "#fff9c4",
    color: "#f57f17",
    borderColor: "#fb8c00",
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

// ─── Formatters ───────────────────────────────────────────────────────────────

const formatTATDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return "—";
  const total = Math.abs(Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const formatSlotDisplay = (dt) => {
  if (!dt) return null;
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
        hour12: true,
      })
      .toUpperCase();
    return `${date} ${time}`;
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

// ─── FIX: Convert \n → <br> while preserving existing HTML tags (bold etc.) ──
// The API returns strings like "Line one\nLine <b>two</b>\nLine three"
// When injected as innerHTML, \n is collapsed to a space unless we convert it.
// white-space:pre-wrap only works for text nodes, not innerHTML injection.
const nl2br = (str) => {
  if (!str) return "";
  // Replace literal \n with <br>; leave all HTML tags intact
  return str.replace(/\n/g, "<br>");
};

// ─── Print helpers ────────────────────────────────────────────────────────────

const printCountHTML = (countData, fromDate, toDate, billTypeLabel) => {
  const w = window.open("", "_blank");
  w.document.write(`
    <html><head><title>Count Report</title>
    <style>
      @page { size: A4 portrait; margin: 15mm; }
      body{font-family:Arial,sans-serif;padding:0;font-size:13px;}
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
        ${countData
          .map(
            (r) =>
              `<tr><td>${r.slNo}</td><td>${r.itemName}</td><td><b>${r.count}</b></td></tr>`,
          )
          .join("")}
        <tr class="total"><td colspan="2">Total</td><td>${countData.reduce((a, r) => a + r.count, 0)}</td></tr>
      </tbody>
    </table>
    </body></html>
  `);
  w.document.close();
  w.print();
};

// ─── TAT Print (A4 Landscape) ─────────────────────────────────────────────────

const printTATHTML = (rows, fromDate, toDate, billTypeLabel, filterLabel) => {
  const fmt = (dt) => {
    if (!dt) return null;
    try {
      const s = String(dt);
      const d =
        s.includes("+") || s.endsWith("Z") ? new Date(s) : new Date(s + "Z");
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
          hour12: true,
        })
        .toUpperCase();
      return `${date} ${time}`;
    } catch {
      return null;
    }
  };

  const fmtDate = (dt) => {
    if (!dt) return "—";
    try {
      const s = String(dt);
      const d =
        s.includes("+") || s.endsWith("Z") ? new Date(s) : new Date(s + "Z");
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

  const fmtTAT = (seconds) => {
    if (seconds == null) return "—";
    const total = Math.abs(Math.round(seconds));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const timeCell = (inDt, scanDt, apprDt, dispDt) => {
    const row = (lbl, val) =>
      `<div class="t-row"><span class="t-lbl">${lbl}</span><span class="${val ? "t-val" : "t-nil"}">${val || "—"}</span></div>`;
    return `
      ${row("In:", fmt(inDt))}
      ${row("Scan:", fmt(scanDt))}
      <div class="t-div"></div>
      ${row("Appr:", fmt(apprDt))}
      ${row("Disp:", fmt(dispDt))}
    `;
  };

  const now = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const tatStatusLabel = {
    completed: "Completed",
    completed_late: "Completed Late",
    overdue: "Overdue",
    on_track: "On Track",
    waiting: "Waiting",
  };

  const tatStatusIcon = {
    completed: "&#10003;",
    completed_late: "&#8252;",
    overdue: "&#10005;",
    on_track: "&#9654;",
    waiting: "&#9675;",
  };

  const w = window.open("", "_blank");
  w.document.write(`
    <html>
    <head>
      <title>TAT Report - ${filterLabel}</title>
      <style>
        @page { size: A4 landscape; margin: 10mm 14mm 12mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111; }

        .rpt-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 3px solid #00695c;
          padding-bottom: 7px;
          margin-bottom: 8px;
        }
        .rpt-header h2 { font-size: 17px; font-weight: 700; color: #00695c; margin-bottom: 3px; }
        .rpt-header p  { font-size: 11.5px; color: #444; }
        .rpt-right     { text-align: right; font-size: 11.5px; color: #555; line-height: 1.7; }
        .rpt-right strong { display: block; font-size: 13px; font-weight: 700; color: #222; }

        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th {
          background: #00695c;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          padding: 6px 5px;
          border: 1px solid #004d40;
          text-align: left;
          vertical-align: bottom;
          line-height: 1.3;
          overflow: hidden;
          word-wrap: break-word;
          white-space: normal;
        }
        td {
          padding: 6px 5px;
          border: 1px solid #b2dfdb;
          vertical-align: top;
          font-size: 11.5px;
          line-height: 1.45;
          overflow: hidden;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          max-width: 0;
        }
        tr:nth-child(even) td { background: #f0faf8; }
        tr:nth-child(odd)  td { background: #fff; }

        .p-name    { font-weight: 700; font-size: 11.5px; color: #00695c; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .p-meta    { font-size: 10.5px; color: #444; display: block; margin-top: 1px; }
        .p-uhid    { font-size: 10px; color: #999; display: block; margin-top: 1px; }
        .item-name { font-weight: 700; font-size: 11.5px; color: #111; display: block; word-break: break-word; }
        .bill-no   { font-weight: 700; font-size: 11.5px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bill-dt   { font-size: 10.5px; color: #888; display: block; margin-top: 2px; }
        .ref       { font-size: 11px; color: #0277bd; font-weight: 700; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sl        { font-weight: 700; color: #555; text-align: center; }
        .tat-lim   { font-weight: 700; font-variant-numeric: tabular-nums; }

        .t-row { display: flex; gap: 3px; align-items: baseline; margin-bottom: 2px; overflow: hidden; }
        .t-lbl { font-weight: 700; font-size: 10px; width: 34px; flex-shrink: 0; color: #555; white-space: nowrap; }
        .t-val { font-size: 10.5px; color: #222; font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .t-nil { font-size: 10.5px; color: #bbb; }
        .t-div { border-top: 1px dashed #aed6d1; margin: 2px 0; }

        .badge {
          display: inline-block; padding: 2px 5px; border-radius: 4px;
          font-size: 10px; font-weight: 700; white-space: nowrap;
          max-width: 100%; overflow: hidden; text-overflow: ellipsis;
        }
        .b-green  { background:#c8e6c9; color:#1b5e20; }
        .b-orange { background:#ffe0b2; color:#bf360c; }
        .b-red    { background:#ffcdd2; color:#b71c1c; }
        .b-blue   { background:#e3f2fd; color:#0d47a1; }
        .b-grey   { background:#eee;    color:#555;    }
        .b-paid   { background:#e8f5e9; color:#2e7d32; }
        .b-pend   { background:#fff9c4; color:#e65100; }
        .b-disp   { background:#e1f5fe; color:#01579b; }
        .b-appr   { background:#c8e6c9; color:#2e7d32; }
        .b-scan   { background:#ede7f6; color:#4a148c; }

        .rpt-footer {
          margin-top: 8px; border-top: 1.5px solid #b2dfdb; padding-top: 5px;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 11px; color: #777;
        }
        .legend-label { font-weight: 700; color: #333; margin-right: 4px; }

        @media print {
          * { background: transparent !important; color: #000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .rpt-header { border-bottom: 2px solid #000 !important; }
          .rpt-header h2 { font-size: 15px !important; }
          th { background: transparent !important; color: #000 !important; border: 1px solid #999 !important; font-size: 9px !important; border-bottom: 2px solid #000 !important; }
          td { background: #fff !important; border: 1px solid #999 !important; font-size: 10.5px !important; }
          tr:nth-child(even) td { background: #f5f5f5 !important; }
          .badge { background: none !important; border: none !important; padding: 0 !important; border-radius: 0 !important; font-size: 10.5px !important; font-weight: 700 !important; color: #000 !important; }
          .t-div { border-top: 1px solid #bbb !important; }
          .rpt-footer { border-top: 1px solid #000 !important; }
          tr { page-break-inside: avoid; }
          thead { display: table-header-group; }
        }
      </style>
    </head>
    <body>
      <div class="rpt-header">
        <div>
          <h2>TAT Report - ${filterLabel}</h2>
          <p>Date: ${fromDate} to ${toDate} &nbsp;|&nbsp; Type: ${billTypeLabel} &nbsp;|&nbsp; Total Records: ${rows.length}</p>
        </div>
        <div class="rpt-right">
          <strong>Printed: ${now}</strong>
          <span>Confidential - For Filing Only</span>
        </div>
      </div>

      <table>
        <colgroup>
          <col style="width:2.5%">
          <col style="width:12%">
          <col style="width:9%">
          <col style="width:8%">
          <col style="width:7%">
          <col style="width:5%">
          <col style="width:15%">
          <col style="width:13%">
          <col style="width:6%">
          <col style="width:8%">
          <col style="width:8%">
          <col style="width:7%">
        </colgroup>
        <thead>
          <tr>
            <th>#</th>
            <th>Patient<br>Age / Gender / UHID</th>
            <th>Item / Scan Type</th>
            <th>Bill No.<br>Bill Date</th>
            <th>Referred By</th>
            <th>Pay</th>
            <th>In &rarr; Scan<br>&rarr; Approved<br>&rarr; Dispatch</th>
            <th>Slot /<br>Punctuality</th>
            <th>Waiting</th>
            <th>Status</th>
            <th>TAT Actual</th>
            <th>TAT Limit</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((r, i) => {
              const ts = r.tat_info?.status || "";
              const tatLabel = tatStatusLabel[ts] || "—";

              const statusLabel = !r.hasReport
                ? "Pending"
                : r.report?.is_Dispatched
                  ? "Dispatched"
                  : r.report?.is_approved
                    ? "Approved"
                    : "Reported";

              const statusCls = !r.hasReport
                ? "b-blue"
                : r.report?.is_Dispatched
                  ? "b-disp"
                  : r.report?.is_approved
                    ? "b-appr"
                    : "b-orange";

              const tatCls =
                {
                  completed: "b-green",
                  completed_late: "b-orange",
                  overdue: "b-red",
                  on_track: "b-blue",
                  waiting: "b-grey",
                }[ts] || "b-grey";

              const payCls = r.paymentStatus === "Paid" ? "b-paid" : "b-pend";
              const payLbl = r.paymentStatus === "Paid" ? "Paid" : "Pending";

              return `
                <tr>
                  <td class="sl">${i + 1}</td>
                  <td>
                    <span class="p-name">${r.patientName || "-"}</span>
                    <span class="p-meta">${[r.age, r.gender].filter(Boolean).join(" / ") || "-"}</span>
                    <span class="p-uhid">${r.uhid || ""}</span>
                  </td>
                  <td>
                    <span class="item-name">${r.itemName || "-"}</span>
                    ${r.scan_type ? `<span class="badge b-scan" style="margin-top:3px;display:inline-block">${r.scan_type}</span>` : ""}
                  </td>
                  <td>
                    <span class="bill-no">${r.investBillNo || "-"}</span>
                    <span class="bill-dt">${fmtDate(r.investBillDate)}</span>
                  </td>
                  <td><span class="ref">${r.referredBy || "-"}</span></td>
                  <td><span class="badge ${payCls}">${payLbl}</span></td>
                  <td>${timeCell(r.report?.patientIn_DateTime, r.report?.scan_started_DateTime, r.report?.approved_date, r.report?.dispatch_DateTime)}</td>
                  <td>
                    ${
                      r.report?.slot_DateTime
                        ? `<div class="t-row" style="margin-bottom:3px"><span class="t-lbl" style="width:auto;margin-right:2px">&#128336;</span><span class="t-val">${fmt(r.report.slot_DateTime)}</span></div>
                         ${
                           r.tat_info?.slot_info
                             ? `<span class="badge ${r.tat_info.slot_info.status === "on_time" ? "b-green" : r.tat_info.slot_info.status === "late" ? "b-red" : "b-grey"}">${r.tat_info.slot_info.status === "on_time" ? "&#10003;" : r.tat_info.slot_info.status === "late" ? "&#10005;" : "&#9675;"} ${r.tat_info.slot_info.label}</span>`
                             : ""
                         }`
                        : `<span style="color:#ccc">—</span>`
                    }
                  </td>
                  <td>
                    ${
                      r.tat_info?.waiting_seconds != null
                        ? `<span class="badge b-grey">${fmtTAT(r.tat_info.waiting_seconds)}</span>`
                        : `<span style="color:#ccc">—</span>`
                    }
                  </td>
                  <td><span class="badge ${statusCls}">${statusLabel}</span></td>
                  <td>
                    ${
                      r.tat_info && ts !== "unknown"
                        ? `<span class="badge ${tatCls}">${tatStatusIcon[ts] || ""} ${fmtTAT(r.tat_info.elapsed_seconds)}</span>`
                        : `<span style="color:#ccc">—</span>`
                    }
                  </td>
                  <td class="tat-lim">
                    ${
                      r.tat_info?.tat_seconds != null
                        ? fmtTAT(r.tat_info.tat_seconds)
                        : `<span style="color:#ccc">—</span>`
                    }
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>

      <div class="rpt-footer">
        <div>
          <span class="legend-label">TAT:</span>
          <span class="badge b-green">&#10003; Completed</span>&nbsp;
          <span class="badge b-orange">&#8252; Completed Late</span>&nbsp;
          <span class="badge b-red">&#10005; Overdue</span>&nbsp;
          <span class="badge b-blue">&#9654; On Track</span>&nbsp;
          <span class="badge b-grey">&#9675; Waiting</span>
          &nbsp;&nbsp;
          <span class="legend-label">Slot:</span>
          <span class="badge b-green">&#10003; On Time</span>&nbsp;
          <span class="badge b-red">&#10005; Late</span>&nbsp;
          <span class="badge b-grey">&#9675; Not Arrived</span>
        </div>
        <span>Page 1 of 1 &nbsp;-&nbsp; Generated by Radiology System</span>
      </div>
    </body>
    </html>
  `);
  w.document.close();
  w.print();
};

// ─── Patient List Print (A4 Landscape) ───────────────────────────────────────

const printPatientListHTML = (rows, fromDate, toDate, billTypeLabel) => {
  const fmtDate = (dt) => {
    if (!dt) return "—";
    try {
      const s = String(dt);
      const d =
        s.includes("+") || s.endsWith("Z") ? new Date(s) : new Date(s + "Z");
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

  const now = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const w = window.open("", "_blank");
  w.document.write(`
    <html>
    <head>
      <title>Patient List - ${billTypeLabel}</title>
      <style>
        @page { size: A4 landscape; margin: 10mm 12mm 12mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111; }

        .rpt-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 3px solid #00695c;
          padding-bottom: 7px;
          margin-bottom: 10px;
        }
        .rpt-header h2 { font-size: 18px; font-weight: 700; color: #00695c; margin-bottom: 3px; }
        .rpt-header p  { font-size: 12px; color: #444; }
        .rpt-right     { text-align: right; font-size: 11.5px; color: #555; line-height: 1.6; }
        .rpt-right strong { display: block; font-size: 13px; font-weight: 700; color: #222; }

        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th {
          background: #00695c;
          color: #fff;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          padding: 8px 6px;
          border: 1px solid #004d40;
          text-align: left;
          vertical-align: middle;
        }
        td {
          padding: 7px 6px;
          border: 1px solid #b2dfdb;
          vertical-align: middle;
          font-size: 11.5px;
          line-height: 1.45;
          word-wrap: break-word;
        }
        tr:nth-child(even) td { background: #f0faf8; }
        tr:nth-child(odd)  td { background: #fff; }

        .sl        { font-weight: 700; color: #555; text-align: center; }
        .bill-dt   { font-weight: 600; color: #333; }
        .bill-no   { font-weight: 700; color: #00695c; }
        .p-name    { font-weight: 700; font-size: 12.5px; color: #0f172a; display: block; }
        .p-meta    { font-size: 11px; color: #475569; display: block; margin-top: 1px; }
        .p-addr    { font-size: 10.5px; color: #334155; margin-top: 3px; line-height: 1.35; display: block; }
        .p-uhid    { font-size: 10.5px; color: #64748b; font-weight: 600; }
        
        .badge {
          display: inline-block; padding: 2px 6px; border-radius: 4px;
          font-size: 10.5px; font-weight: 700; white-space: nowrap;
        }
        .b-ip        { background:#fee2e2; color:#b91c1c; border: 1px solid #fca5a5; }
        .b-op        { background:#e0f2fe; color:#0369a1; border: 1px solid #bae6fd; }
        .b-cust-gen  { background:#f1f5f9; color:#334155; border: 1px solid #cbd5e1; }
        .b-cust-ins  { background:#fef3c7; color:#92400e; border: 1px solid #fde68a; }
        .b-cust-corp { background:#f3e8ff; color:#6b21a8; border: 1px solid #e9d5ff; }
        .ins-comp    { font-size: 10px; font-weight: 700; color: #92400e; margin-top: 2px; display: block; line-height: 1.25; }
        .b-scan      { background:#ede7f6; color:#4a148c; font-size: 10px; margin-top: 2px; }
        .b-price     { background:#e0f2f1; color:#00695c; border: 1px solid #b2dfdb; font-size: 10px; font-weight: 700; margin-top: 2px; }


        .rpt-footer {
          margin-top: 10px; border-top: 1.5px solid #b2dfdb; padding-top: 6px;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 11px; color: #777;
        }

        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .rpt-header { border-bottom: 2px solid #000 !important; }
          .rpt-header h2 { font-size: 16px !important; }
          th { background: #00695c !important; color: #fff !important; font-size: 10px !important; }
          td { font-size: 11px !important; }
          tr { page-break-inside: avoid; }
          thead { display: table-header-group; }
        }
      </style>
    </head>
    <body>
      <div class="rpt-header">
        <div>
          <h2>Patient List - ${billTypeLabel}</h2>
          <p>Date: ${fromDate} to ${toDate} &nbsp;|&nbsp; Type: ${billTypeLabel} &nbsp;|&nbsp; Total Patients: ${rows.length}</p>
        </div>
        <div class="rpt-right">
          <strong>Printed: ${now}</strong>
          <span>Radiology Department</span>
        </div>
      </div>

      <table>
        <colgroup>
          <col style="width:4%">
          <col style="width:9%">
          <col style="width:11%">
          <col style="width:34%">
          <col style="width:10%">
          <col style="width:14%">
          <col style="width:18%">
        </colgroup>
        <thead>
          <tr>
            <th style="text-align:center;">Sl.No</th>
            <th>Bill Date</th>
            <th>Bill No</th>
            <th>Patient Details with Address</th>
            <th style="text-align:center;">Patient Type</th>
            <th style="text-align:center;">Customer Type</th>
            <th>Item / Scan Type</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((r, i) => {
              const isIP = Boolean(r.ipNumber && String(r.ipNumber).trim() !== "");
              const pTypeBadge = isIP
                ? `<span class="badge b-ip">IP ${r.ipNumber ? `(${r.ipNumber})` : ""}</span>`
                : `<span class="badge b-op">OP</span>`;

              const cType = r.customer_type || r.customerType || "General";
              const isIns = cType.toUpperCase().includes("INSURANCE");
              const isCorp = cType.toUpperCase().includes("CORPORATE");
              const cTypeClass = isIns ? "b-cust-ins" : (isCorp ? "b-cust-corp" : "b-cust-gen");
              const cTypeBadge = `<span class="badge ${cTypeClass}">${cType}</span>`;
              const compNameHTML = ((isIns || r.company_name) && r.company_name)
                ? `<span class="ins-comp">🏢 ${r.company_name}</span>`
                : "";

              return `
                <tr>
                  <td class="sl">${i + 1}</td>
                  <td class="bill-dt">${fmtDate(r.investBillDate)}</td>
                  <td class="bill-no">${r.investBillNo || "—"}</td>
                  <td>
                    <span class="p-name">${r.patientName || "—"}</span>
                    <span class="p-meta">
                      ${[r.age ? `${r.age}${r.age_type ? ` ${r.age_type}` : ' Yrs'}` : null, r.gender].filter(Boolean).join(" / ") || "—"}
                      ${r.uhid ? ` &bull; <span class="p-uhid">UHID: ${r.uhid}</span>` : ""}
                    </span>
                    ${r.address ? `<span class="p-addr"><strong>📍 Address:</strong> ${r.address}</span>` : ""}
                  </td>
                  <td style="text-align:center;">${pTypeBadge}</td>
                  <td style="text-align:center;">
                    ${cTypeBadge}
                    ${compNameHTML}
                  </td>
                  <td>
                    <div style="font-weight:700; color:#111;">${r.itemName || "—"}</div>
                    <div style="display:flex; align-items:center; gap:5px; margin-top:3px; flex-wrap:wrap;">
                      ${r.scan_type ? `<span class="badge b-scan">${r.scan_type}</span>` : ""}
                      ${
                        (r.finalPrice != null && r.finalPrice !== "") || (r.total != null && r.total !== "")
                          ? `<span class="badge b-price">₹${Number(r.finalPrice != null && r.finalPrice !== "" ? r.finalPrice : r.total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`
                          : ""
                      }
                    </div>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>

      <div class="rpt-footer">
        <div>Total Records: ${rows.length}</div>
        <div>Generated by Radiology System</div>
      </div>
    </body>
    </html>
  `);
  w.document.close();
  w.print();
};

// ─── Radiology Report Print (A4 Portrait) ────────────────────────────────────

const printRadiologyReportHTML = (row) => {
  if (!row) return;

  const fmt = (dt) => {
    if (!dt) return "—";
    try {
      const s = String(dt);
      const d =
        s.includes("+") || s.endsWith("Z") ? new Date(s) : new Date(s + "Z");
      return (
        d.toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        " " +
        d
          .toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .toUpperCase()
      );
    } catch {
      return dt;
    }
  };

  const rf = row.radiology_format || {};
  const pnaDetails = rf.pna_details || [];
  const disclaimer = rf.desclaimer || [];
  const heading = rf.heading || row.itemName || "";
  const subHeading = rf.sub_heading || "";
  const impression = row.report?.impression || "";
  const sections = row.report?.valuedetails?.value || [];
  const doctorId = rf.doctor_id || "";

  // Build pna line
  const pnaLine = pnaDetails
    .map(
      (p) =>
        `PNA: ${p.pna}&nbsp;&nbsp;&nbsp;&nbsp;Registration date: ${p.registration_date}`,
    )
    .join("&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;");

  // ── FIX 1: Build section HTML using nl2br so \n → <br> and <b> renders ──
  const buildSectionHTML = (sects) => {
    if (!sects || sects.length === 0) return "";
    return sects
      .map((s) => {
        if (s.table_id) {
          const { rows: rCount, cols: cCount } = (() => {
            const parts = (s.table_id || "").toUpperCase().split("X");
            const r = parseInt(parts[0], 10);
            const c = parseInt(parts[1], 10);
            return { rows: isNaN(r) ? 0 : r, cols: isNaN(c) ? 0 : c };
          })();
          if (rCount === 0 || cCount === 0) return "";

          const tableName = s.table_name || "";
          let tableHTML = `
            ${tableName ? `<div class="sec-title">${tableName}</div>` : ""}
            <table class="report-table">
              <tbody>
          `;
          for (let r = 1; r <= rCount; r++) {
            tableHTML += "<tr>";
            for (let c = 1; c <= cCount; c++) {
              // FIX: nl2br on each cell so embedded \n and <b> both render
              const cellVal = nl2br(s[`row${r}col${c}`] || "");
              tableHTML += `<td class="rtd">${cellVal}</td>`;
            }
            tableHTML += "</tr>";
          }
          tableHTML += "</tbody></table>";
          return tableHTML;
        } else {
          if (!s.title_value && !s.value) return "";
          // FIX: nl2br converts \n to <br> so newlines display AND <b> renders as bold
          const content = nl2br(s.title_value || s.value || "");
          const titleDisplay = nl2br(s.title || "");
          return `
            <div class="section-block">
              <div class="sec-title">${titleDisplay}</div>
              <div class="sec-content">${content}</div>
            </div>
          `;
        }
      })
      .join("");
  };

  // FIX 1 (impression): Same nl2br treatment
  const impressionHTML = nl2br(impression);

  // FIX 2 (disclaimer): nl2br for disclaimer text + CSS fixes for page fit
  const buildDisclaimerHTML = (disclaimerArr) => {
    if (!disclaimerArr || disclaimerArr.length === 0) return "";
    return disclaimerArr
      .map(
        (d) => `
        <div class="disclaimer-block">
          <div class="disclaimer-title">${d.title || "DISCLAIMER"}</div>
          <div class="disclaimer-text">${nl2br(d.title_value || "")}</div>
        </div>
      `,
      )
      .join("");
  };

  const w = window.open("", "_blank");
  w.document.write(`
    <html>
    <head>
      <title>${heading} - Report</title>
      <style>
        /* FIX 2: Use smaller margins and font sizes so disclaimer fits on page */
        @page { size: A4 portrait; margin: 10mm 14mm 10mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: "Times New Roman", Times, serif;
          font-size: 11.5px;
          color: #111;
          line-height: 1.45;
        }

        /* ── Header ── */
        .report-header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 6px;
          margin-bottom: 8px;
        }
        .pna-line {
          font-size: 10.5px;
          font-weight: 700;
          color: #111;
          margin-bottom: 3px;
          letter-spacing: 0.3px;
        }
        .report-heading {
          font-size: 14px;
          font-weight: 900;
          text-decoration: underline;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .report-subheading {
          font-size: 10px;
          color: #444;
          font-style: italic;
        }

        /* ── Patient Info bar ── */
        .patient-bar {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 4px;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 5px 8px;
          margin-bottom: 8px;
          font-size: 10.5px;
        }
        .patient-bar span { color: #333; }
        .patient-bar strong { color: #111; }

        /* ── ANC row ── */
        .anc-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          background: #f1f8f4;
          border: 1px solid #b2dfdb;
          border-left: 4px solid #00897b;
          border-radius: 4px;
          padding: 4px 8px;
          margin-bottom: 8px;
          font-size: 10.5px;
        }
        .anc-field { display: flex; gap: 3px; align-items: baseline; }
        .anc-lbl { font-weight: 700; color: #00695c; font-size: 9.5px; text-transform: uppercase; }
        .anc-val { font-weight: 600; color: #111; }

        /* ── Sections ── */
        .section-block {
          margin-bottom: 6px;
        }
        .sec-title {
          font-size: 11px;
          font-weight: 700;
          text-decoration: underline;
          text-transform: uppercase;
          color: #111;
          margin-bottom: 2px;
          letter-spacing: 0.3px;
        }
        /* FIX 1: Remove white-space:pre-wrap — we use nl2br for newlines,
           so the browser renders <br> + HTML tags (bold etc.) correctly */
        .sec-content {
          font-size: 11px;
          color: #222;
          line-height: 1.55;
          word-break: break-word;
        }
        .sec-content b,
        .sec-content strong { font-weight: 800; }

        /* ── Report Table ── */
        .report-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
          font-size: 10.5px;
        }
        .report-table .rtd {
          padding: 3px 6px;
          border: 1px solid #b2dfdb;
          vertical-align: middle;
          color: #222;
          line-height: 1.4;
          word-break: break-word;
        }
        /* FIX 1: No pre-wrap on table cells either */
        .report-table tr:nth-child(odd) .rtd { background: #f8fffe; }
        .report-table tr:nth-child(even) .rtd { background: #ffffff; }

        /* ── Impression ── */
        .impression-block {
          margin-top: 8px;
          margin-bottom: 10px;
          border-top: 1.5px solid #333;
          padding-top: 6px;
        }
        .impression-title {
          font-size: 11.5px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #111;
          margin-bottom: 4px;
          text-decoration: underline;
        }
        /* FIX 1: Remove white-space:pre-wrap, use nl2br + innerHTML */
        .impression-content {
          font-size: 11px;
          font-weight: 700;
          color: #111;
          line-height: 1.6;
          word-break: break-word;
        }
        .impression-content b,
        .impression-content strong { font-weight: 800; }

        /* ── Signature area ── */
        .signature-area {
          margin-top: 14px;
          display: flex;
          justify-content: flex-end;
          padding-right: 10px;
        }
        .signature-block {
          text-align: right;
          min-width: 200px;
        }
        .sig-line {
          border-top: 1.5px solid #333;
          margin-bottom: 4px;
          width: 100%;
        }
        .sig-doctor {
          font-size: 11.5px;
          font-weight: 800;
          color: #111;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .sig-designation {
          font-size: 10.5px;
          color: #333;
          font-style: italic;
        }
        .sig-reg {
          font-size: 10px;
          color: #555;
          margin-top: 2px;
        }

        /* ── FIX 2: Disclaimer — compact, fits on page, no overflow ── */
        .disclaimer-block {
          margin-top: 12px;
          border-top: 1.5px solid #888;
          padding-top: 6px;
          page-break-inside: avoid;
        }
        .disclaimer-title {
          font-size: 11px;
          font-weight: 900;
          text-decoration: underline;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #111;
          margin-bottom: 4px;
        }
        /* FIX 2: Smaller font, normal line-height, text-align justify,
           NO pre-wrap — nl2br handles line breaks */
        .disclaimer-text {
          font-size: 10px;
          color: #333;
          line-height: 1.55;
          text-align: justify;
          word-break: break-word;
        }
        .disclaimer-text b,
        .disclaimer-text strong { font-weight: 800; }

        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .report-table tr:first-child .rtd { background: #e0f2f1 !important; }
          .patient-bar { background: #f5f5f5 !important; }
          .anc-bar { background: #f1f8f4 !important; }
          /* Disclaimer must not break across pages */
          .disclaimer-block { page-break-inside: avoid; }
          /* Each section block avoids a mid-break */
          .section-block { page-break-inside: avoid; }
          .impression-block { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>

      <!-- ── Header ── -->
      <div class="report-header">
        ${pnaLine ? `<div class="pna-line">${pnaLine}</div>` : ""}
        <div class="report-heading">${heading}</div>
        ${subHeading ? `<div class="report-subheading">${subHeading}</div>` : ""}
      </div>

      <!-- ── Patient Info ── -->
      <div class="patient-bar">
        <span><strong>${row.salutation || ""} ${row.firstName || ""} ${row.middleName ? row.middleName + " " : ""}${row.lastName || ""}</strong></span>
        <span>Age: <strong>${row.age || "—"} ${row.age_type || ""}</strong></span>
        <span>Gender: <strong>${row.gender || "—"}</strong></span>
        <span>UHID: <strong>${row.uhid || "—"}</strong></span>
        <span>Bill No: <strong>${row.investBillNo || "—"}</strong></span>
        <span>Date: <strong>${fmt(row.investBillDate)}</strong></span>
        ${row.referredBy ? `<span>Ref by: <strong>${row.referredBy}</strong></span>` : ""}
      </div>

      <!-- ── ANC Details ── -->
      ${
        row.report?.anc_fields
          ? `
        <div class="anc-bar">
          ${row.report.anc_fields.guh ? `<div class="anc-field"><span class="anc-lbl">GUH:</span><span class="anc-val">${row.report.anc_fields.guh}</span></div>` : ""}
          ${row.report.anc_fields.lmp ? `<div class="anc-field"><span class="anc-lbl">LMP:</span><span class="anc-val">${row.report.anc_fields.lmp}</span></div>` : ""}
          ${row.report.anc_fields.ga_lmp ? `<div class="anc-field"><span class="anc-lbl">GA (LMP):</span><span class="anc-val">${row.report.anc_fields.ga_lmp}</span></div>` : ""}
          ${row.report.anc_fields.ga_usg ? `<div class="anc-field"><span class="anc-lbl">GA (USG):</span><span class="anc-val">${row.report.anc_fields.ga_usg}</span></div>` : ""}
          ${row.report.anc_fields.edd_usg ? `<div class="anc-field"><span class="anc-lbl">EDD (USG):</span><span class="anc-val">${row.report.anc_fields.edd_usg}</span></div>` : ""}
        </div>
      `
          : ""
      }

      <!-- ── Report Sections ── -->
      ${buildSectionHTML(sections)}

      <!-- ── Impression ── -->
      ${
        impression
          ? `
        <div class="impression-block">
          <div class="impression-title">Impression</div>
          <div class="impression-content">${impressionHTML}</div>
        </div>
      `
          : ""
      }

      <!-- ── Signature ── -->
      <div class="signature-area">
        <div class="signature-block">
          <div class="sig-line"></div>
          <div class="sig-doctor">${doctorId || "Consultant Radiologist"}</div>
          <div class="sig-designation">Consultant Radiologist</div>
        </div>
      </div>

      <!-- ── Disclaimer ── -->
      ${buildDisclaimerHTML(disclaimer)}

    </body>
    </html>
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
  const [slotFilter, setSlotFilter] = useState("all");

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

  // ── TAT filtered rows ─────────────────────────────────────────────────────
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

  // ── Slot filtered rows ─────────────────────────────────────────────────────
  const slotFilteredRows = useMemo(() => {
    if (slotFilter === "all") return tatRows;
    if (slotFilter === "no_slot")
      return tatRows.filter((r) => !r.report?.slot_DateTime);
    return tatRows.filter((r) => r.tat_info?.slot_info?.status === slotFilter);
  }, [tatRows, slotFilter]);

  // ── Slot counts ────────────────────────────────────────────────────────────
  const slotCounts = useMemo(() => {
    const counts = { all: tatRows.length };
    SLOT_FILTER_OPTIONS.forEach(({ value }) => {
      if (value === "all") return;
      if (value === "no_slot")
        counts[value] = tatRows.filter((r) => !r.report?.slot_DateTime).length;
      else
        counts[value] = tatRows.filter(
          (r) => r.tat_info?.slot_info?.status === value,
        ).length;
    });
    return counts;
  }, [tatRows]);

  const displayRows = slotFilteredRows;

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
                    displayRows,
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
            {tab === "patient_list" && (
              <Btn
                bg="linear-gradient(135deg,#ff7043,#e64a19)"
                color="white"
                onClick={() =>
                  printPatientListHTML(rows, fromDate, toDate, billTypeLabel)
                }
              >
                🖨️ Print Patient List
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
          <Tab
            active={tab === "patient_list"}
            onClick={() => setTab("patient_list")}
          >
            📋 Patient List
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
            {/* TAT status filter */}
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

            {/* Slot arrival filter */}
            <TATFilterRow>
              <span
                style={{ fontSize: "0.78rem", fontWeight: 700, color: "#555" }}
              >
                Slot Arrival:
              </span>
              {SLOT_FILTER_OPTIONS.map((opt) => (
                <TATFilterBtn
                  key={opt.value}
                  active={slotFilter === opt.value}
                  bg={opt.bg}
                  color={opt.color}
                  borderColor={opt.borderColor}
                  onClick={() => setSlotFilter(opt.value)}
                >
                  {opt.label}
                  <span style={{ marginLeft: "0.3rem", opacity: 0.75 }}>
                    ({slotCounts[opt.value] ?? 0})
                  </span>
                </TATFilterBtn>
              ))}
            </TATFilterRow>

            <TableWrapper>
              <PrintTable>
                <thead>
                  <tr>
                    <PTh style={{ width: "3%" }}>#</PTh>
                    <PTh style={{ width: "13%" }}>Patient</PTh>
                    <PTh style={{ width: "11%" }}>Item / Scan Type</PTh>
                    <PTh style={{ width: "9%" }}>Bill No / Date</PTh>
                    <PTh style={{ width: "8%" }}>Referred By</PTh>
                    <PTh style={{ width: "6%" }}>Payment</PTh>
                    <PTh style={{ width: "20%" }}>
                      Patient In → Scan → Dispatch / Approved
                    </PTh>
                    <PTh style={{ width: "8%" }}>Slot / Punctuality</PTh>
                    <PTh style={{ width: "7%" }}>Waiting</PTh>
                    <PTh style={{ width: "6%" }}>Status</PTh>
                    <PTh style={{ width: "9%" }}>TAT Actual</PTh>
                    <PTh style={{ width: "8%" }}>TAT Limit</PTh>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.length > 0 ? (
                    displayRows.map((r, i) => (
                      <tr key={`${r.investBillNo}-${r.item_id}-${i}`}>
                        {/* Sl No */}
                        <PTd alt={i % 2 === 1}>{i + 1}</PTd>

                        {/* Patient */}
                        <PTd alt={i % 2 === 1}>
                          <PatientStack>
                            <PatientName>{r.patientName || "—"}</PatientName>
                            <PatientMeta>
                              {[r.age, r.gender].filter(Boolean).join(" / ") ||
                                "—"}
                            </PatientMeta>
                            <PatientMeta style={{ color: "#888" }}>
                              {r.uhid || ""}
                            </PatientMeta>
                          </PatientStack>
                        </PTd>

                        {/* Item + Scan Type */}
                        <PTd alt={i % 2 === 1}>
                          <span style={{ fontWeight: 600 }}>
                            {r.itemName || "—"}
                          </span>
                          {r.scan_type && (
                            <ScanTypeBadge
                              type={r.scan_type}
                              style={{
                                display: "block",
                                marginLeft: 0,
                                marginTop: "0.2rem",
                              }}
                            >
                              {r.scan_type}
                            </ScanTypeBadge>
                          )}
                        </PTd>

                        {/* Bill No + Date */}
                        <PTd alt={i % 2 === 1}>
                          <span
                            style={{ fontWeight: 600, fontSize: "0.78rem" }}
                          >
                            {r.investBillNo || "—"}
                          </span>
                          <br />
                          <span style={{ fontSize: "0.7rem", color: "#888" }}>
                            {formatDateOnly(r.investBillDate)}
                          </span>
                        </PTd>

                        {/* Referred By */}
                        <PTd alt={i % 2 === 1}>
                          {r.referredBy ? (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "#0277bd",
                                fontWeight: 600,
                              }}
                            >
                              👨‍⚕️ {r.referredBy}
                            </span>
                          ) : (
                            <span style={{ color: "#bbb" }}>—</span>
                          )}
                        </PTd>

                        {/* Payment */}
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

                        {/* Combined Time Column */}
                        <PTd alt={i % 2 === 1} style={{ whiteSpace: "nowrap" }}>
                          <TimeStack>
                            <TimeRow>
                              <TimeLabel color="#1565c0">▶ In:</TimeLabel>
                              <TimeValue>
                                {r.report?.patientIn_DateTime ? (
                                  formatSlotDisplay(r.report.patientIn_DateTime)
                                ) : (
                                  <span style={{ color: "#bbb" }}>—</span>
                                )}
                              </TimeValue>
                            </TimeRow>
                            <TimeRow>
                              <TimeLabel color="#e65100">🔬 Scan:</TimeLabel>
                              <TimeValue>
                                {r.report?.scan_started_DateTime ? (
                                  formatSlotDisplay(
                                    r.report.scan_started_DateTime,
                                  )
                                ) : (
                                  <span style={{ color: "#bbb" }}>—</span>
                                )}
                              </TimeValue>
                            </TimeRow>
                            <div
                              style={{
                                borderTop: "1px dashed #b2dfdb",
                                margin: "0.15rem 0",
                              }}
                            />
                            <TimeRow>
                              <TimeLabel color="#0277bd">📤 Disp:</TimeLabel>
                              <TimeValue>
                                {r.report?.dispatch_DateTime ? (
                                  formatSlotDisplay(r.report.dispatch_DateTime)
                                ) : (
                                  <span style={{ color: "#bbb" }}>—</span>
                                )}
                              </TimeValue>
                            </TimeRow>
                            <TimeRow>
                              <TimeLabel color="#2e7d32">✓ Appr:</TimeLabel>
                              <TimeValue style={{ color: "#2e7d32" }}>
                                {r.report?.approved_date ? (
                                  formatSlotDisplay(r.report.approved_date)
                                ) : (
                                  <span style={{ color: "#bbb" }}>—</span>
                                )}
                              </TimeValue>
                            </TimeRow>
                          </TimeStack>
                        </PTd>

                        {/* Slot / Punctuality */}
                        <PTd alt={i % 2 === 1}>
                          {r.report?.slot_DateTime ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.2rem",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 600,
                                  color: "#4527a0",
                                }}
                              >
                                🕐 {formatSlotDisplay(r.report.slot_DateTime)}
                              </span>
                              {r.tat_info?.slot_info && (
                                <span
                                  style={{
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                    color:
                                      r.tat_info.slot_info.status === "on_time"
                                        ? "#1b5e20"
                                        : "#b71c1c",
                                  }}
                                >
                                  {r.tat_info.slot_info.status === "on_time"
                                    ? "✅"
                                    : "🔴"}{" "}
                                  {r.tat_info.slot_info.label}
                                </span>
                              )}
                            </div>
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

                        {/* Status */}
                        <PTd alt={i % 2 === 1}>
                          {!r.hasReport ? (
                            <StatusBadge hasReport={false}>
                              ⏳ Pending
                            </StatusBadge>
                          ) : r.report?.is_Dispatched ? (
                            <StatusBadge hasReport approved dispatched>
                              📤 Dispatched
                            </StatusBadge>
                          ) : r.report?.is_approved ? (
                            <StatusBadge hasReport approved>
                              ✓ Approved
                            </StatusBadge>
                          ) : (
                            <StatusBadge hasReport>⏱ Reported</StatusBadge>
                          )}
                        </PTd>

                        {/* TAT Actual */}
                        <PTd alt={i % 2 === 1} style={{ whiteSpace: "nowrap" }}>
                          {r.tat_info && r.tat_info.status !== "unknown" ? (
                            <TATBadge status={r.tat_info.status}>
                              {tatIcon(r.tat_info.status)}{" "}
                              {r.tat_info.elapsed_seconds != null
                                ? formatTATDuration(r.tat_info.elapsed_seconds)
                                : r.tat_info.label}
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
                      <td colSpan={12}>
                        <EmptyState>No records for this filter</EmptyState>
                      </td>
                    </tr>
                  )}
                </tbody>
              </PrintTable>
            </TableWrapper>
          </>
        )}

        {/* ── PATIENT LIST TAB ────────────────────────────────────────────── */}
        {tab === "patient_list" && (
          <TableWrapper>
            <PrintTable>
              <thead>
                <tr>
                  <PTh style={{ width: "4%", textAlign: "center" }}>Sl.No</PTh>
                  <PTh style={{ width: "9%" }}>Bill Date</PTh>
                  <PTh style={{ width: "11%" }}>Bill No</PTh>
                  <PTh style={{ width: "34%" }}>Patient Details with Address</PTh>
                  <PTh style={{ width: "10%", textAlign: "center" }}>
                    Patient Type (IP or OP)
                  </PTh>
                  <PTh style={{ width: "14%", textAlign: "center" }}>
                    Customer Type
                  </PTh>
                  <PTh style={{ width: "18%" }}>Item / Scan Type</PTh>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((r, i) => {
                    const isIP = Boolean(
                      r.ipNumber && String(r.ipNumber).trim() !== ""
                    );
                    const pType = isIP ? "IP" : (r.patientType || "OP");
                    const cType = r.customer_type || r.customerType || "General";
                    const isIns = (cType || "").toUpperCase().includes("INSURANCE");

                    return (
                      <tr key={`${r.investBillNo}-${r.item_id}-${i}`}>
                        <PTd
                          alt={i % 2 === 1}
                          style={{
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#666",
                          }}
                        >
                          {i + 1}
                        </PTd>
                        <PTd alt={i % 2 === 1} style={{ fontWeight: 600 }}>
                          {formatDateOnly(r.investBillDate)}
                        </PTd>
                        <PTd
                          alt={i % 2 === 1}
                          style={{ fontWeight: 700, color: "#00695c" }}
                        >
                          {r.investBillNo || "—"}
                        </PTd>
                        <PTd alt={i % 2 === 1}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                color: "#0f172a",
                              }}
                            >
                              {r.patientName || "—"}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#666" }}>
                              {[
                                r.age
                                  ? `${r.age}${r.age_type ? ` ${r.age_type}` : " Yrs"}`
                                  : null,
                                r.gender,
                              ]
                                .filter(Boolean)
                                .join(" / ") || "—"}
                              {r.uhid && (
                                <span
                                  style={{ marginLeft: "6px", color: "#888" }}
                                >
                                  • UHID: {r.uhid}
                                </span>
                              )}
                            </div>
                            {r.address && (
                              <div
                                style={{
                                  fontSize: "0.72rem",
                                  color: "#475569",
                                  marginTop: "2px",
                                  lineHeight: "1.35",
                                }}
                              >
                                <strong>📍 Address:</strong> {r.address}
                              </div>
                            )}
                          </div>
                        </PTd>
                        <PTd alt={i % 2 === 1} style={{ textAlign: "center" }}>
                          <PatientTypeBadge type={pType}>
                            {pType === "IP"
                              ? `IP ${r.ipNumber ? `(${r.ipNumber})` : ""}`
                              : "OP"}
                          </PatientTypeBadge>
                        </PTd>
                        <PTd alt={i % 2 === 1} style={{ textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <CustomerTypeBadge type={cType}>
                              {cType}
                            </CustomerTypeBadge>
                            {((isIns || r.company_name) && r.company_name) && (
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  color: "#92400e",
                                  lineHeight: "1.2",
                                  maxWidth: "140px",
                                  wordBreak: "break-word",
                                }}
                              >
                                🏢 {r.company_name}
                              </span>
                            )}
                          </div>
                        </PTd>
                        <PTd alt={i % 2 === 1}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#111",
                              fontSize: "0.82rem",
                            }}
                          >
                            {r.itemName || "—"}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              marginTop: "3px",
                              flexWrap: "wrap",
                            }}
                          >
                            {r.scan_type && (
                              <ScanTypeBadge
                                type={r.scan_type}
                                style={{ marginLeft: 0, marginTop: 0 }}
                              >
                                {r.scan_type}
                              </ScanTypeBadge>
                            )}
                            {((r.finalPrice != null && r.finalPrice !== "") ||
                              (r.total != null && r.total !== "")) && (
                              <PriceBadge>
                                ₹
                                {Number(
                                  r.finalPrice != null && r.finalPrice !== ""
                                    ? r.finalPrice
                                    : r.total
                                ).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </PriceBadge>
                            )}
                          </div>
                        </PTd>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState>No patient records to display</EmptyState>
                    </td>
                  </tr>
                )}
              </tbody>
            </PrintTable>
          </TableWrapper>
        )}
      </ContentCard>
    </PageWrapper>
  );
};


export default RDPrint;
