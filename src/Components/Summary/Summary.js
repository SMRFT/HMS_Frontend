import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
import ICD11SearchComponent from "./ICD11SearchComponent";
import {
  PageWrapper,
  Container,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
} from "../GlobalStyles";

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const tokens = {
  navy: "#0d9488",
  slate: "#1E2D45",
  sky: "#2563EB",
  skyL: "#3B82F6",
  teal: "#0EA5E9",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  muted: "#64748B",
  border: "#E2E8F0",
  bg: "#F0F4F8",
  white: "#FFFFFF",
  card: "#FFFFFF",
  text: "#0F172A",
  textSm: "#475569",
};

/* ─── Inline styles ──────────────────────────────────────────────────────── */
const css = {
  page: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${tokens.bg} 0%, #E8EFF8 100%)`,
    fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
    padding: "32px 24px",
  },
  inner: { maxWidth: 1400, margin: "0 auto" },

  /* Page header */
  pageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: tokens.navy,
    letterSpacing: "-0.5px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  titleDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${tokens.sky}, ${tokens.teal})`,
    display: "inline-block",
  },
  dateBadge: {
    background: tokens.slate,
    color: tokens.white,
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 500,
  },

  /* Edit banner */
  editBanner: {
    background: `linear-gradient(90deg, ${tokens.sky}18, ${tokens.teal}18)`,
    border: `1px solid ${tokens.sky}40`,
    borderRadius: 10,
    padding: "10px 18px",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    color: tokens.slate,
    fontWeight: 500,
  },
  editBannerDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: tokens.sky,
    flexShrink: 0,
  },

  /* Card */
  card: {
    background: tokens.card,
    borderRadius: 16,
    border: `1px solid ${tokens.border}`,
    boxShadow: "0 4px 24px rgba(10,22,40,.07)",
    marginBottom: 24,
    padding: "24px 28px",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: tokens.sky,
    marginBottom: 18,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sectionLine: {
    width: 24,
    height: 3,
    borderRadius: 2,
    background: `linear-gradient(90deg, ${tokens.sky}, ${tokens.teal})`,
  },

  /* Grid */
  grid: (cols) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: "14px 18px",
  }),

  /* Field */
  fieldWrap: { display: "flex", flexDirection: "column", gap: 5 },
  label: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    color: tokens.muted,
  },
  input: {
    height: 38,
    padding: "0 12px",
    fontSize: 14,
    color: tokens.text,
    background: tokens.white,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 8,
    outline: "none",
    transition: "border-color .2s",
    width: "100%",
    fontFamily: "inherit",
  },
  inputFocus: { borderColor: tokens.sky },
  select: {
    height: 38,
    padding: "0 12px",
    fontSize: 14,
    color: tokens.text,
    background: tokens.white,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 8,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    cursor: "pointer",
  },

  /* Search button */
  searchBtn: {
    marginTop: 6,
    height: 32,
    padding: "0 14px",
    fontSize: 12,
    fontWeight: 600,
    background: `linear-gradient(135deg, ${tokens.sky}, ${tokens.teal})`,
    color: tokens.white,
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    letterSpacing: "0.3px",
  },

  /* Notes layout */
  notesLayout: { display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 },

  /* Sidebar */
  sidebar: {
    background: tokens.card,
    borderRadius: 16,
    border: `1px solid ${tokens.border}`,
    boxShadow: "0 4px 24px rgba(10,22,40,.07)",
    overflow: "hidden",
  },
  sidebarHeader: {
    padding: "14px 16px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: tokens.white,
    background: `linear-gradient(135deg, ${tokens.navy}, ${tokens.slate})`,
  },
  sidebarItem: (active) => ({
    padding: "9px 14px",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    color: active ? tokens.white : tokens.textSm,
    background: active
      ? `linear-gradient(90deg, ${tokens.sky}, ${tokens.teal})`
      : "transparent",
    borderLeft: active ? `3px solid ${tokens.teal}` : "3px solid transparent",
    transition: "all .15s",
    borderBottom: `1px solid ${tokens.border}`,
  }),

  /* Notes area */
  notesCard: {
    background: tokens.card,
    borderRadius: 16,
    border: `1px solid ${tokens.border}`,
    boxShadow: "0 4px 24px rgba(10,22,40,.07)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: tokens.navy,
    letterSpacing: "-0.2px",
  },
  textarea: {
    minHeight: 620,
    resize: "vertical",
    padding: 14,
    fontSize: 13.5,
    color: tokens.text,
    background: tokens.bg,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 10,
    outline: "none",
    fontFamily: "inherit",
    lineHeight: 1.6,
  },

  /* Action row */
  actionRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  outlineBtn: (color = tokens.sky) => ({
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 600,
    border: `1.5px solid ${color}`,
    color: color,
    background: "transparent",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all .15s",
  }),

  /* Primary/danger buttons */
  btn: (variant = "primary") => {
    const map = {
      primary: {
        bg: `linear-gradient(135deg, ${tokens.sky}, ${tokens.teal})`,
        color: tokens.white,
      },
      danger: {
        bg: `linear-gradient(135deg, ${tokens.red}, #F87171)`,
        color: tokens.white,
      },
      success: {
        bg: `linear-gradient(135deg, ${tokens.green}, #34D399)`,
        color: tokens.white,
      },
      ghost: { bg: tokens.slate, color: tokens.white },
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
      transition: "opacity .15s",
      letterSpacing: "0.2px",
    };
  },

  /* Table */
  tableWrap: {
    background: tokens.card,
    borderRadius: 16,
    border: `1px solid ${tokens.border}`,
    boxShadow: "0 4px 24px rgba(10,22,40,.07)",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "16px 24px",
    background: `linear-gradient(135deg, ${tokens.navy}, ${tokens.slate})`,
    fontSize: 15,
    fontWeight: 700,
    color: tokens.white,
    letterSpacing: "-0.2px",
  },
  th: {
    padding: "11px 16px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: tokens.muted,
    background: tokens.bg,
    borderBottom: `2px solid ${tokens.border}`,
  },
  td: {
    padding: "11px 16px",
    fontSize: 13,
    color: tokens.text,
    borderBottom: `1px solid ${tokens.border}`,
    verticalAlign: "middle",
  },
  statusBadge: (approved) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    background: approved ? `${tokens.green}18` : `${tokens.amber}18`,
    color: approved ? tokens.green : tokens.amber,
    border: `1px solid ${approved ? tokens.green : tokens.amber}40`,
  }),
  statusDot: (approved) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: approved ? tokens.green : tokens.amber,
  }),

  /* Modal */
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10,22,40,.6)",
    backdropFilter: "blur(4px)",
    zIndex: 1050,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    background: tokens.white,
    borderRadius: 16,
    width: "min(700px, 94vw)",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 80px rgba(10,22,40,.25)",
    overflow: "hidden",
  },
  modalHead: {
    padding: "18px 24px",
    background: `linear-gradient(135deg, ${tokens.navy}, ${tokens.slate})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  modalTitle: { fontSize: 16, fontWeight: 700, color: tokens.white },
  modalClose: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(255,255,255,.15)",
    border: "none",
    color: tokens.white,
    cursor: "pointer",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: { padding: 20, overflowY: "auto", flexGrow: 1 },
  modalFoot: {
    padding: "14px 20px",
    borderTop: `1px solid ${tokens.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    flexShrink: 0,
  },
  invCard: (selected, warned) => ({
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 10,
    cursor: "pointer",
    transition: "all .15s",
    border: selected
      ? `2px solid ${tokens.sky}`
      : warned
        ? `2px solid ${tokens.amber}`
        : `1.5px solid ${tokens.border}`,
    background: selected
      ? `${tokens.sky}10`
      : warned
        ? `${tokens.amber}08`
        : tokens.white,
    boxShadow: selected ? `0 2px 12px ${tokens.sky}30` : "none",
  }),
};

