import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import { PageWrapper } from "../GlobalStyles";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS — Hospital Modern Palette
   ───────────────────────────────────────────────────────────── */
const T = {
  primary:    "#0d9488",
  primaryDk:  "#0f766e",
  primaryLt:  "#f0fdfa",
  primaryMd:  "#ccfbf1",
  teal:       "#0d9488",
  green:      "#16a34a",
  greenLt:    "#dcfce7",
  greenDk:    "#15803d",
  blue:       "#2563eb",
  blueLt:     "#eff6ff",
  blueDk:     "#1d4ed8",
  red:        "#dc2626",
  redLt:      "#fee2e2",
  redDk:      "#b91c1c",
  amber:      "#d97706",
  amberLt:    "#fef3c7",
  amberDk:    "#b45309",
  purple:     "#7c3aed",
  purpleLt:   "#ede9fe",
  purpleDk:   "#6d28d9",
  gray:       "#64748b",
  grayLt:     "#f8fafc",
  grayBorder: "#e2e8f0",
  textMain:   "#0f172a",
  textMid:    "#334155",
  textMuted:  "#64748b",
  white:      "#ffffff",
  shadowSm:   "0 1px 3px rgba(0,0,0,0.06)",
  shadowMd:   "0 4px 14px rgba(0,0,0,0.08)",
  shadowLg:   "0 12px 30px rgba(0,0,0,0.12)",
  font:       "'DM Sans', 'Inter', system-ui, sans-serif",
};

const fadeIn = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); }`;
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.4; }`;

/* ─────────────────────────────────────────────────────────────
   HELPERS — Date Formatting & Relative Time
   ───────────────────────────────────────────────────────────── */
const formatDateStr = (dateInput) => {
  if (!dateInput) return "—";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput).slice(0, 10);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateInput).slice(0, 10);
  }
};

const getRelativeTime = (dateInput) => {
  if (!dateInput) return "";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} mo ago`;
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} yr ago`;
  } catch {
    return "";
  }
};

const extractDateOnly = (dateInput) => {
  if (!dateInput) return "Unknown Date";
  if (typeof dateInput === "string") {
    return dateInput.slice(0, 10);
  }
  try {
    return new Date(dateInput).toISOString().slice(0, 10);
  } catch {
    return "Unknown Date";
  }
};

/* ─────────────────────────────────────────────────────────────
   STYLED COMPONENTS
   ───────────────────────────────────────────────────────────── */
const InquiryContainer = styled.div`
  padding: clamp(10px, 1.2vw, 22px);
  background: #f8fafc;
  min-height: 100vh;
  font-family: ${T.font};
  box-sizing: border-box;
  width: 100%;
`;

/* ── Top Header ── */
const HeaderBar = styled.div`
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
  border-radius: 10px;
  padding: clamp(12px, 1.4vw, 20px);
  color: #fff;
  margin-bottom: 14px;
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const HeaderTitle = styled.div`
  h1 {
    margin: 0;
    font-size: clamp(1.1rem, 1.4vw, 1.45rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  p {
    margin: 3px 0 0;
    font-size: clamp(0.72rem, 0.85vw, 0.84rem);
    opacity: 0.9;
  }
`;

/* ── Search Toolbar ── */
const SearchCard = styled.div`
  background: ${T.white};
  border: 1.5px solid ${T.grayBorder};
  border-radius: 10px;
  padding: clamp(10px, 1.2vw, 16px);
  margin-bottom: 14px;
  box-shadow: ${T.shadowSm};
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const FieldCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: ${p => p.$flex || "1 1 180px"};
  min-width: 140px;
`;

const FieldLabel = styled.label`
  font-size: clamp(0.68rem, 0.78vw, 0.76rem);
  font-weight: 700;
  color: ${T.textMid};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const SearchInput = styled.input`
  height: 38px;
  padding: 0 12px;
  font-size: clamp(0.82rem, 0.9vw, 0.88rem);
  font-family: ${T.font};
  border: 1.5px solid ${T.grayBorder};
  border-radius: 6px;
  background: #fff;
  color: ${T.textMain};
  outline: none;
  box-sizing: border-box;
  transition: all 0.15s;
  &:focus {
    border-color: ${T.primary};
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.14);
  }
  &::placeholder { color: ${T.textMuted}; }
`;

const SearchButton = styled.button`
  height: 38px;
  padding: 0 22px;
  font-size: clamp(0.82rem, 0.9vw, 0.88rem);
  font-weight: 700;
  font-family: ${T.font};
  border-radius: 6px;
  border: none;
  background: ${T.primary};
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.14s;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.25);
  &:hover {
    background: ${T.primaryDk};
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ClearButton = styled.button`
  height: 38px;
  padding: 0 16px;
  font-size: 0.84rem;
  font-weight: 600;
  font-family: ${T.font};
  border-radius: 6px;
  border: 1px solid ${T.grayBorder};
  background: #f1f5f9;
  color: ${T.textMid};
  cursor: pointer;
  transition: all 0.12s;
  &:hover { background: #e2e8f0; }
`;

const SearchTypeToggle = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
`;

const TypePill = styled.button`
  padding: 4px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 20px;
  border: 1px solid ${p => p.$active ? T.primary : T.grayBorder};
  background: ${p => p.$active ? T.primaryLt : "#fff"};
  color: ${p => p.$active ? T.primaryDk : T.textMuted};
  cursor: pointer;
  transition: all 0.12s;
  &:hover { border-color: ${T.primary}; }
`;

const SpinIcon = styled.span`
  display: inline-block;
  animation: ${spin} 0.8s linear infinite;
`;

/* ── Hero Patient Profile Card ── */
const PatientHero = styled.div`
  background: ${T.white};
  border: 1.5px solid ${T.grayBorder};
  border-radius: 10px;
  padding: clamp(12px, 1.4vw, 20px);
  margin-bottom: 14px;
  box-shadow: ${T.shadowSm};
  animation: ${fadeIn} 0.25s ease both;
`;

const HeroTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${T.grayBorder};
`;

const PatientIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Avatar = styled.div`
  width: clamp(44px, 4vw, 56px);
  height: clamp(44px, 4vw, 56px);
  border-radius: 50%;
  background: ${p => p.$isIp ? "linear-gradient(135deg, #16a34a, #15803d)" : "linear-gradient(135deg, #2563eb, #1d4ed8)"};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.1rem, 1.4vw, 1.4rem);
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(0,0,0,0.12);
  flex-shrink: 0;
`;

const NameMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PatientFullName = styled.h2`
  margin: 0;
  font-size: clamp(1.05rem, 1.3vw, 1.35rem);
  font-weight: 800;
  color: ${T.textMain};
  line-height: 1.2;
`;

const SubBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
`;

const InfoTag = styled.span`
  font-size: clamp(0.66rem, 0.76vw, 0.74rem);
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f1f5f9;
  color: ${T.textMid};
  border: 1px solid ${T.grayBorder};
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const StatusBadge = styled.span`
  font-size: clamp(0.68rem, 0.78vw, 0.76rem);
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${p => p.$bg || T.greenLt};
  color: ${p => p.$color || T.greenDk};
  border: 1px solid ${p => p.$border || "#86efac"};
`;

const PulseIndicator = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  animation: ${pulse} 1.4s ease-in-out infinite;
`;

/* ── KPI Metrics Bar ── */
const KPIStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(130px, 11vw, 180px), 1fr));
  gap: clamp(8px, 1vw, 12px);
  margin-top: 14px;
