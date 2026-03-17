import React, { useState, useEffect, useCallback } from "react";
import {
  PageWrapper,
  Container,
  Input,
  Select,
  Button,
  Table,
  Th,
  Td,
  Tr,
  Label,
  colors,
} from "../GlobalStyles";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";

// ─── Styled Components ────────────────────────────────────────────────────────

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0 10px;
  border-bottom: 1px solid ${colors.border};
  margin-bottom: 10px;
`;

const Breadcrumb = styled.div`
  font-size: 0.78rem;
  color: ${colors.textMuted};
  span { color: ${colors.primary}; font-weight: 600; }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const HeaderBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 13px;
  border-radius: 5px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid;
  transition: all 0.15s;
  background: ${(p) => (p.primary ? colors.primary : "white")};
  color: ${(p) => (p.primary ? "white" : colors.primary)};
  border-color: ${colors.primary};
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const TopBar = styled.div`
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 7px;
  padding: 10px 14px;
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: ${(p) => p.w || "160px"};
`;

const FieldLabel = styled.label`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const Required = styled.span`color: #dc2626; margin-left: 2px;`;

const CompactInput = styled(Input)`
  padding: 5px 9px;
  font-size: 0.82rem;
  height: 30px;
`;

const CompactSelect = styled(Select)`
  padding: 5px 9px;
  font-size: 0.82rem;
  height: 30px;
`;

const SearchBtn = styled.button`
  height: 30px;
  width: 30px;
  border-radius: 50%;
  border: 1.5px solid ${colors.primary};
  background: ${colors.primary};
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const InputWithSearch = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

/* ── Patient Info Card ── */
const PatientCard = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  border: 1px solid ${colors.border};
  border-radius: 7px;
  overflow: hidden;
  margin-bottom: 10px;
`;

const PatientLeft = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`;

const PatientRight = styled.div`
  width: 280px;
  border-left: 1px solid ${colors.border};
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const PCell = styled.div`
  padding: 5px 12px;
  border-right: ${(p) => (p.noBorderRight ? "none" : `1px solid ${colors.border}`)};
  border-bottom: ${(p) => (p.noBorderBottom ? "none" : `1px solid ${colors.border}`)};
`;

const PCellLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const PCellValue = styled.div`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${colors.textMain};
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/* ── Items section ── */
const SectionCard = styled.div`
  border: 1px solid ${colors.border};
  border-radius: 7px;
  overflow: hidden;
  margin-bottom: 10px;
`;

const SectionHead = styled.div`
  background: #f1f5f9;
  border-bottom: 1px solid ${colors.border};
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionTitle = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: ${colors.textMain};
`;

/* Item input row — matches screenshot columns:
   Item | Quantity | Price | Discount | Amount | Doctor | Doctor Fee | Item Description | +/↺ */
const ItemInputRow = styled.div`
  display: grid;
  grid-template-columns: 2.2fr 0.8fr 0.8fr 0.8fr 0.9fr 1.4fr 1fr 1.8fr 60px;
  gap: 6px;
  align-items: flex-end;
  padding: 8px 12px;
  border-bottom: 1px solid ${colors.border};
  background: #fafafa;
`;

/* Table header — matches: Sl No | Product | Description | Quantity | Rate | Discount | Amount | Package Name | Doctor | actions */
const ItemTableHead = styled.div`
  display: grid;
  grid-template-columns: 50px 2fr 1.5fr 0.7fr 0.8fr 0.8fr 1fr 1.5fr 1.5fr 60px;
  gap: 4px;
  padding: 5px 12px;
  background: #f8fafc;
  border-bottom: 1px solid ${colors.border};
