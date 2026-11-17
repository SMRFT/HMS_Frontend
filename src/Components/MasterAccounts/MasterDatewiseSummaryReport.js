import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DatePicker, Select, Input, Button, Spin } from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import styled from "styled-components";
import { Printer, Download, RefreshCw, Calendar, Search } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import {
    formatINR,
    cleanNum,
    ReportPageWrapper,
    ControlCard,
    HeaderBar,
    FilterBar,
    KPIGrid,
    KPICard,
    DataTableWrapper
} from "./masterAccountsHelper";
import { printAccountsReport } from "../Accounts/printAccountsReport";

const { Option } = Select;

// ─── STYLED COMPONENTS ───────────────────────────────────────────────────────
const DateGroupRow = styled.tr`
    background: #f1f5f9 !important;
    font-weight: 700;
    color: #1e293b;
    border-top: 2px solid #cbd5e1;
    border-bottom: 1px solid #cbd5e1;

    td {
        padding: 8px 12px !important;
        font-size: 0.88rem !important;
        letter-spacing: 0.3px;
    }
`;

const SubtotalRow = styled.tr`
    background: #f8fafc !important;
    font-weight: 700;
    color: #0f172a;
    border-top: 1px solid #94a3b8;
    border-bottom: 2px solid #64748b;

    td {
        padding: 7px 8px !important;
        font-size: 0.82rem !important;
    }
`;

const GrandTotalRow = styled.tr`
    background: #e2e8f0 !important;
    font-weight: 800;
    color: #000000;
    border-top: 2px solid #000;
    border-bottom: 3px double #000;

    td {
        padding: 9px 8px !important;
        font-size: 0.86rem !important;
    }
`;

const BillSubText = styled.div`
    font-size: 0.72rem;
    color: #64748b;
    font-weight: 500;
    margin-top: 2px;
    letter-spacing: 0.2px;
`;

const PrintSignatures = styled.div`
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;

    .sig-box {
        text-align: center;
        width: 180px;
        border-top: 1px solid #333;
        padding-top: 6px;
        font-weight: 600;
        font-size: 0.8rem;
    }
`;

