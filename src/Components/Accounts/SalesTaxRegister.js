import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker, Tooltip } from "antd";
import { 
    FaPrint, 
    FaSearch, 
    FaExclamationTriangle, 
    FaUndoAlt, 
    FaShoppingCart, 
    FaLayerGroup,
    FaFileInvoiceDollar,
    FaFileExcel,
    FaInfoCircle
} from "react-icons/fa";
import styled from "styled-components";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import { printAccountsReport } from "./printAccountsReport";
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
    SectionTitle,
} from "../GlobalStyles";

const TabBar = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    border-bottom: 2px solid ${colors.border || "#e2e8f0"};
    padding-bottom: 8px;
    flex-wrap: wrap;
`;

const TabButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: ${props => props.active ? (props.activeColor || colors.primary) : "transparent"};
    color: ${props => props.active ? "#ffffff" : colors.textMuted};
    box-shadow: ${props => props.active ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "none"};

    &:hover {
        background: ${props => props.active ? (props.activeColor || colors.primary) : "#f1f5f9"};
        color: ${props => props.active ? "#ffffff" : colors.textMain};
    }

    .badge {
        background: ${props => props.active ? "rgba(255, 255, 255, 0.25)" : "#e2e8f0"};
        color: ${props => props.active ? "#ffffff" : colors.textMain};
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 700;
    }
`;

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
`;

const SummaryCard = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
    border-left: 4px solid ${props => props.color || colors.primary};
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 85px;
    animation: ${fadeIn} 0.3s ease-out;
`;

const SummaryValue = styled.h3`
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
    color: ${props => props.color || colors.textMain};
`;

const SummaryLabel = styled.p`
    margin: 0 0 4px 0;
    font-size: 0.75rem;
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const ApproxNotice = styled.div`
    background: #fffbeb;
    border: 1px solid #fde68a;
    color: #92400e;
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 0.82rem;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
`;

const TypeBadge = styled.span`
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: ${props => props.type === "Return" ? "#fef2f2" : "#f0fdf4"};
    color: ${props => props.type === "Return" ? colors.danger : colors.success};
    border: 1px solid ${props => props.type === "Return" ? "#fecaca" : "#bbf7d0"};
