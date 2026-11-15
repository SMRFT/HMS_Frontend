import React, { useState, useEffect, useCallback } from 'react';
import { DatePicker, Spin, message } from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {
    ArrowLeft,
    Printer,
    Download,
    Search,
    RefreshCw,
    Users
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
  padding: 30px 40px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  max-width: 900px;
  margin: 0 auto;
  color: #000000;
  font-family: Arial, sans-serif;
  font-size: 11px;

  @media print {
    border: none;
    box-shadow: none;
    padding: 0;
    max-width: 100%;
    margin: 0;
  }

  .header-block {
    margin-bottom: 14px;
    .hosp-name {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .hosp-addr {
      font-size: 11px;
      margin-bottom: 12px;
    }
    .rep-name {
      font-size: 11.5px;
      margin-bottom: 4px;
    }
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;

    th {
      border-top: 1.5px solid #8b0000;
      border-bottom: 1.5px solid #8b0000;
      padding: 6px 4px;
      text-align: left;
      font-weight: bold;
      font-size: 11px;
      color: #8b0000;

      &.col-op { width: 130px; }
      &.col-pat { width: 330px; }
      &.col-doc { width: 260px; }
      &.col-status { width: 100px; }
    }

    .date-heading-row td {
      padding: 10px 4px 4px 4px;
      font-weight: bold;
      font-size: 11px;
      color: #8b0000;
    }

    .company-header-row td {
      padding: 8px 4px 4px 4px;
      font-size: 11.5px;
      font-weight: bold;
      color: #8b0000;
      background: #fafafa;
    }

    .patient-row td {
      padding: 6px 4px;
      font-size: 10.5px;
      vertical-align: top;
      border-bottom: 0.5px solid #f1f5f9;

      .pat-name-box {
        .bold-name {
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 2px;
        }
        .address-line {
          color: #334155;
          line-height: 1.35;
        }
      }

      .doctor-name-box {
        font-weight: bold;
        line-height: 1.35;
      }
    }
  }

  .footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #000000;
    margin-top: 24px;
    padding-top: 6px;
    font-size: 10.5px;
  }
`;

const CompanywiseRegistrationReport = ({ embedded = false }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const initialFrom = queryParams.get('from_date') || dayjs().format('YYYY-MM-DD');
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

            const url = `${getBaseUrl.replace(/\/$/, '')}/report-companywise-registration/?from_date=${fDate}&to_date=${tDate}&company_name=${encodeURIComponent(comp)}`;
            const res = await apiRequest(url, 'GET');

            if (res && res.success) {
                const dataObj = (res.data && res.data.grouped_data) ? res.data : (res.data || res);
                setPayload(dataObj);
                if (dataObj.companies && dataObj.companies.length > 0) {
                    setCompaniesList(dataObj.companies);
                }
            } else {
                message.warning(res?.message || 'No company registration records found.');
                setPayload(null);
            }
        } catch (err) {
            console.error('Error fetching companywise registration report:', err);
            message.error('Failed to load registration report.');
        } finally {
            setLoading(false);
        }
    }, [dateRange, selectedCompany]);

    useEffect(() => {
        loadData([dayjs(initialFrom), dayjs(initialTo)], initialCompany);
    }, [initialFrom, initialTo, initialCompany, loadData]);

    const handlePrint = () => {
        printInsuranceReport('printable-company-reg-sheet', {
            reportTitle: 'Company Wise Registration Details',
            fromDate: dateRange[0]?.format('DD/MM/YYYY'),
            toDate: dateRange[1]?.format('DD/MM/YYYY'),
            orientation: 'portrait'
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
            Object.entries(grouped).forEach(([dStr, comps]) => {
                const compObj = (comps && typeof comps === 'object') ? comps : {};
                Object.entries(compObj).forEach(([compName, items]) => {
                    const itemList = Array.isArray(items) ? items : [];
                    itemList.forEach(r => {
                        rows.push({
                            'Registration Date': dStr,
                            'Company Name': compName,
                            'OP Number': r.op_number,
                            'Patient Name': r.patient_name,
                            'Address': r.address,
                            'Doctor Name': r.doctor_name,
                            'Claim Status': r.claim_status || ''
                        });
                    });
                });
            });

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Company_Registration');
            XLSX.writeFile(wb, `Company_Registration_${dayjs().format('YYYYMMDD')}.xlsx`);
        } catch (e) {
            console.error('Export error:', e);
            message.error('Export failed.');
        }
    };

    const groupedData = (payload?.grouped_data && typeof payload.grouped_data === 'object') ? payload.grouped_data : {};
    const totalRegistrations = payload?.total_registrations || 0;

    return (
        <Container>
            <style>{`
                @media print {
                    @page {
                        size: portrait;
                        margin: 6mm 8mm;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-company-reg-sheet,
                    #printable-company-reg-sheet * {
                        visibility: visible !important;
                    }
                    #printable-company-reg-sheet {
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
                            <h2>Company wise registration</h2>
                            <p>Chronological patient registration register grouped by corporate sponsors, TPAs, and defense schemes</p>
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
                    <p style={{ marginTop: '14px', color: '#64748b', fontWeight: '500' }}>Loading company registrations statement...</p>
                </div>
            ) : (
                <PrintableSheet id="printable-company-reg-sheet">
                    {/* Header */}
                    <div className="header-block">
                        <div className="hosp-name">SHANMUGA HOSPITAL LIMITED</div>
                        <div className="hosp-addr">51/24.Saradha College Road, Salem - 636007</div>
                        <div className="rep-name">
                            Company wise registration details {dateRange[0]?.format('DD/MM/YYYY')} and {dateRange[1]?.format('DD/MM/YYYY')}
                        </div>
                    </div>

                    <table className="items-table">
                        <thead>
                            <tr>
                                <th className="col-op">OPNUMBER</th>
                                <th className="col-pat">PATIENTNAME</th>
                                <th className="col-doc">Doctor Name</th>
                                <th className="col-status">Claim Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(groupedData).length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                                        No record found
                                    </td>
                                </tr>
                            ) : Object.entries(groupedData).map(([dStr, comps]) => (
                                <React.Fragment key={dStr}>
                                    <tr className="date-heading-row">
                                        <td colSpan={4}>{dStr}</td>
                                    </tr>

                                    {Object.entries(comps).map(([compName, items]) => (
                                        <React.Fragment key={compName}>
                                            <tr className="company-header-row">
                                                <td colSpan={4}>{compName}</td>
                                            </tr>

                                            {items.map((r, idx) => (
                                                <tr key={idx} className="patient-row">
                                                    <td>{r.op_number}</td>
                                                    <td>
                                                        <div className="pat-name-box">
                                                            <div className="bold-name">{r.patient_name}</div>
                                                            {r.address && <div className="address-line">{r.address}</div>}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="doctor-name-box">
                                                            {r.doctor_name || '-'}
                                                        </div>
                                                    </td>
                                                    <td>{r.claim_status || ''}</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    <div className="footer-row">
                        <div>{dayjs().format('DD/MM/YYYY HH:mm:ss')}</div>
                        <div>Total Registrations: {totalRegistrations} Patients</div>
                        <div>Page 1</div>
                    </div>
                </PrintableSheet>
            )}
        </Container>
    );
};

export default CompanywiseRegistrationReport;

