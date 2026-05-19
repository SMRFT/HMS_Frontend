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

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
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
    status === "Approved" ? "#0d9488"
    : status === "Rejected" ? "#dc2626"
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

const ReadonlyInput = styled(Input)`
  background: #e5e7eb !important;
  cursor: not-allowed;
`;
const StockInfoNote = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 4px;
`;

// ─── Kebab Menu Styled Components ─────────────────────────────────────────────
const KebabWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const KebabBtn = styled.button`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  color: #6b7280;
  transition: background 0.15s, border-color 0.15s;
  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
    color: #111827;
  }
`;

const KebabMenu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  min-width: 170px;
  z-index: 1000;
  overflow: hidden;
  animation: ${fadeIn} 0.15s ease forwards;
`;

const KebabItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.83rem;
  font-weight: 500;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  color: ${({ danger, disabled }) =>
    disabled ? "#9ca3af" : danger ? "#dc2626" : "#374151"};
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
  transition: background 0.12s;
  &:hover:not(:disabled) {
    background: ${({ danger }) => (danger ? "#fff1f2" : "#f0fdfa")};
    color: ${({ danger }) => (danger ? "#b91c1c" : "#0d9488")};
  }
`;

const KebabDivider = styled.div`
  height: 1px;
  background: #f3f4f6;
  margin: 2px 0;
`;

// ─── Print Modal Styled Components ────────────────────────────────────────────
const PrintModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const PrintModalBox = styled.div`
  background: white;
  border-radius: 10px;
  width: 720px;
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
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
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
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #fca5a5; }
`;

const PrintModalPrintBtn = styled.button`
  background: #0d9488;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover { background: #0f766e; }
`;

const PrintModalBody = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 20px 24px;
`;

// ─── Print Slip Content ────────────────────────────────────────────────────────
const SlipWrap = styled.div`
  font-family: "Courier New", Courier, monospace;
  font-size: 11.5px;
  color: #111;
  line-height: 1.45;
  width: 100%;
`;

const SlipHospitalName = styled.div`
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 2px;
`;

const SlipPhone = styled.div`
  text-align: center;
  font-size: 11px;
  margin-bottom: 6px;
`;

const SlipTitle = styled.div`
  text-align: center;
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 8px;
  letter-spacing: 0.04em;
`;

const SlipHRule = styled.div`
  border-top: ${({ thick }) => (thick ? "2px" : "1px")} solid #000;
  margin: ${({ my }) => (my || "5px")} 0;
`;

const SlipMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
  font-size: 11.5px;
`;

const SlipGrid = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr 90px 70px 52px 80px 90px;
  gap: 3px;
  margin-bottom: 3px;
  font-size: 11px;
`;

const SlipGridHeader = styled(SlipGrid)`
  font-weight: bold;
  margin-bottom: 4px;
`;

const SlipRight = styled.span`
  text-align: right;
  display: block;
`;

const SlipTotalsRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 11.5px;
`;

const SlipFooter = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  margin-top: 2px;
`;

