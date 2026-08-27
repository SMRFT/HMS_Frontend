import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { FaPrint, FaSearch, FaFileExcel } from "react-icons/fa";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
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

const DepartmentWiseReport = ({ isModalView = false }) => {
    const [selectedDept, setSelectedDept] = useState("All");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

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

    const handlePrint = () => window.print();

    const handleExportCSV = () => {
        if (!reportData || !reportData.department_breakdown) return;
        const headers = ["Department", "Doctors", "OP Count", "IP Count", "OP Revenue (INR)", "Pharmacy Revenue (INR)", "Dept Revenue (INR)", "Total Revenue (INR)"];
        const rows = reportData.department_breakdown.map(d => [
            `"${d.department}"`,
            d.doctor_count,
            d.total_op,
            d.total_ip,
            d.op_income,
            d.pharmacy_income,
            d.department_income,
            d.total_revenue
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Department_Wise_Report_${selectedMonth}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const kpis = reportData?.kpis || {};
    const departmentsList = reportData?.departments || ["All"];
    const breakdown = reportData?.department_breakdown || [];
    const doctorPerf = reportData?.doctor_performance || [];

    return (
        <PageWrapper style={{ padding: isModalView ? '0' : '20px' }}>
            <SectionTitle className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Department Wise Revenue & Volume Report</h2>
                    <p style={{ fontSize: '0.85rem', color: colors.textMuted, margin: 0 }}>
                        Comprehensive financial report grouped by medical & diagnostic departments
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button onClick={handleExportCSV} style={{ background: '#10b981', color: '#fff' }}>
                        <FaFileExcel style={{ marginRight: '6px' }} /> Export CSV
                    </Button>
                    <Button onClick={handlePrint} style={{ background: '#3b82f6', color: '#fff' }}>
                        <FaPrint style={{ marginRight: '6px' }} /> Print Report
                    </Button>
                </div>
            </SectionTitle>

            {/* Filter Controls */}
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
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>
                                    {new Date(2026, m - 1, 1).toLocaleString('default', { month: 'long' })}
                                </option>
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
                            {[2024, 2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </InputWrapper>

                    <Button onClick={fetchReport} disabled={loading} style={{ height: '42px' }}>
                        <FaSearch style={{ marginRight: '6px' }} /> {loading ? "Loading..." : "Filter Report"}
                    </Button>
                </FormRow>
            </FilterSection>

            {/* KPI Summary Cards */}
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
        </PageWrapper>
    );
};

export default DepartmentWiseReport;
