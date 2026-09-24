import React, { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
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
    History,
    Percent,
    Package,
    Search,
    Inbox,
    Building2,
    X,
    RotateCcw
} from "lucide-react";
import styled from "styled-components";
import { Modal, DatePicker, Button, Spin } from "antd";
import dayjs from "dayjs";
import { colors, PageWrapper, fadeIn, FormRow, InputWrapper, Label, Select } from "../GlobalStyles";
import A4MultiPageViewer from "./A4MultiPageViewer";

// Lazy load report components for performance
const BillWiseReport = lazy(() => import("../Accounts/BillWiseReport"));
const CashierWiseReport = lazy(() => import("../Accounts/CashierWiseReport"));
const CashierWiseDetailedReport = lazy(() => import("../Accounts/CashierWiseDetailedReport"));
const ShiftBasisReport = lazy(() => import("../Accounts/ShiftBasisReport"));
const IPAdvanceReport = lazy(() => import("../Accounts/IPAdvanceReport"));
const DischargeBills = lazy(() => import("../Accounts/DischargeBills"));
const DischargeBillsDetailed = lazy(() => import("../Accounts/DischargeBillsDetailed"));
const AdvanceRegistration = lazy(() => import("../Accounts/AdvanceRegistration"));
const AdvanceRegistrationInsurence = lazy(() => import("../Accounts/AdvanceRegistrationInsurence"));
const BillCancelReport = lazy(() => import("../Accounts/BillCancelReport"));
const CreditCardReport = lazy(() => import("../Accounts/CreditCardReport"));
const CashBillsReport = lazy(() => import("../Accounts/CashBillsReport"));
const DatewiseCollectionSummary = lazy(() => import("../Accounts/DatewiseCollectionSummary"));
const MiscellaneousPaymentReport = lazy(() => import("../Accounts/MiscellaneousPaymentReport"));
const DailyCashReport = lazy(() => import("../Accounts/DailyCashReport"));
const DebitBillsReport = lazy(() => import("../Accounts/DebitBillsReport"));
const AuditReport = lazy(() => import("../Accounts/AuditReport"));
const SalesTaxRegister = lazy(() => import("../Accounts/SalesTaxRegister"));
const DaywiseSalesTaxRegister = lazy(() => import("../Accounts/DaywiseSalesTaxRegister"));
const StockReportIpOp = lazy(() => import("../Accounts/StockReportIpOp"));
const DepartmentWiseReport = lazy(() => import("../Accounts/DepartmentWiseReport"));
const DiscountBillsReport = lazy(() => import("../Accounts/DiscountBillsReport"));

const Container = styled(PageWrapper)`

  min-height: 100vh;
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: ${fadeIn} 0.5s ease-out;

  .title-section {
    h1 {
      font-size: 1.875rem;
      font-weight: 800;
      color: ${colors.textMain};
      margin: 0;
      letter-spacing: -0.025em;
    }
    p {
      color: ${colors.textMuted};
      margin-top: 4px;
      font-size: 1rem;
    }
  }
`;

const SearchBox = styled.div`
  position: relative;
  width: 320px;
  max-width: 100%;

  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${colors.textMuted};
  }

  input {
    width: 100%;
    height: 44px;
    border-radius: 12px;
    border: 1px solid ${colors.border};
    background: ${colors.surface};
    padding: 0 14px 0 40px;
    font-size: 0.9rem;
    font-weight: 500;
    color: ${colors.textMain};
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
    }
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const NoResults = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  color: ${colors.textMuted};
  grid-column: 1 / -1;

  svg { margin-bottom: 14px; opacity: 0.5; }
  .title { font-weight: 700; color: ${colors.textMain}; font-size: 1.05rem; margin-bottom: 6px; }
  .sub { font-size: 0.88rem; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const ReportCard = styled.div`
  background: ${colors.surface};
  border-radius: 12px;
  padding: 20px;
  border: 1px solid ${colors.border};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: ${props => props.color || colors.primary};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: ${props => props.color || colors.primary};

    &::before {
      opacity: 1;
    }

    .icon-wrapper {
      background: ${colors.tabBg};
      color: ${colors.primary};
      transform: scale(1.1);
    }

    .arrow-icon {
      transform: translateX(5px);
      opacity: 1;
    }
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: ${colors.background};
    color: ${colors.textMuted};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .content {
    h3 {
      font-size: 1.125rem;
      font-weight: 700;
      color: ${colors.textMain};
      margin: 0;
    }
    p {
      font-size: 0.875rem;
      color: ${colors.textMuted};
      margin-top: 6px;
      line-height: 1.5;
    }
  }

  .footer {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .view-text {
      font-size: 0.875rem;
      font-weight: 600;
      color: ${props => props.color || colors.primary};
    }

    .arrow-icon {
      color: ${props => props.color || colors.primary};
      opacity: 0.5;
      transition: all 0.3s ease;
    }
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 24px;
    overflow: hidden;
    padding: 0;
  }
  
  .ant-modal-header {
    padding: 24px 32px;
    border-bottom: 1px solid ${colors.background};
    margin: 0;
  }

  .ant-modal-title {
    font-size: 1.25rem;
    font-weight: 800;
    color: ${colors.textMain};
  }

  .ant-modal-body {
    padding: 32px;
  }

  .ant-modal-footer {
    padding: 20px 32px;
    border-top: 1px solid ${colors.background};
  }
