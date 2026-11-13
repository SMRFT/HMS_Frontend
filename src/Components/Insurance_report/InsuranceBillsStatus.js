import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DatePicker, Spin, message } from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {
    FileText,
    Search,
    Printer,
    Download,
    ArrowLeft,
    RefreshCw,
    Building2,
    Calendar,
    Wallet,
    CheckCircle2,
    XCircle,
    Clock,
    FileSpreadsheet
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
        background: #ecfeff;
        color: #0891b2;
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
      border-color: #0891b2;
      box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.1);
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
    border-color: #0891b2;
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
  background: ${props => props.$primary ? '#0891b2' : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : '#334155'};

  &:hover {
    background: ${props => props.$primary ? '#0e7490' : '#f8fafc'};
  }
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  border-collapse: collapse;
  font-size: 0.76rem;
  color: #0f172a;

  th {
    background: #f8fafc;
    color: #0f172a;
    font-weight: 700;
    padding: 5px 6px;
    border-top: 1px solid #0f172a;
    border-bottom: 1px solid #0f172a;
    text-align: left;
    white-space: nowrap;

    &.text-right {
      text-align: right;
    }
  }

  .company-row {
    td {
      font-weight: 800;
      font-size: 0.84rem;
      padding: 10px 6px 4px 6px;
      color: #0f172a;
      border: none;
    }
  }

  .item-row-1 {
    td {
      padding: 4px 6px 1px 6px;
      border-top: 1px dotted #e2e8f0;
      white-space: nowrap;

      &.text-right {
        text-align: right;
      }
      &.bold {
        font-weight: 700;
      }
    }
  }

  .item-row-2 {
    td {
      padding: 1px 6px 6px 6px;
      color: #475569;
      font-size: 0.72rem;
      border-bottom: 1px dotted #e2e8f0;
      white-space: nowrap;

      &.text-right {
        text-align: right;
      }
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

const InsuranceBillsStatus = ({ embedded = false }) => {
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

            const url = `${getBaseUrl.replace(/\/$/, '')}/insurance-credit-report/?report_key=insurance_bills_status&start_date=${startStr}&end_date=${endStr}&company_code=${companyFilter}&search=${encodeURIComponent(searchQuery)}`;
            const res = await apiRequest(url, 'GET');

            if (res && res.success) {
                setReportData({
                    data: res.data || [],
                    summary: res.summary || {},
                    companies: res.companies || [],
                    date_range: res.date_range || {}
                });
            } else {
                setReportData({ data: [], summary: {}, companies: [], date_range: {} });
            }
        } catch (err) {
            console.error('Error fetching bills status data:', err);
            message.error('Failed to load Insurance Bills Status');
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

        const filtered = (reportData.data || []).filter(item => {
            if (!q) return true;
            return (
                (item.patient_name || '').toLowerCase().includes(q) ||
                (item.op_number || '').toLowerCase().includes(q) ||
                (item.ip_number || '').toLowerCase().includes(q) ||
                (item.bill_id || '').toLowerCase().includes(q) ||
                (item.company_name || '').toLowerCase().includes(q) ||
                (item.card_number || '').toLowerCase().includes(q) ||
                (item.claim_ref || '').toLowerCase().includes(q)
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
        let settled = 0;
        let disallowed = 0;
        let due = 0;

        Object.values(groupedData).forEach(rows => {
            rows.forEach(r => {
                billAmt += Number(r.bill_amount) || 0;
                settled += Number(r.settled_amount) || 0;
                disallowed += Number(r.disallowed_amount) || 0;
                due += Number(r.due_amount) || 0;
            });
        });

        return {
            billAmt: billAmt.toFixed(2),
            settled: settled.toFixed(2),
            disallowed: disallowed.toFixed(2),
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
            "Company Name", "Bill Date", "Patient Name", "Bill Amount", "OP Number",
            "Despatch Date", "Settlement Date", "Settled Amount", "Disallowed Amount", "DUE",
            "Card Number", "Service No", "Claim Reference", "TDS", "Paid By Patient",
            "Settlement Duration", "IP Number", "Bill ID", "Place"
        ]);

        Object.entries(groupedData).forEach(([comp, items]) => {
            items.forEach(it => {
                rows.push([
                    comp,
                    it.bill_date || '',
                    it.patient_name || '',
                    it.bill_amount || 0,
                    it.op_number || '',
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
                    it.place || ''
                ]);
            });
        });

        rows.push([
            "Grand Total", "", "", Number(grandTotals.billAmt), "", "", "",
            Number(grandTotals.settled), Number(grandTotals.disallowed), Number(grandTotals.due)
        ]);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Insurance_Bills_Status");
        XLSX.writeFile(wb, `Insurance_Bills_Status_${dayjs().format('YYYYMMDD')}.xlsx`);
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
                            <span className="icon-box"><FileText size={22} /></span>
                            Insurance Bills Status
                        </h1>
                        <p>Real-time billing, despatch, and settlement status with OP number, disallowed amounts, and pending dues.</p>
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
                        placeholder="Search patient, OP no, IP no, bill no, card..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </SearchInput>
            </ControlsBar>

            {/* KPI Summary Cards */}
            <KPIGrid>
                <KPICard $color="#0891b2" $bg="#ecfeff">
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

                <KPICard $color="#059669" $bg="#ecfdf5">
                    <div>
                        <div className="label">Settled Amount</div>
                        <div className="value">₹{Number(grandTotals.settled).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="icon-wrap"><CheckCircle2 size={22} /></div>
                </KPICard>

                <KPICard $color="#dc2626" $bg="#fef2f2">
                    <div>
                        <div className="label">Pending DUE</div>
                        <div className="value">₹{Number(grandTotals.due).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="icon-wrap"><Clock size={22} /></div>
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
                        <p style={{ marginTop: '12px', color: '#64748b' }}>Loading Insurance Bills...</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <ReportTable>
                            <thead>
                                {/* Two-Tier Headers matching Insurance Bills Status.pdf */}
                                <tr>
                                    <th style={{ width: '85px' }}>Bill date</th>
                                    <th>Patient Name</th>
                                    <th className="text-right" style={{ width: '95px' }}>Bill Amount</th>
                                    <th style={{ width: '95px' }}>OP Number</th>
                                    <th style={{ width: '90px' }}>Despatch Date</th>
                                    <th style={{ width: '90px' }}>Settlement Date</th>
                                    <th className="text-right" style={{ width: '90px' }}>Settled Amount</th>
                                    <th className="text-right" style={{ width: '100px' }}>Disallowed Amount</th>
                                    <th className="text-right" style={{ width: '95px' }}>DUE</th>
                                </tr>
                                <tr>
                                    <th colSpan="9" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', padding: '4px 6px' }}>
                                        Card Number &nbsp;|&nbsp; Service No &nbsp;|&nbsp; Claim Reference &nbsp;|&nbsp; TDS &nbsp;|&nbsp; Paid By Patient &nbsp;|&nbsp; Settlement Duration &nbsp;|&nbsp; IP Number &nbsp;|&nbsp; Bill ID &nbsp;|&nbsp; Place
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(groupedData).length === 0 ? (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            No records found for the selected date range and filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    Object.entries(groupedData).map(([compName, items]) => (
                                        <React.Fragment key={compName}>
                                            {/* Company Header */}
                                            <tr className="company-row">
                                                <td colSpan="9">
                                                    Company Name : {compName}
                                                </td>
                                            </tr>

                                            {/* Items: 2 lines per record */}
                                            {items.map((row, idx) => (
                                                <React.Fragment key={`${compName}-${idx}`}>
                                                    <tr className="item-row-1">
                                                        <td>{row.bill_date || ''}</td>
                                                        <td className="bold">{row.patient_name || ''}</td>
                                                        <td className="text-right">{Number(row.bill_amount || 0).toFixed(2)}</td>
                                                        <td style={{ color: '#0891b2', fontWeight: '600' }}>{row.op_number || '-'}</td>
                                                        <td>{row.despatch_date || ''}</td>
                                                        <td>{row.settlement_date || ''}</td>
                                                        <td className="text-right">{Number(row.settled_amount || 0).toFixed(2)}</td>
                                                        <td className="text-right">{Number(row.disallowed_amount || 0).toFixed(2)}</td>
                                                        <td className="text-right bold">{Number(row.due_amount || 0).toFixed(2)}</td>
                                                    </tr>
                                                    <tr className="item-row-2">
                                                        <td colSpan="9">
                                                            <span><strong>Card:</strong> {row.card_number || '-'}</span> &nbsp;|&nbsp;
                                                            <span><strong>Service:</strong> {row.service_no || '-'}</span> &nbsp;|&nbsp;
                                                            <span><strong>Claim:</strong> {row.claim_ref || '-'}</span> &nbsp;|&nbsp;
                                                            <span><strong>TDS:</strong> {Number(row.tds || 0).toFixed(2)}</span> &nbsp;|&nbsp;
                                                            <span><strong>Paid:</strong> {Number(row.paid_by_patient || 0).toFixed(2)}</span> &nbsp;|&nbsp;
                                                            <span><strong>Dur:</strong> {row.settlement_duration || '-'}</span> &nbsp;|&nbsp;
                                                            <span><strong>IP:</strong> {row.ip_number || '-'}</span> &nbsp;|&nbsp;
                                                            <span><strong>Bill ID:</strong> {row.bill_id || '-'}</span> &nbsp;|&nbsp;
                                                            <span><strong>Place:</strong> {row.place || '-'}</span>
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            ))}
                                        </React.Fragment>
                                    ))
                                )}

                                {/* Grand Total Row */}
                                {Object.keys(groupedData).length > 0 && (
                                    <tr className="grand-total-row">
                                        <td colSpan="2">Grand Total</td>
                                        <td className="text-right">{grandTotals.billAmt}</td>
                                        <td colSpan="5" className="text-right" style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                            Settled: ₹{grandTotals.settled} | Disallowed: ₹{grandTotals.disallowed}
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

export default InsuranceBillsStatus;

