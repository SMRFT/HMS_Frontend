import React, { useState, useEffect, useMemo } from "react";
import { DatePicker, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw, MinusCircle } from "lucide-react";
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

const MasterDebitDueBillsReport = ({ isModalView = false, startDate, endDate }) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
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
            const url = `${HmsBaseUrl}master-accounts/debit-and-due-bills/?from_date=${fDate}&to_date=${tDate}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Debit Bills Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const records = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    const filtered = useMemo(() => {
        if (!searchTerm.trim()) return records;
        const q = searchTerm.toLowerCase();
        return records.filter(r =>
            String(r.bill_no || "").toLowerCase().includes(q) ||
            String(r.patient_name || "").toLowerCase().includes(q) ||
            String(r.mr_no || "").toLowerCase().includes(q)
        );
    }, [records, searchTerm]);

    const handleExport = () => {
        const rows = filtered.map(r => ({
            "Bill No": r.bill_no,
            "Date": r.date,
            "Category": r.category,
            "UHID": r.mr_no,
            "Patient Name": r.patient_name,
            "Contact Phone": r.contact_no,
            "Gross Bill Amount": r.bill_amount,
            "Paid Amount": r.paid_amount,
            "Due Balance Outstanding": r.due_amount
        }));
        exportToExcel(rows, "Master_Debit_Due_Bills_Register", "PendingDues");
    };

    const totalDue = filtered.reduce((a, x) => a + (x.due_amount || 0), 0);

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Debit & Due Bills Register
                            <span className="badge">Receivables</span>
                        </h1>
                        <p>Pending patient receivables, debit notes, and unsettled balance dues across all billing heads</p>
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
                                placeholder="Search bill / patient / phone..."
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
                            title="DebitDueBillsReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Pending patient receivables, debit notes, and unsettled balance dues across all billing heads"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#ef4444">
                            <span className="kpi-title">Total Due Outstanding</span>
                            <span className="kpi-value" style={{ color: "#dc2626" }}>₹{formatINR(totalDue)}</span>
                            <span className="kpi-subtitle">Uncollected receivables</span>
                        </KPICard>
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Pending Due Bills Count</span>
                            <span className="kpi-value">{filtered.length}</span>
                            <span className="kpi-subtitle">Unsettled invoices</span>
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
                                    <th>Contact Phone</th>
                                    <th className="text-right">Bill Amount (₹)</th>
                                    <th className="text-right">Paid Amount (₹)</th>
                                    <th className="text-right">Balance Due (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r, idx) => (
                                    <tr key={idx}>
                                        <td className="font-mono"><strong>{r.bill_no}</strong></td>
                                        <td>{r.date}</td>
                                        <td><Tag color="volcano">{r.category}</Tag></td>
                                        <td className="font-mono">{r.mr_no || "-"}</td>
                                        <td><strong>{r.patient_name}</strong></td>
                                        <td>{r.contact_no || "-"}</td>
                                        <td className="text-right font-mono">{formatINR(r.bill_amount)}</td>
                                        <td className="text-right font-mono">{formatINR(r.paid_amount)}</td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#dc2626" }}>
                                            {formatINR(r.due_amount)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={6}><strong>TOTAL OUTSTANDING RECEIVABLES ({filtered.length} BILLS)</strong></td>
                                    <td className="text-right font-mono">₹{formatINR(filtered.reduce((a, x) => a + (x.bill_amount || 0), 0))}</td>
                                    <td className="text-right font-mono">₹{formatINR(filtered.reduce((a, x) => a + (x.paid_amount || 0), 0))}</td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#dc2626" }}>
                                        ₹{formatINR(totalDue)}
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

export default MasterDebitDueBillsReport;
