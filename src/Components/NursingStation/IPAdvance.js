import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import apiRequest from "../../Auth/apiRequest";

// ─── Styled Components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  font-family: Arial, sans-serif;
  font-size: 0.78rem;
  color: #111827;
  background: #f9fafb;
  min-height: 100vh;
  padding: 12px;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 14px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 7px 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: ${({ cols }) => `repeat(${cols || 6}, 1fr)`};
  gap: 6px 10px;
  padding: 10px 14px;
  align-items: end;
`;

const TopLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 14px;
  align-items: start;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  grid-column: span ${({ span }) => span || 1};
`;

const Lbl = styled.label`
  font-size: 0.68rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
`;

const Inp = styled.input`
  height: 26px;
  padding: 0 7px;
  font-size: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: ${({ readOnly }) => (readOnly ? "#f3f4f6" : "#fff")};
  color: #111827;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  &:focus { border-color: #0d9488; }
`;

const Sel = styled.select`
  height: 26px;
  padding: 0 4px;
  font-size: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #111827;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  &:focus { border-color: #0d9488; }
`;

const Txta = styled.textarea`
  padding: 4px 7px;
  font-size: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  resize: vertical;
  min-height: 52px;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: #0d9488; outline: none; }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconBtn = styled.button`
  height: 26px;
  padding: 0 8px;
  font-size: 0.72rem;
  background: #0d9488;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover { background: #0f766e; }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 14px 10px;
  border-top: 1px solid #e5e7eb;
`;

const Btn = styled.button`
  height: 28px;
  padding: 0 16px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: ${({ variant }) =>
    variant === "reset" ? "#e5e7eb" :
    variant === "danger" ? "#ef4444" : "#0d9488"};
  color: ${({ variant }) => variant === "reset" ? "#374151" : "#fff"};
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.45; cursor: default; }
`;

// ── Filter / Search bar ──
const SearchBar = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
  gap: 8px 10px;
  align-items: end;
  padding: 10px 14px;
`;

// ── Legend chips ──
const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 14px;
  border-bottom: 1px solid #e5e7eb;
`;

const Chip = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1.5px solid ${({ color }) => color || "#e5e7eb"};
  color: ${({ color }) => color || "#374151"};
  background: ${({ color }) => color ? color + "18" : "#f9fafb"};
  user-select: none;
`;

// ── Table ──
const TblWrap = styled.div`
  overflow-x: auto;
  padding: 0 14px 14px;
`;

const Tbl = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.72rem;
`;

const Th = styled.th`
  background: #f3f4f6;
  padding: 6px 8px;
  text-align: left;
  font-weight: 700;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
  cursor: ${({ sortable }) => (sortable ? "pointer" : "default")};
  &:hover { background: ${({ sortable }) => (sortable ? "#e5e7eb" : "#f3f4f6")}; }
`;

const Td = styled.td`
  padding: 5px 8px;
  border-bottom: 1px solid #f3f4f6;
  white-space: nowrap;
`;

const STATUS_COLORS = {
  "Not Paid":         "#f59e0b",
  "Cash":             "#10b981",
  "Multi Payment":    "#6366f1",
  "Credit/Debit Card":"#8b5cf6",
  "Cheque":           "#ec4899",
  "Neft & Others":    "#14b8a6",
  "Refunded":         "#ef4444",
  "Partially Refunded":"#f97316",
  "Not Adjusted":     "#6b7280",
  "Advance Settled":  "#22c55e",
  "Cancelled":        "#dc2626",
};

const Badge = styled.span`
  padding: 2px 7px;
  border-radius: 10px;
  font-size: 0.66rem;
  font-weight: 700;
  background: ${({ status }) => (STATUS_COLORS[status] || "#e5e7eb") + "22"};
  color: ${({ status }) => STATUS_COLORS[status] || "#374151"};
  border: 1px solid ${({ status }) => STATUS_COLORS[status] || "#e5e7eb"};
`;

const MiniBtn = styled.button`
  height: 22px;
  padding: 0 7px;
  font-size: 0.66rem;
  font-weight: 600;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  background: ${({ danger }) => (danger ? "#ef4444" : "#0d9488")};
  color: #fff;
  &:hover { opacity: 0.85; }
