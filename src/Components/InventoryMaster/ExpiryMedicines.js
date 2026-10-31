import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import { InvTopToolbar, InvPagination, getTodayDateString } from "./InventoryUIHelper";
import SearchSelect from "../Common/SearchSelect";
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
  box-shadow: 0 2px 12px rgba(13, 148, 136, 0.18);
  flex-wrap: wrap;
  gap: 12px;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PageSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 0.8rem;
  opacity: 0.85;
`;

const NewEntryBtn = styled.button`
  background: #f97316;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 7px;
  font-size: 0.87rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s, transform 0.12s;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  &:hover {
    background: #ea6c0a;
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-left: 4px solid ${(p) => p.$color || "#0d9488"};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const StatTitle = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StatNumber = styled.div`
  font-size: 1.45rem;
  font-weight: 800;
  color: ${(p) => p.$color || "#1e293b"};
  line-height: 1.2;
`;

const StatDesc = styled.div`
  font-size: 0.72rem;
  color: #94a3b8;
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
    $status === "Approved"
      ? "#dcfce7"
      : $status === "Rejected"
      ? "#fee2e2"
      : "#fef9c3"};
  color: ${({ $status }) =>
    $status === "Approved"
      ? "#166534"
      : $status === "Rejected"
      ? "#991b1b"
      : "#854d0e"};
  border: 1px solid
    ${({ $status }) =>
      $status === "Approved"
        ? "#86efac"
        : $status === "Rejected"
        ? "#fca5a5"
        : "#fde047"};
  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $status }) =>
      $status === "Approved"
        ? "#16a34a"
        : $status === "Rejected"
        ? "#dc2626"
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

const FilterInput = styled.input`
  padding: 8px 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 7px;
  font-size: 0.85rem;
  color: #374151;
  outline: none;
  background: white;
  transition: border-color 0.15s;
  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }
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
  &:hover {
    background: #0f766e;
  }
`;

const ClearFilterBtn = styled.button`
  background: white;
  color: #6b7280;
  border: 1.5px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  height: 36px;
  align-self: flex-end;
  &:hover {
    background: #f3f4f6;
  }
`;

const FormPanel = styled.div`
  animation: ${slideDown} 0.3s ease forwards;
  border-bottom: 2px solid #fed7aa;
  background: #fffdfa;
`;

const FormPanelBody = styled.div`
  padding: 22px 26px;
`;

const MedicineBox = styled.div`
  background: #fef8f0;
  border: 1.5px solid #fed7aa;
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
  max-height: 220px;
  overflow-y: auto;
  width: 100%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  top: calc(100% + 3px);
  left: 0;
`;

const DropdownItem = styled.div`
  padding: 10px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: #fff7ed;
    color: #ea580c;
  }
`;

const ExpiredTag = styled.span`
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const ExpiringSoonTag = styled.span`
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const AddedItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
`;

const ATh = styled.th`
  background: #fff7ed;
  color: #c2410c;
  padding: 10px 12px;
  text-align: left;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 2px solid #fed7aa;
`;

const ATd = styled.td`
  padding: 10px 12px;
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
  &:hover {
    background: #fca5a5;
  }
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

const Textarea = styled.textarea`
  width: 100%;
  padding: 9px 11px;
  border: 1.5px solid #d1d5db;
  border-radius: 7px;
  font-size: 0.875rem;
  color: #374151;
  outline: none;
  resize: vertical;
  min-height: 72px;
  font-family: inherit;
  background: white;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }
  &::placeholder {
    color: #9ca3af;
  }
  &.error {
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
`;

const InfoChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: ${({ $color }) => $color || "#6b7280"};
  background: ${({ $bg }) => $bg || "#f3f4f6"};
  border: 1px solid ${({ $border }) => $border || "#e5e7eb"};
  border-radius: 5px;
  padding: 2px 8px;
  white-space: nowrap;
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
  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #111827;
  }
`;

const KebabMenu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 9px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.13);
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

// ─── Modals ───────────────────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalBox = styled.div`
  background: white;
  border-radius: 12px;
  padding: 28px 32px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.18s ease forwards;
`;

const ModalTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
`;

const ModalText = styled.p`
  margin: 0 0 16px;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
`;

const ModalBtns = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const ModalLabel = styled.label`
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 9px 11px;
  border: 1.5px solid #d1d5db;
  border-radius: 7px;
  font-size: 0.875rem;
  color: #374151;
  outline: none;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  background: white;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus {
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
  &::placeholder {
    color: #9ca3af;
  }
  &.error {
    border-color: #dc2626;
  }
`;

// ─── Reject Modal ─────────────────────────────────────────────────────────────
const RejectModal = ({ record, onConfirm, onClose }) => {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const handleConfirm = () => {
    setTouched(true);
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalTitle>✕ Cancel / Reject Expiry Entry</ModalTitle>
        <ModalText>
          Cancel expiry entry <strong>{record.expiry_ref_number}</strong>?
          This will mark it as Rejected and cannot be undone.
        </ModalText>
        <div>
          <ModalLabel>
            Rejection Reason <span style={{ color: "#dc2626" }}>*</span>
          </ModalLabel>
          <ModalTextarea
            className={touched && !reason.trim() ? "error" : ""}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for cancelling/rejecting this expiry record…"
          />
          {touched && !reason.trim() && (
            <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: 4 }}>
              Rejection reason is required.
            </div>
          )}
        </div>
        <ModalBtns>
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px",
              borderRadius: 7,
              border: "1.5px solid #d1d5db",
              background: "white",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "9px 20px",
              borderRadius: 7,
              border: "none",
              background: "#dc2626",
              color: "white",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 700,
            }}
          >
            Yes, Cancel Entry
          </button>
        </ModalBtns>
      </ModalBox>
    </ModalOverlay>
  );
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({ title, message, confirmLabel, confirmColor, onConfirm, onClose }) => (
  <ModalOverlay onClick={onClose}>
    <ModalBox onClick={(e) => e.stopPropagation()}>
      <ModalTitle>{title}</ModalTitle>
      <ModalText>{message}</ModalText>
      <ModalBtns>
        <button
          onClick={onClose}
          style={{
            padding: "9px 20px",
            borderRadius: 7,
            border: "1.5px solid #d1d5db",
            background: "white",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: "9px 20px",
            borderRadius: 7,
            border: "none",
            background: confirmColor || "#0d9488",
            color: "white",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 700,
          }}
        >
          {confirmLabel || "Confirm"}
        </button>
      </ModalBtns>
    </ModalBox>
  </ModalOverlay>
);

