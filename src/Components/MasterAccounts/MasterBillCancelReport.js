import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { DatePicker, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw, XCircle } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import {
    formatINR,
    cleanNum,
    exportToExcel,
    printReportArea,
    extractReportData,
    getSafeArray,
    ReportPageWrapper,
    ControlCard,
    HeaderBar,
    FilterBar,
    KPIGrid,
    KPICard,
    DataTableWrapper,
    ReportPrintHeader,
    ReportPrintFooter
} from "./masterAccountsHelper";

const DateHeaderTr = styled.tr`
    background: #f1f5f9 !important;
    td {
        background: #f1f5f9 !important;
        font-weight: 800 !important;
        color: #0f172a !important;
        font-size: 0.90rem !important;
        letter-spacing: 0.03em;
        border-top: 2px solid #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
        padding: 5px 8px !important;
    }
`;

const SectionHeaderTr = styled.tr`
    background: #e2e8f0 !important;
    td {
        background: #e2e8f0 !important;
        font-weight: 700 !important;
        color: #1e293b !important;
        font-size: 0.85rem !important;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        border-top: 1px solid #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
        padding: 4px 8px !important;
    }
`;

const SubtotalTr = styled.tr`
    background: #f8fafc !important;
    font-weight: 700 !important;
    td {
        background: #f8fafc !important;
        border-top: 1px dashed #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
        font-size: 0.85rem !important;
        padding: 4px 8px !important;
    }
`;

const CancelTable = styled.table`
    width: 100%;
    border-collapse: collapse !important;
    table-layout: fixed;

    th {
        border: 1px solid #cbd5e1 !important;
        padding: 7px 5px !important;
        background: #f8fafc;
        font-size: 0.80rem !important;
        text-align: left;
        color: #1e293b;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    td {
        border: 1px solid #cbd5e1 !important;
        padding: 6px 8px !important;
        font-size: 0.84rem;
        vertical-align: middle;
        color: #0f172a;
    }

    td.wrap-text {
        white-space: normal !important;
        word-break: break-word !important;
        line-height: 1.3;
    }

    td.no-wrap {
        white-space: nowrap !important;
    }
`;

const { RangePicker } = DatePicker;

