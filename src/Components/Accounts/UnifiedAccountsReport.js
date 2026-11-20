import React, { useState, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { DatePicker, Select, Button, Spin, Tabs, Input, Tag } from "antd";
import dayjs from "dayjs";
import { 
    Printer, 
    Download, 
    Search, 
    RefreshCw, 
    CheckCircle2, 
    TrendingUp, 
    Wallet, 
    CreditCard, 
    Receipt, 
    Layers, 
    ArrowDownRight,
    ArrowUpRight,
    Building2,
    Calendar,
    FileSpreadsheet
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import * as XLSX from "xlsx";
import { printAccountsReport } from "./printAccountsReport";

const { RangePicker } = DatePicker;
const { Option } = Select;

// ==========================================
// STYLED COMPONENTS
// ==========================================
const Container = styled.div`
    padding: 20px 24px;
    background: #f8fafc;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
`;

const HeaderCard = styled.div`
    background: #ffffff;
    border-radius: 12px;
    padding: 20px 24px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    margin-bottom: 20px;
`;

const TitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
`;

const PageTitle = styled.h1`
    font-size: 1.45rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;

    span.badge {
        font-size: 0.75rem;
        background: #0ea5e9;
        color: #ffffff;
        padding: 3px 10px;
        border-radius: 20px;
        font-weight: 600;
    }
`;

const ActionButtonGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const FilterRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    background: #f1f5f9;
    padding: 12px 16px;
    border-radius: 8px;
`;

const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;

    label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
`;

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
`;

const StatCard = styled.div`
    background: #ffffff;
    border-radius: 10px;
    padding: 16px 20px;
    border: 1px solid ${props => props.borderColor || "#e2e8f0"};
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .info {
        .label {
            font-size: 0.78rem;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            margin-bottom: 4px;
        }
        .value {
            font-size: 1.4rem;
            font-weight: 700;
            color: ${props => props.textColor || "#0f172a"};
        }
        .subtext {
            font-size: 0.72rem;
            color: #94a3b8;
            margin-top: 2px;
        }
    }

    .icon-box {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: ${props => props.iconBg || "#f1f5f9"};
        color: ${props => props.iconColor || "#0f172a"};
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

const ContentCard = styled.div`
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

const TableWrapper = styled.div`
    overflow-x: auto;
    max-height: 600px;
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;

    th {
        position: sticky;
        top: 0;
        background: #f8fafc;
        color: #334155;
        font-weight: 600;
        text-align: left;
        padding: 10px 12px;
        border-bottom: 2px solid #e2e8f0;
        white-space: nowrap;
        z-index: 1;
    }

    td {
        padding: 8px 12px;
        border-bottom: 1px solid #f1f5f9;
        color: #1e293b;
        vertical-align: middle;
    }

    tr:hover td {
        background: #f8fafc;
    }

    .num-col {
        text-align: right;
        font-variant-numeric: tabular-nums;
    }
`;

const PrintArea = styled.div`
    display: none;

    @media print {
        display: block;
        background: #fff;
        padding: 10px;
        font-size: 10pt;

        @page {
            size: A4 landscape;
            margin: 10mm;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
        }

        th, td {
            border: 1px solid #cbd5e1;
            padding: 4px 6px;
        }

        th {
            background-color: #f1f5f9 !important;
            -webkit-print-color-adjust: exact;
        }
    }
`;

const formatINR = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

export default function UnifiedAccountsReport({ isModalView = false, startDate, endDate, initialOutlet = "all" }) {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "/_b_a_c_k_e_n_d/HMS/";
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs(),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(initialOutlet || "all");
    const [outletsList, setOutletsList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("bills");
    const printRef = useRef(null);

    useEffect(() => {
        if (startDate && endDate) {
            setDateRange([dayjs(startDate), dayjs(endDate)]);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        if (initialOutlet !== undefined && initialOutlet !== outlet) {
            setOutlet(initialOutlet);
        }
    }, [initialOutlet]);

    // Fetch Outlets
    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const res = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
                if (res?.success && Array.isArray(res?.data)) {
                    setOutletsList(res.data);
                }
            } catch (err) {
                // Fallback default list
                setOutletsList([
                    { outlet_code: "OLET003", outlet_name: "MAIN BLOCK" },
                    { outlet_code: "OLET001", outlet_name: "OP PHARMACY" },
                    { outlet_code: "OLET002", outlet_name: "IP PHARMACY" }
                ]);
            }
        };
        fetchOutlets();
    }, [HmsBaseUrl]);

    // Fetch Report Data
    const fetchReport = async () => {
        setLoading(true);
        try {
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}unified-accounts-report/?from_date=${fDate}&to_date=${tDate}&outlet_code=${outlet}`;
            const res = await apiRequest(url, "GET");
            if (res?.success && res?.data) {
                setData(res.data);
            }
        } catch (err) {
            console.error("Unified Accounts Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange, outlet]);

    // Filtered Bills
    const filteredBills = useMemo(() => {
        if (!data?.bills) return [];
        if (!searchQuery.trim()) return data.bills;
        const q = searchQuery.toLowerCase().trim();
        return data.bills.filter(b => 
            (b.bill_no && b.bill_no.toLowerCase().includes(q)) ||
            (b.patient_name && b.patient_name.toLowerCase().includes(q)) ||
            (b.uhid && b.uhid.toLowerCase().includes(q)) ||
            (b.ip_number && b.ip_number.toLowerCase().includes(q)) ||
            (b.category && b.category.toLowerCase().includes(q)) ||
            (b.cashier_name && b.cashier_name.toLowerCase().includes(q))
        );
    }, [data, searchQuery]);

    // Export Excel
    const exportToExcel = () => {
        if (!data) return;
        const wb = XLSX.utils.book_new();

        // Sheet 1: Financial Summary
        const summaryData = [
            ["UNIFIED ACCOUNTS & RECONCILIATION STATEMENT"],
            ["From Date", data.date_range?.from_date, "To Date", data.date_range?.to_date],
            ["Outlet", outlet],
            [],
            ["Metric", "Amount (INR)"],
            ["Gross Cash Collections", data.financial_summary?.gross_cash_collections],
            ["Less: Counter Expense Payments", data.financial_summary?.counter_expenses_paid],
            ["Net Cash Handed Over", data.financial_summary?.net_cash_handover],
            ["Card & Digital Collections", data.financial_summary?.card_and_bank_collections],
            ["Credit & Scheme Collections", data.financial_summary?.credit_and_insurance_collections],
            ["Total Gross Revenue", data.financial_summary?.total_gross_revenue]
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

        // Sheet 2: Detailed Bills
        const billsData = (data.bills || []).map((b, idx) => ({
            "Sl No": idx + 1,
            "Date": b.date,
            "Bill No": b.bill_no,
            "UHID": b.uhid || "—",
            "IP Number": b.ip_number || "—",
            "Patient Name": b.patient_name || "—",
            "Category": b.category,
            "Payment Mode": b.payment_mode,
            "Gross (₹)": b.gross,
            "Cash (₹)": b.cash,
            "Card/Bank (₹)": b.bank,
            "Credit (₹)": b.credit,
            "Cashier": b.cashier_name,
            "Shift No": b.shift_no
        }));
        const wsBills = XLSX.utils.json_to_sheet(billsData);
        XLSX.utils.book_append_sheet(wb, wsBills, "Bills Register");

        // Sheet 3: Counter Expenses
        const expData = (data.expense_vouchers || []).map((v, idx) => ({
            "Sl No": idx + 1,
            "Date": v.date,
            "Voucher No": v.voucher_no,
            "Shift No": v.shift_no,
            "Account Head": v.account_head,
            "Description": v.description,
            "Amount (₹)": v.amount,
            "Cashier": v.cashier_name
        }));
        const wsExp = XLSX.utils.json_to_sheet(expData);
        XLSX.utils.book_append_sheet(wb, wsExp, "Counter Expenses");

        // Sheet 4: Shift Reconciliation
        const shiftData = (data.shift_reconciliation || []).map(s => ({
            "Shift No": s.shift_no,
            "Cashier": s.cashier_name,
            "Gross Cash (₹)": s.gross_cash,
            "Counter Expenses (₹)": s.expenses_paid,
            "Net Handover Cash (₹)": s.net_handover_cash,
            "Recorded Shift Cash (₹)": s.recorded_shift_cash,
            "Card Collection (₹)": s.card_collection,
            "Status": s.is_tallied ? "TALLIED" : "DIFFER"
        }));
        const wsShift = XLSX.utils.json_to_sheet(shiftData);
        XLSX.utils.book_append_sheet(wb, wsShift, "Shift Reconciliation");

        XLSX.writeFile(wb, `Unified_Accounts_Report_${dateRange[0].format("YYYYMMDD")}_${dateRange[1].format("YYYYMMDD")}.xlsx`);
    };

    const handlePrint = () => {
        printAccountsReport("printable-unified-report", "landscape");
    };

    const fin = data?.financial_summary || {};

    return (
        <Container style={{ padding: isModalView ? "0" : "20px 24px", background: isModalView ? "transparent" : "#f8fafc", minHeight: isModalView ? "auto" : "100vh" }}>
            {/* Header & Controls */}
            {!isModalView && (
                <HeaderCard>
                    <TitleRow>
                        <PageTitle>
                            <Receipt size={24} color="#0284c7" />
                            Unified Accounts & Reconciliation Report
                            <span className="badge">100% Tallied</span>
                        </PageTitle>

                        <ActionButtonGroup>
                            <Button 
                                icon={<RefreshCw size={14} />} 
                                onClick={fetchReport} 
                                loading={loading}
                            >
                                Refresh
                            </Button>
                            <Button 
                                icon={<FileSpreadsheet size={14} color="#16a34a" />} 
                                onClick={exportToExcel} 
                                disabled={!data}
                            >
                                Export Excel
                            </Button>
                            <Button 
                                type="primary" 
                                icon={<Printer size={14} />} 
                                onClick={handlePrint} 
                                disabled={!data}
                                style={{ background: "#0284c7", borderColor: "#0284c7" }}
                            >
                                Print Report
                            </Button>
                        </ActionButtonGroup>
                    </TitleRow>

                    <FilterRow>
                        <FilterGroup>
                            <label><Calendar size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Date Range:</label>
                            <RangePicker 
                                value={dateRange} 
                                onChange={(dates) => setDateRange(dates || [dayjs(), dayjs()])}
                                format="DD/MM/YYYY"
                                allowClear={false}
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <label><Building2 size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Outlet:</label>
                            <Select 
                                value={outlet} 
                                onChange={setOutlet} 
                                style={{ minWidth: 170 }}
                            >
                                <Option value="all">ALL OUTLETS</Option>
                                {outletsList.map(o => (
                                    <Option key={o.outlet_code} value={o.outlet_code}>
                                        {o.outlet_name || o.outlet_code}
                                    </Option>
                                ))}
                            </Select>
                        </FilterGroup>

                        <FilterGroup style={{ marginLeft: "auto", flex: "1 1 240px", maxWidth: 320 }}>
                            <Input 
                                prefix={<Search size={14} color="#94a3b8" />}
                                placeholder="Search patient, UHID, IP, bill no..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                allowClear
                            />
                        </FilterGroup>
                    </FilterRow>
                </HeaderCard>
            )}

            {/* Financial Summary Cards */}
            {!isModalView && (
                <SummaryGrid>
                    <StatCard borderColor="#e2e8f0" iconBg="#f0fdf4" iconColor="#16a34a">
                        <div className="info">
                            <div className="label">Gross Cash Collections</div>
                            <div className="value">₹{formatINR(fin.gross_cash_collections)}</div>
                            <div className="subtext">All billing cash intake</div>
                        </div>
                        <div className="icon-box"><Wallet size={22} /></div>
                    </StatCard>

                    <StatCard borderColor="#fed7aa" iconBg="#fff7ed" iconColor="#ea580c">
                        <div className="info">
                            <div className="label">Counter Expense Payments</div>
                            <div className="value">₹{formatINR(fin.counter_expenses_paid)}</div>
                            <div className="subtext">Vouchers paid out from counter cash</div>
                        </div>
                        <div className="icon-box"><ArrowDownRight size={22} /></div>
                    </StatCard>

                    <StatCard borderColor="#bae6fd" iconBg="#f0f9ff" iconColor="#0284c7" textColor="#0284c7">
                        <div className="info">
                            <div className="label">Net Cash Handed Over</div>
                            <div className="value">₹{formatINR(fin.net_cash_handover)}</div>
                            <div className="subtext">Matches Shift Basis Report exactly</div>
                        </div>
                        <div className="icon-box"><CheckCircle2 size={22} /></div>
                    </StatCard>

                    <StatCard borderColor="#e9d5ff" iconBg="#faf5ff" iconColor="#9333ea">
                        <div className="info">
                            <div className="label">Card & Digital Payments</div>
                            <div className="value">₹{formatINR(fin.card_and_bank_collections)}</div>
                            <div className="subtext">POS, UPI, Credit Cards, Bank</div>
                        </div>
                        <div className="icon-box"><CreditCard size={22} /></div>
                    </StatCard>

                    <StatCard borderColor="#cbd5e1" iconBg="#f8fafc" iconColor="#0f172a">
                        <div className="info">
                            <div className="label">Total Gross Revenue</div>
                            <div className="value">₹{formatINR(fin.total_gross_revenue)}</div>
                            <div className="subtext">Cash + Digital + Scheme collections</div>
                        </div>
                        <div className="icon-box"><TrendingUp size={22} /></div>
                    </StatCard>
                </SummaryGrid>
            )}

            {/* Main Tabs */}
            <ContentCard>
                <Spin spinning={loading}>
                    <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
                        {
                            key: "bills",
                            label: `All Bills Register (${filteredBills.length})`,
                            children: (
                                <TableWrapper>
                                    <StyledTable>
                                        <thead>
                                            <tr>
                                                <th style={{ width: 45 }}>#</th>
                                                <th>Patient Name</th>
                                                <th>Bill No</th>
                                                <th>UHID / MR No</th>
                                                <th>IP Number</th>
                                                <th>Category</th>
                                                <th>Mode</th>
                                                <th className="num-col">Gross (₹)</th>
                                                <th className="num-col">Cash (₹)</th>
                                                <th className="num-col">Card/Bank (₹)</th>
                                                <th>Cashier</th>
                                                <th>Shift</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBills.length === 0 ? (
                                                <tr>
                                                    <td colSpan={12} style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                                                        No billing records found for the selected criteria.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredBills.map((b, idx) => (
                                                    <tr key={`${b.bill_no}-${idx}`}>
                                                        <td>{idx + 1}</td>
                                                        <td style={{ fontWeight: 600 }}>{b.patient_name || "—"}</td>
                                                        <td style={{ fontFamily: "monospace", color: "#0284c7", fontWeight: 600 }}>{b.bill_no}</td>
                                                        <td style={{ fontFamily: "monospace" }}>{b.mr_no || "—"}</td>
                                                        <td style={{ fontFamily: "monospace", color: "#64748b" }}>
                                                            {b.ip_number ? <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>{b.ip_number}</span> : "—"}
                                                        </td>
                                                        <td>
                                                            <Tag color="geekblue">{b.category}</Tag>
                                                        </td>
                                                        <td>
                                                            <Tag color={b.cash > 0 ? "green" : "blue"}>{b.payment_mode || "CASH"}</Tag>
                                                        </td>
                                                        <td className="num-col" style={{ fontWeight: 600 }}>{formatINR(b.gross)}</td>
                                                        <td className="num-col" style={{ color: "#16a34a", fontWeight: 600 }}>{formatINR(b.cash)}</td>
                                                        <td className="num-col" style={{ color: "#2563eb" }}>{formatINR(b.bank)}</td>
                                                        <td>{b.cashier_name}</td>
                                                        <td style={{ fontSize: "0.75rem", color: "#64748b" }}>{b.shift_no}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </StyledTable>
                                </TableWrapper>
                            )
                        },
                        {
                            key: "expenses",
                            label: `Counter Expense Vouchers (${data?.expense_vouchers?.length || 0})`,
                            children: (
                                <TableWrapper>
                                    <StyledTable>
                                        <thead>
                                            <tr>
                                                <th style={{ width: 45 }}>#</th>
                                                <th>Date & Time</th>
                                                <th>Voucher No</th>
                                                <th>Shift No</th>
                                                <th>Account Head</th>
                                                <th>Description / Remarks</th>
                                                <th className="num-col">Amount (₹)</th>
                                                <th>Cashier</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(data?.expense_vouchers || []).length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                                                        No counter expense payment vouchers recorded for this period.
                                                    </td>
                                                </tr>
                                            ) : (
                                                (data?.expense_vouchers || []).map((v, idx) => (
                                                    <tr key={`${v.voucher_no}-${idx}`}>
                                                        <td>{idx + 1}</td>
                                                        <td>{v.date}</td>
                                                        <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#ea580c" }}>{v.voucher_no}</td>
                                                        <td style={{ fontFamily: "monospace" }}>{v.shift_no}</td>
                                                        <td><Tag color="orange">{v.account_head}</Tag></td>
                                                        <td>{v.description}</td>
                                                        <td className="num-col" style={{ fontWeight: 700, color: "#ea580c" }}>
                                                            ₹{formatINR(v.amount)}
                                                        </td>
                                                        <td>{v.cashier_name}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        {(data?.expense_vouchers || []).length > 0 && (
                                            <tfoot>
                                                <tr style={{ background: "#fff7ed", fontWeight: 700 }}>
                                                    <td colSpan={6} style={{ textAlign: "right" }}>Total Counter Expense Deductions:</td>
                                                    <td className="num-col" style={{ color: "#ea580c" }}>
                                                        ₹{formatINR(fin.counter_expenses_paid)}
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </StyledTable>
                                </TableWrapper>
                            )
                        },
                        {
                            key: "shift_recon",
                            label: `Shift-Wise Reconciliation (${data?.shift_reconciliation?.length || 0})`,
                            children: (
                                <TableWrapper>
                                    <StyledTable>
                                        <thead>
                                            <tr>
                                                <th>Shift No</th>
                                                <th>Cashier Name</th>
                                                <th>Status</th>
                                                <th className="num-col">Gross Cash (₹)</th>
                                                <th className="num-col">Counter Expenses (₹)</th>
                                                <th className="num-col">Net Handover Cash (₹)</th>
                                                <th className="num-col">Shift Table Cash (₹)</th>
                                                <th className="num-col">Card / Digital (₹)</th>
                                                <th style={{ textAlign: "center" }}>Tally Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(data?.shift_reconciliation || []).length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                                                        No active or closed shifts found for this date.
                                                    </td>
                                                </tr>
                                            ) : (
                                                (data?.shift_reconciliation || []).map((s, idx) => (
                                                    <tr key={`${s.shift_no}-${idx}`}>
                                                        <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{s.shift_no}</td>
                                                        <td style={{ fontWeight: 600 }}>{s.cashier_name}</td>
                                                        <td>
                                                            <Tag color={s.shift_status === "active" ? "processing" : "default"}>
                                                                {s.shift_status.toUpperCase()}
                                                            </Tag>
                                                        </td>
                                                        <td className="num-col" style={{ color: "#16a34a", fontWeight: 600 }}>{formatINR(s.gross_cash)}</td>
                                                        <td className="num-col" style={{ color: "#ea580c", fontWeight: 600 }}>{formatINR(s.expenses_paid)}</td>
                                                        <td className="num-col" style={{ color: "#0284c7", fontWeight: 700 }}>{formatINR(s.net_handover_cash)}</td>
                                                        <td className="num-col" style={{ fontWeight: 700 }}>{formatINR(s.recorded_shift_cash)}</td>
                                                        <td className="num-col" style={{ color: "#9333ea" }}>{formatINR(s.card_collection)}</td>
                                                        <td style={{ textAlign: "center" }}>
                                                            {s.is_tallied ? (
                                                                <Tag color="success" icon={<CheckCircle2 size={12} style={{ verticalAlign: -1, marginRight: 3 }} />}>
                                                                    100% TALLIED
                                                                </Tag>
                                                            ) : (
                                                                <Tag color="error">DIFFER</Tag>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </StyledTable>
                                </TableWrapper>
                            )
                        }
                    ]} />
                </Spin>
            </ContentCard>

            {/* Print View for A4 Landscape */}
            <PrintArea ref={printRef} id="printable-unified-report">
                <div style={{ textAlign: "center", marginBottom: 15, borderBottom: "2px solid #0f172a", paddingBottom: 10 }}>
                    <h2 style={{ margin: 0, fontSize: "16pt", fontWeight: 800 }}>SHANMUGA HOSPITAL LIMITED</h2>
                    <div style={{ fontSize: "9pt", color: "#475569" }}>51/24, Saradha College Road, Salem - 636007</div>
                    <h3 style={{ margin: "6px 0 0", fontSize: "12pt", fontWeight: 700, textTransform: "uppercase" }}>
                        UNIFIED ACCOUNTS & RECONCILIATION STATEMENT
                    </h3>
                    <div style={{ fontSize: "8.5pt", color: "#334155", marginTop: 4 }}>
                        Date Range: <strong>{data?.date_range?.from_date}</strong> To <strong>{data?.date_range?.to_date}</strong> &nbsp;|&nbsp; 
                        Outlet: <strong>{outlet}</strong> &nbsp;|&nbsp; 
                        Printed: <strong>{dayjs().format("DD/MM/YYYY HH:mm:ss")}</strong>
                    </div>
                </div>

                {/* Print Reconciliation Summary Box */}
                <div style={{ display: "flex", gap: 10, marginBottom: 15, border: "1px solid #cbd5e1", padding: 8, background: "#f8fafc" }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "8pt", color: "#64748b" }}>GROSS CASH COLLECTIONS</div>
                        <div style={{ fontSize: "11pt", fontWeight: 700 }}>₹{formatINR(fin.gross_cash_collections)}</div>
                    </div>
                    <div style={{ flex: 1, borderLeft: "1px solid #cbd5e1", paddingLeft: 10 }}>
                        <div style={{ fontSize: "8pt", color: "#ea580c" }}>LESS: COUNTER EXPENSES</div>
                        <div style={{ fontSize: "11pt", fontWeight: 700, color: "#ea580c" }}>₹{formatINR(fin.counter_expenses_paid)}</div>
                    </div>
                    <div style={{ flex: 1, borderLeft: "1px solid #cbd5e1", paddingLeft: 10 }}>
                        <div style={{ fontSize: "8pt", color: "#0284c7" }}>NET CASH HANDED OVER</div>
                        <div style={{ fontSize: "11pt", fontWeight: 700, color: "#0284c7" }}>₹{formatINR(fin.net_cash_handover)}</div>
                    </div>
                    <div style={{ flex: 1, borderLeft: "1px solid #cbd5e1", paddingLeft: 10 }}>
                        <div style={{ fontSize: "8pt", color: "#64748b" }}>CARD / DIGITAL PAYMENTS</div>
                        <div style={{ fontSize: "11pt", fontWeight: 700 }}>₹{formatINR(fin.card_and_bank_collections)}</div>
                    </div>
                    <div style={{ flex: 1, borderLeft: "1px solid #cbd5e1", paddingLeft: 10 }}>
                        <div style={{ fontSize: "8pt", color: "#0f172a" }}>TOTAL GROSS REVENUE</div>
                        <div style={{ fontSize: "11pt", fontWeight: 800 }}>₹{formatINR(fin.total_gross_revenue)}</div>
                    </div>
                </div>

                {/* Print Detailed Bills Table */}
                <h4 style={{ margin: "10px 0 5px", fontSize: "10pt" }}>1. DETAILED BILLS & COLLECTIONS</h4>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: 30 }}>#</th>
                            <th>Patient Name</th>
                            <th>Bill No</th>
                            <th>UHID / MR No</th>
                            <th>IP No</th>
                            <th>Category</th>
                            <th>Mode</th>
                            <th style={{ textAlign: "right" }}>Gross (₹)</th>
                            <th style={{ textAlign: "right" }}>Cash (₹)</th>
                            <th style={{ textAlign: "right" }}>Card/Bank (₹)</th>
                            <th>Cashier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data?.bills || []).map((b, idx) => (
                            <tr key={`print-bill-${idx}`}>
                                <td>{idx + 1}</td>
                                <td>{b.patient_name || "—"}</td>
                                <td style={{ fontFamily: "monospace" }}>{b.bill_no}</td>
                                <td style={{ fontFamily: "monospace" }}>{b.mr_no || "—"}</td>
                                <td style={{ fontFamily: "monospace" }}>{b.ip_number || "—"}</td>
                                <td>{b.category}</td>
                                <td>{b.payment_mode || "CASH"}</td>
                                <td style={{ textAlign: "right" }}>{formatINR(b.gross)}</td>
                                <td style={{ textAlign: "right" }}>{formatINR(b.cash)}</td>
                                <td style={{ textAlign: "right" }}>{formatINR(b.bank)}</td>
                                <td>{b.cashier_name}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ fontWeight: 700, background: "#f1f5f9" }}>
                            <td colSpan={7} style={{ textAlign: "right" }}>Total Collections:</td>
                            <td style={{ textAlign: "right" }}>₹{formatINR(fin.total_gross_revenue)}</td>
                            <td style={{ textAlign: "right" }}>₹{formatINR(fin.gross_cash_collections)}</td>
                            <td style={{ textAlign: "right" }}>₹{formatINR(fin.card_and_bank_collections)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>

                {/* Print Counter Expense Deductions Table */}
                {(data?.expense_vouchers || []).length > 0 && (
                    <div style={{ marginTop: 15, pageBreakInside: "avoid" }}>
                        <h4 style={{ margin: "10px 0 5px", fontSize: "10pt" }}>2. COUNTER EXPENSE PAYMENTS (DEDUCTED FROM CASH)</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: 30 }}>#</th>
                                    <th>Date</th>
                                    <th>Voucher No</th>
                                    <th>Shift No</th>
                                    <th>Account Head</th>
                                    <th>Description / Purpose</th>
                                    <th style={{ textAlign: "right" }}>Amount (₹)</th>
                                    <th>Cashier</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data?.expense_vouchers || []).map((v, idx) => (
                                    <tr key={`print-exp-${idx}`}>
                                        <td>{idx + 1}</td>
                                        <td>{v.date}</td>
                                        <td style={{ fontFamily: "monospace" }}>{v.voucher_no}</td>
                                        <td>{v.shift_no}</td>
                                        <td>{v.account_head}</td>
                                        <td>{v.description}</td>
                                        <td style={{ textAlign: "right", color: "#ea580c" }}>₹{formatINR(v.amount)}</td>
                                        <td>{v.cashier_name}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ fontWeight: 700, background: "#fff7ed" }}>
                                    <td colSpan={6} style={{ textAlign: "right" }}>Total Counter Expenses:</td>
                                    <td style={{ textAlign: "right", color: "#ea580c" }}>₹{formatINR(fin.counter_expenses_paid)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                {/* Print Signatures */}
                <div style={{ marginTop: 40, display: "flex", justifyContent: "space-between", pageBreakInside: "avoid" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ borderTop: "1px solid #475569", width: 180, paddingTop: 5, fontSize: "9pt" }}>Prepared By</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ borderTop: "1px solid #475569", width: 180, paddingTop: 5, fontSize: "9pt" }}>Cashier / Staff</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ borderTop: "1px solid #475569", width: 180, paddingTop: 5, fontSize: "9pt" }}>Accounts Officer</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ borderTop: "1px solid #475569", width: 180, paddingTop: 5, fontSize: "9pt" }}>Authorized Signatory</div>
                    </div>
                </div>
            </PrintArea>
        </Container>
    );
}
