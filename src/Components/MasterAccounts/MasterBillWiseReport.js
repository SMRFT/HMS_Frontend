import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DatePicker, Select, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import styled from "styled-components";
import { Printer, Download, Search, RefreshCw } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
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

const CompactTableWrapper = styled(DataTableWrapper)`
    width: 100%;
    overflow-x: auto;
    table {
        table-layout: fixed;
        width: 100%;
        font-size: 0.85rem;
        border-collapse: collapse;
        border: 1.5px solid #334155 !important;
    }
    thead th {
        padding: 5px 6px !important;
        font-size: 0.82rem !important;
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
        font-size: 0.84rem !important;
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

const SectionHeaderTr = styled.tr`
    background: #e2e8f0 !important;
    td {
        font-weight: 800 !important;
        font-size: 0.84rem !important;
        color: #0f172a !important;
        padding: 4px 8px !important;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: #e2e8f0 !important;
        border: 1px solid #94a3b8 !important;
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

const MasterBillWiseReport = ({ 
    isModalView = false, 
    startDate, 
    endDate, 
    outlet: propOutlet, 
    initialOutlet = "all",
    billType,
    initialBillType,
    category,
    cardMachine,
    selectedCardMachine: propCardMachine,
    onLoadOptions
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const effectiveOutlet = propOutlet || initialOutlet || "all";
    const effectiveCategory = billType || initialBillType || category || "all";
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs(),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(effectiveOutlet);
    const [outletsList, setOutletsList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(effectiveCategory);
    const [selectedCardType, setSelectedCardType] = useState("all");
    const [selectedCardMachine, setSelectedCardMachine] = useState(cardMachine || propCardMachine || "all");
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

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

    /* Synchronize category / billType */
    useEffect(() => {
        const c = billType || initialBillType || category;
        if (c !== undefined && c !== selectedCategory) {
            setSelectedCategory(c);
        }
    }, [billType, initialBillType, category]);

    /* Synchronize card machine */
    useEffect(() => {
        const cm = cardMachine || propCardMachine;
        if (cm !== undefined && cm !== selectedCardMachine) {
            setSelectedCardMachine(cm);
        }
    }, [cardMachine, propCardMachine]);

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
            const outletParam = outlet && outlet !== "all" ? `&outlet_code=${outlet}` : "";
            const url = `${HmsBaseUrl}master-accounts/bill-wise-detailed/?from_date=${fDate}&to_date=${tDate}${outletParam}`;
            const res = await cachedApiRequest(url, "GET", null, { forceRefresh: isRefresh });
            if (res?.success) {
                setReportData(extractReportData(res));
            } else {
                setReportData(null);
            }
        } catch (err) {
            console.error("Bill Wise Detailed Error:", err);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    }, [dateRange, outlet, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const bills = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    const categoryList = useMemo(() => {
        const set = new Set();
        bills.forEach(b => {
            if (b.category) set.add(b.category);
        });
        return Array.from(set);
    }, [bills]);

    const cardTypeList = useMemo(() => {
        const set = new Set();
        bills.forEach(b => {
            if (b.card_type) set.add(b.card_type);
            if (b.card_machine) set.add(b.card_machine);
        });
        return Array.from(set).sort();
    }, [bills]);

    const cardMachinesList = useMemo(() => {
        const set = new Set();
        bills.forEach(b => {
            if (b.card_machine) set.add(b.card_machine);
            else if (b.card_number && !/^\d+$/.test(b.card_number)) set.add(b.card_number);
        });
        return Array.from(set).sort();
    }, [bills]);

    useEffect(() => {
        if (onLoadOptions && reportData) {
            onLoadOptions({
                categories: categoryList,
                cardMachines: cardMachinesList
            });
        }
    }, [onLoadOptions, categoryList, cardMachinesList, reportData]);

    /* Filter by category, card type, card machine and search */
    const filtered = useMemo(() => {
        let list = bills;
        if (selectedCategory && selectedCategory !== "all" && selectedCategory !== "All") {
            const catLower = selectedCategory.toLowerCase().trim();
            const catNorm = catLower.replace(/[\s()_-]/g, "");
            list = list.filter(b => {
                const bCat = String(b.category || "").toLowerCase().trim();
                if (!bCat) return false;
                const bNorm = bCat.replace(/[\s()_-]/g, "");
                const bMod = String(b.module || b.bill_type_name || "").toLowerCase().trim();

                // Exact match
                if (bCat === catLower || bNorm === catNorm) return true;

                // Substring match for substantial tokens (>= 3 chars)
                if (catNorm.length >= 3 && bNorm.includes(catNorm)) return true;
                if (bNorm.length >= 3 && catNorm.includes(bNorm)) return true;
                if (bMod && catNorm.length >= 3 && bMod.replace(/[\s()_-]/g, "").includes(catNorm)) return true;

                // Keyword-based classification
                if (catLower === "discharge" && bCat.includes("discharge")) return true;
                if (catLower === "registration" && bCat.includes("registration")) return true;
                if (catLower === "pharmacy" && bCat.includes("pharmacy")) return true;
                if (catLower === "admission" && bCat.includes("admission")) return true;
                if ((catLower === "sales return" || catLower === "salesreturn") && (bCat.includes("sales return") || bCat.includes("salesreturn") || b.is_sales_return)) return true;
                if (catLower.includes("advance") && bCat.includes("advance")) return true;
                if (catLower.includes("misc") && (bCat.includes("misc") || bCat.includes("expense"))) return true;
                if (catLower.includes("investigation") && (
                    bCat.includes("lab") || bCat.includes("scan") || bCat.includes("x-ray") || 
                    bCat.includes("ecg") || bCat.includes("echo") || bCat.includes("mri") || 
                    bCat.includes("pet") || bCat.includes("dialysis") || bCat.includes("dental") || 
                    bCat.includes("procedure") || bCat.includes("pulmonology") || bCat.includes("cardiology")
                )) return true;

                return false;
            });
        }
        if (selectedCardType !== "all") {
            const ctFilter = selectedCardType.toLowerCase().trim();
            list = list.filter(b => {
                if (ctFilter === "cash") {
                    return (cleanNum(b.cash) > 0 && cleanNum(b.bank) === 0) || String(b.payment_mode || "").toLowerCase() === "cash";
                }
                if (ctFilter === "card" || ctFilter === "card / pos") {
                    return cleanNum(b.bank) > 0 || String(b.payment_mode || "").toLowerCase().includes("card");
                }
                const ct = String(b.card_type || "").toLowerCase().trim();
                const cm = String(b.card_machine || "").toLowerCase().trim();
                const pm = String(b.payment_mode || "").toLowerCase().trim();
                return ct === ctFilter || cm === ctFilter || cm.includes(ctFilter) || pm.includes(ctFilter);
            });
        }
        if (selectedCardMachine !== "all") {
            const cmFilter = selectedCardMachine.toLowerCase().trim();
            list = list.filter(b => {
                const cm = String(b.card_machine || b.card_number || "").toLowerCase().trim();
                return cm === cmFilter || cm.includes(cmFilter);
            });
        }
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(b =>
                String(b.bill_no || "").toLowerCase().includes(q) ||
                String(b.patient_name || "").toLowerCase().includes(q) ||
                String(b.mr_no || b.uhid || "").toLowerCase().includes(q) ||
                String(b.ip_number || "").toLowerCase().includes(q) ||
                String(b.category || "").toLowerCase().includes(q) ||
                String(b.payment_mode || "").toLowerCase().includes(q) ||
                String(b.card_type || "").toLowerCase().includes(q) ||
                String(b.card_machine || "").toLowerCase().includes(q)
            );
        }
        return [...list].sort((a, b) => {
            const s1 = String(a.bill_no || "").trim();
            const s2 = String(b.bill_no || "").trim();
            return s1.localeCompare(s2, undefined, { numeric: true, sensitivity: 'base' });
        });
    }, [bills, selectedCategory, selectedCardType, selectedCardMachine, searchTerm]);

    /* Calculated totals */
    const totals = useMemo(() => {
        let grossRev = 0;
        let cashIn = 0;
        let cardIn = 0;
        let creditIn = 0;
        let salesRet = 0;
        let expPaid = 0;

        filtered.forEach(b => {
            const isSR = b.is_sales_return || String(b.category || "").toLowerCase().includes("return") || String(b.category || "").toLowerCase().includes("refund") || cleanNum(b.sales_return) > 0;
            const isExp = b.is_expense || String(b.category || "").toLowerCase().includes("expense") || String(b.category || "").toLowerCase().includes("payment");
            const amt = Math.abs(cleanNum(b.amount || b.gross || b.net_amount));

            if (isSR) {
                salesRet += Math.abs(cleanNum(b.sales_return_amount || b.refund_amount || amt));
            } else if (isExp) {
                expPaid += Math.abs(cleanNum(b.expense_amount || amt));
            } else {
                grossRev += Math.abs(amt);
                if (cleanNum(b.cash) > 0) cashIn += cleanNum(b.cash);
                if (cleanNum(b.bank) > 0) cardIn += cleanNum(b.bank);
                if (cleanNum(b.credit) > 0) creditIn += cleanNum(b.credit);
            }
        });

        const netRev = grossRev - salesRet - expPaid;
        const netCash = cashIn - salesRet - expPaid;

        return {
            grossRev,
            cashIn,
            cardIn,
            creditIn,
            salesRet,
            expPaid,
            netRev,
            netCash
        };
    }, [filtered]);

    /* Grouped data by Date and Category */
    const groupedData = useMemo(() => {
        let runningSlno = 1;
        const dateMap = new Map();

        filtered.forEach(b => {
            const dateKey = extractDateKey(b.date);
            const categoryKey = (b.category || "GENERAL").trim().toUpperCase();

            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, new Map());
            }
            const catMap = dateMap.get(dateKey);
            if (!catMap.has(categoryKey)) {
                catMap.set(categoryKey, []);
            }
            catMap.get(categoryKey).push(b);
        });

        const result = [];
        dateMap.forEach((catMap, dateKey) => {
            const sections = [];
            let dateSalesRet = 0;
            let dateExpPaid = 0;
            let dateCash = 0;
            let dateCard = 0;
            let dateNet = 0;
            let dateCount = 0;

            catMap.forEach((items, category) => {
                let secSalesRet = 0;
                let secExpPaid = 0;
                let secCash = 0;
                let secCard = 0;
                let secNet = 0;

                // Sort items in ascending bill number order
                const sortedItems = [...items].sort((a, b) => {
                    const s1 = String(a.bill_no || "").trim();
                    const s2 = String(b.bill_no || "").trim();
                    return s1.localeCompare(s2, undefined, { numeric: true, sensitivity: 'base' });
                });

                const enrichedItems = sortedItems.map(b => {
                    const isSR = b.is_sales_return || String(b.category || "").toLowerCase().includes("return") || String(b.category || "").toLowerCase().includes("refund") || cleanNum(b.sales_return) > 0;
                    const isExp = b.is_expense || String(b.category || "").toLowerCase().includes("expense") || String(b.category || "").toLowerCase().includes("payment");
                    const srAmt = isSR ? Math.abs(cleanNum(b.sales_return_amount || b.refund_amount || b.amount || b.gross)) : 0;
                    const expAmt = isExp ? Math.abs(cleanNum(b.expense_amount || b.amount || b.gross)) : 0;
                    const netAmt = isSR ? -srAmt : isExp ? -expAmt : cleanNum(b.gross || ((b.cash || 0) + (b.bank || 0) + (b.credit || 0)));
                    const cashAmt = isSR && srAmt > 0 ? -srAmt : isExp && expAmt > 0 ? -expAmt : cleanNum(b.cash);
                    const cardAmt = cleanNum(b.bank);

                    secSalesRet += srAmt;
                    secExpPaid += expAmt;
                    secCash += cashAmt;
                    secCard += cardAmt;
                    secNet += netAmt;

                    return {
                        ...b,
                        displaySlno: runningSlno++,
                        isSR,
                        isExp,
                        srAmt,
                        expAmt,
                        netAmt,
                        cashAmt,
                        cardAmt,
                        timeStr: extractTime(b.date)
                    };
                });

                sections.push({
                    category,
                    items: enrichedItems,
                    totalSalesRet: secSalesRet,
                    totalExpPaid: secExpPaid,
                    totalCash: secCash,
                    totalCard: secCard,
                    totalNet: secNet,
                    count: enrichedItems.length
                });

                dateSalesRet += secSalesRet;
                dateExpPaid += secExpPaid;
                dateCash += secCash;
                dateCard += secCard;
                dateNet += secNet;
                dateCount += enrichedItems.length;
            });

            result.push({
                date: dateKey,
                sections,
                dateSalesRet,
                dateExpPaid,
                dateCash,
                dateCard,
                dateNet,
                count: dateCount
            });
        });

        return result;
    }, [filtered]);

    /* Excel export with hierarchical date, category, and subtotals */
    const handleExport = () => {
        if (!groupedData || groupedData.length === 0) return;

        const excelRows = [];
        groupedData.forEach(dg => {
            excelRows.push({
                "SLNO": `Date: ${dg.date}`,
                "Bill / Voucher No": "",
                "Time": "",
                "UHID": "",
                "IP No": "",
                "Patient / Particulars": "",
                "Mode": "",
                "Sales Return (₹)": "",
                "Expense Payment (₹)": "",
                "Cash (₹)": "",
                "Card / POS (₹)": "",
                "Net Amount (₹)": ""
            });

            dg.sections.forEach(sec => {
                excelRows.push({
                    "SLNO": sec.category,
                    "Bill / Voucher No": "",
                    "Time": "",
                    "UHID": "",
                    "IP No": "",
                    "Patient / Particulars": "",
                    "Mode": "",
                    "Sales Return (₹)": "",
                    "Expense Payment (₹)": "",
                    "Cash (₹)": "",
                    "Card / POS (₹)": "",
                    "Net Amount (₹)": ""
                });

                sec.items.forEach(it => {
                    excelRows.push({
                        "SLNO": it.displaySlno,
                        "Bill / Voucher No": it.bill_no,
                        "Time": it.timeStr || it.date || "",
                        "UHID": it.mr_no || it.uhid || "—",
                        "IP No": it.ip_number || "—",
                        "Patient / Particulars": it.patient_name || "—",
                        "Mode": it.payment_mode || "Cash",
                        "Sales Return (₹)": it.srAmt > 0 ? -it.srAmt : 0,
                        "Expense Payment (₹)": it.expAmt > 0 ? -it.expAmt : 0,
                        "Cash (₹)": it.cashAmt,
                        "Card / POS (₹)": it.cardAmt,
                        "Net Amount (₹)": it.netAmt
                    });
                });

                excelRows.push({
                    "SLNO": "",
                    "Bill / Voucher No": "",
                    "Time": "",
                    "UHID": "",
                    "IP No": "",
                    "Patient / Particulars": "",
                    "Mode": "Total ->",
                    "Sales Return (₹)": sec.totalSalesRet > 0 ? -sec.totalSalesRet : 0,
                    "Expense Payment (₹)": sec.totalExpPaid > 0 ? -sec.totalExpPaid : 0,
                    "Cash (₹)": sec.totalCash,
                    "Card / POS (₹)": sec.totalCard,
                    "Net Amount (₹)": sec.totalNet
                });
            });
        });

        excelRows.push({
            "SLNO": "",
            "Bill / Voucher No": "",
            "Time": "",
            "UHID": "",
            "IP No": "",
            "Patient / Particulars": "",
            "Mode": `Grand Total -> (${filtered.length} Bills)`,
            "Sales Return (₹)": totals.salesRet > 0 ? -totals.salesRet : 0,
            "Expense Payment (₹)": totals.expPaid > 0 ? -totals.expPaid : 0,
            "Cash (₹)": totals.cashIn - totals.salesRet - totals.expPaid,
            "Card / POS (₹)": totals.cardIn,
            "Net Amount (₹)": totals.netRev
        });

        exportToExcel(excelRows, "Master_Bill_Wise_Detailed_Report", "BillWise");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                Bill Wise Detailed Report
                                <span className="badge">Itemized Audit</span>
                            </h1>
                            <p>Line-by-line revenue analysis per bill with sales returns, counter expense payments, and net cash handover</p>
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
                                    <Option key={o.outlet_code} value={o.outlet_code}>
                                        {o.outlet_name || o.outlet_code}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <label>Category:</label>
                            <Select value={selectedCategory} onChange={setSelectedCategory} style={{ width: 170 }}>
                                <Option value="all">All Categories ({categoryList.length})</Option>
                                {categoryList.map(c => (
                                    <Option key={c} value={c}>{c}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <label>Card / Pay Type:</label>
                            <Select value={selectedCardType} onChange={setSelectedCardType} style={{ width: 160 }}>
                                <Option value="all">All Pay Types</Option>
                                <Option value="Cash">Cash Only</Option>
                                <Option value="Card">Card / POS</Option>
                                {cardTypeList.map(c => (
                                    <Option key={c} value={c}>{c}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <label>Card Machine:</label>
                            <Select value={selectedCardMachine} onChange={setSelectedCardMachine} style={{ width: 160 }}>
                                <Option value="all">All Machines</Option>
                                {cardMachinesList.map(cm => (
                                    <Option key={cm} value={cm}>{cm}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <Input
                                placeholder="Search bill / patient / UHID..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 220 }}
                            />
                        </div>
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
                            title="BillWiseReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Itemized revenue audit per bill with sales returns, counter expense payments, and net reconciliation"
                        />
                    )}

                    {!isModalView && (
                        <KPIGrid className="no-print">
                            <KPICard $border="#0284c7">
                                <span className="kpi-title">Gross Invoiced Revenue</span>
                                <span className="kpi-value">₹{formatINR(summary.total_gross_revenue || totals.grossRev)}</span>
                                <span className="kpi-subtitle">Total patient bills</span>
                            </KPICard>
                            <KPICard $border="#059669">
                                <span className="kpi-title">Gross Cash Collections</span>
                                <span className="kpi-value">₹{formatINR(summary.total_cash || totals.cashIn)}</span>
                                <span className="kpi-subtitle">Cash inflow</span>
                            </KPICard>
                            <KPICard $border="#6366f1">
                                <span className="kpi-title">Card & Bank (POS)</span>
                                <span className="kpi-value">₹{formatINR(summary.total_card || totals.cardIn)}</span>
                                <span className="kpi-subtitle">Electronic POS / online</span>
                            </KPICard>
                            <KPICard $border="#8b5cf6">
                                <span className="kpi-title">Credit / Insurance</span>
                                <span className="kpi-value">₹{formatINR(summary.total_credit || totals.creditIn)}</span>
                                <span className="kpi-subtitle">TPA / Corporate dues</span>
                            </KPICard>
                            <KPICard $border="#dc2626">
                                <span className="kpi-title">Sales Returns & Refunds</span>
                                <span className="kpi-value" style={{ color: "#dc2626" }}>
                                    -₹{formatINR(summary.total_sales_returns || totals.salesRet)}
                                </span>
                                <span className="kpi-subtitle">Medicine / discharge refunds</span>
                            </KPICard>
                            <KPICard $border="#d97706">
                                <span className="kpi-title">Expense Payments</span>
                                <span className="kpi-value" style={{ color: "#d97706" }}>
                                    -₹{formatINR(summary.total_expenses_paid || totals.expPaid)}
                                </span>
                                <span className="kpi-subtitle">Counter expense vouchers</span>
                            </KPICard>
                            <KPICard $border="#10b981">
                                <span className="kpi-title">Net Handover / Total</span>
                                <span className="kpi-value" style={{ color: "#059669" }}>
                                    ₹{formatINR(summary.net_revenue || totals.netRev)}
                                </span>
                                <span className="kpi-subtitle">After returns & payments</span>
                            </KPICard>
                        </KPIGrid>
                    )}

                    <CompactTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: "3.5%", textAlign: "center" }}>SLNO</th>
                                    <th style={{ width: "11%" }}>Bill / Voucher No</th>
                                    <th style={{ width: "7.5%" }}>Time</th>
                                    <th style={{ width: "8.5%" }}>UHID</th>
                                    <th style={{ width: "8%" }}>IP No</th>
                                    <th style={{ width: "23%" }}>Patient / Particulars</th>
                                    <th style={{ width: "5.5%" }}>Mode</th>
                                    <th style={{ width: "8%", color: "#dc2626" }} className="text-right">Sales Return (₹)</th>
                                    <th style={{ width: "8.5%", color: "#d97706" }} className="text-right">Expense Payment (₹)</th>
                                    <th style={{ width: "8%" }} className="text-right">Cash (₹)</th>
                                    <th style={{ width: "8%" }} className="text-right">Card / POS (₹)</th>
                                    <th style={{ width: "8.5%" }} className="text-right">Net Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} style={{ textAlign: "center", padding: "35px", color: "#64748b" }}>
                                            No billing records found for the selected criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    groupedData.map(dg => (
                                        <React.Fragment key={dg.date}>
                                            {/* Date Header Row */}
                                            <DateHeaderTr className="DateGroup date-group">
                                                <td colSpan={12} style={{ padding: "4px 8px", background: "#f1f5f9", fontWeight: 700 }}>
                                                    Date : {dg.date}
                                                </td>
                                            </DateHeaderTr>

                                            {/* Category Sections */}
                                            {dg.sections.map(sec => (
                                                <React.Fragment key={`${dg.date}-${sec.category}`}>
                                                    {/* Category Header Row */}
                                                    <SectionHeaderTr className="SectionHeader section-header">
                                                        <td colSpan={12} style={{ padding: "4px 8px", background: "#e2e8f0", fontWeight: 800 }}>
                                                            {sec.category}
                                                        </td>
                                                    </SectionHeaderTr>

                                                    {/* Item Rows */}
                                                    {sec.items.map(it => {
                                                        const pName = (it.patient_name || (it.mr_no || it.uhid ? "Patient" : "General Patient")).trim();
                                                        const itemDesc = Array.isArray(it.particulars) && it.particulars.length > 0 
                                                            ? (it.particulars[0]?.itemName || it.particulars[0]?.item_name || "").trim() 
                                                            : "";
                                                        const showSubDesc = Boolean(itemDesc && itemDesc.toLowerCase() !== pName.toLowerCase());

                                                        return (
                                                            <tr 
                                                                key={it.bill_no + "-" + it.displaySlno}
                                                                style={{
                                                                    background: it.isSR ? "#fef2f2" : it.isExp ? "#fffbeb" : "inherit"
                                                                }}
                                                            >
                                                                <td className="text-center" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                                                    {it.displaySlno}
                                                                </td>
                                                                <td className="font-mono" style={{ fontSize: "0.88rem", fontWeight: 700 }}>
                                                                    <strong>{it.bill_no}</strong>
                                                                </td>
                                                                <td style={{ fontSize: "0.80rem", color: "#334155" }}>
                                                                    {it.timeStr || it.date || "—"}
                                                                </td>
                                                                <td className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                                                                    {it.mr_no || it.uhid || "—"}
                                                                </td>
                                                                <td className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                                                                    {it.ip_number || "—"}
                                                                </td>
                                                                <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                    <strong style={{ fontSize: "0.88rem", color: "#0f172a" }}>
                                                                        {pName}
                                                                    </strong>
                                                                    {showSubDesc && (
                                                                        <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: "1px" }}>
                                                                            {itemDesc}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td style={{ fontSize: "0.82rem", fontWeight: 500 }}>
                                                                    {it.payment_mode || "Cash"}
                                                                    {Boolean(it.cardAmt > 0 && it.card_machine) && (
                                                                        <span style={{
                                                                            display: "inline-block",
                                                                            marginLeft: "6px",
                                                                            padding: "1px 6px",
                                                                            borderRadius: "4px",
                                                                            fontSize: "0.72rem",
                                                                            fontWeight: 700,
                                                                            background: "#e0e7ff",
                                                                            color: "#3730a3",
                                                                            border: "1px solid #c7d2fe"
                                                                        }}>
                                                                            {it.card_machine}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="text-right font-mono font-bold" style={{ color: it.srAmt > 0 ? "#dc2626" : "#64748b", fontSize: "0.92rem" }}>
                                                                    {it.srAmt > 0 ? `-₹${formatINR(it.srAmt)}` : "—"}
                                                                </td>
                                                                <td className="text-right font-mono font-bold" style={{ color: it.expAmt > 0 ? "#d97706" : "#64748b", fontSize: "0.92rem" }}>
                                                                    {it.expAmt > 0 ? `-₹${formatINR(it.expAmt)}` : "—"}
                                                                </td>
                                                                <td className="text-right font-mono font-bold" style={{ fontSize: "0.92rem" }}>
                                                                    {it.isSR && it.srAmt > 0 ? (
                                                                        <span style={{ color: "#dc2626", fontWeight: 700 }}>-₹${formatINR(it.srAmt)}</span>
                                                                    ) : it.isExp && it.expAmt > 0 ? (
                                                                        <span style={{ color: "#d97706", fontWeight: 700 }}>-₹${formatINR(it.expAmt)}</span>
                                                                    ) : cleanNum(it.cash) > 0 ? (
                                                                        <span style={{ color: "#059669", fontWeight: 700 }}>{formatINR(it.cash)}</span>
                                                                    ) : cleanNum(it.cash) < 0 ? (
                                                                        <span style={{ color: "#dc2626", fontWeight: 700 }}>{formatINR(it.cash)}</span>
                                                                    ) : (
                                                                        "0.00"
                                                                    )}
                                                                </td>
                                                                <td className="text-right font-mono font-bold" style={{ fontSize: "0.92rem", color: cleanNum(it.bank) > 0 ? "#2563eb" : "#0f172a" }}>
                                                                    {formatINR(it.bank)}
                                                                </td>
                                                                <td className="text-right font-mono font-bold" style={{ color: it.netAmt < 0 ? "#dc2626" : "#0284c7", fontSize: "0.94rem" }}>
                                                                    {formatINR(it.netAmt)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}

                                                    {/* Section Subtotal Row */}
                                                    <SubtotalTr className="SubTotal sub-total">
                                                        <td colSpan={7} style={{ textAlign: "right", fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>
                                                            Total -&gt;
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: sec.totalSalesRet > 0 ? "#dc2626" : "#64748b", fontSize: "0.95rem" }}>
                                                            {sec.totalSalesRet > 0 ? `-₹${formatINR(sec.totalSalesRet)}` : "—"}
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: sec.totalExpPaid > 0 ? "#d97706" : "#64748b", fontSize: "0.95rem" }}>
                                                            {sec.totalExpPaid > 0 ? `-₹${formatINR(sec.totalExpPaid)}` : "—"}
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: sec.totalCash < 0 ? "#dc2626" : "#059669", fontSize: "0.95rem" }}>
                                                            {sec.totalCash < 0 ? `-₹${formatINR(Math.abs(sec.totalCash))}` : formatINR(sec.totalCash)}
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ fontSize: "0.95rem", color: "#2563eb" }}>
                                                            {formatINR(sec.totalCard)}
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: sec.totalNet < 0 ? "#dc2626" : "#0284c7", fontSize: "0.98rem" }}>
                                                            {sec.totalNet < 0 ? `-₹${formatINR(Math.abs(sec.totalNet))}` : formatINR(sec.totalNet)}
                                                        </td>
                                                    </SubtotalTr>
                                                </React.Fragment>
                                            ))}
                                        </React.Fragment>
                                    ))
                                )}

                                {/* Grand Totals Row */}
                                {groupedData.length > 0 && (
                                    <GrandTotalTr className="GrandTotal grand-total-row">
                                        <td colSpan={7} style={{ textAlign: "right", fontWeight: 800, color: "#000000", fontSize: "0.94rem" }}>
                                            Grand Total -&gt; ({filtered.length} Bills)
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: totals.salesRet > 0 ? "#dc2626" : "#000000", fontSize: "1.05rem" }}>
                                            {totals.salesRet > 0 ? `-₹${formatINR(totals.salesRet)}` : "0.00"}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: totals.expPaid > 0 ? "#d97706" : "#000000", fontSize: "1.05rem" }}>
                                            {totals.expPaid > 0 ? `-₹${formatINR(totals.expPaid)}` : "0.00"}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: (totals.cashIn - totals.salesRet - totals.expPaid) < 0 ? "#dc2626" : "#000000", fontSize: "1.05rem" }}>
                                            {formatINR(totals.cashIn - totals.salesRet - totals.expPaid)}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#000000", fontSize: "1.05rem" }}>
                                            {formatINR(totals.cardIn)}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: totals.netRev < 0 ? "#dc2626" : "#000000", fontSize: "1.08rem" }}>
                                            {formatINR(totals.netRev)}
                                        </td>
                                    </GrandTotalTr>
                                )}
                            </tbody>
                        </table>
                    </CompactTableWrapper>

                    <ReportPrintFooter />
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterBillWiseReport;
