import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
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
    Select,
    Button,
    TableWrapper,
    Table,
    Th,
    Td,
    Tr,
    SectionTitle,
} from "../GlobalStyles";

const SummaryCard = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-left: 4px solid ${props => props.color || colors.secondary};
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 80px;
    animation: ${fadeIn} 0.4s ease-out;
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
        background: white;
        width: 100%;
        color: black;
        font-family: 'Courier New', Courier, monospace;
    }
`;

const PrintHeader = styled.div`
    text-align: center;
    padding-bottom: 2px;
    margin-bottom: 4px;
    h1 { margin: 0; font-size: 14px; text-transform: uppercase; font-weight: bold; }
    p { margin: 1px 0; font-size: 10px; }
    .report-title { font-size: 11px; font-weight: bold; margin-top: 4px; }
`;

const PrintMetaTable = styled.table`
    width: 100%;
    margin-bottom: 4px;
    border-collapse: collapse;
    font-size: 9px;
    td { padding: 1px 0; border: none !important; }
`;

const PrintTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin: 4px 0;
    font-size: 7.5px;
    th, td {
        border-top: 1px dashed #aaa;
        border-bottom: 1px dashed #aaa;
        padding: 2px 2px;
        text-align: left;
    }
    th {
        border-top: 1px solid #000 !important;
        border-bottom: 1px solid #000 !important;
        font-weight: bold;
        text-transform: capitalize;
    }
    .company-header-row td {
        border-top: 1px dashed #000 !important;
        border-bottom: none !important;
        font-size: 8.5px;
    }
    .company-sub-row td {
        border-top: none !important;
        border-bottom: none !important;
        font-size: 8px;
    }
    .company-total-row td {
        border-top: 1px dashed #000 !important;
        border-bottom: 1px dashed #000 !important;
    }
    .grand-total-row td {
        border-top: 1px solid #000 !important;
        border-bottom: 1px solid #000 !important;
    }
`;

