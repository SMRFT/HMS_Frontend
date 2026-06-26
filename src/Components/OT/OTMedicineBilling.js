import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Search, Plus, X, Package as PackageIcon, Eye } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";

// ─── GlobalStyles imports ─────────────────────────────────────────────────────
import {
  colors as globalColors,
  Container,
  Button,
  Label,
  Input,
  Select,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  NoResults,
} from "../GlobalStyles";

// ─── Color palette ────────────────────────────────────────────────────────────
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
  legPending: "#FFC107",
  legSubstituted: "#B366CC",
  legBilled: "#28A745",
  legCancelled: "#6C757D",
  legStopped: "#FA6680",
  legEmergency: "#DC3545",
  legInsurance: "#007BFF",
  legDischarge: "#48D1CC",
  legRegular: "#136A63",
  legProcessed: "#8b5edd",
  packageTag: "#1d4ed8",
};

// ─── Styled Components ────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${colors.background};
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: #ffffff;
  border-bottom: 1px solid ${colors.border};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
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
  font-size: 1rem;
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
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;
const ModalContainer = styled.div`
  background: ${colors.background};
  width: 96%;
  max-width: 1500px;
  height: 92vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  background: ${colors.primary};
  color: white;
  button {
    background: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }
`;
const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`;
const ContentBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const PatientPanel = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 15px 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
`;
const PatientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px 16px;
  @media (max-width: 1300px) {
    grid-template-columns: repeat(4, 2fr);
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
  font-size: 0.85rem;
  color: ${colors.textMain};
  min-height: 32px;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

const TopActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
`;
const RequestBtn = styled.button`
  background: ${colors.orange};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    transform 0.1s,
    background 0.2s;
  box-shadow: 0 4px 6px rgba(248, 140, 34, 0.2);
  &:hover {
    background: ${colors.orangeHover};
    transform: translateY(-1px);
  }
`;

const EditModeBanner = styled.div`
  background: #fffbeb;
  border: 1.5px solid #f59e0b;
  border-radius: 8px;
  padding: 10px 18px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #92400e;
`;

const PackageModeBanner = styled.div`
  background: #eff6ff;
  border: 1.5px solid #1d4ed8;
  border-radius: 8px;
  padding: 10px 18px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1d4ed8;
`;

const ClearPackageBtn = styled.button`
  background: white;
  border: 1px solid #1d4ed8;
  color: #1d4ed8;
  border-radius: 5px;
  padding: 4px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: #1d4ed8;
    color: white;
  }
`;

const RequestFormWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 0;
  border: 1px solid ${colors.border};
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 25px;
  background: ${colors.white};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
`;
const FormPanel = styled.div`
  padding: 24px;
  border-right: 1px solid ${colors.border};
`;
const SidePanel = styled.div`
  background: #fdfdfd;
  display: flex;
  flex-direction: column;
`;
const SidePanelHeader = styled.div`
  background: #f1f5f7;
  padding: 12px 20px;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${colors.dark};
  border-bottom: 1px solid ${colors.border};
  display: flex;
  justify-content: space-between;
`;
const SidePanelContent = styled.div`
  flex: 1;
  padding: 10px 20px;
  max-height: 500px;
  overflow-y: auto;
`;
const SidePanelFooter = styled.div`
  padding: 20px;
  border-top: 1px solid ${colors.border};
  background: #f9fbfc;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px 20px;
  margin-bottom: 20px;
`;
const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`;
const FormLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${colors.textMuted};
`;

const StyledInput = styled.input`
  border: 1px solid ${colors.border};
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(19, 106, 99, 0.1);
  }
`;
const StyledSelect = styled.select`
  border: 1px solid ${colors.border};
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9rem;
  width: 100%;
  background-color: white;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;
const AddBtn = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: ${colors.primaryDark};
  }
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;
const CancelBtn = styled.button`
  background: ${colors.textMuted};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-weight: 600;
  cursor: pointer;
`;

const TabsBar = styled.div`
  display: flex;
  gap: 15px;
  margin: 30px 0 15px 0;
  border-bottom: 2px solid ${colors.border};
  padding-bottom: 0;
