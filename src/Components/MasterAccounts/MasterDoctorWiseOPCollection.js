import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DatePicker, Select, Button, Spin, Input } from "antd";
import styled from "styled-components";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { Printer, Download, RefreshCw, Search, Stethoscope } from "lucide-react";
import {
    formatINR,
    cleanNum,
    extractReportData,
    fetchCachedOutlets,
    cachedApiRequest,
    ReportPageWrapper,
    ControlCard,
    HeaderBar,
    FilterBar,
    ReportPrintFooter
} from "./masterAccountsHelper";

const { RangePicker } = DatePicker;
const { Option } = Select;

const SectionContainer = styled.div`
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #cbd5e1;
    padding: 18px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    @media print {
        border: none;
        box-shadow: none;
        padding: 0;
    }
`;

const CustomPrintHeader = styled.div`
    border-bottom: 2px solid #0f172a;
    padding-bottom: 10px;
    margin-bottom: 14px;

    .hosp-name { font-size: 1.15rem; font-weight: 800; color: #0f172a; letter-spacing: 0.02em; }
    .hosp-addr { font-size: 0.82rem; color: #334155; margin-top: 2px; }
    .rep-title { font-size: 0.92rem; font-weight: 700; color: #0f172a; margin-top: 4px; }
    .rep-meta { font-size: 0.78rem; color: #475569; margin-top: 2px; }
`;

const DoctorBlock = styled.div`
    margin-bottom: 22px;
    border: 1px solid #94a3b8;
    border-radius: 6px;
    overflow: hidden;
`;

const DoctorBanner = styled.div`
    background: linear-gradient(90deg, #6b9ac4 0%, #8eb4d6 100%);
    color: #0f172a;
    padding: 7px 12px;
    font-weight: 800;
    font-size: 0.9rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    border-bottom: 1px solid #64748b;

    .doc-stats { font-size: 0.8rem; font-weight: 700; color: #0f172a; }
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;

    thead th {
        background: #f8fafc;
        color: #0f172a;
        font-weight: 800;
        padding: 6px 8px;
        border-bottom: 1.5px solid #94a3b8;
        text-align: left;
        white-space: nowrap;
    }

    tbody td {
        padding: 6px 8px;
        border-bottom: 1px solid #e2e8f0;
        color: #1e293b;
        vertical-align: top;
    }

    tbody tr:nth-child(even) { background: #f8fafc; }
    tbody tr:hover { background: #eff6ff; }

    .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .center { text-align: center; }

    .pat-name { font-weight: 700; color: #0f172a; }
    .pat-sub { font-size: 0.71rem; color: #475569; margin-top: 1px; line-height: 1.3; }
`;

const DoctorTotalRow = styled.div`
    background: #e0f2fe;
    border-top: 1.5px solid #0284c7;
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.84rem;
    font-weight: 800;
    color: #0c4a6e;
`;

const GrandTotalBanner = styled.div`
    background: #0f172a;
    color: #ffffff;
    border-radius: 8px;
    padding: 12px 18px;
    margin-top: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    font-weight: 700;
    font-size: 0.88rem;
`;

