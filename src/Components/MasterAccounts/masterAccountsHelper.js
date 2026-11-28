import React from "react";
import styled from "styled-components";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import apiRequest from "../../Auth/apiRequest";
import { printAccountsReport as basePrintAccountsReport } from "../Accounts/printAccountsReport";

// ─── IN-MEMORY GLOBAL CACHES & DEDUPLICATION ─────────────────────────────────
let outletsCache = null;
let outletsPromise = null;

const apiCache = new Map();
const inFlightRequests = new Map();

/**
 * Fetches and globally caches hospital outlets.
 * Prevents redundant HTTP calls when switching between reports or mounting components.
 */
export const fetchCachedOutlets = async (HmsBaseUrl) => {
    if (outletsCache && Array.isArray(outletsCache) && outletsCache.length > 0) {
        return outletsCache;
    }
    if (outletsPromise) {
        return outletsPromise;
    }
    outletsPromise = (async () => {
        try {
            const res = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
            let list = [];
            if (res?.success && Array.isArray(res?.data)) {
                list = res.data;
            } else if (Array.isArray(res?.data?.data)) {
                list = res.data.data;
            } else if (Array.isArray(res?.data?.outlets)) {
                list = res.data.outlets;
            }
            if (list.length > 0) {
                outletsCache = list;
            }
            return list;
        } catch (err) {
            console.error("Failed to fetch outlets:", err);
            return [];
        } finally {
            outletsPromise = null;
        }
    })();
    return outletsPromise;
};

export const getCachedOutlets = () => outletsCache || [];

/**
 * Deduplicated, short-TTL cached apiRequest for GET endpoints.
 * Automatically deduplicates simultaneous in-flight requests and caches responses for `ttl` ms (default 30s).
 */
export const cachedApiRequest = async (url, method = "GET", data = null, options = {}) => {
    const m = (method || "GET").toUpperCase();
    const { ttl = 30000, forceRefresh = false } = options;

    if (m !== "GET" || forceRefresh) {
        if (forceRefresh) {
            apiCache.delete(url);
        }
        return apiRequest(url, method, data);
    }

    const now = Date.now();
    const cached = apiCache.get(url);
    if (cached && (now - cached.timestamp < ttl)) {
        return cached.response;
    }

    if (inFlightRequests.has(url)) {
        return inFlightRequests.get(url);
    }

    const promise = (async () => {
        try {
            const response = await apiRequest(url, method, data);
            if (response && response.success) {
                apiCache.set(url, { timestamp: Date.now(), response });
            }
            return response;
        } finally {
            inFlightRequests.delete(url);
        }
    })();

    inFlightRequests.set(url, promise);
    return promise;
};

export const clearReportCache = () => {
    apiCache.clear();
};

