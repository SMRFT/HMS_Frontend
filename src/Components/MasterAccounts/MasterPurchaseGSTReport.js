import React, { useState, useEffect } from "react";
import { DatePicker, Button, Spin, Tag, Input, Tabs } from "antd";
import dayjs from "dayjs";
import { Printer, Download, RefreshCw, FileSpreadsheet, Search } from "lucide-react";
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

const MasterPurchaseGSTReport = ({
    isModalView = false,
    startDate,
    endDate,
    defaultSourceType = "all", // "drug" | "stores" | "all"
    defaultTab = "b2b", // "b2b" | "hsn" | "docs"
    lockedSourceType = false,
    lockedTab = false,
    title = null
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [activeTab, setActiveTab] = useState(defaultTab || "b2b");
    const [sourceType, setSourceType] = useState(defaultSourceType || "all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        if (startDate && endDate) {
            setDateRange([dayjs(startDate), dayjs(endDate)]);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        if (defaultTab) setActiveTab(defaultTab);
    }, [defaultTab]);

    useEffect(() => {
        if (defaultSourceType) setSourceType(defaultSourceType);
    }, [defaultSourceType]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/purchase-gst-consolidated/?from_date=${fDate}&to_date=${tDate}&source_type=${sourceType}&search=${encodeURIComponent(searchTerm)}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Purchase GST Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange, sourceType]);

    const rawInvoices = getSafeArray(reportData?.b2b_data || reportData?.invoices);
    const rawHsn = getSafeArray(reportData?.hsn_data || reportData?.hsn_summary);
    const rawDocs = getSafeArray(reportData?.docs_data || reportData?.document_summary);
    const summary = reportData?.summary || {};

    // Filter by search term locally if needed
    const invoices = rawInvoices.filter(i => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
            (i.invoice_no || "").toLowerCase().includes(s) ||
            (i.grn_no || "").toLowerCase().includes(s) ||
            (i.supplier_name || i.vendor_name || "").toLowerCase().includes(s) ||
            (i.supplier_gstin || i.gstin || "").toLowerCase().includes(s)
        );
    });

    const hsnSummary = rawHsn.filter(h => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
            (h.hsn || h.hsn_code || "").toLowerCase().includes(s) ||
            (h.description || "").toLowerCase().includes(s)
        );
    });

    const docSummaryList = rawDocs;

    // Determine Display Title
    const displayTitle = title || (
        sourceType === "drug"
            ? (activeTab === "b2b" ? "Drug Purchase - B2B Invoices" : activeTab === "hsn" ? "Drug Purchase - HSN Wise Summary" : "Drug Purchase - Document Summary")
            : sourceType === "stores"
            ? (activeTab === "b2b" ? "General Stores - B2B Invoices" : activeTab === "hsn" ? "General Stores - HSN Wise Summary" : "General Stores - Document Summary")
            : "Purchase GST Register - Consolidated (GSTR-1)"
    );

    const handleExport = () => {
        if (activeTab === "b2b") {
            const rows = invoices.map(i => ({
                "Invoice No": i.invoice_no || i.grn_no,
                "Date": i.invoice_date || i.date,
                "Supplier Name": i.supplier_name || i.vendor_name,
                "Supplier GSTIN": i.supplier_gstin || i.gstin,
                "Source": i.source_type || (sourceType === "drug" ? "Drug Purchase" : "General Stores"),
                "Rate (%)": i.tax_rate,
                "Taxable Value": i.taxable_value,
                "Input CGST": i.cgst || i.cgst_amount,
                "Input SGST": i.sgst || i.sgst_amount,
                "Total Invoice Value": i.invoice_value || i.total_invoice_value
            }));
            exportToExcel(rows, `${displayTitle.replace(/[^a-zA-Z0-9]/g, '_')}_B2B`, "B2B_Purchases");
        } else if (activeTab === "hsn") {
            const rows = hsnSummary.map(h => ({
                "HSN Code": h.hsn || h.hsn_code,
                "Description": h.description,
                "UOM": h.uom || "Numbers",
                "Total Quantity": h.total_quantity || h.quantity,
                "Rate (%)": h.tax_rate,
                "Taxable Value": h.taxable_value,
                "Input CGST": h.cgst || h.cgst_amount,
                "Input SGST": h.sgst || h.sgst_amount,
                "Total Tax": (h.cgst || h.cgst_amount || 0) + (h.sgst || h.sgst_amount || 0)
            }));
            exportToExcel(rows, `${displayTitle.replace(/[^a-zA-Z0-9]/g, '_')}_HSN`, "HSN_Summary");
        } else {
            const rows = docSummaryList.map(d => ({
                "Particulars": d.particulars,
                "Sr No From": d.sl_no_from || d.serial_from || "-",
                "Sr No To": d.sl_no_to || d.serial_to || "-",
                "Total Number": d.total_count || d.total_number,
                "Cancelled": d.cancelled || d.cancelled_number || 0,
                "Net Issued": d.net_issued || d.total_count
            }));
            exportToExcel(rows, `${displayTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Docs`, "Docs_Summary");
        }
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                {displayTitle}
                                <span className="badge">Winman GSTR-1</span>
                            </h1>
                            <p>Inward supplier purchase invoice register covering Drug Purchase & General Stores with GST ITC breakdowns</p>
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

                        {!lockedSourceType && (
                            <div className="filter-item">
                                <label>Purchase Source:</label>
                                <select value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
                                    <option value="all">Consolidated (All Purchases)</option>
                                    <option value="drug">Drug Purchase (Pharmacy)</option>
                                    <option value="stores">General Stores</option>
                                </select>
                            </div>
                        )}

                        <div className="filter-item">
                            <label>Search:</label>
                            <Input
                                placeholder="Search invoice, vendor, HSN..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 220 }}
                                allowClear
                            />
                        </div>

                        <Button icon={<RefreshCw size={14} />} onClick={fetchReport} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                </ControlCard>
            )}

            {!lockedTab && (
                <div className="no-print" style={{ marginBottom: "16px" }}>
                    <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
                        <Tabs.TabPane tab="1. B2B Invoices Register" key="b2b" />
                        <Tabs.TabPane tab="2. HSN-Wise Summary" key="hsn" />
                        <Tabs.TabPane tab="3. Document Summary" key="docs" />
                    </Tabs>
                </div>
            )}

            {loading ? (
                <div style={{ padding: "60px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-report-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title={displayTitle}
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Inward supplier purchase invoice register with GST ITC breakdowns"
                        />
                    )}

                    {!isModalView && (
                        <KPIGrid className="no-print">
                            <KPICard $border="#0ea5e9">
                                <span className="kpi-title">Taxable Value</span>
                                <span className="kpi-value">₹{formatINR(summary.total_taxable_value || summary.total_taxable)}</span>
                            </KPICard>
                            <KPICard $border="#6366f1">
                                <span className="kpi-title">Total Input CGST</span>
                                <span className="kpi-value">₹{formatINR(summary.total_cgst || summary.total_itc_cgst)}</span>
                            </KPICard>
                            <KPICard $border="#10b981">
                                <span className="kpi-title">Total Input SGST</span>
                                <span className="kpi-value">₹{formatINR(summary.total_sgst || summary.total_itc_sgst)}</span>
                            </KPICard>
                            <KPICard $border="#f59e0b">
                                <span className="kpi-title">Total Inward Value</span>
                                <span className="kpi-value">₹{formatINR(summary.total_invoice_value || summary.total_purchase_value)}</span>
                            </KPICard>
                        </KPIGrid>
                    )}

                    {activeTab === "b2b" && (
                        <DataTableWrapper>
                            <table>
                                <thead>
                                    <tr>
                                        <th>GRN / Inv No</th>
                                        <th>Date</th>
                                        <th>Supplier Name</th>
                                        <th>GSTIN</th>
                                        <th>Source</th>
                                        <th className="text-center">Rate</th>
                                        <th className="text-right">Taxable Value (₹)</th>
                                        <th className="text-right">Input CGST (₹)</th>
                                        <th className="text-right">Input SGST (₹)</th>
                                        <th className="text-right">Total Value (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                                No purchase invoices found for this date range and scope.
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.map((i, idx) => (
                                            <tr key={idx}>
                                                <td className="font-mono"><strong>{i.invoice_no || i.grn_no}</strong></td>
                                                <td>{i.invoice_date || i.date}</td>
                                                <td><strong>{i.supplier_name || i.vendor_name}</strong></td>
                                                <td className="font-mono">{i.supplier_gstin || i.gstin || "-"}</td>
                                                <td>
                                                    <Tag color={i.source_type === "Drug Purchase" ? "blue" : "purple"}>
                                                        {i.source_type || (sourceType === "drug" ? "Drug Purchase" : "General Stores")}
                                                    </Tag>
                                                </td>
                                                <td className="text-center">{i.tax_rate ? `${i.tax_rate}%` : "-"}</td>
                                                <td className="text-right font-mono">{formatINR(i.taxable_value)}</td>
                                                <td className="text-right font-mono">{formatINR(i.cgst || i.cgst_amount)}</td>
                                                <td className="text-right font-mono">{formatINR(i.sgst || i.sgst_amount)}</td>
                                                <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                    {formatINR(i.invoice_value || i.total_invoice_value)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    {invoices.length > 0 && (
                                        <tr className="total-row">
                                            <td colSpan={6}><strong>TOTAL PURCHASES ({invoices.length} INVOICES)</strong></td>
                                            <td className="text-right font-mono">₹{formatINR(summary.total_taxable_value || summary.total_taxable)}</td>
                                            <td className="text-right font-mono">₹{formatINR(summary.total_cgst || summary.total_itc_cgst)}</td>
                                            <td className="text-right font-mono">₹{formatINR(summary.total_sgst || summary.total_itc_sgst)}</td>
                                            <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                ₹{formatINR(summary.total_invoice_value || summary.total_purchase_value)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </DataTableWrapper>
                    )}

                    {activeTab === "hsn" && (
                        <DataTableWrapper>
                            <table>
                                <thead>
                                    <tr>
                                        <th>HSN Code</th>
                                        <th>Description</th>
                                        <th>UOM</th>
                                        <th className="text-center">Total Quantity</th>
                                        <th className="text-center">Tax Rate</th>
                                        <th className="text-right">Taxable Value (₹)</th>
                                        <th className="text-right">Input CGST (₹)</th>
                                        <th className="text-right">Input SGST (₹)</th>
                                        <th className="text-right">Total Tax (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hsnSummary.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                                No HSN summary data found for this date range and scope.
                                            </td>
                                        </tr>
                                    ) : (
                                        hsnSummary.map((h, idx) => {
                                            const cgst = h.cgst || h.cgst_amount || 0;
                                            const sgst = h.sgst || h.sgst_amount || 0;
                                            return (
                                                <tr key={idx}>
                                                    <td className="font-mono"><strong>{h.hsn || h.hsn_code}</strong></td>
                                                    <td>{h.description}</td>
                                                    <td>{h.uom || "Numbers"}</td>
                                                    <td className="text-center">{h.total_quantity || h.quantity}</td>
                                                    <td className="text-center">{h.tax_rate !== undefined ? `${h.tax_rate}%` : "-"}</td>
                                                    <td className="text-right font-mono">{formatINR(h.taxable_value)}</td>
                                                    <td className="text-right font-mono">{formatINR(cgst)}</td>
                                                    <td className="text-right font-mono">{formatINR(sgst)}</td>
                                                    <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                                        {formatINR(cgst + sgst)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </DataTableWrapper>
                    )}

                    {activeTab === "docs" && (
                        <DataTableWrapper>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nature of Document</th>
                                        <th>Sr. No From</th>
                                        <th>Sr. No To</th>
                                        <th className="text-center">Total Invoices</th>
                                        <th className="text-center">Cancelled</th>
                                        <th className="text-center">Net Valid Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {docSummaryList.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                                No document series records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        docSummaryList.map((d, idx) => (
                                            <tr key={idx}>
                                                <td><strong>{d.particulars}</strong></td>
                                                <td className="font-mono">{d.sl_no_from || d.serial_from || "-"}</td>
                                                <td className="font-mono">{d.sl_no_to || d.serial_to || "-"}</td>
                                                <td className="text-center">{d.total_count || d.total_number}</td>
                                                <td className="text-center">{d.cancelled || d.cancelled_number || 0}</td>
                                                <td className="text-center font-bold" style={{ color: "#059669" }}>
                                                    {d.net_issued || d.total_count}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </DataTableWrapper>
                    )}

                    <ReportPrintFooter />
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterPurchaseGSTReport;
