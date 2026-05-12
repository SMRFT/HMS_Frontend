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
import styled, { keyframes, createGlobalStyle } from "styled-components";

// ─── Animations ───────────────────────────────────────────────────────────────
const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
`;

// ─── Print Global Style (injected when printing) ──────────────────────────────
// FIX #2: Use a proper React global style approach instead of injecting raw <style>
// This ensures the print target is visible and correctly positioned.
const PrintGlobalStyle = createGlobalStyle`
  @media print {
    body > * { display: none !important; }
    #stock-transfer-print-root { display: block !important; }
    #stock-transfer-print-root * { visibility: visible !important; }
    #stock-transfer-print-root {
      position: fixed;
      inset: 0;
      width: 100%;
      padding: 16px 20px;
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      color: #000;
      background: white;
      z-index: 99999;
    }
  }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const PageHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 20px 28px;
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(13,148,136,0.18);
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
const NewTransferBtn = styled.button`
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
  color: #0d9488;
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
    $status === "Approved" ? "#dcfce7"
    : $status === "Rejected" ? "#fee2e2"
    : "#fef9c3"};
  color: ${({ $status }) =>
    $status === "Approved" ? "#166534"
    : $status === "Rejected" ? "#991b1b"
    : "#854d0e"};
  border: 1px solid ${({ $status }) =>
    $status === "Approved" ? "#86efac"
    : $status === "Rejected" ? "#fca5a5"
    : "#fde047"};
  &::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: ${({ $status }) =>
      $status === "Approved" ? "#16a34a"
      : $status === "Rejected" ? "#dc2626"
      : "#ca8a04"};
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
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
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
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
`;
const SearchBtn = styled.button`
  background: #0d9488;
  color: white;
  border: none;
  padding: 9px 20px;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  height: 36px;
  align-self: flex-end;
  transition: background 0.15s, transform 0.1s;
  &:hover { background: #0f766e; }
`;

const FormPanel = styled.div`
  animation: ${slideDown} 0.3s ease forwards;
  border-bottom: 2px solid #d1fae5;
  background: #f8fffe;
`;
const FormPanelBody = styled.div`
  padding: 22px 26px;
`;

const MedicineBox = styled.div`
  background: #f0fdfa;
  border: 1.5px solid #a7f3d0;
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 20px;
`;

const RelativeWrapper = styled.div`
  position: relative;
`;
const SearchDropdown = styled.div`
  position: absolute;
  z-index: 999;
  background: white;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  max-height: 210px;
  overflow-y: auto;
  width: 100%;
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  top: calc(100% + 3px);
  left: 0;
`;
const DropdownItem = styled.div`
  padding: 9px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  &:last-child { border-bottom: none; }
  &:hover { background: #f0fdfa; color: #0d9488; }
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
  background: #f0fdfa;
  color: #0f766e;
  padding: 10px 12px;
  text-align: left;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 2px solid #a7f3d0;
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
  transition: background 0.15s;
  &:hover { background: #fca5a5; }
`;
const BatchSelect = styled.select`
  padding: 8px 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 7px;
  font-size: 0.85rem;
  color: #374151;
  width: 100%;
  outline: none;
  background: white;
  &:focus { border-color: #0d9488; }
`;
const ReadonlyInput = styled(Input)`
  background: #f3f4f6 !important;
  cursor: not-allowed;
  color: #6b7280;
`;
const StockInfoNote = styled.div`
  font-size: 0.73rem;
  color: #6b7280;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;
const StockWarn = styled(StockInfoNote)`
  color: #d97706;
`;

// ─── Kebab Menu ───────────────────────────────────────────────────────────────
const KebabWrapper = styled.div`
  position: relative;
  display: inline-block;
`;
const KebabBtn = styled.button`
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 6px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  color: #6b7280;
  transition: background 0.15s, border-color 0.15s;
  &:hover { background: #f3f4f6; border-color: #9ca3af; color: #111827; }
`;
const KebabMenu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 9px;
  box-shadow: 0 10px 28px rgba(0,0,0,0.13);
  min-width: 175px;
  z-index: 1000;
  overflow: hidden;
  animation: ${fadeIn} 0.15s ease forwards;
`;
const KebabItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  color: ${({ $danger, $disabled }) =>
    $disabled ? "#9ca3af" : $danger ? "#dc2626" : "#374151"};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
  transition: background 0.12s;
  &:hover {
    background: ${({ $danger, $disabled }) =>
      $disabled ? "none" : $danger ? "#fff1f2" : "#f0fdfa"};
    color: ${({ $danger, $disabled }) =>
      $disabled ? undefined : $danger ? "#b91c1c" : "#0d9488"};
  }
`;
const KebabDivider = styled.div`
  height: 1px;
  background: #f3f4f6;
  margin: 2px 0;
`;

// ─── Print Modal ──────────────────────────────────────────────────────────────
const PrintModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;
const PrintModalBox = styled.div`
  background: white;
  border-radius: 12px;
  width: 780px;
  max-width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,0.22);
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease forwards;
`;
const PrintModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 22px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
`;
const PrintModalTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
`;
const PrintModalActions = styled.div`
  display: flex;
  gap: 8px;