/* ─── Tiny helpers ───────────────────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div style={css.fieldWrap}>
    <span style={css.label}>{label}</span>
    {children}
  </div>
);

const Inp = ({ style, ...props }) => (
  <input
    style={{ ...css.input, ...style }}
    onFocus={(e) => (e.target.style.borderColor = tokens.sky)}
    onBlur={(e) => (e.target.style.borderColor = tokens.border)}
    {...props}
  />
);

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
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]",
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
    "CONDITION ON DISCHARGE",
    "ADVICE ON DISCHARGE",
    "DOA AND DOD",
  ];

  const [formData, setFormData] = useState({
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
    fieldsData: {},
    currentField: "",
    approve: false,
    approve_time: null,
  });

  const notesRef = useRef(null);

  /* ── Fetch doctors ── */
  useEffect(() => {
    const fetchDoctors = async () => {
      const result = await apiRequest(
        `${HMSURL}doctor_list_diagnostics/`,
        "GET",
      );
      if (result.success) setDoctors(result.data);
      else console.error("Failed to fetch doctors:", result.error);
    };
    fetchDoctors();
  }, [HMSURL]);

  /* ── Fetch summary types ── */
  useEffect(() => {
    const fetchSummaryTypes = async () => {
      const result = await apiRequest(`${HMSURL}summary-type/`, "GET");
      if (result.success) {
        setSummaryTypeOptions(result.data);
      } else {
        console.error("Failed to fetch summary types:", result.error);
      }
    };
    fetchSummaryTypes();
  }, [HMSURL]);

  /* ── Fetch summaries ── */
  const fetchSummaries = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.fromDate) query.append("fromDate", params.fromDate);
    if (params.toDate) query.append("toDate", params.toDate);
    if (params.summaryType) query.append("summaryType", params.summaryType);
    const url = `${HMSURL}summaries/${query.toString() ? "?" + query.toString() : ""}`;
    const result = await apiRequest(url, "GET");
    if (result.success) setSummaries(result.data);
    else console.error("Error fetching summaries:", result.error);
  };

  useEffect(() => {
    fetchSummaries({
      fromDate: new Date().toISOString().split("T")[0],
      toDate: new Date().toISOString().split("T")[0],
    });
  }, []);

  /* ── Fetch IP patient ── */
  const fetchIpPatient = async (overrideIp) => {
    const ipToFetch = typeof overrideIp === "string" ? overrideIp : formData.ipNo;
    if (!ipToFetch) {
      alert("Please enter IP Number");
      return;
    }
    const result = await apiRequest(
      `${HMSURL}ip-patient/${encodeURIComponent(ipToFetch)}/`,
      "GET",
    );
    if (result.success) {
      const d = result.data;
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
      alert("Patient not found");
    }
  };

  useEffect(() => {
    if (location.state && location.state.ipNo) {
      setFormData((prev) => ({ ...prev, ipNo: location.state.ipNo }));
      fetchIpPatient(location.state.ipNo);
      // Clear state so it doesn't refetch if the user navigates away and back
      navigate(location.pathname, { replace: true, state: {} });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  /* ── Investigations ── */
  const fetchInvestigations = async () => {
    if (!formData.ipNo?.trim()) {
      alert("Please enter a valid IP Number first");
      return;
    }
    setLoading(true);
    setInvestigations([]);
    setSelectedInvestigations([]);
    const result = await apiRequest(
      `${HMSURL}patient-investigations/${encodeURIComponent(formData.ipNo)}/`,
      "GET",
    );
    setLoading(false);
    if (
      result.success &&
      Array.isArray(result.data) &&
      result.data.length > 0
    ) {
      setInvestigations(result.data);
      setShowInvestigations(true);
    } else {
      alert("No investigations found for this patient");
    }
  };

  const toggleInvestigationSelection = (inv) => {
    setSelectedInvestigations((prev) => {
      const exists = prev.some(
        (i) =>
          i.reportType === inv.reportType &&
          i.investigation === inv.investigation,
      );
      return exists
        ? prev.filter(
            (i) =>
              !(
                i.reportType === inv.reportType &&
                i.investigation === inv.investigation
              ),
          )
        : [...prev, inv];
    });
  };

  const addInvestigationsToNotes = () => {
    if (!selectedInvestigations.length) {
      alert("Please select at least one investigation");
      return;
    }
    let text = "INVESTIGATIONS:\n";
    selectedInvestigations.forEach((inv, idx) => {
      if (idx > 0) text += "\n---------------------\n";
      text += `${inv.reportType}: \n${inv.investigation || "No details available"}\n\nImpression: \n${inv.impression || "No impression available"}\n\nStatus: ${inv.is_approved ? "Approved" : "PENDING APPROVAL - Results not finalized"}\n`;
    });
    if (formData.currentField === "INVESTIGATIONS") {
      setFormData((prev) => ({
        ...prev,
        notes: prev.notes ? `${prev.notes}\n\n${text}` : text,
      }));
    } else {
      setFormData((prev) => {
        const fd = { ...prev.fieldsData, [prev.currentField]: prev.notes };
        fd["INVESTIGATIONS"] = fd["INVESTIGATIONS"]
          ? `${fd["INVESTIGATIONS"]}\n\n${text}`
          : text;
        return {
          ...prev,
          fieldsData: fd,
          currentField: "INVESTIGATIONS",
          notes: fd["INVESTIGATIONS"],
        };
      });
      setSelectedField("INVESTIGATIONS");
    }
    setShowInvestigations(false);
    setSelectedInvestigations([]);
  };

  const fetchMedicines = async () => {
    if (!formData.ipNo?.trim()) {
      alert("Please enter a valid IP Number first");
      return;
    }
    setMedicinesLoading(true);
    setMedicines([]);
    setSelectedMedicines([]);
    const result = await apiRequest(
      `${HMSURL}patient-medicines/${encodeURIComponent(formData.ipNo)}/`,
      "GET",
    );
    setMedicinesLoading(false);
    if (
      result.success &&
      Array.isArray(result.data) &&
      result.data.length > 0
    ) {
      setMedicines(result.data);
      setShowMedicines(true);
    } else {
      alert("No medicines found for this patient");
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
      alert("Please select at least one medicine");
      return;
    }
    const header = "DISCHARGE MEDICINES:\n";
    const rows = selectedMedicines
      .map(
        (m) =>
          `• ${m.itemName}  |  Dosage: ${m.dosage || "—"}  |  Days: ${m.noOfDays || "—"}  |  Unit: ${m.doseUnit || "—"}${m.route ? "  |  Route: " + m.route : ""}${m.remark && m.remark !== "Nil" ? "  |  Remark: " + m.remark : ""}`,
      )
      .join("\n");
    const text = header + rows;

    const targetField = "ADVICE ON DISCHARGE";
    setFormData((prev) => {
      const fd = { ...prev.fieldsData, [prev.currentField]: prev.notes };
      fd[targetField] = fd[targetField]
        ? `${fd[targetField]}\n\n${text}`
        : text;
      return {
        ...prev,
        fieldsData: fd,
        currentField: targetField,
        notes: fd[targetField],
      };
    });
    setSelectedField(targetField);
    setShowMedicines(false);
    setSelectedMedicines([]);
  };

  /* ── Form changes ── */
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
    setFormData((prev) => ({
      ...prev,
      fieldsData: { ...prev.fieldsData, [prev.currentField]: prev.notes },
      currentField: fieldName,
      notes: prev.fieldsData[fieldName] || "",
    }));
    notesRef.current?.focus();
  };

  /* ── Disease helpers ── */
  const prepareDiseasesPayload = () => {
    if (!selectedDiseases.length) return { diseaseCode: "", disease: "" };
    return {
      diseaseCode: selectedDiseases.map((d) => d.code).join(", "),
      disease: selectedDiseases.map((d) => d.name).join("; "),
    };
  };

  /* ── Submit / Update ── */
  const handleSubmit = async () => {
    if (formData.currentField && formData.notes)
      setFormData((prev) => ({
        ...prev,
        fieldsData: { ...prev.fieldsData, [prev.currentField]: prev.notes },
      }));
    const dp = prepareDiseasesPayload();
    const payload = {
      ...formData,
      date: new Date().toISOString(),
      diseaseCode: dp.diseaseCode,
      disease: dp.disease,
      selectedDiseases,
      fieldsData: Object.fromEntries(
        Object.entries(formData.fieldsData).filter(
          ([k, v]) => k !== "undefined" && v !== "",
        ),
      ),
    };
    const result = await apiRequest(
      `${HMSURL}summaries/create/`,
      "POST",
      payload,
    );
    if (result.success) {
      alert("Summary successfully created!");
      resetForm();
      fetchSummaries({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        summaryType: filters.summaryType,
      });
    } else alert(result.error || "Failed to submit summary.");
  };

  const handleUpdate = async () => {
    const fd = {
      ...formData.fieldsData,
      [formData.currentField]: formData.notes,
    };
    const filtered = Object.fromEntries(
      Object.entries(fd).filter(
        ([k, v]) => v !== undefined && v !== "" && k !== "undefined",
      ),
    );
    if (!Object.keys(filtered).length) {
      alert("Please fill in the required fields.");
      return;
    }
    const dp = prepareDiseasesPayload();
    const result = await apiRequest(
      `${HMSURL}update-summary/${editingIpNo}/`,
      "PATCH",
      {
        ...formData,
        diseaseCode: dp.diseaseCode,
        disease: dp.disease,
        selectedDiseases,
        fieldsData: filtered,
      },
    );
    if (result.success) {
      alert("Summary updated successfully!");
      resetForm();
      fetchSummaries({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        summaryType: filters.summaryType,
      });
    } else
      alert(`Failed to update summary: ${result.error || "Unknown error"}`);
  };

  const resetForm = () => {
    setFormData({
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
      fieldsData: {},
      currentField: "",
      approve: false,
      approve_time: null,
    });
    setSelectedField("");
    setIsEditMode(false);
    setEditingIpNo(null);
    setSelectedDiseases([]);
  };

  const handleEdit = async (ipNo) => {
    const result = await apiRequest(
      `${HMSURL}get-editsummary/${encodeURIComponent(ipNo)}/`,
      "GET",
    );
    if (result.success) {
      const d = result.data;
      let parsedFD = {};
      try {
        parsedFD =
          typeof d.fieldsData === "string"
            ? JSON.parse(d.fieldsData)
            : d.fieldsData || {};
      } catch {}
      let parsedDiseases = [];
      // First try selectedDiseases array if it exists
      try {
        const raw =
          typeof d.selectedDiseases === "string"
            ? JSON.parse(d.selectedDiseases)
            : d.selectedDiseases;
        if (Array.isArray(raw) && raw.length > 0) {
          parsedDiseases = raw;
        }
      } catch {}
      // Always fall back to diseaseCode/disease strings if parsedDiseases is still empty
      if (parsedDiseases.length === 0 && d.diseaseCode && d.disease) {
        const codes = d.diseaseCode.split(", ");
        const names = d.disease.split("; ");
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
    } else alert("Summary not found");
  };

  const handlePrint = (ipNo) =>
    navigate(`/SummaryPrint/${encodeURIComponent(ipNo)}`);
  const handleDelete = async (ipNo) => {
    if (window.confirm("Are you sure you want to delete this summary?")) {
      const result = await apiRequest(
        `${HMSURL}delete-summary/${ipNo}/`,
        "PATCH",
      );
      if (result.success) {
        alert("Summary deleted successfully");
        setSummaries((prev) => prev.filter((s) => s.ipNo !== ipNo));
      } else alert("Error deleting summary: " + result.error);
    }
  };
  const handleApprove = async (ipNo) => {
    const result = await apiRequest(
      `${HMSURL}approve-summary/${ipNo}/`,
      "PATCH",
      { approve: true, approve_time: new Date().toISOString() },
    );
    if (result.success) {
      setSummaries((prev) =>
        prev.map((s) => (s.ipNo === ipNo ? { ...s, approve: true } : s)),
      );
      alert("Summary approved!");
    } else alert("Error approving summary: " + result.error);
  };
  const handleCancelEdit = () => {
    if (window.confirm("Cancel editing? Unsaved changes will be lost."))
      resetForm();
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

  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
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
  const filteredSummaries = summaries.filter((s) => {
    return (
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
  });

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div style={css.page}>
      <div style={css.inner}>
        {/* ── Page header ── */}
        <div style={css.pageHeader}>
          <h1 style={css.pageTitle}>
            <span style={css.titleDot} />
            {isEditMode ? "Edit Summary" : "Discharge Summary"}
          </h1>
          <div style={css.dateBadge}>📅 {currentDate}</div>
        </div>

        {/* ── Edit banner ── */}
        {isEditMode && (
          <div style={css.editBanner}>
            <div style={css.editBannerDot} />
            Editing summary for IP No:{" "}
            <strong style={{ color: tokens.sky }}>{editingIpNo}</strong>
          </div>
        )}

        {/* ══════════════════ PATIENT INFO CARD ══════════════════ */}
        <div style={css.card}>
          <div style={css.cardTitle}>
            <div style={css.sectionLine} /> Patient Information
          </div>

          {/* Row 1 */}
          <div style={{ ...css.grid(6), marginBottom: 16 }}>
            <Field label="Summary Date">
              <Inp
                type="text"
                value={isEditMode ? fmtDate(formData.date) : currentDate}
                readOnly
              />
            </Field>

            <Field label="IP Number">
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Inp
                  type="text"
                  name="ipNo"
                  value={formData.ipNo}
                  onChange={handleChange}
                  readOnly={isEditMode}
                  placeholder="Enter IP No"
                />
                {!isEditMode && (
                  <button style={css.searchBtn} onClick={fetchIpPatient}>
                    🔍 Search
                  </button>
                )}
              </div>
            </Field>

            <Field label="UHID">
              <Inp
                name="uhid"
                value={formData.uhid}
                onChange={handleChange}
                placeholder="UHID"
              />
            </Field>

            <Field label="Patient Name">
              <Inp
                name="patient"
                value={formData.patient}
                onChange={handleChange}
                placeholder="Full Name"
              />
            </Field>

            <Field label="Age">
              <Inp
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age"
              />
            </Field>

            <Field label="Room No">
              <Inp
                name="roomNo"
                value={formData.roomNo}
                onChange={handleChange}
                placeholder="Room No"
              />
            </Field>
          </div>

          {/* Row 2 */}
          <div style={{ ...css.grid(7), marginBottom: 16 }}>
            <Field label="D.O.A">
              <Inp
                name="doa"
                value={formData.doa}
                onChange={handleChange}
                placeholder="DD/MM/YYYY"
              />
            </Field>
            <Field label="DOA Time">
              <Inp
                name="doaTime"
                value={formData.doaTime}
                onChange={handleChange}
                placeholder="HH:MM"
              />
            </Field>
            <Field label="D.O.D">
              <Inp
                type="date"
                name="dod"
                value={formData.dod}
                onChange={handleChange}
              />
            </Field>
            <Field label="DOD Time">
              <Inp
                type="time"
                name="dodTime"
                value={formData.dodTime}
                onChange={handleChange}
              />
            </Field>
            <Field label="Surgery Date">
              <Inp
                type="date"
                name="surgeryDate"
                value={formData.surgeryDate}
                onChange={handleChange}
              />
            </Field>
            <Field label="Next Review Date">
              <Inp
                type="date"
                name="nextReviewDate"
                value={formData.nextReviewDate}
                onChange={handleChange}
              />
            </Field>
            <Field label="Gender">
              <Inp
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                placeholder="Gender"
              />
            </Field>
          </div>

          {/* Row 3 */}
          <div style={css.grid(4)}>
            {/* ── Doctor Dropdown ── */}
            <Field label="Doctor">
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                style={css.select}
              >
                <option value="">— Select Doctor —</option>
                {doctors.map((doc, i) => (
                  <option key={doc.employeeId || i} value={doc.employeeName}>
                    {doc.employeeName}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Summary Type">
              <select
                name="summaryType"
                value={formData.summaryType}
                onChange={handleChange}
                style={css.select}
              >
                <option value="">— Select Type —</option>
                {summaryTypeOptions.map((t, i) => (
                  <option key={t.summaryNo || i} value={t.summaryType}>
                    {t.summaryType}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Heading">
              <Inp
                name="heading"
                value={formData.heading}
                onChange={handleChange}
                placeholder="Heading"
              />
            </Field>

            <Field label="Address">
              <Inp
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
              />
            </Field>
          </div>
        </div>

        {/* ══════════════════ ICD-11 SEARCH ══════════════════ */}
        <div style={css.card}>
          <div style={css.cardTitle}>
            <div style={css.sectionLine} /> ICD‑11 Disease Coding
          </div>
          <ICD11SearchComponent
            key={editingIpNo || "new"}
            onDiseasesChange={(diseases) => setSelectedDiseases(diseases)}
            initialDiseases={selectedDiseases}
          />
        </div>

        {/* ══════════════════ NOTES SECTION ══════════════════ */}
        <div style={css.notesLayout}>
          {/* Sidebar */}
          <div style={css.sidebar}>
            <div style={css.sidebarHeader}>Clinical Fields</div>
            {noteFields.map((field) => (
              <div
                key={field}
                style={css.sidebarItem(selectedField === field)}
                onClick={() => handleButtonClick(field)}
              >
                {field}
              </div>
            ))}
          </div>

          {/* Notes area */}
          <div style={css.notesCard}>
            <div style={css.notesTitle}>
              {selectedField || "Select a field from the left"}
            </div>

            <textarea
              ref={notesRef}
              style={css.textarea}
              name="notes"
              placeholder="Type your clinical notes here…"
              value={formData.notes}
              onChange={handleChange}
            />

            {/* Quick-add buttons */}
            <div style={css.actionRow}>
              <button
                style={css.outlineBtn(tokens.sky)}
                onClick={fetchInvestigations}
              >
                + Add Investigations
              </button>
              <button style={css.outlineBtn(tokens.teal)}>
                + Add Medicines
              </button>
              <button
                style={css.outlineBtn(tokens.green)}
                onClick={fetchMedicines}
              >
                + Discharge Medicines
              </button>
            </div>

            {/* Submit row */}
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              {isEditMode && (
                <button style={css.btn("danger")} onClick={handleCancelEdit}>
                  ✕ Cancel Edit
                </button>
              )}
              <button
                style={css.btn("primary")}
                onClick={isEditMode ? handleUpdate : handleSubmit}
              >
                {isEditMode ? "💾 Update Summary" : "⬆ Upload Summary"}
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════ INVESTIGATIONS MODAL ══════════════════ */}
        {showInvestigations && (
          <div style={css.modalOverlay}>
            <div style={css.modalBox}>
              <div style={css.modalHead}>
                <span style={css.modalTitle}>🔬 Patient Investigations</span>
                <button
                  style={css.modalClose}
                  onClick={() => setShowInvestigations(false)}
                >
                  ✕
                </button>
              </div>
              <div style={css.modalBody}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: 32 }}>
                    <div className="spinner-border text-primary" />
                    <p style={{ marginTop: 12, color: tokens.muted }}>
                      Loading investigations…
                    </p>
                  </div>
                ) : investigations.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: tokens.muted,
                      padding: 32,
                    }}
                  >
                    No investigations found.
                  </p>
                ) : (
                  <>
                    <p
                      style={{
                        color: tokens.muted,
                        fontSize: 13,
                        marginBottom: 16,
                      }}
                    >
                      Click to select investigations.{" "}
                      <span style={{ color: tokens.amber }}>
                        ⚠ Yellow = Pending Approval.
                      </span>
                    </p>
                    {investigations.map((inv, i) => {
                      const selected = selectedInvestigations.some(
                        (si) =>
                          si.reportType === inv.reportType &&
                          si.investigation === inv.investigation,
                      );
                      return (
                        <div
                          key={i}
                          style={css.invCard(selected, !inv.is_approved)}
                          onClick={() => toggleInvestigationSelection(inv)}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 6,
                            }}
                          >
                            <strong
                              style={{ fontSize: 14, color: tokens.navy }}
                            >
                              {inv.reportType}
                            </strong>
                            {!inv.is_approved && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: tokens.amber,
                                  background: `${tokens.amber}18`,
                                  padding: "2px 8px",
                                  borderRadius: 20,
                                }}
                              >
                                Pending Approval
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: 13,
                              color: tokens.textSm,
                              marginBottom: 4,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {inv.investigation?.length > 120
                              ? `${inv.investigation.substring(0, 120)}…`
                              : inv.investigation}
                          </p>
                          <small style={{ color: tokens.muted }}>
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
              <div style={css.modalFoot}>
                {selectedInvestigations.length > 0 && (
                  <span
                    style={{
                      marginRight: "auto",
                      fontSize: 13,
                      color: tokens.sky,
                      fontWeight: 600,
                    }}
                  >
                    {selectedInvestigations.length} selected
                  </span>
                )}
                <button
                  style={css.btn("ghost")}
                  onClick={() => setShowInvestigations(false)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    ...css.btn("primary"),
                    opacity: selectedInvestigations.length ? 1 : 0.4,
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

        {/* ══════════════════ MEDICINES MODAL ══════════════════ */}
        {showMedicines && (
          <div style={css.modalOverlay}>
            <div style={css.modalBox}>
              <div style={css.modalHead}>
                <span style={css.modalTitle}>💊 Patient Medicines</span>
                <button
                  style={css.modalClose}
                  onClick={() => setShowMedicines(false)}
                >
                  ✕
                </button>
              </div>
              <div style={css.modalBody}>
                {medicinesLoading ? (
                  <div style={{ textAlign: "center", padding: 32 }}>
                    <div className="spinner-border text-primary" />
                    <p style={{ marginTop: 12, color: tokens.muted }}>
                      Loading medicines…
                    </p>
                  </div>
                ) : medicines.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: tokens.muted,
                      padding: 32,
                    }}
                  >
                    No medicines found.
                  </p>
                ) : (
                  <>
                    <p
                      style={{
                        color: tokens.muted,
                        fontSize: 13,
                        marginBottom: 16,
                      }}
                    >
                      Click to select medicines to add to the discharge summary.
                    </p>
                    {medicines.map((med, i) => {
                      const selected = selectedMedicines.some(
                        (m) => m._idx === i,
                      );
                      return (
                        <div
                          key={i}
                          style={css.invCard(selected, false)}
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
                            <strong
                              style={{ fontSize: 14, color: tokens.navy }}
                            >
                              {med.itemName}
                            </strong>
                            <div style={{ display: "flex", gap: 6 }}>
                              {med.is_discharge_medicine && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: tokens.green,
                                    background: `${tokens.green}18`,
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
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: tokens.sky,
                                    background: `${tokens.sky}18`,
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
                              gap: 18,
                              flexWrap: "wrap",
                            }}
                          >
                            {med.dosage && (
                              <small style={{ color: tokens.textSm }}>
                                <span style={{ fontWeight: 600 }}>Dosage:</span>{" "}
                                {med.dosage}
                              </small>
                            )}
                            {med.noOfDays && (
                              <small style={{ color: tokens.textSm }}>
                                <span style={{ fontWeight: 600 }}>Days:</span>{" "}
                                {med.noOfDays}
                              </small>
                            )}
                            {med.qty && (
                              <small style={{ color: tokens.textSm }}>
                                <span style={{ fontWeight: 600 }}>Qty:</span>{" "}
                                {med.qty} {med.doseUnit}
                              </small>
                            )}
                            {med.route && (
                              <small style={{ color: tokens.textSm }}>
                                <span style={{ fontWeight: 600 }}>Route:</span>{" "}
                                {med.route}
                              </small>
                            )}
                            {med.remark && med.remark !== "Nil" && (
                              <small style={{ color: tokens.muted }}>
                                <span style={{ fontWeight: 600 }}>Remark:</span>{" "}
                                {med.remark}
                              </small>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
              <div style={css.modalFoot}>
                {selectedMedicines.length > 0 && (
                  <span
                    style={{
                      marginRight: "auto",
                      fontSize: 13,
                      color: tokens.sky,
                      fontWeight: 600,
                    }}
                  >
                    {selectedMedicines.length} selected
                  </span>
                )}
                <button
                  style={css.btn("ghost")}
                  onClick={() => setShowMedicines(false)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    ...css.btn("primary"),
                    opacity: selectedMedicines.length ? 1 : 0.4,
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

        {/* ══════════════════ SUMMARY TABLE ══════════════════ */}
        <div style={{ marginTop: 36 }}>
          <div style={css.tableWrap}>
            {/* Table header + result count */}
            <div
              style={{
                ...css.tableHeader,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>📋 Summary Reports</span>
              <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.75 }}>
                {filteredSummaries.length} of {summaries.length} records
              </span>
            </div>

            {/* ── Filter bar ── */}
            <div
              style={{
                padding: "16px 20px",
                background: tokens.bg,
                borderBottom: `1px solid ${tokens.border}`,
              }}
            >
              {/* Row 1: date range + summary type + search btn */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1.4fr 1fr 1fr auto auto",
                  gap: "10px 12px",
                  alignItems: "end",
                  marginBottom: 10,
                }}
              >
                {/* From Date */}
                <div style={css.fieldWrap}>
                  <span style={{ ...css.label, color: tokens.sky }}>
                    🗓 From Date
                  </span>
                  <input
                    type="date"
                    name="fromDate"
                    value={filters.fromDate}
                    onChange={handleFilterChange}
                    style={{ ...css.input, height: 34, fontSize: 12 }}
                  />
                </div>

                {/* To Date */}
                <div style={css.fieldWrap}>
                  <span style={{ ...css.label, color: tokens.sky }}>
                    🗓 To Date
                  </span>
                  <input
                    type="date"
                    name="toDate"
                    value={filters.toDate}
                    onChange={handleFilterChange}
                    style={{ ...css.input, height: 34, fontSize: 12 }}
                  />
                </div>

                {/* Summary Type Dropdown */}
                <div style={css.fieldWrap}>
                  <span style={{ ...css.label, color: tokens.sky }}>
                    📄 Summary Type
                  </span>
                  <select
                    name="summaryType"
                    value={filters.summaryType}
                    onChange={handleSummaryTypeFilterChange}
                    style={{ ...css.select, height: 34, fontSize: 12 }}
                  >
                    <option value="">All Types</option>
                    {summaryTypeOptions.map((t, i) => (
                      <option key={t.summaryNo || i} value={t.summaryType}>
                        {t.summaryType}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Patient */}
                <div style={css.fieldWrap}>
                  <span style={{ ...css.label, color: tokens.sky }}>
                    👤 Patient Name
                  </span>
                  <input
                    name="patient"
                    value={filters.patient}
                    onChange={handleFilterChange}
                    placeholder="Search name…"
                    style={{ ...css.input, height: 34, fontSize: 12 }}
                  />
                </div>

                {/* Status */}
                <div style={css.fieldWrap}>
                  <span style={{ ...css.label, color: tokens.sky }}>
                    🔖 Status
                  </span>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    style={{ ...css.select, height: 34, fontSize: 12 }}
                  >
                    <option value="">All</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Search button */}
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button
                    onClick={applyServerFilters}
                    style={{
                      ...css.btn("primary"),
                      height: 34,
                      padding: "0 18px",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    🔍 Search
                  </button>
                </div>

                {/* Clear button */}
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button
                    onClick={clearFilters}
                    style={{
                      height: 34,
                      padding: "0 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      border: `1.5px solid ${tokens.border}`,
                      borderRadius: 8,
                      background: tokens.white,
                      color: tokens.muted,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = tokens.red;
                      e.target.style.color = tokens.red;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = tokens.border;
                      e.target.style.color = tokens.muted;
                    }}
                  >
                    ✕ Clear
                  </button>
                </div>
              </div>

              {/* Row 2: UHID + IP No */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 5fr",
                  gap: "10px 12px",
                  alignItems: "end",
                }}
              >
                <div style={css.fieldWrap}>
                  <span style={{ ...css.label, color: tokens.sky }}>
                    🆔 UHID
                  </span>
                  <input
                    name="uhid"
                    value={filters.uhid}
                    onChange={handleFilterChange}
                    placeholder="Search UHID…"
                    style={{ ...css.input, height: 34, fontSize: 12 }}
                  />
                </div>
                <div style={css.fieldWrap}>
                  <span style={{ ...css.label, color: tokens.sky }}>
                    🏥 IP No
                  </span>
                  <input
                    name="ipNo"
                    value={filters.ipNo}
                    onChange={handleFilterChange}
                    placeholder="Search IP No…"
                    style={{ ...css.input, height: 34, fontSize: 12 }}
                  />
                </div>
              </div>
            </div>

            {/* ── Table ── */}
            {summaries.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  padding: 40,
                  color: tokens.muted,
                }}
              >
                No summary reports found.
              </p>
            ) : filteredSummaries.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  padding: 40,
                  color: tokens.muted,
                }}
              >
                No records match your filters.{" "}
                <button
                  onClick={clearFilters}
                  style={{
                    background: "none",
                    border: "none",
                    color: tokens.sky,
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
                        <th key={h} style={css.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSummaries.map((s, i) => (
                      <tr
                        key={s.id || i}
                        style={{
                          background: i % 2 === 0 ? tokens.white : "#F8FAFC",
                        }}
                      >
                        <td style={css.td}>{fmtDate(s.date)}</td>
                        <td
                          style={{
                            ...css.td,
                            fontWeight: 600,
                            color: tokens.navy,
                          }}
                        >
                          {s.patient}
                        </td>
                        <td style={css.td}>
                          <span style={css.statusBadge(s.approve)}>
                            <span style={css.statusDot(s.approve)} />
                            {s.approve ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td style={{ ...css.td, fontSize: 12 }}>
                          {s.summaryType}
                        </td>
                        <td style={css.td}>{s.uhid}</td>
                        <td style={{ ...css.td, fontWeight: 600 }}>{s.ipNo}</td>
                        <td style={css.td}>{fmtDateTime(s.approve_time)}</td>
                        <td style={css.td}>
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                            }}
                          >
                            {canEdit && (
                              <button
                                style={{
                                  ...css.btn("ghost"),
                                  padding: "5px 12px",
                                  fontSize: 12,
                                  opacity: s.approve ? 0.4 : 1,
                                }}
                                onClick={() => handleEdit(s.ipNo)}
                                disabled={s.approve}
                              >
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                style={{
                                  ...css.btn("danger"),
                                  padding: "5px 12px",
                                  fontSize: 12,
                                  opacity: s.approve ? 0.4 : 1,
                                }}
                                onClick={() => handleDelete(s.ipNo)}
                                disabled={s.approve}
                              >
                                Delete
                              </button>
                            )}
                            {canApprove && (
                              <button
                                style={{
                                  ...css.btn("success"),
                                  padding: "5px 12px",
                                  fontSize: 12,
                                  opacity: s.approve ? 0.4 : 1,
                                }}
                                onClick={() => handleApprove(s.ipNo)}
                                disabled={s.approve}
                              >
                                Approve
                              </button>
                            )}
                            <button
                              style={{
                                ...css.btn("primary"),
                                padding: "5px 12px",
                                fontSize: 12,
                              }}
                              onClick={() => handlePrint(s.ipNo)}
                            >
                              Print
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
      </div>
      {/* /inner */}
    </div>
  );
};

export default Summary;
