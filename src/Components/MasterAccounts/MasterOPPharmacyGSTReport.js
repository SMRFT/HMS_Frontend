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

const MasterOPPharmacyGSTReport = ({
    isModalView = false,
    startDate,
    endDate,
    defaultTab = "invoices",
    lockedTab = false,
    title = null
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [activeTab, setActiveTab] = useState(defaultTab || "invoices");
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

    const fetchReport = async () => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/op-pharmacy-sales-gst-consolidated/?from_date=${fDate}&to_date=${tDate}&search=${encodeURIComponent(searchTerm)}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("OP Pharmacy GST Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const rawInvoices = getSafeArray(reportData?.sales_data || reportData?.invoices || reportData?.invoices_data);
    const rawHsn = getSafeArray(reportData?.hsn_data || reportData?.hsn_summary);
    const rawDocs = getSafeArray(reportData?.docs_data || reportData?.document_summary);
    const docSummary = (rawDocs && rawDocs.length > 0 ? rawDocs[0] : null) || reportData?.doc_summary || {};
    const summary = reportData?.summary || {};

    const invoices = rawInvoices.filter(i => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
            (i.invoice_no || i.bill_no || "").toLowerCase().includes(s) ||
            (i.customer_name || "").toLowerCase().includes(s) ||
            (i.gstin || "").toLowerCase().includes(s)
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

    const displayTitle = title || (
        activeTab === "invoices"
            ? "OP Pharmacy Sales - Invoices"
            : activeTab === "hsn"
            ? "OP Pharmacy Sales - HSN Wise Summary"
            : "OP Pharmacy Sales - Document Summary"
    );

    const handleExport = () => {
        if (activeTab === "invoices") {
            const rows = invoices.map(i => ({
                "Invoice No (Bill No)": i.invoice_no || i.bill_no,
                "Date": i.invoice_date || i.date,
                "Customer Name": i.customer_name || "Cash Patient",
                "GSTIN": i.gstin || "-",
                "Tax Rate (%)": i.tax_rate || "5.0%",
                "Taxable Value": i.taxable_value,
                "CGST Amount": i.cgst || i.cgst_amount,
                "SGST Amount": i.sgst || i.sgst_amount,
                "Total Invoice Value": i.invoice_value || i.total_invoice_value
            }));
            exportToExcel(rows, `${displayTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Invoices`, "Invoices");
        } else if (activeTab === "hsn") {
            const rows = hsnSummary.map(h => ({
                "HSN Code": h.hsn || h.hsn_code,
                "Description": h.description,
                "UOM": h.uom || "Numbers",
                "Quantity": h.total_quantity || h.quantity,
                "Tax Rate (%)": h.tax_rate,
                "Taxable Value": h.taxable_value,
                "CGST Amount": h.cgst || h.cgst_amount,
                "SGST Amount": h.sgst || h.sgst_amount,
                "Total Tax": (h.cgst || h.cgst_amount || 0) + (h.sgst || h.sgst_amount || 0)
            }));
            exportToExcel(rows, `${displayTitle.replace(/[^a-zA-Z0-9]/g, '_')}_HSN`, "HSN");
        } else {
            const rows = [{
                "Nature of Document": "Invoices for outward supply (OP Pharmacy)",
                "Sr No From": docSummary.sl_no_from || docSummary.serial_from || "-",
                "Sr No To": docSummary.sl_no_to || docSummary.serial_to || "-",
                "Total Number": docSummary.total_count || docSummary.total_number || invoices.length,
                "Cancelled": docSummary.cancelled || docSummary.cancelled_number || 0,
                "Net Issued": docSummary.net_issued || invoices.length
            }];
            exportToExcel(rows, `${displayTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Docs`, "DocSummary");
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
                            <p>Outward patient medicine sales register covering B2C invoices, HSN-wise tax summary, and document series</p>
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
                            <label>Search:</label>
                            <Input
                                placeholder="Search bill no, customer, HSN..."
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
                        <Tabs.TabPane tab="1. Outward Supply Invoices" key="invoices" />
                        <Tabs.TabPane tab="2. HSN-Wise Summary" key="hsn" />
                        <Tabs.TabPane tab="3. Document Series Summary" key="docs" />
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
                            typeDesc="Outward patient medicine sales register covering invoices, HSN-wise tax summary, and document series"
                        />
                    )}

                    {!isModalView && (
                        <KPIGrid className="no-print">
                            <KPICard $border="#0ea5e9">
                                <span className="kpi-title">Taxable Value</span>
                                <span className="kpi-value">₹{formatINR(summary.total_taxable_value || summary.total_taxable)}</span>
                            </KPICard>
                            <KPICard $border="#6366f1">
                                <span className="kpi-title">Output CGST</span>
                                <span className="kpi-value">₹{formatINR(summary.total_cgst)}</span>
                            </KPICard>
                            <KPICard $border="#10b981">
                                <span className="kpi-title">Output SGST</span>
                                <span className="kpi-value">₹{formatINR(summary.total_sgst)}</span>
                            </KPICard>
                            <KPICard $border="#f59e0b">
                                <span className="kpi-title">Total Sales Value</span>
                                <span className="kpi-value">₹{formatINR(summary.total_invoice_value || summary.total_value || summary.total_sales_value)}</span>
                            </KPICard>
                        </KPIGrid>
                    )}

                    {activeTab === "invoices" && (
                        <DataTableWrapper>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Bill / Invoice No</th>
                                        <th>Date</th>
                                        <th>Customer / Patient Name</th>
                                        <th>GSTIN</th>
                                        <th className="text-center">Rate</th>
                                        <th className="text-right">Taxable Value (₹)</th>
                                        <th className="text-right">CGST (₹)</th>
                                        <th className="text-right">SGST (₹)</th>
                                        <th className="text-right">Invoice Value (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                                No OP Pharmacy sales invoices found for this date range.
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.map((i, idx) => (
                                            <tr key={idx}>
                                                <td className="font-mono"><strong>{i.invoice_no || i.bill_no}</strong></td>
                                                <td>{i.invoice_date || i.date}</td>
                                                <td><strong>{i.customer_name || "Cash Customer"}</strong></td>
                                                <td className="font-mono">{i.gstin || "-"}</td>
                                                <td className="text-center">{i.tax_rate ? `${i.tax_rate}%` : "5.0%"}</td>
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
                                            <td colSpan={5}><strong>TOTAL INVOICES ({invoices.length} BILLS)</strong></td>
                                            <td className="text-right font-mono">₹{formatINR(summary.total_taxable_value || summary.total_taxable)}</td>
                                            <td className="text-right font-mono">₹{formatINR(summary.total_cgst)}</td>
                                            <td className="text-right font-mono">₹{formatINR(summary.total_sgst)}</td>
                                            <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                ₹{formatINR(summary.total_invoice_value || summary.total_value || summary.total_sales_value)}
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
                                        <th className="text-right">CGST (₹)</th>
                                        <th className="text-right">SGST (₹)</th>
                                        <th className="text-right">Total Tax (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hsnSummary.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                                No HSN summary data found.
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
                                        <th className="text-center">Total Number</th>
                                        <th className="text-center">Cancelled</th>
                                        <th className="text-center">Net Issued</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Invoices for outward supply (OP Pharmacy)</strong></td>
                                        <td className="font-mono">{docSummary.sl_no_from || docSummary.serial_from || "-"}</td>
                                        <td className="font-mono">{docSummary.sl_no_to || docSummary.serial_to || "-"}</td>
                                        <td className="text-center">{docSummary.total_count || docSummary.total_number || invoices.length}</td>
                                        <td className="text-center">{docSummary.cancelled || docSummary.cancelled_number || 0}</td>
                                        <td className="text-center font-bold" style={{ color: "#059669" }}>
                                            {docSummary.net_issued || invoices.length}
                                        </td>
                                    </tr>
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

export default MasterOPPharmacyGSTReport;
