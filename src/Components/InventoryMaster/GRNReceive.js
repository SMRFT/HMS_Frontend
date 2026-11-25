import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import {
  PageWrapper,
  Container,
  Table,
  Th,
  Td,
  Tr,
  FormContent,
  colors,
} from "../GlobalStyles";
import apiRequest from "../../Auth/apiRequest";
import {
  InvTopToolbar,
  InvPagination,
  getTodayDateString,
  useInvDropMenu,
  InvDropBtn,
  InvDropMenu,
  InvMenuItem,
} from "./InventoryUIHelper";
import {
  PackageCheck,
  Printer,
  Eye,
  ArrowRight,
  RefreshCw,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Calendar,
} from "lucide-react";

const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

/* ─── Styled Components ─────────────────────────────────────────────────── */
const PageHeader = styled.div`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: white;
  padding: 14px 20px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PageSubtitle = styled.p`
  margin: 3px 0 0;
  font-size: 0.78rem;
  opacity: 0.85;
`;

const HeaderNavBtn = styled.button`
  background: rgba(255, 255, 255, 0.18);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const TabsBar = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px 0;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  padding: 8px 16px;
  font-size: 0.82rem;
  font-weight: 600;
  border: none;
  background: ${(p) => (p.$active ? "white" : "transparent")};
  color: ${(p) => (p.$active ? colors.primaryDark : "#64748b")};
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  border: 1px solid ${(p) => (p.$active ? "#e2e8f0" : "transparent")};
  border-bottom: 1px solid ${(p) => (p.$active ? "white" : "transparent")};
  margin-bottom: -1px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
  &:hover {
    color: ${colors.primaryDark};
    background: ${(p) => (p.$active ? "white" : "#f1f5f9")};
  }
`;

const TabBadge = styled.span`
  background: ${(p) => (p.$active ? colors.tabBg : "#e2e8f0")};
  color: ${(p) => (p.$active ? colors.primaryDark : "#475569")};
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 12px;
`;

const ScrollTable = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const ActionBtn = styled.button`
  padding: 4px 10px;
  border: none;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${(p) =>
    p.$variant === "receive"
      ? "#059669"
      : p.$variant === "print"
        ? "#0284c7"
        : p.$variant === "view"
          ? "#475569"
          : colors.tabBg};
  color: white;
  transition: all 0.15s ease;
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  background: ${(p) =>
    p.$status === "Received"
      ? "#dcfce7"
      : p.$status === "Verified"
        ? "#fef9c3"
        : "#e2e8f0"};
  color: ${(p) =>
    p.$status === "Received"
      ? "#15803d"
      : p.$status === "Verified"
        ? "#a16207"
        : "#475569"};
`;

const OutletBadge = styled.span`
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid #bfdbfe;
  display: inline-block;
`;

/* ── Modal Styles ── */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalBox = styled.div`
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: ${(p) => p.$maxWidth || "1100px"};
  max-height: 94vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: white;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8fafc;
`;

const ModalFooter = styled.div`
  padding: 10px 18px;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
`;

const CloseIconBtn = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;

/* ─── Helper Functions ─────────────────────────────────────────────────── */
const getItemName = (it) => {
  if (!it) return "-";
  if (typeof it === "string") return it;
  const nm =
    it.name ||
    it.item_name ||
    it.itemName ||
    it.ItemName ||
    it.medicine_name ||
    it.medicineName ||
    it.product_name ||
    it.productName ||
    it.description ||
    it.item_description;
  if (nm && !String(nm).startsWith("Item #")) return nm;
  return it.item_id ? `Item #${it.item_id}` : (nm || "-");
};

const parseItems = (raw) => {
  if (!raw) return [];
  let parsed = raw;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      // ignore
    }
  }
  return Array.isArray(parsed) ? parsed : [];
};

