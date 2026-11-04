import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import headerImg from "../Images/Header.png";
import apiRequest from "../../Auth/apiRequest";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? "0.00" : n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDateStr = (str) => {
  if (!str) return "—";
  if (typeof str === "string" && str.trim()) {
    const s = str.trim();
    const ddmmyyyy = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (ddmmyyyy) {
      return `${ddmmyyyy[1].padStart(2, "0")}/${ddmmyyyy[2].padStart(2, "0")}/${ddmmyyyy[3]}`;
    }
    const yyyymmdd = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (yyyymmdd) {
      return `${yyyymmdd[3].padStart(2, "0")}/${yyyymmdd[2].padStart(2, "0")}/${yyyymmdd[1]}`;
    }
  }
  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return "—";
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  } catch {
    return "—";
  }
};

const parseItems = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
};

// ── Number to Words in Indian Currency format (UPPERCASE) ──────────────────────
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

// Item categorization for IP/General patient format
const categorizeItem = (it) => {
  const text = `${it.itemName || ""} ${it.category || ""} ${it.department || ""} ${it.item_description || ""} ${it.package_name || ""}`.toLowerCase();

  if (/room|ward|nursing|maintenance|accommodation|bed|icu|ccu|day care|stay|admission fee/i.test(text)) {
    return "ACCOMMODATION - TYPE OF WARD PRIVATE/SEMI-PRIVATE/GENERAL/ICU/CCU/DAY CARE";
  }
  if (/consult|doctor visit|physician|round|specialist|opd|indoor/i.test(text)) {
    return "CONSULTATION CHARGES OPD/INDOOR";
  }
  if (/radiolog|x-ray|xray|ct scan|mri|ultrasound|usg|mammogra/i.test(text)) {
    return "RADIOLOGY CHARGES";
  }
  if (/invest|lab|patholog|scan|ecg|echo|blood|biochem|microbio|urine|test|profile|panel/i.test(text)) {
    return "INVESTIGATIONS / LABORATORY CHARGES";
  }
  if (/medicine|pharmacy|drug|inject|consumable|iv fluid|tablet|capsule|syrup|suture/i.test(text)) {
    return "MEDICINE / PHARMACY CHARGES";
  }
  return "SPECIALISED SERVICES / PROCEDURES / SURGERY";
};

// Standard Categories
const IP_CATEGORIES = [
  "ACCOMMODATION - TYPE OF WARD PRIVATE/SEMI-PRIVATE/GENERAL/ICU/CCU/DAY CARE",
  "CONSULTATION CHARGES OPD/INDOOR",
  "RADIOLOGY CHARGES",
  "INVESTIGATIONS / LABORATORY CHARGES",
  "MEDICINE / PHARMACY CHARGES",
  "SPECIALISED SERVICES / PROCEDURES / SURGERY"
];

// ── Styled Modal Components ──────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(15,23,42,0.65);
  backdrop-filter: blur(2px); z-index: 10000; display: flex;
  align-items: center; justify-content: center; padding: 16px;
`;

const ModalBox = styled.div`
  background: #f1f5f9; border-radius: 12px; width: 100%; max-width: 900px;
  max-height: 94vh; display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
`;

const ModalHead = styled.div`
  background: #1e293b; color: #fff; padding: 12px 18px;
  display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  gap: 12px; flex-wrap: wrap;
`;

const ModalTitle = styled.h3`
  margin: 0; font-size: 0.95rem; font-weight: 700; color: #fff;
  display: flex; align-items: center; gap: 8px; text-transform: uppercase;
  font-family: 'Times New Roman', Times, serif;
`;

const ModalClose = styled.button`
  background: none; border: none; font-size: 1.2rem; cursor: pointer;
  color: #fff; line-height: 1; padding: 2px 6px; border-radius: 4px;
  &:hover { background: rgba(255,255,255,0.15); }
`;

const HeadBtn = styled.button`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; font-size: 0.78rem; font-weight: 600;
  border-radius: 6px; cursor: pointer; transition: all 0.15s ease;
  border: 1px solid ${props => props.$active ? "#0d9488" : "rgba(255,255,255,0.3)"};
  background: ${props => props.$active ? "#0d9488" : "rgba(255,255,255,0.08)"};
  color: #fff; text-transform: uppercase;
  &:hover { background: ${props => props.$active ? "#0f766e" : "rgba(255,255,255,0.18)"}; }