// ─── Print Styles (for actual window.print) ───────────────────────────────────
const PRINT_STYLES = `
  @media print {
    body * { visibility: hidden !important; }
    #stock-transfer-slip-printable,
    #stock-transfer-slip-printable * { visibility: visible !important; }
    #stock-transfer-slip-printable {
      position: fixed;
      left: 0; top: 0;
      width: 100%;
      padding: 12px 16px;
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      color: #000;
      display: block !important;
      background: white;
    }
  }
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

// ─── Auth Context ─────────────────────────────────────────────────────────────
function getAuthContext() {
  const outletCode =
    localStorage.getItem("auth-outlet-code") ||
    sessionStorage.getItem("auth-outlet-code") || "";
  const norm =
    !outletCode || outletCode === "null" || outletCode === "system" ? "" : outletCode;
  return { outletCode: norm, isDrugPurchase: norm === "" };
}

// ─── Financial Year ───────────────────────────────────────────────────────────
function getCurrentFinYear() {
  const today = new Date();
  const fromYr = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  return `${String(fromYr).slice(-2)}${String(fromYr + 1).slice(-2)}`;
}

// ─── Kebab Row Menu Component ─────────────────────────────────────────────────
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

  const handle = (fn) => {
    setOpen(false);
    fn();
  };

  return (
    <KebabWrapper ref={ref}>
      <KebabBtn onClick={() => setOpen((v) => !v)} title="Actions">
        ⋮
      </KebabBtn>
      {open && (
        <KebabMenu>
          {/* Approve */}
          <KebabItem
            disabled={!isDraft || !canApprove}
            title={
              isApproved ? "Already approved"
              : isRejected ? "Cannot approve a cancelled transfer"
              : !canApprove ? "Only the receiving outlet can approve"
              : "Approve this transfer"
            }
            onClick={() => !(!isDraft || !canApprove) && handle(onApprove)}
          >
            <span>✔</span> Approve
          </KebabItem>

          <KebabDivider />

          {/* Print Slip */}
          <KebabItem onClick={() => handle(onPrint)}>
            <span>🖨️</span> Print Slip
          </KebabItem>

          <KebabDivider />

          {/* Cancel */}
          <KebabItem
            danger
            disabled={isApproved || isRejected}
            title={
              isApproved ? "Approved transfers cannot be cancelled"
              : isRejected ? "Already cancelled"
              : "Cancel this transfer"
            }
            onClick={() => !(isApproved || isRejected) && handle(onReject)}
          >
            <span>✕</span> Cancel Transfer
          </KebabItem>
        </KebabMenu>
      )}
    </KebabWrapper>
  );
};

// ─── Slip inner content (shared by modal preview & window.print) ──────────────
const SlipContent = ({ slip, items, getOutletName }) => {
  const RULE  = "─".repeat(76);
  const RULE2 = "═".repeat(76);

  const totalQty = items.reduce(
    (sum, it) => sum + Number(it.transferred_out_quantity || it.transfer_quantity || 0),
    0
  );
  const totalAmt = items.reduce((sum, it) => {
    const qty   = Number(it.transferred_out_quantity || it.transfer_quantity || 0);
    const srate = Number(it.Selling_Price || it.selling_price || it.mrp || 0);
    return sum + qty * srate;
  }, 0);

  const fmtExpiry = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-GB", { month: "2-digit", year: "numeric" });
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB");

  return (
    <SlipWrap>
      {/* ── Header ── */}
      <SlipHospitalName>SHANMUGA HOSPITAL LIMITED</SlipHospitalName>
      <SlipPhone>04272706666</SlipPhone>

      {/* top double-rule */}
      <div style={{ fontFamily: "Courier New", fontSize: 11, margin: "4px 0 0" }}>{RULE2}</div>
      <div style={{ fontFamily: "Courier New", fontSize: 11 }}>{RULE2}</div>

      <SlipTitle style={{ margin: "4px 0" }}>STOCK TRANSFER SLIP</SlipTitle>

      <div style={{ fontFamily: "Courier New", fontSize: 11 }}>{RULE2}</div>
      <div style={{ fontFamily: "Courier New", fontSize: 11, margin: "0 0 4px" }}>{RULE2}</div>

      {/* ── Meta ── */}
      <div style={{ fontFamily: "Courier New", fontSize: 11.5, marginBottom: 2 }}>
        Source&nbsp;&nbsp;&nbsp;&nbsp;: <strong>{getOutletName(slip.from_outlet || slip.outlet_code)}</strong>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        Date&nbsp;: <strong>{fmtDate(slip.created_date)}</strong>
      </div>
      <div style={{ fontFamily: "Courier New", fontSize: 11.5, marginBottom: 4 }}>
        Destination : <strong>{getOutletName(slip.to_outlet)}</strong>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        Ref.&nbsp;&nbsp;: <strong>{slip.transfer_ref_number}</strong>
      </div>

      {/* Company label line */}
      <div style={{ fontFamily: "Courier New", fontSize: 11, textAlign: "right", marginBottom: 2 }}>
        Company&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total
      </div>

      <div style={{ fontFamily: "Courier New", fontSize: 11 }}>{RULE2}</div>
      <div style={{ fontFamily: "Courier New", fontSize: 11, margin: "0 0 4px" }}>{RULE}</div>

      {/* ── Column Headers ── */}
      <div style={{
        fontFamily: "Courier New", fontSize: 11, fontWeight: "bold",
        display: "grid",
        gridTemplateColumns: "24px 1fr 80px 60px 40px 75px 80px",
        gap: "2px",
        marginBottom: 2,
      }}>
        <span>Sl</span>
        <span>Particulars</span>
        <span>Batch</span>
        <span>Expiry</span>
        <span style={{ textAlign: "right" }}>Qty</span>
        <span style={{ textAlign: "right" }}>S.rate</span>
        <span style={{ textAlign: "right" }}>Total</span>
      </div>

      <div style={{ fontFamily: "Courier New", fontSize: 11 }}>{RULE}</div>
      <div style={{ fontFamily: "Courier New", fontSize: 11, marginBottom: 4 }}>{RULE}</div>

      {/* ── Items ── */}
      {items.length === 0 ? (
        <div style={{ fontFamily: "Courier New", fontSize: 11, textAlign: "center", padding: "8px 0", color: "#999" }}>
          No items
        </div>
      ) : (
        items.map((item, idx) => {
          const qty   = Number(item.transferred_out_quantity || item.transfer_quantity || 0);
          const srate = Number(item.Selling_Price || item.selling_price || item.mrp || 0);
          const total = qty * srate;
          return (
            <div key={idx} style={{
              fontFamily: "Courier New", fontSize: 11,
              display: "grid",
              gridTemplateColumns: "24px 1fr 80px 60px 40px 75px 80px",
              gap: "2px",
              marginBottom: 3,
            }}>
              <span>{idx + 1}</span>
              <span style={{ wordBreak: "break-word" }}>{item.item_name || `Item #${item.item_id}`}</span>
              <span>{item.batch_number || "-"}</span>
              <span>{fmtExpiry(item.expiry_date)}</span>
              <span style={{ textAlign: "right" }}>{qty}</span>
              <span style={{ textAlign: "right" }}>{srate ? srate.toFixed(2) : "-"}</span>
              <span style={{ textAlign: "right" }}>{srate ? total.toFixed(2) : "-"}</span>
            </div>
          );
        })
      )}

      <div style={{ fontFamily: "Courier New", fontSize: 11, marginTop: 4 }}>{RULE}</div>
      <div style={{ fontFamily: "Courier New", fontSize: 11, marginBottom: 4 }}>{RULE}</div>

      {/* ── Prepared By / Remarks ── */}
      <div style={{ fontFamily: "Courier New", fontSize: 11, marginBottom: 2 }}>
        Prepared By : {slip.created_by || "-"}
      </div>
      <div style={{ fontFamily: "Courier New", fontSize: 11, marginBottom: 4 }}>
        Remarks :
      </div>

      <div style={{ fontFamily: "Courier New", fontSize: 11 }}>{RULE2}</div>
      <div style={{ fontFamily: "Courier New", fontSize: 11, marginBottom: 4 }}>{RULE2}</div>

      {/* ── Totals footer ── */}
      <div style={{
        fontFamily: "Courier New", fontSize: 11.5, fontWeight: "bold",
        display: "flex", justifyContent: "space-between",
      }}>
        <span>{totalAmt > 0 ? totalAmt.toFixed(2) : ""}</span>
        <span>{totalQty}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{totalAmt > 0 ? totalAmt.toFixed(2) : ""}</span>
      </div>

      <div style={{ fontFamily: "Courier New", fontSize: 11, marginTop: 4 }}>{RULE}</div>
      <div style={{ fontFamily: "Courier New", fontSize: 11 }}>{RULE}</div>
    </SlipWrap>
  );
};

