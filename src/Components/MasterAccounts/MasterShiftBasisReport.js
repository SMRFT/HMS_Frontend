import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker, Modal, Spin } from "antd";
import { 
    FaEye, 
    FaPrint, 
    FaFileExcel, 
    FaCalendarAlt,
    FaClinicMedical
} from "react-icons/fa";
import * as XLSX from "xlsx";
import {
    PageWrapper,
    colors,
    FormRow,
    InputWrapper,
    Label,
    Input,
    Select,
    Button,
    TableWrapper,
    Table,
    Th,
    Td,
    Tr,
    SectionTitle,
} from "../GlobalStyles";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { printAccountsReport } from "../Accounts/printAccountsReport";
import { cleanNum, formatINR, fetchCachedOutlets, cachedApiRequest } from "./masterAccountsHelper";

// ─── STYLED COMPONENTS ───────────────────────────────────────────────────────
const StyledPageWrapper = styled(PageWrapper)`
    @media print {
        .hide-on-print, .action-column, th.action-column, td.action-column {
            display: none !important;
        }
    }
`;

const SummaryLabel = styled.p`
    margin: 0;
    font-size: 0.82rem;
    font-weight: 600;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const FilterSection = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const StyledTableWrapper = styled(TableWrapper)`
    table {
        font-size: 0.90rem;
    }
    th {
        font-size: 0.86rem;
        padding: 9px 8px !important;
    }
    td {
        font-size: 0.90rem;
        padding: 8px 8px !important;
    }
`;

const DateGroupRow = styled.tr`
    background: #f1f5f9 !important;
    font-weight: 700;
    color: #1e293b;
    border-top: 2px solid #cbd5e1;
    border-bottom: 1px solid #cbd5e1;

    td {
        padding: 10px 12px !important;
        font-size: 0.94rem !important;
        letter-spacing: 0.3px;
    }
`;

const CounterSubheadRow = styled.tr`
    background: #e6fffa !important;
    font-weight: 700;
    color: #0f766e;
    border-top: 1px solid #99f6e4;
    border-bottom: 1px solid #99f6e4;

    td {
        padding: 7px 14px !important;
        font-size: 0.86rem !important;
        letter-spacing: 0.2px;
    }
`;

const CounterSubtotalRow = styled.tr`
    background: #f0fdfa !important;
    font-weight: 600;
    color: #115e59;
    border-top: 1px dashed #99f6e4;
    border-bottom: 1px solid #0d9488;

    td {
        padding: 7px 8px !important;
        font-size: 0.82rem !important;
    }
`;

const SubtotalRow = styled.tr`
    background: #f8fafc !important;
    font-weight: 700;
    color: #0f172a;
    border-top: 1px solid #94a3b8;
    border-bottom: 2px solid #64748b;

    td {
        padding: 9px 8px !important;
        font-size: 0.90rem !important;
    }
`;

const GrandTotalRow = styled.tr`
    background: #e2e8f0 !important;
    font-weight: 800;
    color: #000000;
    border-top: 2px solid #000;
    border-bottom: 3px double #000;

    td {
        padding: 11px 8px !important;
        font-size: 0.94rem !important;
    }
