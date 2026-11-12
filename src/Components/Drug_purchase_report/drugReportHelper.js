import dayjs from 'dayjs';

export const SCOPE_OPTIONS = [
    { id: 'ALL (IP PHARMACY, OP PHARMACY, DRUG PURCHASE)', label: 'CONSOLIDATED (ALL: IP, OP, DRUG PURCHASE)' },
    { id: 'IP PHARMACY', label: 'IP PHARMACY' },
    { id: 'OP PHARMACY', label: 'OP PHARMACY' },
    { id: 'DRUG PURCHASE', label: 'DRUG PURCHASE (CENTRAL)' }
];

export const getStoredScope = () => {
    try {
        return localStorage.getItem('drug_purchase_report_scope') || 'DRUG PURCHASE';
    } catch {
        return 'DRUG PURCHASE';
    }
};

export const setStoredScope = (scope) => {
    try {
        localStorage.setItem('drug_purchase_report_scope', scope);
    } catch {
        // ignore
    }
};

export const formatCurrency = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDateDisplay = (dateStr) => {
    if (!dateStr || dateStr === '-') return '-';
    if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr.trim())) {
        return dateStr.trim();
    }
    const d = dayjs(dateStr);
    return d.isValid() ? d.format('DD/MM/YYYY') : String(dateStr);
};

export const printDrugReport = ({
    title = 'DRUG PURCHASE REPORT',
    fromDate = null,
    toDate = null,
    scope = 'DRUG PURCHASE',
    columns = [],
    data = [],
    summary = {}
}) => {
    const hospitalName = localStorage.getItem('hospital_name') || 'SHANMUGA HOSPITAL LIMITED';
    const hospitalAddress = '51/24, Saradha College Main Road, Salem - 636007';
    const printTimestamp = dayjs().format('DD/MM/YYYY HH:mm:ss');

    const fromStr = fromDate ? formatDateDisplay(fromDate) : null;
    const toStr = toDate ? formatDateDisplay(toDate) : null;
    const dateRangeStr = (fromStr && toStr) ? `From ${fromStr} To ${toStr}` : (fromStr ? `From ${fromStr}` : `As On ${dayjs().format('DD/MM/YYYY')}`);

    // Build the table headers
    const thsHtml = columns.map(col => {
        const align = col.align || (col.key?.includes('amount') || col.key?.includes('spend') || col.key?.includes('qty') || col.key?.includes('cost') || col.key?.includes('price') || col.key?.includes('val') ? 'right' : 'left');
        return `<th style="text-align: ${align}; padding: 6px 8px; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; font-size: 8.5pt; font-weight: bold; background: #fff;">${col.label}</th>`;
    }).join('');

    // Build table rows
    const trsHtml = data.map((row, idx) => {
        const tdsHtml = columns.map(col => {
            let val = row[col.key];
            if (val === undefined || val === null || val === '') val = '-';
            const align = col.align || (col.key?.includes('amount') || col.key?.includes('spend') || col.key?.includes('qty') || col.key?.includes('cost') || col.key?.includes('price') || col.key?.includes('val') ? 'right' : 'left');
            
            // Format currency if needed
            if (typeof val === 'number' && (col.key?.includes('amount') || col.key?.includes('spend') || col.key?.includes('cost') || col.key?.includes('price') || col.key?.includes('valuation') || col.key?.includes('due') || col.key?.includes('paid'))) {
                val = val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            return `<td style="text-align: ${align}; padding: 4.5px 8px; font-size: 8.2pt; border: none; vertical-align: middle;">${val}</td>`;
        }).join('');

        const bg = idx % 2 === 1 ? '#fafafa' : '#fff';
        return `<tr style="background: ${bg}; page-break-inside: avoid;">${tdsHtml}</tr>`;
    }).join('');

    // Summary box
    let summaryHtml = '';
    const summaryKeys = Object.keys(summary).filter(k => k !== 'scope');
    if (summaryKeys.length > 0) {
        const summaryPills = summaryKeys.map(k => {
            const label = k.replace(/_/g, ' ').toUpperCase();
            let val = summary[k];
            if (typeof val === 'number') {
                if (k.includes('amount') || k.includes('spend') || k.includes('cost') || k.includes('valuation') || k.includes('purchases') || k.includes('due') || k.includes('paid')) {
                    val = `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                } else {
                    val = val.toLocaleString('en-IN');
                }
            }
            return `
                <div style="flex: 1 1 200px; padding: 6px 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px;">
                    <div style="font-size: 7.5pt; font-weight: bold; color: #475569;">${label}</div>
                    <div style="font-size: 10pt; font-weight: 800; color: #000; margin-top: 2px;">${val}</div>
                </div>
            `;
        }).join('');

        summaryHtml = `
            <div style="margin-top: 14px; page-break-inside: avoid;">
                <div style="font-size: 8pt; font-weight: bold; color: #800000; text-transform: uppercase; margin-bottom: 6px;">Report Executive Summary</div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${summaryPills}
                </div>
            </div>
        `;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>${hospitalName} - ${title}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 8mm 10mm 10mm 10mm;
            @bottom-right {
                content: "Page " counter(page);
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
            font-size: 8.5pt;
            color: #000;
            background: #fff;
            padding: 10px 14px;
        }
        .page-border {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 1.5px solid #000;
            pointer-events: none;
        }
        .header-section {
            text-align: center;
            margin-bottom: 8px;
            padding-bottom: 6px;
        }
        .hospital-name {
            font-size: 12pt;
            font-weight: 900;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            color: #000;
        }
        .hospital-sub {
            font-size: 8pt;
            color: #333;
            margin-top: 2px;
        }
        .report-title {
            font-size: 10pt;
            font-weight: bold;
            color: #800000;
            text-transform: uppercase;
            margin-top: 4px;
        }
        .report-subtitle {
            font-size: 8.5pt;
            font-weight: bold;
            color: #1e293b;
            margin-top: 2px;
        }
        .meta-line {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8pt;
            font-weight: bold;
            border-bottom: 1.5px solid #000;
            padding-bottom: 4px;
            margin-bottom: 6px;
            text-transform: uppercase;
        }
        table {
            width: 100%;
            border-collapse: collapse;
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
    </style>
</head>
<body>
    <div class="page-border"></div>

    <div class="header-section">
        <div class="hospital-name">${hospitalName}</div>
        <div class="hospital-sub">${hospitalAddress}</div>
        <div class="report-title">${title}</div>
        <div class="report-subtitle">${dateRangeStr}</div>
    </div>

    <div class="meta-line">
        <div>SCOPE / DEPARTMENT: <span style="color: #059669;">${scope}</span></div>
        <div>TOTAL RECORDS: ${data.length}</div>
        <div>PRINTED AS ON: ${printTimestamp}</div>
    </div>

    <table>
        <thead>
            <tr>${thsHtml}</tr>
        </thead>
        <tbody>
            ${trsHtml}
        </tbody>
    </table>

    ${summaryHtml}
</body>
</html>
    `;

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        setTimeout(() => {
            document.body.removeChild(printFrame);
        }, 1000);
    }, 400);
};

