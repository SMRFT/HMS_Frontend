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
};

const rowIn = keyframes`
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
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
  border: 1px solid ${T.border};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
`;

const CardHead = styled.div`
  background: ${({ color }) =>
    color === "blue"   ? "linear-gradient(135deg,#1d4ed8,#2563eb)" :
    color === "violet" ? "linear-gradient(135deg,#6d28d9,#7c3aed)" :
                         "linear-gradient(135deg,#0f766e,#0d9488)"};
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 9px 14px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 7px;
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
    v === "reset" ? "#e2e8f0" :
    c === "blue"  ? T.blue   :
    c === "violet"? T.violet : T.teal};
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
  padding: 0 14px 14px;
`;

const Tbl = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.71rem;
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
    status === "Paid"      ? T.greenLight :
    status === "Cancelled" ? T.redLight   : T.amberLight};
  color: ${({ status }) =>
    status === "Paid"      ? T.green :
    status === "Cancelled" ? T.red   : T.amber};
  border: 1px solid ${({ status }) =>
    status === "Paid"      ? "#bbf7d0" :
    status === "Cancelled" ? "#fecaca" : "#fed7aa"};
`;

const ActionBtnGroup = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  height: 21px;
  padding: 0 8px;
  font-size: 0.63rem;
  font-weight: 700;
  border-radius: 4px;
  border: 1.5px solid ${({ type }) => type === "cancel" ? T.red : T.blue};
  background: ${({ type }) => type === "cancel" ? T.redLight : T.blueLight};
  color: ${({ type }) => type === "cancel" ? T.red : T.blue};
  cursor: ${({ disabled }) => disabled ? "not-allowed" : "pointer"};
  transition: all .13s;
  &:hover:not(:disabled) {
    background: ${({ type }) => type === "cancel" ? T.red : T.blue};
    color: #fff;
  }
  &:disabled { opacity: .4; cursor: not-allowed; }
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid ${T.border};
`;

const Stat = styled.div`
  background: ${({ bg }) => bg};
  border: 1px solid ${({ bd }) => bd};
  border-radius: 7px;
  padding: 7px 11px;
`;

const StatL = styled.div`
  font-size: 0.62rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .05em;
  color: ${({ c }) => c};
`;
const StatV = styled.div`
  font-size: .95rem; font-weight: 800; margin-top: 2px;
  color: ${({ c }) => c};
`;

// ── Modal ─────────────────────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
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

const BillHeader = styled.div`
  text-align: center;
  border-bottom: 1px solid ${T.text};
  padding-bottom: 8px; margin-bottom: 12px;
`;

const BillTitle    = styled.div`font-size: 14px; font-weight: bold; margin-bottom: 2px;`;
const BillSubtitle = styled.div`font-size: 11px; color: ${T.muted}; margin-bottom: 4px;`;
const BillSection  = styled.div`margin-bottom: 10px; font-size: 12px;`;

const BillRow = styled.div`
  display: flex; justify-content: space-between; padding: 3px 0;
  border-bottom: ${({ divider }) => divider ? `1px dotted ${T.border}` : "none"};
`;

const BillLabel = styled.span`font-weight: bold;`;
const BillValue = styled.span`text-align: right;`;

// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_COMMON = {
  uhid: "", ipNumber: "", name: "", age: "", gender: "",
  roomNo: "", bedNo: "", admittingDate: "", admittingDoctor: "",
  customer_type: "", company: "", address: "",
  creditLimit: "", outBalance: "", totalAdvance: "",
};

const today = () => new Date().toISOString().split("T")[0];

