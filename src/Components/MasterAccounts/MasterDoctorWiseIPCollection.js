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

const CategoryBlock = styled.div`
    margin-bottom: 6px;
`;

const CategoryBanner = styled.div`
    background: #e2e8f0;
    color: #1e293b;
    padding: 5px 12px;
    font-weight: 800;
    font-size: 0.82rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #cbd5e1;
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
        padding: 5px 8px;
        border-bottom: 1px solid #e2e8f0;
        color: #1e293b;
        vertical-align: middle;
    }

    tbody tr:nth-child(even) { background: #f8fafc; }
    tbody tr:hover { background: #eff6ff; }

    .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .center { text-align: center; }

    tfoot td {
        background: #f1f5f9;
        font-weight: 800;
        padding: 6px 8px;
        border-top: 1.5px solid #64748b;
        border-bottom: 1.5px solid #94a3b8;
        color: #0f172a;
    }
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

const CashBadge = styled.span`
    display: inline-block;
    padding: 1px 7px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 0.72rem;
    background: ${(p) => (p.$val === "Y" ? "#dcfce7" : p.$val === "M" ? "#fef9c3" : "#fee2e2")};
    color: ${(p) => (p.$val === "Y" ? "#166534" : p.$val === "M" ? "#854d0e" : "#991b1b")};
