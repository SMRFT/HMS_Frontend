import dayjs from "dayjs";

/**
 * Format date into DD/MM/YYYY
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
 * Format currency or number into Indian numbering with 2 decimals
 */
const formatAmount = (val) => {
    const num = Number(val);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Detect numerical headers to right-align
 */
const isNumericalHeader = (text) => {
    const t = (text || "").toLowerCase().trim();
    return (
        t.includes("amt") ||
        t.includes("amount") ||
        t.includes("bill amount") ||
        t.includes("settled") ||
        t.includes("due") ||
        t.includes("advance") ||
        t.includes("disallowed") ||
        t.includes("tds") ||
        t.includes("paid") ||
        t.includes("balance") ||
        t.includes("qty") ||
        t.includes("quantity") ||
        t.includes("rate") ||
        t.includes("mrp") ||
        t.includes("price") ||
        t.includes("cost") ||
        t.includes("discount") ||
        t.includes("total") ||
        t.includes("net") ||
        t.includes("%")
    );
};

/**
 * Common Print CSS stylesheet matching Shanmuga Hospital official report templates
 */
const getInsurancePdfStyle = (orientation = "landscape") => `
    @page {
        size: ${orientation};
        margin: 6mm 8mm 8mm 8mm;
        @bottom-right {
            content: "Page " counter(page);
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
        font-size: 10pt;
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
        padding: 8px 10px 12px 10px;
    }

    /* Top Centered Header */
    .report-header {
        text-align: center;
        padding-bottom: 8px;
        margin-bottom: 10px;
        border-bottom: 2px solid #000000;
    }
    .hospital-name {
        font-size: 15pt;
        font-weight: 900;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: #000000;
        margin-bottom: 3px;
    }
    .hospital-address {
        font-size: 10pt;
        color: #111111;
        margin-bottom: 4px;
        font-weight: 500;
    }
    .report-title {
        font-size: 13pt;
        font-weight: 900;
        text-transform: uppercase;
        color: #000000;
        letter-spacing: 0.4px;
        margin-bottom: 3px;
    }
    .report-period {
        font-size: 10pt;
        font-weight: 800;
        color: #111111;
    }

    /* Patient Info Metadata Box (for Patient voucher reports) */
    .patient-meta-box {
        width: 100%;
        border: 1.5px solid #000000;
        margin-bottom: 10px;
        padding: 8px 10px;
        font-size: 10pt;
    }
    .patient-meta-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px 14px;
    }
    .patient-meta-item {
        display: flex;
        gap: 6px;
        font-size: 9.5pt;
    }
    .patient-meta-item strong {
        font-weight: 800;
        color: #000000;
        min-width: 85px;
    }

    /* Main Ledger Table (NO vertical grid lines, clean ledger ruled style) */
    table, table.ledger-table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-size: 9.5pt !important;
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

    /* Table Column Headers */
    th, thead tr th, tr.col-headers th {
        border-top: 2px solid #000000 !important;
        border-bottom: 2px solid #000000 !important;
        border-left: none !important;
        border-right: none !important;
        padding: 6px 7px !important;
        font-weight: 800 !important;
        color: #000000 !important;
        text-align: left;
        font-size: 9.5pt !important;
        background: #ffffff !important;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }

    /* Company / Category / Group Bar */
    .company-header, tr.company-header-row td, tr.category-row td, .group-header-row td {
        border-bottom: 1.5px solid #000000 !important;
        border-top: 1.5px solid #000000 !important;
        border-left: none !important;
        border-right: none !important;
        padding: 6px 8px !important;
        font-weight: 800 !important;
        text-transform: uppercase !important;
        color: #000000 !important;
        font-size: 10pt !important;
        background: #f8fafc !important;
    }

    /* Data Cells */
    td, tbody tr td {
        border-top: none !important;
        border-bottom: 1px solid #cbd5e1 !important;
        border-left: none !important;
        border-right: none !important;
        padding: 5px 7px !important;
        font-size: 9.5pt !important;
        color: #000000 !important;
    }

    /* Subtotal & Total Rows */
    tr.subtotal-row td, .subtotal-row td {
        border-top: 1.5px solid #000000 !important;
        border-bottom: 1.5px solid #000000 !important;
        font-weight: 800 !important;
        font-size: 10.5pt !important;
        padding: 6px 7px !important;
        background: #ffffff !important;
    }

    tr.grand-total-row td, .grand-total-row td {
        border-top: 2.5px solid #000000 !important;
        border-bottom: 2.5px solid #000000 !important;
        font-weight: 900 !important;
        font-size: 11pt !important;
        padding: 8px 8px !important;
        background: #f8fafc !important;
    }

    /* ALL Amounts Bold in Print */
    .text-right, td.text-right, th.text-right, td.amount-cell, .amount-cell {
        text-align: right !important;
        font-weight: 800 !important;
        color: #000000 !important;
    }
    .text-left {
        text-align: left !important;
    }
    .text-center {
        text-align: center !important;
    }

    /* Pharmacy IP Bill tax summary box in print */
    .tax-summary-box {
        margin-left: auto !important;
        width: 360px !important;
        max-width: 100% !important;
        display: flex !important;
        justify-content: space-between !important;
        gap: 20px !important;
        margin-top: 5px !important;
        margin-bottom: 8px !important;
        padding: 5px 2px !important;
        border-top: 1.5px solid #000000 !important;
        border-bottom: 1px solid #000000 !important;
        font-size: 8.5pt !important;
        page-break-inside: avoid !important;
    }
    .tax-col-left, .tax-col-right {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 2px !important;
    }
    .tax-row-item {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        line-height: 1.4 !important;
    }
    .tax-label {
        font-size: 8.5pt !important;
        color: #000000 !important;
    }
    .tax-val {
        font-size: 8.5pt !important;
        font-weight: bold !important;
        text-align: right !important;
        min-width: 55px !important;
    }
    .net-amount-row {
        margin-top: 2px !important;
        padding-top: 3px !important;
        border-top: 1px dashed #000000 !important;
    }
    .net-label {
        font-size: 10.5pt !important;
        font-weight: 800 !important;
        color: #000000 !important;
        letter-spacing: 0.3px !important;
    }
    .net-val {
        font-size: 11.5pt !important;
        font-weight: 900 !important;
        color: #000000 !important;
        text-align: right !important;
    }
    .grand-total-bar {
        display: flex !important;
        justify-content: flex-end !important;
        align-items: center !important;
        border-top: 2px solid #000000 !important;
        border-bottom: 2px solid #000000 !important;
        padding: 6px 2px !important;
        margin-top: 10px !important;
        background: transparent !important;
        page-break-inside: avoid !important;
    }
    .grand-total-bar .label {
        margin-right: 20px !important;
        font-size: 10.5pt !important;
        font-weight: 800 !important;
        text-transform: uppercase !important;
        color: #000000 !important;
    }
    .grand-total-bar .amount {
        font-size: 12.5pt !important;
        font-weight: 900 !important;
        text-align: right !important;
        color: #000000 !important;
        min-width: 80px !important;
    }

    /* Metadata pills / chips in print */
    .info-chip, [class*="info-chip"] {
        display: inline-block !important;
        font-size: 7.5pt !important;
        color: #222222 !important;
        margin-right: 8px !important;
    }

    /* Bottom footer */
    .report-footer {
        margin-top: 12px;
        padding-top: 6px;
        border-top: 1px solid #000000;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 7.5pt;
        color: #444444;
    }
`;

/**
 * Universal Print Utility for Insurance Reports
 * Isolates print execution inside a hidden iframe so the main application header,
 * navigation bar, buttons, and sidebars are NEVER printed.
 */
export const printInsuranceReport = (elementOrId, options = {}) => {
    // 1. Locate source element
    let targetElem = null;
    if (typeof elementOrId === "string") {
        targetElem = document.getElementById(elementOrId);
    } else if (elementOrId instanceof HTMLElement) {
        targetElem = elementOrId;
    }

    if (!targetElem) {
        targetElem =
            document.getElementById("printable-report-area") ||
            document.querySelector(".printable-report-container") ||
            document.querySelector("[class*='PrintDocument']") ||
            document.querySelector(".insurance-printable-area");
    }

    if (!targetElem) {
        console.warn("printInsuranceReport: No printable target element found, falling back to window.print()");
        window.print();
        return;
    }

    // 2. Clone the element to safely sanitize without affecting live DOM
    const clone = targetElem.cloneNode(true);

    // 3. Remove all interactive elements (buttons, inputs, select, date pickers, svgs, back buttons, toast)
    const elementsToRemove = clone.querySelectorAll(
        "button, input, select, [class*='ant-picker'], [class*='ControlsBar'], [class*='ControlBar'], [class*='HeaderBar'], [class*='KPIGrid'], [class*='ActionBtn'], .no-print, [class*='back-btn']"
    );
    elementsToRemove.forEach((el) => el.remove());

    // Sanitize any existing signature blocks to strictly use designation only
    const sigNames = clone.querySelectorAll(".sig-name");
    sigNames.forEach((el) => el.remove());
    const sigBlocks = clone.querySelectorAll(".signatures-block");
    sigBlocks.forEach((sb) => {
        sb.innerHTML = `
            <div style="text-align: left; font-size: 10pt; font-weight: bold; color: #000000;">
                <div style="border-top: 1px solid #000000; width: 180px; margin-bottom: 6px;"></div>
                Insurance Executive
            </div>
            <div style="text-align: right; font-size: 10pt; font-weight: bold; color: #000000;">
                <div style="border-top: 1px solid #000000; width: 220px; margin-bottom: 6px; margin-left: auto;"></div>
                General Manager - Insurance
            </div>
        `;
    });

    // 4. Identify options
    const hospitalName =
        options.hospitalName ||
        localStorage.getItem("hospital_name") ||
        "SHANMUGA HOSPITAL LIMITED";
    const hospitalAddress =
        options.hospitalAddress ||
        "51/24.Saradha College Road, Salem - 636007";
    const reportTitle = (
        options.reportTitle ||
        clone.querySelector("h1, h2, .report-title-line")?.textContent ||
        "INSURANCE REPORT"
    )
        .replace(/SHANMUGA HOSPITAL LIMITED/gi, "")
        .replace(/51\/24\.Saradha College Road[^\n]*/gi, "")
        .trim();

    const fromDate = options.fromDate || "";
    const toDate = options.toDate || "";
    const subtitle = options.subtitle || (fromDate && toDate ? `From ${formatDate(fromDate)} To ${formatDate(toDate)}` : "");
    const orientation = options.orientation || "landscape";

    // Extract patient info if available
    const patientInfo = options.patientInfo || null;

    // Remove any existing in-clone hospital header so we don't duplicate
    const existingHeaders = clone.querySelectorAll(
        "[class*='HospitalHeader'], [class*='report-header'], .report-header"
    );
    existingHeaders.forEach((h) => h.remove());

    // Clean up tables in clone
    const tables = clone.querySelectorAll("table");
    tables.forEach((tbl) => {
        tbl.classList.add("ledger-table");
        tbl.removeAttribute("style");

        // Remove empty or action columns
        const ths = Array.from(tbl.querySelectorAll("th"));
        const actionColIndices = [];
        ths.forEach((th, idx) => {
            const txt = (th.textContent || "").trim().toLowerCase();
            if (txt === "action" || txt === "actions" || txt === "print" || txt === "del" || txt === "") {
                actionColIndices.push(idx);
            } else if (isNumericalHeader(txt)) {
                th.classList.add("text-right");
            }
        });

        actionColIndices.reverse().forEach((colIdx) => {
            ths[colIdx]?.remove();
            tbl.querySelectorAll("tr").forEach((tr) => {
                const cells = Array.from(tr.children);
                if (cells[colIdx]) cells[colIdx].remove();
            });
        });

        // Format body cells
        tbl.querySelectorAll("tbody tr").forEach((tr) => {
            const cells = Array.from(tr.children);
            const rowTxt = (tr.textContent || "").trim().toLowerCase();

            if (rowTxt.includes("grand total") || rowTxt.includes("net total")) {
                tr.classList.add("grand-total-row");
            } else if (rowTxt.includes("subtotal") || rowTxt.includes("sub total")) {
                tr.classList.add("subtotal-row");
            }

            cells.forEach((td, idx) => {
                const correspondingTh = ths[idx];
                const tdTxt = (td.textContent || "").trim();
                const isAmount = (
                    (correspondingTh && correspondingTh.classList.contains("text-right")) ||
                    /^[₹$]?\s*[-–—]?\s*[\d,]+(\.\d+)?%?$/.test(tdTxt) ||
                    tdTxt.startsWith("₹") ||
                    tdTxt.startsWith("$")
                );
                if (isAmount) {
                    td.classList.add("text-right");
                    td.classList.add("amount-cell");
                    td.style.fontWeight = "800";
                    td.style.textAlign = "right";
                }
            });
        });
    });

    // 5. Construct patient info HTML block if provided
    let patientMetaHtml = "";
    if (patientInfo && (patientInfo.uhid || patientInfo.ip_number || patientInfo.patient_name)) {
        patientMetaHtml = `
            <div class="patient-meta-box">
                <div class="patient-meta-grid">
                    <div class="patient-meta-item"><strong>UHID:</strong> <span>${patientInfo.uhid || "-"}</span></div>
                    <div class="patient-meta-item"><strong>IP No:</strong> <span>${patientInfo.ip_number || "-"}</span></div>
                    <div class="patient-meta-item"><strong>Patient Name:</strong> <span>${patientInfo.patient_name || "-"}</span></div>
                    <div class="patient-meta-item"><strong>Age / Sex:</strong> <span>${patientInfo.age_gender || patientInfo.age || "-"}</span></div>
                    <div class="patient-meta-item"><strong>Admitted:</strong> <span>${formatDate(patientInfo.admitted_date) || "-"}</span></div>
                    <div class="patient-meta-item"><strong>Discharge:</strong> <span>${formatDate(patientInfo.discharge_date) || "-"}</span></div>
                    <div class="patient-meta-item"><strong>Doctor:</strong> <span>${patientInfo.doctor || patientInfo.doctor_name || "-"}</span></div>
                    <div class="patient-meta-item"><strong>Company/TPA:</strong> <span>${patientInfo.company || patientInfo.insurance_company || "-"}</span></div>
                </div>
            </div>
        `;
    }

    // 6. Assemble standalone printable HTML
    const printTimeStr = dayjs().format("DD/MM/YYYY hh:mm A");
    const printedBy = localStorage.getItem("employee_name") || "HMS Staff";

    const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>${hospitalName} - ${reportTitle}</title>
            <style>
                ${getInsurancePdfStyle(orientation)}
            </style>
        </head>
        <body>
            <div class="page-frame-border"></div>
            <div class="document-wrapper">
                <div class="report-header">
                    <div class="hospital-name">${hospitalName}</div>
                    <div class="hospital-address">${hospitalAddress}</div>
                    <div class="report-title">${reportTitle}</div>
                    ${subtitle ? `<div class="report-period">${subtitle}</div>` : ""}
                </div>

                ${patientMetaHtml}

                <div class="report-content-body">
                    ${clone.innerHTML}
                </div>

                ${!clone.querySelector('.signatures-block') ? `
                <div class="print-signatures-block" style="display: flex; justify-content: space-between; margin-top: 45px; padding: 15px 10px 10px 10px; page-break-inside: avoid;">
                    <div style="text-align: left; font-size: 10pt; font-weight: bold; color: #000000;">
                        <div style="border-top: 1px solid #000000; width: 180px; margin-bottom: 6px;"></div>
                        Insurance Executive
                    </div>
                    <div style="text-align: right; font-size: 10pt; font-weight: bold; color: #000000;">
                        <div style="border-top: 1px solid #000000; width: 220px; margin-bottom: 6px; margin-left: auto;"></div>
                        General Manager - Insurance
                    </div>
                </div>` : ''}

                <div class="report-footer">
                    <div>Generated: ${printTimeStr} | Printed By: ${printedBy}</div>
                    <div>${hospitalName} &bull; Confidential Insurance Audit Record</div>
                </div>
            </div>
        </body>
        </html>
    `;

    // 7. Render into hidden iframe and print
    let iframe = document.getElementById("insurance-print-frame");
    if (iframe) {
        iframe.remove();
    }

    iframe = document.createElement("iframe");
    iframe.id = "insurance-print-frame";
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
    doc.write(fullHtml);
    doc.close();

    setTimeout(() => {
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } catch (e) {
            console.error("Iframe print error:", e);
        }
    }, 250);
};

export default printInsuranceReport;