`;
const PrintModalCloseBtn = styled.button`
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 7px 15px;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  &:hover { background: #fca5a5; }
`;
const PrintModalPrintBtn = styled.button`
  background: #0d9488;
  color: white;
  border: none;
  padding: 7px 17px;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover { background: #0f766e; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
const PrintModalBody = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 24px 28px;
  background: #f0f0f0;
`;

// ─── Slip Paper (preview in modal) ───────────────────────────────────────────
const SlipPaper = styled.div`
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.14);
  padding: 28px 32px;
  font-family: "Courier New", Courier, monospace;
  font-size: 12px;
  color: #111;
  line-height: 1.55;
  max-width: 680px;
  margin: 0 auto;
  min-height: 400px;
`;

// ─── Confirmation Modal ───────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1050;
  display: flex; align-items: center; justify-content: center;
`;
const ModalBox = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px 34px;
  max-width: 440px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: ${fadeIn} 0.18s ease forwards;
`;
const ModalTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
`;
const ModalText = styled.p`
  margin: 0 0 22px;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
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
        <button onClick={onClose} style={{
          padding: "9px 20px", borderRadius: 7, border: "1.5px solid #d1d5db",
          background: "white", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
        }}>Cancel</button>
        <button onClick={onConfirm} style={{
          padding: "9px 20px", borderRadius: 7, border: "none",
          background: confirmColor || "#0d9488", color: "white",
          cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
        }}>{confirmLabel || "Confirm"}</button>
      </ModalBtns>
    </ModalBox>
  </ModalOverlay>
);

// ─── Drug Purchase sentinel ───────────────────────────────────────────────────
const DRUG_PURCHASE_LABEL = "Drug Purchase";
const DRUG_PURCHASE_VALUE = "__DRUG_PURCHASE__";

// ─── Normalize outlet name list for duplicate detection ───────────────────────
// FIX #1: Case-insensitive comparison to remove any "drug purchase" variant from API list
const isDrugPurchaseOutlet = (outlet) => {
  const name = (outlet?.outlet_name || "").trim().toLowerCase();
  return name === "drug purchase";
};

// ─── Parse items from any format ─────────────────────────────────────────────
const normalizeTransferItems = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "object") return [raw];
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw);
      if (Array.isArray(p)) return p.filter(Boolean);
      if (typeof p === "object") return [p];
    } catch { /* continue */ }
    try {
      const matches = [...raw.matchAll(/OrderedDict\(\[(.*?)\]\)/gs)];
      if (matches.length) {
        return matches.map((match) => {
          const content = match[1];
          const pairs = [...content.matchAll(/\('([^']+)',\s*('?[^,)']+'?|[\d.]+)\)/g)];
          const obj = {};
          pairs.forEach(([, key, val]) => {
            let v = val.trim();
            if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
            if (!isNaN(v) && v !== "") v = Number(v);
            obj[key] = v;
          });
          return obj;
        }).filter((item) => Object.keys(item).length > 0);
      }
    } catch { /* ignore */ }
  }
  return [];
};

// ─── Slip Content (shared by modal preview & hidden print div) ────────────────
const SlipContent = ({ slip, items, getOutletName }) => {
  const RULE  = "─".repeat(72);
  const RULE2 = "═".repeat(72);

  const totalQty = items.reduce(
    (s, it) => s + Number(it.transferred_out_quantity || it.transfer_quantity || 0), 0
  );
  const totalAmt = items.reduce((s, it) => {
    const qty  = Number(it.transferred_out_quantity || it.transfer_quantity || 0);
    const rate = Number(it.Selling_Price || it.selling_price || it.mrp || 0);
    return s + qty * rate;
  }, 0);

  const fmtExpiry = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString("en-GB", { month: "2-digit", year: "numeric" });
    } catch { return "-"; }
  };

  const fmtDate = (d) => {
    try {
      return d
        ? new Date(d).toLocaleDateString("en-GB")
        : new Date().toLocaleDateString("en-GB");
    } catch { return "-"; }
  };

  // Grid: serial | name | batch | expiry | qty | s.rate | total
  const COL = "28px 1fr 90px 62px 44px 76px 84px";

  const cellStyle = (extra = {}) => ({
    fontFamily: "Courier New, monospace",
    fontSize: 11.5,
    lineHeight: 1.55,
    color: "#111",
    ...extra,
  });

  return (
    <div style={cellStyle()}>
      {/* Header */}
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 15, marginBottom: 2 }}>
        SHANMUGA HOSPITAL LIMITED
      </div>
      <div style={{ textAlign: "center", fontSize: 11, marginBottom: 8 }}>04272706666</div>

      <div style={{ fontSize: 11, whiteSpace: "pre", overflowX: "hidden" }}>{RULE2}</div>
      <div style={{ fontSize: 11, whiteSpace: "pre", overflowX: "hidden" }}>{RULE2}</div>

      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 13.5, margin: "6px 0" }}>
        STOCK TRANSFER SLIP
      </div>

      <div style={{ fontSize: 11, whiteSpace: "pre", overflowX: "hidden" }}>{RULE2}</div>
      <div style={{ fontSize: 11, whiteSpace: "pre", marginBottom: 10, overflowX: "hidden" }}>{RULE2}</div>

      {/* Meta row 1 */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 11.5 }}>
        <span>Source&nbsp;&nbsp;&nbsp;&nbsp;: <strong>{getOutletName(slip.from_outlet ?? slip.outlet_code)}</strong></span>
        <span>Date : <strong>{fmtDate(slip.created_date)}</strong></span>
      </div>
      {/* Meta row 2 */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 11.5 }}>
        <span>Destination : <strong>{getOutletName(slip.to_outlet)}</strong></span>
        <span>Ref.&nbsp; : <strong>{slip.transfer_ref_number}</strong></span>
      </div>

      {/* Right-aligned "Company / Total" label row */}
      <div style={{ fontSize: 11, textAlign: "right", marginBottom: 3 }}>
        Company&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total
      </div>

      <div style={{ fontSize: 11, whiteSpace: "pre", overflowX: "hidden" }}>{RULE2}</div>
      <div style={{ fontSize: 11, whiteSpace: "pre", marginBottom: 5, overflowX: "hidden" }}>{RULE}</div>

      {/* Column Headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: COL,
        gap: "4px",
        fontWeight: "bold",
        fontSize: 11,
        marginBottom: 3,
      }}>
        <span>Sl</span>
        <span>Particulars</span>
        <span>Batch</span>
        <span>Expiry</span>
        <span style={{ textAlign: "right" }}>Qty</span>
        <span style={{ textAlign: "right" }}>S.rate</span>
        <span style={{ textAlign: "right" }}>Total</span>
      </div>

      <div style={{ fontSize: 11, whiteSpace: "pre", overflowX: "hidden" }}>{RULE}</div>
      <div style={{ fontSize: 11, whiteSpace: "pre", marginBottom: 6, overflowX: "hidden" }}>{RULE}</div>

      {/* Items */}
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "12px 0", color: "#999", fontSize: 11 }}>
          No items
        </div>
      ) : (
        items.map((item, idx) => {
          const qty   = Number(item.transferred_out_quantity || item.transfer_quantity || 0);
          const rate  = Number(item.Selling_Price || item.selling_price || item.mrp || 0);
          const total = qty * rate;
          return (
            <div key={idx} style={{
              display: "grid",
              gridTemplateColumns: COL,
              gap: "4px",
              fontSize: 11,
              marginBottom: 4,
              alignItems: "start",
            }}>
              <span>{idx + 1}</span>
              <span style={{ wordBreak: "break-word" }}>
                {item.item_name || `Item #${item.item_id}`}
              </span>
              <span>{item.batch_number || "-"}</span>
              <span>{fmtExpiry(item.expiry_date)}</span>
              <span style={{ textAlign: "right" }}>{qty}</span>
              <span style={{ textAlign: "right" }}>{rate ? rate.toFixed(2) : "-"}</span>
              <span style={{ textAlign: "right" }}>{rate ? total.toFixed(2) : "-"}</span>
            </div>
          );
        })
      )}

      <div style={{ fontSize: 11, whiteSpace: "pre", marginTop: 6, overflowX: "hidden" }}>{RULE}</div>
      <div style={{ fontSize: 11, whiteSpace: "pre", marginBottom: 6, overflowX: "hidden" }}>{RULE}</div>

      {/* Prepared By / Remarks */}
      <div style={{ fontSize: 11, marginBottom: 2 }}>Prepared By : {slip.created_by || "-"}</div>
      <div style={{ fontSize: 11, marginBottom: 8 }}>Remarks :</div>

      <div style={{ fontSize: 11, whiteSpace: "pre", overflowX: "hidden" }}>{RULE2}</div>
      <div style={{ fontSize: 11, whiteSpace: "pre", marginBottom: 6, overflowX: "hidden" }}>{RULE2}</div>

      {/* Totals footer */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        fontWeight: "bold",
      }}>
        <span>{totalAmt > 0 ? totalAmt.toFixed(2) : ""}</span>
        <span>
          {totalQty}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          {totalAmt > 0 ? totalAmt.toFixed(2) : ""}
        </span>
      </div>

      <div style={{ fontSize: 11, whiteSpace: "pre", marginTop: 5, overflowX: "hidden" }}>{RULE}</div>
      <div style={{ fontSize: 11, whiteSpace: "pre", overflowX: "hidden" }}>{RULE}</div>
    </div>
  );
};

// ─── Print Slip Modal ─────────────────────────────────────────────────────────
// FIX #2: Instead of window.print() hiding everything,
// we render a hidden <div id="stock-transfer-print-root"> outside the modal
// with the slip content. The PrintGlobalStyle CSS makes ONLY that div visible
// during print, so the modal overlay doesn't interfere.
const PrintSlipModal = ({ slip, getOutletName, onClose, HmsBaseUrl }) => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const printRootRef          = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await apiRequest(
          `${HmsBaseUrl}stock-transfer/?transfer_ref_number=${encodeURIComponent(slip.transfer_ref_number)}`,
          "GET"
        );
        if (cancelled) return;

        const rows  = res?.data?.data ?? (Array.isArray(res?.data) ? res.data : []);
        const found = Array.isArray(rows)
          ? rows.find((t) => t.transfer_ref_number === slip.transfer_ref_number)
          : rows;

        let enrichedItems = found?.items ?? slip?.items ?? [];
        if ((!enrichedItems || enrichedItems.length === 0) && found?.items_details) {
          enrichedItems = found.items_details;
        }
        const finalItems = Array.isArray(enrichedItems)
          ? enrichedItems
          : normalizeTransferItems(enrichedItems);

        setItems(finalItems);
      } catch (err) {
        console.warn("[PrintSlipModal] Error fetching slip details, using fallback:", err);
        if (!cancelled) setItems(normalizeTransferItems(slip?.items ?? []));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetail();
    return () => { cancelled = true; };
  }, [slip.transfer_ref_number, slip.items, HmsBaseUrl]); // eslint-disable-line

  const handlePrint = () => {
    window.print();
  };

  const slipNode = (
    <SlipContent slip={slip} items={items} getOutletName={getOutletName} />
  );

  return (
    <>
      {/* Global print style: only #stock-transfer-print-root is visible during print */}
      <PrintGlobalStyle />

      {/* Hidden print target rendered outside modal stack — always in DOM when modal is open */}
      <div
        id="stock-transfer-print-root"
        ref={printRootRef}
        style={{
          display: "none",          // hidden on screen
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: "white",
          padding: "16px 20px",
          fontFamily: "Courier New, monospace",
          fontSize: 11,
          color: "#000",
        }}
      >
        {!loading && slipNode}
      </div>

      {/* Visible modal UI */}
      <PrintModalOverlay onClick={onClose}>
        <PrintModalBox onClick={(e) => e.stopPropagation()}>

          <PrintModalHeader>
            <PrintModalTitle>🖨️ Stock Transfer Slip — {slip.transfer_ref_number}</PrintModalTitle>
            <PrintModalActions>
              <PrintModalPrintBtn onClick={handlePrint} disabled={loading}>
                🖨️ Print
              </PrintModalPrintBtn>
              <PrintModalCloseBtn onClick={onClose}>✕ Close</PrintModalCloseBtn>
            </PrintModalActions>
          </PrintModalHeader>

          <PrintModalBody>
            {loading ? (
              <div style={{
                textAlign: "center",
                padding: "60px 0",
                color: "#6b7280",
                fontFamily: "Courier New",
                fontSize: 13,
              }}>
                ⏳ Loading slip details…
              </div>
            ) : (
              <SlipPaper>
                {slipNode}
              </SlipPaper>
            )}
          </PrintModalBody>

        </PrintModalBox>
      </PrintModalOverlay>
    </>
  );
};

// ─── Kebab Row Menu ───────────────────────────────────────────────────────────
const RowKebabMenu = ({ transfer, canApprove, onApprove, onReject, onPrint }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const status     = transfer.is_verified || "Draft";
  const isApproved = status === "Approved";
  const isRejected = status === "Rejected";
  const isDraft    = status === "Draft";

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handle = (fn) => { setOpen(false); fn(); };

  const approveDisabled = !isDraft || !canApprove;
  const rejectDisabled  = isApproved || isRejected;

  return (
    <KebabWrapper ref={ref}>
      <KebabBtn onClick={() => setOpen((v) => !v)} title="Actions">⋮</KebabBtn>
      {open && (
        <KebabMenu>
          <KebabItem
            $disabled={approveDisabled}
            title={
              isApproved ? "Already approved"
              : isRejected ? "Cannot approve a cancelled transfer"
              : !canApprove ? "Only the receiving outlet can approve"
              : "Approve this transfer"
            }
            onClick={() => !approveDisabled && handle(onApprove)}
          >
            <span>✔</span> Approve
          </KebabItem>

          <KebabDivider />

          <KebabItem onClick={() => handle(onPrint)}>
            <span>🖨️</span> Print Slip
          </KebabItem>

          <KebabDivider />

          <KebabItem
            $danger
            $disabled={rejectDisabled}
            title={
              isApproved ? "Approved transfers cannot be cancelled"
              : isRejected ? "Already cancelled"
              : "Cancel this transfer"
            }
            onClick={() => !rejectDisabled && handle(onReject)}
          >
            <span>✕</span> Cancel Transfer
          </KebabItem>
        </KebabMenu>
      )}
    </KebabWrapper>
  );
};

// ─── Auth Context ─────────────────────────────────────────────────────────────
function getAuthContext() {
  const raw =
    localStorage.getItem("auth-outlet-code") ||
    sessionStorage.getItem("auth-outlet-code") || "";
  const outletCode = (!raw || raw === "null" || raw === "None" || raw === "system") ? "" : raw;
  return { outletCode, isDrugPurchase: outletCode === "" };
}

