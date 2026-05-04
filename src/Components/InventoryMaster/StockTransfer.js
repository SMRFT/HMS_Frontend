import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container,
  PageWrapper,
  FormRow,
  InputWrapper,
  Label,
  Input,
  Button,
  ButtonContainer,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
} from "../GlobalStyles";
import styled, { keyframes, css } from "styled-components";

// ─── Animations ───────────────────────────────────────────────────────────────
const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-12px); max-height: 0; }
  to   { opacity: 1; transform: translateY(0);    max-height: 2000px; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const PageHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 18px 24px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
`;

const PageSubtitle = styled.p`
  margin: 3px 0 0;
  font-size: 0.8rem;
  opacity: 0.8;
`;

const NewTransferBtn = styled.button`
  background: #f97316;
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #ea6c0a; }
`;

const SectionTitle = styled.h4`
  color: #0d9488;
  margin: 0 0 16px;
  font-size: 0.95rem;
  font-weight: 700;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ status }) =>
    status === "Approved" ? "#0d9488" : status === "Pending" ? "#f59e0b" : "#6b7280"};
  color: white;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
`;

const FilterLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
`;

const FilterSelect = styled.select`
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #374151;
  outline: none;
  background: white;
  &:focus { border-color: #0d9488; }
`;

const FilterInput = styled.input`
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #374151;
  outline: none;
  &:focus { border-color: #0d9488; }
`;

const SearchBtn = styled.button`
  background: #0d9488;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  height: 34px;
  align-self: flex-end;
  &:hover { background: #0f766e; }
`;

// ── Inline Form Panel (replaces modal) ────────────────────────────────────────
const FormPanel = styled.div`
  animation: ${slideDown} 0.3s ease forwards;
  overflow: hidden;
  border-bottom: 2px solid #d1fae5;
  background: #f8fffe;
`;

const FormPanelHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FormPanelClose = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  opacity: 0.85;
  &:hover { opacity: 1; }
`;

const FormPanelBody = styled.div`
  padding: 20px 24px;
`;

// ── Search Dropdown ───────────────────────────────────────────────────────────
const RelativeWrapper = styled.div`
  position: relative;