const PrintSlipModal = ({ slip, getOutletName, onClose, HmsBaseUrl }) => {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);

const normalizeTransferItems = (raw) => {
  if (!raw) return [];

  // Already usable
  if (Array.isArray(raw)) return raw;

  // Single object
  if (typeof raw === "object") return [raw];

  // Stringified OrderedDict parser
  if (typeof raw === "string") {
    try {
      const matches = [...raw.matchAll(/OrderedDict\(\[(.*?)\]\)/g)];

      if (!matches.length) return [];

      return matches.map((match) => {
        const content = match[1];

        const pairMatches = [
          ...content.matchAll(/\('([^']+)',\s*('?[^,)]+'?|[\d.]+)\)/g),
        ];

        const obj = {};

        pairMatches.forEach(([, key, value]) => {
          let cleanedValue = value.trim();

          // Remove surrounding quotes if present
          if (
            cleanedValue.startsWith("'") &&
            cleanedValue.endsWith("'")
          ) {
            cleanedValue = cleanedValue.slice(1, -1);
          }

          // Convert numeric strings
          if (!isNaN(cleanedValue)) {
            cleanedValue = Number(cleanedValue);
          }

          obj[key] = cleanedValue;
        });

        return obj;
      });
    } catch (err) {
      console.error("normalizeTransferItems failed:", err, raw);
      return [];
    }
  }

  return [];
};

  // Fetch transfer detail to get items
