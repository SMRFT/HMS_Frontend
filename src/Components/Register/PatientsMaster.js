import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  Search,
  Calendar,
  Filter,
  RefreshCw,
  User,
  Users,
  Printer,
  FileText,
  Edit,
  Activity,
  Phone,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Tag,
  Stethoscope
} from "lucide-react";
import { toast } from "react-toastify";
import JsBarcode from "jsbarcode";
import apiRequest from "../../Auth/apiRequest";
import {
  PageWrapper,
  Container,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  Input,
  Select,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody
} from "../GlobalStyles";

// ─── Theme Colors ─────────────────────────────────────────────────────────────
const T = {
  primary: "#0d9488",
  primaryHover: "#0f766e",
  primaryLt: "#f0fdfa",
  primaryBorder: "#99f6e4",
  secondary: "#0284c7",
  secondaryLt: "#e0f2fe",
  textDark: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
  bgLight: "#f8fafc",
  cardBg: "#ffffff",
  success: "#10b981",
  successLt: "#ecfdf5",
  warning: "#f59e0b",
  warningLt: "#fffbeb",
  danger: "#ef4444",
  dangerLt: "#fef2f2"
};

// ─── Styled Components ────────────────────────────────────────────────────────
const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  flex-wrap: wrap;
  gap: 12px;
`;

const TitleBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .icon-wrap {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #0d9488, #14b8a6);
    color: #ffffff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
  }

  h1 {
    font-size: 20px;
    font-weight: 800;
    color: ${T.textDark};
    margin: 0;
    letter-spacing: -0.3px;
  }

  p {
    font-size: 12px;
    color: ${T.textMuted};
    margin: 2px 0 0 0;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
`;

const StatCard = styled.div`
  background: ${T.cardBg};
  border: 1px solid ${T.border};
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

  .stat-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: ${(props) => props.$bg || T.secondaryLt};
    color: ${(props) => props.$color || T.secondary};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-info {
    display: flex;
    flex-direction: column;

    .stat-label {
      font-size: 11px;
      font-weight: 600;
      color: ${T.textMuted};
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 800;
      color: ${T.textDark};
    }
  }
`;

const FilterCard = styled.div`
  background: ${T.cardBg};
  border: 1px solid ${T.border};
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
`;

const FilterRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: ${(props) => props.$flex || "1 1 180px"};
  min-width: ${(props) => props.$minWidth || "140px"};

  label {
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const SearchInputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 10px;
    color: #94a3b8;
  }

  input {
    width: 100%;
    height: 36px;
    padding: 0 12px 0 34px;
    border-radius: 8px;
    border: 1px solid ${T.border};
    font-size: 13px;
    background: #ffffff;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${T.primary};
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
    }
  }
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: ${(props) => props.$padding || "7px 12px"};
  border-radius: 6px;
  font-size: ${(props) => props.$fontSize || "12px"};
  font-weight: 700;
  cursor: pointer;
  border: ${(props) => props.$border || "1px solid transparent"};
  background: ${(props) => props.$bg || T.primary};
  color: ${(props) => props.$color || "#ffffff"};
  transition: all 0.15s ease;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: ${(props) => props.$bg || T.bgLight};
  color: ${(props) => props.$color || T.textDark};
  border: 1px solid ${(props) => props.$border || "transparent"};
