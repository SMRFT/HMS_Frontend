import React, { useState, useEffect, useCallback } from "react";
import { DatePicker, Select, Button, Spin } from "antd";
import dayjs from "dayjs";
import { Printer, Download, RefreshCw } from "lucide-react";
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

const MasterBillTypeWiseReport = ({
    isModalView = false,
    startDate,
    endDate,
    outlet: propOutlet,
    initialOutlet = "all",
    billType: propBillType,
    category: propCategory,
    onLoadOptions
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(propOutlet || initialOutlet || "all");
    const [category, setCategory] = useState(propCategory || propBillType || "All");
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
        const out = propOutlet || initialOutlet;
        if (out !== undefined && out !== outlet) {
            setOutlet(out);
        }
    }, [propOutlet, initialOutlet, outlet]);

    useEffect(() => {
        const cat = propCategory || propBillType;
        if (cat !== undefined && cat !== category) {
            setCategory(cat);
        }
    }, [propCategory, propBillType, category]);

    const fetchReport = useCallback(async (isRefresh = false) => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const effectiveCat = category || "All";
            const url = `${HmsBaseUrl}master-accounts/bill-type-wise-collection/?from_date=${fDate}&to_date=${tDate}&outlet_code=${outlet}&category=${encodeURIComponent(effectiveCat)}`;
            const res = await cachedApiRequest(url, "GET", null, { forceRefresh: isRefresh });
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Bill Type Wise Report Error:", err);
        } finally {
            setLoading(false);
        }
    }, [dateRange, outlet, category, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const billTypes = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    useEffect(() => {
        if (onLoadOptions && billTypes && billTypes.length > 0) {
            const cats = Array.from(new Set(billTypes.map(d => d.bill_type || d.category || d.department).filter(Boolean))).sort();
            onLoadOptions({
                categories: cats
            });
        }
    }, [onLoadOptions, billTypes]);

    const totalCash = billTypes.reduce((a, x) => a + cleanNum(x.cash), 0);
    const totalCard = billTypes.reduce((a, x) => a + cleanNum(x.card), 0);
    const totalCredit = billTypes.reduce((a, x) => a + cleanNum(x.credit), 0);
    const grandTotal = totalCash + totalCard + totalCredit;

    const handleExport = () => {
        const rows = billTypes.map(d => {
            const cash = cleanNum(d.cash);
            const card = cleanNum(d.card);
            const credit = cleanNum(d.credit);
            return {
                "Bill Type / Category": d.bill_type || d.category || d.department,
                "Bills Count": d.bills_count || d.bill_count || 0,
                "Cash Collection": cash,
                "Card & Bank": card,
                "Credit / Insurance": credit,
                "Total Revenue": cash + card + credit
            };
        });
        exportToExcel(rows, "Master_Bill_Type_Wise_Collection", "BillTypes");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                Bill Type-Wise Collection Report
                                <span className="badge">Revenue Breakdown</span>
                            </h1>
                            <p>Financial revenue performance grouped by hospital bill types, pharmacy, and diagnostic services</p>
                        </div>
                        <div className="btn-group no-print">
                            <Button icon={<Download size={15} />} onClick={handleExport}>
                                Excel Export
                            </Button>
                            <Button type="primary" icon={<Printer size={15} />} onClick={() => printReportArea("printable-billtype-report-area", "landscape")}>
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
                        <Button icon={<RefreshCw size={14} />} onClick={() => fetchReport(true)} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                </ControlCard>
            )}

            {loading ? (
                <div style={{ padding: "60px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-billtype-report-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title="Bill Type-Wise Collection Report"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Financial revenue performance grouped by hospital bill types, pharmacy, and diagnostic services"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                            <KPICard $border="#0ea5e9">
                                <span className="kpi-title">Cash Revenue</span>
                                <span className="kpi-value">₹{formatINR(totalCash)}</span>
                            </KPICard>
                            <KPICard $border="#6366f1">
                                <span className="kpi-title">Card & Electronic</span>
                                <span className="kpi-value">₹{formatINR(totalCard)}</span>
                            </KPICard>
                            <KPICard $border="#f59e0b">
                                <span className="kpi-title">Credit & Insurance</span>
                                <span className="kpi-value">₹{formatINR(totalCredit)}</span>
                            </KPICard>
                            <KPICard $border="#10b981">
                                <span className="kpi-title">Total Revenue</span>
                                <span className="kpi-value">₹{formatINR(grandTotal)}</span>
                            </KPICard>
                        </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>Bill Type / Category</th>
                                    <th className="text-center">Bills Count</th>
                                    <th className="text-right">Cash Revenue (₹)</th>
                                    <th className="text-right">Card & Bank (₹)</th>
                                    <th className="text-right">Credit / Insurance (₹)</th>
                                    <th className="text-right">Total Revenue (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billTypes.map((d, idx) => {
                                    const cashVal = cleanNum(d.cash);
                                    const cardVal = cleanNum(d.card);
                                    const creditVal = cleanNum(d.credit);
                                    const rowTot = cashVal + cardVal + creditVal;
                                    return (
                                        <tr key={idx}>
                                            <td><strong>{d.bill_type || d.category || d.department}</strong></td>
                                            <td className="text-center">{d.bills_count || d.bill_count || 0}</td>
                                            <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                                {formatINR(cashVal)}
                                            </td>
                                            <td className="text-right font-mono">{formatINR(cardVal)}</td>
                                            <td className="text-right font-mono">{formatINR(creditVal)}</td>
                                            <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                {formatINR(rowTot)}
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr className="total-row">
                                    <td><strong>ALL BILL TYPES TOTAL</strong></td>
                                    <td className="text-center">{billTypes.reduce((a, x) => a + cleanNum(x.bills_count || x.bill_count), 0)}</td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                        ₹{formatINR(totalCash)}
                                    </td>
                                    <td className="text-right font-mono">₹{formatINR(totalCard)}</td>
                                    <td className="text-right font-mono">₹{formatINR(totalCredit)}</td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                        ₹{formatINR(grandTotal)}
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

export default MasterBillTypeWiseReport;
