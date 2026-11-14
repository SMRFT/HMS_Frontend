import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DatePicker, Spin, message } from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {
    ShieldCheck,
    Search,
    Printer,
    Download,
    ArrowLeft,
    RefreshCw,
    Building2,
    Calendar,
    BadgePercent,
    Wallet,
    FileSpreadsheet,
    FileText,
    CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import apiRequest from '../../Auth/apiRequest';
import { colors, PageWrapper, fadeIn } from '../GlobalStyles';

const { RangePicker } = DatePicker;

const Container = styled(PageWrapper)`
  min-height: 100vh;
  padding: 24px;
  background: #f8fafc;

  @media print {
    padding: 0;
    background: #ffffff;
  }
`;

const HeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  animation: ${fadeIn} 0.3s ease-out;

  @media print {
    display: none;
  }

  .left-section {
    display: flex;
    align-items: center;
    gap: 12px;

    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #0f172a;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
    }

    h1 {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 10px;

      .icon-box {
        background: #f0fdf4;
        color: #16a34a;
        padding: 8px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    p {
      margin: 2px 0 0 0;
      color: #64748b;
      font-size: 0.85rem;
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  background: #ffffff;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);

  @media print {
    display: none;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
`;

const SearchInput = styled.div`
  position: relative;
  width: 280px;

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
    padding: 0 12px 0 38px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 0.85rem;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #16a34a;
      box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.1);
    }
  }
`;

const SelectBox = styled.select`
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background: #ffffff;
  color: #334155;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: #16a34a;
  }
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  height: 38px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: ${props => props.$primary ? 'none' : '1px solid #cbd5e1'};
  background: ${props => props.$primary ? '#16a34a' : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : '#334155'};

  &:hover {
    background: ${props => props.$primary ? '#15803d' : '#f8fafc'};
  }
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 20px;

  @media print {
    display: none;
  }
`;

const KPICard = styled.div`
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .value {
    font-size: 1.45rem;
    font-weight: 800;
    color: ${props => props.$color || '#0f172a'};
    margin-top: 4px;
  }

  .icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$bg || '#f1f5f9'};
    color: ${props => props.$color || '#475569'};
  }
`;

const PrintDocument = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
  padding: 24px;

  @media print {
    border: none;
    box-shadow: none;
    padding: 0;
  }
`;

const HospitalHeader = styled.div`
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1.5px solid #0f172a;

  h2 {
    font-size: 1.35rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    letter-spacing: 0.03em;
  }

  .sub {
    font-size: 0.85rem;
    color: #334155;
    margin: 2px 0;
  }

  .report-title-line {
    font-size: 0.92rem;
    font-weight: 700;
    color: #0f172a;
    margin-top: 6px;
  }
`;

const ReportTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.78rem;
  color: #0f172a;
  font-family: inherit;

  th {
    background: #f1f5f9;
    color: #1e293b;
    font-weight: 700;
    padding: 8px 10px;
    border-top: 1px solid #cbd5e1;
    border-bottom: 2px solid #94a3b8;
    text-align: left;
    white-space: nowrap;

    &.text-right {
      text-align: right;
    }
  }

  .company-header-row {
    td {
      background: #f8fafc;
      padding: 10px 12px;
      border-top: 2px solid #cbd5e1;
      border-bottom: 1px solid #e2e8f0;
    }
  }

  .item-row-1 {
    td {
      padding: 8px 10px 3px 10px;
      background: #ffffff;
      border-top: 1px solid #f1f5f9;
      white-space: nowrap;

      &.text-right {
        text-align: right;
      }
      &.bold {
        font-weight: 700;
      }
    }

    &:hover td {
      background: #f8fafc;
    }
  }

  .item-row-2 {
    td {
      padding: 3px 10px 10px 10px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;

      .meta-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }

      .info-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 2px 7px;
        font-size: 0.72rem;
        color: #334155;

        strong {
          color: #64748b;
          font-weight: 600;
        }

        &.success {
          background: #ecfdf5;
          border-color: #a7f3d0;
          color: #059669;
          strong {
            color: #047857;
          }
        }
      }
    }

    &:hover td {
      background: #f8fafc;
    }
  }

  .subtotal-row {
    td {
      font-weight: 700;
      font-size: 0.80rem;
      padding: 6px 10px 12px 10px;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
    }
  }

  .grand-total-row {
    td {
      font-weight: 800;
      font-size: 0.88rem;
      padding: 8px 6px;
      border-top: 1.5px solid #0f172a;
      border-bottom: 2px solid #0f172a;

      &.text-right {
        text-align: right;
      }
    }
  }
