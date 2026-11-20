import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DatePicker, Button, Spin, Tag, Input, Radio } from "antd";
import dayjs from "dayjs";
import { 
    Printer, 
    Download, 
    RefreshCw, 
    Layers, 
    ShoppingCart, 
    RotateCcw, 
    TrendingUp,
    Search 
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import {
    formatINR,
    exportToExcel,
    printReportArea,
    ReportPageWrapper,
    ControlCard,
    HeaderBar,
    FilterBar,
    KPIGrid,
    KPICard,
    ReportPrintHeader,
    ReportPrintFooter
} from "./masterAccountsHelper";

const { RangePicker } = DatePicker;

const MasterDaywiseSalesTaxRegister = ({
    isModalView = false,
    startDate,
    endDate,
    patientType: propPatientType = "all",
    billType,
    initialBillType,
    outlet = "all",
    initialOutlet
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    // Normalize patient type
    const normalizePt = (val) => {
        if (!val) return "all";
        const v = String(val).toLowerCase().trim();
        if (v.includes("ip") || v === "in-patient" || v === "inpatient") return "ip";
        if (v.includes("op") || v === "out-patient" || v === "outpatient") return "op";
        return "all";
    };

    const initialPt = normalizePt(propPatientType || billType || initialBillType);
    const selectedOutlet = outlet || initialOutlet || "all";

    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [activeTab, setActiveTab] = useState("sales"); // "sales", "returns", "net"
    const [patientType, setPatientType] = useState(initialPt);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const [dayWiseSales, setDayWiseSales] = useState([]);
    const [salesGt, setSalesGt] = useState(null);
    const [dayWiseReturns, setDayWiseReturns] = useState([]);
    const [returnsGt, setReturnsGt] = useState(null);
    const [dayWiseNet, setDayWiseNet] = useState([]);
    const [netGt, setNetGt] = useState(null);

    useEffect(() => {
        if (startDate && endDate) {
            setDateRange([dayjs(startDate), dayjs(endDate)]);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        const pt = normalizePt(propPatientType || billType || initialBillType);
        setPatientType(pt);
    }, [propPatientType, billType, initialBillType]);

    const fetchReport = useCallback(async () => {
        if (!dateRange[0] || !dateRange[1]) return;
        setLoading(true);
        try {
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const params = new URLSearchParams({
                from_date: fDate,
                to_date: tDate,
                report_type: "all",
                patient_type: patientType || "all",
            });
            if (selectedOutlet && selectedOutlet !== "all" && selectedOutlet !== "All") {
                params.set("outlet_code", selectedOutlet);
            }
            const res = await apiRequest(`${HmsBaseUrl}sales-tax-register/?${params.toString()}`, "GET");
            if (res?.success && res?.data) {
                setDayWiseSales(res.data.day_wise_sales || []);
                setSalesGt(res.data.day_wise_sales_grand_total || null);
                setDayWiseReturns(res.data.day_wise_returns || []);
                setReturnsGt(res.data.day_wise_returns_grand_total || null);
                setDayWiseNet(res.data.day_wise_net || []);
                setNetGt(res.data.day_wise_net_grand_total || null);
            }
        } catch (error) {
            console.error("MasterDaywiseSalesTaxRegister Error:", error);
        } finally {
            setLoading(false);
        }
    }, [dateRange, patientType, selectedOutlet, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const activeList = useMemo(() => {
        if (activeTab === "returns") return dayWiseReturns;
        if (activeTab === "sales") return dayWiseSales;
        return dayWiseNet;
    }, [activeTab, dayWiseSales, dayWiseReturns, dayWiseNet]);

    const activeGt = useMemo(() => {
        if (activeTab === "returns") return returnsGt;
        if (activeTab === "sales") return salesGt;
        return netGt;
    }, [activeTab, salesGt, returnsGt, netGt]);

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return activeList;
        const q = searchQuery.toLowerCase().trim();
        return activeList.filter(row =>
            (row.bill_date && String(row.bill_date).toLowerCase().includes(q)) ||
            (row.bill_name && String(row.bill_name).toLowerCase().includes(q)) ||
            (row.bills && String(row.bills).toLowerCase().includes(q))
        );
    }, [activeList, searchQuery]);

    // Check if 28% slab has any transactions to avoid rendering useless empty columns
    const has28Slab = useMemo(() => {
        return (activeGt?.rate_28?.total || 0) > 0 || filteredData.some(r => (r.rate_28?.total || 0) > 0);
    }, [activeGt, filteredData]);

    const isIpMode = patientType === "ip";

    const handleExportExcel = () => {
        if (!activeList || activeList.length === 0) return;
        const rows = filteredData.map(r => ({
            "Date": r.bill_date,
            "Particulars": r.bill_name,
            "Bills": r.bills,
            "Exempted Taxable": r.exempted?.taxable || 0,
            "Exempted Total": r.exempted?.total || 0,
            "5% Taxable": r.rate_5?.taxable || 0,
            "5% SGST": r.rate_5?.sgst || 0,
            "5% CGST": r.rate_5?.cgst || 0,
            "5% GST": (r.rate_5?.sgst || 0) + (r.rate_5?.cgst || 0),
            "5% Total": r.rate_5?.total || 0,
            "12% Taxable": r.rate_12?.taxable || 0,
            "12% SGST": r.rate_12?.sgst || 0,
            "12% CGST": r.rate_12?.cgst || 0,
            "12% GST": (r.rate_12?.sgst || 0) + (r.rate_12?.cgst || 0),
            "12% Total": r.rate_12?.total || 0,
            "18% Taxable": r.rate_18?.taxable || 0,
            "18% SGST": r.rate_18?.sgst || 0,
            "18% CGST": r.rate_18?.cgst || 0,
            "18% GST": (r.rate_18?.sgst || 0) + (r.rate_18?.cgst || 0),
            "18% Total": r.rate_18?.total || 0,
            "Total Taxable": r.total?.taxable || 0,
            "Total GST": (r.total?.sgst || 0) + (r.total?.cgst || 0),
            "Total Amount": r.total?.total || 0,
        }));
        if (activeGt) {
            rows.push({
                "Date": "GRAND TOTAL",
                "Particulars": "",
                "Bills": "",
                "Exempted Taxable": activeGt.exempted?.taxable || 0,
                "Exempted Total": activeGt.exempted?.total || 0,
                "5% Taxable": activeGt.rate_5?.taxable || 0,
                "5% SGST": activeGt.rate_5?.sgst || 0,
                "5% CGST": activeGt.rate_5?.cgst || 0,
                "5% GST": (activeGt.rate_5?.sgst || 0) + (activeGt.rate_5?.cgst || 0),
                "5% Total": activeGt.rate_5?.total || 0,
                "12% Taxable": activeGt.rate_12?.taxable || 0,
                "12% SGST": activeGt.rate_12?.sgst || 0,
                "12% CGST": activeGt.rate_12?.cgst || 0,
                "12% GST": (activeGt.rate_12?.sgst || 0) + (activeGt.rate_12?.cgst || 0),
                "12% Total": activeGt.rate_12?.total || 0,
                "18% Taxable": activeGt.rate_18?.taxable || 0,
                "18% SGST": activeGt.rate_18?.sgst || 0,
                "18% CGST": activeGt.rate_18?.cgst || 0,
                "18% GST": (activeGt.rate_18?.sgst || 0) + (activeGt.rate_18?.cgst || 0),
                "18% Total": activeGt.rate_18?.total || 0,
                "Total Taxable": activeGt.total?.taxable || 0,
                "Total GST": (activeGt.total?.sgst || 0) + (activeGt.total?.cgst || 0),
                "Total Amount": activeGt.total?.total || 0,
            });
        }
        exportToExcel(rows, `Daywise_GST_${activeTab.toUpperCase()}`, "GST_Register");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {/* Standalone Full-Page Control Card */}
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                Day-wise Sales Tax Register (GST)
                                <span className="badge">Output GST Slabs</span>
                            </h1>
                            <p>Daily breakdown across GST tax slabs (Exempted, 5%, 12%, 18%) for Sales, Sales Returns, and Net Sales</p>
                        </div>
                        <div className="btn-group no-print">
                            <Button icon={<Download size={15} />} onClick={handleExportExcel}>
                                Excel Export
                            </Button>
                            <Button type="primary" icon={<Printer size={15} />} onClick={() => printReportArea("printable-daywise-gst", "landscape")}>
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
                            <label>Patient Type:</label>
                            <Radio.Group 
                                value={patientType} 
                                onChange={(e) => setPatientType(e.target.value)}
                                buttonStyle="solid"
                                size="small"
                            >
                                <Radio.Button value="all">All (OP & IP)</Radio.Button>
                                <Radio.Button value="op">OP Only</Radio.Button>
                                <Radio.Button value="ip">IP Only</Radio.Button>
                            </Radio.Group>
                        </div>
                        <div className="filter-item">
                            <label>Search:</label>
                            <Input
                                placeholder="Search by date or bill..."
                                prefix={<Search size={14} style={{ color: "#94a3b8" }} />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: "200px" }}
                                allowClear
                            />
                        </div>
                        <Button icon={<RefreshCw size={14} />} onClick={fetchReport} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                </ControlCard>
            )}

            {/* Standalone Full-Page KPI Grid */}
            {!isModalView && (
                <KPIGrid>
                    <KPICard $border="#0284c7">
                        <span className="kpi-title">Total Taxable Value</span>
                        <span className="kpi-value">{formatINR(activeGt?.total?.taxable || 0)}</span>
                    </KPICard>
                    <KPICard $border="#059669">
                        <span className="kpi-title">5% Slab GST</span>
                        <span className="kpi-value">{formatINR((activeGt?.rate_5?.sgst || 0) + (activeGt?.rate_5?.cgst || 0))}</span>
                    </KPICard>
                    <KPICard $border="#d97706">
                        <span className="kpi-title">12% Slab GST</span>
                        <span className="kpi-value">{formatINR((activeGt?.rate_12?.sgst || 0) + (activeGt?.rate_12?.cgst || 0))}</span>
                    </KPICard>
                    <KPICard $border="#7c3aed">
                        <span className="kpi-title">Total Invoiced Amount</span>
                        <span className="kpi-value">{formatINR(activeGt?.total?.total || 0)}</span>
                    </KPICard>
                </KPIGrid>
            )}

            {/* Sleek, Compact Register Tab Selector (Gross Sales / Returns / Net) */}
            <div 
                className="no-print" 
                style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: isModalView ? "8px" : "14px", 
                    padding: "4px 8px", 
                    background: "#f8fafc", 
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0"
                }}
            >
                <div style={{ display: "flex", gap: "6px" }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab("sales")}
                        style={{
                            padding: "4px 10px",
                            borderRadius: "5px",
                            border: "1px solid",
                            borderColor: activeTab === "sales" ? "#0284c7" : "#cbd5e1",
                            cursor: "pointer",
                            fontWeight: "700",
                            fontSize: "0.78rem",
                            background: activeTab === "sales" ? "#0284c7" : "#ffffff",
                            color: activeTab === "sales" ? "#ffffff" : "#334155",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            transition: "all 0.15s ease"
                        }}
                    >
                        <ShoppingCart size={13} />
                        Gross Sales ({dayWiseSales.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("returns")}
                        style={{
                            padding: "4px 10px",
                            borderRadius: "5px",
                            border: "1px solid",
                            borderColor: activeTab === "returns" ? "#0284c7" : "#cbd5e1",
                            cursor: "pointer",
                            fontWeight: "700",
                            fontSize: "0.78rem",
                            background: activeTab === "returns" ? "#0284c7" : "#ffffff",
                            color: activeTab === "returns" ? "#ffffff" : "#334155",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            transition: "all 0.15s ease"
                        }}
                    >
                        <RotateCcw size={13} />
                        Sales Returns ({dayWiseReturns.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("net")}
                        style={{
                            padding: "4px 10px",
                            borderRadius: "5px",
                            border: "1px solid",
                            borderColor: activeTab === "net" ? "#0284c7" : "#cbd5e1",
                            cursor: "pointer",
                            fontWeight: "700",
                            fontSize: "0.78rem",
                            background: activeTab === "net" ? "#0284c7" : "#ffffff",
                            color: activeTab === "net" ? "#ffffff" : "#334155",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            transition: "all 0.15s ease"
                        }}
                    >
                        <TrendingUp size={13} />
                        Net Sales ({dayWiseNet.length})
                    </button>
                </div>

                <div style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: "600" }}>
                    Active View: <strong style={{ color: "#0f172a" }}>{activeTab === "sales" ? "Gross Sales" : activeTab === "returns" ? "Sales Returns" : "Net Sales"}</strong> | Slices: <strong style={{ color: "#0284c7" }}>{filteredData.length}</strong>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: "60px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-daywise-gst" style={{ width: "100%" }}>
                    {/* Only render header in standalone full-page view; A4MultiPageViewer renders its own official letterhead */}
                    {!isModalView && (
                        <ReportPrintHeader 
                            title={`Day-Wise Sales Tax Register (${activeTab.toUpperCase()})`}
                            fromDate={dateRange[0]?.format("YYYY-MM-DD")}
                            toDate={dateRange[1]?.format("YYYY-MM-DD")}
                            typeDesc={`GST Output Register across slabs (Exempted, 5%, 12%, 18%) | ${patientType.toUpperCase()}`}
                        />
                    )}

                    {/* High-Definition 100% Fit Formal A4 Table Container (Zero Horizontal Scrollbar) */}
                    <div style={{ width: "100%", overflowX: isModalView ? "visible" : "auto" }}>
                        <table 
                            style={{ 
                                width: "100%", 
                                borderCollapse: "collapse",
                                fontSize: isModalView ? "8.5px" : "11px",
                                tableLayout: "auto",
                                color: "#000000"
                            }}
                        >
                            <thead>
                                <tr style={{ background: "#f1f5f9", borderTop: "1.5px solid #000", borderBottom: "1px solid #000" }}>
                                    <th rowSpan="2" style={{ textAlign: "center", width: "24px", padding: "4px 2px", border: "1px solid #cbd5e1" }}>#</th>
                                    <th rowSpan="2" style={{ width: "66px", padding: "4px 4px", whiteSpace: "nowrap", border: "1px solid #cbd5e1" }}>Date</th>
                                    <th rowSpan="2" style={{ width: "150px", padding: "4px 4px", border: "1px solid #cbd5e1" }}>Particulars</th>
                                    <th rowSpan="2" style={{ width: "130px", padding: "4px 4px", border: "1px solid #cbd5e1" }}>Bill Numbers</th>
                                    <th colSpan="2" style={{ textAlign: "center", background: "#f8fafc", padding: "3px 4px", border: "1px solid #cbd5e1" }}>Exempted</th>
                                    <th colSpan="3" style={{ textAlign: "center", background: "#f0fdf4", padding: "3px 4px", border: "1px solid #cbd5e1" }}>5% GST Slab</th>
                                    <th colSpan="3" style={{ textAlign: "center", background: "#fefce8", padding: "3px 4px", border: "1px solid #cbd5e1" }}>12% GST Slab</th>
                                    <th colSpan="3" style={{ textAlign: "center", background: "#fdf4ff", padding: "3px 4px", border: "1px solid #cbd5e1" }}>18% GST Slab</th>
                                    {has28Slab && (
                                        <th colSpan="3" style={{ textAlign: "center", background: "#faf5ff", padding: "3px 4px", border: "1px solid #cbd5e1" }}>28% GST Slab</th>
                                    )}
                                    <th colSpan="3" style={{ textAlign: "center", background: "#e0f2fe", padding: "3px 4px", border: "1px solid #000" }}>Grand Total</th>
                                </tr>
                                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #000" }}>
                                    {/* Exempted */}
                                    <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1" }}>Taxable</th>
                                    <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1" }}>Total</th>
                                    {/* 5% */}
                                    <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1" }}>Taxable</th>
                                    <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1" }}>GST</th>
                                    <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1" }}>Total</th>
                                    {/* 12% */}
                                    <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1" }}>Taxable</th>
                                    <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1" }}>GST</th>
                                    <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1" }}>Total</th>
                                    {/* 18% */}
                                    <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1" }}>Taxable</th>
                                    <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1" }}>GST</th>
                                    <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1" }}>Total</th>
                                    {/* 28% */}
                                    {has28Slab && (
                                        <>
                                            <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1" }}>Taxable</th>
                                            <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1" }}>GST</th>
                                            <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1" }}>Total</th>
                                        </>
                                    )}
                                    {/* Grand Total */}
                                    <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1", fontWeight: "700" }}>Taxable</th>
                                    <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #cbd5e1", fontWeight: "700" }}>Total GST</th>
                                    <th style={{ textAlign: "right", padding: "3px 3px", border: "1px solid #000", fontWeight: "800" }}>Net Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={has28Slab ? 21 : 18} style={{ textAlign: "center", padding: "36px", color: "#64748b" }}>
                                            No day-wise GST transaction records found for the selected filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((row, idx) => {
                                        const r5Gst = (row.rate_5?.sgst || 0) + (row.rate_5?.cgst || 0);
                                        const r12Gst = (row.rate_12?.sgst || 0) + (row.rate_12?.cgst || 0);
                                        const r18Gst = (row.rate_18?.sgst || 0) + (row.rate_18?.cgst || 0);
                                        const r28Gst = (row.rate_28?.sgst || 0) + (row.rate_28?.cgst || 0);
                                        const totGst = (row.total?.sgst || 0) + (row.total?.cgst || 0);
                                        return (
                                            <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#fcfcfd" }}>
                                                <td style={{ textAlign: "center", color: "#64748b", padding: "3px 2px", border: "0.5px solid #e2e8f0" }}>{idx + 1}</td>
                                                <td style={{ fontWeight: "700", whiteSpace: "nowrap", padding: "3px 4px", border: "0.5px solid #e2e8f0" }}>{row.bill_date}</td>
                                                <td style={{ fontWeight: "600", padding: "3px 4px", border: "0.5px solid #e2e8f0", whiteSpace: "nowrap" }}>{row.bill_name || "—"}</td>
                                                <td style={{ fontSize: isModalView ? "7.5px" : "10px", color: "#475569", padding: "3px 4px", border: "0.5px solid #e2e8f0" }}>{row.bills || "—"}</td>
                                                {/* Exempted */}
                                                <td style={{ textAlign: "right", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(row.exempted?.taxable || 0)}</td>
                                                <td style={{ textAlign: "right", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(row.exempted?.total || 0)}</td>
                                                {/* 5% */}
                                                <td style={{ textAlign: "right", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(row.rate_5?.taxable || 0)}</td>
                                                <td style={{ textAlign: "right", color: "#047857", fontWeight: "600", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(r5Gst)}</td>
                                                <td style={{ textAlign: "right", fontWeight: "600", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(row.rate_5?.total || 0)}</td>
                                                {/* 12% */}
                                                <td style={{ textAlign: "right", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(row.rate_12?.taxable || 0)}</td>
                                                <td style={{ textAlign: "right", color: "#b45309", fontWeight: "600", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(r12Gst)}</td>
                                                <td style={{ textAlign: "right", fontWeight: "600", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(row.rate_12?.total || 0)}</td>
                                                {/* 18% */}
                                                <td style={{ textAlign: "right", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(row.rate_18?.taxable || 0)}</td>
                                                <td style={{ textAlign: "right", color: "#6d28d9", fontWeight: "600", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(r18Gst)}</td>
                                                <td style={{ textAlign: "right", fontWeight: "600", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(row.rate_18?.total || 0)}</td>
                                                {/* 28% */}
                                                {has28Slab && (
                                                    <>
                                                        <td style={{ textAlign: "right", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(row.rate_28?.taxable || 0)}</td>
                                                        <td style={{ textAlign: "right", color: "#9333ea", fontWeight: "600", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(r28Gst)}</td>
                                                        <td style={{ textAlign: "right", fontWeight: "600", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(row.rate_28?.total || 0)}</td>
                                                    </>
                                                )}
                                                {/* Total */}
                                                <td style={{ textAlign: "right", fontWeight: "700", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(row.total?.taxable || 0)}</td>
                                                <td style={{ textAlign: "right", fontWeight: "700", color: "#0369a1", padding: "3px 3px", border: "0.5px solid #e2e8f0" }}>{formatINR(totGst)}</td>
                                                <td style={{ textAlign: "right", fontWeight: "800", color: "#0f172a", padding: "3px 3px", border: "0.5px solid #000" }}>{formatINR(row.total?.total || 0)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                            {activeGt && (
                                <tfoot>
                                    <tr style={{ background: "#f1f5f9", fontWeight: "800", borderTop: "2px solid #000", borderBottom: "2.5px double #000" }}>
                                        <td colSpan="4" style={{ textAlign: "right", fontWeight: "800", padding: "5px 6px", border: "1px solid #cbd5e1" }}>GRAND TOTAL:</td>
                                        <td style={{ textAlign: "right", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR(activeGt.exempted?.taxable || 0)}</td>
                                        <td style={{ textAlign: "right", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR(activeGt.exempted?.total || 0)}</td>
                                        <td style={{ textAlign: "right", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR(activeGt.rate_5?.taxable || 0)}</td>
                                        <td style={{ textAlign: "right", color: "#047857", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR((activeGt.rate_5?.sgst || 0) + (activeGt.rate_5?.cgst || 0))}</td>
                                        <td style={{ textAlign: "right", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR(activeGt.rate_5?.total || 0)}</td>
                                        <td style={{ textAlign: "right", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR(activeGt.rate_12?.taxable || 0)}</td>
                                        <td style={{ textAlign: "right", color: "#b45309", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR((activeGt.rate_12?.sgst || 0) + (activeGt.rate_12?.cgst || 0))}</td>
                                        <td style={{ textAlign: "right", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR(activeGt.rate_12?.total || 0)}</td>
                                        <td style={{ textAlign: "right", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR(activeGt.rate_18?.taxable || 0)}</td>
                                        <td style={{ textAlign: "right", color: "#6d28d9", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR((activeGt.rate_18?.sgst || 0) + (activeGt.rate_18?.cgst || 0))}</td>
                                        <td style={{ textAlign: "right", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR(activeGt.rate_18?.total || 0)}</td>
                                        {has28Slab && (
                                            <>
                                                <td style={{ textAlign: "right", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR(activeGt.rate_28?.taxable || 0)}</td>
                                                <td style={{ textAlign: "right", color: "#9333ea", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR((activeGt.rate_28?.sgst || 0) + (activeGt.rate_28?.cgst || 0))}</td>
                                                <td style={{ textAlign: "right", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR(activeGt.rate_28?.total || 0)}</td>
                                            </>
                                        )}
                                        <td style={{ textAlign: "right", fontWeight: "800", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR(activeGt.total?.taxable || 0)}</td>
                                        <td style={{ textAlign: "right", fontWeight: "800", color: "#0369a1", padding: "5px 3px", border: "1px solid #cbd5e1" }}>{formatINR((activeGt.total?.sgst || 0) + (activeGt.total?.cgst || 0))}</td>
                                        <td style={{ textAlign: "right", fontWeight: "800", color: "#0f172a", padding: "5px 3px", border: "1.5px solid #000" }}>{formatINR(activeGt.total?.total || 0)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Only render signature blocks in standalone full-page view; A4MultiPageViewer renders its own official signatures */}
                    {!isModalView && <ReportPrintFooter />}
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterDaywiseSalesTaxRegister;
