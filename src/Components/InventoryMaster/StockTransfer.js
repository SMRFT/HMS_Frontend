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
import styled, { keyframes } from "styled-components";

// ─── Animations ───────────────────────────────────────────────────────────────
const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-12px); max-height: 0; }
  to   { opacity: 1; transform: translateY(0);    max-height: 2000px; }
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
    status === "Approved"
      ? "#0d9488"
      : status === "Rejected"
      ? "#dc2626"
      : "#f59e0b"};
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
const ActionBtnGroup = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;
const ApproveBtn = styled.button`
  background: ${({ disabled }) => (disabled ? "#d1d5db" : "#0d9488")};
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  &:hover:not(:disabled) { background: #0f766e; }
`;
const PrintBtn = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #2563eb; }
`;
const CancelBtn = styled.button`
  background: ${({ disabled }) => (disabled ? "#d1d5db" : "#fee2e2")};
  color: ${({ disabled }) => (disabled ? "#9ca3af" : "#dc2626")};
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  &:hover:not(:disabled) { background: #fca5a5; }
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

// ─── Confirmation Modal ───────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
`;
const ModalBox = styled.div`
  background: white;
  border-radius: 10px;
  padding: 28px 32px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
`;
const ModalTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
`;
const ModalText = styled.p`
  margin: 0 0 20px;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
`;
const ModalBtns = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const ConfirmModal = ({ title, message, confirmLabel, confirmColor, onConfirm, onClose }) => (
  <ModalOverlay onClick={onClose}>
    <ModalBox onClick={(e) => e.stopPropagation()}>
      <ModalTitle>{title}</ModalTitle>
      <ModalText>{message}</ModalText>
      <ModalBtns>
        <button
          onClick={onClose}
          style={{
            padding: "8px 18px", borderRadius: 6, border: "1px solid #d1d5db",
            background: "white", cursor: "pointer", fontSize: "0.85rem",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: "8px 18px", borderRadius: 6, border: "none",
            background: confirmColor || "#0d9488", color: "white",
            cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
          }}
        >
          {confirmLabel || "Confirm"}
        </button>
      </ModalBtns>
    </ModalBox>
  </ModalOverlay>
);

// ─── Auth Header Helper ───────────────────────────────────────────────────────
// Reads the outlet-code from localStorage/sessionStorage or a global auth store.
// Adjust the key names to match your actual auth storage.
function getAuthHeaders() {
  // Try common storage patterns — adapt to your auth setup
  const hospitalCode =
    localStorage.getItem("auth-hospital-code") ||
    sessionStorage.getItem("auth-hospital-code") ||
    "";
  const branchCode =
    localStorage.getItem("auth-branch-code") ||
    sessionStorage.getItem("auth-branch-code") ||
    "";
  const outletCode =
    localStorage.getItem("auth-outlet-code") ||
    sessionStorage.getItem("auth-outlet-code") ||
    "";

  return { hospitalCode, branchCode, outletCode };
}

// ─── Main Component ───────────────────────────────────────────────────────────
const StockTransfer = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Auth context ───────────────────────────────────────────────────────────
  // outletCode: non-empty = pharmacy outlet; "" = Drug Purchase (no outlet)
  const { hospitalCode, branchCode, outletCode } = getAuthHeaders();
  const isDrugPurchase = !outletCode || outletCode === "null" || outletCode === "system";
  const currentOutletCode = isDrugPurchase ? "" : outletCode;

  // Section label for display in table header
  const currentSectionLabel = isDrugPurchase ? "Drug Purchase" : outletCode;

  // ── State ──────────────────────────────────────────────────────────────────
  const [outlets, setOutlets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [fromOutlet, setFromOutlet] = useState("");
  const [toOutlet, setToOutlet]     = useState("");
  const [transferRefNumber, setTransferRefNumber] = useState("");
  const [addedItems, setAddedItems] = useState([]);

  // Medicine search
  const [medicineSearch, setMedicineSearch]     = useState("");
  const [medicineResults, setMedicineResults]   = useState([]);
  const [showMedDropdown, setShowMedDropdown]   = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Batch/stock state
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchIdx, setSelectedBatchIdx] = useState("");
  const [transferQty, setTransferQty]           = useState("");

  // Filter state
  const [filterFromOutlet, setFilterFromOutlet] = useState("All");
  const [filterToOutlet, setFilterToOutlet]     = useState("All");
  const [filterFromDate, setFilterFromDate]     = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-04-01`;
  });
  const [filterToDate, setFilterToDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  // Print
  const [printSlip, setPrintSlip] = useState(null);

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState(null);

  const medicineSearchRef = useRef(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedBatch = selectedBatchIdx !== "" ? availableBatches[selectedBatchIdx] : null;

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOutlets();
    injectPrintStyles();
  }, []);

  useEffect(() => {
    fetchTransfers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showForm) generateRefNumber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm]);

  useEffect(() => {
    const handler = (e) => {
      if (medicineSearchRef.current && !medicineSearchRef.current.contains(e.target))
        setShowMedDropdown(false);
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

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getOutletName = (code) => {
    if (!code || code === "" || code === "null") return "Drug Purchase";
    const found = outlets.find((o) => o.outlet_code === code);
    if (found) return found.outlet_name;
    if (code === "OLET001") return "IP Pharmacy";
    if (code === "OLET002") return "OP Pharmacy";
    return code;
  };

  // ── API Calls ──────────────────────────────────────────────────────────────
  const fetchOutlets = useCallback(async () => {
    try {
      const r = await apiRequest(`${HmsBaseUrl}get_active_outlets/`, "GET");
      if (r?.success && Array.isArray(r?.data?.data)) {
        setOutlets([...r.data.data]);
      } else if (r && !r.error && Array.isArray(r.data)) {
        setOutlets(r.data);
      } else {
        setOutlets([]);
      }
    } catch {
      toast.error("Failed to fetch outlets");
      setOutlets([]);
    }
  }, [HmsBaseUrl]);

  // Fetch transfers — backend filters by auth headers (hospital+branch+outlet)
  // Additional UI filters (from/to outlet, date) passed as query params
  const fetchTransfers = async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.from_outlet && filters.from_outlet !== "All")
        params.append("from_outlet", filters.from_outlet);
      if (filters.to_outlet && filters.to_outlet !== "All")
        params.append("to_outlet", filters.to_outlet);
      if (filters.from_date) params.append("from_date", filters.from_date);
      if (filters.to_date)   params.append("to_date",   filters.to_date);

      const url = `${HmsBaseUrl}stock-transfer/${params.toString() ? "?" + params.toString() : ""}`;
      const response = await apiRequest(url, "GET");

      if (response?.success && Array.isArray(response.data.data)) {
        setTransfers(response.data.data);
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
      const prefix  = `${finYear}/`;
      const response = await apiRequest(`${HmsBaseUrl}stock-transfer/`, "GET");
      let maxSeq = 0;
      if (response?.success && Array.isArray(response.data)) {
        response.data.forEach((t) => {
          if (t.transfer_id?.startsWith(prefix)) {
            const seq = parseInt(t.transfer_id.split("/")[1] || "0", 10);
            if (seq > maxSeq) maxSeq = seq;
          }
        });
      }
      setTransferRefNumber(`${finYear}/${String(maxSeq + 1).padStart(6, "0")}`);
    } catch {
      setTransferRefNumber(`${getCurrentFinYear()}/000001`);
    }
  };

  const searchMedicines = async (query) => {
    if (!query || query.length < 2) {
      setMedicineResults([]);
      setShowMedDropdown(false);
      return;
    }
    // For Drug Purchase: fromOutlet is "" — backend uses branch+hospital only
    // For Pharmacy outlets: fromOutlet is the outlet_code
    if (!fromOutlet && !isDrugPurchase) {
      toast.warning("Please select a From Outlet first");
      return;
    }
    try {
      const params = new URLSearchParams({ search: query });
      // Only append outlet_code when it's a non-empty outlet (not drug purchase)
      if (fromOutlet) params.append("outlet_code", fromOutlet);

      const response = await apiRequest(
        `${HmsBaseUrl}pharmacy-stock/?${params.toString()}`,
        "GET"
      );
      const raw = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      const seen   = new Set();
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

  const fetchBatchesForItem = async (itemId) => {
    try {
      const params = new URLSearchParams({ item_id: itemId });
      // Only append outlet_code when it's a real pharmacy outlet
      if (fromOutlet) params.append("outlet_code", fromOutlet);

      const response = await apiRequest(
        `${HmsBaseUrl}pharmacy-stock/?${params.toString()}`,
        "GET"
      );

      let stocks = [];
      if (Array.isArray(response))            stocks = response;
      else if (Array.isArray(response?.data)) stocks = response.data;

      const batches = stocks.map((s) => ({
        stock_id:      s.stock_id,
        batch_number:  s.batch_number  || "-",
        hsn_code:      s.hsn_code      || "",
        outlet_code:   s.outlet_code   || "",
        mrp:           s.mrp           || 0,
        available_qty: Number(s.available_qty ?? (
          Number(s.total_stock              || 0)
          - Number(s.sold_quantity          || 0)
          - Number(s.transferred_out_quantity || 0)
          - Number(s.grn_return_quantity    || 0)
          - Number(s.blocked_quantity       || 0)
          + Number(s.sales_return_quantity  || 0)
        )),
      }));

      setAvailableBatches(batches);
      setSelectedBatchIdx(batches.length === 1 ? 0 : "");
    } catch (err) {
      console.error("fetchBatchesForItem error:", err);
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

  const handleAddItem = () => {
    if (!selectedMedicine) {
      toast.error("Please select a medicine"); return;
    }
    if (selectedBatchIdx === "" || !selectedBatch) {
      toast.error("Please select a batch number"); return;
    }
    if (!transferQty || isNaN(transferQty) || Number(transferQty) <= 0) {
      toast.error("Enter a valid transfer quantity"); return;
    }
    if (Number(transferQty) > selectedBatch.available_qty) {
      toast.error(
        `Transfer quantity (${transferQty}) exceeds available stock (${selectedBatch.available_qty})`
      );
      return;
    }
    const alreadyExists = addedItems.find(
      (i) => i.item_id === selectedMedicine.item_id && i.batch_number === selectedBatch.batch_number
    );
    if (alreadyExists) {
      toast.warning("This medicine with the same batch is already added"); return;
    }

    setAddedItems([
      ...addedItems,
      {
        stock_id:          selectedBatch.stock_id,
        item_id:           selectedMedicine.item_id,
        item_name:         selectedMedicine.item_name,
        batch_number:      selectedBatch.batch_number,
        hsn_code:          selectedBatch.hsn_code,
        outlet_code:       selectedBatch.outlet_code,
        outlet_stock:      selectedBatch.available_qty,
        transfer_quantity: Number(transferQty),
      },
    ]);

    setMedicineSearch("");
    setSelectedMedicine(null);
    setAvailableBatches([]);
    setSelectedBatchIdx("");
    setTransferQty("");
  };

  const handleRemoveItem = (index) => {
    setAddedItems(addedItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!toOutlet) { toast.error("Please select To Outlet"); return; }

    // For Drug Purchase: fromOutlet is "" — that's valid
    // For Pharmacy outlet: fromOutlet must be set AND differ from toOutlet
    if (!isDrugPurchase && !fromOutlet) {
      toast.error("Please select From Outlet"); return;
    }
    if (fromOutlet && fromOutlet === toOutlet) {
      toast.error("From and To outlets cannot be the same"); return;
    }
    if (addedItems.length === 0) {
      toast.error("Please add at least one medicine"); return;
    }

    try {
      // from_outlet: "" (null) for Drug Purchase, outlet_code for pharmacy
      // to_outlet:   "" (null) for Drug Purchase destination, outlet_code otherwise
      const payload = {
        from_outlet:         fromOutlet || null,
        to_outlet:           toOutlet   || null,
        transfer_id: transferRefNumber,
        items: addedItems.map((i) => ({
          stock_id:          i.stock_id,
          item_id:           i.item_id,
          batch_number:      i.batch_number,
          transfer_quantity: i.transfer_quantity,
          outlet_code:       i.outlet_code || null,
        })),
        is_verified: "Draft",
      };

      const response = await apiRequest(
        `${HmsBaseUrl}stock-transfer/`,
        "POST",
        payload
      );

      if (response?.success) {
        toast.success("Stock Transfer saved as Draft");
        handleCancelForm();
        fetchTransfers();
      } else {
        toast.error(
          Array.isArray(response?.error)
            ? response.error.join(", ")
            : response?.error || "Failed to save transfer"
        );
      }
    } catch {
      toast.error("Failed to save transfer");
    }
  };

  const handleCancelForm = () => {
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
      to_outlet:   filterToOutlet,
      from_date:   filterFromDate,
      to_date:     filterToDate,
    });
  };

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApproveClick = (transfer) => {
    if (transfer.is_verified === "Approved") return;
    if (transfer.is_verified === "Rejected") {
      toast.error("Rejected transfers cannot be approved");
      return;
    }
    setConfirmModal({ type: "approve", transfer });
  };

  const handleApproveConfirm = async () => {
    const transfer = confirmModal?.transfer || {};
    const transferId = transfer.transfer_id || transfer.id || transfer.pk;
    setConfirmModal(null);
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}stock-transfer/${transfer.transfer_id}/`,
        "PUT",
        { action: "approve" }
      );
      if (response?.success) {
        toast.success("Transfer approved successfully");
        fetchTransfers();
      } else {
        toast.error(
          Array.isArray(response?.error)
            ? response.error.join(", ")
            : response?.error || "Failed to approve transfer"
        );
      }
    } catch {
      toast.error("Failed to approve transfer");
    }
  };

  // ── Reject (Cancel) ────────────────────────────────────────────────────────
  const handleRejectClick = (transfer) => {
    if (transfer.is_verified === "Approved") return;
    if (transfer.is_verified === "Rejected") {
      toast.info("Transfer is already cancelled");
      return;
    }
    setConfirmModal({ type: "reject", transfer });
  };

  const handleRejectConfirm = async () => {
    const transfer = confirmModal?.transfer || {};
    const transferId = transfer.transfer_id || transfer.id || transfer.pk;
    setConfirmModal(null);
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}stock-transfer/${transfer.transfer_id}/`,
        "PUT",
        { action: "reject" }
      );
      if (response?.success) {
        toast.success("Transfer cancelled (Rejected)");
        fetchTransfers();
      } else {
        toast.error(
          Array.isArray(response?.error)
            ? response.error.join(", ")
            : response?.error || "Failed to cancel transfer"
        );
      }
    } catch {
      toast.error("Failed to cancel transfer");
    }
  };

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrintSlip = (transfer) => {
    setPrintSlip(transfer);
    setTimeout(() => window.print(), 300);
  };

  // ── From-outlet change ─────────────────────────────────────────────────────
  const handleFromOutletChange = (code) => {
    setFromOutlet(code);
    setMedicineSearch("");
    setSelectedMedicine(null);
    setAvailableBatches([]);
    setSelectedBatchIdx("");
    if (selectedMedicine) {
      setTimeout(() => fetchBatchesForItem(selectedMedicine.item_id), 0);
    }
  };

  // ── Outlet options for the form ────────────────────────────────────────────
  // Drug Purchase option (outlet_code = "") + all active outlets
  const outletOptions = [
    { outlet_code: "", outlet_name: "Drug Purchase" },
    ...outlets,
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>

        {/* ── Header ── */}
        <PageHeader>
          <div>
            <PageTitle>📦 Stock Transfer</PageTitle>
            <PageSubtitle>
              {isDrugPurchase
                ? "Drug Purchase — inter-outlet stock transfers"
                : `${getOutletName(currentOutletCode)} — inter-outlet stock transfers`}
            </PageSubtitle>
          </div>
          {!showForm && (
            <NewTransferBtn onClick={() => setShowForm(true)}>
              + New Transfer
            </NewTransferBtn>
          )}
        </PageHeader>

        {/* ── Inline Form Panel ── */}
        {showForm && (
          <FormPanel>

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
                      <option key={o.outlet_code || "drug-purchase"} value={o.outlet_code}>
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
                      .filter((o) => o.outlet_code !== fromOutlet)
                      .map((o) => (
                        <option key={o.outlet_code || "drug-purchase-to"} value={o.outlet_code}>
                          {o.outlet_name}
                        </option>
                      ))}
                  </FilterSelect>
                </InputWrapper>

              </FormRow>

              {/* ── Medicine Add Section ── */}
              <div style={{
                background: "#f0fdfa",
                border: "1px solid #d1fae5",
                borderRadius: 8,
                padding: 16,
                marginBottom: 20,
              }}>
                <SectionTitle style={{ marginBottom: 12 }}>Add Medicine</SectionTitle>

                <FormRow columns="2fr 1.2fr 1fr 1.2fr 0.8fr auto">

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

                  <InputWrapper>
                    <Label>HSN Code</Label>
                    <ReadonlyInput
                      type="text"
                      value={selectedBatch?.hsn_code || ""}
                      readOnly
                      placeholder="Auto-filled"
                    />
                  </InputWrapper>

                  <InputWrapper>
                    <Label>Outlet Stock</Label>
                    <ReadonlyInput
                      type="text"
                      value={selectedBatch !== null ? selectedBatch.available_qty : ""}
                      readOnly
                      placeholder="Auto-filled"
                    />
                  </InputWrapper>

                  <InputWrapper>
                    <Label required>Batch No.</Label>
                    {availableBatches.length === 0 ? (
                      <ReadonlyInput type="text" value="" readOnly placeholder="Auto-filled" />
                    ) : availableBatches.length === 1 ? (
                      <>
                        <ReadonlyInput type="text" value={availableBatches[0].batch_number} readOnly />
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

              {/* ── Added Medicines Table ── */}
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

              <ButtonContainer>
                <Button secondary type="button" onClick={handleCancelForm}>Cancel</Button>
                <Button type="button" onClick={handleSave}>Save Transfer</Button>
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
              <option value="">Drug Purchase</option>
              {outlets.map((o) => (
                <option key={o.outlet_code} value={o.outlet_code}>
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
              <option value="">Drug Purchase</option>
              {outlets.map((o) => (
                <option key={o.outlet_code} value={o.outlet_code}>
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
          <SectionTitle>
            Transfer Records —{" "}
            {isDrugPurchase
              ? "Drug Purchase"
              : getOutletName(currentOutletCode)}
          </SectionTitle>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th>Ref No</Th>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Actions</Th>
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
                  transfers.map((t) => {
                    const status     = t.is_verified || "Draft";
                    const isApproved = status === "Approved";
                    const isRejected = status === "Rejected";

                    return (
                      <Tr key={t.transfer_id || t.transfer_id}>
                        <Td>
                          <StatusBadge status={status}>{status}</StatusBadge>
                        </Td>
                        <Td>
                          {t.created_date
                            ? new Date(t.created_date).toLocaleDateString("en-GB")
                            : "-"}
                        </Td>
                        <Td style={{ fontWeight: 600, color: "#0d9488" }}>
                          {t.transfer_id}
                        </Td>
                        <Td>{getOutletName(t.from_outlet || t.outlet_code)}</Td>
                        <Td>{getOutletName(t.to_outlet)}</Td>
                        <Td>
                          <ActionBtnGroup>
                            <ApproveBtn
                              disabled={isApproved || isRejected}
                              onClick={() => !isApproved && !isRejected && handleApproveClick(t)}
                              title={
                                isApproved ? "Already approved"
                                : isRejected ? "Cancelled — cannot approve"
                                : "Approve transfer"
                              }
                            >
                              ✔ Approve
                            </ApproveBtn>

                            <PrintBtn onClick={() => handlePrintSlip(t)} title="Print transfer slip">
                              🖨️ Print
                            </PrintBtn>

                            <CancelBtn
                              disabled={isApproved || isRejected}
                              onClick={() => !isApproved && !isRejected && handleRejectClick(t)}
                              title={
                                isApproved ? "Approved — cannot cancel"
                                : isRejected ? "Already cancelled"
                                : "Cancel transfer"
                              }
                            >
                              ✕ Cancel
                            </CancelBtn>
                          </ActionBtnGroup>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </div>

      </Container>

      {/* ── Confirm Modal ── */}
      {confirmModal && confirmModal.type === "approve" && (
        <ConfirmModal
          title="Approve Stock Transfer"
          message={`Approve transfer ${confirmModal.transfer.transfer_id}? This will update stock quantities and cannot be undone.`}
          confirmLabel="Approve"
          confirmColor="#0d9488"
          onConfirm={handleApproveConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}
      {confirmModal && confirmModal.type === "reject" && (
        <ConfirmModal
          title="Cancel Stock Transfer"
          message={`Cancel transfer ${confirmModal.transfer.transfer_id}? This will mark it as Rejected.`}
          confirmLabel="Yes, Cancel"
          confirmColor="#dc2626"
          onConfirm={handleRejectConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}

      {/* ── Print Slip ── */}
      {printSlip && (
        <div id="stock-transfer-slip" style={{ display: "none" }}>
          <div style={{ fontFamily: "monospace", fontSize: 12, padding: 10, width: 600 }}>

            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 15, marginBottom: 3 }}>
              SHANMUGA HOSPITAL LIMITED
            </div>
            <div style={{ textAlign: "center", marginBottom: 6, fontSize: 12 }}>04272706666</div>
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 13, marginBottom: 6 }}>
              STOCK TRANSFER SLIP
            </div>
            <div>{"─".repeat(80)}</div>

            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Source      : <strong>{getOutletName(printSlip.from_outlet || printSlip.outlet_code)}</strong></span>
                <span>Date : <strong>
                  {printSlip.created_date
                    ? new Date(printSlip.created_date).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                      })
                    : new Date().toLocaleDateString("en-GB")}
                </strong></span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span>Destination : <strong>{getOutletName(printSlip.to_outlet)}</strong></span>
                <span>Ref.  : <strong>{printSlip.transfer_id}</strong></span>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>{"=".repeat(80)}</div>

            <div style={{ display: "flex", marginTop: 6, fontWeight: "bold" }}>
              <span style={{ width: 30 }}>Sl</span>
              <span style={{ flex: 1 }}>Particulars</span>
              <span style={{ width: 90 }}>Batch</span>
              <span style={{ width: 70 }}>Expiry</span>
              <span style={{ width: 50, textAlign: "right" }}>Qty</span>
              <span style={{ width: 80, textAlign: "right" }}>S.rate</span>
              <span style={{ width: 90, textAlign: "right" }}>Company Total</span>
            </div>
            <div>{"─".repeat(80)}</div>

            {(printSlip.items || []).map((item, idx) => {
              const qty   = Number(item.transferred_out_quantity || item.transfer_quantity || 0);
              const srate = Number(item.selling_price || item.Selling_Price || item.mrp || 0);
              const total = (qty * srate).toFixed(2);
              return (
                <div key={idx} style={{ display: "flex", marginTop: 4 }}>
                  <span style={{ width: 30 }}>{idx + 1}</span>
                  <span style={{ flex: 1 }}>{item.item_name || `Item #${item.item_id}`}</span>
                  <span style={{ width: 90 }}>{item.batch_number || "-"}</span>
                  <span style={{ width: 70 }}>
                    {item.expiry_date
                      ? new Date(item.expiry_date).toLocaleDateString("en-GB", {
                          month: "2-digit", year: "numeric",
                        })
                      : "-"}
                  </span>
                  <span style={{ width: 50, textAlign: "right" }}>{qty}</span>
                  <span style={{ width: 80, textAlign: "right" }}>
                    {srate ? srate.toFixed(2) : "-"}
                  </span>
                  <span style={{ width: 90, textAlign: "right" }}>
                    {srate ? total : "-"}
                  </span>
                </div>
              );
            })}

            <div style={{ marginTop: 8 }}>{"─".repeat(80)}</div>

            {(() => {
              const totalQty = (printSlip.items || []).reduce(
                (s, i) => s + Number(i.transferred_out_quantity || i.transfer_quantity || 0), 0
              );
              const totalAmt = (printSlip.items || []).reduce((s, i) => {
                const qty   = Number(i.transferred_out_quantity || i.transfer_quantity || 0);
                const srate = Number(i.selling_price || i.Selling_Price || i.mrp || 0);
                return s + qty * srate;
              }, 0);
              return (
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontWeight: "bold" }}>
                  <span>Total Items : {(printSlip.items || []).length}</span>
                  <span>Total Qty : {totalQty}</span>
                  {totalAmt > 0 && <span>Total Amt : {totalAmt.toFixed(2)}</span>}
                </div>
              );
            })()}

            <div style={{ marginTop: 8 }}>{"─".repeat(80)}</div>

            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span>Prepared By : {printSlip.created_by || "-"}</span>
              <span>Status : {printSlip.is_verified || "Draft"}</span>
            </div>
            <div style={{ marginTop: 4, fontSize: 11, color: "#666" }}>
              Remarks :
            </div>
            <div style={{ marginTop: 8 }}>{"=".repeat(80)}</div>
          </div>
        </div>
      )}

    </PageWrapper>
  );
};

export default StockTransfer;