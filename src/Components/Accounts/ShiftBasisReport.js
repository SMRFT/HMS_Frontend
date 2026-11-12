import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { 
    FaEye, 
    FaPrint, 
    FaFileExcel, 
    FaCalendarAlt 
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
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalTitle,
    ModalBody,
    CloseButton,
} from "../GlobalStyles";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { printAccountsReport } from "./printAccountsReport";

// ─── STYLED COMPONENTS ───────────────────────────────────────────────────────
const SummaryLabel = styled.p`
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const FilterSection = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const DateGroupRow = styled.tr`
    background: #f1f5f9 !important;
    font-weight: 700;
    color: #1e293b;
    border-top: 2px solid #cbd5e1;
    border-bottom: 1px solid #cbd5e1;

    td {
        padding: 9px 12px !important;
        font-size: 0.88rem !important;
        letter-spacing: 0.3px;
    }
`;

const SubtotalRow = styled.tr`
    background: #f8fafc !important;
    font-weight: 700;
    color: #0f172a;
    border-top: 1px solid #94a3b8;
    border-bottom: 2px solid #64748b;

    td {
        padding: 8px 8px !important;
        font-size: 0.82rem !important;
    }
`;

const GrandTotalRow = styled.tr`
    background: #e2e8f0 !important;
    font-weight: 800;
    color: #000000;
    border-top: 2px solid #000;
    border-bottom: 3px double #000;

    td {
        padding: 10px 8px !important;
        font-size: 0.86rem !important;
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
        font-size: 1.05rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .shift-pill {
        font-size: 0.75rem;
        background: rgba(255, 255, 255, 0.22);
        padding: 3px 10px;
        border-radius: 12px;
        font-weight: 600;
    }

    .date-metrics {
        font-size: 0.82rem;
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

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────
const parseDateKey = (s) => {
    if (!s) return "UNKNOWN_DATE";
    const dateStr = String(s.raw_date || s.date || "").trim();
    if (!dateStr) return "UNKNOWN_DATE";
    // Check if YYYY-MM-DD
    const yyyymmdd = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (yyyymmdd) {
        const [, y, m, d] = yyyymmdd;
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    // Check if DD/MM/YYYY
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
    const sA = String(a.shiftno || "").trim();
    const sB = String(b.shiftno || "").trim();
    return sA.localeCompare(sB, undefined, { numeric: true, sensitivity: "base" });
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────
const ShiftBasisReport = ({ isModalView = false, startDate, endDate, initialOutlet = "all" }) => {
    const location = useLocation();
    const [fromDate, setFromDate] = useState(startDate || location.state?.startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || location.state?.endDate || format(new Date(), "yyyy-MM-dd"));
    const [outlet, setOutlet] = useState(location.state?.outlet || initialOutlet || "all");
    const [outlets, setOutlets] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [summaryData, setSummaryData] = useState([]);
    const [viewType, setViewType] = useState("summary"); // "summary", "grouped"
    const [sortOrder, setSortOrder] = useState("asc"); // "asc" (chronological) | "desc" (latest first)
    const [shiftNo, setShiftNo] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [selectedShiftBills, setSelectedShiftBills] = useState(null);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_code = localStorage.getItem("hospital_code") || "SH001";
    const branch_code = localStorage.getItem("selected_branch") || "SHB001";
    const user_id = localStorage.getItem("employeeId");
    const hospital_name = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL";
    const branch_name = localStorage.getItem("branch_name") || "Main Branch";

    const fetchOutlets = useCallback(async () => {
        try {
            const response = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
            if (response.success && response.data) {
                setOutlets(response.data);
            }
        } catch (error) {
            console.error("Error fetching outlets:", error);
        }
    }, [HmsBaseUrl]);

    const getOutletName = useCallback((code) => {
        if (!code) return '-';
        const found = outlets.find(o => String(o.outlet_code) === String(code) || String(o.outlet_id) === String(code) || String(o.id) === String(code));
        return found ? (found.outlet_name || found.name) : code;
    }, [outlets]);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const payload = {
                from_date: fromDate,
                to_date: toDate,
                outlet_code: outlet,
                shiftno: shiftNo,
                "auth-hospital-code": hospital_code,
                "auth-branch-code": branch_code,
                "auth-user-id": user_id
            };

            // Fetch Detailed Report
            const detailedRes = await apiRequest(`${HmsBaseUrl}shift_basis_accounts_report/`, "POST", payload);
            if (detailedRes.success && detailedRes.data.success) {
                setReportData(detailedRes.data.data);
            }

            // Fetch Summary Report
            const summaryRes = await apiRequest(`${HmsBaseUrl}get_shift_summary_report/`, "POST", payload);
            if (summaryRes.success && summaryRes.data.success) {
                setSummaryData(summaryRes.data.data);
            }

        } catch (error) {
            toast.error("Error fetching report");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, outlet, shiftNo, hospital_code, branch_code, user_id, HmsBaseUrl]);

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
    }, [fromDate, toDate, outlet, shiftNo, viewType, fetchOutlets, fetchReport]);

    const handlePrint = () => {
        printAccountsReport("printable-report-area", "landscape");
    };

    // ─── DATE-WISE AND SHIFT-NUMBER-WISE GROUPING & SORTING ───────────────────
    const { dateGroups, grandTotals, allSortedShifts } = useMemo(() => {
        const safeSummary = Array.isArray(summaryData) ? summaryData : [];
        const groupsMap = {};

        safeSummary.forEach((s) => {
            const dateKey = parseDateKey(s);
            const displayDate = formatDisplayDate(s);

            if (!groupsMap[dateKey]) {
                groupsMap[dateKey] = {
                    dateKey,
                    displayDate,
                    shifts: [],
                    subtotals: {
                        opening: 0,
                        cashColl: 0,
                        creditColl: 0,
                        totalColl: 0,
                        closing: 0,
                        returnAmount: 0
                    }
                };
            }

            const openBal = parseFloat(s.OpeningBalance || 0);
            const cash = parseFloat(s.collected_Amount || 0);
            const credit = parseFloat(s.CreditAmount || s.credit_amount || 0);
            const totalCol = cash + credit;
            const closeBal = parseFloat(s.ClosingBalance || 0);
            const ret = parseFloat(s.SalesReturnAmount || 0);

            const shiftBills = Array.isArray(reportData) ? reportData.filter(b => b.shiftno === s.shiftno) : [];

            const enrichedShift = {
                ...s,
                displayDate,
                openBal,
                cashColl: cash,
                creditColl: credit,
                totalColl: totalCol,
                closeBal,
                retAmt: ret,
                bills: shiftBills
            };

            groupsMap[dateKey].shifts.push(enrichedShift);

            // Date Subtotals
            const sub = groupsMap[dateKey].subtotals;
            sub.opening += openBal;
            sub.cashColl += cash;
            sub.creditColl += credit;
            sub.totalColl += totalCol;
            sub.closing += closeBal;
            sub.returnAmount += ret;
        });

        // 1. Sort shifts within each date group properly by shift number
        Object.values(groupsMap).forEach(g => {
            g.shifts.sort(compareShiftNo);
        });

        // 2. Sort date groups by dateKey (chronological ascending or reverse descending)
        const sortedGroups = Object.values(groupsMap).sort((a, b) => {
            if (sortOrder === "asc") {
                return a.dateKey.localeCompare(b.dateKey);
            } else {
                return b.dateKey.localeCompare(a.dateKey);
            }
        });

        // 3. Flat array of all shifts properly ordered Date-wise and Shift-Number-wise
        const flatShifts = [];
        sortedGroups.forEach(g => {
            flatShifts.push(...g.shifts);
        });

        // 4. Grand Totals across all dates and shifts
        const gTotals = {
            shiftsCount: flatShifts.length,
            opening: 0,
            cashColl: 0,
            creditColl: 0,
            totalColl: 0,
            closing: 0,
            returnAmount: 0
        };

        sortedGroups.forEach(g => {
            gTotals.opening += g.subtotals.opening;
            gTotals.cashColl += g.subtotals.cashColl;
            gTotals.creditColl += g.subtotals.creditColl;
            gTotals.totalColl += g.subtotals.totalColl;
            gTotals.closing += g.subtotals.closing;
            gTotals.returnAmount += g.subtotals.returnAmount;
        });

        return {
            dateGroups: sortedGroups,
            grandTotals: gTotals,
            allSortedShifts: flatShifts
        };
    }, [summaryData, reportData, sortOrder]);

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
                "Credit Collection (₹)": Number(s.creditColl.toFixed(2)),
                "Total Collection (₹)": Number(s.totalColl.toFixed(2)),
                "Sales Return (₹)": Number(s.retAmt.toFixed(2)),
                "Closing Balance (₹)": Number(s.closeBal.toFixed(2)),
                "Status": (s.ShiftStatus || "").toUpperCase()
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);
            ws["!cols"] = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
            XLSX.utils.book_append_sheet(wb, ws, "Shift Summary");

            // Itemized transactions sheet
            if (reportData && reportData.length > 0) {
                // Sort itemized transactions by shiftno as well
                const sortedReportData = [...reportData].sort((a, b) => {
                    const cmp = String(a.shiftno || "").localeCompare(String(b.shiftno || ""), undefined, { numeric: true });
                    if (cmp !== 0) return cmp;
                    return String(a.bill_date || "").localeCompare(String(b.bill_date || ""));
                });

                const detailedRows = sortedReportData.map((b, idx) => ({
                    "S.No": idx + 1,
                    "Shift No": b.shiftno || "",
                    "Bill Date": b.bill_date ? format(new Date(b.bill_date), "dd/MM/yyyy HH:mm") : "",
                    "Bill No": b.bill_no || "",
                    "UHID / OP No": b.uhid || "",
                    "Patient Name": b.patient_name || "",
                    "Type": b.type_name || b.type || "",
                    "Payment Mode": b.payment_mode || "",
                    "Amount (₹)": Number(parseFloat(b.display_amount || b.net_amount || 0).toFixed(2)),
                    "Cashier": b.cashier_name || ""
                }));
                const wsDet = XLSX.utils.json_to_sheet(detailedRows);
                wsDet["!cols"] = Object.keys(detailedRows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
                XLSX.utils.book_append_sheet(wb, wsDet, "Itemized Transactions");
            }

            XLSX.writeFile(wb, `Shift_Basis_Accounts_Report_${fromDate}_to_${toDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    return (
        <>
            <PageWrapper style={isModalView ? { padding: 0 } : {}}>

                {!isModalView && (
                    <SectionTitle>
                        <h3>Shift Basis Accounts Report</h3>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                            {shiftNo ? `Report for Shift: ${shiftNo}` : `Range: ${dayjs(fromDate).format("DD MMM YYYY")} to ${dayjs(toDate).format("DD MMM YYYY")}`}
                        </p>
                    </SectionTitle>
                )}

                {/* FILTER CONTROLS */}
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
                                        {o.outlet_name}
                                    </option>
                                ))}
                            </Select>
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Shift No</Label>
                            <Input
                                type="text"
                                placeholder="e.g. 2627/000001"
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
                                <option value="grouped">Shift Wise Report</option>
                            </Select>
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Date Order</Label>
                            <Select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="asc">Oldest Date First (Chronological)</option>
                                <option value="desc">Newest Date First (Reverse)</option>
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

                {/* ── VIEW TYPE: GROUPED (SHIFT WISE REPORT) ────────────────────── */}
                {viewType === "grouped" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                        {dateGroups.length > 0 ? (
                            dateGroups.map((group) => (
                                <div key={group.dateKey} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {/* DATE BANNER */}
                                    <DateSectionBanner>
                                        <div className="date-title">
                                            <FaCalendarAlt /> Date: {group.displayDate}
                                            <span className="shift-pill">
                                                {group.shifts.length} {group.shifts.length === 1 ? "Shift" : "Shifts"}
                                            </span>
                                        </div>
                                        <div className="date-metrics">
                                            <span>Opening: ₹{group.subtotals.opening.toFixed(2)}</span>
                                            <span>Cash Coll: ₹{group.subtotals.cashColl.toFixed(2)}</span>
                                            <span>Credit Coll: ₹{group.subtotals.creditColl.toFixed(2)}</span>
                                            <span className="highlight">Total Coll: ₹{group.subtotals.totalColl.toFixed(2)}</span>
                                            <span style={{ color: colors.danger, fontWeight: "700" }}>Sales Return: ₹{group.subtotals.returnAmount.toFixed(2)}</span>
                                            <span style={{ fontWeight: "700" }}>Closing Bal: ₹{group.subtotals.closing.toFixed(2)}</span>
                                        </div>
                                    </DateSectionBanner>

                                    {/* SHIFTS WITHIN THIS DATE */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                        {group.shifts.map((shift, sIdx) => (
                                            <div key={`${shift.shiftno}-${sIdx}`} className="grouped-shift-item" style={{ background: "white", borderRadius: "12px", border: `1px solid ${colors.border}`, overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                                                {/* SHIFT HEADER */}
                                                <div style={{ background: colors.surface, padding: "18px 20px", borderBottom: `2px solid ${colors.primary}`, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "14px" }}>
                                                    <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                            <h4 style={{ margin: 0, color: colors.primary, fontSize: "1.1rem" }}>SHIFT: {shift.shiftno}</h4>
                                                            <span style={{ fontSize: "0.75rem", color: colors.textMuted, fontWeight: "600" }}>Cashier: {shift.User}</span>
                                                        </div>
                                                        <span style={{ fontSize: "0.8rem", fontWeight: "700", padding: "4px 12px", borderRadius: "15px", background: shift.ShiftStatus === 'active' ? "#dcfce7" : "#f1f5f9", color: shift.ShiftStatus === 'active' ? "#166534" : "#475569" }}>
                                                            {shift.ShiftStatus.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <SummaryLabel>Date</SummaryLabel>
                                                        <div style={{ fontWeight: "700" }}>{shift.displayDate}</div>
                                                    </div>
                                                    <div>
                                                        <SummaryLabel>Opening Bal</SummaryLabel>
                                                        <div style={{ fontWeight: "700" }}>₹{shift.openBal.toFixed(2)}</div>
                                                    </div>
                                                    <div>
                                                        <SummaryLabel>Cash Coll.</SummaryLabel>
                                                        <div style={{ fontWeight: "700", color: colors.success }}>₹{shift.cashColl.toFixed(2)}</div>
                                                    </div>
                                                    <div>
                                                        <SummaryLabel>Credit Coll.</SummaryLabel>
                                                        <div style={{ fontWeight: "700", color: "#0284c7" }}>₹{shift.creditColl.toFixed(2)}</div>
                                                    </div>
                                                    <div>
                                                        <SummaryLabel>Total Coll.</SummaryLabel>
                                                        <div style={{ fontWeight: "700", color: colors.primary }}>₹{shift.totalColl.toFixed(2)}</div>
                                                    </div>
                                                    <div>
                                                        <SummaryLabel>Sales Return</SummaryLabel>
                                                        <div style={{ fontWeight: "700", color: colors.danger }}>₹{shift.retAmt.toFixed(2)}</div>
                                                    </div>
                                                    <div>
                                                        <SummaryLabel>Closing Bal</SummaryLabel>
                                                        <div style={{ fontWeight: "700" }}>₹{shift.closeBal.toFixed(2)}</div>
                                                    </div>
                                                    <div>
                                                        <SummaryLabel>Counter</SummaryLabel>
                                                        <div style={{ fontWeight: "700" }}>{getOutletName(shift.SelectedOutlet)}</div>
                                                    </div>
                                                    <div>
                                                        <SummaryLabel>Duration</SummaryLabel>
                                                        <div style={{ fontSize: "0.75rem", fontWeight: "600" }}>{shift.StartTime} - {shift.EndTime || "Active"}</div>
                                                    </div>
                                                </div>

                                                {/* BILLS TABLE */}
                                                <div style={{ padding: "10px" }}>
                                                    <Table style={{ border: "none", boxShadow: "none" }}>
                                                        <thead>
                                                            <Tr style={{ background: "#f8fafc" }}>
                                                                <Th style={{ padding: "8px" }}>Type</Th>
                                                                <Th style={{ padding: "8px" }}>Bill No</Th>
                                                                <Th style={{ padding: "8px" }}>Patient</Th>
                                                                <Th style={{ padding: "8px", textAlign: "right" }}>Amount</Th>
                                                                <Th style={{ padding: "8px" }}>Mode</Th>
                                                                <Th style={{ padding: "8px" }}>Cashier</Th>
                                                                <Th style={{ padding: "8px", textAlign: "center" }}>View</Th>
                                                            </Tr>
                                                        </thead>
                                                        <tbody>
                                                            {shift.bills.map((b, bi) => (
                                                                <Tr key={bi}>
                                                                    <Td style={{ padding: "8px" }}>
                                                                        <span style={{ fontSize: "0.6rem", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", backgroundColor: b.type === 'Pharmacy' ? "#dcfce7" : b.type === 'Investigation' ? "#dbeafe" : "#fef3c7", color: b.type === 'Pharmacy' ? "#166534" : b.type === 'Investigation' ? "#1e40af" : "#92400e" }}>{b.type}</span>
                                                                    </Td>
                                                                    <Td style={{ padding: "8px" }}>{b.bill_no}</Td>
                                                                    <Td style={{ padding: "8px" }}>
                                                                        <div style={{ fontSize: "0.8rem", fontWeight: "600" }}>{b.patient_name}</div>
                                                                        <div style={{ fontSize: "0.65rem", color: colors.textMuted }}>{b.uhid}</div>
                                                                    </Td>
                                                                    <Td style={{ padding: "8px", textAlign: "right", fontWeight: "700", color: b.display_amount < 0 ? colors.danger : colors.textMain }}>₹{(b.net_amount || 0).toFixed(2)}</Td>
                                                                    <Td style={{ padding: "8px", fontSize: "0.75rem" }}>{b.payment_mode}</Td>
                                                                    <Td style={{ padding: "8px", fontSize: "0.75rem" }}>{b.cashier_name}</Td>
                                                                    <Td style={{ padding: "8px", textAlign: "center" }}>
                                                                        <FaEye
                                                                            style={{ cursor: "pointer", color: colors.primary, fontSize: "1.1rem" }}
                                                                            onClick={() => setSelectedBill(b)}
                                                                        />
                                                                    </Td>
                                                                </Tr>
                                                            ))}
                                                            {shift.bills.length === 0 && (
                                                                <Tr><Td colSpan="7" style={{ textAlign: "center", padding: "20px", color: colors.textMuted }}>No transactions recorded in this shift.</Td></Tr>
                                                            )}
                                                        </tbody>
                                                        {shift.bills.length > 0 && (
                                                            <tfoot>
                                                                <Tr style={{ fontWeight: "700", background: "#f8fafc", borderTop: `2px solid ${colors.border}` }}>
                                                                    <Td colSpan="3" style={{ textAlign: "right", padding: "8px", fontWeight: "bold" }}>Total ({shift.bills.length} bills):</Td>
                                                                    <Td style={{ textAlign: "right", padding: "8px", fontWeight: "bold", color: colors.primary }}>
                                                                        ₹{shift.bills.reduce((sum, b) => sum + (parseFloat(b.net_amount) || 0), 0).toFixed(2)}
                                                                    </Td>
                                                                    <Td colSpan="3" style={{ padding: "8px" }}></Td>
                                                                </Tr>
                                                            </tfoot>
                                                        )}
                                                    </Table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: "center", padding: "50px", background: colors.surface, borderRadius: "12px", color: colors.textMuted }}>No shift data found for the selected criteria.</div>
                        )}
                    </div>
                ) : (
                    /* ── VIEW TYPE: SUMMARY TABLE (DATE-WISE & SHIFT-NUMBER-WISE) ── */
                    <TableWrapper>
                        <Table>
                            <thead>
                                <Tr>
                                    <Th>Counter</Th>
                                    <Th>Date</Th>
                                    <Th>Shift No</Th>
                                    <Th>Cashier Name</Th>
                                    <Th>Start Time</Th>
                                    <Th>End Time</Th>
                                    <Th style={{ textAlign: "right" }}>Opening Bal</Th>
                                    <Th style={{ textAlign: "right" }}>Cash Coll.</Th>
                                    <Th style={{ textAlign: "right" }}>Credit Coll.</Th>
                                    <Th style={{ textAlign: "right" }}>Total Coll.</Th>
                                    <Th style={{ textAlign: "right" }}>Sales Return</Th>
                                    <Th style={{ textAlign: "right" }}>Closing Bal</Th>
                                    <Th style={{ textAlign: "center" }} className="hide-on-print">Action</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {dateGroups.length > 0 ? (
                                    dateGroups.map((group) => (
                                        <React.Fragment key={group.dateKey}>
                                            {/* DATE GROUP HEADER */}
                                            <DateGroupRow>
                                                <td colSpan={13}>
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                                        <FaCalendarAlt style={{ color: colors.primary }} /> 
                                                        <strong>Date: {group.displayDate}</strong>
                                                        <span style={{ fontSize: "0.75rem", background: "#cbd5e1", color: "#0f172a", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                                                            {group.shifts.length} {group.shifts.length === 1 ? "Shift" : "Shifts"}
                                                        </span>
                                                    </span>
                                                </td>
                                            </DateGroupRow>

                                            {/* SHIFTS WITHIN THIS DATE */}
                                            {group.shifts.map((s, si) => (
                                                <Tr key={`${s.shiftno}-${si}`}>
                                                    <Td>{getOutletName(s.SelectedOutlet)}</Td>
                                                    <Td>{s.displayDate}</Td>
                                                    <Td style={{ fontWeight: "700", color: colors.primary }}>{s.shiftno}</Td>
                                                    <Td>{s.User}</Td>
                                                    <Td style={{ fontSize: "0.75rem" }}>{s.StartTime}</Td>
                                                    <Td style={{ fontSize: "0.75rem" }}>{s.EndTime || "Active"}</Td>
                                                    <Td style={{ textAlign: "right" }}>₹{s.openBal.toFixed(2)}</Td>
                                                    <Td style={{ textAlign: "right", color: colors.success, fontWeight: "600" }}>₹{s.cashColl.toFixed(2)}</Td>
                                                    <Td style={{ textAlign: "right", color: "#0284c7", fontWeight: "600" }}>₹{s.creditColl.toFixed(2)}</Td>
                                                    <Td style={{ textAlign: "right", fontWeight: "700", color: colors.primary }}>₹{s.totalColl.toFixed(2)}</Td>
                                                    <Td style={{ textAlign: "right", color: colors.danger, fontWeight: "600" }}>₹{s.retAmt.toFixed(2)}</Td>
                                                    <Td style={{ textAlign: "right", fontWeight: "700" }}>₹{s.closeBal.toFixed(2)}</Td>
                                                    <Td style={{ textAlign: "center" }} className="hide-on-print">
                                                        <FaEye
                                                            style={{ cursor: "pointer", color: colors.primary, fontSize: "1.1rem" }}
                                                            title="View shift bills"
                                                            onClick={() => {
                                                                const bills = reportData.filter(b => b.shiftno === s.shiftno);
                                                                setSelectedShiftBills({ shiftno: s.shiftno, bills });
                                                            }}
                                                        />
                                                    </Td>
                                                </Tr>
                                            ))}

                                            {/* DATE SUBTOTAL ROW */}
                                            <SubtotalRow>
                                                <Td colSpan={6} style={{ textAlign: "right", fontWeight: "700" }}>
                                                    Subtotal for {group.displayDate} ({group.shifts.length} {group.shifts.length === 1 ? "Shift" : "Shifts"}):
                                                </Td>
                                                <Td style={{ textAlign: "right", fontWeight: "700" }}>₹{group.subtotals.opening.toFixed(2)}</Td>
                                                <Td style={{ textAlign: "right", fontWeight: "700", color: colors.success }}>₹{group.subtotals.cashColl.toFixed(2)}</Td>
                                                <Td style={{ textAlign: "right", fontWeight: "700", color: "#0284c7" }}>₹{group.subtotals.creditColl.toFixed(2)}</Td>
                                                <Td style={{ textAlign: "right", fontWeight: "800", color: colors.primary }}>₹{group.subtotals.totalColl.toFixed(2)}</Td>
                                                <Td style={{ textAlign: "right", fontWeight: "700", color: colors.danger }}>₹{group.subtotals.returnAmount.toFixed(2)}</Td>
                                                <Td style={{ textAlign: "right", fontWeight: "700" }}>₹{group.subtotals.closing.toFixed(2)}</Td>
                                                <Td className="hide-on-print"></Td>
                                            </SubtotalRow>
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan="13" style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                                            No shift records found for the selected filter.
                                        </Td>
                                    </Tr>
                                )}
                            </tbody>
                            {dateGroups.length > 0 && (
                                <tfoot>
                                    <GrandTotalRow>
                                        <Td colSpan={6} style={{ textAlign: "right", fontWeight: "800" }}>
                                            GRAND TOTAL ({grandTotals.shiftsCount} Shifts across {dateGroups.length} Dates):
                                        </Td>
                                        <Td style={{ textAlign: "right", fontWeight: "800" }}>₹{grandTotals.opening.toFixed(2)}</Td>
                                        <Td style={{ textAlign: "right", color: colors.success, fontWeight: "800" }}>₹{grandTotals.cashColl.toFixed(2)}</Td>
                                        <Td style={{ textAlign: "right", color: "#0284c7", fontWeight: "800" }}>₹{grandTotals.creditColl.toFixed(2)}</Td>
                                        <Td style={{ textAlign: "right", fontWeight: "800", color: colors.primary }}>₹{grandTotals.totalColl.toFixed(2)}</Td>
                                        <Td style={{ textAlign: "right", color: colors.danger, fontWeight: "800" }}>₹{grandTotals.returnAmount.toFixed(2)}</Td>
                                        <Td style={{ textAlign: "right", fontWeight: "800" }}>₹{grandTotals.closing.toFixed(2)}</Td>
                                        <Td className="hide-on-print"></Td>
                                    </GrandTotalRow>
                                </tfoot>
                            )}
                        </Table>
                    </TableWrapper>
                )}

                {/* MODAL: SHIFT BILLS DRILLDOWN */}
                {selectedShiftBills && (
                    <ModalOverlay onClick={() => setSelectedShiftBills(null)}>
                        <ModalContainer style={{ maxWidth: "900px" }} onClick={(e) => e.stopPropagation()}>
                            <ModalHeader>
                                <ModalTitle>Transactions for Shift: {selectedShiftBills.shiftno}</ModalTitle>
                                <CloseButton onClick={() => setSelectedShiftBills(null)}>×</CloseButton>
                            </ModalHeader>
                            <ModalBody>
                                <TableWrapper style={{ maxHeight: "60vh", overflowY: "auto" }}>
                                    <Table>
                                        <thead>
                                            <Tr style={{ background: "#f8fafc" }}>
                                                <Th>Type</Th>
                                                <Th>Bill No</Th>
                                                <Th>Patient</Th>
                                                <Th style={{ textAlign: "right" }}>Amount</Th>
                                                <Th>Mode</Th>
                                                <Th>Cashier</Th>
                                                <Th style={{ textAlign: "center" }}>Details</Th>
                                            </Tr>
                                        </thead>
                                        <tbody>
                                            {selectedShiftBills.bills.length > 0 ? (
                                                selectedShiftBills.bills.map((b, bi) => (
                                                    <Tr key={bi}>
                                                        <Td>
                                                            <span style={{ fontSize: "0.6rem", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", backgroundColor: b.type === 'Pharmacy' ? "#dcfce7" : b.type === 'Investigation' ? "#dbeafe" : "#fef3c7", color: b.type === 'Pharmacy' ? "#166534" : b.type === 'Investigation' ? "#1e40af" : "#92400e" }}>{b.type}</span>
                                                        </Td>
                                                        <Td style={{ fontSize: "0.85rem" }}>{b.bill_no}</Td>
                                                        <Td>
                                                            <div style={{ fontSize: "0.8rem", fontWeight: "600" }}>{b.patient_name}</div>
                                                            <div style={{ fontSize: "0.65rem", color: colors.textMuted }}>{b.uhid}</div>
                                                        </Td>
                                                        <Td style={{ textAlign: "right", fontWeight: "700" }}>₹{(b.net_amount || 0).toFixed(2)}</Td>
                                                        <Td style={{ fontSize: "0.75rem" }}>{b.payment_mode}</Td>
                                                        <Td style={{ fontSize: "0.75rem" }}>{b.cashier_name}</Td>
                                                        <Td style={{ textAlign: "center" }}>
                                                            <FaEye
                                                                style={{ cursor: "pointer", color: colors.secondary, fontSize: "1rem" }}
                                                                onClick={() => setSelectedBill(b)}
                                                            />
                                                        </Td>
                                                    </Tr>
                                                ))
                                            ) : (
                                                <Tr><Td colSpan="7" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>No transactions found for this shift.</Td></Tr>
                                            )}
                                        </tbody>
                                        {selectedShiftBills.bills.length > 0 && (
                                            <tfoot>
                                                <Tr style={{ fontWeight: "700", background: "#f8fafc", borderTop: `2px solid ${colors.border}` }}>
                                                    <Td colSpan="3" style={{ textAlign: "right", padding: "8px", fontWeight: "bold" }}>Total:</Td>
                                                    <Td style={{ textAlign: "right", padding: "8px", fontWeight: "bold", color: colors.primary }}>
                                                        ₹{selectedShiftBills.bills.reduce((sum, b) => sum + (parseFloat(b.net_amount) || 0), 0).toFixed(2)}
                                                    </Td>
                                                    <Td colSpan="3" style={{ padding: "8px" }}></Td>
                                                </Tr>
                                            </tfoot>
                                        )}
                                    </Table>
                                </TableWrapper>
                            </ModalBody>
                            <div style={{ padding: "15px", display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${colors.border}` }}>
                                <Button secondary onClick={() => setSelectedShiftBills(null)}>Close</Button>
                            </div>
                        </ModalContainer>
                    </ModalOverlay>
                )}

                {/* MODAL: SINGLE BILL ITEM BREAKDOWN */}
                {selectedBill && (
                    <ModalOverlay style={{ zIndex: 3000 }} onClick={() => setSelectedBill(null)}>
                        <ModalContainer onClick={(e) => e.stopPropagation()}>
                            <ModalHeader>
                                <ModalTitle>Bill Details: {selectedBill.bill_no}</ModalTitle>
                                <CloseButton onClick={() => setSelectedBill(null)}>×</CloseButton>
                            </ModalHeader>
                            <ModalBody>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                                    <div>
                                        <SummaryLabel>Patient Information</SummaryLabel>
                                        <div style={{ fontWeight: "700", fontSize: "1.1rem", marginTop: "5px" }}>{selectedBill.patient_name}</div>
                                        <div style={{ color: colors.textMuted }}>UHID: {selectedBill.uhid}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <SummaryLabel>Transaction Info</SummaryLabel>
                                        <div style={{ fontWeight: "600", marginTop: "5px" }}>{selectedBill.type}</div>
                                        <div style={{ color: colors.textMuted }}>{selectedBill.bill_date ? format(new Date(selectedBill.bill_date), "dd MMM yyyy, HH:mm") : "-"}</div>
                                    </div>
                                    <div>
                                        <SummaryLabel>Payment Details</SummaryLabel>
                                        <div style={{ fontWeight: "600", marginTop: "5px" }}>Mode: {selectedBill.payment_mode}</div>
                                        <div style={{ fontWeight: "700", color: colors.success }}>Total: ₹{(selectedBill.net_amount || 0).toFixed(2)}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <SummaryLabel>Billing Station</SummaryLabel>
                                        <div style={{ fontWeight: "600", marginTop: "5px" }}>Outlet: {selectedBill.outlet_code}</div>
                                        <div style={{ color: colors.textMuted }}>Cashier: {selectedBill.cashier_name}</div>
                                    </div>
                                </div>

                                <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "15px" }}>
                                    <SummaryLabel style={{ marginBottom: "10px", display: "block" }}>Items / Services</SummaryLabel>
                                    <Table style={{ border: "none", boxShadow: "none", background: "transparent" }}>
                                        <thead>
                                            <Tr style={{ background: "rgba(0,0,0,0.03)" }}>
                                                <Th style={{ padding: "8px", fontSize: "0.75rem" }}>Item Name</Th>
                                                <Th style={{ padding: "8px", fontSize: "0.75rem", textAlign: "center" }}>Qty</Th>
                                                <Th style={{ padding: "8px", fontSize: "0.75rem", textAlign: "right" }}>Price</Th>
                                                <Th style={{ padding: "8px", fontSize: "0.75rem", textAlign: "right" }}>Amount</Th>
                                            </Tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(selectedBill.items) && selectedBill.items.length > 0 ? (
                                                selectedBill.items.map((item, idx) => (
                                                    <Tr key={idx}>
                                                        <Td style={{ padding: "8px", fontSize: "0.8rem" }}>{item.itemName || item.item_name || item.Item_Name || item.Particulars || item.particulars || item.service_name || item.description || item.medicine_name || item.name || "N/A"}</Td>
                                                        <Td style={{ padding: "8px", fontSize: "0.8rem", textAlign: "center" }}>{item.quantity || 1}</Td>
                                                        <Td style={{ padding: "8px", fontSize: "0.8rem", textAlign: "right" }}>₹{parseFloat(item.price || item.rate || 0).toFixed(2)}</Td>
                                                        <Td style={{ padding: "8px", fontSize: "0.8rem", textAlign: "right", fontWeight: "600" }}>₹{parseFloat(item.amount || (parseFloat(item.price || item.rate || 0) * (item.quantity || 1))).toFixed(2)}</Td>
                                                    </Tr>
                                                ))
                                            ) : (
                                                <Tr>
                                                    <Td colSpan="4" style={{ textAlign: "center", padding: "15px", color: colors.textMuted, fontSize: "0.8rem" }}>No item breakdown available.</Td>
                                                </Tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </ModalBody>
                            <div style={{ padding: "15px", display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${colors.border}` }}>
                                <Button onClick={() => setSelectedBill(null)}>Close</Button>
                            </div>
                        </ModalContainer>
                    </ModalOverlay>
                )}
            </PageWrapper>

            <style>
                {`
                @media print {
                    @page { size: landscape; margin: 8mm; }
                    body * { visibility: hidden; }
                    #printable-report-area, #printable-report-area * { visibility: visible; }
                    #printable-report-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }
                    body { background: white !important; font-family: 'Times New Roman', serif; }
                }
                `}
            </style>

            {/* ── PROFESSIONAL PRINT TEMPLATE ───────────────────────────────── */}
            <PrintTemplate id="printable-report-area">
                <PrintHeader>
                    <h1>{hospital_name}</h1>
                    <p>{branch_name}</p>
                    <div className="report-title">Shift Basis Accounts Report</div>
                </PrintHeader>

                <PrintInfoTable>
                    <tbody>
                        <tr>
                            <td style={{ width: "30%" }}><strong>From Date:</strong> {dayjs(fromDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "30%" }}><strong>To Date:</strong> {dayjs(toDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "40%", textAlign: "right" }}><strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}</td>
                        </tr>
                        <tr>
                            <td colSpan="2"><strong>Type:</strong> Shift Collection & Settlement Summary (Date-wise & Shift-wise)</td>
                            <td style={{ textAlign: "right" }}><strong>Printed By:</strong> {user_id || "Staff"}</td>
                        </tr>
                    </tbody>
                </PrintInfoTable>

                <PrintTable>
                    <thead>
                        <tr>
                            <th>Counter</th>
                            <th>Date</th>
                            <th>Shift No</th>
                            <th>Cashier Name</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th style={{ textAlign: "right" }}>Opening Bal</th>
                            <th style={{ textAlign: "right" }}>Cash Coll.</th>
                            <th style={{ textAlign: "right" }}>Credit Coll.</th>
                            <th style={{ textAlign: "right" }}>Total Coll.</th>
                            <th style={{ textAlign: "right" }}>Sales Return</th>
                            <th style={{ textAlign: "right" }}>Closing Bal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dateGroups && dateGroups.length > 0 ? (
                            dateGroups.map((group) => (
                                <React.Fragment key={group.dateKey}>
                                    <tr style={{ background: "#e2e8f0", fontWeight: "bold" }}>
                                        <td colSpan={12} style={{ padding: "6px 8px", background: "#e2e8f0" }}>
                                            Date: {group.displayDate} ({group.shifts.length} {group.shifts.length === 1 ? "Shift" : "Shifts"})
                                        </td>
                                    </tr>
                                    {group.shifts.map((s, si) => (
                                        <tr key={si}>
                                            <td>{getOutletName(s.SelectedOutlet)}</td>
                                            <td>{s.displayDate}</td>
                                            <td style={{ fontWeight: "bold" }}>{s.shiftno}</td>
                                            <td>{s.User}</td>
                                            <td>{s.StartTime}</td>
                                            <td>{s.EndTime || "Active"}</td>
                                            <td style={{ textAlign: "right" }}>₹{s.openBal.toFixed(2)}</td>
                                            <td style={{ textAlign: "right" }}>₹{s.cashColl.toFixed(2)}</td>
                                            <td style={{ textAlign: "right" }}>₹{s.creditColl.toFixed(2)}</td>
                                            <td style={{ textAlign: "right", fontWeight: "bold" }}>₹{s.totalColl.toFixed(2)}</td>
                                            <td style={{ textAlign: "right" }}>₹{s.retAmt.toFixed(2)}</td>
                                            <td style={{ textAlign: "right" }}>₹{s.closeBal.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ background: "#f8fafc", fontWeight: "bold", borderTop: "1px solid #000" }}>
                                        <td colSpan={6} style={{ textAlign: "right" }}>Subtotal ({group.displayDate}):</td>
                                        <td style={{ textAlign: "right" }}>₹{group.subtotals.opening.toFixed(2)}</td>
                                        <td style={{ textAlign: "right" }}>₹{group.subtotals.cashColl.toFixed(2)}</td>
                                        <td style={{ textAlign: "right" }}>₹{group.subtotals.creditColl.toFixed(2)}</td>
                                        <td style={{ textAlign: "right" }}>₹{group.subtotals.totalColl.toFixed(2)}</td>
                                        <td style={{ textAlign: "right" }}>₹{group.subtotals.returnAmount.toFixed(2)}</td>
                                        <td style={{ textAlign: "right" }}>₹{group.subtotals.closing.toFixed(2)}</td>
                                    </tr>
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={12} style={{ textAlign: "center", padding: "15px" }}>No data available for print.</td>
                            </tr>
                        )}
                        {dateGroups && dateGroups.length > 0 && (
                            <tr style={{ fontWeight: "bold", background: "#f2f2f2" }}>
                                <td colSpan={6} style={{ textAlign: "right" }}>GRAND TOTAL:</td>
                                <td style={{ textAlign: "right" }}>₹{grandTotals.opening.toFixed(2)}</td>
                                <td style={{ textAlign: "right" }}>₹{grandTotals.cashColl.toFixed(2)}</td>
                                <td style={{ textAlign: "right" }}>₹{grandTotals.creditColl.toFixed(2)}</td>
                                <td style={{ textAlign: "right" }}>₹{grandTotals.totalColl.toFixed(2)}</td>
                                <td style={{ textAlign: "right" }}>₹{grandTotals.returnAmount.toFixed(2)}</td>
                                <td style={{ textAlign: "right" }}>₹{grandTotals.closing.toFixed(2)}</td>
                            </tr>
                        )}
                    </tbody>
                </PrintTable>

                <PrintSignatures>
                    <div className="sig-box">Prepared By</div>
                    <div className="sig-box">Accounts Officer</div>
                    <div className="sig-box">Authorized Signatory</div>
                </PrintSignatures>
            </PrintTemplate>
        </>
    );
};

export default ShiftBasisReport;
