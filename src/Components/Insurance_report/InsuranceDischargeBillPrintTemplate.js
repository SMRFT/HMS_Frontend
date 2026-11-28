import React from "react";
import headerImg from "../Images/Header.png";

/**
 * Number to Words in Indian Currency format (UPPERCASE), matching DischargeBillPrintModal.js
 */
const numberToWords = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "ZERO";
    const amount = Number(num);
    const n = Math.floor(Math.abs(amount));
    if (n === 0) return "ZERO";

    const a = [
        "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
        "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN",
        "SEVENTEEN", "EIGHTEEN", "NINETEEN"
    ];
    const b = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];

    const inWords = (val) => {
        let str = "";
        if (val > 9999999) {
            str += inWords(Math.floor(val / 10000000)) + " CRORE ";
            val %= 10000000;
        }
        if (val > 99999) {
            str += inWords(Math.floor(val / 100000)) + " LAKH ";
            val %= 100000;
        }
        if (val > 999) {
            str += inWords(Math.floor(val / 1000)) + " THOUSAND ";
            val %= 1000;
        }
        if (val > 99) {
            str += inWords(Math.floor(val / 100)) + " HUNDRED ";
            val %= 100;
        }
        if (val > 0) {
            if (str !== "") str += " ";
            if (val < 20) str += a[val];
            else str += b[Math.floor(val / 10)] + (val % 10 !== 0 ? " " + a[val % 10] : "");
        }
        return str.trim();
    };

    const words = inWords(n);
    const paise = Math.round((Math.abs(amount) - n) * 100);
    if (paise > 0) {
        return `${words} AND ${inWords(paise)} PAISE`;
    }
    return words;
};

const fmtAmount = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? "0.00" : n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Hidden-iframe print helper matching DischargeBillPrintModal.js
 */
