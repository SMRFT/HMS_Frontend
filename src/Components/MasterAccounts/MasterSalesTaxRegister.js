import React, { useState, useEffect } from "react";
import { DatePicker, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, RefreshCw, Percent } from "lucide-react";
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

const MasterSalesTaxRegister = ({ isModalView = false, startDate, endDate }) => {
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
            const url = `${HmsBaseUrl}master-accounts/sales-tax-register/?from_date=${fDate}&to_date=${tDate}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Sales Tax Register Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const lines = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    const handleExport = () => {
        const rows = lines.map(r => ({
            "Date": r.date,
            "Tax Rate (%)": r.tax_rate,
            "Taxable Amount": r.taxable_value,
            "CGST Amount": r.cgst_amount,
            "SGST Amount": r.sgst_amount,
            "Total Tax": (r.cgst_amount || 0) + (r.sgst_amount || 0),
            "Total Invoiced Value": r.total_value
        }));
        exportToExcel(rows, "Master_Sales_Tax_Register_GST", "SalesTax");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Sales Tax Register (GST)
                            <span className="badge">Output GST</span>
                        </h1>
                        <p>Rate-wise GST register showing Taxable Value, CGST, and SGST breakdowns across sales lines</p>
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
                            title="SalesTaxRegister"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Rate-wise GST register showing Taxable Value, CGST, and SGST breakdowns across sales lines"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Total Taxable Value</span>
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
                            <span className="kpi-title">Total Tax Invoiced</span>
                            <span className="kpi-value">₹{formatINR((summary.total_cgst || 0) + (summary.total_sgst || 0))}</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>GST Rate</th>
                                    <th className="text-right">Taxable Value (₹)</th>
                                    <th className="text-right">CGST (₹)</th>
                                    <th className="text-right">SGST (₹)</th>
                                    <th className="text-right">Total Tax (₹)</th>
                                    <th className="text-right">Total Invoice (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lines.map((r, idx) => {
                                    const totTax = (r.cgst_amount || 0) + (r.sgst_amount || 0);
                                    return (
                                        <tr key={idx}>
                                            <td>{r.date}</td>
                                            <td><Tag color="blue">{r.tax_rate}% GST</Tag></td>
                                            <td className="text-right font-mono">{formatINR(r.taxable_value)}</td>
                                            <td className="text-right font-mono">{formatINR(r.cgst_amount)}</td>
                                            <td className="text-right font-mono">{formatINR(r.sgst_amount)}</td>
                                            <td className="text-right font-mono font-bold" style={{ color: "#4f46e5" }}>
                                                {formatINR(totTax)}
                                            </td>
                                            <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                {formatINR(r.total_value)}
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr className="total-row">
                                    <td colSpan={2}><strong>GRAND TOTAL</strong></td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_taxable)}</td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_cgst)}</td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_sgst)}</td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#4f46e5" }}>
                                        ₹{formatINR((summary.total_cgst || 0) + (summary.total_sgst || 0))}
                                    </td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                        ₹{formatINR(summary.total_invoiced)}
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

export default MasterSalesTaxRegister;
