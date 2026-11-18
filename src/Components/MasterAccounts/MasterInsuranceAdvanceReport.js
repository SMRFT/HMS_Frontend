import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker, Spin } from "antd";
import { FaPrint, FaSearch, FaFileExcel, FaSyncAlt } from "react-icons/fa";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { printAccountsReport } from "../Accounts/printAccountsReport";
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
    background: ${colors.surface || "#ffffff"};
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-left: 4px solid ${props => props.color || colors.secondary || "#0284c7"};
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 80px;
    animation: ${fadeIn} 0.4s ease-out;
`;

const FilterSection = styled.div`
    background: ${colors.surface || "#ffffff"};
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

const MasterInsuranceAdvanceReport = ({ isModalView = false, startDate, endDate, outlet: propOutlet, initialOutlet }) => {
    const effectiveOutlet = propOutlet || initialOutlet || "all";
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [selectedCompany, setSelectedCompany] = useState("all");
    const [outlet, setOutlet] = useState(effectiveOutlet);
    const [outletsList, setOutletsList] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        const o = propOutlet || initialOutlet;
        if (o !== undefined && o !== outlet) setOutlet(o);
    }, [propOutlet, initialOutlet]);

    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const res = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
                if (res?.success && Array.isArray(res?.data)) {
                    setOutletsList(res.data);
                }
            } catch (e) {}
        };
        fetchOutlets();
    }, [HmsBaseUrl]);

    const fetchReport = useCallback(async () => {
        if (!fromDate || !toDate) return;
        setLoading(true);
        try {
            const url = `${HmsBaseUrl}master-accounts/insurance-advance-registration/?from_date=${fromDate}&to_date=${toDate}${outlet && outlet !== "all" ? `&outlet_code=${outlet}` : ""}`;
            const response = await apiRequest(url, "GET");
            if (response && response.success) {
                const body = response.data || {};
                const rows = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : []);
                setReportData(rows);
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error("Error fetching master insurance report:", error);
            toast.error("Failed to fetch insurance advance report");
            setReportData([]);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, outlet, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Unique Companies for Filter
    const uniqueCompanies = useMemo(() => {
        const compMap = new Map();
        if (!Array.isArray(reportData)) return [];
        reportData.forEach(r => {
            const name = r.company_name || r.insurance_company || (r.has_insurance ? "INSURANCE CLAIM" : "GENERAL / PRIVATE");
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
        if (!Array.isArray(reportData)) return groups;
        const filtered = selectedCompany === "all"
            ? reportData
            : reportData.filter(r => (r.company_name || r.insurance_company || (r.has_insurance ? "INSURANCE CLAIM" : "GENERAL / PRIVATE")) === selectedCompany);

        filtered.forEach(item => {
            const compName = item.company_name || item.insurance_company || (item.has_insurance ? "INSURANCE CLAIM" : "GENERAL / PRIVATE");
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

    // Grand Totals Calculation
    const grandTotals = useMemo(() => {
        let totalCount = 0;
        let billAmt = 0;
        let advanceAmt = 0;
        let settledAmt = 0;
        let tdsAmt = 0;
        let paidByPatientAmt = 0;
        let disallowedAmt = 0;
        let dueAmt = 0;

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
                        "Patient Name": r.patient_name || "",
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
            XLSX.utils.book_append_sheet(wb, ws, "Insurance Advances");
            XLSX.writeFile(wb, `Insurance_Advance_Report_${fromDate}_to_${toDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    return (
        <PageWrapper style={isModalView ? { padding: 0 } : {}}>
            {!isModalView && (
                <SectionTitle>
                    <h3>Insurance Advance Registration Report</h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted || "#64748b" }}>
                        Corporate & TPA cashless advance deposits and claim ledgers
                    </p>
                </SectionTitle>
            )}

            {!isModalView && (
                <FilterSection className="no-print">
                    <FormRow>
                        <InputWrapper>
                            <Label>From Date</Label>
                            <DatePicker
                                value={fromDate ? dayjs(fromDate) : null}
                                onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : fromDate)}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>To Date</Label>
                            <DatePicker
                                value={toDate ? dayjs(toDate) : null}
                                onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : toDate)}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Insurance Company</Label>
                            <Select
                                value={selectedCompany}
                                onChange={(e) => setSelectedCompany(e.target.value)}
                            >
                                <option value="all">All Insurance Companies ({uniqueCompanies.length})</option>
                                {uniqueCompanies.map((c, i) => (
                                    <option key={i} value={c.name}>
                                        {c.name} {c.code ? `(${c.code})` : ""}
                                    </option>
                                ))}
                            </Select>
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Outlet</Label>
                            <Select
                                value={outlet}
                                onChange={(e) => setOutlet(e.target.value)}
                            >
                                <option value="all">All Outlets</option>
                                {outletsList.map((o, i) => (
                                    <option key={i} value={o.outlet_code}>
                                        {o.outlet_name || o.outlet_code}
                                    </option>
                                ))}
                            </Select>
                        </InputWrapper>
                        <InputWrapper style={{ alignSelf: "flex-end", flex: "none" }}>
                            <Button
                                onClick={handlePrint}
                                style={{
                                    height: "38px",
                                    padding: "0 16px",
                                    background: "#0284c7",
                                    color: "#fff",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontWeight: 600
                                }}
                            >
                                <FaPrint /> Print
                            </Button>
                        </InputWrapper>
                        <InputWrapper style={{ alignSelf: "flex-end", flex: "none" }}>
                            <Button
                                onClick={handleExportExcel}
                                style={{
                                    height: "38px",
                                    padding: "0 16px",
                                    background: "#16a34a",
                                    color: "#fff",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontWeight: 600
                                }}
                            >
                                <FaFileExcel /> Excel
                            </Button>
                        </InputWrapper>
                        <InputWrapper style={{ alignSelf: "flex-end", flex: "none" }}>
                            <Button
                                onClick={fetchReport}
                                style={{
                                    height: "38px",
                                    padding: "0 16px",
                                    background: "#f1f5f9",
                                    color: "#334155",
                                    border: "1px solid #cbd5e1",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontWeight: 600
                                }}
                            >
                                <FaSyncAlt /> Refresh
                            </Button>
                        </InputWrapper>
                    </FormRow>
                </FilterSection>
            )}

            {!isModalView && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }} className="no-print">
                    <SummaryCard color="#0ea5e9">
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>Total Billed</span>
                        <h3 style={{ margin: "4px 0 0 0", fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>₹{grandTotals.billAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{grandTotals.totalCount} Total Claims</span>
                    </SummaryCard>
                    <SummaryCard color="#f59e0b">
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>Advance Deposits</span>
                        <h3 style={{ margin: "4px 0 0 0", fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>₹{grandTotals.advanceAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Adjusted during stay</span>
                    </SummaryCard>
                    <SummaryCard color="#10b981">
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>Insurance Settled</span>
                        <h3 style={{ margin: "4px 0 0 0", fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>₹{grandTotals.settledAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Claim receipts cleared</span>
                    </SummaryCard>
                    <SummaryCard color="#ef4444">
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>Outstanding DUE</span>
                        <h3 style={{ margin: "4px 0 0 0", fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>₹{grandTotals.dueAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Receivable from TPAs</span>
                    </SummaryCard>
                </div>
            )}

            {loading ? (
                <div style={{ padding: "80px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-insurance-bills-area">
                    {/* WEB VIEW TABLE */}
                    <TableWrapper style={{ overflowX: "auto" }}>
                        <Table style={{ fontSize: "0.82rem" }}>
                            <thead>
                                <tr>
                                    <Th style={{ width: "40px" }}>SLNO</Th>
                                    <Th>Bill Date</Th>
                                    <Th>IP Number</Th>
                                    <Th>Bill ID</Th>
                                    <Th>Sh Bill No</Th>
                                    <Th>Patient Name</Th>
                                    <Th>Adm Date</Th>
                                    <Th>Dis Date</Th>
                                    <Th>Card Number</Th>
                                    <Th>Service No</Th>
                                    <Th>Claim Ref</Th>
                                    <Th>Place</Th>
                                    <Th style={{ textAlign: "right" }}>Bill Amt (₹)</Th>
                                    <Th style={{ textAlign: "right" }}>Advance (₹)</Th>
                                    <Th>Desp Date</Th>
                                    <Th>Set Date</Th>
                                    <Th style={{ textAlign: "right" }}>Settled (₹)</Th>
                                    <Th style={{ textAlign: "right" }}>TDS (₹)</Th>
                                    <Th>Bank</Th>
                                    <Th style={{ textAlign: "right" }}>Patient Paid (₹)</Th>
                                    <Th style={{ textAlign: "right" }}>Disallowed (₹)</Th>
                                    <Th style={{ textAlign: "right" }}>DUE (₹)</Th>
                                    <Th>Status</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(groupedData).length === 0 ? (
                                    <Tr><Td colSpan={23} style={{ textAlign: "center", padding: "30px" }}>No Insurance Records Found</Td></Tr>
                                ) : (
                                    Object.entries(groupedData).map(([compName, grp]) => {
                                        const subBill = grp.items.reduce((s, x) => s + Number(x.bill_amount || x.total_amount || 0), 0);
                                        const subAdv = grp.items.reduce((s, x) => s + Number(x.advance || x.advance_amount || 0), 0);
                                        const subSet = grp.items.reduce((s, x) => s + Number(x.settled_amount || 0), 0);
                                        const subDue = grp.items.reduce((s, x) => s + Number(x.due || 0), 0);
                                        return (
                                            <React.Fragment key={compName}>
                                                <Tr style={{ background: "#f1f5f9", fontWeight: 700 }}>
                                                    <Td colSpan={23} style={{ padding: "8px 12px", color: "#1e293b", fontSize: "0.85rem" }}>
                                                        🏢 {compName} {grp.companyCode ? `(${grp.companyCode})` : ""} - {grp.items.length} Claims
                                                    </Td>
                                                </Tr>
                                                {grp.items.map((r, idx) => (
                                                    <Tr key={idx}>
                                                        <Td>{idx + 1}</Td>
                                                        <Td>{r.bill_date ? dayjs(r.bill_date).format("DD/MM/YYYY") : "-"}</Td>
                                                        <Td style={{ fontFamily: "monospace", fontWeight: 600 }}>{r.ip_number || "-"}</Td>
                                                        <Td style={{ fontFamily: "monospace" }}>{r.bill_id || r.bill_no || "-"}</Td>
                                                        <Td style={{ fontFamily: "monospace" }}>{r.sh_bill_no || r.bill_no || "-"}</Td>
                                                        <Td><strong>{r.patient_name}</strong></Td>
                                                        <Td>{r.admitting_date ? dayjs(r.admitting_date).format("DD/MM/YYYY") : "-"}</Td>
                                                        <Td>{r.discharge_date ? dayjs(r.discharge_date).format("DD/MM/YYYY") : "-"}</Td>
                                                        <Td>{r.card_number || "-"}</Td>
                                                        <Td>{r.service_no || "-"}</Td>
                                                        <Td style={{ fontFamily: "monospace" }}>{r.claim_reference || "-"}</Td>
                                                        <Td>{r.place || "-"}</Td>
                                                        <Td style={{ textAlign: "right", fontFamily: "monospace" }}>{(r.bill_amount || r.total_amount || 0).toFixed(2)}</Td>
                                                        <Td style={{ textAlign: "right", fontFamily: "monospace", color: "#d97706" }}>{(r.advance || r.advance_amount || 0).toFixed(2)}</Td>
                                                        <Td>{r.despatch_date ? dayjs(r.despatch_date).format("DD/MM/YYYY") : "-"}</Td>
                                                        <Td>{r.settlement_date ? dayjs(r.settlement_date).format("DD/MM/YYYY") : "-"}</Td>
                                                        <Td style={{ textAlign: "right", fontFamily: "monospace", color: "#16a34a" }}>{(r.settled_amount || 0).toFixed(2)}</Td>
                                                        <Td style={{ textAlign: "right", fontFamily: "monospace" }}>{(r.tds || 0).toFixed(2)}</Td>
                                                        <Td>{r.bank || "-"}</Td>
                                                        <Td style={{ textAlign: "right", fontFamily: "monospace" }}>{(r.paid_by_patient || 0).toFixed(2)}</Td>
                                                        <Td style={{ textAlign: "right", fontFamily: "monospace", color: "#dc2626" }}>{(r.disallowed_amount || 0).toFixed(2)}</Td>
                                                        <Td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#2563eb" }}>{(r.due || 0).toFixed(2)}</Td>
                                                        <Td>{r.status || "Billed"}</Td>
                                                    </Tr>
                                                ))}
                                                <Tr style={{ background: "#f8fafc", fontWeight: 700, borderTop: "1px solid #cbd5e1", borderBottom: "2px solid #94a3b8" }}>
                                                    <Td colSpan={12} style={{ textAlign: "right" }}>{compName} Subtotal:</Td>
                                                    <Td style={{ textAlign: "right", fontFamily: "monospace" }}>{subBill.toFixed(2)}</Td>
                                                    <Td style={{ textAlign: "right", fontFamily: "monospace", color: "#d97706" }}>{subAdv.toFixed(2)}</Td>
                                                    <Td colSpan={2}></Td>
                                                    <Td style={{ textAlign: "right", fontFamily: "monospace", color: "#16a34a" }}>{subSet.toFixed(2)}</Td>
                                                    <Td colSpan={4}></Td>
                                                    <Td style={{ textAlign: "right", fontFamily: "monospace", color: "#2563eb" }}>{subDue.toFixed(2)}</Td>
                                                    <Td></Td>
                                                </Tr>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                                {Object.keys(groupedData).length > 0 && (
                                    <Tr style={{ background: "#e2e8f0", fontWeight: 800, borderTop: "2px solid #000", borderBottom: "3px double #000" }}>
                                        <Td colSpan={12} style={{ textAlign: "right" }}>GRAND TOTAL ({grandTotals.totalCount} CLAIMS):</Td>
                                        <Td style={{ textAlign: "right", fontFamily: "monospace" }}>{grandTotals.billAmt.toFixed(2)}</Td>
                                        <Td style={{ textAlign: "right", fontFamily: "monospace", color: "#d97706" }}>{grandTotals.advanceAmt.toFixed(2)}</Td>
                                        <Td colSpan={2}></Td>
                                        <Td style={{ textAlign: "right", fontFamily: "monospace", color: "#16a34a" }}>{grandTotals.settledAmt.toFixed(2)}</Td>
                                        <Td colSpan={4}></Td>
                                        <Td style={{ textAlign: "right", fontFamily: "monospace", color: "#2563eb" }}>{grandTotals.dueAmt.toFixed(2)}</Td>
                                        <Td></Td>
                                    </Tr>
                                )}
                            </tbody>
                        </Table>
                    </TableWrapper>

                    {/* PRINT TEMPLATE (Laser / Dot-matrix exact format) */}
                    <PrintTemplate>
                        <PrintHeader>
                            <h1>SHANMUGA HOSPITAL LIMITED</h1>
                            <p>53, TRICHY MAIN ROAD, SEELANAIKENPATTY, SALEM - 636 201</p>
                            <p className="report-title">Insurance Advance Registration Report From {dayjs(fromDate).format("DD/MM/YYYY")} To {dayjs(toDate).format("DD/MM/YYYY")}</p>
                        </PrintHeader>
                        <PrintMetaTable>
                            <tbody>
                                <tr>
                                    <td>Printed By: Accounts</td>
                                    <td style={{ textAlign: "right" }}>Date: {dayjs().format("DD/MM/YYYY HH:mm:ss")}</td>
                                </tr>
                            </tbody>
                        </PrintMetaTable>
                        <PrintTable>
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Bill Dt</th>
                                    <th>IP No</th>
                                    <th>Patient Name</th>
                                    <th>Adm Dt</th>
                                    <th>Dis Dt</th>
                                    <th>Card / Policy</th>
                                    <th>Claim Ref</th>
                                    <th style={{ textAlign: "right" }}>Bill Amt</th>
                                    <th style={{ textAlign: "right" }}>Advance</th>
                                    <th style={{ textAlign: "right" }}>Settled</th>
                                    <th style={{ textAlign: "right" }}>DUE</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(groupedData).map(([compName, grp]) => {
                                    const subBill = grp.items.reduce((s, x) => s + Number(x.bill_amount || x.total_amount || 0), 0);
                                    const subAdv = grp.items.reduce((s, x) => s + Number(x.advance || x.advance_amount || 0), 0);
                                    const subSet = grp.items.reduce((s, x) => s + Number(x.settled_amount || 0), 0);
                                    const subDue = grp.items.reduce((s, x) => s + Number(x.due || 0), 0);
                                    return (
                                        <React.Fragment key={compName}>
                                            <tr className="company-header-row">
                                                <td colSpan={13}><strong>Company: {compName} {grp.companyCode ? `(${grp.companyCode})` : ""}</strong></td>
                                            </tr>
                                            {grp.items.map((r, i) => (
                                                <tr key={i} className="company-sub-row">
                                                    <td>{i + 1}</td>
                                                    <td>{r.bill_date ? dayjs(r.bill_date).format("DD/MM/YY") : "-"}</td>
                                                    <td>{r.ip_number}</td>
                                                    <td>{r.patient_name}</td>
                                                    <td>{r.admitting_date ? dayjs(r.admitting_date).format("DD/MM/YY") : "-"}</td>
                                                    <td>{r.discharge_date ? dayjs(r.discharge_date).format("DD/MM/YY") : "-"}</td>
                                                    <td>{r.card_number || "-"}</td>
                                                    <td>{r.claim_reference || "-"}</td>
                                                    <td style={{ textAlign: "right" }}>{(r.bill_amount || r.total_amount || 0).toFixed(2)}</td>
                                                    <td style={{ textAlign: "right" }}>{(r.advance || r.advance_amount || 0).toFixed(2)}</td>
                                                    <td style={{ textAlign: "right" }}>{(r.settled_amount || 0).toFixed(2)}</td>
                                                    <td style={{ textAlign: "right" }}>{(r.due || 0).toFixed(2)}</td>
                                                    <td>{r.status || "Billed"}</td>
                                                </tr>
                                            ))}
                                            <tr className="company-total-row">
                                                <td colSpan={8} style={{ textAlign: "right" }}><strong>{compName} Total:</strong></td>
                                                <td style={{ textAlign: "right" }}><strong>{subBill.toFixed(2)}</strong></td>
                                                <td style={{ textAlign: "right" }}><strong>{subAdv.toFixed(2)}</strong></td>
                                                <td style={{ textAlign: "right" }}><strong>{subSet.toFixed(2)}</strong></td>
                                                <td style={{ textAlign: "right" }}><strong>{subDue.toFixed(2)}</strong></td>
                                                <td></td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                })}
                                <tr className="grand-total-row">
                                    <td colSpan={8} style={{ textAlign: "right" }}><strong>GRAND TOTAL ({grandTotals.totalCount} CLAIMS):</strong></td>
                                    <td style={{ textAlign: "right" }}><strong>{grandTotals.billAmt.toFixed(2)}</strong></td>
                                    <td style={{ textAlign: "right" }}><strong>{grandTotals.advanceAmt.toFixed(2)}</strong></td>
                                    <td style={{ textAlign: "right" }}><strong>{grandTotals.settledAmt.toFixed(2)}</strong></td>
                                    <td style={{ textAlign: "right" }}><strong>{grandTotals.dueAmt.toFixed(2)}</strong></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </PrintTable>
                    </PrintTemplate>
                </div>
            )}
        </PageWrapper>
    );
};

export default MasterInsuranceAdvanceReport;