// ─── Main Component ───────────────────────────────────────────────────────────
const StockTransfer = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const { outletCode, isDrugPurchase } = getAuthContext();

  // ── State ──────────────────────────────────────────────────────────────────
  const [outlets, setOutlets]     = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [showForm, setShowForm]   = useState(false);

  // null  = Drug Purchase user hasn't picked a From Outlet yet (show warning, disable search)
  // ""    = Drug Purchase selected as From Outlet (valid — send outlet_code: "" to API)
  // "OLETXXX" = real outlet selected
  const [fromOutlet, setFromOutlet] = useState(isDrugPurchase ? null : outletCode);
  const [toOutlet, setToOutlet]     = useState("");
  const [addedItems, setAddedItems] = useState([]);

  // Medicine search
  const [medicineSearch, setMedicineSearch]   = useState("");
  const [medicineResults, setMedicineResults] = useState([]);
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Batch / stock
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchIdx, setSelectedBatchIdx] = useState("");
  const [transferQty, setTransferQty]           = useState("");

  // Filters — default to current financial-year start → today
  const [filterFromDate, setFilterFromDate] = useState(() => {
    const d  = new Date();
    const yr = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    return `${yr}-04-01`;
  });
  const [filterToDate, setFilterToDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  const [printSlip, setPrintSlip]       = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const medicineSearchRef = useRef(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedBatch =
    selectedBatchIdx !== "" ? availableBatches[selectedBatchIdx] : null;

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => { fetchOutlets(); }, []); // eslint-disable-line
  useEffect(() => { fetchTransfers(); }, []); // eslint-disable-line

  useEffect(() => {
    const h = (e) => {
      if (medicineSearchRef.current && !medicineSearchRef.current.contains(e.target))
        setShowMedDropdown(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getOutletName = useCallback((code) => {
    if (code === null || code === undefined || code === "" || code === "null") {
      return DRUG_PURCHASE_LABEL;
    }
    const o = outlets.find((x) => x.outlet_code === code);
    return o ? o.outlet_name : code;
  }, [outlets]);

  // ── API: fetch outlets ─────────────────────────────────────────────────────
  const fetchOutlets = useCallback(async () => {
    try {
      const r = await apiRequest(`${HmsBaseUrl}get_active_outlets/`, "GET");
      const list = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : []);
      // FIX #1: Strip any outlet from the DB whose name matches "drug purchase"
      // (case-insensitive) — we add our own sentinel option in the dropdown.
      const filtered = Array.isArray(list)
        ? list.filter((o) => o.outlet_name && !isDrugPurchaseOutlet(o))
        : [];
      setOutlets(filtered);
    } catch {
      toast.error("Failed to fetch outlets");
    }
  }, [HmsBaseUrl]);

  // ── API: fetch transfers ───────────────────────────────────────────────────
  const fetchTransfers = useCallback(async (extra = {}) => {
    try {
      const params = new URLSearchParams();
      if (extra.from_date) params.append("from_date", extra.from_date);
      if (extra.to_date)   params.append("to_date",   extra.to_date);
      const qs  = params.toString();
      const res = await apiRequest(
        `${HmsBaseUrl}stock-transfer/${qs ? "?" + qs : ""}`, "GET"
      );
      const rows = res?.data?.data ?? (Array.isArray(res?.data) ? res.data : []);
      setTransfers(Array.isArray(rows) ? rows : []);
    } catch {
      toast.error("Failed to fetch transfers");
    }
  }, [HmsBaseUrl]);

  // ── API: search medicines ──────────────────────────────────────────────────
  const searchMedicines = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setMedicineResults([]); setShowMedDropdown(false); return;
    }
    // null means "not selected yet" — don't search
    if (fromOutlet === null) { setMedicineResults([]); setShowMedDropdown(false); return; }
    try {
      const params = new URLSearchParams({ search: query });
      // "" = Drug Purchase (outlet_code is empty string in DB), real outlet = its code
      params.append("outlet_code", fromOutlet);
      const res = await apiRequest(`${HmsBaseUrl}pharmacy-stock/?${params}`, "GET");
      const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      const seen = new Set();
      const unique = raw.filter((s) => {
        if (seen.has(s.item_id)) return false;
        seen.add(s.item_id); return true;
      });
      setMedicineResults(unique);
      setShowMedDropdown(unique.length > 0);
    } catch {
      setMedicineResults([]);
    }
  }, [HmsBaseUrl, fromOutlet]);

  // ── API: fetch batches for selected item ───────────────────────────────────
  const fetchBatchesForItem = useCallback(async (itemId) => {
    if (fromOutlet === null) return; // not selected yet — shouldn't happen but guard anyway
    try {
      const params = new URLSearchParams({ item_id: itemId });
      // "" = Drug Purchase stocks (outlet_code: "" in DB), real outlet = its code
      params.append("outlet_code", fromOutlet);
      const res = await apiRequest(`${HmsBaseUrl}pharmacy-stock/?${params}`, "GET");
      const stocks = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      const batches = stocks
        .filter((s) => Number(s.available_qty ?? 0) > 0)
        .map((s) => ({
          stock_id:      s.stock_id,
          batch_number:  s.batch_number || "-",
          hsn_code:      s.hsn_code     || "",
          outlet_code:   s.outlet_code  || "",
          mrp:           s.mrp          || 0,
          Selling_Price: s.Selling_Price || s.selling_price || s.mrp || 0,
          available_qty: Number(s.available_qty ?? 0),
          expiry_date:   s.expiry_date  || null,
        }));
      setAvailableBatches(batches);
      setSelectedBatchIdx(batches.length === 1 ? 0 : "");
    } catch {
      setAvailableBatches([]); setSelectedBatchIdx("");
    }
  }, [HmsBaseUrl, fromOutlet]);

  // ── Handlers: medicine search ──────────────────────────────────────────────
  const handleMedicineSearch = (e) => {
    const val = e.target.value;
    setMedicineSearch(val);
    setSelectedMedicine(null);
    setAvailableBatches([]); setSelectedBatchIdx("");
    searchMedicines(val);
  };

  const handleSelectMedicine = (med) => {
    setSelectedMedicine(med);
    setMedicineSearch(med.item_name);
    setShowMedDropdown(false);
    fetchBatchesForItem(med.item_id);
  };

  const handleBatchChange = (e) => {
    const v = e.target.value;
    setSelectedBatchIdx(v === "" ? "" : Number(v));
    setTransferQty("");
  };

  // null → "" (placeholder option), "" → DRUG_PURCHASE_VALUE, real code → itself
  const toSelectVal = (code) => {
    if (code === null || code === undefined) return "";
    if (code === "") return DRUG_PURCHASE_VALUE;
    return code;
  };

  const handleFromOutletChange = (selectVal) => {
    // DRUG_PURCHASE_VALUE sentinel → "" (Drug Purchase outlet_code)
    // "-- Select --" placeholder (empty string from <option value="">) → null (not chosen)
    // Real outlet code → use as-is
    const code = selectVal === DRUG_PURCHASE_VALUE ? "" : (selectVal === "" ? null : selectVal);
    setFromOutlet(code);
    setMedicineSearch(""); setSelectedMedicine(null);
    setAvailableBatches([]); setSelectedBatchIdx(""); setTransferQty("");
  };

  const handleToOutletChange = (selectVal) => {
    const code = selectVal === DRUG_PURCHASE_VALUE ? "" : selectVal;
    setToOutlet(code);
  };

  // ── Handlers: add / remove item ────────────────────────────────────────────
  const handleAddItem = () => {
    if (!selectedMedicine)                         { toast.error("Please select a medicine"); return; }
    if (selectedBatchIdx === "" || !selectedBatch) { toast.error("Please select a batch"); return; }
    const qty = Number(transferQty);
    if (!qty || qty <= 0)                          { toast.error("Enter a valid transfer quantity"); return; }
    if (qty > selectedBatch.available_qty) {
      toast.error(`Qty (${qty}) exceeds available stock (${selectedBatch.available_qty})`); return;
    }
    const duplicate = addedItems.find(
      (i) => i.item_id === selectedMedicine.item_id && i.batch_number === selectedBatch.batch_number
    );
    if (duplicate) { toast.warning("This batch is already added"); return; }

    setAddedItems([...addedItems, {
      stock_id:          selectedBatch.stock_id,
      item_id:           selectedMedicine.item_id,
      item_name:         selectedMedicine.item_name,
      batch_number:      selectedBatch.batch_number,
      hsn_code:          selectedBatch.hsn_code,
      outlet_code:       selectedBatch.outlet_code,
      outlet_stock:      selectedBatch.available_qty,
      transfer_quantity: qty,
    }]);

    setMedicineSearch(""); setSelectedMedicine(null);
    setAvailableBatches([]); setSelectedBatchIdx(""); setTransferQty("");
  };

  const handleRemoveItem = (idx) =>
    setAddedItems(addedItems.filter((_, i) => i !== idx));

  // ── Handlers: save ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (fromOutlet === null) {
      toast.error("Please select From Outlet"); return;
    }
    if (!toOutlet && toOutlet !== "") {
      toast.error("Please select To Outlet"); return;
    }
    if (toOutlet === "" && fromOutlet === "") {
      toast.error("From Outlet and To Outlet cannot both be Drug Purchase"); return;
    }
    if (fromOutlet !== "" && fromOutlet === toOutlet) {
      toast.error("From Outlet and To Outlet cannot be the same"); return;
    }
    if (addedItems.length === 0) {
      toast.error("Add at least one medicine"); return;
    }

    try {
      const res = await apiRequest(`${HmsBaseUrl}stock-transfer/`, "POST", {
        from_outlet: fromOutlet,
        to_outlet:   toOutlet,
        items: addedItems.map((i) => ({
          stock_id:          i.stock_id,
          item_id:           i.item_id,
          batch_number:      i.batch_number,
          transfer_quantity: i.transfer_quantity,
          outlet_code:       i.outlet_code !== undefined ? i.outlet_code : fromOutlet,
        })),
      });

      if (res?.success) {
        toast.success("Stock Transfer saved as Draft");
        handleCancelForm();
        fetchTransfers();
      } else {
        const err = res?.error;
        toast.error(Array.isArray(err) ? err.join(", ") : err || "Failed to save");
      }
    } catch {
      toast.error("Failed to save transfer");
    }
  };

  const handleCancelForm = () => {
    setFromOutlet(isDrugPurchase ? null : outletCode);
    setToOutlet("");
    setAddedItems([]);
    setMedicineSearch(""); setSelectedMedicine(null);
    setAvailableBatches([]); setSelectedBatchIdx(""); setTransferQty("");
    setShowForm(false);
  };

  const handleSearch = () =>
    fetchTransfers({ from_date: filterFromDate, to_date: filterToDate });

  // ── Permission helpers ────────────────────────────────────────────────────
  const canApprove = useCallback((t) => {
    if ((t.is_verified || "Draft") !== "Draft") return false;
    if (isDrugPurchase) return true;
    return t.to_outlet === outletCode;
  }, [isDrugPurchase, outletCode]);

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApproveClick = (t) => {
    const status = t.is_verified || "Draft";
    if (status === "Approved") { toast.info("Already approved"); return; }
    if (status === "Rejected") { toast.error("Rejected transfers cannot be approved"); return; }
    if (!canApprove(t)) { toast.warning("Only the receiving outlet can approve"); return; }
    setConfirmModal({ type: "approve", transfer: t });
  };

  const handleApproveConfirm = async () => {
    const transfer = confirmModal?.transfer || {};
    setConfirmModal(null);
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}stock-transfer-action/`, "POST",
        { action: "approve", transfer_ref_number: transfer.transfer_ref_number }
      );
      if (res?.success) {
        toast.success("Transfer approved successfully");
        fetchTransfers();
      } else {
        const err = res?.error;
        toast.error(Array.isArray(err) ? err.join(", ") : err || "Failed to approve");
      }
    } catch { toast.error("Failed to approve transfer"); }
  };

  // ── Cancel / Reject ───────────────────────────────────────────────────────
  const handleRejectClick = (t) => {
    const status = t.is_verified || "Draft";
    if (status === "Approved") { toast.error("Approved transfers cannot be cancelled"); return; }
    if (status === "Rejected") { toast.info("Already cancelled"); return; }
    setConfirmModal({ type: "reject", transfer: t });
  };

  const handleRejectConfirm = async () => {
    const transfer = confirmModal?.transfer || {};
    setConfirmModal(null);
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}stock-transfer-action/`, "POST",
        { action: "reject", transfer_ref_number: transfer.transfer_ref_number }
      );
      if (res?.success) {
        toast.success("Transfer cancelled");
        fetchTransfers();
      } else {
        const err = res?.error;
        toast.error(Array.isArray(err) ? err.join(", ") : err || "Failed to cancel");
      }
    } catch { toast.error("Failed to cancel transfer"); }
  };

  // ── Outlet dropdown options ───────────────────────────────────────────────
  // FIX #1: Only one "Drug Purchase" entry (our sentinel) since API list is filtered above
  const fromOutletOptions = [
    { value: DRUG_PURCHASE_VALUE, label: DRUG_PURCHASE_LABEL },
    ...outlets.map((o) => ({ value: o.outlet_code, label: o.outlet_name })),
  ];

  const toOutletOptions = [
    { value: DRUG_PURCHASE_VALUE, label: DRUG_PURCHASE_LABEL },
    ...outlets.map((o) => ({ value: o.outlet_code, label: o.outlet_name })),
  ].filter((o) => {
    // If fromOutlet is null (not chosen yet), don't exclude anything
    if (fromOutlet === null) return true;
    const code = o.value === DRUG_PURCHASE_VALUE ? "" : o.value;
    return code !== fromOutlet;
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>

        {/* ── Header ── */}
        <PageHeader>
          <div>
            <PageTitle>📦 Stock Transfer</PageTitle>
            <PageSubtitle>
              {getOutletName(outletCode)} — inter-outlet stock transfers
            </PageSubtitle>
          </div>
          {!showForm && (
            <NewTransferBtn onClick={() => setShowForm(true)}>+ New Transfer</NewTransferBtn>
          )}
        </PageHeader>

        {/* ── Form Panel ── */}
        {showForm && (
          <FormPanel>
            <FormPanelBody>

              {/* Outlet selectors */}
              <FormRow columns="1fr 1fr" style={{ marginBottom: 22 }}>
                <InputWrapper>
                  <Label required>From Outlet</Label>
                  {isDrugPurchase ? (
                    <FilterSelect
                      style={{ width: "100%", padding: "9px 10px", fontSize: "0.9rem" }}
                      value={toSelectVal(fromOutlet)}
                      onChange={(e) => handleFromOutletChange(e.target.value)}
                    >
                      <option value="">-- Select From Outlet --</option>
                      {fromOutletOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </FilterSelect>
                  ) : (
                    <ReadonlyInput type="text" value={getOutletName(outletCode)} readOnly />
                  )}
                </InputWrapper>

                <InputWrapper>
                  <Label required>To Outlet</Label>
                  <FilterSelect
                    style={{ width: "100%", padding: "9px 10px", fontSize: "0.9rem" }}
                    value={toSelectVal(toOutlet)}
                    onChange={(e) => handleToOutletChange(e.target.value)}
                  >
                    <option value="">-- Select To Outlet --</option>
                    {toOutletOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </FilterSelect>
                </InputWrapper>
              </FormRow>

              {/* ── Add Medicine ── */}
              <MedicineBox>
                <SectionTitle>💊 Add Medicine</SectionTitle>

                {/* Only warn when Drug Purchase user hasn't chosen a From Outlet yet (null) */}
                {isDrugPurchase && fromOutlet === null && (
                  <div style={{ color: "#d97706", fontSize: "0.82rem", marginBottom: 12 }}>
                    ⚠ Please select a From Outlet first to search medicines.
                  </div>
                )}

                <FormRow columns="2fr 1.1fr 0.9fr 1.1fr 0.8fr auto">

                  <InputWrapper>
                    <Label required>Product Name</Label>
                    <RelativeWrapper ref={medicineSearchRef}>
                      <Input
                        type="text"
                        value={medicineSearch}
                        onChange={handleMedicineSearch}
                        placeholder="Search medicine..."
                        autoComplete="off"
                        disabled={isDrugPurchase && fromOutlet === null}
                      />
                      {showMedDropdown && medicineResults.length > 0 && (
                        <SearchDropdown>
                          {medicineResults.map((med) => (
                            <DropdownItem key={med.item_id} onMouseDown={() => handleSelectMedicine(med)}>
                              <strong>{med.item_name}</strong>
                              {med.available_qty !== undefined && (
                                <span style={{ color: "#6b7280", marginLeft: 8, fontSize: "0.78rem" }}>
                                  (Avail: {med.available_qty})
                                </span>
                              )}
                            </DropdownItem>
                          ))}
                        </SearchDropdown>
                      )}
                    </RelativeWrapper>
                  </InputWrapper>

                  <InputWrapper>
                    <Label>HSN Code</Label>
                    <ReadonlyInput type="text" value={selectedBatch?.hsn_code || ""} readOnly placeholder="Auto-filled" />
                  </InputWrapper>

                  <InputWrapper>
                    <Label>Stock Available</Label>
                    <ReadonlyInput
                      type="text"
                      value={selectedBatch != null ? selectedBatch.available_qty : ""}
                      readOnly
                      placeholder="Auto-filled"
                    />
                    {selectedBatch && selectedBatch.available_qty <= 10 && (
                      <StockWarn>⚠ Low stock</StockWarn>
                    )}
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
                          {availableBatches.map((b, i) => (
                            <option key={b.stock_id || i} value={i}>
                              {b.batch_number} (Avail: {b.available_qty})
                            </option>
                          ))}
                        </BatchSelect>
                        {selectedBatch && (
                          <StockInfoNote>
                            Stock: {selectedBatch.available_qty}
                            {selectedBatch.expiry_date && (
                              <span style={{ color: "#9ca3af" }}>
                                &nbsp;· Exp: {new Date(selectedBatch.expiry_date).toLocaleDateString("en-GB", { month: "2-digit", year: "numeric" })}
                              </span>
                            )}
                          </StockInfoNote>
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
                    {selectedBatch && transferQty && Number(transferQty) > selectedBatch.available_qty && (
                      <StockWarn>Exceeds stock</StockWarn>
                    )}
                  </InputWrapper>

                  <InputWrapper style={{ justifyContent: "flex-end" }}>
                    <Label>&nbsp;</Label>
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      style={{ padding: "8px 18px", fontSize: "0.85rem", whiteSpace: "nowrap" }}
                    >
                      + Add
                    </Button>
                  </InputWrapper>

                </FormRow>
              </MedicineBox>

              {/* ── Added items table ── */}
              {addedItems.length > 0 && (
                <div style={{ marginBottom: 22 }}>
                  <SectionTitle>🧾 Added Medicines ({addedItems.length})</SectionTitle>
                  <AddedItemsTable>
                    <thead>
                      <tr>
                        <ATh>#</ATh>
                        <ATh>Product Name</ATh>
                        <ATh>HSN</ATh>
                        <ATh>Available Stock</ATh>
                        <ATh>Batch</ATh>
                        <ATh>Transfer Qty</ATh>
                        <ATh>Action</ATh>
                      </tr>
                    </thead>
                    <tbody>
                      {addedItems.map((item, idx) => (
                        <tr key={idx}>
                          <ATd style={{ color: "#6b7280" }}>{idx + 1}</ATd>
                          <ATd style={{ fontWeight: 600, color: "#111827" }}>{item.item_name}</ATd>
                          <ATd style={{ color: "#6b7280" }}>{item.hsn_code || "-"}</ATd>
                          <ATd>{item.outlet_stock}</ATd>
                          <ATd>
                            <span style={{
                              background: "#f0fdfa", color: "#0f766e",
                              padding: "2px 8px", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600,
                            }}>
                              {item.batch_number || "-"}
                            </span>
                          </ATd>
                          <ATd style={{ color: "#0d9488", fontWeight: 700 }}>
                            {item.transfer_quantity}
                          </ATd>
                          <ATd>
                            <RemoveBtn onClick={() => handleRemoveItem(idx)}>✕ Remove</RemoveBtn>
                          </ATd>
                        </tr>
                      ))}
                    </tbody>
                  </AddedItemsTable>
                </div>
              )}

              <ButtonContainer>
                <Button secondary type="button" onClick={handleCancelForm}>Cancel</Button>
                <Button type="button" onClick={handleSave}>💾 Save Transfer</Button>
              </ButtonContainer>

            </FormPanelBody>
          </FormPanel>
        )}

        {/* ── Date Filters ── */}
        <FilterRow>
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
        <div style={{ padding: "20px 26px 28px" }}>
          <SectionTitle>
            📋 Transfer Records — {getOutletName(outletCode)}
            <span style={{
              background: "#e5e7eb", color: "#6b7280",
              fontSize: "0.75rem", padding: "2px 10px", borderRadius: 12, fontWeight: 600,
            }}>
              {transfers.length}
            </span>
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
                  <Th>Items</Th>
                  <Th style={{ textAlign: "center" }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {transfers.length === 0 ? (
                  <Tr>
                    <Td colSpan="7" style={{ textAlign: "center", color: "#9ca3af", padding: "32px 0" }}>
                      📭 No transfer records found
                    </Td>
                  </Tr>
                ) : (
                  transfers.map((t) => {
                    const status = t.is_verified || "Draft";
                    const items  = Array.isArray(t.items) ? t.items : [];
                    return (
                      <Tr key={t.transfer_ref_number || t.id}>
                        <Td>
                          <StatusBadge $status={status}>{status}</StatusBadge>
                        </Td>
                        <Td style={{ color: "#374151" }}>
                          {t.created_date
                            ? new Date(t.created_date).toLocaleDateString("en-GB")
                            : "-"}
                        </Td>
                        <Td style={{ fontWeight: 700, color: "#0d9488", fontFamily: "monospace" }}>
                          {t.transfer_ref_number}
                        </Td>
                        <Td>{getOutletName(t.from_outlet ?? t.outlet_code)}</Td>
                        <Td>{getOutletName(t.to_outlet)}</Td>
                        <Td>
                          <span style={{ color: "#6b7280", fontSize: "0.82rem" }}>
                            {items.length} item{items.length !== 1 ? "s" : ""}
                          </span>
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          <RowKebabMenu
                            transfer={t}
                            canApprove={canApprove(t)}
                            onApprove={() => handleApproveClick(t)}
                            onReject={() => handleRejectClick(t)}
                            onPrint={() => setPrintSlip(t)}
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

      {/* ── Confirm Modals ── */}
      {confirmModal?.type === "approve" && (
        <ConfirmModal
          title="✔ Approve Stock Transfer"
          message={`Approve ${confirmModal.transfer.transfer_ref_number}? Stock quantities will be updated and this cannot be undone.`}
          confirmLabel="Approve"
          confirmColor="#0d9488"
          onConfirm={handleApproveConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}
      {confirmModal?.type === "reject" && (
        <ConfirmModal
          title="✕ Cancel Stock Transfer"
          message={`Cancel transfer ${confirmModal.transfer.transfer_ref_number}? This will mark it as Rejected and cannot be undone.`}
          confirmLabel="Yes, Cancel"
          confirmColor="#dc2626"
          onConfirm={handleRejectConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}

      {/* ── Print Slip Modal ── */}
      {printSlip && (
        <PrintSlipModal
          slip={printSlip}
          getOutletName={getOutletName}
          onClose={() => setPrintSlip(null)}
          HmsBaseUrl={HmsBaseUrl}
        />
      )}

    </PageWrapper>
  );
};

export default StockTransfer;