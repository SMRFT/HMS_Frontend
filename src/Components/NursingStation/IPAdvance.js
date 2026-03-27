import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
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
};

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

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
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
`;

const Sel = styled.select`
  ${inputBase}
  background: ${T.white};
  cursor: pointer;
  &:focus { border-color: ${T.teal}; box-shadow: 0 0 0 3px ${T.tealLight}; }
`;

const Txta = styled.textarea`
  padding: 5px 7px;
  font-size: 0.75rem;
  border: 1px solid ${T.border};
  border-radius: 5px;
  resize: vertical;
  min-height: 52px;
  width: 100%;
  outline: none;
  font-family: inherit;
  &:focus { border-color: ${T.teal}; box-shadow: 0 0 0 3px ${T.tealLight}; }
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
  background: ${({ c }) =>
    c === "blue" ? T.blue : c === "violet" ? T.violet : T.teal};
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
    c === "blue"  ? T.blue :
    c === "violet"? T.violet : T.teal};
  color: ${({ v }) => v === "reset" ? T.label : "#fff"};
  &:hover { opacity: .88; }
  &:active { transform: scale(.97); }
`;

// thin label strip between groups
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

// ── Records section ───────────────────────────────────────────────────────────
const SearchBar = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
  gap: 7px 10px;
  align-items: end;
  padding: 12px 14px 8px;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 7px 14px;
  border-bottom: 1px solid ${T.border};
`;

const Chip = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.67rem;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1.5px solid ${({ color }) => color || T.border};
  color: ${({ color }) => color || T.label};
  background: ${({ color, active }) => active ? color + "22" : "#fff"};
  user-select: none;
`;

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
  text-align: left;
  font-weight: 700;
  border-bottom: 2px solid ${T.border};
  white-space: nowrap;
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: ${T.muted};
`;

const Td = styled.td`
  padding: 5px 8px;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
`;

const STATUS_COLORS = {
  "Not Paid":            "#f59e0b",
  "Cash":                "#10b981",
  "Multi Payment":       "#6366f1",
  "Credit/Debit Card":   "#8b5cf6",
  "Cheque":              "#ec4899",
  "Neft & Others":       "#14b8a6",
  "Refunded":            "#ef4444",
  "Partially Refunded":  "#f97316",
  "Not Adjusted":        "#6b7280",
  "Advance Settled":     "#22c55e",
  "Cancelled":           "#dc2626",
};

const Badge = styled.span`
  padding: 2px 7px;
  border-radius: 20px;
  font-size: 0.64rem;
  font-weight: 700;
  background: ${({ s }) => (STATUS_COLORS[s] || "#e2e8f0") + "22"};
  color: ${({ s }) => STATUS_COLORS[s] || T.label};
  border: 1px solid ${({ s }) => STATUS_COLORS[s] || T.border};
`;

const MiniBtn = styled.button`
  height: 21px;
  padding: 0 7px;
  font-size: 0.64rem;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: ${T.teal};
  color: #fff;
  &:hover { opacity: .85; }
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4,1fr);
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

// drug row in pharmacy
const DrugRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 52px 74px 74px 26px;
  gap: 5px;
  align-items: center;
  margin-bottom: 5px;
`;

// ── Empty states ──────────────────────────────────────────────────────────────
const EMPTY_COMMON = {
  uhid: "", ipNumber: "",
  name: "", age: "", gender: "",
  roomNo: "", bedNo: "",
  admittingDate: "", admittingDoctor: "",
  customer_type: "", company: "",
  address: "",
  creditLimit: "", outBalance: "", totalAdvance: "",
};

const EMPTY_ADV = {
  date: new Date().toISOString().split("T")[0],
  amount: "", advanceType: "advance", advanceRemarks: "",
};

const EMPTY_PHARM = {
  date: new Date().toISOString().split("T")[0],
  prescribingDoctor: "", paymentMode: "Cash",
  discount: "0", totalAmount: "", remarks: "",
};

const EMPTY_ITEM = { drug: "", qty: "1", rate: "", amount: "" };

