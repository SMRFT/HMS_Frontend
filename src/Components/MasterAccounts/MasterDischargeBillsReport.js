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
    paymentMode: propPaymentMode,
    cardMachine = "all",
    selectedCardMachine: propCardMachine,
    onLoadOptions
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
    const [selectedCardMachine, setSelectedCardMachine] = useState(cardMachine || propCardMachine || "all");
    const [outletsList, setOutletsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const cm = cardMachine || propCardMachine;
        if (cm !== undefined && cm !== selectedCardMachine) {
            setSelectedCardMachine(cm);
        }
    }, [cardMachine, propCardMachine]);

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
                const data = await fetchCachedOutlets(HmsBaseUrl);
                if (Array.isArray(data)) {
                    setOutletsList(data);
                }
            } catch (e) {}
        };
        fetchOutlets();
    }, [HmsBaseUrl]);

    /* Fetch report */
    const fetchReport = useCallback(async (isRefresh = false) => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const outletParam = outlet && outlet !== "all" ? `&outlet_code=${outlet}` : "";
            const isAllMode = !paymentMode || paymentMode.toLowerCase() === "all" || paymentMode.toLowerCase() === "all payment modes";
            const modeParam = !isAllMode ? `&payment_mode=${encodeURIComponent(paymentMode)}` : "";
            const url = `${HmsBaseUrl}master-accounts/discharge-bills-summary/?from_date=${fDate}&to_date=${tDate}${outletParam}${modeParam}`;
            const res = await cachedApiRequest(url, "GET", null, { forceRefresh: isRefresh });
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

    const categoriesList = useMemo(() => {
        const set = new Set();
        bills.forEach(b => {
            if (b.payment_mode) set.add(String(b.payment_mode).trim());
            if (b.is_discharge_refund || b.is_refund) set.add("Discharge Refund");
        });
        if (set.size === 0) {
            ["Cash", "Card", "Cheque", "Multiple Payment", "Discharge Refund"].forEach(m => set.add(m));
        }
        return Array.from(set).sort();
    }, [bills]);

    const cardMachinesList = useMemo(() => {
        const set = new Set();
        bills.forEach(b => {
            if (b.card_machine) set.add(b.card_machine);
            else if (b.card_number && !/^\d+$/.test(b.card_number)) set.add(b.card_number);
        });
        return Array.from(set).sort();
    }, [bills]);

    useEffect(() => {
        if (onLoadOptions && reportData) {
            onLoadOptions({
                categories: categoriesList,
                cardMachines: cardMachinesList
            });
        }
    }, [onLoadOptions, categoriesList, cardMachinesList, reportData]);

    /* Search & Payment Mode & Card Machine filter */
    const filtered = useMemo(() => {
        let list = bills;
        if (paymentMode && paymentMode.toLowerCase() !== "all" && paymentMode.toLowerCase() !== "all payment modes") {
            const fm = paymentMode.trim().toLowerCase();
            list = list.filter(b => {
                const bm = String(b.payment_mode || "").trim().toLowerCase();
                const cm = String(b.card_machine || "").trim().toLowerCase();
                const ct = String(b.card_type || "").trim().toLowerCase();
                if (fm === "refund") return Boolean(b.is_refund || b.is_discharge_refund || cleanNum(b.discharge_refund || b.refund_amount) > 0 || bm.includes("refund"));
                if (fm === "cash") return bm === "cash";
                if (fm === "card" || fm === "credit card") return bm.includes("card") || bm.includes("bank") || bm.includes("pos") || bm.includes("upi");
                if (fm.includes("multi")) return bm.includes("multi");
                if (fm === "cheque") return bm.includes("cheque");
                if (cm && (cm === fm || cm.includes(fm))) return true;
                if (ct && (ct === fm || ct.includes(fm))) return true;
                return bm.includes(fm);
            });
        }
        if (selectedCardMachine !== "all") {
            const cmFilter = selectedCardMachine.toLowerCase().trim();
            list = list.filter(b => {
                const cm = String(b.card_machine || b.card_number || "").toLowerCase().trim();
                return cm === cmFilter || cm.includes(cmFilter);
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
    }, [bills, paymentMode, selectedCardMachine, searchTerm]);

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
                    subRefund: 0,
                    subCash: 0,
                    subCredit: 0,
                    subNet: 0
                };
            }
            map[dateOnly].bills.push(b);
            map[dateOnly].subGross += cleanNum(b.bill_amount || b.gross_amount || b.gross || b.gross_bill);
            map[dateOnly].subAdvAdj += cleanNum(b.advance_adjusted || b.advance_adjustment || b.advance_amount);
            map[dateOnly].subRefund += cleanNum(b.discharge_refund || b.refund_amount || b.refund);
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
            "Discharge Refund (₹)": cleanNum(b.discharge_refund || b.refund_amount || b.refund),
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
                            <Select value={paymentMode} onChange={setPaymentMode} style={{ width: 170 }}>
                                <Option value="all">All Payment Modes</Option>
                                <Option value="Cash">Cash</Option>
                                <Option value="Card">Card</Option>
                                <Option value="Cheque">Cheque</Option>
                                <Option value="Multiple Payment">Multiple Payment</Option>
                                <Option value="Refund">Discharge Refund</Option>
                            </Select>
                        </div>
                        <div className="filter-item">
                            <label>Card Machine:</label>
                            <Select value={selectedCardMachine} onChange={setSelectedCardMachine} style={{ width: 160 }}>
                                <Option value="all">All Machines</Option>
                                {cardMachinesList.map(m => (
                                    <Option key={m} value={m}>{m}</Option>
                                ))}
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
                            {cleanNum(summary.total_discharge_refund || summary.total_refund || filtered.reduce((a, x) => a + cleanNum(x.discharge_refund || x.refund_amount || x.refund), 0)) > 0 && (
                                <KPICard $border="#ef4444">
                                    <span className="kpi-title" style={{ color: "#ef4444" }}>Discharge Refund</span>
                                    <span className="kpi-value" style={{ color: "#dc2626" }}>₹{formatINR(summary.total_discharge_refund || summary.total_refund || filtered.reduce((a, x) => a + cleanNum(x.discharge_refund || x.refund_amount || x.refund), 0))}</span>
                                    <span className="kpi-subtitle">Refunded to patients</span>
                                </KPICard>
                            )}
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
                                    <th className="text-right" style={{ color: "#dc2626" }}>Discharge Refund (₹)</th>
                                    <th className="text-right" style={{ color: "#059669" }}>Cash Amount (₹)</th>
                                    <th className="text-right" style={{ color: "#4f46e5" }}>Card / Credit (₹)</th>
                                    <th className="text-right">Net Paid (₹)</th>
                                    <th>Payment Mode</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dateGroupedBills.length === 0 ? (
                                    <tr>
                                        <td colSpan={13} style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
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
                                                    <td colSpan={13} style={{ fontWeight: 700, padding: "8px 12px", color: "#1e293b", fontSize: "0.85rem" }}>
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
                                                    const refAmt = cleanNum(b.discharge_refund || b.refund_amount || b.refund);
                                                    const isRefund = refAmt > 0 || b.is_refund || b.is_discharge_refund;
                                                    return (
                                                        <tr key={idx} style={isRefund ? { background: "#fff5f5" } : undefined}>
                                                            <td>{curIndex}</td>
                                                            <td className="font-mono">
                                                                <strong>{b.bill_no}</strong>
                                                                {isRefund && (
                                                                    <span style={{ fontSize: "0.7rem", background: "#fee2e2", color: "#b91c1c", padding: "1px 6px", borderRadius: "4px", marginLeft: "6px", fontWeight: 700 }}>
                                                                        REFUND
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>{b.date || group.date}</td>
                                                            <td className="font-mono">{b.ip_number || "-"}</td>
                                                            <td className="font-mono">{b.mr_no || "-"}</td>
                                                            <td><strong>{b.patient_name}</strong></td>
                                                            <td className="text-right font-mono">{formatINR(b.bill_amount || b.gross_amount || b.gross || b.gross_bill)}</td>
                                                            <td className="text-right font-mono" style={{ color: "#d97706" }}>
                                                                {formatINR(b.advance_adjusted || b.advance_adjustment || b.advance_amount)}
                                                            </td>
                                                            <td className="text-right font-mono font-bold" style={{ color: refAmt > 0 ? "#dc2626" : "#94a3b8" }}>
                                                                {refAmt > 0 ? formatINR(refAmt) : "0.00"}
                                                            </td>
                                                            <td className="text-right font-mono font-bold" style={{ color: cAmt > 0 ? "#059669" : cAmt < 0 ? "#dc2626" : "#64748b" }}>
                                                                {formatINR(cAmt)}
                                                            </td>
                                                            <td className="text-right font-mono font-bold" style={{ color: crAmt > 0 ? "#4f46e5" : "#64748b" }}>
                                                                {crAmt > 0 ? formatINR(crAmt) : "0.00"}
                                                            </td>
                                                            <td className="text-right font-mono font-bold" style={{ color: b.net_settlement < 0 ? "#dc2626" : "#0284c7" }}>
                                                                {formatINR(b.net_settlement || b.net_paid || b.amount)}
                                                            </td>
                                                            <td>
                                                                {b.payment_mode || "Cash"}
                                                                {Boolean((crAmt > 0 || (b.payment_mode && b.payment_mode.toLowerCase().includes("card"))) && b.card_machine) && (
                                                                    <span style={{
                                                                        display: "inline-block",
                                                                        marginLeft: "6px",
                                                                        padding: "1px 6px",
                                                                        borderRadius: "4px",
                                                                        fontSize: "0.72rem",
                                                                        fontWeight: 700,
                                                                        background: "#e0e7ff",
                                                                        color: "#3730a3",
                                                                        border: "1px solid #c7d2fe"
                                                                    }}>
                                                                        {b.card_machine}
                                                                    </span>
                                                                )}
                                                            </td>
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
                                                        <td className="text-right font-mono font-bold" style={{ color: group.subRefund > 0 ? "#dc2626" : "#94a3b8" }}>
                                                            {group.subRefund > 0 ? `₹${formatINR(group.subRefund)}` : "₹0.00"}
                                                        </td>
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
                                        <td className="text-right font-mono font-bold" style={{ color: "#f87171" }}>
                                            ₹{formatINR(filtered.reduce((a, x) => a + cleanNum(x.discharge_refund || x.refund_amount || x.refund), 0))}
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
