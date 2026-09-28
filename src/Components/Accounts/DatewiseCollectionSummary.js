import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker, Spin, Tooltip } from "antd";
import { 
    FaPrint, 
    FaFileExcel, 
    FaSearch, 
    FaCalendarAlt, 
    FaSyncAlt, 
    FaMoneyBillWave,
    FaUniversity,
    FaReceipt,
    FaPercentage
} from "react-icons/fa";
import * as XLSX from "xlsx";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { 
    PageWrapper, 
    colors, 
    fadeIn, 
    FormRow, 
    InputWrapper, 
    Label, 
    Input, 
    Select, 
    Button, 
    TableWrapper, 
    Table, 
    Th, 
    Td, 
    Tr, 
    SectionTitle 
} from "../GlobalStyles";
import { printAccountsReport } from "./printAccountsReport";

// ─── STYLED COMPONENTS ───────────────────────────────────────────────────────
const ReportHeaderCard = styled.div`
    background: ${colors.surface || "#ffffff"};
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid ${colors.borderLight || "#e2e8f0"};
`;

const KPIContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
`;

const KPICard = styled.div`
    background: ${colors.surface || "#ffffff"};
    border-radius: 10px;
    padding: 16px;
    border-left: 4px solid ${props => props.color || colors.primary || "#2563eb"};
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    justify-content: center;

    .title {
        font-size: 0.78rem;
        font-weight: 600;
        color: ${colors.textMuted || "#64748b"};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
    }

    .value {
        font-size: 1.25rem;
        font-weight: 700;
        color: ${props => props.color || colors.textMain || "#0f172a"};
    }

    .sub {
        font-size: 0.72rem;
        color: ${colors.textMuted || "#94a3b8"};
        margin-top: 2px;
    }
`;

const ControlsBar = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 14px;
    margin-bottom: 16px;
`;

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