`;
const Tab = styled.div`
  padding: 8px 25px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  color: ${(p) => (p.active ? colors.primary : colors.textMuted)};
  border-bottom: 3px solid ${(p) => (p.active ? colors.primary : "transparent")};
  margin-bottom: -2px;
  transition: all 0.2s;
  &:hover {
    color: ${colors.primary};
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  th {
    background: ${colors.headerBg};
    color: white;
    padding: 12px 15px;
    text-align: left;
    font-size: 0.8rem;
    font-weight: 600;
  }
  td {
    padding: 12px 15px;
    font-size: 0.88rem;
    border-bottom: 1px solid #edf2f4;
    color: ${colors.textMain};
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tbody tr:hover {
    background: #f8fafb;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 25px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid ${colors.border};
  flex-wrap: wrap;
`;
const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  background: ${(p) => p.color};
  color: white;
`;

// ─── Searchable Dropdown ──────────────────────────────────────────────────────
const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
`;
const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${colors.primary};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: 0 0 4px 4px;
`;
const DropdownItem = styled.li`
  padding: 10px 15px;
  font-size: 0.88rem;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  &:hover {
    background: ${colors.background};
    color: ${colors.primaryDark};
    font-weight: 600;
  }
`;

// Special "Select Package" row pinned at the top of the medicine-name dropdown
const PackageOptionItem = styled.li`
  padding: 10px 15px;
  font-size: 0.88rem;
  cursor: pointer;
  border-bottom: 2px solid ${colors.border};
  background: #f0f6ff;
  color: ${colors.packageTag};
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #e0edff;
  }
`;

const SearchableDropdown = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  displayKey = "name",
  valueKey = "id",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (value) {
      const sel = options.find((o) =>
        typeof o === "string" ? o === value : o[valueKey] === value,
      );
      if (sel) setSearchTerm(typeof sel === "string" ? sel : sel[displayKey]);
    } else {
      setSearchTerm("");
    }
  }, [value, options, displayKey, valueKey]);

  const filtered = options.filter((o) => {
    const txt = typeof o === "string" ? o : o[displayKey];
    return txt.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <SearchWrapper ref={wrapperRef}>
      <StyledInput
        type="text"
        value={searchTerm}
        placeholder={placeholder}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && filtered.length > 0 && (
        <DropdownList>
          {filtered.map((o, i) => (
            <DropdownItem
              key={i}
              onClick={() => {
                const val = typeof o === "string" ? o : o[valueKey];
                const txt = typeof o === "string" ? o : o[displayKey];
                onChange(val);
                setSearchTerm(txt);
                setIsOpen(false);
              }}
            >
              {typeof o === "string" ? o : o[displayKey]}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </SearchWrapper>
  );
};

// ─── Medicine Name field with integrated "Select Package" option ─────────────
// This wraps the medicine-name search input. Typing filters nothing on its own
// (the real search still happens through the existing Search button/modal) —
// this component only adds a dropdown affordance so the user can either:
//   1. keep typing to do a normal medicine search, or
//   2. click "📦 Select from Package" to switch into package mode.
const MedicineNameField = ({
  searchQuery,
  setSearchQuery,
  selectedDrug,
  setSelectedDrug,
  onOpenPackageList,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <SearchWrapper ref={wrapperRef}>
      <StyledInput
        type="text"
        disabled={disabled}
        placeholder="Search medicine (min 3 chars)..."
        value={selectedDrug ? selectedDrug.name : searchQuery}
        onChange={(e) => {
          if (selectedDrug) setSelectedDrug(null);
          setSearchQuery(e.target.value);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && !disabled && (
        <DropdownList>
          <PackageOptionItem
            onClick={() => {
              setIsOpen(false);
              onOpenPackageList();
            }}
          >
            <PackageIcon size={15} /> Select from Package
          </PackageOptionItem>
        </DropdownList>
      )}
    </SearchWrapper>
  );
};

// ─── View Medicines Modal (Eye icon in Request History) ──────────────────────
// Shows full medicine list with dosage/qty/route details for a single request.
const ViewMedicinesModal = ({ request, onClose }) => {
  if (!request) return null;
  const medicines = request.medicines || [];

  return (
    <ModalOverlay style={{ zIndex: 2100 }}>
      <ModalContainer
        style={{ width: "70%", height: "70%", maxWidth: "900px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <HeaderTitle>
            <Eye
              size={20}
              style={{ verticalAlign: "middle", marginRight: "8px" }}
            />
            Medicine Details
            {request.packageName && (
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  marginLeft: "12px",
                  background: "rgba(255,255,255,0.2)",
                  padding: "2px 10px",
                  borderRadius: "12px",
                }}
              >
                📦 {request.packageName}
              </span>
            )}
          </HeaderTitle>
          <button onClick={onClose}>×</button>
        </Header>
        <ContentBody>
          <div
            style={{
              marginBottom: "16px",
              fontSize: "0.85rem",
              color: colors.textMuted,
            }}
          >
            {request.reqDate} {request.reqTime} · Doctor:{" "}
            <strong style={{ color: colors.textMain }}>
              {request.doctorName || request.doctor || "-"}
            </strong>
          </div>
          {medicines.length > 0 ? (
            <div
              style={{
                overflowX: "auto",
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.88rem",
                }}
              >
                <thead>
                  <tr style={{ background: colors.headerBg, color: "#fff" }}>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      Medicine Name
                    </th>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      Dosage
                    </th>
                    <th style={{ padding: "10px", textAlign: "right" }}>
                      No. of Days
                    </th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Qty</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Dose</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      Route
                    </th>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      Remark
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((m, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: `1px solid ${colors.border}` }}
                    >
                      <td
                        style={{
                          padding: "10px",
                          fontWeight: 600,
                          color: colors.primary,
                        }}
                      >
                        {m.itemName || m.name}
                      </td>
                      <td style={{ padding: "10px" }}>{m.dosage || "-"}</td>
                      <td style={{ padding: "10px", textAlign: "right" }}>
                        {m.noOfDays || "-"}
                      </td>
                      <td style={{ padding: "10px", textAlign: "right" }}>
                        {m.qty}
                      </td>
                      <td style={{ padding: "10px" }}>
                        {m.dose ? `${m.dose} ${m.doseUnit || ""}`.trim() : "-"}
                      </td>
                      <td style={{ padding: "10px" }}>{m.route || "-"}</td>
                      <td
                        style={{
                          padding: "10px",
                          fontStyle: m.remark ? "italic" : "normal",
                          color: m.remark ? colors.orange : colors.textMuted,
                        }}
                      >
                        {m.remark || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: colors.textMuted,
              }}
            >
              No medicines found for this request.
            </div>
          )}
        </ContentBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OTMedicineBilling = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Patient data from navigation state ────────────────────────────────────
  const pd = location.state?.patientData || {};

  const resolvedPatient = {
    ipNo: pd.ipNumber || "-",
    uhid: pd.uhid || "-",
    name: pd.patient_name || pd.firstName || "Unknown Patient",
    age: pd.age || "-",
    gender: pd.gender || "-",
    admitting: "-",
    admittingDr: pd.admittingDoctor || "-",
    roomBed: `${pd.roomNo || "-"} | ${pd.bedNo || "-"}`,
    customerType: pd.customerType || pd.customer_type || "-",
    companyName: pd.companyName || pd.company_name || "-",
    surgeryRef: pd.surgeryRef || "",
    is_emergency: !!pd.is_emergency,
  };

  // ── State ─────────────────────────────────────────────────────────────────
  const [requests, setRequests] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  // ── Edit mode state ───────────────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState(null);

  // ── Package mode state ─────────────────────────────────────────────────────
  // selectedPackageId holds medPackage_id, which is sent as Package_id on save.
  // When set, the individual-medicine inputs are locked (package-only mode).
  const [packages, setPackages] = useState([]);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [selectedPackageName, setSelectedPackageName] = useState("");
  const [packageLoading, setPackageLoading] = useState(false);

  // ── View medicines modal (Eye icon in Request History) ────────────────────
  const [viewingRequest, setViewingRequest] = useState(null);

  // Fixed for OT: always IP pharmacy
  const pharmacyDept = "OLET001";
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [doctor, setDoctor] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [dosage, setDosage] = useState("");
  const [noOfDays, setNoOfDays] = useState("");
  const [qty, setQty] = useState("");
  const [dose, setDose] = useState("");
  const [doseUnit, setDoseUnit] = useState("");
  const [route, setRoute] = useState("");
  const [remark, setRemark] = useState("");
  const [dosageOptions, setDosageOptions] = useState([]);
  const [showDosageModal, setShowDosageModal] = useState(false);
  const [newDosageName, setNewDosageName] = useState("");

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchRequests();
    fetchDoctors();
    fetchDosages();
  }, []); // eslint-disable-line

  // Pre-fill admitting doctor from navigation state once doctors load
  useEffect(() => {
    if (!doctors.length || !pd.admittingDoctor) return;
    const match = doctors.find(
      (d) =>
        d.employeeId === pd.admittingDoctor ||
        d.employeeName === pd.admittingDoctor,
    );
    if (match) {
      setDoctor(match.employeeId);
      setDoctorName(match.employeeName);
    } else {
      setDoctor(pd.admittingDoctor);
    }
  }, [doctors, pd.admittingDoctor]); // eslint-disable-line

  // ── API calls ─────────────────────────────────────────────────────────────
  const fetchDosages = async () => {
    const res = await apiRequest(`${HmsBaseUrl}dosage_master/`, "GET");
    if (res.success) setDosageOptions(res.data?.data || []);
  };

  const handleSaveDosage = async () => {
    if (!newDosageName) return alert("Enter dosage name");
    const res = await apiRequest(`${HmsBaseUrl}dosage_master/`, "POST", {
      dosage_name: newDosageName,
    });
    if (res.success) {
      setNewDosageName("");
      setShowDosageModal(false);
      fetchDosages();
    }
  };

  const fetchRequests = async () => {
    const res = await apiRequest(
      `${HmsBaseUrl}get_ot_medicine_ward_requests/?uhid=${pd.uhid || ""}&ipNumber=${pd.ipNumber || ""}`,
      "GET",
    );
    if (res.success) setRequests(res.data?.data || []);
  };

  const fetchDoctors = async () => {
    const res = await apiRequest(
      `${HmsBaseUrl}doctor_list_diagnostics/`,
      "GET",
    );
    if (res.success) {
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setDoctors(list);
    }
  };

  // Fetch packages from hospital_medicine_package collection, scoped to this outlet
  const fetchPackages = async () => {
    const res = await apiRequest(
      `${HmsBaseUrl}get_medicine_packages/?outlet_code=${pharmacyDept}`,
      "GET",
    );
    const list = res.success
      ? Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : []
      : [];
    setPackages(list.filter((p) => p.is_active !== false));
  };

  const handleOpenPackageList = () => {
    setIsPackageModalOpen(true);
    fetchPackages();
  };

  // Look up the current price for a given item_id from stock,
  // since the package collection only stores item_id/item_name/qty.
  const lookupItemPrice = async (itemId, itemName) => {
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}get_ippharmacy_stock/?outlet_code=${pharmacyDept}&search=${encodeURIComponent(itemName)}`,
        "GET",
      );
      const list = res.success
        ? Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : []
        : [];
      const match = list.find((i) => i.item_id === itemId) || list[0];
      return match ? Number(match.mrp) || 0 : 0;
    } catch {
      return 0;
    }
  };

  // ── Selecting a package: pulls items+qty, looks up price per item,
  //     and REPLACES selectedMedicines (package-only mode) ─────────────────
  const handleSelectPackage = async (pkg) => {
    setPackageLoading(true);
    setIsPackageModalOpen(false);

    const items = pkg.items || [];
    const priced = await Promise.all(
      items.map(async (it) => {
        const price = await lookupItemPrice(it.item_id, it.item_name);
        return {
          item_id: it.item_id,
          itemName: it.item_name,
          qty: it.qty,
          price,
          // Other per-item fields are not applicable for package items —
          // sent as empty strings, matching backend setdefault() handling.
          noOfDays: "",
          dosage: "",
          dose: "",
          doseUnit: "",
          route: "",
          remark: "",
        };
      }),
    );

    setSelectedMedicines(priced);
    setSelectedPackageId(pkg.medPackage_id);
    setSelectedPackageName(pkg.medPackage_name);

    // Clear any in-progress single-medicine entry, since we're now in package mode
    resetDrugFields();
    setPackageLoading(false);
  };

  const handleClearPackage = () => {
    setSelectedPackageId(null);
    setSelectedPackageName("");
    setSelectedMedicines([]);
  };

  const handleMedicineSearch = async (val) => {
    if (val.length < 3) {
      setSearchResults([]);
      return;
    }
    const res = await apiRequest(
      `${HmsBaseUrl}get_ippharmacy_stock/?outlet_code=${pharmacyDept}&search=${val}`,
      "GET",
    );
    const list = res.success
      ? Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : []
      : [];
    setSearchResults(
      list
        .filter((i) => i.item_name?.toLowerCase().includes(val.toLowerCase()))
        .map((i) => ({
          id: `${i.item_id}_${i.batch_number}`,
          item_id: i.item_id,
          batch_number: i.batch_number,
          name: i.item_name,
          price: i.mrp,
          total_stock: i.total_stock || 0,
          expiry_date: i.expiry_date || "-",
        })),
    );
  };

  // Auto-calculate quantity
  useEffect(() => {
    if (dosage && noOfDays) {
      const times = dosage.includes("-")
        ? dosage.split("-").reduce((a, p) => a + (Number(p) || 0), 0)
        : Number(dosage) || 0;
      const days = Number(noOfDays) || 0;
      if (times > 0 && days > 0) setQty(times * days);
    }
  }, [dosage, noOfDays]);

  const handleAddMedicine = () => {
    if (selectedPackageId) return; // package-only mode: individual add disabled
    if (!selectedDrug) return alert("Select a drug from search.");
    if (!dosage) return alert("Enter Dosage.");
    if (!noOfDays) return alert("Enter No. of days.");
    if (!qty) return alert("Enter Quantity.");

    const newMed = {
      item_id: selectedDrug.item_id,
      itemName: selectedDrug.name,
      qty: Number(qty),
      price: selectedDrug.price,
      noOfDays,
      dosage,
      dose,
      doseUnit,
      route,
      remark,
    };
    setSelectedMedicines((p) => [...p, newMed]);
    resetDrugFields();
  };

  // Reset only the drug-input fields, not doctor or edit state
  const resetDrugFields = () => {
    setSelectedDrug(null);
    setNoOfDays("");
    setQty("");
    setDose("");
    setDoseUnit("");
    setRoute("");
    setRemark("");
    setDosage("");
    setSearchQuery("");
  };

  // Full reset including edit state — used when closing the form
  const resetForm = () => {
    resetDrugFields();
    setEditMode(false);
    setEditingRequestId(null);
    setSelectedMedicines([]);
    setSelectedPackageId(null);
    setSelectedPackageName("");
  };

  // ── Open Edit: pre-fill form with existing request data ──────────────────
  const openEditModal = (req) => {
    // Pre-fill doctor
    const match = doctors.find(
      (d) =>
        d.employeeId === req.doctor_id ||
        d.employeeName === (req.doctorName || req.doctor),
    );
    setDoctor(match ? match.employeeId : req.doctor_id || "");
    setDoctorName(
      match ? match.employeeName : req.doctorName || req.doctor || "",
    );

    // Pre-fill medicines into selectedMedicines
    const prefilled = (req.medicines || []).map((m) => ({
      item_id: m.item_id,
      itemName: m.itemName || m.name,
      qty: m.qty,
      price: m.price || 0,
      noOfDays: m.noOfDays || "",
      dosage: m.dosage || "",
      dose: m.dose || "",
      doseUnit: m.doseUnit || "",
      route: m.route || "",
      remark: m.remark || "",
    }));

    setSelectedMedicines(prefilled);

    // Pre-fill package info if this request originated from a package
    if (req.Package_id || req.package_id) {
      setSelectedPackageId(req.Package_id || req.package_id);
      setSelectedPackageName(req.packageName || req.package_name || "");
    } else {
      setSelectedPackageId(null);
      setSelectedPackageName("");
    }

    setEditMode(true);
    setEditingRequestId(req.bill_id || req.bill_id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMarkReceived = async (req) => {
    if (!window.confirm("Mark this request as Received?")) return;
    const res = await apiRequest(
      `${HmsBaseUrl}mark_ot_medicine_received/`,
      "PUT",
      { bill_id: req.bill_id },
    );
    if (res.success) {
      alert("Marked as received successfully");
      fetchRequests();
    } else {
      alert(res.error || res.message || "Failed to mark as received");
    }
  };

  const handleDelete = async (req) => {
    if (!window.confirm("Are you sure you want to delete this ward request?"))
      return;

    const res = await apiRequest(
      `${HmsBaseUrl}delete_ot_medicine_ward_request/`,
      "PUT",
      { bill_id: req.bill_id || req.Bill_id },
    );

    if (res.success) {
      alert("Ward request deleted successfully");
      fetchRequests();
    } else {
      alert(res.error || res.message || "Delete failed");
    }
  };

  // ── Confirm: create new OR update existing ────────────────────────────────
  const handleConfirm = async () => {
    if (!selectedMedicines.length) return alert("No medicines added.");

    const total = selectedMedicines.reduce(
      (a, m) => a + (Number(m.price) || 0) * (Number(m.qty) || 0),
      0,
    );

    if (editMode) {
      // UPDATE existing request
      const payload = {
        bill_id: editingRequestId,
        medicine_particulars: selectedMedicines,
        total_amount: total,
        doctor_id: doctor,
        Package_id: selectedPackageId || "",
      };
      const res = await apiRequest(
        `${HmsBaseUrl}update_ot_medicine_ward_request/`,
        "PUT",
        payload,
      );
      if (res.success) {
        alert("Request updated successfully");
        resetForm();
        setShowForm(false);
        fetchRequests();
      } else {
        alert(res.error || "Update failed");
      }
    } else {
      // CREATE new request
      const payload = {
        uhid: resolvedPatient.uhid,
        ipNumber: resolvedPatient.ipNo,
        patient_name: resolvedPatient.name,
        wardName: resolvedPatient.roomBed?.split("|")[0].trim() || "-",
        medicine_particulars: selectedMedicines,
        total_amount: total,
        doctor_id: doctor,
        surgeryRef: resolvedPatient.surgeryRef,
        Package_id: selectedPackageId || "",
      };
      const res = await apiRequest(
        `${HmsBaseUrl}save_ot_medicine_ward_request/`,
        "POST",
        payload,
      );
      if (res.success) {
        alert("Ward Request saved successfully");
        resetForm();
        setShowForm(false);
        fetchRequests();
      }
    }
  };

  const removeSelectedMed = (i) => {
    // Removing an item from a package-derived list breaks the 1:1 package
    // mapping, so drop the package association — the rest of the items
    // stay in the list as plain medicines.
    if (selectedPackageId) {
      setSelectedPackageId(null);
      setSelectedPackageName("");
    }
    setSelectedMedicines((p) => p.filter((_, idx) => idx !== i));
  };

  const getStatusColor = (status) => {
    if (status === "Pending") return colors.legPending;
    if (status === "Processed") return colors.legProcessed;
    if (status === "Cancelled") return colors.legCancelled;
    if (status === "Billed") return colors.legBilled;
    return colors.legRegular;
  };

  // Add this alongside getStatusColor:
  const getDispatchColor = (isDispatched) =>
    isDispatched ? "#136A63" : "#F88C22"; // green = Dispatched, orange = Pending

  // ── Handle toggle form button ─────────────────────────────────────────────
  const handleToggleForm = () => {
    if (showForm) {
      setShowForm(false);
      resetForm();
    } else {
      setEditMode(false);
      setShowForm(true);
    }
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>← Back</BackBtn>
        <PageTitle>
          💊 OT Medicine Request
          {resolvedPatient.surgeryRef && (
            <SurgeryRefChip>🔗 {resolvedPatient.surgeryRef}</SurgeryRefChip>
          )}
          {resolvedPatient.is_emergency && (
            <EmergencyChip>⚡ EMERGENCY</EmergencyChip>
          )}
        </PageTitle>
      </TopBar>

      <div style={{ padding: "20px" }}>
        {/* ── Patient panel ─────────────────────────────────────────────── */}
        <PatientPanel>
          <PatientGrid>
            <FieldBox>
              <FieldLabel>IP No</FieldLabel>
              <FieldValue>{resolvedPatient.ipNo}</FieldValue>
            </FieldBox>
            <FieldBox>
              <FieldLabel>UHID</FieldLabel>
              <FieldValue>{resolvedPatient.uhid}</FieldValue>
            </FieldBox>
            <FieldBox>
              <FieldLabel>Name</FieldLabel>
              <FieldValue>{resolvedPatient.name}</FieldValue>
            </FieldBox>
            <FieldBox>
              <FieldLabel>Age</FieldLabel>
              <FieldValue>{resolvedPatient.age}</FieldValue>
            </FieldBox>
            <FieldBox>
              <FieldLabel>Gender</FieldLabel>
              <FieldValue>{resolvedPatient.gender}</FieldValue>
            </FieldBox>
            <FieldBox>
              <FieldLabel>Admitting Dr</FieldLabel>
              <FieldValue>{resolvedPatient.admittingDr}</FieldValue>
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
              <FieldLabel>Company</FieldLabel>
              <FieldValue>{resolvedPatient.companyName}</FieldValue>
            </FieldBox>
          </PatientGrid>
        </PatientPanel>

        {/* ── New / Edit Request toggle ─────────────────────────────────── */}
        <TopActionBar>
          <RequestBtn onClick={handleToggleForm}>
            {showForm
              ? "✕ Close Form"
              : editMode
                ? "✏️ Edit Medicine Request"
                : "＋ New Medicine Request"}
          </RequestBtn>
        </TopActionBar>

        {/* ── Request Form ──────────────────────────────────────────────── */}
        {showForm && (
          <>
            {/* Edit mode banner */}
            {editMode && (
              <EditModeBanner>
                ✏️ You are editing an existing request. Modify the medicines in
                the panel on the right, then click{" "}
                <strong>Update Request</strong> to save.
              </EditModeBanner>
            )}

            {/* Package mode banner */}
            {selectedPackageId && (
              <PackageModeBanner>
                <span>
                  📦 Package selected: <strong>{selectedPackageName}</strong>{" "}
                  (ID: {selectedPackageId}). Individual medicine entry is
                  disabled while a package is active.
                </span>
                <ClearPackageBtn onClick={handleClearPackage}>
                  ✕ Clear Package
                </ClearPackageBtn>
              </PackageModeBanner>
            )}

            <RequestFormWrapper>
              <FormPanel>
                <FormGrid>
                  {/* Bill Type — fixed, read-only */}
                  <FormItem>
                    <FormLabel>Medicine Bill Type</FormLabel>
                    <StyledInput
                      value="IP Pharmacy (Credit)"
                      readOnly
                      style={{
                        background: "#f1f5f7",
                        color: colors.primary,
                        fontWeight: 700,
                      }}
                    />
                  </FormItem>

                  {/* Medicine Name search + Select-Package option */}
                  <FormItem style={{ gridColumn: "span 2" }}>
                    <FormLabel>
                      Medicine Name{" "}
                      {editMode && (
                        <span
                          style={{
                            color: colors.orange,
                            fontStyle: "italic",
                            fontWeight: 400,
                          }}
                        >
                          (search to add more medicines)
                        </span>
                      )}
                    </FormLabel>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <MedicineNameField
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          selectedDrug={selectedDrug}
                          setSelectedDrug={setSelectedDrug}
                          onOpenPackageList={handleOpenPackageList}
                          disabled={!!selectedPackageId}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={!!selectedPackageId}
                        onClick={() => {
                          if (searchQuery.length > 2) {
                            setIsSearchModalOpen(true);
                            handleMedicineSearch(searchQuery);
                          } else alert("Enter at least 3 characters.");
                        }}
                        style={{
                          background: selectedPackageId
                            ? "#cbd5e1"
                            : colors.primary,
                          color: "white",
                          padding: "0 16px",
                          borderRadius: "4px",
                          border: "none",
                          cursor: selectedPackageId ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "14px",
                        }}
                      >
                        <Search size={16} /> Search
                      </button>
                    </div>
                  </FormItem>

                  {/* Doctor */}
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <SearchableDropdown
                      value={doctor}
                      onChange={(val) => {
                        setDoctor(val);
                        const d = doctors.find((x) => x.employeeId === val);
                        if (d) setDoctorName(d.employeeName);
                      }}
                      options={doctors.map((d) => ({
                        id: d.employeeId,
                        name: d.employeeName,
                      }))}
                    />
                  </FormItem>

                  {/* Dosage */}
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <StyledSelect
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        disabled={!!selectedPackageId}
                        style={{ flex: 1 }}
                      >
                        <option value="">Select Dosage</option>
                        <option value="1-0-0">1-0-0 (Morning)</option>
                        <option value="0-1-0">0-1-0 (Noon)</option>
                        <option value="0-0-1">0-0-1 (Night)</option>
                        <option value="1-0-1">1-0-1 (Morn-Night)</option>
                        <option value="1-1-1">1-1-1 (Thrice)</option>
                        {dosageOptions.map((o, i) => (
                          <option key={i} value={o.dosage_name}>
                            {o.dosage_name}
                          </option>
                        ))}
                      </StyledSelect>
                      <button
                        type="button"
                        disabled={!!selectedPackageId}
                        onClick={() => setShowDosageModal(true)}
                        style={{
                          background: selectedPackageId
                            ? "#cbd5e1"
                            : colors.primary,
                          color: "white",
                          width: "38px",
                          height: "38px",
                          borderRadius: "4px",
                          border: "none",
                          cursor: selectedPackageId ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </FormItem>

                  <FormItem>
                    <FormLabel>No. of Days</FormLabel>
                    <StyledInput
                      type="number"
                      value={noOfDays}
                      disabled={!!selectedPackageId}
                      onChange={(e) => setNoOfDays(e.target.value)}
                    />
                  </FormItem>
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <StyledInput
                      type="number"
                      value={qty}
                      disabled={!!selectedPackageId}
                      onChange={(e) => setQty(e.target.value)}
                    />
                  </FormItem>
                  <FormItem>
                    <FormLabel>Dose</FormLabel>
                    <StyledInput
                      value={dose}
                      disabled={!!selectedPackageId}
                      onChange={(e) => setDose(e.target.value)}
                    />
                  </FormItem>
                  <FormItem>
                    <FormLabel>Dose Unit</FormLabel>
                    <StyledSelect
                      value={doseUnit}
                      disabled={!!selectedPackageId}
                      onChange={(e) => setDoseUnit(e.target.value)}
                    >
                      <option value="">Select Unit</option>
                      <option value="mg">mg</option>
                      <option value="ml">ml</option>
                      <option value="tab">Tablet</option>
                      <option value="cap">Capsule</option>
                    </StyledSelect>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Route</FormLabel>
                    <StyledInput
                      value={route}
                      disabled={!!selectedPackageId}
                      onChange={(e) => setRoute(e.target.value)}
                    />
                  </FormItem>
                </FormGrid>

                <FormItem style={{ marginBottom: "20px" }}>
                  <FormLabel>Remark</FormLabel>
                  <StyledInput
                    value={remark}
                    disabled={!!selectedPackageId}
                    onChange={(e) => setRemark(e.target.value)}
                  />
                </FormItem>

                <ActionButtons>
                  <CancelBtn onClick={resetDrugFields}>✕ Reset</CancelBtn>
                  <AddBtn
                    disabled={!!selectedPackageId}
                    onClick={handleAddMedicine}
                  >
                    ＋ Add Medicine
                  </AddBtn>
                </ActionButtons>
              </FormPanel>

              {/* ── Side panel ──────────────────────────────────────────── */}
              <SidePanel>
                <SidePanelHeader>
                  {selectedPackageId
                    ? "📦 Package Items"
                    : editMode
                      ? "✏️ Editing Medicines"
                      : "Selected Items"}{" "}
                  ({selectedMedicines.length})
                </SidePanelHeader>
                <SidePanelContent>
                  {packageLoading ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: colors.textMuted,
                        marginTop: "40px",
                        fontSize: "0.85rem",
                      }}
                    >
                      Loading package items...
                    </div>
                  ) : selectedMedicines.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: colors.textMuted,
                        marginTop: "40px",
                        fontSize: "0.85rem",
                      }}
                    >
                      {editMode
                        ? "All medicines removed. Add new ones using the form."
                        : "No medicines added yet."}
                    </div>
                  ) : (
                    selectedMedicines.map((m, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "12px 0",
                          borderBottom: "1px solid #F0F0F0",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            color: colors.primary,
                            paddingRight: "24px",
                          }}
                        >
                          {m.itemName}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: colors.textMuted,
                            marginTop: "4px",
                          }}
                        >
                          {selectedPackageId ? (
                            <>Qty: {m.qty}</>
                          ) : (
                            <>
                              {m.dosage} | {m.noOfDays} Days | Qty: {m.qty}
                              {m.route && ` | ${m.route}`}
                            </>
                          )}
                        </div>
                        {m.remark && (
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: colors.orange,
                              marginTop: "2px",
                              fontStyle: "italic",
                            }}
                          >
                            Remark: {m.remark}
                          </div>
                        )}
                        <button
                          onClick={() => removeSelectedMed(i)}
                          style={{
                            position: "absolute",
                            right: "0",
                            top: "12px",
                            background: "none",
                            border: "none",
                            color: "#e53935",
                            cursor: "pointer",
                            fontSize: "1rem",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </SidePanelContent>
                <SidePanelFooter>
                  <AddBtn
                    style={{ width: "100%", padding: "12px" }}
                    onClick={handleConfirm}
                  >
                    {editMode ? "💾 Update Request" : "✅ Confirm Request"}
                  </AddBtn>
                </SidePanelFooter>
              </SidePanel>
            </RequestFormWrapper>
          </>
        )}

        {/* ── Request History ───────────────────────────────────────────── */}
        <TabsBar>
          <Tab active={true}>Request History</Tab>
        </TabsBar>

        <StyledTable>
          <thead>
            <tr>
              <th>Req Date & Time</th>
              <th>Medicine Details</th>
              <th>Raised From</th>
              <th>Doctor</th>
              <th>Bill Name</th>
              <th>Dispatch Status</th>
              <th>Payment Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: colors.textMuted,
                  }}
                >
                  No request history found.
                </td>
              </tr>
            ) : (
              requests.map((req, i) => (
                <tr key={i}>
                  <td>
                    {req.reqDate} {req.reqTime}
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <button
                        title="View medicine details"
                        onClick={() => setViewingRequest(req)}
                        style={{
                          background: "none",
                          border: "none",
                          color: colors.primary,
                          cursor: "pointer",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>

                  <td>{req.wardName || ""}</td>
                  <td>{req.doctorName || req.doctor}</td>
                  <td>{req.billName}</td>
                  {/* Dispatch Status */}
                  <td>
                    <LegendItem color={getDispatchColor(req.is_dispatched)}>
                      {req.is_dispatched ? "Dispatched" : "Pending"}
                    </LegendItem>
                  </td>

                  {/* Payment Status */}
                  <td>
                    <LegendItem
                      color={getStatusColor(req.billingStatus || "Pending")}
                    >
                      {req.billingStatus || "Pending"}
                    </LegendItem>
                  </td>

                  {/* Action */}
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        disabled={
                          (req.billingStatus || "Pending") !== "Pending"
                        }
                        onClick={() => openEditModal(req)}
                        style={{
                          background:
                            (req.billingStatus || "Pending") === "Pending"
                              ? colors.primary
                              : "#cbd5e1",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          padding: "5px 12px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor:
                            (req.billingStatus || "Pending") === "Pending"
                              ? "pointer"
                              : "not-allowed",
                          opacity:
                            (req.billingStatus || "Pending") === "Pending"
                              ? 1
                              : 0.5,
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        disabled={
                          (req.billingStatus || "Pending") !== "Pending"
                        }
                        onClick={() => handleDelete(req)}
                        style={{
                          background:
                            (req.billingStatus || "Pending") === "Pending"
                              ? "#e53935"
                              : "#cbd5e1",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          padding: "5px 12px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor:
                            (req.billingStatus || "Pending") === "Pending"
                              ? "pointer"
                              : "not-allowed",
                          opacity:
                            (req.billingStatus || "Pending") === "Pending"
                              ? 1
                              : 0.5,
                        }}
                      >
                        🗑️ Delete
                      </button>

                      {/* Received checkbox — only visible when dispatched and not yet received */}
                      {req.is_dispatched && !req.is_received && (
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            color: colors.primary,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                          title="Mark as Received"
                        >
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() => handleMarkReceived(req)}
                            style={{
                              cursor: "pointer",
                              accentColor: colors.primary,
                            }}
                          />
                          Received
                        </label>
                      )}

                      {/* Already received — show read-only tick */}
                      {req.is_dispatched && req.is_received && (
                        <span
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            color: colors.legBilled,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          ✅ Received
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </StyledTable>

        <LegendContainer>
          <LegendItem color={colors.legPending}>Pending</LegendItem>
          <LegendItem color={colors.legSubstituted}>Substituted</LegendItem>
          <LegendItem color={colors.legBilled}>Billed</LegendItem>
          <LegendItem color={colors.legCancelled}>Cancelled</LegendItem>
          <LegendItem color={colors.legStopped}>Stopped</LegendItem>
          <LegendItem color={colors.legEmergency}>Emergency</LegendItem>
          <LegendItem color={colors.legInsurance}>Insurance Item</LegendItem>
          <LegendItem color={colors.legDischarge}>Discharge Med</LegendItem>
          <LegendItem color={colors.legRegular}>Regular Med</LegendItem>
          <LegendItem color={colors.legProcessed}>Processed</LegendItem>
        </LegendContainer>
      </div>

      {/* ── Medicine Search Modal ─────────────────────────────────────────── */}
      {isSearchModalOpen && (
        <ModalOverlay style={{ zIndex: 2000 }}>
          <ModalContainer
            style={{ width: "80%", height: "80%", maxWidth: "1000px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <HeaderTitle>Select Medicine ({pharmacyDept})</HeaderTitle>
              <button onClick={() => setIsSearchModalOpen(false)}>×</button>
            </Header>
            <ContentBody>
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "16px" }}
              >
                <StyledInput
                  style={{ flex: 1 }}
                  placeholder="Search again..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.length > 2)
                      handleMedicineSearch(searchQuery);
                  }}
                />
                <button
                  onClick={() => {
                    if (searchQuery.length > 2)
                      handleMedicineSearch(searchQuery);
                  }}
                  style={{
                    background: colors.primary,
                    color: "white",
                    padding: "0 16px",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "14px",
                  }}
                >
                  <Search size={16} /> Search
                </button>
              </div>
              {searchResults.length > 0 ? (
                <div
                  style={{
                    overflowX: "auto",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.9rem",
                    }}
                  >
                    <thead>
                      <tr
                        style={{ background: colors.headerBg, color: "#fff" }}
                      >
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Item Name
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Batch No
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Expiry
                        </th>
                        <th style={{ padding: "10px", textAlign: "right" }}>
                          MRP (₹)
                        </th>
                        <th style={{ padding: "10px", textAlign: "right" }}>
                          Stock
                        </th>
                        <th style={{ padding: "10px", textAlign: "center" }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((item, i) => (
                        <tr
                          key={i}
                          style={{ borderBottom: `1px solid ${colors.border}` }}
                        >
                          <td style={{ padding: "10px" }}>{item.name}</td>
                          <td style={{ padding: "10px" }}>
                            {item.batch_number}
                          </td>
                          <td style={{ padding: "10px" }}>
                            {item.expiry_date && item.expiry_date !== "-"
                              ? new Date(item.expiry_date).toLocaleDateString()
                              : "-"}
                          </td>
                          <td style={{ padding: "10px", textAlign: "right" }}>
                            {Number(item.price).toFixed(2)}
                          </td>
                          <td style={{ padding: "10px", textAlign: "right" }}>
                            {item.total_stock}
                          </td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <button
                              style={{
                                background: colors.primary,
                                color: "white",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setSelectedDrug(item);
                                setIsSearchModalOpen(false);
                              }}
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: colors.textMuted,
                  }}
                >
                  No stock found matching your search in {pharmacyDept}.
                </div>
              )}
            </ContentBody>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* ── Medicine Package Selection Modal ──────────────────────────────── */}
      {/* Rendered as a simple list of medPackage_name rows, not cards. */}
      {isPackageModalOpen && (
        <ModalOverlay style={{ zIndex: 2000 }}>
          <ModalContainer
            style={{ width: "60%", height: "75%", maxWidth: "700px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <HeaderTitle>
                <PackageIcon
                  size={20}
                  style={{ verticalAlign: "middle", marginRight: "8px" }}
                />
                Select Medicine Package ({pharmacyDept})
              </HeaderTitle>
              <button onClick={() => setIsPackageModalOpen(false)}>×</button>
            </Header>
            <ContentBody style={{ padding: 0 }}>
              {packages.length > 0 ? (
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                  }}
                >
                  {packages.map((pkg, idx) => (
                    <li
                      key={pkg.medPackage_id}
                      onClick={() => handleSelectPackage(pkg)}
                      style={{
                        padding: "14px 25px",
                        cursor: "pointer",
                        borderBottom:
                          idx < packages.length - 1
                            ? `1px solid ${colors.border}`
                            : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "white",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.background;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <PackageIcon size={16} color={colors.primary} />
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "0.92rem",
                            color: colors.primary,
                          }}
                        >
                          {pkg.medPackage_name}
                        </span>
                      </div>
                      <span
                        style={{ fontSize: "0.78rem", color: colors.textMuted }}
                      >
                        {(pkg.items || []).length} items
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: colors.textMuted,
                  }}
                >
                  No medicine packages found for {pharmacyDept}.
                </div>
              )}
            </ContentBody>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* ── View Medicines Modal (Eye icon, Request History) ──────────────── */}
      {viewingRequest && (
        <ViewMedicinesModal
          request={viewingRequest}
          onClose={() => setViewingRequest(null)}
        />
      )}

      {/* ── Add Dosage Modal ──────────────────────────────────────────────── */}
      {showDosageModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0 }}>Add New Dosage</h3>
              <X
                size={20}
                style={{ cursor: "pointer" }}
                onClick={() => setShowDosageModal(false)}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Dosage Name (e.g. 1-1-1)
              </label>
              <input
                value={newDosageName}
                onChange={(e) => setNewDosageName(e.target.value)}
                placeholder="Enter dosage..."
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowDosageModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDosage}
                style={{
                  background: colors.primary,
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Save Dosage
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default OTMedicineBilling;
