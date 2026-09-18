import React, { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { 
    FaPrint, 
    FaSearch, 
    FaShoppingCart, 
    FaUndoAlt, 
    FaLayerGroup, 
    FaFileExcel
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
    gap: 12px;
    margin-bottom: 20px;
    border-bottom: 2px solid ${colors.border};
    padding-bottom: 8px;
`;

const TabButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 8px 8px 0 0;
    border: none;
    background: ${props => props.active ? colors.primary : 'transparent'};
    color: ${props => props.active ? '#ffffff' : colors.textMuted};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.active ? colors.primary : colors.surfaceAlt};
        color: ${props => props.active ? '#ffffff' : colors.textMain};
    }
`;

const FilterSection = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const SummaryCardsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
`;

const SummaryCard = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
    border-left: 4px solid ${props => props.color || colors.primary};
    display: flex;
    flex-direction: column;
    justify-content: center;
    animation: ${fadeIn} 0.3s ease-out;
`;

const SummaryLabel = styled.span`
    font-size: 0.75rem;
    font-weight: 600;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
`;

const SummaryValue = styled.span`
    font-size: 1.35rem;
    font-weight: 700;
    color: ${props => props.color || colors.textMain};
`;

const DenseTableWrapper = styled(TableWrapper)`
    overflow-x: auto;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #fff;
`;

const GroupTh = styled(Th)`
    text-align: center !important;
    background: ${props => props.bg || '#1e293b'} !important;
    color: #fff !important;
    font-weight: 700 !important;
    font-size: 0.8rem !important;
    padding: 6px 8px !important;
    border-right: 1px solid #475569 !important;
    border-bottom: 1px solid #475569 !important;
`;

const SubTh = styled(Th)`
    text-align: ${props => props.align || 'right'} !important;
    background: ${props => props.bg || '#f1f5f9'} !important;
    color: #334155 !important;
    font-weight: 600 !important;
    font-size: 0.72rem !important;
    padding: 5px 6px !important;
    border-right: 1px solid #cbd5e1 !important;
    border-bottom: 2px solid #94a3b8 !important;
    white-space: nowrap;
`;

const NumTd = styled(Td)`
    text-align: right !important;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 0.75rem !important;
    padding: 5px 6px !important;
    border-right: 1px solid #e2e8f0 !important;
    white-space: nowrap;
`;

const TextTd = styled(Td)`
    text-align: ${props => props.align || 'left'} !important;
    font-size: 0.75rem !important;
    padding: 5px 8px !important;
    border-right: 1px solid #e2e8f0 !important;
    white-space: nowrap;
`;

const GrandTotalTr = styled(Tr)`
    background: #f8fafc !important;
    font-weight: bold;
    border-top: 2px solid #0f172a !important;
    border-bottom: 2px solid #0f172a !important;

    td {
        font-weight: 700 !important;
        font-size: 0.78rem !important;
        background: #f1f5f9 !important;
        color: #0f172a !important;
        border-top: 2px solid #0f172a !important;
        border-bottom: 2px solid #0f172a !important;
    }
`;

const PrintTemplate = styled.div`
    display: none;
`;

const DaywiseSalesTaxRegister = ({ isModalView = false, startDate, endDate }) => {
    const [activeTab, setActiveTab] = useState("sales"); // "sales", "returns", "net"
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-01"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [patientType, setPatientType] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const [dayWiseSales, setDayWiseSales] = useState([]);
    const [salesGt, setSalesGt] = useState(null);
    const [dayWiseReturns, setDayWiseReturns] = useState([]);
    const [returnsGt, setReturnsGt] = useState(null);
    const [dayWiseNet, setDayWiseNet] = useState([]);
    const [netGt, setNetGt] = useState(null);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const fetchReport = useCallback(async () => {
        if (!fromDate || !toDate) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                from_date: fromDate,
                to_date: toDate,
                report_type: "all",
                patient_type: patientType,
            });
            const response = await apiRequest(`${HmsBaseUrl}sales-tax-register/?${params.toString()}`, "GET");
            if (response.success && response.data) {
                setDayWiseSales(response.data.day_wise_sales || []);
                setSalesGt(response.data.day_wise_sales_grand_total || null);
                setDayWiseReturns(response.data.day_wise_returns || []);
                setReturnsGt(response.data.day_wise_returns_grand_total || null);
                setDayWiseNet(response.data.day_wise_net || []);
                setNetGt(response.data.day_wise_net_grand_total || null);
            } else {
                toast.error(response?.data?.message || "Failed to load Day-wise GST Register");
            }
        } catch (error) {
            console.error("Error fetching Day-wise GST Register:", error);
            toast.error("Error loading Day-wise GST Register");
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, patientType, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const activeList = useMemo(() => {
        if (activeTab === "returns") return dayWiseReturns;
        if (activeTab === "sales") return dayWiseSales;
        return dayWiseNet;
    }, [activeTab, dayWiseSales, dayWiseReturns, dayWiseNet]);

    const activeGt = useMemo(() => {
        if (activeTab === "returns") return returnsGt;
        if (activeTab === "sales") return salesGt;
        return netGt;
    }, [activeTab, salesGt, returnsGt, netGt]);

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return activeList;
        const q = searchQuery.toLowerCase().trim();
        return activeList.filter(row => 
            (row.bill_date && String(row.bill_date).toLowerCase().includes(q)) ||
            (row.bill_name && String(row.bill_name).toLowerCase().includes(q)) ||
            (row.bills && String(row.bills).toLowerCase().includes(q)) ||
            (row.patient_type && String(row.patient_type).toLowerCase().includes(q))
        );
    }, [activeList, searchQuery]);

    const formatINR = (val) => {
        const num = parseFloat(val) || 0;
        return num === 0 ? "0.00" : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getReportTitle = () => {
        if (activeTab === "returns") return "Day-wise Pharmacy Sales Return GST Register";
        if (activeTab === "sales") return "Day-wise Pharmacy Sales Tax GST Register";
        return "Day-wise Consolidated Pharmacy Sales & Return GST Register";
    };

    const isIpOnly = patientType === "ip";
    const totalTableCols = isIpOnly ? 21 : 27;

    const handlePrint = () => {
        printAccountsReport("printable-daywise-gst-area", "landscape");
    };

    const handleExportExcel = () => {
        if (!activeList || activeList.length === 0) {
            toast.warning("No data to export");
            return;
        }

        try {
            const formatRow = (r) => {
                const isIpRow = r.patient_type === "IP";

                if (isIpOnly) {
                    return {
                        "Date": r.bill_date,
                        "Particulars": r.bill_name,
                        "Bill Numbers": r.bills,
                        // Exempted
                        "Exempted Amount": r.exempted?.taxable || 0,
                        "Exempted GST": (r.exempted?.sgst || 0) + (r.exempted?.cgst || 0),
                        "Exempted Total": r.exempted?.total || 0,
                        // Rate 5%
                        "5% Taxable": r.rate_5?.taxable || 0,
                        "5% GST": (r.rate_5?.sgst || 0) + (r.rate_5?.cgst || 0),
                        "5% Total": r.rate_5?.total || 0,
                        // Rate 12%
                        "12% Taxable": r.rate_12?.taxable || 0,
                        "12% GST": (r.rate_12?.sgst || 0) + (r.rate_12?.cgst || 0),
                        "12% Total": r.rate_12?.total || 0,
                        // Rate 18%
                        "18% Taxable": r.rate_18?.taxable || 0,
                        "18% GST": (r.rate_18?.sgst || 0) + (r.rate_18?.cgst || 0),
                        "18% Total": r.rate_18?.total || 0,
                        // Rate 28%
                        "28% Taxable": r.rate_28?.taxable || 0,
                        "28% GST": (r.rate_28?.sgst || 0) + (r.rate_28?.cgst || 0),
                        "28% Total": r.rate_28?.total || 0,
                        // Grand Total
                        "Total Taxable": r.total?.taxable || 0,
                        "Total GST": (r.total?.sgst || 0) + (r.total?.cgst || 0),
                        "Total Amount": r.total?.total || 0,
                    };
                }

                if (patientType === "op") {
                    return {
                        "Date": r.bill_date,
                        "Particulars": r.bill_name,
                        "Bill Numbers": r.bills,
                        // Exempted
                        "Exempted Amount": r.exempted?.taxable || 0,
                        "Exempted SGST": r.exempted?.sgst || 0,
                        "Exempted CGST": r.exempted?.cgst || 0,
                        "Exempted Total": r.exempted?.total || 0,
                        // Rate 5%
                        "5% Taxable": r.rate_5?.taxable || 0,
                        "5% SGST": r.rate_5?.sgst || 0,
                        "5% CGST": r.rate_5?.cgst || 0,
                        "5% Total": r.rate_5?.total || 0,
                        // Rate 12%
                        "12% Taxable": r.rate_12?.taxable || 0,
                        "12% SGST": r.rate_12?.sgst || 0,
                        "12% CGST": r.rate_12?.cgst || 0,
                        "12% Total": r.rate_12?.total || 0,
                        // Rate 18%
                        "18% Taxable": r.rate_18?.taxable || 0,
                        "18% SGST": r.rate_18?.sgst || 0,
                        "18% CGST": r.rate_18?.cgst || 0,
                        "18% Total": r.rate_18?.total || 0,
                        // Rate 28%
                        "28% Taxable": r.rate_28?.taxable || 0,
                        "28% SGST": r.rate_28?.sgst || 0,
                        "28% CGST": r.rate_28?.cgst || 0,
                        "28% Total": r.rate_28?.total || 0,
                        // Grand Total
                        "Total Taxable": r.total?.taxable || 0,
                        "Total SGST": r.total?.sgst || 0,
                        "Total CGST": r.total?.cgst || 0,
                        "Total Amount": r.total?.total || 0,
                    };
                }

                // All (OP & IP)
                return {
                    "Date": r.bill_date,
                    "Particulars": r.bill_name,
                    "Bill Numbers": r.bills,
                    // Exempted
                    "Exempted Amount": r.exempted?.taxable || 0,
                    "Exempted SGST": isIpRow ? "—" : (r.exempted?.sgst || 0),
                    "Exempted CGST": isIpRow ? "—" : (r.exempted?.cgst || 0),
                    "Exempted GST": (r.exempted?.sgst || 0) + (r.exempted?.cgst || 0),
                    "Exempted Total": r.exempted?.total || 0,
                    // Rate 5%
                    "5% Taxable": r.rate_5?.taxable || 0,
                    "5% SGST": isIpRow ? "—" : (r.rate_5?.sgst || 0),
                    "5% CGST": isIpRow ? "—" : (r.rate_5?.cgst || 0),
                    "5% GST": (r.rate_5?.sgst || 0) + (r.rate_5?.cgst || 0),
                    "5% Total": r.rate_5?.total || 0,
                    // Rate 12%
                    "12% Taxable": r.rate_12?.taxable || 0,
                    "12% SGST": isIpRow ? "—" : (r.rate_12?.sgst || 0),
                    "12% CGST": isIpRow ? "—" : (r.rate_12?.cgst || 0),
                    "12% GST": (r.rate_12?.sgst || 0) + (r.rate_12?.cgst || 0),
                    "12% Total": r.rate_12?.total || 0,
                    // Rate 18%
                    "18% Taxable": r.rate_18?.taxable || 0,
                    "18% SGST": isIpRow ? "—" : (r.rate_18?.sgst || 0),
                    "18% CGST": isIpRow ? "—" : (r.rate_18?.cgst || 0),
                    "18% GST": (r.rate_18?.sgst || 0) + (r.rate_18?.cgst || 0),
                    "18% Total": r.rate_18?.total || 0,
                    // Rate 28%
                    "28% Taxable": r.rate_28?.taxable || 0,
                    "28% SGST": isIpRow ? "—" : (r.rate_28?.sgst || 0),
                    "28% CGST": isIpRow ? "—" : (r.rate_28?.cgst || 0),
                    "28% GST": (r.rate_28?.sgst || 0) + (r.rate_28?.cgst || 0),
                    "28% Total": r.rate_28?.total || 0,
                    // Grand Total
                    "Total Taxable": r.total?.taxable || 0,
                    "Total SGST": isIpRow ? "—" : (r.total?.sgst || 0),
                    "Total CGST": isIpRow ? "—" : (r.total?.cgst || 0),
                    "Total GST": (r.total?.sgst || 0) + (r.total?.cgst || 0),
                    "Total Amount": r.total?.total || 0,
                };
            };

            const wb = XLSX.utils.book_new();

            // Active Tab Sheet
            const activeRows = filteredData.map(formatRow);
            if (activeGt) {
                if (isIpOnly) {
                    activeRows.push({
                        "Date": "GRAND TOTAL",
                        "Particulars": "",
                        "Bill Numbers": "",
                        "Exempted Amount": activeGt.exempted?.taxable || 0,
                        "Exempted GST": (activeGt.exempted?.sgst || 0) + (activeGt.exempted?.cgst || 0),
                        "Exempted Total": activeGt.exempted?.total || 0,
                        "5% Taxable": activeGt.rate_5?.taxable || 0,
                        "5% GST": (activeGt.rate_5?.sgst || 0) + (activeGt.rate_5?.cgst || 0),
                        "5% Total": activeGt.rate_5?.total || 0,
                        "12% Taxable": activeGt.rate_12?.taxable || 0,
                        "12% GST": (activeGt.rate_12?.sgst || 0) + (activeGt.rate_12?.cgst || 0),
                        "12% Total": activeGt.rate_12?.total || 0,
                        "18% Taxable": activeGt.rate_18?.taxable || 0,
                        "18% GST": (activeGt.rate_18?.sgst || 0) + (activeGt.rate_18?.cgst || 0),
                        "18% Total": activeGt.rate_18?.total || 0,
                        "28% Taxable": activeGt.rate_28?.taxable || 0,
                        "28% GST": (activeGt.rate_28?.sgst || 0) + (activeGt.rate_28?.cgst || 0),
                        "28% Total": activeGt.rate_28?.total || 0,
                        "Total Taxable": activeGt.total?.taxable || 0,
                        "Total GST": (activeGt.total?.sgst || 0) + (activeGt.total?.cgst || 0),
                        "Total Amount": activeGt.total?.total || 0,
                    });
                } else if (patientType === "op") {
                    activeRows.push({
                        "Date": "GRAND TOTAL",
                        "Particulars": "",
                        "Bill Numbers": "",
                        "Exempted Amount": activeGt.exempted?.taxable || 0,
                        "Exempted SGST": activeGt.exempted?.sgst || 0,
                        "Exempted CGST": activeGt.exempted?.cgst || 0,
                        "Exempted Total": activeGt.exempted?.total || 0,
                        "5% Taxable": activeGt.rate_5?.taxable || 0,
                        "5% SGST": activeGt.rate_5?.sgst || 0,
                        "5% CGST": activeGt.rate_5?.cgst || 0,
                        "5% Total": activeGt.rate_5?.total || 0,
                        "12% Taxable": activeGt.rate_12?.taxable || 0,
                        "12% SGST": activeGt.rate_12?.sgst || 0,
                        "12% CGST": activeGt.rate_12?.cgst || 0,
                        "12% Total": activeGt.rate_12?.total || 0,
                        "18% Taxable": activeGt.rate_18?.taxable || 0,
                        "18% SGST": activeGt.rate_18?.sgst || 0,
                        "18% CGST": activeGt.rate_18?.cgst || 0,
                        "18% Total": activeGt.rate_18?.total || 0,
                        "28% Taxable": activeGt.rate_28?.taxable || 0,
                        "28% SGST": activeGt.rate_28?.sgst || 0,
                        "28% CGST": activeGt.rate_28?.cgst || 0,
                        "28% Total": activeGt.rate_28?.total || 0,
                        "Total Taxable": activeGt.total?.taxable || 0,
                        "Total SGST": activeGt.total?.sgst || 0,
                        "Total CGST": activeGt.total?.cgst || 0,
                        "Total Amount": activeGt.total?.total || 0,
                    });
                } else {
                    activeRows.push({
                        "Date": "GRAND TOTAL",
                        "Particulars": "",
                        "Bill Numbers": "",
                        "Exempted Amount": activeGt.exempted?.taxable || 0,
                        "Exempted SGST": activeGt.exempted?.sgst || 0,
                        "Exempted CGST": activeGt.exempted?.cgst || 0,
                        "Exempted GST": (activeGt.exempted?.sgst || 0) + (activeGt.exempted?.cgst || 0),
                        "Exempted Total": activeGt.exempted?.total || 0,
                        "5% Taxable": activeGt.rate_5?.taxable || 0,
                        "5% SGST": activeGt.rate_5?.sgst || 0,
                        "5% CGST": activeGt.rate_5?.cgst || 0,
                        "5% GST": (activeGt.rate_5?.sgst || 0) + (activeGt.rate_5?.cgst || 0),
                        "5% Total": activeGt.rate_5?.total || 0,
                        "12% Taxable": activeGt.rate_12?.taxable || 0,
                        "12% SGST": activeGt.rate_12?.sgst || 0,
                        "12% CGST": activeGt.rate_12?.cgst || 0,
                        "12% GST": (activeGt.rate_12?.sgst || 0) + (activeGt.rate_12?.cgst || 0),
                        "12% Total": activeGt.rate_12?.total || 0,
                        "18% Taxable": activeGt.rate_18?.taxable || 0,
                        "18% SGST": activeGt.rate_18?.sgst || 0,
                        "18% CGST": activeGt.rate_18?.cgst || 0,
                        "18% GST": (activeGt.rate_18?.sgst || 0) + (activeGt.rate_18?.cgst || 0),
                        "18% Total": activeGt.rate_18?.total || 0,
                        "28% Taxable": activeGt.rate_28?.taxable || 0,
                        "28% SGST": activeGt.rate_28?.sgst || 0,
                        "28% CGST": activeGt.rate_28?.cgst || 0,
                        "28% GST": (activeGt.rate_28?.sgst || 0) + (activeGt.rate_28?.cgst || 0),
                        "28% Total": activeGt.rate_28?.total || 0,
                        "Total Taxable": activeGt.total?.taxable || 0,
                        "Total SGST": activeGt.total?.sgst || 0,
                        "Total CGST": activeGt.total?.cgst || 0,
                        "Total GST": (activeGt.total?.sgst || 0) + (activeGt.total?.cgst || 0),
                        "Total Amount": activeGt.total?.total || 0,
                    });
                }
            }

            const ws = XLSX.utils.json_to_sheet(activeRows);
            XLSX.utils.book_append_sheet(wb, ws, activeTab.toUpperCase());

            const fileName = `Daywise_GST_Register_${activeTab.toUpperCase()}_${fromDate}_to_${toDate}.xlsx`;
            XLSX.writeFile(wb, fileName);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Error exporting Excel:", err);
            toast.error("Failed to export Excel");
        }
    };

    const renderRateCells = (row, slabKey) => {
        const isIpRow = row.patient_type === "IP";
        const data = row[slabKey] || {};
        const taxable = formatINR(data.taxable);
        const sgst = formatINR(data.sgst);
        const cgst = formatINR(data.cgst);
        const gst = formatINR((data.sgst || 0) + (data.cgst || 0));
        const total = formatINR(data.total);

        if (isIpOnly) {
            return (
                <>
                    <NumTd>{taxable}</NumTd>
                    <NumTd>{gst}</NumTd>
                    <NumTd style={{ fontWeight: 600, background: "#f8fafc" }}>{total}</NumTd>
                </>
            );
        }

        if (isIpRow) {
            return (
                <>
                    <NumTd>{taxable}</NumTd>
                    <NumTd colSpan={2} style={{ textAlign: "center", background: "#f5f3ff", color: "#6b21a8", fontWeight: 600 }}>
                        {gst} <span style={{ fontSize: "0.68rem", color: "#9333ea", fontWeight: 500 }}>(GST)</span>
                    </NumTd>
                    <NumTd style={{ fontWeight: 600, background: "#f8fafc" }}>{total}</NumTd>
                </>
            );
        }

        return (
            <>
                <NumTd>{taxable}</NumTd>
                <NumTd>{sgst}</NumTd>
                <NumTd>{cgst}</NumTd>
                <NumTd style={{ fontWeight: 600, background: "#f8fafc" }}>{total}</NumTd>
            </>
        );
    };

    const renderTotalCells = (row) => {
        const isIpRow = row.patient_type === "IP";
        const data = row.total || {};
        const taxable = formatINR(data.taxable);
        const sgst = formatINR(data.sgst);
        const cgst = formatINR(data.cgst);
        const gst = formatINR((data.sgst || 0) + (data.cgst || 0));
        const total = formatINR(data.total);

        if (isIpOnly) {
            return (
                <>
                    <NumTd style={{ fontWeight: 700, background: "#f1f5f9" }}>{taxable}</NumTd>
                    <NumTd style={{ fontWeight: 700, background: "#f1f5f9" }}>{gst}</NumTd>
                    <NumTd style={{ fontWeight: 800, background: "#e2e8f0", color: "#0f172a" }}>{total}</NumTd>
                </>
            );
        }

        if (isIpRow) {
            return (
                <>
                    <NumTd style={{ fontWeight: 700, background: "#f1f5f9" }}>{taxable}</NumTd>
                    <NumTd colSpan={2} style={{ fontWeight: 700, background: "#ede9fe", color: "#581c87", textAlign: "center" }}>
                        {gst} <span style={{ fontSize: "0.68rem", color: "#7c3aed" }}>(GST)</span>
                    </NumTd>
                    <NumTd style={{ fontWeight: 800, background: "#e2e8f0", color: "#0f172a" }}>{total}</NumTd>
                </>
            );
        }

        return (
            <>
                <NumTd style={{ fontWeight: 700, background: "#f1f5f9" }}>{taxable}</NumTd>
                <NumTd style={{ fontWeight: 700, background: "#f1f5f9" }}>{sgst}</NumTd>
                <NumTd style={{ fontWeight: 700, background: "#f1f5f9" }}>{cgst}</NumTd>
                <NumTd style={{ fontWeight: 800, background: "#e2e8f0", color: "#0f172a" }}>{total}</NumTd>
            </>
        );
    };

    const renderGrandTotalRateCells = (slabKey) => {
        if (!activeGt) return null;
        const data = activeGt[slabKey] || {};
        const taxable = formatINR(data.taxable);
        const sgst = formatINR(data.sgst);
        const cgst = formatINR(data.cgst);
        const gst = formatINR((data.sgst || 0) + (data.cgst || 0));
        const total = formatINR(data.total);

        if (isIpOnly) {
            return (
                <>
                    <NumTd>{taxable}</NumTd>
                    <NumTd>{gst}</NumTd>
                    <NumTd>{total}</NumTd>
                </>
            );
        }

        return (
            <>
                <NumTd>{taxable}</NumTd>
                <NumTd>{sgst}</NumTd>
                <NumTd>{cgst}</NumTd>
                <NumTd>{total}</NumTd>
            </>
        );
    };

    const renderGrandTotalCells = () => {
        if (!activeGt) return null;
        const data = activeGt.total || {};
        const taxable = formatINR(data.taxable);
        const sgst = formatINR(data.sgst);
        const cgst = formatINR(data.cgst);
        const gst = formatINR((data.sgst || 0) + (data.cgst || 0));
        const total = formatINR(data.total);

        if (isIpOnly) {
            return (
                <>
                    <NumTd style={{ fontWeight: 800 }}>{taxable}</NumTd>
                    <NumTd style={{ fontWeight: 800 }}>{gst}</NumTd>
                    <NumTd style={{ fontWeight: 900, background: "#cbd5e1" }}>{total}</NumTd>
                </>
            );
        }

        return (
            <>
                <NumTd style={{ fontWeight: 800 }}>{taxable}</NumTd>
                <NumTd style={{ fontWeight: 800 }}>{sgst}</NumTd>
                <NumTd style={{ fontWeight: 800 }}>{cgst}</NumTd>
                <NumTd style={{ fontWeight: 900, background: "#cbd5e1" }}>{total}</NumTd>
            </>
        );
    };

    const renderPrintRateCells = (row, slabKey) => {
        const isIpRow = row.patient_type === "IP";
        const data = row[slabKey] || {};
        const taxable = formatINR(data.taxable);
        const sgst = formatINR(data.sgst);
        const cgst = formatINR(data.cgst);
        const gst = formatINR((data.sgst || 0) + (data.cgst || 0));
        const total = formatINR(data.total);

        if (isIpOnly) {
            return (
                <>
                    <td style={{ textAlign: "right" }}>{taxable}</td>
                    <td style={{ textAlign: "right" }}>{gst}</td>
                    <td style={{ textAlign: "right" }}>{total}</td>
                </>
            );
        }

        if (isIpRow) {
            return (
                <>
                    <td style={{ textAlign: "right" }}>{taxable}</td>
                    <td colSpan={2} style={{ textAlign: "center" }}>{gst}</td>
                    <td style={{ textAlign: "right" }}>{total}</td>
                </>
            );
        }

        return (
            <>
                <td style={{ textAlign: "right" }}>{taxable}</td>
                <td style={{ textAlign: "right" }}>{sgst}</td>
                <td style={{ textAlign: "right" }}>{cgst}</td>
                <td style={{ textAlign: "right" }}>{total}</td>
            </>
        );
    };

    const renderPrintTotalCells = (row) => {
        const isIpRow = row.patient_type === "IP";
        const data = row.total || {};
        const taxable = formatINR(data.taxable);
        const sgst = formatINR(data.sgst);
        const cgst = formatINR(data.cgst);
        const gst = formatINR((data.sgst || 0) + (data.cgst || 0));
        const total = formatINR(data.total);

        if (isIpOnly) {
            return (
                <>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{taxable}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{gst}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{total}</td>
                </>
            );
        }

        if (isIpRow) {
            return (
                <>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{taxable}</td>
                    <td colSpan={2} style={{ textAlign: "center", fontWeight: "bold" }}>{gst}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>{total}</td>
                </>
            );
        }

        return (
            <>
                <td style={{ textAlign: "right", fontWeight: "bold" }}>{taxable}</td>
                <td style={{ textAlign: "right", fontWeight: "bold" }}>{sgst}</td>
                <td style={{ textAlign: "right", fontWeight: "bold" }}>{cgst}</td>
                <td style={{ textAlign: "right", fontWeight: "bold" }}>{total}</td>
            </>
        );
    };

    return (
        <PageWrapper style={isModalView ? { padding: 0 } : {}}>
            {!isModalView && (
                <div style={{ marginBottom: "20px" }}>
                    <SectionTitle style={{ margin: 0 }}>Day-wise Sales Tax Register (GST)</SectionTitle>
                    <p style={{ color: colors.textMuted, fontSize: "0.85rem", margin: "4px 0 0 0" }}>
                        Day-wise summary breakdown of pharmacy OP/IP bills and sales returns across GST tax slabs (Exempted, 5%, 12%, 18%, 28%).
                    </p>
                </div>
            )}

            {/* TAB BAR */}
            <TabBar>
                <TabButton 
                    active={activeTab === "sales"} 
                    onClick={() => setActiveTab("sales")}
                >
                    <FaShoppingCart /> Sales Register
                </TabButton>
                <TabButton 
                    active={activeTab === "returns"} 
                    onClick={() => setActiveTab("returns")}
                >
                    <FaUndoAlt /> Returns Register
                </TabButton>
                <TabButton 
                    active={activeTab === "net"} 
                    onClick={() => setActiveTab("net")}
                >
                    <FaLayerGroup /> Net Consolidated Register
                </TabButton>
            </TabBar>

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

                    <InputWrapper style={{ flex: "1 1 140px" }}>
                        <Label>Patient Type</Label>
                        <Select
                            value={patientType}
                            onChange={(e) => setPatientType(e.target.value)}
                            style={{ height: "40px" }}
                        >
                            <option value="all">All (OP & IP)</option>
                            <option value="op">OP Only</option>
                            <option value="ip">IP Only</option>
                        </Select>
                    </InputWrapper>

                    <InputWrapper style={{ flex: "1 1 200px" }}>
                        <Label>Search</Label>
                        <Input
                            type="text"
                            placeholder="Search date, bill no, type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ height: "40px" }}
                        />
                    </InputWrapper>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <Button 
                            onClick={fetchReport} 
                            disabled={loading}
                            style={{ height: "40px" }}
                        >
                            <FaSearch style={{ marginRight: "6px" }} /> {loading ? "Loading..." : "Refresh"}
                        </Button>
                        <Button
                            onClick={handleExportExcel}
                            disabled={loading || activeList.length === 0}
                            style={{ height: "40px", background: "#16a34a", borderColor: "#16a34a", color: "#fff" }}
                        >
                            <FaFileExcel style={{ marginRight: "6px" }} /> Export Excel
                        </Button>
                        <Button 
                            onClick={handlePrint} 
                            disabled={loading || activeList.length === 0}
                            secondary 
                            style={{ height: "40px" }}
                        >
                            <FaPrint style={{ marginRight: "6px" }} /> Print
                        </Button>
                    </div>
                </FormRow>
            </FilterSection>

            {/* SUMMARY CARDS */}
            {activeGt && (
                <SummaryCardsGrid>
                    <SummaryCard color={colors.primary}>
                        <SummaryLabel>Total Taxable Value</SummaryLabel>
                        <SummaryValue color={colors.primary}>₹{formatINR(activeGt.total?.taxable)}</SummaryValue>
                    </SummaryCard>
                    {isIpOnly ? (
                        <SummaryCard color="#0284c7">
                            <SummaryLabel>Total GST</SummaryLabel>
                            <SummaryValue color="#0284c7">
                                ₹{formatINR((activeGt.total?.sgst || 0) + (activeGt.total?.cgst || 0))}
                            </SummaryValue>
                        </SummaryCard>
                    ) : (
                        <>
                            <SummaryCard color="#0284c7">
                                <SummaryLabel>Total SGST</SummaryLabel>
                                <SummaryValue color="#0284c7">₹{formatINR(activeGt.total?.sgst)}</SummaryValue>
                            </SummaryCard>
                            <SummaryCard color="#7c3aed">
                                <SummaryLabel>Total CGST</SummaryLabel>
                                <SummaryValue color="#7c3aed">₹{formatINR(activeGt.total?.cgst)}</SummaryValue>
                            </SummaryCard>
                        </>
                    )}
                    <SummaryCard color="#16a34a">
                        <SummaryLabel>Grand Total (Gross/Net)</SummaryLabel>
                        <SummaryValue color="#16a34a">₹{formatINR(activeGt.total?.total)}</SummaryValue>
                    </SummaryCard>
                </SummaryCardsGrid>
            )}

            {/* DENSE MULTI-LEVEL TABLE */}
            <DenseTableWrapper>
                <Table style={{ minWidth: isIpOnly ? "1100px" : "1400px", borderCollapse: "collapse" }}>
                    <thead>
                        {/* Group Header Row 1 */}
                        <Tr>
                            <GroupTh rowSpan={2} bg="#0f172a" style={{ width: "90px" }}>Date</GroupTh>
                            <GroupTh rowSpan={2} bg="#0f172a" style={{ width: "200px" }}>Particulars</GroupTh>
                            <GroupTh rowSpan={2} bg="#0f172a" style={{ width: "160px" }}>Bill Nos</GroupTh>
                            <GroupTh colSpan={isIpOnly ? 3 : 4} bg="#475569">Exempted</GroupTh>
                            <GroupTh colSpan={isIpOnly ? 3 : 4} bg="#0284c7">Rate 5%</GroupTh>
                            <GroupTh colSpan={isIpOnly ? 3 : 4} bg="#2563eb">Rate 12%</GroupTh>
                            <GroupTh colSpan={isIpOnly ? 3 : 4} bg="#7c3aed">Rate 18%</GroupTh>
                            <GroupTh colSpan={isIpOnly ? 3 : 4} bg="#9333ea">Rate 28%</GroupTh>
                            <GroupTh colSpan={isIpOnly ? 3 : 4} bg="#0f172a">Total</GroupTh>
                        </Tr>
                        {/* Sub Header Row 2 */}
                        <Tr>
                            {/* Exempted */}
                            <SubTh>Amount</SubTh>
                            {isIpOnly ? <SubTh>GST</SubTh> : <><SubTh>SGST</SubTh><SubTh>CGST</SubTh></>}
                            <SubTh bg="#e2e8f0">Total</SubTh>
                            {/* 5% */}
                            <SubTh>Amount</SubTh>
                            {isIpOnly ? <SubTh>GST</SubTh> : <><SubTh>SGST</SubTh><SubTh>CGST</SubTh></>}
                            <SubTh bg="#e2e8f0">Total</SubTh>
                            {/* 12% */}
                            <SubTh>Amount</SubTh>
                            {isIpOnly ? <SubTh>GST</SubTh> : <><SubTh>SGST</SubTh><SubTh>CGST</SubTh></>}
                            <SubTh bg="#e2e8f0">Total</SubTh>
                            {/* 18% */}
                            <SubTh>Amount</SubTh>
                            {isIpOnly ? <SubTh>GST</SubTh> : <><SubTh>SGST</SubTh><SubTh>CGST</SubTh></>}
                            <SubTh bg="#e2e8f0">Total</SubTh>
                            {/* 28% */}
                            <SubTh>Amount</SubTh>
                            {isIpOnly ? <SubTh>GST</SubTh> : <><SubTh>SGST</SubTh><SubTh>CGST</SubTh></>}
                            <SubTh bg="#e2e8f0">Total</SubTh>
                            {/* Total */}
                            <SubTh bg="#e2e8f0">Taxable</SubTh>
                            {isIpOnly ? <SubTh bg="#e2e8f0">GST</SubTh> : <><SubTh bg="#e2e8f0">SGST</SubTh><SubTh bg="#e2e8f0">CGST</SubTh></>}
                            <SubTh bg="#cbd5e1" style={{ fontWeight: "700" }}>Total Amt</SubTh>
                        </Tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={totalTableCols} style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                                    Loading day-wise register records...
                                </Td>
                            </Tr>
                        ) : filteredData.length > 0 ? (
                            <>
                                {filteredData.map((row, idx) => (
                                    <Tr key={idx}>
                                        <TextTd>{row.bill_date}</TextTd>
                                        <TextTd style={{ fontWeight: 600 }}>{row.bill_name}</TextTd>
                                        <TextTd style={{ fontSize: "0.72rem", color: "#475569" }}>{row.bills}</TextTd>
                                        {/* Exempted */}
                                        {renderRateCells(row, "exempted")}
                                        {/* 5% */}
                                        {renderRateCells(row, "rate_5")}
                                        {/* 12% */}
                                        {renderRateCells(row, "rate_12")}
                                        {/* 18% */}
                                        {renderRateCells(row, "rate_18")}
                                        {/* 28% */}
                                        {renderRateCells(row, "rate_28")}
                                        {/* Total */}
                                        {renderTotalCells(row)}
                                    </Tr>
                                ))}

                                {/* Grand Total Row */}
                                {activeGt && (
                                    <GrandTotalTr>
                                        <Td colSpan={3} style={{ textAlign: "center", textTransform: "uppercase" }}>
                                            Grand Total
                                        </Td>
                                        {/* Exempted */}
                                        {renderGrandTotalRateCells("exempted")}
                                        {/* 5% */}
                                        {renderGrandTotalRateCells("rate_5")}
                                        {/* 12% */}
                                        {renderGrandTotalRateCells("rate_12")}
                                        {/* 18% */}
                                        {renderGrandTotalRateCells("rate_18")}
                                        {/* 28% */}
                                        {renderGrandTotalRateCells("rate_28")}
                                        {/* Total */}
                                        {renderGrandTotalCells()}
                                    </GrandTotalTr>
                                )}
                            </>
                        ) : (
                            <Tr>
                                <Td colSpan={totalTableCols} style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                                    No day-wise records found for the selected date range.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                </Table>
            </DenseTableWrapper>

            {/* PRINT TEMPLATE */}
            <PrintTemplate id="printable-daywise-gst-area">
                <div className="report-header">
                    <h1>{localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL"}</h1>
                    <p>{localStorage.getItem("branch_name") || "Main Branch"}</p>
                    <div className="report-title">{getReportTitle()}</div>
                </div>

                <table className="info-table">
                    <tbody>
                        <tr>
                            <td style={{ width: "30%" }}><strong>From Date:</strong> {dayjs(fromDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "30%" }}><strong>To Date:</strong> {dayjs(toDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "40%", textAlign: "right" }}><strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}</td>
                        </tr>
                        <tr>
                            <td><strong>Patient Type:</strong> {patientType.toUpperCase()}</td>
                            <td><strong>Register Type:</strong> {activeTab.toUpperCase()}</td>
                            <td style={{ textAlign: "right" }}><strong>Printed By:</strong> {localStorage.getItem("employeeId") || "Staff"}</td>
                        </tr>
                    </tbody>
                </table>

                {activeGt && (
                    <div className="summary-grid">
                        <div><strong>Total Taxable:</strong> ₹{formatINR(activeGt.total?.taxable)}</div>
                        {isIpOnly ? (
                            <div><strong>Total GST:</strong> ₹{formatINR((activeGt.total?.sgst || 0) + (activeGt.total?.cgst || 0))}</div>
                        ) : (
                            <>
                                <div><strong>Total SGST:</strong> ₹{formatINR(activeGt.total?.sgst)}</div>
                                <div><strong>Total CGST:</strong> ₹{formatINR(activeGt.total?.cgst)}</div>
                            </>
                        )}
                        <div><strong>Grand Total:</strong> ₹{formatINR(activeGt.total?.total)}</div>
                    </div>
                )}

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7.5px" }}>
                    <thead>
                        <tr style={{ background: "#f1f5f9" }}>
                            <th rowSpan={2}>Date</th>
                            <th rowSpan={2}>Particulars</th>
                            <th rowSpan={2}>Bill Nos</th>
                            <th colSpan={isIpOnly ? 3 : 4} style={{ textAlign: "center" }}>Exempted</th>
                            <th colSpan={isIpOnly ? 3 : 4} style={{ textAlign: "center" }}>Rate 5%</th>
                            <th colSpan={isIpOnly ? 3 : 4} style={{ textAlign: "center" }}>Rate 12%</th>
                            <th colSpan={isIpOnly ? 3 : 4} style={{ textAlign: "center" }}>Rate 18%</th>
                            <th colSpan={isIpOnly ? 3 : 4} style={{ textAlign: "center" }}>Rate 28%</th>
                            <th colSpan={isIpOnly ? 3 : 4} style={{ textAlign: "center" }}>Total</th>
                        </tr>
                        <tr style={{ background: "#f8fafc", fontSize: "7px" }}>
                            {isIpOnly ? (
                                <>
                                    <th>Amt</th><th>GST</th><th>Tot</th>
                                    <th>Amt</th><th>GST</th><th>Tot</th>
                                    <th>Amt</th><th>GST</th><th>Tot</th>
                                    <th>Amt</th><th>GST</th><th>Tot</th>
                                    <th>Amt</th><th>GST</th><th>Tot</th>
                                    <th>Taxable</th><th>GST</th><th>Tot Amt</th>
                                </>
                            ) : (
                                <>
                                    <th>Amt</th><th>SGST</th><th>CGST</th><th>Tot</th>
                                    <th>Amt</th><th>SGST</th><th>CGST</th><th>Tot</th>
                                    <th>Amt</th><th>SGST</th><th>CGST</th><th>Tot</th>
                                    <th>Amt</th><th>SGST</th><th>CGST</th><th>Tot</th>
                                    <th>Amt</th><th>SGST</th><th>CGST</th><th>Tot</th>
                                    <th>Taxable</th><th>SGST</th><th>CGST</th><th>Tot Amt</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((row, idx) => (
                            <tr key={idx}>
                                <td>{row.bill_date}</td>
                                <td>{row.bill_name}</td>
                                <td>{row.bills}</td>
                                {renderPrintRateCells(row, "exempted")}
                                {renderPrintRateCells(row, "rate_5")}
                                {renderPrintRateCells(row, "rate_12")}
                                {renderPrintRateCells(row, "rate_18")}
                                {renderPrintRateCells(row, "rate_28")}
                                {renderPrintTotalCells(row)}
                            </tr>
                        ))}
                        {activeGt && (
                            <tr style={{ fontWeight: "bold", background: "#f1f5f9" }}>
                                <td colSpan={3} style={{ textAlign: "center" }}>GRAND TOTAL</td>
                                {isIpOnly ? (
                                    <>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.exempted?.taxable)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR((activeGt.exempted?.sgst || 0) + (activeGt.exempted?.cgst || 0))}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.exempted?.total)}</td>

                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_5?.taxable)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR((activeGt.rate_5?.sgst || 0) + (activeGt.rate_5?.cgst || 0))}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_5?.total)}</td>

                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_12?.taxable)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR((activeGt.rate_12?.sgst || 0) + (activeGt.rate_12?.cgst || 0))}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_12?.total)}</td>

                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_18?.taxable)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR((activeGt.rate_18?.sgst || 0) + (activeGt.rate_18?.cgst || 0))}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_18?.total)}</td>

                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_28?.taxable)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR((activeGt.rate_28?.sgst || 0) + (activeGt.rate_28?.cgst || 0))}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_28?.total)}</td>

                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.total?.taxable)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR((activeGt.total?.sgst || 0) + (activeGt.total?.cgst || 0))}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.total?.total)}</td>
                                    </>
                                ) : (
                                    <>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.exempted?.taxable)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.exempted?.sgst)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.exempted?.cgst)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.exempted?.total)}</td>

                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_5?.taxable)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_5?.sgst)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_5?.cgst)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_5?.total)}</td>

                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_12?.taxable)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_12?.sgst)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_12?.cgst)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_12?.total)}</td>

                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_18?.taxable)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_18?.sgst)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_18?.cgst)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_18?.total)}</td>

                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_28?.taxable)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_28?.sgst)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_28?.cgst)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.rate_28?.total)}</td>

                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.total?.taxable)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.total?.sgst)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.total?.cgst)}</td>
                                        <td style={{ textAlign: "right" }}>{formatINR(activeGt.total?.total)}</td>
                                    </>
                                )}
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="signatures">
                    <div className="sig-box">Prepared By</div>
                    <div className="sig-box">Accounts Officer</div>
                    <div className="sig-box">Authorized Signatory</div>
                </div>
            </PrintTemplate>
        </PageWrapper>
    );
};

export default DaywiseSalesTaxRegister;
