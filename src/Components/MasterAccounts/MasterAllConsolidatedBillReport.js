import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DatePicker, Select, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import styled from "styled-components";
import { Printer, Download, Search, RefreshCw } from "lucide-react";
import {
    formatINR,
    cleanNum,
    exportToExcel,
    printReportArea,
    extractReportData,
    getSafeArray,
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

const STATUS_ORDER = ["Paid", "Cash Pending", "Credit Pending", "Cancel", "Return", "Refund"];

const STATUS_META = {
    Paid: { color: "green", border: "#059669", subtitle: "Settled / collected bills", rowBg: "inherit" },
    "Cash Pending": { color: "orange", border: "#d97706", subtitle: "Unpaid non-credit bills", rowBg: "#fffbeb" },
    "Credit Pending": { color: "blue", border: "#2563eb", subtitle: "Credit / TPA / scheme pending", rowBg: "#eff6ff" },
    Cancel: { color: "red", border: "#dc2626", subtitle: "Cancelled bills", rowBg: "#fef2f2" },
    Return: { color: "volcano", border: "#ea580c", subtitle: "Sales returns", rowBg: "#fff7ed" },
    Refund: { color: "purple", border: "#7c3aed", subtitle: "Patient refunds", rowBg: "#f5f3ff" },
};

const CompactTableWrapper = styled(DataTableWrapper)`
    width: 100%;
    overflow-x: auto;
    table {
        table-layout: fixed;
        width: 100%;
        font-size: 0.84rem;
        border-collapse: collapse;
        border: 1.5px solid #334155 !important;
    }
    thead th {
        padding: 5px 6px !important;
        font-size: 0.80rem !important;
        white-space: normal !important;
        line-height: 1.2 !important;
        text-align: left;
        border: 1px solid #94a3b8 !important;
        background: #f1f5f9 !important;
        color: #0f172a !important;
        font-weight: 700 !important;
    }
    tbody td {
        padding: 3.5px 6px !important;
        font-size: 0.82rem !important;
        line-height: 1.25 !important;
        border: 1px solid #cbd5e1 !important;
        color: #0f172a;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .text-center {
        text-align: center !important;
    }
    .text-right {
        text-align: right !important;
    }
`;

const DateHeaderTr = styled.tr`
    background: #f1f5f9 !important;
    td {
        font-weight: 700 !important;
        font-size: 0.86rem !important;
        color: #0f172a !important;
        padding: 4px 8px !important;
        background: #f1f5f9 !important;
        border: 1px solid #94a3b8 !important;
    }
`;

const SectionHeaderTr = styled.tr`
    background: #e2e8f0 !important;
    td {
        font-weight: 800 !important;
        font-size: 0.82rem !important;
        color: #0f172a !important;
        padding: 4px 8px !important;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: #e2e8f0 !important;
        border: 1px solid #94a3b8 !important;
    }
`;

const SubtotalTr = styled.tr`
    background: #f8fafc !important;
    td {
        font-weight: 700 !important;
        font-size: 0.83rem !important;
        color: #0f172a !important;
        padding: 4px 6px !important;
        border: 1px solid #cbd5e1 !important;
        background: #f8fafc !important;
    }
`;

const GrandTotalTr = styled.tr`
    background: #f1f5f9 !important;
    border-top: 2px solid #000000 !important;
    border-bottom: 3px double #000000 !important;
    td {
        font-weight: 800 !important;
        font-size: 0.88rem !important;
        color: #000000 !important;
        padding: 6px 8px !important;
        background: #f1f5f9 !important;
        border: 1px solid #64748b !important;
        border-top: 2px solid #000000 !important;
        border-bottom: 3px double #000000 !important;
    }
`;

const extractDateKey = (dateVal) => {
    if (!dateVal) return "Undated";
    const str = String(dateVal).trim();
    const ddmmyyyy = str.match(/^(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (ddmmyyyy) return ddmmyyyy[1];
    const yyyymmdd = str.match(/^(\d{4}-\d{2}-\d{2})/);
    if (yyyymmdd) {
        const parts = yyyymmdd[1].split("-");
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (str.includes(" ")) return str.split(" ")[0];
    return str;
};

const extractTime = (dateVal) => {
    if (!dateVal) return "";
    const str = String(dateVal).trim();
    if (str.includes(" ")) {
        return str.substring(str.indexOf(" ") + 1).trim();
    }
    return "";
};

const MasterAllConsolidatedBillReport = ({
    isModalView = false,
    startDate,
    endDate,
    outlet: propOutlet,
    initialOutlet = "all",
    status: propStatus,
    category: propCategory,
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const effectiveOutlet = propOutlet || initialOutlet || "all";

    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs(),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(effectiveOutlet);
    const [outletsList, setOutletsList] = useState([]);
    const [billStatus, setBillStatus] = useState(
        propStatus && String(propStatus).toLowerCase() !== "all" ? propStatus : "all"
    );
    const [moduleFilter, setModuleFilter] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState(
        propCategory && String(propCategory).toLowerCase() !== "all" ? propCategory : "all"
    );
    const [paymentModeFilter, setPaymentModeFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    /* Synchronize dates */
    useEffect(() => {
        if (startDate && endDate) {
            setDateRange([dayjs(startDate), dayjs(endDate)]);
        }
    }, [startDate, endDate]);

    /* Synchronize outlet */
    useEffect(() => {
        const o = propOutlet || initialOutlet;
        if (o !== undefined && o !== outlet) {
            setOutlet(o);
        }
    }, [propOutlet, initialOutlet]);

    /* Load outlets */
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

    /* Fetch report */
    const fetchReport = useCallback(async (isRefresh = false) => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const outletParam = outlet && outlet !== "all" ? `&outlet_code=${encodeURIComponent(outlet)}` : "";
            const url = `${HmsBaseUrl}master-accounts/all-consolidated-bill-report/?from_date=${fDate}&to_date=${tDate}${outletParam}${isRefresh ? "&refresh=true" : ""}`;
            const res = await cachedApiRequest(url, "GET", null, { forceRefresh: isRefresh });
            if (res?.success) {
                setReportData(extractReportData(res));
            } else {
                setReportData(null);
            }
        } catch (err) {
            console.error("All Consolidated Bill Report Error:", err);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    }, [dateRange, outlet, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const allRows = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};
    const byStatus = summary.by_status || {};

    const categoryList = useMemo(() => {
        const set = new Set();
        allRows.forEach(r => {
            if (r.category) set.add(String(r.category).trim());
        });
        return Array.from(set).sort();
    }, [allRows]);

    const paymentModeList = useMemo(() => {
        const set = new Set();
        allRows.forEach(r => {
            if (r.payment_mode) set.add(String(r.payment_mode).trim());
        });
        return Array.from(set).sort();
    }, [allRows]);

    /* Filter by status, module, category, payment mode, and search */
    const filtered = useMemo(() => {
        let list = allRows;
        if (billStatus && billStatus !== "all") {
            list = list.filter(r => String(r.status || "").toLowerCase() === billStatus.toLowerCase());
        }
        if (moduleFilter && moduleFilter !== "all") {
            list = list.filter(r => String(r.module || "").toLowerCase() === moduleFilter.toLowerCase());
        }
        if (selectedCategory && selectedCategory !== "all") {
            list = list.filter(r => String(r.category || "").trim().toLowerCase() === selectedCategory.toLowerCase());
        }
        if (paymentModeFilter && paymentModeFilter !== "all") {
            list = list.filter(r => String(r.payment_mode || "").trim().toLowerCase() === paymentModeFilter.toLowerCase());
        }
        if (searchTerm.trim()) {
            const q = searchTerm.trim().toLowerCase();
            list = list.filter(r =>
                String(r.bill_no || "").toLowerCase().includes(q) ||
                String(r.patient_name || "").toLowerCase().includes(q) ||
                String(r.uhid || "").toLowerCase().includes(q) ||
                String(r.ip_number || "").toLowerCase().includes(q) ||
                String(r.module || "").toLowerCase().includes(q) ||
                String(r.category || "").toLowerCase().includes(q) ||
                String(r.payment_mode || "").toLowerCase().includes(q) ||
                String(r.status || "").toLowerCase().includes(q) ||
                String(r.remarks || "").toLowerCase().includes(q)
            );
        }
        return [...list].sort((a, b) => {
            const s1 = String(a.bill_no || "").trim();
            const s2 = String(b.bill_no || "").trim();
            return s1.localeCompare(s2, undefined, { numeric: true, sensitivity: "base" });
        });
    }, [allRows, billStatus, moduleFilter, selectedCategory, paymentModeFilter, searchTerm]);

    /* Filtered totals & end-of-report financial summary */
    const totals = useMemo(() => {
        let gross = 0;
        let discount = 0;
        let net = 0;
        let grossCash = 0;
        let bank = 0;
        let creditAmount = 0;
        let creditBillsAmount = 0;
        let salesReturnRefund = 0;
        let actualBilledAmount = 0;
        let cashPendingAmount = 0;
        let creditPendingAmount = 0;

        filtered.forEach(r => {
            const g = cleanNum(r.gross_amount);
            const d = cleanNum(r.discount_amount);
            const n = cleanNum(r.net_amount);
            const st = r.status || "";
            const pm = String(r.payment_mode || "").toLowerCase();

            gross += g;
            discount += d;
            net += n;

            if (st === "Paid") {
                actualBilledAmount += n;
                if (pm.includes("card") || pm.includes("upi") || pm.includes("bank") || pm.includes("online") || pm.includes("neft") || pm.includes("cheque")) {
                    bank += n;
                } else if (pm.includes("credit")) {
                    creditAmount += n;
                    creditBillsAmount += g;
                } else {
                    grossCash += n;
                }
            } else if (st === "Credit Pending") {
                actualBilledAmount += n;
                creditAmount += n;
                creditBillsAmount += g;
                creditPendingAmount += n;
            } else if (st === "Cash Pending") {
                actualBilledAmount += n;
                cashPendingAmount += n;
            } else if (st === "Return" || st === "Refund") {
                salesReturnRefund += n;
            }
        });

        const netCash = grossCash - salesReturnRefund;
        return {
            gross,
            discount,
            net,
            grossCash,
            bank,
            creditAmount,
            creditBillsAmount,
            salesReturnRefund,
            netCash,
            actualBilledAmount,
            cashPendingAmount,
            creditPendingAmount,
        };
    }, [filtered]);

    const hasClientFilter = billStatus !== "all" || moduleFilter !== "all" || selectedCategory !== "all" || paymentModeFilter !== "all" || Boolean(searchTerm.trim());
    const apiFin = summary.financial_summary || {};
    const displaySummary = (!hasClientFilter && apiFin.net_cash !== undefined) ? {
        grossCash: cleanNum(apiFin.gross_cash),
        salesReturnRefund: cleanNum(apiFin.sales_return_refund),
        expensesPaid: cleanNum(apiFin.expenses_paid),
        netCash: cleanNum(apiFin.net_cash),
        bank: cleanNum(apiFin.bank),
        counterCredit: cleanNum(apiFin.counter_credit ?? apiFin.credit_amount),
        creditBillsAmount: cleanNum(apiFin.credit_bills_amount),
        cashPendingAmount: cleanNum(apiFin.cash_pending_amount),
        creditPendingAmount: cleanNum(apiFin.credit_pending_amount),
        actualBilledAmount: cleanNum(apiFin.actual_billed_amount),
    } : {
        ...totals,
        counterCredit: totals.creditAmount,
        expensesPaid: 0,
    };

    /* Grouped data by Date (Head) and Module / Category (Sub Head), with all bills sorted ascending by Bill No */
    const groupedData = useMemo(() => {
        let runningSlno = 1;
        const dateMap = new Map();

        filtered.forEach(r => {
            const dateKey = extractDateKey(r.date);
            const modName = (r.module || "GENERAL").trim();
            const catName = (r.category || "GENERAL").trim();
            const subKey = `${modName}|||${catName}`;

            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, new Map());
            }
            const subMap = dateMap.get(dateKey);
            if (!subMap.has(subKey)) {
                subMap.set(subKey, []);
            }
            subMap.get(subKey).push(r);
        });

        const result = [];
        const sortedDates = Array.from(dateMap.keys()).sort((a, b) => {
            const pa = a.split("/").reverse().join("-");
            const pb = b.split("/").reverse().join("-");
            return pa.localeCompare(pb);
        });

        sortedDates.forEach(dateKey => {
            const subMap = dateMap.get(dateKey);
            const sections = [];
            const sortedSubKeys = Array.from(subMap.keys()).sort((a, b) => a.localeCompare(b));

            sortedSubKeys.forEach(subKey => {
                const [modName, catName] = subKey.split("|||");
                const items = subMap.get(subKey) || [];
                const sortedItems = [...items].sort((a, b) => {
                    const s1 = String(a.bill_no || "").trim();
                    const s2 = String(b.bill_no || "").trim();
                    return s1.localeCompare(s2, undefined, { numeric: true, sensitivity: "base" });
                });

                let secGross = 0;
                let secDiscount = 0;
                let secNet = 0;

                const enrichedItems = sortedItems.map(r => {
                    const g = cleanNum(r.gross_amount);
                    const d = cleanNum(r.discount_amount);
                    const n = cleanNum(r.net_amount);
                    secGross += g;
                    secDiscount += d;
                    secNet += n;
                    return {
                        ...r,
                        displaySlno: runningSlno++,
                        grossVal: g,
                        discountVal: d,
                        netVal: n,
                        timeStr: extractTime(r.date)
                    };
                });

                sections.push({
                    module: modName,
                    category: catName,
                    items: enrichedItems,
                    totalGross: secGross,
                    totalDiscount: secDiscount,
                    totalNet: secNet,
                    count: enrichedItems.length
                });
            });

            result.push({
                date: dateKey,
                sections
            });
        });

        return result;
    }, [filtered]);

    /* Excel export with hierarchical Date (Head), Module / Category (Sub Head), and subtotals */
    const handleExport = () => {
        if (!groupedData || groupedData.length === 0) return;

        const excelRows = [];
        groupedData.forEach(dg => {
            excelRows.push({
                "SLNO": `Date: ${dg.date}`,
                "Bill / Ref No": "",
                "Time": "",
                "Module": "",
                "Category": "",
                "UHID": "",
                "IP No": "",
                "Patient Name": "",
                "Mode": "",
                "Gross (₹)": "",
                "Discount (₹)": "",
                "Net / Amt (₹)": "",
                "Status": "",
                "Remarks": ""
            });

            dg.sections.forEach(sec => {
                excelRows.push({
                    "SLNO": `${sec.module} — ${sec.category} (${sec.count} Bills)`,
                    "Bill / Ref No": "",
                    "Time": "",
                    "Module": "",
                    "Category": "",
                    "UHID": "",
                    "IP No": "",
                    "Patient Name": "",
                    "Mode": "",
                    "Gross (₹)": "",
                    "Discount (₹)": "",
                    "Net / Amt (₹)": "",
                    "Status": "",
                    "Remarks": ""
                });

                sec.items.forEach(it => {
                    excelRows.push({
                        "SLNO": it.displaySlno,
                        "Bill / Ref No": it.bill_no || "—",
                        "Time": it.timeStr || it.date || "",
                        "Module": it.module || "—",
                        "Category": it.category || "—",
                        "UHID": it.uhid || "—",
                        "IP No": it.ip_number || "—",
                        "Patient Name": it.patient_name || "—",
                        "Mode": it.payment_mode || "—",
                        "Gross (₹)": it.grossVal,
                        "Discount (₹)": it.discountVal,
                        "Net / Amt (₹)": it.netVal,
                        "Status": it.status || "",
                        "Remarks": it.remarks || ""
                    });
                });

                excelRows.push({
                    "SLNO": "",
                    "Bill / Ref No": "",
                    "Time": "",
                    "Module": "",
                    "Category": "",
                    "UHID": "",
                    "IP No": "",
                    "Patient Name": "",
                    "Mode": "Total ->",
                    "Gross (₹)": sec.totalGross,
                    "Discount (₹)": sec.totalDiscount,
                    "Net / Amt (₹)": sec.totalNet,
                    "Status": "",
                    "Remarks": ""
                });
            });
        });

        excelRows.push({
            "SLNO": "",
            "Bill / Ref No": "",
            "Time": "",
            "Module": "",
            "Category": "",
            "UHID": "",
            "IP No": "",
            "Patient Name": "",
            "Mode": `Grand Total -> (${filtered.length} Bills)`,
            "Gross (₹)": totals.gross,
            "Discount (₹)": totals.discount,
            "Net / Amt (₹)": totals.net,
            "Status": "",
            "Remarks": ""
        });

        [
            ["Gross Cash", displaySummary.grossCash],
            ["Less: Sales Return / Refund", -displaySummary.salesReturnRefund],
            ["Less: Counter Expense Payments", -displaySummary.expensesPaid],
            ["Net Cash", displaySummary.netCash],
            ["Bank / Card (POS)", displaySummary.bank],
            ["Counter Credit (CashCounter)", displaySummary.counterCredit],
            ["Cash Pending", displaySummary.cashPendingAmount],
            ["Credit Pending", displaySummary.creditPendingAmount],
            ["Credit Bills Amount (Gross)", displaySummary.creditBillsAmount],
            ["Actual Billed Amount", displaySummary.actualBilledAmount],
        ].forEach(([label, val]) => {
            excelRows.push({
                "SLNO": "",
                "Bill / Ref No": "",
                "Time": "",
                "Module": "",
                "Category": "",
                "UHID": "",
                "IP No": "",
                "Patient Name": "SUMMARY",
                "Mode": label,
                "Gross (₹)": "",
                "Discount (₹)": "",
                "Net / Amt (₹)": val,
                "Status": "",
                "Remarks": ""
            });
        });

        exportToExcel(excelRows, "Master_All_Consolidated_Bill_Report", "ConsolidatedBills");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                All Consolidated Bill Report
                                <span className="badge">All Statuses</span>
                            </h1>
                            <p>Unified bill register across Paid, Pending, Cancelled, Returned, and Refunded transactions</p>
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
                                    <Option key={o.outlet_code || o.outlet_id} value={o.outlet_code || o.outlet_id}>
                                        {o.outlet_name || o.name || o.outlet_code}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <label>Status:</label>
                            <Select value={billStatus} onChange={setBillStatus} style={{ width: 170 }}>
                                <Option value="all">All Statuses ({summary.total_count || allRows.length})</Option>
                                {STATUS_ORDER.map(st => (
                                    <Option key={st} value={st}>
                                        {st} ({byStatus[st]?.count || 0})
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <label>Module:</label>
                            <Select value={moduleFilter} onChange={setModuleFilter} style={{ width: 175 }}>
                                <Option value="all">All Modules</Option>
                                <Option value="Billing">Consultation / Billing</Option>
                                <Option value="Investigation">Investigation</Option>
                                <Option value="Discharge">Discharge</Option>
                                <Option value="Pharmacy">Pharmacy</Option>
                                <Option value="Sales Return">Sales Return</Option>
                                <Option value="Refund">Refund</Option>
                            </Select>
                        </div>
                        <div className="filter-item">
                            <label>Category:</label>
                            <Select
                                showSearch
                                optionFilterProp="children"
                                value={selectedCategory}
                                onChange={setSelectedCategory}
                                style={{ width: 185 }}
                            >
                                <Option value="all">All Categories ({categoryList.length})</Option>
                                {categoryList.map(c => (
                                    <Option key={c} value={c}>{c}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <label>Pay Mode:</label>
                            <Select
                                showSearch
                                optionFilterProp="children"
                                value={paymentModeFilter}
                                onChange={setPaymentModeFilter}
                                style={{ width: 170 }}
                            >
                                <Option value="all">All Modes ({paymentModeList.length})</Option>
                                {paymentModeList.map(pm => (
                                    <Option key={pm} value={pm}>{pm}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <Input
                                placeholder="Search bill / patient / UHID..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                allowClear
                                style={{ width: 220 }}
                            />
                        </div>
                        <Button
                            onClick={() => {
                                setOutlet(effectiveOutlet);
                                setBillStatus("all");
                                setModuleFilter("all");
                                setSelectedCategory("all");
                                setPaymentModeFilter("all");
                                setSearchTerm("");
                            }}
                        >
                            Clear
                        </Button>
                        <Button icon={<RefreshCw size={14} />} onClick={() => fetchReport(true)} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                </ControlCard>
            )}

            {loading ? (
                <div style={{ padding: "60px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-report-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title="AllConsolidatedBillReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc={`Consolidated bill audit — Status: ${billStatus === "all" ? "All (Paid, Pending, Cancel, Return, Refund)" : billStatus} | Module: ${moduleFilter === "all" ? "All" : moduleFilter}`}
                        />
                    )}

                    {!isModalView && (
                        <KPIGrid className="no-print">
                            {STATUS_ORDER.map((st) => {
                                const meta = STATUS_META[st];
                                const item = byStatus[st] || { count: 0, amount: 0 };
                                const active = billStatus === st;
                                return (
                                    <KPICard
                                        key={st}
                                        $border={meta.border}
                                        onClick={() => setBillStatus(active ? "all" : st)}
                                        style={{
                                            cursor: "pointer",
                                            background: active ? "#f8fafc" : "#ffffff",
                                            boxShadow: active ? `0 0 0 2px ${meta.border}` : undefined
                                        }}
                                    >
                                        <span className="kpi-title">{st} ({item.count})</span>
                                        <span className="kpi-value" style={{ color: meta.border }}>
                                            ₹{formatINR(item.amount)}
                                        </span>
                                        <span className="kpi-subtitle">{meta.subtitle}</span>
                                    </KPICard>
                                );
                            })}
                        </KPIGrid>
                    )}

                    <CompactTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: "3.5%", textAlign: "center" }}>SLNO</th>
                                    <th style={{ width: "9.5%" }}>Bill / Ref No</th>
                                    <th style={{ width: "5.5%" }}>Time</th>
                                    <th style={{ width: "7.5%" }}>Module</th>
                                    <th style={{ width: "9%" }}>Category</th>
                                    <th style={{ width: "7.5%" }}>UHID</th>
                                    <th style={{ width: "6.5%" }}>IP No</th>
                                    <th style={{ width: "14%" }}>Patient Name</th>
                                    <th style={{ width: "6%" }}>Mode</th>
                                    <th style={{ width: "6.5%" }} className="text-right">Gross (₹)</th>
                                    <th style={{ width: "5.5%" }} className="text-right">Discount (₹)</th>
                                    <th style={{ width: "7%" }} className="text-right">Net / Amt (₹)</th>
                                    <th style={{ width: "5%", textAlign: "center" }}>Status</th>
                                    <th style={{ width: "7%" }}>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={14} style={{ textAlign: "center", padding: "35px", color: "#64748b" }}>
                                            No billing records found for the selected criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    groupedData.map(dg => (
                                        <React.Fragment key={dg.date}>
                                            <DateHeaderTr className="DateGroup date-group">
                                                <td colSpan={14} style={{ padding: "4px 8px", background: "#f1f5f9", fontWeight: 700 }}>
                                                    Date : {dg.date}
                                                </td>
                                            </DateHeaderTr>

                                            {dg.sections.map(sec => (
                                                <React.Fragment key={`${dg.date}-${sec.module}-${sec.category}`}>
                                                    <SectionHeaderTr className="SectionHeader section-header">
                                                        <td colSpan={14} style={{ padding: "4px 8px", background: "#e2e8f0", fontWeight: 800 }}>
                                                            {sec.module} — {sec.category} ({sec.count} {sec.count === 1 ? "Bill" : "Bills"})
                                                        </td>
                                                    </SectionHeaderTr>

                                                    {sec.items.map(it => {
                                                        const meta = STATUS_META[it.status] || { color: "default", rowBg: "inherit", border: "#0f172a" };
                                                        return (
                                                            <tr
                                                                key={`${it.module}-${it.bill_no}-${it.displaySlno}`}
                                                                style={{ background: meta.rowBg }}
                                                            >
                                                                <td className="text-center" style={{ fontWeight: 600 }}>
                                                                    {it.displaySlno}
                                                                </td>
                                                                <td className="font-mono" style={{ fontWeight: 700 }}>
                                                                    <strong>{it.bill_no || "—"}</strong>
                                                                </td>
                                                                <td style={{ fontSize: "0.78rem", color: "#334155" }}>
                                                                    {it.timeStr || it.date || "—"}
                                                                </td>
                                                                <td style={{ fontSize: "0.80rem", fontWeight: 600 }}>
                                                                    {it.module || "—"}
                                                                </td>
                                                                <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                    {it.category || "—"}
                                                                </td>
                                                                <td className="font-mono" style={{ fontWeight: 600 }}>
                                                                    {it.uhid || "—"}
                                                                </td>
                                                                <td className="font-mono" style={{ fontWeight: 600 }}>
                                                                    {it.ip_number || "—"}
                                                                </td>
                                                                <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                    <strong style={{ color: "#0f172a" }}>
                                                                        {it.patient_name || "—"}
                                                                    </strong>
                                                                </td>
                                                                <td style={{ fontSize: "0.80rem", fontWeight: 500 }}>
                                                                    {it.payment_mode || "—"}
                                                                </td>
                                                                <td className="text-right font-mono font-bold">
                                                                    {formatINR(it.grossVal)}
                                                                </td>
                                                                <td className="text-right font-mono" style={{ color: it.discountVal > 0 ? "#d97706" : "#64748b" }}>
                                                                    {it.discountVal > 0 ? formatINR(it.discountVal) : "0.00"}
                                                                </td>
                                                                <td className="text-right font-mono font-bold" style={{ color: meta.border }}>
                                                                    {formatINR(it.netVal)}
                                                                </td>
                                                                <td className="text-center">
                                                                    <Tag color={meta.color} style={{ margin: 0, fontWeight: 700, fontSize: "0.72rem" }}>
                                                                        {it.status}
                                                                    </Tag>
                                                                </td>
                                                                <td style={{ whiteSpace: "normal", wordBreak: "break-word", fontSize: "0.78rem", color: "#475569" }}>
                                                                    {it.remarks || "—"}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}

                                                    <SubtotalTr className="SubTotal sub-total">
                                                        <td colSpan={9} style={{ textAlign: "right", fontWeight: 700, color: "#1e293b" }}>
                                                            Total -&gt; ({sec.count} {sec.count === 1 ? "Bill" : "Bills"})
                                                        </td>
                                                        <td className="text-right font-mono font-bold">
                                                            {formatINR(sec.totalGross)}
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: "#d97706" }}>
                                                            {formatINR(sec.totalDiscount)}
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                            {formatINR(sec.totalNet)}
                                                        </td>
                                                        <td colSpan={2}></td>
                                                    </SubtotalTr>
                                                </React.Fragment>
                                            ))}
                                        </React.Fragment>
                                    ))
                                )}

                                {groupedData.length > 0 && (
                                    <GrandTotalTr className="GrandTotal grand-total-row">
                                        <td colSpan={9} style={{ textAlign: "right", fontWeight: 800, color: "#000000" }}>
                                            Grand Total -&gt; ({filtered.length} Bills)
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#000000" }}>
                                            {formatINR(totals.gross)}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#d97706" }}>
                                            {formatINR(totals.discount)}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#000000" }}>
                                            {formatINR(totals.net)}
                                        </td>
                                        <td colSpan={2}></td>
                                    </GrandTotalTr>
                                )}
                            </tbody>
                        </table>
                    </CompactTableWrapper>

                    {filtered.length > 0 && (
                        <CompactTableWrapper style={{ marginTop: "18px" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "35%" }}>Summary Particulars ({filtered.length} Bills)</th>
                                        <th style={{ width: "45%" }}>Description / Calculation</th>
                                        <th style={{ width: "20%" }} className="text-right">Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { label: "Gross Cash", desc: "Total cash collected across counters", val: displaySummary.grossCash, color: "#059669" },
                                        { label: "Less: Sales Return / Refund", desc: "Medicine, investigation & discharge returns / refunds", val: -displaySummary.salesReturnRefund, color: "#dc2626" },
                                        { label: "Less: Counter Expense Payments", desc: "Counter expense vouchers paid", val: -displaySummary.expensesPaid, color: "#d97706" },
                                        { label: "Net Cash", desc: "Gross Cash - Sales Return / Refund - Counter Expenses", val: displaySummary.netCash, color: "#047857", bold: true, bg: "#ecfdf5" },
                                        { label: "Bank / Card", desc: "Electronic POS / Card / UPI / Online collections", val: displaySummary.bank, color: "#2563eb" },
                                        { label: "Counter Credit (Logged)", desc: "Credit amount logged in counter collection", val: displaySummary.counterCredit, color: "#7c3aed" },
                                        { label: "Cash Pending", desc: "Unpaid non-credit pending bills", val: displaySummary.cashPendingAmount, color: "#d97706" },
                                        { label: "Credit Pending", desc: "Pending Credit / Insurance / Scheme bills", val: displaySummary.creditPendingAmount, color: "#2563eb" },
                                        { label: "Credit Bills Amount", desc: "Total gross billed amount of Credit-mode bills", val: displaySummary.creditBillsAmount, color: "#4f46e5" },
                                        { label: "Actual Billed Amount", desc: "Total active billed amount (Paid + Cash Pending + Credit Pending)", val: displaySummary.actualBilledAmount, color: "#000000", bold: true, bg: "#f1f5f9" },
                                    ].map((row) => (
                                        <tr key={row.label} style={{ background: row.bg || "inherit" }}>
                                            <td style={{ fontWeight: row.bold ? 800 : 600, color: row.bold ? "#0f172a" : "#1e293b" }}>
                                                {row.label}
                                            </td>
                                            <td style={{ color: "#475569", fontSize: "0.80rem" }}>
                                                {row.desc}
                                            </td>
                                            <td
                                                className="text-right font-mono"
                                                style={{
                                                    fontWeight: row.bold ? 800 : 700,
                                                    fontSize: row.bold ? "0.94rem" : "0.88rem",
                                                    color: row.color,
                                                }}
                                            >
                                                {formatINR(row.val)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CompactTableWrapper>
                    )}

                    <ReportPrintFooter />
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterAllConsolidatedBillReport;
