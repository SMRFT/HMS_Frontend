import React, { useState, useEffect, useMemo } from "react";
import { DatePicker, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw, BarChart3 } from "lucide-react";
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
    ReportPrintFooter
} from "./masterAccountsHelper";

const { RangePicker } = DatePicker;

const MasterDischargeDetailedReport = ({ isModalView = false, startDate, endDate }) => {
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
            const url = `${HmsBaseUrl}master-accounts/discharge-bills-detailed/?from_date=${fDate}&to_date=${tDate}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Discharge Detailed Error:", err);
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
            String(r.ip_number || "").toLowerCase().includes(q)
        );
    }, [records, searchTerm]);

    const handleExport = () => {
        const rows = filtered.map(r => ({
            "Bill No": r.bill_no,
            "Date": r.date,
            "IP No": r.ip_number,
            "Patient Name": r.patient_name,
            "Room & Bed": r.room_charge,
            "Nursing Care": r.nursing_charge,
            "Doctor Fee": r.doctor_charge,
            "Diagnostics / Lab": r.investigation_charge,
            "Pharmacy": r.pharmacy_charge,
            "OT & Surgery": r.ot_charge,
            "Total Invoiced": r.total_amount
        }));
        exportToExcel(rows, "Master_Discharge_Detailed_Breakdown", "DetailedAudit");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Discharge Bills Detailed Breakdown
                            <span className="badge">Departmental Audit</span>
                        </h1>
                        <p>Itemized departmental revenue analysis for discharged patients across Room, Nursing, Lab, and Pharmacy</p>
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
                                placeholder="Search bill / patient / IP..."
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
                            title="DischargeDetailedReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Itemized departmental revenue analysis for discharged patients across Room, Nursing, Lab, and Pharmacy"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Room & Nursing</span>
                            <span className="kpi-value">₹{formatINR((summary.total_room || 0) + (summary.total_nursing || 0))}</span>
                        </KPICard>
                        <KPICard $border="#6366f1">
                            <span className="kpi-title">Lab & Diagnostics</span>
                            <span className="kpi-value">₹{formatINR(summary.total_investigation)}</span>
                        </KPICard>
                        <KPICard $border="#f59e0b">
                            <span className="kpi-title">Pharmacy</span>
                            <span className="kpi-value">₹{formatINR(summary.total_pharmacy)}</span>
                        </KPICard>
                        <KPICard $border="#10b981">
                            <span className="kpi-title">Total Invoiced</span>
                            <span className="kpi-value">₹{formatINR(summary.total_invoiced)}</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>Bill No</th>
                                    <th>Date</th>
                                    <th>IP No</th>
                                    <th>Patient Name</th>
                                    <th className="text-right">Room (₹)</th>
                                    <th className="text-right">Nursing (₹)</th>
                                    <th className="text-right">Doctor (₹)</th>
                                    <th className="text-right">Lab (₹)</th>
                                    <th className="text-right">Pharmacy (₹)</th>
                                    <th className="text-right">Total (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r, idx) => (
                                    <tr key={idx}>
                                        <td className="font-mono"><strong>{r.bill_no}</strong></td>
                                        <td>{r.date}</td>
                                        <td className="font-mono">{r.ip_number || "-"}</td>
                                        <td><strong>{r.patient_name}</strong></td>
                                        <td className="text-right font-mono">{formatINR(r.room_charge || r.room_charges)}</td>
                                        <td className="text-right font-mono">{formatINR(r.nursing_charge || r.nursing_charges)}</td>
                                        <td className="text-right font-mono">{formatINR(r.doctor_charge || r.doctor_charges || r.doctor_fees)}</td>
                                        <td className="text-right font-mono">{formatINR(r.investigation_charge || r.lab_charges)}</td>
                                        <td className="text-right font-mono">{formatINR(r.pharmacy_charge || r.pharmacy_charges)}</td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                            {formatINR(r.total_amount || r.gross_amount || r.gross)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={4}><strong>TOTALS ({filtered.length} DISCHARGES)</strong></td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_room || filtered.reduce((a, x) => a + cleanNum(x.room_charge || x.room_charges), 0))}</td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_nursing || filtered.reduce((a, x) => a + cleanNum(x.nursing_charge || x.nursing_charges), 0))}</td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_doctor || filtered.reduce((a, x) => a + cleanNum(x.doctor_charge || x.doctor_charges || x.doctor_fees), 0))}</td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_investigation || filtered.reduce((a, x) => a + cleanNum(x.investigation_charge || x.lab_charges), 0))}</td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_pharmacy || filtered.reduce((a, x) => a + cleanNum(x.pharmacy_charge || x.pharmacy_charges), 0))}</td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                        ₹{formatINR(summary.total_invoiced || filtered.reduce((a, x) => a + cleanNum(x.total_amount || x.gross_amount || x.gross), 0))}
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

export default MasterDischargeDetailedReport;
