import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { FaPrint, FaSearch, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { printAccountsReport } from "./printAccountsReport";
import {
    PageWrapper,
    colors,
    fadeIn,
    FormRow,
    InputWrapper,
    Label,
    Button,
    TableWrapper,
    Table,
    Th,
    Td,
    Tr,
    SectionTitle,
} from "../GlobalStyles";

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
`;

const SummaryCard = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-left: 4px solid ${props => props.color || colors.primary};
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 80px;
    animation: ${fadeIn} 0.4s ease-out;
`;

const SummaryValue = styled.h3`
    margin: 0;
    font-size: 1.35rem;
    font-weight: 800;
    color: ${colors.textMain};
`;

const SummaryLabel = styled.p`
    margin: 0;
    font-size: 0.72rem;
    font-weight: 700;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const FilterSection = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PrintTemplate = styled.div`
    display: none;
    @media print {
        display: block !important;
        width: 100%;
        background: white;
        color: black;
        font-family: 'Times New Roman', serif;
    }
`;

const PrintHeader = styled.div`
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 8px;
    margin-bottom: 12px;
    h1 { margin: 0; font-size: 20px; text-transform: uppercase; font-weight: bold; }
    p { margin: 2px 0; font-size: 11px; }
    .report-title { font-size: 14px; font-weight: bold; margin-top: 8px; text-transform: uppercase; text-decoration: underline; }
`;

const PrintInfoTable = styled.table`
    width: 100%;
    margin-bottom: 12px;
    border-collapse: collapse;
    font-size: 10px;
    td { padding: 2px 0; border: none !important; }
`;

const PrintTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 10px;
    th, td {
        border: 1px solid #000 !important;
        padding: 5px 6px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2 !important;
        font-weight: bold;
        text-transform: uppercase;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
`;

const PrintSignatures = styled.div`
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    page-break-inside: avoid;
    .sig-box {
        text-align: center;
        width: 180px;
        border-top: 1px solid #000;
        padding-top: 4px;
        font-weight: bold;
    }
`;

const DepartmentWiseReport = ({ isModalView = false, startDate, endDate }) => {
    const [selectedDept, setSelectedDept] = useState("All");
    const [selectedMonth, setSelectedMonth] = useState(startDate ? (new Date(startDate).getMonth() + 1) : (new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState(startDate ? new Date(startDate).getFullYear() : new Date().getFullYear());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (startDate) {
            const d = new Date(startDate);
            if (!isNaN(d.getTime())) {
                setSelectedMonth(d.getMonth() + 1);
                setSelectedYear(d.getFullYear());
            }
        }
    }, [startDate]);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_name = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL";
    const branch_name = localStorage.getItem("branch_name") || "Main Branch";
    const user_id = localStorage.getItem("employeeId") || localStorage.getItem("user_id") || "Staff";

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiRequest(
                `${HmsBaseUrl}department-dashboard/stats/?department=${encodeURIComponent(selectedDept)}&month=${selectedMonth}&year=${selectedYear}`,
                "GET"
            );
            if (response.success && response.data) {
                setReportData(response.data);
            }
        } catch (error) {
            console.error("Error fetching department report:", error);
        } finally {
            setLoading(false);
        }
    }, [HmsBaseUrl, selectedDept, selectedMonth, selectedYear]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handlePrint = () => printAccountsReport("printable-report-area", "landscape");

    const handleExportExcel = () => {
        if (!reportData || !reportData.department_breakdown || reportData.department_breakdown.length === 0) {
            toast.warning("No data to export");
            return;
        }
        try {
            const deptRows = reportData.department_breakdown.map((d, i) => ({
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

            const wb = XLSX.utils.book_new();
            const ws1 = XLSX.utils.json_to_sheet(deptRows);
            ws1["!cols"] = Object.keys(deptRows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
            XLSX.utils.book_append_sheet(wb, ws1, "Department Breakdown");

            if (reportData.doctor_performance && reportData.doctor_performance.length > 0) {
                const docRows = reportData.doctor_performance.map((doc, idx) => ({
                    "S.No": idx + 1,
                    "EMP ID": doc.employeeId || "",
                    "Doctor Name": doc.doctorName || "",
                    "Department": doc.department || "",
                    "Specialty": doc.specialty || "",
                    "OP Patients": doc.op_count || 0,
                    "IP Admissions": doc.ip_count || 0,
                    "Consultation Revenue (₹)": Number((doc.revenue || 0).toFixed(2))
                }));
                const ws2 = XLSX.utils.json_to_sheet(docRows);
                ws2["!cols"] = Object.keys(docRows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
                XLSX.utils.book_append_sheet(wb, ws2, "Doctor Performance");
            }

            const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', { month: 'short' });
            XLSX.writeFile(wb, `Department_Wise_Report_${monthName}_${selectedYear}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    const kpis = reportData?.kpis || {};
    const departmentsList = reportData?.departments || ["All"];
    const breakdown = reportData?.department_breakdown || [];
    const doctorPerf = reportData?.doctor_performance || [];

    return (
        <PageWrapper style={{ padding: isModalView ? '0' : '20px' }}>
            {isModalView && (
                <div style={{ textAlign: "center", marginBottom: "16px", padding: "10px 0" }}>
                    <h2 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em", color: "#000" }}>
                        {hospital_name}
                    </h2>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111" }}>
                        Department Wise Report For {selectedMonth}/{selectedYear}.
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#333", marginTop: "2px" }}>
                        Printed As On {dayjs().format("DD/MM/YYYY HH:mm:ss")}.
                    </div>
                </div>
            )}

            {!isModalView && (
                <SectionTitle className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2>Department Wise Revenue & Volume Report</h2>
                        <p style={{ fontSize: '0.85rem', color: colors.textMuted, margin: 0 }}>
                            Comprehensive financial report grouped by medical & diagnostic departments
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button 
                            onClick={handleExportExcel} 
                            disabled={loading || breakdown.length === 0} 
                            style={{ background: '#16a34a', borderColor: '#16a34a', color: '#fff' }}
                        >
                            <FaFileExcel style={{ marginRight: '6px' }} /> Export Excel
                        </Button>
                        <Button onClick={handlePrint} style={{ background: '#3b82f6', color: '#fff' }}>
                            <FaPrint style={{ marginRight: '6px' }} /> Print Report
                        </Button>
                    </div>
                </SectionTitle>
            )}

            {/* Filter Controls */}
            {!isModalView && (
                <FilterSection className="no-print">
                    <FormRow style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'flex-end' }}>
                        <InputWrapper>
                            <Label>Department Filter</Label>
                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: `1px solid ${colors.border}`,
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            >
                                {departmentsList.map((d, i) => (
                                    <option key={i} value={d}>{d === "All" ? "All Departments" : d}</option>
                                ))}
                            </select>
                        </InputWrapper>

                        <InputWrapper>
                            <Label>Month</Label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: `1px solid ${colors.border}`,
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                        </InputWrapper>

                        <InputWrapper>
                            <Label>Year</Label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: `1px solid ${colors.border}`,
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            >
                                {[2024, 2025, 2026, 2027].map((yr) => (
                                    <option key={yr} value={yr}>{yr}</option>
                                ))}
                            </select>
                        </InputWrapper>

                        <Button onClick={fetchReport} disabled={loading} style={{ height: '42px', background: colors.primary, color: '#fff' }}>
                            <FaSearch style={{ marginRight: '6px' }} /> {loading ? "Loading..." : "Filter Report"}
                        </Button>
                    </FormRow>
                </FilterSection>
            )}

            {/* KPI Summary Cards */}
            {!isModalView && (
                <SummaryGrid className="no-print">
                    <SummaryCard color="#10b981">
                        <SummaryLabel>Total OP Consultation Fees</SummaryLabel>
                        <SummaryValue>₹{(kpis.op_income || 0).toLocaleString('en-IN')}</SummaryValue>
                    </SummaryCard>

                    <SummaryCard color="#3b82f6">
                        <SummaryLabel>Total Pharmacy Billings</SummaryLabel>
                        <SummaryValue>₹{(kpis.pharmacy_income || 0).toLocaleString('en-IN')}</SummaryValue>
                    </SummaryCard>

                    <SummaryCard color="#8b5cf6">
                        <SummaryLabel>Total Departmental Procedures</SummaryLabel>
                        <SummaryValue>₹{(kpis.department_income || 0).toLocaleString('en-IN')}</SummaryValue>
                    </SummaryCard>

                    <SummaryCard color="#f59e0b">
                        <SummaryLabel>Grand Total Revenue</SummaryLabel>
                        <SummaryValue style={{ color: '#d97706' }}>₹{(kpis.total_revenue || 0).toLocaleString('en-IN')}</SummaryValue>
                    </SummaryCard>
                </SummaryGrid>
            )}

            {/* Department Breakdown Table */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.textMain, marginBottom: '12px' }}>
                Department Revenue & Patient Volume Breakdown
            </h3>
            <TableWrapper style={{ marginBottom: '28px' }}>
                <Table>
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>Department Name</Th>
                            <Th style={{ textAlign: 'center' }}>Doctors</Th>
                            <Th style={{ textAlign: 'center' }}>OP Patients</Th>
                            <Th style={{ textAlign: 'center' }}>IP Admissions</Th>
                            <Th style={{ textAlign: 'right' }}>OP Fees (₹)</Th>
                            <Th style={{ textAlign: 'right' }}>Pharmacy (₹)</Th>
                            <Th style={{ textAlign: 'right' }}>Dept Fees (₹)</Th>
                            <Th style={{ textAlign: 'right' }}>Total Revenue (₹)</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {breakdown.length > 0 ? (
                            breakdown.map((row, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td style={{ fontWeight: 700 }}>{row.department}</Td>
                                    <Td style={{ textAlign: 'center' }}>{row.doctor_count}</Td>
                                    <Td style={{ textAlign: 'center', fontWeight: 600, color: '#10b981' }}>{row.total_op}</Td>
                                    <Td style={{ textAlign: 'center', fontWeight: 600, color: '#3b82f6' }}>{row.total_ip}</Td>
                                    <Td style={{ textAlign: 'right' }}>₹{row.op_income.toLocaleString('en-IN')}</Td>
                                    <Td style={{ textAlign: 'right' }}>₹{row.pharmacy_income.toLocaleString('en-IN')}</Td>
                                    <Td style={{ textAlign: 'right' }}>₹{row.department_income.toLocaleString('en-IN')}</Td>
                                    <Td style={{ textAlign: 'right', fontWeight: 800, color: '#047857' }}>
                                        ₹{row.total_revenue.toLocaleString('en-IN')}
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="9" style={{ textAlign: 'center', color: colors.textMuted }}>
                                    No records found for the selected period.
                                </Td>
                            </Tr>
                        )}
                        {breakdown.length > 0 && (
                            <Tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                                <Td colSpan="2">GRAND TOTAL</Td>
                                <Td style={{ textAlign: 'center' }}>{kpis.doctor_count || 0}</Td>
                                <Td style={{ textAlign: 'center' }}>{kpis.total_op || 0}</Td>
                                <Td style={{ textAlign: 'center' }}>{kpis.total_ip || 0}</Td>
                                <Td style={{ textAlign: 'right' }}>₹{(kpis.op_income || 0).toLocaleString('en-IN')}</Td>
                                <Td style={{ textAlign: 'right' }}>₹{(kpis.pharmacy_income || 0).toLocaleString('en-IN')}</Td>
                                <Td style={{ textAlign: 'right' }}>₹{(kpis.department_income || 0).toLocaleString('en-IN')}</Td>
                                <Td style={{ textAlign: 'right', color: '#047857', fontSize: '1rem' }}>
                                    ₹{(kpis.total_revenue || 0).toLocaleString('en-IN')}
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                </Table>
            </TableWrapper>

            {/* Doctor Breakdown within Department */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.textMain, marginBottom: '12px' }}>
                Doctor Performance ({selectedDept === "All" ? "All Departments" : selectedDept})
            </h3>
            <TableWrapper>
                <Table>
                    <thead>
                        <Tr>
                            <Th>EMP ID</Th>
                            <Th>Doctor Name</Th>
                            <Th>Department</Th>
                            <Th>Specialty</Th>
                            <Th style={{ textAlign: 'center' }}>OP Patients</Th>
                            <Th style={{ textAlign: 'center' }}>IP Admissions</Th>
                            <Th style={{ textAlign: 'right' }}>Consultation Revenue (₹)</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {doctorPerf.length > 0 ? (
                            doctorPerf.map((doc, idx) => (
                                <Tr key={idx}>
                                    <Td style={{ fontWeight: 700, color: '#047857' }}>{doc.employeeId}</Td>
                                    <Td style={{ fontWeight: 700 }}>{doc.doctorName}</Td>
                                    <Td>{doc.department}</Td>
                                    <Td>{doc.specialty}</Td>
                                    <Td style={{ textAlign: 'center', fontWeight: 600, color: '#10b981' }}>{doc.op_count}</Td>
                                    <Td style={{ textAlign: 'center', fontWeight: 600, color: '#3b82f6' }}>{doc.ip_count}</Td>
                                    <Td style={{ textAlign: 'right', fontWeight: 700 }}>₹{doc.revenue.toLocaleString('en-IN')}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="7" style={{ textAlign: 'center', color: colors.textMuted }}>
                                    No doctors found for this filter.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                </Table>
            </TableWrapper>

            <style>{`
                @media print {
                    @page { size: landscape; margin: 8mm; }
                    body * { visibility: hidden; }
                    #printable-report-area, #printable-report-area * { visibility: visible; }
                    #printable-report-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }
                    body { background: white !important; font-family: 'Times New Roman', serif; }
                }
            `}</style>

            <PrintTemplate id="printable-report-area">
                <PrintHeader>
                    <h1>{hospital_name}</h1>
                    <p>{branch_name}</p>
                    <div className="report-title">Department Wise Revenue & Volume Report</div>
                </PrintHeader>

                <PrintInfoTable>
                    <tbody>
                        <tr>
                            <td style={{ width: "35%" }}><strong>Period:</strong> {new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' })} {selectedYear}</td>
                            <td style={{ width: "35%" }}><strong>Department:</strong> {selectedDept === "All" ? "All Departments" : selectedDept}</td>
                            <td style={{ width: "30%", textAlign: "right" }}><strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Doctors:</strong> {kpis.doctor_count || 0}</td>
                            <td><strong>Grand Total Revenue:</strong> ₹{(kpis.total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style={{ textAlign: "right" }}><strong>Printed By:</strong> {user_id}</td>
                        </tr>
                    </tbody>
                </PrintInfoTable>

                <div style={{ fontSize: "11px", fontWeight: "bold", margin: "8px 0 4px", textTransform: "uppercase" }}>
                    Department Revenue Breakdown
                </div>
                <PrintTable>
                    <thead>
                        <tr>
                            <th style={{ width: "35px" }}>S.No</th>
                            <th>Department</th>
                            <th style={{ textAlign: "center" }}>Doctors</th>
                            <th style={{ textAlign: "center" }}>OP Patients</th>
                            <th style={{ textAlign: "center" }}>IP Adm</th>
                            <th style={{ textAlign: "right" }}>OP Fees (₹)</th>
                            <th style={{ textAlign: "right" }}>Pharmacy (₹)</th>
                            <th style={{ textAlign: "right" }}>Dept Fees (₹)</th>
                            <th style={{ textAlign: "right" }}>Total Revenue (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {breakdown.map((row, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{row.department}</td>
                                <td style={{ textAlign: "center" }}>{row.doctor_count}</td>
                                <td style={{ textAlign: "center" }}>{row.total_op}</td>
                                <td style={{ textAlign: "center" }}>{row.total_ip}</td>
                                <td style={{ textAlign: "right" }}>₹{row.op_income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style={{ textAlign: "right" }}>₹{row.pharmacy_income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style={{ textAlign: "right" }}>₹{row.department_income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style={{ textAlign: "right", fontWeight: "bold" }}>₹{row.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: "bold", background: "#f2f2f2" }}>
                            <td colSpan="2" style={{ textAlign: "right" }}>GRAND TOTAL:</td>
                            <td style={{ textAlign: "center" }}>{kpis.doctor_count || 0}</td>
                            <td style={{ textAlign: "center" }}>{kpis.total_op || 0}</td>
                            <td style={{ textAlign: "center" }}>{kpis.total_ip || 0}</td>
                            <td style={{ textAlign: "right" }}>₹{(kpis.op_income || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style={{ textAlign: "right" }}>₹{(kpis.pharmacy_income || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style={{ textAlign: "right" }}>₹{(kpis.department_income || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style={{ textAlign: "right" }}>₹{(kpis.total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                </PrintTable>

                {doctorPerf.length > 0 && (
                    <>
                        <div style={{ fontSize: "11px", fontWeight: "bold", margin: "14px 0 4px", textTransform: "uppercase" }}>
                            Doctor Performance Breakdown
                        </div>
                        <PrintTable>
                            <thead>
                                <tr>
                                    <th style={{ width: "35px" }}>S.No</th>
                                    <th>EMP ID</th>
                                    <th>Doctor Name</th>
                                    <th>Department</th>
                                    <th>Specialty</th>
                                    <th style={{ textAlign: "center" }}>OP Patients</th>
                                    <th style={{ textAlign: "center" }}>IP Adm</th>
                                    <th style={{ textAlign: "right" }}>Consultation Revenue (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctorPerf.map((doc, idx) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{doc.employeeId}</td>
                                        <td>{doc.doctorName}</td>
                                        <td>{doc.department}</td>
                                        <td>{doc.specialty}</td>
                                        <td style={{ textAlign: "center" }}>{doc.op_count}</td>
                                        <td style={{ textAlign: "center" }}>{doc.ip_count}</td>
                                        <td style={{ textAlign: "right" }}>₹{doc.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </PrintTable>
                    </>
                )}

                <PrintSignatures>
                    <div className="sig-box">Prepared By</div>
                    <div className="sig-box">Accounts Officer</div>
                    <div className="sig-box">Authorized Signatory</div>
                </PrintSignatures>
            </PrintTemplate>
        </PageWrapper>
    );
};

export default DepartmentWiseReport;