const MasterDatewiseSummaryReport = ({
    isModalView = false,
    startDate,
    endDate,
    initialStartDate,
    initialEndDate,
    initialOutlet = "all",
    outlet: propOutlet
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "/_b_a_c_k_e_n_d/HMS/";
    const todayStr = dayjs().format("YYYY-MM-DD");

    const [fromDate, setFromDate] = useState(startDate || initialStartDate || todayStr);
    const [toDate, setToDate] = useState(endDate || initialEndDate || todayStr);
    const [outlet, setOutlet] = useState(propOutlet || initialOutlet || "all");
    const [outletsList, setOutletsList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [rawData, setRawData] = useState([]);
    const [financialSummary, setFinancialSummary] = useState(null);

    const hospitalName = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
    const hospitalAddress = localStorage.getItem("hospital_address") || "51/24.Saradha College Road, Salem - 636007";
    const hospitalPhone = localStorage.getItem("hospital_phone") || "04272706666";

    // Synchronize external date / outlet props
    useEffect(() => {
        if (startDate || initialStartDate) setFromDate(startDate || initialStartDate);
        if (endDate || initialEndDate) setToDate(endDate || initialEndDate);
    }, [startDate, initialStartDate, endDate, initialEndDate]);

    useEffect(() => {
        const out = propOutlet || initialOutlet;
        if (out !== undefined && out !== outlet) {
            setOutlet(out);
        }
    }, [propOutlet, initialOutlet, outlet]);

    // Fetch Outlets
    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const res = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
                if (res?.success && Array.isArray(res?.data)) {
                    setOutletsList(res.data);
                }
            } catch (e) {
                console.error("Error loading outlets:", e);
            }
        };
        fetchOutlets();
    }, [HmsBaseUrl]);

    // Fetch Date-Wise Summary Report Data
    const fetchReport = useCallback(async () => {
        if (!fromDate || !toDate) {
            toast.warning("Please select both From Date and To Date");
            return;
        }

        try {
            setLoading(true);
            let url = `${HmsBaseUrl}master-accounts/date-wise-collection-summary/?from_date=${fromDate}&to_date=${toDate}`;
            if (outlet && outlet !== "all" && outlet !== "All") {
                url += `&outlet_code=${encodeURIComponent(outlet)}`;
            }

            const res = await apiRequest(url, "GET");

            if (res && res.success && Array.isArray(res.data)) {
                setRawData(res.data);
                if (res.financial_summary) {
                    setFinancialSummary(res.financial_summary);
                }
            } else if (res && Array.isArray(res.data?.data)) {
                setRawData(res.data.data);
                if (res.data?.financial_summary) {
                    setFinancialSummary(res.data.financial_summary);
                }
            } else if (Array.isArray(res)) {
                setRawData(res);
            } else {
                setRawData([]);
                setFinancialSummary(null);
            }
        } catch (err) {
            console.error("Date Wise Summary Error:", err);
            toast.error("Failed to load date-wise collection summary");
            setRawData([]);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, outlet, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // ─── GROUP & FILTER DATA ─────────────────────────────────────────────────
    const { groupedData, grandTotals, categoriesList } = useMemo(() => {
        const safeRawData = Array.isArray(rawData) ? rawData : [];
        const categoriesSet = new Set();
        let filtered = [...safeRawData];

        // Search term filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(item =>
                (item.bill_name || "").toLowerCase().includes(term) ||
                (item.bill_range || "").toLowerCase().includes(term) ||
                (item.date || "").includes(term)
            );
        }

        // Category filter
        if (selectedCategory !== "all") {
            filtered = filtered.filter(item =>
                (item.bill_name || "").toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // Collect all distinct categories for filter dropdown
        safeRawData.forEach(item => {
            if (item.bill_name) categoriesSet.add(item.bill_name);
        });

        // Group by Date
        const groups = {};
        const gTotals = {
            gross: 0,
            discount: 0,
            bill_adv: 0,
            ip_return: 0,
            sales_ret: 0,
            ip_credit: 0,
            p_debit: 0,
            debit_col: 0,
            adv_refd: 0,
            net_amount: 0,
            cash: 0,
            bank: 0
        };

        filtered.forEach(row => {
            const d = row.date ? dayjs(row.date).format("DD/MM/YYYY") : "UNKNOWN DATE";
            if (!groups[d]) {
                groups[d] = {
                    date: d,
                    items: [],
                    totals: {
                        gross: 0,
                        discount: 0,
                        bill_adv: 0,
                        ip_return: 0,
                        sales_ret: 0,
                        ip_credit: 0,
                        p_debit: 0,
                        debit_col: 0,
                        adv_refd: 0,
                        net_amount: 0,
                        cash: 0,
                        bank: 0
                    }
                };
            }

            const gross = cleanNum(row.gross_amount);
            const discount = cleanNum(row.discount);
            const billAdv = cleanNum(row.bill_adv);
            const ipReturn = cleanNum(row.ip_return);
            const salesRet = cleanNum(row.sales_ret);
            const ipCredit = cleanNum(row.ip_credit);
            const pDebit = cleanNum(row.p_debit);
            const debitCol = cleanNum(row.debit_col);
            const advRefd = cleanNum(row.adv_refd);
            const net = cleanNum(row.net_amount);
            const cash = cleanNum(row.cash);
            const bank = cleanNum(row.bank);

            groups[d].items.push(row);

            // Date Subtotals
            groups[d].totals.gross += gross;
            groups[d].totals.discount += discount;
            groups[d].totals.bill_adv += billAdv;
            groups[d].totals.ip_return += ipReturn;
            groups[d].totals.sales_ret += salesRet;
            groups[d].totals.ip_credit += ipCredit;
            groups[d].totals.p_debit += pDebit;
            groups[d].totals.debit_col += debitCol;
            groups[d].totals.adv_refd += advRefd;
            groups[d].totals.net_amount += net;
            groups[d].totals.cash += cash;
            groups[d].totals.bank += bank;

            // Grand Totals
            gTotals.gross += gross;
            gTotals.discount += discount;
            gTotals.bill_adv += billAdv;
            gTotals.ip_return += ipReturn;
            gTotals.sales_ret += salesRet;
            gTotals.ip_credit += ipCredit;
            gTotals.p_debit += pDebit;
            gTotals.debit_col += debitCol;
            gTotals.adv_refd += advRefd;
            gTotals.net_amount += net;
            gTotals.cash += cash;
            gTotals.bank += bank;
        });

        return {
            groupedData: Object.values(groups),
            grandTotals: gTotals,
            categoriesList: Array.from(categoriesSet).sort()
        };
    }, [rawData, searchTerm, selectedCategory]);

    // ─── EXPORT EXCEL ────────────────────────────────────────────────────────
    const handleExportExcel = () => {
        if (!rawData || rawData.length === 0) {
            toast.warning("No data available to export");
            return;
        }

        try {
            const exportRows = [];

            // Title Rows
            exportRows.push({ "Slno": hospitalName });
            exportRows.push({ "Slno": `${hospitalAddress} | Ph: ${hospitalPhone}` });
            exportRows.push({
                "Slno": `Date Wise Collection Summary Report From ${dayjs(fromDate).format("DD/MM/YYYY")} To ${dayjs(toDate).format("DD/MM/YYYY")}`
            });
            exportRows.push({}); // blank line

            groupedData.forEach(group => {
                exportRows.push({ "Slno": `DATE: ${group.date}` });

                group.items.forEach((item, idx) => {
                    exportRows.push({
                        "Slno": idx + 1,
                        "Bill Name": `${item.bill_name || ""}${item.bill_range ? ` (${item.bill_range})` : ""}`,
                        "Gross Amount": Number(cleanNum(item.gross_amount).toFixed(2)),
                        "Discount": Number(cleanNum(item.discount).toFixed(2)),
                        "Bill Adv": Number(cleanNum(item.bill_adv).toFixed(2)),
                        "Ip Return": Number(cleanNum(item.ip_return).toFixed(2)),
                        "Sales Ret": Number(cleanNum(item.sales_ret).toFixed(2)),
                        "Ip Credit": Number(cleanNum(item.ip_credit).toFixed(2)),
                        "P.Debit": Number(cleanNum(item.p_debit).toFixed(2)),
                        "Debit Col": Number(cleanNum(item.debit_col).toFixed(2)),
                        "Adv Refd": Number(cleanNum(item.adv_refd).toFixed(2)),
                        "Net Amount": Number(cleanNum(item.net_amount).toFixed(2)),
                        "Cash": Number(cleanNum(item.cash).toFixed(2)),
                        "Bank": Number(cleanNum(item.bank).toFixed(2))
                    });
                });

                // Group Subtotal Row
                exportRows.push({
                    "Slno": "",
                    "Bill Name": `Total (${group.date})`,
                    "Gross Amount": Number(group.totals.gross.toFixed(2)),
                    "Discount": Number(group.totals.discount.toFixed(2)),
                    "Bill Adv": Number(group.totals.bill_adv.toFixed(2)),
                    "Ip Return": Number(group.totals.ip_return.toFixed(2)),
                    "Sales Ret": Number(group.totals.sales_ret.toFixed(2)),
                    "Ip Credit": Number(group.totals.ip_credit.toFixed(2)),
                    "P.Debit": Number(group.totals.p_debit.toFixed(2)),
                    "Debit Col": Number(group.totals.debit_col.toFixed(2)),
                    "Adv Refd": Number(group.totals.adv_refd.toFixed(2)),
                    "Net Amount": Number(group.totals.net_amount.toFixed(2)),
                    "Cash": Number(group.totals.cash.toFixed(2)),
                    "Bank": Number(group.totals.bank.toFixed(2))
                });
                exportRows.push({}); // space
            });

            // Grand Total Row
            exportRows.push({
                "Slno": "",
                "Bill Name": "Grand Total",
                "Gross Amount": Number(grandTotals.gross.toFixed(2)),
                "Discount": Number(grandTotals.discount.toFixed(2)),
                "Bill Adv": Number(grandTotals.bill_adv.toFixed(2)),
                "Ip Return": Number(grandTotals.ip_return.toFixed(2)),
                "Sales Ret": Number(grandTotals.sales_ret.toFixed(2)),
                "Ip Credit": Number(grandTotals.ip_credit.toFixed(2)),
                "P.Debit": Number(grandTotals.p_debit.toFixed(2)),
                "Debit Col": Number(grandTotals.debit_col.toFixed(2)),
                "Adv Refd": Number(grandTotals.adv_refd.toFixed(2)),
                "Net Amount": Number(grandTotals.net_amount.toFixed(2)),
                "Cash": Number(grandTotals.cash.toFixed(2)),
                "Bank": Number(grandTotals.bank.toFixed(2))
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportRows);

            ws["!cols"] = [
                { wch: 6 },   // Slno
                { wch: 34 },  // Bill Name
                { wch: 14 },  // Gross
                { wch: 12 },  // Discount
                { wch: 12 },  // Bill Adv
                { wch: 12 },  // Ip Return
                { wch: 12 },  // Sales Ret
                { wch: 14 },  // Ip Credit
                { wch: 10 },  // P.Debit
                { wch: 10 },  // Debit Col
                { wch: 10 },  // Adv Refd
                { wch: 14 },  // Net Amount
                { wch: 12 },  // Cash
                { wch: 12 }   // Bank
            ];

            XLSX.utils.book_append_sheet(wb, ws, "Collection Summary");
            XLSX.writeFile(wb, `Master_Datewise_Collection_Summary_${fromDate}_to_${toDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (e) {
            console.error("Excel Export Error:", e);
            toast.error("Failed to export Excel file");
        }
    };

    // ─── PRINT HANDLER ───────────────────────────────────────────────────────
    const handlePrint = () => {
        printAccountsReport("printable-collection-summary", "landscape");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                Date-Wise Collection Summary
                                <span className="badge">Daily Ledger</span>
                            </h1>
                            <p>Financial collection summary grouped by transaction type, discounts, returns, IP credits, and payment modes</p>
                        </div>
                        <div className="btn-group no-print">
                            <Button
                                style={{ backgroundColor: "#107c41", color: "#fff", borderColor: "#107c41" }}
                                icon={<Download size={15} />}
                                onClick={handleExportExcel}
                            >
                                Excel
                            </Button>
                            <Button
                                type="primary"
                                icon={<Printer size={15} />}
                                onClick={handlePrint}
                            >
                                Print
                            </Button>
                        </div>
                    </HeaderBar>

                    <FilterBar className="no-print">
                        <div className="filter-item">
                            <label><Calendar size={13} style={{ marginRight: 4 }} /> From Date:</label>
                            <DatePicker
                                value={fromDate ? dayjs(fromDate) : null}
                                onChange={(d) => setFromDate(d ? d.format("YYYY-MM-DD") : fromDate)}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ height: "36px" }}
                            />
                        </div>

                        <div className="filter-item">
                            <label><Calendar size={13} style={{ marginRight: 4 }} /> To Date:</label>
                            <DatePicker
                                value={toDate ? dayjs(toDate) : null}
                                onChange={(d) => setToDate(d ? d.format("YYYY-MM-DD") : toDate)}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ height: "36px" }}
                            />
                        </div>

                        <div className="filter-item">
                            <label>Outlet:</label>
                            <Select value={outlet} onChange={setOutlet} style={{ width: 160, height: "36px" }}>
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
                            <Select
                                value={selectedCategory}
                                onChange={setSelectedCategory}
                                style={{ width: 200, height: "36px" }}
                            >
                                <Option value="all">All Categories ({categoriesList.length})</Option>
                                {categoriesList.map(cat => (
                                    <Option key={cat} value={cat}>{cat}</Option>
                                ))}
                            </Select>
                        </div>

                        <div className="filter-item" style={{ flex: "1 1 200px" }}>
                            <label><Search size={13} style={{ marginRight: 4 }} /> Search:</label>
                            <Input
                                placeholder="e.g. DISCHARGE, 2627/002173, LAB BILL..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ height: "36px" }}
                            />
                        </div>

                        <Button
                            icon={<RefreshCw size={14} className={loading ? "fa-spin" : ""} />}
                            onClick={fetchReport}
                            loading={loading}
                            style={{ height: "36px" }}
                        >
                            Refresh
                        </Button>
                    </FilterBar>

                    {/* KPI Summary Cards */}
                    <KPIGrid className="no-print" style={{ marginTop: "16px" }}>
                        <KPICard $border="#2563eb">
                            <span className="kpi-title">Gross Amount</span>
                            <span className="kpi-value" style={{ color: "#2563eb" }}>₹{formatINR(grandTotals.gross)}</span>
                            <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>Total Billing Volume</span>
                        </KPICard>

                        <KPICard $border="#e11d48">
                            <span className="kpi-title">Discounts & Credits</span>
                            <span className="kpi-value" style={{ color: "#e11d48" }}>₹{formatINR(grandTotals.discount + grandTotals.ip_credit)}</span>
                            <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
                                Disc: ₹{formatINR(grandTotals.discount)} | Credit: ₹{formatINR(grandTotals.ip_credit)}
                            </span>
                        </KPICard>

                        <KPICard $border="#059669">
                            <span className="kpi-title">Net Collection</span>
                            <span className="kpi-value" style={{ color: "#059669" }}>₹{formatINR(grandTotals.net_amount)}</span>
                            <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>Settled Inflow</span>
                        </KPICard>

                        <KPICard $border="#0284c7">
                            <span className="kpi-title">Cash Collection</span>
                            <span className="kpi-value" style={{ color: "#0284c7" }}>₹{formatINR(grandTotals.cash)}</span>
                            <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>Direct Counter Cash</span>
                        </KPICard>

                        <KPICard $border="#7c3aed">
                            <span className="kpi-title">Bank Collection</span>
                            <span className="kpi-value" style={{ color: "#7c3aed" }}>₹{formatINR(grandTotals.bank)}</span>
                            <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>UPI / Card / Online</span>
                        </KPICard>
                    </KPIGrid>

                    {financialSummary && (
                        <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", background: "#f1f5f9", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center" }} className="no-print">
                            <div>
                                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>GROSS CASH</div>
                                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#16a34a" }}>₹{formatINR(financialSummary.gross_cash)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>EXPENSES PAID</div>
                                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#dc2626" }}>{financialSummary.expenses_paid > 0 ? `-₹${formatINR(financialSummary.expenses_paid)}` : "₹0.00"}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>SALES RETURN</div>
                                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#dc2626" }}>{financialSummary.sales_return > 0 ? `-₹${formatINR(financialSummary.sales_return)}` : "₹0.00"}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>CLOSING BAL</div>
                                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>₹{formatINR(financialSummary.closing_cash)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>CARD & BANK</div>
                                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2563eb" }}>₹{formatINR(financialSummary.card_and_bank)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>CREDIT / TPA</div>
                                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#64748b" }}>₹{formatINR(financialSummary.credit_tpa)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>TOTAL COLL.</div>
                                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0284c7" }}>₹{formatINR(financialSummary.total_collection)}</div>
                            </div>
                        </div>
                    )}
                </ControlCard>
            )}

            {loading ? (
                <div style={{ padding: "60px", textAlign: "center" }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 12, color: "#64748b", fontSize: "0.85rem" }}>Loading collection summary...</div>
                </div>
            ) : (
                <div id="printable-collection-summary">
                    {/* Formal Print Header */}
                    <div className="report-header" style={{ display: "none", textAlign: "center", marginBottom: "16px" }}>
                        <h1>{hospitalName}</h1>
                        <p>{hospitalAddress} | Ph : {hospitalPhone}</p>
                        <div className="report-title">
                            Date Wise Collection Summary Report From {dayjs(fromDate).format("DD/MM/YYYY")} To {dayjs(toDate).format("DD/MM/YYYY")}
                        </div>
                    </div>

                    <DataTableWrapper>
                        <table style={{ fontSize: "0.78rem", borderCollapse: "collapse", width: "100%" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #0f172a" }}>
                                    <th style={{ width: "45px", textAlign: "center" }}>Slno</th>
                                    <th style={{ minWidth: "180px", textAlign: "left" }}>Bill Name</th>
                                    <th style={{ textAlign: "right" }}>Gross Amount</th>
                                    <th style={{ textAlign: "right" }}>Discount</th>
                                    <th style={{ textAlign: "right" }}>Bill Adv</th>
                                    <th style={{ textAlign: "right" }}>Ip Return</th>
                                    <th style={{ textAlign: "right" }}>Sales Ret</th>
                                    <th style={{ textAlign: "right" }}>Ip Credit</th>
                                    <th style={{ textAlign: "right" }}>P.Debit</th>
                                    <th style={{ textAlign: "right" }}>Debit Col</th>
                                    <th style={{ textAlign: "right" }}>Adv Refd</th>
                                    <th style={{ textAlign: "right", fontWeight: "bold" }}>Net Amount</th>
                                    <th style={{ textAlign: "right" }}>Cash</th>
                                    <th style={{ textAlign: "right" }}>Bank</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={14} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                                            No collection records found for the selected criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    groupedData.map((group) => (
                                        <React.Fragment key={group.date}>
                                            {/* Date Group Header */}
                                            <DateGroupRow>
                                                <td colSpan={14}>
                                                    <strong>{group.date}</strong>
                                                </td>
                                            </DateGroupRow>

                                            {/* Items for this Date */}
                                            {group.items.map((row, idx) => (
                                                <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                    <td style={{ textAlign: "center", verticalAlign: "top" }}>{idx + 1}</td>
                                                    <td style={{ verticalAlign: "top" }}>
                                                        <div style={{ fontWeight: 600, color: "#1e293b" }}>
                                                            {row.bill_name}
                                                        </div>
                                                        {row.bill_range && (
                                                            <BillSubText>{row.bill_range}</BillSubText>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: "right", verticalAlign: "top" }}>{formatINR(row.gross_amount)}</td>
                                                    <td style={{ textAlign: "right", verticalAlign: "top" }}>{formatINR(row.discount)}</td>
                                                    <td style={{ textAlign: "right", verticalAlign: "top" }}>{formatINR(row.bill_adv)}</td>
                                                    <td style={{ textAlign: "right", verticalAlign: "top" }}>{formatINR(row.ip_return)}</td>
                                                    <td style={{ textAlign: "right", verticalAlign: "top" }}>{formatINR(row.sales_ret)}</td>
                                                    <td style={{ textAlign: "right", verticalAlign: "top" }}>{formatINR(row.ip_credit)}</td>
                                                    <td style={{ textAlign: "right", verticalAlign: "top" }}>{formatINR(row.p_debit)}</td>
                                                    <td style={{ textAlign: "right", verticalAlign: "top" }}>{formatINR(row.debit_col)}</td>
                                                    <td style={{ textAlign: "right", verticalAlign: "top" }}>{formatINR(row.adv_refd)}</td>
                                                    <td style={{ textAlign: "right", verticalAlign: "top", fontWeight: 700, color: (cleanNum(row.net_amount) < 0 ? "#dc2626" : "#0f172a") }}>
                                                        {formatINR(row.net_amount)}
                                                    </td>
                                                    <td style={{ textAlign: "right", verticalAlign: "top" }}>{formatINR(row.cash)}</td>
                                                    <td style={{ textAlign: "right", verticalAlign: "top" }}>{formatINR(row.bank)}</td>
                                                </tr>
                                            ))}

                                            {/* Date Subtotal Row */}
                                            <SubtotalRow>
                                                <td style={{ textAlign: "center" }}></td>
                                                <td><strong>Total</strong></td>
                                                <td style={{ textAlign: "right" }}>{formatINR(group.totals.gross)}</td>
                                                <td style={{ textAlign: "right" }}>{formatINR(group.totals.discount)}</td>
                                                <td style={{ textAlign: "right" }}>{formatINR(group.totals.bill_adv)}</td>
                                                <td style={{ textAlign: "right" }}>{formatINR(group.totals.ip_return)}</td>
                                                <td style={{ textAlign: "right" }}>{formatINR(group.totals.sales_ret)}</td>
                                                <td style={{ textAlign: "right" }}>{formatINR(group.totals.ip_credit)}</td>
                                                <td style={{ textAlign: "right" }}>{formatINR(group.totals.p_debit)}</td>
                                                <td style={{ textAlign: "right" }}>{formatINR(group.totals.debit_col)}</td>
                                                <td style={{ textAlign: "right" }}>{formatINR(group.totals.adv_refd)}</td>
                                                <td style={{ textAlign: "right" }}>{formatINR(group.totals.net_amount)}</td>
                                                <td style={{ textAlign: "right" }}>{formatINR(group.totals.cash)}</td>
                                                <td style={{ textAlign: "right" }}>{formatINR(group.totals.bank)}</td>
                                            </SubtotalRow>
                                        </React.Fragment>
                                    ))
                                )}

                                {/* Final Grand Total Row */}
                                {groupedData.length > 0 && (
                                    <GrandTotalRow>
                                        <td style={{ textAlign: "center" }}></td>
                                        <td><strong>Grand Total</strong></td>
                                        <td style={{ textAlign: "right" }}>{formatINR(grandTotals.gross)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(grandTotals.discount)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(grandTotals.bill_adv)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(grandTotals.ip_return)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(grandTotals.sales_ret)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(grandTotals.ip_credit)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(grandTotals.p_debit)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(grandTotals.debit_col)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(grandTotals.adv_refd)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(grandTotals.net_amount)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(grandTotals.cash)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(grandTotals.bank)}</td>
                                    </GrandTotalRow>
                                )}
                            </tbody>
                        </table>
                    </DataTableWrapper>

                    <PrintSignatures className="signatures">
                        <div className="sig-box">Prepared By (Cashier)</div>
                        <div className="sig-box">Accounts Officer</div>
                        <div className="sig-box">Authorized Signatory</div>
                    </PrintSignatures>
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterDatewiseSummaryReport;
