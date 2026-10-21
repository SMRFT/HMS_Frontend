import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  PageWrapper, Container, SectionTitle, Input, Select, Button,
  Table, Th, Td, Tr, Label, FormContent, ControlsContainer,
  SearchContainer, InputWrapper, TableWrapper, colors,
} from "../GlobalStyles"
import apiRequest from "../../Auth/apiRequest"
import { toast } from "react-toastify"
import { Eye, CheckCircle, X, Printer } from "lucide-react"
import styled from "styled-components"
import dayjs from "dayjs"
import { InvTopToolbar, InvPagination, getTodayDateString } from "./InventoryUIHelper"

/* ─── Styled Components ─────────────────────────────────────────────────── */
const PageHeader = styled.div`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: white; padding: 14px 20px; border-radius: 8px 8px 0 0;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
`
const PageTitle = styled.h1`margin: 0; font-size: 1.1rem; font-weight: 700;`
const PageSubtitle = styled.p`margin: 2px 0 0; font-size: 0.75rem; opacity: 0.8;`

const FilterBar = styled.div`
  display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end;
  background: #f8fafc; border: 1px solid ${colors.border};
  border-radius: 6px; padding: 12px 14px; margin-bottom: 12px;
`
const Lbl = styled(Label)`font-size: 0.72rem; margin-bottom: 2px; display: block;`
const FInp = styled(Input)`font-size: 0.8rem; height: 34px; min-width: 140px;`

const TTBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const TableSelect = styled.select`
  height: 28px;
  width: 72px;
  padding: 0 6px;
  font-size: .75rem;
  font-weight: 600;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #1f2937;
  cursor: pointer;
  outline: none;
  &:focus {
    border-color: ${colors.primary};
  }
`;

const Pager = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid #e5e7eb;
  font-size: .75rem;
  color: #6b7280;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const PB = styled.button`
  height: 28px;
  padding: 0 13px;
  font-size: .75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: ${p => p.active ? colors.primary : '#fff'};
  color: ${p => p.active ? '#fff' : '#374151'};
  cursor: pointer;
  &:disabled {
    opacity: .45;
    cursor: default;
  }
  &:hover:not(:disabled) {
    background: ${p => p.active ? colors.primary : '#f3f4f6'};
  }
`;

const ScrollTable = styled.div`width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch;`

const ActionBtn = styled.button`
  padding: 3px 10px; border: none; border-radius: 4px; font-size: 0.75rem;
  font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
  background: ${p => p.variant === "green" ? "#dcfce7" : p.variant === "blue" ? "#dbeafe" : colors.tabBg};
  color:       ${p => p.variant === "green" ? "#166534" : p.variant === "blue" ? "#1d4ed8" : colors.primary};
  &:hover { background: ${p => p.variant === "green" ? "#bbf7d0" : p.variant === "blue" ? "#bfdbfe" : "#b2dfdb"}; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`
const DraftBadge = styled.span`background:#fef9c3;color:#854d0e;font-size:0.68rem;font-weight:700;padding:2px 6px;border-radius:20px;`
const GrnBadge = styled.span`background:#dcfce7;color:#166534;font-size:0.68rem;font-weight:700;padding:2px 6px;border-radius:20px;`
const PendingText = styled.span`color:#94a3b8;font-size:0.68rem;font-style:italic;`
const StatusBadge = styled.span`
  background: ${p => p.status === "Verified" ? "#dcfce7" : p.status === "Draft" ? "#fef9c3" : "#e0f2fe"};
  color:       ${p => p.status === "Verified" ? "#166534" : p.status === "Draft" ? "#854d0e" : "#0369a1"};
  font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 20px;
`

/* ── Modal ── */
const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 12px;
`
const ModalBox = styled.div`
  background: white; border-radius: 8px; width: 100%; max-width: 1100px;
  max-height: 96vh; display: flex; flex-direction: column;
  box-shadow: 0 16px 50px rgba(0,0,0,0.22);
`
const ModalHeader = styled.div`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  color: white; padding: 10px 16px; border-radius: 8px 8px 0 0;
  display: flex; align-items: center; justify-content: space-between;
`
const ModalTitle = styled.h2`margin: 0; font-size: 0.95rem; font-weight: 700;`
const ModalBody = styled.div`flex: 1; overflow-y: auto; padding: 14px;`
const ModalFooter = styled.div`
  padding: 8px 14px; border-top: 1px solid ${colors.border};
  display: flex; justify-content: flex-end; gap: 8px;
`
const CloseBtn = styled.button`
  background: rgba(255,255,255,0.2); border: none; color: white;
  border-radius: 50%; width: 26px; height: 26px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(255,255,255,0.35); }
