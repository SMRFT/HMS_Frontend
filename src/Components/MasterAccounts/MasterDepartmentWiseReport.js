import React, { useState, useEffect } from "react";
import { DatePicker, Select, Button, Spin } from "antd";
import dayjs from "dayjs";
import { Printer, Download, RefreshCw, Building2 } from "lucide-react";
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

const MasterDepartmentWiseReport = ({ isModalView = false, startDate, endDate, initialOutlet = "all" }) => {
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



    const fetchReport = async () => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/department-wise-collection/?from_date=${fDate}&to_date=${tDate}&outlet_code=${outlet}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Department Wise Report Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange, outlet]);

    const depts = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    const handleExport = () => {
        const rows = depts.map(d => ({
            "Department": d.department,
            "Bills Count": d.bills_count,
            "Cash Collection": d.cash,
            "Card & Bank": d.card,
            "Credit / Insurance": d.credit,
            "Total Revenue": d.total,
            "Revenue Contribution %": d.share_pct
        }));
        exportToExcel(rows, "Master_Department_Wise_Collection", "Departments");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Department-Wise Collection Report
                            <span className="badge">Revenue Breakdown</span>
                        </h1>
                        <p>Financial revenue performance grouped by clinical departments, pharmacy, and diagnostic services</p>
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
                            title="DepartmentWiseReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Financial revenue performance grouped by clinical departments, pharmacy, and diagnostic services"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Cash Revenue</span>
                            <span className="kpi-value">₹{formatINR(summary.total_cash)}</span>
                        </KPICard>
                        <KPICard $border="#6366f1">
                            <span className="kpi-title">Card & Electronic</span>
                            <span className="kpi-value">₹{formatINR(summary.total_card)}</span>
                        </KPICard>
                        <KPICard $border="#f59e0b">
                            <span className="kpi-title">Credit & Insurance</span>
                            <span className="kpi-value">₹{formatINR(summary.total_credit)}</span>
                        </KPICard>
                        <KPICard $border="#10b981">
                            <span className="kpi-title">Total Revenue</span>
                            <span className="kpi-value">₹{formatINR(summary.grand_total)}</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>Department</th>
                                    <th className="text-center">Bills Count</th>
                                    <th className="text-right">Cash Revenue (₹)</th>
                                    <th className="text-right">Card & Bank (₹)</th>
                                    <th className="text-right">Credit / Insurance (₹)</th>
                                    <th className="text-right">Total Revenue (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {depts.map((d, idx) => {
                                    const rowTot = cleanNum(d.total || d.total_revenue) || (cleanNum(d.cash) + cleanNum(d.card) + cleanNum(d.credit));
                                    return (
                                        <tr key={idx}>
                                            <td><strong>{d.department}</strong></td>
                                            <td className="text-center">{d.bills_count || d.bill_count || 0}</td>
                                            <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                                {formatINR(d.cash)}
                                            </td>
                                            <td className="text-right font-mono">{formatINR(d.card)}</td>
                                            <td className="text-right font-mono">{formatINR(d.credit)}</td>
                                            <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                {formatINR(rowTot)}
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr className="total-row">
                                    <td><strong>ALL DEPARTMENTS TOTAL</strong></td>
                                    <td className="text-center">{depts.reduce((a, x) => a + cleanNum(x.bills_count || x.bill_count), 0)}</td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                        ₹{formatINR(summary.total_cash || depts.reduce((a, x) => a + cleanNum(x.cash), 0))}
                                    </td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_card || depts.reduce((a, x) => a + cleanNum(x.card), 0))}</td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_credit || depts.reduce((a, x) => a + cleanNum(x.credit), 0))}</td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                        ₹{formatINR(summary.grand_total || depts.reduce((a, x) => a + (cleanNum(x.total || x.total_revenue) || (cleanNum(x.cash) + cleanNum(x.card) + cleanNum(x.credit))), 0))}
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

export default MasterDepartmentWiseReport;
