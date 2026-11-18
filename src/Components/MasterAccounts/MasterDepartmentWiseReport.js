import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DatePicker, Select, Button, Spin, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw, Building2, Stethoscope } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
    formatINR,
    printReportArea,
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

const MasterDepartmentWiseReport = ({
    isModalView = false,
    startDate,
    endDate,
    initialStartDate,
    initialEndDate,
    department: propDept,
    initialDepartment = "All",
    billType: propBillType,
    category: propCategory
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const start = startDate || initialStartDate;
    const end = endDate || initialEndDate;
    const effectiveDept = propDept || propCategory || propBillType || initialDepartment || "All";

    const [dateRange, setDateRange] = useState([
        start ? dayjs(start) : dayjs().startOf("month"),
        end ? dayjs(end) : dayjs()
    ]);

    const [selectedDept, setSelectedDept] = useState(effectiveDept);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (start && end) {
            setDateRange([dayjs(start), dayjs(end)]);
        }
    }, [start, end]);

    useEffect(() => {
        const d = propDept || propCategory || propBillType || initialDepartment;
        if (d !== undefined && d !== selectedDept) {
            setSelectedDept(d);
        }
    }, [propDept, propCategory, propBillType, initialDepartment, selectedDept]);

    const fetchReport = useCallback(async () => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const month = dateRange[1].month() + 1;
            const year = dateRange[1].year();
            const isAll = !selectedDept || selectedDept.toLowerCase() === "all" || selectedDept.toLowerCase() === "all departments";
            const deptParam = isAll ? "All" : selectedDept;

            const url = `${HmsBaseUrl}department-dashboard/stats/?department=${encodeURIComponent(deptParam)}&month=${month}&year=${year}&from_date=${fDate}&to_date=${tDate}`;
            const res = await apiRequest(url, "GET");
            if (res && (res.success || res.status === 200 || res.department_breakdown || res.data)) {
                setReportData(res.data || res);
            } else {
                setReportData(null);
            }
        } catch (err) {
            console.error("Department Wise Report Error:", err);
            toast.error("Failed to load department-wise report data");
            setReportData(null);
        } finally {
            setLoading(false);
        }
    }, [dateRange, selectedDept, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const kpis = reportData?.kpis || {};
    const departmentsList = reportData?.departments || ["All"];
    const breakdown = useMemo(() => reportData?.department_breakdown || [], [reportData]);
    const doctorPerf = useMemo(() => reportData?.doctor_performance || [], [reportData]);

    // Client-side quick search filtering
    const filteredBreakdown = useMemo(() => {
        const q = searchTerm.toLowerCase().trim();
        if (!q) return breakdown;
        return breakdown.filter(d =>
            (d.department && String(d.department).toLowerCase().includes(q))
        );
    }, [breakdown, searchTerm]);

    const filteredDoctors = useMemo(() => {
        const q = searchTerm.toLowerCase().trim();
        if (!q) return doctorPerf;
        return doctorPerf.filter(doc =>
            (doc.doctorName && String(doc.doctorName).toLowerCase().includes(q)) ||
            (doc.employeeId && String(doc.employeeId).toLowerCase().includes(q)) ||
            (doc.department && String(doc.department).toLowerCase().includes(q)) ||
            (doc.specialty && String(doc.specialty).toLowerCase().includes(q))
        );
    }, [doctorPerf, searchTerm]);

    // Totals for filtered breakdown
    const breakdownTotals = useMemo(() => {
        let totalDoctors = 0;
        let totalOP = 0;
        let totalIP = 0;
        let opIncome = 0;
        let pharmacyIncome = 0;
        let deptIncome = 0;
        let grandTotal = 0;

        filteredBreakdown.forEach(row => {
            totalDoctors += Number(row.doctor_count || 0);
            totalOP += Number(row.total_op || 0);
            totalIP += Number(row.total_ip || 0);
            opIncome += Number(row.op_income || 0);
            pharmacyIncome += Number(row.pharmacy_income || 0);
            deptIncome += Number(row.department_income || 0);
            grandTotal += Number(row.total_revenue || 0);
        });

        return {
            totalDoctors,
            totalOP,
            totalIP,
            opIncome,
            pharmacyIncome,
            deptIncome,
            grandTotal
        };
    }, [filteredBreakdown]);

    // Doctor performance totals
    const doctorTotals = useMemo(() => {
        let totalOP = 0;
        let totalIP = 0;
        let totalRev = 0;

        filteredDoctors.forEach(doc => {
            totalOP += Number(doc.op_count || 0);
            totalIP += Number(doc.ip_count || 0);
            totalRev += Number(doc.revenue || 0);
        });

        return { totalOP, totalIP, totalRev };
    }, [filteredDoctors]);

    const handlePrint = () => {
        printReportArea("printable-department-report-area", "landscape");
    };

    const handleExportExcel = () => {
        if (!breakdown || breakdown.length === 0) {
            toast.warning("No department data to export");
            return;
        }

        try {
            const deptRows = filteredBreakdown.map((d, i) => ({
                "S.No": i + 1,
                "Department": d.department || "",
                "Doctors": d.doctor_count || 0,
                "OP Patients": d.total_op || 0,
                "IP Admissions": d.total_ip || 0,
                "OP Fees (₹)": Number((d.op_income || 0).toFixed(2)),
                "Pharmacy (₹)": Number((d.pharmacy_income || 0).toFixed(2)),
                "Dept Fees (₹)": Number((d.department_income || 0).toFixed(2)),
                "Total Revenue (₹)": Number((d.total_revenue || 0).toFixed(2))
            }));

            // Subtotal Row
            deptRows.push({
                "S.No": "",
                "Department": "ALL DEPARTMENTS TOTAL",
                "Doctors": breakdownTotals.totalDoctors,
                "OP Patients": breakdownTotals.totalOP,
                "IP Admissions": breakdownTotals.totalIP,
                "OP Fees (₹)": Number(breakdownTotals.opIncome.toFixed(2)),
                "Pharmacy (₹)": Number(breakdownTotals.pharmacyIncome.toFixed(2)),
                "Dept Fees (₹)": Number(breakdownTotals.deptIncome.toFixed(2)),
                "Total Revenue (₹)": Number(breakdownTotals.grandTotal.toFixed(2))
            });

            const wb = XLSX.utils.book_new();
            const ws1 = XLSX.utils.json_to_sheet(deptRows);
            ws1["!cols"] = Object.keys(deptRows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
            XLSX.utils.book_append_sheet(wb, ws1, "Department Breakdown");

            if (filteredDoctors && filteredDoctors.length > 0) {
                const docRows = filteredDoctors.map((doc, idx) => ({
                    "S.No": idx + 1,
                    "EMP ID": doc.employeeId || "",
                    "Doctor Name": doc.doctorName || "",
                    "Department": doc.department || "",
                    "Specialty": doc.specialty || "",
                    "OP Patients": doc.op_count || 0,
                    "IP Admissions": doc.ip_count || 0,
                    "Consultation Revenue (₹)": Number((doc.revenue || 0).toFixed(2))
                }));

                docRows.push({
                    "S.No": "",
                    "EMP ID": "",
                    "Doctor Name": "DOCTOR REVENUE TOTAL",
                    "Department": "",
                    "Specialty": "",
                    "OP Patients": doctorTotals.totalOP,
                    "IP Admissions": doctorTotals.totalIP,
                    "Consultation Revenue (₹)": Number(doctorTotals.totalRev.toFixed(2))
                });

                const ws2 = XLSX.utils.json_to_sheet(docRows);
                ws2["!cols"] = Object.keys(docRows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
                XLSX.utils.book_append_sheet(wb, ws2, "Doctor Performance");
            }

            const fStr = dateRange[0].format("YYYY-MM-DD");
            const tStr = dateRange[1].format("YYYY-MM-DD");
            XLSX.writeFile(wb, `Master_Department_Wise_Report_${fStr}_to_${tStr}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                Department-Wise Collection Report
                                <span className="badge">Revenue & Volume</span>
                            </h1>
                            <p>Comprehensive financial revenue and patient volume grouped by medical & diagnostic departments</p>
                        </div>
                        <div className="btn-group no-print">
                            <Button icon={<Download size={15} />} onClick={handleExportExcel}>
                                Excel Export
                            </Button>
                            <Button type="primary" icon={<Printer size={15} />} onClick={handlePrint}>
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
                            <label>Department:</label>
                            <Select
                                value={selectedDept}
                                onChange={setSelectedDept}
                                style={{ width: 220 }}
                                showSearch
                                optionFilterProp="children"
                            >
                                {departmentsList.map((d, i) => (
                                    <Option key={i} value={d}>
                                        {d === "All" ? "All Departments" : d}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <div className="search-input-wrapper">
                                <Search size={14} />
                                <Input
                                    placeholder="Search dept or doctor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    allowClear
                                    style={{ width: 200 }}
                                />
                            </div>
                        </div>
                        <Button icon={<RefreshCw size={14} />} onClick={fetchReport} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                </ControlCard>
            )}

            {!isModalView && (
                <KPIGrid className="no-print">
                    <KPICard color="#10b981">
                        <span className="label">OP Consultation Fees</span>
                        <div className="value" style={{ color: "#059669" }}>₹{formatINR(kpis.op_income || breakdownTotals.opIncome)}</div>
                        <span className="sub">{kpis.total_op || breakdownTotals.totalOP} OP Patients</span>
                    </KPICard>
                    <KPICard color="#3b82f6">
                        <span className="label">Pharmacy Billings</span>
                        <div className="value" style={{ color: "#2563eb" }}>₹{formatINR(kpis.pharmacy_income || breakdownTotals.pharmacyIncome)}</div>
                        <span className="sub">Dispensed in Period</span>
                    </KPICard>
                    <KPICard color="#8b5cf6">
                        <span className="label">Department Procedures</span>
                        <div className="value" style={{ color: "#7c3aed" }}>₹{formatINR(kpis.department_income || breakdownTotals.deptIncome)}</div>
                        <span className="sub">Investigation & Procedures</span>
                    </KPICard>
                    <KPICard color="#f59e0b">
                        <span className="label">Grand Total Revenue</span>
                        <div className="value" style={{ color: "#d97706" }}>₹{formatINR(kpis.total_revenue || breakdownTotals.grandTotal)}</div>
                        <span className="sub">{kpis.total_ip || breakdownTotals.totalIP} IP Admissions</span>
                    </KPICard>
                </KPIGrid>
            )}

            {loading ? (
                <div style={{ padding: "80px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <DataTableWrapper id="printable-department-report-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title="Department-Wise Revenue & Volume Report"
                            fromDate={dateRange[0]?.format("YYYY-MM-DD")}
                            toDate={dateRange[1]?.format("YYYY-MM-DD")}
                            typeDesc="Comprehensive financial revenue and patient volume grouped by medical & diagnostic departments"
                        />
                    )}

                    {/* Section 1: Department Revenue & Patient Volume Breakdown */}
                    <div style={{ marginBottom: "28px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                            <Building2 size={18} color="#0284c7" />
                            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
                                Department Revenue & Patient Volume Breakdown
                            </h3>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "40px" }}>S.No</th>
                                        <th>Department Name</th>
                                        <th style={{ textAlign: "center" }}>Doctors</th>
                                        <th style={{ textAlign: "center" }}>OP Patients</th>
                                        <th style={{ textAlign: "center" }}>IP Admissions</th>
                                        <th style={{ textAlign: "right" }}>OP Fees (₹)</th>
                                        <th style={{ textAlign: "right" }}>Pharmacy (₹)</th>
                                        <th style={{ textAlign: "right" }}>Dept Fees (₹)</th>
                                        <th style={{ textAlign: "right" }}>Total Revenue (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBreakdown.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                                No Department Records Found for the Selected Period
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredBreakdown.map((row, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td><strong>{row.department}</strong></td>
                                                <td style={{ textAlign: "center" }}>{row.doctor_count}</td>
                                                <td style={{ textAlign: "center", fontWeight: 600, color: "#059669" }}>{row.total_op}</td>
                                                <td style={{ textAlign: "center", fontWeight: 600, color: "#2563eb" }}>{row.total_ip}</td>
                                                <td style={{ textAlign: "right", fontFamily: "monospace" }}>{formatINR(row.op_income)}</td>
                                                <td style={{ textAlign: "right", fontFamily: "monospace" }}>{formatINR(row.pharmacy_income)}</td>
                                                <td style={{ textAlign: "right", fontFamily: "monospace" }}>{formatINR(row.department_income)}</td>
                                                <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: "#047857" }}>
                                                    {formatINR(row.total_revenue)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {filteredBreakdown.length > 0 && (
                                    <tfoot>
                                        <tr style={{ background: "#f1f5f9", borderTop: "2px solid #000", borderBottom: "3px double #000", fontWeight: 800 }}>
                                            <td colSpan={2} style={{ paddingLeft: "16px" }}>ALL DEPARTMENTS TOTAL</td>
                                            <td style={{ textAlign: "center" }}>{breakdownTotals.totalDoctors}</td>
                                            <td style={{ textAlign: "center", color: "#059669" }}>{breakdownTotals.totalOP}</td>
                                            <td style={{ textAlign: "center", color: "#2563eb" }}>{breakdownTotals.totalIP}</td>
                                            <td style={{ textAlign: "right", fontFamily: "monospace" }}>{formatINR(breakdownTotals.opIncome)}</td>
                                            <td style={{ textAlign: "right", fontFamily: "monospace" }}>{formatINR(breakdownTotals.pharmacyIncome)}</td>
                                            <td style={{ textAlign: "right", fontFamily: "monospace" }}>{formatINR(breakdownTotals.deptIncome)}</td>
                                            <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: "0.92rem", color: "#047857" }}>
                                                {formatINR(breakdownTotals.grandTotal)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>

                    {/* Section 2: Doctor Performance Breakdown */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                            <Stethoscope size={18} color="#059669" />
                            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
                                Doctor Performance Breakdown ({!selectedDept || selectedDept.toLowerCase() === "all" || selectedDept.toLowerCase() === "all departments" ? "All Departments" : selectedDept})
                            </h3>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                                <thead>
                                    <tr>
                                        <th>EMP ID</th>
                                        <th>Doctor Name</th>
                                        <th>Department</th>
                                        <th>Specialty</th>
                                        <th style={{ textAlign: "center" }}>OP Patients</th>
                                        <th style={{ textAlign: "center" }}>IP Admissions</th>
                                        <th style={{ textAlign: "right" }}>Consultation Revenue (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDoctors.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                                No Doctor Records Found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDoctors.map((doc, idx) => (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: 700, color: "#047857", fontFamily: "monospace" }}>{doc.employeeId}</td>
                                                <td><strong>{doc.doctorName}</strong></td>
                                                <td>{doc.department}</td>
                                                <td>{doc.specialty}</td>
                                                <td style={{ textAlign: "center", fontWeight: 600, color: "#059669" }}>{doc.op_count}</td>
                                                <td style={{ textAlign: "center", fontWeight: 600, color: "#2563eb" }}>{doc.ip_count}</td>
                                                <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>
                                                    {formatINR(doc.revenue)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {filteredDoctors.length > 0 && (
                                    <tfoot>
                                        <tr style={{ background: "#f8fafc", borderTop: "2px solid #cbd5e1", fontWeight: 800 }}>
                                            <td colSpan={4} style={{ paddingLeft: "16px" }}>DOCTOR CONSULTATION TOTAL</td>
                                            <td style={{ textAlign: "center", color: "#059669" }}>{doctorTotals.totalOP}</td>
                                            <td style={{ textAlign: "center", color: "#2563eb" }}>{doctorTotals.totalIP}</td>
                                            <td style={{ textAlign: "right", fontFamily: "monospace", color: "#047857" }}>
                                                {formatINR(doctorTotals.totalRev)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>

                    <ReportPrintFooter />
                </DataTableWrapper>
            )}
        </ReportPageWrapper>
    );
};

export default MasterDepartmentWiseReport;
