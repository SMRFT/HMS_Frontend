import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RotateCcw,
    TrendingUp,
    Layers,
    Building2,
    Clock,
    AlertTriangle,
    AlertCircle,
    Grid as GridIcon,
    ShieldCheck,
    ClipboardList,
    FileText,
    BarChart3,
    CheckCircle,
    Search,
    ArrowRight,
    X,
    Printer,
    Filter,
    Pill,
    ShoppingBag,
    Truck,
    Inbox,
    Package,
    Download,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ChevronDown
} from 'lucide-react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import SearchSelect from '../Common/SearchSelect';
import { colors, PageWrapper, fadeIn } from '../GlobalStyles';
import { getSelectedStoreDepartment, setSelectedStoreDepartment, useStoresDepartment } from '../Stores/storesDepartmentHelper';
import { printStoresReport } from '../Stores/printStoresReport';

const Container = styled(PageWrapper)`
  min-height: 100vh;
  padding: 24px;
  background: #f8fafc;
`;

const Header = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  animation: ${fadeIn} 0.4s ease-out;

  .title-section {
    h1 {
      font-size: 1.85rem;
      font-weight: 800;
      color: ${colors.textMain};
      margin: 0;
      letter-spacing: -0.025em;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p {
      color: ${colors.textMuted};
      margin-top: 4px;
      font-size: 0.95rem;
    }
  }
`;

const ScopeFilterBar = styled.div`
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 18px;
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  animation: ${fadeIn} 0.45s ease-out;

  .label-group {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.88rem;
    font-weight: 700;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    
    svg {
      color: #059669;
    }
  }

  .button-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

const ScopeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1.5px solid ${props => props.$active ? '#059669' : '#cbd5e1'};
  background: ${props => props.$active ? '#059669' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#475569'};
  box-shadow: ${props => props.$active ? '0 4px 10px rgba(5, 150, 105, 0.25)' : 'none'};

  &:hover {
    border-color: #059669;
    color: ${props => props.$active ? '#ffffff' : '#059669'};
    background: ${props => props.$active ? '#047857' : '#f0fdf4'};
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ActiveScopeBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #065f46;
  background: #d1fae5;
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid #a7f3d0;
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 22px;
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const CategoryTab = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid ${props => props.$active ? '#059669' : '#e2e8f0'};
  background: ${props => props.$active ? '#ecfdf5' : '#ffffff'};
  color: ${props => props.$active ? '#059669' : '#64748b'};
  transition: all 0.15s ease;

  &:hover {
    border-color: #059669;
    color: #059669;
  }
`;

const SearchBox = styled.div`
  position: relative;
  width: 300px;
  max-width: 100%;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${colors.textMuted};
  }

  input {
    width: 100%;
    height: 40px;
    border-radius: 10px;
    border: 1px solid ${colors.border};
    background: #ffffff;
    padding: 0 14px 0 38px;
    font-size: 0.88rem;
    font-weight: 500;
    color: ${colors.textMain};
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #059669;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.12);
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 20px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ReportCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: ${props => props.color || '#059669'};
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 24px -6px rgba(0, 0, 0, 0.08), 0 8px 12px -4px rgba(0, 0, 0, 0.03);
    border-color: ${props => props.color || '#059669'};

    &::before {
      opacity: 1;
    }

    .icon-wrapper {
      transform: scale(1.08);
      background: #ecfdf5;
      color: #059669;
    }

    .arrow-icon {
      transform: translateX(4px);
      color: #059669;
    }
  }

  .top-meta {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;

    .icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #f1f5f9;
      color: ${props => props.color || '#475569'};
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s ease;
    }

    .badge {
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
    }
  }

  .content {
    h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: ${colors.textMain};
      margin: 0 0 6px 0;
      line-height: 1.35;
    }
    p {
      font-size: 0.82rem;
      color: ${colors.textMuted};
      margin: 0;
      line-height: 1.45;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;

    .scope-tag {
      font-size: 0.75rem;
      font-weight: 600;
      color: #059669;
    }

    .arrow-icon {
      color: #94a3b8;
      transition: transform 0.2s ease, color 0.2s ease;
    }
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

const ModalContainer = styled.div`
  background: #ffffff;
  border-radius: 16px;
  width: 96vw;
  max-width: 1450px;
  height: 94vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  padding: 16px 24px;
  background: #f0fdf4;
  border-bottom: 1.5px solid #bbf7d0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;

  .left-part {
    display: flex;
    align-items: center;
    gap: 12px;

    .modal-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #065f46;
      margin: 0;
    }

    .modal-scope-tag {
      background: #059669;
      color: #ffffff;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.$primary ? '#059669' : (props.$excel ? '#16a34a' : '#cbd5e1')};
  background: ${props => props.$primary ? '#059669' : (props.$excel ? '#16a34a' : '#ffffff')};
  color: ${props => (props.$primary || props.$excel) ? '#ffffff' : '#334155'};

  &:hover {
    background: ${props => props.$primary ? '#047857' : (props.$excel ? '#15803d' : '#f8fafc')};
    border-color: ${props => props.$primary ? '#047857' : (props.$excel ? '#15803d' : '#94a3b8')};
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #fecaca;
    color: #dc2626;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: #f8fafc;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
`;

const StatCard = styled.div`
  background: #ffffff;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  border-left: 4px solid ${props => props.color || '#059669'};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

  .label {
    font-size: 0.74rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 1.35rem;
    font-weight: 800;
    color: #0f172a;
    margin-top: 4px;
  }
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  background: #ffffff;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  .left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  select {
    height: 38px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    padding: 0 12px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #334155;
    background: #ffffff;
    outline: none;

    &:focus {
      border-color: #059669;
    }
  }
`;

const ReportTableWrapper = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;

  thead {
    background: #f1f5f9;
    border-bottom: 2px solid #cbd5e1;

    th {
      padding: 10px 12px;
      font-weight: 700;
      color: #334155;
      text-align: left;
      white-space: nowrap;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.15s ease;

      &:hover {
        background: #f8fafc;
      }
    }

    td {
      padding: 10px 12px;
      color: #1e293b;
      white-space: nowrap;
    }
  }
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  font-size: 0.82rem;
  color: #64748b;

  .btns {
    display: flex;
    gap: 6px;
  }

  button {
    padding: 5px 12px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background: #f1f5f9;
      border-color: #94a3b8;
    }
  }
`;

// 14 Specialized Drug Purchase Reports definition
export const DRUG_PURCHASE_REPORTS = [
    {
        id: 'DrugPurchaseReturnReport',
        key: 'purchase_return',
        title: 'Purchase Return & Debit Notes',
        description: 'Track returned drug batches, debit notes raised against drug vendors, and adjustment vouchers from hospital_grn and hospital_vendor.',
        route: '/DrugPurchaseReturnReport',
        icon: RotateCcw,
        color: '#ef4444',
        category: 'Returns & Indents'
    },
    {
        id: 'DrugPurchaseAnalysisReport',
        key: 'purchase_analysis',
        title: 'Purchase Analysis Report',
        description: 'Analyze procurement trends, supplier turnover, GST input tax credit, and month-over-month medicine expenditure from hospital_grn and hospital_vendor.',
        route: '/DrugPurchaseAnalysisReport',
        icon: TrendingUp,
        color: '#059669',
        category: 'Suppliers & Analysis'
    },
    {
        id: 'DrugPreviousDayStockReport',
        key: 'previous_day',
        title: 'Previous Day / Daily Stock Report',
        description: 'Daily ledger balance tracking opening stock, goods received, department issues, and closing stock valuation.',
        route: '/DrugPreviousDayStockReport',
        icon: Layers,
        color: '#0284c7',
        category: 'Inventory & Stock'
    },
    {
        id: 'DrugSupplierWiseReport',
        key: 'supplier_wise',
        title: 'Supplier-Wise List & Ledger',
        description: 'Comprehensive directory of drug suppliers with cumulative purchase values, payments made, and pending dues from hospital_vendor and hospital_grn.',
        route: '/DrugSupplierWiseReport',
        icon: Building2,
        color: '#7c3aed',
        category: 'Suppliers & Analysis'
    },
    {
        id: 'DrugNonMovingReport',
        key: 'non_moving',
        title: 'Non-Moving Items Report (Dead Stock)',
        description: 'Identify slow-moving and idle medicines with zero consumption over 30 / 60 / 90 / 180+ days to prevent dead capital.',
        route: '/DrugNonMovingReport',
        icon: Clock,
        color: '#d97706',
        category: 'Inventory & Stock'
    },
    {
        id: 'DrugShortExpiryReport',
        key: 'short_expiry',
        title: 'Short Expiry & Expired List',
        description: 'Early warning alert report tracking pharmaceutical batches nearing expiry within 30, 60, or 90 days.',
        route: '/DrugShortExpiryReport',
        icon: AlertTriangle,
        color: '#e11d48',
        category: 'Inventory & Stock'
    },
    {
        id: 'DrugReorderLevelReport',
        key: 'reorder_level',
        title: 'Reorder Level Indication',
        description: 'Real-time stock threshold monitoring, identifying out-of-stock and low-stock drugs with suggested reorder quantities.',
        route: '/DrugReorderLevelReport',
        icon: AlertCircle,
        color: '#ea580c',
        category: 'Inventory & Stock'
    },
    {
        id: 'DrugRackClassificationReport',
        key: 'rack_classification',
        title: 'Barcode Entry & Rack Classification',
        description: 'Spatial pharmacy storage mapping to manage Racks, Shelves, and Bins with barcode scanner integration.',
        route: '/DrugRackClassificationReport',
        icon: GridIcon,
        color: '#4f46e5',
        category: 'Inventory & Stock'
    },
    {
        id: 'DrugSupplierGrnReport',
        key: 'supplier_grn',
        title: 'Supplier-Based GRN Report (ALL (IP PHARMACY, OP PHARMACY, DRUG PURCHASE))',
        description: 'Goods Received Note (GRN) report categorized by Drug Supplier / Vendor with tax details and invoice net totals from hospital_grn and hospital_vendor.',
        route: '/DrugSupplierGrnReport',
        icon: ShieldCheck,
        color: '#0891b2',
        category: 'Purchases & GRN'
    },
    {
        id: 'DrugDateGrnReport',
        key: 'date_grn',
        title: 'Date-Wise / Date-Based GRN Report (ALL (IP PHARMACY, OP PHARMACY, DRUG PURCHASE))',
        description: 'Goods Received Note (GRN) report categorized by Date with day of week, supplier count, gross purchases, returns, and net purchases from hospital_grn and hospital_vendor.',
        route: '/DrugDateGrnReport',
        icon: CalendarDays,
        color: '#059669',
        category: 'Purchases & GRN'
    },
    {
        id: 'DrugDepartmentIndentReport',
        key: 'indent',
        title: 'Department-Based Indent Report',
        description: 'Pharmacy item requisitions (indents) grouped by Department with approval status and requested quantities.',
        route: '/DrugDepartmentIndentReport',
        icon: ClipboardList,
        color: '#2563eb',
        category: 'Returns & Indents'
    },
    {
        id: 'DrugGRNGeneralReport',
        key: 'grn_general',
        title: 'Drug Purchase GRN General Report',
        description: 'Comprehensive general GRN report with invoice details, drug vendor mapping, and tax breakdown from hospital_grn and hospital_vendor.',
        route: '/DrugGRNGeneralReport',
        icon: FileText,
        color: '#0d9488',
        category: 'Purchases & GRN'
    },
    {
        id: 'DrugIntentReturnReport',
        key: 'intent_approval',
        title: 'Drug Purchase Intent Approval Report',
        description: 'Review, approve, and track department store and pharmacy intent requisitions from hospital_grn and hospital_vendor.',
        route: '/DrugIntentReturnReport',
        icon: ClipboardList,
        color: '#9333ea',
        category: 'Returns & Indents'
    },
    {
        id: 'DrugAbcVedReport',
        key: 'abc_ved',
        title: 'Drug Purchase ABC & VED Analysis Report',
        description: 'Analysis report categorizing pharmacy items based on ABC expenditure value and VED medical criticality.',
        route: '/DrugAbcVedReport',
        icon: BarChart3,
        color: '#16a34a',
        category: 'Suppliers & Analysis'
    },
    {
        id: 'DrugOpeningStockReport',
        key: 'opening_stock',
        title: 'Opening Stock Audit Report',
        description: 'Complete audit trail of Drug Item opening stock values, adjustments, audit remarks, and user history from hospital_grn and pharmacy items.',
        route: '/DrugOpeningStockReport',
        icon: CheckCircle,
        color: '#6366f1',
        category: 'Inventory & Stock'
    }
];

const CATEGORIES = ['All', 'Inventory & Stock', 'Purchases & GRN', 'Suppliers & Analysis', 'Returns & Indents'];

const DrugPurchaseReportsDashboard = () => {
    const navigate = useNavigate();
    const [selectedScope, setSelectedScope] = useState(() => {
        const stored = localStorage.getItem('drug_purchase_report_scope') || getSelectedStoreDepartment();
        if (stored && (stored === 'IP PHARMACY' || stored === 'OP PHARMACY' || stored === 'DRUG PURCHASE' || stored.includes('ALL') || stored.includes('CONSOLIDATED'))) {
            return stored;
        }
        return 'ALL (IP PHARMACY, OP PHARMACY, DRUG PURCHASE)';
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');

    // Modal state
    const [activeModalReport, setActiveModalReport] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [expandedSupplierModal, setExpandedSupplierModal] = useState(null);
    const [reportData, setReportData] = useState({
        columns: [],
        data: [],
        summary: {},
        vendors: [],
        title: ''
    });
    const [modalSearch, setModalSearch] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('all');
    const [modalFromDate, setModalFromDate] = useState(oneMonthAgo);
    const [modalToDate, setModalToDate] = useState(today);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    // Sync with global store department state
    useStoresDepartment((newDept) => {
        if (newDept && (newDept === 'IP PHARMACY' || newDept === 'OP PHARMACY' || newDept === 'DRUG PURCHASE' || newDept.includes('ALL') || newDept.includes('CONSOLIDATED'))) {
            setSelectedScope(newDept);
        }
    });

    const handleScopeChange = (scope) => {
        setSelectedScope(scope);
        try {
            localStorage.setItem('drug_purchase_report_scope', scope);
        } catch (e) {
            // ignore
        }
        setSelectedStoreDepartment(scope, scope);
    };

    // Fetch report data directly from hospital_grn & hospital_vendor backend API
    const fetchReportData = useCallback(async (report, scope = selectedScope, vendor = selectedVendor, fDate = modalFromDate, tDate = modalToDate) => {
        if (!report) return;
        try {
            setLoadingData(true);
            const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
            const repKey = report.key || report.id;
            const url = `${getBaseUrl.replace(/\/$/, '')}/drug-purchase-reports-dashboard/?report_key=${repKey}&scope=${encodeURIComponent(scope)}&vendor_id=${encodeURIComponent(vendor)}&from_date=${fDate || ''}&to_date=${tDate || ''}`;
            
            const res = await apiRequest(url, 'GET');
            if (res && res.success) {
                const payload = res.data || res;
                const results = payload.data || payload.results || (Array.isArray(payload) ? payload : []);
                setReportData({
                    columns: payload.columns || [],
                    data: results,
                    summary: payload.summary || {},
                    vendors: payload.vendors || [],
                    title: payload.title || `${report.title} (${scope})`
                });
            } else {
                setReportData({
                    columns: [],
                    data: [],
                    summary: {},
                    vendors: [],
                    title: `${report.title} (${scope})`
                });
            }
        } catch (err) {
            console.error('Error fetching drug purchase report data:', err);
        } finally {
            setLoadingData(false);
        }
    }, [selectedScope, selectedVendor, modalFromDate, modalToDate]);

    // When scope changes and modal is active, reload data
    useEffect(() => {
        if (activeModalReport) {
            fetchReportData(activeModalReport, selectedScope, selectedVendor, modalFromDate, modalToDate);
        }
    }, [selectedScope, activeModalReport, fetchReportData, selectedVendor, modalFromDate, modalToDate]);

    const handleOpenReport = (report) => {
        setActiveModalReport(report);
        setCurrentPage(1);
        setModalSearch('');
        setSelectedVendor('all');
        setExpandedSupplierModal(null);
        fetchReportData(report, selectedScope, 'all', modalFromDate, modalToDate);
    };

    const handleCloseModal = () => {
        setActiveModalReport(null);
        setExpandedSupplierModal(null);
    };

    // Filter cards for dashboard, sorted alphabetically
    const filteredReports = useMemo(() => {
        return DRUG_PURCHASE_REPORTS
            .filter((rep) => {
                const matchesCat = selectedCategory === 'All' || rep.category === selectedCategory;
                const query = searchTerm.toLowerCase().trim();
                if (!matchesCat) return false;
                if (!query) return true;

                const cleanTerm = query.replace(/[-_]/g, ' ');
                const words = cleanTerm.split(/\s+/).filter(Boolean);
                const repText = `${rep.title || ''} ${rep.description || ''} ${rep.category || ''} ${rep.route || ''}`.toLowerCase().replace(/[-_]/g, ' ');

                return words.every(w => {
                    const altW = w === 'wise' ? 'based' : (w === 'based' ? 'wise' : w);
                    return repText.includes(w) || repText.includes(altW);
                });
            })
            .sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
    }, [selectedCategory, searchTerm]);

    // Filter table rows inside modal, sorted alphabetically
    const filteredTableRows = useMemo(() => {
        if (!reportData.data || !Array.isArray(reportData.data)) return [];
        let rows = reportData.data;

        if (selectedVendor && selectedVendor !== 'all') {
            const sv = String(selectedVendor).trim().toLowerCase();
            rows = rows.filter((r) => 
                String(r.vendor_id || '').trim().toLowerCase() === sv ||
                String(r.vendor_name || '').toLowerCase().includes(sv)
            );
        }

        if (modalSearch && modalSearch.trim()) {
            const q = modalSearch.toLowerCase().trim();
            rows = rows.filter((r) => {
                const grnMatch = Array.isArray(r.grns) && r.grns.some(g => 
                    String(g.grn_number || '').toLowerCase().includes(q) ||
                    String(g.invoice_no || '').toLowerCase().includes(q) ||
                    (Array.isArray(g.items) && g.items.some(it => String(it.name || it.itemName || '').toLowerCase().includes(q)))
                );
                return (
                    String(r.vendor_name || '').toLowerCase().includes(q) ||
                    String(r.vendor_id || '').toLowerCase().includes(q) ||
                    String(r.vendor_gstin || '').toLowerCase().includes(q) ||
                    grnMatch ||
                    Object.values(r).some((val) => typeof val === 'string' && val.toLowerCase().includes(q))
                );
            });
        }

        // Sort data rows alphabetically by primary text column
        return [...rows].sort((a, b) => {
            const nameA = String(a.vendor_name || a.item_name || a.itemName || a.name || a.particulars || a.department_name || a.title || Object.values(a).find(v => typeof v === 'string') || '').trim();
            const nameB = String(b.vendor_name || b.item_name || b.itemName || b.name || b.particulars || b.department_name || b.title || Object.values(b).find(v => typeof v === 'string') || '').trim();
            return nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true });
        });
    }, [reportData.data, selectedVendor, modalSearch]);

    // Paginated rows
    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredTableRows.slice(start, start + pageSize);
    }, [filteredTableRows, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredTableRows.length / pageSize) || 1;

    // Excel Export
    const handleExportExcel = () => {
        if (!filteredTableRows || filteredTableRows.length === 0) return;
        try {
            if (activeModalReport?.key === 'date_grn') {
                const dateRows = filteredTableRows.map(d => ({
                    "Date": d.date,
                    "Day of Week": d.day_of_week || '',
                    "Scope": selectedScope,
                    "Total GRNs": d.total_grns,
                    "Suppliers Count": d.suppliers_count || 0,
                    "Suppliers List": Array.isArray(d.suppliers) ? d.suppliers.join(', ') : '',
                    "Taxable Amount (₹)": d.taxable_amount,
                    "Tax Amount (₹)": d.tax_amount,
                    "Total Purchases (₹)": d.total_amount,
                    "Total Returns": d.total_returns || (d.returns ? d.returns.length : 0),
                    "Return Amount (₹)": d.return_amount || 0,
                    "Net Purchases (₹)": d.net_amount != null ? d.net_amount : (d.total_amount || 0) - (d.return_amount || 0),
                    "Items Received Qty": d.total_items_qty
                }));

                const grnRows = [];
                const returnRows = [];
                filteredTableRows.forEach(d => {
                    if (Array.isArray(d.grns)) {
                        d.grns.forEach(g => {
                            grnRows.push({
                                "GRN Date": d.date,
                                "Day": d.day_of_week || '',
                                "GRN Number": g.grn_number,
                                "Invoice No": g.invoice_no || '',
                                "Invoice Date": g.invoice_date || '',
                                "Supplier Name": g.vendor_name || '',
                                "Supplier ID": g.vendor_id || '',
                                "Taxable Value (₹)": g.taxable_amount,
                                "CGST (₹)": g.cgst,
                                "SGST (₹)": g.sgst,
                                "Total Amount (₹)": g.total_amount,
                                "Payment Mode": g.payment_mode || 'Credit',
                                "Approval Status": g.is_approved ? 'Approved' : 'Pending',
                                "Items Summary": Array.isArray(g.items) ? g.items.map(it => `${it.name || it.itemName || 'Item'} (${it.quantity || 0} Qty)`).join(', ') : ''
                            });
                        });
                    }
                    if (Array.isArray(d.returns)) {
                        d.returns.forEach(r => {
                            returnRows.push({
                                "Return Date": d.date,
                                "Day": d.day_of_week || '',
                                "Debit Note No": r.debit_note_no || '',
                                "Return ID": r.return_id || '',
                                "Supplier Name": r.vendor_name || '',
                                "Supplier ID": r.vendor_id || '',
                                "Against GRN": r.grn_number || '',
                                "Return Amount (₹)": r.total_amount || 0,
                                "Reason": r.reason || r.reason_for_return || '',
                                "Items Count": r.items_count || (r.items ? r.items.length : 0)
                            });
                        });
                    }
                });

                const wb = XLSX.utils.book_new();
                const wsDate = XLSX.utils.json_to_sheet(dateRows);
                const wsGrns = XLSX.utils.json_to_sheet(grnRows);
                XLSX.utils.book_append_sheet(wb, wsDate, "Date Summary");
                XLSX.utils.book_append_sheet(wb, wsGrns, "Detailed GRN Invoices");
                if (returnRows.length > 0) {
                    const wsReturns = XLSX.utils.json_to_sheet(returnRows);
                    XLSX.utils.book_append_sheet(wb, wsReturns, "Purchase Returns (Debit Notes)");
                }
                const filename = `Drug_Date_GRN_Report_${selectedScope.replace(/\s+/g, '_')}_${dayjs().format('YYYYMMDD')}.xlsx`;
                XLSX.writeFile(wb, filename);
                return;
            }

            if (activeModalReport?.key === 'supplier_grn') {
                const supplierRows = filteredTableRows.map(s => ({
                    "Vendor ID": s.vendor_id,
                    "Supplier Name": s.vendor_name,
                    "GSTIN": s.vendor_gstin || '',
                    "Total GRNs": s.total_grns,
                    "Total Purchases (₹)": s.total_amount,
                    "Total Returns": s.total_returns || (s.returns ? s.returns.length : 0),
                    "Return Amount (₹)": s.return_amount || 0,
                    "Net Purchases (₹)": s.net_amount != null ? s.net_amount : (s.total_amount || 0) - (s.return_amount || 0),
                    "Taxable Amount (₹)": s.taxable_amount,
                    "Tax Paid (₹)": s.tax_amount,
                    "Items Received Qty": s.total_items_qty
                }));

                const grnRows = [];
                const returnRows = [];
                filteredTableRows.forEach(s => {
                    if (Array.isArray(s.grns)) {
                        s.grns.forEach(g => {
                            grnRows.push({
                                "Vendor ID": s.vendor_id,
                                "Supplier Name": s.vendor_name,
                                "GRN Number": g.grn_number,
                                "GRN Date": g.date || '',
                                "Invoice No": g.invoice_no || '',
                                "Invoice Date": g.invoice_date || '',
                                "Taxable Value (₹)": g.taxable_amount,
                                "CGST (₹)": g.cgst,
                                "SGST (₹)": g.sgst,
                                "Total Amount (₹)": g.total_amount,
                                "Payment Mode": g.payment_mode || 'Credit',
                                "Approval Status": g.is_approved ? 'Approved' : 'Pending',
                                "Items Summary": Array.isArray(g.items) ? g.items.map(it => `${it.name || it.itemName || 'Item'} (${it.quantity || 0} Qty)`).join(', ') : ''
                            });
                        });
                    }
                    if (Array.isArray(s.returns)) {
                        s.returns.forEach(r => {
                            returnRows.push({
                                "Vendor ID": s.vendor_id,
                                "Supplier Name": s.vendor_name,
                                "Debit Note No": r.debit_note_no || '',
                                "Return ID": r.return_id || '',
                                "Return Date": r.return_date || '',
                                "Against GRN": r.grn_number || '',
                                "Return Amount (₹)": r.total_amount || 0,
                                "Reason": r.reason_for_return || '',
                                "Status": r.status || ''
                            });
                        });
                    }
                });

                const wb = XLSX.utils.book_new();
                const wsSupplier = XLSX.utils.json_to_sheet(supplierRows);
                const wsGrns = XLSX.utils.json_to_sheet(grnRows);
                XLSX.utils.book_append_sheet(wb, wsSupplier, "Supplier Summary");
                XLSX.utils.book_append_sheet(wb, wsGrns, "Detailed GRN Invoices");
                if (returnRows.length > 0) {
                    const wsReturns = XLSX.utils.json_to_sheet(returnRows);
                    XLSX.utils.book_append_sheet(wb, wsReturns, "Purchase Returns (Debit Notes)");
                }
                const filename = `Drug_Supplier_GRN_Report_${selectedScope.replace(/\s+/g, '_')}_${dayjs().format('YYYYMMDD')}.xlsx`;
                XLSX.writeFile(wb, filename);
                return;
            }

            const exportData = filteredTableRows.map((row) => {
                const cleanRow = {};
                (reportData.columns || []).forEach((col) => {
                    cleanRow[col.label] = row[col.key] != null ? row[col.key] : '';
                });
                return cleanRow;
            });

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Drug Purchase");
            const filename = `${(activeModalReport?.title || 'Drug_Purchase_Report').replace(/[^a-zA-Z0-9]/g, '_')}_${selectedScope.replace(/\s+/g, '_')}_${dayjs().format('YYYYMMDD')}.xlsx`;
            XLSX.writeFile(wb, filename);
        } catch (err) {
            console.error('Failed to export excel:', err);
        }
    };

    // Print Report
    const handlePrint = () => {
        const isDateGrn = activeModalReport?.id === 'DrugDateGrnReport' || 
                          activeModalReport?.key === 'date_grn' || 
                          activeModalReport?.route?.includes('drug-date-grn-report') ||
                          (activeModalReport?.title || '').toLowerCase().includes('date-based');

        if (isDateGrn) {
            const fmtDate = (d) => {
                if (!d) return '';
                if (typeof d.format === 'function') return d.format('DD/MM/YYYY');
                const parsed = dayjs(d);
                return parsed.isValid() ? parsed.format('DD/MM/YYYY') : String(d);
            };
            printStoresReport(reportData.data || filteredTableRows, {
                isDatePurchaseFormat: true,
                fromDate: fmtDate(modalFromDate),
                toDate: fmtDate(modalToDate),
                summary: reportData.summary || {},
                hospitalName: 'SHANMUGA HOSPITAL LIMITED',
                department: selectedScope || 'DRUG PURCHASE'
            });
            return;
        }

        const isSupplierGrn = activeModalReport?.id === 'DrugSupplierGrnReport' || 
                              activeModalReport?.key === 'supplier_grn' || 
                              activeModalReport?.route?.includes('drug-supplier-grn-report') ||
                              (activeModalReport?.title || '').toLowerCase().includes('supplier-based');

        if (isSupplierGrn) {
            const fmtDate = (d) => {
                if (!d) return '';
                if (typeof d.format === 'function') return d.format('DD/MM/YYYY');
                const parsed = dayjs(d);
                return parsed.isValid() ? parsed.format('DD/MM/YYYY') : String(d);
            };
            printStoresReport(reportData.data || filteredTableRows, {
                isSupplierPurchaseFormat: true,
                fromDate: fmtDate(modalFromDate),
                toDate: fmtDate(modalToDate),
                summary: reportData.summary || {},
                hospitalName: 'SHANMUGA HOSPITAL LIMITED',
                department: selectedScope || 'DRUG PURCHASE'
            });
            return;
        }

        const printWindow = window.open('', '_blank', 'width=1100,height=850');
        if (!printWindow) return;

        const tableHeaders = (reportData.columns || []).map(col => `
            <th style="padding: 8px 10px; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; text-align: ${col.align || 'left'}; font-size: 8.5pt;">
                ${col.label}
            </th>
        `).join('');

        const tableBody = filteredTableRows.map(row => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                ${(reportData.columns || []).map(col => {
                    const val = row[col.key];
                    const isNum = typeof val === 'number';
                    const isCur = isNum && (col.key.includes('amount') || col.key.includes('net') || col.key.includes('taxable') || col.key.includes('cost') || col.key.includes('rate') || col.key.includes('valuation') || col.key.includes('spend'));
                    const formatted = isCur ? `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : (val != null ? String(val) : '—');
                    return `<td style="padding: 6px 10px; text-align: ${col.align || 'left'}; font-size: 8pt;">${formatted}</td>`;
                }).join('')}
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${reportData.title || activeModalReport?.title}</title>
                <style>
                    @page { size: landscape; margin: 8mm; }
                    body { font-family: Arial, sans-serif; margin: 0; padding: 10px; color: #000; }
                    .header { text-align: center; margin-bottom: 14px; border-bottom: 1.5px solid #000; padding-bottom: 8px; }
                    .header h1 { margin: 0 0 4px 0; font-size: 14pt; letter-spacing: 0.5px; }
                    .header h2 { margin: 0 0 4px 0; font-size: 11pt; color: #333; }
                    .meta { display: flex; justify-content: space-between; font-size: 8pt; margin-top: 4px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>SHANMUGA HOSPITAL</h1>
                    <h2>${reportData.title || activeModalReport?.title}</h2>
                    <div class="meta">
                        <span>Scope: <strong>${selectedScope}</strong></span>
                        <span>Total Records: <strong>${filteredTableRows.length}</strong></span>
                        <span>Printed As On: <strong>${dayjs().format('DD/MM/YYYY HH:mm:ss')}</strong></span>
                    </div>
                </div>
                <table>
                    <thead><tr>${tableHeaders}</tr></thead>
                    <tbody>${tableBody}</tbody>
                </table>
                <script>
                    window.onload = function() { window.print(); window.close(); };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <Container>
            <Header>
                <div className="title-section">
                    <h1>
                        <Pill size={32} color="#059669" /> Drug Purchase Report Dashboard
                    </h1>
                    <p>
                        Comprehensive inventory management, procurement audits, vendor spend analysis, and stock movement reports from hospital_grn and hospital_vendor.
                    </p>
                </div>
            </Header>

            {/* MANDATORY TOP SCOPE FILTER BAR: ALL (CONSOLIDATED) / IP PHARMACY / OP PHARMACY / DRUG PURCHASE */}
            <ScopeFilterBar>
                <div className="label-group">
                    <Filter size={18} /> Outlet / Department Scope:
                </div>
                <div className="button-group">
                    <ScopeButton
                        $active={selectedScope?.includes('ALL') || selectedScope?.includes('CONSOLIDATED')}
                        onClick={() => handleScopeChange('ALL (IP PHARMACY, OP PHARMACY, DRUG PURCHASE)')}
                    >
                        <Layers size={16} /> ALL (IP PHARMACY, OP PHARMACY, DRUG PURCHASE)
                    </ScopeButton>
                    <ScopeButton
                        $active={selectedScope === 'IP PHARMACY'}
                        onClick={() => handleScopeChange('IP PHARMACY')}
                    >
                        <Pill size={16} /> IP PHARMACY
                    </ScopeButton>
                    <ScopeButton
                        $active={selectedScope === 'OP PHARMACY'}
                        onClick={() => handleScopeChange('OP PHARMACY')}
                    >
                        <ShoppingBag size={16} /> OP PHARMACY
                    </ScopeButton>
                    <ScopeButton
                        $active={selectedScope === 'DRUG PURCHASE'}
                        onClick={() => handleScopeChange('DRUG PURCHASE')}
                    >
                        <Truck size={16} /> DRUG PURCHASE
                    </ScopeButton>
                </div>
                <ActiveScopeBadge>
                    Active Filter: <strong>{selectedScope}</strong>
                </ActiveScopeBadge>
            </ScopeFilterBar>

            {/* Controls Bar: Category tabs & Search input */}
            <ControlsBar>
                <CategoryTabs>
                    {CATEGORIES.map((cat) => (
                        <CategoryTab
                            key={cat}
                            $active={selectedCategory === cat}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat} {cat === 'All' ? `(${DRUG_PURCHASE_REPORTS.length})` : ''}
                        </CategoryTab>
                    ))}
                </CategoryTabs>

                <SearchBox>
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search drug purchase reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchBox>
            </ControlsBar>

            {/* 14 Report Cards Grid */}
            <Grid>
                {filteredReports.map((report) => {
                    const IconComponent = report.icon || Package;
                    return (
                        <ReportCard
                            key={report.id}
                            color={report.color}
                            onClick={() => handleOpenReport(report)}
                        >
                            <div>
                                <div className="top-meta">
                                    <div className="icon-wrapper">
                                        <IconComponent size={22} />
                                    </div>
                                    <span className="badge">{report.category}</span>
                                </div>
                                <div className="content">
                                    <h3>{report.title}</h3>
                                    <p>{report.description}</p>
                                </div>
                            </div>

                            <div className="footer">
                                <span className="scope-tag">{selectedScope}</span>
                                <ChevronRight className="arrow-icon" size={16} />
                            </div>
                        </ReportCard>
                    );
                })}
            </Grid>

            {filteredReports.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textMuted }}>
                    <Inbox size={42} style={{ opacity: 0.4, marginBottom: '10px' }} />
                    <h3 style={{ margin: '0 0 6px 0', color: colors.textMain }}>No Drug Purchase Reports Found</h3>
                    <p style={{ margin: 0 }}>No report matched "{searchTerm}".</p>
                </div>
            )}

            {/* Interactive Drug Purchase Report Modal Viewer */}
            {activeModalReport && (
                <ModalOverlay onClick={handleCloseModal}>
                    <ModalContainer onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <div className="left-part">
                                {React.createElement(activeModalReport.icon || Package, { size: 22, color: activeModalReport.color })}
                                <h2 className="modal-title">
                                    {activeModalReport.key === 'supplier_grn' 
                                        ? `Supplier-Based GRN Report (${selectedScope})` 
                                        : activeModalReport.key === 'date_grn'
                                        ? `Date-Based GRN Report (${selectedScope})`
                                        : (reportData.title || activeModalReport.title)}
                                </h2>
                                <span className="modal-scope-tag">{selectedScope}</span>
                            </div>

                            <div className="actions">
                                <ActionBtn $excel onClick={handleExportExcel}>
                                    <Download size={15} /> Export Excel
                                </ActionBtn>
                                <ActionBtn $primary onClick={handlePrint}>
                                    <Printer size={15} /> Print Report
                                </ActionBtn>
                                <ActionBtn onClick={() => navigate(activeModalReport.route)}>
                                    <ArrowRight size={15} /> Full Page View
                                </ActionBtn>
                                <CloseButton onClick={handleCloseModal}>
                                    <X size={20} />
                                </CloseButton>
                            </div>
                        </ModalHeader>

                        <ModalBody id="drug-purchase-modal-report-content">
                            {/* SCOPE TOGGLE BUTTON BAR INSIDE MODAL */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Filter size={14} color="#059669" /> Scope Filter:
                                </span>
                                {[
                                    { id: 'ALL (IP PHARMACY, OP PHARMACY, DRUG PURCHASE)', label: 'ALL (IP, OP, DRUG)' },
                                    { id: 'IP PHARMACY', label: 'IP PHARMACY' },
                                    { id: 'OP PHARMACY', label: 'OP PHARMACY' },
                                    { id: 'DRUG PURCHASE', label: 'DRUG PURCHASE' }
                                ].map(btn => {
                                    const isActive = selectedScope === btn.id || (btn.id.includes('ALL') && (selectedScope?.includes('ALL') || selectedScope?.includes('CONSOLIDATED')));
                                    return (
                                        <button
                                            key={btn.id}
                                            type="button"
                                            onClick={() => {
                                                handleScopeChange(btn.id);
                                                fetchReportData(activeModalReport, btn.id, selectedVendor, modalFromDate, modalToDate);
                                            }}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                border: isActive ? '1.5px solid #059669' : '1.5px solid #cbd5e1',
                                                background: isActive ? '#059669' : '#ffffff',
                                                color: isActive ? '#ffffff' : '#334155',
                                                fontWeight: isActive ? '800' : '600',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                boxShadow: isActive ? '0 2px 6px rgba(5, 150, 105, 0.25)' : 'none'
                                            }}
                                        >
                                            {btn.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Summary KPI Cards */}
                            {reportData.summary && Object.keys(reportData.summary).length > 0 && (
                                <StatsGrid>
                                    {Object.entries(reportData.summary).map(([key, val]) => {
                                        const label = key.replace(/_/g, ' ').replace('total', '').trim();
                                        const isCurrency = typeof val === 'number' && (key.includes('amount') || key.includes('cost') || key.includes('valuation') || key.includes('spend') || key.includes('taxable') || key.includes('dues'));
                                        return (
                                            <StatCard key={key} color={activeModalReport.color}>
                                                <div className="label">{label}</div>
                                                <div className="value">
                                                    {isCurrency ? `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : val}
                                                </div>
                                            </StatCard>
                                        );
                                    })}
                                </StatsGrid>
                            )}

                            {/* Filters Bar inside Modal */}
                            <FilterRow>
                                <div className="left">
                                    {(reportData.vendors && reportData.vendors.length > 0) && (
                                        <div style={{ minWidth: '260px', flex: '1 1 240px' }}>
                                            <SearchSelect
                                                options={[
                                                    { value: "all", label: "All Drug Suppliers" },
                                                    ...reportData.vendors.map((v) => ({
                                                        value: String(v.vendor_id),
                                                        label: `${v.name} (${v.vendor_id})`
                                                    }))
                                                ]}
                                                value={selectedVendor || "all"}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setSelectedVendor(v);
                                                    setCurrentPage(1);
                                                }}
                                                placeholder="All Drug Suppliers"
                                                height="36px"
                                                style={{ width: "100%" }}
                                            />
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>From:</span>
                                        <input
                                            type="date"
                                            value={modalFromDate}
                                            onChange={(e) => setModalFromDate(e.target.value)}
                                            style={{ height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 8px', fontSize: '0.82rem', background: '#ffffff', color: '#334155' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>To:</span>
                                        <input
                                            type="date"
                                            value={modalToDate}
                                            onChange={(e) => setModalToDate(e.target.value)}
                                            style={{ height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 8px', fontSize: '0.82rem', background: '#ffffff', color: '#334155' }}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => fetchReportData(activeModalReport, selectedScope, selectedVendor, modalFromDate, modalToDate)}
                                        style={{ height: '36px', padding: '0 14px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
                                    >
                                        Filter Date
                                    </button>

                                    <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                                        Scope: <strong style={{ color: '#059669' }}>{selectedScope}</strong>
                                    </div>
                                </div>

                                <SearchBox style={{ width: '240px' }}>
                                    <Search size={15} />
                                    <input
                                        type="text"
                                        placeholder="Filter records..."
                                        value={modalSearch}
                                        onChange={(e) => {
                                            setModalSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </SearchBox>
                            </FilterRow>

                            {/* Data Table */}
                            {loadingData ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#059669', fontWeight: 700 }}>
                                    Loading {activeModalReport.title} data from drug purchase...
                                </div>
                            ) : activeModalReport?.key === 'supplier_grn' ? (
                                <ReportTableWrapper>
                                    <StyledTable>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '40px' }}></th>
                                                <th>Drug Supplier / Vendor</th>
                                                <th style={{ textAlign: 'center' }}>Total GRNs</th>
                                                <th style={{ textAlign: 'right' }}>Total Purchases</th>
                                                <th style={{ textAlign: 'center' }}>Returns</th>
                                                <th style={{ textAlign: 'right' }}>Return Amount</th>
                                                <th style={{ textAlign: 'right' }}>Net Purchases</th>
                                                <th style={{ textAlign: 'center' }}>Items Recd</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedRows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                                        No Drug Supplier GRN records found for the selected criteria in {selectedScope}.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedRows.map((supplier) => {
                                                    const isExpanded = expandedSupplierModal === supplier.vendor_id;
                                                    const returnCount = supplier.total_returns || (supplier.returns ? supplier.returns.length : 0);
                                                    const returnAmount = Number(supplier.return_amount || 0);
                                                    const netAmount = Number(supplier.net_amount != null ? supplier.net_amount : (supplier.total_amount || 0) - returnAmount);

                                                    return (
                                                        <React.Fragment key={supplier.vendor_id}>
                                                            <tr 
                                                                onClick={() => setExpandedSupplierModal(isExpanded ? null : supplier.vendor_id)}
                                                                style={{ cursor: 'pointer', background: isExpanded ? '#f1f5f9' : 'transparent', transition: 'background 0.2s' }}
                                                            >
                                                                <td style={{ textAlign: 'center' }}>
                                                                    {isExpanded ? <ChevronDown size={18} color="#059669" /> : <ChevronRight size={18} color="#94a3b8" />}
                                                                </td>
                                                                <td style={{ fontWeight: '700' }}>
                                                                    <div style={{ color: '#059669', fontSize: '0.95rem' }}>{supplier.vendor_name}</div>
                                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                                        ID: {supplier.vendor_id} {supplier.vendor_gstin ? `| GSTIN: ${supplier.vendor_gstin}` : ''}
                                                                    </span>
                                                                </td>
                                                                <td style={{ textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                                                                    {supplier.total_grns}
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>
                                                                    ₹{Number(supplier.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </td>
                                                                <td style={{ textAlign: 'center', fontWeight: '700', color: returnCount > 0 ? '#dc2626' : '#64748b' }}>
                                                                    {returnCount > 0 ? `${returnCount} DBN` : '0'}
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontWeight: '600', color: returnAmount > 0 ? '#dc2626' : '#64748b' }}>
                                                                    {returnAmount > 0 ? `-₹${returnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                                                                    ₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </td>
                                                                <td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                                    {supplier.total_items_qty} units
                                                                </td>
                                                            </tr>

                                                            {/* Expanded Sub-Tables */}
                                                            {isExpanded && (
                                                                <tr>
                                                                    <td colSpan={8} style={{ background: '#f8fafc', padding: '16px 20px' }}>
                                                                        <div style={{ marginBottom: '10px', fontWeight: '700', color: '#059669', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            <FileText size={16} /> GRNs from {supplier.vendor_name} ({supplier.grns?.length || 0} Invoices)
                                                                        </div>

                                                                        <table style={{ width: '100%', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', borderCollapse: 'collapse', overflow: 'hidden', marginBottom: (supplier.returns && supplier.returns.length > 0) ? '16px' : '0' }}>
                                                                            <thead>
                                                                                <tr style={{ background: '#e2e8f0', color: '#334155' }}>
                                                                                    <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>GRN Number</th>
                                                                                    <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>GRN Date</th>
                                                                                    <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>Invoice No & Date</th>
                                                                                    <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'right' }}>Total Amount</th>
                                                                                    <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>Items Summary</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {Array.isArray(supplier.grns) && supplier.grns.map((g, gIdx) => (
                                                                                    <tr key={gIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                                                        <td style={{ padding: '8px 12px', fontWeight: '600', color: '#059669', fontSize: '0.85rem' }}>
                                                                                            {g.grn_number}
                                                                                        </td>
                                                                                        <td style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#475569' }}>{g.date || '-'}</td>
                                                                                        <td style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                                                                                            <div style={{ fontWeight: 600 }}>{g.invoice_no || '-'}</div>
                                                                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{g.invoice_date || '-'}</span>
                                                                                        </td>
                                                                                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', fontSize: '0.85rem' }}>
                                                                                            ₹{Number(g.total_amount || 0).toFixed(2)}
                                                                                        </td>
                                                                                        <td style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                                                                                            {Array.isArray(g.items) && g.items.length > 0 ? (
                                                                                                <div>
                                                                                                    {g.items.slice(0, 3).map((it, itIdx) => (
                                                                                                        <span key={itIdx} style={{ display: 'block', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', margin: '4px 0', fontSize: '0.75rem' }}>
                                                                                                            <div style={{ fontWeight: '700', color: '#1e293b' }}>{it.name || it.itemName || 'Medicine Item'}</div>
                                                                                                            <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '2px' }}>
                                                                                                                Qty: <span style={{ fontWeight: 600, color: '#16a34a' }}>{it.quantity || 0}</span>
                                                                                                                {it.free ? <> (Free: <span style={{ fontWeight: 600 }}>{it.free}</span>)</> : null}
                                                                                                                {it.batch ? <> | Batch: <span style={{ fontWeight: 600 }}>{it.batch}</span></> : null}
                                                                                                                {it.expiry ? <> | Exp: <span style={{ fontWeight: 600 }}>{it.expiry}</span></> : null}
                                                                                                                {it.purchase_cost ? <> | Cost: <span style={{ fontWeight: 600 }}>₹{it.purchase_cost}</span></> : null}
                                                                                                            </div>
                                                                                                        </span>
                                                                                                    ))}
                                                                                                    {g.items.length > 3 && (
                                                                                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}> +{g.items.length - 3} more</span>
                                                                                                    )}
                                                                                                </div>
                                                                                            ) : '-'}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>

                                                                        {/* Purchase Returns / Debit Notes Sub-table */}
                                                                        {Array.isArray(supplier.returns) && supplier.returns.length > 0 && (
                                                                            <div>
                                                                                <div style={{ marginBottom: '10px', fontWeight: '700', color: '#dc2626', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                    <FileText size={16} /> Purchase Returns (Debit Notes) from {supplier.vendor_name} ({supplier.returns.length} Returns)
                                                                                </div>
                                                                                <table style={{ width: '100%', background: '#ffffff', borderRadius: '8px', border: '1px solid #fecaca', borderCollapse: 'collapse', overflow: 'hidden' }}>
                                                                                    <thead>
                                                                                        <tr style={{ background: '#fee2e2', color: '#991b1b' }}>
                                                                                            <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>Debit Note / Return ID</th>
                                                                                            <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>Return Date</th>
                                                                                            <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>Against GRN</th>
                                                                                            <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>Reason</th>
                                                                                            <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'center' }}>Items Count</th>
                                                                                            <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'right' }}>Return Value</th>
                                                                                            <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'center' }}>Status</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {supplier.returns.map((ret, rIdx) => (
                                                                                            <tr key={rIdx} style={{ borderBottom: '1px solid #fef2f2' }}>
                                                                                                <td style={{ padding: '8px 12px', fontWeight: '700', color: '#dc2626', fontSize: '0.85rem' }}>
                                                                                                    <div>{ret.debit_note_no || ret.return_id}</div>
                                                                                                    {ret.debit_note_no && ret.return_id && ret.debit_note_no !== ret.return_id && (
                                                                                                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({ret.return_id})</span>
                                                                                                    )}
                                                                                                </td>
                                                                                                <td style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#475569' }}>{ret.return_date || '-'}</td>
                                                                                                <td style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: '600', color: '#2563eb' }}>{ret.grn_number || '-'}</td>
                                                                                                <td style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                                                                                                    <div>{ret.reason_for_return || ret.return_type || '-'}</div>
                                                                                                </td>
                                                                                                <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                                                                                                    {ret.items_count || 0}
                                                                                                </td>
                                                                                                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', color: '#dc2626', fontSize: '0.85rem' }}>
                                                                                                    -₹{Number(ret.total_amount || 0).toFixed(2)}
                                                                                                </td>
                                                                                                <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.8rem' }}>
                                                                                                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: ret.status === 'Completed' || ret.status === 'Approved' ? '#dcfce7' : '#fef3c7', color: ret.status === 'Completed' || ret.status === 'Approved' ? '#166534' : '#92400e', fontWeight: '600' }}>
                                                                                                        {ret.status || 'Processed'}
                                                                                                    </span>
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </StyledTable>
                                </ReportTableWrapper>
                            ) : activeModalReport?.key === 'date_grn' ? (
                                <ReportTableWrapper>
                                    <StyledTable>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '40px' }}></th>
                                                <th>Date & Day</th>
                                                <th style={{ textAlign: 'center' }}>Total GRNs</th>
                                                <th style={{ textAlign: 'center' }}>Suppliers</th>
                                                <th style={{ textAlign: 'right' }}>Total Purchases</th>
                                                <th style={{ textAlign: 'center' }}>Returns</th>
                                                <th style={{ textAlign: 'right' }}>Return Amount</th>
                                                <th style={{ textAlign: 'right' }}>Net Purchases</th>
                                                <th style={{ textAlign: 'center' }}>Items Recd</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedRows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                                        No Date-Based GRN records found for the selected criteria in {selectedScope}.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedRows.map((d) => {
                                                    const isExpanded = expandedSupplierModal === d.date;
                                                    const returnCount = d.total_returns || (d.returns ? d.returns.length : 0);
                                                    const returnAmount = Number(d.return_amount || 0);
                                                    const netAmount = Number(d.net_amount != null ? d.net_amount : (d.total_amount || 0) - returnAmount);

                                                    return (
                                                        <React.Fragment key={d.date}>
                                                            <tr 
                                                                onClick={() => setExpandedSupplierModal(isExpanded ? null : d.date)}
                                                                style={{ cursor: 'pointer', background: isExpanded ? '#f1f5f9' : 'transparent', transition: 'background 0.2s' }}
                                                            >
                                                                <td style={{ textAlign: 'center' }}>
                                                                    {isExpanded ? <ChevronDown size={18} color="#059669" /> : <ChevronRight size={18} color="#94a3b8" />}
                                                                </td>
                                                                <td style={{ fontWeight: '700' }}>
                                                                    <div style={{ color: '#059669', fontSize: '0.95rem' }}>
                                                                        {dayjs(d.date).isValid() ? dayjs(d.date).format('DD-MMM-YYYY') : d.date}
                                                                    </div>
                                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                                                                        {d.day_of_week || (dayjs(d.date).isValid() ? dayjs(d.date).format('dddd') : '')}
                                                                    </span>
                                                                </td>
                                                                <td style={{ textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                                                                    {d.total_grns}
                                                                </td>
                                                                <td style={{ textAlign: 'center', fontWeight: '600', color: '#475569' }}>
                                                                    {d.suppliers_count || (d.suppliers ? d.suppliers.length : 0)} Vendors
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>
                                                                    ₹{Number(d.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </td>
                                                                <td style={{ textAlign: 'center', fontWeight: '700', color: returnCount > 0 ? '#dc2626' : '#64748b' }}>
                                                                    {returnCount > 0 ? `${returnCount} DBN` : '0'}
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontWeight: '600', color: returnAmount > 0 ? '#dc2626' : '#64748b' }}>
                                                                    {returnAmount > 0 ? `-₹${returnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                                                                    ₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </td>
                                                                <td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                                    {d.total_items_qty} units
                                                                </td>
                                                            </tr>

                                                            {/* Expanded Sub-Tables */}
                                                            {isExpanded && (
                                                                <tr>
                                                                    <td colSpan={9} style={{ background: '#f8fafc', padding: '16px 20px' }}>
                                                                        <div style={{ marginBottom: '10px', fontWeight: '700', color: '#059669', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            <FileText size={16} /> GRNs Received on {dayjs(d.date).isValid() ? dayjs(d.date).format('DD-MMM-YYYY') : d.date} ({d.grns?.length || 0} Invoices)
                                                                        </div>

                                                                        <table style={{ width: '100%', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', borderCollapse: 'collapse', overflow: 'hidden', marginBottom: (returnCount > 0) ? '16px' : '0' }}>
                                                                            <thead>
                                                                                <tr style={{ background: '#e2e8f0', color: '#334155' }}>
                                                                                    <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>GRN Number</th>
                                                                                    <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>Invoice No & Date</th>
                                                                                    <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>Supplier / Vendor</th>
                                                                                    <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'right' }}>Total Amount</th>
                                                                                    <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>Items Summary</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {Array.isArray(d.grns) && d.grns.map((g, gIdx) => (
                                                                                    <tr key={gIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                                                        <td style={{ padding: '8px 12px', fontWeight: '600', color: '#059669', fontSize: '0.85rem' }}>
                                                                                            {g.grn_number}
                                                                                        </td>
                                                                                        <td style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                                                                                            <div style={{ fontWeight: 600 }}>{g.invoice_no || '-'}</div>
                                                                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{g.invoice_date || '-'}</span>
                                                                                        </td>
                                                                                        <td style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: '600' }}>{g.vendor_name || g.vendor_id || '-'}</td>
                                                                                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', fontSize: '0.85rem' }}>
                                                                                            ₹{Number(g.total_amount || 0).toFixed(2)}
                                                                                        </td>
                                                                                        <td style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                                                                                            {Array.isArray(g.items) && g.items.length > 0 ? (
                                                                                                <div>
                                                                                                    {g.items.slice(0, 3).map((it, itIdx) => (
                                                                                                        <span key={itIdx} style={{ display: 'block', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', margin: '4px 0', fontSize: '0.75rem' }}>
                                                                                                            <div style={{ fontWeight: '700', color: '#1e293b' }}>{it.name || it.itemName || 'Medicine Item'}</div>
                                                                                                            <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '2px' }}>
                                                                                                                Qty: <span style={{ fontWeight: 600, color: '#16a34a' }}>{it.quantity || 0}</span>
                                                                                                                {it.free ? <> (Free: <span style={{ fontWeight: 600 }}>{it.free}</span>)</> : null}
                                                                                                                {it.batch ? <> | Batch: <span style={{ fontWeight: 600 }}>{it.batch}</span></> : null}
                                                                                                                {it.expiry ? <> | Exp: <span style={{ fontWeight: 600 }}>{it.expiry}</span></> : null}
                                                                                                            </div>
                                                                                                        </span>
                                                                                                    ))}
                                                                                                    {g.items.length > 3 && (
                                                                                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}> +{g.items.length - 3} more</span>
                                                                                                    )}
                                                                                                </div>
                                                                                            ) : '-'}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>

                                                                        {/* Purchase Returns / Debit Notes Sub-table */}
                                                                        {Array.isArray(d.returns) && d.returns.length > 0 && (
                                                                            <div style={{ marginTop: '16px' }}>
                                                                                <div style={{ marginBottom: '10px', fontWeight: '700', color: '#dc2626', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                    <FileText size={16} /> Purchase Returns (Debit Notes) on {dayjs(d.date).isValid() ? dayjs(d.date).format('DD-MMM-YYYY') : d.date} ({d.returns.length} Returns)
                                                                                </div>
                                                                                <table style={{ width: '100%', background: '#ffffff', borderRadius: '8px', border: '1px solid #fecaca', borderCollapse: 'collapse', overflow: 'hidden' }}>
                                                                                    <thead>
                                                                                        <tr style={{ background: '#fee2e2', color: '#991b1b' }}>
                                                                                            <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>Debit Note / Return ID</th>
                                                                                            <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>Supplier / Vendor</th>
                                                                                            <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>Against GRN</th>
                                                                                            <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'left' }}>Reason</th>
                                                                                            <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'center' }}>Items Count</th>
                                                                                            <th style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'right' }}>Return Value</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {d.returns.map((ret, rIdx) => (
                                                                                            <tr key={rIdx} style={{ borderBottom: '1px solid #fef2f2' }}>
                                                                                                <td style={{ padding: '8px 12px', fontWeight: '700', color: '#dc2626', fontSize: '0.85rem' }}>
                                                                                                    {ret.debit_note_no || ret.return_id}
                                                                                                </td>
                                                                                                <td style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: '600' }}>{ret.vendor_name || ret.vendor_id || '-'}</td>
                                                                                                <td style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#64748b' }}>{ret.grn_number || '-'}</td>
                                                                                                <td style={{ padding: '8px 12px', fontSize: '0.85rem' }}>{ret.reason || 'Drug Purchase Return'}</td>
                                                                                                <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.85rem' }}>{ret.items_count || (ret.items ? ret.items.length : 0)}</td>
                                                                                                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', color: '#dc2626', fontSize: '0.85rem' }}>
                                                                                                    -₹{Number(ret.total_amount || 0).toFixed(2)}
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </StyledTable>
                                </ReportTableWrapper>
                            ) : (
                                <ReportTableWrapper>
                                    <StyledTable>
                                        <thead>
                                            <tr>
                                                {(reportData.columns || []).map((col) => (
                                                    <th
                                                        key={col.key}
                                                        style={{
                                                            width: col.width,
                                                            textAlign: col.align || 'left'
                                                        }}
                                                    >
                                                        {col.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedRows.map((row, idx) => (
                                                <tr key={idx}>
                                                    {(reportData.columns || []).map((col) => {
                                                        const val = row[col.key];
                                                        const isNum = typeof val === 'number';
                                                        const isCur = isNum && (col.key.includes('amount') || col.key.includes('cost') || col.key.includes('taxable') || col.key.includes('total') || col.key.includes('net') || col.key.includes('rate') || col.key.includes('valuation') || col.key.includes('spend'));
                                                        return (
                                                            <td
                                                                key={col.key}
                                                                style={{
                                                                    textAlign: col.align || 'left',
                                                                    fontWeight: (col.key === 'item_name' || col.key === 'vendor_name' || col.key === 'name') ? 600 : 'normal'
                                                                }}
                                                            >
                                                                {isCur ? `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : (val != null ? String(val) : '—')}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                            {paginatedRows.length === 0 && (
                                                <tr>
                                                    <td colSpan={(reportData.columns || []).length || 5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                                        No records found for the selected criteria in {selectedScope}.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </StyledTable>

                                    {/* Pagination */}
                                    <PaginationBar>
                                        <div>
                                            Showing {filteredTableRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredTableRows.length)} of {filteredTableRows.length} entries
                                        </div>
                                        <div className="btns">
                                            <button
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            >
                                                <ChevronLeft size={14} style={{ verticalAlign: 'middle' }} /> Prev
                                            </button>
                                            <span style={{ padding: '4px 8px', fontWeight: 700 }}>
                                                {currentPage} / {totalPages}
                                            </span>
                                            <button
                                                disabled={currentPage >= totalPages}
                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            >
                                                Next <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
                                            </button>
                                        </div>
                                    </PaginationBar>
                                </ReportTableWrapper>
                            )}
                        </ModalBody>
                    </ModalContainer>
                </ModalOverlay>
            )}
        </Container>
    );
};

export default DrugPurchaseReportsDashboard;
