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
  max-width: 800px;
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

  .prescription-block {
    margin-bottom: 40px;
    page-break-after: auto;

    .hosp-header {
      margin-bottom: 8px;
      .name { font-size: 13px; font-weight: bold; margin-bottom: 2px; }
      .addr { font-size: 11px; margin-bottom: 2px; }
      .phone { font-size: 11px; margin-bottom: 6px; }
    }

    .divider-top {
      border-top: 1px solid #000000;
      margin: 6px 0 10px 0;
    }

    .meta-bar {
      display: flex;
      justify-content: space-between;
      line-height: 1.5;
      font-size: 11px;

      .left-col {
        .row-item {
          display: flex;
          .lbl { width: 110px; font-weight: bold; }
          .val { }
        }
        .doc-name {
          font-weight: bold;
          margin-top: 2px;
        }
        .bill-no {
          font-weight: bold;
          margin-top: 2px;
        }
      }

      .right-col {
        text-align: right;
        .room-title {
          font-weight: bold;
        }
        .date-val {
          font-weight: bold;
          margin-top: 2px;
        }
      }
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;

      th {
        border-top: 1.5px solid #000000;
        border-bottom: 1.5px solid #000000;
        padding: 6px 4px;
        text-align: left;
        font-weight: bold;
        font-size: 11px;

        &.col-qty {
          width: 80px;
          text-align: right;
        }
      }

      td {
        padding: 5px 4px;
        font-size: 11px;

        &.col-qty {
          text-align: right;
        }
      }
    }

    .divider-bottom {
      border-top: 1px solid #000000;
      margin-top: 8px;
    }
  }

  .page-bottom-number {
    text-align: right;
    font-size: 11px;
    font-weight: bold;
    margin-top: 30px;
  }
`;

const PrescriptionDetailsReport = ({ embedded = false }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const initialUhid = queryParams.get('uhid') || '';
    const initialFrom = queryParams.get('from_date') || dayjs().subtract(30, 'days').format('YYYY-MM-DD');
    const initialTo = queryParams.get('to_date') || dayjs().format('YYYY-MM-DD');

    const [uhid, setUhid] = useState(initialUhid);
    const [dateRange, setDateRange] = useState([dayjs(initialFrom), dayjs(initialTo)]);
    const [loading, setLoading] = useState(false);
    const [payload, setPayload] = useState(null);

    const loadData = useCallback(async (targetUhid = uhid, dates = dateRange) => {
        try {
            setLoading(true);
            const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
            const fDate = dates && dates[0] ? dates[0].format('YYYY-MM-DD') : '';
            const tDate = dates && dates[1] ? dates[1].format('YYYY-MM-DD') : '';

            const url = `${getBaseUrl.replace(/\/$/, '')}/report-prescription-details/?uhid=${encodeURIComponent(targetUhid)}&from_date=${fDate}&to_date=${tDate}`;
            const res = await apiRequest(url, 'GET');

            if (res && res.success) {
                const dataObj = (res.data && res.data.patient_info) ? res.data : (res.data || res);
                setPayload(dataObj);
            } else {
                message.warning(res?.message || 'No prescription details found.');
                setPayload(null);
            }
        } catch (err) {
            console.error('Error fetching prescription details report:', err);
            message.error('Failed to load prescription details report.');
        } finally {
            setLoading(false);
        }
    }, [uhid, dateRange]);

    useEffect(() => {
        loadData(initialUhid, [dayjs(initialFrom), dayjs(initialTo)]);
    }, [initialUhid, initialFrom, initialTo, loadData]);

    const handlePrint = () => {
        printInsuranceReport('printable-prescription-sheet', {
            reportTitle: 'Prescription Details',
            orientation: 'portrait'
        });
    };

    const handleExportExcel = () => {
        const pList = Array.isArray(payload?.prescriptions) ? payload.prescriptions : [];
        if (pList.length === 0) {
            message.info('No data available to export.');
            return;
        }

        try {
            const rows = [];
            pList.forEach(p => {
                const itList = Array.isArray(p.items) ? p.items : [];
                itList.forEach(it => {
                    rows.push({
                        'Bill Date': p.date,
                        'Bill Number': p.bill_number,
                        'Doctor': p.doctor_name,
                        'Item Name': it.item_name,
                        'Qty': it.qty
                    });
                });
            });

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Prescription_Details');
            XLSX.writeFile(wb, `Prescription_Details_${uhid.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
        } catch (e) {
            console.error('Export error:', e);
            message.error('Export failed.');
        }
    };

    const patient = payload?.patient_info || {};
    const prescriptions = Array.isArray(payload?.prescriptions) ? payload.prescriptions : [];

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
                    #printable-prescription-sheet,
                    #printable-prescription-sheet * {
                        visibility: visible !important;
                    }
                    #printable-prescription-sheet {
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
                            <h2>Prescription Details</h2>
                            <p>Daily inpatient and outpatient physician medication orders, dispensing slips, and dosage vouchers</p>
                        </div>
                    </div>

                    <div className="filters-side">
                        <div className="filter-input">
                            <User size={15} color="#64748b" />
                            <input
                                type="text"
                                placeholder="Enter UHID..."
                                value={uhid}
                                onChange={(e) => setUhid(e.target.value)}
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
                    <p style={{ marginTop: '14px', color: '#64748b', fontWeight: '500' }}>Loading prescription records...</p>
                </div>
            ) : (
                <PrintableSheet id="printable-prescription-sheet">
                    {(!Array.isArray(prescriptions) || prescriptions.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '15px', fontWeight: 600 }}>
                            No record found
                        </div>
                    ) : (
                        prescriptions.map((p, pIdx) => (
                            <div key={pIdx} className="prescription-block">
                                <div className="hosp-header">
                                    <div className="name">SHANMUGA HOSPITAL LIMITED</div>
                                    <div className="addr">51/24.Saradha College Road, Salem - 636007</div>
                                    <div className="phone">04272706666</div>
                                </div>

                                <div className="divider-top" />

                                <div className="meta-bar">
                                    <div className="left-col">
                                        <div className="row-item">
                                            <span className="lbl">PATIENT NAME</span>
                                            <span className="val">: {patient.patient_name || '-'}</span>
                                        </div>
                                        <div className="row-item">
                                            <span className="lbl">OP Number</span>
                                            <span className="val">: {patient.op_number || uhid || '-'}</span>
                                        </div>
                                        <div className="row-item">
                                            <span className="lbl">IP Number</span>
                                            <span className="val">: {patient.ip_number || '-'}</span>
                                        </div>
                                        <div className="doc-name">{p.doctor_name || patient.doctor_name || '-'}</div>
                                        <div className="bill-no">Bill Number : {p.bill_number || '-'}</div>
                                    </div>

                                    <div className="right-col">
                                        <div className="room-title">ROOM Number</div>
                                        <div className="date-val">{p.date || p.prescription_date || '-'}</div>
                                    </div>
                                </div>

                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Item Name</th>
                                        <th className="col-qty">Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(p.items) && p.items.map((it, iIdx) => (
                                        <tr key={iIdx}>
                                            <td>{it.item_name}</td>
                                            <td className="col-qty">{it.qty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="divider-bottom" />
                        </div>
                    )))}

                    <div className="page-bottom-number">
                        Page :1
                    </div>
                </PrintableSheet>
            )}
        </Container>
    );
};

export default PrescriptionDetailsReport;

