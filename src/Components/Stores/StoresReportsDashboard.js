import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import apiRequest from '../../Auth/apiRequest';
import { fetchMyReportPermissions } from '../../Auth/reportConfigApi';
import { getSelectedStoreDepartment, useStoresDepartment } from './storesDepartmentHelper';
import { printStoresReport } from './printStoresReport';
import { DepartmentFilterControl } from './DepartmentSelectionModal';
import { useNavigate } from 'react-router-dom';
import { 
    FileText, Building2, ClipboardList, ShoppingCart, BarChart3, 
    Search, ArrowRight, Maximize2, X, RefreshCw, Layers, Printer,
    ShoppingBag, RotateCcw, TrendingUp, Clock, AlertTriangle, AlertCircle, Grid, ShieldCheck
} from 'lucide-react';
import {
    PageWrapper,
    Container,
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalTitle,
    ModalBody,
    CloseButton,
    colors
} from '../GlobalStyles';

// Lazy-loaded report components from Stores_report
const StoresPurchaseOrderReport = lazy(() => import('../Stores_report/StoresPurchaseOrderReport'));
const StoresPurchaseReturnReport = lazy(() => import('../Stores_report/StoresPurchaseReturnReport'));
const StoresPurchaseAnalysisReport = lazy(() => import('../Stores_report/StoresPurchaseAnalysisReport'));
const StoresPreviousDayStockReport = lazy(() => import('../Stores_report/StoresPreviousDayStockReport'));
const StoresSupplierWiseReport = lazy(() => import('../Stores_report/StoresSupplierWiseReport'));
const StoresNonMovingReport = lazy(() => import('../Stores_report/StoresNonMovingReport'));
const StoresShortExpiryReport = lazy(() => import('../Stores_report/StoresShortExpiryReport'));
const StoresReorderLevelReport = lazy(() => import('../Stores_report/StoresReorderLevelReport'));
const StoresRackClassificationReport = lazy(() => import('../Stores_report/StoresRackClassificationReport'));
const StoresSupplierGrnReport = lazy(() => import('../Stores_report/StoresSupplierGrnReport'));
const StoresDepartmentIndentReport = lazy(() => import('../Stores_report/StoresDepartmentIndentReport'));
const VendingMachineReport = lazy(() => import('../Stores_report/VendingMachineReport'));
const StoresGRNGeneralReport = lazy(() => import('../Stores_report/StoresGRNGeneralReport'));
const StoresIntentReturnReport = lazy(() => import('../Stores_report/StoresIntentReturnReport'));
const StoresAbcVedReport = lazy(() => import('../Stores_report/StoresAbcVedReport'));
const StoresOpeningStockReport = lazy(() => import('../Stores_report/StoresOpeningStockReport'));

// Component mapping for dynamically loaded routes
const componentMap = {
    '/StoresPurchaseOrderReport': StoresPurchaseOrderReport,
    '/StoresPurchaseReturnReport': StoresPurchaseReturnReport,
    '/StoresPurchaseAnalysisReport': StoresPurchaseAnalysisReport,
    '/StoresPreviousDayStockReport': StoresPreviousDayStockReport,
    '/StoresSupplierWiseReport': StoresSupplierWiseReport,
    '/StoresNonMovingReport': StoresNonMovingReport,
    '/StoresShortExpiryReport': StoresShortExpiryReport,
    '/StoresReorderLevelReport': StoresReorderLevelReport,
    '/StoresRackClassificationReport': StoresRackClassificationReport,
    '/StoresSupplierGrnReport': StoresSupplierGrnReport,
    '/StoresDepartmentIndentReport': StoresDepartmentIndentReport,
    '/VendingMachineReport': VendingMachineReport,
    '/StoresGRNGeneralReport': StoresGRNGeneralReport,
    '/StoresIntentReturnReport': StoresIntentReturnReport,
    '/StoresAbcVedReport': StoresAbcVedReport,
    '/StoresOpeningStockReport': StoresOpeningStockReport,
    '/storesopeningstockreport': StoresOpeningStockReport
};

// Icon map for dynamically rendering Lucide icons
const iconMap = {
    ShoppingBag,
    RotateCcw,
    TrendingUp,
    Layers,
    Building2,
    Clock,
    AlertTriangle,
    AlertCircle,
    Grid,
    ClipboardList,
    ShoppingCart,
    FileText,
    BarChart3,
    ShieldCheck
};