`;

const InsuranceBillsStatusReport = ({ embedded = false }) => {
    const navigate = useNavigate();
    const today = dayjs();
    const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), today]);
    const [companyFilter, setCompanyFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState({
        data: [],
        summary: {},
        companies: [],
        date_range: {}
    });

    const printRef = useRef(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
            const startStr = dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : '';
            const endStr = dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : '';

            const url = `${getBaseUrl.replace(/\/$/, '')}/insurance-credit-report/?report_key=insurance_bills_status_report&start_date=${startStr}&end_date=${endStr}&company_code=${companyFilter}&search=${encodeURIComponent(searchQuery)}`;
            const res = await apiRequest(url, 'GET');

            if (res && res.success) {
                const payload = res.data || {};
                const list = Array.isArray(payload.data)
                    ? payload.data
                    : Array.isArray(payload)
                    ? payload
                    : Array.isArray(res.data)
                    ? res.data
                    : [];
                setReportData({
                    data: list,
                    summary: payload.summary || res.summary || {},
                    companies: Array.isArray(payload.companies) ? payload.companies : (Array.isArray(res.companies) ? res.companies : []),
                    date_range: payload.date_range || res.date_range || {}
                });
            } else {
                setReportData({ data: [], summary: {}, companies: [], date_range: {} });
            }
        } catch (err) {
            console.error('Error fetching insurance status report data:', err);
            message.error('Failed to load Insurance Bills Status Report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange, companyFilter]);

    // Group rows by company_name
    const groupedData = useMemo(() => {
        const groups = {};
        const q = searchQuery.toLowerCase().trim();
        const rawList = Array.isArray(reportData?.data)
            ? reportData.data
            : Array.isArray(reportData?.data?.data)
            ? reportData.data.data
            : [];

        const filtered = rawList.filter(item => {
            if (!q) return true;
            return (
                (item.patient_name || '').toLowerCase().includes(q) ||
                (item.ip_number || '').toLowerCase().includes(q) ||
                (item.bill_id || '').toLowerCase().includes(q) ||
                (item.company_name || '').toLowerCase().includes(q) ||
                (item.card_number || '').toLowerCase().includes(q) ||
                (item.service_no || '').toLowerCase().includes(q) ||
                (item.status || '').toLowerCase().includes(q)
            );
        });

        filtered.forEach(row => {
            const comp = row.company_name || 'OTHER';
            if (!groups[comp]) {
                groups[comp] = [];
            }
            groups[comp].push(row);
        });

        return groups;
    }, [reportData.data, searchQuery]);

    // Computed totals
    const grandTotals = useMemo(() => {
        let billAmt = 0;
        let advance = 0;
        let due = 0;

        Object.values(groupedData || {}).forEach(rows => {
            if (Array.isArray(rows)) {
                rows.forEach(r => {
                    billAmt += Number(r.bill_amount) || 0;
                    advance += Number(r.advance) || 0;
                    due += Number(r.due_amount) || 0;
                });
            }
        });

        return {
            billAmt: billAmt.toFixed(2),
            advance: advance.toFixed(2),
            due: due.toFixed(2)
        };
    }, [groupedData]);

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        const rows = [];
        // Headers matching PDF Row 1 & Row 2
        rows.push([
            "Company Name", "Bill Date", "Patient Name", "Bill Amount", "Despatch Date",
            "Settlement Date", "Settled Amount", "Disallowed Amount", "DUE",
            "Card Number", "Service No", "Claim Reference", "TDS", "Paid By Patient",
            "Settlement Duration", "IP Number", "Bill ID", "Place", "Sh Bill Number",
            "Admitting Date", "Discharge Date", "Advance", "Sl No", "Status", "Old Billno"
        ]);

        Object.entries(groupedData).forEach(([comp, items]) => {
            items.forEach((it, idx) => {
                rows.push([
                    comp,
                    it.bill_date || '',
                    it.patient_name || '',
                    it.bill_amount || 0,
                    it.despatch_date || '',
                    it.settlement_date || '',
                    it.settled_amount || 0,
                    it.disallowed_amount || 0,
                    it.due_amount || 0,
                    it.card_number || '',
                    it.service_no || '',
                    it.claim_ref || '',
                    it.tds || 0,
                    it.paid_by_patient || 0,
                    it.settlement_duration || '',
                    it.ip_number || '',
                    it.bill_id || '',
                    it.place || '',
                    it.sh_bill_no || '',
                    it.admitting_date || '',
                    it.discharge_date || '',
                    it.advance || 0,
                    it.sl_no || (idx + 1),
                    it.status || 'NOT BILLED',
                    it.old_billno || ''
                ]);
            });
        });

        rows.push([
            "Grand Total", "", "", Number(grandTotals.billAmt), "", "", "", "", Number(grandTotals.due),
            "", "", "", "", "", "", "", "", "", "", "", "", Number(grandTotals.advance)
        ]);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Insurance_Bills_Status_Report");
        XLSX.writeFile(wb, `Insurance_Bills_Status_Report_${dayjs().format('YYYYMMDD')}.xlsx`);
    };

    const fromDateStr = dateRange && dateRange[0] ? dateRange[0].format('DD/MM/YYYY') : '';
    const toDateStr = dateRange && dateRange[1] ? dateRange[1].format('DD/MM/YYYY') : '';

    return (
        <Container>
            {/* Header section */}
            <HeaderBar>
                <div className="left-section">
                    {!embedded && (
                        <button className="back-btn" onClick={() => navigate('/InsuranceReportsDashboard')} title="Back to Insurance Dashboard">
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div>
                        <h1>
                            <span className="icon-box"><ShieldCheck size={22} /></span>
                            Insurance Bills Status Report
                        </h1>
                        <p>Complete status report per insurance company with Sl No, status, Sh Bill Number, admitting/discharge dates, and subtotals.</p>
                    </div>
                </div>

                <div className="actions">
                    <ActionBtn onClick={fetchData} title="Refresh Data">
                        <RefreshCw size={15} /> Refresh
                    </ActionBtn>
                    <ActionBtn onClick={handleExportExcel}>
                        <Download size={15} /> Excel
                    </ActionBtn>
                    <ActionBtn $primary onClick={handlePrint}>
                        <Printer size={15} /> Print Report
                    </ActionBtn>
                </div>
            </HeaderBar>

            {/* Filter controls */}
            <ControlsBar>
                <div className="filter-group">
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                        format="DD/MM/YYYY"
                        style={{ height: '38px', borderRadius: '8px' }}
                    />

                    <SelectBox
                        value={companyFilter}
                        onChange={(e) => setCompanyFilter(e.target.value)}
                    >
                        <option value="all">All Insurance Companies</option>
                        {(reportData.companies || []).map((c) => (
                            <option key={c.code || c.name} value={c.code || c.name}>
                                {c.name}
                            </option>
                        ))}
                    </SelectBox>
                </div>

                <SearchInput>
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search patient, IP no, bill no, status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </SearchInput>
            </ControlsBar>

            {/* KPI Summary Cards */}
            <KPIGrid>
                <KPICard $color="#16a34a" $bg="#f0fdf4">
                    <div>
                        <div className="label">Total Bills</div>
                        <div className="value">
                            {Object.values(groupedData).reduce((a, b) => a + b.length, 0)}
                        </div>
                    </div>
                    <div className="icon-wrap"><FileText size={22} /></div>
                </KPICard>

                <KPICard $color="#2563eb" $bg="#eff6ff">
                    <div>
                        <div className="label">Total Billed</div>
                        <div className="value">₹{Number(grandTotals.billAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="icon-wrap"><Wallet size={22} /></div>
                </KPICard>

                <KPICard $color="#0891b2" $bg="#ecfeff">
                    <div>
                        <div className="label">Total Advance</div>
                        <div className="value">₹{Number(grandTotals.advance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="icon-wrap"><BadgePercent size={22} /></div>
                </KPICard>

                <KPICard $color="#dc2626" $bg="#fef2f2">
                    <div>
                        <div className="label">Total DUE</div>
                        <div className="value">₹{Number(grandTotals.due).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="icon-wrap"><CheckCircle2 size={22} /></div>
                </KPICard>
            </KPIGrid>

            {/* Document Print Container */}
            <PrintDocument ref={printRef}>
                <HospitalHeader>
                    <h2>SHANMUGA HOSPITAL LIMITED</h2>
                    <div className="sub">51/24.Saradha College Road, Salem - 636007,</div>
                    <div className="report-title-line">
                        Insurance Bills Status Report From {fromDateStr} To {toDateStr}.
                    </div>
                </HospitalHeader>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: '12px', color: '#64748b' }}>Loading Insurance Status Report...</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <ReportTable>
                            <thead>
                                {/* Two-Tier Headers matching Insurance Bills Status Report.pdf */}
                                <tr>
                                    <th style={{ width: '90px' }}>Bill date</th>
                                    <th>Patient Name</th>
                                    <th className="text-right" style={{ width: '100px' }}>Bill Amount</th>
                                    <th style={{ width: '95px' }}>Despatch Date</th>
                                    <th style={{ width: '95px' }}>Settlement Date</th>
                                    <th className="text-right" style={{ width: '95px' }}>Settled Amount</th>
                                    <th className="text-right" style={{ width: '105px' }}>Disallowed Amount</th>
                                    <th className="text-right" style={{ width: '100px' }}>DUE</th>
                                </tr>
                                <tr>
                                    <th colSpan="8" style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.73rem', padding: '6px 10px', fontWeight: 600, borderBottom: '1px solid #cbd5e1' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FileText size={13} color="#0891b2" />
                                            <span>Detailed metadata line per patient includes: Card No &bull; Service No &bull; Claim Ref &bull; IP Number &bull; Bill ID &bull; Place &bull; Sh Bill &bull; Adm/Dis Date &bull; Advance &bull; Status &bull; TDS</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(groupedData).length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            No records found for the selected date range and filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    Object.entries(groupedData).map(([compName, items]) => {
                                        const compBilled = items.reduce((acc, it) => acc + (Number(it.bill_amount) || 0), 0);
                                        const compDue = items.reduce((acc, it) => acc + (Number(it.due_amount) || 0), 0);
                                        const compAdvance = items.reduce((acc, it) => acc + (Number(it.advance) || 0), 0);

                                        return (
                                            <React.Fragment key={compName}>
                                                {/* Modern Sleek Company Header */}
                                                <tr className="company-header-row">
                                                    <td colSpan="8">
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Building2 size={16} color="#0891b2" />
                                                                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                                                                    {compName}
                                                                </span>
                                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#e0f2fe', color: '#0369a1' }}>
                                                                    PVT
                                                                </span>
                                                                <span style={{ fontSize: '0.73rem', color: '#64748b', fontWeight: 600 }}>
                                                                    ({items.length} {items.length === 1 ? 'record' : 'records'})
                                                                </span>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '0.78rem' }}>
                                                                <span style={{ color: '#475569' }}>
                                                                    Billed: <strong style={{ color: '#0f172a' }}>₹{compBilled.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                                                </span>
                                                                {compAdvance > 0 && (
                                                                    <span style={{ color: '#059669' }}>
                                                                        Advance: <strong>₹{compAdvance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                                                    </span>
                                                                )}
                                                                <span style={{ color: '#dc2626' }}>
                                                                    Due: <strong style={{ color: '#dc2626' }}>₹{compDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Items: 2 lines per record */}
                                                {items.map((row, idx) => (
                                                    <React.Fragment key={`${compName}-${idx}`}>
                                                        <tr className="item-row-1">
                                                            <td>{row.bill_date || ''}</td>
                                                            <td className="bold">{row.patient_name || ''}</td>
                                                            <td className="text-right">₹{Number(row.bill_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                            <td>{row.despatch_date || ''}</td>
                                                            <td>{row.settlement_date || ''}</td>
                                                            <td className="text-right">₹{Number(row.settled_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                            <td className="text-right">₹{Number(row.disallowed_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                            <td className="text-right bold" style={{ color: '#dc2626' }}>
                                                                ₹{Number(row.due_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </td>
                                                        </tr>
                                                        <tr className="item-row-2">
                                                            <td colSpan="8">
                                                                <div className="meta-chips">
                                                                    {row.card_number && row.card_number !== '-' && (
                                                                        <span className="info-chip"><strong>Card:</strong> {row.card_number}</span>
                                                                    )}
                                                                    {row.service_no && row.service_no !== '-' && (
                                                                        <span className="info-chip"><strong>Service No:</strong> {row.service_no}</span>
                                                                    )}
                                                                    {row.claim_ref && row.claim_ref !== '-' && (
                                                                        <span className="info-chip"><strong>Claim Ref:</strong> {row.claim_ref}</span>
                                                                    )}
                                                                    <span className="info-chip"><strong>IP No:</strong> {row.ip_number || '-'}</span>
                                                                    <span className="info-chip"><strong>Bill ID:</strong> {row.bill_id || '-'}</span>
                                                                    {row.sh_bill_no && row.sh_bill_no !== '-' && (
                                                                        <span className="info-chip"><strong>Sh Bill:</strong> {row.sh_bill_no}</span>
                                                                    )}
                                                                    <span className="info-chip"><strong>Adm:</strong> {row.admitting_date || '-'}</span>
                                                                    <span className="info-chip"><strong>Dis:</strong> {row.discharge_date || '-'}</span>
                                                                    {row.place && row.place !== '-' && (
                                                                        <span className="info-chip"><strong>Place:</strong> {row.place}</span>
                                                                    )}
                                                                    {Number(row.advance || 0) > 0 && (
                                                                        <span className="info-chip success"><strong>Advance:</strong> ₹{Number(row.advance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                    )}
                                                                    {Number(row.tds || 0) > 0 && (
                                                                        <span className="info-chip"><strong>TDS:</strong> ₹{Number(row.tds).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                    )}
                                                                    {Number(row.paid_by_patient || 0) > 0 && (
                                                                        <span className="info-chip"><strong>Paid by Pat:</strong> ₹{Number(row.paid_by_patient).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                    )}
                                                                    {row.settlement_duration && row.settlement_duration !== '-' && (
                                                                        <span className="info-chip"><strong>Dur:</strong> {row.settlement_duration}</span>
                                                                    )}
                                                                    {row.status && (
                                                                        <span className="info-chip" style={{ background: '#fef3c7', borderColor: '#fde68a', color: '#b45309' }}>
                                                                            <strong>Status:</strong> {row.status}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>
                                                ))}

                                                {/* Subtotal per company */}
                                                <tr className="subtotal-row">
                                                    <td colSpan="8">
                                                        Total Bills for {compName} : {items.length}
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })
                                )}

                                {/* Grand Total Row */}
                                {Object.keys(groupedData).length > 0 && (
                                    <tr className="grand-total-row">
                                        <td colSpan="2">Grand Total</td>
                                        <td className="text-right">{grandTotals.billAmt}</td>
                                        <td colSpan="4" className="text-right" style={{ color: '#0891b2', fontSize: '0.8rem' }}>
                                            Total Advance: ₹{grandTotals.advance}
                                        </td>
                                        <td className="text-right" style={{ color: '#dc2626' }}>{grandTotals.due}</td>
                                    </tr>
                                )}
                            </tbody>
                        </ReportTable>
                    </div>
                )}
            </PrintDocument>
        </Container>
    );
};

export default InsuranceBillsStatusReport;

