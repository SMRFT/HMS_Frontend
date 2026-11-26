import dayjs from "dayjs";

/**
 * Format date helper
 */
const formatDate = (dateStr, withTime = false) => {
    if (!dateStr) return "-";
    const d = dayjs(dateStr);
    if (!d.isValid()) return String(dateStr);
    return withTime ? d.format("DD/MM/YYYY hh:mm A") : d.format("DD/MM/YYYY");
};

/**
 * Indian currency number formatter
 */
const formatCurrency = (val) => {
    const num = Number(val);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Converts numbers into English words (Indian system: Lakhs, Crores)
 */
const numberToWords = (num) => {
    const a = [
        "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ",
        "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const inWords = (n) => {
        let str = "";
        if (n >= 10000000) {
            str += inWords(Math.floor(n / 10000000)) + "Crore ";
            n %= 10000000;
        }
        if (n >= 100000) {
            str += inWords(Math.floor(n / 100000)) + "Lakh ";
            n %= 100000;
        }
        if (n >= 1000) {
            str += inWords(Math.floor(n / 1000)) + "Thousand ";
            n %= 1000;
        }
        if (n >= 100) {
            str += inWords(Math.floor(n / 100)) + "Hundred ";
            n %= 100;
        }
        if (n > 0) {
            if (n < 20) str += a[n];
            else str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : " ");
        }
        return str;
    };

    const rounded = Number(num || 0).toFixed(2);
    const [wholeStr, decStr] = rounded.split(".");
    const whole = parseInt(wholeStr, 10);
    const dec = parseInt(decStr, 10);

    if (whole === 0 && dec === 0) return "Zero Rupees Only";
    let res = whole > 0 ? "Rupees " + inWords(whole).trim() : "";
    if (dec > 0) {
        res += (res ? " and " : "Rupees ") + inWords(dec).trim() + " Paise";
    }
    return (res + " Only").replace(/\s+/g, " ");
};

/**
 * Internal helper to run print in hidden iframe
 */
const triggerIframePrint = (html) => {
    let iframe = document.getElementById("cathlab-print-frame");
    if (iframe) {
        iframe.remove();
    }

    iframe = document.createElement("iframe");
    iframe.id = "cathlab-print-frame";
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
    doc.write(html);
    doc.close();

    setTimeout(() => {
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } catch (e) {
            console.error("Cath Lab print error:", e);
        }
    }, 250);
};

/**
 * 1. Print CATH LAB INTENT REQUISITIONS LOG (Landscape Table)
 */
