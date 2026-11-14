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
  font-size: 10px;

  @media print {
    border: none;
    box-shadow: none;
    padding: 0;
    width: 100%;
    font-size: 8.5px;
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
      padding: 3px 4px;
      font-size: 9px;
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
        font-size: 9.5px;
      }
    }

    .grand-total-row {
      background: #ffffff;
      font-weight: bold;
      td {
        border-top: 1.5px solid #000000;
        border-bottom: 1.5px solid #000000;
        padding: 5px 4px;
      }
    }
  }

  .end-footer {
    text-align: center;
    margin-top: 8px;
    font-size: 9px;
  }
`;

const InsuranceBillsStatusReportPage = ({ embedded = false }) => {
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

            const url = `${getBaseUrl.replace(/\/$/, '')}/report-insurance-bills-status/?from_date=${fDate}&to_date=${tDate}&company_name=${encodeURIComponent(comp)}`;
            const res = await apiRequest(url, 'GET');

            if (res && res.success) {
                const dataObj = (res.data && res.data.grouped_data) ? res.data : (res.data || res);
                setPayload(dataObj);
                if (dataObj.companies && dataObj.companies.length > 0) {
                    setCompaniesList(dataObj.companies);
                }
            } else {
                message.warning(res?.message || 'No insurance bill records found.');
                setPayload(null);
            }
        } catch (err) {
            console.error('Error fetching insurance bills status report:', err);
            message.error('Failed to load insurance bills status report.');
        } finally {
            setLoading(false);
        }
    }, [dateRange, selectedCompany]);

    useEffect(() => {
        loadData([dayjs(initialFrom), dayjs(initialTo)], initialCompany);
    }, [initialFrom, initialTo, initialCompany, loadData]);

    const handlePrint = () => {
        printInsuranceReport('printable-insurance-bills-status-sheet', {
            reportTitle: 'Insurance Bills Status Report',
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
            Object.entries(grouped).forEach(([compName, items]) => {
                const itemList = Array.isArray(items) ? items : [];
                itemList.forEach(r => {
                    rows.push({
                        'Company Name': compName,
                        'Bill Date': r.bill_date,
                        'OP Number': r.op_number,
                        'IP Number': r.ip_number,
                        'Bill ID': r.bill_id,
                        'Patient Name': r.patient_name,
                        'Card Number': r.card_number,
                        'Service No': r.service_no,
                        'Claim Reference': r.claim_reference,
                        'Place': r.place,
                        'Bill Amount': r.bill_amount,
                        'Despatch Date': r.despatch_date,
                        'Settlement Date': r.settlement_date,
                        'Settled Amount': r.settled_amount,
                        'TDS': r.tds,
                        'Paid By Patient': r.paid_by_patient,
                        'Disallowed Amount': r.disallowed_amount,
                        'DUE': r.due_amount,
                        'Settlement Duration': r.settlement_duration
                    });
                });
            });

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Insurance_Bills_Status');
            XLSX.writeFile(wb, `Insurance_Bills_Status_${dayjs().format('YYYYMMDD')}.xlsx`);
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
                    #printable-insurance-bills-status-sheet,
                    #printable-insurance-bills-status-sheet * {
                        visibility: visible !important;
                    }
                    #printable-insurance-bills-status-sheet {
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
                            <h2>Insurance Bills Status</h2>
                            <p>Real-time corporate claim dispatch, settlement, TDS, disallowed and pending dues audit</p>
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
                    <p style={{ marginTop: '14px', color: '#64748b', fontWeight: '500' }}>Loading insurance bills status records...</p>
                </div>
            ) : (
                <PrintableSheet id="printable-insurance-bills-status-sheet">
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
                                <th>Bill date</th>
                                <th>OP Number</th>
                                <th>IP Number</th>
                                <th>Bill ID</th>
                                <th>Patient Name</th>
                                <th>Card Number</th>
                                <th>Service No</th>
                                <th>Claim Reference</th>
                                <th>Place</th>
                                <th className="num-col">Bill Amount</th>
                                <th>Despatch Date</th>
                                <th>Settlement Date</th>
                                <th className="num-col">Settled Amount</th>
                                <th className="num-col">TDS</th>
                                <th className="num-col">Paid By Patient</th>
                                <th className="num-col">Disallowed Amount</th>
                                <th className="num-col">DUE</th>
                                <th>Settlement Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(groupedData).length === 0 ? (
                                <tr>
                                    <td colSpan={18} style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                                        No record found
                                    </td>
                                </tr>
                            ) : Object.entries(groupedData).map(([compName, items]) => (
                                <React.Fragment key={compName}>
                                    <tr className="company-row">
                                        <td colSpan={18}>Company Name : {compName}</td>
                                    </tr>
                                    {items.map((r, idx) => (
                                        <tr key={idx}>
                                            <td>{r.bill_date}</td>
                                            <td>{r.op_number}</td>
                                            <td>{r.ip_number}</td>
                                            <td>{r.bill_id}</td>
                                            <td>{r.patient_name}</td>
                                            <td>{r.card_number || ''}</td>
                                            <td>{r.service_no || ''}</td>
                                            <td>{r.claim_reference || ''}</td>
                                            <td>{r.place || ''}</td>
                                            <td className="num-col">{Number(r.bill_amount || 0).toFixed(2)}</td>
                                            <td>{r.despatch_date || ''}</td>
                                            <td>{r.settlement_date || ''}</td>
                                            <td className="num-col">{r.settled_amount ? Number(r.settled_amount).toFixed(2) : ''}</td>
                                            <td className="num-col">{r.tds ? Number(r.tds).toFixed(2) : ''}</td>
                                            <td className="num-col">{r.paid_by_patient ? Number(r.paid_by_patient).toFixed(2) : ''}</td>
                                            <td className="num-col">{r.disallowed_amount ? Number(r.disallowed_amount).toFixed(2) : ''}</td>
                                            <td className="num-col">{Number(r.due_amount || 0).toFixed(2)}</td>
                                            <td>{r.settlement_duration || ''}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}

                            {/* Grand Total Row */}
                            <tr className="grand-total-row">
                                <td colSpan={9} style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total</td>
                                <td className="num-col">{Number(grandTotal.total_bill_amount || 0).toFixed(2)}</td>
                                <td colSpan={2}></td>
                                <td className="num-col">{Number(grandTotal.total_settled_amount || 0).toFixed(2)}</td>
                                <td className="num-col">{Number(grandTotal.total_tds || 0).toFixed(2)}</td>
                                <td className="num-col">{Number(grandTotal.total_paid_by_patient || 0).toFixed(2)}</td>
                                <td className="num-col">{Number(grandTotal.total_disallowed_amount || 0).toFixed(2)}</td>
                                <td className="num-col">{Number(grandTotal.total_due_amount || 0).toFixed(2)}</td>
                                <td></td>
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

export default InsuranceBillsStatusReportPage;

