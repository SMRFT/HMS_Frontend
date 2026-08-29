import React, { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FileText, Building2, ClipboardList, ShoppingCart, BarChart3, 
    CheckCircle, Search, ArrowRight, Maximize2, X, RefreshCw, Layers
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

// Lazy-loaded report components for modal viewing
const StoresSupplierGrnReport = lazy(() => import('./StoresSupplierGrnReport'));
const StoresDepartmentIndentReport = lazy(() => import('./StoresDepartmentIndentReport'));
const VendingMachineReport = lazy(() => import('./VendingMachineReport'));
const StoresGRNReport = lazy(() => import('./StoresGRNReport'));
const StoreIntentApproval = lazy(() => import('./StoreIntentApproval'));
const StoresAbcVedReport = lazy(() => import('./StoresAbcVedReport'));

const reportsConfig = [
    {
        id: 'supplier-grn',
        title: 'Supplier-Based GRN Report',
        description: 'Goods Received Note (GRN) report categorized by Supplier / Vendor with tax details and payment status.',
        icon: Building2,
        color: '#2563eb',
        bg: '#eff6ff',
        route: '/StoresSupplierGrnReport',
        component: StoresSupplierGrnReport
    },
    {
        id: 'department-indent',
        title: 'Department-Based Indent Report',
        description: 'Store item requisitions (indents) grouped by Department with approval status and item quantities.',
        icon: ClipboardList,
        color: '#7c3aed',
        bg: '#f5f3ff',
        route: '/StoresDepartmentIndentReport',
        component: StoresDepartmentIndentReport
    },
    {
        id: 'vending-machine',
        title: 'Vending Machine Sales & Stock Report',
        description: 'Track Vending Machine sales, compare revenue against GRN costs, and calculate stock reconciliation.',
        icon: ShoppingCart,
        color: '#059669',
        bg: '#ecfdf5',
        route: '/VendingMachineReport',
        component: VendingMachineReport
    },
    {
        id: 'general-grn',
        title: 'Stores GRN General Report',
        description: 'Comprehensive general GRN report with invoice details, vendor mapping, and payment tracking.',
        icon: FileText,
        color: '#d97706',
        bg: '#fffbeb',
        route: '/StoresGRNReport',
        component: StoresGRNReport
    },
    {
        id: 'stores-intent-approval',
        title: 'Stores Intent Approval Report',
        description: 'Review, approve, and track department store intent requisitions.',
        icon: CheckCircle,
        color: '#0284c7',
        bg: '#f0f9ff',
        route: '/StoreIntentApproval',
        component: StoreIntentApproval
    },
    {
        id: 'abc-ved',
        title: 'Stores ABC & VED Analysis Report',
        description: 'Analysis report categorizing inventory items based on ABC value and VED criticality.',
        icon: BarChart3,
        color: '#dc2626',
        bg: '#fef2f2',
        route: '/StoresAbcVedReport',
        component: StoresAbcVedReport
    }
];

const StoresReportsDashboard = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeModalReport, setActiveModalReport] = useState(null);

    const filteredReports = reportsConfig.filter(rep => 
        rep.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openReportModal = (report) => {
        setActiveModalReport(report);
    };

    const closeModal = () => {
        setActiveModalReport(null);
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: colors.primary, fontSize: '1.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Layers size={32} color={colors.primary} /> Stores & Inventory Reports Dashboard
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.95rem' }}>
                            Centralized report center for Stores Items, Supplier GRNs, Department Indents, Vending Machine sales, and Inventory Analysis.
                        </p>
                    </div>

                    {/* Quick Search */}
                    <div style={{ position: 'relative', width: '300px' }}>
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

                {/* Reports Navigation Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    {filteredReports.map((report) => {
                        const IconComponent = report.icon;
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
                                    justify: 'space-between',
                                    transition: 'all 0.25s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.06)';
                                    e.currentTarget.style.borderColor = report.color;
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
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', background: '#f1f5f9', color: colors.textMuted, padding: '4px 10px', borderRadius: '12px' }}>
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

                                <div style={{ display: 'flex', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                    <button
                                        onClick={() => openReportModal(report)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
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
                                        <Maximize2 size={16} /> Open Modal Report
                                    </button>

                                    <button
                                        onClick={() => navigate(report.route)}
                                        style={{
                                            padding: '10px 14px',
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

                {/* Open Modal Account-Style Report Viewer */}
                {activeModalReport && (
                    <ModalOverlay style={{ zIndex: 1000, padding: '20px' }}>
                        <ModalContainer style={{ maxWidth: '1350px', width: '95vw', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                            <ModalHeader style={{ background: activeModalReport.bg, padding: '16px 24px', borderBottom: `1px solid ${colors.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <activeModalReport.icon size={24} color={activeModalReport.color} />
                                    <ModalTitle style={{ color: colors.textMain, fontSize: '1.25rem' }}>
                                        {activeModalReport.title}
                                    </ModalTitle>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                <Suspense fallback={
                                    <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
                                        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
                                        <p style={{ marginTop: '12px', fontWeight: '600' }}>Loading Report Modal Data...</p>
                                    </div>
                                }>
                                    <activeModalReport.component />
                                </Suspense>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                )}
            </Container>
        </PageWrapper>
    );
};

export default StoresReportsDashboard;
