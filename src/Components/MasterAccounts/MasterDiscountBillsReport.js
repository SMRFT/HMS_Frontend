import React, { useState, useEffect, useMemo } from "react";
import { DatePicker, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw, Percent } from "lucide-react";
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
    ReportPrintFooter,
    matchCategoryOrBillType
} from "./masterAccountsHelper";

const { RangePicker } = DatePicker;

const MasterDiscountBillsReport = ({ 
    isModalView = false, 
    startDate, 
    endDate,
    billType,
    category,
    initialBillType = "all",
    onLoadOptions
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState(billType || category || initialBillType || "all");

    useEffect(() => {
        const c = billType || category || initialBillType;
        if (c !== undefined && c !== activeCategory) {
            setActiveCategory(c);
        }
    }, [billType, category, initialBillType, activeCategory]);

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
            const url = `${HmsBaseUrl}master-accounts/discount-bills/?from_date=${fDate}&to_date=${tDate}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Discount Bills Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const records = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    const categoriesList = useMemo(() => {
        const set = new Set();
        records.forEach(r => {
            if (r.category) set.add(String(r.category).trim());
        });
        return Array.from(set).sort();
    }, [records]);

    useEffect(() => {
        if (onLoadOptions && reportData) {
            onLoadOptions({
                categories: categoriesList
            });
        }
    }, [onLoadOptions, categoriesList, reportData]);

    const filtered = useMemo(() => {
        let list = records;
        if (activeCategory && activeCategory.toLowerCase() !== "all") {
            list = list.filter(r => matchCategoryOrBillType(r.category, activeCategory));
        }
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(r =>
            String(r.bill_no || "").toLowerCase().includes(q) ||
            String(r.patient_name || "").toLowerCase().includes(q) ||
            String(r.doctor_name || "").toLowerCase().includes(q) ||
            String(r.authorized_by || "").toLowerCase().includes(q) ||
            String(r.category || "").toLowerCase().includes(q)
        );
    }, [records, activeCategory, searchTerm]);

    const handleExport = () => {
        const rows = filtered.map(r => ({
            "Bill No": r.bill_no,
            "Date": r.date,
            "Category": r.category,
            "UHID": r.mr_no,
            "Patient Name": r.patient_name,
            "Gross Bill Amount": r.bill_amount,
            "Discount Concession": r.discount_amount,
            "Net Billed": r.net_amount,
            "Authorized By": r.authorized_by || r.doctor_name,
            "Reason": r.reason
        }));
        exportToExcel(rows, "Master_Discount_Bills_Register", "Discounts");
    };

    const totalDiscount = filtered.reduce((a, x) => a + cleanNum(x.discount_amount), 0);

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Discount Bills Register
                            <span className="badge">Concessions & Waivers</span>
                        </h1>
                        <p>Hospital management concessions, doctor waivers, and authorized billing discounts</p>
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
                                placeholder="Search bill / patient / authorizer..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 240 }}
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
                            title="DiscountBillsReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Hospital management concessions, doctor waivers, and authorized billing discounts"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#f59e0b">
                            <span className="kpi-title">Total Concessions Allowed</span>
                            <span className="kpi-value" style={{ color: "#d97706" }}>₹{formatINR(totalDiscount)}</span>
                            <span className="kpi-subtitle">Waivers & discounts</span>
                        </KPICard>
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Discounted Bills Count</span>
                            <span className="kpi-value">{filtered.length}</span>
                            <span className="kpi-subtitle">Authorized transactions</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>Bill No</th>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>UHID</th>
                                    <th>Patient Name</th>
                                    <th>Authorized By / Doctor</th>
                                    <th>Reason</th>
                                    <th className="text-right">Gross (₹)</th>
                                    <th className="text-right">Discount (₹)</th>
                                    <th className="text-right">Net Billed (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r, idx) => (
                                    <tr key={idx}>
                                        <td className="font-mono"><strong>{r.bill_no}</strong></td>
                                        <td>{r.date}</td>
                                        <td><Tag color="orange">{r.category}</Tag></td>
                                        <td className="font-mono">{r.mr_no || "-"}</td>
                                        <td>{r.patient_name}</td>
                                        <td>{r.authorized_by || r.doctor_name || "Management"}</td>
                                        <td>{r.reason || "Doctor Discretion"}</td>
                                        <td className="text-right font-mono">{formatINR(r.bill_amount)}</td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#d97706" }}>
                                            {formatINR(r.discount_amount)}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                            {formatINR(r.net_amount)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={7}><strong>TOTAL CONCESSIONS ({filtered.length} BILLS)</strong></td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_bill_amount || filtered.reduce((a, x) => a + cleanNum(x.bill_amount), 0))}</td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#d97706" }}>
                                        ₹{formatINR(summary.total_discount_amount || totalDiscount)}
                                    </td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                        ₹{formatINR(summary.total_net_amount || filtered.reduce((a, x) => a + cleanNum(x.net_amount), 0))}
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

export default MasterDiscountBillsReport;
