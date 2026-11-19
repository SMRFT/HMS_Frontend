import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    width: 360px;
    max-width: 100%;
    margin-top: 6px;
    margin-bottom: 14px;
    border-top: 1.5px solid #000000;
    border-bottom: 1px solid #000000;
    padding: 6px 4px;
    display: flex;
    justify-content: space-between;
    gap: 20px;
    font-size: 11px;

    .tax-col-left, .tax-col-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .tax-row-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: 1.5;

      .tax-label {
        color: #1e293b;
        font-size: 11px;
      }
      .tax-val {
        font-weight: bold;
        font-size: 11px;
        min-width: 65px;
        text-align: right;
      }
    }

    .net-amount-row {
      margin-top: 3px;
      padding-top: 4px;
      border-top: 1px dashed #000000;

      .net-label {
        font-size: 13.5px;
        font-weight: 800;
        color: #000000;
        letter-spacing: 0.3px;
      }
      .net-val {
        font-size: 14px;
        font-weight: 900;
        color: #000000;
        text-align: right;
      }
    }
  }

  .grand-total-bar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    border-top: 2px solid #000000;
    border-bottom: 2px solid #000000;
    padding: 8px 6px;
    margin-top: 12px;
    background: #f8fafc;

    .label {
      margin-right: 24px;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      color: #000000;
    }
    .amount {
      min-width: 100px;
      text-align: right;
      font-size: 16px;
      font-weight: 900;
      color: #000000;
    }
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
    const initialUhid = queryParams.get('uhid') || queryParams.get('ip_number') || queryParams.get('ip_no') || '';
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

            const url = `${getBaseUrl.replace(/\/$/, '')}/report-patient-wise-pharmacy-ip-bill/?uhid=${encodeURIComponent(targetUhid)}&ip_number=${encodeURIComponent(targetUhid)}&from_date=${fDate}&to_date=${tDate}`;
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

    const dateGroupedBills = useMemo(() => {
        if (!Array.isArray(bills) || bills.length === 0) return [];

        const parseSortKey = (dStr) => {
            if (!dStr) return "00000000";
            const parts = String(dStr).split(/[-/]/);
            if (parts.length === 3) {
                if (parts[0].length === 4) return `${parts[0]}${parts[1].padStart(2, '0')}${parts[2].padStart(2, '0')}`;
                return `${parts[2]}${parts[1].padStart(2, '0')}${parts[0].padStart(2, '0')}`;
            }
            return String(dStr);
        };

        const map = {};
        bills.forEach(bill => {
            const d = bill.bill_date || bill.date || "Unknown Date";
            if (!map[d]) {
                map[d] = {
                    date: d,
                    sortKey: parseSortKey(d),
                    bills: [],
                    totalTaxable: 0,
                    totalGst: 0,
                    totalNet: 0
                };
            }
            map[d].bills.push(bill);

            const bTaxable = (bill.taxable_amt !== undefined && bill.taxable_amt !== null && !isNaN(Number(bill.taxable_amt)))
                ? Number(bill.taxable_amt)
                : (Array.isArray(bill.items) ? bill.items.reduce((acc, it) => acc + (Number(it.taxable_amt) || 0), 0) : 0);
            const bCgst = (bill.cgst_amt !== undefined && bill.cgst_amt !== null && !isNaN(Number(bill.cgst_amt)))
                ? Number(bill.cgst_amt)
                : (Array.isArray(bill.items) ? bill.items.reduce((acc, it) => acc + (Number(it.cgst_amt ?? it.cgst) || 0), 0) : 0);
            const bSgst = (bill.sgst_amt !== undefined && bill.sgst_amt !== null && !isNaN(Number(bill.sgst_amt)))
                ? Number(bill.sgst_amt)
                : (Array.isArray(bill.items) ? bill.items.reduce((acc, it) => acc + (Number(it.sgst_amt ?? it.sgst) || 0), 0) : 0);
            const bNet = (bill.net_amount !== undefined && bill.net_amount !== null && !isNaN(Number(bill.net_amount)))
                ? Number(bill.net_amount)
                : (bill.bill_total ? Number(bill.bill_total) : (Array.isArray(bill.items) ? bill.items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0) : 0));

            map[d].totalTaxable += bTaxable;
            map[d].totalGst += (bCgst + bSgst);
            map[d].totalNet += bNet;
        });

        return Object.values(map).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }, [bills]);

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
                    #printable-pharmacy-ip-sheet .tax-summary-box {
                        margin-left: auto !important;
                        width: 360px !important;
                        display: flex !important;
                        justify-content: space-between !important;
                        gap: 20px !important;
                        margin-top: 5px !important;
                        margin-bottom: 8px !important;
                        padding: 5px 2px !important;
                        border-top: 1.5px solid #000000 !important;
                        border-bottom: 1px solid #000000 !important;
                        font-size: 8.5pt !important;
                        page-break-inside: avoid !important;
                    }
                    #printable-pharmacy-ip-sheet .tax-col-left,
                    #printable-pharmacy-ip-sheet .tax-col-right {
                        flex: 1 !important;
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 2px !important;
                    }
                    #printable-pharmacy-ip-sheet .tax-row-item {
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        line-height: 1.4 !important;
                    }
                    #printable-pharmacy-ip-sheet .tax-label {
                        font-size: 8.5pt !important;
                        color: #000000 !important;
                    }
                    #printable-pharmacy-ip-sheet .tax-val {
                        font-size: 8.5pt !important;
                        font-weight: bold !important;
                        text-align: right !important;
                        min-width: 55px !important;
                    }
                    #printable-pharmacy-ip-sheet .net-amount-row {
                        margin-top: 2px !important;
                        padding-top: 3px !important;
                        border-top: 1px dashed #000000 !important;
                    }
                    #printable-pharmacy-ip-sheet .net-label {
                        font-size: 11pt !important;
                        font-weight: 800 !important;
                        color: #000000 !important;
                        letter-spacing: 0.3px !important;
                    }
                    #printable-pharmacy-ip-sheet .net-val {
                        font-size: 12pt !important;
                        font-weight: 900 !important;
                        color: #000000 !important;
                        text-align: right !important;
                    }
                    #printable-pharmacy-ip-sheet .grand-total-bar {
                        display: flex !important;
                        justify-content: flex-end !important;
                        align-items: center !important;
                        border-top: 2px solid #000000 !important;
                        border-bottom: 2px solid #000000 !important;
                        padding: 6px 2px !important;
                        margin-top: 10px !important;
                        background: transparent !important;
                        page-break-inside: avoid !important;
                    }
                    #printable-pharmacy-ip-sheet .grand-total-bar .label {
                        margin-right: 20px !important;
                        font-size: 11pt !important;
                        font-weight: 800 !important;
                        text-transform: uppercase !important;
                        color: #000000 !important;
                    }
                    #printable-pharmacy-ip-sheet .grand-total-bar .amount {
                        font-size: 13pt !important;
                        font-weight: 900 !important;
                        text-align: right !important;
                        color: #000000 !important;
                        min-width: 80px !important;
                    }
                    #printable-pharmacy-ip-sheet .text-right {
                        text-align: right !important;
                    }
                    #printable-pharmacy-ip-sheet .text-center {
                        text-align: center !important;
                    }
                    #printable-pharmacy-ip-sheet .text-left {
                        text-align: left !important;
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
                                placeholder="Enter UHID or IP Number..."
                                value={uhid}
                                onChange={(e) => setUhid(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') loadData(); }}
                            />
                        </div>

                        <DatePicker.RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                            format="DD/MM/YYYY"
                            allowClear={true}
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
                                <th style={{ width: '40px', textAlign: 'center' }} className="text-center">Qty</th>
                                <th style={{ textAlign: 'left' }} className="text-left">Particulars</th>
                                <th style={{ width: '70px', textAlign: 'center' }} className="text-center">HSN</th>
                                <th style={{ width: '95px', textAlign: 'left' }} className="text-left">Batch</th>
                                <th style={{ width: '85px', textAlign: 'center' }} className="text-center">Expiry</th>
                                <th style={{ width: '90px', textAlign: 'right' }} className="text-right">Taxable Amt</th>
                                <th style={{ width: '55px', textAlign: 'center' }} className="text-center">CGST %</th>
                                <th style={{ width: '65px', textAlign: 'right' }} className="text-right">CGST</th>
                                <th style={{ width: '55px', textAlign: 'center' }} className="text-center">SGST %</th>
                                <th style={{ width: '65px', textAlign: 'right' }} className="text-right">SGST</th>
                                <th style={{ width: '90px', textAlign: 'right' }} className="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!Array.isArray(dateGroupedBills) || dateGroupedBills.length === 0) ? (
                                <tr>
                                    <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                                        No record found
                                    </td>
                                </tr>
                            ) : dateGroupedBills.map((group, gIdx) => (
                                <React.Fragment key={gIdx}>
                                    {/* Date Group Banner Header */}
                                    <tr className="date-group-header">
                                        <td colSpan={11} style={{ background: '#f1f5f9', fontWeight: 'bold', fontSize: '11px', padding: '6px 8px', borderTop: '1.5px solid #000', borderBottom: '1px solid #000', textTransform: 'uppercase' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                                <span>DATE : {group.date}</span>
                                                <span style={{ fontSize: '10px', background: '#e2e8f0', color: '#334155', padding: '1px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                                    {group.bills.length} {group.bills.length === 1 ? 'BILL' : 'BILLS'}
                                                </span>
                                            </span>
                                        </td>
                                    </tr>

                                    {group.bills.map((bill, bIdx) => (
                                        <React.Fragment key={`${gIdx}-${bIdx}`}>
                                            <tr className="bill-group-header">
                                                <td colSpan={6} style={{ textAlign: 'left' }}>
                                                    Bill Number : {bill.bill_no}
                                                </td>
                                                <td colSpan={5} className="text-right" style={{ textAlign: 'right' }}>
                                                    Bill Date : {bill.bill_date} (IP CREDITS)
                                                </td>
                                            </tr>

                                            {Array.isArray(bill.items) && bill.items.map((it, iIdx) => {
                                                const cgstVal = it.cgst_amt ?? it.cgst ?? 0;
                                                const sgstVal = it.sgst_amt ?? it.sgst ?? 0;
                                                return (
                                                    <tr key={iIdx}>
                                                        <td className="text-center" style={{ textAlign: 'center' }}>{it.qty}</td>
                                                        <td className="text-left" style={{ textAlign: 'left' }}>{it.particulars}</td>
                                                        <td className="text-center" style={{ textAlign: 'center' }}>{it.hsn || '-'}</td>
                                                        <td className="text-left" style={{ textAlign: 'left' }}>{it.batch || '-'}</td>
                                                        <td className="text-center" style={{ textAlign: 'center' }}>{it.expiry || '-'}</td>
                                                        <td className="text-right" style={{ textAlign: 'right' }}>{Number(it.taxable_amt || 0).toFixed(2)}</td>
                                                        <td className="text-center" style={{ textAlign: 'center' }}>{it.cgst_pct ?? '-'}</td>
                                                        <td className="text-right" style={{ textAlign: 'right' }}>{Number(cgstVal || 0).toFixed(2)}</td>
                                                        <td className="text-center" style={{ textAlign: 'center' }}>{it.sgst_pct ?? '-'}</td>
                                                        <td className="text-right" style={{ textAlign: 'right' }}>{Number(sgstVal || 0).toFixed(2)}</td>
                                                        <td className="text-right" style={{ textAlign: 'right', fontWeight: 600 }}>{Number(it.amount || 0).toFixed(2)}</td>
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
                                                        <td colSpan={11} style={{ padding: '0 0 10px 0', borderBottom: 'none' }}>
                                                            <div className="tax-summary-box" style={{
                                                                marginLeft: 'auto',
                                                                width: '360px',
                                                                maxWidth: '100%',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                gap: '24px',
                                                                marginTop: '6px',
                                                                marginBottom: '12px',
                                                                padding: '6px 4px',
                                                                borderTop: '1.5px solid #000000',
                                                                borderBottom: '1px solid #000000'
                                                            }}>
                                                                {/* Left Column: Taxable Amt, CGST, SGST */}
                                                                <div className="tax-col-left" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                                    <div className="tax-row-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <span className="tax-label" style={{ fontSize: '11px', color: '#1e293b' }}>Taxable Amt :</span>
                                                                        <span className="tax-val" style={{ fontSize: '11px', fontWeight: 'bold', minWidth: '70px', textAlign: 'right' }}>{bTaxable.toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="tax-row-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <span className="tax-label" style={{ fontSize: '11px', color: '#1e293b' }}>CGST :</span>
                                                                        <span className="tax-val" style={{ fontSize: '11px', fontWeight: 'bold', minWidth: '70px', textAlign: 'right' }}>{bCgst.toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="tax-row-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <span className="tax-label" style={{ fontSize: '11px', color: '#1e293b' }}>SGST :</span>
                                                                        <span className="tax-val" style={{ fontSize: '11px', fontWeight: 'bold', minWidth: '70px', textAlign: 'right' }}>{bSgst.toFixed(2)}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Right Column: GST, Discount (if any), Net Amount */}
                                                                <div className="tax-col-right" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                                    <div className="tax-row-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <span className="tax-label" style={{ fontSize: '11px', color: '#1e293b' }}>GST :</span>
                                                                        <span className="tax-val" style={{ fontSize: '11px', fontWeight: 'bold', minWidth: '75px', textAlign: 'right' }}>{bTotalGst.toFixed(2)}</span>
                                                                    </div>
                                                                    {Number(bill.discount_amount || 0) > 0 && (
                                                                        <div className="tax-row-item discount-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#dc2626' }}>
                                                                            <span className="tax-label" style={{ fontSize: '11px', color: '#dc2626' }}>Discount :</span>
                                                                            <span className="tax-val" style={{ fontSize: '11px', fontWeight: 'bold', minWidth: '75px', textAlign: 'right', color: '#dc2626' }}>-{Number(bill.discount_amount).toFixed(2)}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="tax-row-item net-amount-row" style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        marginTop: '3px',
                                                                        paddingTop: '4px',
                                                                        borderTop: '1px dashed #000000'
                                                                    }}>
                                                                        <span className="tax-label net-label" style={{
                                                                            fontSize: '13.5px',
                                                                            fontWeight: '800',
                                                                            color: '#000000',
                                                                            letterSpacing: '0.3px',
                                                                            whiteSpace: 'nowrap'
                                                                        }}>
                                                                            Net Amount :
                                                                        </span>
                                                                        <span className="tax-val net-val" style={{
                                                                            fontSize: '14px',
                                                                            fontWeight: '900',
                                                                            color: '#000000',
                                                                            minWidth: '75px',
                                                                            textAlign: 'right'
                                                                        }}>
                                                                            {bNet.toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })()}
                                        </React.Fragment>
                                    ))}

                                    {/* Date Subtotal if multiple bills on same date */}
                                    {group.bills.length > 1 && (
                                        <tr className="date-subtotal-row" style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                                            <td colSpan={10} style={{ textAlign: 'right', padding: '6px 8px', borderTop: '1px solid #666', borderBottom: '1px solid #666', fontSize: '12px' }}>
                                                SUBTOTAL FOR DATE {group.date} ({group.bills.length} BILLS) :
                                            </td>
                                            <td style={{ textAlign: 'right', padding: '6px 8px', borderTop: '1px solid #666', borderBottom: '1px solid #666', fontSize: '12.5px', fontWeight: '800' }}>
                                                {group.totalNet.toFixed(2)}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    {/* Grand Total */}
                    <div className="grand-total-bar" style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        borderTop: '2px solid #000000',
                        borderBottom: '2px solid #000000',
                        padding: '8px 4px',
                        marginTop: '12px',
                        background: '#f8fafc'
                    }}>
                        <span className="label" style={{
                            marginRight: '24px',
                            fontSize: '13.5px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            color: '#000000',
                            letterSpacing: '0.5px'
                        }}>
                            Net Total Amount :
                        </span>
                        <span className="amount" style={{
                            minWidth: '100px',
                            textAlign: 'right',
                            fontSize: '16px',
                            fontWeight: '900',
                            color: '#000000'
                        }}>
                            {Number(grandTotal || 0).toFixed(2)}
                        </span>
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

