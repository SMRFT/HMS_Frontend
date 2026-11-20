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
        background: #059669;
        color: #ffffff;
        &:hover { background: #047857; }
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
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 2px;
      color: #000000;
    }
    .hosp-addr {
      font-size: 11px;
      margin-bottom: 2px;
      color: #000000;
    }
    .hosp-phone {
      font-size: 11px;
      margin-bottom: 12px;
      color: #000000;
    }
    .rep-name {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #000000;
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
    padding: 4px 0;
    line-height: 1.6;

    .left-side {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .right-side {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 320px;
    }

    .row-field {
      display: flex;
      .field-lbl {
        width: 110px;
        font-weight: normal;
        color: #000000;
      }
      .field-sep {
        margin-right: 6px;
      }
      .field-val {
        font-weight: normal;
        color: #000000;
      }
    }
  }

  .table-box {
    margin-top: 6px;

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      color: #000000;

      thead {
        tr {
          border-top: 1px solid #000000;
          border-bottom: 1px solid #000000;
        }
        th {
          padding: 6px 4px;
          font-weight: bold;
          color: #000000;
          text-align: left;
          background: transparent;

          &.text-center { text-align: center; }
          &.text-right { text-align: right; }
        }
      }

      tbody {
        tr {
          td {
            padding: 5px 4px;
            color: #000000;

            &.text-center { text-align: center; }
            &.text-right { text-align: right; }
          }
        }

        tr.grand-total-row {
          border-top: 1px solid #000000;
          border-bottom: 2px solid #000000;
          font-weight: bold;

          td {
            padding: 7px 4px;
            color: #000000;
            font-size: 11px;

            &.text-right { text-align: right; }
            &.text-left { text-align: left; }
          }
        }
      }
    }
  }

  .no-data {
    text-align: center;
    padding: 40px;
    color: #64748b;
    font-size: 13px;
  }
