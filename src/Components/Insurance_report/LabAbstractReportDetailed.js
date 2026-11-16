import React, { useState, useEffect, useCallback } from 'react';
import { DatePicker, Spin, message } from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {
    ArrowLeft,
    Printer,
    Download,
    Search,
    User
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

    .filter-input {
      display: flex;
      align-items: center;
      gap: 6px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0 10px;
      height: 36px;
      background: #ffffff;

      input {
        border: none;
        outline: none;
        font-size: 0.85rem;
        width: 140px;
      }
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
      margin-bottom: 12px;
    }
    .rep-name {
      font-size: 12px;
      font-weight: normal;
      margin-bottom: 8px;
    }
  }

  .divider-line {
    border-top: 1px solid #000000;
    margin: 6px 0;
  }

  .patient-bar {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    padding: 3px 0;

    .left-side {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .right-side {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 250px;
    }

    .row-field {
      display: flex;
      .field-lbl {
        width: 100px;
      }
      .field-val {
        font-weight: normal;
      }
    }
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    margin-bottom: 16px;

    th {
      border-top: 1px solid #000000;
      border-bottom: 1px solid #000000;
      padding: 6px 4px;
      text-align: left;
      font-weight: bold;
      font-size: 10.5px;

      &.text-right { text-align: right; }
      &.text-center { text-align: center; }
    }

    td {
      padding: 5px 4px;
      font-size: 10.5px;

      &.text-right { text-align: right; }
      &.text-center { text-align: center; }
    }

    .total-row td {
      border-top: 1px solid #000000;
      border-bottom: 1px solid #000000;
      padding: 7px 4px;
      font-weight: bold;
      font-size: 11px;
    }
  }
`;

const LabAbstractReportDetailed = ({ embedded = false }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const initialIp = queryParams.get('ip_number') || queryParams.get('uhid') || '';
    const initialFrom = queryParams.get('from_date') || dayjs().subtract(30, 'days').format('YYYY-MM-DD');
    const initialTo = queryParams.get('to_date') || dayjs().format('YYYY-MM-DD');

    const [ipNumber, setIpNumber] = useState(initialIp);
    const [dateRange, setDateRange] = useState([dayjs(initialFrom), dayjs(initialTo)]);
    const [loading, setLoading] = useState(false);
    const [payload, setPayload] = useState(null);

    const loadData = useCallback(async (targetIp = ipNumber, dates = dateRange) => {
        try {
            setLoading(true);
            const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
            const fDate = dates && dates[0] ? dates[0].format('YYYY-MM-DD') : '';
            const tDate = dates && dates[1] ? dates[1].format('YYYY-MM-DD') : '';

            const url = `${getBaseUrl.replace(/\/$/, '')}/report-lab-abstract/?ip_number=${encodeURIComponent(targetIp)}&uhid=${encodeURIComponent(targetIp)}&from_date=${fDate}&to_date=${tDate}`;
            const res = await apiRequest(url, 'GET');

            if (res && res.success) {
                const dataObj = (res.data && res.data.patient_info) ? res.data : (res.data || res);
                setPayload(dataObj);
            } else {
                message.warning(res?.message || 'No lab investigation records found.');
                setPayload(null);
            }
        } catch (err) {
            console.error('Error fetching lab abstract report:', err);
            message.error('Failed to load lab abstract report.');
        } finally {
            setLoading(false);
        }
    }, [ipNumber, dateRange]);

    useEffect(() => {
        loadData(initialIp, [dayjs(initialFrom), dayjs(initialTo)]);
    }, [initialIp, initialFrom, initialTo, loadData]);

    const handlePrint = () => {
        printInsuranceReport('printable-lab-abstract-sheet', {
            reportTitle: 'Lab Abstract Report Detailed',
            patientInfo: {
                uhid: patient.uhid || patient.op_number,
                ip_number: patient.ip_number || ipNumber,
                patient_name: patient.patient_name,
                doctor: patient.doctor_name
            },
            orientation: 'portrait'
        });
    };

    const handleExportExcel = () => {
        const exportList = Array.isArray(payload?.data) ? payload.data : [];
        if (exportList.length === 0) {
            message.info('No data available to export.');
            return;
        }

        try {
            const rows = exportList.map(r => ({
                'Sl No': r.slno,
                'Bill Date': r.bill_date,
                'Bill Number': r.bill_number,
                'Item Name': r.itemname,
                'Qty': r.qty,
                'Item Cost': r.item_cost,
                'Bill Amount': r.bill_amount
            }));

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Lab_Abstract');
            XLSX.writeFile(wb, `Lab_Abstract_Report_${ipNumber.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
        } catch (e) {
            console.error('Export error:', e);
            message.error('Export failed.');
        }
    };

    const patient = payload?.patient_info || {};
    const items = Array.isArray(payload?.data)
        ? payload.data
        : (Array.isArray(payload?.items) ? payload.items : []);
    const totalAmount = payload?.total_amount ?? payload?.summary?.total_amount ?? items.reduce((acc, it) => acc + (Number(it.bill_amount) || 0), 0);

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
                    #printable-lab-abstract-sheet,
                    #printable-lab-abstract-sheet * {
                        visibility: visible !important;
                    }
                    #printable-lab-abstract-sheet {
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
                            <h2>Lab Abstract Report Detailed</h2>
                            <p>Itemized laboratory diagnostic tests, cost, and voucher numbers per IP admission</p>
                        </div>
                    </div>

                    <div className="filters-side">
                        <div className="filter-input">
                            <User size={15} color="#64748b" />
                            <input
                                type="text"
                                placeholder="Enter IP Number or UHID..."
                                value={ipNumber}
                                onChange={(e) => setIpNumber(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') loadData(); }}
                            />
                        </div>

                        <DatePicker.RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                            format="DD/MM/YYYY"
                            allowClear={false}
                            style={{ height: '36px', borderRadius: '8px' }}
                        />

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
                    <p style={{ marginTop: '14px', color: '#64748b', fontWeight: '500' }}>Loading lab abstract statement...</p>
                </div>
            ) : (
                <PrintableSheet id="printable-lab-abstract-sheet">
                    {/* Header */}
                    <div className="header-block">
                        <div className="hosp-name">SHANMUGA HOSPITAL LIMITED</div>
                        <div className="hosp-addr">51/24,Saradha College Road, Salem - 636007</div>
                        <div className="hosp-phone">04272706666</div>
                        <div className="rep-name">Lab Abstract Report Detailed</div>
                    </div>

                    <div className="divider-line" />

                    {/* Patient info bar */}
                    <div className="patient-bar">
                        <div className="left-side">
                            <div className="row-field">
                                <span className="field-lbl">Patient Name</span>
                                <span className="field-val">: {patient.patient_name || '-'}</span>
                            </div>
                            <div className="row-field">
                                <span className="field-lbl">Ip Number</span>
                                <span className="field-val">: {patient.ip_number || ipNumber || '-'}</span>
                            </div>
                        </div>

                        <div className="right-side">
                            <div className="row-field">
                                <span className="field-lbl">Op Number</span>
                                <span className="field-val">: {patient.op_number || patient.uhid || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="divider-line" />

                    {/* Table */}
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }} className="text-center">Slno</th>
                                <th style={{ width: '90px' }}>Bill Date</th>
                                <th style={{ width: '100px' }}>Bill Number</th>
                                <th>Itemname</th>
                                <th style={{ width: '50px' }} className="text-center">Qty</th>
                                <th style={{ width: '90px' }} className="text-right">Item Cost</th>
                                <th style={{ width: '100px' }} className="text-right">Bill Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!Array.isArray(items) || items.length === 0) ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                                        No record found
                                    </td>
                                </tr>
                            ) : items.map((it, idx) => (
                                <tr key={idx}>
                                    <td className="text-center" style={{ fontWeight: 'bold' }}>{it.slno || idx + 1}</td>
                                    <td>{it.bill_date}</td>
                                    <td>{it.bill_number}</td>
                                    <td>{it.itemname}</td>
                                    <td className="text-center">{it.qty}</td>
                                    <td className="text-right">{Number(it.item_cost || 0).toFixed(2)}</td>
                                    <td className="text-right">{Number(it.bill_amount || 0).toFixed(2)}</td>
                                </tr>
                            ))}

                            {Array.isArray(items) && items.length > 0 && (
                                <tr className="total-row">
                                    <td colSpan={6} className="text-center" style={{ textAlign: 'center' }}>Total</td>
                                    <td className="text-right">{Number(totalAmount).toFixed(2)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </PrintableSheet>
            )}
        </Container>
    );
};

export default LabAbstractReportDetailed;

