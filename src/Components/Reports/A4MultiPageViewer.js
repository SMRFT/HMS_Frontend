import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { 
    Maximize2, 
    Minimize2, 
    RotateCw, 
    Download, 
    Printer, 
    Filter, 
    X, 
    Menu,
    Search,
    ChevronDown,
    ChevronUp,
    Check,
    RefreshCw
} from "lucide-react";
import { printAccountsReport } from "../Accounts/printAccountsReport";

// ─── STYLED COMPONENTS ───────────────────────────────────────────────────────

const ModalContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: ${props => props.$isMaximized ? "96vh" : "88vh"};
    background: #202224;
    color: #e2e8f0;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
`;

const ModalTopHeader = styled.div`
    background: #176B87;
    color: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    height: 44px;
    user-select: none;
    box-sizing: border-box;
    flex-shrink: 0;

    .title-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .print-badge {
            font-size: 1.05rem;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: 0.02em;
        }

        .report-name {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
            border-left: 1px solid rgba(255, 255, 255, 0.3);
            padding-left: 10px;
            max-width: 450px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .actions-right {
        display: flex;
        align-items: center;
        gap: 8px;

        .action-btn {
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            border-radius: 4px;
            height: 28px;
            min-width: 28px;
            padding: 0 8px;
            display: flex;
            align-items: center;
            gap: 4px;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
            font-size: 12px;

            &:hover {
                background: rgba(255, 255, 255, 0.25);
            }

            &.active {
                background: #0284c7;
                border-color: #38bdf8;
                font-weight: 700;
            }

            &.excel {
                background: #16a34a;
                border-color: #16a34a;
                font-weight: 800;
                font-size: 11px;
                &:hover { background: #15803d; }
            }

            &.word {
                background: #2563eb;
                border-color: #2563eb;
                font-weight: 800;
                font-size: 11px;
                &:hover { background: #1d4ed8; }
            }

            &.close {
                background: rgba(239, 68, 68, 0.85);
                border-color: transparent;
                &:hover { background: #dc2626; }
            }
        }
    }
`;

const ViewerToolbar = styled.div`
    background: #323639;
    color: #e2e8f0;
    height: 40px;
    border-bottom: 1px solid #202224;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    font-size: 0.82rem;
    user-select: none;
    box-sizing: border-box;
    flex-shrink: 0;

    .toolbar-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .sidebar-toggle {
            cursor: pointer;
            opacity: 0.85;
            padding: 4px;
            border-radius: 4px;
            &:hover { background: #404448; opacity: 1; }
        }

        .doc-uuid {
            font-family: monospace;
            font-size: 0.78rem;
            color: #cbd5e1;
            max-width: 280px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .toolbar-center {
        display: flex;
        align-items: center;
        gap: 12px;

        .page-counter {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.82rem;
            color: #e2e8f0;
            background: #202224;
            padding: 3px 10px;
            border-radius: 4px;
            font-family: monospace;
        }

        .zoom-group {
            display: flex;
            align-items: center;
            background: #202224;
            border-radius: 4px;
            overflow: hidden;

            button {
                background: transparent;
                border: none;
                color: #fff;
                padding: 4px 10px;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.85rem;
                &:hover { background: #404448; }
            }

            .zoom-val {
                padding: 0 8px;
                font-size: 0.78rem;
                color: #e2e8f0;
                min-width: 42px;
                text-align: center;
            }
        }

        .tool-btn {
            background: transparent;
            border: none;
            color: #cbd5e1;
            padding: 5px 8px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 0.8rem;
            &:hover { background: #404448; color: #fff; }
        }
    }

    .toolbar-right {
        display: flex;
        align-items: center;
        gap: 8px;

        .filter-toggle-btn {
            background: ${props => props.$isFilterOpen ? "#0284c7" : "#475569"};
            border: 1px solid ${props => props.$isFilterOpen ? "#38bdf8" : "#64748b"};
            color: #ffffff;
            padding: 4px 10px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            font-size: 0.78rem;
            font-weight: 600;
            transition: all 0.15s ease;

            &:hover {
                background: #0284c7;
            }
        }

        .tool-btn {
            background: transparent;
            border: none;
            color: #cbd5e1;
            padding: 5px 8px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            font-size: 0.8rem;
            &:hover { background: #404448; color: #fff; }
        }
    }
`;

const InViewerFilterBar = styled.div`
    background: #1e293b;
    border-bottom: 1px solid #334155;
    padding: 10px 16px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;
    animation: fadeIn 0.2s ease-out;

    .filter-item {
        display: flex;
        align-items: center;
        gap: 6px;

        .filter-label {
            font-size: 0.75rem;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            white-space: nowrap;
        }

        .ant-picker {
            background: #0f172a;
            border: 1px solid #475569;
            border-radius: 6px;
            height: 32px;
            padding: 4px 8px;

            input {
                color: #f8fafc !important;
                font-size: 0.8rem;
            }

            .ant-picker-suffix {
                color: #94a3b8;
            }
        }

        select {
            background: #0f172a;
            color: #f8fafc;
            border: 1px solid #475569;
            border-radius: 6px;
            height: 32px;
            padding: 0 10px;
            font-size: 0.8rem;
            outline: none;
            max-width: 200px;

            &:focus {
                border-color: #38bdf8;
            }
        }

        .search-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;

            svg {
                position: absolute;
                left: 8px;
                color: #94a3b8;
            }

            input {
                background: #0f172a;
                color: #f8fafc;
                border: 1px solid #475569;
                border-radius: 6px;
                height: 32px;
                padding: 0 10px 0 28px;
                font-size: 0.8rem;
                outline: none;
                width: 180px;

                &::placeholder {
                    color: #64748b;
                }

                &:focus {
                    border-color: #38bdf8;
                    width: 220px;
                    transition: width 0.2s ease;
                }
            }
        }
    }

    .apply-btn {
        background: #0284c7;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        padding: 0 14px;
        height: 32px;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: all 0.15s ease;

        &:hover {
            background: #0369a1;
        }
    }
`;

const ViewerBody = styled.div`
    background: #525659;
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
`;

const ThumbnailsSidebar = styled.div`
    width: 140px;
    background: #323639;
    border-right: 1px solid #202224;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    flex-shrink: 0;

    .thumbnail-card {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        transition: transform 0.15s ease;

        &:hover {
            transform: translateY(-2px);
        }

        .thumb-preview {
            width: 100px;
            height: 132px;
            background: #ffffff;
            border-radius: 3px;
            border: 2px solid transparent;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
            padding: 8px 6px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            box-sizing: border-box;
            overflow: hidden;
            position: relative;

            .thumb-header {
                height: 6px;
                background: #94a3b8;
                border-radius: 1px;
                width: 75%;
                margin: 0 auto 4px auto;
            }

            .thumb-line {
                height: 3px;
                background: #e2e8f0;
                border-radius: 1px;
                width: 100%;

                &.dark { background: #cbd5e1; }
                &.short { width: 55%; }
            }

            .thumb-table-header {
                height: 4px;
                background: #64748b;
                border-radius: 1px;
                width: 100%;
                margin-top: 4px;
            }
        }

        &.active .thumb-preview {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        .thumb-num {
            font-size: 0.75rem;
            color: #cbd5e1;
            font-weight: 600;
        }
    }
`;

const WorkspaceScrollArea = styled.div`
    flex: 1;
    overflow-y: auto;
    overflow-x: auto;
    padding: 30px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    scroll-behavior: smooth;
`;

const A4PageSheet = styled.div`
    background: #ffffff;
    color: #000000;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 12px 32px -4px rgba(0, 0, 0, 0.45);
    border-radius: 2px;
    box-sizing: border-box;
    width: 100%;
    max-width: 1122px; /* Standard A4 Landscape */
    min-height: 794px;  /* Standard A4 Landscape height */
    padding: 36px 44px 40px 44px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    transition: transform 0.15s ease-out;

    @media print {
        box-shadow: none !important;
        border-radius: 0 !important;
        margin: 0 !important;
        padding: 15mm 20mm !important;
        page-break-after: always !important;
        break-after: page !important;
        max-width: 100% !important;
        min-height: auto !important;

        .no-print,
        .in-report-filters {
            display: none !important;
        }
    }

    .page-header-block {
        margin-bottom: 12px;
        text-align: center;

        .hosp-name {
            font-size: 1.25rem;
            font-weight: 800;
            color: #000;
            text-transform: uppercase;
            letter-spacing: 0.02em;
            margin: 0 0 3px 0;
        }
        .report-subtitle {
            font-size: 0.95rem;
            font-weight: 700;
            color: #111;
            margin: 0 0 2px 0;
        }
        .printed-date {
            font-size: 0.8rem;
            color: #444;
        }
    }

    .page-body-content {
        flex: 1;

        /* Make in-report filters compact and styled cleanly */
        .in-report-filters,
        .filter-section,
        div[class*="FilterSection"],
        div[class*="ControlsBar"],
        div[class*="TabBar"] {
            margin-bottom: 14px;
            padding: 8px 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
        }

        /* High-Definition Formal Document Print Table Template */
        table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
            font-size: 9.5px !important;
            color: #000 !important;
            margin-top: 6px !important;
            border: none !important;
        }

        thead tr,
        table thead tr {
            border-top: 1.5px solid #000 !important;
            border-bottom: 1.5px solid #000 !important;
            background: transparent !important;
        }

        th {
            background: transparent !important;
            color: #000 !important;
            font-weight: 700 !important;
            font-size: 9.5px !important;
            text-transform: uppercase !important;
            padding: 6px 5px !important;
            border: none !important;
            border-bottom: 1.5px solid #000 !important;
            border-top: 1.5px solid #000 !important;
            letter-spacing: 0.02em !important;
            white-space: nowrap !important;
        }

        td {
            color: #000 !important;
            font-size: 9.5px !important;
            padding: 4px 5px !important;
            border: none !important;
            border-bottom: 0.5px solid #e2e8f0 !important;
        }

        tbody tr:hover {
            background: #f8fafc !important;
        }

        /* Group Headers */
        tbody tr[class*="DateGroup"] td,
        tbody tr[class*="date-group"] td {
            background: transparent !important;
            font-weight: 700 !important;
            font-size: 10px !important;
            padding: 6px 4px 2px 4px !important;
            color: #000 !important;
            border: none !important;
        }

        /* Subtotal Rows */
        tbody tr[class*="Subtotal"] td,
        tbody tr[class*="subtotal"] td {
            font-weight: 700 !important;
            color: #000 !important;
            border-top: 1px solid #cbd5e1 !important;
            border-bottom: 1px solid #94a3b8 !important;
            background: transparent !important;
        }

        /* Grand Total Rows */
        tfoot tr,
        table tfoot tr,
        tbody tr[class*="GrandTotal"] {
            border-top: 1.5px solid #000 !important;
            border-bottom: 2.5px double #000 !important;
            background: transparent !important;
            font-weight: bold !important;
        }

        tfoot td,
        tbody tr[class*="GrandTotal"] td {
            font-weight: 800 !important;
            color: #000 !important;
            border: none !important;
            border-top: 1.5px solid #000 !important;
            border-bottom: 2.5px double #000 !important;
            padding: 6px 5px !important;
        }
    }

    .page-footer-block {
        margin-top: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #e2e8f0;
        padding-top: 8px;
        font-size: 0.78rem;
        color: #475569;
        font-weight: 500;

        .footer-left {
            font-size: 0.75rem;
            color: #64748b;
        }

        .footer-right {
            display: flex;
            align-items: center;
            gap: 16px;
            font-weight: 600;

            .contd-label {
                font-style: italic;
                color: #0f172a;
            }
        }
    }
`;

// ─── A4 MULTI-PAGE VIEWER COMPONENT ──────────────────────────────────────────

const A4MultiPageViewer = ({
    selectedReport,
    dateRange,
    setDateRange,
    billType,
    setBillType,
    outlets = [],
    selectedOutlet,
    setSelectedOutlet,
    isMaximized,
    setIsMaximized,
    onClose,
    children
}) => {
    const [zoom, setZoom] = useState(100);
    const [showThumbnails, setShowThumbnails] = useState(true);
    const [showFilterBar, setShowFilterBar] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [reportDocId, setReportDocId] = useState("");
    const [searchFilter, setSearchFilter] = useState("");

    const [tempFromDate, setTempFromDate] = useState(dateRange?.[0] || dayjs().startOf('month'));
    const [tempToDate, setTempToDate] = useState(dateRange?.[1] || dayjs());
    const [tempOutlet, setTempOutlet] = useState(selectedOutlet || "all");
    const [tempBillType, setTempBillType] = useState(billType || "All");

    const scrollAreaRef = useRef(null);
    const rawContainerRef = useRef(null);
    const [pagesData, setPagesData] = useState([]);

    useEffect(() => {
        const randomId = Math.random().toString(36).substring(2, 10) + '-' + 
                         Math.random().toString(36).substring(2, 6) + '-' + 
                         Math.random().toString(36).substring(2, 6) + '-' + 
                         Math.random().toString(36).substring(2, 14);
        setReportDocId(randomId);
    }, []);

    useEffect(() => {
        if (dateRange?.[0]) setTempFromDate(dateRange[0]);
        if (dateRange?.[1]) setTempToDate(dateRange[1]);
        if (selectedOutlet) setTempOutlet(selectedOutlet);
        if (billType) setTempBillType(billType);
    }, [dateRange, selectedOutlet, billType]);

    // ─── DYNAMIC PAGINATION ENGINE ───────────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!rawContainerRef.current) return;
            const tableElem = rawContainerRef.current.querySelector("table");
            if (!tableElem) {
                setTotalPages(1);
                setPagesData([1]);
                return;
            }

            const rows = Array.from(tableElem.querySelectorAll("tbody tr"));
            if (rows.length === 0) {
                setTotalPages(1);
                setPagesData([1]);
                return;
            }

            const rowsPerPage = 16;
            const pageCount = Math.max(1, Math.ceil(rows.length / rowsPerPage));
            setTotalPages(pageCount);

            const chunks = [];
            for (let i = 0; i < pageCount; i++) {
                chunks.push({
                    pageIndex: i + 1,
                    startRow: i * rowsPerPage,
                    endRow: Math.min((i + 1) * rowsPerPage, rows.length)
                });
            }
            setPagesData(chunks);
        }, 300);

        return () => clearTimeout(timer);
    }, [children]);

    // ─── CLIENT-SIDE INSTANT SEARCH HIGHLIGHTING/FILTER ───────────────────────
    useEffect(() => {
        if (!rawContainerRef.current) return;
        const rows = rawContainerRef.current.querySelectorAll("tbody tr");
        if (!rows.length) return;

        const q = searchFilter.trim().toLowerCase();
        rows.forEach(row => {
            if (!q) {
                row.style.display = "";
            } else {
                const text = (row.textContent || "").toLowerCase();
                row.style.display = text.includes(q) ? "" : "none";
            }
        });
    }, [searchFilter]);

    // ─── SCROLL OBSERVER ─────────────────────────────────────────────────────
    const handleScroll = () => {
        if (!scrollAreaRef.current) return;
        const pageSheets = scrollAreaRef.current.querySelectorAll(".a4-page-sheet");
        if (!pageSheets.length) return;

        const scrollTop = scrollAreaRef.current.scrollTop + 100;
        pageSheets.forEach((sheet, idx) => {
            const top = sheet.offsetTop;
            const height = sheet.offsetHeight;
            if (scrollTop >= top && scrollTop < top + height) {
                setCurrentPage(idx + 1);
            }
        });
    };

    const scrollToPage = (pageNum) => {
        const target = document.getElementById(`pdf-page-${pageNum}`);
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            setCurrentPage(pageNum);
        }
    };

    // ─── APPLY IN-VIEWER FILTERS ─────────────────────────────────────────────
    const handleApplyFilters = () => {
        if (setDateRange) {
            setDateRange([tempFromDate, tempToDate]);
        }
        if (setSelectedOutlet) {
            setSelectedOutlet(tempOutlet);
        }
        if (setBillType) {
            setBillType(tempBillType);
        }
    };

    // ─── EXPORT ACTIONS ──────────────────────────────────────────────────────
    const handleExportExcel = () => {
        const sourceElem = document.querySelector("#modal-printable-report-area table") || rawContainerRef.current?.querySelector("table");
        if (sourceElem) {
            import("xlsx").then((XLSX) => {
                const clone = sourceElem.cloneNode(true);
                clone.querySelectorAll(".no-print, button, input, select, .in-report-filters").forEach(el => el.remove());
                const wb = XLSX.utils.table_to_book(clone, { sheet: "Report" });
                const fromStr = dateRange[0]?.format ? dateRange[0].format('DD-MM-YYYY') : 'start';
                const toStr = dateRange[1]?.format ? dateRange[1].format('DD-MM-YYYY') : 'end';
                XLSX.writeFile(wb, `${(selectedReport?.title || 'Report').replace(/[^a-zA-Z0-9]/g, '_')}_${fromStr}_to_${toStr}.xlsx`);
            });
        }
    };

    const handleExportWord = () => {
        const elem = document.getElementById("modal-printable-report-area") || rawContainerRef.current;
        if (elem) {
            const clone = elem.cloneNode(true);
            clone.querySelectorAll(".no-print, button, input, select, .in-report-filters").forEach(el => el.remove());
            const html = clone.innerHTML;
            const content = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <meta charset='utf-8'>
                    <title>${selectedReport?.title || 'Report'}</title>
                    <style>
                        @page { size: landscape; margin: 1cm; }
                        body { font-family: Calibri, Arial, sans-serif; font-size: 9pt; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th, td { border: 1px solid #999; padding: 4px 6px; font-size: 8.5pt; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        h1, h2, h3 { text-align: center; margin: 2px; }
                    </style>
                </head>
                <body>
                    ${html}
                </body>
                </html>
            `;
            const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const fromStr = dateRange[0]?.format ? dateRange[0].format('DD-MM-YYYY') : 'start';
            const toStr = dateRange[1]?.format ? dateRange[1].format('DD-MM-YYYY') : 'end';
            a.download = `${(selectedReport?.title || 'Report').replace(/[^a-zA-Z0-9]/g, '_')}_${fromStr}_to_${toStr}.doc`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handlePrint = () => {
        printAccountsReport("modal-printable-report-area", "landscape");
    };

    const hospitalName = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
    const isNoOutletReport = ["ip_advance", "discharge_detailed", "advance_reg", "insurance_advance"].includes(selectedReport?.id);
    const isCategoryReport = ["bill_wise", "credit_card", "cash_bills", "discount_bills", "sales_tax_reg", "daywise_sales_tax", "collection_summary", "bill_cancel", "discharge_bills", "misc_payment"].includes(selectedReport?.id);

    return (
        <ModalContainer $isMaximized={isMaximized}>
            {/* Top Bar Header */}
            <ModalTopHeader>
                <div className="title-left">
                    <span className="print-badge">Print</span>
                    <span className="report-name">{selectedReport?.title}</span>
                </div>
                <div className="actions-right">
                    <button className="action-btn excel" title="Export to Excel" onClick={handleExportExcel}>
                        X
                    </button>
                    <button className="action-btn word" title="Export to Word" onClick={handleExportWord}>
                        W
                    </button>
                    <button 
                        className={`action-btn ${showFilterBar ? 'active' : ''}`} 
                        title="Toggle In-Viewer Filters" 
                        onClick={() => setShowFilterBar(prev => !prev)}
                    >
                        <Filter size={13} /> Filters
                    </button>
                    <button className="action-btn" title={isMaximized ? "Restore Size" : "Maximize"} onClick={() => setIsMaximized(!isMaximized)}>
                        {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                    </button>
                    <button className="action-btn close" title="Close" onClick={onClose}>
                        <X size={14} />
                    </button>
                </div>
            </ModalTopHeader>

            {/* iPDF Chrome-style Viewer Toolbar */}
            <ViewerToolbar $isFilterOpen={showFilterBar}>
                <div className="toolbar-left">
                    <Menu 
                        size={17} 
                        className="sidebar-toggle" 
                        onClick={() => setShowThumbnails(!showThumbnails)} 
                        title="Toggle Page Thumbnails" 
                    />
                    <span className="doc-uuid">{reportDocId}</span>
                </div>

                <div className="toolbar-center">
                    <span className="page-counter">
                        {currentPage} / {totalPages}
                    </span>

                    <div className="zoom-group">
                        <button onClick={() => setZoom(z => Math.max(z - 10, 50))} title="Zoom Out">-</button>
                        <span className="zoom-val">{zoom}%</span>
                        <button onClick={() => setZoom(z => Math.min(z + 10, 160))} title="Zoom In">+</button>
                    </div>

                    <button className="tool-btn" title="Reset Zoom" onClick={() => setZoom(100)}>
                        <RotateCw size={13} />
                    </button>
                </div>

                <div className="toolbar-right">
                    <button 
                        className="filter-toggle-btn"
                        onClick={() => setShowFilterBar(prev => !prev)}
                        title="Show/Hide Report Filters"
                    >
                        <Filter size={13} />
                        <span>Filter Bar</span>
                        {showFilterBar ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    <button className="tool-btn" title="Download Excel Sheet" onClick={handleExportExcel}>
                        <Download size={15} />
                    </button>
                    <button className="tool-btn" title="Print Document (A4)" onClick={handlePrint}>
                        <Printer size={15} />
                    </button>
                </div>
            </ViewerToolbar>

            {/* In-Viewer Quick Filter Bar */}
            {showFilterBar && (
                <InViewerFilterBar>
                    <div className="filter-item">
                        <span className="filter-label">From:</span>
                        <DatePicker 
                            value={tempFromDate}
                            onChange={(d) => d && setTempFromDate(d)}
                            format="DD/MM/YYYY"
                            allowClear={false}
                        />
                    </div>

                    <div className="filter-item">
                        <span className="filter-label">To:</span>
                        <DatePicker 
                            value={tempToDate}
                            onChange={(d) => d && setTempToDate(d)}
                            format="DD/MM/YYYY"
                            allowClear={false}
                        />
                    </div>

                    {!isNoOutletReport && outlets && outlets.length > 0 && (
                        <div className="filter-item">
                            <span className="filter-label">Outlet:</span>
                            <select 
                                value={tempOutlet} 
                                onChange={(e) => setTempOutlet(e.target.value)}
                            >
                                <option value="all">All Outlets</option>
                                {outlets.map((o) => (
                                    <option key={o.outlet_code || o.outlet_id || o.id} value={o.outlet_code || o.outlet_id}>
                                        {o.outlet_name || o.name} ({o.outlet_code || o.outlet_id})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {isCategoryReport && (
                        <div className="filter-item">
                            <span className="filter-label">
                                {selectedReport?.id === "sales_tax_reg" || selectedReport?.id === "daywise_sales_tax" ? "Patient:" :
                                 selectedReport?.id === "discharge_bills" ? "Mode:" :
                                 selectedReport?.id === "misc_payment" ? "Receipt:" :
                                 "Category:"}
                            </span>
                            <select 
                                value={tempBillType} 
                                onChange={(e) => setTempBillType(e.target.value)}
                            >
                                {selectedReport?.id === "sales_tax_reg" || selectedReport?.id === "daywise_sales_tax" ? (
                                    <>
                                        <option value="all">All Patients (OP & IP)</option>
                                        <option value="op">Out-Patient (OP)</option>
                                        <option value="ip">In-Patient (IP)</option>
                                    </>
                                ) : selectedReport?.id === "bill_cancel" ? (
                                    <>
                                        <option value="all">All Cancelled Bills</option>
                                        <option value="discharge">Discharge Bills</option>
                                        <option value="advance">IP Advance</option>
                                        <option value="admission">IP Admission</option>
                                    </>
                                ) : selectedReport?.id === "discharge_bills" ? (
                                    <>
                                        <option value="all">All Payment Modes</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Card">Card</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Multiple Payment">Multiple Payment</option>
                                    </>
                                ) : selectedReport?.id === "misc_payment" ? (
                                    <>
                                        <option value="all">All Receipt Types</option>
                                        <option value="cash">Cash Receipts</option>
                                        <option value="bank">Bank / Online Receipts</option>
                                    </>
                                ) : selectedReport?.id === "discount_bills" ? (
                                    <>
                                        <option value="All">All Categories</option>
                                        <option value="PHARMACY OP BILL (SH)">Pharmacy OP Bill (SH)</option>
                                        <option value="PHARMACY IP BILL (SH)">Pharmacy IP Bill (SH)</option>
                                        <option value="DISCHARGE BILL">Discharge Bill</option>
                                        <option value="LAB BILL (SH)">Lab Bill (SH)</option>
                                        <option value="CT SCAN (SH)">CT Scan (SH)</option>
                                        <option value="SCANNING (SH)">Scanning (SH)</option>
                                        <option value="X - RAY (SH)">X-Ray (SH)</option>
                                        <option value="ECG (SH)">ECG (SH)</option>
                                        <option value="PET_CT(SH)">PET CT (SH)</option>
                                        <option value="PROCEDURE BILL (SH)">Procedure Bill (SH)</option>
                                    </>
                                ) : (selectedReport?.id === "credit_card" || selectedReport?.id === "cash_bills") ? (
                                    <>
                                        <option value="All">All Categories (All Bill Types)</option>
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
                                    </>
                                ) : (
                                    <>
                                        <option value="All">All Types</option>
                                        <option value="Registration">Registration</option>
                                        <option value="Investigation">Investigation</option>
                                        <option value="Pharmacy">Pharmacy</option>
                                        <option value="Discharge">Discharge</option>
                                        <option value="IP Advance">IP Advance</option>
                                        <option value="Admission">Admission</option>
                                        <option value="Sales Return">Sales Return</option>
                                        <option value="Miscellaneous">Miscellaneous Payment</option>
                                    </>
                                )}
                            </select>
                        </div>
                    )}

                    <div className="filter-item">
                        <div className="search-input-wrapper">
                            <Search size={14} />
                            <input 
                                type="text" 
                                placeholder="Quick search table..."
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    <button className="apply-btn" onClick={handleApplyFilters} title="Fetch data with selected filters">
                        <RefreshCw size={13} /> Apply
                    </button>
                </InViewerFilterBar>
            )}

            {/* Viewer Workspace with Thumbnails Sidebar & A4 Page Sheets */}
            <ViewerBody>
                {/* Left Thumbnail Sidebar */}
                {showThumbnails && (
                    <ThumbnailsSidebar>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <div 
                                key={i} 
                                className={`thumbnail-card ${currentPage === i + 1 ? "active" : ""}`}
                                onClick={() => scrollToPage(i + 1)}
                            >
                                <div className="thumb-preview">
                                    <div className="thumb-header" />
                                    <div className="thumb-table-header" />
                                    <div className="thumb-line dark" />
                                    <div className="thumb-line" />
                                    <div className="thumb-line short" />
                                    <div className="thumb-line" />
                                    <div className="thumb-line" />
                                </div>
                                <span className="thumb-num">{i + 1}</span>
                            </div>
                        ))}
                    </ThumbnailsSidebar>
                )}

                {/* Main A4 Document Workspace */}
                <WorkspaceScrollArea ref={scrollAreaRef} onScroll={handleScroll}>
                    {/* Printable Root Container */}
                    <div 
                        id="modal-printable-report-area"
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "28px",
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: "top center"
                        }}
                    >
                        {/* Primary A4 Sheet */}
                        <A4PageSheet id="pdf-page-1" className="a4-page-sheet">
                            {/* Page 1 Header */}
                            <div className="page-header-block">
                                <h2 className="hosp-name">{hospitalName}</h2>
                                <h3 className="report-subtitle">
                                    {selectedReport?.title} From {dateRange[0]?.format("DD/MM/YYYY")} To {dateRange[1]?.format("DD/MM/YYYY")}
                                </h3>
                                <div className="printed-date">
                                    Printed As On {new Date().toLocaleDateString("en-GB")} {new Date().toLocaleTimeString()}
                                </div>
                            </div>

                            {/* Rendered Report Content */}
                            <div className="page-body-content" ref={rawContainerRef}>
                                {children}
                            </div>

                            {/* Page 1 Footer */}
                            <div className="page-footer-block">
                                <div className="footer-left">Shanmuga Hospital Accounts System</div>
                                <div className="footer-right">
                                    {totalPages > 1 && <span className="contd-label">Contd..</span>}
                                    <span className="page-num">1</span>
                                </div>
                            </div>
                        </A4PageSheet>
                    </div>
                </WorkspaceScrollArea>
            </ViewerBody>
        </ModalContainer>
    );
};

export default A4MultiPageViewer;
