import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Edit2,
  X,
  Save
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";

const THEME = {
  primary: "#133d34",
  primaryHover: "#0e2c25",
  teal: "#0d9488",
  tealHover: "#0f766e",
  orange: "#d97706",
  orangeHover: "#b45309",
  danger: "#ef4444",
  dangerHover: "#dc2626",
  border: "#cbd5e1",
  borderLight: "#e2e8f0",
  bgLight: "#f8fafc",
  cardBg: "#ffffff",
  textMain: "#1e293b",
  textMuted: "#64748b"
};

// --- Styled Components ---

const PageContainer = styled.div`
  padding: 16px 24px;
  background-color: #f1f5f9;
  min-height: calc(100vh - 65px);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: ${THEME.textMain};
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
`;

const BreadcrumbBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const Breadcrumb = styled.div`
  font-size: 14px;
  color: ${THEME.textMuted};
  font-weight: 500;
  span {
    color: ${THEME.textMain};
    font-weight: 600;
  }
`;

const TopFilterCard = styled.div`
  background: ${THEME.cardBg};
  border-radius: 8px;
  border: 1px solid ${THEME.borderLight};
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const DateInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  display: block;

  span.required {
    color: #ef4444;
    margin-left: 2px;
  }
`;

const TextInput = styled.input`
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid ${THEME.border};
  font-size: 13px;
  color: ${THEME.textMain};
  background-color: #ffffff;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${THEME.teal};
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
  }

  &:disabled {
    background-color: #f1f5f9;
    color: #64748b;
    cursor: not-allowed;
  }
`;

const SelectInput = styled.select`
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid ${THEME.border};
  font-size: 13px;
  color: ${THEME.textMain};
  background-color: #ffffff;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${THEME.teal};
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
  }

  &:disabled {
    background-color: #f1f5f9;
    color: #64748b;
    cursor: not-allowed;
  }
`;

const ButtonPrimary = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #133d34;
  color: #ffffff;
  border: none;
  padding: 7px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #0e2c25;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonSecondary = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #334155;
  color: #ffffff;
  border: none;
  padding: 7px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #1e293b;
  }
`;

const OrangeToggleBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #d97706;
  color: #ffffff;
  border: none;
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #b45309;
  }
`;

// Form Card
const FormCard = styled.div`
  background: ${THEME.cardBg};
  border-radius: 8px;
  border: 1px solid ${THEME.borderLight};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const FormBody = styled.div`
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  grid-column: span ${props => props.$span || 1};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InputWithSearch = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SearchBtnIcon = styled.button`
  background-color: #133d34;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 7px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #0e2c25;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  height: 35px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${THEME.textMain};

  input {
    accent-color: #133d34;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  height: 35px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${THEME.textMain};
  cursor: pointer;

  input {
    accent-color: #133d34;
    cursor: pointer;
  }
`;

const FormFooter = styled.div`
  padding: 12px 20px;
  background-color: #f8fafc;
  border-top: 1px solid ${THEME.borderLight};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
`;

// Table Card
const TableCard = styled.div`
  background: ${THEME.cardBg};
  border-radius: 8px;
  border: 1px solid ${THEME.borderLight};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const TableHeaderBar = styled.div`
  padding: 12px 18px;
  border-bottom: 1px solid ${THEME.borderLight};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
`;

const TableScrollArea = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  max-height: 48vh;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
  text-align: left;
`;

const TableHead = styled.thead`
  background-color: #f8fafc;
  border-bottom: 1px solid ${THEME.borderLight};
  position: sticky;
  top: 0;
  z-index: 5;

  th {
    padding: 10px 12px;
    font-weight: 700;
    color: #475569;
    white-space: nowrap;
    font-size: 11.5px;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${THEME.borderLight};
  transition: background-color 0.15s;

  &:hover {
    background-color: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 10px 12px;
  color: ${THEME.textMain};
  vertical-align: middle;
  white-space: nowrap;
`;

