import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Modal, DatePicker, Select, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import {
    FileText,
    Users,
    Calendar,
    TrendingUp,
    CreditCard,
    BarChart3,
    ClipboardList,
    Clock,
    UserCheck,
    ShieldCheck,
    ArrowRight,
    Banknote,
    Wallet,
    MinusCircle,
    Percent,
    Package,
    Search,
    FileSpreadsheet,
    RotateCcw,
    Maximize2,
    Minimize2,
    Printer,
    Download,
    X,
    ExternalLink,
    Receipt,
    Layers,
    Building2,
    BedDouble
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import { fetchCachedOutlets, cachedApiRequest } from "./masterAccountsHelper";
import { fetchMyReportPermissions, fetchReportMasters } from "../../Auth/reportConfigApi";
import A4MultiPageViewer from "../Reports/A4MultiPageViewer";

// Lazy-load all Master Accounts reports
const MasterUnifiedAccountsReport = lazy(() => import("./MasterUnifiedAccountsReport"));
const MasterShiftBasisReport = lazy(() => import("./MasterShiftBasisReport"));
const MasterCashBillsReport = lazy(() => import("./MasterCashBillsReport"));
const MasterDailyCashReport = lazy(() => import("./MasterDailyCashReport"));
const MasterCashierWiseReport = lazy(() => import("./MasterCashierWiseReport"));
const MasterCashierDetailedReport = lazy(() => import("./MasterCashierDetailedReport"));
const MasterCreditCardReport = lazy(() => import("./MasterCreditCardReport"));
const MasterDatewiseSummaryReport = lazy(() => import("./MasterDatewiseSummaryReport"));
const MasterDepartmentWiseReport = lazy(() => import("./MasterDepartmentWiseReport"));
const MasterBillTypeWiseReport = lazy(() => import("./MasterBillTypeWiseReport"));
const MasterAdvanceRegistration = lazy(() => import("./MasterAdvanceRegistration"));
const MasterInsuranceAdvanceReport = lazy(() => import("./MasterInsuranceAdvanceReport"));
const MasterIPAdvanceReport = lazy(() => import("./MasterIPAdvanceReport"));
const MasterAdmissionVsDischargeReport = lazy(() => import("./MasterAdmissionVsDischargeReport"));
const MasterDischargeBillsReport = lazy(() => import("./MasterDischargeBillsReport"));
const MasterDischargeDetailedReport = lazy(() => import("./MasterDischargeDetailedReport"));
const MasterDebitDueBillsReport = lazy(() => import("./MasterDebitDueBillsReport"));
const MasterDiscountBillsReport = lazy(() => import("./MasterDiscountBillsReport"));
const MasterBillCancelReport = lazy(() => import("./MasterBillCancelReport"));
const MasterAccountsAuditReport = lazy(() => import("./MasterAccountsAuditReport"));
const MasterBillWiseReport = lazy(() => import("./MasterBillWiseReport"));
const MasterMiscPaymentReport = lazy(() => import("./MasterMiscPaymentReport"));
const MasterSalesTaxRegister = lazy(() => import("./MasterSalesTaxRegister"));
const MasterDaywiseSalesTaxRegister = lazy(() => import("./MasterDaywiseSalesTaxRegister"));
const MasterOPPharmacyGSTReport = lazy(() => import("./MasterOPPharmacyGSTReport"));
const MasterPurchaseGSTReport = lazy(() => import("./MasterPurchaseGSTReport"));
const MasterStockReportIpOp = lazy(() => import("./MasterStockReportIpOp"));
const MasterSalesReturnReport = lazy(() => import("./MasterSalesReturnReport"));

const { RangePicker } = DatePicker;
const { Option } = Select;

// ==========================================
// STYLED COMPONENTS
// ==========================================
const DashboardContainer = styled.div`
    padding: 24px 32px;
    background: #f8fafc;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
`;

const TopBanner = styled.div`
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border-radius: 16px;
    padding: 28px 36px;
    color: #ffffff;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.15);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;

    .hero-text {
        h1 {
            font-size: 1.85rem;
            font-weight: 800;
            margin: 0;
            color: #ffffff;
            letter-spacing: -0.02em;
            display: flex;
            align-items: center;
            gap: 12px;

            span.badge {
                font-size: 0.75rem;
                background: #0284c7;
                color: #ffffff;
                padding: 4px 12px;
                border-radius: 20px;
                font-weight: 700;
                letter-spacing: 0.05em;
            }
        }
        p {
            font-size: 0.95rem;
            color: #94a3b8;
            margin: 6px 0 0 0;
            max-width: 650px;
        }
    }

    .kpi-pill {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        gap: 16px;

        .item {
            text-align: center;
            .num {
                font-size: 1.4rem;
                font-weight: 800;
                color: #38bdf8;
            }
            .label {
                font-size: 0.75rem;
                color: #cbd5e1;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
        }
        .divider {
            width: 1px;
            height: 32px;
            background: rgba(255, 255, 255, 0.15);
        }
    }
`;

const ControlBar = styled.div`
    background: #ffffff;
    border-radius: 12px;
    padding: 16px 20px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;

    .filters-left {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
    }

    .search-right {
        width: 280px;
        max-width: 100%;
    }
`;

const ClusterTabs = styled.div`
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
    margin-bottom: 20px;

    button {
        background: ${props => props.$active ? "#0284c7" : "#ffffff"};
        color: ${props => props.$active ? "#ffffff" : "#475569"};
        border: 1px solid ${props => props.$active ? "#0284c7" : "#cbd5e1"};
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;

        &:hover {
            border-color: #0284c7;
            color: ${props => props.$active ? "#ffffff" : "#0284c7"};
        }
    }
`;

const ReportsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
`;

const ReportCard = styled.div`
    background: #ffffff;
    border-radius: 14px;
    padding: 22px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        border-color: ${props => props.$accent || "#0284c7"};
    }

    .card-top {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        margin-bottom: 12px;

        .icon-box {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: ${props => `${props.$accent || "#0284c7"}15`};
            color: ${props => props.$accent || "#0284c7"};
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .info {
            flex: 1;
            h3 {
                font-size: 1.05rem;
                font-weight: 700;
                color: #0f172a;
                margin: 0;
                line-height: 1.3;
            }
            .category-tag {
                display: inline-block;
                margin-top: 4px;
            }
        }
    }

    .description {
        font-size: 0.82rem;
        color: #64748b;
        line-height: 1.5;
        margin-bottom: 20px;
        flex: 1;
    }

    .card-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        border-top: 1px solid #f1f5f9;
        padding-top: 14px;

        .btn-modal {
            flex: 1;
            background: #f8fafc;
            color: #0f172a;
            border: 1px solid #cbd5e1;
            font-weight: 600;
            font-size: 0.8rem;
            border-radius: 8px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
                background: #0284c7;
                color: #ffffff;
                border-color: #0284c7;
            }
        }

        .btn-full {
            background: transparent;
            color: #64748b;
            border: 1px solid #e2e8f0;
            font-weight: 600;
            font-size: 0.8rem;
            border-radius: 8px;
            height: 36px;
            padding: 0 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
                color: #0f172a;
                border-color: #94a3b8;
            }
        }
    }
