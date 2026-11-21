import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { DatePicker, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {
    FileText,
    ShieldCheck,
    Building2,
    BedDouble,
    ClipboardList,
    FileSpreadsheet,
    HeartPulse,
    Clock,
    Layers,
    Users,
    BarChart3,
    Package,
    Calendar,
    TrendingUp,
    Search,
    Banknote,
    Download,
    Printer,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Inbox,
    RotateCcw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import apiRequest from '../../Auth/apiRequest';
import { colors, PageWrapper, fadeIn } from '../GlobalStyles';
import { printInsuranceReport } from '../Insurance_report/printInsuranceReport';

// Lazy-loaded specialized insurance reports
const InsuranceBillsDueList = lazy(() => import('../Insurance_report/InsuranceBillsDueList'));
const InsuranceBillsStatusReport = lazy(() => import('../Insurance_report/InsuranceBillsStatusReport'));
const PatientWisePharmacyIpBillReport = lazy(() => import('../Insurance_report/PatientWisePharmacyIpBillReport'));
const LabAbstractReportDetailed = lazy(() => import('../Insurance_report/LabAbstractReportDetailed'));
const MedicineAbstractReport = lazy(() => import('../Insurance_report/MedicineAbstractReport'));
const OccupancyListCompanyWiseReport = lazy(() => import('../Insurance_report/OccupancyListCompanyWiseReport'));
const InsuranceBillsStatusReportPage = lazy(() => import('../Insurance_report/InsuranceBillsStatusReportPage'));
const InsuranceBillsStatusBranchDuesReport = lazy(() => import('../Insurance_report/InsuranceBillsStatusBranchDuesReport'));
const CompanywiseRegistrationReport = lazy(() => import('../Insurance_report/CompanywiseRegistrationReport'));
const InsuranceDischargeBillAllReport = lazy(() => import('../Insurance_report/InsuranceDischargeBillAllReport'));

const { RangePicker } = DatePicker;

const Container = styled(PageWrapper)`
  min-height: 100vh;
  padding: 24px;
  background: #f8fafc;
`;

const Header = styled.div`
  margin-bottom: 24px;
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
      gap: 12px;

      .icon-box {
        background: #ecfeff;
        color: #0891b2;
        padding: 8px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    p {
      color: ${colors.textMuted};
      margin-top: 4px;
      font-size: 0.95rem;
    }
  }

  .date-section {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #ffffff;
    padding: 6px 12px;
    border-radius: 12px;
    border: 1.5px solid #e2e8f0;
  }
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
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  border: 1.5px solid ${props => props.$active ? '#0891b2' : '#cbd5e1'};
  background: ${props => props.$active ? '#ecfeff' : '#ffffff'};
  color: ${props => props.$active ? '#0891b2' : '#334155'};
  transition: all 0.15s ease;

  &:hover {
    border-color: #0891b2;
    color: #0891b2;
  }
`;

const SearchBox = styled.div`
  position: relative;
  width: 340px;
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
    height: 42px;
    border-radius: 10px;
    border: 1.5px solid #cbd5e1;
    background: #ffffff;
    padding: 0 14px 0 40px;
    font-size: 0.95rem;
    font-weight: 600;
    color: #0f172a;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #0891b2;
      box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.12);
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 22px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ReportCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 22px;
  border: 1.5px solid #cbd5e1;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 195px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: ${props => props.color || '#0891b2'};
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 24px -6px rgba(0, 0, 0, 0.1), 0 8px 12px -4px rgba(0, 0, 0, 0.04);
    border-color: ${props => props.color || '#0891b2'};

    &::before {
      opacity: 1;
    }

    .icon-wrapper {
      transform: scale(1.08);
      background: #ecfeff;
      color: #0891b2;
    }

    .arrow-icon {
      transform: translateX(4px);
      color: #0891b2;
    }
  }

  .top-meta {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;

    .icon-wrapper {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      background: #f1f5f9;
      color: ${props => props.color || '#475569'};
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s ease;
    }

    .badge {
      font-size: 0.8rem;
      font-weight: 800;
      color: #334155;
      background: #f1f5f9;
      border: 1.5px solid #cbd5e1;
      padding: 4px 10px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
  }

  .content {
    h3 {
      font-size: 1.18rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 8px 0;
      line-height: 1.35;
      letter-spacing: -0.01em;
    }
    p {
      font-size: 0.92rem;
      font-weight: 500;
      color: #334155;
      margin: 0;
      line-height: 1.5;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1.5px solid #f1f5f9;

    .scheme-tag {
      font-size: 0.88rem;
      font-weight: 700;
      color: #0891b2;
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
  background: #ecfeff;
  border-bottom: 1.5px solid #a5f3fc;
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
      color: #155e75;
      margin: 0;
    }

    .modal-tag {
      background: #0891b2;
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
  border: 1px solid ${props => props.$primary ? '#0891b2' : (props.$excel ? '#16a34a' : '#cbd5e1')};
  background: ${props => props.$primary ? '#0891b2' : (props.$excel ? '#16a34a' : '#ffffff')};
  color: ${props => (props.$primary || props.$excel) ? '#ffffff' : '#334155'};

  &:hover {
    background: ${props => props.$primary ? '#0e7490' : (props.$excel ? '#15803d' : '#f8fafc')};
    border-color: ${props => props.$primary ? '#0e7490' : (props.$excel ? '#15803d' : '#94a3b8')};
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
  padding: 16px 20px;
  border-radius: 12px;
  border: 1.5px solid #cbd5e1;
  border-left: 5px solid ${props => props.color || '#0891b2'};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  .label {
    font-size: 0.84rem;
    font-weight: 800;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 1.65rem;
    font-weight: 900;
    color: #0f172a;
    margin-top: 5px;
    letter-spacing: -0.02em;
  }
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 18px;
  background: #ffffff;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1.5px solid #cbd5e1;

  .left {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  select {
    height: 42px;
    border-radius: 8px;
    border: 1.5px solid #cbd5e1;
    padding: 0 14px;
    font-size: 0.95rem;
    font-weight: 600;
    color: #0f172a;
    background: #ffffff;
    outline: none;

    &:focus {
      border-color: #0891b2;
    }
  }
`;

const ReportTableWrapper = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1.5px solid #cbd5e1;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  thead {
    background: #e2e8f0;
    border-bottom: 2px solid #94a3b8;

    th {
      padding: 12px 14px;
      font-weight: 800;
      font-size: 0.95rem;
      color: #0f172a;
      text-align: left;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #e2e8f0;
      transition: background 0.15s ease;

      &:hover {
        background: #f1f5f9;
      }
    }

    td {
      padding: 12px 14px;
      font-size: 0.95rem;
      color: #0f172a;
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
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background: #f1f5f9;
      border-color: #94a3b8;
    }
  }
`;

// Print Template Styles
const PrintWrapper = styled.div`
  display: none;

  @media print {
    display: block;
    width: 100%;
    background: #ffffff;
    color: #000000;
    font-family: Arial, sans-serif;

    .print-header {
      text-align: center;
      margin-bottom: 16px;
      border-bottom: 2px solid #000000;
      padding-bottom: 8px;

      h2 {
        font-size: 18pt;
        font-weight: bold;
        margin: 0;
      }
      p {
        font-size: 9pt;
        margin: 2px 0;
      }
      .title {
        font-size: 13pt;
        font-weight: bold;
        margin-top: 6px;
      }
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;

      th, td {
        border: 1px solid #000000;
        padding: 4px 6px;
      }

      th {
        background: #f0f0f0;
        font-weight: bold;
      }
    }
  }
`;

// Teal Parameter Filter Modal (Matching User Screenshots)
const TealModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 16px;
`;

const TealModalContainer = styled.div`
  background: #ffffff;
  border-radius: 4px;
  width: 580px;
  max-width: 95vw;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease-out;
`;

const TealModalHeader = styled.div`
  background: #1e5655;
  padding: 16px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 1.2rem;
    font-weight: 800;
    color: #ffffff;
    margin: 0;
    letter-spacing: 0.3px;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #ffffff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    &:hover { opacity: 0.8; }
  }
`;

const TealModalBody = styled.div`
  padding: 26px;
  background: #ffffff;

  .fields-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    margin-bottom: 20px;

    &.single {
      grid-template-columns: 1fr;
    }
  }

  .field-box {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-size: 0.84rem;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    input, select {
      height: 42px;
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      padding: 0 12px;
      font-size: 0.95rem;
      font-weight: 600;
      color: #0f172a;
      outline: none;

      &:focus {
        border-color: #1e5655;
      }
    }

    .ant-picker {
      height: 42px;
      border-radius: 6px;
      border: 1.5px solid #cbd5e1;
      font-size: 0.95rem;
    }
  }

  .footer-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 18px;

    .btn-teal-print {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #1e5655;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      padding: 9px 24px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #16403f;
      }
    }
  }
`;

// ALL 30 INSURANCE REPORTS
const INSURANCE_REPORTS = [
    // 1. Bills & Dues
    {
        id: 'insurance_bills_status',
        title: 'Insurance Bills Status',
        description: 'Real-time billing, despatch, and settlement status with OP number, disallowed amounts and pending dues.',
        icon: FileText,
        color: '#0891b2',
        category: 'Bills & Dues',
        route: '/InsuranceBillsStatusReportPage',
        component: InsuranceBillsStatusReportPage
    },
    {
        id: 'insurance_bills_status_report',
        title: 'Insurance Bills Status Report',
        description: 'Complete status report per insurance company with Sl No, status, Sh Bill Number, admitting/discharge dates, and subtotals.',
        icon: ShieldCheck,
        color: '#16a34a',
        category: 'Bills & Dues',
        route: '/InsuranceBillsStatusReport',
        component: InsuranceBillsStatusReport
    },
    {
        id: 'insurance_bills_due_list',
        title: 'Insurance Bills Due List',
        description: 'Comprehensive pending receivables register with admitting date, discharge date, advance, and net dues.',
        icon: Clock,
        color: '#ea580c',
        category: 'Bills & Dues',
        route: '/InsuranceBillsDueList',
        component: InsuranceBillsDueList
    },
    {
        id: 'branch_wise_dues',
        title: 'Insurance Bills Status(Report Branch Wise) Dues',
        description: 'Hospital branch-level pending claim balances, due amounts, and settlement aging schedules.',
        icon: Building2,
        color: '#dc2626',
        category: 'Bills & Dues',
        route: '/InsuranceBillsStatusBranchDuesReport',
        component: InsuranceBillsStatusBranchDuesReport
    },
    {
        id: 'branch_wise_status',
        title: 'Insurance Bills Status(Report Branch Wise)',
        description: 'Branch-wise submitted vs approved claim amounts, realization ratios, and scrutiny status.',
        icon: Building2,
        color: '#0284c7',
        category: 'Bills & Dues',
        route: '/InsuranceBillsStatusBranchDuesReport',
        component: InsuranceBillsStatusBranchDuesReport
    },
    {
        id: 'date_wise_details',
        title: 'Date Wise Insurance Bills Details',
        description: 'Day-by-day chronological log of corporate and insurance vouchers, recovery totals, and collections.',
        icon: TrendingUp,
        color: '#059669',
        category: 'Bills & Dues'
    },
    {
        id: 'bill_number_checking',
        title: 'Insurance Bill Number Checking',
        description: 'Verification audit of bill number sequences, gaps, cancelled vouchers, and unlinked invoices.',
        icon: Search,
        color: '#6366f1',
        category: 'Bills & Dues'
    },
    {
        id: 'bills_summary',
        title: 'Insurance Bills Summary',
        description: 'Executive financial summary across all insurance companies, TDS deductions, and outstanding ledger.',
        icon: Banknote,
        color: '#16a34a',
        category: 'Bills & Dues'
    },

    // 2. Discharge Bills (8)
    {
        id: 'discharge_tkt',
        title: 'Insurance Discharge Bill (Tkt)',
        description: 'Standard inpatient discharge billing vouchers with admission ticket reference and copay details.',
        icon: ClipboardList,
        color: '#7c3aed',
        category: 'Discharge Bills',
        route: '/InsuranceDischargeBillAllReport',
        component: InsuranceDischargeBillAllReport
    },
    {
        id: 'discharge_railway',
        title: 'Insurance Discharge Bill(Railway).',
        description: 'Southern Railway inpatient discharge statements with employee grade, division, and net clearance.',
        icon: FileSpreadsheet,
        color: '#2563eb',
        category: 'Discharge Bills',
        route: '/InsuranceDischargeBillAllReport',
        component: InsuranceDischargeBillAllReport
    },
    {
        id: 'discharge_tkt_surgery',
        title: 'Insurance Discharge Bill (Tkt) Surgery',
        description: 'Itemized surgical procedure tariffs, OT charges, surgeon fees, and implant costs on discharge.',
        icon: HeartPulse,
        color: '#e11d48',
        category: 'Discharge Bills',
        route: '/InsuranceDischargeBillAllReport',
        component: InsuranceDischargeBillAllReport
    },
    {
        id: 'discharge_all_company',
        title: 'Insurance Discharge Bill(All Company).',
        description: 'Consolidated discharge register encompassing all private TPAs, government schemes, and PSUs.',
        icon: Layers,
        color: '#0d9488',
        category: 'Discharge Bills',
        route: '/InsuranceDischargeBillAllReport',
        component: InsuranceDischargeBillAllReport
    },
    {
        id: 'discharge_tkt_op',
        title: 'Insurance Discharge Bill (Tkt) OP',
        description: 'Outpatient daycare, dialysis, minor OT, and ticketed consultation discharge vouchers.',
        icon: FileText,
        color: '#d97706',
        category: 'Discharge Bills',
        route: '/InsuranceDischargeBillAllReport',
        component: InsuranceDischargeBillAllReport
    },
    {
        id: 'discharge_all',
        title: 'Insurance Discharge Bill (All)',
        description: 'Master archive of all discharge bills across wards, specialties, and credit sponsors.',
        icon: ClipboardList,
        color: '#4f46e5',
        category: 'Discharge Bills',
        route: '/InsuranceDischargeBillAllReport',
        component: InsuranceDischargeBillAllReport
    },
    {
        id: 'status_op_patients',
        title: 'Insurance Bills Status(Op Patients)',
        description: 'Billing and claim status strictly for outpatient credit visits, consultations, and day procedures.',
        icon: Users,
        color: '#0891b2',
        category: 'Discharge Bills'
    },
    {
        id: 'discharge_tkt_railway',
        title: 'Insurance Discharge Bill(TKT)Railway',
        description: 'Railway patient inpatient ticketed bills with medical book number and designated nodal approval.',
        icon: FileSpreadsheet,
        color: '#1d4ed8',
        category: 'Discharge Bills',
        route: '/InsuranceDischargeBillAllReport',
        component: InsuranceDischargeBillAllReport
    },

    // 3. Lab & Medicine
    {
        id: 'patient_wise_pharmacy_ip_bill',
        title: 'PATIENT WISE PHARMACY IP BILL DETAILED',
        description: 'Itemized IP pharmacy invoices per patient with HSN, batch, expiry, and GST breakdown.',
        icon: Package,
        color: '#0891b2',
        category: 'Lab & Medicine',
        route: '/PatientWisePharmacyIpBillReport',
        component: PatientWisePharmacyIpBillReport
    },
    {
        id: 'lab_abstract',
        title: 'Lab Abstract Report',
        description: 'Consolidated test volume, departmental revenue breakdown, and corporate tariff utilization.',
        icon: BarChart3,
        color: '#6366f1',
        category: 'Lab & Medicine',
        route: '/LabAbstractReportDetailed',
        component: LabAbstractReportDetailed
    },
    {
        id: 'medicine_abstract',
        title: 'Medicine Abstract Report',
        description: 'Pharmaceutical drug dispensations, injectable issues, and brand-wise consumption for insurance.',
        icon: Package,
        color: '#059669',
        category: 'Lab & Medicine',
        route: '/MedicineAbstractReport',
        component: MedicineAbstractReport
    },

    // 4. Registration & Occupancy
    {
        id: 'occupancy_company_wise',
        title: 'Occupancy List Company Wise',
        description: 'Live and historical company-wise ward, ICU, and room bed occupancy with admitting doctor.',
        icon: BedDouble,
        color: '#dc2626',
        category: 'Registration & Occupancy',
        route: '/OccupancyListCompanyWiseReport',
        component: OccupancyListCompanyWiseReport
    },
    {
        id: 'companywise_registration',
        title: 'Companywise Patient Registration',
        description: 'Patient registrations grouped by insurance provider, employer organization, or corporate sponsor.',
        icon: Users,
        color: '#7c3aed',
        category: 'Registration & Occupancy',
        route: '/CompanywiseRegistrationReport',
        component: CompanywiseRegistrationReport
    }
];

const CATEGORIES = [
    'All',
    'Bills & Dues',
    'Discharge Bills',
    'Lab & Medicine',
    'Registration & Occupancy'
];

const InsuranceReportsDashboard = () => {
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
    const [modalDateRange, setModalDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeReport, setActiveReport] = useState(null);

    // Dedicated parameter filter modal state (matching user screenshots)
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [targetReport, setTargetReport] = useState(null);
    const [modalFromDate, setModalFromDate] = useState(dayjs());
    const [modalToDate, setModalToDate] = useState(dayjs());
    const [modalUhid, setModalUhid] = useState('');
    const [modalIpNumber, setModalIpNumber] = useState('');
    const [modalIpOptions, setModalIpOptions] = useState([]);
    const [modalSearchingIps, setModalSearchingIps] = useState(false);
    const [modalCompanyName, setModalCompanyName] = useState('ALL');
    const [modalOutletName, setModalOutletName] = useState('ALL');

    const fetchModalIpOptions = useCallback(async (uhidVal) => {
        if (!uhidVal || uhidVal.trim().length < 2) {
            setModalIpOptions([]);
            return;
        }
        setModalSearchingIps(true);
        try {
            const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/get-ip-numbers-by-uhid/?uhid=${encodeURIComponent(uhidVal.trim())}`, 'GET');
            const admissions = res?.data?.admissions || res?.admissions || (Array.isArray(res?.data) ? res.data : []);
            if (Array.isArray(admissions) && admissions.length > 0) {
                setModalIpOptions(admissions);
                setModalIpNumber(admissions[0].ip_number);
            } else {
                setModalIpOptions([]);
            }
        } catch (err) {
            console.error('Error fetching modal IP options:', err);
            setModalIpOptions([]);
        } finally {
            setModalSearchingIps(false);
        }
    }, []);

    const handleModalUhidChange = (val) => {
        setModalUhid(val);
        if (val && val.trim().length >= 2) {
            fetchModalIpOptions(val);
        } else {
            setModalIpOptions([]);
        }
    };

    // Modal data state
    const [loadingData, setLoadingData] = useState(false);
    const [reportData, setReportData] = useState({
        columns: [],
        data: [],
        summary: {},
        companies: [],
        title: ''
    });
    const [modalSearch, setModalSearch] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    // Load specialized report data when activeReport changes
    const fetchReportData = useCallback(async (rep, dates = modalDateRange, comp = selectedCompany, search = modalSearch) => {
        if (!rep || rep.component) return;
        try {
            setLoadingData(true);
            const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
            const activeDates = dates || modalDateRange || dateRange;
            const startStr = activeDates && activeDates[0] ? activeDates[0].format('YYYY-MM-DD') : '';
            const endStr = activeDates && activeDates[1] ? activeDates[1].format('YYYY-MM-DD') : '';
            const compParam = comp || 'all';
            const searchParam = search ? encodeURIComponent(search) : '';

            const url = `${getBaseUrl.replace(/\/$/, '')}/insurance-credit-report/?report_key=${rep.id}&start_date=${startStr}&end_date=${endStr}&company_code=${compParam}&search=${searchParam}`;
            const res = await apiRequest(url, 'GET');

            if (res && res.success) {
                const payload = res.data || res;
                const results = payload.data || payload.results || (Array.isArray(payload) ? payload : []);
                setReportData({
                    columns: payload.columns || [],
                    data: results,
                    summary: payload.summary || {},
                    companies: payload.companies || [],
                    title: payload.title || rep.title
                });
            } else {
                setReportData({
                    columns: [],
                    data: [],
                    summary: {},
                    companies: [],
                    title: rep.title
                });
            }
        } catch (err) {
            console.error('Error fetching insurance report data:', err);
        } finally {
            setLoadingData(false);
        }
    }, [modalDateRange, dateRange, selectedCompany, modalSearch]);

    const handleOpenReport = (report) => {
        setTargetReport(report);
        setModalUhid('');
        setModalIpNumber('');
        setModalIpOptions([]);
        setModalSearchingIps(false);
        setModalCompanyName('ALL');
        setModalOutletName('ALL');
        setModalFromDate(dateRange[0] || dayjs().subtract(30, 'days'));
        setModalToDate(dateRange[1] || dayjs());
        setFilterModalOpen(true);
    };

    const handleFilterModalPrint = () => {
        if (!targetReport) return;
        const fDate = modalFromDate ? modalFromDate.format('YYYY-MM-DD') : '';
        const tDate = modalToDate ? modalToDate.format('YYYY-MM-DD') : '';

        const isDischarge = [
            'discharge_all', 'discharge_tkt', 'discharge_railway', 'discharge_tkt_surgery',
            'discharge_all_company', 'discharge_tkt_op', 'discharge_tkt_railway'
        ].includes(targetReport.id);

        const params = new URLSearchParams();
        if (['patient_wise_pharmacy_ip_bill', 'lab_abstract', 'medicine_abstract'].includes(targetReport.id) || isDischarge) {
            if (modalIpNumber && modalIpNumber.trim()) {
                params.append('ip_number', modalIpNumber.trim());
            }
            if (modalUhid && modalUhid.trim()) {
                params.append('uhid', modalUhid.trim());
            }
            params.append('from_date', fDate);
            params.append('to_date', tDate);
            if (isDischarge) {
                params.append('report_title', targetReport.title);
                params.append('report_type', targetReport.id);
            }
        } else if (targetReport.id === 'occupancy_company_wise') {
            params.append('company_name', modalCompanyName);
            params.append('outlet_name', modalOutletName);
        } else {
            params.append('from_date', fDate);
            params.append('to_date', tDate);
            params.append('company_name', modalCompanyName);
        }

        if (targetReport.route) {
            setFilterModalOpen(false);
            navigate(`${targetReport.route}?${params.toString()}`);
        } else {
            setFilterModalOpen(false);
            setActiveReport(targetReport);
            setSelectedCompany(modalCompanyName === 'ALL' ? 'all' : modalCompanyName);
            setModalDateRange([modalFromDate, modalToDate]);
            fetchReportData(targetReport, [modalFromDate, modalToDate], modalCompanyName);
        }
    };

    const handleCloseModal = () => {
        setActiveReport(null);
    };

    // Filter cards for dashboard
    const filteredReports = useMemo(() => {
        return INSURANCE_REPORTS.filter((rep) => {
            const matchesCat = selectedCategory === 'All' || rep.category === selectedCategory;
            const query = searchTerm.toLowerCase().trim();
            const matchesSearch = !query ||
                rep.title.toLowerCase().includes(query) ||
                rep.description.toLowerCase().includes(query) ||
                rep.category.toLowerCase().includes(query);
            return matchesCat && matchesSearch;
        });
    }, [selectedCategory, searchTerm]);

    // Filter table rows inside modal
    const filteredTableRows = useMemo(() => {
        if (!reportData.data || !Array.isArray(reportData.data)) return [];
        let rows = reportData.data;

        if (modalSearch && modalSearch.trim()) {
            const q = modalSearch.toLowerCase().trim();
            rows = rows.filter((r) => {
                return Object.values(r).some((val) =>
                    String(val || '').toLowerCase().includes(q)
                );
            });
        }

        return rows;
    }, [reportData.data, modalSearch]);

    // Match selected company to dropdown options code or name
    const selectedCompanyValue = useMemo(() => {
        if (!selectedCompany || String(selectedCompany).toLowerCase() === 'all') return 'all';
        const target = String(selectedCompany).toLowerCase().trim();
        const match = (reportData.companies || []).find(
            (c) => String(c.code).toLowerCase().trim() === target ||
                String(c.name).toLowerCase().trim() === target ||
                target.includes(String(c.name).toLowerCase().trim())
        );
        return match ? match.code : selectedCompany;
    }, [selectedCompany, reportData.companies]);

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
            const exportData = filteredTableRows.map((row) => {
                const cleanRow = {};
                (reportData.columns || []).forEach((col) => {
                    cleanRow[col.label] = row[col.key] != null ? row[col.key] : '';
                });
                return cleanRow;
            });

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Report");
            const filename = `${(activeReport?.title || 'Insurance_Report').replace(/[^a-zA-Z0-9]/g, '_')}_${dayjs().format('YYYYMMDD')}.xlsx`;
            XLSX.writeFile(wb, filename);
        } catch (e) {
            console.error('Error exporting excel:', e);
        }
    };

    // Print Report
    const handlePrint = () => {
        printInsuranceReport('insurance-modal-report-content', {
            reportTitle: activeReport?.name || 'Insurance Report',
            fromDate: modalDateRange?.[0]?.format('DD/MM/YYYY') || dateRange?.[0]?.format('DD/MM/YYYY'),
            toDate: modalDateRange?.[1]?.format('DD/MM/YYYY') || dateRange?.[1]?.format('DD/MM/YYYY'),
            orientation: 'landscape'
        });
    };

    return (
        <Container>
            {/* Header */}
            <Header>
                <div className="title-section">
                    <h1>
                        <div className="icon-box">
                            <ShieldCheck size={28} />
                        </div>
                        Insurance Report Dashboard
                    </h1>
                    <p>
                        Comprehensive corporate sponsors, ECHS, Southern Railway, ESIC claims, discharge bills, and clinical abstracts.
                    </p>
                </div>

                <div className="date-section">
                    <Calendar size={18} color="#0891b2" />
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                        format="DD/MM/YYYY"
                        allowClear={false}
                    />
                </div>
            </Header>

            {/* Controls Bar: Category tabs & Search input */}
            <ControlsBar>
                <CategoryTabs>
                    {CATEGORIES.map((cat) => (
                        <CategoryTab
                            key={cat}
                            $active={selectedCategory === cat}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat} {cat === 'All' ? `(${INSURANCE_REPORTS.length})` : ''}
                        </CategoryTab>
                    ))}
                </CategoryTabs>

                <SearchBox>
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search insurance reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchBox>
            </ControlsBar>

            {/* 30 Report Cards Grid */}
            <Grid>
                {filteredReports.map((report) => {
                    const IconComponent = report.icon || FileText;
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

                            <div className="footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="scheme-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#0891b2', fontWeight: 600 }}>
                                    <FileText size={14} /> Generate Report
                                </span>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {report.route && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(report.route);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '3px 8px',
                                                background: '#f8fafc',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                color: '#0f172a',
                                                cursor: 'pointer'
                                            }}
                                            title="Open as separate page"
                                        >
                                            Full Page <ArrowRight size={12} />
                                        </button>
                                    )}
                                    <ChevronRight className="arrow-icon" size={16} />
                                </div>
                            </div>
                        </ReportCard>
                    );
                })}
            </Grid>

            {filteredReports.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textMuted }}>
                    <Inbox size={42} style={{ opacity: 0.4, marginBottom: '10px' }} />
                    <h3 style={{ margin: '0 0 6px 0', color: colors.textMain }}>No Insurance Reports Found</h3>
                    <p style={{ margin: 0 }}>No insurance report matched "{searchTerm}".</p>
                </div>
            )}

            {/* Exact Teal Parameter Filter Modal (Matching User Screenshots) */}
            {filterModalOpen && targetReport && (
                <TealModalOverlay onClick={() => setFilterModalOpen(false)}>
                    <TealModalContainer onClick={(e) => e.stopPropagation()}>
                        <TealModalHeader>
                            <div className="title">{targetReport.title}</div>
                            <button className="close-btn" onClick={() => setFilterModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </TealModalHeader>

                        <TealModalBody>
                            {/* Inputs tailored per report */}
                            {targetReport.id === 'occupancy_company_wise' ? (
                                <div className="fields-row">
                                    <div className="field-box">
                                        <label>COMPANYNAME</label>
                                        <select
                                            value={modalCompanyName}
                                            onChange={(e) => setModalCompanyName(e.target.value)}
                                        >
                                            <option value="ALL">ALL</option>
                                            <option value="CGHS CASH">CGHS CASH</option>
                                            <option value="CGHS CREDIT">CGHS CREDIT</option>
                                            <option value="ECHS">ECHS</option>
                                            <option value="ESI">ESI</option>
                                            <option value="ESIC">ESIC</option>
                                            <option value="FOOD CORPORATION OF INDIA (FCI),">FOOD CORPORATION OF INDIA (FCI),</option>
                                            <option value="HEALTH INSURANCE TPA">HEALTH INSURANCE TPA</option>
                                            <option value="M.A.GOVT EMPLOYEE">M.A.GOVT EMPLOYEE</option>
                                            <option value="M.A.PENSIONER">M.A.PENSIONER</option>
                                            <option value="MEDI ASSIST">MEDI ASSIST</option>
                                            <option value="RAILWAY CTSE">RAILWAY CTSE</option>
                                            <option value="SELF PACKAGE">SELF PACKAGE</option>
                                            <option value="STAR HEALTH AND ALLIED INSURANCE LTD">STAR HEALTH AND ALLIED INSURANCE LTD</option>
                                            <option value="TNCMCHIS">TNCMCHIS</option>
                                            <option value="VIDAL HEALTH">VIDAL HEALTH</option>
                                        </select>
                                    </div>
                                    <div className="field-box">
                                        <label>OUTLETNAME</label>
                                        <select
                                            value={modalOutletName}
                                            onChange={(e) => setModalOutletName(e.target.value)}
                                        >
                                            <option value="ALL">ALL</option>
                                            <option value="MAIN">Main Hospital</option>
                                            <option value="ANNEX">Annex Block</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="fields-row">
                                        <div className="field-box">
                                            <label>FROM_DATE</label>
                                            <DatePicker
                                                value={modalFromDate}
                                                onChange={(dt) => setModalFromDate(dt)}
                                                format="MM/DD/YYYY"
                                                allowClear={false}
                                            />
                                        </div>
                                        <div className="field-box">
                                            <label>TO_DATE</label>
                                            <DatePicker
                                                value={modalToDate}
                                                onChange={(dt) => setModalToDate(dt)}
                                                format="MM/DD/YYYY"
                                                allowClear={false}
                                            />
                                        </div>
                                    </div>

                                    {['patient_wise_pharmacy_ip_bill', 'lab_abstract', 'medicine_abstract', 'discharge_all', 'discharge_tkt', 'discharge_railway', 'discharge_tkt_surgery', 'discharge_all_company', 'discharge_tkt_op', 'discharge_tkt_railway'].includes(targetReport.id) && (
                                        <>
                                            <div className="fields-row">
                                                <div className="field-box">
                                                    <label>UHID</label>
                                                    <input
                                                        type="text"
                                                        value={modalUhid}
                                                        onChange={(e) => handleModalUhidChange(e.target.value)}
                                                        placeholder="Enter UHID (e.g. S026/005494)..."
                                                    />
                                                </div>
                                                <div className="field-box">
                                                    <label>IP NUMBER</label>
                                                    {modalIpOptions.length > 0 ? (
                                                        <select
                                                            value={modalIpNumber}
                                                            onChange={(e) => setModalIpNumber(e.target.value)}
                                                            style={{ fontWeight: 600, color: '#0f766e' }}
                                                        >
                                                            <option value="">-- Select IP Admission --</option>
                                                            {modalIpOptions.map(opt => (
                                                                <option key={opt.ip_number} value={opt.ip_number}>
                                                                    {opt.ip_number} ({opt.admission_date ? opt.admission_date.slice(0, 10) : ''}{opt.patient_name ? ` - ${opt.patient_name}` : ''})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={modalIpNumber}
                                                            onChange={(e) => setModalIpNumber(e.target.value)}
                                                            placeholder="Enter IP Number..."
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            {modalIpOptions.length > 0 && (
                                                <div style={{ fontSize: '0.82rem', color: '#0d9488', marginTop: '-6px', marginBottom: '8px', fontWeight: 600 }}>
                                                    Found {modalIpOptions.length} inpatient admissions for this UHID. Select the desired IP number.
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {['insurance_bills_status', 'branch_wise_dues', 'branch_wise_status', 'companywise_registration', 'date_wise_details', 'bills_summary', 'status_op_patients'].includes(targetReport.id) && (
                                        <div className="fields-row single">
                                            <div className="field-box">
                                                <label>COMPANYNAME</label>
                                                <select
                                                    value={modalCompanyName}
                                                    onChange={(e) => setModalCompanyName(e.target.value)}
                                                >
                                                    <option value="ALL">ALL</option>
                                                    <option value="CGHS CASH">CGHS CASH</option>
                                                    <option value="CGHS CREDIT">CGHS CREDIT</option>
                                                    <option value="ECHS">ECHS</option>
                                                    <option value="ESI">ESI</option>
                                                    <option value="ESIC">ESIC</option>
                                                    <option value="FOOD CORPORATION OF INDIA (FCI),">FOOD CORPORATION OF INDIA (FCI),</option>
                                                    <option value="HEALTH INSURANCE TPA">HEALTH INSURANCE TPA</option>
                                                    <option value="M.A.GOVT EMPLOYEE">M.A.GOVT EMPLOYEE</option>
                                                    <option value="M.A.PENSIONER">M.A.PENSIONER</option>
                                                    <option value="MEDI ASSIST">MEDI ASSIST</option>
                                                    <option value="RAILWAY CTSE">RAILWAY CTSE</option>
                                                    <option value="SELF PACKAGE">SELF PACKAGE</option>
                                                    <option value="STAR HEALTH AND ALLIED INSURANCE LTD">STAR HEALTH AND ALLIED INSURANCE LTD</option>
                                                    <option value="TNCMCHIS">TNCMCHIS</option>
                                                    <option value="VIDAL HEALTH">VIDAL HEALTH</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="footer-actions">
                                <button className="btn-teal-print" onClick={handleFilterModalPrint}>
                                    <Printer size={15} /> Print
                                </button>
                            </div>
                        </TealModalBody>
                    </TealModalContainer>
                </TealModalOverlay>
            )}

            {/* Interactive Insurance Report Viewer Modal */}
            {activeReport && (
                <ModalOverlay onClick={handleCloseModal}>
                    <ModalContainer onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <div className="left-part">
                                {React.createElement(activeReport.icon || FileText, { size: 22, color: activeReport.color })}
                                <h2 className="modal-title">{reportData.title || activeReport.title}</h2>
                                <span className="modal-tag">{activeReport.category}</span>
                            </div>

                            <div className="actions">
                                {activeReport.route && (
                                    <ActionBtn
                                        onClick={() => {
                                            handleCloseModal();
                                            navigate(activeReport.route);
                                        }}
                                        title="Open as separate page"
                                    >
                                        <ArrowRight size={14} /> Full Page View
                                    </ActionBtn>
                                )}
                                {!activeReport.component && (
                                    <>
                                        <ActionBtn $excel onClick={handleExportExcel}>
                                            <Download size={15} /> Export Excel
                                        </ActionBtn>
                                        <ActionBtn $primary onClick={handlePrint}>
                                            <Printer size={15} /> Print Report
                                        </ActionBtn>
                                    </>
                                )}
                                <CloseButton onClick={handleCloseModal}>
                                    <X size={20} />
                                </CloseButton>
                            </div>
                        </ModalHeader>

                        <ModalBody id="insurance-modal-report-content" style={{ padding: activeReport.component ? '0' : '20px' }}>
                            {activeReport.component ? (
                                <Suspense fallback={
                                    <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
                                        <Spin size="large" />
                                        <p style={{ marginTop: '12px', fontWeight: '600' }}>Loading report component...</p>
                                    </div>
                                }>
                                    <activeReport.component embedded={true} />
                                </Suspense>
                            ) : (
                                <>
                                    {/* Summary KPI Cards */}
                                    {reportData.summary && Object.keys(reportData.summary).length > 0 && (
                                        <StatsGrid>
                                            {Object.entries(reportData.summary).map(([key, val]) => {
                                                const label = key.replace(/_/g, ' ').replace('total', '').trim();
                                                const isCurrency = typeof val === 'number' && (
                                                    key.includes('amount') || key.includes('due') || key.includes('dues') ||
                                                    key.includes('credit') || key.includes('billed') || key.includes('settled') ||
                                                    key.includes('advance') || key.includes('fee') || key.includes('fees')
                                                );
                                                return (
                                                    <StatCard key={key} color={activeReport.color}>
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
                                        <div className="left" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <RangePicker
                                                value={modalDateRange}
                                                onChange={(dates) => {
                                                    if (dates && dates[0] && dates[1]) {
                                                        setModalDateRange(dates);
                                                        setCurrentPage(1);
                                                        fetchReportData(activeReport, dates, selectedCompany, modalSearch);
                                                    }
                                                }}
                                                format="DD/MM/YYYY"
                                                allowClear={false}
                                                style={{ height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                            />

                                            <select
                                                value={selectedCompanyValue}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setSelectedCompany(val);
                                                    setCurrentPage(1);
                                                    fetchReportData(activeReport, modalDateRange, val, modalSearch);
                                                }}
                                            >
                                                <option value="all">All Companies / Schemes</option>
                                                {(reportData.companies || []).map((c) => (
                                                    <option key={c.code} value={c.code}>{c.name}</option>
                                                ))}
                                            </select>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCompany('all');
                                                    setModalSearch('');
                                                    setCurrentPage(1);
                                                    fetchReportData(activeReport, modalDateRange, 'all', '');
                                                }}
                                                title="Reset Filters"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '0 12px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    background: '#f8fafc',
                                                    color: '#475569',
                                                    fontSize: '0.82rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <RotateCcw size={14} /> Reset
                                            </button>
                                        </div>

                                        <SearchBox style={{ width: '260px' }}>
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
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#0891b2', fontWeight: 700 }}>
                                            Loading {activeReport.title} data...
                                        </div>
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
                                                                const isCur = isNum && (
                                                                    col.key.includes('amount') ||
                                                                    col.key.includes('fee') ||
                                                                    col.key.includes('due') ||
                                                                    col.key.includes('total') ||
                                                                    col.key.includes('rate') ||
                                                                    col.key.includes('paid') ||
                                                                    col.key.includes('balance') ||
                                                                    col.key.includes('charge') ||
                                                                    col.key.includes('tax') ||
                                                                    col.key.includes('gst') ||
                                                                    col.key.includes('price') ||
                                                                    col.key.includes('cost') ||
                                                                    col.key.includes('net')
                                                                );
                                                                return (
                                                                    <td
                                                                        key={col.key}
                                                                        style={{
                                                                            textAlign: col.align || (isNum ? 'right' : 'left'),
                                                                            fontWeight: isCur ? 800 : (col.key === 'patient_name' ? 700 : 500),
                                                                            fontSize: isCur ? '1rem' : '0.95rem',
                                                                            color: isCur ? '#0f172a' : '#1e293b'
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
                                                                No records found for the selected criteria.
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

                                    {/* Print Version for A4 Printing */}
                                    <PrintWrapper id="insurance-print-view">
                                        <div className="print-header">
                                            <h2>SHANMUGA HOSPITAL LIMITED</h2>
                                            <p>51/24. Saradha College Road, Salem - 636007 | Phone: 0427-2706666</p>
                                            <div className="title">
                                                {reportData.title || activeReport.title} (From {dateRange[0]?.format('DD/MM/YYYY')} To {dateRange[1]?.format('DD/MM/YYYY')})
                                            </div>
                                            <p style={{ fontSize: '8pt', color: '#555', marginTop: '2px' }}>
                                                Printed As On: {dayjs().format('DD/MM/YYYY HH:mm:ss')}
                                            </p>
                                        </div>

                                        <table>
                                            <thead>
                                                <tr>
                                                    {(reportData.columns || []).map((col) => (
                                                        <th key={col.key} style={{ textAlign: col.align || 'left' }}>
                                                            {col.label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredTableRows.map((row, idx) => (
                                                    <tr key={idx}>
                                                        {(reportData.columns || []).map((col) => {
                                                            const val = row[col.key];
                                                            const isNum = typeof val === 'number';
                                                            const isCur = isNum && (
                                                                col.key.includes('amount') ||
                                                                col.key.includes('fee') ||
                                                                col.key.includes('due') ||
                                                                col.key.includes('total') ||
                                                                col.key.includes('rate') ||
                                                                col.key.includes('paid') ||
                                                                col.key.includes('balance') ||
                                                                col.key.includes('charge') ||
                                                                col.key.includes('tax') ||
                                                                col.key.includes('gst') ||
                                                                col.key.includes('price') ||
                                                                col.key.includes('cost') ||
                                                                col.key.includes('net')
                                                            );
                                                            return (
                                                                <td
                                                                    key={col.key}
                                                                    style={{
                                                                        textAlign: col.align || (isNum ? 'right' : 'left'),
                                                                        fontWeight: isCur ? 'bold' : 'normal',
                                                                        fontSize: '9.5pt',
                                                                        color: '#000000'
                                                                    }}
                                                                >
                                                                    {isCur ? `₹${val.toFixed(2)}` : (val != null ? String(val) : '—')}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </PrintWrapper>
                                </>
                            )}
                        </ModalBody>
                    </ModalContainer>
                </ModalOverlay>
            )}
        </Container>
    );
};

export default InsuranceReportsDashboard;