const StoresReportsDashboard = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeModalReport, setActiveModalReport] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(getSelectedStoreDepartment());
    const departmentFilterRef = useRef(null);

    // Dynamic reports loaded strictly from the database (no hardcoded fallback)
    const [dbReports, setDbReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);

    // User report permissions used strictly for displaying report cards inside this page
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

    useStoresDepartment((newDept) => setSelectedDepartment(newDept || ''));

    // Fetch department list
    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
                const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/department-master/`);
                if (res && res.success && Array.isArray(res.data)) {
                    setDepartments(res.data);
                }
            } catch (err) {
                console.error("Error fetching departments:", err);
            }
        };
        fetchDepts();
    }, []);

    // Load user report permissions for internal display
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

    // Load Stores Reports strictly from DB via Report Master API
    useEffect(() => {
        const loadStoresReportsFromDb = async () => {
            try {
                setLoadingReports(true);
                const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
                const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/report-master/?group=Stores`);
                let groups = [];
                if (res && res.success && res.data) {
                    groups = Array.isArray(res.data) ? res.data : (res.data.data || []);
                }

                // Extract pages strictly from database documents
                const pages = [];
                for (const g of groups) {
                    if (Array.isArray(g.pages)) {
                        for (const page of g.pages) {
                            const iconName = page.icon || 'Layers';
                            const IconComponent = iconMap[iconName] || Layers;
                            pages.push({
                                id: page.page_id || page.route,
                                title: page.name || page.title || page.route,
                                description: page.description || '',
                                route: page.route,
                                icon: IconComponent,
                                color: '#059669',
                                bg: '#ecfdf5',
                                component: componentMap[page.route] || null
                            });
                        }
                    }
                }
                setDbReports(pages);
            } catch (err) {
                console.error("Error fetching stores reports from DB:", err);
                setDbReports([]);
            } finally {
                setLoadingReports(false);
            }
        };

        loadStoresReportsFromDb();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F10') {
                e.preventDefault();
                departmentFilterRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Filter reports dynamically by user report permissions strictly for display inside this page
    const filteredReports = dbReports.filter(rep => {
        // Evaluate permissions strictly for displaying reports inside this dashboard
        if (hasCustomConfig && userReportPerms && typeof userReportPerms === "object") {
            const norm = rep.route?.startsWith("/") ? rep.route : `/${rep.route}`;
            const isAllowed = Boolean(
                userReportPerms[rep.route] ||
                userReportPerms[norm] ||
                userReportPerms[rep.title] ||
                (rep.id != null && userReportPerms[String(rep.id)])
            );
            if (!isAllowed) return false;
        } else if (userReportPerms && typeof userReportPerms === "object" && Object.keys(userReportPerms).length > 0) {
            const norm = rep.route?.startsWith("/") ? rep.route : `/${rep.route}`;
            const isAllowed = Boolean(
                userReportPerms[rep.route] ||
                userReportPerms[norm] ||
                userReportPerms[rep.title] ||
                (rep.id != null && userReportPerms[String(rep.id)])
            );
            if (!isAllowed) return false;
        }

        const term = (searchTerm || '').trim().toLowerCase();
        if (!term) return true;

        return (
            (rep.title || '').toLowerCase().includes(term) ||
            (rep.description || '').toLowerCase().includes(term) ||
            (rep.route || '').toLowerCase().includes(term)
        );
    });

    const openReportModal = (report) => {
        setActiveModalReport(report);
    };

    const closeModal = () => {
        setActiveModalReport(null);
    };

    const handlePrintReport = (report) => {
        if (activeModalReport?.id === report.id) {
            printStoresReport("stores-modal-report-content", {
                reportTitle: report.title,
                department: selectedDepartment
            });
        } else {
            setActiveModalReport(report);
            setTimeout(() => {
                printStoresReport("stores-modal-report-content", {
                    reportTitle: report.title,
                    department: selectedDepartment
                });
            }, 600);
        }
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#047857', fontSize: '1.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Layers size={32} color="#059669" /> Stores & Inventory Reports Dashboard
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.95rem' }}>
                            Centralized report center for Stores Items, Supplier GRNs, Department Indents, Vending Machine sales, and Inventory Analysis.
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        {/* Active Department Selector */}
                        <DepartmentFilterControl
                            departments={departments}
                            onDepartmentChange={(dept) => {
                                setSelectedDepartment(dept || '');
                            }}
                        />

                        {/* Quick Search */}
                        <div style={{ position: 'relative', width: '280px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                            <input
                                type="text"
                                placeholder="Search store reports..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '42px',
                                    paddingLeft: '38px',
                                    paddingRight: '12px',
                                    borderRadius: '10px',
                                    border: `1px solid ${colors.border}`,
                                    outline: 'none',
                                    background: '#ffffff',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loadingReports ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
                        <RefreshCw size={36} style={{ animation: 'spin 1s linear infinite', color: '#059669' }} />
                        <p style={{ marginTop: '14px', fontWeight: '700', fontSize: '1rem' }}>
                            Loading Stores Reports from Database...
                        </p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', background: '#ffffff', borderRadius: '14px', border: `1px solid ${colors.border}` }}>
                        <Layers size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
                        <h3 style={{ margin: '0 0 6px 0', color: colors.textMain, fontWeight: '700' }}>
                            No Reports Available
                        </h3>
                        <p style={{ margin: 0, color: colors.textMuted, fontSize: '0.9rem' }}>
                            {searchTerm 
                                ? `No reports matched "${searchTerm}".` 
                                : hasCustomConfig
                                    ? "You do not have access to any store reports. Please contact an administrator to allocate report permissions in Employee Master."
                                    : "No stores reports configured in the database."
                            }
                        </p>
                    </div>
                ) : (
                    /* Reports Navigation Cards Grid */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        {filteredReports.map((report) => {
                            const IconComponent = report.icon || Layers;
                            return (
                                <div
                                    key={report.id}
                                    style={{
                                        background: '#ffffff',
                                        borderRadius: '14px',
                                        border: `1px solid ${colors.border}`,
                                        padding: '24px',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.25s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(5, 150, 105, 0.08)';
                                        e.currentTarget.style.borderColor = '#059669';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                                        e.currentTarget.style.borderColor = colors.border;
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <div style={{ background: report.bg, width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <IconComponent size={26} color={report.color} />
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '12px' }}>
                                                STORES REPORT
                                            </span>
                                        </div>

                                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: colors.textMain, fontWeight: '700' }}>
                                            {report.title}
                                        </h3>
                                        <p style={{ margin: 0, color: colors.textMuted, fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            {report.description}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={() => openReportModal(report)}
                                            style={{
                                                flex: '1 1 auto',
                                                padding: '9px 12px',
                                                borderRadius: '8px',
                                                border: `1px solid ${report.color}`,
                                                background: report.bg,
                                                color: report.color,
                                                fontWeight: '700',
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Maximize2 size={16} /> Open Modal
                                        </button>

                                        <button
                                            onClick={() => navigate(report.route)}
                                            style={{
                                                padding: '9px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                background: '#ffffff',
                                                color: colors.textMain,
                                                fontWeight: '600',
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                            title="Navigate to full page"
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Open Modal Account-Style Report Viewer */}
                {activeModalReport && (
                    <ModalOverlay style={{ zIndex: 1000, padding: '20px' }}>
                        <ModalContainer style={{ maxWidth: '1350px', width: '95vw', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                            <ModalHeader style={{ background: '#ecfdf5', padding: '16px 24px', borderBottom: '1px solid #a7f3d0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {activeModalReport.icon && React.createElement(activeModalReport.icon, { size: 24, color: activeModalReport.color })}
                                    <ModalTitle style={{ color: colors.textMain, fontSize: '1.25rem' }}>
                                        {activeModalReport.title}
                                    </ModalTitle>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button
                                        onClick={() => {
                                            printStoresReport("stores-modal-report-content", {
                                                reportTitle: activeModalReport.title,
                                                department: selectedDepartment
                                            });
                                        }}
                                        style={{
                                            background: '#059669',
                                            color: '#ffffff',
                                            border: 'none',
                                            padding: '7px 16px',
                                            borderRadius: '6px',
                                            fontSize: '0.82rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)'
                                        }}
                                    >
                                        <Printer size={15} /> Print Report
                                    </button>
                                    <button
                                        onClick={() => {
                                            closeModal();
                                            navigate(activeModalReport.route);
                                        }}
                                        style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <ArrowRight size={14} /> Full Page View
                                    </button>
                                    <CloseButton onClick={closeModal}><X size={20} /></CloseButton>
                                </div>
                            </ModalHeader>

                            <ModalBody style={{ flex: 1, padding: 0, overflowY: 'auto' }}>
                                <div id="stores-modal-report-content" style={{ width: '100%', minHeight: '100%' }}>
                                    <Suspense fallback={
                                        <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
                                            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
                                            <p style={{ marginTop: '12px', fontWeight: '600' }}>Loading Report Modal Data...</p>
                                        </div>
                                    }>
                                        {activeModalReport.component ? (
                                            <activeModalReport.component />
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
                                                <p>No preview available for this report.</p>
                                                <button
                                                    onClick={() => navigate(activeModalReport.route)}
                                                    style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}
                                                >
                                                    Open Report Page
                                                </button>
                                            </div>
                                        )}
                                    </Suspense>
                                </div>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                )}
            </Container>
        </PageWrapper>
    );
};

export default StoresReportsDashboard;
