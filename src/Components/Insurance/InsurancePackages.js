import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import {
  Shield,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Layers,
  FileText,
  Check,
  X,
  AlertCircle
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";

const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "/_b_a_c_k_e_n_d/HMS/";

// ── Theme constants ──────────────────────────────────────────────────────────
const THEME = {
  primary: "#133d34",
  primaryHover: "#0e2c25",
  teal: "#0d9488",
  tealLight: "#f0fdfa",
  tealBorder: "#99f6e4",
  slate: "#1e293b",
  slateLight: "#f8fafc",
  border: "#e2e8f0",
  textMain: "#0f172a",
  textMuted: "#64748b",
  success: "#10b981",
  successBg: "#dcfce7",
  successText: "#15803d",
  danger: "#ef4444",
  dangerBg: "#fee2e2",
  dangerText: "#b91c1c",
  warning: "#f59e0b",
  warningBg: "#fef3c7",
  warningText: "#b45309",
  blue: "#2563eb",
  blueBg: "#dbeafe",
  blueText: "#1d4ed8",
};

// ── Schemes Definition ────────────────────────────────────────────────────────
const DEFAULT_SCHEMES = [
  {
    id: "cghs",
    name: "CGHS",
    fullName: "Central Government Health Scheme",
    collection: "hospital_insurance_packages_cghs",
    badge: "CGHS",
    iconColor: "#0d9488",
  },
  {
    id: "cm_scheme",
    name: "CM Scheme",
    fullName: "Chief Minister's Comprehensive Health Insurance",
    collection: "hospital_insurance_packages_cm_scheme",
    badge: "CMCHS",
    iconColor: "#2563eb",
  },
  {
    id: "echs",
    name: "ECHS",
    fullName: "Ex-Servicemen Contributory Health Scheme",
    collection: "hospital_insurance_packages_echs",
    badge: "ECHS",
    iconColor: "#7c3aed",
  },
  {
    id: "general_gipsa",
    name: "General GIPSA",
    fullName: "General Insurance Public Sector Association",
    collection: "hospital_insurance_packages_general_gipsa",
    badge: "GIPSA",
    iconColor: "#ea580c",
  },
  {
    id: "implants_and_specified",
    name: "Implants & Specified",
    fullName: "Implants, High-End & Specified Procedures",
    collection: "hospital_insurance_packages_implants_and_specified",
    badge: "Implants",
    iconColor: "#db2777",
  },
  {
    id: "nhis",
    name: "NHIS",
    fullName: "New Health Insurance Scheme",
    collection: "hospital_insurance_packages_nhis",
    badge: "NHIS",
    iconColor: "#059669",
  },
  {
    id: "railway_cghs_esi_esic",
    name: "Railway / CGHS / ESI / ESIC",
    fullName: "Integrated Railway, CGHS, ESI & ESIC Scheme",
    collection: "hospital_insurance_packages_railway_cghs_esi_esic",
    badge: "Railway/ESI",
    iconColor: "#0891b2",
  },
];

// ── Responsive Styled Components ─────────────────────────────────────────────
const PageContainer = styled.div`
  padding: 24px 32px;
  background-color: #f8fafc;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: ${THEME.textMain};

  @media (max-width: 1024px) {
    padding: 16px 20px;
  }
  @media (max-width: 640px) {
    padding: 12px 10px;
  }
`;

const HeaderCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 18px 24px;
  border: 1px solid ${THEME.border};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 18px;

  @media (max-width: 640px) {
    padding: 14px 16px;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const HeaderIconBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${THEME.teal}, ${THEME.primary});
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(13, 148, 136, 0.25);

  @media (max-width: 480px) {
    width: 38px;
    height: 38px;
  }
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${THEME.slate};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 640px) {
    font-size: 18px;
  }
`;

const PageSubtitle = styled.p`
  font-size: 12.5px;
  color: ${THEME.textMuted};
  margin: 3px 0 0 0;

  @media (max-width: 640px) {
    font-size: 11.5px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
    button {
      flex: 1;
      justify-content: center;
    }
  }
