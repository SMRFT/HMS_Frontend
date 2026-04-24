import { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../../Auth/apiRequest";

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @media print {
    body { margin: 0; padding: 0; }
    .no-print { display: none !important; }
    .print-container { page-break-inside: avoid; }
  }
`;

const T = {
  teal:      "#0d9488",
  tealDark:  "#0f766e",
  tealLight: "#ccfbf1",
  blue:      "#2563eb",
  blueLight: "#dbeafe",
  violet:    "#7c3aed",
  violetL:   "#ede9fe",
  border:    "#e2e8f0",
  bg:        "#f1f5f9",
  white:     "#ffffff",
  text:      "#0f172a",
  muted:     "#64748b",
  label:     "#334155",
  readBg:    "#f8fafc",
  green:     "#10b981",
  greenLight:"#d1fae5",
  red:       "#ef4444",
  redLight:  "#fee2e2",
  tealGhost: "#f0fdfb",
  amber:     "#f59e0b",
  amberLight:"#fef3c7",
  orange:    "#ea580c",
  orangeLight:"#ffedd5",
};

const rowIn = keyframes`
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%,100% { box-shadow: 0 0 0 0 rgba(13,148,136,0.3); }
  50%      { box-shadow: 0 0 0 6px rgba(13,148,136,0); }
`;

// ── Layout ────────────────────────────────────────────────────────────────────
const Page = styled.div`
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 0.8rem;
  color: ${T.text};
  background: ${T.bg};
  min-height: 100vh;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const PageTitle = styled.div`
  font-size: 1rem;
  font-weight: 800;
  color: ${T.tealDark};
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 8px;
  &::before {
    content: '';
    width: 4px; height: 20px;
    background: linear-gradient(180deg, ${T.teal}, ${T.blue});
    border-radius: 2px;
    display: block;
  }
`;

const Card = styled.div`
  background: ${T.white};
  border: 1px solid ${({ editing }) => editing ? T.teal : T.border};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: ${({ editing }) => editing
    ? `0 0 0 3px ${T.tealLight}`
    : "0 1px 4px rgba(0,0,0,0.05)"};
  animation: ${({ editing }) => editing ? pulse : "none"} 1.5s ease infinite;
  transition: border-color .2s, box-shadow .2s;
`;

const CardHead = styled.div`
  background: ${({ color }) =>
    color === "blue"   ? "linear-gradient(135deg,#1d4ed8,#2563eb)" :
    color === "violet" ? "linear-gradient(135deg,#6d28d9,#7c3aed)" :
    color === "orange" ? "linear-gradient(135deg,#c2410c,#ea580c)" :
                         "linear-gradient(135deg,#0f766e,#0d9488)"};
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 9px 14px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
`;

const EditBanner = styled.div`
  background: ${T.amberLight};
  border-bottom: 1px solid #fcd34d;
  padding: 6px 14px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #92400e;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardBody = styled.div`
  padding: 12px 14px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ cols }) => cols || 6}, 1fr);
  gap: 7px 10px;
  align-items: end;
`;

const F = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  grid-column: span ${({ span }) => span || 1};
`;

const Lbl = styled.label`
  font-size: 0.64rem;
  font-weight: 700;
  color: ${T.label};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
`;

const inputBase = `
  height: 27px;
  padding: 0 7px;
  font-size: 0.75rem;
  border: 1px solid ${T.border};
  border-radius: 5px;
  color: ${T.text};
  width: 100%;
  outline: none;
  font-family: inherit;
  transition: border-color .14s, box-shadow .14s;
`;

const Inp = styled.input`
  ${inputBase}
  background: ${({ readOnly }) => readOnly ? T.readBg : T.white};
  color: ${({ readOnly }) => readOnly ? T.muted : T.text};
  &:focus { border-color: ${T.teal}; box-shadow: 0 0 0 3px ${T.tealLight}; }
  &:disabled { background: ${T.readBg}; color: ${T.muted}; cursor: not-allowed; }
`;

const Select = styled.select`
  ${inputBase}
  background: ${T.white};
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 4px center;
  background-size: 16px;
  padding-right: 26px;
  &:focus { border-color: ${T.teal}; box-shadow: 0 0 0 3px ${T.tealLight}; }
`;

const Btn = styled.button`
  height: 29px;
  padding: 0 16px;
  font-size: 0.74rem;
  font-weight: 700;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: opacity .14s, transform .1s;
  background: ${({ v, c }) =>
    v === "reset"  ? "#e2e8f0" :
    v === "cancel" ? T.red     :
    c === "blue"   ? T.blue    :
    c === "orange" ? T.orange  :
    c === "violet" ? T.violet  : T.teal};
  color: ${({ v }) => v === "reset" ? T.label : "#fff"};
  &:hover { opacity: .88; }
  &:active { transform: scale(.97); }
  &:disabled { opacity: .45; cursor: not-allowed; transform: none; }
`;

const GroupLabel = styled.div`
  grid-column: 1 / -1;
  font-size: 0.63rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: ${({ c }) => c === "blue" ? T.blue : c === "violet" ? T.violet : T.teal};
  border-bottom: 2px solid ${({ c }) =>
    c === "blue" ? T.blueLight : c === "violet" ? T.violetL : T.tealLight};
  padding-bottom: 3px;
  margin-top: 6px;
`;

// ── Kebab Menu ────────────────────────────────────────────────────────────────
const KebabWrap = styled.div`
  position: relative;
  display: inline-block;
`;