useEffect(() => {
  let cancelled = false;

  const fetchDetail = async () => {
    setLoading(true);

    try {
      const res = await apiRequest(
        `${HmsBaseUrl}stock-transfer/?transfer_ref_number=${slip.transfer_ref_number}`,
        "GET"
      );

      if (cancelled) return;

      const rows =
        res?.data?.data ??
        res?.data ??
        [];

      const transfer = Array.isArray(rows)
        ? rows.find(
            (t) => t.transfer_ref_number === slip.transfer_ref_number
          )
        : rows;

        const raw = transfer?.items ?? [];
        const list = normalizeTransferItems(raw);
        setItems(list);

    } catch {
      if (!cancelled) {
        const embedded = normalizeTransferItems(slip?.items);

        setItems(embedded);
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  fetchDetail();

  return () => {
    cancelled = true;
  };
}, [slip.transfer_ref_number, HmsBaseUrl]);

  const handlePrint = () => window.print();

  return (
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
            <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280", fontFamily: "Courier New", fontSize: 13 }}>
              Loading slip details…
            </div>
          ) : (
            <div id="stock-transfer-slip-printable">
              <SlipContent slip={slip} items={items} getOutletName={getOutletName} />
            </div>
          )}
        </PrintModalBody>
      </PrintModalBox>
    </PrintModalOverlay>
  );
};

