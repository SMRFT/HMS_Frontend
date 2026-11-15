import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import headerImg from "../Images/Header.png";
import smrftLogo from "../Images/smrft_logo.png";
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

// Item categorization for IP/NABH Insurance format
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

const IP_CATEGORIES = [
  "ACCOMMODATION - TYPE OF WARD PRIVATE/SEMI-PRIVATE/GENERAL/ICU/CCU/DAY CARE",
  "CONSULTATION CHARGES OPD/INDOOR",
  "RADIOLOGY CHARGES",
  "INVESTIGATIONS / LABORATORY CHARGES",
  "MEDICINE / PHARMACY CHARGES",
  "SPECIALISED SERVICES / PROCEDURES / SURGERY"
];

export const isAccommodationItem = (it, groupTitle = "") => {
  if (groupTitle && String(groupTitle).toUpperCase().includes("ACCOMMODATION")) {
    return true;
  }
  const text = `${it?.itemName || it?.name || ""} ${it?.category || ""} ${it?.department || ""} ${it?.item_description || ""} ${it?.package_name || ""} ${it?.source || ""} ${it?.invest_bill_no || ""}`.toLowerCase();
  if (/room|ward|nursing|maintenance|accommodation|bed|icu|ccu|day care|stay|admission fee/i.test(text)) {
    return true;
  }
  if (it?.source === "hospital_room_services" || it?.source === "hospital_room_kits") {
    return true;
  }
  if (it?.invest_bill_no && (String(it.invest_bill_no).startsWith("ROOM-") || String(it.invest_bill_no).startsWith("KIT-"))) {
    return true;
  }
  return false;
};

export const isDoctorDisplayItem = (it) => {
  if (!it) return false;

  // 1. Consultation OPD
  if (it.source === "hospital_billing" || it.bill_type === 5 || it.bill_type === "5") {
    return true;
  }
  const name = String(it.itemName || it.name || "").trim().toLowerCase();
  const desc = String(it.item_description || "").trim().toLowerCase();
  const cat = String(it.category || it.item_type || it.service_type || it.department || "").trim().toLowerCase();

  if (/consult/i.test(name) || /consult/i.test(desc) || /consult/i.test(cat)) {
    return true;
  }

  // 2. Surgery
  if (it.source === "hospital_surgeryschedule" || it.bill_type === 3 || it.bill_type === "3") {
    return true;
  }
  if (it.surgeon_id || it.anaesthetist_id) {
    return true;
  }
  if (Array.isArray(it.doctors) && it.doctors.some(d => d && (d.surgeon_id || d.anaesthetist_id))) {
    return true;
  }
  const pkg = String(it.package_name || "").trim().toLowerCase();
  if (["major", "minor", "super major", "special", "day care surgery"].includes(pkg)) {
    return true;
  }
  if (/surgery|operation|laparotom|perfarat|perforat|appendic|cholecyst|hernia|resection|amputation|mastectomy|craniotomy|arthroplasty|bypass/i.test(name)) {
    return true;
  }
  if (/surgery|operation|ot\b|surgical/i.test(cat) && !/biopsy|lab|invest|pharmacy|diet|laundry|room|rent/i.test(name)) {
    return true;
  }

  return false;
};

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

// ── Formatting Helpers matching Reference Bills (PDF 1 & PDF 2) ───────────────
const formatPatientName = (pd, bill) => {
  const name = pd.patient_name || bill.patient_name || "—";
  const gender = pd.gender ? String(pd.gender).trim().toUpperCase() : "";
  const age = pd.age ? String(pd.age).trim() : "";
  let res = String(name).toUpperCase();
  if (gender && age) {
    res += `, ${gender} ${age}YEARS`;
  } else if (gender) {
    res += `, ${gender}`;
  } else if (age) {
    res += `, ${age}YEARS`;
  }
  return res;
};

const formatGuardian = (pd) => {
  const raw = pd.guardian || pd.guardian_name || pd.spouse_name || pd.father_name || "";
  if (!raw || !String(raw).trim()) return "—";
  const s = String(raw).trim();
  if (/^(w\/o|s\/o|d\/o|c\/o)\b/i.test(s)) {
    return s.toUpperCase();
  }
  const gType = pd.guardian_type || (/female/i.test(pd.gender || "") && (pd.spouse_name || pd.guardian) ? "W/o" : "S/o");
  return `${gType} ${s}`.toUpperCase();
};

export const resolveDocName = (docRaw, doctorsMap = {}) => {
  if (!docRaw || docRaw === "—") return "—";
  let s = String(docRaw).trim();
  if (!s || s.toLowerCase() === "null" || s.toLowerCase() === "undefined" || s === "—") return "—";

  // Check direct lookup in doctorsMap
  if (doctorsMap && doctorsMap[s]) {
    let name = doctorsMap[s].trim();
    if (!/^dr[.\s]/i.test(name)) name = `DR.${name}`;
    return name.toUpperCase();
  }

  // Strip leading DR./DR /Dr. /DR.
  const cleanId = s.replace(/^dr[.\s]*/i, "").trim();
  if (cleanId && doctorsMap && doctorsMap[cleanId]) {
    let name = doctorsMap[cleanId].trim();
    if (!/^dr[.\s]/i.test(name)) name = `DR.${name}`;
    return name.toUpperCase();
  }

  // If cleanId is purely numeric
  if (/^\d+$/.test(cleanId) && doctorsMap) {
    const fromNum = doctorsMap[parseInt(cleanId, 10)];
    if (fromNum) {
      let name = fromNum.trim();
      if (!/^dr[.\s]/i.test(name)) name = `DR.${name}`;
      return name.toUpperCase();
    }
  }

  // Case-insensitive lookup in doctorsMap
  if (doctorsMap && typeof doctorsMap === "object") {
    const lowerClean = cleanId.toLowerCase();
    const lowerS = s.toLowerCase();
    for (const [k, v] of Object.entries(doctorsMap)) {
      if (k.toLowerCase() === lowerClean || k.toLowerCase() === lowerS) {
        let name = String(v).trim();
        if (!/^dr[.\s]/i.test(name)) name = `DR.${name}`;
        return name.toUpperCase();
      }
    }
  }

  // If cleanId is purely digits (employee ID like 50978), never display "DR.50978"
  if (/^\d+$/.test(cleanId)) {
    return "";
  }

  if (!/^dr[.\s]/i.test(s)) {
    s = `DR.${s}`;
  }
  return s.toUpperCase();
};