// ─── Details Modal ────────────────────────────────────────────────────────────
const DetailsModal = ({ record, getOutletName, onClose }) => {
  const items = Array.isArray(record.items) ? record.items : [];
  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
        <ModalTitle style={{ display: "flex", justifyContent: "space-between" }}>
          <span>📋 Expiry Details: {record.expiry_ref_number}</span>
          <StatusBadge $status={record.is_verified || "Draft"}>
            {record.is_verified || "Draft"}
          </StatusBadge>
        </ModalTitle>
        <div style={{ fontSize: "0.82rem", color: "#4b5563", marginBottom: 16 }}>
          <strong>Outlet:</strong> {getOutletName(record.outlet_code)} |{" "}
          <strong>Date:</strong> {fmtDateTime(record.created_date)} |{" "}
          <strong>Created By:</strong> {record.created_by || "system"}
        </div>
        {record.remarks && (
          <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 6, fontSize: "0.82rem", marginBottom: 14 }}>
            <strong>Remarks / Reason:</strong> {record.remarks}
          </div>
        )}
        <div style={{ maxHeight: 260, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 16 }}>
          <AddedItemsTable>
            <thead>
              <tr>
                <ATh>#</ATh>
                <ATh>Medicine</ATh>
                <ATh>Batch</ATh>
                <ATh>Expiry</ATh>
                <ATh style={{ textAlign: "right" }}>Rate (₹)</ATh>
                <ATh style={{ textAlign: "right" }}>Qty</ATh>
                <ATh style={{ textAlign: "right" }}>Amount (₹)</ATh>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <ATd>{idx + 1}</ATd>
                  <ATd style={{ fontWeight: 600 }}>{it.item_name || `Item #${it.item_id}`}</ATd>
                  <ATd>{it.batch_number || "-"}</ATd>
                  <ATd>{fmtDate(it.expiry_date)}</ATd>
                  <ATd style={{ textAlign: "right" }}>{Number(it.Selling_Price || it.mrp || 0).toFixed(2)}</ATd>
                  <ATd style={{ textAlign: "right", fontWeight: 700, color: "#dc2626" }}>{it.quantity || 0}</ATd>
                  <ATd style={{ textAlign: "right", fontWeight: 700 }}>{Number(it.total_amount || (it.quantity * (it.Selling_Price || it.mrp || 0))).toFixed(2)}</ATd>
                </tr>
              ))}
            </tbody>
          </AddedItemsTable>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>
            Total Qty: <span style={{ color: "#dc2626" }}>{record.total_quantity || items.reduce((s, i) => s + Number(i.quantity || 0), 0)}</span> | Total Value: ₹{Number(record.total_amount || 0).toFixed(2)}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "7px 18px",
              borderRadius: 6,
              background: "#0d9488",
              color: "white",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
};

// ─── Print Modal ──────────────────────────────────────────────────────────────
const PrintModal = ({ record, getOutletName, onClose }) => {
  const items = Array.isArray(record.items) ? record.items : [];
  const totalQty = items.reduce((s, it) => s + Number(it.quantity || 0), 0);
  const totalAmt = items.reduce(
    (s, it) => s + Number(it.total_amount || (it.quantity * (it.Selling_Price || it.mrp || 0))),
    0
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox
        onClick={(e) => e.stopPropagation()}
        style={{ width: 780, maxWidth: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #e5e7eb", background: "#f8fafc" }}>
          <div style={{ fontWeight: 700, color: "#111827" }}>Print Expiry Voucher</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handlePrint}
              style={{
                background: "#0d9488",
                color: "white",
                border: "none",
                padding: "6px 16px",
                borderRadius: 6,
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🖨 Print
            </button>
            <button
              onClick={onClose}
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                border: "none",
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 24, background: "#f3f4f6" }}>
          <div
            id="expiry-print-area"
            style={{
              background: "white",
              padding: "28px 32px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              borderRadius: 6,
              fontFamily: "Arial, sans-serif",
              color: "#111827",
            }}
          >
            <div style={{ textAlign: "center", borderBottom: "2px solid #0d9488", paddingBottom: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#0f766e" }}>SHANMUGA HOSPITAL LIMITED</div>
              <div style={{ fontSize: 11, color: "#4b5563" }}>Inventory Management — Pharmacy Department</div>
              <div style={{ fontSize: 13, fontWeight: "bold", marginTop: 4, letterSpacing: 0.5 }}>
                EXPIRED MEDICINE DISPOSAL / WRITE-OFF VOUCHER
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, marginBottom: 16 }}>
              <div><strong>Voucher Ref No:</strong> {record.expiry_ref_number}</div>
              <div style={{ textAlign: "right" }}><strong>Status:</strong> {record.is_verified || "Draft"}</div>
              <div><strong>Outlet / Location:</strong> {getOutletName(record.outlet_code)}</div>
              <div style={{ textAlign: "right" }}><strong>Date:</strong> {fmtDateTime(record.created_date)}</div>
              <div><strong>Recorded By:</strong> {record.created_by || "system"}</div>
              <div style={{ textAlign: "right" }}>
                {record.approved_by && (
                  <span><strong>Approved By:</strong> {record.approved_by} ({fmtDateTime(record.approved_date)})</span>
                )}
              </div>
            </div>

            {record.remarks && (
              <div style={{ fontSize: 11, background: "#f9fafb", padding: "6px 10px", borderRadius: 4, marginBottom: 14 }}>
                <strong>Remarks / Justification:</strong> {record.remarks}
              </div>
            )}

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginBottom: 16 }}>
              <thead>
                <tr style={{ background: "#f0fdfa", borderBottom: "1.5px solid #0d9488" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>#</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Medicine Name</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Batch</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Expiry Date</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Rate (₹)</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Qty</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "6px 8px" }}>{idx + 1}</td>
                    <td style={{ padding: "6px 8px", fontWeight: "bold" }}>{item.item_name || `Item #${item.item_id}`}</td>
                    <td style={{ padding: "6px 8px" }}>{item.batch_number || "-"}</td>
                    <td style={{ padding: "6px 8px" }}>{fmtDate(item.expiry_date)}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{Number(item.Selling_Price || item.mrp || 0).toFixed(2)}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: "bold" }}>{item.quantity || 0}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{Number(item.total_amount || (item.quantity * (item.Selling_Price || item.mrp || 0))).toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: "bold", borderTop: "2px solid #0d9488", background: "#f8fafc" }}>
                  <td colSpan={5} style={{ padding: "8px", textAlign: "right" }}>TOTAL:</td>
                  <td style={{ padding: "8px", textAlign: "right", color: "#dc2626" }}>{totalQty}</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>₹{totalAmt.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, fontSize: 11, textAlign: "center" }}>
              <div>
                <div style={{ borderTop: "1px dashed #6b7280", paddingTop: 4 }}>Prepared By (Pharmacist)</div>
              </div>
              <div>
                <div style={{ borderTop: "1px dashed #6b7280", paddingTop: 4 }}>Verified By (Store Incharge)</div>
              </div>
              <div>
                <div style={{ borderTop: "1px dashed #6b7280", paddingTop: 4 }}>Approved By (Medical Supdt)</div>
              </div>
            </div>
          </div>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("en-GB");
  } catch {
    return "-";
  }
};

