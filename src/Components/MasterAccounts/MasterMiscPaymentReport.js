import React, { useState, useEffect, useMemo } from "react";
import { DatePicker, Button, Spin, Tag, Input, Tabs } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw, Wallet } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import {
    formatINR,
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

const MasterMiscPaymentReport = ({ isModalView = false, startDate, endDate }) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
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
            const url = `${HmsBaseUrl}master-accounts/miscellaneous-payment/?from_date=${fDate}&to_date=${tDate}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Misc Payment Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const vouchers = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    const filtered = useMemo(() => {
        let list = vouchers;
        if (activeTab === "receipts") {
            list = list.filter(v => v.voucher_type === "Receipt");
        } else if (activeTab === "payments") {
            list = list.filter(v => v.voucher_type === "Payment");
        }
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(v =>
            String(v.voucher_no || "").toLowerCase().includes(q) ||
            String(v.account_head || "").toLowerCase().includes(q) ||
            String(v.paid_to_or_received_from || "").toLowerCase().includes(q) ||
            String(v.narration || "").toLowerCase().includes(q)
        );
    }, [vouchers, activeTab, searchTerm]);

    const handleExport = () => {
        const rows = filtered.map(v => ({
            "Voucher No": v.voucher_no,
            "Date": v.date,
            "Type": v.voucher_type,
            "Account Head": v.account_head,
            "Party Name": v.paid_to_or_received_from,
            "Amount": v.amount,
            "Cashier": v.cashier_name,
            "Narration": v.narration
        }));
        exportToExcel(rows, "Master_Misc_Payment_Report", "MiscVouchers");
    };

    const totalReceipts = filtered.filter(v => v.voucher_type === "Receipt").reduce((a, x) => a + (x.amount || 0), 0);
    const totalPayments = filtered.filter(v => v.voucher_type === "Payment").reduce((a, x) => a + (x.amount || 0), 0);

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Miscellaneous Payment Report
                            <span className="badge">Sundry Income & Payouts</span>
                        </h1>
                        <p>Sundry hospital receipts and counter expense vouchers (cash drawer payouts)</p>
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
                                placeholder="Search voucher / head / party..."
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
                )}
            </ControlCard>
            )}

            {loading ? (
                <div style={{ padding: "60px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-report-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title="MiscPaymentReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Sundry hospital receipts and counter expense vouchers (cash drawer payouts)"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#10b981">
                            <span className="kpi-title">Sundry Income Receipts</span>
                            <span className="kpi-value" style={{ color: "#059669" }}>₹{formatINR(summary.total_receipts || totalReceipts)}</span>
                            <span className="kpi-subtitle">Non-patient inflows</span>
                        </KPICard>
                        <KPICard $border="#ef4444">
                            <span className="kpi-title">Counter Expense Payments</span>
                            <span className="kpi-value" style={{ color: "#dc2626" }}>₹{formatINR(summary.total_payments || totalPayments)}</span>
                            <span className="kpi-subtitle">Drawer expense payouts</span>
                        </KPICard>
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Net Sundry Position</span>
                            <span className="kpi-value">₹{formatINR((summary.total_receipts || totalReceipts) - (summary.total_payments || totalPayments))}</span>
                            <span className="kpi-subtitle">Receipts - Payments</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>Voucher No</th>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Account Head</th>
                                    <th>Party / Payee</th>
                                    <th>Narration / Purpose</th>
                                    <th>Cashier</th>
                                    <th className="text-right">Receipt (₹)</th>
                                    <th className="text-right">Payment (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((v, idx) => {
                                    const isRec = v.voucher_type === "Receipt";
                                    return (
                                        <tr key={idx}>
                                            <td className="font-mono"><strong>{v.voucher_no}</strong></td>
                                            <td>{v.date}</td>
                                            <td>
                                                <Tag color={isRec ? "green" : "red"}>{v.voucher_type}</Tag>
                                            </td>
                                            <td><strong>{v.account_head || "Sundry"}</strong></td>
                                            <td>{v.paid_to_or_received_from || "-"}</td>
                                            <td>{v.narration || "-"}</td>
                                            <td>{v.cashier_name || "Counter"}</td>
                                            <td className="text-right font-mono" style={{ color: "#059669" }}>
                                                {isRec ? formatINR(v.amount) : "-"}
                                            </td>
                                            <td className="text-right font-mono" style={{ color: "#dc2626" }}>
                                                {!isRec ? formatINR(v.amount) : "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr className="total-row">
                                    <td colSpan={7}><strong>TOTAL VOUCHERS ({filtered.length} TRANSACTIONS)</strong></td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                        ₹{formatINR(totalReceipts)}
                                    </td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#dc2626" }}>
                                        ₹{formatINR(totalPayments)}
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

export default MasterMiscPaymentReport;