`;

const DateSectionBanner = styled.div`
    background: linear-gradient(135deg, #133d34 0%, #0d9488 100%);
    color: #ffffff;
    padding: 12px 18px;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    flex-wrap: wrap;
    gap: 10px;

    .date-title {
        font-size: 1.15rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .shift-pill {
        font-size: 0.80rem;
        background: rgba(255, 255, 255, 0.22);
        padding: 3px 10px;
        border-radius: 12px;
        font-weight: 600;
    }

    .date-metrics {
        font-size: 0.88rem;
        font-weight: 600;
        display: flex;
        gap: 14px;
        flex-wrap: wrap;

        span {
            background: rgba(255, 255, 255, 0.15);
            padding: 3px 8px;
            border-radius: 6px;
        }

        .highlight {
            background: rgba(255, 255, 255, 0.3);
            font-weight: 700;
        }
    }
`;

const PrintTemplate = styled.div`
    display: none;
    @media print {
        display: block !important;
        background: white;
        width: 100%;
        color: black;
        font-family: 'Times New Roman', serif;
    }
`;

const PrintHeader = styled.div`
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 8px;
    margin-bottom: 12px;
    h1 { margin: 0; font-size: 20px; text-transform: uppercase; font-weight: bold; }
    p { margin: 2px 0; font-size: 11px; }
    .report-title { font-size: 14px; font-weight: bold; margin-top: 8px; text-transform: uppercase; text-decoration: underline; }
`;

const PrintInfoTable = styled.table`
    width: 100%;
    margin-bottom: 12px;
    border-collapse: collapse;
    font-size: 10px;
    td { padding: 2px 0; border: none !important; }
`;

const PrintTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 9px;
    th, td {
        border: 1px solid #000 !important;
        padding: 5px 6px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2 !important;
        font-weight: bold;
        text-transform: uppercase;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
`;

const PrintSignatures = styled.div`
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    page-break-inside: avoid;
    .sig-box {
        text-align: center;
        width: 180px;
        border-top: 1px solid #000;
        padding-top: 4px;
        font-weight: bold;
    }
`;

// Helper for date keys
const parseDateKey = (s) => {
    if (!s) return "UNKNOWN_DATE";
    const dateStr = String(s.raw_date || s.date || "").trim();
    if (!dateStr) return "UNKNOWN_DATE";
    const yyyymmdd = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (yyyymmdd) {
        const [, y, m, d] = yyyymmdd;
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (ddmmyyyy) {
        const [, d, m, y] = ddmmyyyy;
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    const d = dayjs(dateStr);
    return d.isValid() ? d.format("YYYY-MM-DD") : dateStr;
};

const formatDisplayDate = (s) => {
    if (!s) return "N/A";
    const dateStr = String(s.date || s.raw_date || "").trim();
    if (!dateStr) return "N/A";
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (ddmmyyyy) {
        const [, d, m, y] = ddmmyyyy;
        return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
    }
    const yyyymmdd = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (yyyymmdd) {
        const [, y, m, d] = yyyymmdd;
        return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
    }
    const d = dayjs(dateStr);
    return d.isValid() ? d.format("DD/MM/YYYY") : dateStr;
};

const compareShiftNo = (a, b) => {
    const sA = String(a.shiftno || a.shift_no || "").trim();
    const sB = String(b.shiftno || b.shift_no || "").trim();
    return sA.localeCompare(sB, undefined, { numeric: true, sensitivity: "base" });
};

// ─── MASTER SHIFT BASIS REPORT COMPONENT ───────────────────────────────────────
const MasterShiftBasisReport = ({ isModalView = false, startDate, endDate, initialOutlet = "all" }) => {
    const location = useLocation();
    const [fromDate, setFromDate] = useState(startDate || location.state?.startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || location.state?.endDate || format(new Date(), "yyyy-MM-dd"));
    const [outlet, setOutlet] = useState(location.state?.outlet || initialOutlet || "all");
    const [outlets, setOutlets] = useState([]);
    const [reportBills, setReportBills] = useState([]);
    const [reportExpenses, setReportExpenses] = useState([]);
    const [summaryData, setSummaryData] = useState([]);
    const [viewType, setViewType] = useState("summary"); // "summary", "grouped"
    const [sortOrder, setSortOrder] = useState("asc");
    const [shiftNo, setShiftNo] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedShiftBills, setSelectedShiftBills] = useState(null);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_name = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
    const branch_name = localStorage.getItem("branch_name") || "Main Branch";

    const fetchOutlets = useCallback(async () => {
        try {
            const data = await fetchCachedOutlets(HmsBaseUrl);
            if (Array.isArray(data)) {
                setOutlets(data);
            }
        } catch (error) {
            console.error("Error fetching outlets:", error);
        }
    }, [HmsBaseUrl]);

    const getOutletName = useCallback((code) => {
        if (!code) return '-';
        const found = outlets.find(o => String(o.outlet_code) === String(code) || String(o.outlet_id) === String(code));
        return found ? (found.outlet_name || found.name) : code;
    }, [outlets]);

    const fetchReport = useCallback(async (isRefresh = false) => {
        setLoading(true);
        try {
            const url = `${HmsBaseUrl}master-accounts/shift-basis-collection/?from_date=${fromDate}&to_date=${toDate}&outlet_code=${outlet}&shiftno=${shiftNo}`;
            const res = await cachedApiRequest(url, "GET", null, { forceRefresh: isRefresh });
            if (res?.success) {
                const payload = (res.data && typeof res.data === "object" && !Array.isArray(res.data)) ? res.data : (res || {});
                const sData = Array.isArray(payload.summary_data) ? payload.summary_data : 
                              Array.isArray(res?.summary_data) ? res.summary_data : 
                              Array.isArray(payload.data) ? payload.data : 
                              Array.isArray(res?.data) ? res.data : [];
                const bData = Array.isArray(payload.bills) ? payload.bills : 
                              Array.isArray(res?.bills) ? res.bills : 
                              Array.isArray(payload.itemized_bills) ? payload.itemized_bills : 
                              Array.isArray(res?.itemized_bills) ? res.itemized_bills : [];
                const eData = Array.isArray(payload.expense_deductions) ? payload.expense_deductions :
                              Array.isArray(res?.expense_deductions) ? res.expense_deductions :
                              Array.isArray(payload.expense_vouchers) ? payload.expense_vouchers :
                              Array.isArray(res?.expense_vouchers) ? res.expense_vouchers : [];
                setSummaryData(sData);
                setReportBills(bData);
                setReportExpenses(eData);
            } else {
                toast.error(res?.message || "Error fetching shift report");
            }
        } catch (error) {
            console.error("Error fetching shift basis report:", error);
            toast.error("Error fetching shift basis report");
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, outlet, shiftNo, HmsBaseUrl]);

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
        if (initialOutlet) setOutlet(initialOutlet);
    }, [startDate, endDate, initialOutlet]);

    useEffect(() => {
        if (fromDate && toDate) {
            fetchOutlets();
            fetchReport();
        }
    }, [fromDate, toDate, outlet, shiftNo, fetchOutlets, fetchReport]);

    // ─── DATA GROUPING & TALLY ENGINE ──────────────────────────────────────────
    const { dateGroups, grandTotals, allSortedShifts } = useMemo(() => {
        if (!summaryData || summaryData.length === 0) {
            return {
                dateGroups: [],
                grandTotals: { shiftsCount: 0, opening: 0, cashColl: 0, expensesPaid: 0, creditColl: 0, cardColl: 0, totalColl: 0, closing: 0, returnAmount: 0 },
                allSortedShifts: []
            };
        }

        const groupsMap = {};

        summaryData.forEach((s) => {
            const dateKey = parseDateKey(s);
            const displayDate = formatDisplayDate(s);

            if (!groupsMap[dateKey]) {
                groupsMap[dateKey] = {
                    dateKey,
                    displayDate,
                    shifts: [],
                    counterGroupsMap: {},
                    subtotals: {
                        opening: 0,
                        cashColl: 0,
                        expensesPaid: 0,
                        creditColl: 0,
                        cardColl: 0,
                        totalColl: 0,
                        closing: 0,
                        returnAmount: 0
                    }
                };
            }

            const openBal = cleanNum(s.openBal !== undefined && s.openBal !== null ? s.openBal : (s.opening_balance !== undefined && s.opening_balance !== null ? s.opening_balance : s.OpeningBalance));
            const cash = cleanNum(s.cashColl !== undefined && s.cashColl !== null ? s.cashColl : (s.gross_cash !== undefined && s.gross_cash !== null ? s.gross_cash : s.collected_Amount));
            const exp = Math.abs(cleanNum(s.expensesPaid !== undefined && s.expensesPaid !== null ? s.expensesPaid : (s.expenses_paid !== undefined && s.expenses_paid !== null ? s.expenses_paid : 0)));
            const credit = cleanNum(s.creditColl !== undefined && s.creditColl !== null ? s.creditColl : (s.credit_collection !== undefined && s.credit_collection !== null ? s.credit_collection : 0));
            const card = cleanNum(s.cardColl !== undefined && s.cardColl !== null ? s.cardColl : (s.card_collection !== undefined && s.card_collection !== null ? s.card_collection : s.bank));
            const ret = Math.abs(cleanNum(s.retAmt !== undefined && s.retAmt !== null ? s.retAmt : (s.sales_return !== undefined && s.sales_return !== null ? s.sales_return : 0)));
            const totalCol = Number((cash + card + credit).toFixed(2));
            const closeBal = Number((cash - exp - ret).toFixed(2));

            const shiftNum = String(s.shiftno || s.shift_no || "").trim();
            const shiftBills = Array.isArray(reportBills) ? reportBills.filter(b => String(b.shift_no || b.shiftno || "").trim() === shiftNum) : [];
            const shiftExpenses = Array.isArray(reportExpenses) ? reportExpenses.filter(e => String(e.shift_no || e.shiftno || "").trim() === shiftNum) : [];
            const outletCode = s.SelectedOutlet || s.outlet_code || "OLET003";

            const enrichedShift = {
                ...s,
                shiftno: shiftNum,
                User: s.User || s.cashier_name || s.cashier_id || "Staff",
                SelectedOutlet: outletCode,
                StartTime: s.StartTime || s.start_time || "08:00 AM",
                EndTime: s.EndTime || s.end_time || "08:00 PM",
                displayDate,
                openBal,
                cashColl: cash,
                expensesPaid: exp,
                creditColl: credit,
                cardColl: card,
                totalColl: totalCol,
                closeBal,
                retAmt: ret,
                bills: shiftBills,
                expenses: shiftExpenses
            };

            groupsMap[dateKey].shifts.push(enrichedShift);

            // Group by Counter as Sub Head under Date
            if (!groupsMap[dateKey].counterGroupsMap[outletCode]) {
                groupsMap[dateKey].counterGroupsMap[outletCode] = {
                    outletCode,
                    shifts: [],
                    subtotals: {
                        opening: 0,
                        cashColl: 0,
                        expensesPaid: 0,
                        creditColl: 0,
                        cardColl: 0,
                        totalColl: 0,
                        closing: 0,
                        returnAmount: 0
                    }
                };
            }
            groupsMap[dateKey].counterGroupsMap[outletCode].shifts.push(enrichedShift);
            const cSub = groupsMap[dateKey].counterGroupsMap[outletCode].subtotals;
            cSub.opening += openBal;
            cSub.cashColl += cash;
            cSub.expensesPaid += exp;
            cSub.creditColl += credit;
            cSub.cardColl += card;
            cSub.totalColl += totalCol;
            cSub.closing += closeBal;
            cSub.returnAmount += ret;

            const sub = groupsMap[dateKey].subtotals;
            sub.opening += openBal;
            sub.cashColl += cash;
            sub.expensesPaid += exp;
            sub.creditColl += credit;
            sub.cardColl += card;
            sub.totalColl += totalCol;
            sub.closing += closeBal;
            sub.returnAmount += ret;
        });

        Object.values(groupsMap).forEach(g => {
            g.shifts.sort(compareShiftNo);
            g.counterGroups = Object.values(g.counterGroupsMap || {}).sort((a, b) => a.outletCode.localeCompare(b.outletCode));
            g.counterGroups.forEach(cg => cg.shifts.sort(compareShiftNo));
        });

        const sortedGroups = Object.values(groupsMap).sort((a, b) => {
            return sortOrder === "asc" ? a.dateKey.localeCompare(b.dateKey) : b.dateKey.localeCompare(a.dateKey);
        });

        const flatShifts = [];
        sortedGroups.forEach(g => flatShifts.push(...g.shifts));

        const gTotals = {
            shiftsCount: flatShifts.length,
            opening: 0,
            cashColl: 0,
            expensesPaid: 0,
            creditColl: 0,
            cardColl: 0,
            totalColl: 0,
            closing: 0,
            returnAmount: 0
        };

        sortedGroups.forEach(g => {
            gTotals.opening += g.subtotals.opening;
            gTotals.cashColl += g.subtotals.cashColl;
            gTotals.expensesPaid += g.subtotals.expensesPaid;
            gTotals.creditColl += g.subtotals.creditColl;
            gTotals.cardColl += g.subtotals.cardColl;
            gTotals.totalColl += g.subtotals.totalColl;
            gTotals.closing += g.subtotals.closing;
            gTotals.returnAmount += g.subtotals.returnAmount;
        });

        return {
            dateGroups: sortedGroups,
            grandTotals: gTotals,
            allSortedShifts: flatShifts
        };
    }, [summaryData, reportBills, reportExpenses, sortOrder]);

    // ─── EXCEL EXPORT ────────────────────────────────────────────────────────
    const handleExportExcel = () => {
        if (!allSortedShifts || allSortedShifts.length === 0) {
            toast.warning("No data to export");
            return;
        }
        try {
            const rows = allSortedShifts.map((s, i) => ({
                "S.No": i + 1,
                "Date": s.displayDate || s.date || "",
                "Shift No": s.shiftno || "",
                "Outlet / Counter": getOutletName(s.SelectedOutlet),
                "Cashier Name": s.User || "",
                "Start Time": s.StartTime || "",
                "End Time": s.EndTime || "Active",
                "Opening Balance (₹)": Number(s.openBal.toFixed(2)),
                "Cash Collection (₹)": Number(s.cashColl.toFixed(2)),
                "Card & Bank (₹)": Number(s.cardColl.toFixed(2)),
                "Credit Collection (₹)": Number(s.creditColl.toFixed(2)),
                "Total Collection (₹)": Number(s.totalColl.toFixed(2)),
                "Sales Return (₹)": Number(s.retAmt.toFixed(2)),
                "Closing Balance (₹)": Number(s.closeBal.toFixed(2)),
                "Status": (s.ShiftStatus || s.status || "CLOSED").toUpperCase()
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);
            ws["!cols"] = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
            XLSX.utils.book_append_sheet(wb, ws, "Shift Summary");

            if (reportBills && reportBills.length > 0) {
                const detailedRows = reportBills.map((b, idx) => ({
                    "S.No": idx + 1,
                    "Shift No": b.shift_no || b.shiftno || "",
                    "Bill Date": b.date || "",
                    "Bill No": b.bill_no || "",
                    "UHID": b.uhid || "",
                    "Patient Name": b.patient_name || "",
                    "Category": b.category || "",
                    "Payment Mode": b.payment_mode || "",
                    "Cash (₹)": cleanNum(b.cash),
                    "Card / Bank (₹)": cleanNum(b.bank),
                    "Credit (₹)": cleanNum(b.credit),
                    "Net Amount (₹)": cleanNum(b.net_amount || b.gross),
                    "Cashier": b.cashier_name || ""
                }));
                const wsDet = XLSX.utils.json_to_sheet(detailedRows);
                wsDet["!cols"] = Object.keys(detailedRows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
                XLSX.utils.book_append_sheet(wb, wsDet, "Itemized Bills");
            }

            XLSX.writeFile(wb, `Master_Shift_Basis_Report_${fromDate}_to_${toDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    const handlePrint = () => {
        printAccountsReport("printable-report-area", "landscape");
    };

    return (
        <StyledPageWrapper style={isModalView ? { padding: 0 } : {}}>
            {!isModalView && (
                <SectionTitle>
                    <h3>Shift Basis Collection Report</h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                        {shiftNo ? `Report for Shift: ${shiftNo}` : `Range: ${dayjs(fromDate).format("DD MMM YYYY")} to ${dayjs(toDate).format("DD MMM YYYY")}`}
                    </p>
                </SectionTitle>
            )}

            {/* FILTER CONTROLS */}
            {!isModalView && (
                <FilterSection className="no-print">
                    <FormRow>
                        <InputWrapper>
                            <Label>From Date</Label>
                            <DatePicker 
                                value={fromDate ? dayjs(fromDate) : null} 
                                onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : fromDate)}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ width: '100%', height: '35px', borderRadius: '8px' }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>To Date</Label>
                            <DatePicker 
                                value={toDate ? dayjs(toDate) : null} 
                                onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : toDate)}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ width: '100%', height: '35px', borderRadius: '8px' }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Outlet</Label>
                            <Select
                                value={outlet}
                                onChange={(e) => setOutlet(e.target.value)}
                            >
                                <option value="all">All Outlets</option>
                                {outlets.map((o) => (
                                    <option key={o.outlet_code} value={o.outlet_code}>
                                        {o.outlet_name || o.outlet_code}
                                    </option>
                                ))}
                            </Select>
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Shift No</Label>
                            <Input
                                type="text"
                                placeholder="e.g. 2627/01/000021"
                                value={shiftNo}
                                onChange={(e) => setShiftNo(e.target.value)}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>View Mode</Label>
                            <Select
                                value={viewType}
                                onChange={(e) => setViewType(e.target.value)}
                            >
                                <option value="summary">Summary Table</option>
                                <option value="grouped">Shift Wise Cards</option>
                            </Select>
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Date Order</Label>
                            <Select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="asc">Chronological (Asc)</option>
                                <option value="desc">Latest First (Desc)</option>
                            </Select>
                        </InputWrapper>
                        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                            <Button onClick={fetchReport} disabled={loading} style={{ height: "35px" }}>
                                {loading ? "..." : "Filter"}
                            </Button>
                            <Button 
                                onClick={handleExportExcel} 
                                disabled={loading || allSortedShifts.length === 0} 
                                style={{ height: "35px", background: "#16a34a", borderColor: "#16a34a", color: "#fff" }}
                            >
                                <FaFileExcel style={{ marginRight: "6px" }} /> Export Excel
                            </Button>
                            <Button onClick={handlePrint} secondary style={{ height: "35px" }}>
                                <FaPrint style={{ marginRight: "6px" }} /> Print
                            </Button>
                        </div>
                    </FormRow>
                </FilterSection>
            )}

            {/* PRINTABLE REPORT WRAPPER */}
            <div id="printable-report-area">
                {/* Formal Print Header for Print Engine */}
                <PrintTemplate>
                    <PrintHeader>
                        <h1>{hospital_name}</h1>
                        <p>{branch_name}</p>
                        <div className="report-title">SHIFT BASIS COLLECTION REPORT</div>
                        <p style={{ marginTop: "4px" }}>
                            <strong>Period:</strong> {dayjs(fromDate).format("DD/MM/YYYY")} to {dayjs(toDate).format("DD/MM/YYYY")} | <strong>Printed On:</strong> {dayjs().format("DD/MM/YYYY HH:mm:ss")}
                        </p>
                    </PrintHeader>
                </PrintTemplate>

                {loading ? (
                    <div style={{ padding: "80px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                        <Spin size="large" />
                        <span style={{ fontSize: "1rem", fontWeight: "600", color: "#64748b" }}>Loading Shift Basis Collection Report...</span>
                    </div>
                ) : (
                    <>
                        {/* ── VIEW TYPE: GROUPED CARDS ── */}
                        {viewType === "grouped" ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                {dateGroups.length > 0 ? (
                                    dateGroups.map((group) => (
                                        <div key={group.dateKey} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                            <DateSectionBanner>
                                                <div className="date-title">
                                                    <FaCalendarAlt /> Date: {group.displayDate}
                                                    <span className="shift-pill">
                                                        {group.shifts.length} {group.shifts.length === 1 ? "Shift" : "Shifts"}
                                                    </span>
                                                </div>
                                                <div className="date-metrics">
                                                    <span>Cash: ₹{formatINR(group.subtotals.cashColl)}</span>
                                                    <span>Card: ₹{formatINR(group.subtotals.cardColl)}</span>
                                                    {group.subtotals.creditColl > 0 && <span>Credit: ₹{formatINR(group.subtotals.creditColl)}</span>}
                                                    <span className="highlight">Total: ₹{formatINR(group.subtotals.totalColl)}</span>
                                                    <span style={{ color: colors.danger, fontWeight: "700" }}>Return: ₹{formatINR(group.subtotals.returnAmount)}</span>
                                                    <span style={{ fontWeight: "700" }}>Closing: ₹{formatINR(group.subtotals.closing)}</span>
                                                </div>
                                            </DateSectionBanner>

                                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                                {group.shifts.map((shift, sIdx) => (
                                                    <div key={`${shift.shiftno}-${sIdx}`} style={{ background: "white", borderRadius: "10px", border: `1px solid ${colors.border}`, overflow: "hidden" }}>
                                                        <div style={{ background: colors.surface, padding: "14px 18px", borderBottom: `2px solid ${colors.primary}`, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                                                            <div><SummaryLabel>Shift No</SummaryLabel><strong style={{ color: colors.primary }}>{shift.shiftno}</strong></div>
                                                            <div><SummaryLabel>Cashier</SummaryLabel><strong>{shift.User}</strong></div>
                                                            <div><SummaryLabel>Timing</SummaryLabel><span>{shift.StartTime} - {shift.EndTime}</span></div>
                                                            <div><SummaryLabel>Cash Coll</SummaryLabel><strong style={{ color: colors.success }}>₹{formatINR(shift.cashColl)}</strong></div>
                                                            <div><SummaryLabel>Card & Bank</SummaryLabel><span>₹{formatINR(shift.cardColl)}</span></div>
                                                            {shift.creditColl > 0 && <div><SummaryLabel>Credit / Scheme</SummaryLabel><span style={{ color: "#0284c7" }}>₹{formatINR(shift.creditColl)}</span></div>}
                                                            <div><SummaryLabel>Total Coll</SummaryLabel><strong style={{ color: colors.primary }}>₹{formatINR(shift.totalColl)}</strong></div>
                                                            <div><SummaryLabel>Sales Return</SummaryLabel><span style={{ color: colors.danger, fontWeight: "700" }}>₹{formatINR(shift.retAmt)}</span></div>
                                                            <div><SummaryLabel>Closing Bal</SummaryLabel><strong>₹{formatINR(shift.closeBal)}</strong></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: "center", padding: "40px", background: colors.surface, borderRadius: "10px", color: colors.textMuted }}>No shift records found.</div>
                                )}
                            </div>
                        ) : (
                            /* ── VIEW TYPE: SUMMARY TABLE ── */
                            <StyledTableWrapper>
                                <Table>
                                    <thead>
                                        <Tr>
                                            <Th>Date</Th>
                                            <Th>Shift No</Th>
                                            <Th>Cashier Name</Th>
                                            <Th>Start Time</Th>
                                            <Th>End Time</Th>
                                            <Th style={{ textAlign: "right" }}>Gross Cash</Th>
                                            <Th style={{ textAlign: "right", color: colors.danger }}>Expenses Paid</Th>
                                            <Th style={{ textAlign: "right", color: colors.danger }}>Sales Return</Th>
                                            <Th style={{ textAlign: "right" }}>Closing Bal</Th>
                                            <Th style={{ textAlign: "right" }}>Card & Bank</Th>
                                            <Th style={{ textAlign: "right", color: "#0284c7" }}>Credit / Scheme</Th>
                                            <Th style={{ textAlign: "right" }}>Total Coll.</Th>
                                            <Th style={{ textAlign: "center" }} className="hide-on-print action-column">Action</Th>
                                        </Tr>
                                    </thead>
                                    <tbody>
                                        {dateGroups.length > 0 ? (
                                            dateGroups.map((group) => (
                                                <React.Fragment key={group.dateKey}>
                                                    {/* Date Banner Header */}
                                                    <DateGroupRow className="date-group-header">
                                                        <td colSpan={13}>
                                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                                                <FaCalendarAlt style={{ color: colors.primary }} /> 
                                                                <strong>Date: {group.displayDate}</strong>
                                                                <span style={{ fontSize: "0.80rem", background: "#cbd5e1", color: "#0f172a", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                                                                    {group.shifts.length} {group.shifts.length === 1 ? "Shift" : "Shifts"}
                                                                </span>
                                                            </span>
                                                        </td>
                                                    </DateGroupRow>

                                                    {/* Counter Groups as SUB HEAD */}
                                                    {(group.counterGroups || []).map((cg) => (
                                                        <React.Fragment key={`${group.dateKey}-${cg.outletCode}`}>
                                                            {/* Counter Subhead Banner */}
                                                            <CounterSubheadRow className="counter-subhead-row">
                                                                <td colSpan={13}>
                                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                                                        <FaClinicMedical style={{ color: "#0d9488", fontSize: "0.95rem" }} />
                                                                        <strong>Counter: {getOutletName(cg.outletCode)}</strong>
                                                                        <span style={{ fontSize: "0.75rem", background: "#ccfbf1", color: "#0f766e", padding: "1px 7px", borderRadius: "8px", fontWeight: "600" }}>
                                                                            {cg.shifts.length} {cg.shifts.length === 1 ? "Shift" : "Shifts"}
                                                                        </span>
                                                                    </span>
                                                                </td>
                                                            </CounterSubheadRow>

                                                            {/* Shifts in this Counter */}
                                                            {cg.shifts.map((s, si) => (
                                                                <Tr key={`${s.shiftno}-${si}`}>
                                                                    <Td>{s.displayDate}</Td>
                                                                    <Td style={{ fontWeight: "700", color: colors.primary }}>{s.shiftno}</Td>
                                                                    <Td>{s.User}</Td>
                                                                    <Td style={{ fontSize: "0.85rem" }}>{s.StartTime}</Td>
                                                                    <Td style={{ fontSize: "0.85rem" }}>{s.EndTime || "Active"}</Td>
                                                                    <Td style={{ textAlign: "right", color: colors.success, fontWeight: "600" }}>₹{formatINR(s.cashColl)}</Td>
                                                                    <Td style={{ textAlign: "right", color: s.expensesPaid > 0 ? colors.danger : colors.textMuted, fontWeight: s.expensesPaid > 0 ? "700" : "normal" }}>
                                                                        {s.expensesPaid > 0 ? `-₹${formatINR(s.expensesPaid)}` : "₹0.00"}
                                                                    </Td>
                                                                    <Td style={{ textAlign: "right", color: s.retAmt > 0 ? colors.danger : colors.textMuted, fontWeight: s.retAmt > 0 ? "700" : "normal" }}>
                                                                        {s.retAmt > 0 ? `-₹${formatINR(s.retAmt)}` : "₹0.00"}
                                                                    </Td>
                                                                    <Td style={{ textAlign: "right", fontWeight: "700" }}>₹{formatINR(s.closeBal)}</Td>
                                                                    <Td style={{ textAlign: "right", color: "#6366f1" }}>₹{formatINR(s.cardColl)}</Td>
                                                                    <Td style={{ textAlign: "right", color: s.creditColl > 0 ? "#0284c7" : colors.textMuted, fontWeight: s.creditColl > 0 ? "600" : "normal" }}>
                                                                        ₹{formatINR(s.creditColl)}
                                                                    </Td>
                                                                    <Td style={{ textAlign: "right", fontWeight: "700", color: colors.primary }}>₹{formatINR(s.totalColl)}</Td>
                                                                    <Td style={{ textAlign: "center" }} className="hide-on-print action-column">
                                                                        <FaEye
                                                                            style={{ cursor: "pointer", color: colors.primary, fontSize: "1.1rem" }}
                                                                            title="Inspect shift bills & expense vouchers"
                                                                            onClick={() => {
                                                                                const shiftNum = String(s.shiftno || s.shift_no || "").trim();
                                                                                const shiftNumClean = shiftNum.replace(/\//g, "");
                                                                                const bills = reportBills.filter(b => {
                                                                                    const bShift = String(b.shift_no || b.shiftno || "").trim();
                                                                                    return bShift === shiftNum || bShift.replace(/\//g, "") === shiftNumClean;
                                                                                });
                                                                                const expenses = reportExpenses.filter(e => {
                                                                                    const eShift = String(e.shift_no || e.shiftno || "").trim();
                                                                                    return eShift === shiftNum || eShift.replace(/\//g, "") === shiftNumClean;
                                                                                });
                                                                                setSelectedShiftBills({
                                                                                    shiftno: s.shiftno,
                                                                                    cashier: s.User,
                                                                                    gross_cash: s.cashColl,
                                                                                    expenses_paid: s.expensesPaid,
                                                                                    sales_return: s.retAmt,
                                                                                    closing_bal: s.closeBal,
                                                                                    card_coll: s.cardColl,
                                                                                    credit_coll: s.creditColl,
                                                                                    total_coll: s.totalColl,
                                                                                    bills,
                                                                                    expenses
                                                                                });
                                                                            }}
                                                                        />
                                                                    </Td>
                                                                </Tr>
                                                            ))}

                                                            {/* Counter Subtotal Row if multiple counters in this date */}
                                                            {group.counterGroups.length > 1 && (
                                                                <CounterSubtotalRow className="counter-subtotal-row">
                                                                    <Td colSpan={5} style={{ textAlign: "right", fontWeight: "600" }}>
                                                                        Subtotal for {getOutletName(cg.outletCode)} ({cg.shifts.length} {cg.shifts.length === 1 ? "Shift" : "Shifts"}):
                                                                    </Td>
                                                                    <Td style={{ textAlign: "right", fontWeight: "600", color: colors.success }}>₹{formatINR(cg.subtotals.cashColl)}</Td>
                                                                    <Td style={{ textAlign: "right", fontWeight: "600", color: colors.danger }}>
                                                                        {cg.subtotals.expensesPaid > 0 ? `-₹${formatINR(cg.subtotals.expensesPaid)}` : "₹0.00"}
                                                                    </Td>
                                                                    <Td style={{ textAlign: "right", fontWeight: "600", color: colors.danger }}>
                                                                        {cg.subtotals.returnAmount > 0 ? `-₹${formatINR(cg.subtotals.returnAmount)}` : "₹0.00"}
                                                                    </Td>
                                                                    <Td style={{ textAlign: "right", fontWeight: "600" }}>₹{formatINR(cg.subtotals.closing)}</Td>
                                                                    <Td style={{ textAlign: "right", fontWeight: "600", color: "#6366f1" }}>₹{formatINR(cg.subtotals.cardColl)}</Td>
                                                                    <Td style={{ textAlign: "right", fontWeight: "600", color: "#0284c7" }}>₹{formatINR(cg.subtotals.creditColl)}</Td>
                                                                    <Td style={{ textAlign: "right", fontWeight: "700", color: colors.primary }}>₹{formatINR(cg.subtotals.totalColl)}</Td>
                                                                    <Td className="hide-on-print action-column"></Td>
                                                                </CounterSubtotalRow>
                                                            )}
                                                        </React.Fragment>
                                                    ))}

                                                    {/* Date Subtotal Row */}
                                                    <SubtotalRow className="subtotal-row">
                                                        <Td colSpan={5} style={{ textAlign: "right", fontWeight: "700" }}>
                                                            Subtotal for {group.displayDate} ({group.shifts.length} {group.shifts.length === 1 ? "Shift" : "Shifts"}):
                                                        </Td>
                                                        <Td style={{ textAlign: "right", fontWeight: "700", color: colors.success }}>₹{formatINR(group.subtotals.cashColl)}</Td>
                                                        <Td style={{ textAlign: "right", fontWeight: "700", color: colors.danger }}>
                                                            {group.subtotals.expensesPaid > 0 ? `-₹${formatINR(group.subtotals.expensesPaid)}` : "₹0.00"}
                                                        </Td>
                                                        <Td style={{ textAlign: "right", fontWeight: "700", color: colors.danger }}>
                                                            {group.subtotals.returnAmount > 0 ? `-₹${formatINR(group.subtotals.returnAmount)}` : "₹0.00"}
                                                        </Td>
                                                        <Td style={{ textAlign: "right", fontWeight: "700" }}>₹{formatINR(group.subtotals.closing)}</Td>
                                                        <Td style={{ textAlign: "right", fontWeight: "700", color: "#6366f1" }}>₹{formatINR(group.subtotals.cardColl)}</Td>
                                                        <Td style={{ textAlign: "right", fontWeight: "700", color: "#0284c7" }}>₹{formatINR(group.subtotals.creditColl)}</Td>
                                                        <Td style={{ textAlign: "right", fontWeight: "800", color: colors.primary }}>₹{formatINR(group.subtotals.totalColl)}</Td>
                                                        <Td className="hide-on-print action-column"></Td>
                                                    </SubtotalRow>
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={13} style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                                                    No shift records found for the selected criteria.
                                                </Td>
                                            </Tr>
                                        )}
                                    </tbody>
                                    {dateGroups.length > 0 && (
                                        <tfoot>
                                            <GrandTotalRow className="grand-total-row">
                                                <Td colSpan={5} style={{ textAlign: "right", fontWeight: "800" }}>
                                                    GRAND TOTAL ({grandTotals.shiftsCount} Shifts across {dateGroups.length} Dates):
                                                </Td>
                                                <Td style={{ textAlign: "right", color: colors.success, fontWeight: "800" }}>₹{formatINR(grandTotals.cashColl)}</Td>
                                                <Td style={{ textAlign: "right", color: colors.danger, fontWeight: "800" }}>
                                                    {grandTotals.expensesPaid > 0 ? `-₹${formatINR(grandTotals.expensesPaid)}` : "₹0.00"}
                                                </Td>
                                                <Td style={{ textAlign: "right", color: colors.danger, fontWeight: "800" }}>
                                                    {grandTotals.returnAmount > 0 ? `-₹${formatINR(grandTotals.returnAmount)}` : "₹0.00"}
                                                </Td>
                                                <Td style={{ textAlign: "right", fontWeight: "800" }}>₹{formatINR(grandTotals.closing)}</Td>
                                                <Td style={{ textAlign: "right", color: "#6366f1", fontWeight: "800" }}>₹{formatINR(grandTotals.cardColl)}</Td>
                                                <Td style={{ textAlign: "right", color: "#0284c7", fontWeight: "800" }}>₹{formatINR(grandTotals.creditColl)}</Td>
                                                <Td style={{ textAlign: "right", color: colors.primary, fontWeight: "800" }}>₹{formatINR(grandTotals.totalColl)}</Td>
                                                <Td className="hide-on-print action-column"></Td>
                                            </GrandTotalRow>
                                        </tfoot>
                                    )}
                                </Table>
                            </StyledTableWrapper>
                        )}
                    </>
                )}

                <PrintTemplate>
                    <PrintSignatures>
                        <div className="sig-box">Prepared By (Cashier)</div>
                        <div className="sig-box">Accounts Officer</div>
                        <div className="sig-box">Authorized Signatory</div>
                    </PrintSignatures>
                </PrintTemplate>
            </div>

            {/* ── SHIFT BILLS BREAKDOWN MODAL ── */}
            {selectedShiftBills && (
                <Modal
                    title={<h4 style={{ margin: 0, color: colors.primary }}>Shift Audit Breakdown — Shift: {selectedShiftBills.shiftno} ({selectedShiftBills.cashier})</h4>}
                    open={Boolean(selectedShiftBills)}
                    onCancel={() => setSelectedShiftBills(null)}
                    footer={null}
                    width="85vw"
                    style={{ top: 20 }}
                    zIndex={1200}
                >
                    <div style={{ maxHeight: "70vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* Summary Bar */}
                        <div style={{ display: "flex", gap: "12px", background: "#f8fafc", padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: "120px" }}>
                                <SummaryLabel>Gross Cash</SummaryLabel>
                                <strong style={{ color: colors.success, fontSize: "1.05rem" }}>₹{formatINR(selectedShiftBills.gross_cash)}</strong>
                            </div>
                            <div style={{ flex: 1, minWidth: "120px" }}>
                                <SummaryLabel>Expenses Paid</SummaryLabel>
                                <strong style={{ color: colors.danger, fontSize: "1.05rem" }}>
                                    {selectedShiftBills.expenses_paid > 0 ? `-₹${formatINR(selectedShiftBills.expenses_paid)}` : "₹0.00"}
                                </strong>
                            </div>
                            <div style={{ flex: 1, minWidth: "120px" }}>
                                <SummaryLabel>Sales Returns</SummaryLabel>
                                <strong style={{ color: colors.danger, fontSize: "1.05rem" }}>
                                    {selectedShiftBills.sales_return > 0 ? `-₹${formatINR(selectedShiftBills.sales_return)}` : "₹0.00"}
                                </strong>
                            </div>
                            <div style={{ flex: 1, minWidth: "120px" }}>
                                <SummaryLabel>Net Cash Handover</SummaryLabel>
                                <strong style={{ color: colors.primary, fontSize: "1.05rem" }}>₹{formatINR(selectedShiftBills.closing_bal)}</strong>
                            </div>
                            <div style={{ flex: 1, minWidth: "120px" }}>
                                <SummaryLabel>Card & Bank</SummaryLabel>
                                <strong style={{ color: "#6366f1", fontSize: "1.05rem" }}>₹{formatINR(selectedShiftBills.card_coll || 0)}</strong>
                            </div>
                            <div style={{ flex: 1, minWidth: "120px" }}>
                                <SummaryLabel>Credit / Scheme</SummaryLabel>
                                <strong style={{ color: "#0284c7", fontSize: "1.05rem" }}>₹{formatINR(selectedShiftBills.credit_coll || 0)}</strong>
                            </div>
                            <div style={{ flex: 1, minWidth: "120px" }}>
                                <SummaryLabel>Total Revenue</SummaryLabel>
                                <strong style={{ color: colors.primary, fontSize: "1.05rem" }}>₹{formatINR(selectedShiftBills.total_coll || 0)}</strong>
                            </div>
                        </div>

                        {/* Counter Expense Payments Section */}
                        {selectedShiftBills.expenses && selectedShiftBills.expenses.length > 0 && (
                            <div>
                                <h5 style={{ margin: "0 0 8px 0", color: colors.danger, fontWeight: "700" }}>Counter Expense Payment Vouchers ({selectedShiftBills.expenses.length})</h5>
                                <TableWrapper>
                                    <Table>
                                        <thead>
                                            <Tr style={{ background: "#fef2f2" }}>
                                                <Th>Voucher No</Th>
                                                <Th>Date & Time</Th>
                                                <Th>Cashier</Th>
                                                <Th>Account Head</Th>
                                                <Th>Description</Th>
                                                <Th style={{ textAlign: "right" }}>Amount (₹)</Th>
                                            </Tr>
                                        </thead>
                                        <tbody>
                                            {selectedShiftBills.expenses.map((ev, idx) => (
                                                <Tr key={idx}>
                                                    <Td style={{ fontWeight: "700", color: colors.danger }}>{ev.voucher_no}</Td>
                                                    <Td style={{ fontSize: "0.8rem" }}>{ev.date}</Td>
                                                    <Td>{ev.cashier_name || ev.cashier_id || selectedShiftBills.cashier}</Td>
                                                    <Td><strong>{ev.account_head || "Counter Expense"}</strong></Td>
                                                    <Td>{ev.description || "Cashier Payment Voucher"}</Td>
                                                    <Td style={{ textAlign: "right", fontWeight: "700", color: colors.danger }}>₹{formatINR(ev.amount)}</Td>
                                                </Tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <Tr style={{ background: "#fee2e2", fontWeight: "700" }}>
                                                <Td colSpan={5} style={{ textAlign: "right" }}>Total Expenses Paid:</Td>
                                                <Td style={{ textAlign: "right", color: colors.danger, fontWeight: "800" }}>
                                                    ₹{formatINR(selectedShiftBills.expenses.reduce((a, ev) => a + cleanNum(ev.amount), 0))}
                                                </Td>
                                            </Tr>
                                        </tfoot>
                                    </Table>
                                </TableWrapper>
                            </div>
                        )}

                        {/* Sales Returns & Refunds Section */}
                        {(() => {
                            const returnBills = (selectedShiftBills.bills || []).filter(b => b.is_sales_return || b.category === "Sales Return" || b.category === "REFUND" || cleanNum(b.return_amount) > 0 || cleanNum(b.sales_return) > 0 || cleanNum(b.refund_amount) > 0);
                            if (returnBills.length === 0 && selectedShiftBills.sales_return <= 0) return null;
                            return (
                                <div>
                                    <h5 style={{ margin: "0 0 8px 0", color: "#ea580c", fontWeight: "700" }}>Sales Return & Refund Payouts ({returnBills.length})</h5>
                                    <TableWrapper>
                                        <Table>
                                            <thead>
                                                <Tr style={{ background: "#fff7ed" }}>
                                                    <Th>Return / Bill No</Th>
                                                    <Th>Date & Time</Th>
                                                    <Th>UHID</Th>
                                                    <Th>Particulars / Patient</Th>
                                                    <Th>Payment Mode</Th>
                                                    <Th style={{ textAlign: "right" }}>Return Amount (₹)</Th>
                                                </Tr>
                                            </thead>
                                            <tbody>
                                                {returnBills.length > 0 ? (
                                                    returnBills.map((rb, idx) => (
                                                        <Tr key={idx}>
                                                            <Td style={{ fontWeight: "700", color: "#ea580c" }}>{rb.bill_no}</Td>
                                                            <Td style={{ fontSize: "0.8rem" }}>{rb.date}</Td>
                                                            <Td>{rb.uhid || "-"}</Td>
                                                            <Td><strong>{rb.patient_name || "Sales Return - Pharmacy"}</strong></Td>
                                                            <Td>{rb.payment_mode || "Cash"}</Td>
                                                            <Td style={{ textAlign: "right", fontWeight: "700", color: "#ea580c" }}>
                                                                ₹{formatINR(cleanNum(rb.return_amount || rb.sales_return || rb.amount || Math.abs(rb.cash)))}
                                                            </Td>
                                                        </Tr>
                                                    ))
                                                ) : (
                                                    <Tr>
                                                        <Td colSpan={5}>Shift Sales Return Amount</Td>
                                                        <Td style={{ textAlign: "right", fontWeight: "700", color: "#ea580c" }}>
                                                            ₹{formatINR(selectedShiftBills.sales_return)}
                                                        </Td>
                                                    </Tr>
                                                )}
                                            </tbody>
                                            <tfoot>
                                                <Tr style={{ background: "#ffedd5", fontWeight: "700" }}>
                                                    <Td colSpan={5} style={{ textAlign: "right" }}>Total Sales Returns Paid:</Td>
                                                    <Td style={{ textAlign: "right", color: "#ea580c", fontWeight: "800" }}>
                                                        ₹{formatINR(returnBills.length > 0 ? returnBills.reduce((a, rb) => a + cleanNum(rb.return_amount || rb.sales_return || rb.amount || Math.abs(rb.cash)), 0) : selectedShiftBills.sales_return)}
                                                    </Td>
                                                </Tr>
                                            </tfoot>
                                        </Table>
                                    </TableWrapper>
                                </div>
                            );
                        })()}

                        {/* Itemized Bills Section */}
                        {(() => {
                            const incomeBills = (selectedShiftBills.bills || []).filter(b => !(b.is_sales_return || b.category === "Sales Return" || b.category === "REFUND" || cleanNum(b.return_amount) > 0 || cleanNum(b.sales_return) > 0 || cleanNum(b.refund_amount) > 0));
                            return (
                                <div>
                                    <h5 style={{ margin: "0 0 8px 0", color: colors.primary, fontWeight: "700" }}>Itemized Patient Collection Bills ({incomeBills.length})</h5>
                                    <TableWrapper>
                                        <Table>
                                            <thead>
                                                <Tr>
                                                    <Th>#</Th>
                                                    <Th>Bill No</Th>
                                                    <Th>Date & Time</Th>
                                                    <Th>Category</Th>
                                                    <Th>UHID</Th>
                                                    <Th>Patient Name</Th>
                                                    <Th>Payment Mode</Th>
                                                    <Th style={{ textAlign: "right" }}>Cash (₹)</Th>
                                                    <Th style={{ textAlign: "right" }}>Card / Bank (₹)</Th>
                                                    <Th style={{ textAlign: "right" }}>Credit (₹)</Th>
                                                    <Th style={{ textAlign: "right" }}>Gross Total (₹)</Th>
                                                </Tr>
                                            </thead>
                                            <tbody>
                                                {incomeBills.length > 0 ? (
                                                    incomeBills.map((b, idx) => (
                                                        <Tr key={idx}>
                                                            <Td>{idx + 1}</Td>
                                                            <Td style={{ fontWeight: "700" }}>{b.bill_no}</Td>
                                                            <Td style={{ fontSize: "0.8rem" }}>{b.date}</Td>
                                                            <Td><span style={{ padding: "2px 8px", borderRadius: "6px", background: "#f1f5f9", fontSize: "0.75rem", fontWeight: "600" }}>{b.category}</span></Td>
                                                            <Td>{b.uhid || "-"}</Td>
                                                            <Td><strong>{b.patient_name || "General"}</strong></Td>
                                                            <Td>{b.payment_mode || "Cash"}</Td>
                                                            <Td style={{ textAlign: "right" }}>{formatINR(b.cash)}</Td>
                                                            <Td style={{ textAlign: "right" }}>{formatINR(b.bank)}</Td>
                                                            <Td style={{ textAlign: "right" }}>{formatINR(b.credit)}</Td>
                                                            <Td style={{ textAlign: "right", fontWeight: "700", color: colors.primary }}>{formatINR(b.gross || b.net_amount)}</Td>
                                                        </Tr>
                                                    ))
                                                ) : (
                                                    <Tr>
                                                        <Td colSpan="11" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                                            No itemized collection bills recorded under this shift.
                                                        </Td>
                                                    </Tr>
                                                )}
                                            </tbody>
                                            {incomeBills.length > 0 && (
                                                <tfoot>
                                                    <Tr style={{ background: "#f8fafc", fontWeight: "700" }}>
                                                        <Td colSpan={7} style={{ textAlign: "right" }}>Total for Shift ({incomeBills.length} Bills):</Td>
                                                        <Td style={{ textAlign: "right", color: colors.success }}>₹{formatINR(incomeBills.reduce((a, b) => a + cleanNum(b.cash), 0))}</Td>
                                                        <Td style={{ textAlign: "right", color: "#6366f1" }}>₹{formatINR(incomeBills.reduce((a, b) => a + cleanNum(b.bank), 0))}</Td>
                                                        <Td style={{ textAlign: "right", color: "#0284c7" }}>₹{formatINR(incomeBills.reduce((a, b) => a + cleanNum(b.credit), 0))}</Td>
                                                        <Td style={{ textAlign: "right", color: colors.primary, fontWeight: "800" }}>₹{formatINR(incomeBills.reduce((a, b) => a + cleanNum(b.gross || b.net_amount), 0))}</Td>
                                                    </Tr>
                                                </tfoot>
                                            )}
                                        </Table>
                                    </TableWrapper>
                                </div>
                            );
                        })()}
                    </div>
                </Modal>
            )}
        </StyledPageWrapper>
    );
};

export default MasterShiftBasisReport;
