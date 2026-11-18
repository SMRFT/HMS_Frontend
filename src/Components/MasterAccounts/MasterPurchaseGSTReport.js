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

const MasterPurchaseGSTReport = ({ isModalView = false, startDate, endDate }) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
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
            const url = `${HmsBaseUrl}master-accounts/purchase-gst-consolidated/?from_date=${fDate}&to_date=${tDate}`;
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
    }, [dateRange]);

    const invoices = getSafeArray(reportData?.invoices);
    const summary = reportData?.summary || {};

    const handleExport = () => {
        const rows = invoices.map(i => ({
            "GRN No": i.grn_no,
            "Supplier Name": i.supplier_name,
            "Supplier GSTIN": i.supplier_gstin,
            "Taxable Value": i.taxable_value,
            "Input CGST": i.cgst_amount,
            "Input SGST": i.sgst_amount,
            "Total Invoice Value": i.total_invoice_value
        }));
        exportToExcel(rows, "Purchase_GST_Consolidated_ITC", "Purchases");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Purchase GST Consolidated Register (ITC)
                            <span className="badge">Input Tax Credit</span>
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

            {loading ? (
                <div style={{ padding: "60px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-report-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title="PurchaseGSTReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Inward supplier purchase invoice register covering Drug Purchase & General Stores with GST ITC breakdowns"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Taxable Value</span>
                            <span className="kpi-value">₹{formatINR(summary.total_taxable)}</span>
                        </KPICard>
                        <KPICard $border="#6366f1">
                            <span className="kpi-title">Total Input CGST</span>
                            <span className="kpi-value">₹{formatINR(summary.total_itc_cgst)}</span>
                        </KPICard>
                        <KPICard $border="#10b981">
                            <span className="kpi-title">Total Input SGST</span>
                            <span className="kpi-value">₹{formatINR(summary.total_itc_sgst)}</span>
                        </KPICard>
                        <KPICard $border="#f59e0b">
                            <span className="kpi-title">Total Inward Value</span>
                            <span className="kpi-value">₹{formatINR(summary.total_purchase_value)}</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>GRN / Inv No</th>
                                    <th>Supplier Name</th>
                                    <th>Supplier GSTIN</th>
                                    <th className="text-right">Taxable Value (₹)</th>
                                    <th className="text-right">Input CGST (₹)</th>
                                    <th className="text-right">Input SGST (₹)</th>
                                    <th className="text-right">Invoice Total (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((i, idx) => (
                                    <tr key={idx}>
                                        <td className="font-mono"><strong>{i.grn_no}</strong></td>
                                        <td><strong>{i.supplier_name}</strong></td>
                                        <td className="font-mono">{i.supplier_gstin}</td>
                                        <td className="text-right font-mono">{formatINR(i.taxable_value)}</td>
                                        <td className="text-right font-mono">{formatINR(i.cgst_amount)}</td>
                                        <td className="text-right font-mono">{formatINR(i.sgst_amount)}</td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                            {formatINR(i.total_invoice_value)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={3}><strong>TOTAL PURCHASES ({invoices.length} INVOICES)</strong></td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_taxable)}</td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_itc_cgst)}</td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_itc_sgst)}</td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                        ₹{formatINR(summary.total_purchase_value)}
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

export default MasterPurchaseGSTReport;
