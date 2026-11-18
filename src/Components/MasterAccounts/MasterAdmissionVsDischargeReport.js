import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DatePicker, Select, Button, Spin, Input } from "antd";
import dayjs from "dayjs";
import {
    Printer,
    Download,
    Search,
    RefreshCw,
    Users,
    BedDouble,
    CheckCircle2,
    LogOut,
    ArrowUpDown,
    DollarSign,
    Clock
} from "lucide-react";
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
const { Option } = Select;

const MasterAdmissionVsDischargeReport = ({
    isModalView = false,
    startDate,
    endDate,
    initialStartDate,
    initialEndDate,
    status: propStatus,
    initialStatus = "all",
    company: propCompany,
    initialCompany = "all",
    billType: propBillType,
    category: propCategory
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const start = startDate || initialStartDate;
    const end = endDate || initialEndDate;
    const effectiveStatus = propStatus || "all";
    const effectiveCompany = propCompany || propCategory || propBillType || initialCompany || "all";

    const [dateRange, setDateRange] = useState([
        start ? dayjs(start) : dayjs().startOf("month"),
        end ? dayjs(end) : dayjs()
    ]);
    const [statusFilter, setStatusFilter] = useState(effectiveStatus);
    const [companyFilter, setCompanyFilter] = useState(effectiveCompany);
    const [sortOrder, setSortOrder] = useState("asc");
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Synchronize dates from props
    useEffect(() => {
        if (start && end) {
            setDateRange([dayjs(start), dayjs(end)]);
        }
    }, [start, end]);

    // Synchronize status
    useEffect(() => {
        if (propStatus !== undefined && propStatus !== statusFilter) {
            setStatusFilter(propStatus);
        }
    }, [propStatus, statusFilter]);

    // Synchronize company
    useEffect(() => {
        const c = propCompany || propCategory || propBillType || initialCompany;
        if (c !== undefined && c !== companyFilter) {
            setCompanyFilter(c);
        }
    }, [propCompany, propCategory, propBillType, initialCompany, companyFilter]);

    // Fetch report data
    const fetchReport = useCallback(async () => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const statusParam = statusFilter && statusFilter !== "all" ? `&status=${encodeURIComponent(statusFilter)}` : "";
            const isAllCompany = !companyFilter || companyFilter.toLowerCase() === "all" || companyFilter.toLowerCase() === "all companies";
            const companyParam = !isAllCompany ? `&company=${encodeURIComponent(companyFilter)}` : "";
            const sortParam = `&sort_order=${sortOrder}`;

            const url = `${HmsBaseUrl}master-accounts/admission-vs-discharge/?from_date=${fDate}&to_date=${tDate}${statusParam}${companyParam}${sortParam}`;
            const res = await apiRequest(url, "GET");

            if (res?.success) {
                setReportData(extractReportData(res));
            } else {
                setReportData(null);
            }
        } catch (err) {
            console.error("Admission vs Discharge Report Error:", err);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    }, [dateRange, statusFilter, companyFilter, sortOrder, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const records = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};
    const companiesList = reportData?.companies || [];

    // Client-side quick search filtering
    const filteredRecords = useMemo(() => {
        if (!searchTerm.trim()) return records;
        const q = searchTerm.toLowerCase().trim();
        return records.filter(r =>
            String(r.ip_number || "").toLowerCase().includes(q) ||
            String(r.uhid || "").toLowerCase().includes(q) ||
            String(r.patient_name || "").toLowerCase().includes(q) ||
            String(r.doctor_name || "").toLowerCase().includes(q) ||
            String(r.room || "").toLowerCase().includes(q) ||
            String(r.company_name || "").toLowerCase().includes(q)
        );
    }, [records, searchTerm]);

    // Toggle sorting
    const toggleSortOrder = () => {
        setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    };

    // Excel Export
    const handleExport = () => {
        const rows = filteredRecords.map((r, idx) => ({
            "SL NO": idx + 1,
            "IP NUMBER": r.ip_number,
            "UHID": r.uhid,
            "PATIENT NAME": r.patient_name,
            "DOCTOR NAME": r.doctor_name,
            "ROOM / BED": r.room,
            "ADMITTING DATE": r.admitting_date,
            "DISCHARGE DATE": r.discharge_date,
            "STAY (DAYS)": r.no_of_days,
            "ADVANCE (₹)": cleanNum(r.advance),
            "GROSS BILL (₹)": cleanNum(r.gross_bill),
            "NET PAID (₹)": cleanNum(r.net_paid),
            "COMPANY / CORPORATE": r.company_name,
            "STATUS": r.is_discharged ? "Discharged" : "Admitted"
        }));
        exportToExcel(rows, "Master_Admission_vs_Discharge_Report", "AdmissionVsDischarge");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                Admission vs Discharge Report
                                <span className="badge">Inpatient Tracking</span>
                            </h1>
                            <p>Comprehensive tracking of inpatient bed occupancy, admissions, length of stay, advances, and discharge clearances</p>
                        </div>
                        <div className="btn-group no-print">
                            <Button icon={<Download size={15} />} onClick={handleExport}>
                                Excel Export
                            </Button>
                            <Button
                                type="primary"
                                icon={<Printer size={15} />}
                                onClick={() => printReportArea("printable-admission-discharge-area", "landscape")}
                            >
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
                            <label>Status:</label>
                            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 170 }}>
                                <Option value="all">All Patients</Option>
                                <Option value="admitted">Currently Admitted</Option>
                                <Option value="discharged">Discharged</Option>
                            </Select>
                        </div>

                        <div className="filter-item">
                            <label>Company / TPA:</label>
                            <Select value={companyFilter} onChange={setCompanyFilter} style={{ width: 220 }} showSearch>
                                <Option value="all">All Companies</Option>
                                {companiesList.map((c, idx) => (
                                    <Option key={idx} value={c}>
                                        {c}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <div className="filter-item">
                            <Input
                                placeholder="Search IP / Patient / Room / Doctor..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 230 }}
                            />
                        </div>

                        <Button icon={<ArrowUpDown size={14} />} onClick={toggleSortOrder} title="Toggle IP sorting order">
                            IP {sortOrder.toUpperCase()}
                        </Button>

                        <Button icon={<RefreshCw size={14} />} onClick={fetchReport} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                </ControlCard>
            )}

            {loading ? (
                <div style={{ padding: "80px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-admission-discharge-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title="Admission vs Discharge Report"
                            fromDate={dateRange[0]?.format("YYYY-MM-DD")}
                            toDate={dateRange[1]?.format("YYYY-MM-DD")}
                            typeDesc="Inpatient admissions, bed occupancy, length of stay, and discharge clearance register"
                        />
                    )}

                    {!isModalView && (
                        <KPIGrid className="no-print">
                            <KPICard $border="#0284c7">
                                <span className="kpi-title">Total Inpatients</span>
                                <span className="kpi-value">{summary.total_inpatients || filteredRecords.length}</span>
                                <span className="kpi-subtitle">All active & cleared records</span>
                            </KPICard>

                            <KPICard $border="#059669">
                                <span className="kpi-title">Currently Admitted</span>
                                <span className="kpi-value">{summary.active_admissions ?? filteredRecords.filter(r => !r.is_discharged).length}</span>
                                <span className="kpi-subtitle">Inpatient beds occupied</span>
                            </KPICard>

                            <KPICard $border="#ea580c">
                                <span className="kpi-title">Discharged</span>
                                <span className="kpi-value">{summary.discharged_count ?? filteredRecords.filter(r => r.is_discharged).length}</span>
                                <span className="kpi-subtitle">Final settlements completed</span>
                            </KPICard>

                            <KPICard $border="#16a34a">
                                <span className="kpi-title">Total Advance</span>
                                <span className="kpi-value">₹{formatINR(summary.total_advance ?? filteredRecords.reduce((a, r) => a + cleanNum(r.advance), 0))}</span>
                                <span className="kpi-subtitle">Deposited advances</span>
                            </KPICard>

                            <KPICard $border="#6366f1">
                                <span className="kpi-title">Avg Stay (Days)</span>
                                <span className="kpi-value">{summary.avg_length_of_stay || "0"}</span>
                                <span className="kpi-subtitle">Length of stay average</span>
                            </KPICard>
                        </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: "45px" }}>SLNO</th>
                                    <th>IP No</th>
                                    <th>UHID</th>
                                    <th>Patient Name</th>
                                    <th>Doctor Name</th>
                                    <th>Room / Bed</th>
                                    <th>Admitting Date</th>
                                    <th>Discharge Date</th>
                                    <th style={{ textAlign: "center" }}>Stay (Days)</th>
                                    <th className="text-right" style={{ color: "#059669" }}>Advance (₹)</th>
                                    <th className="text-right">Gross Bill (₹)</th>
                                    <th className="text-right" style={{ color: "#0284c7" }}>Net Paid (₹)</th>
                                    <th>Company / Corporate</th>
                                    <th style={{ textAlign: "center" }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={14} style={{ textAlign: "center", padding: "35px", color: "#94a3b8" }}>
                                            No Admission vs Discharge records found for the selected period.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((r, idx) => (
                                        <tr key={r.ip_number || idx}>
                                            <td>{idx + 1}</td>
                                            <td style={{ fontWeight: 700, fontFamily: "monospace", color: "#0f172a" }}>
                                                {r.ip_number}
                                            </td>
                                            <td style={{ fontFamily: "monospace", color: "#64748b" }}>
                                                {r.uhid}
                                            </td>
                                            <td style={{ fontWeight: 600 }}>
                                                {r.patient_name}
                                            </td>
                                            <td style={{ color: "#334155" }}>
                                                {r.doctor_name}
                                            </td>
                                            <td style={{ fontWeight: 600, color: "#1e293b" }}>
                                                {r.room}
                                            </td>
                                            <td style={{ fontSize: "0.80rem", color: "#475569" }}>
                                                {r.admitting_date}
                                            </td>
                                            <td style={{ fontSize: "0.80rem" }}>
                                                {r.is_discharged ? (
                                                    <span style={{ color: "#475569" }}>{r.discharge_date}</span>
                                                ) : (
                                                    <span style={{
                                                        background: "#ecfdf5",
                                                        color: "#059669",
                                                        padding: "2px 8px",
                                                        borderRadius: "12px",
                                                        fontWeight: 700,
                                                        fontSize: "0.75rem"
                                                    }}>
                                                        Still Admitted
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <span style={{
                                                    background: "#f8fafc",
                                                    border: "1px solid #e2e8f0",
                                                    padding: "2px 7px",
                                                    borderRadius: "6px",
                                                    fontWeight: 700
                                                }}>
                                                    {r.no_of_days}
                                                </span>
                                            </td>
                                            <td className="text-right font-mono" style={{ color: "#059669", fontWeight: 600 }}>
                                                ₹{formatINR(r.advance)}
                                            </td>
                                            <td className="text-right font-mono">
                                                {r.gross_bill > 0 ? `₹${formatINR(r.gross_bill)}` : "—"}
                                            </td>
                                            <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                {r.net_paid > 0 ? `₹${formatINR(r.net_paid)}` : "—"}
                                            </td>
                                            <td style={{ fontSize: "0.80rem", color: "#334155" }}>
                                                {r.company_name}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                {r.is_discharged ? (
                                                    <span style={{
                                                        background: "#f1f5f9",
                                                        color: "#475569",
                                                        padding: "3px 8px",
                                                        borderRadius: "12px",
                                                        fontSize: "0.74rem",
                                                        fontWeight: 600
                                                    }}>
                                                        Discharged
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        background: "#dcfce7",
                                                        color: "#15803d",
                                                        padding: "3px 8px",
                                                        borderRadius: "12px",
                                                        fontSize: "0.74rem",
                                                        fontWeight: 700
                                                    }}>
                                                        Admitted
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}

                                {/* Grand Total Summary Row */}
                                {filteredRecords.length > 0 && (
                                    <tr style={{ background: "#0f172a", color: "#ffffff", fontWeight: 800 }}>
                                        <td colSpan={9} style={{ color: "#ffffff", padding: "10px 12px" }}>
                                            <strong>GRAND TOTAL ({filteredRecords.length} INPATIENTS)</strong>
                                        </td>
                                        <td className="text-right font-mono" style={{ color: "#4ade80" }}>
                                            ₹{formatINR(filteredRecords.reduce((a, r) => a + cleanNum(r.advance), 0))}
                                        </td>
                                        <td className="text-right font-mono" style={{ color: "#ffffff" }}>
                                            ₹{formatINR(filteredRecords.reduce((a, r) => a + cleanNum(r.gross_bill), 0))}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#38bdf8" }}>
                                            ₹{formatINR(filteredRecords.reduce((a, r) => a + cleanNum(r.net_paid), 0))}
                                        </td>
                                        <td colSpan={2} style={{ color: "#cbd5e1", textAlign: "center" }}>
                                            {filteredRecords.filter(r => !r.is_discharged).length} Admitted | {filteredRecords.filter(r => r.is_discharged).length} Discharged
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </DataTableWrapper>

                    <ReportPrintFooter />
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterAdmissionVsDischargeReport;
