import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DatePicker, Select, Button, Spin, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw } from "lucide-react";
import styled from "styled-components";
import * as XLSX from "xlsx";
import apiRequest from "../../Auth/apiRequest";
import {
    formatINR,
    printReportArea,
    extractReportData,
    fetchCachedOutlets,
    cachedApiRequest,
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

const SectionHeaderTr = styled.tr`
    background: #e2e8f0 !important;
    td {
        font-weight: 800 !important;
        font-size: 0.84rem !important;
        color: #0f172a !important;
        padding: 8px 12px !important;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: #e2e8f0 !important;
        border-top: 1px solid #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
    }
`;

const SubtotalTr = styled.tr`
    background: #f8fafc !important;
    td {
        font-weight: 700 !important;
        font-size: 0.82rem !important;
        color: #0f172a !important;
        padding: 6px 12px !important;
        border-top: 1px solid #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
    }
`;

const GrandTotalTr = styled.tr`
    background: #f1f5f9 !important;
    border-top: 2px solid #000000 !important;
    border-bottom: 3px double #000000 !important;
    td {
        font-weight: 800 !important;
        font-size: 0.92rem !important;
        color: #000000 !important;
        padding: 8px 12px !important;
        background: #f1f5f9 !important;
        border-top: 2px solid #000000 !important;
        border-bottom: 3px double #000000 !important;
    }
`;

const MasterInsuranceAdvanceReport = ({
    isModalView = false,
    startDate,
    endDate,
    initialStartDate,
    initialEndDate,
    outlet: propOutlet,
    initialOutlet = "all",
    company,
    initialCompany,
    billType,
    initialBillType,
    category
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const start = startDate || initialStartDate;
    const end = endDate || initialEndDate;
    const [dateRange, setDateRange] = useState([
        start ? dayjs(start) : dayjs(),
        end ? dayjs(end) : dayjs()
    ]);

    const initialComp = company || initialCompany || billType || initialBillType || category || "all";
    const [selectedCompany, setSelectedCompany] = useState(initialComp);

    const effectiveOutlet = propOutlet || initialOutlet || "all";
    const [outlet, setOutlet] = useState(effectiveOutlet);
    const [outletsList, setOutletsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (start && end) {
            setDateRange([dayjs(start), dayjs(end)]);
        }
    }, [start, end]);

    useEffect(() => {
        const o = propOutlet || initialOutlet;
        if (o !== undefined && o !== outlet) {
            setOutlet(o);
        }
    }, [propOutlet, initialOutlet, outlet]);

    useEffect(() => {
        const c = company || initialCompany || billType || initialBillType || category;
        if (c !== undefined && c !== selectedCompany) {
            setSelectedCompany(c);
        }
    }, [company, initialCompany, billType, initialBillType, category, selectedCompany]);

    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const data = await fetchCachedOutlets(HmsBaseUrl);
                if (Array.isArray(data)) {
                    setOutletsList(data);
                }
            } catch (e) {}
        };
        fetchOutlets();
    }, [HmsBaseUrl]);

    const fetchReport = useCallback(async (isRefresh = false) => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/insurance-advance-registration/?from_date=${fDate}&to_date=${tDate}&outlet_code=${outlet}&company=${encodeURIComponent(selectedCompany || "all")}`;
            const res = await cachedApiRequest(url, "GET", null, { forceRefresh: isRefresh });
            if (res?.success) {
                setReportData(extractReportData(res));
            } else {
                setReportData({ data: [], grouped_data: [], unique_companies: [], summary: {} });
            }
        } catch (err) {
            console.error("Insurance Advance Report Error:", err);
            setReportData({ data: [], grouped_data: [], unique_companies: [], summary: {} });
        } finally {
            setLoading(false);
        }
    }, [dateRange, outlet, selectedCompany, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Unique Companies list from response or fallback
    const companiesList = useMemo(() => {
        if (reportData?.unique_companies && Array.isArray(reportData.unique_companies) && reportData.unique_companies.length > 0) {
            return reportData.unique_companies;
        }
        const set = new Map();
        (reportData?.data || []).forEach(r => {
            const name = r.company_name || "INSURANCE CLAIM";
            const code = r.company_code || "";
            if (!set.has(name)) {
                set.set(name, { name, code });
            }
        });
        return Array.from(set.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [reportData]);

    // Build hierarchical grouped data filtered by search and selected company
    const filteredGroupedData = useMemo(() => {
        const q = searchTerm.toLowerCase().trim();
        const compFilter = (selectedCompany || "all").toLowerCase().trim();
        const rawGroups = reportData?.grouped_data || [];

        // If backend provided grouped_data
        if (rawGroups.length > 0) {
            let runningSlno = 1;
            return rawGroups.map(grp => {
                const compNameLower = String(grp.company_name || "").toLowerCase().trim();
                const compCodeLower = String(grp.company_code || "").toLowerCase().trim();

                if (compFilter !== "all" && compFilter !== "") {
                    const matchesComp = compNameLower === compFilter ||
                        compCodeLower === compFilter ||
                        compNameLower.includes(compFilter) ||
                        compFilter.includes(compNameLower);
                    if (!matchesComp) return null;
                }

                const matchingItems = (grp.items || []).filter(item => {
                    if (!q) return true;
                    return (
                        (item.patient_name && String(item.patient_name).toLowerCase().includes(q)) ||
                        (item.ip_number && String(item.ip_number).toLowerCase().includes(q)) ||
                        (item.bill_id && String(item.bill_id).toLowerCase().includes(q)) ||
                        (item.sh_bill_no && String(item.sh_bill_no).toLowerCase().includes(q)) ||
                        (item.bill_no && String(item.bill_no).toLowerCase().includes(q)) ||
                        (item.card_number && String(item.card_number).toLowerCase().includes(q)) ||
                        (item.claim_reference && String(item.claim_reference).toLowerCase().includes(q)) ||
                        (item.company_name && String(item.company_name).toLowerCase().includes(q))
                    );
                }).map(item => ({
                    ...item,
                    displaySlno: runningSlno++
                }));

                if (matchingItems.length === 0) return null;

                const totalBill = matchingItems.reduce((s, it) => s + (it.bill_amount || it.total_amount || 0), 0);
                const totalAdv = matchingItems.reduce((s, it) => s + (it.advance || it.advance_amount || 0), 0);
                const totalSettled = matchingItems.reduce((s, it) => s + (it.settled_amount || 0), 0);
                const totalPatientPaid = matchingItems.reduce((s, it) => s + (it.paid_by_patient || 0), 0);
                const totalDisallowed = matchingItems.reduce((s, it) => s + (it.disallowed_amount || 0), 0);
                const totalDue = matchingItems.reduce((s, it) => s + (it.due || 0), 0);

                return {
                    ...grp,
                    companyName: grp.company_name,
                    companyCode: grp.company_code,
                    items: matchingItems,
                    total_bill_amount: totalBill,
                    total_advance: totalAdv,
                    total_settled: totalSettled,
                    total_patient_paid: totalPatientPaid,
                    total_disallowed: totalDisallowed,
                    total_due: totalDue,
                    count: matchingItems.length
                };
            }).filter(Boolean);
        }

        // Fallback: group flat records by company_name
        const flatRecords = reportData?.data || [];
        const groupMap = {};
        let runningSlno = 1;

        flatRecords.forEach(item => {
            const compName = item.company_name || "INSURANCE CLAIM";
            const compCode = item.company_code || "";
            const compNameLower = compName.toLowerCase().trim();
            const compCodeLower = compCode.toLowerCase().trim();

            if (compFilter !== "all" && compFilter !== "") {
                const matchesComp = compNameLower === compFilter ||
                    compCodeLower === compFilter ||
                    compNameLower.includes(compFilter) ||
                    compFilter.includes(compNameLower);
                if (!matchesComp) return;
            }

            if (q) {
                const matchesSearch = (
                    (item.patient_name && String(item.patient_name).toLowerCase().includes(q)) ||
                    (item.ip_number && String(item.ip_number).toLowerCase().includes(q)) ||
                    (item.bill_id && String(item.bill_id).toLowerCase().includes(q)) ||
                    (item.sh_bill_no && String(item.sh_bill_no).toLowerCase().includes(q)) ||
                    (item.bill_no && String(item.bill_no).toLowerCase().includes(q)) ||
                    (item.card_number && String(item.card_number).toLowerCase().includes(q)) ||
                    (item.claim_reference && String(item.claim_reference).toLowerCase().includes(q)) ||
                    (item.company_name && String(item.company_name).toLowerCase().includes(q))
                );
                if (!matchesSearch) return;
            }

            if (!groupMap[compName]) {
                groupMap[compName] = {
                    companyName: compName,
                    companyCode: compCode,
                    items: [],
                    total_bill_amount: 0,
                    total_advance: 0,
                    total_settled: 0,
                    total_patient_paid: 0,
                    total_disallowed: 0,
                    total_due: 0
                };
            }

            const bill = Number(item.bill_amount || item.total_amount || 0);
            const adv = Number(item.advance || item.advance_amount || 0);
            const set = Number(item.settled_amount || 0);
            const pat = Number(item.paid_by_patient || 0);
            const dis = Number(item.disallowed_amount || 0);
            const due = Number(item.due || 0);

            groupMap[compName].total_bill_amount += bill;
            groupMap[compName].total_advance += adv;
            groupMap[compName].total_settled += set;
            groupMap[compName].total_patient_paid += pat;
            groupMap[compName].total_disallowed += dis;
            groupMap[compName].total_due += due;
            groupMap[compName].items.push({
                ...item,
                displaySlno: runningSlno++
            });
        });

        return Object.values(groupMap).sort((a, b) => a.companyName.localeCompare(b.companyName));
    }, [reportData, selectedCompany, searchTerm]);

    // Grand totals calculation across all visible groups
    const grandTotals = useMemo(() => {
        let totalCount = 0;
        let billAmt = 0;
        let advanceAmt = 0;
        let settledAmt = 0;
        let paidByPatientAmt = 0;
        let disallowedAmt = 0;
        let dueAmt = 0;

        filteredGroupedData.forEach(group => {
            totalCount += group.items.length;
            billAmt += group.total_bill_amount;
            advanceAmt += group.total_advance;
            settledAmt += group.total_settled;
            paidByPatientAmt += group.total_patient_paid;
            disallowedAmt += group.total_disallowed;
            dueAmt += group.total_due;
        });

        return {
            totalCount,
            billAmt,
            advanceAmt,
            settledAmt,
            paidByPatientAmt,
            disallowedAmt,
            dueAmt
        };
    }, [filteredGroupedData]);

    const handlePrint = () => {
        printReportArea("printable-insurance-bills-area", "landscape");
    };

    const handleExportExcel = () => {
        if (!filteredGroupedData || filteredGroupedData.length === 0) {
            return;
        }

        const excelRows = [];

        filteredGroupedData.forEach(group => {
            const compHeader = `Company Name : ${group.companyName} ${group.companyCode ? `(${group.companyCode})` : ""}`;
            
            excelRows.push({
                "Company Name": compHeader,
                "SLNO": "",
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
                "Bill Amount": "",
                "Advance": "",
                "Despatch Date": "",
                "Settlement Date": "",
                "Settled Amount": "",
                "TDS": "",
                "Bank": "",
                "Paid By Patient": "",
                "Disallowed Amount": "",
                "DUE": "",
                "Status": ""
            });

            group.items.forEach((r, idx) => {
                excelRows.push({
                    "Company Name": group.companyName,
                    "SLNO": idx + 1,
                    "Bill date": r.bill_date ? dayjs(r.bill_date).format("DD/MM/YYYY") : "",
                    "IP Number": r.ip_number || "",
                    "Bill ID": r.bill_id || r.bill_no || "",
                    "Sh Bill Number": r.sh_bill_no || r.bill_no || "",
                    "Patient Name": r.patient_name || "",
                    "Admitting Date": r.admitting_date ? dayjs(r.admitting_date).format("DD/MM/YYYY") : "",
                    "Discharge Date": r.discharge_date ? dayjs(r.discharge_date).format("DD/MM/YYYY") : "",
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
                    "Status": r.status || "Billed"
                });
            });

            // Company Subtotal Row
            excelRows.push({
                "Company Name": `${group.companyName} Total`,
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
                "Bill Amount": Number(group.total_bill_amount.toFixed(2)),
                "Advance": Number(group.total_advance.toFixed(2)),
                "Despatch Date": "",
                "Settlement Date": "",
                "Settled Amount": Number(group.total_settled.toFixed(2)),
                "TDS": "",
                "Bank": "",
                "Paid By Patient": Number(group.total_patient_paid.toFixed(2)),
                "Disallowed Amount": Number(group.total_disallowed.toFixed(2)),
                "DUE": Number(group.total_due.toFixed(2)),
                "Status": ""
            });
        });

        // Grand Total Row
        excelRows.push({
            "Company Name": "Grand Total",
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
            "TDS": "",
            "Bank": "",
            "Paid By Patient": Number(grandTotals.paidByPatientAmt.toFixed(2)),
            "Disallowed Amount": Number(grandTotals.disallowedAmt.toFixed(2)),
            "DUE": Number(grandTotals.dueAmt.toFixed(2)),
            "Status": "(End.)"
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelRows);
        ws["!cols"] = Object.keys(excelRows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
        XLSX.utils.book_append_sheet(wb, ws, "Insurance Advances");
        XLSX.writeFile(wb, `Insurance_Advance_Report_${dateRange[0].format("YYYY-MM-DD")}_to_${dateRange[1].format("YYYY-MM-DD")}.xlsx`);
    };

    const formatDate = (dt) => {
        if (!dt) return "-";
        return dayjs(dt).format("DD/MM/YYYY");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                Insurance Advance Registration Report
                                <span className="badge">Company Wise</span>
                            </h1>
                            <p>
                                Corporate and TPA cashless advances, claim approvals, running deposits, and settlement status grouped company-wise
                            </p>
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
                            <label>Outlet:</label>
                            <Select value={outlet} onChange={setOutlet} style={{ width: 170 }}>
                                <Option value="all">All Outlets</Option>
                                {outletsList.map((o) => (
                                    <Option key={o.outlet_code} value={o.outlet_code}>
                                        {o.outlet_name || o.outlet_code}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <label>Insurance Company:</label>
                            <Select
                                value={selectedCompany}
                                onChange={setSelectedCompany}
                                style={{ width: 260 }}
                                showSearch
                                optionFilterProp="children"
                            >
                                <Option value="all">All Insurance Companies ({companiesList.length})</Option>
                                {companiesList.map((c, i) => (
                                    <Option key={i} value={c.name}>
                                        {c.name} {c.code ? `(${c.code})` : ""}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <div className="search-input-wrapper">
                                <Search size={14} />
                                <Input
                                    placeholder="Quick search patient, IP, claim..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    allowClear
                                    style={{ width: 220 }}
                                />
                            </div>
                        </div>
                        <Button icon={<RefreshCw size={14} />} onClick={() => fetchReport(true)} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                </ControlCard>
            )}

            {!isModalView && (
                <KPIGrid className="no-print">
                    <KPICard color="#0ea5e9">
                        <span className="label">Total Billed</span>
                        <div className="value">₹{formatINR(grandTotals.billAmt)}</div>
                        <span className="sub">{grandTotals.totalCount} Total Claims</span>
                    </KPICard>
                    <KPICard color="#f59e0b">
                        <span className="label">Advance Deposits</span>
                        <div className="value" style={{ color: "#d97706" }}>₹{formatINR(grandTotals.advanceAmt)}</div>
                        <span className="sub">Adjusted during stay</span>
                    </KPICard>
                    <KPICard color="#10b981">
                        <span className="label">Insurance Settled</span>
                        <div className="value" style={{ color: "#16a34a" }}>₹{formatINR(grandTotals.settledAmt)}</div>
                        <span className="sub">Claim receipts cleared</span>
                    </KPICard>
                    <KPICard color="#ef4444">
                        <span className="label">Outstanding DUE</span>
                        <div className="value" style={{ color: "#dc2626" }}>₹{formatINR(grandTotals.dueAmt)}</div>
                        <span className="sub">Receivable from TPAs</span>
                    </KPICard>
                </KPIGrid>
            )}

            {loading ? (
                <div style={{ padding: "80px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <DataTableWrapper id="printable-insurance-bills-area">
                    <ReportPrintHeader
                        title="Insurance Advance Registration Report"
                        subtitle={`Company-Wise Cashless Advances & Settlement From ${dateRange[0].format("DD/MM/YYYY")} To ${dateRange[1].format("DD/MM/YYYY")}`}
                    />

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.80rem" }}>
                            <thead>
                                <tr>
                                    <th style={{ width: "40px" }}>SLNO</th>
                                    <th>Bill Date</th>
                                    <th>IP Number</th>
                                    <th>Bill ID</th>
                                    <th>Sh Bill No</th>
                                    <th>Patient Name</th>
                                    <th>Adm Date</th>
                                    <th>Dis Date</th>
                                    <th>Card Number</th>
                                    <th>Service No</th>
                                    <th>Claim Ref</th>
                                    <th>Place</th>
                                    <th style={{ textAlign: "right" }}>Bill Amt (₹)</th>
                                    <th style={{ textAlign: "right" }}>Advance (₹)</th>
                                    <th>Desp Date</th>
                                    <th>Set Date</th>
                                    <th style={{ textAlign: "right" }}>Settled (₹)</th>
                                    <th style={{ textAlign: "right" }}>TDS (₹)</th>
                                    <th>Bank</th>
                                    <th style={{ textAlign: "right" }}>Patient Paid (₹)</th>
                                    <th style={{ textAlign: "right" }}>Disallowed (₹)</th>
                                    <th style={{ textAlign: "right" }}>DUE (₹)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGroupedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={23} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                                            No Insurance Records Found for the Selected Filters
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGroupedData.map((group, grpIdx) => (
                                        <React.Fragment key={group.companyName || grpIdx}>
                                            <SectionHeaderTr>
                                                <td colSpan={23} style={{ padding: "8px 12px" }}>
                                                    Company Name : {group.companyName} {group.companyCode ? `(${group.companyCode})` : ""}
                                                </td>
                                            </SectionHeaderTr>
                                            {group.items.map((r, idx) => (
                                                <tr key={`${r.bill_id || r.bill_no || 'claim'}-${grpIdx}-${idx}`}>
                                                    <td>{idx + 1}</td>
                                                    <td>{formatDate(r.bill_date)}</td>
                                                    <td style={{ fontFamily: "monospace", fontWeight: 600 }}>{r.ip_number || "-"}</td>
                                                    <td style={{ fontFamily: "monospace" }}>{r.bill_id || r.bill_no || "-"}</td>
                                                    <td style={{ fontFamily: "monospace" }}>{r.sh_bill_no || r.bill_no || "-"}</td>
                                                    <td><strong>{r.patient_name}</strong></td>
                                                    <td>{formatDate(r.admitting_date)}</td>
                                                    <td>{formatDate(r.discharge_date)}</td>
                                                    <td>{r.card_number || "-"}</td>
                                                    <td>{r.service_no || "-"}</td>
                                                    <td style={{ fontFamily: "monospace" }}>{r.claim_reference || "-"}</td>
                                                    <td>{r.place || "-"}</td>
                                                    <td style={{ textAlign: "right", fontFamily: "monospace" }}>{formatINR(r.bill_amount)}</td>
                                                    <td style={{ textAlign: "right", fontFamily: "monospace", color: "#d97706" }}>{formatINR(r.advance)}</td>
                                                    <td>{formatDate(r.despatch_date)}</td>
                                                    <td>{formatDate(r.settlement_date)}</td>
                                                    <td style={{ textAlign: "right", fontFamily: "monospace", color: "#16a34a" }}>{formatINR(r.settled_amount)}</td>
                                                    <td style={{ textAlign: "right", fontFamily: "monospace" }}>{formatINR(r.tds)}</td>
                                                    <td>{r.bank || "-"}</td>
                                                    <td style={{ textAlign: "right", fontFamily: "monospace" }}>{formatINR(r.paid_by_patient)}</td>
                                                    <td style={{ textAlign: "right", fontFamily: "monospace", color: "#dc2626" }}>{formatINR(r.disallowed_amount)}</td>
                                                    <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#2563eb" }}>{formatINR(r.due)}</td>
                                                    <td>{r.status || "Billed"}</td>
                                                </tr>
                                            ))}
                                            <SubtotalTr>
                                                <td colSpan={12} style={{ textAlign: "left", paddingLeft: "16px", fontWeight: "bold" }}>
                                                    Total Bills : {group.items.length}
                                                </td>
                                                <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: "bold" }}>
                                                    {formatINR(group.total_bill_amount)}
                                                </td>
                                                <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: "bold", color: "#d97706" }}>
                                                    {formatINR(group.total_advance)}
                                                </td>
                                                <td colSpan={2}></td>
                                                <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: "bold", color: "#16a34a" }}>
                                                    {formatINR(group.total_settled)}
                                                </td>
                                                <td colSpan={4}></td>
                                                <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: "bold", color: "#2563eb" }}>
                                                    {formatINR(group.total_due)}
                                                </td>
                                                <td></td>
                                            </SubtotalTr>
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                            {filteredGroupedData.length > 0 && (
                                <tfoot>
                                    <GrandTotalTr>
                                        <td colSpan={12} style={{ textAlign: "left", paddingLeft: "16px", fontWeight: "800" }}>
                                            Grand Total (Bills: {grandTotals.totalCount} across {filteredGroupedData.length} Companies)
                                        </td>
                                        <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: "800" }}>
                                            {formatINR(grandTotals.billAmt)}
                                        </td>
                                        <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: "800", color: "#d97706" }}>
                                            {formatINR(grandTotals.advanceAmt)}
                                        </td>
                                        <td colSpan={2}></td>
                                        <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: "800", color: "#16a34a" }}>
                                            {formatINR(grandTotals.settledAmt)}
                                        </td>
                                        <td colSpan={4}></td>
                                        <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: "800", color: "#2563eb" }}>
                                            {formatINR(grandTotals.dueAmt)}
                                        </td>
                                        <td>(End.)</td>
                                    </GrandTotalTr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    <ReportPrintFooter />
                </DataTableWrapper>
            )}
        </ReportPageWrapper>
    );
};

export default MasterInsuranceAdvanceReport;
