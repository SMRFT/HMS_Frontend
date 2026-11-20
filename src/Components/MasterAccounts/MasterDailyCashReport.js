import React, { useState, useEffect } from "react";
import { DatePicker, Select, Button, Spin, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, RefreshCw, Banknote } from "lucide-react";
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

const MasterDailyCashReport = ({ isModalView = false, startDate, endDate, initialOutlet = "all" }) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(initialOutlet || "all");
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
        if (initialOutlet !== undefined && initialOutlet !== outlet) {
            setOutlet(initialOutlet);
        }
    }, [initialOutlet]);



    const fetchReport = async (isRefresh = false) => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/daily-cash-collection/?from_date=${fDate}&to_date=${tDate}&outlet_code=${outlet}`;
            const res = await cachedApiRequest(url, "GET", null, { forceRefresh: isRefresh });
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Daily Cash Report Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange, outlet]);

    const days = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    const handleExport = () => {
        const rows = days.map(d => ({
            "Date": d.date,
            "Opening Balance": d.opening_balance,
            "OP Cash Receipts": d.op_cash,
            "IP Advance Receipts": d.ip_advance_cash,
            "Discharge Cash Receipts": d.discharge_cash,
            "Pharmacy Cash Receipts": d.pharmacy_cash,
            "Misc Sundry Receipts": d.misc_cash,
            "Total Cash Inflow": d.total_inflow,
            "Counter Expenses Outflow": d.expenses_paid,
            "Sales Return Outflow": d.sales_return,
            "Net Closing Cash": d.closing_balance
        }));
        exportToExcel(rows, "Master_Daily_Cash_Book", "DailyCash");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Daily Cash Collection Report (Cash Book)
                            <span className="badge">Cash Book</span>
                        </h1>
                        <p>Consolidated daily cash statement showing opening balance, departmental receipts, payouts, and closing balance</p>
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
                            title="DailyCashReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Consolidated daily cash statement showing opening balance, departmental receipts, payouts, and closing balance"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Total Cash Inflow</span>
                            <span className="kpi-value">₹{formatINR(summary.total_cash_in)}</span>
                            <span className="kpi-subtitle">All departmental receipts</span>
                        </KPICard>
                        <KPICard $border="#ef4444">
                            <span className="kpi-title">Counter Expenses</span>
                            <span className="kpi-value">₹{formatINR(summary.total_expenses || summary.total_cash_out)}</span>
                            <span className="kpi-subtitle">Expense payment vouchers</span>
                        </KPICard>
                        <KPICard $border="#f97316">
                            <span className="kpi-title">Sales Returns</span>
                            <span className="kpi-value">₹{formatINR(summary.total_sales_return)}</span>
                            <span className="kpi-subtitle">Return & refund payouts</span>
                        </KPICard>
                        <KPICard $border="#10b981">
                            <span className="kpi-title">Net Cash Available</span>
                            <span className="kpi-value">₹{formatINR(summary.total_closing)}</span>
                            <span className="kpi-subtitle">Inflow - Outflow</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th className="text-right">Opening Bal (₹)</th>
                                    <th className="text-right">OP/Reg Cash (₹)</th>
                                    <th className="text-right">IP Advance (₹)</th>
                                    <th className="text-right">Discharge Cash (₹)</th>
                                    <th className="text-right">Pharmacy Cash (₹)</th>
                                    <th className="text-right">Total Inflow (₹)</th>
                                    <th className="text-right">Expenses Outflow (₹)</th>
                                    <th className="text-right">Sales Return (₹)</th>
                                    <th className="text-right">Net Closing Cash (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {days.map((d, idx) => (
                                    <tr key={idx}>
                                        <td><strong>{d.date}</strong></td>
                                        <td className="text-right font-mono">{formatINR(d.opening_balance)}</td>
                                        <td className="text-right font-mono">{formatINR(d.op_cash)}</td>
                                        <td className="text-right font-mono">{formatINR(d.ip_advance_cash)}</td>
                                        <td className="text-right font-mono">{formatINR(d.discharge_cash)}</td>
                                        <td className="text-right font-mono">{formatINR(d.pharmacy_cash)}</td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                            {formatINR(d.total_inflow)}
                                        </td>
                                        <td className="text-right font-mono" style={{ color: "#dc2626" }}>
                                            {cleanNum(d.expenses_paid) > 0 ? `-${formatINR(d.expenses_paid)}` : "0.00"}
                                        </td>
                                        <td className="text-right font-mono font-semibold" style={{ color: "#ea580c" }}>
                                            {cleanNum(d.sales_return) > 0 ? `-${formatINR(d.sales_return)}` : "0.00"}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                            {formatINR(d.closing_balance)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td><strong>PERIOD GRAND TOTAL</strong></td>
                                    <td className="text-right font-mono">-</td>
                                    <td className="text-right font-mono">₹{formatINR(days.reduce((a, x) => a + cleanNum(x.op_cash), 0))}</td>
                                    <td className="text-right font-mono">₹{formatINR(days.reduce((a, x) => a + cleanNum(x.ip_advance_cash), 0))}</td>
                                    <td className="text-right font-mono">₹{formatINR(days.reduce((a, x) => a + cleanNum(x.discharge_cash), 0))}</td>
                                    <td className="text-right font-mono">₹{formatINR(days.reduce((a, x) => a + cleanNum(x.pharmacy_cash), 0))}</td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                        ₹{formatINR(summary.total_cash_in || days.reduce((a, x) => a + cleanNum(x.total_inflow), 0))}
                                    </td>
                                    <td className="text-right font-mono" style={{ color: "#dc2626" }}>
                                        ₹{formatINR(summary.total_expenses || days.reduce((a, x) => a + cleanNum(x.expenses_paid), 0))}
                                    </td>
                                    <td className="text-right font-mono font-semibold" style={{ color: "#ea580c" }}>
                                        ₹{formatINR(summary.total_sales_return || days.reduce((a, x) => a + cleanNum(x.sales_return), 0))}
                                    </td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                        ₹{formatINR(summary.total_closing || days.reduce((a, x) => a + cleanNum(x.closing_balance), 0))}
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

export default MasterDailyCashReport;