export const printDischargeBillTemplate = (elementId, title = "DISCHARGE BILL") => {
    const el = document.getElementById(elementId);
    if (!el) {
        window.print();
        return;
    }

    try {
        let iframe = document.getElementById("insurance-discharge-print-iframe");
        if (!iframe) {
            iframe = document.createElement("iframe");
            iframe.id = "insurance-discharge-print-iframe";
            iframe.style.position = "fixed";
            iframe.style.right = "0";
            iframe.style.bottom = "0";
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.style.border = "0";
            document.body.appendChild(iframe);
        }

        const contentHtml = el.innerHTML;
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${String(title || "DISCHARGE BILL").replace(/[<>]/g, "")}</title>
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 8mm 10mm;
                        }
                        * {
                            box-sizing: border-box;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background: #ffffff;
                            color: #000000;
                            font-family: 'Times New Roman', Times, serif;
                        }
                        .bill-page {
                            box-shadow: none !important;
                            border: none !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            width: 100% !important;
                        }
                        .no-print {
                            display: none !important;
                        }
                        table {
                            border-collapse: collapse;
                        }
                        thead {
                            display: table-header-group !important;
                        }
                        tr {
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                        }
                    </style>
                </head>
                <body>
                    <div style="width: 100%; max-width: 780px; margin: 0 auto; color: #000000;">
                        ${contentHtml}
                    </div>
                </body>
            </html>
        `);
        doc.close();

        const imgs = doc.querySelectorAll("img");
        const promises = Array.from(imgs).map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        });

        Promise.all(promises).then(() => {
            setTimeout(() => {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                } catch (e) {
                    console.error("Iframe print error, falling back to window.print():", e);
                    window.print();
                }
            }, 250);
        });
    } catch (err) {
        console.error("Print error, fallback to window.print():", err);
        window.print();
    }
};

/**
 * Print Template styled like DischargeBillPrintModal.js, using ONLY the existing fields
 * from InsuranceDischargeBillAllReport (OP Number, Name/Age, Address, Doctor, Claim Intimation,
 * Bill Number, Billdate, Treatment start, Treatment end, Company, REF ID, Package Details,
 * Diagnosis, and Bill Details particulars/amount + Total).
 */
const InsuranceDischargeBillPrintTemplate = ({
    id = "printable-discharge-bill-sheet",
    reportTitle = "DISCHARGE BILL",
    patient = {},
    billMeta = {},
    uhid = "",
    packageDetails = "",
    diagnosis = "",
    details = [],
    totalAmount = 0,
}) => {
    const pickVal = (...vals) => {
        for (const v of vals) {
            if (v != null && String(v).trim() !== "" && String(v).trim() !== "-" && String(v).trim() !== "N") {
                return String(v).trim();
            }
        }
        return "-";
    };

    const patientName = pickVal(patient.name, patient.patient_name);
    const patientAge = pickVal(patient.age);
    const nameWithAge = patientAge !== "-" ? `${patientName}, ${patientAge} YEARS` : patientName;

    const metaRows = [
        {
            lLabel: "OP NUMBER",
            lVal: pickVal(patient.op_number, patient.uhid, uhid),
            rLabel: "BILL NUMBER",
            rVal: pickVal(billMeta.bill_number, billMeta.bill_no, patient.bill_no, patient.bill_number),
        },
        {
            lLabel: "NAME",
            lVal: nameWithAge,
            rLabel: "BILLDATE",
            rVal: pickVal(billMeta.bill_date, patient.bill_date),
        },
        {
            lLabel: "ADDRESS",
            lVal: pickVal(patient.address),
            rLabel: "TREATMENT START",
            rVal: pickVal(billMeta.treatment_start, billMeta.doa, patient.treatment_start, patient.doa, patient.admitted_date),
        },
        {
            lLabel: "DOCTOR",
            lVal: pickVal(patient.doctor, patient.doctor_name),
            rLabel: "TREATMENT END",
            rVal: pickVal(billMeta.treatment_end, billMeta.dod, patient.treatment_end, patient.dod, patient.discharge_date),
        },
        {
            lLabel: "CLAIM INTIMATION",
            lVal: pickVal(patient.claim_intimation, patient.claim_intimation_no),
            rLabel: "COMPANY",
            rVal: pickVal(billMeta.company, billMeta.company_name, patient.company_name, patient.insurance_company),
        },
        {
            lLabel: "PACKAGE DETAILS",
            lVal: pickVal(packageDetails, billMeta.package_details, patient.package_details),
            rLabel: "REF ID",
            rVal: pickVal(billMeta.ref_id, billMeta.approval, patient.ref_id, patient.approval),
        },
    ];

    const diagVal = pickVal(diagnosis, billMeta.diagnosis, patient.diagnosis);

    return (
        <div
            id={id}
            className="bill-page"
            style={{
                width: "100%",
                maxWidth: "820px",
                margin: "0 auto",
                background: "#ffffff",
                padding: "18px 24px",
                border: "1px solid #cbd5e1",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                color: "#000000",
                fontFamily: "'Times New Roman', Times, serif",
                textTransform: "uppercase",
            }}
        >
            {/* Hospital Header Image matching DischargeBillPrintModal.js */}
            <div style={{ textAlign: "center", paddingTop: "4px", marginBottom: "8px" }}>
                <img
                    src={headerImg}
                    alt="HOSPITAL HEADER"
                    style={{ maxWidth: "100%", height: "auto", maxHeight: "68px" }}
                />
            </div>

            {/* Bill Title Banner */}
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    borderTop: "2px solid #000000",
                    borderBottom: "2px solid #000000",
                    marginBottom: "10px",
                    marginTop: "6px",
                }}
            >
                <tbody>
                    <tr>
                        <td
                            style={{
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "1.05rem",
                                padding: "5px 4px",
                                letterSpacing: "0.6px",
                            }}
                        >
                            {reportTitle || "DISCHARGE BILL"}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Patient & Bill Metadata Two-Column Table (Existing Fields Only) */}
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    tableLayout: "fixed",
                    fontSize: "0.85rem",
                    lineHeight: "1.4",
                    borderBottom: "1.5px solid #000000",
                    marginBottom: "8px",
                }}
            >
                <tbody>
                    {metaRows.map((r, i) => (
                        <tr key={i}>
                            <td style={{ width: "20%", padding: "2px 3px", fontWeight: "bold", verticalAlign: "top" }}>
                                {r.lLabel}
                            </td>
                            <td style={{ width: "2%", padding: "2px 0", textAlign: "center", verticalAlign: "top" }}>:</td>
                            <td style={{ width: "28%", padding: "2px 4px", verticalAlign: "top", wordBreak: "break-word", fontWeight: i <= 1 ? "bold" : "normal" }}>
                                {r.lVal}
                            </td>
                            <td style={{ width: "20%", padding: "2px 3px", fontWeight: "bold", verticalAlign: "top" }}>
                                {r.rLabel}
                            </td>
                            <td style={{ width: "2%", padding: "2px 0", textAlign: "center", verticalAlign: "top" }}>:</td>
                            <td style={{ width: "28%", padding: "2px 3px", verticalAlign: "top", wordBreak: "break-word", fontWeight: "bold" }}>
                                {r.rVal}
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td style={{ width: "20%", padding: "2px 3px 6px", fontWeight: "bold", verticalAlign: "top" }}>
                            DIAGNOSIS
                        </td>
                        <td style={{ width: "2%", padding: "2px 0 6px", textAlign: "center", verticalAlign: "top" }}>:</td>
                        <td colSpan={4} style={{ padding: "2px 4px 6px", verticalAlign: "top", wordBreak: "break-word", fontWeight: "bold" }}>
                            {diagVal}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Bill Details Table */}
            <div style={{ fontSize: "0.9rem", fontWeight: "bold", margin: "10px 0 6px", letterSpacing: "0.3px" }}>
                BILL DETAILS
            </div>

            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.86rem",
                    marginBottom: "10px",
                }}
            >
                <thead>
                    <tr style={{ borderTop: "1.5px solid #000000", borderBottom: "1.5px solid #000000", background: "#f8fafc" }}>
                        <th style={{ width: "55px", padding: "5px 6px", textAlign: "left", fontWeight: "bold" }}>S.NO</th>
                        <th style={{ padding: "5px 6px", textAlign: "left", fontWeight: "bold" }}>PARTICULARS</th>
                        <th style={{ width: "140px", padding: "5px 6px", textAlign: "right", fontWeight: "bold" }}>AMOUNT (&#8377;)</th>
                    </tr>
                </thead>
                <tbody>
                    {!Array.isArray(details) || details.length === 0 ? (
                        <tr>
                            <td colSpan={3} style={{ textAlign: "center", padding: "24px", color: "#475569", fontWeight: "bold" }}>
                                NO RECORD FOUND
                            </td>
                        </tr>
                    ) : (
                        <>
                            {details.map((d, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #d1d5db" }}>
                                    <td style={{ padding: "5px 6px", verticalAlign: "top" }}>{idx + 1}</td>
                                    <td style={{ padding: "5px 6px", verticalAlign: "top" }}>
                                        {d.itemName || d.category || d.particulars}
                                    </td>
                                    <td style={{ padding: "5px 6px", textAlign: "right", fontWeight: "bold", fontVariantNumeric: "tabular-nums" }}>
                                        {fmtAmount(d.amount || d.price || 0)}
                                    </td>
                                </tr>
                            ))}
                            <tr style={{ borderTop: "1.5px solid #000000", borderBottom: "3px double #000000", background: "#f8fafc" }}>
                                <td colSpan={2} style={{ padding: "6px", textAlign: "right", fontWeight: "bold", fontSize: "0.95rem" }}>
                                    TOTAL
                                </td>
                                <td style={{ padding: "6px", textAlign: "right", fontWeight: "bold", fontSize: "0.95rem", fontVariantNumeric: "tabular-nums" }}>
                                    {fmtAmount(totalAmount)}
                                </td>
                            </tr>
                        </>
                    )}
                </tbody>
            </table>

            {/* Amount in Words */}
            <div style={{ fontSize: "0.82rem", fontWeight: "bold", marginBottom: "28px", paddingTop: "2px" }}>
                AMOUNT IN WORDS : RUPEES {numberToWords(totalAmount)} ONLY
            </div>

            {/* Footer Signatures & GST Exemption Note matching DischargeBillPrintModal.js */}
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    tableLayout: "fixed",
                    fontSize: "0.86rem",
                    marginTop: "36px",
                }}
            >
                <tbody>
                    <tr>
                        <td style={{ width: "50%", textAlign: "left", verticalAlign: "bottom" }}>
                            <div style={{ borderTop: "1px solid #000000", width: "180px", marginBottom: "4px" }}></div>
                            <div style={{ fontWeight: "bold" }}>INSURANCE EXECUTIVE</div>
                        </td>
                        <td style={{ width: "50%", textAlign: "right", verticalAlign: "bottom" }}>
                            <div style={{ borderTop: "1px solid #000000", width: "220px", marginBottom: "4px", marginLeft: "auto" }}></div>
                            <div style={{ fontWeight: "bold" }}>GENERAL MANAGER - INSURANCE</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "0.8rem", marginTop: "10px", marginBottom: "4px" }}>
                PAGE : 1 OF 1
            </div>

            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    borderTop: "1px solid #000000",
                    fontSize: "0.7rem",
                }}
            >
                <tbody>
                    <tr>
                        <td style={{ textAlign: "left", fontStyle: "italic", paddingTop: "4px" }}>
                            HEALTH CARE SERVICES PROVIDED BY A CLINICAL ESTABLISHMENT ARE EXEMPT UNDER NOTIFICATION NO. 12/2017-CENTRAL TAX (RATE). THIS IS A GST EXEMPT INVOICE.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default InsuranceDischargeBillPrintTemplate;
