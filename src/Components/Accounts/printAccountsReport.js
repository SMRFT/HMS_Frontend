// Utility for printing formal Accounts reports cleanly in an isolated iframe
// Prevents duplicate pages, overflow clipping, and background DOM layout leaks

export const printAccountsReport = (elementId = "printable-report-area", orientation = "landscape") => {
    const elem = document.getElementById(elementId);
    if (!elem) {
        window.print();
        return;
    }

    // Remove any previous print iframe
    let oldIframe = document.getElementById("accounts-print-frame");
    if (oldIframe) {
        oldIframe.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "accounts-print-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const hospitalName = localStorage.getItem("hospital_name") || "Shanmuga Hospital";
    const docTitle = `${hospitalName} Management System - ${hospitalName}`;

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8" />
                <title>${docTitle}</title>
                <style>
                    @page {
                        size: ${orientation};
                        margin: 8mm 8mm 10mm 8mm;
                    }
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        font-size: 10px;
                        color: #000;
                        background: #fff;
                        padding: 6px;
                    }
                    h1, h2, h3, h4, p {
                        margin: 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 6px 0;
                        font-size: 9px;
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
                    th, td {
                        border: 1px solid #333;
                        padding: 4px 5px;
                        text-align: left;
                    }
                    th {
                        background-color: #f1f5f9 !important;
                        font-weight: 700;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .report-header {
                        text-align: center;
                        border-bottom: 2px solid #000;
                        padding-bottom: 6px;
                        margin-bottom: 8px;
                    }
                    .report-header h1 {
                        font-size: 18px;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .report-header p {
                        font-size: 11px;
                        margin-top: 2px;
                    }
                    .report-header .title, .report-title {
                        font-size: 13px;
                        font-weight: bold;
                        text-decoration: underline;
                        margin-top: 6px;
                        text-transform: uppercase;
                    }
                    .info-table, table[class*="PrintInfoTable"] {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 8px;
                        font-size: 10px;
                    }
                    .info-table td, table[class*="PrintInfoTable"] td {
                        border: none !important;
                        padding: 2px 0;
                    }
                    .summary-grid {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                        margin: 8px 0;
                        border: 1px solid #333;
                        padding: 6px 10px;
                        font-size: 10px;
                        background: #f8fafc;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .summary-grid > div {
                        flex: 1;
                        min-width: 120px;
                    }
                    .signatures, div[class*="PrintSignatures"] {
                        margin-top: 35px;
                        display: flex;
                        justify-content: space-between;
                        font-size: 10px;
                        page-break-inside: avoid;
                    }
                    .sig-box {
                        text-align: center;
                        width: 160px;
                        border-top: 1px solid #000;
                        padding-top: 4px;
                        font-weight: bold;
                    }
                    .text-right {
                        text-align: right;
                    }
                    .text-center {
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                ${elem.innerHTML}
            </body>
        </html>
    `);
    doc.close();

    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    }, 200);
};

export default printAccountsReport;
