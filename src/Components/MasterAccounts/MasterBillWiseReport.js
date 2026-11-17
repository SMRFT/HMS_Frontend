import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DatePicker, Select, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import styled from "styled-components";
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

const CompactTableWrapper = styled(DataTableWrapper)`
    table {
        table-layout: auto;
        font-size: 0.74rem;
    }
    thead th {
        padding: 6px 4px !important;
        font-size: 0.70rem !important;
        white-space: normal !important;
        line-height: 1.15 !important;
        text-align: left;
    }
    tbody td {
        padding: 4px 4px !important;
        font-size: 0.74rem !important;
        line-height: 1.2 !important;
    }
    .text-center {
        text-align: center !important;
    }
    .text-right {
        text-align: right !important;
    }
`;

const MasterBillWiseReport = ({ 
    isModalView = false, 
    startDate, 
    endDate, 
    outlet: propOutlet, 
    initialOutlet = "all" 
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const effectiveOutlet = propOutlet || initialOutlet || "all";
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs(),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(effectiveOutlet);
    const [outletsList, setOutletsList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
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
    }, [propOutlet, initialOutlet]);

    /* Load outlets */
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
            const url = `${HmsBaseUrl}master-accounts/bill-wise-detailed/?from_date=${fDate}&to_date=${tDate}${outletParam}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            } else {
                setReportData(null);
            }
        } catch (err) {
            console.error("Bill Wise Detailed Error:", err);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    }, [dateRange, outlet, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const bills = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    const categoryList = useMemo(() => {
        const set = new Set();
        bills.forEach(b => {
            if (b.category) set.add(b.category);
        });
        return Array.from(set);
    }, [bills]);

    /* Filter by category and search */
    const filtered = useMemo(() => {
        let list = bills;
        if (selectedCategory !== "all") {
            list = list.filter(b => b.category === selectedCategory);
        }
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(b =>
            String(b.bill_no || "").toLowerCase().includes(q) ||
            String(b.patient_name || "").toLowerCase().includes(q) ||
            String(b.mr_no || b.uhid || "").toLowerCase().includes(q) ||
            String(b.ip_number || "").toLowerCase().includes(q) ||
            String(b.category || "").toLowerCase().includes(q) ||
            String(b.payment_mode || "").toLowerCase().includes(q)
        );
    }, [bills, selectedCategory, searchTerm]);

    /* Calculated totals */
    const totals = useMemo(() => {
        let grossRev = 0;
        let cashIn = 0;
        let cardIn = 0;
        let creditIn = 0;
        let salesRet = 0;
        let expPaid = 0;

        filtered.forEach(b => {
            const isSR = b.is_sales_return || String(b.category || "").toLowerCase().includes("return") || String(b.category || "").toLowerCase().includes("refund") || cleanNum(b.sales_return) > 0;
            const isExp = b.is_expense || String(b.category || "").toLowerCase().includes("expense") || String(b.category || "").toLowerCase().includes("payment");
            const amt = Math.abs(cleanNum(b.amount || b.gross || b.net_amount));

            if (isSR) {
                salesRet += Math.abs(cleanNum(b.sales_return_amount || b.refund_amount || amt));
            } else if (isExp) {
                expPaid += Math.abs(cleanNum(b.expense_amount || amt));
            } else {
                grossRev += Math.abs(amt);
                if (cleanNum(b.cash) > 0) cashIn += cleanNum(b.cash);
                if (cleanNum(b.bank) > 0) cardIn += cleanNum(b.bank);
                if (cleanNum(b.credit) > 0) creditIn += cleanNum(b.credit);
            }
        });

        const netRev = grossRev - salesRet - expPaid;
        const netCash = cashIn - salesRet - expPaid;

        return {
            grossRev,
            cashIn,
            cardIn,
            creditIn,
            salesRet,
            expPaid,
            netRev,
            netCash
        };
    }, [filtered]);

    /* Excel export with sales returns and expense payments */
    const handleExport = () => {
        const rows = filtered.map((b, idx) => {
            const isSR = b.is_sales_return || String(b.category || "").toLowerCase().includes("return") || String(b.category || "").toLowerCase().includes("refund") || cleanNum(b.sales_return) > 0;
            const isExp = b.is_expense || String(b.category || "").toLowerCase().includes("expense") || String(b.category || "").toLowerCase().includes("payment");
            const srVal = isSR ? Math.abs(cleanNum(b.sales_return_amount || b.refund_amount || b.amount || b.gross)) : 0;
            const expVal = isExp ? Math.abs(cleanNum(b.expense_amount || b.amount || b.gross)) : 0;
            const netVal = isSR ? -srVal : isExp ? -expVal : cleanNum(b.gross || ((b.cash || 0) + (b.bank || 0) + (b.credit || 0)));

            return {
                "SLNO": idx + 1,
                "Bill / Voucher No": b.bill_no,
                "Date": b.date,
                "Category": b.category,
                "UHID": b.mr_no || b.uhid || "—",
                "IP No": b.ip_number || "—",
                "Patient / Account Name": b.patient_name || "—",
                "Payment Mode": b.payment_mode || "Cash",
                "Sales Return / Refund (₹)": srVal > 0 ? -srVal : 0,
                "Expense Payment (₹)": expVal > 0 ? -expVal : 0,
                "Cash (₹)": isSR && srVal > 0 ? -srVal : isExp && expVal > 0 ? -expVal : cleanNum(b.cash),
                "Card & Bank (₹)": cleanNum(b.bank),
                "Credit (₹)": cleanNum(b.credit),
                "Net Total (₹)": netVal
            };
        });
        exportToExcel(rows, "Master_Bill_Wise_Detailed_Report", "BillWise");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                Bill Wise Detailed Report
                                <span className="badge">Itemized Audit</span>
                            </h1>
                            <p>Line-by-line revenue analysis per bill with sales returns, counter expense payments, and net cash handover</p>
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
                            <label>Category:</label>
                            <Select value={selectedCategory} onChange={setSelectedCategory} style={{ width: 190 }}>
                                <Option value="all">All Categories ({categoryList.length})</Option>
                                {categoryList.map(c => (
                                    <Option key={c} value={c}>{c}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <Input
                                placeholder="Search bill / patient / UHID..."
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
                            title="BillWiseReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Itemized revenue audit per bill with sales returns, counter expense payments, and net reconciliation"
                        />
                    )}

                    {!isModalView && (
                        <KPIGrid className="no-print">
                            <KPICard $border="#0284c7">
                                <span className="kpi-title">Gross Invoiced Revenue</span>
                                <span className="kpi-value">₹{formatINR(summary.total_gross_revenue || totals.grossRev)}</span>
                                <span className="kpi-subtitle">Total patient bills</span>
                            </KPICard>
                            <KPICard $border="#059669">
                                <span className="kpi-title">Gross Cash Collections</span>
                                <span className="kpi-value">₹{formatINR(summary.total_cash || totals.cashIn)}</span>
                                <span className="kpi-subtitle">Cash inflow</span>
                            </KPICard>
                            <KPICard $border="#6366f1">
                                <span className="kpi-title">Card & Bank (POS)</span>
                                <span className="kpi-value">₹{formatINR(summary.total_card || totals.cardIn)}</span>
                                <span className="kpi-subtitle">Electronic POS / online</span>
                            </KPICard>
                            <KPICard $border="#8b5cf6">
                                <span className="kpi-title">Credit / Insurance</span>
                                <span className="kpi-value">₹{formatINR(summary.total_credit || totals.creditIn)}</span>
                                <span className="kpi-subtitle">TPA / Corporate dues</span>
                            </KPICard>
                            <KPICard $border="#dc2626">
                                <span className="kpi-title">Sales Returns & Refunds</span>
                                <span className="kpi-value" style={{ color: "#dc2626" }}>
                                    -₹{formatINR(summary.total_sales_returns || totals.salesRet)}
                                </span>
                                <span className="kpi-subtitle">Medicine / discharge refunds</span>
                            </KPICard>
                            <KPICard $border="#d97706">
                                <span className="kpi-title">Expense Payments</span>
                                <span className="kpi-value" style={{ color: "#d97706" }}>
                                    -₹{formatINR(summary.total_expenses_paid || totals.expPaid)}
                                </span>
                                <span className="kpi-subtitle">Counter expense vouchers</span>
                            </KPICard>
                            <KPICard $border="#10b981">
                                <span className="kpi-title">Net Handover / Total</span>
                                <span className="kpi-value" style={{ color: "#059669" }}>
                                    ₹{formatINR(summary.net_revenue || totals.netRev)}
                                </span>
                                <span className="kpi-subtitle">After returns & payments</span>
                            </KPICard>
                        </KPIGrid>
                    )}

                    <CompactTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: "35px", textAlign: "center" }}>SLNO</th>
                                    <th style={{ width: "85px" }}>Bill / Voucher No</th>
                                    <th style={{ width: "75px" }}>Date</th>
                                    <th style={{ width: "80px" }}>Category</th>
                                    <th style={{ width: "72px" }}>UHID</th>
                                    <th style={{ width: "60px" }}>IP No</th>
                                    <th style={{ minWidth: "110px" }}>Patient / Particulars</th>
                                    <th style={{ width: "45px" }}>Mode</th>
                                    <th style={{ width: "72px", color: "#dc2626" }} className="text-right">Sales Return (₹)</th>
                                    <th style={{ width: "72px", color: "#d97706" }} className="text-right">Expense Payment (₹)</th>
                                    <th style={{ width: "68px" }} className="text-right">Cash (₹)</th>
                                    <th style={{ width: "68px" }} className="text-right">Card / POS (₹)</th>
                                    <th style={{ width: "62px" }} className="text-right">Credit (₹)</th>
                                    <th style={{ width: "72px" }} className="text-right">Net Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={14} style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                                            No records found for the selected criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((b, idx) => {
                                        const isSR = b.is_sales_return || String(b.category || "").toLowerCase().includes("return") || String(b.category || "").toLowerCase().includes("refund") || cleanNum(b.sales_return) > 0;
                                        const isExp = b.is_expense || String(b.category || "").toLowerCase().includes("expense") || String(b.category || "").toLowerCase().includes("payment");
                                        const srAmt = isSR ? Math.abs(cleanNum(b.sales_return_amount || b.refund_amount || b.amount || b.gross)) : 0;
                                        const expAmt = isExp ? Math.abs(cleanNum(b.expense_amount || b.amount || b.gross)) : 0;
                                        const netAmt = isSR ? -srAmt : isExp ? -expAmt : cleanNum(b.gross || ((b.cash || 0) + (b.bank || 0) + (b.credit || 0)));

                                        return (
                                            <tr 
                                                key={idx}
                                                style={{
                                                    background: isSR ? "#fef2f2" : isExp ? "#fffbeb" : "inherit"
                                                }}
                                            >
                                                <td className="text-center">{idx + 1}</td>
                                                <td className="font-mono" style={{ fontSize: "0.72rem" }}><strong>{b.bill_no}</strong></td>
                                                <td style={{ fontSize: "0.70rem" }}>{b.date}</td>
                                                <td style={{ fontSize: "0.70rem" }}>
                                                    <Tag color={isSR ? "red" : isExp ? "orange" : "blue"} style={{ fontSize: "0.68rem", padding: "0 4px", lineHeight: "17px", margin: 0 }}>
                                                        {b.category}
                                                    </Tag>
                                                </td>
                                                <td className="font-mono" style={{ fontSize: "0.70rem" }}>{b.mr_no || b.uhid || "—"}</td>
                                                <td className="font-mono" style={{ fontSize: "0.70rem" }}>{b.ip_number || "—"}</td>
                                                <td>
                                                    <strong style={{ fontSize: "0.72rem" }}>{b.patient_name || (b.mr_no || b.uhid ? "Patient" : "General Patient")}</strong>
                                                    {Array.isArray(b.particulars) && b.particulars.length > 0 && b.particulars[0]?.itemName && (
                                                        <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "1px" }}>
                                                            {b.particulars[0].itemName}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ fontSize: "0.70rem" }}>{b.payment_mode || "Cash"}</td>
                                                <td className="text-right font-mono font-bold" style={{ color: srAmt > 0 ? "#dc2626" : "#94a3b8" }}>
                                                    {srAmt > 0 ? `-₹${formatINR(srAmt)}` : "—"}
                                                </td>
                                                <td className="text-right font-mono font-bold" style={{ color: expAmt > 0 ? "#d97706" : "#94a3b8" }}>
                                                    {expAmt > 0 ? `-₹${formatINR(expAmt)}` : "—"}
                                                </td>
                                                <td className="text-right font-mono">
                                                    {isSR && srAmt > 0 ? (
                                                        <span style={{ color: "#dc2626", fontWeight: 700 }}>-₹{formatINR(srAmt)}</span>
                                                    ) : isExp && expAmt > 0 ? (
                                                        <span style={{ color: "#d97706", fontWeight: 700 }}>-₹{formatINR(expAmt)}</span>
                                                    ) : cleanNum(b.cash) > 0 ? (
                                                        <span style={{ color: "#059669", fontWeight: 600 }}>{formatINR(b.cash)}</span>
                                                    ) : cleanNum(b.cash) < 0 ? (
                                                        <span style={{ color: "#dc2626", fontWeight: 600 }}>{formatINR(b.cash)}</span>
                                                    ) : (
                                                        "0.00"
                                                    )}
                                                </td>
                                                <td className="text-right font-mono">{formatINR(b.bank)}</td>
                                                <td className="text-right font-mono">{formatINR(b.credit)}</td>
                                                <td className="text-right font-mono font-bold" style={{ color: netAmt < 0 ? "#dc2626" : "#0284c7" }}>
                                                    {formatINR(netAmt)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}

                                {/* Grand Totals Row */}
                                {filtered.length > 0 && (
                                    <tr className="total-row" style={{ background: "#0f172a", color: "#ffffff", fontWeight: 800 }}>
                                        <td colSpan={8} style={{ color: "#ffffff", padding: "6px 4px" }}>
                                            <strong>TOTALS ({filtered.length} RECORDS)</strong>
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#f87171", padding: "6px 4px" }}>
                                            {totals.salesRet > 0 ? `-₹${formatINR(totals.salesRet)}` : "₹0.00"}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#fbbf24", padding: "6px 4px" }}>
                                            {totals.expPaid > 0 ? `-₹${formatINR(totals.expPaid)}` : "₹0.00"}
                                        </td>
                                        <td className="text-right font-mono" style={{ color: "#4ade80", padding: "6px 4px" }}>
                                            ₹{formatINR(totals.cashIn - totals.salesRet - totals.expPaid)}
                                        </td>
                                        <td className="text-right font-mono" style={{ color: "#ffffff", padding: "6px 4px" }}>
                                            ₹{formatINR(totals.cardIn)}
                                        </td>
                                        <td className="text-right font-mono" style={{ color: "#ffffff", padding: "6px 4px" }}>
                                            ₹{formatINR(totals.creditIn)}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#38bdf8", padding: "6px 4px" }}>
                                            ₹{formatINR(totals.netRev)}
                                        </td>
                                    </tr>
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

export default MasterBillWiseReport;