const TableFooterBar = styled.div`
  padding: 12px 18px;
  border-top: 1px solid ${THEME.borderLight};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8fafc;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PageBtn = styled.button`
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid ${props => props.$active ? "#0f766e" : "#e2e8f0"};
  background: ${props => props.$active ? "#0f766e" : "#ffffff"};
  color: ${props => props.$active ? "#ffffff" : "#475569"};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  min-width: 28px;

  &:hover:not(:disabled) {
    background: ${props => props.$active ? "#0f766e" : "#f1f5f9"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: ${props => props.$color || "#64748b"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:hover {
    background-color: #f1f5f9;
    color: ${props => props.$hoverColor || props.$color};
    transform: scale(1.1);
  }
`;

// ==========================================
// MAIN COMPONENT: InsuranceMemberVisit
// ==========================================

const InsuranceMemberVisit = () => {
  const HMS_URL = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "";

  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  // Form Open/Collapse state
  const [isFormOpen, setIsFormOpen] = useState(true);

  // Available Dependents / Patient Options for current member
  const [patientOptions, setPatientOptions] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);

  // Form Data State
  const initialFormState = {
    member_visit_reference: "",
    member_number: "",
    uhid: "",
    patient_name: "",
    dependent_sl_no: 1,
    relationship: "Self",
    age: "",
    gender: "MALE",
    parent_polyclinic: "",
    visit_date: new Date().toISOString().split("T")[0],
    visit_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    opd_registration_date: new Date().toISOString().split("T")[0],
    date_of_referral: "",
    valid_upto: "",
    consulting_doctor: "",
    referred_polyclinic: "",
    referral_number: "",
    service_number: "",
    provisional_diagnosis: "",
    admission: false,
    consultation: false,
    specified_services: false,
    services: false
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Table Data State
  const [visits, setVisits] = useState([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  // Load Doctor Schedule list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await apiRequest(`${HMS_URL}doctor_schedule/`, "GET");
        if (res.success) {
          const list = Array.isArray(res.data) 
            ? res.data 
            : (Array.isArray(res.data?.data) ? res.data.data : []);
          setDoctorsList(list);
        }
      } catch (err) {
        console.error("Error fetching doctor schedule", err);
      }
    };
    fetchDoctors();
  }, [HMS_URL]);

  // Fetch Visits List
  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${HMS_URL}insurance-visits/?page=${page}&limit=${limit}`;
      if (fromDate) url += `&from_date=${fromDate}`;
      if (toDate) url += `&to_date=${toDate}`;
      if (searchFilter.trim()) url += `&search=${encodeURIComponent(searchFilter.trim())}`;

      const res = await apiRequest(url, "GET");
      if (res.success) {
        const list = Array.isArray(res.data) 
          ? res.data 
          : (Array.isArray(res.data?.data) ? res.data.data : []);
        const total = typeof res.data?.total_count === "number" 
          ? res.data.total_count 
          : (res.total_count || list.length);
        setVisits(list);
        setTotalVisits(total);
      } else {
        toast.error(res.error || "Failed to load member visits");
        setVisits([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching member visits");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [HMS_URL, page, limit, fromDate, toDate, searchFilter]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // Lookup Member by Member Number
  const handleSearchMember = async () => {
    if (!formData.member_number.trim()) {
      toast.warn("Please enter a Member Number to search");
      return;
    }
    try {
      const res = await apiRequest(`${HMS_URL}insurance-search-member/?member_number=${encodeURIComponent(formData.member_number.trim())}`, "GET");
      if (res.success && res.data) {
        const m = res.data?.data || res.data;
        // Build patient dropdown list (Member self + active dependents)
        const opts = [
          {
            label: `${m.member_name || m.member_first_name} (Self)`,
            name: m.member_name || m.member_first_name,
            relationship: "Self",
            dependent_sl_no: 1,
            age: m.member_age,
            gender: m.member_sex || "MALE",
            uhid: m.uhid || ""
          }
        ];

        if (m.dependents && m.dependents.length > 0) {
          m.dependents.forEach(dep => {
            opts.push({
              label: `${dep.dependent_name} (${dep.relationship})`,
              name: dep.dependent_name,
              relationship: dep.relationship,
              dependent_sl_no: dep.dependent_sl_no,
              age: dep.age,
              gender: dep.gender || "MALE",
              uhid: dep.uhid || ""
            });
          });
        }

        setPatientOptions(opts);

        setFormData(prev => ({
          ...prev,
          member_number: m.member_number,
          uhid: m.uhid || prev.uhid,
          patient_name: m.member_name || m.member_first_name,
          relationship: "Self",
          age: m.member_age != null ? m.member_age : "",
          gender: m.member_sex || "MALE",
          parent_polyclinic: m.parent_polyclinic || prev.parent_polyclinic,
          referral_number: m.referral_number || prev.referral_number,
          service_number: m.service_number || prev.service_number
        }));

        toast.success(`Member ${m.member_name || m.member_number} details loaded!`);
      } else {
        toast.error(res.error || "Member not found");
      }
    } catch (err) {
      toast.error("Error looking up insurance member");
    }
  };

  // Lookup Patient by UHID
  const handleSearchUHID = async () => {
    if (!formData.uhid.trim()) {
      toast.warn("Please enter a UHID to search");
      return;
    }
    try {
      const res = await apiRequest(`${HMS_URL}insurance-search-patient/?uhid=${encodeURIComponent(formData.uhid.trim())}`, "GET");
      if (res.success && res.data) {
        const p = res.data;
        setFormData(prev => ({
          ...prev,
          uhid: p.uhid,
          patient_name: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
          age: p.age || prev.age,
          gender: (p.gender || "MALE").toUpperCase()
        }));
        toast.success(`Patient ${p.firstName} loaded!`);
      } else {
        toast.error(res.error || "Patient not found");
      }
    } catch (err) {
      toast.error("Error searching patient");
    }
  };

  // Handle Patient Dropdown Change
  const handlePatientSelect = (idx) => {
    const selected = patientOptions[idx];
    if (selected) {
      setFormData(prev => ({
        ...prev,
        patient_name: selected.name,
        relationship: selected.relationship,
        dependent_sl_no: selected.dependent_sl_no,
        age: selected.age != null ? selected.age : "",
        gender: selected.gender || "MALE",
        uhid: selected.uhid || prev.uhid
      }));
    }
  };

  // Save / Update Visit
  const handleSaveVisit = async (e) => {
    e.preventDefault();
    if (!formData.member_number.trim()) {
      toast.error("Member Number is required");
      return;
    }

    setSaving(true);
    try {
      let res;
      if (isEditing && formData.member_visit_reference) {
        res = await apiRequest(`${HMS_URL}insurance-visits/${encodeURIComponent(formData.member_visit_reference)}/`, "PATCH", formData);
      } else {
        res = await apiRequest(`${HMS_URL}insurance-visits/`, "POST", formData);
      }

      if (res.success) {
        toast.success(isEditing ? "Visit updated successfully!" : "Visit record saved successfully!");
        fetchVisits();
        handleCancelForm();
      } else {
        toast.error(res.error || "Failed to save visit record");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving visit record");
    } finally {
      setSaving(false);
    }
  };

  // Select Visit for Edit
  const handleEditVisit = (v) => {
    setIsEditing(true);
    setIsFormOpen(true);
    setFormData({
      member_visit_reference: v.member_visit_reference || "",
      member_number: v.member_number || "",
      uhid: v.uhid || "",
      patient_name: v.patient_name || "",
      dependent_sl_no: v.dependent_sl_no || 1,
      relationship: v.relationship || "Self",
      age: v.age != null ? v.age : "",
      gender: v.gender || "MALE",
      parent_polyclinic: v.parent_polyclinic || "",
      visit_date: v.visit_date || "",
      visit_time: v.visit_time || "",
      opd_registration_date: v.opd_registration_date || "",
      date_of_referral: v.date_of_referral || "",
      valid_upto: v.valid_upto || "",
      consulting_doctor: v.consulting_doctor || "",
      referred_polyclinic: v.referred_polyclinic || "",
      referral_number: v.referral_number || "",
      service_number: v.service_number || "",
      provisional_diagnosis: v.provisional_diagnosis || "",
      admission: Boolean(v.admission),
      consultation: Boolean(v.consultation),
      specified_services: Boolean(v.specified_services),
      services: Boolean(v.services)
    });
  };

  const handleCancelForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
  };

  // Delete Visit
  const handleDeleteVisit = async (visitRef) => {
    if (!window.confirm(`Are you sure you want to delete visit ${visitRef}?`)) return;
    try {
      const res = await apiRequest(`${HMS_URL}insurance-visits/${encodeURIComponent(visitRef)}/`, "DELETE");
      if (res.success) {
        toast.success("Visit deleted successfully");
        fetchVisits();
        if (formData.member_visit_reference === visitRef) {
          handleCancelForm();
        }
      } else {
        toast.error(res.error || "Failed to delete visit");
      }
    } catch (err) {
      toast.error("Error deleting visit");
    }
  };

  return (
    <PageContainer>
      {/* Breadcrumb Bar */}
      <BreadcrumbBar>
        <Breadcrumb>
          Home / <span>Insurance Member Visits</span>
        </Breadcrumb>
      </BreadcrumbBar>

      {/* Top Filter Bar */}
      <TopFilterCard>
        <FilterGroup>
          <DateInputWrapper>
            <FieldLabel>Visit Details From</FieldLabel>
            <TextInput
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </DateInputWrapper>

          <DateInputWrapper>
            <FieldLabel>Visit Details To</FieldLabel>
            <TextInput
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </DateInputWrapper>

          <DateInputWrapper>
            <FieldLabel>&nbsp;</FieldLabel>
            <ButtonPrimary type="button" onClick={fetchVisits}>
              <Search size={14} /> Search
            </ButtonPrimary>
          </DateInputWrapper>
        </FilterGroup>

        <OrangeToggleBtn onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? <Minus size={15} /> : <Plus size={15} />}
          {isFormOpen ? "Hide Member Visit Form" : "- Insurance Member Visit"}
        </OrangeToggleBtn>
      </TopFilterCard>

      {/* Collapsible Form Section */}
      {isFormOpen && (
        <FormCard>
          <form onSubmit={handleSaveVisit}>
            <FormBody>
              {/* Row 1 */}
              <FormGrid>
                <FormGroup>
                  <FieldLabel>
                    Member Number <span className="required">*</span>
                  </FieldLabel>
                  <InputWithSearch>
                    <TextInput
                      type="text"
                      placeholder="e.g. SP26/01145"
                      required
                      value={formData.member_number}
                      onChange={(e) => setFormData({ ...formData, member_number: e.target.value })}
                    />
                    <SearchBtnIcon type="button" onClick={handleSearchMember}>
                      <Search size={14} />
                    </SearchBtnIcon>
                  </InputWithSearch>
                </FormGroup>

                <FormGroup>
                  <FieldLabel>UHID No</FieldLabel>
                  <InputWithSearch>
                    <TextInput
                      type="text"
                      placeholder="e.g. S026/002194"
                      value={formData.uhid}
                      onChange={(e) => setFormData({ ...formData, uhid: e.target.value })}
                    />
                    <SearchBtnIcon type="button" onClick={handleSearchUHID}>
                      <Search size={14} />
                    </SearchBtnIcon>
                  </InputWithSearch>
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Patient</FieldLabel>
                  {patientOptions.length > 0 ? (
                    <SelectInput
                      onChange={(e) => handlePatientSelect(Number(e.target.value))}
                    >
                      {patientOptions.map((opt, i) => (
                        <option key={i} value={i}>{opt.label}</option>
                      ))}
                    </SelectInput>
                  ) : (
                    <TextInput
                      type="text"
                      placeholder="Patient Name"
                      value={formData.patient_name}
                      onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    />
                  )}
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Age</FieldLabel>
                  <TextInput
                    type="text"
                    disabled
                    value={formData.age}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Gender</FieldLabel>
                  <RadioGroup>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="gender"
                        value="MALE"
                        checked={formData.gender === "MALE"}
                        readOnly
                      />
                      Male
                    </RadioLabel>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="gender"
                        value="FEMALE"
                        checked={formData.gender === "FEMALE"}
                        readOnly
                      />
                      Female
                    </RadioLabel>
                  </RadioGroup>
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Relationship</FieldLabel>
                  <TextInput
                    type="text"
                    disabled
                    value={formData.relationship}
                  />
                </FormGroup>
              </FormGrid>

              {/* Row 2 */}
              <FormGrid>
                <FormGroup>
                  <FieldLabel>Parent Poly Clinic</FieldLabel>
                  <TextInput
                    type="text"
                    placeholder="Parent Poly Clinic"
                    value={formData.parent_polyclinic}
                    onChange={(e) => setFormData({ ...formData, parent_polyclinic: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Visit Date & Time</FieldLabel>
                  <div style={{ display: "flex", gap: 6 }}>
                    <TextInput
                      type="date"
                      style={{ flex: 1.2 }}
                      value={formData.visit_date}
                      onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                    />
                    <TextInput
                      type="time"
                      style={{ flex: 1 }}
                      value={formData.visit_time}
                      onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })}
                    />
                  </div>
                </FormGroup>

                <FormGroup>
                  <FieldLabel>OPD Regn Date</FieldLabel>
                  <TextInput
                    type="date"
                    value={formData.opd_registration_date}
                    onChange={(e) => setFormData({ ...formData, opd_registration_date: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Referral Date</FieldLabel>
                  <TextInput
                    type="date"
                    value={formData.date_of_referral}
                    onChange={(e) => setFormData({ ...formData, date_of_referral: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Valid up to</FieldLabel>
                  <TextInput
                    type="date"
                    value={formData.valid_upto}
                    onChange={(e) => setFormData({ ...formData, valid_upto: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Consulting Doctor</FieldLabel>
                  <SelectInput
                    value={formData.consulting_doctor}
                    onChange={(e) => setFormData({ ...formData, consulting_doctor: e.target.value })}
                  >
                    <option value="">Select Doctor</option>
                    {doctorsList.map((doc, idx) => (
                      <option key={idx} value={doc.employeeName || doc.employeeId}>
                        {doc.employeeName} ({doc.department || doc.employeeId})
                      </option>
                    ))}
                    <option value="Dr. ENA">Dr. ENA - General Surgeon</option>
                    <option value="Dr. K">Dr. K - Medical Oncologist</option>
                    <option value="Dr. S">Dr. S - Orthopedics</option>
                    <option value="Dr. R">Dr. R - General Medicine</option>
                  </SelectInput>
                </FormGroup>
              </FormGrid>

              {/* Row 3 */}
              <FormGrid>
                <FormGroup>
                  <FieldLabel>Referred Poly Clinic</FieldLabel>
                  <SelectInput
                    value={formData.referred_polyclinic}
                    onChange={(e) => setFormData({ ...formData, referred_polyclinic: e.target.value })}
                  >
                    <option value="">Select Clinic</option>
                    <option value="001">001 - Salem Main</option>
                    <option value="002">002 - Dharmapuri</option>
                    <option value="003">003 - Erode</option>
                    <option value="004">004 - Namakkal</option>
                    <option value="007">007 - Krishnagiri</option>
                    <option value="011">011 - Hosur</option>
                  </SelectInput>
                </FormGroup>

                <FormGroup $span={2}>
                  <FieldLabel>Referal Number</FieldLabel>
                  <TextInput
                    type="text"
                    placeholder="e.g. 01110000246587 / 46572148"
                    value={formData.referral_number}
                    onChange={(e) => setFormData({ ...formData, referral_number: e.target.value })}
                  />
                </FormGroup>

                <FormGroup $span={1}>
                  <FieldLabel>Provisional Diagnosis</FieldLabel>
                  <TextInput
                    type="text"
                    placeholder="Diagnosis details"
                    value={formData.provisional_diagnosis}
                    onChange={(e) => setFormData({ ...formData, provisional_diagnosis: e.target.value })}
                  />
                </FormGroup>

                <FormGroup $span={2}>
                  <FieldLabel>Referred For</FieldLabel>
                  <CheckboxGroup>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={formData.admission}
                        onChange={(e) => setFormData({ ...formData, admission: e.target.checked })}
                      />
                      Admission
                    </CheckboxLabel>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={formData.consultation}
                        onChange={(e) => setFormData({ ...formData, consultation: e.target.checked })}
                      />
                      Consultation
                    </CheckboxLabel>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={formData.specified_services}
                        onChange={(e) => setFormData({ ...formData, specified_services: e.target.checked })}
                      />
                      Specified Services
                    </CheckboxLabel>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={formData.services}
                        onChange={(e) => setFormData({ ...formData, services: e.target.checked })}
                      />
                      Services
                    </CheckboxLabel>
                  </CheckboxGroup>
                </FormGroup>
              </FormGrid>
            </FormBody>

            <FormFooter>
              <ButtonSecondary type="button" onClick={handleCancelForm}>
                <X size={15} /> Cancel
              </ButtonSecondary>
              <ButtonPrimary type="submit" disabled={saving}>
                <Save size={15} /> {saving ? "Saving..." : "Save"}
              </ButtonPrimary>
            </FormFooter>
          </form>
        </FormCard>
      )}

      {/* Table Section */}
      <TableCard>
        <TableHeaderBar>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Show up to</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 12
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div style={{ position: "relative", width: 280 }}>
            <TextInput
              type="text"
              placeholder="Search visits..."
              style={{ width: "100%", paddingRight: 30 }}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchVisits()}
            />
            <Search
              size={15}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                cursor: "pointer"
              }}
              onClick={fetchVisits}
            />
          </div>
        </TableHeaderBar>

        <TableScrollArea>
          <Table>
            <TableHead>
              <tr>
                <th>Visit Ref</th>
                <th>Member ID</th>
                <th>Visit Date</th>
                <th>Visit Time</th>
                <th>Patient Name</th>
                <th>UHID No</th>
                <th>OPD Reg No</th>
                <th>OPD Reg Date</th>
                <th>Referral Number</th>
                <th>Service Number</th>
                <th>Ref Poly Clinic</th>
                <th>Referred Doctor</th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </TableHead>
            <tbody>
              {loading ? (
                <tr>
                  <TableCell colSpan={13} style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                    Loading visit entries...
                  </TableCell>
                </tr>
              ) : visits.length === 0 ? (
                <tr>
                  <TableCell colSpan={13} style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                    No member visit records found
                  </TableCell>
                </tr>
              ) : (
                visits.map((v) => (
                  <TableRow key={v.member_visit_reference}>
                    <TableCell style={{ fontWeight: 600, color: "#0f766e" }}>
                      {v.member_visit_reference}
                    </TableCell>
                    <TableCell style={{ fontWeight: 600 }}>{v.member_number}</TableCell>
                    <TableCell>{v.visit_date}</TableCell>
                    <TableCell>{v.visit_time || "-"}</TableCell>
                    <TableCell style={{ fontWeight: 500 }}>{v.patient_name || "-"}</TableCell>
                    <TableCell>{v.uhid || "-"}</TableCell>
                    <TableCell>{v.opd_registration_number || "-"}</TableCell>
                    <TableCell>{v.opd_registration_date || "-"}</TableCell>
                    <TableCell>{v.referral_number || "-"}</TableCell>
                    <TableCell>{v.service_number || "-"}</TableCell>
                    <TableCell>{v.referred_polyclinic || "-"}</TableCell>
                    <TableCell>{v.consulting_doctor || v.referred_doctor || "-"}</TableCell>
                    <TableCell>
                      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                        <IconButton
                          $color="#0284c7"
                          $hoverColor="#0369a1"
                          title="Edit Visit"
                          onClick={() => handleEditVisit(v)}
                        >
                          <Edit2 size={14} />
                        </IconButton>
                        <IconButton
                          $color="#ef4444"
                          $hoverColor="#b91c1c"
                          title="Delete Visit"
                          onClick={() => handleDeleteVisit(v.member_visit_reference)}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>
        </TableScrollArea>

        <TableFooterBar>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Showing {visits.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalVisits)} of {totalVisits} entries
          </div>
          <Pagination>
            <PageBtn
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </PageBtn>
            <PageBtn $active={true}>{page}</PageBtn>
            {totalVisits > page * limit && (
              <PageBtn onClick={() => setPage(p => p + 1)}>{page + 1}</PageBtn>
            )}
            <PageBtn
              disabled={page * limit >= totalVisits}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </PageBtn>
          </Pagination>
        </TableFooterBar>
      </TableCard>
    </PageContainer>
  );
};

export default InsuranceMemberVisit;
