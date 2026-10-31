import React, { useState, useEffect, useRef } from "react";
import apiRequest from "../../Auth/apiRequest";
import styled from "styled-components";
import {
  colors,
  PageWrapper,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  Input,
  Select,
  Label,
  InputWrapper,
  Button
} from "../GlobalStyles";

// ─── Styled Components ────────────────────────────────────────────────────────

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: ${colors.primaryDark};
  color: white;
  border-radius: 8px 8px 0 0;
  margin: -10px -10px 20px -10px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const SecondaryButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const PatientPanel = styled.div`
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px 16px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4px;
    background: #0d8a7a;
  }

  .patient-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .patient-divider {
    width: 1px;
    height: 30px;
    background: #e2e8f0;
    flex-shrink: 0;
  }

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 8px 12px;

    .patient-divider {
      display: none;
    }
  }
`;

const PatientAvatar = styled.div`
  width: 34px;
  height: 34px;
  background: #e6f9f3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0d8a7a;
  font-size: 0.9rem;
  font-weight: 800;
  flex-shrink: 0;
`;

const PatientIdentity = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;

  h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.2px;
    line-height: 1.2;
    white-space: nowrap;
  }

  .sub-text {
    font-size: 0.72rem;
    color: #0d8a7a;
    font-weight: 600;
    white-space: nowrap;
  }
`;

const PatientGrid = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 900px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px 10px;
  }
`;

const FieldBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`;

const FieldLabel = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const FieldValue = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
`;

const StatusBadge = styled.span`
  display: inline-block;
  background: ${({ status }) =>
    status === "Cancelled"
      ? colors.danger + "20"
      : status === "Result Pending"
        ? colors.secondary + "15"
        : "#136A6315"};
  color: ${({ status }) =>
    status === "Cancelled"
      ? colors.danger
      : status === "Result Pending"
        ? colors.secondary
        : "#136A63"};
  border: 1px solid currentColor;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
`;

const SubTable = styled(Table)`
  font-size: 0.82rem;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  overflow: hidden;

  th {
    background: ${colors.background};
    padding: 10px 14px;
    color: ${colors.textMuted};
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.5px;
  }

  td {
    padding: 10px 14px;
  }
`;

const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  background: white;
  padding: 8px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;

  .history-count {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 500;
  }
`;

const ViewHistoryBtn = styled.button`
  background: #0d8a7a;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 7px 18px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #0f766e;
  }
`;

// ─── Expand: History Details (SubTable) ───────────────────────────────────────

const ExpandedRow = styled.tr``;

const ExpandedCell = styled.td`
  padding: 0;
  background: #f9fbfc;
  border-bottom: 2px solid ${colors.primary};
`;

const SubTableWrapper = styled.div`
  padding: 15px 25px 20px 65px;
`;

// ─── Form Components (Sidebar Pattern) ────────────────────────────────────────

const RequestFormWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
  border: none;
  background: transparent;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const FormPanel = styled.div`
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 14px;
`;

const FormLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
  display: block;
`;


const FormInput = styled.input`
  width: 100%;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 0.88rem;
  background: ${props => props.disabled ? "#f8fafc" : "white"};
  color: #0f172a;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: #0d8a7a;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const HelperBanner = styled.div`
  margin-top: 14px;
  padding: 10px 14px;
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fef3c7;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SidePanel = styled.div`
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SidePanelHeader = styled.div`
  background: white;
  padding: 12px 18px;
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f172a;
  border-bottom: 1.5px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SidePanelContent = styled.div`
  flex: 1;
  padding: 12px 18px;
  min-height: 120px;
  max-height: 180px;
  overflow-y: auto;
`;

const SidePanelFooter = styled.div`
  padding: 14px 18px;
  border-top: 1.5px solid #f1f5f9;
  background: white;

  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .label {
      font-size: 0.9rem;
      font-weight: 800;
      color: #0f172a;
    }

    .amount {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0d8a7a;
    }
  }
`;

const SelectedItem = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0 4px;
  display: flex;
  align-items: center;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.7;
  }
`;

const SaveBtn = styled.button`
  background: #73bba3;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: background 0.15s;

  &:hover {
    background: #5fa890;
  }
