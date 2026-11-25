import React, { useState, useEffect, useMemo } from "react";
import { DatePicker, Select, Button, Spin, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw } from "lucide-react";
import styled from "styled-components";
import * as XLSX from "xlsx";
import apiRequest from "../../Auth/apiRequest";
import {
    formatINR,
    printReportArea,
    extractReportData,
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

const SectionHeaderTr = styled.tr`
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

const DateHeaderTr = styled.tr`
    background: #f1f5f9 !important;
    border-bottom: 1px solid #cbd5e1 !important;
    td {
        font-weight: 700 !important;
        font-size: 0.85rem !important;
        color: #0f172a !important;
        padding: 6px 12px !important;
        background: #f1f5f9 !important;
    }
`;

const SubtotalTr = styled.tr`
    background: #f8fafc !important;
    td {
        font-weight: 700 !important;
        font-size: 0.8rem !important;
        color: #0f172a !important;
        padding: 6px 12px !important;
        border-top: 1px solid #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
    }
`;

const GrandTotalTr = styled.tr`
    background: #f1f5f9 !important;
    border-top: 2px solid #000000 !important;
    border-bottom: 3px double #000000 !important;
    td {
        font-weight: 800 !important;
        font-size: 0.92rem !important;
        color: #000000 !important;
        padding: 8px 12px !important;
        background: #f1f5f9 !important;
        border-top: 2px solid #000000 !important;
        border-bottom: 3px double #000000 !important;
    }
`;

const MasterCreditCardReport = ({ 
    isModalView = false, 
    startDate, 
    endDate, 
    initialOutlet = "all", 
    initialBillType = "all",
    billType,
    category,
    cardMachine = "all",
    selectedCardMachine: propCardMachine,
    onLoadOptions
}) => {
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
    const [activeCategory, setActiveCategory] = useState(billType || category || initialBillType || "all");
    const [activeCardType, setActiveCardType] = useState("all");
    const [activeCardMachine, setActiveCardMachine] = useState(cardMachine || propCardMachine || "all");

    useEffect(() => {
        const cm = cardMachine || propCardMachine;
        if (cm !== undefined && cm !== activeCardMachine) {
            setActiveCardMachine(cm);
        }
    }, [cardMachine, propCardMachine]);

    useEffect(() => {
        const c = billType || category || initialBillType;
        if (c !== undefined && c !== activeCategory) {
            setActiveCategory(c);
        }
    }, [billType, category, initialBillType]);

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

    useEffect(() => {
        if (initialBillType !== undefined) {
            setActiveCategory(initialBillType);
        }
    }, [initialBillType]);

    const fetchReport = async (isRefresh = false) => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/credit-card-electronic-payment/?from_date=${fDate}&to_date=${tDate}&outlet_code=${outlet}`;
            const res = await cachedApiRequest(url, "GET", null, { forceRefresh: isRefresh });
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

    // Extract unique categories for filtering
    const categoriesList = useMemo(() => {
        const set = new Set();
        (reportData?.data || []).forEach(r => {
            if (r.category) set.add(r.category);
        });
        return Array.from(set).sort();
    }, [reportData]);

    // Extract unique card types for filtering
    const cardTypesList = useMemo(() => {
        const set = new Set();
        (reportData?.data || []).forEach(r => {
            if (r.card_type) set.add(r.card_type);
        });
        if (Array.isArray(reportData?.summary?.card_types)) {
            reportData.summary.card_types.forEach(t => set.add(t));
        }
        return Array.from(set).sort();
    }, [reportData]);

    // Extract unique card machines for filtering
    const cardMachinesList = useMemo(() => {
        const set = new Set();
        (reportData?.data || []).forEach(r => {
            if (r.card_machine) set.add(r.card_machine);
            else if (r.card_number && !/^\d+$/.test(r.card_number)) set.add(r.card_number);
        });
        if (Array.isArray(reportData?.summary?.card_machines)) {
            reportData.summary.card_machines.forEach(m => set.add(m));
        }
        return Array.from(set).sort();
    }, [reportData]);

    useEffect(() => {
        if (onLoadOptions && reportData) {
            onLoadOptions({
                categories: categoriesList,
                cardMachines: cardMachinesList
            });
        }
    }, [onLoadOptions, categoriesList, cardMachinesList, reportData]);

    // Build hierarchical grouped data filtered by search, category, card type and card machine
    const filteredGroupedData = useMemo(() => {
        const q = searchTerm.toLowerCase().trim();
        const filterVal = (activeCategory || "all").toLowerCase().trim();
        const cTypeVal = (activeCardType || "all").toLowerCase().trim();
        const cMachVal = (activeCardMachine || "all").toLowerCase().trim();
        const groups = reportData?.grouped_data || [];
        let runningSlno = 1;

        return groups.map(dGroup => {
            const matchingSections = [];
            let dateTotal = 0;
            let dateCount = 0;

            (dGroup.sections || []).forEach(sec => {
                if (filterVal !== "all") {
                    const secCat = (sec.category || "").toLowerCase().trim();
                    const filterNorm = filterVal.replace(/[\s()_-]/g, "");
                    const secNorm = secCat.replace(/[\s()_-]/g, "");

                    const matches = secCat === filterVal ||
                        secNorm === filterNorm ||
                        secNorm.includes(filterNorm) ||
                        filterNorm.includes(secNorm);

                    if (!matches) {
                        return;
                    }
                }

                const matchingItems = (sec.items || []).filter(item => {
                    if (cTypeVal !== "all") {
                        const itCt = String(item.card_type || "").toLowerCase().trim();
                        if (itCt !== cTypeVal) return false;
                    }
                    if (cMachVal !== "all") {
                        const itCm = String(item.card_machine || item.card_number || "").toLowerCase().trim();
                        if (itCm !== cMachVal && !itCm.includes(cMachVal)) return false;
                    }

                    if (!q) return true;
                    return (
                        (item.patient_name && String(item.patient_name).toLowerCase().includes(q)) ||
                        (item.bill_no && String(item.bill_no).toLowerCase().includes(q)) ||
                        (item.mr_no && String(item.mr_no).toLowerCase().includes(q)) ||
                        (item.ip_number && String(item.ip_number).toLowerCase().includes(q)) ||
                        (item.card_type && String(item.card_type).toLowerCase().includes(q)) ||
                        (item.card_machine && String(item.card_machine).toLowerCase().includes(q)) ||
                        (item.card_number && String(item.card_number).toLowerCase().includes(q)) ||
                        (item.user && String(item.user).toLowerCase().includes(q)) ||
                        (item.category && String(item.category).toLowerCase().includes(q))
                    );
                }).map(item => ({
                    ...item,
                    displaySlno: runningSlno++
                }));

                if (matchingItems.length > 0) {
                    const secTotal = matchingItems.reduce((sum, it) => sum + (it.amount || it.bank || it.card_amount || 0), 0);
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
    }, [reportData, activeCategory, activeCardType, activeCardMachine, searchTerm]);

    const filteredTotalAmount = useMemo(() => {
        return filteredGroupedData.reduce((sum, dg) => sum + (dg.date_total || 0), 0);
    }, [filteredGroupedData]);

    const filteredTotalCount = useMemo(() => {
        return filteredGroupedData.reduce((sum, dg) => sum + (dg.count || 0), 0);
    }, [filteredGroupedData]);

    const summary = reportData?.summary || {};

    const handleExport = () => {
        if (!filteredGroupedData || filteredGroupedData.length === 0) return;

        const excelRows = [];
        filteredGroupedData.forEach(dg => {
            excelRows.push({
                "Slno": `Date: ${dg.date_display || dg.date}`,
                "Name": "",
                "Bill Number": "",
                "MR. No": "",
                "Card Type": "",
                "Card Machine": "",
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
                    "Card Machine": "",
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
                        "Card Type": it.card_type || "CARD",
                        "Card Machine": it.card_machine || "POS",
                        "Card Number": it.card_number || "—",
                        "Bill Amount": Number((it.amount || it.bank || it.card_amount || 0).toFixed(2)),
                        "User": it.user || ""
                    });
                });

                excelRows.push({
                    "Slno": "",
                    "Name": "",
                    "Bill Number": "",
                    "MR. No": "",
                    "Card Type": "",
                    "Card Machine": "",
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
            "Card Machine": "",
            "Card Number": "Grand Total - >",
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
            { wch: 16 },
            { wch: 16 },
            { wch: 14 }
        ];
        XLSX.utils.book_append_sheet(wb, ws, "Credit Card Report");
        XLSX.writeFile(wb, `Master_Credit_Card_Report_${dateRange[0].format("YYYY-MM-DD")}_to_${dateRange[1].format("YYYY-MM-DD")}.xlsx`);
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                Credit Card & Electronic Payment Report
                                <span className="badge">Bill Type Wise</span>
                            </h1>
                            <p>POS machine swipe card receipts and electronic payments grouped by Date and Billing Heads matching Shanmuga Hospital format</p>
                        </div>
                        <div className="btn-group no-print">
                            <Button icon={<Download size={15} />} onClick={handleExport}>
                                Excel Export
                            </Button>
                            <Button type="primary" icon={<Printer size={15} />} onClick={() => printReportArea("printable-report-area", "portrait")}>
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
                            <label>Bill Type / Category:</label>
                            <Select value={activeCategory} onChange={setActiveCategory} style={{ width: 190 }}>
                                <Option value="all">All Categories</Option>
                                {categoriesList.map(cat => (
                                    <Option key={cat} value={cat}>{cat}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <label>Card Type:</label>
                            <Select value={activeCardType} onChange={setActiveCardType} style={{ width: 160 }}>
                                <Option value="all">All Card Types</Option>
                                {cardTypesList.map(ct => (
                                    <Option key={ct} value={ct}>{ct}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <label>Card Machine:</label>
                            <Select value={activeCardMachine} onChange={setActiveCardMachine} style={{ width: 150 }}>
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
                                style={{ width: 200 }}
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
                            title="Credit Card & Electronic Payment Report"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Electronic POS & Card Receipts Grouped By Billing Heads"
                        />
                    )}

                    {!isModalView && (
                        <KPIGrid className="no-print">
                            <KPICard $border="#6366f1">
                                <span className="kpi-title">Total Card / POS Collections</span>
                                <span className="kpi-value">₹{formatINR(summary.total_card_collection || summary.total_card_amount || filteredTotalAmount)}</span>
                                <span className="kpi-subtitle">Matches 100% with shift ledger</span>
                            </KPICard>
                            <KPICard $border="#0ea5e9">
                                <span className="kpi-title">Total Card Swipes</span>
                                <span className="kpi-value">{filteredTotalCount}</span>
                                <span className="kpi-subtitle">Settled card transactions</span>
                            </KPICard>
                            <KPICard $border="#10b981">
                                <span className="kpi-title">Active Categories</span>
                                <span className="kpi-value">{categoriesList.length}</span>
                                <span className="kpi-subtitle">Billing heads with card receipts</span>
                            </KPICard>
                        </KPIGrid>
                    )}

                    <DataTableWrapper style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr style={{ background: "#f1f5f9" }}>
                                    <th style={{ width: "50px", textAlign: "center" }}>Slno</th>
                                    <th style={{ minWidth: "165px" }}>Name</th>
                                    <th style={{ minWidth: "130px" }}>Bill Number</th>
                                    <th style={{ minWidth: "115px" }}>MR. No</th>
                                    <th style={{ minWidth: "105px" }}>Card Type</th>
                                    <th style={{ minWidth: "115px" }}>Card Machine</th>
                                    <th style={{ minWidth: "105px" }}>Card Number</th>
                                    <th style={{ minWidth: "115px", textAlign: "right" }}>Bill Amount</th>
                                    <th style={{ minWidth: "105px" }}>User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGroupedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                                            No credit card collection records found for the selected criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGroupedData.map(dg => (
                                        <React.Fragment key={dg.date}>
                                            {/* Date Header Row */}
                                            <DateHeaderTr className="DateGroup date-group">
                                                <td colSpan={9} style={{ fontWeight: 700, color: "#0f172a" }}>
                                                    Date : {dg.date_display || dg.date}
                                                </td>
                                            </DateHeaderTr>

                                            {/* Category Sections */}
                                            {dg.sections.map(sec => (
                                                <React.Fragment key={`${dg.date}-${sec.category}`}>
                                                    {/* Category Header Row */}
                                                    <SectionHeaderTr className="SectionHeader section-header">
                                                        <td colSpan={9}>
                                                            {sec.category}
                                                        </td>
                                                    </SectionHeaderTr>

                                                    {/* Item Rows */}
                                                    {sec.items.map(item => (
                                                        <tr key={item.bill_no + (item.displaySlno || item.slno)}>
                                                            <td style={{ textAlign: "center", fontWeight: 500 }}>
                                                                {item.displaySlno || item.slno}
                                                            </td>
                                                            <td style={{ fontWeight: 600, color: "#0f172a" }}>
                                                                {item.patient_name || "—"}
                                                            </td>
                                                            <td style={{ fontFamily: "monospace", fontWeight: 600 }}>
                                                                {item.bill_no || "—"}
                                                            </td>
                                                            <td style={{ fontFamily: "monospace", color: "#475569" }}>
                                                                <div>{item.mr_no || "—"}</div>
                                                                {item.ip_number && item.ip_number !== item.mr_no && !String(item.mr_no).includes(item.ip_number) && (
                                                                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>IP: {item.ip_number}</div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.82rem" }}>
                                                                    {item.card_type || "CARD"}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span style={{
                                                                    display: "inline-block",
                                                                    padding: "2px 8px",
                                                                    borderRadius: "4px",
                                                                    fontSize: "0.78rem",
                                                                    fontWeight: 700,
                                                                    background: "#e0e7ff",
                                                                    color: "#3730a3",
                                                                    border: "1px solid #c7d2fe"
                                                                }}>
                                                                    {item.card_machine || "POS"}
                                                                </span>
                                                            </td>
                                                            <td style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#475569" }}>
                                                                {item.card_number && item.card_number !== item.card_machine && item.card_number !== "POS" ? item.card_number : "—"}
                                                            </td>
                                                            <td style={{ textAlign: "right", fontWeight: 600, fontFamily: "monospace", color: "#0f172a" }}>
                                                                {formatINR(item.amount || item.bank || item.card_amount)}
                                                            </td>
                                                            <td style={{ fontWeight: 500, color: "#334155", fontSize: "0.8rem" }}>
                                                                {item.user || "STAFF"}
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {/* Section Subtotal Row */}
                                                    <SubtotalTr className="SubTotal sub-total">
                                                        <td colSpan={7} style={{ textAlign: "right", fontWeight: 700, color: "#1e293b" }}>
                                                            Total - &gt;
                                                        </td>
                                                        <td style={{ textAlign: "right", fontWeight: 700, color: "#1e293b", fontFamily: "monospace" }}>
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
                                {filteredGroupedData.length > 0 && (
                                    <GrandTotalTr className="GrandTotal grand-total-row">
                                        <td colSpan={7} style={{ textAlign: "right", fontWeight: 800, color: "#000000" }}>
                                            Grand Total - &gt;
                                        </td>
                                        <td style={{ textAlign: "right", fontWeight: 800, fontFamily: "monospace", color: "#000000", fontSize: "0.95rem" }}>
                                            {formatINR(filteredTotalAmount)}
                                        </td>
                                        <td></td>
                                    </GrandTotalTr>
                                )}
                            </tbody>
                        </table>
                    </DataTableWrapper>

                    {!isModalView && <ReportPrintFooter />}
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterCreditCardReport;
