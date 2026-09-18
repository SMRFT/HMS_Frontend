import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaSearch, FaFileExcel, FaCreditCard } from "react-icons/fa";
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
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
    border-left: 4px solid ${props => props.color || colors.primary};
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 80px;
    animation: ${fadeIn} 0.3s ease-out;
`;

const SummaryValue = styled.h3`
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
    color: ${props => props.color || colors.textMain};
`;

const SummaryLabel = styled.p`
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
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

const SectionHeaderTr = styled(Tr)`
    background: #e2e8f0 !important;
    td {
        font-weight: 800 !important;
        font-size: 0.82rem !important;
        color: #0f172a !important;
        padding: 8px 12px !important;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: #e2e8f0 !important;
        border-top: 1px solid #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
    }
`;

const DateHeaderTr = styled(Tr)`
    background: #0f172a !important;
    td {
        font-weight: 700 !important;
        font-size: 0.85rem !important;
        color: #ffffff !important;
        padding: 8px 12px !important;
        background: #0f172a !important;
    }
`;

const SubtotalTr = styled(Tr)`
    background: #f8fafc !important;
    td {
        font-weight: 700 !important;
        font-size: 0.8rem !important;
        padding: 6px 12px !important;
        border-top: 1px solid #cbd5e1 !important;
        border-bottom: 2px solid #94a3b8 !important;
    }
`;

const GrandTotalTr = styled(Tr)`
    background: #0f172a !important;
    td {
        font-weight: 800 !important;
        font-size: 0.9rem !important;
        color: #ffffff !important;
        padding: 10px 12px !important;
        background: #0f172a !important;
    }
`;

const PrintTemplate = styled.div`
    display: none;
`;

