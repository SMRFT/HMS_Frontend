import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Printer,
  Calendar,
  FileText,
  Activity,
  User,
  Stethoscope,
  X,
  Pill,
  Bold,
  Mic,
  MicOff,
  Sparkles,
  RotateCcw,
  Globe,
  Volume2,
  ArrowUp,
  ArrowDown,
  Eye,
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import ICD11SearchComponent from "./ICD11SearchComponent";
import { PageWrapper, colors } from "../GlobalStyles";
import HighRiskBadge from "../Common/HighRiskBadge";
import PatientSearchModal from "../Common/PatientSearchModal";

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const T = {
  teal: colors.primary || "#0d9488",
  tealDk: "#0f766e",
  tealLt: "#ccfbf1",
  sky: "#0ea5e9",
  skyLt: "#e0f2fe",
  slate: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f8fafc",
  bgAlt: "#f1f5f9",
  white: "#ffffff",
  text: "#0f172a",
  textSm: "#475569",
  green: "#16a34a",
  amber: "#d97706",
  red: "#dc2626",
};

/* ─── Utility styles ─────────────────────────────────────────────────────── */
const S = {
  inner: { maxWidth: 1320, margin: "0 auto", paddingBottom: 40 },

  /* Header */
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    padding: "18px 24px",
    background: "white",
    borderRadius: 12,
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.04)",
  },
  pageTitle: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 22,
    fontWeight: 700,
    color: T.slate,
    letterSpacing: "-0.4px",
    margin: 0,
  },
  titleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: `linear-gradient(135deg, ${T.teal}, ${T.sky})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 4px 10px rgba(13, 148, 136, 0.25)",
  },
  datePill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: T.bgAlt,
    color: T.slate,
    border: `1px solid ${T.border}`,
    borderRadius: 20,
    padding: "6px 16px",
    fontSize: 13,
    fontWeight: 600,
  },

  /* Edit banner */
  editBanner: {
    background: T.skyLt,
    border: `1px solid ${T.sky}60`,
    borderRadius: 10,
    padding: "12px 18px",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    color: T.slate,
    fontWeight: 500,
    boxShadow: "0 2px 8px rgba(14, 165, 233, 0.1)",
  },

  /* Card */
  card: {
    background: T.white,
    borderRadius: 12,
    border: `1px solid ${T.border}`,
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.04)",
    marginBottom: 20,
    overflow: "hidden",
  },
  cardHead: {
    padding: "14px 20px",
    background: `linear-gradient(90deg, #f8fafc, #f1f5f9)`,
    borderBottom: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: T.teal,
  },
  cardHeadBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    background: `linear-gradient(${T.teal}, ${T.sky})`,
  },
  cardBody: { padding: "20px" },

  /* Compact grid */
  grid: (cols) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: "12px 14px",
    marginBottom: 14,
  }),

  /* Inputs & Selects */
  inp: {
    height: 36,
    padding: "0 11px",
    fontSize: 13,
    color: T.text,
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: 7,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    transition: "all .15s",
  },
  sel: {
    height: 36,
    padding: "0 28px 0 11px",
    fontSize: 13,
    color: T.text,
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: 7,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 8px center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "1.1em",
  },
  lbl: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: T.muted,
    marginBottom: 5,
    display: "block",
  },
  fld: { display: "flex", flexDirection: "column" },

  /* Search button inside input block */
  searchMicroBtn: {
    marginTop: 4,
    height: 28,
    padding: "0 12px",
    fontSize: 12,
    fontWeight: 600,
    background: `linear-gradient(135deg, ${T.teal}, ${T.sky})`,
    color: T.white,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "opacity 0.2s",
  },

  /* Notes layout */
  notesLayout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: 20,
    marginBottom: 24,
  },

  /* Sidebar */
  sidebar: {
    background: T.white,
    borderRadius: 12,
    border: `1px solid ${T.border}`,
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.04)",
    overflow: "hidden",
    alignSelf: "start",
  },
  sidebarHead: {
    padding: "14px 16px",
    background: `linear-gradient(135deg, ${T.slate}, #334155)`,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: T.white,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sidebarItem: (active) => ({
    padding: "9px 14px",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    color: active ? T.teal : T.textSm,
    background: active ? `${T.teal}10` : "transparent",
    borderLeft: `4px solid ${active ? T.teal : "transparent"}`,
    borderBottom: `1px solid ${T.border}`,
    transition: "all .15s",
    lineHeight: 1.35,
  }),

  /* Notes main area */
  notesCard: {
    background: T.white,
    borderRadius: 12,
    border: `1px solid ${T.border}`,
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.04)",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  notesActiveLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: T.teal,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  textarea: {
    minHeight: 520,
    resize: "vertical",
    padding: 14,
    fontSize: 13.5,
    color: T.text,
    background: T.bg,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    outline: "none",
    fontFamily: "inherit",
    lineHeight: 1.65,
    transition: "all .15s",
  },
  notesToolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 10px",
    background: "#f8fafc",
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    gap: 10,
    flexWrap: "wrap",
  },
  boldBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    fontSize: 12.5,
    fontWeight: 700,
    color: "#0f172a",
    background: "#ffffff",
    border: `1.5px solid #94a3b8`,
    borderRadius: 6,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    transition: "all .15s",
  },
  micBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    fontSize: 12.5,
    fontWeight: 700,
    color: "#0f766e",
    background: "#f0fdf4",
    border: "1.5px solid #86efac",
    borderRadius: 6,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    transition: "all .15s",
  },
  micBtnActive: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    fontSize: 12.5,
    fontWeight: 700,
    color: "#b91c1c",
    background: "#fef2f2",
    border: "1.5px solid #f87171",
    borderRadius: 6,
    cursor: "pointer",
    boxShadow: "0 0 0 3px rgba(239,68,68,0.25)",
    transition: "all .15s",
  },
  aiBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    fontSize: 12.5,
    fontWeight: 700,
    color: "#4338ca",
    background: "#eef2ff",
    border: "1.5px solid #a5b4fc",
    borderRadius: 6,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    transition: "all .15s",
  },
  undoBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all .15s",
  },
  listeningBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "7px 12px",
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    borderRadius: 6,
    fontSize: 12,
    color: "#991b1b",
    fontWeight: 600,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#ef4444",
    display: "inline-block",
    boxShadow: "0 0 0 2px rgba(239,68,68,0.4)",
  },
  toolbarHint: {
    fontSize: 11.5,
    color: T.muted,
  },
  tabGroup: {
    display: "flex",
    alignItems: "center",
    background: "#e2e8f0",
    padding: 2,
    borderRadius: 7,
    gap: 2,
  },
  tabBtn: {
    padding: "4px 12px",
    fontSize: 12,
    fontWeight: 600,
    color: T.muted,
    background: "transparent",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    transition: "all .15s",
  },
  tabBtnActive: {
    padding: "4px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: T.teal,
    background: "#ffffff",
    border: `1px solid ${T.border}`,
    borderRadius: 5,
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  previewBox: {
    minHeight: 520,
    padding: 16,
    fontSize: 13.5,
    color: T.text,
    background: "#ffffff",
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    lineHeight: 1.65,
    overflowY: "auto",
    whiteSpace: "pre-wrap",
  },

  /* Action row */
  actionRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  outBtn: (color) => ({
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 600,
    border: `1.5px solid ${color}`,
    color: color,
    background: "white",
    borderRadius: 7,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "all .15s",
  }),

  /* Primary/variant buttons */
  btn: (v = "primary") => {
    const map = {
      primary: {
        bg: `linear-gradient(135deg, ${T.teal}, ${T.sky})`,
        color: T.white,
      },
      danger: {
        bg: `linear-gradient(135deg, ${T.red}, #ef4444)`,
        color: T.white,
      },
      success: {
        bg: `linear-gradient(135deg, ${T.green}, #22c55e)`,
        color: T.white,
      },
      ghost: { bg: T.slate, color: T.white },
    };
    const s = map[v] || map.primary;
    return {
      padding: "8px 18px",
      fontSize: 13,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
      border: "none",
      borderRadius: 7,
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(0,0,0,.12)",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      transition: "opacity .15s",
    };
  },

  /* Table */
  tableWrap: {
    background: T.white,
    borderRadius: 12,
    border: `1px solid ${T.border}`,
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.04)",
    overflow: "hidden",
    marginTop: 28,
  },
  tableHead: {
    padding: "16px 20px",
    background: `linear-gradient(135deg, ${T.slate}, #334155)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tableTitle: { fontSize: 15, fontWeight: 700, color: T.white, display: "flex", alignItems: "center", gap: 8 },
  tableCount: { fontSize: 12, color: "rgba(255,255,255,.75)", fontWeight: 500 },
  filterBar: {
    padding: "14px 18px",
    background: T.bg,
    borderBottom: `1px solid ${T.border}`,
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1.2fr 1fr 1fr auto auto",
    gap: "10px 12px",
    alignItems: "end",
    marginBottom: 10,
  },
  filterGrid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 5fr",
    gap: "10px 12px",
    alignItems: "end",
  },
  th: {
    padding: "10px 14px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    color: T.muted,
    background: T.bg,
    borderBottom: `2px solid ${T.border}`,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "11px 14px",
    fontSize: 13,
    color: T.text,
    borderBottom: `1px solid ${T.border}`,
    verticalAlign: "middle",
  },

  /* Status badge */
  badge: (ok) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    background: ok ? `#dcfce7` : `#fef3c7`,
    color: ok ? `#15803d` : `#b45309`,
    border: `1px solid ${ok ? "#86efac" : "#fde68a"}`,
  }),
  dot: (ok) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: ok ? "#16a34a" : "#d97706",
  }),

  /* Modals */
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,.6)",
    backdropFilter: "blur(4px)",
    zIndex: 1050,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    background: T.white,
    borderRadius: 14,
    width: "min(700px, 94vw)",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 60px rgba(15,23,42,.25)",
    overflow: "hidden",
  },
  modalHead: {
    padding: "16px 20px",
    background: `linear-gradient(135deg, ${T.slate}, #334155)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  modalTitle: { fontSize: 15, fontWeight: 700, color: T.white, display: "flex", alignItems: "center", gap: 8 },
  modalClose: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(255,255,255,.15)",
    border: "none",
    color: T.white,
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: { padding: 18, overflowY: "auto", flexGrow: 1 },
  modalFoot: {
    padding: "14px 18px",
    borderTop: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    flexShrink: 0,
  },
  invCard: (sel, warn) => ({
    borderRadius: 9,
    padding: "12px 14px",
    marginBottom: 10,
    cursor: "pointer",
    border: sel
      ? `2px solid ${T.teal}`
      : warn
        ? `2px solid ${T.amber}`
        : `1.5px solid ${T.border}`,
    background: sel ? `${T.teal}0d` : warn ? `${T.amber}08` : T.white,
    transition: "all .15s",
  }),

  /* Table action button icon */
  actionBtn: (color = T.teal) => ({
    background: "white",
    border: `1px solid ${T.border}`,
    color: color,
    width: 32,
    height: 32,
    borderRadius: 6,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s",
  }),
};

/* ─── Tiny helpers ───────────────────────────────────────────────────────── */
const Fld = ({ label, children }) => (
  <div style={S.fld}>
    <span style={S.lbl}>{label}</span>
    {children}
  </div>
);

const CInp = ({ style, ...props }) => (
  <input
    style={{ ...S.inp, ...style }}
    onFocus={(e) => {
      e.target.style.borderColor = T.teal;
      e.target.style.boxShadow = `0 0 0 3px ${T.teal}18`;
    }}
    onBlur={(e) => {
      e.target.style.borderColor = T.border;
      e.target.style.boxShadow = "none";
    }}
    {...props}
  />
);

/* ─── fieldsData array helpers ───────────────────────────────────────────── */
const getFieldValue = (fieldsData, key) => {
  if (!Array.isArray(fieldsData)) return "";
  const entry = fieldsData.find((f) => f.key === key);
  return entry ? entry.value : "";
};
const setFieldValue = (fieldsData, key, value) => {
  const arr = Array.isArray(fieldsData) ? fieldsData : [];
  const idx = arr.findIndex((f) => f.key === key);
  if (idx === -1) return [...arr, { key, value }];
  const next = [...arr];
  next[idx] = { ...next[idx], value };
  return next;
};
const normalizeFieldsData = (fd) => {
  if (Array.isArray(fd)) return fd;
  if (fd && typeof fd === "object")
    return Object.entries(fd).map(([key, value]) => ({ key, value }));
  return [];
};
const sortFieldsDataByUiOrder = (fieldsArr, orderArr) => {
  if (!Array.isArray(fieldsArr) || fieldsArr.length <= 1) return fieldsArr || [];
  const orderList = Array.isArray(orderArr) && orderArr.length > 0 ? orderArr : [];
  if (orderList.length === 0) return fieldsArr;

  const orderMap = new Map();
  orderList.forEach((name, idx) => {
    if (name) {
      orderMap.set(String(name).trim().toUpperCase(), idx);
    }
  });

  return [...fieldsArr].sort((a, b) => {
    const keyA = String(a?.key || "").trim().toUpperCase();
    const keyB = String(b?.key || "").trim().toUpperCase();
    const idxA = orderMap.has(keyA) ? orderMap.get(keyA) : 99999;
    const idxB = orderMap.has(keyB) ? orderMap.get(keyB) : 99999;
    return idxA - idxB;
  });
};

/* ─── Render Formatted/Bold Text Helper ──────────────────────────────────── */
const renderFormattedText = (text) => {
  if (text == null || text === "" || !String(text).trim()) return "\u00A0";
  const regex = /(\*\*[\s\S]+?\*\*|<b>[\s\S]*?<\/b>|<strong>[\s\S]*?<\/strong>)/gi;
  const parts = String(text).split(regex);

  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} style={{ fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    const bMatch = part.match(/^<b>([\s\S]*?)<\/b>$/i);
    if (bMatch) {
      return (
        <strong key={index} style={{ fontWeight: 700 }}>
          {bMatch[1]}
        </strong>
      );
    }
    const strongMatch = part.match(/^<strong>([\s\S]*?)<\/strong>$/i);
    if (strongMatch) {
      return (
        <strong key={index} style={{ fontWeight: 700 }}>
          {strongMatch[1]}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

/* ─── Package.js style UI tokens & styling for Type Management ───────────── */
const pkgCss = {
  editBanner: {
    background: "linear-gradient(90deg, #0ea5e918, #0d948818)",
    border: "1px solid #0ea5e940",
    borderRadius: 10,
    padding: "10px 18px",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13.5,
    color: "#1E2D45",
    fontWeight: 500,
  },
  editBannerDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#0ea5e9",
    flexShrink: 0,
  },
  card: {
    background: "#ffffff",
    borderRadius: 14,
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 18px rgba(10,22,40,.05)",
    marginBottom: 18,
    padding: "18px 22px",
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: "#0d9488",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sectionLine: {
    width: 20,
    height: 3,
    borderRadius: 2,
    background: "linear-gradient(90deg, #0d9488, #0ea5e9)",
  },
  pickerPanel: {
    background: "#F8FAFC",
    border: "1.5px solid #E2E8F0",
    borderRadius: 12,
    padding: "16px",
    marginBottom: 18,
  },
  pickerTitle: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    color: "#0d9488",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addSelectedBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 18px",
    fontSize: 13,
    fontWeight: 600,
    background: "linear-gradient(135deg, #10B981, #34D399)",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,.12)",
    whiteSpace: "nowrap",
  },
  itemsTable: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 8,
  },
  itemsTh: {
    padding: "9px 12px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    color: "#64748B",
    background: "#F1F5F9",
    borderBottom: "2px solid #E2E8F0",
    textAlign: "left",
  },
  itemsTd: {
    padding: "8px 12px",
    fontSize: 13,
    color: "#0F172A",
    borderBottom: "1px solid #E2E8F0",
    verticalAlign: "middle",
  },
  countBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    background: "#0ea5e918",
    color: "#0284c7",
    border: "1px solid #0ea5e940",
  },
  statusBadge: (active = true) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    background: active ? "#10B98118" : "#EF444418",
    color: active ? "#10B981" : "#EF4444",
    border: `1px solid ${active ? "#10B98140" : "#EF444440"}`,
  }),
  statusDot: (active = true) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: active ? "#10B981" : "#EF4444",
  }),
  btn: (variant = "primary") => {
    const map = {
      primary: {
        bg: "linear-gradient(135deg, #0d9488, #0ea5e9)",
        color: "#ffffff",
      },
      danger: {
        bg: "linear-gradient(135deg, #EF4444, #F87171)",
        color: "#ffffff",
      },
      success: {
        bg: "linear-gradient(135deg, #10B981, #34D399)",
        color: "#ffffff",
      },
      ghost: { bg: "#1E2D45", color: "#ffffff" },
    };
    const v = map[variant] || map.primary;
    return {
      padding: "8px 18px",
      fontSize: 13,
      fontWeight: 600,
      background: v.bg,
      color: v.color,
      border: "none",
      borderRadius: 9,
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,.12)",
      letterSpacing: "0.2px",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    };
  },
  smallBtn: (variant = "primary") => {
    const map = {
      primary: {
        bg: "linear-gradient(135deg, #0d9488, #0ea5e9)",
        color: "#ffffff",
      },
      danger: {
        bg: "linear-gradient(135deg, #EF4444, #F87171)",
        color: "#ffffff",
      },
      success: {
        bg: "linear-gradient(135deg, #10B981, #34D399)",
        color: "#ffffff",
      },
      ghost: { bg: "#1E2D45", color: "#ffffff" },
      outline: {
        bg: "#ffffff",
        color: "#64748B",
        border: "1px solid #CBD5E1",
      },
    };
    const v = map[variant] || map.primary;
    return {
      padding: "5px 12px",
      fontSize: 12,
      fontWeight: 600,
      background: v.bg,
      color: v.color,
      border: v.border || "none",
      borderRadius: 7,
      cursor: "pointer",
      boxShadow: v.border ? "none" : "0 2px 6px rgba(0,0,0,.10)",
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
    };
  },
};

/* ─── Component ──────────────────────────────────────────────────────────── */
const Summary = () => {
  const currentDate = new Date().toLocaleDateString("en-GB");
  const [selectedField, setSelectedField] = useState("");
  const [summaries, setSummaries] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [showInvestigations, setShowInvestigations] = useState(false);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvestigations, setSelectedInvestigations] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingIpNo, setEditingIpNo] = useState(null);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [summaryTypeOptions, setSummaryTypeOptions] = useState([]);
  const [headingOptions, setHeadingOptions] = useState([]);

  // Summary Type Management state (same UI like Package.js)
  const [showManageSummaryTypeModal, setShowManageSummaryTypeModal] = useState(false);
  const [typeSearchFilter, setTypeSearchFilter] = useState("");
  const [showTypeFormModal, setShowTypeFormModal] = useState(false);
  const [isEditTypeMode, setIsEditTypeMode] = useState(false);
  const [editingTypeNo, setEditingTypeNo] = useState(null);
  const [typeFormData, setTypeFormData] = useState({
    summaryType: "",
    headings: [],
  });
  const [savingType, setSavingType] = useState(false);
  const [selectedHeadingToPick, setSelectedHeadingToPick] = useState("");
  const [headingPickerSearch, setHeadingPickerSearch] = useState("");
  const [viewTypeObj, setViewTypeObj] = useState(null);
  const [editingHeadingDefaultIndex, setEditingHeadingDefaultIndex] = useState(null);
  const [tempDefaultValue, setTempDefaultValue] = useState("");

  // Heading Master Management state (Add, Edit, Delete)
  const [showManageHeadingModal, setShowManageHeadingModal] = useState(false);
  const [headingInput, setHeadingInput] = useState("");
  const [editingHeading, setEditingHeading] = useState(null);
  const [headingSearchFilter, setHeadingSearchFilter] = useState("");
  const [savingHeading, setSavingHeading] = useState(false);

  // Consultant section doctors picker state
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");

  const [showMedicines, setShowMedicines] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [medicinesLoading, setMedicinesLoading] = useState(false);
  const [medicineModalType, setMedicineModalType] = useState("");
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]"
  );
  const canEdit = allowedActions.includes("HMS-P-SUME-RW");
  const canDelete = allowedActions.includes("HMS-P-SUMD-RW");
  const canApprove = allowedActions.includes("HMS-P-SUMA-RW");

  const [noteFields, setNoteFields] = useState([]);

  const emptyForm = {
    date: "",
    ipNo: "",
    uhid: "",
    patient: "",
    is_high_risk: false,
    high_risk_reason: "",
    doa: "",
    doaTime: "",
    dod: "",
    dodTime: "17:00",
    roomNo: "",
    age: "",
    surgeryDate: "",
    nextReviewDate: "",
    doctor: "",
    gender: "",
    summaryNo: "",
    summaryType: "",
    headingNo: "",
    heading: "",
    address: "",
    diseaseCode: "",
    disease: "",
    specialNeeds: "",
    vaccinationHistory: "",
    dischargeType: "",
    admissionDiagnosis: "",
    dischargeDiagnosis: "",
    consultant: "",
    briefHistory: "",
    pastMedicalHistory: "",
    generalExamination: "",
    vitals: "",
    hospitalCourse: "",
    investigations: "",
    proceduresPerformed: "",
    specificMedications: "",
    conditionOnDischarge: "",
    adviceOnDischarge: "",
    notes: "",
    fieldsData: [],
    currentField: "",
    approve: false,
    approve_time: null,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [notesTab, setNotesTab] = useState("edit");
  const notesRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [previousNotes, setPreviousNotes] = useState(null);
  const [speechLang, setSpeechLang] = useState("en-IN");
  const [micBoost, setMicBoost] = useState(true);
  const gainNodeRef = useRef(null);
  const [speechStatus, setSpeechStatus] = useState("Listening… Speak into your microphone");
  const [audioLevel, setAudioLevel] = useState(0);

  const toggleMicBoost = () => {
    setMicBoost((prev) => {
      const next = !prev;
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = next ? 3.0 : 1.0;
      }
      return next;
    });
  };

  // AI Summarize Review & Edit Modal state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiModalOriginalText, setAiModalOriginalText] = useState("");
  const [aiModalSummarizedText, setAiModalSummarizedText] = useState("");
  const [aiModalRawSummary, setAiModalRawSummary] = useState("");
  const [aiModalField, setAiModalField] = useState("");
  const [aiModalTab, setAiModalTab] = useState("edit");
  const recognitionRef = useRef(null);
  const speechBaseTextRef = useRef("");
  const audioContextRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioAnimRef = useRef(null);

  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, []);

  const fetchDoctors = async () => {
    const r = await apiRequest(`${HMSURL}doctor_list_diagnostics/`, "GET");
    if (r.success) {
      setDoctors(
        (r.data || []).map((doc) => ({
          ...doc,
          employeeName: (doc.employeeName || "").toUpperCase(),
        }))
      );
    }
  };

  const fetchSummaryTypes = async () => {
    const r = await apiRequest(`${HMSURL}summary-type/`, "GET");
    if (r.success) setSummaryTypeOptions(r.data);
  };

  const fetchSummaryHeadings = async () => {
    const r = await apiRequest(`${HMSURL}summary-heading/`, "GET");
    if (r.success) setHeadingOptions(r.data);
  };

  useEffect(() => {
    fetchDoctors();
    fetchSummaryTypes();
    fetchSummaryHeadings();
  }, [HMSURL]);

  // Derive Clinical Notes fields strictly from the selected Summary Type's headings
  useEffect(() => {
    if (!formData.summaryNo && !formData.summaryType) {
      setNoteFields([]);
      return;
    }
    const found = summaryTypeOptions.find(
      (t) =>
        (formData.summaryNo && String(t.summaryNo) === String(formData.summaryNo)) ||
        (formData.summaryType &&
          t.summaryType &&
          t.summaryType.trim().toUpperCase() === formData.summaryType.trim().toUpperCase())
    );
    if (found && Array.isArray(found.headings) && found.headings.length > 0) {
      const sorted = [...found.headings].sort(
        (a, b) => (Number(a.order_id) || 0) - (Number(b.order_id) || 0)
      );
      const fields = sorted
        .map((h) => (typeof h === "string" ? h : h.heading))
        .filter(Boolean);
      setNoteFields(fields);
      // Auto-select first field if no field currently selected or not in list
      if (fields.length > 0 && (!selectedField || !fields.includes(selectedField))) {
        handleButtonClick(fields[0]);
      }
    } else {
      setNoteFields([]);
      setSelectedField("");
    }
  }, [formData.summaryNo, formData.summaryType, summaryTypeOptions]);

  const getPredefinedValueForField = (fieldName) => {
    if (!fieldName) return "";
    const activeType = summaryTypeOptions.find(
      (t) =>
        (formData.summaryNo && String(t.summaryNo) === String(formData.summaryNo)) ||
        (formData.summaryType &&
          t.summaryType &&
          t.summaryType.trim().toUpperCase() === formData.summaryType.trim().toUpperCase())
    );
    if (!activeType || !Array.isArray(activeType.headings)) return "";
    const headingObj = activeType.headings.find(
      (h) => (typeof h === "object" ? h.heading : h)?.trim().toLowerCase() === fieldName.trim().toLowerCase()
    );
    return (typeof headingObj === "object" ? (headingObj.defaultValue || headingObj.default_value) : "") || "";
  };

  const handleSummaryTypeSelect = (e) => {
    const sNo = e.target.value;
    const found = summaryTypeOptions.find(
      (t) => String(t.summaryNo) === String(sNo)
    );
    setFormData((prev) => {
      let updatedFd = prev.fieldsData || [];
      let orderedHeadings = [];
      if (found && Array.isArray(found.headings)) {
        const sortedHeadings = [...found.headings].sort(
          (a, b) => (Number(a.order_id) || 0) - (Number(b.order_id) || 0)
        );
        orderedHeadings = sortedHeadings
          .map((h) => (typeof h === "string" ? h : h.heading))
          .filter(Boolean);
        sortedHeadings.forEach((h) => {
          const hName = typeof h === "string" ? h : h.heading;
          const defVal = typeof h === "object" ? (h.defaultValue || h.default_value || "") : "";
          if (hName && defVal) {
            const existingVal = getFieldValue(updatedFd, hName);
            if (!existingVal || !existingVal.trim()) {
              updatedFd = setFieldValue(updatedFd, hName, defVal);
            }
          }
        });
      }
      return {
        ...prev,
        summaryNo: sNo,
        summaryType: found ? found.summaryType : "",
        fieldsData: sortFieldsDataByUiOrder(updatedFd, orderedHeadings),
      };
    });
  };

  // ── Package.js style Type Management actions ──
  const openCreateType = () => {
    setTypeFormData({
      summaryType: "",
      headings: [],
    });
    setEditingHeadingDefaultIndex(null);
    setTempDefaultValue("");
    setIsEditTypeMode(false);
    setEditingTypeNo(null);
    setSelectedHeadingToPick("");
    setHeadingPickerSearch("");
    setShowTypeFormModal(true);
  };

  const openEditType = (t) => {
    const sortedHeadings = Array.isArray(t.headings)
      ? [...t.headings]
        .sort((a, b) => (Number(a.order_id) || 0) - (Number(b.order_id) || 0))
        .map((h, i) => ({
          order_id: i + 1,
          headingNo: h.headingNo || "",
          heading: h.heading || "",
          defaultValue: h.defaultValue || h.default_value || "",
        }))
      : [];
    setTypeFormData({
      summaryType: t.summaryType || "",
      headings: sortedHeadings,
    });
    setEditingHeadingDefaultIndex(null);
    setTempDefaultValue("");
    setIsEditTypeMode(true);
    setEditingTypeNo(t.summaryNo);
    setSelectedHeadingToPick("");
    setHeadingPickerSearch("");
    setShowTypeFormModal(true);
  };

  const openEditHeadingDefault = (index) => {
    const current = typeFormData.headings[index];
    if (!current) return;
    setEditingHeadingDefaultIndex(index);
    setTempDefaultValue(current.defaultValue || "");
  };

  const handleSaveHeadingDefault = () => {
    if (editingHeadingDefaultIndex === null) return;
    setTypeFormData((prev) => {
      const nextHeadings = [...prev.headings];
      if (nextHeadings[editingHeadingDefaultIndex]) {
        nextHeadings[editingHeadingDefaultIndex] = {
          ...nextHeadings[editingHeadingDefaultIndex],
          defaultValue: tempDefaultValue.trim(),
        };
      }
      return { ...prev, headings: nextHeadings };
    });
    setEditingHeadingDefaultIndex(null);
    setTempDefaultValue("");
  };

  const renderStatusToggle = ({ checked, onChange, disabled = false, title = "" }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        width: 38,
        height: 20,
        borderRadius: 10,
        background: checked ? "#10b981" : "#cbd5e1",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background-color 0.2s ease",
        padding: 2,
        outline: "none",
        flexShrink: 0,
      }}
      title={title || (checked ? "Click to Deactivate" : "Click to Activate")}
    >
      <span
        style={{
          display: "inline-block",
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.25)",
          transform: checked ? "translateX(18px)" : "translateX(0px)",
          transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </button>
  );

  const handleAddHeadingToType = (headingToAdd) => {
    const val = typeof headingToAdd === "string" ? headingToAdd : "";
    if (!val || !val.trim()) {
      Swal.fire("Validation", "Please select a heading to add.", "warning");
      return;
    }
    const cleanVal = val.trim();
    const matched = headingOptions.find(
      (h) => h.heading && h.heading.trim().toLowerCase() === cleanVal.toLowerCase()
    );
    if (matched && matched.is_active === false) {
      Swal.fire("Deactivated Heading", `"${cleanVal}" is deactivated and cannot be added to a type.`, "warning");
      return;
    }
    const alreadyExists = typeFormData.headings.some(
      (h) => h.heading && h.heading.trim().toLowerCase() === cleanVal.toLowerCase()
    );
    if (alreadyExists) {
      Swal.fire("Already Added", `"${cleanVal}" is already in this type.`, "info");
      return;
    }
    const newEntry = {
      order_id: typeFormData.headings.length + 1,
      headingNo: matched ? matched.headingNo : "",
      heading: cleanVal,
      defaultValue: "",
    };
    setTypeFormData((prev) => ({
      ...prev,
      headings: [...prev.headings, newEntry],
    }));
  };

  const handleRemoveHeadingFromType = (idxToRemove) => {
    setTypeFormData((prev) => {
      const remaining = prev.headings.filter((_, idx) => idx !== idxToRemove);
      const renumbered = remaining.map((h, idx) => ({
        ...h,
        order_id: idx + 1,
      }));
      return { ...prev, headings: renumbered };
    });
  };

  const handleMoveHeadingOrder = (index, direction) => {
    setTypeFormData((prev) => {
      const items = [...prev.headings];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIdx];
      items[targetIdx] = temp;
      const renumbered = items.map((h, idx) => ({
        ...h,
        order_id: idx + 1,
      }));
      return { ...prev, headings: renumbered };
    });
  };

  const handleSaveTypeSubmit = async (e) => {
    if (e) e.preventDefault();
    const typeName = typeFormData.summaryType.trim();
    if (!typeName) {
      Swal.fire("Validation", "Please enter a Summary Type name", "warning");
      return;
    }
    setSavingType(true);
    if (isEditTypeMode) {
      const r = await apiRequest(
        `${HMSURL}summary-type/update/${encodeURIComponent(editingTypeNo)}/`,
        "POST",
        {
          summaryType: typeName,
          headings: typeFormData.headings,
        }
      );
      setSavingType(false);
      if (r.success) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Summary Type updated successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
        if (
          String(formData.summaryNo) === String(editingTypeNo) ||
          formData.summaryType === typeName
        ) {
          setFormData((prev) => ({
            ...prev,
            summaryNo: editingTypeNo,
            summaryType: typeName,
          }));
        }
        setShowTypeFormModal(false);
        await fetchSummaryTypes();
      } else {
        Swal.fire("Error", r.error || "Failed to update summary type", "error");
      }
    } else {
      const r = await apiRequest(`${HMSURL}summary-type/`, "POST", {
        summaryType: typeName,
        headings: typeFormData.headings,
      });
      setSavingType(false);
      if (r.success) {
        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Summary Type created successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
        const created = r.data?.data;
        if (created) {
          setFormData((prev) => ({
            ...prev,
            summaryNo: created.summaryNo,
            summaryType: created.summaryType,
          }));
        }
        setShowTypeFormModal(false);
        await fetchSummaryTypes();
      } else {
        Swal.fire("Error", r.error || "Failed to create summary type", "error");
      }
    }
  };

  const handleToggleSummaryTypeStatus = async (t) => {
    const currentActive = t.is_active !== false;
    const newStatus = !currentActive;
    const r = await apiRequest(
      `${HMSURL}summary-type/update/${encodeURIComponent(t.summaryNo)}/`,
      "POST",
      { is_active: newStatus }
    );
    if (r.success) {
      setSummaryTypeOptions((prev) =>
        prev.map((item) =>
          String(item.summaryNo) === String(t.summaryNo)
            ? { ...item, is_active: newStatus }
            : item
        )
      );
      if (String(formData.summaryNo) === String(t.summaryNo) && !newStatus) {
        setFormData((prev) => ({ ...prev, summaryNo: "", summaryType: "" }));
      }
    } else {
      Swal.fire("Error", r.error || "Failed to update summary type status", "error");
    }
  };

  // ── Headings Master (Add, Edit, Delete) Actions ──
  const handleOpenHeadingModule = () => {
    setHeadingInput("");
    setEditingHeading(null);
    setHeadingSearchFilter("");
    setShowManageHeadingModal(true);
  };

  const handleEditHeadingClick = (h) => {
    setEditingHeading(h);
    setHeadingInput(h.heading);
  };

  const handleCancelEditHeading = () => {
    setEditingHeading(null);
    setHeadingInput("");
  };

  const handleSaveHeading = async (e) => {
    if (e) e.preventDefault();
    const val = headingInput.trim();
    if (!val) {
      Swal.fire("Validation", "Please enter a heading name", "warning");
      return;
    }
    setSavingHeading(true);

    if (editingHeading) {
      // Update
      const r = await apiRequest(
        `${HMSURL}summary-heading/update/${encodeURIComponent(editingHeading.headingNo)}/`,
        "POST",
        { heading: val }
      );
      setSavingHeading(false);
      if (r.success) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: `Heading updated to "${val}"`,
          timer: 1500,
          showConfirmButton: false,
        });

        // Update in typeFormData.headings if present
        setTypeFormData((prev) => ({
          ...prev,
          headings: (prev.headings || []).map((h) =>
            String(h.headingNo) === String(editingHeading.headingNo) ||
              h.heading === editingHeading.heading
              ? { ...h, heading: val }
              : h
          ),
        }));

        // Update in main form if currently selected
        if (
          String(formData.headingNo) === String(editingHeading.headingNo) ||
          formData.heading === editingHeading.heading
        ) {
          setFormData((prev) => ({ ...prev, heading: val }));
        }

        setEditingHeading(null);
        setHeadingInput("");
        await fetchSummaryHeadings();
        await fetchSummaryTypes();
      } else {
        Swal.fire("Error", r.error || "Failed to update heading", "error");
      }
    } else {
      // Add
      const r = await apiRequest(`${HMSURL}summary-heading/`, "POST", {
        heading: val,
      });
      setSavingHeading(false);
      if (r.success) {
        const created = r.data?.data;
        Swal.fire({
          icon: "success",
          title: "Created",
          text: `Heading "${val}" added to Headings table!`,
          timer: 1500,
          showConfirmButton: false,
        });
        setHeadingInput("");
        await fetchSummaryHeadings();
        // If Type Form modal is open, auto-add to the Type
        if (showTypeFormModal && created) {
          handleAddHeadingToType(created.heading);
        }
      } else {
        Swal.fire("Error", r.error || "Failed to add heading", "error");
      }
    }
  };

  const handleToggleHeadingStatus = async (h) => {
    const currentActive = h.is_active !== false;
    const newStatus = !currentActive;
    const r = await apiRequest(
      `${HMSURL}summary-heading/update/${encodeURIComponent(h.headingNo)}/`,
      "POST",
      { is_active: newStatus }
    );
    if (r.success) {
      setHeadingOptions((prev) =>
        prev.map((item) =>
          String(item.headingNo) === String(h.headingNo)
            ? { ...item, is_active: newStatus }
            : item
        )
      );
    } else {
      Swal.fire("Error", r.error || "Failed to update heading status", "error");
    }
  };



  const fetchSummaries = async (params = {}) => {
    const q = new URLSearchParams();
    if (params.fromDate) q.append("fromDate", params.fromDate);
    if (params.toDate) q.append("toDate", params.toDate);
    if (params.summaryType) q.append("summaryType", params.summaryType);
    const url = `${HMSURL}summaries/${q.toString() ? "?" + q.toString() : ""}`;
    const r = await apiRequest(url, "GET");
    if (r.success) setSummaries(r.data);
  };

  useEffect(() => {
    fetchSummaries({
      fromDate: new Date().toISOString().split("T")[0],
      toDate: new Date().toISOString().split("T")[0],
    });
  }, []);

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");

  const openIpSearchModal = () => {
    setPatientSearchQuery(formData.ipNo || "");
    setShowPatientModal(true);
  };

  const checkSummaryExists = async (ip) => {
    if (!ip?.trim()) return false;
    try {
      const checkRes = await apiRequest(
        `${HMSURL}check-summary-exists/${encodeURIComponent(ip.trim())}/`,
        "GET"
      );
      if (checkRes.success && checkRes.data?.exists) {
        Swal.fire({
          icon: "warning",
          title: "Discharge Summary already exist with this IP number",
          confirmButtonColor: "#0d9488",
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error checking summary existence:", err);
      return false;
    }
  };

  const handlePatientSelect = async (item) => {
    const selectedIp = item.ipNumber || item.ip_number || "";
    if (selectedIp) {
      if (!isEditMode) {
        const exists = await checkSummaryExists(selectedIp);
        if (exists) {
          return;
        }
      }
      setFormData((prev) => ({ ...prev, ipNo: selectedIp }));
      fetchIpPatient(selectedIp);
    }
  };

  const fetchIpPatient = async (overrideIp) => {
    const ip = typeof overrideIp === "string" ? overrideIp : formData.ipNo;
    if (!ip?.trim()) {
      Swal.fire("Validation Error", "Please enter IP Number", "warning");
      return;
    }
    const cleanIp = ip.trim();

    if (!isEditMode) {
      const exists = await checkSummaryExists(cleanIp);
      if (exists) {
        setFormData((prev) => ({
          ...prev,
          ipNo: "",
          uhid: "",
          patient: "",
          age: "",
          gender: "",
          roomNo: "",
          doa: "",
          doaTime: "",
          doctor: "",
          address: "",
        }));
        return;
      }
    }

    const r = await apiRequest(
      `${HMSURL}ip-patient/${encodeURIComponent(cleanIp)}/`,
      "GET"
    );
    if (r.success) {
      const d = r.data;
      const fullName =
        `${d.salutation || ""} ${d.firstName || ""} ${d.lastName || ""}`
          .trim()
          .replace(/\s+/g, " ");
      const fullAddress = [d.area, d.city, d.state].filter(Boolean).join(", ");
      setFormData((prev) => ({
        ...prev,
        uhid: d.uhid || "",
        patient: fullName,
        age: d.age || "",
        gender: d.gender || "",
        roomNo: d.roomNo || "",
        doa: d.admissionDate || "",
        doaTime: d.admissionTime || "",
        doctor: (d.admittingDoctor || "").toUpperCase(),
        address: fullAddress,
        is_high_risk: Boolean(d.is_high_risk),
        high_risk_reason: d.high_risk_reason || "",
      }));
    } else {
      Swal.fire("Error", "Patient not found for the entered IP Number", "error");
    }
  };

  useEffect(() => {
    if (location.state?.ipNo) {
      setFormData((prev) => ({ ...prev, ipNo: location.state.ipNo }));
      fetchIpPatient(location.state.ipNo);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const fetchInvestigations = async () => {
    if (!formData.ipNo?.trim()) {
      Swal.fire("Validation Error", "Please enter a valid IP Number first", "warning");
      return;
    }
    setLoading(true);
    setInvestigations([]);
    setSelectedInvestigations([]);
    const r = await apiRequest(
      `${HMSURL}patient-investigations/${encodeURIComponent(formData.ipNo)}/`,
      "GET"
    );
    setLoading(false);
    if (r.success && Array.isArray(r.data) && r.data.length > 0) {
      setInvestigations(r.data);
      setShowInvestigations(true);
    } else {
      Swal.fire("Info", "No investigations found for this patient", "info");
    }
  };

  const toggleInvestigationSelection = (inv) => {
    setSelectedInvestigations((prev) => {
      const exists = prev.some(
        (i) =>
          i.reportType === inv.reportType &&
          i.investigation === inv.investigation
      );
      return exists
        ? prev.filter(
          (i) =>
            !(
              i.reportType === inv.reportType &&
              i.investigation === inv.investigation
            )
        )
        : [...prev, inv];
    });
  };

  const addInvestigationsToNotes = () => {
    if (!selectedInvestigations.length) {
      Swal.fire("Warning", "Please select at least one investigation", "warning");
      return;
    }
    let text = "INVESTIGATIONS:\n";
    selectedInvestigations.forEach((inv, idx) => {
      if (idx > 0) text += "\n---------------------\n";
      text += `${inv.reportType}: \n${inv.investigation || "No details available"}\n\nImpression: \n${inv.impression || "No impression available"}\n`;
    });
    if (formData.currentField === "INVESTIGATIONS") {
      setFormData((prev) => ({
        ...prev,
        notes: prev.notes ? `${prev.notes}\n\n${text}` : text,
      }));
    } else {
      setFormData((prev) => {
        const fd = setFieldValue(
          prev.fieldsData,
          prev.currentField,
          prev.notes
        );
        const existing = getFieldValue(fd, "INVESTIGATIONS");
        const merged = existing ? `${existing}\n\n${text}` : text;
        const fdWith = setFieldValue(fd, "INVESTIGATIONS", merged);
        return {
          ...prev,
          fieldsData: fdWith,
          currentField: "INVESTIGATIONS",
          notes: merged,
        };
      });
      setSelectedField("INVESTIGATIONS");
    }
    setShowInvestigations(false);
    setSelectedInvestigations([]);
  };

  const fetchMedicines = async () => {
    if (!formData.ipNo?.trim()) {
      Swal.fire("Validation Error", "Please enter a valid IP Number first", "warning");
      return;
    }
    setMedicinesLoading(true);
    setMedicines([]);
    setSelectedMedicines([]);
    const r = await apiRequest(
      `${HMSURL}patient-medicines/${encodeURIComponent(formData.ipNo)}/`,
      "GET"
    );
    setMedicinesLoading(false);
    if (r.success && Array.isArray(r.data) && r.data.length > 0) {
      setMedicines(r.data);
      setMedicineModalType("admission");
      setShowMedicines(true);
    } else {
      Swal.fire("Info", "No medicines found for this patient", "info");
    }
  };

  const fetchDischargeMedicines = async () => {
    if (!formData.ipNo?.trim()) {
      Swal.fire("Validation Error", "Please enter a valid IP Number first", "warning");
      return;
    }
    setMedicinesLoading(true);
    setMedicines([]);
    setSelectedMedicines([]);
    const r = await apiRequest(
      `${HMSURL}patient-discharge-medicines/${encodeURIComponent(formData.ipNo)}/`,
      "GET"
    );
    setMedicinesLoading(false);
    if (r.success && Array.isArray(r.data) && r.data.length > 0) {
      setMedicines(r.data);
      setMedicineModalType("discharge");
      setShowMedicines(true);
    } else {
      Swal.fire("Info", "No medicines found for this patient", "info");
    }
  };

  const toggleMedicineSelection = (med, idx) => {
    setSelectedMedicines((prev) => {
      const exists = prev.some((m) => m._idx === idx);
      return exists
        ? prev.filter((m) => m._idx !== idx)
        : [...prev, { ...med, _idx: idx }];
    });
  };

  const addMedicinesToNotes = () => {
    if (!selectedMedicines.length) {
      Swal.fire("Warning", "Please select at least one medicine", "warning");
      return;
    }
    const isDischarge = medicineModalType === "discharge";
    const header = isDischarge
      ? "DISCHARGE MEDICINES:"
      : "MEDICINES USED ON ADMISSION:";
    const targetField = isDischarge
      ? "ADVICE ON DISCHARGE"
      : "SPECIFIC MEDICATION GIVEN DURING HOSPITAL STAY";
    const rows = selectedMedicines
      .map(
        (m) =>
          `• ${m.itemName}  |  Dosage: ${m.dosage || "—"}  |  Days: ${m.noOfDays || "—"}  |  Unit: ${m.doseUnit || "—"}${m.route ? "  |  Route: " + m.route : ""}${m.remark && m.remark !== "Nil" ? "  |  Remark: " + m.remark : ""}`
      )
      .join("\n");
    const newBlock = `${header}\n${rows}`;
    setFormData((prev) => {
      const fd = setFieldValue(prev.fieldsData, prev.currentField, prev.notes);
      const existing = getFieldValue(fd, targetField);
      const merged = existing ? `${existing}\n${newBlock}` : newBlock;
      const fdWith = setFieldValue(fd, targetField, merged);
      return {
        ...prev,
        fieldsData: fdWith,
        currentField: targetField,
        notes: merged,
      };
    });
    setSelectedField(targetField);
    setShowMedicines(false);
    setSelectedMedicines([]);
  };

  const handleAddDoctorToConsultant = (docName) => {
    const rawName = (docName || "").trim().toUpperCase();
    if (!rawName) return;

    setFormData((prev) => {
      const curNotes = (prev.notes || "").trim();
      let newNotes = "";
      if (!curNotes) {
        newNotes = rawName;
      } else {
        const lines = curNotes.split("\n").map((l) => l.trim().toUpperCase());
        if (lines.includes(rawName)) {
          return prev;
        }
        newNotes = `${curNotes}\n${rawName}`;
      }
      const targetField = prev.currentField || "CONSULTANT";
      const updatedFD = setFieldValue(prev.fieldsData, targetField, newNotes);
      return {
        ...prev,
        notes: newNotes,
        fieldsData: updatedFD,
      };
    });
  };

  const handleToggleDoctorInConsultant = (docName) => {
    const rawName = (docName || "").trim().toUpperCase();
    if (!rawName) return;

    setFormData((prev) => {
      const curNotes = (prev.notes || "").trim();
      let newNotes = "";
      if (!curNotes) {
        newNotes = rawName;
      } else {
        const lines = curNotes.split("\n");
        const matchIdx = lines.findIndex(
          (l) => l.trim().toUpperCase() === rawName
        );
        if (matchIdx !== -1) {
          lines.splice(matchIdx, 1);
          newNotes = lines.join("\n").trim();
        } else {
          newNotes = `${curNotes}\n${rawName}`;
        }
      }
      const targetField = prev.currentField || "CONSULTANT";
      const updatedFD = setFieldValue(prev.fieldsData, targetField, newNotes);
      return {
        ...prev,
        notes: newNotes,
        fieldsData: updatedFD,
      };
    });
  };

  const isDoctorIncludedInNotes = (docName) => {
    const raw = (docName || "").trim().toUpperCase();
    if (!raw) return false;
    const lines = (formData.notes || "")
      .split("\n")
      .map((l) => l.trim().toUpperCase());
    return lines.includes(raw);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "file" ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  const handleToggleBold = () => {
    if (notesTab !== "edit") {
      setNotesTab("edit");
    }
    const textarea = notesRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.notes || "";
    const selected = text.substring(start, end);

    // 1. If selection itself is wrapped in **...**
    if (
      selected.startsWith("**") &&
      selected.endsWith("**") &&
      selected.length >= 4
    ) {
      const unwrapped = selected.slice(2, -2);
      const newText = text.substring(0, start) + unwrapped + text.substring(end);
      setFormData((prev) => ({
        ...prev,
        notes: newText,
        fieldsData: setFieldValue(prev.fieldsData, prev.currentField, newText),
      }));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + unwrapped.length);
      }, 0);
      return;
    }

    // 2. If outer characters are **
    const before = text.substring(Math.max(0, start - 2), start);
    const after = text.substring(end, Math.min(text.length, end + 2));
    if (before === "**" && after === "**") {
      const newText =
        text.substring(0, start - 2) + selected + text.substring(end + 2);
      setFormData((prev) => ({
        ...prev,
        notes: newText,
        fieldsData: setFieldValue(prev.fieldsData, prev.currentField, newText),
      }));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start - 2, end - 2);
      }, 0);
      return;
    }

    // 3. Wrap selection in **
    if (selected.length > 0) {
      const wrapped = `**${selected}**`;
      const newText = text.substring(0, start) + wrapped + text.substring(end);
      setFormData((prev) => ({
        ...prev,
        notes: newText,
        fieldsData: setFieldValue(prev.fieldsData, prev.currentField, newText),
      }));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, end + 2);
      }, 0);
    } else {
      // 4. No selection: insert **bold text** with 'bold text' selected
      const placeholder = "bold text";
      const insertion = `**${placeholder}**`;
      const newText = text.substring(0, start) + insertion + text.substring(end);
      setFormData((prev) => ({
        ...prev,
        notes: newText,
        fieldsData: setFieldValue(prev.fieldsData, prev.currentField, newText),
      }));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2 + placeholder.length);
      }, 0);
    }
  };

  const handleNotesKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      handleToggleBold();
    }
  };


  /* ─── Voice-to-Text Microphone Dictation ─── */
  const stopAllSpeech = () => {
    isListeningRef.current = false;
    setIsListening(false);
    setAudioLevel(0);
    setSpeechStatus("Stopped");

    if (audioAnimRef.current) {
      cancelAnimationFrame(audioAnimRef.current);
      audioAnimRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch { }
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch { }
      recognitionRef.current = null;
    }
  };

  const startAudioMeter = (stream, boost = true) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);

      // Web Audio Gain Node for low-voice sensitivity boost
      const gainNode = ctx.createGain();
      gainNode.gain.value = boost ? 3.0 : 1.0;
      gainNodeRef.current = gainNode;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.2;

      source.connect(gainNode);
      gainNode.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!isListeningRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);
        audioAnimRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();
    } catch (e) {
      console.warn("Could not start audio meter:", e);
    }
  };

  const initRecognition = (lang) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setSpeechStatus("Microphone ready. Dictate your notes now…");
    };

    recognition.onaudiostart = () => {
      setSpeechStatus("Microphone active. Waiting for voice…");
    };

    recognition.onsoundstart = () => {
      setSpeechStatus("Sound detected…");
    };

    recognition.onspeechstart = () => {
      setSpeechStatus("Speech detected! Transcribing…");
    };

    recognition.onspeechend = () => {
      setSpeechStatus("Processing speech…");
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript + " ";
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      let combined = (finalTranscript + interimTranscript);
      combined = combined
        .replace(/\b(full stop|period)\b/gi, ".")
        .replace(/\b(comma)\b/gi, ",")
        .replace(/\b(colon)\b/gi, ":")
        .replace(/\b(semicolon)\b/gi, ";")
        .replace(/\b(next line|new line)\b/gi, "\n")
        .replace(/\b(hyphen|dash)\b/gi, "-");

      const base = speechBaseTextRef.current;
      const separator =
        base && !base.endsWith("\n") && !base.endsWith(" ") ? " " : "";
      const fullText = base ? base + separator + combined : combined;

      setFormData((prev) => ({
        ...prev,
        notes: fullText,
        fieldsData: setFieldValue(prev.fieldsData, prev.currentField, fullText),
      }));

      setSpeechStatus(
        interimTranscript
          ? `Transcribing: "${interimTranscript.slice(-30)}"`
          : "Listening… Speak clearly"
      );

      if (notesRef.current) {
        notesRef.current.scrollTop = notesRef.current.scrollHeight;
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        setSpeechStatus("No voice heard. Keep speaking into the microphone…");
        return;
      }
      if (event.error === "network") {
        setSpeechStatus("Network error: Chrome cannot contact Google Speech Services. Please check internet connection.");
        Swal.fire({
          icon: "error",
          title: "Speech Recognition Network Error",
          text: "Chrome speech recognition requires an active internet connection to contact Google Speech Services. Please check your network connection.",
        });
        stopAllSpeech();
        return;
      }
      if (event.error === "not-allowed") {
        Swal.fire({
          icon: "error",
          title: "Microphone Access Denied",
          text: "Please click the microphone icon in your browser address bar and allow microphone permissions.",
        });
        stopAllSpeech();
        return;
      }
      if (event.error === "audio-capture") {
        Swal.fire({
          icon: "error",
          title: "Audio Capture Error",
          text: "Could not capture audio from your microphone. Please check your Windows default microphone settings.",
        });
        stopAllSpeech();
        return;
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch { }
      } else {
        stopAllSpeech();
      }
    };

    return recognition;
  };

  const toggleSpeechRecognition = async () => {
    if (!selectedField) {
      Swal.fire({
        icon: "info",
        title: "Select Field First",
        text: "Please select a clinical field from the sidebar before dictating notes.",
      });
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      Swal.fire({
        icon: "warning",
        title: "Speech Recognition Unavailable",
        text: "Your browser does not support Web Speech Recognition. Please use Google Chrome or Microsoft Edge to dictate clinical notes.",
      });
      return;
    }

    if (isListening) {
      stopAllSpeech();
      return;
    }

    try {
      let stream = null;
      const audioConstraints = {
        audio: {
          autoGainControl: true,       // Boost soft/low-volume voices via hardware/OS AGC
          noiseSuppression: false,     // Disable aggressive noise gating that cuts off whispers/soft speech
          echoCancellation: true,
          channelCount: 1,
        },
      };

      try {
        stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        audioStreamRef.current = stream;
      } catch (constraintErr) {
        console.warn("Audio constraints not supported, fallback to basic audio: true", constraintErr);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStreamRef.current = stream;
        } catch (permErr) {
          console.error("Microphone permission error:", permErr);
          Swal.fire({
            icon: "error",
            title: "Microphone Blocked",
            text: "Microphone access was denied or not found. Please click the lock/settings icon in the browser URL bar to allow microphone access.",
          });
          return;
        }
      }

      isListeningRef.current = true;
      setIsListening(true);
      speechBaseTextRef.current = formData.notes || "";
      setSpeechStatus("Initializing microphone…");

      if (stream) {
        startAudioMeter(stream, micBoost);
      }

      const recognition = initRecognition(speechLang);
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      stopAllSpeech();
      Swal.fire({
        icon: "error",
        title: "Microphone Error",
        text: "Could not activate microphone: " + (err.message || err),
      });
    }
  };

  const handleLanguageChange = (newLang) => {
    setSpeechLang(newLang);
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch { }
      const rec = initRecognition(newLang);
      recognitionRef.current = rec;
      rec.start();
    }
  };

  /* ─── AI Summarize / Refine Notes ─── */
  const handleAiSummarize = async () => {
    if (!formData.notes || !formData.notes.trim()) {
      Swal.fire({
        icon: "info",
        title: "No Notes to Summarize",
        text: "Please enter or dictate some clinical notes first.",
      });
      return;
    }

    if (isListening) {
      stopAllSpeech();
    }

    setIsSummarizing(true);
    const activeField = selectedField || formData.currentField || "CLINICAL NOTES";

    try {
      const response = await apiRequest(`${HMSURL}ai-summarize-notes/`, "POST", {
        text: formData.notes,
        field: activeField,
        patient_name: formData.patient || "",
        ip_no: formData.ipNo || "",
      });

      const summarized = response?.data?.summarized || response?.summarized;
      if (response && response.success && summarized) {
        // Open review modal with original and AI-improvised text (do NOT overwrite actual sentence yet)
        setAiModalOriginalText(formData.notes);
        setAiModalSummarizedText(summarized);
        setAiModalRawSummary(summarized);
        setAiModalField(activeField);
        setAiModalTab("edit");
        setShowAiModal(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "AI Improvisation Failed",
          text: response?.error || response?.data?.error || "The AI model could not improvise the notes. Please try again.",
        });
      }
    } catch (err) {
      console.error("Backend AI summarize failed:", err);
      Swal.fire({
        icon: "error",
        title: "AI Service Error",
        text: (err && err.message) || "Unable to reach the AI service. Please ensure the backend server and Gemini API key are active.",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  /* ─── Proceed button inside AI Modal: applies summary to actual notes ─── */
  const handleProceedAiSummary = () => {
    if (!aiModalSummarizedText || !aiModalSummarizedText.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Empty Notes",
        text: "The summarized text is empty. Please enter or keep some text before proceeding.",
      });
      return;
    }

    // Save previous notes so user can revert via Undo button if needed
    setPreviousNotes(formData.notes);

    // Apply the edited AI summary to the actual clinical notes and fieldsData
    setFormData((prev) => ({
      ...prev,
      notes: aiModalSummarizedText,
      fieldsData: setFieldValue(
        prev.fieldsData,
        prev.currentField,
        aiModalSummarizedText
      ),
    }));

    setShowAiModal(false);

    Swal.fire({
      icon: "success",
      title: "Notes Updated",
      text: "Clinical notes have been updated with the AI summary.",
      timer: 1600,
      showConfirmButton: false,
    });
  };

  const handleUndoAi = () => {
    if (previousNotes == null) return;
    const restored = previousNotes;
    setPreviousNotes(null);
    setFormData((prev) => ({
      ...prev,
      notes: restored,
      fieldsData: setFieldValue(prev.fieldsData, prev.currentField, restored),
    }));
    Swal.fire({
      icon: "info",
      title: "Reverted",
      text: "Restored previous notes text.",
      timer: 1400,
      showConfirmButton: false,
    });
  };

  const handleButtonClick = (fieldName) => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { }
      setIsListening(false);
    }
    setPreviousNotes(null);
    setSelectedField(fieldName);
    setFormData((prev) => {
      let fd = setFieldValue(prev.fieldsData, prev.currentField, prev.notes);
      let val = getFieldValue(fd, fieldName);
      if (fieldName === "DOA AND DOD") {
        if (!val || !val.trim() || (!val.includes("\n") && /DOA\s*:.*DOD\s*:/i.test(val))) {
          const dStr = prev.doa ? fmtDate(prev.doa) : "—";
          const tStr = prev.doaTime || "";
          const dodStr = prev.dod ? fmtDate(prev.dod) : "—";
          const dodTStr = prev.dodTime || "";
          const doaLine = `DOA : ${dStr} ${tStr}`.trim();
          const dodLine = `DOD : ${dodStr} ${dodTStr}`.trim();
          val = `${doaLine}\n${dodLine}`;
          fd = setFieldValue(fd, fieldName, val);
        }
      } else if (!val || !val.trim()) {
        const defVal = getPredefinedValueForField(fieldName);
        if (defVal) {
          val = defVal;
          fd = setFieldValue(fd, fieldName, val);
        }
      }
      return {
        ...prev,
        fieldsData: sortFieldsDataByUiOrder(fd, noteFields),
        currentField: fieldName,
        notes: val || "",
      };
    });
    notesRef.current?.focus();
  };

  const prepareDiseasesPayload = () => {
    if (!selectedDiseases.length) return { diseaseCode: "", disease: "" };
    return {
      diseaseCode: selectedDiseases.map((d) => d.code).join(", "),
      disease: selectedDiseases.map((d) => d.name).join("; "),
    };
  };

  const handleSubmit = async () => {
    let fds = formData.fieldsData || [];
    if (formData.currentField && formData.notes) {
      fds = setFieldValue(
        formData.fieldsData,
        formData.currentField,
        formData.notes
      );
      setFormData((prev) => ({ ...prev, fieldsData: sortFieldsDataByUiOrder(fds, noteFields) }));
    }
    const dp = prepareDiseasesPayload();
    const sortedFields = sortFieldsDataByUiOrder(
      fds.filter((f) => f.key !== "undefined" && f.value !== ""),
      noteFields
    );
    const payload = {
      ...formData,
      summaryType: undefined,
      heading: (formData.heading || "").trim(),
      headingNo: undefined,
      date: new Date().toISOString(),
      diseaseCode: dp.diseaseCode,
      disease: dp.disease,
      selectedDiseases,
      fieldsData: sortedFields,
    };
    const r = await apiRequest(`${HMSURL}summaries/create/`, "POST", payload);
    if (r.success) {
      Swal.fire("Success", "Summary successfully created!", "success");
      resetForm();
      await fetchSummaries({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        summaryType: filters.summaryType,
      });
    } else {
      Swal.fire("Error", r.error || "Failed to submit summary.", "error");
    }
  };

  const handleUpdate = async () => {
    const fd = setFieldValue(
      formData.fieldsData,
      formData.currentField,
      formData.notes
    );
    const filtered = fd.filter(
      (f) => f.value !== undefined && f.value !== "" && f.key !== "undefined"
    );
    if (!filtered.length) {
      Swal.fire("Validation Error", "Please fill in the required fields.", "warning");
      return;
    }
    const sortedFields = sortFieldsDataByUiOrder(filtered, noteFields);
    const dp = prepareDiseasesPayload();
    const r = await apiRequest(
      `${HMSURL}update-summary/${editingIpNo}/`,
      "PATCH",
      {
        ...formData,
        summaryType: undefined,
        heading: (formData.heading || "").trim(),
        headingNo: undefined,
        diseaseCode: dp.diseaseCode,
        disease: dp.disease,
        selectedDiseases,
        fieldsData: sortedFields,
      }
    );
    if (r.success) {
      Swal.fire("Success", "Summary updated successfully!", "success");
      resetForm();
      await fetchSummaries({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        summaryType: filters.summaryType,
      });
    } else {
      Swal.fire("Error", `Failed to update summary: ${r.error || "Unknown error"}`, "error");
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setSelectedField("");
    setIsEditMode(false);
    setEditingIpNo(null);
    setSelectedDiseases([]);
  };

  const handleEdit = async (ipNo) => {
    const r = await apiRequest(
      `${HMSURL}get-editsummary/${encodeURIComponent(ipNo)}/`,
      "GET"
    );
    if (r.success) {
      const d = r.data;
      let parsedFD = [];
      try {
        const raw =
          typeof d.fieldsData === "string"
            ? JSON.parse(d.fieldsData)
            : d.fieldsData || [];
        parsedFD = normalizeFieldsData(raw);
      } catch { }
      let parsedDiseases = [];
      try {
        const raw =
          typeof d.selectedDiseases === "string"
            ? JSON.parse(d.selectedDiseases)
            : d.selectedDiseases;
        if (Array.isArray(raw) && raw.length > 0) parsedDiseases = raw;
      } catch { }
      if (parsedDiseases.length === 0 && d.diseaseCode && d.disease) {
        const codes = d.diseaseCode.split(", "),
          names = d.disease.split("; ");
        parsedDiseases = codes.map((code, i) => ({
          id: `${code}-${Date.now()}-${i}`,
          code: code.trim(),
          name: (names[i] || "").trim(),
        }));
      }

      const sType = summaryTypeOptions.find(
        (t) =>
          (d.summaryNo && String(t.summaryNo) === String(d.summaryNo)) ||
          (d.summaryType &&
            t.summaryType &&
            t.summaryType.trim().toUpperCase() === d.summaryType.trim().toUpperCase())
      );
      let orderedHeadings = [];
      if (sType && Array.isArray(sType.headings)) {
        orderedHeadings = [...sType.headings]
          .sort((a, b) => (Number(a.order_id) || 0) - (Number(b.order_id) || 0))
          .map((h) => (typeof h === "string" ? h : h.heading))
          .filter(Boolean);
      }
      const sortedFD = sortFieldsDataByUiOrder(parsedFD, orderedHeadings);

      setFormData({
        ...d,
        doctor: (d.doctor || "").toUpperCase(),
        summaryNo: d.summaryNo || "",
        summaryType: d.summaryType || "",
        headingNo: d.headingNo || "",
        heading: d.heading || "",
        dodTime: d.dodTime || "17:00",
        notes: "",
        fieldsData: sortedFD,
        currentField: "",
      });
      setSelectedDiseases(parsedDiseases);
      setIsEditMode(true);
      setEditingIpNo(ipNo);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      Swal.fire("Error", "Summary not found", "error");
    }
  };

  const handlePrint = (ipNo) =>
    navigate(`/SummaryPrint/${encodeURIComponent(ipNo)}`);

  const handleDelete = async (ipNo) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this discharge summary?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      const r = await apiRequest(`${HMSURL}delete-summary/${ipNo}/`, "PATCH");
      if (r.success) {
        Swal.fire("Deleted!", "Summary deleted successfully.", "success");
        setSummaries((prev) => prev.filter((s) => s.ipNo !== ipNo));
      } else {
        Swal.fire("Error", "Error deleting summary: " + (r.error || "Unknown error"), "error");
      }
    }
  };

  const handleApprove = async (ipNo) => {
    const r = await apiRequest(`${HMSURL}approve-summary/${ipNo}/`, "PATCH", {
      approve: true,
    });
    if (r.success) {
      Swal.fire("Approved!", "Summary approved successfully!", "success");
      await fetchSummaries({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        summaryType: filters.summaryType,
      });
    } else {
      Swal.fire("Error", "Error approving summary: " + (r.error || "Unknown error"), "error");
    }
  };

  const handleCancelEdit = async () => {
    const result = await Swal.fire({
      title: "Cancel editing?",
      text: "Unsaved changes will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, cancel"
    });

    if (result.isConfirmed) {
      resetForm();
    }
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      : "—";

  const fmtDateTime = (d) => {
    if (!d) return "—";
    try {
      let dateObj;
      if (typeof d === "string") {
        if (!d.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(d)) {
          dateObj = new Date(d + "Z");
        } else {
          dateObj = new Date(d);
        }
      } else {
        dateObj = new Date(d);
      }
      if (isNaN(dateObj.getTime())) return String(d);
      return dateObj.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return String(d);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const [filters, setFilters] = useState({
    fromDate: todayStr,
    toDate: todayStr,
    patient: "",
    status: "",
    summaryType: "",
    uhid: "",
    ipNo: "",
  });
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  const handleSummaryTypeFilterChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, summaryType: value }));
    fetchSummaries({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      summaryType: value,
    });
  };
  const clearFilters = () => {
    const empty = {
      fromDate: todayStr,
      toDate: todayStr,
      patient: "",
      status: "",
      summaryType: "",
      uhid: "",
      ipNo: "",
    };
    setFilters(empty);
    fetchSummaries({ fromDate: empty.fromDate, toDate: empty.toDate });
  };
  const applyServerFilters = () =>
    fetchSummaries({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      summaryType: filters.summaryType,
    });
  const filteredSummaries = summaries.filter(
    (s) =>
      (!filters.patient ||
        (s.patient || "")
          .toLowerCase()
          .includes(filters.patient.toLowerCase())) &&
      (!filters.status ||
        (filters.status === "approved" ? s.approve : !s.approve)) &&
      (!filters.uhid ||
        (s.uhid || "").toLowerCase().includes(filters.uhid.toLowerCase())) &&
      (!filters.ipNo ||
        (s.ipNo || "").toLowerCase().includes(filters.ipNo.toLowerCase())) &&
      (!filters.summaryType ||
        (s.summaryType || "").toLowerCase() ===
        filters.summaryType.toLowerCase())
  );

  /* ─── Filter input style (compact) ───────────────────────────────────── */
  const fi = { ...S.inp, height: 32, fontSize: 12.5 };
  const fs = { ...S.sel, height: 32, fontSize: 12.5 };

  const currentActiveField = (selectedField || formData.currentField || "").trim().toUpperCase();
  const isConsultantSection = currentActiveField.includes("CONSULTANT") || currentActiveField.includes("CONSULTING");
  const filteredModalDoctors = doctors.filter((doc) => {
    if (!doctorSearchQuery.trim()) return true;
    const q = doctorSearchQuery.trim().toLowerCase();
    const name = (doc.employeeName || "").toLowerCase();
    const dept = (doc.department || "").toLowerCase();
    return name.includes(q) || dept.includes(q);
  });

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <PageWrapper>
      <div style={S.inner}>
        {/* Top bar */}
        <div style={S.topBar}>
          <h1 style={S.pageTitle}>
            <span style={S.titleIcon}>
              <FileText size={22} />
            </span>
            {isEditMode ? "Edit Discharge Summary" : "Discharge Summary"}
          </h1>
          <div style={S.datePill}>
            <Calendar size={15} />
            <span>{currentDate}</span>
          </div>
        </div>

        {/* Edit banner */}
        {isEditMode && (
          <div style={S.editBanner}>
            <Edit size={18} color={T.sky} />
            <span>
              Editing summary for IP No:&nbsp;
              <strong style={{ color: T.teal }}>{editingIpNo}</strong>
              &nbsp;— scroll down to the notes section to make changes.
            </span>
          </div>
        )}

        {/* ── Patient Info ── */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div style={S.cardHeadBar} />
            <User size={16} />
            Patient Information
          </div>
          <div style={S.cardBody}>
            {/* Row 1: 8 cols */}
            <div style={S.grid(8)}>
              <Fld label="Summary Date">
                <CInp
                  value={isEditMode ? fmtDate(formData.date) : currentDate}
                  readOnly
                  style={{ background: T.bgAlt }}
                />
              </Fld>
              <Fld label="IP Number">
                <CInp
                  name="ipNo"
                  value={formData.ipNo}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (formData.ipNo?.trim()) {
                        fetchIpPatient(formData.ipNo.trim());
                      } else {
                        openIpSearchModal();
                      }
                    }
                  }}
                  readOnly={isEditMode}
                  placeholder="IP No"
                />
                {!isEditMode && (
                  <button
                    type="button"
                    style={S.searchMicroBtn}
                    onClick={() => {
                      if (formData.ipNo?.trim()) {
                        fetchIpPatient(formData.ipNo.trim());
                      } else {
                        openIpSearchModal();
                      }
                    }}
                    title="Search IP Number"
                  >
                    <Search size={12} /> Search
                  </button>
                )}
              </Fld>
              <Fld label="UHID">
                <CInp
                  name="uhid"
                  value={formData.uhid}
                  onChange={handleChange}
                  placeholder="UHID"
                />
              </Fld>
              <Fld
                label={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span>Patient Name</span>
                    {formData.is_high_risk && (
                      <HighRiskBadge reason={formData.high_risk_reason} size="sm" />
                    )}
                  </span>
                }
              >
                <CInp
                  name="patient"
                  value={formData.patient}
                  onChange={handleChange}
                  placeholder="Full Name"
                  style={{ gridColumn: "span 2" }}
                />
              </Fld>
              <Fld label="Age">
                <CInp
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Age"
                />
              </Fld>
              <Fld label="Gender">
                <CInp
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  placeholder="Gender"
                />
              </Fld>
              <Fld label="Room No">
                <CInp
                  name="roomNo"
                  value={formData.roomNo}
                  onChange={handleChange}
                  placeholder="Room"
                />
              </Fld>
            </div>

            {/* Row 2: 8 cols */}
            <div style={S.grid(8)}>
              <Fld label="D.O.A">
                <CInp
                  name="doa"
                  value={formData.doa}
                  onChange={handleChange}
                  placeholder="DD/MM/YYYY"
                />
              </Fld>
              <Fld label="DOA Time">
                <CInp
                  name="doaTime"
                  value={formData.doaTime}
                  onChange={handleChange}
                  placeholder="HH:MM"
                />
              </Fld>
              <Fld label="D.O.D">
                <CInp
                  type="date"
                  name="dod"
                  value={formData.dod}
                  onChange={handleChange}
                />
              </Fld>
              <Fld label="DOD Time">
                <CInp
                  type="time"
                  name="dodTime"
                  value={formData.dodTime}
                  onChange={handleChange}
                />
              </Fld>
              <Fld label="Surgery Date">
                <CInp
                  type="date"
                  name="surgeryDate"
                  value={formData.surgeryDate}
                  onChange={handleChange}
                />
              </Fld>
              <Fld label="Next Review">
                <CInp
                  type="date"
                  name="nextReviewDate"
                  value={formData.nextReviewDate}
                  onChange={handleChange}
                />
              </Fld>
              <Fld label="Doctor">
                <select
                  name="doctor"
                  value={
                    doctors.find(
                      (doc) =>
                        (doc.employeeName || "").trim().toUpperCase() ===
                        (formData.doctor || "").trim().toUpperCase()
                    )?.employeeName || (formData.doctor || "").toUpperCase()
                  }
                  onChange={(e) => {
                    const val = (e.target.value || "").toUpperCase();
                    setFormData((prev) => ({ ...prev, doctor: val }));
                  }}
                  style={{ ...S.sel, textTransform: "uppercase" }}
                >
                  <option value="">— DOCTOR —</option>
                  {formData.doctor &&
                    !doctors.some(
                      (doc) =>
                        (doc.employeeName || "").trim().toUpperCase() ===
                        (formData.doctor || "").trim().toUpperCase()
                    ) && (
                      <option value={(formData.doctor || "").toUpperCase()}>
                        {(formData.doctor || "").toUpperCase()}
                      </option>
                    )}
                  {doctors.map((doc, i) => {
                    const upperName = (doc.employeeName || "").toUpperCase();
                    return (
                      <option key={doc.employeeId || i} value={upperName}>
                        {upperName}
                      </option>
                    );
                  })}
                </select>
              </Fld>
              <Fld label="Summary Type">
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <select
                    id="summaryTypeSelect"
                    name="summaryNo"
                    value={formData.summaryNo}
                    onChange={handleSummaryTypeSelect}
                    style={{ ...S.sel, flex: 1 }}
                  >
                    <option value="">— Type —</option>
                    {formData.summaryNo &&
                      !summaryTypeOptions.some(
                        (t) =>
                          String(t.summaryNo) === String(formData.summaryNo)
                      ) && (
                        <option value={formData.summaryNo}>
                          {formData.summaryType || formData.summaryNo}
                        </option>
                      )}
                    {summaryTypeOptions
                      .filter(
                        (t) =>
                          t.is_active !== false ||
                          String(t.summaryNo) === String(formData.summaryNo)
                      )
                      .map((t, i) => (
                        <option key={t.summaryNo || i} value={t.summaryNo}>
                          {t.summaryType}
                        </option>
                      ))}
                  </select>
                  <button
                    id="manageSummaryTypesBtn"
                    type="button"
                    onClick={() => setShowManageSummaryTypeModal(true)}
                    title="Manage Summary Types"
                    style={{
                      ...S.actionBtn(T.teal),
                      flexShrink: 0,
                      height: 38,
                      width: 38,
                      borderRadius: 8,
                      border: `1.5px solid ${T.teal}`,
                      background: `${T.teal}12`,
                    }}
                  >
                    <Plus size={18} color={T.teal} />
                  </button>
                </div>
              </Fld>
            </div>

            {/* Row 3: 2 cols */}
            <div style={S.grid(2)}>
              <Fld label="Heading">
                <CInp
                  name="heading"
                  value={formData.heading || ""}
                  onChange={handleChange}
                  placeholder="Heading"
                />
              </Fld>
              <Fld label="Address">
                <CInp
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Area, City, State"
                />
              </Fld>
            </div>
          </div>
        </div>

        {/* ── ICD-11 ── */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div style={S.cardHeadBar} />
            <Stethoscope size={16} />
            ICD‑11 Disease Coding
          </div>
          <div style={S.cardBody}>
            <ICD11SearchComponent
              key={editingIpNo || "new"}
              onDiseasesChange={(d) => setSelectedDiseases(d)}
              initialDiseases={selectedDiseases}
            />
          </div>
        </div>

        {/* ── Notes ── */}
        <div style={S.notesLayout}>
          {/* Sidebar */}
          <div style={S.sidebar}>
            <div style={S.sidebarHead}>
              <Activity size={14} />
              Clinical Fields {noteFields.length > 0 && `(${noteFields.length})`}
            </div>
            {noteFields.length === 0 ? (
              <div style={{ padding: "18px 14px", textAlign: "center", color: T.muted, fontSize: 12.5, lineHeight: 1.5 }}>
                {formData.summaryNo ? (
                  <>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>
                      No headings configured for <strong>{formData.summaryType || "this Type"}</strong>.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const found = summaryTypeOptions.find(
                          (t) => String(t.summaryNo) === String(formData.summaryNo)
                        );
                        if (found) openEditType(found);
                        else openCreateType();
                      }}
                      style={{
                        padding: "6px 12px",
                        fontSize: 11.5,
                        fontWeight: 600,
                        background: `linear-gradient(135deg, ${T.teal}, #0284c7)`,
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      + Configure Headings
                    </button>
                  </>
                ) : (
                  "← Select a Summary Type above to view Clinical Notes."
                )}
              </div>
            ) : (
              noteFields.map((field, idx) => (
                <div
                  key={field}
                  id={`field-btn-${field.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`}
                  style={S.sidebarItem(selectedField === field)}
                  onClick={() => handleButtonClick(field)}
                >
                  <span
                    style={{
                      display: "inline-block",
                      minWidth: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      color: selectedField === field ? "white" : T.teal,
                      opacity: 0.9,
                    }}
                  >
                    {idx + 1}.
                  </span>
                  <span style={{ flex: 1, wordBreak: "break-word" }}>{field}</span>
                </div>
              ))
            )}
          </div>

          {/* Notes area */}
          <div style={S.notesCard}>
            <div style={S.notesActiveLabel}>
              {selectedField ? (
                <>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: T.teal,
                      display: "inline-block",
                    }}
                  />
                  {selectedField}
                </>
              ) : (
                <span style={{ color: T.muted, fontSize: 13 }}>
                  ← Select a clinical field from the sidebar
                </span>
              )}
            </div>

            {/* Formatting Toolbar */}
            <div style={S.notesToolbar}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  style={S.boldBtn}
                  onClick={handleToggleBold}
                  title="Make selected text bold (Ctrl+B)"
                >
                  <Bold size={14} strokeWidth={3} />
                  <span>Bold</span>
                </button>

                {/* ── CONSULTANT DOCTORS OPTION ── */}
                {isConsultantSection && (
                  <button
                    type="button"
                    onClick={() => setShowDoctorModal(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#f0fdfa",
                      border: `1.5px solid #0d9488`,
                      color: "#0f766e",
                      borderRadius: 6,
                      padding: "4px 11px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 1px 2px rgba(13, 148, 136, 0.12)",
                      transition: "all 0.15s ease",
                    }}
                    title="Browse and search doctors to include in Consultant section"
                  >
                    <Stethoscope size={14} color="#0d9488" />
                    <span>Browse</span>
                  </button>
                )}

                {/* ── PREDEFINED DEFAULT VALUE TEMPLATE OPTION ── */}
                {getPredefinedValueForField(selectedField || formData.currentField) && (
                  <button
                    id="defaultTemplateToolbarBtn"
                    type="button"
                    onClick={() => {
                      const curField = selectedField || formData.currentField;
                      const defVal = getPredefinedValueForField(curField);
                      if (!defVal) return;
                      const applyVal = () => {
                        setFormData((prev) => ({
                          ...prev,
                          notes: defVal,
                          fieldsData: setFieldValue(prev.fieldsData, curField, defVal),
                        }));
                        notesRef.current?.focus();
                      };
                      if (formData.notes && formData.notes.trim() && formData.notes.trim() !== defVal.trim()) {
                        Swal.fire({
                          title: "Reset to Default Template?",
                          text: "This will replace current notes in this section with the predefined default template.",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonText: "Yes, Reset",
                          cancelButtonText: "Cancel",
                          confirmButtonColor: T.teal,
                        }).then((res) => {
                          if (res.isConfirmed) applyVal();
                        });
                      } else {
                        applyVal();
                      }
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#f0fdf4",
                      border: `1.5px solid #16a34a`,
                      color: "#15803d",
                      borderRadius: 6,
                      padding: "4px 11px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 1px 2px rgba(22, 163, 74, 0.12)",
                      transition: "all 0.15s ease",
                    }}
                    title="Insert or reset to predefined default template configured for this heading"
                  >
                    <FileText size={14} color="#16a34a" />
                    <span>Default Template</span>
                  </button>
                )}

                {/* Voice Dictation Language Dropdown */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: "#ffffff",
                    border: `1.5px solid #cbd5e1`,
                    borderRadius: 6,
                    padding: "3px 8px",
                  }}
                  title="Select voice recognition dictation language"
                >
                  <Globe size={13} style={{ color: "#0d9488" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Lang:</span>
                  <select
                    value={speechLang}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#1e293b",
                      cursor: "pointer",
                      paddingRight: 4,
                    }}
                  >
                    <option value="en-IN">English (India / Medical)</option>
                    <option value="ta-IN">Tamil (தமிழ்)</option>
                    <option value="hi-IN">Hindi (हिन्दी)</option>
                  </select>
                </div>

                {/* Low-Voice Sensitivity Boost Toggle on Toolbar */}
                <button
                  type="button"
                  onClick={toggleMicBoost}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: micBoost ? "#f0fdf4" : "#ffffff",
                    border: `1.5px solid ${micBoost ? "#16a34a" : "#cbd5e1"}`,
                    color: micBoost ? "#15803d" : "#64748b",
                    borderRadius: 6,
                    padding: "3px 9px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: micBoost ? "0 0 6px rgba(22, 163, 74, 0.2)" : "none",
                    transition: "all 0.15s",
                  }}
                  title="Toggle Microphone Sensitivity Boost: Amplifies low, soft, or whispered voices"
                >
                  <Volume2 size={13} color={micBoost ? "#16a34a" : "#64748b"} />
                  <span>{micBoost ? "Boost: ON (3×)" : "Boost: OFF"}</span>
                </button>

                <button
                  type="button"
                  style={isListening ? S.micBtnActive : S.micBtn}
                  onClick={toggleSpeechRecognition}
                  title={
                    isListening
                      ? "Click to stop microphone voice recording"
                      : "Click to speak & dictate clinical notes via microphone"
                  }
                >
                  {isListening ? (
                    <>
                      <span style={S.pulsingDot} />
                      <MicOff size={14} />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Mic size={14} />
                      <span>Voice Dictation</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  style={S.aiBtn}
                  onClick={handleAiSummarize}
                  disabled={isSummarizing || !formData.notes || !formData.notes.trim()}
                  title="AI-format and summarize notes into proper clinical structure"
                >
                  <Sparkles size={14} />
                  <span>{isSummarizing ? "Summarizing…" : "AI Summarize"}</span>
                </button>

                {previousNotes != null && (
                  <button
                    type="button"
                    style={S.undoBtn}
                    onClick={handleUndoAi}
                    title="Undo AI changes and revert to previous notes"
                  >
                    <RotateCcw size={13} />
                    <span>Undo</span>
                  </button>
                )}
              </div>

              <div style={S.tabGroup}>
                <button
                  type="button"
                  style={notesTab === "edit" ? S.tabBtnActive : S.tabBtn}
                  onClick={() => setNotesTab("edit")}
                >
                  Edit
                </button>
                <button
                  type="button"
                  style={notesTab === "preview" ? S.tabBtnActive : S.tabBtn}
                  onClick={() => setNotesTab("preview")}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Live listening banner */}
            {isListening && (
              <div style={S.listeningBanner}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={S.pulsingDot} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{speechStatus}</span>
                  </div>

                  {/* Live Mic Volume Level Indicator */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(0, 0, 0, 0.25)",
                      padding: "3px 8px",
                      borderRadius: 12,
                    }}
                    title="Live audio input volume detected from your microphone"
                  >
                    <span style={{ fontSize: 11, color: "#fef08a", fontWeight: 600 }}>🎙️ Mic Input:</span>
                    <div
                      style={{
                        width: 50,
                        height: 7,
                        background: "rgba(255, 255, 255, 0.25)",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(4, Math.min(100, audioLevel))}%`,
                          height: "100%",
                          background: audioLevel > 5 ? "#22c55e" : "#ef4444",
                          transition: "width 0.1s ease-out",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 10, opacity: 0.85 }}>{audioLevel}%</span>
                  </div>

                  {/* Low Voice Sensitivity Boost Toggle Button in Banner */}
                  <button
                    type="button"
                    onClick={toggleMicBoost}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      border: "none",
                      background: micBoost ? "#15803d" : "rgba(0, 0, 0, 0.3)",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: micBoost ? "0 0 6px rgba(34, 197, 94, 0.6)" : "none",
                      transition: "all 0.15s",
                    }}
                    title="Click to toggle Low-Voice Sensitivity Boost (3x amplification for quiet speaking)"
                  >
                    <Volume2 size={11} />
                    <span>{micBoost ? "⚡ Low Voice Boost: ON" : "Boost: OFF"}</span>
                  </button>

                  {/* Language Selector */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: "auto", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, opacity: 0.9 }}>Lang:</span>
                    {[
                      { code: "en-IN", label: "English (India / Medical)" },
                      { code: "ta-IN", label: "Tamil (தமிழ்)" },
                      { code: "hi-IN", label: "Hindi (हिन्दी)" },
                    ].map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handleLanguageChange(l.code)}
                        style={{
                          border: "none",
                          background: speechLang === l.code ? "white" : "rgba(255, 255, 255, 0.2)",
                          color: speechLang === l.code ? "#b91c1c" : "white",
                          padding: "2px 7px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  style={{
                    border: "none",
                    background: "#991b1b",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    marginLeft: 10,
                    whiteSpace: "nowrap",
                  }}
                >
                  Stop
                </button>
              </div>
            )}

            {notesTab === "edit" ? (
              <textarea
                id="notesTextarea"
                ref={notesRef}
                style={S.textarea}
                name="notes"
                placeholder="Type clinical notes here… (Select text and click Bold or press Ctrl+B)"
                value={formData.notes}
                onChange={handleChange}
                onKeyDown={handleNotesKeyDown}
                onFocus={(e) => {
                  e.target.style.borderColor = T.teal;
                  e.target.style.boxShadow = `0 0 0 3px ${T.teal}18`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = T.border;
                  e.target.style.boxShadow = "none";
                }}
              />
            ) : (
              <div style={S.previewBox}>
                {formData.notes && formData.notes.trim() ? (
                  formData.notes.split("\n").map((line, idx) => (
                    <div
                      key={idx}
                      style={{ minHeight: "1.4em", marginBottom: 2 }}
                    >
                      {renderFormattedText(line)}
                    </div>
                  ))
                ) : (
                  <span style={{ color: T.muted, fontStyle: "italic" }}>
                    No notes entered yet. Switch to Edit tab to type notes.
                  </span>
                )}
              </div>
            )}

            {/* Quick-add */}
            <div style={S.actionRow}>
              {isConsultantSection && (
                <button
                  type="button"
                  style={{ ...S.outBtn(T.teal), fontWeight: 700 }}
                  onClick={() => setShowDoctorModal(true)}
                  title="Choose and include doctors into Consultant section"
                >
                  <Stethoscope size={14} /> + Doctors
                </button>
              )}
              <button style={S.outBtn(T.teal)} onClick={fetchInvestigations}>
                <Plus size={14} /> Investigations
              </button>
              <button style={S.outBtn(T.sky)} onClick={fetchMedicines}>
                <Pill size={14} /> Admission Medicines
              </button>
              <button
                style={S.outBtn(T.green)}
                onClick={fetchDischargeMedicines}
              >
                <Pill size={14} /> Discharge Medicines
              </button>
            </div>

            {/* Submit */}
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              {isEditMode && (
                <button style={S.btn("danger")} onClick={handleCancelEdit}>
                  <X size={15} /> Cancel
                </button>
              )}
              <button
                style={S.btn("primary")}
                onClick={isEditMode ? handleUpdate : handleSubmit}
              >
                {isEditMode ? (
                  <>
                    <Edit size={15} /> Update Summary
                  </>
                ) : (
                  <>
                    <Plus size={15} /> Save Summary
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ══ INVESTIGATIONS MODAL ══ */}
        {showInvestigations && (
          <div style={S.overlay}>
            <div style={S.modalBox}>
              <div style={S.modalHead}>
                <span style={S.modalTitle}>
                  <Activity size={18} /> Patient Investigations
                </span>
                <button
                  style={S.modalClose}
                  onClick={() => setShowInvestigations(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div style={S.modalBody}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: 36 }}>
                    <div className="spinner-border text-primary" />
                    <p style={{ marginTop: 12, color: T.muted, fontSize: 13 }}>
                      Loading investigations…
                    </p>
                  </div>
                ) : investigations.length === 0 ? (
                  <p
                    style={{ textAlign: "center", color: T.muted, padding: 36 }}
                  >
                    No investigations found.
                  </p>
                ) : (
                  <>
                    <p
                      style={{ color: T.muted, fontSize: 12, marginBottom: 12 }}
                    >
                      Click to select.{" "}
                      <span style={{ color: T.amber, fontWeight: 600 }}>
                        ⚠ Yellow border = Pending Approval.
                      </span>
                    </p>
                    {investigations.map((inv, i) => {
                      const sel = selectedInvestigations.some(
                        (si) =>
                          si.reportType === inv.reportType &&
                          si.investigation === inv.investigation
                      );
                      return (
                        <div
                          key={i}
                          style={S.invCard(sel, !inv.is_approved)}
                          onClick={() => toggleInvestigationSelection(inv)}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 4,
                            }}
                          >
                            <strong style={{ fontSize: 13, color: T.teal }}>
                              {inv.reportType}
                            </strong>
                            {!inv.is_approved && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: T.amber,
                                  background: `${T.amber}18`,
                                  padding: "2px 8px",
                                  borderRadius: 20,
                                }}
                              >
                                Pending
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: 12.5,
                              color: T.textSm,
                              marginBottom: 4,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {inv.investigation?.length > 120
                              ? `${inv.investigation.substring(0, 120)}…`
                              : inv.investigation}
                          </p>
                          <small style={{ color: T.muted, fontSize: 11 }}>
                            Impression:{" "}
                            {inv.impression?.length > 60
                              ? `${inv.impression.substring(0, 60)}…`
                              : inv.impression}
                          </small>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
              <div style={S.modalFoot}>
                {selectedInvestigations.length > 0 && (
                  <span
                    style={{
                      marginRight: "auto",
                      fontSize: 13,
                      color: T.teal,
                      fontWeight: 600,
                    }}
                  >
                    {selectedInvestigations.length} selected
                  </span>
                )}
                <button
                  style={S.btn("ghost")}
                  onClick={() => setShowInvestigations(false)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    ...S.btn("primary"),
                    opacity: selectedInvestigations.length ? 1 : 0.5,
                  }}
                  onClick={addInvestigationsToNotes}
                  disabled={!selectedInvestigations.length}
                >
                  Add to Summary
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ MEDICINES MODAL ══ */}
        {showMedicines && (
          <div style={S.overlay}>
            <div style={S.modalBox}>
              <div style={S.modalHead}>
                <span style={S.modalTitle}>
                  <Pill size={18} />{" "}
                  {medicineModalType === "discharge"
                    ? "Discharge Medicines"
                    : "Admission Medicines"}
                </span>
                <button
                  style={S.modalClose}
                  onClick={() => setShowMedicines(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div style={S.modalBody}>
                {medicinesLoading ? (
                  <div style={{ textAlign: "center", padding: 36 }}>
                    <div className="spinner-border text-primary" />
                    <p style={{ marginTop: 12, color: T.muted, fontSize: 13 }}>
                      Loading medicines…
                    </p>
                  </div>
                ) : medicines.length === 0 ? (
                  <p
                    style={{ textAlign: "center", color: T.muted, padding: 36 }}
                  >
                    No medicines found.
                  </p>
                ) : (
                  <>
                    <p
                      style={{ color: T.muted, fontSize: 12, marginBottom: 12 }}
                    >
                      Click to select medicines to add to the summary.
                    </p>
                    {medicines.map((med, i) => {
                      const sel = selectedMedicines.some((m) => m._idx === i);
                      return (
                        <div
                          key={i}
                          style={S.invCard(sel, false)}
                          onClick={() => toggleMedicineSelection(med, i)}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 6,
                            }}
                          >
                            <strong style={{ fontSize: 13.5, color: T.teal }}>
                              {med.itemName}
                            </strong>
                            <div style={{ display: "flex", gap: 6 }}>
                              {med.is_discharge_medicine && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: T.green,
                                    background: `${T.green}18`,
                                    padding: "2px 8px",
                                    borderRadius: 20,
                                  }}
                                >
                                  Discharge
                                </span>
                              )}
                              {med.is_regular_medicine && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: T.sky,
                                    background: `${T.sky}18`,
                                    padding: "2px 8px",
                                    borderRadius: 20,
                                  }}
                                >
                                  Regular
                                </span>
                              )}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 14,
                              flexWrap: "wrap",
                            }}
                          >
                            {med.dosage && (
                              <small style={{ color: T.textSm, fontSize: 12 }}>
                                <b>Dosage:</b> {med.dosage}
                              </small>
                            )}
                            {med.noOfDays && (
                              <small style={{ color: T.textSm, fontSize: 12 }}>
                                <b>Days:</b> {med.noOfDays}
                              </small>
                            )}
                            {med.qty && (
                              <small style={{ color: T.textSm, fontSize: 12 }}>
                                <b>Qty:</b> {med.qty} {med.doseUnit}
                              </small>
                            )}
                            {med.route && (
                              <small style={{ color: T.textSm, fontSize: 12 }}>
                                <b>Route:</b> {med.route}
                              </small>
                            )}
                            {med.remark && med.remark !== "Nil" && (
                              <small style={{ color: T.muted, fontSize: 12 }}>
                                <b>Remark:</b> {med.remark}
                              </small>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
              <div style={S.modalFoot}>
                {selectedMedicines.length > 0 && (
                  <span
                    style={{
                      marginRight: "auto",
                      fontSize: 13,
                      color: T.teal,
                      fontWeight: 600,
                    }}
                  >
                    {selectedMedicines.length} selected
                  </span>
                )}
                <button
                  style={S.btn("ghost")}
                  onClick={() => setShowMedicines(false)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    ...S.btn("primary"),
                    opacity: selectedMedicines.length ? 1 : 0.5,
                  }}
                  onClick={addMedicinesToNotes}
                  disabled={!selectedMedicines.length}
                >
                  Add to Summary
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ SUMMARY TABLE ══ */}
        <div style={S.tableWrap}>
          <div style={S.tableHead}>
            <span style={S.tableTitle}>
              <Activity size={18} /> Summary Reports
            </span>
            <span style={S.tableCount}>
              {filteredSummaries.length} of {summaries.length} records
            </span>
          </div>

          {/* Filter bar */}
          <div style={S.filterBar}>
            <div style={S.filterGrid}>
              <div style={S.fld}>
                <span style={{ ...S.lbl, color: T.teal }}>From Date</span>
                <input
                  type="date"
                  name="fromDate"
                  value={filters.fromDate}
                  onChange={handleFilterChange}
                  style={fi}
                />
              </div>
              <div style={S.fld}>
                <span style={{ ...S.lbl, color: T.teal }}>To Date</span>
                <input
                  type="date"
                  name="toDate"
                  value={filters.toDate}
                  onChange={handleFilterChange}
                  style={fi}
                />
              </div>
              <div style={S.fld}>
                <span style={{ ...S.lbl, color: T.teal }}>Summary Type</span>
                <select
                  name="summaryType"
                  value={filters.summaryType}
                  onChange={handleSummaryTypeFilterChange}
                  style={fs}
                >
                  <option value="">All Types</option>
                  {summaryTypeOptions.map((t, i) => (
                    <option key={t.summaryNo || i} value={t.summaryType}>
                      {t.summaryType}
                    </option>
                  ))}
                </select>
              </div>
              <div style={S.fld}>
                <span style={{ ...S.lbl, color: T.teal }}>Patient Name</span>
                <input
                  name="patient"
                  value={filters.patient}
                  onChange={handleFilterChange}
                  placeholder="Search…"
                  style={fi}
                />
              </div>
              <div style={S.fld}>
                <span style={{ ...S.lbl, color: T.teal }}>Status</span>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  style={fs}
                >
                  <option value="">All</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  onClick={applyServerFilters}
                  style={{
                    ...S.btn("primary"),
                    height: 32,
                    padding: "0 14px",
                    fontSize: 12,
                  }}
                >
                  <Search size={13} /> Search
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  onClick={clearFilters}
                  style={{
                    height: 32,
                    padding: "0 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    border: `1px solid ${T.border}`,
                    borderRadius: 7,
                    background: T.white,
                    color: T.muted,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = T.red;
                    e.currentTarget.style.color = T.red;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.color = T.muted;
                  }}
                >
                  <X size={13} /> Clear
                </button>
              </div>
            </div>
            <div style={S.filterGrid2}>
              <div style={S.fld}>
                <span style={{ ...S.lbl, color: T.teal }}>UHID</span>
                <input
                  name="uhid"
                  value={filters.uhid}
                  onChange={handleFilterChange}
                  placeholder="Search UHID…"
                  style={fi}
                />
              </div>
              <div style={S.fld}>
                <span style={{ ...S.lbl, color: T.teal }}>IP No</span>
                <input
                  name="ipNo"
                  value={filters.ipNo}
                  onChange={handleFilterChange}
                  placeholder="Search IP No…"
                  style={fi}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {summaries.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                padding: 40,
                color: T.muted,
                fontSize: 13,
              }}
            >
              No summary reports found.
            </p>
          ) : filteredSummaries.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                padding: 40,
                color: T.muted,
                fontSize: 13,
              }}
            >
              No records match your filters.{" "}
              <button
                onClick={clearFilters}
                style={{
                  background: "none",
                  border: "none",
                  color: T.teal,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Clear filters
              </button>
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {[
                      "Date",
                      "Patient Name",
                      "Status",
                      "Summary Type",
                      "UHID",
                      "IP No",
                      "Approved On",
                      "Actions",
                    ].map((h) => (
                      <th key={h} style={S.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSummaries.map((s, i) => (
                    <tr
                      key={s.id || i}
                      style={{ background: i % 2 === 0 ? T.white : T.bg }}
                    >
                      <td style={S.td}>{fmtDate(s.date)}</td>
                      <td style={{ ...S.td, fontWeight: 600, color: T.teal }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span>{s.patient}</span>
                          {s.is_high_risk && (
                            <HighRiskBadge reason={s.high_risk_reason} size="sm" />
                          )}
                        </div>
                      </td>
                      <td style={S.td}>
                        <span style={S.badge(s.approve)}>
                          <span style={S.dot(s.approve)} />
                          {s.approve ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td style={{ ...S.td, fontSize: 12.5 }}>{s.summaryType}</td>
                      <td style={S.td}>{s.uhid}</td>
                      <td style={{ ...S.td, fontWeight: 600 }}>{s.ipNo}</td>
                      <td style={{ ...S.td, fontSize: 12.5 }}>
                        {fmtDateTime(s.approve_time)}
                      </td>
                      <td style={S.td}>
                        <div
                          style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}
                        >
                          {canEdit && (
                            <button
                              style={{
                                ...S.actionBtn(T.teal),
                                opacity: s.approve ? 0.35 : 1,
                                cursor: s.approve ? "not-allowed" : "pointer",
                              }}
                              title="Edit Summary"
                              onClick={() => handleEdit(s.ipNo)}
                              disabled={s.approve}
                            >
                              <Edit size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              style={{
                                ...S.actionBtn(T.red),
                                opacity: s.approve ? 0.35 : 1,
                                cursor: s.approve ? "not-allowed" : "pointer",
                              }}
                              title="Delete Summary"
                              onClick={() => handleDelete(s.ipNo)}
                              disabled={s.approve}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                          {canApprove && (
                            <button
                              style={{
                                ...S.actionBtn(T.green),
                                opacity: s.approve ? 0.35 : 1,
                                cursor: s.approve ? "not-allowed" : "pointer",
                              }}
                              title="Approve Summary"
                              onClick={() => handleApprove(s.ipNo)}
                              disabled={s.approve}
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          <button
                            style={S.actionBtn(T.sky)}
                            title="Print Summary"
                            onClick={() => handlePrint(s.ipNo)}
                          >
                            <Printer size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── MANAGE SUMMARY TYPES MODAL (Package.js UI Style) ── */}
        {showManageSummaryTypeModal && (
          <div
            style={S.overlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowManageSummaryTypeModal(false);
                setTypeSearchFilter("");
              }
            }}
          >
            <div style={{ ...S.modalBox, width: "min(960px, 96vw)", maxHeight: "90vh" }}>
              <div style={S.modalHead}>
                <span style={S.modalTitle}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${T.teal}, ${T.sky})`,
                      display: "inline-block",
                    }}
                  />
                  Summary Type Management
                </span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={handleOpenHeadingModule}
                    style={{
                      ...pkgCss.btn("ghost"),
                      background: "#ffffff",
                      color: T.slate,
                      border: `1px solid ${T.border}`,
                      fontSize: 12.5,
                      padding: "7px 14px",
                    }}
                    title="Add, edit, or delete headings in Headings Master table"
                  >
                    <FileText size={15} color={T.teal} /> Manage Headings ({headingOptions.length})
                  </button>
                  <button
                    type="button"
                    onClick={openCreateType}
                    style={pkgCss.btn("primary")}
                  >
                    <Plus size={16} /> Add Type
                  </button>
                  <button
                    style={S.modalClose}
                    onClick={() => {
                      setShowManageSummaryTypeModal(false);
                      setTypeSearchFilter("");
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", flexGrow: 1 }}>
                {/* Search / Filter bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#F8FAFC",
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                >
                  <Search size={16} color={T.muted} />
                  <input
                    type="text"
                    value={typeSearchFilter}
                    onChange={(e) => setTypeSearchFilter(e.target.value)}
                    placeholder="Search by summary type or section heading..."
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: 13,
                      color: T.slate,
                    }}
                  />
                  {typeSearchFilter && (
                    <button
                      type="button"
                      onClick={() => setTypeSearchFilter("")}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: T.muted,
                        cursor: "pointer",
                        fontSize: 12,
                        padding: "2px 6px",
                      }}
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>

                {/* Summary Types Table */}
                <div
                  style={{
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    overflow: "hidden",
                    background: T.white,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 18px",
                      background: `linear-gradient(135deg, ${T.slate}, #334155)`,
                      color: T.white,
                      fontSize: 13,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>🏷️ Configured Summary Types</span>
                    <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.85 }}>
                      {summaryTypeOptions.filter((t) => {
                        if (!typeSearchFilter) return true;
                        const q = typeSearchFilter.toLowerCase();
                        const matchType = (t.summaryType || "").toLowerCase().includes(q);
                        const matchHeadings = Array.isArray(t.headings) && t.headings.some((h) => (h.heading || "").toLowerCase().includes(q));
                        return matchType || matchHeadings;
                      }).length} record(s)
                    </span>
                  </div>

                  <div style={{ overflowX: "auto", maxHeight: 380 }}>
                    {summaryTypeOptions.length === 0 ? (
                      <p style={{ textAlign: "center", padding: 32, color: T.muted, fontSize: 13 }}>
                        No summary types available. Click <strong>+ Add Type</strong> to create one.
                      </p>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={{ ...pkgCss.itemsTh, width: 60 }}>#</th>
                            <th style={{ ...pkgCss.itemsTh, width: 220 }}>Summary Type</th>
                            <th style={{ ...pkgCss.itemsTh, width: 140 }}>Headings Count</th>
                            <th style={pkgCss.itemsTh}>Configured Headings Preview</th>
                            <th style={{ ...pkgCss.itemsTh, width: 120, textAlign: "center" }}>Status</th>
                            <th style={{ ...pkgCss.itemsTh, width: 140, textAlign: "center" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summaryTypeOptions
                            .filter((t) => {
                              if (!typeSearchFilter) return true;
                              const q = typeSearchFilter.toLowerCase();
                              const matchType = (t.summaryType || "").toLowerCase().includes(q);
                              const matchHeadings = Array.isArray(t.headings) && t.headings.some((h) => (h.heading || "").toLowerCase().includes(q));
                              return matchType || matchHeadings;
                            })
                            .map((t, i) => {
                              const isActive = t.is_active !== false;
                              const headingsArr = Array.isArray(t.headings) ? t.headings : [];
                              const previewStr = headingsArr.length > 0
                                ? headingsArr
                                  .slice(0, 3)
                                  .map((h, idx) => `${idx + 1}. ${h.heading || ""}`)
                                  .join(", ") + (headingsArr.length > 3 ? ` ... (+${headingsArr.length - 3} more)` : "")
                                : "— No headings configured —";

                              return (
                                <tr
                                  key={t.summaryNo || i}
                                  style={{
                                    background: i % 2 === 0 ? T.white : "#F8FAFC",
                                    borderBottom: `1px solid ${T.border}`,
                                    opacity: isActive ? 1 : 0.7,
                                  }}
                                >
                                  <td style={{ ...pkgCss.itemsTd, fontWeight: 700, color: T.muted }}>
                                    {t.summaryNo || i + 1}
                                  </td>
                                  <td style={{ ...pkgCss.itemsTd, fontWeight: 700, color: isActive ? T.teal : "#64748b" }}>
                                    {t.summaryType}
                                    {!isActive && (
                                      <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>
                                        (deactivated)
                                      </span>
                                    )}
                                  </td>
                                  <td style={pkgCss.itemsTd}>
                                    <span style={pkgCss.countBadge}>
                                      {headingsArr.length} heading{headingsArr.length !== 1 ? "s" : ""}
                                    </span>
                                  </td>
                                  <td style={{ ...pkgCss.itemsTd, fontSize: 12, color: headingsArr.length > 0 ? T.slate : T.muted }}>
                                    {previewStr}
                                  </td>
                                  <td style={{ ...pkgCss.itemsTd, textAlign: "center" }}>
                                    <div
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 8,
                                        justifyContent: "center",
                                      }}
                                    >
                                      {renderStatusToggle({
                                        checked: isActive,
                                        onChange: () => handleToggleSummaryTypeStatus(t),
                                        title: isActive
                                          ? "Click to Deactivate Summary Type"
                                          : "Click to Activate Summary Type",
                                      })}
                                      <span
                                        style={{
                                          fontSize: 11.5,
                                          fontWeight: 600,
                                          color: isActive ? "#059669" : "#64748b",
                                        }}
                                      >
                                        {isActive ? "Active" : "Inactive"}
                                      </span>
                                    </div>
                                  </td>
                                  <td style={{ ...pkgCss.itemsTd, textAlign: "center" }}>
                                    <div style={{ display: "inline-flex", gap: 6, justifyContent: "center" }}>
                                      <button
                                        type="button"
                                        onClick={() => setViewTypeObj(t)}
                                        style={pkgCss.smallBtn("primary")}
                                        title="View headings list"
                                      >
                                        <Eye size={12} /> View
                                      </button>
                                      <button
                                        id={`edit-type-btn-${t.summaryNo}`}
                                        type="button"
                                        onClick={() => openEditType(t)}
                                        style={pkgCss.smallBtn("ghost")}
                                        title="Edit summary type & headings"
                                      >
                                        <Edit size={12} /> Edit
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              <div style={S.modalFoot}>
                <button
                  type="button"
                  onClick={() => {
                    setShowManageSummaryTypeModal(false);
                    setTypeSearchFilter("");
                  }}
                  style={{
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1px solid ${T.border}`,
                    borderRadius: 7,
                    background: "white",
                    color: T.muted,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT SUMMARY TYPE MODAL (Same UI like Package.js) ── */}
        {showTypeFormModal && (
          <div
            style={S.overlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                if (window.confirm("Discard unsaved changes?")) {
                  setShowTypeFormModal(false);
                }
              }
            }}
          >
            <div style={{ ...S.modalBox, width: "min(880px, 95vw)", maxHeight: "90vh" }}>
              <div style={S.modalHead}>
                <span style={S.modalTitle}>
                  {isEditTypeMode
                    ? `✏️ Edit Summary Type — #${editingTypeNo}`
                    : "📑 New Summary Type"}
                </span>
                <button
                  style={S.modalClose}
                  onClick={() => {
                    if (window.confirm("Discard unsaved changes?")) {
                      setShowTypeFormModal(false);
                    }
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              <div style={{ padding: "20px 24px", overflowY: "auto", flexGrow: 1 }}>
                {isEditTypeMode && (
                  <div style={pkgCss.editBanner}>
                    <div style={pkgCss.editBannerDot} />
                    Editing Summary Type:{" "}
                    <strong style={{ color: T.teal }}>
                      {typeFormData.summaryType}
                    </strong>
                  </div>
                )}

                {/* Card 1: Type Details */}
                <div style={pkgCss.card}>
                  <div style={pkgCss.cardTitle}>
                    <div style={pkgCss.sectionLine} /> Type Details
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", color: T.muted, display: "block", marginBottom: 6 }}>
                      Summary Type Name *
                    </span>
                    <CInp
                      value={typeFormData.summaryType}
                      onChange={(e) =>
                        setTypeFormData((prev) => ({
                          ...prev,
                          summaryType: e.target.value,
                        }))
                      }
                      placeholder="e.g. Summary, DISCHARGE SUMMARY, DAY CARE SUMMARY"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Configured Headings Table with Order IDs */}
                <div style={pkgCss.card}>
                  <div style={{ ...pkgCss.cardTitle, justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={pkgCss.sectionLine} /> Configured Headings ({typeFormData.headings.length})
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: T.muted, textTransform: "none", letterSpacing: "normal" }}>
                        Use ▲ / ▼ to reorder
                      </span>
                      <button
                        type="button"
                        onClick={handleOpenHeadingModule}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 14px",
                          fontSize: 12.5,
                          fontWeight: 600,
                          background: `linear-gradient(135deg, ${T.teal}, #0ea5e9)`,
                          color: "white",
                          border: "none",
                          borderRadius: 7,
                          cursor: "pointer",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        }}
                        title="Add or select headings from Headings Master"
                      >
                        <Plus size={14} /> Add & Manage Headings
                      </button>
                    </div>
                  </div>

                  {typeFormData.headings.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "36px 20px" }}>
                      <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>
                        No headings added to this type yet. Click <strong>+ Add & Manage Headings</strong> above to select or create headings.
                      </p>
                    </div>
                  ) : (
                    <table style={pkgCss.itemsTable}>
                      <thead>
                        <tr>
                          <th style={{ ...pkgCss.itemsTh, width: 75, textAlign: "center" }}>Order ID</th>
                          <th style={pkgCss.itemsTh}>Heading / Section Name</th>
                          <th style={{ ...pkgCss.itemsTh, width: 90 }}>Heading No</th>
                          <th style={{ ...pkgCss.itemsTh, minWidth: 210 }}>Predefined Value</th>
                          <th style={{ ...pkgCss.itemsTh, width: 85, textAlign: "center" }}>Reorder</th>
                          <th style={{ ...pkgCss.itemsTh, width: 75, textAlign: "center" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {typeFormData.headings.map((h, index) => (
                          <tr
                            key={index}
                            style={{
                              background: index % 2 === 0 ? T.white : "#F8FAFC",
                            }}
                          >
                            <td style={{ ...pkgCss.itemsTd, textAlign: "center" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: 26,
                                  height: 26,
                                  borderRadius: "50%",
                                  background: "#e0f2fe",
                                  color: "#0284c7",
                                  fontWeight: 700,
                                  fontSize: 12.5,
                                }}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td style={pkgCss.itemsTd}>
                              <strong style={{ color: T.slate, fontSize: 13 }}>
                                {h.heading}
                              </strong>
                            </td>
                            <td style={{ ...pkgCss.itemsTd, color: T.muted, fontSize: 12 }}>
                              {h.headingNo || "—"}
                            </td>
                            <td style={{ ...pkgCss.itemsTd, minWidth: 210 }}>
                              {h.defaultValue && h.defaultValue.trim() ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      maxWidth: 140,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      fontSize: 11.5,
                                      background: "#ecfdf5",
                                      color: "#065f46",
                                      border: "1px solid #a7f3d0",
                                      padding: "2px 7px",
                                      borderRadius: 4,
                                      fontFamily: "monospace",
                                    }}
                                    title={h.defaultValue}
                                  >
                                    {h.defaultValue.replace(/\n/g, " ↵ ")}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => openEditHeadingDefault(index)}
                                    style={{
                                      ...pkgCss.smallBtn("outline"),
                                      padding: "2px 6px",
                                      fontSize: 11,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                    }}
                                    title="Edit predefined default value"
                                  >
                                    <Edit size={10} /> Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTypeFormData((prev) => {
                                        const next = [...prev.headings];
                                        next[index] = { ...next[index], defaultValue: "" };
                                        return { ...prev, headings: next };
                                      });
                                    }}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "#ef4444",
                                      cursor: "pointer",
                                      padding: 2,
                                    }}
                                    title="Clear predefined value"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openEditHeadingDefault(index)}
                                  style={{
                                    background: "#f8fafc",
                                    border: "1px dashed #cbd5e1",
                                    color: "#64748b",
                                    borderRadius: 6,
                                    padding: "3px 8px",
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                  title="Set predefined template / default value for this heading"
                                >
                                  <Plus size={11} />
                                  <span>Set Default</span>
                                </button>
                              )}
                            </td>
                            <td style={{ ...pkgCss.itemsTd, textAlign: "center" }}>
                              <div style={{ display: "inline-flex", gap: 4, justifyContent: "center" }}>
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMoveHeadingOrder(index, "up")}
                                  style={{
                                    ...pkgCss.smallBtn("outline"),
                                    padding: "3px 7px",
                                    opacity: index === 0 ? 0.35 : 1,
                                    cursor: index === 0 ? "not-allowed" : "pointer",
                                  }}
                                  title="Move Up"
                                >
                                  <ArrowUp size={12} />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === typeFormData.headings.length - 1}
                                  onClick={() => handleMoveHeadingOrder(index, "down")}
                                  style={{
                                    ...pkgCss.smallBtn("outline"),
                                    padding: "3px 7px",
                                    opacity: index === typeFormData.headings.length - 1 ? 0.35 : 1,
                                    cursor: index === typeFormData.headings.length - 1 ? "not-allowed" : "pointer",
                                  }}
                                  title="Move Down"
                                >
                                  <ArrowDown size={12} />
                                </button>
                              </div>
                            </td>
                            <td style={{ ...pkgCss.itemsTd, textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveHeadingFromType(index)}
                                style={{
                                  ...pkgCss.smallBtn("danger"),
                                  padding: "4px 8px",
                                }}
                                title="Remove heading from this type"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div style={S.modalFoot}>
                <button
                  type="button"
                  onClick={() => setShowTypeFormModal(false)}
                  style={{
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1px solid ${T.border}`,
                    borderRadius: 7,
                    background: "white",
                    color: T.muted,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTypeSubmit}
                  disabled={savingType}
                  style={{
                    ...pkgCss.btn("primary"),
                    opacity: savingType ? 0.7 : 1,
                    cursor: savingType ? "not-allowed" : "pointer",
                  }}
                >
                  {savingType ? "Saving..." : isEditTypeMode ? "Update Summary Type" : "Save Summary Type"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── EDIT PREDEFINED HEADING VALUE MODAL ── */}
        {editingHeadingDefaultIndex !== null && typeFormData.headings[editingHeadingDefaultIndex] && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1150,
              padding: 20,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingHeadingDefaultIndex(null);
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: 12,
                width: "min(620px, 94vw)",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderBottom: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={16} color="#0d9488" />
                    <span>Predefined Default Value</span>
                  </h4>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    Section: <strong style={{ color: "#0f172a" }}>{typeFormData.headings[editingHeadingDefaultIndex].heading}</strong> &bull; Type: <span style={{ color: "#0d9488", fontWeight: 600 }}>{typeFormData.summaryType || "Summary Type"}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingHeadingDefaultIndex(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    padding: 4,
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: "18px 20px" }}>
                <p style={{ fontSize: 12.5, color: "#475569", margin: "0 0 10px 0" }}>
                  Enter the default template / text for this heading in this summary type. When this summary type is selected on the discharge form, this section will automatically populate with this value.
                </p>
                <textarea
                  rows={9}
                  value={tempDefaultValue}
                  onChange={(e) => setTempDefaultValue(e.target.value)}
                  placeholder={"Enter predefined default value / template here...\n\ne.g. for VITALS:\nBP: 120/80 mm hg\nPR:65/min\nRR: 18/min\nT: 98.6'F\nGCS: 15/15"}
                  style={{
                    width: "100%",
                    fontFamily: "monospace",
                    fontSize: 13,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #cbd5e1",
                    outline: "none",
                    boxSizing: "border-box",
                    lineHeight: 1.5,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
                  onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                  autoFocus
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  background: "#f8fafc",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => setTempDefaultValue("")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "4px 8px",
                  }}
                >
                  Clear Text
                </button>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEditingHeadingDefaultIndex(null)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 6,
                      border: "1px solid #cbd5e1",
                      background: "white",
                      color: "#475569",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveHeadingDefault}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 6,
                      border: "none",
                      background: "#0d9488",
                      color: "white",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(13, 148, 136, 0.2)",
                    }}
                  >
                    Save Default Value
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MANAGE HEADINGS MODAL (Add, Edit, Delete Headings Master) ── */}
        {showManageHeadingModal && (
          <div
            style={{ ...S.overlay, zIndex: 1100 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowManageHeadingModal(false);
                setHeadingInput("");
                setEditingHeading(null);
                setHeadingSearchFilter("");
              }
            }}
          >
            <div
              style={{
                ...S.modalBox,
                width: "min(740px, 95vw)",
                maxHeight: "88vh",
              }}
            >
              {/* Header */}
              <div style={S.modalHead}>
                <span style={S.modalTitle}>
                  <FileText size={18} /> Manage Headings Master
                </span>
                <button
                  style={S.modalClose}
                  onClick={() => {
                    setShowManageHeadingModal(false);
                    setHeadingInput("");
                    setEditingHeading(null);
                    setHeadingSearchFilter("");
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div
                style={{
                  padding: "18px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  overflowY: "auto",
                  flexGrow: 1,
                }}
              >
                {/* 1. Add / Edit Heading Form Card */}
                <div
                  style={{
                    background: editingHeading ? "#fffbeb" : "#f8fafc",
                    border: `1px solid ${editingHeading ? "#fde68a" : T.border}`,
                    borderRadius: 10,
                    padding: "16px 18px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        color: editingHeading ? "#b45309" : T.teal,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {editingHeading ? (
                        <>
                          <Edit size={15} /> Edit Heading (No: {editingHeading.headingNo})
                        </>
                      ) : (
                        <>
                          <Plus size={15} /> Add New Heading
                        </>
                      )}
                    </div>

                    {editingHeading && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 12,
                          background: "#fef3c7",
                          color: "#92400e",
                          border: "1px solid #fde68a",
                        }}
                      >
                        Editing Mode
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleSaveHeading}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <CInp
                          value={headingInput}
                          onChange={(e) => setHeadingInput(e.target.value)}
                          placeholder="e.g. COURSE IN HOSPITAL, TREATMENT GIVEN, SURGICAL NOTES..."
                          autoFocus
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={savingHeading}
                        style={{
                          ...pkgCss.btn("primary"),
                          padding: "8px 18px",
                          fontSize: 13,
                          whiteSpace: "nowrap",
                          background: editingHeading
                            ? "linear-gradient(135deg, #0d9488, #10b981)"
                            : `linear-gradient(135deg, ${T.teal}, #0ea5e9)`,
                          opacity: savingHeading ? 0.7 : 1,
                          cursor: savingHeading ? "not-allowed" : "pointer",
                        }}
                      >
                        {savingHeading
                          ? "Saving..."
                          : editingHeading
                            ? "Save Update"
                            : "+ Add Heading"}
                      </button>
                      {editingHeading && (
                        <button
                          type="button"
                          onClick={handleCancelEditHeading}
                          style={{
                            ...pkgCss.btn("outline"),
                            padding: "8px 14px",
                            fontSize: 13,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* 2. Headings Search Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#ffffff",
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                >
                  <Search size={15} color={T.muted} />
                  <input
                    type="text"
                    value={headingSearchFilter}
                    onChange={(e) => setHeadingSearchFilter(e.target.value)}
                    placeholder="Search headings by title or heading number..."
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: 13,
                      color: T.slate,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: T.muted,
                      background: "#f1f5f9",
                      padding: "2px 8px",
                      borderRadius: 12,
                    }}
                  >
                    {
                      headingOptions.filter((h) => {
                        if (!headingSearchFilter) return true;
                        const q = headingSearchFilter.toLowerCase();
                        return (
                          (h.heading || "").toLowerCase().includes(q) ||
                          String(h.headingNo || "").includes(q)
                        );
                      }).length
                    }{" "}
                    of {headingOptions.length}
                  </span>
                </div>

                {/* 3. Master Headings Table */}
                <div
                  style={{
                    border: `1px solid ${T.border}`,
                    borderRadius: 9,
                    overflow: "hidden",
                    background: T.white,
                  }}
                >
                  <div style={{ overflowX: "auto", maxHeight: 320 }}>
                    {headingOptions.length === 0 ? (
                      <p style={{ textAlign: "center", padding: 28, color: T.muted, fontSize: 13 }}>
                        No headings in master table. Use the form above to add one.
                      </p>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={{ ...pkgCss.itemsTh, width: 70, textAlign: "center" }}>#</th>
                            <th style={pkgCss.itemsTh}>Heading Title</th>
                            <th style={{ ...pkgCss.itemsTh, width: 125, textAlign: "center" }}>Status</th>
                            <th style={{ ...pkgCss.itemsTh, width: 180, textAlign: "center" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {headingOptions
                            .filter((h) => {
                              if (!headingSearchFilter) return true;
                              const q = headingSearchFilter.toLowerCase();
                              return (
                                (h.heading || "").toLowerCase().includes(q) ||
                                String(h.headingNo || "").includes(q)
                              );
                            })
                            .map((h, i) => {
                              const isActive = h.is_active !== false;
                              const isBeingEdited =
                                editingHeading &&
                                String(editingHeading.headingNo) === String(h.headingNo);
                              const alreadyInType =
                                showTypeFormModal &&
                                Array.isArray(typeFormData.headings) &&
                                typeFormData.headings.some(
                                  (item) =>
                                    String(item.headingNo) === String(h.headingNo) ||
                                    item.heading === h.heading
                                );

                              return (
                                <tr
                                  key={h.headingNo || i}
                                  style={{
                                    background: isBeingEdited
                                      ? "#fef9c3"
                                      : i % 2 === 0
                                        ? T.white
                                        : "#F8FAFC",
                                    borderBottom: `1px solid ${T.border}`,
                                    opacity: isActive ? 1 : 0.72,
                                  }}
                                >
                                  <td
                                    style={{
                                      ...pkgCss.itemsTd,
                                      textAlign: "center",
                                      fontWeight: 600,
                                      color: T.muted,
                                      fontSize: 12,
                                    }}
                                  >
                                    {h.headingNo || i + 1}
                                  </td>
                                  <td style={pkgCss.itemsTd}>
                                    <strong
                                      style={{
                                        color: isBeingEdited ? "#854d0e" : isActive ? T.slate : "#64748b",
                                        fontSize: 13,
                                      }}
                                    >
                                      {h.heading}
                                    </strong>
                                    {!isActive && (
                                      <span
                                        style={{
                                          marginLeft: 6,
                                          fontSize: 11,
                                          fontWeight: 500,
                                          color: "#94a3b8",
                                        }}
                                      >
                                        (deactivated)
                                      </span>
                                    )}
                                    {isBeingEdited && (
                                      <span
                                        style={{
                                          marginLeft: 8,
                                          fontSize: 11,
                                          color: "#b45309",
                                          fontWeight: 600,
                                        }}
                                      >
                                        (editing)
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ ...pkgCss.itemsTd, textAlign: "center" }}>
                                    <div
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 8,
                                        justifyContent: "center",
                                      }}
                                    >
                                      {renderStatusToggle({
                                        checked: isActive,
                                        onChange: () => handleToggleHeadingStatus(h),
                                        title: isActive
                                          ? "Click to Deactivate Heading"
                                          : "Click to Activate Heading",
                                      })}
                                      <span
                                        style={{
                                          fontSize: 11.5,
                                          fontWeight: 600,
                                          color: isActive ? "#059669" : "#64748b",
                                        }}
                                      >
                                        {isActive ? "Active" : "Inactive"}
                                      </span>
                                    </div>
                                  </td>
                                  <td style={{ ...pkgCss.itemsTd, textAlign: "center" }}>
                                    <div
                                      style={{
                                        display: "inline-flex",
                                        gap: 6,
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      {showTypeFormModal && (
                                        <button
                                          type="button"
                                          disabled={alreadyInType || !isActive}
                                          onClick={() => {
                                            if (!isActive) return;
                                            handleAddHeadingToType(h.heading);
                                          }}
                                          style={{
                                            ...pkgCss.smallBtn(
                                              alreadyInType
                                                ? "outline"
                                                : !isActive
                                                  ? "ghost"
                                                  : "primary"
                                            ),
                                            padding: "3px 10px",
                                            fontSize: 11.5,
                                            background: alreadyInType
                                              ? "#ecfdf5"
                                              : !isActive
                                                ? "#f1f5f9"
                                                : "linear-gradient(135deg, #0d9488, #0ea5e9)",
                                            color: alreadyInType
                                              ? "#047857"
                                              : !isActive
                                                ? "#94a3b8"
                                                : "#ffffff",
                                            border: alreadyInType
                                              ? "1px solid #a7f3d0"
                                              : !isActive
                                                ? "1px dashed #cbd5e1"
                                                : "none",
                                            cursor: alreadyInType
                                              ? "default"
                                              : !isActive
                                                ? "not-allowed"
                                                : "pointer",
                                          }}
                                          title={
                                            alreadyInType
                                              ? "Already added to this type"
                                              : !isActive
                                                ? "Deactivated heading cannot be added to a type"
                                                : "Add to current summary type"
                                          }
                                        >
                                          {alreadyInType
                                            ? "✓ Added"
                                            : "+ Add to Type"}
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleEditHeadingClick(h)}
                                        style={pkgCss.smallBtn("outline")}
                                        title="Edit this heading"
                                      >
                                        <Edit size={12} color={T.teal} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  ...S.modalFoot,
                  justifyContent: "space-between",
                  background: "#f8fafc",
                }}
              >
                <div style={{ fontSize: 12, color: T.muted }}>
                  {showTypeFormModal ? (
                    <span>
                      <strong style={{ color: T.teal }}>{typeFormData.headings.length}</strong> heading(s) currently configured for this type.
                    </span>
                  ) : (
                    <span>Total {headingOptions.length} headings in master table</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowManageHeadingModal(false);
                    setHeadingInput("");
                    setEditingHeading(null);
                    setHeadingSearchFilter("");
                  }}
                  style={{
                    padding: "7px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 7,
                    border: `1px solid ${T.border}`,
                    background: "white",
                    color: T.slate,
                    cursor: "pointer",
                  }}
                >
                  {showTypeFormModal ? "Done (Return to Type)" : "Done"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW SUMMARY TYPE MODAL ── */}
        {viewTypeObj && (
          <div
            style={S.overlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) setViewTypeObj(null);
            }}
          >
            <div style={{ ...S.modalBox, width: "min(620px, 92vw)", maxHeight: "85vh" }}>
              <div style={S.modalHead}>
                <span style={S.modalTitle}>
                  <Eye size={16} /> Summary Type — {viewTypeObj.summaryType}
                </span>
                <button style={S.modalClose} onClick={() => setViewTypeObj(null)}>
                  <X size={15} />
                </button>
              </div>

              <div style={{ padding: "20px 24px", overflowY: "auto", flexGrow: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase" }}>Type No: </span>
                    <strong style={{ color: T.teal }}>#{viewTypeObj.summaryNo}</strong>
                  </div>
                  <div>
                    <span style={pkgCss.countBadge}>
                      {viewTypeObj.headings?.length || 0} Headings
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: T.muted, marginBottom: 10 }}>
                  Ordered Headings / Sections
                </div>

                {!viewTypeObj.headings || viewTypeObj.headings.length === 0 ? (
                  <p style={{ color: T.muted, textAlign: "center", padding: 24, fontSize: 13 }}>
                    No headings configured for this Summary Type.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {viewTypeObj.headings.map((h, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 14px",
                          borderRadius: 8,
                          background: "#F8FAFC",
                          border: `1px solid ${T.border}`,
                          fontSize: 13,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: "#e0f2fe",
                            color: "#0284c7",
                            fontWeight: 700,
                            fontSize: 12,
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span style={{ fontWeight: 600, color: T.slate, flex: 1 }}>
                          {h.heading}
                        </span>
                        {h.defaultValue && h.defaultValue.trim() && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "#047857",
                              background: "#ecfdf5",
                              border: "1px solid #a7f3d0",
                              borderRadius: 4,
                              padding: "2px 8px",
                              maxWidth: 180,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontFamily: "monospace",
                            }}
                            title={`Predefined Default:\n${h.defaultValue}`}
                          >
                            Default: {h.defaultValue.replace(/\n/g, " ↵ ")}
                          </span>
                        )}
                        {h.headingNo && (
                          <span style={{ fontSize: 11, color: T.muted }}>
                            Code: {h.headingNo}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={S.modalFoot}>
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = viewTypeObj;
                    setViewTypeObj(null);
                    openEditType(toEdit);
                  }}
                  style={pkgCss.btn("primary")}
                >
                  <Edit size={13} /> Edit Headings
                </button>
                <button
                  type="button"
                  onClick={() => setViewTypeObj(null)}
                  style={{
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1px solid ${T.border}`,
                    borderRadius: 7,
                    background: "white",
                    color: T.muted,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Patient Search Modal ── */}
        <PatientSearchModal
          isOpen={showPatientModal}
          onClose={() => setShowPatientModal(false)}
          onSelect={handlePatientSelect}
          initialQuery={patientSearchQuery}
          mode="ip"
        />

        {/* ── CONSULTANT DOCTORS MODAL ── */}
        {showDoctorModal && (
          <div
            style={S.overlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDoctorModal(false);
                setDoctorSearchQuery("");
              }
            }}
          >
            <div
              style={{
                ...S.modalBox,
                width: "min(680px, 95vw)",
                maxHeight: "85vh",
              }}
            >
              <div style={S.modalHead}>
                <span style={S.modalTitle}>
                  <Stethoscope size={17} color={T.teal} /> Select Doctors for Consultant Section
                </span>
                <button
                  style={S.modalClose}
                  onClick={() => {
                    setShowDoctorModal(false);
                    setDoctorSearchQuery("");
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              <div style={{ padding: "16px 22px", flexGrow: 1, overflowY: "auto" }}>
                {/* Search & Help */}
                <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Search
                      size={15}
                      style={{
                        position: "absolute",
                        left: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: T.muted,
                      }}
                    />
                    <input
                      type="text"
                      autoFocus
                      value={doctorSearchQuery}
                      onChange={(e) => setDoctorSearchQuery(e.target.value)}
                      placeholder="Search Doctors..."
                      style={{
                        ...S.inp,
                        paddingLeft: 34,
                        width: "100%",
                        fontSize: 13,
                        borderColor: T.teal,
                      }}
                    />
                  </div>
                  {doctorSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setDoctorSearchQuery("")}
                      style={{
                        border: "none",
                        background: "#f1f5f9",
                        color: T.slate,
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: T.muted,
                    marginBottom: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Click any doctor to include or remove from the Consultant section notes.</span>
                  <span style={{ fontWeight: 600, color: T.teal }}>
                    {doctors.length} doctors available
                  </span>
                </div>

                {/* Primary doctor quick add if available */}
                {formData.doctor && (
                  <div
                    style={{
                      background: "#f0fdfa",
                      border: "1.5px dashed #0d9488",
                      borderRadius: 8,
                      padding: "10px 14px",
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#0f766e", textTransform: "uppercase" }}>
                        Primary Admitting Doctor
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#134e4a" }}>
                        {formData.doctor.toUpperCase()}
                      </div>
                    </div>
                    {isDoctorIncludedInNotes(formData.doctor) ? (
                      <button
                        type="button"
                        onClick={() => handleToggleDoctorInConsultant(formData.doctor)}
                        style={{
                          background: "#fee2e2",
                          border: "1px solid #f87171",
                          color: "#b91c1c",
                          padding: "5px 12px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ✓ Included (Click to Remove)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleDoctorInConsultant(formData.doctor)}
                        style={{
                          background: "#0d9488",
                          border: "none",
                          color: "#ffffff",
                          padding: "6px 14px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        + Include Primary Doctor
                      </button>
                    )}
                  </div>
                )}

                {/* Doctors Grid / List */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                  {filteredModalDoctors.map((doc, idx) => {
                    const upperName = (doc.employeeName || "").toUpperCase();
                    const included = isDoctorIncludedInNotes(upperName);
                    return (
                      <div
                        key={doc.employeeId || idx}
                        onClick={() => handleToggleDoctorInConsultant(upperName)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: included ? "1.5px solid #0d9488" : `1px solid ${T.border}`,
                          background: included ? "#f0fdfa" : "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          boxShadow: included ? "0 2px 6px rgba(13, 148, 136, 0.15)" : "none",
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: included ? "#0f766e" : T.slate }}>
                            {upperName}
                          </div>
                          {doc.department && doc.department !== "N/A" && (
                            <div style={{ fontSize: 11, color: T.muted }}>
                              {doc.department}
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: included ? "#0d9488" : "#f1f5f9",
                            color: included ? "#ffffff" : "#64748b",
                            flexShrink: 0,
                          }}
                        >
                          {included ? "✓ Included" : "+ Add"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {filteredModalDoctors.length === 0 && (
                  <div style={{ textAlign: "center", padding: "30px 20px", color: T.muted }}>
                    No doctors found matching "{doctorSearchQuery}".
                  </div>
                )}
              </div>

              <div style={{ ...S.modalFoot, justifyContent: "space-between", background: "#f8fafc" }}>
                <span style={{ fontSize: 12, color: T.muted }}>
                  Current Notes: <strong>{formData.notes ? formData.notes.split("\n").filter(Boolean).length : 0} line(s)</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowDoctorModal(false);
                    setDoctorSearchQuery("");
                  }}
                  style={{
                    background: T.teal,
                    color: "white",
                    border: "none",
                    borderRadius: 7,
                    padding: "7px 20px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── AI Summarize Review & Edit Modal ── */}
        {showAiModal && (
          <div
            style={S.overlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAiModal(false);
              }
            }}
          >
            <div
              style={{
                ...S.modalBox,
                width: "min(960px, 95vw)",
                maxHeight: "92vh",
              }}
            >
              <div style={S.modalHead}>
                <span style={S.modalTitle}>
                  <Sparkles size={17} color="#fde047" /> AI Clinical Notes Summary & Review
                  {aiModalField && (
                    <span
                      style={{
                        background: "rgba(255,255,255,0.18)",
                        padding: "2px 10px",
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        marginLeft: 8,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {aiModalField}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  style={S.modalClose}
                  onClick={() => setShowAiModal(false)}
                  title="Close without changes (Keeps actual sentence)"
                >
                  <X size={15} />
                </button>
              </div>

              <div style={{ ...S.modalBody, padding: "16px 20px" }}>
                {/* Notice banner */}
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 12.5,
                    color: "#166534",
                  }}
                >
                  <Sparkles size={16} color="#15803d" style={{ flexShrink: 0 }} />
                  <div>
                    Review and edit the AI summarized text on the right. Your actual clinical notes will <strong>only</strong> change after you click the <strong>Proceed</strong> button.
                  </div>
                </div>

                {/* 2-Column Comparison Layout */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                    gap: 16,
                  }}
                >
                  {/* Left Column: Actual / Original sentence */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      background: "#f8fafc",
                      border: `1px solid ${T.border}`,
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                        paddingBottom: 8,
                        borderBottom: `1px solid ${T.border}`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.slate,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <FileText size={15} color={T.muted} /> Actual / Original Sentence
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 10,
                          background: "#e2e8f0",
                          color: "#475569",
                        }}
                      >
                        Read-Only
                      </span>
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minHeight: 300,
                        maxHeight: 380,
                        overflowY: "auto",
                        fontSize: 13,
                        lineHeight: 1.65,
                        color: T.text,
                        whiteSpace: "pre-wrap",
                        background: T.white,
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      {aiModalOriginalText || (
                        <span style={{ color: T.muted, fontStyle: "italic" }}>
                          No original text recorded.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: AI Summarized text (Editable) */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      background: "#f0fdfa",
                      border: `1px solid #99f6e4`,
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                        paddingBottom: 8,
                        borderBottom: `1px solid #ccfbf1`,
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: T.tealDk,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Sparkles size={15} color={T.teal} /> AI Summarized Text
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 10,
                            background: "#ccfbf1",
                            color: T.tealDk,
                          }}
                        >
                          Editable
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {aiModalSummarizedText !== aiModalRawSummary && (
                          <button
                            type="button"
                            onClick={() => setAiModalSummarizedText(aiModalRawSummary)}
                            style={{
                              border: `1px solid ${T.border}`,
                              background: "white",
                              borderRadius: 5,
                              padding: "3px 8px",
                              fontSize: 11,
                              fontWeight: 600,
                              color: T.muted,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              cursor: "pointer",
                            }}
                            title="Reset back to unmodified AI output"
                          >
                            <RotateCcw size={11} /> Reset
                          </button>
                        )}

                        <div style={S.tabGroup}>
                          <button
                            type="button"
                            style={aiModalTab === "edit" ? S.tabBtnActive : S.tabBtn}
                            onClick={() => setAiModalTab("edit")}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            style={aiModalTab === "preview" ? S.tabBtnActive : S.tabBtn}
                            onClick={() => setAiModalTab("preview")}
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>

                    {aiModalTab === "edit" ? (
                      <textarea
                        style={{
                          flex: 1,
                          minHeight: 300,
                          maxHeight: 380,
                          resize: "none",
                          fontSize: 13,
                          lineHeight: 1.65,
                          fontFamily: "inherit",
                          color: T.text,
                          background: T.white,
                          border: `1.5px solid ${T.teal}`,
                          borderRadius: 8,
                          padding: 12,
                          outline: "none",
                          boxShadow: `0 0 0 3px ${T.teal}14`,
                        }}
                        value={aiModalSummarizedText}
                        onChange={(e) => setAiModalSummarizedText(e.target.value)}
                        placeholder="Edit AI summarized text before proceeding..."
                        autoFocus
                      />
                    ) : (
                      <div
                        style={{
                          flex: 1,
                          minHeight: 300,
                          maxHeight: 380,
                          overflowY: "auto",
                          fontSize: 13,
                          lineHeight: 1.65,
                          color: T.text,
                          background: T.white,
                          border: `1px solid ${T.border}`,
                          borderRadius: 8,
                          padding: 12,
                        }}
                      >
                        {aiModalSummarizedText && aiModalSummarizedText.trim() ? (
                          aiModalSummarizedText.split("\n").map((line, idx) => (
                            <div key={idx} style={{ minHeight: "1.4em", marginBottom: 3 }}>
                              {renderFormattedText(line)}
                            </div>
                          ))
                        ) : (
                          <span style={{ color: T.muted, fontStyle: "italic" }}>
                            No text to preview.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  ...S.modalFoot,
                  justifyContent: "space-between",
                  background: "#f8fafc",
                }}
              >
                <div style={{ fontSize: 12, color: T.muted, display: "flex", alignItems: "center", gap: 5 }}>
                  <RotateCcw size={13} color={T.muted} />
                  <span>Click Cancel to discard. Your actual note will remain unchanged.</span>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowAiModal(false)}
                    style={{
                      padding: "8px 18px",
                      fontSize: 13,
                      fontWeight: 600,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      background: "white",
                      color: T.textSm,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedAiSummary}
                    style={{
                      padding: "8px 22px",
                      fontSize: 13,
                      fontWeight: 700,
                      border: "none",
                      borderRadius: 8,
                      background: `linear-gradient(135deg, ${T.teal}, ${T.tealDk})`,
                      color: "white",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)",
                      transition: "all 0.15s",
                    }}
                  >
                    <CheckCircle size={15} />
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Summary;