`;

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

const ModalOutlineHeader = styled.div`
    background: #176B87;
    color: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    height: 42px;
    user-select: none;
    box-sizing: border-box;

    .title-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .print-title {
            font-size: 1.05rem;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: 0.02em;
        }

        .doc-subtitle {
            font-size: 0.82rem;
            color: rgba(255, 255, 255, 0.85);
            font-weight: 500;
            border-left: 1px solid rgba(255, 255, 255, 0.3);
            padding-left: 10px;
            max-width: 450px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .actions-right {
        display: flex;
        align-items: center;
        gap: 8px;

        .icon-btn {
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            border-radius: 4px;
            height: 28px;
            min-width: 28px;
            padding: 0 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;

            &:hover {
                background: rgba(255, 255, 255, 0.25);
            }

            &.excel {
                background: #16a34a;
                border-color: #16a34a;
                font-weight: 800;
                font-size: 11px;
                &:hover { background: #15803d; }
            }

            &.word {
                background: #2563eb;
                border-color: #2563eb;
                font-weight: 800;
                font-size: 11px;
                &:hover { background: #1d4ed8; }
            }

            &.close {
                background: rgba(239, 68, 68, 0.85);
                border-color: transparent;
                &:hover { background: #dc2626; }
            }
        }
    }
`;

const ViewerToolbar = styled.div`
    background: #323639;
    color: #e2e8f0;
    height: 38px;
    border-bottom: 1px solid #202224;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    font-size: 0.82rem;
    user-select: none;
    box-sizing: border-box;

    .toolbar-left {
        display: flex;
        align-items: center;
        gap: 10px;

        .doc-uuid {
            font-family: monospace;
            font-size: 0.78rem;
            color: #cbd5e1;
            max-width: 240px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .toolbar-center {
        display: flex;
        align-items: center;
        gap: 12px;

        .page-counter {
            font-size: 0.8rem;
            color: #e2e8f0;
            background: #202224;
            padding: 2px 10px;
            border-radius: 4px;
        }

        .zoom-group {
            display: flex;
            align-items: center;
            background: #202224;
            border-radius: 4px;
            overflow: hidden;

            button {
                background: transparent;
                border: none;
                color: #fff;
                padding: 3px 8px;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.85rem;
                &:hover { background: #404448; }
            }

            .zoom-val {
                padding: 0 6px;
                font-size: 0.78rem;
                color: #e2e8f0;
            }
        }

        .tool-btn {
            background: transparent;
            border: none;
            color: #cbd5e1;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            &:hover { background: #404448; color: #fff; }
        }
    }

    .toolbar-right {
        display: flex;
        align-items: center;
        gap: 8px;

        .tool-btn {
            background: transparent;
            border: none;
            color: #cbd5e1;
            padding: 5px 8px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            &:hover { background: #404448; color: #fff; }
        }
    }
`;

const ViewerWorkspace = styled.div`
    background: #525659;
    flex: 1;
    overflow-y: auto;
    overflow-x: auto;
    display: flex;
    position: relative;
`;

const ThumbnailsSidebar = styled.div`
    width: 140px;
    background: #323639;
    border-right: 1px solid #202224;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    flex-shrink: 0;

    .thumbnail-card {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .thumb-preview {
            width: 100px;
            height: 130px;
            background: #ffffff;
            border-radius: 2px;
            border: 2px solid transparent;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            padding: 8px 6px;
            display: flex;
            flex-direction: column;
            gap: 4px;

            .thumb-line {
                height: 3px;
                background: #cbd5e1;
                border-radius: 1px;
                width: 100%;

                &.header {
                    height: 5px;
                    background: #94a3b8;
                    width: 70%;
                    margin: 0 auto 4px auto;
                }
            }
        }

        &.active .thumb-preview {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
        }

        .thumb-num {
            font-size: 0.72rem;
            color: #cbd5e1;
            font-weight: 600;
        }
    }
`;

const PaperCanvasArea = styled.div`
    flex: 1;
    padding: 24px;
    display: flex;
    justify-content: center;
    overflow: auto;

    .modal-document-paper {
        background: #ffffff;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
        padding: 32px 40px;
        width: 100%;
        max-width: 1200px;
        min-height: 800px;
        box-sizing: border-box;
        transition: transform 0.2s ease-out;

        /* Strip inner backgrounds and outer margins/paddings */
        & > div {
            background: transparent !important;
            padding: 0 !important;
            box-shadow: none !important;
        }

        /* Hide inside filter controls and action bars in paper view */
        .no-print {
            display: none !important;
        }

        /* Formal Document Print Table Template */
        table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            font-size: 10px !important;
            color: #000 !important;
            margin-top: 10px !important;
            border: none !important;
        }

        thead tr,
        table thead tr {
            border-top: 1.5px solid #000 !important;
            border-bottom: 1.5px solid #000 !important;
            background: transparent !important;
        }

        th {
            background: transparent !important;
            color: #000 !important;
            font-weight: 700 !important;
            font-size: 9.5px !important;
            text-transform: uppercase !important;
            padding: 6px 5px !important;
            border: none !important;
            border-bottom: 1.5px solid #000 !important;
            border-top: 1.5px solid #000 !important;
            letter-spacing: 0.02em !important;
            white-space: nowrap !important;
        }

        td {
            color: #000 !important;
            font-size: 10px !important;
            padding: 4px 5px !important;
            border: none !important;
            border-bottom: 0.5px solid #f1f5f9 !important;
        }

        tbody tr:hover {
            background: #f8fafc !important;
        }

        /* Group headers & Subtotals */
        tbody tr[class*="DateGroup"] td,
        tbody tr[class*="date-group"] td {
            background: transparent !important;
            font-weight: 700 !important;
            font-size: 10.5px !important;
            padding: 7px 5px 3px 5px !important;
            color: #000 !important;
            border: none !important;
        }

        tbody tr[class*="Subtotal"] td,
        tbody tr[class*="subtotal"] td {
            font-weight: 700 !important;
            color: #000 !important;
            border-top: 1px solid #cbd5e1 !important;
            border-bottom: 1px solid #94a3b8 !important;
            background: transparent !important;
        }

        tfoot tr,
        table tfoot tr,
        tbody tr[class*="GrandTotal"] {
            border-top: 1.5px solid #000 !important;
            border-bottom: 2.5px double #000 !important;
            background: transparent !important;
            font-weight: bold !important;
        }

        tfoot td,
        tbody tr[class*="GrandTotal"] td {
            font-weight: 800 !important;
            color: #000 !important;
            border: none !important;
            border-top: 1.5px solid #000 !important;
            border-bottom: 2.5px double #000 !important;
            padding: 6px 5px !important;
        }
    }
`;

const DatePickerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  label {
    font-size: 0.875rem;
    font-weight: 700;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .ant-picker {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid ${colors.border};

    &:hover, &.ant-picker-focused {
      border-color: ${colors.primary};
    }
  }
`;

const ReportsDashboard = () => {
    const navigate = useNavigate();
    const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
    const [billType, setBillType] = useState("All");
    const [outlets, setOutlets] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [isMaximized, setIsMaximized] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const res = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
                if (res.success && Array.isArray(res.data)) {
                    setOutlets(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch outlets:", err);
            }
        };
        fetchOutlets();
    }, [HmsBaseUrl]);

    const closeModal = () => {
        setIsConfigModalVisible(false);
        setIsReportModalVisible(false);
    };

    const reportsList = [
        {
            id: "bill_wise",
            title: "Detailed Bill Report",
            description: "Detailed breakdown of all bills generated across departments",
            icon: <FileText size={24} />,
            component: BillWiseReport,
            color: colors.primary
        },
        {
            id: "cashier_wise",
            title: "Cashier Wise Report",
            description: "Collection summary grouped by individual cashiers",
            icon: <Users size={24} />,
            component: CashierWiseReport,
            color: colors.primary
        },
        {
            id: "cashier_detailed",
            title: "Cashier Wise Detailed",
            description: "Full transaction list for in-depth cashier auditing",
            icon: <ClipboardList size={24} />,
            component: CashierWiseDetailedReport,
            color: colors.primary
        },
        {
            id: "shift_basis",
            title: "Shift Basis Report",
            description: "Financial reports summarized by individual work shifts",
            icon: <Clock size={24} />,
            component: ShiftBasisReport,
            color: colors.primary
        },
        {
            id: "ip_advance",
            title: "IP Advance Report",
            description: "Tracking of all in-patient advances and deposits",
            icon: <CreditCard size={24} />,
            component: IPAdvanceReport,
            color: colors.primary
        },
        {
            id: "discharge_bills",
            title: "Cash Discharge Report",
            description: "Discharged patient settlement bills (Cash / Self-paying)",
            icon: <TrendingUp size={24} />,
            component: DischargeBills,
            color: colors.primary
        },
        {
            id: "discharge_detailed",
            title: "Discharge Detailed",
            description: "Itemized view of discharge bill components",
            icon: <BarChart3 size={24} />,
            component: DischargeBillsDetailed,
            color: colors.primary
        },
        {
            id: "advance_reg",
            title: "Advance Register (Accounts)",
            description: "Daily IP advance register grouped by date with Cash/Credit breakdown",
            icon: <UserCheck size={24} />,
            component: AdvanceRegistration,
            color: colors.primary
        },
        {
            id: "insurance_advance",
            title: "Insurance Discharge Report",
            description: "Insurance Bills Status Report grouped by TPA/Company with 25-column audit",
            icon: <ShieldCheck size={24} />,
            component: AdvanceRegistrationInsurence,
            color: colors.primary
        },
        {
            id: "bill_cancel",
            title: "Bill Cancel Report",
            description: "List of all cancelled bills and IP advances with patient details",
            icon: <X size={24} />,
            component: BillCancelReport,
            color: colors.primary
        },
        {
            id: "pharmacy_expiry",
            title: "Pharmacy Expiry Report",
            description: "Analyze stock expiry dates, track upcoming batch expiries, and export sheets",
            icon: <ClipboardList size={24} />,
            path: "/PharmacyExpiryReport",
            color: colors.primary
        },
        {
            id: "sales_return",
            title: "Sales Return Report",
            description: "IP and OP pharmacy sales returns with patient, doctor, and item details",
            icon: <RotateCcw size={24} />,
            path: "/SalesReturnReport",
            color: colors.primary
        },
        {
            id: "credit_card",
            title: "Credit Card Report",
            description: "Card-mode collections across Registration (OP), Pharmacy, and Discharge billing",
            icon: <CreditCard size={24} />,
            component: CreditCardReport,
            color: colors.primary
        },
        {
            id: "cash_bills",
            title: "Cash Bills Report",
            description: "Cash-mode collections across Registration, Pharmacy (OP/IP), Discharge, and Investigations",
            icon: <Banknote size={24} />,
            component: CashBillsReport,
            color: colors.primary
        },
        {
            id: "department_wise",
            title: "Department Wise Report",
            description: "Financial & patient volume report summarized by hospital departments",
            icon: <Building2 size={24} />,
            component: DepartmentWiseReport,
            color: colors.primary
        },
        {
            id: "datewise_collection",
            title: "Date-wise Collection Summary",
            description: "Hospital-wide daily collection totals across every billing department",
            icon: <Calendar size={24} />,
            component: DatewiseCollectionSummary,
            color: colors.primary
        },
        {
            id: "misc_payment",
            title: "Miscellaneous Payment Report",
            description: "Receipt & Payment vouchers posted against any account head",
            icon: <Wallet size={24} />,
            component: MiscellaneousPaymentReport,
            color: colors.primary
        },
        {
            id: "daily_cash",
            title: "A/c Papers — Daily Cash Report",
            description: "Cash Book: daily cash in/out across Registration, Pharmacy, Discharge & vouchers",
            icon: <Banknote size={24} />,
            component: DailyCashReport,
            color: colors.primary
        },
        {
            id: "debit_bills",
            title: "Debit Bills Report",
            description: "Bill edits that increased the billed amount",
            icon: <MinusCircle size={24} />,
            component: DebitBillsReport,
            color: colors.primary
        },
        {
            id: "audit_report",
            title: "Audit Report (Edit View)",
            description: "Cross-record edit trail across Registration, Pharmacy, Sales Return & Investigation billing",
            icon: <History size={24} />,
            component: AuditReport,
            color: colors.primary
        },
        {
            id: "sales_tax_register",
            title: "Sales Tax Register (GST)",
            description: "Rate-wise GST register for pharmacy OP/IP sales and returns (approximate)",
            icon: <Percent size={24} />,
            component: SalesTaxRegister,
            color: colors.primary
        },
        {
            id: "daywise_sales_tax_register",
            title: "Day-wise Sales Tax Register (GST)",
            description: "Daily rate-wise GST register (Exempted, 5%, 12%, 18%, 28%) with multi-column breakdown",
            icon: <Percent size={24} />,
            component: DaywiseSalesTaxRegister,
            color: colors.primary
        },
        {
            id: "stock_report_ip_op",
            title: "Stock Report — IP vs OP",
            description: "Pharmacy consumption split by IP and OP bills, item-wise",
            icon: <Package size={24} />,
            component: StockReportIpOp,
            color: colors.primary
        },
        {
            id: "discount_bills",
            title: "Discount Bills Report",
            description: "Concession & discount register across Pharmacy (OP/IP), Investigation, Discharge, and Registration",
            icon: <Percent size={24} />,
            component: DiscountBillsReport,
            color: colors.primary
        }
    ];

    const filteredReports = reportsList.filter(report => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return report.title.toLowerCase().includes(term) || report.description.toLowerCase().includes(term);
    });

    const handleCardClick = (report) => {
        if (report.path) {
            navigate(report.path);
        } else {
            setSelectedReport(report);
            if (report.id === "bill_wise" || report.id === "credit_card" || report.id === "cash_bills" || report.id === "discount_bills") {
                setBillType("All");
            }
            setIsConfigModalVisible(true);
        }
    };

    const handleGenerateReport = () => {
        setIsConfigModalVisible(false);
        setIsReportModalVisible(true);
    };

    const renderSelectedReport = () => {
        if (!selectedReport) return null;
        const ReportComponent = selectedReport.component;
        
        const isNoOutletReport = ["ip_advance", "discharge_detailed", "advance_reg", "insurance_advance"].includes(selectedReport?.id);

        return (
            <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}><Spin size="large" /></div>}>
                <ReportComponent 
                    key={`${selectedReport.id}-${dateRange[0]?.format('YYYY-MM-DD')}-${dateRange[1]?.format('YYYY-MM-DD')}-${selectedOutlet}-${billType}`}
                    isModalView={true} 
                    startDate={dateRange[0].format("YYYY-MM-DD")}
                    endDate={dateRange[1].format("YYYY-MM-DD")}
                    initialStartDate={dateRange[0].format("YYYY-MM-DD")}
                    initialEndDate={dateRange[1].format("YYYY-MM-DD")}
                    initialBillType={billType}
                    billType={billType}
                    category={billType}
                    patientType={billType}
                    initialOutlet={isNoOutletReport ? undefined : selectedOutlet}
                    outlet={isNoOutletReport ? undefined : selectedOutlet}
                />
            </Suspense>
        );
    };

    return (
        <Container>
            <Header>
                <div className="title-section">
                    <h1>Accounts Reports Dashboard</h1>
                    <p>Select a report to view detailed financial analytics</p>
                </div>
                <SearchBox>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchBox>
            </Header>

            <Grid>
                {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                        <ReportCard
                            key={report.id}
                            color={report.color}
                            onClick={() => handleCardClick(report)}
                        >
                            <div className="icon-wrapper">
                                {report.icon}
                            </div>
                            <div className="content">
                                <h3>{report.title}</h3>
                                <p>{report.description}</p>
                            </div>
                            <div className="footer">
                                <span className="view-text">{report.path ? "Open Report" : "Generate Report"}</span>
                                <ArrowRight className="arrow-icon" size={18} />
                            </div>
                        </ReportCard>
                    ))
                ) : (
                    <NoResults>
                        <Inbox size={48} />
                        <div className="title">No reports found</div>
                        <div className="sub">Try a different search term.</div>
                    </NoResults>
                )}
            </Grid>

            {/* Date Configuration Modal */}
            <StyledModal
                title={`Configure ${selectedReport?.title}`}
                open={isConfigModalVisible}
                onCancel={closeModal}
                footer={[
                    <Button key="back" onClick={closeModal} style={{ borderRadius: '8px' }}>
                        Cancel
                    </Button>,
                    <Button 
                        key="submit" 
                        type="primary" 
                        onClick={handleGenerateReport}
                        style={{ borderRadius: '8px', background: selectedReport?.color, borderColor: selectedReport?.color }}
                    >
                        View Report
                    </Button>,
                ]}
                centered
                width={500}
                closable={false}
            >
                <DatePickerWrapper>
                    <FormRow>
                        <InputWrapper>
                            <Label>From Date</Label>
                            <DatePicker 
                                value={dateRange[0]} 
                                onChange={(date) => date && setDateRange([date, dateRange[1]])}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ width: '100%', borderRadius: '8px', padding: '10px 12px' }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>To Date</Label>
                            <DatePicker 
                                value={dateRange[1]} 
                                onChange={(date) => date && setDateRange([dateRange[0], date])}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ width: '100%', borderRadius: '8px', padding: '10px 12px' }}
                            />
                        </InputWrapper>
                    </FormRow>

                    {!["ip_advance", "discharge_detailed", "advance_reg", "insurance_advance"].includes(selectedReport?.id) && (
                        <FormRow style={{ marginTop: '16px' }}>
                            <InputWrapper style={{ width: '100%' }}>
                                <Label>Outlet / Counter</Label>
                                <Select
                                    value={selectedOutlet}
                                    onChange={(e) => setSelectedOutlet(e.target.value)}
                                    style={{ width: '100%', borderRadius: '8px', height: '42px' }}
                                >
                                    <option value="all">All Outlets</option>
                                    {outlets.map((o) => (
                                        <option key={o.outlet_code || o.outlet_id || o.id} value={o.outlet_code || o.outlet_id}>
                                            {o.outlet_name || o.name} ({o.outlet_code || o.outlet_id})
                                        </option>
                                    ))}
                                </Select>
                            </InputWrapper>
                        </FormRow>
                    )}

                    {["bill_wise", "credit_card", "cash_bills", "discount_bills", "sales_tax_reg", "daywise_sales_tax", "collection_summary", "bill_cancel", "discharge_bills", "misc_payment"].includes(selectedReport?.id) && (
                        <FormRow style={{ marginTop: '16px' }}>
                            <InputWrapper style={{ width: '100%' }}>
                                <Label>
                                    {selectedReport?.id === "sales_tax_reg" || selectedReport?.id === "daywise_sales_tax" ? "Patient Type" :
                                     selectedReport?.id === "discharge_bills" ? "Payment Mode" :
                                     selectedReport?.id === "misc_payment" ? "Receipt Type" :
                                     "Bill Type / Category"}
                                </Label>
                                <Select
                                    value={billType}
                                    onChange={(e) => setBillType(e.target.value)}
                                    style={{ width: '100%', borderRadius: '8px', height: '42px' }}
                                >
                                    {selectedReport?.id === "sales_tax_reg" || selectedReport?.id === "daywise_sales_tax" ? (
                                        <>
                                            <option value="all">All Patients (OP & IP)</option>
                                            <option value="op">Out-Patient (OP)</option>
                                            <option value="ip">In-Patient (IP)</option>
                                        </>
                                    ) : selectedReport?.id === "bill_cancel" ? (
                                        <>
                                            <option value="all">All Cancelled Bills</option>
                                            <option value="discharge">Discharge Bills</option>
                                            <option value="advance">IP Advance</option>
                                            <option value="admission">IP Admission</option>
                                        </>
                                    ) : selectedReport?.id === "discharge_bills" ? (
                                        <>
                                            <option value="all">All Payment Modes</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Card">Card</option>
                                            <option value="Cheque">Cheque</option>
                                            <option value="Multiple Payment">Multiple Payment</option>
                                        </>
                                    ) : selectedReport?.id === "misc_payment" ? (
                                        <>
                                            <option value="all">All Receipt Types</option>
                                            <option value="cash">Cash Receipts</option>
                                            <option value="bank">Bank / Online Receipts</option>
                                        </>
                                    ) : selectedReport?.id === "discount_bills" ? (
                                        <>
                                            <option value="All">All Categories</option>
                                            <option value="PHARMACY OP BILL (SH)">Pharmacy OP Bill (SH)</option>
                                            <option value="PHARMACY IP BILL (SH)">Pharmacy IP Bill (SH)</option>
                                            <option value="DISCHARGE BILL">Discharge Bill</option>
                                            <option value="LAB BILL (SH)">Lab Bill (SH)</option>
                                            <option value="CT SCAN (SH)">CT Scan (SH)</option>
                                            <option value="SCANNING (SH)">Scanning (SH)</option>
                                            <option value="X - RAY (SH)">X-Ray (SH)</option>
                                            <option value="ECG (SH)">ECG (SH)</option>
                                            <option value="PET_CT(SH)">PET CT (SH)</option>
                                            <option value="PROCEDURE BILL (SH)">Procedure Bill (SH)</option>
                                        </>
                                    ) : (selectedReport?.id === "credit_card" || selectedReport?.id === "cash_bills") ? (
                                        <>
                                            <option value="All">All Categories (All Bill Types)</option>
                                            <option value="PHARMACY OP BILL (SH)">Pharmacy OP Bill (SH)</option>
                                            <option value="PHARMACY IP BILL (SH)">Pharmacy IP Bill (SH)</option>
                                            <option value="ADVANCE">Advance (IP)</option>
                                            <option value="DISCHARGE">Discharge Bill</option>
                                            <option value="REGISTRATION(SH)">Registration (OP)</option>
                                            <option value="CT SCAN (SH)">CT Scan (SH)</option>
                                            <option value="ECG (SH)">ECG (SH)</option>
                                            <option value="LAB BILL (SH)">Lab Bill (SH)</option>
                                            <option value="PET_CT(SH)">PET CT (SH)</option>
                                            <option value="PROCEDURE BILL (SH)">Procedure Bill (SH)</option>
                                            <option value="SCANNING (SH)">Scanning (SH)</option>
                                            <option value="X - RAY (SH)">X-Ray (SH)</option>
                                            <option value="XEROX (SH)">Xerox (SH)</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="All">All Types</option>
                                            <option value="Registration">Registration</option>
                                            <option value="Investigation">Investigation</option>
                                            <option value="Pharmacy">Pharmacy</option>
                                            <option value="Discharge">Discharge</option>
                                            <option value="IP Advance">IP Advance</option>
                                            <option value="Admission">Admission</option>
                                            <option value="Sales Return">Sales Return</option>
                                            <option value="Miscellaneous">Miscellaneous Payment</option>
                                        </>
                                    )}
                                </Select>
                            </InputWrapper>
                        </FormRow>
                    )}

                    <p style={{ color: colors.textMuted, fontSize: '0.75rem', marginTop: '12px' }}>
                        * The report will be generated for the period between {dateRange[0] ? dateRange[0].format('DD/MM/YYYY') : '—'} and {dateRange[1] ? dateRange[1].format('DD/MM/YYYY') : '—'}.
                    </p>
                </DatePickerWrapper>
            </StyledModal>

            {/* Full Report Display Outline Modal */}
            <ReportModal
                title={null}
                open={isReportModalVisible}
                onCancel={closeModal}
                footer={null}
                width={isMaximized ? "99vw" : "94vw"}
                style={isMaximized ? { top: 5, padding: 0 } : { top: 20 }}
                centered={!isMaximized}
                destroyOnHidden
                closable={false}
                $isMaximized={isMaximized}
            >
                <A4MultiPageViewer
                    selectedReport={selectedReport}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    billType={billType}
                    setBillType={setBillType}
                    outlets={outlets}
                    selectedOutlet={selectedOutlet}
                    setSelectedOutlet={setSelectedOutlet}
                    isMaximized={isMaximized}
                    setIsMaximized={setIsMaximized}
                    onClose={closeModal}
                >
                    {renderSelectedReport()}
                </A4MultiPageViewer>
            </ReportModal>
        </Container>
    );
};

export default ReportsDashboard;
