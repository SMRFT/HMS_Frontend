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
  Button,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  CloseButton
} from "../GlobalStyles";

// ─── Patient Info Panel ───────────────────────────────────────────────────────
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

// ─── Legend & Actions bar ─────────────────────────────────────────────────────
const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  background: white;
  padding: 8px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
`;

const StatusBadge = styled.span`
  display: inline-block;
  background: ${({ status }) =>
    status === "Result Pending"
      ? colors.secondary + "15"
      : status === "Result Entered"
        ? "#136A6315"
        : colors.textMuted + "10"};
  color: ${({ status }) =>
    status === "Result Pending"
      ? colors.secondary
      : status === "Result Entered"
        ? "#136A63"
        : colors.textMuted};
  border: 1px solid currentColor;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
`;

const IPBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #136A63;
  color: white;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  margin-left: 8px;
`;

const LegendGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const LegendBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${colors.textMain};
  padding: 4px 10px;
  background: ${({ bg }) => bg + "15"};
  border-radius: 4px;
`;

const LegendDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 16px 24px;
  background: ${colors.surface}80;
  backdrop-filter: blur(4px);
  border-radius: 12px;
  border: 1px solid ${colors.border};
  font-size: 0.85rem;
  color: ${colors.textMuted};
`;

const PaginationBtns = styled.div`
  display: flex;
  gap: 8px;
`;

const PageBtn = styled.button`
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid ${(props) => (props.$active ? colors.primary : colors.border)};
  background: ${(props) => (props.$active ? colors.primary : "transparent")};
  color: ${(props) => (props.$active ? "white" : colors.textMain)};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    border-color: ${colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${colors.primary}20;
    background: ${(props) => (props.$active ? colors.primaryDark : colors.primary + "10")};
  }
`;

const SubTableWrapper = styled.div`
  padding: 16px 24px;
  background: ${colors.background};
`;

const SubTableControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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

// ─── Expand: Request Form ─────────────────────────────────────────────────────
const ExpandedRow = styled.tr``;

const ExpandedCell = styled.td`
  padding: 0;
  background: #f9fbfc;
  border-bottom: 2px solid ${colors.primary};
`;

const RequestFormWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 0;
  padding: 0;
`;

const FormPanel = styled.div`
  padding: 20px 24px;
  border-right: 1px solid ${colors.border};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const FormRowSingle = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 0;
`;

const FormLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${colors.textMuted};
  margin-bottom: 5px;
  display: block;
  span.required {
    color: #e53935;
    margin-left: 2px;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 0.88rem;
  background: ${colors.white};
  color: ${colors.textMain};
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const FormInput = styled.input`
  width: 100%;
  border: 1px solid ${colors.border};
  border-radius: 4px 0 0 4px;
  padding: 7px 10px;
  font-size: 0.88rem;
  background: ${colors.white};
  color: ${colors.textMain};
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const SearchIconBtn = styled.button`
  background: ${colors.dark};
  color: ${colors.white};
  border: none;
  border-radius: 0 4px 4px 0;
  padding: 7px 12px;
  cursor: pointer;
  font-size: 1rem;
  &:hover {
    background: ${colors.textMain};
  }
`;

const RateBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  overflow: hidden;
  background: ${colors.white};
`;

const RatePrefix = styled.span`
  background: ${colors.background};
  padding: 7px 10px;
  font-size: 0.9rem;
  color: ${colors.textMuted};
  border-right: 1px solid ${colors.border};
`;

const RateInput = styled.input`
  border: none;
  padding: 7px 10px;
  font-size: 0.88rem;
  width: 100%;
  background: ${colors.background};
  &:focus {
    outline: none;
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  color: ${colors.textMain};
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: ${colors.primary};
    cursor: pointer;
  }
`;

const AddButton = styled.button`
  background: ${colors.orange};
  color: ${colors.white};
  border: none;
  border-radius: 5px;
  padding: 7px 18px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background: ${colors.orangeHover};
  }
`;

// ─── Side panel: Test Name / Item Cost ───────────────────────────────────────
const SidePanel = styled.div`
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
`;

const SidePanelHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: ${colors.textMain};
  padding-bottom: 10px;
  border-bottom: 1px solid ${colors.border};
  margin-bottom: 10px;
`;

const SidePanelActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
`;

const SaveBtn = styled.button`
  background: ${colors.primary};
  color: ${colors.white};
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    background: ${colors.primaryDark};
  }
