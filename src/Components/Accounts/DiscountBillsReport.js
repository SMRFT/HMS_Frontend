import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaSearch, FaFileExcel, FaPercentage, FaTags } from "react-icons/fa";
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

const SummaryCard = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
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
    font-weight: 800;
    color: ${props => props.color || colors.textMain};
`;

const SummaryLabel = styled.p`
    margin: 0;
    font-size: 0.75rem;
    font-weight: 700;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
`;

const FilterSection = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const CategoryPill = styled.span`
    display: inline-block;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    background: ${props => {
        const cat = (props.category || "").toUpperCase();
        if (cat.includes("PHARMACY")) return "#e0e7ff";
        if (cat.includes("DISCHARGE")) return "#fef3c7";
        if (cat.includes("LAB") || cat.includes("INVEST")) return "#ccfbf1";
        if (cat.includes("SCAN") || cat.includes("X-RAY") || cat.includes("CT")) return "#f3e8ff";
        return "#f1f5f9";
    }};
    color: ${props => {
        const cat = (props.category || "").toUpperCase();
        if (cat.includes("PHARMACY")) return "#4338ca";
        if (cat.includes("DISCHARGE")) return "#b45309";
        if (cat.includes("LAB") || cat.includes("INVEST")) return "#0f766e";
        if (cat.includes("SCAN") || cat.includes("X-RAY") || cat.includes("CT")) return "#7e22ce";
        return "#334155";
    }};
`;

const ChipsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
`;

const Chip = styled.div`
    background: ${colors.surface};
    border: 1px solid ${props => props.active ? colors.primary : colors.border};
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 0.8rem;
    font-weight: 600;
    color: ${props => props.active ? colors.primary : colors.textMain};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
    box-shadow: ${props => props.active ? "0 2px 4px rgba(13, 148, 136, 0.15)" : "none"};

    &:hover {
        border-color: ${colors.primary};
        color: ${colors.primary};
    }

    .count {
        background: ${props => props.active ? colors.primary : colors.background};
        color: ${props => props.active ? "#ffffff" : colors.textMuted};
        border-radius: 10px;
        padding: 1px 6px;
        font-size: 0.72rem;
    }
`;

const PrintTemplate = styled.div`
    display: none;
    @media print {
        display: block !important;
        width: 100%;
        background: white;
        color: black;
        font-family: 'Times New Roman', serif;
    }
`;

const PrintHeader = styled.div`
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 8px;
    margin-bottom: 12px;
    h1 { margin: 0; font-size: 20px; text-transform: uppercase; font-weight: bold; }
    p { margin: 2px 0; font-size: 11px; }
    .report-title { font-size: 14px; font-weight: bold; margin-top: 8px; text-transform: uppercase; text-decoration: underline; }
`;

const PrintInfoTable = styled.table`
    width: 100%;
    margin-bottom: 12px;
    border-collapse: collapse;
    font-size: 10px;
    td { padding: 3px 0; border: none !important; }
`;

const PrintTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 9.5px;
    th, td {
        border: 1px solid #000 !important;
        padding: 4px 5px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2 !important;
        font-weight: bold;
        text-transform: uppercase;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
`;

const PrintSignatures = styled.div`
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    page-break-inside: avoid;
    .sig-box {
        text-align: center;
        width: 180px;
        border-top: 1px solid #000;
        padding-top: 4px;
        font-weight: bold;
    }
`;

const DiscountBillsReport = ({ isModalView = false, startDate, endDate, initialBillType, initialOutlet }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [categoryFilter, setCategoryFilter] = useState(initialBillType || "All");
    const [outlet, setOutlet] = useState(initialOutlet || "all");
    const [outlets, setOutlets] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({
        total_discount_amount: 0,
        total_gross_amount: 0,
        total_net_amount: 0,
        count: 0,
        avg_discount_percent: 0,
        by_category: {},
        categories_list: []
    });
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_name = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
    const hospital_address = "51/24.Saradha College Road, Salem - 636007";
    const user_id = localStorage.getItem("employeeId") || localStorage.getItem("user_id") || "Staff";

    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const res = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
                if (res.success && Array.isArray(res.data)) {
                    setOutlets(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch outlets:", err);
            }
        };
        fetchOutlets();
    }, [HmsBaseUrl]);

    const getOutletName = (code) => {
        if (!code || code === "all") return "All Outlets";
        const found = outlets.find(o => String(o.outlet_code) === String(code) || String(o.outlet_id) === String(code) || String(o.id) === String(code));
        return found ? (found.outlet_name || found.name) : code;
    };

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (initialBillType) {
            setCategoryFilter(initialBillType);
        }
        if (initialOutlet) {
            setOutlet(initialOutlet);
        }
    }, [initialBillType, initialOutlet]);

    useEffect(() => {
        if (fromDate && toDate) {
            fetchReport();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDate, toDate, outlet, categoryFilter]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            let url = `${HmsBaseUrl}discount-bills-report/?from_date=${fromDate}&to_date=${toDate}`;
            if (outlet && outlet !== "all") {
                url += `&outlet_code=${encodeURIComponent(outlet)}`;
            }
            if (categoryFilter && categoryFilter !== "All" && categoryFilter !== "all") {
                url += `&category=${encodeURIComponent(categoryFilter)}`;
            }

            const res = await apiRequest(url, "GET");
            if (res.success && res.data) {
                const rows = Array.isArray(res.data) ? res.data : [];
                setReportData(rows);
                if (res.summary) {
                    setSummary(res.summary);
                } else {
                    const totalDisc = rows.reduce((s, r) => s + (r.discount_amount || 0), 0);
                    const totalGross = rows.reduce((s, r) => s + (r.gross_amount || 0), 0);
                    const totalNet = rows.reduce((s, r) => s + (r.net_amount || 0), 0);
                    setSummary({
                        total_discount_amount: totalDisc,
                        total_gross_amount: totalGross,
                        total_net_amount: totalNet,
                        count: rows.length,
                        avg_discount_percent: totalGross > 0 ? (totalDisc / totalGross * 100) : 0,
                        by_category: {},
                        categories_list: []
                    });
                }
            } else {
                setReportData([]);
                setSummary({
                    total_discount_amount: 0,
                    total_gross_amount: 0,
                    total_net_amount: 0,
                    count: 0,
                    avg_discount_percent: 0,
                    by_category: {},
                    categories_list: []
                });
            }
        } catch (error) {
            console.error("Error fetching discount bills report:", error);
            toast.error("Failed to load discount bills report");
        } finally {
            setLoading(false);
        }
    };

    // Filter by live search query
    const filteredRows = useMemo(() => {
        if (!searchQuery.trim()) return reportData;
        const q = searchQuery.toLowerCase();
        return reportData.filter(r => 
            (r.bill_no && r.bill_no.toLowerCase().includes(q)) ||
            (r.patient_name && r.patient_name.toLowerCase().includes(q)) ||
            (r.uhid && r.uhid.toLowerCase().includes(q)) ||
            (r.category && r.category.toLowerCase().includes(q)) ||
            (r.doctor && r.doctor.toLowerCase().includes(q)) ||
            (r.reason && r.reason.toLowerCase().includes(q)) ||
            (r.user && r.user.toLowerCase().includes(q)) ||
            (r.ip_number && r.ip_number.toLowerCase().includes(q))
        );
    }, [reportData, searchQuery]);

    // Calculate totals of currently filtered rows
    const activeTotals = useMemo(() => {
        const gross = filteredRows.reduce((s, r) => s + (r.gross_amount || 0), 0);
        const disc = filteredRows.reduce((s, r) => s + (r.discount_amount || 0), 0);
        const net = filteredRows.reduce((s, r) => s + (r.net_amount || 0), 0);
        const count = filteredRows.length;
        const avgPct = gross > 0 ? ((disc / gross) * 100) : 0;
        return { gross, disc, net, count, avgPct };
    }, [filteredRows]);

    const handlePrint = () => {
        printAccountsReport("printable-discount-report", "landscape");
    };

    const handleExportExcel = () => {
        if (!filteredRows || filteredRows.length === 0) {
            toast.warning("No data to export");
            return;
        }
        try {
            const excelRows = filteredRows.map((row, index) => ({
                "S.No": index + 1,
                "Bill No": row.bill_no || "",
                "Bill Date": row.bill_date || row.date || "",
                "UHID": row.uhid || "",
                "Patient Name": row.patient_name || "",
                "IP No": row.ip_number || "",
                "Room No": row.room_no || "",
                "Doctor": row.doctor || "",
                "Bill Category": row.category || "",
                "Gross Amount (₹)": Number((row.gross_amount || 0).toFixed(2)),
                "Discount (%)": Number((row.discount_percent || 0).toFixed(2)),
                "Discount Amount (₹)": Number((row.discount_amount || 0).toFixed(2)),
                "Net Amount (₹)": Number((row.net_amount || 0).toFixed(2)),
                "Reason / Remarks": row.reason || "",
                "Cashier / User": row.user || row.cashier_id || "",
                "Payment Mode": row.payment_mode || "Cash"
            }));

            // Add Summary Row at bottom
            excelRows.push({
                "S.No": "TOTAL",
                "Bill No": `${activeTotals.count} Bills`,
                "Bill Date": "",
                "UHID": "",
                "Patient Name": "",
                "IP No": "",
                "Room No": "",
                "Doctor": "",
                "Bill Category": "",
                "Gross Amount (₹)": Number(activeTotals.gross.toFixed(2)),
                "Discount (%)": Number(activeTotals.avgPct.toFixed(2)),
                "Discount Amount (₹)": Number(activeTotals.disc.toFixed(2)),
                "Net Amount (₹)": Number(activeTotals.net.toFixed(2)),
                "Reason / Remarks": "",
                "Cashier / User": "",
                "Payment Mode": ""
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelRows);
            ws["!cols"] = Object.keys(excelRows[0] || {}).map(k => ({ wch: Math.max(k.length + 4, 14) }));
            XLSX.utils.book_append_sheet(wb, ws, "Discount Bills");
            XLSX.writeFile(wb, `Discount_Bills_Report_${fromDate}_to_${toDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    return (
        <PageWrapper style={isModalView ? { padding: 0, minHeight: 'auto', background: 'transparent' } : {}}>
            {!isModalView && (
                <SectionTitle className="no-print">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FaPercentage style={{ color: colors.primary, fontSize: "1.5rem" }} />
                        <div>
                            <h2 style={{ margin: 0 }}>Discount Bills Report</h2>
                            <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: colors.textMuted }}>
                                Comprehensive audit of all discounted bills across Pharmacy, Investigation, Discharge, and Registration
                            </p>
                        </div>
                    </div>
                </SectionTitle>
            )}

            <FilterSection className="no-print">
                <FormRow>
                    <InputWrapper>
                        <Label>From Date</Label>
                        <DatePicker
                            value={fromDate ? dayjs(fromDate) : null}
                            onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : fromDate)}
                            format="DD/MM/YYYY"
                            allowClear={false}
                            style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>To Date</Label>
                        <DatePicker
                            value={toDate ? dayjs(toDate) : null}
                            onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : toDate)}
                            format="DD/MM/YYYY"
                            allowClear={false}
                            style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Outlet / Counter</Label>
                        <Select
                            value={outlet}
                            onChange={(e) => setOutlet(e.target.value)}
                            style={{ height: '40px', borderRadius: '8px' }}
                        >
                            <option value="all">All Outlets</option>
                            {outlets.map((o) => (
                                <option key={o.outlet_code || o.outlet_id || o.id} value={o.outlet_code || o.outlet_id}>
                                    {o.outlet_name || o.name} ({o.outlet_code || o.outlet_id})
                                </option>
                            ))}
                        </Select>
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Bill Category</Label>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{ height: '40px', borderRadius: '8px' }}
                        >
                            <option value="All">All Categories</option>
                            <option value="PHARMACY OP BILL (SH)">Pharmacy OP</option>
                            <option value="PHARMACY IP BILL (SH)">Pharmacy IP</option>
                            <option value="DISCHARGE BILL">Discharge Bill</option>
                            <option value="LAB BILL (SH)">Lab Bill</option>
                            <option value="CT SCAN (SH)">CT Scan</option>
                            <option value="SCANNING (SH)">Scanning</option>
                            <option value="X - RAY (SH)">X-Ray</option>
                            <option value="ECG (SH)">ECG</option>
                            <option value="PET_CT(SH)">PET CT</option>
                            <option value="PROCEDURE BILL (SH)">Procedure Bill</option>
                        </Select>
                    </InputWrapper>
                </FormRow>

                <FormRow style={{ marginTop: '14px', alignItems: 'flex-end' }}>
                    <InputWrapper style={{ flex: 1 }}>
                        <Label>Live Search</Label>
                        <Input
                            placeholder="Search by Bill No, Patient Name, UHID, Doctor, Reason, Cashier..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ height: '40px', borderRadius: '8px' }}
                        />
                    </InputWrapper>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                        <Button onClick={fetchReport} disabled={loading} style={{ height: "40px" }}>
                            <FaSearch style={{ marginRight: "8px" }} /> {loading ? "Searching..." : "Search"}
                        </Button>
                        <Button
                            onClick={handleExportExcel}
                            disabled={loading || filteredRows.length === 0}
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

            {isModalView && (
                <div style={{ textAlign: "center", marginBottom: "16px", padding: "10px 0" }}>
                    <h2 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em", color: "#000" }}>
                        {hospital_name}
                    </h2>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111" }}>
                        Discount Bills Report From {dayjs(fromDate).format("DD/MM/YYYY")} To {dayjs(toDate).format("DD/MM/YYYY")}.
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#333", marginTop: "2px" }}>
                        Printed As On {dayjs().format("DD/MM/YYYY HH:mm:ss")}.
                    </div>
                </div>
            )}

            {/* KPI Summary Cards */}
            {!isModalView && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "20px" }} className="no-print">
                    <SummaryCard color="#dc2626">
                        <SummaryLabel>Total Discount Amount</SummaryLabel>
                        <SummaryValue color="#dc2626">₹{activeTotals.disc.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color={colors.primary}>
                        <SummaryLabel>Discounted Bills</SummaryLabel>
                        <SummaryValue color={colors.primary}>{activeTotals.count}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color="#475569">
                        <SummaryLabel>Total Gross Amount</SummaryLabel>
                        <SummaryValue color="#334155">₹{activeTotals.gross.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color="#16a34a">
                        <SummaryLabel>Total Net Amount</SummaryLabel>
                        <SummaryValue color="#16a34a">₹{activeTotals.net.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard color="#8b5cf6">
                        <SummaryLabel>Avg Discount %</SummaryLabel>
                        <SummaryValue color="#8b5cf6">{activeTotals.avgPct.toFixed(2)}%</SummaryValue>
                    </SummaryCard>
                </div>
            )}

            {/* Category Quick Breakdown Chips */}
            {!isModalView && summary.by_category && Object.keys(summary.by_category).length > 0 && (
                <ChipsContainer className="no-print">
                    <Chip 
                        active={categoryFilter === "All" || categoryFilter === "all"} 
                        onClick={() => setCategoryFilter("All")}
                    >
                        <FaTags size={12} /> All Categories <span className="count">{summary.count || 0}</span>
                    </Chip>
                    {Object.entries(summary.by_category).map(([cat, info]) => (
                        <Chip
                            key={cat}
                            active={categoryFilter === cat}
                            onClick={() => setCategoryFilter(categoryFilter === cat ? "All" : cat)}
                        >
                            {cat} <span className="count">{info.count} (₹{Number(info.discount_amount || 0).toFixed(0)})</span>
                        </Chip>
                    ))}
                </ChipsContainer>
            )}

            {/* Data Table */}
            <TableWrapper className="no-print">
                <Table>
                    <thead>
                        <Tr>
                            <Th style={{ width: "40px" }}>S.No</Th>
                            <Th>Bill No</Th>
                            <Th>Date & Time</Th>
                            <Th>UHID</Th>
                            <Th>Patient Name</Th>
                            <Th>Category / Dept</Th>
                            <Th>Doctor / Ref</Th>
                            <Th style={{ textAlign: "right" }}>Gross (₹)</Th>
                            <Th style={{ textAlign: "right" }}>Disc %</Th>
                            <Th style={{ textAlign: "right" }}>Discount (₹)</Th>
                            <Th style={{ textAlign: "right" }}>Net (₹)</Th>
                            <Th>Reason / Remarks</Th>
                            <Th>Cashier</Th>
                            <Th>Payment Mode</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {filteredRows.length > 0 ? (
                            filteredRows.map((row, index) => (
                                <Tr key={row.id || index}>
                                    <Td>{index + 1}</Td>
                                    <Td style={{ fontWeight: 700, color: colors.textMain }}>
                                        {row.bill_no}
                                        {row.ip_number && (
                                            <div style={{ fontSize: "0.72rem", color: colors.textMuted, fontWeight: 500 }}>
                                                IP: {row.ip_number} {row.room_no ? `| Rm: ${row.room_no}` : ""}
                                            </div>
                                        )}
                                    </Td>
                                    <Td style={{ whiteSpace: "nowrap" }}>
                                        {row.bill_date ? dayjs(row.bill_date).format("DD/MM/YYYY HH:mm") : (row.date_display || row.date)}
                                    </Td>
                                    <Td>{row.uhid || "—"}</Td>
                                    <Td style={{ fontWeight: 600 }}>{row.patient_name || "—"}</Td>
                                    <Td>
                                        <CategoryPill category={row.category}>{row.category}</CategoryPill>
                                    </Td>
                                    <Td>{row.doctor || "—"}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{(row.gross_amount || 0).toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right", color: "#8b5cf6", fontWeight: 600 }}>
                                        {(row.discount_percent || 0).toFixed(1)}%
                                    </Td>
                                    <Td style={{ textAlign: "right", fontWeight: 800, color: "#dc2626" }}>
                                        -₹{(row.discount_amount || 0).toFixed(2)}
                                    </Td>
                                    <Td style={{ textAlign: "right", fontWeight: 700, color: "#16a34a" }}>
                                        ₹{(row.net_amount || 0).toFixed(2)}
                                    </Td>
                                    <Td style={{ maxWidth: "160px", fontSize: "0.8rem", color: colors.textMuted }}>
                                        {row.reason || "—"}
                                    </Td>
                                    <Td style={{ fontWeight: 600 }}>{row.user || row.cashier_id || "STAFF"}</Td>
                                    <Td style={{ fontSize: "0.8rem" }}>{row.payment_mode || "Cash"}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="14" style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                                    {loading ? "Fetching discount records..." : "No discount bills found for the selected period and filters."}
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {filteredRows.length > 0 && (
                        <tfoot>
                            <Tr style={{ background: "#f8fafc", fontWeight: 800 }}>
                                <Td colSpan="7" style={{ textAlign: "right", fontSize: "0.85rem" }}>
                                    TOTAL ({activeTotals.count} Bills):
                                </Td>
                                <Td style={{ textAlign: "right" }}>₹{activeTotals.gross.toFixed(2)}</Td>
                                <Td style={{ textAlign: "right", color: "#8b5cf6" }}>{activeTotals.avgPct.toFixed(1)}%</Td>
                                <Td style={{ textAlign: "right", color: "#dc2626" }}>-₹{activeTotals.disc.toFixed(2)}</Td>
                                <Td style={{ textAlign: "right", color: "#16a34a" }}>₹{activeTotals.net.toFixed(2)}</Td>
                                <Td colSpan="3"></Td>
                            </Tr>
                        </tfoot>
                    )}
                </Table>
            </TableWrapper>

            {/* Printable Area */}
            <style>{`
                @media print {
                    @page { size: landscape; margin: 8mm; }
                    body * { visibility: hidden; }
                    #printable-discount-report, #printable-discount-report * { visibility: visible; }
                    #printable-discount-report {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }
                    body { background: white !important; font-family: 'Times New Roman', serif; }
                }
            `}</style>

            <PrintTemplate id="printable-discount-report">
                <PrintHeader>
                    <h1>{hospital_name}</h1>
                    <p>{hospital_address}</p>
                    <div className="report-title">Discount Bills Register / Concession Report</div>
                </PrintHeader>

                <PrintInfoTable>
                    <tbody>
                        <tr>
                            <td style={{ width: "30%" }}><strong>From Date:</strong> {dayjs(fromDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "30%" }}><strong>To Date:</strong> {dayjs(toDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "40%", textAlign: "right" }}><strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}</td>
                        </tr>
                        <tr>
                            <td><strong>Outlet / Counter:</strong> {getOutletName(outlet)}</td>
                            <td><strong>Category:</strong> {categoryFilter}</td>
                            <td style={{ textAlign: "right" }}><strong>Printed By:</strong> {user_id}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Discount Bills:</strong> {activeTotals.count}</td>
                            <td><strong>Total Discount:</strong> ₹{activeTotals.disc.toFixed(2)}</td>
                            <td style={{ textAlign: "right" }}><strong>Net Realized:</strong> ₹{activeTotals.net.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </PrintInfoTable>

                <PrintTable>
                    <thead>
                        <tr>
                            <th style={{ width: "25px" }}>S.No</th>
                            <th>Bill No</th>
                            <th>Date</th>
                            <th>UHID</th>
                            <th>Patient Name</th>
                            <th>Category</th>
                            <th>Doctor</th>
                            <th style={{ textAlign: "right" }}>Gross (₹)</th>
                            <th style={{ textAlign: "right" }}>Disc %</th>
                            <th style={{ textAlign: "right" }}>Discount (₹)</th>
                            <th style={{ textAlign: "right" }}>Net (₹)</th>
                            <th>Reason / Remarks</th>
                            <th>Cashier</th>
                            <th>Mode</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.map((row, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{row.bill_no}</td>
                                <td>{row.date_display || row.date}</td>
                                <td>{row.uhid || "—"}</td>
                                <td>{row.patient_name || "—"}</td>
                                <td>{row.category}</td>
                                <td>{row.doctor || "—"}</td>
                                <td style={{ textAlign: "right" }}>₹{(row.gross_amount || 0).toFixed(2)}</td>
                                <td style={{ textAlign: "right" }}>{(row.discount_percent || 0).toFixed(1)}%</td>
                                <td style={{ textAlign: "right", fontWeight: "bold" }}>₹{(row.discount_amount || 0).toFixed(2)}</td>
                                <td style={{ textAlign: "right" }}>₹{(row.net_amount || 0).toFixed(2)}</td>
                                <td>{row.reason || "—"}</td>
                                <td>{row.user || row.cashier_id || "STAFF"}</td>
                                <td>{row.payment_mode || "Cash"}</td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: "bold", background: "#f2f2f2" }}>
                            <td colSpan="7" style={{ textAlign: "right" }}>TOTAL ({activeTotals.count} Bills):</td>
                            <td style={{ textAlign: "right" }}>₹{activeTotals.gross.toFixed(2)}</td>
                            <td style={{ textAlign: "right" }}>{activeTotals.avgPct.toFixed(1)}%</td>
                            <td style={{ textAlign: "right" }}>₹{activeTotals.disc.toFixed(2)}</td>
                            <td style={{ textAlign: "right" }}>₹{activeTotals.net.toFixed(2)}</td>
                            <td colSpan="3"></td>
                        </tr>
                    </tbody>
                </PrintTable>

                <PrintSignatures>
                    <div className="sig-box">Prepared By</div>
                    <div className="sig-box">Accounts Officer</div>
                    <div className="sig-box">Authorized Signatory</div>
                </PrintSignatures>
            </PrintTemplate>
        </PageWrapper>
    );
};

export default DiscountBillsReport;
