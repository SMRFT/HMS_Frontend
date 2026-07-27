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
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import ICD11SearchComponent from "./ICD11SearchComponent";
import { PageWrapper, colors } from "../GlobalStyles";

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

  const noteFields = [
    "ONCOLOGY NOTES",
    "SPECIAL NEEDS AFTER DISCHARGE",
    "VACCINATION HISTORY",
    "DISCHARGE TYPE",
    "ADMISSION DIAGNOSIS",
    "DISCHARGE DIAGNOSIS",
    "CONSULTANT",
    "BRIEF HISTORY",
    "SIGNIFICANT PAST MEDICAL AND SURGICAL HISTORY",
    "GENERAL EXAMINATION",
    "VITALS",
    "COURSE IN THE HOSPITAL",
    "INVESTIGATIONS",
    "SURGERIES / PROCEDURES PERFORMED",
    "SPECIFIC MEDICATION GIVEN DURING HOSPITAL STAY",
    "ADVICE ON DIET",
    "ADVICE ON LIFE STYLE",
    "ADVICE ON IMMUNIZATION",
    "CONDITION ON DISCHARGE",
    "ADVICE ON DISCHARGE",
    "DOA AND DOD",
  ];

  const emptyForm = {
    date: "",
    ipNo: "",
    uhid: "",
    patient: "",
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
    summaryType: "",
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
  const notesRef = useRef(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      const r = await apiRequest(`${HMSURL}doctor_list_diagnostics/`, "GET");
      if (r.success) setDoctors(r.data);
    };
    fetchDoctors();
  }, [HMSURL]);

  useEffect(() => {
    const fetchSummaryTypes = async () => {
      const r = await apiRequest(`${HMSURL}summary-type/`, "GET");
      if (r.success) setSummaryTypeOptions(r.data);
    };
    fetchSummaryTypes();
  }, [HMSURL]);

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

  const handleButtonClick = (fieldName) => {
    setSelectedField(fieldName);
    setFormData((prev) => {
      const fd = setFieldValue(prev.fieldsData, prev.currentField, prev.notes);
      return {
        ...prev,
        fieldsData: fd,
        currentField: fieldName,
        notes: getFieldValue(fd, fieldName),
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
      fetchSummaries({
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
        diseaseCode: dp.diseaseCode,
        disease: dp.disease,
        selectedDiseases,
        fieldsData: filtered,
      }
    );
    if (r.success) {
      Swal.fire("Success", "Summary updated successfully!", "success");
      resetForm();
      fetchSummaries({
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
      approve_time: new Date().toISOString(),
    });
    if (r.success) {
      setSummaries((prev) =>
        prev.map((s) => (s.ipNo === ipNo ? { ...s, approve: true } : s))
      );
      Swal.fire("Approved!", "Summary approved successfully!", "success");
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
  const fmtDateTime = (d) =>
    d
      ? new Date(d).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      : "—";

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
                  readOnly={isEditMode}
                  placeholder="IP No"
                />
                {!isEditMode && (
                  <button style={S.searchMicroBtn} onClick={fetchIpPatient}>
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
              <Fld label="Patient Name">
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
                <select
                  name="summaryType"
                  value={formData.summaryType}
                  onChange={handleChange}
                  style={S.sel}
                >
                  <option value="">— Type —</option>
                  {summaryTypeOptions.map((t, i) => (
                    <option key={t.summaryNo || i} value={t.summaryType}>
                      {t.summaryType}
                    </option>
                  ))}
                </select>
              </Fld>
            </div>

            {/* Row 3: 2 cols */}
            <div style={S.grid(2)}>
              <Fld label="Heading">
                <CInp
                  name="heading"
                  value={formData.heading}
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

            <textarea
              ref={notesRef}
              style={S.textarea}
              name="notes"
              placeholder="Type clinical notes here…"
              value={formData.notes}
              onChange={handleChange}
              onFocus={(e) => {
                e.target.style.borderColor = T.teal;
                e.target.style.boxShadow = `0 0 0 3px ${T.teal}18`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = T.border;
                e.target.style.boxShadow = "none";
              }}
            />

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
                        {s.patient}
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
      </div>
    </PageWrapper>
  );
};

export default Summary;