// Helper format number
const formatCurr = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const DatewiseCollectionSummary = ({ 
    isModalView = false, 
    initialStartDate, 
    initialEndDate, 
    startDate, 
    endDate, 
    initialBillType, 
    billType, 
    category, 
    initialOutlet, 
    outlet 
}) => {
    // ─── STATE ───────────────────────────────────────────────────────────────
    const todayStr = dayjs().format("YYYY-MM-DD");
    const [fromDate, setFromDate] = useState(startDate || initialStartDate || todayStr);
    const [toDate, setToDate] = useState(endDate || initialEndDate || todayStr);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(
        (billType || initialBillType || category) && (billType || initialBillType || category) !== "All" && (billType || initialBillType || category) !== "all" 
            ? (billType || initialBillType || category) 
            : "all"
    );
    const [loading, setLoading] = useState(false);
    const [rawData, setRawData] = useState([]);

    useEffect(() => {
        if (startDate || initialStartDate) setFromDate(startDate || initialStartDate);
        if (endDate || initialEndDate) setToDate(endDate || initialEndDate);
        const cat = billType || initialBillType || category;
        if (cat) {
            setSelectedCategory(cat === "All" || cat === "all" ? "all" : cat);
        }
    }, [startDate, initialStartDate, endDate, initialEndDate, initialBillType, billType, category]);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "/_b_a_c_k_e_n_d/HMS/";
    const hospitalName = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
    const hospitalAddress = localStorage.getItem("hospital_address") || "51/24.Saradha College Road, Salem - 636007";
    const hospitalPhone = localStorage.getItem("hospital_phone") || "04272706666";

    // ─── FETCH DATA ──────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        if (!fromDate || !toDate) {
            toast.warning("Please select both From Date and To Date");
            return;
        }

        setLoading(true);
        try {
            const selectedOutlet = outlet || initialOutlet;
            let url = `${HmsBaseUrl}date_wise_collection_summary_report/?from_date=${fromDate}&to_date=${toDate}`;
            if (selectedOutlet && selectedOutlet !== "All" && selectedOutlet !== "all") {
                url += `&outlet_code=${encodeURIComponent(selectedOutlet)}`;
            }
            const res = await apiRequest(url, "GET");

            if (res && res.success && Array.isArray(res.data)) {
                setRawData(res.data);
            } else if (res && Array.isArray(res.data?.data)) {
                setRawData(res.data.data);
            } else if (Array.isArray(res)) {
                setRawData(res);
            } else {
                setRawData([]);
            }
        } catch (err) {
            console.error("Error fetching collection summary:", err);
            toast.error("Failed to load collection summary report");
            setRawData([]);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, outlet, initialOutlet, HmsBaseUrl]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
                        gross: 0, discount: 0, bill_adv: 0, ip_return: 0,
                        sales_ret: 0, ip_credit: 0, p_debit: 0, debit_col: 0,
                        adv_refd: 0, net_amount: 0, cash: 0, bank: 0
                    }
                };
            }

            const gross = Number(row.gross_amount) || 0;
            const discount = Number(row.discount) || 0;
            const billAdv = Number(row.bill_adv) || 0;
            const ipReturn = Number(row.ip_return) || 0;
            const salesRet = Number(row.sales_ret) || 0;
            const ipCredit = Number(row.ip_credit) || 0;
            const pDebit = Number(row.p_debit) || 0;
            const debitCol = Number(row.debit_col) || 0;
            const advRefd = Number(row.adv_refd) || 0;
            const net = Number(row.net_amount) || 0;
            const cash = Number(row.cash) || 0;
            const bank = Number(row.bank) || 0;

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
                        "Gross Amount": Number(item.gross_amount || 0),
                        "Discount": Number(item.discount || 0),
                        "Bill Adv": Number(item.bill_adv || 0),
                        "Ip Return": Number(item.ip_return || 0),
                        "Sales Ret": Number(item.sales_ret || 0),
                        "Ip Credit": Number(item.ip_credit || 0),
                        "P.Debit": Number(item.p_debit || 0),
                        "Debit Col": Number(item.debit_col || 0),
                        "Adv Refd": Number(item.adv_refd || 0),
                        "Net Amount": Number(item.net_amount || 0),
                        "Cash": Number(item.cash || 0),
                        "Bank": Number(item.bank || 0)
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

            // Column Widths
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
            XLSX.writeFile(wb, `Datewise_Collection_Summary_${fromDate}_to_${toDate}.xlsx`);
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
        <PageWrapper style={{ padding: isModalView ? "0px" : "20px 24px" }}>
            {/* Header Title */}
            {!isModalView && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                        <SectionTitle style={{ margin: 0 }}>Date Wise Collection Summary Report</SectionTitle>
                        <div style={{ fontSize: "0.82rem", color: colors.textMuted || "#64748b", marginTop: "4px" }}>
                            Financial collection summary grouped by transaction type, discounts, returns, IP credits, and payment modes
                        </div>
                    </div>
                </div>
            )}

            {isModalView && (
                <div style={{ textAlign: "center", marginBottom: "16px", padding: "10px 0" }}>
                    <h2 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em", color: "#000" }}>
                        {hospitalName}
                    </h2>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111" }}>
                        Date-wise Collection Summary From {dayjs(fromDate).format("DD/MM/YYYY")} To {dayjs(toDate).format("DD/MM/YYYY")}.
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#333", marginTop: "2px" }}>
                        Printed As On {dayjs().format("DD/MM/YYYY HH:mm:ss")}.
                    </div>
                </div>
            )}

            {/* Controls Filter Bar & KPIs */}
            {!isModalView && (
                <ReportHeaderCard>
                    <ControlsBar>
                        <InputWrapper style={{ minWidth: "150px" }}>
                            <Label><FaCalendarAlt style={{ marginRight: 6 }} /> From Date</Label>
                            <DatePicker
                                value={fromDate ? dayjs(fromDate) : null}
                                onChange={(d) => setFromDate(d ? d.format("YYYY-MM-DD") : fromDate)}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ width: "100%", height: "38px", borderRadius: "6px" }}
                            />
                        </InputWrapper>

                        <InputWrapper style={{ minWidth: "150px" }}>
                            <Label><FaCalendarAlt style={{ marginRight: 6 }} /> To Date</Label>
                            <DatePicker
                                value={toDate ? dayjs(toDate) : null}
                                onChange={(d) => setToDate(d ? d.format("YYYY-MM-DD") : toDate)}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ width: "100%", height: "38px", borderRadius: "6px" }}
                            />
                        </InputWrapper>

                        <InputWrapper style={{ minWidth: "180px" }}>
                            <Label>Bill Category</Label>
                            <Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{ height: "38px" }}
                            >
                                <option value="all">All Categories ({categoriesList.length})</option>
                                {categoriesList.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </Select>
                        </InputWrapper>

                        <InputWrapper style={{ flex: "1 1 200px" }}>
                            <Label><FaSearch style={{ marginRight: 6 }} /> Search Bill Name / Range</Label>
                            <Input
                                type="text"
                                placeholder="e.g. DISCHARGE, 2627/002173, LAB BILL..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ height: "38px" }}
                            />
                        </InputWrapper>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <Button 
                                onClick={fetchData} 
                                disabled={loading}
                                style={{ height: "38px", display: "flex", alignItems: "center", gap: "6px" }}
                            >
                                <FaSyncAlt className={loading ? "fa-spin" : ""} /> {loading ? "Loading..." : "Search"}
                            </Button>
                            <Button 
                                secondary 
                                onClick={handleExportExcel}
                                style={{ height: "38px", display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#107c41", color: "#fff", borderColor: "#107c41" }}
                            >
                                <FaFileExcel /> Excel
                            </Button>
                            <Button 
                                secondary 
                                onClick={handlePrint}
                                style={{ height: "38px", display: "flex", alignItems: "center", gap: "6px" }}
                            >
                                <FaPrint /> Print
                            </Button>
                        </div>
                    </ControlsBar>

                    {/* KPI Summary Cards */}
                    <KPIContainer>
                        <KPICard color="#2563eb">
                            <div className="title">Gross Amount</div>
                            <div className="value">₹{formatCurr(grandTotals.gross)}</div>
                            <div className="sub">Total Billing Volume</div>
                        </KPICard>

                        <KPICard color="#e11d48">
                            <div className="title">Discounts & Credits</div>
                            <div className="value">₹{formatCurr(grandTotals.discount + grandTotals.ip_credit)}</div>
                            <div className="sub">Disc: ₹{formatCurr(grandTotals.discount)} | Credit: ₹{formatCurr(grandTotals.ip_credit)}</div>
                        </KPICard>

                        <KPICard color="#059669">
                            <div className="title">Net Collection</div>
                            <div className="value">₹{formatCurr(grandTotals.net_amount)}</div>
                            <div className="sub">Settled Inflow</div>
                        </KPICard>

                        <KPICard color="#0284c7">
                            <div className="title">Cash Collection</div>
                            <div className="value">₹{formatCurr(grandTotals.cash)}</div>
                            <div className="sub">Direct Counter Cash</div>
                        </KPICard>

                        <KPICard color="#7c3aed">
                            <div className="title">Bank Collection</div>
                            <div className="value">₹{formatCurr(grandTotals.bank)}</div>
                            <div className="sub">UPI / Card / Online</div>
                        </KPICard>
                    </KPIContainer>
                </ReportHeaderCard>
            )}

            {/* Printable & Visible Report Table Area */}
            <div id="printable-collection-summary">
                {/* Formal Print Header */}
                <div className="print-only-header" style={{ display: "none", textAlign: "center", marginBottom: "16px" }}>
                    <h2 style={{ margin: 0, fontSize: "16pt", fontWeight: "bold", textTransform: "uppercase" }}>{hospitalName}</h2>
                    <p style={{ margin: "2px 0", fontSize: "9pt" }}>{hospitalAddress}</p>
                    <p style={{ margin: "2px 0", fontSize: "9pt" }}>Ph : {hospitalPhone}</p>
                    <h3 style={{ margin: "8px 0 0 0", fontSize: "11pt", fontWeight: "bold" }}>
                        Date Wise Collection Summary Report From {dayjs(fromDate).format("DD/MM/YYYY")} To {dayjs(toDate).format("DD/MM/YYYY")}
                    </h3>
                </div>

                <TableWrapper style={{ overflowX: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderRadius: "8px" }}>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "60px 0" }}>
                            <Spin size="large" />
                            <div style={{ marginTop: 12, color: "#64748b", fontSize: "0.85rem" }}>Loading collection summary...</div>
                        </div>
                    ) : groupedData.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "50px 0", color: "#64748b" }}>
                            <FaReceipt size={36} style={{ opacity: 0.4, marginBottom: "10px" }} />
                            <div style={{ fontSize: "1rem", fontWeight: 600 }}>No collection records found</div>
                            <div style={{ fontSize: "0.82rem" }}>Try adjusting the date range or search filters above.</div>
                        </div>
                    ) : (
                        <Table style={{ fontSize: "0.78rem", borderCollapse: "collapse", width: "100%" }}>
                            <thead>
                                <Tr style={{ background: "#f8fafc", borderBottom: "2px solid #0f172a" }}>
                                    <Th style={{ width: "45px", textAlign: "center" }}>Slno</Th>
                                    <Th style={{ minWidth: "180px", textAlign: "left" }}>Bill Name</Th>
                                    <Th style={{ textAlign: "right" }}>Gross Amount</Th>
                                    <Th style={{ textAlign: "right" }}>Discount</Th>
                                    <Th style={{ textAlign: "right" }}>Bill Adv</Th>
                                    <Th style={{ textAlign: "right" }}>Ip Return</Th>
                                    <Th style={{ textAlign: "right" }}>Sales Ret</Th>
                                    <Th style={{ textAlign: "right" }}>Ip Credit</Th>
                                    <Th style={{ textAlign: "right" }}>P.Debit</Th>
                                    <Th style={{ textAlign: "right" }}>Debit Col</Th>
                                    <Th style={{ textAlign: "right" }}>Adv Refd</Th>
                                    <Th style={{ textAlign: "right", fontWeight: "bold" }}>Net Amount</Th>
                                    <Th style={{ textAlign: "right" }}>Cash</Th>
                                    <Th style={{ textAlign: "right" }}>Bank</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {groupedData.map((group) => (
                                    <React.Fragment key={group.date}>
                                        {/* Date Group Header */}
                                        <DateGroupRow>
                                            <td colSpan={14}>
                                                <strong>{group.date}</strong>
                                            </td>
                                        </DateGroupRow>

                                        {/* Group Items */}
                                        {group.items.map((row, idx) => (
                                            <Tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                <Td style={{ textAlign: "center", verticalAlign: "top" }}>{idx + 1}</Td>
                                                <Td style={{ verticalAlign: "top" }}>
                                                    <div style={{ fontWeight: 600, color: "#1e293b" }}>
                                                        {row.bill_name}
                                                    </div>
                                                    {row.bill_range && (
                                                        <BillSubText>{row.bill_range}</BillSubText>
                                                    )}
                                                </Td>
                                                <Td style={{ textAlign: "right", verticalAlign: "top" }}>{formatCurr(row.gross_amount)}</Td>
                                                <Td style={{ textAlign: "right", verticalAlign: "top" }}>{formatCurr(row.discount)}</Td>
                                                <Td style={{ textAlign: "right", verticalAlign: "top" }}>{formatCurr(row.bill_adv)}</Td>
                                                <Td style={{ textAlign: "right", verticalAlign: "top" }}>{formatCurr(row.ip_return)}</Td>
                                                <Td style={{ textAlign: "right", verticalAlign: "top" }}>{formatCurr(row.sales_ret)}</Td>
                                                <Td style={{ textAlign: "right", verticalAlign: "top" }}>{formatCurr(row.ip_credit)}</Td>
                                                <Td style={{ textAlign: "right", verticalAlign: "top" }}>{formatCurr(row.p_debit)}</Td>
                                                <Td style={{ textAlign: "right", verticalAlign: "top" }}>{formatCurr(row.debit_col)}</Td>
                                                <Td style={{ textAlign: "right", verticalAlign: "top" }}>{formatCurr(row.adv_refd)}</Td>
                                                <Td style={{ textAlign: "right", verticalAlign: "top", fontWeight: 700, color: (Number(row.net_amount) < 0 ? "#dc2626" : "#0f172a") }}>
                                                    {formatCurr(row.net_amount)}
                                                </Td>
                                                <Td style={{ textAlign: "right", verticalAlign: "top" }}>{formatCurr(row.cash)}</Td>
                                                <Td style={{ textAlign: "right", verticalAlign: "top" }}>{formatCurr(row.bank)}</Td>
                                            </Tr>
                                        ))}

                                        {/* Date Subtotal Row */}
                                        <SubtotalRow>
                                            <td style={{ textAlign: "center" }}></td>
                                            <td><strong>Total</strong></td>
                                            <td style={{ textAlign: "right" }}>{formatCurr(group.totals.gross)}</td>
                                            <td style={{ textAlign: "right" }}>{formatCurr(group.totals.discount)}</td>
                                            <td style={{ textAlign: "right" }}>{formatCurr(group.totals.bill_adv)}</td>
                                            <td style={{ textAlign: "right" }}>{formatCurr(group.totals.ip_return)}</td>
                                            <td style={{ textAlign: "right" }}>{formatCurr(group.totals.sales_ret)}</td>
                                            <td style={{ textAlign: "right" }}>{formatCurr(group.totals.ip_credit)}</td>
                                            <td style={{ textAlign: "right" }}>{formatCurr(group.totals.p_debit)}</td>
                                            <td style={{ textAlign: "right" }}>{formatCurr(group.totals.debit_col)}</td>
                                            <td style={{ textAlign: "right" }}>{formatCurr(group.totals.adv_refd)}</td>
                                            <td style={{ textAlign: "right" }}>{formatCurr(group.totals.net_amount)}</td>
                                            <td style={{ textAlign: "right" }}>{formatCurr(group.totals.cash)}</td>
                                            <td style={{ textAlign: "right" }}>{formatCurr(group.totals.bank)}</td>
                                        </SubtotalRow>
                                    </React.Fragment>
                                ))}

                                {/* Final Grand Total Row */}
                                <GrandTotalRow>
                                    <td style={{ textAlign: "center" }}></td>
                                    <td><strong>Grand Total</strong></td>
                                    <td style={{ textAlign: "right" }}>{formatCurr(grandTotals.gross)}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurr(grandTotals.discount)}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurr(grandTotals.bill_adv)}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurr(grandTotals.ip_return)}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurr(grandTotals.sales_ret)}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurr(grandTotals.ip_credit)}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurr(grandTotals.p_debit)}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurr(grandTotals.debit_col)}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurr(grandTotals.adv_refd)}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurr(grandTotals.net_amount)}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurr(grandTotals.cash)}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurr(grandTotals.bank)}</td>
                                </GrandTotalRow>
                            </tbody>
                        </Table>
                    )}
                </TableWrapper>
            </div>
        </PageWrapper>
    );
};

export default DatewiseCollectionSummary;
