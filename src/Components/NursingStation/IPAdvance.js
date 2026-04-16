import { useState, useEffect } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../../Auth/apiRequest";

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
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
};

const rowIn = keyframes`
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
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

// ── Form primitives ───────────────────────────────────────────────────────────
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

const RowFlex = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconBtn = styled.button`
  height: 27px;
  padding: 0 9px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${({ c }) => c === "blue" ? T.blue : c === "violet" ? T.violet : T.teal};
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  &:hover { opacity: .88; }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  padding: 9px 14px;
  border-top: 1px solid ${T.border};
  background: #fafafa;
  align-items: center;
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

// ── Split section ─────────────────────────────────────────────────────────────
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

// ── Records table ─────────────────────────────────────────────────────────────
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
  background: ${({ active }) => active ? T.greenLight : T.redLight};
  color: ${({ active }) => active ? T.green : T.red};
  border: 1px solid ${({ active }) => active ? "#bbf7d0" : "#fecaca"};
`;

const CancelBtn = styled.button`
  height: 21px;
  padding: 0 8px;
  font-size: 0.63rem;
  font-weight: 700;
  border-radius: 4px;
  border: 1.5px solid ${T.red};
  background: ${T.redLight};
  color: ${T.red};
  cursor: pointer;
  transition: all .13s;
  &:hover { background: ${T.red}; color: #fff; }
  &:disabled { opacity: .4; cursor: not-allowed; }
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

const StatL = styled.div`font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: ${({ c }) => c};`;
const StatV = styled.div`font-size: .95rem; font-weight: 800; margin-top: 2px; color: ${({ c }) => c};`;

// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_COMMON = {
  uhid: "", ipNumber: "",
  name: "", age: "", gender: "",
  roomNo: "", bedNo: "",
  admittingDate: "", admittingDoctor: "",
  customer_type: "", company: "",
  address: "",
  creditLimit: "", outBalance: "", totalAdvance: "",
};

const today = () => new Date().toISOString().split("T")[0];

export default function IPAdvance() {
  const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [common,     setCommon]     = useState(EMPTY_COMMON);
  const [admissionId,setAdmId]      = useState(null);
  const [payments,   setPayments]   = useState([]);

  const [date,       setDate]       = useState(today());
  const [amount,     setAmount]     = useState("");
  const [ipAdv,      setIpAdv]      = useState("");
  const [billAdv,    setBillAdv]    = useState("");
  const [saving,     setSaving]     = useState(false);
  const [cancelling, setCancelling] = useState(null);

  const total       = parseFloat(amount)  || 0;
  const splitIP     = parseFloat(ipAdv)   || 0;
  const splitBill   = parseFloat(billAdv) || 0;
  const splitTouched = ipAdv !== "" || billAdv !== "";
  const splitOk     = total > 0 && Math.abs(splitIP + splitBill - total) < 0.01;

  const fmt = (v) => parseFloat(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  // ── Patient / admission load ──────────────────────────────────────────────
  // Uses get_active_admission/ (same as RoomShifting) — returns admission
  // with patient fields already embedded, so no separate patient fetch needed.
// ── Load admission → also GET advances fresh from backend ────────────────
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
      adm.salutation   || patient.salutation,
      adm.firstName    || patient.firstName || patient.patientname,
      adm.middleName   || patient.middleName,
      adm.lastName     || patient.lastName,
    ].filter(Boolean);

    setAdmId(adm.ipNumber);
    setCommon((p) => ({
      ...p,
      uhid:            adm.uhid          || p.uhid,
      ipNumber:        adm.ipNumber      || p.ipNumber,
      name:            nameParts.join(" ") || p.name,
      age:             adm.age           || patient.age    || p.age,
      gender:          adm.gender        || patient.gender || p.gender,
      address:         adm.permanent_address || patient.permanent_address
                       || [patient.area, patient.city, patient.state, patient.zipcode]
                          .filter(Boolean).join(", ") || p.address,
      customer_type:   adm.customerType  || adm.customer_type || patient.customerType || p.customer_type,
      company:         adm.insuranceCompanyName || patient.insuranceCompanyName || adm.insuranceCompany || p.company,
      roomNo, bedNo,
      admittingDate:   adm.admissionDateTime
        ? new Date(adm.admissionDateTime).toLocaleDateString("en-IN") : "",
      admittingDoctor: doctor,
      creditLimit:     adm.creditLimit != null ? adm.creditLimit : "",
    }));

    // ✅ GET advances separately (fresh from backend)
    await fetchAdvances(adm.ipNumber);
    toast.success(`Admission loaded: ${adm.ipNumber}`);
  } catch (err) {
    toast.error(err?.message || "No active admission found for this patient");
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

  const handleAmountChange = (val) => {
    setAmount(val);
    setIpAdv("");
    setBillAdv("");
  };

  const handleIpAdvChange = (val) => {
    setIpAdv(val);
    const ip  = parseFloat(val) || 0;
    const rem = total - ip;
    setBillAdv(rem >= 0 ? rem.toFixed(2) : "");
  };

  // ── GET: fetch advance_payments list ─────────────────────────────────────
const fetchAdvances = async (ipNum) => {
  try {
    const res = await apiRequest(
      `${BASE}admission-advance/?ip_number=${encodeURIComponent(ipNum)}`,
      "GET"
    );
    if (!res.success) throw new Error(res.error || "Failed to fetch advances");

    const list = Array.isArray(res.data) ? res.data : [];
    setPayments(list);

    const newTotal = list
      .filter((p) => p.is_advanceActive)
      .reduce((s, p) => s + (parseFloat(p.advance_amount) || 0), 0);
    setCommon((p) => ({
      ...p,
      totalAdvance: newTotal,
      outBalance: p.creditLimit != null
        ? Math.max(0, parseFloat(p.creditLimit) - newTotal) : "",
    }));
  } catch (e) {
    toast.error(e.message || "Failed to load advances");
  }
};

  // ── Save advance ──────────────────────────────────────────────────────────
// ── POST: save new advance ────────────────────────────────────────────────
const handleSave = async () => {
  if (!admissionId) return toast.warning("Load an admission first");
  if (total <= 0)   return toast.warning("Enter a valid advance amount");
  if (splitTouched && !splitOk)
    return toast.warning("IP Advance + Billing Advance must equal Advance Amount");

  setSaving(true);
  try {
    const res = await apiRequest(
      `${BASE}admission-advance/${encodeURIComponent(admissionId)}/`,
      "POST",
      {
        date,
        advance_amount:  total,
        ip_advance:      splitIP,
        billing_advance: splitBill,
      }
    );
    if (!res.success) throw new Error(res.error || "Save failed");

    toast.success("Advance saved!");
    await fetchAdvances(admissionId);          // ✅ re-fetch to sync with backend
    setAmount(""); setIpAdv(""); setBillAdv(""); setDate(today());
  } catch (e) {
    toast.error(e.message || "Failed to save advance");
  } finally {
    setSaving(false);
  }
};

  // ── Cancel advance ────────────────────────────────────────────────────────
// ── PATCH: cancel advance ─────────────────────────────────────────────────
const handleCancel = async (idx) => {
  if (!window.confirm("Cancel this advance entry?")) return;
  const entry = payments[idx];
  if (!entry?.advance_id) return toast.error("Missing advance_id");

  setCancelling(idx);
  try {
    const res = await apiRequest(
      `${BASE}admission-advance/${encodeURIComponent(admissionId)}/`,
      "PATCH",
      { advance_id: entry.advance_id }
    );
    if (!res.success) throw new Error(res.error || "Cancel failed");

    toast.success("Advance cancelled");
    await fetchAdvances(admissionId);          // ✅ re-fetch to sync with backend
  } catch (e) {
    toast.error(e.message || "Failed to cancel");
  } finally {
    setCancelling(null);
  }
};

  const handleReset = () => {
    setCommon(EMPTY_COMMON);
    setAdmId(null);
    setPayments([]);
    setAmount(""); setIpAdv(""); setBillAdv(""); setDate(today());
  };

  // Stats
  const activePayments = payments.filter((p) => p.is_advanceActive);
  const totalActive    = activePayments.reduce((s, p) => s + (parseFloat(p.advance_amount) || 0), 0);
  const totalIPSum     = activePayments.reduce((s, p) => s + (parseFloat(p.ip_advance)      || 0), 0);
  const totalBillSum   = activePayments.reduce((s, p) => s + (parseFloat(p.billing_advance) || 0), 0);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <GlobalStyle />
      <Page>
        <PageTitle>💳 IP Advance Entry</PageTitle>

        {/* ═══════════════════════════════════════════════════
            PATIENT & ADMISSION DETAILS  — identical to original
        ═══════════════════════════════════════════════════ */}
        <Card>
          <CardHead color="teal">🏥 Patient &amp; Admission Details</CardHead>
          <CardBody>
            <Grid cols={6}>

              <GroupLabel c="teal">Search</GroupLabel>

              <F span={2}>
                <Lbl>UHID</Lbl>
                <RowFlex>
                  <Inp
                    value={common.uhid}
                    placeholder="Enter UHID"
                    onChange={(e) => setCommon((p) => ({ ...p, uhid: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && searchByUHID()}
                  />
                  <IconBtn type="button" onClick={searchByUHID}>🔍</IconBtn>
                </RowFlex>
              </F>

              <F span={2}>
                <Lbl>IP No</Lbl>
                <RowFlex>
                  <Inp
                    value={common.ipNumber}
                    placeholder="Enter IP No"
                    onChange={(e) => setCommon((p) => ({ ...p, ipNumber: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && searchByIP()}
                  />
                  <IconBtn type="button" onClick={searchByIP}>🔍</IconBtn>
                </RowFlex>
              </F>

              <F span={2} />

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
          <ActionBar>
            <Btn v="reset" onClick={handleReset}>↺ Reset All</Btn>
          </ActionBar>
        </Card>

        {/* ═══════════════════════════════════════════════════
            ADVANCE INPUT — simplified with split
        ═══════════════════════════════════════════════════ */}
        <Card>
          <CardHead color="teal">💵 Advance Input</CardHead>
          <CardBody>
            <Grid cols={6}>

              <GroupLabel c="teal">Payment Details</GroupLabel>

              <F span={1}>
                <Lbl>Date</Lbl>
                <Inp
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </F>

              <F span={3}>
                <Lbl>Advance Amount (₹)</Lbl>
                <BigInp
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  placeholder="Enter total advance amount"
                  onChange={(e) => handleAmountChange(e.target.value)}
                />
              </F>

              <F span={2} />

              {/* Split sub-fields */}
              <SplitBox>
                <SplitHeader>↳ Split Advance</SplitHeader>
                <SplitGrid>
                  <F>
                    <Lbl>IP Advance (₹)</Lbl>
                    <Inp
                      type="number"
                      min="0"
                      step="0.01"
                      value={ipAdv}
                      placeholder="0.00"
                      disabled={total <= 0}
                      onChange={(e) => handleIpAdvChange(e.target.value)}
                    />
                  </F>
                  <F>
                    <Lbl>Billing Advance (₹)</Lbl>
                    <Inp
                      type="number"
                      min="0"
                      step="0.01"
                      value={billAdv}
                      placeholder="0.00"
                      disabled={total <= 0}
                      onChange={(e) => setBillAdv(e.target.value)}
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
            <Btn
              v="reset"
              onClick={() => { setAmount(""); setIpAdv(""); setBillAdv(""); setDate(today()); }}
            >↺ Reset</Btn>
            <Btn
              onClick={handleSave}
              disabled={saving || !admissionId || total <= 0 || (splitTouched && !splitOk)}
            >
              {saving ? "Saving…" : "💾 Save Advance"}
            </Btn>
          </ActionBar>
        </Card>

        {/* ═══════════════════════════════════════════════════
            ADVANCE PAYMENT RECORDS TABLE
        ═══════════════════════════════════════════════════ */}
        {admissionId && (
          <Card>
            <CardHead color="violet">📋 Advance Payment Records</CardHead>

            <StatRow>
              <Stat bg="#f0fdf4" bd="#bbf7d0">
                <StatL c="#16a34a">Total Active Advance</StatL>
                <StatV c="#15803d">₹{fmt(totalActive)}</StatV>
              </Stat>
              <Stat bg="#f0fdfb" bd={T.tealLight}>
                <StatL c={T.tealDark}>IP Advance</StatL>
                <StatV c={T.teal}>₹{fmt(totalIPSum)}</StatV>
              </Stat>
              <Stat bg="#eff6ff" bd="#bfdbfe">
                <StatL c="#2563eb">Billing Advance</StatL>
                <StatV c="#1d4ed8">₹{fmt(totalBillSum)}</StatV>
              </Stat>
            </StatRow>

            <TblWrap>
              <Tbl>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Date</Th>
                    <Th right>Advance Amount</Th>
                    <Th right>IP Advance</Th>
                    <Th right>Billing Advance</Th>
                    <Th>Status</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <Td colSpan={7} style={{ textAlign: "center", padding: 24, color: T.muted }}>
                        No advance entries yet
                      </Td>
                    </tr>
                  ) : (
                    payments.map((p, i) => (
                      <Tr key={i} even={i % 2 === 0}>
                        <Td style={{ fontWeight: 700, color: T.muted }}>{i + 1}</Td>
                        <Td>{p.date || "—"}</Td>
                        <Td right style={{ fontWeight: 700 }}>₹{fmt(p.advance_amount)}</Td>
                        <Td right>₹{fmt(p.ip_advance)}</Td>
                        <Td right>₹{fmt(p.billing_advance)}</Td>
                        <Td>
                          <StatusBadge active={p.is_advanceActive}>
                            {p.status || (p.is_advanceActive ? "Active" : "Cancelled")}
                          </StatusBadge>
                        </Td>
                        <Td>
                          {p.is_advanceActive ? (
                            <CancelBtn
                              onClick={() => handleCancel(i)}
                              disabled={cancelling !== null}
                            >
                              {cancelling === i ? "…" : "✕ Cancel"}
                            </CancelBtn>
                          ) : (
                            <span style={{ color: T.muted, fontSize: "0.64rem" }}>—</span>
                          )}
                        </Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </Tbl>
            </TblWrap>
          </Card>
        )}

      </Page>
    </>
  );
}