const AdvanceRegistrationInsurence = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [selectedCompany, setSelectedCompany] = useState("all");
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    const fetchReport = useCallback(async () => {
        if (!fromDate || !toDate) return;
        setLoading(true);
        try {
            const url = `${HmsBaseUrl}discharge-bills-report/?from_date=${fromDate}&to_date=${toDate}&insurance=true&status=Billed`;
            const response = await apiRequest(url, "GET");
            if (response.success && response.data) {
                const rows = Array.isArray(response.data.data)
                    ? response.data.data
                    : Array.isArray(response.data)
                    ? response.data
                    : [];
                setReportData(rows);
            }
        } catch (error) {
            console.error("Error fetching insurance discharge report:", error);
            toast.error("Failed to fetch insurance bills status report");
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Unique Companies for Filter with name and code
    const uniqueCompanies = useMemo(() => {
        const compMap = new Map();
        reportData.forEach(r => {
            const name = r.company_name || r.insurance_company || "GENERAL / PRIVATE";
            const code = r.company_code || "";
            if (!compMap.has(name)) {
                compMap.set(name, { name, code });
            } else if (code && !compMap.get(name).code) {
                compMap.set(name, { name, code });
            }
        });
        return Array.from(compMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [reportData]);

    // Grouping by Insurance Company
    const groupedData = useMemo(() => {
        const groups = {};
        const filtered = selectedCompany === "all"
            ? reportData
            : reportData.filter(r => (r.company_name || r.insurance_company || "GENERAL / PRIVATE") === selectedCompany);

        filtered.forEach(item => {
            const compName = item.company_name || item.insurance_company || "GENERAL / PRIVATE";
            const compCode = item.company_code || "";
            if (!groups[compName]) {
                groups[compName] = {
                    companyName: compName,
                    companyCode: compCode,
                    items: []
                };
            } else if (compCode && !groups[compName].companyCode) {
                groups[compName].companyCode = compCode;
            }
            groups[compName].items.push(item);
        });
        return groups;
    }, [reportData, selectedCompany]);

    // Grand Totals
    const grandTotals = useMemo(() => {
        let billAmt = 0;
        let advanceAmt = 0;
        let settledAmt = 0;
        let tdsAmt = 0;
        let paidByPatientAmt = 0;
        let disallowedAmt = 0;
        let dueAmt = 0;
        let totalCount = 0;

        Object.values(groupedData).forEach(group => {
            group.items.forEach(r => {
                totalCount += 1;
                billAmt += Number(r.bill_amount || r.total_amount || 0);
                advanceAmt += Number(r.advance || r.advance_amount || 0);
                settledAmt += Number(r.settled_amount || 0);
                tdsAmt += Number(r.tds || 0);
                paidByPatientAmt += Number(r.paid_by_patient || 0);
                disallowedAmt += Number(r.disallowed_amount || 0);
                dueAmt += Number(r.due || 0);
            });
        });

        return {
            totalCount,
            billAmt,
            advanceAmt,
            settledAmt,
            tdsAmt,
            paidByPatientAmt,
            disallowedAmt,
            dueAmt
        };
    }, [groupedData]);

    const handlePrint = () => {
        printAccountsReport("printable-insurance-bills-area", "landscape");
    };

    const handleExportExcel = () => {
        if (!reportData || reportData.length === 0) {
            toast.warning("No data to export");
            return;
        }
        try {
            const rows = [];

            Object.entries(groupedData).forEach(([companyName, group]) => {
                const compCodeStr = group.companyCode ? ` (${group.companyCode})` : "";
                group.items.forEach((r, idx) => {
                    rows.push({
                        "Company Name": `${companyName}${compCodeStr}`,
                        "Company Code": r.company_code || group.companyCode || "",
                        "SLNO": idx + 1,
                        "Bill date": r.bill_date ? dayjs(r.bill_date).format("DD/MM/YYYY") : "",
                        "IP Number": r.ip_number || "",
                        "Bill ID": r.bill_id || r.bill_no || "",
                        "Sh Bill Number": r.sh_bill_no || r.bill_no || "",
                        "Patient Name": r.patient_name || r.patient_details?.patient_name || "",
                        "Admitting Date": r.admitting_date ? dayjs(r.admitting_date).format("DD/MM/YYYY") : "",
                        "Discharge Date": r.discharge_date ? dayjs(r.discharge_date).format("DD/MM/YYYY") : (r.bill_date ? dayjs(r.bill_date).format("DD/MM/YYYY") : ""),
                        "Card Number": r.card_number || "",
                        "Service No": r.service_no || "",
                        "Claim Reference": r.claim_reference || "",
                        "Place": r.place || "",
                        "Bill Amount": Number((r.bill_amount || r.total_amount || 0).toFixed(2)),
                        "Advance": Number((r.advance || r.advance_amount || 0).toFixed(2)),
                        "Despatch Date": r.despatch_date ? dayjs(r.despatch_date).format("DD/MM/YYYY") : "",
                        "Settlement Date": r.settlement_date ? dayjs(r.settlement_date).format("DD/MM/YYYY") : "",
                        "Settled Amount": Number((r.settled_amount || 0).toFixed(2)),
                        "TDS": Number((r.tds || 0).toFixed(2)),
                        "Bank": r.bank || "",
                        "Paid By Patient": Number((r.paid_by_patient || 0).toFixed(2)),
                        "Disallowed Amount": Number((r.disallowed_amount || 0).toFixed(2)),
                        "DUE": Number((r.due || 0).toFixed(2)),
                        "Settlement Duration": r.settlement_duration || "",
                        "Status": r.status || "NOT BILLED",
                        "Old Billno": r.old_billno || ""
                    });
                });

                // Company Subtotal
                rows.push({
                    "Company Name": `${companyName}${compCodeStr} Total`,
                    "Company Code": "",
                    "SLNO": `Total Bills : ${group.items.length}`,
                    "Bill date": "",
                    "IP Number": "",
                    "Bill ID": "",
                    "Sh Bill Number": "",
                    "Patient Name": "",
                    "Admitting Date": "",
                    "Discharge Date": "",
                    "Card Number": "",
                    "Service No": "",
                    "Claim Reference": "",
                    "Place": "",
                    "Bill Amount": Number(group.items.reduce((s, x) => s + Number(x.bill_amount || x.total_amount || 0), 0).toFixed(2)),
                    "Advance": Number(group.items.reduce((s, x) => s + Number(x.advance || x.advance_amount || 0), 0).toFixed(2)),
                    "Despatch Date": "",
                    "Settlement Date": "",
                    "Settled Amount": Number(group.items.reduce((s, x) => s + Number(x.settled_amount || 0), 0).toFixed(2)),
                    "TDS": "",
                    "Bank": "",
                    "Paid By Patient": Number(group.items.reduce((s, x) => s + Number(x.paid_by_patient || 0), 0).toFixed(2)),
                    "Disallowed Amount": Number(group.items.reduce((s, x) => s + Number(x.disallowed_amount || 0), 0).toFixed(2)),
                    "DUE": Number(group.items.reduce((s, x) => s + Number(x.due || 0), 0).toFixed(2)),
                    "Settlement Duration": "",
                    "Status": "",
                    "Old Billno": ""
                });
            });

            // Grand Total
            rows.push({
                "Company Name": "Grand Total",
                "Company Code": "",
                "SLNO": `Total Bills : ${grandTotals.totalCount}`,
                "Bill date": "",
                "IP Number": "",
                "Bill ID": "",
                "Sh Bill Number": "",
                "Patient Name": "",
                "Admitting Date": "",
                "Discharge Date": "",
                "Card Number": "",
                "Service No": "",
                "Claim Reference": "",
                "Place": "",
                "Bill Amount": Number(grandTotals.billAmt.toFixed(2)),
                "Advance": Number(grandTotals.advanceAmt.toFixed(2)),
                "Despatch Date": "",
                "Settlement Date": "",
                "Settled Amount": Number(grandTotals.settledAmt.toFixed(2)),
                "TDS": Number(grandTotals.tdsAmt.toFixed(2)),
                "Bank": "",
                "Paid By Patient": Number(grandTotals.paidByPatientAmt.toFixed(2)),
                "Disallowed Amount": Number(grandTotals.disallowedAmt.toFixed(2)),
                "DUE": Number(grandTotals.dueAmt.toFixed(2)),
                "Settlement Duration": "",
                "Status": "",
                "Old Billno": "(End.)"
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);
            ws["!cols"] = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
            XLSX.utils.book_append_sheet(wb, ws, "Insurance Bills Status");
            XLSX.writeFile(wb, `Insurance_Bills_Status_Report_${fromDate}_to_${toDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Insurance Bills Status Report (Discharge)</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Company-wise grouped insurance discharge claims audit and settlement status
                </p>
            </SectionTitle>

            <FilterSection className="no-print">
                <FormRow>
                    <InputWrapper>
                        <Label>From Date</Label>
                        <DatePicker 
                            value={fromDate ? dayjs(fromDate) : null} 
                            onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : "")}
                            format="DD/MM/YYYY"
                            style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>To Date</Label>
                        <DatePicker 
                            value={toDate ? dayjs(toDate) : null} 
                            onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : "")}
                            format="DD/MM/YYYY"
                            style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                        />
                    </InputWrapper>
                    <InputWrapper style={{ minWidth: "260px", flex: 1 }}>
                        <Label>Insurance Company</Label>
                        <Select
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                            style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                        >
                            <option value="all">All Companies ({uniqueCompanies.length})</option>
                            {uniqueCompanies.map((c, i) => (
                                <option key={i} value={c.name}>
                                    {c.name} {c.code ? `(${c.code})` : ""}
                                </option>
                            ))}
                        </Select>
                    </InputWrapper>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                        <Button onClick={fetchReport} disabled={loading} style={{ height: "40px" }}>
                            <FaSearch style={{ marginRight: "8px" }} /> {loading ? "Searching..." : "Search"}
                        </Button>
                        <Button 
                            onClick={handleExportExcel} 
                            disabled={loading || reportData.length === 0} 
                            style={{ height: "40px", background: "#16a34a", borderColor: "#16a34a", color: "#fff" }}
                        >
                            <FaFileExcel style={{ marginRight: "8px" }} /> Export Excel
                        </Button>
                        <Button onClick={handlePrint} secondary style={{ height: "40px" }}>
                            <FaPrint style={{ marginRight: "8px" }} /> Print
                        </Button>
                    </div>
                </FormRow>
            </FilterSection>

            {/* Summary Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "20px" }} className="no-print">
                <SummaryCard color={colors.primary}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" }}>Total Bills</span>
                    <h3 style={{ margin: 0 }}>{grandTotals.totalCount}</h3>
                </SummaryCard>
                <SummaryCard color={colors.info || "#3b82f6"}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" }}>Total Bill Amount</span>
                    <h3 style={{ margin: 0, color: colors.info || "#3b82f6" }}>₹{grandTotals.billAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
                </SummaryCard>
                <SummaryCard color={colors.success}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" }}>Total Settled</span>
                    <h3 style={{ margin: 0, color: colors.success }}>₹{grandTotals.settledAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
                </SummaryCard>
                <SummaryCard color={colors.warning || "#f59e0b"}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" }}>Patient / Advance</span>
                    <h3 style={{ margin: 0, color: colors.warning || "#f59e0b" }}>₹{(grandTotals.advanceAmt + grandTotals.paidByPatientAmt).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
                </SummaryCard>
                <SummaryCard color={colors.error || "#ef4444"}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" }}>Total Outstanding DUE</span>
                    <h3 style={{ margin: 0, color: colors.error || "#ef4444" }}>₹{grandTotals.dueAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
                </SummaryCard>
            </div>

            {/* Screen Table (With horizontal scroll for all 25 columns) */}
            <TableWrapper className="no-print" style={{ overflowX: "auto" }}>
                <Table style={{ minWidth: "2200px" }}>
                    <thead>
                        <Tr>
                            <Th style={{ width: "40px" }}>SLNO</Th>
                            <Th>Bill date</Th>
                            <Th>IP Number</Th>
                            <Th>Bill ID</Th>
                            <Th>Sh Bill Number</Th>
                            <Th>Patient Name</Th>
                            <Th>Admitting Date</Th>
                            <Th>Discharge Date</Th>
                            <Th>Card Number</Th>
                            <Th>Service No</Th>
                            <Th>Claim Reference</Th>
                            <Th>Place</Th>
                            <Th style={{ textAlign: "right" }}>Bill Amount</Th>
                            <Th style={{ textAlign: "right" }}>Advance</Th>
                            <Th>Despatch Date</Th>
                            <Th>Settlement Date</Th>
                            <Th style={{ textAlign: "right" }}>Settled Amount</Th>
                            <Th style={{ textAlign: "right" }}>TDS</Th>
                            <Th>Bank</Th>
                            <Th style={{ textAlign: "right" }}>Paid By Patient</Th>
                            <Th style={{ textAlign: "right" }}>Disallowed Amount</Th>
                            <Th style={{ textAlign: "right" }}>DUE</Th>
                            <Th>Settlement Duration</Th>
                            <Th>Status</Th>
                            <Th>Old Billno</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {Object.keys(groupedData).length > 0 ? (
                            Object.entries(groupedData).map(([companyName, group]) => {
                                let compBillTotal = 0;
                                let compDueTotal = 0;
                                const compDisplay = `${group.companyName} ${group.companyCode ? `(${group.companyCode})` : ""}`;

                                return (
                                    <React.Fragment key={companyName}>
                                        <Tr style={{ background: "#e2e8f0", fontWeight: "bold" }}>
                                            <Td colSpan="25" style={{ color: "#0f172a", fontSize: "0.95rem", padding: "10px 14px" }}>
                                                Company Name : {compDisplay} &nbsp;|&nbsp; <span style={{ fontSize: "0.85rem", color: "#64748b" }}>PVT</span>
                                            </Td>
                                        </Tr>
                                        {group.items.map((r, idx) => {
                                            const billAmt = Number(r.bill_amount || r.total_amount || 0);
                                            const advAmt = Number(r.advance || r.advance_amount || 0);
                                            const dueAmt = Number(r.due || 0);
                                            compBillTotal += billAmt;
                                            compDueTotal += dueAmt;

                                            return (
                                                <Tr key={r.bill_id || r.bill_no || idx}>
                                                    <Td>{idx + 1}</Td>
                                                    <Td>{r.bill_date ? dayjs(r.bill_date).format("DD/MM/YYYY") : "—"}</Td>
                                                    <Td style={{ fontWeight: "700" }}>{r.ip_number || "—"}</Td>
                                                    <Td>{r.bill_id || r.bill_no || "—"}</Td>
                                                    <Td>{r.sh_bill_no || r.bill_no || "—"}</Td>
                                                    <Td style={{ fontWeight: "600" }}>{r.patient_name || r.patient_details?.patient_name || "—"}</Td>
                                                    <Td>{r.admitting_date ? dayjs(r.admitting_date).format("DD/MM/YYYY") : "—"}</Td>
                                                    <Td>{r.discharge_date ? dayjs(r.discharge_date).format("DD/MM/YYYY") : (r.bill_date ? dayjs(r.bill_date).format("DD/MM/YYYY") : "—")}</Td>
                                                    <Td>{r.card_number || "—"}</Td>
                                                    <Td>{r.service_no || "—"}</Td>
                                                    <Td>{r.claim_reference || "—"}</Td>
                                                    <Td>{r.place || "—"}</Td>
                                                    <Td style={{ textAlign: "right", fontWeight: "600" }}>₹{billAmt.toFixed(2)}</Td>
                                                    <Td style={{ textAlign: "right" }}>₹{advAmt.toFixed(2)}</Td>
                                                    <Td>{r.despatch_date ? dayjs(r.despatch_date).format("DD/MM/YYYY") : "—"}</Td>
                                                    <Td>{r.settlement_date ? dayjs(r.settlement_date).format("DD/MM/YYYY") : "—"}</Td>
                                                    <Td style={{ textAlign: "right", color: colors.success }}>₹{Number(r.settled_amount || 0).toFixed(2)}</Td>
                                                    <Td style={{ textAlign: "right" }}>₹{Number(r.tds || 0).toFixed(2)}</Td>
                                                    <Td>{r.bank || "—"}</Td>
                                                    <Td style={{ textAlign: "right" }}>₹{Number(r.paid_by_patient || 0).toFixed(2)}</Td>
                                                    <Td style={{ textAlign: "right", color: colors.error || "#dc2626" }}>₹{Number(r.disallowed_amount || 0).toFixed(2)}</Td>
                                                    <Td style={{ textAlign: "right", fontWeight: "700", color: dueAmt > 0 ? (colors.error || "#dc2626") : colors.success }}>₹{dueAmt.toFixed(2)}</Td>
                                                    <Td>{r.settlement_duration || "—"}</Td>
                                                    <Td>{r.status || "NOT BILLED"}</Td>
                                                    <Td>{r.old_billno || "—"}</Td>
                                                </Tr>
                                            );
                                        })}
                                        {/* Company Subtotal */}
                                        <Tr style={{ background: "#f1f5f9", fontWeight: "bold" }}>
                                            <Td colSpan="12" style={{ textAlign: "left", paddingLeft: "20px" }}>Total Bills : {group.items.length}</Td>
                                            <Td style={{ textAlign: "right" }}>₹{compBillTotal.toFixed(2)}</Td>
                                            <Td colSpan="8"></Td>
                                            <Td style={{ textAlign: "right" }}>₹{compDueTotal.toFixed(2)}</Td>
                                            <Td colSpan="3"></Td>
                                        </Tr>
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <Tr>
                                <Td colSpan="25" style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                                    No insurance bills found for the selected dates.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot>
                            <Tr style={{ background: "#cbd5e1", fontWeight: "900", fontSize: "0.95rem" }}>
                                <Td colSpan="12" style={{ textAlign: "left", paddingLeft: "20px" }}>Grand Total (Bills: {grandTotals.totalCount})</Td>
                                <Td style={{ textAlign: "right" }}>₹{grandTotals.billAmt.toFixed(2)}</Td>
                                <Td colSpan="8"></Td>
                                <Td style={{ textAlign: "right" }}>₹{grandTotals.dueAmt.toFixed(2)}</Td>
                                <Td colSpan="3">(End.)</Td>
                            </Tr>
                        </tfoot>
                    )}
                </Table>
            </TableWrapper>

            {/* Print Styles */}
            <style>
                {`
                @media print {
                    @page { size: landscape; margin: 6mm; }
                    body * { visibility: hidden; }
                    #printable-insurance-bills-area, #printable-insurance-bills-area * { visibility: visible; }
                    #printable-insurance-bills-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }
                    body { background: white !important; font-family: monospace, Courier, sans-serif !important; }
                }
                `}
            </style>

            {/* Printable Report matching PDF 2 format */}
            <PrintTemplate id="printable-insurance-bills-area">
                <PrintHeader>
                    <h1>{localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED"}</h1>
                    <p>{localStorage.getItem("hospital_address") || "51/24.Saradha College Road, Salem - 636007."}</p>
                    <div className="report-title">
                        Insurance Bills Status Report From {dayjs(fromDate).format("DD/MM/YYYY")} To {dayjs(toDate).format("DD/MM/YYYY")}.
                    </div>
                </PrintHeader>

                <PrintMetaTable>
                    <tbody>
                        <tr>
                            <td style={{ textAlign: "right" }}>
                                <strong>Page :</strong> 1.
                            </td>
                        </tr>
                    </tbody>
                </PrintMetaTable>

                <PrintTable>
                    <thead>
                        <tr>
                            <th>SLNO</th>
                            <th>Bill date</th>
                            <th>IP Number</th>
                            <th>Bill ID</th>
                            <th>Sh Bill Number</th>
                            <th>Patient Name</th>
                            <th>Admitting Date</th>
                            <th>Discharge Date</th>
                            <th>Card Number</th>
                            <th>Service No</th>
                            <th>Claim Reference</th>
                            <th>Place</th>
                            <th style={{ textAlign: "right" }}>Bill Amount</th>
                            <th style={{ textAlign: "right" }}>Advance</th>
                            <th>Despatch Date</th>
                            <th>Settlement Date</th>
                            <th style={{ textAlign: "right" }}>Settled Amount</th>
                            <th style={{ textAlign: "right" }}>TDS</th>
                            <th>Bank</th>
                            <th style={{ textAlign: "right" }}>Paid By Patient</th>
                            <th style={{ textAlign: "right" }}>Disallowed Amount</th>
                            <th style={{ textAlign: "right" }}>DUE</th>
                            <th>Settlement Duration</th>
                            <th>Status</th>
                            <th>Old Billno</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedData).map(([companyName, group]) => {
                            let compBillTotal = 0;
                            let compDueTotal = 0;
                            const compDisplay = `${group.companyName} ${group.companyCode ? `(${group.companyCode})` : ""}`;

                            return (
                                <React.Fragment key={`print-comp-${companyName}`}>
                                    <tr className="company-header-row">
                                        <td colSpan="25" style={{ fontWeight: "bold", textAlign: "left", padding: "4px 2px", borderTop: "1px dashed #000" }}>
                                            Company Name : {compDisplay}
                                        </td>
                                    </tr>
                                    <tr className="company-sub-row">
                                        <td colSpan="25" style={{ fontWeight: "bold", textAlign: "left", padding: "2px 2px" }}>
                                            PVT
                                        </td>
                                    </tr>
                                    {group.items.map((r, idx) => {
                                        const billAmt = Number(r.bill_amount || r.total_amount || 0);
                                        const advAmt = Number(r.advance || r.advance_amount || 0);
                                        const dueAmt = Number(r.due || 0);
                                        compBillTotal += billAmt;
                                        compDueTotal += dueAmt;

                                        return (
                                            <tr key={`print-row-${companyName}-${idx}`}>
                                                <td>{idx + 1}</td>
                                                <td>{r.bill_date ? dayjs(r.bill_date).format("DD/MM/YYYY") : ""}</td>
                                                <td>{r.ip_number || ""}</td>
                                                <td>{r.bill_id || r.bill_no || ""}</td>
                                                <td>{r.sh_bill_no || r.bill_no || ""}</td>
                                                <td>{r.patient_name || r.patient_details?.patient_name || ""}</td>
                                                <td>{r.admitting_date ? dayjs(r.admitting_date).format("DD/MM/YYYY") : ""}</td>
                                                <td>{r.discharge_date ? dayjs(r.discharge_date).format("DD/MM/YYYY") : (r.bill_date ? dayjs(r.bill_date).format("DD/MM/YYYY") : "")}</td>
                                                <td>{r.card_number || ""}</td>
                                                <td>{r.service_no || ""}</td>
                                                <td>{r.claim_reference || ""}</td>
                                                <td>{r.place || ""}</td>
                                                <td style={{ textAlign: "right" }}>{billAmt.toFixed(2)}</td>
                                                <td style={{ textAlign: "right" }}>{advAmt.toFixed(2)}</td>
                                                <td>{r.despatch_date ? dayjs(r.despatch_date).format("DD/MM/YYYY") : ""}</td>
                                                <td>{r.settlement_date ? dayjs(r.settlement_date).format("DD/MM/YYYY") : ""}</td>
                                                <td style={{ textAlign: "right" }}>{Number(r.settled_amount || 0).toFixed(2)}</td>
                                                <td style={{ textAlign: "right" }}>{Number(r.tds || 0).toFixed(2)}</td>
                                                <td>{r.bank || ""}</td>
                                                <td style={{ textAlign: "right" }}>{Number(r.paid_by_patient || 0).toFixed(2)}</td>
                                                <td style={{ textAlign: "right" }}>{Number(r.disallowed_amount || 0).toFixed(2)}</td>
                                                <td style={{ textAlign: "right" }}>{dueAmt.toFixed(2)}</td>
                                                <td>{r.settlement_duration || ""}</td>
                                                <td>{r.status || "NOT BILLED"}</td>
                                                <td>{r.old_billno || ""}</td>
                                            </tr>
                                        );
                                    })}
                                    {/* Company Subtotal */}
                                    <tr className="company-total-row" style={{ fontWeight: "bold", borderTop: "1px dashed #000", borderBottom: "1px dashed #000" }}>
                                        <td colSpan="12" style={{ textAlign: "left" }}>Total Bills : {group.items.length}</td>
                                        <td style={{ textAlign: "right" }}>{compBillTotal.toFixed(2)}</td>
                                        <td colSpan="8"></td>
                                        <td style={{ textAlign: "right" }}>{compDueTotal.toFixed(2)}</td>
                                        <td colSpan="3"></td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}

                        {/* Grand Total */}
                        {reportData.length > 0 && (
                            <tr className="grand-total-row" style={{ fontWeight: "bold", borderTop: "2px solid #000", borderBottom: "2px solid #000" }}>
                                <td colSpan="12" style={{ textAlign: "left" }}>Grand Total</td>
                                <td style={{ textAlign: "right" }}>{grandTotals.billAmt.toFixed(2)}</td>
                                <td colSpan="8"></td>
                                <td style={{ textAlign: "right" }}>{grandTotals.dueAmt.toFixed(2)}</td>
                                <td colSpan="3">(End.)</td>
                            </tr>
                        )}
                    </tbody>
                </PrintTable>
            </PrintTemplate>
        </PageWrapper>
    );
};

export default AdvanceRegistrationInsurence;