export const printCathLabIntentsLog = (intentsList = [], options = {}) => {
    const hospitalName = options.hospitalName || localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
    const hospitalAddress = options.hospitalAddress || "24, Saradha College Road, Salem - 636 007 | Ph: 0427-2706666";
    const fromDateStr = formatDate(options.fromDate);
    const toDateStr = formatDate(options.toDate);
    const printedAt = dayjs().format("DD/MM/YYYY hh:mm A");
    const printedBy = localStorage.getItem("username") || localStorage.getItem("staff_name") || "HMS Staff";

    const rows = Array.isArray(intentsList) ? intentsList : [];

    let totalUnitsAll = 0;
    let grandTotalAmtAll = 0;

    const tableRowsHtml = rows.map((intent, idx) => {
        const items = intent.items || [];
        const totalReq = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
        const totalAmount = items.reduce((acc, it) => acc + ((Number(it.quantity) || 0) * (Number(it.mrp) || 0)), 0);

        totalUnitsAll += totalReq;
        grandTotalAmtAll += totalAmount;

        const dateStr = intent.date ? dayjs(intent.date).format("DD/MM/YYYY") : "-";
        const timeStr = intent.created_date ? dayjs(intent.created_date).format("hh:mm A") : "";
        const itemNames = items.map(it => it.name).filter(Boolean).join(", ");
        const itemsSummary = `${items.length} ${items.length === 1 ? "item" : "items"}${itemNames ? " (" + itemNames + ")" : ""}`;

        return `
            <tr>
                <td style="text-align: center; color: #475569;">${idx + 1}</td>
                <td>
                    <div style="font-weight: 600; color: #0f172a;">${dateStr}</div>
                    ${timeStr ? `<div style="font-size: 7.5pt; color: #64748b;">${timeStr}</div>` : ""}
                </td>
                <td style="font-family: monospace; font-weight: 700; color: #0f172a;">${intent.intent_id || "-"}</td>
                <td style="font-weight: 700; color: #0f172a;">${intent.patient_name || "—"}</td>
                <td style="font-family: monospace; font-weight: 600; color: #475569;">${intent.uhid || "—"}</td>
                <td style="font-weight: 600; color: #1e40af;">${intent.ipnumber ? intent.ipnumber : "—"}</td>
                <td style="color: #334155;">${itemsSummary}</td>
                <td style="text-align: center; font-weight: 700; color: #0f172a;">${totalReq}</td>
                <td style="text-align: right; font-weight: 700; color: #0f172a;">₹${formatCurrency(totalAmount)}</td>
            </tr>
        `;
    }).join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Cath Lab Intent Requisitions Log</title>
    <style>
        @page {
            size: landscape;
            margin: 8mm 10mm 10mm 10mm;
            @bottom-right {
                content: counter(page);
                font-family: Arial, sans-serif;
                font-size: 8pt;
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
            font-family: Arial, Helvetica, sans-serif;
            font-size: 8.8pt;
            color: #0f172a;
            background: #ffffff;
            padding: 4px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 6px;
            margin-bottom: 8px;
        }
        .hospital-name {
            font-size: 13pt;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #0f172a;
        }
        .hospital-address {
            font-size: 8.2pt;
            color: #475569;
            margin: 2px 0 4px 0;
        }
        .report-title {
            font-size: 10.5pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0d9488;
            margin-top: 3px;
        }
        .meta-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 6px 12px;
            border-radius: 4px;
            margin-bottom: 8px;
            font-size: 8.2pt;
        }
        .meta-item strong {
            color: #0f172a;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.4pt;
        }
        thead {
            display: table-header-group;
        }
        tr {
            page-break-inside: avoid;
        }
        th {
            background: #f1f5f9;
            color: #0f172a;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 8pt;
            padding: 6px 8px;
            border-top: 1.5px solid #0f172a;
            border-bottom: 1.5px solid #0f172a;
        }
        td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }
        tfoot tr td {
            padding: 8px;
            font-weight: 800;
            font-size: 9pt;
            border-top: 1.5px solid #0f172a;
            border-bottom: 1.5px double #0f172a;
            background: #f8fafc;
        }
        .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 36px;
            padding: 0 20px;
            font-size: 8.5pt;
        }
        .sig-box {
            text-align: center;
            border-top: 1px solid #475569;
            width: 180px;
            padding-top: 4px;
            font-weight: 600;
            color: #334155;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="hospital-name">${hospitalName}</div>
        <div class="hospital-address">${hospitalAddress}</div>
        <div class="report-title">CATH LAB INTENT REQUISITIONS LOG</div>
    </div>

    <div class="meta-bar">
        <div class="meta-item">Period: <strong>${fromDateStr}</strong> to <strong>${toDateStr}</strong></div>
        <div class="meta-item">Department: <strong>Cath Lab (DEPT027)</strong></div>
        <div class="meta-item">Total Requisitions: <strong>${rows.length}</strong></div>
        <div class="meta-item">Printed: <strong>${printedAt}</strong> | By: <strong>${printedBy}</strong></div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 35px; text-align: center;">#</th>
                <th style="width: 100px; text-align: left;">DATE & TIME</th>
                <th style="width: 115px; text-align: left;">INTENT ID</th>
                <th style="width: 140px; text-align: left;">PATIENT NAME</th>
                <th style="width: 95px; text-align: left;">UHID</th>
                <th style="width: 95px; text-align: left;">IP NUMBER</th>
                <th style="text-align: left;">ITEMS DESCRIPTION</th>
                <th style="width: 80px; text-align: center;">FOR BILL</th>
                <th style="width: 110px; text-align: right;">TOTAL AMOUNT</th>
            </tr>
        </thead>
        <tbody>
            ${tableRowsHtml || `<tr><td colspan="9" style="text-align: center; padding: 24px; color: #94a3b8;">No Cath Lab requisitions recorded for this period.</td></tr>`}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="7" style="text-align: right; color: #0f172a;">GRAND TOTAL:</td>
                <td style="text-align: center; color: #0f172a;">${totalUnitsAll} units</td>
                <td style="text-align: right; color: #0d9488;">₹${formatCurrency(grandTotalAmtAll)}</td>
            </tr>
        </tfoot>
    </table>

    <div class="signatures">
        <div class="sig-box">Cath Lab Incharge / Tech</div>
        <div class="sig-box">Store Pharmacist</div>
        <div class="sig-box">Authorized Signatory</div>
    </div>
</body>
</html>
    `;

    triggerIframePrint(html);
};

/**
 * 2. Print Single CATH LAB INTENT (Voucher / Material Requisition Slip)
 */
export const printCathLabSingleIntent = (intent, options = {}) => {
    if (!intent) return;

    const hospitalName = options.hospitalName || localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
    const hospitalAddress = options.hospitalAddress || "24, Saradha College Road, Salem - 636 007 | Ph: 0427-2706666";
    const printedAt = dayjs().format("DD/MM/YYYY hh:mm A");
    const printedBy = localStorage.getItem("username") || localStorage.getItem("staff_name") || "HMS Staff";

    const items = intent.items || [];
    const totalQty = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
    const totalAmount = items.reduce((acc, it) => acc + ((Number(it.quantity) || 0) * (Number(it.mrp) || 0)), 0);

    const intentDate = intent.date ? dayjs(intent.date).format("DD/MM/YYYY") : "-";
    const intentTime = intent.created_date ? dayjs(intent.created_date).format("hh:mm A") : "";
    const fullDateTime = intentTime ? `${intentDate} ${intentTime}` : intentDate;

    const itemsRowsHtml = items.map((it, idx) => {
        const itemQty = Number(it.quantity) || 0;
        const itemMrp = Number(it.mrp) || 0;
        const itemTotal = itemQty * itemMrp;

        return `
            <tr>
                <td style="text-align: center; color: #475569;">${idx + 1}</td>
                <td>
                    <div style="font-weight: 700; color: #0f172a;">${it.name || "-"}</div>
                    <div style="font-size: 7.5pt; font-family: monospace; color: #64748b;">${it.item_id || ""}</div>
                </td>
                <td style="color: #475569;">${it.hsn || "-"}</td>
                <td style="font-family: monospace; font-weight: 600; color: #0d9488;">${it.batch || "-"}</td>
                <td style="text-align: right; color: #0f172a;">₹${formatCurrency(itemMrp)}</td>
                <td style="text-align: center; font-weight: 700; color: #0f172a;">${itemQty}</td>
                <td style="text-align: right; font-weight: 700; color: #0f172a;">₹${formatCurrency(itemTotal)}</td>
            </tr>
        `;
    }).join("");

    const amountInWords = numberToWords(totalAmount);

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Cath Lab Requisition Slip - ${intent.intent_id}</title>
    <style>
        @page {
            size: portrait;
            margin: 8mm 10mm 10mm 10mm;
            @bottom-right {
                content: counter(page);
                font-family: Arial, sans-serif;
                font-size: 8pt;
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
            font-family: Arial, Helvetica, sans-serif;
            font-size: 8.8pt;
            color: #0f172a;
            background: #ffffff;
            padding: 4px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 6px;
            margin-bottom: 10px;
        }
        .hospital-name {
            font-size: 13pt;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #0f172a;
        }
        .hospital-address {
            font-size: 8.2pt;
            color: #475569;
            margin: 2px 0 4px 0;
        }
        .slip-title {
            font-size: 11pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0d9488;
            margin-top: 3px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 16px;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 12px;
            font-size: 8.5pt;
        }
        .info-row {
            display: flex;
            align-items: baseline;
        }
        .info-label {
            width: 120px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 7.8pt;
        }
        .info-val {
            font-weight: 700;
            color: #0f172a;
            flex: 1;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
            margin-top: 4px;
        }
        thead {
            display: table-header-group;
        }
        tr {
            page-break-inside: avoid;
        }
        th {
            background: #f1f5f9;
            color: #0f172a;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 8pt;
            padding: 7px 8px;
            border-top: 1.5px solid #0f172a;
            border-bottom: 1.5px solid #0f172a;
        }
        td {
            padding: 7px 8px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        tfoot tr td {
            padding: 8px;
            font-weight: 800;
            font-size: 9pt;
            border-top: 1.5px solid #0f172a;
            border-bottom: 1.5px double #0f172a;
            background: #f8fafc;
        }
        .words-bar {
            background: #f1f5f9;
            border-left: 3px solid #0d9488;
            padding: 7px 12px;
            margin-top: 10px;
            font-size: 8.5pt;
            color: #1e293b;
        }
        .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 45px;
            padding: 0 15px;
            font-size: 8.5pt;
        }
        .sig-box {
            text-align: center;
            border-top: 1px solid #475569;
            width: 140px;
            padding-top: 4px;
            font-weight: 600;
            color: #334155;
        }
        .footer-print-note {
            text-align: right;
            font-size: 7.5pt;
            color: #94a3b8;
            margin-top: 24px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="hospital-name">${hospitalName}</div>
        <div class="hospital-address">${hospitalAddress}</div>
        <div class="slip-title">CATH LAB MATERIAL REQUISITION / INTENT SLIP</div>
    </div>

    <div class="info-grid">
        <div class="info-row">
            <span class="info-label">Requisition ID:</span>
            <span class="info-val" style="font-family: monospace; font-size: 10pt; color: #0d9488;">${intent.intent_id}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Date & Time:</span>
            <span class="info-val">${fullDateTime}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Department:</span>
            <span class="info-val">Cath lab (DEPT027)</span>
        </div>
        <div class="info-row">
            <span class="info-label">Patient Name:</span>
            <span class="info-val" style="font-size: 9.5pt; color: #0f172a;">${intent.patient_name || "—"}</span>
        </div>
        <div class="info-row">
            <span class="info-label">UHID:</span>
            <span class="info-val" style="font-family: monospace; color: #475569;">${intent.uhid || "—"}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Patient IP No:</span>
            <span class="info-val" style="color: #1e40af; font-size: 9.5pt;">${intent.ipnumber || "—"}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Billed Status:</span>
            <span class="info-val" style="color: ${intent.is_billed ? '#059669' : '#d97706'};">
                ${intent.is_billed ? "✓ Billed to Patient" : "Pending Patient Billing"}
            </span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Items:</span>
            <span class="info-val">${items.length} items (${totalQty} units)</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 35px; text-align: center;">#</th>
                <th style="text-align: left;">ITEM DESCRIPTION</th>
                <th style="width: 90px; text-align: left;">HSN</th>
                <th style="width: 120px; text-align: left;">BATCH (GRN)</th>
                <th style="width: 90px; text-align: right;">MRP (₹)</th>
                <th style="width: 80px; text-align: center;">FOR BILL</th>
                <th style="width: 110px; text-align: right;">AMOUNT (₹)</th>
            </tr>
        </thead>
        <tbody>
            ${itemsRowsHtml || `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #94a3b8;">No items listed in requisition.</td></tr>`}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="5" style="text-align: right; color: #0f172a;">NET TOTAL AMOUNT:</td>
                <td style="text-align: center; color: #0f172a;">${totalQty}</td>
                <td style="text-align: right; color: #0d9488; font-size: 9.5pt;">₹${formatCurrency(totalAmount)}</td>
            </tr>
        </tfoot>
    </table>

    <div class="words-bar">
        <strong>Amount in Words:</strong> ${amountInWords}
    </div>

    <div class="signatures">
        <div class="sig-box">Raised By (Cath Lab Tech)</div>
        <div class="sig-box">Cath Lab Incharge / Nurse</div>
        <div class="sig-box">Issued By (Stores Pharmacist)</div>
        <div class="sig-box">Received By (Cath Lab Staff)</div>
    </div>

    <div class="footer-print-note">
        System Generated Cath Lab Intent Requisition Slip • Printed on ${printedAt} by ${printedBy}
    </div>
</body>
</html>
    `;

    triggerIframePrint(html);
};

export default {
    printCathLabIntentsLog,
    printCathLabSingleIntent
};