`;

const MedicineAbstractReport = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Query parameters
    const searchParams = new URLSearchParams(location.search);
    const initialIp = searchParams.get('ip_number') || searchParams.get('uhid') || 'S026/008240';
    const initialFrom = searchParams.get('from_date') || dayjs().subtract(60, 'day').format('YYYY-MM-DD');
    const initialTo = searchParams.get('to_date') || dayjs().format('YYYY-MM-DD');

    const [ipNumber, setIpNumber] = useState(initialIp);
    const [fromDate, setFromDate] = useState(dayjs(initialFrom));
    const [toDate, setToDate] = useState(dayjs(initialTo));

    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    const fetchReport = useCallback(async (targetIp, fDate, tDate) => {
        if (!targetIp) {
            message.warning('Please enter IP Number or UHID');
            return;
        }
        setLoading(true);
        try {
            const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
            const fromStr = fDate ? fDate.format('YYYY-MM-DD') : '';
            const toStr = tDate ? tDate.format('YYYY-MM-DD') : '';
            const url = `${getBaseUrl.replace(/\/$/, '')}/report-medicine-abstract/?ip_number=${encodeURIComponent(targetIp.trim())}&uhid=${encodeURIComponent(targetIp.trim())}&from_date=${fromStr}&to_date=${toStr}`;

            const res = await apiRequest(url, 'GET');
            if (res && res.success) {
                const dataObj = (res.data && res.data.patient_info) ? res.data : (res.data?.data || res.data || res);
                setReportData(dataObj);
            } else {
                setReportData(null);
                message.info(res?.message || res?.data?.message || 'No records found');
            }
        } catch (err) {
            console.error('Fetch Medicine Abstract Report error:', err);
            message.error('Failed to load Medicine Abstract Report');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialIp) {
            fetchReport(initialIp, fromDate, toDate);
        }
    }, [initialIp, fromDate, toDate, fetchReport]);

    const handleQuery = () => {
        fetchReport(ipNumber, fromDate, toDate);
    };

    const handleExcelExport = () => {
        if (!reportData?.bills?.length) {
            message.warning('No data to export');
            return;
        }

        const hasDiscount = (reportData.summary?.total_discount || 0) > 0 || reportData.bills.some(b => Number(b.discount_amount || 0) > 0);

        const excelRows = reportData.bills.map((b) => {
            const row = {
                'Slno': b.sl_no,
                'Bill Date': b.bill_date,
                'Bill Number': b.bill_number,
                'Credit Status': b.credit_status,
                'Taxable Amt': Number(b.taxable_amt || 0).toFixed(2),
                'Cgst': Number(b.cgst || 0).toFixed(2),
                'Sgst': Number(b.sgst || 0).toFixed(2),
                'Gst': Number(b.gst || 0).toFixed(2)
            };
            if (hasDiscount) {
                row['Discount'] = Number(b.discount_amount || 0).toFixed(2);
            }
            row['Bill Amount'] = Number(b.net_amount ?? b.bill_amount ?? 0).toFixed(2);
            return row;
        });

        // Append Grand Total Row
        const totalRow = {
            'Slno': 'Total',
            'Bill Date': '',
            'Bill Number': '',
            'Credit Status': '',
            'Taxable Amt': Number(reportData.summary?.total_taxable || 0).toFixed(2),
            'Cgst': Number(reportData.summary?.total_cgst || 0).toFixed(2),
            'Sgst': Number(reportData.summary?.total_sgst || 0).toFixed(2),
            'Gst': Number(reportData.summary?.total_gst || 0).toFixed(2)
        };
        if (hasDiscount) {
            totalRow['Discount'] = Number(reportData.summary?.total_discount || 0).toFixed(2);
        }
        totalRow['Bill Amount'] = Number(reportData.summary?.total_bill_amount ?? reportData.summary?.total_net_amount ?? 0).toFixed(2);
        excelRows.push(totalRow);

        const ws = XLSX.utils.json_to_sheet(excelRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Medicine Abstract');
        XLSX.writeFile(wb, `Medicine_Abstract_${reportData.patient_info?.ip_number || 'Report'}.xlsx`);
    };

    const handlePrint = () => {
        const el = document.getElementById('medicine-abstract-sheet');
        if (!el) return;
        printInsuranceReport('medicine-abstract-sheet', {
            reportTitle: 'Medicine Abstract Report',
            patientInfo: {
                uhid: patient?.op_number || patient?.uhid,
                ip_number: patient?.ip_number || ipNumber,
                patient_name: patient?.patient_name
            },
            orientation: 'portrait'
        });
    };

    const patient = reportData?.patient_info;
    const bills = reportData?.bills || [];
    const summary = reportData?.summary || {};
    const hasDiscount = (summary?.total_discount || 0) > 0 || bills.some(b => Number(b.discount_amount || 0) > 0);

    return (
        <Container>
            <ControlBar>
                <div className="left-side">
                    <button className="back-btn" onClick={() => navigate('/InsuranceReportsDashboard')} title="Back to Dashboard">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="title-box">
                        <h2>Medicine Abstract Report</h2>
                        <p>Specialized Insurance Inpatient Dispensation & GST Ledger</p>
                    </div>
                </div>

                <div className="filters-side">
                    <div className="filter-input">
                        <User size={15} color="#64748b" />
                        <input
                            type="text"
                            placeholder="IP No / UHID"
                            value={ipNumber}
                            onChange={(e) => setIpNumber(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                        />
                    </div>

                    <DatePicker
                        value={fromDate}
                        format="DD/MM/YYYY"
                        onChange={(d) => setFromDate(d || dayjs())}
                        style={{ height: 36, borderRadius: 8 }}
                    />
                    <DatePicker
                        value={toDate}
                        format="DD/MM/YYYY"
                        onChange={(d) => setToDate(d || dayjs())}
                        style={{ height: 36, borderRadius: 8 }}
                    />

                    <button className="btn-query" onClick={handleQuery}>
                        <Search size={15} /> Search
                    </button>
                    <button className="btn-excel" onClick={handleExcelExport}>
                        <Download size={15} /> Excel
                    </button>
                    <button className="btn-print" onClick={handlePrint}>
                        <Printer size={15} /> Print
                    </button>
                </div>
            </ControlBar>

            <Spin spinning={loading}>
                <PrintableSheet id="medicine-abstract-sheet">
                    {/* Header Block matching PDF */}
                    <div className="header-block">
                        <div className="hosp-name">SHANMUGA HOSPITAL LIMITED</div>
                        <div className="hosp-addr">51/24.Saradha College Road, Salem - 636007</div>
                        <div className="hosp-phone">04272706666</div>
                        <div className="rep-name">Medicine Abstract Report</div>
                    </div>

                    <div className="divider-line" />

                    {/* Patient Details matching PDF */}
                    <div className="patient-bar">
                        <div className="left-side">
                            <div className="row-field">
                                <span className="field-lbl">Patient Name</span>
                                <span className="field-sep">:</span>
                                <span className="field-val">{patient?.patient_name || '-'}</span>
                            </div>
                            <div className="row-field">
                                <span className="field-lbl">Ip Number</span>
                                <span className="field-sep">:</span>
                                <span className="field-val">{patient?.ip_number || '-'}</span>
                            </div>
                        </div>

                        <div className="right-side">
                            <div className="row-field" style={{ visibility: 'hidden' }}>
                                <span className="field-lbl">Placeholder</span>
                                <span className="field-sep">:</span>
                                <span className="field-val">-</span>
                            </div>
                            <div className="row-field">
                                <span className="field-lbl">Op Number</span>
                                <span className="field-sep">:</span>
                                <span className="field-val">{patient?.op_number || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="divider-line" />

                    {/* Main Table matching PDF */}
                    <div className="table-box">
                        {bills.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '45px' }} className="text-left">Slno</th>
                                        <th style={{ width: '85px' }} className="text-left">Bill Date</th>
                                        <th style={{ width: '95px' }} className="text-left">Bill Number</th>
                                        <th style={{ width: '95px' }} className="text-left">Credit Status</th>
                                        <th style={{ width: '90px' }} className="text-right">Taxable Amt</th>
                                        <th style={{ width: '65px' }} className="text-right">Cgst</th>
                                        <th style={{ width: '65px' }} className="text-right">Sgst</th>
                                        <th style={{ width: '65px' }} className="text-right">Gst</th>
                                        {hasDiscount && <th style={{ width: '75px' }} className="text-right">Discount</th>}
                                        <th style={{ width: '95px' }} className="text-right">Bill Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.map((b) => (
                                        <tr key={b.bill_number}>
                                            <td className="text-left">{b.sl_no}</td>
                                            <td className="text-left">{b.bill_date}</td>
                                            <td className="text-left">{b.bill_number}</td>
                                            <td className="text-left">{b.credit_status}</td>
                                            <td className="text-right">{Number(b.taxable_amt || 0).toFixed(2)}</td>
                                            <td className="text-right">{Number(b.cgst || 0).toFixed(2)}</td>
                                            <td className="text-right">{Number(b.sgst || 0).toFixed(2)}</td>
                                            <td className="text-right">{Number(b.gst || 0).toFixed(2)}</td>
                                            {hasDiscount && <td className="text-right" style={{ color: '#b91c1c' }}>{Number(b.discount_amount || 0) > 0 ? `-${Number(b.discount_amount).toFixed(2)}` : '0.00'}</td>}
                                            <td className="text-right">{Number(b.net_amount ?? b.bill_amount ?? 0).toFixed(2)}</td>
                                        </tr>
                                    ))}

                                    {/* Grand Total Row matching PDF */}
                                    <tr className="grand-total-row">
                                        <td colSpan={4} className="text-left">Total</td>
                                        <td className="text-right">{Number(summary.total_taxable || 0).toFixed(2)}</td>
                                        <td className="text-right">{Number(summary.total_cgst || 0).toFixed(2)}</td>
                                        <td className="text-right">{Number(summary.total_sgst || 0).toFixed(2)}</td>
                                        <td className="text-right">{Number(summary.total_gst || 0).toFixed(2)}</td>
                                        {hasDiscount && <td className="text-right" style={{ color: '#b91c1c' }}>{Number(summary.total_discount || 0) > 0 ? `-${Number(summary.total_discount).toFixed(2)}` : '0.00'}</td>}
                                        <td className="text-right">{Number(summary.total_bill_amount ?? summary.total_net_amount ?? 0).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        ) : (
                            <div className="no-data">No medicine records found for this admission / date range.</div>
                        )}
                    </div>
                </PrintableSheet>
            </Spin>
        </Container>
    );
};

export default MedicineAbstractReport;