`

/* ══════════════════════════════════════════════════════════════════════════
   GRN PRINT DOCUMENT — matches screenshot layout exactly
   ══════════════════════════════════════════════════════════════════════════ */

/* ─── Constants ─────────────────────────────────────────────────────────── */
const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL

const PURCHASE_CATEGORIES = [
  { value: "MEDICINE_PURCHASE", label: "Medicine Purchase (OP)" },
  { value: "MEDICINE_PURCHASE_IP", label: "Medicine Purchase (IP)" },
  { value: "OPENING_STOCK_DRUG", label: "Opening Stock (Drug)" },
]

const todayStr = () => new Date().toISOString().split("T")[0]
const fmtDate = (d) => d ? d.split("T")[0] : "—"
const fmt2 = (v) => parseFloat(v || 0).toFixed(2)

/* ── Number to words ── */
function numberToWords(num) {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
  const n = Math.floor(Math.abs(num))
  if (n === 0) return "Zero"
  const inW = (x) => {
    if (x < 20) return a[x]
    if (x < 100) return b[Math.floor(x / 10)] + (x % 10 ? " " + a[x % 10] : "")
    return a[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + inW(x % 100) : "")
  }
  let r = ""
  if (n >= 10000000) r += inW(Math.floor(n / 10000000)) + " Crore "
  if (n >= 100000) r += inW(Math.floor((n % 10000000) / 100000)) + " Lakh "
  if (n >= 1000) r += inW(Math.floor((n % 100000) / 1000)) + " Thousand "
  if (n >= 100) r += inW(Math.floor((n % 1000) / 100)) + " Hundred "
  r += inW(n % 100)
  return r.trim() + " Only /-"
}

/* ══════════════════════════════════════════════════════════════════════════
   GRN DOCUMENT COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
const GRNDocument = ({ grn, vendorInfo, items = [] }) => {
  const v = vendorInfo || {}
  const addr = [v.address_line1, v.address_line2, v.city, v.state].filter(Boolean).join(", ")

  /* Normalized items calculation */
  const normalizedItems = (items || []).map((it, i) => {
    const qty = parseFloat(it.quantity || it.qty || 0);
    const pack = it.packing || it.pack || 1;
    const free = parseFloat(it.free || it.free_qty || 0);
    const pRate = parseFloat(it.unitPrice || it.purchaseRate || it.packingPrice || it.packing_price || it.rate || 0);
    const pCost = parseFloat(it.unitCost || it.purchase_cost_display || (qty ? (parseFloat(it.purchaseCost || it.purchase_cost || 0) / qty) : 0) || pRate);
    const mrp = parseFloat(it.mrp || 0);
    const disc = parseFloat(it.purchase_discount_amt || it.discountedAmt || it.discount || 0);
    const taxable = parseFloat(it.item_value || it.taxableAmt || (pRate * (qty / (pack || 1))) - disc);
    const cgstRate = parseFloat(it.cgst_percent || it.cgstPercent || (it.tax ? it.tax / 2 : 0) || 0);
    const cgstAmt = parseFloat(it.cgst_amt || it.cgstAmt || (taxable * cgstRate / 100) || 0);
    const sgstRate = parseFloat(it.sgst_percent || it.sgstPercent || (it.tax ? it.tax / 2 : 0) || 0);
    const sgstAmt = parseFloat(it.sgst_amt || it.sgstAmt || (taxable * sgstRate / 100) || 0);
    const igstRate = parseFloat(it.igst_percent || it.igstPercent || 0);
    const igstAmt = parseFloat(it.igst_amt || it.igstAmt || it.igst || 0);
    const totalAmt = parseFloat(it.purchase_cost || it.purchaseCost || it.total_amount || (taxable + cgstAmt + sgstAmt + igstAmt));

    let expDisplay = it.expiry || it.expDate || "—";
    if (expDisplay && expDisplay !== "—") {
      const d = dayjs(expDisplay);
      if (d.isValid()) expDisplay = d.format("YYYY/MM");
    }

    return {
      sl: i + 1,
      product: it.name || it.itemName || it.item_name || "Item",
      hsn: it.hsn || it.hsn_code || "—",
      batch: it.batch || it.batch_no || "—",
      expiry: expDisplay,
      pack,
      qty,
      free,
      pRate,
      pCost,
      mrp,
      disc,
      taxable,
      cgstRate,
      cgstAmt,
      sgstRate,
      sgstAmt,
      igstRate,
      igstAmt,
      totalAmt
    };
  });

  /* Totals */
  const totalTaxable = normalizedItems.reduce((s, i) => s + i.taxable, 0);
  const totalCgst = normalizedItems.reduce((s, i) => s + i.cgstAmt, 0) || parseFloat(grn.cgst || 0);
  const totalSgst = normalizedItems.reduce((s, i) => s + i.sgstAmt, 0) || parseFloat(grn.sgst || 0);
  const totalIgst = normalizedItems.reduce((s, i) => s + i.igstAmt, 0) || parseFloat(grn.igst || 0);
  const totalDisc = normalizedItems.reduce((s, i) => s + i.disc, 0) || parseFloat(grn.total_discount || 0);
  const totalItemAmounts = normalizedItems.reduce((s, i) => s + i.totalAmt, 0) || parseFloat(grn.total_amount || 0);
  const taxOnFree = parseFloat(grn.tax_on_free_items || grn.tax_on_free || 0);
  const roundOff = parseFloat(grn.round_amount || 0);
  const totalGst = totalCgst + totalSgst + totalIgst;
  const netAmt = parseFloat(grn.net_invoice_amount || grn.net_amount || (totalItemAmounts + taxOnFree + roundOff));

  /* Shared cell styles */
  const th = (extra = {}) => ({
    background: "#dbeafe",
    color: "#0c4a6e",
    border: "1px solid #7dd3fc",
    padding: "3px 4px",
    fontSize: 7.5,
    fontWeight: 700,
    whiteSpace: "nowrap",
    textAlign: "center",
    verticalAlign: "middle",
    ...extra,
  });
  const td = (extra = {}) => ({ border: "1px solid #cbd5e1", padding: "3px 4px", fontSize: 8, whiteSpace: "nowrap", verticalAlign: "middle", ...extra });
  const tdr = (extra = {}) => td({ textAlign: "right", ...extra });
  const tdc = (extra = {}) => td({ textAlign: "center", ...extra });

  return (
    <div id="grn-print-area" style={{ fontFamily: "Arial, sans-serif", fontSize: 9, color: "#000", border: "1.5px solid #0c4a6e", background: "#ffffff" }}>
      {/* ── Hospital Header ── */}
      <div style={{ textAlign: "center", padding: "10px 12px 6px", borderBottom: "1.5px solid #0c4a6e", background: "#ffffff" }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#0c4a6e", letterSpacing: "0.5px" }}>SHANMUGA HOSPITAL LIMITED</div>
        <div style={{ fontSize: 9.5, color: "#334155", marginTop: 2 }}>51/24.Saradha College Road, Salem - 636007,,</div>
        <div style={{ fontSize: 9.5, color: "#334155" }}>Phone : 04272706666,info@smrft.org</div>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: "#334155", marginTop: 2 }}>GST Number : {grn.hospital_gst || ""}</div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            marginTop: 6,
            color: "#0c4a6e",
          }}
        >
          GOODS RECEIPT NOTE - {grn.purchase_category ? grn.purchase_category.toUpperCase() : "OPENING STOCK (DRUG)"}
        </div>
      </div>

      {/* ── 3-column Metadata Strip ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: "1px solid #7dd3fc" }}>
        <tbody>
          <tr>
            {/* Left Column */}
            <td style={{ verticalAlign: "top", padding: "5px 8px", fontSize: 8.5, borderRight: "1px solid #7dd3fc", width: "33%" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>
                {[
                  ["Invoice No", grn.invoice_no || grn.invoice_number],
                  ["Invoice Date", fmtDate(grn.invoice_date)],
                  ["Purchase No", grn.grn_number || grn.draft_number],
                  ["Purchase Date", fmtDate(grn.date)],
                ].map(([k, val]) => (
                  <tr key={k}>
                    <td style={{ fontWeight: 700, whiteSpace: "nowrap", paddingRight: 4, fontSize: 8.5, verticalAlign: "top", minWidth: 86 }}>{k}</td>
                    <td style={{ fontSize: 8.5, verticalAlign: "top" }}>: {val || "—"}</td>
                  </tr>
                ))}
              </tbody></table>
            </td>

            {/* Centre Column */}
            <td style={{ verticalAlign: "top", padding: "5px 8px", fontSize: 8.5, borderRight: "1px solid #7dd3fc", width: "34%" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>
                <tr>
                  <td style={{ fontWeight: 700, whiteSpace: "nowrap", paddingRight: 4, fontSize: 8.5, verticalAlign: "top", minWidth: 86 }}>Supplier Name</td>
                  <td style={{ fontSize: 8.5, fontWeight: 700, verticalAlign: "top" }}>: {v.name || grn.vendor_name || "OPENING STOCK"}</td>
                </tr>
                {addr && (
                  <tr>
                    <td style={{ fontWeight: 700, fontSize: 8.5, verticalAlign: "top" }}></td>
                    <td style={{ fontSize: 8.5, verticalAlign: "top" }}>{addr}</td>
                  </tr>
                )}
                {[
                  ["State", v.state || grn.vendor_state],
                  ["Phone", v.phone || grn.vendor_phone],
                  ["GST Number", v.gstin || grn.vendor_gstin || "******"],
                ].map(([k, val]) => (
                  <tr key={k}>
                    <td style={{ fontWeight: 700, whiteSpace: "nowrap", paddingRight: 4, fontSize: 8.5, verticalAlign: "top", minWidth: 86 }}>{k}</td>
                    <td style={{ fontSize: 8.5, verticalAlign: "top" }}>: {val || "—"}</td>
                  </tr>
                ))}
              </tbody></table>
            </td>

            {/* Right Column */}
            <td style={{ verticalAlign: "top", padding: "5px 8px", fontSize: 8.5, width: "33%" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>
                {[
                  ["Order Number", grn.order_number || ""],
                  ["Payment Mode", grn.payment_mode || "CHEQUE"],
                  ["Approved Date", grn.is_approved ? fmtDate(grn.approved_date || grn.date) : (grn.approved_date ? fmtDate(grn.approved_date) : "—")],
                ].map(([k, val]) => (
                  <tr key={k}>
                    <td style={{ fontWeight: 700, whiteSpace: "nowrap", paddingRight: 4, fontSize: 8.5, verticalAlign: "top", minWidth: 86 }}>{k}</td>
                    <td style={{ fontSize: 8.5, verticalAlign: "top" }}>: {val || "—"}</td>
                  </tr>
                ))}
              </tbody></table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Items Table + Right Summary ── */}
      <div style={{ display: "flex", borderBottom: "1px solid #7dd3fc" }}>
        {/* 17-column Items table */}
        <div style={{ flex: 1, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8 }}>
            <thead>
              <tr>
                <th rowSpan={2} style={th({ width: 22 })}>Sl.</th>
                <th rowSpan={2} style={th({ minWidth: 95, textAlign: "left" })}>Product</th>
                <th rowSpan={2} style={th()}>HSN</th>
                <th rowSpan={2} style={th()}>Batch</th>
                <th rowSpan={2} style={th()}>Expiry</th>
                <th rowSpan={2} style={th()}>Pack</th>
                <th rowSpan={2} style={th()}>QTY</th>
                <th rowSpan={2} style={th()}>Free</th>
                <th rowSpan={2} style={th()}>P Rate</th>
                <th rowSpan={2} style={th()}>P.cost</th>
                <th rowSpan={2} style={th()}>MRP</th>
                <th rowSpan={2} style={th()}>Discount</th>
                <th rowSpan={2} style={th()}>Taxable Amount</th>
                <th colSpan={2} style={th()}>CGST</th>
                <th colSpan={2} style={th()}>SGST</th>
                <th colSpan={2} style={th()}>IGST</th>
                <th rowSpan={2} style={th()}>Total Amount</th>
              </tr>
              <tr>
                <th style={th()}>Rate</th><th style={th()}>Amt</th>
                <th style={th()}>Rate</th><th style={th()}>Amt</th>
                <th style={th()}>Rate</th><th style={th()}>Amt</th>
              </tr>
            </thead>
            <tbody>
              {normalizedItems.map((it) => (
                <tr key={it.sl}>
                  <td style={tdc()}>{it.sl}</td>
                  <td style={td({ fontWeight: 600, maxWidth: 120, whiteSpace: "normal", textAlign: "left" })}>{it.product}</td>
                  <td style={tdc()}>{it.hsn}</td>
                  <td style={tdc()}>{it.batch}</td>
                  <td style={tdc()}>{it.expiry}</td>
                  <td style={tdc()}>{it.pack}</td>
                  <td style={tdc()}>{it.qty}</td>
                  <td style={tdc()}>{it.free}</td>
                  <td style={tdr()}>{fmt2(it.pRate)}</td>
                  <td style={tdr()}>{fmt2(it.pCost)}</td>
                  <td style={tdr()}>{fmt2(it.mrp)}</td>
                  <td style={tdr()}>{fmt2(it.disc)}</td>
                  <td style={tdr()}>{fmt2(it.taxable)}</td>
                  <td style={tdc()}>{it.cgstRate ? `${it.cgstRate}%` : "—"}</td>
                  <td style={tdr()}>{fmt2(it.cgstAmt)}</td>
                  <td style={tdc()}>{it.sgstRate ? `${it.sgstRate}%` : "—"}</td>
                  <td style={tdr()}>{fmt2(it.sgstAmt)}</td>
                  <td style={tdc()}>{it.igstRate ? `${it.igstRate}%` : "—"}</td>
                  <td style={tdr()}>{fmt2(it.igstAmt)}</td>
                  <td style={tdr({ fontWeight: 700 })}>{fmt2(it.totalAmt)}</td>
                </tr>
              ))}

              {/* Totals Row */}
              <tr style={{ background: "#dbeafe" }}>
                <td
                  colSpan={12}
                  style={td({
                    textAlign: "right",
                    fontWeight: 700,
                    color: "#0c4a6e",
                    background: "#dbeafe",
                  })}
                >
                  Total
                </td>
                <td style={tdr({ fontWeight: 700, color: "#0c4a6e", background: "#dbeafe" })}>{fmt2(totalTaxable)}</td>
                <td style={td({ background: "#dbeafe" })} />
                <td style={tdr({ fontWeight: 700, color: "#0c4a6e", background: "#dbeafe" })}>{fmt2(totalCgst)}</td>
                <td style={td({ background: "#dbeafe" })} />
                <td style={tdr({ fontWeight: 700, color: "#0c4a6e", background: "#dbeafe" })}>{fmt2(totalSgst)}</td>
                <td style={td({ background: "#dbeafe" })} />
                <td style={tdr({ fontWeight: 700, color: "#0c4a6e", background: "#dbeafe" })}>{fmt2(totalIgst)}</td>
                <td style={tdr({ fontWeight: 700, color: "#0c4a6e", background: "#dbeafe" })}>{fmt2(totalItemAmounts)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right totals panel */}
        <table style={{ borderLeft: "1px solid #7dd3fc", borderCollapse: "collapse", fontSize: 8.5, minWidth: 140, alignSelf: "stretch" }}>
          <tbody>
            {[
              ["Total", fmt2(totalTaxable), false],
              ["Discount", fmt2(totalDisc), false],
              ["Tax On Free", fmt2(taxOnFree), false],
              ["Round off.", fmt2(roundOff), false],
              ["Total GST", fmt2(totalGst), true],
              ["Net Amount", fmt2(netAmt), true, "#e8f5e9", "#0f766e"],
            ].map(([lbl, val, bold, bg, col]) => (
              <tr key={lbl} style={{ background: bg || "transparent" }}>
                <td style={{ padding: "3px 6px", borderBottom: "1px solid #e2e8f0", fontWeight: bold ? 800 : 600, color: col || "#334155", whiteSpace: "nowrap" }}>{lbl}</td>
                <td style={{ padding: "3px 6px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: bold ? 800 : 700, color: col || "#0f172a", whiteSpace: "nowrap" }}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Bottom strip: GST | Amount in Words | Net Amount ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: "1px solid #0c4a6e" }}>
        <tbody>
          <tr>
            <td style={{ padding: "4px 8px", fontSize: 8, borderRight: "1px solid #7dd3fc", whiteSpace: "nowrap", width: "42%" }}>
              <strong>GST Amount</strong>&nbsp;&nbsp;
              CGST Amount : {fmt2(totalCgst)}&nbsp;&nbsp;
              SGST Amount : {fmt2(totalSgst)}&nbsp;&nbsp;
              IGST Amount : {fmt2(totalIgst)}
            </td>
            <td style={{ padding: "4px 8px", fontSize: 8, borderRight: "1px solid #7dd3fc" }}>
              <strong>Amount In Words</strong>&nbsp;&nbsp;
              Rupee(s) {numberToWords(netAmt)}
            </td>
            <td style={{ padding: "4px 10px", fontSize: 8.5, textAlign: "right", whiteSpace: "nowrap", minWidth: 110 }}>
              <strong>Net Amount</strong>&nbsp;
              <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#0f766e" }}>{fmt2(netAmt)}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Signature strip ── */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 12px", fontSize: 8.5, background: "#f8fafc" }}>
        <span><strong>Entered By :</strong> {grn.entered_by || grn.created_by_name || grn.created_by || "—"}</span>
        <span><strong>Checked By :</strong> —</span>
        <span><strong>Verified By :</strong> {grn.verified_by || (grn.is_approved ? "APPROVED" : "—")}</span>
      </div>
    </div>
  );
};

/* ─── Main Component ────────────────────────────────────────────────────── */
const GRNAnalysis = () => {
  const [grnList, setGrnList] = useState([])
  const [vendors, setVendors] = useState([])
  const [fromDate, setFromDate] = useState(getTodayDateString())
  const [toDate, setToDate] = useState(getTodayDateString())
  const [search, setSearch] = useState("")
  const [viewGrn, setViewGrn] = useState(null)
  const [viewItems, setViewItems] = useState([])
  const [confirmId, setConfirmId] = useState(null)
  const printRef = useRef()

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVendors = useCallback(async () => {
    try {
      const r = await apiRequest(`${baseUrl}vendors/`, "GET");
      const payload = r?.data;
      const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload?.results) ? payload.results : []));
      if (r.success) setVendors(list);
    } catch { }
  }, [])

  const fetchGRNList = useCallback(async (p = page, size = pageSize, q = search, from = fromDate, to = toDate) => {
    try {
      const query = new URLSearchParams({
        page: p,
        page_size: size,
      });
      if (q && q.trim()) query.append("search", q.trim());
      if (from) query.append("from_date", from);
      if (to) query.append("to_date", to);
      const r = await apiRequest(`${baseUrl}grn/?${query.toString()}`, "GET");
      if (r && r.success) {
        const payload = r.data;
        const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload?.results) ? payload.results : []));
        const total = payload?.total_records ?? payload?.count ?? r?.count ?? (Array.isArray(payload) ? payload.length : list.length);
        const pages = payload?.total_pages ?? r?.total_pages ?? Math.max(1, Math.ceil(total / size));
        setGrnList(list);
        setTotalCount(total);
        setTotalPages(pages);
        setPage(payload?.current_page || p);
      }
    } catch { }
  }, [page, pageSize, search, fromDate, toDate])

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  useEffect(() => {
    fetchGRNList(page, pageSize, search, fromDate, toDate);
  }, [page, pageSize, search, fromDate, toDate, fetchGRNList]);

  const getVendor = (id) => vendors.find(x => Number(x.vendor_id) === Number(id)) || null
  const getVendorName = (id) => { const v = getVendor(id); return v ? v.name : String(id || "") }

  const openView = (grn) => {
    try { setViewItems(JSON.parse(grn.items || "[]")) } catch { setViewItems([]) }
    setViewGrn(grn)
  }
  const closeView = () => { setViewGrn(null); setViewItems([]) }

  const handlePrint = () => {
    const content = document.getElementById("grn-print-area")
    if (!content) return
    const win = window.open("", "_blank", "width=1100,height=750")
    win.document.write(`<!DOCTYPE html><html><head>
      <title>GRN - ${viewGrn?.grn_number || viewGrn?.draft_number}</title>
      <style>
        *{box-sizing:border-box;}
        body{font-family:Arial,sans-serif;font-size:9px;color:#000;margin:0;padding:8px;}
        table{border-collapse:collapse;}
        @media print{@page{margin:6mm;} body{padding:0;}}
      </style>
    </head><body>${content.outerHTML}</body></html>`)
    win.document.close()
    setTimeout(() => win.print(), 400)
  }

  const handleGenerateGRN = async (grn) => {
    if (grn.status === "Verified") { toast.info("GRN already verified."); return }
    setConfirmId(grn.grn_id)
    try {
      const payload = {
        ...grn, status: "Verified", draft_number: grn.draft_number,
        items: typeof grn.items === "string" ? grn.items : JSON.stringify(grn.items || []),
        payment_status: typeof grn.payment_status === "string" ? grn.payment_status : JSON.stringify(grn.payment_status || []),
      }
      const r = await apiRequest(`${baseUrl}grn/${grn.draft_number}/`, "PUT", payload)
      if (!r.success) { toast.error(r.error || "Failed to verify GRN"); return }
      toast.success(`GRN Verified & stock updated! GRN: ${r.data?.grn_number}`)
      fetchGRNList()
    } catch { toast.error("Network error") }
    finally { setConfirmId(null) }
  }

  return (
    <PageWrapper>
      <Container style={{ maxWidth: "100%", padding: "0 8px" }}>
        <PageHeader>
          <div>
            <PageTitle>📊 GRN Analysis</PageTitle>
            <PageSubtitle>View, Generate &amp; Manage Goods Receipt Notes</PageSubtitle>
          </div>
        </PageHeader>

        <FormContent style={{ padding: "10px 0" }}>
          <InvTopToolbar
            pageSize={pageSize}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            searchPlaceholder="Draft No, GRN No, Vendor, Invoice…"
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
            totalRecords={totalCount}
          />

          <ScrollTable>
            <Table style={{ minWidth: 1000 }}>
              <thead>
                <tr>
                  {["#", "Draft No", "GRN No", "Date", "Vendor", "Category", "Invoice No", "Invoice Date", "Payment", "Net Amount", "Status", "Actions"].map(h => (
                    <Th key={h} style={{ fontSize: "0.7rem" }}>{h}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grnList.length === 0 ? (
                  <tr><td colSpan={12}><div style={{ textAlign: "center", padding: "36px", color: colors.textMuted, fontSize: "0.85rem" }}>No GRN records found for the selected filter.</div></td></tr>
                ) : grnList.map((grn, idx) => (
                  <Tr key={grn.grn_id || idx}>
                    <Td style={{ fontSize: "0.73rem" }}>{(page - 1) * pageSize + idx + 1}</Td>
                    <Td><DraftBadge>{grn.draft_number || "—"}</DraftBadge></Td>
                    <Td>{grn.grn_number ? <GrnBadge>{grn.grn_number}</GrnBadge> : <PendingText>Pending</PendingText>}</Td>
                    <Td style={{ fontSize: "0.73rem" }}>{fmtDate(grn.date)}</Td>
                    <Td style={{ fontWeight: 600, fontSize: "0.73rem" }}>{grn.vendor_name || getVendorName(grn.vendor_id)}</Td>
                    <Td style={{ fontSize: "0.7rem" }}>{PURCHASE_CATEGORIES.find(c => c.value === grn.purchase_category)?.label || grn.purchase_category}</Td>
                    <Td style={{ fontSize: "0.73rem" }}>{grn.invoice_no}</Td>
                    <Td style={{ fontSize: "0.73rem" }}>{fmtDate(grn.invoice_date)}</Td>
                    <Td style={{ fontSize: "0.73rem" }}>{grn.payment_mode}</Td>
                    <Td style={{ fontWeight: 700, color: colors.primary, fontSize: "0.78rem" }}>₹{fmt2(grn.net_invoice_amount)}</Td>
                    <Td><StatusBadge status={grn.status}>{grn.status || "Draft"}</StatusBadge></Td>
                    <Td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "nowrap" }}>
                        <ActionBtn variant="green" onClick={() => handleGenerateGRN(grn)}
                          disabled={grn.status === "Verified" || confirmId === grn.grn_id}
                          title={grn.status === "Verified" ? "Already Verified" : "Generate GRN & Update Stock"}>
                          <CheckCircle size={12} />
                          {confirmId === grn.grn_id ? "…" : grn.status === "Verified" ? "Verified" : "Generate GRN"}
                        </ActionBtn>
                        <ActionBtn variant="blue" onClick={() => openView(grn)} title="View GRN Report">
                          <Eye size={12} /> View GRN
                        </ActionBtn>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </ScrollTable>

          <InvPagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={(p) => setPage(p)}
          />
        </FormContent>
      </Container>

      {viewGrn && (
        <Overlay onClick={e => { if (e.target === e.currentTarget) closeView() }}>
          <ModalBox>
            <ModalHeader>
              <ModalTitle>🧾 {viewGrn.grn_number || viewGrn.draft_number}</ModalTitle>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <ActionBtn onClick={handlePrint}
                  style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.35)", fontSize: "0.73rem", padding: "3px 10px" }}>
                  <Printer size={12} /> Print
                </ActionBtn>
                <CloseBtn onClick={closeView}><X size={14} /></CloseBtn>
              </div>
            </ModalHeader>

            <ModalBody ref={printRef}>
              <GRNDocument grn={viewGrn} vendorInfo={getVendor(viewGrn.vendor_id)} items={viewItems} />
            </ModalBody>

            <ModalFooter>
              <Button secondary onClick={closeView} style={{ fontSize: "0.8rem", padding: "5px 14px" }}><X size={12} />&nbsp;Close</Button>
              <Button onClick={handlePrint} style={{ fontSize: "0.8rem", padding: "5px 14px" }}><Printer size={12} />&nbsp;Print / PDF</Button>
            </ModalFooter>
          </ModalBox>
        </Overlay>
      )}
    </PageWrapper>
  )
}

export default GRNAnalysis