`;


const EMPTY = {
  uhid: "", ipNumber: "",
  // patient (read-only)
  name: "", age: "", gender: "",
  address: "", customer_type: "", company: "",
  roomNo: "", bedNo: "", admittingDate: "", admittingDoctor: "",
  creditLimit: "", outBalance: "", totalAdvance: "",
  // form
  date: new Date().toISOString().split("T")[0],
  currency: "RUPEE",
  amount: "",
  advanceRemarks: "",
  advanceType: "advance",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function IPAdvance() {
  const [form, setForm]           = useState(EMPTY);
  const [admissionId, setAdmissionId] = useState(null); // ipNumber of loaded admission
  const [chartData, setChartData] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [filters, setFilters]     = useState({
    fromDate: new Date().toISOString().split("T")[0],
    toDate:   new Date().toISOString().split("T")[0],
    uhid: "", ipNumber: "",
  });
  const [activeStatuses, setActiveStatuses] = useState(new Set());
  const [lastBill, setLastBill]   = useState(null);

  const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Load table on mount ───────────────────────────────────────────────────
  useEffect(() => { fetchTable(); }, []);

  // ── Build chart from tableRows ────────────────────────────────────────────
  useEffect(() => {
    // Group by bill_date → sum advance_amount
    const grouped = {};
    tableRows.forEach((r) => {
      const d = r.bill_date || "Unknown";
      grouped[d] = (grouped[d] || 0) + parseFloat(r.advance_amount || 0);
    });
    const sorted = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, Collection]) => ({ date, Collection }));
    setChartData(sorted);
  }, [tableRows]);

  const fetchTable = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.append("from_date", filters.fromDate);
      if (filters.toDate)   params.append("to_date",   filters.toDate);
      if (filters.uhid)     params.append("uhid",       filters.uhid);
      if (filters.ipNumber) params.append("ip_number",  filters.ipNumber);
      const res = await apiRequest(`${BASE}advances/?${params}`, "GET");
      if (res.success) setTableRows(res.data || []);
    } catch { }
  };

  // ── Patient search by UHID ────────────────────────────────────────────────
  const searchByUHID = async () => {
    if (!form.uhid.trim()) return toast.warning("Enter UHID");
    try {
      const res = await apiRequest(`${BASE}op-patient/${encodeURIComponent(form.uhid)}/`, "GET");
      if (!res.success) throw new Error();
      const d = res.data;
      setForm((p) => ({
        ...p,
        name:    [d.salutation, d.firstName, d.middleName, d.lastName].filter(Boolean).join(" "),
        age:     d.age || "",
        gender:  d.gender || "",
        address: d.permanent_address || "",
        customer_type: d.customer_type || "",
        company: d.insuranceCompany || "",
      }));
      // Also try to load active admission for this UHID
      loadAdmissionForUHID(form.uhid);
    } catch {
      toast.error("Patient not found");
    }
  };

  const loadAdmissionForUHID = async (uhid) => {
    try {
      const res = await apiRequest(`${BASE}admission/?uhid=${encodeURIComponent(uhid)}`, "GET");
      if (!res.success || !(res.data || []).length) return;
      const adm = res.data[0];
      fillAdmissionFields(adm);
    } catch { }
  };

  // ── Admission search by IP Number ─────────────────────────────────────────
  const searchByIP = async () => {
    if (!form.ipNumber.trim()) return toast.warning("Enter IP Number");
    try {
      const res = await apiRequest(
        `${BASE}admission/?ip_number=${encodeURIComponent(form.ipNumber)}`, "GET"
      );
      if (!res.success || !(res.data || []).length) return toast.error("Admission not found");
      fillAdmissionFields(res.data[0]);
    } catch {
      toast.error("Admission not found");
    }
  };

  const fillAdmissionFields = (adm) => {
    setAdmissionId(adm.ipNumber);
    setForm((p) => ({
      ...p,
      uhid:           adm.uhid || p.uhid,
      ipNumber:       adm.ipNumber,
      name:           adm.firstName
        ? [adm.salutation, adm.firstName, adm.middleName, adm.lastName].filter(Boolean).join(" ")
        : p.name,
      age:            adm.age     || p.age,
      gender:         adm.gender  || p.gender,
      address:        adm.permanent_address || p.address,
      customer_type:   adm.customer_type || p.customer_type,
      company:        adm.insuranceCompany || p.company,
      roomNo:         adm.roomNo  || "",
      bedNo:          adm.bedNo   || "",
      admittingDate:  adm.admissionDateTime
        ? new Date(adm.admissionDateTime).toLocaleDateString("en-IN")
        : "",
      admittingDoctor: adm.admittingDoctorName || adm.admittingDoctor || "",
      creditLimit:    adm.creditLimit != null ? adm.creditLimit : "",
      totalAdvance:   adm.total_advance != null ? adm.total_advance : "",
      outBalance:     adm.creditLimit != null && adm.total_advance != null
        ? Math.max(0, parseFloat(adm.creditLimit) - parseFloat(adm.total_advance))
        : "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // ── Save advance ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!admissionId) return toast.warning("Load an admission first (search by UHID or IP No)");
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.warning("Enter a valid amount");

    const payload = new FormData();
    payload.append("amount",       form.amount);
    payload.append("remarks",      form.advanceRemarks);
    payload.append("type",         form.advanceType);

    try {
      const res = await apiRequest(
        `${BASE}admission/${encodeURIComponent(admissionId)}/advance/`, "POST", payload
      );
      if (!res.success) throw new Error(res.error);
      toast.success("Advance saved!");
      const data = res.data?.data || res.data;
      if (data) {
        setForm((p) => ({
          ...p,
          totalAdvance: data.total_advance ?? p.totalAdvance,
          creditLimit:  data.creditLimit   ?? p.creditLimit,
          outBalance:   data.creditLimit != null && data.total_advance != null
            ? Math.max(0, parseFloat(data.creditLimit) - parseFloat(data.total_advance))
            : p.outBalance,
          amount: "",
          advanceRemarks: "",
        }));
      }
      if (res.data?.bill) setLastBill(res.data.bill);
      fetchTable();
    } catch (e) {
      toast.error("Failed to save advance");
    }
  };

  const handleReset = () => {
    setForm(EMPTY);
    setAdmissionId(null);
    setLastBill(null);
  };

  // ── Print bill ────────────────────────────────────────────────────────────
  const printBill = (bill) => {
    if (!bill) return;
    const win = window.open("", "_blank", "width=520,height=420");
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Advance Slip</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:Arial,sans-serif;font-size:12px;padding:20px}
        .center{text-align:center}
        .bold{font-weight:bold}
        .big{font-size:15px}
        .row{display:flex;justify-content:space-between;margin:3px 0}
        .line{border-top:1px solid #000;margin:8px 0}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th,td{border:1px solid #000;padding:4px 6px;font-size:11px}
        th{background:#f3f4f6;font-weight:700}
        .sig{margin-top:30px;text-align:right;font-size:11px}
      </style>
      </head><body>
        <div class="center bold big">SHANMUGA HOSPITAL LIMITED</div>
        <div class="center" style="font-size:10px">51/24, Saradha College Road, Salem - 636007</div>
        <div class="center" style="font-size:10px">04272706666</div>
        <div class="center bold" style="margin-top:6px;font-size:13px">Advance Slip</div>
        <div class="line"></div>
        <div class="row"><span>IP No</span><span class="bold">: ${bill.ip_number}</span></div>
        <div class="row"><span>Op number</span><span>: ${bill.uhid}</span></div>
        <div class="row"><span>Name</span><span>: ${bill.patient_name}</span></div>
        <div class="row"><span>Room</span><span>: ${bill.room_no}</span></div>
        <div class="row"><span>Bill Date</span><span>: ${bill.bill_date}</span></div>
        <div class="row"><span>Bill No</span><span>: ${bill.bill_number}</span></div>
        <div class="row"><span>GST No</span><span>: 33ABDCS8326A1ZP</span></div>
        <div class="line"></div>
        <table>
          <thead><tr><th>Slno</th><th>Description</th><th>Amount</th></tr></thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Advance${bill.type === 'ip_advance' ? ' (IP)' : ''} — ${bill.payment_mode}</td>
              <td style="text-align:right">${parseFloat(bill.amount).toFixed(2)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr><td colspan="2" style="text-align:right;font-weight:700">Total</td>
            <td style="text-align:right;font-weight:700">${parseFloat(bill.amount).toFixed(2)}</td></tr>
          </tfoot>
        </table>
        <div class="sig">
          Signature Of Cashier<br/>User : ${bill.created_by}
        </div>
        <script>window.onload=function(){window.print();window.close();}</script>
      </body></html>
    `);
    win.document.close();
  };

  // ── Filter chips ──────────────────────────────────────────────────────────
  const toggleStatus = (s) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const visibleRows = tableRows.filter((r) => {
    if (activeStatuses.size === 0) return true;
    return (
      activeStatuses.has(r.advance_status) ||
      activeStatuses.has(r.payment_mode)
    );
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Wrapper>
      <TopLayout>
        {/* ── Left: Form ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader>IP Advance Collection</CardHeader>
          <Grid cols={6}>

            {/* UHID */}
            <Field span={2}>
              <Lbl>UHID</Lbl>
              <Row>
                <Inp name="uhid" value={form.uhid} onChange={handleChange} placeholder="Enter UHID" />
                <IconBtn type="button" onClick={searchByUHID}>🔍</IconBtn>
              </Row>
            </Field>

            {/* Date */}
            <Field>
              <Lbl>Date</Lbl>
              <Inp type="date" name="date" value={form.date} onChange={handleChange} />
            </Field>

            {/* Name */}
            <Field span={3}>
              <Lbl>Name</Lbl>
              <Inp value={form.name} readOnly />
            </Field>

            {/* IP No */}
            <Field span={2}>
              <Lbl>IP No</Lbl>
              <Row>
                <Inp name="ipNumber" value={form.ipNumber} onChange={handleChange} placeholder="Enter IP No" />
                <IconBtn type="button" onClick={searchByIP}>🔍</IconBtn>
              </Row>
            </Field>

            {/* Age */}
            <Field>
              <Lbl>Age</Lbl>
              <Inp value={form.age} readOnly />
            </Field>

            {/* Gender */}
            <Field>
              <Lbl>Gender</Lbl>
              <Inp value={form.gender} readOnly />
            </Field>

            {/* Room No */}
            <Field>
              <Lbl>Room No</Lbl>
              <Inp value={form.roomNo} readOnly />
            </Field>

            {/* Bed No */}
            <Field>
              <Lbl>Bed No</Lbl>
              <Inp value={form.bedNo} readOnly />
            </Field>


            {/* Amount */}
            <Field>
              <Lbl>Amount</Lbl>
              <Row>
                <span style={{ fontSize: "0.85rem", color: "#6b7280", flexShrink: 0 }}>₹</span>
                <Inp
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                />
              </Row>
            </Field>

            {/* Customer Type */}
            <Field span={2}>
              <Lbl>Customer Type</Lbl>
              <Inp value={form.customer_type} readOnly />
            </Field>

            {/* Admitting Date */}
            <Field span={2}>
              <Lbl>Admitting Date</Lbl>
              <Inp value={form.admittingDate} readOnly />
            </Field>

            {/* Advance Type */}
            <Field>
              <Lbl>Advance Type</Lbl>
              <Sel name="advanceType" value={form.advanceType} onChange={handleChange}>
                <option value="advance">Advance</option>
                <option value="ip_advance">IP Advance</option>
              </Sel>
            </Field>

            {/* Advance Remarks */}
            <Field span={2}>
              <Lbl>Advance Remarks</Lbl>
              <Txta name="advanceRemarks" value={form.advanceRemarks} onChange={handleChange} rows={2} />
            </Field>

            {/* Company */}
            <Field span={2}>
              <Lbl>Company</Lbl>
              <Inp value={form.company} readOnly />
            </Field>

            {/* Admitting Doctor */}
            <Field span={2}>
              <Lbl>Admitting Doctor</Lbl>
              <Inp value={form.admittingDoctor} readOnly />
            </Field>

            {/* Credit Limit */}
            <Field>
              <Lbl>Credit Limit</Lbl>
              <Inp value={form.creditLimit} readOnly />
            </Field>

            {/* Outstanding Balance */}
            <Field>
              <Lbl>Out. Balance</Lbl>
              <Inp value={form.outBalance} readOnly />
            </Field>

            {/* Total Advance */}
            <Field span={2}>
              <Lbl>Total Advance</Lbl>
              <Inp value={form.totalAdvance} readOnly />
            </Field>

            {/* Address */}
            <Field span={6}>
              <Lbl>Address 1</Lbl>
              <Inp value={form.address} readOnly />
            </Field>

          </Grid>

          <ActionBar>
            {lastBill && (
              <Btn onClick={() => printBill(lastBill)}>🖨️ Print Bill</Btn>
            )}
            <Btn variant="reset" onClick={handleReset}>↺ Reset</Btn>
            <Btn onClick={handleSave}>💾 Save</Btn>
          </ActionBar>
        </Card>
      </TopLayout>

      {/* ── Search / Filter ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>Advance Records</CardHeader>
        <SearchBar>
          <Field>
            <Lbl>From Date</Lbl>
            <Inp
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))}
            />
          </Field>
          <Field>
            <Lbl>To Date</Lbl>
            <Inp
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))}
            />
          </Field>
          <Field>
            <Lbl>UHID</Lbl>
            <Inp
              value={filters.uhid}
              onChange={(e) => setFilters((p) => ({ ...p, uhid: e.target.value }))}
              placeholder="UHID"
            />
          </Field>
          <Field>
            <Lbl>IP Number</Lbl>
            <Row>
              <Inp
                value={filters.ipNumber}
                onChange={(e) => setFilters((p) => ({ ...p, ipNumber: e.target.value }))}
                placeholder="IP Number"
              />
              <IconBtn type="button" onClick={fetchTable}>🔍 Search</IconBtn>
            </Row>
          </Field>
        </SearchBar>

        {/* Payment mode filter chips */}
        <ChipRow>
          {["Not Paid","Cash","Multi Payment","Credit/Debit Card","Cheque","Neft & Others"].map((s) => (
            <Chip key={s} color={STATUS_COLORS[s]} onClick={() => toggleStatus(s)}>
              <input
                type="checkbox"
                checked={activeStatuses.has(s)}
                onChange={() => toggleStatus(s)}
                style={{ cursor: "pointer" }}
              />
              {s}
            </Chip>
          ))}
        </ChipRow>

        {/* Status filter chips (row 2) */}
        <ChipRow style={{ borderBottom: "none" }}>
          {["Refunded","Partially Refunded","Not Adjusted","Advance Settled","Cancelled"].map((s) => (
            <Chip key={s} color={STATUS_COLORS[s]} onClick={() => toggleStatus(s)}>
              <input
                type="checkbox"
                checked={activeStatuses.has(s)}
                onChange={() => toggleStatus(s)}
                style={{ cursor: "pointer" }}
              />
              {s}
            </Chip>
          ))}
        </ChipRow>

        {/* Table */}
        <TblWrap>
          <Tbl>
            <thead>
              <tr>
                {[
                  "Bill Date","Bill Number","Payment Mode",
                  "Advance Reference","Advance Status","UHID Number",
                  "Patient","Description","Advance Amount","Balance Amount","Actions",
                ].map((h) => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <Td colSpan={11} style={{ textAlign: "center", padding: 20, color: "#6b7280" }}>
                    No records found
                  </Td>
                </tr>
              ) : (
                visibleRows.map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <Td>{r.bill_date}</Td>
                    <Td style={{ fontWeight: 600 }}>{r.bill_number}</Td>
                    <Td>
                      <Badge status={r.payment_mode}>{r.payment_mode}</Badge>
                    </Td>
                    <Td>{r.advance_reference}</Td>
                    <Td>
                      <Badge status={r.advance_status}>{r.advance_status}</Badge>
                    </Td>
                    <Td>{r.uhid}</Td>
                    <Td>{r.patient}</Td>
                    <Td style={{ textTransform: "capitalize" }}>{r.description}</Td>
                    <Td style={{ textAlign: "right", fontWeight: 600 }}>
                      ₹{parseFloat(r.advance_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </Td>
                    <Td style={{ textAlign: "right" }}>
                      ₹{parseFloat(r.balance_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </Td>
                    <Td>
                      <MiniBtn
                        onClick={() =>
                          printBill({
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
                          })
                        }
                      >
                        🖨️
                      </MiniBtn>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Tbl>
        </TblWrap>
      </Card>
    </Wrapper>
  );
}