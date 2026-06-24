import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { Search, Plus, X } from "lucide-react";

// --- Color Palette matching the screenshot ---
// ─── Color palette (mirrors Radiology/Lab pattern) ──────────────────────
const colors = {
  primary: "#136A63", // Teal for Medicine
  primaryDark: "#0B4C47",
  orange: "#F88C22",
  orangeHover: "#E67D1E",
  yellow: "#FFA000",
  dark: "#37474F",
  border: "#CFD8DC",
  background: "#F5F7F8",
  textMain: "#263238",
  textMuted: "#78909C",
  white: "#FFFFFF",
  rowHighlight: "#E0F2F1",
  headerBg: "#546E7A",
  // Legend Colors (Refined for better UI)
  legPending: "#F59E0B",     // Rich amber
  legSubstituted: "#8B5CF6", // Vibrant purple
  legBilled: "#10B981",      // Emerald green
  legCancelled: "#6B7280",   // Cool gray
  legStopped: "#EF4444",     // Red
  legEmergency: "#DC2626",   // Deeper Red
  legInsurance: "#3B82F6",   // Blue
  legDischarge: "#06B6D4",   // Cyan
  legRegular: "#0D9488",     // Teal
};

// ─── Styled Components ────────────────────────────────────────────────────────

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
  height: 94vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
  @media (max-width: 768px) {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
  color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  button {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    &:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.05);
    }
  }
`;

const Title = styled.h2`
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
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(19, 106, 99, 0.08);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background: linear-gradient(to bottom, ${colors.primary}, ${colors.primaryDark});
    border-radius: 20px 0 0 20px;
  }
`;

const PatientHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px dashed ${colors.border};
`;

const PatientAvatar = styled.div`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, ${colors.primary}20, ${colors.primary}40);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary};
  font-size: 1.4rem;
  font-weight: 800;
  border: 1px solid ${colors.primary}30;
`;

const PatientIdentity = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 800;
    color: ${colors.textMain};
  }

  .sub-text {
    font-size: 0.85rem;
    color: ${colors.textMuted};
    font-weight: 500;
  }
`;

const PatientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px 24px;
`;

const FieldBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const FieldValue = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${colors.textMain};
`;

const TopActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
`;

const RequestBtn = styled.button`
  background: linear-gradient(135deg, ${colors.orange}, ${colors.orangeHover});
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(248, 140, 34, 0.25);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(248, 140, 34, 0.35);
  }
  &:active {
    transform: translateY(0);
  }
`;

const RequestFormWrapper = styled.div`
  display: flex;
  flex-direction: row;
  border: 1px solid ${colors.border};
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 25px;
  background: ${colors.white};
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const FormPanel = styled.div`
  flex: 1;
  padding: 24px;
  border-right: 1px solid ${colors.border};
  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid ${colors.border};
  }
`;

const SidePanel = styled.div`
  width: 360px;
  background: #fdfdfd;
  display: flex;
  flex-direction: column;
  @media (max-width: 1024px) {
    width: 100%;
  }
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(19, 106, 99, 0.15);
  }
`;

const StyledSelect = styled.select`
  border: 1px solid ${colors.border};
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  width: 100%;
  background-color: white;
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(19, 106, 99, 0.15);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  font-size: 0.85rem;
  color: ${colors.textMain};
  margin-bottom: 5px;
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
  background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(19, 106, 99, 0.2);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(19, 106, 99, 0.3);
  }
`;

const CancelBtn = styled.button`
  background: #f1f5f9;
  color: ${colors.textMain};
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 28px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: #e2e8f0;
    color: ${colors.dark};
  }
`;

const TabsBar = styled.div`
  display: flex;
  gap: 8px;
  margin: 30px 0 20px 0;
  padding: 6px;
  background: ${colors.border}30;
  border-radius: 12px;
  width: fit-content;
