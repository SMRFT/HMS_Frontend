import React, { useState, useEffect, useCallback } from 'react';
import { Spin, message } from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {
    ArrowLeft,
    Printer,
    Download,
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
  padding: 30px 40px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  max-width: 950px;
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
    margin-bottom: 12px;
    .hosp-name {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .hosp-addr {
      font-size: 11px;
      margin-bottom: 2px;
    }
    .hosp-phone {
      font-size: 11px;
      margin-bottom: 10px;
    }
    .rep-name {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 6px;
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

      &.col-ip { width: 110px; }
      &.col-op { width: 110px; }
      &.col-pat { }
      &.col-date { width: 120px; }
      &.col-room { width: 110px; }
    }

    .company-header-row td {
      padding: 12px 4px 4px 4px;
      font-size: 11.5px;
      font-weight: bold;
      color: #8b0000;
      border-bottom: 1px solid #e2e8f0;
    }

    .floor-header-row td {
      padding: 8px 4px 4px 4px;
      font-size: 11px;
      font-weight: bold;
      color: #000000;
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
          margin-bottom: 1px;
        }
        .detail-line {
          color: #334155;
          line-height: 1.35;
        }
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

const OccupancyListCompanyWiseReport = ({ embedded = false }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const initialCompany = queryParams.get('company_name') || 'ALL';
    const initialOutlet = queryParams.get('outlet_name') || 'ALL';

    const [selectedCompany, setSelectedCompany] = useState(initialCompany);
    const [selectedOutlet, setSelectedOutlet] = useState(initialOutlet);
    const [companiesList, setCompaniesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [payload, setPayload] = useState(null);

    const loadData = useCallback(async (comp = selectedCompany, outl = selectedOutlet) => {
        try {
            setLoading(true);
            const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
            const url = `${getBaseUrl.replace(/\/$/, '')}/report-occupancy-company-wise/?company_name=${encodeURIComponent(comp)}&outlet_name=${encodeURIComponent(outl)}`;
            const res = await apiRequest(url, 'GET');

            if (res && res.success) {
                const dataObj = (res.data && res.data.grouped_data) ? res.data : (res.data || res);
                setPayload(dataObj);
                if (dataObj.companies && dataObj.companies.length > 0) {
                    setCompaniesList(dataObj.companies);
                }
            } else {
                message.warning(res?.message || 'No occupied beds found matching criteria.');
                setPayload(null);
            }
        } catch (err) {
            console.error('Error fetching occupancy report:', err);
            message.error('Failed to load occupancy report.');
        } finally {
            setLoading(false);
        }
    }, [selectedCompany, selectedOutlet]);

    useEffect(() => {
        loadData(initialCompany, initialOutlet);
    }, [initialCompany, initialOutlet, loadData]);

    const handlePrint = () => {
        printInsuranceReport('printable-occupancy-sheet', {
            reportTitle: 'Current Occupancy List (Companywise)',
            subtitle: `Company: ${selectedCompany} | Outlet: ${selectedOutlet}`,
            orientation: 'landscape'
        });
    };

    const handleExportExcel = () => {
        const rowsList = Array.isArray(payload?.data) ? payload.data : [];
        if (rowsList.length === 0) {
            message.info('No data available to export.');
            return;
        }

        try {
            const rows = rowsList.map(r => ({
                'Company': r.company_name,
                'Floor/Ward': r.floor,
                'IP Number': r.ip_number,
                'OP Number': r.op_number,
                'Patient Name': r.patient_name,
                'Age/Gender': r.age_gender,
                'Doctor': r.doctor_name || r.doctor || '',
                'Address': r.address,
                'Admitting Date': r.admitting_date,
                'Room Number': r.room_number
            }));

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Occupancy_List');
            XLSX.writeFile(wb, `Current_Occupancy_List_${selectedCompany}_${dayjs().format('YYYYMMDD')}.xlsx`);
        } catch (e) {
            console.error('Export error:', e);
            message.error('Export failed.');
        }
    };

    const groupedData = (payload?.grouped_data && typeof payload.grouped_data === 'object') ? payload.grouped_data : {};
    const totalBeds = payload?.total_beds_occupied != null ? payload.total_beds_occupied : (payload?.total_occupied_beds != null ? payload.total_occupied_beds : (Array.isArray(payload?.data) ? payload.data.length : 0));

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
                    #printable-occupancy-sheet,
                    #printable-occupancy-sheet * {
                        visibility: visible !important;
                    }
                    #printable-occupancy-sheet {
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
                            <h2>Current occupancy list (companywise)</h2>
                            <p>Real-time corporate & TPA bed occupancy grouped by department floor and admitting ward</p>
                        </div>
                    </div>

                    <div className="filters-side">
                        <select
                            value={selectedCompany}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedCompany(val);
                                loadData(val, selectedOutlet);
                            }}
                        >
                            <option value="ALL">COMPANYNAME: ALL</option>
                            {companiesList.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <select
                            value={selectedOutlet}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedOutlet(val);
                                loadData(selectedCompany, val);
                            }}
                        >
                            <option value="ALL">OUTLETNAME: ALL</option>
                            <option value="MAIN">Main Hospital</option>
                            <option value="ANNEX">Annex Block</option>
                        </select>

                        <button className="btn-query" onClick={() => loadData()}>
                            <RefreshCw size={15} /> Refresh
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
                    <p style={{ marginTop: '14px', color: '#64748b', fontWeight: '500' }}>Loading company bed occupancy list...</p>
                </div>
            ) : (
                <PrintableSheet id="printable-occupancy-sheet">
                    {/* Header */}
                    <div className="header-block">
                        <div className="hosp-name">SHANMUGA HOSPITAL LIMITED</div>
                        <div className="hosp-addr">51/24.Saradha College Road, Salem - 636007</div>
                        <div className="hosp-phone">04272706666</div>
                        <div className="rep-name">Current occupancy list (companywise)</div>
                    </div>

                    <table className="items-table">
                        <thead>
                            <tr>
                                <th className="col-ip">IPNUMBER</th>
                                <th className="col-op">OPNUMBER</th>
                                <th className="col-pat">PATIENTNAME</th>
                                <th className="col-date">ADMITTINGDATE</th>
                                <th className="col-room">ROOMNUMBER</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(groupedData).length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                                        No record found
                                    </td>
                                </tr>
                            ) : Object.entries(groupedData).map(([compName, floors]) => (
                                <React.Fragment key={compName}>
                                    <tr className="company-header-row">
                                        <td colSpan={5}>{compName}</td>
                                    </tr>

                                    {Object.entries(floors).map(([flName, rows]) => (
                                        <React.Fragment key={flName}>
                                            <tr className="floor-header-row">
                                                <td colSpan={5}>{flName}</td>
                                            </tr>

                                            {rows.map((r, rIdx) => (
                                                <tr key={rIdx} className="patient-row">
                                                    <td>{r.ip_number}</td>
                                                    <td>{r.op_number}</td>
                                                    <td>
                                                        <div className="pat-name-box">
                                                            <div className="bold-name">{r.patient_name}</div>
                                                            {r.age_gender && <div className="detail-line">Age: {r.age_gender}</div>}
                                                            {(r.doctor_name || r.doctor) && <div className="detail-line">Doctor: {r.doctor_name || r.doctor}</div>}
                                                            {(r.relative_info || r.relation) && <div className="detail-line">{r.relative_info || r.relation}</div>}
                                                            {r.address && <div className="detail-line">{r.address}</div>}
                                                        </div>
                                                    </td>
                                                    <td>{r.admitting_date}</td>
                                                    <td>{r.room_number}</td>
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
                        <div>Total Occupied: {totalBeds} Beds</div>
                        <div>Page 1</div>
                    </div>
                </PrintableSheet>
            )}
        </Container>
    );
};

export default OccupancyListCompanyWiseReport;

