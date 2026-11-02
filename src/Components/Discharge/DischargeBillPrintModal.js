import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import headerImg from "../Images/Header.png";

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

// ── Number to Words in Indian Currency format ─────────────────────────────────
const numberToWords = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "Zero";
  const amount = Number(num);
  const n = Math.floor(Math.abs(amount));
  if (n === 0) return "Zero";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (val) => {
    let str = "";
    if (val > 9999999) {
      str += inWords(Math.floor(val / 10000000)) + " Crore ";
      val %= 10000000;
    }
    if (val > 99999) {
      str += inWords(Math.floor(val / 100000)) + " Lakh ";
      val %= 100000;
    }
    if (val > 999) {
      str += inWords(Math.floor(val / 1000)) + " Thousand ";
      val %= 1000;
    }
    if (val > 99) {
      str += inWords(Math.floor(val / 100)) + " Hundred ";
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
    return `${words} and ${inWords(paise)} Paise`;
  }
  return words;
};

// Item categorization for IP patient format
const categorizeItem = (it) => {
  const text = `${it.itemName || ""} ${it.category || ""} ${it.department || ""} ${it.item_description || ""} ${it.package_name || ""}`.toLowerCase();

  if (/room|ward|nursing|maintenance|accommodation|bed|icu|ccu|day care|stay|admission fee/i.test(text)) {
    return "ACCOMMODATION- TYPE OF WARD PRIVATE/SEMI-PRIVATE/GENERAL/ICU/CCU/DAY";
  }
  if (/consult|doctor visit|physician|round|specialist|opd|indoor/i.test(text)) {
    return "CONSULTATION CHARGES OPD/INDOOR";
  }
  if (/radiolog|x-ray|xray|ct scan|mri|ultrasound|usg|mammogra/i.test(text)) {
    return "RADIOLOGY";
  }
  if (/invest|lab|patholog|scan|ecg|echo|blood|biochem|microbio|urine|test|profile|panel/i.test(text)) {
    return "INVESTIGATIONS";
  }
  if (/medicine|pharmacy|drug|inject|consumable|iv fluid|tablet|capsule|syrup|suture/i.test(text)) {
    return "MEDICINE CHARGES";
  }
  return "SPECIALISED SERVICES";
};

// ── Styled Modal Components ──────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(15,23,42,0.65);
  backdrop-filter: blur(2px); z-index: 10000; display: flex;
  align-items: center; justify-content: center; padding: 16px;
`;

const ModalBox = styled.div`
  background: #fff; border-radius: 12px; width: 100%; max-width: 900px;
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
  display: flex; align-items: center; gap: 8px;
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
  color: #fff;
  &:hover { background: ${props => props.$active ? "#0f766e" : "rgba(255,255,255,0.18)"}; }
