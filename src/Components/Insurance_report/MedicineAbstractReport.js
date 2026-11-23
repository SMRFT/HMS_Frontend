import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  font-size: 13px;

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
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 3px;
      color: #000000;
    }
    .hosp-addr {
      font-size: 13px;
      margin-bottom: 2px;
      color: #000000;
      font-weight: 500;
    }
    .hosp-phone {
      font-size: 13px;
      margin-bottom: 12px;
      color: #000000;
      font-weight: 500;
    }
    .rep-name {
      font-size: 16px;
      font-weight: 800;
      margin-bottom: 8px;
      color: #000000;
    }
  }

  .divider-line {
    border-top: 1.5px solid #000000;
    margin: 8px 0;
  }

  .patient-bar {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 6px 0;
    line-height: 1.7;

    .left-side {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .right-side {
      display: flex;
      flex-direction: column;
      gap: 5px;
      min-width: 320px;
    }

    .row-field {
      display: flex;
      .field-lbl {
        width: 120px;
        font-weight: 700;
        color: #000000;
      }
      .field-sep {
        margin-right: 8px;
        font-weight: 700;
      }
      .field-val {
        font-weight: 600;
        color: #000000;
      }
    }
  }

  .table-box {
    margin-top: 8px;

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      color: #000000;

      thead {
        tr {
          border-top: 1.5px solid #000000;
          border-bottom: 1.5px solid #000000;
        }
        th {
          padding: 8px 6px;
          font-weight: 800;
          font-size: 13px;
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
            padding: 7px 6px;
            color: #000000;
            font-size: 13px;

            &.text-center { text-align: center; }
            &.text-right { 
              text-align: right; 
              font-weight: 700;
            }
          }
        }

        tr.grand-total-row {
          border-top: 1.5px solid #000000;
          border-bottom: 2.5px solid #000000;
          font-weight: 900;

          td {
            padding: 9px 6px;
            color: #000000;
            font-size: 14px;
            font-weight: 900;

            &.text-right { text-align: right; font-weight: 900; }
            &.text-left { text-align: left; font-weight: 900; }
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
    const initialIp = searchParams.get('ip_number') || searchParams.get('ip_no') || '';
    const initialUhid = searchParams.get('uhid') || '';
    const initialFrom = searchParams.get('from_date') || dayjs().subtract(60, 'day').format('YYYY-MM-DD');
    const initialTo = searchParams.get('to_date') || dayjs().format('YYYY-MM-DD');

    const [uhid, setUhid] = useState(initialUhid);
    const [ipNumber, setIpNumber] = useState(initialIp);
    const [ipOptions, setIpOptions] = useState([]);
    const [searchingIps, setSearchingIps] = useState(false);
    const [fromDate, setFromDate] = useState(dayjs(initialFrom));
    const [toDate, setToDate] = useState(dayjs(initialTo));

    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const debounceTimerRef = useRef(null);

    const fetchReport = useCallback(async (targetIp, targetUhid, fDate, tDate) => {
        const queryTerm = (targetIp && targetIp.trim()) || (targetUhid && targetUhid.trim());
        if (!queryTerm) {
            setReportData(null);
            return;
        }
        setLoading(true);
        try {
            const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
            const fromStr = fDate ? fDate.format('YYYY-MM-DD') : '';
            const toStr = tDate ? tDate.format('YYYY-MM-DD') : '';
            const ipParam = targetIp ? targetIp.trim() : '';
            const uhidParam = targetUhid ? targetUhid.trim() : '';
            const url = `${getBaseUrl.replace(/\/$/, '')}/report-medicine-abstract/?ip_number=${encodeURIComponent(ipParam)}&uhid=${encodeURIComponent(uhidParam)}&from_date=${fromStr}&to_date=${toStr}`;

            const res = await apiRequest(url, 'GET');
            if (res && res.success) {
                const dataObj = (res.data && res.data.patient_info) ? res.data : (res.data?.data || res.data || res);
                setReportData(dataObj);
                if (dataObj.patient_info?.uhid && !uhid) {
                    setUhid(dataObj.patient_info.uhid);
                }
                if (dataObj.patient_info?.ip_number) {
                    setIpNumber(dataObj.patient_info.ip_number);
                }
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
    }, [uhid, ipNumber]);

    const fetchIpOptions = useCallback(async (uhidVal, autoSelectFirst = true, selectedIp = '') => {
        if (!uhidVal || uhidVal.trim().length < 2) {
            setIpOptions([]);
            return;
        }
        setSearchingIps(true);
        try {
            const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/get-ip-numbers-by-uhid/?uhid=${encodeURIComponent(uhidVal.trim())}`, 'GET');
            const admissions = res?.data?.admissions || res?.admissions || (Array.isArray(res?.data) ? res.data : []);
            if (Array.isArray(admissions) && admissions.length > 0) {
                setIpOptions(admissions);
                if (autoSelectFirst) {
                    const match = selectedIp && admissions.some(a => a.ip_number === selectedIp);
                    const chosen = match ? selectedIp : admissions[0].ip_number;
                    const chosenAdm = admissions.find(a => a.ip_number === chosen) || admissions[0];
                    setIpNumber(chosen);

                    let fD = fromDate;
                    let tD = toDate;
                    if (chosenAdm.admission_date) {
                        const parsedStart = dayjs(chosenAdm.admission_date.slice(0, 10), 'DD/MM/YYYY');
                        if (parsedStart.isValid()) {
                            const parsedEnd = chosenAdm.discharge_date ? dayjs(chosenAdm.discharge_date.slice(0, 10), 'DD/MM/YYYY') : dayjs();
                            fD = parsedStart;
                            tD = parsedEnd.isValid() ? parsedEnd : dayjs();
                            setFromDate(fD);
                            setToDate(tD);
                        }
                    }
                    fetchReport(chosen, uhidVal, fD, tD);
                }
            } else {
                setIpOptions([]);
            }
        } catch (err) {
            console.error('Error fetching IP options:', err);
            setIpOptions([]);
        } finally {
            setSearchingIps(false);
        }
    }, [fromDate, toDate, fetchReport]);

    const mountedRef = useRef(false);
    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;
        if (initialUhid && initialUhid.trim()) {
            fetchIpOptions(initialUhid, true, initialIp);
        } else if (initialIp || initialUhid) {
            fetchReport(initialIp, initialUhid, fromDate, toDate);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleUhidChange = (val) => {
        setUhid(val);
        setIpNumber('');
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        if (val && val.trim().length >= 2) {
            debounceTimerRef.current = setTimeout(() => {
                fetchIpOptions(val.trim(), true, '');
            }, 350);
        } else {
            setIpOptions([]);
        }
    };

    const handleSelectAdmission = (adm) => {
        if (!adm || !adm.ip_number) return;
        const newIp = adm.ip_number;
        setIpNumber(newIp);

        let fD = fromDate;
        let tD = toDate;
        if (adm.admission_date) {
            const parsedStart = dayjs(adm.admission_date.slice(0, 10), 'DD/MM/YYYY');
            if (parsedStart.isValid()) {
                const parsedEnd = adm.discharge_date ? dayjs(adm.discharge_date.slice(0, 10), 'DD/MM/YYYY') : dayjs();
                fD = parsedStart;
                tD = parsedEnd.isValid() ? parsedEnd : dayjs();
                setFromDate(fD);
                setToDate(tD);
            }
        }
        fetchReport(newIp, uhid, fD, tD);
    };

    const handleQuery = () => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        if (ipOptions.length === 0 && uhid && uhid.trim().length >= 2) {
            fetchIpOptions(uhid.trim(), true, ipNumber);
            return;
        }
        const targetIp = ipNumber || (ipOptions.length > 0 ? ipOptions[0].ip_number : '');
        if (targetIp && !ipNumber) setIpNumber(targetIp);
        fetchReport(targetIp, uhid, fromDate, toDate);
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
                'UHID': b.uhid || patient?.uhid || patient?.op_number || '-',
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
            'UHID': '',
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
                patient_name: patient?.patient_name,
                doctor: patient?.doctor_name || patient?.doctor,
                company: patient?.company || patient?.insurance_company || patient?.company_name || '-'
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
                    <div className="filter-input" style={{ width: '160px' }}>
                        <User size={15} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Type UHID..."
                            value={uhid}
                            onChange={(e) => handleUhidChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                            style={{ width: '120px' }}
                        />
                    </div>

                    {/* IP Admissions Dropdown / Direct IP Input */}
                    {ipOptions.length > 0 ? (
                        <div className="filter-input" style={{ width: '250px', padding: '0 6px' }}>
                            <select
                                value={ipNumber}
                                onChange={(e) => {
                                    const selectedAdm = ipOptions.find(opt => opt.ip_number === e.target.value);
                                    handleSelectAdmission(selectedAdm || { ip_number: e.target.value });
                                }}
                                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', background: 'transparent', fontWeight: 600, color: '#0f766e' }}
                            >
                                <option value="">-- Select IP Admission --</option>
                                {ipOptions.map(opt => (
                                    <option key={opt.ip_number} value={opt.ip_number}>
                                        {opt.ip_number} ({opt.admission_date ? opt.admission_date.slice(0, 10) : ''}{opt.patient_name ? ` - ${opt.patient_name}` : ''})
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="filter-input" style={{ width: '160px' }}>
                            <input
                                type="text"
                                placeholder="IP Number..."
                                value={ipNumber}
                                onChange={(e) => setIpNumber(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                                style={{ width: '140px' }}
                            />
                        </div>
                    )}

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
                            <div className="row-field">
                                <span className="field-lbl">Doctor</span>
                                <span className="field-sep">:</span>
                                <span className="field-val">{patient?.doctor_name || patient?.doctor || '-'}</span>
                            </div>
                            <div className="row-field">
                                <span className="field-lbl">UHID</span>
                                <span className="field-sep">:</span>
                                <span className="field-val">{patient?.uhid || patient?.op_number || '-'}</span>
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
                                        <th style={{ width: '40px' }} className="text-left">Slno</th>
                                        <th style={{ width: '85px' }} className="text-left">Bill Date</th>
                                        <th style={{ width: '95px' }} className="text-left">Bill Number</th>
                                        <th style={{ width: '95px' }} className="text-left">UHID</th>
                                        <th style={{ width: '90px' }} className="text-left">Credit Status</th>
                                        <th style={{ width: '90px' }} className="text-right">Taxable Amt</th>
                                        <th style={{ width: '60px' }} className="text-right">Cgst</th>
                                        <th style={{ width: '60px' }} className="text-right">Sgst</th>
                                        <th style={{ width: '60px' }} className="text-right">Gst</th>
                                        {hasDiscount && <th style={{ width: '70px' }} className="text-right">Discount</th>}
                                        <th style={{ width: '95px' }} className="text-right">Bill Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.map((b) => (
                                        <tr key={b.bill_number}>
                                            <td className="text-left">{b.sl_no}</td>
                                            <td className="text-left">{b.bill_date}</td>
                                            <td className="text-left">{b.bill_number}</td>
                                            <td className="text-left" style={{ fontWeight: 600 }}>{b.uhid || patient?.uhid || patient?.op_number || '-'}</td>
                                            <td className="text-left">{b.credit_status}</td>
                                            <td className="text-right" style={{ fontWeight: 800 }}>{Number(b.taxable_amt || 0).toFixed(2)}</td>
                                            <td className="text-right" style={{ fontWeight: 800 }}>{Number(b.cgst || 0).toFixed(2)}</td>
                                            <td className="text-right" style={{ fontWeight: 800 }}>{Number(b.sgst || 0).toFixed(2)}</td>
                                            <td className="text-right" style={{ fontWeight: 800 }}>{Number(b.gst || 0).toFixed(2)}</td>
                                            {hasDiscount && <td className="text-right" style={{ color: '#b91c1c', fontWeight: 800 }}>{Number(b.discount_amount || 0) > 0 ? `-${Number(b.discount_amount).toFixed(2)}` : '0.00'}</td>}
                                            <td className="text-right" style={{ fontWeight: 800 }}>{Number(b.net_amount ?? b.bill_amount ?? 0).toFixed(2)}</td>
                                        </tr>
                                    ))}

                                    {/* Grand Total Row matching PDF */}
                                    <tr className="grand-total-row">
                                        <td colSpan={5} className="text-left" style={{ fontWeight: 900 }}>Total</td>
                                        <td className="text-right" style={{ fontWeight: 900 }}>{Number(summary.total_taxable || 0).toFixed(2)}</td>
                                        <td className="text-right" style={{ fontWeight: 900 }}>{Number(summary.total_cgst || 0).toFixed(2)}</td>
                                        <td className="text-right" style={{ fontWeight: 900 }}>{Number(summary.total_sgst || 0).toFixed(2)}</td>
                                        <td className="text-right" style={{ fontWeight: 900 }}>{Number(summary.total_gst || 0).toFixed(2)}</td>
                                        {hasDiscount && <td className="text-right" style={{ color: '#b91c1c', fontWeight: 900 }}>{Number(summary.total_discount || 0) > 0 ? `-${Number(summary.total_discount).toFixed(2)}` : '0.00'}</td>}
                                        <td className="text-right" style={{ fontWeight: 900 }}>{Number(summary.total_bill_amount ?? summary.total_net_amount ?? 0).toFixed(2)}</td>
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