`;

const PrintHeader = styled.div`
    display: none;
    text-align: center;
    margin-bottom: 20px;

    @media print {
        display: block !important;
    }

    h2 {
        margin: 0 0 4px 0;
        font-size: 1.3rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    p {
        margin: 2px 0;
        font-size: 0.85rem;
        color: #4b5563;
    }
`;

const SalesTaxRegister = ({ isModalView = false, startDate, endDate }) => {
    const [activeTab, setActiveTab] = useState("sales"); // "sales" | "returns" | "consolidated"
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [patientType, setPatientType] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    
    // Server data states
    const [salesData, setSalesData] = useState([]);
    const [returnData, setReturnData] = useState([]);
    const [consolidatedData, setConsolidatedData] = useState([]);
    const [salesSummary, setSalesSummary] = useState({ total_taxable_value: 0, total_tax: 0, total_gross: 0, total_cgst: 0, total_sgst: 0, rate_wise: [], count: 0 });
    const [returnSummary, setReturnSummary] = useState({ total_taxable_value: 0, total_tax: 0, total_gross: 0, total_cgst: 0, total_sgst: 0, rate_wise: [], count: 0 });
    const [netSummary, setNetSummary] = useState({ total_taxable_value: 0, total_tax: 0, total_gross: 0, total_cgst: 0, total_sgst: 0, rate_wise: [] });
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (fromDate && toDate) fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDate, toDate, patientType]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ 
                from_date: fromDate, 
                to_date: toDate,
                report_type: "all"
            });
            if (patientType !== "all") params.set("patient_type", patientType);
            const response = await apiRequest(`${HmsBaseUrl}sales-tax-register/?${params.toString()}`, "GET");
            if (response.success && response.data) {
                const sData = response.data.sales_data || [];
                const rData = response.data.return_data || [];
                const cData = response.data.consolidated_data || response.data.data || [];
                
                setSalesData(sData);
                setReturnData(rData);
                setConsolidatedData(cData);

                setSalesSummary(response.data.sales_summary || { total_taxable_value: 0, total_tax: 0, total_gross: 0, total_cgst: 0, total_sgst: 0, rate_wise: [], count: 0 });
                setReturnSummary(response.data.return_summary || { total_taxable_value: 0, total_tax: 0, total_gross: 0, total_cgst: 0, total_sgst: 0, rate_wise: [], count: 0 });
                setNetSummary(response.data.net_summary || response.data.summary || { total_taxable_value: 0, total_tax: 0, total_gross: 0, total_cgst: 0, total_sgst: 0, rate_wise: [] });
            }
        } catch (error) {
            console.error("Error fetching sales tax register:", error);
            toast.error("Failed to fetch sales tax register data");
        } finally {
            setLoading(false);
        }
    };

    // Filtered data based on active tab and search query
    const displayedData = useMemo(() => {
        let list = [];
        if (activeTab === "returns") list = returnData;
        else if (activeTab === "sales") list = salesData;
        else list = consolidatedData;

        if (!searchQuery.trim()) return list;

        const q = searchQuery.toLowerCase().trim();
        return list.filter(row => 
            (row.bill_no && String(row.bill_no).toLowerCase().includes(q)) ||
            (row.orig_bill_no && String(row.orig_bill_no).toLowerCase().includes(q)) ||
            (row.item_name && String(row.item_name).toLowerCase().includes(q)) ||
            (row.batch_no && String(row.batch_no).toLowerCase().includes(q)) ||
            (row.patient_type && String(row.patient_type).toLowerCase().includes(q))
        );
    }, [activeTab, returnData, salesData, consolidatedData, searchQuery]);

    const handlePrint = () => printAccountsReport("printable-report-area", "landscape");

    const formatINR = (val) => {
        const num = parseFloat(val) || 0;
        return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getReportTitle = () => {
        if (activeTab === "returns") return "Sales Return Register (GST)";
        if (activeTab === "sales") return "Sales Tax Register (GST)";
        return "Consolidated Sales & Return Tax Register (GST)";
    };

    const handleExportExcel = () => {
        if (displayedData.length === 0) {
            toast.warning("No data to export");
            return;
        }

        try {
            let exportRows = [];
            if (activeTab === "returns") {
                exportRows = displayedData.map((r, i) => ({
                    "S.No": i + 1,
                    "Return Bill No": r.bill_no,
                    "Original Bill No": r.orig_bill_no || "—",
                    "Patient Type": r.patient_type,
                    "Return Date": r.date ? dayjs(r.date).format("DD/MM/YYYY") : "N/A",
                    "Medicine / Item": r.item_name || "N/A",
                    "Batch No": r.batch_no || "—",
                    "GST Rate (%)": r.rate,
                    "Taxable Value (₹)": Number((r.taxable_value || 0).toFixed(2)),
                    "CGST (₹)": Number((r.cgst_amount || 0).toFixed(2)),
                    "SGST (₹)": Number((r.sgst_amount || 0).toFixed(2)),
                    "Total Tax (₹)": Number((r.total_tax || 0).toFixed(2)),
                    "Return Gross Amount (₹)": Number((r.gross_amount || 0).toFixed(2)),
                }));
            } else if (activeTab === "sales") {
                exportRows = displayedData.map((r, i) => ({
                    "S.No": i + 1,
                    "Bill No": r.bill_no,
                    "Patient Type": r.patient_type,
                    "Bill Date": r.date ? dayjs(r.date).format("DD/MM/YYYY") : "N/A",
                    "Medicine / Item": r.item_name || "N/A",
                    "Batch No": r.batch_no || "—",
                    "GST Rate (%)": r.rate,
                    "Taxable Value (₹)": Number((r.taxable_value || 0).toFixed(2)),
                    "CGST (₹)": Number((r.cgst_amount || 0).toFixed(2)),
                    "SGST (₹)": Number((r.sgst_amount || 0).toFixed(2)),
                    "Total Tax (₹)": Number((r.total_tax || 0).toFixed(2)),
                    "Gross Amount (₹)": Number((r.gross_amount || 0).toFixed(2)),
                }));
            } else {
                exportRows = displayedData.map((r, i) => ({
                    "S.No": i + 1,
                    "Type": r.type,
                    "Bill / Return No": r.bill_no,
                    "Original Bill No": r.orig_bill_no || "—",
                    "Patient Type": r.patient_type,
                    "Date": r.date ? dayjs(r.date).format("DD/MM/YYYY") : "N/A",
                    "Medicine / Item": r.item_name || "N/A",
                    "Batch No": r.batch_no || "—",
                    "GST Rate (%)": r.rate,
                    "Taxable Value (₹)": Number((r.taxable_value || 0).toFixed(2)),
                    "CGST (₹)": Number((r.cgst_amount || 0).toFixed(2)),
                    "SGST (₹)": Number((r.sgst_amount || 0).toFixed(2)),
                    "Gross Amount (₹)": Number((r.gross_amount || 0).toFixed(2)),
                }));
            }

            const wb = XLSX.utils.book_new();
            const wsData = XLSX.utils.json_to_sheet(exportRows);

            // Auto-width columns
            const colWidths = Object.keys(exportRows[0] || {}).map(key => ({
                wch: Math.max(key.length + 3, 14)
            }));
            wsData["!cols"] = colWidths;

            const sheetName = activeTab === "returns" ? "Sales Returns" : activeTab === "sales" ? "Sales Register" : "Consolidated";
            XLSX.utils.book_append_sheet(wb, wsData, sheetName);

            // Add Rate-wise Summary Sheet
            const summaryList = activeTab === "returns" 
                ? returnSummary.rate_wise 
                : activeTab === "sales" 
                    ? salesSummary.rate_wise 
                    : netSummary.rate_wise;

            if (summaryList && summaryList.length > 0) {
                let summaryRows = [];
                if (activeTab === "consolidated") {
                    summaryRows = summaryList.map(s => ({
                        "GST Rate (%)": s.rate,
                        "Sales Taxable (₹)": Number((s.sales_taxable || 0).toFixed(2)),
                        "Return Taxable (₹)": Number((s.return_taxable || 0).toFixed(2)),
                        "Net Taxable Value (₹)": Number((s.taxable_value || 0).toFixed(2)),
                        "Net CGST (₹)": Number((s.cgst_amount || 0).toFixed(2)),
                        "Net SGST (₹)": Number((s.sgst_amount || 0).toFixed(2)),
                        "Net Total Tax (₹)": Number((s.total_tax || 0).toFixed(2)),
                        "Net Gross Amount (₹)": Number((s.gross_amount || 0).toFixed(2)),
                    }));
                } else {
                    summaryRows = summaryList.map(s => ({
                        "GST Rate (%)": s.rate,
                        "Taxable Value (₹)": Number((s.taxable_value || 0).toFixed(2)),
                        "CGST (₹)": Number((s.cgst_amount || 0).toFixed(2)),
                        "SGST (₹)": Number((s.sgst_amount || 0).toFixed(2)),
                        "Total Tax (₹)": Number((s.total_tax || 0).toFixed(2)),
                        "Gross Amount (₹)": Number((s.gross_amount || 0).toFixed(2)),
                        "Count": s.count || 0
                    }));
                }
                const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
                wsSummary["!cols"] = Object.keys(summaryRows[0] || {}).map(key => ({
                    wch: Math.max(key.length + 3, 16)
                }));
                XLSX.utils.book_append_sheet(wb, wsSummary, "Rate-wise Summary");
            }

            const fileName = `${getReportTitle().replace(/[^a-zA-Z0-9]/g, "_")}_${fromDate}_to_${toDate}.xlsx`;
            XLSX.writeFile(wb, fileName);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    return (
        <PageWrapper>
            <PrintHeader>
                <h2>{getReportTitle()}</h2>
                <p>Period: {fromDate ? dayjs(fromDate).format("DD/MM/YYYY") : "—"} to {toDate ? dayjs(toDate).format("DD/MM/YYYY") : "—"} | Patient Type: {patientType.toUpperCase()}</p>
                <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Generated on: {dayjs().format("DD/MM/YYYY hh:mm A")}</p>
            </PrintHeader>

            <SectionTitle className="no-print">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                        <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                            <FaFileInvoiceDollar style={{ color: colors.primary }} />
                            Sales Tax Register (GST)
                        </h3>
                        <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: colors.textMuted }}>
                            Pharmacy OP/IP sales and separate return registers with rate-wise GST breakdowns
                        </p>
                    </div>
                </div>
            </SectionTitle>

            <ApproxNotice className="no-print">
                <FaExclamationTriangle style={{ flexShrink: 0 }} />
                <span>
                    Approximate: sale and return lines calculate GST based on each item's 
                    <strong>&nbsp;current stock batch&nbsp;</strong> tax percentage.
                </span>
            </ApproxNotice>

            {/* Navigation Tabs */}
            <TabBar className="no-print">
                <TabButton 
                    active={activeTab === "sales"} 
                    activeColor={colors.primary}
                    onClick={() => setActiveTab("sales")}
                >
                    <FaShoppingCart />
                    <span>Sales Register</span>
                    <span className="badge">{salesData.length}</span>
                </TabButton>
                
                <TabButton 
                    active={activeTab === "returns"} 
                    activeColor={colors.danger || "#dc2626"}
                    onClick={() => setActiveTab("returns")}
                >
                    <FaUndoAlt />
                    <span>Sales Return Register</span>
                    <span className="badge">{returnData.length}</span>
                </TabButton>
                
                <TabButton 
                    active={activeTab === "consolidated"} 
                    activeColor={colors.secondary || "#0284c7"}
                    onClick={() => setActiveTab("consolidated")}
                >
                    <FaLayerGroup />
                    <span>Consolidated Register (Net)</span>
                    <span className="badge">{consolidatedData.length}</span>
                </TabButton>
            </TabBar>

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
                    <InputWrapper>
                        <Label>Patient Type</Label>
                        <Select value={patientType} onChange={(e) => setPatientType(e.target.value)}>
                            <option value="all">OP + IP (All)</option>
                            <option value="op">OP Only</option>
                            <option value="ip">IP Only</option>
                        </Select>
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Search Bill / Item</Label>
                        <Input 
                            type="text"
                            placeholder="Filter by bill, item name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ height: '40px' }}
                        />
                    </InputWrapper>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
                        <Button onClick={fetchReport} disabled={loading} style={{ height: "40px" }}>
                            <FaSearch style={{ marginRight: "8px" }} /> {loading ? "Searching..." : "Search"}
                        </Button>
                        <Button 
                            onClick={handleExportExcel} 
                            disabled={loading || displayedData.length === 0} 
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

            {/* Dynamic KPI Summary Cards */}
            {activeTab === "returns" && (
                <SummaryGrid>
                    <SummaryCard color={colors.danger}>
                        <SummaryLabel>Total Return Taxable</SummaryLabel>
                        <SummaryValue color={colors.danger}>{formatINR(returnSummary.total_taxable_value)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color="#ea580c">
                        <SummaryLabel>Return CGST</SummaryLabel>
                        <SummaryValue>{formatINR(returnSummary.total_cgst)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color="#ea580c">
                        <SummaryLabel>Return SGST</SummaryLabel>
                        <SummaryValue>{formatINR(returnSummary.total_sgst)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color="#d97706">
                        <SummaryLabel>Total Return Tax</SummaryLabel>
                        <SummaryValue>{formatINR(returnSummary.total_tax)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color={colors.danger}>
                        <SummaryLabel>Total Return Gross Amount</SummaryLabel>
                        <SummaryValue color={colors.danger}>{formatINR(returnSummary.total_gross)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color="#64748b">
                        <SummaryLabel>Return Records</SummaryLabel>
                        <SummaryValue>{returnSummary.count || returnData.length}</SummaryValue>
                    </SummaryCard>
                </SummaryGrid>
            )}

            {activeTab === "sales" && (
                <SummaryGrid>
                    <SummaryCard color={colors.primary}>
                        <SummaryLabel>Total Sales Taxable</SummaryLabel>
                        <SummaryValue color={colors.primary}>{formatINR(salesSummary.total_taxable_value)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color={colors.secondary}>
                        <SummaryLabel>Sales CGST</SummaryLabel>
                        <SummaryValue>{formatINR(salesSummary.total_cgst)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color={colors.secondary}>
                        <SummaryLabel>Sales SGST</SummaryLabel>
                        <SummaryValue>{formatINR(salesSummary.total_sgst)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color="#0284c7">
                        <SummaryLabel>Total Sales Tax</SummaryLabel>
                        <SummaryValue>{formatINR(salesSummary.total_tax)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color={colors.success}>
                        <SummaryLabel>Total Sales Gross Amount</SummaryLabel>
                        <SummaryValue color={colors.success}>{formatINR(salesSummary.total_gross)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color="#64748b">
                        <SummaryLabel>Sales Records</SummaryLabel>
                        <SummaryValue>{salesSummary.count || salesData.length}</SummaryValue>
                    </SummaryCard>
                </SummaryGrid>
            )}

            {activeTab === "consolidated" && (
                <SummaryGrid>
                    <SummaryCard color={colors.success}>
                        <SummaryLabel>Gross Sales (+)</SummaryLabel>
                        <SummaryValue color={colors.success}>{formatINR(netSummary.total_sales_gross || salesSummary.total_gross)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color={colors.danger}>
                        <SummaryLabel>Gross Returns (-)</SummaryLabel>
                        <SummaryValue color={colors.danger}>{formatINR(netSummary.total_return_gross || returnSummary.total_gross)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color={colors.primary}>
                        <SummaryLabel>Net Taxable Value</SummaryLabel>
                        <SummaryValue color={colors.primary}>{formatINR(netSummary.total_taxable_value)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color={colors.secondary}>
                        <SummaryLabel>Net Tax (CGST + SGST)</SummaryLabel>
                        <SummaryValue>{formatINR(netSummary.total_tax)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color={colors.primary}>
                        <SummaryLabel>Net Gross Value</SummaryLabel>
                        <SummaryValue color={colors.primary}>{formatINR(netSummary.total_gross)}</SummaryValue>
                    </SummaryCard>
                </SummaryGrid>
            )}

            {/* Rate-wise GST Summary Table */}
            {activeTab === "returns" && returnSummary.rate_wise?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: colors.textMain, marginBottom: 8, display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>Sales Return GST Rate Breakdown</span>
                    </div>
                    <TableWrapper>
                        <Table>
                            <thead>
                                <Tr>
                                    <Th>GST Rate</Th>
                                    <Th style={{ textAlign: "right" }}>Return Taxable Value</Th>
                                    <Th style={{ textAlign: "right" }}>CGST Amount</Th>
                                    <Th style={{ textAlign: "right" }}>SGST Amount</Th>
                                    <Th style={{ textAlign: "right" }}>Total Return Tax</Th>
                                    <Th style={{ textAlign: "right" }}>Return Gross Amount</Th>
                                    <Th style={{ textAlign: "center" }}>Items</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {returnSummary.rate_wise.map((r, i) => (
                                    <Tr key={i}>
                                        <Td style={{ fontWeight: 700 }}>{r.rate}%</Td>
                                        <Td style={{ textAlign: "right" }}>{formatINR(r.taxable_value)}</Td>
                                        <Td style={{ textAlign: "right" }}>{formatINR(r.cgst_amount)}</Td>
                                        <Td style={{ textAlign: "right" }}>{formatINR(r.sgst_amount)}</Td>
                                        <Td style={{ textAlign: "right", fontWeight: 700, color: colors.danger }}>{formatINR(r.total_tax)}</Td>
                                        <Td style={{ textAlign: "right", fontWeight: 700 }}>{formatINR(r.gross_amount)}</Td>
                                        <Td style={{ textAlign: "center" }}>{r.count || "—"}</Td>
                                    </Tr>
                                ))}
                                <Tr style={{ background: "#f8fafc", fontWeight: 700 }}>
                                    <Td>TOTAL</Td>
                                    <Td style={{ textAlign: "right" }}>{formatINR(returnSummary.total_taxable_value)}</Td>
                                    <Td style={{ textAlign: "right" }}>{formatINR(returnSummary.total_cgst)}</Td>
                                    <Td style={{ textAlign: "right" }}>{formatINR(returnSummary.total_sgst)}</Td>
                                    <Td style={{ textAlign: "right", color: colors.danger }}>{formatINR(returnSummary.total_tax)}</Td>
                                    <Td style={{ textAlign: "right" }}>{formatINR(returnSummary.total_gross)}</Td>
                                    <Td style={{ textAlign: "center" }}>{returnSummary.count || returnData.length}</Td>
                                </Tr>
                            </tbody>
                        </Table>
                    </TableWrapper>
                </div>
            )}

            {activeTab === "sales" && salesSummary.rate_wise?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: colors.textMain, marginBottom: 8 }}>
                        <span>Sales GST Rate Breakdown</span>
                    </div>
                    <TableWrapper>
                        <Table>
                            <thead>
                                <Tr>
                                    <Th>GST Rate</Th>
                                    <Th style={{ textAlign: "right" }}>Sales Taxable Value</Th>
                                    <Th style={{ textAlign: "right" }}>CGST Amount</Th>
                                    <Th style={{ textAlign: "right" }}>SGST Amount</Th>
                                    <Th style={{ textAlign: "right" }}>Total Sales Tax</Th>
                                    <Th style={{ textAlign: "right" }}>Sales Gross Amount</Th>
                                    <Th style={{ textAlign: "center" }}>Items</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {salesSummary.rate_wise.map((r, i) => (
                                    <Tr key={i}>
                                        <Td style={{ fontWeight: 700 }}>{r.rate}%</Td>
                                        <Td style={{ textAlign: "right" }}>{formatINR(r.taxable_value)}</Td>
                                        <Td style={{ textAlign: "right" }}>{formatINR(r.cgst_amount)}</Td>
                                        <Td style={{ textAlign: "right" }}>{formatINR(r.sgst_amount)}</Td>
                                        <Td style={{ textAlign: "right", fontWeight: 700, color: colors.primary }}>{formatINR(r.total_tax)}</Td>
                                        <Td style={{ textAlign: "right", fontWeight: 700 }}>{formatINR(r.gross_amount)}</Td>
                                        <Td style={{ textAlign: "center" }}>{r.count || "—"}</Td>
                                    </Tr>
                                ))}
                                <Tr style={{ background: "#f8fafc", fontWeight: 700 }}>
                                    <Td>TOTAL</Td>
                                    <Td style={{ textAlign: "right" }}>{formatINR(salesSummary.total_taxable_value)}</Td>
                                    <Td style={{ textAlign: "right" }}>{formatINR(salesSummary.total_cgst)}</Td>
                                    <Td style={{ textAlign: "right" }}>{formatINR(salesSummary.total_sgst)}</Td>
                                    <Td style={{ textAlign: "right", color: colors.primary }}>{formatINR(salesSummary.total_tax)}</Td>
                                    <Td style={{ textAlign: "right" }}>{formatINR(salesSummary.total_gross)}</Td>
                                    <Td style={{ textAlign: "center" }}>{salesSummary.count || salesData.length}</Td>
                                </Tr>
                            </tbody>
                        </Table>
                    </TableWrapper>
                </div>
            )}

            {activeTab === "consolidated" && netSummary.rate_wise?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: colors.textMain, marginBottom: 8 }}>
                        <span>Consolidated Rate-wise Tax Comparison</span>
                    </div>
                    <TableWrapper>
                        <Table>
                            <thead>
                                <Tr>
                                    <Th>Rate</Th>
                                    <Th style={{ textAlign: "right" }}>Sales Taxable</Th>
                                    <Th style={{ textAlign: "right" }}>Return Taxable</Th>
                                    <Th style={{ textAlign: "right" }}>Net Taxable</Th>
                                    <Th style={{ textAlign: "right" }}>Net CGST</Th>
                                    <Th style={{ textAlign: "right" }}>Net SGST</Th>
                                    <Th style={{ textAlign: "right" }}>Net Total Tax</Th>
                                    <Th style={{ textAlign: "right" }}>Net Gross</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {netSummary.rate_wise.map((r, i) => (
                                    <Tr key={i}>
                                        <Td style={{ fontWeight: 700 }}>{r.rate}%</Td>
                                        <Td style={{ textAlign: "right" }}>{formatINR(r.sales_taxable)}</Td>
                                        <Td style={{ textAlign: "right", color: colors.danger }}>{formatINR(r.return_taxable)}</Td>
                                        <Td style={{ textAlign: "right", fontWeight: 600 }}>{formatINR(r.taxable_value)}</Td>
                                        <Td style={{ textAlign: "right" }}>{formatINR(r.cgst_amount)}</Td>
                                        <Td style={{ textAlign: "right" }}>{formatINR(r.sgst_amount)}</Td>
                                        <Td style={{ textAlign: "right", fontWeight: 700, color: colors.primary }}>{formatINR(r.total_tax)}</Td>
                                        <Td style={{ textAlign: "right", fontWeight: 700 }}>{formatINR(r.gross_amount)}</Td>
                                    </Tr>
                                ))}
                                <Tr style={{ background: "#f8fafc", fontWeight: 700 }}>
                                    <Td>TOTAL</Td>
                                    <Td style={{ textAlign: "right" }}>{formatINR(netSummary.total_sales_taxable)}</Td>
                                    <Td style={{ textAlign: "right", color: colors.danger }}>{formatINR(netSummary.total_return_taxable)}</Td>
                                    <Td style={{ textAlign: "right" }}>{formatINR(netSummary.total_taxable_value)}</Td>
                                    <Td style={{ textAlign: "right" }}>{formatINR(netSummary.total_cgst)}</Td>
                                    <Td style={{ textAlign: "right" }}>{formatINR(netSummary.total_sgst)}</Td>
                                    <Td style={{ textAlign: "right", color: colors.primary }}>{formatINR(netSummary.total_tax)}</Td>
                                    <Td style={{ textAlign: "right" }}>{formatINR(netSummary.total_gross)}</Td>
                                </Tr>
                            </tbody>
                        </Table>
                    </TableWrapper>
                </div>
            )}

            {/* Detailed Transactions Table */}
            <TableWrapper>
                <Table>
                    <thead>
                        {activeTab === "returns" && (
                            <Tr>
                                <Th style={{ width: "50px" }}>S.No</Th>
                                <Th>Return Bill No</Th>
                                <Th>Original Bill No</Th>
                                <Th>Patient Type</Th>
                                <Th>Return Date</Th>
                                <Th>Medicine / Item</Th>
                                <Th>Batch</Th>
                                <Th style={{ textAlign: "right" }}>GST Rate</Th>
                                <Th style={{ textAlign: "right" }}>Taxable Value</Th>
                                <Th style={{ textAlign: "right" }}>CGST</Th>
                                <Th style={{ textAlign: "right" }}>SGST</Th>
                                <Th style={{ textAlign: "right" }}>Total Tax</Th>
                                <Th style={{ textAlign: "right" }}>Return Gross</Th>
                            </Tr>
                        )}
                        {activeTab === "sales" && (
                            <Tr>
                                <Th style={{ width: "50px" }}>S.No</Th>
                                <Th>Bill No</Th>
                                <Th>Patient Type</Th>
                                <Th>Bill Date</Th>
                                <Th>Medicine / Item</Th>
                                <Th>Batch</Th>
                                <Th style={{ textAlign: "right" }}>GST Rate</Th>
                                <Th style={{ textAlign: "right" }}>Taxable Value</Th>
                                <Th style={{ textAlign: "right" }}>CGST</Th>
                                <Th style={{ textAlign: "right" }}>SGST</Th>
                                <Th style={{ textAlign: "right" }}>Total Tax</Th>
                                <Th style={{ textAlign: "right" }}>Gross Amount</Th>
                            </Tr>
                        )}
                        {activeTab === "consolidated" && (
                            <Tr>
                                <Th style={{ width: "50px" }}>S.No</Th>
                                <Th>Type</Th>
                                <Th>Bill / Return No</Th>
                                <Th>Orig Bill</Th>
                                <Th>Patient Type</Th>
                                <Th>Date</Th>
                                <Th>Medicine / Item</Th>
                                <Th>Batch</Th>
                                <Th style={{ textAlign: "right" }}>Rate</Th>
                                <Th style={{ textAlign: "right" }}>Taxable</Th>
                                <Th style={{ textAlign: "right" }}>CGST</Th>
                                <Th style={{ textAlign: "right" }}>SGST</Th>
                                <Th style={{ textAlign: "right" }}>Gross Amount</Th>
                            </Tr>
                        )}
                    </thead>
                    <tbody>
                        {displayedData.length > 0 ? (
                            displayedData.map((row, index) => {
                                const isReturn = row.type === "Return";
                                if (activeTab === "returns") {
                                    return (
                                        <Tr key={index}>
                                            <Td>{index + 1}</Td>
                                            <Td style={{ fontWeight: 700, color: colors.danger }}>{row.bill_no}</Td>
                                            <Td>{row.orig_bill_no || "—"}</Td>
                                            <Td><TypeBadge type={row.patient_type}>{row.patient_type}</TypeBadge></Td>
                                            <Td>{row.date ? dayjs(row.date).format("DD/MM/YYYY") : "N/A"}</Td>
                                            <Td style={{ fontWeight: 500 }}>{row.item_name || "N/A"}</Td>
                                            <Td>{row.batch_no || "—"}</Td>
                                            <Td style={{ textAlign: "right", fontWeight: 600 }}>{row.rate}%</Td>
                                            <Td style={{ textAlign: "right" }}>{formatINR(row.taxable_value)}</Td>
                                            <Td style={{ textAlign: "right" }}>{formatINR(row.cgst_amount)}</Td>
                                            <Td style={{ textAlign: "right" }}>{formatINR(row.sgst_amount)}</Td>
                                            <Td style={{ textAlign: "right", color: colors.danger, fontWeight: 600 }}>{formatINR(row.total_tax)}</Td>
                                            <Td style={{ textAlign: "right", fontWeight: 700, color: colors.danger }}>{formatINR(row.gross_amount)}</Td>
                                        </Tr>
                                    );
                                }
                                if (activeTab === "sales") {
                                    return (
                                        <Tr key={index}>
                                            <Td>{index + 1}</Td>
                                            <Td style={{ fontWeight: 700, color: colors.primary }}>{row.bill_no}</Td>
                                            <Td><TypeBadge type={row.patient_type}>{row.patient_type}</TypeBadge></Td>
                                            <Td>{row.date ? dayjs(row.date).format("DD/MM/YYYY") : "N/A"}</Td>
                                            <Td style={{ fontWeight: 500 }}>{row.item_name || "N/A"}</Td>
                                            <Td>{row.batch_no || "—"}</Td>
                                            <Td style={{ textAlign: "right", fontWeight: 600 }}>{row.rate}%</Td>
                                            <Td style={{ textAlign: "right" }}>{formatINR(row.taxable_value)}</Td>
                                            <Td style={{ textAlign: "right" }}>{formatINR(row.cgst_amount)}</Td>
                                            <Td style={{ textAlign: "right" }}>{formatINR(row.sgst_amount)}</Td>
                                            <Td style={{ textAlign: "right", color: colors.primary, fontWeight: 600 }}>{formatINR(row.total_tax)}</Td>
                                            <Td style={{ textAlign: "right", fontWeight: 700 }}>{formatINR(row.gross_amount)}</Td>
                                        </Tr>
                                    );
                                }
                                return (
                                    <Tr key={index} style={{ background: isReturn ? "#fffbfb" : "inherit" }}>
                                        <Td>{index + 1}</Td>
                                        <Td><TypeBadge type={row.type}>{row.type}</TypeBadge></Td>
                                        <Td style={{ fontWeight: 600, color: isReturn ? colors.danger : colors.primary }}>{row.bill_no}</Td>
                                        <Td>{row.orig_bill_no || "—"}</Td>
                                        <Td>{row.patient_type}</Td>
                                        <Td>{row.date ? dayjs(row.date).format("DD/MM/YYYY") : "N/A"}</Td>
                                        <Td style={{ fontWeight: 500 }}>{row.item_name || "N/A"}</Td>
                                        <Td>{row.batch_no || "—"}</Td>
                                        <Td style={{ textAlign: "right" }}>{row.rate}%</Td>
                                        <Td style={{ textAlign: "right", color: isReturn ? colors.danger : "inherit" }}>{formatINR(row.taxable_value)}</Td>
                                        <Td style={{ textAlign: "right", color: isReturn ? colors.danger : "inherit" }}>{formatINR(row.cgst_amount)}</Td>
                                        <Td style={{ textAlign: "right", color: isReturn ? colors.danger : "inherit" }}>{formatINR(row.sgst_amount)}</Td>
                                        <Td style={{ textAlign: "right", fontWeight: 700, color: isReturn ? colors.danger : colors.textMain }}>{formatINR(row.gross_amount)}</Td>
                                    </Tr>
                                );
                            })
                        ) : (
                            <Tr>
                                <Td colSpan="13" style={{ textAlign: "center", padding: "35px", color: colors.textMuted }}>
                                    {loading ? "Loading report data..." : `No records found for ${getReportTitle()} in the selected period.`}
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                </Table>
            </TableWrapper>

            {/* Standard Hospital Print Template */}
            <style>{`
                @media print {
                    @page { size: landscape; margin: 8mm; }
                    body * { visibility: hidden; }
                    #printable-report-area, #printable-report-area * { visibility: visible; }
                    #printable-report-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }
                    body { background: white !important; font-family: 'Times New Roman', serif; }
                }
            `}</style>

            <div id="printable-report-area" style={{ display: "none", background: "white", width: "100%", color: "black", fontFamily: "'Times New Roman', serif" }}>
                <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "8px", marginBottom: "12px" }}>
                    <h1 style={{ margin: 0, fontSize: "20px", textTransform: "uppercase", fontWeight: "bold" }}>
                        {localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL"}
                    </h1>
                    <p style={{ margin: "2px 0", fontSize: "11px" }}>
                        {localStorage.getItem("branch_name") || "Main Branch"}
                    </p>
                    <div style={{ fontSize: "14px", fontWeight: "bold", marginTop: "8px", textTransform: "uppercase", textDecoration: "underline" }}>
                        {getReportTitle()}
                    </div>
                </div>

                <table style={{ width: "100%", marginBottom: "12px", borderCollapse: "collapse", fontSize: "10px" }}>
                    <tbody>
                        <tr>
                            <td style={{ width: "30%", padding: "2px 0", border: "none" }}>
                                <strong>From Date:</strong> {fromDate ? dayjs(fromDate).format("DD/MM/YYYY") : "—"}
                            </td>
                            <td style={{ width: "30%", padding: "2px 0", border: "none" }}>
                                <strong>To Date:</strong> {toDate ? dayjs(toDate).format("DD/MM/YYYY") : "—"}
                            </td>
                            <td style={{ width: "40%", textAlign: "right", padding: "2px 0", border: "none" }}>
                                <strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "2px 0", border: "none" }}>
                                <strong>Report View:</strong> {activeTab === "returns" ? "Sales Return Register" : activeTab === "sales" ? "Sales Register" : "Consolidated"}
                            </td>
                            <td style={{ padding: "2px 0", border: "none" }}>
                                <strong>Patient Type:</strong> {patientType.toUpperCase()}
                            </td>
                            <td style={{ textAlign: "right", padding: "2px 0", border: "none" }}>
                                <strong>Printed By:</strong> {localStorage.getItem("employeeId") || "Staff"}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Print Summary Boxes */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", margin: "10px 0", border: "1px solid #000", padding: "8px", fontSize: "10px" }}>
                    {activeTab === "returns" ? (
                        <>
                            <div><strong>Return Taxable:</strong> {formatINR(returnSummary.total_taxable_value)}</div>
                            <div><strong>Return CGST:</strong> {formatINR(returnSummary.total_cgst)}</div>
                            <div><strong>Return SGST:</strong> {formatINR(returnSummary.total_sgst)}</div>
                            <div><strong>Total Return Tax:</strong> {formatINR(returnSummary.total_tax)}</div>
                            <div><strong>Return Gross Total:</strong> {formatINR(returnSummary.total_gross)}</div>
                        </>
                    ) : activeTab === "sales" ? (
                        <>
                            <div><strong>Sales Taxable:</strong> {formatINR(salesSummary.total_taxable_value)}</div>
                            <div><strong>Sales CGST:</strong> {formatINR(salesSummary.total_cgst)}</div>
                            <div><strong>Sales SGST:</strong> {formatINR(salesSummary.total_sgst)}</div>
                            <div><strong>Total Sales Tax:</strong> {formatINR(salesSummary.total_tax)}</div>
                            <div><strong>Sales Gross Total:</strong> {formatINR(salesSummary.total_gross)}</div>
                        </>
                    ) : (
                        <>
                            <div><strong>Gross Sales:</strong> {formatINR(netSummary.total_sales_gross || salesSummary.total_gross)}</div>
                            <div><strong>Gross Returns:</strong> {formatINR(netSummary.total_return_gross || returnSummary.total_gross)}</div>
                            <div><strong>Net Taxable:</strong> {formatINR(netSummary.total_taxable_value)}</div>
                            <div><strong>Net Tax:</strong> {formatINR(netSummary.total_tax)}</div>
                            <div><strong>Net Gross Total:</strong> {formatINR(netSummary.total_gross)}</div>
                        </>
                    )}
                </div>

                {/* Rate-wise GST Summary in Print */}
                {((activeTab === "returns" && returnSummary.rate_wise?.length > 0) ||
                  (activeTab === "sales" && salesSummary.rate_wise?.length > 0) ||
                  (activeTab === "consolidated" && netSummary.rate_wise?.length > 0)) && (
                    <div style={{ margin: "10px 0" }}>
                        <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "4px" }}>GST Rate-wise Summary</div>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f2f2f2" }}>
                                    <th style={{ border: "1px solid #000", padding: "4px 6px" }}>Rate %</th>
                                    <th style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>Taxable Value (₹)</th>
                                    <th style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>CGST (₹)</th>
                                    <th style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>SGST (₹)</th>
                                    <th style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>Total Tax (₹)</th>
                                    <th style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>Gross Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === "returns" ? returnSummary.rate_wise : activeTab === "sales" ? salesSummary.rate_wise : netSummary.rate_wise).map((r, i) => (
                                    <tr key={i}>
                                        <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold" }}>{r.rate}%</td>
                                        <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right" }}>{formatINR(r.taxable_value)}</td>
                                        <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right" }}>{formatINR(r.cgst_amount)}</td>
                                        <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right" }}>{formatINR(r.sgst_amount)}</td>
                                        <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right", fontWeight: "bold" }}>{formatINR(r.total_tax)}</td>
                                        <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right", fontWeight: "bold" }}>{formatINR(r.gross_amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Detailed Records Print Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", margin: "10px 0", fontSize: "9px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f2f2f2" }}>
                            <th style={{ border: "1px solid #000", padding: "4px 6px" }}>S.No</th>
                            {activeTab === "consolidated" && <th style={{ border: "1px solid #000", padding: "4px 6px" }}>Type</th>}
                            <th style={{ border: "1px solid #000", padding: "4px 6px" }}>{activeTab === "returns" ? "Return Bill No" : "Bill No"}</th>
                            {activeTab === "returns" && <th style={{ border: "1px solid #000", padding: "4px 6px" }}>Orig Bill</th>}
                            <th style={{ border: "1px solid #000", padding: "4px 6px" }}>Patient Type</th>
                            <th style={{ border: "1px solid #000", padding: "4px 6px" }}>Date</th>
                            <th style={{ border: "1px solid #000", padding: "4px 6px" }}>Medicine / Item Name</th>
                            <th style={{ border: "1px solid #000", padding: "4px 6px" }}>Batch</th>
                            <th style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>Rate</th>
                            <th style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>Taxable</th>
                            <th style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>CGST</th>
                            <th style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>SGST</th>
                            <th style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>Total Tax</th>
                            <th style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedData.length > 0 ? (
                            displayedData.map((row, index) => (
                                <tr key={index}>
                                    <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{index + 1}</td>
                                    {activeTab === "consolidated" && <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{row.type}</td>}
                                    <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold" }}>{row.bill_no}</td>
                                    {activeTab === "returns" && <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{row.orig_bill_no || "—"}</td>}
                                    <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{row.patient_type}</td>
                                    <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{row.date ? dayjs(row.date).format("DD/MM/YYYY") : "N/A"}</td>
                                    <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{row.item_name || "N/A"}</td>
                                    <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{row.batch_no || "—"}</td>
                                    <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right" }}>{row.rate}%</td>
                                    <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right" }}>{formatINR(row.taxable_value)}</td>
                                    <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right" }}>{formatINR(row.cgst_amount)}</td>
                                    <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right" }}>{formatINR(row.sgst_amount)}</td>
                                    <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right" }}>{formatINR(row.total_tax)}</td>
                                    <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right", fontWeight: "bold" }}>{formatINR(row.gross_amount)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="14" style={{ border: "1px solid #000", padding: "12px", textAlign: "center" }}>No records found.</td>
                            </tr>
                        )}
                        {displayedData.length > 0 && (
                            <tr style={{ fontWeight: "bold", backgroundColor: "#f2f2f2" }}>
                                <td colSpan={activeTab === "returns" ? "8" : activeTab === "consolidated" ? "8" : "7"} style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>
                                    TOTAL:
                                </td>
                                <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>
                                    {formatINR(activeTab === "returns" ? returnSummary.total_taxable_value : activeTab === "sales" ? salesSummary.total_taxable_value : netSummary.total_taxable_value)}
                                </td>
                                <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>
                                    {formatINR(activeTab === "returns" ? returnSummary.total_cgst : activeTab === "sales" ? salesSummary.total_cgst : netSummary.total_cgst)}
                                </td>
                                <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>
                                    {formatINR(activeTab === "returns" ? returnSummary.total_sgst : activeTab === "sales" ? salesSummary.total_sgst : netSummary.total_sgst)}
                                </td>
                                <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>
                                    {formatINR(activeTab === "returns" ? returnSummary.total_tax : activeTab === "sales" ? salesSummary.total_tax : netSummary.total_tax)}
                                </td>
                                <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right" }}>
                                    {formatINR(activeTab === "returns" ? returnSummary.total_gross : activeTab === "sales" ? salesSummary.total_gross : netSummary.total_gross)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Signatures */}
                <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", fontSize: "10px", pageBreakInside: "avoid" }}>
                    <div style={{ textAlign: "center", width: "180px", borderTop: "1px solid #000", paddingTop: "4px", fontWeight: "bold" }}>Prepared By</div>
                    <div style={{ textAlign: "center", width: "180px", borderTop: "1px solid #000", paddingTop: "4px", fontWeight: "bold" }}>Accounts Officer</div>
                    <div style={{ textAlign: "center", width: "180px", borderTop: "1px solid #000", paddingTop: "4px", fontWeight: "bold" }}>Authorized Signatory</div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default SalesTaxRegister;