const MasterDoctorWiseOPCollection = ({
    isModalView = false,
    startDate,
    endDate,
    outlet: propOutlet,
    initialOutlet = "all",
    doctor: propDoctor,
    onLoadOptions,
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs(),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(propOutlet || initialOutlet || "all");
    const [doctorFilter, setDoctorFilter] = useState(propDoctor || "all");
    const [searchText, setSearchText] = useState("");
    const [outletsList, setOutletsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        fetchCachedOutlets(HmsBaseUrl)
            .then((data) => { if (Array.isArray(data)) setOutletsList(data); })
            .catch(() => {});
    }, [HmsBaseUrl]);

    useEffect(() => {
        if (startDate && endDate) {
            setDateRange([dayjs(startDate), dayjs(endDate)]);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        const out = propOutlet || initialOutlet;
        if (out !== undefined && out !== outlet) {
            setOutlet(out);
        }
    }, [propOutlet, initialOutlet, outlet]);

    useEffect(() => {
        if (propDoctor !== undefined && propDoctor !== doctorFilter) {
            setDoctorFilter(propDoctor || "all");
        }
    }, [propDoctor, doctorFilter]);

    const fetchReport = useCallback(async (isRefresh = false) => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/doctor-wise-op-collection/?from_date=${fDate}&to_date=${tDate}&outlet_code=${encodeURIComponent(outlet)}&doctor_id=${encodeURIComponent(doctorFilter)}${isRefresh ? "&refresh=true" : ""}`;
            const res = await cachedApiRequest(url, "GET", null, { forceRefresh: isRefresh });
            if (res?.success) {
                setReportData(extractReportData(res));
            } else {
                setReportData(null);
            }
        } catch (err) {
            console.error("Doctor Wise OP Collection Error:", err);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    }, [dateRange, outlet, doctorFilter, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const doctors = useMemo(() => reportData?.doctors || [], [reportData]);
    const doctorsOptions = useMemo(() => reportData?.doctors_options || [], [reportData]);
    const dateRangeMeta = reportData?.date_range || {};

    useEffect(() => {
        if (onLoadOptions && reportData) {
            onLoadOptions({
                doctors: doctorsOptions.map((d) => ({ doctor_id: d.id, doctor_name: d.name })),
            });
        }
    }, [onLoadOptions, reportData, doctorsOptions]);

    const filteredDoctors = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        if (!q) return doctors;
        return doctors
            .map((doc) => {
                if ((doc.doctor_name || "").toLowerCase().includes(q)) return doc;
                const rows = (doc.rows || []).filter(
                    (r) =>
                        (r.patient_name || "").toLowerCase().includes(q) ||
                        (r.op_number || "").toLowerCase().includes(q) ||
                        (r.contact_no || "").toLowerCase().includes(q) ||
                        (r.company_name || "").toLowerCase().includes(q) ||
                        (r.address || "").toLowerCase().includes(q)
                );
                if (!rows.length) return null;
                const reg = rows.reduce((s, r) => s + cleanNum(r.reg_fees), 0);
                const cons = rows.reduce((s, r) => s + cleanNum(r.cons_fee), 0);
                return { ...doc, rows, patient_count: rows.length, reg_fees: reg, cons_fee: cons, total_amount: reg + cons };
            })
            .filter(Boolean);
    }, [doctors, searchText]);

    const filteredSummary = useMemo(() => {
        let pts = 0, reg = 0, cons = 0;
        filteredDoctors.forEach((d) => {
            pts += d.patient_count || 0;
            reg += cleanNum(d.reg_fees);
            cons += cleanNum(d.cons_fee);
        });
        return {
            total_doctors: filteredDoctors.length,
            total_patients: pts,
            total_reg_fees: reg,
            total_cons_fee: cons,
            grand_total: reg + cons,
        };
    }, [filteredDoctors]);

    const fromDisp = dateRangeMeta.from_display || dateRange[0].format("DD/MM/YYYY");
    const toDisp = dateRangeMeta.to_display || dateRange[1].format("DD/MM/YYYY");
    const printedAt = reportData?.printed_at || dayjs().format("DD/MM/YYYY at HH:mm:ss");

    const handleExportExcel = () => {
        const wsRows = [
            ["SHANMUGA HOSPITAL LIMITED"],
            ["51/24, Saradha College Road, Salem - 636007"],
            [`DOCTOR WISE OP REGISTRATION DETAILED FROM ${fromDisp} TO ${toDisp}`],
            [],
            ["DOCTOR", "Slno", "Patient Name", "Gender", "Address", "OP NUMBER", "Reg Fees", "Cons Fee", "Patient Age", "Contact No", "Company Name"]
        ];

        filteredDoctors.forEach((doc) => {
            (doc.rows || []).forEach((r) => {
                wsRows.push([
                    doc.doctor_name,
                    r.sl_no,
                    r.patient_name,
                    r.gender,
                    r.address,
                    r.op_number,
                    cleanNum(r.reg_fees),
                    cleanNum(r.cons_fee),
                    r.age,
                    r.contact_no,
                    r.company_name,
                ]);
            });
            wsRows.push([
                `Total Patients (${doc.doctor_name}): ${doc.patient_count}`,
                "", "", "", "", "Total Amount :",
                cleanNum(doc.reg_fees),
                cleanNum(doc.cons_fee),
                "", "",
                `Grand Total: ${cleanNum(doc.total_amount)}`
            ]);
        });

        wsRows.push([]);
        wsRows.push([
            "GRAND TOTAL",
            `Doctors: ${filteredSummary.total_doctors}`,
            `Patients: ${filteredSummary.total_patients}`,
            "", "", "",
            filteredSummary.total_reg_fees,
            filteredSummary.total_cons_fee,
            "", "",
            `Grand Total: ${filteredSummary.grand_total}`
        ]);

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsRows);
        XLSX.utils.book_append_sheet(wb, ws, "Doctor Wise OP Collection");
        XLSX.writeFile(wb, `Doctor_Wise_OP_Collection_${dateRange[0].format("YYYYMMDD")}_to_${dateRange[1].format("YYYYMMDD")}.xlsx`);
    };

    const handlePrintReport = () => {
        const printEl = document.getElementById("doctor-wise-op-print-area");
        if (!printEl) return;
        const win = window.open("", "_blank", "width=1200,height=850");
        if (!win) {
            window.print();
            return;
        }
        const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
        let bodyHtml = `
            <div class="print-hdr">
                <div class="hosp-name">SHANMUGA HOSPITAL LIMITED</div>
                <div class="hosp-addr">51/24, Saradha College Road, Salem - 636007</div>
                <div class="rep-title">DOCTOR WISE OP REGISTRATION DETAILED FROM ${esc(fromDisp)} TO ${esc(toDisp)}</div>
                <div class="rep-meta">Report Printed on ${esc(printedAt)}</div>
            </div>
        `;
        filteredDoctors.forEach((doc) => {
            bodyHtml += `<div class="doc-banner"><span>${doc.doctor_sl_no}. ${esc(doc.doctor_name)}</span><span>Patients: ${doc.patient_count} | Total: &#8377;${formatINR(doc.total_amount)}</span></div>`;
            bodyHtml += `<table><thead><tr><th>Slno</th><th>Patient Name</th><th>OP NUMBER</th><th class="num">Reg Fees</th><th class="num">Cons Fee</th><th class="center">Patient Age</th><th>Contact No</th><th>Company Name</th></tr></thead><tbody>`;
            (doc.rows || []).forEach((r) => {
                const sub = [r.gender, r.age].filter(Boolean).join(" / ");
                bodyHtml += `<tr><td>${r.sl_no}</td><td><b>${esc(r.patient_name)}</b>${sub ? `<br/><span class="sub">${esc(sub)}</span>` : ""}${r.address ? `<br/><span class="sub">${esc(r.address)}</span>` : ""}${r.contact_no ? `<br/><span class="sub">Ph: ${esc(r.contact_no)}</span>` : ""}</td><td>${esc(r.op_number)}</td><td class="num">${formatINR(r.reg_fees)}</td><td class="num">${formatINR(r.cons_fee)}</td><td class="center">${esc(r.age)}</td><td>${esc(r.contact_no)}</td><td>${esc(r.company_name)}</td></tr>`;
            });
            bodyHtml += `</tbody></table><div class="doc-total"><span>Total Patients : ${doc.patient_count}</span><span>Total Amount : Reg Fees &#8377;${formatINR(doc.reg_fees)} | Cons Fee &#8377;${formatINR(doc.cons_fee)} | Grand Total : &#8377;${formatINR(doc.total_amount)}</span></div>`;
        });
        bodyHtml += `<div class="gt-banner"><span>GRAND TOTAL (${filteredSummary.total_doctors} Doctors | ${filteredSummary.total_patients} Patients)</span><span>Reg Fees: &#8377;${formatINR(filteredSummary.total_reg_fees)} | Cons Fee: &#8377;${formatINR(filteredSummary.total_cons_fee)} | Grand Total: &#8377;${formatINR(filteredSummary.grand_total)}</span></div>`;

        win.document.write(`<!DOCTYPE html><html><head><title>Doctor Wise OP Collection</title><style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 0; font-size: 10px; }
            .print-hdr { border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 10px; }
            .hosp-name { font-size: 14px; font-weight: 800; }
            .hosp-addr { font-size: 10px; color: #334155; }
            .rep-title { font-size: 11px; font-weight: 700; margin-top: 2px; }
            .rep-meta { font-size: 9px; color: #475569; }
            .doc-banner { background: #dbeafe; border: 1px solid #64748b; padding: 5px 8px; font-weight: 800; font-size: 11px; display: flex; justify-content: space-between; margin-top: 10px; page-break-after: avoid; }
            table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
            thead { display: table-header-group; }
            tr { page-break-inside: avoid; }
            th, td { border: 1px solid #cbd5e1; padding: 3px 5px; font-size: 9.5px; vertical-align: top; }
            th { background: #f8fafc; font-weight: 700; text-align: left; }
            .sub { font-size: 8.5px; color: #475569; }
            .num { text-align: right; }
            .center { text-align: center; }
            .doc-total { background: #e0f2fe; border: 1px solid #0284c7; padding: 5px 8px; font-weight: 800; display: flex; justify-content: space-between; margin-bottom: 8px; }
            .gt-banner { background: #0f172a; color: #fff; padding: 8px 12px; font-weight: 800; display: flex; justify-content: space-between; margin-top: 10px; }
        </style></head><body>${bodyHtml}</body></html>`);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 300);
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div>
                            <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Stethoscope size={22} color="#14b8a6" />
                                Doctor Wise OP Collection (Doctor Wise OP Registration Detailed)
                            </h2>
                            <p>Doctor-wise OP registration and consultation detailed report with patient demographics, Reg/Cons fees, and Company</p>
                        </div>
                        <div className="action-buttons">
                            <Button icon={<RefreshCw size={15} />} onClick={() => fetchReport(true)}>Refresh</Button>
                            <Button icon={<Download size={15} />} onClick={handleExportExcel} disabled={!filteredDoctors.length}>Export Excel</Button>
                            <Button type="primary" icon={<Printer size={15} />} onClick={handlePrintReport} disabled={!filteredDoctors.length}>
                                Print Report
                            </Button>
                        </div>
                    </HeaderBar>

                    <FilterBar style={{ flexWrap: "wrap", gap: "10px", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => dates && setDateRange(dates)}
                                format="DD/MM/YYYY"
                                allowClear={false}
                            />
                            <Select
                                showSearch
                                optionFilterProp="children"
                                value={doctorFilter}
                                onChange={setDoctorFilter}
                                style={{ width: 250 }}
                                placeholder="Filter by Doctor"
                            >
                                <Option value="all">All Doctors ({doctorsOptions.length})</Option>
                                {doctorsOptions.map((d) => (
                                    <Option key={d.id} value={d.id}>{d.name}</Option>
                                ))}
                            </Select>
                            <Select value={outlet} onChange={setOutlet} style={{ width: 170 }}>
                                <Option value="all">All Outlets</Option>
                                {outletsList.map((o) => (
                                    <Option key={o.outlet_code || o.outlet_id} value={o.outlet_code || o.outlet_id}>
                                        {o.outlet_name || o.name}
                                    </Option>
                                ))}
                            </Select>
                            <Input
                                prefix={<Search size={14} color="#94a3b8" />}
                                placeholder="Search patient, OP no, phone, company..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                                style={{ width: 240 }}
                            />
                        </div>
                    </FilterBar>
                </ControlCard>
            )}

            <SectionContainer id="doctor-wise-op-print-area">
                <CustomPrintHeader>
                    <div className="hosp-name">SHANMUGA HOSPITAL LIMITED</div>
                    <div className="hosp-addr">51/24, Saradha College Road, Salem - 636007</div>
                    <div className="rep-title">DOCTOR WISE OP REGISTRATION DETAILED FROM {fromDisp} TO {toDisp}</div>
                    <div className="rep-meta">Report Printed on {printedAt}</div>
                </CustomPrintHeader>

                {loading ? (
                    <div style={{ padding: "50px", textAlign: "center" }}>
                        <Spin size="large" tip="Loading Doctor Wise OP Collection..." />
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontWeight: 600 }}>
                        No OP registration records found for the selected period / filters.
                    </div>
                ) : (
                    <>
                        {filteredDoctors.map((doc) => (
                            <DoctorBlock key={`${doc.doctor_id}-${doc.doctor_name}`}>
                                <DoctorBanner>
                                    <span>{doc.doctor_sl_no}. {doc.doctor_name}</span>
                                    <span className="doc-stats">
                                        Patients: {doc.patient_count} | Reg: ₹{formatINR(doc.reg_fees)} | Cons: ₹{formatINR(doc.cons_fee)} | Total: ₹{formatINR(doc.total_amount)}
                                    </span>
                                </DoctorBanner>

                                <StyledTable>
                                    <thead>
                                        <tr>
                                            <th style={{ width: 45 }}>Slno</th>
                                            <th>Patient Name</th>
                                            <th style={{ width: 115 }}>OP NUMBER</th>
                                            <th className="num" style={{ width: 90 }}>Reg Fees</th>
                                            <th className="num" style={{ width: 90 }}>Cons Fee</th>
                                            <th className="center" style={{ width: 90 }}>Patient Age</th>
                                            <th style={{ width: 105 }}>Contact No</th>
                                            <th style={{ width: 140 }}>Company Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(doc.rows || []).map((r) => (
                                            <tr key={`${doc.doctor_id}-${r.sl_no}-${r.bill_number}`}>
                                                <td>{r.sl_no}</td>
                                                <td>
                                                    <div className="pat-name">{r.patient_name}</div>
                                                    {(r.gender || r.age) && (
                                                        <div className="pat-sub">{[r.gender, r.age].filter(Boolean).join(" / ")}</div>
                                                    )}
                                                    {r.address && <div className="pat-sub">{r.address}</div>}
                                                    {r.contact_no && <div className="pat-sub">Ph: {r.contact_no}</div>}
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{r.op_number}</td>
                                                <td className="num">{formatINR(r.reg_fees)}</td>
                                                <td className="num" style={{ fontWeight: 600 }}>{formatINR(r.cons_fee)}</td>
                                                <td className="center">{r.age}</td>
                                                <td>{r.contact_no}</td>
                                                <td>{r.company_name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </StyledTable>

                                <DoctorTotalRow>
                                    <span>Total Patients : {doc.patient_count}</span>
                                    <span>
                                        Total Amount : Reg Fees ₹{formatINR(doc.reg_fees)} | Cons Fee ₹{formatINR(doc.cons_fee)} | Grand Total : ₹{formatINR(doc.total_amount)}
                                    </span>
                                </DoctorTotalRow>
                            </DoctorBlock>
                        ))}

                        <GrandTotalBanner>
                            <span>GRAND TOTAL ({filteredSummary.total_doctors} Doctors | {filteredSummary.total_patients} Patients)</span>
                            <span>
                                Reg Fees: ₹{formatINR(filteredSummary.total_reg_fees)} &nbsp;|&nbsp; Cons Fee: ₹{formatINR(filteredSummary.total_cons_fee)} &nbsp;|&nbsp;
                                <span style={{ color: "#38bdf8", fontSize: "1.02rem" }}>
                                    Grand Total: ₹{formatINR(filteredSummary.grand_total)}
                                </span>
                            </span>
                        </GrandTotalBanner>
                        <ReportPrintFooter />
                    </>
                )}
            </SectionContainer>
        </ReportPageWrapper>
    );
};

export default MasterDoctorWiseOPCollection;