// ─── Print Styles injection ───────────────────────────────────────────────────
function injectPrintStyles() {
  if (!document.getElementById("st-print-style")) {
    const s = document.createElement("style");
    s.id = "st-print-style";
    s.innerHTML = PRINT_STYLES;
    document.head.appendChild(s);
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
const StockTransfer = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const { outletCode, isDrugPurchase } = getAuthContext();

  // ── State ──────────────────────────────────────────────────────────────────
  const [outlets, setOutlets]     = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [showForm, setShowForm]   = useState(false);

  // Form
  const [fromOutlet, setFromOutlet] = useState(isDrugPurchase ? "" : outletCode);
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

  // Filters — default financial-year start to today
  const [filterFromDate, setFilterFromDate] = useState(() => {
    const d  = new Date();
    const yr = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    return `${yr}-04-01`;
  });
  const [filterToDate, setFilterToDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  // Print modal & confirm modal
  const [printSlip, setPrintSlip]       = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const medicineSearchRef = useRef(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedBatch =
    selectedBatchIdx !== "" ? availableBatches[selectedBatchIdx] : null;

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => { fetchOutlets(); injectPrintStyles(); }, []); // eslint-disable-line
  useEffect(() => { fetchTransfers(); }, []);                    // eslint-disable-line

  useEffect(() => {
    const h = (e) => {
      if (medicineSearchRef.current && !medicineSearchRef.current.contains(e.target))
        setShowMedDropdown(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getOutletName = (code) => {
    if (!code || code === "null") return "Drug Purchase";
    const o = outlets.find((x) => x.outlet_code === code);
    return o ? o.outlet_name : code;
  };

  // ── API: fetch outlets ────────────────────────────────────────────────────
  const fetchOutlets = useCallback(async () => {
    try {
      const r = await apiRequest(`${HmsBaseUrl}get_active_outlets/`, "GET");
      const list = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : []);
      setOutlets(Array.isArray(list) ? list : []);
    } catch {
      toast.error("Failed to fetch outlets");
    }
  }, [HmsBaseUrl]);

  // ── API: fetch transfers ──────────────────────────────────────────────────
  const fetchTransfers = async (extra = {}) => {
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
  };

  // ── API: search medicines ─────────────────────────────────────────────────
  const searchMedicines = async (query) => {
    if (!query || query.length < 2) {
      setMedicineResults([]); setShowMedDropdown(false); return;
    }
    try {
      const params = new URLSearchParams({ search: query });
      if (fromOutlet) params.append("outlet_code", fromOutlet);
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
  };

  // ── API: fetch batches for item ───────────────────────────────────────────
  const fetchBatchesForItem = async (itemId) => {
    try {
      const params = new URLSearchParams({ item_id: itemId });
      if (fromOutlet) params.append("outlet_code", fromOutlet);
      const res = await apiRequest(`${HmsBaseUrl}pharmacy-stock/?${params}`, "GET");
      const stocks  = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      const batches = stocks.map((s) => ({
        stock_id:      s.stock_id,
        batch_number:  s.batch_number || "-",
        hsn_code:      s.hsn_code     || "",
        outlet_code:   s.outlet_code  || "",
        mrp:           s.mrp          || 0,
        available_qty: Number(s.available_qty ?? 0),
      }));
      setAvailableBatches(batches);
      setSelectedBatchIdx(batches.length === 1 ? 0 : "");
    } catch {
      setAvailableBatches([]); setSelectedBatchIdx("");
    }
  };

  // ── Handlers: medicine search ─────────────────────────────────────────────
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
  };

  const handleFromOutletChange = (code) => {
    setFromOutlet(code);
    setMedicineSearch(""); setSelectedMedicine(null);
    setAvailableBatches([]); setSelectedBatchIdx(""); setTransferQty("");
  };

  // ── Handlers: add / remove item ───────────────────────────────────────────
  const handleAddItem = () => {
    if (!selectedMedicine)                         { toast.error("Please select a medicine"); return; }
    if (selectedBatchIdx === "" || !selectedBatch) { toast.error("Please select a batch"); return; }
    if (!transferQty || Number(transferQty) <= 0)  { toast.error("Enter a valid transfer quantity"); return; }
    if (Number(transferQty) > selectedBatch.available_qty) {
      toast.error(`Qty (${transferQty}) exceeds available stock (${selectedBatch.available_qty})`); return;
    }
    if (addedItems.find((i) =>
      i.item_id === selectedMedicine.item_id && i.batch_number === selectedBatch.batch_number
    )) { toast.warning("Already added this batch"); return; }

    setAddedItems([...addedItems, {
      stock_id:          selectedBatch.stock_id,
      item_id:           selectedMedicine.item_id,
      item_name:         selectedMedicine.item_name,
      batch_number:      selectedBatch.batch_number,
      hsn_code:          selectedBatch.hsn_code,
      outlet_code:       selectedBatch.outlet_code,
      outlet_stock:      selectedBatch.available_qty,
      transfer_quantity: Number(transferQty),
    }]);
    setMedicineSearch(""); setSelectedMedicine(null);
    setAvailableBatches([]); setSelectedBatchIdx(""); setTransferQty("");
  };

  const handleRemoveItem = (idx) =>
    setAddedItems(addedItems.filter((_, i) => i !== idx));

  // ── Handlers: save (POST → Draft) ────────────────────────────────────────
  const handleSave = async () => {
    if (!toOutlet)           { toast.error("Please select To Outlet"); return; }
    if (fromOutlet===toOutlet){ toast.error("From and To cannot be the same"); return; }
    if (addedItems.length===0){ toast.error("Add at least one medicine"); return; }

    try {
      const res = await apiRequest(`${HmsBaseUrl}stock-transfer/`, "POST", {
        from_outlet: fromOutlet || null,
        to_outlet:   toOutlet   || null,
        items: addedItems.map((i) => ({
          stock_id:          i.stock_id,
          item_id:           i.item_id,
          batch_number:      i.batch_number,
          transfer_quantity: i.transfer_quantity,
          outlet_code:       i.outlet_code || null,
        })),
      });
      if (res?.success) {
        toast.success("Stock Transfer saved as Draft");
        handleCancelForm(); fetchTransfers();
      } else {
        toast.error(
          Array.isArray(res?.error) ? res.error.join(", ") : res?.error || "Failed to save"
        );
      }
    } catch { toast.error("Failed to save transfer"); }
  };

  const handleCancelForm = () => {
    setFromOutlet(isDrugPurchase ? "" : outletCode);
    setToOutlet(""); setAddedItems([]);
    setMedicineSearch(""); setSelectedMedicine(null);
    setAvailableBatches([]); setSelectedBatchIdx(""); setTransferQty("");
    setShowForm(false);
  };

  const handleSearch = () =>
    fetchTransfers({ from_date: filterFromDate, to_date: filterToDate });

  // ── Permission helpers ────────────────────────────────────────────────────
  const canApprove = (t) =>
    t.is_verified === "Draft" &&
    (isDrugPurchase || t.to_outlet === outletCode);

  // ── Handlers: approve ─────────────────────────────────────────────────────
  const handleApproveClick = (t) => {
    if (t.is_verified === "Approved") return;
    if (t.is_verified === "Rejected") { toast.error("Rejected transfers cannot be approved"); return; }
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
        toast.error(
          Array.isArray(res?.error) ? res.error.join(", ") : res?.error || "Failed to approve"
        );
      }
    } catch { toast.error("Failed to approve transfer"); }
  };

  // ── Handlers: cancel / reject ─────────────────────────────────────────────
  const handleRejectClick = (t) => {
    if (t.is_verified === "Approved") { toast.error("Approved transfers cannot be cancelled"); return; }
    if (t.is_verified === "Rejected") { toast.info("Already cancelled"); return; }
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
        toast.error(
          Array.isArray(res?.error) ? res.error.join(", ") : res?.error || "Failed to cancel"
        );
      }
    } catch { toast.error("Failed to cancel transfer"); }
  };

  // ── Handler: print slip modal ─────────────────────────────────────────────
  const handlePrintSlip = (t) => setPrintSlip(t);

  // ── Outlet options for form dropdowns ─────────────────────────────────────
  const outletOptions = [{ outlet_code: "", outlet_name: "Drug Purchase" }, ...outlets];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>

        {/* Header */}
        <PageHeader>
          <div>
            <PageTitle>📦 Stock Transfer</PageTitle>
            <PageSubtitle>
              {isDrugPurchase
                ? "Drug Purchase — inter-outlet stock transfers"
                : `${getOutletName(outletCode)} — inter-outlet stock transfers`}
            </PageSubtitle>
          </div>
          {!showForm && (
            <NewTransferBtn onClick={() => setShowForm(true)}>+ New Transfer</NewTransferBtn>
          )}
        </PageHeader>

        {/* Form Panel */}
        {showForm && (
          <FormPanel>
            <FormPanelBody>

              {/* Outlet selectors */}
              <FormRow columns="1fr 1fr" style={{ marginBottom: 20 }}>
                <InputWrapper>
                  <Label required>From Outlet</Label>
                  {isDrugPurchase ? (
                    <FilterSelect
                      style={{ width: "100%", padding: "9px 10px", fontSize: "0.9rem" }}
                      value={fromOutlet}
                      onChange={(e) => handleFromOutletChange(e.target.value)}
                    >
                      <option value="">Drug Purchase</option>
                      {outlets.map((o) => (
                        <option key={o.outlet_code} value={o.outlet_code}>{o.outlet_name}</option>
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
                    value={toOutlet}
                    onChange={(e) => setToOutlet(e.target.value)}
                  >
                    <option value="">-- Select To Outlet --</option>
                    {outletOptions
                      .filter((o) => o.outlet_code !== fromOutlet)
                      .map((o) => (
                        <option key={o.outlet_code || "dp-to"} value={o.outlet_code}>
                          {o.outlet_name}
                        </option>
                      ))}
                  </FilterSelect>
                </InputWrapper>
              </FormRow>

              {/* Add Medicine */}
              <div style={{
                background: "#f0fdfa", border: "1px solid #d1fae5",
                borderRadius: 8, padding: 16, marginBottom: 20,
              }}>
                <SectionTitle style={{ marginBottom: 12 }}>Add Medicine</SectionTitle>
                <FormRow columns="2fr 1.2fr 1fr 1.2fr 0.8fr auto">

                  <InputWrapper>
                    <Label required>Product Name</Label>
                    <RelativeWrapper ref={medicineSearchRef}>
                      <Input
                        type="text" value={medicineSearch}
                        onChange={handleMedicineSearch}
                        placeholder="Search medicine..." autoComplete="off"
                      />
                      {showMedDropdown && medicineResults.length > 0 && (
                        <SearchDropdown>
                          {medicineResults.map((med) => (
                            <DropdownItem key={med.item_id} onMouseDown={() => handleSelectMedicine(med)}>
                              {med.item_name}
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
                    <Label>Outlet Stock</Label>
                    <ReadonlyInput type="text" value={selectedBatch != null ? selectedBatch.available_qty : ""} readOnly placeholder="Auto-filled" />
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
                        {selectedBatch && <StockInfoNote>Stock: {selectedBatch.available_qty}</StockInfoNote>}
                      </>
                    )}
                  </InputWrapper>

                  <InputWrapper>
                    <Label required>Transfer Qty</Label>
                    <Input
                      type="number" min="1"
                      max={selectedBatch?.available_qty || undefined}
                      value={transferQty}
                      onChange={(e) => setTransferQty(e.target.value)}
                      placeholder="0"
                    />
                  </InputWrapper>

                  <InputWrapper style={{ justifyContent: "flex-end" }}>
                    <Label>&nbsp;</Label>
                    <Button type="button" onClick={handleAddItem}
                      style={{ padding: "7px 16px", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      + Add
                    </Button>
                  </InputWrapper>

                </FormRow>
              </div>

              {/* Added items table */}
              {addedItems.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <SectionTitle>Added Medicines</SectionTitle>
                  <AddedItemsTable>
                    <thead>
                      <tr>
                        <ATh>#</ATh><ATh>Product Name</ATh><ATh>HSN</ATh>
                        <ATh>Outlet Stock</ATh><ATh>Batch</ATh><ATh>Transfer Qty</ATh><ATh>Action</ATh>
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
                          <ATd style={{ color: "#0d9488", fontWeight: 600 }}>{item.transfer_quantity}</ATd>
                          <ATd><RemoveBtn onClick={() => handleRemoveItem(idx)}>Remove</RemoveBtn></ATd>
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
          <SearchBtn onClick={handleSearch}>🔍 Search</SearchBtn>
        </FilterRow>

        {/* Transfer Records Table */}
        <div style={{ padding: "20px 24px 24px" }}>
          <SectionTitle>
            Transfer Records — {isDrugPurchase ? "Drug Purchase" : getOutletName(outletCode)}
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
                  <Th style={{ textAlign: "center" }}>Actions</Th>
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
                    const status = t.is_verified || "Draft";
                    return (
                      <Tr key={t.transfer_ref_number || t.id}>
                        <Td><StatusBadge status={status}>{status}</StatusBadge></Td>
                        <Td>
                          {t.created_date
                            ? new Date(t.created_date).toLocaleDateString("en-GB")
                            : "-"}
                        </Td>
                        <Td style={{ fontWeight: 600, color: "#0d9488" }}>
                          {t.transfer_ref_number}
                        </Td>
                        <Td>{getOutletName(t.from_outlet || t.outlet_code)}</Td>
                        <Td>{getOutletName(t.to_outlet)}</Td>
                        <Td style={{ textAlign: "center" }}>
                          {/* ── Kebab (three-dot) action menu ── */}
                          <RowKebabMenu
                            transfer={t}
                            canApprove={canApprove(t)}
                            onApprove={() => handleApproveClick(t)}
                            onReject={() => handleRejectClick(t)}
                            onPrint={() => handlePrintSlip(t)}
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
          title="Approve Stock Transfer"
          message={`Approve ${confirmModal.transfer.transfer_ref_number}? Stock quantities will be updated and this cannot be undone.`}
          confirmLabel="Approve"
          confirmColor="#0d9488"
          onConfirm={handleApproveConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}
      {confirmModal?.type === "reject" && (
        <ConfirmModal
          title="Cancel Stock Transfer"
          message={`Cancel ${confirmModal.transfer.transfer_ref_number}? This will mark it as Rejected.`}
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