const KebabBtn = styled.button`
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 1px solid ${T.border};
  background: ${T.white};
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.15rem; font-weight: 900; line-height: 1;
  color: ${T.muted};
  transition: background .12s, color .12s;
  letter-spacing: -1px;
  &:hover { background: ${T.bg}; color: ${T.text}; }
`;

const DropMenu = styled.div`
  position: absolute; right: 0; top: 34px; z-index: 9999;
  background: ${T.white};
  border: 1px solid ${T.border};
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.14);
  min-width: 178px; overflow: hidden;
  display: ${({ open }) => open ? "block" : "none"};
`;

const DropItem = styled.button`
  display: flex; align-items: center; gap: 9px;
  padding: 9px 14px; font-size: 0.74rem; font-weight: 600;
  color: ${({ danger }) => danger ? T.red : T.text};
  background: none; border: none; width: 100%; text-align: left;
  cursor: ${({ disabled }) => disabled ? "not-allowed" : "pointer"};
  opacity: ${({ disabled }) => disabled ? 0.38 : 1};
  font-family: inherit;
  transition: background .1s;
  &:hover:not([disabled]) {
    background: ${({ danger }) => danger ? T.redLight : T.bg};
  }
`;

const DropDivider = styled.div`height: 1px; background: ${T.border}; margin: 2px 0;`;

// ── Split Box ─────────────────────────────────────────────────────────────────
const SplitBox = styled.div`
  grid-column: 1 / -1;
  background: #f8fafc;
  border: 1.5px dashed ${T.tealLight};
  border-radius: 7px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SplitHeader = styled.div`
  font-size: 0.63rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: ${T.teal};
`;

const SplitGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  align-items: end;
`;

const SplitNote = styled.div`
  font-size: 0.67rem;
  font-weight: 700;
  color: ${({ ok }) => ok ? T.green : T.red};
  transition: color .15s;
`;

const BigInp = styled.input`
  height: 36px;
  padding: 0 10px;
  font-size: 1rem;
  font-weight: 700;
  border: 2px solid ${T.border};
  border-radius: 6px;
  color: ${T.tealDark};
  width: 100%;
  outline: none;
  font-family: inherit;
  background: ${T.tealGhost};
  transition: border-color .14s, box-shadow .14s;
  &:focus { border-color: ${T.teal}; box-shadow: 0 0 0 3px ${T.tealLight}; }
  &::placeholder { color: #94a3b8; font-weight: 400; font-size: 0.78rem; }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  padding: 9px 14px;
  border-top: 1px solid ${T.border};
  background: #fafafa;
  align-items: center;
  flex-wrap: wrap;
`;

// ── Table ─────────────────────────────────────────────────────────────────────
const TblWrap = styled.div`
  overflow-x: auto;
  overflow-y: visible;   /* ← add this */
  padding: 0 14px 14px;
`;

const Tbl = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.71rem;
  overflow: visible;     /* ← add this */
`;

const Th = styled.th`
  background: #f1f5f9;
  padding: 6px 8px;
  text-align: ${({ right }) => right ? "right" : "left"};
  font-weight: 700;
  border-bottom: 2px solid ${T.border};
  white-space: nowrap;
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: ${T.muted};
`;

const Tr = styled.tr`
  animation: ${rowIn} 0.2s ease;
  background: ${({ even }) => even ? "#f8fafc" : "#fff"};
  &:hover { background: ${T.tealGhost}; }
`;

const Td = styled.td`
  padding: 5px 8px;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
  text-align: ${({ right }) => right ? "right" : "left"};
`;

const StatusBadge = styled.span`
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.64rem;
  font-weight: 700;
  background: ${({ status }) =>
    status === "Paid"      ? T.greenLight  :
    status === "Cancelled" ? T.redLight    :
    status === "Edited"    ? T.orangeLight : T.amberLight};
  color: ${({ status }) =>
    status === "Paid"      ? T.green  :
    status === "Cancelled" ? T.red    :
    status === "Edited"    ? T.orange : T.amber};
  border: 1px solid ${({ status }) =>
    status === "Paid"      ? "#bbf7d0" :
    status === "Cancelled" ? "#fecaca" :
    status === "Edited"    ? "#fed7aa" : "#fde68a"};
`;

// ── Modal (Print only) ────────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
`;

const ModalBox = styled.div`
  background: ${T.white};
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  max-width: 700px; width: 95%;
  max-height: 90vh; overflow-y: auto;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg,#0f766e,#0d9488);
  color: #fff;
  padding: 14px 18px;
  display: flex; align-items: center; justify-content: space-between;
  border-radius: 10px 10px 0 0;
  position: sticky; top: 0; z-index: 1;
`;

const ModalTitle = styled.h3`font-size: 0.9rem; font-weight: 700; margin: 0;`;

const CloseBtn = styled.button`
  background: none; border: none; color: #fff;
  font-size: 1.5rem; cursor: pointer; padding: 0;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  &:hover { opacity: 0.8; }
`;

const ModalBody = styled.div`padding: 16px;`;

const ModalActions = styled.div`
  display: flex; gap: 8px; justify-content: flex-end;
  padding-top: 12px; border-top: 1px solid ${T.border}; margin-top: 12px;
`;

