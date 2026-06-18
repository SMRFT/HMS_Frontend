// ─── PrintModal.jsx ──────────────────────────────────────────────────────────
// Drop-in fast print preview modal for InvestigationBilling.js
// Usage: import PrintModal from "./PrintModal";
//        <PrintModal bill={bill} doctors={doctors} onClose={() => setPrintBill(null)} />
//
// Replaces the slow window.open() approach with an in-page iframe + CSS @media print
// Supports: A4 | A5 | Thermal (80mm)

import React, { useRef, useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";

// ── Global style that hides everything except the modal iframe during print ──
const PrintGlobalStyle = createGlobalStyle`
  @media print {
    body > *:not(#__print-portal__) { display: none !important; }
    #__print-portal__ { display: block !important; position: fixed; inset: 0; z-index: 99999; }
  }
`;

// ── Overlay ──────────────────────────────────────────────────────────────────
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.28);
  display: flex;
  flex-direction: column;
  width: min(96vw, 860px);
  max-height: 92vh;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: #fff;
`;

const ModalTitle = styled.span`
  font-size: 15px;
  font-weight: 700;
  flex: 1;
`;

const SizeToggleGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const SizeBtn = styled.button`
  padding: 5px 12px;
  border-radius: 6px;
  border: 2px solid
    ${({ $active }) => ($active ? "#fff" : "rgba(255,255,255,0.35)")};
  background: ${({ $active }) =>
    $active ? "rgba(255,255,255,0.25)" : "transparent"};
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: #fff;
  }
`;

const CloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const PreviewArea = styled.div`
  flex: 1;
  overflow: auto;
  background: #e5e7eb;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
`;

// The iframe that shows the bill preview
const PreviewFrame = styled.iframe`
  border: none;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  background: #fff;
  transition:
    width 0.2s,
    height 0.2s;
  ${({ $size }) => {
    if ($size === "thermal") return "width: 302px; height: 500px;"; // 80mm approx
    if ($size === "a5") return "width: 559px; height: 794px;";
    return "width: 794px; height: 1123px;"; // A4
  }}
`;

const ModalFooter = styled.div`
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #f9fafb;
`;

const FooterBtn = styled.button`
  padding: 9px 22px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:active {
    transform: scale(0.97);
  }
