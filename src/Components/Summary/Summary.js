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

  // Summary Type modal state
  const [showAddSummaryTypeModal, setShowAddSummaryTypeModal] = useState(false);
  const [newSummaryTypeInput, setNewSummaryTypeInput] = useState("");
  const [editingSummaryType, setEditingSummaryType] = useState(null);
  const [savingSummaryType, setSavingSummaryType] = useState(false);

  // Heading modal state
  const [showAddHeadingModal, setShowAddHeadingModal] = useState(false);
  const [newHeadingInput, setNewHeadingInput] = useState("");
  const [editingHeading, setEditingHeading] = useState(null);
  const [savingHeading, setSavingHeading] = useState(false);

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
    if (r.success) setDoctors(r.data);
  };

  const fetchSummaryTypes = async () => {
    const r = await apiRequest(`${HMSURL}summary-type/`, "GET");
    if (r.success) setSummaryTypeOptions(r.data);
  };

  const fetchSummaryHeadings = async () => {
    const r = await apiRequest(`${HMSURL}summary-heading/`, "GET");
    if (r.success) setHeadingOptions(r.data);
  };

  const fetchClinicalNotesTitles = async () => {
    try {
      const r = await apiRequest(`${HMSURL}summary-clinical-notes/`, "GET");
      if (r.success && Array.isArray(r.data) && r.data.length > 0) {
        const sorted = [...r.data].sort((a, b) => {
          const numA = Number(a.title_no) || 0;
          const numB = Number(b.title_no) || 0;
          return numA - numB;
        });
        setNoteFields(
          sorted.map((item) => item.title_name).filter(Boolean)
        );
      }
    } catch (err) {
      console.error("Failed to fetch clinical notes titles:", err);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchSummaryTypes();
    fetchSummaryHeadings();
    fetchClinicalNotesTitles();
  }, [HMSURL]);

  const handleSummaryTypeSelect = (e) => {
    const sNo = e.target.value;
    const found = summaryTypeOptions.find(
      (t) => String(t.summaryNo) === String(sNo)
    );
    setFormData((prev) => ({
      ...prev,
      summaryNo: sNo,
      summaryType: found ? found.summaryType : "",
    }));
  };

  const handleHeadingSelect = (e) => {
    const hNo = e.target.value;
    const found = headingOptions.find(
      (h) => String(h.headingNo) === String(hNo)
    );
    setFormData((prev) => ({
      ...prev,
      headingNo: hNo,
      heading: found ? found.heading : "",
    }));
  };

  const handleSaveSummaryType = async (e) => {
    if (e) e.preventDefault();
    const val = newSummaryTypeInput.trim();
    if (!val) {
      Swal.fire("Validation", "Please enter a summary type", "warning");
      return;
    }
    setSavingSummaryType(true);

    if (editingSummaryType) {
      // Update
      const r = await apiRequest(
        `${HMSURL}summary-type/update/${encodeURIComponent(editingSummaryType.summaryNo)}/`,
        "POST",
        { summaryType: val }
      );
      setSavingSummaryType(false);
      if (r.success) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Summary Type updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        if (
          String(formData.summaryNo) === String(editingSummaryType.summaryNo) ||
          formData.summaryType === editingSummaryType.summaryType
        ) {
          setFormData((prev) => ({
            ...prev,
            summaryNo: editingSummaryType.summaryNo,
            summaryType: val,
          }));
        }
        setEditingSummaryType(null);
        setNewSummaryTypeInput("");
        await fetchSummaryTypes();
      } else {
        Swal.fire("Error", r.error || "Failed to update summary type", "error");
      }
    } else {
      // Create
      const r = await apiRequest(`${HMSURL}summary-type/`, "POST", {
        summaryType: val,
      });
      setSavingSummaryType(false);
      if (r.success) {
        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Summary Type added successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        const created = r.data?.data;
        setNewSummaryTypeInput("");
        await fetchSummaryTypes();
        if (created) {
          setFormData((prev) => ({
            ...prev,
            summaryNo: created.summaryNo,
            summaryType: created.summaryType,
          }));
        }
      } else {
        Swal.fire("Error", r.error || "Failed to add summary type", "error");
      }
    }
  };

  const handleDeleteSummaryType = async (summaryNo, typeName) => {
    const result = await Swal.fire({
      title: "Delete Summary Type?",
      text: `Are you sure you want to delete "${typeName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: T.red,
      cancelButtonColor: T.muted,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      const r = await apiRequest(
        `${HMSURL}summary-type/delete/${encodeURIComponent(summaryNo)}/`,
        "POST"
      );
      if (r.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Summary Type deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        if (
          String(formData.summaryNo) === String(summaryNo) ||
          formData.summaryType === typeName
        ) {
          setFormData((prev) => ({ ...prev, summaryNo: "", summaryType: "" }));
        }
        if (editingSummaryType?.summaryNo === summaryNo) {
          setEditingSummaryType(null);
          setNewSummaryTypeInput("");
        }
        await fetchSummaryTypes();
      } else {
        Swal.fire("Error", r.error || "Failed to delete summary type", "error");
      }
    }
  };

  const handleSaveHeading = async (e) => {
    if (e) e.preventDefault();
    const val = newHeadingInput.trim();
    if (!val) {
      Swal.fire("Validation", "Please enter a heading", "warning");
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
          text: "Heading updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        if (
          String(formData.headingNo) === String(editingHeading.headingNo) ||
          formData.heading === editingHeading.heading
        ) {
          setFormData((prev) => ({
            ...prev,
            headingNo: editingHeading.headingNo,
            heading: val,
          }));
        }
        setEditingHeading(null);
        setNewHeadingInput("");
        await fetchSummaryHeadings();
      } else {
        Swal.fire("Error", r.error || "Failed to update heading", "error");
      }
    } else {
      // Create
      const r = await apiRequest(`${HMSURL}summary-heading/`, "POST", {
        heading: val,
      });
      setSavingHeading(false);
      if (r.success) {
        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Heading added successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        const created = r.data?.data;
        setNewHeadingInput("");
        await fetchSummaryHeadings();
        if (created) {
          setFormData((prev) => ({
            ...prev,
            headingNo: created.headingNo,
            heading: created.heading,
          }));
        }
      } else {
        Swal.fire("Error", r.error || "Failed to add heading", "error");
      }
    }
  };

  const handleDeleteHeading = async (headingNo, headingName) => {
    const result = await Swal.fire({
      title: "Delete Heading?",
      text: `Are you sure you want to delete "${headingName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: T.red,
      cancelButtonColor: T.muted,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      const r = await apiRequest(
        `${HMSURL}summary-heading/delete/${encodeURIComponent(headingNo)}/`,
        "POST"
      );
      if (r.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Heading deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        if (
          String(formData.headingNo) === String(headingNo) ||
          formData.heading === headingName
        ) {
          setFormData((prev) => ({ ...prev, headingNo: "", heading: "" }));
        }
        if (editingHeading?.headingNo === headingNo) {
          setEditingHeading(null);
          setNewHeadingInput("");
        }
        await fetchSummaryHeadings();
      } else {
        Swal.fire("Error", r.error || "Failed to delete heading", "error");
      }
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

  const handlePatientSelect = (item) => {
    const selectedIp = item.ipNumber || item.ip_number || "";
    if (selectedIp) {
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
    const r = await apiRequest(
      `${HMSURL}ip-patient/${encodeURIComponent(ip)}/`,
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
        doctor: d.admittingDoctor || "",
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
      const fd = setFieldValue(prev.fieldsData, prev.currentField, prev.notes);
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
        }
      }
      return {
        ...prev,
        fieldsData: fd,
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
    let fds = formData.fieldsData;
    if (formData.currentField && formData.notes) {
      fds = setFieldValue(
        formData.fieldsData,
        formData.currentField,
        formData.notes
      );
      setFormData((prev) => ({ ...prev, fieldsData: fds }));
    }
    const dp = prepareDiseasesPayload();
    const payload = {
      ...formData,
      summaryType: undefined,
      heading: undefined,
      date: new Date().toISOString(),
      diseaseCode: dp.diseaseCode,
      disease: dp.disease,
      selectedDiseases,
      fieldsData: fds.filter((f) => f.key !== "undefined" && f.value !== ""),
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
    const dp = prepareDiseasesPayload();
    const r = await apiRequest(
      `${HMSURL}update-summary/${editingIpNo}/`,
      "PATCH",
      {
        ...formData,
        summaryType: undefined,
        heading: undefined,
        diseaseCode: dp.diseaseCode,
        disease: dp.disease,
        selectedDiseases,
        fieldsData: filtered,
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
      setFormData({
        ...d,
        summaryNo: d.summaryNo || "",
        summaryType: d.summaryType || "",
        headingNo: d.headingNo || "",
        heading: d.heading || "",
        dodTime: d.dodTime || "17:00",
        notes: "",
        fieldsData: parsedFD,
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
                      openIpSearchModal();
                    }
                  }}
                  readOnly={isEditMode}
                  placeholder="IP No"
                />
                {!isEditMode && (
                  <button
                    type="button"
                    style={S.searchMicroBtn}
                    onClick={openIpSearchModal}
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
                  value={formData.doctor}
                  onChange={handleChange}
                  style={S.sel}
                >
                  <option value="">— Doctor —</option>
                  {doctors.map((doc, i) => (
                    <option key={doc.employeeId || i} value={doc.employeeName}>
                      {doc.employeeName}
                    </option>
                  ))}
                </select>
              </Fld>
              <Fld label="Summary Type">
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <select
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
                    {summaryTypeOptions.map((t, i) => (
                      <option key={t.summaryNo || i} value={t.summaryNo}>
                        {t.summaryType}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSummaryTypeInput("");
                      setEditingSummaryType(null);
                      setShowAddSummaryTypeModal(true);
                    }}
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
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <select
                    name="headingNo"
                    value={formData.headingNo}
                    onChange={handleHeadingSelect}
                    style={{ ...S.sel, flex: 1 }}
                  >
                    <option value="">— Heading —</option>
                    {formData.headingNo &&
                      !headingOptions.some(
                        (h) =>
                          String(h.headingNo) === String(formData.headingNo)
                      ) && (
                        <option value={formData.headingNo}>
                          {formData.heading || formData.headingNo}
                        </option>
                      )}
                    {headingOptions.map((h, i) => (
                      <option key={h.headingNo || i} value={h.headingNo}>
                        {h.heading}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setNewHeadingInput("");
                      setEditingHeading(null);
                      setShowAddHeadingModal(true);
                    }}
                    title="Manage Headings"
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
              Clinical Fields
            </div>
            {noteFields.map((field) => (
              <div
                key={field}
                style={S.sidebarItem(selectedField === field)}
                onClick={() => handleButtonClick(field)}
              >
                {field}
              </div>
            ))}
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

        {/* ── MANAGE SUMMARY TYPE MODAL ── */}
        {showAddSummaryTypeModal && (
          <div
            style={S.overlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddSummaryTypeModal(false);
                setEditingSummaryType(null);
                setNewSummaryTypeInput("");
              }
            }}
          >
            <div style={{ ...S.modalBox, width: "min(560px, 94vw)" }}>
              <div style={S.modalHead}>
                <span style={S.modalTitle}>
                  <Plus size={16} /> Manage Summary Types
                </span>
                <button
                  style={S.modalClose}
                  onClick={() => {
                    setShowAddSummaryTypeModal(false);
                    setEditingSummaryType(null);
                    setNewSummaryTypeInput("");
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Input & Action Form */}
                <form onSubmit={handleSaveSummaryType}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <span style={S.lbl}>
                        {editingSummaryType ? "Edit Summary Type" : "New Summary Type"}
                      </span>
                      <CInp
                        value={newSummaryTypeInput}
                        onChange={(e) => setNewSummaryTypeInput(e.target.value)}
                        placeholder="e.g. DAY CARE SUMMARY"
                        autoFocus
                      />
                    </div>
                    {editingSummaryType && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSummaryType(null);
                          setNewSummaryTypeInput("");
                        }}
                        style={{
                          height: 38,
                          padding: "0 12px",
                          fontSize: 12,
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
                    )}
                    <button
                      type="submit"
                      disabled={savingSummaryType}
                      style={{
                        ...S.btn(editingSummaryType ? "primary" : "primary"),
                        height: 38,
                        padding: "0 16px",
                        fontSize: 12.5,
                        opacity: savingSummaryType ? 0.7 : 1,
                        cursor: savingSummaryType ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {savingSummaryType
                        ? "Saving..."
                        : editingSummaryType
                          ? "Update"
                          : "Add Type"}
                    </button>
                  </div>
                </form>

                {/* Existing Types List */}
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                  <span style={{ ...S.lbl, color: T.teal, marginBottom: 8, display: "block" }}>
                    Existing Summary Types ({summaryTypeOptions.length})
                  </span>

                  <div
                    style={{
                      maxHeight: 280,
                      overflowY: "auto",
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      background: T.bg,
                    }}
                  >
                    {summaryTypeOptions.length === 0 ? (
                      <p style={{ textAlign: "center", padding: 20, color: T.muted, fontSize: 13 }}>
                        No summary types available.
                      </p>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={{ ...S.th, width: 60 }}>#</th>
                            <th style={S.th}>Summary Type</th>
                            <th style={{ ...S.th, width: 90, textAlign: "center" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summaryTypeOptions.map((t, i) => {
                            const isCurrentEdit = editingSummaryType?.summaryNo === t.summaryNo;
                            return (
                              <tr
                                key={t.summaryNo || i}
                                style={{
                                  background: isCurrentEdit
                                    ? `${T.teal}15`
                                    : i % 2 === 0
                                      ? T.white
                                      : T.bg,
                                }}
                              >
                                <td style={{ ...S.td, fontSize: 12, fontWeight: 600, color: T.muted }}>
                                  {t.summaryNo || i + 1}
                                </td>
                                <td style={{ ...S.td, fontSize: 12.5, fontWeight: 500 }}>
                                  {t.summaryType}
                                </td>
                                <td style={{ ...S.td, textAlign: "center" }}>
                                  <div style={{ display: "inline-flex", gap: 6, justifyContent: "center" }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingSummaryType(t);
                                        setNewSummaryTypeInput(t.summaryType);
                                      }}
                                      title="Edit"
                                      style={S.actionBtn(T.teal)}
                                    >
                                      <Edit size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSummaryType(t.summaryNo, t.summaryType)}
                                      title="Delete"
                                      style={S.actionBtn(T.red)}
                                    >
                                      <Trash2 size={13} />
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
                    setShowAddSummaryTypeModal(false);
                    setEditingSummaryType(null);
                    setNewSummaryTypeInput("");
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

        {/* ── MANAGE HEADING MODAL ── */}
        {showAddHeadingModal && (
          <div
            style={S.overlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddHeadingModal(false);
                setEditingHeading(null);
                setNewHeadingInput("");
              }
            }}
          >
            <div style={{ ...S.modalBox, width: "min(560px, 94vw)" }}>
              <div style={S.modalHead}>
                <span style={S.modalTitle}>
                  <Plus size={16} /> Manage Headings
                </span>
                <button
                  style={S.modalClose}
                  onClick={() => {
                    setShowAddHeadingModal(false);
                    setEditingHeading(null);
                    setNewHeadingInput("");
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Input & Action Form */}
                <form onSubmit={handleSaveHeading}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <span style={S.lbl}>
                        {editingHeading ? "Edit Heading" : "New Heading"}
                      </span>
                      <CInp
                        value={newHeadingInput}
                        onChange={(e) => setNewHeadingInput(e.target.value)}
                        placeholder="e.g. CLINICAL SUMMARY"
                        autoFocus
                      />
                    </div>
                    {editingHeading && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingHeading(null);
                          setNewHeadingInput("");
                        }}
                        style={{
                          height: 38,
                          padding: "0 12px",
                          fontSize: 12,
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
                    )}
                    <button
                      type="submit"
                      disabled={savingHeading}
                      style={{
                        ...S.btn(editingHeading ? "primary" : "primary"),
                        height: 38,
                        padding: "0 16px",
                        fontSize: 12.5,
                        opacity: savingHeading ? 0.7 : 1,
                        cursor: savingHeading ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {savingHeading
                        ? "Saving..."
                        : editingHeading
                          ? "Update"
                          : "Add Heading"}
                    </button>
                  </div>
                </form>

                {/* Existing Headings List */}
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                  <span style={{ ...S.lbl, color: T.teal, marginBottom: 8, display: "block" }}>
                    Existing Headings ({headingOptions.length})
                  </span>

                  <div
                    style={{
                      maxHeight: 280,
                      overflowY: "auto",
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      background: T.bg,
                    }}
                  >
                    {headingOptions.length === 0 ? (
                      <p style={{ textAlign: "center", padding: 20, color: T.muted, fontSize: 13 }}>
                        No headings available.
                      </p>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={{ ...S.th, width: 60 }}>#</th>
                            <th style={S.th}>Heading</th>
                            <th style={{ ...S.th, width: 90, textAlign: "center" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {headingOptions.map((h, i) => {
                            const isCurrentEdit = editingHeading?.headingNo === h.headingNo;
                            return (
                              <tr
                                key={h.headingNo || i}
                                style={{
                                  background: isCurrentEdit
                                    ? `${T.teal}15`
                                    : i % 2 === 0
                                      ? T.white
                                      : T.bg,
                                }}
                              >
                                <td style={{ ...S.td, fontSize: 12, fontWeight: 600, color: T.muted }}>
                                  {h.headingNo || i + 1}
                                </td>
                                <td style={{ ...S.td, fontSize: 12.5, fontWeight: 500 }}>
                                  {h.heading}
                                </td>
                                <td style={{ ...S.td, textAlign: "center" }}>
                                  <div style={{ display: "inline-flex", gap: 6, justifyContent: "center" }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingHeading(h);
                                        setNewHeadingInput(h.heading);
                                      }}
                                      title="Edit"
                                      style={S.actionBtn(T.teal)}
                                    >
                                      <Edit size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteHeading(h.headingNo, h.heading)}
                                      title="Delete"
                                      style={S.actionBtn(T.red)}
                                    >
                                      <Trash2 size={13} />
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
                    setShowAddHeadingModal(false);
                    setEditingHeading(null);
                    setNewHeadingInput("");
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

        {/* ── Patient Search Modal ── */}
        <PatientSearchModal
          isOpen={showPatientModal}
          onClose={() => setShowPatientModal(false)}
          onSelect={handlePatientSelect}
          initialQuery={patientSearchQuery}
          mode="ip"
        />

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
