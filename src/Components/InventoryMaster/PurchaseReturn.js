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
    $status === "Returned"            ? "#dcfce7"
    : $status === "Supplier Collected"  ? "#dbeafe"
    : $status === "Credit Note Settled" ? "#e0f2fe"
    : $status === "Partial Credit Note" ? "#fef3c7"
    : "#f3e8ff"};
  color: ${({ $status }) =>
    $status === "Returned"            ? "#166534"
    : $status === "Supplier Collected"  ? "#1e40af"
    : $status === "Credit Note Settled" ? "#0369a1"
    : $status === "Partial Credit Note" ? "#92400e"
    : "#6d28d9"};
  border: 1px solid ${({ $status }) =>
    $status === "Returned"            ? "#86efac"
    : $status === "Supplier Collected"  ? "#93c5fd"
    : $status === "Credit Note Settled" ? "#7dd3fc"
    : $status === "Partial Credit Note" ? "#fde68a"
    : "#c4b5fd"};
  &::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: ${({ $status }) =>
      $status === "Returned"            ? "#16a34a"
      : $status === "Supplier Collected"  ? "#2563eb"
      : $status === "Credit Note Settled" ? "#0284c7"
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
  white-space: nowrap;
`;
const ATd = styled.td`
  padding: 9px 10px;
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
const InlineInput = styled.input`
  padding: 5px 7px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.82rem;
  width: 72px;
  outline: none;
  &:focus { border-color: #7c3aed; }
  &.warn { border-color: #d97706; }
`;
const InlineSelect = styled.select`
  padding: 5px 7px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.82rem;
  min-width: 120px;
  outline: none;
  background: white;
  &:focus { border-color: #7c3aed; }
`;
const AddRowBtn = styled.button`
  background: #7c3aed;
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: #6d28d9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
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
  cursor: pointer; color: #374151; transition: background 0.12s;
  &:hover { background: #f5f3ff; color: #7c3aed; }
`;
const KebabDivider = styled.div`height: 1px; background: #f3f4f6; margin: 2px 0;`;

// ─── Modals ───────────────────────────────────────────────────────────────────
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
const ModalText  = styled.p`margin: 0 0 16px; font-size: 0.875rem; color: #6b7280; line-height: 1.6;`;
const ModalBtns  = styled.div`display: flex; gap: 10px; justify-content: flex-end;`;
const ViewModalBox = styled.div`
  background: white; border-radius: 12px; width: 820px; max-width: 96vw; max-height: 88vh;
  display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(0,0,0,0.2);
  overflow: hidden; animation: ${fadeIn} 0.2s ease forwards;
`;
const ViewModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 15px 22px; border-bottom: 1px solid #e5e7eb; background: #f9fafb; flex-shrink: 0;
`;
const ViewModalBody = styled.div`overflow-y: auto; flex: 1; padding: 22px 26px;`;

// ─── Status Update Modal ──────────────────────────────────────────────────────
const StatusUpdateModal = ({ record, onConfirm, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState(record.status || "Returned");
  const statuses = ["Returned", "Supplier Collected", "Partial Credit Note", "Credit Note Settled"];
  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalTitle>📋 Update Return Status</ModalTitle>
        <ModalText>Update status for <strong>{record.purchase_return_bill_no}</strong></ModalText>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>New Status</label>
          <FilterSelect style={{ width: "100%" }} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </FilterSelect>
        </div>
        <ModalBtns>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 7, border: "1.5px solid #d1d5db", background: "white", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>Cancel</button>
          <button onClick={() => onConfirm(selectedStatus)} style={{ padding: "9px 20px", borderRadius: 7, border: "none", background: "#7c3aed", color: "white", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700 }}>Update</button>
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
          <KebabItem onClick={() => handle(onView)}><span>👁</span> View Details</KebabItem>
          <KebabDivider />
          <KebabItem onClick={() => handle(onUpdateStatus)}><span>📋</span> Update Status</KebabItem>
        </KebabMenu>
      )}
    </KebabWrapper>
  );
};

// ─── View Details Modal ───────────────────────────────────────────────────────
const ViewDetailsModal = ({ record, outlets, onClose }) => {
  const items = Array.isArray(record.items) ? record.items : [];
  const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "-"; } catch { return "-"; } };
  const getOutletName = (code) => {
    if (!code || code === "" || code === "null") return "Drug Purchase";
    const o = outlets.find((x) => x.outlet_code === code);
    return o ? o.outlet_name : code;
  };
  return (
    <ModalOverlay onClick={onClose}>
      <ViewModalBox onClick={(e) => e.stopPropagation()}>
        <ViewModalHeader>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>🔍 {record.purchase_return_bill_no}</div>
          <button onClick={onClose} style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "7px 15px", borderRadius: 7, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>✕ Close</button>
        </ViewModalHeader>
        <ViewModalBody>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 20, fontSize: "0.85rem" }}>
            {[
              ["Bill No",   record.purchase_return_bill_no],
              ["Date",      fmtDate(record.purchase_return_bill_date || record.created_date)],
              ["GRN",       record.grn_number],
              ["Vendor",    record.vendor_name || record.vendor_code || "-"],
              ["Outlet",    getOutletName(record.outlet_code)],
              ["Status",    record.status],
              ["Total Amt", `₹ ${Number(record.purchase_return_amount || 0).toFixed(2)}`],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ minWidth: 130 }}>
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
                <ATh>#</ATh><ATh>Item</ATh><ATh>Batch</ATh><ATh>Return Qty</ATh>
                <ATh>Cause</ATh><ATh>Price</ATh><ATh>Total</ATh>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <ATd style={{ color: "#6b7280" }}>{idx + 1}</ATd>
                  <ATd style={{ fontWeight: 600 }}>{it.item_name || `Item #${it.item_id}`}</ATd>
                  <ATd><span style={{ background: "#f5f3ff", color: "#6d28d9", padding: "2px 8px", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600 }}>{it.batch_number || "-"}</span></ATd>
                  <ATd>{it.return_qty}</ATd>
                  <ATd style={{ color: "#6b7280" }}>{it.cause_of_return || "-"}</ATd>
                  <ATd>₹ {Number(it.price || 0).toFixed(2)}</ATd>
                  <ATd style={{ fontWeight: 700, color: "#7c3aed" }}>₹ {(Number(it.price || 0) * Number(it.return_qty || 0)).toFixed(2)}</ATd>
                </tr>
              ))}
            </tbody>
          </AddedItemsTable>
        </ViewModalBody>
      </ViewModalBox>
    </ModalOverlay>
  );
};

// ─── Constants ────────────────────────────────────────────────────────────────
const DRUG_PURCHASE_LABEL = "Drug Purchase";
const DRUG_PURCHASE_VALUE = "__DRUG_PURCHASE__";

const CAUSE_OPTIONS = [
  "Broken", "Damage", "Nearing Expiry", "Non Moving",
  "Price Difference", "Returns", "Shortage",
];

const isDrugPurchaseOutlet = (outlet) =>
  (outlet?.outlet_name || "").trim().toLowerCase() === "drug purchase";

// ─── Auth context ─────────────────────────────────────────────────────────────
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
  const [outlets,       setOutlets]       = useState([]);
  const [vendors,       setVendors]       = useState([]);
  const [returns,       setReturns]       = useState([]);
  const [showForm,      setShowForm]      = useState(false);

  // Form header
  const [selectedOutlet,  setSelectedOutlet]  = useState(isDrugPurchase ? "" : outletCode);
  const [selectedVendor,  setSelectedVendor]  = useState(null);

  // GRN search
  const [grnNumber,   setGrnNumber]   = useState("");
  const [grnLoading,  setGrnLoading]  = useState(false);
  const [grnSearched, setGrnSearched] = useState(false);
  const [grnItems,    setGrnItems]    = useState([]);   // [{...stockRow, return_qty, cause_of_return, added}]

  // Finalised items
  const [addedItems, setAddedItems] = useState([]);

  // Charges
  const [gstAmount,    setGstAmount]    = useState("");
  const [cgstAmount,   setCgstAmount]   = useState("");
  const [sgstAmount,   setSgstAmount]   = useState("");
  const [otherAmount,  setOtherAmount]  = useState("");
  const [roundAmount,  setRoundAmount]  = useState("");
  const [returnRemark, setReturnRemark] = useState("");

  // Filters
  const [filterFromDate, setFilterFromDate] = useState(() => {
    const d = new Date(); const yr = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    return `${yr}-04-01`;
  });
  const [filterToDate, setFilterToDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Modals
  const [statusModal, setStatusModal] = useState(null);
  const [viewModal,   setViewModal]   = useState(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const itemsSubtotal = addedItems.reduce(
    (s, it) => s + Number(it.price || 0) * Number(it.return_qty || 0), 0
  );
  const grandTotal = (
    itemsSubtotal
    + Number(gstAmount  || 0)
    + Number(cgstAmount || 0)
    + Number(sgstAmount || 0)
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
      const filtered = Array.isArray(list)
        ? list.filter((o) => o.outlet_name && !isDrugPurchaseOutlet(o))
        : [];
      setOutlets(filtered);
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

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getOutletName = (code) => {
    if (code === null || code === undefined || code === "" || code === "null") return DRUG_PURCHASE_LABEL;
    const o = outlets.find((x) => x.outlet_code === code);
    return o ? o.outlet_name : code;
  };
  const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "-"; } catch { return "-"; } };
  const fmtExpiry = (d) => {
    if (!d) return "-";
    try { return new Date(d).toLocaleDateString("en-GB", { month: "2-digit", year: "numeric" }); } catch { return "-"; }
  };

  const toSelectVal = (code) => {
    if (code === null || code === undefined) return "";
    if (code === "") return DRUG_PURCHASE_VALUE;
    return code;
  };

  const outletOptions = [
    { value: DRUG_PURCHASE_VALUE, label: DRUG_PURCHASE_LABEL },
    ...outlets.map((o) => ({ value: o.outlet_code, label: o.outlet_name })),
  ];

  // ── GRN Search ─────────────────────────────────────────────────────────────
  const handleGrnSearch = async () => {
    if (!grnNumber.trim()) { toast.error("Please enter a GRN number"); return; }
    setGrnLoading(true);
    setGrnItems([]);
    setGrnSearched(false);
    setAddedItems([]);
    try {
      const r = await apiRequest(
        `${HmsBaseUrl}grn-items/?grn_number=${encodeURIComponent(grnNumber.trim())}`, "GET"
      );
      const data = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : []);
      if (!data || data.length === 0) {
        toast.warning("No items found for this GRN number");
        setGrnItems([]);
      } else {
        // Initialise each row with empty editable fields
        setGrnItems(data.map((item) => ({
          ...item,
          _return_qty: "",
          _cause: "",
        })));
        toast.success(`Found ${data.length} item(s) for GRN`);
      }
      setGrnSearched(true);
    } catch {
      toast.error("Failed to search GRN");
    } finally {
      setGrnLoading(false);
    }
  };

  // ── Update inline row fields ───────────────────────────────────────────────
  const updateGrnRow = (idx, field, value) => {
    setGrnItems((prev) => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  // ── Add a row from GRN table to finalised list ────────────────────────────
  const handleAddRow = (idx) => {
    const item = grnItems[idx];
    if (!item._cause)            { toast.error("Please select a Cause of Return"); return; }
    const qty = Number(item._return_qty);
    if (!qty || qty <= 0)        { toast.error("Enter a valid return quantity"); return; }
    if (qty > item.available_qty) {
      toast.error(`Return qty (${qty}) exceeds available stock (${item.available_qty})`); return;
    }
    const dup = addedItems.find(
      (it) => it.item_id === item.item_id && it.batch_number === item.batch_number
    );
    if (dup) { toast.warning("This batch is already added"); return; }

    setAddedItems((prev) => [...prev, {
      stock_id:        item.stock_id,
      item_id:         item.item_id,
      item_name:       item.item_name,
      batch_number:    item.batch_number,
      hsn_code:        item.hsn_code,
      expiry_date:     item.expiry_date,
      total_stock:     item.total_stock,
      available_qty:   item.available_qty,
      return_qty:      qty,
      price:           Number(item.Selling_Price || item.mrp || 0),
      cause_of_return: item._cause,
    }]);
    // Clear the row fields after adding
    updateGrnRow(idx, "_return_qty", "");
    updateGrnRow(idx, "_cause", "");
    toast.success(`${item.item_name} added`);
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const outletVal = selectedOutlet === DRUG_PURCHASE_VALUE ? "" : selectedOutlet;
    if (!isDrugPurchase && !outletVal) { toast.error("Please select an outlet"); return; }
    if (!selectedVendor)              { toast.error("Please select a vendor"); return; }
    if (!grnNumber.trim())            { toast.error("Please enter a GRN number"); return; }
    if (!grnSearched)                 { toast.error("Please search GRN first"); return; }
    if (addedItems.length === 0)      { toast.error("Add at least one item for return"); return; }

    try {
      const res = await apiRequest(`${HmsBaseUrl}purchase-return/`, "POST", {
        outlet_code:   outletVal,
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
          stock_id:        it.stock_id,
          item_id:         it.item_id,
          batch_number:    it.batch_number,
          return_qty:      it.return_qty,
          price:           it.price,
          cause_of_return: it.cause_of_return,
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

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>

        {/* ── Header ── */}
        <PageHeader>
          <div>
            <PageTitle>↩️ Purchase Return</PageTitle>
            <PageSubtitle>
              {isDrugPurchase ? "Drug Purchase" : getOutletName(outletCode)} — manage purchase returns to vendors
            </PageSubtitle>
          </div>
          {!showForm && (
            <NewReturnBtn onClick={() => setShowForm(true)}>+ New Purchase Return</NewReturnBtn>
          )}
        </PageHeader>

        {/* ── Form Panel ── */}
        {showForm && (
          <FormPanel>
            <FormPanelBody>

              {/* Row 1: Drug Purchase | Outlet + Vendor */}
              <FormRow columns="1fr 1fr 1fr" style={{ marginBottom: 20 }}>

                {/* Drug Purchase column (always shown, readonly label) */}
                <InputWrapper>
                  <Label>Drug Purchase</Label>
                  <ReadonlyInput type="text" value={DRUG_PURCHASE_LABEL} readOnly />
                </InputWrapper>

                {/* Outlet */}
                <InputWrapper>
                  <Label required>Outlet</Label>
                  {isDrugPurchase ? (
                    <FilterSelect
                      style={{ width: "100%", padding: "9px 10px", fontSize: "0.9rem" }}
                      value={toSelectVal(selectedOutlet)}
                      onChange={(e) => {
                        const v = e.target.value;
                        const code = v === DRUG_PURCHASE_VALUE ? "" : v;
                        setSelectedOutlet(code);
                        setGrnNumber(""); setGrnSearched(false); setGrnItems([]); setAddedItems([]);
                      }}
                    >
                      <option value="">-- Select Outlet --</option>
                      {outletOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </FilterSelect>
                  ) : (
                    <ReadonlyInput type="text" value={getOutletName(outletCode)} readOnly />
                  )}
                </InputWrapper>

                {/* Vendor */}
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
                      <VendorInfoLabel>Address</VendorInfoLabel>
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
                      <VendorInfoValue>📞 {selectedVendor.phone || selectedVendor.contact_number || selectedVendor.mobile}</VendorInfoValue>
                    </VendorInfoItem>
                  )}
                  {selectedVendor.email && (
                    <VendorInfoItem>
                      <VendorInfoLabel>Email</VendorInfoLabel>
                      <VendorInfoValue>{selectedVendor.email}</VendorInfoValue>
                    </VendorInfoItem>
                  )}
                  {(selectedVendor.gstin || selectedVendor.gst_number) && (
                    <VendorInfoItem>
                      <VendorInfoLabel>GSTIN</VendorInfoLabel>
                      <VendorInfoValue>{selectedVendor.gstin || selectedVendor.gst_number}</VendorInfoValue>
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
                          setAddedItems([]);
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

                {/* GRN results — inline table to select & add items */}
                {grnSearched && grnItems.length > 0 && (
                  <>
                    <div style={{ fontSize: "0.78rem", color: "#7c3aed", fontWeight: 700, marginBottom: 12 }}>
                      ✅ {grnItems.length} product(s) found for <span style={{ fontFamily: "monospace" }}>{grnNumber}</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <AddedItemsTable>
                        <thead>
                          <tr>
                            <ATh>#</ATh>
                            <ATh>Item Name</ATh>
                            <ATh>HSN Code</ATh>
                            <ATh>Batch No</ATh>
                            <ATh>Batch Stock</ATh>
                            <ATh>Available Qty</ATh>
                            <ATh>Expiry</ATh>
                            <ATh>Price (₹)</ATh>
                            <ATh>Return Qty</ATh>
                            <ATh>Cause of Return</ATh>
                            <ATh>Action</ATh>
                          </tr>
                        </thead>
                        <tbody>
                          {grnItems.map((item, idx) => {
                            const alreadyAdded = addedItems.some(
                              (it) => it.item_id === item.item_id && it.batch_number === item.batch_number
                            );
                            return (
                              <tr key={`${item.item_id}-${item.batch_number}-${idx}`}
                                style={alreadyAdded ? { background: "#f0fdf4" } : {}}>
                                <ATd style={{ color: "#6b7280" }}>{idx + 1}</ATd>
                                <ATd style={{ fontWeight: 600, color: "#111827", minWidth: 160 }}>{item.item_name}</ATd>
                                <ATd style={{ color: "#6b7280" }}>{item.hsn_code || "-"}</ATd>
                                <ATd>
                                  <span style={{ background: "#f5f3ff", color: "#6d28d9", padding: "2px 8px", borderRadius: 4, fontSize: "0.76rem", fontWeight: 600 }}>
                                    {item.batch_number || "-"}
                                  </span>
                                </ATd>
                                {/* Batch Stock = total_stock from collection */}
                                <ATd style={{ color: "#374151", fontWeight: 600 }}>{item.total_stock ?? "-"}</ATd>
                                {/* Available Qty = formula computed on backend */}
                                <ATd style={{ color: item.available_qty <= 0 ? "#dc2626" : "#166534", fontWeight: 700 }}>
                                  {item.available_qty}
                                </ATd>
                                <ATd style={{ color: "#6b7280" }}>{fmtExpiry(item.expiry_date)}</ATd>
                                <ATd>₹ {Number(item.Selling_Price || item.mrp || 0).toFixed(2)}</ATd>
                                <ATd>
                                  {alreadyAdded ? (
                                    <span style={{ color: "#16a34a", fontSize: "0.78rem", fontWeight: 700 }}>✓ Added</span>
                                  ) : (
                                    <InlineInput
                                      type="number"
                                      min="1"
                                      max={item.available_qty}
                                      placeholder="0"
                                      value={item._return_qty}
                                      className={item._return_qty && Number(item._return_qty) > item.available_qty ? "warn" : ""}
                                      onChange={(e) => updateGrnRow(idx, "_return_qty", e.target.value)}
                                    />
                                  )}
                                </ATd>
                                <ATd>
                                  {alreadyAdded ? (
                                    <span style={{ color: "#6b7280", fontSize: "0.78rem" }}>—</span>
                                  ) : (
                                    <InlineSelect
                                      value={item._cause}
                                      onChange={(e) => updateGrnRow(idx, "_cause", e.target.value)}
                                    >
                                      <option value="">-- Select --</option>
                                      {CAUSE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </InlineSelect>
                                  )}
                                </ATd>
                                <ATd>
                                  {alreadyAdded ? (
                                    <RemoveBtn onClick={() => setAddedItems((prev) => prev.filter(
                                      (it) => !(it.item_id === item.item_id && it.batch_number === item.batch_number)
                                    ))}>✕ Remove</RemoveBtn>
                                  ) : (
                                    <AddRowBtn
                                      disabled={item.available_qty <= 0}
                                      onClick={() => handleAddRow(idx)}
                                    >
                                      + Add
                                    </AddRowBtn>
                                  )}
                                </ATd>
                              </tr>
                            );
                          })}
                        </tbody>
                      </AddedItemsTable>
                    </div>
                  </>
                )}

                {grnSearched && grnItems.length === 0 && (
                  <div style={{ color: "#d97706", fontSize: "0.83rem", marginTop: 8 }}>
                    ⚠ No items found for this GRN. Please check the GRN number.
                  </div>
                )}
              </ItemBox>

              {/* Added Items Summary */}
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
                        <ATh>Batch Stock</ATh>
                        <ATh>Return Qty</ATh>
                        <ATh>Price</ATh>
                        <ATh>Cause of Return</ATh>
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
                          <ATd>{it.total_stock ?? it.available_qty}</ATd>
                          <ATd style={{ color: "#7c3aed", fontWeight: 700 }}>{it.return_qty}</ATd>
                          <ATd>₹ {Number(it.price).toFixed(2)}</ATd>
                          <ATd>
                            <span style={{ background: "#faf5ff", color: "#7c3aed", border: "1px solid #c4b5fd", padding: "2px 8px", borderRadius: 4, fontSize: "0.76rem", fontWeight: 600 }}>
                              {it.cause_of_return}
                            </span>
                          </ATd>
                          <ATd style={{ fontWeight: 700, color: "#111827" }}>
                            ₹ {(Number(it.price) * Number(it.return_qty)).toFixed(2)}
                          </ATd>
                          <ATd>
                            <RemoveBtn onClick={() => setAddedItems(addedItems.filter((_, i) => i !== idx))}>✕ Remove</RemoveBtn>
                          </ATd>
                        </tr>
                      ))}
                    </tbody>
                  </AddedItemsTable>
                </div>
              )}

              {/* Totals & Charges */}
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
                  <TotalValue style={{ fontSize: "1.3rem", color: "#7c3aed" }}>
                    ₹ {grandTotal}
                  </TotalValue>
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

        {/* ── Date Filters ── */}
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
          {["Returned", "Supplier Collected", "Partial Credit Note", "Credit Note Settled"].map((s) => (
            <StatusBadge key={s} $status={s}>{s}</StatusBadge>
          ))}
        </div>

        {/* ── Records Table ── */}
        <div style={{ padding: "16px 26px 28px" }}>
          <SectionTitle>
            📋 Purchase Return Records — {isDrugPurchase ? "Drug Purchase" : getOutletName(outletCode)}
            <span style={{ background: "#e5e7eb", color: "#6b7280", fontSize: "0.75rem", padding: "2px 10px", borderRadius: 12, fontWeight: 600 }}>
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
                        <Td><StatusBadge $status={rec.status || "Returned"}>{rec.status || "Returned"}</StatusBadge></Td>
                        <Td style={{ color: "#374151" }}>{fmtDate(rec.purchase_return_bill_date || rec.created_date)}</Td>
                        <Td style={{ fontWeight: 700, color: "#7c3aed", fontFamily: "monospace" }}>{rec.purchase_return_bill_no}</Td>
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

      {statusModal && (
        <StatusUpdateModal
          record={statusModal}
          onConfirm={(newStatus) => handleStatusUpdate(statusModal, newStatus)}
          onClose={() => setStatusModal(null)}
        />
      )}
      {viewModal && (
        <ViewDetailsModal
          record={viewModal}
          outlets={outlets}
          onClose={() => setViewModal(null)}
        />
      )}
    </PageWrapper>
  );
};

export default PurchaseReturn;