`;

const Tab = styled.div`
  padding: 10px 24px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  color: ${(props) => (props.active ? colors.primary : colors.textMuted)};
  background: ${(props) => (props.active ? "white" : "transparent")};
  border-radius: 8px;
  box-shadow: ${(props) => (props.active ? "0 4px 12px rgba(0,0,0,0.05)" : "none")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    color: ${colors.primary};
    background: ${(props) => (props.active ? "white" : "white")};
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
  margin-top: 25px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid ${colors.border};
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
`;

const LegendItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border-radius: 8px;
  background: #fdfdfd;
  border: 1px solid #f0f0f0;
  transition: all 0.2s;
  &:hover {
    background: #f8fafb;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
`;

const LegendItem = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  background: ${(props) => props.color};
  color: white;
  width: fit-content;
  box-shadow: 0 2px 6px ${(props) => props.color}40;
`;

const LegendDescription = styled.div`
  font-size: 0.75rem;
  color: ${colors.textMuted};
  line-height: 1.3;
`;

// ─── Searchable Dropdown Helper ───────────────────────────────────────────────

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
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const selected = options.find((opt) =>
        typeof opt === "string" ? opt === value : opt[valueKey] === value,
      );
      if (selected)
        setSearchTerm(
          typeof selected === "string" ? selected : selected[displayKey],
        );
    } else {
      setSearchTerm("");
    }
  }, [value, options, displayKey, valueKey]);

  const filtered = options.filter((opt) => {
    const txt = typeof opt === "string" ? opt : opt[displayKey];
    return txt.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <SearchWrapper ref={wrapperRef}>
      <StyledInput
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
      />
      {isOpen && filtered.length > 0 && (
        <DropdownList>
          {filtered.map((opt, idx) => (
            <DropdownItem
              key={idx}
              onClick={() => {
                const val = typeof opt === "string" ? opt : opt[valueKey];
                const txt = typeof opt === "string" ? opt : opt[displayKey];
                onChange(val);
                setSearchTerm(txt);
                setIsOpen(false);
              }}
            >
              {typeof opt === "string" ? opt : opt[displayKey]}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </SearchWrapper>
  );
};

const MedicineWardRequest = ({ patient, onClose }) => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // Map incoming patient prop to display fields
  const pd = patient?.patient_details || {};
  const resolvedPatient = {
    ipNo: patient?.ipNumber || pd.ipNumber || "-",
    ipBadge: patient?.ipserial_number || pd.ipserial_number || "",
    uhid: patient?.uhid || pd.uhid || "-",
    name:
      [
        patient?.salutation ?? pd.salutation,
        patient?.firstName ?? pd.firstName,
        patient?.middleName ?? pd.middleName,
        patient?.lastName ?? pd.lastName,
      ]
        .filter(Boolean)
        .join(" ") || "Unknown Patient",
    address: patient?.address || pd.permanent_address || "-",
    admittingDate: patient?.admissionDateTime
      ? new Date(patient.admissionDateTime).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
      : "-",
    admittingTime: patient?.admissionDateTime
      ? new Date(patient.admissionDateTime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      : "-",
    admittingDr: patient?.admittingDoctor || pd?.admittingDoctor || "-",
    roomBed: `${patient?.roomNo || "-"} | ${patient?.bedNo || "-"}`,
    customerType: patient?.customerType || pd.customer_type || "-",
    companyName: patient?.companyName || pd.company_code || "-",
  };

  // Data Arrays
  const [requests, setRequests] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [billTypeOptions, setBillTypeOptions] = useState([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // UI States
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  // Form Fields
  const [pharmacyDept, setPharmacyDept] = useState("OLET001");
  const [billTypeNo, setBillTypeNo] = useState("42");
  const [billtype, setBilltype] = useState("42");
  const [billTypeName, setBillTypeName] = useState("PHARMACY OP BILL (SH)");
  const [drugType, setDrugType] = useState("Drug");
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [doctor, setDoctor] = useState(""); // Stores employeeId
  const [doctorName, setDoctorName] = useState(""); // Stores display name
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
  const [loading, setLoading] = useState(false);

  // ── Return Modal State ──────────────────────────────────────────────
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnReq, setSelectedReturnReq] = useState(null);
  const [returnItems, setReturnItems] = useState({});
  const [returnSaving, setReturnSaving] = useState(false);

  useEffect(() => {
    // Note: Patient object might have doctor name OR ID under different fields.
    // If it's the admitting doctor, it's usually an ID but maybe a name after backend formatting.
    if (patient?.admittingDoctor) {
      const docObj = doctors.find(
        (d) =>
          d.employeeId === patient.admittingDoctor ||
          d.employeeName === patient.admittingDoctor,
      );
      if (docObj) {
        setDoctor(docObj.employeeId);
        setDoctorName(docObj.employeeName);
      } else {
        setDoctor(patient.admittingDoctor);
      }
    } else if (patient?.doctor_name) {
      setDoctor(patient.doctor_name);
    } else if (pd.doctorName) {
      setDoctor(pd.doctorName);
    }
  }, [patient, pd, doctors]);

  useEffect(() => {
    fetchRequests();
  }, [pharmacyDept]);

  useEffect(() => {
    fetchDoctors();
    fetchBillTypes();
    fetchDosages();
  }, []);

  const fetchDosages = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}dosage_master/`, "GET");
      if (res.success) setDosageOptions(res.data?.data || []);
    } catch (e) {
      console.error("Error fetching dosages:", e);
    }
  };

  const handleSaveDosage = async () => {
    if (!newDosageName) return alert("Enter dosage name");
    try {
      const res = await apiRequest(`${HmsBaseUrl}dosage_master/`, "POST", {
        dosage_name: newDosageName,
      });
      if (res.success) {
        setNewDosageName("");
        setShowDosageModal(false);
        fetchDosages();
      }
    } catch (e) {
      console.error("Error saving dosage:", e);
    }
  };

  const fetchBillTypes = async () => {
    try {
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
          setPharmacyDept(opt.outlet_code || "");
        }
      }
    } catch (e) {
      console.error("Error fetching bill types:", e);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}get_medicine_ward_requests/?uhid=${resolvedPatient.uhid}&ipNumber=${resolvedPatient.ipNo}`,
        "GET",
      );
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setRequests(list);
      }
    } catch (e) {
      console.error("Error fetching requests:", e);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}doctor_list_diagnostics/`,
        "GET",
      );
      if (res.success) {
        const list =
          res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setDoctors(list);
      }
    } catch (e) {
      console.error("Error fetching doctors:", e);
    }
  };

  const handleMedicineSearch = async (val) => {
    if (val.length > 2) {
      try {
        const res = await apiRequest(
          `${HmsBaseUrl}get_pharmacy_stock/?outlet_code=${pharmacyDept}`,
          "GET",
        );
        const list = res.success
          ? Array.isArray(res.data?.data)
            ? res.data?.data
            : Array.isArray(res.data?.data)
              ? res.data.data
              : []
          : [];

        const filtered = list
          .filter((item) =>
            item.item_name?.toLowerCase().includes(val.toLowerCase()),
          )
          .map((item) => ({
            id: item.item_id + "_" + item.batch_number,
            item_id: item.item_id,
            batch_number: item.batch_number,
            name: item.item_name,
            price: item.mrp,
            total_stock: item.total_stock || 0,
            expiry_date: item.expiry_date || "-",
          }));
        setSearchResults(filtered);
      } catch (e) {
        console.error("Search error", e);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Auto-calculate quantity based on dosage & days
  useEffect(() => {
    if (dosage && noOfDays) {
      let timesPerDay = 0;
      if (dosage.includes("-")) {
        const parts = dosage.split("-").map((p) => Number(p) || 0);
        timesPerDay = parts.reduce((acc, curr) => acc + curr, 0);
      } else {
        timesPerDay = Number(dosage) || 0;
      }
      const days = Number(noOfDays) || 0;
      if (timesPerDay > 0 && days > 0) {
        setQty(timesPerDay * days);
      }
    }
  }, [dosage, noOfDays]);

  const handleAddMedicine = () => {
    if (!selectedDrug) return alert("Select a drug from search.");
    if (!billtype) return alert("Select Medicine Bill Type.");
    if (!dosage) return alert("Enter Dosage.");
    if (!noOfDays) return alert("Enter No.of days.");
    if (!qty) return alert("Enter Quantity.");

    const newMed = {
      item_id: selectedDrug.item_id,
      name: selectedDrug.name || "",
      batch_number: selectedDrug.batch_number || "",
      qty: Number(qty),
      price: selectedDrug.price,
      noOfDays: noOfDays,
      dosage: dosage,
      dose: dose,
      doseunit: doseUnit,
    };

    setSelectedMedicines([...selectedMedicines, newMed]);
    resetForm();
  };

  const resetForm = () => {
    setSelectedDrug(null);
    setSearchQuery("");
    setSearchResults([]);
    setNoOfDays("");
    setQty("");
    setDosage("");
    setDose("");
    setDoseUnit("");
    setRoute("");
    setRemark("");
  };

  // Load a selected medicine back into the form for editing
  const handleEditSelectedMed = (idx) => {
    const med = selectedMedicines[idx];
    // Restore the drug selector state
    setSelectedDrug({
      item_id: med.item_id,
      name: med.name || `Item ${med.item_id}`,
      batch_number: med.batch_number,
      price: med.price,
    });
    setDosage(med.dosage || "");
    setNoOfDays(med.noOfDays || "");
    setQty(String(med.qty || ""));
    setDose(med.dose || "");
    setDoseUnit(med.doseunit || "");
    // Remove from list (it will be re-added on handleAddMedicine)
    setSelectedMedicines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = async () => {
    if (selectedMedicines.length === 0) return alert("No medicines added.");

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
        (acc, m) => acc + (m.price || 0) * (m.qty || 0),
        0,
      ),
      doctor: doctorName,
      doctor_id: doctor,
      billing_status: "Ward Request",
      billing_mode: "WARD REQUEST",
      outlet_code: pharmacyDept,
      is_discharge: isDischarge,
    };

    try {
      const res = await apiRequest(
        `${HmsBaseUrl}save_medicine_ward_request/`,
        "POST",
        payload,
      );
      if (res.success) {
        alert("Ward Request saved successfully");
        setSelectedMedicines([]);
        setIsDischarge(false);
        fetchRequests();
      }
    } catch (e) {
      console.error("Save error", e);
    }
  };

  const removeSelectedMed = (index) => {
    setSelectedMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Reset Edit ────────────────────────────────────────────────────────────
  const resetEdit = () => {
    setShowForm(false);
    setEditingRequest(null);
    setSelectedMedicines([]);
  };

  // ─── Return Handlers ───────────────────────────────────────────────────────
  const handleOpenReturn = (req) => {
    setSelectedReturnReq(req);
    const initialItems = {};
    req.medicines?.forEach((m) => {
      const key = `${m.item_id}_${m.batch_number}`;
      initialItems[key] = {
        qty: "",
        reason: ""
      };
    });
    setReturnItems(initialItems);
    setIsReturnModalOpen(true);
  };

  const handleReturnChange = (key, field, value) => {
    setReturnItems(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleReturnSubmit = async () => {
    const itemsToReturn = [];
    selectedReturnReq.medicines?.forEach(m => {
      const key = `${m.item_id}_${m.batch_number}`;
      const r = returnItems[key];
      const returnQty = parseInt(r.qty) || 0;
      if (returnQty > 0) {
        if (returnQty > m.quantity) {
          alert(`Return quantity for ${m.item_name || m.name} cannot exceed billed quantity (${m.quantity}).`);
          throw new Error("Invalid return quantity");
        }
        itemsToReturn.push({
          item_id: m.item_id,
          item_name: m.item_name || m.name || "",
          batch_number: m.batch_number,
          qty: m.quantity,
          returned_qty: returnQty,
          reason: r.reason || ""
        });
      }
    });

    if (itemsToReturn.length === 0) {
      alert("Please enter a return quantity for at least one item.");
      return;
    }

    setReturnSaving(true);
    try {
      const payload = {
        Bill_id: selectedReturnReq.Bill_id,
        patient_name: selectedReturnReq.patient_name || selectedReturnReq.patientName || selectedReturnReq.patient || "",
        medicine_particulars: itemsToReturn,
        "auth-user-id": localStorage.getItem("employee_id") || "Unknown"
      };

      const res = await apiRequest(`${HmsBaseUrl}return_medicine_ward_request/`, "POST", payload);
      if (res.success || res.status === "success" || res.status === 200) {
        setIsReturnModalOpen(false);
        fetchRequests();
        alert("Return processed successfully");
      } else {
        alert(res.error || res.message || "Failed to process return");
      }
    } catch (e) {
      if (e.message !== "Invalid return quantity") {
        console.error(e);
        alert("Error processing return");
      }
    } finally {
      setReturnSaving(false);
    }
  };

  // ─── Open Edit (loads history medicines into the right side panel) ─────────
  const handleOpenEdit = (req) => {
    setEditingRequest(req);
    // Map history medicine format → side panel format
    const mapped = (req.medicines || [])
      .filter((m) => !m.is_deleted)
      .map((m) => ({
        item_id: m.item_id,
        name: m.item_name || m.name || `Item ${m.item_id}`,
        batch_number: m.batch_number || "",
        qty: m.quantity || 0,
        price: m.price || 0,
        noOfDays: m.noOfDays || "",
        dosage: m.dosage || "",
        dose: m.dose || "",
        doseunit: m.doseunit || "",
      }));
    setSelectedMedicines(mapped);
    setShowForm(true);   // open the form panel to show the loaded medicines
    // Scroll to top so the panel is visible
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Cancel editing ────────────────────────────────────────────────────────
  const handleCancelEdit = () => {
    setEditingRequest(null);
    setSelectedMedicines([]);
    setShowForm(false);
  };

  // ─── Save edits back to server ────────────────────────────────────────────
  const handleEditSave = async () => {
    if (!editingRequest) return;
    setEditSaving(true);
    try {
      // Build the full list: non-deleted items from selectedMedicines,
      // plus mark items originally present but now removed as is_deleted
      const originalIds = new Set(
        (editingRequest.medicines || []).map(
          (m) => `${m.item_id}__${m.batch_number}`
        )
      );
      const keptIds = new Set(
        selectedMedicines.map((m) => `${m.item_id}__${m.batch_number}`)
      );

      // Kept / edited items
      const updated = selectedMedicines.map((m) => ({
        item_id: m.item_id,
        batch_number: m.batch_number,
        quantity: m.qty,
        dosage: m.dosage,
        is_deleted: false,
      }));

      // Items that were in the original but removed in the panel → soft-delete
      const deleted = (editingRequest.medicines || [])
        .filter((m) => !keptIds.has(`${m.item_id}__${m.batch_number}`))
        .map((m) => ({
          item_id: m.item_id,
          batch_number: m.batch_number || "",
          quantity: m.quantity,
          dosage: m.dosage,
          is_deleted: true,
        }));

      const res = await apiRequest(
        `${HmsBaseUrl}update_medicine_ward_request/`,
        "PATCH",
        {
          Bill_id: editingRequest.Bill_id,
          medicine_particulars: [...updated, ...deleted],
        },
      );
      if (res.success) {
        setEditingRequest(null);
        setSelectedMedicines([]);
        setShowForm(false);
        fetchRequests();
      } else {
        alert(res.error || "Failed to save changes.");
      }
    } catch (e) {
      console.error("Edit save error", e);
    } finally {
      setEditSaving(false);
    }
  };

  const getStatusColor = (status, isDischarge) => {
    if (isDischarge) return colors.legDischarge;
    if (status === "Pending") return colors.legPending;
    if (status === "Cancelled") return colors.legCancelled;
    if (status === "Billed") return colors.legBilled;
    return colors.legRegular;
  };

  return (
    <>
      <div style={{ padding: "20px" }}>
        <PatientPanel>
          <PatientHeader>
            <PatientAvatar>
              {resolvedPatient.name ? resolvedPatient.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "P"}
            </PatientAvatar>
            <PatientIdentity>
              <h3>{resolvedPatient.name || "Unknown Patient"}</h3>
              <div className="sub-text">
                UHID: {resolvedPatient.uhid || "-"} | IP No: {resolvedPatient.ipNo || "-"} {resolvedPatient.ipBadge && `(${resolvedPatient.ipBadge})`}
              </div>
            </PatientIdentity>
          </PatientHeader>

          <PatientGrid>
            <FieldBox>
              <FieldLabel>Admitting Dr</FieldLabel>
              <FieldValue>{resolvedPatient.admittingDr || "-"}</FieldValue>
            </FieldBox>
            <FieldBox>
              <FieldLabel>Room | Bed</FieldLabel>
              <FieldValue>{resolvedPatient.roomBed || "-"}</FieldValue>
            </FieldBox>
            <FieldBox>
              <FieldLabel>Customer Type</FieldLabel>
              <FieldValue>{resolvedPatient.customerType || "-"}</FieldValue>
            </FieldBox>
            <FieldBox>
              <FieldLabel>Admitting Date</FieldLabel>
              <FieldValue>{resolvedPatient.admittingDate} {resolvedPatient.admittingTime}</FieldValue>
            </FieldBox>
            <FieldBox>
              <FieldLabel>Company Name</FieldLabel>
              <FieldValue>{resolvedPatient.companyName || "-"}</FieldValue>
            </FieldBox>
          </PatientGrid>
        </PatientPanel>

        <TopActionBar>
          <div style={{ display: "flex", gap: "10px" }}>
            <RequestBtn onClick={() => setShowForm(!showForm)}>
              {showForm ? "✕ Close Form" : "＋ New Medicine Request"}
            </RequestBtn>
          </div>
        </TopActionBar>

        {showForm && (
          <RequestFormWrapper>
            <FormPanel>
              <FormGrid>
                <FormItem>
                  <FormLabel>Medicine Bill Type</FormLabel>
                  <SearchableDropdown
                    value={billtype}
                    onChange={(val) => {
                      const opt = billTypeOptions.find(
                        (o) => String(o.bill_type) === String(val),
                      );
                      if (opt) {
                        setBillTypeNo(opt.billTypeNo);
                        setBilltype(val);
                        setBillTypeName(opt.bill_name);
                        setPharmacyDept(opt.outlet_code || "");
                        setSearchResults([]);
                        setSelectedDrug(null);
                        setSearchQuery("");
                      }
                    }}
                    options={billTypeOptions.map((o) => ({
                      id: o.bill_type,
                      name: o.bill_name,
                    }))}
                  />
                </FormItem>

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
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (searchQuery.length > 2) {
                            setIsSearchModalOpen(true);
                            handleMedicineSearch(searchQuery);
                          } else {
                            alert("Please enter at least 3 characters.");
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (searchQuery.length > 2) {
                          setIsSearchModalOpen(true);
                          handleMedicineSearch(searchQuery);
                        } else {
                          alert("Please enter at least 3 characters.");
                        }
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

                <FormItem>
                  <FormLabel>Doctor</FormLabel>
                  <SearchableDropdown
                    value={doctor}
                    onChange={(val) => {
                      setDoctor(val);
                      const docObj = doctors.find((d) => d.employeeId === val);
                      if (docObj) setDoctorName(docObj.employeeName);
                    }}
                    options={doctors.map((d) => ({
                      id: d.employeeId,
                      name: d.employeeName,
                    }))}
                  />
                </FormItem>

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
                      {dosageOptions.map((opt, idx) => (
                        <option key={idx} value={opt.dosage_name}>
                          {opt.dosage_name}
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
                  selectedMedicines.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "12px 10px 12px 12px",
                        borderBottom: "1px solid #F0F0F0",
                        position: "relative",
                        borderRadius: "6px",
                        background: "#f7fcfb",
                        marginBottom: "4px",
                        cursor: "default",
                      }}
                    >
                      {/* Medicine Name – click to load back into form */}
                      <div
                        onClick={() => handleEditSelectedMed(idx)}
                        title="Click to edit this medicine"
                        style={{
                          fontWeight: "700",
                          fontSize: "0.85rem",
                          color: colors.primary,
                          cursor: "pointer",
                          paddingRight: "50px",
                        }}
                      >
                        ✎ {m.name || `Item ID: ${m.item_id}`}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: colors.textMuted,
                          marginTop: "4px",
                          paddingRight: "50px",
                        }}
                      >
                        {m.dosage} | {m.noOfDays} Days | Qty: {m.qty}
                        {m.batch_number ? ` | B: ${m.batch_number}` : ""}
                      </div>
                      {/* Remove button */}
                      <button
                        onClick={() => removeSelectedMed(idx)}
                        title="Remove"
                        style={{
                          position: "absolute",
                          right: "8px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "#ffe8e8",
                          border: "none",
                          color: "#e53935",
                          cursor: "pointer",
                          borderRadius: "4px",
                          width: "26px",
                          height: "26px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </SidePanelContent>
              <SidePanelFooter>
                {editingRequest ? (
                  <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "6px",
                        border: `1px solid ${colors.border}`,
                        background: "white",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Cancel
                    </button>
                    <AddBtn
                      style={{ flex: 2, padding: "12px" }}
                      onClick={handleEditSave}
                      disabled={editSaving}
                    >
                      {editSaving ? "Saving..." : "💾 Save Edit"}
                    </AddBtn>
                  </div>
                ) : (
                  <AddBtn
                    style={{ width: "100%", padding: "12px" }}
                    onClick={handleConfirm}
                  >
                    Confirm Request
                  </AddBtn>
                )}
              </SidePanelFooter>
            </SidePanel>
          </RequestFormWrapper>
        )}

        <TabsBar>
          <Tab active={true}>💊 Medicine Request History</Tab>
        </TabsBar>

        {/* ── Medicine History Table ── */}
        <div style={{ overflowX: "auto", borderRadius: "8px", border: `1px solid ${colors.border}` }}>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
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
                Array.isArray(requests) && requests.map((req, i) => (
                  <tr key={i}>
                    <td>
                      {req.reqDate} {req.reqTime}
                    </td>
                    <td>
                      {req.medicines
                        ?.filter((m) => !m.is_deleted)
                        .map((m, idx, arr) => (
                          <div
                            key={idx}
                            style={{
                              borderBottom:
                                idx < arr.length - 1
                                  ? "1px solid #eee"
                                  : "none",
                              padding: "4px 0",
                            }}
                          >
                            {m.item_name || m.name || `(ID: ${m.item_id})`}
                          </div>
                        ))}
                    </td>
                    <td>
                      {req.medicines?.map((m, idx) => (
                        <div
                          key={idx}
                          style={{
                            borderBottom:
                              idx < req.medicines.length - 1
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
                      {req.medicines?.map((m, idx) => (
                        <div
                          key={idx}
                          style={{
                            borderBottom:
                              idx < req.medicines.length - 1
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
                      {req.medicines?.map((m, idx) => (
                        <div
                          key={idx}
                          style={{
                            borderBottom:
                              idx < req.medicines.length - 1
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
                      {req.medicines?.map((m, idx) => (
                        <div
                          key={idx}
                          style={{
                            borderBottom:
                              idx < req.medicines.length - 1
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
                      <LegendItem
                        color={getStatusColor(req.status || "Pending", req.isDischarge)}
                      >
                        {req.isDischarge ? "Discharge Medicine" : (req.status || "Pending")}
                      </LegendItem>
                    </td>
                    <td>
                      {(() => {
                        const hasPendingReturn = Array.isArray(req.pending_returns) && req.pending_returns.some(pr => pr.status === "Pending");
                        const canReturn = ["Billed", "Paid"].includes(req.status) && !hasPendingReturn;
                        return (
                          <>
                            <button
                              onClick={() => handleOpenEdit(req)}
                              disabled={req.status === "Billed" || req.status === "Cancelled"}
                              style={{
                                background: req.status === "Billed" || req.status === "Cancelled" ? "#ccc" : "#136A63",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                padding: "5px 12px",
                                cursor: req.status === "Billed" || req.status === "Cancelled" ? "not-allowed" : "pointer",
                                fontSize: "0.8rem",
                                fontWeight: "600",
                              }}
                            >
                              ✎ Edit
                            </button>
                            <button
                              onClick={() => handleOpenReturn(req)}
                              disabled={!canReturn}
                              style={{
                                background: !canReturn ? "#ccc" : colors.orange,
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                padding: "5px 12px",
                                cursor: !canReturn ? "not-allowed" : "pointer",
                                fontSize: "0.8rem",
                                fontWeight: "600",
                                marginLeft: "8px"
                              }}
                            >
                              {hasPendingReturn ? "⌛ Return Pending" : "↺ Return"}
                            </button>
                          </>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </StyledTable>
        </div>
        <LegendContainer>
          <LegendItemWrapper>
            <LegendItem color={colors.legPending}>Pending</LegendItem>
            <LegendDescription>Request is placed but not yet processed or billed.</LegendDescription>
          </LegendItemWrapper>
          <LegendItemWrapper>
            <LegendItem color={colors.legSubstituted}>Substituted</LegendItem>
            <LegendDescription>Requested medicine was replaced with an alternative.</LegendDescription>
          </LegendItemWrapper>
          <LegendItemWrapper>
            <LegendItem color={colors.legBilled}>Billed</LegendItem>
            <LegendDescription>Medicine has been billed and issued to the patient.</LegendDescription>
          </LegendItemWrapper>
          <LegendItemWrapper>
            <LegendItem color={colors.legCancelled}>Cancelled</LegendItem>
            <LegendDescription>The request was cancelled before processing.</LegendDescription>
          </LegendItemWrapper>
          <LegendItemWrapper>
            <LegendItem color={colors.legStopped}>Stopped</LegendItem>
            <LegendDescription>Medication has been stopped by the doctor.</LegendDescription>
          </LegendItemWrapper>
          <LegendItemWrapper>
            <LegendItem color={colors.legEmergency}>Emergency</LegendItem>
            <LegendDescription>High priority urgent medicine request.</LegendDescription>
          </LegendItemWrapper>
          <LegendItemWrapper>
            <LegendItem color={colors.legInsurance}>Insurance Item</LegendItem>
            <LegendDescription>Medicine covered under patient's insurance plan.</LegendDescription>
          </LegendItemWrapper>
          <LegendItemWrapper>
            <LegendItem color={colors.legDischarge}>Discharge Med</LegendItem>
            <LegendDescription>Medicines prescribed for patient at the time of discharge.</LegendDescription>
          </LegendItemWrapper>
          <LegendItemWrapper>
            <LegendItem color={colors.legRegular}>Regular Med</LegendItem>
            <LegendDescription>Standard ongoing medicines for the admitted patient.</LegendDescription>
          </LegendItemWrapper>
        </LegendContainer>
      </div>



      {/* ─── Medicine Search Modal ────────────────────────────────────── */}
      {isSearchModalOpen && (
        <ModalOverlay style={{ zIndex: 2000 }}>
          <ModalContainer
            style={{ width: "80%", height: "80%", maxWidth: "1000px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <Title>Select Medicine ({pharmacyDept})</Title>
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
                    if (e.key === "Enter" && searchQuery.length > 2) {
                      handleMedicineSearch(searchQuery);
                    }
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
                      {Array.isArray(searchResults) && searchResults.map((item, idx) => (
                        <tr
                          key={idx}
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
      {/* ─── Return Medicine Modal ────────────────────────────────────── */}
      {isReturnModalOpen && selectedReturnReq && (
        <ModalOverlay style={{ zIndex: 2000 }}>
          <ModalContainer
            style={{ width: "80%", height: "80%", maxWidth: "1000px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header style={{ background: `linear-gradient(135deg, ${colors.orange}, ${colors.orangeHover})` }}>
              <Title>Return Medicine</Title>
              <button onClick={() => setIsReturnModalOpen(false)}>×</button>
            </Header>
            <ContentBody style={{ overflowY: "auto" }}>
              <div style={{ marginBottom: "16px", background: "#fff8e1", padding: "12px", borderRadius: "8px", borderLeft: `4px solid ${colors.orange}` }}>
                <strong>Request Date:</strong> {selectedReturnReq.reqDate} {selectedReturnReq.reqTime} <br />
                <strong>Bill ID:</strong> {selectedReturnReq.Bill_id} <br />
                <strong>Doctor:</strong> {selectedReturnReq.doctorName || selectedReturnReq.doctor}
              </div>
              <div style={{ overflowX: "auto" }}>
                <StyledTable>
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Batch</th>
                      <th>Billed Qty</th>
                      <th>Return Qty</th>
                      <th>Reason for Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReturnReq.medicines?.filter(m => !m.is_deleted).map((m, idx) => {
                      const key = `${m.item_id}_${m.batch_number}`;
                      const returnState = returnItems[key] || {};
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{m.item_name || m.name || `(ID: ${m.item_id})`}</td>
                          <td>{m.batch_number || "-"}</td>
                          <td>{m.quantity}</td>
                          <td>
                            <StyledInput
                              type="number"
                              min="0"
                              max={m.quantity}
                              value={returnState.qty || ""}
                              onChange={(e) => handleReturnChange(key, "qty", e.target.value)}
                              placeholder="0"
                              style={{ width: "80px", textAlign: "center" }}
                            />
                          </td>
                          <td>
                            <StyledInput
                              type="text"
                              value={returnState.reason || ""}
                              onChange={(e) => handleReturnChange(key, "reason", e.target.value)}
                              placeholder="Reason..."
                              style={{ width: "100%" }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </StyledTable>
              </div>
            </ContentBody>
            <div style={{ padding: "16px", borderTop: "1px solid #CFD8DC", display: "flex", justifyContent: "flex-end", gap: "12px", background: "#f5f7f8" }}>
              <CancelBtn onClick={() => setIsReturnModalOpen(false)}>Cancel</CancelBtn>
              <RequestBtn
                onClick={handleReturnSubmit}
                disabled={returnSaving}
                style={{ background: returnSaving ? "#ccc" : colors.orange }}
              >
                {returnSaving ? "Processing..." : "Submit Return"}
              </RequestBtn>
            </div>
          </ModalContainer>
        </ModalOverlay>
      )}
    </>
  );
};

export default MedicineWardRequest;
