import React, { useState, useEffect, useRef, useMemo } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { Printer, Eye, Plus, X, Search, CheckCircle2, AlertCircle } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import PrintModal from "../InvestigationBilling/PrintModal";
import OTPrintModal from "./OTPrintModal";
import { generateLabOverallPrintHtml, formatDateTime } from "./otPrintUtils";

// ─── Color Palette (matching OTMedicineBilling & OTImplantRequest) ───────────
const colors = {
  primary: "#136A63",
  primaryDark: "#0B4C47",
  orange: "#F88C22",
  orangeHover: "#E67D1E",
  dark: "#37474F",
  border: "#CFD8DC",
  background: "#F5F7F8",
  textMain: "#263238",
  textMuted: "#78909C",
  white: "#FFFFFF",
  headerBg: "#546E7A",
  success: "#16a34a",
  danger: "#dc2626",
  badgeBg: "#e0f2fe",
  badgeText: "#0369a1",
};

// ─── Layout Styles ────────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${colors.background};
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #ffffff;
  border-bottom: 1px solid ${colors.border};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
`;

const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid ${colors.primary};
  color: ${colors.primary};
  border-radius: 6px;
  padding: 5px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: ${colors.primary};
    color: #fff;
  }
`;

const PageTitle = styled.h2`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SurgeryRefChip = styled.span`
  font-size: 0.74rem;
  font-weight: 600;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 20px;
  padding: 2px 10px;
`;

const EmergencyChip = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  border-radius: 20px;
  padding: 2px 10px;
  animation: blink 1s step-start infinite;
  @keyframes blink {
    0%,
    100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 8px;
`;

const NavButton = styled.button`
  background: none;
  border: 1px solid ${colors.border};
  color: ${colors.dark};
  border-radius: 5px;
  padding: 4px 10px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
  &:hover {
    border-color: ${colors.primary};
    color: ${colors.primary};
    background: #f0fdfa;
  }
`;

// ─── Patient Panel ────────────────────────────────────────────────────────────
const PatientPanel = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 14px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
`;

const PatientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px 14px;
  @media (max-width: 1300px) {
    grid-template-columns: repeat(4, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FieldBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FieldValue = styled.div`
  background: #f1f5f7;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 0.84rem;
  color: ${colors.textMain};
  min-height: 32px;
  display: flex;
  align-items: center;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// ─── Top Action Bar ───────────────────────────────────────────────────────────
const TopActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionBtnGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const PrimaryBtn = styled.button`
  background: ${colors.orange};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
  box-shadow: 0 4px 6px rgba(248, 140, 34, 0.2);
  &:hover {
    background: ${colors.orangeHover};
    transform: translateY(-1px);
  }
`;

const OverallPrintBtn = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
  box-shadow: 0 4px 6px rgba(19, 106, 99, 0.2);
  &:hover {
    background: ${colors.primaryDark};
    transform: translateY(-1px);
  }
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// ─── Form Card (Collapsible) ──────────────────────────────────────────────────
const FormCard = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
  animation: slideDown 0.2s ease-out;

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const FormSectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  color: ${colors.primary};
  border-bottom: 1.5px solid #e2e8f0;
  padding-bottom: 8px;
  margin-bottom: 16px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px 16px;
  margin-bottom: 16px;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const InputLabel = styled.label`
  font-size: 0.76rem;
  font-weight: 600;
  color: ${colors.textMuted};
  ${(p) => p.$required && `
    &::after {
      content: " *";
      color: #ef4444;
    }
  `}
`;

const StyledInput = styled.input`
  border: 1px solid ${colors.border};
  padding: 7px 10px;
  border-radius: 5px;
  font-size: 0.85rem;
  color: ${colors.textMain};
  width: 100%;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(19, 106, 99, 0.1);
  }
`;

const ItemSelectionRow = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 3fr) minmax(90px, 1fr) minmax(110px, 1fr) auto;
  gap: 12px;
  align-items: end;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${colors.border};
  border-radius: 5px;
  overflow: hidden;
  background: white;
  input {
    border: none;
    text-align: center;
    width: 100%;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 7px 0;
    color: ${colors.textMain};
    &:focus { outline: none; }
  }
`;

const AddBtn = styled.button`
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-weight: 700;
  font-size: 0.84rem;
  cursor: pointer;
  height: 35px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
  &:hover {
    background: #15803d;
  }
`;

const StagedTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  th {
    background: ${colors.headerBg};
    color: white;
    padding: 8px 12px;
    font-size: 0.78rem;
    font-weight: 600;
    text-align: left;
  }
  td {
    padding: 8px 12px;
    font-size: 0.82rem;
    border-bottom: 1px solid #edf2f4;
    color: ${colors.textMain};
  }
  tbody tr:nth-child(even) td {
    background: #f8fafc;
  }
`;

