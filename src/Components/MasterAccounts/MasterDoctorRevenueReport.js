import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DatePicker, Select, Button, Spin, Input } from "antd";
import styled from "styled-components";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { Printer, Download, RefreshCw, Search, Stethoscope } from "lucide-react";
import {
    formatINR,
    cleanNum,
    printReportArea,
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

    .hosp-name {
        font-size: 1.15rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: 0.02em;
    }
    .hosp-addr {
        font-size: 0.82rem;
        color: #334155;
        margin-top: 2px;
    }
    .rep-title {
        font-size: 0.92rem;
        font-weight: 700;
        color: #0f172a;
        margin-top: 4px;
    }
    .rep-meta {
        font-size: 0.78rem;
        color: #475569;
        margin-top: 2px;
    }
`;

const DoctorBlock = styled.div`
    margin-bottom: 22px;
    border: 1px solid #94a3b8;
    border-radius: 6px;
    overflow: hidden;
    page-break-inside: avoid;
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

    .doc-title {
        display: flex;
        align-items: center;
        gap: 14px;
    }
    .doc-stats {
        font-size: 0.78rem;
        font-weight: 700;
        color: #0f172a;
        background: rgba(255, 255, 255, 0.55);
        padding: 2px 10px;
        border-radius: 4px;
    }
`;

const CategoryBanner = styled.div`
    background: #d9dce1;
    color: #1e293b;
    padding: 5px 12px;
    font-weight: 700;
    font-size: 0.82rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #94a3b8;
    border-bottom: 1px solid #94a3b8;

    .cat-title {
        display: flex;
        align-items: center;
        gap: 14px;
    }
`;

const StyledBillsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 0.75rem;
    background: #ffffff;

    thead th {
        background: #a93232;
        color: #ffffff;
        font-weight: 700;
        text-transform: uppercase;
        padding: 5px 8px;
        border: 1px solid #7f1d1d;
        white-space: nowrap;
        font-size: 0.72rem;
    }

    tbody td {
        padding: 4px 8px;
        border-bottom: 1px solid #e2e8f0;
        border-left: 1px solid #f1f5f9;
        border-right: 1px solid #f1f5f9;
        color: #1e293b;
        vertical-align: middle;
    }

    tbody tr:nth-child(even) {
        background: #f8fafc;
    }

    tbody tr:hover {
        background: #f1f5f9;
    }

    .num {
        text-align: right;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
    }

    .cat-total-row td {
        background: #f1f5f9 !important;
        font-weight: 800;
        color: #0f172a;
        border-top: 1.5px solid #64748b;
        border-bottom: 1.5px solid #64748b;
        padding: 5px 8px;
    }
`;

const DoctorFooter = styled.div`
    background: #e0f2fe;
    border-top: 1.5px solid #0284c7;
    padding: 6px 12px;
    display: flex;
    justify-content: flex-end;
    gap: 24px;
    font-size: 0.8rem;
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

const MasterDoctorRevenueReport = ({
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
    const [doctorId, setDoctorId] = useState(propDoctor || "all");
    const [category, setCategory] = useState(
        propCategory && String(propCategory).toLowerCase() !== "all" ? propCategory : "all"
    );
    const [searchText, setSearchText] = useState("");
    const [outletsList, setOutletsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const data = await fetchCachedOutlets(HmsBaseUrl);
                if (Array.isArray(data)) {
                    setOutletsList(data);
                }
            } catch (e) {}
        };
        fetchOutlets();
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
        if (propDoctor !== undefined && propDoctor !== doctorId) {
            setDoctorId(propDoctor || "all");
        }
    }, [propDoctor, doctorId]);

    useEffect(() => {
        if (propCategory !== undefined) {
            const normCat = String(propCategory).toLowerCase() === "all" ? "all" : propCategory;
            if (normCat !== category) {
                setCategory(normCat);
            }
        }
    }, [propCategory, category]);

    const fetchReport = useCallback(async (isRefresh = false) => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/doctor-revenue-report/?from_date=${fDate}&to_date=${tDate}&outlet_code=${encodeURIComponent(outlet)}&doctor_id=${encodeURIComponent(doctorId)}&category=${encodeURIComponent(category)}${isRefresh ? "&refresh=true" : ""}`;
            const res = await cachedApiRequest(url, "GET", null, { forceRefresh: isRefresh });
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Doctor Revenue Report Error:", err);
        } finally {
            setLoading(false);
        }
    }, [dateRange, outlet, doctorId, category, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const doctors = useMemo(() => reportData?.doctors || [], [reportData]);
    const doctorsOptions = useMemo(() => reportData?.doctors_options || [], [reportData]);
    const categoriesOptions = useMemo(() => reportData?.categories_options || [], [reportData]);
    const summary = reportData?.summary || {};
    const dateRangeMeta = reportData?.date_range || {};

    useEffect(() => {
        if (onLoadOptions && reportData) {
            onLoadOptions({
                categories: categoriesOptions,
                doctors: doctorsOptions,
            });
        }
    }, [onLoadOptions, reportData, categoriesOptions, doctorsOptions]);

    // Client-side quick search filtering across doctor, patient, bill number, UHID, payment mode
    const filteredDoctors = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        if (!q) return doctors;

        const result = [];
        doctors.forEach((doc) => {
            const docMatches = String(doc.doctor_name || "").toLowerCase().includes(q);
            const matchedCats = [];
            let dBill = 0, dPurch = 0, dTotal = 0, dCount = 0;

            (doc.categories || []).forEach((cat) => {
                const catMatches = docMatches || String(cat.category_name || "").toLowerCase().includes(q);
                const matchedRows = catMatches
                    ? cat.rows || []
                    : (cat.rows || []).filter((r) =>
                        `${r.bill_number} ${r.sh_bill_no} ${r.op_number} ${r.patient_name} ${r.payment_mode_company}`
                            .toLowerCase()
                            .includes(q)
                    );

                if (matchedRows.length > 0) {
                    const cBill = matchedRows.reduce((s, r) => s + cleanNum(r.bill_amount), 0);
                    const cPurch = matchedRows.reduce((s, r) => s + cleanNum(r.purchase_value), 0);
                    const cTotal = matchedRows.reduce((s, r) => s + cleanNum(r.total), 0);
                    dBill += cBill;
                    dPurch += cPurch;
                    dTotal += cTotal;
                    dCount += matchedRows.length;
                    matchedCats.push({
                        ...cat,
                        bill_amount: Number(cBill.toFixed(2)),
                        purchase_value: Number(cPurch.toFixed(2)),
                        total: Number(cTotal.toFixed(2)),
                        bill_count: matchedRows.length,
                        rows: matchedRows.map((r, idx) => ({ ...r, sl_no: idx + 1 })),
                    });
                }
            });

            if (matchedCats.length > 0) {
                result.push({
                    ...doc,
                    doctor_sl_no: result.length + 1,
                    bill_amount: Number(dBill.toFixed(2)),
                    purchase_value: Number(dPurch.toFixed(2)),
                    total: Number(dTotal.toFixed(2)),
                    bill_count: dCount,
                    categories: matchedCats.map((c, idx) => ({ ...c, cat_sl_no: idx + 1 })),
                });
            }
        });
        return result;
    }, [doctors, searchText]);

    const visibleSummary = useMemo(() => {
        if (!searchText.trim()) return summary;
        const totBills = filteredDoctors.reduce((s, d) => s + (d.bill_count || 0), 0);
        const totBillAmt = filteredDoctors.reduce((s, d) => s + cleanNum(d.bill_amount), 0);
        const totPurch = filteredDoctors.reduce((s, d) => s + cleanNum(d.purchase_value), 0);
        const totNet = filteredDoctors.reduce((s, d) => s + cleanNum(d.total), 0);
        return {
            total_doctors: filteredDoctors.length,
            total_bills: totBills,
            total_bill_amount: Number(totBillAmt.toFixed(2)),
            total_purchase_value: Number(totPurch.toFixed(2)),
            grand_total: Number(totNet.toFixed(2)),
        };
    }, [filteredDoctors, summary, searchText]);

    const handleExportExcel = () => {
        const flatRows = [];
        filteredDoctors.forEach((doc) => {
            (doc.categories || []).forEach((cat) => {
                (cat.rows || []).forEach((r) => {
                    flatRows.push({
                        "Doctor": doc.doctor_name,
                        "Category": cat.category_name,
                        "SLNO": r.sl_no,
                        "BILLDATE": r.bill_date,
                        "BILL NUMBER": r.bill_number,
                        "SH-BILL NO": r.sh_bill_no || "",
                        "OP NUMBER": r.op_number,
                        "PATIENT NAME": r.patient_name,
                        "BILL AMOUNT": Number(cleanNum(r.bill_amount).toFixed(2)),
                        "PURCHASE VALUE": Number(cleanNum(r.purchase_value).toFixed(2)),
                        "TOTAL": Number(cleanNum(r.total).toFixed(2)),
                        "PAYMENT MODE & COMPANY": r.payment_mode_company,
                    });
                });
            });
        });

        if (flatRows.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(flatRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Doctor Revenue");
        XLSX.writeFile(
            wb,
            `Doctor_Revenue_Report_${dateRange[0].format("DD-MM-YYYY")}_to_${dateRange[1].format("DD-MM-YYYY")}.xlsx`
        );
    };

    const fromDisp = dateRangeMeta.from_display || dateRange[0].format("DD/MM/YYYY");
    const toDisp = dateRangeMeta.to_display || dateRange[1].format("DD/MM/YYYY");
    const printedAt = reportData?.printed_at || dayjs().format("DD/MM/YYYY [at] HH:mm:ss");

        const handlePrintReport = () => {
            const el = document.getElementById("doctor-revenue-print-area");
            if (!el) return;
            const win = window.open("", "_blank", "width=1200,height=800");
            if (!win) return;
            const styles = Array.from(document.querySelectorAll("style"))
                .map((s) => s.outerHTML)
                .join("\n");
            win.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Doctor Revenue Report (${fromDisp} to ${toDisp})</title>
${styles}
<style>
  @page { size: A4 landscape; margin: 10mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { margin: 0; padding: 0; background: #fff; font-family: Arial, sans-serif; color: #0f172a; font-size: 11px; }
  .no-print { display: none !important; }
  .doc-banner, .cat-banner, .doc-footer, .grand-banner {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    gap: 12px !important;
    width: 100% !important;
  }
  .doc-banner { background: #eef2ff !important; border: 1px solid #c7d2fe !important; padding: 6px 10px !important; font-weight: 700 !important; margin-top: 10px !important; page-break-after: avoid; }
  .cat-banner { background: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 4px 10px !important; font-weight: 700 !important; margin-top: 6px !important; page-break-after: avoid; }
  .doc-footer { background: #f8fafc !important; border: 1px solid #94a3b8 !important; padding: 5px 10px !important; font-weight: 700 !important; margin-top: 4px !important; page-break-inside: avoid; }
  .grand-banner { background: #0f172a !important; color: #ffffff !important; padding: 8px 12px !important; font-weight: 800 !important; margin-top: 12px !important; page-break-inside: avoid; }
  table { width: 100% !important; border-collapse: collapse !important; font-size: 10px !important; }
  th, td { border: 1px solid #cbd5e1 !important; padding: 3px 5px !important; }
  thead th { background: #f1f5f9 !important; font-weight: 700 !important; }
  .num { text-align: right !important; font-family: monospace !important; }
  tr { page-break-inside: avoid; }
  .print-sig-row { display: flex !important; justify-content: space-between !important; margin-top: 28px !important; padding-top: 8px !important; page-break-inside: avoid; }
  .print-sig-box { width: 220px; text-align: center; border-top: 1px solid #334155; padding-top: 4px; font-weight: 700; font-size: 10px; }
</style>
</head>
<body>
  ${el.innerHTML}
  <div class="print-sig-row">
    <div class="print-sig-box">Prepared By</div>
    <div class="print-sig-box">Accounts Officer</div>
    <div class="print-sig-box">Authorized Signatory</div>
  </div>
</body>
</html>`);
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
                                    <Stethoscope size={22} color="#6366f1" />
                                    Doctor Revenue Report (Date Wise Bills Analysis Detailed)
                                </h2>
                                <p>Doctor-wise and bill-type itemized revenue analysis with purchase cost deduction and payment mode/company breakdown</p>
                            </div>
                            <div className="action-buttons">
                                <Button icon={<RefreshCw size={15} />} onClick={() => fetchReport(true)}>Refresh</Button>
                                <Button icon={<Download size={15} />} onClick={handleExportExcel}>Export Excel</Button>
                                <Button type="primary" icon={<Printer size={15} />} onClick={handlePrintReport}>
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
                                value={doctorId}
                                onChange={setDoctorId}
                                style={{ width: 250 }}
                                placeholder="Filter by Doctor"
                            >
                                <Option value="all">All Doctors ({doctorsOptions.length})</Option>
                                {doctorsOptions.map((d) => (
                                    <Option key={d.doctor_id} value={d.doctor_id}>
                                        {d.doctor_name}
                                    </Option>
                                ))}
                            </Select>
                            <Select
                                showSearch
                                optionFilterProp="children"
                                value={category}
                                onChange={setCategory}
                                style={{ width: 230 }}
                                placeholder="Filter by Category"
                            >
                                <Option value="all">All Categories ({categoriesOptions.length})</Option>
                                {categoriesOptions.map((c) => (
                                    <Option key={c} value={c}>{c}</Option>
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
                                placeholder="Search patient, UHID, bill no..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                                style={{ width: 230 }}
                            />
                        </div>
                    </FilterBar>
                </ControlCard>
            )}

            <SectionContainer id="doctor-revenue-print-area">
                <CustomPrintHeader>
                    <div className="hosp-name">SHANMUGA HOSPITAL LIMITED</div>
                    <div className="hosp-addr">51/24, Saradha College Road, Salem - 636007</div>
                    <div className="rep-title">DATE WISE BILLS ANALYSIS DETAILED FROM {fromDisp} TO {toDisp}</div>
                    <div className="rep-meta">Report Printed on {printedAt}</div>
                </CustomPrintHeader>

                {loading ? (
                    <div style={{ padding: "50px", textAlign: "center" }}>
                        <Spin size="large" tip="Loading Doctor Revenue Analysis..." />
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontWeight: 600 }}>
                        No doctor billing records found for {fromDisp} to {toDisp}.
                    </div>
                ) : (
                    <>
                        {filteredDoctors.map((doc) => (
                            <DoctorBlock key={`${doc.doctor_id}-${doc.doctor_sl_no}`}>
                                <DoctorBanner className="doc-banner">
                                    <div className="doc-title">
                                        <span>{doc.doctor_sl_no}</span>
                                        <span>{doc.doctor_name}</span>
                                    </div>
                                    <div className="doc-stats">
                                        Bills: {doc.bill_count} | Bill Amt: {cleanNum(doc.bill_amount).toFixed(2)} | Purchase: {cleanNum(doc.purchase_value).toFixed(2)} | Net Total: {cleanNum(doc.total).toFixed(2)}
                                    </div>
                                </DoctorBanner>

                                {(doc.categories || []).map((cat) => (
                                    <div key={`${doc.doctor_id}-${cat.category_name}-${cat.cat_sl_no}`}>
                                        <CategoryBanner className="cat-banner">
                                            <div className="cat-title">
                                                <span>{cat.cat_sl_no}</span>
                                                <span>{cat.category_name}</span>
                                            </div>
                                            <span style={{ fontSize: "0.75rem", color: "#475569" }}>
                                                {cat.bill_count} Bill{cat.bill_count === 1 ? "" : "s"}
                                            </span>
                                        </CategoryBanner>

                                        <div style={{ overflowX: "auto" }}>
                                            <StyledBillsTable>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "42px", textAlign: "center" }}>SLNO</th>
                                                        <th style={{ width: "86px" }}>BILLDATE</th>
                                                        <th style={{ width: "110px" }}>BILL NUMBER</th>
                                                        <th style={{ width: "130px" }}>SH-BILL NO</th>
                                                        <th style={{ width: "105px" }}>OP NUMBER</th>
                                                        <th>PATIENT NAME</th>
                                                        <th style={{ width: "95px", textAlign: "right" }}>BILL AMOUNT</th>
                                                        <th style={{ width: "105px", textAlign: "right" }}>PURCHASE VALUE</th>
                                                        <th style={{ width: "95px", textAlign: "right" }}>TOTAL</th>
                                                        <th>PAYMENT MODE &amp; COMPANY</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(cat.rows || []).map((r) => (
                                                        <tr key={`${r.bill_number}-${r.sl_no}`}>
                                                            <td style={{ textAlign: "center" }}>{r.sl_no}</td>
                                                            <td>{r.bill_date}</td>
                                                            <td style={{ fontWeight: 600 }}>{r.bill_number}</td>
                                                            <td>{r.sh_bill_no}</td>
                                                            <td>{r.op_number}</td>
                                                            <td style={{ fontWeight: 600 }}>{r.patient_name}</td>
                                                            <td className="num">{cleanNum(r.bill_amount).toFixed(2)}</td>
                                                            <td className="num">{cleanNum(r.purchase_value).toFixed(2)}</td>
                                                            <td className="num" style={{ fontWeight: 700 }}>{cleanNum(r.total).toFixed(2)}</td>
                                                            <td>{r.payment_mode_company}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="cat-total-row">
                                                        <td colSpan={6} style={{ textAlign: "right", paddingRight: "16px" }}>
                                                            TOTAL :
                                                        </td>
                                                        <td className="num">{cleanNum(cat.bill_amount).toFixed(2)}</td>
                                                        <td className="num">{cleanNum(cat.purchase_value).toFixed(2)}</td>
                                                        <td className="num">{cleanNum(cat.total).toFixed(2)}</td>
                                                        <td></td>
                                                    </tr>
                                                </tbody>
                                            </StyledBillsTable>
                                        </div>
                                    </div>
                                ))}

                                <DoctorFooter className="doc-footer">
                                    <span>DOCTOR TOTAL ({doc.doctor_name}):</span>
                                    <span>Bill Amt: {cleanNum(doc.bill_amount).toFixed(2)}</span>
                                    <span>Purchase: {cleanNum(doc.purchase_value).toFixed(2)}</span>
                                    <span>Net Total: {cleanNum(doc.total).toFixed(2)}</span>
                                </DoctorFooter>
                            </DoctorBlock>
                        ))}

                        <GrandTotalBanner className="grand-banner">
                            <span>GRAND TOTAL ({visibleSummary.total_doctors || 0} Doctors | {visibleSummary.total_bills || 0} Bills)</span>
                            <span>Bill Amount: {formatINR(visibleSummary.total_bill_amount)}</span>
                            <span>Purchase Value: {formatINR(visibleSummary.total_purchase_value)}</span>
                            <span style={{ color: "#34d399", fontSize: "1rem" }}>Net Revenue: {formatINR(visibleSummary.grand_total)}</span>
                        </GrandTotalBanner>
                    </>
                )}

                <div className="no-print">
                    <ReportPrintFooter />
                </div>
            </SectionContainer>
        </ReportPageWrapper>
    );
};

export default MasterDoctorRevenueReport;