`;

// Formal Configuration Modal matching Accounts Dashboard
const StyledConfigModal = styled(Modal)`
    .ant-modal-content {
        border-radius: 20px;
        overflow: hidden;
        padding: 0;
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.16);
    }
    .ant-modal-header {
        padding: 24px 32px 16px 32px;
        border-bottom: 1px solid #f1f5f9;
        margin: 0;
    }
    .ant-modal-title {
        font-size: 1.25rem;
        font-weight: 800;
        color: #0f172a;
    }
    .ant-modal-body {
        padding: 28px 32px 20px 32px;
    }
    .ant-modal-footer {
        padding: 16px 32px 24px 32px;
        border-top: 1px solid #f1f5f9;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }
`;

const DatePickerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;

    .field-row {
        display: flex;
        gap: 14px;
        @media (max-width: 540px) {
            flex-direction: column;
        }
    }

    .field-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;

        label {
            font-size: 0.78rem;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .ant-picker {
            width: 100%;
            height: 42px;
            border-radius: 10px;
            border: 1.5px solid #cbd5e1;
            padding: 8px 14px;
            font-size: 0.92rem;

            &:hover, &.ant-picker-focused {
                border-color: #0d9488;
            }
        }

        select {
            width: 100%;
            height: 42px;
            border-radius: 10px;
            border: 1.5px solid #cbd5e1;
            padding: 8px 14px;
            font-size: 0.92rem;
            background: #ffffff;
            color: #0f172a;
            cursor: pointer;

            &:focus {
                outline: none;
                border-color: #0d9488;
            }
        }
    }

    .info-note {
        font-size: 0.78rem;
        color: #64748b;
        margin-top: 4px;
        line-height: 1.4;
    }
`;

// Formal Report Modal styled for A4MultiPageViewer
const ReportModal = styled(Modal)`
    .ant-modal-content {
        border-radius: 6px;
        padding: 0;
        overflow: hidden;
        background: #323639;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.45);
        border: 1px solid #1e293b;
    }
    .ant-modal-body {
        padding: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: ${props => props.$isMaximized ? '96vh' : '88vh'};
    }
`;

// ==========================================
// MASTER ACCOUNTS DASHBOARD COMPONENT
// ==========================================
const MasterAccountsDashboard = () => {
    const navigate = useNavigate();
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const [dateRange, setDateRange] = useState([dayjs().startOf("month"), dayjs()]);
    const [selectedOutlet, setSelectedOutlet] = useState("all");
    const [outletsList, setOutletsList] = useState([]);
    const [billTypesList, setBillTypesList] = useState([]);
    const [billType, setBillType] = useState("All");
    const [selectedFloor, setSelectedFloor] = useState("all");
    const [selectedCompany, setSelectedCompany] = useState("all");
    const [cardMachine, setCardMachine] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCluster, setSelectedCluster] = useState("all");

    // Dynamic Report Permissions from hospital_reportconfigurationmaster
    const [userReportPerms, setUserReportPerms] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("report_permissions") || "null");
        } catch {
            return null;
        }
    });
    const [hasCustomConfig, setHasCustomConfig] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("has_custom_report_config") || "false");
        } catch {
            return false;
        }
    });
    const [dbReports, setDbReports] = useState([]);
    const [loadingDbReports, setLoadingDbReports] = useState(false);

    // Load active employee report permissions from hospital_reportconfigurationmaster
    useEffect(() => {
        const loadUserPermissions = async () => {
            const empId = localStorage.getItem("employeeId") || localStorage.getItem("user_id") || localStorage.getItem("auth-user-id");
            if (!empId) return;
            try {
                const res = await fetchMyReportPermissions(empId);
                if (res && res.success) {
                    setUserReportPerms(res.report_permissions || {});
                    setHasCustomConfig(Boolean(res.has_custom_config));
                    localStorage.setItem("report_permissions", JSON.stringify(res.report_permissions || {}));
                    localStorage.setItem("has_custom_report_config", JSON.stringify(Boolean(res.has_custom_config)));
                }
            } catch (err) {
                console.error("Error loading user report permissions:", err);
            }
        };
        loadUserPermissions();
    }, []);

    // Load Master Accounts report master definitions from hospital_reportmaster
    useEffect(() => {
        const loadMasterReportsFromDb = async () => {
            try {
                setLoadingDbReports(true);
                const groups = await fetchReportMasters("Master Accounts");
                if (Array.isArray(groups) && groups.length > 0) {
                    const pages = [];
                    for (const g of groups) {
                        if (Array.isArray(g.pages)) {
                            for (const page of g.pages) {
                                pages.push(page);
                            }
                        }
                    }
                    if (pages.length > 0) {
                        setDbReports(pages);
                    }
                }
            } catch (err) {
                console.error("Error loading master accounts reports from hospital_reportmaster:", err);
            } finally {
                setLoadingDbReports(false);
            }
        };
        loadMasterReportsFromDb();
    }, []);

    // Modal state
    const [activeModalReport, setActiveModalReport] = useState(null);
    const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [reportCategories, setReportCategories] = useState([]);
    const [reportCardMachines, setReportCardMachines] = useState([]);

    const handleLoadOptions = useCallback(({ categories, cardMachines }) => {
        if (Array.isArray(categories) && categories.length > 0) {
            setReportCategories(prev => {
                if (prev.length === categories.length && prev.every((v, i) => v === categories[i])) return prev;
                return categories;
            });
        }
        if (Array.isArray(cardMachines) && cardMachines.length > 0) {
            setReportCardMachines(prev => {
                if (prev.length === cardMachines.length && prev.every((v, i) => v === cardMachines[i])) return prev;
                return cardMachines;
            });
        }
    }, []);

    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const data = await fetchCachedOutlets(HmsBaseUrl);
                if (Array.isArray(data)) {
                    setOutletsList(data);
                }
            } catch (e) {}
        };
        const fetchBillTypes = async () => {
            try {
                const res = await cachedApiRequest(`${HmsBaseUrl}bill-types_get/`, "GET");
                const recs = res?.records || res?.data?.records || res?.data;
                if (Array.isArray(recs)) {
                    setBillTypesList(recs);
                }
            } catch (err) {
                console.error("Failed to fetch bill types:", err);
            }
        };
        fetchOutlets();
        fetchBillTypes();
    }, [HmsBaseUrl]);

    // Master list of 25 reports covering all clusters
    const reports = [
        // Core Reconciliation
        {
            id: "unified_accounts",
            title: "Unified Accounts & Reconciliation",
            category: "Core Engine",
            cluster: "core",
            description: "Single Source of Truth: Gross Collections, Counter Expense Deductions, Net Cash Handover, and Shift-Wise Tally.",
            icon: <Receipt size={24} />,
            color: "#0284c7",
            component: MasterUnifiedAccountsReport,
            fullPageRoute: "/MasterUnifiedAccountsReport"
        },
        // Cluster 1: Shift & Cash
        {
            id: "shift_basis",
            title: "Shift Basis Collection Report",
            category: "Shift & Cash",
            cluster: "shift_cash",
            description: "Shift-wise closing balances, cash handovers, expense deductions, and 100% mathematical tally status.",
            icon: <Clock size={24} />,
            color: "#059669",
            component: MasterShiftBasisReport,
            fullPageRoute: "/MasterShiftBasisReport"
        },
        {
            id: "cash_bills",
            title: "Cash Bills Summary Report",
            category: "Shift & Cash",
            cluster: "shift_cash",
            description: "Direct cash receipts summary categorized by OPD, IPD, Diagnostics, Pharmacy, and Advance deposits.",
            icon: <Banknote size={24} />,
            color: "#059669",
            component: MasterCashBillsReport,
            fullPageRoute: "/MasterCashBillsReport"
        },
        {
            id: "daily_cash",
            title: "Daily Cash Collection Report (Cash Book)",
            category: "Shift & Cash",
            cluster: "shift_cash",
            description: "Daily Cash Book format: opening balance, cash receipts, drawer expenses paid, and closing cash.",
            icon: <Wallet size={24} />,
            color: "#059669",
            component: MasterDailyCashReport,
            fullPageRoute: "/MasterDailyCashReport"
        },
        {
            id: "collection_summary",
            title: "Cashier-Wise Collection Summary",
            category: "Shift & Cash",
            cluster: "shift_cash",
            description: "Collections per counter operator with Cash, Card POS, UPI, and Credit breakdown across shifts.",
            icon: <Users size={24} />,
            color: "#059669",
            component: MasterCashierWiseReport,
            fullPageRoute: "/MasterCashierWiseReport"
        },
        {
            id: "cashier_wise_detailed",
            title: "Cashier-Wise Detailed Collection",
            category: "Shift & Cash",
            cluster: "shift_cash",
            description: "Line-by-line itemized collection audit per cashier across active shifts.",
            icon: <ClipboardList size={24} />,
            color: "#059669",
            component: MasterCashierDetailedReport,
            fullPageRoute: "/MasterCashierDetailedReport"
        },

        // Cluster 2: Digital & Departmental
        {
            id: "credit_card",
            title: "Credit Card & Electronic Payment Report",
            category: "Digital & Dept",
            cluster: "digital_dept",
            description: "POS terminal swipe machine receipts, card network auth codes, and electronic settlements.",
            icon: <CreditCard size={24} />,
            color: "#6366f1",
            component: MasterCreditCardReport,
            fullPageRoute: "/MasterCreditCardReport"
        },
        {
            id: "date_wise_summary",
            title: "Date-Wise Collection Summary",
            category: "Digital & Dept",
            cluster: "digital_dept",
            description: "Day-by-day revenue summary across all hospital departments for custom date ranges.",
            icon: <Calendar size={24} />,
            color: "#6366f1",
            component: MasterDatewiseSummaryReport,
            fullPageRoute: "/MasterDatewiseSummaryReport"
        },
        {
            id: "department_wise",
            title: "Department-Wise Revenue & Volume Report",
            category: "Digital & Dept",
            cluster: "digital_dept",
            description: "Clinical department revenue and volume breakdown across OP, IP, Pharmacy, and Doctor Performance.",
            icon: <Building2 size={24} />,
            color: "#6366f1",
            component: MasterDepartmentWiseReport,
            fullPageRoute: "/MasterDepartmentWiseReport"
        },
        {
            id: "bill_type_wise",
            title: "Bill Type-Wise Collection Report",
            category: "Digital & Dept",
            cluster: "digital_dept",
            description: "Financial revenue performance grouped by hospital bill types, pharmacy, and diagnostic services.",
            icon: <Layers size={24} />,
            color: "#6366f1",
            component: MasterBillTypeWiseReport,
            fullPageRoute: "/MasterBillTypeWiseReport"
        },

        // Cluster 3: IP Admissions & Advances
        {
            id: "advance_reg",
            title: "Advance Registration Report",
            category: "Inpatient & Advances",
            cluster: "ip_advances",
            description: "Patient running advance deposits register with payment mode decomposition and IP tracking.",
            icon: <UserCheck size={24} />,
            color: "#d97706",
            component: MasterAdvanceRegistration,
            fullPageRoute: "/MasterAdvanceRegistration"
        },
        {
            id: "insurance_advance",
            title: "Insurance Advance Registration Report",
            category: "Inpatient & Advances",
            cluster: "ip_advances",
            description: "TPA and Corporate insurance advance deposits, claim initial approvals, and copay records.",
            icon: <ShieldCheck size={24} />,
            color: "#d97706",
            component: MasterInsuranceAdvanceReport,
            fullPageRoute: "/MasterInsuranceAdvanceReport"
        },
        {
            id: "ip_advance",
            title: "IP Advance Collection Register",
            category: "Inpatient & Advances",
            cluster: "ip_advances",
            description: "Admitted in-patients running advance ledger grouped by hospital floor and ward.",
            icon: <CreditCard size={24} />,
            color: "#d97706",
            component: MasterIPAdvanceReport,
            fullPageRoute: "/MasterIPAdvanceReport"
        },
        {
            id: "admission_vs_discharge",
            title: "Admission vs Discharge Report",
            category: "Inpatient & Advances",
            cluster: "ip_advances",
            description: "Comprehensive tracking of inpatient admissions, bed occupancy, length of stay, advances, and discharge clearances.",
            icon: <BedDouble size={24} />,
            color: "#0891b2",
            component: MasterAdmissionVsDischargeReport,
            fullPageRoute: "/MasterAdmissionVsDischargeReport"
        },
        {
            id: "discharge_bills",
            title: "Discharge Patient Bills Summary",
            category: "Inpatient & Advances",
            cluster: "ip_advances",
            description: "Final discharge settlement bills, advance adjustments, and clearance summary for discharged patients.",
            icon: <TrendingUp size={24} />,
            color: "#d97706",
            component: MasterDischargeBillsReport,
            fullPageRoute: "/MasterDischargeBillsReport"
        },
        {
            id: "discharge_detailed",
            title: "Discharge Bills Detailed Breakdown",
            category: "Inpatient & Advances",
            cluster: "ip_advances",
            description: "Departmental breakdown of Room Rent, Nursing, Lab, Pharmacy, and OT on patient discharge.",
            icon: <BarChart3 size={24} />,
            color: "#d97706",
            component: MasterDischargeDetailedReport,
            fullPageRoute: "/MasterDischargeDetailedReport"
        },
        {
            id: "debit_due_bills",
            title: "Debit & Due Bills Register",
            category: "Inpatient & Advances",
            cluster: "ip_advances",
            description: "Pending patient receivables, debit notes, and unsettled balance dues across all billing heads.",
            icon: <MinusCircle size={24} />,
            color: "#d97706",
            component: MasterDebitDueBillsReport,
            fullPageRoute: "/MasterDebitDueBillsReport"
        },
        {
            id: "discount_bills",
            title: "Discount Bills Register",
            category: "Inpatient & Advances",
            cluster: "ip_advances",
            description: "Hospital management concessions, doctor waivers, and authorized billing discounts.",
            icon: <Percent size={24} />,
            color: "#d97706",
            component: MasterDiscountBillsReport,
            fullPageRoute: "/MasterDiscountBillsReport"
        },
        {
            id: "bill_cancel",
            title: "Bill Cancellation Register",
            category: "Inpatient & Advances",
            cluster: "ip_advances",
            description: "Detailed log of cancelled receipts and refunded bills with authorized reasons.",
            icon: <X size={24} />,
            color: "#dc2626",
            component: MasterBillCancelReport,
            fullPageRoute: "/MasterBillCancelReport"
        },

        // Cluster 4: Auditing & Sundry
        {
            id: "accounts_audit",
            title: "Accounts Audit Report",
            category: "Audit & Sundry",
            cluster: "audit_sundry",
            description: "Transactional audit report across all cash counter vouchers and billing adjustments.",
            icon: <ShieldCheck size={24} />,
            color: "#475569",
            component: MasterAccountsAuditReport,
            fullPageRoute: "/MasterAccountsAuditReport",
            isWide: true
        },
        {
            id: "bill_wise",
            title: "Bill Wise Detailed Report",
            category: "Audit & Sundry",
            cluster: "audit_sundry",
            description: "Itemized line-by-line revenue analysis per patient bill across all billing modules.",
            icon: <FileText size={24} />,
            color: "#475569",
            component: MasterBillWiseReport,
            fullPageRoute: "/MasterBillWiseReport"
        },
        {
            id: "misc_payment",
            title: "Miscellaneous Payment Report",
            category: "Audit & Sundry",
            cluster: "audit_sundry",
            description: "Sundry hospital income receipts and cash drawer expense payout vouchers.",
            icon: <Wallet size={24} />,
            color: "#475569",
            component: MasterMiscPaymentReport,
            fullPageRoute: "/MasterMiscPaymentReport"
        },

        // Cluster 5: GST Taxation
        {
            id: "sales_tax_register",
            title: "Sales Tax Register (GST)",
            category: "GST & Taxes",
            cluster: "gst_taxes",
            description: "GST output tax collection register grouped by operating day and tax slab (0%, 5%, 12%, 18%).",
            icon: <Percent size={24} />,
            color: "#7c3aed",
            component: MasterSalesTaxRegister,
            fullPageRoute: "/MasterSalesTaxRegister"
        },
        {
            id: "daywise_sales_tax_register",
            title: "Day-wise Sales Tax Register (GST)",
            category: "GST & Taxes",
            cluster: "gst_taxes",
            description: "Day-wise summary breakdown of pharmacy OP/IP bills and sales returns across GST tax slabs (Exempted, 5%, 12%, 18%) with Sales, Returns, and Net breakdown tabs.",
            icon: <Layers size={24} />,
            color: "#0891b2",
            component: MasterDaywiseSalesTaxRegister,
            fullPageRoute: "/MasterDaywiseSalesTaxRegister",
            isWide: true
        },
        {
            id: "drug_b2b_report",
            title: "Drug Purchase - B2B Invoices",
            category: "GST & Taxes",
            cluster: "gst_taxes",
            description: "Drug Purchase B2B invoice-level tax register in Winman GSTR-1 format.",
            icon: <FileText size={24} />,
            color: "#7c3aed",
            component: MasterPurchaseGSTReport,
            defaultSourceType: "drug",
            defaultTab: "b2b",
            lockedSourceType: true,
            lockedTab: true,
            fullPageRoute: "/MasterDrugPurchaseB2B"
        },
        {
            id: "drug_hsn_report",
            title: "Drug Purchase - HSN Wise Summary",
            category: "GST & Taxes",
            cluster: "gst_taxes",
            description: "Drug Purchase medicine HSN-wise summaries with quantity, rate, and ITC breakdowns.",
            icon: <Package size={24} />,
            color: "#7c3aed",
            component: MasterPurchaseGSTReport,
            defaultSourceType: "drug",
            defaultTab: "hsn",
            lockedSourceType: true,
            lockedTab: true,
            fullPageRoute: "/MasterDrugHSNReport"
        },
        {
            id: "drug_docs_report",
            title: "Drug Purchase - Document Summary",
            category: "GST & Taxes",
            cluster: "gst_taxes",
            description: "Drug Purchase inward supply invoice document series, range, and voucher counts.",
            icon: <Layers size={24} />,
            color: "#7c3aed",
            component: MasterPurchaseGSTReport,
            defaultSourceType: "drug",
            defaultTab: "docs",
            lockedSourceType: true,
            lockedTab: true,
            fullPageRoute: "/MasterDrugDocsReport"
        },
        {
            id: "store_b2b_report",
            title: "General Stores - B2B Invoices",
            category: "GST & Taxes",
            cluster: "gst_taxes",
            description: "General Stores inward purchase invoice tax register by tax rate.",
            icon: <FileText size={24} />,
            color: "#7c3aed",
            component: MasterPurchaseGSTReport,
            defaultSourceType: "stores",
            defaultTab: "b2b",
            lockedSourceType: true,
            lockedTab: true,
            fullPageRoute: "/MasterStoreB2BReport"
        },
        {
            id: "store_hsn_report",
            title: "General Stores - HSN Wise Summary",
            category: "GST & Taxes",
            cluster: "gst_taxes",
            description: "General Stores product HSN summary with UOM, quantity, taxable value, and tax lines.",
            icon: <Package size={24} />,
            color: "#7c3aed",
            component: MasterPurchaseGSTReport,
            defaultSourceType: "stores",
            defaultTab: "hsn",
            lockedSourceType: true,
            lockedTab: true,
            fullPageRoute: "/MasterStoreHSNReport"
        },
        {
            id: "store_docs_report",
            title: "General Stores - Document Summary",
            category: "GST & Taxes",
            cluster: "gst_taxes",
            description: "General Stores inward invoice series, serial ranges, and cancellation counts.",
            icon: <Layers size={24} />,
            color: "#7c3aed",
            component: MasterPurchaseGSTReport,
            defaultSourceType: "stores",
            defaultTab: "docs",
            lockedSourceType: true,
            lockedTab: true,
            fullPageRoute: "/MasterStoreDocsReport"
        },
        {
            id: "purchase_gst_consolidated",
            title: "Purchase GST Register - Consolidated (GSTR-1)",
            category: "GST & Taxes",
            cluster: "gst_taxes",
            description: "Consolidated multi-tab register covering both Drug Purchase & General Stores.",
            icon: <FileSpreadsheet size={24} />,
            color: "#7c3aed",
            component: MasterPurchaseGSTReport,
            defaultSourceType: "all",
            defaultTab: "b2b",
            lockedSourceType: false,
            lockedTab: false,
            fullPageRoute: "/MasterPurchaseGSTReport"
        },
        {
            id: "op_pharmacy_sales_invoices",
            title: "OP Pharmacy Sales - Invoices",
            category: "GST & Taxes",
            cluster: "gst_taxes",
            description: "OP Pharmacy outward patient sales invoices with Bill No as Invoice No, Customer Name, and GST tax breakdown.",
            icon: <FileText size={24} />,
            color: "#7c3aed",
            component: MasterOPPharmacyGSTReport,
            defaultTab: "invoices",
            lockedTab: true,
            fullPageRoute: "/MasterOPPharmacySalesInvoices"
        },
        {
            id: "op_pharmacy_sales_hsn",
            title: "OP Pharmacy Sales - HSN Wise Summary",
            category: "GST & Taxes",
            cluster: "gst_taxes",
            description: "HSN-wise medicine product sales summary with quantities, tax rates, and output GST totals.",
            icon: <Package size={24} />,
            color: "#7c3aed",
            component: MasterOPPharmacyGSTReport,
            defaultTab: "hsn",
            lockedTab: true,
            fullPageRoute: "/MasterOPPharmacySalesHSN"
        },
        {
            id: "op_pharmacy_sales_docs",
            title: "OP Pharmacy Sales - Document Summary",
            category: "GST & Taxes",
            cluster: "gst_taxes",
            description: "Document summary of OP Pharmacy outward supply bills, serial number series from/to, and cancellations.",
            icon: <Layers size={24} />,
            color: "#7c3aed",
            component: MasterOPPharmacyGSTReport,
            defaultTab: "docs",
            lockedTab: true,
            fullPageRoute: "/MasterOPPharmacySalesDocs"
        },

        // Cluster 6: Inventory & Stock
        {
            id: "stock_movement_ip_op",
            title: "IP / OP Stock Movement Report",
            category: "Stock & Inventory",
            cluster: "stock_inventory",
            description: "Audit of medical and pharmacy items dispensed to Inpatients vs Outpatients.",
            icon: <Package size={24} />,
            color: "#0891b2",
            component: MasterStockReportIpOp,
            fullPageRoute: "/MasterStockReportIpOp"
        },
        {
            id: "sales_return",
            title: "Sales Return Report",
            category: "Stock & Inventory",
            cluster: "stock_inventory",
            description: "Medicine sales returns, refunds, customer credit notes, and restocking audit trail.",
            icon: <RotateCcw size={24} />,
            color: "#0891b2",
            component: MasterSalesReturnReport,
            fullPageRoute: "/MasterSalesReturnReport"
        }
    ];

    // Merge dynamic properties from hospital_reportmaster if present
    const dynamicReports = useMemo(() => {
        if (!dbReports || dbReports.length === 0) return reports;
        const dbMap = {};
        dbReports.forEach(p => {
            if (p.route) dbMap[p.route] = p;
        });
        return reports.map(r => {
            const dbPage = dbMap[r.fullPageRoute] || dbMap[r.route];
            if (dbPage) {
                return {
                    ...r,
                    title: dbPage.name || dbPage.title || r.title,
                    description: dbPage.description || r.description,
                    page_id: dbPage.page_id
                };
            }
            return r;
        });
    }, [reports, dbReports]);

    // Filter reports by hospital_reportconfigurationmaster permissions, search term, and cluster tab
    const filteredReports = useMemo(() => {
        return dynamicReports.filter(r => {
            // Evaluate custom report configuration allocated to logged-in user
            if (hasCustomConfig && userReportPerms && typeof userReportPerms === "object") {
                const route = r.fullPageRoute || r.route;
                const normRoute = route?.startsWith("/") ? route : `/${route}`;
                const legacyRoute = route?.replace("/Master", "/");
                const isAllowed = Boolean(
                    userReportPerms[route] ||
                    userReportPerms[normRoute] ||
                    (legacyRoute && userReportPerms[legacyRoute]) ||
                    userReportPerms[r.title] ||
                    userReportPerms[r.id]
                );
                if (!isAllowed) return false;
            } else if (userReportPerms && typeof userReportPerms === "object" && Object.keys(userReportPerms).length > 0) {
                const route = r.fullPageRoute || r.route;
                const normRoute = route?.startsWith("/") ? route : `/${route}`;
                const legacyRoute = route?.replace("/Master", "/");
                const isAllowed = Boolean(
                    userReportPerms[route] ||
                    userReportPerms[normRoute] ||
                    (legacyRoute && userReportPerms[legacyRoute]) ||
                    userReportPerms[r.title] ||
                    userReportPerms[r.id]
                );
                if (!isAllowed) return false;
            }

            if (selectedCluster !== "all" && r.cluster !== selectedCluster) {
                return false;
            }
            if (!searchTerm.trim()) return true;
            const q = searchTerm.toLowerCase();
            return (
                r.title.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q) ||
                r.category.toLowerCase().includes(q)
            );
        });
    }, [dynamicReports, selectedCluster, searchTerm, hasCustomConfig, userReportPerms]);

    const handleOpenModal = (report) => {
        setActiveModalReport(report);
        setCardMachine("all");
        setReportCategories([]);
        setReportCardMachines([]);
        if (report.id === "ip_advance") {
            setDateRange([dayjs(), dayjs()]);
            setSelectedFloor("all");
            setSelectedCompany("all");
        } else if (report.id === "admission_vs_discharge") {
            setSelectedOutlet("all");
            setSelectedCompany("all");
            setBillType("all");
        }
        if (["bill_wise", "credit_card", "cash_bills", "discount_bills", "department_wise", "bill_type_wise"].includes(report.id)) {
            setBillType("All");
        } else if (["sales_tax_register", "sales_tax_reg", "sales_return", "bill_cancel", "discharge_bills", "misc_payment", "insurance_advance", "admission_vs_discharge"].includes(report.id)) {
            setBillType("all");
        }
        setIsConfigModalVisible(true);
    };

    const handleCloseConfigModal = () => {
        setIsConfigModalVisible(false);
    };

    const handleGenerateReport = () => {
        setIsConfigModalVisible(false);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setActiveModalReport(null);
    };

    const handleNavigateFull = (reportOrRoute) => {
        const route = typeof reportOrRoute === "string" ? reportOrRoute : reportOrRoute?.fullPageRoute;
        const report = typeof reportOrRoute === "object" ? reportOrRoute : null;
        navigate(route, {
            state: {
                startDate: dateRange[0]?.format("YYYY-MM-DD"),
                endDate: dateRange[1]?.format("YYYY-MM-DD"),
                outlet: selectedOutlet,
                billType: billType,
                patientType: billType,
                category: billType,
                status: billType,
                floor: selectedFloor,
                company: selectedCompany,
                cardMachine: cardMachine,
                selectedCardMachine: cardMachine,
                defaultSourceType: report?.defaultSourceType,
                defaultTab: report?.defaultTab,
                lockedSourceType: report?.lockedSourceType,
                lockedTab: report?.lockedTab,
                title: report?.title,
            }
        });
    };

    const renderActiveModalContent = () => {
        if (!activeModalReport) return null;
        const Component = activeModalReport.component;
        const isNoOutlet = [
            "ip_advance", "discharge_detailed", "insurance_advance"
        ].includes(String(activeModalReport.id));
        return (
            <Suspense fallback={<div style={{ padding: "80px", textAlign: "center" }}><Spin size="large" /></div>}>
                <Component
                    key={`${activeModalReport.id}-${dateRange[0]?.format('YYYY-MM-DD')}-${dateRange[1]?.format('YYYY-MM-DD')}-${selectedOutlet}-${selectedFloor}-${selectedCompany}`}
                    isModalView={true}
                    startDate={dateRange[0]?.format("YYYY-MM-DD")}
                    endDate={dateRange[1]?.format("YYYY-MM-DD")}
                    initialStartDate={dateRange[0]?.format("YYYY-MM-DD")}
                    initialEndDate={dateRange[1]?.format("YYYY-MM-DD")}
                    outlet={isNoOutlet ? undefined : selectedOutlet}
                    initialOutlet={isNoOutlet ? undefined : selectedOutlet}
                    billType={billType}
                    initialBillType={billType}
                    category={billType}
                    patientType={billType}
                    status={billType}
                    initialStatus={billType}
                    department={billType}
                    initialDepartment={billType}
                    floor={selectedFloor}
                    initialFloor={selectedFloor}
                    company={selectedCompany}
                    initialCompany={selectedCompany}
                    cardMachine={cardMachine}
                    selectedCardMachine={cardMachine}
                    setCardMachine={setCardMachine}
                    setSelectedCardMachine={setCardMachine}
                    mode={billType}
                    paymentMode={billType}
                    defaultSourceType={activeModalReport.defaultSourceType}
                    defaultTab={activeModalReport.defaultTab}
                    lockedSourceType={activeModalReport.lockedSourceType}
                    lockedTab={activeModalReport.lockedTab}
                    title={activeModalReport.title}
                    onLoadOptions={handleLoadOptions}
                />
            </Suspense>
        );
    };

    return (
        <DashboardContainer>
            {/* Top Hero Banner */}
            <TopBanner>
                <div className="hero-text">
                    <h1>
                        Master Accounts Reports Dashboard
                        <span className="badge">100% RECONCILED</span>
                    </h1>
                    <p>
                        High-precision financial intelligence suite powered by the dedicated Master Accounts Ledger Engine.
                        Guarantees 100% mathematical tally across Cash, Electronic POS, Inpatient Advances, and General Ledgers.
                    </p>
                </div>
                <div className="kpi-pill">
                    <div className="item">
                        <div className="num">{reports.length}</div>
                        <div className="label">Active Reports</div>
                    </div>
                    <div className="divider" />
                    <div className="item">
                        <div className="num">6</div>
                        <div className="label">Ledger Clusters</div>
                    </div>
                    <div className="divider" />
                    <div className="item">
                        <div className="num">100%</div>
                        <div className="label">Shift Tallied</div>
                    </div>
                </div>
            </TopBanner>

            {/* Global Controls & Search Bar */}
            <ControlBar>
                <div className="filters-left">
                    <RangePicker
                        value={dateRange}
                        onChange={(val) => val && setDateRange(val)}
                        format="YYYY-MM-DD"
                        style={{ width: 260 }}
                    />
                    <Select
                        value={selectedOutlet}
                        onChange={setSelectedOutlet}
                        style={{ width: 200 }}
                    >
                        <Option value="all">All Outlets</Option>
                        {outletsList.map(o => (
                            <Option key={o.outlet_code} value={o.outlet_code}>
                                {o.outlet_name || o.outlet_code}
                            </Option>
                        ))}
                    </Select>
                </div>

                <div className="search-right">
                    <Input
                        placeholder="Search reports across clusters..."
                        prefix={<Search size={16} color="#94a3b8" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        allowClear
                    />
                </div>
            </ControlBar>

            {/* Cluster Navigation Tabs */}
            <ClusterTabs>
                <button
                    $active={selectedCluster === "all"}
                    onClick={() => setSelectedCluster("all")}
                >
                    All Reports ({reports.length})
                </button>
                <button
                    $active={selectedCluster === "core"}
                    onClick={() => setSelectedCluster("core")}
                >
                    Reconciliation Engine
                </button>
                <button
                    $active={selectedCluster === "shift_cash"}
                    onClick={() => setSelectedCluster("shift_cash")}
                >
                    Shift & Cash Collections
                </button>
                <button
                    $active={selectedCluster === "digital_dept"}
                    onClick={() => setSelectedCluster("digital_dept")}
                >
                    Digital POS & Departments
                </button>
                <button
                    $active={selectedCluster === "ip_advances"}
                    onClick={() => setSelectedCluster("ip_advances")}
                >
                    Inpatient & Advances
                </button>
                <button
                    $active={selectedCluster === "audit_sundry"}
                    onClick={() => setSelectedCluster("audit_sundry")}
                >
                    Auditing & Sundry Income
                </button>
                <button
                    $active={selectedCluster === "gst_taxes"}
                    onClick={() => setSelectedCluster("gst_taxes")}
                >
                    GST Returns & Taxation
                </button>
                <button
                    $active={selectedCluster === "stock_inventory"}
                    onClick={() => setSelectedCluster("stock_inventory")}
                >
                    Stock & Dispensary
                </button>
            </ClusterTabs>

            {/* Reports Cards Grid */}
            {filteredReports.length === 0 ? (
                <div style={{ padding: "60px 20px", textAlign: "center", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", margin: "20px 0" }}>
                    <ShieldCheck size={44} style={{ color: "#94a3b8", marginBottom: "12px" }} />
                    <h3 style={{ margin: "0 0 6px 0", color: "#1e293b", fontWeight: "700" }}>
                        {hasCustomConfig ? "No Reports Configured For Your Account" : "No Reports Found"}
                    </h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                        {hasCustomConfig 
                            ? "Please contact your hospital administrator to allocate Master Accounts reports to your employee profile in Report Configuration Master."
                            : "No reports matched your cluster tab or search query."}
                    </p>
                </div>
            ) : (
                <ReportsGrid>
                    {filteredReports.map((report) => (
                        <ReportCard key={report.id} $accent={report.color}>
                            <div>
                                <div className="card-top">
                                    <div className="icon-box">
                                        {report.icon}
                                    </div>
                                    <div className="info">
                                        <h3>{report.title}</h3>
                                        <div className="category-tag">
                                            <Tag color={report.color}>{report.category}</Tag>
                                        </div>
                                    </div>
                                </div>
                                <div className="description">
                                    {report.description}
                                </div>
                            </div>

                            <div className="card-actions">
                                <button
                                    className="btn-modal"
                                    onClick={() => handleOpenModal(report)}
                                >
                                    <FileText size={14} />
                                    Generate Report
                                </button>
                                <button
                                    className="btn-full"
                                    onClick={() => handleNavigateFull(report)}
                                    title="Open Full Page"
                                >
                                    <ExternalLink size={14} />
                                    Full Page
                                </button>
                            </div>
                        </ReportCard>
                    ))}
                </ReportsGrid>
            )}

            {/* Date & Filter Configuration Modal matching Accounts Dashboard */}
            <StyledConfigModal
                title={`Configure ${activeModalReport?.title || "Report"}`}
                open={isConfigModalVisible}
                onCancel={handleCloseConfigModal}
                footer={[
                    <Button 
                        key="cancel" 
                        onClick={handleCloseConfigModal} 
                        style={{ borderRadius: "8px", height: "38px", fontWeight: "600" }}
                    >
                        Cancel
                    </Button>,
                    <Button 
                        key="generate" 
                        type="primary" 
                        onClick={handleGenerateReport}
                        style={{ 
                            borderRadius: "8px", 
                            height: "38px", 
                            fontWeight: "700", 
                            background: activeModalReport?.color || "#0d9488", 
                            borderColor: activeModalReport?.color || "#0d9488" 
                        }}
                    >
                        View Report
                    </Button>
                ]}
                centered
                width={500}
                closable={false}
            >
                <DatePickerWrapper>
                    {activeModalReport?.id === "ip_advance" ? (
                        <div className="field-group">
                            <label>As on Date</label>
                            <DatePicker 
                                value={dateRange[1] || dayjs()} 
                                onChange={(date) => date && setDateRange([date, date])}
                                format="DD/MM/YYYY"
                                allowClear={false}
                            />
                        </div>
                    ) : (
                        <div className="field-row">
                            <div className="field-group">
                                <label>From Date</label>
                                <DatePicker 
                                    value={dateRange[0]} 
                                    onChange={(date) => date && setDateRange([date, dateRange[1]])}
                                    format="DD/MM/YYYY"
                                    allowClear={false}
                                />
                            </div>
                            <div className="field-group">
                                <label>To Date</label>
                                <DatePicker 
                                    value={dateRange[1]} 
                                    onChange={(date) => date && setDateRange([dateRange[0], date])}
                                    format="DD/MM/YYYY"
                                    allowClear={false}
                                />
                            </div>
                        </div>
                    )}

                    {!([
                        "ip_advance", "discharge_detailed", "insurance_advance"
                    ].includes(String(activeModalReport?.id))) && (
                        <div className="field-group" style={{ marginTop: "12px" }}>
                            <label>Outlet / Counter</label>
                            <select
                                value={selectedOutlet}
                                onChange={(e) => setSelectedOutlet(e.target.value)}
                            >
                                <option value="all">All Outlets</option>
                                {outletsList.map(o => (
                                    <option key={o.outlet_code || o.outlet_id || o.id} value={o.outlet_code || o.outlet_id}>
                                        {o.outlet_name || o.name || o.outlet_code} ({o.outlet_code || o.outlet_id})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {["bill_wise", "credit_card", "cash_bills", "discount_bills", "sales_tax_register", "sales_tax_reg", "daywise_sales_tax_register", "daywise_sales_tax", "collection_summary", "bill_cancel", "discharge_bills", "admission_vs_discharge", "misc_payment", "sales_return", "insurance_advance", "department_wise", "bill_type_wise"].includes(activeModalReport?.id) && (
                        <div className="field-group" style={{ marginTop: "12px" }}>
                            <label>
                                {activeModalReport?.id === "sales_tax_register" || activeModalReport?.id === "sales_tax_reg" ? "Patient Type" :
                                 activeModalReport?.id === "sales_return" ? "Return Type" :
                                 activeModalReport?.id === "admission_vs_discharge" ? "Inpatient Status" :
                                 activeModalReport?.id === "discharge_bills" ? "Payment Mode" :
                                 activeModalReport?.id === "bill_cancel" ? "Cancelled Bill Type" :
                                 activeModalReport?.id === "misc_payment" ? "Receipt Type" :
                                 activeModalReport?.id === "insurance_advance" ? "Insurance Company" :
                                 activeModalReport?.id === "department_wise" ? "Clinical Department" :
                                 "Bill Type / Category"}
                            </label>
                            <select
                                value={billType}
                                onChange={(e) => setBillType(e.target.value)}
                            >
                                {activeModalReport?.id === "department_wise" ? (
                                    <>
                                        <option value="All">All Departments</option>
                                        <option value="General">General</option>
                                        <option value="General Surgeon">General Surgeon</option>
                                        <option value="Consultants">Consultants</option>
                                        <option value="Medical Oncology">Medical Oncology</option>
                                        <option value="Cardiology">Cardiology</option>
                                        <option value="Surgical  Gastro">Surgical Gastro</option>
                                        <option value="General Medicine">General Medicine</option>
                                        <option value="Obstetrician & Gynaecology">Obstetrician & Gynaecology</option>
                                        <option value="Radiation Oncology">Radiation Oncology</option>
                                        <option value="PULMONOLOGY">Pulmonology</option>
                                        <option value="Master Health Checkup">Master Health Checkup</option>
                                    </>
                                ) : activeModalReport?.id === "insurance_advance" ? (
                                    <>
                                        <option value="all">All Insurance Companies</option>
                                        <option value="CGHS Credit">CGHS Credit</option>
                                        <option value="ECHS">ECHS</option>
                                        <option value="RAILWAY CTSE">Railway CTSE</option>
                                        <option value="RAILWAY">Railway</option>
                                        <option value="TNCMCHIS">TNCMCHIS</option>
                                        <option value="STAR HEALTH AND ALLIED INSURANCE">Star Health</option>
                                        <option value="MEDI ASSIST">Medi Assist</option>
                                        <option value="MEDI ASSIST- GOVT EMPLOYEE">Medi Assist Govt Employee</option>
                                        <option value="MD INDIA">MD India</option>
                                        <option value="UNITED HEALTHCARE">United HealthCare</option>
                                        <option value="CHOLA MS HELP">Chola MS</option>
                                        <option value="BAJAJ ALLIANZ & ALLIED INSURANCE">Bajaj Allianz</option>
                                        <option value="SELF PACKAGE">Self Package</option>
                                        <option value="TKT">TKT</option>
                                    </>
                                ) : activeModalReport?.id === "sales_tax_register" || activeModalReport?.id === "sales_tax_reg" || activeModalReport?.id === "daywise_sales_tax_register" || activeModalReport?.id === "daywise_sales_tax" ? (
                                    <>
                                        <option value="all">All Patients (OP & IP)</option>
                                        <option value="op">Out-Patient (OP)</option>
                                        <option value="ip">In-Patient (IP)</option>
                                    </>
                                ) : activeModalReport?.id === "sales_return" ? (
                                    <>
                                        <option value="all">All Returns (OP & IP)</option>
                                        <option value="op">OP Returns</option>
                                        <option value="ip">IP Returns</option>
                                    </>
                                ) : activeModalReport?.id === "bill_cancel" ? (
                                    <>
                                        <option value="all">All Cancelled Bills</option>
                                        <option value="discharge">Discharge Bills</option>
                                        <option value="advance">IP Advance</option>
                                        <option value="admission">IP Admission</option>
                                    </>
                                ) : activeModalReport?.id === "admission_vs_discharge" ? (
                                    <>
                                        <option value="all">All Inpatients</option>
                                        <option value="admitted">Currently Admitted</option>
                                        <option value="discharged">Discharged Patients</option>
                                    </>
                                ) : activeModalReport?.id === "discharge_bills" ? (
                                    <>
                                        <option value="all">All Payment Modes</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Card">Card</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Multiple Payment">Multiple Payment</option>
                                    </>
                                ) : activeModalReport?.id === "misc_payment" ? (
                                    <>
                                        <option value="all">All Vouchers</option>
                                        <option value="Receipt">Receipts Only</option>
                                        <option value="Payment">Payments & Expenses</option>
                                        <option value="Sales Return">Sales Returns Only</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="All">All {activeModalReport?.id === "admission_vs_discharge" ? "Patients" : activeModalReport?.id === "discharge_bills" ? "Modes" : activeModalReport?.id === "misc_payment" ? "Vouchers" : "Categories (All Bill Types)"}</option>
                                        {billTypesList && billTypesList.length > 0 && billTypesList.map((bt, idx) => (
                                            <option key={bt._id || bt.billTypeNo || idx} value={bt.bill_name || bt.bill_type}>
                                                {bt.bill_name} {bt.billTypeNo ? `(${bt.billTypeNo})` : ""}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>
                    )}

                    {activeModalReport?.id === "ip_advance" && (
                        <>
                            <div className="field-group" style={{ marginTop: "12px" }}>
                                <label>Floor / Ward</label>
                                <select
                                    value={selectedFloor}
                                    onChange={(e) => setSelectedFloor(e.target.value)}
                                >
                                    <option value="all">All Floors</option>
                                    <option value="1ST FLOOR">1ST FLOOR</option>
                                    <option value="2ND FLOOR">2ND FLOOR</option>
                                    <option value="3RD FLOOR">3RD FLOOR</option>
                                    <option value="MICU">MICU</option>
                                    <option value="CHEMO">CHEMO</option>
                                    <option value="DAYCAR">DAYCAR</option>
                                    <option value="DIALYSIS">DIALYSIS</option>
                                </select>
                            </div>
                            <div className="field-group" style={{ marginTop: "12px" }}>
                                <label>Company / TPA</label>
                                <select
                                    value={selectedCompany}
                                    onChange={(e) => setSelectedCompany(e.target.value)}
                                >
                                    <option value="all">All Companies</option>
                                    <option value="GENERAL">GENERAL</option>
                                    <option value="STAR HEALTH AND ALLIED INSURANCE LTD">STAR HEALTH</option>
                                    <option value="MEDI ASSIST">MEDI ASSIST</option>
                                    <option value="CGHS CREDIT">CGHS CREDIT</option>
                                    <option value="ECHS">ECHS</option>
                                    <option value="RAILWAY CTSE">RAILWAY CTSE</option>
                                    <option value="TNCMCHIS">TNCMCHIS</option>
                                    <option value="ESI">ESI</option>
                                    <option value="ESIC">ESIC</option>
                                    <option value="FOOD CORPORATION OF INDIA (FCI),">FCI</option>
                                    <option value="TKT">TKT</option>
                                    <option value="SELF PACKAGE">SELF PACKAGE</option>
                                    <option value="VIDAL HEALTH">VIDAL HEALTH</option>
                                </select>
                            </div>
                        </>
                    )}

                    {activeModalReport?.id === "admission_vs_discharge" && (
                        <div className="field-group" style={{ marginTop: "12px" }}>
                            <label>Company / Corporate</label>
                            <select
                                value={selectedCompany}
                                onChange={(e) => setSelectedCompany(e.target.value)}
                            >
                                <option value="all">All Companies</option>
                                <option value="Cash / Self">Cash / Self</option>
                                <option value="STAR HEALTH AND ALLIED INSURANCE LTD">STAR HEALTH</option>
                                <option value="MEDI ASSIST">MEDI ASSIST</option>
                                <option value="CGHS CREDIT">CGHS CREDIT</option>
                                <option value="ECHS">ECHS</option>
                                <option value="RAILWAY CTSE">RAILWAY CTSE</option>
                                <option value="TNCMCHIS">TNCMCHIS</option>
                                <option value="ESI">ESI</option>
                                <option value="ESIC">ESIC</option>
                                <option value="MD INDIA">MD INDIA</option>
                                <option value="UNITED HEALTHCARE">UNITED HEALTHCARE</option>
                                <option value="CHOLA MS HELP">CHOLA MS</option>
                                <option value="BAJAJ ALLIANZ & ALLIED INSURANCE">BAJAJ ALLIANZ</option>
                                <option value="FOOD CORPORATION OF INDIA (FCI),">FCI</option>
                                <option value="TKT">TKT</option>
                                <option value="SELF PACKAGE">SELF PACKAGE</option>
                                <option value="VIDAL HEALTH">VIDAL HEALTH</option>
                            </select>
                        </div>
                    )}

                    {["bill_wise", "credit_card", "cashier_wise_detailed", "cash_bills", "discharge_bills", "advance_reg", "unified_accounts", "shift_basis", "accounts_ledger"].includes(activeModalReport?.id) && (
                        <div className="field-group" style={{ marginTop: "12px" }}>
                            <label>Card Machine</label>
                            <select
                                value={cardMachine}
                                onChange={(e) => setCardMachine(e.target.value)}
                            >
                                <option value="all">All Machines</option>
                                {(reportCardMachines.length > 0 ? reportCardMachines : ["Paytm", "PNB", "Bajaj", "360 POS", "POS"]).map((m, idx) => (
                                    <option key={`${m}-${idx}`} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="info-note">
                        * The report will be generated for the period between {dateRange[0] ? dateRange[0].format('DD/MM/YYYY') : '—'} and {dateRange[1] ? dateRange[1].format('DD/MM/YYYY') : '—'}.
                    </div>
                </DatePickerWrapper>
            </StyledConfigModal>

            {/* Report Viewer Modal powered by A4MultiPageViewer */}
            <ReportModal
                title={null}
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                width={isMaximized ? "99vw" : "94vw"}
                style={isMaximized ? { top: 5, padding: 0 } : { top: 20 }}
                centered={!isMaximized}
                destroyOnHidden
                closable={false}
                $isMaximized={isMaximized}
            >
                <A4MultiPageViewer
                    selectedReport={activeModalReport}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    billType={billType}
                    setBillType={setBillType}
                    outlets={outletsList}
                    selectedOutlet={selectedOutlet}
                    setSelectedOutlet={setSelectedOutlet}
                    selectedFloor={selectedFloor}
                    setSelectedFloor={setSelectedFloor}
                    selectedCompany={selectedCompany}
                    setSelectedCompany={setSelectedCompany}
                    cardMachine={cardMachine}
                    setCardMachine={setCardMachine}
                    selectedCardMachine={cardMachine}
                    setSelectedCardMachine={setCardMachine}
                    availableCategories={
                        reportCategories.length > 0
                            ? reportCategories
                            : (billTypesList || []).map(b => b.bill_name || b.bill_type).filter(Boolean)
                    }
                    availableCardMachines={
                        reportCardMachines.length > 0
                            ? reportCardMachines
                            : ["Paytm", "PNB", "Bajaj", "360 POS", "POS"]
                    }
                    isMaximized={isMaximized}
                    setIsMaximized={setIsMaximized}
                    onClose={handleCloseModal}
                >
                    {renderActiveModalContent()}
                </A4MultiPageViewer>
            </ReportModal>
        </DashboardContainer>
    );
};

export default MasterAccountsDashboard;