`;

const PrintBtn = styled(FooterBtn)`
  background: linear-gradient(135deg, #4f46e5 0%, #3b39c0 100%);
  color: #fff;

  &:hover {
    background: linear-gradient(135deg, #4338ca 0%, #312ead 100%);
  }
`;

const CancelBtn = styled(FooterBtn)`
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;

  &:hover {
    background: #e5e7eb;
  }
`;

const SuccessBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: #dcfce7;
  border-bottom: 1px solid #bbf7d0;
  color: #15803d;
  font-size: 13px;
  font-weight: 600;

  span.icon {
    font-size: 16px;
  }
  span.close {
    margin-left: auto;
    cursor: pointer;
    font-size: 16px;
    color: #15803d;
    opacity: 0.7;
    &:hover {
      opacity: 1;
    }
  }
`;

// ── Helpers (same logic as InvestigationBilling) ─────────────────────────────

const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const fmtTime12 = (t) => {
  if (!t) return "";
  const [h, m, s] = t.split(":");
  let hr = parseInt(h);
  const ampm = hr >= 12 ? "PM" : "AM";
  hr = hr % 12 || 12;
  return `${String(hr).padStart(2, "0")}:${m}:${s || "00"} ${ampm}`;
};

const fmtName = (sal, first, last) =>
  `${sal || ""} ${first || ""} ${last || ""}`.trim();

const resolveItems = (item) => {
  if (Array.isArray(item)) return item;
  try {
    return JSON.parse(item);
  } catch {
    return [];
  }
};

const resolveDoctor = (idOrName, doctors) => {
  if (!idOrName) return "";
  if (idOrName === "SELF") return "SELF";
  const found = doctors.find((d) => String(d.employeeId) === String(idOrName));
  return found ? found.employeeName.trim() : idOrName;
};

// ── Build HTML document for the iframe ───────────────────────────────────────

function buildBillHtml(bill, doctors, size, isEstimate = false) {
  const items = resolveItems(bill.item || bill.items);
  const doctorName = resolveDoctor(bill.doctor, doctors);
  const patientName = fmtName(bill.salutation, bill.firstName, bill.lastName);
  const age = `${bill.calculatedAge || bill.age || ""}${bill.ageType || "Y"}`;
  const preparedByName = localStorage.getItem("name") || "";

  const billNo = isEstimate ? bill.EstBillNo || "" : bill.investBillNo || "";
  const billDate = isEstimate
    ? bill.EstBillDate || bill.investBillDate || ""
    : bill.investBillDate || "";

  const isA4 = size === "a4";
  const isA5 = size === "a5";
  const isThermal = size === "thermal";

  // ── per-size CSS ────────────────────────────────────────────────────────────
  const sizeCSS = isThermal
    ? `
    body { width: 80mm; font-size: 11px; padding: 4px 6px; }
    .hospital-name { font-size: 13px; }
    .bill-title { font-size: 12px; }
    table th, table td { padding: 3px 4px; font-size: 11px; }
    .total-row { font-size: 12px; }
    .net-row { font-size: 13px; }
    .bill-meta { flex-direction: column; gap: 0; }
    .meta-col { width: 100%; }
    .meta-row { margin-bottom: 4px; }
    .meta-label { width: 92px; font-size: 0.95em; }
    .meta-val { font-weight: 600; }
    @page { size: 80mm auto; margin: 2mm; }
  `
    : isA5
      ? `
    body { width: 148mm; font-size: 12px; padding: 10mm; }
    .hospital-name { font-size: 14px; }
    @page { size: A5 portrait; margin: 8mm; }
  `
      : `
    body { width: 210mm; font-size: 13px; padding: 14mm; }
    .hospital-name { font-size: 16px; }
    @page { size: A4 portrait; margin: 14mm; }
  `;

  const itemRows =
    items.length > 0
      ? items
          .map(
            (it, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${it.itemName || ""}</td>
        <td style="text-align:center">${it.quantity || 1}</td>
        <td style="text-align:right">${parseFloat(it.price || 0).toFixed(2)}</td>
        <td style="text-align:right">${(parseFloat(it.price || 0) * parseInt(it.quantity || 1)).toFixed(2)}</td>
      </tr>`,
          )
          .join("")
      : `<tr><td colspan="5" style="text-align:center;color:#888">No items</td></tr>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>${isEstimate ? "Estimate" : "Bill"} - ${billNo}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; color: #111; background: #fff; }
  ${sizeCSS}

  .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 6px; margin-bottom: 8px; }
  .hospital-name { font-weight: 800; letter-spacing: 0.5px; }
  .hospital-sub { font-size: 0.85em; color: #444; }

  ${
    isEstimate
      ? `.est-banner {
    text-align: center; font-weight: 700; color: #b45309;
    border: 2px dashed #d97706; border-radius: 4px;
    padding: 3px; margin: 6px 0; font-size: 1em;
  }`
      : ""
  }

  .bill-meta { display: flex; gap: 8px; margin: 8px 0; flex-wrap: wrap; }
  .meta-col { flex: 1; min-width: 0; }
  .meta-row { display: flex; margin-bottom: 4px; font-size: 0.9em; }
  .meta-label { font-weight: 700; white-space: nowrap; width: 110px; flex-shrink: 0; }
  .meta-colon { margin: 0 4px; }
  .meta-val { word-break: break-word; }

  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  table th { background: #f0f0f0; font-weight: 700; border: 1px solid #bbb; padding: 5px 6px; text-align: left; }
  table td { border: 1px solid #ddd; padding: 4px 6px; vertical-align: top; }
  table tr:nth-child(even) td { background: #fafafa; }

  .totals { margin-top: 6px; border-top: 2px solid #111; padding-top: 6px; }
  .total-row { display: flex; justify-content: space-between; padding: 2px 0; }
  .net-row { font-weight: 800; font-size: 1.05em; border-top: 1px solid #111; padding-top: 4px; margin-top: 2px; }
  .signature { display: flex; justify-content: space-between; margin-top: 28px; font-size: 0.85em; }
  .note { margin-top: 10px; padding: 6px 8px; background: #fffbeb; border-left: 3px solid #d97706; font-style: italic; font-size: 0.82em; }

  @media print {
    html, body { height: auto; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="hospital-name">SHANMUGA HOSPITAL LIMITED</div>
    <div class="hospital-sub">51/24, Saradha College Road, Salem - 636007</div>
    <div class="hospital-sub">CIN: L85110TZ2020PLC033974 &nbsp;|&nbsp; GST: 33ABDCS8326A1ZP</div>
  </div>

  ${
    isEstimate
      ? `<div class="est-banner">*** ESTIMATE BILL ***</div>`
      : `
  <div style="text-align:center;font-weight:700;margin-bottom:6px;">
    ${bill.paymentMethod || ""} &nbsp;—&nbsp; ${bill.billType || ""}
  </div>`
  }

  <div class="bill-meta">
    <div class="meta-col">
      <div class="meta-row"><span class="meta-label">${isEstimate ? "Estimate No" : "Bill Number"}</span><span class="meta-colon">:</span><span class="meta-val">${billNo}</span></div>
      <div class="meta-row"><span class="meta-label">OP Number</span><span class="meta-colon">:</span><span class="meta-val">${bill.uhid || ""}</span></div>
      ${bill.ipNumber ? `<div class="meta-row"><span class="meta-label">IP Number</span><span class="meta-colon">:</span><span class="meta-val">${bill.ipNumber}</span></div>` : ""}
      <div class="meta-row"><span class="meta-label">Date & Time</span><span class="meta-colon">:</span><span class="meta-val">${fmtDate(billDate)} ${fmtTime12(bill.time)}</span></div>
    </div>
    <div class="meta-col">
      <div class="meta-row"><span class="meta-label">Name</span><span class="meta-colon">:</span><span class="meta-val">${patientName}</span></div>
      <div class="meta-row"><span class="meta-label">Age / Gender</span><span class="meta-colon">:</span><span class="meta-val">${age} / ${bill.gender || ""}</span></div>
      <div class="meta-row"><span class="meta-label">Doctor</span><span class="meta-colon">:</span><span class="meta-val">${doctorName}</span></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Rate</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="totals">
    <div class="total-row"><span>Total</span><span>₹ ${parseFloat(bill.total || 0).toFixed(2)}</span></div>
    <div class="total-row"><span>Discount</span><span>₹ ${parseFloat(bill.discount || 0).toFixed(2)}</span></div>
    <div class="total-row net-row"><span>${isEstimate ? "Estimated Net Amount" : "Net Amount"}</span><span>₹ ${parseFloat(bill.finalPrice || 0).toFixed(2)}</span></div>
  </div>

  ${isEstimate ? `<div class="note"><strong>Note:</strong> This is an estimate. Final charges may vary.</div>` : ""}

  <div class="signature">
    <div>____________________<br/><small>${preparedByName ? `Prepared by: ${preparedByName}` : "Prepared by"}</small></div>
    <div style="text-align:right">____________________<br/><small>Authorized Signature</small></div>
  </div>
</body>
</html>`;
}

// ── Modal Component ───────────────────────────────────────────────────────────

export default function PrintModal({
  bill,
  doctors = [],
  onClose,
  isEstimate = false,
  toastMsg = "",
}) {
  const [size, setSize] = useState("thermal");
  const [bannerVisible, setBannerVisible] = useState(true);
  const iframeRef = useRef(null);

  // Write HTML into iframe immediately when bill/size changes — no setTimeout needed
  useEffect(() => {
    if (!bill || !iframeRef.current) return;
    const html = buildBillHtml(bill, doctors, size, isEstimate);
    const doc =
      iframeRef.current.contentDocument ||
      iframeRef.current.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [bill, doctors, size, isEstimate]);

  // Show the toast banner when a new message arrives, then auto-hide it
  // after a few seconds — like a normal toast. This only hides the banner;
  // it never closes the modal itself.
  useEffect(() => {
    if (!toastMsg) return;
    setBannerVisible(true);
    const hideTimer = setTimeout(() => setBannerVisible(false), 4000);
    return () => clearTimeout(hideTimer);
  }, [toastMsg]);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  if (!bill) return null;

  return (
    <>
      <PrintGlobalStyle />
      {/* Clicking the overlay backdrop does NOT close the modal — user must use the button */}
      <Overlay>
        <Modal>
          <ModalHeader>
            <ModalTitle>
              🖨️ {isEstimate ? "Estimate Preview" : "Bill Preview"}
            </ModalTitle>

            <SizeToggleGroup>
              {["a4", "a5", "thermal"].map((s) => (
                <SizeBtn
                  key={s}
                  $active={size === s}
                  onClick={() => setSize(s)}
                >
                  {s === "thermal" ? "80mm" : s.toUpperCase()}
                </SizeBtn>
              ))}
            </SizeToggleGroup>

            <CloseBtn onClick={onClose} title="Close">
              ×
            </CloseBtn>
          </ModalHeader>

          {/* ── Toast-style success banner shown inside modal instead of alert() ── */}
          {/* Auto-hides after a few seconds; the modal stays open regardless. ── */}
          {toastMsg && bannerVisible && (
            <SuccessBanner>
              <span className="icon">✅</span>
              {toastMsg}
              <span
                className="close"
                onClick={() => setBannerVisible(false)}
                title="Dismiss"
              >
                ×
              </span>
            </SuccessBanner>
          )}

          <PreviewArea>
            <PreviewFrame ref={iframeRef} $size={size} title="Bill Preview" />
          </PreviewArea>

          <ModalFooter>
            <CancelBtn onClick={onClose}>✕ Close & Reset</CancelBtn>
            <PrintBtn onClick={handlePrint}>🖨️ Print</PrintBtn>
          </ModalFooter>
        </Modal>
      </Overlay>
    </>
  );
}
