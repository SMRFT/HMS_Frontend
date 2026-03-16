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
  FormRow,
  FormContent,
  InputWrapper,
  ButtonContainer,
  TableWrapper,
  colors,
} from "../GlobalStyles";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";

// ─── Styled Components ────────────────────────────────────────────────────────

const PageHeader = styled.div`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: white;
  padding: 18px 24px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const PageTitle = styled.h1`margin: 0; font-size: 1.2rem; font-weight: 700;`;
const PageSubtitle = styled.p`margin: 3px 0 0; font-size: 0.8rem; opacity: 0.8;`;

const TabBar = styled.div`display: flex; background: ${colors.tabBg}; border-bottom: 2px solid ${colors.border};`;
const Tab = styled.button`
  padding: 10px 22px; border: none;
  background: ${(p) => (p.active ? "white" : "transparent")};
  color: ${(p) => (p.active ? colors.primary : colors.textMuted)};
  font-weight: ${(p) => (p.active ? 700 : 500)};
  font-size: 0.875rem; cursor: pointer;
  border-bottom: ${(p) => (p.active ? `2px solid ${colors.primary}` : "2px solid transparent")};
  margin-bottom: -2px; transition: all 0.15s;
  &:hover { color: ${colors.primary}; background: ${(p) => (p.active ? "white" : "#f0f9f8")}; }
`;

const Card = styled.div`
  background: ${colors.surface}; border: 1px solid ${colors.border};
  border-radius: 8px; margin-bottom: 16px; overflow: hidden;
`;
const CardHead = styled.div`
  padding: 10px 16px; background: ${colors.tabBg}; border-bottom: 1px solid ${colors.border};
  font-weight: 700; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.5px;
  color: ${colors.primary}; display: flex; align-items: center; gap: 8px;
`;
const CardBody = styled.div`padding: 16px;`;

const SearchBar = styled.div`
  display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap;
  margin-bottom: 16px; padding: 14px 16px;
  background: ${colors.tabBg}; border: 1px solid ${colors.border}; border-radius: 8px;
`;

const PatientGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px; padding: 12px 14px;
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 7px;
`;
const InfoItem = styled.div`display: flex; flex-direction: column; gap: 3px;`;
const InfoLabel = styled.span`
  font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.4px; color: ${colors.textMuted};
`;
const InfoValue = styled.span`font-size: 0.875rem; font-weight: 600; color: ${colors.textMain};`;

/* Items grid: itemName | qty | rate | discount | amount | doctor | ✕ */
const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: 2.2fr 0.6fr 0.9fr 0.8fr 0.9fr 1.3fr auto;
  gap: 8px; align-items: center; padding: 7px 0;
  border-bottom: 1px dashed ${colors.border};
  &:last-child { border-bottom: none; }
`;
const ItemGridHead = styled(ItemGrid)`
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.4px; color: ${colors.textMuted};
  padding: 4px 0 8px; border-bottom: 2px solid ${colors.border};
`;

const TotalsBox = styled.div`
  background: #f8fafc; border: 1px solid ${colors.border}; border-radius: 8px;
  padding: 14px 18px; display: flex; flex-direction: column; gap: 7px;
  max-width: 380px; margin-left: auto;
`;
const TRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  font-size: ${(p) => (p.grand ? "1rem" : "0.875rem")};
  font-weight: ${(p) => (p.grand ? 700 : 500)};
  color: ${(p) => (p.grand ? colors.primary : colors.textMain)};
  ${(p) => p.grand && `border-top: 2px solid ${colors.border}; padding-top: 8px; margin-top: 4px;`}
`;
const Divider = styled.hr`border: none; border-top: 1px solid ${colors.border}; margin: 4px 0;`;