const MasterBillCancelReport = ({ isModalView = false, startDate, endDate }) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (startDate && endDate) {
            setDateRange([dayjs(startDate), dayjs(endDate)]);
        }
    }, [startDate, endDate]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/bill-cancellation/?from_date=${fDate}&to_date=${tDate}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Bill Cancel Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const records = getSafeArray(reportData?.data || reportData?.records);

    const filtered = useMemo(() => {
        let list = records;
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(r =>
                String(r.bill_no || "").toLowerCase().includes(q) ||
                String(r.patient_name || "").toLowerCase().includes(q) ||
                String(r.cancelled_by || "").toLowerCase().includes(q) ||
                String(r.reason || "").toLowerCase().includes(q) ||
                String(r.category || "").toLowerCase().includes(q) ||
                String(r.mr_no || "").toLowerCase().includes(q)
            );
        }
        return [...list].sort((a, b) => {
            const s1 = String(a.bill_no || "").trim();
            const s2 = String(b.bill_no || "").trim();
            return s1.localeCompare(s2, undefined, { numeric: true, sensitivity: 'base' });
        });
    }, [records, searchTerm]);

    const extractCancelDate = (dateVal) => {
        if (!dateVal) return "Unknown Date";
        const s = String(dateVal).trim();
        const firstPart = s.split(" ")[0];
        if (firstPart.includes("/")) {
            return firstPart;
        }
        if (firstPart.includes("-") && firstPart.length === 10) {
            const parts = firstPart.split("-");
            if (parts[0].length === 4) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return firstPart;
        }
        return firstPart || "Unknown Date";
    };

    const extractCancelTime = (dateVal) => {
        if (!dateVal) return "";
        const s = String(dateVal).trim();
        if (s.includes(" ")) {
            return s.split(" ").slice(1).join(" ");
        }
        return "";
    };

    const groupedData = useMemo(() => {
        if (!filtered || filtered.length === 0) return [];

        const dateMap = new Map();

        filtered.forEach(r => {
            const dateKey = extractCancelDate(r.date);
            const timeStr = extractCancelTime(r.date);
            const categoryKey = String(r.category || "General Cancellation").trim().toUpperCase();

            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, new Map());
            }
            const catMap = dateMap.get(dateKey);
            if (!catMap.has(categoryKey)) {
                catMap.set(categoryKey, []);
            }
            catMap.get(categoryKey).push({
                ...r,
                dateKey,
                timeStr
            });
        });

        const result = [];
        let runningSlno = 1;

        dateMap.forEach((catMap, dateKey) => {
            const sections = [];
            let dateTotalAmt = 0;
            let dateCount = 0;

            catMap.forEach((items, category) => {
                let secTotalAmt = 0;

                // Sort items in ascending bill number order
                const sortedItems = [...items].sort((a, b) => {
                    const s1 = String(a.bill_no || "").trim();
                    const s2 = String(b.bill_no || "").trim();
                    return s1.localeCompare(s2, undefined, { numeric: true, sensitivity: 'base' });
                });

                const enrichedItems = sortedItems.map(it => {
                    const amt = cleanNum(it.amount);
                    secTotalAmt += amt;
                    return {
                        ...it,
                        displaySlno: runningSlno++,
                        amt
                    };
                });

                sections.push({
                    category,
                    items: enrichedItems,
                    totalAmt: secTotalAmt,
                    count: enrichedItems.length
                });

                dateTotalAmt += secTotalAmt;
                dateCount += enrichedItems.length;
            });

            result.push({
                date: dateKey,
                sections,
                dateTotalAmt,
                dateCount
            });
        });

        return result;
    }, [filtered]);

    const totalCancelled = filtered.reduce((a, x) => a + cleanNum(x.amount), 0);

    const handleExport = () => {
        if (!groupedData || groupedData.length === 0) return;

        const excelRows = [];
        groupedData.forEach(dg => {
            excelRows.push({
                "SLNO": `Cancelled Date: ${dg.date}`,
                "Bill No": "",
                "Time": "",
                "Category": "",
                "UHID": "",
                "Patient Name": "",
                "Cancelled By": "",
                "Cancellation Reason": "",
                "Cancelled Amount (₹)": ""
            });

            dg.sections.forEach(sec => {
                excelRows.push({
                    "SLNO": sec.category,
                    "Bill No": "",
                    "Time": "",
                    "Category": "",
                    "UHID": "",
                    "Patient Name": "",
                    "Cancelled By": "",
                    "Cancellation Reason": "",
                    "Cancelled Amount (₹)": ""
                });

                sec.items.forEach(it => {
                    excelRows.push({
                        "SLNO": it.displaySlno,
                        "Bill No": it.bill_no,
                        "Time": it.timeStr || "",
                        "Category": sec.category,
                        "UHID": it.mr_no || "-",
                        "Patient Name": it.patient_name || "General",
                        "Cancelled By": it.cancelled_by || "Supervisor",
                        "Cancellation Reason": it.reason || "Patient request",
                        "Cancelled Amount (₹)": it.amt
                    });
                });

                excelRows.push({
                    "SLNO": "",
                    "Bill No": "",
                    "Time": "",
                    "Category": "",
                    "UHID": "",
                    "Patient Name": "",
                    "Cancelled By": "",
                    "Cancellation Reason": `Total (${sec.category}) ->`,
                    "Cancelled Amount (₹)": sec.totalAmt
                });
            });

            if (dg.sections.length > 1) {
                excelRows.push({
                    "SLNO": "",
                    "Bill No": "",
                    "Time": "",
                    "Category": "",
                    "UHID": "",
                    "Patient Name": "",
                    "Cancelled By": "",
                    "Cancellation Reason": `Date Total (${dg.date}) ->`,
                    "Cancelled Amount (₹)": dg.dateTotalAmt
                });
            }
        });

        excelRows.push({
            "SLNO": "",
            "Bill No": "",
            "Time": "",
            "Category": "",
            "UHID": "",
            "Patient Name": "",
            "Cancelled By": "",
            "Cancellation Reason": `GRAND TOTAL ->`,
            "Cancelled Amount (₹)": totalCancelled
        });

        exportToExcel(excelRows, "Master_Bill_Cancellation_Register", "CancelledBills");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Bill Cancellation Register
                            <span className="badge">Audit Trail</span>
                        </h1>
                        <p>Detailed log of cancelled receipts, revoked invoices, and refund authorizations with audit notes</p>
                    </div>
                    <div className="btn-group no-print">
                        <Button icon={<Download size={15} />} onClick={handleExport}>
                            Excel Export
                        </Button>
                        <Button type="primary" icon={<Printer size={15} />} onClick={() => printReportArea("printable-report-area", "landscape")}>
                            Print Report
                        </Button>
                    </div>
                </HeaderBar>

                {!isModalView && (
                    <FilterBar className="no-print">
                        <div className="filter-item">
                            <label>Date Range:</label>
                            <RangePicker
                                value={dateRange}
                                onChange={(val) => val && setDateRange(val)}
                                format="YYYY-MM-DD"
                            />
                        </div>
                        <div className="filter-item">
                            <Input
                                placeholder="Search bill / patient / reason..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 250 }}
                            />
                        </div>
                        <Button icon={<RefreshCw size={14} />} onClick={fetchReport} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                )}
            </ControlCard>
            )}

            {loading ? (
                <div style={{ padding: "60px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-report-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title="BillCancelReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Detailed log of cancelled receipts, revoked invoices, and refund authorizations with audit notes"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#ef4444">
                            <span className="kpi-title">Total Cancelled Value</span>
                            <span className="kpi-value" style={{ color: "#dc2626" }}>₹{formatINR(totalCancelled)}</span>
                            <span className="kpi-subtitle">Reversed revenue</span>
                        </KPICard>
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Cancelled Bills Count</span>
                            <span className="kpi-value">{filtered.length}</span>
                            <span className="kpi-subtitle">Audit records</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <CancelTable className="cancel-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "4%", textAlign: "center" }}>SLNO</th>
                                    <th style={{ width: "15%" }}>Bill No</th>
                                    <th style={{ width: "9%", textAlign: "center" }}>Time</th>
                                    <th style={{ width: "11%" }}>UHID</th>
                                    <th style={{ width: "20%" }}>Patient Name</th>
                                    <th style={{ width: "12%" }}>Cancelled By</th>
                                    <th style={{ width: "17%" }}>Reason / Authorization</th>
                                    <th style={{ width: "12%" }} className="text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                            No cancelled bills or reversed transactions found for the selected criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    groupedData.map(dg => (
                                        <React.Fragment key={dg.date}>
                                            {/* Cancelled Date Header Row */}
                                            <DateHeaderTr className="DateGroup date-group">
                                                <td colSpan={8}>
                                                    Cancelled Date : {dg.date}
                                                </td>
                                            </DateHeaderTr>

                                            {/* Category Sub-Headings */}
                                            {dg.sections.map(sec => (
                                                <React.Fragment key={`${dg.date}-${sec.category}`}>
                                                    <SectionHeaderTr className="SectionHeader section-header">
                                                        <td colSpan={8}>
                                                            {sec.category}
                                                        </td>
                                                    </SectionHeaderTr>

                                                    {/* Items within Category */}
                                                    {sec.items.map(it => (
                                                        <tr key={it.bill_no + "-" + it.displaySlno}>
                                                            <td className="text-center" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                                                {it.displaySlno}
                                                            </td>
                                                            <td className="font-mono no-wrap" style={{ fontSize: "0.88rem", fontWeight: 700 }}>
                                                                <strong>{it.bill_no}</strong>
                                                            </td>
                                                            <td className="text-center no-wrap" style={{ fontSize: "0.80rem", color: "#334155" }}>
                                                                {it.timeStr || "—"}
                                                            </td>
                                                            <td className="font-mono no-wrap" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                                                                {it.mr_no || "-"}
                                                            </td>
                                                            <td className="wrap-text">
                                                                <strong style={{ fontSize: "0.88rem", color: "#0f172a" }}>
                                                                    {it.patient_name || "General"}
                                                                </strong>
                                                            </td>
                                                            <td className="wrap-text" style={{ fontSize: "0.83rem", color: "#334155", fontWeight: 600 }}>
                                                                {it.cancelled_by || "Supervisor"}
                                                            </td>
                                                            <td className="wrap-text" style={{ fontSize: "0.83rem", color: "#475569" }}>
                                                                {it.reason || "Patient request"}
                                                            </td>
                                                            <td className="text-right font-mono font-bold no-wrap" style={{ color: "#dc2626", fontSize: "0.94rem" }}>
                                                                {formatINR(it.amt)}
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {/* Category Subtotal */}
                                                    <SubtotalTr className="SubtotalRow subtotal-row">
                                                        <td colSpan={7} className="text-right font-bold" style={{ color: "#475569" }}>
                                                            Total ({sec.category}) ->
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: "#dc2626", fontSize: "0.94rem" }}>
                                                            ₹{formatINR(sec.totalAmt)}
                                                        </td>
                                                    </SubtotalTr>
                                                </React.Fragment>
                                            ))}

                                            {/* Date Subtotal if multiple categories */}
                                            {dg.sections.length > 1 && (
                                                <SubtotalTr style={{ background: "#e2e8f0 !important", fontWeight: 800 }}>
                                                    <td colSpan={7} className="text-right font-bold" style={{ color: "#1e293b" }}>
                                                        Date Total ({dg.date}) ->
                                                    </td>
                                                    <td className="text-right font-mono font-bold" style={{ color: "#dc2626", fontSize: "0.96rem" }}>
                                                        ₹{formatINR(dg.dateTotalAmt)}
                                                    </td>
                                                </SubtotalTr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}

                                {/* Grand Total Row */}
                                <tr className="total-row" style={{ background: "#0f172a", color: "#ffffff" }}>
                                    <td colSpan={7} style={{ color: "#ffffff", padding: "10px" }}>
                                        <strong>GRAND TOTAL CANCELLED BILLS ({filtered.length} RECORDS)</strong>
                                    </td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#fca5a5", fontSize: "1.05rem", padding: "10px" }}>
                                        ₹{formatINR(totalCancelled)}
                                    </td>
                                </tr>
                            </tbody>
                        </CancelTable>
                    </DataTableWrapper>

                    <ReportPrintFooter />
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterBillCancelReport;
