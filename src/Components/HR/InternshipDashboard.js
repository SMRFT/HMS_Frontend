import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styled, { createGlobalStyle } from "styled-components";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import apiRequest from "../../Auth/apiRequest";
import { colors, PageWrapper } from "../GlobalStyles";
import {
  Search, Plus, Edit, Trash2, Eye, Printer, Download,
  Calendar, CreditCard, X, GraduationCap, Home, BookOpen, Mail, Phone, Award, FileCheck, Send
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import headerImage from "../Images/Header.png";
import footerImage from "../Images/Footer.png";

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const Title = styled.h2`
  color: ${colors.textMain};
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
  @media print {
    display: none !important;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  border-left: 4px solid ${props => props.$color || colors.primary};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatLabel = styled.span`
  font-size: 13px;
  color: ${colors.textMuted};
  font-weight: 600;
  text-transform: uppercase;
`;

const StatVal = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: ${colors.textMain};
`;

const ControlBar = styled.div`
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
  @media print {
    display: none !important;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 300px;
  display: flex;
  align-items: center;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 6px 10px 6px 28px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  font-size: 13px;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const DateFilterWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const DateInput = styled.input`
  padding: 5px 8px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  font-size: 13px;
  color: ${colors.textMain};
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const DateLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.textMuted};
`;

const SelectFilter = styled.select`
  padding: 6px 10px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  font-size: 13px;
  min-width: 150px;
  background: white;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const ActionBtnIcon = styled.button`
  background: white;
  border: 1px solid ${colors.border};
  color: ${colors.textMain};
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &:hover {
    background: #f1f5f9;
    border-color: ${colors.primary};
    color: ${colors.primary};
  }
`;

const RegisterBtn = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
  &:hover {
    background: ${colors.primaryDark};
  }
`;

const TableScrollWrapper = styled.div`
  overflow-x: auto;
  transform: rotateX(180deg);
  @media print {
    transform: none;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  overflow: visible;
  min-height: 250px;
  position: relative;
  
  @media print {
    box-shadow: none;
    border: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
  transform: rotateX(180deg);
  
  @media print {
    font-size: 11px;
    width: 100%;
    transform: none;
  }
`;

const Th = styled.th`
  background: #f8fafc;
  padding: 10px 12px;
  font-weight: 600;
  color: ${colors.textMain};
  border-bottom: 2px solid ${colors.border};
`;

const Td = styled.td`
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: ${colors.textMain};
  vertical-align: middle;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
  background-color: ${props => {
    if (props.$status === "Fully Paid") return "#dcfce7";
    if (props.$status === "Partially Paid") return "#fef3c7";
    return "#fee2e2";
  }};
  color: ${props => {
    if (props.$status === "Fully Paid") return "#166534";
    if (props.$status === "Partially Paid") return "#92400e";
    return "#991b1b";
  }};
`;

/* ── Fixed-size action button so every icon/text button in the row
   (₹ text, lucide icons, dropdown triggers) lines up identically ── */
const ActionBtn = styled.button`
  background: none;
  border: none;
  color: ${props => props.$color || colors.primary};
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  margin-right: 4px;
  vertical-align: middle;
  font-size: 14px;
  &:hover {
    background: #f1f5f9;
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    background: none !important;
  }
`;

/* ── Dropdown trigger wrapper (no CSS :hover mechanic anymore —
   menu itself is portaled to <body> and controlled by React state) ── */
const DropdownTriggerWrapper = styled.div`
  position: relative;
  display: inline-block;
  vertical-align: middle;
  margin-right: 4px;
`;

/* ── Floating menu rendered via portal at document.body level.
   position: fixed + portal means it is never clipped by
   TableScrollWrapper's overflow-x:auto, and can never inflate
   that container's scrollable area (which was causing the
   "shivering" scrollbar flicker). ── */
const FloatingMenu = styled.div`
  position: fixed;
  background-color: white;
  min-width: 175px;
  box-shadow: 0px 8px 16px 0px rgba(15, 23, 42, 0.15);
  z-index: 3000;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  overflow: hidden;
`;

const FloatingMenuItem = styled.button`
  color: ${colors.textMain};
  padding: 8px 12px;
  width: 100%;
  border: none;
  background: none;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background-color: #f1f5f9;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media print {
    display: none !important;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: ${props => props.$wide ? "750px" : "450px"};
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 10px;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colors.textMuted};
  &:hover {
    color: ${colors.danger};
  }
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ModalLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.textMain};
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  font-size: 14px;
`;

const ModalSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  font-size: 14px;
  background: white;
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  font-size: 14px;
  background: white;
  resize: vertical;
  font-family: inherit;
`;

const ModalButton = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
  &:hover {
    background: ${colors.primaryDark};
  }
`;

const LedgerTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-top: 10px;
  border: 1px solid #e2e8f0;
`;

const LedgerTh = styled.th`
  background: #f8fafc;
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
`;

const LedgerTd = styled.td`
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalFieldINR = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  span {
    position: absolute;
    left: 10px;
    font-weight: 700;
    color: ${colors.textMuted};
  }
  input {
    padding-left: 24px;
  }
`;

const PrintGlobalStyle = createGlobalStyle`
  @media print {
    /* Hide Header */
    header {
      display: none !important;
    }

    /* Hide Sidebar using innermost div selector containing sidebar elements */
    #root div:has(a[href="/SidebarEditor"]):not(:has(div:has(a[href="/SidebarEditor"]))) {
      display: none !important;
    }

    /* Reset ALL parent containers wrapping the table to occupy full width and have no offsets */
    #root div:has(#printable-table) {
      margin: 0 !important;
      padding: 0 !important;
      margin-left: 0 !important;
      padding-left: 0 !important;
      left: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      box-shadow: none !important;
      border: none !important;
      background: white !important;
    }

    /* Hide search inputs, control panels, stats, buttons and other non-print elements */
    button,
    .no-print,
    [class*="ControlBar"],
    [class*="DashboardHeader"],
    [class*="StatsGrid"],
    h2, h3, h4 {
      display: none !important;
    }

    /* Target table styling for print layout */
    #printable-table {
      display: block !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
    }

    #printable-table table {
      width: 100% !important;
      border-collapse: collapse !important;
    }

    #printable-table th, #printable-table td {
      border: 1px solid #cbd5e1 !important;
      padding: 8px 12px !important;
      color: #000 !important;
    }

    #printable-table th.no-print,
    #printable-table td.no-print {
      display: none !important;
    }
  }
`;

const PrintHeader = styled.div`
  display: none;
  @media print {
    display: block !important;
    margin-bottom: 20px;
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
    h1 {
      margin: 0 0 6px 0;
      font-size: 22px;
      font-weight: 700;
      color: #000;
    }
    p {
      margin: 0;
      font-size: 13px;
      color: #444;
      font-weight: 600;
    }
  }
`;

const formatDateDMY = (dateStr) => {
  if (!dateStr) return "";
  const cleanStr = dateStr.toString().split("T")[0].split(" ")[0].trim();
  const parts = cleanStr.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  return dateStr;
};