`;

const KPICard = styled.div`
  background: ${p => p.$bg || "#f8fafc"};
  border: 1px solid ${p => p.$border || T.grayBorder};
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: ${p => p.$clickable ? "pointer" : "default"};
  transition: transform 0.12s;
  &:hover {
    ${p => p.$clickable ? "transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06);" : ""}
  }
`;

const KPILabel = styled.span`
  font-size: clamp(0.64rem, 0.72vw, 0.7rem);
  font-weight: 700;
  color: ${T.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const KPIValue = styled.span`
  font-size: clamp(1.05rem, 1.25vw, 1.35rem);
  font-weight: 800;
  color: ${p => p.$color || T.textMain};
`;

const KPISub = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  color: ${T.textMuted};
`;

/* ── View Mode & Filter Bar ── */
const ControlBar = styled.div`
  background: ${T.white};
  border: 1.5px solid ${T.grayBorder};
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  box-shadow: ${T.shadowSm};
`;

const ModeToggle = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
  gap: 4px;
`;

const ModeBtn = styled.button`
  padding: 6px 14px;
  font-size: 0.78rem;
  font-weight: 800;
  font-family: ${T.font};
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.12s;
  background: ${p => p.$active ? T.primary : "transparent"};
  color: ${p => p.$active ? "#fff" : T.textMid};
  box-shadow: ${p => p.$active ? "0 2px 6px rgba(13,148,136,0.25)" : "none"};
`;

const DateRangePills = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const DatePill = styled.button`
  padding: 4px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  font-family: ${T.font};
  border-radius: 15px;
  border: 1px solid ${p => p.$active ? T.primary : T.grayBorder};
  background: ${p => p.$active ? T.primaryLt : "#fff"};
  color: ${p => p.$active ? T.primaryDk : T.textMuted};
  cursor: pointer;
  transition: all 0.12s;
  &:hover { border-color: ${T.primary}; }
`;

/* ── Timeline ── */
const TimelineWrap = styled.div`
  position: relative;
  margin-top: 10px;
  padding-left: 24px;

  &::before {
    content: "";
    position: absolute;
    top: 12px;
    bottom: 12px;
    left: 8px;
    width: 2.5px;
    background: #cbd5e1;
    border-radius: 2px;
  }
`;

const VisitNode = styled.div`
  position: relative;
  margin-bottom: 20px;
  animation: ${fadeIn} 0.25s ease both;
`;

const TimelineDot = styled.div`
  position: absolute;
  left: -24px;
  top: 14px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: ${p => p.$isIp ? T.green : T.blue};
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px ${p => p.$isIp ? "#86efac" : "#93c5fd"};
  z-index: 2;
`;

const VisitCard = styled.div`
  background: ${T.white};
  border: 1.5px solid ${p => p.$isIp ? "#86efac" : T.grayBorder};
  border-radius: 10px;
  box-shadow: ${T.shadowSm};
  overflow: hidden;
  transition: all 0.14s ease;

  &:hover {
    border-color: ${p => p.$isIp ? T.green : T.primary};
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }
`;

const VisitHeader = styled.div`
  padding: 12px 16px;
  background: ${p => p.$isIp ? "#f0fdf4" : "#f8fafc"};
  border-bottom: 1px solid ${p => p.$isIp ? "#dcfce7" : T.grayBorder};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  cursor: pointer;
  user-select: none;
`;

const VisitTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const VisitDateBadge = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid ${T.grayBorder};
  border-radius: 6px;
  padding: 4px 10px;
  text-align: center;
  min-width: 80px;

  strong {
    font-size: 0.88rem;
    font-weight: 800;
    color: ${T.textMain};
    line-height: 1.1;
  }
  span {
    font-size: 0.65rem;
    font-weight: 700;
    color: ${T.primaryDk};
  }
`;

const VisitTypeBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  background: ${p => p.$isIp ? T.greenLt : T.blueLt};
  color: ${p => p.$isIp ? T.greenDk : T.blueDk};
  border: 1px solid ${p => p.$isIp ? "#86efac" : "#bfdbfe"};
`;

const VisitMetaSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const VisitCost = styled.div`
  font-size: 0.95rem;
  font-weight: 800;
  color: ${T.primaryDk};
  background: #fff;
  border: 1px solid ${T.grayBorder};
  padding: 4px 10px;
  border-radius: 6px;
`;

const ExpandChevron = styled.span`
  font-size: 0.8rem;
  color: ${T.textMuted};
  transition: transform 0.2s;
  transform: ${p => p.$expanded ? "rotate(180deg)" : "rotate(0deg)"};
`;

const VisitBody = styled.div`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #fff;
`;

/* ── Section inside Visit ── */
const VisitSection = styled.div`
  background: #f8fafc;
  border: 1px solid ${T.grayBorder};
  border-radius: 8px;
  padding: 12px 14px;
`;

const SectionHeader = styled.div`
  font-size: 0.76rem;
  font-weight: 800;
  color: ${p => p.$color || T.primaryDk};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;

/* ── Itemized List Grid (For Clean Test & Medicine Badges) ── */
const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px;
  margin-top: 8px;
`;

const ItemCard = styled.div`
  background: #fff;
  border: 1px solid ${p => p.$border || T.grayBorder};
  border-radius: 6px;
  padding: 8px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);

  .main-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    strong {
      color: ${T.textMain};
      font-size: 0.82rem;
    }
    span {
      font-size: 0.7rem;
      color: ${T.textMuted};
    }
  }

  .price-info {
    text-align: right;
    strong {
      color: ${T.primaryDk};
      font-size: 0.85rem;
    }
  }
`;

const DetailsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid ${T.grayBorder};
`;

const DTh = styled.th`
  background: #f1f5f9;
  padding: 8px 10px;
  font-size: 0.68rem;
  font-weight: 800;
  color: ${T.textMid};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid ${T.grayBorder};
  text-align: ${p => p.$align || "left"};
  white-space: nowrap;
`;

const DTd = styled.td`
  padding: 8px 10px;
  color: ${T.textMain};
  border-bottom: 1px solid #f1f5f9;
  text-align: ${p => p.$align || "left"};
  vertical-align: middle;
`;

const EmptyNotice = styled.div`
  text-align: center;
  padding: 35px 20px;
  color: ${T.textMuted};
  font-size: 0.88rem;
  background: #fff;
  border: 1px solid ${T.grayBorder};
  border-radius: 8px;
`;

/* ─────────────────────────────────────────────────────────────
   MAIN PATIENT INQUIRY COMPONENT
   ───────────────────────────────────────────────────────────── */
const Enquiry = () => {
  const [searchParam,  setSearchParam]  = useState("");
  const [searchMode,   setSearchMode]   = useState("ALL"); // ALL, UHID, IP, MOBILE
  const [loading,      setLoading]      = useState(false);
  const [inquiryData,  setInquiryData]  = useState(null);
  const [viewMode,     setViewMode]     = useState("TIMELINE"); // TIMELINE vs CATEGORIZED
  const [dateRange,    setDateRange]    = useState("ALL"); // ALL, 30DAYS, 6MONTHS, 1YEAR
  const [expandedVisits, setExpandedVisits] = useState({}); // { [dateStr]: boolean }
  const [activeTab,    setActiveTab]    = useState("admission"); // admission, op_visits, investigations, pharmacy, profile
  const [filterText,   setFilterText]   = useState("");

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const handleSearch = useCallback(async (customQuery) => {
    const q = (customQuery !== undefined ? customQuery : searchParam).trim();
    if (!q) {
      toast.warning("Please enter a UHID, IP Number, or Mobile number");
      return;
    }

    setLoading(true);
    try {
      let queryParams = new URLSearchParams();

      if (searchMode === "UHID") {
        queryParams.set("uhid", q);
      } else if (searchMode === "IP") {
        queryParams.set("ip_number", q);
      } else if (searchMode === "MOBILE") {
        queryParams.set("mobile", q);
      } else {
        queryParams.set("search", q);
      }

      const response = await apiRequest(`${HmsBaseUrl}patient-inquiry/?${queryParams.toString()}`, "GET");
      const res = response?.data || response;

      if (res && res.success && res.patient) {
        setInquiryData(res);
        setExpandedVisits({});
        toast.success(`Loaded clinical history for ${res.patient.name || res.patient.uhid}`);
      } else {
        const errorMsg = res?.message || response?.error || "No records found for this patient";
        toast.error(errorMsg);
        setInquiryData(null);
      }
    } catch (err) {
      console.error("Patient inquiry error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to fetch patient history");
      setInquiryData(null);
    } finally {
      setLoading(false);
    }
  }, [HmsBaseUrl, searchParam, searchMode]);

  const handleClear = () => {
    setSearchParam("");
    setInquiryData(null);
    setFilterText("");
  };

  const patient    = inquiryData?.patient || {};
  const stats      = inquiryData?.summary_stats || {};
  const admissions = inquiryData?.admissions || [];
  const regVisits  = inquiryData?.registration_visits || [];
  const investBills= inquiryData?.investigation_bills || [];
  const pharmBills = inquiryData?.pharmacy_bills || [];

  const isAdmitted = inquiryData?.is_currently_admitted === true;
  const isIpPatient= inquiryData?.patient_type === "IP";

  /* ─────────────────────────────────────────────────────────────
     UNIFIED DATE-WISE & VISIT-WISE CHRONOLOGICAL AGGREGATOR
     ───────────────────────────────────────────────────────────── */
  const chronologicalVisits = useMemo(() => {
    if (!inquiryData) return [];

    const dateMap = {};

    const getOrCreate = (dateStr) => {
      const cleanDate = extractDateOnly(dateStr);
      if (!dateMap[cleanDate]) {
        dateMap[cleanDate] = {
          dateStr: cleanDate,
          formattedDate: formatDateStr(cleanDate),
          relativeTime: getRelativeTime(cleanDate),
          admissions: [],
          regVisits: [],
          investigations: [],
          testsList: [],
          pharmacy: [],
          medicinesList: [],
          doctors: new Set(),
          isIp: false,
          totalSpend: 0,
        };
      }
      return dateMap[cleanDate];
    };

    // 1. Map Admissions
    admissions.forEach(adm => {
      const entry = getOrCreate(adm.admissionDateTime);
      entry.admissions.push(adm);
      entry.isIp = true;
      if (adm.admittingDoctorName) entry.doctors.add(adm.admittingDoctorName);
      if (adm.consultingDoctorName) entry.doctors.add(adm.consultingDoctorName);
      (adm.advance_payments || []).forEach(adv => {
        entry.totalSpend += Number(adv.amount || adv.advance_amount || 0);
      });
    });

    // 2. Map OP Registration Visits
    regVisits.forEach(rv => {
      const entry = getOrCreate(rv.billed_date);
      entry.regVisits.push(rv);
      if (rv.doctor_name) entry.doctors.add(rv.doctor_name);
      entry.totalSpend += Number(rv.total_fees || 0);
    });

    // 3. Map Investigation Bills & Flatten Tests
    investBills.forEach(inv => {
      const entry = getOrCreate(inv.investBillDate);
      entry.investigations.push(inv);
      if (inv.patientType === "IP") entry.isIp = true;
      if (inv.doctor_name) entry.doctors.add(inv.doctor_name);
      entry.totalSpend += Number(inv.net_amount || 0);

      (inv.tests || []).forEach(t => {
        entry.testsList.push({
          ...t,
          billNo: inv.investBillNo,
          doctor: inv.doctor_name,
        });
      });
    });

    // 4. Map Pharmacy Bills & Flatten Medicines
    pharmBills.forEach(pb => {
      const entry = getOrCreate(pb.bill_date);
      entry.pharmacy.push(pb);
      if (pb.patientType === "IP") entry.isIp = true;
      if (pb.doctor_name) entry.doctors.add(pb.doctor_name);
      entry.totalSpend += Number(pb.net_amount || 0);

      (pb.medicines || []).forEach(m => {
        entry.medicinesList.push({
          ...m,
          billNo: pb.bill_no || pb.estimate_no || `BILL-${pb.Bill_id}`,
          doctor: pb.doctor_name,
        });
      });
    });

    // Convert to sorted array (Newest first)
    const sorted = Object.values(dateMap).sort((a, b) => {
      return new Date(b.dateStr) - new Date(a.dateStr);
    });

    // Filter by Date Range if selected
    const now = new Date();
    return sorted.filter(v => {
      if (dateRange === "ALL") return true;
      const vDate = new Date(v.dateStr);
      const diffDays = (now - vDate) / (1000 * 60 * 60 * 24);
      if (dateRange === "30DAYS") return diffDays <= 30;
      if (dateRange === "6MONTHS") return diffDays <= 180;
      if (dateRange === "1YEAR") return diffDays <= 365;
      return true;
    });
  }, [inquiryData, admissions, regVisits, investBills, pharmBills, dateRange]);

  const toggleVisitExpand = (dateStr) => {
    setExpandedVisits(prev => ({
      ...prev,
      [dateStr]: prev[dateStr] === false ? true : false,
    }));
  };

  const expandAll = () => {
    const all = {};
    chronologicalVisits.forEach(v => { all[v.dateStr] = true; });
    setExpandedVisits(all);
  };

  const collapseAll = () => {
    const all = {};
    chronologicalVisits.forEach(v => { all[v.dateStr] = false; });
    setExpandedVisits(all);
  };

  /* ── In-Tab Filtering for Bills ── */
  const filteredInvestBills = useMemo(() => {
    const q = filterText.toLowerCase().trim();
    if (!q) return investBills;
    return investBills.filter(b =>
      String(b.investBillNo || "").toLowerCase().includes(q) ||
      String(b.doctor_name || "").toLowerCase().includes(q) ||
      (b.tests || []).some(t => String(t.test_name || "").toLowerCase().includes(q) || String(t.department || "").toLowerCase().includes(q))
    );
  }, [investBills, filterText]);

  const filteredPharmBills = useMemo(() => {
    const q = filterText.toLowerCase().trim();
    if (!q) return pharmBills;
    return pharmBills.filter(b =>
      String(b.bill_no || b.estimate_no || b.Bill_id || "").toLowerCase().includes(q) ||
      String(b.doctor_name || "").toLowerCase().includes(q) ||
      (b.medicines || []).some(m => String(m.item_name || "").toLowerCase().includes(q) || String(m.batch_number || "").toLowerCase().includes(q))
    );
  }, [pharmBills, filterText]);

  return (
    <PageWrapper>
      <InquiryContainer>

        {/* ── Top Header ── */}
        <HeaderBar>
          <HeaderTitle>
            <h1>🔍 Unified Patient Inquiry &amp; Complete Clinical History</h1>
            <p>Date-wise timeline with full lists of Ordered Investigation Tests, Prescribed &amp; Dispensed Medicines, and Admissions</p>
          </HeaderTitle>
        </HeaderBar>

        {/* ── Search Toolbar ── */}
        <SearchCard>
          <SearchTypeToggle>
            <TypePill $active={searchMode === "ALL"} onClick={() => setSearchMode("ALL")}>
              🌐 Auto Detect
            </TypePill>
            <TypePill $active={searchMode === "UHID"} onClick={() => setSearchMode("UHID")}>
              🪪 UHID
            </TypePill>
            <TypePill $active={searchMode === "IP"} onClick={() => setSearchMode("IP")}>
              🏥 IP Number
            </TypePill>
            <TypePill $active={searchMode === "MOBILE"} onClick={() => setSearchMode("MOBILE")}>
              📱 Mobile
            </TypePill>
          </SearchTypeToggle>

          <SearchForm onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
            <FieldCol $flex="2 1 280px">
              <FieldLabel>Search Parameter (UHID / IP Number / Mobile)</FieldLabel>
              <SearchInput
                type="text"
                placeholder={
                  searchMode === "UHID"   ? "e.g. S026/00548" :
                  searchMode === "IP"     ? "e.g. S026/500017" :
                  searchMode === "MOBILE" ? "e.g. 9876543210" :
                  "Enter UHID (e.g. S026/00548) or IP Number (e.g. S026/500017) or Mobile..."
                }
                value={searchParam}
                onChange={(e) => setSearchParam(e.target.value)}
                autoFocus
              />
            </FieldCol>

            <SearchButton type="submit" disabled={loading || !searchParam.trim()}>
              {loading ? (
                <>
                  <SpinIcon>🔄</SpinIcon> Searching…
                </>
              ) : (
                <>
                  <span>🔍</span> Search Patient
                </>
              )}
            </SearchButton>

            {inquiryData && (
              <ClearButton type="button" onClick={handleClear}>
                ✕ Clear
              </ClearButton>
            )}
          </SearchForm>
        </SearchCard>

        {/* ── Patient Profile Hero & Overview ── */}
        {inquiryData && (
          <PatientHero>
            <HeroTop>
              <PatientIdentity>
                <Avatar $isIp={isAdmitted}>
                  {(patient.name || patient.firstName || "P").charAt(0).toUpperCase()}
                </Avatar>

                <NameMeta>
                  <PatientFullName>
                    {patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`}
                  </PatientFullName>

                  <SubBadgeRow>
                    <InfoTag><strong>UHID:</strong> {patient.uhid}</InfoTag>
                    {patient.age && (
                      <InfoTag><strong>Age/Gender:</strong> {patient.age} {patient.age_type || 'Y'} / {patient.gender || "—"}</InfoTag>
                    )}
                    {patient.bloodGroup && (
                      <InfoTag><strong>Blood:</strong> {patient.bloodGroup}</InfoTag>
                    )}
                    {patient.mobilePhone && (
                      <InfoTag><strong>📱:</strong> {patient.mobilePhone}</InfoTag>
                    )}
                    {patient.customerType && (
                      <InfoTag style={{ background: T.purpleLt, color: T.purpleDk, borderColor: "#d8b4fe" }}>
                        {patient.customerType} {patient.insuranceCompany !== "—" ? `· ${patient.insuranceCompany}` : ""}
                      </InfoTag>
                    )}
                  </SubBadgeRow>
                </NameMeta>
              </PatientIdentity>

              {/* Status Pill */}
              <div>
                {isAdmitted ? (
                  <StatusBadge $bg={T.greenLt} $color={T.greenDk} $border="#86efac">
                    <PulseIndicator />
                    🟢 CURRENTLY ADMITTED (IP)
                    {inquiryData.active_admission?.room_details?.[0]?.roomNo && (
                      <span style={{ marginLeft: 4, background: "#fff", padding: "1px 6px", borderRadius: 10, fontSize: "0.68rem" }}>
                        Room {inquiryData.active_admission.room_details[0].roomNo} · Bed {inquiryData.active_admission.room_details[0].bedNo}
                      </span>
                    )}
                  </StatusBadge>
                ) : isIpPatient ? (
                  <StatusBadge $bg={T.blueLt} $color={T.blueDk} $border="#bfdbfe">
                    🔵 DISCHARGED (PAST IP PATIENT)
                  </StatusBadge>
                ) : (
                  <StatusBadge $bg="#f1f5f9" $color={T.textMid} $border={T.grayBorder}>
                    🩺 OUT-PATIENT (OP)
                  </StatusBadge>
                )}
              </div>
            </HeroTop>

            {/* KPI Lifetime Healthcare Summary */}
            <KPIStrip>
              <KPICard
                $bg="#f0fdf4"
                $border="#bbf7d0"
                $clickable
                onClick={() => { setViewMode("CATEGORIZED"); setActiveTab("admission"); }}
                title="Click to view Admission History"
              >
                <KPILabel>Total Admissions</KPILabel>
                <KPIValue $color={T.greenDk}>{stats.total_admissions || 0}</KPIValue>
                <KPISub>In-Patient Stays</KPISub>
              </KPICard>

              <KPICard
                $bg="#eff6ff"
                $border="#bfdbfe"
                $clickable
                onClick={() => { setViewMode("CATEGORIZED"); setActiveTab("op_visits"); }}
                title="Click to view OP Visits"
              >
                <KPILabel>OP Visits</KPILabel>
                <KPIValue $color={T.blueDk}>{stats.total_op_visits || 0}</KPIValue>
                <KPISub>Consultations</KPISub>
              </KPICard>

              <KPICard
                $bg="#fef3c7"
                $border="#fde047"
                $clickable
                onClick={() => { setViewMode("CATEGORIZED"); setActiveTab("investigations"); }}
                title="Click to view Investigation Bills"
              >
                <KPILabel>🧪 Investigation Bills</KPILabel>
                <KPIValue $color={T.amberDk}>{stats.total_invest_bills || 0}</KPIValue>
                <KPISub>₹{stats.total_invest_amount?.toLocaleString("en-IN") || 0}</KPISub>
              </KPICard>

              <KPICard
                $bg="#ede9fe"
                $border="#d8b4fe"
                $clickable
                onClick={() => { setViewMode("CATEGORIZED"); setActiveTab("pharmacy"); }}
                title="Click to view Pharmacy Bills"
              >
                <KPILabel>💊 Pharmacy Bills</KPILabel>
                <KPIValue $color={T.purpleDk}>{stats.total_pharmacy_bills || 0}</KPIValue>
                <KPISub>₹{stats.total_pharmacy_amount?.toLocaleString("en-IN") || 0}</KPISub>
              </KPICard>

              <KPICard $bg="#fff5f5" $border="#fecaca">
                <KPILabel>Total Lifetime Spend</KPILabel>
                <KPIValue $color={T.redDk}>₹{stats.total_lifetime_spend?.toLocaleString("en-IN") || 0}</KPIValue>
                <KPISub>All Clinical Services</KPISub>
              </KPICard>
            </KPIStrip>
          </PatientHero>
        )}

        {/* ── View Controls & Date Range Filter ── */}
        {inquiryData && (
          <ControlBar>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <ModeToggle>
                <ModeBtn
                  $active={viewMode === "TIMELINE"}
                  onClick={() => setViewMode("TIMELINE")}
                >
                  📅 Date-wise Timeline ({chronologicalVisits.length} visits)
                </ModeBtn>
                <ModeBtn
                  $active={viewMode === "CATEGORIZED"}
                  onClick={() => setViewMode("CATEGORIZED")}
                >
                  📑 Service Category Tabs
                </ModeBtn>
              </ModeToggle>

              {viewMode === "TIMELINE" && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={expandAll}
                    style={{ padding: "4px 8px", fontSize: "0.7rem", fontWeight: 700, borderRadius: 4, border: `1px solid ${T.grayBorder}`, background: "#fff", cursor: "pointer" }}
                  >
                    + Expand All
                  </button>
                  <button
                    onClick={collapseAll}
                    style={{ padding: "4px 8px", fontSize: "0.7rem", fontWeight: 700, borderRadius: 4, border: `1px solid ${T.grayBorder}`, background: "#fff", cursor: "pointer" }}
                  >
                    - Collapse All
                  </button>
                </div>
              )}
            </div>

            {/* Quick Date Filters */}
            <DateRangePills>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: T.textMuted, textTransform: "uppercase" }}>
                Period:
              </span>
              <DatePill $active={dateRange === "ALL"} onClick={() => setDateRange("ALL")}>
                All History
              </DatePill>
              <DatePill $active={dateRange === "30DAYS"} onClick={() => setDateRange("30DAYS")}>
                Last 30 Days
              </DatePill>
              <DatePill $active={dateRange === "6MONTHS"} onClick={() => setDateRange("6MONTHS")}>
                Last 6 Months
              </DatePill>
              <DatePill $active={dateRange === "1YEAR"} onClick={() => setDateRange("1YEAR")}>
                Last 1 Year
              </DatePill>
            </DateRangePills>
          </ControlBar>
        )}

        {/* ── 1. DATE-WISE / VISIT-WISE CHRONOLOGICAL TIMELINE VIEW ── */}
        {inquiryData && viewMode === "TIMELINE" && (
          <div>
            {chronologicalVisits.length === 0 ? (
              <EmptyNotice>
                📅 No visits or clinical records found within the selected period ({dateRange}).
              </EmptyNotice>
            ) : (
              <TimelineWrap>
                {chronologicalVisits.map((visit, vIdx) => {
                  const isExpanded = expandedVisits[visit.dateStr] !== false; // expanded by default
                  const doctorNames = Array.from(visit.doctors).filter(Boolean).join(", ") || "Attending Doctor";

                  return (
                    <VisitNode key={visit.dateStr || vIdx}>
                      <TimelineDot $isIp={visit.isIp} />

                      <VisitCard $isIp={visit.isIp}>
                        <VisitHeader
                          $isIp={visit.isIp}
                          onClick={() => toggleVisitExpand(visit.dateStr)}
                        >
                          <VisitTitleGroup>
                            <VisitDateBadge>
                              <strong>{visit.formattedDate}</strong>
                              <span>{visit.relativeTime}</span>
                            </VisitDateBadge>

                            <VisitTypeBadge $isIp={visit.isIp}>
                              {visit.isIp ? "🏥 In-Patient (IP) Stay" : "🩺 Out-Patient (OP) Consultation"}
                            </VisitTypeBadge>

                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: T.textMain }}>
                              👨‍⚕️ {doctorNames}
                            </div>
                          </VisitTitleGroup>

                          <VisitMetaSummary>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {visit.admissions.length > 0 && (
                                <InfoTag style={{ background: T.greenLt, color: T.greenDk }}>
                                  IP: {visit.admissions[0].ipNumber}
                                </InfoTag>
                              )}
                              {visit.testsList.length > 0 && (
                                <InfoTag style={{ background: T.amberLt, color: T.amberDk }}>
                                  🧪 {visit.testsList.length} Test{visit.testsList.length > 1 ? "s" : ""}
                                </InfoTag>
                              )}
                              {visit.medicinesList.length > 0 && (
                                <InfoTag style={{ background: T.purpleLt, color: T.purpleDk }}>
                                  💊 {visit.medicinesList.length} Medicine{visit.medicinesList.length > 1 ? "s" : ""}
                                </InfoTag>
                              )}
                            </div>

                            <VisitCost>
                              Day Total: ₹{visit.totalSpend.toLocaleString("en-IN")}
                            </VisitCost>

                            <ExpandChevron $expanded={isExpanded}>▼</ExpandChevron>
                          </VisitMetaSummary>
                        </VisitHeader>

                        {isExpanded && (
                          <VisitBody>

                            {/* 1. Admission Details (If IP stay on this date) */}
                            {visit.admissions.map((adm, aIdx) => {
                              const roomInfo = (adm.room_details || [])[0] || {};
                              const totalAdv = (adm.advance_payments || []).reduce((sum, a) => sum + Number(a.amount || a.advance_amount || 0), 0);
                              return (
                                <VisitSection key={aIdx} style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                                  <SectionHeader $color={T.greenDk}>
                                    <span>🏥 In-Patient Admission Stay (IP No: {adm.ipNumber})</span>
                                    <StatusBadge $bg="#fff" $color={T.greenDk} $border="#86efac">
                                      {adm.is_admitted && !adm.is_discharged ? "Active Admission" : "Discharged"}
                                    </StatusBadge>
                                  </SectionHeader>

                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px 12px", fontSize: "0.8rem" }}>
                                    <div><strong>Admitting Doctor:</strong> {adm.admittingDoctorName || adm.admittingDoctorId}</div>
                                    <div><strong>Consulting Doctor:</strong> {adm.consultingDoctorName || adm.consultingDoctorId}</div>
                                    <div><strong>Room &amp; Bed:</strong> {roomInfo.roomNo ? `Room ${roomInfo.roomNo} (Bed ${roomInfo.bedNo})` : "—"}</div>
                                    <div><strong>Advance Deposited:</strong> ₹{totalAdv.toLocaleString("en-IN")}</div>
                                    {adm.reasonForAdmission && (
                                      <div style={{ gridColumn: "1 / -1" }}><strong>Diagnosis / Reason:</strong> {adm.reasonForAdmission}</div>
                                    )}
                                  </div>
                                </VisitSection>
                              );
                            })}

                            {/* 2. OP Consultation Registration */}
                            {visit.regVisits.length > 0 && (
                              <VisitSection>
                                <SectionHeader $color={T.blueDk}>
                                  <span>🩺 OP Doctor Consultation &amp; Registration</span>
                                </SectionHeader>

                                <DetailsTable>
                                  <thead>
                                    <tr>
                                      <DTh>Bill No</DTh>
                                      <DTh>Consulting Doctor</DTh>
                                      <DTh $align="right">Consultation Fee</DTh>
                                      <DTh>Payment Mode</DTh>
                                      <DTh>Status</DTh>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {visit.regVisits.map((rv, rIdx) => (
                                      <tr key={rIdx}>
                                        <DTd><strong>{rv.bill_number}</strong></DTd>
                                        <DTd>{rv.doctor_name || rv.doctor_id}</DTd>
                                        <DTd $align="right"><strong>₹{rv.total_fees?.toLocaleString("en-IN") || 0}</strong></DTd>
                                        <DTd>{rv.payment_mode || "Cash"}</DTd>
                                        <DTd>
                                          <StatusBadge $bg={rv.payment_status === "Paid" ? T.greenLt : T.amberLt} $color={rv.payment_status === "Paid" ? T.greenDk : T.amberDk}>
                                            {rv.payment_status || "Paid"}
                                          </StatusBadge>
                                        </DTd>
                                      </tr>
                                    ))}
                                  </tbody>
                                </DetailsTable>
                              </VisitSection>
                            )}

                            {/* 3. Ordered Investigation Tests (Itemized Test Cards) */}
                            {visit.testsList.length > 0 && (
                              <VisitSection style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                                <SectionHeader $color={T.amberDk}>
                                  <span>🧪 Ordered Diagnostic Tests ({visit.testsList.length} Tests)</span>
                                  <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                                    Total: ₹{visit.investigations.reduce((sum, b) => sum + (b.net_amount || 0), 0).toLocaleString("en-IN")}
                                  </span>
                                </SectionHeader>

                                <ItemGrid>
                                  {visit.testsList.map((t, tIdx) => (
                                    <ItemCard key={tIdx} $border="#fde68a">
                                      <div className="main-info">
                                        <strong>• {t.test_name}</strong>
                                        <span>Dept: {t.department} · Bill: {t.billNo}</span>
                                      </div>
                                      <div className="price-info">
                                        <strong>₹{t.amount?.toLocaleString("en-IN")}</strong>
                                        <div><InfoTag style={{ fontSize: "0.62rem", padding: "1px 4px" }}>{t.status || "Done"}</InfoTag></div>
                                      </div>
                                    </ItemCard>
                                  ))}
                                </ItemGrid>
                              </VisitSection>
                            )}

                            {/* 4. Prescribed & Dispensed Medicines (Itemized Medicine Cards) */}
                            {visit.medicinesList.length > 0 && (
                              <VisitSection style={{ background: "#faf5ff", borderColor: "#e9d5ff" }}>
                                <SectionHeader $color={T.purpleDk}>
                                  <span>💊 Prescribed &amp; Dispensed Medicines ({visit.medicinesList.length} Items)</span>
                                  <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                                    Total: ₹{visit.pharmacy.reduce((sum, b) => sum + (b.net_amount || 0), 0).toLocaleString("en-IN")}
                                  </span>
                                </SectionHeader>

                                <ItemGrid>
                                  {visit.medicinesList.map((m, mIdx) => (
                                    <ItemCard key={mIdx} $border="#e9d5ff">
                                      <div className="main-info">
                                        <strong>• {m.item_name}</strong>
                                        <span>
                                          Qty: {m.quantity} {m.dosage !== "—" ? `· Dose: ${m.dosage}` : ""} {m.batch_number !== "—" ? `· Batch: ${m.batch_number}` : ""}
                                        </span>
                                      </div>
                                      <div className="price-info">
                                        <strong>₹{m.amount?.toLocaleString("en-IN")}</strong>
                                        <div><InfoTag style={{ fontSize: "0.62rem", padding: "1px 4px" }}>{m.billNo}</InfoTag></div>
                                      </div>
                                    </ItemCard>
                                  ))}
                                </ItemGrid>
                              </VisitSection>
                            )}

                          </VisitBody>
                        )}
                      </VisitCard>
                    </VisitNode>
                  );
                })}
              </TimelineWrap>
            )}
          </div>
        )}

        {/* ── 2. CATEGORIZED SERVICE TABS VIEW ── */}
        {inquiryData && viewMode === "CATEGORIZED" && (
          <div>
            <div style={{ display: "flex", gap: 4, borderBottom: `2px solid ${T.grayBorder}`, marginBottom: 14, background: "#fff", borderRadius: "8px 8px 0 0", padding: "4px 8px 0", overflowX: "auto" }}>
              <ModeBtn
                $active={activeTab === "admission"}
                onClick={() => { setActiveTab("admission"); setFilterText(""); }}
              >
                🏥 Admissions ({admissions.length})
              </ModeBtn>
              <ModeBtn
                $active={activeTab === "op_visits"}
                onClick={() => { setActiveTab("op_visits"); setFilterText(""); }}
              >
                🩺 OP Visits ({regVisits.length})
              </ModeBtn>
              <ModeBtn
                $active={activeTab === "investigations"}
                onClick={() => { setActiveTab("investigations"); setFilterText(""); }}
              >
                🧪 Investigation Bills ({investBills.length})
              </ModeBtn>
              <ModeBtn
                $active={activeTab === "pharmacy"}
                onClick={() => { setActiveTab("pharmacy"); setFilterText(""); }}
              >
                💊 Pharmacy Bills ({pharmBills.length})
              </ModeBtn>
              <ModeBtn
                $active={activeTab === "profile"}
                onClick={() => { setActiveTab("profile"); setFilterText(""); }}
              >
                📋 Demographics
              </ModeBtn>
            </div>

            {/* In-Tab Filter Search Bar for Bills */}
            {(activeTab === "investigations" || activeTab === "pharmacy") && (
              <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: T.textMuted }}>
                  Showing {activeTab === "investigations" ? `${filteredInvestBills.length} of ${investBills.length} bills` : `${filteredPharmBills.length} of ${pharmBills.length} bills`}
                </span>
                <SearchInput
                  style={{ maxWidth: 320, height: 34 }}
                  type="text"
                  placeholder={`Search ${activeTab === "investigations" ? "bill no, test name, doctor..." : "bill no, medicine name, batch..."}`}
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
            )}

            {/* ADMISSIONS */}
            {activeTab === "admission" && (
              <div style={{ background: "#fff", border: `1.5px solid ${T.grayBorder}`, borderRadius: 10, padding: 16 }}>
                {admissions.length === 0 ? (
                  <EmptyNotice>No In-Patient admissions recorded for this patient.</EmptyNotice>
                ) : (
                  admissions.map((adm, idx) => {
                    const isActive = adm.is_admitted && !adm.is_discharged && !adm.is_cancelled;
                    const roomInfo = (adm.room_details || [])[0] || {};
                    const totalAdv = (adm.advance_payments || []).reduce((sum, a) => sum + Number(a.amount || a.advance_amount || 0), 0);
                    return (
                      <VisitSection key={idx} style={{ marginBottom: 12, background: isActive ? "#f0fdf4" : "#fff", borderColor: isActive ? "#86efac" : T.grayBorder }}>
                        <SectionHeader $color={T.primaryDk}>
                          <span>IP No: {adm.ipNumber} ({formatDateStr(adm.admissionDateTime)})</span>
                          <StatusBadge $bg={isActive ? T.greenLt : T.blueLt} $color={isActive ? T.greenDk : T.blueDk}>
                            {isActive ? "Currently Admitted" : "Discharged"}
                          </StatusBadge>
                        </SectionHeader>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px 12px", fontSize: "0.8rem" }}>
                          <div><strong>Admitting Doctor:</strong> {adm.admittingDoctorName || adm.admittingDoctorId}</div>
                          <div><strong>Consulting Doctor:</strong> {adm.consultingDoctorName || adm.consultingDoctorId}</div>
                          <div><strong>Room &amp; Bed:</strong> {roomInfo.roomNo ? `Room ${roomInfo.roomNo} (Bed ${roomInfo.bedNo})` : "—"}</div>
                          <div><strong>Advance Deposited:</strong> ₹{totalAdv.toLocaleString("en-IN")}</div>
                        </div>
                      </VisitSection>
                    );
                  })
                )}
              </div>
            )}

            {/* OP VISITS */}
            {activeTab === "op_visits" && (
              <div style={{ background: "#fff", border: `1.5px solid ${T.grayBorder}`, borderRadius: 10, padding: 16 }}>
                {regVisits.length === 0 ? (
                  <EmptyNotice>No OP consultation visits recorded.</EmptyNotice>
                ) : (
                  <DetailsTable>
                    <thead>
                      <tr>
                        <DTh>Bill No</DTh>
                        <DTh>Visit Date</DTh>
                        <DTh>Consulting Doctor</DTh>
                        <DTh $align="right">Fee</DTh>
                        <DTh>Payment Mode</DTh>
                        <DTh>Status</DTh>
                      </tr>
                    </thead>
                    <tbody>
                      {regVisits.map((rv, rIdx) => (
                        <tr key={rIdx}>
                          <DTd><strong>{rv.bill_number}</strong></DTd>
                          <DTd>{formatDateStr(rv.billed_date)}</DTd>
                          <DTd>{rv.doctor_name || rv.doctor_id}</DTd>
                          <DTd $align="right"><strong>₹{rv.total_fees?.toLocaleString("en-IN") || 0}</strong></DTd>
                          <DTd>{rv.payment_mode || "Cash"}</DTd>
                          <DTd>
                            <StatusBadge $bg={rv.payment_status === "Paid" ? T.greenLt : T.amberLt} $color={rv.payment_status === "Paid" ? T.greenDk : T.amberDk}>
                              {rv.payment_status || "Paid"}
                            </StatusBadge>
                          </DTd>
                        </tr>
                      ))}
                    </tbody>
                  </DetailsTable>
                )}
              </div>
            )}

            {/* INVESTIGATION BILLS */}
            {activeTab === "investigations" && (
              <div style={{ background: "#fff", border: `1.5px solid ${T.grayBorder}`, borderRadius: 10, padding: 16 }}>
                {filteredInvestBills.length === 0 ? (
                  <EmptyNotice>No investigation bills found.</EmptyNotice>
                ) : (
                  <DetailsTable>
                    <thead>
                      <tr>
                        <DTh>Bill No</DTh>
                        <DTh>Date</DTh>
                        <DTh>Type</DTh>
                        <DTh>Tests &amp; Diagnostics List</DTh>
                        <DTh>Doctor</DTh>
                        <DTh $align="right">Amount</DTh>
                        <DTh>Status</DTh>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvestBills.map((inv, idx) => (
                        <tr key={idx}>
                          <DTd><strong>{inv.investBillNo}</strong></DTd>
                          <DTd>{formatDateStr(inv.investBillDate)}</DTd>
                          <DTd><InfoTag>{inv.patientType}</InfoTag></DTd>
                          <DTd>
                            {(inv.tests || []).length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                {inv.tests.map((t, tIdx) => (
                                  <div key={tIdx} style={{ fontSize: "0.78rem" }}>
                                    • <strong>{t.test_name}</strong> <span style={{ color: T.textMuted }}>({t.department}) - ₹{t.amount}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              "Diagnostic Test"
                            )}
                          </DTd>
                          <DTd>{inv.doctor_name || "Doctor"}</DTd>
                          <DTd $align="right"><strong style={{ color: T.primaryDk }}>₹{inv.net_amount?.toLocaleString("en-IN")}</strong></DTd>
                          <DTd>
                            <StatusBadge $bg={inv.billing_status === "Paid" ? T.greenLt : T.amberLt} $color={inv.billing_status === "Paid" ? T.greenDk : T.amberDk}>
                              {inv.billing_status || "Paid"}
                            </StatusBadge>
                          </DTd>
                        </tr>
                      ))}
                    </tbody>
                  </DetailsTable>
                )}
              </div>
            )}

            {/* PHARMACY BILLS */}
            {activeTab === "pharmacy" && (
              <div style={{ background: "#fff", border: `1.5px solid ${T.grayBorder}`, borderRadius: 10, padding: 16 }}>
                {filteredPharmBills.length === 0 ? (
                  <EmptyNotice>No pharmacy bills found.</EmptyNotice>
                ) : (
                  <DetailsTable>
                    <thead>
                      <tr>
                        <DTh>Bill No</DTh>
                        <DTh>Date</DTh>
                        <DTh>Type</DTh>
                        <DTh>Dispensed Medicines List</DTh>
                        <DTh>Doctor</DTh>
                        <DTh $align="right">Amount</DTh>
                        <DTh>Status</DTh>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPharmBills.map((pb, idx) => (
                        <tr key={idx}>
                          <DTd><strong>{pb.bill_no || pb.estimate_no || `BILL-${pb.Bill_id}`}</strong></DTd>
                          <DTd>{formatDateStr(pb.bill_date)}</DTd>
                          <DTd><InfoTag>{pb.patientType}</InfoTag></DTd>
                          <DTd>
                            {(pb.medicines || []).length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                {pb.medicines.map((m, mIdx) => (
                                  <div key={mIdx} style={{ fontSize: "0.78rem" }}>
                                    • <strong>{m.item_name}</strong> <span style={{ color: T.textMuted }}>(Qty: {m.quantity}{m.dosage !== "—" ? `, Dose: ${m.dosage}` : ""}{m.batch_number !== "—" ? `, B: ${m.batch_number}` : ""}) - ₹{m.amount}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              "Pharmacy Items"
                            )}
                          </DTd>
                          <DTd>{pb.doctor_name || "Doctor"}</DTd>
                          <DTd $align="right"><strong style={{ color: T.primaryDk }}>₹{pb.net_amount?.toLocaleString("en-IN")}</strong></DTd>
                          <DTd>
                            <StatusBadge $bg={pb.billing_status === "Paid" || pb.billing_status === "Billed" ? T.greenLt : T.amberLt} $color={pb.billing_status === "Paid" || pb.billing_status === "Billed" ? T.greenDk : T.amberDk}>
                              {pb.billing_status || "Paid"}
                            </StatusBadge>
                          </DTd>
                        </tr>
                      ))}
                    </tbody>
                  </DetailsTable>
                )}
              </div>
            )}

            {/* PROFILE & DEMOGRAPHICS */}
            {activeTab === "profile" && (
              <div style={{ background: "#fff", border: `1.5px solid ${T.grayBorder}`, borderRadius: 10, padding: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px 18px", fontSize: "0.84rem" }}>
                  <div><strong>Full Name:</strong> {patient.name}</div>
                  <div><strong>UHID:</strong> {patient.uhid}</div>
                  <div><strong>Age / Gender:</strong> {patient.age} Y / {patient.gender}</div>
                  <div><strong>Mobile:</strong> {patient.mobilePhone}</div>
                  <div><strong>Blood Group:</strong> {patient.bloodGroup || "—"}</div>
                  <div><strong>Customer Type:</strong> {patient.customerType}</div>
                  <div><strong>Insurance Company:</strong> {patient.insuranceCompany}</div>
                  <div style={{ gridColumn: "1 / -1" }}><strong>Address:</strong> {[patient.address, patient.area, patient.city, patient.state, patient.pincode].filter(Boolean).join(", ") || "—"}</div>
                </div>
              </div>
            )}
          </div>
        )}

      </InquiryContainer>
    </PageWrapper>
  );
};

export default Enquiry;