const Badge = styled.span`
  display: inline-flex; align-items: center; padding: 3px 10px;
  border-radius: 20px; font-size: 0.7rem; font-weight: 700;
  background: ${(p) => p.v === "green" ? "#dcfce7" : p.v === "blue" ? "#dbeafe" : p.v === "orange" ? "#ffedd5" : p.v === "red" ? "#fee2e2" : "#f1f5f9"};
  color: ${(p) => p.v === "green" ? "#16a34a" : p.v === "blue" ? "#1d4ed8" : p.v === "orange" ? "#c2410c" : p.v === "red" ? "#dc2626" : colors.textMuted};
`;
const ActionBtn = styled.button`
  padding: 4px 11px; border: none; border-radius: 4px;
  font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
  background: ${(p) => p.danger ? "#fee2e2" : p.success ? "#dcfce7" : colors.tabBg};
  color: ${(p) => p.danger ? "#dc2626" : p.success ? "#16a34a" : colors.primary};
  &:hover { opacity: 0.8; }
`;
const RemoveBtn = styled.button`
  background: none; border: none; color: #dc2626; cursor: pointer;
  font-size: 1rem; padding: 2px 6px; border-radius: 4px; line-height: 1;
  &:hover { background: #fee2e2; }
`;
const ErrText = styled.span`color: #dc2626; font-size: 0.72rem; margin-top: 2px; display: block;`;
const EmptyState = styled.div`
  text-align: center; padding: 40px 20px; color: ${colors.textMuted}; font-size: 0.9rem;
`;
const SmallInput = styled(Input)`padding: 4px 8px; font-size: 0.82rem;`;

const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
`;
const ModalBox = styled.div`
  background: white; border-radius: 10px; width: 97%;
  max-width: 900px; max-height: 93vh; overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
`;
const ModalHead = styled.div`
  padding: 15px 22px; border-bottom: 1px solid ${colors.border};
  display: flex; justify-content: space-between; align-items: center;
  position: sticky; top: 0; background: white; z-index: 10;
