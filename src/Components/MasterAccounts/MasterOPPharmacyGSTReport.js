import React, { useState, useEffect } from "react";
import { DatePicker, Button, Spin, Tag, Input, Tabs } from "antd";
import dayjs from "dayjs";
import { Printer, Download, RefreshCw, FileSpreadsheet } from "lucide-react";
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

const MasterOPPharmacyGSTReport = ({ isModalView = false, startDate, endDate, defaultTab = "invoices" }) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [activeTab, setActiveTab] = useState(defaultTab || "invoices");
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
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
            const url = `${HmsBaseUrl}master-accounts/op-pharmacy-sales-gst-consolidated/?from_date=${fDate}&to_date=${tDate}`;
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

    const invoices = getSafeArray(reportData?.invoices);
    const hsnSummary = getSafeArray(reportData?.hsn_summary);
    const docSummary = reportData?.doc_summary || {};
    const summary = reportData?.summary || {};

    const handleExport = () => {
        if (activeTab === "invoices") {
            const rows = invoices.map(i => ({
                "Invoice No": i.invoice_no,
                "Date": i.date,
                "Customer Name": i.customer_name,
                "Taxable Value": i.taxable_value,
                "CGST Amount": i.cgst_amount,
                "SGST Amount": i.sgst_amount,
                "Total Invoice Value": i.invoice_value
            }));
            exportToExcel(rows, "OP_Pharmacy_Sales_Invoices", "Invoices");
        } else if (activeTab === "hsn") {
            const rows = hsnSummary.map(h => ({
                "HSN Code": h.hsn_code,
                "Description": h.description,
                "UOM": h.uom,
                "Quantity": h.quantity,
                "Taxable Value": h.taxable_value,
                "CGST Amount": h.cgst_amount,
                "SGST Amount": h.sgst_amount,
                "Total Tax": (h.cgst_amount || 0) + (h.sgst_amount || 0)
            }));
            exportToExcel(rows, "OP_Pharmacy_HSN_Summary", "HSN");
        } else {
            const rows = [{
                "Nature of Document": "Invoices for outward supply",
                "Sr No From": docSummary.serial_from,
                "Sr No To": docSummary.serial_to,
                "Total Number": docSummary.total_number,
                "Cancelled": docSummary.cancelled_number,
                "Net Issued": docSummary.net_issued
            }];
            exportToExcel(rows, "OP_Pharmacy_Doc_Summary", "DocSummary");
        }
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            OP Pharmacy Sales GST Register (GSTR-1)
                            <span className="badge">Winman Format</span>
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
                        <Button icon={<RefreshCw size={14} />} onClick={fetchReport} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                )}
            </ControlCard>
            )}

            <div className="no-print" style={{ marginBottom: "16px" }}>
                <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
                    <Tabs.TabPane tab="1. B2C Invoices Register" key="invoices" />
                    <Tabs.TabPane tab="2. HSN-Wise Summary" key="hsn" />
                    <Tabs.TabPane tab="3. Document Series Summary" key="docs" />
                </Tabs>
            </div>

            {loading ? (
                <div style={{ padding: "60px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-report-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title="OPPharmacyGSTReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Outward patient medicine sales register covering B2C invoices, HSN-wise tax summary, and document series"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Taxable Value</span>
                            <span className="kpi-value">₹{formatINR(summary.total_taxable)}</span>
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
                            <span className="kpi-value">₹{formatINR(summary.total_sales_value)}</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    {activeTab === "invoices" && (
                        <DataTableWrapper>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Invoice No</th>
                                        <th>Date</th>
                                        <th>Customer / Patient</th>
                                        <th className="text-right">Taxable Value (₹)</th>
                                        <th className="text-right">CGST (₹)</th>
                                        <th className="text-right">SGST (₹)</th>
                                        <th className="text-right">Invoice Value (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((i, idx) => (
                                        <tr key={idx}>
                                            <td className="font-mono"><strong>{i.invoice_no}</strong></td>
                                            <td>{i.date}</td>
                                            <td>{i.customer_name || "Cash Customer"}</td>
                                            <td className="text-right font-mono">{formatINR(i.taxable_value)}</td>
                                            <td className="text-right font-mono">{formatINR(i.cgst_amount)}</td>
                                            <td className="text-right font-mono">{formatINR(i.sgst_amount)}</td>
                                            <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                {formatINR(i.invoice_value)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="total-row">
                                        <td colSpan={3}><strong>TOTAL INVOICES ({invoices.length} BILLS)</strong></td>
                                        <td className="text-right font-mono">₹{formatINR(summary.total_taxable)}</td>
                                        <td className="text-right font-mono">₹{formatINR(summary.total_cgst)}</td>
                                        <td className="text-right font-mono">₹{formatINR(summary.total_sgst)}</td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                            ₹{formatINR(summary.total_sales_value)}
                                        </td>
                                    </tr>
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
                                        <th className="text-right">Taxable Value (₹)</th>
                                        <th className="text-right">CGST (₹)</th>
                                        <th className="text-right">SGST (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hsnSummary.map((h, idx) => (
                                        <tr key={idx}>
                                            <td className="font-mono"><strong>{h.hsn_code}</strong></td>
                                            <td>{h.description}</td>
                                            <td>{h.uom}</td>
                                            <td className="text-center">{h.quantity}</td>
                                            <td className="text-right font-mono">{formatINR(h.taxable_value)}</td>
                                            <td className="text-right font-mono">{formatINR(h.cgst_amount)}</td>
                                            <td className="text-right font-mono">{formatINR(h.sgst_amount)}</td>
                                        </tr>
                                    ))}
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
                                        <td className="font-mono">{docSummary.serial_from || "-"}</td>
                                        <td className="font-mono">{docSummary.serial_to || "-"}</td>
                                        <td className="text-center">{docSummary.total_number || invoices.length}</td>
                                        <td className="text-center">{docSummary.cancelled_number || 0}</td>
                                        <td className="text-center font-bold" style={{ color: "#059669" }}>
                                            {docSummary.net_issued || invoices.length}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </DataTableWrapper>
                    )}
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterOPPharmacyGSTReport;
