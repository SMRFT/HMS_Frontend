import React, { useState, useEffect, useCallback, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;
const dropDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdfa 0%, #f8fafc 60%, #ecfdf5 100%);
  padding: 1.5rem 1rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const HeaderCard = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 60%, #065f46 100%);
  border-radius: 20px;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 8px 32px rgba(13, 148, 136, 0.25);
  animation: ${fadeIn} 0.4s ease;
`;
const HeaderIcon = styled.div`font-size: 2.5rem; line-height: 1;`;
const HeaderTitle = styled.h1`font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.3px;`;
const HeaderSubtitle = styled.p`font-size: 0.85rem; color: rgba(255,255,255,0.78); margin: 0.2rem 0 0;`;

const FormCard = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  animation: ${fadeIn} 0.45s ease;
`;

const SectionTitle = styled.div`
  font-size: 0.78rem;
  font-weight: 800;
  color: #0d9488;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ccfbf1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.1rem;
  margin-bottom: 1.5rem;
`;

const FieldGroup = styled.div`display: flex; flex-direction: column; gap: 0.35rem;`;

const Label = styled.label`
  font-size: 0.74rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;
const Required = styled.span`color: #ef4444; margin-left: 2px;`;

const inputStyle = css`
  padding: 0.55rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.88rem;
  font-family: inherit;
  color: #1e293b;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
    background: #fff;
  }
`;

const Input = styled.input`${inputStyle}`;
const Select = styled.select`${inputStyle} cursor: pointer;`;

// ── Multi-select Dropdown ─────────────────────────────────────────────────────
const MultiSelectWrapper = styled.div`position: relative; user-select: none;`;

const MultiSelectTrigger = styled.div`
  ${inputStyle}
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  min-height: 40px;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  ${p => p.open && css`
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
    background: #fff;
  `}
`;

const TagsRow = styled.div`display: flex; flex-wrap: wrap; gap: 0.3rem; flex: 1;`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: #fff;
  border-radius: 20px;
  padding: 0.15rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
`;

const TagRemove = styled.span`
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
  margin-left: 0.1rem;
  opacity: 0.8;
  &:hover { opacity: 1; }
`;

const Chevron = styled.span`
  font-size: 0.7rem;
  color: #94a3b8;
  transition: transform 0.2s;
  ${p => p.open && css`transform: rotate(180deg);`}
  flex-shrink: 0;
  margin-left: 4px;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1.5px solid #0d9488;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  z-index: 999;
  max-height: 220px;
  overflow-y: auto;
  animation: ${dropDown} 0.18s ease;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  transition: background 0.12s;
  background: ${p => p.selected ? "#f0fdfa" : "transparent"};
  &:hover { background: #f0fdfa; }
  &:not(:last-child) { border-bottom: 1px solid #f1f5f9; }
`;

const ItemLeft = styled.div`display: flex; align-items: center; gap: 0.6rem;`;

const Checkbox = styled.div`
  width: 16px; height: 16px;
  border-radius: 4px;
  border: 2px solid ${p => p.checked ? "#0d9488" : "#cbd5e1"};
  background: ${p => p.checked ? "#0d9488" : "#fff"};
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
`;

const CheckMark = styled.span`color: #fff; font-size: 0.65rem; font-weight: 900;`;

const ItemFee = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: #0f766e;
  background: #f0fdfa;
  border-radius: 8px;
  padding: 0.1rem 0.45rem;
`;

const PlaceholderText = styled.span`color: #94a3b8; font-size: 0.85rem; font-weight: 400;`;

// ── Fee display ───────────────────────────────────────────────────────────────
const FeeBox = styled.div`
  padding: 0.55rem 0.85rem;
  border: 1.5px solid #ccfbf1;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f766e;
  background: linear-gradient(90deg, #f0fdfa, #ecfdf5);
  min-height: 40px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem;
`;

const FeeBreakdown = styled.div`
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 500;
  margin-top: 0.25rem;
`;

const Divider = styled.hr`border: none; border-top: 1.5px solid #f1f5f9; margin: 1.5rem 0;`;

const FeeSummary = styled.div`
  background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%);
  border: 1.5px solid #a7f3d0;
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
`;

const FeeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0;
  font-size: 0.9rem;
`;
const FeeLabel = styled.span`color: #64748b; font-weight: 600;`;
const FeeValue = styled.span`
  font-weight: 800;
  color: ${p => p.highlight ? "#0f766e" : "#1e293b"};
  font-size: ${p => p.highlight ? "1.1rem" : "0.9rem"};
`;
const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0 0;
  margin-top: 0.4rem;
  border-top: 2px solid #6ee7b7;
`;

const ActionRow = styled.div`display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap;`;

const Btn = styled.button`
  padding: 0.65rem 1.6rem;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;
const SaveBtn = styled(Btn)`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: #fff;
  box-shadow: 0 4px 14px rgba(13,148,136,0.3);
  &:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(13,148,136,0.45); transform: translateY(-1px); }
`;
const ResetBtn = styled(Btn)`
  background: #f1f5f9;
  color: #475569;
  border: 1.5px solid #e2e8f0;
  &:hover:not(:disabled) { background: #e2e8f0; }
`;

const LoadingShimmer = styled.div`
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 400px 100%;
  animation: ${shimmer} 1.2s infinite linear;
`;

// ── Patient Records View Components ──────────────────────────────────────────
const ViewToggle = styled.div`
  display: flex;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 3px;
  gap: 3px;
`;

const ViewToggleBtn = styled.button`
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  background: ${p => p.active ? "#ffffff" : "transparent"};
  color: ${p => p.active ? "#0d9488" : "#64748b"};
  box-shadow: ${p => p.active ? "0 2px 5px rgba(0,0,0,0.08)" : "none"};
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

// ── Infographic-style Card Accent Palette ────────────────────────────────────
const CARD_ACCENTS = [
  { border: "#f97316", iconBg: "rgba(249,115,22,0.12)",  iconColor: "#f97316",  badgeBg: "#f97316"  },
  { border: "#3b82f6", iconBg: "rgba(59,130,246,0.12)",  iconColor: "#3b82f6",  badgeBg: "#3b82f6"  },
  { border: "#22c55e", iconBg: "rgba(34,197,94,0.12)",   iconColor: "#22c55e",  badgeBg: "#22c55e"  },
  { border: "#a855f7", iconBg: "rgba(168,85,247,0.12)",  iconColor: "#a855f7",  badgeBg: "#a855f7"  },
  { border: "#0d9488", iconBg: "rgba(13,148,136,0.12)",  iconColor: "#0d9488",  badgeBg: "#0d9488"  },
  { border: "#ec4899", iconBg: "rgba(236,72,153,0.12)",  iconColor: "#ec4899",  badgeBg: "#ec4899"  },
];
const CARD_ICONS = ["🩺", "👤", "📋", "💊", "🏥", "📊"];

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.25rem;
  max-height: 480px;
  overflow-y: auto;
  padding-right: 4px;
  padding-bottom: 4px;
`;

const PatientCard = styled.div`
  background: #ffffff;
  border: 1.5px solid ${p => p.selected ? p.$accentColor || "#0d9488" : "#e8ecf0"};
  border-left: 4px solid ${p => p.$accentColor || "#0d9488"};
  border-radius: 16px;
  padding: 1.2rem 1.2rem 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.22s ease;
  box-shadow: ${p => p.selected
    ? `0 8px 24px ${p.$accentColor || "#0d9488"}33`
    : "0 2px 10px rgba(0,0,0,0.06)"};
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  overflow: hidden;

  /* top-left corner tinted arc */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 52px; height: 52px;
    border-radius: 16px 0 52px 0;
    background: ${p => p.$iconBg || "rgba(13,148,136,0.10)"};
    pointer-events: none;
  }

  /* bottom-right corner tinted arc */
  &::after {
    content: '';
    position: absolute;
    bottom: 0; right: 0;
    width: 38px; height: 38px;
    border-radius: 52px 0 16px 0;
    background: ${p => p.$iconBg || "rgba(13,148,136,0.08)"};
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 28px ${p => p.$accentColor || "#0d9488"}33;
    border-color: ${p => p.$accentColor || "#0d9488"};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.6rem;
  position: relative;
  z-index: 1;
`;

const CardIconBox = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  background: ${p => p.$bg || "rgba(13,148,136,0.1)"};
  flex-shrink: 0;
`;

const CardBadgeCircle = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${p => p.$bg || "#0d9488"};
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 3px 10px ${p => p.$bg || "#0d9488"}55;
  text-align: center;
  line-height: 1.2;
`;

const PatientNameText = styled.h3`
  font-size: 0.96rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.1rem;
  line-height: 1.3;
`;

const MetaRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  font-size: 0.78rem;
  color: #64748b;
  padding-left: 0.05rem;
  position: relative;
  z-index: 1;

  span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    line-height: 1.4;
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.6rem;
  border-top: 1px solid #f1f5f9;
  position: relative;
  z-index: 1;
`;

const TotalFeeBadge = styled.span`
  font-size: 0.92rem;
  font-weight: 800;
  color: ${p => p.$color || "#0f766e"};
`;

const EditActionBtn = styled.button`
  padding: 0.3rem 0.85rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  border: 1.5px solid ${p => p.selected ? "transparent" : "#e2e8f0"};
  background: ${p => p.selected ? p.$accent || "#0d9488" : "#f8fafc"};
  color: ${p => p.selected ? "#ffffff" : "#475569"};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${p => p.$accent || "#0d9488"};
    color: #ffffff;
    border-color: transparent;
  }
`;

const TableWrapper = styled.div`
  max-height: 420px;
  overflow-y: auto;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
`;

const PatientTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;

  th {
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.72rem;
    letter-spacing: 0.5px;
    padding: 0.75rem 1rem;
    border-bottom: 2px solid #e2e8f0;
    text-align: left;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f5f9;
    color: #1e293b;
  }

  tbody tr {
    transition: background 0.15s ease;
    cursor: pointer;

    &:hover {
      background: #f0fdfa !important;
    }
  }
`;

// ─── Initial form state ───────────────────────────────────────────────────────
const initialForm = {

  mhc_no: null,
  patient_name: "",
  age: "",
  gender: "",
  contact_number: "",
  op_number: "",
  package: "",          // comma-joined names saved to DB
  source: "",
  package_category: "",
  package_fee: "",      // sum of selected package fees
  doctor_fee: "",
  add_tests: "",
  pharmacy: "",
  ip: "",
  total_fees: "",
  follow_up: "",
  description: "",
};

// ─── Helper ───────────────────────────────────────────────────────────────────
const toNum = (v) => parseFloat(String(v).replace(/,/g, "")) || 0;

// ─── Component ────────────────────────────────────────────────────────────────
export default function Masterhealthcheck() {
  const [form, setForm] = useState(initialForm);
  const [packages, setPackages] = useState([]);
  const [selectedPkgs, setSelectedPkgs] = useState([]); // [{package_name, package_fee}]
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [sources, setSources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [searchRecordText, setSearchRecordText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState("list"); // 'list' | 'form'
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  // ── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch stored records ──────────────────────────────────────────────────
  const fetchRecords = useCallback(async () => {
    setLoadingRecords(true);
    try {
      const res = await apiRequest(`${Hmsbaseurl}mhc_save_details/`, "GET");
      if (res.success && Array.isArray(res.data)) {
        setRecords(res.data);
      }
    } catch {
      console.error("Error fetching stored MHC records");
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // ── Fetch packages ───────────────────────────────────────────────────────
  const fetchPackages = useCallback(async () => {
    setLoadingPackages(true);
    try {
      const res = await apiRequest(`${Hmsbaseurl}mhc_get_package/`, "GET");
      if (res.success && res.data?.packages) {
        setPackages(res.data.packages);
      } else {
        toast.error("Failed to load packages");
      }
    } catch {
      toast.error("Error fetching packages");
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  // ── Fetch sources ────────────────────────────────────────────────────────
  const fetchSources = useCallback(async () => {
    setLoadingSources(true);
    try {
      const res = await apiRequest(`${Hmsbaseurl}mhc_source/`, "GET");
      if (res.success) {
        const sourceData = res.data?.sources || res.sources || (Array.isArray(res.data) ? res.data : []);
        setSources(sourceData);
      } else {
        toast.error("Failed to load sources");
      }
    } catch {
      toast.error("Error fetching sources");
    } finally {
      setLoadingSources(false);
    }
  }, []);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  // ── Populate form with selected record & switch to form view ──────────────
  const handleSelectRecord = (rec) => {
    setIsEditing(true);
    setForm({
      id: rec.id || rec._id || null,
      mhc_no: rec.mhc_no !== undefined && rec.mhc_no !== null ? rec.mhc_no : null,
      patient_name: rec.patient_name || "",
      age: rec.age !== undefined && rec.age !== null ? rec.age : "",
      gender: rec.gender || "",
      contact_number: rec.contact_number || "",
      op_number: rec.op_number || "",
      package: rec.package || "",
      source: rec.source || "",
      package_category: rec.package_category || "",
      package_fee: rec.package_fee ? parseFloat(rec.package_fee).toFixed(2) : "",
      doctor_fee: rec.doctor_fee ? parseFloat(rec.doctor_fee).toFixed(2) : "",
      add_tests: rec.add_tests ? parseFloat(rec.add_tests).toFixed(2) : "",
      pharmacy: rec.pharmacy ? parseFloat(rec.pharmacy).toFixed(2) : "",
      ip: rec.ip ? parseFloat(rec.ip).toFixed(2) : "",
      total_fees: rec.total_fees ? parseFloat(rec.total_fees).toFixed(2) : "",
      follow_up: rec.follow_up || "",
      description: rec.description || "",
    });

    if (rec.package) {
      const names = rec.package.split(",").map(s => s.trim().toLowerCase());
      const matched = packages.filter(p => names.includes((p.package_name || "").toLowerCase()));
      if (matched.length > 0) {
        setSelectedPkgs(matched);
      } else {
        const fallbacks = rec.package.split(",").map(s => ({
          package_name: s.trim(),
          package_fee: toNum(rec.package_fee) / (names.length || 1)
        }));
        setSelectedPkgs(fallbacks);
      }
    } else {
      setSelectedPkgs([]);
    }
    setActiveView("form");
    toast.info(`Editing record for ${rec.patient_name} (MHC #${rec.mhc_no || rec.op_number})`);
  };

  // ── Open New Registration Form ──────────────────────────────────────────
  const handleNewRegistration = () => {
    setForm(initialForm);
    setSelectedPkgs([]);
    setIsEditing(false);
    setActiveView("form");
  };

  // ── Return to Patients List ───────────────────────────────────────────────
  const handleBackToList = () => {
    setActiveView("list");
  };

  // ── Derive package_fee sum whenever selection changes ────────────────────
  useEffect(() => {
    const sum = selectedPkgs.reduce((acc, p) => acc + toNum(p.package_fee), 0);
    const names = selectedPkgs.map(p => p.package_name).join(", ");
    setForm(prev => ({ ...prev, package: names, package_fee: sum > 0 ? sum.toFixed(2) : "" }));
  }, [selectedPkgs]);

  // ── Recalculate grand total ──────────────────────────────────────────────
  useEffect(() => {
    const total =
      toNum(form.package_fee) +
      toNum(form.doctor_fee) +
      toNum(form.add_tests) +
      toNum(form.pharmacy) +
      toNum(form.ip);
    setForm(prev => ({ ...prev, total_fees: total > 0 ? total.toFixed(2) : "" }));
  }, [form.package_fee, form.doctor_fee, form.add_tests, form.pharmacy, form.ip]);

  // ── Generic field handler ────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ── Toggle a package in the multi-select ─────────────────────────────────
  const togglePackage = (pkg) => {
    setSelectedPkgs(prev => {
      const exists = prev.find(p => p.package_name === pkg.package_name);
      if (exists) return prev.filter(p => p.package_name !== pkg.package_name);
      return [...prev, pkg];
    });
  };

  // ── Remove a tag ─────────────────────────────────────────────────────────
  const removeTag = (e, pkgName) => {
    e.stopPropagation();
    setSelectedPkgs(prev => prev.filter(p => p.package_name !== pkgName));
  };

  // ── Submit & automatically return to card page on completion ────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.patient_name.trim()) { toast.error("Patient Name is required"); return; }
    if (selectedPkgs.length === 0) { toast.error("Please select at least one Package"); return; }
    setSaving(true);
    try {
      const res = await apiRequest(`${Hmsbaseurl}mhc_save_details/`, "POST", { ...form });
      if (res.success) {
        toast.success(isEditing ? "MHC details updated successfully!" : "MHC registration completed successfully!");
        setForm(initialForm);
        setSelectedPkgs([]);
        setIsEditing(false);
        await fetchRecords();
        setActiveView("list"); // Automatically come back to card page!
      } else {
        toast.error(res.error || "Failed to save details");
      }
    } catch {
      toast.error("Unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setSelectedPkgs([]);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <HeaderCard style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <HeaderIcon>🩺</HeaderIcon>
          <div>
            <HeaderTitle>Master Health Check</HeaderTitle>
            <HeaderSubtitle>Register &amp; manage MHC patient details</HeaderSubtitle>
          </div>
        </div>
        {activeView === "list" ? (
          <button
            type="button"
            onClick={handleNewRegistration}
            style={{
              padding: "0.65rem 1.4rem",
              borderRadius: "12px",
              fontSize: "0.88rem",
              fontWeight: 800,
              border: "none",
              background: "#ffffff",
              color: "#0d9488",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.15)"; }}
          >
            ➕ New Registration
          </button>
        ) : (
          <button
            type="button"
            onClick={handleBackToList}
            style={{
              padding: "0.65rem 1.4rem",
              borderRadius: "12px",
              fontSize: "0.88rem",
              fontWeight: 800,
              border: "1.5px solid rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.15)",
              color: "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              backdropFilter: "blur(4px)"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
          >
            ← Back to Patients List
          </button>
        )}
      </HeaderCard>

      {/* ── View 1: Registered Patients List (Cards & Table) ── */}
      {activeView === "list" && (
        <FormCard style={{ padding: "1.5rem 1.75rem" }}>
          <SectionTitle style={{ marginBottom: "1rem" }}>
            <span>🔍 Registered MHC Patients ({records.length})</span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500, textTransform: "none" }}>
                Click any record to load &amp; update details
              </span>
              <ViewToggle>
                <ViewToggleBtn active={viewMode === "cards"} onClick={() => setViewMode("cards")}>
                  🎴 Cards
                </ViewToggleBtn>
                <ViewToggleBtn active={viewMode === "table"} onClick={() => setViewMode("table")}>
                  📋 Table
                </ViewToggleBtn>
              </ViewToggle>
            </div>
          </SectionTitle>

          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
            <Input
              type="text"
              placeholder="Search by Patient Name, OP Number, Contact Number, or MHC No..."
              value={searchRecordText}
              onChange={(e) => setSearchRecordText(e.target.value)}
              style={{ flex: 1, minWidth: "280px" }}
            />
            <SaveBtn type="button" onClick={handleNewRegistration} style={{ padding: "0.55rem 1.2rem", fontSize: "0.82rem" }}>
              ➕ New Registration
            </SaveBtn>
          </div>

          {(() => {
            const filtered = records.filter((r) => {
              if (!searchRecordText.trim()) return true;
              const q = searchRecordText.toLowerCase();
              return (
                (r.patient_name || "").toLowerCase().includes(q) ||
                (r.op_number || "").toLowerCase().includes(q) ||
                (r.contact_number || "").includes(q) ||
                (r.mhc_no || "").toString().includes(q)
              );
            });

            if (filtered.length === 0) {
              return (
                <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "16px", border: "1.5px dashed #cbd5e1" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#334155", marginBottom: "0.25rem" }}>No MHC Patient Records Found</div>
                  <div style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "1rem" }}>Register your first MHC patient to view cards or table entries here.</div>
                  <SaveBtn type="button" onClick={handleNewRegistration} style={{ margin: "0 auto" }}>
                    ➕ Start New MHC Registration
                  </SaveBtn>
                </div>
              );
            }

            if (viewMode === "cards") {
              return (
                <CardsGrid>
                  {filtered.map((rec, idx) => {
                    const isSelected = form.mhc_no === rec.mhc_no || (rec.id && form.id === rec.id);
                    const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
                    const icon = CARD_ICONS[idx % CARD_ICONS.length];
                    return (
                      <PatientCard
                        key={idx}
                        selected={isSelected}
                        $accentColor={accent.border}
                        $iconBg={accent.iconBg}
                        onClick={() => handleSelectRecord(rec)}
                      >
                        {/* Card Header: icon + name + circular badge */}
                        <CardHeader>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", flex: 1 }}>
                            <CardIconBox $bg={accent.iconBg}>
                              {icon}
                            </CardIconBox>
                            <div style={{ flex: 1 }}>
                              <PatientNameText>{rec.patient_name || "N/A"}</PatientNameText>
                              {rec.op_number && (
                                <div style={{ fontSize: "0.72rem", color: accent.iconColor, fontWeight: 700 }}>
                                  OP: {rec.op_number}
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Circular badge — shows gender/age initials, NO MHC NO */}
                          <CardBadgeCircle $bg={accent.badgeBg}>
                            <div>{rec.gender === "Male" ? "♂" : rec.gender === "Female" ? "♀" : "👤"}</div>
                          </CardBadgeCircle>
                        </CardHeader>

                        {/* Meta info rows */}
                        <MetaRow>
                          {rec.contact_number && <span>📞 {rec.contact_number}</span>}
                          {rec.package && <span>📦 <strong style={{ color: "#334155" }}>{rec.package}</strong></span>}
                          {rec.package_category && <span>🏷️ {rec.package_category}</span>}
                          {rec.source && <span>📣 {rec.source}</span>}
                        </MetaRow>

                        <CardFooter>
                          <TotalFeeBadge $color={accent.border}>
                            ₹ {toNum(rec.total_fees).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </TotalFeeBadge>
                          <EditActionBtn selected={isSelected} $accent={accent.badgeBg}>
                            {isSelected ? "✏️ Editing" : "Edit →"}
                          </EditActionBtn>
                        </CardFooter>
                      </PatientCard>
                    );
                  })}
                </CardsGrid>
              );
            }

            return (
              <TableWrapper>
                <PatientTable>
                  <thead>
                    <tr>
                      <th>MHC No</th>
                      <th>Patient Name</th>
                      <th>OP Number</th>
                      <th>Age / Gender</th>
                      <th>Contact</th>
                      <th>Package</th>
                      <th>Category</th>
                      <th>Total Fees</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((rec, idx) => {
                      const isSelected = form.mhc_no === rec.mhc_no || (rec.id && form.id === rec.id);
                      return (
                        <tr
                          key={idx}
                          onClick={() => handleSelectRecord(rec)}
                          style={{ background: isSelected ? "#f0fdfa" : undefined }}
                        >
                          <td><strong>#{rec.mhc_no || idx + 1}</strong></td>
                          <td style={{ fontWeight: 700, color: "#0f172a" }}>{rec.patient_name}</td>
                          <td>{rec.op_number || "-"}</td>
                          <td>{rec.age ? `${rec.age} Yrs` : "-"} {rec.gender ? `/ ${rec.gender}` : ""}</td>
                          <td>{rec.contact_number || "-"}</td>
                          <td><span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "12px", fontWeight: 700, fontSize: "0.75rem" }}>{rec.package || "-"}</span></td>
                          <td>{rec.package_category || "MHC"}</td>
                          <td style={{ fontWeight: 800, color: "#0f766e" }}>
                            ₹ {toNum(rec.total_fees).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <EditActionBtn selected={isSelected}>
                              {isSelected ? "✏️ Editing" : "Edit"}
                            </EditActionBtn>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </PatientTable>
              </TableWrapper>
            );
          })()}
        </FormCard>
      )}

      {/* ── View 2: Registration / Edit Form View ── */}
      {activeView === "form" && (
        <FormCard>
          <form onSubmit={handleSave}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1.5px solid #f1f5f9" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: isEditing ? "#0d9488" : "#0f172a" }}>
                {isEditing ? `✏️ Editing Record: ${form.patient_name} (MHC #${form.mhc_no || form.op_number})` : "📝 New MHC Patient Registration"}
              </span>
              <ResetBtn type="button" onClick={handleBackToList} style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}>
                ← Back to Patients List
              </ResetBtn>
            </div>

            {/* ── Patient Information ── */}
            <SectionTitle>👤 Patient Information</SectionTitle>
            <FormGrid>
              <FieldGroup>
                <Label>Patient Name <Required>*</Required></Label>
                <Input id="mhc-patient-name" name="patient_name" placeholder="Enter full name"
                  value={form.patient_name} onChange={handleChange} />
              </FieldGroup>
              <FieldGroup>
                <Label>Age</Label>
                <Input id="mhc-age" name="age" type="number" placeholder="Age in years"
                  value={form.age} onChange={handleChange} min={0} max={120} />
              </FieldGroup>
              <FieldGroup>
                <Label>Gender</Label>
                <Select id="mhc-gender" name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </FieldGroup>
              <FieldGroup>
                <Label>Contact Number</Label>
                <Input id="mhc-contact" name="contact_number" placeholder="Mobile number"
                  value={form.contact_number} onChange={handleChange} maxLength={15} />
              </FieldGroup>
              <FieldGroup>
                <Label>OP Number</Label>
                <Input id="mhc-op-number" name="op_number" placeholder="OP / Patient ID"
                  value={form.op_number} onChange={handleChange} />
              </FieldGroup>
              <FieldGroup>
                <Label>Source</Label>
                {loadingSources ? (
                  <LoadingShimmer />
                ) : (
                  <Select id="mhc-source" name="source" value={form.source} onChange={handleChange}>
                    <option value="">Select Source</option>
                    {sources.map((s, idx) => {
                      const sourceVal = typeof s === "string" ? s : (s.source || "");
                      return (
                        <option key={idx} value={sourceVal}>
                          {sourceVal}
                        </option>
                      );
                    })}
                  </Select>
                )}
              </FieldGroup>
              <FieldGroup>
                <Label>Follow Up</Label>
                <Input id="mhc-follow-up" name="follow_up" type="date"
                  value={form.follow_up} onChange={handleChange} />
              </FieldGroup>

            </FormGrid>

            <Divider />

            {/* ── Package Details ── */}
            <SectionTitle>📦 Package Details</SectionTitle>
            <FormGrid>

              {/* ── Multi-select Package ── */}
              <FieldGroup style={{ gridColumn: "span 2" }}>
                <Label>Package <Required>*</Required></Label>
                {loadingPackages ? (
                  <LoadingShimmer />
                ) : (
                  <MultiSelectWrapper ref={dropRef}>
                    <MultiSelectTrigger
                      id="mhc-package"
                      open={dropOpen}
                      onClick={() => setDropOpen(o => !o)}
                    >
                      <TagsRow>
                        {selectedPkgs.length === 0
                          ? <PlaceholderText>Select one or more packages…</PlaceholderText>
                          : selectedPkgs.map(p => (
                            <Tag key={p.package_name}>
                              {p.package_name}
                              <TagRemove onClick={(e) => removeTag(e, p.package_name)}>✕</TagRemove>
                            </Tag>
                          ))
                        }
                      </TagsRow>
                      <Chevron open={dropOpen}>▼</Chevron>
                    </MultiSelectTrigger>

                    {dropOpen && (
                      <DropdownMenu>
                        {packages.length === 0 && (
                          <DropdownItem style={{ color: "#94a3b8", cursor: "default" }}>
                            No packages available
                          </DropdownItem>
                        )}
                        {packages.map((pkg, idx) => {
                          const isSelected = selectedPkgs.some(p => p.package_name === pkg.package_name);
                          return (
                            <DropdownItem
                              key={idx}
                              selected={isSelected}
                              onClick={() => togglePackage(pkg)}
                            >
                              <ItemLeft>
                                <Checkbox checked={isSelected}>
                                  {isSelected && <CheckMark>✓</CheckMark>}
                                </Checkbox>
                                {pkg.package_name}
                              </ItemLeft>
                              <ItemFee>
                                ₹ {toNum(pkg.package_fee).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </ItemFee>
                            </DropdownItem>
                          );
                        })}
                      </DropdownMenu>
                    )}
                  </MultiSelectWrapper>
                )}
              </FieldGroup>

              {/* ── Package Fee (auto-summed) ── */}
              <FieldGroup>
                <Label>Package Fee (₹)</Label>
                <FeeBox>
                  {selectedPkgs.length === 0
                    ? <span style={{ color: "#94a3b8", fontWeight: 400 }}>Auto-summed on selection</span>
                    : <>
                      <span>₹ {parseFloat(form.package_fee || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </>
                  }
                </FeeBox>
                {selectedPkgs.length > 1 && (
                  <FeeBreakdown>
                    {selectedPkgs.map(p =>
                      `${p.package_name}: ₹ ${toNum(p.package_fee).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    ).join("  +  ")}
                  </FeeBreakdown>
                )}
              </FieldGroup>

              {/* ── Package Category ── */}
              <FieldGroup>
                <Label>Package Category</Label>
                <Select id="mhc-package-category" name="package_category"
                  value={form.package_category} onChange={handleChange}>
                  <option value="">Select Category</option>
                  <option value="MHC">MHC</option>
                  <option value="Others">Others</option>
                </Select>
              </FieldGroup>
            </FormGrid>

            <Divider />

            {/* ── Additional Fees ── */}
            <SectionTitle>💰 Additional Fees</SectionTitle>
            <FormGrid>
              <FieldGroup>
                <Label>Doctor Fee (₹)</Label>
                <Input id="mhc-doctor-fee" name="doctor_fee" type="number" placeholder="0.00"
                  value={form.doctor_fee} onChange={handleChange} step="0.01" min="0" />
              </FieldGroup>
              <FieldGroup>
                <Label>Add-on Tests (₹)</Label>
                <Input id="mhc-add-tests" name="add_tests" type="number" placeholder="0.00"
                  value={form.add_tests} onChange={handleChange} step="0.01" min="0" />
              </FieldGroup>
              <FieldGroup>
                <Label>Pharmacy (₹)</Label>
                <Input id="mhc-pharmacy" name="pharmacy" type="number" placeholder="0.00"
                  value={form.pharmacy} onChange={handleChange} step="0.01" min="0" />
              </FieldGroup>
              <FieldGroup>
                <Label>IP Charges (₹)</Label>
                <Input id="mhc-ip" name="ip" type="number" placeholder="0.00"
                  value={form.ip} onChange={handleChange} step="0.01" min="0" />
              </FieldGroup>
            </FormGrid>

            {/* ── Fee Summary ── */}
            <FeeSummary>
              <SectionTitle style={{ marginBottom: "0.8rem" }}>🧾 Fee Summary</SectionTitle>
              <FeeRow>
                <FeeLabel>Package Fee {selectedPkgs.length > 1 && `(${selectedPkgs.length} packages)`}</FeeLabel>
                <FeeValue>₹ {parseFloat(form.package_fee || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</FeeValue>
              </FeeRow>
              <FeeRow>
                <FeeLabel>Doctor Fee</FeeLabel>
                <FeeValue>₹ {parseFloat(form.doctor_fee || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</FeeValue>
              </FeeRow>
              <FeeRow>
                <FeeLabel>Add-on Tests</FeeLabel>
                <FeeValue>₹ {parseFloat(form.add_tests || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</FeeValue>
              </FeeRow>
              <FeeRow>
                <FeeLabel>Pharmacy</FeeLabel>
                <FeeValue>₹ {parseFloat(form.pharmacy || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</FeeValue>
              </FeeRow>
              <FeeRow>
                <FeeLabel>IP Charges</FeeLabel>
                <FeeValue>₹ {parseFloat(form.ip || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</FeeValue>
              </FeeRow>
              <TotalRow>
                <FeeLabel style={{ fontWeight: 800, color: "#0f766e", fontSize: "0.95rem" }}>Total Fees</FeeLabel>
                <FeeValue highlight>
                  ₹ {parseFloat(form.total_fees || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </FeeValue>
              </TotalRow>
            </FeeSummary>

            {/* ── Actions ── */}
            <ActionRow>
              <ResetBtn type="button" onClick={handleBackToList} disabled={saving}>← Cancel &amp; Back</ResetBtn>
              <ResetBtn type="button" onClick={handleReset} disabled={saving}>🔄 Reset Form</ResetBtn>
              <SaveBtn type="submit" disabled={saving}>
                {saving ? "⏳ Saving..." : isEditing ? "✏️ Update MHC Details" : "💾 Complete MHC Registration"}
              </SaveBtn>
            </ActionRow>
          </form>
        </FormCard>
      )}
    </PageWrapper>
  );
}