const DelBtn = styled.button`
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: #dc2626;
    color: white;
  }
`;

const SummaryBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px 18px;
  margin-top: 14px;
  flex-wrap: wrap;
  gap: 12px;
`;

const SummaryTotalText = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  color: ${colors.dark};
  strong {
    font-size: 1.25rem;
    color: #16a34a;
  }
`;

const FormActionRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const ResetBtn = styled.button`
  background: #64748b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { background: #475569; }
`;

const SaveBtn = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 22px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(19, 106, 99, 0.3);
  transition: all 0.15s;
  &:hover {
    background: ${colors.primaryDark};
    transform: translateY(-1px);
  }
`;

// ─── History Section & Table ──────────────────────────────────────────────────
const HistorySection = styled.div`
  margin-top: 20px;
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 2px solid ${colors.primary};
  padding-bottom: 8px;
  flex-wrap: wrap;
  gap: 10px;
`;

const HistoryTitle = styled.h3`
  margin: 0;
  font-size: 0.98rem;
  font-weight: 700;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchInputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 260px;
  svg {
    position: absolute;
    left: 8px;
    color: ${colors.textMuted};
  }
  input {
    width: 100%;
    padding: 6px 10px 6px 30px;
    border: 1px solid ${colors.border};
    border-radius: 6px;
    font-size: 0.8rem;
    &:focus {
      outline: none;
      border-color: ${colors.primary};
    }
  }
`;

const KpiBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 14px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const KpiCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    font-size: 0.72rem;
    font-weight: 700;
    color: ${colors.textMuted};
    text-transform: uppercase;
  }
  strong {
    font-size: 1.15rem;
    color: ${colors.primary};
  }
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

  th {
    background: ${colors.headerBg};
    color: white;
    padding: 10px 12px;
    text-align: left;
    font-size: 0.78rem;
    font-weight: 600;
    white-space: nowrap;
  }

  td {
    padding: 9px 12px;
    font-size: 0.82rem;
    border-bottom: 1px solid #edf2f4;
    color: ${colors.textMain};
    vertical-align: middle;
  }

  tbody tr:nth-child(even) td {
    background: #fafbfc;
  }

  tbody tr:hover td {
    background: #f0fdfa;
  }
`;

const StatusChip = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  background: ${(p) => (p.$paid ? "#dcfce7" : "#fef3c7")};
  color: ${(p) => (p.$paid ? "#15803d" : "#b45309")};
  border: 1px solid ${(p) => (p.$paid ? "#86efac" : "#fde68a")};
`;

const RowPrintBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f0fdfa;
  border: 1px solid ${colors.primary};
  color: ${colors.primary};
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: ${colors.primary};
    color: white;
  }
`;

// ─── Searchable Dropdown Component ───────────────────────────────────────────
const DropdownWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 100%;
  width: max-content;
  max-width: min(650px, 90vw);
  max-height: 240px;
  overflow-y: auto;
  background: white;
  border: 1px solid ${colors.primary};
  border-radius: 6px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 2px;
`;

const DropdownItem = styled.div`
  padding: 6px 10px;
  cursor: pointer;
  font-size: 0.82rem;
  color: ${colors.textMain};
  &:hover {
    background: #f0fdfa;
    color: ${colors.primaryDark};
    font-weight: 600;
  }
  &:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
  }