`;

const CancelBtn = styled.button`
  background: ${colors.dark};
  color: ${colors.white};
  border: none;
  border-radius: 4px;
  padding: 8px 14px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover {
    background: ${colors.textMain};
  }
`;

// ─── Searchable Dropdown Helper ───────────────────────────────────────────────
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
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  max-height: 280px;
  overflow-y: auto;
  z-index: 1000;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  border-radius: 6px;

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

// ─── Component ────────────────────────────────────────────────────────────────
export default function LabWardRequest({ patient: patientProp, onClose }) {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // Map incoming patient prop (from WardRequest row) to display fields
  const pd = patientProp?.patient_details || {};
  const resolvedPatient = {
    ipNo: patientProp?.ipNumber || pd.ipNumber || "-",
    ipBadge: patientProp?.ipserial_number || pd.ipserial_number || "",
    uhid: patientProp?.uhid || pd.uhid || "-",
    name: [
      patientProp?.salutation ?? pd.salutation,
      patientProp?.firstName ?? pd.firstName,
      patientProp?.middleName ?? pd.middleName,
      patientProp?.lastName ?? pd.lastName,
    ].filter(Boolean).join(" ") || "Unknown Patient",
    address: patientProp?.address || pd.permanent_address || "-",
    admitting: patientProp?.admissionDateTime
      ? new Date(patientProp.admissionDateTime).toLocaleString("en-GB", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      })
      : "-",
    admittingDr: patientProp?.admittingDoctor || pd?.admittingDoctor || "-",
    roomBed: `${patientProp?.roomNo || "-"} | ${patientProp?.bedNo || "-"}`,
    customerType: patientProp?.customerType || pd.customer_type || "-",
    companyName: patientProp?.companyName || pd.company_code || "-",
  };

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [search, setSearch] = useState("");
  const [showUpTo, setShowUpTo] = useState("10");
  const [requests, setRequests] = useState([]);

  // Request form state
  const [doctor, setDoctor] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [billtype, setBilltype] = useState(""); // bill_type ID (e.g. 16)
  const [billTypeNo, setBillTypeNo] = useState(""); // billTypeNo (e.g. LAB01)
  const [billTypeName, setBillTypeName] = useState("");
  const [testName, setTestName] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [rate, setRate] = useState("0.00");
  const [pkg, setPkg] = useState("ALL");

  const [investigationItems, setInvestigationItems] = useState([]);
  const [highlightedTestIndex, setHighlightedTestIndex] = useState(-1);
  const testListRef = useRef(null);
  const [selectedTests, setSelectedTests] = useState([]);
  const [billTypeOptions, setBillTypeOptions] = useState([]);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [packageLoading, setPackageLoading] = useState(false);
  const [packageSearch, setPackageSearch] = useState("");

  useEffect(() => {
    if (investigationItems && investigationItems.length > 0) {
      setHighlightedTestIndex(0);
    } else {
      setHighlightedTestIndex(-1);
    }
  }, [investigationItems]);

  useEffect(() => {
    if (testListRef.current && highlightedTestIndex >= 0) {
      const el = testListRef.current.children[highlightedTestIndex];
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedTestIndex]);

  useEffect(() => {
    if (patientProp?.admittingDoctor) {
      setDoctor(patientProp.admittingDoctor);
    }
  }, [patientProp]);

  useEffect(() => {
    console.log("LabWardRequest mounted for patient:", resolvedPatient.uhid);
    fetchBillTypes();
    fetchDoctors();
    fetchLabRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount for this patient modal instance

  const fetchBillTypes = async () => {
    try {
      const outletMap = {
        OLET001: "IP PHARMACY",
        OLET002: "OP PHARMACY",
        OLET003: "MAIN BLOCK",
        OLET004: "CANCER BLOCK",
        OLET005: "VELAVAN",
      };
      let res = await apiRequest(`${HmsBaseUrl}bill-types/?ignore_outlet=true`, "GET");
      let list = res.records || res.data?.billTypes || (Array.isArray(res.data) ? res.data : []);
      if (!list || list.length === 0) {
        res = await apiRequest(`${HmsBaseUrl}get_LabBillType_list/`, "GET");
        list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      }
      if (Array.isArray(list) && list.length > 0) {
        const enriched = list.map((b) => {
          const oc = b.outlet_code || "";
          const on = outletMap[oc] || (oc ? oc : "General");
          return {
            ...b,
            outlet_name: on,
            outlet_badge: oc ? `${on} • ${oc}` : "General",
          };
        });
        const isLab = (b) => {
          const name = (b.bill_name || "").toUpperCase();
          const billNo = (b.billTypeNo || "").toUpperCase();
          return billNo.startsWith("LAB") || name.includes("LAB") || b.ward_request === true;
        };
        const labList = enriched.filter(isLab).sort((a, b) => (a.bill_name || "").localeCompare(b.bill_name || ""));
        const otherList = enriched.filter((b) => !isLab(b)).sort((a, b) => {
          const outCmp = (a.outlet_name || "").localeCompare(b.outlet_name || "");
          if (outCmp !== 0) return outCmp;
          return (a.bill_name || "").localeCompare(b.bill_name || "");
        });
        const allBillTypes = [...labList, ...otherList];
        setBillTypeOptions(allBillTypes);

        const defaultOpt = allBillTypes.find(b => b.billTypeNo === "LAB01") || allBillTypes[0];
        if (defaultOpt) {
          setBillTypeNo(defaultOpt.billTypeNo);
          setBilltype(defaultOpt.bill_type);
          setBillTypeName(defaultOpt.bill_name);
        }
      }
    } catch (error) {
      console.error("Error fetching bill types:", error);
    }
  };

  // Automatically fetch investigation items when bill type or test name changes
  useEffect(() => {
    if (billTypeNo && billtype) {
      const timer = setTimeout(() => {
        fetchInvestigationItems();
      }, 300); // 300ms debounce
      return () => clearTimeout(timer);
    }
  }, [billTypeNo, billtype, testName]);

  const fetchDoctors = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
      console.log("Doctors list response:", response);
      if (response.success) {
        // Backend returns list directly: [...]
        const list = Array.isArray(response.data) ? response.data : [];
        setDoctors(list);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error.message);
    }
  };

  const handleOpenPackageList = async () => {
    setIsPackageModalOpen(true);
    setPackageSearch("");
    setPackageLoading(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}packages_crud/`, "GET");
      const list = res.success && Array.isArray(res.data) ? res.data : [];
      const labPkgs = list.filter((p) =>
        p.is_active !== false &&
        (p.items || []).some((it) => it.billTypeNo === "LAB01")
      );
      setPackages(labPkgs);
    } catch (e) {
      console.error("Error fetching packages:", e);
    } finally {
      setPackageLoading(false);
    }
  };

  const handleSelectPackage = (pkgObj) => {
    const items = pkgObj.items || [];
    const labItems = items.filter((it) => it.billTypeNo === "LAB01");

    const newTests = [...selectedTests];
    labItems.forEach((it) => {
      const exists = newTests.find(
        (t) =>
          (it.test_id && String(t.test_id) === String(it.test_id)) ||
          (it.item_id && String(t.test_id) === String(it.item_id)) ||
          t.itemName === it.itemName
      );
      if (!exists) {
        newTests.push({
          test_id: it.test_id || it.item_id || "",
          itemName: it.itemName,
          price: it.price || "0.00",
          bill_type: billtype,
        });
      }
    });

    setSelectedTests(newTests);
    setIsPackageModalOpen(false);
  };


  const fetchLabRequests = async () => {
    const uhid = resolvedPatient.uhid;
    const ipNo = resolvedPatient.ipNo;
    if (!uhid || uhid === "-" || !ipNo || ipNo === "-") {
      console.warn("Skipping fetchLabRequests due to missing identifiers:", { uhid, ipNo });
      return;
    }
    try {
      console.log(`Fetching lab requests for UHID: ${uhid}, IP: ${ipNo}`);
      const res = await apiRequest(
        `${HmsBaseUrl}get_lab_ward_requests/?uhid=${uhid}&ipNumber=${ipNo}`,
        "GET"
      );
      console.log("Lab requests response:", res);

      if (res.success) {
        const list = res.data?.data || res.data || [];
        setRequests(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error("Lab Request API Error", error);
    }
  };

  const toggleRow = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.wardName.toLowerCase().includes(search.toLowerCase()) ||
      r.doctorName.toLowerCase().includes(search.toLowerCase())
  );

  const fetchInvestigationItems = async () => {
    if (!billTypeNo || !billtype) {
      alert("Please select a Bill Type first.");
      return;
    }
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}investigation-items/?billTypeNo=${billTypeNo}&billType=${billtype}&itemName=${testName}`,
        "GET"
      );
      if (res.success) {
        // Backend returns { items: [...] } or { data: [...] }
        const list = res.data?.items || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setInvestigationItems(list);
      }
    } catch (error) {
      console.error("Investigation Items API Error", error);
    }
  };

  const addTest = (test) => {
    if (!test) return;
    // Unique check based on test_id or itemName (if test_id missing)
    const exists = selectedTests.find((t) =>
      (test.test_id && t.test_id === test.test_id) ||
      (t.itemName === test.itemName)
    );
    if (exists) {
      alert("This test is already added.");
      return;
    }

    setSelectedTests((prev) => [...prev, test]);
    setTestName("");
    setInvestigationItems([]);
    setRate(test.price || "0.00");
  };

  const removeTest = (index) => {
    setSelectedTests((prev) => prev.filter((_, i) => i !== index));
    if (selectedTests.length === 1) {
      setRate("0.00");
    }
  };

  const handleSave = async () => {
    if (selectedTests.length === 0) {
      alert("Please add at least one test.");
      return;
    }
    if (!doctor) {
      alert("Please select a doctor.");
      return;
    }

    const mappedTests = selectedTests.map(t => ({
      test_id: t.test_id || "",
      itemName: t.itemName,
      price: t.price,
      bill_type: billtype,
      is_emergency: emergency
    }));

    const payload = {
      uhid: resolvedPatient.uhid,
      ipNumber: resolvedPatient.ipNo,
      doctor: doctor,
      wardName: resolvedPatient.roomBed.split("|")[0].trim() || "SUITE",
      item: mappedTests,
      total_amount: selectedTests.reduce((acc, t) => acc + (parseFloat(t.price) || 0), 0),
    };

    try {
      const res = await apiRequest(`${HmsBaseUrl}save_lab_ward_request/`, "POST", payload);
      if (res.success) {
        alert("Lab Ward Request Saved Successfully!");
        setSelectedTests([]);
        setShowRequestForm(false);
        fetchLabRequests();
      } else {
        alert("Failed to save: " + (res.error || res.data?.message));
      }
    } catch (error) {
      console.error("Save Lab Request Error:", error);
      alert("An error occurred while saving.");
    }
  };
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}cancel_lab_ward_request/`, "POST", { id: requestId });
      if (res.success) {
        alert("Request cancelled successfully!");
        fetchLabRequests();
      } else {
        alert("Failed to cancel: " + (res.data?.error || res.error || res.data?.message));
      }
    } catch (error) {
      console.error("Cancel Request Error:", error);
      alert("An error occurred while cancelling.");
    }
  };


  const handleRemoveIndividualTest = async (requestId, test) => {
    if (!window.confirm(`Are you sure you want to remove the test "${test.name}"?`)) return;
    try {
      const payload = {
        id: requestId,
        test_id: test.test_id,
        test_name: test.name
      };
      const res = await apiRequest(`${HmsBaseUrl}remove_individual_test/`, "POST", payload);
      if (res.success) {
        alert("Test removed successfully!");
        fetchLabRequests();
      } else {
        alert("Failed to remove test: " + (res.data?.error || res.data?.message || res.error));
      }
    } catch (error) {
      console.error("Remove Individual Test Error:", error);
      alert("An error occurred while removing the test.");
    }
  };


  return (
    <PageWrapper>
      {/* ── Patient Info ── */}
      <PatientPanel>
        <div className="patient-left">
          <PatientAvatar>
            {resolvedPatient.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
          </PatientAvatar>
          <PatientIdentity>
            <h3>{resolvedPatient.name}</h3>
            <div className="sub-text">
              UHID: {resolvedPatient.uhid} · IP: {resolvedPatient.ipNo} {resolvedPatient.ipBadge && `(${resolvedPatient.ipBadge})`}
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

      {/* ── Actions Bar ── */}
      <ActionsBar>
        <LegendGroup>
          <LegendBadge bg={colors.secondary}>
            <LegendDot color={colors.secondary} />
            Result Pending
          </LegendBadge>
          <LegendBadge bg={colors.primary}>
            <LegendDot color={colors.primary} />
            Result Entered
          </LegendBadge>
          <LegendBadge bg={colors.textMuted}>
            <LegendDot color={colors.textMuted} />
            Cancelled Request
          </LegendBadge>
        </LegendGroup>
        <Button onClick={() => setShowRequestForm((v) => !v)}>
          {showRequestForm ? "− Request" : "+ Request"}
        </Button>
      </ActionsBar>

      {/* ── Request Form (inline expand) ── */}
      {showRequestForm && (
        <div
          style={{
            background: "#f9fbfc",
            border: `1px solid ${colors.border}`,
            borderRadius: 6,
            marginBottom: 18,
          }}
        >
          <RequestFormWrapper>
            <FormPanel>
              <FormRow>
                <div>
                  <FormLabel>
                    Doctor<span className="required">*</span>
                  </FormLabel>
                  <SearchableDropdown
                    value={doctor}
                    onChange={(val) => setDoctor(val)}
                    options={doctors.map((dr) => ({ id: dr.employeeName, name: dr.employeeName }))}
                    placeholder="Search or Select Doctor"
                    displayKey="name"
                    valueKey="id"
                  />
                </div>
                <div>
                  <FormLabel>
                    Billtype<span className="required">*</span>
                  </FormLabel>
                  <div>
                    <SearchableDropdown
                      value={billTypeNo && billtype ? `${billTypeNo}|${billtype}` : ""}
                      onChange={(val) => {
                        if (!val) {
                          setBillTypeNo("");
                          setBilltype("");
                          setBillTypeName("");
                          return;
                        }
                        const [no, type] = val.split("|");
                        setBillTypeNo(no);
                        setBilltype(type);
                        setBillTypeName(billTypeOptions.find(opt => opt.billTypeNo === no && String(opt.bill_type) === type)?.bill_name || "");
                      }}
                      options={billTypeOptions.map((opt) => ({
                        id: `${opt.billTypeNo}|${opt.bill_type}`,
                        name: opt.bill_name,
                        badge: opt.outlet_badge,
                      }))}
                      placeholder="Search or Select Bill Type"
                      displayKey="name"
                      valueKey="id"
                    />
                  </div>
                </div>
              </FormRow>

              <FormRowSingle>
                <div style={{ position: "relative" }}>
                  <FormLabel>Test Name</FormLabel>
                  <div style={{ display: "flex" }}>
                    <FormInput
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      onKeyDown={(e) => {
                        if (investigationItems.length > 0) {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setHighlightedTestIndex((prev) => (prev < investigationItems.length - 1 ? prev + 1 : 0));
                            return;
                          }
                          if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setHighlightedTestIndex((prev) => (prev <= 0 ? investigationItems.length - 1 : prev - 1));
                            return;
                          }
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (highlightedTestIndex >= 0 && investigationItems[highlightedTestIndex]) {
                              addTest(investigationItems[highlightedTestIndex]);
                              setInvestigationItems([]);
                            } else {
                              fetchInvestigationItems();
                            }
                            return;
                          }
                          if (e.key === "Escape") {
                            setInvestigationItems([]);
                            return;
                          }
                        }
                        if (e.key === "Enter") {
                          e.preventDefault();
                          fetchInvestigationItems();
                        }
                      }}
                      placeholder="Search for a test (use ↑/↓ to navigate, Enter to select)..."
                    />
                    <SearchIconBtn type="button" onClick={fetchInvestigationItems}>
                      🔍
                    </SearchIconBtn>
                    <button
                      type="button"
                      onClick={handleOpenPackageList}
                      style={{
                        background: colors.secondary || "#f59e0b",
                        color: "white",
                        padding: "0 12px",
                        marginLeft: "6px",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      🎁 Package
                    </button>
                  </div>
                  {investigationItems.length > 0 && (
                    <div
                      ref={testListRef}
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        border: "1.5px solid #0d8a7a",
                        borderRadius: 6,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        maxHeight: 220,
                        overflowY: "auto",
                        background: "#fff",
                      }}
                    >
                      {Array.isArray(investigationItems) && investigationItems.map((item, index) => {
                        const isHighlighted = index === highlightedTestIndex;
                        return (
                          <div
                            key={index}
                            onClick={() => {
                              addTest(item);
                              setInvestigationItems([]);
                            }}
                            onMouseEnter={() => setHighlightedTestIndex(index)}
                            style={{
                              padding: "9px 12px",
                              cursor: "pointer",
                              borderBottom: "1px solid #eee",
                              fontSize: "0.85rem",
                              background: isHighlighted ? "#e6f9f3" : "#fff",
                              color: isHighlighted ? "#0d8a7a" : "#1e293b",
                              fontWeight: isHighlighted ? 700 : 500,
                              outline: isHighlighted ? "1px solid #0d8a7a" : "none",
                            }}
                          >
                            {item.itemName} — ₹{item.price}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div>
                  <FormLabel>Emergency Test</FormLabel>
                  <CheckboxRow style={{ marginTop: 8 }}>
                    <input
                      type="checkbox"
                      checked={emergency}
                      onChange={(e) => setEmergency(e.target.checked)}
                    />
                  </CheckboxRow>
                </div>
                <div>
                  <FormLabel>Rate</FormLabel>
                  <RateBox>
                    <RatePrefix>₹</RatePrefix>
                    <RateInput
                      type="number"
                      value={rate}
                      readOnly
                    />
                  </RateBox>
                </div>
              </FormRowSingle>

              <div style={{ marginTop: 14 }}>
                <FormLabel>Package</FormLabel>
                <FormSelect
                  value={pkg}
                  onChange={(e) => setPkg(e.target.value)}
                  style={{ width: 200 }}
                >
                  <option>ALL</option>
                  <option>BASIC</option>
                  <option>ADVANCED</option>
                </FormSelect>
              </div>
            </FormPanel>

            <SidePanel>
              <SidePanelHeader>
                <span>Test Name</span>
                <span style={{ textAlign: "right", paddingRight: "30px" }}>Cost | Action</span>
              </SidePanelHeader>
              {selectedTests.map((test, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 0",
                    borderBottom: "1px solid #CFD8DC",
                    fontSize: "0.85rem",
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{test.itemName}</span>
                  <span style={{ color: colors.headerBg, fontWeight: 600 }}>₹ {test.price}</span>
                  <button
                    onClick={() => removeTest(index)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#e53935",
                      cursor: "pointer",
                      fontSize: "1rem",
                      padding: "0 4px",
                      display: "flex",
                      alignItems: "center"
                    }}
                    title="Remove Test"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div style={{ flex: 1 }} />
              <SidePanelActions>
                <SaveBtn type="button" onClick={handleSave}>💾 Save</SaveBtn>
                <CancelBtn type="button" onClick={() => setShowRequestForm(false)}>
                  ✕ Cancel
                </CancelBtn>
              </SidePanelActions>
            </SidePanel>
          </RequestFormWrapper>
        </div>
      )}

      {/* ── Main Table ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: colors.textMain }}>
          Show up to
          <Select value={showUpTo} onChange={(e) => setShowUpTo(e.target.value)} style={{ width: "70px", padding: "4px 8px" }}>
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </Select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
          <Input
            placeholder="Search by Ward..."
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
              <Th>User Name</Th>
              <Th>Bill No</Th>
              <Th>Bill Type</Th>
              <Th>Ward Name</Th>
              <Th>Doctor Name</Th>
              <Th style={{ width: "48px" }}></Th>
            </Tr>
          </thead>
          <tbody>
            {Array.isArray(filteredRequests) && filteredRequests.map((req) => (
              <React.Fragment key={req.id}>
                <Tr>
                  <Td>
                    <StatusBadge status={req.status}>{req.status}</StatusBadge>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 500 }}>{req.reqDate}</span>
                      <small style={{ color: colors.textMuted }}>{req.reqTime}</small>
                    </div>
                  </Td>
                  <Td>{req.userName}</Td>
                  <Td>{req.billNo}</Td>
                  <Td>{req.billType}</Td>
                  <Td>{req.wardName}</Td>
                  <Td
                    style={{ cursor: "pointer", color: colors.primary, fontWeight: 600 }}
                    onClick={() => toggleRow(req.id)}
                  >
                    {req.doctorName}
                  </Td>
                  <Td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <button
                        onClick={() => toggleRow(req.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: colors.primary, fontSize: "1.2rem" }}
                      >
                        {expandedRow === req.id ? "▴" : "▾"}
                      </button>
                      {req.status === "Result Pending" && (
                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: colors.danger,
                            cursor: "pointer",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center"
                          }}
                          title="Cancel Request"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>

                {expandedRow === req.id && (
                  <Tr>
                    <Td colSpan={8} style={{ padding: 0 }}>
                      <SubTableWrapper>
                        <SubTableControls>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
                            Show up to
                            <Select defaultValue="10" style={{ width: "70px", padding: "4px 8px" }}>
                              <option>10</option>
                              <option>25</option>
                            </Select>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
                            Search:
                            <Input placeholder="Search By Test Name" style={{ width: "200px", padding: "4px 12px" }} />
                          </div>
                        </SubTableControls>
                        <SubTable>
                          <thead>
                            <Tr>
                              <Th>Test Name</Th>
                              <Th>Collection Time</Th>
                              <Th>Action</Th>
                            </Tr>
                          </thead>
                          <tbody>
                            {req.tests.length === 0 ? (
                              <Tr>
                                <Td
                                  colSpan={3}
                                  style={{ textAlign: "center", color: colors.textMuted }}
                                >
                                  No tests found
                                </Td>
                              </Tr>
                            ) : (
                              req.tests.map((t, i) => (
                                <Tr key={i}>
                                  <Td>{t.name}</Td>
                                  <Td>{t.collectionTime}</Td>
                                  <Td style={{ textAlign: "center" }}>
                                    {req.status === "Result Pending" && (
                                      <button
                                        onClick={() => handleRemoveIndividualTest(req.id, t)}
                                        style={{
                                          background: "none",
                                          border: "none",
                                          color: colors.danger,
                                          cursor: "pointer",
                                          fontSize: "0.9rem",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          width: "100%"
                                        }}
                                        title="Remove this test"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </Td>
                                </Tr>
                              ))
                            )}
                          </tbody>
                        </SubTable>
                        <Pagination>
                          <span>
                            Showing 1 to {req.tests.length} of {req.tests.length} entries
                          </span>
                          <PaginationBtns>
                            <PageBtn disabled>Previous</PageBtn>
                            <PageBtn active>1</PageBtn>
                            <PageBtn disabled>Next</PageBtn>
                          </PaginationBtns>
                        </Pagination>
                      </SubTableWrapper>
                    </Td>
                  </Tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </TableWrapper>

      <Pagination>
        <span>Showing 1 to {filteredRequests.length} of {filteredRequests.length} entries</span>
        <PaginationBtns>
          <PageBtn disabled>Previous</PageBtn>
          <PageBtn active>1</PageBtn>
          <PageBtn disabled>Next</PageBtn>
        </PaginationBtns>
      </Pagination>

      {/* Package Selection Modal */}
      {isPackageModalOpen && (
        <ModalOverlay style={{ zIndex: 2000 }}>
          <ModalContainer
            style={{ width: "90%", maxWidth: "700px", height: "70vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader $bg="#136A63">
              <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>🎁</span>
                <h3 style={{ color: "#fff", margin: 0 }}>Select Lab Package</h3>
              </div>
              <CloseButton onClick={() => setIsPackageModalOpen(false)} style={{ color: "rgba(255,255,255,0.8)", background: 'transparent' }}>
                ✕
              </CloseButton>
            </ModalHeader>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: colors.background }}>
              {/* Package Search Input */}
              <div style={{ marginBottom: "16px", position: "relative" }}>
                <Input
                  type="text"
                  placeholder="Search package by name..."
                  value={packageSearch}
                  onChange={(e) => setPackageSearch(e.target.value)}
                  style={{
                    paddingLeft: "36px",
                    borderRadius: "8px",
                    border: `1px solid ${colors.border}`,
                    background: "white",
                    width: "100%",
                    boxSizing: "border-box"
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: colors.textMuted
                  }}
                >
                  🔍
                </span>
              </div>

              {packageLoading ? (
                <div style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                  Loading packages...
                </div>
              ) : packages.filter(p => p.packageName.toLowerCase().includes(packageSearch.toLowerCase())).length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                  No packages found.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {packages
                    .filter(p => p.packageName.toLowerCase().includes(packageSearch.toLowerCase()))
                    .map((pkgObj) => (
                      <div
                        key={pkgObj.packageNo}
                        onClick={() => handleSelectPackage(pkgObj)}
                        style={{
                          padding: "16px",
                          background: "white",
                          border: `1px solid ${colors.border}`,
                          borderRadius: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = colors.primary;
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(19, 106, 99, 0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = colors.border;
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: colors.textMain, fontSize: "0.95rem" }}>
                            {pkgObj.packageName}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: colors.textMuted, marginTop: "4px" }}>
                            {(pkgObj.items || []).filter(it => it.billTypeNo === "LAB01").map(it => `${it.itemName} (x${it.quantity || 1})`).join(", ")}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.8rem", color: colors.primary, fontWeight: 700 }}>
                          Select →
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}