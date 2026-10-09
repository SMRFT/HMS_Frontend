import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  Users,
  Eye,
  FileText
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";

// Styling constants
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
  textMuted: "#64748b",
  headerTeal: "#133d34",
  buttonTeal: "#133d34"
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
  box-sizing: border-box;
`;

const BreadcrumbBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

const TopButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const OrangeButton = styled.button`
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    background-color: #b45309;
    transform: translateY(-1px);
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 18px;
  flex: 1;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

// Left Card: Member List & Filter
const LeftCard = styled.div`
  background: ${THEME.cardBg};
  border-radius: 8px;
  border: 1px solid ${THEME.borderLight};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 140px);
`;

const LeftHeader = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid ${THEME.borderLight};
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FieldLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  display: block;
  margin-bottom: 4px;

  span.required {
    color: #ef4444;
    margin-left: 2px;
  }
`;

const SelectInput = styled.select`
  width: 100%;
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
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 7px 32px 7px 10px;
  border-radius: 6px;
  border: 1px solid ${THEME.border};
  font-size: 13px;
  color: ${THEME.textMain};
  background-color: #ffffff;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: ${THEME.teal};
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
  }
`;

const SearchIconRight = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  cursor: pointer;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: ${THEME.textMuted};
`;

const TableScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
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
  cursor: pointer;
  background-color: ${props => props.$isSelected ? "#f0fdf4" : "transparent"};
  transition: background-color 0.15s;

  &:hover {
    background-color: ${props => props.$isSelected ? "#ecfdf5" : "#f8fafc"};
  }
`;

const TableCell = styled.td`
  padding: 10px 12px;
  color: ${THEME.textMain};
  vertical-align: middle;
  white-space: nowrap;
`;

const MemberIdBadge = styled.span`
  font-weight: 600;
  color: #0f766e;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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

// Right Card: New / Edit Member Form
const RightCard = styled.div`
  background: ${THEME.cardBg};
  border-radius: 8px;
  border: 1px solid ${THEME.borderLight};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 140px);
`;

const RightCardHeader = styled.div`
  padding: 12px 18px;
  background-color: #ffffff;
  border-bottom: 1px solid ${THEME.borderLight};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionHeaderButton = styled.div`
  background-color: #133d34;
  color: #ffffff;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const FormScrollArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  grid-column: span ${props => props.$span || 1};
  display: flex;
  flex-direction: column;
`;

const TextInput = styled.input`
  width: 100%;
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
    color: #94a3b8;
    cursor: not-allowed;
  }
`;

const InputWithButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const InputSearchButton = styled.button`
  background-color: #133d34;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 7px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0e2c25;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  height: 35px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${THEME.textMain};
  cursor: pointer;

  input {
    cursor: pointer;
    accent-color: #133d34;
  }
`;

const AgeInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FormFooter = styled.div`
  padding: 14px 20px;
  background-color: #f8fafc;
  border-top: 1px solid ${THEME.borderLight};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
`;

const ButtonPrimary = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #133d34;
  color: #ffffff;
  border: none;
  padding: 8px 18px;
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
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #1e293b;
  }
`;

// --- Modal Styled Components ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  width: ${props => props.$width || "95%"};
  max-width: ${props => props.$maxWidth || "1200px"};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const ModalHeader = styled.div`
  background-color: #133d34;
  color: #ffffff;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
`;

const ModalCloseBtn = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
`;

const ModalTabBar = styled.div`
  display: flex;
  border-bottom: 1px solid ${THEME.borderLight};
  background-color: #f8fafc;
  padding: 0 16px;
`;

const ModalTab = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 18px;
  border: none;
  background: none;
  font-size: 13.5px;
  font-weight: 600;
  color: ${props => props.$active ? "#0f766e" : "#64748b"};
  border-bottom: 2px solid ${props => props.$active ? "#0f766e" : "transparent"};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #0f766e;
  }
`;

const ModalFilterBar = styled.div`
  padding: 16px 20px;
  display: flex;
  align-items: flex-end;
  gap: 14px;
  flex-wrap: wrap;
  border-bottom: 1px solid ${THEME.borderLight};
  background-color: #ffffff;
`;

const ModalTableArea = styled.div`
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  min-height: 320px;
  max-height: 50vh;
`;