const formatDate = (val) => {
  if (!val) return "-";
  try {
    return new Date(val).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const formatTime = (val) => {
  if (!val) return "";
  try {
    return new Date(val).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const formatExpiry = (d) => {
  if (!d) return "-";
  if (typeof d === "string" && d.includes("/")) return d;
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return String(d);
  }
};

const formatCurrency = (val) => {
  const num = parseFloat(val || 0);
  return isNaN(num) ? "0.00" : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/* ══════════════════════════════════════════════════════════════════════════
   PRINT SLIP HTML BUILDER — strictly matches StockTransfer.js thermal format
   ══════════════════════════════════════════════════════════════════════════ */
const buildGrnPrintHtml = (grn, items, outletName, vendorName) => {
  const RULE = "─".repeat(88);
  const RULE2 = "═".repeat(88);

  const totalItemsCount = items.length;
  const totalStockQty = items.reduce((sum, it) => {
    const qty = parseFloat(it.quantity || 0);
    const free = parseFloat(it.free || 0);
    const freePack = parseFloat(it.free_pack || 0);
    const packing = parseFloat(it.packing || 1) > 0 ? parseFloat(it.packing || 1) : 1;
    const tot = it.total_stock != null && parseFloat(it.total_stock) > 0
      ? parseFloat(it.total_stock)
      : qty + (free > 0 ? free : freePack * packing);
    return sum + tot;
  }, 0);

  const itemRows = items
    .map((it, idx) => {
      const qty = parseFloat(it.quantity || 0);
      const free = parseFloat(it.free || it.free_pack || 0);
      const mrp = parseFloat(it.unit_mrp || it.mrp || 0);
      const sRate = parseFloat(it.selling_price || it.purchase_rate || 0);
      const netAmt = parseFloat(it.net_amount || it.total_amount || (qty * sRate) || 0);
      const exp = it.expiry ? formatExpiry(it.expiry) : "-";

      return `<tr>
        <td style="padding:3px 2px">${idx + 1}</td>
        <td style="padding:3px 2px;word-break:break-word"><strong>${getItemName(it)}</strong></td>
        <td style="padding:3px 2px">${it.batch || it.batch_number || "-"}</td>
        <td style="padding:3px 2px">${exp}</td>
        <td class="right" style="padding:3px 2px">${qty}</td>
        <td class="right" style="padding:3px 2px">${free}</td>
        <td class="right" style="padding:3px 2px">${mrp > 0 ? mrp.toFixed(2) : "-"}</td>
        <td class="right" style="padding:3px 2px">${sRate > 0 ? sRate.toFixed(2) : "-"}</td>
        <td class="right" style="padding:3px 2px">${netAmt > 0 ? netAmt.toFixed(2) : "-"}</td>
      </tr>`;
    })
    .join("");

  const grnDisplayNo = grn.grn_number || grn.draft_number || "-";
  const dateStr = formatDate(grn.date || grn.created_date);
  const timeStr = formatTime(grn.date || grn.created_date);
  const resolvedVendor = (grn.vendor_name && !String(grn.vendor_name).startsWith("Vendor #") && !/^\d+$/.test(String(grn.vendor_name).trim()))
    ? grn.vendor_name
    : (vendorName && !String(vendorName).startsWith("Vendor #") && !/^\d+$/.test(String(vendorName).trim())
        ? vendorName
        : (grn.vendor_name || vendorName || (grn.vendor_id ? `Vendor #${grn.vendor_id}` : "-")));
  const vendorStr = resolvedVendor;
  const outletStr = outletName || grn.purchase_category || "OP/IP Pharmacy";
  const invStr = grn.invoice_no ? `${grn.invoice_no} (${formatDate(grn.invoice_date)})` : "-";
  const prepBy = grn.entered_by_name || grn.created_by_name || grn.created_by || "-";
  const verBy = grn.verified_by_name || grn.verified_by || "-";
  const recBy = grn.received_by_name || grn.received_by || "-";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>GRN Medicine Verification Slip — ${grnDisplayNo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Courier New", Courier, monospace;
      font-size: 11.5px;
      color: #111;
      line-height: 1.5;
      padding: 24px 32px;
      background: white;
    }
    .center { text-align: center; }
    .bold   { font-weight: bold; }
    .rule   { white-space: pre; overflow: hidden; margin: 3px 0; font-size: 11px; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11.5px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 6px 0; }
    thead th { font-weight: bold; padding: 4px 2px; text-align: left; border-bottom: 1px solid #333; }
    thead th.right { text-align: right; }
    tbody td { padding: 3px 2px; vertical-align: top; }
    tbody td.right { text-align: right; }
    .footer-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 11.5px; margin-top: 6px; }
    .sig-row { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 10px; font-size: 11.5px; }
    @page { margin: 16px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="center bold" style="font-size:15px;margin-bottom:2px">SHANMUGA HOSPITAL LIMITED</div>
  <div class="center" style="font-size:11px;margin-bottom:8px">04272706666</div>
  <div class="rule">${RULE2}</div>
  <div class="rule">${RULE2}</div>
  <div class="center bold" style="font-size:13.5px;margin:6px 0">GOODS RECEIPT NOTE (GRN) — MEDICINE VERIFICATION SLIP</div>
  <div class="rule">${RULE2}</div>
  <div class="rule" style="margin-bottom:8px">${RULE2}</div>

  <div class="meta-row">
    <span>GRN No.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong>${grnDisplayNo}</strong></span>
    <span>Date : <strong>${dateStr} ${timeStr}</strong></span>
  </div>
  <div class="meta-row">
    <span>Draft No.&nbsp;&nbsp;&nbsp;: <strong>${grn.draft_number || "-"}</strong></span>
    <span>Invoice No : <strong>${invStr}</strong></span>
  </div>
  <div class="meta-row">
    <span>Vendor&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong>${vendorStr}</strong></span>
    <span>Status : <strong>${grn.status || "Verified"}</strong></span>
  </div>
  <div class="meta-row" style="margin-bottom:8px">
    <span>Destination : <strong>${outletStr}</strong></span>
    <span>Pay Mode : <strong>${grn.payment_mode || "-"}</strong></span>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:26px">Sl</th>
        <th>Particulars</th>
        <th style="width:85px">Batch</th>
        <th style="width:60px">Expiry</th>
        <th class="right" style="width:40px">Qty</th>
        <th class="right" style="width:40px">Free</th>
        <th class="right" style="width:65px">MRP</th>
        <th class="right" style="width:65px">S.Rate</th>
        <th class="right" style="width:75px">Total (₹)</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="rule" style="margin-top:4px">${RULE}</div>
  <div class="rule" style="margin-bottom:6px">${RULE}</div>

  <div class="footer-row">
    <span>Total Items: ${totalItemsCount}</span>
    <span>Total Qty: ${totalStockQty}</span>
    <span>Net Inv Amount: ₹${formatCurrency(grn.net_invoice_amount || grn.total_amount)}</span>
  </div>

  <div class="rule" style="margin-top:6px">${RULE}</div>
  <div class="rule" style="margin-bottom:12px">${RULE}</div>

  <div class="sig-row">
    <div>Prepared By : <strong>${prepBy}</strong></div>
    <div>Verified By : <strong>${verBy}</strong></div>
    <div>Received By : <strong>${recBy}</strong></div>
  </div>

  <div style="margin-top:20px;font-size:10px;text-align:center;color:#666;">
    * This slip serves as the verified stock receiving document for outlet inventory addition.
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;
};

/* ─── Slip Preview Modal Component ─────────────────────────────────────────── */
const PrintSlipModal = ({ grn, outletName, vendorName, onClose }) => {
  const items = useMemo(() => parseItems(grn?.items), [grn]);
  const RULE = "─".repeat(84);
  const RULE2 = "═".repeat(84);

  const totalItemsCount = items.length;
  const totalStockQty = items.reduce((sum, it) => {
    const qty = parseFloat(it.quantity || 0);
    const free = parseFloat(it.free || it.free_pack || 0);
    const tot = it.total_stock != null && parseFloat(it.total_stock) > 0 ? parseFloat(it.total_stock) : qty + free;
    return sum + tot;
  }, 0);

  const handlePrint = () => {
    const html = buildGrnPrintHtml(grn, items, outletName, vendorName);
    const win = window.open("", "_blank", "width=850,height=650");
    if (!win) {
      toast.error("Popup blocked — please allow popups for this site and try again.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const monoStyle = {
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: "12px",
    lineHeight: "1.5",
    color: "#111",
    background: "#fff",
    padding: "20px 24px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
  };

  return (
    <Overlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalBox $maxWidth="850px">
        <ModalHeader>
          <ModalTitle>
            <Printer size={18} /> Print Verification Slip — {grn.grn_number || grn.draft_number}
          </ModalTitle>
          <CloseIconBtn type="button" onClick={onClose}>
            <X size={15} />
          </CloseIconBtn>
        </ModalHeader>
        <ModalBody>
          <div style={monoStyle}>
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "15px", marginBottom: "2px" }}>
              SHANMUGA HOSPITAL LIMITED
            </div>
            <div style={{ textAlign: "center", fontSize: "11px", marginBottom: "8px" }}>04272706666</div>
            <div style={{ fontSize: "11px", whiteSpace: "pre", overflowX: "hidden" }}>{RULE2}</div>
            <div style={{ fontSize: "11px", whiteSpace: "pre", overflowX: "hidden" }}>{RULE2}</div>
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "13.5px", margin: "6px 0" }}>
              GOODS RECEIPT NOTE (GRN) — MEDICINE VERIFICATION SLIP
            </div>
            <div style={{ fontSize: "11px", whiteSpace: "pre", overflowX: "hidden" }}>{RULE2}</div>
            <div style={{ fontSize: "11px", whiteSpace: "pre", marginBottom: "8px", overflowX: "hidden" }}>{RULE2}</div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>GRN No.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong>{grn.grn_number || grn.draft_number || "-"}</strong></span>
              <span>Date : <strong>{formatDate(grn.date || grn.created_date)} {formatTime(grn.date || grn.created_date)}</strong></span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Draft No.&nbsp;&nbsp;&nbsp;: <strong>{grn.draft_number || "-"}</strong></span>
              <span>Invoice No : <strong>{grn.invoice_no || "-"} ({formatDate(grn.invoice_date)})</strong></span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Vendor&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong>{
                (grn.vendor_name && !String(grn.vendor_name).startsWith("Vendor #") && !/^\d+$/.test(String(grn.vendor_name).trim()))
                  ? grn.vendor_name
                  : (vendorName && !String(vendorName).startsWith("Vendor #") && !/^\d+$/.test(String(vendorName).trim())
                      ? vendorName
                      : (grn.vendor_name || vendorName || (grn.vendor_id ? `Vendor #${grn.vendor_id}` : "-")))
              }</strong></span>
              <span>Status : <strong>{grn.status || "Verified"}</strong></span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Destination : <strong>{outletName || grn.purchase_category || "OP/IP Pharmacy"}</strong></span>
              <span>Pay Mode : <strong>{grn.payment_mode || "-"}</strong></span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "26px 1fr 85px 60px 40px 40px 65px 65px 75px", gap: "4px", fontWeight: "bold", borderBottom: "1px solid #333", paddingBottom: "4px" }}>
              <span>Sl</span>
              <span>Particulars</span>
              <span>Batch</span>
              <span>Expiry</span>
              <span style={{ textAlign: "right" }}>Qty</span>
              <span style={{ textAlign: "right" }}>Free</span>
              <span style={{ textAlign: "right" }}>MRP</span>
              <span style={{ textAlign: "right" }}>S.Rate</span>
              <span style={{ textAlign: "right" }}>Total</span>
            </div>

            {items.map((it, idx) => {
              const qty = parseFloat(it.quantity || 0);
              const free = parseFloat(it.free || it.free_pack || 0);
              const mrp = parseFloat(it.unit_mrp || it.mrp || 0);
              const sRate = parseFloat(it.selling_price || it.purchase_rate || 0);
              const netAmt = parseFloat(it.net_amount || it.total_amount || (qty * sRate) || 0);
              return (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "26px 1fr 85px 60px 40px 40px 65px 65px 75px", gap: "4px", padding: "3px 0", fontSize: "11px", alignItems: "start" }}>
                  <span>{idx + 1}</span>
                  <span style={{ wordBreak: "break-word" }}><strong>{getItemName(it)}</strong></span>
                  <span>{it.batch || it.batch_number || "-"}</span>
                  <span>{formatExpiry(it.expiry)}</span>
                  <span style={{ textAlign: "right" }}>{qty}</span>
                  <span style={{ textAlign: "right" }}>{free}</span>
                  <span style={{ textAlign: "right" }}>{mrp > 0 ? mrp.toFixed(2) : "-"}</span>
                  <span style={{ textAlign: "right" }}>{sRate > 0 ? sRate.toFixed(2) : "-"}</span>
                  <span style={{ textAlign: "right" }}>{netAmt > 0 ? netAmt.toFixed(2) : "-"}</span>
                </div>
              );
            })}

            <div style={{ fontSize: "11px", whiteSpace: "pre", marginTop: "4px", overflowX: "hidden" }}>{RULE}</div>
            <div style={{ fontSize: "11px", whiteSpace: "pre", marginBottom: "6px", overflowX: "hidden" }}>{RULE}</div>

            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "11.5px" }}>
              <span>Total Items: {totalItemsCount}</span>
              <span>Total Qty: {totalStockQty}</span>
              <span>Net Inv Amount: ₹{formatCurrency(grn.net_invoice_amount || grn.total_amount)}</span>
            </div>

            <div style={{ fontSize: "11px", whiteSpace: "pre", marginTop: "6px", overflowX: "hidden" }}>{RULE}</div>
            <div style={{ fontSize: "11px", whiteSpace: "pre", marginBottom: "16px", overflowX: "hidden" }}>{RULE}</div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", fontSize: "11.5px" }}>
              <div>Prepared By : <strong>{grn.entered_by_name || grn.created_by_name || grn.created_by || "-"}</strong></div>
              <div>Verified By : <strong>{grn.verified_by_name || grn.verified_by || "-"}</strong></div>
              <div>Received By : <strong>{grn.received_by_name || grn.received_by || "-"}</strong></div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <ActionBtn type="button" $variant="view" onClick={onClose}>
            Close
          </ActionBtn>
          <ActionBtn type="button" $variant="receive" onClick={handlePrint} style={{ padding: "6px 16px", fontSize: "0.82rem" }}>
            <Printer size={15} /> Print Slip
          </ActionBtn>
        </ModalFooter>
      </ModalBox>
    </Overlay>
  );
};