export default function InternshipDashboard() {
  const [interns, setInterns] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]"
  );
  const canHR = allowedActions.includes("HMS-P-HRIN-RW");
  const canApprove = allowedActions.includes("HMS-P-HRINA-RW");
  const canPayment = allowedActions.includes("HMS-P-HRINP-RW");

  // Modal controls
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [modalType, setModalType] = useState(null); // 'payment', 'ledger', 'edit', 'certificate'

  // Payment states
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);

  // Certificate states
  const [certApproverId, setCertApproverId] = useState("");
  const [certDescription, setCertDescription] = useState("");
  const [certWithLetterpad, setCertWithLetterpad] = useState(true);
  const [approvers, setApprovers] = useState([]);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTodayPaidOnly, setShowTodayPaidOnly] = useState(false);
  const itemsPerPage = 10;

  // Edit states
  const [editSalutation, setEditSalutation] = useState("Mr.");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editDegree, setEditDegree] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editIsHosteller, setEditIsHosteller] = useState(false);
  const [editFeePerMonth, setEditFeePerMonth] = useState("");
  const [editHostelFeePerMonth, setEditHostelFeePerMonth] = useState("");
  const [editDiscountAmount, setEditDiscountAmount] = useState("0");
  const [editDiscountRemarks, setEditDiscountRemarks] = useState("");
  const [editTotalFee, setEditTotalFee] = useState("");

  // Dropdown menu state (Print / Send) — rendered via portal
  const [openMenu, setOpenMenu] = useState(null); // { type: 'print'|'send', internId, top, left }
  const menuRef = useRef(null);

  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const url = `${HMSURL}hr/internships/?search=${search}&from_date=${fromDate}&to_date=${toDate}`;
      const res = await apiRequest(url, "GET");
      if (res.success && res.data) {
        setInterns(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not fetch intern students list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, [search, fromDate, toDate]);

  // Financial Stats
  const totalRegistrations = interns.length;
  const totalPaid = interns.reduce((sum, item) => sum + item.amount_paid, 0);
  const totalFeeExpected = interns.reduce((sum, item) => sum + item.total_fee, 0);
  const totalPending = totalFeeExpected - totalPaid;

  const todayObj = new Date();
  const year = todayObj.getFullYear();
  const month = String(todayObj.getMonth() + 1).padStart(2, '0');
  const day = String(todayObj.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const collectStart = fromDate || todayStr;
  const collectEnd = toDate || todayStr;

  const periodCollected = interns.reduce((sum, item) => {
    const payments = item.payment_details || [];
    const periodSum = payments.reduce((pSum, p) => {
      const pDate = p.date ? p.date.toString().split("T")[0].split(" ")[0].trim() : "";
      if (pDate && pDate >= collectStart && pDate <= collectEnd) {
        return pSum + (parseFloat(p.amount) || 0);
      }
      return pSum;
    }, 0);
    return sum + periodSum;
  }, 0);

  const getUniqueValues = (key) => {
    const vals = interns.map(item => item[key] || "");
    const clean = vals.map(v => v.trim()).filter(v => v !== "");
    return [...new Set(clean)].sort();
  };

  const uniqueColleges = getUniqueValues("college");
  const uniqueDepartments = getUniqueValues("department");
  const uniqueCourses = getUniqueValues("degree");

  const filteredInterns = interns.filter((item) => {
    if (showTodayPaidOnly) {
      const payments = item.payment_details || [];
      const paidInPeriod = payments.some(p => {
        if (!p.date) return false;
        const pDate = p.date.toString().split("T")[0].split(" ")[0].trim();
        return pDate >= collectStart && pDate <= collectEnd;
      });
      if (!paidInPeriod) return false;
    }
    if (statusFilter !== "" && item.payment_status !== statusFilter) return false;
    if (collegeFilter !== "" && (item.college || "").trim() !== collegeFilter) return false;
    if (departmentFilter !== "" && (item.department || "").trim() !== departmentFilter) return false;
    if (courseFilter !== "" && (item.degree || "").trim() !== courseFilter) return false;
    if (approvalFilter !== "") {
      if (approvalFilter === "Pending for Approval") {
        if (item.approved_by) return false;
        if (item.payment_status === "Pending" || item.payment_status === "Partially Paid") return false;
        if (item.payment_status === "Fully Paid" && !item.cert_description) return false;
      } else if (approvalFilter === "Pending for Certification Generation") {
        if (item.approved_by) return false;
        if (item.payment_status !== "Fully Paid" || !!item.cert_description) return false;
      } else if (approvalFilter === "Payment Pending") {
        if (item.approved_by) return false;
        if (item.payment_status !== "Pending" && item.payment_status !== "Partially Paid") return false;
      } else if (approvalFilter === "Approved") {
        if (!item.approved_by) return false;
      } else if (approvalFilter === "Email") {
        if (!item.email_count || item.email_count <= 0) return false;
      } else if (approvalFilter === "Whatsapp") {
        if (!item.whatsapp_count || item.whatsapp_count <= 0) return false;
      }
    }
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, fromDate, toDate, statusFilter, collegeFilter, departmentFilter, courseFilter, approvalFilter, showTodayPaidOnly]);

  // Close the floating dropdown menu on outside click, scroll, or resize
  useEffect(() => {
    if (!openMenu) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    const closeOnScroll = () => setOpenMenu(null);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", closeOnScroll);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", closeOnScroll);
    };
  }, [openMenu]);

  const toggleMenu = (type, internId, e) => {
    e.stopPropagation();
    if (openMenu && openMenu.type === type && openMenu.internId === internId) {
      setOpenMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setOpenMenu({
      type,
      internId,
      top: rect.bottom + 4,
      left: rect.right,
    });
  };

  const handleDelete = async (internId, name) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to soft delete ${name}'s internship record?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.danger,
      cancelButtonColor: colors.textMuted,
      confirmButtonText: "Yes, Delete"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiRequest(`${HMSURL}hr/internships/edit/${internId}/`, "DELETE");
          if (res.success) {
            Swal.fire("Deleted", "Internship record soft deleted successfully.", "success");
            fetchInterns();
          } else {
            Swal.fire("Error", res.error || "Delete failed", "error");
          }
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "Server error while deleting record.", "error");
        }
      }
    });
  };

  const handleOpenPayment = (intern) => {
    setSelectedIntern(intern);
    setPayAmount(intern.pending_amount.toString());
    setPayMethod("CASH");
    setPayDate(new Date().toISOString().split("T")[0]);
    setModalType("payment");
  };

  const handleOpenLedger = (intern) => {
    setSelectedIntern(intern);
    setModalType("ledger");
  };

  const handleOpenEdit = (intern) => {
    setSelectedIntern(intern);
    let rawName = (intern.student_name || "").trim();
    let sal = "Mr.";
    if (rawName.startsWith("Ms.")) {
      sal = "Ms.";
      rawName = rawName.substring(3).trim();
    } else if (rawName.startsWith("Mr.")) {
      sal = "Mr.";
      rawName = rawName.substring(3).trim();
    }
    setEditSalutation(sal);
    setEditName(rawName);
    setEditEmail(intern.email || "");
    setEditMobile(intern.mobile_number || "");
    setEditCollege(intern.college);
    setEditDept(intern.department);
    setEditDegree(intern.degree);
    setEditStartDate(intern.start_date);
    setEditEndDate(intern.end_date);
    setEditDuration(intern.duration);
    setEditIsHosteller(intern.is_hosteller);
    setEditFeePerMonth(intern.fee_per_month.toString());
    const hFeeVal = (intern.hostel_fee_per_month && intern.hostel_fee_per_month > 0) ? intern.hostel_fee_per_month.toString() : "3000";
    setEditHostelFeePerMonth(hFeeVal);
    setEditDiscountAmount((intern.discount_amount || 0).toString());
    setEditDiscountRemarks(intern.discount_remarks || "");
    setEditTotalFee(intern.total_fee.toString());
    setModalType("edit");
  };

  const handleOpenCertificateModal = async (intern, mode) => {
    setSelectedIntern(intern);
    setModalType(mode);
    setCertApproverId(intern.approved_by || "");
    setCertWithLetterpad(true);

    if (intern.cert_description) {
      setCertDescription(intern.cert_description);
    } else {
      // Fetch default template
      try {
        const res = await apiRequest(`${HMSURL}hr/internships/certificate-template/`, "GET");
        if (res.success && res.data) {
          const templates = Array.isArray(res.data) ? res.data : (res.data.data || []);
          if (templates.length > 0) {
            setCertDescription(templates[0].description);
          }
        }
      } catch (e) {
        console.error("Could not fetch certificate template:", e);
      }
    }

    // Fetch approver details if approved
    if (intern.approved_by) {
      try {
        const res = await apiRequest(`${HMSURL}employee-signature/?employee_id=${intern.approved_by}`, "GET");
        if (res.success && res.data) {
          const approverInfo = res.data.data || res.data;
          setApprovers([approverInfo]);
        }
      } catch (e) {
        console.error("Could not fetch approver details:", e);
      }
    } else {
      setApprovers([]);
    }
  };

  const handleTextareaKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      if (start === undefined || end === undefined) return;
      const selected = val.substring(start, end);
      const replacement = `<strong>${selected}</strong>`;
      const newText = val.substring(0, start) + replacement + val.substring(end);
      setCertDescription(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start + 8;
        textarea.selectionEnd = start + 8 + selected.length;
      }, 0);
    }
  };

  const handleSaveCertificateOnly = async (e) => {
    if (e) e.preventDefault();
    try {
      Swal.showLoading();
      const res = await apiRequest(`${HMSURL}hr/internships/approve/${selectedIntern.intern_id}/`, "POST", {
        cert_template_id: 1,
        cert_description: certDescription,
        is_approve: false
      });
      Swal.close();
      if (res.success) {
        Swal.fire("Saved", "Certificate content saved successfully!", "success");
        const updated = {
          ...selectedIntern,
          cert_description: certDescription
        };
        setSelectedIntern(updated);
        setModalType("preview_certificate");
        fetchInterns();
      } else {
        Swal.fire("Error", res.error || "Failed to save certificate content", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.close();
      Swal.fire("Error", "Server error during save", "error");
    }
  };

  const handleApproveCertificateConfirm = async () => {
    try {
      Swal.showLoading();
      const res = await apiRequest(`${HMSURL}hr/internships/approve/${selectedIntern.intern_id}/`, "POST", {
        cert_template_id: 1,
        cert_description: certDescription,
        is_approve: true
      });
      Swal.close();
      if (res.success) {
        Swal.fire("Approved", "Certificate approved successfully!", "success");
        setModalType(null);
        setSelectedIntern(null);
        fetchInterns();
      } else {
        Swal.fire("Error", res.error || "Failed to approve certificate", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.close();
      Swal.fire("Error", "Server error during approval", "error");
    }
  };

  const handleLoadDefaultTemplate = async () => {
    try {
      Swal.showLoading();
      const res = await apiRequest(`${HMSURL}hr/internships/certificate-template/`, "GET");
      Swal.close();
      if (res.success && res.data) {
        const templates = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setAvailableTemplates(templates);
        setShowTemplatePicker(true);
      } else {
        Swal.fire("Error", "Could not fetch template data", "error");
      }
    } catch (e) {
      console.error("Could not fetch default template:", e);
      Swal.close();
      Swal.fire("Error", "Could not fetch default template", "error");
    }
  };

  const handleSaveDefaultTemplate = async () => {
    if (!certDescription || !certDescription.trim()) {
      Swal.fire("Error", "Description template cannot be empty", "error");
      return;
    }

    Swal.fire({
      title: 'Save Certificate Template',
      input: 'text',
      inputLabel: 'Give this template a name (e.g. Standard, Nursing, etc.):',
      inputValue: 'Certificate Template',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'You must enter a title for the template!';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const title = result.value.trim();
        try {
          Swal.showLoading();
          const res = await apiRequest(`${HMSURL}hr/internships/certificate-template/`, "POST", {
            title: title,
            description: certDescription
          });
          Swal.close();
          if (res.success) {
            Swal.fire("Success", `Template "${title}" saved successfully!`, "success");
          } else {
            Swal.fire("Error", res.error || "Failed to save template", "error");
          }
        } catch (e) {
          console.error("Could not save template:", e);
          Swal.close();
          Swal.fire("Error", "Failed to save template", "error");
        }
      }
    });
  };

  const handleDeleteTemplate = async (templateId, e) => {
    e.stopPropagation();
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this template deletion!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.showLoading();
          const res = await apiRequest(`${HMSURL}hr/internships/certificate-template/${templateId}/`, "DELETE");
          Swal.close();
          if (res.success) {
            setAvailableTemplates(prev => prev.filter(t => t.template_id !== templateId));
            Swal.fire("Deleted!", "The template has been deleted.", "success");
          } else {
            Swal.fire("Error", res.error || "Failed to delete template", "error");
          }
        } catch (err) {
          console.error("Error deleting template:", err);
          Swal.close();
          Swal.fire("Error", "Server error during deletion", "error");
        }
      }
    });
  };

  const handleDirectPrintCertificate = async (intern, withLetterpad = true, returnBlob = false) => {
    let signatureBase64 = null;
    let approverName = "";
    let approverDesignation = "";
    const approverId = intern.approved_by;

    if (!approverId) {
      Swal.fire("Error", "This certificate has not been approved yet.", "error");
      return;
    }

    try {
      if (!returnBlob) {
        Swal.showLoading();
      }

      const res = await apiRequest(`${HMSURL}employee-signature/?employee_id=${approverId}`, "GET");
      if (res.success && res.data) {
        signatureBase64 = res.data.signatureBase64;
        approverName = res.data.employeeName || approverName;
        approverDesignation = res.data.designation || approverDesignation;
      }
      if (!returnBlob) {
        Swal.close();
      }
    } catch (err) {
      console.warn("Could not fetch signature image:", err);
      if (!returnBlob) {
        Swal.close();
      }
    }

    // Process text replacements using stored cert_description
    const descToUse = intern.cert_description || "";
    let formattedText = descToUse
      .replace(/\[Student Name\]/g, `<strong>${intern.student_name}</strong>`)
      .replace(/\[College\]/g, `<strong>${intern.college}</strong>`)
      .replace(/\[Degree\]/g, `<strong>${intern.degree}</strong>`)
      .replace(/\[Department\]/g, intern.department ? `<strong>${intern.department}</strong>` : "")
      .replace(/\[Duration\]/g, `<strong>${intern.duration}</strong>`)
      .replace(/\[Start Date\]/g, `<strong>${formatDateDMY(intern.start_date)}</strong>`)
      .replace(/\[End Date\]/g, `<strong>${formatDateDMY(intern.end_date)}</strong>`);

    const printDate = new Date(intern.approved_at || new Date()).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    // Build HTML (shared by print window AND blob generation)
    const headerHtml = withLetterpad
      ? `
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${headerImage}" alt="Header" style="width: 100%; height: auto; display: block;" crossorigin="anonymous" />
        </div>
      `
      : `<div style="height: 140px;"></div>`;

    const footerHtml = withLetterpad
      ? `
        <div style="position: absolute; bottom: 30px; left: 40px; right: 40px; text-align: center;">
          <img src="${footerImage}" alt="Footer" style="width: 100%; height: auto; display: block;" crossorigin="anonymous" />
        </div>
      `
      : ``;

    const certBodyHtml = `
  <div style="font-family: 'Times New Roman', Times, serif; line-height: 1.8; color: #0f172a; min-height: 270mm; box-sizing: border-box; position: relative; padding: 10mm;">
        ${headerHtml}
        <div style="padding: 0 40px 120px 40px;">
          <div style="text-align: right; font-size: 14px; margin-bottom: 30px;">
            <strong>Date:</strong> ${printDate}
          </div>
          
          <div style="text-align: center; margin-bottom: 50px;">
            <h2 style="margin: 0; font-size: 24px; font-weight: bold; text-decoration: underline; letter-spacing: 1.5px; color: #1e3a8a; text-transform: uppercase;">
              INTERNSHIP CERTIFICATE
            </h2>
          </div>
          
          <div style="font-size: 16px; text-align: justify; text-justify: inter-word; margin-bottom: 80px; text-indent: 50px; white-space: pre-wrap;">
            ${formattedText}
          </div>
          
          <div style="display: flex; justify-content: flex-end; margin-top: 60px;">
            <div style="text-align: center; width: 220px; font-family: 'Times New Roman', serif;">
              ${signatureBase64
        ? `<img src="data:image/png;base64,${signatureBase64}" style="max-height: 60px; max-width: 150px; margin-bottom: 4px;" alt="Signature" />`
        : `<div style="height: 60px;"></div>`
      }
              <div style="border-top: 1px solid #000; padding-top: 6px; font-weight: bold; font-size: 14px; text-transform: uppercase;">
                ${approverName}
              </div>
              <div style="font-size: 12px; color: #475569; margin-top: 2px;">
                ${approverDesignation || "Authorized Signatory"}
              </div>
            </div>
          </div>
        </div>
        ${footerHtml}
      </div>
    `;

    // ── BLOB MODE: for Email / WhatsApp ──
    if (returnBlob) {
      const container = document.createElement("div");
      container.style.cssText = "position:fixed;top:-99999px;left:-99999px;width:794px;min-height:1123px;background:white;z-index:-1;";
      container.innerHTML = certBodyHtml;
      document.body.appendChild(container);

      // Wait for images to load
      const imgs = container.querySelectorAll("img");
      await Promise.all(Array.from(imgs).map(img =>
        img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
      ));

      const canvas = await html2canvas(container.firstElementChild, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 794,
      });
      document.body.removeChild(container);

      const PAGE_W_MM = 210;
      const PAGE_H_MM = 297;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = PAGE_W_MM / imgW;
      const renderedH = imgH * ratio;

      if (renderedH <= PAGE_H_MM) {
        doc.addImage(imgData, "JPEG", 0, 0, PAGE_W_MM, renderedH);
      } else {
        let yOffset = 0;
        let pageIndex = 0;
        const slicePixH = Math.round(PAGE_H_MM / ratio);
        while (yOffset < imgH) {
          const sliceH = Math.min(slicePixH, imgH - yOffset);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = imgW;
          sliceCanvas.height = sliceH;
          const ctx = sliceCanvas.getContext("2d");
          ctx.drawImage(canvas, 0, yOffset, imgW, sliceH, 0, 0, imgW, sliceH);
          if (pageIndex > 0) doc.addPage();
          doc.addImage(sliceCanvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, PAGE_W_MM, sliceH * ratio);
          yOffset += sliceH;
          pageIndex++;
        }
      }
      return { blob: doc.output("blob"), studentName: intern.student_name };
    }

    // ── PRINT WINDOW MODE ──
    const css = `
      body { margin: 0; padding: 0; background: white; }
      @media print {
        .no-print { display: none !important; }
        body { margin: 0; }
        @page { size: portrait; margin: 0; }
      }
    `;

    const pw = window.open("", "", "width=900,height=800");
    pw.document.write(`<!DOCTYPE html><html><head>
      <title>Internship Certificate - ${intern.student_name}</title>
      <style>${css}</style>
      <style id="orientation-style">@page { size: portrait; }</style>
    </head><body>
      <div class="no-print" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;
        margin-bottom:14px;padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-family:sans-serif;">
        <span style="font-size:12px;font-weight:600;color:#555;margin-right:2px">Orientation:</span>
        <button id="btn-portrait" onclick="setOrientation('portrait')"
          style="padding:5px 14px;font-size:12px;font-weight:700;
                 border:2px solid #0ea5e9;border-radius:5px;
                 background:#e0f2fe;color:#1e40af;cursor:pointer">
          Portrait
        </button>
        <button id="btn-landscape" onclick="setOrientation('landscape')"
          style="padding:5px 14px;font-size:12px;font-weight:700;
                 border:1px solid #cbd5e1;border-radius:5px;
                 background:#fff;color:#64748b;cursor:pointer">
          Landscape
        </button>
        <button onclick="window.print()"
          style="padding:5px 18px;font-size:12px;font-weight:700;border:none;
                 border-radius:5px;background:#0ea5e9;color:#fff;cursor:pointer;margin-left:8px">
          🖨 Print
        </button>
      </div>
      <script>
        function setOrientation(mode) {
          document.getElementById('orientation-style').textContent =
            '@page { size: ' + mode + '; }';
          var isP = mode === 'portrait';
          var pb = document.getElementById('btn-portrait');
          var lb = document.getElementById('btn-landscape');
          pb.style.background  = isP  ? '#e0f2fe' : '#fff';
          pb.style.borderColor = isP  ? '#0ea5e9' : '#cbd5e1';
          pb.style.color       = isP  ? '#1e40af' : '#64748b';
          lb.style.background  = !isP ? '#e0f2fe' : '#fff';
          lb.style.borderColor = !isP ? '#0ea5e9' : '#cbd5e1';
          lb.style.color       = !isP ? '#1e40af' : '#64748b';
        }
      <\/script>
      ${certBodyHtml}
    </body></html>`);
    pw.document.close();
  };


  const handleEmailCertificate = async (intern) => {
    const defaultEmail = intern.email || "";
    const userEmail = window.prompt("Enter recipient email address (comma-separated for multiple):", defaultEmail);
    if (userEmail === null) return;
    const cleanEmail = userEmail.trim();
    if (!cleanEmail) { alert("Email address is required."); return; }
    Swal.fire({
      title: "Sending Email...",
      text: "Please wait while the certificate is being generated and emailed.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    try {
      const { blob, studentName } = await handleDirectPrintCertificate(intern, true, true);
      const formData = new FormData();
      formData.append("subject", `Internship Certificate - ${studentName}`);
      formData.append("message", `Dear ${studentName},\n\nPlease find attached your Internship Certificate from Shanmuga Hospital.\n\nThank you.`);
      const emails = cleanEmail.split(",").map(e => e.trim()).filter(Boolean);
      emails.forEach(addr => formData.append("recipients", addr));
      formData.append("patient_name", studentName);
      formData.append("patient_id", intern.intern_id?.toString() || "");
      formData.append("template_name", "internship_certificate");
      formData.append("attachments", new File([blob], `${studentName}_Internship_Certificate.pdf`, { type: "application/pdf" }));
      const res = await apiRequest(`${HMSURL}send-email/`, "POST", formData);
      Swal.close();
      if (res.success) {
        Swal.fire("Sent!", "Internship certificate sent via Email.", "success");
        fetchInterns();
      } else { Swal.fire("Error", res.error || "Failed to send email.", "error"); }
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "Error sending email: " + (err.message || err), "error");
    }
  };

  const handleWhatsAppCertificate = async (intern) => {
    const defaultPhone = intern.mobile_number || "";
    const userPhone = window.prompt("Enter WhatsApp phone number (with country code):", defaultPhone);
    if (userPhone === null) return;
    const cleanPhone = userPhone.trim();
    if (!cleanPhone) { alert("Phone number is required."); return; }
    Swal.fire({
      title: "Sending WhatsApp...",
      text: "Please wait while the certificate is being generated and sent.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    try {
      const { blob, studentName } = await handleDirectPrintCertificate(intern, true, true);
      const pdfFile = new File([blob], `${studentName}_Internship_Certificate.pdf`, { type: "application/pdf" });
      const uploadForm = new FormData();
      uploadForm.append("file", pdfFile);
      const uploadRes = await apiRequest(`${HMSURL}upload-pdf/`, "POST", uploadForm);
      if (!uploadRes.success || !uploadRes.data?.file_url) {
        Swal.fire("Error", "File upload failed: " + (uploadRes.error || "Unknown error"), "error"); return;
      }
      const payload = {
        patient_name: studentName,
        phone: cleanPhone,
        collection_time: "N/A",
        collected_date: formatDateDMY(intern.start_date) || "N/A",
        file_url: uploadRes.data.file_url,
        pdf_name: `${studentName}_Internship_Certificate.pdf`,
        patient_id: intern.intern_id?.toString() || "",
        template_name: "internship_certificate",
      };
      const waRes = await apiRequest(`${HMSURL}send-whatsapp/`, "POST", payload);
      Swal.close();
      if (waRes.success) {
        Swal.fire("Sent!", "Internship certificate sent via WhatsApp.", "success");
        fetchInterns();
      } else { Swal.fire("Error", waRes.error || "Failed to send WhatsApp.", "error"); }
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "Error sending WhatsApp: " + (err.message || err), "error");
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payAmount || parseFloat(payAmount) <= 0) {
      Swal.fire("Error", "Please enter a valid payment amount.", "error");
      return;
    }

    try {
      const res = await apiRequest(`${HMSURL}hr/internships/payment/${selectedIntern.intern_id}/`, "POST", {
        amount: parseFloat(payAmount),
        method: payMethod,
        date: payDate
      });
      if (res.success) {
        Swal.fire("Payment Saved", "Partial payment recorded successfully!", "success");
        setModalType(null);
        setSelectedIntern(null);
        fetchInterns();
      } else {
        Swal.fire("Error", res.error || "Failed to record payment", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server error recording payment.", "error");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      let cleanEditName = editName.trim().replace(/^(Mr\.|Ms\.|Mrs\.|Mr|Ms|Mrs)\s*/i, '');
      const fullEditName = `${editSalutation}${cleanEditName}`;
      const res = await apiRequest(`${HMSURL}hr/internships/edit/${selectedIntern.intern_id}/`, "POST", {
        student_name: fullEditName,
        email: editEmail,
        mobile_number: editMobile,
        college: editCollege,
        department: editDept,
        degree: editDegree,
        start_date: editStartDate,
        end_date: editEndDate,
        duration: editDuration,
        is_hosteller: editIsHosteller,
        fee_per_month: parseFloat(editFeePerMonth) || 0,
        hostel_fee_per_month: editIsHosteller ? (parseFloat(editHostelFeePerMonth) || 0) : 0,
        discount_amount: parseFloat(editDiscountAmount) || 0,
        discount_remarks: editDiscountRemarks,
        total_fee: parseFloat(editTotalFee) || 0,
        pending_amount: parseFloat(editTotalFee || 0) - (selectedIntern.amount_paid || 0),
        auth_user_id: localStorage.getItem("user_id") || "system"
      });
      if (res.success) {
        Swal.fire({
          title: "Updated!",
          text: "Intern details updated successfully.",
          icon: "success",
          confirmButtonColor: colors.primary
        });
        setModalType(null);
        fetchInterns();
      } else {
        Swal.fire("Update Failed", res.error || "Failed to update intern details", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server error updating intern details.", "error");
    }
  };

  // Re-calculate duration & total on edit modal
  useEffect(() => {
    if (modalType !== 'edit' || !editStartDate || !editEndDate) return;
    const start = new Date(editStartDate);
    const end = new Date(editEndDate);
    if (isNaN(start) || isNaN(end) || end < start) {
      setEditDuration("Invalid dates");
      return;
    }

    // Inclusive calculation (end date is inclusive, so add 1 day for differences)
    const endForCalc = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    const diffTime = Math.abs(endForCalc - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calendar months and days difference
    let yearsDiff = endForCalc.getFullYear() - start.getFullYear();
    let monthsDiff = endForCalc.getMonth() - start.getMonth();
    let daysDiff = endForCalc.getDate() - start.getDate();

    if (daysDiff < 0) {
      monthsDiff -= 1;
      const prevMonthDate = new Date(endForCalc.getFullYear(), endForCalc.getMonth(), 0);
      daysDiff += prevMonthDate.getDate();
    }

    if (monthsDiff < 0) {
      yearsDiff -= 1;
      monthsDiff += 12;
    }

    const totalMonths = yearsDiff * 12 + monthsDiff;

    let desc = "";
    if (totalMonths > 0) {
      desc = `${totalMonths} month${totalMonths > 1 ? 's' : ''}`;
      if (daysDiff > 0) {
        desc += ` and ${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
      }
    } else {
      desc = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    setEditDuration(desc);

    const fee = parseFloat(editFeePerMonth) || 0;
    const hFee = editIsHosteller ? (parseFloat(editHostelFeePerMonth) || 0) : 0;
    const discount = parseFloat(editDiscountAmount) || 0;

    const calculatedMonths = Math.max(1, totalMonths + (daysDiff > 0 ? 1 : 0));
    setEditTotalFee(Math.max(0, ((fee + hFee) * calculatedMonths) - discount).toString());
  }, [editStartDate, editEndDate, editFeePerMonth, editHostelFeePerMonth, editIsHosteller, editDiscountAmount, modalType]);

  const handlePrint = () => {
    const reportDate = new Date().toLocaleDateString('en-IN');
    const filterText = fromDate || toDate ? `Date Filters: ${fromDate || "Start"} to ${toDate || "End"}` : "All Dates";

    const rowsHtml = filteredInterns.map((item) => `
      <tr>
        <td style="font-weight: 600; text-align: center; border: 1px solid #cbd5e1; padding: 8px;">${item.intern_id}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">
          <div style="font-weight: 600; font-size: 13px;">${item.student_name}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
            ${item.mobile_number ? `📞 ${item.mobile_number}` : ""} ${item.email ? `✉️ ${item.email}` : ""}
          </div>
          <div style="font-size: 12px; margin-top: 4px;">
            <span style="color: #64748b; font-weight: 600;">College:</span> ${item.college} ${item.degree ? `(${item.degree})` : ""}
          </div>
          ${item.department ? `
          <div style="font-size: 12px; margin-top: 2px;">
            <span style="color: #64748b; font-weight: 600;">Dept:</span> ${item.department}
          </div>
          ` : ""}
          <div style="font-size: 12px; margin-top: 2px;">
            <span style="color: #64748b; font-weight: 600;">Duration:</span> ${item.duration} <span style="font-size: 11px; font-weight: 600; color: #0f172a;">(${formatDateDMY(item.start_date)} to ${formatDateDMY(item.end_date)})</span>
          </div>
          ${item.created_date ? `
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            <span style="font-weight: 600;">Reg Date:</span> ${formatDateDMY(item.created_date)}
          </div>
          ` : ""}
        </td>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px;">${item.is_hosteller ? "🏡 Yes" : "No"}</td>
        <td style="font-weight: 600; border: 1px solid #cbd5e1; padding: 6px; text-align: right;">₹${item.total_fee.toLocaleString('en-IN')}</td>
        <td style="color: #166534; font-weight: 600; border: 1px solid #cbd5e1; padding: 6px; text-align: right;">₹${item.amount_paid.toLocaleString('en-IN')}</td>
        <td style="color: ${item.pending_amount > 0 ? '#991b1b' : '#64748b'}; font-weight: 600; border: 1px solid #cbd5e1; padding: 6px; text-align: right;">
          ₹${item.pending_amount.toLocaleString('en-IN')}
        </td>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px; font-size: 11px; font-weight: 600;">
          ${item.approved_by ? `
            <div style="display: flex; flex-direction: column; gap: 2px; align-items: center;">
              <span style="color: ${item.email_count > 0 ? '#166534' : '#64748b'}; background: ${item.email_count > 0 ? '#dcfce7' : '#f1f5f9'}; padding: 2px 6px; border-radius: 4px; display: inline-block;">✉️ Email-${item.email_count || 0}</span>
              <span style="color: ${item.whatsapp_count > 0 ? '#166534' : '#64748b'}; background: ${item.whatsapp_count > 0 ? '#dcfce7' : '#f1f5f9'}; padding: 2px 6px; border-radius: 4px; display: inline-block;">📱 Whatsapp-${item.whatsapp_count || 0}</span>
            </div>
          ` : '<span style="color: #64748b; font-style: italic;">Not Approved</span>'}
        </td>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px;">
          <span style="padding: 4px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase;
                       background-color: ${item.payment_status === "Fully Paid" ? "#dcfce7" : item.payment_status === "Partially Paid" ? "#fef3c7" : "#fee2e2"};
                       color: ${item.payment_status === "Fully Paid" ? "#166534" : item.payment_status === "Partially Paid" ? "#92400e" : "#991b1b"};">
            ${item.payment_status}
          </span>
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 6px; font-size: 10px; line-height: 1.4; vertical-align: top;">
          ${item.payment_details && item.payment_details.length > 0
        ? item.payment_details.map(p => `
                <div style="border-bottom: 1px solid #f1f5f9; padding: 2px 0; white-space: nowrap;">
                  <strong>${formatDateDMY(p.date)}</strong> - ${p.method} - <strong>₹${p.amount.toLocaleString('en-IN')}</strong>
                </div>
              `).join("")
        : `<span style="color: #64748b;">No payments</span>`
      }
        </td>
      </tr>
    `).join("");

    const bodyHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #1e293b;">
        <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 700; color: #0f172a;">Internship Management Report</h1>
          <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 600;">
            Report Date: ${reportDate} | ${filterText}
          </p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #0f172a;">
              <th style="border: 1px solid #cbd5e1; padding: 8px; width: 60px;">ID</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px;">Student Details</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; width: 60px;">Hostel</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; width: 90px; text-align: right;">Total Fee</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; width: 90px; text-align: right;">Paid Amount</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; width: 90px; text-align: right;">Outstanding</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; width: 110px;">Dispatch Status</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; width: 90px;">Status</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; width: 140px;">Payment Details</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;

    const css = `
      @media print {
        .no-print { display: none !important; }
        body { margin: 0; padding: 0; background: #fff; }
        @page { size: landscape; margin: 10mm; }
      }
    `;

    const pw = window.open("", "", "width=1100,height=800");
    pw.document.write(`<!DOCTYPE html><html><head>
      <title>Internship Management Report</title>
      <style>${css}</style>
      <style id="orientation-style">@page { size: landscape; }</style>
    </head><body>
      <div class="no-print" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;
        margin-bottom:14px;padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-family:sans-serif;">
        <span style="font-size:12px;font-weight:600;color:#555;margin-right:2px">Orientation:</span>
        <button id="btn-portrait" onclick="setOrientation('portrait')"
          style="padding:5px 14px;font-size:12px;font-weight:700;
                 border:1px solid #cbd5e1;border-radius:5px;
                 background:#fff;color:#64748b;cursor:pointer">
          Portrait
        </button>
        <button id="btn-landscape" onclick="setOrientation('landscape')"
          style="padding:5px 14px;font-size:12px;font-weight:700;
                 border:2px solid #0ea5e9;border-radius:5px;
                 background:#e0f2fe;color:#1e40af;cursor:pointer">
          Landscape
        </button>
        <button onclick="window.print()"
          style="padding:5px 18px;font-size:12px;font-weight:700;border:none;
                 border-radius:5px;background:#0ea5e9;color:#fff;cursor:pointer;margin-left:8px">
          🖨 Print
        </button>
      </div>
      <script>
        function setOrientation(mode) {
          document.getElementById('orientation-style').textContent =
            '@page { size: ' + mode + '; }';
          var isP = mode === 'portrait';
          var pb = document.getElementById('btn-portrait');
          var lb = document.getElementById('btn-landscape');
          pb.style.background  = isP  ? '#e0f2fe' : '#fff';
          pb.style.borderColor = isP  ? '#0ea5e9' : '#cbd5e1';
          pb.style.color       = isP  ? '#1e40af' : '#64748b';
          lb.style.background  = isP  ? '#fff'    : '#e0f2fe';
          lb.style.borderColor = isP  ? '#cbd5e1' : '#0ea5e9';
          lb.style.color       = isP  ? '#64748b' : '#1e40af';
        }
      </script>
      ${bodyHtml}
    </body></html>`);
    pw.document.close();
  };

  const handleExportCSV = () => {
    const headers = ["Intern ID", "Student Name", "Reg Date", "Email", "Mobile", "College", "Department", "Degree", "Duration", "Start Date", "End Date", "Total Fee", "Paid Amount", "Outstanding", "Status", "Payment History"];
    const rows = filteredInterns.map(item => [
      item.intern_id,
      item.student_name,
      formatDateDMY(item.created_date || item.start_date),
      item.email || "",
      item.mobile_number || "",
      item.college,
      item.department || "",
      item.degree || "",
      item.duration,
      formatDateDMY(item.start_date),
      formatDateDMY(item.end_date),
      item.total_fee,
      item.amount_paid,
      item.pending_amount,
      item.payment_status,
      item.payment_details && item.payment_details.length > 0
        ? item.payment_details.map(p => `Date: ${formatDateDMY(p.date)}, Method: ${p.method}, Amount: ₹${p.amount}`).join(" | ")
        : "No payments"
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Internship_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageWrapper>
      <>
        <DashboardHeader>
          <Title>
            <GraduationCap size={28} color={colors.primary} />
            Internship Management Dashboard
          </Title>
          <HeaderActions>
            <ActionBtnIcon title="Print Table" onClick={handlePrint}>
              <Printer size={16} />
            </ActionBtnIcon>
            <ActionBtnIcon title="Export to CSV" onClick={handleExportCSV}>
              <Download size={16} />
            </ActionBtnIcon>
            {canHR && (
              <RegisterBtn onClick={() => navigate("/Internship")}>
                <Plus size={16} /> Register New Intern
              </RegisterBtn>
            )}
          </HeaderActions>
        </DashboardHeader>

        <StatsGrid>
          <StatCard $color={colors.primary}>
            <StatLabel>Total Registrations</StatLabel>
            <StatVal>{totalRegistrations}</StatVal>
          </StatCard>
          <StatCard $color="#2563a8">
            <StatLabel>Total Fee (Expected)</StatLabel>
            <StatVal>₹{totalFeeExpected.toLocaleString('en-IN')}</StatVal>
          </StatCard>
          <StatCard $color={colors.success}>
            <StatLabel>Total Paid</StatLabel>
            <StatVal>₹{totalPaid.toLocaleString('en-IN')}</StatVal>
          </StatCard>
          <StatCard $color={colors.danger}>
            <StatLabel>Total Outstanding</StatLabel>
            <StatVal>₹{totalPending.toLocaleString('en-IN')}</StatVal>
          </StatCard>
          <StatCard
            $color="#0d9488"
            onClick={() => setShowTodayPaidOnly(prev => !prev)}
            style={{
              cursor: "pointer",
              boxShadow: showTodayPaidOnly ? "0 0 0 2px #0d9488, 0 4px 12px rgba(13, 148, 136, 0.25)" : "none",
              border: showTodayPaidOnly ? "2px solid #0d9488" : "1px solid transparent",
              transition: "all 0.2s ease-in-out"
            }}
            title="Click to toggle filter for students who paid in this period"
          >
            <StatLabel style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>{(fromDate || toDate) ? "Collected (Date Range)" : "Collected (Today)"}</span>
              {showTodayPaidOnly && (
                <span style={{ fontSize: "10px", backgroundColor: "#0d9488", color: "#fff", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>
                  Active Filter
                </span>
              )}
            </StatLabel>
            <StatVal>₹{periodCollected.toLocaleString('en-IN')}</StatVal>
          </StatCard>
        </StatsGrid>

        <ControlBar>
          <SearchInputWrapper>
            <Search size={14} style={{ position: "absolute", left: 8, color: colors.textMuted }} />
            <SearchInput
              type="text"
              placeholder="Search by Intern ID, Student Name or College..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchInputWrapper>

          <DateFilterWrapper>
            <DateLabel>From:</DateLabel>
            <DateInput
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <DateLabel>To:</DateLabel>
            <DateInput
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </DateFilterWrapper>

          <SelectFilter value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Payment Statuses</option>
            <option value="Pending">Pending (Unpaid)</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Fully Paid">Fully Paid</option>
          </SelectFilter>

          <SelectFilter value={approvalFilter} onChange={(e) => setApprovalFilter(e.target.value)}>
            <option value="">All Approval/Dispatch</option>
            <option value="Payment Pending">Payment Pending</option>
            <option value="Pending for Certification Generation">Pending for Certification Generation</option>
            <option value="Pending for Approval">Pending for Approval</option>
            <option value="Approved">Approved</option>
            <option value="Email">Email (Sent)</option>
            <option value="Whatsapp">Whatsapp (Sent)</option>
          </SelectFilter>

          <SelectFilter value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value)}>
            <option value="">All Colleges</option>
            {uniqueColleges.map((col, idx) => (
              <option key={idx} value={col}>{col}</option>
            ))}
          </SelectFilter>

          <SelectFilter value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="">All Departments</option>
            {uniqueDepartments.map((dept, idx) => (
              <option key={idx} value={dept}>{dept}</option>
            ))}
          </SelectFilter>

          <SelectFilter value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="">All Courses</option>
            {uniqueCourses.map((crs, idx) => (
              <option key={idx} value={crs}>{crs}</option>
            ))}
          </SelectFilter>
        </ControlBar>

        <TableContainer id="printable-table">
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: colors.textMuted }} className="no-print">Loading Dashboard...</div>
          ) : filteredInterns.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: colors.textMuted }}>No internship records found.</div>
          ) : (
            <TableScrollWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th style={{ width: "80px" }}>ID</Th>
                    <Th>Student Details</Th>
                    <Th style={{ width: "80px" }}>Hostel</Th>
                    <Th style={{ width: "100px" }}>Total Fee</Th>
                    <Th style={{ width: "100px" }}>Paid Amount</Th>
                    <Th style={{ width: "110px" }}>Outstanding</Th>
                    <Th style={{ width: "130px", textAlign: "center" }}>Dispatch Status</Th>
                    <Th style={{ width: "120px", textAlign: "center" }}>Status</Th>
                    <Th style={{ width: "120px", textAlign: "center" }} className="no-print">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                    <tr key={item.intern_id}>
                      <Td style={{ fontWeight: 600 }}>{item.intern_id}</Td>
                      <Td>
                        <div style={{ fontWeight: 700, color: colors.textMain, fontSize: "13px" }}>{item.student_name}</div>
                        <div style={{ fontSize: "11px", fontWeight: "normal", color: colors.textMuted, display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "2px", marginBottom: "4px" }}>
                          {item.mobile_number && <span>📞 {item.mobile_number}</span>}
                          {item.email && <span>✉️ {item.email}</span>}
                        </div>
                        <div style={{ fontSize: "12px", color: colors.textMain, margin: "2px 0" }}>
                          <span style={{ color: colors.textMuted, fontWeight: "600" }}>College:</span> {item.college} {item.degree && `(${item.degree})`}
                        </div>
                        {item.department && (
                          <div style={{ fontSize: "12px", color: colors.textMain, margin: "2px 0" }}>
                            <span style={{ color: colors.textMuted, fontWeight: "600" }}>Dept:</span> {item.department}
                          </div>
                        )}
                        <div style={{ fontSize: "12px", color: colors.textMain, margin: "2px 0" }}>
                          <span style={{ color: colors.textMuted, fontWeight: "600" }}>Duration:</span> {item.duration} <span style={{ color: colors.textMain, fontSize: "11px", fontWeight: "600" }}>({formatDateDMY(item.start_date)} to {formatDateDMY(item.end_date)})</span>
                        </div>
                        {item.created_date && (
                          <div style={{ fontSize: "11px", color: colors.textMuted, marginTop: "2px" }}>
                            <span style={{ fontWeight: "600" }}>Reg Date:</span> {formatDateDMY(item.created_date)}
                          </div>
                        )}
                      </Td>
                      <Td>{item.is_hosteller ? "🏡 Yes" : "No"}</Td>
                      <Td style={{ fontWeight: 600 }}>₹{item.total_fee.toLocaleString('en-IN')}</Td>
                      <Td style={{ color: colors.success, fontWeight: 600 }}>₹{item.amount_paid.toLocaleString('en-IN')}</Td>
                      <Td style={{ color: item.pending_amount > 0 ? colors.danger : colors.textMuted, fontWeight: 600 }}>
                        ₹{item.pending_amount.toLocaleString('en-IN')}
                      </Td>
                      <Td style={{ textAlign: "center", fontSize: "11px", fontWeight: "600", verticalAlign: "middle" }}>
                        {item.approved_by ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "center", justifyContent: "center" }}>
                            <span style={{
                              color: colors.success,
                              background: "#dcfce7",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              display: "inline-block",
                              fontWeight: "bold",
                              fontSize: "10px"
                            }}>
                              Approved
                            </span>
                            <span style={{
                              color: item.email_count > 0 ? colors.success : colors.textMuted,
                              background: item.email_count > 0 ? "#dcfce7" : "#f1f5f9",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              display: "inline-block",
                              whiteSpace: "nowrap"
                            }}>
                              ✉️ Email-{item.email_count || 0}
                            </span>
                            <span style={{
                              color: item.whatsapp_count > 0 ? colors.success : colors.textMuted,
                              background: item.whatsapp_count > 0 ? "#dcfce7" : "#f1f5f9",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              display: "inline-block",
                              whiteSpace: "nowrap"
                            }}>
                              📱 Whatsapp-{item.whatsapp_count || 0}
                            </span>
                          </div>
                        ) : (item.payment_status === "Pending" || item.payment_status === "Partially Paid") ? (
                          <span style={{
                            color: "#dc2626",
                            background: "#fee2e2",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            display: "inline-block",
                            fontWeight: "bold",
                            fontSize: "10px"
                          }}>
                            Payment Pending
                          </span>
                        ) : (item.payment_status === "Fully Paid" && !item.cert_description) ? (
                          <span style={{
                            color: "#2563eb",
                            background: "#dbeafe",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            display: "inline-block",
                            fontWeight: "bold",
                            fontSize: "10px"
                          }}>
                            Pending for Certification Generation
                          </span>
                        ) : (
                          <span style={{
                            color: "#b45309",
                            background: "#fef3c7",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            display: "inline-block",
                            fontWeight: "bold",
                            fontSize: "10px"
                          }}>
                            Pending for Approval
                          </span>
                        )}
                      </Td>
                      <Td style={{ textAlign: "center" }}>
                        <StatusBadge $status={item.payment_status}>{item.payment_status}</StatusBadge>
                      </Td>
                      <Td style={{ textAlign: "center", whiteSpace: "nowrap" }} className="no-print">
                        <ActionBtn title="View Transactions" onClick={() => handleOpenLedger(item)}>
                          <Eye size={16} />
                        </ActionBtn>
                        {canPayment && (
                          <ActionBtn title="Record Payment" $color={colors.success} onClick={() => handleOpenPayment(item)} disabled={item.pending_amount <= 0}>
                            ₹
                          </ActionBtn>
                        )}
                        {canHR && (
                          <ActionBtn title="Edit Profile" $color="#3b82f6" onClick={() => handleOpenEdit(item)}>
                            <Edit size={16} />
                          </ActionBtn>
                        )}
                        {canHR && (
                          <ActionBtn
                            title="Make Certificate"
                            $color="#10b981"
                            onClick={() => handleOpenCertificateModal(item, "make_certificate")}
                            disabled={item.payment_status !== "Fully Paid" || !!item.cert_description}
                          >
                            <Award size={16} />
                          </ActionBtn>
                        )}
                        {canApprove && (
                          <ActionBtn
                            title="Preview Certificate"
                            $color="#06b6d4"
                            onClick={() => handleOpenCertificateModal(item, "preview_certificate")}
                            disabled={!item.cert_description}
                          >
                            <FileCheck size={16} />
                          </ActionBtn>
                        )}

                        {canHR && (
                          <DropdownTriggerWrapper>
                            <ActionBtn
                              title="Print Approved Certificate"
                              $color="#9333ea"
                              disabled={!item.approved_by}
                              onClick={(e) => item.approved_by && toggleMenu("print", item.intern_id, e)}
                            >
                              <Printer size={16} />
                            </ActionBtn>
                          </DropdownTriggerWrapper>
                        )}

                        {canHR && (
                          <DropdownTriggerWrapper>
                            <ActionBtn
                              title="Send Certificate"
                              $color="#0891b2"
                              disabled={!item.approved_by}
                              onClick={(e) => item.approved_by && toggleMenu("send", item.intern_id, e)}
                            >
                              <Send size={16} />
                            </ActionBtn>
                          </DropdownTriggerWrapper>
                        )}

                        {canHR && (
                          <ActionBtn
                            title="Delete Record"
                            $color={colors.danger}
                            onClick={() => handleDelete(item.intern_id, item.student_name)}
                            disabled={item.payment_status !== "Pending"}
                          >
                            <Trash2 size={16} />
                          </ActionBtn>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableScrollWrapper>
          )}

          {/* Pagination Controls */}
          {filteredInterns.length > itemsPerPage && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
              padding: "10px 16px",
              background: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }} className="no-print">
              <div style={{ fontSize: "13px", color: colors.textMuted }}>
                Showing <strong>{Math.min(filteredInterns.length, (currentPage - 1) * itemsPerPage + 1)}</strong> to{" "}
                <strong>{Math.min(filteredInterns.length, currentPage * itemsPerPage)}</strong> of{" "}
                <strong>{filteredInterns.length}</strong> interns
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: currentPage === 1 ? "#f1f5f9" : "#ffffff",
                    color: currentPage === 1 ? "#94a3b8" : colors.textMain,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                    transition: "all 0.15s ease"
                  }}
                >
                  Previous
                </button>
                {Array.from({ length: Math.ceil(filteredInterns.length / itemsPerPage) }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        border: currentPage === pageNum ? "none" : "1px solid #cbd5e1",
                        background: currentPage === pageNum ? colors.primary : "#ffffff",
                        color: currentPage === pageNum ? "#ffffff" : colors.textMain,
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={currentPage === Math.ceil(filteredInterns.length / itemsPerPage)}
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredInterns.length / itemsPerPage), prev + 1))}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: currentPage === Math.ceil(filteredInterns.length / itemsPerPage) ? "#f1f5f9" : "#ffffff",
                    color: currentPage === Math.ceil(filteredInterns.length / itemsPerPage) ? "#94a3b8" : colors.textMain,
                    cursor: currentPage === Math.ceil(filteredInterns.length / itemsPerPage) ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                    transition: "all 0.15s ease"
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </TableContainer>
      </>

      {/* ─── Floating Print/Send dropdown menu, portaled to <body> ───
          Escapes TableScrollWrapper's overflow clipping entirely,
          so it's never hidden and never causes the table to
          "shiver" from an inflated scroll area. ─── */}
      {openMenu && createPortal(
        <FloatingMenu
          ref={menuRef}
          style={{
            top: openMenu.top,
            left: openMenu.left - 175,
          }}
        >
          {openMenu.type === "print" ? (
            <>
              <FloatingMenuItem
                onClick={() => {
                  const item = filteredInterns.find(i => i.intern_id === openMenu.internId);
                  setOpenMenu(null);
                  if (item) handleDirectPrintCertificate(item, true);
                }}
              >
                🖨️ Print with Letterpad
              </FloatingMenuItem>
              <FloatingMenuItem
                onClick={() => {
                  const item = filteredInterns.find(i => i.intern_id === openMenu.internId);
                  setOpenMenu(null);
                  if (item) handleDirectPrintCertificate(item, false);
                }}
              >
                📄 Print without Letterpad
              </FloatingMenuItem>
            </>
          ) : (
            <>
              <FloatingMenuItem
                onClick={() => {
                  const item = filteredInterns.find(i => i.intern_id === openMenu.internId);
                  setOpenMenu(null);
                  if (item) handleEmailCertificate(item);
                }}
              >
                ✉️ Email
              </FloatingMenuItem>
              <FloatingMenuItem
                onClick={() => {
                  const item = filteredInterns.find(i => i.intern_id === openMenu.internId);
                  setOpenMenu(null);
                  if (item) handleWhatsAppCertificate(item);
                }}
              >
                📱 WhatsApp
              </FloatingMenuItem>
            </>
          )}
        </FloatingMenu>,
        document.body
      )}

      {/* ─── MODALS ─── */}

      {/* 1. Add Payment Modal */}
      {modalType === "payment" && selectedIntern && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <h3>Record Partial Payment</h3>
              <CloseBtn onClick={() => setModalType(null)}><X size={18} /></CloseBtn>
            </ModalHeader>
            <div style={{ marginBottom: "14px", fontSize: "13px", color: colors.textMuted }}>
              Recording payment for <strong>{selectedIntern.student_name}</strong>
              <br />
              Remaining Outstanding Balance: <strong>₹{selectedIntern.pending_amount}</strong>
            </div>
            <ModalForm onSubmit={handlePaymentSubmit}>
              <FormGroup>
                <ModalLabel>Payment Amount (₹) *</ModalLabel>
                <ModalFieldINR>
                  <span>₹</span>
                  <ModalInput
                    type="number"
                    max={selectedIntern.pending_amount}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    required
                  />
                </ModalFieldINR>
              </FormGroup>
              <FormGroup>
                <ModalLabel>Payment Method</ModalLabel>
                <ModalSelect value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI</option>
                  <option value="NEFT">NEFT</option>
                </ModalSelect>
              </FormGroup>
              <FormGroup>
                <ModalLabel>Payment Date</ModalLabel>
                <ModalInput
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  required
                />
              </FormGroup>
              <ModalButton type="submit">Submit Receipt</ModalButton>
            </ModalForm>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 2. Ledger View Modal */}
      {modalType === "ledger" && selectedIntern && (
        <ModalOverlay>
          <ModalContent $wide>
            <ModalHeader>
              <h3>Intern Payment Ledger</h3>
              <CloseBtn onClick={() => setModalType(null)}><X size={18} /></CloseBtn>
            </ModalHeader>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px", marginBottom: "16px" }}>
              <div>Student Name: <strong>{selectedIntern.student_name}</strong></div>
              <div>Email: <strong>{selectedIntern.email || "N/A"}</strong></div>
              <div>Mobile: <strong>{selectedIntern.mobile_number || "N/A"}</strong></div>
              <div>College: <strong>{selectedIntern.college}</strong></div>
              <div>Total Fees: <strong>₹{selectedIntern.total_fee}</strong></div>
              <div>Outstanding: <strong style={{ color: colors.danger }}>₹{selectedIntern.pending_amount}</strong></div>
            </div>
            <h4>Transaction History</h4>
            {selectedIntern.payment_details?.length === 0 ? (
              <p style={{ padding: "10px 0", color: colors.textMuted }}>No transactions logged yet.</p>
            ) : (
              <LedgerTable>
                <thead>
                  <tr>
                    <LedgerTh>Receipt Date</LedgerTh>
                    <LedgerTh>Payment Method</LedgerTh>
                    <LedgerTh>Amount Paid</LedgerTh>
                  </tr>
                </thead>
                <tbody>
                  {selectedIntern.payment_details.map((p, idx) => (
                    <tr key={idx}>
                      <LedgerTd>{formatDateDMY(p.date)}</LedgerTd>
                      <LedgerTd><CreditCard size={12} style={{ marginRight: 4 }} /> {p.method}</LedgerTd>
                      <LedgerTd style={{ fontWeight: 600, color: colors.success }}>₹{p.amount.toLocaleString('en-IN')}</LedgerTd>
                    </tr>
                  ))}
                </tbody>
              </LedgerTable>
            )}
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 3. Edit Profile Modal */}
      {modalType === "edit" && selectedIntern && (
        <ModalOverlay>
          <ModalContent $wide>
            <ModalHeader>
              <h3>Edit Intern Details</h3>
              <CloseBtn onClick={() => setModalType(null)}><X size={18} /></CloseBtn>
            </ModalHeader>
            <ModalForm onSubmit={handleEditSubmit}>
              <Grid>
                <FormGroup>
                  <ModalLabel>Student Name *</ModalLabel>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <select
                      value={editSalutation}
                      onChange={(e) => setEditSalutation(e.target.value)}
                      required
                      style={{
                        width: "80px",
                        padding: "8px 4px",
                        border: `1px solid ${colors.border}`,
                        borderRight: "none",
                        borderRadius: "6px 0 0 6px",
                        fontSize: "13px",
                        fontWeight: "600",
                        backgroundColor: "#f8fafc",
                        cursor: "pointer"
                      }}
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                    </select>
                    <ModalInput
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ borderRadius: "0 6px 6px 0", flex: 1 }}
                      required
                    />
                  </div>
                </FormGroup>
                <FormGroup>
                  <ModalLabel>Email Address</ModalLabel>
                  <ModalInput type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <ModalLabel>Mobile Number</ModalLabel>
                  <ModalInput type="tel" value={editMobile} onChange={(e) => setEditMobile(e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <ModalLabel>College</ModalLabel>
                  <ModalInput type="text" value={editCollege} onChange={(e) => setEditCollege(e.target.value)} required />
                </FormGroup>
                <FormGroup>
                  <ModalLabel>Department</ModalLabel>
                  <ModalInput type="text" value={editDept} onChange={(e) => setEditDept(e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <ModalLabel>Degree</ModalLabel>
                  <ModalInput type="text" value={editDegree} onChange={(e) => setEditDegree(e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <ModalLabel>Start Date</ModalLabel>
                  <ModalInput type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} required />
                </FormGroup>
                <FormGroup>
                  <ModalLabel>End Date</ModalLabel>
                  <ModalInput type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} required />
                </FormGroup>
                <FormGroup>
                  <ModalLabel>Duration</ModalLabel>
                  <ModalInput type="text" value={editDuration} disabled />
                </FormGroup>
                <FormGroup>
                  <ModalLabel>Hostel Status</ModalLabel>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", height: "38px" }}>
                    <input
                      type="checkbox"
                      id="editIsHosteller"
                      checked={editIsHosteller}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditIsHosteller(checked);
                        if (checked && (!editHostelFeePerMonth || parseFloat(editHostelFeePerMonth) === 0)) {
                          setEditHostelFeePerMonth("3000");
                        }
                      }}
                    />
                    <label htmlFor="editIsHosteller">Hostel Resident</label>
                  </div>
                </FormGroup>
                <FormGroup>
                  <ModalLabel>Fee Per Month</ModalLabel>
                  <ModalFieldINR>
                    <span>₹</span>
                    <ModalInput type="number" value={editFeePerMonth} onChange={(e) => setEditFeePerMonth(e.target.value)} />
                  </ModalFieldINR>
                </FormGroup>
                <FormGroup>
                  <ModalLabel>Hostel Fee Per Month</ModalLabel>
                  <ModalFieldINR>
                    <span>₹</span>
                    <ModalInput
                      type="number"
                      value={editIsHosteller ? editHostelFeePerMonth : 0}
                      disabled={!editIsHosteller}
                      onChange={(e) => setEditHostelFeePerMonth(e.target.value)}
                    />
                  </ModalFieldINR>
                </FormGroup>
                <FormGroup>
                  <ModalLabel>Discount Amount</ModalLabel>
                  <ModalFieldINR>
                    <span>₹</span>
                    <ModalInput
                      type="number"
                      value={editDiscountAmount}
                      onChange={(e) => setEditDiscountAmount(e.target.value)}
                    />
                  </ModalFieldINR>
                </FormGroup>
                <FormGroup>
                  <ModalLabel>Discount Remarks</ModalLabel>
                  <ModalInput
                    type="text"
                    value={editDiscountRemarks}
                    placeholder="Enter reason for discount"
                    onChange={(e) => setEditDiscountRemarks(e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <ModalLabel>Total Fee</ModalLabel>
                  <ModalFieldINR>
                    <span>₹</span>
                    <ModalInput type="number" value={editTotalFee} onChange={(e) => setEditTotalFee(e.target.value)} />
                  </ModalFieldINR>
                </FormGroup>
              </Grid>
              <ModalButton type="submit">Save Changes</ModalButton>
            </ModalForm>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 4. Certificate Make/Preview Modal */}
      {(modalType === "make_certificate" || modalType === "preview_certificate") && selectedIntern && (
        <ModalOverlay>
          <ModalContent $wide style={{ maxWidth: "800px" }}>
            <ModalHeader>
              <h2 style={{ margin: 0, fontSize: "18px", color: colors.textMain }}>
                {modalType === "make_certificate" ? "Make & Approve Internship Certificate" : "Preview Approved Certificate"}
              </h2>
              <CloseBtn onClick={() => setModalType(null)}>&times;</CloseBtn>
            </ModalHeader>
            <ModalForm onSubmit={modalType === "make_certificate" ? handleSaveCertificateOnly : (e) => { e.preventDefault(); }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>

                {/* Left Column: Form Settings */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <ModalLabel>Intern Details</ModalLabel>
                    <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                      <div><strong>Name:</strong> {selectedIntern.student_name}</div>
                      <div><strong>College:</strong> {selectedIntern.college}</div>
                      <div><strong>Course/Degree:</strong> {selectedIntern.degree}</div>
                      <div><strong>Department:</strong> {selectedIntern.department}</div>
                      <div><strong>Duration:</strong> {selectedIntern.duration}</div>
                      <div><strong>Start Date:</strong> {formatDateDMY(selectedIntern.start_date)}</div>
                      <div><strong>End Date:</strong> {formatDateDMY(selectedIntern.end_date)}</div>
                    </div>
                  </div>

                  {modalType === "preview_certificate" && selectedIntern.approved_by && (
                    <FormGroup>
                      <ModalLabel>Approved By:</ModalLabel>
                      <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "13px", fontWeight: "bold" }}>
                        {(Array.isArray(approvers) ? approvers : []).find(a => a.employeeId === selectedIntern.approved_by)?.employeeName || selectedIntern.approved_by}
                      </div>
                    </FormGroup>
                  )}

                  <FormGroup>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <ModalLabel>Certificate Description Template:</ModalLabel>
                      {modalType === "make_certificate" && (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button type="button" onClick={handleLoadDefaultTemplate} style={{ fontSize: "11px", color: colors.primary, background: "none", border: "none", cursor: "pointer", fontWeight: "600", padding: 0 }}>
                            Load Default Template
                          </button>
                          <span style={{ color: "#cbd5e1", fontSize: "11px" }}>|</span>
                          <button type="button" onClick={handleSaveDefaultTemplate} style={{ fontSize: "11px", color: colors.primary, background: "none", border: "none", cursor: "pointer", fontWeight: "600", padding: 0 }}>
                            Save as Default Template
                          </button>
                        </div>
                      )}
                    </div>
                    <ModalTextarea
                      rows={8}
                      value={certDescription}
                      onChange={(e) => setCertDescription(e.target.value)}
                      onKeyDown={handleTextareaKeyDown}
                      placeholder="Enter certificate body text..."
                      required
                      disabled={modalType === "preview_certificate"}
                    />
                    {modalType === "make_certificate" && (
                      <div style={{ fontSize: "10px", color: colors.textMuted, marginTop: "2px" }}>
                        Use placeholders: <strong>[Student Name]</strong>, <strong>[College]</strong>, <strong>[Degree]</strong>, <strong>[Department]</strong>, <strong>[Duration]</strong>, <strong>[Start Date]</strong>, <strong>[End Date]</strong>.
                      </div>
                    )}
                  </FormGroup>
                </div>

                {/* Right Column: Live Processed Preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <ModalLabel>Certificate Content Preview:</ModalLabel>
                  <div style={{
                    flex: 1,
                    background: "#fff",
                    border: "2px dashed #cbd5e1",
                    borderRadius: "8px",
                    padding: "20px",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    fontFamily: "Times New Roman, serif",
                    overflowY: "auto",
                    maxHeight: "360px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}>
                    <div>
                      <div style={{ borderBottom: "1px solid #1e3a8a", paddingBottom: "6px", marginBottom: "14px", textAlign: "center", color: "#1e3a8a", fontWeight: "bold", fontSize: "14px" }}>
                        SHANMUGA HOSPITAL
                      </div>
                      <div style={{ textAlign: "right", fontSize: "11px", marginBottom: "14px" }}>
                        <strong>Date:</strong> {new Date(selectedIntern.approved_at || new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </div>
                      <div style={{ textAlign: "center", textDecoration: "underline", fontWeight: "bold", color: "#1e3a8a", marginBottom: "14px", fontSize: "13px" }}>
                        INTERNSHIP CERTIFICATE
                      </div>
                      <div
                        style={{ textAlign: "justify", textIndent: "30px", whiteSpace: "pre-wrap" }}
                        dangerouslySetInnerHTML={{
                          __html: (certDescription || "")
                            .replace(/\[Student Name\]/g, `<strong>${selectedIntern.student_name}</strong>`)
                            .replace(/\[College\]/g, `<strong>${selectedIntern.college}</strong>`)
                            .replace(/\[Degree\]/g, `<strong>${selectedIntern.degree}</strong>`)
                            .replace(/\[Department\]/g, selectedIntern.department ? `<strong>${selectedIntern.department}</strong>` : "")
                            .replace(/\[Duration\]/g, `<strong>${selectedIntern.duration}</strong>`)
                            .replace(/\[Start Date\]/g, `<strong>${formatDateDMY(selectedIntern.start_date)}</strong>`)
                            .replace(/\[End Date\]/g, `<strong>${formatDateDMY(selectedIntern.end_date)}</strong>`)
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px" }}>
                      {(() => {
                        const approverInfo = (Array.isArray(approvers) ? approvers : []).find(a => a.employeeId === selectedIntern.approved_by);
                        return (
                          <div style={{ textAlign: "center", width: "160px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            {approverInfo?.signatureBase64 && (
                              <img
                                src={`data:image/png;base64,${approverInfo.signatureBase64}`}
                                alt="Signature"
                                style={{ height: "45px", marginBottom: "4px", objectFit: "contain" }}
                              />
                            )}
                            <div style={{ borderTop: "1px solid #cbd5e1", width: "100%", paddingTop: "4px", fontSize: "11px", fontWeight: "bold" }}>
                              {approverInfo?.employeeName || selectedIntern.approved_by || "Authorized Signatory"}
                            </div>
                            <div style={{ fontSize: "9px", color: colors.textMuted }}>
                              {approverInfo?.designation || "Signatory Designation"}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "flex-end" }}>
                {modalType === "make_certificate" ? (
                  <>
                    <ModalButton type="button" style={{ background: "#94a3b8", width: "auto", padding: "10px 24px" }} onClick={() => setModalType(null)}>
                      Cancel
                    </ModalButton>
                    <ModalButton type="submit" style={{ background: "#3b82f6", width: "auto", padding: "10px 24px" }}>
                      💾 Save Certificate
                    </ModalButton>
                  </>
                ) : (
                  <>
                    {!selectedIntern.approved_by ? (
                      <>
                        <ModalButton type="button" style={{ background: "#94a3b8", width: "auto", padding: "10px 24px" }} onClick={() => setModalType(null)}>
                          Close
                        </ModalButton>
                        {canHR && (
                          <ModalButton type="button" style={{ background: "#3b82f6", width: "auto", padding: "10px 24px" }} onClick={() => setModalType("make_certificate")}>
                            ✏️ Edit Description
                          </ModalButton>
                        )}
                        {canApprove && (
                          <ModalButton type="button" style={{ background: "#10b981", width: "auto", padding: "10px 24px" }} onClick={handleApproveCertificateConfirm}>
                            ✍️ Approve Certificate
                          </ModalButton>
                        )}
                      </>
                    ) : (
                      <ModalButton type="button" style={{ background: "#94a3b8", width: "auto", padding: "10px 24px" }} onClick={() => setModalType(null)}>
                        Close
                      </ModalButton>
                    )}
                  </>
                )}
              </div>
            </ModalForm>
          </ModalContent>
        </ModalOverlay>
      )}

      {showTemplatePicker && (
        <ModalOverlay style={{ zIndex: 1020 }}>
          <ModalContent style={{ maxWidth: "800px", width: "90%", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: colors.primary, fontWeight: 700 }}>Select Certificate Template</h3>
              <button
                type="button"
                onClick={() => setShowTemplatePicker(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px" }}>
              {availableTemplates.map((tpl) => (
                <div
                  key={tpl.template_id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "16px",
                    background: "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    position: "relative"
                  }}
                  onClick={() => {
                    setCertDescription(tpl.description);
                    setShowTemplatePicker(false);
                    Swal.fire("Loaded", `Loaded template: "${tpl.title}"`, "success");
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#3b82f6";
                    e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(59, 130, 246, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <h4 style={{ margin: 0, color: colors.textMain, fontWeight: "600", fontSize: "14px" }}>
                        {tpl.title}
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteTemplate(tpl.template_id, e)}
                        style={{
                          background: "#fee2e2",
                          border: "none",
                          cursor: "pointer",
                          color: colors.danger,
                          padding: "2px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "20px",
                          height: "20px",
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => { e.stopPropagation(); e.currentTarget.style.background = "#fca5a5"; }}
                        onMouseLeave={(e) => { e.stopPropagation(); e.currentTarget.style.background = "#fee2e2"; }}
                        title="Delete Template"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p style={{
                      fontSize: "12px",
                      color: colors.textMuted,
                      lineHeight: "1.5",
                      margin: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {tpl.description}
                    </p>
                  </div>
                  <div style={{
                    marginTop: "12px",
                    fontSize: "11px",
                    color: "#3b82f6",
                    fontWeight: "600",
                    textAlign: "right"
                  }}>
                    Select Template &rarr;
                  </div>
                </div>
              ))}
              {availableTemplates.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "20px", color: colors.textMuted }}>
                  No templates available.
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <ModalButton
                type="button"
                style={{ background: "#94a3b8", width: "auto", padding: "8px 20px" }}
                onClick={() => setShowTemplatePicker(false)}
              >
                Close
              </ModalButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}