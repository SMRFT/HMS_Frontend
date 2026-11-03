import dayjs from "dayjs";
import { getSelectedStoreDepartment } from "./storesDepartmentHelper";

/**
 * Helper to format date into DD/MM/YYYY
 */
const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    if (typeof dateStr === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr.trim())) {
        return dateStr.trim();
    }
    const parsed = dayjs(dateStr);
    return parsed.isValid() ? parsed.format("DD/MM/YYYY") : String(dateStr);
};

/**
 * Helper to format numbers into 2 decimal places matching hospital ledger style (e.g. 920.00, 35315.00)
 */
const formatAmount = (val) => {
    const num = Number(val);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Detect if a table header or cell represents a numerical/currency/quantity value
 */
const isNumericalHeader = (text) => {
    const t = (text || "").toLowerCase().trim();
    return (
        t.includes("amt") ||
        t.includes("amount") ||
        t.includes("price") ||
        t.includes("rate") ||
        t.includes("cost") ||
        t.includes("total") ||
        t.includes("paid") ||
        t.includes("pending") ||
        t.includes("balance") ||
        t.includes("qty") ||
        t.includes("quantity") ||
        t.includes("stock") ||
        t.includes("discount") ||
        t.includes("tax") ||
        t.includes("mrp") ||
        t.includes("value") ||
        t.includes("%") ||
        t.includes("grn count") ||
        t.includes("items recd") ||
        t.includes("units")
    );
};

/**
 * CSS stylesheet that replicates the exact print format of "monthly supplier report.pdf":
 * - Outer 1.5px solid #000 frame border
 * - Centered hospital title & subtitle
 * - Clean ruled ledger table with NO vertical borders
 * - 1.5px solid #000 top and bottom lines on table headers (clean white background)
 * - Category bar with 1.5px solid #000 bottom line
 * - Maroon (#800000) section headers and grand total (Net Amount)
 * - 1px solid #000 top and bottom lines on Subtotals
 * - Bottom right page numbering
 */
const getCommonPdfStyle = (orientation = "portrait") => `
    @page {
        size: ${orientation};
        margin: 6mm 8mm 8mm 8mm;
        @bottom-right {
            content: counter(page);
            font-family: Arial, Helvetica, sans-serif;
            font-size: 8pt;
            font-weight: normal;
            padding-right: 2mm;
        }
    }
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    body {
        font-family: Arial, Helvetica, "Segoe UI", sans-serif;
        font-size: 8.8pt;
        color: #000000;
        background: #ffffff;
        margin: 0;
        padding: 0;
    }

    /* Continuous outer framing border across every printed page */
    .page-frame-border {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 1.5px solid #000000;
        pointer-events: none;
        z-index: 9999;
    }

    .document-wrapper {
        width: 100%;
        padding: 10px 12px 14px 12px;
    }

    /* Top Centered Header */
    .report-header {
        text-align: center;
        padding-bottom: 6px;
        margin-bottom: 0;
    }
    .hospital-name {
        font-size: 11pt;
        font-weight: bold;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: #000000;
        margin-bottom: 3px;
    }
    .report-subtitle {
        font-size: 9.5pt;
        font-weight: bold;
        color: #000000;
        line-height: 1.3;
    }

    /* Main Ledger Table (NO vertical grid lines, matching PDF) */
    table, table.ledger-table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-size: 8.6pt !important;
        margin-top: 6px !important;
        border: none !important;
    }

    thead {
        display: table-header-group;
    }

    tbody {
        display: table-row-group;
    }

    tr {
        page-break-inside: avoid;
    }

    /* Table Column Headers: solid top/bottom lines, pure white, no vertical borders */
    th, thead tr th, tr.col-headers th {
        border-top: 1.5px solid #000000 !important;
        border-bottom: 1.5px solid #000000 !important;
        border-left: none !important;
        border-right: none !important;
        padding: 4px 6px !important;
        font-weight: bold !important;
        color: #000000 !important;
        text-align: left;
        font-size: 8.8pt !important;
        background: #ffffff !important;
    }

    /* Category Bar */
    .category-bar, tr.category-row td {
        border-bottom: 1.5px solid #000000 !important;
        border-left: none !important;
        border-right: none !important;
        padding: 4px 6px !important;
        font-weight: bold !important;
        text-transform: uppercase !important;
        color: #000000 !important;
        font-size: 8.8pt !important;
    }

    /* Section / Group Row in Maroon */
    .section-title, tr.supplier-row td.supplier-title, tr.section-header-row td {
        color: #800000 !important;
        font-weight: bold !important;
        font-size: 8.8pt !important;
        text-transform: uppercase !important;
        padding: 5px 6px 4px 6px !important;
        border-top: none !important;
        border-bottom: 1px solid #000000 !important;
        border-left: none !important;
        border-right: none !important;
        background: #ffffff !important;
    }

    /* Data Cells: no vertical borders, clean padding */
    td, tbody tr td, tr.item-row td {
        border-top: none !important;
        border-bottom: none !important;
        border-left: none !important;
        border-right: none !important;
        padding: 3.5px 6px !important;
        font-size: 8.5pt !important;
        color: #000000 !important;
        vertical-align: middle;
        background: transparent !important;
    }

    /* Subtotal Row: 1px black border top and bottom */
    tr.subtotal-row td, .subtotal-cell {
        padding: 3.5px 6px 4px 6px !important;
        font-size: 8.8pt !important;
        border-top: 1px solid #000000 !important;
        border-bottom: 1px solid #000000 !important;
        border-left: none !important;
        border-right: none !important;
        color: #000000 !important;
        font-weight: bold !important;
    }

    /* Net Grand Total / Overall Total Row: Hidden as requested */
    tr.net-amount-row, .grand-total-cell, .overall-total, tfoot {
        display: none !important;
    }

    /* Alignments */
    .text-right {
        text-align: right !important;
    }
    .text-center {
        text-align: center !important;
    }
    .text-left {
        text-align: left !important;
    }

    /* Remove web badges / shadows / icons / buttons */
    button, input, select, form, svg, .no-print, [class*='Pagination'], [class*='ControlsContainer'], nav {
        display: none !important;
    }
`;

/**
 * Generate authentic HTML matching "monthly supplier report.pdf" directly from structured supplier data.
 */
export const generateSupplierPurchaseHTML = (reportData, options = {}) => {
    const hospitalName = options.hospitalName || localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
    const fromDateStr = formatDate(options.fromDate || dayjs().startOf('month').format('YYYY-MM-DD'));
    const toDateStr = formatDate(options.toDate || dayjs().format('YYYY-MM-DD'));
    const departmentName = (options.department || getSelectedStoreDepartment() || "GENERAL PURCHASE").toUpperCase();

    const suppliers = Array.isArray(reportData) ? reportData : [];
    
    // Calculate Grand Total
    let calculatedGrandTotal = 0;
    if (options.summary && typeof options.summary.grand_total_amount === 'number') {
        calculatedGrandTotal = options.summary.grand_total_amount;
    } else {
        suppliers.forEach(s => {
            calculatedGrandTotal += Number(s.total_amount || 0);
        });
    }

    // Build supplier table rows
    let rowsHtml = '';
    suppliers.forEach((s) => {
        const vendorName = (s.vendor_name || 'UNKNOWN SUPPLIER').toUpperCase();
        const grns = Array.isArray(s.grns) && s.grns.length > 0 ? s.grns : [
            {
                grn_number: s.last_grn_number || '-',
                invoice_no: s.invoice_no || '-',
                invoice_date: s.last_purchase_date || s.date || '',
                total_amount: s.total_amount || 0
            }
        ];

        // Supplier Header Row in Maroon
        rowsHtml += `
            <tr class="supplier-row">
                <td colspan="5" class="supplier-title">${vendorName}</td>
            </tr>
        `;

        // Item Rows
        grns.forEach((g, gIdx) => {
            const purchaseNo = g.grn_number || g.purchase_number || g.po_number || '-';
            const invoiceNo = g.invoice_no || g.bill_no || '-';
            const invoiceDate = formatDate(g.invoice_date || g.date || g.created_at);
            const billAmount = formatAmount(g.total_amount);

            rowsHtml += `
                <tr class="item-row">
                    <td style="width: 45px;">${gIdx + 1}</td>
                    <td style="width: 155px;">${purchaseNo}</td>
                    <td style="width: 175px;">${invoiceNo}</td>
                    <td style="width: 110px;">${invoiceDate}</td>
                    <td style="width: 110px;" class="text-right">${billAmount}</td>
                </tr>
            `;
        });

        // Supplier Total Row
        const supplierTotal = formatAmount(s.total_amount);
        rowsHtml += `
            <tr class="subtotal-row">
                <td colspan="3"></td>
                <td class="text-right total-label"><strong>Total</strong></td>
                <td class="text-right total-val"><strong>${supplierTotal}</strong></td>
            </tr>
        `;
    });

    const netAmountFormatted = formatAmount(calculatedGrandTotal);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>${hospitalName} - Supplier Wise Purchase</title>
    <style>
        ${getCommonPdfStyle("portrait")}
    </style>
</head>
<body>
    <div class="page-frame-border"></div>

    <div class="document-wrapper">
        <div class="report-header">
            <div class="hospital-name">${hospitalName}</div>
            <div class="report-subtitle">Supplier Wise Purchase From ${fromDateStr} to ${toDateStr}</div>
        </div>

        <table class="ledger-table">
            <thead>
                <tr class="col-headers">
                    <th style="width: 45px;">Sl No.</th>
                    <th style="width: 155px;">Purchase Number</th>
                    <th style="width: 175px;">Invoice Number</th>
                    <th style="width: 110px;">Invoice Date</th>
                    <th style="width: 110px;" class="text-right">Bill Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr class="category-row">
                    <td colspan="5" class="category-bar">${departmentName}</td>
                </tr>
                ${rowsHtml}
            </tbody>
        </table>
    </div>
</body>
</html>
    `;
};

/**
 * Universal Store Report HTML Formatter:
 * Converts ANY generic stores report table into the exact layout of "monthly supplier report.pdf":
 * - Outer continuous framing border (1.5px solid #000)
 * - Centered hospital title & date range subtitle
 * - Clean ruled ledger table with NO vertical borders
 * - Top and bottom black border on column headers (pure white background)
 * - Category bar with bottom border
 * - Right-aligned numbers, currencies, and quantities
 * - Subtotals with 1px top/bottom border
 * - Net Amount / Grand Total in Maroon (#800000)
 * - Action buttons and interactive web elements completely stripped.
 */
export const generateFramedGeneralReportHTML = (clonedElement, options = {}) => {
    const hospitalName = options.hospitalName || localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
    const reportTitle = (options.reportTitle || "STORES & INVENTORY REPORT").toUpperCase();
    const departmentName = (options.department || getSelectedStoreDepartment() || "GENERAL STORE").toUpperCase();

    // 1. Detect date range from DOM inputs before stripping
    let fromDateStr = options.fromDate ? formatDate(options.fromDate) : null;
    let toDateStr = options.toDate ? formatDate(options.toDate) : null;

    if (!fromDateStr || !toDateStr) {
        const dateInputs = clonedElement.querySelectorAll("input[type='date'], .ant-picker-input input");
        if (dateInputs.length >= 2) {
            if (!fromDateStr && dateInputs[0].value) fromDateStr = formatDate(dateInputs[0].value);
            if (!toDateStr && dateInputs[1].value) toDateStr = formatDate(dateInputs[1].value);
        }
    }

    const subtitleDateRange = (fromDateStr && toDateStr)
        ? `From ${fromDateStr} to ${toDateStr}`
        : (fromDateStr ? `As On ${fromDateStr}` : `As On ${dayjs().format('DD/MM/YYYY')}`);

    // 2. Remove all interactive web elements, search boxes, forms, buttons, pagination, and overall summary cards
    const elementsToRemove = clonedElement.querySelectorAll(
        "button, input, select, .no-print, [class*='Pagination'], [class*='ControlsContainer'], form, svg, [title*='Search'], nav, .ant-picker, [class*='ModalHeader'], [class*='CloseButton'], [class*='StatsGrid'], [class*='KpiGrid'], [class*='summary'], [class*='Summary'], .summary-card, .metric-box"
    );
    elementsToRemove.forEach(el => el.remove());

    // 3. Process tables to match monthly supplier report layout
    const tables = clonedElement.querySelectorAll("table");
    let totalCols = 0;

    tables.forEach((table) => {
        table.classList.add("ledger-table");
        table.removeAttribute("style");

        // Identify action columns to remove
        const headers = Array.from(table.querySelectorAll("th"));
        totalCols = Math.max(totalCols, headers.length);
        const actionColIndices = [];

        headers.forEach((th, idx) => {
            const txt = (th.textContent || "").trim().toLowerCase();
            if (txt === "action" || txt === "actions" || txt === "operation" || txt === "print" || txt === "export" || txt === "") {
                // If it's an action or empty icon column
                actionColIndices.push(idx);
            } else if (idx === 0 && (txt === "#" || txt.includes("sl") || txt.includes("s.no"))) {
                th.style.width = "45px";
                th.classList.add("text-left");
            } else if (isNumericalHeader(txt)) {
                th.classList.add("text-right");
            }
        });

        // Remove action columns in descending order
        actionColIndices.reverse().forEach((colIdx) => {
            headers[colIdx]?.remove();
            table.querySelectorAll("tbody tr").forEach((tr) => {
                const cells = Array.from(tr.children);
                if (cells[colIdx]) cells[colIdx].remove();
            });
            table.querySelectorAll("tfoot tr").forEach((tr) => {
                const cells = Array.from(tr.children);
                if (cells[colIdx]) cells[colIdx].remove();
            });
        });

        const finalHeaders = Array.from(table.querySelectorAll("th"));

        // Align numbers, format subtotal rows, and remove overall totals
        table.querySelectorAll("tbody tr").forEach((tr) => {
            tr.removeAttribute("style");
            const cells = Array.from(tr.children);
            const rowText = (tr.textContent || "").toLowerCase().trim();

            // Overall totals: remove as requested
            if (
                rowText.includes("grand total") ||
                rowText.includes("net amount") ||
                rowText.includes("overall total") ||
                rowText.includes("summary total") ||
                rowText.startsWith("overall")
            ) {
                tr.remove();
                return;
            }

            if (rowText.includes("subtotal") || rowText.includes("sub total") || rowText.startsWith("total")) {
                tr.classList.add("subtotal-row");
            } else if (cells.length === 1 && cells[0].colSpan > 1) {
                // Section header row
                tr.classList.add("section-header-row");
            }

            cells.forEach((td, cellIdx) => {
                td.removeAttribute("style");
                const cellText = (td.textContent || "").trim();

                // If first column is serial number, keep left-aligned
                if (cellIdx === 0 && (finalHeaders[0]?.textContent || "").toLowerCase().match(/(#|sl|s\.no)/)) {
                    td.classList.add("text-left");
                    td.style.width = "45px";
                    return;
                }

                // Check if matching header was numerical or if content starts with currency / number
                const correspondingTh = finalHeaders[cellIdx];
                if (correspondingTh && correspondingTh.classList.contains("text-right")) {
                    td.classList.add("text-right");
                } else if (/^[₹$]?\s*[\d,]+(\.\d+)?%?$/.test(cellText)) {
                    td.classList.add("text-right");
                }
            });
        });

        // Clean up subtotal row cells
        table.querySelectorAll("tr.subtotal-row").forEach((tr) => {
            const cells = Array.from(tr.children);
            while (cells.length > 2 && cells[cells.length - 1].textContent.trim() === '') {
                cells.pop().remove();
            }
            if (cells.length === 2 && cells[0].colSpan) {
                cells[0].colSpan = Math.max(1, finalHeaders.length - 1);
                cells[1].classList.add("text-right");
            }
        });

        // Remove tfoot overall totals completely
        table.querySelectorAll("tfoot").forEach((tf) => tf.remove());

        // Insert category bar at top of tbody if not already present
        const tbody = table.querySelector("tbody");
        if (tbody) {
            const firstRow = tbody.querySelector("tr");
            const colCount = table.querySelectorAll("th").length || 6;
            const doc = clonedElement.ownerDocument || document;
            const categoryRow = doc.createElement("tr");
            categoryRow.className = "category-row";
            categoryRow.innerHTML = `<td colspan="${colCount}" class="category-bar">${departmentName}</td>`;
            tbody.insertBefore(categoryRow, firstRow);
        }
    });

    // Auto-choose orientation: landscape for wide reports (> 7 columns), otherwise portrait
    const orientation = options.orientation || (totalCols > 7 ? "landscape" : "portrait");

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>${hospitalName} - ${reportTitle}</title>
    <style>
        ${getCommonPdfStyle(orientation)}
    </style>
</head>
<body>
    <div class="page-frame-border"></div>

    <div class="document-wrapper">
        <div class="report-header">
            <div class="hospital-name">${hospitalName}</div>
            <div class="report-subtitle">${reportTitle} ${subtitleDateRange}</div>
        </div>

        <div class="report-content">
            ${clonedElement.innerHTML}
        </div>
    </div>
</body>
</html>
    `;
};

/**
 * Universal Print Utility for all Stores & Inventory Reports.
 * If structured supplier data is passed or options indicate supplier purchase format,
 * it renders the exact "monthly supplier report.pdf" layout.
 * Otherwise, it formats the general store report into the framed hospital style.
 */
export const printStoresReport = (elementOrData, options = {}) => {
    // 1. Check if structured data is passed or if attached on DOM
    let reportData = null;
    let isSupplierFormat = options.isSupplierPurchaseFormat || options.reportType === 'supplier_purchase';

    if (Array.isArray(elementOrData)) {
        reportData = elementOrData;
        isSupplierFormat = true;
    } else if (typeof elementOrData === 'object' && elementOrData?.data && Array.isArray(elementOrData.data)) {
        reportData = elementOrData.data;
        isSupplierFormat = true;
    }

    // Check if DOM element has attached structured report data
    let targetElem = null;
    if (typeof elementOrData === 'string') {
        targetElem = document.getElementById(elementOrData);
    } else if (elementOrData instanceof HTMLElement) {
        targetElem = elementOrData;
    }

    if (targetElem && targetElem._reportData && Array.isArray(targetElem._reportData)) {
        reportData = targetElem._reportData;
        isSupplierFormat = true;
    }

    // 2. Prepare iframe
    const existingIframe = document.getElementById("stores-print-frame");
    if (existingIframe) {
        existingIframe.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "stores-print-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();

    if (isSupplierFormat && reportData) {
        // Output exact monthly supplier report template
        const html = generateSupplierPurchaseHTML(reportData, options);
        doc.write(html);
    } else {
        // General framed report format matching monthly supplier report style
        let elem = targetElem;
        if (!elem) {
            elem = document.getElementById("stores-modal-report-content") ||
                   document.querySelector(".stores-printable-area") ||
                   document.body;
        }

        const clone = elem.cloneNode(true);
        const html = generateFramedGeneralReportHTML(clone, options);
        doc.write(html);
    }

    doc.close();

    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    }, 250);
};

export default printStoresReport;