const ModalFooter = styled.div`
  padding: 12px 20px;
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

// ==========================================
// MAIN COMPONENT: InsuranceMemberMaster
// ==========================================

const InsuranceMemberMaster = () => {
  const HMS_URL = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "";

  // Left List States
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [selectedMember, setSelectedMember] = useState(null);

  // Form State
  const initialFormState = {
    member_number: "",
    uhid: "",
    member_first_name: "",
    member_middle_name: "",
    member_last_name: "",
    guardian: "",
    member_address_1: "",
    member_address_2: "",
    member_address_3: "",
    area: "",
    member_phone: "",
    member_sex: "MALE",
    member_age: "",
    member_age_type: "YEARS",
    member_dob: "",
    parent_polyclinic: "",
    insurance_type: "001",
    scheme_category: "00001",
    scheme_subcategory: "00001",
    card_no: "",
    referral_number: "",
    rank: "",
    service_number: "",
    class_type: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState("Member Query");
  const [modalCategory, setModalCategory] = useState("ALL");
  const [modalSubCategory, setModalSubCategory] = useState("ALL");
  const [modalSearchBy, setModalSearchBy] = useState("Member Name");
  const [modalSearchInput, setModalSearchInput] = useState("");
  const [modalData, setModalData] = useState([]);
  const [modalTotal, setModalTotal] = useState(0);
  const [modalPage, setModalPage] = useState(1);
  const [modalLimit, setModalLimit] = useState(10);
  const [modalLoading, setModalLoading] = useState(false);

  // Dependents Modal States
  const [isDependentsModalOpen, setIsDependentsModalOpen] = useState(false);
  const [activeDependents, setActiveDependents] = useState([]);
  const [dependentForm, setDependentForm] = useState({
    dependent_name: "",
    relationship: "Wife",
    age: "",
    gender: "FEMALE",
    card_no: "",
    uhid: ""
  });
  const [depSaving, setDepSaving] = useState(false);

  // --- Fetch Members for Left Panel ---
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${HMS_URL}insurance-members/?limit=${pageSize}`;
      if (categoryFilter && categoryFilter !== "ALL") {
        url += `&category=${encodeURIComponent(categoryFilter)}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await apiRequest(url, "GET");
      if (res.success) {
        const list = Array.isArray(res.data) 
          ? res.data 
          : (Array.isArray(res.data?.data) ? res.data.data : []);
        setMembers(list);
      } else {
        toast.error(res.error || "Failed to load members");
        setMembers([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching insurance members");
    } finally {
      setLoading(false);
    }
  }, [HMS_URL, categoryFilter, searchQuery, pageSize]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // --- Search Patient by UHID to auto-fill form ---
  const handleSearchUHID = async () => {
    if (!formData.uhid.trim()) {
      toast.warn("Please enter a UHID number to search");
      return;
    }
    try {
      const res = await apiRequest(`${HMS_URL}insurance-search-patient/?uhid=${encodeURIComponent(formData.uhid.trim())}`, "GET");
      if (res.success && res.data) {
        const p = res.data;
        setFormData(prev => ({
          ...prev,
          uhid: p.uhid || prev.uhid,
          member_first_name: p.firstName || "",
          member_last_name: p.lastName || "",
          member_phone: p.mobilePhone || prev.member_phone,
          member_address_1: p.address || "",
          area: p.area || prev.area,
          member_sex: (p.gender || "MALE").toUpperCase(),
          member_age: p.age || "",
          member_dob: p.dob || ""
        }));
        toast.success(`Patient ${p.firstName} found and loaded!`);
      } else {
        toast.error(res.error || "No patient found with this UHID");
      }
    } catch (err) {
      toast.error("Error fetching patient details");
    }
  };

  // --- Select Member to Edit ---
  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setIsEditing(true);
    setFormData({
      member_number: member.member_number || "",
      uhid: member.uhid || "",
      member_first_name: member.member_first_name || "",
      member_middle_name: member.member_middle_name || "",
      member_last_name: member.member_last_name || "",
      guardian: member.guardian || "",
      member_address_1: member.member_address_1 || "",
      member_address_2: member.member_address_2 || "",
      member_address_3: member.member_address_3 || "",
      area: member.area || "",
      member_phone: member.member_phone || "",
      member_sex: member.member_sex || "MALE",
      member_age: member.member_age != null ? member.member_age : "",
      member_age_type: member.member_age_type || "YEARS",
      member_dob: member.member_dob || "",
      parent_polyclinic: member.parent_polyclinic || "",
      insurance_type: member.insurance_type || "001",
      scheme_category: member.scheme_category || "00001",
      scheme_subcategory: member.scheme_subcategory || "00001",
      card_no: member.card_no || member.echs_card || "",
      referral_number: member.referral_number || "",
      rank: member.rank || member.esm_rank || "",
      service_number: member.service_number || "",
      class_type: member.class_type || member.regiment || ""
    });
  };

  // --- Reset Form ---
  const handleCancelForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setSelectedMember(null);
  };

  // --- Save / Update Member ---
  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!formData.member_first_name.trim()) {
      toast.error("Member First Name is required");
      return;
    }

    setSaving(true);
    try {
      let res;
      if (isEditing && formData.member_number) {
        res = await apiRequest(`${HMS_URL}insurance-members/${encodeURIComponent(formData.member_number)}/`, "PATCH", formData);
      } else {
        res = await apiRequest(`${HMS_URL}insurance-members/`, "POST", formData);
      }

      if (res.success) {
        toast.success(isEditing ? "Member updated successfully!" : "Member created successfully!");
        fetchMembers();
        handleCancelForm();
      } else {
        toast.error(res.error || "Failed to save member");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving member");
    } finally {
      setSaving(false);
    }
  };

  // --- Delete Member ---
  const handleDeleteMember = async (memberNumber, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete member ${memberNumber}?`)) return;

    try {
      const res = await apiRequest(`${HMS_URL}insurance-members/${encodeURIComponent(memberNumber)}/`, "DELETE");
      if (res.success) {
        toast.success("Member deleted successfully");
        fetchMembers();
        if (selectedMember && selectedMember.member_number === memberNumber) {
          handleCancelForm();
        }
      } else {
        toast.error(res.error || "Failed to delete member");
      }
    } catch (err) {
      toast.error("Error deleting member");
    }
  };

  // --- Modal Search Data ---
  const fetchModalData = useCallback(async () => {
    setModalLoading(true);
    try {
      let url = `${HMS_URL}insurance-members/?page=${modalPage}&limit=${modalLimit}`;
      if (modalCategory && modalCategory !== "ALL") {
        url += `&category=${encodeURIComponent(modalCategory)}`;
      }
      if (modalSubCategory && modalSubCategory !== "ALL") {
        url += `&subcategory=${encodeURIComponent(modalSubCategory)}`;
      }
      if (modalSearchInput.trim()) {
        url += `&search=${encodeURIComponent(modalSearchInput.trim())}&search_by=${encodeURIComponent(modalSearchBy)}`;
      }

      const res = await apiRequest(url, "GET");
      if (res.success) {
        const list = Array.isArray(res.data) 
          ? res.data 
          : (Array.isArray(res.data?.data) ? res.data.data : []);
        const total = typeof res.data?.total_count === "number" 
          ? res.data.total_count 
          : (res.total_count || list.length);
        setModalData(list);
        setModalTotal(total);
      } else {
        setModalData([]);
      }
    } catch (err) {
      console.error(err);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  }, [HMS_URL, modalPage, modalLimit, modalCategory, modalSubCategory, modalSearchInput, modalSearchBy]);

  useEffect(() => {
    if (isViewModalOpen) {
      fetchModalData();
    }
  }, [isViewModalOpen, fetchModalData]);

  // --- Open Dependents Modal ---
  const handleOpenDependents = async () => {
    const memberNum = formData.member_number || (selectedMember && selectedMember.member_number);
    if (!memberNum) {
      toast.warn("Please select a Member from the list first to view or add dependents");
      return;
    }
    setIsDependentsModalOpen(true);
    fetchDependents(memberNum);
  };

  const fetchDependents = async (memberNum) => {
    try {
      const res = await apiRequest(`${HMS_URL}insurance-dependents/${encodeURIComponent(memberNum)}/`, "GET");
      if (res.success) {
        const list = Array.isArray(res.data) 
          ? res.data 
          : (Array.isArray(res.data?.data) ? res.data.data : []);
        setActiveDependents(list);
      } else {
        setActiveDependents([]);
      }
    } catch (err) {
      console.error(err);
      setActiveDependents([]);
    }
  };

  const handleAddDependent = async (e) => {
    e.preventDefault();
    const memberNum = formData.member_number || (selectedMember && selectedMember.member_number);
    if (!dependentForm.dependent_name.trim()) {
      toast.error("Dependent Name is required");
      return;
    }
    setDepSaving(true);
    try {
      const res = await apiRequest(`${HMS_URL}insurance-dependents/`, "POST", {
        member_number: memberNum,
        ...dependentForm
      });
      if (res.success) {
        toast.success("Dependent added successfully");
        setDependentForm({
          dependent_name: "",
          relationship: "Wife",
          age: "",
          gender: "FEMALE",
          card_no: "",
          uhid: ""
        });
        fetchDependents(memberNum);
      } else {
        toast.error(res.error || "Failed to add dependent");
      }
    } catch (err) {
      toast.error("Error adding dependent");
    } finally {
      setDepSaving(false);
    }
  };

  const handleDeleteDependent = async (depId) => {
    const memberNum = formData.member_number || (selectedMember && selectedMember.member_number);
    try {
      const res = await apiRequest(`${HMS_URL}insurance-dependents/detail/${depId}/`, "DELETE");
      if (res.success) {
        toast.success("Dependent removed");
        fetchDependents(memberNum);
      }
    } catch (err) {
      toast.error("Error removing dependent");
    }
  };

  return (
    <PageContainer>
      {/* Top Breadcrumb & Action Buttons */}
      <BreadcrumbBar>
        <Breadcrumb>
          Home / <span>Insurance Member Master</span>
        </Breadcrumb>
        <TopButtonGroup>
          <OrangeButton onClick={() => setIsViewModalOpen(true)}>
            <Eye size={15} /> View Member Details
          </OrangeButton>
          <OrangeButton onClick={handleOpenDependents}>
            <Users size={15} /> Dependents
          </OrangeButton>
        </TopButtonGroup>
      </BreadcrumbBar>

      {/* Main Grid: Left Member List, Right Form */}
      <MainGrid>
        {/* Left Side: Filter & List */}
        <LeftCard>
          <LeftHeader>
            <div>
              <FieldLabel>Category</FieldLabel>
              <SelectInput
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">ALL</option>
                <option value="00001">00001 - ECHS General</option>
                <option value="00002">00002 - Officers</option>
                <option value="00050">00050 - ESM Dependents</option>
                <option value="TNHIS">TNHIS Scheme</option>
                <option value="RAILWAYS">Railways</option>
              </SelectInput>
            </div>

            <SearchInputWrapper>
              <SearchInput
                type="text"
                placeholder="Search by ID, Name, Card..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIconRight onClick={fetchMembers}>
                <Search size={16} />
              </SearchIconRight>
            </SearchInputWrapper>

            <FilterRow>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>Show up to</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  style={{
                    padding: "3px 6px",
                    borderRadius: 4,
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
              <div>{members.length} members loaded</div>
            </FilterRow>
          </LeftHeader>

          <TableScrollArea>
            <Table>
              <TableHead>
                <tr>
                  <th>Member ID</th>
                  <th>Member Name</th>
                  <th>ECHS Card</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </TableHead>
              <tbody>
                {loading ? (
                  <tr>
                    <TableCell colSpan={4} style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                      Loading insurance members...
                    </TableCell>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <TableCell colSpan={4} style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                      No members found
                    </TableCell>
                  </tr>
                ) : (
                  members.map((m) => {
                    const isSelected = selectedMember && selectedMember.member_number === m.member_number;
                    return (
                      <TableRow
                        key={m.member_number}
                        $isSelected={isSelected}
                        onClick={() => handleSelectMember(m)}
                      >
                        <TableCell>
                          <MemberIdBadge>{m.member_number}</MemberIdBadge>
                        </TableCell>
                        <TableCell style={{ fontWeight: 500 }}>
                          {m.member_name || m.member_first_name}
                        </TableCell>
                        <TableCell style={{ color: "#64748b" }}>
                          {m.echs_card || m.card_no || "-"}
                        </TableCell>
                        <TableCell>
                          <ActionButtons style={{ justifyContent: "center" }}>
                            <IconButton
                              $color="#0284c7"
                              $hoverColor="#0369a1"
                              title="Edit Member"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectMember(m);
                              }}
                            >
                              <Edit2 size={14} />
                            </IconButton>
                            <IconButton
                              $color="#ef4444"
                              $hoverColor="#b91c1c"
                              title="Delete Member"
                              onClick={(e) => handleDeleteMember(m.member_number, e)}
                            >
                              <Trash2 size={14} />
                            </IconButton>
                          </ActionButtons>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </tbody>
            </Table>
          </TableScrollArea>
        </LeftCard>

        {/* Right Side: Form */}
        <RightCard>
          <RightCardHeader>
            <SectionHeaderButton>
              {isEditing ? <Edit2 size={14} /> : <Plus size={14} />}
              {isEditing ? `Edit Member: ${formData.member_number}` : "- New Member"}
            </SectionHeaderButton>
            {isEditing && (
              <ButtonSecondary
                type="button"
                onClick={handleCancelForm}
                style={{ padding: "4px 10px", fontSize: 12 }}
              >
                <Plus size={13} /> Add New Instead
              </ButtonSecondary>
            )}
          </RightCardHeader>

          <form onSubmit={handleSaveMember} style={{ display: "contents" }}>
            <FormScrollArea>
              <FormGrid>
                {/* Row 1 */}
                <FormGroup>
                  <FieldLabel>UHID</FieldLabel>
                  <InputWithButtonWrapper>
                    <TextInput
                      type="text"
                      placeholder="e.g. S023/002773"
                      value={formData.uhid}
                      onChange={(e) => setFormData({ ...formData, uhid: e.target.value })}
                    />
                    <InputSearchButton
                      type="button"
                      title="Search Patient by UHID"
                      onClick={handleSearchUHID}
                    >
                      <Search size={14} />
                    </InputSearchButton>
                  </InputWithButtonWrapper>
                </FormGroup>

                <FormGroup>
                  <FieldLabel>
                    Member First Name <span className="required">*</span>
                  </FieldLabel>
                  <TextInput
                    type="text"
                    required
                    value={formData.member_first_name}
                    onChange={(e) => setFormData({ ...formData, member_first_name: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Middle Name</FieldLabel>
                  <TextInput
                    type="text"
                    value={formData.member_middle_name}
                    onChange={(e) => setFormData({ ...formData, member_middle_name: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Last Name</FieldLabel>
                  <TextInput
                    type="text"
                    value={formData.member_last_name}
                    onChange={(e) => setFormData({ ...formData, member_last_name: e.target.value })}
                  />
                </FormGroup>

                {/* Row 2 */}
                <FormGroup>
                  <FieldLabel>Guardian</FieldLabel>
                  <TextInput
                    type="text"
                    value={formData.guardian}
                    onChange={(e) => setFormData({ ...formData, guardian: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Member Address Line1</FieldLabel>
                  <TextInput
                    type="text"
                    value={formData.member_address_1}
                    onChange={(e) => setFormData({ ...formData, member_address_1: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Address Line2</FieldLabel>
                  <TextInput
                    type="text"
                    value={formData.member_address_2}
                    onChange={(e) => setFormData({ ...formData, member_address_2: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Address Line3</FieldLabel>
                  <TextInput
                    type="text"
                    value={formData.member_address_3}
                    onChange={(e) => setFormData({ ...formData, member_address_3: e.target.value })}
                  />
                </FormGroup>

                {/* Row 3 */}
                <FormGroup>
                  <FieldLabel>
                    Area <span className="required">*</span>
                  </FieldLabel>
                  <TextInput
                    type="text"
                    required
                    placeholder="Enter or select Area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Phone</FieldLabel>
                  <TextInput
                    type="tel"
                    value={formData.member_phone}
                    onChange={(e) => setFormData({ ...formData, member_phone: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Gender</FieldLabel>
                  <RadioGroup>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="member_sex"
                        value="MALE"
                        checked={formData.member_sex === "MALE"}
                        onChange={() => setFormData({ ...formData, member_sex: "MALE" })}
                      />
                      Male
                    </RadioLabel>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="member_sex"
                        value="FEMALE"
                        checked={formData.member_sex === "FEMALE"}
                        onChange={() => setFormData({ ...formData, member_sex: "FEMALE" })}
                      />
                      Female
                    </RadioLabel>
                  </RadioGroup>
                </FormGroup>

                <FormGroup>
                  <FieldLabel>
                    Age <span className="required">*</span>
                  </FieldLabel>
                  <AgeInputGroup>
                    <TextInput
                      type="number"
                      required
                      placeholder="Year"
                      style={{ flex: 1 }}
                      value={formData.member_age}
                      onChange={(e) => setFormData({ ...formData, member_age: e.target.value })}
                    />
                    <SelectInput
                      style={{ width: 100 }}
                      value={formData.member_age_type}
                      onChange={(e) => setFormData({ ...formData, member_age_type: e.target.value })}
                    >
                      <option value="YEARS">YEARS</option>
                      <option value="MONTHS">MONTHS</option>
                      <option value="DAYS">DAYS</option>
                    </SelectInput>
                  </AgeInputGroup>
                </FormGroup>

                {/* Row 4 */}
                <FormGroup>
                  <FieldLabel>Date Of Birth</FieldLabel>
                  <TextInput
                    type="date"
                    value={formData.member_dob}
                    onChange={(e) => setFormData({ ...formData, member_dob: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Parent Poly Clinic</FieldLabel>
                  <SelectInput
                    value={formData.parent_polyclinic}
                    onChange={(e) => setFormData({ ...formData, parent_polyclinic: e.target.value })}
                  >
                    <option value="">Select Poly Clinic</option>
                    <option value="001">001 - Salem Main</option>
                    <option value="002">002 - Dharmapuri</option>
                    <option value="003">003 - Erode</option>
                    <option value="004">004 - Namakkal</option>
                    <option value="007">007 - Krishnagiri</option>
                    <option value="011">011 - Hosur</option>
                  </SelectInput>
                </FormGroup>

                <FormGroup>
                  <FieldLabel>
                    Type <span className="required">*</span>
                  </FieldLabel>
                  <SelectInput
                    value={formData.insurance_type}
                    onChange={(e) => setFormData({ ...formData, insurance_type: e.target.value })}
                  >
                    <option value="001">001 - ECHS / Ex-Servicemen</option>
                    <option value="002">002 - State Govt Scheme</option>
                    <option value="003">003 - Private TPA</option>
                  </SelectInput>
                </FormGroup>

                <FormGroup>
                  <FieldLabel>
                    Category <span className="required">*</span>
                  </FieldLabel>
                  <SelectInput
                    value={formData.scheme_category}
                    onChange={(e) => setFormData({ ...formData, scheme_category: e.target.value })}
                  >
                    <option value="00001">00001 - General</option>
                    <option value="00002">00002 - Officer</option>
                    <option value="00050">00050 - Dependent</option>
                  </SelectInput>
                </FormGroup>

                {/* Row 5 */}
                <FormGroup>
                  <FieldLabel>
                    Sub Category <span className="required">*</span>
                  </FieldLabel>
                  <SelectInput
                    value={formData.scheme_subcategory}
                    onChange={(e) => setFormData({ ...formData, scheme_subcategory: e.target.value })}
                  >
                    <option value="00001">00001 - Regular</option>
                    <option value="00002">00002 - Priority</option>
                    <option value="00050">00050 - Pensioner</option>
                  </SelectInput>
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Card No/Reg No</FieldLabel>
                  <TextInput
                    type="text"
                    placeholder="e.g. CO000008312746"
                    value={formData.card_no}
                    onChange={(e) => setFormData({ ...formData, card_no: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Referal No</FieldLabel>
                  <TextInput
                    type="text"
                    placeholder="e.g. SLM/SHA/2392"
                    value={formData.referral_number}
                    onChange={(e) => setFormData({ ...formData, referral_number: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Rank</FieldLabel>
                  <SelectInput
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  >
                    <option value="">Select Rank</option>
                    <option value="HAV">HAV - Havildar</option>
                    <option value="SUB">SUB - Subedar</option>
                    <option value="MAJ">MAJ - Major</option>
                    <option value="CAPT">CAPT - Captain</option>
                    <option value="COL">COL - Colonel</option>
                    <option value="SEP">SEP - Sepoy</option>
                    <option value="NAIK">NAIK - Naik</option>
                    <option value="CIV">CIV - Civilian</option>
                  </SelectInput>
                </FormGroup>

                {/* Row 6 */}
                <FormGroup>
                  <FieldLabel>Service No</FieldLabel>
                  <TextInput
                    type="text"
                    placeholder="e.g. 46802591"
                    value={formData.service_number}
                    onChange={(e) => setFormData({ ...formData, service_number: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FieldLabel>Class</FieldLabel>
                  <SelectInput
                    value={formData.class_type}
                    onChange={(e) => setFormData({ ...formData, class_type: e.target.value })}
                  >
                    <option value="">Select Class</option>
                    <option value="ARMY">Army</option>
                    <option value="NAVY">Navy</option>
                    <option value="AIR_FORCE">Air Force</option>
                    <option value="GENERAL">General</option>
                  </SelectInput>
                </FormGroup>
              </FormGrid>
            </FormScrollArea>

            <FormFooter>
              <ButtonSecondary type="button" onClick={handleCancelForm}>
                <X size={15} /> Cancel
              </ButtonSecondary>
              <ButtonPrimary type="submit" disabled={saving}>
                <Save size={15} /> {saving ? "Saving..." : "Save"}
              </ButtonPrimary>
            </FormFooter>
          </form>
        </RightCard>
      </MainGrid>

      {/* ========================================== */}
      {/* MODAL 1: VIEW MEMBER DETAILS (Screenshot 2) */}
      {/* ========================================== */}
      {isViewModalOpen && (
        <ModalOverlay onClick={() => setIsViewModalOpen(false)}>
          <ModalContainer $maxWidth="1350px" onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>View Member Details</h2>
              <ModalCloseBtn onClick={() => setIsViewModalOpen(false)}>
                <X size={20} />
              </ModalCloseBtn>
            </ModalHeader>

            <ModalTabBar>
              <ModalTab
                $active={modalActiveTab === "Member Visits"}
                onClick={() => setModalActiveTab("Member Visits")}
              >
                <FileText size={15} /> Member Visits
              </ModalTab>
              <ModalTab
                $active={modalActiveTab === "Member Query"}
                onClick={() => setModalActiveTab("Member Query")}
              >
                <Search size={15} /> Member Query
              </ModalTab>
            </ModalTabBar>

            <ModalFilterBar>
              <div style={{ width: 180 }}>
                <FieldLabel>Scheme Category</FieldLabel>
                <SelectInput
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value)}
                >
                  <option value="ALL">ALL</option>
                  <option value="00001">00001 - ECHS General</option>
                  <option value="00002">00002 - Officers</option>
                  <option value="00050">00050 - Dependent</option>
                </SelectInput>
              </div>

              <div style={{ width: 180 }}>
                <FieldLabel>Sub Category</FieldLabel>
                <SelectInput
                  value={modalSubCategory}
                  onChange={(e) => setModalSubCategory(e.target.value)}
                >
                  <option value="ALL">ALL</option>
                  <option value="00001">00001</option>
                  <option value="00002">00002</option>
                  <option value="00050">00050</option>
                </SelectInput>
              </div>

              <div style={{ width: 160 }}>
                <FieldLabel>Search By</FieldLabel>
                <SelectInput
                  value={modalSearchBy}
                  onChange={(e) => setModalSearchBy(e.target.value)}
                >
                  <option value="Member Name">Member Name</option>
                  <option value="Member ID">Member ID</option>
                  <option value="UHID No">UHID No</option>
                  <option value="Phone">Phone</option>
                  <option value="ECHS Card">ECHS Card</option>
                  <option value="Service No">Service No</option>
                </SelectInput>
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <FieldLabel>&nbsp;</FieldLabel>
                <TextInput
                  type="text"
                  placeholder={`Search ${modalSearchBy}...`}
                  value={modalSearchInput}
                  onChange={(e) => setModalSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchModalData()}
                />
              </div>

              <div>
                <FieldLabel>&nbsp;</FieldLabel>
                <ButtonPrimary type="button" onClick={fetchModalData}>
                  <Search size={14} /> Search
                </ButtonPrimary>
              </div>

              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Show up to</span>
                <select
                  value={modalLimit}
                  onChange={(e) => {
                    setModalLimit(Number(e.target.value));
                    setModalPage(1);
                  }}
                  style={{
                    padding: "6px 10px",
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
            </ModalFilterBar>

            <ModalTableArea>
              <Table>
                <TableHead>
                  <tr>
                    <th>Member ID</th>
                    <th>UHID No</th>
                    <th>Member Name</th>
                    <th>Address1</th>
                    <th>Address2</th>
                    <th>Address3</th>
                    <th>Phone</th>
                    <th>Policy</th>
                    <th>DOC</th>
                    <th>DOE</th>
                    <th>Proposer</th>
                    <th>Serial Number</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Insured Amount</th>
                    <th>Balance Amount</th>
                    <th>Premium</th>
                    <th>Collected</th>
                    <th>Reg Date</th>
                    <th>Reg Fee</th>
                    <th>Nominee</th>
                    <th>ECHS Card</th>
                    <th>Smart Card</th>
                    <th>ESM Rank</th>
                    <th>Regiment</th>
                    <th>Parent Policy Clinic</th>
                    <th>Receipt</th>
                    <th>Prev Policy</th>
                    <th style={{ textAlign: "center" }}>Action</th>
                  </tr>
                </TableHead>
                <tbody>
                  {modalLoading ? (
                    <tr>
                      <TableCell colSpan={29} style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                        Loading member queries...
                      </TableCell>
                    </tr>
                  ) : modalData.length === 0 ? (
                    <tr>
                      <TableCell colSpan={29} style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                        No records found
                      </TableCell>
                    </tr>
                  ) : (
                    modalData.map((row) => (
                      <TableRow key={row.member_number}>
                        <TableCell><MemberIdBadge>{row.member_number}</MemberIdBadge></TableCell>
                        <TableCell>{row.uhid || "-"}</TableCell>
                        <TableCell style={{ fontWeight: 600 }}>{row.member_name || row.member_first_name}</TableCell>
                        <TableCell>{row.member_address_1 || "-"}</TableCell>
                        <TableCell>{row.member_address_2 || "-"}</TableCell>
                        <TableCell>{row.member_address_3 || "-"}</TableCell>
                        <TableCell>{row.member_phone || "-"}</TableCell>
                        <TableCell>{row.policy_number || "-"}</TableCell>
                        <TableCell>{row.date_of_commencement || "-"}</TableCell>
                        <TableCell>{row.date_of_expiry || "-"}</TableCell>
                        <TableCell>{row.proposer || "-"}</TableCell>
                        <TableCell>{row.serial_number || "-"}</TableCell>
                        <TableCell>{row.member_age || "-"}</TableCell>
                        <TableCell>{row.member_sex || "-"}</TableCell>
                        <TableCell>{row.insured_amount || "0.00"}</TableCell>
                        <TableCell>{row.balance_amount || "0.00"}</TableCell>
                        <TableCell>{row.premium_amount || "0.00"}</TableCell>
                        <TableCell>{row.amount_collected || "0.00"}</TableCell>
                        <TableCell>{row.registration_date || "-"}</TableCell>
                        <TableCell>{row.registration_fee || "0.00"}</TableCell>
                        <TableCell>{row.nominee || "-"}</TableCell>
                        <TableCell>{row.echs_card || row.card_no || "-"}</TableCell>
                        <TableCell>{row.smart_card || "-"}</TableCell>
                        <TableCell>{row.esm_rank || row.rank || "-"}</TableCell>
                        <TableCell>{row.regiment || row.class_type || "-"}</TableCell>
                        <TableCell>{row.parent_polyclinic || "-"}</TableCell>
                        <TableCell>{row.receipt || "-"}</TableCell>
                        <TableCell>{row.prev_policy || "-"}</TableCell>
                        <TableCell>
                          <ActionButtons style={{ justifyContent: "center" }}>
                            <IconButton
                              $color="#0f766e"
                              title="Load into Form"
                              onClick={() => {
                                handleSelectMember(row);
                                setIsViewModalOpen(false);
                              }}
                            >
                              <Edit2 size={14} />
                            </IconButton>
                          </ActionButtons>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </tbody>
              </Table>
            </ModalTableArea>

            <ModalFooter>
              <div style={{ fontSize: 13, color: "#64748b" }}>
                Showing {(modalPage - 1) * modalLimit + 1} to {Math.min(modalPage * modalLimit, modalTotal)} of {modalTotal} entries
              </div>
              <Pagination>
                <PageBtn
                  disabled={modalPage <= 1}
                  onClick={() => setModalPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </PageBtn>
                <PageBtn $active={true}>{modalPage}</PageBtn>
                {modalTotal > modalPage * modalLimit && (
                  <PageBtn onClick={() => setModalPage(p => p + 1)}>{modalPage + 1}</PageBtn>
                )}
                <PageBtn
                  disabled={modalPage * modalLimit >= modalTotal}
                  onClick={() => setModalPage(p => p + 1)}
                >
                  Next
                </PageBtn>
              </Pagination>
            </ModalFooter>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* ========================================== */}
      {/* MODAL 2: DEPENDENTS MANAGEMENT */}
      {/* ========================================== */}
      {isDependentsModalOpen && (
        <ModalOverlay onClick={() => setIsDependentsModalOpen(false)}>
          <ModalContainer $maxWidth="900px" onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Dependents for Member: {formData.member_number || (selectedMember && selectedMember.member_number)}</h2>
              <ModalCloseBtn onClick={() => setIsDependentsModalOpen(false)}>
                <X size={20} />
              </ModalCloseBtn>
            </ModalHeader>

            <div style={{ padding: 20 }}>
              <form onSubmit={handleAddDependent} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#133d34" }}>
                  + Add New Dependent
                </div>
                <FormGrid style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                  <FormGroup>
                    <FieldLabel>Dependent Name <span className="required">*</span></FieldLabel>
                    <TextInput
                      type="text"
                      required
                      value={dependentForm.dependent_name}
                      onChange={(e) => setDependentForm({ ...dependentForm, dependent_name: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FieldLabel>Relationship</FieldLabel>
                    <SelectInput
                      value={dependentForm.relationship}
                      onChange={(e) => setDependentForm({ ...dependentForm, relationship: e.target.value })}
                    >
                      <option value="Wife">Wife</option>
                      <option value="Husband">Husband</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Other">Other</option>
                    </SelectInput>
                  </FormGroup>

                  <FormGroup>
                    <FieldLabel>Gender</FieldLabel>
                    <SelectInput
                      value={dependentForm.gender}
                      onChange={(e) => setDependentForm({ ...dependentForm, gender: e.target.value })}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </SelectInput>
                  </FormGroup>

                  <FormGroup>
                    <FieldLabel>Age</FieldLabel>
                    <TextInput
                      type="number"
                      value={dependentForm.age}
                      onChange={(e) => setDependentForm({ ...dependentForm, age: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FieldLabel>Card No</FieldLabel>
                    <TextInput
                      type="text"
                      value={dependentForm.card_no}
                      onChange={(e) => setDependentForm({ ...dependentForm, card_no: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FieldLabel>UHID No</FieldLabel>
                    <TextInput
                      type="text"
                      value={dependentForm.uhid}
                      onChange={(e) => setDependentForm({ ...dependentForm, uhid: e.target.value })}
                    />
                  </FormGroup>
                </FormGrid>

                <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                  <ButtonPrimary type="submit" disabled={depSaving}>
                    <Plus size={14} /> {depSaving ? "Adding..." : "Add Dependent"}
                  </ButtonPrimary>
                </div>
              </form>

              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#475569" }}>
                Active Dependents ({activeDependents.length})
              </div>
              <Table>
                <TableHead>
                  <tr>
                    <th>Sl No</th>
                    <th>Dependent Name</th>
                    <th>Relationship</th>
                    <th>Gender</th>
                    <th>Age</th>
                    <th>Card No</th>
                    <th>UHID</th>
                    <th style={{ textAlign: "center" }}>Action</th>
                  </tr>
                </TableHead>
                <tbody>
                  {activeDependents.length === 0 ? (
                    <tr>
                      <TableCell colSpan={8} style={{ textAlign: "center", padding: 20, color: "#94a3b8" }}>
                        No dependents recorded for this member.
                      </TableCell>
                    </tr>
                  ) : (
                    activeDependents.map((dep, idx) => (
                      <TableRow key={dep.id || idx}>
                        <TableCell>{dep.dependent_sl_no || idx + 1}</TableCell>
                        <TableCell style={{ fontWeight: 600 }}>{dep.dependent_name}</TableCell>
                        <TableCell>{dep.relationship}</TableCell>
                        <TableCell>{dep.gender}</TableCell>
                        <TableCell>{dep.age || "-"}</TableCell>
                        <TableCell>{dep.card_no || "-"}</TableCell>
                        <TableCell>{dep.uhid || "-"}</TableCell>
                        <TableCell>
                          <ActionButtons style={{ justifyContent: "center" }}>
                            <IconButton
                              $color="#ef4444"
                              title="Delete Dependent"
                              onClick={() => handleDeleteDependent(dep.id)}
                            >
                              <Trash2 size={14} />
                            </IconButton>
                          </ActionButtons>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            <ModalFooter>
              <div />
              <ButtonSecondary type="button" onClick={() => setIsDependentsModalOpen(false)}>
                Close
              </ButtonSecondary>
            </ModalFooter>
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default InsuranceMemberMaster;