`;

const PrimaryButton = styled.button`
  background-color: ${THEME.teal};
  color: #ffffff;
  border: none;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(13, 148, 136, 0.2);

  &:hover {
    background-color: ${THEME.primaryHover};
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(13, 148, 136, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  background-color: #ffffff;
  color: ${THEME.textMuted};
  border: 1px solid ${THEME.border};
  padding: 8px 13px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${THEME.slateLight};
    color: ${THEME.textMain};
    border-color: #cbd5e1;
  }
`;

// ── Tabs Navigation ──────────────────────────────────────────────────────────
const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 6px;
  margin-bottom: 16px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;

  &::-webkit-scrollbar {
    height: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }
`;

const TabButton = styled.button`
  background: ${({ $active }) => ($active ? "#ffffff" : "#f1f5f9")};
  color: ${({ $active }) => ($active ? THEME.teal : THEME.textMuted)};
  border: 1px solid ${({ $active }) => ($active ? THEME.tealBorder : "transparent")};
  border-bottom: 3px solid ${({ $active }) => ($active ? THEME.teal : "transparent")};
  padding: 10px 16px;
  border-radius: 10px 10px 4px 4px;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  transition: all 0.2s ease;
  box-shadow: ${({ $active }) => ($active ? "0 2px 8px rgba(13, 148, 136, 0.12)" : "none")};

  &:hover {
    background: #ffffff;
    color: ${THEME.teal};
  }
`;

const TabBadge = styled.span`
  background: ${({ $active }) => ($active ? THEME.tealLight : "#e2e8f0")};
  color: ${({ $active }) => ($active ? THEME.teal : THEME.textMuted)};
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? THEME.tealBorder : "transparent")};
`;

// ── Stats Summary Bar ────────────────────────────────────────────────────────
const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
`;

const StatCard = styled.div`
  background: #ffffff;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid ${THEME.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`;

const StatText = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatLabel = styled.span`
  font-size: 11.5px;
  color: ${THEME.textMuted};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 480px) {
    font-size: 10.5px;
  }
`;

const StatValue = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${({ $color }) => $color || THEME.slate};
  margin-top: 2px;

  @media (max-width: 480px) {
    font-size: 17px;
  }
`;

const StatIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: ${({ $bg }) => $bg || THEME.tealLight};
  color: ${({ $color }) => $color || THEME.teal};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 480px) {
    display: none;
  }
`;

// ── Controls / Filter Bar ────────────────────────────────────────────────────
const ControlsCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 18px;
  border: 1px solid ${THEME.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  min-width: 260px;
  flex: 1;

  @media (max-width: 768px) {
    min-width: 100%;
    width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 9px 14px 9px 38px;
  border-radius: 8px;
  border: 1px solid ${THEME.border};
  font-size: 13px;
  background: #f8fafc;
  color: ${THEME.textMain};
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${THEME.teal};
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const StatusPillGroup = styled.div`
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
`;

const StatusPill = styled.button`
  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  color: ${({ $active, $type }) => {
    if (!$active) return THEME.textMuted;
    if ($type === "active") return THEME.successText;
    if ($type === "inactive") return THEME.dangerText;
    return THEME.slate;
  }};
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: ${({ $active }) => ($active ? "0 1px 3px rgba(0,0,0,0.08)" : "none")};
  transition: all 0.15s ease;

  &:hover {
    color: ${THEME.textMain};
  }
`;

const SelectDropdown = styled.select`
  padding: 7px 11px;
  border-radius: 8px;
  border: 1px solid ${THEME.border};
  font-size: 12.5px;
  background: #ffffff;
  color: ${THEME.slate};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${THEME.teal};
  }
`;

// ── Top Horizontal Scrollbar & Table Styling ─────────────────────────────────
const TableWrapper = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid ${THEME.border};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
  overflow: hidden;
  position: relative;
`;

// Dedicated Top Horizontal Scrollbar container
const TopScrollContainer = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  height: 12px;
  background: #f1f5f9;
  border-bottom: 1px solid ${THEME.border};
  -webkit-overflow-scrolling: touch;

  /* Custom visible horizontal scrollbar at the top */
  scrollbar-width: thin;
  scrollbar-color: ${THEME.teal} #f1f5f9;

  &::-webkit-scrollbar {
    height: 10px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  &::-webkit-scrollbar-thumb {
    background: ${THEME.teal};
    border-radius: 6px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${THEME.primaryHover};
  }
`;

const ResponsiveTableContainer = styled.div`
  overflow-x: auto;
  max-height: 620px;
  -webkit-overflow-scrolling: touch;

  /* Hide the bottom horizontal scrollbar completely so left-to-right scroll is ONLY at the top */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;

const StyledTable = styled.table`
  min-width: 960px;
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;

  thead th {
    background-color: #f8fafc;
    color: #475569;
    font-weight: 600;
    padding: 11px 16px;
    border-bottom: 2px solid ${THEME.border};
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: #f8fafc;
    }

    &.inactive-row {
      background-color: #fffaf0;
      opacity: 0.85;
    }
  }

  tbody td {
    padding: 11px 16px;
    vertical-align: middle;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $active }) => ($active ? THEME.successBg : THEME.dangerBg)};
  color: ${({ $active }) => ($active ? THEME.successText : THEME.dangerText)};
  border: 1px solid ${({ $active }) => ($active ? "#bbf7d0" : "#fecaca")};
