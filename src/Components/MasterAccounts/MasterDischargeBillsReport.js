import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DatePicker, Select, Button, Spin, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw } from "lucide-react";
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

const { RangePicker } = DatePicker;
const { Option } = Select;

const MasterDischargeBillsReport = ({ 
    isModalView = false, 
    startDate, 
    endDate, 
    outlet: propOutlet, 
    initialOutlet = "all",
    billType: propBillType,
    initialBillType = "all",
    category: propCategory,
    mode: propMode,
    paymentMode: propPaymentMode
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const effectiveOutlet = propOutlet || initialOutlet || "all";
    const effectiveMode = propPaymentMode || propMode || propCategory || propBillType || initialBillType || "all";
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(effectiveOutlet);
    const [paymentMode, setPaymentMode] = useState(effectiveMode);
    const [outletsList, setOutletsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    /* Synchronize dates */
    useEffect(() => {
        if (startDate && endDate) {
            setDateRange([dayjs(startDate), dayjs(endDate)]);
        }
    }, [startDate, endDate]);

    /* Synchronize outlet */
    useEffect(() => {
        const o = propOutlet || initialOutlet;
        if (o !== undefined && o !== outlet) {
            setOutlet(o);
        }
    }, [propOutlet, initialOutlet, outlet]);

    /* Synchronize payment mode */
    useEffect(() => {
        const m = propPaymentMode || propMode || propCategory || propBillType || initialBillType;
        if (m !== undefined && m !== paymentMode) {
            setPaymentMode(m);
        }
    }, [propPaymentMode, propMode, propCategory, propBillType, initialBillType, paymentMode]);

    /* Load outlets list */
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

    /* Fetch report */
    const fetchReport = useCallback(async () => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const outletParam = outlet && outlet !== "all" ? `&outlet_code=${outlet}` : "";
            const isAllMode = !paymentMode || paymentMode.toLowerCase() === "all" || paymentMode.toLowerCase() === "all payment modes";
            const modeParam = !isAllMode ? `&payment_mode=${encodeURIComponent(paymentMode)}` : "";
            const url = `${HmsBaseUrl}master-accounts/discharge-bills-summary/?from_date=${fDate}&to_date=${tDate}${outletParam}${modeParam}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            } else {
                setReportData(null);
            }
        } catch (err) {
            console.error("Discharge Bills Error:", err);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    }, [dateRange, outlet, paymentMode, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const bills = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    /* Search & Payment Mode filter */
    const filtered = useMemo(() => {
        let list = bills;
        if (paymentMode && paymentMode.toLowerCase() !== "all" && paymentMode.toLowerCase() !== "all payment modes") {
            const fm = paymentMode.trim().toLowerCase();
            list = list.filter(b => {
                const bm = String(b.payment_mode || "").trim().toLowerCase();
                if (fm === "cash") return bm === "cash";
                if (fm === "card" || fm === "credit card") return bm.includes("card") || bm.includes("bank") || bm.includes("pos") || bm.includes("upi");
                if (fm.includes("multi")) return bm.includes("multi");
                if (fm === "cheque") return bm.includes("cheque");
                return bm.includes(fm);
            });
        }
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(b =>
            String(b.bill_no || "").toLowerCase().includes(q) ||
            String(b.patient_name || "").toLowerCase().includes(q) ||
            String(b.ip_number || "").toLowerCase().includes(q) ||
            String(b.mr_no || "").toLowerCase().includes(q) ||
            String(b.payment_mode || "").toLowerCase().includes(q)
        );
    }, [bills, paymentMode, searchTerm]);

    /* Date-wise grouping (just like Advance Registration) */
    const dateGroupedBills = useMemo(() => {
        const parseSortKey = (dStr) => {
            const parts = String(dStr || "").split("/");
            if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
            return String(dStr || "");
        };

        const map = {};
        filtered.forEach(b => {
            const rawDate = b.date || b.discharge_date || b.created_date || b.bill_date || "Unknown Date";
            const dateOnly = String(rawDate).slice(0, 10);
            if (!map[dateOnly]) {
                map[dateOnly] = {
                    date: dateOnly,
                    sortKey: parseSortKey(dateOnly),
                    bills: [],
                    subGross: 0,
                    subAdvAdj: 0,
                    subCash: 0,
                    subCredit: 0,
                    subNet: 0
                };
            }
            map[dateOnly].bills.push(b);
            map[dateOnly].subGross += cleanNum(b.bill_amount || b.gross_amount || b.gross || b.gross_bill);
            map[dateOnly].subAdvAdj += cleanNum(b.advance_adjusted || b.advance_adjustment || b.advance_amount);
            map[dateOnly].subCash += cleanNum(b.cash || b.cash_amount);
            map[dateOnly].subCredit += cleanNum(b.credit || b.credit_amount || b.bank || b.card);
            map[dateOnly].subNet += cleanNum(b.net_settlement || b.net_paid || b.amount);
        });

        return Object.values(map).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }, [filtered]);

    /* Excel export with Cash & Credit decomposition */
    const handleExport = () => {
        const rows = filtered.map((b, idx) => ({
            "SLNO": idx + 1,
            "Bill No": b.bill_no,
            "Date": b.date,
            "IP No": b.ip_number,
            "UHID": b.mr_no,
            "Patient Name": b.patient_name,
            "Gross Bill (₹)": cleanNum(b.bill_amount || b.gross_amount || b.gross || b.gross_bill),
            "Advance Adjusted (₹)": cleanNum(b.advance_adjusted || b.advance_adjustment || b.advance_amount),
            "Cash Amount (₹)": cleanNum(b.cash || b.cash_amount),
            "Credit Amount (₹)": cleanNum(b.credit || b.credit_amount || b.bank || b.card),
            "Net Paid (₹)": cleanNum(b.net_settlement || b.net_paid || b.amount),
            "Payment Mode": b.payment_mode || "Cash"
        }));
        exportToExcel(rows, "Master_Discharge_Bills_Summary", "DischargeBills");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                Discharge Patient Bills Summary
                                <span className="badge">Final Settlements</span>
                            </h1>
                            <p>Inpatient final discharge bills, advance adjustments, and net cash / credit clearance settlements</p>
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
                            <Select value={outlet} onChange={setOutlet} style={{ width: 180 }}>
                                <Option value="all">All Outlets</Option>
                                {outletsList.map((o) => (
                                    <Option key={o.outlet_code} value={o.outlet_code}>
                                        {o.outlet_name || o.outlet_code}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <label>Payment Mode:</label>
                            <Select value={paymentMode} onChange={setPaymentMode} style={{ width: 180 }}>
                                <Option value="all">All Payment Modes</Option>
                                <Option value="Cash">Cash</Option>
                                <Option value="Card">Card</Option>
                                <Option value="Cheque">Cheque</Option>
                                <Option value="Multiple Payment">Multiple Payment</Option>
                            </Select>
                        </div>
                        <div className="filter-item">
                            <Input
                                placeholder="Search bill / patient / IP..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 220 }}
                            />
                        </div>
                        <Button icon={<RefreshCw size={14} />} onClick={fetchReport} loading={loading}>
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
                            title="DischargeBillsReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Inpatient final discharge bills, advance adjustments, and cash/credit clearance"
                        />
                    )}

                    {!isModalView && (
                        <KPIGrid className="no-print">
                            <KPICard $border="#059669">
                                <span className="kpi-title">Total Cash Amount</span>
                                <span className="kpi-value">₹{formatINR(summary.total_cash || filtered.reduce((a, x) => a + cleanNum(x.cash || x.cash_amount), 0))}</span>
                                <span className="kpi-subtitle">Collected in physical cash</span>
                            </KPICard>
                            <KPICard $border="#6366f1">
                                <span className="kpi-title">Total Credit / Card</span>
                                <span className="kpi-value">₹{formatINR(summary.total_credit || filtered.reduce((a, x) => a + cleanNum(x.credit || x.credit_amount || x.bank || x.card), 0))}</span>
                                <span className="kpi-subtitle">Insurance, bank & POS</span>
                            </KPICard>
                            <KPICard $border="#0ea5e9">
                                <span className="kpi-title">Gross Invoiced Value</span>
                                <span className="kpi-value">₹{formatINR(summary.total_gross_bill || filtered.reduce((a, x) => a + cleanNum(x.bill_amount || x.gross_amount || x.gross || x.gross_bill), 0))}</span>
                                <span className="kpi-subtitle">Total bill value</span>
                            </KPICard>
                            <KPICard $border="#f59e0b">
                                <span className="kpi-title">Advances Adjusted</span>
                                <span className="kpi-value">₹{formatINR(summary.total_advance_adjusted || filtered.reduce((a, x) => a + cleanNum(x.advance_adjusted || x.advance_adjustment || x.advance_amount), 0))}</span>
                                <span className="kpi-subtitle">Adjusted deposits</span>
                            </KPICard>
                            <KPICard $border="#0284c7">
                                <span className="kpi-title">Discharged Inpatients</span>
                                <span className="kpi-value">{filtered.length}</span>
                                <span className="kpi-subtitle">Settled bills</span>
                            </KPICard>
                        </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: "45px" }}>SLNO</th>
                                    <th>Bill No</th>
                                    <th>Discharge Date</th>
                                    <th>IP No</th>
                                    <th>UHID</th>
                                    <th>Patient Name</th>
                                    <th className="text-right">Gross Bill (₹)</th>
                                    <th className="text-right">Advance Adj (₹)</th>
                                    <th className="text-right" style={{ color: "#059669" }}>Cash Amount (₹)</th>
                                    <th className="text-right" style={{ color: "#4f46e5" }}>Card / Credit (₹)</th>
                                    <th className="text-right">Net Paid (₹)</th>
                                    <th>Payment Mode</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dateGroupedBills.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                                            No discharge bill records found.
                                        </td>
                                    </tr>
                                ) : (
                                    (() => {
                                        let globalIndex = 1;
                                        return dateGroupedBills.map((group, gIdx) => (
                                            <React.Fragment key={gIdx}>
                                                {/* Date Banner */}
                                                <tr className="date-group-header" style={{ background: "#f1f5f9" }}>
                                                    <td colSpan={12} style={{ fontWeight: 700, padding: "8px 12px", color: "#1e293b", fontSize: "0.85rem" }}>
                                                        📅 Date: {group.date} &nbsp;
                                                        <span style={{ fontSize: "0.78rem", background: "#cbd5e1", padding: "2px 8px", borderRadius: "10px" }}>
                                                            {group.bills.length} Patient{group.bills.length !== 1 ? "s" : ""}
                                                        </span>
                                                    </td>
                                                </tr>

                                                {/* Patient Discharge Rows */}
                                                {group.bills.map((b, idx) => {
                                                    const curIndex = globalIndex++;
                                                    const cAmt = cleanNum(b.cash || b.cash_amount);
                                                    const crAmt = cleanNum(b.credit || b.credit_amount || b.bank || b.card);
                                                    return (
                                                        <tr key={idx}>
                                                            <td>{curIndex}</td>
                                                            <td className="font-mono"><strong>{b.bill_no}</strong></td>
                                                            <td>{b.date || group.date}</td>
                                                            <td className="font-mono">{b.ip_number || "-"}</td>
                                                            <td className="font-mono">{b.mr_no || "-"}</td>
                                                            <td><strong>{b.patient_name}</strong></td>
                                                            <td className="text-right font-mono">{formatINR(b.bill_amount || b.gross_amount || b.gross || b.gross_bill)}</td>
                                                            <td className="text-right font-mono" style={{ color: "#d97706" }}>
                                                                {formatINR(b.advance_adjusted || b.advance_adjustment || b.advance_amount)}
                                                            </td>
                                                            <td className="text-right font-mono font-bold" style={{ color: cAmt > 0 ? "#059669" : "#64748b" }}>
                                                                {cAmt > 0 ? formatINR(cAmt) : "0.00"}
                                                            </td>
                                                            <td className="text-right font-mono font-bold" style={{ color: crAmt > 0 ? "#4f46e5" : "#64748b" }}>
                                                                {crAmt > 0 ? formatINR(crAmt) : "0.00"}
                                                            </td>
                                                            <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                                {formatINR(b.net_settlement || b.net_paid || b.amount)}
                                                            </td>
                                                            <td>{b.payment_mode || "Cash"}</td>
                                                        </tr>
                                                    );
                                                })}

                                                {/* Date Subtotal */}
                                                {dateGroupedBills.length > 1 && (
                                                    <tr className="subtotal-row" style={{ background: "#f8fafc", fontWeight: 700 }}>
                                                        <td colSpan={6} style={{ textAlign: "right", padding: "6px 10px" }}>
                                                            Subtotal for {group.date} ({group.bills.length} Patients):
                                                        </td>
                                                        <td className="text-right font-mono">₹{formatINR(group.subGross)}</td>
                                                        <td className="text-right font-mono" style={{ color: "#d97706" }}>₹{formatINR(group.subAdvAdj)}</td>
                                                        <td className="text-right font-mono" style={{ color: "#059669" }}>₹{formatINR(group.subCash)}</td>
                                                        <td className="text-right font-mono" style={{ color: "#4f46e5" }}>₹{formatINR(group.subCredit)}</td>
                                                        <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>₹{formatINR(group.subNet)}</td>
                                                        <td></td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ));
                                    })()
                                )}

                                {/* Grand Total Row */}
                                {filtered.length > 0 && (
                                    <tr className="total-row" style={{ background: "#0f172a", color: "#ffffff", fontWeight: 800 }}>
                                        <td colSpan={6} style={{ color: "#ffffff" }}>
                                            <strong>GRAND TOTAL ({filtered.length} DISCHARGED PATIENTS)</strong>
                                        </td>
                                        <td className="text-right font-mono" style={{ color: "#ffffff" }}>
                                            ₹{formatINR(filtered.reduce((a, x) => a + cleanNum(x.bill_amount || x.gross_amount || x.gross || x.gross_bill), 0))}
                                        </td>
                                        <td className="text-right font-mono" style={{ color: "#fbbf24" }}>
                                            ₹{formatINR(filtered.reduce((a, x) => a + cleanNum(x.advance_adjusted || x.advance_adjustment || x.advance_amount), 0))}
                                        </td>
                                        <td className="text-right font-mono" style={{ color: "#4ade80" }}>
                                            ₹{formatINR(filtered.reduce((a, x) => a + cleanNum(x.cash || x.cash_amount), 0))}
                                        </td>
                                        <td className="text-right font-mono" style={{ color: "#a5b4fc" }}>
                                            ₹{formatINR(filtered.reduce((a, x) => a + cleanNum(x.credit || x.credit_amount || x.bank || x.card), 0))}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#38bdf8" }}>
                                            ₹{formatINR(filtered.reduce((a, x) => a + cleanNum(x.net_settlement || x.net_paid || x.amount), 0))}
                                        </td>
                                        <td style={{ color: "#ffffff" }}>End</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </DataTableWrapper>

                    <ReportPrintFooter />
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterDischargeBillsReport;