`;

// ── Printable Sheet ──────────────────────────────────────────────────────────
export const PrintSheet = React.forwardRef(({ bill, insuranceFormat = "IP" }, ref) => {
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

  // Group items for IP format
  const IP_CATEGORIES = [
    "ACCOMMODATION- TYPE OF WARD PRIVATE/SEMI-PRIVATE/GENERAL/ICU/CCU/DAY",
    "CONSULTATION CHARGES OPD/INDOOR",
    "RADIOLOGY",
    "INVESTIGATIONS",
    "MEDICINE CHARGES",
    "SPECIALISED SERVICES"
  ];

  const groups = {
    "ACCOMMODATION- TYPE OF WARD PRIVATE/SEMI-PRIVATE/GENERAL/ICU/CCU/DAY": [],
    "CONSULTATION CHARGES OPD/INDOOR": [],
    "RADIOLOGY": [],
    "INVESTIGATIONS": [],
    "MEDICINE CHARGES": [],
    "SPECIALISED SERVICES": []
  };

  rawItems.forEach(it => {
    const cat = categorizeItem(it);
    if (groups[cat]) {
      groups[cat].push(it);
    } else {
      groups["SPECIALISED SERVICES"].push(it);
    }
  });

  const medAmt = parseFloat(bill.medicines_amount) || 0;
  if (medAmt > 0 && groups["MEDICINE CHARGES"].length === 0) {
    groups["MEDICINE CHARGES"].push({
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

  // ── Header Details Table (Exact Required Order & Aligned Grid) ───────────
  const renderHeaderDetails = () => {
    if (isInsurance) {
      // 14 Insurance Fields in Exact Required Order:
      // Left 7: Insurance Bill No, Name Of Patient, UHID, Address, ID Card No, Referral No, Doctor Name
      // Right 7: Bill Date, IP No, Room, Date Of Admin, Date Of Discharge, Bill No, Company Name
      const rows = [
        {
          lLabel: "Insurance Bill No",
          lVal: <span style={{ fontWeight: 700, color: "#000" }}>{String(bill.insurance_bill_number || "—").toUpperCase()}</span>,
          rLabel: "Bill Date",
          rVal: fmtDateStr(bill.bill_date)
        },
        {
          lLabel: "Name Of Patient",
          lVal: <span style={{ fontWeight: 600 }}>{(pd.patient_name || bill.patient_name || "—").toUpperCase()}{pd.age ? `, ${pd.age} Y` : ""}{pd.gender ? `, ${String(pd.gender).toUpperCase()}` : ""}</span>,
          rLabel: "IP No",
          rVal: String(bill.ip_number || pd.ip_number || "—").toUpperCase()
        },
        {
          lLabel: "UHID",
          lVal: String(bill.uhid || pd.uhid || "—").toUpperCase(),
          rLabel: "Room",
          rVal: String(pd.room_no || pd.roomNo || "GENERAL WARD").toUpperCase()
        },
        {
          lLabel: "Address",
          lVal: String(pd.address || pd.permanent_address || "—").toUpperCase(),
          rLabel: "Date Of Admin",
          rVal: fmtDateStr(pd.admission_date || pd.admissionDateTime)
        },
        {
          lLabel: "ID Card No",
          lVal: String(bill.id_card_number || pd.id_card_number || pd.card_no || "—").toUpperCase(),
          rLabel: "Date Of Discharge",
          rVal: fmtDateStr(bill.bill_date || pd.discharge_date)
        },
        {
          lLabel: "Referral No",
          lVal: String(bill.claim_number || pd.claim_number || pd.referral_number || "—").toUpperCase(),
          rLabel: "Bill No",
          rVal: String(bill.bill_no || bill.estimate_number || "—").toUpperCase()
        },
        {
          lLabel: "Doctor Name",
          lVal: String(pd.doctor || pd.admittingDoctorName || pd.admitting_doctor || "DR. ATTENDING PHYSICIAN").toUpperCase(),
          rLabel: "Company Name",
          rVal: String(bill.company_name || pd.company || "—").toUpperCase()
        }
      ];

      return (
        <table style={{
          width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
          fontSize: "0.78rem", lineHeight: "1.55", borderBottom: "1.5px solid #000", paddingBottom: 6, marginBottom: 12
        }}>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{ width: "18%", padding: "2px 2px", fontWeight: "bold", verticalAlign: "top" }}>{r.lLabel}</td>
                <td style={{ width: "2%", padding: "2px 0", textAlign: "center", verticalAlign: "top" }}>:</td>
                <td style={{ width: "30%", padding: "2px 6px 2px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{r.lVal}</td>
                <td style={{ width: "18%", padding: "2px 2px", fontWeight: "bold", verticalAlign: "top" }}>{r.rLabel}</td>
                <td style={{ width: "2%", padding: "2px 0", textAlign: "center", verticalAlign: "top" }}>:</td>
                <td style={{ width: "30%", padding: "2px 2px", verticalAlign: "top", wordBreak: "break-word", textTransform: "uppercase", fontWeight: 600 }}>{r.rVal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    // 10 General Fields in Exact Required Order:
    // Left 5: Bill No, Name Of Patient, UHID, Address, Doctor Name
    // Right 5: Bill Date, IP No, Room, Date Of Admin, Date Of Discharge
    const genRows = [
      {
        lLabel: "Bill No",
        lVal: <span style={{ fontWeight: 700 }}>{String(bill.bill_no || bill.estimate_number || "—").toUpperCase()}</span>,
        rLabel: "Bill Date",
        rVal: fmtDateStr(bill.bill_date)
      },
      {
        lLabel: "Name Of Patient",
        lVal: <span style={{ fontWeight: 600 }}>{(pd.patient_name || bill.patient_name || "—").toUpperCase()}{pd.age ? `, ${pd.age} Y` : ""}{pd.gender ? `, ${String(pd.gender).toUpperCase()}` : ""}</span>,
        rLabel: "IP No",
        rVal: String(bill.ip_number || pd.ip_number || "—").toUpperCase()
      },
      {
        lLabel: "UHID",
        lVal: String(bill.uhid || pd.uhid || "—").toUpperCase(),
        rLabel: "Room",
        rVal: String(pd.room_no || pd.roomNo || "GENERAL WARD").toUpperCase()
      },
      {
        lLabel: "Address",
        lVal: String(pd.address || pd.permanent_address || "—").toUpperCase(),
        rLabel: "Date Of Admin",
        rVal: fmtDateStr(pd.admission_date || pd.admissionDateTime)
      },
      {
        lLabel: "Doctor Name",
        lVal: String(pd.doctor || pd.admittingDoctorName || pd.admitting_doctor || "DR. ATTENDING PHYSICIAN").toUpperCase(),
        rLabel: "Date Of Discharge",
        rVal: fmtDateStr(bill.bill_date || pd.discharge_date)
      }
    ];

    return (
      <table style={{
        width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
        fontSize: "0.78rem", lineHeight: "1.55", borderBottom: "1.5px solid #000", paddingBottom: 6, marginBottom: 12
      }}>
        <tbody>
          {genRows.map((r, i) => (
            <tr key={i}>
              <td style={{ width: "18%", padding: "2px 2px", fontWeight: "bold", verticalAlign: "top" }}>{r.lLabel}</td>
              <td style={{ width: "2%", padding: "2px 0", textAlign: "center", verticalAlign: "top" }}>:</td>
              <td style={{ width: "30%", padding: "2px 6px 2px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{r.lVal}</td>
              <td style={{ width: "18%", padding: "2px 2px", fontWeight: "bold", verticalAlign: "top" }}>{r.rLabel}</td>
              <td style={{ width: "2%", padding: "2px 0", textAlign: "center", verticalAlign: "top" }}>:</td>
              <td style={{ width: "30%", padding: "2px 2px", verticalAlign: "top", wordBreak: "break-word", textTransform: "uppercase", fontWeight: 600 }}>{r.rVal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div ref={ref} className="print-area" style={{
      width: "100%", maxWidth: "780px", margin: "0 auto", background: "#fff", color: "#000",
      fontFamily: "'Courier New', Courier, monospace, sans-serif", padding: "20px 24px", boxSizing: "border-box"
    }}>
      <style>{`
        @media print {
          @page {
            size: portrait;
            margin: 8mm 10mm;
            @bottom-right {
              content: "Page " counter(page) " of " counter(pages);
              font-family: 'Courier New', Courier, monospace;
              font-size: 8pt;
              font-weight: bold;
            }
          }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 12px; margin: 0; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; break-before: page; margin-top: 0; padding-top: 0; }
        }
      `}</style>

      {/* ── 1. OP PATIENT BILL FORMAT (Insurance OP Option) ── */}
      {isInsurance && insuranceFormat === "OP" && (
        <div>
          {/* Header Image (Only on First Page) */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <img src={headerImg} alt="Hospital Header" style={{ maxWidth: "100%", height: "auto", maxHeight: "85px" }} />
          </div>

          {/* Title Banner */}
          <table style={{
            width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
            borderTop: "2px solid #000", borderBottom: "2px solid #000",
            marginBottom: 10, marginTop: 4
          }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", textAlign: "left", fontWeight: "bold", fontSize: "0.85rem", padding: "4px 2px" }}>
                  DISCHARGE BILL - GST EXEMPT
                </td>
                <td style={{ width: "50%", textAlign: "right", fontWeight: "bold", fontSize: "0.85rem", padding: "4px 2px" }}>
                  CREDIT BILL (INSURANCE)
                </td>
              </tr>
            </tbody>
          </table>

          {/* Header Details (Only on First Page) */}
          {renderHeaderDetails()}

          {/* OP Line by line continuous print without rigid table borders */}
          <div style={{ marginTop: 14, marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.80rem" }}>
              <thead>
                <tr style={{
                  borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000",
                  fontWeight: "bold"
                }}>
                  <th style={{ width: "120px", textAlign: "left", padding: "6px 4px" }}>REF</th>
                  <th style={{ textAlign: "left", padding: "6px 4px" }}>ITEM DESCRIPTION</th>
                  <th style={{ width: "180px", textAlign: "left", padding: "6px 4px" }}>DOCTOR</th>
                  <th style={{ width: "110px", textAlign: "right", padding: "6px 4px" }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {rawItems.map((it, idx) => {
                  const nabh = getNabhCode(it);
                  const desc = cleanDesc(it);
                  const doc = it.doctor ? (/^dr[.\s]/i.test(it.doctor) ? it.doctor : `Dr. ${it.doctor}`) : "—";
                  return (
                    <tr key={idx} style={{ borderBottom: "1px dashed #e2e8f0" }}>
                      <td style={{ padding: "5px 4px", verticalAlign: "top", fontWeight: 600, textTransform: "uppercase" }}>{String(nabh).toUpperCase()}</td>
                      <td style={{ padding: "5px 4px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600, textTransform: "uppercase" }}>{String(it.itemName || it.name || "SERVICE ITEM").toUpperCase()}</div>
                        {desc ? <div style={{ fontSize: "0.72rem", color: "#475569", textTransform: "uppercase" }}>{String(desc).toUpperCase()}</div> : null}
                      </td>
                      <td style={{ padding: "5px 4px", verticalAlign: "top", color: "#0f766e", textTransform: "uppercase" }}>{String(doc).toUpperCase()}</td>
                      <td style={{ padding: "5px 4px", verticalAlign: "top", textAlign: "right", fontWeight: "bold" }}>₹{fmt(it.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Total Amount Continuous */}
            <table style={{
              width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
              borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000",
              marginTop: 14, marginBottom: 10
            }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: "left", fontWeight: "bold", fontSize: "0.90rem", padding: "8px 4px", textTransform: "uppercase" }}>
                    TOTAL AMOUNT
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "0.90rem", padding: "8px 4px", color: "#15803d" }}>
                    ₹{fmt(bill.net_amount || bill.total_amount)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Amount in words under the bill */}
            <div style={{
              marginTop: 10, marginBottom: 14, padding: "6px 8px",
              background: "#f8fafc", border: "1px dashed #000",
              fontSize: "0.80rem", fontWeight: "bold"
            }}>
              Rupee(s) {numberToWords(bill.net_amount || bill.total_amount)} Only /-
            </div>
          </div>

          {/* Signatures */}
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", marginTop: 36, fontSize: "0.80rem", textTransform: "uppercase" }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", textAlign: "left", verticalAlign: "bottom" }}>
                  <div style={{ fontWeight: "bold" }}>{(bill.created_by_name || bill.created_by || "SHANTHI G").toUpperCase()}</div>
                  <div style={{ fontSize: "0.72rem", color: "#475569" }}>ASST. MANAGER / INSURANCE EXECUTIVE</div>
                </td>
                <td style={{ width: "50%", textAlign: "right", verticalAlign: "bottom" }}>
                  <div style={{ fontWeight: "bold" }}>DR. M.KAUSALYA</div>
                  <div style={{ fontSize: "0.72rem", color: "#475569" }}>GENERAL MANAGER - INSURANCE</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Page Number (Center of page before line and after signature) */}
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "0.82rem", marginTop: 24, marginBottom: 8, textTransform: "uppercase" }}>
            PAGE : 1 OF 1
          </div>

          {/* Bottom Footer Line & Exemption */}
          <table style={{
            width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
            borderTop: "1px solid #ccc", fontSize: "0.74rem"
          }}>
            <tbody>
              <tr>
                <td style={{ textAlign: "left", fontStyle: "italic", fontSize: "0.68rem", padding: "6px 2px 0", verticalAlign: "middle" }}>
                  Health care services provided by a clinical establishment are exempt under Notification No. 12/2017-Central Tax (Rate).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── 2. IP PATIENT BILL FORMAT (Insurance IP Option) ── */}
      {isInsurance && insuranceFormat === "IP" && (
        <div>
          {/* ═════════ PAGE 1: OVERALL SUMMARY ONLY ═════════ */}
          <div>
            {/* Header Image (Only on First Page) */}
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <img src={headerImg} alt="Hospital Header" style={{ maxWidth: "100%", height: "auto", maxHeight: "85px" }} />
            </div>

            {/* Title Banner */}
            <table style={{
              width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
              borderTop: "2px solid #000", borderBottom: "2px solid #000",
              marginBottom: 10, marginTop: 4
            }}>
              <tbody>
                <tr>
                  <td style={{ width: "50%", textAlign: "left", fontWeight: "bold", fontSize: "0.85rem", padding: "4px 2px" }}>
                    DISCHARGE BILL - GST EXEMPT
                  </td>
                  <td style={{ width: "50%", textAlign: "right", fontWeight: "bold", fontSize: "0.85rem", padding: "4px 2px" }}>
                    CREDIT BILL (INSURANCE)
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Header & Patient Details (ONLY on First Page) */}
            {renderHeaderDetails()}

            {/* Page 1: Overall Category Summary Table */}
            <div style={{ marginTop: 14, marginBottom: 18 }}>
              <div style={{ fontWeight: "bold", fontSize: "0.82rem", marginBottom: 6, textTransform: "uppercase" }}>
                HOSPITAL CHARGES (WHERE PACKAGE DEAL RATES ARE NOT SPECIFIED)
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000" }}>
                    <th style={{ textAlign: "left", padding: "7px 6px" }}>ITEM DESCRIPTION</th>
                    <th style={{ textAlign: "right", padding: "7px 6px", width: "130px" }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {IP_CATEGORIES.filter(cat => (parseFloat(groupTotals[cat]) || 0) > 0).map((cat, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: "8px 6px", fontWeight: 600, textTransform: "uppercase" }}>
                        {cat}
                      </td>
                      <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: 700 }}>
                        ₹{fmt(groupTotals[cat])}
                      </td>
                    </tr>
                  ))}
                  {!IP_CATEGORIES.some(cat => (parseFloat(groupTotals[cat]) || 0) > 0) && (
                    <tr style={{ borderBottom: "1px solid #ddd" }}>
                      <td colSpan={2} style={{ padding: "10px 6px", textAlign: "center", color: "#64748b" }}>
                        NO CHARGES AVAILABLE
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000", marginTop: 14, padding: "8px 0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: "right", padding: "2px 8px", fontWeight: 600 }}>TOTAL :</td>
                      <td style={{ width: "130px", textAlign: "right", padding: "2px 4px", fontWeight: 700 }}>₹{fmt(bill.total_amount)}</td>
                    </tr>
                    {parseFloat(bill.advance_amount) > 0 && (
                      <tr style={{ color: "#b91c1c" }}>
                        <td style={{ textAlign: "right", padding: "2px 8px", fontWeight: 600 }}>LESS: ADVANCE PAID :</td>
                        <td style={{ width: "130px", textAlign: "right", padding: "2px 4px", fontWeight: 700 }}>-₹{fmt(bill.advance_amount)}</td>
                      </tr>
                    )}
                    {parseFloat(bill.discount_amount) > 0 && (
                      <tr style={{ color: "#b91c1c" }}>
                        <td style={{ textAlign: "right", padding: "2px 8px", fontWeight: 600 }}>LESS: DISCOUNT :</td>
                        <td style={{ width: "130px", textAlign: "right", padding: "2px 4px", fontWeight: 700 }}>-₹{fmt(bill.discount_amount)}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ textAlign: "right", padding: "6px 8px 2px", fontWeight: "bold", fontSize: "0.92rem", borderTop: "1px dashed #666" }}>
                        GRAND TOTAL :
                      </td>
                      <td style={{
                        width: "130px", textAlign: "right", padding: "6px 4px 2px", fontWeight: "bold", fontSize: "0.92rem",
                        borderTop: "1px dashed #666", color: "#15803d"
                      }}>
                        ₹{fmt(bill.net_amount || bill.total_amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount in words under the bill */}
              <div style={{
                marginTop: 10, marginBottom: 14, padding: "6px 8px",
                background: "#f8fafc", border: "1px dashed #000",
                fontSize: "0.80rem", fontWeight: "bold"
              }}>
                Rupee(s) {numberToWords(bill.net_amount || bill.total_amount)} Only /-
              </div>
            </div>

            {/* Page 1 Signatures */}
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", marginTop: 36, fontSize: "0.80rem", textTransform: "uppercase" }}>
              <tbody>
                <tr>
                  <td style={{ width: "50%", textAlign: "left", verticalAlign: "bottom" }}>
                    <div style={{ fontWeight: "bold" }}>{(bill.created_by_name || bill.created_by || "SHANTHI G").toUpperCase()}</div>
                    <div style={{ fontSize: "0.72rem", color: "#475569" }}>ASST. MANAGER / INSURANCE EXECUTIVE</div>
                  </td>
                  <td style={{ width: "50%", textAlign: "right", verticalAlign: "bottom" }}>
                    <div style={{ fontWeight: "bold" }}>DR. M.KAUSALYA</div>
                    <div style={{ fontSize: "0.72rem", color: "#475569" }}>GENERAL MANAGER - INSURANCE</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Page Number (Center of page before line and after signature) */}
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "0.82rem", marginTop: 24, marginBottom: 8, textTransform: "uppercase" }}>
              PAGE : 1 OF 2
            </div>

            {/* Bottom Footer Line & Exemption */}
            <table style={{
              width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
              borderTop: "1px solid #ccc", fontSize: "0.74rem"
            }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: "left", fontStyle: "italic", fontSize: "0.68rem", padding: "6px 2px 0", verticalAlign: "middle" }}>
                    Health care services provided by a clinical establishment are exempt under Notification No. 12/2017-Central Tax (Rate).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ═════════ PAGE 2: NEXT PAGE (DETAILED BREAKDOWN) ═════════ */}
          <div className="page-break" style={{ paddingTop: 16 }}>
            {/* Header on Page 2 */}
            <table style={{
              width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
              borderTop: "2px solid #000", borderBottom: "2px solid #000",
              marginBottom: 10, marginTop: 4
            }}>
              <tbody>
                <tr>
                  <td style={{ width: "50%", textAlign: "left", fontWeight: "bold", fontSize: "0.85rem", padding: "4px 2px" }}>
                    DISCHARGE BILL - DETAILED BREAKDOWN
                  </td>
                  <td style={{ width: "50%", textAlign: "right", fontWeight: "bold", fontSize: "0.85rem", padding: "4px 2px" }}>
                    {(bill.insurance_bill_number || bill.bill_no || "").toUpperCase()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Column Headers directly at top of Page 2 */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.80rem", marginBottom: 8 }}>
              <thead>
                <tr style={{ borderTop: "2px solid #000", borderBottom: "2px solid #000", background: "#f8fafc" }}>
                  <th style={{ width: "130px", textAlign: "left", padding: "7px 6px" }}>REF</th>
                  <th style={{ textAlign: "left", padding: "7px 6px" }}>ITEM DESCRIPTION</th>
                  <th style={{ width: "120px", textAlign: "right", padding: "7px 6px" }}>AMOUNT</th>
                </tr>
              </thead>
            </table>

            {/* Grouped Breakdown */}
            {IP_CATEGORIES.map((groupTitle, gIdx) => {
              const gItems = groups[groupTitle];
              if (!gItems || gItems.length === 0) return null;
              if (!(parseFloat(groupTotals[groupTitle]) > 0)) return null;

              return (
                <div key={gIdx} style={{ marginTop: 12, marginBottom: 14 }}>
                  {/* Category Section Header */}
                  <div style={{
                    background: "#f1f5f9", padding: "6px 8px", fontSize: "0.78rem",
                    fontWeight: 700, color: "#0f172a", borderLeft: "3px solid #0d9488",
                    marginBottom: 4, textTransform: "uppercase"
                  }}>
                    {groupTitle}
                  </div>

                  {/* Items in this category */}
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                    <tbody>
                      {gItems.map((it, idx) => {
                        const nabh = getNabhCode(it);
                        const desc = cleanDesc(it);
                        const doc = it.doctor ? ` — ${it.doctor}` : "";
                        return (
                          <tr key={idx} style={{ borderBottom: "1px dashed #e2e8f0" }}>
                            <td style={{ width: "130px", padding: "4px 6px", verticalAlign: "top", fontWeight: 600, color: "#334155", textTransform: "uppercase" }}>
                              {String(nabh).toUpperCase()}
                            </td>
                            <td style={{ padding: "4px 6px", verticalAlign: "top" }}>
                              <span style={{ fontWeight: 600, textTransform: "uppercase" }}>{String(it.itemName || it.name || "ITEM").toUpperCase()}</span>
                              {doc ? <span style={{ fontSize: "0.74rem", color: "#0f766e", textTransform: "uppercase" }}>{String(doc).toUpperCase()}</span> : null}
                              {desc ? <div style={{ fontSize: "0.71rem", color: "#64748b", textTransform: "uppercase" }}>{String(desc).toUpperCase()}</div> : null}
                            </td>
                            <td style={{ width: "120px", padding: "4px 6px", textAlign: "right", verticalAlign: "top", fontWeight: "bold" }}>
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
                    padding: "4px 8px", fontSize: "0.76rem", fontWeight: 700,
                    color: "#475569", background: "#f8fafc", textTransform: "uppercase"
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
              padding: "8px 6px", marginTop: 16, display: "flex", justifyContent: "space-between",
              fontWeight: "bold", fontSize: "0.92rem", textTransform: "uppercase"
            }}>
              <span>TOTAL ITEMS AMOUNT</span>
              <span style={{ color: "#15803d" }}>₹{fmt(bill.total_amount)}</span>
            </div>

            {/* Amount in words under Page 2 */}
            <div style={{
              marginTop: 10, marginBottom: 14, padding: "6px 8px",
              background: "#f8fafc", border: "1px dashed #000",
              fontSize: "0.80rem", fontWeight: "bold"
            }}>
              Rupee(s) {numberToWords(bill.total_amount || bill.net_amount)} Only /-
            </div>

            {/* Page 2 Signatures */}
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", marginTop: 36, fontSize: "0.80rem", textTransform: "uppercase" }}>
              <tbody>
                <tr>
                  <td style={{ width: "50%", textAlign: "left", verticalAlign: "bottom" }}>
                    <div style={{ fontWeight: "bold" }}>{(bill.created_by_name || bill.created_by || "SHANTHI G").toUpperCase()}</div>
                    <div style={{ fontSize: "0.72rem", color: "#475569" }}>ASST. MANAGER / INSURANCE EXECUTIVE</div>
                  </td>
                  <td style={{ width: "50%", textAlign: "right", verticalAlign: "bottom" }}>
                    <div style={{ fontWeight: "bold" }}>DR. M.KAUSALYA</div>
                    <div style={{ fontSize: "0.72rem", color: "#475569" }}>GENERAL MANAGER - INSURANCE</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Page Number (Center of page before line and after signature) */}
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "0.82rem", marginTop: 24, marginBottom: 8, textTransform: "uppercase" }}>
              PAGE : 2 OF 2
            </div>

            {/* Bottom Footer Line & Exemption */}
            <table style={{
              width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
              borderTop: "1px solid #ccc", fontSize: "0.74rem"
            }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: "left", fontStyle: "italic", fontSize: "0.68rem", padding: "6px 2px 0", verticalAlign: "middle" }}>
                    Health care services provided by a clinical establishment are exempt under Notification No. 12/2017-Central Tax (Rate).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 3. GENERAL PAY PATIENT BILL FORMAT ── */}
      {!isInsurance && (
        <div>
          {/* Header Image (Only on First Page) */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <img src={headerImg} alt="Hospital Header" style={{ maxWidth: "100%", height: "auto", maxHeight: "85px" }} />
          </div>

          {/* Title Banner */}
          <table style={{
            width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
            borderTop: "2px solid #000", borderBottom: "2px solid #000",
            marginBottom: 10, marginTop: 4
          }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", textAlign: "left", fontWeight: "bold", fontSize: "0.85rem", padding: "4px 2px" }}>
                  DISCHARGE BILL - GST EXEMPT
                </td>
                <td style={{ width: "50%", textAlign: "right", fontWeight: "bold", fontSize: "0.85rem", padding: "4px 2px" }}>
                  CASH BILL
                </td>
              </tr>
            </tbody>
          </table>

          {/* Header Details (Only on First Page) */}
          {renderHeaderDetails()}

          {/* Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "0.78rem", marginBottom: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #000", borderTop: "1.5px solid #000" }}>
                <th style={{ textAlign: "left", padding: "6px 2px", width: "5%" }}>SLNO</th>
                <th style={{ textAlign: "left", padding: "6px 2px", width: "13%" }}>NABH CODE</th>
                <th style={{ textAlign: "left", padding: "6px 2px", width: "33%" }}>ITEM DESCRIPTION</th>
                <th style={{ textAlign: "left", padding: "6px 2px", width: "21%" }}>DOCTOR</th>
                <th style={{ textAlign: "right", padding: "6px 2px", width: "8%" }}>QTY</th>
                <th style={{ textAlign: "right", padding: "6px 2px", width: "10%" }}>RATE</th>
                <th style={{ textAlign: "right", padding: "6px 2px", width: "10%" }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {rawItems.map((it, idx) => {
                const nabh = getNabhCode(it);
                const desc = cleanDesc(it);
                return (
                  <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "5px 2px", verticalAlign: "top" }}>{idx + 1}</td>
                    <td style={{ padding: "5px 2px", verticalAlign: "top", fontFamily: "'Courier New', Courier, monospace", textTransform: "uppercase" }}>{String(nabh).toUpperCase()}</td>
                    <td style={{ padding: "5px 2px", verticalAlign: "top", wordBreak: "break-word" }}>
                      <div style={{ fontWeight: 600, textTransform: "uppercase" }}>{String(it.itemName || it.name).toUpperCase()}</div>
                      {desc ? <div style={{ fontSize: "0.72rem", color: "#334155", marginTop: 2, textTransform: "uppercase" }}>{String(desc).toUpperCase()}</div> : null}
                    </td>
                    <td style={{ padding: "5px 2px", verticalAlign: "top", color: "#0f766e", fontWeight: 600, textTransform: "uppercase", wordBreak: "break-word" }}>
                      {String(it.doctor ? (/^dr[.\s]/i.test(it.doctor) ? it.doctor : `Dr. ${it.doctor}`) : "—").toUpperCase()}
                    </td>
                    <td style={{ padding: "5px 2px", textAlign: "right", verticalAlign: "top" }}>{it.quantity || 1}</td>
                    <td style={{ padding: "5px 2px", textAlign: "right", verticalAlign: "top" }}>{fmt(it.rate)}</td>
                    <td style={{ padding: "5px 2px", textAlign: "right", verticalAlign: "top", fontWeight: "bold" }}>{fmt(it.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Summary Totals */}
          <div style={{ borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000", paddingTop: 8, paddingBottom: 8, marginBottom: 14 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: "right", padding: "2px 8px", fontWeight: 600 }}>TOTAL ITEMS AMOUNT :</td>
                  <td style={{ width: "120px", textAlign: "right", padding: "2px 4px", fontWeight: 700 }}>₹{fmt(bill.total_amount)}</td>
                </tr>
                {parseFloat(bill.medicines_amount) > 0 && (
                  <tr>
                    <td style={{ textAlign: "right", padding: "2px 8px", fontWeight: 600 }}>MEDICINES :</td>
                    <td style={{ width: "120px", textAlign: "right", padding: "2px 4px", fontWeight: 700 }}>₹{fmt(bill.medicines_amount)}</td>
                  </tr>
                )}
                {parseFloat(bill.gst_amount) > 0 && (
                  <tr>
                    <td style={{ textAlign: "right", padding: "2px 8px", fontWeight: 600 }}>GST :</td>
                    <td style={{ width: "120px", textAlign: "right", padding: "2px 4px", fontWeight: 700 }}>₹{fmt(bill.gst_amount)}</td>
                  </tr>
                )}
                {parseFloat(bill.advance_amount) > 0 && (
                  <tr style={{ color: "#b91c1c" }}>
                    <td style={{ textAlign: "right", padding: "2px 8px", fontWeight: 600 }}>LESS: ADVANCE PAID :</td>
                    <td style={{ width: "120px", textAlign: "right", padding: "2px 4px", fontWeight: 700 }}>-₹{fmt(bill.advance_amount)}</td>
                  </tr>
                )}
                {parseFloat(bill.sales_return) > 0 && (
                  <tr style={{ color: "#b91c1c" }}>
                    <td style={{ textAlign: "right", padding: "2px 8px", fontWeight: 600 }}>LESS: SALES RETURN :</td>
                    <td style={{ width: "120px", textAlign: "right", padding: "2px 4px", fontWeight: 700 }}>-₹{fmt(bill.sales_return)}</td>
                  </tr>
                )}
                {parseFloat(bill.discount_amount) > 0 && (
                  <tr style={{ color: "#b91c1c" }}>
                    <td style={{ textAlign: "right", padding: "2px 8px", fontWeight: 600 }}>LESS: DISCOUNT :</td>
                    <td style={{ width: "120px", textAlign: "right", padding: "2px 4px", fontWeight: 700 }}>-₹{fmt(bill.discount_amount)}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ textAlign: "right", padding: "6px 8px 2px", fontWeight: "bold", fontSize: "0.92rem", borderTop: "1px dashed #666" }}>
                    {parseFloat(bill.net_amount) < 0 ? "NET AMOUNT (REFUND) :" : "NET AMOUNT :"}
                  </td>
                  <td style={{
                    width: "120px", textAlign: "right", padding: "6px 4px 2px", fontWeight: "bold", fontSize: "0.92rem",
                    borderTop: "1px dashed #666",
                    color: parseFloat(bill.net_amount) < 0 ? "#b91c1c" : "#15803d"
                  }}>
                    ₹{fmt(bill.net_amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount in words under the bill */}
          <div style={{
            marginTop: 10, marginBottom: 14, padding: "6px 8px",
            background: "#f8fafc", border: "1px dashed #000",
            fontSize: "0.80rem", fontWeight: "bold"
          }}>
            Rupee(s) {numberToWords(bill.net_amount || bill.total_amount)} Only /-
          </div>

          {/* Footer Signatures */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 32, fontSize: "0.80rem", textTransform: "uppercase" }}>
            <tbody>
              <tr>
                <td style={{ textAlign: "left", verticalAlign: "bottom" }}>
                  <strong>PREPARED BY :</strong> {(bill.created_by_name || bill.created_by || "CASHIER").toUpperCase()}
                </td>
                <td style={{ textAlign: "right", verticalAlign: "bottom" }}>
                  <strong>SIGNATURE</strong>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Page Number (Center of page before line and after signature) */}
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "0.82rem", marginTop: 24, marginBottom: 8, textTransform: "uppercase" }}>
            PAGE : 1 OF 1
          </div>

          {/* Bottom Footer Line & Exemption */}
          <table style={{
            width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
            borderTop: "1px solid #ccc", fontSize: "0.74rem"
          }}>
            <tbody>
              <tr>
                <td style={{ textAlign: "left", fontStyle: "italic", fontSize: "0.68rem", padding: "6px 2px 0", verticalAlign: "middle" }}>
                  Health care services provided by a clinical establishment are exempt under Notification No. 12/2017-Central Tax (Rate). This is a GST Exempt Invoice.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

// ── Complete Modal Component ─────────────────────────────────────────────────
const DischargeBillPrintModal = ({ isOpen, bill, onClose }) => {
  const printRef = useRef(null);

  const [insFormat, setInsFormat] = useState("IP");

  useEffect(() => {
    if (bill) {
      const hasIp = Boolean(bill.ip_number || bill.patient_details?.ip_number || bill.patient_details?.room_no);
      setInsFormat(hasIp ? "IP" : "OP");
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
          const origH = imgEl.naturalHeight || imgEl.height || 75;
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
      margin: 28.35pt 28.35pt 28.35pt 28.35pt; /* 1.0cm narrow margins */
      mso-header-margin: 20pt;
      mso-footer-margin: 20pt;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 8.5pt;
      color: #000;
      margin: 0;
      padding: 0;
    }
    table {
      width: 100% !important;
      max-width: 100% !important;
      border-collapse: collapse;
      table-layout: fixed;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td, th {
      font-family: 'Courier New', Courier, monospace;
      font-size: 8pt;
      padding: 2px 2px;
      word-wrap: break-word;
      word-break: break-all;
    }
    img {
      max-width: 100%;
    }
    .no-print {
      display: none;
    }
    .page-break {
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
      margin:       [0.25, 0.25, 0.25, 0.25],
      filename:     `Bill_${(bill.insurance_bill_number || bill.bill_no || "DischargeBill").replace(/\//g, "_")}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
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
            🖨️ Discharge Bill Print Preview — {bill.insurance_bill_number || bill.bill_no || bill.estimate_number || ""}
          </ModalTitle>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {isInsurance && (
              <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.25)", padding: 2, borderRadius: 6 }}>
                <HeadBtn
                  type="button"
                  $active={insFormat === "IP"}
                  onClick={() => setInsFormat("IP")}
                  title="IP Format: Summary Page + Itemized Detailed Pages"
                >
                  📄 IP Format
                </HeadBtn>
                <HeadBtn
                  type="button"
                  $active={insFormat === "OP"}
                  onClick={() => setInsFormat("OP")}
                  title="OP Format: Continuous Print without table"
                >
                  📄 OP Format
                </HeadBtn>
              </div>
            )}
            <HeadBtn type="button" onClick={handleDownloadWord}>📄 Word</HeadBtn>
            <HeadBtn type="button" onClick={handleDownloadPDF}>📑 PDF</HeadBtn>
            <HeadBtn type="button" $active onClick={triggerPrint}>🖨️ Print</HeadBtn>
            <ModalClose onClick={onClose}>✕</ModalClose>
          </div>
        </ModalHead>
        <div style={{ padding: 0, overflowY: "auto", flex: 1 }}>
          <PrintSheet ref={printRef} bill={bill} insuranceFormat={insFormat} />
        </div>
      </ModalBox>
    </ModalOverlay>
  );
};

export default DischargeBillPrintModal;