`;

const MasterDoctorWiseIPCollection = ({
    isModalView = false,
    startDate,
    endDate,
    outlet: propOutlet,
    initialOutlet = "all",
    doctor: propDoctor,
    category: propCategory,
    onLoadOptions,
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs(),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(propOutlet || initialOutlet || "all");
    const [doctorFilter, setDoctorFilter] = useState(propDoctor || "all");
    const [headFilter, setHeadFilter] = useState(
        propCategory && String(propCategory).toLowerCase() !== "all" ? propCategory : "all"
    );
    const [cashBillFilter, setCashBillFilter] = useState("all");
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

    useEffect(() => {
        if (propCategory !== undefined) {
            const normCat = String(propCategory).toLowerCase() === "all" ? "all" : propCategory;
            if (normCat !== headFilter) {
                setHeadFilter(normCat);
            }
        }
    }, [propCategory, headFilter]);

    const fetchReport = useCallback(async (isRefresh = false) => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/doctor-wise-ip-collection/?from_date=${fDate}&to_date=${tDate}&outlet_code=${encodeURIComponent(outlet)}&doctor_id=${encodeURIComponent(doctorFilter)}&head=${encodeURIComponent(headFilter)}&cash_bill=${encodeURIComponent(cashBillFilter)}${isRefresh ? "&refresh=true" : ""}`;
            const res = await cachedApiRequest(url, "GET", null, { forceRefresh: isRefresh });
            if (res?.success) {
                setReportData(extractReportData(res));
            } else {
                setReportData(null);
            }
        } catch (err) {
            console.error("Doctor Wise IP Collection Error:", err);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    }, [dateRange, outlet, doctorFilter, headFilter, cashBillFilter, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const doctors = useMemo(() => reportData?.doctors || [], [reportData]);
    const doctorsOptions = useMemo(() => reportData?.doctors_options || [], [reportData]);
    const headsOptions = useMemo(() => reportData?.heads_options || [], [reportData]);
    const dateRangeMeta = reportData?.date_range || {};

    useEffect(() => {
        if (onLoadOptions && reportData) {
            onLoadOptions({
                categories: headsOptions,
                doctors: doctorsOptions.map((d) => ({ doctor_id: d, doctor_name: d })),
            });
        }
    }, [onLoadOptions, reportData, headsOptions, doctorsOptions]);

    const filteredDoctors = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        if (!q) return doctors;
        return doctors
            .map((doc) => {
                const docMatch = (doc.doctor_name || "").toLowerCase().includes(q);
                if (docMatch) return doc;
                const matchedHeads = (doc.heads || [])
                    .map((hd) => {
                        const hdMatch = (hd.head_name || "").toLowerCase().includes(q);
                        if (hdMatch) return hd;
                        const rows = (hd.rows || []).filter(
                            (r) =>
                                (r.patient_name || "").toLowerCase().includes(q) ||
                                (r.bill_number || "").toLowerCase().includes(q) ||
                                (r.ip_number || "").toLowerCase().includes(q) ||
                                (r.op_number || "").toLowerCase().includes(q)
                        );
                        if (!rows.length) return null;
                        const tot = rows.reduce((s, r) => s + cleanNum(r.amount), 0);
                        return { ...hd, rows, bill_count: rows.length, total_amount: tot };
                    })
                    .filter(Boolean);
                if (!matchedHeads.length) return null;
                const tot = matchedHeads.reduce((s, h) => s + cleanNum(h.total_amount), 0);
                const cnt = matchedHeads.reduce((s, h) => s + h.bill_count, 0);
                return { ...doc, heads: matchedHeads, bill_count: cnt, total_amount: tot };
            })
            .filter(Boolean);
    }, [doctors, searchText]);

    const filteredSummary = useMemo(() => {
        let recs = 0, amt = 0;
        filteredDoctors.forEach((d) => {
            recs += d.bill_count || 0;
            amt += cleanNum(d.total_amount);
        });
        return { total_doctors: filteredDoctors.length, total_records: recs, grand_total: amt };
    }, [filteredDoctors]);

    const fromDisp = dateRangeMeta.from_display || dateRange[0].format("DD/MM/YYYY");
    const toDisp = dateRangeMeta.to_display || dateRange[1].format("DD/MM/YYYY");
    const printedAt = reportData?.printed_at || dayjs().format("DD/MM/YYYY at HH:mm:ss");

    const handleExportExcel = () => {
        const wsRows = [
            ["SHANMUGA HOSPITAL LIMITED"],
            ["51/24, Saradha College Road, Salem - 636007"],
            [`DOCTOR WISE IP COLLECTION FROM ${fromDisp} TO ${toDisp}`],
            [],
            ["DOCTOR", "PARTICULAR HEAD", "SLNO", "BILLDATE", "BILLNUMBER", "IPNUMBER", "OPNUMBER", "PATIENTNAME", "Amount", "Cash bill"]
        ];

        filteredDoctors.forEach((doc) => {
            (doc.heads || []).forEach((hd) => {
                (hd.rows || []).forEach((r) => {
                    wsRows.push([
                        doc.doctor_name,
                        hd.head_name,
                        r.sl_no,
                        r.bill_date,
                        r.bill_number,
                        r.ip_number,
                        r.op_number,
                        r.patient_name,
                        cleanNum(r.amount),
                        r.cash_bill,
                    ]);
                });
                wsRows.push(["", `TOTAL (${hd.head_name})`, "", "", "", "", "", "", cleanNum(hd.total_amount), ""]);
            });
            wsRows.push([`DOCTOR TOTAL (${doc.doctor_name})`, "", "", "", "", "", "", "", cleanNum(doc.total_amount), ""]);
        });

        wsRows.push([]);
        wsRows.push(["GRAND TOTAL", `Doctors: ${filteredSummary.total_doctors}`, `Records: ${filteredSummary.total_records}`, "", "", "", "", "", filteredSummary.grand_total, ""]);

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsRows);
        XLSX.utils.book_append_sheet(wb, ws, "Doctor Wise IP Collection");
        XLSX.writeFile(wb, `Doctor_Wise_IP_Collection_${dateRange[0].format("YYYYMMDD")}_to_${dateRange[1].format("YYYYMMDD")}.xlsx`);
    };

    const handlePrintReport = () => {
        const printEl = document.getElementById("doctor-wise-ip-print-area");
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
                <div class="rep-title">DOCTOR WISE IP COLLECTION FROM ${esc(fromDisp)} TO ${esc(toDisp)}</div>
                <div class="rep-meta">Report Printed on ${esc(printedAt)}</div>
            </div>
        `;
        filteredDoctors.forEach((doc) => {
            bodyHtml += `<div class="doc-banner"><span>${doc.doctor_sl_no}. ${esc(doc.doctor_name)}</span><span>Items: ${doc.bill_count} | Total: &#8377;${formatINR(doc.total_amount)}</span></div>`;
            (doc.heads || []).forEach((hd) => {
                bodyHtml += `<div class="cat-banner"><span>${esc(hd.head_name)}</span><span>Count: ${hd.bill_count}</span></div>`;
                bodyHtml += `<table><thead><tr><th>SLNO</th><th>BILLDATE</th><th>BILLNUMBER</th><th>IPNUMBER</th><th>OPNUMBER</th><th>PATIENTNAME</th><th class="num">Amount</th><th class="center">Cash bill</th></tr></thead><tbody>`;
                (hd.rows || []).forEach((r) => {
                    bodyHtml += `<tr><td>${r.sl_no}</td><td>${esc(r.bill_date)}</td><td>${esc(r.bill_number)}</td><td>${esc(r.ip_number)}</td><td>${esc(r.op_number)}</td><td>${esc(r.patient_name)}</td><td class="num">${formatINR(r.amount)}</td><td class="center">${esc(r.cash_bill)}</td></tr>`;
                });
                bodyHtml += `<tr class="sub-row"><td colspan="6" class="num">TOTAL (${esc(hd.head_name)}) :</td><td class="num">${formatINR(hd.total_amount)}</td><td></td></tr></tbody></table>`;
            });
            bodyHtml += `<div class="doc-total">DOCTOR TOTAL (${esc(doc.doctor_name)}): &#8377;${formatINR(doc.total_amount)}</div>`;
        });
        bodyHtml += `<div class="gt-banner"><span>GRAND TOTAL (${filteredSummary.total_doctors} Doctors | ${filteredSummary.total_records} Records)</span><span>Total Collection: &#8377;${formatINR(filteredSummary.grand_total)}</span></div>`;

        win.document.write(`<!DOCTYPE html><html><head><title>Doctor Wise IP Collection</title><style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 0; font-size: 10px; }
            .print-hdr { border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 10px; }
            .hosp-name { font-size: 14px; font-weight: 800; }
            .hosp-addr { font-size: 10px; color: #334155; }
            .rep-title { font-size: 11px; font-weight: 700; margin-top: 2px; }
            .rep-meta { font-size: 9px; color: #475569; }
            .doc-banner { background: #dbeafe; border: 1px solid #64748b; padding: 5px 8px; font-weight: 800; font-size: 11px; display: flex; justify-content: space-between; margin-top: 10px; page-break-after: avoid; }
            .cat-banner { background: #e2e8f0; padding: 4px 8px; font-weight: 700; font-size: 10px; display: flex; justify-content: space-between; border-left: 1px solid #94a3b8; border-right: 1px solid #94a3b8; page-break-after: avoid; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 4px; page-break-inside: auto; }
            thead { display: table-header-group; }
            tr { page-break-inside: avoid; }
            th, td { border: 1px solid #cbd5e1; padding: 3px 5px; font-size: 9.5px; }
            th { background: #f8fafc; font-weight: 700; text-align: left; }
            .num { text-align: right; }
            .center { text-align: center; }
            .sub-row td { background: #f1f5f9; font-weight: 700; }
            .doc-total { background: #e0f2fe; border: 1px solid #0284c7; padding: 5px 8px; font-weight: 800; text-align: right; margin-bottom: 8px; }
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
                                <Stethoscope size={22} color="#0ea5e9" />
                                Doctor Wise IP Collection
                            </h2>
                            <p>Doctor-wise IP discharge collection grouped by Particular Head with Bill Date, Bill/IP/OP Numbers, Amount, and Cash Bill flag</p>
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
                                style={{ width: 240 }}
                                placeholder="Filter by Doctor"
                            >
                                <Option value="all">All Doctors ({doctorsOptions.length})</Option>
                                {doctorsOptions.map((d) => (
                                    <Option key={d} value={d}>{d}</Option>
                                ))}
                            </Select>
                            <Select
                                showSearch
                                optionFilterProp="children"
                                value={headFilter}
                                onChange={setHeadFilter}
                                style={{ width: 220 }}
                                placeholder="Filter by Head"
                            >
                                <Option value="all">All Heads ({headsOptions.length})</Option>
                                {headsOptions.map((h) => (
                                    <Option key={h} value={h}>{h}</Option>
                                ))}
                            </Select>
                            <Select value={cashBillFilter} onChange={setCashBillFilter} style={{ width: 135 }}>
                                <Option value="all">Cash Bill: All</Option>
                                <Option value="Y">Y (Cash)</Option>
                                <Option value="N">N (Credit/Ins)</Option>
                                <Option value="M">M (Multiple)</Option>
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
                                placeholder="Search patient, IP, OP, bill..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                                style={{ width: 220 }}
                            />
                        </div>
                    </FilterBar>
                </ControlCard>
            )}

            <SectionContainer id="doctor-wise-ip-print-area">
                <CustomPrintHeader>
                    <div className="hosp-name">SHANMUGA HOSPITAL LIMITED</div>
                    <div className="hosp-addr">51/24, Saradha College Road, Salem - 636007</div>
                    <div className="rep-title">DOCTOR WISE IP COLLECTION FROM {fromDisp} TO {toDisp}</div>
                    <div className="rep-meta">Report Printed on {printedAt}</div>
                </CustomPrintHeader>

                {loading ? (
                    <div style={{ padding: "50px", textAlign: "center" }}>
                        <Spin size="large" tip="Loading Doctor Wise IP Collection..." />
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontWeight: 600 }}>
                        No IP collection records found for the selected period / filters.
                    </div>
                ) : (
                    <>
                        {filteredDoctors.map((doc) => (
                            <DoctorBlock key={doc.doctor_name}>
                                <DoctorBanner>
                                    <span>{doc.doctor_sl_no}. {doc.doctor_name}</span>
                                    <span className="doc-stats">
                                        Items: {doc.bill_count} | Total: ₹{formatINR(doc.total_amount)}
                                    </span>
                                </DoctorBanner>

                                {(doc.heads || []).map((hd) => (
                                    <CategoryBlock key={`${doc.doctor_name}-${hd.head_name}`}>
                                        <CategoryBanner>
                                            <span>{hd.head_sl_no}. {hd.head_name}</span>
                                            <span>{hd.bill_count} Item(s)</span>
                                        </CategoryBanner>
                                        <StyledTable>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: 45 }}>SLNO</th>
                                                    <th style={{ width: 90 }}>BILLDATE</th>
                                                    <th style={{ width: 145 }}>BILLNUMBER</th>
                                                    <th style={{ width: 110 }}>IPNUMBER</th>
                                                    <th style={{ width: 110 }}>OPNUMBER</th>
                                                    <th>PATIENTNAME</th>
                                                    <th className="num" style={{ width: 110 }}>Amount</th>
                                                    <th className="center" style={{ width: 80 }}>Cash bill</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(hd.rows || []).map((r) => (
                                                    <tr key={`${hd.head_name}-${r.sl_no}-${r.bill_number}`}>
                                                        <td>{r.sl_no}</td>
                                                        <td>{r.bill_date}</td>
                                                        <td style={{ fontWeight: 600 }}>{r.bill_number}</td>
                                                        <td>{r.ip_number}</td>
                                                        <td>{r.op_number}</td>
                                                        <td>{r.patient_name}</td>
                                                        <td className="num" style={{ fontWeight: 600 }}>{formatINR(r.amount)}</td>
                                                        <td className="center">
                                                            <CashBadge $val={r.cash_bill}>{r.cash_bill}</CashBadge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan={6} className="num">TOTAL ({hd.head_name}) :</td>
                                                    <td className="num">{formatINR(hd.total_amount)}</td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </StyledTable>
                                    </CategoryBlock>
                                ))}

                                <DoctorTotalRow>
                                    <span>DOCTOR TOTAL ({doc.doctor_name}):</span>
                                    <span>₹{formatINR(doc.total_amount)}</span>
                                </DoctorTotalRow>
                            </DoctorBlock>
                        ))}

                        <GrandTotalBanner>
                            <span>GRAND TOTAL ({filteredSummary.total_doctors} Doctors | {filteredSummary.total_records} Records)</span>
                            <span style={{ color: "#38bdf8", fontSize: "1.02rem" }}>
                                Total Collection: ₹{formatINR(filteredSummary.grand_total)}
                            </span>
                        </GrandTotalBanner>
                        <ReportPrintFooter />
                    </>
                )}
            </SectionContainer>
        </ReportPageWrapper>
    );
};

export default MasterDoctorWiseIPCollection;