`;

const RateBadge = styled.span`
  font-weight: 600;
  color: ${THEME.slate};
  font-family: monospace, sans-serif;
  font-size: 12.5px;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
`;

const IconButton = styled.button`
  background: ${({ $bg }) => $bg || "transparent"};
  color: ${({ $color }) => $color || THEME.textMuted};
  border: 1px solid ${({ $border }) => $border || "transparent"};
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $hoverBg }) => $hoverBg || "#e2e8f0"};
    color: ${({ $hoverColor }) => $hoverColor || THEME.textMain};
    transform: scale(1.05);
  }
`;

// ── Pagination Bar ───────────────────────────────────────────────────────────
const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: #f8fafc;
  border-top: 1px solid ${THEME.border};
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const PaginationInfo = styled.span`
  font-size: 12px;
  color: ${THEME.textMuted};
`;

const PageButtonsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageButton = styled.button`
  min-width: 30px;
  height: 30px;
  padding: 0 7px;
  border-radius: 6px;
  border: 1px solid ${({ $active }) => ($active ? THEME.teal : THEME.border)};
  background: ${({ $active }) => ($active ? THEME.teal : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : THEME.slate)};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: ${({ $active }) => ($active ? THEME.teal : "#f1f5f9")};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// ── Modal Styles ─────────────────────────────────────────────────────────────