`;
const ModalTitle = styled.h3`margin: 0; font-size: 1rem; font-weight: 700; color: ${colors.primary};`;

// ─── Constants ────────────────────────────────────────────────────────────────

const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const EMPTY_FORM = {
  advance_amount: "",
  sales_return: "",
  medicines_amount: "",
  gst_amount: "",
  room_tax: "",
  discount_percent: "",
  discount_amount: "",
  disc_reason: "",
  remarks: "",
};

const fmt = (v) => `₹ ${(parseFloat(v) || 0).toFixed(2)}`;

// ─── Component ────────────────────────────────────────────────────────────────

const DischargeBilling = () => {
  const [activeTab, setActiveTab] = useState("create");

  // Search state
  const [searchMode, setSearchMode] = useState("uhid"); // "uhid" | "ipNumber"
  const [searchValue, setSearchValue] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Patient/Admission record from search_discharge_patient
  const [patientRecord, setPatientRecord] = useState(null);

  // Investigation billing items (from hospital_investbilling, is_active:true)
  const [availableItems, setAvailableItems] = useState([]);

  // Items JSONField array – matches exact model structure
  // { investigation_id, itemName, category, quantity, rate, discount, amount, doctor, doctor_fee, item_description }
  const [selectedItems, setSelectedItems] = useState([]);

  // Financial form fields
  const [form, setForm] = useState(EMPTY_FORM);

  // Lists
  const [estimates, setEstimates] = useState([]);
  const [bills, setBills] = useState([]);

  // Estimate view modal
  const [viewEstimate, setViewEstimate] = useState(null);
  const [convertLoading, setConvertLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Toast ──────────────────────────────────────────────────────────────────

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch lists ────────────────────────────────────────────────────────────

  const fetchEstimates = useCallback(async () => {
    try {
      const res = await apiRequest(`${baseUrl}discharge-billing/?status=Estimate`, "GET");
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setEstimates(list);
    } catch { showToast("Failed to fetch estimates", "error"); }
  }, []);

  const fetchBills = useCallback(async () => {
    try {
      const res = await apiRequest(`${baseUrl}discharge-billing/?status=Billed`, "GET");
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setBills(list);
    } catch { showToast("Failed to fetch bills", "error"); }
  }, []);

  useEffect(() => { fetchEstimates(); fetchBills(); }, [fetchEstimates, fetchBills]);

  // ── Fetch investigation items ──────────────────────────────────────────────

  const fetchInvestItems = async () => {
    try {
      const res = await apiRequest(`${baseUrl}hospital-investbilling/?is_active=true`, "GET");
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setAvailableItems(list);
    } catch { showToast("Failed to load investigation items", "error"); }
  };

  // ── Patient Search  ────────────────────────────────────────────────────────
  // Uses: /search-discharge-patient/?uhid=... or ?ipNumber=...

  const handleSearch = async () => {
    if (!searchValue.trim()) { setSearchError("Please enter a value"); return; }
    setSearchError("");
    setSearchLoading(true);
    setPatientRecord(null);
    setSelectedItems([]);
    setForm(EMPTY_FORM);

    try {
      const param = searchMode === "uhid"
        ? `uhid=${encodeURIComponent(searchValue.trim())}`
        : `ipNumber=${encodeURIComponent(searchValue.trim())}`;

      const res = await apiRequest(`${baseUrl}search-discharge-patient/?${param}`, "GET");
      const results = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);

      if (!results.length) { setSearchError("No patient / admission record found"); return; }

      // First result — admission takes priority (already sorted by backend)
      setPatientRecord(results[0]);
      await fetchInvestItems();
    } catch { setSearchError("Error searching patient"); }
    finally { setSearchLoading(false); }
  };

  // ── Derived patient display fields ─────────────────────────────────────────
  // Handle both Admission and Patient mongo docs

  const p = patientRecord || {};
  const patientName     = p.patientName || p.patient_name || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "—";
  const patientUhid     = p.uhid || "";
  const patientIpNumber = p.ipNumber || p.ip_number || "";
  const patientAge      = p.age || p.patient_age || "—";
  const patientGender   = p.gender || "—";
  const patientMobile   = p.mobilePhone || p.mobile || "—";
  const patientDept     = p.department || p.dept || "—";
  const patientDoctor   = p.doctorName || p.doctor_name || p.consultant || "—";
  const patientWard     = p.ward || p.wardName || "—";

  // ── Item Management ────────────────────────────────────────────────────────

  const addItem = (rawItem) => {
    const id = rawItem._id || rawItem.id || rawItem.investigation_id || String(Math.random());
    if (selectedItems.find((i) => i.investigation_id === id)) {
      showToast("Item already added", "error"); return;
    }
    const rate = parseFloat(rawItem.rate || rawItem.unit_price || 0);
    setSelectedItems((prev) => [
      ...prev,
      {
        investigation_id: id,
        itemName: rawItem.itemName || rawItem.investigation_name || rawItem.name || "",
        category: rawItem.category || "",
        quantity: 1,
        rate,
        discount: 0,
        amount: rate,
        doctor: patientDoctor !== "—" ? patientDoctor : "",
        doctor_fee: 0,
        item_description: rawItem.item_description || rawItem.description || "",
      },
    ]);
  };

  const removeItem = (id) =>
    setSelectedItems((prev) => prev.filter((i) => i.investigation_id !== id));

  const updateItem = (id, field, value) => {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.investigation_id !== id) return item;
        const updated = { ...item, [field]: value };
        if (["quantity", "rate", "discount"].includes(field)) {
          const qty  = parseFloat(field === "quantity" ? value : updated.quantity) || 0;
          const rate = parseFloat(field === "rate"     ? value : updated.rate)     || 0;
          const disc = parseFloat(field === "discount" ? value : updated.discount) || 0;
          updated.amount = Math.max(0, qty * rate - disc);
        }
        return updated;
      })
    );
  };

  // ── Calculations ───────────────────────────────────────────────────────────

  const totalAmount     = selectedItems.reduce((acc, i) => acc + (parseFloat(i.amount) || 0), 0);
  const itemDisc        = selectedItems.reduce((acc, i) => acc + (parseFloat(i.discount) || 0), 0);
  const advanceAmount   = parseFloat(form.advance_amount)   || 0;
  const salesReturn     = parseFloat(form.sales_return)     || 0;
  const medicinesAmt    = parseFloat(form.medicines_amount) || 0;
  const gstAmount       = parseFloat(form.gst_amount)       || 0;
  const roomTax         = parseFloat(form.room_tax)         || 0;
  const discAmt         = parseFloat(form.discount_amount)  ||
                          (totalAmount * (parseFloat(form.discount_percent) || 0)) / 100;
  const totalDisc       = discAmt + itemDisc;
  const netAmount       = Math.max(
    0,
    totalAmount + gstAmount + roomTax + medicinesAmt - advanceAmount - salesReturn - totalDisc
  );

  // ── Build POST payload ─────────────────────────────────────────────────────

  const buildPayload = (billStatus) => ({
    status:           billStatus,
    uhid:             patientUhid  || null,
    ip_number:        patientIpNumber || null,
    items:            selectedItems,
    total_amount:     totalAmount,
    advance_amount:   advanceAmount,
    sales_return:     salesReturn,
    medicines_amount: medicinesAmt,
    taxable_amount:   0,
    non_tax_amount:   0,
    gst_amount:       gstAmount,
    room_tax:         roomTax,
    discount_percent: parseFloat(form.discount_percent) || 0,
    discount_amount:  discAmt,
    disc_reason:      form.disc_reason,
    item_disc:        itemDisc,
    total_disc:       totalDisc,
    net_amount:       netAmount,
    remarks:          form.remarks,
  });

  // ── Save handlers ──────────────────────────────────────────────────────────

  const handleSaveEstimate = async () => {
    if (!patientRecord)       { showToast("Search and select a patient first", "error"); return; }
    if (!selectedItems.length){ showToast("Add at least one item", "error"); return; }
    setLoading(true);
    try {
      const res  = await apiRequest(`${baseUrl}discharge-billing/`, "POST", buildPayload("Estimate"));
      const data = res?.id ? res : res?.data;
      if (data?.id || data?.estimate_number) {
        showToast(`Estimate saved — ${data.estimate_number || ""}`);
        resetForm(); fetchEstimates(); setActiveTab("estimates");
      } else { showToast(JSON.stringify(res?.data || res), "error"); }
    } catch { showToast("Network error", "error"); }
    finally { setLoading(false); }
  };

  const handleSaveBill = async () => {
    if (!patientRecord)       { showToast("Search and select a patient first", "error"); return; }
    if (!selectedItems.length){ showToast("Add at least one item", "error"); return; }
    setLoading(true);
    try {
      const res  = await apiRequest(`${baseUrl}discharge-billing/`, "POST", buildPayload("Billed"));
      const data = res?.id ? res : res?.data;
      if (data?.id || data?.bill_no) {
        showToast(`Bill saved — ${data.bill_no || ""}`);
        resetForm(); fetchBills(); setActiveTab("bills");
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

  const resetForm = () => {
    setPatientRecord(null); setAvailableItems([]); setSelectedItems([]);
    setForm(EMPTY_FORM); setSearchValue(""); setSearchError("");
  };

  const fc = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // ─── Render ────────────────────────────────────────────────────────────────

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
        <PageHeader>
          <div>
            <PageTitle>🏥 Discharge Billing</PageTitle>
            <PageSubtitle>Manage investigation billing on patient discharge</PageSubtitle>
          </div>
        </PageHeader>

        <TabBar>
          <Tab active={activeTab === "create"} onClick={() => setActiveTab("create")}>
            ➕ Create Bill / Estimate
          </Tab>
          <Tab active={activeTab === "estimates"} onClick={() => { setActiveTab("estimates"); fetchEstimates(); }}>
            📋 Estimates ({estimates.length})
          </Tab>
          <Tab active={activeTab === "bills"} onClick={() => { setActiveTab("bills"); fetchBills(); }}>
            🧾 Bills ({bills.length})
          </Tab>
        </TabBar>

        {/* ══ CREATE TAB ══════════════════════════════════════════════════════ */}
        {activeTab === "create" && (
          <FormContent>
            {/* Patient Search */}
            <Card style={{ marginTop: 18 }}>
              <CardHead>🔍 Patient Search</CardHead>
              <CardBody>
                <SearchBar>
                  <InputWrapper style={{ minWidth: 190 }}>
                    <Label>Search By</Label>
                    <Select value={searchMode} onChange={(e) => {
                      setSearchMode(e.target.value); setSearchError(""); setPatientRecord(null);
                    }}>
                      <option value="uhid">UHID (OP Patient)</option>
                      <option value="ipNumber">IP Number (IP Patient)</option>
                    </Select>
                  </InputWrapper>
                  <InputWrapper style={{ minWidth: 220 }}>
                    <Label>{searchMode === "uhid" ? "UHID" : "IP Number"}</Label>
                    <Input
                      value={searchValue}
                      onChange={(e) => { setSearchValue(e.target.value); setSearchError(""); }}
                      placeholder={searchMode === "uhid" ? "Enter UHID…" : "Enter IP Number…"}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      style={searchError ? { borderColor: "#dc2626" } : {}}
                    />
                    {searchError && <ErrText>{searchError}</ErrText>}
                  </InputWrapper>
                  <Button onClick={handleSearch} disabled={searchLoading} style={{ alignSelf: "flex-end" }}>
                    {searchLoading ? "Searching…" : "🔍 Search"}
                  </Button>
                  {patientRecord && (
                    <Button secondary onClick={resetForm} style={{ alignSelf: "flex-end" }}>✕ Clear</Button>
                  )}
                </SearchBar>

                {patientRecord && (
                  <PatientGrid>
                    <InfoItem><InfoLabel>Patient Name</InfoLabel><InfoValue>{patientName}</InfoValue></InfoItem>
                    <InfoItem><InfoLabel>UHID</InfoLabel><InfoValue>{patientUhid || "—"}</InfoValue></InfoItem>
                    <InfoItem><InfoLabel>IP Number</InfoLabel><InfoValue>{patientIpNumber || "—"}</InfoValue></InfoItem>
                    <InfoItem><InfoLabel>Age / Gender</InfoLabel><InfoValue>{patientAge} / {patientGender}</InfoValue></InfoItem>
                    <InfoItem><InfoLabel>Mobile</InfoLabel><InfoValue>{patientMobile}</InfoValue></InfoItem>
                    <InfoItem><InfoLabel>Department</InfoLabel><InfoValue>{patientDept}</InfoValue></InfoItem>
                    <InfoItem><InfoLabel>Doctor</InfoLabel><InfoValue>{patientDoctor}</InfoValue></InfoItem>
                    <InfoItem><InfoLabel>Ward</InfoLabel><InfoValue>{patientWard}</InfoValue></InfoItem>
                  </PatientGrid>
                )}
              </CardBody>
            </Card>

            {/* Items */}
            {patientRecord && (
              <>
                <Card>
                  <CardHead>🧪 Investigation Billing Items</CardHead>
                  <CardBody>
                    <div style={{ marginBottom: 14 }}>
                      <Label style={{ marginBottom: 6, display: "block" }}>Add Investigation Item</Label>
                      <Select
                        style={{ minWidth: 300 }}
                        defaultValue=""
                        onChange={(e) => {
                          const item = availableItems.find(
                            (i) => String(i._id || i.id) === e.target.value
                          );
                          if (item) addItem(item);
                          e.target.value = "";
                        }}
                      >
                        <option value="">-- Select investigation to add --</option>
                        {availableItems
                          .filter((ai) =>
                            !selectedItems.find(
                              (si) => si.investigation_id === String(ai._id || ai.id)
                            )
                          )
                          .map((item) => (
                            <option key={item._id || item.id} value={item._id || item.id}>
                              {item.itemName || item.investigation_name || item.name} — ₹{item.rate || 0}
                            </option>
                          ))}
                      </Select>
                    </div>

                    {selectedItems.length > 0 ? (
                      <>
                        <ItemGridHead>
                          <span>Item Name</span>
                          <span>Qty</span>
                          <span>Rate (₹)</span>
                          <span>Disc (₹)</span>
                          <span>Amount (₹)</span>
                          <span>Doctor</span>
                          <span></span>
                        </ItemGridHead>
                        {selectedItems.map((item) => (
                          <ItemGrid key={item.investigation_id}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.itemName}</div>
                              {item.category && (
                                <div style={{ fontSize: "0.72rem", color: colors.textMuted }}>{item.category}</div>
                              )}
                            </div>
                            <SmallInput
                              type="number" min={1} value={item.quantity}
                              onChange={(e) => updateItem(item.investigation_id, "quantity", Number(e.target.value) || 1)}
                            />
                            <SmallInput
                              type="number" min={0} value={item.rate}
                              onChange={(e) => updateItem(item.investigation_id, "rate", Number(e.target.value) || 0)}
                            />
                            <SmallInput
                              type="number" min={0} value={item.discount}
                              onChange={(e) => updateItem(item.investigation_id, "discount", Number(e.target.value) || 0)}
                            />
                            <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>
                              ₹ {(parseFloat(item.amount) || 0).toFixed(2)}
                            </span>
                            <SmallInput
                              value={item.doctor}
                              onChange={(e) => updateItem(item.investigation_id, "doctor", e.target.value)}
                              placeholder="Doctor name"
                            />
                            <RemoveBtn onClick={() => removeItem(item.investigation_id)}>✕</RemoveBtn>
                          </ItemGrid>
                        ))}
                      </>
                    ) : (
                      <EmptyState>No items added. Use the dropdown above to add investigations.</EmptyState>
                    )}
                  </CardBody>
                </Card>

                {/* Financial Summary */}
                <Card>
                  <CardHead>💰 Financial Summary</CardHead>
                  <CardBody>
                    <FormRow>
                      <InputWrapper>
                        <Label>Advance Amount (₹)</Label>
                        <Input type="number" min={0} value={form.advance_amount}
                          onChange={(e) => fc("advance_amount", e.target.value)} placeholder="0" />
                      </InputWrapper>
                      <InputWrapper>
                        <Label>Sales Return (₹)</Label>
                        <Input type="number" min={0} value={form.sales_return}
                          onChange={(e) => fc("sales_return", e.target.value)} placeholder="0" />
                      </InputWrapper>
                      <InputWrapper>
                        <Label>Medicines Amount (₹)</Label>
                        <Input type="number" min={0} value={form.medicines_amount}
                          onChange={(e) => fc("medicines_amount", e.target.value)} placeholder="0" />
                      </InputWrapper>
                      <InputWrapper>
                        <Label>GST Amount (₹)</Label>
                        <Input type="number" min={0} value={form.gst_amount}
                          onChange={(e) => fc("gst_amount", e.target.value)} placeholder="0" />
                      </InputWrapper>
                      <InputWrapper>
                        <Label>Room Tax (₹)</Label>
                        <Input type="number" min={0} value={form.room_tax}
                          onChange={(e) => fc("room_tax", e.target.value)} placeholder="0" />
                      </InputWrapper>
                      <InputWrapper>
                        <Label>Discount %</Label>
                        <Input type="number" min={0} max={100} value={form.discount_percent}
                          onChange={(e) => fc("discount_percent", e.target.value)} placeholder="0" />
                      </InputWrapper>
                      <InputWrapper>
                        <Label>Discount Amount (₹)</Label>
                        <Input type="number" min={0} value={form.discount_amount}
                          onChange={(e) => fc("discount_amount", e.target.value)} placeholder="0" />
                      </InputWrapper>
                      <InputWrapper>
                        <Label>Discount Reason</Label>
                        <Input value={form.disc_reason}
                          onChange={(e) => fc("disc_reason", e.target.value)} placeholder="Optional" />
                      </InputWrapper>
                      <InputWrapper style={{ gridColumn: "span 2" }}>
                        <Label>Remarks</Label>
                        <Input value={form.remarks}
                          onChange={(e) => fc("remarks", e.target.value)} placeholder="Optional remarks…" />
                      </InputWrapper>
                    </FormRow>

                    <TotalsBox>
                      <TRow><span>Total Amount</span><span>{fmt(totalAmount)}</span></TRow>
                      <TRow><span>Item Discount</span><span style={{ color: "#dc2626" }}>- {fmt(itemDisc)}</span></TRow>
                      <TRow><span>Bill Discount</span><span style={{ color: "#dc2626" }}>- {fmt(discAmt)}</span></TRow>
                      <TRow><span>Advance</span><span style={{ color: "#dc2626" }}>- {fmt(advanceAmount)}</span></TRow>
                      <TRow><span>Sales Return</span><span style={{ color: "#dc2626" }}>- {fmt(salesReturn)}</span></TRow>
                      <TRow><span>Medicines</span><span style={{ color: "#2563eb" }}>+ {fmt(medicinesAmt)}</span></TRow>
                      <TRow><span>GST</span><span style={{ color: "#2563eb" }}>+ {fmt(gstAmount)}</span></TRow>
                      <TRow><span>Room Tax</span><span style={{ color: "#2563eb" }}>+ {fmt(roomTax)}</span></TRow>
                      <Divider />
                      <TRow grand><span>Net Amount</span><span>{fmt(netAmount)}</span></TRow>
                    </TotalsBox>

                    <ButtonContainer style={{ marginTop: 18 }}>
                      <Button secondary onClick={resetForm}>✕ Cancel</Button>
                      <Button
                        style={{ background: "#f59e0b", border: "none", color: "white" }}
                        onClick={handleSaveEstimate} disabled={loading}
                      >
                        {loading ? "Saving…" : "💾 Save as Estimate"}
                      </Button>
                      <Button onClick={handleSaveBill} disabled={loading}>
                        {loading ? "Saving…" : "🧾 Save as Bill"}
                      </Button>
                    </ButtonContainer>
                  </CardBody>
                </Card>
              </>
            )}
          </FormContent>
        )}

        {/* ══ ESTIMATES TAB ═══════════════════════════════════════════════════ */}
        {activeTab === "estimates" && (
          <FormContent style={{ marginTop: 18 }}>
            <Card>
              <CardHead>📋 All Estimates</CardHead>
              <CardBody>
                <TableWrapper>
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
                              <Td style={{ fontSize: "0.82rem" }}>{est.uhid || est.ip_number || "—"}</Td>
                              <Td style={{ fontWeight: 600 }}>{pd.patient_name || "—"}</Td>
                              <Td>{fmt(est.total_amount)}</Td>
                              <Td style={{ color: "#dc2626" }}>- {fmt(est.total_disc)}</Td>
                              <Td style={{ fontWeight: 700 }}>{fmt(est.net_amount)}</Td>
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
                </TableWrapper>
              </CardBody>
            </Card>
          </FormContent>
        )}

        {/* ══ BILLS TAB ═══════════════════════════════════════════════════════ */}
        {activeTab === "bills" && (
          <FormContent style={{ marginTop: 18 }}>
            <Card>
              <CardHead>🧾 All Bills</CardHead>
              <CardBody>
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <Th>#</Th>
                        <Th>Bill No.</Th>
                        <Th>UHID / IP No.</Th>
                        <Th>Patient</Th>
                        <Th>Total Amt</Th>
                        <Th>Advance</Th>
                        <Th>Total Disc</Th>
                        <Th>GST</Th>
                        <Th>Net Amt</Th>
                        <Th>Bill Date</Th>
                        <Th>Remarks</Th>
                        <Th>Status</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.length === 0 ? (
                        <tr><td colSpan={12}><EmptyState>No bills found.</EmptyState></td></tr>
                      ) : (
                        bills.map((bill, idx) => {
                          const pd = bill.patient_details || {};
                          return (
                            <Tr key={bill.id}>
                              <Td>{idx + 1}</Td>
                              <Td style={{ fontWeight: 700, fontFamily: "monospace", fontSize: "0.8rem" }}>
                                {bill.bill_no}
                              </Td>
                              <Td style={{ fontSize: "0.82rem" }}>{bill.uhid || bill.ip_number || "—"}</Td>
                              <Td style={{ fontWeight: 600 }}>{pd.patient_name || "—"}</Td>
                              <Td>{fmt(bill.total_amount)}</Td>
                              <Td style={{ color: "#dc2626" }}>- {fmt(bill.advance_amount)}</Td>
                              <Td style={{ color: "#dc2626" }}>- {fmt(bill.total_disc)}</Td>
                              <Td style={{ color: "#2563eb" }}>+ {fmt(bill.gst_amount)}</Td>
                              <Td style={{ fontWeight: 700 }}>{fmt(bill.net_amount)}</Td>
                              <Td style={{ fontSize: "0.8rem" }}>
                                {bill.bill_date ? new Date(bill.bill_date).toLocaleDateString("en-IN") : "—"}
                              </Td>
                              <Td style={{ fontSize: "0.8rem", color: colors.textMuted }}>{bill.remarks || "—"}</Td>
                              <Td><Badge v="green">Billed</Badge></Td>
                            </Tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                </TableWrapper>
              </CardBody>
            </Card>
          </FormContent>
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

            <div style={{ padding: "20px 22px" }}>
              {/* Patient info */}
              <CardHead style={{ marginBottom: 10, borderRadius: 6 }}>🏥 Patient Info</CardHead>
              {(() => {
                const pd = viewEstimate.patient_details || {};
                return (
                  <PatientGrid style={{ marginBottom: 16 }}>
                    <InfoItem><InfoLabel>Patient</InfoLabel><InfoValue>{pd.patient_name || "—"}</InfoValue></InfoItem>
                    <InfoItem><InfoLabel>UHID</InfoLabel><InfoValue>{viewEstimate.uhid || "—"}</InfoValue></InfoItem>
                    <InfoItem><InfoLabel>IP Number</InfoLabel><InfoValue>{viewEstimate.ip_number || "—"}</InfoValue></InfoItem>
                    <InfoItem><InfoLabel>Age</InfoLabel><InfoValue>{pd.age || "—"}</InfoValue></InfoItem>
                    <InfoItem><InfoLabel>Gender</InfoLabel><InfoValue>{pd.gender || "—"}</InfoValue></InfoItem>
                    <InfoItem><InfoLabel>Mobile</InfoLabel><InfoValue>{pd.mobile || "—"}</InfoValue></InfoItem>
                    <InfoItem><InfoLabel>Bill Date</InfoLabel>
                      <InfoValue>{viewEstimate.bill_date ? new Date(viewEstimate.bill_date).toLocaleDateString("en-IN") : "—"}</InfoValue>
                    </InfoItem>
                  </PatientGrid>
                );
              })()}

              {/* Items */}
              <CardHead style={{ marginBottom: 8, borderRadius: 6 }}>🧪 Investigation Items</CardHead>
              <ItemGridHead>
                <span>Item Name</span><span>Qty</span><span>Rate</span>
                <span>Disc</span><span>Amount</span><span>Doctor</span><span></span>
              </ItemGridHead>
              {(viewEstimate.items || []).map((item, i) => (
                <ItemGrid key={i}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.itemName}</div>
                    {item.category && <div style={{ fontSize: "0.72rem", color: colors.textMuted }}>{item.category}</div>}
                  </div>
                  <span>{item.quantity}</span>
                  <span>₹ {(parseFloat(item.rate) || 0).toFixed(2)}</span>
                  <span style={{ color: "#dc2626" }}>- ₹ {(parseFloat(item.discount) || 0).toFixed(2)}</span>
                  <span style={{ fontWeight: 700 }}>₹ {(parseFloat(item.amount) || 0).toFixed(2)}</span>
                  <span style={{ fontSize: "0.82rem" }}>{item.doctor || "—"}</span>
                  <span></span>
                </ItemGrid>
              ))}

              {/* Totals */}
              <TotalsBox style={{ marginTop: 16 }}>
                <TRow><span>Total Amount</span><span>{fmt(viewEstimate.total_amount)}</span></TRow>
                <TRow><span>Item Discount</span><span style={{ color: "#dc2626" }}>- {fmt(viewEstimate.item_disc)}</span></TRow>
                <TRow><span>Bill Discount</span><span style={{ color: "#dc2626" }}>- {fmt(viewEstimate.discount_amount)}</span></TRow>
                <TRow><span>Advance</span><span style={{ color: "#dc2626" }}>- {fmt(viewEstimate.advance_amount)}</span></TRow>
                <TRow><span>Sales Return</span><span style={{ color: "#dc2626" }}>- {fmt(viewEstimate.sales_return)}</span></TRow>
                <TRow><span>Medicines</span><span style={{ color: "#2563eb" }}>+ {fmt(viewEstimate.medicines_amount)}</span></TRow>
                <TRow><span>GST</span><span style={{ color: "#2563eb" }}>+ {fmt(viewEstimate.gst_amount)}</span></TRow>
                <TRow><span>Room Tax</span><span style={{ color: "#2563eb" }}>+ {fmt(viewEstimate.room_tax)}</span></TRow>
                <Divider />
                <TRow grand><span>Net Amount</span><span>{fmt(viewEstimate.net_amount)}</span></TRow>
              </TotalsBox>

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