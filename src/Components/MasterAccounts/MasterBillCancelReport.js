import React, { useState, useEffect, useMemo } from "react";
import { DatePicker, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw, XCircle } from "lucide-react";
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

const MasterBillCancelReport = ({ isModalView = false, startDate, endDate }) => {
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
            const url = `${HmsBaseUrl}master-accounts/bill-cancellation/?from_date=${fDate}&to_date=${tDate}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Bill Cancel Error:", err);
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
            String(r.cancelled_by || "").toLowerCase().includes(q) ||
            String(r.reason || "").toLowerCase().includes(q)
        );
    }, [records, searchTerm]);

    const handleExport = () => {
        const rows = filtered.map(r => ({
            "Bill No": r.bill_no,
            "Cancellation Date": r.date,
            "Category": r.category,
            "UHID": r.mr_no,
            "Patient Name": r.patient_name,
            "Cancelled Amount": r.amount,
            "Cancelled By": r.cancelled_by,
            "Cancellation Reason": r.reason
        }));
        exportToExcel(rows, "Master_Bill_Cancellation_Register", "CancelledBills");
    };

    const totalCancelled = filtered.reduce((a, x) => a + (x.amount || 0), 0);

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Bill Cancellation Register
                            <span className="badge">Audit Trail</span>
                        </h1>
                        <p>Detailed log of cancelled receipts, revoked invoices, and refund authorizations with audit notes</p>
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
                                placeholder="Search bill / patient / reason..."
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
                            title="BillCancelReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Detailed log of cancelled receipts, revoked invoices, and refund authorizations with audit notes"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#ef4444">
                            <span className="kpi-title">Total Cancelled Value</span>
                            <span className="kpi-value" style={{ color: "#dc2626" }}>₹{formatINR(totalCancelled)}</span>
                            <span className="kpi-subtitle">Reversed revenue</span>
                        </KPICard>
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Cancelled Bills Count</span>
                            <span className="kpi-value">{filtered.length}</span>
                            <span className="kpi-subtitle">Audit records</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>Bill No</th>
                                    <th>Cancelled Date</th>
                                    <th>Category</th>
                                    <th>UHID</th>
                                    <th>Patient Name</th>
                                    <th>Cancelled By</th>
                                    <th>Reason / Authorization</th>
                                    <th className="text-right">Cancelled Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r, idx) => (
                                    <tr key={idx}>
                                        <td className="font-mono"><strong>{r.bill_no}</strong></td>
                                        <td>{r.date}</td>
                                        <td><Tag color="red">{r.category}</Tag></td>
                                        <td className="font-mono">{r.mr_no || "-"}</td>
                                        <td><strong>{r.patient_name}</strong></td>
                                        <td>{r.cancelled_by || "Supervisor"}</td>
                                        <td>{r.reason || "Patient request"}</td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#dc2626" }}>
                                            {formatINR(r.amount)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={7}><strong>TOTAL CANCELLED BILLS ({filtered.length} RECORDS)</strong></td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#dc2626" }}>
                                        ₹{formatINR(totalCancelled)}
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

export default MasterBillCancelReport;