const formatDoctor = (pd, doctorsMap = {}) => {
  let doc = pd.doctor || pd.doctorName || pd.admittingDoctorName || pd.admitting_doctor || "—";
  if (!doc || doc === "—") return "—";
  return resolveDocName(doc, doctorsMap);
};

const formatDepartment = (pd, bill) => {
  const dept = pd.department || bill.department || "GYNEACOLOGY";
  return String(dept).toUpperCase();
};

// ── Styled Modal Components ──────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(15,23,42,0.65);
  backdrop-filter: blur(2px); z-index: 10000; display: flex;
  align-items: center; justify-content: center; padding: 16px;

  @media print {
    position: static !important;
    inset: auto !important;
    display: block !important;
    background: transparent !important;
    backdrop-filter: none !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    z-index: auto !important;
  }
`;

const ModalBox = styled.div`
  background: #f1f5f9; border-radius: 12px; width: 100%; max-width: 900px;
  max-height: 94vh; display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);

  @media print {
    position: static !important;
    display: block !important;
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    margin: 0 !important;
    padding: 0 !important;
  }
`;

const ModalHead = styled.div`
  background: #1e293b; color: #fff; padding: 12px 18px;
  display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  gap: 12px; flex-wrap: wrap;
`;

const ModalTitle = styled.h3`
  margin: 0; font-size: 0.95rem; font-weight: 700; color: #fff;
  display: flex; align-items: center; gap: 8px; text-transform: uppercase;
  font-family: Arial, Helvetica, sans-serif;
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

