import React, { useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { 
    FileText, 
    Users, 
    Calendar, 
    TrendingUp, 
    Activity, 
    CreditCard, 
    BarChart3, 
    ClipboardList,
    Clock,
    UserCheck,
    ShieldCheck,
    ArrowRight,
    LayoutDashboard,
    X,
    Maximize2,
    Filter
} from "lucide-react";
import styled, { keyframes } from "styled-components";
import { Modal, DatePicker, Button, Tooltip, Spin } from "antd";
import dayjs from "dayjs";
import { colors, PageWrapper, fadeIn, FormRow, InputWrapper, Label } from "../GlobalStyles";

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

const { RangePicker } = DatePicker;

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
        border-radius: 16px;
        padding: 0;
        overflow: hidden;
    }
    .ant-modal-body {
        padding: 0;
        max-height: 85vh;
        overflow-y: auto;
    }
    .ant-modal-close {
        top: 20px;
        right: 20px;
        background: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
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

const ReportContainer = styled.div`
    padding: 20px;
    background: ${colors.background};
    
    // Override some PageWrapper styles if needed when inside modal
    & > div {
        margin-top: 0 !important;
        box-shadow: none !important;
    }
`;

const ReportsDashboard = () => {
    const navigate = useNavigate();
    const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);

    const closeModal = () => {
        setIsConfigModalVisible(false);
        setIsReportModalVisible(false);
    };

    const reportsList = [
        {
            id: "bill_wise",
            title: "Bill Wise Report",
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
            title: "Discharge Bills",
            description: "Summary of billing for all discharged patients",
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
            title: "Advance Registration",
            description: "Reports for patients with advance registration entries",
            icon: <UserCheck size={24} />,
            component: AdvanceRegistration,
            color: colors.primary
        },
        {
            id: "insurance_advance",
            title: "Insurance Advance",
            description: "Advance registration reports for insurance-linked patients",
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
        }
    ];

    const handleCardClick = (report) => {
        if (report.path) {
            navigate(report.path);
        } else {
            setSelectedReport(report);
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
        
        return (
            <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}><Spin size="large" /></div>}>
                <ReportComponent 
                    isModalView={true} 
                    startDate={dateRange[0].format("YYYY-MM-DD")}
                    endDate={dateRange[1].format("YYYY-MM-DD")}
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
                <div style={{ display: 'flex', gap: '12px' }}>
                    {/* <Tooltip title="Refresh Dashboard">
                        <Button shape="circle" icon={<Activity size={18} />} />
                    </Tooltip> */}
                    {/* <Button type="primary" icon={<LayoutDashboard size={18} />} style={{ borderRadius: '10px', height: '40px', fontWeight: 600 }}>
                        Dashboard View
                    </Button> */}
                </div>
            </Header>

            <Grid>
                {reportsList.map((report) => (
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
                            <span className="view-text">Generate Report</span>
                            <ArrowRight className="arrow-icon" size={18} />
                        </div>
                    </ReportCard>
                ))}
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
                                onChange={(date) => setDateRange([date, dateRange[1]])}
                                format="DD/MM/YYYY"
                                style={{ width: '100%', borderRadius: '8px', padding: '10px 12px' }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>To Date</Label>
                            <DatePicker 
                                value={dateRange[1]} 
                                onChange={(date) => setDateRange([dateRange[0], date])}
                                format="DD/MM/YYYY"
                                style={{ width: '100%', borderRadius: '8px', padding: '10px 12px' }}
                            />
                        </InputWrapper>
                    </FormRow>
                    <p style={{ color: colors.textMuted, fontSize: '0.75rem', marginTop: '12px' }}>
                        * The report will be generated for the period between {dateRange[0] ? dateRange[0].format('DD/MM/YYYY') : '—'} and {dateRange[1] ? dateRange[1].format('DD/MM/YYYY') : '—'}.
                    </p>
                </DatePickerWrapper>
            </StyledModal>

            {/* Full Report Display Modal */}
            <ReportModal
                title={null}
                open={isReportModalVisible}
                onCancel={closeModal}
                footer={null}
                width="95%"
                centered
                destroyOnClose
                closable={false}
            >
                <ReportContainer>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 10px' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: colors.textMain }}>{selectedReport?.title}</h2>
                            <p style={{ margin: 0, color: colors.textMuted }}>Period: {dateRange[0]?.format('DD/MM/YYYY')} - {dateRange[1]?.format('DD/MM/YYYY')}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button icon={<Filter size={16} />} onClick={() => { setIsReportModalVisible(false); setIsConfigModalVisible(true); }}>
                                Change Dates
                            </Button>
                            <Button type="primary" danger icon={<X size={16} />} onClick={closeModal}>
                                Close
                            </Button>
                        </div>
                    </div>
                    {renderSelectedReport()}
                </ReportContainer>
            </ReportModal>
        </Container>
    );
};

export default ReportsDashboard;
