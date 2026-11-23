import React, { useState, useEffect, useCallback } from 'react';
import { Spin, message } from 'antd';
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
  padding: 40px 50px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  max-width: 850px;
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

  .meta-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    font-size: 11px;
    line-height: 1.5;

    .meta-col-left {
      width: 52%;
    }

    .meta-col-right {
      width: 44%;
    }

    .meta-row {
      display: flex;
      margin-bottom: 3px;

      .lbl {
        width: 130px;
        font-weight: bold;
      }
      .val {
        flex: 1;
      }
    }
  }

  .divider-line {
    border-top: 1px solid #000000;
    margin: 10px 0 16px 0;
  }

  .section-heading {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 12px;
  }

  .bill-details-container {
    width: 100%;
    margin-bottom: 20px;

    .items-table {
      width: 100%;
      border-collapse: collapse;

      td {
        padding: 5px 4px;
        font-size: 11px;

        &.item-title {
          font-weight: bold;
          width: 70%;
        }
        &.item-amount {
          text-align: right;
          width: 30%;
        }
      }

      .total-row td {
        border-top: 1px solid #000000;
        border-bottom: 1.5px solid #000000;
        padding: 8px 4px;
        font-weight: bold;
        font-size: 11.5px;
      }
    }
  }

  .signatures-block {
    display: flex;
    justify-content: space-between;
    margin-top: 80px;
    padding-top: 20px;

    .sig-col {
      text-align: left;
      font-size: 11px;

      .sig-name {
        font-weight: bold;
        margin-bottom: 2px;
      }
      .sig-role {
        color: #000000;
      }
    }
  }
