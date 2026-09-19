import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaSearch, FaFileExcel, FaMoneyBillWave } from "react-icons/fa";
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

const CashBillsReport = ({ isModalView = false, startDate, endDate, initialBillType = "All", initialOutlet = "all" }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [categoryFilter, setCategoryFilter] = useState(initialBillType || "all");
    const [outlet, setOutlet] = useState(initialOutlet || "all");
    const [outlets, setOutlets] = useState([]);
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
            setCategoryFilter(initialBillType === "All" || initialBillType === "all" ? "all" : initialBillType);
        }
        if (initialOutlet) {
            setOutlet(initialOutlet);
        }
    }, [initialBillType, initialOutlet]);

    useEffect(() => {
        if (fromDate && toDate) fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDate, toDate, outlet]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                from_date: fromDate,
                to_date: toDate,
                outlet_code: outlet
            });
            const response = await apiRequest(`${HmsBaseUrl}cash-bills-report/?${queryParams.toString()}`, "GET");
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
                toast.error(response?.data?.message || "Failed to load Cash Bills Report");
            }
        } catch (error) {
            console.error("Error fetching cash bills report:", error);
            toast.error("Error loading Cash Bills Report");
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
                        (item.payment_mode && String(item.payment_mode).toLowerCase().includes(q)) ||
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

    const handlePrint = () => printAccountsReport("printable-cash-bills-report-area", "portrait");

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
                    "Payment Mode": "",
                    "Bill Amount": "",
                    "User": ""
                });

                dg.sections.forEach(sec => {
                    excelRows.push({
                        "Slno": sec.category,
                        "Name": "",
                        "Bill Number": "",
                        "MR. No": "",
                        "Payment Mode": "",
                        "Bill Amount": "",
                        "User": ""
                    });

                    sec.items.forEach(it => {
                        excelRows.push({
                            "Slno": it.displaySlno || it.slno,
                            "Name": it.patient_name || "",
                            "Bill Number": it.bill_no || "",
                            "MR. No": it.mr_no || "",
                            "Payment Mode": it.payment_mode || "CASH",
                            "Bill Amount": Number((it.amount || 0).toFixed(2)),
                            "User": it.user || ""
                        });
                    });

                    excelRows.push({
                        "Slno": "",
                        "Name": "",
                        "Bill Number": "",
                        "MR. No": "",
                        "Payment Mode": "Total - >",
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
                "Payment Mode": "Grand Total - >",
                "Bill Amount": Number(filteredTotalAmount.toFixed(2)),
                "User": ""
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelRows);
            ws["!cols"] = [
                { wch: 8 },
                { wch: 28 },
                { wch: 18 },
                { wch: 16 },
                { wch: 16 },
                { wch: 16 },
                { wch: 14 }
            ];
            XLSX.utils.book_append_sheet(wb, ws, "Cash Bills Report");
            XLSX.writeFile(wb, `Cash_Bills_Report_${fromDate}_to_${toDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel");
        }
    };

    return (
        <PageWrapper style={{ padding: isModalView ? "0" : "20px" }}>
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
                        background: "rgba(16, 185, 129, 0.2)",
                        padding: "10px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <FaMoneyBillWave size={24} color="#10b981" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
                            Cash Bills Report
                        </h2>
                        <span style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 500 }}>
                            Detailed breakdown of categorized cash collections across all departments
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
                    Period: {dayjs(fromDate).format("DD/MM/YYYY")} — {dayjs(toDate).format("DD/MM/YYYY")} | Outlet: {getOutletName(outlet)}
                </div>
            </div>

            {/* Top Summary Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "20px"
            }}>
                <SummaryCard color="#10b981">
                    <SummaryLabel>Total Cash Amount</SummaryLabel>
                    <SummaryValue color="#10b981">₹ {formatINR(filteredTotalAmount)}</SummaryValue>
                </SummaryCard>
                <SummaryCard color="#3b82f6">
                    <SummaryLabel>Total Cash Bills</SummaryLabel>
                    <SummaryValue color="#3b82f6">{filteredTotalCount}</SummaryValue>
                </SummaryCard>
                <SummaryCard color="#8b5cf6">
                    <SummaryLabel>Departments / Categories</SummaryLabel>
                    <SummaryValue color="#8b5cf6">{categoriesList.length}</SummaryValue>
                </SummaryCard>
                <SummaryCard color="#f59e0b">
                    <SummaryLabel>Filtered Category</SummaryLabel>
                    <SummaryValue color="#f59e0b" style={{ fontSize: "1rem" }}>
                        {categoryFilter === "all" ? "All Categories" : categoryFilter}
                    </SummaryValue>
                </SummaryCard>
            </div>

            {/* Filter Bar */}
            <FilterSection>
                <FormRow style={{ alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
                    <InputWrapper style={{ minWidth: "140px" }}>
                        <Label>From Date</Label>
                        <DatePicker
                            value={dayjs(fromDate)}
                            onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : "")}
                            format="DD/MM/YYYY"
                            style={{ width: "100%", height: "40px", borderRadius: "8px" }}
                        />
                    </InputWrapper>

                    <InputWrapper style={{ minWidth: "140px" }}>
                        <Label>To Date</Label>
                        <DatePicker
                            value={dayjs(toDate)}
                            onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : "")}
                            format="DD/MM/YYYY"
                            style={{ width: "100%", height: "40px", borderRadius: "8px" }}
                        />
                    </InputWrapper>

                    <InputWrapper style={{ minWidth: "160px" }}>
                        <Label>Outlet</Label>
                        <Select
                            value={outlet}
                            onChange={(e) => setOutlet(e.target.value)}
                            style={{ height: "40px", borderRadius: "8px" }}
                        >
                            <option value="all">All Outlets</option>
                            {outlets.map((o) => (
                                <option key={o.outlet_code || o.outlet_id || o.id} value={o.outlet_code || o.outlet_id}>
                                    {o.outlet_name || o.name} ({o.outlet_code || o.outlet_id})
                                </option>
                            ))}
                        </Select>
                    </InputWrapper>

                    <InputWrapper style={{ minWidth: "180px", flex: 1 }}>
                        <Label>Category / Department</Label>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{ height: "40px", borderRadius: "8px" }}
                        >
                            <option value="all">All Categories</option>
                            <option value="PHARMACY OP BILL (SH)">Pharmacy OP Bill (SH)</option>
                            <option value="PHARMACY IP BILL (SH)">Pharmacy IP Bill (SH)</option>
                            <option value="ADVANCE">Advance (IP)</option>
                            <option value="DISCHARGE">Discharge Bill</option>
                            <option value="REGISTRATION(SH)">Registration (OP)</option>
                            <option value="CT SCAN (SH)">CT Scan (SH)</option>
                            <option value="ECG (SH)">ECG (SH)</option>
                            <option value="LAB BILL (SH)">Lab Bill (SH)</option>
                            <option value="PET_CT(SH)">PET CT (SH)</option>
                            <option value="PROCEDURE BILL (SH)">Procedure Bill (SH)</option>
                            <option value="SCANNING (SH)">Scanning (SH)</option>
                            <option value="X - RAY (SH)">X-Ray (SH)</option>
                            <option value="XEROX (SH)">Xerox (SH)</option>
                            {categoriesList
                                .filter(cat => ![
                                    "PHARMACY OP BILL (SH)", "PHARMACY IP BILL (SH)", "ADVANCE", "DISCHARGE",
                                    "REGISTRATION(SH)", "CT SCAN (SH)", "ECG (SH)", "LAB BILL (SH)",
                                    "PET_CT(SH)", "PROCEDURE BILL (SH)", "SCANNING (SH)", "X - RAY (SH)", "XEROX (SH)"
                                ].includes(cat))
                                .map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))
                            }
                        </Select>
                    </InputWrapper>

                    <InputWrapper style={{ minWidth: "220px", flex: 1 }}>
                        <Label>Search</Label>
                        <div style={{ position: "relative" }}>
                            <Input
                                placeholder="Search Name, Bill No, UHID, User..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ height: "40px", borderRadius: "8px", paddingLeft: "36px" }}
                            />
                            <FaSearch
                                style={{
                                    position: "absolute",
                                    left: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: colors.textMuted
                                }}
                            />
                        </div>
                    </InputWrapper>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <Button
                            onClick={fetchReport}
                            disabled={loading}
                            style={{
                                height: "40px",
                                background: colors.primary || "#2563eb",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                borderRadius: "8px",
                                fontWeight: 600,
                                padding: "0 18px"
                            }}
                        >
                            <FaSearch /> {loading ? "Searching..." : "Search"}
                        </Button>
                        <Button
                            onClick={handlePrint}
                            style={{
                                height: "40px",
                                background: "#0f172a",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                borderRadius: "8px",
                                fontWeight: 600,
                                padding: "0 18px"
                            }}
                        >
                            <FaPrint /> Print
                        </Button>
                        <Button
                            onClick={handleExportExcel}
                            style={{
                                height: "40px",
                                background: "#10b981",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                borderRadius: "8px",
                                fontWeight: 600,
                                padding: "0 18px"
                            }}
                        >
                            <FaFileExcel /> Excel
                        </Button>
                    </div>
                </FormRow>
            </FilterSection>

            {/* Interactive Screen Table */}
            <TableWrapper style={{ overflowX: "auto", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <Table>
                    <thead>
                        <Tr style={{ background: "#f1f5f9" }}>
                            <Th style={{ width: "60px", textAlign: "center" }}>Slno</Th>
                            <Th style={{ minWidth: "200px" }}>Name</Th>
                            <Th style={{ minWidth: "150px" }}>Bill Number</Th>
                            <Th style={{ minWidth: "130px" }}>MR. No</Th>
                            <Th style={{ minWidth: "120px" }}>Payment Mode</Th>
                            <Th style={{ minWidth: "120px", textAlign: "right" }}>Bill Amount</Th>
                            <Th style={{ minWidth: "120px" }}>User</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={7} style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                                    Loading Cash Bills Report...
                                </Td>
                            </Tr>
                        ) : filteredGroupedData.length === 0 ? (
                            <Tr>
                                <Td colSpan={7} style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                                    No cash collection records found for the selected period / criteria.
                                </Td>
                            </Tr>
                        ) : (
                            filteredGroupedData.map(dg => (
                                <React.Fragment key={dg.date}>
                                    {/* Date Header Row */}
                                    <DateHeaderTr>
                                        <td colSpan={7}>
                                            Date : {dg.date_display || dg.date}
                                        </td>
                                    </DateHeaderTr>

                                    {/* Department / Category Sections */}
                                    {dg.sections.map(sec => (
                                        <React.Fragment key={`${dg.date}-${sec.category}`}>
                                            {/* Category Banner Row */}
                                            <SectionHeaderTr>
                                                <td colSpan={7}>
                                                    {sec.category}
                                                </td>
                                            </SectionHeaderTr>

                                            {/* Transaction Items */}
                                            {sec.items.map(item => (
                                                <Tr key={item.bill_no + (item.displaySlno || item.slno)}>
                                                    <Td style={{ textAlign: "center", fontWeight: 600, color: "#64748b" }}>
                                                        {item.displaySlno || item.slno}
                                                    </Td>
                                                    <Td style={{ fontWeight: 600, color: "#0f172a" }}>
                                                        {item.patient_name || "—"}
                                                    </Td>
                                                    <Td style={{ fontFamily: "monospace", fontWeight: 600 }}>
                                                        {item.bill_no || "—"}
                                                    </Td>
                                                    <Td style={{ fontFamily: "monospace" }}>
                                                        {item.mr_no || "—"}
                                                    </Td>
                                                    <Td>
                                                        <span style={{
                                                            background: "#ecfdf5",
                                                            color: "#059669",
                                                            padding: "3px 8px",
                                                            borderRadius: "4px",
                                                            fontWeight: 600,
                                                            fontSize: "0.75rem"
                                                        }}>
                                                            {item.payment_mode || "CASH"}
                                                        </span>
                                                    </Td>
                                                    <Td style={{ textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                                                        {formatINR(item.amount)}
                                                    </Td>
                                                    <Td style={{ fontSize: "0.8rem", color: "#475569" }}>
                                                        {item.user || "STAFF"}
                                                    </Td>
                                                </Tr>
                                            ))}

                                            {/* Category Subtotal Row */}
                                            <SubtotalTr>
                                                <td colSpan={4}></td>
                                                <td style={{ textAlign: "right", fontWeight: 800, color: "#334155" }}>
                                                    Total - &gt;
                                                </td>
                                                <td style={{ textAlign: "right", fontWeight: 800, color: "#0f172a" }}>
                                                    {formatINR(sec.total)}
                                                </td>
                                                <td></td>
                                            </SubtotalTr>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))
                        )}

                        {/* Grand Total Row */}
                        {!loading && filteredGroupedData.length > 0 && (
                            <GrandTotalTr>
                                <td colSpan={4}></td>
                                <td style={{ textAlign: "right", fontWeight: 900, letterSpacing: "0.05em" }}>
                                    Grand Total - &gt;
                                </td>
                                <td style={{ textAlign: "right", fontWeight: 900, fontSize: "1rem" }}>
                                    {formatINR(filteredTotalAmount)}
                                </td>
                                <td></td>
                            </GrandTotalTr>
                        )}
                    </tbody>
                </Table>
            </TableWrapper>

            {/* Printable Report Section */}
            <PrintTemplate>
                <div id="printable-cash-bills-report-area">
                    <style>{`
                        @page {
                            size: portrait;
                            margin: 12mm 10mm 15mm 10mm;
                        }
                        @media print {
                            body {
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                                font-family: "Courier New", Courier, monospace !important;
                                font-size: 11px;
                                color: #000;
                            }
                            .no-print { display: none !important; }
                            .print-table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 8px;
                            }
                            .print-table th {
                                border-top: 1px dashed #000;
                                border-bottom: 1px dashed #000;
                                padding: 4px 6px;
                                text-align: left;
                                font-size: 11px;
                                font-weight: bold;
                            }
                            .print-table td {
                                padding: 3px 6px;
                                font-size: 11px;
                            }
                            .date-hdr {
                                font-weight: bold;
                                padding-top: 8px !important;
                                padding-bottom: 4px !important;
                                font-size: 11px;
                            }
                            .cat-hdr {
                                font-weight: bold;
                                text-decoration: underline;
                                padding-top: 6px !important;
                                font-size: 11px;
                            }
                            .subtotal-row td {
                                border-top: 1px dashed #000;
                                border-bottom: 1px dashed #000;
                                font-weight: bold;
                            }
                            .grand-total-row td {
                                border-top: 2px solid #000;
                                border-bottom: 2px solid #000;
                                font-weight: bold;
                                font-size: 12px;
                            }
                        }
                    `}</style>

                    {/* Hospital Print Header */}
                    <div style={{ textAlign: "center", marginBottom: "12px", borderBottom: "1px solid #000", paddingBottom: "8px" }}>
                        <h2 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "bold", textTransform: "uppercase" }}>
                            {hospital_name}
                        </h2>
                        <p style={{ margin: "0 0 4px 0", fontSize: "11px" }}>{hospital_address}</p>
                        <h3 style={{ margin: "4px 0", fontSize: "13px", fontWeight: "bold", textDecoration: "underline" }}>
                            CASH BILLS REPORT
                        </h3>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginTop: "6px" }}>
                            <span>From: <strong>{format(new Date(fromDate), "dd/MM/yyyy")}</strong> To: <strong>{format(new Date(toDate), "dd/MM/yyyy")}</strong></span>
                            <span>Category: <strong>{categoryFilter === "all" ? "ALL" : categoryFilter.toUpperCase()}</strong></span>
                            <span>Printed: <strong>{format(new Date(), "dd/MM/yyyy HH:mm")}</strong> ({user_id})</span>
                        </div>
                    </div>

                    {/* Print Table */}
                    <table className="print-table">
                        <thead>
                            <tr>
                                <th style={{ width: "35px" }}>Slno</th>
                                <th style={{ width: "190px" }}>Name</th>
                                <th style={{ width: "110px" }}>Bill Number</th>
                                <th style={{ width: "90px" }}>MR. No</th>
                                <th style={{ width: "70px" }}>Mode</th>
                                <th style={{ width: "90px", textAlign: "right" }}>Bill Amount</th>
                                <th style={{ width: "80px", textAlign: "right" }}>User</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGroupedData.map(dg => (
                                <React.Fragment key={`print-${dg.date}`}>
                                    <tr>
                                        <td colSpan={7} className="date-hdr">
                                            Date : {dg.date_display || dg.date}
                                        </td>
                                    </tr>

                                    {dg.sections.map(sec => (
                                        <React.Fragment key={`print-${dg.date}-${sec.category}`}>
                                            <tr>
                                                <td colSpan={7} className="cat-hdr">
                                                    {sec.category}
                                                </td>
                                            </tr>

                                            {sec.items.map(item => (
                                                <tr key={`print-row-${item.bill_no}-${item.displaySlno || item.slno}`}>
                                                    <td>{item.displaySlno || item.slno}</td>
                                                    <td style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "190px" }}>
                                                        {item.patient_name || "—"}
                                                    </td>
                                                    <td>{item.bill_no || "—"}</td>
                                                    <td>{item.mr_no || "—"}</td>
                                                    <td>{item.payment_mode || "CASH"}</td>
                                                    <td style={{ textAlign: "right" }}>{formatINR(item.amount)}</td>
                                                    <td style={{ textAlign: "right" }}>{item.user || "STAFF"}</td>
                                                </tr>
                                            ))}

                                            <tr className="subtotal-row">
                                                <td colSpan={4}></td>
                                                <td style={{ textAlign: "right" }}>Total - &gt;</td>
                                                <td style={{ textAlign: "right" }}>{formatINR(sec.total)}</td>
                                                <td></td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}

                            <tr className="grand-total-row">
                                <td colSpan={4}></td>
                                <td style={{ textAlign: "right" }}>Grand Total - &gt;</td>
                                <td style={{ textAlign: "right" }}>{formatINR(filteredTotalAmount)}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </PrintTemplate>
        </PageWrapper>
    );
};

export default CashBillsReport;