`;

const SearchDropdown = styled.div`
  position: absolute;
  z-index: 999;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  top: calc(100% + 2px);
  left: 0;
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  color: #374151;
  &:hover { background: #f0fdfa; color: #0d9488; }
`;

// ── Added Items Table ─────────────────────────────────────────────────────────
const AddedItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
`;

const ATh = styled.th`
  background: #f0fdfa;
  color: #0f766e;
  padding: 8px 10px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #d1fae5;
`;

const ATd = styled.td`
  padding: 7px 10px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
`;

const RemoveBtn = styled.button`
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #fca5a5; }
`;

// ── Batch Select ──────────────────────────────────────────────────────────────
const BatchSelect = styled.select`
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #374151;
  width: 100%;
  outline: none;
  background: white;
  &:focus { border-color: #0d9488; }
`;

// ── Action Menu ───────────────────────────────────────────────────────────────
const ActionMenuWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const ActionMenuBtn = styled.button`
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 1rem;
  color: #6b7280;
  &:hover { background: #f3f4f6; }
`;

const ActionMenu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 100;
  min-width: 130px;
`;

const ActionMenuItem = styled.div`
  padding: 8px 14px;
  font-size: 0.82rem;
  color: #374151;
  cursor: pointer;
  &:hover { background: #f0fdfa; color: #0d9488; }
`;

const ReadonlyInput = styled(Input)`
  background: #e5e7eb !important;
  cursor: not-allowed;
`;

const StockInfoNote = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 4px;
`;

// ─── Print Styles ─────────────────────────────────────────────────────────────
const PRINT_STYLES = `
  @media print {
    body * { visibility: hidden !important; }
    #stock-transfer-slip, #stock-transfer-slip * { visibility: visible !important; }
    #stock-transfer-slip {
      position: fixed; left: 0; top: 0; width: 100%;
      font-family: monospace; font-size: 12px; padding: 10px;
    }
  }
`;

// ─── Financial Year Helper ────────────────────────────────────────────────────
function getCurrentFinYear() {
  const today = new Date();
  const fromYr = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  return `${String(fromYr).slice(-2)}${String(fromYr + 1).slice(-2)}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const StockTransfer = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── State ──────────────────────────────────────────────────────────────────
  const [outlets, setOutlets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [fromOutlet, setFromOutlet] = useState("");
  const [toOutlet, setToOutlet] = useState("");
  const [transferRefNumber, setTransferRefNumber] = useState("");
  const [addedItems, setAddedItems] = useState([]);

  // Medicine search
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineResults, setMedicineResults] = useState([]);
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Batch/stock state — supports multiple batches
  const [availableBatches, setAvailableBatches] = useState([]); // [{stock_id, batch_number, hsn_code, available_qty, outlet_code}]
  const [selectedBatchIdx, setSelectedBatchIdx] = useState("");  // index into availableBatches
  const [transferQty, setTransferQty] = useState("");

  // Filter state
  const [filterFromOutlet, setFilterFromOutlet] = useState("All");
  const [filterToOutlet, setFilterToOutlet] = useState("All");
  const [filterFromDate, setFilterFromDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-04-01`;
  });
  const [filterToDate, setFilterToDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Action menu / print
  const [openMenuId, setOpenMenuId] = useState(null);
  const [printSlip, setPrintSlip] = useState(null);

  const medicineSearchRef = useRef(null);

  // ── Derived selected batch ─────────────────────────────────────────────────
  const selectedBatch = selectedBatchIdx !== "" ? availableBatches[selectedBatchIdx] : null;

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOutlets();
    fetchTransfers();
    injectPrintStyles();
  }, []);

  useEffect(() => {
    if (showForm) generateRefNumber();
  }, [showForm]);

  useEffect(() => {
    const handler = (e) => {
      if (medicineSearchRef.current && !medicineSearchRef.current.contains(e.target)) {
        setShowMedDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function injectPrintStyles() {
    if (!document.getElementById("stock-transfer-print-style")) {
      const style = document.createElement("style");
      style.id = "stock-transfer-print-style";
      style.innerHTML = PRINT_STYLES;
      document.head.appendChild(style);
    }
  }

  // ── Auth headers helper ────────────────────────────────────────────────────
  // apiRequest should handle auth headers; we read them from response if needed.
  // But for outlet filtering in PharmacyStock, we need hospital/branch from context.
  // These are typically injected by apiRequest interceptors automatically.

  // ── API Calls ──────────────────────────────────────────────────────────────

  // Requirement 1: fetch outlets via get_active_outlets (same pattern as fetchOutlets in GRN)
  const fetchOutlets = useCallback(async () => {
    try {
      const r = await apiRequest(`${HmsBaseUrl}get_active_outlets/`, "GET");
      if (r?.success && Array.isArray(r?.data?.data)) {
        setOutlets([...r.data.data]);
      } else if (r && !r.error && Array.isArray(r.data)) {
        // fallback for different response shape
        setOutlets(r.data);
      } else {
        setOutlets([]);
      }
    } catch {
      toast.error("Failed to fetch outlets");
      setOutlets([]);
    }
  }, [HmsBaseUrl]);

  const fetchTransfers = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.from_outlet && filters.from_outlet !== "All")
        params.append("from_outlet", filters.from_outlet);
      if (filters.to_outlet && filters.to_outlet !== "All")
        params.append("to_outlet", filters.to_outlet);
      if (filters.from_date) params.append("from_date", filters.from_date);
      if (filters.to_date) params.append("to_date", filters.to_date);

      const url = `${HmsBaseUrl}stock-transfer/${params.toString() ? "?" + params.toString() : ""}`;
      const response = await apiRequest(url, "GET");
      if (response && !response.error && Array.isArray(response.data)) {
        setTransfers(response.data);
      } else {
        setTransfers([]);
      }
    } catch {
      toast.error("Failed to fetch transfers");
    }
  };

  const generateRefNumber = async () => {
    try {
      const finYear = getCurrentFinYear();
      const prefix = `${finYear}/`;
      const response = await apiRequest(
        `${HmsBaseUrl}stock-transfer/?ref_prefix=${finYear}`,
        "GET"
      );
      let maxSeq = 0;
      if (response && !response.error && Array.isArray(response.data)) {
        response.data.forEach((t) => {
          if (t.transfer_ref_number && t.transfer_ref_number.startsWith(prefix)) {
            const seq = parseInt(t.transfer_ref_number.split("/")[1] || "0", 10);
            if (seq > maxSeq) maxSeq = seq;
          }
        });
      }
      setTransferRefNumber(`${finYear}/${String(maxSeq + 1).padStart(6, "0")}`);
    } catch {
      const finYear = getCurrentFinYear();
      setTransferRefNumber(`${finYear}/000001`);
    }
  };

  // Search medicines from PharmacyStock scoped to selected fromOutlet
  // GET pharmacy-stock/?search=<name>&outlet_code=<code>
  // Backend enriches each row with item_name from PharmacyItem
  const searchMedicines = async (query) => {
    if (!query || query.length < 2) {
      setMedicineResults([]);
      setShowMedDropdown(false);
      return;
    }

    const selectedOutlet = outlets.find(
      (o) => o.outlet_name === fromOutlet || o.outlet_code === fromOutlet
    );
    const outletCode = selectedOutlet?.outlet_code || "";

    if (!outletCode) {
      toast.warning("Please select a From Outlet first");
      return;
    }

    try {
        const params = new URLSearchParams({ search: query });

        const response = await apiRequest(
        `${HmsBaseUrl}pharmacy-stock/?${params.toString()}`,
        "GET"
        );

      // Deduplicate by item_id so each medicine appears once in the dropdown
      const raw = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
      const seen = new Set();
      const unique = raw.filter((s) => {
        if (seen.has(s.item_id)) return false;
        seen.add(s.item_id);
        return true;
      });
      setMedicineResults(unique);
      setShowMedDropdown(unique.length > 0);
    } catch {
      setMedicineResults([]);
    }
  };

  // Requirement 5: Fetch all batches for the selected item from PharmacyStock
  // Pass outlet_code directly to backend so only source-outlet stock is returned
const fetchBatchesForItem = async (itemId) => {
    try {
      const selectedOutlet = outlets.find(
        (o) => o.outlet_name === fromOutlet || o.outlet_code === fromOutlet
      );
      const outletCode = selectedOutlet?.outlet_code || "";

      const params = new URLSearchParams({ item_id: itemId });
      if (outletCode) params.append("outlet_code", outletCode);

      const response = await apiRequest(
        `${HmsBaseUrl}pharmacy-stock/?${params.toString()}`,
        "GET"
      );

      // pharmacy_stock_view returns a plain array, not {data: [...]}
      let stocks = [];
      if (Array.isArray(response)) {
        stocks = response;                          // ← fix: handle plain array
      } else if (response && Array.isArray(response.data)) {
        stocks = response.data;
      }

    const batches = stocks.map((s) => ({
        stock_id: s.stock_id,
        batch_number: s.batch_number || "-",
        hsn_code: s.hsn_code || "",
        outlet_code: s.outlet_code || "",
        mrp: s.mrp || 0,
        total_stock: Number(s.total_stock || 0),
        sold_quantity: Number(s.sold_quantity || 0),
        transferred_out: Number(s.transferred_out_quantity || 0),
        available_qty:
            Number(s.total_stock || 0)
            - Number(s.sold_quantity || 0)
            - Number(s.transferred_out_quantity || 0)
            - Number(s.grn_return_quantity || 0)
            - Number(s.blocked_quantity || 0)
            + Number(s.sales_return_quantity || 0),
    }));

      setAvailableBatches(batches);
      setSelectedBatchIdx(batches.length === 1 ? 0 : "");
    } catch {
      setAvailableBatches([]);
      setSelectedBatchIdx("");
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleMedicineSearch = (e) => {
    const val = e.target.value;
    setMedicineSearch(val);
    setSelectedMedicine(null);
    setAvailableBatches([]);
    setSelectedBatchIdx("");
    searchMedicines(val);
  };

  const handleSelectMedicine = (med) => {
    setSelectedMedicine(med);
    setMedicineSearch(med.item_name);
    setShowMedDropdown(false);
    fetchBatchesForItem(med.item_id);
  };

  const handleBatchChange = (e) => {
    const idx = e.target.value;
    setSelectedBatchIdx(idx === "" ? "" : Number(idx));
  };

  // Requirement 5 & 6: Add item to list
  const handleAddItem = () => {
    if (!selectedMedicine) {
      toast.error("Please select a medicine");
      return;
    }
    if (selectedBatchIdx === "" || !selectedBatch) {
      toast.error("Please select a batch number");
      return;
    }
    if (!transferQty || isNaN(transferQty) || Number(transferQty) <= 0) {
      toast.error("Enter a valid transfer quantity");
      return;
    }
    if (Number(transferQty) > selectedBatch.available_qty) {
      toast.error(
        `Transfer quantity (${transferQty}) exceeds available stock (${selectedBatch.available_qty})`
      );
      return;
    }
    const alreadyExists = addedItems.find(
      (i) =>
        i.item_id === selectedMedicine.item_id &&
        i.batch_number === selectedBatch.batch_number
    );
    if (alreadyExists) {
      toast.warning("This medicine with the same batch is already added");
      return;
    }

    setAddedItems([
      ...addedItems,
      {
        stock_id: selectedBatch.stock_id,
        item_id: selectedMedicine.item_id,
        item_name: selectedMedicine.item_name,
        batch_number: selectedBatch.batch_number,
        hsn_code: selectedBatch.hsn_code,
        outlet_code: selectedBatch.outlet_code,
        outlet_stock: selectedBatch.available_qty,
        transfer_quantity: Number(transferQty),
      },
    ]);

    // Reset add-medicine fields
    setMedicineSearch("");
    setSelectedMedicine(null);
    setAvailableBatches([]);
    setSelectedBatchIdx("");
    setTransferQty("");
  };

  const handleRemoveItem = (index) => {
    setAddedItems(addedItems.filter((_, i) => i !== index));
  };

  // Requirement 6 & 7: Save transfer — POST to stock-transfer, backend handles stock update
  const handleSave = async () => {
    if (!fromOutlet) { toast.error("Please select From Outlet"); return; }
    if (!toOutlet)   { toast.error("Please select To Outlet");   return; }
    if (fromOutlet === toOutlet) {
      toast.error("From and To outlets cannot be the same");
      return;
    }
    if (addedItems.length === 0) {
      toast.error("Please add at least one medicine");
      return;
    }

    try {
      // Requirement 7: StockTransfer payload with all required fields
      const payload = {
        from_outlet: fromOutlet,
        to_outlet: toOutlet,
        transfer_ref_number: transferRefNumber,
        items: addedItems.map((i) => ({
          stock_id: i.stock_id,          // needed for backend to update PharmacyStock
          item_id: i.item_id,
          batch_number: i.batch_number,
          transfer_quantity: i.transfer_quantity,
          outlet_code: i.outlet_code,
        })),
        is_verified: "Draft",
      };

      const response = await apiRequest(
        `${HmsBaseUrl}stock-transfer/`,
        "POST",
        payload
      );

      if (response && !response.error) {
        toast.success("Stock Transfer saved successfully");
        handleCancel();
        fetchTransfers();
      } else {
        toast.error(response?.error || "Failed to save transfer");
      }
    } catch {
      toast.error("Failed to save transfer");
    }
  };

  const handleCancel = () => {
    setFromOutlet("");
    setToOutlet("");
    setAddedItems([]);
    setMedicineSearch("");
    setSelectedMedicine(null);
    setAvailableBatches([]);
    setSelectedBatchIdx("");
    setTransferQty("");
    setShowForm(false);
  };

  const handleSearch = () => {
    fetchTransfers({
      from_outlet: filterFromOutlet,
      to_outlet: filterToOutlet,
      from_date: filterFromDate,
      to_date: filterToDate,
    });
  };

  const handlePrintSlip = (transfer) => {
    setPrintSlip(transfer);
    setOpenMenuId(null);
    setTimeout(() => window.print(), 300);
  };

  // When fromOutlet changes, re-fetch batches for currently selected medicine
  const handleFromOutletChange = (val) => {
    setFromOutlet(val);
    // Re-fetch batches if a medicine is already selected
    if (selectedMedicine) {
      setTimeout(() => fetchBatchesForItem(selectedMedicine.item_id), 0);
    }
  };

  // ── Outlet Options ─────────────────────────────────────────────────────────
  // Use outlets from API (requirement 1); no hardcoded "Drug Purchase"
  const outletOptions = outlets;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>
        {/* ── Header ── */}
        <PageHeader>
          <div>
            <PageTitle>📦 Stock Transfer</PageTitle>
            <PageSubtitle>Manage inter-outlet stock transfers</PageSubtitle>
          </div>
          {!showForm && (
            <NewTransferBtn onClick={() => setShowForm(true)}>
              + New Transfer
            </NewTransferBtn>
          )}
        </PageHeader>

        {/* ── Requirement 2: Inline Form Panel (no modal) ── */}
        {showForm && (
          <FormPanel>
            <FormPanelHeader>
              <div>
                <PageTitle style={{ fontSize: "1rem" }}>📦 New Stock Transfer</PageTitle>
                <p style={{ margin: "2px 0 0", fontSize: "0.78rem", opacity: 0.8 }}>
                  Ref: {transferRefNumber}
                </p>
              </div>
              <FormPanelClose onClick={handleCancel}>✕</FormPanelClose>
            </FormPanelHeader>

            <FormPanelBody>
              {/* ── Outlets Row ── */}
              <FormRow columns="1fr 1fr" style={{ marginBottom: 20 }}>
                <InputWrapper>
                  <Label required>From Outlet</Label>
                  <FilterSelect
                    style={{ width: "100%", padding: "9px 10px", fontSize: "0.9rem" }}
                    value={fromOutlet}
                    onChange={(e) => handleFromOutletChange(e.target.value)}
                  >
                    <option value="">-- Select From Outlet --</option>
                    {outletOptions.map((o) => (
                      <option key={o.outlet_code || o.outlet_name} value={o.outlet_name}>
                        {o.outlet_name}
                      </option>
                    ))}
                  </FilterSelect>
                </InputWrapper>

                <InputWrapper>
                  <Label required>To Outlet</Label>
                  <FilterSelect
                    style={{ width: "100%", padding: "9px 10px", fontSize: "0.9rem" }}
                    value={toOutlet}
                    onChange={(e) => setToOutlet(e.target.value)}
                  >
                    <option value="">-- Select To Outlet --</option>
                    {outletOptions
                      .filter((o) => o.outlet_name !== fromOutlet)
                      .map((o) => (
                        <option key={o.outlet_code || o.outlet_name} value={o.outlet_name}>
                          {o.outlet_name}
                        </option>
                      ))}
                  </FilterSelect>
                </InputWrapper>
              </FormRow>

              {/* ── Medicine Add Section ── */}
              <div
                style={{
                  background: "#f0fdfa",
                  border: "1px solid #d1fae5",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <SectionTitle style={{ marginBottom: 12 }}>Add Medicine</SectionTitle>

                {/* Requirement 3: Display columns: Product Name | HSN Code | Outlet Stock | Batch No | Transfer Qty | Action */}
                <FormRow columns="2fr 1.2fr 1fr 1.2fr 0.8fr auto">
                  {/* Medicine Name (Req 4) */}
                  <InputWrapper>
                    <Label required>Product Name</Label>
                    <RelativeWrapper ref={medicineSearchRef}>
                      <Input
                        type="text"
                        value={medicineSearch}
                        onChange={handleMedicineSearch}
                        placeholder="Search medicine..."
                        autoComplete="off"
                      />
                      {showMedDropdown && medicineResults.length > 0 && (
                        <SearchDropdown>
                          {medicineResults.map((med) => (
                            <DropdownItem
                              key={med.item_id}
                              onMouseDown={() => handleSelectMedicine(med)}
                            >
                              {med.item_name}
                            </DropdownItem>
                          ))}
                        </SearchDropdown>
                      )}
                    </RelativeWrapper>
                  </InputWrapper>

                  {/* HSN Code (Req 5: auto-filled from batch) */}
                  <InputWrapper>
                    <Label>HSN Code</Label>
                    <ReadonlyInput
                      type="text"
                      value={selectedBatch?.hsn_code || ""}
                      readOnly
                      placeholder="Auto-filled"
                    />
                  </InputWrapper>

                  {/* Outlet Stock (Req 5: auto-filled) */}
                  <InputWrapper>
                    <Label>Outlet Stock</Label>
                    <ReadonlyInput
                      type="text"
                      value={selectedBatch !== null ? selectedBatch.available_qty : ""}
                      readOnly
                      placeholder="Auto-filled"
                    />
                  </InputWrapper>

                  {/* Batch Number (Req 5: auto if 1, select if multiple) */}
                  <InputWrapper>
                    <Label required>Batch No.</Label>
                    {availableBatches.length === 0 ? (
                      <ReadonlyInput
                        type="text"
                        value=""
                        readOnly
                        placeholder="Auto-filled"
                      />
                    ) : availableBatches.length === 1 ? (
                      <>
                        <ReadonlyInput
                          type="text"
                          value={availableBatches[0].batch_number}
                          readOnly
                        />
                        <StockInfoNote>Stock: {availableBatches[0].available_qty}</StockInfoNote>
                      </>
                    ) : (
                      <>
                        <BatchSelect value={selectedBatchIdx} onChange={handleBatchChange}>
                          <option value="">-- Select Batch --</option>
                          {availableBatches.map((b, idx) => (
                            <option key={b.stock_id || idx} value={idx}>
                              {b.batch_number} (Avail: {b.available_qty})
                            </option>
                          ))}
                        </BatchSelect>
                        {selectedBatch && (
                          <StockInfoNote>Stock: {selectedBatch.available_qty}</StockInfoNote>
                        )}
                      </>
                    )}
                  </InputWrapper>

                  {/* Transfer Qty */}
                  <InputWrapper>
                    <Label required>Transfer Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      max={selectedBatch?.available_qty || undefined}
                      value={transferQty}
                      onChange={(e) => setTransferQty(e.target.value)}
                      placeholder="0"
                    />
                  </InputWrapper>

                  {/* Add Button */}
                  <InputWrapper style={{ justifyContent: "flex-end" }}>
                    <Label>&nbsp;</Label>
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      style={{ padding: "7px 16px", fontSize: "0.85rem", whiteSpace: "nowrap" }}
                    >
                      + Add
                    </Button>
                  </InputWrapper>
                </FormRow>
              </div>

              {/* ── Added Medicines Table (Req 3 columns) ── */}
              {addedItems.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <SectionTitle>Added Medicines</SectionTitle>
                  <AddedItemsTable>
                    <thead>
                      <tr>
                        <ATh>#</ATh>
                        <ATh>Product Name</ATh>
                        <ATh>HSN Code</ATh>
                        <ATh>Outlet Stock</ATh>
                        <ATh>Batch No.</ATh>
                        <ATh>Transfer Qty</ATh>
                        <ATh>Action</ATh>
                      </tr>
                    </thead>
                    <tbody>
                      {addedItems.map((item, idx) => (
                        <tr key={idx}>
                          <ATd>{idx + 1}</ATd>
                          <ATd style={{ fontWeight: 600 }}>{item.item_name}</ATd>
                          <ATd>{item.hsn_code || "-"}</ATd>
                          <ATd>{item.outlet_stock}</ATd>
                          <ATd>{item.batch_number || "-"}</ATd>
                          <ATd style={{ color: "#0d9488", fontWeight: 600 }}>
                            {item.transfer_quantity}
                          </ATd>
                          <ATd>
                            <RemoveBtn onClick={() => handleRemoveItem(idx)}>Remove</RemoveBtn>
                          </ATd>
                        </tr>
                      ))}
                    </tbody>
                  </AddedItemsTable>
                </div>
              )}

              {/* ── Action Buttons ── */}
              <ButtonContainer>
                <Button secondary type="button" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave}>
                  Save Transfer
                </Button>
              </ButtonContainer>
            </FormPanelBody>
          </FormPanel>
        )}

        {/* ── Filters ── */}
        <FilterRow>
          <FilterGroup>
            <FilterLabel>From Outlet</FilterLabel>
            <FilterSelect
              value={filterFromOutlet}
              onChange={(e) => setFilterFromOutlet(e.target.value)}
            >
              <option value="All">All</option>
              {outletOptions.map((o) => (
                <option key={o.outlet_code || o.outlet_name} value={o.outlet_name}>
                  {o.outlet_name}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>To Outlet</FilterLabel>
            <FilterSelect
              value={filterToOutlet}
              onChange={(e) => setFilterToOutlet(e.target.value)}
            >
              <option value="All">All</option>
              {outletOptions.map((o) => (
                <option key={o.outlet_code || o.outlet_name} value={o.outlet_name}>
                  {o.outlet_name}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>From Date</FilterLabel>
            <FilterInput
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>To Date</FilterLabel>
            <FilterInput
              type="date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
            />
          </FilterGroup>

          <SearchBtn onClick={handleSearch}>🔍 Search</SearchBtn>
        </FilterRow>

        {/* ── Transfer Records Table ── */}
        <div style={{ padding: "20px 24px 24px" }}>
          <SectionTitle>Transfer Records</SectionTitle>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th>Ref No</Th>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {transfers.length === 0 ? (
                  <Tr>
                    <Td colSpan="6" style={{ textAlign: "center", color: "#9ca3af" }}>
                      No transfer records found
                    </Td>
                  </Tr>
                ) : (
                  transfers.map((t) => (
                    <Tr key={t.id || t.transfer_ref_number}>
                      <Td>
                        <StatusBadge status={t.is_verified === "Draft" ? "Pending" : "Approved"}>
                          {t.is_verified === "Draft" ? "Draft" : "Approved"}
                        </StatusBadge>
                      </Td>
                      <Td>
                        {t.created_date
                          ? new Date(t.created_date).toLocaleDateString("en-GB")
                          : "-"}
                      </Td>
                      <Td style={{ fontWeight: 600, color: "#0d9488" }}>
                        {t.transfer_ref_number}
                      </Td>
                      <Td>{t.from_outlet}</Td>
                      <Td>{t.to_outlet}</Td>
                      <Td>
                        <ActionMenuWrapper>
                          <ActionMenuBtn
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === (t.id || t.transfer_ref_number)
                                  ? null
                                  : t.id || t.transfer_ref_number
                              )
                            }
                          >
                            ⋮
                          </ActionMenuBtn>
                          {openMenuId === (t.id || t.transfer_ref_number) && (
                            <ActionMenu>
                              <ActionMenuItem onClick={() => handlePrintSlip(t)}>
                                🖨️ Print Slip
                              </ActionMenuItem>
                            </ActionMenu>
                          )}
                        </ActionMenuWrapper>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </div>
      </Container>

      {/* ── Print Slip (hidden, only visible during print) ── */}
      {printSlip && (
        <div id="stock-transfer-slip" style={{ display: "none" }}>
          <div style={{ fontFamily: "monospace", fontSize: 12, padding: 10 }}>
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 14, marginBottom: 4 }}>
              SHANMUGA HOSPITAL LIMITED
            </div>
            <div style={{ textAlign: "center", marginBottom: 8 }}>04272706666</div>
            <div style={{ textAlign: "center", fontWeight: "bold", marginBottom: 4 }}>
              STOCK TRANSFER SLIP
            </div>
            <div>{"=".repeat(70)}</div>
            <div style={{ marginTop: 6 }}>
              <div>Source      : {printSlip.from_outlet}</div>
              <div>Date        : {printSlip.created_date ? new Date(printSlip.created_date).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}</div>
              <div>Destination : {printSlip.to_outlet}</div>
              <div>Ref.        : {printSlip.transfer_ref_number}</div>
            </div>
            <div style={{ marginTop: 6 }}>{"=".repeat(70)}</div>
            <div style={{ marginTop: 4 }}>
              <span style={{ display: "inline-block", width: 30 }}>Sl</span>
              <span style={{ display: "inline-block", width: 180 }}>Particulars</span>
              <span style={{ display: "inline-block", width: 80 }}>Batch</span>
              <span style={{ display: "inline-block", width: 60 }}>Qty</span>
            </div>
            <div>{"-".repeat(70)}</div>
            {(printSlip.items || []).map((item, idx) => (
              <div key={idx}>
                <span style={{ display: "inline-block", width: 30 }}>{idx + 1}</span>
                <span style={{ display: "inline-block", width: 180 }}>
                  {item.item_name || `Item #${item.item_id}`}
                </span>
                <span style={{ display: "inline-block", width: 80 }}>
                  {item.batch_number || "-"}
                </span>
                <span style={{ display: "inline-block", width: 60 }}>
                  {item.transfer_quantity}
                </span>
              </div>
            ))}
            <div style={{ marginTop: 6 }}>{"-".repeat(70)}</div>
            <div style={{ marginTop: 4 }}>
              Total Items : {(printSlip.items || []).length}
            </div>
            <div>
              Total Qty   :{" "}
              {(printSlip.items || []).reduce(
                (s, i) => s + Number(i.transfer_quantity || 0),
                0
              )}
            </div>
            <div style={{ marginTop: 6 }}>{"-".repeat(70)}</div>
            <div style={{ marginTop: 6, fontSize: 11, color: "#666" }}>
              Status: {printSlip.is_verified || "Draft"}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default StockTransfer;