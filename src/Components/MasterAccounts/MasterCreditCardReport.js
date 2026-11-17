import React, { useState, useEffect, useMemo } from "react";
import { DatePicker, Select, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw, CreditCard } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import {
    cleanNum,
    formatINR,
    exportToExcel,
    printReportArea,
    extractReportData,
    getSafeArray,
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

const MasterCreditCardReport = ({ isModalView = false, startDate, endDate, initialOutlet = "all" }) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs(),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(initialOutlet || "all");
    const [outletsList, setOutletsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMachine, setSelectedMachine] = useState("all");

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



    const fetchReport = async () => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/credit-card-electronic-payment/?from_date=${fDate}&to_date=${tDate}&outlet_code=${outlet}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Credit Card Report Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange, outlet]);

    const txns = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};
    const machineSummary = reportData?.machine_summary || {};

    const filteredTxns = useMemo(() => {
        let list = txns;
        if (selectedMachine !== "all") {
            list = list.filter(t => (t.terminal_machine || "Main POS") === selectedMachine);
        }
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(t =>
            String(t.bill_no || "").toLowerCase().includes(q) ||
            String(t.patient_name || "").toLowerCase().includes(q) ||
            String(t.auth_code || "").toLowerCase().includes(q) ||
            String(t.card_type || "").toLowerCase().includes(q)
        );
    }, [txns, selectedMachine, searchTerm]);

    const handleExport = () => {
        const rows = filteredTxns.map(t => ({
            "Bill No": t.bill_no,
            "Date": t.date,
            "Category": t.category,
            "UHID": t.mr_no,
            "Patient Name": t.patient_name,
            "Card Amount": t.card_amount,
            "Card Type / Network": t.card_type,
            "POS Machine / Bank": t.terminal_machine,
            "Auth / Ref Code": t.auth_code
        }));
        exportToExcel(rows, "Master_Credit_Card_Report", "ElectronicReceipts");
    };

    const totalCardAmount = filteredTxns.reduce((a, x) => a + cleanNum(x.card_amount || x.bank || x.card || x.amount || x.net_amount), 0);

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            Credit Card & Electronic Payment Report
                            <span className="badge">100% Shift Tallied</span>
                        </h1>
                        <p>Credit card swipe machine POS receipts, payment gateway settlements, and UPI collections</p>
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

                {!isModalView && (
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
                            <label>POS Terminal:</label>
                            <Select value={selectedMachine} onChange={setSelectedMachine} style={{ width: 180 }}>
                                <Option value="all">All Terminals</Option>
                                {Object.keys(machineSummary).map(m => (
                                    <Option key={m} value={m}>{m}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <Input
                                placeholder="Search bill / patient / auth code..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 220 }}
                            />
                        </div>
                        <Button icon={<RefreshCw size={14} />} onClick={fetchReport} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                )}
            </ControlCard>
            )}

            {loading ? (
                <div style={{ padding: "60px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-report-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title="CreditCardReport"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Credit card swipe machine POS receipts, payment gateway settlements, and UPI collections"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#6366f1">
                            <span className="kpi-title">Total Card / POS</span>
                            <span className="kpi-value">₹{formatINR(summary.total_card_collection)}</span>
                            <span className="kpi-subtitle">Tallies with shift credit total</span>
                        </KPICard>
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Total Card Swipes</span>
                            <span className="kpi-value">{summary.total_transactions || filteredTxns.length}</span>
                            <span className="kpi-subtitle">Settled transactions</span>
                        </KPICard>
                        <KPICard $border="#10b981">
                            <span className="kpi-title">Active POS Terminals</span>
                            <span className="kpi-value">{Object.keys(machineSummary).length || 1}</span>
                            <span className="kpi-subtitle">Bank swipe machines</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>Bill No</th>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>UHID</th>
                                    <th>Patient Name</th>
                                    <th>POS Terminal</th>
                                    <th>Card Network / Type</th>
                                    <th>Auth / Ref No</th>
                                    <th className="text-right">Card Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTxns.map((t, idx) => (
                                    <tr key={idx}>
                                        <td className="font-mono"><strong>{t.bill_no}</strong></td>
                                        <td>{t.date}</td>
                                        <td><Tag color="purple">{t.category}</Tag></td>
                                        <td className="font-mono">{t.mr_no || "-"}</td>
                                        <td>{t.patient_name || "General"}</td>
                                        <td>{t.terminal_machine || "Main POS"}</td>
                                        <td>{t.card_type || "Credit/Debit Card"}</td>
                                        <td className="font-mono">{t.auth_code || "-"}</td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#4f46e5" }}>
                                            {formatINR(t.card_amount || t.bank || t.card || t.amount || t.net_amount)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={8}><strong>TOTAL ELECTRONIC SETTLEMENT ({filteredTxns.length} TRANSACTIONS)</strong></td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#4f46e5" }}>
                                        ₹{formatINR(totalCardAmount || summary.total_card_collection || summary.total_card_amount)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </DataTableWrapper>

                    <ReportPrintFooter />
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterCreditCardReport;
