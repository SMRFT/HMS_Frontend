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
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
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
    $status === "Returned" ? "#dcfce7"
      : $status === "Pending" ? "#fef3c7"
        : "#f3e8ff"};
  color: ${({ $status }) =>
    $status === "Returned" ? "#166534"
      : $status === "Pending" ? "#92400e"
        : "#0f766e"};
  border: 1px solid ${({ $status }) =>
    $status === "Returned" ? "#86efac"
      : $status === "Pending" ? "#fde68a"
        : "#a7f3d0"};
  &::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: ${({ $status }) =>
    $status === "Returned" ? "#16a34a"
      : $status === "Pending" ? "#d97706"
        : "#0d9488"};
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
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
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
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
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
  transition: background 0.15s;
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
const GrnSearchWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;
`;
const GrnSearchBtn = styled.button`
  background: #0d9488;
  color: white;
  border: none;
  padding: 9px 16px;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  height: 38px;
  &:hover { background: #0f766e; }
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
  background: #f0fdfa;
  color: #0f766e;
  padding: 10px 12px;
  text-align: left;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 2px solid #a7f3d0;
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
  background: #f0fdfa;
  border: 1.5px solid #a7f3d0;
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
  color: #0d9488;
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
  &:focus { border-color: #0d9488; }
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
  &:focus { border-color: #0d9488; }
`;
const AddRowBtn = styled.button`
  background: #0d9488;
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: #0f766e; }
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
  &:hover { background: #f0fdfa; color: #0d9488; }
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
const ModalText = styled.p`margin: 0 0 16px; font-size: 0.875rem; color: #6b7280; line-height: 1.6;`;
const ModalBtns = styled.div`display: flex; gap: 10px; justify-content: flex-end;`;
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
  const [selectedStatus, setSelectedStatus] = useState(record.status || "Pending");
  const statuses = ["Pending", "Returned"];
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
          <button onClick={() => onConfirm(selectedStatus)} style={{ padding: "9px 20px", borderRadius: 7, border: "none", background: "#0d9488", color: "white", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700 }}>Update</button>
        </ModalBtns>
      </ModalBox>
    </ModalOverlay>
  );
};

// ─── Row Kebab Menu ───────────────────────────────────────────────────────────
const RowKebabMenu = ({ record, onUpdateStatus, onView, onPrint }) => {
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
          {record.status === "Returned" && (
            <>
              <KebabDivider />
              <KebabItem onClick={() => handle(onPrint)}><span>🖨️</span> Print Return</KebabItem>
            </>
          )}
          {record.status === "Pending" && (
            <>
              <KebabDivider />
              <KebabItem onClick={() => handle(onUpdateStatus)}>
                <span style={{ color: "#b91c1c" }}>↩</span> <span style={{ color: "#b91c1c" }}>Return Items</span>
              </KebabItem>
            </>
          )}
        </KebabMenu>
      )}
    </KebabWrapper>
  );
};