export default function IPAdvance() {
  const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Admission (for Save form only) ───────────────────────────────────────
  const [common, setCommon]       = useState(EMPTY_COMMON);
  const [admissionId, setAdmId]   = useState(null);

  // ── Entry form ────────────────────────────────────────────────────────────
  const [date, setDate]             = useState(today());
  const [amount, setAmount]         = useState("");
  const [ipAdv, setIpAdv]           = useState("");
  const [billAdv, setBillAdv]       = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [saving, setSaving]         = useState(false);

  // ── Records ───────────────────────────────────────────────────────────────
  const [payments, setPayments]               = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading]                 = useState(false);

  // ── Filters (default = today) ─────────────────────────────────────────────
  const [filterFromDate, setFilterFromDate]     = useState(today());
  const [filterToDate, setFilterToDate]         = useState(today());
  const [filterPaymentMode, setFilterPaymentMode] = useState("");
  const [filterStatus, setFilterStatus]         = useState("");

  // ── Print ─────────────────────────────────────────────────────────────────
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printRecord, setPrintRecord]       = useState(null);
  const printRef = useRef(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const total        = parseFloat(amount) || 0;
  const splitIP      = parseFloat(ipAdv)  || 0;
  const splitBill    = parseFloat(billAdv)|| 0;
  const splitTouched = ipAdv !== "" || billAdv !== "";
  const splitOk      = total > 0 && Math.abs(splitIP + splitBill - total) < 0.01;
  const fmt = (v) => parseFloat(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  // ── Load today's data on mount ────────────────────────────────────────────
  useEffect(() => {
    fetchAdvancesByDate(today(), today());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch all advances by date range (no ip_number needed) ───────────────
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

  // ── Client-side: filter by payment mode & status ──────────────────────────
  const applyClientFilters = (data, mode, status) => {
    let filtered = [...data];
    if (mode)   filtered = filtered.filter(p => p.payment_mode === mode);
    if (status) filtered = filtered.filter(p => p.status === status);
    setFilteredPayments(filtered);
  };

  useEffect(() => {
    applyClientFilters(payments, filterPaymentMode, filterStatus);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPaymentMode, filterStatus, payments]);

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearchFilters = () => {
    fetchAdvancesByDate(filterFromDate, filterToDate);
  };

  const handleResetFilters = () => {
    setFilterFromDate(today());
    setFilterToDate(today());
    setFilterPaymentMode("");
    setFilterStatus("");
    fetchAdvancesByDate(today(), today());
  };

  // ── Load admission (for Save form) ────────────────────────────────────────
  const loadActiveAdmission = async (params) => {
    try {
      const qs  = new URLSearchParams(params).toString();
      const res = await apiRequest(`${BASE}get_active_admission/?${qs}`, "GET");
      const adm = res?.data?.data ?? res?.data ?? res;

      if (!adm?.ipNumber && !adm?.uhid) return toast.error("No active admission found");

      const patient = adm.patient || {};
      const doctor  = adm.admittingDoctorName || adm.admittingDoctor || "";

      let roomNo = adm.roomNo || "";
      let bedNo  = adm.bedNo  || "";
      if (!roomNo && Array.isArray(adm.room_details)) {
        const active = [...adm.room_details].reverse().find(r => r?.is_roomActive);
        roomNo = active?.roomNo || "";
        bedNo  = active?.bedNo  || "";
      }

      const nameParts = [
        adm.salutation  || patient.salutation,
        adm.firstName   || patient.firstName || patient.patientname,
        adm.middleName  || patient.middleName,
        adm.lastName    || patient.lastName,
      ].filter(Boolean);

      setAdmId(adm.ipNumber);
      setCommon(p => ({
        ...p,
        uhid:            adm.uhid || p.uhid,
        ipNumber:        adm.ipNumber || p.ipNumber,
        name:            nameParts.join(" ") || p.name,
        age:             adm.age || patient.age || p.age,
        gender:          adm.gender || patient.gender || p.gender,
        address:         adm.permanent_address || patient.permanent_address
                           || [patient.area, patient.city, patient.state, patient.zipcode]
                               .filter(Boolean).join(", ") || p.address,
        customer_type:   adm.customerType || adm.customer_type || patient.customerType || p.customer_type,
        company:         adm.insuranceCompanyName || patient.insuranceCompanyName || adm.insuranceCompany || p.company,
        roomNo, bedNo,
        admittingDate:   adm.admissionDateTime
                           ? new Date(adm.admissionDateTime).toLocaleDateString("en-IN") : "",
        admittingDoctor: doctor,
        creditLimit:     adm.creditLimit != null ? adm.creditLimit : "",
      }));

      toast.success(`Admission loaded: ${adm.ipNumber}`);
    } catch (err) {
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

  // ── Save advance ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!admissionId)            return toast.warning("Load an admission first");
    if (total <= 0)              return toast.warning("Enter a valid advance amount");
    if (splitTouched && !splitOk)
      return toast.warning("IP Advance + Billing Advance must equal Advance Amount");

    setSaving(true);
    try {
      const res = await apiRequest(
        `${BASE}admission-advance/${encodeURIComponent(admissionId)}/`,
        "POST",
        { date, advance_amount: total, ip_advance: splitIP, billing_advance: splitBill, payment_mode: paymentMode }
      );
      if (!res.success) throw new Error(res.error || "Save failed");
      toast.success("Advance saved!");
      setAmount(""); setIpAdv(""); setBillAdv(""); setDate(today()); setPaymentMode("Cash");
      fetchAdvancesByDate(filterFromDate, filterToDate);
    } catch (e) {
      toast.error(e.message || "Failed to save advance");
    } finally {
      setSaving(false);
    }
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
    if (!printRef.current) return;
    const w = window.open("", "", "height=600,width=700");
    w.document.write(printRef.current.innerHTML);
    w.document.close();
    w.print();
  };

  const handleResetForm = () => {
    setCommon(EMPTY_COMMON);
    setAdmId(null);
    setAmount(""); setIpAdv(""); setBillAdv(""); setDate(today()); setPaymentMode("Cash");
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

  return (
    <>
      <GlobalStyle />
      <Page className="no-print">
        <PageTitle>💳 IP Advance Entry & Management</PageTitle>

        {/* ════════════════════════════════════════════════
            PATIENT & ADMISSION (for Save entry only)
        ════════════════════════════════════════════════ */}
        <Card>
          <CardHead color="teal">🏥 Patient & Admission Details</CardHead>
          <CardBody>
            <Grid cols={6}>
              <GroupLabel c="teal">Search Admission</GroupLabel>

              <F span={2}>
                <Lbl>UHID</Lbl>
                <Inp
                  value={common.uhid}
                  placeholder="Enter UHID"
                  onChange={e => setCommon(p => ({ ...p, uhid: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && searchByUHID()}
                />
              </F>

              <F span={2}>
                <Lbl>IP No</Lbl>
                <Inp
                  value={common.ipNumber}
                  placeholder="Enter IP No"
                  onChange={e => setCommon(p => ({ ...p, ipNumber: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && searchByIP()}
                />
              </F>

              <F span={1}>
                <Lbl>&nbsp;</Lbl>
                <Btn onClick={searchByUHID}>🔍 Search</Btn>
              </F>

              <F span={1}>
                <Lbl>&nbsp;</Lbl>
                <Btn v="reset" onClick={handleResetForm}>↺ Reset</Btn>
              </F>

              <GroupLabel c="teal">Patient Info</GroupLabel>

              <F span={3}>
                <Lbl>Patient Name</Lbl>
                <Inp value={common.name} readOnly />
              </F>
              <F>
                <Lbl>Age</Lbl>
                <Inp value={common.age} readOnly />
              </F>
              <F>
                <Lbl>Gender</Lbl>
                <Inp value={common.gender} readOnly />
              </F>
              <F>
                <Lbl>Customer Type</Lbl>
                <Inp value={common.customer_type} readOnly />
              </F>

              <F span={4}>
                <Lbl>Address</Lbl>
                <Inp value={common.address} readOnly />
              </F>
              <F span={2}>
                <Lbl>Company</Lbl>
                <Inp value={common.company} readOnly />
              </F>

              <GroupLabel c="teal">Admission Details</GroupLabel>

              <F>
                <Lbl>Room No</Lbl>
                <Inp value={common.roomNo} readOnly />
              </F>
              <F>
                <Lbl>Bed No</Lbl>
                <Inp value={common.bedNo} readOnly />
              </F>
              <F span={2}>
                <Lbl>Admitting Date</Lbl>
                <Inp value={common.admittingDate} readOnly />
              </F>
              <F span={2}>
                <Lbl>Admitting Doctor</Lbl>
                <Inp value={common.admittingDoctor} readOnly />
              </F>

              <F>
                <Lbl>Credit Limit (₹)</Lbl>
                <Inp value={common.creditLimit} readOnly />
              </F>
              <F>
                <Lbl>Outstanding Balance (₹)</Lbl>
                <Inp value={common.outBalance} readOnly />
              </F>
              <F span={2}>
                <Lbl>Total Advance (₹)</Lbl>
                <Inp value={common.totalAdvance} readOnly />
              </F>
              <F span={2} />
            </Grid>
          </CardBody>
        </Card>

        {/* ════════════════════════════════════════════════
            ADVANCE INPUT FORM
        ════════════════════════════════════════════════ */}
        <Card>
          <CardHead color="teal">💵 Advance Input</CardHead>
          <CardBody>
            <Grid cols={6}>
              <GroupLabel c="teal">Payment Details</GroupLabel>

              <F span={1}>
                <Lbl>Date</Lbl>
                <Inp type="date" value={date} onChange={e => setDate(e.target.value)} />
              </F>

              <F span={2}>
                <Lbl>Advance Amount (₹)</Lbl>
                <BigInp
                  type="number" min="0" step="0.01"
                  value={amount} placeholder="Enter total advance amount"
                  onChange={e => handleAmountChange(e.target.value)}
                />
              </F>

              <F span={1}>
                <Lbl>Payment Mode</Lbl>
                <Select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Multi Payment">Multi Payment</option>
                </Select>
              </F>

              <F span={2} />

              <SplitBox>
                <SplitHeader>↳ Split Advance</SplitHeader>
                <SplitGrid>
                  <F>
                    <Lbl>IP Advance (₹)</Lbl>
                    <Inp
                      type="number" min="0" step="0.01"
                      value={ipAdv} placeholder="0.00"
                      disabled={total <= 0}
                      onChange={e => handleIpAdvChange(e.target.value)}
                    />
                  </F>
                  <F>
                    <Lbl>Billing Advance (₹)</Lbl>
                    <Inp
                      type="number" min="0" step="0.01"
                      value={billAdv} placeholder="0.00"
                      disabled={total <= 0}
                      onChange={e => setBillAdv(e.target.value)}
                    />
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
            <Btn v="reset" onClick={() => { setAmount(""); setIpAdv(""); setBillAdv(""); setDate(today()); }}>
              ↺ Reset Form
            </Btn>
            <Btn
              onClick={handleSave}
              disabled={saving || !admissionId || total <= 0 || (splitTouched && !splitOk)}
            >
              {saving ? "Saving…" : "💾 Save Advance"}
            </Btn>
          </ActionBar>
        </Card>

        {/* ════════════════════════════════════════════════
            FILTERS — date range fetches from backend
        ════════════════════════════════════════════════ */}
        <Card>
          <CardHead color="blue">🔎 Filters & Search</CardHead>
          <CardBody>
            <Grid cols={6}>
              <F span={2}>
                <Lbl>From Date</Lbl>
                <Inp
                  type="date" value={filterFromDate}
                  onChange={e => setFilterFromDate(e.target.value)}
                />
              </F>

              <F span={2}>
                <Lbl>To Date</Lbl>
                <Inp
                  type="date" value={filterToDate}
                  onChange={e => setFilterToDate(e.target.value)}
                />
              </F>

              <F span={2}>
                <Lbl>Payment Mode</Lbl>
                <Select value={filterPaymentMode} onChange={e => setFilterPaymentMode(e.target.value)}>
                  <option value="">All Modes</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Multi Payment">Multi Payment</option>
                </Select>
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

              <F span={1}>
                <Lbl>&nbsp;</Lbl>
                <Btn onClick={handleSearchFilters} disabled={loading}>
                  {loading ? "Loading…" : "🔍 Search"}
                </Btn>
              </F>

              <F span={1}>
                <Lbl>&nbsp;</Lbl>
                <Btn v="reset" onClick={handleResetFilters}>Reset Filters</Btn>
              </F>
            </Grid>
          </CardBody>
        </Card>

        {/* ════════════════════════════════════════════════
            RECORDS TABLE — all advances for date range
        ════════════════════════════════════════════════ */}
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
                    const isCancelled = p.status === "Cancelled" || !p.is_advanceActive;
                    const billDate    = p.bill_date
                      ? new Date(p.bill_date).toLocaleDateString("en-IN") : "—";
                    const patientName = p.patient_name || p.name || p.patientName || "—";
                    const ipNo        = p.ip_number    || p.ipNumber || "—";

                    return (
                      <Tr key={p.advance_id || i} even={i % 2 === 0}>
                        <Td style={{ fontWeight: 700, color: T.muted }}>{i + 1}</Td>
                        <Td>{billDate}</Td>
                        <Td style={{ fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 700 }}>
                          {p.bill_no || "—"}
                        </Td>
                        <Td style={{ fontWeight: 700, color: T.tealDark }}>{ipNo}</Td>
                        <Td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {patientName}
                        </Td>
                        <Td>{p.payment_mode || "—"}</Td>
                        <Td right style={{ fontWeight: 700 }}>₹{fmt(p.advance_amount)}</Td>
                        <Td right>₹{fmt(p.ip_advance)}</Td>
                        <Td right>₹{fmt(p.billing_advance)}</Td>
                        <Td>
                          <StatusBadge status={p.status || "Pending"}>
                            {p.status || "Pending"}
                          </StatusBadge>
                        </Td>
                        <Td>
                          <ActionBtnGroup>
                            <ActionBtn type="print" onClick={() => openPrintModal(p)}>
                              🖨️ Print
                            </ActionBtn>
                            {!isCancelled ? (
                              <ActionBtn type="cancel" onClick={() => handleCancel(p.advance_id, ipNo)}>
                                ✕ Cancel
                              </ActionBtn>
                            ) : (
                              <ActionBtn type="cancel" disabled>✕ Cancelled</ActionBtn>
                            )}
                          </ActionBtnGroup>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Tbl>
          </TblWrap>

          <CardBody style={{ background: "#f9fafb", padding: "12px 14px", fontSize: "0.75rem", color: T.muted }}>
            Showing <strong>{filteredPayments.length}</strong> records &nbsp;|&nbsp;
            Active: <strong>{activeAll.length}</strong> &nbsp;|&nbsp;
            Cancelled: <strong>{payments.filter(p => p.status === "Cancelled").length}</strong>
          </CardBody>
        </Card>
      </Page>

      {/* ════════════════════════════════════════════════
          PRINT SLIP MODAL
      ════════════════════════════════════════════════ */}
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
                  <div style={{ fontWeight: "bold", marginTop: "4px" }}>Advance Slip</div>
                </BillHeader>

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
                        ? new Date(printRecord.bill_date).toLocaleDateString("en-IN") + " " +
                          new Date(printRecord.bill_date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </BillValue>
                  </BillRow>
                  <BillRow>
                    <BillLabel>Bill No</BillLabel>
                    <BillValue style={{ fontWeight: "bold" }}>{printRecord.bill_no || "—"}</BillValue>
                  </BillRow>
                  <BillRow>
                    <BillLabel>Payment Mode</BillLabel>
                    <BillValue>{printRecord.payment_mode || "—"}</BillValue>
                  </BillRow>
                </BillSection>

                <BillSection>
                  <BillRow divider>
                    <BillLabel>Description</BillLabel>
                    <BillValue>Amount</BillValue>
                  </BillRow>
                  <BillRow>
                    <span>1. IP Advance</span>
                    <BillValue style={{ fontWeight: "bold" }}>₹{fmt(printRecord.ip_advance)}</BillValue>
                  </BillRow>
                  <BillRow>
                    <span>2. Billing Advance</span>
                    <BillValue style={{ fontWeight: "bold" }}>₹{fmt(printRecord.billing_advance)}</BillValue>
                  </BillRow>
                </BillSection>

                <BillSection>
                  <BillRow divider style={{ fontWeight: "bold" }}>
                    <BillLabel>User: {printRecord.created_by || "—"}</BillLabel>
                    <BillValue>Total ₹{fmt(printRecord.advance_amount)}</BillValue>
                  </BillRow>
                </BillSection>

                <BillSection style={{
                  textAlign: "center", marginTop: "20px",
                  paddingTop: "10px", borderTop: "1px solid " + T.text
                }}>
                  <div style={{ fontSize: "11px", marginBottom: "20px" }}>Signature Of Cashier</div>
                </BillSection>
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