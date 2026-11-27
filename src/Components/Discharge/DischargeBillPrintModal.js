import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import headerImg from "../Images/Header.png";
import smrftLogo from "../Images/smrft_logo.png";
import apiRequest from "../../Auth/apiRequest";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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
  const nabh = String(it?.nabh_code || it?.nabhCode || it?.nabh || it?.code || "").trim().toUpperCase();
  const descNabhMatch = String(it?.item_description || "").match(/NABH:\s*([A-Za-z0-9]+)/i);
  const effNabh = nabh || (descNabhMatch ? descNabhMatch[1].toUpperCase() : "");

  const name = String(it?.itemName || it?.name || "").trim();
  const name_u = name.toUpperCase();
  const desc = String(it?.item_description || "").trim().toUpperCase();
  const cat = String(it?.category || it?.item_type || it?.service_type || "").trim().toUpperCase();
  const dept = String(it?.department || "").trim().toUpperCase();
  const source = String(it?.source || "").trim().toLowerCase();
  const btype = String(it?.billTypeNo || "").trim().toUpperCase();
  const b_num = it?.bill_type;

  // 1. ACCOMMODATION (Room rent, bed charges, nursing, ICU/CCU)
  // Strict matching with word boundaries to avoid false positives (e.g. "occult" matching "ccu")
  if (
    source === "hospital_room_services" ||
    source === "hospital_room_kits" ||
    String(it?.invest_bill_no || "").startsWith("ROOM-") ||
    String(it?.invest_bill_no || "").startsWith("KIT-") ||
    name_u === "ROOM RENT" ||
    name_u === "BED CHARGES" ||
    name_u === "NURSING CHARGES" ||
    name_u === "ICU CHARGES" ||
    name_u === "CCU CHARGES" ||
    name_u === "ROOM CHARGES" ||
    name_u === "ACCOMMODATION CHARGES" ||
    /\b(room rent|bed charges|nursing charges|icu charges|ccu charges|ward charges|room maintenance|accommodation charge)\b/i.test(name)
  ) {
    return "ACCOMMODATION - TYPE OF WARD PRIVATE/SEMI-PRIVATE/GENERAL/ICU/CCU/DAY CARE";
  }

  // 2. MEDICINE / PHARMACY CHARGES
  // Explicit pharmacy bills and medicine charges (NOT surgical procedures mentioning "consumables" or "medicine")
  if (
    source === "hospital_pharmacybilling" ||
    btype === "PHARM01" ||
    b_num === 13 ||
    b_num === "13" ||
    name_u.startsWith("MEDICINE CHARGES") ||
    name_u.startsWith("PHARMACY CHARGES") ||
    name_u === "MEDICINE BILL" ||
    name_u === "PHARMACY BILL" ||
    name_u === "MEDICINES"
  ) {
    return "MEDICINE / PHARMACY CHARGES";
  }

  // 3. CONSULTATION CHARGES OPD/INDOOR
  if (
    effNabh.startsWith("CN") ||
    source === "hospital_doctorconsultation" ||
    source === "hospital_billing" ||
    b_num === 5 ||
    b_num === "5" ||
    desc.includes("CONSULTATION") ||
    /\b(consult|consultation|doctor visit|physician visit|doctor round|specialist consultation)\b/i.test(name)
  ) {
    return "CONSULTATION CHARGES OPD/INDOOR";
  }

  // 4. RADIOLOGY CHARGES
  if (
    effNabh.startsWith("RI") ||
    desc.includes("RADIOLOGICAL") ||
    desc.includes("RADIOLOGY") ||
    /\b(radiolog|x-ray|xray|ct scan|ct abdomen|ct chest|ct brain|mri|ultrasound|usg|mammogra|opg)\b/i.test(name) ||
    /\b(radiolog|x-ray|xray|ct scan|mri|ultrasound|usg)\b/i.test(dept)
  ) {
    return "RADIOLOGY CHARGES";
  }

  // 5. INVESTIGATIONS / LABORATORY CHARGES
  if (
    effNabh.startsWith("LB") ||
    effNabh.startsWith("CI") ||
    effNabh.startsWith("DI") ||
    effNabh.startsWith("EI") ||
    source === "hospital_investigationbilling" ||
    source === "investigation" ||
    Boolean(it?.invest_bill_no) ||
    desc.includes("INVESTIGATION") ||
    desc.includes("LABORATORY") ||
    /\b(invest|lab|patholog|biochem|microbio|haematolog|culture|serum|blood|glucose|sugar|creatinine|urea|uric|calcium|sodium|potassium|chloride|bicarbonate|bilirubin|sgot|sgpt|alkaline|protein|albumin|globulin|lipid|cholesterol|triglyceride|hdl|ldl|vldl|tsh|t3|t4|thyroid|urine|stool|haemogram|cbc|platelet|wbc|rbc|esr|smear|crp|hba1c|electrolytes|iron|ferritin|tibc|troponin|d-dimer|ecg|echo|audiogram|audiometry|biopsy)\b/i.test(name) ||
    /\b(invest|lab|patholog|biochem|microbio|haematolog)\b/i.test(dept)
  ) {
    return "INVESTIGATIONS / LABORATORY CHARGES";
  }

  // 6. SPECIALISED SERVICES / PROCEDURES / SURGERY
  return "SPECIALISED SERVICES / PROCEDURES / SURGERY";
};

const IP_CATEGORIES = [
  "ACCOMMODATION - TYPE OF WARD PRIVATE/SEMI-PRIVATE/GENERAL/ICU/CCU/DAY CARE",
  "CONSULTATION CHARGES OPD/INDOOR",
  "INVESTIGATIONS / LABORATORY CHARGES",
  "RADIOLOGY CHARGES",
  "MEDICINE / PHARMACY CHARGES",
  "SPECIALISED SERVICES / PROCEDURES / SURGERY"
];

export const isAccommodationItem = (it, groupTitle = "") => {
  if (groupTitle && String(groupTitle).toUpperCase().includes("ACCOMMODATION")) {
    return true;
  }
  const name = String(it?.itemName || it?.name || "").trim();
  const name_u = name.toUpperCase();
  const source = String(it?.source || "").trim().toLowerCase();
  if (
    source === "hospital_room_services" ||
    source === "hospital_room_kits" ||
    String(it?.invest_bill_no || "").startsWith("ROOM-") ||
    String(it?.invest_bill_no || "").startsWith("KIT-") ||
    name_u === "ROOM RENT" ||
    name_u === "BED CHARGES" ||
    name_u === "NURSING CHARGES" ||
    name_u === "ICU CHARGES" ||
    name_u === "CCU CHARGES" ||
    name_u === "ROOM CHARGES" ||
    name_u === "ACCOMMODATION CHARGES" ||
    /\b(room rent|bed charges|nursing charges|icu charges|ccu charges|ward charges|room maintenance|accommodation charge)\b/i.test(name)
  ) {
    return true;
  }
  return false;
};