const fmtDateTime = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

const isExpiredDate = (expDate) => {
  if (!expDate) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expDate);
    return exp <= today;
  } catch {
    return false;
  }
};

const isExpiringSoonDate = (expDate, days = 90) => {
  if (!expDate) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expDate);
    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= days;
  } catch {
    return false;
  }
};

const DRUG_PURCHASE_LABEL = "Drug Purchase (Main Store)";
const DRUG_PURCHASE_VALUE = "__DRUG_PURCHASE__";

function getAuthContext() {
  const raw =
    localStorage.getItem("auth-outlet-code") ||
    localStorage.getItem("outletCode") ||
    localStorage.getItem("outlet_code") ||
    localStorage.getItem("Outlet-Code") ||
    sessionStorage.getItem("auth-outlet-code") ||
    sessionStorage.getItem("outletCode") ||
    sessionStorage.getItem("outlet_code") ||
    sessionStorage.getItem("Outlet-Code") ||
    "";

  const outletCode =
    !raw || raw === "null" || raw === "None" || raw === "system" || raw === "undefined"
      ? ""
      : raw.trim();

  const isDrugPurchase = outletCode === "";
  return { outletCode, isDrugPurchase };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ExpiryMedicines = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "http://127.0.0.1:2609/_b_a_c_k_e_n_d/HMS/";
  const { outletCode: loggedOutlet, isDrugPurchase } = getAuthContext();

  // Outlets
  const [outlets, setOutlets] = useState([]);

  // Filter state
  const [filterOutlet, setFilterOutlet] = useState(isDrugPurchase ? "" : loggedOutlet);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [searchQ, setSearchQ] = useState("");

  // Records state
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Form panel state
  const [showForm, setShowForm] = useState(false);
  const [entryOutlet, setEntryOutlet] = useState(isDrugPurchase ? "" : loggedOutlet);
  const [remarks, setRemarks] = useState("");
  const [addedItems, setAddedItems] = useState([]);

  // Medicine search & selection state
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineResults, setMedicineResults] = useState([]);
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchIdx, setSelectedBatchIdx] = useState("");
  const [quantity, setQuantity] = useState("");

  // Modals state
  const [confirmModal, setConfirmModal] = useState(null); // { type: "approve", record }
  const [rejectModalRecord, setRejectModalRecord] = useState(null);
  const [printRecord, setPrintRecord] = useState(null);
  const [detailsRecord, setDetailsRecord] = useState(null);

  const medicineSearchRef = useRef(null);

  // ── Fetch Outlets ──────────────────────────────────────────────────────────
  const fetchOutlets = useCallback(async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_active_outlets/`, "GET");
      const list = res?.data?.data ?? (Array.isArray(res?.data) ? res.data : []);
      const filtered = Array.isArray(list)
        ? list.filter((o) => o.outlet_name && o.outlet_name.trim().toLowerCase() !== "drug purchase")
        : [];
      setOutlets(filtered);
    } catch {
      toast.error("Failed to fetch outlets");
    }
  }, [HmsBaseUrl]);

  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  // Click outside medicine dropdown
  useEffect(() => {
    const handleOutside = (e) => {
      if (medicineSearchRef.current && !medicineSearchRef.current.contains(e.target)) {
        setShowMedDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ── Fetch Expiry Records ───────────────────────────────────────────────────
  const fetchRecords = useCallback(
    async (
      p = page,
      size = pageSize,
      q = searchQ,
      status = filterStatus,
      outlet = filterOutlet,
      from = filterFromDate,
      to = filterToDate
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: p,
          page_size: size,
        });

        if (q && q.trim()) params.append("search", q.trim());
        if (status && status !== "ALL") params.append("status", status);
        if (outlet !== undefined && outlet !== null && outlet !== "ALL") {
          params.append("outlet_code", outlet === DRUG_PURCHASE_VALUE ? "" : outlet);
        }
        if (from) params.append("from_date", from);
        if (to) params.append("to_date", to);

        const res = await apiRequest(`${HmsBaseUrl}expiry-medicines/?${params.toString()}`, "GET");
        const payload = res?.data;
        const rows = payload?.data ?? (Array.isArray(payload) ? payload : (Array.isArray(res?.data) ? res.data : []));
        const all = Array.isArray(rows) ? rows : [];

        setRecords(all);
        const count = payload?.count !== undefined ? payload.count : (res?.count !== undefined ? res.count : all.length);
        setTotalCount(count);
        setTotalPages(payload?.total_pages || Math.ceil(count / size) || 1);
        setPage(payload?.current_page || p);
      } catch {
        toast.error("Failed to fetch expiry records");
      } finally {
        setLoading(false);
      }
    },
    [HmsBaseUrl, page, pageSize, searchQ, filterStatus, filterOutlet, filterFromDate, filterToDate]
  );

  useEffect(() => {
    fetchRecords(page, pageSize, searchQ, filterStatus, filterOutlet, filterFromDate, filterToDate);
  }, [page, pageSize, searchQ, filterStatus, filterOutlet, filterFromDate, filterToDate, fetchRecords]);

  // ── Helper: Get Outlet Name ────────────────────────────────────────────────
  const getOutletName = useCallback(
    (code) => {
      if (!code || code === DRUG_PURCHASE_VALUE) return DRUG_PURCHASE_LABEL;
      const found = outlets.find((o) => o.outlet_code === code);
      return found ? found.outlet_name : code;
    },
    [outlets]
  );

  // ── Search Medicines ───────────────────────────────────────────────────────
  const searchMedicines = useCallback(
    async (query) => {
      if (!query || query.length < 2) {
        setMedicineResults([]);
        setShowMedDropdown(false);
        return;
      }
      try {
        const cleanQ = query.trim().toUpperCase();
        const params = new URLSearchParams({ search: query.trim(), page: "1", page_size: "100" });
        params.append("outlet_code", entryOutlet === DRUG_PURCHASE_VALUE ? "" : entryOutlet);
        const res = await apiRequest(`${HmsBaseUrl}pharmacy-stock/?${params}`, "GET");
        const payload = res?.data;
        const raw = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(res) ? res : []));
        const seen = new Set();
        const unique = raw
          .filter((s) => {
            if (seen.has(s.item_id)) return false;
            seen.add(s.item_id);
            return true;
          })
          .map((s) => ({
            ...s,
            item_name: s.item_name ? String(s.item_name).toUpperCase() : s.item_name,
          }))
          .filter((s) => String(s.item_name || "").toUpperCase().startsWith(cleanQ))
          .sort((a, b) => String(a.item_name || "").localeCompare(String(b.item_name || ""), undefined, { sensitivity: "base" }));
        setMedicineResults(unique);
        setShowMedDropdown(unique.length > 0);
      } catch {
        setMedicineResults([]);
      }
    },
    [HmsBaseUrl, entryOutlet]
  );

  // ── Fetch Batches for Selected Item ─────────────────────────────────────────
  const fetchBatchesForItem = useCallback(
    async (itemId) => {
      try {
        const params = new URLSearchParams({ item_id: itemId, page: "all" });
        params.append("outlet_code", entryOutlet === DRUG_PURCHASE_VALUE ? "" : entryOutlet);
        const res = await apiRequest(`${HmsBaseUrl}pharmacy-stock/?${params}`, "GET");
        const payload = res?.data;
        const stocks = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(res) ? res : []));
        const batches = stocks
          .filter((s) => Number(s.available_qty ?? 0) > 0)
          .map((s) => ({
            stock_id: s.stock_id,
            batch_number: s.batch_number || "-",
            hsn_code: s.hsn_code || "",
            outlet_code: s.outlet_code || "",
            mrp: s.mrp || 0,
            Selling_Price: s.Selling_Price || s.selling_price || s.mrp || 0,
            available_qty: Number(s.available_qty ?? 0),
            expiry_date: s.expiry_date || null,
          }));
        setAvailableBatches(batches);
        setSelectedBatchIdx(batches.length === 1 ? 0 : "");
      } catch {
        setAvailableBatches([]);
        setSelectedBatchIdx("");
      }
    },
    [HmsBaseUrl, entryOutlet]
  );

  // Quick Find Expired Batches in Outlet
  const handleQuickLoadExpired = async () => {
    try {
      toast.info("Scanning outlet for expired batches…");
      const params = new URLSearchParams({ page: "all" });
      params.append("outlet_code", entryOutlet === DRUG_PURCHASE_VALUE ? "" : entryOutlet);
      const res = await apiRequest(`${HmsBaseUrl}pharmacy-stock/?${params}`, "GET");
      const payload = res?.data;
      const stocks = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(res) ? res : []));
      const expiredBatches = stocks.filter((s) => {
        const isExp = isExpiredDate(s.expiry_date);
        const hasQty = Number(s.available_qty ?? 0) > 0;
        return isExp && hasQty;
      });

      if (expiredBatches.length === 0) {
        toast.success("No expired batches found in this outlet with available stock!");
        return;
      }

      const toAdd = expiredBatches.map((s) => ({
        stock_id: s.stock_id,
        item_id: s.item_id,
        item_name: s.item_name || `Item #${s.item_id}`,
        batch_number: s.batch_number || "-",
        expiry_date: s.expiry_date,
        available_qty: Number(s.available_qty ?? 0),
        quantity: Number(s.available_qty ?? 0), // Default to writing off full expired qty
        mrp: Number(s.mrp || 0),
        Selling_Price: Number(s.Selling_Price || s.selling_price || s.mrp || 0),
        total_amount: Number(s.available_qty ?? 0) * Number(s.Selling_Price || s.selling_price || s.mrp || 0),
      }));

      setAddedItems((prev) => {
        const existingKeys = new Set(prev.map((p) => `${p.item_id}_${p.batch_number}`));
        const newOnes = toAdd.filter((item) => !existingKeys.has(`${item.item_id}_${item.batch_number}`));
        return [...prev, ...newOnes];
      });

      toast.success(`Loaded ${toAdd.length} expired batch(es) into the write-off list!`);
    } catch {
      toast.error("Failed to scan expired stocks");
    }
  };

  const handleMedicineSearchInput = (e) => {
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

  const selectedBatch = selectedBatchIdx !== "" ? availableBatches[selectedBatchIdx] : null;

  const handleAddItem = () => {
    if (!selectedMedicine) {
      toast.error("Please select a medicine");
      return;
    }
    if (selectedBatchIdx === "" || !selectedBatch) {
      toast.error("Please select a batch");
      return;
    }
    const q = parseInt(quantity, 10);
    if (!q || q <= 0) {
      toast.error("Please enter a valid quantity > 0");
      return;
    }
    if (q > selectedBatch.available_qty) {
      toast.error(`Cannot exceed available quantity (${selectedBatch.available_qty})`);
      return;
    }

    const alreadyAdded = addedItems.some(
      (it) => it.item_id === selectedMedicine.item_id && it.batch_number === selectedBatch.batch_number
    );
    if (alreadyAdded) {
      toast.error("This batch is already added to the list");
      return;
    }

    const rate = Number(selectedBatch.Selling_Price || selectedBatch.mrp || 0);
    const itemTotal = q * rate;

    setAddedItems((prev) => [
      ...prev,
      {
        stock_id: selectedBatch.stock_id,
        item_id: selectedMedicine.item_id,
        item_name: selectedMedicine.item_name,
        batch_number: selectedBatch.batch_number,
        expiry_date: selectedBatch.expiry_date,
        available_qty: selectedBatch.available_qty,
        quantity: q,
        mrp: Number(selectedBatch.mrp || 0),
        Selling_Price: rate,
        total_amount: itemTotal,
      },
    ]);

    // Reset picker
    setMedicineSearch("");
    setSelectedMedicine(null);
    setAvailableBatches([]);
    setSelectedBatchIdx("");
    setQuantity("");
  };

  const handleRemoveItem = (index) => {
    setAddedItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit Draft ───────────────────────────────────────────────────────────
  const handleSubmitDraft = async () => {
    if (addedItems.length === 0) {
      toast.error("Please add at least one medicine item");
      return;
    }
    if (!remarks.trim()) {
      toast.error("Please enter remarks/reason for the expiry entry");
      return;
    }

    const payload = {
      outlet_code: entryOutlet === DRUG_PURCHASE_VALUE ? "" : entryOutlet,
      remarks: remarks.trim(),
      items: addedItems.map((it) => ({
        stock_id: it.stock_id,
        item_id: it.item_id,
        batch_number: it.batch_number,
        quantity: it.quantity,
        mrp: it.mrp,
        Selling_Price: it.Selling_Price,
        total_amount: it.total_amount,
      })),
    };

    try {
      const res = await apiRequest(`${HmsBaseUrl}expiry-medicines/`, "POST", payload);
      if (res?.data?.success) {
        toast.success(res.data.message || "Expiry record created as Draft!");
        setShowForm(false);
        setAddedItems([]);
        setRemarks("");
        fetchRecords(1, pageSize, searchQ, filterStatus, filterOutlet, filterFromDate, filterToDate);
      } else {
        toast.error(res?.data?.error || "Failed to create expiry record");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Error creating expiry record");
    }
  };

  // ── Approve Action ─────────────────────────────────────────────────────────
  const handleApproveConfirm = async () => {
    if (!confirmModal?.record) return;
    const ref = confirmModal.record.expiry_ref_number;
    try {
      const res = await apiRequest(`${HmsBaseUrl}expiry-medicines-action/`, "POST", {
        expiry_ref_number: ref,
        action: "approve",
      });
      if (res?.data?.success) {
        toast.success("Expiry record approved! Stock has been deducted.");
        setConfirmModal(null);
        fetchRecords(page, pageSize, searchQ, filterStatus, filterOutlet, filterFromDate, filterToDate);
      } else {
        toast.error(res?.data?.error || "Failed to approve record");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Error approving record");
    }
  };

  // ── Reject Action ──────────────────────────────────────────────────────────
  const handleRejectConfirm = async (reason) => {
    if (!rejectModalRecord) return;
    const ref = rejectModalRecord.expiry_ref_number;
    try {
      const res = await apiRequest(`${HmsBaseUrl}expiry-medicines-action/`, "POST", {
        expiry_ref_number: ref,
        action: "reject",
        rejected_reason: reason,
      });
      if (res?.data?.success) {
        toast.info("Expiry record cancelled/rejected");
        setRejectModalRecord(null);
        fetchRecords(page, pageSize, searchQ, filterStatus, filterOutlet, filterFromDate, filterToDate);
      } else {
        toast.error(res?.data?.error || "Failed to cancel record");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Error cancelling record");
    }
  };

  // ── Row Kebab Menu ─────────────────────────────────────────────────────────
  const RowActions = ({ record }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const status = record.is_verified || "Draft";
    const isApproved = status === "Approved";
    const isRejected = status === "Rejected";
    const isDraft = status === "Draft";

    useEffect(() => {
      const handleOutside = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", handleOutside);
      return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    return (
      <KebabWrapper ref={ref}>
        <KebabBtn onClick={() => setOpen((v) => !v)} title="Actions">
          ⋮
        </KebabBtn>
        {open && (
          <KebabMenu>
            <KebabItem
              onClick={() => {
                setOpen(false);
                setDetailsRecord(record);
              }}
            >
              👁 View Details
            </KebabItem>

            <KebabDivider />

            <KebabItem
              $disabled={!isDraft}
              title={isApproved ? "Already approved" : isRejected ? "Cannot approve rejected record" : "Approve this expiry record"}
              onClick={() => {
                if (!isDraft) return;
                setOpen(false);
                setConfirmModal({ type: "approve", record });
              }}
            >
              ✓ Approve Write-Off
            </KebabItem>

            <KebabItem
              $danger
              $disabled={isApproved || isRejected}
              title={isApproved ? "Approved records cannot be cancelled" : isRejected ? "Already cancelled" : "Cancel / Reject"}
              onClick={() => {
                if (isApproved || isRejected) return;
                setOpen(false);
                setRejectModalRecord(record);
              }}
            >
              ✕ Cancel / Reject
            </KebabItem>

            <KebabDivider />

            <KebabItem
              onClick={() => {
                setOpen(false);
                setPrintRecord(record);
              }}
            >
              🖨 Print Voucher
            </KebabItem>
          </KebabMenu>
        )}
      </KebabWrapper>
    );
  };

  // Quick stats summary
  const totalDraftCount = records.filter((r) => (r.is_verified || "Draft") === "Draft").length;
  const totalApprovedCount = records.filter((r) => r.is_verified === "Approved").length;
  const totalItemsAccum = records.reduce((s, r) => s + Number(r.total_quantity || 0), 0);
  const totalValAccum = records.reduce((s, r) => s + Number(r.total_amount || 0), 0);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>
        {/* ── Page Header ── */}
        <PageHeader>
          <div>
            <PageTitle>
              <span>⚠️</span> Expiry Medicines Management
            </PageTitle>
            <PageSubtitle>
              Record expired medicine batches, maintain write-off records, and authorize stock deductions
            </PageSubtitle>
          </div>
          <NewEntryBtn onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? "✕ Close Form" : "+ Record Expiry Entry"}
          </NewEntryBtn>
        </PageHeader>

        {/* ── Quick Stats ── */}
        <StatsGrid>
          <StatCard $color="#0d9488">
            <StatTitle>Total Records</StatTitle>
            <StatNumber $color="#0d9488">{totalCount}</StatNumber>
            <StatDesc>All recorded entries</StatDesc>
          </StatCard>
          <StatCard $color="#d97706">
            <StatTitle>Pending Approval</StatTitle>
            <StatNumber $color="#d97706">{totalDraftCount}</StatNumber>
            <StatDesc>Awaiting verification</StatDesc>
          </StatCard>
          <StatCard $color="#16a34a">
            <StatTitle>Approved Entries</StatTitle>
            <StatNumber $color="#16a34a">{totalApprovedCount}</StatNumber>
            <StatDesc>Stock deducted</StatDesc>
          </StatCard>
          <StatCard $color="#dc2626">
            <StatTitle>Total Expired Value</StatTitle>
            <StatNumber $color="#dc2626">₹{totalValAccum.toFixed(2)}</StatNumber>
            <StatDesc>{totalItemsAccum} total units</StatDesc>
          </StatCard>
        </StatsGrid>

        {/* ── Collapsible Record Entry Form ── */}
        {showForm && (
          <FormPanel>
            <FormPanelBody>
              <SectionTitle>
                <span>📝</span> Record New Expiry Write-Off
              </SectionTitle>

              {/* Outlet selection */}
              <FormRow style={{ marginBottom: 16 }}>
                <InputWrapper style={{ minWidth: 260 }}>
                  <Label>
                    Outlet / Location <span style={{ color: "#dc2626" }}>*</span>
                  </Label>
                  <SearchSelect
                    value={entryOutlet === "" ? DRUG_PURCHASE_VALUE : entryOutlet}
                    onChange={(val) => {
                      const sel = val === DRUG_PURCHASE_VALUE ? "" : val;
                      setEntryOutlet(sel);
                      setMedicineSearch("");
                      setSelectedMedicine(null);
                      setAvailableBatches([]);
                      setSelectedBatchIdx("");
                      setAddedItems([]);
                    }}
                    options={[
                      { value: DRUG_PURCHASE_VALUE, label: DRUG_PURCHASE_LABEL },
                      ...outlets.map((o) => ({
                        value: o.outlet_code,
                        label: `${o.outlet_name} (${o.outlet_code})`,
                      })),
                    ]}
                    placeholder="Select Outlet"
                  />
                </InputWrapper>

                <div style={{ alignSelf: "flex-end" }}>
                  <Button
                    type="button"
                    onClick={handleQuickLoadExpired}
                    style={{
                      background: "#fef3c7",
                      color: "#b45309",
                      border: "1.5px solid #fde68a",
                      fontWeight: 700,
                      height: 38,
                    }}
                    title="Automatically find and load all expired stock batches in this outlet"
                  >
                    ⚡ Quick Scan Expired Batches in this Outlet
                  </Button>
                </div>
              </FormRow>

              {/* Medicine & Batch Selector Box */}
              <MedicineBox>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#c2410c", marginBottom: 12 }}>
                  ➕ Select Medicine & Expired Batch
                </div>

                <FormRow>
                  {/* Medicine Search */}
                  <InputWrapper style={{ flex: 2, minWidth: 240 }}>
                    <Label>Search Medicine</Label>
                    <RelativeWrapper ref={medicineSearchRef}>
                      <Input
                        type="text"
                        placeholder="Type medicine name (min 2 chars)…"
                        value={medicineSearch}
                        onChange={handleMedicineSearchInput}
                        onFocus={() => {
                          if (medicineResults.length > 0) setShowMedDropdown(true);
                        }}
                      />
                      {showMedDropdown && (
                        <SearchDropdown>
                          {medicineResults.map((med) => (
                            <DropdownItem key={med.item_id} onClick={() => handleSelectMedicine(med)}>
                              <span>{med.item_name}</span>
                              <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>ID: {med.item_id}</span>
                            </DropdownItem>
                          ))}
                        </SearchDropdown>
                      )}
                    </RelativeWrapper>
                  </InputWrapper>

                  {/* Batch Selection */}
                  <InputWrapper style={{ flex: 2, minWidth: 220 }}>
                    <Label>Select Batch</Label>
                    <select
                      style={{
                        padding: "8px 10px",
                        border: "1.5px solid #d1d5db",
                        borderRadius: 7,
                        fontSize: "0.85rem",
                        color: "#374151",
                        background: "white",
                        height: 38,
                        outline: "none",
                      }}
                      value={selectedBatchIdx}
                      onChange={(e) => {
                        setSelectedBatchIdx(e.target.value === "" ? "" : Number(e.target.value));
                        setQuantity("");
                      }}
                      disabled={availableBatches.length === 0}
                    >
                      <option value="">
                        {availableBatches.length === 0 ? "No batches available" : "-- Select Batch --"}
                      </option>
                      {availableBatches.map((b, idx) => {
                        const expired = isExpiredDate(b.expiry_date);
                        return (
                          <option key={idx} value={idx}>
                            Batch: {b.batch_number} | Exp: {fmtDate(b.expiry_date)} | Avail: {b.available_qty} {expired ? " (EXPIRED)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </InputWrapper>

                  {/* Expiry Date Display */}
                  <InputWrapper style={{ flex: 1, minWidth: 120 }}>
                    <Label>Batch Expiry</Label>
                    <ReadonlyInput
                      value={selectedBatch ? fmtDate(selectedBatch.expiry_date) : "-"}
                      readOnly
                    />
                    {selectedBatch && isExpiredDate(selectedBatch.expiry_date) && (
                      <StockWarn style={{ color: "#dc2626", fontWeight: 700 }}>
                        ⚠️ EXPIRED
                      </StockWarn>
                    )}
                    {selectedBatch && !isExpiredDate(selectedBatch.expiry_date) && isExpiringSoonDate(selectedBatch.expiry_date) && (
                      <StockWarn>⚠️ Expiring Soon</StockWarn>
                    )}
                  </InputWrapper>

                  {/* Available Stock */}
                  <InputWrapper style={{ flex: 1, minWidth: 100 }}>
                    <Label>Avail Qty</Label>
                    <ReadonlyInput
                      value={selectedBatch ? selectedBatch.available_qty : "-"}
                      readOnly
                    />
                  </InputWrapper>

                  {/* Quantity to Write-off */}
                  <InputWrapper style={{ flex: 1, minWidth: 110 }}>
                    <Label>Expired Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      max={selectedBatch ? selectedBatch.available_qty : undefined}
                      placeholder="Qty"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      disabled={!selectedBatch}
                    />
                  </InputWrapper>

                  {/* Add Button */}
                  <div style={{ alignSelf: "flex-end" }}>
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      style={{ height: 38, padding: "0 18px", fontWeight: 700 }}
                      disabled={!selectedBatch || !quantity}
                    >
                      + Add Item
                    </Button>
                  </div>
                </FormRow>
              </MedicineBox>

              {/* Added Items Table */}
              {addedItems.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151", marginBottom: 8 }}>
                    Items in this Expiry Record ({addedItems.length})
                  </div>
                  <AddedItemsTable>
                    <thead>
                      <tr>
                        <ATh>#</ATh>
                        <ATh>Medicine Name</ATh>
                        <ATh>Batch</ATh>
                        <ATh>Expiry Date</ATh>
                        <ATh style={{ textAlign: "right" }}>Rate / MRP (₹)</ATh>
                        <ATh style={{ textAlign: "right" }}>Expired Qty</ATh>
                        <ATh style={{ textAlign: "right" }}>Total Amount (₹)</ATh>
                        <ATh style={{ textAlign: "center" }}>Action</ATh>
                      </tr>
                    </thead>
                    <tbody>
                      {addedItems.map((item, idx) => (
                        <tr key={idx}>
                          <ATd>{idx + 1}</ATd>
                          <ATd style={{ fontWeight: 600 }}>{item.item_name}</ATd>
                          <ATd>{item.batch_number}</ATd>
                          <ATd>
                            {fmtDate(item.expiry_date)}{" "}
                            {isExpiredDate(item.expiry_date) ? (
                              <ExpiredTag>Expired</ExpiredTag>
                            ) : isExpiringSoonDate(item.expiry_date) ? (
                              <ExpiringSoonTag>Near Expiry</ExpiringSoonTag>
                            ) : null}
                          </ATd>
                          <ATd style={{ textAlign: "right" }}>{item.Selling_Price?.toFixed(2)}</ATd>
                          <ATd style={{ textAlign: "right", fontWeight: 700, color: "#dc2626" }}>
                            {item.quantity}
                          </ATd>
                          <ATd style={{ textAlign: "right", fontWeight: 700 }}>
                            {item.total_amount?.toFixed(2)}
                          </ATd>
                          <ATd style={{ textAlign: "center" }}>
                            <RemoveBtn onClick={() => handleRemoveItem(idx)}>✕ Remove</RemoveBtn>
                          </ATd>
                        </tr>
                      ))}
                      <tr style={{ background: "#f8fafc", fontWeight: 700 }}>
                        <ATd colSpan={5} style={{ textAlign: "right" }}>
                          TOTAL WRITE-OFF:
                        </ATd>
                        <ATd style={{ textAlign: "right", color: "#dc2626" }}>
                          {addedItems.reduce((s, it) => s + Number(it.quantity || 0), 0)}
                        </ATd>
                        <ATd style={{ textAlign: "right" }}>
                          ₹{addedItems.reduce((s, it) => s + Number(it.total_amount || 0), 0).toFixed(2)}
                        </ATd>
                        <ATd />
                      </tr>
                    </tbody>
                  </AddedItemsTable>
                </div>
              )}

              {/* Remarks Textarea */}
              <div style={{ marginBottom: 18 }}>
                <Label>
                  Remarks / Reason for Write-Off <span style={{ color: "#dc2626" }}>*</span>
                </Label>
                <Textarea
                  placeholder="Explain why these medicines are being condemned / written-off (e.g. Expired on shelf, damaged seal, ampoule broken)…"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              {/* Form Buttons */}
              <ButtonContainer style={{ justifyContent: "flex-end", gap: 10 }}>
                <Button
                  type="button"
                  secondary
                  onClick={() => {
                    setShowForm(false);
                    setAddedItems([]);
                    setRemarks("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  success
                  onClick={handleSubmitDraft}
                  disabled={addedItems.length === 0 || !remarks.trim()}
                  style={{ fontWeight: 700 }}
                >
                  ✓ Submit Expiry Entry (Draft)
                </Button>
              </ButtonContainer>
            </FormPanelBody>
          </FormPanel>
        )}

        {/* ── Filters Bar ── */}
        <FilterRow>
          {/* Status Filter */}
          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <SearchSelect
              value={filterStatus}
              onChange={(val) => setFilterStatus(val)}
              options={[
                { value: "ALL", label: "All Statuses" },
                { value: "Draft", label: "Draft (Pending)" },
                { value: "Approved", label: "Approved" },
                { value: "Rejected", label: "Rejected" },
              ]}
              placeholder="Status"
            />
          </FilterGroup>

          {/* Outlet Filter */}
          <FilterGroup style={{ minWidth: 180 }}>
            <FilterLabel>Outlet</FilterLabel>
            <SearchSelect
              value={filterOutlet === "" ? DRUG_PURCHASE_VALUE : filterOutlet}
              onChange={(val) => setFilterOutlet(val === DRUG_PURCHASE_VALUE ? "" : val)}
              options={[
                { value: "ALL", label: "All Outlets" },
                { value: DRUG_PURCHASE_VALUE, label: DRUG_PURCHASE_LABEL },
                ...outlets.map((o) => ({
                  value: o.outlet_code,
                  label: `${o.outlet_name} (${o.outlet_code})`,
                })),
              ]}
              placeholder="All Outlets"
            />
          </FilterGroup>

          {/* Date range */}
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

          {/* Search box */}
          <FilterGroup style={{ flex: 1, minWidth: 200 }}>
            <FilterLabel>Search</FilterLabel>
            <FilterInput
              type="text"
              placeholder="Ref No, Medicine, Batch, Remarks…"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchRecords(1, pageSize, searchQ, filterStatus, filterOutlet, filterFromDate, filterToDate);
                }
              }}
            />
          </FilterGroup>

          <SearchBtn
            onClick={() =>
              fetchRecords(1, pageSize, searchQ, filterStatus, filterOutlet, filterFromDate, filterToDate)
            }
          >
            Search
          </SearchBtn>

          <ClearFilterBtn
            onClick={() => {
              setFilterStatus("ALL");
              setFilterOutlet("ALL");
              setFilterFromDate("");
              setFilterToDate("");
              setSearchQ("");
              fetchRecords(1, pageSize, "", "ALL", "ALL", "", "");
            }}
          >
            Reset
          </ClearFilterBtn>
        </FilterRow>

        {/* ── Table Toolbar (Items per page) ── */}
        <InvTopToolbar
          pageSize={pageSize}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setPage(1);
          }}
          totalRecords={totalCount}
          showTotal
        />

        {/* ── Expiry Records Table ── */}
        <TableWrapper>
          <Table>
            <thead>
              <Tr>
                <Th style={{ width: 45 }}>#</Th>
                <Th>Expiry Ref No</Th>
                <Th>Outlet / Location</Th>
                <Th>Items Summary</Th>
                <Th style={{ textAlign: "right" }}>Total Qty</Th>
                <Th style={{ textAlign: "right" }}>Total Value (₹)</Th>
                <Th>Remarks / Reason</Th>
                <Th>Created Info</Th>
                <Th>Approval Info</Th>
                <Th style={{ textAlign: "center" }}>Status</Th>
                <Th style={{ textAlign: "center", width: 60 }}>Actions</Th>
              </Tr>
            </thead>
            <tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={11} style={{ textAlign: "center", padding: "30px 0", color: "#6b7280" }}>
                    Loading expiry records…
                  </Td>
                </Tr>
              ) : records.length === 0 ? (
                <Tr>
                  <Td colSpan={11} style={{ textAlign: "center", padding: "36px 0", color: "#9ca3af" }}>
                    No expiry medicine records found. Click "+ Record Expiry Entry" to add one.
                  </Td>
                </Tr>
              ) : (
                records.map((r, idx) => {
                  const items = Array.isArray(r.items) ? r.items : [];
                  const status = r.is_verified || "Draft";
                  const rowNumber = (page - 1) * pageSize + idx + 1;

                  return (
                    <Tr key={r.expiry_ref_number || idx}>
                      <Td style={{ color: "#6b7280", fontSize: "0.8rem" }}>{rowNumber}</Td>

                      <Td style={{ fontWeight: 700, color: "#0f766e" }}>
                        <span
                          style={{ cursor: "pointer", textDecoration: "underline" }}
                          onClick={() => setDetailsRecord(r)}
                        >
                          {r.expiry_ref_number}
                        </span>
                      </Td>

                      <Td style={{ fontSize: "0.82rem" }}>{getOutletName(r.outlet_code)}</Td>

                      <Td>
                        <span
                          style={{
                            background: "#f0fdfa",
                            color: "#0f766e",
                            border: "1px solid #99f6e4",
                            padding: "3px 8px",
                            borderRadius: 12,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                          onClick={() => setDetailsRecord(r)}
                          title="Click to view full items list"
                        >
                          {items.length} item{items.length === 1 ? "" : "s"}
                        </span>
                        {items.length > 0 && (
                          <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: 3 }}>
                            {items[0]?.item_name || `Item #${items[0]?.item_id}`}
                            {items.length > 1 ? ` +${items.length - 1} more` : ""}
                          </div>
                        )}
                      </Td>

                      <Td style={{ textAlign: "right", fontWeight: 700, color: "#dc2626" }}>
                        {r.total_quantity || items.reduce((s, it) => s + Number(it.quantity || 0), 0)}
                      </Td>

                      <Td style={{ textAlign: "right", fontWeight: 700 }}>
                        ₹{Number(r.total_amount || 0).toFixed(2)}
                      </Td>

                      <Td style={{ maxWidth: 180, fontSize: "0.78rem", color: "#4b5563" }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.remarks}>
                          {r.remarks || "-"}
                        </div>
                      </Td>

                      <Td style={{ minWidth: 140 }}>
                        <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>
                          {r.created_by || "system"}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                          {fmtDateTime(r.created_date)}
                        </div>
                      </Td>

                      <Td style={{ minWidth: 150 }}>
                        {status === "Approved" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <InfoChip $color="#166534" $bg="#dcfce7" $border="#86efac">
                              ✓ {r.approved_by || "Approved"}
                            </InfoChip>
                            <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                              {fmtDateTime(r.approved_date)}
                            </span>
                          </div>
                        )}
                        {status === "Rejected" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <InfoChip $color="#991b1b" $bg="#fee2e2" $border="#fca5a5">
                              ✕ {r.rejected_by || "Rejected"}
                            </InfoChip>
                            <span style={{ fontSize: "0.72rem", color: "#dc2626" }} title={r.rejected_reason}>
                              Reason: {r.rejected_reason || "-"}
                            </span>
                          </div>
                        )}
                        {status === "Draft" && (
                          <span style={{ fontSize: "0.75rem", color: "#d97706", fontStyle: "italic" }}>
                            Pending Approval
                          </span>
                        )}
                      </Td>

                      <Td style={{ textAlign: "center" }}>
                        <StatusBadge $status={status}>{status}</StatusBadge>
                      </Td>

                      <Td style={{ textAlign: "center" }}>
                        <RowActions record={r} />
                      </Td>
                    </Tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </TableWrapper>

        {/* ── Pagination ── */}
        <InvPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          totalRecords={totalCount}
          pageSize={pageSize}
        />

        {/* ── Approve Confirm Modal ── */}
        {confirmModal?.type === "approve" && (
          <ConfirmModal
            title="✓ Approve Expiry Write-Off"
            message={`Approve ${confirmModal.record.expiry_ref_number}? This will permanently deduct the expired medicines from active stock.`}
            confirmLabel="Approve Write-Off"
            confirmColor="#0d9488"
            onConfirm={handleApproveConfirm}
            onClose={() => setConfirmModal(null)}
          />
        )}

        {/* ── Reject Modal ── */}
        {rejectModalRecord && (
          <RejectModal
            record={rejectModalRecord}
            onConfirm={handleRejectConfirm}
            onClose={() => setRejectModalRecord(null)}
          />
        )}

        {/* ── Details Modal ── */}
        {detailsRecord && (
          <DetailsModal
            record={detailsRecord}
            getOutletName={getOutletName}
            onClose={() => setDetailsRecord(null)}
          />
        )}

        {/* ── Print Voucher Modal ── */}
        {printRecord && (
          <PrintModal
            record={printRecord}
            getOutletName={getOutletName}
            onClose={() => setPrintRecord(null)}
          />
        )}
      </Container>
    </PageWrapper>
  );
};

export default ExpiryMedicines;

