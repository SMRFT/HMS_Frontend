import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DatePicker, Button, Tooltip, Spin, Select } from "antd";
import dayjs from "dayjs";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { fetchMyReportPermissions } from "../../Auth/reportConfigApi";
import { toast } from "react-toastify";
import {
    Users,
    FileText,
    IndianRupee,
    Download,
    Printer,
    ChevronRight,
    ChevronLeft,
    Search,
    Baby,
    LogOut,
    UserPlus,
    UserCheck,
    BedDouble,
    History,
    ShieldCheck,
    RefreshCw,
    ExternalLink,
    Activity,
    ArrowRight
} from "lucide-react";
import {
    colors,
    PageWrapper,
    fadeIn,
    Table,
    Th,
    Td,
    Tr,
    TableWrapper
} from "../GlobalStyles";
import * as XLSX from "xlsx";

const { RangePicker } = DatePicker;

// ─── STYLED COMPONENTS ────────────────────────────────────────────────────────

const Container = styled(PageWrapper)`
  min-height: 100vh;
  padding: 24px;
  background: #f8fafc;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  animation: ${fadeIn} 0.4s ease-out;

  .title-area {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, ${colors.primary} 0%, #0f766e 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
    }

    h1 {
      font-size: 1.55rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }
    p {
      color: #64748b;
      margin: 2px 0 0 0;
      font-size: 0.85rem;
      font-weight: 500;
    }
  }

  .controls-area {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }
`;

const PresetButtonGroup = styled.div`
  display: inline-flex;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const PresetBtn = styled.button`
  border: none;
  background: ${props => (props.active ? colors.primary : "transparent")};
  color: ${props => (props.active ? "#ffffff" : "#475569")};
  font-size: 0.78rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => (props.active ? "#ffffff" : colors.primary)};
    background: ${props => (props.active ? colors.primary : "#f1f5f9")};
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ReportCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  border: 2px solid ${props => (props.active ? props.accentColor || colors.primary : "#e2e8f0")};
  box-shadow: ${props =>
    props.active
      ? `0 8px 18px -4px ${props.accentColor ? `${props.accentColor}33` : "rgba(13, 148, 136, 0.2)"}`
      : "0 2px 6px rgba(0, 0, 0, 0.02)"};
  cursor: pointer;
  position: relative;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: ${props => props.accentColor || colors.primary};
    border-radius: 12px 12px 0 0;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -3px rgba(0, 0, 0, 0.08);
    border-color: ${props => props.accentColor || colors.primary};

    .arrow-icon {
      transform: translateX(3px);
      opacity: 1;
    }
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => (props.active ? props.accentColor : `${props.accentColor || colors.primary}15`)};
    color: ${props => (props.active ? "#ffffff" : props.accentColor || colors.primary)};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .badge-tag {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    background: ${props => (props.active ? props.accentColor : "#f1f5f9")};
    color: ${props => (props.active ? "#ffffff" : "#475569")};
  }

  .content {
    h3 {
      font-size: 0.92rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      line-height: 1.3;
    }
    p {
      font-size: 0.76rem;
      color: #64748b;
      margin: 4px 0 0;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px dashed #f1f5f9;

    .status-text {
      font-size: 0.74rem;
      font-weight: 700;
      color: ${props => (props.active ? props.accentColor : "#64748b")};
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .arrow-icon {
      color: ${props => props.accentColor || colors.primary};
      opacity: 0.6;
      transition: all 0.2s ease;
    }
  }
`;

const WorkspaceCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ActionToolbar = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  background: #ffffff;

  .left-tools {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    flex: 1;
    min-width: 280px;
  }

  .right-tools {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const SearchInputBox = styled.div`
  position: relative;
  width: 280px;
  max-width: 100%;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }

  input {
    width: 100%;
    height: 38px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 0 14px 0 38px;
    font-size: 0.84rem;
    font-weight: 500;
    color: #1e293b;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      background: #ffffff;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
    }
  }