`;

const ItemTableRow = styled.div`
  display: grid;
  grid-template-columns: 50px 2fr 1.5fr 0.7fr 0.8fr 0.8fr 1fr 1.5fr 1.5fr 60px;
  gap: 4px;
  padding: 5px 12px;
  border-bottom: 1px dashed ${colors.border};
  align-items: center;
  &:last-child { border-bottom: none; }
  &:hover { background: #f8fafc; }
`;

const ColHead = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: ${colors.textMuted};
`;

const ColCell = styled.span`
  font-size: 0.82rem;
  color: ${colors.textMain};
`;

const TinyInput = styled.input`
  width: 100%;
  padding: 3px 6px;
  font-size: 0.8rem;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  outline: none;
  &:focus { border-color: ${colors.primary}; }
  &:read-only { background: #f1f5f9; color: ${colors.textMuted}; }
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 3px 5px;
  border-radius: 4px;
  font-size: 0.9rem;
  color: ${(p) => (p.danger ? "#dc2626" : colors.primary)};
  &:hover { background: ${(p) => (p.danger ? "#fee2e2" : "#e0f2fe")}; }
`;

/* ── Financial summary ── */
const FinancialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid ${colors.border};
`;

const FinCol = styled.div`
  padding: 8px 12px;
  border-right: 1px solid ${colors.border};
  &:last-child { border-right: none; }
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const FinRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
`;

const FinLabel = styled.span`
  min-width: ${(p) => p.w || "96px"};
  color: ${colors.textMain};
  font-weight: 500;
  flex-shrink: 0;
  font-size: 0.78rem;
`;

const FinInput = styled.input`
  flex: 1;
  padding: 3px 7px;
  font-size: 0.8rem;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  outline: none;
  text-align: right;
  min-width: 0;
  &:focus { border-color: ${colors.primary}; }
  &[readOnly] { background: #f1f5f9; color: ${colors.textMuted}; }
`;

const RupeeIcon = styled.span`
  color: ${colors.textMuted};
  font-size: 0.78rem;
  flex-shrink: 0;
`;

const FinActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid ${colors.border};
  background: #fafafa;
`;

/* ── Checkbox / toggle row ── */
const CheckRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
`;

const CheckLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${colors.textMain};
  cursor: pointer;
  user-select: none;
  input { accent-color: ${colors.primary}; }
`;

/* ── Lists / Tables ── */
const TabBar = styled.div`
  display: flex;
  background: ${colors.tabBg || "#f8fafc"};
  border-bottom: 2px solid ${colors.border};
  margin-bottom: 12px;
`;

const Tab = styled.button`
  padding: 9px 20px;
  border: none;
  background: ${(p) => (p.active ? "white" : "transparent")};
  color: ${(p) => (p.active ? colors.primary : colors.textMuted)};
  font-weight: ${(p) => (p.active ? 700 : 500)};
  font-size: 0.85rem;
  cursor: pointer;
  border-bottom: ${(p) => (p.active ? `2px solid ${colors.primary}` : "2px solid transparent")};
  margin-bottom: -2px;
  transition: all 0.15s;
  &:hover { color: ${colors.primary}; }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 700;
  background: ${(p) =>
    p.v === "green"  ? "#dcfce7" :
    p.v === "orange" ? "#ffedd5" : "#f1f5f9"};
  color: ${(p) =>
    p.v === "green"  ? "#16a34a" :
    p.v === "orange" ? "#c2410c" : colors.textMuted};
`;

const ActionBtn = styled.button`
  padding: 3px 10px;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  background: ${(p) => (p.success ? "#dcfce7" : "#dbeafe")};
  color: ${(p) => (p.success ? "#16a34a" : "#1d4ed8")};
  &:hover { opacity: 0.8; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const ErrText = styled.div`
  color: #dc2626;
  font-size: 0.72rem;
  margin-top: 2px;
  padding-left: 2px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px;
  color: ${colors.textMuted};
  font-size: 0.85rem;
`;

/* ── Modal ── */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  background: white;
  border-radius: 10px;
  width: 97%;
  max-width: 940px;
  max-height: 93vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
`;

const ModalHead = styled.div`
  padding: 13px 20px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${colors.primary};
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const EMPTY_FORM = {
  advance_amount:   "",
  sales_return:     "",
  medicines:        "",
  taxable:          "",
  non_tax:          "",
  tpa_paid:         "",
  sales_tax:        "",
  gst_amount:       "",
  room_tax:         "",
  cess:             "",
  luxury_tax:       "",
  clerk:            "",
  discount_percent: "",
  discount_amount:  "",
  disc_reason:      "",
  bill_upto:        new Date().toISOString().split("T")[0],
  staff_id:         "",
  charity_type:     "",
  // toggles
  is_discharge:     true,
  show_advances:    false,
  group_items:      true,
  part_bill:        false,
};

const EMPTY_ITEM = {
  itemName:         "",
  description:      "",
  quantity:         1,
  rate:             "",
  discount:         0,
  amount:           "",
  doctor:           "",
  doctor_fee:       "",
  item_description: "",
  package_name:     "",
};

const fmt = (v) => (parseFloat(v) || 0).toFixed(2);
const fc  = (setForm) => (field, value) =>
  setForm((prev) => ({ ...prev, [field]: value }));

// ─── Main Component ───────────────────────────────────────────────────────────

const DischargeBilling = () => {
  const [activeTab, setActiveTab] = useState("create");

  // ── Search state
  const [uhid,         setUhid]         = useState("");
  const [ipNumber,     setIpNumber]     = useState("");
  const [searchLoading,setSearchLoading]= useState(false);
  const [searchError,  setSearchError]  = useState("");

  // ── Patient + invest data
  const [patientInfo,  setPatientInfo]  = useState(null);
  const [investItems,  setInvestItems]  = useState([]);   // Credit+Pending items from MongoDB

  // ── Bill items
  const [items,        setItems]        = useState([]);
  const [newItem,      setNewItem]      = useState(EMPTY_ITEM);
  const [selectedInvest, setSelectedInvest] = useState("");

  // ── Financial form
  const [form, setForm] = useState(EMPTY_FORM);
  const setField = fc(setForm);

  // ── Lists
  const [estimates,    setEstimates]    = useState([]);
  const [bills,        setBills]        = useState([]);

  // ── Modal
  const [viewEstimate, setViewEstimate]     = useState(null);
  const [convertLoading, setConvertLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch lists ─────────────────────────────────────────────────────────────

  const fetchEstimates = useCallback(async () => {
    try {
      const res  = await apiRequest(`${baseUrl}discharge-billing/?status=Estimate`, "GET");
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setEstimates(list);
    } catch { showToast("Failed to fetch estimates", "error"); }
  }, []);

  const fetchBills = useCallback(async () => {
    try {
      const res  = await apiRequest(`${baseUrl}discharge-billing/?status=Billed`, "GET");
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setBills(list);
    } catch { showToast("Failed to fetch bills", "error"); }
  }, []);

  useEffect(() => {
    fetchEstimates();
    fetchBills();
  }, [fetchEstimates, fetchBills]);

  // ── Patient Search ──────────────────────────────────────────────────────────
  // Supports searching by UHID or IP Number.
  // Backend resolves the active admission (is_admissionActive=True, is_discharged=False)
  // and returns Credit+Pending investbilling items for that IP number.

  const handleSearch = async (mode) => {
    const val = mode === "uhid" ? uhid.trim() : ipNumber.trim();
    if (!val) { setSearchError("Please enter a value"); return; }

    setSearchError("");
    setSearchLoading(true);
    setPatientInfo(null);
    setInvestItems([]);
    setItems([]);
    setNewItem(EMPTY_ITEM);
    setSelectedInvest("");

    try {
      const param = mode === "uhid"
        ? `uhid=${encodeURIComponent(val)}`
        : `ipNumber=${encodeURIComponent(val)}`;

      const res = await apiRequest(
        `${baseUrl}search-discharge-patient/?${param}`,
        "GET"
      );

      if (res?.patient) {
        setPatientInfo(res.patient);
        setInvestItems(res.invest_items || []);

        // Sync the other search field from the response
        if (res.patient.uhid)      setUhid(res.patient.uhid);
        if (res.patient.ip_number) setIpNumber(res.patient.ip_number);
      } else {
        setSearchError("No record found");
      }
    } catch {
      setSearchError("Error searching — check network");
    } finally {
      setSearchLoading(false);
    }
  };

  // ── Item helpers ────────────────────────────────────────────────────────────

  const handleInvestSelect = (e) => {
    const val = e.target.value;
    setSelectedInvest(val);
    if (!val) { setNewItem(EMPTY_ITEM); return; }

    // Match by test_id (stringified) or itemName
    const found = investItems.find(
      (i) => String(i.test_id) === val || i.itemName === val
    );
    if (found) {
      const qty   = found.quantity || 1;
      const price = found.price    || 0;
      setNewItem({
        itemName:         found.itemName,
        description:      found.billTypeNo || "",
        quantity:         qty,
        rate:             price,
        discount:         0,
        amount:           qty * price,
        doctor:           found.doctor || patientInfo?.doctor || "",
        doctor_fee:       "",
        item_description: "",
        package_name:     found.package_name || "",
      });
    }
  };

  const calcAmount = (item) => {
    const qty  = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate)     || 0;
    const disc = parseFloat(item.discount) || 0;
    return Math.max(0, qty * rate - disc);
  };

  const handleNewItemChange = (field, value) => {
    setNewItem((prev) => {
      const updated = { ...prev, [field]: value };
      if (["quantity", "rate", "discount"].includes(field)) {
        updated.amount = calcAmount(updated);
      }
      return updated;
    });
  };

  const handleAddItem = () => {
    if (!newItem.itemName) { showToast("Select an item first", "error"); return; }
    setItems((prev) => [...prev, { ...newItem, _key: `${newItem.itemName}_${Date.now()}` }]);
    setNewItem(EMPTY_ITEM);
    setSelectedInvest("");
  };

  const handleRefreshItem = () => { setNewItem(EMPTY_ITEM); setSelectedInvest(""); };

  const handleRemoveItem = (key) =>
    setItems((prev) => prev.filter((i) => i._key !== key));

  const handleEditItem = (key, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item._key !== key) return item;
        const updated = { ...item, [field]: value };
        if (["quantity", "rate", "discount"].includes(field)) {
          updated.amount = calcAmount(updated);
        }
        return updated;
      })
    );
  };

  // ── Calculations ─────────────────────────────────────────────────────────

  const totalAmount  = items.reduce((a, i) => a + (parseFloat(i.amount) || 0), 0);
  const itemDisc     = items.reduce((a, i) => a + (parseFloat(i.discount) || 0), 0);
  const taxable      = parseFloat(form.taxable)           || 0;
  const nonTax       = parseFloat(form.non_tax)           || 0;
  const tpaPaid      = parseFloat(form.tpa_paid)          || 0;
  const salesTax     = parseFloat(form.sales_tax)         || 0;
  const advAmt       = parseFloat(form.advance_amount)    || 0;
  const salesReturn  = parseFloat(form.sales_return)      || 0;
  const medicines    = parseFloat(form.medicines)         || 0;
  const gst          = parseFloat(form.gst_amount)        || 0;
  const roomTax      = parseFloat(form.room_tax)          || 0;
  const cess         = parseFloat(form.cess)              || 0;
  const luxuryTax    = parseFloat(form.luxury_tax)        || 0;
  const discPercent  = parseFloat(form.discount_percent)  || 0;
  const discAmt      = parseFloat(form.discount_amount)   ||
                       (totalAmount * discPercent) / 100;
  const totalDisc    = discAmt + itemDisc;
  const netAmount    = Math.max(
    0,
    totalAmount + gst + roomTax + medicines + salesTax + cess + luxuryTax
      - advAmt - salesReturn - totalDisc - tpaPaid
  );

  // ── Payload builder ──────────────────────────────────────────────────────

  const buildPayload = (billStatus) => ({
    status:           billStatus,
    uhid:             patientInfo?.uhid      || null,
    ip_number:        patientInfo?.ip_number || null,
    items:            items.map(({ _key, ...rest }) => rest),
    total_amount:     totalAmount,
    advance_amount:   advAmt,
    sales_return:     salesReturn,
    medicines_amount: medicines,
    taxable_amount:   taxable,
    non_tax_amount:   nonTax,
    gst_amount:       gst,
    room_tax:         roomTax,
    discount_percent: discPercent,
    discount_amount:  discAmt,
    disc_reason:      form.disc_reason,
    item_disc:        itemDisc,
    total_disc:       totalDisc,
    net_amount:       netAmount,
    remarks:          form.remarks || "",
    staff_id:         form.staff_id,
    charity_type:     form.charity_type,
  });

  // ── Save handlers ────────────────────────────────────────────────────────

  const handleSaveEstimate = async () => {
    if (!patientInfo)  { showToast("Search and select a patient first", "error"); return; }
    if (!items.length) { showToast("Add at least one item", "error"); return; }
    setLoading(true);
    try {
      const res  = await apiRequest(`${baseUrl}discharge-billing/`, "POST", buildPayload("Estimate"));
      const data = res?.id ? res : res?.data;
      if (data?.id || data?.estimate_number) {
        showToast(`Estimate saved — ${data.estimate_number || ""}`);
        handleReset(); fetchEstimates(); setActiveTab("estimates");
      } else { showToast(JSON.stringify(res?.data || res), "error"); }
    } catch { showToast("Network error", "error"); }
    finally { setLoading(false); }
  };

  const handleSaveBill = async () => {
    if (!patientInfo)  { showToast("Search and select a patient first", "error"); return; }
    if (!items.length) { showToast("Add at least one item", "error"); return; }
    setLoading(true);
    try {
      const res  = await apiRequest(`${baseUrl}discharge-billing/`, "POST", buildPayload("Billed"));
      const data = res?.id ? res : res?.data;
      if (data?.id || data?.bill_no) {
        showToast(`Bill saved — ${data.bill_no || ""}`);
        handleReset(); fetchBills(); setActiveTab("bills");
      } else { showToast(JSON.stringify(res?.data || res), "error"); }
    } catch { showToast("Network error", "error"); }
    finally { setLoading(false); }
  };

  const handleConvertToBill = async (estimate) => {
    setConvertLoading(true);
    try {
      const res  = await apiRequest(
        `${baseUrl}discharge-billing/${estimate.id}/convert-to-bill/`, "POST", {}
      );
      const data = res?.id ? res : res?.data;
      if (data?.id || data?.bill_no) {
        showToast(`Converted to Bill — ${data.bill_no || ""}`);
        setViewEstimate(null); fetchEstimates(); fetchBills(); setActiveTab("bills");
      } else { showToast(JSON.stringify(res?.error || res), "error"); }
    } catch { showToast("Network error", "error"); }
    finally { setConvertLoading(false); }
  };

  const handleReset = () => {
    setPatientInfo(null); setInvestItems([]); setItems([]);
    setNewItem(EMPTY_ITEM); setSelectedInvest("");
    setUhid(""); setIpNumber(""); setSearchError("");
    setForm(EMPTY_FORM);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 9999,
          padding: "10px 18px", borderRadius: 6,
          background: toast.type === "error" ? "#dc2626" : "#16a34a",
          color: "white", fontWeight: 600, fontSize: "0.875rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
        }}>
          {toast.msg}
        </div>
      )}

      <Container>
        {/* Breadcrumb + header */}
        <PageHeader>
          <Breadcrumb>Home / <span>Discharge Bill</span></Breadcrumb>
          <HeaderActions>
            <HeaderBtn onClick={() => { setActiveTab("estimates"); fetchEstimates(); }}>
              📋 View Estimate
            </HeaderBtn>
            <HeaderBtn onClick={() => {}}>
              🔔 Pending Discharge Request
            </HeaderBtn>
            <HeaderBtn primary onClick={() => { setActiveTab("bills"); fetchBills(); }}>
              🧾 View Bills
            </HeaderBtn>
          </HeaderActions>
        </PageHeader>

        {/* Tab bar */}
        <TabBar>
          <Tab active={activeTab === "create"} onClick={() => setActiveTab("create")}>
            Create Bill / Estimate
          </Tab>
          <Tab active={activeTab === "estimates"} onClick={() => { setActiveTab("estimates"); fetchEstimates(); }}>
            Estimates ({estimates.length})
          </Tab>
          <Tab active={activeTab === "bills"} onClick={() => { setActiveTab("bills"); fetchBills(); }}>
            Bills ({bills.length})
          </Tab>
        </TabBar>

        {/* ══ CREATE TAB ══════════════════════════════════════════════════════ */}
        {activeTab === "create" && (
          <>
            {/* ── Search / Top Controls ── */}
            <TopBar>
              {/* UHID */}
              <FieldGroup w="170px">
                <FieldLabel>UHID No <Required>*</Required></FieldLabel>
                <InputWithSearch>
                  <CompactInput
                    value={uhid}
                    onChange={(e) => { setUhid(e.target.value); setSearchError(""); }}
                    placeholder="S025/011667"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch("uhid")}
                  />
                  <SearchBtn
                    onClick={() => handleSearch("uhid")}
                    disabled={searchLoading}
                    title="Search by UHID"
                  >
                    🔍
                  </SearchBtn>
                </InputWithSearch>
              </FieldGroup>

              {/* IP Number */}
              <FieldGroup w="170px">
                <FieldLabel>IP Number <Required>*</Required></FieldLabel>
                <InputWithSearch>
                  <CompactInput
                    value={ipNumber}
                    onChange={(e) => { setIpNumber(e.target.value); setSearchError(""); }}
                    placeholder="S025/012488"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch("ipNumber")}
                  />
                  <SearchBtn
                    onClick={() => handleSearch("ipNumber")}
                    disabled={searchLoading}
                    title="Search by IP Number"
                  >
                    🔍
                  </SearchBtn>
                </InputWithSearch>
              </FieldGroup>

              {/* Bill Up To */}
              <FieldGroup w="140px">
                <FieldLabel>Bill up to</FieldLabel>
                <CompactInput
                  type="date"
                  value={form.bill_upto}
                  onChange={(e) => setField("bill_upto", e.target.value)}
                />
              </FieldGroup>

              {/* Staff ID */}
              <FieldGroup w="130px">
                <FieldLabel>Staff ID</FieldLabel>
                <CompactInput
                  value={form.staff_id}
                  onChange={(e) => setField("staff_id", e.target.value)}
                  placeholder=""
                />
              </FieldGroup>

              {/* Charity Type */}
              <FieldGroup w="140px">
                <FieldLabel>Charity Type</FieldLabel>
                <CompactSelect
                  value={form.charity_type}
                  onChange={(e) => setField("charity_type", e.target.value)}
                >
                  <option value="">-- Select --</option>
                  <option value="full">Full Charity</option>
                  <option value="partial">Partial Charity</option>
                </CompactSelect>
              </FieldGroup>

              {/* Toggles */}
              <FieldGroup w="auto" style={{ justifyContent: "flex-end" }}>
                <FieldLabel>&nbsp;</FieldLabel>
                <CheckRow>
                  <CheckLabel>
                    <input
                      type="checkbox"
                      checked={form.is_discharge}
                      onChange={(e) => setField("is_discharge", e.target.checked)}
                    />
                    Discharge
                  </CheckLabel>
                  <CheckLabel>
                    <input
                      type="checkbox"
                      checked={form.show_advances}
                      onChange={(e) => setField("show_advances", e.target.checked)}
                    />
                    Show Advances
                  </CheckLabel>
                  <CheckLabel>
                    <input
                      type="checkbox"
                      checked={form.group_items}
                      onChange={(e) => setField("group_items", e.target.checked)}
                    />
                    Group Items
                  </CheckLabel>
                  <CheckLabel>
                    <input
                      type="checkbox"
                      checked={form.part_bill}
                      onChange={(e) => setField("part_bill", e.target.checked)}
                    />
                    Part Bill
                  </CheckLabel>
                </CheckRow>
              </FieldGroup>
            </TopBar>

            {searchError && <ErrText>{searchError}</ErrText>}

            {/* ── Patient Info Card ── */}
            {patientInfo && (
              <PatientCard>
                <PatientLeft>
                  {/* Row 1 */}
                  <PCell>
                    <PCellLabel>Name</PCellLabel>
                    <PCellValue>{patientInfo.patient_name || "—"}</PCellValue>
                  </PCell>
                  <PCell>
                    <PCellLabel>Age / Gender</PCellLabel>
                    <PCellValue>{patientInfo.age} Years / {patientInfo.gender}</PCellValue>
                  </PCell>
                  <PCell noBorderRight>
                    <PCellLabel>Doctor</PCellLabel>
                    <PCellValue style={{ fontSize: "0.78rem" }}>{patientInfo.doctor || "—"}</PCellValue>
                  </PCell>
                  {/* Row 2 */}
                  <PCell noBorderBottom>
                    <PCellLabel>Admission Date</PCellLabel>
                    <PCellValue>{patientInfo.admission_date || "—"}</PCellValue>
                  </PCell>
                  <PCell noBorderBottom>
                    <PCellLabel>UHID / IP No</PCellLabel>
                    <PCellValue style={{ fontSize: "0.76rem" }}>
                      {patientInfo.uhid} / {patientInfo.ip_number || "—"}
                    </PCellValue>
                  </PCell>
                  <PCell noBorderRight noBorderBottom>
                    <PCellLabel>Mobile</PCellLabel>
                    <PCellValue>{patientInfo.mobile || "—"}</PCellValue>
                  </PCell>
                </PatientLeft>

                <PatientRight>
                  <PCell>
                    <PCellLabel>Patient Type</PCellLabel>
                    <PCellValue style={{ textTransform: "uppercase" }}>
                      {patientInfo.patient_type || "—"}
                    </PCellValue>
                  </PCell>
                  <PCell noBorderRight>
                    <PCellLabel>Company</PCellLabel>
                    <PCellValue>{patientInfo.company || "—"}</PCellValue>
                  </PCell>
                  <PCell noBorderBottom>
                    <PCellLabel>Room No</PCellLabel>
                    <PCellValue>{patientInfo.room_no || "—"}</PCellValue>
                  </PCell>
                  <PCell noBorderRight noBorderBottom>
                    <PCellLabel>Total Days</PCellLabel>
                    <PCellValue>{patientInfo.total_days ?? 0}</PCellValue>
                  </PCell>
                </PatientRight>
              </PatientCard>
            )}

            {/* ── Items Section ── */}
            <SectionCard>
              <SectionHead>
                <SectionTitle>Investigation Items</SectionTitle>
                {investItems.length > 0 && (
                  <span style={{ fontSize: "0.7rem", color: colors.textMuted }}>
                    {investItems.length} credit item{investItems.length !== 1 ? "s" : ""} available
                  </span>
                )}
              </SectionHead>

              {/* Input row */}
              <ItemInputRow>
                <FieldGroup w="100%">
                  <FieldLabel>Item <Required>*</Required></FieldLabel>
                  <InputWithSearch>
                    <CompactSelect
                      value={selectedInvest}
                      onChange={handleInvestSelect}
                      style={{ flex: 1 }}
                      disabled={!patientInfo}
                    >
                      <option value="">-- Select Item --</option>
                      {investItems.map((it, idx) => (
                        <option
                          key={idx}
                          value={it.test_id != null ? String(it.test_id) : it.itemName}
                        >
                          {it.itemName}
                          {it.invest_bill_no ? ` (${it.invest_bill_no})` : ""}
                        </option>
                      ))}
                    </CompactSelect>
                  </InputWithSearch>
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Quantity</FieldLabel>
                  <TinyInput
                    type="number" min={1}
                    value={newItem.quantity}
                    onChange={(e) => handleNewItemChange("quantity", Number(e.target.value) || 1)}
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Price</FieldLabel>
                  <TinyInput
                    type="number" min={0}
                    value={newItem.rate}
                    onChange={(e) => handleNewItemChange("rate", e.target.value)}
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Discount</FieldLabel>
                  <TinyInput
                    type="number" min={0}
                    value={newItem.discount}
                    onChange={(e) => handleNewItemChange("discount", e.target.value)}
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Amount</FieldLabel>
                  <TinyInput readOnly value={fmt(newItem.amount)} />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Doctor</FieldLabel>
                  <TinyInput
                    value={newItem.doctor}
                    onChange={(e) => handleNewItemChange("doctor", e.target.value)}
                    placeholder="--Select--"
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Doctor Fee</FieldLabel>
                  <TinyInput
                    type="number" min={0}
                    value={newItem.doctor_fee}
                    onChange={(e) => handleNewItemChange("doctor_fee", e.target.value)}
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Item Description</FieldLabel>
                  <TinyInput
                    value={newItem.item_description}
                    onChange={(e) => handleNewItemChange("item_description", e.target.value)}
                  />
                </FieldGroup>

                <div style={{ display: "flex", gap: 5, alignItems: "flex-end" }}>
                  <button
                    onClick={handleAddItem}
                    style={{
                      width: 28, height: 28, borderRadius: 4,
                      background: colors.primary, border: "none",
                      color: "white", fontWeight: 700, fontSize: "1.1rem",
                      cursor: "pointer",
                    }}
                    title="Add item"
                  >+</button>
                  <button
                    onClick={handleRefreshItem}
                    style={{
                      width: 28, height: 28, borderRadius: 4,
                      background: "#f1f5f9", border: `1px solid ${colors.border}`,
                      cursor: "pointer", fontSize: "0.9rem",
                    }}
                    title="Clear row"
                  >↺</button>
                </div>
              </ItemInputRow>

              {/* Table header */}
              <ItemTableHead>
                <ColHead>Sl No</ColHead>
                <ColHead>Product</ColHead>
                <ColHead>Description</ColHead>
                <ColHead>Quantity</ColHead>
                <ColHead>Rate</ColHead>
                <ColHead>Discount</ColHead>
                <ColHead>Amount</ColHead>
                <ColHead>Package Name</ColHead>
                <ColHead>Doctor</ColHead>
                <ColHead></ColHead>
              </ItemTableHead>

              {/* Table rows */}
              {items.length === 0 ? (
                <EmptyState>
                  {patientInfo
                    ? investItems.length === 0
                      ? "No credit pending items found for this patient."
                      : "Select an investigation above and click + to add."
                    : "Search a patient to load their investigation items."}
                </EmptyState>
              ) : (
                items.map((item, idx) => (
                  <ItemTableRow key={item._key}>
                    <ColCell>{idx + 1}</ColCell>
                    <ColCell style={{ fontWeight: 600 }}>{item.itemName}</ColCell>
                    <ColCell style={{ color: colors.textMuted, fontSize: "0.78rem" }}>
                      {item.item_description || item.description || ""}
                    </ColCell>
                    <ColCell>
                      <TinyInput
                        type="number" min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          handleEditItem(item._key, "quantity", Number(e.target.value) || 1)
                        }
                        style={{ width: 55 }}
                      />
                    </ColCell>
                    <ColCell>{fmt(item.rate)}</ColCell>
                    <ColCell>{fmt(item.discount)}</ColCell>
                    <ColCell style={{ fontWeight: 700 }}>{fmt(item.amount)}</ColCell>
                    <ColCell style={{ fontSize: "0.78rem" }}>{item.package_name || "—"}</ColCell>
                    <ColCell style={{ fontSize: "0.78rem" }}>{item.doctor || "—"}</ColCell>
                    <ColCell>
                      <div style={{ display: "flex", gap: 3 }}>
                        <IconBtn
                          title="Edit"
                          onClick={() => {
                            setNewItem({ ...item });
                            setSelectedInvest("");
                            handleRemoveItem(item._key);
                          }}
                        >✏️</IconBtn>
                        <IconBtn danger title="Remove" onClick={() => handleRemoveItem(item._key)}>
                          🗑
                        </IconBtn>
                      </div>
                    </ColCell>
                  </ItemTableRow>
                ))
              )}
            </SectionCard>

            {/* ── Financial Summary ── */}
            <SectionCard>
              <FinancialGrid>
                {/* Col 1 */}
                <FinCol>
                  <FinRow>
                    <FinLabel>Total Amount</FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput readOnly value={fmt(totalAmount)} />
                  </FinRow>
                  <FinRow>
                    <FinLabel>
                      Advance Amount
                      <span style={{ fontSize: "0.7rem", marginLeft: 4, cursor: "pointer" }}>📋</span>
                    </FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput
                      type="number" min={0}
                      value={form.advance_amount}
                      onChange={(e) => setField("advance_amount", e.target.value)}
                    />
                  </FinRow>
                  <FinRow>
                    <FinLabel>
                      Sales Return
                      <span style={{ fontSize: "0.7rem", marginLeft: 4, cursor: "pointer" }}>📋</span>
                    </FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput
                      type="number" min={0}
                      value={form.sales_return}
                      onChange={(e) => setField("sales_return", e.target.value)}
                    />
                  </FinRow>
                  <FinRow>
                    <FinLabel>Medicines</FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput
                      type="number" min={0}
                      value={form.medicines}
                      onChange={(e) => setField("medicines", e.target.value)}
                    />
                  </FinRow>
                </FinCol>

                {/* Col 2 — Tax breakdown + Net Amount */}
                <FinCol>
                  <FinRow>
                    <FinLabel>Taxable</FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput
                      type="number" min={0}
                      value={form.taxable}
                      onChange={(e) => setField("taxable", e.target.value)}
                    />
                  </FinRow>
                  <FinRow>
                    <FinLabel>Non Tax</FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput
                      type="number" min={0}
                      value={form.non_tax}
                      onChange={(e) => setField("non_tax", e.target.value)}
                    />
                  </FinRow>
                  <FinRow>
                    <FinLabel>TPA Paid</FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput
                      type="number" min={0}
                      value={form.tpa_paid}
                      onChange={(e) => setField("tpa_paid", e.target.value)}
                    />
                  </FinRow>
                  <FinRow>
                    <FinLabel>Sales tax</FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput
                      type="number" min={0}
                      value={form.sales_tax}
                      onChange={(e) => setField("sales_tax", e.target.value)}
                    />
                  </FinRow>
                  <FinRow style={{ fontWeight: 700 }}>
                    <FinLabel style={{ fontWeight: 700 }}>Net Amount</FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput
                      readOnly
                      value={fmt(netAmount)}
                      style={{
                        fontWeight: 700,
                        color: colors.primary,
                        background: "#f0fdf4",
                        border: "1px solid #86efac",
                      }}
                    />
                  </FinRow>
                </FinCol>

                {/* Col 3 — GST / taxes */}
                <FinCol>
                  <FinRow>
                    <FinLabel>GST</FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput
                      type="number" min={0}
                      value={form.gst_amount}
                      onChange={(e) => setField("gst_amount", e.target.value)}
                    />
                  </FinRow>
                  <FinRow>
                    <FinLabel>Room Tax</FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput
                      type="number" min={0}
                      value={form.room_tax}
                      onChange={(e) => setField("room_tax", e.target.value)}
                    />
                  </FinRow>
                  <FinRow>
                    <FinLabel>Cess</FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput
                      type="number" min={0}
                      value={form.cess}
                      onChange={(e) => setField("cess", e.target.value)}
                    />
                  </FinRow>
                  <FinRow>
                    <FinLabel>Luxury Tax</FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput
                      type="number" min={0}
                      value={form.luxury_tax}
                      onChange={(e) => setField("luxury_tax", e.target.value)}
                    />
                  </FinRow>
                  <FinRow>
                    <FinLabel>Clerk</FinLabel>
                    <FinInput
                      value={form.clerk}
                      onChange={(e) => setField("clerk", e.target.value)}
                      style={{ textAlign: "left" }}
                    />
                  </FinRow>
                </FinCol>

                {/* Col 4 — Discount */}
                <FinCol>
                  <FinRow>
                    <FinLabel>Discount</FinLabel>
                    <FinInput
                      type="number" min={0} max={100}
                      value={form.discount_percent}
                      onChange={(e) => setField("discount_percent", e.target.value)}
                      style={{ width: 52, flexGrow: 0, textAlign: "center" }}
                    />
                    <span style={{ fontSize: "0.78rem", color: colors.textMuted }}>%</span>
                    <FinInput
                      type="number" min={0}
                      value={form.discount_amount}
                      onChange={(e) => setField("discount_amount", e.target.value)}
                    />
                  </FinRow>
                  <FinRow>
                    <FinLabel>Disc Reason</FinLabel>
                    <FinInput
                      value={form.disc_reason}
                      onChange={(e) => setField("disc_reason", e.target.value)}
                      style={{ textAlign: "left" }}
                    />
                  </FinRow>
                  <FinRow>
                    <FinLabel>Item Disc</FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput readOnly value={fmt(itemDisc)} />
                  </FinRow>
                  <FinRow>
                    <FinLabel>Total Disc</FinLabel>
                    <RupeeIcon>₹</RupeeIcon>
                    <FinInput readOnly value={fmt(totalDisc)} />
                  </FinRow>
                </FinCol>
              </FinancialGrid>

              <FinActionsRow>
                <HeaderBtn onClick={handleReset}>✕ Cancel</HeaderBtn>
                <HeaderBtn
                  style={{ background: "#f59e0b", borderColor: "#f59e0b", color: "white" }}
                  onClick={handleSaveEstimate}
                  disabled={loading}
                >
                  {loading ? "Saving…" : "📋 Pending Estimate Bills"}
                </HeaderBtn>
                <HeaderBtn primary onClick={handleSaveBill} disabled={loading}>
                  {loading ? "Saving…" : "🧾 Save as Final Bill"}
                </HeaderBtn>
              </FinActionsRow>
            </SectionCard>
          </>
        )}

        {/* ══ ESTIMATES TAB ═══════════════════════════════════════════════════ */}
        {activeTab === "estimates" && (
          <div style={{ overflowX: "auto" }}>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Estimate No.</Th>
                  <Th>UHID / IP No.</Th>
                  <Th>Patient</Th>
                  <Th>Total Amt</Th>
                  <Th>Disc</Th>
                  <Th>Net Amt</Th>
                  <Th>Bill Date</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {estimates.length === 0 ? (
                  <tr><td colSpan={10}><EmptyState>No estimates found.</EmptyState></td></tr>
                ) : (
                  estimates.map((est, idx) => {
                    const pd = est.patient_details || {};
                    return (
                      <Tr key={est.id}>
                        <Td>{idx + 1}</Td>
                        <Td style={{ fontWeight: 700, fontFamily: "monospace", fontSize: "0.8rem" }}>
                          {est.estimate_number}
                        </Td>
                        <Td style={{ fontSize: "0.8rem" }}>{est.uhid || est.ip_number || "—"}</Td>
                        <Td style={{ fontWeight: 600 }}>{pd.patient_name || "—"}</Td>
                        <Td>₹ {fmt(est.total_amount)}</Td>
                        <Td style={{ color: "#dc2626" }}>₹ {fmt(est.total_disc)}</Td>
                        <Td style={{ fontWeight: 700 }}>₹ {fmt(est.net_amount)}</Td>
                        <Td style={{ fontSize: "0.8rem" }}>
                          {est.bill_date ? new Date(est.bill_date).toLocaleDateString("en-IN") : "—"}
                        </Td>
                        <Td><Badge v="orange">Estimate</Badge></Td>
                        <Td>
                          <div style={{ display: "flex", gap: 5 }}>
                            <ActionBtn onClick={() => setViewEstimate(est)}>View</ActionBtn>
                            <ActionBtn success onClick={() => handleConvertToBill(est)}>
                              Convert to Bill
                            </ActionBtn>
                          </div>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        )}

        {/* ══ BILLS TAB ═══════════════════════════════════════════════════════ */}
        {activeTab === "bills" && (
          <div style={{ overflowX: "auto" }}>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Bill No.</Th>
                  <Th>UHID / IP No.</Th>
                  <Th>Patient</Th>
                  <Th>Total Amt</Th>
                  <Th>Advance</Th>
                  <Th>Disc</Th>
                  <Th>GST</Th>
                  <Th>Net Amt</Th>
                  <Th>Bill Date</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr><td colSpan={11}><EmptyState>No bills found.</EmptyState></td></tr>
                ) : (
                  bills.map((bill, idx) => {
                    const pd = bill.patient_details || {};
                    return (
                      <Tr key={bill.id}>
                        <Td>{idx + 1}</Td>
                        <Td style={{ fontWeight: 700, fontFamily: "monospace", fontSize: "0.8rem" }}>
                          {bill.bill_no}
                        </Td>
                        <Td style={{ fontSize: "0.8rem" }}>{bill.uhid || bill.ip_number || "—"}</Td>
                        <Td style={{ fontWeight: 600 }}>{pd.patient_name || "—"}</Td>
                        <Td>₹ {fmt(bill.total_amount)}</Td>
                        <Td style={{ color: "#dc2626" }}>₹ {fmt(bill.advance_amount)}</Td>
                        <Td style={{ color: "#dc2626" }}>₹ {fmt(bill.total_disc)}</Td>
                        <Td style={{ color: "#2563eb" }}>₹ {fmt(bill.gst_amount)}</Td>
                        <Td style={{ fontWeight: 700 }}>₹ {fmt(bill.net_amount)}</Td>
                        <Td style={{ fontSize: "0.8rem" }}>
                          {bill.bill_date ? new Date(bill.bill_date).toLocaleDateString("en-IN") : "—"}
                        </Td>
                        <Td><Badge v="green">Billed</Badge></Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Container>

      {/* ══ ESTIMATE VIEW MODAL ════════════════════════════════════════════════ */}
      {viewEstimate && (
        <Overlay onClick={() => setViewEstimate(null)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle>📋 Estimate — {viewEstimate.estimate_number}</ModalTitle>
              <div style={{ display: "flex", gap: 10 }}>
                <ActionBtn success onClick={() => handleConvertToBill(viewEstimate)} disabled={convertLoading}>
                  {convertLoading ? "Converting…" : "✅ Convert to Bill"}
                </ActionBtn>
                <ActionBtn onClick={() => setViewEstimate(null)}>✕ Close</ActionBtn>
              </div>
            </ModalHead>

            <div style={{ padding: "16px 20px" }}>
              {/* Patient grid */}
              {(() => {
                const pd = viewEstimate.patient_details || {};
                return (
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 0, border: `1px solid ${colors.border}`, borderRadius: 6, marginBottom: 14, overflow: "hidden",
                  }}>
                    {[
                      ["Patient", pd.patient_name || "—"],
                      ["UHID", viewEstimate.uhid || "—"],
                      ["IP Number", viewEstimate.ip_number || "—"],
                      ["Bill Date", viewEstimate.bill_date ? new Date(viewEstimate.bill_date).toLocaleDateString("en-IN") : "—"],
                      ["Age", pd.age || "—"],
                      ["Gender", pd.gender || "—"],
                      ["Mobile", pd.mobile || "—"],
                      ["Status", viewEstimate.status],
                    ].map(([label, val], i) => (
                      <PCell key={i} noBorder={(i + 1) % 4 === 0} lastRow={i >= 4}>
                        <PCellLabel>{label}</PCellLabel>
                        <PCellValue>{val}</PCellValue>
                      </PCell>
                    ))}
                  </div>
                );
              })()}

              {/* Items table */}
              <ItemTableHead>
                <ColHead>Sl</ColHead>
                <ColHead>Item</ColHead>
                <ColHead>Description</ColHead>
                <ColHead>Qty</ColHead>
                <ColHead>Rate</ColHead>
                <ColHead>Discount</ColHead>
                <ColHead>Amount</ColHead>
                <ColHead>Doctor</ColHead>
                <ColHead></ColHead>
              </ItemTableHead>
              {(viewEstimate.items || []).map((item, i) => (
                <ItemTableRow key={i}>
                  <ColCell>{i + 1}</ColCell>
                  <ColCell style={{ fontWeight: 600 }}>{item.itemName}</ColCell>
                  <ColCell style={{ color: colors.textMuted, fontSize: "0.78rem" }}>{item.item_description || ""}</ColCell>
                  <ColCell>{item.quantity}</ColCell>
                  <ColCell>₹ {fmt(item.rate)}</ColCell>
                  <ColCell style={{ color: "#dc2626" }}>₹ {fmt(item.discount)}</ColCell>
                  <ColCell style={{ fontWeight: 700 }}>₹ {fmt(item.amount)}</ColCell>
                  <ColCell style={{ fontSize: "0.78rem" }}>{item.doctor || "—"}</ColCell>
                  <ColCell></ColCell>
                </ItemTableRow>
              ))}

              {/* Totals */}
              <div style={{ maxWidth: 360, marginLeft: "auto", marginTop: 14 }}>
                {[
                  ["Total Amount", fmt(viewEstimate.total_amount), ""],
                  ["Item Discount", fmt(viewEstimate.item_disc), "red"],
                  ["Bill Discount", fmt(viewEstimate.discount_amount), "red"],
                  ["Advance", fmt(viewEstimate.advance_amount), "red"],
                  ["Sales Return", fmt(viewEstimate.sales_return), "red"],
                  ["Medicines", fmt(viewEstimate.medicines_amount), "blue"],
                  ["GST", fmt(viewEstimate.gst_amount), "blue"],
                  ["Room Tax", fmt(viewEstimate.room_tax), "blue"],
                ].map(([label, val, color]) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: "0.85rem", padding: "4px 0",
                    borderBottom: `1px dashed ${colors.border}`,
                  }}>
                    <span>{label}</span>
                    <span style={{ color: color === "red" ? "#dc2626" : color === "blue" ? "#2563eb" : colors.textMain }}>
                      {color === "red" ? "- " : color === "blue" ? "+ " : ""}₹ {val}
                    </span>
                  </div>
                ))}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontWeight: 700, fontSize: "1rem", padding: "8px 0",
                  borderTop: `2px solid ${colors.border}`, marginTop: 4, color: colors.primary,
                }}>
                  <span>Net Amount</span>
                  <span>₹ {fmt(viewEstimate.net_amount)}</span>
                </div>
              </div>

              {viewEstimate.disc_reason && (
                <div style={{ marginTop: 8, fontSize: "0.82rem", color: colors.textMuted }}>
                  <b>Discount Reason:</b> {viewEstimate.disc_reason}
                </div>
              )}
              {viewEstimate.remarks && (
                <div style={{ marginTop: 6, fontSize: "0.82rem", color: colors.textMuted }}>
                  <b>Remarks:</b> {viewEstimate.remarks}
                </div>
              )}
            </div>
          </ModalBox>
        </Overlay>
      )}
    </PageWrapper>
  );
};

export default DischargeBilling;