`;

// ── Printable Sheet ──────────────────────────────────────────────────────────
export const PrintSheet = React.forwardRef(({
  bill,
  insuranceFormat = "IP",
  withHeader = true,
  managerName,
  managerDesig,
  preparedByName,
  preparedByDesig,
}, ref) => {
  if (!bill) return null;

  const pd = bill.patient_details || {};
  const rawItems = parseItems(bill.items);

  const isInsurance = Boolean(
    bill.is_insurance_bill ||
    bill.insurance_bill_number ||
    bill.claim_number ||
    (pd.patient_type && String(pd.patient_type).toLowerCase().includes("insurance")) ||
    (pd.patient_type && String(pd.patient_type).toLowerCase().includes("credit")) ||
    (pd.company && String(pd.company).trim())
  );

  const cleanDesc = (it) => {
    let desc = (it.item_description || "").trim();
    const btn = (it.billTypeNo || "").trim();
    if (
      desc === btn ||
      desc === "DIS01" ||
      desc.toUpperCase().startsWith("DIS0") ||
      desc.toUpperCase().startsWith("LAB0") ||
      desc.toLowerCase() === "investbilling" ||
      desc.includes("NABH:")
    ) {
      desc = "";
    }
    return desc;
  };

  const getNabhCode = (it) => {
    let code = it.nabh_code || it.nabhCode || it.nabh || "";
    if (!code && it.item_description && it.item_description.includes("NABH:")) {
      const match = it.item_description.match(/NABH:\s*([^\s·,]+)/i);
      if (match) code = match[1];
    }
    return code || "-";
  };

  // Group items for categories
  const groups = {};
  IP_CATEGORIES.forEach(cat => { groups[cat] = []; });

  rawItems.forEach(it => {
    const cat = categorizeItem(it);
    if (groups[cat]) {
      groups[cat].push(it);
    } else {
      groups["SPECIALISED SERVICES / PROCEDURES / SURGERY"].push(it);
    }
  });

  const medAmt = parseFloat(bill.medicines_amount) || 0;
  if (medAmt > 0 && groups["MEDICINE / PHARMACY CHARGES"].length === 0) {
    groups["MEDICINE / PHARMACY CHARGES"].push({
      itemName: "PHARMACY MEDICINE CHARGES",
      nabh_code: "-",
      doctor: "",
      amount: medAmt,
      quantity: 1,
      rate: medAmt
    });
  }

  const groupTotals = {};
  IP_CATEGORIES.forEach(cat => {
    groupTotals[cat] = (groups[cat] || []).reduce((acc, it) => acc + (parseFloat(it.amount) || 0), 0);
  });

  // Effective Prepared By and Manager names & designations (resolved dynamically from backend / bill)
  const effPreparedByName = String(preparedByName ?? bill.created_by_name ?? bill.created_by ?? "").toUpperCase();
  const effPreparedByDesig = String(preparedByDesig ?? bill.created_by_designation ?? "").toUpperCase();
  const effManagerName = String(managerName ?? bill.manager_name ?? "").toUpperCase();
  const effManagerDesig = String(managerDesig ?? bill.manager_designation ?? "GENERAL INSURANCE MANAGER").toUpperCase();

  // ── Header Block (Header Image for Plain Paper or Blank Spacer for Physical Letterpad on ALL pages) ──
  const renderHeaderBlock = () => (
    withHeader ? (
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <img src={headerImg} alt="HOSPITAL HEADER" style={{ maxWidth: "100%", height: "auto", maxHeight: "65px" }} />
      </div>
    ) : (
      <div className="letterpad-spacer" style={{ height: "95px" }} />
    )
  );

  // ── Header Details Table (Displayed ONLY on First Page) ───────────────────
  const renderHeaderDetails = () => {
    if (isInsurance) {
      const rows = [
        {
          lLabel: "INSURANCE BILL NO",
          lVal: <span style={{ fontWeight: "bold" }}>{String(bill.insurance_bill_number || "—").toUpperCase()}</span>,
          rLabel: "BILL DATE",
          rVal: fmtDateStr(bill.bill_date)
        },
        {
          lLabel: "NAME OF PATIENT",
          lVal: <span style={{ fontWeight: "bold" }}>{(pd.patient_name || bill.patient_name || "—").toUpperCase()}{pd.age ? `, ${pd.age} Y` : ""}{pd.gender ? `, ${String(pd.gender).toUpperCase()}` : ""}</span>,
          rLabel: "IP NO",
          rVal: String(bill.ip_number || pd.ip_number || "—").toUpperCase()
        },
        {
          lLabel: "UHID",
          lVal: String(bill.uhid || pd.uhid || "—").toUpperCase(),
          rLabel: "ROOM",
          rVal: String(pd.room_no || pd.roomNo || "GENERAL WARD").toUpperCase()
        },
        {
          lLabel: "ADDRESS",
          lVal: String(pd.address || pd.permanent_address || "—").toUpperCase(),
          rLabel: "DATE OF ADMISSION",
          rVal: fmtDateStr(pd.admission_date || pd.admissionDateTime)
        },
        {
          lLabel: "ID CARD NO",
          lVal: String(bill.id_card_number || pd.id_card_number || pd.card_no || "—").toUpperCase(),
          rLabel: "DATE OF DISCHARGE",
          rVal: fmtDateStr(bill.bill_date || pd.discharge_date)
        },
        {
          lLabel: "REFERRAL NO",
          lVal: String(bill.claim_number || pd.claim_number || pd.referral_number || "—").toUpperCase(),
          rLabel: "BILL NO",
          rVal: String(bill.bill_no || bill.estimate_number || "—").toUpperCase()
        },
        {
          lLabel: "DOCTOR NAME",
          lVal: String(pd.doctor || pd.admittingDoctorName || pd.admitting_doctor || "DR. ATTENDING PHYSICIAN").toUpperCase(),
          rLabel: "COMPANY NAME",
          rVal: String(bill.company_name || pd.company || "—").toUpperCase()
        }
      ];

      return (
        <table style={{
          width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
          fontSize: "0.74rem", lineHeight: "1.35", borderBottom: "1px solid #000",
          paddingBottom: 4, marginBottom: 8, textTransform: "uppercase",
          fontFamily: "'Times New Roman', Times, serif"
        }}>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{ width: "20%", padding: "1px 2px", fontWeight: "bold", verticalAlign: "top" }}>{r.lLabel}</td>
                <td style={{ width: "2%", padding: "1px 0", textAlign: "center", verticalAlign: "top" }}>:</td>
                <td style={{ width: "28%", padding: "1px 4px 1px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{r.lVal}</td>
                <td style={{ width: "20%", padding: "1px 2px", fontWeight: "bold", verticalAlign: "top" }}>{r.rLabel}</td>
                <td style={{ width: "2%", padding: "1px 0", textAlign: "center", verticalAlign: "top" }}>:</td>
                <td style={{ width: "28%", padding: "1px 2px", verticalAlign: "top", wordBreak: "break-word", fontWeight: "bold" }}>{r.rVal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    // General / Cash Bill Fields:
    const genRows = [
      {
        lLabel: "BILL NO",
        lVal: <span style={{ fontWeight: "bold" }}>{String(bill.bill_no || bill.estimate_number || "—").toUpperCase()}</span>,
        rLabel: "BILL DATE",
        rVal: fmtDateStr(bill.bill_date)
      },
      {
        lLabel: "NAME OF PATIENT",
        lVal: <span style={{ fontWeight: "bold" }}>{(pd.patient_name || bill.patient_name || "—").toUpperCase()}{pd.age ? `, ${pd.age} Y` : ""}{pd.gender ? `, ${String(pd.gender).toUpperCase()}` : ""}</span>,
        rLabel: "IP NO",
        rVal: String(bill.ip_number || pd.ip_number || "—").toUpperCase()
      },
      {
        lLabel: "UHID",
        lVal: String(bill.uhid || pd.uhid || "—").toUpperCase(),
        rLabel: "ROOM",
        rVal: String(pd.room_no || pd.roomNo || "GENERAL WARD").toUpperCase()
      },
      {
        lLabel: "ADDRESS",
        lVal: String(pd.address || pd.permanent_address || "—").toUpperCase(),
        rLabel: "DATE OF ADMISSION",
        rVal: fmtDateStr(pd.admission_date || pd.admissionDateTime)
      },
      {
        lLabel: "DOCTOR NAME",
        lVal: String(pd.doctor || pd.admittingDoctorName || pd.admitting_doctor || "DR. ATTENDING PHYSICIAN").toUpperCase(),
        rLabel: "DATE OF DISCHARGE",
        rVal: fmtDateStr(bill.bill_date || pd.discharge_date)
      }
    ];

    return (
      <table style={{
        width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
        fontSize: "0.74rem", lineHeight: "1.35", borderBottom: "1px solid #000",
        paddingBottom: 4, marginBottom: 8, textTransform: "uppercase",
        fontFamily: "'Times New Roman', Times, serif"
      }}>
        <tbody>
          {genRows.map((r, i) => (
            <tr key={i}>
              <td style={{ width: "20%", padding: "1px 2px", fontWeight: "bold", verticalAlign: "top" }}>{r.lLabel}</td>
              <td style={{ width: "2%", padding: "1px 0", textAlign: "center", verticalAlign: "top" }}>:</td>
              <td style={{ width: "28%", padding: "1px 4px 1px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{r.lVal}</td>
              <td style={{ width: "20%", padding: "1px 2px", fontWeight: "bold", verticalAlign: "top" }}>{r.rLabel}</td>
              <td style={{ width: "2%", padding: "1px 0", textAlign: "center", verticalAlign: "top" }}>:</td>
              <td style={{ width: "28%", padding: "1px 2px", verticalAlign: "top", wordBreak: "break-word", fontWeight: "bold" }}>{r.rVal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // ── Reusable Signature Block (Included on Page 1 & Page 2) ────────────────
  const renderSignatures = (pageNo, totalPages) => (
    <div style={{ marginTop: 14 }}>
      <table style={{
        width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
        fontSize: "0.78rem", textTransform: "uppercase", fontFamily: "'Times New Roman', Times, serif"
      }}>
        <tbody>
          <tr>
            {/* LEFT SIDE: Bill Prepared By + Designation */}
            <td style={{ width: "50%", textAlign: "left", verticalAlign: "bottom" }}>
              <div style={{ fontWeight: "bold", fontSize: "0.85rem" }}>
                {effPreparedByName}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#111", fontWeight: "bold", marginTop: 2 }}>
                {effPreparedByDesig}
              </div>
            </td>

            {/* RIGHT SIDE: General Insurance Manager */}
            <td style={{ width: "50%", textAlign: "right", verticalAlign: "bottom" }}>
              <div style={{ fontWeight: "bold", fontSize: "0.85rem" }}>
                {effManagerName}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#111", fontWeight: "bold", marginTop: 2 }}>
                {effManagerDesig}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Page Number (Center of page before line and after signature) */}
      <div style={{
        textAlign: "center", fontWeight: "bold", fontSize: "0.78rem",
        marginTop: 12, marginBottom: 4, textTransform: "uppercase",
        fontFamily: "'Times New Roman', Times, serif"
      }}>
        PAGE : {pageNo} OF {totalPages}
      </div>

      {/* Bottom Footer Line & Exemption */}
      <table style={{
        width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
        borderTop: "1px solid #000", fontSize: "0.68rem", textTransform: "uppercase",
        fontFamily: "'Times New Roman', Times, serif"
      }}>
        <tbody>
          <tr>
            <td style={{ textAlign: "left", fontStyle: "italic", fontSize: "0.65rem", padding: "4px 2px 0", verticalAlign: "middle" }}>
              HEALTH CARE SERVICES PROVIDED BY A CLINICAL ESTABLISHMENT ARE EXEMPT UNDER NOTIFICATION NO. 12/2017-CENTRAL TAX (RATE). THIS IS A GST EXEMPT INVOICE.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div ref={ref} className="print-area" style={{
      width: "100%", maxWidth: "780px", margin: "0 auto", color: "#000",
      fontFamily: "'Times New Roman', Times, serif", padding: "12px 16px", boxSizing: "border-box",
      textTransform: "uppercase"
    }}>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
            @bottom-right {
              content: none;
            }
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
            font-family: 'Times New Roman', Times, serif !important;
            text-transform: uppercase !important;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .bill-page {
            background: #fff !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .bill-page-1 {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            height: auto;
          }
          .letterpad-spacer {
            height: 95px !important;
            min-height: 95px !important;
            display: block !important;
          }
          .bill-page-2 {
            page-break-before: always !important;
            break-before: page !important;
            padding-top: 0 !important;
          }
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
        }
      `}</style>

      {/* ── FORMAT A: OP INSURANCE (CONTINUOUS PRINT OPTION) ── */}
      {isInsurance && insuranceFormat === "OP" ? (
        <div className="bill-page" style={{ background: "#fff", padding: "16px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          {/* Header Block (Optional based on withHeader / physical letterpad) */}
          {renderHeaderBlock()}

          {/* Title Banner */}
          <table style={{
            width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
            borderTop: "2px solid #000", borderBottom: "2px solid #000",
            marginBottom: 8, marginTop: 2, textTransform: "uppercase",
            fontFamily: "'Times New Roman', Times, serif"
          }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", textAlign: "left", fontWeight: "bold", fontSize: "0.82rem", padding: "2px 2px" }}>
                  DISCHARGE BILL - GST EXEMPT
                </td>
                <td style={{ width: "50%", textAlign: "right", fontWeight: "bold", fontSize: "0.82rem", padding: "2px 2px" }}>
                  CREDIT BILL (INSURANCE)
                </td>
              </tr>
            </tbody>
          </table>

          {/* Header Details (Only on First Page) */}
          {renderHeaderDetails()}

          {/* Line by line continuous print */}
          <div style={{ marginTop: 10, marginBottom: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", textTransform: "uppercase", fontFamily: "'Times New Roman', Times, serif" }}>
              <thead>
                <tr style={{
                  borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000",
                  fontWeight: "bold"
                }}>
                  <th style={{ width: "120px", textAlign: "left", padding: "5px 4px" }}>REF / CODE</th>
                  <th style={{ textAlign: "left", padding: "5px 4px" }}>ITEM DESCRIPTION</th>
                  <th style={{ width: "180px", textAlign: "left", padding: "5px 4px" }}>DOCTOR</th>
                  <th style={{ width: "110px", textAlign: "right", padding: "5px 4px" }}>AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                {rawItems.map((it, idx) => {
                  const nabh = getNabhCode(it);
                  const desc = cleanDesc(it);
                  const doc = it.doctor ? (/^dr[.\s]/i.test(it.doctor) ? it.doctor : `DR. ${it.doctor}`) : "—";
                  return (
                    <tr key={idx} style={{ borderBottom: "1px dashed #cbd5e1" }}>
                      <td style={{ padding: "4px 4px", verticalAlign: "top", fontWeight: "bold" }}>{String(nabh).toUpperCase()}</td>
                      <td style={{ padding: "4px 4px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: "bold" }}>{String(it.itemName || it.name || "SERVICE ITEM").toUpperCase()}</div>
                        {desc ? <div style={{ fontSize: "0.70rem", color: "#475569" }}>{String(desc).toUpperCase()}</div> : null}
                      </td>
                      <td style={{ padding: "4px 4px", verticalAlign: "top" }}>{String(doc).toUpperCase()}</td>
                      <td style={{ padding: "4px 4px", verticalAlign: "top", textAlign: "right", fontWeight: "bold" }}>₹{fmt(it.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Total Amount Continuous */}
            <table style={{
              width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
              borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000",
              marginTop: 10, marginBottom: 8, textTransform: "uppercase",
              fontFamily: "'Times New Roman', Times, serif"
            }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: "left", fontWeight: "bold", fontSize: "0.85rem", padding: "6px 4px" }}>
                    TOTAL AMOUNT
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "0.85rem", padding: "6px 4px" }}>
                    ₹{fmt(bill.net_amount || bill.total_amount)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Amount in words */}
            <div style={{
              marginTop: 8, marginBottom: 10, padding: "5px 6px",
              background: "#f8fafc", border: "1px dashed #000",
              fontSize: "0.78rem", fontWeight: "bold", textTransform: "uppercase",
              fontFamily: "'Times New Roman', Times, serif"
            }}>
              RUPEE(S) {numberToWords(bill.net_amount || bill.total_amount).toUpperCase()} ONLY /-
            </div>
          </div>

          {/* Signatures */}
          {renderSignatures(1, 1)}
        </div>
      ) : (
        /* ── STANDARD 2-PAGE DISCHARGE BILL (APPLIES TO BOTH IP & CASH) ── */
        <div>
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ── PAGE 1: OVERALL CHARGES SUMMARY & PATIENT DETAILS ALONE ─────── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <div className="bill-page bill-page-1" style={{
            background: "#fff",
            padding: "16px 20px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
            pageBreakAfter: "always",
            breakAfter: "page"
          }}>
            {/* Header Block (Optional based on withHeader / physical letterpad) */}
            {renderHeaderBlock()}

            {/* Title Banner */}
            <table style={{
              width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
              borderTop: "2px solid #000", borderBottom: "2px solid #000",
              marginBottom: 8, marginTop: 2, textTransform: "uppercase",
              fontFamily: "'Times New Roman', Times, serif"
            }}>
              <tbody>
                <tr>
                  <td style={{ width: "50%", textAlign: "left", fontWeight: "bold", fontSize: "0.82rem", padding: "3px 2px" }}>
                    DISCHARGE BILL - GST EXEMPT
                  </td>
                  <td style={{ width: "50%", textAlign: "right", fontWeight: "bold", fontSize: "0.82rem", padding: "3px 2px" }}>
                    {isInsurance ? "CREDIT BILL (INSURANCE)" : "CASH BILL"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Patient Details (ONLY ON FIRST PAGE) */}
            {renderHeaderDetails()}

            {/* Page 1: Overall Category Summary Table */}
            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <div style={{
                fontWeight: "bold", fontSize: "0.78rem", marginBottom: 4,
                textTransform: "uppercase", borderBottom: "1.5px solid #000", paddingBottom: 2,
                fontFamily: "'Times New Roman', Times, serif"
              }}>
                HOSPITAL CHARGES (OVERALL SUMMARY)
              </div>
              <table style={{
                width: "100%", borderCollapse: "collapse", fontSize: "0.76rem",
                textTransform: "uppercase", fontFamily: "'Times New Roman', Times, serif"
              }}>
                <thead>
                  <tr style={{ borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000", background: "#f8fafc" }}>
                    <th style={{ textAlign: "left", padding: "4px 4px" }}>ITEM DESCRIPTION</th>
                    <th style={{ textAlign: "right", padding: "4px 4px", width: "130px" }}>AMOUNT (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {IP_CATEGORIES.filter(cat => (parseFloat(groupTotals[cat]) || 0) > 0).map((cat, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "3.5px 4px", fontWeight: "bold" }}>
                        {cat}
                      </td>
                      <td style={{ padding: "3.5px 4px", textAlign: "right", fontWeight: "bold" }}>
                        ₹{fmt(groupTotals[cat])}
                      </td>
                    </tr>
                  ))}
                  {!IP_CATEGORIES.some(cat => (parseFloat(groupTotals[cat]) || 0) > 0) && (
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td colSpan={2} style={{ padding: "6px 4px", textAlign: "center", color: "#64748b" }}>
                        NO CHARGES AVAILABLE
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000", marginTop: 6, padding: "4px 0" }}>
                <table style={{
                  width: "100%", borderCollapse: "collapse", fontSize: "0.78rem",
                  textTransform: "uppercase", fontFamily: "'Times New Roman', Times, serif"
                }}>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: "right", padding: "1.5px 6px", fontWeight: "bold" }}>TOTAL HOSPITAL CHARGES :</td>
                      <td style={{ width: "130px", textAlign: "right", padding: "1.5px 4px", fontWeight: "bold" }}>₹{fmt(bill.total_amount)}</td>
                    </tr>
                    {parseFloat(bill.medicines_amount) > 0 && groups["MEDICINE / PHARMACY CHARGES"].length === 0 && (
                      <tr>
                        <td style={{ textAlign: "right", padding: "1.5px 6px", fontWeight: "bold" }}>MEDICINES CHARGES :</td>
                        <td style={{ width: "130px", textAlign: "right", padding: "1.5px 4px", fontWeight: "bold" }}>₹{fmt(bill.medicines_amount)}</td>
                      </tr>
                    )}
                    {parseFloat(bill.gst_amount) > 0 && (
                      <tr>
                        <td style={{ textAlign: "right", padding: "1.5px 6px", fontWeight: "bold" }}>GST :</td>
                        <td style={{ width: "130px", textAlign: "right", padding: "1.5px 4px", fontWeight: "bold" }}>₹{fmt(bill.gst_amount)}</td>
                      </tr>
                    )}
                    {parseFloat(bill.room_tax) > 0 && (
                      <tr>
                        <td style={{ textAlign: "right", padding: "1.5px 6px", fontWeight: "bold" }}>ROOM TAX :</td>
                        <td style={{ width: "130px", textAlign: "right", padding: "1.5px 4px", fontWeight: "bold" }}>₹{fmt(bill.room_tax)}</td>
                      </tr>
                    )}
                    {parseFloat(bill.advance_amount) > 0 && (
                      <tr style={{ color: "#b91c1c" }}>
                        <td style={{ textAlign: "right", padding: "1.5px 6px", fontWeight: "bold" }}>LESS: ADVANCE PAID :</td>
                        <td style={{ width: "130px", textAlign: "right", padding: "1.5px 4px", fontWeight: "bold" }}>-₹{fmt(bill.advance_amount)}</td>
                      </tr>
                    )}
                    {parseFloat(bill.sales_return) > 0 && (
                      <tr style={{ color: "#b91c1c" }}>
                        <td style={{ textAlign: "right", padding: "1.5px 6px", fontWeight: "bold" }}>LESS: SALES RETURN :</td>
                        <td style={{ width: "130px", textAlign: "right", padding: "1.5px 4px", fontWeight: "bold" }}>-₹{fmt(bill.sales_return)}</td>
                      </tr>
                    )}
                    {parseFloat(bill.discount_amount) > 0 && (
                      <tr style={{ color: "#b91c1c" }}>
                        <td style={{ textAlign: "right", padding: "1.5px 6px", fontWeight: "bold" }}>LESS: DISCOUNT :</td>
                        <td style={{ width: "130px", textAlign: "right", padding: "1.5px 4px", fontWeight: "bold" }}>-₹{fmt(bill.discount_amount)}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ textAlign: "right", padding: "4px 6px 1px", fontWeight: "bold", fontSize: "0.86rem", borderTop: "1px dashed #000" }}>
                        {parseFloat(bill.net_amount) < 0 ? "NET AMOUNT (REFUND) :" : "GRAND TOTAL / NET AMOUNT :"}
                      </td>
                      <td style={{
                        width: "130px", textAlign: "right", padding: "4px 4px 1px", fontWeight: "bold", fontSize: "0.86rem",
                        borderTop: "1px dashed #000"
                      }}>
                        ₹{fmt(bill.net_amount || bill.total_amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount in words under Page 1 */}
              <div style={{
                marginTop: 6, marginBottom: 8, padding: "4px 6px",
                background: "#f8fafc", border: "1px dashed #000",
                fontSize: "0.76rem", fontWeight: "bold", textTransform: "uppercase",
                fontFamily: "'Times New Roman', Times, serif"
              }}>
                RUPEE(S) {numberToWords(bill.net_amount || bill.total_amount).toUpperCase()} ONLY /-
              </div>
            </div>

            {/* Page 1 Signatures */}
            {renderSignatures(1, 2)}
          </div>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ── PAGE 2: REMAINING BILLING DETAILS (ITEMIZED BREAKDOWN) ──────── */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <div className="bill-page bill-page-2 page-break" style={{
            background: "#fff",
            padding: "16px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
            pageBreakBefore: "always",
            breakBefore: "page"
          }}>
            {/* Header Block on Page 2 (Header Image or Letterpad Spacer) */}
            {renderHeaderBlock()}

            {/* Header Banner on Page 2 (Compact reference, NO full patient details) */}
            <table style={{
              width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
              borderTop: "2px solid #000", borderBottom: "2px solid #000",
              marginBottom: 8, marginTop: 2, textTransform: "uppercase",
              fontFamily: "'Times New Roman', Times, serif"
            }}>
              <tbody>
                <tr>
                  <td style={{ width: "45%", textAlign: "left", fontWeight: "bold", fontSize: "0.82rem", padding: "3px 2px" }}>
                    DISCHARGE BILL - DETAILED BREAKDOWN
                  </td>
                  <td style={{ width: "55%", textAlign: "right", fontWeight: "bold", fontSize: "0.76rem", padding: "3px 2px" }}>
                    BILL NO: {String(bill.insurance_bill_number || bill.bill_no || bill.estimate_number || "—").toUpperCase()} | UHID: {String(bill.uhid || pd.uhid || "—").toUpperCase()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Column Headers directly at top of Page 2 */}
            <table style={{
              width: "100%", borderCollapse: "collapse", fontSize: "0.76rem",
              textTransform: "uppercase", fontFamily: "'Times New Roman', Times, serif",
              tableLayout: "fixed", marginBottom: 3
            }}>
              <thead>
                <tr style={{ borderTop: "2px solid #000", borderBottom: "2px solid #000", background: "#f8fafc" }}>
                  <th style={{ width: "5%", textAlign: "left", padding: "5px 3px" }}>SL</th>
                  <th style={{ width: "15%", textAlign: "left", padding: "5px 4px" }}>REF / CODE</th>
                  <th style={{ width: "38%", textAlign: "left", padding: "5px 4px" }}>ITEM DESCRIPTION</th>
                  <th style={{ width: "22%", textAlign: "left", padding: "5px 4px" }}>DOCTOR</th>
                  <th style={{ width: "6%", textAlign: "right", padding: "5px 3px" }}>QTY</th>
                  <th style={{ width: "14%", textAlign: "right", padding: "5px 4px" }}>AMOUNT (₹)</th>
                </tr>
              </thead>
            </table>

            {/* Grouped Breakdown */}
            {IP_CATEGORIES.map((groupTitle, gIdx) => {
              const gItems = groups[groupTitle];
              if (!gItems || gItems.length === 0) return null;
              if (!(parseFloat(groupTotals[groupTitle]) > 0)) return null;

              return (
                <div key={gIdx} style={{ marginTop: 8, marginBottom: 10 }}>
                  {/* Category Section Header */}
                  <div style={{
                    background: "#f1f5f9", padding: "4px 6px", fontSize: "0.75rem",
                    fontWeight: "bold", borderLeft: "3px solid #000",
                    marginBottom: 3, textTransform: "uppercase",
                    fontFamily: "'Times New Roman', Times, serif"
                  }}>
                    {groupTitle}
                  </div>

                  {/* Items in this category */}
                  <table style={{
                    width: "100%", borderCollapse: "collapse", fontSize: "0.75rem",
                    tableLayout: "fixed", textTransform: "uppercase",
                    fontFamily: "'Times New Roman', Times, serif"
                  }}>
                    <tbody>
                      {gItems.map((it, idx) => {
                        const nabh = getNabhCode(it);
                        const desc = cleanDesc(it);
                        const doc = it.doctor ? (/^dr[.\s]/i.test(it.doctor) ? it.doctor : `DR. ${it.doctor}`) : "—";
                        const qty = it.quantity || 1;
                        return (
                          <tr key={idx} style={{ borderBottom: "1px dashed #cbd5e1" }}>
                            <td style={{ width: "5%", padding: "3px 3px", verticalAlign: "top" }}>{idx + 1}</td>
                            <td style={{ width: "15%", padding: "3px 4px", verticalAlign: "top", fontWeight: "bold" }}>
                              {String(nabh).toUpperCase()}
                            </td>
                            <td style={{ width: "38%", padding: "3px 4px", verticalAlign: "top", wordBreak: "break-word" }}>
                              <span style={{ fontWeight: "bold" }}>{String(it.itemName || it.name || "SERVICE ITEM").toUpperCase()}</span>
                              {desc ? <div style={{ fontSize: "0.68rem", color: "#555" }}>{String(desc).toUpperCase()}</div> : null}
                            </td>
                            <td style={{ width: "22%", padding: "3px 4px", verticalAlign: "top", wordBreak: "break-word" }}>
                              {String(doc).toUpperCase()}
                            </td>
                            <td style={{ width: "6%", padding: "3px 3px", textAlign: "right", verticalAlign: "top" }}>
                              {qty}
                            </td>
                            <td style={{ width: "14%", padding: "3px 4px", textAlign: "right", verticalAlign: "top", fontWeight: "bold" }}>
                              ₹{fmt(it.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Subtotal for category */}
                  <div style={{
                    display: "flex", justifyContent: "flex-end", gap: 14,
                    padding: "3px 6px", fontSize: "0.73rem", fontWeight: "bold",
                    background: "#f8fafc", textTransform: "uppercase",
                    fontFamily: "'Times New Roman', Times, serif"
                  }}>
                    <span>CATEGORY SUBTOTAL:</span>
                    <span>₹{fmt(groupTotals[groupTitle])}</span>
                  </div>
                </div>
              );
            })}

            {/* Final Total Bottom of Page 2 */}
            <div style={{
              borderTop: "2px solid #000", borderBottom: "2px solid #000",
              padding: "6px 4px", marginTop: 10, display: "flex", justifyContent: "space-between",
              fontWeight: "bold", fontSize: "0.88rem", textTransform: "uppercase",
              fontFamily: "'Times New Roman', Times, serif"
            }}>
              <span>TOTAL ITEMS AMOUNT</span>
              <span>₹{fmt(bill.total_amount)}</span>
            </div>

            {/* Amount in words under Page 2 */}
            <div style={{
              marginTop: 8, marginBottom: 10, padding: "4px 6px",
              background: "#f8fafc", border: "1px dashed #000",
              fontSize: "0.76rem", fontWeight: "bold", textTransform: "uppercase",
              fontFamily: "'Times New Roman', Times, serif"
            }}>
              RUPEE(S) {numberToWords(bill.total_amount || bill.net_amount).toUpperCase()} ONLY /-
            </div>

            {/* Page 2 Signatures */}
            {renderSignatures(2, 2)}
          </div>
        </div>
      )}
    </div>
  );
});

// ── Complete Modal Component ─────────────────────────────────────────────────
const DischargeBillPrintModal = ({ isOpen, bill, onClose }) => {
  const printRef = useRef(null);

  const [insFormat, setInsFormat] = useState("IP");
  const [withHeader, setWithHeader] = useState(true);

  // Dynamic Signatories state (fetched dynamically from backend)
  const [preparedByName, setPreparedByName] = useState("");
  const [preparedByDesig, setPreparedByDesig] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerDesig, setManagerDesig] = useState("GENERAL INSURANCE MANAGER");

  useEffect(() => {
    if (bill) {
      const hasIp = Boolean(bill.ip_number || bill.patient_details?.ip_number || bill.patient_details?.room_no);
      setInsFormat(hasIp ? "IP" : "OP");

      const pName = bill.created_by_name || bill.created_by || "";
      const pDesig = bill.created_by_designation || "";
      const mName = bill.manager_name || "";
      const mDesig = bill.manager_designation || "GENERAL INSURANCE MANAGER";

      setPreparedByName(pName);
      setPreparedByDesig(pDesig);
      setManagerName(mName);
      setManagerDesig(mDesig);

      // Fetch dynamic signatories from backend API to ensure latest profile data
      const fetchSignatories = async () => {
        try {
          const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "/_b_a_c_k_e_n_d/HMS/";
          const res = await apiRequest(`${HmsBaseUrl}discharge-billing/signatories/?created_by=${encodeURIComponent(bill.created_by || "")}`, "GET");
          if (res?.success) {
            const data = res.data?.data || res.data;
            if (data?.prepared_by?.name !== undefined) setPreparedByName(data.prepared_by.name);
            if (data?.prepared_by?.designation !== undefined) setPreparedByDesig(data.prepared_by.designation);
            if (data?.manager?.name !== undefined) setManagerName(data.manager.name);
            if (data?.manager?.designation !== undefined) setManagerDesig(data.manager.designation);
          }
        } catch {
          // keep existing bill values
        }
      };
      fetchSignatories();
    }
  }, [bill]);

  if (!isOpen || !bill) return null;

  const isInsurance = Boolean(
    bill.is_insurance_bill ||
    bill.insurance_bill_number ||
    bill.claim_number ||
    (bill.patient_details?.patient_type && String(bill.patient_details.patient_type).toLowerCase().includes("insurance")) ||
    (bill.patient_details?.company && String(bill.patient_details.company).trim())
  );

  const triggerPrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    if (!printRef.current) return;
    let bodyHtml = printRef.current.innerHTML;

    // Convert images to base64 canvas and constrain width to 580px (fits standard A4 Word page)
    const imgEls = printRef.current.querySelectorAll("img");
    imgEls.forEach(imgEl => {
      if (imgEl && imgEl.src) {
        try {
          const canvas = document.createElement("canvas");
          const origW = imgEl.naturalWidth || imgEl.width || 580;
          const origH = imgEl.naturalHeight || imgEl.height || 65;
          const targetW = 580;
          const targetH = Math.max(30, Math.round((origH / origW) * targetW));
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(imgEl, 0, 0, targetW, targetH);
          const dataUrl = canvas.toDataURL("image/png");
          bodyHtml = bodyHtml.replace(
            imgEl.outerHTML,
            `<img src="${dataUrl}" width="${targetW}" height="${targetH}" style="width:${targetW}px;height:${targetH}px;display:block;margin:0 auto;" />`
          );
        } catch {
          if (imgEl.src.startsWith("/")) {
            bodyHtml = bodyHtml.replace(imgEl.src, `${window.location.origin}${imgEl.src}`);
          }
        }
      }
    });

    // Remove outer container's padding/maxWidth so Word doesn't double-pad
    bodyHtml = bodyHtml.replace(/class="print-area"[^>]*style="[^"]*"/i, 'class="print-area" style="width:100%;margin:0;padding:0;"');

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Discharge Bill - ${bill.insurance_bill_number || bill.bill_no || "Bill"}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 595.35pt 841.95pt; /* A4 Portrait */
      margin: 22.7pt 28.35pt 22.7pt 28.35pt;
      mso-header-margin: 15pt;
      mso-footer-margin: 15pt;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 8.5pt;
      color: #000;
      margin: 0;
      padding: 0;
      text-transform: uppercase;
    }
    table {
      width: 100% !important;
      max-width: 100% !important;
      border-collapse: collapse;
      table-layout: fixed;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      font-family: 'Times New Roman', Times, serif;
      text-transform: uppercase;
    }
    td, th {
      font-family: 'Times New Roman', Times, serif;
      font-size: 7.5pt;
      padding: 1.5px 2px;
      word-wrap: break-word;
      text-transform: uppercase;
    }
    img {
      max-width: 100%;
    }
    .no-print {
      display: none;
    }
    .bill-page-1 {
      page-break-after: always;
      mso-break-type: page-break;
    }
    .bill-page-2, .page-break {
      page-break-before: always;
      mso-break-type: page-break;
    }
  </style>
</head>
<body>
  <div class="Section1">`;
    const footer = `  </div>
</body>
</html>`;
    const fullHtml = header + bodyHtml + footer;

    const blob = new Blob(["\ufeff", fullHtml], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bill_${bill.insurance_bill_number || bill.bill_no || "DischargeBill"}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!printRef.current || !bill) return;
    const element = printRef.current;
    const opt = {
      margin:       [0.2, 0.25, 0.2, 0.25],
      filename:     `Bill_${(bill.insurance_bill_number || bill.bill_no || "DischargeBill").replace(/\//g, "_")}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => {
        if (window.html2pdf) {
          window.html2pdf().set(opt).from(element).save();
        } else {
          window.print();
        }
      };
      document.body.appendChild(script);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <ModalHead className="no-print">
          <ModalTitle>
            🖨️ DISCHARGE BILL PRINT PREVIEW — {bill.insurance_bill_number || bill.bill_no || bill.estimate_number || ""}
          </ModalTitle>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {/* Header toggle buttons: With Header / Without Header */}
            <div style={{ display: "flex", gap: 3, background: "rgba(0,0,0,0.25)", padding: 2, borderRadius: 6 }}>
              <HeadBtn
                type="button"
                $active={withHeader}
                onClick={() => setWithHeader(true)}
                title="Print with Hospital Header Image (for Plain A4 Paper)"
              >
                WITH HEADER
              </HeadBtn>
              <HeadBtn
                type="button"
                $active={!withHeader}
                onClick={() => setWithHeader(false)}
                title="Print without Header (leaves ~95px top space for physical Pre-printed Letterpad)"
              >
                WITHOUT HEADER (LETTERPAD)
              </HeadBtn>
            </div>

            {/* Insurance Format toggle: IP Format vs OP Format */}
            {isInsurance && (
              <div style={{ display: "flex", gap: 3, background: "rgba(0,0,0,0.25)", padding: 2, borderRadius: 6 }}>
                <HeadBtn
                  type="button"
                  $active={insFormat === "IP"}
                  onClick={() => setInsFormat("IP")}
                  title="IP Format: Summary Page + Itemized Detailed Pages"
                >
                  📄 IP FORMAT
                </HeadBtn>
                <HeadBtn
                  type="button"
                  $active={insFormat === "OP"}
                  onClick={() => setInsFormat("OP")}
                  title="OP Format: Continuous Print without table"
                >
                  📄 OP FORMAT
                </HeadBtn>
              </div>
            )}

            <HeadBtn type="button" onClick={handleDownloadWord}>📄 WORD</HeadBtn>
            <HeadBtn type="button" onClick={handleDownloadPDF}>📑 PDF</HeadBtn>
            <HeadBtn type="button" $active onClick={triggerPrint}>🖨️ PRINT</HeadBtn>
            <ModalClose onClick={onClose}>✕</ModalClose>
          </div>
        </ModalHead>
        <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
          <PrintSheet
            ref={printRef}
            bill={bill}
            insuranceFormat={insFormat}
            withHeader={withHeader}
            managerName={managerName}
            managerDesig={managerDesig}
            preparedByName={preparedByName}
            preparedByDesig={preparedByDesig}
          />
        </div>
      </ModalBox>
    </ModalOverlay>
  );
};

export default DischargeBillPrintModal;