`;

const CancelBtn = styled.button`
  background: #627282;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 9px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 8px;
  transition: background 0.15s;

  &:hover {
    background: #4f5e6e;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownList = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1.5px solid #0d8a7a;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  max-height: 280px;
  overflow-y: auto;
  z-index: 1000;
  margin: 0;
  padding: 4px 0;
  list-style: none;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const DropdownItem = styled.li`
  padding: 8px 12px;
  font-size: 0.84rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  transition: all 0.15s ease;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: #f0fdfa;
    color: #0d8a7a;
  }
`;

// ─── Searchable Dropdown Helper ───────────────────────────────────────────────

const SearchableDropdown = ({ value, onChange, options, placeholder = "Select...", displayKey = "name", valueKey = "id", disabled = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsTyping(false);
        setHighlightedIndex(-1);
        if (value) {
          const selected = options.find(opt => (typeof opt === 'string' ? opt === value : String(opt[valueKey]) === String(value)));
          if (selected) setSearchTerm(typeof selected === 'string' ? selected : selected[displayKey]);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, options, displayKey, valueKey]);

  useEffect(() => {
    if (value) {
      const selected = options.find(opt => (typeof opt === 'string' ? opt === value : String(opt[valueKey]) === String(value)));
      if (selected) setSearchTerm(typeof selected === 'string' ? selected : selected[displayKey]);
    } else {
      setSearchTerm("");
    }
  }, [value, options, displayKey, valueKey]);

  const filtered = isTyping && searchTerm.trim() !== ""
    ? options.filter(opt => {
      const q = searchTerm.toLowerCase();
      if (typeof opt === 'string') return opt.toLowerCase().includes(q);
      const name = (opt[displayKey] || "").toLowerCase();
      const badge = (opt.badge || "").toLowerCase();
      return name.includes(q) || badge.includes(q);
    })
    : options;

  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const itemEl = listRef.current.children[highlightedIndex];
      if (itemEl && typeof itemEl.scrollIntoView === "function") {
        itemEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <SearchWrapper ref={wrapperRef}>
      <div style={{ position: "relative" }}>
        <FormInput
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsTyping(true);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onClick={() => {
            if (!disabled) {
              setIsOpen(prev => !prev);
              setIsTyping(false);
              setHighlightedIndex(-1);
            }
          }}
          onBlur={(e) => {
            if (!wrapperRef.current || !wrapperRef.current.contains(e.relatedTarget)) {
              setIsOpen(false);
              setIsTyping(false);
              setHighlightedIndex(-1);
              if (value) {
                const selected = options.find(opt => (typeof opt === 'string' ? opt === value : String(opt[valueKey]) === String(value)));
                if (selected) setSearchTerm(typeof selected === 'string' ? selected : selected[displayKey]);
              }
            }
          }}
          onKeyDown={(e) => {
            if (!isOpen) {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                setIsOpen(true);
                setIsTyping(false);
                setHighlightedIndex(0);
                return;
              }
            }

            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (filtered.length === 0) return;
              setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              if (filtered.length === 0) return;
              setHighlightedIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1));
            } else if (e.key === "Enter") {
              if (isOpen && filtered.length > 0) {
                e.preventDefault();
                const opt = (highlightedIndex >= 0 && highlightedIndex < filtered.length)
                  ? filtered[highlightedIndex]
                  : filtered[0];
                const val = typeof opt === 'string' ? opt : opt[valueKey];
                const txt = typeof opt === 'string' ? opt : opt[displayKey];
                onChange(val);
                setSearchTerm(txt);
                setIsTyping(false);
                setIsOpen(false);
                setHighlightedIndex(-1);
              }
            } else if (e.key === "Escape") {
              setIsOpen(false);
              setIsTyping(false);
              setHighlightedIndex(-1);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          style={{ paddingRight: "30px", cursor: disabled ? "not-allowed" : "pointer" }}
        />
        <span
          onClick={() => {
            if (!disabled) {
              setIsOpen(prev => !prev);
              setIsTyping(false);
              setHighlightedIndex(-1);
            }
          }}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: disabled ? "default" : "pointer",
            color: "#64748b",
            fontSize: "10px"
          }}
        >
          ▼
        </span>
      </div>
      {isOpen && (
        <DropdownList ref={listRef}>
          {filtered.length > 0 ? (
            filtered.map((opt, idx) => {
              const isSelected = typeof opt === 'string' ? opt === value : String(opt[valueKey]) === String(value);
              const isHighlighted = idx === highlightedIndex;
              const txt = typeof opt === 'string' ? opt : opt[displayKey];
              const badge = typeof opt === 'object' ? opt.badge : null;
              return (
                <DropdownItem
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const val = typeof opt === 'string' ? opt : opt[valueKey];
                    onChange(val);
                    setSearchTerm(txt);
                    setIsTyping(false);
                    setIsOpen(false);
                    setHighlightedIndex(-1);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  style={{
                    background: isHighlighted ? "#e6f9f3" : (isSelected ? "#f0fdf4" : "transparent"),
                    color: isHighlighted || isSelected ? "#0d8a7a" : "#1e293b",
                    outline: isHighlighted ? "1px solid #0d8a7a" : "none",
                  }}
                >
                  <span style={{ fontWeight: isHighlighted || isSelected ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {txt}
                  </span>
                  {badge && (
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "10px",
                        background: isHighlighted || isSelected ? "#dcfce7" : "#e2e8f0",
                        color: isHighlighted || isSelected ? "#15803d" : "#475569",
                        whiteSpace: "nowrap",
                        flexShrink: 0
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </DropdownItem>
              );
            })
          ) : (
            <DropdownItem style={{ color: "#9ca3af", cursor: "default", justifyContent: "center" }}>
              No matching options
            </DropdownItem>
          )}
        </DropdownList>
      )}
    </SearchWrapper>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RadiologyWardRequest({ patient, onClose }) {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requests, setRequests] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [billTypes, setBillTypes] = useState([]);
  const [investigationItems, setInvestigationItems] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  // Form states
  const [doctor, setDoctor] = useState("");
  const [selectedBillType, setSelectedBillType] = useState("");
  const [testSearch, setTestSearch] = useState("");
  const [packageSearch, setPackageSearch] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [showUpTo, setShowUpTo] = useState(10);

  const [highlightedTestIndex, setHighlightedTestIndex] = useState(-1);
  const [highlightedPackageIndex, setHighlightedPackageIndex] = useState(-1);
  const radTestListRef = useRef(null);
  const radPackageListRef = useRef(null);

  const testDropdownRef = useRef(null);
  const packageDropdownRef = useRef(null);

  useEffect(() => {
    if (showItemDropdown && radTestListRef.current && highlightedTestIndex >= 0) {
      const el = radTestListRef.current.children[highlightedTestIndex];
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedTestIndex, showItemDropdown]);

  useEffect(() => {
    if (showPackageDropdown && radPackageListRef.current && highlightedPackageIndex >= 0) {
      const el = radPackageListRef.current.children[highlightedPackageIndex];
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedPackageIndex, showPackageDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (testDropdownRef.current && !testDropdownRef.current.contains(event.target)) {
        setShowItemDropdown(false);
        setHighlightedTestIndex(-1);
      }
      if (packageDropdownRef.current && !packageDropdownRef.current.contains(event.target)) {
        setShowPackageDropdown(false);
        setHighlightedPackageIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatAdmitDate = (dt) => {
    if (!dt) return "-";
    try {
      const d = new Date(dt);
      if (isNaN(d.getTime())) return dt;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strHours = String(hours).padStart(2, "0");
      return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
    } catch (e) {
      return dt;
    }
  };

  const pd = patient?.patient_details || {};
  const resolvedPatient = {
    ipNo: patient?.ipNumber || patient?.ip_number || patient?.ipNo || pd.ipNumber || "-",
    uhid: patient?.uhid || patient?.patient_id || pd.uhid || "-",
    name: patient?.patient_name || patient?.patientName || [patient?.salutation ?? pd.salutation, patient?.firstName ?? pd.firstName, patient?.lastName ?? pd.lastName].filter(Boolean).join(" ") || "Unknown Patient",
    address: patient?.address || pd.permanent_address || "-",
    admitting: formatAdmitDate(patient?.admissionDateTime || pd?.admissionDateTime),
    admittingDr: patient?.admittingDoctor || patient?.doctor_name || patient?.doctorName || pd?.admittingDoctor || "-",
    roomBed: `${patient?.roomNo || patient?.room_no || "-"} | ${patient?.bedNo || patient?.bed_no || "-"}`,
    customerType: patient?.customerType || patient?.customer_type || pd.customer_type || "-",
    wardName: patient?.wardName || patient?.ward_name || "-",
  };

  useEffect(() => {
    const doc = patient?.admittingDoctor || patient?.doctor_name || patient?.doctorName;
    if (doc) {
      setDoctor(doc);
    }
  }, [patient]);

  useEffect(() => {
    fetchBillTypes();
    fetchDoctors();
    fetchRequests();
  }, []);

  const fetchBillTypes = async () => {
    try {
      const outletMap = {
        OLET001: "IP PHARMACY",
        OLET002: "OP PHARMACY",
        OLET003: "MAIN BLOCK",
        OLET004: "CANCER BLOCK",
        OLET005: "VELAVAN",
      };
      const res = await apiRequest(`${HmsBaseUrl}bill-types/?ignore_outlet=true`, "GET");
      if (res.success) {
        const list = res.data?.billTypes || [];
        const enriched = list.map((b) => {
          const oc = b.outlet_code || "";
          const on = outletMap[oc] || (oc ? oc : "General");
          return {
            ...b,
            outlet_name: on,
            outlet_badge: oc ? `${on} • ${oc}` : "General",
          };
        });
        const radCodes = ["CT01", "MRI01", "USG01", "XRAY01", "PET01"];
        const isRad = (b) => {
          const no = (b.billTypeNo || "").toUpperCase();
          const name = (b.bill_name || "").toUpperCase();
          return (
            radCodes.includes(no) ||
            name.includes("SCAN") ||
            name.includes("X-RAY") ||
            name.includes("X - RAY") ||
            name.includes("MRI") ||
            name.includes("CT ") ||
            name.includes("USG")
          );
        };
        const radList = enriched.filter(isRad).sort((a, b) => (a.bill_name || "").localeCompare(b.bill_name || ""));
        const otherList = enriched.filter((b) => !isRad(b)).sort((a, b) => {
          const outCmp = (a.outlet_name || "").localeCompare(b.outlet_name || "");
          if (outCmp !== 0) return outCmp;
          return (a.bill_name || "").localeCompare(b.bill_name || "");
        });
        const allBillTypes = [...radList, ...otherList];
        setBillTypes(allBillTypes);
      }
    } catch (e) { console.error(e); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
      if (res.success) {
        // InvestigationBilling uses a flat array or data.data
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setDoctors(list);
      }
    } catch (e) { console.error("Error fetching doctors:", e); }
  };

  const fetchRequests = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_radiology_ward_requests/?uhid=${resolvedPatient.uhid}&ipNumber=${resolvedPatient.ipNo}`, "GET");
      if (res.success) setRequests(res.data?.data || []);
    } catch (e) { console.error(e); }
  };

  const handleBillTypeChange = async (val) => {
    setSelectedBillType(val);
    setSelectedTests([]);
    setTestSearch("");
    setPackageSearch("");

    if (val === "PACK") {
      const res = await apiRequest(`${HmsBaseUrl}packages_crud/`, "GET");
      const list = res.success && Array.isArray(res.data) ? res.data : [];
      const radPkgs = list.filter(p =>
        p.is_active !== false &&
        (p.outlet_code === "OLET004" || (p.items || []).some(it => it.billTypeNo !== "LAB01"))
      );
      setPackages(radPkgs);
      setInvestigationItems([]);
    } else {
      const selectedBT = billTypes.find(bt => String(bt.bill_type) === String(val));
      const bTypeNo = selectedBT?.billTypeNo || "";
      const bType = selectedBT?.bill_type || "";
      const res = await apiRequest(`${HmsBaseUrl}investigation-items/?billTypeNo=${bTypeNo}&billType=${bType}`, "GET");
      if (res.success) setInvestigationItems(res.data?.items || []);
      setPackages([]);
    }
  };

  const addTestToList = (item) => {
    if (!item) return;
    if (selectedTests.find(t => (item.item_id && t.item_id === item.item_id) || (item.test_id && t.test_id === item.test_id) || t.itemName === item.itemName)) return;
    setSelectedTests(prev => [...prev, { ...item, type: "individual" }]);
  };

  const addPackageToList = async (pkg) => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}package-items/?packageNo=${pkg.packageNo}`, "GET");
      if (res.success) {
        const pkgItems = (res.data?.items || []).map(i => ({ ...i, type: "package", packageName: pkg.packageName }));
        const newTests = [...selectedTests];
        pkgItems.forEach(item => {
          if (!newTests.find(t => (item.item_id && t.item_id === item.item_id) || (item.test_id && t.test_id === item.test_id) || t.itemName === item.itemName)) {
            newTests.push(item);
          }
        });
        setSelectedTests(newTests);
      }
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    if (!doctor || selectedTests.length === 0) {
      alert("Please select doctor and at least one test");
      return;
    }
    const selectedBT = billTypes.find(bt => String(bt.bill_type) === String(selectedBillType));
    const payload = {
      uhid: resolvedPatient.uhid,
      ipNumber: resolvedPatient.ipNo,
      patientName: resolvedPatient.name,
      doctor: doctor,
      billtype: selectedBT?.bill_type,
      billTypeNo: selectedBT?.billTypeNo,
      billTypeName: selectedBT?.bill_name,
      selectedTests: selectedTests.map(t => ({
        itemName: t.itemName,
        price: t.price,
        item_id: t.item_id,
        // billTypeNo: billTypeNo,
        billtype: selectedBT?.bill_type,
        packageName: t.packageName || null,
        type: t.type || "individual"
      })),
      wardName: resolvedPatient.wardName,
      total_amount: selectedTests.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0)
    };

    try {
      const res = await apiRequest(`${HmsBaseUrl}save_radiology_ward_request/`, "POST", payload);
      if (res.success) {
        alert("Radiology request saved successfully");
        setShowRequestForm(false);
        setSelectedTests([]);
        fetchRequests();
      }
    } catch (e) { console.error(e); }
  };

  const handleCancelRequest = async (billId) => {
    if (!window.confirm("Are you sure you want to cancel this entire request?")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}cancel_radiology_ward_request/`, "POST", { id: billId });
      if (res.success) {
        alert("Request cancelled successfully");
        fetchRequests();
      }
    } catch (e) { console.error(e); }
  };

  const handleRemoveIndividualTest = async (billId, test) => {
    if (!window.confirm(`Are you sure you want to remove ${test.name}?`)) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}remove_individual_radiology/`, "POST", {
        id: billId,
        test_id: test.test_id
      });
      if (res.success) {
        alert("Test removed from request");
        fetchRequests();
      }
    } catch (e) { console.error(e); }
  };

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  const filteredRequests = requests.filter(req =>
    req.wardName.toLowerCase().includes(search.toLowerCase()) ||
    req.doctorName.toLowerCase().includes(search.toLowerCase()) ||
    req.billNo.toLowerCase().includes(search.toLowerCase())
  ).slice(0, showUpTo);

  return (
    <div style={{ padding: "0", background: "transparent" }}>
      <PatientPanel>
        <div className="patient-left">
          <PatientAvatar>
            {resolvedPatient.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
          </PatientAvatar>
          <PatientIdentity>
            <h3>{resolvedPatient.name}</h3>
            <div className="sub-text">
              UHID: {resolvedPatient.uhid} · IP: {resolvedPatient.ipNo}
            </div>
          </PatientIdentity>
        </div>
        <div className="patient-divider" />
        <PatientGrid>
          <FieldBox>
            <FieldLabel>Admitting Dr</FieldLabel>
            <FieldValue title={resolvedPatient.admittingDr}>{resolvedPatient.admittingDr}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Room | Bed</FieldLabel>
            <FieldValue>{resolvedPatient.roomBed}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Customer Type</FieldLabel>
            <FieldValue>{resolvedPatient.customerType}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Admitting Date</FieldLabel>
            <FieldValue>{resolvedPatient.admitting}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Address</FieldLabel>
            <FieldValue title={resolvedPatient.address}>{resolvedPatient.address}</FieldValue>
          </FieldBox>
        </PatientGrid>
      </PatientPanel>

      <ActionsBar>
        <span className="history-count">{requests.length} previous radiology request(s)</span>
        <ViewHistoryBtn onClick={() => { setShowRequestForm(!showRequestForm); if (!showRequestForm) setExpandedRow(null); }}>
          {showRequestForm ? "View History" : "+ New Other Request"}
        </ViewHistoryBtn>
      </ActionsBar>

      {showRequestForm ? (
        <RequestFormWrapper>
          <FormPanel>
            <FormRow>
              <div>
                <FormLabel>Bill Type</FormLabel>
                <SearchableDropdown
                  value={selectedBillType}
                  onChange={(val) => handleBillTypeChange(val)}
                  options={[
                    { id: "PACK", name: "Packages", badge: "Package" },
                    ...billTypes.map((o) => ({ id: o.bill_type, name: o.bill_name, badge: o.outlet_badge }))
                  ]}
                  placeholder="Select Bill Type"
                  displayKey="name"
                  valueKey="id"
                />
              </div>
              <div>
                <FormLabel>Doctor</FormLabel>
                <SearchableDropdown
                  value={doctor}
                  onChange={setDoctor}
                  options={doctors.map(d => ({ id: d.employeeName, name: d.employeeName }))}
                  displayKey="name"
                  valueKey="id"
                  placeholder="Select Doctor"
                />
              </div>
            </FormRow>

            <FormRow style={{ gridTemplateColumns: "1fr" }}>
              <div style={{ marginTop: 2 }}>
                <FormLabel>Search Item (Investigations / Packages)</FormLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <SearchWrapper ref={testDropdownRef}>
                    <FormInput
                      placeholder="Investigations (CT, MRI...) [use ↑/↓ to navigate]"
                      value={testSearch}
                      onChange={(e) => {
                        setTestSearch(e.target.value);
                        setShowItemDropdown(true);
                        setHighlightedTestIndex(0);
                      }}
                      onFocus={() => {
                        setShowItemDropdown(true);
                        setHighlightedTestIndex(0);
                      }}
                      onKeyDown={(e) => {
                        const list = Array.isArray(investigationItems) ? investigationItems.filter(i => i.itemName.toLowerCase().includes(testSearch.toLowerCase())) : [];
                        if (!showItemDropdown) {
                          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                            e.preventDefault();
                            setShowItemDropdown(true);
                            setHighlightedTestIndex(0);
                            return;
                          }
                        }
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          if (list.length > 0) setHighlightedTestIndex(prev => prev < list.length - 1 ? prev + 1 : 0);
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          if (list.length > 0) setHighlightedTestIndex(prev => prev <= 0 ? list.length - 1 : prev - 1);
                        } else if (e.key === "Enter") {
                          if (showItemDropdown && list.length > 0) {
                            e.preventDefault();
                            const target = highlightedTestIndex >= 0 && list[highlightedTestIndex] ? list[highlightedTestIndex] : list[0];
                            addTestToList(target);
                            setShowItemDropdown(false);
                            setHighlightedTestIndex(-1);
                          }
                        } else if (e.key === "Escape") {
                          setShowItemDropdown(false);
                          setHighlightedTestIndex(-1);
                        }
                      }}
                      disabled={!selectedBillType || selectedBillType === "PACK"}
                    />
                    {showItemDropdown && (
                      <DropdownList ref={radTestListRef}>
                        {Array.isArray(investigationItems) && investigationItems.filter(i => i.itemName.toLowerCase().includes(testSearch.toLowerCase())).map((item, idx) => {
                          const isHighlighted = idx === highlightedTestIndex;
                          return (
                            <DropdownItem
                              key={idx}
                              onClick={() => {
                                addTestToList(item);
                                setShowItemDropdown(false);
                                setHighlightedTestIndex(-1);
                              }}
                              onMouseEnter={() => setHighlightedTestIndex(idx)}
                              style={{
                                background: isHighlighted ? "#e6f9f3" : "transparent",
                                color: isHighlighted ? "#0d8a7a" : "inherit",
                                outline: isHighlighted ? "1px solid #0d8a7a" : "none",
                              }}
                            >
                              {item.itemName} - <span style={{ color: colors.primary, fontWeight: 700 }}>₹{item.price}</span>
                            </DropdownItem>
                          );
                        })}
                      </DropdownList>
                    )}
                  </SearchWrapper>

                  <SearchWrapper ref={packageDropdownRef}>
                    <FormInput
                      placeholder="Health Packages... [use ↑/↓ to navigate]"
                      value={packageSearch}
                      onChange={(e) => {
                        setPackageSearch(e.target.value);
                        setShowPackageDropdown(true);
                        setHighlightedPackageIndex(0);
                      }}
                      onFocus={() => {
                        setShowPackageDropdown(true);
                        setHighlightedPackageIndex(0);
                      }}
                      onKeyDown={(e) => {
                        const list = Array.isArray(packages) ? packages.filter(p => p.packageName.toLowerCase().includes(packageSearch.toLowerCase())) : [];
                        if (!showPackageDropdown) {
                          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                            e.preventDefault();
                            setShowPackageDropdown(true);
                            setHighlightedPackageIndex(0);
                            return;
                          }
                        }
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          if (list.length > 0) setHighlightedPackageIndex(prev => prev < list.length - 1 ? prev + 1 : 0);
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          if (list.length > 0) setHighlightedPackageIndex(prev => prev <= 0 ? list.length - 1 : prev - 1);
                        } else if (e.key === "Enter") {
                          if (showPackageDropdown && list.length > 0) {
                            e.preventDefault();
                            const target = highlightedPackageIndex >= 0 && list[highlightedPackageIndex] ? list[highlightedPackageIndex] : list[0];
                            addPackageToList(target);
                            setShowPackageDropdown(false);
                            setHighlightedPackageIndex(-1);
                          }
                        } else if (e.key === "Escape") {
                          setShowPackageDropdown(false);
                          setHighlightedPackageIndex(-1);
                        }
                      }}
                      disabled={selectedBillType !== "PACK"}
                    />
                    {showPackageDropdown && (
                      <DropdownList ref={radPackageListRef}>
                        {Array.isArray(packages) && packages.filter(p => p.packageName.toLowerCase().includes(packageSearch.toLowerCase())).map((pkg, idx) => {
                          const isHighlighted = idx === highlightedPackageIndex;
                          return (
                            <DropdownItem
                              key={idx}
                              onClick={() => {
                                addPackageToList(pkg);
                                setShowPackageDropdown(false);
                                setHighlightedPackageIndex(-1);
                              }}
                              onMouseEnter={() => setHighlightedPackageIndex(idx)}
                              style={{
                                background: isHighlighted ? "#e6f9f3" : "transparent",
                                color: isHighlighted ? "#0d8a7a" : "inherit",
                                outline: isHighlighted ? "1px solid #0d8a7a" : "none",
                              }}
                            >
                              {pkg.packageName}
                            </DropdownItem>
                          );
                        })}
                      </DropdownList>
                    )}
                  </SearchWrapper>
                </div>
              </div>
            </FormRow>
            {!selectedBillType && (
              <HelperBanner>
                Select a Bill Type to begin searching for investigations or packages.
              </HelperBanner>
            )}
          </FormPanel>

          <SidePanel>
            <SidePanelHeader>
              <span>Selected Items</span>
              <span>Cost</span>
            </SidePanelHeader>
            <SidePanelContent>
              {selectedTests.length === 0 ? (
                <div style={{ padding: "36px 12px", textAlign: "center", color: "#64748b", fontSize: "0.88rem" }}>
                  No items selected
                </div>
              ) : (
                selectedTests.map((t, idx) => (
                  <SelectedItem key={idx}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>{t.itemName}</span>
                      {t.type === "package" && <small style={{ color: "#0d8a7a", fontWeight: "600" }}>Pkg: {t.packageName}</small>}
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0d8a7a" }}>₹{parseFloat(t.price).toFixed(2)}</span>
                    <RemoveBtn onClick={() => setSelectedTests(selectedTests.filter((_, i) => i !== idx))}>✕</RemoveBtn>
                  </SelectedItem>
                ))
              )}
            </SidePanelContent>
            <SidePanelFooter>
              <div className="total-row">
                <span className="label">Total Amount:</span>
                <span className="amount">
                  ₹{selectedTests.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0).toFixed(2)}
                </span>
              </div>
              <SaveBtn onClick={handleSave}>Save Request</SaveBtn>
              <CancelBtn onClick={() => setShowRequestForm(false)}>✕ Cancel</CancelBtn>
            </SidePanelFooter>
          </SidePanel>
        </RequestFormWrapper>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: colors.textMain }}>
              Show up to
              <Select value={showUpTo} onChange={(e) => setShowUpTo(Number(e.target.value))} style={{ width: "70px", padding: "4px 8px" }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </Select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
              <Input
                placeholder="Search history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "200px", padding: "6px 12px" }}
              />
            </div>
          </div>

          <TableWrapper>
            <Table>
              <thead>
                <Tr>
                  <Th>Status</Th>
                  <Th>Date & Time</Th>
                  <Th>User</Th>
                  <Th>Bill No</Th>
                  <Th>Bill Type</Th>
                  <Th>Ward</Th>
                  <Th>Doctor</Th>
                  <Th style={{ width: "60px" }} />
                </Tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <Tr><Td colSpan="9" style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>No investigation history available</Td></Tr>
                ) : (
                  Array.isArray(filteredRequests) && filteredRequests.map((req) => (
                    <React.Fragment key={req.id}>
                      <Tr>
                        <Td><StatusBadge status={req.status}>{req.status}</StatusBadge></Td>
                        <Td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 500 }}>{req.reqDate}</span>
                            <small style={{ color: colors.textMuted }}>{req.reqTime}</small>
                          </div>
                        </Td>
                        <Td>{req.userName}</Td>
                        <Td><strong>{req.billNo}</strong></Td>
                        <Td>{req.billTypeName || '-'}</Td>
                        <Td>{req.wardName}</Td>
                        <Td
                          style={{ cursor: "pointer", color: colors.primary, fontWeight: 600 }}
                          onClick={() => toggleRow(req.id)}
                        >
                          {req.doctorName}
                        </Td>
                        <Td>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <button
                              onClick={() => toggleRow(req.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: colors.primary, fontSize: "1.2rem" }}
                            >
                              {expandedRow === req.id ? "▴" : "▾"}
                            </button>
                            {req.status === "Result Pending" && (
                              <button onClick={() => handleCancelRequest(req.id)} style={{ background: "none", border: "none", color: colors.danger, cursor: "pointer", fontSize: "1rem" }} title="Cancel Entire Request">✕</button>
                            )}
                          </div>
                        </Td>
                      </Tr>

                      {expandedRow === req.id && (
                        <ExpandedRow>
                          <ExpandedCell colSpan={9}>
                            <SubTableWrapper>
                              <SubTable>
                                <thead>
                                  <Tr>
                                    <Th>Test Name</Th>
                                    <Th>Type</Th>
                                    <Th>Action</Th>
                                  </Tr>
                                </thead>
                                <tbody>
                                  {req.tests.map((t, idx) => (
                                    <Tr key={idx}>
                                      <Td>{t.name}</Td>
                                      <Td>{t.packageName ? `Package (${t.packageName})` : "Individual"}</Td>
                                      <Td>
                                        {req.status === "Result Pending" && (
                                          <button
                                            onClick={() => handleRemoveIndividualTest(req.id, t)}
                                            style={{ background: "none", border: "none", color: colors.danger, cursor: "pointer" }}
                                          >
                                            ✕ Remove
                                          </button>
                                        )}
                                      </Td>
                                    </Tr>
                                  ))}
                                </tbody>
                              </SubTable>
                            </SubTableWrapper>
                          </ExpandedCell>
                        </ExpandedRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </>
      )}
    </div>
  );
}