// ─── Print Return Modal ───────────────────────────────────────────────────────
const PrintReturnModal = ({ record, onClose }) => {
  let items = [];
  try {
    items = typeof record.items === "string" ? JSON.parse(record.items) : (Array.isArray(record.items) ? record.items : []);
  } catch (e) {
    console.error("Failed to parse items:", e);
  }

  const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "-"; } catch { return "-"; } };

  const handlePrint = () => {
    const content = document.getElementById("return-print-area");
    if (!content) return;
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) {
      toast.error("Popup blocked — please allow popups for this site and try again.");
      return;
    }
    win.document.write(`
      <html>
        <head>
          <title>Purchase Return - ${record.purchase_return_bill_no}</title>
          <style>
            body { font-family: monospace; font-size: 14px; padding: 20px; }
            .header { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 20px; }
            .details { margin-bottom: 20px; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { border-bottom: 1px solid #000; padding: 5px 0; text-align: left; }
            td { padding: 5px 0; }
            .remarks { margin-top: 20px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 250);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ViewModalBox onClick={(e) => e.stopPropagation()} style={{ width: "650px" }}>
        <ViewModalHeader style={{ background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)", color: "white" }}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>🖨️ Purchase Return Print Preview</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handlePrint} style={{ background: "#f97316", color: "white", border: "none", padding: "6px 14px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>🖨️ Print</button>
            <button onClick={onClose} style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 14px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>✕ Close</button>
          </div>
        </ViewModalHeader>
        <ViewModalBody style={{ background: "#f9fafb", padding: "20px" }}>
          <div id="return-print-area" style={{
            background: "white",
            padding: "24px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontFamily: "monospace",
            fontSize: "13px",
            color: "#000",
            lineHeight: "1.4"
          }}>
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "16px", marginBottom: "20px" }}>E GSHANMUGA HOSPITAL LIMITED H F</div>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex" }}>
                <span style={{ width: "160px" }}>Purchase Type</span>
                <span>: ${record.purchase_category || 'MEDICINE PURCHASE'}</span>
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ width: "160px" }}>Purchase Return No</span>
                <span>: ${record.purchase_return_bill_no}</span>
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ width: "160px" }}>Return Date</span>
                <span>: ${fmtDate(record.purchase_return_bill_date || record.created_date)}</span>
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ width: "160px" }}>Supplier Name</span>
                <span>: ${record.vendor_name || record.vendor_code || '-'}</span>
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ width: "160px" }}>Credit Note Amount</span>
                <span>: ${Number(record.purchase_return_amount || 0).toFixed(2)}</span>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #000" }}>
                  <th style={{ textAlign: "left", padding: "6px 0", fontSize: "13px" }}>Item Name</th>
                  <th style={{ textAlign: "left", padding: "6px 0", fontSize: "13px" }}>Batch NO</th>
                  <th style={{ textAlign: "left", padding: "6px 0", fontSize: "13px" }}>Qty</th>
                  <th style={{ textAlign: "left", padding: "6px 0", fontSize: "13px" }}>Cost</th>
                  <th style={{ textAlign: "left", padding: "6px 0", fontSize: "13px" }}>Return Cause</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "6px 0", fontSize: "13px" }}>{it.item_name || '-'}</td>
                    <td style={{ padding: "6px 0", fontSize: "13px" }}>{it.batch_number || '-'}</td>
                    <td style={{ padding: "6px 0", fontSize: "13px" }}>{it.return_qty || '-'}</td>
                    <td style={{ padding: "6px 0", fontSize: "13px" }}>{Number(it.price || 0).toFixed(3)}</td>
                    <td style={{ padding: "6px 0", fontSize: "13px" }}>{it.cause_of_return || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: "20px" }}>
              REMARKS : {record.return_remark || ''}
            </div>
          </div>
        </ViewModalBody>
      </ViewModalBox>
    </ModalOverlay>
  );
};

// ─── View Details Modal ───────────────────────────────────────────────────────
const ViewDetailsModal = ({ record, outlets, onClose }) => {
  let items = [];
  try {
    items = typeof record.items === "string" ? JSON.parse(record.items) : (Array.isArray(record.items) ? record.items : []);
  } catch (e) {
    console.error("Failed to parse items:", e);
  }
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
              ["Bill No", record.purchase_return_bill_no],
              ["Date", fmtDate(record.purchase_return_bill_date || record.created_date)],
              ["GRN", record.grn_number],
              ["Vendor", record.vendor_name || record.vendor_code || "-"],
              ["Outlet", getOutletName(record.outlet_code)],
              ["Status", record.status],
              ["Total Amt", `₹ ${Number(record.purchase_return_amount || 0).toFixed(2)}`],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ minWidth: 130 }}>
                <div style={{ fontSize: "0.7rem", color: "#0d9488", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{lbl}</div>
                <div style={{ fontWeight: 600, color: "#111827" }}>{val}</div>
              </div>
            ))}
          </div>
          {record.return_remark && (
            <div style={{ background: "#f0fdfa", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: "0.82rem", color: "#374151" }}>
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
                  <ATd><span style={{ background: "#f0fdfa", color: "#0f766e", padding: "2px 8px", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600 }}>{it.batch_number || "-"}</span></ATd>
                  <ATd>{it.return_qty}</ATd>
                  <ATd style={{ color: "#6b7280" }}>{it.cause_of_return || "-"}</ATd>
                  <ATd>₹ {Number(it.price || 0).toFixed(2)}</ATd>
                  <ATd style={{ fontWeight: 700, color: "#0d9488" }}>₹ {(Number(it.price || 0) * Number(it.return_qty || 0)).toFixed(2)}</ATd>
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
  const [outlets, setOutlets] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [returns, setReturns] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form header
  const [selectedOutlet, setSelectedOutlet] = useState(isDrugPurchase ? "" : outletCode);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // GRN search
  const [grnNumber, setGrnNumber] = useState("");
  const [grnLoading, setGrnLoading] = useState(false);
  const [grnSearched, setGrnSearched] = useState(false);
  const [grnItems, setGrnItems] = useState([]);   // [{...stockRow, return_qty, cause_of_return, added}]

  // Finalised items
  const [addedItems, setAddedItems] = useState([]);

  // Filters
  const [filterFromDate, setFilterFromDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [filterToDate, setFilterToDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [filterStatus, setFilterStatus] = useState("");
  const [returnRemark, setReturnRemark] = useState("");

  // Modals
  const [statusModal, setStatusModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [printModal, setPrintModal] = useState(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const itemsSubtotal = addedItems.reduce(
    (s, it) => s + Number(it.Selling_Price || it.mrp || 0) * Number(it.return_qty || 0), 0
  );
  const grandTotal = itemsSubtotal.toFixed(2);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetchOutlets();
    fetchVendors();
    fetchReturns({ from_date: today, to_date: today });
  }, []); // eslint-disable-line

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
      if (extra.to_date) params.append("to_date", extra.to_date);
      if (extra.status) params.append("status", extra.status);
      const qs = params.toString();
      const r = await apiRequest(`${HmsBaseUrl}purchase-return/${qs ? "?" + qs : ""}`, "GET");
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
    if (!selectedVendor) { toast.error("Please select a vendor first"); return; }
    const vendorId = selectedVendor.vendor_code || selectedVendor.code || selectedVendor.vendor_id || "";

    setGrnLoading(true);
    setGrnSearched(false);
    try {
      const r = await apiRequest(
        `${HmsBaseUrl}grn-items/?grn_number=${encodeURIComponent(grnNumber.trim())}&vendor_id=${encodeURIComponent(vendorId)}`, "GET"
      );
      const apiResp = r?.data;
      if (apiResp && apiResp.success === false) {
        toast.error(apiResp.error || "No items found for this GRN number");
      } else {
        const data = apiResp?.data ?? (Array.isArray(apiResp) ? apiResp : []);
        if (!data || data.length === 0) {
          toast.warning("No items found for this GRN number");
        } else {
          // Append new items to addedItems
          const newItems = data.map((item) => ({
            ...item,
            return_qty: "",
            cause_of_return: "",
          }));
          setAddedItems((prev) => [...prev, ...newItems]);
          toast.success(`Appended ${data.length} item(s) from GRN`);
        }
      }
      setGrnNumber(""); // Clear the search field for the next one
      setGrnSearched(true);
    } catch {
      toast.error("Failed to search GRN");
    } finally {
      setGrnLoading(false);
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const outletVal = selectedOutlet === DRUG_PURCHASE_VALUE ? "" : selectedOutlet;
    if (!outletVal) { toast.error("Please select an outlet"); return; }
    if (!selectedVendor) { toast.error("Please select a vendor"); return; }
    if (addedItems.length === 0) { toast.error("Add at least one item for return"); return; }

    // Validate items
    for (let i = 0; i < addedItems.length; i++) {
      const it = addedItems[i];
      if (!it.cause_of_return) { toast.error(`Select Cause of Return for item ${i + 1}`); return; }
      const qty = Number(it.return_qty);
      if (!qty || qty <= 0) { toast.error(`Enter a valid return quantity for item ${i + 1}`); return; }
      if (qty > it.available_qty) {
        toast.error(`Return qty (${qty}) exceeds available stock (${it.available_qty}) for item ${i + 1}`); return;
      }
    }

    try {
      const res = await apiRequest(`${HmsBaseUrl}purchase-return/`, "POST", {
        outlet_code: outletVal,
        items: addedItems.map((it) => ({
          stock_id: it.stock_id,
          item_id: it.item_id,
          batch_number: it.batch_number,
          return_qty: it.return_qty,
          price: Number(it.Selling_Price || it.mrp || 0),
          cause_of_return: it.cause_of_return,
          grn_number: it.grn_number,
        })),
        return_remark: returnRemark,
      });

      if (res?.success || res?.data?.success) {
        toast.success("Purchase return created successfully");
        handleCancelForm();
        fetchReturns({ from_date: filterFromDate, to_date: filterToDate, status: filterStatus });
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
    setGrnNumber(""); setGrnSearched(false);

    setAddedItems([]);
    setReturnRemark("");
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
        fetchReturns({ from_date: filterFromDate, to_date: filterToDate, status: filterStatus });
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

              {/* ─── CARD: Supplier Information ─── */}
              <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 12, marginBottom: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                <div style={{ background: "linear-gradient(135deg,#0d9488,#0f766e)", padding: "10px 18px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🏢</span>
                  <span style={{ color: "white", fontWeight: 700, fontSize: "0.88rem" }}>Supplier Information</span>
                </div>
                <div style={{ padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 18px" }}>
                  {isDrugPurchase && (
                    <div>
                      <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Outlet <span style={{ color: "#ef4444" }}>*</span></label>
                      <FilterSelect style={{ width: "100%", padding: "7px 10px", fontSize: "0.82rem", borderRadius: 7 }}
                        value={toSelectVal(selectedOutlet)}
                        onChange={(e) => { const v = e.target.value; const code = v === DRUG_PURCHASE_VALUE ? "" : v; setSelectedOutlet(code); setGrnNumber(""); setGrnSearched(false); setGrnItems([]); setAddedItems([]); }}
                      >
                        <option value="">-- Select Outlet --</option>
                        {outletOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </FilterSelect>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Vendor <span style={{ color: "#ef4444" }}>*</span></label>
                    <FilterSelect style={{ width: "100%", padding: "7px 10px", fontSize: "0.82rem", borderRadius: 7 }}
                      value={selectedVendor ? (selectedVendor.vendor_code || selectedVendor.code || selectedVendor.vendor_id || "") : ""}
                      onChange={(e) => { const code = e.target.value; if (!code) { setSelectedVendor(null); return; } const v = vendors.find((x) => String(x.vendor_code || x.code || x.vendor_id) === String(code)); setSelectedVendor(v || null); }}
                    >
                      <option value="">-- Select Vendor --</option>
                      {vendors.map((v) => { const code = v.vendor_code || v.code || v.vendor_id || ""; const name = v.vendor_name || v.name || code; return <option key={code} value={code}>{name}</option>; })}
                    </FilterSelect>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Phone</label>
                    <input readOnly value={selectedVendor ? (selectedVendor.phone || selectedVendor.contact_number || "") : ""} style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1.5px solid #e5e7eb", background: "#f9fafb", fontSize: "0.82rem", color: "#374151", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
              </div>


              {/* ─── CARD: GRN Lookup ─── */}
              <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 12, marginBottom: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                <div style={{ background: "linear-gradient(135deg,#0d9488,#0f766e)", padding: "10px 18px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🔍</span>
                  <span style={{ color: "white", fontWeight: 700, fontSize: "0.88rem" }}>GRN Lookup</span>
                  <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.75)", fontSize: "0.76rem" }}>Search and add items from a GRN</span>
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 5 }}>GRN Number <span style={{ color: "#ef4444" }}>*</span></label>
                      <input type="text" value={grnNumber}
                        onChange={(e) => { setGrnNumber(e.target.value); setGrnSearched(false); setGrnItems([]); }}
                        placeholder="e.g. IP/2627/00001"
                        onKeyDown={(e) => { if (e.key === "Enter") handleGrnSearch(); }}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                        onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
                        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                      />
                    </div>
                    <GrnSearchBtn onClick={handleGrnSearch} disabled={grnLoading} style={{ height: 40, padding: "0 22px", borderRadius: 8 }}>
                      {grnLoading ? "⏳ Searching…" : "🔍 Search GRN"}
                    </GrnSearchBtn>
                  </div>
                  {addedItems.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ background: "#d1fae5", color: "#065f46", padding: "2px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 700 }}>
                          ✅ {addedItems.length} item(s) in return list
                        </span>
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <AddedItemsTable>
                          <thead>
                            <tr>
                              <ATh>#</ATh>
                              <ATh>Purchase Ref No</ATh>
                              <ATh>Product Name</ATh>
                              <ATh>HSN / SAC Code</ATh>
                              <ATh>Batch No</ATh>
                              <ATh>Batch Stock</ATh>
                              <ATh>Expiry</ATh>
                              <ATh>Quantity</ATh>
                              <ATh>Return Price</ATh>
                              <ATh>Cause of Return</ATh>
                              <ATh>Action</ATh>
                            </tr>
                          </thead>
                          <tbody>
                            {addedItems.map((item, idx) => {
                              return (
                                <tr key={`${item.item_id}-${item.batch_number}-${idx}`}>
                                  <ATd style={{ color: "#6b7280" }}>{idx + 1}</ATd>
                                  <ATd style={{ fontWeight: 600, color: "#111827" }}>{item.grn_number}</ATd>
                                  <ATd style={{ fontWeight: 600, color: "#111827", minWidth: 160 }}>{item.item_name}</ATd>
                                  <ATd style={{ color: "#6b7280" }}>{item.hsn_code || "-"}</ATd>
                                  <ATd>
                                    <span style={{ background: "#f0fdfa", color: "#0f766e", padding: "2px 8px", borderRadius: 4, fontSize: "0.76rem", fontWeight: 600 }}>
                                      {item.batch_number || "-"}
                                    </span>
                                  </ATd>
                                  <ATd style={{ color: "#374151", fontWeight: 600 }}>{item.total_stock ?? "-"}</ATd>
                                  <ATd style={{ color: "#6b7280" }}>{fmtExpiry(item.expiry_date)}</ATd>
                                  <ATd>
                                    <InlineInput
                                      type="number"
                                      min="1"
                                      max={item.available_qty}
                                      placeholder="0"
                                      value={item.return_qty}
                                      className={item.return_qty && Number(item.return_qty) > item.available_qty ? "warn" : ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setAddedItems((prev) => prev.map((p, i) => i === idx ? { ...p, return_qty: val } : p));
                                      }}
                                    />
                                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: 4 }}>
                                      Max: {item.available_qty}
                                    </div>
                                  </ATd>
                                  <ATd>₹ {Number(item.Selling_Price || item.mrp || 0).toFixed(2)}</ATd>
                                  <ATd>
                                    <InlineSelect
                                      value={item.cause_of_return}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setAddedItems((prev) => prev.map((p, i) => i === idx ? { ...p, cause_of_return: val } : p));
                                      }}
                                    >
                                      <option value="">-- Select --</option>
                                      {CAUSE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </InlineSelect>
                                  </ATd>
                                  <ATd style={{ textAlign: "center" }}>
                                    <button
                                      onClick={() => setAddedItems((prev) => prev.filter((_, i) => i !== idx))}
                                      title="Remove item"
                                      style={{ background: "#fee2e2", border: "none", borderRadius: 6, width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, transition: "background 0.15s" }}
                                      onMouseOver={(e) => (e.currentTarget.style.background = "#fca5a5")}
                                      onMouseOut={(e) => (e.currentTarget.style.background = "#fee2e2")}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                        <path d="M10 11v6M14 11v6" />
                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                      </svg>
                                    </button>
                                  </ATd>
                                </tr>
                              );
                            })}
                          </tbody>
                        </AddedItemsTable>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── CARD: Summary & Remarks ─── */}
              <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 12, marginBottom: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                <div style={{ background: "linear-gradient(135deg,#0d9488,#0f766e)", padding: "10px 18px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>📝</span>
                  <span style={{ color: "white", fontWeight: 700, fontSize: "0.88rem" }}>Summary & Remarks</span>
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 14, padding: "12px 16px", background: "#f0fdfa", borderRadius: 10, border: "1.5px solid #a7f3d0" }}>
                    <div>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Total Return Amount</div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0d9488" }}>₹ {grandTotal}</div>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Overall Remarks</label>
                    <textarea value={returnRemark} onChange={(e) => setReturnRemark(e.target.value)}
                      placeholder="Enter remarks about this return (optional)..."
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d1d5db", minHeight: "70px", fontFamily: "inherit", resize: "vertical", outline: "none", fontSize: "0.88rem", boxSizing: "border-box" }}
                      onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    />
                  </div>
                </div>
              </div>

              {/* ─── Action Buttons ─── */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 4 }}>
                <button type="button" onClick={handleCancelForm}
                  style={{ padding: "10px 24px", borderRadius: 8, border: "1.5px solid #d1d5db", background: "white", cursor: "pointer", fontSize: "0.88rem", fontWeight: 600, color: "#374151" }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "white"; }}
                >✕ Cancel</button>
                <button type="button" onClick={handleSave}
                  style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#0d9488,#0f766e)", color: "white", cursor: "pointer", fontSize: "0.88rem", fontWeight: 700, boxShadow: "0 2px 8px rgba(13,148,136,0.35)" }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >💾 Save Return</button>
              </div>

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
          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Returned">Returned</option>
            </FilterSelect>
          </FilterGroup>
          <SearchBtn onClick={() => fetchReturns({ from_date: filterFromDate, to_date: filterToDate, status: filterStatus })}>
            🔍 Search
          </SearchBtn>
        </FilterRow>

        {/* Status Legend */}
        <div style={{ padding: "10px 24px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["Pending", "Returned"].map((s) => (
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
                        <Td style={{ fontWeight: 700, color: "#0d9488", fontFamily: "monospace" }}>{rec.purchase_return_bill_no}</Td>
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
                            onPrint={() => setPrintModal(rec)}
                            onView={() => setViewModal(rec)}
                            onUpdateStatus={() => {
                              if (window.confirm("Are you sure you want to return this bill?")) {
                                handleStatusUpdate(rec, "Returned");
                              }
                            }}
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
      {printModal && (
        <PrintReturnModal
          record={printModal}
          onClose={() => setPrintModal(null)}
        />
      )}
    </PageWrapper>
  );
};

export default PurchaseReturn;