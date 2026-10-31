// ─── otPrintUtils.js ──────────────────────────────────────────────────────────
// Print template generators & utilities for OT Lab, Medicine, and Implant Billing

export const HOSPITAL_INFO = {
  name: "SHANMUGA HOSPITAL LIMITED",
  address: "51/24, Saradha College Road, Salem - 636007",
  details: "CIN: L85110TZ2020PLC033974 | GST: 33ABDCS8326A1ZP",
  phone: "Phone: 0427-2706666 | 2706600",
};

export const numberToWords = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "Zero";
  const n = Math.floor(Math.abs(Number(num)));
  if (n === 0) return "Zero";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (val) => {
    let str = "";
    if (val > 9999999) {
      str += inWords(Math.floor(val / 10000000)) + " Crore ";
      val %= 10000000;
    }
    if (val > 99999) {
      str += inWords(Math.floor(val / 100000)) + " Lakh ";
      val %= 100000;
    }
    if (val > 999) {
      str += inWords(Math.floor(val / 1000)) + " Thousand ";
      val %= 1000;
    }
    if (val > 99) {
      str += inWords(Math.floor(val / 100)) + " Hundred ";
      val %= 100;
    }
    if (val > 0) {
      if (str !== "") str += "and ";
      if (val < 20) str += a[val];
      else str += b[Math.floor(val / 10)] + (val % 10 !== 0 ? " " + a[val % 10] : "");
    }
    return str.trim();
  };

  const words = inWords(n);
  const paise = Math.round((Math.abs(Number(num)) - n) * 100);
  if (paise > 0) {
    return `Rupees ${words} and ${inWords(paise)} Paise Only`;
  }
  return `Rupees ${words} Only`;
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr.endsWith?.("Z") || dateStr.includes?.("+") ? dateStr : dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

const getBaseStyles = (size = "a4") => {
  const isLandscape = size === "a4-landscape";
  const isThermal = size === "thermal";

  if (isThermal) {
    return `
      @page { size: 80mm auto; margin: 3mm; }
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        width: 74mm;
        margin: 0 auto;
        padding: 4px;
        color: #111;
        font-size: 11px;
        line-height: 1.35;
      }
      .hospital-title { font-size: 13px; font-weight: 800; text-align: center; }
      .hospital-sub { font-size: 9.5px; text-align: center; color: #444; }
      .doc-title { font-size: 11px; font-weight: 700; text-align: center; margin: 6px 0; border-top: 1px dashed #666; border-bottom: 1px dashed #666; padding: 3px 0; }
      .meta-box { margin-bottom: 6px; font-size: 10px; }
      .meta-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
      .meta-lbl { font-weight: 600; color: #333; }
      .meta-val { font-weight: 700; }
      table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 10px; }
      th { border-bottom: 1px solid #000; padding: 3px 2px; text-align: left; font-size: 9.5px; }
      td { padding: 3px 2px; border-bottom: 1px dotted #ccc; vertical-align: top; }
      .total-box { margin-top: 8px; border-top: 1px solid #000; padding-top: 4px; font-weight: 700; font-size: 11px; }
      .signature-area { margin-top: 20px; font-size: 9px; text-align: center; border-top: 1px dashed #aaa; padding-top: 8px; }
    `;
  }

  return `
    @page {
      size: ${isLandscape ? "A4 landscape" : "A4 portrait"};
      margin: 12mm 15mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 0;
      font-size: 11.5px;
      line-height: 1.45;
      background: #fff;
    }
    .header-table {
      width: 100%;
      border-bottom: 2.5px solid #0f766e;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .hospital-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f766e;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin: 0;
    }
    .hospital-sub {
      font-size: 10px;
      color: #475569;
      margin-top: 2px;
      font-weight: 500;
    }
    .doc-badge {
      display: inline-block;
      background: #f0fdfa;
      border: 1px solid #0f766e;
      color: #0f766e;
      font-size: 12px;
      font-weight: 800;
      padding: 4px 14px;
      border-radius: 4px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .meta-panel {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 12px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px 14px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .meta-val {
      font-size: 11.5px;
      font-weight: 600;
      color: #0f172a;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .data-table th {
      background: #0f766e;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      padding: 7px 8px;
      border: 1px solid #0f766e;
      text-align: left;
    }
    .data-table td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      font-size: 11px;
      color: #1e293b;
      vertical-align: middle;
    }
    .data-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    .text-center { text-align: center !important; }
    .text-right { text-align: right !important; }
    .kpi-row {
      display: flex;
      gap: 12px;
      margin: 10px 0;
    }
    .kpi-card {
      flex: 1;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .kpi-card span { font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; }
    .kpi-card strong { font-size: 13px; color: #0f766e; }
    .totals-box {
      margin-top: 10px;
      border-top: 2px solid #0f766e;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .words-box {
      font-size: 10.5px;
      color: #334155;
      max-width: 65%;
      font-style: italic;
    }
    .figures-box {
      text-align: right;
      font-size: 13px;
      font-weight: 800;
      color: #0f766e;
    }
    .signature-row {
      margin-top: 45px;
      display: flex;
      justify-content: space-between;
      padding: 0 10px;
    }
    .sig-block {
      text-align: center;
      min-width: 140px;
    }
    .sig-name {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
      min-height: 18px;
      margin-bottom: 4px;
      line-height: 1.2;
    }
    .sig-line {
      border-top: 1px dashed #64748b;
      margin-bottom: 4px;
    }
    .sig-title {
      font-size: 10px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }
    .sig-sub {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 2px;
      font-weight: 600;
    }
    .print-footer {
      margin-top: 25px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      font-size: 9px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `;
};