// ═════════════════════════════════════════════════════════════════════════════
// ── NORMAL BILL SHEET (EXACT REPLICA OF ATTACHED REFERENCE CASH & CREDIT BILLS)
// ═════════════════════════════════════════════════════════════════════════════
const NormalBillSheet = ({
  bill,
  withHeader = true,
  preparedByName = "",
  doctorsMap = {},
  viewMode = "NORMAL",
  loadedMeds = [],
}) => {
  if (!bill) return null;

  const pd = bill.patient_details || {};
  const rawItems = parseItems(bill.items);

  // Credit vs Cash determination:
  // If payment method is Credit, or company name is present (like RAILWAY CTSE in Ref PDF 2), it's CREDIT BILL
  const isCredit = Boolean(
    (bill.payment_method && String(bill.payment_method).toLowerCase().includes("credit")) ||
    (pd.patient_type && String(pd.patient_type).toLowerCase().includes("credit")) ||
    (bill.company_name && String(bill.company_name).trim()) ||
    (pd.company && String(pd.company).trim()) ||
    bill.is_insurance_bill
  );

  const companyName = String(
    bill.company_name ||
    pd.company ||
    pd.company_code ||
    ""
  ).toUpperCase().trim();

  const medAmt = parseFloat(bill.medicines_amount) || 0;
  const isBreakdown = viewMode === "BREAKDOWN";
  const pharmacyMedicines = (Array.isArray(bill.pharmacy_medicines) && bill.pharmacy_medicines.length > 0)
    ? bill.pharmacy_medicines
    : (Array.isArray(loadedMeds) ? loadedMeds : []);

  const totalMedsSum = pharmacyMedicines.reduce(
    (sum, m) => sum + (parseFloat(m.amount || m.calculated_price) || 0),
    0
  );
  const effectiveMedAmt = medAmt > 0 ? medAmt : totalMedsSum;

  // Build items list
  const displayItems = [];
  rawItems.forEach(it => {
    let name = String(it.itemName || it.name || "SERVICE / PROCEDURE").toUpperCase();
    // In BREAKDOWN mode: when itemized medicines exist, do not show generic summary row "MEDICINE CHARGES"
    if (isBreakdown && pharmacyMedicines.length > 0 && (name.startsWith("MEDICINE CHARGES") || name.startsWith("PHARMACY CHARGES") || name === "MEDICINES")) {
      return;
    }
    let sub = "";
    const showDoctor = isDoctorDisplayItem(it);
    const docField = showDoctor ? (it.doctor || it.doctor_name || "") : "";
    if (docField && String(docField).trim()) {
      const resolved = resolveDocName(docField, doctorsMap);
      if (resolved && resolved !== "—") {
        sub = resolved;
      }
    }
    const cleanD = cleanDesc(it);
    if (cleanD) {
      sub = sub ? `${sub}; ${cleanD.toUpperCase()}` : cleanD.toUpperCase();
    }
    displayItems.push({
      name,
      subDesc: sub,
      qty: it.quantity || 1,
      amount: parseFloat(it.amount) || 0,
    });
  });

  if (isBreakdown) {
    if (pharmacyMedicines.length > 0) {
      pharmacyMedicines.forEach(med => {
        const medName = String(med.itemName || med.item_name || med.name || "PHARMACY MEDICINE").toUpperCase();
        displayItems.push({
          name: medName,
          subDesc: "",
          qty: parseFloat(med.quantity || med.qty || 1),
          amount: parseFloat(med.amount || med.calculated_price || 0),
        });
      });
    } else if (effectiveMedAmt > 0 && !displayItems.some(i => i.name.includes("MEDICINE") || i.name.includes("PHARMACY"))) {
      displayItems.push({
        name: "MEDICINE CHARGES 1",
        subDesc: "",
        qty: 1,
        amount: effectiveMedAmt,
      });
    }
  } else {
    // In STANDARD mode: show consolidated MEDICINE CHARGES 1 row (do not list individual pharmacy items)
    if (effectiveMedAmt > 0 && !displayItems.some(i => i.name.includes("MEDICINE") || i.name.includes("PHARMACY"))) {
      displayItems.push({
        name: "MEDICINE CHARGES 1",
        subDesc: "",
        qty: 1,
        amount: effectiveMedAmt,
      });
    }
  }

  const impAmt = parseFloat(bill.implant_amount) || 0;
  if (impAmt > 0 && !displayItems.some(i => i.name.includes("IMPLANT"))) {
    displayItems.push({
      name: "IMPLANT CHARGES",
      subDesc: "",
      qty: 1,
      amount: impAmt,
    });
  }

  const itemsSum = displayItems.reduce((acc, it) => acc + (it.amount || 0), 0);
  const totalAmt = Math.max(parseFloat(bill.total_amount) || 0, itemsSum);
  const advAmt = parseFloat(bill.advance_amount) || 0;
  const salesReturnAmt = parseFloat(bill.sales_return || bill.salesReturn || bill.ip_return || bill.ipReturn || 0) || 0;
  const discAmt = parseFloat(bill.discount_amount) ||
    parseFloat(bill.total_disc) ||
    parseFloat(bill.discount) ||
    parseFloat(bill.disc_amount) ||
    (parseFloat(bill.discount_percent) > 0 ? (totalAmt * parseFloat(bill.discount_percent) / 100) : 0) ||
    0;
  // Net Amount is ALWAYS Total minus Advance minus Sales Return minus Discount
  const netAmt = totalAmt - advAmt - discAmt - salesReturnAmt;

  const opNumber = String(bill.uhid || pd.uhid || "—").toUpperCase();
  const patientName = formatPatientName(pd, bill);
  const guardian = formatGuardian(pd);
  const address = pd.address || pd.permanent_address || "—";
  const doctor = formatDoctor(pd, doctorsMap);
  const department = formatDepartment(pd, bill);

  const billNo = String(bill.bill_no || bill.bill_number || bill.estimate_number || "—").toUpperCase().replace(/\//g, "");
  const ipNumber = String(bill.ip_number || pd.ip_number || pd.ipNumber || "—").toUpperCase();
  const billDate = fmtDateStr(bill.bill_date || bill.created_date || new Date());
  const doa = fmtDateStr(pd.admission_date || pd.admissionDateTime || pd.doa);
  const dod = fmtDateStr(pd.discharge_date || pd.dischargeDateTime || bill.bill_date || pd.dod);
  const roomNumber = String(pd.room_no || pd.roomNo || pd.bed_no || "—").toUpperCase();
  const billId = String(bill.estimate_number || bill.bill_id || bill.discharge_id || bill.bill_no || "—").toUpperCase();

  // Address lines formatting matching reference
  const addrParts = String(address).split(",").map(p => p.trim()).filter(Boolean);

  return (
    <div className="bill-page" style={{
      background: "#fff",
      padding: "24px 28px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      fontFamily: "Arial, Helvetica, sans-serif",
      color: "#000",
      fontSize: "12px",
      lineHeight: "1.4"
    }}>
      {/* ── TOP HEADER (LOGO + HOSPITAL DETAILS + BILL TYPE) ── */}
      {withHeader ? (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img
              src={smrftLogo}
              alt="Shanmuga Logo"
              style={{ width: 56, height: 56, objectFit: "contain" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div>
              <div style={{ fontSize: "15px", fontWeight: "800", letterSpacing: "0.5px", color: "#111", textTransform: "uppercase" }}>
                SHANMUGA HOSPITAL LIMITED
              </div>
              <div style={{ fontSize: "11.5px", color: "#222", marginTop: 2 }}>
                51/24.Saradha College Road, Salem - 636007
              </div>
              <div style={{ display: "flex", gap: 24, fontSize: "11px", color: "#222", marginTop: 2, flexWrap: "wrap" }}>
                <span>04272706666</span>
                <span>CIN: L85110TZ2020PLC033974</span>
              </div>
              <div style={{ fontSize: "11px", color: "#222" }}>
                GST No: 33ABDCS8326A1ZP
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", alignSelf: "flex-end", paddingBottom: 2 }}>
            <div style={{ fontSize: "15px", fontWeight: "800", letterSpacing: "0.5px", color: "#111", textTransform: "uppercase" }}>
              {isCredit ? "CREDIT BILL" : "CASH BILL"}
            </div>
          </div>
        </div>
      ) : (
        <div className="letterpad-spacer" style={{ height: "95px" }} />
      )}

      {/* Divider Line */}
      <div style={{ borderTop: "1.5px solid #000", margin: "4px 0" }} />

      {/* ── SUBHEADER: DISCHARGE BILL - GST EXEMPT & COMPANY NAME ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: "800",
        fontSize: "12.5px",
        padding: "2px 0",
        letterSpacing: "0.4px",
        textTransform: "uppercase"
      }}>
        <div>{isBreakdown ? "DISCHARGE BILL (BREAKDOWN)" : "DISCHARGE BILL"} &nbsp;&nbsp;-&nbsp;&nbsp; GST EXEMPT</div>
        {isCredit && companyName && (
          <div style={{ fontWeight: "800", letterSpacing: "0.5px" }}>{companyName}</div>
        )}
      </div>

      {/* Divider Line */}
      <div style={{ borderTop: "1px solid #000", margin: "4px 0 6px" }} />

      {/* ── PATIENT & BILL DETAILS (2 COLUMNS WITH ALIGNED COLONS) ── */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24, fontSize: "11.5px", padding: "2px 0" }}>
        {/* Left Column */}
        <div style={{ flex: 1.15, display: "grid", gridTemplateColumns: "88px 12px 1fr", rowGap: 2, alignItems: "baseline" }}>
          <span style={{ fontWeight: "bold" }}>UHID</span><span>:</span><span style={{ fontWeight: "bold" }}>{opNumber}</span>
          <span style={{ fontWeight: "bold" }}>Name</span><span>:</span><span style={{ fontWeight: "bold" }}>{patientName}</span>
          <span style={{ fontWeight: "bold" }}>Guardian</span><span>:</span><span>{guardian}</span>
          <span style={{ fontWeight: "bold" }}>Address</span><span>:</span>
          <div>
            {addrParts.length > 0 ? (
              addrParts.map((p, i) => (
                <div key={i} style={{ textTransform: "uppercase" }}>{p}</div>
              ))
            ) : (
              <span>—</span>
            )}
          </div>
          <span style={{ fontWeight: "bold" }}>Doctor</span><span>:</span><span style={{ fontWeight: "bold" }}>{doctor}</span>
          <span style={{ fontWeight: "bold" }}>Department</span><span>:</span><span>{department}</span>
        </div>

        {/* Right Column */}
        <div style={{ flex: 0.85, display: "grid", gridTemplateColumns: "98px 12px 1fr", rowGap: 2, alignItems: "baseline" }}>
          <span style={{ fontWeight: "bold" }}>SH-Bill No</span><span>:</span><span style={{ fontWeight: "bold" }}>{billNo}</span>
          <span style={{ fontWeight: "bold" }}>IP Number</span><span>:</span><span style={{ fontWeight: "bold" }}>{ipNumber}</span>
          <span style={{ fontWeight: "bold" }}>Billdate</span><span>:</span><span>{billDate}</span>
          <span style={{ fontWeight: "bold" }}>DOA</span><span>:</span><span>{doa}</span>
          <span style={{ fontWeight: "bold" }}>DOD</span><span>:</span><span>{dod}</span>
          <span style={{ fontWeight: "bold" }}>Room Number</span><span>:</span><span>{roomNumber}</span>
        </div>
      </div>

      {/* Divider Line */}
      <div style={{ borderTop: "1px solid #000", margin: "6px 0 4px" }} />

      {/* ── ITEMS TABLE ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px", margin: "4px 0" }}>
        <thead>
          <tr style={{ borderBottom: "1.5px solid #000" }}>
            <th style={{ width: "45px", textAlign: "left", padding: "4px 4px", fontWeight: "bold" }}>Slno</th>
            <th style={{ textAlign: "left", padding: "4px 4px", fontWeight: "bold" }}>Description</th>
            <th style={{ width: "80px", textAlign: "center", padding: "4px 4px", fontWeight: "bold" }}>Quantity</th>
            <th style={{ width: "110px", textAlign: "right", padding: "4px 4px", fontWeight: "bold" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {displayItems.length > 0 ? (
            displayItems.map((it, idx) => (
              <tr key={idx} style={{ verticalAlign: "top" }}>
                <td style={{ padding: "4px 4px" }}>{idx + 1}</td>
                <td style={{ padding: "4px 4px" }}>
                  <div style={{ fontWeight: "bold" }}>{it.name}</div>
                  {it.subDesc ? (
                    <div style={{ fontSize: "10.5px", color: "#222", marginTop: 1 }}>{it.subDesc}</div>
                  ) : null}
                </td>
                <td style={{ padding: "4px 4px", textAlign: "center" }}>{it.qty}</td>
                <td style={{ padding: "4px 4px", textAlign: "right" }}>{it.amount.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "10px", color: "#666" }}>
                NO BILL ITEMS
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Divider Line */}
      <div style={{ borderTop: "1.5px solid #000", margin: "6px 0 4px" }} />

      {/* ── TOTALS (LEFT: IP RETURN, RIGHT: TOTALS TABLE) ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", margin: "4px 0 6px" }}>
        {/* Left Side: IP Return */}
        <div style={{ paddingTop: 2 }}>
          {salesReturnAmt > 0 && (
            <table style={{ borderCollapse: "collapse", fontSize: "12px" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "2px 8px 2px 0", fontWeight: "bold", whiteSpace: "nowrap" }}>
                    IP Return :
                  </td>
                  <td style={{ padding: "2px 0", fontWeight: "bold", minWidth: 60 }}>
                    {Math.round(salesReturnAmt)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Right Side: Totals Table */}
        <table style={{ borderCollapse: "collapse", fontSize: "12px" }}>
          <tbody>
            <tr>
              <td style={{ padding: "2px 16px 2px 0", textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap" }}>
                Total :
              </td>
              <td style={{ padding: "2px 0", textAlign: "right", fontWeight: "bold", minWidth: 90 }}>
                {Math.round(totalAmt)}
              </td>
            </tr>
            {advAmt > 0 && (
              <tr>
                <td style={{ padding: "2px 16px 2px 0", textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  Advance :
                </td>
                <td style={{ padding: "2px 0", textAlign: "right", fontWeight: "bold", minWidth: 90 }}>
                  {Math.round(advAmt)}
                </td>
              </tr>
            )}
            {discAmt > 0 && (
              <tr>
                <td style={{ padding: "2px 16px 2px 0", textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  Discount :
                </td>
                <td style={{ padding: "2px 0", textAlign: "right", fontWeight: "bold", minWidth: 90 }}>
                  {Math.round(discAmt)}
                </td>
              </tr>
            )}
            <tr>
              <td style={{ padding: "3px 16px 3px 0", textAlign: "right", fontWeight: "800", fontSize: "13px", whiteSpace: "nowrap" }}>
                Net Amount :
              </td>
              <td style={{ padding: "3px 0", textAlign: "right", fontWeight: "800", fontSize: "13px", minWidth: 90 }}>
                {fmt(netAmt)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── RUPEES IN WORDS ── */}
      <div style={{
        marginTop: 4,
        marginBottom: 8,
        padding: "5px 8px",
        background: "#f8fafc",
        border: "1px dashed #000",
        fontSize: "11px",
        fontWeight: "bold",
        textTransform: "uppercase"
      }}>
        Rupees in Words : RUPEE(S) {numberToWords(netAmt).toUpperCase()} ONLY /-
      </div>

      {/* Divider Line */}
      <div style={{ borderTop: "1.5px solid #000", margin: "6px 0 16px" }} />

      {/* ── FOOTER: PREPARED BY IN LEFT, SIGNATURE IN RIGHT (MATCHING PHARMACY / REFERENCE) ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        fontSize: "12px",
        padding: "2px 0 16px"
      }}>
        <div style={{ textAlign: "left" }}>
          <span>Prepared By : </span>
          <span style={{ fontWeight: "bold" }}>{preparedByName || "PARS1"}</span>
        </div>
        <div style={{ textAlign: "right", fontWeight: "bold" }}>
          Signature
        </div>
      </div>

      {/* ── GST EXEMPTION DISCLAIMER ── */}
      <div style={{
        fontSize: "10px",
        color: "#222",
        fontStyle: "italic",
        paddingTop: 4,
        textAlign: "left",
        lineHeight: "1.3"
      }}>
        Health care services provided by a clinical establishment are exempt under Notification No. 12/2017-Central Tax (Rate). This is a GST-Exempt Invoice
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ── INSURANCE CLAIM SHEET (NABH DETAILED 2-PAGE IP & OP FORMATS)
// ═════════════════════════════════════════════════════════════════════════════
const InsuranceClaimSheet = ({
  bill,
  insuranceFormat = "IP",
  withHeader = true,
  managerName,
  managerDesig,
  preparedByName,
  preparedByDesig,
  doctorsMap = {},
  viewMode = "INSURANCE_CLAIM",
  loadedMeds = [],
}) => {
  if (!bill) return null;

  const pd = bill.patient_details || {};
  const rawItems = parseItems(bill.items);

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
  const isBreakdown = viewMode === "BREAKDOWN";
  const pharmacyMedicines = (Array.isArray(bill.pharmacy_medicines) && bill.pharmacy_medicines.length > 0)
    ? bill.pharmacy_medicines
    : (Array.isArray(loadedMeds) ? loadedMeds : []);

  if (pharmacyMedicines.length > 0) {
    groups["MEDICINE / PHARMACY CHARGES"] = groups["MEDICINE / PHARMACY CHARGES"].filter(
      i => !String(i.itemName || "").toUpperCase().startsWith("MEDICINE CHARGES") && !String(i.itemName || "").toUpperCase().startsWith("PHARMACY MEDICINE CHARGES")
    );
    pharmacyMedicines.forEach(med => {
      groups["MEDICINE / PHARMACY CHARGES"].push({
        itemName: String(med.itemName || med.item_name || med.name || "PHARMACY MEDICINE").toUpperCase(),
        item_description: "",
        nabh_code: "-",
        doctor: "",
        amount: parseFloat(med.amount || med.calculated_price || 0),
        quantity: parseFloat(med.quantity || med.qty || 1),
        rate: parseFloat(med.rate || med.price || 0),
      });
    });
  } else if (medAmt > 0 && groups["MEDICINE / PHARMACY CHARGES"].length === 0) {
    groups["MEDICINE / PHARMACY CHARGES"].push({
      itemName: "PHARMACY MEDICINE CHARGES",
      nabh_code: "-",
      doctor: "",
      amount: medAmt,
      quantity: 1,
      rate: medAmt
    });
  }

  const impAmt = parseFloat(bill.implant_amount) || 0;
  if (impAmt > 0 && !groups["SPECIALISED SERVICES / PROCEDURES / SURGERY"].some(i => i.itemName && i.itemName.includes("IMPLANT"))) {
    groups["SPECIALISED SERVICES / PROCEDURES / SURGERY"].push({
      itemName: "IMPLANT CHARGES",
      nabh_code: "-",
      doctor: "",
      amount: impAmt,
      quantity: 1,
      rate: impAmt
    });
  }

  const groupTotals = {};
  IP_CATEGORIES.forEach(cat => {
    groupTotals[cat] = (groups[cat] || []).reduce((acc, it) => acc + (parseFloat(it.amount) || 0), 0);
  });

  const effPreparedByName = String(bill.insurance_prepared_by || bill.insurance_prepared_by_name || "SHANTHI GOVINDARAJAN").toUpperCase();
  const effPreparedByDesig = String(bill.insurance_prepared_by_designation || "INSURANCE MANAGER").toUpperCase();
  const effManagerName = String(bill.insurance_manager_name || (managerName && managerName !== "DR.B.KAUSALYA" ? managerName : "DR.B.KAUSALYA")).toUpperCase();
  const effManagerDesig = String(bill.insurance_manager_designation || managerDesig || "GENERAL INSURANCE MANAGER").toUpperCase();

  const renderHeaderBlock = () => (
    withHeader ? (
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <img src={headerImg} alt="HOSPITAL HEADER" style={{ maxWidth: "100%", height: "auto", maxHeight: "65px" }} />
      </div>
    ) : (
      <div className="letterpad-spacer" style={{ height: "95px" }} />
    )
  );

  const renderSignatures = (pageNo, totalPages) => {
    // Only display signatories at the end of the bill (on the final page)
    const isEndOfBill = pageNo === totalPages;

    return (
      <div style={{ marginTop: 14 }}>
        {isEndOfBill && (
          <table style={{
            width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
            fontSize: "0.78rem", textTransform: "uppercase", fontFamily: "'Times New Roman', Times, serif"
          }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", textAlign: "left", verticalAlign: "bottom" }}>
                  <div style={{ fontWeight: "bold", fontSize: "0.85rem" }}>
                    {effPreparedByName}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#111", fontWeight: "bold", marginTop: 2 }}>
                    {effPreparedByDesig}
                  </div>
                </td>
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
        )}

        <div style={{
          textAlign: "center", fontWeight: "bold", fontSize: "0.78rem",
          marginTop: isEndOfBill ? 12 : 6, marginBottom: 4, textTransform: "uppercase",
          fontFamily: "'Times New Roman', Times, serif"
        }}>
          PAGE : {pageNo} OF {totalPages}
        </div>

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
  };

  const renderHeaderDetails = () => {
    const rows = [
      {
        lLabel: "INSURANCE BILL NO",
        lVal: <span style={{ fontWeight: "bold" }}>{String(bill.insurance_bill_number || "—").toUpperCase().replace(/\//g, "")}</span>,
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
        rVal: String(bill.bill_no || bill.estimate_number || "—").toUpperCase().replace(/\//g, "")
      },
      {
        lLabel: "DOCTOR NAME",
        lVal: resolveDocName(pd.doctor || pd.doctorName || pd.admittingDoctorName || pd.admitting_doctor || "DR. ATTENDING PHYSICIAN", doctorsMap),
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
  };

  return (
    <>
      {insuranceFormat === "OP" ? (
        <div className="bill-page" style={{ background: "#fff", padding: "16px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          {renderHeaderBlock()}

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

          {renderHeaderDetails()}

          <div style={{ marginTop: 10, marginBottom: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", textTransform: "uppercase", fontFamily: "'Times New Roman', Times, serif" }}>
              <thead>
                <tr style={{ borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000", fontWeight: "bold" }}>
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
                  const showDoctor = isDoctorDisplayItem(it);
                  const doc = (showDoctor && (it.doctor || it.doctor_name)) ? resolveDocName(it.doctor || it.doctor_name, doctorsMap) : "—";
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

            <div style={{
              marginTop: 8, marginBottom: 10, padding: "5px 6px",
              background: "#f8fafc", border: "1px dashed #000",
              fontSize: "0.78rem", fontWeight: "bold", textTransform: "uppercase",
              fontFamily: "'Times New Roman', Times, serif"
            }}>
              RUPEE(S) {numberToWords(bill.net_amount || bill.total_amount).toUpperCase()} ONLY
            </div>
          </div>

          {renderSignatures(1, 1)}
        </div>
      ) : (
        /* ── 2-PAGE IP NABH INSURANCE BILL ── */
        <div>
          {/* PAGE 1: Overall Summary */}
          <div className="bill-page bill-page-1" style={{
            background: "#fff",
            padding: "16px 20px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
            pageBreakAfter: "always",
            breakAfter: "page"
          }}>
            {renderHeaderBlock()}

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
                    CREDIT BILL (INSURANCE)
                  </td>
                </tr>
              </tbody>
            </table>

            {renderHeaderDetails()}

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
                      <td style={{ padding: "3.5px 4px", fontWeight: "bold" }}>{cat}</td>
                      <td style={{ padding: "3.5px 4px", textAlign: "right", fontWeight: "bold" }}>₹{fmt(groupTotals[cat])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
                    {parseFloat(bill.advance_amount) > 0 && (
                      <tr style={{ color: "#b91c1c" }}>
                        <td style={{ textAlign: "right", padding: "1.5px 6px", fontWeight: "bold" }}>LESS: ADVANCE PAID :</td>
                        <td style={{ width: "130px", textAlign: "right", padding: "1.5px 4px", fontWeight: "bold" }}>-₹{fmt(bill.advance_amount)}</td>
                      </tr>
                    )}
                    {parseFloat(bill.discount_amount) > 0 && (
                      <tr style={{ color: "#b91c1c" }}>
                        <td style={{ textAlign: "right", padding: "1.5px 6px", fontWeight: "bold" }}>LESS: DISCOUNT :</td>
                        <td style={{ width: "130px", textAlign: "right", padding: "1.5px 4px", fontWeight: "bold" }}>-₹{fmt(bill.discount_amount)}</td>
                      </tr>
                    )}
                    {parseFloat(bill.sales_return) > 0 && (
                      <tr style={{ color: "#b91c1c" }}>
                        <td style={{ textAlign: "right", padding: "1.5px 6px", fontWeight: "bold" }}>LESS: IP RETURN :</td>
                        <td style={{ width: "130px", textAlign: "right", padding: "1.5px 4px", fontWeight: "bold" }}>-₹{fmt(bill.sales_return)}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ textAlign: "right", padding: "4px 6px 1px", fontWeight: "bold", fontSize: "0.86rem", borderTop: "1px dashed #000" }}>
                        GRAND TOTAL / NET AMOUNT :
                      </td>
                      <td style={{ width: "130px", textAlign: "right", padding: "4px 4px 1px", fontWeight: "bold", fontSize: "0.86rem", borderTop: "1px dashed #000" }}>
                        ₹{fmt(bill.net_amount || bill.total_amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{
                marginTop: 6, marginBottom: 8, padding: "4px 6px",
                background: "#f8fafc", border: "1px dashed #000",
                fontSize: "0.76rem", fontWeight: "bold", textTransform: "uppercase",
                fontFamily: "'Times New Roman', Times, serif"
              }}>
                RUPEE(S) {numberToWords(bill.net_amount || bill.total_amount).toUpperCase()} ONLY
              </div>
            </div>

            {renderSignatures(1, 2)}
          </div>

          {/* PAGE 2: Itemized Breakdown */}
          <div className="bill-page bill-page-2 page-break" style={{
            background: "#fff",
            padding: "16px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
            pageBreakBefore: "always",
            breakBefore: "page"
          }}>
            {renderHeaderBlock()}

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

            {IP_CATEGORIES.map((groupTitle, gIdx) => {
              const gItems = groups[groupTitle];
              if (!gItems || gItems.length === 0) return null;
              if (!(parseFloat(groupTotals[groupTitle]) > 0)) return null;

              return (
                <div key={gIdx} style={{ marginTop: 8, marginBottom: 10 }}>
                  <div style={{
                    background: "#f1f5f9", padding: "4px 6px", fontSize: "0.75rem",
                    fontWeight: "bold", borderLeft: "3px solid #000",
                    marginBottom: 3, textTransform: "uppercase",
                    fontFamily: "'Times New Roman', Times, serif"
                  }}>
                    {groupTitle}
                  </div>

                  <table style={{
                    width: "100%", borderCollapse: "collapse", fontSize: "0.75rem",
                    tableLayout: "fixed", textTransform: "uppercase",
                    fontFamily: "'Times New Roman', Times, serif"
                  }}>
                    <tbody>
                      {gItems.map((it, idx) => {
                        const nabh = getNabhCode(it);
                        const desc = cleanDesc(it);
                        const showDoctor = isDoctorDisplayItem(it);
                        const doc = (showDoctor && (it.doctor || it.doctor_name)) ? resolveDocName(it.doctor || it.doctor_name, doctorsMap) : "—";
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

            <div style={{
              borderTop: "2px solid #000", borderBottom: "2px solid #000",
              padding: "6px 4px", marginTop: 10, display: "flex", justifyContent: "space-between",
              fontWeight: "bold", fontSize: "0.88rem", textTransform: "uppercase",
              fontFamily: "'Times New Roman', Times, serif"
            }}>
              <span>TOTAL ITEMS AMOUNT</span>
              <span>₹{fmt(bill.total_amount)}</span>
            </div>

            <div style={{
              marginTop: 8, marginBottom: 10, padding: "4px 6px",
              background: "#f8fafc", border: "1px dashed #000",
              fontSize: "0.76rem", fontWeight: "bold", textTransform: "uppercase",
              fontFamily: "'Times New Roman', Times, serif"
            }}>
              RUPEE(S) {numberToWords(bill.total_amount || bill.net_amount).toUpperCase()} ONLY
            </div>

            {renderSignatures(2, 2)}
          </div>
        </div>
      )}
    </>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ── MASTER PRINT SHEET (FORWARD REF)
// ═════════════════════════════════════════════════════════════════════════════
export const PrintSheet = React.forwardRef(({
  bill,
  viewMode = "NORMAL",
  insuranceFormat = "IP",
  withHeader = true,
  managerName,
  managerDesig,
  preparedByName,
  preparedByDesig,
  doctorsMap = {},
  loadedMeds = [],
}, ref) => {
  if (!bill) return null;

  return (
    <div ref={ref} className="print-area" style={{
      width: "100%", maxWidth: "780px", margin: "0 auto", color: "#000",
      padding: "12px 16px", boxSizing: "border-box"
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
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          .discharge-modal-overlay {
            position: static !important;
            inset: auto !important;
            display: block !important;
            background: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .discharge-modal-box {
            position: static !important;
            display: block !important;
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .discharge-modal-scroll {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            flex: none !important;
          }
          .print-area, .print-area * {
            visibility: visible !important;
          }
          .print-area {
            position: static !important;
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
            margin-bottom: 0 !important;
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
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
        }
      `}</style>

      {viewMode === "INSURANCE_CLAIM" ? (
        <InsuranceClaimSheet
          bill={bill}
          insuranceFormat={insuranceFormat}
          withHeader={withHeader}
          managerName={managerName}
          managerDesig={managerDesig}
          preparedByName={preparedByName}
          preparedByDesig={preparedByDesig}
          doctorsMap={doctorsMap}
          viewMode={viewMode}
          loadedMeds={loadedMeds}
        />
      ) : (
        <NormalBillSheet
          bill={bill}
          withHeader={withHeader}
          preparedByName={preparedByName}
          doctorsMap={doctorsMap}
          viewMode={viewMode}
          loadedMeds={loadedMeds}
        />
      )}
    </div>
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// ── COMPLETE MODAL COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const DischargeBillPrintModal = ({ isOpen, bill, onClose, defaultViewMode = "NORMAL", doctors = [] }) => {
  const printRef = useRef(null);

  // Is this an insurance bill (i.e. Convert to Insurance Bill was clicked)?
  const isInsurance = Boolean(bill?.is_insurance_bill || bill?.insurance_bill_number);

  // View mode: "NORMAL" (Summary reference bill) vs "BREAKDOWN" (Itemized medicines) vs "INSURANCE_CLAIM" (NABH multi-category format)
  const [viewMode, setViewMode] = useState(defaultViewMode || "NORMAL");
  const [loadedMeds, setLoadedMeds] = useState([]);

  useEffect(() => {
    if (defaultViewMode) {
      setViewMode(defaultViewMode);
    }
  }, [defaultViewMode]);

  useEffect(() => {
    if (bill) {
      if (Array.isArray(bill.pharmacy_medicines) && bill.pharmacy_medicines.length > 0) {
        setLoadedMeds(bill.pharmacy_medicines);
        return;
      }
      const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "/_b_a_c_k_e_n_d/HMS/";
      const billNo = bill.bill_no || bill.bill_number || "";
      const uhid = bill.uhid || (bill.patient_details?.uhid || "");
      const ip = bill.ip_number || (bill.patient_details?.ip_number || "");
      const qs = new URLSearchParams({
        bill_no: billNo,
        uhid: uhid,
        ipNumber: ip,
      }).toString();

      apiRequest(`${HmsBaseUrl}discharge-bill-medicines/?${qs}`, "GET")
        .then(raw => {
          const res = raw?.data || raw;
          const meds = res?.pharmacy_medicines || (Array.isArray(res) ? res : []);
          if (Array.isArray(meds) && meds.length > 0) {
            setLoadedMeds(meds);
          } else {
            const pParam = uhid ? `uhid=${encodeURIComponent(uhid)}` : `ipNumber=${encodeURIComponent(ip)}`;
            return apiRequest(`${HmsBaseUrl}search-discharge-patient/?${pParam}&for_print=true`, "GET");
          }
        })
        .then(rawP => {
          if (!rawP) return;
          const res = rawP?.success && rawP?.data?.success ? rawP.data.data : (rawP?.success ? rawP.data : rawP);
          const meds = res?.pharmacy_medicines || res?.patient?.pharmacy_medicines;
          if (Array.isArray(meds) && meds.length > 0) {
            setLoadedMeds(meds);
          }
        })
        .catch(() => {});
    }
  }, [bill]);

  const [insFormat, setInsFormat] = useState("IP");
  const [withHeader, setWithHeader] = useState(true);

  // Dynamic Signatories state
  const [preparedByName, setPreparedByName] = useState("");
  const [preparedByDesig, setPreparedByDesig] = useState("");
  const [managerName, setManagerName] = useState("DR.B.KAUSALYA");
  const [managerDesig, setManagerDesig] = useState("GENERAL INSURANCE MANAGER");

  // Doctors mapping state (employeeId -> employeeName)
  const [doctorsMap, setDoctorsMap] = useState({});

  useEffect(() => {
    const map = {};
    if (Array.isArray(doctors) && doctors.length > 0) {
      doctors.forEach(d => {
        const id = String(d.employeeId || d.employee_id || d.id || "").trim();
        const name = String(d.employeeName || d.name || d.doctorName || "").trim();
        if (id && name) {
          map[id] = name;
        }
      });
      setDoctorsMap({ ...map });
    }

    const fetchDoctors = async () => {
      try {
        const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "/_b_a_c_k_e_n_d/HMS/";
        const res = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        list.forEach(d => {
          const id = String(d.employeeId || d.employee_id || d.id || "").trim();
          const name = String(d.employeeName || d.name || d.doctorName || "").trim();
          if (id && name) {
            map[id] = name;
          }
        });
        setDoctorsMap({ ...map });
      } catch (e) {
        // Fallback to existing map
      }
    };
    fetchDoctors();
  }, [doctors]);

  useEffect(() => {
    if (bill) {
      // Use the explicitly passed defaultViewMode (from which action was clicked)
      setViewMode(defaultViewMode);

      const hasIp = Boolean(bill.ip_number || bill.patient_details?.ip_number || bill.patient_details?.room_no);
      setInsFormat(hasIp ? "IP" : "OP");

      const pName = bill.created_by_name || bill.created_by || localStorage.getItem("userName") || localStorage.getItem("employeeName") || "PARS1";
      const pDesig = bill.created_by_designation || "";
      const mName = bill.insurance_manager_name || bill.manager_name || "DR.B.KAUSALYA";
      const mDesig = bill.insurance_manager_designation || bill.manager_designation || "GENERAL INSURANCE MANAGER";

      setPreparedByName(pName);
      setPreparedByDesig(pDesig);
      setManagerName(mName);
      setManagerDesig(mDesig);

      // Fetch dynamic signatories from backend API
      const fetchSignatories = async () => {
        try {
          const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "/_b_a_c_k_e_n_d/HMS/";
          const res = await apiRequest(`${HmsBaseUrl}discharge-billing/signatories/?created_by=${encodeURIComponent(bill.created_by || "")}`, "GET");
          if (res?.success) {
            const data = res.data?.data || res.data;
            if (data?.prepared_by?.name !== undefined && data.prepared_by.name) {
              setPreparedByName(data.prepared_by.name);
            }
            if (data?.prepared_by?.designation !== undefined) {
              setPreparedByDesig(data.prepared_by.designation);
            }
            if (data?.manager?.name !== undefined) {
              setManagerName(data.manager.name);
            }
            if (data?.manager?.designation !== undefined) {
              setManagerDesig(data.manager.designation);
            }
          }
        } catch {
          // keep existing values
        }
      };
      fetchSignatories();
    }
  }, [bill, defaultViewMode]);

  if (!isOpen || !bill) return null;

  const triggerPrint = () => {
    if (!printRef.current) return;

    try {
      let iframe = document.getElementById("discharge-print-iframe");
      if (iframe) {
        try { document.body.removeChild(iframe); } catch {}
      }

      iframe = document.createElement("iframe");
      iframe.id = "discharge-print-iframe";
      // Render offscreen with a standard A4 desktop width so layout is computed properly
      iframe.style.position = "fixed";
      iframe.style.left = "-10000px";
      iframe.style.top = "0px";
      iframe.style.width = "794px";
      iframe.style.height = "1123px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      // Clone node and remove any embedded <style> tags so they don't hide iframe contents
      const cloned = printRef.current.cloneNode(true);
      cloned.querySelectorAll("style").forEach(s => s.remove());
      const contentHtml = cloned.innerHTML;

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Discharge Bill - ${bill.insurance_bill_number || bill.bill_no || "Bill"}</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 8mm 10mm;
              }
              *, *::before, *::after {
                box-sizing: border-box;
                visibility: visible !important;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                color: #000 !important;
                visibility: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .print-area {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .bill-page {
                width: 100% !important;
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
                margin-bottom: 0 !important;
              }
              .bill-page-2 {
                page-break-before: always !important;
                break-before: page !important;
                margin-top: 0 !important;
                padding-top: 0 !important;
              }
              .page-break {
                page-break-before: always !important;
                break-before: page !important;
              }
              .letterpad-spacer {
                height: 95px !important;
                min-height: 95px !important;
                display: block !important;
              }
              .no-print {
                display: none !important;
              }
              table {
                border-collapse: collapse;
              }
            </style>
          </head>
          <body>
            <div style="width: 100%; max-width: 780px; margin: 0 auto; color: #000;">
              ${contentHtml}
            </div>
          </body>
        </html>
      `);
      doc.close();

      const imgs = doc.querySelectorAll("img");
      const promises = Array.from(imgs).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
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

  const handleDownloadWord = () => {
    if (!printRef.current) return;
    let bodyHtml = printRef.current.innerHTML;

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
      size: 595.35pt 841.95pt;
      margin: 22.7pt 28.35pt 22.7pt 28.35pt;
      mso-header-margin: 15pt;
      mso-footer-margin: 15pt;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 8.5pt; color: #000; margin: 0; padding: 0; }
    table { width: 100% !important; max-width: 100% !important; border-collapse: collapse; font-family: Arial, Helvetica, sans-serif; }
    td, th { font-family: Arial, Helvetica, sans-serif; font-size: 7.5pt; padding: 2px; }
    img { max-width: 100%; }
    .no-print { display: none; }
    .bill-page-1 { page-break-after: always; mso-break-type: page-break; }
    .bill-page-2, .page-break { page-break-before: always; mso-break-type: page-break; }
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
          triggerPrint();
        }
      };
      document.body.appendChild(script);
    }
  };

  return (
    <ModalOverlay className="discharge-modal-overlay" onClick={onClose}>
      <ModalBox className="discharge-modal-box" onClick={e => e.stopPropagation()}>
        <ModalHead className="no-print">
          <ModalTitle>
            🖨️ DISCHARGE BILL PRINT PREVIEW — {bill.insurance_bill_number || bill.bill_no || bill.estimate_number || ""}
          </ModalTitle>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>

            {/* ── View Mode Switcher: STANDARD vs BREAKDOWN vs INSURANCE ── */}
            <div style={{ display: "flex", gap: 3, background: "rgba(0,0,0,0.25)", padding: 2, borderRadius: 6 }}>
              <HeadBtn
                type="button"
                $active={viewMode === "NORMAL"}
                onClick={() => setViewMode("NORMAL")}
                title="Standard Bill (summary medicine charges)"
              >
                🖨️ STANDARD
              </HeadBtn>
              <HeadBtn
                type="button"
                $active={viewMode === "BREAKDOWN"}
                onClick={() => setViewMode("BREAKDOWN")}
                title="Breakdown Bill (all medicines itemized one by one)"
              >
                📑 BREAKDOWN
              </HeadBtn>
              {(isInsurance || bill.is_insurance_bill || bill.insurance_bill_number) && (
                <HeadBtn
                  type="button"
                  $active={viewMode === "INSURANCE_CLAIM"}
                  onClick={() => setViewMode("INSURANCE_CLAIM")}
                  title="NABH Insurance Claim Format"
                >
                  🛡️ INSURANCE
                </HeadBtn>
              )}
            </div>

            {/* ── INSURANCE toolbar: shown when viewMode is INSURANCE_CLAIM ── */}
            {viewMode === "INSURANCE_CLAIM" ? (
              <>
                {/* Header toggle */}
                <div style={{ display: "flex", gap: 3, background: "rgba(0,0,0,0.25)", padding: 2, borderRadius: 6 }}>
                  <HeadBtn
                    type="button"
                    $active={withHeader}
                    onClick={() => setWithHeader(true)}
                    title="Print with Hospital Header & Logo (for Plain Paper)"
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

                {/* NABH format toggle */}
                <div style={{ display: "flex", gap: 3, background: "rgba(0,0,0,0.25)", padding: 2, borderRadius: 6 }}>
                  <HeadBtn
                    type="button"
                    $active={insFormat === "IP"}
                    onClick={() => setInsFormat("IP")}
                    title="NABH IP Format: Summary Page + Itemized Detailed Pages"
                  >
                    🛡️ NABH IP FORMAT
                  </HeadBtn>
                  <HeadBtn
                    type="button"
                    $active={insFormat === "OP"}
                    onClick={() => setInsFormat("OP")}
                    title="NABH OP Format: Continuous Print"
                  >
                    🛡️ NABH OP FORMAT
                  </HeadBtn>
                </div>

                <HeadBtn type="button" onClick={handleDownloadWord}>📄 WORD</HeadBtn>
                <HeadBtn type="button" onClick={handleDownloadPDF}>📑 PDF</HeadBtn>
                <HeadBtn type="button" $active onClick={triggerPrint}>🖨️ PRINT</HeadBtn>
              </>
            ) : (
              /* ── NORMAL & BREAKDOWN BILL toolbar ── */
              <>
                <HeadBtn type="button" onClick={handleDownloadWord}>📄 WORD</HeadBtn>
                <HeadBtn type="button" onClick={handleDownloadPDF}>📑 PDF</HeadBtn>
                <HeadBtn type="button" $active onClick={triggerPrint}>🖨️ PRINT</HeadBtn>
              </>
            )}

            <ModalClose onClick={onClose}>✕</ModalClose>
          </div>
        </ModalHead>
        <div className="discharge-modal-scroll" style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
          <PrintSheet
            ref={printRef}
            bill={bill}
            viewMode={viewMode}
            insuranceFormat={insFormat}
            withHeader={withHeader}
            managerName={managerName}
            managerDesig={managerDesig}
            preparedByName={preparedByName}
            preparedByDesig={preparedByDesig}
            doctorsMap={doctorsMap}
            loadedMeds={loadedMeds}
          />
        </div>
      </ModalBox>
    </ModalOverlay>
  );
};

export default DischargeBillPrintModal;