// ─────────────────────────────────────────────────────────────────────────────
export default function IPAdvance() {
  const [common, setCommon]         = useState(EMPTY_COMMON);
  const [admissionId, setAdmId]     = useState(null);

  const [adv, setAdv]               = useState(EMPTY_ADV);
  const [lastBill, setLastBill]     = useState(null);

  const [pharm, setPharm]           = useState(EMPTY_PHARM);
  const [pharmItems, setPharmItems] = useState([{ ...EMPTY_ITEM }]);
  const [pharmBill, setPharmBill]   = useState(null);

  const [tableRows, setTableRows]   = useState([]);
  const [chartData, setChartData]   = useState([]);
  const [activeStatuses, setActiveStatuses] = useState(new Set());
  const [filters, setFilters]       = useState({
    fromDate: new Date().toISOString().split("T")[0],
    toDate:   new Date().toISOString().split("T")[0],
    uhid: "", ipNumber: "",
  });

  const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchTable(); }, []);

  useEffect(() => {
    const grouped = {};
    tableRows.forEach((r) => {
      const d = r.bill_date || "Unknown";
      grouped[d] = (grouped[d] || 0) + parseFloat(r.advance_amount || 0);
    });
    setChartData(
      Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, Collection]) => ({ date, Collection }))
    );
  }, [tableRows]);

  const fetchTable = async () => {
    try {
      const p = new URLSearchParams();
      if (filters.fromDate) p.append("from_date", filters.fromDate);
      if (filters.toDate)   p.append("to_date",   filters.toDate);
      if (filters.uhid)     p.append("uhid",       filters.uhid);
      if (filters.ipNumber) p.append("ip_number",  filters.ipNumber);
      const res = await apiRequest(`${BASE}advances/?${p}`, "GET");
      if (res.success) setTableRows(res.data || []);
    } catch { }
  };

  // ── Patient / admission load ──────────────────────────────────────────────
  const searchByUHID = async () => {
    if (!common.uhid.trim()) return toast.warning("Enter UHID");
    try {
      const res = await apiRequest(
        `${BASE}op-patient/${encodeURIComponent(common.uhid)}/`, "GET"
      );
      if (!res.success) throw new Error();
      const d = res.data;
      setCommon((p) => ({
        ...p,
        name:          [d.salutation, d.firstName, d.middleName, d.lastName].filter(Boolean).join(" "),
        age:           d.age || "",
        gender:        d.gender || "",
        address:       d.permanent_address || "",
        customer_type: d.customer_type || "",
        company:       d.insuranceCompany || "",
      }));
      loadAdmByQuery(`uhid=${encodeURIComponent(common.uhid)}`);
    } catch { toast.error("Patient not found"); }
  };

  const searchByIP = () => {
    if (!common.ipNumber.trim()) return toast.warning("Enter IP Number");
    loadAdmByQuery(`ip_number=${encodeURIComponent(common.ipNumber)}`);
  };

  const loadAdmByQuery = async (query) => {
    try {
      const res = await apiRequest(`${BASE}admission/?${query}`, "GET");
      if (!res.success || !(res.data || []).length) return toast.error("Admission not found");
      const adm = res.data[0];
      setAdmId(adm.ipNumber);
      const doctor = adm.admittingDoctorName || adm.admittingDoctor || "";
      setCommon((p) => ({
        ...p,
        uhid:            adm.uhid            || p.uhid,
        ipNumber:        adm.ipNumber,
        name:            adm.firstName
          ? [adm.salutation, adm.firstName, adm.middleName, adm.lastName].filter(Boolean).join(" ")
          : p.name,
        age:             adm.age             || p.age,
        gender:          adm.gender          || p.gender,
        address:         adm.permanent_address || p.address,
        customer_type:   adm.customer_type   || p.customer_type,
        company:         adm.insuranceCompany || p.company,
        roomNo:          adm.roomNo          || "",
        bedNo:           adm.bedNo           || "",
        admittingDate:   adm.admissionDateTime
          ? new Date(adm.admissionDateTime).toLocaleDateString("en-IN") : "",
        admittingDoctor: doctor,
        creditLimit:     adm.creditLimit     != null ? adm.creditLimit   : "",
        totalAdvance:    adm.total_advance   != null ? adm.total_advance : "",
        outBalance:      adm.creditLimit != null && adm.total_advance != null
          ? Math.max(0, parseFloat(adm.creditLimit) - parseFloat(adm.total_advance)) : "",
      }));
      setPharm((p) => ({ ...p, prescribingDoctor: p.prescribingDoctor || doctor }));
    } catch { toast.error("Error loading admission"); }
  };

  // ── Save advance ──────────────────────────────────────────────────────────
  const handleAdvSave = async () => {
    if (!admissionId)                                return toast.warning("Load an admission first");
    if (!adv.amount || parseFloat(adv.amount) <= 0)  return toast.warning("Enter a valid amount");
    const payload = new FormData();
    payload.append("amount",  adv.amount);
    payload.append("remarks", adv.advanceRemarks);
    payload.append("type",    adv.advanceType);
    try {
      const res = await apiRequest(
        `${BASE}admission/${encodeURIComponent(admissionId)}/advance/`, "POST", payload
      );
      if (!res.success) throw new Error(res.error);
      toast.success("Advance saved!");
      const data = res.data?.data || res.data;
      if (data) {
        setCommon((p) => ({
          ...p,
          totalAdvance: data.total_advance ?? p.totalAdvance,
          creditLimit:  data.creditLimit   ?? p.creditLimit,
          outBalance:   data.creditLimit != null && data.total_advance != null
            ? Math.max(0, parseFloat(data.creditLimit) - parseFloat(data.total_advance))
            : p.outBalance,
        }));
      }
      setAdv((p) => ({ ...p, amount: "", advanceRemarks: "" }));
      if (res.data?.bill) setLastBill(res.data.bill);
      fetchTable();
    } catch { toast.error("Failed to save advance"); }
  };

  // ── Pharmacy helpers ──────────────────────────────────────────────────────
  const updateItem = (i, field, value) => {
    setPharmItems((prev) => {
      const next = prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it);
      if (field === "qty" || field === "rate") {
        const qty  = parseFloat(field === "qty"  ? value : prev[i].qty)  || 0;
        const rate = parseFloat(field === "rate" ? value : prev[i].rate) || 0;
        next[i].amount = (qty * rate).toFixed(2);
      }
      const total = next.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
      const disc  = parseFloat(pharm.discount) || 0;
      setPharm((p) => ({ ...p, totalAmount: Math.max(0, total - disc).toFixed(2) }));
      return next;
    });
  };

  const addItem    = () => setPharmItems((p) => [...p, { ...EMPTY_ITEM }]);
  const removeItem = (i) => setPharmItems((p) => p.filter((_, idx) => idx !== i));

  const handlePharmSave = async () => {
    if (!admissionId)                               return toast.warning("Load an admission first");
    if (pharmItems.every((it) => !it.drug.trim()))  return toast.warning("Add at least one drug");
    try {
      const res = await apiRequest(`${BASE}ip-pharmacy/`, "POST", {
        ip_number:    admissionId,
        date:         pharm.date,
        doctor:       pharm.prescribingDoctor,
        payment_mode: pharm.paymentMode,
        remarks:      pharm.remarks,
        discount:     pharm.discount,
        items:        pharmItems.filter((it) => it.drug.trim()),
      });
      if (!res.success) throw new Error();
      toast.success("Pharmacy entry saved!");
      if (res.data?.bill) setPharmBill(res.data.bill);
    } catch { toast.error("Failed to save pharmacy entry"); }
  };

  // ── Print ─────────────────────────────────────────────────────────────────
  const printBill = (bill) => {
    if (!bill) return;
    const win = window.open("", "_blank", "width=520,height=460");
    win.document.write(`<!DOCTYPE html><html><head><title>Advance Slip</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:12px;padding:20px}
.center{text-align:center}.bold{font-weight:bold}.big{font-size:15px}
.row{display:flex;justify-content:space-between;margin:3px 0}
.line{border-top:1px solid #000;margin:8px 0}
table{width:100%;border-collapse:collapse;margin-top:8px}
th,td{border:1px solid #000;padding:4px 6px;font-size:11px}th{background:#f3f4f6;font-weight:700}
.sig{margin-top:30px;text-align:right;font-size:11px}</style></head><body>
<div class="center bold big">SHANMUGA HOSPITAL LIMITED</div>
<div class="center" style="font-size:10px">51/24, Saradha College Road, Salem - 636007</div>
<div class="center" style="font-size:10px">04272706666</div>
<div class="center bold" style="margin-top:6px;font-size:13px">Advance Slip</div>
<div class="line"></div>
<div class="row"><span>IP No</span><span class="bold">: ${bill.ip_number||""}</span></div>
<div class="row"><span>Op Number</span><span>: ${bill.uhid||""}</span></div>
<div class="row"><span>Name</span><span>: ${bill.patient_name||""}</span></div>
<div class="row"><span>Room</span><span>: ${bill.room_no||""}</span></div>
<div class="row"><span>Bill Date</span><span>: ${bill.bill_date||""}</span></div>
<div class="row"><span>Bill No</span><span>: ${bill.bill_number||""}</span></div>
<div class="row"><span>GST No</span><span>: 33ABDCS8326A1ZP</span></div>
<div class="line"></div>
<table><thead><tr><th>Slno</th><th>Description</th><th>Amount</th></tr></thead>
<tbody><tr><td>1</td>
<td>Advance${bill.type==="ip_advance"?" (IP)":""} — ${bill.payment_mode||""}</td>
<td style="text-align:right">${parseFloat(bill.amount||0).toFixed(2)}</td></tr></tbody>
<tfoot><tr><td colspan="2" style="text-align:right;font-weight:700">Total</td>
<td style="text-align:right;font-weight:700">${parseFloat(bill.amount||0).toFixed(2)}</td></tr></tfoot>
</table>
<div class="sig">Signature Of Cashier<br/>User : ${bill.created_by||""}</div>
<script>window.onload=function(){window.print();window.close();}</script>
</body></html>`);
    win.document.close();
  };

  const toggleStatus = (s) =>
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });

  const visibleRows = tableRows.filter((r) =>
    activeStatuses.size === 0 ||
    activeStatuses.has(r.advance_status) ||
    activeStatuses.has(r.payment_mode)
  );

  const totalAmt   = visibleRows.reduce((s, r) => s + parseFloat(r.advance_amount || 0), 0);
  const settledCnt = visibleRows.filter((r) => r.advance_status === "Advance Settled").length;
  const refundAmt  = visibleRows
    .filter((r) => ["Refunded","Partially Refunded"].includes(r.advance_status))
    .reduce((s, r) => s + parseFloat(r.advance_amount || 0), 0);

  const handleReset = () => {
    setCommon(EMPTY_COMMON); setAdmId(null);
    setAdv(EMPTY_ADV); setLastBill(null);
    setPharm(EMPTY_PHARM); setPharmItems([{ ...EMPTY_ITEM }]); setPharmBill(null);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <GlobalStyle />
      <Page>
        <PageTitle>IP Advance &amp; Pharmacy Collection</PageTitle>

        {/* ═══════════════════════════════════════════════════
            TOP — COMMON: Patient Search + Info + Admission
        ═══════════════════════════════════════════════════ */}
        <Card>
          <CardHead color="teal">🏥 Patient &amp; Admission Details</CardHead>
          <CardBody>
            <Grid cols={6}>

              {/* ── Search row ── */}
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

              {/* spacer */}
              <F span={2} />

              {/* ── Patient info ── */}
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

              {/* ── Admission details ── */}
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
            MIDDLE — 2 COLUMNS: Advance  |  IP Pharmacy
        ═══════════════════════════════════════════════════ */}
        <TwoCol>

          {/* ── LEFT: ADVANCE INPUT ── */}
          <Card>
            <CardHead color="teal">💳 Advance Input</CardHead>
            <CardBody>
              <Grid cols={2}>

                <GroupLabel c="teal">Payment Details</GroupLabel>

                <F>
                  <Lbl>Date</Lbl>
                  <Inp
                    type="date"
                    value={adv.date}
                    onChange={(e) => setAdv((p) => ({ ...p, date: e.target.value }))}
                  />
                </F>
                <F>
                  <Lbl>Advance Type</Lbl>
                  <Sel
                    value={adv.advanceType}
                    onChange={(e) => setAdv((p) => ({ ...p, advanceType: e.target.value }))}
                  >
                    <option value="advance">Advance</option>
                    <option value="ip_advance">IP Advance</option>
                  </Sel>
                </F>

                <F span={2}>
                  <Lbl>Amount (₹)</Lbl>
                  <Inp
                    type="number"
                    min="0"
                    value={adv.amount}
                    placeholder="0.00"
                    onChange={(e) => setAdv((p) => ({ ...p, amount: e.target.value }))}
                  />
                </F>

                <F span={2}>
                  <Lbl>Advance Remarks</Lbl>
                  <Txta
                    rows={4}
                    value={adv.advanceRemarks}
                    onChange={(e) => setAdv((p) => ({ ...p, advanceRemarks: e.target.value }))}
                  />
                </F>

              </Grid>
            </CardBody>
            <ActionBar>
              {lastBill && <Btn onClick={() => printBill(lastBill)}>🖨️ Print Bill</Btn>}
              <Btn v="reset" onClick={() => { setAdv(EMPTY_ADV); setLastBill(null); }}>↺ Reset</Btn>
              <Btn onClick={handleAdvSave}>💾 Save Advance</Btn>
            </ActionBar>
          </Card>

          {/* ── RIGHT: IP PHARMACY INPUT ── */}
          <Card>
            <CardHead color="blue">💊 IP Pharmacy Input</CardHead>
            <CardBody>
              <Grid cols={2}>

                <GroupLabel c="blue">Pharmacy Details</GroupLabel>

                <F>
                  <Lbl>Date</Lbl>
                  <Inp
                    type="date"
                    value={pharm.date}
                    onChange={(e) => setPharm((p) => ({ ...p, date: e.target.value }))}
                  />
                </F>
                <F>
                  <Lbl>Payment Mode</Lbl>
                  <Sel
                    value={pharm.paymentMode}
                    onChange={(e) => setPharm((p) => ({ ...p, paymentMode: e.target.value }))}
                  >
                    <option>Cash</option>
                    <option>Credit/Debit Card</option>
                    <option>Neft &amp; Others</option>
                    <option>Cheque</option>
                    <option>Multi Payment</option>
                    <option>Not Paid</option>
                  </Sel>
                </F>

                <F span={2}>
                  <Lbl>Prescribing Doctor</Lbl>
                  <Inp
                    value={pharm.prescribingDoctor}
                    onChange={(e) => setPharm((p) => ({ ...p, prescribingDoctor: e.target.value }))}
                  />
                </F>

                <F>
                  <Lbl>Discount (₹)</Lbl>
                  <Inp
                    type="number"
                    min="0"
                    value={pharm.discount}
                    onChange={(e) => {
                      const disc  = parseFloat(e.target.value) || 0;
                      const total = pharmItems.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
                      setPharm((p) => ({
                        ...p,
                        discount: e.target.value,
                        totalAmount: Math.max(0, total - disc).toFixed(2),
                      }));
                    }}
                  />
                </F>
                <F>
                  <Lbl>Total Amount (₹)</Lbl>
                  <Inp value={pharm.totalAmount} readOnly />
                </F>

                <F span={2}>
                  <Lbl>Remarks</Lbl>
                  <Txta
                    rows={2}
                    value={pharm.remarks}
                    onChange={(e) => setPharm((p) => ({ ...p, remarks: e.target.value }))}
                  />
                </F>

                {/* Drug items */}
                <GroupLabel c="blue">Drug / Item Entries</GroupLabel>

                <F span={2}>
                  {/* column headers */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 52px 74px 74px 26px",
                    gap: 5,
                    marginBottom: 4,
                  }}>
                    {["Drug / Item", "Qty", "Rate ₹", "Amt ₹", ""].map((h, i) => (
                      <div key={i} style={{
                        fontSize: "0.61rem", fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.04em",
                        color: T.muted,
                      }}>{h}</div>
                    ))}
                  </div>

                  {pharmItems.map((item, i) => (
                    <DrugRow key={i}>
                      <Inp
                        value={item.drug}
                        placeholder="Drug name"
                        onChange={(e) => updateItem(i, "drug", e.target.value)}
                      />
                      <Inp
                        type="number" min="1"
                        value={item.qty}
                        onChange={(e) => updateItem(i, "qty", e.target.value)}
                      />
                      <Inp
                        type="number" min="0"
                        value={item.rate}
                        placeholder="0.00"
                        onChange={(e) => updateItem(i, "rate", e.target.value)}
                      />
                      <Inp value={item.amount} readOnly placeholder="0.00" />
                      <button
                        onClick={() => removeItem(i)}
                        disabled={pharmItems.length === 1}
                        style={{
                          height: 26, width: 26, border: "none", borderRadius: 4,
                          background: pharmItems.length === 1 ? "#e2e8f0" : "#fee2e2",
                          color: pharmItems.length === 1 ? T.muted : "#ef4444",
                          cursor: pharmItems.length === 1 ? "default" : "pointer",
                          fontWeight: 700, fontSize: "1rem",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >×</button>
                    </DrugRow>
                  ))}

                  <IconBtn
                    type="button" c="blue"
                    style={{ marginTop: 6, width: "fit-content" }}
                    onClick={addItem}
                  >+ Add Item</IconBtn>
                </F>

              </Grid>
            </CardBody>
            <ActionBar>
              {pharmBill && <Btn c="blue" onClick={() => printBill(pharmBill)}>🖨️ Print Bill</Btn>}
              <Btn v="reset" onClick={() => {
                setPharm(EMPTY_PHARM);
                setPharmItems([{ ...EMPTY_ITEM }]);
                setPharmBill(null);
              }}>↺ Reset</Btn>
              <Btn c="blue" onClick={handlePharmSave}>💾 Save Pharmacy</Btn>
            </ActionBar>
          </Card>

        </TwoCol>

        {/* ═══════════════════════════════════════════════════
            BOTTOM — ADVANCE ENTRY RECORDS (full width)
        ═══════════════════════════════════════════════════ */}
        <Card>
          <CardHead color="violet">📋 Advance Entry Records</CardHead>

          {/* Filter bar */}
          <SearchBar>
            <F>
              <Lbl>From Date</Lbl>
              <Inp
                type="date" value={filters.fromDate}
                onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))}
              />
            </F>
            <F>
              <Lbl>To Date</Lbl>
              <Inp
                type="date" value={filters.toDate}
                onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))}
              />
            </F>
            <F>
              <Lbl>UHID</Lbl>
              <Inp
                value={filters.uhid} placeholder="UHID"
                onChange={(e) => setFilters((p) => ({ ...p, uhid: e.target.value }))}
              />
            </F>
            <F>
              <Lbl>IP Number</Lbl>
              <Inp
                value={filters.ipNumber} placeholder="IP Number"
                onChange={(e) => setFilters((p) => ({ ...p, ipNumber: e.target.value }))}
              />
            </F>
            <IconBtn type="button" c="violet" onClick={fetchTable} style={{ alignSelf: "flex-end" }}>
              🔍 Search
            </IconBtn>
          </SearchBar>

          {/* Summary stats */}
          <StatRow>
            <Stat bg="#f0fdf4" bd="#bbf7d0">
              <StatL c="#16a34a">Total Collected</StatL>
              <StatV c="#15803d">₹{totalAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</StatV>
            </Stat>
            <Stat bg="#eff6ff" bd="#bfdbfe">
              <StatL c="#2563eb">Records</StatL>
              <StatV c="#1d4ed8">{visibleRows.length}</StatV>
            </Stat>
            <Stat bg="#f5f3ff" bd="#ddd6fe">
              <StatL c="#7c3aed">Settled</StatL>
              <StatV c="#6d28d9">{settledCnt}</StatV>
            </Stat>
            <Stat bg="#fff7ed" bd="#fed7aa">
              <StatL c="#ea580c">Refunded</StatL>
              <StatV c="#c2410c">₹{refundAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</StatV>
            </Stat>
          </StatRow>

          {/* Payment mode chips */}
          <ChipRow>
            {["Not Paid","Cash","Multi Payment","Credit/Debit Card","Cheque","Neft & Others"].map((s) => (
              <Chip key={s} color={STATUS_COLORS[s]} active={activeStatuses.has(s)} onClick={() => toggleStatus(s)}>
                <input type="checkbox" checked={activeStatuses.has(s)} onChange={() => toggleStatus(s)} style={{ cursor: "pointer" }} />
                {s}
              </Chip>
            ))}
          </ChipRow>
          {/* Status chips */}
          <ChipRow style={{ borderBottom: "none" }}>
            {["Refunded","Partially Refunded","Not Adjusted","Advance Settled","Cancelled"].map((s) => (
              <Chip key={s} color={STATUS_COLORS[s]} active={activeStatuses.has(s)} onClick={() => toggleStatus(s)}>
                <input type="checkbox" checked={activeStatuses.has(s)} onChange={() => toggleStatus(s)} style={{ cursor: "pointer" }} />
                {s}
              </Chip>
            ))}
          </ChipRow>

          {/* Chart */}
          {chartData.length > 0 && (
            <div style={{ padding: "0 14px 12px" }}>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chartData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="Collection" stroke={T.teal} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table */}
          <TblWrap>
            <Tbl>
              <thead>
                <tr>
                  {["Bill Date","Bill Number","Payment Mode","Advance Reference",
                    "Advance Status","UHID","Patient","Description",
                    "Advance Amount","Balance Amount","Actions"].map((h) => (
                    <Th key={h}>{h}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <Td colSpan={11} style={{ textAlign: "center", padding: 22, color: T.muted }}>
                      No records found
                    </Td>
                  </tr>
                ) : (
                  visibleRows.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                      <Td>{r.bill_date}</Td>
                      <Td style={{ fontWeight: 700 }}>{r.bill_number}</Td>
                      <Td><Badge s={r.payment_mode}>{r.payment_mode}</Badge></Td>
                      <Td>{r.advance_reference}</Td>
                      <Td><Badge s={r.advance_status}>{r.advance_status}</Badge></Td>
                      <Td>{r.uhid}</Td>
                      <Td>{r.patient}</Td>
                      <Td style={{ textTransform: "capitalize" }}>{r.description}</Td>
                      <Td style={{ textAlign: "right", fontWeight: 700 }}>
                        ₹{parseFloat(r.advance_amount||0).toLocaleString("en-IN",{minimumFractionDigits:2})}
                      </Td>
                      <Td style={{ textAlign: "right" }}>
                        ₹{parseFloat(r.balance_amount||0).toLocaleString("en-IN",{minimumFractionDigits:2})}
                      </Td>
                      <Td>
                        <MiniBtn onClick={() => printBill({
                          ip_number:    r.ip_number,
                          uhid:         r.uhid,
                          patient_name: r.patient,
                          room_no:      r.room_no,
                          bill_date:    r.bill_date,
                          bill_number:  r.bill_number,
                          amount:       r.advance_amount,
                          payment_mode: r.payment_mode,
                          remarks:      r.advance_reference,
                          type:         r.description,
                          created_by:   "",
                        })}>🖨️</MiniBtn>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </Tbl>
          </TblWrap>
        </Card>

      </Page>
    </>
  );
}