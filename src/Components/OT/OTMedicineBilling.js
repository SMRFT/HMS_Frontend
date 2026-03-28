import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Search, Plus, X } from "lucide-react";
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

// ─── Color palette (matches MedicineWardRequest) ──────────────────────────────
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
};

// ─── Page wrapper ─────────────────────────────────────────────────────────────
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

// ─── Styled Components (verbatim from MedicineWardRequest) ────────────────────
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

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${colors.textMain};
  cursor: pointer;
  user-select: none;
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
  const [billTypeOptions, setBillTypeOptions] = useState([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [pharmacyDept, setPharmacyDept] = useState("OP001");
  const [billTypeNo, setBillTypeNo] = useState("42");
  const [billtype, setBilltype] = useState("42");
  const [billTypeName, setBillTypeName] = useState("PHARMACY OP BILL (SH)");
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
  const [isRegular, setIsRegular] = useState(true);
  const [isDischarge, setIsDischarge] = useState(false);
  const [dosageOptions, setDosageOptions] = useState([]);
  const [showDosageModal, setShowDosageModal] = useState(false);
  const [newDosageName, setNewDosageName] = useState("");

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchRequests();
    fetchDoctors();
    fetchBillTypes();
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

  const fetchBillTypes = async () => {
    const res = await apiRequest(`${HmsBaseUrl}bill-types/`, "GET");
    if (res.success || res.records) {
      const list =
        res.records ||
        res.data?.billTypes ||
        (Array.isArray(res.data) ? res.data : []);
      setBillTypeOptions(list);
      if (list.length > 0) {
        const opt = list[0];
        setBillTypeNo(opt.billTypeNo);
        setBilltype(opt.bill_type);
        setBillTypeName(opt.bill_name);
        setPharmacyDept(
          opt.bill_name?.toLowerCase().includes("ip") ? "IP001" : "OP001",
        );
      }
    }
  };

  const fetchRequests = async () => {
    const res = await apiRequest(
      `${HmsBaseUrl}get_medicine_ward_requests/?uhid=${pd.uhid || ""}&ipNumber=${pd.ipNumber || ""}`,
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

  const handleMedicineSearch = async (val) => {
    if (val.length < 3) {
      setSearchResults([]);
      return;
    }
    const res = await apiRequest(
      `${HmsBaseUrl}get_oppharmacy_stock/?department_code=${pharmacyDept}`,
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
    if (!selectedDrug) return alert("Select a drug from search.");
    if (!billtype) return alert("Select Medicine Bill Type.");
    if (!dosage) return alert("Enter Dosage.");
    if (!noOfDays) return alert("Enter No. of days.");
    if (!qty) return alert("Enter Quantity.");

    const newMed = {
      item_id: selectedDrug.item_id,
      itemName: selectedDrug.name,
      qty: Number(qty),
      quantity: Number(qty),
      price: selectedDrug.price,
      noOfDays,
      dosage,
    };
    setSelectedMedicines((p) => [...p, newMed]);
    resetForm();
  };

  const resetForm = () => {
    setSelectedDrug(null);
    setNoOfDays("");
    setQty("");
    setDose("");
    setRoute("");
    setRemark("");
    setSearchQuery("");
  };

  const handleConfirm = async () => {
    if (!selectedMedicines.length) return alert("No medicines added.");
    const payload = {
      uhid: resolvedPatient.uhid,
      ipNumber: resolvedPatient.ipNo,
      patient_name: resolvedPatient.name,
      bill_type: billtype,
      billTypeNo,
      billTypeName,
      wardName: resolvedPatient.roomBed?.split("|")[0].trim() || "-",
      medicine_particulars: selectedMedicines,
      total_amount: selectedMedicines.reduce(
        (a, m) => a + (m.price || 0) * m.quantity,
        0,
      ),
      doctor: doctorName,
      doctor_id: doctor,
      billing_status: "Ward Request",
      billing_mode: "WARD REQUEST",
      surgeryRef: resolvedPatient.surgeryRef,
    };
    const res = await apiRequest(
      `${HmsBaseUrl}save_ot_medicine_ward_request/`,
      "POST",
      payload,
    );
    if (res.success) {
      alert("Ward Request saved successfully");
      setSelectedMedicines([]);
      fetchRequests();
    }
  };

  const removeSelectedMed = (i) =>
    setSelectedMedicines((p) => p.filter((_, idx) => idx !== i));

  const getStatusColor = (status) => {
    if (status === "Pending") return colors.legPending;
    if (status === "Cancelled") return colors.legCancelled;
    if (status === "Billed") return colors.legBilled;
    return colors.legRegular;
  };

  // ── JSX ───────────────────────────────────────────────────────────────────
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

        {/* ── New Request toggle ────────────────────────────────────────── */}
        <TopActionBar>
          <RequestBtn onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Close Form" : "＋ New Medicine Request"}
          </RequestBtn>
        </TopActionBar>

        {/* ── Request Form ──────────────────────────────────────────────── */}
        {showForm && (
          <RequestFormWrapper>
            <FormPanel>
              <FormGrid>
                {/* Bill Type */}
                <FormItem>
                  <FormLabel>Medicine Bill Type</FormLabel>
                  <SearchableDropdown
                    value={billTypeNo}
                    onChange={(val) => {
                      const opt = billTypeOptions.find(
                        (o) => String(o.billTypeNo) === String(val),
                      );
                      if (opt) {
                        setBillTypeNo(val);
                        setBilltype(opt.bill_type);
                        setBillTypeName(opt.bill_name);
                        setPharmacyDept(
                          opt.bill_name?.toLowerCase().includes("ip")
                            ? "IP001"
                            : "OP001",
                        );
                        setSearchResults([]);
                        setSelectedDrug(null);
                        setSearchQuery("");
                      }
                    }}
                    options={billTypeOptions.map((o) => ({
                      id: o.billTypeNo,
                      name: o.bill_name,
                    }))}
                  />
                </FormItem>

                {/* Medicine Name search */}
                <FormItem style={{ gridColumn: "span 2" }}>
                  <FormLabel>Medicine Name</FormLabel>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <StyledInput
                      style={{ flex: 1 }}
                      placeholder="Search medicine (min 3 chars)..."
                      value={selectedDrug ? selectedDrug.name : searchQuery}
                      onChange={(e) => {
                        if (selectedDrug) setSelectedDrug(null);
                        setSearchQuery(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery.length > 2) {
                          setIsSearchModalOpen(true);
                          handleMedicineSearch(searchQuery);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (searchQuery.length > 2) {
                          setIsSearchModalOpen(true);
                          handleMedicineSearch(searchQuery);
                        } else alert("Enter at least 3 characters.");
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
                      onClick={() => setShowDosageModal(true)}
                      style={{
                        background: colors.primary,
                        color: "white",
                        width: "38px",
                        height: "38px",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
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
                    onChange={(e) => setNoOfDays(e.target.value)}
                  />
                </FormItem>
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <StyledInput
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  />
                </FormItem>
                <FormItem>
                  <FormLabel>Dose</FormLabel>
                  <StyledInput
                    value={dose}
                    onChange={(e) => setDose(e.target.value)}
                  />
                </FormItem>
                <FormItem>
                  <FormLabel>Dose Unit</FormLabel>
                  <StyledSelect
                    value={doseUnit}
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
                    onChange={(e) => setRoute(e.target.value)}
                  />
                </FormItem>
              </FormGrid>

              <FormItem style={{ marginBottom: "20px" }}>
                <FormLabel>Remark</FormLabel>
                <StyledInput
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </FormItem>

              <div
                style={{ display: "flex", gap: "30px", marginBottom: "20px" }}
              >
                <CheckboxGroup onClick={() => setIsRegular(!isRegular)}>
                  <input type="checkbox" checked={isRegular} readOnly /> Regular
                  Medicine
                </CheckboxGroup>
                <CheckboxGroup onClick={() => setIsDischarge(!isDischarge)}>
                  <input type="checkbox" checked={isDischarge} readOnly />{" "}
                  Discharge Medicine
                </CheckboxGroup>
              </div>

              <ActionButtons>
                <CancelBtn onClick={resetForm}>✕ Reset</CancelBtn>
                <AddBtn onClick={handleAddMedicine}>＋ Add Medicine</AddBtn>
              </ActionButtons>
            </FormPanel>

            {/* Side panel */}
            <SidePanel>
              <SidePanelHeader>
                Selected Items ({selectedMedicines.length})
              </SidePanelHeader>
              <SidePanelContent>
                {selectedMedicines.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: colors.textMuted,
                      marginTop: "40px",
                      fontSize: "0.85rem",
                    }}
                  >
                    No medicines added yet.
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
                        {m.dosage} | {m.noOfDays} Days | Qty: {m.quantity}
                      </div>
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
                  Confirm Request
                </AddBtn>
              </SidePanelFooter>
            </SidePanel>
          </RequestFormWrapper>
        )}

        {/* ── Request History ───────────────────────────────────────────── */}
        <TabsBar>
          <Tab active={true}>Request History</Tab>
        </TabsBar>

        <StyledTable>
          <thead>
            <tr>
              <th>Req Date & Time</th>
              <th>Medicine Name</th>
              <th>Dosage</th>
              <th>No Of Days</th>
              <th>Qty.</th>
              <th>Route</th>
              <th>Doctor</th>
              <th>Bill Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
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
                    {req.medicines?.map((m, j) => (
                      <div
                        key={j}
                        style={{
                          borderBottom:
                            j < req.medicines.length - 1
                              ? "1px solid #eee"
                              : "none",
                          padding: "4px 0",
                        }}
                      >
                        {m.itemName || m.name}
                      </div>
                    ))}
                  </td>
                  <td>
                    {req.medicines?.map((m, j) => (
                      <div
                        key={j}
                        style={{
                          borderBottom:
                            j < req.medicines.length - 1
                              ? "1px solid #eee"
                              : "none",
                          padding: "4px 0",
                        }}
                      >
                        {m.dosage}
                      </div>
                    ))}
                  </td>
                  <td>
                    {req.medicines?.map((m, j) => (
                      <div
                        key={j}
                        style={{
                          borderBottom:
                            j < req.medicines.length - 1
                              ? "1px solid #eee"
                              : "none",
                          padding: "4px 0",
                        }}
                      >
                        {m.noOfDays}
                      </div>
                    ))}
                  </td>
                  <td>
                    {req.medicines?.map((m, j) => (
                      <div
                        key={j}
                        style={{
                          borderBottom:
                            j < req.medicines.length - 1
                              ? "1px solid #eee"
                              : "none",
                          padding: "4px 0",
                        }}
                      >
                        {m.quantity}
                      </div>
                    ))}
                  </td>
                  <td>
                    {req.medicines?.map((m, j) => (
                      <div
                        key={j}
                        style={{
                          borderBottom:
                            j < req.medicines.length - 1
                              ? "1px solid #eee"
                              : "none",
                          padding: "4px 0",
                        }}
                      >
                        {m.route}
                      </div>
                    ))}
                  </td>
                  <td>{req.doctorName || req.doctor}</td>
                  <td>{req.billName}</td>
                  <td>
                    <LegendItem color={getStatusColor(req.status || "Pending")}>
                      {req.status || "Pending"}
                    </LegendItem>
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