`;

const InsuranceDischargeBillAllReport = ({ embedded = false }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const initialIp = queryParams.get('ip_number') || '';
    const initialUhid = queryParams.get('uhid') || '';
    const initialBillNumber = queryParams.get('bill_number') || queryParams.get('bill_no') || '';
    const initialTitle = queryParams.get('report_title') || '';
    const initialReportType = queryParams.get('report_type') || '';

    const [ipNumber, setIpNumber] = useState(initialIp);
    const [uhid, setUhid] = useState(initialUhid);
    const [billNumber, setBillNumber] = useState(initialBillNumber);
    const [loading, setLoading] = useState(false);
    const [payload, setPayload] = useState(null);

    const activeReportTitle = initialTitle || payload?.report_title || 'Insurance Discharge Bill (All)';

    const loadData = useCallback(async (targetIp = ipNumber, targetUhid = uhid, targetBill = billNumber) => {
        try {
            setLoading(true);
            const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
            const url = `${getBaseUrl.replace(/\/$/, '')}/report-insurance-discharge-bill-all/?bill_number=${encodeURIComponent(targetBill)}&ip_number=${encodeURIComponent(targetIp)}&uhid=${encodeURIComponent(targetUhid)}&report_title=${encodeURIComponent(initialTitle)}&report_type=${encodeURIComponent(initialReportType)}`;
            const res = await apiRequest(url, 'GET');

            if (res && res.success) {
                const dataObj = (res.data && res.data.patient_info) ? res.data : (res.data || res);
                setPayload(dataObj);
            } else {
                message.warning(res?.message || 'No discharge bill found.');
                setPayload(null);
            }
        } catch (err) {
            console.error('Error fetching insurance discharge bill:', err);
            message.error('Failed to load discharge bill.');
        } finally {
            setLoading(false);
        }
    }, [ipNumber, uhid, billNumber, initialTitle, initialReportType]);

    useEffect(() => {
        loadData(initialIp, initialUhid, initialBillNumber);
    }, [initialIp, initialUhid, initialBillNumber, loadData]);

    const handlePrint = () => {
        printInsuranceReport('printable-discharge-bill-sheet', {
            reportTitle: activeReportTitle,
            patientInfo: null, // The sheet already contains Shanmuga Hospital patient & bill metadata columns
            orientation: 'portrait'
        });
    };

    const handleExportExcel = () => {
        const detailsList = Array.isArray(payload?.bill_details) ? payload.bill_details : [];
        if (detailsList.length === 0) {
            message.info('No data available to export.');
            return;
        }

        try {
            const calculatedSum = detailsList.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
            const rawExportTotal = Number(payload?.total_amount);
            const summaryExportTotal = Number(payload?.summary?.gross_bill_amount);
            const exportTotal = rawExportTotal > 0 ? rawExportTotal : (summaryExportTotal > 0 ? summaryExportTotal : calculatedSum);
            const rows = detailsList.map(d => ({
                'Particulars': d.category || d.particulars,
                'Amount': d.amount
            }));
            rows.push({
                'Particulars': 'Total',
                'Amount': exportTotal
            });

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Discharge_Bill');
            XLSX.writeFile(wb, `${activeReportTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${ipNumber.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
        } catch (e) {
            console.error('Export error:', e);
            message.error('Export failed.');
        }
    };

    const patient = payload?.patient_info || {};
    const billMeta = payload?.bill_meta || payload?.patient_info || {};
    const details = Array.isArray(payload?.bill_details) ? payload.bill_details : (Array.isArray(payload?.bill_particulars) ? payload.bill_particulars : []);
    const calculatedSum = details.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
    const rawTotal = Number(payload?.total_amount);
    const summaryTotal = Number(payload?.summary?.gross_bill_amount);
    const totalAmount = rawTotal > 0 ? rawTotal : (summaryTotal > 0 ? summaryTotal : calculatedSum);

    const pickVal = (...vals) => {
        for (const v of vals) {
            if (v != null && String(v).trim() !== '' && String(v).trim() !== '-' && String(v).trim() !== 'N') {
                return String(v).trim();
            }
        }
        return '-';
    };

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
                    #printable-discharge-bill-sheet,
                    #printable-discharge-bill-sheet * {
                        visibility: visible !important;
                    }
                    #printable-discharge-bill-sheet {
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
                            <h2>{activeReportTitle}</h2>
                            <p>Itemized inpatient hospital discharge claim bill statement with procedure, bed, investigation and pharmacy charges</p>
                        </div>
                    </div>

                    <div className="filters-side">
                        <div className="filter-input">
                            <Search size={15} color="#64748b" />
                            <input
                                type="text"
                                placeholder="Bill Number (e.g. 2627/000193)..."
                                value={billNumber}
                                onChange={(e) => setBillNumber(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') loadData(ipNumber, uhid, e.target.value); }}
                            />
                        </div>

                        <div className="filter-input">
                            <User size={15} color="#64748b" />
                            <input
                                type="text"
                                placeholder="Enter IP Number..."
                                value={ipNumber}
                                onChange={(e) => setIpNumber(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') loadData(e.target.value, uhid, billNumber); }}
                            />
                        </div>

                        <div className="filter-input">
                            <User size={15} color="#64748b" />
                            <input
                                type="text"
                                placeholder="Or UHID..."
                                value={uhid}
                                onChange={(e) => setUhid(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') loadData(ipNumber, e.target.value, billNumber); }}
                            />
                        </div>

                        <button className="btn-query" onClick={() => loadData(ipNumber, uhid, billNumber)}>
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
                    <p style={{ marginTop: '14px', color: '#64748b', fontWeight: '500' }}>Loading discharge bill statement...</p>
                </div>
            ) : (
                <PrintableSheet id="printable-discharge-bill-sheet">
                    {/* Official Shanmuga Hospital Ltd. Header matching image media_1795329956212_4709c03e.jpg */}
                    <div className="sheet-hospital-header" style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ textAlign: 'center', flex: 1, padding: '0 10px' }}>
                                <h1 style={{ margin: '0 0 2px 0', fontSize: '24px', fontWeight: '900', color: '#166534', letterSpacing: '-0.3px', textTransform: 'none' }}>
                                    Shanmuga Hospital Ltd.,
                                </h1>
                                <div style={{ fontSize: '8.5px', color: '#14532d', fontWeight: 600, margin: '2px 0' }}>
                                    Approved Hospital for Central / State / TKT / TN. GOVT. EMPLOYESS / ECHS / ESI / BSNL / FCI / ALL INSURANCE COMPANIES / CASHLESS / REIMBURSEMENT
                                </div>
                                <div style={{ fontSize: '9.5px', color: '#000000', fontWeight: 500 }}>
                                    24, Saradha College Road, SALEM - 636 007.
                                </div>
                                <div style={{ fontSize: '9.5px', color: '#000000', fontWeight: 700, marginTop: '1px' }}>
                                    ☎ 0427-2706666 / 87540 33833
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '9px', fontWeight: 'bold', color: '#000000', minWidth: '130px' }}>
                                CIN : L85110TZ2020PLC033974
                            </div>
                        </div>
                        <div style={{ borderBottom: '2px solid #166534', marginTop: '8px', marginBottom: '8px' }}></div>
                        <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: '900', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#166534', padding: '2px 0' }}>
                            DISCHARGE BILL
                        </div>
                        <div style={{ borderBottom: '1px solid #166534', marginBottom: '14px' }}></div>
                    </div>

                    {/* Patient & Bill Metadata Two Columns */}
                    <div className="meta-container">
                        <div className="meta-col-left">
                            <div className="meta-row">
                                <span className="lbl">OP Number</span>
                                <span className="val">: {pickVal(patient.op_number, patient.uhid, uhid)}</span>
                            </div>
                            <div className="meta-row">
                                <span className="lbl">Name</span>
                                <span className="val">: {pickVal(patient.name, patient.patient_name)} {pickVal(patient.age) !== '-' ? `${pickVal(patient.age)} Years` : ''}</span>
                            </div>
                            <div className="meta-row" style={{ alignItems: 'flex-start' }}>
                                <span className="lbl">Address</span>
                                <span className="val">: {pickVal(patient.address)}</span>
                            </div>
                            <div className="meta-row">
                                <span className="lbl">Doctor</span>
                                <span className="val">: {pickVal(patient.doctor, patient.doctor_name)}</span>
                            </div>
                            <div className="meta-row">
                                <span className="lbl">Claim Intimation</span>
                                <span className="val">: {pickVal(patient.claim_intimation, patient.claim_intimation_no)}</span>
                            </div>
                        </div>

                        <div className="meta-col-right">
                            <div className="meta-row">
                                <span className="lbl">Bill Number</span>
                                <span className="val">: {pickVal(billMeta.bill_number, billMeta.bill_no, patient.bill_no, patient.bill_number)}</span>
                            </div>
                            <div className="meta-row">
                                <span className="lbl">Billdate</span>
                                <span className="val">: {pickVal(billMeta.bill_date, patient.bill_date)}</span>
                            </div>
                            <div className="meta-row">
                                <span className="lbl">Treatment start</span>
                                <span className="val">: {pickVal(billMeta.treatment_start, billMeta.doa, patient.treatment_start, patient.doa, patient.admitted_date)}</span>
                            </div>
                            <div className="meta-row">
                                <span className="lbl">Treatment end</span>
                                <span className="val">: {pickVal(billMeta.treatment_end, billMeta.dod, patient.treatment_end, patient.dod, patient.discharge_date)}</span>
                            </div>
                            <div className="meta-row">
                                <span className="lbl">Company</span>
                                <span className="val">: {pickVal(billMeta.company, billMeta.company_name, patient.company_name, patient.insurance_company)}</span>
                            </div>
                            <div className="meta-row">
                                <span className="lbl">REF ID</span>
                                <span className="val">: {pickVal(billMeta.ref_id, billMeta.approval, patient.ref_id, patient.approval)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="divider-line" />

                    {/* Package Details */}
                    <div style={{ display: 'flex', marginBottom: '8px', fontSize: '11px' }}>
                        <div style={{ width: '130px', fontWeight: 'bold' }}>Package Details</div>
                        <div style={{ flex: 1, fontWeight: 'bold' }}>
                            {pickVal(payload?.package_details, billMeta.package_details, patient.package_details)}
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div style={{ display: 'flex', marginBottom: '14px', fontSize: '11px' }}>
                        <div style={{ width: '130px', fontWeight: 'bold' }}>Diagnosis</div>
                        <div style={{ flex: 1, fontWeight: 'bold' }}>
                            {pickVal(payload?.diagnosis, billMeta.diagnosis, patient.diagnosis)}
                        </div>
                    </div>

                    <div className="section-heading" style={{ marginTop: '14px', marginBottom: '8px' }}>Bill Details</div>

                    <div className="bill-details-container">
                        <table className="items-table">
                            <tbody>
                                {(!Array.isArray(details) || details.length === 0) ? (
                                    <tr>
                                        <td colSpan={2} style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
                                            No record found
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {details.map((d, idx) => (
                                            <tr key={idx}>
                                                <td className="item-title">{d.itemName || d.category || d.particulars}</td>
                                                <td className="item-amount" style={{ fontWeight: 'bold' }}>{Number(d.amount || d.price || 0).toFixed(2)}</td>
                                            </tr>
                                        ))}

                                        <tr className="total-row" style={{ borderTop: '1px solid #000', borderBottom: '3px double #000' }}>
                                            <td className="item-title" style={{ textAlign: 'center', fontWeight: '900', fontSize: '12px' }}>Total</td>
                                            <td className="item-amount" style={{ fontWeight: '900', fontSize: '12px' }}>{Number(totalAmount).toFixed(2)}</td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Signatures: Designation ONLY */}
                    <div className="signatures-block" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '70px', paddingTop: '10px' }}>
                        <div className="sig-col" style={{ textAlign: 'left', fontSize: '11px' }}>
                            <div style={{ borderTop: '1px solid #000000', width: '180px', marginBottom: '6px' }}></div>
                            <div className="sig-role" style={{ fontWeight: 'bold', fontSize: '11px', color: '#000000' }}>Insurance Executive</div>
                        </div>

                        <div className="sig-col" style={{ textAlign: 'right', fontSize: '11px' }}>
                            <div style={{ borderTop: '1px solid #000000', width: '220px', marginBottom: '6px', marginLeft: 'auto' }}></div>
                            <div className="sig-role" style={{ fontWeight: 'bold', fontSize: '11px', color: '#000000' }}>General Manager - Insurance</div>
                        </div>
                    </div>
                </PrintableSheet>
            )}
        </Container>
    );
};

export default InsuranceDischargeBillAllReport;

