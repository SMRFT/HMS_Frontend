import React, { useState, useEffect, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { DatePicker, Spin } from "antd";
import { FaPrint, FaSearch, FaFileExcel, FaSyncAlt } from "react-icons/fa";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { printAccountsReport } from "../Accounts/printAccountsReport";
import {
    PageWrapper,
    colors,
    fadeIn,
    FormRow,
    InputWrapper,
    Label,
    Select,
    Button,
    TableWrapper,
    Table,
    Th,
    Td,
    Tr,
    SectionTitle,
} from "../GlobalStyles";

/* ─── Styled Components ─────────────────────────────────────────────────── */

const SummaryCard = styled.div`
    background: ${colors.surface || "#fff"};
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    border-left: 4px solid ${props => props.color || colors.primary || "#0284c7"};
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 80px;
    animation: ${fadeIn} 0.4s ease-out;
`;

const FilterSection = styled.div`
    background: ${colors.surface || "#fff"};
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const PrintTemplate = styled.div`
    display: none;
    @media print {
        display: block !important;
        background: white;
        width: 100%;
        color: black;
        font-family: 'Courier New', Courier, monospace;
    }
`;

const PrintHeader = styled.div`
    text-align: center;
    padding-bottom: 4px;
    margin-bottom: 6px;
    h1 { margin: 0; font-size: 16px; text-transform: uppercase; font-weight: bold; }
    p  { margin: 1px 0; font-size: 11px; }
    .report-title { font-size: 12px; font-weight: bold; margin-top: 6px; text-transform: uppercase; }
`;

const PrintMetaTable = styled.table`
    width: 100%;
    margin-bottom: 6px;
    border-collapse: collapse;
    font-size: 10px;
    td { padding: 2px 0; border: none !important; }
`;

const PrintTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0;
    font-size: 10px;
    th, td {
        border-top: 1px dashed #999;
        border-bottom: 1px dashed #999;
        padding: 4px 5px;
        text-align: left;
    }
    th {
        border-top: 1px solid #000 !important;
        border-bottom: 1px solid #000 !important;
        font-weight: bold;
        text-transform: uppercase;
    }
    .date-group-header td {
        border-top: none;
        border-bottom: 1px dashed #666;
        font-size: 11px;
        font-weight: bold;
    }
    .subtotal-row td {
        border-top: 1px dashed #000 !important;
        border-bottom: 1px dashed #000 !important;
    }
    .grand-total-row td {
        border-top: 1px solid #000 !important;
        border-bottom: 1px solid #000 !important;
    }
`;

/* ─── Component ─────────────────────────────────────────────────────────── */

const MasterAdvanceRegistration = ({ isModalView = false, startDate, endDate, outlet: propOutlet, initialOutlet }) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const effectiveOutlet = propOutlet || initialOutlet || "all";

    const [fromDate, setFromDate] = useState(startDate || dayjs().format("YYYY-MM-DD"));
    const [toDate, setToDate]     = useState(endDate   || dayjs().format("YYYY-MM-DD"));
    const [outlet, setOutlet]     = useState(effectiveOutlet);
    const [outletsList, setOutletsList] = useState([]);
    const [reportData, setReportData]   = useState([]);
    const [loading, setLoading]         = useState(false);

    /* sync props */
    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate)   setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        const o = propOutlet || initialOutlet;
        if (o !== undefined && o !== outlet) setOutlet(o);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propOutlet, initialOutlet]);

    /* fetch outlets list */
    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
                if (res?.success && Array.isArray(res?.data)) setOutletsList(res.data);
            } catch (e) {}
        };
        load();
    }, [HmsBaseUrl]);

    /* fetch report */
    const fetchReport = useCallback(async () => {
        if (!fromDate || !toDate) return;
        setLoading(true);
        try {
            const outletParam = outlet && outlet !== "all" ? `&outlet_code=${outlet}` : "";
            const url = `${HmsBaseUrl}master-accounts/advance-registration/?from_date=${fromDate}&to_date=${toDate}${outletParam}`;
            const response = await apiRequest(url, "GET");
            if (response && response.success) {
                const body = response.data || {};
                let rows = [];
                if (Array.isArray(body.data))       rows = body.data;
                else if (Array.isArray(body))        rows = body;
                else if (Array.isArray(response.data)) rows = response.data;
                setReportData(rows);
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error("Advance Registration Error:", error);
            toast.error("Failed to fetch advance registration report");
            setReportData([]);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, outlet, HmsBaseUrl]);

    useEffect(() => { fetchReport(); }, [fetchReport]);

    /* ── Group by date ─────────────────────────────────────────────────── */
    const groupedData = useMemo(() => {
        const groups = {};
        if (!Array.isArray(reportData)) return groups;
        reportData.forEach(item => {
            const rawDate = item.paid_date || item.date || item.created_date || item.admission_date;
            let dateKey = "Others";
            if (rawDate) {
                const parsed = dayjs(rawDate);
                dateKey = parsed.isValid() ? parsed.format("DD/MM/YYYY") : String(rawDate).slice(0, 10);
            }
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(item);
        });
        return groups;
    }, [reportData]);

    /* ── Grand totals ──────────────────────────────────────────────────── */
    const grandTotals = useMemo(() => {
        if (!Array.isArray(reportData)) return { cash: 0, credit: 0, total: 0 };
        return reportData.reduce((acc, row) => {
            const cash   = Number(row.cash_amount   ?? ((row.payment_mode || "").toLowerCase() === "cash" ? row.amount : 0) ?? 0);
            const credit = Number(row.credit_amount || row.credit_card_amount || row.bank_amount ||
                                  ((row.payment_mode || "").toLowerCase() !== "cash" ? row.amount : 0) || 0);
            const sc = isNaN(cash)   ? 0 : cash;
            const sk = isNaN(credit) ? 0 : credit;
            acc.cash   += sc;
            acc.credit += sk;
            acc.total  += sc + sk;
            return acc;
        }, { cash: 0, credit: 0, total: 0 });
    }, [reportData]);

    /* ── Helpers ───────────────────────────────────────────────────────── */
    const getCashCredit = (row) => {
        const cash   = Number(row.cash_amount   ?? ((row.payment_mode || "").toLowerCase() === "cash"  ? row.amount : 0) ?? 0);
        const credit = Number(row.credit_amount || row.credit_card_amount || row.bank_amount ||
                              ((row.payment_mode || "").toLowerCase() !== "cash" ? row.amount : 0) || 0);
        return { sc: isNaN(cash) ? 0 : cash, sk: isNaN(credit) ? 0 : credit };
    };

    /* ── Print ─────────────────────────────────────────────────────────── */
    const handlePrint = () => printAccountsReport("printable-advance-master-area", "portrait");

    /* ── Excel Export ──────────────────────────────────────────────────── */
    const handleExportExcel = () => {
        if (!reportData || reportData.length === 0) { toast.warning("No data to export"); return; }
        try {
            const exportRows = [];
            let gIdx = 1;
            Object.entries(groupedData).forEach(([dateStr, items]) => {
                let dayCash = 0, dayCredit = 0;
                items.forEach(row => {
                    const { sc, sk } = getCashCredit(row);
                    dayCash   += sc;
                    dayCredit += sk;
                    exportRows.push({
                        "Date":          dateStr,
                        "SLNO":          gIdx++,
                        "Bill Number":   row.billnumber || row.bill_no || row.billno || "",
                        "UHID":          row.uhid || row.mr_no || "",
                        "IP Number":     row.ipNumber || row.ip_number || row.ipno || "",
                        "Patient Name":  row.patientname || row.patient_name || "",
                        "Cash Amount":   sc  > 0 ? Number(sc.toFixed(2))  : 0,
                        "Credit Amount": sk  > 0 ? Number(sk.toFixed(2))  : 0,
                        "User":          row.user || row.created_by || row.cashier_name || row.cashier_id || "STAFF",
                    });
                });
                exportRows.push({
                    "Date": dateStr, "SLNO": "", "Bill Number": "", "UHID": "", "IP Number": "",
                    "Patient Name": "Total", "Cash Amount": Number(dayCash.toFixed(2)),
                    "Credit Amount": Number(dayCredit.toFixed(2)), "User": "",
                });
            });
            exportRows.push({
                "Date": "Grand Total", "SLNO": "", "Bill Number": "", "UHID": "", "IP Number": "",
                "Patient Name": "Grand Total", "Cash Amount": Number(grandTotals.cash.toFixed(2)),
                "Credit Amount": Number(grandTotals.credit.toFixed(2)), "User": "End",
            });
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportRows);
            ws["!cols"] = Object.keys(exportRows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 15) }));
            XLSX.utils.book_append_sheet(wb, ws, "Advance Register");
            XLSX.writeFile(wb, `Advance_Register_Master_${fromDate}_to_${toDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    /* running serial index for screen table */
    let runningIndex = 1;

    /* ── Render ─────────────────────────────────────────────────────────── */
    return (
        <PageWrapper style={isModalView ? { padding: 0 } : {}}>

            {/* ── Header & Filters ── */}
            {!isModalView && (
                <>
                    <SectionTitle className="no-print">
                        <h3>ADVANCE REGISTER (MASTER ACCOUNTS)</h3>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted || "#64748b" }}>
                            Daily IP advance register with Cash and Credit breakdown — outlet-wise
                        </p>
                    </SectionTitle>

                    <FilterSection className="no-print">
                        <FormRow>
                            <InputWrapper>
                                <Label>From Date</Label>
                                <DatePicker
                                    value={fromDate ? dayjs(fromDate) : null}
                                    onChange={d => setFromDate(d ? d.format("YYYY-MM-DD") : fromDate)}
                                    format="DD/MM/YYYY"
                                    allowClear={false}
                                    style={{ width: "100%", height: "40px", borderRadius: "8px" }}
                                />
                            </InputWrapper>

                            <InputWrapper>
                                <Label>To Date</Label>
                                <DatePicker
                                    value={toDate ? dayjs(toDate) : null}
                                    onChange={d => setToDate(d ? d.format("YYYY-MM-DD") : toDate)}
                                    format="DD/MM/YYYY"
                                    allowClear={false}
                                    style={{ width: "100%", height: "40px", borderRadius: "8px" }}
                                />
                            </InputWrapper>

                            <InputWrapper>
                                <Label>Outlet</Label>
                                <Select value={outlet} onChange={e => setOutlet(e.target.value)}>
                                    <option value="all">All Outlets</option>
                                    {outletsList.map((o, i) => (
                                        <option key={i} value={o.outlet_code}>
                                            {o.outlet_name || o.outlet_code}
                                        </option>
                                    ))}
                                </Select>
                            </InputWrapper>

                            <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                                <Button onClick={fetchReport} disabled={loading} style={{ height: "40px" }}>
                                    <FaSearch style={{ marginRight: "8px" }} />
                                    {loading ? "Searching..." : "Search"}
                                </Button>
                                <Button
                                    onClick={handleExportExcel}
                                    disabled={loading || reportData.length === 0}
                                    style={{ height: "40px", background: "#16a34a", borderColor: "#16a34a", color: "#fff" }}
                                >
                                    <FaFileExcel style={{ marginRight: "8px" }} /> Export Excel
                                </Button>
                                <Button onClick={handlePrint} secondary style={{ height: "40px" }}>
                                    <FaPrint style={{ marginRight: "8px" }} /> Print
                                </Button>
                                <Button onClick={fetchReport} disabled={loading} style={{ height: "40px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" }}>
                                    <FaSyncAlt style={{ marginRight: "8px" }} /> Refresh
                                </Button>
                            </div>
                        </FormRow>
                    </FilterSection>
                </>
            )}

            {/* ── KPI Summary Cards ── */}
            {!isModalView && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }} className="no-print">
                    <SummaryCard color={colors.success || "#10b981"}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: colors.textMuted || "#64748b", textTransform: "uppercase" }}>Total Cash Amount</span>
                        <h3 style={{ margin: 0, color: colors.success || "#10b981" }}>
                            ₹{grandTotals.cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </h3>
                    </SummaryCard>
                    <SummaryCard color={colors.primary || "#0284c7"}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: colors.textMuted || "#64748b", textTransform: "uppercase" }}>Total Credit / Card</span>
                        <h3 style={{ margin: 0, color: colors.primary || "#0284c7" }}>
                            ₹{grandTotals.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </h3>
                    </SummaryCard>
                    <SummaryCard color={colors.secondary || "#6366f1"}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: colors.textMuted || "#64748b", textTransform: "uppercase" }}>Grand Total Collections</span>
                        <h3 style={{ margin: 0, color: colors.secondary || "#6366f1" }}>
                            ₹{grandTotals.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </h3>
                    </SummaryCard>
                    <SummaryCard color="#f59e0b">
                        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: colors.textMuted || "#64748b", textTransform: "uppercase" }}>Total Receipts</span>
                        <h3 style={{ margin: 0, color: "#f59e0b" }}>{reportData.length}</h3>
                    </SummaryCard>
                </div>
            )}

            {/* ── Screen Table ── */}
            <TableWrapper>
                <Table>
                    <thead>
                        <Tr>
                            <Th style={{ width: "50px" }}>SLNO</Th>
                            <Th>BILL NUMBER</Th>
                            <Th>UHID</Th>
                            <Th>IP NUMBER</Th>
                            <Th>PATIENT NAME</Th>
                            <Th style={{ textAlign: "right" }}>CASH AMOUNT</Th>
                            <Th style={{ textAlign: "right" }}>CREDIT AMOUNT</Th>
                            <Th>USER</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan="8" style={{ textAlign: "center", padding: "40px", color: colors.textMuted || "#64748b" }}>
                                    <Spin size="large" /> &nbsp; Loading advance records...
                                </Td>
                            </Tr>
                        ) : Object.keys(groupedData).length > 0 ? (
                            Object.entries(groupedData).map(([dateStr, items], grpIdx) => {
                                let dayCash = 0, dayCredit = 0;
                                return (
                                    <React.Fragment key={dateStr || grpIdx}>
                                        {/* Date Banner */}
                                        <Tr style={{ background: "#f1f5f9", fontWeight: "bold" }}>
                                            <Td colSpan="8" style={{ color: "#0f172a", fontSize: "0.95rem", padding: "10px 14px" }}>
                                                📅 {dateStr}
                                            </Td>
                                        </Tr>
                                        {items.map((row, rowIdx) => {
                                            const { sc, sk } = getCashCredit(row);
                                            dayCash   += sc;
                                            dayCredit += sk;
                                            const sl = runningIndex++;
                                            return (
                                                <Tr key={`${row.billnumber || row.bill_no || "row"}-${grpIdx}-${rowIdx}`}>
                                                    <Td>{sl}</Td>
                                                    <Td style={{ fontWeight: 600 }}>{row.billnumber || row.bill_no || row.billno || "—"}</Td>
                                                    <Td>{row.uhid || row.mr_no || "—"}</Td>
                                                    <Td>{row.ipNumber || row.ip_number || row.ipno || "—"}</Td>
                                                    <Td style={{ fontWeight: 600 }}>{row.patientname || row.patient_name || "—"}</Td>
                                                    <Td style={{ textAlign: "right", color: sc > 0 ? (colors.success || "#10b981") : "inherit" }}>
                                                        {sc > 0 ? sc.toFixed(2) : "0.00"}
                                                    </Td>
                                                    <Td style={{ textAlign: "right", color: sk > 0 ? (colors.primary || "#0284c7") : "inherit" }}>
                                                        {sk > 0 ? sk.toFixed(2) : "0.00"}
                                                    </Td>
                                                    <Td style={{ textTransform: "uppercase", fontSize: "0.85rem" }}>
                                                        {row.user || row.created_by || row.cashier_name || row.cashier_id || "STAFF"}
                                                    </Td>
                                                </Tr>
                                            );
                                        })}
                                        {/* Date Subtotal */}
                                        <Tr style={{ background: "#e2e8f0", fontWeight: "bold" }}>
                                            <Td colSpan="5" style={{ textAlign: "right" }}>Total ({items.length} receipts)</Td>
                                            <Td style={{ textAlign: "right" }}>{dayCash.toFixed(2)}</Td>
                                            <Td style={{ textAlign: "right" }}>{dayCredit.toFixed(2)}</Td>
                                            <Td></Td>
                                        </Tr>
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <Tr>
                                <Td colSpan="8" style={{ textAlign: "center", padding: "40px", color: colors.textMuted || "#64748b" }}>
                                    No advance records found for the selected dates.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && !loading && (
                        <tfoot>
                            <Tr style={{ background: "#cbd5e1", fontWeight: 900, fontSize: "1rem" }}>
                                <Td colSpan="5" style={{ textAlign: "right" }}>Grand Total ({reportData.length} receipts)</Td>
                                <Td style={{ textAlign: "right" }}>{grandTotals.cash.toFixed(2)}</Td>
                                <Td style={{ textAlign: "right" }}>{grandTotals.credit.toFixed(2)}</Td>
                                <Td>End</Td>
                            </Tr>
                        </tfoot>
                    )}
                </Table>
            </TableWrapper>

            {/* ── Print Template ── */}
            <PrintTemplate id="printable-advance-master-area">
                <PrintHeader>
                    <h1>{localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED"}</h1>
                    <p>{localStorage.getItem("hospital_address") || "53, TRICHY MAIN ROAD, SEELANAIKENPATTY, SALEM - 636 201"}</p>
                    <p>{localStorage.getItem("hospital_phone") || "0427-2706666"}</p>
                    <div className="report-title">
                        ADVANCE REGISTER (ACCOUNTS) From {dayjs(fromDate).format("DD/MM/YYYY")} To {dayjs(toDate).format("DD/MM/YYYY")}
                        {outlet && outlet !== "all" ? ` — Outlet: ${outlet}` : ""}
                    </div>
                </PrintHeader>

                <PrintMetaTable>
                    <tbody>
                        <tr>
                            <td style={{ textAlign: "left" }}>
                                <strong>Printed On :</strong> {dayjs().format("DD/MM/YYYY HH:mm:ss")}
                            </td>
                            <td style={{ textAlign: "right" }}>
                                <strong>Page No :</strong> - 1 -
                            </td>
                        </tr>
                    </tbody>
                </PrintMetaTable>

                <PrintTable>
                    <thead>
                        <tr>
                            <th style={{ width: "5%" }}>SLNO</th>
                            <th style={{ width: "15%" }}>BILL NUMBER</th>
                            <th style={{ width: "12%" }}>UHID</th>
                            <th style={{ width: "13%" }}>IP NUMBER</th>
                            <th style={{ width: "23%" }}>PATIENT NAME</th>
                            <th style={{ width: "11%", textAlign: "right" }}>CASH AMT</th>
                            <th style={{ width: "11%", textAlign: "right" }}>CREDIT AMT</th>
                            <th style={{ width: "10%" }}>USER</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            let printSl = 1;
                            return Object.entries(groupedData).map(([dateStr, items], grpIdx) => {
                                let dayCash = 0, dayCredit = 0;
                                return (
                                    <React.Fragment key={`print-${dateStr}-${grpIdx}`}>
                                        <tr className="date-group-header">
                                            <td colSpan="8">{dateStr}</td>
                                        </tr>
                                        {items.map((row, rowIdx) => {
                                            const { sc, sk } = getCashCredit(row);
                                            dayCash   += sc;
                                            dayCredit += sk;
                                            const curSl = printSl++;
                                            return (
                                                <tr key={`print-row-${curSl}-${rowIdx}`}>
                                                    <td>{curSl}</td>
                                                    <td>{row.billnumber || row.bill_no || row.billno || "—"}</td>
                                                    <td>{row.uhid || row.mr_no || "—"}</td>
                                                    <td>{row.ipNumber || row.ip_number || row.ipno || "—"}</td>
                                                    <td>{row.patientname || row.patient_name || "—"}</td>
                                                    <td style={{ textAlign: "right" }}>{sc > 0 ? sc.toFixed(2) : "0.00"}</td>
                                                    <td style={{ textAlign: "right" }}>{sk > 0 ? sk.toFixed(2) : "0.00"}</td>
                                                    <td style={{ textTransform: "uppercase" }}>
                                                        {row.user || row.created_by || row.cashier_name || row.cashier_id || "STAFF"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        <tr className="subtotal-row">
                                            <td colSpan="5" style={{ textAlign: "left", paddingLeft: "10px" }}>
                                                Total ({items.length} receipts)
                                            </td>
                                            <td style={{ textAlign: "right" }}>{dayCash.toFixed(2)}</td>
                                            <td style={{ textAlign: "right" }}>{dayCredit.toFixed(2)}</td>
                                            <td></td>
                                        </tr>
                                    </React.Fragment>
                                );
                            });
                        })()}

                        {reportData.length > 0 && (
                            <tr className="grand-total-row">
                                <td colSpan="5" style={{ textAlign: "left", paddingLeft: "10px" }}>
                                    Grand Total ({reportData.length} receipts)
                                </td>
                                <td style={{ textAlign: "right" }}>{grandTotals.cash.toFixed(2)}</td>
                                <td style={{ textAlign: "right" }}>{grandTotals.credit.toFixed(2)}</td>
                                <td>End</td>
                            </tr>
                        )}
                    </tbody>
                </PrintTable>

                <div style={{ textAlign: "center", marginTop: "12px", fontSize: "11px", fontWeight: "bold" }}>
                    — End of Report —
                </div>
            </PrintTemplate>

        </PageWrapper>
    );
};

export default MasterAdvanceRegistration;