`;

const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${T.cardBg};
  border: 1px solid ${T.border};
  border-top: none;
  border-radius: 0 0 12px 12px;
  font-size: 12px;
  color: ${T.textMuted};
  flex-wrap: wrap;
  gap: 10px;

  .page-nav {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

// Form styling for Edit Modal
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;

  label {
    font-size: 11.5px;
    font-weight: 700;
    color: #334155;
  }

  input, select, textarea {
    height: 36px;
    padding: 0 10px;
    border-radius: 6px;
    border: 1px solid ${T.border};
    font-size: 12.5px;
    background: #ffffff;
    color: ${T.textDark};

    &:focus {
      outline: none;
      border-color: ${T.primary};
      box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.12);
    }
  }

  textarea {
    height: 60px;
    padding: 6px 10px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

// ─── Number to Words Helper ───────────────────────────────────────────────────
const numberToWords = (n) => {
  const num = Math.round(Number(n || 0));
  if (!num) return "Zero Rupees Only";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const inWords = (val) => {
    let str = "";
    if (val >= 10000000) { str += inWords(Math.floor(val / 10000000)) + " Crore "; val %= 10000000; }
    if (val >= 100000) { str += inWords(Math.floor(val / 100000)) + " Lakh "; val %= 100000; }
    if (val >= 1000) { str += inWords(Math.floor(val / 1000)) + " Thousand "; val %= 1000; }
    if (val >= 100) { str += inWords(Math.floor(val / 100)) + " Hundred "; val %= 100; }
    if (val > 0) {
      if (str !== "") str += "and ";
      if (val < 20) str += a[val];
      else { str += b[Math.floor(val / 10)]; if (val % 10 > 0) str += " " + a[val % 10]; }
    }
    return str.trim();
  };
  return inWords(num) + " Rupees Only";
};


// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: PatientsMaster
// ═════════════════════════════════════════════════════════════════════════════
const PatientsMaster = () => {
  const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "";

  // ── States ──────────────────────────────────────────────────────────────────
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");

  // Edit Patient Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [customerTypes, setCustomerTypes] = useState([]);
  const [insuranceProviders, setInsuranceProviders] = useState([]);

  // OP Visits Modal State
  const [showVisitsModal, setShowVisitsModal] = useState(false);
  const [selectedPatientForVisits, setSelectedPatientForVisits] = useState(null);
  const [visitsList, setVisitsList] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(false);

  // Doctor List & Bill Edit Modal State
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [showEditBillModal, setShowEditBillModal] = useState(false);
  const [selectedBillForEdit, setSelectedBillForEdit] = useState(null);
  const [editBillDoctorId, setEditBillDoctorId] = useState("");
  const [editBillDoctorName, setEditBillDoctorName] = useState("");
  const [editBillDepartment, setEditBillDepartment] = useState("");
  const [editBillConsultingFee, setEditBillConsultingFee] = useState("");
  const [editBillReason, setEditBillReason] = useState("");
  const [savingBillEdit, setSavingBillEdit] = useState(false);

  // Visit Cancellation & Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedVisitForRefund, setSelectedVisitForRefund] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReasonType, setRefundReasonType] = useState("Patient Cancelled Visit / Left Before Consultation");
  const [refundRemarks, setRefundRemarks] = useState("");
  const [processingRefund, setProcessingRefund] = useState(false);

  // ── Fetch Patients List ─────────────────────────────────────────────────────
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams();
      q.append("page", page);
      q.append("limit", limit);
      if (searchTerm.trim()) q.append("search", searchTerm.trim());
      if (fromDate) q.append("from_date", fromDate);
      if (toDate) q.append("to_date", toDate);
      if (genderFilter && genderFilter !== "ALL") q.append("gender", genderFilter);

      const res = await apiRequest(`${baseUrl.replace(/\/$/, "")}/patient-master-list/?${q.toString()}`);
      if (res && res.success) {
        const payload = res.data || {};
        const pList = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);
        setPatients(pList);
        setTotalCount(payload.total_count || 0);
        setTotalPages(payload.total_pages || 1);
      } else {
        setPatients([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching patients master list:", err);
      toast.error("Failed to load patient records");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, page, limit, searchTerm, fromDate, toDate, genderFilter]);

  // Initial and trigger load
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Debounced search reset page to 1
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setGenderFilter("ALL");
    setPage(1);
  };

  // ── Fetch Patient OP Visits ─────────────────────────────────────────────────
  const handleOpenVisitsModal = async (patient) => {
    if (!patient || !patient.uhid) return;
    setSelectedPatientForVisits(patient);
    setShowVisitsModal(true);
    setLoadingVisits(true);
    try {
      const res = await apiRequest(`${baseUrl.replace(/\/$/, "")}/patient-op-visits/${encodeURIComponent(patient.uhid)}/`);
      if (res && res.success) {
        const payload = res.data || {};
        const vList = Array.isArray(payload.data) ? payload.data : [];
        setVisitsList(vList);
      } else {
        setVisitsList([]);
      }
    } catch (err) {
      console.error("Error fetching patient OP visits:", err);
      toast.error("Failed to load OP consultation visits");
      setVisitsList([]);
    } finally {
      setLoadingVisits(false);
    }
  };

  // ── Open Edit Patient Modal ─────────────────────────────────────────────────
  const handleOpenEditModal = (patient) => {
    setEditFormData({
      uhid: patient.uhid || "",
      salutation: patient.salutation || "",
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      age: patient.age !== undefined && patient.age !== null ? patient.age : "",
      gender: patient.gender || "",
      dob: patient.dob ? String(patient.dob).substring(0, 10) : "",
      mobilePhone: patient.mobilePhone || "",
      email: patient.email || "",
      permanent_address: patient.permanent_address || "",
      area: patient.area || "",
      city: patient.city || "",
      district: patient.district || "",
      state: patient.state || "Tamil Nadu",
      zipcode: patient.zipcode || "",
      blood_group: patient.blood_group || "",
      guardian_type: patient.guardian_type || "S/o",
      guardian_name: patient.guardian_name || "",
      emergency_contact: patient.emergency_contact || "",
      occupation: patient.occupation || "",
      marital_status: patient.marital_status || "",
      customer_type: patient.customer_type || patient.customerType || "General",
      company_name: patient.company_name || patient.companyName || ""
    });
    setShowEditModal(true);
  };

  // ── Save Edited Patient ─────────────────────────────────────────────────────
  const handleSavePatientEdit = async (e) => {
    e.preventDefault();
    if (!editFormData || !editFormData.uhid) return;

    if (!editFormData.firstName.trim()) {
      toast.warning("Patient first name is required");
      return;
    }

    try {
      setSavingEdit(true);
      const res = await apiRequest(
        `${baseUrl.replace(/\/$/, "")}/patient-master-update/${encodeURIComponent(editFormData.uhid)}/`,
        "PUT",
        editFormData
      );

      if (res && res.success) {
        toast.success("Patient details updated successfully!");
        setShowEditModal(false);
        fetchPatients();
        // If visits modal is open, refresh visits list
        if (showVisitsModal && selectedPatientForVisits?.uhid === editFormData.uhid) {
          handleOpenVisitsModal({ ...selectedPatientForVisits, ...editFormData });
        }
      } else {
        toast.error(res?.error || "Failed to update patient details");
      }
    } catch (err) {
      console.error("Error updating patient:", err);
      toast.error("Error saving patient updates");
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Load Doctors for Bill Edit ───────────────────────────────────────────────
  const fetchDoctorsList = useCallback(async () => {
    try {
      setLoadingDoctors(true);
      const res = await apiRequest(`${baseUrl.replace(/\/$/, "")}/doctor_schedule/`);
      const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : []);
      if (raw && raw.length > 0) {
        const formatted = raw.map(d => ({
          employeeId: String(d.employeeId || "").trim(),
          employeeName: String(d.employeeName || `${d.first_name || ""} ${d.last_name || ""}`).trim() || "Doctor",
          department: String(d.department || d.specialty || "").trim(),
          consultingFee: Number(d.consulting_fee) || 0
        })).sort((a, b) => a.employeeName.localeCompare(b.employeeName));
        setDoctorsList(formatted);
      }
    } catch (err) {
      console.error("Error loading doctors list:", err);
    } finally {
      setLoadingDoctors(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchDoctorsList();
  }, [fetchDoctorsList]);

  // ── Load Customer Types & Insurance Providers ──────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const loadCustomerTypesAndInsurance = async () => {
      try {
        const ctRes = await apiRequest(`${baseUrl.replace(/\/$/, "")}/customer-types/`);
        if (isMounted && ctRes && ctRes.success) {
          const rawList = Array.isArray(ctRes.data) ? ctRes.data : (Array.isArray(ctRes.data?.data) ? ctRes.data.data : []);
          setCustomerTypes(rawList.filter(t => t.is_active !== false));
        }
      } catch (err) {
        console.error("Error loading customer types:", err);
      }

      try {
        const insRes = await apiRequest(`${baseUrl.replace(/\/$/, "")}/insurance-providers/`);
        if (isMounted && insRes && insRes.success) {
          const fetchedData = insRes.data?.data || insRes.data;
          const activeProviders = Array.isArray(fetchedData) ? fetchedData.filter(p => !p.blocked) : [];
          setInsuranceProviders(activeProviders);
        }
      } catch (err) {
        console.error("Error loading insurance providers:", err);
      }
    };
    loadCustomerTypesAndInsurance();
    return () => {
      isMounted = false;
    };
  }, [baseUrl]);

  // ── Edit Bill & Change Doctor Handlers ──────────────────────────────────────
  const handleOpenEditBill = (visit) => {
    if (!visit) return;
    setSelectedBillForEdit(visit);
    setEditBillDoctorId(visit.doctorId || "");
    setEditBillDoctorName(visit.doctorName || "");
    setEditBillDepartment(visit.department || "");
    setEditBillConsultingFee(visit.consultingFee != null ? visit.consultingFee : (visit.billAmount || 0));
    setEditBillReason("");
    setShowEditBillModal(true);
  };

  const handleDoctorSelectChange = (e) => {
    const selectedId = e.target.value;
    setEditBillDoctorId(selectedId);
    const doc = doctorsList.find(d => d.employeeId === selectedId);
    if (doc) {
      setEditBillDoctorName(doc.employeeName);
      if (doc.department) setEditBillDepartment(doc.department);
      if (doc.consultingFee) setEditBillConsultingFee(doc.consultingFee);
    }
  };

  const handleSaveBillEdit = async (e) => {
    e.preventDefault();
    if (!selectedBillForEdit) return;
    if (!editBillDoctorId) {
      toast.warning("Please select a consulting doctor");
      return;
    }
    const rawBillNo = selectedBillForEdit.billNumber || selectedBillForEdit.rawBillNumber;
    if (!rawBillNo) {
      toast.error("Missing bill number");
      return;
    }

    try {
      setSavingBillEdit(true);
      const payload = {
        doctor_id: editBillDoctorId,
        doctor_name: editBillDoctorName,
        department: editBillDepartment,
        consulting_fee: parseFloat(editBillConsultingFee) || 0,
        reason: editBillReason || "Doctor changed in Patients Master"
      };

      const res = await apiRequest(
        `${baseUrl.replace(/\/$/, "")}/patient-bill-update/${encodeURIComponent(rawBillNo)}/`,
        "PUT",
        payload
      );

      if (res && res.success) {
        toast.success("Bill and Doctor updated successfully!");
        const updatedDocName = editBillDoctorName || res.data?.doctorName || "Updated Doctor";
        const updatedDept = editBillDepartment || res.data?.department || "";
        const updatedFee = parseFloat(editBillConsultingFee) || 0;

        // Update visitsList in place so user immediately sees updated doctor
        setVisitsList(prev => prev.map(v => {
          const vNum = v.billNumber || v.rawBillNumber;
          if (vNum === rawBillNo || String(vNum).replace(/\//g, "") === String(rawBillNo).replace(/\//g, "")) {
            const regFee = parseFloat(v.registrationFee) || 0;
            return {
              ...v,
              doctorId: editBillDoctorId,
              doctorName: updatedDocName,
              department: updatedDept,
              consultingFee: updatedFee,
              billAmount: regFee + updatedFee,
              totalFees: regFee + updatedFee
            };
          }
          return v;
        }));

        // Also update latest doctor on patients table if it matches
        setPatients(prev => prev.map(p => {
          if (p.uhid === selectedBillForEdit.uhid) {
            return {
              ...p,
              latest_doctor: updatedDocName
            };
          }
          return p;
        }));

        setShowEditBillModal(false);
      } else {
        toast.error(res?.error || "Failed to update bill doctor");
      }
    } catch (err) {
      console.error("Error updating bill doctor:", err);
      toast.error("Failed to update bill doctor");
    } finally {
      setSavingBillEdit(false);
    }
  };

  // ── Open Refund Modal ──────────────────────────────────────────────────────
  const handleOpenRefundModal = (visit) => {
    if (!visit) return;
    setSelectedVisitForRefund(visit);
    const tot = parseFloat(visit.totalFees || visit.billAmount || 0);
    const ref = parseFloat(visit.totalRefunded || 0);
    const bal = Math.max(0, tot - ref);
    setRefundAmount(bal > 0 ? bal : tot);
    setRefundReasonType("Patient Cancelled Visit / Left Before Consultation");
    setRefundRemarks("");
    setShowRefundModal(true);
  };

  // ── Process Refund & Cancel Visit ──────────────────────────────────────────
  const handleProcessRefund = async (e) => {
    if (e) e.preventDefault();
    if (!selectedVisitForRefund) return;
    const numAmt = parseFloat(refundAmount);
    if (!numAmt || numAmt <= 0) {
      toast.warning("Please enter a valid refund amount");
      return;
    }

    const finalReason = refundReasonType === "Other"
      ? refundRemarks.trim()
      : (refundRemarks.trim() ? `${refundReasonType} - ${refundRemarks.trim()}` : refundReasonType);

    if (!finalReason) {
      toast.warning("Please provide a reason for the cancellation / refund.");
      return;
    }

    const rawBillNo = selectedVisitForRefund.rawBillNumber || selectedVisitForRefund.billNumber;
    try {
      setProcessingRefund(true);
      const payload = {
        bill_no: rawBillNo,
        uhid: selectedVisitForRefund.uhid,
        refund_amount: numAmt,
        remarks: finalReason,
        reason: finalReason
      };

      const res = await apiRequest(
        `${baseUrl.replace(/\/$/, "")}/process-registration-refund/`,
        "POST",
        payload
      );

      if (res && res.success) {
        toast.success(`Visit cancelled and refund processed! Refund Bill: ${res.refund_bill_no || "Success"}`);
        setShowRefundModal(false);
        setRefundRemarks("");

        // Update visitsList in place so user immediately sees refund status
        setVisitsList(prev => prev.map(v => {
          const vNum = v.billNumber || v.rawBillNumber;
          if (vNum === rawBillNo || String(vNum).replace(/\//g, "") === String(rawBillNo).replace(/\//g, "")) {
            const prevRef = parseFloat(v.totalRefunded || 0);
            const newRef = prevRef + numAmt;
            const tot = parseFloat(v.totalFees || v.billAmount || 0);
            return {
              ...v,
              totalRefunded: newRef,
              paymentStatus: newRef >= tot ? "Refunded" : v.paymentStatus
            };
          }
          return v;
        }));

        // Reload fresh visits from backend
        if (selectedPatientForVisits && selectedPatientForVisits.uhid) {
          handleOpenVisitsModal(selectedPatientForVisits);
        }
      } else {
        toast.error(res?.message || res?.error || "Refund failed");
      }
    } catch (err) {
      console.error("Error processing visit cancellation / refund:", err);
      toast.error("Failed to process refund");
    } finally {
      setProcessingRefund(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PRINT FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // 1. Print Barcode Sticker (97.5mm x 51mm Vikas standard - exact match with Patient Registration & Visit List)
  const handlePrintSticker = (visit) => {
    if (!visit || !visit.uhid) {
      toast.warning("Cannot print sticker: Missing UHID");
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '97.5mm';
    iframe.style.height = '51mm';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    // Generate Code128 Barcode via local JsBarcode synchronously
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    try {
      JsBarcode(svg, String(visit.uhid || "").trim(), {
        format: "CODE128",
        displayValue: false,
        height: 25,
        width: 1.5,
        margin: 0
      });
      svg.setAttribute("preserveAspectRatio", "none");
    } catch (bcErr) {
      console.error("Barcode generation error:", bcErr);
    }
    const barcodeSvgHtml = new XMLSerializer().serializeToString(svg);

    // 1. Patient Name, Age & Gender
    const rawName = String(visit.patientName || visit.name || visit.firstName || "").replace(/^(mr|ms|mrs|miss|master)\.?\s+/i, '').trim();
    const patientName = rawName ? rawName.toUpperCase() : String(visit.patientName || visit.name || "").toUpperCase();

    const cleanGender = String(visit.gender || "").toUpperCase().startsWith('F') ? 'FEMALE' : (String(visit.gender || "").toUpperCase().startsWith('M') ? 'MALE' : String(visit.gender || "").toUpperCase());
    const ageVal = visit.age !== undefined && visit.age !== null && visit.age !== '' ? `${visit.age} YEARS` : '';
    const line2 = [patientName, [ageVal, cleanGender].filter(Boolean).join('/')].filter(Boolean).join(' / ');

    // 2. Guardian Line (D/o, S/o, W/o, H/o, etc.)
    let gType = visit.guardianType || visit.guardian_type;
    if (!gType || (cleanGender === 'MALE' && gType === 'W/o')) {
      gType = cleanGender === 'FEMALE' ? 'D/o' : 'S/o';
    }
    const gName = String(visit.guardianName || visit.guardian_name || visit.spouseName || visit.fatherName || '').trim().toUpperCase();
    const guardianLine = gName ? `${gType} ${gName}` : `${gType} -`;

    // 3. Address Lines (Line 1: Door/Street, Line 2: Area/City/District)
    let addrLine1 = String(visit.permanentAddress || visit.permanent_address || '').trim().toUpperCase();
    let addrParts = [visit.area, visit.city, visit.district].filter(Boolean).map(s => String(s).trim().toUpperCase());
    let uniqueAddrParts = [];
    addrParts.forEach(p => {
      if (!uniqueAddrParts.includes(p)) {
        uniqueAddrParts.push(p);
      }
    });
    let addrLine2 = uniqueAddrParts.join(' ');

    if (!addrLine1 && visit.address) {
      const parts = String(visit.address).split(/[,|\n]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
      if (parts.length > 2) {
        addrLine1 = parts.slice(0, 2).join(' ');
        addrLine2 = parts.slice(2).join(' ');
      } else if (parts.length === 2) {
        addrLine1 = parts[0];
        addrLine2 = parts[1];
      } else {
        addrLine1 = parts[0] || '';
      }
    }

    if (!addrLine1) addrLine1 = '-';
    if (!addrLine2) addrLine2 = '-';

    // 4. Phone
    const rawMobile = String(visit.mobile || visit.mobilePhone || '').trim();
    const cleanMobile = rawMobile.replace(/^(\+91|91)/, '').trim();
    const phoneLine = cleanMobile ? `Ph.+91${cleanMobile}` : (rawMobile ? `Ph.${rawMobile}` : 'Ph. -');

    // 5. Doctor Line
    let rawDoc = String(visit.doctorName || visit.latest_doctor || visit.doctor || '').trim();
    rawDoc = rawDoc.replace(/^(dr|doctor)[\s.]+/i, '').replace(/^(dr|doctor)[\s.]+/i, '').trim();
    const docDisplay = rawDoc ? (/^[a-z]\./i.test(rawDoc) ? `DR.${rawDoc.toUpperCase()}` : `DR. ${rawDoc.toUpperCase()}`) : 'DR. -';

    const printDocument = iframe.contentWindow.document;
    printDocument.open();
    printDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode Sticker - ${visit.uhid}</title>
          <style>
            @page {
              size: 97.5mm 51mm;
              margin: 0 !important;
            }
            @media print {
              @page {
                size: 97.5mm 51mm;
                margin: 0 !important;
              }
              html, body {
                width: 97.5mm !important;
                height: 51mm !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
              }
            }
            html, body {
              width: 97.5mm;
              height: 51mm;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: Arial, Helvetica, sans-serif;
              color: #000;
              background-color: #fff;
              -webkit-print-color-adjust: exact;
            }
            .sticker-content {
              width: 100%;
              max-width: 97.5mm;
              box-sizing: border-box;
              padding: 2.5mm 4mm 2mm 4mm;
              overflow: hidden;
            }
            .top-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
              margin-bottom: 3px;
              gap: 8px;
            }
            .barcode-svg-wrap {
              width: 140px;
              height: 25px;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              overflow: hidden;
            }
            .barcode-svg-wrap svg {
              display: block;
              width: 100% !important;
              height: 100% !important;
            }
            .uhid-txt {
              font-size: 13px;
              font-weight: 900;
              letter-spacing: 0.3px;
              white-space: nowrap;
              text-align: right;
              flex-shrink: 0;
            }
            .sticker-line {
              font-size: 11.5px;
              line-height: 1.4;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              font-weight: 800;
              letter-spacing: 0.1px;
            }
            .patient-line {
              font-size: 12.5px;
              font-weight: 900;
              margin-bottom: 1.5px;
              letter-spacing: 0.15px;
            }
            .doc-line {
              font-size: 11.5px;
              font-weight: 900;
              margin-top: 1.5px;
            }
          </style>
        </head>
        <body>
          <div class="sticker-content">
            <div class="top-row">
              <div class="barcode-svg-wrap">
                ${barcodeSvgHtml}
              </div>
              <div class="uhid-txt">UHID : ${visit.uhid}</div>
            </div>
            <div class="sticker-line patient-line">${line2}</div>
            <div class="sticker-line">${guardianLine}</div>
            <div class="sticker-line">${addrLine1}</div>
            <div class="sticker-line">${addrLine2}</div>
            <div class="sticker-line">${phoneLine}</div>
            <div class="sticker-line doc-line">${docDisplay}</div>
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() {
                if (window.frameElement) window.frameElement.remove();
              }, 1200);
            };
          </script>
        </body>
      </html>
    `);
    printDocument.close();
  };

  // 2. Print Registration / OP Bill Receipt (Shanmuga standard format)
  const handlePrintBill = (visit) => {
    if (!visit) return;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();

    const rawBillNo = visit.billNumber || visit.rawBillNumber || "N/A";
    const cleanBillNo = String(rawBillNo).replace(/\//g, "");
    const preparedByName = visit.preparedBy || localStorage.getItem("employeeName") || "Staff";
    const totalAmount = parseFloat(visit.billAmount || visit.totalFees || 0);

    const rawMethod = String(visit.paymentMethod || "").trim().toLowerCase();
    const isCredit = rawMethod.includes("credit") || rawMethod.includes("pay later") || Boolean(visit.company_name);
    const billTypeTitle = isCredit ? "*REGISTRATION CREDIT BILL*" : "*REGISTRATION CASH BILL*";
    const displayPaymentMode = isCredit ? "Credit" : "Cash";

    const displayDateTime = visit.dateTime || `${visit.date || ""} ${visit.time || ""}`.trim() || new Date().toLocaleString("en-GB");

    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OP Bill - ${cleanBillNo}</title>
          <style>
            @page { size: auto; margin: 4mm; }
            * { box-sizing: border-box; }
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 12px; background-color: white; width: 320px; font-size: 12px; color: #000; }
            .center { text-align: center; }
            .header { font-size: 15px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.3px; }
            .sub-header { font-size: 11px; margin-bottom: 2px; }
            .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
            .bill-type { margin: 6px 0; font-weight: bold; font-size: 13px; letter-spacing: 0.5px; }
            
            .info-table { width: 100%; font-size: 12px; border-collapse: collapse; margin-bottom: 6px; }
            .info-table td { padding: 2.5px 0; vertical-align: top; }
            .info-table .label { width: 95px; font-weight: 500; color: #111; }
            .info-table .colon { width: 12px; text-align: center; }
            .info-table .val { font-weight: 600; word-break: break-word; color: #000; }

            .items-table { width: 100%; font-size: 12px; border-collapse: collapse; margin: 6px 0; }
            .items-table th { padding: 5px 2px; text-align: left; border-top: 1px dashed #000; border-bottom: 1px dashed #000; font-size: 11px; text-transform: uppercase; }
            .items-table td { padding: 6px 2px; vertical-align: middle; }
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            
            .totals-table { width: 100%; font-size: 13px; border-collapse: collapse; margin-top: 4px; }
            .totals-table td { padding: 3px 0; }
            
            .words-section { font-size: 11px; margin: 6px 0; padding: 6px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; line-height: 1.35; }
            .words-label { font-weight: bold; font-size: 10px; text-transform: uppercase; margin-bottom: 2px; }
            
            .signature { margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; }
            .footer { margin-top: 14px; font-size: 9.5px; font-style: italic; line-height: 1.3; text-align: center; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="header">SHANMUGA HOSPITAL LIMITED</div>
            <div class="sub-header">51/24, Saradha College Road, Salem - 636007</div>
            <div class="sub-header"><u>CIN: L85110TZ2020PLC033974</u></div>
            <div class="sub-header"><u>GST No : 33ABDCS8326A1ZP</u></div>
            <div class="divider"></div>
            <div class="bill-type">${billTypeTitle}</div>
            <div class="divider"></div>
          </div>
          <table class="info-table">
            <tr>
              <td class="label">Bill Number</td>
              <td class="colon">:</td>
              <td class="val">${cleanBillNo}</td>
            </tr>
            <tr>
              <td class="label">UHID</td>
              <td class="colon">:</td>
              <td class="val">${visit.uhid || "N/A"}</td>
            </tr>
            <tr>
              <td class="label">Bill Date &amp; Time</td>
              <td class="colon">:</td>
              <td class="val">${displayDateTime}</td>
            </tr>
            <tr>
              <td class="label">Payment Mode</td>
              <td class="colon">:</td>
              <td class="val">${displayPaymentMode}</td>
            </tr>
            <tr>
              <td class="label">Name</td>
              <td class="colon">:</td>
              <td class="val">${visit.patientName || ""}</td>
            </tr>
            <tr>
              <td class="label">Doctor</td>
              <td class="colon">:</td>
              <td class="val">${visit.doctorName || visit.doctorId || "N/A"}</td>
            </tr>
            ${visit.company_name ? `
            <tr>
              <td class="label">Company/TPA</td>
              <td class="colon">:</td>
              <td class="val">${visit.company_name}</td>
            </tr>` : ""}
          </table>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 25px;">SL</th>
                <th>PARTICULARS</th>
                <th class="text-right" style="width: 75px;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${visit.registrationFee > 0 ? `
              <tr>
                <td>1</td>
                <td>Registration Fee</td>
                <td class="text-right">${parseFloat(visit.registrationFee).toFixed(2)}</td>
              </tr>` : ""}
              <tr>
                <td>${visit.registrationFee > 0 ? 2 : 1}</td>
                <td>Consulting Fee - ${visit.doctorName || "Doctor"}</td>
                <td class="text-right">${parseFloat(visit.consultingFee || totalAmount).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="divider" style="margin: 4px 0;"></div>
          <table class="totals-table">
            <tr>
              <td style="font-weight: bold;">TOTAL NET AMOUNT</td>
              <td class="text-right" style="font-weight: bold; font-size: 14px;">Rs. ${totalAmount.toFixed(2)}</td>
            </tr>
          </table>
          <div class="words-section">
            <div class="words-label">AMOUNT IN WORDS:</div>
            ${numberToWords(totalAmount)}
          </div>
          <div class="signature">
            <div>
              <strong>Prepared By:</strong><br/>
              <span>${preparedByName}</span>
            </div>
            <div class="text-right">
              <strong>Authorized Signatory</strong>
            </div>
          </div>
          <div class="footer">
            Thank you for choosing Shanmuga Hospital.<br/>
            Valid for 7 days for review consultation.
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (e) {
        console.error("Print error:", e);
      }
      setTimeout(() => document.body.removeChild(iframe), 3000);
    }, 500);
  };

  // 3. Print OP Consultation Card / OP Case Sheet
  const handlePrintOpCard = (visit) => {
    if (!visit) return;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();

    const cleanBillNo = String(visit.billNumber || visit.rawBillNumber || "").replace(/\//g, "");
    const visitDateStr = visit.dateTime || `${visit.date || ""} ${visit.time || ""}`.trim() || new Date().toLocaleString("en-GB");

    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OP Consultation Slip - ${visit.uhid}</title>
          <style>
            @page { size: A4 portrait; margin: 12mm 15mm; }
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; color: #1e293b; font-size: 12px; }
            .h-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0d9488; padding-bottom: 8px; margin-bottom: 12px; }
            .h-title { font-size: 20px; font-weight: 800; color: #0d9488; letter-spacing: 0.5px; }
            .h-sub { font-size: 11px; color: #64748b; line-height: 1.4; }
            .badge-box { background: #f0fdfa; border: 1.5px solid #99f6e4; color: #0f766e; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 8px; text-align: center; }
            
            .pt-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 11.5px; }
            .pt-cell { display: flex; flex-direction: column; }
            .pt-lbl { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
            .pt-val { font-size: 12px; font-weight: 800; color: #0f172a; margin-top: 1px; }

            .vitals-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 16px; }
            .vital-card { border: 1px dashed #cbd5e1; border-radius: 6px; padding: 6px 8px; text-align: center; height: 50px; display: flex; flex-direction: column; justify-content: space-between; }
            .vital-title { font-size: 9.5px; font-weight: 700; color: #64748b; text-transform: uppercase; }

            .section-title { font-size: 12px; font-weight: 800; color: #0f766e; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin: 16px 0 8px 0; }
            .notes-lines { height: 160px; border: 1px solid #e2e8f0; border-radius: 6px; background: repeating-linear-gradient(#fff, #fff 24px, #f1f5f9 25px); margin-bottom: 16px; }
            .rx-section { min-height: 220px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; position: relative; }
            .rx-symbol { font-size: 26px; font-weight: 900; color: #0d9488; font-family: serif; margin-bottom: 8px; }

            .slip-footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="h-header">
            <div>
              <div class="h-title">SHANMUGA HOSPITAL LIMITED</div>
              <div class="h-sub">51/24, Saradha College Road, Salem - 636007 • Ph: 0427-2706666</div>
              <div class="h-sub">CIN: L85110TZ2020PLC033974 • GST: 33ABDCS8326A1ZP</div>
            </div>
            <div class="badge-box">
              OUTPATIENT CONSULTATION SLIP<br/>
              <span style="font-size: 10px; font-weight: 600; color: #475569;">TOKEN #${visit.tokenNumber || "1"}</span>
            </div>
          </div>

          <div class="pt-box">
            <div class="pt-cell">
              <span class="pt-lbl">UHID</span>
              <span class="pt-val">${visit.uhid || "-"}</span>
            </div>
            <div class="pt-cell">
              <span class="pt-lbl">Patient Name</span>
              <span class="pt-val">${visit.patientName || "-"}</span>
            </div>
            <div class="pt-cell">
              <span class="pt-lbl">Age / Gender</span>
              <span class="pt-val">${visit.age ? `${visit.age} Y` : "-"} / ${visit.gender || "-"}</span>
            </div>
            <div class="pt-cell">
              <span class="pt-lbl">Consulting Doctor</span>
              <span class="pt-val">${visit.doctorName || visit.doctorId || "-"}</span>
            </div>
            <div class="pt-cell">
              <span class="pt-lbl">Visit Date &amp; Time</span>
              <span class="pt-val">${visitDateStr}</span>
            </div>
            <div class="pt-cell">
              <span class="pt-lbl">Bill No / Type</span>
              <span class="pt-val">${cleanBillNo} (${visit.visitType || "Review"})</span>
            </div>
          </div>

          <div class="section-title">Clinical Vitals</div>
          <div class="vitals-grid">
            <div class="vital-card"><span class="vital-title">BP (mmHg)</span></div>
            <div class="vital-card"><span class="vital-title">Pulse (bpm)</span></div>
            <div class="vital-card"><span class="vital-title">Temp (°F)</span></div>
            <div class="vital-card"><span class="vital-title">SpO2 (%)</span></div>
            <div class="vital-card"><span class="vital-title">Weight (Kg)</span></div>
            <div class="vital-card"><span class="vital-title">GRBS (mg/dL)</span></div>
          </div>

          <div class="section-title">Chief Complaints &amp; Clinical Notes</div>
          <div class="notes-lines"></div>

          <div class="section-title">Prescription / Rx &amp; Advice</div>
          <div class="rx-section">
            <div class="rx-symbol">℞</div>
          </div>

          <div class="slip-footer">
            <div>
              Printed by: <strong>${visit.preparedBy || "Staff"}</strong><br/>
              Valid for Review within 7 Days
            </div>
            <div style="text-align: right;">
              <br/><br/>
              <strong>Doctor's Signature &amp; Seal</strong>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (e) {
        console.error("Print error:", e);
      }
      setTimeout(() => document.body.removeChild(iframe), 3000);
    }, 500);
  };


  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER UI
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <PageWrapper style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Container style={{ maxWidth: "1400px", padding: "18px" }}>

        {/* ── 1. Page Header ── */}
        <PageHeader>
          <TitleBlock>
            <div className="icon-wrap">
              <Users size={24} />
            </div>
            <div>
              <h1>Patients Master</h1>
              <p>Browse, manage and edit registered patients, inspect OP consultation history, and print bills or slips.</p>
            </div>
          </TitleBlock>

          <div style={{ display: "flex", gap: "8px" }}>
            <ActionBtn
              type="button"
              $bg="#ffffff"
              $color={T.primary}
              $border={`1.5px solid ${T.primaryBorder}`}
              onClick={fetchPatients}
              title="Refresh Records"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              Refresh
            </ActionBtn>
          </div>
        </PageHeader>

        {/* ── 2. KPI Summary Cards ── */}
        <StatsGrid>
          <StatCard $bg="#e0f2fe" $color="#0284c7">
            <div className="stat-icon"><Users size={20} /></div>
            <div className="stat-info">
              <span className="stat-label">Total Patients</span>
              <span className="stat-value">{totalCount.toLocaleString()}</span>
            </div>
          </StatCard>

          <StatCard $bg="#f0fdfa" $color="#0d9488">
            <div className="stat-icon"><User size={20} /></div>
            <div className="stat-info">
              <span className="stat-label">Showing on Page</span>
              <span className="stat-value">{patients.length}</span>
            </div>
          </StatCard>

          <StatCard $bg="#fef3c7" $color="#d97706">
            <div className="stat-icon"><Activity size={20} /></div>
            <div className="stat-info">
              <span className="stat-label">Page Count</span>
              <span className="stat-value">{page} / {totalPages}</span>
            </div>
          </StatCard>

          <StatCard $bg="#ecfdf5" $color="#10b981">
            <div className="stat-icon"><Tag size={20} /></div>
            <div className="stat-info">
              <span className="stat-label">Search Status</span>
              <span className="stat-value" style={{ fontSize: "14px" }}>
                {searchTerm ? `"${searchTerm}"` : "All Records"}
              </span>
            </div>
          </StatCard>
        </StatsGrid>

        {/* ── 3. Filters Toolbar ── */}
        <FilterCard>
          <FilterRow>
            <FilterItem $flex="2 1 240px">
              <label><Search size={12} /> Search Patients</label>
              <SearchInputWrap>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by UHID, Name, Mobile, City..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </SearchInputWrap>
            </FilterItem>

            <FilterItem $flex="1 1 130px" $minWidth="130px">
              <label><Calendar size={12} /> Registered From</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                style={{ height: "36px", fontSize: "12px" }}
              />
            </FilterItem>

            <FilterItem $flex="1 1 130px" $minWidth="130px">
              <label><Calendar size={12} /> Registered To</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                style={{ height: "36px", fontSize: "12px" }}
              />
            </FilterItem>

            <FilterItem $flex="1 1 110px" $minWidth="110px">
              <label><Filter size={12} /> Gender</label>
              <Select
                value={genderFilter}
                onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
                style={{ height: "36px", fontSize: "12px" }}
              >
                <option value="ALL">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </FilterItem>

            <FilterItem $flex="0 0 auto" $minWidth="90px">
              <label>&nbsp;</label>
              <ActionBtn
                type="button"
                $bg="#94a3b8"
                onClick={handleResetFilters}
                style={{ height: "36px" }}
                title="Reset Filters"
              >
                <RotateCcw size={13} /> Reset
              </ActionBtn>
            </FilterItem>

            <FilterItem $flex="0 0 auto" $minWidth="110px">
              <label>Per Page</label>
              <Select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                style={{ height: "36px", fontSize: "12px" }}
              >
                <option value={10}>10 records</option>
                <option value={25}>25 records</option>
                <option value={50}>50 records</option>
                <option value={100}>100 records</option>
              </Select>
            </FilterItem>
          </FilterRow>
        </FilterCard>

        {/* ── 4. Patients Master Table ── */}
        <TableWrapper style={{ border: `1px solid ${T.border}`, borderRadius: "12px 12px 0 0", background: "#ffffff" }}>
          <Table>
            <thead>
              <Tr style={{ background: "#f8fafc" }}>
                <Th style={{ width: "45px", textAlign: "center" }}>#</Th>
                <Th style={{ width: "120px" }}>UHID</Th>
                <Th>Patient Name</Th>
                <Th style={{ width: "110px" }}>Age / Sex</Th>
                <Th style={{ width: "130px" }}>Mobile Phone</Th>
                <Th style={{ width: "140px" }}>City / Area</Th>
                <Th style={{ width: "140px" }}>Registered On</Th>
                <Th style={{ width: "100px", textAlign: "center" }}>OP Visits</Th>
                <Th style={{ width: "210px", textAlign: "center" }}>Actions</Th>
              </Tr>
            </thead>
            <tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={9} style={{ textAlign: "center", padding: "40px", color: T.textMuted }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                      <RefreshCw size={18} className="spin" color={T.primary} />
                      <span style={{ fontWeight: 600, fontSize: "13px" }}>Loading patient master records...</span>
                    </div>
                  </Td>
                </Tr>
              ) : patients.length === 0 ? (
                <Tr>
                  <Td colSpan={9} style={{ textAlign: "center", padding: "40px", color: T.textMuted }}>
                    <Users size={32} color="#cbd5e1" style={{ marginBottom: "8px" }} />
                    <div style={{ fontWeight: 700, fontSize: "14px", color: T.textDark }}>No patient records found</div>
                    <div style={{ fontSize: "12px" }}>Try adjusting your search query or date range filters.</div>
                  </Td>
                </Tr>
              ) : (
                patients.map((pt, idx) => (
                  <Tr key={pt.id || pt.uhid || idx} style={{ transition: "background 0.15s ease" }}>
                    <Td style={{ textAlign: "center", color: T.textMuted, fontSize: "11px", fontWeight: 700 }}>
                      {(page - 1) * limit + idx + 1}
                    </Td>

                    <Td>
                      <span style={{ fontWeight: 800, color: T.primary, fontSize: "12.5px" }}>
                        {pt.uhid}
                      </span>
                    </Td>

                    <Td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 800, color: T.textDark, fontSize: "13px" }}>
                          {pt.name}
                        </span>
                        {pt.guardian_name && (
                          <span style={{ fontSize: "11px", color: T.textMuted }}>
                            {pt.guardian_display}
                          </span>
                        )}
                        {pt.customer_type && (
                          <div style={{ marginTop: "3px" }}>
                            <span style={{
                              display: "inline-block",
                              fontSize: "10.5px",
                              fontWeight: 600,
                              padding: "1px 6px",
                              borderRadius: "4px",
                              backgroundColor: String(pt.customer_type).toLowerCase() === "insurance" ? "#ede9fe" : (String(pt.customer_type).toLowerCase() === "corporate" ? "#fef3c7" : "#f1f5f9"),
                              color: String(pt.customer_type).toLowerCase() === "insurance" ? "#6d28d9" : (String(pt.customer_type).toLowerCase() === "corporate" ? "#b45309" : "#475569"),
                              border: "1px solid rgba(0,0,0,0.06)"
                            }}>
                              {pt.customer_type}{pt.company_name ? ` • ${pt.company_name}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </Td>

                    <Td>
                      <span style={{ fontWeight: 600, fontSize: "12px" }}>
                        {pt.age !== null && pt.age !== undefined ? `${pt.age} Y` : "-"} / {pt.gender || "-"}
                      </span>
                      {pt.blood_group && (
                        <Badge $bg="#fee2e2" $color="#b91c1c" $border="#fecdd3" style={{ marginLeft: "4px", fontSize: "10px" }}>
                          {pt.blood_group}
                        </Badge>
                      )}
                    </Td>

                    <Td>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: T.textDark, fontWeight: 600 }}>
                        <Phone size={11} color="#64748b" />
                        <span>{pt.mobilePhone || "-"}</span>
                      </div>
                    </Td>

                    <Td>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: T.textDark }}>
                        <MapPin size={11} color="#64748b" />
                        <span>{pt.city || pt.district || "-"}</span>
                      </div>
                    </Td>

                    <Td style={{ fontSize: "11.5px", color: T.textMuted }}>
                      {pt.registered_date || "-"}
                    </Td>

                    <Td style={{ textAlign: "center" }}>
                      <Badge
                        $bg={pt.total_visits > 0 ? "#e0f2fe" : "#f1f5f9"}
                        $color={pt.total_visits > 0 ? "#0369a1" : "#64748b"}
                        $border={pt.total_visits > 0 ? "#bae6fd" : "#e2e8f0"}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleOpenVisitsModal(pt)}
                        title="Click to view all visits"
                      >
                        {pt.total_visits} {pt.total_visits === 1 ? "Visit" : "Visits"}
                      </Badge>
                    </Td>

                    <Td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <ActionBtn
                          type="button"
                          $bg="#0d9488"
                          $padding="5px 10px"
                          onClick={() => handleOpenVisitsModal(pt)}
                          title="View OP Consultations & Visits"
                        >
                          <Stethoscope size={13} /> OP Visits
                        </ActionBtn>

                        <ActionBtn
                          type="button"
                          $bg="#ffffff"
                          $color="#334155"
                          $border={`1px solid ${T.border}`}
                          $padding="5px 8px"
                          onClick={() => handleOpenEditModal(pt)}
                          title="Edit Patient Details"
                        >
                          <Edit size={13} />
                        </ActionBtn>

                        <ActionBtn
                          type="button"
                          $bg="#ffffff"
                          $color="#0284c7"
                          $border="1px solid #bae6fd"
                          $padding="5px 8px"
                          onClick={() => handlePrintSticker(pt)}
                          title="Print OP Barcode Sticker (97.5mm x 51mm)"
                        >
                          <Tag size={13} /> Sticker
                        </ActionBtn>
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </Table>
        </TableWrapper>

        {/* ── 5. Pagination Bar ── */}
        <PaginationBar>
          <div>
            Showing <strong>{patients.length > 0 ? (page - 1) * limit + 1 : 0}</strong> to{" "}
            <strong>{Math.min(page * limit, totalCount)}</strong> of <strong>{totalCount}</strong> patients
          </div>

          <div className="page-nav">
            <ActionBtn
              type="button"
              $bg="#ffffff"
              $color="#334155"
              $border={`1px solid ${T.border}`}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} /> Prev
            </ActionBtn>

            <span style={{ fontWeight: 700, padding: "0 8px" }}>
              Page {page} of {totalPages}
            </span>

            <ActionBtn
              type="button"
              $bg="#ffffff"
              $color="#334155"
              $border={`1px solid ${T.border}`}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight size={14} />
            </ActionBtn>
          </div>
        </PaginationBar>


        {/* ═════════════════════════════════════════════════════════════════════
            MODAL 1: EDIT PATIENT DEMOGRAPHICS
        ═════════════════════════════════════════════════════════════════════ */}
        {showEditModal && editFormData && (
          <ModalOverlay onClick={() => setShowEditModal(false)}>
            <ModalContainer
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "750px", width: "90%", borderRadius: "14px" }}
            >
              <ModalHeader style={{ background: "#f8fafc", borderBottom: `1px solid ${T.border}` }}>
                <ModalTitle style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: T.textDark }}>
                  <Edit size={18} color={T.primary} />
                  <span>Edit Patient Details ({editFormData.uhid})</span>
                </ModalTitle>
                <CloseButton onClick={() => setShowEditModal(false)}>✕</CloseButton>
              </ModalHeader>

              <ModalBody style={{ padding: "18px" }}>
                <form onSubmit={handleSavePatientEdit}>
                  {/* Customer Type & Insurance Provider Section */}
                  <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "8px", border: `1px solid ${T.border}`, marginBottom: "14px" }}>
                    <FormGrid>
                      <FormGroup style={{ gridColumn: (String(editFormData.customer_type).toLowerCase() === "insurance" || String(editFormData.customer_type).toLowerCase() === "corporate") ? "span 1" : "span 3" }}>
                        <label style={{ fontWeight: 600, color: "#1e293b" }}>Customer Type *</label>
                        <Select
                          value={editFormData.customer_type || "General"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditFormData({
                              ...editFormData,
                              customer_type: val,
                              company_name: (val.toLowerCase() === "insurance" || val.toLowerCase() === "corporate") ? editFormData.company_name : ""
                            });
                          }}
                          required
                        >
                          {customerTypes.length > 0 ? (
                            customerTypes.map((ct) => (
                              <option key={ct.type_id || ct.type_name} value={ct.type_name}>
                                {ct.type_name}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="General">General</option>
                              <option value="Insurance">Insurance</option>
                              <option value="Corporate">Corporate</option>
                              <option value="Employee">Employee</option>
                              <option value="General IP">General IP</option>
                              <option value="MHC Consultant">MHC Consultant</option>
                            </>
                          )}
                        </Select>
                      </FormGroup>

                      {(String(editFormData.customer_type).toLowerCase() === "insurance" ||
                        String(editFormData.customer_type).toLowerCase() === "corporate") && (
                        <FormGroup style={{ gridColumn: "span 2" }}>
                          <label style={{ fontWeight: 600, color: "#1e293b" }}>Insurance Provider / Corporate Company</label>
                          <Input
                            type="text"
                            list="patient-insurance-providers-list"
                            value={editFormData.company_name || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value.toUpperCase() })}
                            placeholder="Search or enter Company Name (e.g. Star Health)..."
                          />
                          <datalist id="patient-insurance-providers-list">
                            {insuranceProviders.map((p, idx) => (
                              <option key={p.company_code || idx} value={p.company_name}>
                                {p.company_name} ({p.company_code})
                              </option>
                            ))}
                          </datalist>
                        </FormGroup>
                      )}
                    </FormGrid>
                  </div>

                  <FormGrid>
                    <FormGroup style={{ gridColumn: "span 1" }}>
                      <label>Salutation</label>
                      <Select
                        value={editFormData.salutation || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, salutation: e.target.value })}
                      >
                        <option value="">None</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Master.">Master.</option>
                        <option value="Baby.">Baby.</option>
                        <option value="Dr.">Dr.</option>
                      </Select>
                    </FormGroup>

                    <FormGroup style={{ gridColumn: "span 2" }}>
                      <label>First Name *</label>
                      <Input
                        type="text"
                        required
                        value={editFormData.firstName || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value.toUpperCase() })}
                      />
                    </FormGroup>

                    <FormGroup style={{ gridColumn: "span 1" }}>
                      <label>Last Name</label>
                      <Input
                        type="text"
                        value={editFormData.lastName || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value.toUpperCase() })}
                      />
                    </FormGroup>
                  </FormGrid>

                  <FormGrid>
                    <FormGroup>
                      <label>Age (Years)</label>
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        max="120"
                        value={editFormData.age || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Gender</label>
                      <Select
                        value={editFormData.gender || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Select>
                    </FormGroup>

                    <FormGroup>
                      <label>Date of Birth</label>
                      <Input
                        type="date"
                        value={editFormData.dob || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Blood Group</label>
                      <Select
                        value={editFormData.blood_group || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, blood_group: e.target.value })}
                      >
                        <option value="">Unknown / None</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </Select>
                    </FormGroup>
                  </FormGrid>

                  <FormGrid>
                    <FormGroup>
                      <label>Mobile Number</label>
                      <Input
                        type="text"
                        value={editFormData.mobilePhone || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, mobilePhone: e.target.value })}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Email</label>
                      <Input
                        type="email"
                        value={editFormData.email || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Guardian Relationship</label>
                      <Select
                        value={editFormData.guardian_type || "S/o"}
                        onChange={(e) => setEditFormData({ ...editFormData, guardian_type: e.target.value })}
                      >
                        <option value="S/o">S/o (Son of)</option>
                        <option value="D/o">D/o (Daughter of)</option>
                        <option value="W/o">W/o (Wife of)</option>
                        <option value="H/o">H/o (Husband of)</option>
                        <option value="F/o">F/o (Father of)</option>
                        <option value="M/o">M/o (Mother of)</option>
                        <option value="C/o">C/o (Care of)</option>
                      </Select>
                    </FormGroup>

                    <FormGroup>
                      <label>Guardian / Spouse Name</label>
                      <Input
                        type="text"
                        value={editFormData.guardian_name || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, guardian_name: e.target.value.toUpperCase() })}
                      />
                    </FormGroup>
                  </FormGrid>

                  <FormGroup>
                    <label>Permanent Address</label>
                    <Input
                      type="text"
                      value={editFormData.permanent_address || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, permanent_address: e.target.value })}
                    />
                  </FormGroup>

                  <FormGrid>
                    <FormGroup>
                      <label>Area / Locality</label>
                      <Input
                        type="text"
                        value={editFormData.area || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, area: e.target.value })}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>City / Town</label>
                      <Input
                        type="text"
                        value={editFormData.city || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>District</label>
                      <Input
                        type="text"
                        value={editFormData.district || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Pincode</label>
                      <Input
                        type="text"
                        value={editFormData.zipcode || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, zipcode: e.target.value })}
                      />
                    </FormGroup>
                  </FormGrid>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px", paddingTop: "14px", borderTop: `1px solid ${T.border}` }}>
                    <ActionBtn
                      type="button"
                      $bg="#94a3b8"
                      onClick={() => setShowEditModal(false)}
                      disabled={savingEdit}
                    >
                      Cancel
                    </ActionBtn>
                    <ActionBtn
                      type="submit"
                      $bg={T.primary}
                      disabled={savingEdit}
                    >
                      {savingEdit ? "Saving Changes..." : "Save Patient Details"}
                    </ActionBtn>
                  </div>
                </form>
              </ModalBody>
            </ModalContainer>
          </ModalOverlay>
        )}


        {/* ═════════════════════════════════════════════════════════════════════
            MODAL 2: OP CONSULTATION & VISIT DETAILS
        ═════════════════════════════════════════════════════════════════════ */}
        {showVisitsModal && selectedPatientForVisits && (
          <ModalOverlay onClick={() => setShowVisitsModal(false)}>
            <ModalContainer
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "1150px", width: "95%", borderRadius: "14px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
            >
              <ModalHeader style={{ background: "#f8fafc", borderBottom: `1px solid ${T.border}` }}>
                <ModalTitle style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: T.textDark }}>
                  <Stethoscope size={18} color={T.primary} />
                  <span>OP Consultations &amp; Billing Records</span>
                </ModalTitle>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ActionBtn
                    type="button"
                    $bg="#ffffff"
                    $color="#0284c7"
                    $border="1px solid #bae6fd"
                    $padding="5px 10px"
                    onClick={() => handlePrintSticker(selectedPatientForVisits)}
                    title="Print OP Barcode Sticker (97.5mm x 51mm)"
                  >
                    <Tag size={13} /> OP Sticker
                  </ActionBtn>
                  <CloseButton onClick={() => setShowVisitsModal(false)}>✕</CloseButton>
                </div>
              </ModalHeader>

              <ModalBody style={{ padding: "18px", overflowY: "auto" }}>
                {/* Patient Summary Card */}
                <div style={{ background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "16px", fontWeight: 800, color: "#0f766e" }}>
                        {selectedPatientForVisits.name}
                      </span>
                      <Badge $bg="#ffffff" $color="#0d9488" $border="#99f6e4">
                        {selectedPatientForVisits.uhid}
                      </Badge>
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>
                      {selectedPatientForVisits.age ? `${selectedPatientForVisits.age} Y` : "-"} • {selectedPatientForVisits.gender || "-"} • Mob: <strong>{selectedPatientForVisits.mobilePhone || "-"}</strong> • City: {selectedPatientForVisits.city || "-"}
                      {selectedPatientForVisits.customer_type && (
                        <span> • Type: <strong>{selectedPatientForVisits.customer_type}</strong>{selectedPatientForVisits.company_name ? ` (${selectedPatientForVisits.company_name})` : ""}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Total OP Visits</div>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f766e" }}>{visitsList.length}</div>
                    </div>
                    <ActionBtn
                      type="button"
                      $bg="#ffffff"
                      $color="#334155"
                      $border={`1px solid ${T.border}`}
                      $padding="5px 10px"
                      onClick={() => handleOpenEditModal(selectedPatientForVisits)}
                      title="Edit this patient"
                    >
                      <Edit size={12} /> Edit Demographics
                    </ActionBtn>
                  </div>
                </div>

                {/* Visits Table */}
                <TableWrapper style={{ border: `1px solid ${T.border}`, borderRadius: "10px" }}>
                  <Table>
                    <thead>
                      <Tr style={{ background: "#f8fafc" }}>
                        <Th style={{ width: "40px", textAlign: "center" }}>#</Th>
                        <Th style={{ width: "150px" }}>Visited Date &amp; Time</Th>
                        <Th style={{ width: "120px" }}>Bill No</Th>
                        <Th>Consulting Doctor</Th>
                        <Th style={{ width: "80px" }}>Type</Th>
                        <Th style={{ width: "95px", textAlign: "right" }}>Amount</Th>
                        <Th style={{ width: "85px" }}>Payment</Th>
                        <Th style={{ width: "90px", textAlign: "center" }}>Status</Th>
                        <Th style={{ width: "270px", textAlign: "center" }}>Actions &amp; Print</Th>
                      </Tr>
                    </thead>
                    <tbody>
                      {loadingVisits ? (
                        <Tr>
                          <Td colSpan={9} style={{ textAlign: "center", padding: "30px", color: T.textMuted }}>
                            <RefreshCw size={16} className="spin" color={T.primary} style={{ marginRight: "8px" }} />
                            <span>Loading consultation records...</span>
                          </Td>
                        </Tr>
                      ) : visitsList.length === 0 ? (
                        <Tr>
                          <Td colSpan={9} style={{ textAlign: "center", padding: "30px", color: T.textMuted }}>
                            <Clock size={24} color="#cbd5e1" style={{ marginBottom: "6px" }} />
                            <div style={{ fontWeight: 700, fontSize: "13px", color: T.textDark }}>No OP Consultation visits found</div>
                            <div style={{ fontSize: "11.5px" }}>This patient has no recorded consultation bills yet.</div>
                          </Td>
                        </Tr>
                      ) : (
                        visitsList.map((v, vIdx) => {
                          const isPaid = v.paymentStatus === "Paid";
                          const isRefunded = v.paymentStatus === "Refunded" || v.totalRefunded > 0;
                          return (
                            <Tr key={v.id || v.billNumber || vIdx}>
                              <Td style={{ textAlign: "center", color: T.textMuted, fontSize: "11px", fontWeight: 700 }}>
                                {vIdx + 1}
                              </Td>

                              <Td>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontWeight: 700, color: T.textDark, fontSize: "12px" }}>
                                    {v.date || "-"}
                                  </span>
                                  <span style={{ fontSize: "11px", color: T.textMuted }}>
                                    {v.time || ""}
                                  </span>
                                </div>
                              </Td>

                              <Td>
                                <span style={{ fontWeight: 800, color: "#334155", fontSize: "12px" }}>
                                  {v.billNumber}
                                </span>
                              </Td>

                              <Td>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontWeight: 700, color: T.textDark, fontSize: "12.5px" }}>
                                    {v.doctorName}
                                  </span>
                                  {v.department && (
                                    <span style={{ fontSize: "11px", color: T.textMuted }}>
                                      {v.department}
                                    </span>
                                  )}
                                </div>
                              </Td>

                              <Td>
                                <Badge
                                  $bg={v.visitType === "New" ? "#e0f2fe" : "#f1f5f9"}
                                  $color={v.visitType === "New" ? "#0369a1" : "#475569"}
                                >
                                  {v.visitType}
                                </Badge>
                              </Td>

                              <Td style={{ textAlign: "right", fontWeight: 800, color: T.textDark, fontSize: "12.5px" }}>
                                ₹{parseFloat(v.totalFees || 0).toFixed(2)}
                              </Td>

                              <Td>
                                <span style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                                  {v.paymentMethod || "Cash"}
                                </span>
                              </Td>

                              <Td style={{ textAlign: "center" }}>
                                <Badge
                                  $bg={isRefunded ? "#fee2e2" : isPaid ? "#dcfce7" : "#fef3c7"}
                                  $color={isRefunded ? "#b91c1c" : isPaid ? "#15803d" : "#b45309"}
                                  $border={isRefunded ? "#fca5a5" : isPaid ? "#86efac" : "#fde68a"}
                                >
                                  {isRefunded ? "Refunded" : isPaid ? "Paid" : "Pending"}
                                </Badge>
                              </Td>

                              <Td style={{ textAlign: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", flexWrap: "wrap" }}>
                                  <ActionBtn
                                    type="button"
                                    $bg="#f1f5f9"
                                    $color="#334155"
                                    $border="1px solid #cbd5e1"
                                    $padding="4px 8px"
                                    onClick={() => handleOpenEditBill(v)}
                                    title="Edit Bill & Change Consulting Doctor"
                                  >
                                    <Edit size={12} color="#0f766e" /> Doctor
                                  </ActionBtn>

                                  <ActionBtn
                                    type="button"
                                    $bg="#0f766e"
                                    $padding="4px 9px"
                                    onClick={() => handlePrintOpCard(v)}
                                    title="Print Outpatient Consultation Card / OP Case Sheet"
                                  >
                                    <FileText size={12} /> OP Card
                                  </ActionBtn>

                                  <ActionBtn
                                    type="button"
                                    $bg="#0284c7"
                                    $padding="4px 9px"
                                    onClick={() => handlePrintBill(v)}
                                    title="Print Registration Cash/Credit Bill Receipt"
                                  >
                                    <Printer size={12} /> Bill
                                  </ActionBtn>

                                  <ActionBtn
                                    type="button"
                                    $bg="#0284c7"
                                    $padding="4px 9px"
                                    onClick={() => handlePrintSticker(v)}
                                    title="Print OP Barcode Sticker (97.5mm x 51mm)"
                                  >
                                    <Tag size={12} /> OP Sticker
                                  </ActionBtn>

                                  {isPaid && !isRefunded && (
                                    <ActionBtn
                                      type="button"
                                      $bg="#fee2e2"
                                      $color="#b91c1c"
                                      $border="1px solid #fca5a5"
                                      $padding="4px 9px"
                                      onClick={() => handleOpenRefundModal(v)}
                                      title="Cancel Visit & Process Refund"
                                    >
                                      <RotateCcw size={12} color="#dc2626" /> Cancel
                                    </ActionBtn>
                                  )}
                                </div>
                              </Td>
                            </Tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                </TableWrapper>
              </ModalBody>
            </ModalContainer>
          </ModalOverlay>
        )}


        {/* ═════════════════════════════════════════════════════════════════════
            MODAL 3: EDIT BILL & CHANGE DOCTOR
        ═════════════════════════════════════════════════════════════════════ */}
        {showEditBillModal && selectedBillForEdit && (
          <ModalOverlay onClick={() => setShowEditBillModal(false)} style={{ zIndex: 1200 }}>
            <ModalContainer
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "560px", width: "90%", borderRadius: "14px", zIndex: 1201 }}
            >
              <ModalHeader style={{ background: "#f8fafc", borderBottom: `1px solid ${T.border}` }}>
                <ModalTitle style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: T.textDark }}>
                  <Edit size={18} color={T.primary} />
                  <span>Edit Bill &amp; Change Doctor</span>
                </ModalTitle>
                <CloseButton onClick={() => setShowEditBillModal(false)}>✕</CloseButton>
              </ModalHeader>

              <ModalBody style={{ padding: "18px" }}>
                {/* Bill Summary Box */}
                <div
                  style={{
                    background: "#f0fdfa",
                    border: "1.5px solid #99f6e4",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    marginBottom: "16px"
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
                    <div>
                      <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>BILL NUMBER</span>
                      <div style={{ fontWeight: 800, color: "#0f766e", fontSize: "13px" }}>
                        {selectedBillForEdit.billNumber || selectedBillForEdit.rawBillNumber}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>UHID</span>
                      <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "13px" }}>
                        {selectedBillForEdit.uhid}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>PATIENT NAME</span>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>
                        {selectedBillForEdit.patientName || "-"}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>CURRENT DOCTOR</span>
                      <div style={{ fontWeight: 700, color: "#b45309" }}>
                        {selectedBillForEdit.doctorName || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveBillEdit}>
                  <FormGroup>
                    <label>Select New Consulting Doctor *</label>
                    <Select
                      value={editBillDoctorId}
                      onChange={handleDoctorSelectChange}
                      required
                    >
                      <option value="">-- Choose Doctor --</option>
                      {doctorsList.map((d) => (
                        <option key={d.employeeId} value={d.employeeId}>
                          {d.employeeName} {d.department ? `(${d.department})` : ""} {d.consultingFee ? `• ₹${d.consultingFee}` : ""}
                        </option>
                      ))}
                    </Select>
                    {loadingDoctors && (
                      <span style={{ fontSize: "11px", color: T.textMuted, marginTop: "4px", display: "block" }}>
                        Loading available doctor schedules...
                      </span>
                    )}
                  </FormGroup>

                  <FormGrid style={{ marginTop: "12px" }}>
                    <FormGroup>
                      <label>Department / Specialty</label>
                      <Input
                        type="text"
                        value={editBillDepartment}
                        onChange={(e) => setEditBillDepartment(e.target.value)}
                        placeholder="e.g. General Surgery"
                      />
                    </FormGroup>

                    <FormGroup>
                      <label>Consulting Fee (₹)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editBillConsultingFee}
                        onChange={(e) => setEditBillConsultingFee(e.target.value)}
                        placeholder="e.g. 350.00"
                      />
                    </FormGroup>
                  </FormGrid>

                  <FormGroup style={{ marginTop: "12px" }}>
                    <label>Reason for Doctor Change / Remarks</label>
                    <Input
                      type="text"
                      value={editBillReason}
                      onChange={(e) => setEditBillReason(e.target.value)}
                      placeholder="e.g. Patient requested doctor change, Duty doctor substitution"
                    />
                  </FormGroup>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px", paddingTop: "14px", borderTop: `1px solid ${T.border}` }}>
                    <ActionBtn
                      type="button"
                      $bg="#94a3b8"
                      onClick={() => setShowEditBillModal(false)}
                      disabled={savingBillEdit}
                    >
                      Cancel
                    </ActionBtn>
                    <ActionBtn
                      type="submit"
                      $bg={T.primary}
                      disabled={savingBillEdit}
                    >
                      {savingBillEdit ? (
                        <>
                          <RefreshCw size={14} className="spin" /> Updating Doctor...
                        </>
                      ) : (
                        <>
                          <Edit size={14} /> Update Doctor &amp; Save
                        </>
                      )}
                    </ActionBtn>
                  </div>
                </form>
              </ModalBody>
            </ModalContainer>
          </ModalOverlay>
        )}

        {/* ── Cancel Visit & Process Refund Modal ────────────────────────────── */}
        {showRefundModal && selectedVisitForRefund && (
          <ModalOverlay onClick={() => !processingRefund && setShowRefundModal(false)}>
            <ModalContainer
              style={{ maxWidth: "540px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <RotateCcw size={18} color="#dc2626" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", color: "#991b1b" }}>Cancel Visit &amp; Process Refund</h3>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: T.textMuted }}>
                      Cancel consultation visit and issue refund receipt
                    </p>
                  </div>
                </div>
                <ActionBtn
                  type="button"
                  $bg="#f1f5f9"
                  $color="#475569"
                  $padding="4px 8px"
                  onClick={() => !processingRefund && setShowRefundModal(false)}
                >
                  ✕
                </ActionBtn>
              </ModalHeader>

              <ModalBody>
                {/* Patient Context Banner */}
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 14px", marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#991b1b" }}>
                      {selectedVisitForRefund.patientName || selectedPatientForVisits?.name || "Patient"}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#b91c1c", fontFamily: "monospace" }}>
                      UHID: {selectedVisitForRefund.uhid}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", fontSize: "11.5px", color: "#7f1d1d", marginTop: "6px" }}>
                    <div>Bill No: <strong>{selectedVisitForRefund.billNumber}</strong></div>
                    <div>Doctor: <strong>{selectedVisitForRefund.doctorName}</strong></div>
                    <div>Bill Total: <strong>₹{parseFloat(selectedVisitForRefund.totalFees || selectedVisitForRefund.billAmount || 0).toFixed(2)}</strong></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #fca5a5", marginTop: "8px", paddingTop: "6px", fontSize: "11.5px", color: "#991b1b" }}>
                    <span>Previously Refunded: ₹{parseFloat(selectedVisitForRefund.totalRefunded || 0).toFixed(2)}</span>
                    <span>Max Refundable: <strong>₹{Math.max(0, parseFloat(selectedVisitForRefund.totalFees || selectedVisitForRefund.billAmount || 0) - parseFloat(selectedVisitForRefund.totalRefunded || 0)).toFixed(2)}</strong></span>
                  </div>
                </div>

                <form onSubmit={handleProcessRefund}>
                  {/* Refund Amount */}
                  <FormGroup>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <label style={{ fontWeight: 700, color: "#1e293b", margin: 0 }}>Refund Amount (₹) *</label>
                      <button
                        type="button"
                        onClick={() => {
                          const tot = parseFloat(selectedVisitForRefund.totalFees || selectedVisitForRefund.billAmount || 0);
                          const ref = parseFloat(selectedVisitForRefund.totalRefunded || 0);
                          const bal = Math.max(0, tot - ref);
                          setRefundAmount(bal > 0 ? bal : tot);
                        }}
                        style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Full Refund
                      </button>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={Math.max(0, parseFloat(selectedVisitForRefund.totalFees || selectedVisitForRefund.billAmount || 0) - parseFloat(selectedVisitForRefund.totalRefunded || 0))}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="Enter refund amount in ₹..."
                      required
                    />
                  </FormGroup>

                  {/* Reason for Refund */}
                  <FormGroup style={{ marginTop: "12px" }}>
                    <label style={{ fontWeight: 700, color: "#1e293b" }}>
                      Reason for Cancellation / Refund *
                    </label>
                    <Select
                      value={refundReasonType}
                      onChange={(e) => setRefundReasonType(e.target.value)}
                      style={{ marginBottom: "8px" }}
                      required
                    >
                      <option value="Patient Cancelled Visit / Left Before Consultation">Patient Cancelled Visit / Left Before Consultation</option>
                      <option value="Doctor Emergency / Unavailable">Doctor Emergency / Unavailable</option>
                      <option value="Double Payment / Billing Error">Double Payment / Billing Error</option>
                      <option value="Service Not Availed">Service Not Availed</option>
                      <option value="Patient Transferred to Inpatient (IP)">Patient Transferred to Inpatient (IP)</option>
                      <option value="Other">Other (Specify below)</option>
                    </Select>

                    <textarea
                      rows={2}
                      value={refundRemarks}
                      onChange={(e) => setRefundRemarks(e.target.value)}
                      placeholder={refundReasonType === "Other" ? "Enter detailed refund reason here (Required)..." : "Additional justification / notes (Optional)..."}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "12px",
                        fontFamily: "inherit",
                        boxSizing: "border-box"
                      }}
                      required={refundReasonType === "Other"}
                    />
                  </FormGroup>

                  <div style={{ fontSize: "11px", color: "#64748b", background: "#f8fafc", padding: "8px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", marginTop: "12px" }}>
                    ℹ️ <strong>Audit Log:</strong> This visit cancellation &amp; refund will be recorded with your staff ID and timestamp.
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px", paddingTop: "14px", borderTop: `1px solid ${T.border}` }}>
                    <ActionBtn
                      type="button"
                      $bg="#94a3b8"
                      onClick={() => setShowRefundModal(false)}
                      disabled={processingRefund}
                    >
                      Close
                    </ActionBtn>
                    <ActionBtn
                      type="submit"
                      $bg="#dc2626"
                      disabled={processingRefund}
                    >
                      {processingRefund ? (
                        <>
                          <RefreshCw size={14} className="spin" /> Processing Refund...
                        </>
                      ) : (
                        <>
                          <RotateCcw size={14} /> Confirm Cancellation &amp; Refund
                        </>
                      )}
                    </ActionBtn>
                  </div>
                </form>
              </ModalBody>
            </ModalContainer>
          </ModalOverlay>
        )}

      </Container>
    </PageWrapper>
  );
};

export default PatientsMaster;