const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(3px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  box-sizing: border-box;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 580px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: modalIn 0.2s ease-out;

  @keyframes modalIn {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @media (max-width: 480px) {
    width: 98%;
    max-height: 92vh;
  }
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  background: ${THEME.slateLight};
  border-bottom: 1px solid ${THEME.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${THEME.slate};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalBody = styled.div`
  padding: 20px;
  max-height: 72vh;
  overflow-y: auto;

  @media (max-width: 480px) {
    padding: 14px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 14px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 5px;

  span.req {
    color: ${THEME.danger};
    margin-left: 2px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid ${THEME.border};
  font-size: 13px;
  color: ${THEME.textMain};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${THEME.teal};
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
  }
`;

const Row2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  padding: 9px 12px;
  background: ${THEME.slateLight};
  border-radius: 8px;
  border: 1px solid ${THEME.border};

  input[type="checkbox"] {
    width: 17px;
    height: 17px;
    accent-color: ${THEME.teal};
    cursor: pointer;
  }
`;

const ModalFooter = styled.div`
  padding: 14px 20px;
  background: ${THEME.slateLight};
  border-top: 1px solid ${THEME.border};
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${THEME.textMuted};

  p {
    margin: 8px 0 0 0;
    font-size: 13.5px;
  }
`;

// ── Initial Form Data ────────────────────────────────────────────────────────
const initialFormData = {
  scheme: "cghs",
  name: "",
  nabh_code: "",
  category: "",
  department: "",
  nabh_rate: 0,
  non_nabh_rate: 0,
  is_active: true,
  sl_no: "",
};

// ═════════════════════════════════════════════════════════════════════════════
// Main Component: InsurancePackages
// ═════════════════════════════════════════════════════════════════════════════
const InsurancePackages = () => {
  // Active Tab & Schemes list
  const [schemes, setSchemes] = useState(DEFAULT_SCHEMES);
  const [activeTab, setActiveTab] = useState("cghs");

  // Items & pagination state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'
  const [selectedCategory, setSelectedCategory] = useState("");

  // Categories list for active scheme
  const [categories, setCategories] = useState([]);

  // Modal State: Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Scheme counts lookup
  const [schemeCounts, setSchemeCounts] = useState({});

  // ── Synchronized Top Horizontal Scrollbar ───────────────────────────────────
  const topScrollRef = useRef(null);
  const tableScrollRef = useRef(null);
  const isSyncingTop = useRef(false);
  const isSyncingTable = useRef(false);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);

  const handleTopScroll = () => {
    if (isSyncingTable.current) {
      isSyncingTable.current = false;
      return;
    }
    if (topScrollRef.current && tableScrollRef.current) {
      isSyncingTop.current = true;
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const handleTableScroll = () => {
    if (isSyncingTop.current) {
      isSyncingTop.current = false;
      return;
    }
    if (topScrollRef.current && tableScrollRef.current) {
      isSyncingTable.current = true;
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  };

  const updateScrollWidth = useCallback(() => {
    if (tableScrollRef.current) {
      const sw = tableScrollRef.current.scrollWidth;
      const cw = tableScrollRef.current.clientWidth;
      setTableScrollWidth(sw);
      setHasHorizontalScroll(sw > cw);
    }
  }, []);

  useEffect(() => {
    updateScrollWidth();
    const el = tableScrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updateScrollWidth());
    ro.observe(el);
    window.addEventListener("resize", updateScrollWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateScrollWidth);
    };
  }, [updateScrollWidth, items, loading]);

  // ── 1. Fetch Scheme Overview / Counts ──────────────────────────────────────
  const fetchSchemesOverview = useCallback(async () => {
    try {
      const res = await apiRequest(`${BASE}insurance-packages/schemes/`, "GET");
      if (res.success && Array.isArray(res.data?.schemes)) {
        const countsMap = {};
        res.data.schemes.forEach((s) => {
          countsMap[s.id] = {
            total: s.total_items || 0,
            active: s.active_items || 0,
            inactive: s.inactive_items || 0,
          };
        });
        setSchemeCounts(countsMap);
      }
    } catch (err) {
      console.error("Failed to fetch schemes summary:", err);
    }
  }, []);

  useEffect(() => {
    fetchSchemesOverview();
  }, [fetchSchemesOverview]);

  // ── 2. Fetch Items for Active Scheme with Filters & Pagination ─────────────
  const fetchItems = useCallback(async () => {
    if (!activeTab) return;
    setLoading(true);
    try {
      let url = `${BASE}insurance-packages/items/?scheme=${encodeURIComponent(activeTab)}&page=${currentPage}&page_size=${pageSize}`;

      if (statusFilter === "active") {
        url += "&status=active";
      } else if (statusFilter === "inactive") {
        url += "&status=inactive";
      }

      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      if (selectedCategory) {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }

      const res = await apiRequest(url, "GET");

      if (res.success && res.data) {
        const list = Array.isArray(res.data.items) ? res.data.items : [];
        setItems(list);
        setTotalCount(res.data.total ?? list.length);
        setTotalPages(res.data.total_pages ?? Math.max(1, Math.ceil(list.length / pageSize)));

        // Extract unique categories from loaded list to populate category filter
        const uniqueCats = Array.from(
          new Set(list.map((it) => it.category).filter(Boolean))
        ).sort();
        if (uniqueCats.length > 0 && categories.length === 0) {
          setCategories(uniqueCats);
        }
      } else {
        setItems([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching insurance package items:", err);
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, pageSize, statusFilter, searchQuery, selectedCategory, categories.length]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Reset page when tab or filters change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    setSearchQuery("");
    setSelectedCategory("");
    setCategories([]);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // ── 3. Open Modal for Add ──────────────────────────────────────────────────
  const openAddModal = () => {
    setIsEditing(false);
    setEditingItemId(null);
    setFormData({
      ...initialFormData,
      scheme: activeTab,
      is_active: true,
    });
    setModalOpen(true);
  };

  // ── 4. Open Modal for Edit ─────────────────────────────────────────────────
  const openEditModal = (item) => {
    setIsEditing(true);
    setEditingItemId(item.id || item._id);

    // Copy all fields from item so that existing and custom fields are preserved
    const copiedData = {
      ...item,
      scheme: activeTab,
      name: item.name || "",
      nabh_code: item.nabh_code || "",
      category: item.category || "",
      department: item.department || "",
      nabh_rate: item.nabh_rate ?? 0,
      non_nabh_rate: item.non_nabh_rate ?? 0,
      is_active: item.is_active !== false,
      sl_no: item.sl_no ?? "",
    };
    setFormData(copiedData);
    setModalOpen(true);
  };

  // ── 5. Save Item (Create / Edit) ───────────────────────────────────────────
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Name is Required",
        text: "Please enter a procedure / package name.",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && editingItemId) {
        // PUT / PATCH
        const res = await apiRequest(
          `${BASE}insurance-packages/items/${editingItemId}/?scheme=${encodeURIComponent(formData.scheme)}`,
          "PUT",
          formData
        );
        if (res.success) {
          Swal.fire({
            icon: "success",
            title: "Updated Successfully",
            text: `Insurance package '${formData.name}' has been updated.`,
            timer: 1800,
            showConfirmButton: false,
          });
          setModalOpen(false);
          fetchItems();
          fetchSchemesOverview();
        } else {
          Swal.fire({
            icon: "error",
            title: "Update Failed",
            text: res.data?.error || "Could not update insurance package.",
          });
        }
      } else {
        // POST: Create
        const res = await apiRequest(`${BASE}insurance-packages/items/`, "POST", formData);
        if (res.success) {
          Swal.fire({
            icon: "success",
            title: "Package Added",
            text: `New package '${formData.name}' added to ${activeSchemeMeta?.name || "scheme"}.`,
            timer: 1800,
            showConfirmButton: false,
          });
          setModalOpen(false);
          fetchItems();
          fetchSchemesOverview();
        } else {
          Swal.fire({
            icon: "error",
            title: "Creation Failed",
            text: res.data?.error || "Could not create insurance package.",
          });
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while saving.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── 6. Soft Delete (is_active = false) ────────────────────────────────────
  const handleDelete = (item) => {
    const itemId = item.id || item._id;
    Swal.fire({
      title: "Delete Package?",
      html: `Are you sure you want to delete <b>"${item.name}"</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiRequest(
            `${BASE}insurance-packages/items/${itemId}/?scheme=${encodeURIComponent(activeTab)}`,
            "DELETE"
          );
          if (res.success) {
            Swal.fire({
              icon: "success",
              title: "Deleted Successfully",
              text: `Package "${item.name}" has been deleted.`,
              timer: 1800,
              showConfirmButton: false,
            });
            fetchItems();
            fetchSchemesOverview();
          } else {
            Swal.fire({
              icon: "error",
              title: "Failed",
              text: res.data?.error || "Could not delete insurance package.",
            });
          }
        } catch (err) {
          console.error("Delete error:", err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to communicate with server.",
          });
        }
      }
    });
  };

  // Active scheme metadata
  const activeSchemeMeta = useMemo(() => {
    return DEFAULT_SCHEMES.find((s) => s.id === activeTab) || DEFAULT_SCHEMES[0];
  }, [activeTab]);

  const currentCounts = schemeCounts[activeTab] || {
    total: totalCount,
    active: 0,
    inactive: 0,
  };

  return (
    <PageContainer>
      {/* ── Top Header Card ────────────────────────────────────────────── */}
      <HeaderCard>
        <HeaderLeft>
          <HeaderIconBox>
            <Shield size={24} />
          </HeaderIconBox>
          <div>
            <PageTitle>
              Insurance Packages Master
            </PageTitle>
            <PageSubtitle>
              Manage insurance scheme procedure packages, NABH codes, categories, and rates.
            </PageSubtitle>
          </div>
        </HeaderLeft>
        <HeaderActions>
          <SecondaryButton onClick={() => { fetchItems(); fetchSchemesOverview(); }} title="Refresh current list">
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            Refresh
          </SecondaryButton>
          <PrimaryButton onClick={openAddModal}>
            <Plus size={16} />
            Add New Package
          </PrimaryButton>
        </HeaderActions>
      </HeaderCard>

      {/* ── 7 Insurance Scheme Tabs ──────────────────────────────────────── */}
      <TabsContainer>
        {DEFAULT_SCHEMES.map((scheme) => {
          const isActive = activeTab === scheme.id;
          const countInfo = schemeCounts[scheme.id];
          const displayCount = countInfo ? countInfo.total : "…";

          return (
            <TabButton
              key={scheme.id}
              $active={isActive}
              onClick={() => handleTabChange(scheme.id)}
              title={scheme.fullName}
            >
              <Shield size={15} color={scheme.iconColor} />
              <span>{scheme.name}</span>
              <TabBadge $active={isActive}>
                {displayCount}
              </TabBadge>
            </TabButton>
          );
        })}
      </TabsContainer>

      {/* ── Selected Scheme Stats Cards ──────────────────────────────────── */}
      <StatsBar>
        <StatCard>
          <StatText>
            <StatLabel>Total Packages</StatLabel>
            <StatValue>{currentCounts.total || totalCount}</StatValue>
          </StatText>
          <StatIcon $bg="#f1f5f9" $color={THEME.slate}>
            <Layers size={18} />
          </StatIcon>
        </StatCard>

        <StatCard>
          <StatText>
            <StatLabel>Active Packages</StatLabel>
            <StatValue $color={THEME.successText}>
              {currentCounts.active || (currentCounts.total - (currentCounts.inactive || 0))}
            </StatValue>
          </StatText>
          <StatIcon $bg={THEME.successBg} $color={THEME.successText}>
            <CheckCircle2 size={18} />
          </StatIcon>
        </StatCard>

        <StatCard>
          <StatText>
            <StatLabel>Inactive Packages</StatLabel>
            <StatValue $color={THEME.dangerText}>{currentCounts.inactive || 0}</StatValue>
          </StatText>
          <StatIcon $bg={THEME.dangerBg} $color={THEME.dangerText}>
            <XCircle size={18} />
          </StatIcon>
        </StatCard>

        <StatCard>
          <StatText>
            <StatLabel>Selected Scheme</StatLabel>
            <span style={{ fontSize: "13.5px", fontWeight: "700", color: THEME.teal, marginTop: "4px" }}>
              {activeSchemeMeta.name}
            </span>
          </StatText>
          <StatIcon $bg={THEME.tealLight} $color={THEME.teal}>
            <FileText size={18} />
          </StatIcon>
        </StatCard>
      </StatsBar>

      {/* ── Controls & Filter Bar ────────────────────────────────────────── */}
      <ControlsCard>
        <SearchContainer>
          <SearchIconWrapper>
            <Search size={15} />
          </SearchIconWrapper>
          <SearchInput
            type="text"
            placeholder={`Search ${activeSchemeMeta.name} by name, NABH code, category...`}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </SearchContainer>

        <FilterGroup>
          {/* Status Filter: All / Active / Inactive */}
          <StatusPillGroup>
            <StatusPill
              $active={statusFilter === "all"}
              onClick={() => handleStatusFilterChange("all")}
            >
              All
            </StatusPill>
            <StatusPill
              $active={statusFilter === "active"}
              $type="active"
              onClick={() => handleStatusFilterChange("active")}
            >
              <CheckCircle2 size={13} />
              Active
            </StatusPill>
            <StatusPill
              $active={statusFilter === "inactive"}
              $type="inactive"
              onClick={() => handleStatusFilterChange("inactive")}
            >
              <XCircle size={13} />
              Inactive
            </StatusPill>
          </StatusPillGroup>

          {/* Category Filter */}
          {categories.length > 0 && (
            <SelectDropdown
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectDropdown>
          )}

          {/* Page size dropdown */}
          <SelectDropdown
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={250}>250 per page</option>
          </SelectDropdown>
        </FilterGroup>
      </ControlsCard>

      {/* ── Table View with TOP HORIZONTAL SCROLLBAR ──────────────────────── */}
      <TableWrapper>
        {/* Top Horizontal Scrollbar (syncs with table scroll) */}
        {hasHorizontalScroll && (
          <TopScrollContainer
            ref={topScrollRef}
            onScroll={handleTopScroll}
            title="Scroll horizontally"
          >
            <div style={{ width: `${tableScrollWidth}px`, height: "1px" }} />
          </TopScrollContainer>
        )}

        {/* Table Container (bottom scrollbar hidden, scrolls via top scrollbar, swipe or mouse) */}
        <ResponsiveTableContainer
          ref={tableScrollRef}
          onScroll={handleTableScroll}
        >
          <StyledTable>
            <thead>
              <tr>
                <th style={{ width: "60px", textAlign: "center" }}>#</th>
                <th style={{ minWidth: "260px" }}>Procedure / Package Name</th>
                <th style={{ minWidth: "110px" }}>NABH Code</th>
                <th style={{ minWidth: "140px" }}>Category</th>
                <th style={{ minWidth: "130px" }}>Department</th>
                <th style={{ minWidth: "120px", textAlign: "right" }}>NABH Rate (₹)</th>
                <th style={{ minWidth: "130px", textAlign: "right" }}>Non-NABH (₹)</th>
                <th style={{ minWidth: "100px", textAlign: "center" }}>Status</th>
                <th style={{ width: "90px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "40px" }}>
                    <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", color: THEME.teal }} />
                    <p style={{ marginTop: "10px", color: THEME.textMuted, fontSize: "13px" }}>
                      Loading packages for {activeSchemeMeta.name}...
                    </p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState>
                      <AlertCircle size={36} color="#94a3b8" />
                      <p>
                        No insurance packages found matching your criteria.
                      </p>
                      <PrimaryButton style={{ marginTop: "14px" }} onClick={openAddModal}>
                        <Plus size={14} /> Add First Package
                      </PrimaryButton>
                    </EmptyState>
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => {
                  const isActive = it.is_active !== false;
                  const rowNumber = (currentPage - 1) * pageSize + idx + 1;

                  return (
                    <tr key={it.id || it._id || idx} className={isActive ? "" : "inactive-row"}>
                      <td style={{ textAlign: "center", color: THEME.textMuted, fontWeight: "500" }}>
                        {it.sl_no || rowNumber}
                      </td>
                      <td>
                        <div style={{ fontWeight: "600", color: isActive ? THEME.slate : THEME.textMuted }}>
                          {it.name || "—"}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: "600",
                            padding: "2px 6px",
                            background: "#f1f5f9",
                            borderRadius: "4px",
                            fontSize: "12px",
                            color: THEME.slate,
                          }}
                        >
                          {it.nabh_code || "—"}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: THEME.slate }}>{it.category || "—"}</span>
                      </td>
                      <td>
                        <span style={{ color: THEME.textMuted }}>{it.department || "—"}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <RateBadge>
                          ₹{Number(it.nabh_rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </RateBadge>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <RateBadge style={{ color: "#475569" }}>
                          ₹{Number(it.non_nabh_rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </RateBadge>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <StatusBadge $active={isActive}>
                          {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {isActive ? "Active" : "Inactive"}
                        </StatusBadge>
                      </td>
                      <td>
                        <ActionButtonsContainer>
                          {/* ONLY Edit and Delete Icons */}
                          <IconButton
                            $hoverBg={THEME.blueBg}
                            $hoverColor={THEME.blueText}
                            onClick={() => openEditModal(it)}
                            title="Edit package details"
                          >
                            <Edit2 size={15} />
                          </IconButton>

                          <IconButton
                            $hoverBg={THEME.dangerBg}
                            $hoverColor={THEME.dangerText}
                            onClick={() => handleDelete(it)}
                            title="Delete package"
                          >
                            <Trash2 size={15} />
                          </IconButton>
                        </ActionButtonsContainer>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </StyledTable>
        </ResponsiveTableContainer>

        {/* ── Pagination Footer ────────────────────────────────────────── */}
        {totalCount > 0 && (
          <PaginationBar>
            <PaginationInfo>
              Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to{" "}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} packages in {activeSchemeMeta.name}
            </PaginationInfo>

            <PageButtonsGroup>
              <PageButton
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || loading}
                title="First Page"
              >
                «
              </PageButton>
              <PageButton
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                title="Previous Page"
              >
                ‹
              </PageButton>

              <span style={{ fontSize: "12px", padding: "0 8px", color: THEME.textMuted }}>
                Page <b>{currentPage}</b> of <b>{totalPages}</b>
              </span>

              <PageButton
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
                title="Next Page"
              >
                ›
              </PageButton>
              <PageButton
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages || loading}
                title="Last Page"
              >
                »
              </PageButton>
            </PageButtonsGroup>
          </PaginationBar>
        )}
      </TableWrapper>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      {modalOpen && (
        <ModalBackdrop onClick={() => !submitting && setModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <Shield size={18} color={THEME.teal} />
                {isEditing ? "Edit Insurance Package" : "Add New Insurance Package"}
              </ModalTitle>
              <IconButton onClick={() => !submitting && setModalOpen(false)}>
                <X size={18} />
              </IconButton>
            </ModalHeader>

            <form onSubmit={handleFormSubmit}>
              <ModalBody>
                {/* Scheme Selector */}
                <FormGroup>
                  <Label>
                    Target Insurance Scheme <span className="req">*</span>
                  </Label>
                  <SelectDropdown
                    style={{ width: "100%", padding: "9px" }}
                    value={formData.scheme}
                    disabled={isEditing}
                    onChange={(e) => setFormData({ ...formData, scheme: e.target.value })}
                  >
                    {DEFAULT_SCHEMES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.fullName}
                      </option>
                    ))}
                  </SelectDropdown>
                </FormGroup>

                {/* Procedure / Package Name */}
                <FormGroup>
                  <Label>
                    Procedure / Package Name <span className="req">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Tracheostomy, Appendectomy, Consultation..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormGroup>

                {/* NABH Code & Serial Number */}
                <Row2>
                  <FormGroup>
                    <Label>NABH / Procedure Code</Label>
                    <Input
                      type="text"
                      placeholder="e.g. EP092, CN001"
                      value={formData.nabh_code}
                      onChange={(e) => setFormData({ ...formData, nabh_code: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Sl. No (Order)</Label>
                    <Input
                      type="number"
                      placeholder="Auto-assigned if empty"
                      value={formData.sl_no}
                      onChange={(e) => setFormData({ ...formData, sl_no: e.target.value })}
                    />
                  </FormGroup>
                </Row2>

                {/* Category & Department */}
                <Row2>
                  <FormGroup>
                    <Label>Category</Label>
                    <Input
                      type="text"
                      placeholder="e.g. ENT Procedure, General Surgery"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Department</Label>
                    <Input
                      type="text"
                      placeholder="e.g. ENT Procedure, Surgery, OPD"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </FormGroup>
                </Row2>

                {/* Rates: NABH & Non-NABH */}
                <Row2>
                  <FormGroup>
                    <Label>NABH Rate (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.nabh_rate}
                      onChange={(e) => setFormData({ ...formData, nabh_rate: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Non-NABH Rate (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.non_nabh_rate}
                      onChange={(e) => setFormData({ ...formData, non_nabh_rate: e.target.value })}
                    />
                  </FormGroup>
                </Row2>

                {/* Active Status Checkbox */}
                <FormGroup style={{ marginTop: "10px" }}>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <div>
                      <div style={{ fontWeight: "600", color: THEME.slate }}>
                        Active Status
                      </div>
                      <div style={{ fontSize: "12px", color: THEME.textMuted }}>
                        Package is active (is_active: {formData.is_active ? "true" : "false"})
                      </div>
                    </div>
                  </CheckboxLabel>
                </FormGroup>
              </ModalBody>

              <ModalFooter>
                <SecondaryButton
                  type="button"
                  disabled={submitting}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      {isEditing ? "Save Changes" : "Create Package"}
                    </>
                  )}
                </PrimaryButton>
              </ModalFooter>
            </form>
          </ModalContent>
        </ModalBackdrop>
      )}
    </PageContainer>
  );
};

export default InsurancePackages;
