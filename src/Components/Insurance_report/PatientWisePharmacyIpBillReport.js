import React, { useState, useEffect, useCallback } from 'react';
import { DatePicker, Spin, message } from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {
    ArrowLeft,
    Printer,
    Download,
    RefreshCw,
    Search,
    FileText,
    Calendar,
    User
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import apiRequest from '../../Auth/apiRequest';
import { PageWrapper, fadeIn } from '../GlobalStyles';
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
    flex-wrap: wrap;

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

    .uhid-input {
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

  .hospital-header {
    text-align: left;
    margin-bottom: 8px;

    .main-title {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .sub-address {
      font-size: 11px;
      margin-bottom: 2px;
    }
    .tax-row {
      font-size: 11px;
      margin-bottom: 6px;
    }
    .report-banner {
      text-align: center;
      font-size: 13px;
      font-weight: bold;
      letter-spacing: 1px;
      padding: 4px 0;
      border-top: 1px solid #000000;
      border-bottom: 1px solid #000000;
      margin: 6px 0 10px 0;
    }
  }

  .patient-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    row-gap: 3px;
    font-size: 11px;
    padding: 6px 0;
    border-bottom: 1px solid #000000;
    margin-bottom: 8px;

    .meta-item {
      display: flex;
      .meta-label {
        width: 90px;
        font-weight: normal;
      }
      .meta-val {
        font-weight: bold;
      }
    }
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;

    th {
      border-top: 1px solid #000000;
      border-bottom: 1px solid #000000;
      padding: 6px 4px;
      text-align: left;
      font-weight: bold;
      font-size: 10.5px;
      white-space: nowrap;

      &.text-right { text-align: right; }
      &.text-center { text-align: center; }
    }

    td {
      padding: 4px 4px;
      font-size: 10.5px;
      vertical-align: top;

      &.text-right { text-align: right; }
      &.text-center { text-align: center; }
    }

    .bill-group-header td {
      font-weight: bold;
      padding: 8px 4px 4px 4px;
      border-bottom: 0.5px dashed #666666;
    }

    .bill-summary-row td {
      padding-top: 6px;
      font-size: 10.5px;
    }
  }

  .tax-summary-box {
    margin-left: auto;
    width: 320px;
    font-size: 11px;
    line-height: 1.6;
    margin-top: 6px;
    margin-bottom: 14px;
    border-top: 1px solid #000000;
    padding-top: 4px;

    .tax-row {
      display: flex;
      justify-content: space-between;
      .val {
        font-weight: bold;
        min-width: 80px;
        text-align: right;
      }
    }
  }

  .grand-total-bar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    border-top: 1px solid #000000;
    border-bottom: 1px solid #000000;
    padding: 6px 0;
    font-size: 12px;
    font-weight: bold;
    margin-top: 10px;

    .label { margin-right: 30px; }
    .amount { min-width: 80px; text-align: right; }
  }

  .footer-page-bar {
    display: flex;
    justify-content: flex-end;
    font-size: 10.5px;
    margin-top: 20px;
  }
`;

const PatientWisePharmacyIpBillReport = ({ embedded = false }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Parse query params if any
    const queryParams = new URLSearchParams(location.search);
    const initialUhid = queryParams.get('uhid') || '';
    const initialFrom = queryParams.get('from_date') || dayjs().subtract(14, 'days').format('YYYY-MM-DD');
    const initialTo = queryParams.get('to_date') || dayjs().format('YYYY-MM-DD');

    const [uhid, setUhid] = useState(initialUhid);
    const [dateRange, setDateRange] = useState([dayjs(initialFrom), dayjs(initialTo)]);
    const [loading, setLoading] = useState(false);
    const [reportPayload, setReportPayload] = useState(null);

    const loadData = useCallback(async (targetUhid = uhid, dates = dateRange) => {
        try {
            setLoading(true);
            const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
            const fDate = dates && dates[0] ? dates[0].format('YYYY-MM-DD') : '';
            const tDate = dates && dates[1] ? dates[1].format('YYYY-MM-DD') : '';

            const url = `${getBaseUrl.replace(/\/$/, '')}/report-patient-wise-pharmacy-ip-bill/?uhid=${encodeURIComponent(targetUhid)}&from_date=${fDate}&to_date=${tDate}`;
            const res = await apiRequest(url, 'GET');

            if (res && res.success) {
                const dataObj = (res.data && res.data.patient_info) ? res.data : (res.data || res);
                setReportPayload(dataObj);
            } else {
                message.warning(res?.message || 'No pharmacy billing records found for this patient.');
                setReportPayload(null);
            }
        } catch (err) {
            console.error('Error fetching pharmacy ip bill report:', err);
            message.error('Failed to load pharmacy IP bill data.');
        } finally {
            setLoading(false);
        }
    }, [uhid, dateRange]);

    useEffect(() => {
        loadData(initialUhid, [dayjs(initialFrom), dayjs(initialTo)]);
    }, [initialUhid, initialFrom, initialTo, loadData]);

    const handlePrint = () => {
        printInsuranceReport('printable-pharmacy-ip-sheet', {
            reportTitle: 'PHARMACY IP BILL',
            patientInfo: {
                uhid: patient.op_number || uhid,
                ip_number: patient.ip_number,
                patient_name: patient.patient_name,
                age_gender: patient.age_gender,
                admitted_date: patient.admitted_date,
                discharge_date: patient.discharge_date,
                doctor: patient.doctor_name
            },
            orientation: 'portrait'
        });
    };

    const handleExportExcel = () => {
        const billList = Array.isArray(reportPayload?.bills) ? reportPayload.bills : [];
        if (billList.length === 0) {
            message.info('No data available to export.');
            return;
        }

        try {
            const rows = [];
            billList.forEach(bill => {
                const itList = Array.isArray(bill.items) ? bill.items : [];
                itList.forEach(it => {
                    rows.push({
                        'Bill Number': bill.bill_no,
                        'Bill Date': bill.bill_date,
                        'Qty': it.qty,
                        'Particulars': it.particulars,
                        'HSN': it.hsn,
                        'Batch': it.batch,
                        'Expiry': it.expiry,
                        'Taxable Amt': it.taxable_amt,
                        'CGST %': it.cgst_pct,
                        'CGST': it.cgst_amt,
                        'SGST %': it.sgst_pct,
                        'SGST': it.sgst_amt,
                        'Amount': it.amount
                    });
                });
            });

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Pharmacy_IP_Bill');
            XLSX.writeFile(wb, `Patient_Pharmacy_IP_Bill_${uhid.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
        } catch (e) {
            console.error('Export error:', e);
            message.error('Export failed.');
        }
    };

    const patient = reportPayload?.patient_info || {};
    const bills = Array.isArray(reportPayload?.bills) ? reportPayload.bills : [];
    const grandTotal = reportPayload?.grand_total ?? reportPayload?.summary?.net_amount ?? reportPayload?.summary?.gross_amount ?? bills.reduce((acc, b) => acc + (Array.isArray(b.items) ? b.items.reduce((s, it) => s + (Number(it.amount) || 0), 0) : (Number(b.bill_total) || 0)), 0);

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
                    #printable-pharmacy-ip-sheet,
                    #printable-pharmacy-ip-sheet * {
                        visibility: visible !important;
                    }
                    #printable-pharmacy-ip-sheet {
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
                            <h2>PATIENT WISE PHARMACY IP BILL DETAILED</h2>
                            <p>Itemized IP credit and ward medicine charges per invoice</p>
                        </div>
                    </div>

                    <div className="filters-side">
                        <div className="uhid-input">
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
                    <p style={{ marginTop: '14px', color: '#64748b', fontWeight: '500' }}>Loading patient pharmacy statement...</p>
                </div>
            ) : (
                <PrintableSheet id="printable-pharmacy-ip-sheet">
                    {/* Header matching PDF */}
                    <div className="hospital-header">
                        <div className="main-title">SHANMUGA HOSPITAL LIMITED</div>
                        <div className="sub-address">51/24.Saradha College Road, Salem - 636007, ,</div>
                        <div className="tax-row">Dl No : TN-01-20-21-00202, TIN No : 33692663526  GSTIN : 33ABDCS8326A1ZP</div>
                        <div className="report-banner">PHARMACY IP BILL</div>
                    </div>

                    {/* Patient Meta Data Box */}
                    <div className="patient-meta-grid">
                        <div className="meta-item">
                            <span className="meta-label">OP Number</span>
                            <span className="meta-val">: {patient.op_number || uhid}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Age & Sex</span>
                            <span className="meta-val">: {patient.age_gender || '-'}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">IP-NO</span>
                            <span className="meta-val">: {patient.ip_number || '-'}</span>
                        </div>
                        <div className="meta-item" style={{ visibility: 'hidden' }}>
                            <span className="meta-label"></span>
                            <span className="meta-val"></span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Name</span>
                            <span className="meta-val">: {patient.patient_name || '-'}</span>
                        </div>
                        <div className="meta-item" style={{ visibility: 'hidden' }}>
                            <span className="meta-label"></span>
                            <span className="meta-val"></span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Doctor</span>
                            <span className="meta-val">: {patient.doctor_name || '-'}</span>
                        </div>
                        <div className="meta-item" style={{ visibility: 'hidden' }}>
                            <span className="meta-label"></span>
                            <span className="meta-val"></span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Room No</span>
                            <span className="meta-val">: {patient.room_no || '-'}</span>
                        </div>
                    </div>

                    {/* Table of Bills */}
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th style={{ width: '35px' }}>Qty</th>
                                <th>Particulars</th>
                                <th>HSN</th>
                                <th>Batch</th>
                                <th>Expiry</th>
                                <th className="text-right">Taxable Amt</th>
                                <th className="text-center">CGST %</th>
                                <th className="text-right">CGST</th>
                                <th className="text-center">SGST %</th>
                                <th className="text-right">SGST</th>
                                <th className="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!Array.isArray(bills) || bills.length === 0) ? (
                                <tr>
                                    <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                                        No record found
                                    </td>
                                </tr>
                            ) : bills.map((bill, bIdx) => (
                                <React.Fragment key={bIdx}>
                                    <tr className="bill-group-header">
                                        <td colSpan={6}>
                                            Bill Number : {bill.bill_no}
                                        </td>
                                        <td colSpan={5} className="text-right">
                                            Bill Date : {bill.bill_date} (IP CREDITS)
                                        </td>
                                    </tr>

                                    {Array.isArray(bill.items) && bill.items.map((it, iIdx) => {
                                        const cgstVal = it.cgst_amt ?? it.cgst ?? 0;
                                        const sgstVal = it.sgst_amt ?? it.sgst ?? 0;
                                        return (
                                            <tr key={iIdx}>
                                                <td className="text-center">{it.qty}</td>
                                                <td>{it.particulars}</td>
                                                <td>{it.hsn || '-'}</td>
                                                <td>{it.batch || '-'}</td>
                                                <td>{it.expiry || '-'}</td>
                                                <td className="text-right">{Number(it.taxable_amt || 0).toFixed(2)}</td>
                                                <td className="text-center">{it.cgst_pct ?? '-'}</td>
                                                <td className="text-right">{Number(cgstVal || 0).toFixed(2)}</td>
                                                <td className="text-center">{it.sgst_pct ?? '-'}</td>
                                                <td className="text-right">{Number(sgstVal || 0).toFixed(2)}</td>
                                                <td className="text-right">{Number(it.amount || 0).toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}

                                    {/* Subtotal per bill */}
                                    {(() => {
                                        const bTaxable = (bill.taxable_amt !== undefined && bill.taxable_amt !== null && !isNaN(Number(bill.taxable_amt)))
                                            ? Number(bill.taxable_amt)
                                            : (Array.isArray(bill.items) ? bill.items.reduce((acc, it) => acc + (Number(it.taxable_amt) || 0), 0) : 0);
                                        const bCgst = (bill.cgst_amt !== undefined && bill.cgst_amt !== null && !isNaN(Number(bill.cgst_amt)))
                                            ? Number(bill.cgst_amt)
                                            : (Array.isArray(bill.items) ? bill.items.reduce((acc, it) => acc + (Number(it.cgst_amt ?? it.cgst) || 0), 0) : 0);
                                        const bSgst = (bill.sgst_amt !== undefined && bill.sgst_amt !== null && !isNaN(Number(bill.sgst_amt)))
                                            ? Number(bill.sgst_amt)
                                            : (Array.isArray(bill.items) ? bill.items.reduce((acc, it) => acc + (Number(it.sgst_amt ?? it.sgst) || 0), 0) : 0);
                                        const bTotalGst = (bill.total_gst !== undefined && bill.total_gst !== null && !isNaN(Number(bill.total_gst)))
                                            ? Number(bill.total_gst)
                                            : (bCgst + bSgst);
                                        const bNet = (bill.net_amount !== undefined && bill.net_amount !== null && !isNaN(Number(bill.net_amount)))
                                            ? Number(bill.net_amount)
                                            : (bill.bill_total ? Number(bill.bill_total) : (Array.isArray(bill.items) ? bill.items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0) : 0));

                                        return (
                                            <tr>
                                                <td colSpan={11} style={{ padding: '0 0 10px 0' }}>
                                                    <div className="tax-summary-box">
                                                        <div className="tax-row">
                                                            <span>Taxable Amt :</span>
                                                            <span className="val">{bTaxable.toFixed(2)}</span>
                                                        </div>
                                                        <div className="tax-row">
                                                            <span>CGST :</span>
                                                            <span className="val">{bCgst.toFixed(2)}</span>
                                                            <span style={{ marginLeft: '14px' }}>GST :</span>
                                                            <span className="val">{bTotalGst.toFixed(2)}</span>
                                                        </div>
                                                        <div className="tax-row">
                                                            <span>SGST :</span>
                                                            <span className="val">{bSgst.toFixed(2)}</span>
                                                            <span style={{ marginLeft: '14px' }}>Net Amount :</span>
                                                            <span className="val">{bNet.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })()}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    {/* Grand Total */}
                    <div className="grand-total-bar">
                        <span className="label">Net Total Amount :</span>
                        <span className="amount">{Number(grandTotal || 0).toFixed(2)}</span>
                    </div>

                    <div className="footer-page-bar">
                        Page No: 1/1
                    </div>
                </PrintableSheet>
            )}
        </Container>
    );
};

export default PatientWisePharmacyIpBillReport;