// ─── 1. Lab Billing Overall Print HTML ─────────────────────────────────────────
export const generateLabOverallPrintHtml = ({ patient, billedItems = [], totalAmount = 0, size = "a4" }) => {
  const printedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const totalQty = billedItems.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
  const grandTotal = Number(totalAmount) || billedItems.reduce((acc, it) => acc + (Number(it.amount) || Number(it.price * (it.quantity || 1)) || 0), 0);

  // Group items by bill number while preserving arrival order
  const billGroups = [];
  const billMap = new Map();

  (billedItems || []).forEach((item, idx) => {
    const rawBill = item.investBillNo || item.billNo;
    const key = rawBill ? String(rawBill).trim() : `unbilled-${idx}`;
    if (!billMap.has(key)) {
      const group = {
        billNo: rawBill || "—",
        investBillDate: item.investBillDate || item.created_date,
        items: [],
      };
      billMap.set(key, group);
      billGroups.push(group);
    }
    billMap.get(key).items.push(item);
  });

  let rowsHtml = "";
  if (billGroups.length === 0) {
    rowsHtml = `<tr><td colspan="9" class="text-center" style="padding: 25px; color: #94a3b8;">No billed items recorded for this IP admission.</td></tr>`;
  } else {
    rowsHtml = billGroups
      .map((group, billIdx) => {
        const spanCount = group.items.length;
        const formattedDate = formatDateTime(group.investBillDate);

        return group.items
          .map((item, itemIdx) => {
            const isFirst = itemIdx === 0;
            const topBorder = billIdx > 0 && isFirst ? "border-top: 2px solid #cbd5e1;" : "";

            const detailCells = `
              <td style="font-weight: 600; ${topBorder}">${item.itemName || "—"}</td>
              <td style="width: 80px; ${topBorder}">${item.billTypeNo || item.bill_name || "LAB01"}</td>
              <td style="width: 130px; ${topBorder}">${item.doctorName || item.doctor || "—"}</td>
              <td class="text-center" style="width: 45px; font-weight: 700; ${topBorder}">${item.quantity || 1}</td>
              <td class="text-right" style="width: 75px; ${topBorder}">₹ ${Number(item.price || 0).toFixed(2)}</td>
              <td class="text-right" style="width: 85px; font-weight: 700; color: #0f766e; ${topBorder}">₹ ${(Number(item.amount) || Number((item.price || 0) * (item.quantity || 1))).toFixed(2)}</td>
            `;

            if (isFirst) {
              return `
                <tr>
                  <td class="text-center" rowspan="${spanCount}" style="width: 38px; vertical-align: middle; font-weight: 700; color: #64748b; background: #ffffff; ${topBorder}">
                    ${billIdx + 1}
                  </td>
                  <td rowspan="${spanCount}" style="font-weight: 700; color: #0f766e; width: 115px; vertical-align: middle; background: #ffffff; ${topBorder}">
                    ${group.billNo}
                  </td>
                  <td rowspan="${spanCount}" style="width: 115px; vertical-align: middle; background: #ffffff; ${topBorder}">
                    ${formattedDate}
                  </td>
                  ${detailCells}
                </tr>
              `;
            } else {
              return `
                <tr>
                  ${detailCells}
                </tr>
              `;
            }
          })
          .join("");
      })
      .join("");
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Lab Billing Consolidated Statement - ${patient.ipNo || patient.ipNumber || "IP"}</title>
  <style>${getBaseStyles(size)}</style>
</head>
<body>
  <div class="header-table">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1 class="hospital-title">${HOSPITAL_INFO.name}</h1>
        <div class="hospital-sub">${HOSPITAL_INFO.address}</div>
        <div class="hospital-sub">${HOSPITAL_INFO.details} &nbsp;|&nbsp; ${HOSPITAL_INFO.phone}</div>
      </div>
      <div style="text-align: right;">
        <span class="doc-badge">🧪 OT LAB BILLING STATEMENT</span>
        <div style="font-size: 9.5px; color: #64748b; margin-top: 4px;">CONSOLIDATED IP REPORT</div>
      </div>
    </div>
  </div>

  <div class="meta-panel">
    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">Patient Name</span>
        <span class="meta-val">${patient.name || patient.patientName || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">IP Number</span>
        <span class="meta-val" style="color: #0f766e; font-weight: 800;">${patient.ipNo || patient.ipNumber || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">UHID</span>
        <span class="meta-val">${patient.uhid || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Age / Gender</span>
        <span class="meta-val">${patient.age || "—"} / ${patient.gender || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Doctor / Surgeon</span>
        <span class="meta-val">${patient.doctor || patient.surgeonName || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Room / OT</span>
        <span class="meta-val">${patient.roomNo || patient.ot_name || patient.roomBed || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Surgery Ref</span>
        <span class="meta-val">${patient.surgeryRef || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Patient / Payment Type</span>
        <span class="meta-val">${patient.customerType || patient.customer_type || "Credit"}</span>
      </div>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card">
      <span>Total Tests Billed</span>
      <strong>${billedItems.length} Tests (${totalQty} Qty)</strong>
    </div>
    <div class="kpi-card">
      <span>Billing Category</span>
      <strong>Laboratory (OT / IP Credit)</strong>
    </div>
    <div class="kpi-card">
      <span>Grand Total Amount</span>
      <strong style="color: #047857; font-size: 15px;">₹ ${grandTotal.toFixed(2)}</strong>
    </div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th class="text-center">#</th>
        <th>Bill No</th>
        <th>Date &amp; Time</th>
        <th>Lab Test Name</th>
        <th>Bill Type</th>
        <th>Doctor</th>
        <th class="text-center">Qty</th>
        <th class="text-right">Rate (₹)</th>
        <th class="text-right">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="totals-box">
    <div class="words-box">
      <strong>Amount in Words:</strong><br />
      ${numberToWords(grandTotal)}
    </div>
    <div class="figures-box">
      <div style="font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Consolidated Net Total</div>
      <div style="font-size: 18px; margin-top: 2px;">₹ ${grandTotal.toFixed(2)}</div>
    </div>
  </div>

  <div class="signature-row">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-title">Prepared By (Staff)</div>
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-title">Lab Technician / In-Charge</div>
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-title">Authorized Signatory</div>
    </div>
  </div>

  <div class="print-footer">
    <span>Printed On: ${printedAt}</span>
    <span>Hospital Management System — OT Module</span>
    <span>Page 1 of 1</span>
  </div>
</body>
</html>`;
};

// ─── 2. Medicine Billing Overall Print HTML ────────────────────────────────────
export const generateMedicineOverallPrintHtml = ({ patient, requests = [], size = "a4" }) => {
  const printedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Flatten all medicines across requests
  const allMeds = [];
  requests.forEach((req) => {
    const meds = req.medicines || req.items || [];
    meds.forEach((m) => {
      allMeds.push({
        reqId: req.bill_id || req.Bill_id || "—",
        reqDateTime: `${req.reqDate || ""} ${req.reqTime || ""}`.trim() || formatDateTime(req.created_date),
        doctor: req.doctorName || req.doctor || "—",
        dispatchStatus: req.is_dispatched ? "Dispatched" : "Pending",
        receivedStatus: req.is_received ? "Received" : "Not Received",
        paymentStatus: req.billingStatus || "Pending",
        itemName: m.itemName || m.item_name || m.name || "—",
        dosage: m.dosage || "—",
        days: m.noOfDays || m.days || "—",
        qty: m.qty || m.quantity || 1,
        route: m.route || "—",
        remark: m.remark || "",
      });
    });
  });

  const totalQty = allMeds.reduce((acc, m) => acc + (Number(m.qty) || 1), 0);

  const rowsHtml = allMeds.length > 0
    ? allMeds.map((m, idx) => `
        <tr>
          <td class="text-center" style="width: 35px;">${idx + 1}</td>
          <td style="width: 105px;">${m.reqDateTime}</td>
          <td style="font-weight: 700; color: #136A63;">${m.itemName}</td>
          <td class="text-center" style="width: 65px;">${m.dosage}</td>
          <td class="text-center" style="width: 45px;">${m.days}</td>
          <td class="text-center" style="width: 45px; font-weight: 700;">${m.qty}</td>
          <td style="width: 60px;">${m.route}</td>
          <td style="width: 110px;">${m.doctor}</td>
          <td class="text-center" style="width: 80px;">
            <span style="font-weight: 700; font-size: 10px; color: ${m.dispatchStatus === "Dispatched" ? "#047857" : "#b45309"};">
              ${m.dispatchStatus}
            </span>
          </td>
          <td class="text-center" style="width: 75px;">
            <span style="font-size: 10px; font-weight: 600;">${m.paymentStatus}</span>
          </td>
        </tr>
      `).join("")
    : `<tr><td colspan="10" class="text-center" style="padding: 25px; color: #94a3b8;">No medicine requisitions recorded.</td></tr>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>OT Medicine Requisitions - ${patient.ipNo || "IP"}</title>
  <style>${getBaseStyles(size)}</style>
</head>
<body>
  <div class="header-table">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1 class="hospital-title">${HOSPITAL_INFO.name}</h1>
        <div class="hospital-sub">${HOSPITAL_INFO.address}</div>
        <div class="hospital-sub">${HOSPITAL_INFO.details} &nbsp;|&nbsp; ${HOSPITAL_INFO.phone}</div>
      </div>
      <div style="text-align: right;">
        <span class="doc-badge">💊 OT MEDICINE REQUISITION STATEMENT</span>
        <div style="font-size: 9.5px; color: #64748b; margin-top: 4px;">CONSOLIDATED WARD / PHARMACY SHEET</div>
      </div>
    </div>
  </div>

  <div class="meta-panel">
    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">Patient Name</span>
        <span class="meta-val">${patient.name || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">IP Number</span>
        <span class="meta-val" style="color: #136A63; font-weight: 800;">${patient.ipNo || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">UHID</span>
        <span class="meta-val">${patient.uhid || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Age / Gender</span>
        <span class="meta-val">${patient.age || "—"} / ${patient.gender || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Admitting Doctor</span>
        <span class="meta-val">${patient.admittingDr || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Room / Bed</span>
        <span class="meta-val">${patient.roomBed || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Surgery Ref</span>
        <span class="meta-val">${patient.surgeryRef || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Patient Type / Company</span>
        <span class="meta-val">${patient.customerType || "—"} ${patient.companyName && patient.companyName !== "-" ? `(${patient.companyName})` : ""}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Raised By (OT Staff)</span>
        <span class="meta-val" style="font-weight: 700; color: #0f766e;">${Array.from(new Set(requests.map(r => r.created_by_name || r.userName || r.created_by).filter(Boolean))).join(", ") || "—"}</span>
      </div>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card">
      <span>Requisition Batches</span>
      <strong>${requests.length} Requests</strong>
    </div>
    <div class="kpi-card">
      <span>Total Drug Items</span>
      <strong>${allMeds.length} Items (${totalQty} Total Qty)</strong>
    </div>
    <div class="kpi-card">
      <span>Dispense Status</span>
      <strong style="color: #047857;">Pharmacy Credit Route</strong>
    </div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th class="text-center">#</th>
        <th>Date &amp; Time</th>
        <th>Medicine / Drug Name</th>
        <th class="text-center">Dosage</th>
        <th class="text-center">Days</th>
        <th class="text-center">Qty</th>
        <th>Route</th>
        <th>Doctor</th>
        <th class="text-center">Dispatch</th>
        <th class="text-center">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="signature-row">
    <div class="sig-block">
      <div class="sig-name">${Array.from(new Set(requests.map(r => r.created_by_name || r.userName || r.created_by).filter(Boolean))).join(", ") || ""}</div>
      <div class="sig-line"></div>
      <div class="sig-title">Raised By (OT Staff / Nurse)</div>
    </div>
    <div class="sig-block">
      <div class="sig-name">${patient.surgeonName || ""}</div>
      <div class="sig-line"></div>
      <div class="sig-title">Verified By (Surgeon / MO)</div>
      ${patient.surgeonName ? `<div class="sig-sub">(${patient.surgeonName})</div>` : ""}
    </div>
    <div class="sig-block">
      <div class="sig-name"></div>
      <div class="sig-line"></div>
      <div class="sig-title">Dispensed By (Pharmacist)</div>
    </div>
  </div>

  <div class="print-footer">
    <span>Printed On: ${printedAt}</span>
    <span>Hospital Management System — OT Pharmacy Requisitions</span>
    <span>Page 1 of 1</span>
  </div>
</body>
</html>`;
};

// ─── 3. Medicine Billing Single Slip HTML ──────────────────────────────────────
export const generateMedicineSingleSlipHtml = ({ patient, request, size = "a4" }) => {
  const printedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const meds = request.medicines || request.items || [];
  const rowsHtml = meds.map((m, idx) => `
    <tr>
      <td class="text-center" style="width: 35px;">${idx + 1}</td>
      <td style="font-weight: 700; color: #136A63;">${m.itemName || m.item_name || m.name || "—"}</td>
      <td class="text-center" style="width: 80px;">${m.dosage || "—"}</td>
      <td class="text-center" style="width: 60px;">${m.noOfDays || m.days || "—"}</td>
      <td class="text-center" style="width: 60px; font-weight: 700; font-size: 13px;">${m.qty || m.quantity || 1}</td>
      <td style="width: 75px;">${m.route || "—"}</td>
      <td>${m.remark || "—"}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Medicine Requisition Slip - ${request.bill_id || request.Bill_id || "Req"}</title>
  <style>${getBaseStyles(size)}</style>
</head>
<body>
  <div class="header-table">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1 class="hospital-title">${HOSPITAL_INFO.name}</h1>
        <div class="hospital-sub">${HOSPITAL_INFO.address}</div>
        <div class="hospital-sub">${HOSPITAL_INFO.details}</div>
      </div>
      <div style="text-align: right;">
        <span class="doc-badge">💊 OT MEDICINE REQUISITION SLIP</span>
        <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 4px;">REQ ID: ${request.bill_id || request.Bill_id || "—"}</div>
      </div>
    </div>
  </div>

  <div class="meta-panel">
    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">Patient Name</span>
        <span class="meta-val">${patient.name || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">IP Number</span>
        <span class="meta-val" style="color: #136A63; font-weight: 800;">${patient.ipNo || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">UHID</span>
        <span class="meta-val">${patient.uhid || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Age / Gender</span>
        <span class="meta-val">${patient.age || "—"} / ${patient.gender || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Doctor</span>
        <span class="meta-val">${request.doctorName || request.doctor || patient.admittingDr || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Raised From (OT / Ward)</span>
        <span class="meta-val">${request.wardName || patient.roomBed || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Request Date &amp; Time</span>
        <span class="meta-val">${request.reqDate || ""} ${request.reqTime || ""}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Status</span>
        <span class="meta-val" style="color: ${request.is_dispatched ? "#047857" : "#b45309"}; font-weight: 700;">
          ${request.is_dispatched ? "Dispatched" : "Pending Dispatch"} (${request.billingStatus || "Pending"})
        </span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Raised By (OT Staff)</span>
        <span class="meta-val" style="font-weight: 700; color: #0f766e;">${request.created_by_name || request.userName || request.created_by || "—"}</span>
      </div>
    </div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th class="text-center">#</th>
        <th>Medicine / Drug Name</th>
        <th class="text-center">Dosage</th>
        <th class="text-center">Days</th>
        <th class="text-center">Qty</th>
        <th>Route</th>
        <th>Remarks</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="signature-row" style="margin-top: 55px;">
    <div class="sig-block">
      <div class="sig-name">${request.created_by_name || request.userName || request.created_by || ""}</div>
      <div class="sig-line"></div>
      <div class="sig-title">Raised By (OT Staff / Nurse)</div>
      ${(request.created_by_name || request.userName || request.created_by) ? `<div class="sig-sub">(${request.created_by_name || request.userName || request.created_by})</div>` : ""}
    </div>
    <div class="sig-block">
      <div class="sig-name"></div>
      <div class="sig-line"></div>
      <div class="sig-title">Dispensed By (Pharmacist)</div>
    </div>
    <div class="sig-block">
      <div class="sig-name">${request.created_by_name || request.userName || request.created_by || ""}</div>
      <div class="sig-line"></div>
      <div class="sig-title">Received By (OT Staff)</div>
    </div>
  </div>

  <div class="print-footer">
    <span>Printed On: ${printedAt}</span>
    <span>Hospital Management System — OT Medicine Slip</span>
    <span>Page 1 of 1</span>
  </div>
</body>
</html>`;
};

// ─── 4. Implant Request Overall Print HTML ─────────────────────────────────────
export const generateImplantOverallPrintHtml = ({ patient, requests = [], size = "a4" }) => {
  const printedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Flatten all items across requests
  const allItems = [];
  requests.forEach((req) => {
    const items = req.items || [];
    items.forEach((it) => {
      allItems.push({
        reqId: req.request_id || "—",
        reqDateTime: `${req.reqDate || ""} ${req.reqTime || ""}`.trim(),
        surgeryRef: req.surgeryRef || patient.surgeryRef || "—",
        status: req.status || "Pending",
        itemName: it.itemName || it.item_name || "—",
        hsn: it.hsn || "—",
        quantity: it.quantity || 1,
      });
    });
  });

  const totalQty = allItems.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);

  const uniqueRequesters = Array.from(
    new Set(
      requests
        .map((r) => r.created_by_name || r.created_by)
        .filter((v) => Boolean(v && String(v).trim()))
    )
  );
  const requestedByName = uniqueRequesters.join(", ");

  // Group items by request ID while preserving arrival order
  const reqGroups = [];
  const reqMap = new Map();

  allItems.forEach((it, idx) => {
    const rawReq = it.reqId;
    const key = rawReq && rawReq !== "—" ? String(rawReq).trim() : `req-${idx}`;
    if (!reqMap.has(key)) {
      const group = {
        reqId: rawReq || "—",
        reqDateTime: it.reqDateTime,
        surgeryRef: it.surgeryRef,
        status: it.status,
        items: [],
      };
      reqMap.set(key, group);
      reqGroups.push(group);
    }
    reqMap.get(key).items.push(it);
  });

  const rowsHtml = reqGroups.length > 0
    ? reqGroups
        .map((group, groupIdx) => {
          const spanCount = group.items.length;
          return group.items
            .map((it, itemIdx) => {
              const isFirst = itemIdx === 0;
              const topBorder = groupIdx > 0 && isFirst ? "border-top: 2px solid #cbd5e1;" : "";

              const itemDetailCells = `
                <td style="font-weight: 600; ${topBorder}">${it.itemName}</td>
                <td style="width: 90px; ${topBorder}">${it.hsn}</td>
                <td class="text-center" style="width: 55px; font-weight: 800; font-size: 12px; ${topBorder}">${it.quantity}</td>
                <td class="text-center" style="width: 85px; ${topBorder}">
                  <span style="font-weight: 700; font-size: 10.5px; color: ${it.status === "Billed" ? "#047857" : it.status === "Cancelled" ? "#94a3b8" : "#b45309"};">
                    ${it.status}
                  </span>
                </td>
              `;

              if (isFirst) {
                return `
                  <tr>
                    <td class="text-center" rowspan="${spanCount}" style="width: 35px; vertical-align: middle; font-weight: 700; color: #64748b; background: #ffffff; ${topBorder}">
                      ${groupIdx + 1}
                    </td>
                    <td rowspan="${spanCount}" style="font-weight: 700; color: #136A63; width: 110px; vertical-align: middle; background: #ffffff; ${topBorder}">
                      ${group.reqId}
                    </td>
                    <td rowspan="${spanCount}" style="width: 120px; vertical-align: middle; background: #ffffff; ${topBorder}">
                      ${group.reqDateTime}
                    </td>
                    ${itemDetailCells}
                    <td rowspan="${spanCount}" style="width: 100px; vertical-align: middle; background: #ffffff; ${topBorder}">
                      ${group.surgeryRef}
                    </td>
                  </tr>
                `;
              } else {
                return `
                  <tr>
                    ${itemDetailCells}
                  </tr>
                `;
              }
            })
            .join("");
        })
        .join("")
    : `<tr><td colspan="8" class="text-center" style="padding: 25px; color: #94a3b8;">No implant requests recorded.</td></tr>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>OT Implant Requisitions - ${patient.ipNo || "IP"}</title>
  <style>${getBaseStyles(size)}</style>
</head>
<body>
  <div class="header-table">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1 class="hospital-title">${HOSPITAL_INFO.name}</h1>
        <div class="hospital-sub">${HOSPITAL_INFO.address}</div>
        <div class="hospital-sub">${HOSPITAL_INFO.details} &nbsp;|&nbsp; ${HOSPITAL_INFO.phone}</div>
      </div>
      <div style="text-align: right;">
        <span class="doc-badge">🔩 OT IMPLANT REQUISITION STATEMENT</span>
        <div style="font-size: 9.5px; color: #64748b; margin-top: 4px;">CONSOLIDATED IMPLANT CONSUMPTION SHEET</div>
      </div>
    </div>
  </div>

  <div class="meta-panel">
    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">Patient Name</span>
        <span class="meta-val">${patient.name || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">IP Number</span>
        <span class="meta-val" style="color: #136A63; font-weight: 800;">${patient.ipNo || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">UHID</span>
        <span class="meta-val">${patient.uhid || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Age / Gender</span>
        <span class="meta-val">${patient.age || "—"} / ${patient.gender || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Surgeon</span>
        <span class="meta-val">${patient.surgeonName || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Room / Bed</span>
        <span class="meta-val">${patient.roomBed || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Surgery Ref</span>
        <span class="meta-val">${patient.surgeryRef || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Customer Type</span>
        <span class="meta-val">${patient.customerType || "—"} ${patient.companyName && patient.companyName !== "-" ? `(${patient.companyName})` : ""}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Requested By (OT Staff)</span>
        <span class="meta-val" style="font-weight: 700; color: #0f766e;">${requestedByName || "—"}</span>
      </div>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card">
      <span>Total Implant Requests</span>
      <strong>${requests.length} Requests</strong>
    </div>
    <div class="kpi-card">
      <span>Total Implant Items</span>
      <strong>${allItems.length} Line Items</strong>
    </div>
    <div class="kpi-card">
      <span>Total Quantity</span>
      <strong style="color: #0f766e; font-size: 15px;">${totalQty} Units</strong>
    </div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th class="text-center">#</th>
        <th>Request ID</th>
        <th>Date &amp; Time</th>
        <th>Implant Item Name</th>
        <th>HSN Code</th>
        <th class="text-center">Qty</th>
        <th>Surgery Ref</th>
        <th class="text-center">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="signature-row">
    <div class="sig-block">
      <div class="sig-name">${requestedByName || ""}</div>
      <div class="sig-line"></div>
      <div class="sig-title">Requested By (OT Staff)</div>
      ${requestedByName ? `<div class="sig-sub">(${requestedByName})</div>` : ""}
    </div>
    <div class="sig-block">
      <div class="sig-name">${patient.surgeonName || ""}</div>
      <div class="sig-line"></div>
      <div class="sig-title">Operating Surgeon</div>
      ${patient.surgeonName ? `<div class="sig-sub">(${patient.surgeonName})</div>` : ""}
    </div>
    <div class="sig-block">
      <div class="sig-name"></div>
      <div class="sig-line"></div>
      <div class="sig-title">Store / Vendor Sign</div>
    </div>
  </div>

  <div class="print-footer">
    <span>Printed On: ${printedAt}</span>
    <span>Hospital Management System — OT Implant Requisitions</span>
    <span>Page 1 of 1</span>
  </div>
</body>
</html>`;
};

// ─── 5. Implant Request Single Slip HTML ───────────────────────────────────────
export const generateImplantSingleSlipHtml = ({ patient, request, size = "a4" }) => {
  const printedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const requestedByName = request.created_by_name || request.created_by || "";

  const items = request.items || [];
  const rowsHtml = items.map((it, idx) => `
    <tr>
      <td class="text-center" style="width: 38px;">${idx + 1}</td>
      <td style="font-weight: 700; color: #136A63;">${it.itemName || it.item_name || "—"}</td>
      <td style="width: 120px;">${it.hsn || "—"}</td>
      <td class="text-center" style="width: 80px; font-weight: 800; font-size: 13px;">${it.quantity || 1}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Implant Requisition Slip - ${request.request_id || "Req"}</title>
  <style>${getBaseStyles(size)}</style>
</head>
<body>
  <div class="header-table">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1 class="hospital-title">${HOSPITAL_INFO.name}</h1>
        <div class="hospital-sub">${HOSPITAL_INFO.address}</div>
        <div class="hospital-sub">${HOSPITAL_INFO.details}</div>
      </div>
      <div style="text-align: right;">
        <span class="doc-badge">🔩 OT IMPLANT REQUISITION SLIP</span>
        <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 4px;">REQ ID: ${request.request_id || "—"}</div>
      </div>
    </div>
  </div>

  <div class="meta-panel">
    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">Patient Name</span>
        <span class="meta-val">${patient.name || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">IP Number</span>
        <span class="meta-val" style="color: #136A63; font-weight: 800;">${patient.ipNo || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">UHID</span>
        <span class="meta-val">${patient.uhid || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Age / Gender</span>
        <span class="meta-val">${patient.age || "—"} / ${patient.gender || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Surgeon</span>
        <span class="meta-val">${patient.surgeonName || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Room / Bed</span>
        <span class="meta-val">${patient.roomBed || "—"}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Request Date &amp; Time</span>
        <span class="meta-val">${request.reqDate || ""} ${request.reqTime || ""}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Status</span>
        <span class="meta-val" style="color: ${request.status === "Billed" ? "#047857" : "#b45309"}; font-weight: 700;">
          ${request.status || "Pending"}
        </span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Requested By (OT Staff)</span>
        <span class="meta-val" style="font-weight: 700; color: #0f766e;">${requestedByName || "—"}</span>
      </div>
    </div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th class="text-center">#</th>
        <th>Implant Item Name</th>
        <th>HSN Code</th>
        <th class="text-center">Quantity</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="signature-row" style="margin-top: 60px;">
    <div class="sig-block">
      <div class="sig-name">${requestedByName || ""}</div>
      <div class="sig-line"></div>
      <div class="sig-title">Requested By (OT Staff)</div>
      ${requestedByName ? `<div class="sig-sub">(${requestedByName})</div>` : ""}
    </div>
    <div class="sig-block">
      <div class="sig-name">${patient.surgeonName || ""}</div>
      <div class="sig-line"></div>
      <div class="sig-title">Operating Surgeon</div>
      ${patient.surgeonName ? `<div class="sig-sub">(${patient.surgeonName})</div>` : ""}
    </div>
    <div class="sig-block">
      <div class="sig-name"></div>
      <div class="sig-line"></div>
      <div class="sig-title">Issued By (Stores / Vendor)</div>
    </div>
  </div>

  <div class="print-footer">
    <span>Printed On: ${printedAt}</span>
    <span>Hospital Management System — OT Implant Requisition Slip</span>
    <span>Page 1 of 1</span>
  </div>
</body>
</html>`;
};
