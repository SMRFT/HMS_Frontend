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
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const PageHeader = styled.div`
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  padding: 20px 28px;
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(124,58,237,0.18);
`;
const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
`;
const PageSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 0.8rem;
  opacity: 0.82;
`;
const NewReturnBtn = styled.button`
  background: #f97316;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 7px;
  font-size: 0.87rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s, transform 0.12s;
  box-shadow: 0 2px 8px rgba(249,115,22,0.25);
  &:hover { background: #ea6c0a; transform: translateY(-1px); }
  &:active { transform: translateY(0); }
`;
const SectionTitle = styled.h4`
  color: #7c3aed;
  margin: 0 0 16px;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  background: ${({ $status }) =>
    $status === "Supplier Collected" ? "#dcfce7"
    : $status === "Credit Note Settled" ? "#dbeafe"
    : $status === "Partial Credit Note" ? "#fef3c7"
    : "#f3e8ff"};
  color: ${({ $status }) =>
    $status === "Supplier Collected" ? "#166534"
    : $status === "Credit Note Settled" ? "#1e40af"
    : $status === "Partial Credit Note" ? "#92400e"
    : "#6d28d9"};
  border: 1px solid ${({ $status }) =>
    $status === "Supplier Collected" ? "#86efac"
    : $status === "Credit Note Settled" ? "#93c5fd"
    : $status === "Partial Credit Note" ? "#fde68a"
    : "#c4b5fd"};
  &::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: ${({ $status }) =>
      $status === "Supplier Collected" ? "#16a34a"
      : $status === "Credit Note Settled" ? "#2563eb"
      : $status === "Partial Credit Note" ? "#d97706"
      : "#7c3aed"};
  }
`;
const FilterRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: flex-end;
  flex-wrap: wrap;
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;
const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 150px;
`;
const FilterLabel = styled.label`
  font-size: 0.73rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
const FilterSelect = styled.select`
  padding: 8px 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 7px;
  font-size: 0.85rem;
  color: #374151;
  outline: none;
  background: white;
  transition: border-color 0.15s;
  &:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
`;
const FilterInput = styled.input`
  padding: 8px 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 7px;
  font-size: 0.85rem;
  color: #374151;
  outline: none;
  background: white;
  transition: border-color 0.15s;
  &:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
`;
const SearchBtn = styled.button`
  background: #7c3aed;
  color: white;
  border: none;
  padding: 9px 20px;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  height: 36px;
  align-self: flex-end;
  transition: background 0.15s;
  &:hover { background: #6d28d9; }
`;
const FormPanel = styled.div`
  animation: ${slideDown} 0.3s ease forwards;
  border-bottom: 2px solid #ede9fe;
  background: #fdfcff;
`;
const FormPanelBody = styled.div`
  padding: 22px 26px;
`;
const VendorInfoBox = styled.div`
  background: #f5f3ff;
  border: 1.5px solid #c4b5fd;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 20px;
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  font-size: 0.82rem;
  color: #374151;
`;
const VendorInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const VendorInfoLabel = styled.span`
  font-size: 0.7rem;
  color: #7c3aed;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
const VendorInfoValue = styled.span`
  font-weight: 600;
  color: #111827;
`;
const ItemBox = styled.div`
  background: #faf5ff;
  border: 1.5px solid #c4b5fd;
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 20px;
`;
const GrnSearchWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;
`;
const GrnSearchBtn = styled.button`
  background: #7c3aed;
  color: white;
  border: none;
  padding: 9px 16px;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  height: 38px;
  &:hover { background: #6d28d9; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
const AddedItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;
const ATh = styled.th`
  background: #f5f3ff;
  color: #6d28d9;
  padding: 10px 12px;
  text-align: left;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 2px solid #c4b5fd;
`;
const ATd = styled.td`
  padding: 9px 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  vertical-align: middle;
`;
const RemoveBtn = styled.button`
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 4px 11px;
  border-radius: 5px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  &:hover { background: #fca5a5; }
`;
const ReadonlyInput = styled(Input)`
  background: #f3f4f6 !important;
  cursor: not-allowed;
  color: #6b7280;
`;
const TotalsBox = styled.div`
  background: #f5f3ff;
  border: 1.5px solid #c4b5fd;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-items: flex-end;
`;
const TotalItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 130px;
`;
const TotalLabel = styled.label`
  font-size: 0.72rem;
  font-weight: 700;
  color: #7c3aed;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
const TotalValue = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  color: #111827;
`;

// ─── Kebab Menu ───────────────────────────────────────────────────────────────
const KebabWrapper = styled.div`position: relative; display: inline-block;`;
const KebabBtn = styled.button`
  background: white; border: 1.5px solid #e5e7eb; border-radius: 6px;
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 1.2rem; color: #6b7280;
  transition: background 0.15s, border-color 0.15s;
  &:hover { background: #f3f4f6; border-color: #9ca3af; color: #111827; }
`;
const KebabMenu = styled.div`
  position: absolute; right: 0; top: calc(100% + 4px); background: white;
  border: 1.5px solid #e5e7eb; border-radius: 9px;
  box-shadow: 0 10px 28px rgba(0,0,0,0.13); min-width: 195px; z-index: 1000;
  overflow: hidden; animation: ${fadeIn} 0.15s ease forwards;
`;
const KebabItem = styled.button`
  width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 15px;
  background: none; border: none; text-align: left; font-size: 0.83rem; font-weight: 600;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  color: ${({ $disabled }) => ($disabled ? "#9ca3af" : "#374151")};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
  transition: background 0.12s;
  &:hover { background: ${({ $disabled }) => ($disabled ? "none" : "#f5f3ff")}; color: ${({ $disabled }) => ($disabled ? undefined : "#7c3aed")}; }
`;
const KebabDivider = styled.div`height: 1px; background: #f3f4f6; margin: 2px 0;`;

// ─── Confirmation Modal ───────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1050;
  display: flex; align-items: center; justify-content: center;
`;
const ModalBox = styled.div`
  background: white; border-radius: 12px; padding: 30px 34px;
  max-width: 460px; width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: ${fadeIn} 0.18s ease forwards;
`;
const ModalTitle = styled.h3`margin: 0 0 10px; font-size: 1.05rem; font-weight: 700; color: #111827;`;
const ModalText = styled.p`margin: 0 0 16px; font-size: 0.875rem; color: #6b7280; line-height: 1.6;`;
const ModalBtns = styled.div`display: flex; gap: 10px; justify-content: flex-end;`;

const StatusUpdateModal = ({ record, onConfirm, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState(record.status || "Pending");
  const statuses = ["Pending", "Supplier Collected", "Partial Credit Note", "Credit Note Settled"];
  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalTitle>📋 Update Return Status</ModalTitle>
        <ModalText>
          Update status for <strong>{record.purchase_return_bill_no}</strong>
        </ModalText>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
            New Status
          </label>
          <FilterSelect
            style={{ width: "100%" }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </FilterSelect>
        </div>
        <ModalBtns>
          <button onClick={onClose} style={{
            padding: "9px 20px", borderRadius: 7, border: "1.5px solid #d1d5db",
            background: "white", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
          }}>Cancel</button>
          <button onClick={() => onConfirm(selectedStatus)} style={{
            padding: "9px 20px", borderRadius: 7, border: "none",
            background: "#7c3aed", color: "white", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
          }}>Update</button>
        </ModalBtns>
      </ModalBox>
    </ModalOverlay>
  );
};

// ─── Row Kebab Menu ───────────────────────────────────────────────────────────
const RowKebabMenu = ({ record, onUpdateStatus, onView }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const handle = (fn) => { setOpen(false); fn(); };
  return (
    <KebabWrapper ref={ref}>
      <KebabBtn onClick={() => setOpen((v) => !v)} title="Actions">⋮</KebabBtn>
      {open && (
        <KebabMenu>
          <KebabItem onClick={() => handle(onView)}>
            <span>👁</span> View Details
          </KebabItem>
          <KebabDivider />
          <KebabItem onClick={() => handle(onUpdateStatus)}>
            <span>📋</span> Update Status
          </KebabItem>
        </KebabMenu>
      )}
    </KebabWrapper>
  );
};

// ─── View Details Modal ───────────────────────────────────────────────────────
const ViewModalOverlay = styled(ModalOverlay)``;
const ViewModalBox = styled.div`
  background: white; border-radius: 12px; width: 720px; max-width: 96vw; max-height: 88vh;
  display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(0,0,0,0.2);
  overflow: hidden; animation: ${fadeIn} 0.2s ease forwards;
`;
const ViewModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 15px 22px; border-bottom: 1px solid #e5e7eb; background: #f9fafb; flex-shrink: 0;
`;
const ViewModalBody = styled.div`overflow-y: auto; flex: 1; padding: 22px 26px;`;

const ViewDetailsModal = ({ record, onClose }) => {
  const items = Array.isArray(record.items) ? record.items : [];
  const fmtDate = (d) => {
    try { return d ? new Date(d).toLocaleDateString("en-GB") : "-"; } catch { return "-"; }
  };
  return (
    <ViewModalOverlay onClick={onClose}>
      <ViewModalBox onClick={(e) => e.stopPropagation()}>
        <ViewModalHeader>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>
            🔍 {record.purchase_return_bill_no}
          </div>
          <button onClick={onClose} style={{
            background: "#fee2e2", color: "#dc2626", border: "none",
            padding: "7px 15px", borderRadius: 7, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
          }}>✕ Close</button>
        </ViewModalHeader>
        <ViewModalBody>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 20, fontSize: "0.85rem" }}>
            {[
              ["Bill No", record.purchase_return_bill_no],
              ["Date", fmtDate(record.purchase_return_bill_date || record.created_date)],
              ["GRN", record.grn_number],
              ["Vendor", record.vendor_name || record.vendor_code || "-"],
              ["Outlet", record.outlet_code || "Drug Purchase"],
              ["Status", record.status],
              ["Total Amount", `₹ ${record.purchase_return_amount || "0.00"}`],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ minWidth: 120 }}>
                <div style={{ fontSize: "0.7rem", color: "#7c3aed", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{lbl}</div>
                <div style={{ fontWeight: 600, color: "#111827" }}>{val}</div>
              </div>
            ))}
          </div>

          {record.return_remark && (
            <div style={{ background: "#f5f3ff", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: "0.82rem", color: "#374151" }}>
              <strong>Remark:</strong> {record.return_remark}
            </div>
          )}

          <SectionTitle>📦 Items ({items.length})</SectionTitle>
          <AddedItemsTable>
            <thead>
              <tr>
                <ATh>#</ATh>
                <ATh>Item ID</ATh>
                <ATh>Batch</ATh>
                <ATh>Return Qty</ATh>
                <ATh>Price</ATh>
                <ATh>Total</ATh>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <ATd style={{ color: "#6b7280" }}>{idx + 1}</ATd>
                  <ATd>{it.item_id}</ATd>
                  <ATd><span style={{ background: "#f5f3ff", color: "#6d28d9", padding: "2px 8px", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600 }}>{it.batch_number || "-"}</span></ATd>
                  <ATd>{it.return_qty}</ATd>
                  <ATd>₹ {Number(it.price || 0).toFixed(2)}</ATd>
                  <ATd style={{ fontWeight: 700, color: "#7c3aed" }}>₹ {(Number(it.price || 0) * Number(it.return_qty || 0)).toFixed(2)}</ATd>
                </tr>
              ))}
            </tbody>
          </AddedItemsTable>
        </ViewModalBody>
      </ViewModalBox>
    </ViewModalOverlay>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
function getAuthContext() {
  const raw =
    localStorage.getItem("auth-outlet-code") ||
    localStorage.getItem("outletCode") ||
    localStorage.getItem("outlet_code") ||
    sessionStorage.getItem("auth-outlet-code") ||
    sessionStorage.getItem("outletCode") ||
    "";
  const outletCode =
    !raw || raw === "null" || raw === "None" || raw === "system" || raw === "undefined"
      ? "" : raw.trim();
  const isDrugPurchase = outletCode === "";
  return { outletCode, isDrugPurchase };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const PurchaseReturn = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const { outletCode, isDrugPurchase } = getAuthContext();

  // ── State ──────────────────────────────────────────────────────────────────
  const [outlets, setOutlets]     = useState([]);
  const [vendors, setVendors]     = useState([]);
  const [returns, setReturns]     = useState([]);
  const [showForm, setShowForm]   = useState(false);

  // Form fields
  const [selectedOutlet, setSelectedOutlet]   = useState(isDrugPurchase ? "" : outletCode);
  const [selectedVendor, setSelectedVendor]   = useState(null);
  const [grnNumber, setGrnNumber]             = useState("");
  const [grnSearched, setGrnSearched]         = useState(false);
  const [grnItems, setGrnItems]               = useState([]);   // items from GRN
  const [grnLoading, setGrnLoading]           = useState(false);

  // Currently building item row
  const [selectedItemIdx, setSelectedItemIdx] = useState("");
  const [returnQty, setReturnQty]             = useState("");
  const [returnPrice, setReturnPrice]         = useState("");

  const [addedItems, setAddedItems] = useState([]);

  // Totals
  const [gstAmount,   setGstAmount]   = useState("");
  const [cgstAmount,  setCgstAmount]  = useState("");
  const [sgstAmount,  setSgstAmount]  = useState("");
  const [otherAmount, setOtherAmount] = useState("");
  const [roundAmount, setRoundAmount] = useState("");
  const [returnRemark, setReturnRemark] = useState("");

  // Filters
  const [filterFromDate, setFilterFromDate] = useState(() => {
    const d = new Date(); const yr = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    return `${yr}-04-01`;
  });
  const [filterToDate, setFilterToDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Modals
  const [statusModal, setStatusModal]   = useState(null);
  const [viewModal, setViewModal]       = useState(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedItem = selectedItemIdx !== "" ? grnItems[Number(selectedItemIdx)] : null;

  const itemsSubtotal = addedItems.reduce(
    (s, it) => s + Number(it.price || 0) * Number(it.return_qty || 0), 0
  );
  const grandTotal = (
    itemsSubtotal
    + Number(otherAmount || 0)
    + Number(roundAmount || 0)
  ).toFixed(2);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => { fetchOutlets(); fetchVendors(); fetchReturns(); }, []); // eslint-disable-line

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchOutlets = useCallback(async () => {
    try {
      const r = await apiRequest(`${HmsBaseUrl}get_active_outlets/`, "GET");
      const list = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : []);
      setOutlets(Array.isArray(list) ? list : []);
    } catch { toast.error("Failed to fetch outlets"); }
  }, [HmsBaseUrl]);

  const fetchVendors = useCallback(async () => {
    try {
      const r = await apiRequest(`${HmsBaseUrl}vendors/`, "GET");
      const list = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : []);
      setVendors(Array.isArray(list) ? list : []);
    } catch { toast.error("Failed to fetch vendors"); }
  }, [HmsBaseUrl]);

  const fetchReturns = useCallback(async (extra = {}) => {
    try {
      const params = new URLSearchParams();
      if (extra.from_date) params.append("from_date", extra.from_date);
      if (extra.to_date)   params.append("to_date",   extra.to_date);
      const qs = params.toString();
      const r  = await apiRequest(`${HmsBaseUrl}purchase-return/${qs ? "?" + qs : ""}`, "GET");
      const rows = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : []);
      setReturns(Array.isArray(rows) ? rows : []);
    } catch { toast.error("Failed to fetch purchase returns"); }
  }, [HmsBaseUrl]);

  // ── GRN Search ─────────────────────────────────────────────────────────────
  const handleGrnSearch = async () => {
    if (!grnNumber.trim()) { toast.error("Please enter a GRN number"); return; }
    setGrnLoading(true);
    setGrnItems([]);
    setGrnSearched(false);
    setSelectedItemIdx("");
    setReturnQty(""); setReturnPrice("");
    try {
      const r = await apiRequest(
        `${HmsBaseUrl}grn-items/?grn_number=${encodeURIComponent(grnNumber.trim())}`, "GET"
      );
      const data = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : []);
      if (!data || data.length === 0) {
        toast.warning("No items found for this GRN number");
        setGrnItems([]);
      } else {
        setGrnItems(data);
        toast.success(`Found ${data.length} item(s) for GRN`);
      }
      setGrnSearched(true);
    } catch {
      toast.error("Failed to search GRN");
    } finally {
      setGrnLoading(false);
    }
  };

  // ── Item selection ─────────────────────────────────────────────────────────
  const handleItemSelect = (e) => {
    const idx = e.target.value;
    setSelectedItemIdx(idx);
    setReturnQty("");
    if (idx !== "") {
      const item = grnItems[Number(idx)];
      // Pre-fill return price with Selling_Price
      setReturnPrice(item?.Selling_Price || item?.mrp || "");
    } else {
      setReturnPrice("");
    }
  };

  // ── Add item to list ───────────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!selectedItem)         { toast.error("Please select a product"); return; }
    const qty   = Number(returnQty);
    const price = Number(returnPrice);
    if (!qty || qty <= 0)      { toast.error("Enter a valid return quantity"); return; }
    if (!price || price <= 0)  { toast.error("Enter a valid return price"); return; }
    if (qty > selectedItem.available_qty) {
      toast.error(`Return qty (${qty}) exceeds available stock (${selectedItem.available_qty})`); return;
    }
    const dup = addedItems.find(
      (it) => it.item_id === selectedItem.item_id && it.batch_number === selectedItem.batch_number
    );
    if (dup) { toast.warning("This batch is already added"); return; }

    setAddedItems([...addedItems, {
      stock_id:      selectedItem.stock_id,
      item_id:       selectedItem.item_id,
      item_name:     selectedItem.item_name,
      batch_number:  selectedItem.batch_number,
      hsn_code:      selectedItem.hsn_code,
      expiry_date:   selectedItem.expiry_date,
      available_qty: selectedItem.available_qty,
      return_qty:    qty,
      price:         price,
    }]);
    setSelectedItemIdx(""); setReturnQty(""); setReturnPrice("");
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedVendor)        { toast.error("Please select a vendor"); return; }
    if (!grnNumber.trim())      { toast.error("Please enter a GRN number"); return; }
    if (!grnSearched)           { toast.error("Please search GRN first"); return; }
    if (addedItems.length === 0){ toast.error("Add at least one item"); return; }

    try {
      const res = await apiRequest(`${HmsBaseUrl}purchase-return/`, "POST", {
        outlet_code:   selectedOutlet,
        vendor_code:   selectedVendor.vendor_code || selectedVendor.code || "",
        vendor_name:   selectedVendor.vendor_name || selectedVendor.name || "",
        grn_number:    grnNumber.trim(),
        return_remark: returnRemark,
        gst_amount:    gstAmount  || 0,
        cgst_amount:   cgstAmount || 0,
        sgst_amount:   sgstAmount || 0,
        other_amount:  otherAmount || 0,
        round_amount:  roundAmount || 0,
        items: addedItems.map((it) => ({
          stock_id:      it.stock_id,
          item_id:       it.item_id,
          batch_number:  it.batch_number,
          return_qty:    it.return_qty,
          price:         it.price,
        })),
      });

      if (res?.success || res?.data?.success) {
        toast.success("Purchase return created successfully");
        handleCancelForm();
        fetchReturns();
      } else {
        const err = res?.error || res?.data?.error;
        toast.error(Array.isArray(err) ? err.join(", ") : err || "Failed to save");
      }
    } catch { toast.error("Failed to save purchase return"); }
  };

  // ── Cancel form ────────────────────────────────────────────────────────────
  const handleCancelForm = () => {
    setSelectedOutlet(isDrugPurchase ? "" : outletCode);
    setSelectedVendor(null);
    setGrnNumber(""); setGrnSearched(false); setGrnItems([]);
    setSelectedItemIdx(""); setReturnQty(""); setReturnPrice("");
    setAddedItems([]);
    setGstAmount(""); setCgstAmount(""); setSgstAmount("");
    setOtherAmount(""); setRoundAmount(""); setReturnRemark("");
    setShowForm(false);
  };

  // ── Status update ──────────────────────────────────────────────────────────
  const handleStatusUpdate = async (record, newStatus) => {
    setStatusModal(null);
    try {
      const res = await apiRequest(`${HmsBaseUrl}purchase-return/`, "PUT", {
        purchase_return_bill_no: record.purchase_return_bill_no,
        status: newStatus,
      });
      if (res?.success || res?.data?.success) {
        toast.success(`Status updated to "${newStatus}"`);
        fetchReturns();
      } else {
        toast.error(res?.error || res?.data?.error || "Failed to update status");
      }
    } catch { toast.error("Failed to update status"); }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getOutletName = (code) => {
    if (!code || code === "null" || code === "") return "Drug Purchase";
    const o = outlets.find((x) => x.outlet_code === code);
    return o ? o.outlet_name : code;
  };
  const fmtDate = (d) => {
    try { return d ? new Date(d).toLocaleDateString("en-GB") : "-"; } catch { return "-"; }
  };
  const fmtExpiry = (d) => {
    if (!d) return "-";
    try { return new Date(d).toLocaleDateString("en-GB", { month: "2-digit", year: "numeric" }); }
    catch { return "-"; }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>

        {/* Header */}
        <PageHeader>
          <div>
            <PageTitle>↩️ Purchase Return</PageTitle>
            <PageSubtitle>
              {getOutletName(outletCode)} — manage purchase returns to vendors
            </PageSubtitle>
          </div>
          {!showForm && (
            <NewReturnBtn onClick={() => setShowForm(true)}>+ New Purchase Return</NewReturnBtn>
          )}
        </PageHeader>

        {/* Form Panel */}
        {showForm && (
          <FormPanel>
            <FormPanelBody>

              {/* Row 1: Outlet + Vendor */}
              <FormRow columns="1fr 1fr" style={{ marginBottom: 18 }}>
                <InputWrapper>
                  <Label required>Outlet</Label>
                  {isDrugPurchase ? (
                    <FilterSelect
                      style={{ width: "100%", padding: "9px 10px", fontSize: "0.9rem" }}
                      value={selectedOutlet}
                      onChange={(e) => setSelectedOutlet(e.target.value)}
                    >
                      <option value="">-- Drug Purchase --</option>
                      {outlets.map((o) => (
                        <option key={o.outlet_code} value={o.outlet_code}>{o.outlet_name}</option>
                      ))}
                    </FilterSelect>
                  ) : (
                    <ReadonlyInput type="text" value={getOutletName(outletCode)} readOnly />
                  )}
                </InputWrapper>

                <InputWrapper>
                  <Label required>Vendor</Label>
                  <FilterSelect
                    style={{ width: "100%", padding: "9px 10px", fontSize: "0.9rem" }}
                    value={selectedVendor ? (selectedVendor.vendor_code || selectedVendor.code || "") : ""}
                    onChange={(e) => {
                      const code = e.target.value;
                      if (!code) { setSelectedVendor(null); return; }
                      const v = vendors.find((x) => (x.vendor_code || x.code) === code);
                      setSelectedVendor(v || null);
                    }}
                  >
                    <option value="">-- Select Vendor --</option>
                    {vendors.map((v) => {
                      const code = v.vendor_code || v.code || "";
                      const name = v.vendor_name || v.name || code;
                      return <option key={code} value={code}>{name}</option>;
                    })}
                  </FilterSelect>
                </InputWrapper>
              </FormRow>

              {/* Vendor Info Box */}
              {selectedVendor && (
                <VendorInfoBox>
                  <VendorInfoItem>
                    <VendorInfoLabel>Vendor Name</VendorInfoLabel>
                    <VendorInfoValue>{selectedVendor.vendor_name || selectedVendor.name || "-"}</VendorInfoValue>
                  </VendorInfoItem>
                  {(selectedVendor.address1 || selectedVendor.address) && (
                    <VendorInfoItem>
                      <VendorInfoLabel>Address 1</VendorInfoLabel>
                      <VendorInfoValue>{selectedVendor.address1 || selectedVendor.address}</VendorInfoValue>
                    </VendorInfoItem>
                  )}
                  {selectedVendor.address2 && (
                    <VendorInfoItem>
                      <VendorInfoLabel>Address 2</VendorInfoLabel>
                      <VendorInfoValue>{selectedVendor.address2}</VendorInfoValue>
                    </VendorInfoItem>
                  )}
                  {(selectedVendor.phone || selectedVendor.contact_number || selectedVendor.mobile) && (
                    <VendorInfoItem>
                      <VendorInfoLabel>Phone</VendorInfoLabel>
                      <VendorInfoValue>
                        📞 {selectedVendor.phone || selectedVendor.contact_number || selectedVendor.mobile}
                      </VendorInfoValue>
                    </VendorInfoItem>
                  )}
                  {selectedVendor.email && (
                    <VendorInfoItem>
                      <VendorInfoLabel>Email</VendorInfoLabel>
                      <VendorInfoValue>{selectedVendor.email}</VendorInfoValue>
                    </VendorInfoItem>
                  )}
                </VendorInfoBox>
              )}

              {/* GRN Search */}
              <ItemBox>
                <SectionTitle>🔍 GRN Lookup</SectionTitle>
                <FormRow columns="1fr auto" style={{ marginBottom: grnSearched ? 18 : 0, alignItems: "flex-end" }}>
                  <InputWrapper>
                    <Label required>GRN Number</Label>
                    <GrnSearchWrapper>
                      <Input
                        type="text"
                        value={grnNumber}
                        onChange={(e) => {
                          setGrnNumber(e.target.value);
                          setGrnSearched(false);
                          setGrnItems([]);
                          setSelectedItemIdx("");
                        }}
                        placeholder="e.g. IP/2627/00001"
                        onKeyDown={(e) => { if (e.key === "Enter") handleGrnSearch(); }}
                      />
                      <GrnSearchBtn onClick={handleGrnSearch} disabled={grnLoading}>
                        {grnLoading ? "⏳ Searching…" : "🔍 Search GRN"}
                      </GrnSearchBtn>
                    </GrnSearchWrapper>
                  </InputWrapper>
                </FormRow>

                {/* Product selection row — only show after GRN search */}
                {grnSearched && grnItems.length > 0 && (
                  <>
                    <div style={{ fontSize: "0.78rem", color: "#7c3aed", fontWeight: 700, marginBottom: 12 }}>
                      ✅ {grnItems.length} product(s) found — select to add
                    </div>

                    <FormRow columns="2fr 0.8fr 0.8fr 0.7fr 0.7fr 0.7fr auto">
                      <InputWrapper>
                        <Label required>Product Name</Label>
                        <FilterSelect
                          style={{ width: "100%", padding: "8px 10px" }}
                          value={selectedItemIdx}
                          onChange={handleItemSelect}
                        >
                          <option value="">-- Select Product --</option>
                          {grnItems.map((item, idx) => (
                            <option key={`${item.item_id}-${item.batch_number}-${idx}`} value={idx}>
                              {item.item_name} — Batch: {item.batch_number || "-"}
                            </option>
                          ))}
                        </FilterSelect>
                      </InputWrapper>

                      <InputWrapper>
                        <Label>HSN Code</Label>
                        <ReadonlyInput type="text" value={selectedItem?.hsn_code || ""} readOnly placeholder="Auto" />
                      </InputWrapper>

                      <InputWrapper>
                        <Label>Batch No</Label>
                        <ReadonlyInput type="text" value={selectedItem?.batch_number || ""} readOnly placeholder="Auto" />
                      </InputWrapper>

                      <InputWrapper>
                        <Label>Stock Avail</Label>
                        <ReadonlyInput type="text" value={selectedItem != null ? selectedItem.available_qty : ""} readOnly placeholder="Auto" />
                      </InputWrapper>

                      <InputWrapper>
                        <Label>Expiry</Label>
                        <ReadonlyInput type="text" value={selectedItem ? fmtExpiry(selectedItem.expiry_date) : ""} readOnly placeholder="Auto" />
                      </InputWrapper>

                      <InputWrapper>
                        <Label required>Return Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          max={selectedItem?.available_qty}
                          value={returnQty}
                          onChange={(e) => setReturnQty(e.target.value)}
                          placeholder="0"
                        />
                      </InputWrapper>

                      <InputWrapper>
                        <Label required>Return Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={returnPrice}
                          onChange={(e) => setReturnPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      </InputWrapper>

                    </FormRow>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                      <Button type="button" onClick={handleAddItem} style={{ padding: "8px 20px" }}>
                        + Add Item
                      </Button>
                    </div>
                  </>
                )}

                {grnSearched && grnItems.length === 0 && (
                  <div style={{ color: "#d97706", fontSize: "0.83rem", marginTop: 8 }}>
                    ⚠ No items found for this GRN. Please check the GRN number.
                  </div>
                )}
              </ItemBox>

              {/* Added Items Table */}
              {addedItems.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <SectionTitle>🧾 Return Items ({addedItems.length})</SectionTitle>
                  <AddedItemsTable>
                    <thead>
                      <tr>
                        <ATh>#</ATh>
                        <ATh>Product</ATh>
                        <ATh>HSN</ATh>
                        <ATh>Batch</ATh>
                        <ATh>Expiry</ATh>
                        <ATh>Avail Stock</ATh>
                        <ATh>Return Qty</ATh>
                        <ATh>Price</ATh>
                        <ATh>Total</ATh>
                        <ATh>Action</ATh>
                      </tr>
                    </thead>
                    <tbody>
                      {addedItems.map((it, idx) => (
                        <tr key={idx}>
                          <ATd style={{ color: "#6b7280" }}>{idx + 1}</ATd>
                          <ATd style={{ fontWeight: 600, color: "#111827" }}>{it.item_name}</ATd>
                          <ATd style={{ color: "#6b7280" }}>{it.hsn_code || "-"}</ATd>
                          <ATd>
                            <span style={{ background: "#f5f3ff", color: "#6d28d9", padding: "2px 8px", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600 }}>
                              {it.batch_number || "-"}
                            </span>
                          </ATd>
                          <ATd style={{ color: "#6b7280" }}>{fmtExpiry(it.expiry_date)}</ATd>
                          <ATd>{it.available_qty}</ATd>
                          <ATd style={{ color: "#7c3aed", fontWeight: 700 }}>{it.return_qty}</ATd>
                          <ATd>₹ {Number(it.price).toFixed(2)}</ATd>
                          <ATd style={{ fontWeight: 700 }}>₹ {(Number(it.price) * Number(it.return_qty)).toFixed(2)}</ATd>
                          <ATd>
                            <RemoveBtn onClick={() => setAddedItems(addedItems.filter((_, i) => i !== idx))}>
                              ✕ Remove
                            </RemoveBtn>
                          </ATd>
                        </tr>
                      ))}
                    </tbody>
                  </AddedItemsTable>
                </div>
              )}

              {/* Totals + Charges */}
              <TotalsBox>
                <TotalItem>
                  <TotalLabel>Items Subtotal</TotalLabel>
                  <TotalValue>₹ {itemsSubtotal.toFixed(2)}</TotalValue>
                </TotalItem>

                <TotalItem>
                  <TotalLabel>GST Amount</TotalLabel>
                  <Input type="number" min="0" step="0.01" value={gstAmount}
                    onChange={(e) => setGstAmount(e.target.value)} placeholder="0.00"
                    style={{ width: 110, padding: "6px 8px" }} />
                </TotalItem>
                <TotalItem>
                  <TotalLabel>CGST Amount</TotalLabel>
                  <Input type="number" min="0" step="0.01" value={cgstAmount}
                    onChange={(e) => setCgstAmount(e.target.value)} placeholder="0.00"
                    style={{ width: 110, padding: "6px 8px" }} />
                </TotalItem>
                <TotalItem>
                  <TotalLabel>SGST Amount</TotalLabel>
                  <Input type="number" min="0" step="0.01" value={sgstAmount}
                    onChange={(e) => setSgstAmount(e.target.value)} placeholder="0.00"
                    style={{ width: 110, padding: "6px 8px" }} />
                </TotalItem>
                <TotalItem>
                  <TotalLabel>Other</TotalLabel>
                  <Input type="number" min="0" step="0.01" value={otherAmount}
                    onChange={(e) => setOtherAmount(e.target.value)} placeholder="0.00"
                    style={{ width: 100, padding: "6px 8px" }} />
                </TotalItem>
                <TotalItem>
                  <TotalLabel>Round Off</TotalLabel>
                  <Input type="number" step="0.01" value={roundAmount}
                    onChange={(e) => setRoundAmount(e.target.value)} placeholder="0.00"
                    style={{ width: 100, padding: "6px 8px" }} />
                </TotalItem>

                <TotalItem style={{ marginLeft: "auto" }}>
                  <TotalLabel>Total Return Amount</TotalLabel>
                  <TotalValue style={{ fontSize: "1.3rem", color: "#7c3aed" }}>₹ {grandTotal}</TotalValue>
                </TotalItem>
              </TotalsBox>

              {/* Remark */}
              <FormRow columns="1fr" style={{ marginBottom: 20 }}>
                <InputWrapper>
                  <Label>Return Remark</Label>
                  <Input
                    as="textarea"
                    rows={2}
                    value={returnRemark}
                    onChange={(e) => setReturnRemark(e.target.value)}
                    placeholder="Optional remarks..."
                    style={{ resize: "vertical", minHeight: 48 }}
                  />
                </InputWrapper>
              </FormRow>

              <ButtonContainer>
                <Button secondary type="button" onClick={handleCancelForm}>Cancel</Button>
                <Button type="button" onClick={handleSave}>💾 Save Return</Button>
              </ButtonContainer>

            </FormPanelBody>
          </FormPanel>
        )}

        {/* Date Filters */}
        <FilterRow>
          <FilterGroup>
            <FilterLabel>From Date</FilterLabel>
            <FilterInput type="date" value={filterFromDate} onChange={(e) => setFilterFromDate(e.target.value)} />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>To Date</FilterLabel>
            <FilterInput type="date" value={filterToDate} onChange={(e) => setFilterToDate(e.target.value)} />
          </FilterGroup>
          <SearchBtn onClick={() => fetchReturns({ from_date: filterFromDate, to_date: filterToDate })}>
            🔍 Search
          </SearchBtn>
        </FilterRow>

        {/* Status Legend */}
        <div style={{ padding: "10px 24px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["Pending", "Supplier Collected", "Partial Credit Note", "Credit Note Settled"].map((s) => (
            <StatusBadge key={s} $status={s}>{s}</StatusBadge>
          ))}
        </div>

        {/* Records Table */}
        <div style={{ padding: "16px 26px 28px" }}>
          <SectionTitle>
            📋 Purchase Return Records — {getOutletName(outletCode)}
            <span style={{
              background: "#e5e7eb", color: "#6b7280",
              fontSize: "0.75rem", padding: "2px 10px", borderRadius: 12, fontWeight: 600,
            }}>
              {returns.length}
            </span>
          </SectionTitle>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th>Bill No</Th>
                  <Th>GRN No</Th>
                  <Th>Vendor</Th>
                  <Th>Outlet</Th>
                  <Th>Items</Th>
                  <Th>Amount</Th>
                  <Th style={{ textAlign: "center" }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {returns.length === 0 ? (
                  <Tr>
                    <Td colSpan="9" style={{ textAlign: "center", color: "#9ca3af", padding: "32px 0" }}>
                      📭 No purchase return records found
                    </Td>
                  </Tr>
                ) : (
                  returns.map((rec) => {
                    const items = Array.isArray(rec.items) ? rec.items : [];
                    return (
                      <Tr key={rec._id || rec.purchase_return_bill_no}>
                        <Td><StatusBadge $status={rec.status || "Pending"}>{rec.status || "Pending"}</StatusBadge></Td>
                        <Td style={{ color: "#374151" }}>
                          {fmtDate(rec.purchase_return_bill_date || rec.created_date)}
                        </Td>
                        <Td style={{ fontWeight: 700, color: "#7c3aed", fontFamily: "monospace" }}>
                          {rec.purchase_return_bill_no}
                        </Td>
                        <Td style={{ fontFamily: "monospace", color: "#374151" }}>{rec.grn_number || "-"}</Td>
                        <Td>{rec.vendor_name || rec.vendor_code || "-"}</Td>
                        <Td>{getOutletName(rec.outlet_code)}</Td>
                        <Td>
                          <span style={{ color: "#6b7280", fontSize: "0.82rem" }}>
                            {items.length} item{items.length !== 1 ? "s" : ""}
                          </span>
                        </Td>
                        <Td style={{ fontWeight: 700, color: "#111827" }}>
                          ₹ {Number(rec.purchase_return_amount || 0).toFixed(2)}
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          <RowKebabMenu
                            record={rec}
                            onUpdateStatus={() => setStatusModal(rec)}
                            onView={() => setViewModal(rec)}
                          />
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

      {/* Status Update Modal */}
      {statusModal && (
        <StatusUpdateModal
          record={statusModal}
          onConfirm={(newStatus) => handleStatusUpdate(statusModal, newStatus)}
          onClose={() => setStatusModal(null)}
        />
      )}

      {/* View Details Modal */}
      {viewModal && (
        <ViewDetailsModal
          record={viewModal}
          onClose={() => setViewModal(null)}
        />
      )}

    </PageWrapper>
  );
};

export default PurchaseReturn;