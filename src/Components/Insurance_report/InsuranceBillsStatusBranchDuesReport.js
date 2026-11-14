import React, { useState, useEffect, useCallback } from 'react';
import { DatePicker, Spin, message } from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {
    ArrowLeft,
    Printer,
    Download,
    Search,
    RefreshCw
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import apiRequest from '../../Auth/apiRequest';
import { PageWrapper } from '../GlobalStyles';
import { printInsuranceReport } from './printInsuranceReport';

const Container = styled(PageWrapper)`
  min-height: 100vh;
  padding: 24px;
  background: #f8fafc;

  @media print {
    padding: 0;
    background: #ffffff;
    min-height: auto;
  }
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  @media print {
    display: none !important;
  }

  .left-side {
    display: flex;
    align-items: center;
    gap: 14px;

    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #f1f5f9;
        border-color: #94a3b8;
      }
    }

    .title-box {
      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #0f172a;
      }
      p {
        margin: 2px 0 0 0;
        font-size: 0.82rem;
        color: #64748b;
      }
    }
  }

  .filters-side {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    select {
      height: 36px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      padding: 0 12px;
      font-size: 0.85rem;
      background: #ffffff;
      color: #334155;
      outline: none;
    }

    button {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 36px;
      padding: 0 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;

      &.btn-query {
        background: #134e4a;
        color: #ffffff;
        &:hover { background: #0f3f3c; }
      }

      &.btn-excel {
        background: #ecfdf5;
        border-color: #a7f3d0;
        color: #065f46;
        &:hover { background: #d1fae5; }
      }

      &.btn-print {
        background: #0284c7;
        color: #ffffff;
        &:hover { background: #0369a1; }
      }
    }
  }
`;

const PrintableSheet = styled.div`
  background: #ffffff;
  padding: 20px 24px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  width: 100%;
  overflow-x: auto;
  color: #000000;
  font-family: Arial, sans-serif;
  font-size: 9.5px;

  @media print {
    border: none;
    box-shadow: none;
    padding: 0;
    width: 100%;
    font-size: 8px;
  }

  .header-block {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;

    .left-info {
      .hosp-name {
        font-size: 12px;
        font-weight: bold;
        letter-spacing: 0.5px;
      }
      .hosp-addr {
        font-size: 9.5px;
      }
      .rep-title {
        font-size: 10px;
        font-weight: normal;
        margin-top: 2px;
      }
    }

    .page-indicator {
      font-size: 10px;
    }
  }

  .report-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;

    th, td {
      border: 1px solid #475569;
      padding: 3px 3px;
      font-size: 8.5px;
      white-space: nowrap;
    }

    th {
      background: #f1f5f9;
      font-weight: bold;
      text-align: left;
      color: #000000;
    }

    .num-col {
      text-align: right;
    }

    .company-row {
      background: #ffffff;
      font-weight: bold;
      td {
        border-left: 1px solid #475569;
        border-right: 1px solid #475569;
        padding: 5px 6px;
        font-size: 9px;
      }
    }

    .branch-sub-row {
      background: #fafafa;
      font-weight: bold;
      td {
        padding: 3px 6px;
        font-size: 8.5px;
        color: #1e293b;
      }
    }

    .subtotal-row {
      background: #ffffff;
      font-weight: bold;
      td {
        border-top: 1px solid #475569;
        border-bottom: 1px solid #475569;
        padding: 3px 6px;
        font-size: 8.5px;
      }
    }

    .grand-total-row {
      background: #ffffff;
      font-weight: bold;
      td {
        border-top: 1.5px solid #000000;
        border-bottom: 1.5px solid #000000;
        padding: 5px 4px;
        font-size: 9px;
      }
    }
  }

  .end-footer {
    text-align: center;
    margin-top: 8px;
    font-size: 9px;
  }
`;

const InsuranceBillsStatusBranchDuesReport = ({ embedded = false }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const initialFrom = queryParams.get('from_date') || dayjs().subtract(14, 'days').format('YYYY-MM-DD');
    const initialTo = queryParams.get('to_date') || dayjs().format('YYYY-MM-DD');
    const initialCompany = queryParams.get('company_name') || 'ALL';

    const [dateRange, setDateRange] = useState([dayjs(initialFrom), dayjs(initialTo)]);
    const [selectedCompany, setSelectedCompany] = useState(initialCompany);
    const [companiesList, setCompaniesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [payload, setPayload] = useState(null);

    const loadData = useCallback(async (dates = dateRange, comp = selectedCompany) => {
        try {
            setLoading(true);
            const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
            const fDate = dates && dates[0] ? dates[0].format('YYYY-MM-DD') : '';
            const tDate = dates && dates[1] ? dates[1].format('YYYY-MM-DD') : '';

            const url = `${getBaseUrl.replace(/\/$/, '')}/report-insurance-branch-dues/?from_date=${fDate}&to_date=${tDate}&company_name=${encodeURIComponent(comp)}`;
            const res = await apiRequest(url, 'GET');

            if (res && res.success) {
                const dataObj = (res.data && res.data.grouped_data) ? res.data : (res.data || res);
                setPayload(dataObj);
                if (dataObj.companies && dataObj.companies.length > 0) {
                    setCompaniesList(dataObj.companies);
                }
            } else {
                message.warning(res?.message || 'No branch dues records found.');
                setPayload(null);
            }
        } catch (err) {
            console.error('Error fetching branch dues report:', err);
            message.error('Failed to load branch dues report.');
        } finally {
            setLoading(false);
        }
    }, [dateRange, selectedCompany]);

    useEffect(() => {
        loadData([dayjs(initialFrom), dayjs(initialTo)], initialCompany);
    }, [initialFrom, initialTo, initialCompany, loadData]);

    const handlePrint = () => {
        printInsuranceReport('printable-branch-dues-sheet', {
            reportTitle: 'Insurance Bills Status (Report Branch Wise) Dues',
            fromDate: dateRange[0]?.format('DD/MM/YYYY'),
            toDate: dateRange[1]?.format('DD/MM/YYYY'),
            orientation: 'landscape'
        });
    };

    const handleExportExcel = () => {
        const grouped = (payload?.grouped_data && typeof payload.grouped_data === 'object') ? payload.grouped_data : {};
        if (Object.keys(grouped).length === 0) {
            message.info('No data available to export.');
            return;
        }

        try {
            const rows = [];
            Object.entries(grouped).forEach(([compName, branches]) => {
                const branchObj = (branches && typeof branches === 'object') ? branches : {};
                Object.entries(branchObj).forEach(([branchName, items]) => {
                    const itemList = Array.isArray(items) ? items : [];
                    itemList.forEach((r, idx) => {
                        rows.push({
                            'Company Name': compName,
                            'Branch': branchName,
                            'Sl No': r.slno || idx + 1,
                            'Bill Date': r.bill_date,
                            'IP Number': r.ip_number,
                            'Bill ID': r.bill_id,
                            'Sh Bill Number': r.sh_bill_number,
                            'Patient Name': r.patient_name,
                            'Admitting Date': r.admitting_date,
                            'Discharge Date': r.discharge_date,
                            'Card Number': r.card_number,
                            'Service No': r.service_no,
                            'Claim Reference': r.claim_reference,
                            'Place': r.place,
                            'Bill Amount': r.bill_amount,
                            'Advance': r.advance,
                            'Despatch Date': r.despatch_date,
                            'Settlement Date': r.settlement_date,
                            'Settled Amount': r.settled_amount,
                            'TDS': r.tds,
                            'Paid By Patient': r.paid_by_patient,
                            'Disallowed Amount': r.disallowed_amount,
                            'DUE': r.due_amount,
                            'Settlement Duration': r.settlement_duration,
                            'Status': r.status,
                            'Old Billno': r.old_billno
                        });
                    });
                });
            });

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Branch_Wise_Dues');
            XLSX.writeFile(wb, `Insurance_Branch_Dues_${dayjs().format('YYYYMMDD')}.xlsx`);
        } catch (e) {
            console.error('Export error:', e);
            message.error('Export failed.');
        }
    };

    const groupedData = (payload?.grouped_data && typeof payload.grouped_data === 'object') ? payload.grouped_data : {};
    const grandTotal = payload?.grand_total || {};

    return (
        <Container>
            <style>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 6mm 8mm;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-branch-dues-sheet,
                    #printable-branch-dues-sheet * {
                        visibility: visible !important;
                    }
                    #printable-branch-dues-sheet {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        display: block !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    header, nav, aside, .sidebar, [class*="HeaderContainer"], [class*="SidebarContainer"], .no-print, button, input, select {
                        display: none !important;
                    }
                }
            `}</style>
            {!embedded && (
                <ControlBar>
                    <div className="left-side">
                        <button className="back-btn" onClick={() => navigate(-1)} title="Go back">
                            <ArrowLeft size={18} />
                        </button>
                        <div className="title-box">
                            <h2>Insurance Bills Status(Report Branch Wise) Dues</h2>
                            <p>Multi-branch (PVT / SH) insurance billing audit with admitting & discharge dates, advances, and dues</p>
                        </div>
                    </div>

                    <div className="filters-side">
                        <DatePicker.RangePicker
                            value={dateRange}
                            onChange={(dates) => {
                                setDateRange(dates);
                                if (dates) loadData(dates, selectedCompany);
                            }}
                            format="DD/MM/YYYY"
                            allowClear={false}
                            style={{ height: '36px', borderRadius: '8px' }}
                        />

                        <select
                            value={selectedCompany}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedCompany(val);
                                loadData(dateRange, val);
                            }}
                        >
                            <option value="ALL">COMPANYNAME: ALL</option>
                            {companiesList.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <button className="btn-query" onClick={() => loadData()}>
                            <Search size={15} /> Search
                        </button>

                        <button className="btn-excel" onClick={handleExportExcel}>
                            <Download size={15} /> Export Excel
                        </button>

                        <button className="btn-print" onClick={handlePrint}>
                            <Printer size={15} /> Print
                        </button>
                    </div>
                </ControlBar>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: '14px', color: '#64748b', fontWeight: '500' }}>Loading branch dues statement...</p>
                </div>
            ) : (
                <PrintableSheet id="printable-branch-dues-sheet">
                    {/* Header */}
                    <div className="header-block">
                        <div className="left-info">
                            <div className="hosp-name">SHANMUGA HOSPITAL LIMITED</div>
                            <div className="hosp-addr">51/24.Saradha College Road, Salem - 636007,</div>
                            <div className="rep-title">
                                Insurance Bills Status Report From {dateRange[0]?.format('DD/MM/YYYY')} To {dateRange[1]?.format('DD/MM/YYYY')}.
                            </div>
                        </div>
                        <div className="page-indicator">
                            Page : 1.
                        </div>
                    </div>

                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Sl No</th>
                                <th>Bill date</th>
                                <th>IP Number</th>
                                <th>Bill ID</th>
                                <th>Sh Bill Number</th>
                                <th>Patient Name</th>
                                <th>Admitting Date</th>
                                <th>Discharge Date</th>
                                <th>Card Number</th>
                                <th>Service No</th>
                                <th>Claim Reference</th>
                                <th>Place</th>
                                <th className="num-col">Bill Amount</th>
                                <th className="num-col">Advance</th>
                                <th>Despatch Date</th>
                                <th>Settlement Date</th>
                                <th className="num-col">Settled Amount</th>
                                <th className="num-col">TDS</th>
                                <th className="num-col">Paid By Patient</th>
                                <th className="num-col">Disallowed Amount</th>
                                <th className="num-col">DUE</th>
                                <th>Settlement Duration</th>
                                <th>Status</th>
                                <th>Old Billno</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(groupedData).length === 0 ? (
                                <tr>
                                    <td colSpan={24} style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                                        No record found
                                    </td>
                                </tr>
                            ) : Object.entries(groupedData).map(([compName, branches]) => (
                                <React.Fragment key={compName}>
                                    <tr className="company-row">
                                        <td colSpan={24}>Company Name : {compName}</td>
                                    </tr>

                                    {Object.entries(branches).map(([branchName, items]) => (
                                        <React.Fragment key={branchName}>
                                            <tr className="branch-sub-row">
                                                <td colSpan={24}>{branchName}</td>
                                            </tr>

                                            {items.map((r, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ textAlign: 'center' }}>{r.slno || idx + 1}</td>
                                                    <td>{r.bill_date}</td>
                                                    <td>{r.ip_number}</td>
                                                    <td>{r.bill_id}</td>
                                                    <td>{r.sh_bill_number}</td>
                                                    <td>{r.patient_name}</td>
                                                    <td>{r.admitting_date}</td>
                                                    <td>{r.discharge_date}</td>
                                                    <td>{r.card_number || ''}</td>
                                                    <td>{r.service_no || ''}</td>
                                                    <td>{r.claim_reference || ''}</td>
                                                    <td>{r.place || ''}</td>
                                                    <td className="num-col">{Number(r.bill_amount || 0).toFixed(2)}</td>
                                                    <td className="num-col">{r.advance ? Number(r.advance).toFixed(2) : ''}</td>
                                                    <td>{r.despatch_date || ''}</td>
                                                    <td>{r.settlement_date || ''}</td>
                                                    <td className="num-col">{r.settled_amount ? Number(r.settled_amount).toFixed(2) : ''}</td>
                                                    <td className="num-col">{r.tds ? Number(r.tds).toFixed(2) : ''}</td>
                                                    <td className="num-col">{r.paid_by_patient ? Number(r.paid_by_patient).toFixed(2) : ''}</td>
                                                    <td className="num-col">{r.disallowed_amount ? Number(r.disallowed_amount).toFixed(2) : ''}</td>
                                                    <td className="num-col">{Number(r.due_amount || 0).toFixed(2)}</td>
                                                    <td>{r.settlement_duration || ''}</td>
                                                    <td>{r.status || 'NOT BILLED'}</td>
                                                    <td>{r.old_billno || ''}</td>
                                                </tr>
                                            ))}

                                            {/* Subtotal row per branch */}
                                            <tr className="subtotal-row">
                                                <td colSpan={24}>Total Bills : {items.length}</td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}

                            {/* Grand Total Row */}
                            <tr className="grand-total-row">
                                <td colSpan={12} style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total</td>
                                <td className="num-col">{Number(grandTotal.total_bill_amount || 0).toFixed(2)}</td>
                                <td className="num-col">{Number(grandTotal.total_advance || 0).toFixed(2)}</td>
                                <td colSpan={2}></td>
                                <td className="num-col">{Number(grandTotal.total_settled_amount || 0).toFixed(2)}</td>
                                <td className="num-col">{Number(grandTotal.total_tds || 0).toFixed(2)}</td>
                                <td className="num-col">{Number(grandTotal.total_paid_by_patient || 0).toFixed(2)}</td>
                                <td className="num-col">{Number(grandTotal.total_disallowed_amount || 0).toFixed(2)}</td>
                                <td className="num-col">{Number(grandTotal.total_due_amount || 0).toFixed(2)}</td>
                                <td colSpan={3}></td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="end-footer">
                        (End.)
                    </div>
                </PrintableSheet>
            )}
        </Container>
    );
};

export default InsuranceBillsStatusBranchDuesReport;