`;

const SearchableDropdown = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  displayKey = "name",
  valueKey = "id",
  disabled = false,
}) => {
  const getLabel = (val) => {
    if (!val) return "";
    const found = options.find((o) =>
      typeof o === "string" ? o === val : o[valueKey] === val
    );
    return found ? (typeof found === "string" ? found : found[displayKey]) : val;
  };

  const [inputValue, setInputValue] = useState(() => getLabel(value));
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const isSearchingRef = useRef(false);

  useEffect(() => {
    if (!isSearchingRef.current) {
      setInputValue(getLabel(value));
    }
  }, [value, options]); // eslint-disable-line

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        isSearchingRef.current = false;
        setIsOpen(false);
        setInputValue(getLabel(value));
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value, options]); // eslint-disable-line

  const filtered = options.filter((o) => {
    const label = typeof o === "string" ? o : o[displayKey];
    return label.toLowerCase().includes(inputValue.toLowerCase());
  });

  const handleInputChange = (e) => {
    isSearchingRef.current = true;
    setInputValue(e.target.value);
    setIsOpen(true);
    if (e.target.value === "") {
      isSearchingRef.current = false;
      onChange("");
    }
  };

  const handleSelect = (option) => {
    const sv = typeof option === "string" ? option : option[valueKey];
    const dv = typeof option === "string" ? option : option[displayKey];
    isSearchingRef.current = false;
    setInputValue(dv);
    setIsOpen(false);
    onChange(sv);
  };

  return (
    <DropdownWrapper ref={wrapperRef}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <StyledInput
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            isSearchingRef.current = true;
            setInputValue("");
            setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
        />
        {value && !disabled && (
          <span
            onMouseDown={(e) => {
              e.preventDefault();
              isSearchingRef.current = false;
              setInputValue("");
              setIsOpen(false);
              onChange("");
            }}
            style={{
              position: "absolute",
              right: "8px",
              cursor: "pointer",
              color: "#888",
              fontSize: "14px",
              userSelect: "none",
            }}
          >
            ×
          </span>
        )}
      </div>
      {isOpen && filtered.length > 0 && (
        <DropdownList>
          {filtered.map((option, index) => (
            <DropdownItem
              key={index}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(option)}
            >
              {typeof option === "string" ? option : option[displayKey]}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </DropdownWrapper>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OTLabBilling = () => {
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    investBillNo: "",
    investBillDate: "",
    time: "",
    uhid: "",
    ipNumber: "",
    doctor: "",
    salutation: "",
    firstName: "",
    patientName: "",
    lastName: "",
    age: "",
    age_type: "",
    gender: "",
    item: JSON.stringify([]),
    referredBy: "",
    total: 0,
    finalPrice: 0,
    paymentMethod: "Credit",
    paymentStatus: "Pending",
    customer_type: "",
    company_name: "",
    company_code: "",
    surgeryRef: "",
    roomNo: "",
    is_emergency: false,
    billType: "",
    bill_type: "",
    billTypeNo: "LAB01",
  });

  const [doctors, setDoctors] = useState([]);
  const [billTypes, setBillTypes] = useState([]);
  const [selectedBillTypeNo, setSelectedBillTypeNo] = useState("LAB01");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [productList, setProductList] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loadingItems, setLoadingItems] = useState(true);

  // Print states
  const [printJob, setPrintJob] = useState(null);
  const [overallPrintOpen, setOverallPrintOpen] = useState(false);

  // History & UI State
  const [showForm, setShowForm] = useState(false);
  const [billedBills, setBilledBills] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");

  // ── Clock ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      setFormData((p) => ({
        ...p,
        investBillDate: today,
        time: `${hh}:${mm}:${ss}`,
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Fetch Doctors ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await apiRequest(`${HMSURL}doctor_list_diagnostics/`, "GET");
      if (res.success) setDoctors(res.data || []);
    };
    fetchDoctors();
  }, [HMSURL]);

  // ── Fetch LAB Bill Types ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBillTypes = async () => {
      const result = await apiRequest(`${HMSURL}bill-types/`, "GET");
      if (result.success) {
        const labTypes = (result.data.billTypes || [])
          .map((bt) => ({
            ...bt,
            billTypeNo: bt.billTypeNo ?? bt.BillTypeNo ?? 0,
          }))
          .filter((bt) =>
            ["LAB01", "LAB02", "LAB03"].includes(
              String(bt.billTypeNo).trim().toUpperCase()
            )
          );
        setBillTypes(labTypes);

        const defaultLab =
          labTypes.find(
            (b) => String(b.billTypeNo).trim().toUpperCase() === "LAB01"
          ) || labTypes[0];

        if (defaultLab) {
          setFormData((prev) => ({
            ...prev,
            billType: defaultLab.bill_name,
            bill_type: defaultLab.bill_type,
            billTypeNo: defaultLab.billTypeNo,
          }));
          setSelectedBillTypeNo(defaultLab.billTypeNo);
        }
      }
    };
    fetchBillTypes();
  }, [HMSURL]);

  // ── Fetch Items on Bill Type Change ──────────────────────────────────────────
  useEffect(() => {
    if (!formData.bill_type || !selectedBillTypeNo) return;
    const fetchItems = async () => {
      setLoadingItems(true);
      const res = await apiRequest(
        `${HMSURL}investigation-items/?billTypeNo=${selectedBillTypeNo}&billType=${formData.bill_type}`,
        "GET"
      );
      if (res.success) setItems(res.data?.items || []);
      setLoadingItems(false);
    };
    fetchItems();
  }, [HMSURL, selectedBillTypeNo, formData.bill_type]);

  // ── Populate from Navigation State ───────────────────────────────────────────
  useEffect(() => {
    if (!location.state?.patientData) return;
    const d = location.state.patientData;
    const targetIp = d.ip_number || d.ipNumber || "";
    setFormData((prev) => ({
      ...prev,
      uhid: d.uhid || "",
      ipNumber: targetIp,
      salutation: d.salutation || "",
      firstName: d.firstName || "",
      lastName: d.lastName || "",
      patientName: d.patient_name || d.firstName || "",
      age: String(d.age || ""),
      age_type: String(d.age_type || ""),
      gender: d.gender || "",
      _rawDoctor: d.doctor || d.surgeon_id || d.surgeonName || "",
      doctor: "",
      referredBy: "",
      surgeryRef: d.surgeryRef || d.reference_no || "",
      roomNo: d.ot_name || d.roomNo || "",
      customer_type: d.customer_type || d.customerType || "",
      company_name: d.company_name || d.companyName || "",
      company_code: d.company_code || "",
      is_emergency: !!d.is_emergency,
    }));

    if (targetIp) {
      fetchBilledItems(targetIp);
    }
  }, [location.state]); // eslint-disable-line

  // ── Resolve Raw Doctor ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!doctors.length || !formData._rawDoctor) return;
    const raw = formData._rawDoctor;
    const match = doctors.find(
      (d) =>
        d.employeeName.trim() === raw ||
        d.employeeId === raw ||
        String(d.employeeId) === String(raw)
    );
    const resolvedId = match ? match.employeeId : raw;
    setFormData((p) => ({
      ...p,
      doctor: resolvedId,
      referredBy: resolvedId,
    }));
  }, [doctors, formData._rawDoctor]);

  // ── Fetch Billed Items for this IP Number ───────────────────────────────────
  const fetchBilledItems = async (ipNo) => {
    const targetIp = ipNo || formData.ipNumber;
    if (!targetIp) return;
    setLoadingHistory(true);
    try {
      const res = await apiRequest(
        `${HMSURL}investBillingGet/?ipNumber=${encodeURIComponent(targetIp)}`,
        "GET"
      );
      if (res.success && Array.isArray(res.data)) {
        setBilledBills(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch billed lab items:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // ── Extract All Billed Items from Bills (for overall statement print) ────────
  const flattenedBilledItems = useMemo(() => {
    const list = [];
    billedBills.forEach((b) => {
      let rawItems = b.item || [];
      if (typeof rawItems === "string") {
        try { rawItems = JSON.parse(rawItems); } catch { rawItems = []; }
      }
      if (Array.isArray(rawItems)) {
        rawItems.forEach((it, idx) => {
          list.push({
            id: `${b.investBillNo || "B"}-${idx}`,
            billId: b._id,
            investBillNo: b.investBillNo || "—",
            investBillDate: b.investBillDate || b.created_date,
            time: b.time || "",
            itemName: it.itemName || it.testName || it.name || "—",
            quantity: Number(it.quantity) || 1,
            price: Number(it.price) || 0,
            amount: (Number(it.price) || 0) * (Number(it.quantity) || 1),
            billTypeNo: it.billTypeNo || b.billTypeNo || b.bill_name || "LAB01",
            doctor: b.doctorName || b.doctor || "—",
            paymentMethod: b.paymentMethod || "Credit",
            paymentStatus: b.paymentStatus || "Pending",
            fullBill: b,
          });
        });
      }
    });
    return list;
  }, [billedBills]);

  // ── Group and Enrich Bills for Table Display (Per Bill Number) ─────────────
  const enrichedBills = useMemo(() => {
    return (billedBills || []).map((b, idx) => {
      let rawItems = b.item || [];
      if (typeof rawItems === "string") {
        try { rawItems = JSON.parse(rawItems); } catch { rawItems = []; }
      }
      if (!Array.isArray(rawItems)) rawItems = [];

      const parsedItems = rawItems.map((it) => ({
        itemName: it.itemName || it.testName || it.name || "—",
        quantity: Number(it.quantity) || 1,
        price: Number(it.price) || 0,
        amount: (Number(it.price) || 0) * (Number(it.quantity) || 1),
      }));

      const totalQty = parsedItems.reduce((acc, it) => acc + it.quantity, 0);
      const computedTotal = parsedItems.reduce((acc, it) => acc + it.amount, 0);
      const billAmount = Number(b.finalPrice) > 0 ? Number(b.finalPrice) : computedTotal;

      return {
        id: b._id || `${b.investBillNo || "bill"}-${idx}`,
        investBillNo: b.investBillNo || "—",
        investBillDate: b.investBillDate || b.created_date,
        time: b.time || "",
        billType: b.bill_name || b.billType || b.billTypeNo || "LAB",
        doctor: b.doctorName || b.doctor || "—",
        items: parsedItems,
        totalQty,
        billAmount,
        paymentStatus: b.paymentStatus || "Pending",
        paymentMethod: b.paymentMethod || "Credit",
        fullBill: b,
      };
    });
  }, [billedBills]);

  // Filtered bills by search query
  const filteredBills = useMemo(() => {
    if (!filterSearch.trim()) return enrichedBills;
    const term = filterSearch.toLowerCase().trim();
    return enrichedBills.filter((b) => {
      const matchBillNo = b.investBillNo.toLowerCase().includes(term);
      const matchDoc = b.doctor.toLowerCase().includes(term);
      const matchType = b.billType.toLowerCase().includes(term);
      const matchItems = b.items.some((it) =>
        it.itemName.toLowerCase().includes(term)
      );
      return matchBillNo || matchDoc || matchType || matchItems;
    });
  }, [enrichedBills, filterSearch]);

  const totalBilledAmount = useMemo(() => {
    return enrichedBills.reduce((acc, b) => acc + b.billAmount, 0);
  }, [enrichedBills]);

  const totalBilledQty = useMemo(() => {
    return enrichedBills.reduce((acc, b) => acc + b.totalQty, 0);
  }, [enrichedBills]);

  // ── Form Add/Delete Handlers ─────────────────────────────────────────────────
  const handleItemChange = (name) => {
    setSelectedItem(name);
    const obj = items.find((i) => i.itemName === name);
    setSelectedPrice(obj ? obj.price : "");
  };

  const handleBillTypeChange = (billName) => {
    const bt = billTypes.find((b) => b.bill_name === billName);
    if (bt) {
      const bNo = bt.billTypeNo ?? bt.BillTypeNo ?? "LAB01";
      setSelectedBillTypeNo(bNo);
      setFormData((prev) => ({
        ...prev,
        billType: bt.bill_name,
        bill_type: bt.bill_type,
        billTypeNo: bNo,
      }));
      setSelectedItem("");
      setSelectedPrice("");
      setProductList([]);
    }
  };

  const addProduct = () => {
    if (!selectedItem || !selectedPrice) return;
    const obj = items.find((item) => item.itemName === selectedItem);
    const newProduct = {
      itemName: selectedItem,
      price: selectedPrice,
      quantity,
      billTypeNo: selectedBillTypeNo,
      nabh_code: obj?.nabh_code || "",
      ...(obj?.test_id && { test_id: obj.test_id }),
      ...(obj?.item_id && { item_id: obj.item_id }),
    };
    const updated = [...productList, newProduct];
    setProductList(updated);
    setFormData((p) => ({ ...p, item: JSON.stringify(updated) }));
    setSelectedItem("");
    setSelectedPrice("");
    setQuantity(1);
  };

  const deleteProduct = (idx) => {
    const updated = productList.filter((_, i) => i !== idx);
    setProductList(updated);
    setFormData((p) => ({ ...p, item: JSON.stringify(updated) }));
  };

  useEffect(() => {
    const total = productList.reduce(
      (s, i) => s + Number(i.price) * Number(i.quantity),
      0
    );
    setFormData((p) => ({ ...p, total, finalPrice: total }));
  }, [productList]);

  const handleReset = () => {
    setProductList([]);
    setSelectedItem("");
    setSelectedPrice("");
    setQuantity(1);
  };

  const validateForm = () => {
    if (!formData.uhid?.trim()) {
      alert("UHID is required!");
      return false;
    }
    if (!formData.doctor?.trim()) {
      alert("Doctor is required!");
      return false;
    }
    if (!productList.length) {
      alert("Please add at least one test!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      uhid: formData.uhid,
      ipNumber: formData.ipNumber,
      doctor: formData.doctor,
      bill_type: formData.bill_type || 16,
      billTypeNo: selectedBillTypeNo || "LAB01",
      referredBy: formData.referredBy,
      discountPercent: 0,
      discount: 0,
      discountRemarks: "",
      total: formData.total,
      finalPrice: formData.finalPrice,
      paymentMethod: "Credit",
      paymentStatus: "Pending",
      item: productList,
      is_emergency: !!formData.is_emergency,
      roomNo: formData.roomNo || "",
      age: formData.age || "",
      age_type: formData.age_type || "",
    };

    const res = await apiRequest(`${HMSURL}investBilling/`, "POST", payload);
    if (res.success) {
      const billNo = res.data?.investBillNo;
      alert("Lab bill generated successfully!");
      handleReset();
      setShowForm(false);
      fetchBilledItems(formData.ipNumber);

      if (billNo) {
        setPrintJob({
          bill: {
            ...formData,
            investBillNo: billNo,
            investBillDate: formData.investBillDate,
            item: productList,
          },
          isEstimate: false,
          toastMsg: "Lab bill generated successfully!",
        });
      }
    } else {
      alert(`Failed to save lab bill: ${res.error || "Unknown error"}`);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      {/* ── Top Bar ── */}
      <TopBar>
        <TopLeft>
          <BackBtn onClick={() => navigate("/SurgerySchedule")}>
            ← Back
          </BackBtn>
          <PageTitle>
            🧪 OT Lab Billing
            {formData.surgeryRef && (
              <SurgeryRefChip>🔗 {formData.surgeryRef}</SurgeryRefChip>
            )}
            {formData.is_emergency && (
              <EmergencyChip>⚡ EMERGENCY</EmergencyChip>
            )}
          </PageTitle>
        </TopLeft>

        <NavLinks>
          <NavButton onClick={() => navigate("/SurgerySchedule")}>
            📅 Surgery Schedule
          </NavButton>
          <NavButton onClick={() => navigate("/ViewBills")}>
            📄 View Bills
          </NavButton>
        </NavLinks>
      </TopBar>

      <div style={{ padding: "16px 20px" }}>
        {/* ── Patient Panel ── */}
        <PatientPanel>
          <PatientGrid>
            {[
              ["IP No", formData.ipNumber || "—"],
              ["UHID", formData.uhid || "—"],
              ["Name", formData.patientName || `${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "—"],
              ["Age", formData.age ? `${formData.age} ${formData.age_type || ""}` : "—"],
              ["Gender", formData.gender || "—"],
              ["Room / OT", formData.roomNo || "—"],
              ["Customer Type", formData.customer_type || "Credit"],
              ["Company", formData.company_name || "—"],
            ].map(([label, val]) => (
              <FieldBox key={label}>
                <FieldLabel>{label}</FieldLabel>
                <FieldValue title={val}>{val}</FieldValue>
              </FieldBox>
            ))}
          </PatientGrid>
        </PatientPanel>

        {/* ── Top Action Bar ── */}
        <TopActionBar>
          <HistoryTitle>
            📋 Billed Lab Items ({flattenedBilledItems.length})
          </HistoryTitle>

          <ActionBtnGroup>
            <OverallPrintBtn
              type="button"
              disabled={flattenedBilledItems.length === 0}
              onClick={() => setOverallPrintOpen(true)}
              title="Print consolidated statement of all billed items"
            >
              <Printer size={16} /> 🖨️ Overall Print
            </OverallPrintBtn>

            <PrimaryBtn
              type="button"
              onClick={() => setShowForm((prev) => !prev)}
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? "Close Form" : "New Lab Bill"}
            </PrimaryBtn>
          </ActionBtnGroup>
        </TopActionBar>

        {/* ── Collapsible Lab Billing Form ── */}
        {showForm && (
          <FormCard>
            <form onSubmit={handleSubmit}>
              <FormSectionHeader>
                📝 Create New Lab Bill (OT Credit)
              </FormSectionHeader>

              <FormGrid>
                <InputWrapper>
                  <InputLabel>Bill Date</InputLabel>
                  <StyledInput
                    type="date"
                    name="investBillDate"
                    value={formData.investBillDate}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, investBillDate: e.target.value }))
                    }
                  />
                </InputWrapper>

                <InputWrapper>
                  <InputLabel>Bill Time</InputLabel>
                  <StyledInput
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, time: e.target.value }))
                    }
                  />
                </InputWrapper>

                <InputWrapper>
                  <InputLabel $required>Bill Type</InputLabel>
                  <SearchableDropdown
                    value={formData.billType}
                    onChange={handleBillTypeChange}
                    options={billTypes.map((bt) => bt.bill_name)}
                    placeholder="Select bill type..."
                  />
                </InputWrapper>

                <InputWrapper>
                  <InputLabel $required>Doctor</InputLabel>
                  <SearchableDropdown
                    value={formData.doctor}
                    onChange={(value) =>
                      setFormData((p) => ({ ...p, doctor: value }))
                    }
                    options={[
                      { id: "SELF", name: "SELF" },
                      ...doctors.map((d) => ({
                        id: d.employeeId,
                        name: d.employeeName.trim(),
                      })),
                    ]}
                    displayKey="name"
                    valueKey="id"
                    placeholder="Select doctor..."
                  />
                </InputWrapper>

                <InputWrapper>
                  <InputLabel>Referred By</InputLabel>
                  <SearchableDropdown
                    value={formData.referredBy}
                    onChange={(value) =>
                      setFormData((p) => ({ ...p, referredBy: value }))
                    }
                    options={[
                      { id: "SELF", name: "SELF" },
                      ...doctors.map((d) => ({
                        id: d.employeeId,
                        name: d.employeeName.trim(),
                      })),
                    ]}
                    displayKey="name"
                    valueKey="id"
                    placeholder="Select doctor..."
                  />
                </InputWrapper>
              </FormGrid>

              {/* ── Test Selection ── */}
              <ItemSelectionRow>
                <InputWrapper>
                  <InputLabel $required>Select Lab Test</InputLabel>
                  <SearchableDropdown
                    value={selectedItem}
                    onChange={handleItemChange}
                    options={loadingItems ? [] : items.map((i) => i.itemName)}
                    placeholder={loadingItems ? "Loading tests..." : "Search & select test..."}
                    disabled={loadingItems}
                  />
                </InputWrapper>

                <InputWrapper>
                  <InputLabel $required>Quantity</InputLabel>
                  <QuantityControl>
                    <input
                      type="number"
                      value={quantity}
                      min="1"
                      onChange={(e) =>
                        setQuantity(Math.max(1, Number(e.target.value)))
                      }
                    />
                  </QuantityControl>
                </InputWrapper>

                <InputWrapper>
                  <InputLabel>Price (₹)</InputLabel>
                  <StyledInput
                    type="text"
                    value={selectedPrice ? `₹ ${selectedPrice}` : ""}
                    readOnly
                    placeholder="Auto-filled"
                    style={{ background: "#f8fafc", fontWeight: 600 }}
                  />
                </InputWrapper>

                <AddBtn type="button" onClick={addProduct}>
                  <Plus size={16} /> Add Test
                </AddBtn>
              </ItemSelectionRow>

              {/* ── Staged Items Table ── */}
              {productList.length > 0 ? (
                <StagedTable>
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Test Name</th>
                      <th style={{ width: 100, textAlign: "center" }}>Qty</th>
                      <th style={{ width: 130, textAlign: "right" }}>Amount</th>
                      <th style={{ width: 80, textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productList.map((p, i) => (
                      <tr key={i}>
                        <td style={{ textAlign: "center", color: "#64748b" }}>{i + 1}</td>
                        <td style={{ fontWeight: 600, color: colors.primary }}>
                          {p.itemName}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 700 }}>
                          {p.quantity}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>
                          ₹ {(p.price * p.quantity).toFixed(2)}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <DelBtn type="button" onClick={() => deleteProduct(i)}>
                            ✕ Remove
                          </DelBtn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </StagedTable>
              ) : (
                <div
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    color: colors.textMuted,
                    fontSize: "0.82rem",
                    background: "#f8fafc",
                    borderRadius: 6,
                    border: "1px dashed #cbd5e1",
                    marginBottom: 14,
                  }}
                >
                  🔬 No tests added to this bill yet. Select a test above and click "Add Test".
                </div>
              )}

              {/* ── Summary & Actions ── */}
              <SummaryBar>
                <SummaryTotalText>
                  Net Payable Amount:{" "}
                  <strong>₹ {Number(formData.finalPrice).toFixed(2)}</strong>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    (Payment: Credit)
                  </span>
                </SummaryTotalText>

                <FormActionRow>
                  <ResetBtn type="button" onClick={handleReset}>
                    Reset Form
                  </ResetBtn>
                  <SaveBtn type="submit">
                    💾 Save Lab Bill
                  </SaveBtn>
                </FormActionRow>
              </SummaryBar>
            </form>
          </FormCard>
        )}

        {/* ── Billed Items History Section ── */}
        <HistorySection>
          {/* KPI Cards */}
          <KpiBar>
            <KpiCard>
              <span>Total Bills</span>
              <strong>{enrichedBills.length} Bills</strong>
            </KpiCard>
            <KpiCard>
              <span>Total Tests Billed</span>
              <strong>{totalBilledQty} Tests</strong>
            </KpiCard>
            <KpiCard>
              <span>Settled / Credit</span>
              <strong>
                {
                  enrichedBills.filter(
                    (b) => b.paymentStatus === "Paid" || b.paymentMethod === "Credit"
                  ).length
                }{" "}
                Bills
              </strong>
            </KpiCard>
            <KpiCard>
              <span>Total Billed Amount</span>
              <strong style={{ color: "#16a34a" }}>
                ₹ {totalBilledAmount.toFixed(2)}
              </strong>
            </KpiCard>
          </KpiBar>

          {/* Table Search & Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: "0.82rem", color: colors.textMuted }}>
              Showing {filteredBills.length} of {enrichedBills.length} billed invoices ({totalBilledQty} tests total) for IP:{" "}
              <strong style={{ color: colors.primary }}>
                {formData.ipNumber || "N/A"}
              </strong>
            </div>

            <SearchInputWrap>
              <Search size={15} />
              <input
                type="text"
                placeholder="Search bill no, test, doctor..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
              />
            </SearchInputWrap>
          </div>

          {/* Table Displayed Per Bill Number */}
          <div style={{ overflowX: "auto" }}>
            <HistoryTable>
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: "center" }}>#</th>
                  <th>Bill No</th>
                  <th>Bill Date &amp; Time</th>
                  <th>Bill Type</th>
                  <th>Doctor</th>
                  <th style={{ minWidth: 260 }}>Billed Tests / Investigations</th>
                  <th style={{ textAlign: "center" }}>Tests</th>
                  <th style={{ textAlign: "right" }}>Total Amount (₹)</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingHistory ? (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: colors.textMuted,
                      }}
                    >
                      Loading billed invoices...
                    </td>
                  </tr>
                ) : filteredBills.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: colors.textMuted,
                      }}
                    >
                      {filterSearch
                        ? "No bills match your search filter."
                        : `No lab bills have been generated yet for IP ${formData.ipNumber || "this patient"}.`}
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill, idx) => (
                    <tr key={bill.id}>
                      <td style={{ textAlign: "center", color: "#64748b" }}>
                        {idx + 1}
                      </td>
                      <td style={{ fontWeight: 700, color: colors.primary }}>
                        {bill.investBillNo}
                      </td>
                      <td>{formatDateTime(bill.investBillDate)}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.74rem",
                            background: "#f1f5f9",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: 600,
                            color: "#475569",
                          }}
                        >
                          {bill.billType}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{bill.doctor}</td>
                      <td>
                        {/* List of tests in this bill */}
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "5px",
                            maxWidth: "420px",
                          }}
                        >
                          {bill.items.map((it, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: "0.74rem",
                                background: "#f0fdfa",
                                border: "1px solid #ccfbf1",
                                color: "#0f766e",
                                padding: "2px 8px",
                                borderRadius: "5px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>{it.itemName}</span>
                              {it.quantity > 1 && (
                                <span style={{ color: colors.orange, fontWeight: 700 }}>
                                  ×{it.quantity}
                                </span>
                              )}
                              <span style={{ color: "#64748b", fontSize: "0.7rem" }}>
                                (₹{it.price.toFixed(0)})
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>
                        {bill.items.length}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 700,
                          color: "#16a34a",
                        }}
                      >
                        ₹ {bill.billAmount.toFixed(2)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <StatusChip
                          $paid={
                            bill.paymentStatus === "Paid" ||
                            bill.paymentMethod === "Credit"
                          }
                        >
                          {bill.paymentMethod === "Credit"
                            ? "Credit"
                            : bill.paymentStatus || "Pending"}
                        </StatusChip>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <RowPrintBtn
                          type="button"
                          onClick={() =>
                            setPrintJob({
                              bill: bill.fullBill,
                              isEstimate: false,
                              toastMsg: `Printing Bill #${bill.investBillNo}`,
                            })
                          }
                          title={`Print Bill #${bill.investBillNo}`}
                        >
                          <Printer size={13} /> Print Bill
                        </RowPrintBtn>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </HistoryTable>
          </div>
        </HistorySection>
      </div>

      {/* ── Overall Consolidated Print Modal ── */}
      {overallPrintOpen && (
        <OTPrintModal
          title={`OT Lab Billing Statement - ${formData.ipNumber || "IP"}`}
          htmlGenerator={generateLabOverallPrintHtml}
          data={{
            patient: {
              name: formData.patientName || `${formData.firstName || ""} ${formData.lastName || ""}`.trim(),
              ipNo: formData.ipNumber,
              uhid: formData.uhid,
              age: formData.age ? `${formData.age} ${formData.age_type || ""}` : "",
              gender: formData.gender,
              doctor: formData._rawDoctor || formData.doctor,
              roomNo: formData.roomNo,
              surgeryRef: formData.surgeryRef,
              customerType: formData.customer_type,
            },
            billedItems: flattenedBilledItems,
            totalAmount: totalBilledAmount,
          }}
          onClose={() => setOverallPrintOpen(false)}
        />
      )}

      {/* ── Single Bill Print Modal (reusing standard Investigation PrintModal) ── */}
      {printJob && (
        <PrintModal
          bill={printJob.bill}
          doctors={doctors}
          isEstimate={printJob.isEstimate}
          toastMsg={printJob.toastMsg}
          onClose={() => setPrintJob(null)}
        />
      )}
    </PageWrapper>
  );
};

export default OTLabBilling;