/* ─── Details Modal ───────────────────────────────────────────────────────── */
const DetailsModal = ({ grn, outletName, vendorName, onClose }) => {
  const items = useMemo(() => parseItems(grn?.items), [grn]);

  return (
    <Overlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalBox $maxWidth="1100px">
        <ModalHeader>
          <ModalTitle>
            <Eye size={18} /> GRN Items Breakdown — {grn.grn_number || grn.draft_number}
          </ModalTitle>
          <CloseIconBtn type="button" onClick={onClose}>
            <X size={15} />
          </CloseIconBtn>
        </ModalHeader>
        <ModalBody>
          <div style={{ background: "white", padding: "14px 18px", borderRadius: "6px", marginBottom: "14px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", fontSize: "0.82rem" }}>
              <div>
                <span style={{ color: "#64748b" }}>GRN Number:</span>{" "}
                <strong>{grn.grn_number || "Draft (Pending)"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Draft Number:</span>{" "}
                <strong>{grn.draft_number}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Destination:</span>{" "}
                <OutletBadge>{outletName || grn.purchase_category}</OutletBadge>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Vendor:</span>{" "}
                <strong>{vendorName || grn.vendor_name || (grn.vendor_id ? `Vendor #${grn.vendor_id}` : "-")}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Invoice No:</span>{" "}
                <strong>{grn.invoice_no}</strong> ({formatDate(grn.invoice_date)})
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Status:</span>{" "}
                <StatusPill $status={grn.status}>{grn.status}</StatusPill>
              </div>
            </div>
          </div>

          <ScrollTable style={{ background: "white", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <Table>
              <thead>
                <Tr>
                  <Th style={{ width: "30px" }}>#</Th>
                  <Th>Medicine / Particulars</Th>
                  <Th>Batch</Th>
                  <Th>Expiry</Th>
                  <Th style={{ textAlign: "right" }}>Qty</Th>
                  <Th style={{ textAlign: "right" }}>Free</Th>
                  <Th style={{ textAlign: "right" }}>Total Stock</Th>
                  <Th style={{ textAlign: "right" }}>MRP (₹)</Th>
                  <Th style={{ textAlign: "right" }}>Purchase Rate (₹)</Th>
                  <Th style={{ textAlign: "right" }}>Selling Price (₹)</Th>
                  <Th style={{ textAlign: "right" }}>GST (%)</Th>
                  <Th style={{ textAlign: "right" }}>Net Amount (₹)</Th>
                </Tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <Tr>
                    <Td colSpan={12} style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                      No items recorded in this GRN
                    </Td>
                  </Tr>
                ) : (
                  items.map((it, idx) => {
                    const qty = parseFloat(it.quantity || 0);
                    const free = parseFloat(it.free || it.free_pack || 0);
                    const totStock = it.total_stock != null && parseFloat(it.total_stock) > 0 ? parseFloat(it.total_stock) : qty + free;
                    const gst = (parseFloat(it.cgst_percent || it.selling_cgst_percent || 0) + parseFloat(it.sgst_percent || it.selling_sgst_percent || 0)) || 0;
                    return (
                      <Tr key={idx}>
                        <Td>{idx + 1}</Td>
                        <Td>
                          <strong>{getItemName(it)}</strong>
                          {it.hsn && <div style={{ fontSize: "0.7rem", color: "#64748b" }}>HSN: {it.hsn}</div>}
                        </Td>
                        <Td>{it.batch || it.batch_number || "-"}</Td>
                        <Td>{formatExpiry(it.expiry)}</Td>
                        <Td style={{ textAlign: "right" }}>{qty}</Td>
                        <Td style={{ textAlign: "right" }}>{free}</Td>
                        <Td style={{ textAlign: "right", fontWeight: 700, color: "#166534" }}>{totStock}</Td>
                        <Td style={{ textAlign: "right" }}>{formatCurrency(it.unit_mrp || it.mrp)}</Td>
                        <Td style={{ textAlign: "right" }}>{formatCurrency(it.purchase_rate || it.unit_cost)}</Td>
                        <Td style={{ textAlign: "right" }}>{formatCurrency(it.selling_price)}</Td>
                        <Td style={{ textAlign: "right" }}>{gst > 0 ? `${gst}%` : "0%"}</Td>
                        <Td style={{ textAlign: "right", fontWeight: 700 }}>
                          {formatCurrency(it.net_amount || it.total_amount)}
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </ScrollTable>
        </ModalBody>
        <ModalFooter>
          <ActionBtn type="button" $variant="view" onClick={onClose}>
            Close
          </ActionBtn>
        </ModalFooter>
      </ModalBox>
    </Overlay>
  );
};

/* ─── Confirm Receive Modal ─────────────────────────────────────────────────── */
const ConfirmReceiveModal = ({ grn, outletName, onConfirm, onCancel, loading }) => {
  const items = useMemo(() => parseItems(grn?.items), [grn]);
  const totalStockQty = items.reduce((sum, it) => {
    const qty = parseFloat(it.quantity || 0);
    const free = parseFloat(it.free || it.free_pack || 0);
    const tot = it.total_stock != null && parseFloat(it.total_stock) > 0 ? parseFloat(it.total_stock) : qty + free;
    return sum + tot;
  }, 0);

  return (
    <Overlay onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancel(); }}>
      <ModalBox $maxWidth="520px">
        <ModalHeader style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)" }}>
          <ModalTitle>
            <PackageCheck size={19} /> Confirm Stock Receipt
          </ModalTitle>
          <CloseIconBtn type="button" onClick={onCancel} disabled={loading}>
            <X size={15} />
          </CloseIconBtn>
        </ModalHeader>
        <ModalBody style={{ padding: "20px" }}>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
              <PackageCheck size={28} />
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: "1.05rem", color: "#0f172a" }}>
              Receive Stock into {outletName || grn.purchase_category || "Outlet"}?
            </h3>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
              This will update the outlet pharmacy stock for all verified medicines in this GRN.
            </p>
          </div>

          <div style={{ background: "#f1f5f9", borderRadius: "6px", padding: "12px 16px", fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>GRN Number:</span>
              <strong>{grn.grn_number}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Draft Number:</span>
              <span>{grn.draft_number}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Destination Outlet:</span>
              <strong style={{ color: "#1e40af" }}>{outletName || grn.purchase_category}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Total Items / Total Quantity:</span>
              <strong>{items.length} items ({totalStockQty} units)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Net Invoice Amount:</span>
              <strong style={{ color: "#15803d" }}>₹{formatCurrency(grn.net_invoice_amount || grn.total_amount)}</strong>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <ActionBtn type="button" $variant="view" onClick={onCancel} disabled={loading}>
            Cancel
          </ActionBtn>
          <ActionBtn
            type="button"
            $variant="receive"
            onClick={onConfirm}
            disabled={loading}
            style={{ padding: "8px 18px", fontSize: "0.85rem" }}
          >
            {loading ? "Receiving Stock..." : "✅ Confirm & Receive Stock"}
          </ActionBtn>
        </ModalFooter>
      </ModalBox>
    </Overlay>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT: GRNReceive
   ══════════════════════════════════════════════════════════════════════════ */
const GRNReceive = () => {
  const navigate = useNavigate();

  // Active Tab: "Verified" (Pending Receipt), "Received" (Completed), "All"
  const [activeTab, setActiveTab] = useState("Verified");

  // Table Data & Pagination
  const [grnList, setGrnList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState(getTodayDateString());
  const [toDate, setToDate] = useState(getTodayDateString());

  // Active Outlet resolution (OP for OP alone, IP for IP alone)
  const getActiveOutletInfo = useCallback(() => {
    const code = String(localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "").trim().toUpperCase();
    const name = String(localStorage.getItem("selected_outlet_name") || localStorage.getItem("outlet_name") || "").trim().toUpperCase();

    let category = "";
    let displayName = "ALL OUTLETS";

    if (code === "OLET002" || name.includes("OP")) {
      category = "OP PHARMACY";
      displayName = "OP PHARMACY";
    } else if (code === "OLET001" || name.includes("IP")) {
      category = "IP PHARMACY";
      displayName = "IP PHARMACY";
    } else if (code === "OLET006" || name.includes("DRUG")) {
      category = "DRUG PURCHASE";
      displayName = "DRUG PURCHASE";
    } else if (code === "OLET003" || name.includes("MAIN BLOCK") || name.includes("CENTRAL")) {
      category = "";
      displayName = name || "MAIN BLOCK";
    } else if (name) {
      category = name;
      displayName = name;
    }

    return { code, name, category, displayName };
  }, []);

  const [activeOutletInfo, setActiveOutletInfo] = useState(getActiveOutletInfo);

  useEffect(() => {
    const updateOutlet = () => {
      setActiveOutletInfo(getActiveOutletInfo());
      setPage(1);
    };
    window.addEventListener("outletChanged", updateOutlet);
    window.addEventListener("storage", updateOutlet);
    return () => {
      window.removeEventListener("outletChanged", updateOutlet);
      window.removeEventListener("storage", updateOutlet);
    };
  }, [getActiveOutletInfo]);

  // Masters
  const [outlets, setOutlets] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Modals state
  const [viewGrn, setViewGrn] = useState(null);
  const [printSlip, setPrintSlip] = useState(null);
  const [confirmReceiveGrn, setConfirmReceiveGrn] = useState(null);
  const [receiveLoading, setReceiveLoading] = useState(false);

  // Status Counts
  const [pendingCount, setPendingCount] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);

  // Dropdown action menu
  const { openMenuId, menuPos, openMenu, closeMenu } = useInvDropMenu();

  // Load Outlets & Vendors
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const outRes = await apiRequest(`${baseUrl}get_active_outlets/`, "GET");
        if (outRes?.success) {
          const list = Array.isArray(outRes.data)
            ? outRes.data
            : (Array.isArray(outRes.data?.data) ? outRes.data.data : []);
          setOutlets(list);
        }
      } catch (err) {
        console.warn("Failed to load outlets:", err);
      }

      try {
        const vRes = await apiRequest(`${baseUrl}vendors/?all=true&unlimited=true`, "GET");
        if (vRes?.success) {
          const payload = vRes.data;
          const list = Array.isArray(payload)
            ? payload
            : (Array.isArray(payload?.data)
              ? payload.data
              : (Array.isArray(payload?.results) ? payload.results : []));
          setVendors(list);
        } else if (Array.isArray(vRes)) {
          setVendors(vRes);
        }
      } catch (err) {
        console.warn("Failed to load vendors:", err);
      }
    };
    fetchMasters();
  }, []);

  const getOutletName = useCallback(
    (codeOrName) => {
      if (!codeOrName) return "OP / IP Pharmacy";
      const found = outlets.find(
        (o) => o.outlet_code === codeOrName || o.outlet_name?.toUpperCase() === String(codeOrName).toUpperCase()
      );
      if (found) return found.outlet_name;
      if (codeOrName === "MEDICINE_PURCHASE" || codeOrName === "OLET002") return "OP PHARMACY";
      if (codeOrName === "MEDICINE_PURCHASE_IP" || codeOrName === "OLET001") return "IP PHARMACY";
      if (codeOrName === "OPENING_STOCK_DRUG" || codeOrName === "OLET006") return "DRUG PURCHASE";
      return codeOrName;
    },
    [outlets]
  );

  const getVendorName = useCallback(
    (grnOrId) => {
      if (!grnOrId && grnOrId !== 0) return "-";
      if (typeof grnOrId === "object" && grnOrId !== null) {
        const directName = grnOrId.vendor_name || grnOrId.supplier_name;
        if (directName && !String(directName).startsWith("Vendor #") && !/^\d+$/.test(String(directName).trim())) {
          return directName;
        }
        const vid = grnOrId.vendor_id != null ? grnOrId.vendor_id : grnOrId.vendor;
        if (vid != null) {
          const found = vendors.find(
            (v) => String(v.vendor_id) === String(vid) || String(v.id) === String(vid)
          );
          if (found && (found.name || found.vendor_name)) return found.name || found.vendor_name;
          return `Vendor #${vid}`;
        }
        return directName || "-";
      }
      const found = vendors.find(
        (v) => String(v.vendor_id) === String(grnOrId) || String(v.id) === String(grnOrId)
      );
      if (found && (found.name || found.vendor_name)) return found.name || found.vendor_name;
      return `Vendor #${grnOrId}`;
    },
    [vendors]
  );

  // Fetch GRN List
  const fetchGRNList = useCallback(
    async (p = 1, ps = 10) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", p);
        params.set("page_size", ps);

        if (activeTab === "Verified") {
          params.set("status", "Verified");
        } else if (activeTab === "Received") {
          params.set("status", "Received");
        }

        if (search.trim()) params.set("search", search.trim());
        if (activeOutletInfo.category) params.set("purchase_category", activeOutletInfo.category);
        if (activeOutletInfo.code) params.set("outlet_code", activeOutletInfo.code);
        if (fromDate) params.set("from_date", fromDate);
        if (toDate) params.set("to_date", toDate);

        const res = await apiRequest(`${baseUrl}grn/?${params.toString()}`, "GET");
        if (res && res.success) {
          const payload = res.data;
          const rows = Array.isArray(payload)
            ? payload
            : (Array.isArray(payload?.data)
              ? payload.data
              : (Array.isArray(payload?.results) ? payload.results : []));
          const total = payload?.total_records ?? payload?.count ?? res?.total_count ?? rows.length;
          setGrnList(rows);
          setTotalCount(total);
        } else {
          setGrnList([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error("fetchGRNList error:", err);
        toast.error("Failed to fetch GRN records.");
        setGrnList([]);
      } finally {
        setLoading(false);
      }
    },
    [activeTab, search, activeOutletInfo, fromDate, toDate]
  );

  // Fetch counts for badges based on active date and outlet filters
  const fetchCounts = useCallback(async () => {
    try {
      const q = new URLSearchParams();
      q.set("page_size", "1");
      if (fromDate) q.set("from_date", fromDate);
      if (toDate) q.set("to_date", toDate);
      if (activeOutletInfo.category) q.set("purchase_category", activeOutletInfo.category);
      if (activeOutletInfo.code) q.set("outlet_code", activeOutletInfo.code);

      q.set("status", "Verified");
      const pRes = await apiRequest(`${baseUrl}grn/?${q.toString()}`, "GET");
      if (pRes?.success) {
        const pTotal = pRes.data?.total_records ?? pRes.data?.count ?? pRes.total_count ?? 0;
        setPendingCount(pTotal);
      }

      q.set("status", "Received");
      const rRes = await apiRequest(`${baseUrl}grn/?${q.toString()}`, "GET");
      if (rRes?.success) {
        const rTotal = rRes.data?.total_records ?? rRes.data?.count ?? rRes.total_count ?? 0;
        setReceivedCount(rTotal);
      }
    } catch {
      // quiet fail
    }
  }, [fromDate, toDate, activeOutletInfo]);

  useEffect(() => {
    fetchGRNList(page, pageSize);
    fetchCounts();
  }, [fetchGRNList, page, pageSize, fetchCounts]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setPage(1);
  };

  // Receive Action Handler
  const handleConfirmReceive = async () => {
    if (!confirmReceiveGrn) return;
    setReceiveLoading(true);
    try {
      const payload = {
        draft_number: confirmReceiveGrn.draft_number,
        grn_number: confirmReceiveGrn.grn_number,
      };

      const res = await apiRequest(`${baseUrl}grn-receive/`, "POST", payload);
      if (res?.success) {
        const msg = res.data?.message || res.message || "Stock successfully received into outlet inventory!";
        toast.success(msg);
        const updatedGrn = res.data?.data || res.data || confirmReceiveGrn;
        setConfirmReceiveGrn(null);
        fetchGRNList(page, pageSize);
        fetchCounts();
        // Prompt/open print slip immediately
        setPrintSlip({ ...updatedGrn, status: "Received" });
      } else {
        toast.error(res?.error || res?.data?.error || "Failed to receive stock into outlet.");
      }
    } catch (err) {
      console.error("handleConfirmReceive error:", err);
      toast.error("Network error while receiving stock.");
    } finally {
      setReceiveLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Container style={{ maxWidth: "100%", padding: "0 8px" }}>
        {/* ══ Header ══ */}
        <PageHeader>
          <div>
            <PageTitle>
              <PackageCheck size={22} /> GRN Stock Receipt
            </PageTitle>
            <PageSubtitle>
              Receive verified Goods Receipt Notes (GRN) into outlet pharmacy inventory &amp; print verification slips
            </PageSubtitle>
          </div>
        </PageHeader>

        {/* ══ Tabs ══ */}
        <TabsBar>
          <TabButton
            type="button"
            $active={activeTab === "Verified"}
            onClick={() => handleTabChange("Verified")}
          >
            <Clock size={15} /> Pending Receipt
            <TabBadge $active={activeTab === "Verified"}>{pendingCount}</TabBadge>
          </TabButton>
          <TabButton
            type="button"
            $active={activeTab === "Received"}
            onClick={() => handleTabChange("Received")}
          >
            <CheckCircle2 size={15} /> Received Stock
            <TabBadge $active={activeTab === "Received"}>{receivedCount}</TabBadge>
          </TabButton>
          <TabButton
            type="button"
            $active={activeTab === "All"}
            onClick={() => handleTabChange("All")}
          >
            <FileText size={15} /> All Verified &amp; Received
          </TabButton>
        </TabsBar>

        {/* ══ Toolbar Filters ══ */}
        <FormContent style={{ padding: "10px 0" }}>
          <InvTopToolbar
            searchPlaceholder="Search GRN No, Draft No, Vendor, Medicine..."
            search={search}
            searchValue={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            fromDate={fromDate}
            toDate={toDate}
            onFromDateChange={(val) => {
              setFromDate(val);
              setPage(1);
            }}
            onToDateChange={(val) => {
              setToDate(val);
              setPage(1);
            }}
            onReset={() => {
              setSearch("");
              setFromDate(getTodayDateString());
              setToDate(getTodayDateString());
              setPage(1);
            }}
            pageSize={pageSize}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setPage(1);
            }}
            totalRecords={totalCount}
          />

          {/* ══ Main Table ══ */}
          <ScrollTable style={{ marginTop: "10px", background: "white", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <Table>
              <thead>
                <Tr>
                  <Th style={{ width: "35px" }}>#</Th>
                  <Th>GRN No.</Th>
                  <Th>Draft No.</Th>
                  <Th>Date</Th>
                  <Th>Destination Outlet</Th>
                  <Th>Vendor</Th>
                  <Th>Invoice No.</Th>
                  <Th style={{ textAlign: "right" }}>Items / Total Qty</Th>
                  <Th style={{ textAlign: "right" }}>Net Amount (₹)</Th>
                  <Th style={{ textAlign: "center" }}>Status</Th>
                  <Th style={{ textAlign: "center", minWidth: "160px" }}>Actions</Th>
                </Tr>
              </thead>
              <tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={11} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      <RefreshCw size={20} className="spin" style={{ animation: "spin 1s linear infinite" }} />
                      <div style={{ marginTop: "8px", fontSize: "0.82rem" }}>Loading GRN records...</div>
                    </Td>
                  </Tr>
                ) : !Array.isArray(grnList) || grnList.length === 0 ? (
                  <Tr>
                    <Td colSpan={11} style={{ textAlign: "center", padding: "36px 12px", color: "#94a3b8" }}>
                      <AlertCircle size={28} style={{ color: "#cbd5e1", marginBottom: "8px" }} />
                      <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#64748b" }}>
                        {activeTab === "Verified"
                          ? "No verified GRNs awaiting receipt."
                          : "No GRN records found matching criteria."}
                      </div>
                      <div style={{ fontSize: "0.76rem", marginTop: "4px" }}>
                        {activeTab === "Verified" &&
                          "Once GRN drafts are verified in GRN Analysis, they will appear here to be received."}
                      </div>
                    </Td>
                  </Tr>
                ) : (
                  grnList.map((grn, idx) => {
                    const rowNum = (page - 1) * pageSize + idx + 1;
                    const items = parseItems(grn.items);
                    const totalQty = items.reduce((s, it) => {
                      const q = parseFloat(it.quantity || 0);
                      const f = parseFloat(it.free || it.free_pack || 0);
                      return s + (it.total_stock != null && parseFloat(it.total_stock) > 0 ? parseFloat(it.total_stock) : q + f);
                    }, 0);

                    const isVerified = grn.status === "Verified";
                    const isReceived = grn.status === "Received";
                    const destOutletName = getOutletName(grn.purchase_category || grn.outlet_code);

                    return (
                      <Tr key={grn.draft_number || grn._id || idx}>
                        <Td>{rowNum}</Td>
                        <Td>
                          <strong style={{ color: "#166534", fontSize: "0.82rem" }}>
                            {grn.grn_number || "-"}
                          </strong>
                        </Td>
                        <Td style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          {grn.draft_number}
                        </Td>
                        <Td style={{ fontSize: "0.78rem" }}>
                          {formatDate(grn.date || grn.created_date)}
                        </Td>
                        <Td>
                          <OutletBadge>{destOutletName}</OutletBadge>
                        </Td>
                        <Td style={{ fontSize: "0.8rem" }}>
                          <strong>{getVendorName(grn)}</strong>
                        </Td>
                        <Td style={{ fontSize: "0.78rem" }}>
                          <strong>{grn.invoice_no || "-"}</strong>
                          {grn.invoice_date && (
                            <div style={{ fontSize: "0.68rem", color: "#64748b" }}>
                              {formatDate(grn.invoice_date)}
                            </div>
                          )}
                        </Td>
                        <Td style={{ textAlign: "right" }}>
                          <strong>{items.length}</strong> items
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                            {totalQty} units
                          </div>
                        </Td>
                        <Td style={{ textAlign: "right", fontWeight: 700, color: "#1e293b" }}>
                          ₹{formatCurrency(grn.net_invoice_amount || grn.total_amount)}
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          <StatusPill $status={grn.status}>
                            {isReceived ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {isReceived ? "Received into Stock" : isVerified ? "Pending Receipt" : grn.status}
                          </StatusPill>
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>
                            {/* View Breakdown */}
                            <ActionBtn
                              type="button"
                              $variant="view"
                              onClick={() => setViewGrn(grn)}
                              title="View Items Breakdown"
                            >
                              <Eye size={13} /> View
                            </ActionBtn>

                            {/* Print Slip */}
                            <ActionBtn
                              type="button"
                              $variant="print"
                              onClick={() => setPrintSlip(grn)}
                              title="Print Verification Slip"
                            >
                              <Printer size={13} /> Print
                            </ActionBtn>

                            {/* Receive Stock */}
                            {isVerified && (
                              <ActionBtn
                                type="button"
                                $variant="receive"
                                onClick={() => setConfirmReceiveGrn(grn)}
                                title="Receive stock into outlet inventory"
                              >
                                <PackageCheck size={13} /> Receive
                              </ActionBtn>
                            )}
                          </div>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </ScrollTable>

          {/* ══ Pagination ══ */}
          {totalCount > 0 && (
            <InvPagination
              totalCount={totalCount}
              pageSize={pageSize}
              currentPage={page}
              onPageChange={setPage}
            />
          )}
        </FormContent>
      </Container>

      {/* ══ Modals ══ */}
      {viewGrn && (
        <DetailsModal
          grn={viewGrn}
          outletName={getOutletName(viewGrn.purchase_category || viewGrn.outlet_code)}
          vendorName={getVendorName(viewGrn)}
          onClose={() => setViewGrn(null)}
        />
      )}

      {printSlip && (
        <PrintSlipModal
          grn={printSlip}
          outletName={getOutletName(printSlip.purchase_category || printSlip.outlet_code)}
          vendorName={getVendorName(printSlip)}
          onClose={() => setPrintSlip(null)}
        />
      )}

      {confirmReceiveGrn && (
        <ConfirmReceiveModal
          grn={confirmReceiveGrn}
          outletName={getOutletName(confirmReceiveGrn.purchase_category || confirmReceiveGrn.outlet_code)}
          onConfirm={handleConfirmReceive}
          onCancel={() => setConfirmReceiveGrn(null)}
          loading={receiveLoading}
        />
      )}
    </PageWrapper>
  );
};

export default GRNReceive;