export const itemSortOrder = (name) => {
  const n = String(name || "").toUpperCase();
  // 1. Room Rent / Accommodation
  if (
    n === "ROOM RENT" || n === "BED CHARGES" || n === "NURSING CHARGES" ||
    n === "ICU CHARGES" || n === "CCU CHARGES" || n === "ROOM CHARGES" ||
    /\b(ROOM RENT|BED CHARGES|NURSING CHARGES|ICU CHARGES|CCU CHARGES|WARD CHARGES|ROOM MAINTENANCE|ACCOMMODATION)\b/.test(n)
  ) return 1;

  // 2. Doctor Consultation
  if (/\b(CONSULT|CONSULTATION|DOCTOR|PHYSICIAN|SPECIALIST|INDOOR|OPD)\b/.test(n)) return 2;

  // 3. Investigation Charges (Laboratory + Radiology)
  if (/\b(INVEST|LAB|RADIOL|X-RAY|XRAY|CT SCAN|CT ABDOMEN|CT CHEST|CT BRAIN|MRI|ULTRASOUND|USG|MAMMOGRA|OPG|ECG|ECHO|AUDIOGRAM|AUDIOMETRY|BIOPSY|PATHOLOG|BIOCHEM|MICROBIO|HAEMATOLOG|CULTURE|SERUM|BLOOD|GLUCOSE|SUGAR|CREATININE|UREA|URIC|CALCIUM|SODIUM|POTASSIUM|CHLORIDE|BICARBONATE|BILIRUBIN|SGOT|SGPT|ALKALINE|PROTEIN|ALBUMIN|GLOBULIN|LIPID|CHOLESTEROL|TRIGLYCERIDE|HDL|LDL|VLDL|TSH|T3|T4|THYROID|URINE|STOOL|HAEMOGRAM|CBC|PLATELET|WBC|RBC|ESR|SMEAR|CRP|HBA1C|ELECTROLYTES|IRON|FERRITIN|TIBC|TROPONIN|D-DIMER)\b/.test(n)) return 3;

  // 4. Medicine Charges
  if (/\b(MEDICINE|PHARMACY|DRUG|INJECT|IV FLUID|TABLET|CAPSULE|SYRUP|SUTURE)\b/.test(n) || n.startsWith("MEDICINE") || n.startsWith("PHARMACY")) return 4;

  // 5. Specialised Services / Procedures / Surgery / Implants / Others
  return 5;
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

const normalizeRelationshipPrefix = (gType, pd = {}) => {
  const t = String(gType || "").trim().toLowerCase();
  if (t === "w/o" || t === "wife of" || t === "wife") return "W/o";
  if (t === "s/o" || t === "son of" || t === "son") return "S/o";
  if (t === "d/o" || t === "daughter of" || t === "daughter") return "D/o";
  if (t === "f/o" || t === "father of" || t === "father") return "F/o";
  if (t === "h/o" || t === "husband of" || t === "husband" || t === "spouse") return "H/o";
  if (t === "m/o" || t === "mother of" || t === "mother") return "M/o";
  if (t === "c/o" || t === "care of") return "C/o";

  const cleanGender = String(pd.gender || "").trim().toUpperCase();
  const salutation = String(pd.salutation || "").trim().toUpperCase();
  const marital = String(pd.marital_status || pd.maritalStatus || "").trim().toUpperCase();
  const patName = String(pd.patient_name || pd.firstName || pd.name || "").trim().toUpperCase();
  const age = Number(pd.age);

  if (cleanGender.startsWith("F")) {
    if (salutation.includes("MRS") || patName.startsWith("MRS.") || patName.startsWith("MRS ") || marital.includes("MARRIED") || (!isNaN(age) && age >= 21)) {
      return "W/o";
    }
    if (salutation.includes("MS") || salutation.includes("MISS") || (!isNaN(age) && age < 21)) {
      return "D/o";
    }
    return "W/o";
  } else if (cleanGender.startsWith("M")) {
    return "S/o";
  } else {
    if (salutation.includes("MRS") || patName.startsWith("MRS.") || patName.startsWith("MRS ")) return "W/o";
    if (salutation.includes("MR") || patName.startsWith("MR.") || patName.startsWith("MR ")) return "S/o";
    if (salutation.includes("MS") || salutation.includes("MISS")) return "D/o";
    return "W/o";
  }
};

const formatGuardian = (pd) => {
  const raw = pd.guardian || pd.guardian_name || pd.spouse_name || pd.father_name || "";
  if (!raw || !String(raw).trim()) return "—";
  let s = String(raw).trim();
  let gType = pd.guardian_type;
  const prefixMatch = s.match(/^(w\/o|s\/o|d\/o|f\/o|h\/o|m\/o|c\/o|guardian)\s*[:.-]?\s*/i);
  if (prefixMatch) {
    if (!gType || /guardian/i.test(gType)) {
      gType = prefixMatch[1];
    }
    s = s.slice(prefixMatch[0].length).trim();
  }
  const prefix = normalizeRelationshipPrefix(gType, pd);
  return `${prefix} ${s.toUpperCase()}`.trim();
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

const formatDepartment = (pd, bill, deptMap = {}) => {
  let dept = String(pd.department || bill.department || "").trim();
  if (dept && deptMap && deptMap[dept]) {
    dept = deptMap[dept];
  } else if (dept && deptMap && deptMap[dept.toUpperCase()]) {
    dept = deptMap[dept.toUpperCase()];
  }
  if (!dept || dept.toUpperCase().startsWith("DEPT") || dept === "—") {
    const doc = pd.doctor || pd.doctorName || bill.doctor || "";
    if (doc && deptMap && deptMap[doc]) {
      dept = deptMap[doc];
    }
  }
  if (!dept || dept === "—" || dept.toUpperCase().startsWith("DEPT")) {
    dept = "GENERAL";
  }
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
  headerSpacerHeight = 200,
  preparedByName = "",
  doctorsMap = {},
  deptMap = {},
  viewMode = "NORMAL",
  loadedMeds = [],
  paperSize = "A5",
}) => {
  if (!bill) return null;

  const isA5 = paperSize === "A5";
  const pd = bill.patient_details || {};
  const rawItems = parseItems(bill.items);
  // For insurance discharge billing, net amount excludes advance paid and IP return deductions
  const insNetAmount = Math.max(0, (parseFloat(bill.total_amount) || 0) - (parseFloat(bill.discount_amount) || 0));

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
  const hasMedItemInBill = rawItems.some(i => {
    const n = String(i.itemName || i.name || "").toUpperCase();
    return n.startsWith("MEDICINE") || n.startsWith("PHARMACY") || i.billTypeNo === "PHARM01" || i.bill_type === 13;
  });
  const billMeds = Array.isArray(bill.pharmacy_medicines) ? bill.pharmacy_medicines : [];
  const billMedsAreGeneric = billMeds.length > 0 && billMeds.every(m => /^medicine\s+\d+$/i.test(m.itemName || m.name || m.item_name || ""));
  const pharmacyMedicines = (medAmt > 0 || hasMedItemInBill)
    ? ((billMeds.length > 0 && !billMedsAreGeneric)
      ? billMeds
      : ((Array.isArray(loadedMeds) && loadedMeds.length > 0) ? loadedMeds : billMeds))
    : [];

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
    let itAmt = parseFloat(it.amount) || 0;
    if (!isBreakdown && (name.startsWith("MEDICINE CHARGES") || name.startsWith("PHARMACY CHARGES") || name === "MEDICINES")) {
      if (effectiveMedAmt > 0) {
        itAmt = effectiveMedAmt;
      }
    }
    displayItems.push({
      name,
      subDesc: sub,
      qty: it.quantity || 1,
      amount: itAmt,
    });
  });

  if (isBreakdown) {
    if (pharmacyMedicines.length > 0) {
      pharmacyMedicines.forEach(med => {
        const medName = String(
          med.itemName ||
          med.item_name ||
          med.name ||
          med.medicine_name ||
          med.drug_name ||
          med.description ||
          "PHARMACY MEDICINE"
        ).toUpperCase();
        displayItems.push({
          name: medName,
          subDesc: med.item_description || (med.batch_number ? `BATCH: ${med.batch_number}` : ""),
          qty: parseFloat(med.quantity || med.qty || 1),
          amount: parseFloat(med.amount || med.calculated_price || 0),
        });
      });
    } else if (effectiveMedAmt > 0 && !displayItems.some(i => i.name.includes("MEDICINE") || i.name.includes("PHARMACY"))) {
      displayItems.push({
        name: "MEDICINE CHARGES",
        subDesc: "",
        qty: 1,
        amount: effectiveMedAmt,
      });
    }
  } else {
    // In STANDARD mode: show consolidated MEDICINE CHARGES row (do not list individual pharmacy items)
    if (effectiveMedAmt > 0 && !displayItems.some(i => i.name.includes("MEDICINE") || i.name.includes("PHARMACY"))) {
      displayItems.push({
        name: "MEDICINE CHARGES",
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

  // Sort displayItems: 1. Consultation, 2. Investigation/Lab/Radiology, 3. Medicine/Pharmacy, 4. Everything else
  displayItems.sort((a, b) => itemSortOrder(a.name) - itemSortOrder(b.name));

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
  const doctor = formatDoctor({ ...pd, doctor: bill.doctor || pd.doctor }, doctorsMap);
  const department = formatDepartment(pd, bill, deptMap);

  const billNo = String(bill.bill_no || bill.bill_number || bill.estimate_number || "—").toUpperCase().replace(/\//g, "");
  const ipNumber = String(bill.ip_number || bill.ipNumber || pd.ip_number || pd.ipNumber || "—").toUpperCase();
  const billDate = fmtDateStr(bill.bill_date || bill.created_date || new Date());
  const doa = fmtDateStr(bill.admission_date || bill.admissionDateTime || pd.admission_date || pd.admissionDateTime || pd.doa);
  const dod = fmtDateStr(bill.discharge_date || pd.discharge_date || bill.dischargeDateTime || pd.dischargeDateTime || bill.bill_date || pd.dod);
  const roomNumber = String(bill.room_no || pd.room_no || pd.roomNo || pd.bed_no || "—").toUpperCase();
  const billId = String(bill.estimate_number || bill.bill_id || bill.discharge_id || bill.bill_no || "—").toUpperCase();

  // Address lines formatting matching reference
  const addrParts = String(address).split(",").map(p => p.trim()).filter(Boolean);

  return (
    <div className="bill-page" style={{
      background: "#fff",
      padding: isA5 ? "12px 14px" : "24px 28px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      fontFamily: "Arial, Helvetica, sans-serif",
      color: "#000",
      fontSize: isA5 ? "10.5px" : "12px",
      lineHeight: isA5 ? "1.3" : "1.4"
    }}>
      {/* ── TOP HEADER (LOGO + HOSPITAL DETAILS + BILL TYPE) ── */}
      {withHeader ? (
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", marginBottom: isA5 ? 6 : 10 }}>
          <tbody>
            <tr>
              <td style={{ width: isA5 ? "52px" : "64px", verticalAlign: "middle", padding: "0 8px 0 0" }}>
                <img
                  src={smrftLogo}
                  alt="Shanmuga Logo"
                  width={isA5 ? 44 : 56}
                  height={isA5 ? 44 : 56}
                  style={{ width: isA5 ? 44 : 56, height: isA5 ? 44 : 56, objectFit: "contain", display: "block" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </td>
              <td style={{ verticalAlign: "top", textAlign: "left" }}>
                <div style={{ fontSize: isA5 ? "13px" : "15px", fontWeight: "800", letterSpacing: "0.5px", color: "#111", textTransform: "uppercase" }}>
                  SHANMUGA HOSPITAL LIMITED
                </div>
                <div style={{ fontSize: isA5 ? "10px" : "11.5px", color: "#222", marginTop: 1 }}>
                  51/24.Saradha College Road, Salem - 636007
                </div>
                <div style={{ fontSize: isA5 ? "9.5px" : "11px", color: "#222", marginTop: 1 }}>
                  04272706666 &nbsp;|&nbsp; CIN: L85110TZ2020PLC033974
                </div>
                <div style={{ fontSize: isA5 ? "9.5px" : "11px", color: "#222" }}>
                  GST No: 33ABDCS8326A1ZP
                </div>
              </td>
              <td style={{ width: isA5 ? "110px" : "140px", verticalAlign: "bottom", textAlign: "right", paddingBottom: 2 }}>
                <div style={{ fontSize: isA5 ? "13px" : "15px", fontWeight: "800", letterSpacing: "0.5px", color: "#111", textTransform: "uppercase" }}>
                  {isCredit ? "CREDIT BILL" : "CASH BILL"}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div className="letterpad-spacer" style={{ height: `${headerSpacerHeight}px`, minHeight: `${headerSpacerHeight}px` }} />
      )}

      {/* Divider Line */}
      <div style={{ borderTop: "1.5px solid #000", margin: isA5 ? "6px 0 4px" : "8px 0 6px" }} />

      {/* ── SUBHEADER: DISCHARGE BILL - GST EXEMPT & COMPANY NAME ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", margin: "2px 0" }}>
        <tbody>
          <tr>
            <td style={{ textAlign: "left", fontWeight: "800", fontSize: isA5 ? "11px" : "12.5px", letterSpacing: "0.4px", textTransform: "uppercase" }}>
              {isBreakdown ? "DISCHARGE BILL (BREAKDOWN)" : "DISCHARGE BILL"} &nbsp;&nbsp;-&nbsp;&nbsp; GST EXEMPT
            </td>
            {isCredit && companyName && (
              <td style={{ textAlign: "right", fontWeight: "800", fontSize: isA5 ? "11px" : "12.5px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                {companyName}
              </td>
            )}
          </tr>
        </tbody>
      </table>

      {/* Divider Line */}
      <div style={{ borderTop: "1px solid #000", margin: "4px 0 6px" }} />

      {/* ── PATIENT & BILL DETAILS (2 COLUMNS WITH ALIGNED COLONS) ── */}
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed",
        fontSize: isA5 ? "10px" : "11.5px",
        margin: "2px 0",
        fontFamily: "Arial, Helvetica, sans-serif"
      }}>
        <tbody>
          <tr>
            <td style={{ width: isA5 ? "16%" : "15%", fontWeight: "bold", padding: "1px 2px", verticalAlign: "top" }}>UHID</td>
            <td style={{ width: "2%", textAlign: "center", padding: "1px 0", verticalAlign: "top" }}>:</td>
            <td style={{ width: isA5 ? "32%" : "33%", fontWeight: "bold", padding: "1px 4px 1px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{opNumber}</td>
            <td style={{ width: isA5 ? "20%" : "18%", fontWeight: "bold", padding: "1px 2px", verticalAlign: "top" }}>SH-Bill No</td>
            <td style={{ width: "2%", textAlign: "center", padding: "1px 0", verticalAlign: "top" }}>:</td>
            <td style={{ width: isA5 ? "28%" : "30%", fontWeight: "bold", padding: "1px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{billNo}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", padding: "1px 2px", verticalAlign: "top" }}>Name</td>
            <td style={{ textAlign: "center", padding: "1px 0", verticalAlign: "top" }}>:</td>
            <td style={{ fontWeight: "bold", padding: "1px 4px 1px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{patientName}</td>
            <td style={{ fontWeight: "bold", padding: "1px 2px", verticalAlign: "top" }}>IP Number</td>
            <td style={{ textAlign: "center", padding: "1px 0", verticalAlign: "top" }}>:</td>
            <td style={{ fontWeight: "bold", padding: "1px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{ipNumber}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", padding: "1px 2px", verticalAlign: "top" }}>Guardian</td>
            <td style={{ textAlign: "center", padding: "1px 0", verticalAlign: "top" }}>:</td>
            <td style={{ padding: "1px 4px 1px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{guardian}</td>
            <td style={{ fontWeight: "bold", padding: "1px 2px", verticalAlign: "top" }}>Billdate</td>
            <td style={{ textAlign: "center", padding: "1px 0", verticalAlign: "top" }}>:</td>
            <td style={{ padding: "1px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{billDate}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", padding: "1px 2px", verticalAlign: "top" }}>Address</td>
            <td style={{ textAlign: "center", padding: "1px 0", verticalAlign: "top" }}>:</td>
            <td style={{ padding: "1px 4px 1px 2px", verticalAlign: "top", wordBreak: "break-word" }}>
              {addrParts.length > 0 ? (
                addrParts.map((p, i) => (
                  <div key={i} style={{ textTransform: "uppercase" }}>{p}</div>
                ))
              ) : (
                <span>—</span>
              )}
            </td>
            <td style={{ fontWeight: "bold", padding: "1px 2px", verticalAlign: "top" }}>DOA</td>
            <td style={{ textAlign: "center", padding: "1px 0", verticalAlign: "top" }}>:</td>
            <td style={{ padding: "1px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{doa}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", padding: "1px 2px", verticalAlign: "top" }}>Doctor</td>
            <td style={{ textAlign: "center", padding: "1px 0", verticalAlign: "top" }}>:</td>
            <td style={{ fontWeight: "bold", padding: "1px 4px 1px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{doctor}</td>
            <td style={{ fontWeight: "bold", padding: "1px 2px", verticalAlign: "top" }}>DOD</td>
            <td style={{ textAlign: "center", padding: "1px 0", verticalAlign: "top" }}>:</td>
            <td style={{ padding: "1px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{dod}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", padding: "1px 2px", verticalAlign: "top" }}>Department</td>
            <td style={{ textAlign: "center", padding: "1px 0", verticalAlign: "top" }}>:</td>
            <td style={{ padding: "1px 4px 1px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{department}</td>
            <td style={{ fontWeight: "bold", padding: "1px 2px", verticalAlign: "top" }}>Room Number</td>
            <td style={{ textAlign: "center", padding: "1px 0", verticalAlign: "top" }}>:</td>
            <td style={{ padding: "1px 2px", verticalAlign: "top", wordBreak: "break-word" }}>{roomNumber}</td>
          </tr>
        </tbody>
      </table>

      {/* Divider Line */}
      <div style={{ borderTop: "1px solid #000", margin: "6px 0 4px" }} />

      {/* ── ITEMS TABLE ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: isA5 ? "10px" : "11.5px", margin: "4px 0" }}>
        <thead>
          <tr style={{ borderBottom: "1.5px solid #000" }}>
            <th style={{ width: isA5 ? "35px" : "45px", textAlign: "left", padding: isA5 ? "2px 3px" : "4px 4px", fontWeight: "bold" }}>Slno</th>
            <th style={{ textAlign: "left", padding: isA5 ? "2px 3px" : "4px 4px", fontWeight: "bold" }}>Description</th>
            <th style={{ width: isA5 ? "65px" : "80px", textAlign: "center", padding: isA5 ? "2px 3px" : "4px 4px", fontWeight: "bold" }}>Quantity</th>
            <th style={{ width: isA5 ? "90px" : "110px", textAlign: "right", padding: isA5 ? "2px 3px" : "4px 4px", fontWeight: "bold" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {displayItems.length > 0 ? (
            displayItems.map((it, idx) => (
              <tr key={idx} style={{ verticalAlign: "top" }}>
                <td style={{ padding: isA5 ? "2.5px 3px" : "4px 4px" }}>{idx + 1}</td>
                <td style={{ padding: isA5 ? "2.5px 3px" : "4px 4px" }}>
                  <div style={{ fontWeight: "bold" }}>{it.name}</div>
                  {it.subDesc ? (
                    <div style={{ fontSize: isA5 ? "9.5px" : "10.5px", color: "#222", marginTop: 1 }}>{it.subDesc}</div>
                  ) : null}
                </td>
                <td style={{ padding: isA5 ? "2.5px 3px" : "4px 4px", textAlign: "center" }}>{it.qty}</td>
                <td style={{ padding: isA5 ? "2.5px 3px" : "4px 4px", textAlign: "right" }}>{it.amount.toFixed(2)}</td>
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

      {/* ── TOTALS (LEFT: DISCOUNT & IP RETURN, RIGHT: TOTALS TABLE) ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", margin: "4px 0 6px" }}>
        <tbody>
          <tr>
            <td style={{ width: "45%", verticalAlign: "top", textAlign: "left", padding: 0 }}>
              {(discAmt > 0 || salesReturnAmt > 0) && (
                <table style={{ borderCollapse: "collapse", fontSize: isA5 ? "10px" : "12px" }}>
                  <tbody>
                    {discAmt > 0 && (
                      <tr>
                        <td style={{ padding: isA5 ? "1.5px 6px 1.5px 0" : "2px 8px 2px 0", fontWeight: "bold", whiteSpace: "nowrap" }}>
                          Discount :
                        </td>
                        <td style={{ padding: isA5 ? "1.5px 0" : "2px 0", fontWeight: "bold", minWidth: 60 }}>
                          {discAmt % 1 === 0 ? discAmt : discAmt.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {salesReturnAmt > 0 && (
                      <tr>
                        <td style={{ padding: isA5 ? "1.5px 6px 1.5px 0" : "2px 8px 2px 0", fontWeight: "bold", whiteSpace: "nowrap" }}>
                          Ipreturn :
                        </td>
                        <td style={{ padding: isA5 ? "1.5px 0" : "2px 0", fontWeight: "bold", minWidth: 60 }}>
                          {salesReturnAmt % 1 === 0 ? salesReturnAmt : salesReturnAmt.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </td>
            <td style={{ width: "55%", verticalAlign: "top", textAlign: "right", padding: 0 }}>
              <table style={{ borderCollapse: "collapse", fontSize: isA5 ? "10px" : "12px", marginLeft: "auto" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: isA5 ? "1.5px 12px 1.5px 0" : "2px 16px 2px 0", textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap" }}>
                      Total :
                    </td>
                    <td style={{ padding: isA5 ? "1.5px 0" : "2px 0", textAlign: "right", fontWeight: "bold", minWidth: 80 }}>
                      {totalAmt % 1 === 0 ? totalAmt : totalAmt.toFixed(2)}
                    </td>
                  </tr>
                  {advAmt > 0 && (
                    <tr>
                      <td style={{ padding: isA5 ? "1.5px 12px 1.5px 0" : "2px 16px 2px 0", textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap" }}>
                        Advance :
                      </td>
                      <td style={{ padding: isA5 ? "1.5px 0" : "2px 0", textAlign: "right", fontWeight: "bold", minWidth: 80 }}>
                        {advAmt % 1 === 0 ? advAmt : advAmt.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{
                      padding: isA5 ? "2px 12px 2px 0" : "3px 16px 3px 0",
                      textAlign: "right",
                      fontWeight: "800",
                      fontSize: isA5 ? "11px" : "13px",
                      whiteSpace: "nowrap",
                      color: netAmt < 0 ? "#b91c1c" : "inherit"
                    }}>
                      {netAmt < 0 ? "Refund Amount :" : "Net Amount :"}
                    </td>
                    <td style={{
                      padding: isA5 ? "2px 0" : "3px 0",
                      textAlign: "right",
                      fontWeight: "800",
                      fontSize: isA5 ? "11px" : "13px",
                      minWidth: 80,
                      color: netAmt < 0 ? "#b91c1c" : "inherit"
                    }}>
                      {fmt(netAmt)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── RUPEES IN WORDS ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", marginTop: 4, marginBottom: 6 }}>
        <tbody>
          <tr>
            <td style={{
              padding: isA5 ? "3px 6px" : "5px 8px",
              background: "#f8fafc",
              border: "1px dashed #000",
              fontSize: isA5 ? "9.5px" : "11px",
              fontWeight: "bold",
              textTransform: "uppercase"
            }}>
              Rupees in Words : RUPEE(S) {numberToWords(netAmt).toUpperCase()} ONLY {netAmt < 0 ? "(REFUND) " : ""}/-
            </td>
          </tr>
        </tbody>
      </table>

      {/* Divider Line */}
      <div style={{ borderTop: "1.5px solid #000", margin: isA5 ? "6px 0 10px" : "6px 0 16px" }} />

      {/* ── FOOTER: PREPARED BY IN LEFT, SIGNATURE IN RIGHT ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", margin: isA5 ? "4px 0 6px" : "8px 0 12px", fontSize: isA5 ? "10.5px" : "12px" }}>
        <tbody>
          <tr>
            <td style={{ width: "60%", textAlign: "left", verticalAlign: "bottom", padding: "2px 0" }}>
              <span>Prepared By : </span>
              <span style={{ fontWeight: "bold" }}>
                {preparedByName || bill.created_by_name || bill.created_by || localStorage.getItem("employeeName") || localStorage.getItem("userName") || "—"}
              </span>
            </td>
            <td style={{ width: "40%", textAlign: "right", verticalAlign: "bottom", fontWeight: "bold", padding: "2px 0" }}>
              Signature
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── GST EXEMPTION DISCLAIMER ── */}
      <div style={{
        fontSize: isA5 ? "8.5px" : "10px",
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
  headerSpacerHeight = 200,
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
  // For insurance discharge billing, net amount excludes advance paid and IP return deductions
  const insNetAmount = Math.max(0, (parseFloat(bill.total_amount) || 0) - (parseFloat(bill.discount_amount) || 0));

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

  // Aggregate duplicate investigation and radiology items into single rows with summed quantity and amount
  ["INVESTIGATIONS / LABORATORY CHARGES", "RADIOLOGY CHARGES"].forEach(catName => {
    if (groups[catName] && groups[catName].length > 1) {
      const aggMap = new Map();
      const newItems = [];
      groups[catName].forEach(it => {
        const rawName = String(it.itemName || it.name || "").trim();
        const key = rawName.toUpperCase();
        const rateVal = parseFloat(it.rate != null ? it.rate : (it.price || 0)) || 0;
        const gKey = `${key}_${rateVal.toFixed(2)}`;
        if (key && aggMap.has(gKey)) {
          const ex = aggMap.get(gKey);
          const q = (parseFloat(ex.quantity) || 1) + (parseFloat(it.quantity) || 1);
          const d = (parseFloat(ex.discount) || 0) + (parseFloat(it.discount) || 0);
          ex.quantity = q;
          ex.discount = d;
          ex.amount = Math.max(0, parseFloat((rateVal * q - d).toFixed(2)));
        } else {
          const clone = { ...it, quantity: parseFloat(it.quantity) || 1, rate: rateVal, discount: parseFloat(it.discount) || 0 };
          clone.amount = it.amount != null ? parseFloat(it.amount) : Math.max(0, parseFloat((rateVal * clone.quantity - clone.discount).toFixed(2)));
          if (key) aggMap.set(gKey, clone);
          newItems.push(clone);
        }
      });
      groups[catName] = newItems;
    }
  });

  const medAmt = parseFloat(bill.medicines_amount) || 0;
  const isBreakdown = viewMode === "BREAKDOWN";
  const hasMedItemInBill = rawItems.some(i => {
    const n = String(i.itemName || i.name || "").toUpperCase();
    return n.startsWith("MEDICINE") || n.startsWith("PHARMACY") || i.billTypeNo === "PHARM01" || i.bill_type === 13;
  });
  const billMeds = Array.isArray(bill.pharmacy_medicines) ? bill.pharmacy_medicines : [];
  const billMedsAreGeneric = billMeds.length > 0 && billMeds.every(m => /^medicine\s+\d+$/i.test(m.itemName || m.name || m.item_name || ""));
  const pharmacyMedicines = (medAmt > 0 || hasMedItemInBill)
    ? ((billMeds.length > 0 && !billMedsAreGeneric)
      ? billMeds
      : ((Array.isArray(loadedMeds) && loadedMeds.length > 0) ? loadedMeds : billMeds))
    : [];

  // Insurance view: consolidated or breakdown based on viewMode
  const isInsBreakdown = viewMode === "INSURANCE_BREAKDOWN";
  if (isInsBreakdown && pharmacyMedicines.length > 0) {
    // INSURANCE BREAKDOWN: completely replace with itemized medicines
    groups["MEDICINE / PHARMACY CHARGES"] = pharmacyMedicines.map(med => ({
      itemName: String(
        med.itemName ||
        med.item_name ||
        med.name ||
        med.medicine_name ||
        med.drug_name ||
        med.description ||
        "PHARMACY MEDICINE"
      ).toUpperCase(),
      item_description: med.item_description || (med.batch_number ? `BATCH: ${med.batch_number}` : ""),
      nabh_code: med.nabh_code || "-",
      doctor: "",
      amount: parseFloat(med.amount || med.calculated_price || 0),
      quantity: parseFloat(med.quantity || med.qty || 1),
      rate: parseFloat(med.rate || med.price || 0),
    }));
  } else {
    // INSURANCE (default): always show ONE consolidated medicine row (no itemised breakdown)
    const existingMedSum = (groups["MEDICINE / PHARMACY CHARGES"] || []).reduce(
      (s, it) => s + (parseFloat(it.amount) || 0), 0
    );
    const totalMedForIns = medAmt > 0
      ? medAmt
      : (pharmacyMedicines.length > 0
        ? pharmacyMedicines.reduce((s, m) => s + (parseFloat(m.amount || m.calculated_price || 0)), 0)
        : existingMedSum);

    // Completely clear out any individual items under MEDICINE / PHARMACY CHARGES!
    groups["MEDICINE / PHARMACY CHARGES"] = [];
    if (totalMedForIns > 0) {
      groups["MEDICINE / PHARMACY CHARGES"].push({
        itemName: "MEDICINE CHARGES",
        nabh_code: "-",
        doctor: "",
        amount: totalMedForIns,
        quantity: 1,
        rate: totalMedForIns,
      });
    }
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

  const effPreparedByName = String(
    preparedByName ||
    bill.created_by_name ||
    bill.created_by ||
    bill.prepared_by_name ||
    bill.prepared_by ||
    bill.insurance_prepared_by_name ||
    bill.insurance_prepared_by ||
    localStorage.getItem("employeeName") ||
    localStorage.getItem("userName") ||
    "—"
  ).trim().toUpperCase();

  const effPreparedByDesig = String(
    preparedByDesig ||
    bill.created_by_designation ||
    bill.insurance_prepared_by_designation ||
    "INSURANCE EXECUTIVE"
  ).trim().toUpperCase();
  const effManagerName = String(bill.insurance_manager_name || (managerName && managerName !== "DR.B.KAUSALYA" ? managerName : "DR.B.KAUSALYA")).toUpperCase();
  const effManagerDesig = String(bill.insurance_manager_designation || managerDesig || "GENERAL INSURANCE MANAGER").toUpperCase();

  const renderHeaderBlock = () => (
    withHeader ? (
      <div style={{ textAlign: "center", paddingTop: "6px", marginBottom: "8px" }}>
        <img src={headerImg} alt="HOSPITAL HEADER" style={{ maxWidth: "100%", height: "auto", maxHeight: "68px" }} />
      </div>
    ) : (
      <div className="letterpad-spacer" style={{ height: `${headerSpacerHeight}px`, minHeight: `${headerSpacerHeight}px` }} />
    )
  );

  const renderSignatures = (pageNo, totalPages) => {
    // User requirement: add signature at the first page alone (only in the first page alone, signature enough)
    const isFirstPage = pageNo === 1;

    return (
      <div style={{ marginTop: 8 }}>
        {isFirstPage && (
          <table style={{
            width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
            fontSize: "0.88rem", textTransform: "uppercase", fontFamily: "'Times New Roman', Times, serif"
          }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", textAlign: "left", verticalAlign: "bottom" }}>
                  <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>
                    {effPreparedByName}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#111", fontWeight: "bold", marginTop: 2 }}>
                    {effPreparedByDesig}
                  </div>
                </td>
                <td style={{ width: "50%", textAlign: "right", verticalAlign: "bottom" }}>
                  <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>
                    {effManagerName}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#111", fontWeight: "bold", marginTop: 2 }}>
                    {effManagerDesig}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        <div style={{
          textAlign: "center", fontWeight: "bold", fontSize: "0.82rem",
          marginTop: isFirstPage ? 8 : 6, marginBottom: 4, textTransform: "uppercase",
          fontFamily: "'Times New Roman', Times, serif"
        }}>
          PAGE : {pageNo} OF {totalPages}
        </div>

        <table style={{
          width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
          borderTop: "1px solid #000", fontSize: "0.72rem", textTransform: "uppercase",
          fontFamily: "'Times New Roman', Times, serif"
        }}>
          <tbody>
            <tr>
              <td style={{ textAlign: "left", fontStyle: "italic", fontSize: "0.70rem", padding: "4px 2px 0", verticalAlign: "middle" }}>
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
        rVal: fmtDateStr(bill.admission_date || bill.admissionDateTime || pd.admission_date || pd.admissionDateTime)
      },
      {
        lLabel: "ID CARD NO",
        lVal: String(bill.id_card_number || pd.id_card_number || pd.card_no || "—").toUpperCase(),
        rLabel: "DATE OF DISCHARGE",
        rVal: fmtDateStr(bill.discharge_date || pd.discharge_date || bill.dischargeDateTime || pd.dischargeDateTime || bill.bill_date)
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
        fontSize: "0.85rem", lineHeight: "1.4", borderBottom: "1.5px solid #000",
        paddingBottom: 4, marginBottom: 8, textTransform: "uppercase",
        fontFamily: "'Times New Roman', Times, serif"
      }}>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ width: "20%", padding: "2px 3px", fontWeight: "bold", verticalAlign: "top" }}>{r.lLabel}</td>
              <td style={{ width: "2%", padding: "2px 0", textAlign: "center", verticalAlign: "top" }}>:</td>
              <td style={{ width: "28%", padding: "2px 4px", verticalAlign: "top", wordBreak: "break-word" }}>{r.lVal}</td>
              <td style={{ width: "20%", padding: "2px 3px", fontWeight: "bold", verticalAlign: "top" }}>{r.rLabel}</td>
              <td style={{ width: "2%", padding: "2px 0", textAlign: "center", verticalAlign: "top" }}>:</td>
              <td style={{ width: "28%", padding: "2px 3px", verticalAlign: "top", wordBreak: "break-word", fontWeight: "bold" }}>{r.rVal}</td>
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
            marginBottom: 8, marginTop: 18, textTransform: "uppercase",
            fontFamily: "'Times New Roman', Times, serif"
          }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", textAlign: "left", fontWeight: "bold", fontSize: "0.92rem", padding: "4px 2px" }}>
                  DISCHARGE BILL - GST EXEMPT
                </td>
                <td style={{ width: "50%", textAlign: "right", fontWeight: "bold", fontSize: "0.92rem", padding: "4px 2px" }}>
                  CREDIT BILL (INSURANCE)
                </td>
              </tr>
            </tbody>
          </table>

          {renderHeaderDetails()}

          <div style={{ marginTop: 10, marginBottom: 12 }}>
            <table style={{
              width: "100%", borderCollapse: "collapse", fontSize: "0.85rem",
              textTransform: "uppercase", fontFamily: "'Times New Roman', Times, serif",
              tableLayout: "fixed", border: "1.5px solid #000"
            }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ width: "14%", border: "1px solid #000", textAlign: "left", padding: "5px 6px", fontWeight: "bold" }}>CODE</th>
                  <th style={{ width: "62%", border: "1px solid #000", textAlign: "left", padding: "5px 8px", fontWeight: "bold" }}>Particulars</th>
                  <th style={{ width: "8%", border: "1px solid #000", textAlign: "center", padding: "5px 4px", fontWeight: "bold" }}>Qty</th>
                  <th style={{ width: "16%", border: "1px solid #000", textAlign: "right", padding: "5px 8px", fontWeight: "bold" }}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {[...rawItems].sort((a, b) => itemSortOrder(a.itemName || a.name) - itemSortOrder(b.itemName || b.name)).map((it, idx) => {
                  const nabh = getNabhCode(it);
                  const desc = cleanDesc(it);
                  const showDoctor = isDoctorDisplayItem(it);
                  const doc = (showDoctor && (it.doctor || it.doctor_name)) ? resolveDocName(it.doctor || it.doctor_name, doctorsMap) : "";
                  const nabhCode = (nabh && nabh !== "-" && nabh !== "—") ? String(nabh).toUpperCase() : "";
                  const itemName = String(it.itemName || it.name || "SERVICE ITEM").toUpperCase();
                  const qty = it.quantity || 1;

                  return (
                    <tr key={idx}>
                      <td style={{ border: "1px solid #000", padding: "4px 6px", verticalAlign: "top", fontWeight: nabhCode ? "bold" : "normal" }}>
                        {nabhCode}
                      </td>
                      <td style={{ border: "1px solid #000", padding: "4px 8px", verticalAlign: "top", wordBreak: "break-word" }}>
                        <span style={{ fontWeight: 600 }}>{itemName}</span>
                        {doc && doc !== "—" ? <span style={{ fontWeight: 600 }}> {String(doc).toUpperCase()}</span> : null}
                        {desc ? <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: 1 }}>{String(desc).toUpperCase()}</div> : null}
                      </td>
                      <td style={{ border: "1px solid #000", padding: "4px 4px", verticalAlign: "top", textAlign: "center" }}>
                        {qty}
                      </td>
                      <td style={{ border: "1px solid #000", padding: "4px 8px", verticalAlign: "top", textAlign: "right", fontWeight: "bold" }}>
                        {fmt(it.amount)}
                      </td>
                    </tr>
                  );
                })}

                <tr style={{ fontWeight: "bold", fontSize: "0.95rem", background: "#f1f5f9" }}>
                  <td style={{ border: "1px solid #000", padding: "6px 6px" }}></td>
                  <td style={{ border: "1px solid #000", padding: "6px 8px" }}>Total</td>
                  <td style={{ border: "1px solid #000", padding: "6px 4px" }}></td>
                  <td style={{ border: "1px solid #000", padding: "6px 8px", textAlign: "right" }}>
                    {fmt(insNetAmount)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{
              marginTop: 8, marginBottom: 10, padding: "5px 8px",
              background: "#f8fafc", border: "1px dashed #000",
              fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase",
              fontFamily: "'Times New Roman', Times, serif"
            }}>
              RUPEE(S) {numberToWords(insNetAmount).toUpperCase()} ONLY
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
            padding: "12px 18px",
            marginBottom: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
            pageBreakAfter: "always",
            breakAfter: "page"
          }}>
            {renderHeaderBlock()}

            <table style={{
              width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
              borderTop: "2px solid #000", borderBottom: "2px solid #000",
              marginBottom: 6, marginTop: 10, textTransform: "uppercase",
              fontFamily: "'Times New Roman', Times, serif"
            }}>
              <tbody>
                <tr>
                  <td style={{ width: "50%", textAlign: "left", fontWeight: "bold", fontSize: "0.92rem", padding: "3px 2px" }}>
                    DISCHARGE BILL - GST EXEMPT
                  </td>
                  <td style={{ width: "50%", textAlign: "right", fontWeight: "bold", fontSize: "0.92rem", padding: "3px 2px" }}>
                    CREDIT BILL (INSURANCE)
                  </td>
                </tr>
              </tbody>
            </table>

            {renderHeaderDetails()}

            <div style={{ marginTop: 6, marginBottom: 8 }}>
              <div style={{
                fontWeight: "bold", fontSize: "0.88rem", marginBottom: 4,
                textTransform: "uppercase", borderBottom: "1.5px solid #000", paddingBottom: 2,
                fontFamily: "'Times New Roman', Times, serif"
              }}>
                HOSPITAL CHARGES (OVERALL SUMMARY)
              </div>
              <table style={{
                width: "100%", borderCollapse: "collapse", fontSize: "0.86rem",
                textTransform: "uppercase", fontFamily: "'Times New Roman', Times, serif"
              }}>
                <thead>
                  <tr style={{ borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000", background: "#f8fafc" }}>
                    <th style={{ textAlign: "left", padding: "4px 6px" }}>ITEM DESCRIPTION</th>
                    <th style={{ textAlign: "right", padding: "4px 6px", width: "140px" }}>AMOUNT (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {IP_CATEGORIES.filter(cat => (parseFloat(groupTotals[cat]) || 0) > 0).map((cat, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "3px 6px", fontWeight: "bold" }}>{cat}</td>
                      <td style={{ padding: "3px 6px", textAlign: "right", fontWeight: "bold" }}>₹{fmt(groupTotals[cat])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000", marginTop: 6, padding: "4px 0" }}>
                <table style={{
                  width: "100%", borderCollapse: "collapse", fontSize: "0.88rem",
                  textTransform: "uppercase", fontFamily: "'Times New Roman', Times, serif"
                }}>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: "right", padding: "2px 8px", fontWeight: "bold" }}>TOTAL HOSPITAL CHARGES :</td>
                      <td style={{ width: "140px", textAlign: "right", padding: "2px 6px", fontWeight: "bold" }}>₹{fmt(bill.total_amount)}</td>
                    </tr>
                    {parseFloat(bill.discount_amount) > 0 && (
                      <tr style={{ color: "#b91c1c" }}>
                        <td style={{ textAlign: "right", padding: "2px 8px", fontWeight: "bold" }}>LESS: DISCOUNT :</td>
                        <td style={{ width: "140px", textAlign: "right", padding: "2px 6px", fontWeight: "bold" }}>-₹{fmt(bill.discount_amount)}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ textAlign: "right", padding: "4px 8px 2px", fontWeight: "bold", fontSize: "0.98rem", borderTop: "1px dashed #000" }}>
                        GRAND TOTAL / NET AMOUNT :
                      </td>
                      <td style={{ width: "140px", textAlign: "right", padding: "4px 6px 2px", fontWeight: "bold", fontSize: "0.98rem", borderTop: "1px dashed #000" }}>
                        ₹{fmt(insNetAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{
                marginTop: 6, marginBottom: 8, padding: "4px 8px",
                background: "#f8fafc", border: "1px dashed #000",
                fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase",
                fontFamily: "'Times New Roman', Times, serif"
              }}>
                RUPEE(S) {numberToWords(insNetAmount).toUpperCase()} ONLY
              </div>
            </div>

            {renderSignatures(1, 2)}
          </div>

          {/* PAGE 2: Itemized Breakdown */}
          <div className="bill-page bill-page-2 page-break" style={{
            background: "#fff",
            padding: "12px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
            pageBreakBefore: "always",
            breakBefore: "page"
          }}>
            {renderHeaderBlock()}

            <div style={{
              textAlign: "center", fontWeight: "bold", fontSize: "1.05rem",
              textDecoration: "underline", margin: "6px 0 10px",
              textTransform: "uppercase", fontFamily: "'Times New Roman', Times, serif"
            }}>
              DISCHARGE BILL
            </div>

            <table style={{
              width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
              borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000",
              marginBottom: 10, textTransform: "uppercase",
              fontFamily: "'Times New Roman', Times, serif"
            }}>
              <tbody>
                <tr>
                  <td style={{ width: "45%", textAlign: "left", fontWeight: "bold", fontSize: "0.88rem", padding: "3px 2px" }}>
                    DETAILED BREAKDOWN
                  </td>
                  <td style={{ width: "55%", textAlign: "right", fontWeight: "bold", fontSize: "0.85rem", padding: "3px 2px" }}>
                    BILL NO: {String(bill.insurance_bill_number || bill.bill_no || bill.estimate_number || "—").toUpperCase()} | UHID: {String(bill.uhid || pd.uhid || "—").toUpperCase()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Continuous Boxed Table with Solid Lines Between Every Item */}
            <table style={{
              width: "100%", borderCollapse: "collapse", tableLayout: "fixed",
              border: "1.5px solid #000", fontSize: "0.85rem",
              textTransform: "uppercase", fontFamily: "'Times New Roman', Times, serif",
              marginBottom: 10
            }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ width: "14%", border: "1px solid #000", textAlign: "left", padding: "5px 6px", fontWeight: "bold", fontSize: "0.88rem" }}>CODE</th>
                  <th style={{ width: "62%", border: "1px solid #000", textAlign: "left", padding: "5px 8px", fontWeight: "bold", fontSize: "0.88rem" }}>Particulars</th>
                  <th style={{ width: "8%", border: "1px solid #000", textAlign: "center", padding: "5px 4px", fontWeight: "bold", fontSize: "0.88rem" }}>Qty</th>
                  <th style={{ width: "16%", border: "1px solid #000", textAlign: "right", padding: "5px 8px", fontWeight: "bold", fontSize: "0.88rem" }}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {IP_CATEGORIES.map((groupTitle, gIdx) => {
                  const gItems = groups[groupTitle];
                  if (!gItems || gItems.length === 0) return null;
                  if (!(parseFloat(groupTotals[groupTitle]) > 0)) return null;

                  return (
                    <React.Fragment key={gIdx}>
                      {/* Category Header Row */}
                      <tr style={{ background: "#f1f5f9" }}>
                        <td
                          colSpan={4}
                          style={{
                            border: "1px solid #000",
                            padding: "5px 8px",
                            fontWeight: "bold",
                            fontSize: "0.88rem",
                            letterSpacing: "0.3px",
                          }}
                        >
                          {groupTitle}
                        </td>
                      </tr>

                      {/* Category Items with Solid Borders Between Each Item */}
                      {gItems.map((it, idx) => {
                        const nabh = getNabhCode(it);
                        const desc = cleanDesc(it);
                        const showDoctor = isDoctorDisplayItem(it);
                        const doc = (showDoctor && (it.doctor || it.doctor_name)) ? resolveDocName(it.doctor || it.doctor_name, doctorsMap) : "";
                        const qty = it.quantity || 1;
                        const itemName = String(it.itemName || it.name || "SERVICE ITEM").toUpperCase();
                        const nabhCode = (nabh && nabh !== "-" && nabh !== "—") ? String(nabh).toUpperCase() : "";

                        return (
                          <tr key={idx}>
                            <td style={{
                              border: "1px solid #000",
                              padding: "4px 6px",
                              verticalAlign: "top",
                              fontWeight: nabhCode ? "bold" : "normal",
                              fontSize: "0.84rem"
                            }}>
                              {nabhCode}
                            </td>
                            <td style={{
                              border: "1px solid #000",
                              padding: "4px 8px",
                              verticalAlign: "top",
                              wordBreak: "break-word",
                              fontSize: "0.85rem"
                            }}>
                              <span style={{ fontWeight: 600 }}>{itemName}</span>
                              {doc && doc !== "—" ? (
                                <span style={{ fontWeight: 600, color: "#111" }}> {String(doc).toUpperCase()}</span>
                              ) : null}
                              {desc ? (
                                <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: 1 }}>{String(desc).toUpperCase()}</div>
                              ) : null}
                            </td>
                            <td style={{
                              border: "1px solid #000",
                              padding: "4px 4px",
                              verticalAlign: "top",
                              textAlign: "center",
                              fontSize: "0.85rem",
                              fontWeight: 500
                            }}>
                              {qty}
                            </td>
                            <td style={{
                              border: "1px solid #000",
                              padding: "4px 8px",
                              verticalAlign: "top",
                              textAlign: "right",
                              fontWeight: "bold",
                              fontSize: "0.85rem"
                            }}>
                              {fmt(it.amount)}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Category Subtotal Row */}
                      <tr style={{ background: "#f8fafc", fontWeight: "bold", fontSize: "0.86rem" }}>
                        <td style={{ border: "1px solid #000", padding: "4px 6px" }}></td>
                        <td style={{ border: "1px solid #000", padding: "4px 8px" }}></td>
                        <td style={{ border: "1px solid #000", padding: "4px 4px" }}></td>
                        <td style={{ border: "1px solid #000", padding: "4px 8px", textAlign: "right" }}>
                          {fmt(groupTotals[groupTitle])}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}

                {/* Final Total Row */}
                <tr style={{ fontWeight: "bold", fontSize: "0.95rem", background: "#f1f5f9" }}>
                  <td style={{ border: "1px solid #000", padding: "6px 6px" }}></td>
                  <td style={{ border: "1px solid #000", padding: "6px 8px", fontWeight: "bold" }}>Total</td>
                  <td style={{ border: "1px solid #000", padding: "6px 4px" }}></td>
                  <td style={{ border: "1px solid #000", padding: "6px 8px", textAlign: "right", fontWeight: "bold" }}>
                    {fmt(bill.total_amount)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{
              marginTop: 8, marginBottom: 10, padding: "5px 8px",
              background: "#f8fafc", border: "1px dashed #000",
              fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase",
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
  headerSpacerHeight = 200,
  paperSize = "A5",
  managerName,
  managerDesig,
  preparedByName,
  preparedByDesig,
  doctorsMap = {},
  deptMap = {},
  loadedMeds = [],
}, ref) => {
  if (!bill) return null;

  const isA5 = paperSize === "A5";

  return (
    <div ref={ref} className="print-area" style={{
      width: isA5 ? "148mm" : "210mm",
      maxWidth: isA5 ? "580px" : "780px",
      margin: "0 auto",
      color: "#000",
      padding: isA5 ? "8px" : "12px 16px",
      boxSizing: "border-box"
    }}>
      <style>{`
        @media print {
          @page {
            size: ${isA5 ? "A5 portrait" : "A4 portrait"};
            margin: ${isA5 ? "5mm 5mm 5mm" : "12mm 10mm 10mm"};
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
            height: ${headerSpacerHeight}px !important;
            min-height: ${headerSpacerHeight}px !important;
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

      {(viewMode === "INSURANCE_CLAIM" || viewMode === "INSURANCE_BREAKDOWN") ? (
        <InsuranceClaimSheet
          bill={bill}
          insuranceFormat={insuranceFormat}
          withHeader={withHeader}
          headerSpacerHeight={headerSpacerHeight}
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
          headerSpacerHeight={headerSpacerHeight}
          preparedByName={preparedByName}
          doctorsMap={doctorsMap}
          deptMap={deptMap}
          viewMode={viewMode}
          loadedMeds={loadedMeds}
          paperSize={paperSize}
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

  // Customer Type strictly determines if Insurance bill layout applies
  const custTypeStr = String(bill?.customer_type || bill?.patient_details?.customer_type || bill?.patient_details?.patient_type || "").toUpperCase();
  const isCustTypeInsurance = custTypeStr.includes("INSURANCE");

  // Is this an insurance bill (i.e. Insurance patient bill)?
  const isInsuranceBill = Boolean(
    isCustTypeInsurance && (
      bill?.is_insurance_bill ||
      bill?.insurance_bill_number ||
      defaultViewMode === "INSURANCE_CLAIM" ||
      defaultViewMode === "INSURANCE_BREAKDOWN"
    )
  );

  // View mode: "NORMAL" (Summary reference bill) vs "BREAKDOWN" (Itemized medicines) vs "INSURANCE_CLAIM" (NABH multi-category format)
  const [viewMode, setViewMode] = useState(
    isInsuranceBill
      ? (defaultViewMode === "INSURANCE_BREAKDOWN" ? "INSURANCE_BREAKDOWN" : "INSURANCE_CLAIM")
      : (defaultViewMode === "INSURANCE_CLAIM" || defaultViewMode === "INSURANCE_BREAKDOWN" ? "NORMAL" : (defaultViewMode || "NORMAL"))
  );

  const isInsurance = isInsuranceBill || (isCustTypeInsurance && (viewMode === "INSURANCE_CLAIM" || viewMode === "INSURANCE_BREAKDOWN"));
  const [paperSize, setPaperSize] = useState(isInsurance ? "A4" : "A5");
  const [loadedMeds, setLoadedMeds] = useState([]);

  useEffect(() => {
    if (defaultViewMode) {
      const isIns = Boolean(
        isCustTypeInsurance && (
          defaultViewMode === "INSURANCE_CLAIM" ||
          defaultViewMode === "INSURANCE_BREAKDOWN" ||
          bill?.is_insurance_bill ||
          bill?.insurance_bill_number
        )
      );
      if (isIns) {
        setViewMode(defaultViewMode === "INSURANCE_BREAKDOWN" ? "INSURANCE_BREAKDOWN" : "INSURANCE_CLAIM");
        setPaperSize("A4");
        setHeaderSpacerHeight(200);
      } else {
        setViewMode(defaultViewMode === "INSURANCE_CLAIM" || defaultViewMode === "INSURANCE_BREAKDOWN" ? "NORMAL" : defaultViewMode);
        setPaperSize("A5");
        setHeaderSpacerHeight(140);
      }
    }
  }, [defaultViewMode, bill, isCustTypeInsurance]);

  const handleSelectViewMode = (mode) => {
    setViewMode(mode);
    if (mode === "INSURANCE_CLAIM" || mode === "INSURANCE_BREAKDOWN") {
      setPaperSize("A4");
      setHeaderSpacerHeight(200);
    } else {
      setPaperSize("A5");
      setHeaderSpacerHeight(140);
    }
  };

  useEffect(() => {
    if (bill) {
      const medAmt = parseFloat(bill.medicines_amount) || 0;
      const rawItems = parseItems(bill.items);
      const hasMedItemInBill = rawItems.some(i => {
        const n = String(i.itemName || i.name || "").toUpperCase();
        return n.startsWith("MEDICINE") || n.startsWith("PHARMACY") || i.billTypeNo === "PHARM01" || i.bill_type === 13;
      });

      // If the bill explicitly has NO medicines (medicines_amount is 0 AND no medicine items in the bill),
      // do not load or display any pharmacy medicines!
      if (medAmt === 0 && !hasMedItemInBill) {
        setLoadedMeds([]);
        return;
      }

      if (Array.isArray(bill.pharmacy_medicines) && bill.pharmacy_medicines.length > 0) {
        const isAllGeneric = bill.pharmacy_medicines.every(m => /^medicine\s+\d+$/i.test(m.itemName || m.name || m.item_name || ""));
        if (!isAllGeneric) {
          setLoadedMeds(bill.pharmacy_medicines);
          return;
        }
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
            const pParam = ip ? `ipNumber=${encodeURIComponent(ip)}${uhid ? `&uhid=${encodeURIComponent(uhid)}` : ""}` : `uhid=${encodeURIComponent(uhid)}`;
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
        .catch(() => { });
    }
  }, [bill]);

  const [insFormat, setInsFormat] = useState("IP");
  const [withHeader, setWithHeader] = useState(true);
  const [headerSpacerHeight, setHeaderSpacerHeight] = useState(200);

  // Dynamic Signatories state
  const [preparedByName, setPreparedByName] = useState("");
  const [preparedByDesig, setPreparedByDesig] = useState("");
  const [managerName, setManagerName] = useState("DR.B.KAUSALYA");
  const [managerDesig, setManagerDesig] = useState("GENERAL INSURANCE MANAGER");

  // Doctors and departments mapping state
  const [doctorsMap, setDoctorsMap] = useState({});
  const [deptMap, setDeptMap] = useState({});

  useEffect(() => {
    const map = {};
    const dMap = {};
    if (Array.isArray(doctors) && doctors.length > 0) {
      doctors.forEach(d => {
        const id = String(d.employeeId || d.employee_id || d.id || "").trim();
        const name = String(d.employeeName || d.name || d.doctorName || "").trim();
        const dept = String(d.department || d.department_name || "").trim();
        if (id && name) {
          map[id] = name;
        }
        if (dept) {
          if (id) dMap[id] = dept;
          if (name) dMap[name] = dept;
          if (d.department_code) dMap[d.department_code] = dept;
        }
      });
      setDoctorsMap({ ...map });
      setDeptMap({ ...dMap });
    }

    const fetchDoctors = async () => {
      try {
        const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "/_b_a_c_k_e_n_d/HMS/";
        const res = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        list.forEach(d => {
          const id = String(d.employeeId || d.employee_id || d.id || "").trim();
          const name = String(d.employeeName || d.name || d.doctorName || "").trim();
          const dept = String(d.department || d.department_name || "").trim();
          if (id && name) {
            map[id] = name;
          }
          if (dept) {
            if (id) dMap[id] = dept;
            if (name) dMap[name] = dept;
            if (d.department_code) dMap[d.department_code] = dept;
          }
        });
        setDoctorsMap({ ...map });
        setDeptMap({ ...dMap });
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

      const pName = (
        bill.created_by_name ||
        bill.created_by ||
        bill.prepared_by_name ||
        bill.prepared_by ||
        localStorage.getItem("employeeName") ||
        localStorage.getItem("userName") ||
        ""
      );
      const pDesig = bill.created_by_designation || bill.insurance_prepared_by_designation || "";
      const mName = bill.insurance_manager_name || bill.manager_name || "DR.B.KAUSALYA";
      const mDesig = bill.insurance_manager_designation || bill.manager_designation || "GENERAL INSURANCE MANAGER";

      setPreparedByName(pName);
      setPreparedByDesig(pDesig);
      setManagerName(mName);
      setManagerDesig(mDesig);

      // Fetch dynamic signatories from backend API based on the creator of this bill
      const fetchSignatories = async () => {
        try {
          const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "/_b_a_c_k_e_n_d/HMS/";
          const creator = bill.created_by || bill.created_by_name || localStorage.getItem("userName") || "";
          const res = await apiRequest(`${HmsBaseUrl}discharge-billing/signatories/?created_by=${encodeURIComponent(creator)}`, "GET");
          if (res?.success) {
            const data = res.data?.data || res.data;
            if (data?.prepared_by?.name !== undefined && data.prepared_by.name) {
              setPreparedByName(data.prepared_by.name);
            }
            if (data?.prepared_by?.designation !== undefined && data.prepared_by.designation) {
              setPreparedByDesig(data.prepared_by.designation);
            }
            if (data?.manager?.name !== undefined && data.manager.name) {
              setManagerName(data.manager.name);
            }
            if (data?.manager?.designation !== undefined && data.manager.designation) {
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
      const isA5 = paperSize === "A5";
      let iframe = document.getElementById("discharge-print-iframe");
      if (iframe) {
        try { document.body.removeChild(iframe); } catch { }
      }

      iframe = document.createElement("iframe");
      iframe.id = "discharge-print-iframe";
      // Render offscreen with appropriate paper width so layout is computed properly
      iframe.style.position = "fixed";
      iframe.style.left = "-10000px";
      iframe.style.top = "0px";
      iframe.style.width = isA5 ? "559px" : "794px";
      iframe.style.height = isA5 ? "794px" : "1123px";
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
                size: ${isA5 ? "A5 portrait" : "A4 portrait"};
                margin: ${isA5 ? "5mm 5mm 5mm" : "12mm 10mm 10mm"};
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
                height: ${headerSpacerHeight}px !important;
                min-height: ${headerSpacerHeight}px !important;
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
    if (!printRef.current || !bill) return;
    const isA5 = paperSize === "A5";

    // Clone node so we can safely clean styles specifically for MS Word
    const clone = printRef.current.cloneNode(true);

    // Remove no-print elements
    clone.querySelectorAll(".no-print").forEach(el => el.remove());

    // Clean up bill-page styles (remove borders and shadows) and insert explicit Word page breaks
    const pages = Array.from(clone.querySelectorAll(".bill-page"));
    pages.forEach((page, idx) => {
      page.style.boxShadow = "none";
      page.style.border = "none";
      page.style.margin = "0";
      page.style.padding = isA5 ? "6px 8px" : "10px 14px";
      page.style.background = "#ffffff";
      page.style.width = "100%";

      // For every page after the first, insert an explicit Word hard page break before it
      if (idx > 0) {
        const pBreak = document.createElement("p");
        pBreak.className = "MsoNormal";
        pBreak.setAttribute("style", "page-break-before:always; mso-break-type:section-break; margin:0; padding:0; line-height:0; font-size:1pt;");
        pBreak.innerHTML = '<span lang="EN-US" style="display:none; mso-special-character:line-break; page-break-before:always">&nbsp;</span><br clear="all" style="page-break-before:always; mso-break-type:section-break" />';
        page.parentNode.insertBefore(pBreak, page);
      }
    });

    // Also check any elements with class .page-break or .bill-page-2 that might not be in the direct list
    clone.querySelectorAll(".page-break, .bill-page-2").forEach(el => {
      if (el.previousElementSibling && !el.previousElementSibling.classList.contains("MsoNormal")) {
        const pBreak = document.createElement("p");
        pBreak.className = "MsoNormal";
        pBreak.setAttribute("style", "page-break-before:always; mso-break-type:section-break; margin:0; padding:0; line-height:0; font-size:1pt;");
        pBreak.innerHTML = '<span lang="EN-US" style="display:none; mso-special-character:line-break; page-break-before:always">&nbsp;</span><br clear="all" style="page-break-before:always; mso-break-type:section-break" />';
        el.parentNode.insertBefore(pBreak, el);
      }
    });

    // Process images: ensure small logos are NOT stretched to 580px
    const imgEls = printRef.current.querySelectorAll("img");
    const cloneImgEls = clone.querySelectorAll("img");
    cloneImgEls.forEach((imgEl, idx) => {
      const liveImg = imgEls[idx] || imgEl;
      if (liveImg && liveImg.src) {
        try {
          const isLogo = (liveImg.alt && liveImg.alt.toLowerCase().includes("logo")) ||
            (liveImg.src && liveImg.src.toLowerCase().includes("logo")) ||
            (liveImg.width > 0 && liveImg.width <= 120);

          const origW = liveImg.naturalWidth || liveImg.width || (isLogo ? 50 : 580);
          const origH = liveImg.naturalHeight || liveImg.height || (isLogo ? 50 : 65);

          const targetW = isLogo ? (isA5 ? 44 : 50) : (isA5 ? 420 : 580);
          const targetH = isLogo ? (isA5 ? 44 : 50) : Math.max(25, Math.round((origH / origW) * targetW));

          const canvas = document.createElement("canvas");
          canvas.width = origW;
          canvas.height = origH;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(liveImg, 0, 0, origW, origH);
          const dataUrl = canvas.toDataURL("image/png");

          imgEl.setAttribute("src", dataUrl);
          imgEl.setAttribute("width", String(targetW));
          imgEl.setAttribute("height", String(targetH));
          imgEl.style.width = `${targetW}px`;
          imgEl.style.height = `${targetH}px`;
          imgEl.style.maxWidth = `${targetW}px`;
          imgEl.style.display = "block";
          imgEl.style.margin = isLogo ? "0" : "0 auto";
        } catch {
          if (imgEl.src && imgEl.src.startsWith("/")) {
            imgEl.src = `${window.location.origin}${imgEl.src}`;
          }
        }
      }
    });

    let bodyHtml = clone.innerHTML;
    bodyHtml = bodyHtml.replace(/class="print-area"[^>]*style="[^"]*"/i, 'class="print-area" style="width:100%;margin:0;padding:0;"');

    const pageSizeCss = isA5
      ? "size: 419.55pt 595.35pt;\n      margin: 12pt 16pt 12pt 16pt;"
      : "size: 595.35pt 841.95pt;\n      margin: 18pt 22pt 18pt 22pt;";

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
      ${pageSizeCss}
      mso-header-margin: 10pt;
      mso-footer-margin: 10pt;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body { font-family: 'Times New Roman', Times, serif; font-size: ${isA5 ? "7.5pt" : "8.5pt"}; color: #000; margin: 0; padding: 0; }
    table { width: 100% !important; max-width: 100% !important; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; }
    td, th { font-family: 'Times New Roman', Times, serif; font-size: ${isA5 ? "6.8pt" : "7.5pt"}; padding: 2px; }
    img { max-width: 100%; }
    .no-print { display: none; }
    .bill-page { width: 100% !important; margin: 0 !important; }
    .bill-page-1 { page-break-after: always; mso-break-type: section-break; }
    .bill-page-2, .page-break { page-break-before: always; mso-break-type: section-break; }
    br.page-break { page-break-before: always; mso-break-type: section-break; }
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
    a.download = `Bill_${(bill.insurance_bill_number || bill.bill_no || "DischargeBill").replace(/\//g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || !bill) return;
    const isA5 = paperSize === "A5";
    const fileName = `Bill_${(bill.insurance_bill_number || bill.bill_no || "DischargeBill").replace(/\//g, "_")}.pdf`;

    try {
      const pageElements = printRef.current.querySelectorAll(".bill-page");
      const elementsToPrint = pageElements.length > 0 ? Array.from(pageElements) : [printRef.current];

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: isA5 ? "a5" : "a4"
      });

      const pdfWidth = isA5 ? 148 : 210;
      const pdfHeight = isA5 ? 210 : 297;
      const margin = isA5 ? 4 : 6;
      const printableWidth = pdfWidth - (margin * 2);
      const printableHeight = pdfHeight - (margin * 2);

      let isFirstPdfPage = true;

      for (let i = 0; i < elementsToPrint.length; i++) {
        const el = elementsToPrint[i];

        // Temporarily clear box shadow and borders for crisp clean PDF page capture
        const origBoxShadow = el.style.boxShadow;
        const origBorder = el.style.border;
        el.style.boxShadow = "none";
        el.style.border = "none";

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff"
        });

        el.style.boxShadow = origBoxShadow;
        el.style.border = origBorder;

        const totalTargetHeight = (canvas.height * printableWidth) / canvas.width;

        // If the element fits on a single PDF page (e.g. Page 1 or compact Page 2)
        if (totalTargetHeight <= printableHeight + 2) {
          if (!isFirstPdfPage) {
            pdf.addPage(isA5 ? "a5" : "a4", "portrait");
          }
          isFirstPdfPage = false;
          pdf.addImage(
            canvas.toDataURL("image/jpeg", 0.98),
            "JPEG",
            margin,
            margin,
            printableWidth,
            Math.min(totalTargetHeight, printableHeight)
          );
        } else {
          // If the element is longer than 1 page (e.g. Page 2 with dozens of items),
          // slice canvas across pages so nothing is ever clipped or cut off
          const pageCanvasHeight = Math.floor((printableHeight * canvas.width) / printableWidth);
          let heightLeft = canvas.height;
          let sY = 0;

          while (heightLeft > 0) {
            const currentChunkHeight = Math.min(heightLeft, pageCanvasHeight);

            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = canvas.width;
            pageCanvas.height = currentChunkHeight;
            const ctx = pageCanvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(
              canvas,
              0, sY, canvas.width, currentChunkHeight,
              0, 0, canvas.width, currentChunkHeight
            );

            const chunkTargetHeight = (currentChunkHeight * printableWidth) / canvas.width;

            if (!isFirstPdfPage) {
              pdf.addPage(isA5 ? "a5" : "a4", "portrait");
            }
            isFirstPdfPage = false;

            pdf.addImage(
              pageCanvas.toDataURL("image/jpeg", 0.98),
              "JPEG",
              margin,
              margin,
              printableWidth,
              chunkTargetHeight
            );

            sY += currentChunkHeight;
            heightLeft -= currentChunkHeight;
          }
        }
      }

      pdf.save(fileName);
    } catch (err) {
      console.error("html2canvas/jsPDF error, falling back to print:", err);
      triggerPrint();
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

            {/* ── View Mode Switcher: For Insurance, only INSURANCE and INS. BREAKDOWN are shown (no Standard / Breakdown) ── */}
            <div style={{ display: "flex", gap: 3, background: "rgba(0,0,0,0.25)", padding: 2, borderRadius: 6 }}>
              {isInsurance ? (
                <>
                  <HeadBtn
                    type="button"
                    $active={viewMode === "INSURANCE_CLAIM"}
                    onClick={() => handleSelectViewMode("INSURANCE_CLAIM")}
                    title="Insurance Summary - A4 format"
                  >
                    🛡️ INSURANCE
                  </HeadBtn>
                  <HeadBtn
                    type="button"
                    $active={viewMode === "INSURANCE_BREAKDOWN"}
                    onClick={() => handleSelectViewMode("INSURANCE_BREAKDOWN")}
                    title="Insurance Detailed Breakdown - A4 format"
                  >
                    📋 INS. BREAKDOWN
                  </HeadBtn>
                </>
              ) : (
                <>
                  <HeadBtn
                    type="button"
                    $active={viewMode === "NORMAL"}
                    onClick={() => handleSelectViewMode("NORMAL")}
                    title="Standard Bill (summary medicine charges) - A5 format"
                  >
                    🖨️ STANDARD
                  </HeadBtn>
                  <HeadBtn
                    type="button"
                    $active={viewMode === "BREAKDOWN"}
                    onClick={() => handleSelectViewMode("BREAKDOWN")}
                    title="Breakdown Bill (all medicines itemized) - A5 format"
                  >
                    📑 BREAKDOWN
                  </HeadBtn>
                </>
              )}
            </div>

            {/* ── Paper Size Toggle: A5 vs A4 (Hidden for insurance bills as insurance strictly uses A4) ── */}
            {!isInsurance && (
              <div style={{ display: "flex", gap: 3, background: "rgba(0,0,0,0.25)", padding: 2, borderRadius: 6 }}>
                <HeadBtn
                  type="button"
                  $active={paperSize === "A5"}
                  onClick={() => setPaperSize("A5")}
                  title="A5 Paper Size (148mm × 210mm) - Compact Hospital Invoice"
                >
                  📄 A5
                </HeadBtn>
                <HeadBtn
                  type="button"
                  $active={paperSize === "A4"}
                  onClick={() => setPaperSize("A4")}
                  title="A4 Paper Size (210mm × 297mm) - Full Page Sheet"
                >
                  📄 A4
                </HeadBtn>
              </div>
            )}

            {/* ── Header toggle (available across ALL view modes: Standard, Breakdown, Insurance) ── */}
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
                title="Print without Header (leaves top space for pre-printed letterpad)"
              >
                WITHOUT HEADER (LETTERPAD)
              </HeadBtn>
            </div>

            {/* ── Top Header Gap Adjuster (when WITHOUT HEADER is active) ── */}
            {!withHeader && (
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(0,0,0,0.35)", padding: "2px 8px", borderRadius: 6,
                fontSize: "0.75rem", color: "#f8fafc"
              }}>
                <span style={{ fontWeight: 600 }}>Header Gap:</span>
                <button
                  type="button"
                  onClick={() => setHeaderSpacerHeight(prev => Math.max(30, prev - 10))}
                  style={{
                    background: "#475569", border: "1px solid #64748b", color: "#fff",
                    borderRadius: 4, width: 22, height: 22, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "0.85rem"
                  }}
                  title="Decrease header space by 10px"
                >
                  -
                </button>
                <span style={{ fontWeight: 800, minWidth: 44, textAlign: "center", color: "#38bdf8" }}>
                  {headerSpacerHeight}px
                </span>
                <button
                  type="button"
                  onClick={() => setHeaderSpacerHeight(prev => Math.min(400, prev + 10))}
                  style={{
                    background: "#475569", border: "1px solid #64748b", color: "#fff",
                    borderRadius: 4, width: 22, height: 22, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "0.85rem"
                  }}
                  title="Increase header space by 10px"
                >
                  +
                </button>
              </div>
            )}

            {/* ── NABH format toggle: shown when viewMode is INSURANCE_CLAIM or INSURANCE_BREAKDOWN ── */}
            {(viewMode === "INSURANCE_CLAIM" || viewMode === "INSURANCE_BREAKDOWN") && (
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
            )}

            <HeadBtn type="button" onClick={handleDownloadWord}>📄 WORD</HeadBtn>
            <HeadBtn type="button" onClick={handleDownloadPDF}>📑 PDF</HeadBtn>
            <HeadBtn type="button" $active onClick={triggerPrint}>🖨️ PRINT</HeadBtn>

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
            headerSpacerHeight={headerSpacerHeight}
            paperSize={paperSize}
            managerName={managerName}
            managerDesig={managerDesig}
            preparedByName={preparedByName}
            preparedByDesig={preparedByDesig}
            doctorsMap={doctorsMap}
            deptMap={deptMap}
            loadedMeds={loadedMeds}
          />
        </div>
      </ModalBox>
    </ModalOverlay>
  );
};

export default DischargeBillPrintModal;