export const formatINR = (val) => {
    const num = cleanNum(val);
    return num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export const cleanNum = (val) => {
    if (val === null || val === undefined || val === "") return 0;
    const cleaned = String(val).replace(/,/g, "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
};

export const extractReportData = (res) => {
    if (!res) return { data: [], summary: {} };
    // Unwrap apiRequest container if present
    if (res.data && typeof res.data === "object" && (res.data.success !== undefined || res.data.report_title !== undefined || res.data.data !== undefined || res.data.invoices !== undefined)) {
        return res.data;
    }
    return res;
};

export const getSafeArray = (source) => {
    if (Array.isArray(source)) return source;
    if (source && Array.isArray(source.data)) return source.data;
    if (source && Array.isArray(source.invoices)) return source.invoices;
    return [];
};

export const exportToExcel = (data, fileName = "Accounts_Report", sheetName = "Report") => {
    if (!data || !data.length) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

// Use the isolated iframe print engine from printAccountsReport.js
export const printAccountsReport = (elementId = "printable-report-area", orientation = "landscape") => {
    basePrintAccountsReport(elementId, orientation);
};

// Alias printReportArea to printAccountsReport for drop-in compatibility
export const printReportArea = (elementId = "printable-report-area", orientation = "landscape") => {
    basePrintAccountsReport(elementId, orientation);
};

// ─── COMMON STYLED ELEMENTS FOR MASTER ACCOUNTS PAGES ─────────────────────────
export const ReportPageWrapper = styled.div`
    padding: ${props => props.$isModal ? "0" : "20px 24px"};
    background: ${props => props.$isModal ? "transparent" : "#f8fafc"};
    min-height: ${props => props.$isModal ? "auto" : "100vh"};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
`;

export const ControlCard = styled.div`
    background: #ffffff;
    border-radius: 12px;
    padding: 18px 22px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    margin-bottom: 18px;
`;

export const HeaderBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;

    .title-group {
        h1 {
            font-size: 1.4rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;

            span.badge {
                font-size: 0.72rem;
                background: #0ea5e9;
                color: #ffffff;
                padding: 3px 10px;
                border-radius: 16px;
                font-weight: 600;
            }
        }
        p {
            font-size: 0.82rem;
            color: #64748b;
            margin: 3px 0 0 0;
        }
    }

    .btn-group {
        display: flex;
        align-items: center;
        gap: 10px;
    }
`;

export const FilterBar = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    background: #f1f5f9;
    padding: 12px 16px;
    border-radius: 8px;

    .filter-item {
        display: flex;
        align-items: center;
        gap: 8px;

        label {
            font-size: 0.78rem;
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
        }
    }
`;

export const KPIGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 14px;
    margin-bottom: 20px;
`;

export const KPICard = styled.div`
    background: #ffffff;
    border-radius: 10px;
    padding: 14px 18px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-left: 4px solid ${props => props.$border || "#0ea5e9"};

    .kpi-title {
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
    .kpi-value {
        font-size: 1.35rem;
        font-weight: 800;
        color: #0f172a;
        margin-top: 4px;
    }
    .kpi-subtitle {
        font-size: 0.72rem;
        color: #94a3b8;
        margin-top: 2px;
    }
`;

export const DataTableWrapper = styled.div`
    background: #ffffff;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    overflow-x: auto;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.88rem;
        text-align: left;
    }

    thead th {
        background: #f8fafc;
        color: #1e293b;
        font-weight: 700;
        padding: 9px 12px;
        border-bottom: 1.5px solid #cbd5e1;
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        white-space: nowrap;
    }

    tbody td {
        padding: 7px 12px;
        border-bottom: 1px solid #f1f5f9;
        color: #0f172a;
        font-size: 0.86rem;
        white-space: nowrap;
    }

    tbody tr:hover {
        background: #f8fafc;
    }

    .text-center {
        text-align: center !important;
    }

    .text-right, td[align="right"], th[align="right"] {
        text-align: right !important;
    }

    /* Make all numbers bold, clearly sized, and highly legible */
    .font-mono, td.text-right, span.font-mono, td[align="right"] {
        font-family: "Consolas", "Courier New", monospace !important;
        font-size: 0.94rem !important;
        font-weight: 700 !important;
        font-variant-numeric: tabular-nums !important;
        color: #0f172a;
    }

    tr.total-row {
        background: #f1f5f9 !important;
        font-weight: 800;
        border-top: 2px solid #94a3b8;
        border-bottom: 2px double #475569;

        td {
            font-size: 0.92rem;
            color: #0f172a;
            padding: 9px 12px;
        }

        .text-right, .font-mono {
            font-size: 1.05rem !important;
            font-weight: 800 !important;
        }
    }
`;

// ─── FORMAL PRINT LETTERHEAD & TEMPLATE FOR MASTER ACCOUNTS REPORTS ──────────
export const PrintHeader = styled.div`
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 8px;
    margin-bottom: 12px;

    h1 {
        margin: 0;
        font-size: 18px;
        text-transform: uppercase;
        font-weight: 800;
        letter-spacing: 0.5px;
    }
    p {
        margin: 2px 0;
        font-size: 11px;
        color: #333;
    }
    .report-title {
        font-size: 13px;
        font-weight: 800;
        margin-top: 6px;
        text-transform: uppercase;
        text-decoration: underline;
    }
`;

export const PrintInfoTable = styled.table`
    width: 100%;
    margin-bottom: 10px;
    border-collapse: collapse;
    font-size: 10px;

    td {
        padding: 2px 4px;
        border: none !important;
    }
`;

export const PrintSignatures = styled.div`
    margin-top: 35px;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    page-break-inside: avoid;

    .sig-box {
        text-align: center;
        width: 160px;
        border-top: 1px solid #000;
        padding-top: 4px;
        font-weight: bold;
    }
`;

export const ReportPrintHeader = ({ title, fromDate, toDate, typeDesc, printedBy }) => {
    const hospitalName = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL";
    const branchName = localStorage.getItem("branch_name") || "Main Branch";
    const user = printedBy || localStorage.getItem("employeeId") || localStorage.getItem("userName") || "Accounts Officer";

    return (
        <div className="report-print-header">
            <PrintHeader>
                <h1>{hospitalName}</h1>
                <p>{branchName}</p>
                <div className="report-title">{title}</div>
            </PrintHeader>
            <PrintInfoTable>
                <tbody>
                    <tr>
                        <td style={{ width: "30%" }}>
                            <strong>From Date:</strong> {fromDate ? dayjs(fromDate).format("DD/MM/YYYY") : "—"}
                        </td>
                        <td style={{ width: "30%" }}>
                            <strong>To Date:</strong> {toDate ? dayjs(toDate).format("DD/MM/YYYY") : "—"}
                        </td>
                        <td style={{ width: "40%", textAlign: "right" }}>
                            <strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <strong>Type:</strong> {typeDesc || title}
                        </td>
                        <td style={{ textAlign: "right" }}>
                            <strong>Printed By:</strong> {user}
                        </td>
                    </tr>
                </tbody>
            </PrintInfoTable>
        </div>
    );
};

export const ReportPrintFooter = () => (
    <PrintSignatures
        className="print-signatures"
        style={{
            marginTop: "48px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            padding: "0 20px",
            boxSizing: "border-box",
            pageBreakInside: "avoid",
        }}
    >
        <div className="sig-box" style={{ borderTop: "1px solid #1e293b", paddingTop: "6px", width: "180px", textAlign: "center", fontWeight: 700, fontSize: "10px" }}>Prepared By</div>
        <div className="sig-box" style={{ borderTop: "1px solid #1e293b", paddingTop: "6px", width: "180px", textAlign: "center", fontWeight: 700, fontSize: "10px" }}>Accounts Officer</div>
        <div className="sig-box" style={{ borderTop: "1px solid #1e293b", paddingTop: "6px", width: "180px", textAlign: "center", fontWeight: 700, fontSize: "10px" }}>Authorized Signatory</div>
    </PrintSignatures>
);

/**
 * Universal dynamic category & bill type matcher for all Master Accounts reports.
 * Matches backend bill types, category names, aliases, and keyword groupings.
 */
export const matchCategoryOrBillType = (itemCategory, filterVal, itemModule = "") => {
    if (!filterVal || filterVal === "all" || filterVal === "All" || filterVal === "ALL") return true;
    if (!itemCategory) return false;

    const itCat = String(itemCategory).trim();
    const fVal = String(filterVal).trim();

    if (itCat.toLowerCase() === fVal.toLowerCase()) return true;

    // Normalized alphanumeric check (removes punctuation, spaces, brackets, hyphens)
    const itNorm = itCat.toLowerCase().replace(/[^a-z0-9]/g, "");
    const fNorm = fVal.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (itNorm === fNorm) return true;
    if (fNorm.length >= 3 && itNorm.includes(fNorm)) return true;
    if (itNorm.length >= 3 && fNorm.includes(itNorm)) return true;

    // Check itemModule or type_name
    if (itemModule) {
        const modNorm = String(itemModule).toLowerCase().replace(/[^a-z0-9]/g, "");
        if (modNorm === fNorm || (fNorm.length >= 3 && modNorm.includes(fNorm))) return true;
    }

    // Keyword tokens check (e.g. "ECG", "LAB", "PHARMACY", "DISCHARGE", "ADVANCE", "XRAY")
    const fTokens = fVal.toLowerCase().split(/[\s()_/,.-]+/).filter(t => t.length >= 3);
    const itTokens = itCat.toLowerCase().split(/[\s()_/,.-]+/).filter(t => t.length >= 3);
    if (fTokens.length > 0 && fTokens.every(t => itCat.toLowerCase().includes(t))) return true;
    if (itTokens.length > 0 && itTokens.every(t => fVal.toLowerCase().includes(t))) return true;

    // Semantic hospital groupings
    const fLower = fVal.toLowerCase();
    const itLower = itCat.toLowerCase();
    if (fLower.includes("discharge") && itLower.includes("discharge")) return true;
    if (fLower.includes("registration") && itLower.includes("registration")) return true;
    if (fLower.includes("pharmacy") && itLower.includes("pharmacy")) return true;
    if (fLower.includes("admission") && itLower.includes("admission")) return true;
    if ((fLower.includes("sales return") || fLower.includes("return")) && (itLower.includes("return") || itLower.includes("refund"))) return true;
    if (fLower.includes("advance") && itLower.includes("advance")) return true;
    if (fLower.includes("misc") && (itLower.includes("misc") || itLower.includes("expense"))) return true;
    if (fLower.includes("investigation") && (
        itLower.includes("lab") || itLower.includes("scan") || itLower.includes("x-ray") || itLower.includes("xray") ||
        itLower.includes("ecg") || itLower.includes("echo") || itLower.includes("mri") || itLower.includes("pet") ||
        itLower.includes("dialysis") || itLower.includes("dental") || itLower.includes("procedure")
    )) return true;

    return false;
};


