import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DatePicker, Select, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import styled from "styled-components";
import { Printer, Download, Search, RefreshCw, ClipboardList } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import {
    formatINR,
    cleanNum,
    exportToExcel,
    printReportArea,
    extractReportData,
    getSafeArray,
    fetchCachedOutlets,
    cachedApiRequest,
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

const { RangePicker } = DatePicker;
const { Option } = Select;

const CompactTableWrapper = styled(DataTableWrapper)`
    width: 100%;
    overflow-x: auto;
    table {
        table-layout: fixed;
        width: 100%;
        font-size: 0.86rem;
        border-collapse: collapse;
        border: 1.5px solid #334155 !important;
    }
    thead th {
        padding: 5px 6px !important;
        font-size: 0.82rem !important;
        white-space: normal !important;
        line-height: 1.2 !important;
        text-align: left;
        border: 1px solid #94a3b8 !important;
        background: #f1f5f9 !important;
        color: #0f172a !important;
        font-weight: 700 !important;
    }
    tbody td {
        padding: 3.5px 6px !important;
        font-size: 0.85rem !important;
        line-height: 1.25 !important;
        border: 1px solid #cbd5e1 !important;
        color: #0f172a;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .text-center {
        text-align: center !important;
    }
    .text-right {
        text-align: right !important;
    }
    .font-mono, td.text-right {
        font-family: "Consolas", "Courier New", monospace !important;
        font-size: 0.94rem !important;
        font-weight: 700 !important;
        font-variant-numeric: tabular-nums !important;
    }
`;

const DateHeaderTr = styled.tr`
    background: #f1f5f9 !important;
    td {
        font-weight: 700 !important;
        font-size: 0.86rem !important;
        color: #0f172a !important;
        padding: 5px 8px !important;
        background: #f1f5f9 !important;
        border: 1px solid #94a3b8 !important;
    }
`;

const ShiftHeaderTr = styled.tr`
    background: #e2e8f0 !important;
    td {
        font-weight: 800 !important;
        font-size: 0.84rem !important;
        color: #0f172a !important;
        padding: 4px 8px !important;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        background: #e2e8f0 !important;
        border: 1px solid #94a3b8 !important;
    }
`;

const SectionHeaderTr = styled.tr`
    background: #f8fafc !important;
    td {
        font-weight: 800 !important;
        font-size: 0.82rem !important;
        color: #1e293b !important;
        padding: 3.5px 12px !important;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
    }
`;

const SubtotalTr = styled.tr`
    background: #f8fafc !important;
    td {
        font-weight: 700 !important;
        font-size: 0.85rem !important;
        color: #0f172a !important;
        padding: 4px 6px !important;
        border: 1px solid #cbd5e1 !important;
        background: #f8fafc !important;
    }
`;

const ShiftTotalTr = styled.tr`
    background: #e2e8f0 !important;
    border-top: 1.5px solid #64748b !important;
    border-bottom: 1.5px solid #64748b !important;
    td {
        font-weight: 800 !important;
        font-size: 0.88rem !important;
        color: #0f172a !important;
        padding: 5px 6px !important;
        border: 1px solid #94a3b8 !important;
        background: #e2e8f0 !important;
    }
`;

const GrandTotalTr = styled.tr`
    background: #f1f5f9 !important;
    border-top: 2px solid #000000 !important;
    border-bottom: 3px double #000000 !important;
    td {
        font-weight: 800 !important;
        font-size: 0.96rem !important;
        color: #000000 !important;
        padding: 6px 8px !important;
        background: #f1f5f9 !important;
        border: 1px solid #64748b !important;
        border-top: 2px solid #000000 !important;
        border-bottom: 3px double #000000 !important;
    }
`;

const extractDateKey = (dateVal) => {
    if (!dateVal) return "Undated";
    const str = String(dateVal).trim();
    const ddmmyyyy = str.match(/^(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (ddmmyyyy) return ddmmyyyy[1];
    const yyyymmdd = str.match(/^(\d{4}-\d{2}-\d{2})/);
    if (yyyymmdd) {
        const parts = yyyymmdd[1].split("-");
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (str.includes(" ")) return str.split(" ")[0];
    return str;
};

const extractTime = (dateVal) => {
    if (!dateVal) return "";
    const str = String(dateVal).trim();
    if (str.includes(" ")) {
        return str.substring(str.indexOf(" ") + 1).trim();
    }
    return "";
};

const MasterCashierDetailedReport = ({ isModalView = false, startDate, endDate, initialOutlet = "all" }) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs(),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(initialOutlet || "all");
    const [outletsList, setOutletsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCashier, setSelectedCashier] = useState("all");

    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const res = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
                if (res?.success && Array.isArray(res?.data)) {
                    setOutletsList(res.data);
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
        if (initialOutlet !== undefined && initialOutlet !== outlet) {
            setOutlet(initialOutlet);
        }
    }, [initialOutlet]);

    const fetchReport = useCallback(async (isRefresh = false) => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/cashier-wise-detailed/?from_date=${fDate}&to_date=${tDate}&outlet_code=${outlet}`;
            const res = await cachedApiRequest(url, "GET", null, { forceRefresh: isRefresh });
            if (res?.success) {
                setReportData(extractReportData(res));
            } else {
                setReportData(null);
            }
        } catch (err) {
            console.error("Cashier Detailed Report Error:", err);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    }, [dateRange, outlet, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const allBills = getSafeArray(reportData?.data);

    const cashierList = useMemo(() => {
        const set = new Set();
        allBills.forEach(b => {
            if (b.cashier_name) set.add(b.cashier_name);
        });
        return Array.from(set);
    }, [allBills]);

    const filteredBills = useMemo(() => {
        let list = allBills;
        if (selectedCashier !== "all") {
            list = list.filter(b => b.cashier_name === selectedCashier);
        }
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(b =>
            String(b.bill_no || "").toLowerCase().includes(q) ||
            String(b.patient_name || "").toLowerCase().includes(q) ||
            String(b.mr_no || "").toLowerCase().includes(q) ||
            String(b.cashier_name || "").toLowerCase().includes(q) ||
            String(b.shift_no || "").toLowerCase().includes(q) ||
            String(b.category || "").toLowerCase().includes(q)
        );
    }, [allBills, selectedCashier, searchTerm]);

    /* Grouped data by Date -> Shift -> Category */
    const groupedData = useMemo(() => {
        let runningSlno = 1;
        const dateMap = new Map();

        filteredBills.forEach(b => {
            const dateKey = extractDateKey(b.date);
            const rawShift = String(b.shift_no || "1").trim();
            const shiftNo = rawShift.replace(/^Shift\s+/i, "").trim() || "1";
            const cashierName = (b.cashier_name || "Counter").trim();
            const shiftKey = `${shiftNo}___${cashierName}`;
            const catKey = (b.category || "GENERAL").trim().toUpperCase();

            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, new Map());
            }
            const shiftMap = dateMap.get(dateKey);
            if (!shiftMap.has(shiftKey)) {
                shiftMap.set(shiftKey, { shiftNo, cashierName, catMap: new Map() });
            }
            const catMap = shiftMap.get(shiftKey).catMap;
            if (!catMap.has(catKey)) {
                catMap.set(catKey, []);
            }
            catMap.get(catKey).push(b);
        });

        const result = [];
        dateMap.forEach((shiftMap, dateKey) => {
            const shifts = [];
            let dateCash = 0;
            let dateCard = 0;
            let dateCredit = 0;
            let dateTotal = 0;
            let dateCount = 0;

            shiftMap.forEach(({ shiftNo, cashierName, catMap }) => {
                const sections = [];
                let shiftCash = 0;
                let shiftCard = 0;
                let shiftCredit = 0;
                let shiftTotal = 0;
                let shiftCount = 0;

                catMap.forEach((items, category) => {
                    let secCash = 0;
                    let secCard = 0;
                    let secCredit = 0;
                    let secTotal = 0;

                    // Sort items in ascending bill number order
                    const sortedItems = [...items].sort((a, b) => {
                        const s1 = String(a.bill_no || "").trim();
                        const s2 = String(b.bill_no || "").trim();
                        return s1.localeCompare(s2, undefined, { numeric: true, sensitivity: 'base' });
                    });

                    const enrichedItems = sortedItems.map(b => {
                        const cash = cleanNum(b.cash);
                        const card = cleanNum(b.bank || b.card);
                        const credit = cleanNum(b.credit);
                        const tot = cash + card + credit;

                        secCash += cash;
                        secCard += card;
                        secCredit += credit;
                        secTotal += tot;

                        return {
                            ...b,
                            displaySlno: runningSlno++,
                            cashVal: cash,
                            cardVal: card,
                            creditVal: credit,
                            totVal: tot,
                            timeStr: extractTime(b.date)
                        };
                    });

                    sections.push({
                        category,
                        items: enrichedItems,
                        totalCash: secCash,
                        totalCard: secCard,
                        totalCredit: secCredit,
                        totalAmount: secTotal,
                        count: enrichedItems.length
                    });

                    shiftCash += secCash;
                    shiftCard += secCard;
                    shiftCredit += secCredit;
                    shiftTotal += secTotal;
                    shiftCount += enrichedItems.length;
                });

                shifts.push({
                    shiftNo,
                    cashierName,
                    sections,
                    totalCash: shiftCash,
                    totalCard: shiftCard,
                    totalCredit: shiftCredit,
                    totalAmount: shiftTotal,
                    count: shiftCount
                });

                dateCash += shiftCash;
                dateCard += shiftCard;
                dateCredit += shiftCredit;
                dateTotal += shiftTotal;
                dateCount += shiftCount;
            });

            result.push({
                date: dateKey,
                shifts,
                totalCash: dateCash,
                totalCard: dateCard,
                totalCredit: dateCredit,
                totalAmount: dateTotal,
                count: dateCount
            });
        });

        return result;
    }, [filteredBills]);

    const totalCash = filteredBills.reduce((acc, x) => acc + cleanNum(x.cash), 0);
    const totalCard = filteredBills.reduce((acc, x) => acc + cleanNum(x.bank || x.card), 0);
    const totalCredit = filteredBills.reduce((acc, x) => acc + cleanNum(x.credit), 0);
    const grandTotal = totalCash + totalCard + totalCredit;

    const handleExport = () => {
        if (!groupedData || groupedData.length === 0) return;

        const excelRows = [];
        groupedData.forEach(dg => {
            excelRows.push({
                "SLNO": `Date: ${dg.date}`,
                "Bill No": "",
                "Time": "",
                "UHID": "",
                "Patient Name": "",
                "Cash (₹)": "",
                "Card & Bank (₹)": "",
                "Credit (₹)": "",
                "Total (₹)": ""
            });

            dg.shifts.forEach(sh => {
                excelRows.push({
                    "SLNO": `Shift # : ${sh.shiftNo} — Cashier: ${sh.cashierName}`,
                    "Bill No": "",
                    "Time": "",
                    "UHID": "",
                    "Patient Name": "",
                    "Cash (₹)": "",
                    "Card & Bank (₹)": "",
                    "Credit (₹)": "",
                    "Total (₹)": ""
                });

                sh.sections.forEach(sec => {
                    excelRows.push({
                        "SLNO": sec.category,
                        "Bill No": "",
                        "Time": "",
                        "UHID": "",
                        "Patient Name": "",
                        "Cash (₹)": "",
                        "Card & Bank (₹)": "",
                        "Credit (₹)": "",
                        "Total (₹)": ""
                    });

                    sec.items.forEach(it => {
                        excelRows.push({
                            "SLNO": it.displaySlno,
                            "Bill No": it.bill_no,
                            "Time": it.timeStr || it.date || "",
                            "UHID": it.mr_no || "—",
                            "Patient Name": it.patient_name || "General",
                            "Cash (₹)": it.cashVal,
                            "Card & Bank (₹)": it.cardVal,
                            "Credit (₹)": it.creditVal,
                            "Total (₹)": it.totVal
                        });
                    });

                    excelRows.push({
                        "SLNO": "",
                        "Bill No": "",
                        "Time": "",
                        "UHID": "",
                        "Patient Name": "Total ->",
                        "Cash (₹)": sec.totalCash,
                        "Card & Bank (₹)": sec.totalCard,
                        "Credit (₹)": sec.totalCredit,
                        "Total (₹)": sec.totalAmount
                    });
                });

                if (sh.sections.length > 1) {
                    excelRows.push({
                        "SLNO": "",
                        "Bill No": "",
                        "Time": "",
                        "UHID": "",
                        "Patient Name": `Shift Total (${sh.shiftNo}) ->`,
                        "Cash (₹)": sh.totalCash,
                        "Card & Bank (₹)": sh.totalCard,
                        "Credit (₹)": sh.totalCredit,
                        "Total (₹)": sh.totalAmount
                    });
                }
            });
        });

        excelRows.push({
            "SLNO": "",
            "Bill No": "",
            "Time": "",
            "UHID": "",
            "Patient Name": `Grand Total -> (${filteredBills.length} Bills)`,
            "Cash (₹)": totalCash,
            "Card & Bank (₹)": totalCard,
            "Credit (₹)": totalCredit,
            "Total (₹)": grandTotal
        });

        exportToExcel(excelRows, "Master_Cashier_Detailed_Collection", "CashierDetailed");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                Cashier-Wise Detailed Collection
                                <span className="badge">Detailed Audit</span>
                            </h1>
                            <p>Line-by-line itemized collection audit per counter cashier across work shifts</p>
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
                            <label>Outlet:</label>
                            <Select value={outlet} onChange={setOutlet} style={{ width: 170 }}>
                                <Option value="all">All Outlets</Option>
                                {outletsList.map((o) => (
                                    <Option key={o.outlet_code} value={o.outlet_code}>
                                        {o.outlet_name || o.outlet_code}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <label>Cashier:</label>
                            <Select value={selectedCashier} onChange={setSelectedCashier} style={{ width: 180 }}>
                                <Option value="all">All Cashiers</Option>
                                {cashierList.map(c => (
                                    <Option key={c} value={c}>{c}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <Input
                                placeholder="Search bill / patient / UHID / shift..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 230 }}
                            />
                        </div>
                        <Button icon={<RefreshCw size={14} />} onClick={() => fetchReport(true)} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                </ControlCard>
            )}

            {loading ? (
                <div style={{ padding: "60px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-report-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title="CashierDetailedReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Line-by-line itemized collection audit per counter cashier across work shifts"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                            <KPICard $border="#0ea5e9">
                                <span className="kpi-title">Total Cash</span>
                                <span className="kpi-value">₹{formatINR(totalCash)}</span>
                            </KPICard>
                            <KPICard $border="#6366f1">
                                <span className="kpi-title">Total Card / POS</span>
                                <span className="kpi-value">₹{formatINR(totalCard)}</span>
                            </KPICard>
                            <KPICard $border="#f59e0b">
                                <span className="kpi-title">Total Credit</span>
                                <span className="kpi-value">₹{formatINR(totalCredit)}</span>
                            </KPICard>
                            <KPICard $border="#10b981">
                                <span className="kpi-title">Total Revenue</span>
                                <span className="kpi-value">₹{formatINR(grandTotal)}</span>
                            </KPICard>
                        </KPIGrid>
                    )}

                    <CompactTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: "4%", textAlign: "center" }}>SLNO</th>
                                    <th style={{ width: "15%" }}>Bill No</th>
                                    <th style={{ width: "9%", textAlign: "center" }}>Time</th>
                                    <th style={{ width: "12%" }}>UHID</th>
                                    <th style={{ width: "24%" }}>Patient Name</th>
                                    <th style={{ width: "9%" }} className="text-right">Cash (₹)</th>
                                    <th style={{ width: "9%" }} className="text-right">Card (₹)</th>
                                    <th style={{ width: "9%" }} className="text-right">Credit (₹)</th>
                                    <th style={{ width: "9%" }} className="text-right">Total (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: "center", padding: "35px", color: "#64748b" }}>
                                            No cashier collection records found for the selected criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    groupedData.map(dg => (
                                        <React.Fragment key={dg.date}>
                                            {/* Date Header Row */}
                                            <DateHeaderTr className="DateGroup date-group">
                                                <td colSpan={9}>
                                                    Date : {dg.date}
                                                </td>
                                            </DateHeaderTr>

                                            {/* Shift Sections */}
                                            {dg.shifts.map(sh => (
                                                <React.Fragment key={`${dg.date}-${sh.shiftNo}-${sh.cashierName}`}>
                                                    {/* Shift Header Row */}
                                                    <ShiftHeaderTr className="ShiftGroup shift-group">
                                                        <td colSpan={9}>
                                                            Shift # : {sh.shiftNo} &nbsp;&nbsp;|&nbsp;&nbsp; Cashier : {sh.cashierName}
                                                        </td>
                                                    </ShiftHeaderTr>

                                                    {/* Category Sections within Shift */}
                                                    {sh.sections.map(sec => (
                                                        <React.Fragment key={`${dg.date}-${sh.shiftNo}-${sec.category}`}>
                                                            {/* Category Sub-Head Row */}
                                                            <SectionHeaderTr className="SectionHeader section-header">
                                                                <td colSpan={9}>
                                                                    {sec.category}
                                                                </td>
                                                            </SectionHeaderTr>

                                                            {/* Bill Items */}
                                                            {sec.items.map(it => (
                                                                <tr key={it.bill_no + "-" + it.displaySlno}>
                                                                    <td className="text-center" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                                                        {it.displaySlno}
                                                                    </td>
                                                                    <td className="font-mono" style={{ fontSize: "0.88rem", fontWeight: 700 }}>
                                                                        <strong>{it.bill_no}</strong>
                                                                    </td>
                                                                    <td className="text-center" style={{ fontSize: "0.80rem", color: "#334155" }}>
                                                                        {it.timeStr || it.date || "—"}
                                                                    </td>
                                                                    <td className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                                                                        {it.mr_no || "—"}
                                                                    </td>
                                                                    <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                        <strong style={{ fontSize: "0.88rem", color: "#0f172a" }}>
                                                                            {it.patient_name || "General Patient"}
                                                                        </strong>
                                                                    </td>
                                                                    <td className="text-right font-mono font-bold" style={{ fontSize: "0.92rem", color: it.cashVal > 0 ? "#059669" : "#0f172a" }}>
                                                                        {formatINR(it.cashVal)}
                                                                    </td>
                                                                    <td className="text-right font-mono font-bold" style={{ fontSize: "0.92rem", color: it.cardVal > 0 ? "#2563eb" : "#0f172a" }}>
                                                                        {formatINR(it.cardVal)}
                                                                    </td>
                                                                    <td className="text-right font-mono font-bold" style={{ fontSize: "0.92rem", color: it.creditVal > 0 ? "#d97706" : "#0f172a" }}>
                                                                        {formatINR(it.creditVal)}
                                                                    </td>
                                                                    <td className="text-right font-mono font-bold" style={{ fontSize: "0.94rem", color: "#0284c7" }}>
                                                                        {formatINR(it.totVal)}
                                                                    </td>
                                                                </tr>
                                                            ))}

                                                            {/* Category Subtotal Row */}
                                                            <SubtotalTr className="SubTotal sub-total">
                                                                <td colSpan={5} style={{ textAlign: "right", fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>
                                                                    Total -&gt;
                                                                </td>
                                                                <td className="text-right font-mono font-bold" style={{ fontSize: "0.95rem", color: sec.totalCash > 0 ? "#059669" : "#0f172a" }}>
                                                                    {formatINR(sec.totalCash)}
                                                                </td>
                                                                <td className="text-right font-mono font-bold" style={{ fontSize: "0.95rem", color: "#2563eb" }}>
                                                                    {formatINR(sec.totalCard)}
                                                                </td>
                                                                <td className="text-right font-mono font-bold" style={{ fontSize: "0.95rem", color: "#d97706" }}>
                                                                    {formatINR(sec.totalCredit)}
                                                                </td>
                                                                <td className="text-right font-mono font-bold" style={{ fontSize: "0.98rem", color: "#0284c7" }}>
                                                                    {formatINR(sec.totalAmount)}
                                                                </td>
                                                            </SubtotalTr>
                                                        </React.Fragment>
                                                    ))}

                                                    {/* Shift Subtotal Row (when multiple categories in shift) */}
                                                    {sh.sections.length > 1 && (
                                                        <ShiftTotalTr className="ShiftTotal shift-total">
                                                            <td colSpan={5} style={{ textAlign: "right", fontWeight: 800, color: "#0f172a", fontSize: "0.90rem" }}>
                                                                Shift Total ({sh.shiftNo}) -&gt;
                                                            </td>
                                                            <td className="text-right font-mono font-bold" style={{ fontSize: "0.98rem", color: "#059669" }}>
                                                                {formatINR(sh.totalCash)}
                                                            </td>
                                                            <td className="text-right font-mono font-bold" style={{ fontSize: "0.98rem", color: "#2563eb" }}>
                                                                {formatINR(sh.totalCard)}
                                                            </td>
                                                            <td className="text-right font-mono font-bold" style={{ fontSize: "0.98rem", color: "#d97706" }}>
                                                                {formatINR(sh.totalCredit)}
                                                            </td>
                                                            <td className="text-right font-mono font-bold" style={{ fontSize: "1.02rem", color: "#0284c7" }}>
                                                                {formatINR(sh.totalAmount)}
                                                            </td>
                                                        </ShiftTotalTr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </React.Fragment>
                                    ))
                                )}

                                {/* Grand Totals Row */}
                                {groupedData.length > 0 && (
                                    <GrandTotalTr className="GrandTotal grand-total-row">
                                        <td colSpan={5} style={{ textAlign: "right", fontWeight: 800, color: "#000000", fontSize: "0.95rem" }}>
                                            Grand Total -&gt; ({filteredBills.length} Bills)
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#000000", fontSize: "1.05rem" }}>
                                            ₹{formatINR(totalCash)}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#000000", fontSize: "1.05rem" }}>
                                            ₹{formatINR(totalCard)}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#000000", fontSize: "1.05rem" }}>
                                            ₹{formatINR(totalCredit)}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#000000", fontSize: "1.08rem" }}>
                                            ₹{formatINR(grandTotal)}
                                        </td>
                                    </GrandTotalTr>
                                )}
                            </tbody>
                        </table>
                    </CompactTableWrapper>

                    <ReportPrintFooter />
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterCashierDetailedReport;