`;

const StyledTable = styled(Table)`
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;

  thead th {
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
    white-space: nowrap;
  }

  tbody td {
    padding: 12px 16px;
    color: #1e293b;
    font-size: 0.84rem;
    font-weight: 500;
    border-bottom: 1px solid #f1f5f9;
  }

  tbody tr {
    transition: background-color 0.15s ease;
    &:hover td {
      background-color: #f8fafc;
    }
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  background: ${props => props.bg || "#f1f5f9"};
  color: ${props => props.color || "#475569"};
  font-family: ${props => (props.mono ? "monospace" : "inherit")};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 70px 24px;
  color: #94a3b8;
  text-align: center;

  svg {
    margin-bottom: 14px;
    opacity: 0.4;
  }
  .title {
    font-weight: 700;
    color: #475569;
    font-size: 1.05rem;
    margin-bottom: 4px;
  }
  .sub {
    font-size: 0.84rem;
    max-width: 400px;
  }
`;

const PaginationFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 12px;

  .info {
    font-size: 0.82rem;
    color: #64748b;
    font-weight: 600;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const PageBtn = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid ${props => (props.active ? colors.primary : "#e2e8f0")};
  background: ${props => (props.active ? colors.primary : "#ffffff")};
  color: ${props => (props.active ? "#ffffff" : "#475569")};
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${colors.primary};
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// ─── MAIN FRONT OFFICE REPORTS COMPONENT ──────────────────────────────────────

const FrontOfficeReports = () => {
    const navigate = useNavigate();
    const HMS_BASE_URL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    // Filter States
    const [datePreset, setDatePreset] = useState("thisMonth");
    const [dateRange, setDateRange] = useState([dayjs().startOf("month"), dayjs()]);
    const [activeTab, setActiveTab] = useState("op_patients");
    const [visitTypeFilter, setVisitTypeFilter] = useState("all"); // 'all', 'new', 'renew'
    const [selectedDoctor, setSelectedDoctor] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Data States
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryData, setSummaryData] = useState({
        total_op: 0,
        total_new_op: 0,
        total_renew_op: 0,
        total_referred: 0,
        total_newborns: 0,
        total_admissions: 0,
        total_discharges: 0,
        total_ip_collection: 0
    });
    const [doctors, setDoctors] = useState([]);

    // Permission States
    const [userReportPerms, setUserReportPerms] = useState({});
    const [hasCustomConfig, setHasCustomConfig] = useState(false);

    // Load User Permissions
    useEffect(() => {
        const loadUserPermissions = async () => {
            const empId =
                localStorage.getItem("employeeId") ||
                localStorage.getItem("user_id") ||
                localStorage.getItem("auth-user-id");
            if (!empId) return;
            try {
                const res = await fetchMyReportPermissions(empId);
                if (res && res.success) {
                    setUserReportPerms(res.report_permissions || {});
                    setHasCustomConfig(Boolean(res.has_custom_config));
                }
            } catch (err) {
                console.error("Error loading user report permissions:", err);
            }
        };
        loadUserPermissions();
    }, []);

    // Fetch Doctor List
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await apiRequest(`${HMS_BASE_URL}doctor_list_diagnostics/`, "GET");
                if (response.success && Array.isArray(response.data)) {
                    setDoctors(response.data);
                }
            } catch (error) {
                console.error("Error fetching doctors:", error);
            }
        };
        fetchDoctors();
    }, [HMS_BASE_URL]);

    // Handle Quick Date Presets
    const handlePresetChange = (preset) => {
        setDatePreset(preset);
        let start = dayjs();
        let end = dayjs();
        if (preset === "today") {
            start = dayjs().startOf("day");
            end = dayjs().endOf("day");
        } else if (preset === "yesterday") {
            start = dayjs().subtract(1, "day").startOf("day");
            end = dayjs().subtract(1, "day").endOf("day");
        } else if (preset === "last7Days") {
            start = dayjs().subtract(6, "days").startOf("day");
            end = dayjs().endOf("day");
        } else if (preset === "thisMonth") {
            start = dayjs().startOf("month");
            end = dayjs().endOf("day");
        }
        setDateRange([start, end]);
    };

    // Fetch Summary KPI Metrics
    const fetchSummaryKPIs = useCallback(async () => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) return;
        setSummaryLoading(true);
        try {
            const params = {
                report_type: "summary",
                start_date: dateRange[0].format("YYYY-MM-DD"),
                end_date: dateRange[1].format("YYYY-MM-DD")
            };
            const qs = new URLSearchParams(params).toString();
            const res = await apiRequest(`${HMS_BASE_URL}front-office-reports/?${qs}`, "GET");
            if (res.success && res.data) {
                const sData = res.data.data || res.data;
                if (sData && typeof sData === "object") {
                    setSummaryData(prev => ({
                        ...prev,
                        ...sData
                    }));
                }
            }
        } catch (err) {
            console.error("Error fetching summary KPIs:", err);
        } finally {
            setSummaryLoading(false);
        }
    }, [HMS_BASE_URL, dateRange]);

    // Fetch Active Report Records
    const fetchActiveReport = useCallback(async () => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) return;
        setLoading(true);
        try {
            const params = {
                report_type: activeTab,
                start_date: dateRange[0].format("YYYY-MM-DD"),
                end_date: dateRange[1].format("YYYY-MM-DD"),
                doctor_name: selectedDoctor,
                visit_type: visitTypeFilter
            };
            const qs = new URLSearchParams(params).toString();
            const res = await apiRequest(`${HMS_BASE_URL}front-office-reports/?${qs}`, "GET");
            if (res.success && Array.isArray(res.data)) {
                setReportData(res.data);
            } else {
                setReportData([]);
                if (res.error) toast.error(res.error);
            }
        } catch (err) {
            console.error("Error fetching active report:", err);
            toast.error("Failed to fetch report data");
            setReportData([]);
        } finally {
            setLoading(false);
        }
    }, [HMS_BASE_URL, activeTab, dateRange, selectedDoctor, visitTypeFilter]);

    // Refresh data on dependency changes
    useEffect(() => {
        fetchSummaryKPIs();
    }, [fetchSummaryKPIs]);

    useEffect(() => {
        fetchActiveReport();
        setCurrentPage(1);
    }, [fetchActiveReport]);

    // Check Permissions
    const allowedActions = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("allowedActions") || "[]");
        } catch {
            return [];
        }
    }, []);

    const canExport = useMemo(() => {
        return (
            !allowedActions.length ||
            allowedActions.includes("HMS-R-SA") ||
            allowedActions.includes("SUPERADMIN") ||
            allowedActions.some(
                a =>
                    a.startsWith("HMS-P-FOR-RW") ||
                    a.startsWith("EXPORT-FOR") ||
                    a.startsWith("HMS-P-AIN-RW") ||
                    a === "HMS-ADMIN"
            )
        );
    }, [allowedActions]);

    // Report Cards configurations (7 tabular reports + 3 external module reports)
    const reportCards = useMemo(() => [
        {
            id: "op_patients",
            title: "OP Patient Register",
            description: "Outpatient registrations, doctors, visit classification & fee collection",
            icon: <Users size={18} />,
            accentColor: colors.primary,
            kpiKey: "total_op",
            permission: "HMS-RPT-OP-PATIENTS",
            hasDoctorFilter: true,
            hasVisitTypeFilter: true
        },
        {
            id: "referred_patients",
            title: "Referred Patients",
            description: "Patients referred by outside doctors, clinics, and partner hospitals",
            icon: <UserPlus size={18} />,
            accentColor: "#2563eb",
            kpiKey: "total_referred",
            permission: "HMS-RPT-REFERRED-PATIENTS",
            hasDoctorFilter: true,
            hasVisitTypeFilter: true
        },
        {
            id: "admission_register",
            title: "Admission Register",
            description: "Detailed inpatient admissions log with room, bed, and admitting consultant",
            icon: <FileText size={18} />,
            accentColor: "#7c3aed",
            kpiKey: "total_admissions",
            permission: "HMS-RPT-ADMISSION-REGISTER",
            hasDoctorFilter: true
        },
        {
            id: "doctor_wise_admission",
            title: "Doctor Admissions",
            description: "IP admissions grouped and filtered by primary consulting doctor",
            icon: <UserCheck size={18} />,
            accentColor: "#0284c7",
            kpiKey: "total_admissions",
            permission: "HMS-RPT-DOCTOR-WISE-ADMISSION",
            hasDoctorFilter: true
        },
        {
            id: "discharge_register",
            title: "Discharge Register",
            description: "Discharged IP patients with mobile number, bill number, doctor & amount",
            icon: <LogOut size={18} />,
            accentColor: "#e11d48",
            kpiKey: "total_discharges",
            permission: "HMS-RPT-DISCHARGE-REGISTER",
            hasDoctorFilter: true
        },
        {
            id: "doctor_wise_ip_collection",
            title: "Doctor IP Collection",
            description: "Total inpatient billing revenue grouped by treating doctors",
            icon: <IndianRupee size={18} />,
            accentColor: "#059669",
            kpiKey: "total_ip_collection",
            permission: "HMS-RPT-DOCTOR-WISE-IP-COLLECTION",
            hasDoctorFilter: true
        },
        {
            id: "new_born_babies",
            title: "New Born Babies",
            description: "Hospital birth registry with baby UHID, mother UHID, weight & pediatrician",
            icon: <Baby size={18} />,
            accentColor: "#db2777",
            kpiKey: "total_newborns",
            permission: "HMS-RPT-NEWBORN-BABIES",
            hasDoctorFilter: false
        },
        {
            id: "room_occupancy",
            title: "Live Room Occupancy",
            description: "Real-time bed and room occupancy status across all hospital wards",
            icon: <BedDouble size={18} />,
            accentColor: "#d97706",
            isExternal: true,
            path: "/RoomOccupencyReport",
            permission: "HMS-RPT-ROOM-OCCUPANCY"
        },
        {
            id: "pre_day_room_occupancy",
            title: "Previous Day Occupancy",
            description: "Historical snapshot of ward, room, and bed occupancy of previous days",
            icon: <History size={18} />,
            accentColor: "#6366f1",
            isExternal: true,
            path: "/PreDayRoomOccupancyReport",
            permission: "HMS-RPT-PRE-DAY-ROOM-OCCUPANCY"
        },
        {
            id: "insurance_credit_report",
            title: "Insurance & Credit",
            description: "Corporate credit, TPA claims, and insurance billing reconciliation",
            icon: <ShieldCheck size={18} />,
            accentColor: "#0891b2",
            isExternal: true,
            path: "/InsuranceCreditReport",
            permission: "HMS-RPT-INSURANCE-CREDIT"
        }
    ], []);

    // Filter visible cards based on permissions
    const visibleReportCards = useMemo(() => {
        return reportCards.filter(card => {
            if (hasCustomConfig && userReportPerms && typeof userReportPerms === "object") {
                const isAllowed = Boolean(
                    userReportPerms[card.id] ||
                    userReportPerms[card.title] ||
                    userReportPerms[card.permission] ||
                    userReportPerms[card.path] ||
                    userReportPerms[`/${card.id}`]
                );
                if (!isAllowed) return false;
            }
            return true;
        });
    }, [hasCustomConfig, userReportPerms, reportCards]);

    const activeTabObj = useMemo(() => {
        return reportCards.find(t => t.id === activeTab) || reportCards[0];
    }, [activeTab, reportCards]);

    // Filtered and Paginated Table Data
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return reportData;
        const q = searchTerm.toLowerCase();
        return reportData.filter(item =>
            Object.values(item).some(val => val && val.toString().toLowerCase().includes(q))
        );
    }, [reportData, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

    // Excel Export
    const handleExportExcel = () => {
        if (filteredData.length === 0) {
            toast.warning("No records to export");
            return;
        }

        let exportRows = [];
        if (activeTab === "op_patients") {
            exportRows = filteredData.map(r => ({
                "UHID": r.uhid || "",
                "Visit Type": r.reg_type || (r.is_new ? "NEW" : "RENEW"),
                "Bill No": r.bill_number || "-",
                "Patient Name": r.patient_name || `${r.firstName || ""} ${r.lastName || ""}`.trim() || "N/A",
                "Age / Gender": `${r.age || "-"}/${r.gender || "-"}`,
                "Mobile Phone": r.mobilePhone || "-",
                "Visit Date & Time": r.created_date ? dayjs(r.created_date).format("DD-MM-YYYY HH:mm") : "-",
                "Registration Fee (₹)": Number(r.registration_fee || 0).toFixed(2),
                "Consulting Fee (₹)": Number(r.consulting_fee || 0).toFixed(2),
                "Total Fee (₹)": Number(r.total_fees || 0).toFixed(2),
                "Consulting Doctor": r.doctorName || "N/A",
                "Referred By": r.referredBy || "Direct"
            }));
        } else if (activeTab === "referred_patients") {
            exportRows = filteredData.map(r => ({
                "UHID": r.uhid || "",
                "Patient Type": r.reg_type || (r.is_new ? "NEW" : "RENEW"),
                "Patient Name": r.patient_name || `${r.firstName || ""} ${r.lastName || ""}`.trim() || "N/A",
                "Age / Gender": `${r.age || "-"}/${r.gender || "-"}`,
                "Mobile Phone": r.mobilePhone || "-",
                "Registration Date": r.created_date ? dayjs(r.created_date).format("DD-MM-YYYY") : r.registration_date || "-",
                "Referred By": r.referredBy || "Direct",
                "Consulting Doctor": r.doctorName || "N/A"
            }));
        } else if (activeTab === "admission_register" || activeTab === "doctor_wise_admission") {
            exportRows = filteredData.map(r => ({
                "IP No": r.ipNumber || "",
                "UHID": r.uhid || "",
                "Patient Name": r.patient_name || `${r.firstName || ""} ${r.lastName || ""}`.trim() || "N/A",
                "Admission Date": r.admissionDateTime ? dayjs(r.admissionDateTime).format("DD-MM-YYYY HH:mm") : "-",
                "Admitting Doctor": r.admittingDoctor || "N/A",
                "Room / Bed": `${r.roomNo || "-"} / ${r.bedNo || "-"}`,
                "Reason for Admission": r.reasonForAdmission || "-"
            }));
        } else if (activeTab === "discharge_register") {
            exportRows = filteredData.map(r => ({
                "IP No": r.ipNo || "",
                "UHID": r.uhid || "",
                "Patient Name": r.patient_name || "N/A",
                "Age / Gender": `${r.age || "-"}/${r.gender || "-"}`,
                "Mobile": r.mobile || "-",
                "Admission Date": r.admission_date ? dayjs(r.admission_date).format("DD-MM-YYYY") : "-",
                "Discharge Date": r.dod ? dayjs(r.dod).format("DD-MM-YYYY HH:mm") : "-",
                "Doctor": r.admitting_doctor || "N/A",
                "Bill No": r.bill_no || "-",
                "Net Amount (Rs.)": Number(r.net_amount || 0).toFixed(2)
            }));
        } else if (activeTab === "doctor_wise_ip_collection") {
            exportRows = filteredData.map(r => ({
                "Doctor Name": r.doctor_name || "",
                "Patient Count": r.patient_count || 0,
                "Bill Count": r.bill_count || 0,
                "Total IP Collection (Rs.)": Number(r.total_collection || 0).toFixed(2)
            }));
        } else if (activeTab === "new_born_babies") {
            exportRows = filteredData.map(r => ({
                "Baby UHID": r.uhid || "",
                "Baby Name": `${r.firstName || ""} ${r.lastName || ""}`.trim() || `Baby of ${r.mothers_uhid_no || "Mother"}`,
                "Mother UHID": r.mothers_uhid_no || "",
                "Birth Date": r.created_date ? dayjs(r.created_date).format("DD-MM-YYYY") : r.registration_date || "",
                "Birth Time": `${r.birth_time || ""} ${r.birth_time_am_pm || ""}`.trim() || "-",
                "Weight (kg)": r.weight ? `${r.weight} kg` : "-",
                "Gender": r.gender || "-",
                "Pediatrician": r.pediatrician_responsible || "N/A"
            }));
        }

        const ws = XLSX.utils.json_to_sheet(exportRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "FrontOfficeReport");
        const filename = `FrontOffice_${activeTab}_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;
        XLSX.writeFile(wb, filename);
        toast.success("Excel report downloaded successfully");
    };

    const handlePrint = () => {
        window.print();
    };

    // Render Table Content based on active tab
    const renderTableContent = () => {
        if (loading) {
            return (
                <EmptyState>
                    <Spin size="large" />
                    <div className="title" style={{ marginTop: 14 }}>Loading Report Data...</div>
                    <div className="sub">Fetching records from the hospital database.</div>
                </EmptyState>
            );
        }

        if (filteredData.length === 0) {
            return (
                <EmptyState>
                    <Search size={44} />
                    <div className="title">No Records Found</div>
                    <div className="sub">
                        {searchTerm
                            ? `No records match your search query "${searchTerm}".`
                            : "There are no records for the selected date range or doctor filter."}
                    </div>
                </EmptyState>
            );
        }

        if (activeTab === "op_patients") {
            return (
                <StyledTable>
                    <thead>
                        <Tr>
                            <Th style={{ width: 120 }}>UHID</Th>
                            <Th style={{ width: 90, textAlign: "center" }}>Type</Th>
                            <Th style={{ width: 110 }}>Bill No</Th>
                            <Th>Patient Name</Th>
                            <Th style={{ width: 90 }}>Age / Gen</Th>
                            <Th style={{ width: 120 }}>Mobile</Th>
                            <Th style={{ width: 140 }}>Visit Date & Time</Th>
                            <Th style={{ width: 95, textAlign: "right" }}>Reg (₹)</Th>
                            <Th style={{ width: 95, textAlign: "right" }}>Consult (₹)</Th>
                            <Th style={{ width: 100, textAlign: "right" }}>Total (₹)</Th>
                            <Th>Consulting Doctor</Th>
                            <Th style={{ width: 120 }}>Referred By</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, idx) => (
                            <Tr key={row._id || `${row.bill_number}-${idx}`}>
                                <Td>
                                    <Badge bg="#f0fdfa" color={colors.primary} mono>
                                        {row.uhid || "-"}
                                    </Badge>
                                </Td>
                                <Td style={{ textAlign: "center" }}>
                                    <Badge
                                        bg={row.reg_type === "NEW" ? "#ecfdf5" : "#eff6ff"}
                                        color={row.reg_type === "NEW" ? "#059669" : "#2563eb"}
                                    >
                                        {row.reg_type || (row.is_new ? "NEW" : "RENEW")}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Badge bg="#f8fafc" color="#475569" mono>
                                        {row.bill_number || "-"}
                                    </Badge>
                                </Td>
                                <Td style={{ fontWeight: 600 }}>
                                    {row.patient_name || `${row.firstName || ""} ${row.lastName || ""}`.trim() || "N/A"}
                                </Td>
                                <Td>{`${row.age || "-"}/${row.gender || "-"}`}</Td>
                                <Td>{row.mobilePhone || "-"}</Td>
                                <Td>
                                    {row.created_date ? dayjs(row.created_date).format("DD-MM-YYYY HH:mm") : "-"}
                                </Td>
                                <Td style={{ textAlign: "right", color: row.registration_fee > 0 ? "#059669" : "#94a3b8" }}>
                                    ₹{Number(row.registration_fee || 0).toFixed(2)}
                                </Td>
                                <Td style={{ textAlign: "right" }}>
                                    ₹{Number(row.consulting_fee || 0).toFixed(2)}
                                </Td>
                                <Td style={{ textAlign: "right", fontWeight: 700, color: colors.primary }}>
                                    ₹{Number(row.total_fees || 0).toFixed(2)}
                                </Td>
                                <Td style={{ color: "#334155", fontWeight: 500 }}>{row.doctorName || "N/A"}</Td>
                                <Td>
                                    <Badge
                                        bg={row.referredBy && row.referredBy.toLowerCase() !== "direct" ? "#eff6ff" : "#f1f5f9"}
                                        color={row.referredBy && row.referredBy.toLowerCase() !== "direct" ? "#2563eb" : "#64748b"}
                                    >
                                        {row.referredBy || "Direct"}
                                    </Badge>
                                </Td>
                            </Tr>
                        ))}
                    </tbody>
                </StyledTable>
            );
        }

        if (activeTab === "referred_patients") {
            return (
                <StyledTable>
                    <thead>
                        <Tr>
                            <Th style={{ width: 130 }}>UHID</Th>
                            <Th style={{ width: 90, textAlign: "center" }}>Type</Th>
                            <Th>Patient Name</Th>
                            <Th style={{ width: 100 }}>Age / Gender</Th>
                            <Th style={{ width: 130 }}>Mobile</Th>
                            <Th style={{ width: 120 }}>Reg Date</Th>
                            <Th style={{ width: 140 }}>Referred By</Th>
                            <Th>Consulting Doctor</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, idx) => (
                            <Tr key={row._id || idx}>
                                <Td>
                                    <Badge bg="#f0fdfa" color={colors.primary} mono>
                                        {row.uhid || "-"}
                                    </Badge>
                                </Td>
                                <Td style={{ textAlign: "center" }}>
                                    <Badge
                                        bg={row.reg_type === "NEW" ? "#ecfdf5" : "#eff6ff"}
                                        color={row.reg_type === "NEW" ? "#059669" : "#2563eb"}
                                    >
                                        {row.reg_type || (row.is_new ? "NEW" : "RENEW")}
                                    </Badge>
                                </Td>
                                <Td style={{ fontWeight: 600 }}>
                                    {row.patient_name || `${row.firstName || ""} ${row.lastName || ""}`.trim() || "N/A"}
                                </Td>
                                <Td>{`${row.age || "-"}/${row.gender || "-"}`}</Td>
                                <Td>{row.mobilePhone || "-"}</Td>
                                <Td>
                                    {row.created_date ? dayjs(row.created_date).format("DD-MM-YYYY") : row.registration_date || "-"}
                                </Td>
                                <Td>
                                    <Badge bg="#eff6ff" color="#2563eb">
                                        {row.referredBy || "Direct"}
                                    </Badge>
                                </Td>
                                <Td style={{ color: "#334155", fontWeight: 500 }}>{row.doctorName || "N/A"}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </StyledTable>
            );
        }

        if (activeTab === "admission_register" || activeTab === "doctor_wise_admission") {
            return (
                <StyledTable>
                    <thead>
                        <Tr>
                            <Th style={{ width: 140 }}>IP Number</Th>
                            <Th style={{ width: 130 }}>UHID</Th>
                            <Th>Patient Name</Th>
                            <Th style={{ width: 160 }}>Admission Date & Time</Th>
                            <Th style={{ width: 120 }}>Room / Bed</Th>
                            <Th>Admitting Doctor</Th>
                            <Th>Reason for Admission</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, idx) => (
                            <Tr key={row._id || idx}>
                                <Td>
                                    <Badge bg="#eff6ff" color="#2563eb" mono>
                                        {row.ipNumber || "-"}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Badge bg="#f8fafc" color="#475569" mono>
                                        {row.uhid || "-"}
                                    </Badge>
                                </Td>
                                <Td style={{ fontWeight: 600 }}>
                                    {row.patient_name || `${row.firstName || ""} ${row.lastName || ""}`.trim() || "N/A"}
                                </Td>
                                <Td>
                                    {row.admissionDateTime ? dayjs(row.admissionDateTime).format("DD-MM-YYYY HH:mm") : "-"}
                                </Td>
                                <Td>
                                    <Badge bg="#f0fdf4" color="#16a34a">
                                        {row.roomNo || "-"} / {row.bedNo || "-"}
                                    </Badge>
                                </Td>
                                <Td style={{ color: "#334155", fontWeight: 600 }}>{row.admittingDoctor || "N/A"}</Td>
                                <Td style={{ fontSize: "0.82rem", color: "#64748b" }}>{row.reasonForAdmission || "-"}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </StyledTable>
            );
        }

        if (activeTab === "discharge_register") {
            return (
                <StyledTable>
                    <thead>
                        <Tr>
                            <Th style={{ width: 120 }}>IP Number</Th>
                            <Th style={{ width: 110 }}>UHID</Th>
                            <Th>Patient Name</Th>
                            <Th style={{ width: 85 }}>Age/Gen</Th>
                            <Th style={{ width: 120 }}>Mobile</Th>
                            <Th style={{ width: 110 }}>Admission Date</Th>
                            <Th style={{ width: 130 }}>Discharge Date</Th>
                            <Th>Doctor</Th>
                            <Th style={{ width: 110 }}>Bill No</Th>
                            <Th style={{ width: 125, textAlign: "right" }}>Net Amount (₹)</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, idx) => (
                            <Tr key={idx}>
                                <Td>
                                    <Badge bg="#fef2f2" color="#e11d48" mono>
                                        {row.ipNo || "-"}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Badge bg="#f8fafc" color="#475569" mono>
                                        {row.uhid || "-"}
                                    </Badge>
                                </Td>
                                <Td style={{ fontWeight: 600 }}>{row.patient_name || "Patient"}</Td>
                                <Td>{`${row.age || "-"}/${row.gender || "-"}`}</Td>
                                <Td style={{ fontWeight: 500, color: "#1e293b" }}>{row.mobile || "-"}</Td>
                                <Td>{row.admission_date ? dayjs(row.admission_date).format("DD-MM-YYYY") : "-"}</Td>
                                <Td>{row.dod ? dayjs(row.dod).format("DD-MM-YYYY HH:mm") : "-"}</Td>
                                <Td style={{ fontWeight: 500, color: "#334155" }}>{row.admitting_doctor || "N/A"}</Td>
                                <Td>
                                    <Badge bg="#f1f5f9" color="#334155" mono>
                                        {row.bill_no || "-"}
                                    </Badge>
                                </Td>
                                <Td style={{ textAlign: "right", fontWeight: 700, color: "#059669" }}>
                                    ₹{Number(row.net_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </Td>
                            </Tr>
                        ))}
                    </tbody>
                </StyledTable>
            );
        }

        if (activeTab === "doctor_wise_ip_collection") {
            return (
                <StyledTable>
                    <thead>
                        <Tr>
                            <Th style={{ width: 60 }}>#</Th>
                            <Th>Doctor Name</Th>
                            <Th style={{ textAlign: "center", width: 160 }}>Admitted Patients</Th>
                            <Th style={{ textAlign: "center", width: 150 }}>Bills Count</Th>
                            <Th style={{ textAlign: "right", width: 220 }}>Total IP Collection (₹)</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, idx) => (
                            <Tr key={idx}>
                                <Td style={{ color: "#94a3b8", fontWeight: 600 }}>
                                    {(currentPage - 1) * pageSize + idx + 1}
                                </Td>
                                <Td style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>
                                    {row.doctor_name || "Hospital Service"}
                                </Td>
                                <Td style={{ textAlign: "center" }}>
                                    <Badge bg="#eff6ff" color="#2563eb">
                                        {row.patient_count || 0} Patients
                                    </Badge>
                                </Td>
                                <Td style={{ textAlign: "center" }}>
                                    <Badge bg="#f8fafc" color="#475569">
                                        {row.bill_count || 0} Bills
                                    </Badge>
                                </Td>
                                <Td style={{ textAlign: "right", fontWeight: 800, color: "#059669", fontSize: "0.95rem" }}>
                                    ₹{Number(row.total_collection || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </Td>
                            </Tr>
                        ))}
                    </tbody>
                </StyledTable>
            );
        }

        if (activeTab === "new_born_babies") {
            return (
                <StyledTable>
                    <thead>
                        <Tr>
                            <Th style={{ width: 140 }}>Baby UHID</Th>
                            <Th>Baby Name</Th>
                            <Th style={{ width: 140 }}>Mother UHID</Th>
                            <Th style={{ width: 150 }}>Birth Date / Time</Th>
                            <Th style={{ width: 110 }}>Weight</Th>
                            <Th style={{ width: 100 }}>Gender</Th>
                            <Th>Pediatrician Responsible</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, idx) => (
                            <Tr key={row._id || idx}>
                                <Td>
                                    <Badge bg="#fdf2f8" color="#db2777" mono>
                                        {row.uhid || "-"}
                                    </Badge>
                                </Td>
                                <Td style={{ fontWeight: 600 }}>
                                    {`${row.firstName || ""} ${row.lastName || ""}`.trim() ||
                                        `Baby of ${row.mothers_uhid_no || "Mother"}`}
                                </Td>
                                <Td>
                                    <Badge bg="#f8fafc" color="#475569" mono>
                                        {row.mothers_uhid_no || "-"}
                                    </Badge>
                                </Td>
                                <Td>
                                    {(row.created_date ? dayjs(row.created_date).format("DD-MM-YYYY") : row.registration_date) || "-"}{" "}
                                    <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                                        {row.birth_time || ""} {row.birth_time_am_pm || ""}
                                    </span>
                                </Td>
                                <Td>
                                    <Badge bg="#f0fdf4" color="#16a34a">
                                        {row.weight ? `${row.weight} kg` : "-"}
                                    </Badge>
                                </Td>
                                <Td>{row.gender || "-"}</Td>
                                <Td style={{ color: "#334155", fontWeight: 500 }}>
                                    {row.pediatrician_responsible || "N/A"}
                                </Td>
                            </Tr>
                        ))}
                    </tbody>
                </StyledTable>
            );
        }

        return null;
    };

    return (
        <Container>
            {/* Top Header Section */}
            <HeaderSection className="no-print">
                <div className="title-area">
                    <div className="icon-badge">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1>Front Office Reports</h1>
                        <p>Hospital registration, admissions, discharges, room occupancy & revenue</p>
                    </div>
                </div>

                <div className="controls-area">
                    {/* Date Presets */}
                    <PresetButtonGroup>
                        <PresetBtn
                            active={datePreset === "today"}
                            onClick={() => handlePresetChange("today")}
                        >
                            Today
                        </PresetBtn>
                        <PresetBtn
                            active={datePreset === "yesterday"}
                            onClick={() => handlePresetChange("yesterday")}
                        >
                            Yesterday
                        </PresetBtn>
                        <PresetBtn
                            active={datePreset === "last7Days"}
                            onClick={() => handlePresetChange("last7Days")}
                        >
                            Last 7 Days
                        </PresetBtn>
                        <PresetBtn
                            active={datePreset === "thisMonth"}
                            onClick={() => handlePresetChange("thisMonth")}
                        >
                            This Month
                        </PresetBtn>
                    </PresetButtonGroup>

                    {/* Custom Range Picker */}
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) {
                                setDatePreset("custom");
                                setDateRange(dates);
                            }
                        }}
                        format="DD/MM/YYYY"
                        allowClear={false}
                        style={{ borderRadius: 10, height: 38 }}
                    />

                    {/* Refresh Button */}
                    <Tooltip title="Refresh Data">
                        <Button
                            icon={<RefreshCw size={15} />}
                            onClick={() => {
                                fetchSummaryKPIs();
                                fetchActiveReport();
                            }}
                            style={{ borderRadius: 10, height: 38 }}
                        />
                    </Tooltip>
                </div>
            </HeaderSection>

            {/* Report Cards Grid */}
            <CardsGrid className="no-print">
                {visibleReportCards.map((card) => {
                    const isActive = activeTab === card.id;
                    const countVal = summaryData && card.kpiKey ? summaryData[card.kpiKey] : undefined;
                    return (
                        <ReportCard
                            key={card.id}
                            active={isActive}
                            accentColor={card.accentColor}
                            onClick={() => {
                                if (card.isExternal) {
                                    navigate(card.path);
                                } else {
                                    setActiveTab(card.id);
                                    setSearchTerm("");
                                    setCurrentPage(1);
                                }
                            }}
                        >
                            <div className="card-top">
                                <div className="icon-box">
                                    {card.icon}
                                </div>
                                {card.isExternal ? (
                                    <span className="badge-tag" style={{ background: "#f8fafc", color: "#64748b" }}>
                                        Open Page ↗
                                    </span>
                                ) : countVal !== undefined ? (
                                    <span className="badge-tag">
                                        {summaryLoading
                                            ? "..."
                                            : card.kpiKey === "total_ip_collection"
                                                ? `₹${Number(countVal || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                                                : `${Number(countVal || 0).toLocaleString("en-IN")}`}
                                    </span>
                                ) : null}
                            </div>

                            <div className="content">
                                <h3>{card.title}</h3>
                                <p>{card.description}</p>
                                {card.id === "op_patients" && !summaryLoading && (
                                    <div style={{ fontSize: "0.74rem", marginTop: 4, fontWeight: 600 }}>
                                        <span style={{ color: "#059669" }}>New: {summaryData?.total_new_op || 0}</span>
                                        {"  |  "}
                                        <span style={{ color: "#2563eb" }}>Renew: {summaryData?.total_renew_op || 0}</span>
                                    </div>
                                )}
                            </div>

                            <div className="footer">
                                <span className="status-text">
                                    {card.isExternal
                                        ? "Go to Module"
                                        : isActive
                                            ? "Active Report"
                                            : "View Report"}
                                </span>
                                {card.isExternal ? (
                                    <ExternalLink size={14} className="arrow-icon" />
                                ) : (
                                    <ArrowRight size={14} className="arrow-icon" />
                                )}
                            </div>
                        </ReportCard>
                    );
                })}
            </CardsGrid>

            {/* Main Report Data Workspace */}
            <WorkspaceCard>
                {/* Print Title Header (hidden in screen, visible when printing) */}
                <div
                    className="print-only"
                    style={{
                        display: "none",
                        padding: "16px 20px 8px",
                        borderBottom: "1px solid #ccc",
                        marginBottom: 10
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{activeTabObj.title}</h2>
                    <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#666" }}>
                        Period: {dateRange[0]?.format("DD/MM/YYYY")} to {dateRange[1]?.format("DD/MM/YYYY")} | Generated:{" "}
                        {dayjs().format("DD/MM/YYYY HH:mm")}
                    </p>
                </div>

                {/* Interactive Action Toolbar */}
                <ActionToolbar className="no-print">
                    <div className="left-tools">
                        {/* Quick Search */}
                        <SearchInputBox>
                            <Search size={15} />
                            <input
                                type="text"
                                placeholder={`Search ${activeTabObj.title}...`}
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </SearchInputBox>

                        {/* Doctor Filter (when report has doctor relevance) */}
                        {activeTabObj.hasDoctorFilter && (
                            <Select
                                value={selectedDoctor}
                                onChange={(val) => setSelectedDoctor(val)}
                                style={{ width: 220, height: 38 }}
                                showSearch
                                placeholder="Filter by Doctor"
                                optionFilterProp="children"
                            >
                                <Select.Option value="all">All Doctors</Select.Option>
                                {doctors.map(doc => (
                                    <Select.Option key={doc.employeeId} value={doc.employeeName}>
                                        {doc.employeeName}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}

                        {/* Visit Type Segmented Filter (for OP Patients & Referrals) */}
                        {(activeTab === "op_patients" || activeTab === "referred_patients") && (
                            <PresetButtonGroup>
                                <PresetBtn
                                    active={visitTypeFilter === "all"}
                                    onClick={() => setVisitTypeFilter("all")}
                                >
                                    All
                                </PresetBtn>
                                <PresetBtn
                                    active={visitTypeFilter === "new"}
                                    onClick={() => setVisitTypeFilter("new")}
                                >
                                    New Registrations
                                </PresetBtn>
                                <PresetBtn
                                    active={visitTypeFilter === "renew"}
                                    onClick={() => setVisitTypeFilter("renew")}
                                >
                                    Renewals
                                </PresetBtn>
                            </PresetButtonGroup>
                        )}

                        {/* Records Counter */}
                        <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>
                            {filteredData.length} records found
                        </div>
                    </div>

                    <div className="right-tools">
                        {canExport && (
                            <Button
                                icon={<Download size={15} />}
                                onClick={handleExportExcel}
                                disabled={filteredData.length === 0}
                                style={{ borderRadius: 10, height: 38 }}
                            >
                                Export Excel
                            </Button>
                        )}
                        <Button
                            icon={<Printer size={15} />}
                            onClick={handlePrint}
                            disabled={filteredData.length === 0}
                            style={{ borderRadius: 10, height: 38 }}
                        >
                            Print
                        </Button>
                    </div>
                </ActionToolbar>

                {/* Table Data View */}
                <TableWrapper style={{ overflowX: "auto" }}>
                    {renderTableContent()}
                </TableWrapper>

                {/* Pagination Controls */}
                {!loading && filteredData.length > 0 && (
                    <PaginationFooter className="no-print">
                        <div className="info" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span>
                                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                                {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
                            </span>
                            <Select
                                size="small"
                                value={pageSize}
                                onChange={(val) => {
                                    setPageSize(val);
                                    setCurrentPage(1);
                                }}
                                style={{ width: 105 }}
                            >
                                <Select.Option value={10}>10 / page</Select.Option>
                                <Select.Option value={25}>25 / page</Select.Option>
                                <Select.Option value={50}>50 / page</Select.Option>
                                <Select.Option value={100}>100 / page</Select.Option>
                            </Select>
                        </div>
                        {filteredData.length > pageSize && (
                            <div className="controls">
                                <PageBtn
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={14} /> Previous
                                </PageBtn>
                                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b", margin: "0 6px" }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <PageBtn
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                >
                                    Next <ChevronRight size={14} />
                                </PageBtn>
                            </div>
                        )}
                    </PaginationFooter>
                )}
            </WorkspaceCard>

            {/* Print Styling */}
            <style>{`
                @media print {
                    body {
                        background: white !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th {
                        background: #f1f5f9 !important;
                        color: #000 !important;
                        border: 1px solid #cbd5e1 !important;
                        padding: 6px 8px !important;
                        font-size: 8pt !important;
                    }
                    td {
                        border: 1px solid #cbd5e1 !important;
                        padding: 6px 8px !important;
                        font-size: 8pt !important;
                        color: #000 !important;
                    }
                }
            `}</style>
        </Container>
    );
};

export default FrontOfficeReports;