// ── Bill Slip ─────────────────────────────────────────────────────────────────
const BillSlipContainer = styled.div`
  width: 100%; max-width: 400px; margin: 0 auto;
  padding: 16px; border: 2px solid ${T.text};
  font-family: 'Courier New', monospace; background: ${T.white};
`;
const BillHeader   = styled.div`text-align:center; border-bottom:1px solid ${T.text}; padding-bottom:8px; margin-bottom:12px;`;
const BillTitle    = styled.div`font-size:14px; font-weight:bold; margin-bottom:2px;`;
const BillSubtitle = styled.div`font-size:11px; color:${T.muted}; margin-bottom:4px;`;
const BillSection  = styled.div`margin-bottom:10px; font-size:12px;`;
const BillRow      = styled.div`display:flex; justify-content:space-between; padding:3px 0; border-bottom:${({ divider }) => divider ? `1px dotted ${T.border}` : "none"};`;
const BillLabel    = styled.span`font-weight:bold;`;
const BillValue    = styled.span`text-align:right;`;

// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_COMMON = {
  uhid: "", ipNumber: "", name: "", age: "", gender: "",
  roomNo: "", bedNo: "", admittingDate: "", admittingDoctor: "",
  customer_type: "", company: "", address: "",
  creditLimit: "", outBalance: "", totalAdvance: "",
};

const today = () => new Date().toISOString().split("T")[0];

// Status rules
// Pending  → Edit ✓  Cancel ✓  Print ✓
// Paid     → Edit ✗  Cancel ✓  Print ✓
// Cancelled→ Edit ✗  Cancel ✗  Print ✓
// (Edited entries are never shown in the table)

