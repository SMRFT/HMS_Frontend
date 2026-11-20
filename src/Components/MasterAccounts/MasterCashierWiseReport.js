import React, { useState, useEffect, useMemo } from "react";
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

const MasterCashierWiseReport = ({ isModalView = false, startDate, endDate, initialOutlet = "all" }) => {
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
        if (initialOutlet !== undefined && initialOutlet !== outlet) {
            setOutlet(initialOutlet);
        }
    }, [initialOutlet]);



    const fetchReport = async (isRefresh = false) => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/cashier-wise-summary/?from_date=${fDate}&to_date=${tDate}&outlet_code=${outlet}`;
            const res = await cachedApiRequest(url, "GET", null, { forceRefresh: isRefresh });
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Cashier Wise Report Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange, outlet]);

    const cashiers = useMemo(() => {
        const list = getSafeArray(reportData?.data);
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(c =>
            String(c.cashier_name || "").toLowerCase().includes(q) ||
            String(c.cashier_id || "").toLowerCase().includes(q)
        );
    }, [reportData, searchTerm]);

    // Group cashiers by date for date-wise display
    const dateGroupedCashiers = useMemo(() => {
        const parseSortKey = (dStr) => {
            const parts = String(dStr || "").split("/");
            if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
            return String(dStr || "");
        };
        const map = {};
        cashiers.forEach(c => {
            const d = c.date || "Unknown Date";
            if (!map[d]) map[d] = { date: d, sortKey: parseSortKey(d), cashiers: [], subCash: 0, subCard: 0, subCredit: 0, subTotal: 0 };
            map[d].cashiers.push(c);
            map[d].subCash += cleanNum(c.cash || c.gross_cash);
            map[d].subCard += cleanNum(c.card || c.card_amount);
            map[d].subCredit += cleanNum(c.credit || c.credit_amount);
            map[d].subTotal += cleanNum(c.total || c.total_revenue);
        });
        return Object.values(map).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }, [cashiers]);

    const summary = reportData?.summary || {};

    const handleExport = () => {
        const rows = cashiers.map(c => ({
            "Cashier ID": c.cashier_id,
            "Cashier Name": c.cashier_name,
            "Shifts Worked": c.shifts_count,
            "Cash Collections": c.cash,
            "Card & Bank Collections": c.card,
            "Credit / Insurance": c.credit,
            "Total Revenue": c.total
        }));
        exportToExcel(rows, "Master_Cashier_Wise_Summary", "Cashiers");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Cashier-Wise Collection Summary
                            <span className="badge">Operator Audit</span>
                        </h1>
                        <p>Total cash, card POS, UPI, and credit collections summarized per counter cashier</p>
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
                            <Input
                                placeholder="Search cashier..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 200 }}
                            />
                        </div>
                        <Button icon={<RefreshCw size={14} />} onClick={() => fetchReport(true)} loading={loading}>
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
                            title="CashierWiseReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Total cash, card POS, UPI, and credit collections summarized per counter cashier"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Total Cash</span>
                            <span className="kpi-value">₹{formatINR(summary.total_cash)}</span>
                            <span className="kpi-subtitle">Collected across cashiers</span>
                        </KPICard>
                        <KPICard $border="#6366f1">
                            <span className="kpi-title">Total Card / POS</span>
                            <span className="kpi-value">₹{formatINR(summary.total_card)}</span>
                            <span className="kpi-subtitle">Electronic transactions</span>
                        </KPICard>
                        <KPICard $border="#f59e0b">
                            <span className="kpi-title">Total Credit</span>
                            <span className="kpi-value">₹{formatINR(summary.total_credit)}</span>
                            <span className="kpi-subtitle">TPA / Corporate dues</span>
                        </KPICard>
                        <KPICard $border="#10b981">
                            <span className="kpi-title">Grand Total Revenue</span>
                            <span className="kpi-value">₹{formatINR(summary.grand_total)}</span>
                            <span className="kpi-subtitle">All payment modes</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>Cashier ID</th>
                                    <th>Cashier Name</th>
                                    <th className="text-center">Active Shifts</th>
                                    <th className="text-right">Cash Collections (₹)</th>
                                    <th className="text-right">Card & Bank (₹)</th>
                                    <th className="text-right">Credit / Scheme (₹)</th>
                                    <th className="text-right">Total Revenue (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dateGroupedCashiers.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>No data found</td></tr>
                                ) : (
                                    dateGroupedCashiers.map((group, gIdx) => (
                                        <React.Fragment key={gIdx}>
                                            {/* Date Banner */}
                                            <tr className="date-group-header" style={{ background: "#f1f5f9" }}>
                                                <td colSpan={7} style={{ fontWeight: 700, padding: "8px 12px", color: "#1e293b", fontSize: "0.85rem" }}>
                                                    📅 Date: {group.date} &nbsp;
                                                    <span style={{ fontSize: "0.78rem", background: "#cbd5e1", padding: "2px 8px", borderRadius: "10px" }}>
                                                        {group.cashiers.length} Cashier{group.cashiers.length !== 1 ? "s" : ""}
                                                    </span>
                                                </td>
                                            </tr>
                                            {/* Cashier rows */}
                                            {group.cashiers.map((c, idx) => (
                                                <tr key={idx}>
                                                    <td className="font-mono"><strong>{c.cashier_id}</strong></td>
                                                    <td>{c.cashier_name}</td>
                                                    <td className="text-center">{c.shifts_count || 1}</td>
                                                    <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                                        {formatINR(c.cash || c.gross_cash)}
                                                    </td>
                                                    <td className="text-right font-mono">{formatINR(c.card || c.card_amount)}</td>
                                                    <td className="text-right font-mono">{formatINR(c.credit || c.credit_amount)}</td>
                                                    <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                        {formatINR(c.total || c.total_revenue)}
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Date Subtotal */}
                                            {dateGroupedCashiers.length > 1 && (
                                                <tr className="subtotal-row" style={{ background: "#f8fafc", fontWeight: 700 }}>
                                                    <td colSpan={3} style={{ textAlign: "right", padding: "6px 10px" }}>
                                                        Subtotal for {group.date} ({group.cashiers.length} Cashier{group.cashiers.length !== 1 ? "s" : ""}):
                                                    </td>
                                                    <td className="text-right" style={{ color: "#059669" }}>₹{formatINR(group.subCash)}</td>
                                                    <td className="text-right">₹{formatINR(group.subCard)}</td>
                                                    <td className="text-right">₹{formatINR(group.subCredit)}</td>
                                                    <td className="text-right font-bold" style={{ color: "#0284c7" }}>₹{formatINR(group.subTotal)}</td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                                <tr className="total-row">
                                    <td colSpan={3}><strong>TOTAL CASHIERS ({cashiers.length} OPERATORS)</strong></td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                        ₹{formatINR(summary.total_cash || cashiers.reduce((a, c) => a + cleanNum(c.cash || c.gross_cash), 0))}
                                    </td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_card || cashiers.reduce((a, c) => a + cleanNum(c.card || c.card_amount), 0))}</td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_credit || cashiers.reduce((a, c) => a + cleanNum(c.credit || c.credit_amount), 0))}</td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                        ₹{formatINR(summary.grand_total || cashiers.reduce((a, c) => a + cleanNum(c.total || c.total_revenue), 0))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </DataTableWrapper>

                    <ReportPrintFooter />
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterCashierWiseReport;