const CreditCardReport = ({ isModalView = false, startDate, endDate, initialBillType = "All" }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [categoryFilter, setCategoryFilter] = useState(initialBillType || "all");
    const [searchQuery, setSearchQuery] = useState("");
    const [reportData, setReportData] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    const [summary, setSummary] = useState({ total_transactions: 0, total_amount: 0, by_category: {} });
    const [grandTotal, setGrandTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_name = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
    const hospital_address = "51/24.Saradha College Road, Salem - 636007";
    const user_id = localStorage.getItem("employeeId") || localStorage.getItem("user_id") || "Staff";

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (initialBillType) {
            setCategoryFilter(initialBillType === "All" || initialBillType === "all" ? "all" : initialBillType);
        }
    }, [initialBillType]);

    useEffect(() => {
        if (fromDate && toDate) fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDate, toDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await apiRequest(`${HmsBaseUrl}credit-card-report/?from_date=${fromDate}&to_date=${toDate}`, "GET");
            if (response.success && response.data) {
                const flatRows = Array.isArray(response.data.data) ? response.data.data : [];
                const groups = Array.isArray(response.data.grouped_data) ? response.data.grouped_data : [];
                setReportData(flatRows);
                setGroupedData(groups);
                setSummary(response.data.summary || {
                    total_transactions: flatRows.length,
                    total_amount: response.data.grand_total || flatRows.reduce((s, r) => s + (r.amount || 0), 0),
                    by_category: {}
                });
                setGrandTotal(response.data.grand_total || 0);
            } else {
                toast.error(response?.data?.message || "Failed to load Credit Card Report");
            }
        } catch (error) {
            console.error("Error fetching credit card report:", error);
            toast.error("Error loading Credit Card Report");
        } finally {
            setLoading(false);
        }
    };

    const formatINR = (val) => {
        const num = parseFloat(val) || 0;
        return num.toFixed(2);
    };

    // Extract unique categories for the dropdown filter
    const categoriesList = useMemo(() => {
        const set = new Set();
        reportData.forEach(r => {
            if (r.category) set.add(r.category);
        });
        return Array.from(set).sort();
    }, [reportData]);

    // Filtered data based on category filter and search text
    const filteredGroupedData = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        const filterVal = (categoryFilter || "all").toLowerCase().trim();
        let runningSlno = 1;

        return groupedData.map(dGroup => {
            const matchingSections = [];
            let dateTotal = 0;
            let dateCount = 0;

            (dGroup.sections || []).forEach(sec => {
                if (filterVal !== "all") {
                    const secCat = (sec.category || "").toLowerCase().trim();
                    const filterNorm = filterVal.replace(/[\s\(\)\-_]/g, "");
                    const secNorm = secCat.replace(/[\s\(\)\-_]/g, "");

                    const matches = secCat === filterVal ||
                        secNorm === filterNorm ||
                        secNorm.includes(filterNorm) ||
                        filterNorm.includes(secNorm);

                    if (!matches) {
                        return;
                    }
                }

                const matchingItems = (sec.items || []).filter(item => {
                    if (!q) return true;
                    return (
                        (item.patient_name && String(item.patient_name).toLowerCase().includes(q)) ||
                        (item.bill_no && String(item.bill_no).toLowerCase().includes(q)) ||
                        (item.mr_no && String(item.mr_no).toLowerCase().includes(q)) ||
                        (item.card_type && String(item.card_type).toLowerCase().includes(q)) ||
                        (item.card_number && String(item.card_number).toLowerCase().includes(q)) ||
                        (item.user && String(item.user).toLowerCase().includes(q)) ||
                        (item.category && String(item.category).toLowerCase().includes(q))
                    );
                }).map(item => ({
                    ...item,
                    displaySlno: runningSlno++
                }));

                if (matchingItems.length > 0) {
                    const secTotal = matchingItems.reduce((sum, it) => sum + (it.amount || 0), 0);
                    matchingSections.push({
                        category: sec.category,
                        items: matchingItems,
                        total: secTotal,
                        count: matchingItems.length
                    });
                    dateTotal += secTotal;
                    dateCount += matchingItems.length;
                }
            });

            return {
                ...dGroup,
                sections: matchingSections,
                date_total: dateTotal,
                count: dateCount
            };
        }).filter(dGroup => dGroup.sections.length > 0);
    }, [groupedData, categoryFilter, searchQuery]);

    const filteredTotalAmount = useMemo(() => {
        return filteredGroupedData.reduce((sum, dg) => sum + (dg.date_total || 0), 0);
    }, [filteredGroupedData]);

    const filteredTotalCount = useMemo(() => {
        return filteredGroupedData.reduce((sum, dg) => sum + (dg.count || 0), 0);
    }, [filteredGroupedData]);

    const handlePrint = () => printAccountsReport("printable-credit-card-report-area", "portrait");

    const handleExportExcel = () => {
        if (!filteredGroupedData || filteredGroupedData.length === 0) {
            toast.warning("No data to export");
            return;
        }

        try {
            const excelRows = [];
            filteredGroupedData.forEach(dg => {
                excelRows.push({
                    "Slno": `Date: ${dg.date_display || dg.date}`,
                    "Name": "",
                    "Bill Number": "",
                    "MR. No": "",
                    "Card Type": "",
                    "Card Number": "",
                    "Bill Amount": "",
                    "User": ""
                });

                dg.sections.forEach(sec => {
                    excelRows.push({
                        "Slno": sec.category,
                        "Name": "",
                        "Bill Number": "",
                        "MR. No": "",
                        "Card Type": "",
                        "Card Number": "",
                        "Bill Amount": "",
                        "User": ""
                    });

                    sec.items.forEach(it => {
                        excelRows.push({
                            "Slno": it.displaySlno || it.slno,
                            "Name": it.patient_name || "",
                            "Bill Number": it.bill_no || "",
                            "MR. No": it.mr_no || "",
                            "Card Type": it.card_type || "",
                            "Card Number": it.card_number || "",
                            "Bill Amount": Number((it.amount || 0).toFixed(2)),
                            "User": it.user || ""
                        });
                    });

                    excelRows.push({
                        "Slno": "",
                        "Name": "",
                        "Bill Number": "",
                        "MR. No": "",
                        "Card Type": "",
                        "Card Number": "Total - >",
                        "Bill Amount": Number((sec.total || 0).toFixed(2)),
                        "User": ""
                    });
                });
            });

            excelRows.push({
                "Slno": "",
                "Name": "",
                "Bill Number": "",
                "MR. No": "",
                "Card Type": "",
                "Card Number": "Grand Total - >",
                "Bill Amount": Number(filteredTotalAmount.toFixed(2)),
                "User": ""
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelRows);
            ws["!cols"] = [
                { wch: 8 },
                { wch: 26 },
                { wch: 16 },
                { wch: 16 },
                { wch: 16 },
                { wch: 16 },
                { wch: 14 },
                { wch: 14 }
            ];
            XLSX.utils.book_append_sheet(wb, ws, "Credit Card Report");
            XLSX.writeFile(wb, `Credit_Card_Bills_Report_${fromDate}_to_${toDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    return (
        <PageWrapper style={isModalView ? { padding: 0 } : {}}>
            {/* Prominent Header Banner */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "#ffffff",
                padding: "16px 24px",
                borderRadius: "12px",
                marginBottom: "20px",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
                border: "1px solid #334155"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                        background: "rgba(56, 189, 248, 0.2)",
                        padding: "10px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <FaCreditCard size={24} color="#38bdf8" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
                            Credit Card Report
                        </h2>
                        <span style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 500 }}>
                            Detailed breakdown of categorized card collections across all departments
                        </span>
                    </div>
                </div>
                <div style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#f8fafc"
                }}>
                    Period: {dayjs(fromDate).format("DD/MM/YYYY")} — {dayjs(toDate).format("DD/MM/YYYY")}
                </div>
            </div>

            {/* FILTER SECTION */}
            <FilterSection>
                <FormRow style={{ display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "flex-end" }}>
                    <InputWrapper style={{ flex: "1 1 180px" }}>
                        <Label>From Date</Label>
                        <DatePicker
                            value={fromDate ? dayjs(fromDate) : null}
                            onChange={(date, dateString) => setFromDate(dateString)}
                            format="YYYY-MM-DD"
                            style={{ width: "100%", height: "40px" }}
                            allowClear={false}
                        />
                    </InputWrapper>

                    <InputWrapper style={{ flex: "1 1 180px" }}>
                        <Label>To Date</Label>
                        <DatePicker
                            value={toDate ? dayjs(toDate) : null}
                            onChange={(date, dateString) => setToDate(dateString)}
                            format="YYYY-MM-DD"
                            style={{ width: "100%", height: "40px" }}
                            allowClear={false}
                        />
                    </InputWrapper>

                    <InputWrapper style={{ flex: "1 1 200px" }}>
                        <Label>Category / Bill Type</Label>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{ height: "40px" }}
                        >
                            <option value="all">All Categories</option>
                            {categoriesList.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </Select>
                    </InputWrapper>

                    <InputWrapper style={{ flex: "1 1 200px" }}>
                        <Label>Search</Label>
                        <Input
                            type="text"
                            placeholder="Search patient, bill, MR no, user..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ height: "40px" }}
                        />
                    </InputWrapper>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <Button onClick={fetchReport} disabled={loading} style={{ height: "40px" }}>
                            <FaSearch style={{ marginRight: "6px" }} /> {loading ? "Searching..." : "Search"}
                        </Button>
                        <Button
                            onClick={handleExportExcel}
                            disabled={loading || filteredGroupedData.length === 0}
                            style={{ height: "40px", background: "#16a34a", borderColor: "#16a34a", color: "#fff" }}
                        >
                            <FaFileExcel style={{ marginRight: "6px" }} /> Export Excel
                        </Button>
                        <Button 
                            onClick={handlePrint} 
                            disabled={loading || filteredGroupedData.length === 0}
                            secondary 
                            style={{ height: "40px" }}
                        >
                            <FaPrint style={{ marginRight: "6px" }} /> Print
                        </Button>
                    </div>
                </FormRow>
            </FilterSection>

            {/* SUMMARY CARDS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginBottom: "20px" }}>
                <SummaryCard color={colors.primary}>
                    <SummaryLabel>Total Transactions</SummaryLabel>
                    <SummaryValue color={colors.primary}>{filteredTotalCount}</SummaryValue>
                </SummaryCard>
                <SummaryCard color="#16a34a">
                    <SummaryLabel>Total Card Collection</SummaryLabel>
                    <SummaryValue color="#16a34a">₹{formatINR(filteredTotalAmount)}</SummaryValue>
                </SummaryCard>
                {Object.entries(summary.by_category || {}).slice(0, 3).map(([cat, amt]) => (
                    <SummaryCard key={cat} color="#0284c7">
                        <SummaryLabel>{cat}</SummaryLabel>
                        <SummaryValue color="#0284c7">₹{formatINR(amt)}</SummaryValue>
                    </SummaryCard>
                ))}
            </div>

            {/* GROUPED TRANSACTIONS TABLE */}
            <TableWrapper style={{ overflowX: "auto", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff" }}>
                <Table style={{ minWidth: "900px", borderCollapse: "collapse" }}>
                    <thead>
                        <Tr style={{ background: "#0f172a" }}>
                            <Th style={{ width: "60px", color: "#fff" }}>Slno</Th>
                            <Th style={{ color: "#fff" }}>Name</Th>
                            <Th style={{ width: "130px", color: "#fff" }}>Bill Number</Th>
                            <Th style={{ width: "130px", color: "#fff" }}>MR. No</Th>
                            <Th style={{ width: "130px", color: "#fff" }}>Card Type</Th>
                            <Th style={{ width: "130px", color: "#fff" }}>Card Number</Th>
                            <Th style={{ width: "120px", textAlign: "right", color: "#fff" }}>Bill Amount</Th>
                            <Th style={{ width: "110px", color: "#fff" }}>User</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={8} style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                                    Loading credit card collection records...
                                </Td>
                            </Tr>
                        ) : filteredGroupedData.length > 0 ? (
                            <>
                                {filteredGroupedData.map((dGroup, dIdx) => (
                                    <React.Fragment key={dIdx}>
                                        {/* Date Header Row */}
                                        <DateHeaderTr>
                                            <Td colSpan={8}>
                                                Date : {dGroup.date_display || dGroup.date}
                                            </Td>
                                        </DateHeaderTr>

                                        {/* Category Sections */}
                                        {dGroup.sections.map((sec, sIdx) => (
                                            <React.Fragment key={`${dIdx}-${sIdx}`}>
                                                {/* Section Header Row */}
                                                <SectionHeaderTr>
                                                    <Td colSpan={8}>
                                                        {sec.category}
                                                    </Td>
                                                </SectionHeaderTr>

                                                {/* Section Transaction Items */}
                                                {sec.items.map((row, rIdx) => (
                                                    <Tr key={`${dIdx}-${sIdx}-${rIdx}`} style={{ background: rIdx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                                                        <Td style={{ textAlign: "center", fontWeight: 500 }}>{row.displaySlno || row.slno}</Td>
                                                        <Td style={{ fontWeight: 600 }}>{row.patient_name}</Td>
                                                        <Td style={{ fontFamily: "monospace" }}>{row.bill_no}</Td>
                                                        <Td style={{ fontFamily: "monospace", color: "#475569" }}>{row.mr_no || "—"}</Td>
                                                        <Td>{row.card_type || "VISA CARD"}</Td>
                                                        <Td>{row.card_number || "PAYTM"}</Td>
                                                        <Td style={{ textAlign: "right", fontWeight: 600, fontFamily: "monospace" }}>
                                                            {formatINR(row.amount)}
                                                        </Td>
                                                        <Td style={{ fontWeight: 500, color: "#334155" }}>{row.user || "STAFF"}</Td>
                                                    </Tr>
                                                ))}

                                                {/* Section Subtotal */}
                                                <SubtotalTr>
                                                    <Td colSpan={6} style={{ textAlign: "right", fontWeight: 700, color: "#1e293b" }}>
                                                        Total - &gt;
                                                    </Td>
                                                    <Td style={{ textAlign: "right", fontWeight: 700, color: "#1e293b", fontFamily: "monospace" }}>
                                                        {formatINR(sec.total)}
                                                    </Td>
                                                    <Td></Td>
                                                </SubtotalTr>
                                            </React.Fragment>
                                        ))}
                                    </React.Fragment>
                                ))}

                                {/* Grand Total Row */}
                                <GrandTotalTr>
                                    <Td colSpan={6} style={{ textAlign: "right", fontWeight: 800 }}>
                                        Grand Total - &gt;
                                    </Td>
                                    <Td style={{ textAlign: "right", fontWeight: 800, fontFamily: "monospace" }}>
                                        {formatINR(filteredTotalAmount)}
                                    </Td>
                                    <Td></Td>
                                </GrandTotalTr>
                            </>
                        ) : (
                            <Tr>
                                <Td colSpan={8} style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                                    No credit card collections found for the selected date range.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                </Table>
            </TableWrapper>

            {/* PRINT TEMPLATE MATCHING OFFICIAL FORMAT */}
            <PrintTemplate id="printable-credit-card-report-area">
                <div style={{ padding: "10px", fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", color: "#000" }}>
                    <div style={{ textAlign: "center", marginBottom: "8px" }}>
                        <div style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase" }}>{hospital_name}</div>
                        <div style={{ fontSize: "10px" }}>{hospital_address}</div>
                        <div style={{ fontSize: "11px", fontWeight: "bold", margin: "4px 0" }}>
                            Credit Card Bills Report From {dayjs(fromDate).format("DD/MM/YYYY")} To {dayjs(toDate).format("DD/MM/YYYY")}
                        </div>
                        <div style={{ fontSize: "10px" }}>Report Printed On {dayjs().format("DD/MM/YYYY [At] HH:mm:ss")}</div>
                        <div style={{ fontSize: "12px", fontWeight: "bold", marginTop: "4px" }}>***CREDIT CARD***</div>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", marginTop: "10px" }}>
                        <thead>
                            <tr style={{ borderTop: "1px solid #000", borderBottom: "1px solid #000", background: "#e0f2fe" }}>
                                <th style={{ textAlign: "left", padding: "4px 2px", width: "40px" }}>Slno</th>
                                <th style={{ textAlign: "left", padding: "4px 2px" }}>Name</th>
                                <th style={{ textAlign: "left", padding: "4px 2px", width: "100px" }}>Bill Number</th>
                                <th style={{ textAlign: "left", padding: "4px 2px", width: "95px" }}>MR. No</th>
                                <th style={{ textAlign: "left", padding: "4px 2px", width: "90px" }}>Card Type</th>
                                <th style={{ textAlign: "left", padding: "4px 2px", width: "85px" }}>Card Number</th>
                                <th style={{ textAlign: "right", padding: "4px 2px", width: "80px" }}>Bill Amount</th>
                                <th style={{ textAlign: "left", padding: "4px 2px", width: "65px" }}>User</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGroupedData.map((dGroup, dIdx) => (
                                <React.Fragment key={dIdx}>
                                    {/* Date Row */}
                                    <tr style={{ background: "#bae6fd", fontWeight: "bold" }}>
                                        <td colSpan={8} style={{ padding: "4px 2px" }}>
                                            Date : {dGroup.date_display || dGroup.date}
                                        </td>
                                    </tr>

                                    {/* Sections */}
                                    {dGroup.sections.map((sec, sIdx) => (
                                        <React.Fragment key={`${dIdx}-${sIdx}`}>
                                            {/* Section Banner */}
                                            <tr style={{ fontWeight: "bold" }}>
                                                <td colSpan={8} style={{ padding: "6px 2px 2px 2px", textDecoration: "underline", textTransform: "uppercase" }}>
                                                    {sec.category}
                                                </td>
                                            </tr>

                                            {/* Items */}
                                            {sec.items.map((row, rIdx) => (
                                                <tr key={`${dIdx}-${sIdx}-${rIdx}`} style={{ borderBottom: "1px dotted #ccc" }}>
                                                    <td style={{ padding: "3px 2px" }}>{row.displaySlno || row.slno}</td>
                                                    <td style={{ padding: "3px 2px" }}>{row.patient_name}</td>
                                                    <td style={{ padding: "3px 2px" }}>{row.bill_no}</td>
                                                    <td style={{ padding: "3px 2px" }}>{row.mr_no || ""}</td>
                                                    <td style={{ padding: "3px 2px" }}>{row.card_type}</td>
                                                    <td style={{ padding: "3px 2px" }}>{row.card_number}</td>
                                                    <td style={{ padding: "3px 2px", textAlign: "right" }}>{formatINR(row.amount)}</td>
                                                    <td style={{ padding: "3px 2px" }}>{row.user}</td>
                                                </tr>
                                            ))}

                                            {/* Section Subtotal */}
                                            <tr style={{ fontWeight: "bold", borderTop: "1px solid #000", borderBottom: "1px solid #000" }}>
                                                <td colSpan={6} style={{ textAlign: "right", padding: "4px 2px" }}>
                                                    Total - &gt;
                                                </td>
                                                <td style={{ textAlign: "right", padding: "4px 2px" }}>
                                                    {formatINR(sec.total)}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}

                            {/* Grand Total */}
                            <tr style={{ fontWeight: "bold", borderTop: "2px solid #000", borderBottom: "2px solid #000", background: "#f1f5f9" }}>
                                <td colSpan={6} style={{ textAlign: "right", padding: "6px 2px", fontSize: "11px" }}>
                                    Grand Total - &gt;
                                </td>
                                <td style={{ textAlign: "right", padding: "6px 2px", fontSize: "11px" }}>
                                    {formatINR(filteredTotalAmount)}
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ textAlign: "right", margin: "15px 0", fontStyle: "italic", fontSize: "10px" }}>
                        (End.)
                    </div>

                    <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
                        <div style={{ textAlign: "center", width: "150px", borderTop: "1px solid #000", paddingTop: "4px" }}>
                            Prepared By
                        </div>
                        <div style={{ textAlign: "center", width: "150px", borderTop: "1px solid #000", paddingTop: "4px" }}>
                            Accounts Officer
                        </div>
                        <div style={{ textAlign: "center", width: "150px", borderTop: "1px solid #000", paddingTop: "4px" }}>
                            Authorized Signatory
                        </div>
                    </div>
                </div>
            </PrintTemplate>
        </PageWrapper>
    );
};

export default CreditCardReport;