export default function IPAdvance() {
  const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Admission ─────────────────────────────────────────────────────────────
  const [common, setCommon]     = useState(EMPTY_COMMON);
  const [admissionId, setAdmId] = useState(null);

  // ── Entry form ────────────────────────────────────────────────────────────
  const [date, setDate]               = useState(today());
  const [amount, setAmount]           = useState("");
  const [ipAdv, setIpAdv]             = useState("");
  const [billAdv, setBillAdv]         = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [saving, setSaving]           = useState(false);

  // ── Edit state ────────────────────────────────────────────────────────────
  // When editing, we store the original record so we can mark it Edited on save
  const [editingRecord, setEditingRecord] = useState(null); // original advance record
  const advanceFormRef = useRef(null);

  // ── Records ───────────────────────────────────────────────────────────────
  const [payments, setPayments]                 = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading]                   = useState(false);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [filterFromDate, setFilterFromDate]       = useState(today());
  const [filterToDate, setFilterToDate]           = useState(today());
  const [filterPaymentMode, setFilterPaymentMode] = useState("");
  const [filterStatus, setFilterStatus]           = useState("");

  // ── Print ─────────────────────────────────────────────────────────────────
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printRecord, setPrintRecord]       = useState(null);
  const printRef = useRef(null);

  // ── Kebab menu ────────────────────────────────────────────────────────────
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(prev => prev === id ? null : id);
  };

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const total        = parseFloat(amount) || 0;
  const splitIP      = parseFloat(ipAdv)  || 0;
  const splitBill    = parseFloat(billAdv) || 0;
  const splitTouched = ipAdv !== "" || billAdv !== "";
  const splitOk      = total > 0 && Math.abs(splitIP + splitBill - total) < 0.01;
  const fmt = (v) => parseFloat(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  // ── Load today on mount ───────────────────────────────────────────────────
  useEffect(() => {
    fetchAdvancesByDate(today(), today());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAdvancesByDate = async (fromDate, toDate) => {
    setLoading(true);
    try {
      const paramObj = {};
      if (fromDate) paramObj.from_date = fromDate;
      if (toDate)   paramObj.to_date   = toDate;
      const qs  = new URLSearchParams(paramObj).toString();
      const res = await apiRequest(`${BASE}admission-advance/?${qs}`, "GET");
      if (!res.success) throw new Error(res.error || "Failed to fetch advances");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setPayments(list);
      applyClientFilters(list, filterPaymentMode, filterStatus);
    } catch (e) {
      toast.error(e.message || "Failed to load advances");
    } finally {
      setLoading(false);
    }
  };

  // ── Client filters — EXCLUDE "Edited" entries from display ─────────────────
  const applyClientFilters = (data, mode, status) => {
    // Only show Pending, Paid, Cancelled — never Edited (those are history)
    let filtered = data.filter(p => p.status !== "Edited");
    if (mode)   filtered = filtered.filter(p => p.payment_mode === mode);
    if (status) filtered = filtered.filter(p => p.status === status);
    setFilteredPayments(filtered);
  };

  useEffect(() => {
    applyClientFilters(payments, filterPaymentMode, filterStatus);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPaymentMode, filterStatus, payments]);

  const handleSearchFilters = () => fetchAdvancesByDate(filterFromDate, filterToDate);

  const handleResetFilters = () => {
    setFilterFromDate(today()); setFilterToDate(today());
    setFilterPaymentMode(""); setFilterStatus("");
    fetchAdvancesByDate(today(), today());
  };

  // ── Load admission ─────────────────────────────────────────────────────────
  const loadActiveAdmission = async (params) => {
    try {
      const qs  = new URLSearchParams(params).toString();
      const res = await apiRequest(`${BASE}get_active_admission/?${qs}`, "GET");
      const adm = res?.data?.data ?? res?.data ?? res;

      if (!adm?.ipNumber && !adm?.uhid) {
        return toast.error("No active admission found");
      }

      const patient = adm.patient || {};

      // ✅ Doctor Name (priority: name → id fallback)
      const doctor = adm.admittingDoctorName || adm.admittingDoctor || "";

      // ✅ Room + Bed
      let roomNo = adm.roomNo || "";
      let bedNo  = adm.bedNo || "";

      if (!roomNo && Array.isArray(adm.room_details)) {
        const active = [...adm.room_details]
          .reverse()
          .find(r => r?.is_roomActive);

        roomNo = active?.roomNo || "";
        bedNo  = active?.bedNo  || "";
      }

      // ✅ Patient Name Build
      const nameParts = [
        adm.salutation  || patient.salutation,
        adm.firstName   || patient.firstName || patient.patientname,
        adm.middleName  || patient.middleName,
        adm.lastName    || patient.lastName,
      ].filter(Boolean);

      // ✅ Admission Date + Time Formatting
      let formattedDateTime = "";

      // 🔹 1. Prefer backend formatted value
      if (adm.admissionDateTime) {
        formattedDateTime = adm.admissionDateTime;
      }
      // 🔹 2. Fallback (combine date + time)
      else if (adm.admissionDate && adm.admissionTime) {
        const raw = `${adm.admissionDate} ${adm.admissionTime}`;
        const dt = new Date(raw);

        if (!isNaN(dt)) {
          formattedDateTime = dt.toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        } else {
          formattedDateTime = `${adm.admissionDate} ${adm.admissionTime}`;
        }
      }

      // ✅ Set State
      setAdmId(adm.ipNumber);

      setCommon((prev) => ({
        ...prev,
        uhid:            adm.uhid || prev.uhid,
        ipNumber:        adm.ipNumber || prev.ipNumber,
        name:            nameParts.join(" ") || prev.name,
        age:             adm.age || patient.age || prev.age,
        gender:          adm.gender || patient.gender || prev.gender,
        address:
          adm.permanent_address ||
          patient.permanent_address ||
          [patient.area, patient.city, patient.state, patient.zipcode]
            .filter(Boolean)
            .join(", ") ||
          prev.address,

        customer_type:
          adm.customerType ||
          adm.customer_type ||
          patient.customerType ||
          prev.customer_type,

        company:
          adm.insuranceCompanyName ||
          patient.insuranceCompanyName ||
          adm.insuranceCompany ||
          prev.company,

        roomNo,
        bedNo,

        // ✅ FINAL OUTPUT
        admittingDate:   formattedDateTime,
        admittingDoctor: doctor,

        creditLimit:
          adm.creditLimit != null ? adm.creditLimit : prev.creditLimit,
      }));

      toast.success(`Admission loaded: ${adm.ipNumber}`);

    } catch (err) {
      console.error(err);
      toast.error(err?.message || "No active admission found");
    }
  };

  const searchByUHID = () => {
    const u = common.uhid.trim();
    if (!u) return toast.warning("Enter UHID");
    loadActiveAdmission({ uhid: u });
  };

  const searchByIP = () => {
    const ip = common.ipNumber.trim();
    if (!ip) return toast.warning("Enter IP Number");
    loadActiveAdmission({ ip_number: ip });
  };

  // ── Save (new or edited) ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!admissionId)             return toast.warning("Load an admission first");
    if (total <= 0)               return toast.warning("Enter a valid advance amount");
    if (splitTouched && !splitOk)
      return toast.warning("IP Advance + Billing Advance must equal Advance Amount");

    setSaving(true);
    try {
      if (editingRecord) {
        // PUT = mark old as Edited + create new entry in one call
        const res = await apiRequest(
          `${BASE}admission-advance/${encodeURIComponent(admissionId)}/`,
          "PUT",
          {
            advance_id:      editingRecord.advance_id,   // old entry to mark Edited
            date,
            advance_amount:  total,
            ip_advance:      splitIP,
            billing_advance: splitBill,
            payment_mode:    paymentMode,
          }
        );
        if (!res.success) throw new Error(res.error || "Edit failed");
        toast.success("Advance updated!");
        cancelEditMode();
      } else {
        // POST = fresh entry
        const res = await apiRequest(
          `${BASE}admission-advance/${encodeURIComponent(admissionId)}/`,
          "POST",
          { date, advance_amount: total, ip_advance: splitIP, billing_advance: splitBill, payment_mode: paymentMode }
        );
        if (!res.success) throw new Error(res.error || "Save failed");
        toast.success("Advance saved!");
      }
      setAmount(""); setIpAdv(""); setBillAdv(""); setDate(today()); setPaymentMode("Cash");
      fetchAdvancesByDate(filterFromDate, filterToDate);
    } catch (e) {
      toast.error(e.message || "Failed to save advance");
    } finally {
      setSaving(false);
    }
  };

  // ── Trigger Edit (fill form in-place) ─────────────────────────────────────
  const handleEdit = (record) => {
    // Load the IP admission first so admissionId is set
    const ipNo = record.ip_number || record.ipNumber;
    if (!ipNo || ipNo === "—") return toast.error("Cannot determine IP number for this record");

    // Set form fields from the record
    setDate(record.date || today());
    setAmount(String(record.advance_amount || ""));
    setIpAdv(String(record.ip_advance || ""));
    setBillAdv(String(record.billing_advance || ""));
    setPaymentMode(record.payment_mode || "Cash");
    setEditingRecord(record);

    // Load admission details into the patient card
    loadActiveAdmission({ ip_number: ipNo });

    // Scroll to the advance input form
    setTimeout(() => {
      advanceFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);

    toast.info(`Editing advance ${record.advance_id} — modify and click Update`);
  };

  const cancelEditMode = () => {
    setEditingRecord(null);
    setAmount(""); setIpAdv(""); setBillAdv(""); setDate(today()); setPaymentMode("Cash");
  };

  // ── Cancel advance ────────────────────────────────────────────────────────
  const handleCancel = async (advanceId, ipNumber) => {
    if (!window.confirm("Cancel this advance entry?")) return;
    try {
      const res = await apiRequest(
        `${BASE}admission-advance/${encodeURIComponent(ipNumber)}/`,
        "PATCH",
        { advance_id: advanceId }
      );
      if (!res.success) throw new Error(res.error || "Cancel failed");
      toast.success("Advance cancelled");
      fetchAdvancesByDate(filterFromDate, filterToDate);
    } catch (e) {
      toast.error(e.message || "Failed to cancel");
    }
  };

  // ── Print ─────────────────────────────────────────────────────────────────
  const openPrintModal  = (record) => { setPrintRecord(record); setPrintModalOpen(true); };
  const closePrintModal = ()       => { setPrintModalOpen(false); setPrintRecord(null); };

const handlePrint = () => {
  if (!printRecord) return;

  const paymentMode =
    printRecord.payment_mode ||
    printRecord.payment_details?.method ||
    "—";

  const paidDateRaw =
    printRecord.paid_date || printRecord.paid_datetime;

  const paidDate = paidDateRaw
    ? new Date(paidDateRaw).toLocaleString("en-IN")
    : "—";

  const billDate = printRecord.bill_date
    ? new Date(printRecord.bill_date).toLocaleString("en-IN")
    : "—";

  const w = window.open("", "", "height=600,width=750");

  w.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Advance Slip</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Courier New', monospace;
            background: #fff;
            display: flex;
            justify-content: center;
            padding: 20px;
          }
          .slip {
            width: 100%;
            max-width: 400px;
            padding: 16px;
            border: 2px solid #0f172a;
            background: #fff;
          }
          .bill-header {
            text-align: center;
            border-bottom: 1px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .bill-title { font-size: 14px; font-weight: bold; }
          .bill-subtitle { font-size: 11px; color: #64748b; }
          .bill-adv { font-weight: bold; margin-top: 4px; }

          .section { margin-bottom: 10px; font-size: 12px; }
          .row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
          }
          .row.divider { border-bottom: 1px dotted #e2e8f0; }
          .row.bold { font-weight: bold; }
          .lbl { font-weight: bold; }
          .val { text-align: right; }
          .val.bold { font-weight: bold; }

          .signature {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #0f172a;
            font-size: 11px;
            margin-bottom: 20px;
          }
        </style>
      </head>

      <body>
        <div class="slip">

          <div class="bill-header">
            <div class="bill-title">SHANMUGA HOSPITAL LIMITED</div>
            <div class="bill-subtitle">Sh2/1-1, Sardar Patel Road, Salem - 636007</div>
            <div class="bill-subtitle">Ph: 04272706666</div>
            <div class="bill-adv">Advance Slip</div>
          </div>

          <div class="section">
            <div class="row"><span class="lbl">IP Number</span><span class="val">${printRecord.ip_number || printRecord.ipNumber || "—"}</span></div>
            <div class="row"><span class="lbl">Name</span><span class="val">${printRecord.patient_name || printRecord.name || "—"}</span></div>
            <div class="row"><span class="lbl">Bill Date</span><span class="val">${billDate}</span></div>
            <div class="row"><span class="lbl">Bill No</span><span class="val bold">${printRecord.bill_no || "—"}</span></div>

            <!-- ✅ Payment Mode -->
            <div class="row"><span class="lbl">Payment Mode</span><span class="val">${paymentMode}</span></div>

            <!-- ✅ Paid Date -->
            <div class="row"><span class="lbl">Paid Date</span><span class="val">${paidDate}</span></div>
          </div>

          <div class="section">
            <div class="row divider"><span class="lbl">Description</span><span class="val">Amount</span></div>
            <div class="row"><span>1. IP Advance</span><span class="val bold">₹${fmt(printRecord.ip_advance)}</span></div>
            <div class="row"><span>2. Billing Advance</span><span class="val bold">₹${fmt(printRecord.billing_advance)}</span></div>
          </div>

          <div class="section">
            <div class="row divider bold">
              <span class="lbl">User: ${printRecord.created_by || "—"}</span>
              <span class="val">Total ₹${fmt(printRecord.advance_amount)}</span>
            </div>
          </div>

          <div class="signature">Signature Of Cashier</div>

        </div>
      </body>
    </html>
  `);

  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
    w.close();
  }, 300);
};

  const handleResetForm = () => {
    setCommon(EMPTY_COMMON);
    setAdmId(null);
    cancelEditMode();
  };

  const handleAmountChange = (val) => { setAmount(val); setIpAdv(""); setBillAdv(""); };
  const handleIpAdvChange  = (val) => {
    setIpAdv(val);
    const rem = total - (parseFloat(val) || 0);
    setBillAdv(rem >= 0 ? rem.toFixed(2) : "");
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeAll    = payments.filter(p => p.is_advanceActive);
  const totalActive  = activeAll.reduce((s, p) => s + (parseFloat(p.advance_amount)  || 0), 0);
  const totalIPSum   = activeAll.reduce((s, p) => s + (parseFloat(p.ip_advance)       || 0), 0);
  const totalBillSum = activeAll.reduce((s, p) => s + (parseFloat(p.billing_advance)  || 0), 0);

  // ── Per-row action permissions ────────────────────────────────────────────
  const canEdit   = (p) => p.status === "Pending";                         // only Pending
  const canCancel = (p) => p.status === "Pending" || p.status === "Paid";  // Pending or Paid
  const canPrint  = ()  => true;                                            // always

  return (
    <>
      <GlobalStyle />
      <Page className="no-print">
        <PageTitle>💳 IP Advance Entry & Management</PageTitle>

        {/* ── PATIENT & ADMISSION ── */}
        <Card>
          <CardHead color="teal">
            <span>🏥 Patient &amp; Admission Details</span>
          </CardHead>
          <CardBody>
            <Grid cols={6}>
              <GroupLabel c="teal">Search Admission</GroupLabel>
              <F span={2}>
                <Lbl>UHID</Lbl>
                <Inp value={common.uhid} placeholder="Enter UHID"
                  onChange={e => setCommon(p => ({ ...p, uhid: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && searchByUHID()} />
              </F>
              <F span={2}>
                <Lbl>IP No</Lbl>
                <Inp value={common.ipNumber} placeholder="Enter IP No"
                  onChange={e => setCommon(p => ({ ...p, ipNumber: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && searchByIP()} />
              </F>
              <F span={1}><Lbl>&nbsp;</Lbl><Btn onClick={searchByUHID}>🔍 Search</Btn></F>
              <F span={1}><Lbl>&nbsp;</Lbl><Btn v="reset" onClick={handleResetForm}>↺ Reset</Btn></F>

              <GroupLabel c="teal">Patient Info</GroupLabel>
              <F span={3}><Lbl>Patient Name</Lbl><Inp value={common.name} readOnly /></F>
              <F><Lbl>Age</Lbl><Inp value={common.age} readOnly /></F>
              <F><Lbl>Gender</Lbl><Inp value={common.gender} readOnly /></F>
              <F><Lbl>Customer Type</Lbl><Inp value={common.customer_type} readOnly /></F>
              <F span={4}><Lbl>Address</Lbl><Inp value={common.address} readOnly /></F>
              <F span={2}><Lbl>Company</Lbl><Inp value={common.company} readOnly /></F>

              <GroupLabel c="teal">Admission Details</GroupLabel>
              <F><Lbl>Room No</Lbl><Inp value={common.roomNo} readOnly /></F>
              <F><Lbl>Bed No</Lbl><Inp value={common.bedNo} readOnly /></F>
              <F span={2}><Lbl>Admitting Date</Lbl><Inp value={common.admittingDate} readOnly /></F>
              <F span={2}><Lbl>Admitting Doctor</Lbl><Inp value={common.admittingDoctor} readOnly /></F>
              <F span={2} />
            </Grid>
          </CardBody>
        </Card>

        {/* ── ADVANCE INPUT FORM ── */}
        <div ref={advanceFormRef}>
          <Card editing={!!editingRecord}>
            <CardHead color={editingRecord ? "orange" : "teal"}>
              <span>{editingRecord ? "✏️ Edit Advance" : "💵 Advance Input"}</span>
              {editingRecord && (
                <span style={{ fontSize: "0.68rem", opacity: 0.9, fontWeight: 500 }}>
                  Editing: {editingRecord.advance_id} | Bill: {editingRecord.bill_no}
                </span>
              )}
            </CardHead>

            {editingRecord && (
              <EditBanner>
                ⚠️ You are editing an existing advance. The original entry will be marked as
                <strong style={{ marginLeft: 4 }}>Edited</strong> and a new entry will be created.
              </EditBanner>
            )}

            <CardBody>
              <Grid cols={6}>
                <GroupLabel c="teal">Payment Details</GroupLabel>
                <F span={1}>
                  <Lbl>Date</Lbl>
                  <Inp type="date" value={date} onChange={e => setDate(e.target.value)} />
                </F>
                <F span={2}>
                  <Lbl>Advance Amount (₹)</Lbl>
                  <BigInp type="number" min="0" step="0.01"
                    value={amount} placeholder="Enter total advance amount"
                    onChange={e => handleAmountChange(e.target.value)} />
                </F>
                <F span={2} />

                <SplitBox>
                  <SplitHeader>↳ Split Advance</SplitHeader>
                  <SplitGrid>
                    <F>
                      <Lbl>IP Advance (₹)</Lbl>
                      <Inp type="number" min="0" step="0.01"
                        value={ipAdv} placeholder="0.00"
                        disabled={total <= 0}
                        onChange={e => handleIpAdvChange(e.target.value)} />
                    </F>
                    <F>
                      <Lbl>Billing Advance (₹)</Lbl>
                      <Inp type="number" min="0" step="0.01"
                        value={billAdv} placeholder="0.00"
                        disabled={total <= 0}
                        onChange={e => setBillAdv(e.target.value)} />
                    </F>
                  </SplitGrid>
                  {total > 0 && (
                    <SplitNote ok={!splitTouched || splitOk}>
                      {!splitTouched
                        ? `Total to split: ₹${fmt(total)}`
                        : splitOk
                          ? `✓ Balanced — ₹${fmt(splitIP)} + ₹${fmt(splitBill)} = ₹${fmt(total)}`
                          : `⚠ Mismatch — ₹${fmt(splitIP)} + ₹${fmt(splitBill)} ≠ ₹${fmt(total)}`}
                    </SplitNote>
                  )}
                </SplitBox>
              </Grid>
            </CardBody>

            <ActionBar>
              {editingRecord ? (
                <>
                  <Btn v="reset" onClick={cancelEditMode}>✕ Cancel Edit</Btn>
                  <Btn c="orange"
                    onClick={handleSave}
                    disabled={saving || !admissionId || total <= 0 || (splitTouched && !splitOk)}>
                    {saving ? "Updating…" : "✏️ Update Advance"}
                  </Btn>
                </>
              ) : (
                <>
                  <Btn v="reset" onClick={() => { setAmount(""); setIpAdv(""); setBillAdv(""); setDate(today()); }}>
                    ↺ Reset Form
                  </Btn>
                  <Btn onClick={handleSave}
                    disabled={saving || !admissionId || total <= 0 || (splitTouched && !splitOk)}>
                    {saving ? "Saving…" : "💾 Save Advance"}
                  </Btn>
                </>
              )}
            </ActionBar>
          </Card>
        </div>

        {/* ── FILTERS ── */}
        <Card>
          <CardHead color="blue">🔎 Filters &amp; Search</CardHead>
          <CardBody>
            <Grid cols={6}>
              <F span={2}>
                <Lbl>From Date</Lbl>
                <Inp type="date" value={filterFromDate} onChange={e => setFilterFromDate(e.target.value)} />
              </F>
              <F span={2}>
                <Lbl>To Date</Lbl>
                <Inp type="date" value={filterToDate} onChange={e => setFilterToDate(e.target.value)} />
              </F>
              <F span={2}>
                <Lbl>Status</Lbl>
                <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </Select>
              </F>
              <F span={1}><Lbl>&nbsp;</Lbl>
                <Btn onClick={handleSearchFilters} disabled={loading}>
                  {loading ? "Loading…" : "🔍 Search"}
                </Btn>
              </F>
              <F span={1}><Lbl>&nbsp;</Lbl>
                <Btn v="reset" onClick={handleResetFilters}>Reset Filters</Btn>
              </F>
            </Grid>
          </CardBody>
        </Card>

        {/* ── RECORDS TABLE ── */}
        <Card>
          <CardHead color="violet">📋 Advance Payment Records</CardHead>
          <TblWrap>
            <Tbl>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Bill Date</Th>
                  <Th>Bill No</Th>
                  <Th>IP No</Th>
                  <Th>Patient Name</Th>
                  <Th>Payment Mode</Th>
                  <Th>Paid Date</Th>
                  <Th right>Advance Amount</Th>
                  <Th right>IP Advance</Th>
                  <Th right>Billing Advance</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <Td colSpan={11} style={{ textAlign: "center", padding: 28, color: T.muted }}>
                      ⏳ Loading records…
                    </Td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <Td colSpan={11} style={{ textAlign: "center", padding: 28, color: T.muted }}>
                      No advance records found for the selected date range / filters
                    </Td>
                  </tr>
                ) : (
                  filteredPayments.map((p, i) => {
                    const status      = p.status || "Pending";
                    const billDate    = p.bill_date
                      ? new Date(p.bill_date).toLocaleDateString("en-IN") : "—";
                    const patientName = p.patient_name || p.name || p.patientName || "—";
                    const ipNo        = p.ip_number    || p.ipNumber || "—";
                    const menuId      = p.advance_id || `row-${i}`;

                    const allowEdit   = canEdit(p);
                    const allowCancel = canCancel(p);

                    return (
                      <Tr key={menuId} even={i % 2 === 0}>
                        <Td style={{ fontWeight: 700, color: T.muted }}>{i + 1}</Td>
                        <Td>{billDate}</Td>
                        <Td style={{ fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 700 }}>
                          {p.bill_no || "—"}
                        </Td>
                        <Td style={{ fontWeight: 700, color: T.tealDark }}>{ipNo}</Td>
                        <Td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {patientName}
                        </Td>
                        <Td>{p.payment_mode || "-"}</Td>
                        <Td>
                          {p.paid_date
                            ? new Date(p.paid_date).toLocaleString("en-IN")
                            : "-"}
                        </Td>
                        <Td right style={{ fontWeight: 700 }}>₹{fmt(p.advance_amount)}</Td>
                        <Td right>₹{fmt(p.ip_advance)}</Td>
                        <Td right>₹{fmt(p.billing_advance)}</Td>
                        <Td>
                          <StatusBadge status={status}>{status}</StatusBadge>
                        </Td>
                        <Td style={{ position: "relative", overflow: "visible" }}>
                          <KebabWrap>
                            <KebabBtn onClick={(e) => toggleMenu(menuId, e)} title="Actions">
                              ⋮
                            </KebabBtn>
                            <DropMenu open={openMenuId === menuId}>

                              {/* EDIT */}
                              <DropItem
                                disabled={!allowEdit}
                                title={!allowEdit ? `Cannot edit — status is ${status}` : "Edit this advance"}
                                onClick={() => {
                                  if (!allowEdit) return;
                                  setOpenMenuId(null);
                                  handleEdit(p);
                                }}
                              >
                                ✏️ Edit
                                {!allowEdit && (
                                  <span style={{ marginLeft: "auto", fontSize: "0.6rem", color: T.muted }}>
                                    {status}
                                  </span>
                                )}
                              </DropItem>

                              {/* PRINT */}
                              <DropItem
                                onClick={() => { setOpenMenuId(null); openPrintModal(p); }}
                              >
                                🖨️ Print Slip
                              </DropItem>

                              <DropDivider />

                              {/* CANCEL */}
                              <DropItem
                                danger
                                disabled={!allowCancel}
                                title={!allowCancel ? `Cannot cancel — status is ${status}` : "Cancel this advance"}
                                onClick={() => {
                                  if (!allowCancel) return;
                                  setOpenMenuId(null);
                                  handleCancel(p.advance_id, ipNo);
                                }}
                              >
                                {status === "Cancelled" ? "✕ Cancelled" : "✕ Cancel Advance"}
                                {!allowCancel && (
                                  <span style={{ marginLeft: "auto", fontSize: "0.6rem", color: T.muted }}>
                                    {status}
                                  </span>
                                )}
                              </DropItem>

                            </DropMenu>
                          </KebabWrap>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Tbl>
          </TblWrap>

          <CardBody style={{ background: "#f9fafb", padding: "10px 14px", fontSize: "0.72rem", color: T.muted }}>
            Showing <strong>{filteredPayments.length}</strong> records &nbsp;|&nbsp;
            Pending: <strong>{filteredPayments.filter(p => p.status === "Pending").length}</strong> &nbsp;|&nbsp;
            Paid: <strong>{filteredPayments.filter(p => p.status === "Paid").length}</strong> &nbsp;|&nbsp;
            Cancelled: <strong>{filteredPayments.filter(p => p.status === "Cancelled").length}</strong>
          </CardBody>
        </Card>
      </Page>

      {/* ── PRINT MODAL ── */}
      {printModalOpen && printRecord && (
      <ModalOverlay onClick={closePrintModal}>
        <ModalBox onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Advance Payment Slip</ModalTitle>
            <CloseBtn onClick={closePrintModal}>×</CloseBtn>
          </ModalHeader>

          <ModalBody>
            <BillSlipContainer ref={printRef} className="print-container">

              <BillHeader>
                <BillTitle>SHANMUGA HOSPITAL LIMITED</BillTitle>
                <BillSubtitle>Sh2/1-1, Sardar Patel Road, Salem - 636007</BillSubtitle>
                <BillSubtitle>Ph: 04272706666</BillSubtitle>
                <div style={{ fontWeight: "bold", marginTop: "4px" }}>
                  Advance Slip
                </div>
              </BillHeader>

              {/* 🔹 Extract values safely */}
              {(() => {
                const paymentMode =
                  printRecord.payment_mode ||
                  printRecord.payment_details?.method ||
                  "—";

                const paidDate = printRecord.paid_date || printRecord.paid_datetime;

                return (
                  <>
                    <BillSection>
                      <BillRow>
                        <BillLabel>IP Number</BillLabel>
                        <BillValue>{printRecord.ip_number || printRecord.ipNumber || "—"}</BillValue>
                      </BillRow>

                      <BillRow>
                        <BillLabel>Name</BillLabel>
                        <BillValue>{printRecord.patient_name || printRecord.name || "—"}</BillValue>
                      </BillRow>

                      <BillRow>
                        <BillLabel>Bill Date</BillLabel>
                        <BillValue>
                          {printRecord.bill_date
                            ? new Date(printRecord.bill_date).toLocaleString("en-IN")
                            : "—"}
                        </BillValue>
                      </BillRow>

                      <BillRow>
                        <BillLabel>Bill No</BillLabel>
                        <BillValue style={{ fontWeight: "bold" }}>
                          {printRecord.bill_no || "—"}
                        </BillValue>
                      </BillRow>

                      {/* ✅ Payment Mode */}
                      <BillRow>
                        <BillLabel>Payment Mode</BillLabel>
                        <BillValue>{paymentMode}</BillValue>
                      </BillRow>

                      {/* ✅ Paid Date */}
                      <BillRow>
                        <BillLabel>Paid Date</BillLabel>
                        <BillValue>
                          {paidDate
                            ? new Date(paidDate).toLocaleString("en-IN")
                            : "—"}
                        </BillValue>
                      </BillRow>
                    </BillSection>

                    <BillSection>
                      <BillRow divider>
                        <BillLabel>Description</BillLabel>
                        <BillValue>Amount</BillValue>
                      </BillRow>

                      <BillRow>
                        <span>1. IP Advance</span>
                        <BillValue style={{ fontWeight: "bold" }}>
                          ₹{fmt(printRecord.ip_advance)}
                        </BillValue>
                      </BillRow>

                      <BillRow>
                        <span>2. Billing Advance</span>
                        <BillValue style={{ fontWeight: "bold" }}>
                          ₹{fmt(printRecord.billing_advance)}
                        </BillValue>
                      </BillRow>
                    </BillSection>

                    <BillSection>
                      <BillRow divider style={{ fontWeight: "bold" }}>
                        <BillLabel>User: {printRecord.created_by || "—"}</BillLabel>
                        <BillValue>
                          Total ₹{fmt(printRecord.advance_amount)}
                        </BillValue>
                      </BillRow>
                    </BillSection>

                    <BillSection
                      style={{
                        textAlign: "center",
                        marginTop: "20px",
                        paddingTop: "10px",
                        borderTop: "1px solid " + T.text
                      }}
                    >
                      <div style={{ fontSize: "11px", marginBottom: "20px" }}>
                        Signature Of Cashier
                      </div>
                    </BillSection>
                  </>
                );
              })()}

            </BillSlipContainer>

            <ModalActions>
              <Btn v="reset" onClick={closePrintModal}>Close</Btn>
              <Btn c="blue" onClick={handlePrint}>🖨️ Print</Btn>
            </ModalActions>
          </ModalBody>
        </ModalBox>
      </ModalOverlay>
      )}
    </>
  );
}