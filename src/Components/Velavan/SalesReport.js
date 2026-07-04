"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Search,
  Printer,
  Eye,
  X,
  ArrowLeft,
  Download,
  PlusCircle,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
import {
  Container,
  Input,
  Select,
  Button,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
  colors,
} from "../GlobalStyles";

const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const formatDate = (d) => {
  if (!d || new Date(d).toString() === "Invalid Date") return "N/A";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};
const formatCurrency = (v) =>
  `₹${parseFloat(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const c = (n) => {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100) return tens[Math.floor(n / 10)] + " " + ones[n % 10] + " ";
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred " + c(n % 100);
    if (n < 100000) return c(Math.floor(n / 1000)) + "Thousand " + c(n % 1000);
    if (n < 10000000)
      return c(Math.floor(n / 100000)) + "Lakh " + c(n % 100000);
    return c(Math.floor(n / 10000000)) + "Crore " + c(n % 10000000);
  };
  const amount = parseFloat(num || 0);
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let r = c(rupees).trim() + " Rupees";
  if (paise > 0) r += " and " + c(paise).trim() + " Paise";
  return r + " Only";
};

const ORIENTATION_TOOLBAR = `
<div class="no-print" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;
  margin-bottom:14px;padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px">
  <span style="font-size:12px;font-weight:600;color:#555;margin-right:2px">Orientation:</span>
  <button id="btn-portrait" onclick="setOrientation('portrait')"
    style="padding:5px 14px;font-size:12px;font-weight:700;border:2px solid #0ea5e9;border-radius:5px;
           background:#e0f2fe;color:#1e40af;cursor:pointer">Portrait</button>
  <button id="btn-landscape" onclick="setOrientation('landscape')"
    style="padding:5px 14px;font-size:12px;font-weight:700;border:2px solid #cbd5e1;border-radius:5px;
           background:#fff;color:#64748b;cursor:pointer">Landscape</button>
  <button onclick="window.print()"
    style="padding:5px 18px;font-size:12px;font-weight:700;border:none;border-radius:5px;
           background:#0ea5e9;color:#fff;cursor:pointer;margin-left:8px">🖨 Print</button>
</div>
<script>
  function setOrientation(mode) {
    document.getElementById('orientation-style').textContent = '@page { size: ' + mode + '; }';
    var isP = mode === 'portrait';
    var pb = document.getElementById('btn-portrait'); var lb = document.getElementById('btn-landscape');
    pb.style.background = isP ? '#e0f2fe' : '#fff'; pb.style.borderColor = isP ? '#0ea5e9' : '#cbd5e1'; pb.style.color = isP ? '#1e40af' : '#64748b';
    lb.style.background = !isP ? '#e0f2fe' : '#fff'; lb.style.borderColor = !isP ? '#0ea5e9' : '#cbd5e1'; lb.style.color = !isP ? '#1e40af' : '#64748b';
  }
<\/script>`;
const PRINT_BASE_CSS = `@media print { .no-print { display:none !important } body { margin:0 } } @page { size: portrait; margin: 10mm }`;

const openPrintWindow = (title, css, bodyHtml) => {
  const pw = window.open("", "", "width=1000,height=750");
  pw.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>${css}${PRINT_BASE_CSS}</style>
    <style id="orientation-style">@page { size: portrait; }</style>
  </head><body>${ORIENTATION_TOOLBAR}${bodyHtml}</body></html>`);
  pw.document.close();
};

const pageHeader = {
  padding: "14px 18px",
  borderBottom: `2px solid ${colors.border}`,
  background: colors.tabBg,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderRadius: "8px 8px 0 0",
};
const filtersBar = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  padding: "12px 16px",
  background: "#fff",
  borderBottom: `1px solid ${colors.border}`,
  alignItems: "flex-end",
};
const filterGroup = { display: "flex", flexDirection: "column", minWidth: 160 };
const actionsBar = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: "10px 16px",
  background: "#fff",
  borderBottom: `1px solid ${colors.border}`,
};
const actionBtn = {
  background: "none",
  border: `1px solid ${colors.border}`,
  borderRadius: 4,
  padding: "3px 7px",
  cursor: "pointer",
  marginRight: 3,
  color: colors.textMuted,
  fontSize: "0.78rem",
  display: "inline-flex",
  alignItems: "center",
};

// ── Single "Report" and "Export" buttons, each opening a dropdown listing
// all report types (Sales Report, Sales Tax Register, Sales Return Register,
// GSTR1_B2B) ──
const dropdownWrap = { position: "relative" };
const dropdownMenu = {
  position: "absolute",
  top: "calc(100% + 4px)",
  right: 0,
  background: "#fff",
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
  zIndex: 999,
  minWidth: 210,
  overflow: "hidden",
};
const dropdownItem = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  padding: "10px 14px",
  border: "none",
  background: "none",
  cursor: "pointer",
  fontSize: "0.83rem",
  textAlign: "left",
  borderBottom: `1px solid ${colors.border}`,
};
const dropdownItemLast = { ...dropdownItem, borderBottom: "none" };

const SalesReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from_date: today,
    to_date: today,
    search: "",
  });
  const [selected, setSelected] = useState(null);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const reportDropdownRef = React.useRef(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = React.useRef(null);

  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]",
  );
  const [returnModalBill, setReturnModalBill] = useState(null);
  const [returnLines, setReturnLines] = useState([]);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnsData, setReturnsData] = useState([]);

  const canReturn = allowedActions.includes("HMS-P-VS-RW");
  const canVP = allowedActions.includes("HMS-P-VS-R");
  const canSalP = allowedActions.includes("HMS-P-VSRP");

  const isWithinReturnWindow = (billDate) => {
    if (!billDate) return false;
    const diffDays =
      (Date.now() - new Date(billDate).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        reportDropdownRef.current &&
        !reportDropdownRef.current.contains(e.target)
      )
        setShowReportDropdown(false);
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(e.target)
      )
        setShowExportDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchReturnsForRegister = async () => {
    const params = new URLSearchParams();
    if (filters.from_date) params.append("from_date", filters.from_date);
    if (filters.to_date) params.append("to_date", filters.to_date);
    const r = await apiRequest(
      `${HMSURL}velavan/sales-return/list/?${params.toString()}`,
      "GET",
    );
    return r.success && r.data?.status === "success" ? r.data.data || [] : [];
  };

  const fetchBills = useCallback(async (fromDate, toDate) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: 1, page_size: 1000 });
      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);
      const r = await apiRequest(
        `${HMSURL}velavan/sales/list/?${params.toString()}`,
        "GET",
      );
      if (!r.success || r.data?.status !== "success")
        throw new Error(r.error || "Failed to load");
      const sorted = [...(r.data.data || [])].sort(
        (a, b) => new Date(b.bill_date) - new Date(a.bill_date),
      );
      setBills(sorted);
      setFilteredBills(sorted);
    } catch (e) {
      toast.error(e.message || "Failed to fetch sales bills");
      setBills([]);
      setFilteredBills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills(today, today);
  }, [fetchBills]); // eslint-disable-line

  useEffect(() => {
    if (!filters.search.trim()) {
      setFilteredBills(bills);
      return;
    }
    const s = filters.search.toLowerCase().trim();
    setFilteredBills(
      bills.filter(
        (b) =>
          b.bill_number?.toLowerCase().includes(s) ||
          b.source_grn_number?.toLowerCase().includes(s) ||
          b.customer_name?.toLowerCase().includes(s) ||
          b.company_name?.toLowerCase().includes(s) ||
          b.patient_name?.toLowerCase().includes(s) ||
          b.ip_number?.toLowerCase().includes(s) ||
          b.surgeon_name?.toLowerCase().includes(s) ||
          (b.items || []).some((i) => i.batch_no?.toLowerCase().includes(s)),
      ),
    );
  }, [bills, filters.search]);

  const getDateRangeLabel = () => {
    const from = filters.from_date ? formatDate(filters.from_date) : null;
    const to = filters.to_date ? formatDate(filters.to_date) : null;
    if (from && to) return from === to ? from : `${from} to ${to}`;
    if (from) return `From ${from}`;
    if (to) return `To ${to}`;
    return "All Dates";
  };

  // ── Velavan Print (per bill) — ported from Invoice's handleVelavanPrint,
  // now reading directly from the stored sale record's items, which already
  // reflect the exact billed quantities. ──
  const handleVelavanPrint = (bill) => {
    const items = bill.items || [];
    const sellingTaxableAmt = items.reduce(
      (s, i) => s + parseFloat(i.sellingCostBeforeGst || 0),
      0,
    );
    const sellingCgst = items.reduce(
      (s, i) => s + parseFloat(i.sellingCgstAmt || 0),
      0,
    );
    const sellingSgst = items.reduce(
      (s, i) => s + parseFloat(i.sellingSgstAmt || 0),
      0,
    );
    const sellingTotal = items.reduce(
      (s, i) => s + parseFloat(i.sellingCost || 0),
      0,
    );
    const decimal = sellingTotal - Math.floor(sellingTotal);
    const roundOff = decimal >= 0.5 ? 1 - decimal : -decimal;
    const roundedTotal = sellingTotal + roundOff;
    const hasPatient = bill.ip_number || bill.patient_name || bill.surgeon_name;

    const css = `
      body{font-family:Arial,sans-serif;margin:20px;font-size:12px;line-height:1.5}
      h1{font-size:17px;font-weight:bold;color:#000;text-align:center;margin:0 0 3px}
      .sub{text-align:center;font-size:10.5px;margin:2px 0;color:#000}
      .divider{border-top:2px solid #000;margin:8px 0}
      .doctype{font-size:14px;font-weight:bold;margin:12px 0;padding:8px;background:#fff;border:2px solid #000;color:#000;text-align:center}
      .grid{width:100%;border-collapse:collapse;margin-bottom:12px;border:2px solid #000;table-layout:fixed}
      .sec{border-right:1px solid #000;vertical-align:top}.sec:last-child{border-right:none}
      .hdr{background:#fff;padding:5px 8px;font-weight:bold;border-bottom:1px solid #000;text-align:center;color:#000;font-size:13px}
      .cnt{padding:8px;text-align:left;vertical-align:top}
      .row{margin:4px 0;font-size:13px;white-space:normal;word-break:break-word}
      table.items{width:100%;border-collapse:collapse;margin:14px 0;font-size:10px;border:2px solid #000}
      table.items th,table.items td{border:1px solid #000;padding:5px;text-align:center;vertical-align:middle}
      table.items th{background:#fff;font-weight:bold;color:#000;font-size:9.5px;white-space:nowrap}
      .r{text-align:right;padding-right:5px}.l{text-align:left;padding-left:5px}
      .tot{background:#fff;font-weight:bold}
      .summary{display:flex;gap:10px;margin-top:14px}
      .gst{flex:1;border:2px solid #000;background:#fff;padding:10px}
      .gst-title{font-weight:bold;font-size:12px;margin-bottom:8px;color:#000;border-bottom:1px solid #000;padding-bottom:4px}
      .gst-row{display:flex;justify-content:space-between;margin:4px 0;font-size:11px;font-weight:bold;color:#000}
      .amts{min-width:240px;border:2px solid #000}
      .amt-row{display:flex;justify-content:space-between;border-bottom:1px solid #000;font-size:11px;padding:6px 12px;font-weight:bold;color:#000}
      .amt-row:last-child{border-bottom:none;background:#fff;color:#000}
      .words{margin:12px 0;padding:10px;background:#fff;border:2px solid #000;font-size:11px}
      .footer{display:flex;justify-content:space-between;margin-top:28px;padding-top:12px;border-top:1px dashed #000}
    `;

    const colWidth = hasPatient ? "33%" : "50%";
    const itemsHtml =
      items.length > 0
        ? `
      <table class="items">
        <thead>
          <tr>
            <th rowspan="2">Sl.</th><th rowspan="2" class="l" style="min-width:130px">Product</th>
            <th rowspan="2">HSN</th><th rowspan="2">Batch No</th><th rowspan="2">Expiry</th>
            <th rowspan="2">Qty</th><th rowspan="2">Unit Price</th><th rowspan="2">MRP</th>
            <th rowspan="2">Disc. %</th><th rowspan="2">Disc. Amt</th><th rowspan="2">Taxable Amt</th>
            <th colspan="2" style="border-left:2px solid #000">CGST</th><th colspan="2">SGST</th>
            <th rowspan="2">Total Amt</th>
          </tr>
          <tr>
            <th style="border-left:2px solid #000">Rate %</th><th>Amt (₹)</th>
            <th>Rate %</th><th>Amt (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map((item, i) => {
              const qty = parseFloat(item.quantity || 0);
              const unitSelling =
                qty > 0 ? parseFloat(item.sellingCostBeforeGst || 0) / qty : 0;
              const nonTaxableAmt = unitSelling * qty;
              return `<tr>
              <td>${i + 1}</td><td class="l">${item.name || "N/A"}</td><td>${item.hsn || "N/A"}</td>
              <td>${item.batch_no || "—"}</td><td>${item.expiry || "—"}</td>
              <td><b>${item.quantity || 0}</b></td>
              <td class="r">₹${unitSelling.toFixed(2)}</td>
              <td class="r">₹${item.mrp || 0}</td>
              <td class="r">${item.sellingDiscountPercent || "0"}%</td>
              <td class="r">₹${parseFloat(item.sellingDiscountedAmt || 0).toFixed(2)}</td>
              <td class="r">₹${nonTaxableAmt.toFixed(2)}</td>
              <td style="border-left:2px solid #000">${item.sellingCgstPercent || 0}%</td>
              <td class="r">₹${parseFloat(item.sellingCgstAmt || 0).toFixed(2)}</td>
              <td>${item.sellingsgstPercent || 0}%</td>
              <td class="r">₹${parseFloat(item.sellingSgstAmt || 0).toFixed(2)}</td>
              <td class="r"><b>₹${parseFloat(item.sellingCost || 0).toFixed(2)}</b></td>
            </tr>`;
            })
            .join("")}
          <tr class="tot">
            <td colspan="10" class="r"><b>TOTAL</b></td>
            <td class="r">₹${sellingTaxableAmt.toFixed(2)}</td>
            <td style="border-left:2px solid #000"></td>
            <td class="r">₹${sellingCgst.toFixed(2)}</td><td></td>
            <td class="r">₹${sellingSgst.toFixed(2)}</td>
            <td class="r"><b>₹${sellingTotal.toFixed(2)}</b></td>
          </tr>
        </tbody>
      </table>`
        : "<p style='text-align:center;color:#888'>No items</p>";

    const body = `
      <h1>VELAVAN HOSPITAL NEEDS PRIVATE LIMITED</h1>
      <div class="sub">51/24, Basement, Shanmuga Hospital Campus, Saradha College Road, Salem - 636007</div>
      <div class="sub">State: 33 - Tamil Nadu &nbsp;|&nbsp; Mobile: 8248456660</div>
      <div class="sub">DL No.: TN/SLE/20B/0028 &amp; TN/SLE/21B/0028 &nbsp;|&nbsp; GSTIN No.: 33AAICV7109G1ZC &nbsp;|&nbsp; PAN.: AAICV7109G</div>
      <div class="divider"></div>
      <div class="doctype">GST INVOICE — ${bill.bill_number}</div>
      <table class="grid">
        <thead><tr>
          <td class="sec hdr" style="width:${colWidth}">Invoice Details</td>
          <td class="sec hdr" style="width:${colWidth}">Billed To</td>
          ${hasPatient ? `<td class="sec hdr" style="width:34%">Patient Details</td>` : ""}
        </tr></thead>
        <tbody><tr>
          <td class="sec cnt">
            <div class="row"><b>Invoice No:</b> ${bill.bill_number}</div>
            <div class="row"><b>Invoice Date:</b> ${formatDate(bill.bill_date)}</div>           
          </td>
          <td class="sec cnt">
  <div class="row"><b>Hospital Name:</b> ${bill.customer_company || " "}</div>
  <div class="row"><b>Address:</b><br/>${
    [bill.customer_addressLine1, bill.customer_addressLine2]
      .filter(Boolean)
      .join(", ") || ""
  }<br/>${
    [bill.customer_city, bill.customer_pincode].filter(Boolean).join(" - ") ||
    "Salem - 636007"
  }</div>
  <div class="row"><b>Phone:</b> ${bill.customer_phone || ""}</div>
  <div class="row"><b>GSTIN:</b> ${bill.customer_gstin || ""}</div>
  ${bill.customer_pan ? `<div class="row"><b>PAN:</b> ${bill.customer_pan}</div>` : ""}
  <div class="row"><b>State:</b> ${bill.customer_state ? `${bill.customer_state}` : ""}</div>
</td>
          ${
            hasPatient
              ? `<td class="sec cnt">
            ${bill.ip_number ? `<div class="row"><b>IP Number:</b> ${bill.ip_number}</div>` : ""}
            ${bill.patient_name ? `<div class="row"><b>Patient:</b> ${bill.patient_name}</div>` : ""}
            ${bill.surgeon_id ? `<div class="row"><b>Surgeon:</b> ${bill.surgeon_name || bill.surgeon_id}</div>` : ""}
            ${bill.customer_type ? `<div class="row"><b>Customer Type:</b> ${bill.customer_type}${bill.company_name ? ` - ${bill.company_name}` : ""}</div>` : ""}
          </td>`
              : ""
          }
        </tr></tbody>
      </table>
      ${itemsHtml}
      <div class="summary">
        <div class="gst">
          <div class="gst-title">GST Summary</div>
          <div class="gst-row"><span>CGST</span><span>₹${sellingCgst.toFixed(2)}</span></div>
          <div class="gst-row"><span>SGST</span><span>₹${sellingSgst.toFixed(2)}</span></div>
          <div class="gst-row" style="border-top:1px solid #000;padding-top:4px;margin-top:6px">
            <span>Total GST</span><span>₹${(sellingCgst + sellingSgst).toFixed(2)}</span>
          </div>
        </div>
        <div class="amts">
          <div class="amt-row"><span>Taxable Amount</span><span>₹${sellingTaxableAmt.toFixed(2)}</span></div>
          <div class="amt-row"><span>CGST</span><span>₹${sellingCgst.toFixed(2)}</span></div>
          <div class="amt-row"><span>SGST</span><span>₹${sellingSgst.toFixed(2)}</span></div>
          <div class="amt-row"><span>Round Off</span><span>${roundOff > 0 ? "+" : ""}₹${roundOff.toFixed(2)}</span></div>
          <div class="amt-row"><span><b>Total Amount</b></span><span><b>₹${roundedTotal.toFixed(2)}</b></span></div>
        </div>
      </div>
      <div class="words"><b>Amount in Words:</b> ${numberToWords(roundedTotal)}</div>
      <div class="footer">
        <div><b>Prepared By:</b> ${bill.created_by || "N/A"}</div>
        <div style="text-align:center"><b>Authorized Signatory</b><br/><br/>________________________</div>
      </div>`;

    openPrintWindow(`Velavan Bill - ${bill.bill_number}`, css, body);
  };

  // ── Velavan Sales Report — aggregate list of bills (ported from Invoice) ──
  const buildSalesReportGroups = () => {
    const sortedData = [...filteredBills].sort((a, b) =>
      (a.customer_company || a.customer_name || "")
        .toLowerCase()
        .localeCompare(
          (b.customer_company || b.customer_name || "").toLowerCase(),
        ),
    );

    const companyGroups = {};
    let grandTotal = 0;
    let grandReturn = 0;
    let grandNet = 0;
    sortedData.forEach((b) => {
      const company = b.customer_company || b.customer_name || "N/A";
      if (!companyGroups[company])
        companyGroups[company] = {
          rows: [],
          total: 0,
          returnTotal: 0,
          netTotal: 0,
        };
      companyGroups[company].rows.push(b);
      const amt = parseFloat(b.total_amount || 0);
      const ret = parseFloat(b.sales_return_amount || 0);
      const net = parseFloat(
        b.net_total_amount ?? parseFloat(b.total_amount || 0) - ret,
      );
      companyGroups[company].total += amt;
      companyGroups[company].returnTotal += ret;
      companyGroups[company].netTotal += net;
      grandTotal += amt;
      grandReturn += ret;
      grandNet += net;
    });

    Object.keys(companyGroups).forEach((company) => {
      companyGroups[company].rows.sort((a, b) =>
        (a.bill_number || "").localeCompare(b.bill_number || ""),
      );
    });

    return { companyGroups, grandTotal, grandReturn, grandNet };
  };

  const handleSalesReportPrint = () => {
    const { companyGroups, grandTotal, grandReturn, grandNet } =
      buildSalesReportGroups();

    let tableRows = "";
    let sl = 1;
    Object.keys(companyGroups).forEach((company) => {
      const { rows, total, returnTotal, netTotal } = companyGroups[company];

      tableRows += `<tr style="background:#e0f2fe">
      <td colspan="6" style="font-weight:bold;padding:8px;color:#1e40af">${company}</td>
    </tr>`;

      rows.forEach((b) => {
        const ret = parseFloat(b.sales_return_amount || 0);
        const net = parseFloat(
          b.net_total_amount ?? parseFloat(b.total_amount || 0) - ret,
        );

        tableRows += `<tr>
        <td style="text-align:center">${sl++}</td>
        <td style="text-align:center">${b.bill_number}</td>
        <td style="text-align:center">${formatDate(b.bill_date)}</td>
        <td style="text-align:right">${formatCurrency(b.total_amount)}</td>
        <td style="text-align:right;color:#dc2626">${ret > 0 ? "- " + formatCurrency(ret) : "—"}</td>
        <td style="text-align:right;font-weight:bold">${formatCurrency(net)}</td>
      </tr>`;
      });

      tableRows += `<tr style="background:#fff3cd;font-weight:bold">
      <td colspan="3" style="text-align:right;padding:8px;border:1px solid #000">Total</td>
      <td style="text-align:right;padding:8px;border:1px solid #000">${formatCurrency(total)}</td>
      <td style="text-align:right;padding:8px;border:1px solid #000">${returnTotal > 0 ? "- " + formatCurrency(returnTotal) : "—"}</td>
      <td style="text-align:right;padding:8px;border:1px solid #000">${formatCurrency(netTotal)}</td>
    </tr>`;
    });

    const css = `
    body{font-family:Arial,sans-serif;padding:10px;font-size:13px}
    h1{text-align:center;font-size:18px;margin:10px 0;text-decoration:underline}
    h2{text-align:center;font-size:14px;color:#555;margin:0 0 14px}
    table{border-collapse:collapse;width:100%;border:1px solid #333}
    th,td{border:1px dashed #999;padding:7px 12px}
    th{background:#d0d0d0;font-weight:bold;text-align:center}
    .grand-row td{background:#d4edda;font-weight:bold}
  `;
    const body = `
    <h1>Velavan Party-wise Sales Report</h1><h2>${getDateRangeLabel()}</h2>
    <table>
      <thead><tr>
        <th>Sl.</th><th>Bill No</th><th>Bill Date</th>
        <th style="text-align:right">Amount</th>
        <th style="text-align:right">Return Amt</th>
        <th style="text-align:right">Net Amount</th>
      </tr></thead>
      <tbody>
        ${tableRows}
        <tr class="grand-row">
          <td colspan="3" style="text-align:right;padding:8px">Grand Total:</td>
          <td style="text-align:right;padding:8px">${formatCurrency(grandTotal)}</td>
          <td style="text-align:right;padding:8px">${grandReturn > 0 ? "- " + formatCurrency(grandReturn) : "—"}</td>
          <td style="text-align:right;padding:8px">${formatCurrency(grandNet)}</td>
        </tr>
      </tbody>
    </table>`;
    openPrintWindow("Velavan Sales Report", css, body);
  };

  const exportSalesReportExcel = () => {
    const XLSX = require("xlsx");
    const { companyGroups, grandTotal, grandReturn, grandNet } =
      buildSalesReportGroups();

    const wsData = [
      [`Velavan Party-wise Sales Report - ${getDateRangeLabel()}`],
      [],
      ["Sl.", "Bill No", "Bill Date", "Amount", "Return Amt", "Net Amount"],
    ];

    let sl = 1;
    Object.keys(companyGroups).forEach((company) => {
      const { rows, total, returnTotal, netTotal } = companyGroups[company];
      wsData.push([company]);
      rows.forEach((b) => {
        const ret = parseFloat(b.sales_return_amount || 0);
        const net = parseFloat(
          b.net_total_amount ?? parseFloat(b.total_amount || 0) - ret,
        );
        wsData.push([
          sl++,
          b.bill_number,
          formatDate(b.bill_date),
          parseFloat(parseFloat(b.total_amount || 0).toFixed(2)),
          ret > 0 ? -parseFloat(ret.toFixed(2)) : "",
          parseFloat(net.toFixed(2)),
        ]);
      });
      wsData.push([
        "",
        "",
        "Total",
        parseFloat(total.toFixed(2)),
        returnTotal > 0 ? -parseFloat(returnTotal.toFixed(2)) : "",
        parseFloat(netTotal.toFixed(2)),
      ]);
      wsData.push([]);
    });

    wsData.push([
      "",
      "",
      "Grand Total",
      parseFloat(grandTotal.toFixed(2)),
      grandReturn > 0 ? -parseFloat(grandReturn.toFixed(2)) : "",
      parseFloat(grandNet.toFixed(2)),
    ]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [
      { wch: 6 },
      { wch: 20 },
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(
      wb,
      `SalesReport_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // ── Sales Tax Register — grouped by bill_date, buckets by sellingTax rate.
  // Uses original_items (gross, un-netted) because this register reports
  // total sales for the period; returns are reported separately in the
  // Sales Return Register, not subtracted out here. ──
  const buildTaxRegisterData = () => {
    const dateGroups = {};
    filteredBills.forEach((b) => {
      const key = b.bill_date || "";
      if (!dateGroups[key]) dateGroups[key] = [];
      dateGroups[key].push(b);
    });
    const emptyBucket = () => ({ amount: 0, sgst: 0, cgst: 0, total: 0 });
    const getBucketKey = (rate) => {
      const r = parseFloat(rate || 0);
      if (r === 0) return "exempt";
      if (r <= 6) return "5";
      if (r <= 13) return "12";
      return "18";
    };
    const RATE_BUCKETS = ["exempt", "5", "12", "18"];
    let grand = {
      exempt: emptyBucket(),
      5: emptyBucket(),
      12: emptyBucket(),
      18: emptyBucket(),
      total: emptyBucket(),
    };
    const sortedDates = Object.keys(dateGroups).sort(
      (a, b) => new Date(a) - new Date(b),
    );

    const rows = sortedDates.map((dateKey) => {
      const dayBills = dateGroups[dateKey];
      const nums = dayBills
        .map((b) => b.bill_number)
        .filter(Boolean)
        .sort();
      const billRange =
        nums.length <= 1
          ? nums[0] || "N/A"
          : `${nums[0]} - ${nums[nums.length - 1].split("/").pop()}`;
      const buckets = {
        exempt: emptyBucket(),
        5: emptyBucket(),
        12: emptyBucket(),
        18: emptyBucket(),
      };
      dayBills.forEach((b) => {
        (b.original_items || b.items || []).forEach((item) => {
          const key = getBucketKey(item.sellingTax);
          buckets[key].amount += parseFloat(item.sellingCostBeforeGst || 0);
          buckets[key].sgst += parseFloat(item.sellingSgstAmt || 0);
          buckets[key].cgst += parseFloat(item.sellingCgstAmt || 0);
          buckets[key].total += parseFloat(item.sellingCost || 0);
        });
      });
      const rowTotal = RATE_BUCKETS.reduce(
        (acc, k) => ({
          amount: acc.amount + buckets[k].amount,
          sgst: acc.sgst + buckets[k].sgst,
          cgst: acc.cgst + buckets[k].cgst,
          total: acc.total + buckets[k].total,
        }),
        emptyBucket(),
      );
      RATE_BUCKETS.forEach((k) => {
        grand[k].amount += buckets[k].amount;
        grand[k].sgst += buckets[k].sgst;
        grand[k].cgst += buckets[k].cgst;
        grand[k].total += buckets[k].total;
      });
      grand.total.amount += rowTotal.amount;
      grand.total.sgst += rowTotal.sgst;
      grand.total.cgst += rowTotal.cgst;
      grand.total.total += rowTotal.total;
      return { dateKey, billRange, buckets, rowTotal };
    });
    return { rows, grand, RATE_BUCKETS };
  };

  const handleSalesTaxRegisterPrint = () => {
    const { rows, grand } = buildTaxRegisterData();
    const fmt = (n) =>
      n === 0 ? "" : n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    const fmtG = (n) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    const cells = (b, g = false) =>
      `<td class="r${g ? " grand-cell" : ""}">${g ? fmtG(b.amount) : fmt(b.amount)}</td>` +
      `<td class="r${g ? " grand-cell" : ""}">${g ? fmtG(b.sgst) : fmt(b.sgst)}</td>` +
      `<td class="r${g ? " grand-cell" : ""}">${g ? fmtG(b.cgst) : fmt(b.cgst)}</td>` +
      `<td class="r tot-cell${g ? " grand-cell" : ""}">${g ? fmtG(b.total) : fmt(b.total)}</td>`;
    const tableRows = rows
      .map(
        ({ dateKey, billRange, buckets, rowTotal }) => `
      <tr>
        <td class="c">${formatDate(dateKey)}</td><td class="c">VELAVAN HOSPITAL NEEDS</td>
        <td class="billcol">${billRange}</td>
        ${cells(buckets.exempt)}${cells(buckets["5"])}${cells(buckets["12"])}${cells(buckets["18"])}${cells(rowTotal)}
      </tr>`,
      )
      .join("");
    const css = `
      body{font-family:Arial,sans-serif;padding:10px;font-size:11px;margin:0}
      .report-title{font-size:13px;font-weight:bold;margin:0 0 2px}.page-info{text-align:right;font-size:11px;margin-bottom:6px}
      table{border-collapse:collapse;width:100%;font-size:10px}th,td{border:1px solid #555;padding:4px 5px}
      th{background:#d9d9d9;font-weight:bold;text-align:center}.r{text-align:right}.c{text-align:center;white-space:nowrap}
      .billcol{white-space:nowrap;min-width:130px}.tot-cell{font-weight:bold;background:#f0f0f0}
      .grand-row td{font-weight:bold;background:#d9ead3}.grand-cell{background:#d9ead3}
      .grp-5{background:#e2efda}.grp-12{background:#dae3f3}.grp-18{background:#fce4d6}.grp-ex{background:#eeeeee}.grp-tot{background:#fff2cc}
    `;
    const body = `
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:6px">
        <div class="report-title">Sales Tax Register From ${getDateRangeLabel()}</div>
        <div class="page-info">Page : 1/1</div>
      </div>
      <table>
        <thead>
          <tr><th rowspan="2">BILLDATE</th><th rowspan="2">BILLNAME</th><th rowspan="2">BILLS</th>
            <th colspan="4" class="grp-ex">EXEMPTED GST</th><th colspan="4" class="grp-5">RATE OF 5%</th>
            <th colspan="4" class="grp-12">RATE OF 12%</th><th colspan="4" class="grp-18">RATE OF 18%</th>
            <th colspan="4" class="grp-tot">Total</th></tr>
          <tr>
            <th class="grp-ex">AMOUNT</th><th class="grp-ex">SGST</th><th class="grp-ex">CGST</th><th class="grp-ex">TOTAL</th>
            <th class="grp-5">AMOUNT</th><th class="grp-5">SGST</th><th class="grp-5">CGST</th><th class="grp-5">TOTAL</th>
            <th class="grp-12">AMOUNT</th><th class="grp-12">SGST</th><th class="grp-12">CGST</th><th class="grp-12">TOTAL</th>
            <th class="grp-18">AMOUNT</th><th class="grp-18">SGST</th><th class="grp-18">CGST</th><th class="grp-18">TOTAL</th>
            <th class="grp-tot">AMOUNT</th><th class="grp-tot">SGST</th><th class="grp-tot">CGST</th><th class="grp-tot">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr class="grand-row"><td colspan="3" style="text-align:right;padding-right:8px">Grand Total</td>
            ${cells(grand.exempt, true)}${cells(grand["5"], true)}${cells(grand["12"], true)}${cells(grand["18"], true)}${cells(grand.total, true)}
          </tr>
        </tbody>
      </table>`;
    openPrintWindow("Sales Tax Register", css, body);
  };

  const exportSalesTaxRegisterExcel = () => {
    const XLSX = require("xlsx");
    const { rows, grand } = buildTaxRegisterData();
    const f = (n) => (n === 0 ? "" : parseFloat(n.toFixed(2)));
    const fG = (n) => parseFloat(n.toFixed(2));

    const dataRows = rows.map(({ dateKey, billRange, buckets, rowTotal }) => [
      formatDate(dateKey),
      "VELAVAN HOSPITAL NEEDS",
      billRange,
      f(buckets.exempt.amount),
      f(buckets.exempt.sgst),
      f(buckets.exempt.cgst),
      f(buckets.exempt.total),
      f(buckets["5"].amount),
      f(buckets["5"].sgst),
      f(buckets["5"].cgst),
      f(buckets["5"].total),
      f(buckets["12"].amount),
      f(buckets["12"].sgst),
      f(buckets["12"].cgst),
      f(buckets["12"].total),
      f(buckets["18"].amount),
      f(buckets["18"].sgst),
      f(buckets["18"].cgst),
      f(buckets["18"].total),
      f(rowTotal.amount),
      f(rowTotal.sgst),
      f(rowTotal.cgst),
      f(rowTotal.total),
    ]);
    const grandRow = [
      "Grand Total",
      "",
      "",
      fG(grand.exempt.amount),
      fG(grand.exempt.sgst),
      fG(grand.exempt.cgst),
      fG(grand.exempt.total),
      fG(grand["5"].amount),
      fG(grand["5"].sgst),
      fG(grand["5"].cgst),
      fG(grand["5"].total),
      fG(grand["12"].amount),
      fG(grand["12"].sgst),
      fG(grand["12"].cgst),
      fG(grand["12"].total),
      fG(grand["18"].amount),
      fG(grand["18"].sgst),
      fG(grand["18"].cgst),
      fG(grand["18"].total),
      fG(grand.total.amount),
      fG(grand.total.sgst),
      fG(grand.total.cgst),
      fG(grand.total.total),
    ];
    const titleRow = [`Sales Tax Register - ${getDateRangeLabel()}`];
    const groupRow = [
      "BILLDATE",
      "BILLNAME",
      "BILLS",
      "EXEMPTED GST",
      "",
      "",
      "",
      "RATE OF 5%",
      "",
      "",
      "",
      "RATE OF 12%",
      "",
      "",
      "",
      "RATE OF 18%",
      "",
      "",
      "",
      "Total",
      "",
      "",
      "",
    ];
    const subRow = [
      "",
      "",
      "",
      "AMOUNT",
      "SGST",
      "CGST",
      "TOTAL",
      "AMOUNT",
      "SGST",
      "CGST",
      "TOTAL",
      "AMOUNT",
      "SGST",
      "CGST",
      "TOTAL",
      "AMOUNT",
      "SGST",
      "CGST",
      "TOTAL",
      "AMOUNT",
      "SGST",
      "CGST",
      "TOTAL",
    ];
    const wsData = [titleRow, [], groupRow, subRow, ...dataRows, grandRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 22 } },
      { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } },
      { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } },
      { s: { r: 2, c: 2 }, e: { r: 3, c: 2 } },
      { s: { r: 2, c: 3 }, e: { r: 2, c: 6 } },
      { s: { r: 2, c: 7 }, e: { r: 2, c: 10 } },
      { s: { r: 2, c: 11 }, e: { r: 2, c: 14 } },
      { s: { r: 2, c: 15 }, e: { r: 2, c: 18 } },
      { s: { r: 2, c: 19 }, e: { r: 2, c: 22 } },
    ];
    ws["!cols"] = [
      { wch: 13 },
      { wch: 24 },
      { wch: 28 },
      ...Array(20).fill({ wch: 14 }),
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Tax Register");
    XLSX.writeFile(
      wb,
      `SalesTaxRegister_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const buildReturnRegisterData = (returns) => {
    const dateGroups = {};
    returns.forEach((rr) => {
      const key = rr.return_date || "";
      if (!dateGroups[key]) dateGroups[key] = [];
      dateGroups[key].push(rr);
    });
    const emptyBucket = () => ({ amount: 0, sgst: 0, cgst: 0, total: 0 });
    const getBucketKey = (rate) => {
      const r = parseFloat(rate || 0);
      if (r === 0) return "exempt";
      if (r <= 6) return "5";
      if (r <= 13) return "12";
      return "18";
    };
    const RATE_BUCKETS = ["exempt", "5", "12", "18"];
    let grand = {
      exempt: emptyBucket(),
      5: emptyBucket(),
      12: emptyBucket(),
      18: emptyBucket(),
      total: emptyBucket(),
    };
    const sortedDates = Object.keys(dateGroups).sort(
      (a, b) => new Date(a) - new Date(b),
    );

    const rows = sortedDates.map((dateKey) => {
      const dayReturns = dateGroups[dateKey];
      const nums = dayReturns
        .map((r) => r.return_number)
        .filter(Boolean)
        .sort();
      const range =
        nums.length <= 1
          ? nums[0] || "N/A"
          : `${nums[0]} - ${nums[nums.length - 1].split("/").pop()}`;
      const buckets = {
        exempt: emptyBucket(),
        5: emptyBucket(),
        12: emptyBucket(),
        18: emptyBucket(),
      };
      dayReturns.forEach((rr) => {
        (rr.items || []).forEach((item) => {
          const rate = parseFloat(item.sellingCgstPercent || 0) * 2;
          const key = getBucketKey(rate);
          buckets[key].amount += parseFloat(item.sellingCostBeforeGst || 0);
          buckets[key].sgst += parseFloat(item.sellingSgstAmt || 0);
          buckets[key].cgst += parseFloat(item.sellingCgstAmt || 0);
          buckets[key].total += parseFloat(item.sellingCost || 0);
        });
      });
      const rowTotal = RATE_BUCKETS.reduce(
        (acc, k) => ({
          amount: acc.amount + buckets[k].amount,
          sgst: acc.sgst + buckets[k].sgst,
          cgst: acc.cgst + buckets[k].cgst,
          total: acc.total + buckets[k].total,
        }),
        emptyBucket(),
      );
      RATE_BUCKETS.forEach((k) => {
        grand[k].amount += buckets[k].amount;
        grand[k].sgst += buckets[k].sgst;
        grand[k].cgst += buckets[k].cgst;
        grand[k].total += buckets[k].total;
      });
      grand.total.amount += rowTotal.amount;
      grand.total.sgst += rowTotal.sgst;
      grand.total.cgst += rowTotal.cgst;
      grand.total.total += rowTotal.total;
      return { dateKey, range, buckets, rowTotal };
    });
    return { rows, grand };
  };

  const handleSalesReturnRegisterPrint = async () => {
    const returns = await fetchReturnsForRegister();
    const { rows, grand } = buildReturnRegisterData(returns);
    const fmt = (n) =>
      n === 0 ? "" : n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    const fmtG = (n) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    const cells = (b, g = false) =>
      `<td class="r${g ? " grand-cell" : ""}">${g ? fmtG(b.amount) : fmt(b.amount)}</td>` +
      `<td class="r${g ? " grand-cell" : ""}">${g ? fmtG(b.sgst) : fmt(b.sgst)}</td>` +
      `<td class="r${g ? " grand-cell" : ""}">${g ? fmtG(b.cgst) : fmt(b.cgst)}</td>` +
      `<td class="r tot-cell${g ? " grand-cell" : ""}">${g ? fmtG(b.total) : fmt(b.total)}</td>`;
    const tableRows = rows
      .map(
        ({ dateKey, range, buckets, rowTotal }) => `
    <tr>
      <td class="c">${formatDate(dateKey)}</td><td class="c">VELAVAN HOSPITAL NEEDS</td>
      <td class="billcol">${range}</td>
      ${cells(buckets.exempt)}${cells(buckets["5"])}${cells(buckets["12"])}${cells(buckets["18"])}${cells(rowTotal)}
    </tr>`,
      )
      .join("");
    const css = `
    body{font-family:Arial,sans-serif;padding:10px;font-size:11px;margin:0}
    .report-title{font-size:13px;font-weight:bold;margin:0 0 2px}.page-info{text-align:right;font-size:11px;margin-bottom:6px}
    table{border-collapse:collapse;width:100%;font-size:10px}th,td{border:1px solid #555;padding:4px 5px}
    th{background:#d9d9d9;font-weight:bold;text-align:center}.r{text-align:right}.c{text-align:center;white-space:nowrap}
    .billcol{white-space:nowrap;min-width:130px}.tot-cell{font-weight:bold;background:#f0f0f0}
    .grand-row td{font-weight:bold;background:#fee2e2}.grand-cell{background:#fee2e2}
    .grp-5{background:#e2efda}.grp-12{background:#dae3f3}.grp-18{background:#fce4d6}.grp-ex{background:#eeeeee}.grp-tot{background:#fff2cc}
  `;
    const body = `
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:6px">
      <div class="report-title">Sales Return Register From ${getDateRangeLabel()}</div>
      <div class="page-info">Page : 1/1</div>
    </div>
    <table>
      <thead>
        <tr><th rowspan="2">RETURN DATE</th><th rowspan="2">NAME</th><th rowspan="2">RETURNS</th>
          <th colspan="4" class="grp-ex">EXEMPTED GST</th><th colspan="4" class="grp-5">RATE OF 5%</th>
          <th colspan="4" class="grp-12">RATE OF 12%</th><th colspan="4" class="grp-18">RATE OF 18%</th>
          <th colspan="4" class="grp-tot">Total</th></tr>
        <tr>
          <th class="grp-ex">AMOUNT</th><th class="grp-ex">SGST</th><th class="grp-ex">CGST</th><th class="grp-ex">TOTAL</th>
          <th class="grp-5">AMOUNT</th><th class="grp-5">SGST</th><th class="grp-5">CGST</th><th class="grp-5">TOTAL</th>
          <th class="grp-12">AMOUNT</th><th class="grp-12">SGST</th><th class="grp-12">CGST</th><th class="grp-12">TOTAL</th>
          <th class="grp-18">AMOUNT</th><th class="grp-18">SGST</th><th class="grp-18">CGST</th><th class="grp-18">TOTAL</th>
          <th class="grp-tot">AMOUNT</th><th class="grp-tot">SGST</th><th class="grp-tot">CGST</th><th class="grp-tot">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr class="grand-row"><td colspan="3" style="text-align:right;padding-right:8px">Grand Total</td>
          ${cells(grand.exempt, true)}${cells(grand["5"], true)}${cells(grand["12"], true)}${cells(grand["18"], true)}${cells(grand.total, true)}
        </tr>
      </tbody>
    </table>`;
    openPrintWindow("Sales Return Register", css, body);
  };

  const exportSalesReturnRegisterExcel = async () => {
    const XLSX = require("xlsx");
    const returns = await fetchReturnsForRegister();
    const { rows, grand } = buildReturnRegisterData(returns);
    const f = (n) => (n === 0 ? "" : parseFloat(n.toFixed(2)));
    const fG = (n) => parseFloat(n.toFixed(2));

    const dataRows = rows.map(({ dateKey, range, buckets, rowTotal }) => [
      formatDate(dateKey),
      "VELAVAN HOSPITAL NEEDS",
      range,
      f(buckets.exempt.amount),
      f(buckets.exempt.sgst),
      f(buckets.exempt.cgst),
      f(buckets.exempt.total),
      f(buckets["5"].amount),
      f(buckets["5"].sgst),
      f(buckets["5"].cgst),
      f(buckets["5"].total),
      f(buckets["12"].amount),
      f(buckets["12"].sgst),
      f(buckets["12"].cgst),
      f(buckets["12"].total),
      f(buckets["18"].amount),
      f(buckets["18"].sgst),
      f(buckets["18"].cgst),
      f(buckets["18"].total),
      f(rowTotal.amount),
      f(rowTotal.sgst),
      f(rowTotal.cgst),
      f(rowTotal.total),
    ]);
    const grandRow = [
      "Grand Total",
      "",
      "",
      fG(grand.exempt.amount),
      fG(grand.exempt.sgst),
      fG(grand.exempt.cgst),
      fG(grand.exempt.total),
      fG(grand["5"].amount),
      fG(grand["5"].sgst),
      fG(grand["5"].cgst),
      fG(grand["5"].total),
      fG(grand["12"].amount),
      fG(grand["12"].sgst),
      fG(grand["12"].cgst),
      fG(grand["12"].total),
      fG(grand["18"].amount),
      fG(grand["18"].sgst),
      fG(grand["18"].cgst),
      fG(grand["18"].total),
      fG(grand.total.amount),
      fG(grand.total.sgst),
      fG(grand.total.cgst),
      fG(grand.total.total),
    ];
    const titleRow = [`Sales Return Register - ${getDateRangeLabel()}`];
    const groupRow = [
      "RETURN DATE",
      "NAME",
      "RETURNS",
      "EXEMPTED GST",
      "",
      "",
      "",
      "RATE OF 5%",
      "",
      "",
      "",
      "RATE OF 12%",
      "",
      "",
      "",
      "RATE OF 18%",
      "",
      "",
      "",
      "Total",
      "",
      "",
      "",
    ];
    const subRow = [
      "",
      "",
      "",
      "AMOUNT",
      "SGST",
      "CGST",
      "TOTAL",
      "AMOUNT",
      "SGST",
      "CGST",
      "TOTAL",
      "AMOUNT",
      "SGST",
      "CGST",
      "TOTAL",
      "AMOUNT",
      "SGST",
      "CGST",
      "TOTAL",
      "AMOUNT",
      "SGST",
      "CGST",
      "TOTAL",
    ];
    const wsData = [titleRow, [], groupRow, subRow, ...dataRows, grandRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 22 } },
      { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } },
      { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } },
      { s: { r: 2, c: 2 }, e: { r: 3, c: 2 } },
      { s: { r: 2, c: 3 }, e: { r: 2, c: 6 } },
      { s: { r: 2, c: 7 }, e: { r: 2, c: 10 } },
      { s: { r: 2, c: 11 }, e: { r: 2, c: 14 } },
      { s: { r: 2, c: 15 }, e: { r: 2, c: 18 } },
      { s: { r: 2, c: 19 }, e: { r: 2, c: 22 } },
    ];
    ws["!cols"] = [
      { wch: 13 },
      { wch: 24 },
      { wch: 28 },
      ...Array(20).fill({ wch: 14 }),
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Return Register");
    XLSX.writeFile(
      wb,
      `SalesReturnRegister_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // ── GSTR1 B2B — one row per invoice per GST rate slab, matching the
  // standard GSTR-1 B2B invoice-wise offline-tool layout:
  // Invoice No. | Customer Name | GSTIN | Invoice Date | Invoice Value |
  // Tax Rate(%) | Taxable value | IGST | Central Tax | State Tax | Cess |
  // State of supply | Reverse Charge
  // Split logic mirrors the Tax Register bucketing, but grouped per bill
  // (invoice) rather than per day, since GSTR1 B2B is invoice-wise. ──
  const buildGSTR1B2BData = () => {
    const getBucketKey = (rate) => {
      const r = parseFloat(rate || 0);
      if (r === 0) return "0";
      if (r <= 6) return "5";
      if (r <= 13) return "12";
      return "18";
    };
    const rows = [];
    filteredBills.forEach((b) => {
      const items = b.items || [];
      if (items.length === 0) return;
      const buckets = {};
      items.forEach((item) => {
        const rate =
          item.sellingTax !== undefined && item.sellingTax !== null
            ? item.sellingTax
            : parseFloat(item.sellingCgstPercent || 0) +
              parseFloat(item.sellingsgstPercent || 0);
        const key = getBucketKey(rate);
        if (!buckets[key]) buckets[key] = { amount: 0, cgst: 0, sgst: 0 };
        buckets[key].amount += parseFloat(item.sellingCostBeforeGst || 0);
        buckets[key].cgst += parseFloat(item.sellingCgstAmt || 0);
        buckets[key].sgst += parseFloat(item.sellingSgstAmt || 0);
      });

      const stateOfSupply = b.customer_state || "Tamil Nadu";
      const isInterState = stateOfSupply.toLowerCase() !== "tamil nadu";
      const invoiceValue = parseFloat(
        b.net_total_amount ?? b.total_amount ?? 0,
      );

      Object.keys(buckets).forEach((key) => {
        const bucket = buckets[key];
        rows.push({
          invoiceNo: b.bill_number,
          invoiceDateRaw: b.bill_date,
          customerName: b.customer_company || b.customer_name || "N/A",
          gstin: b.customer_gstin || "",
          invoiceDate: formatDate(b.bill_date),
          invoiceValue,
          taxRate: parseFloat(key),
          taxableValue: bucket.amount,
          igst: isInterState ? bucket.cgst + bucket.sgst : 0,
          centralTax: isInterState ? 0 : bucket.cgst,
          stateTax: isInterState ? 0 : bucket.sgst,
          cess: 0,
          stateOfSupply,
          reverseCharge: b.reverse_charge || "N",
        });
      });
    });

    rows.sort(
      (a, b) =>
        new Date(a.invoiceDateRaw) - new Date(b.invoiceDateRaw) ||
        (a.invoiceNo || "").localeCompare(b.invoiceNo || ""),
    );

    const uniqueInvoiceTotal = Array.from(
      new Map(rows.map((r) => [r.invoiceNo, r.invoiceValue])).values(),
    ).reduce((s, v) => s + v, 0);

    const grand = rows.reduce(
      (acc, r) => ({
        taxableValue: acc.taxableValue + r.taxableValue,
        igst: acc.igst + r.igst,
        centralTax: acc.centralTax + r.centralTax,
        stateTax: acc.stateTax + r.stateTax,
        cess: acc.cess + r.cess,
      }),
      { taxableValue: 0, igst: 0, centralTax: 0, stateTax: 0, cess: 0 },
    );
    grand.invoiceValue = uniqueInvoiceTotal;

    return { rows, grand };
  };

  const handleGSTR1B2BPrint = () => {
    const { rows, grand } = buildGSTR1B2BData();
    const fmt = (n) =>
      parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

    const tableRows = rows
      .map(
        (r) => `
      <tr>
        <td class="c">${r.invoiceNo}</td>
        <td class="l">${r.customerName}</td>
        <td class="c">${r.gstin}</td>
        <td class="c">${r.invoiceDate}</td>
        <td class="r">${fmt(r.invoiceValue)}</td>
        <td class="c">${r.taxRate}</td>
        <td class="r">${fmt(r.taxableValue)}</td>
        <td class="r">${r.igst > 0 ? fmt(r.igst) : ""}</td>
        <td class="r">${r.centralTax > 0 ? fmt(r.centralTax) : ""}</td>
        <td class="r">${r.stateTax > 0 ? fmt(r.stateTax) : ""}</td>
        <td class="r">${r.cess > 0 ? fmt(r.cess) : ""}</td>
        <td class="c">${r.stateOfSupply}</td>
        <td class="c">${r.reverseCharge}</td>
      </tr>`,
      )
      .join("");

    const css = `
      body{font-family:Arial,sans-serif;padding:10px;font-size:11px;margin:0}
      .report-title{font-size:13px;font-weight:bold;margin:0 0 6px}
      table{border-collapse:collapse;width:100%;font-size:10px}
      th,td{border:1px solid #555;padding:4px 6px}
      th{background:#d9d9d9;font-weight:bold;text-align:center}
      .r{text-align:right}.c{text-align:center;white-space:nowrap}.l{text-align:left}
      .grand-row td{font-weight:bold;background:#d9ead3}
    `;
    const body = `
      <div class="report-title">GSTR1 - B2B Invoices From ${getDateRangeLabel()}</div>
      <table>
        <thead>
          <tr>
            <th>Invoice No.</th><th>Customer Name</th><th>GSTIN</th><th>Invoice Date</th>
            <th>Invoice Value</th><th>Tax Rate(%)</th><th>Taxable value</th>
            <th>IGST</th><th>Central Tax</th><th>State Tax</th><th>Cess</th>
            <th>State of supply</th><th>Reverse Charge</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr class="grand-row">
            <td colspan="4" style="text-align:right">Grand Total</td>
            <td class="r">${fmt(grand.invoiceValue)}</td>
            <td></td>
            <td class="r">${fmt(grand.taxableValue)}</td>
            <td class="r">${fmt(grand.igst)}</td>
            <td class="r">${fmt(grand.centralTax)}</td>
            <td class="r">${fmt(grand.stateTax)}</td>
            <td class="r">${fmt(grand.cess)}</td>
            <td colspan="2"></td>
          </tr>
        </tbody>
      </table>`;
    openPrintWindow("GSTR1_B2B", css, body);
  };

  const exportGSTR1B2BExcel = () => {
    const XLSX = require("xlsx");
    const { rows, grand } = buildGSTR1B2BData();
    const f = (n) => parseFloat((n || 0).toFixed(2));

    const header = [
      "Invoice No.",
      "Customer Name",
      "GSTIN",
      "Invoice Date",
      "Invoice Value",
      "Tax Rate(%)",
      "Taxable value",
      "IGST",
      "Central Tax",
      "State Tax",
      "Cess",
      "State of supply",
      "Reverse Charge",
    ];
    const dataRows = rows.map((r) => [
      r.invoiceNo,
      r.customerName,
      r.gstin,
      r.invoiceDate,
      f(r.invoiceValue),
      r.taxRate,
      f(r.taxableValue),
      r.igst > 0 ? f(r.igst) : "",
      r.centralTax > 0 ? f(r.centralTax) : "",
      r.stateTax > 0 ? f(r.stateTax) : "",
      r.cess > 0 ? f(r.cess) : "",
      r.stateOfSupply,
      r.reverseCharge,
    ]);
    const grandRow = [
      "Grand Total",
      "",
      "",
      "",
      f(grand.invoiceValue),
      "",
      f(grand.taxableValue),
      f(grand.igst),
      f(grand.centralTax),
      f(grand.stateTax),
      f(grand.cess),
      "",
      "",
    ];
    const titleRow = [`GSTR1_B2B - ${getDateRangeLabel()}`];
    const wsData = [titleRow, [], header, ...dataRows, grandRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }];
    ws["!cols"] = [
      { wch: 16 },
      { wch: 26 },
      { wch: 18 },
      { wch: 12 },
      { wch: 14 },
      { wch: 11 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 14 },
      { wch: 14 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GSTR1_B2B");
    XLSX.writeFile(
      wb,
      `GSTR1_B2B_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const openReturnModal = (bill) => {
    setReturnModalBill(bill);
    setReturnLines(
      (bill.items || []).map((it) => ({
        lineId: it.stock_id,
        stock_id: it.stock_id,
        item_id: it.item_id,
        name: it.name,
        hsn: it.hsn,
        batch_no: it.batch_no,
        expiry: it.expiry,
        maxQuantity: parseFloat(it.quantity) || 0,
        quantity: 0,
        sellingCgstPercent: it.sellingCgstPercent,
        sellingsgstPercent: it.sellingsgstPercent,
        unitSellingCost: it.unitSellingCost,
      })),
    );
  };

  const handleReturnQtyChange = (lineId, value) => {
    setReturnLines((prev) =>
      prev.map((l) => {
        if (l.lineId !== lineId) return l;
        let q = parseFloat(value) || 0;
        if (q < 0) q = 0;
        if (q > l.maxQuantity) q = l.maxQuantity;
        return { ...l, quantity: q };
      }),
    );
  };

  const computeReturnLine = (line) => {
    const unitSellingCost = parseFloat(line.unitSellingCost) || 0;
    const cgstP = parseFloat(line.sellingCgstPercent) || 0;
    const sgstP = parseFloat(line.sellingsgstPercent) || 0;
    const gstRate = cgstP + sgstP;
    const qty = parseFloat(line.quantity) || 0;
    const lineTotal = unitSellingCost * qty;
    const lineBeforeGst =
      gstRate > 0 ? lineTotal / (1 + gstRate / 100) : lineTotal;
    return {
      lineBeforeGst: lineBeforeGst.toFixed(2),
      lineCgst: (lineBeforeGst * (cgstP / 100)).toFixed(2),
      lineSgst: (lineBeforeGst * (sgstP / 100)).toFixed(2),
      lineTotal: lineTotal.toFixed(2),
    };
  };

  const submitReturn = async () => {
    const toReturn = returnLines.filter((l) => l.quantity > 0);
    if (toReturn.length === 0) {
      toast.error("Select at least one item with quantity > 0");
      return;
    }
    const computed = toReturn.map((l) => ({
      ...l,
      calc: computeReturnLine(l),
    }));

    const rawTotals = computed.reduce(
      (s, l) => ({
        taxableAmount: s.taxableAmount + parseFloat(l.calc.lineBeforeGst),
        cgst: s.cgst + parseFloat(l.calc.lineCgst),
        sgst: s.sgst + parseFloat(l.calc.lineSgst),
        totalAmount: s.totalAmount + parseFloat(l.calc.lineTotal),
      }),
      { taxableAmount: 0, cgst: 0, sgst: 0, totalAmount: 0 },
    );

    // ── Round-off, same logic used in Sales Billing ──
    const decimal = rawTotals.totalAmount - Math.floor(rawTotals.totalAmount);
    const roundAmount = decimal >= 0.5 ? 1 - decimal : -decimal;
    const summary = {
      ...rawTotals,
      roundAmount,
      totalAmount: rawTotals.totalAmount + roundAmount,
    };

    const payload = {
      bill_number: returnModalBill.bill_number,
      items: computed.map((l) => ({
        stock_id: l.stock_id,
        item_id: l.item_id,
        hsn: l.hsn,
        batch_no: l.batch_no,
        expiry: l.expiry,
        quantity: l.quantity,
        sellingCgstPercent: l.sellingCgstPercent,
        sellingCgstAmt: l.calc.lineCgst,
        sellingsgstPercent: l.sellingsgstPercent,
        sellingSgstAmt: l.calc.lineSgst,
        unitSellingCost: l.unitSellingCost,
        sellingCostBeforeGst: l.calc.lineBeforeGst,
        sellingCost: l.calc.lineTotal,
      })),
      summary,
      "auth-user-id": localStorage.getItem("employeeId"),
    };

    setReturnLoading(true);
    try {
      const r = await apiRequest(
        `${HMSURL}velavan/sales-return/`,
        "POST",
        payload,
      );
      if (r.success) {
        toast.success(`Return ${r.data?.return_number} created`);
        setReturnModalBill(null);
        fetchBills(filters.from_date, filters.to_date);
      } else {
        toast.error(r.error || "Failed to create return");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <Container>
      <ToastContainer position="top-right" autoClose={1000} />
      <div style={pageHeader}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
          Velavan Sales Report
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          {canReturn && (
            <Button onClick={() => navigate("/SalesBilling")}>
              <PlusCircle size={14} /> New Sale
            </Button>
          )}
          <Button secondary onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Back
          </Button>
        </div>
      </div>

      <div style={filtersBar}>
        <div style={filterGroup}>
          <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
            From Date
          </label>
          <Input
            type="date"
            value={filters.from_date}
            onChange={(e) =>
              setFilters((p) => ({ ...p, from_date: e.target.value }))
            }
          />
        </div>
        <div style={filterGroup}>
          <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>
            To Date
          </label>
          <Input
            type="date"
            value={filters.to_date}
            onChange={(e) =>
              setFilters((p) => ({ ...p, to_date: e.target.value }))
            }
          />
        </div>
        <Button
          onClick={() => fetchBills(filters.from_date, filters.to_date)}
          style={{ alignSelf: "flex-end" }}
        >
          <Search size={13} /> Search
        </Button>
        <div style={{ ...filterGroup, minWidth: 300 }}>
          <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Search</label>
          <Input
            placeholder="Bill No, GRN, Customer, Patient, Surgeon, IP..."
            value={filters.search}
            onChange={(e) =>
              setFilters((p) => ({ ...p, search: e.target.value }))
            }
          />
        </div>
        <Button
          secondary
          onClick={() => {
            setFilters({ from_date: "", to_date: "", search: "" });
            fetchBills("", "");
          }}
          style={{ alignSelf: "flex-end" }}
        >
          Clear
        </Button>
      </div>

      <div style={actionsBar}>
        <span style={{ fontSize: "0.82rem", color: colors.textMuted }}>
          {filteredBills.length === 0
            ? "No bills found"
            : `Showing ${filteredBills.length} bills`}
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {canSalP && (
            <div ref={reportDropdownRef} style={dropdownWrap}>
              <Button
                success
                onClick={() => {
                  setShowReportDropdown((v) => !v);
                  setShowExportDropdown(false);
                }}
                style={{
                  background: "#7c3aed",
                  borderColor: "#7c3aed",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Printer size={14} /> Report{" "}
                <span style={{ fontSize: "0.7rem" }}>▾</span>
              </Button>
              {showReportDropdown && (
                <div style={dropdownMenu}>
                  <button
                    style={dropdownItem}
                    onClick={() => {
                      handleSalesReportPrint();
                      setShowReportDropdown(false);
                    }}
                  >
                    <Printer size={14} color="#7c3aed" /> Sales Report
                  </button>
                  <button
                    style={dropdownItem}
                    onClick={() => {
                      handleSalesTaxRegisterPrint();
                      setShowReportDropdown(false);
                    }}
                  >
                    <Printer size={14} color="#0891b2" /> Sales Tax Register
                  </button>
                  <button
                    style={dropdownItem}
                    onClick={() => {
                      handleSalesReturnRegisterPrint();
                      setShowReportDropdown(false);
                    }}
                  >
                    <RotateCcw size={14} color="#dc2626" /> Sales Return
                    Register
                  </button>
                  <button
                    style={dropdownItemLast}
                    onClick={() => {
                      handleGSTR1B2BPrint();
                      setShowReportDropdown(false);
                    }}
                  >
                    <Printer size={14} color="#b45309" /> GSTR1_B2B
                  </button>
                </div>
              )}
            </div>
          )}

          {canSalP && (
            <div ref={exportDropdownRef} style={dropdownWrap}>
              <Button
                success
                onClick={() => {
                  setShowExportDropdown((v) => !v);
                  setShowReportDropdown(false);
                }}
                style={{
                  background: "#16a34a",
                  borderColor: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Download size={14} /> Export{" "}
                <span style={{ fontSize: "0.7rem" }}>▾</span>
              </Button>
              {showExportDropdown && (
                <div style={dropdownMenu}>
                  <button
                    style={dropdownItem}
                    onClick={() => {
                      exportSalesReportExcel();
                      setShowExportDropdown(false);
                    }}
                  >
                    <Download size={14} color="#7c3aed" /> Sales Report
                  </button>
                  <button
                    style={dropdownItem}
                    onClick={() => {
                      exportSalesTaxRegisterExcel();
                      setShowExportDropdown(false);
                    }}
                  >
                    <Download size={14} color="#0891b2" /> Sales Tax Register
                  </button>
                  <button
                    style={dropdownItem}
                    onClick={() => {
                      exportSalesReturnRegisterExcel();
                      setShowExportDropdown(false);
                    }}
                  >
                    <Download size={14} color="#dc2626" /> Sales Return Register
                  </button>
                  <button
                    style={dropdownItemLast}
                    onClick={() => {
                      exportGSTR1B2BExcel();
                      setShowExportDropdown(false);
                    }}
                  >
                    <Download size={14} color="#b45309" /> GSTR1_B2B
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <TableWrapper
        style={{
          marginTop: 0,
          borderRadius: 0,
          border: "none",
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Table>
          <thead>
            <Tr>
              {[
                "Bill No",
                "Bill Date",
                "Source GRN",
                "Customer",
                "Patient",
                "Surgeon",
                "IP Number",
                "Total Amount",
                "Return Amt",
                "Net Amount",
                "Actions",
              ].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </Tr>
          </thead>
          <tbody>
            {loading ? (
              <Tr>
                <Td colSpan="8" style={{ textAlign: "center", padding: 30 }}>
                  Loading…
                </Td>
              </Tr>
            ) : filteredBills.length === 0 ? (
              <Tr>
                <Td colSpan="8" style={{ textAlign: "center", padding: 30 }}>
                  No records found
                </Td>
              </Tr>
            ) : (
              filteredBills.map((b) => (
                <Tr key={b.bill_number}>
                  <Td style={{ fontWeight: 600 }}>{b.bill_number}</Td>
                  <Td>{formatDate(b.bill_date)}</Td>
                  <Td>{b.source_grn_number || "—"}</Td>
                  <Td>{b.customer_company_name || b.customer_name || "—"}</Td>
                  <Td>{b.patient_name || "—"}</Td>
                  <Td>{b.surgeon_name || b.surgeon_id || "—"}</Td>
                  <Td>{b.ip_number || "—"}</Td>
                  <Td>{formatCurrency(b.total_amount)}</Td>
                  <Td
                    style={{
                      color:
                        b.sales_return_amount > 0
                          ? "#dc2626"
                          : colors.textMuted,
                    }}
                  >
                    {b.sales_return_amount > 0
                      ? `- ${formatCurrency(b.sales_return_amount)}`
                      : "—"}
                  </Td>
                  <Td style={{ fontWeight: 700 }}>
                    {formatCurrency(b.net_total_amount)}
                  </Td>
                  <Td>
                    {(() => {
                      const netAmount = parseFloat(b.net_total_amount || 0);
                      const hasBalance = netAmount > 0;
                      const canReturnNow =
                        hasBalance && isWithinReturnWindow(b.bill_date);

                      const printTitle = !hasBalance
                        ? "Nothing to print — net amount is ₹0"
                        : "Print";

                      const returnTitle = !hasBalance
                        ? "Nothing to return — net amount is already ₹0"
                        : isWithinReturnWindow(b.bill_date)
                          ? "Sales Return"
                          : "Time exceeded for sales return";

                      return (
                        <>
                          {canVP && (
                            <button
                              style={{
                                ...actionBtn,
                                opacity: hasBalance ? 1 : 0.4,
                                cursor: hasBalance ? "pointer" : "not-allowed",
                                color: hasBalance
                                  ? actionBtn.color
                                  : colors.textMuted,
                              }}
                              title={
                                hasBalance
                                  ? "View"
                                  : "Nothing to view — net amount is ₹0"
                              }
                              onClick={() => hasBalance && setSelected(b)}
                              disabled={!hasBalance}
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          {canVP && (
                            <button
                              style={{
                                ...actionBtn,
                                opacity: hasBalance ? 1 : 0.4,
                                cursor: hasBalance ? "pointer" : "not-allowed",
                                color: hasBalance
                                  ? actionBtn.color
                                  : colors.textMuted,
                              }}
                              title={printTitle}
                              onClick={() =>
                                hasBalance && handleVelavanPrint(b)
                              }
                              disabled={!hasBalance}
                            >
                              <Printer size={14} />
                            </button>
                          )}
                          {canReturn && (
                            <button
                              style={{
                                ...actionBtn,
                                color: canReturnNow
                                  ? "#dc2626"
                                  : colors.textMuted,
                                borderColor: canReturnNow
                                  ? "#dc2626"
                                  : colors.border,
                                opacity: canReturnNow ? 1 : 0.4,
                                cursor: canReturnNow
                                  ? "pointer"
                                  : "not-allowed",
                              }}
                              title={returnTitle}
                              onClick={() => canReturnNow && openReturnModal(b)}
                              disabled={!canReturnNow}
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </TableWrapper>

      {selected && (
        <ModalOverlay onClick={() => setSelected(null)}>
          <ModalContainer
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 900 }}
          >
            <ModalHeader>
              <ModalTitle>Bill — {selected.bill_number}</ModalTitle>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </ModalHeader>
            <ModalBody>
              <TableWrapper>
                <Table>
                  <thead>
                    <Tr>
                      {[
                        "Item",
                        "HSN",
                        "Batch",
                        "Expiry",
                        "Qty",
                        "Unit Cost",
                        "Total",
                      ].map((h) => (
                        <Th key={h}>{h}</Th>
                      ))}
                    </Tr>
                  </thead>
                  <tbody>
                    {(selected.items || []).map((it, i) => (
                      <Tr key={i}>
                        <Td>{it.name}</Td>
                        <Td>{it.hsn}</Td>
                        <Td>{it.batch_no}</Td>
                        <Td>{it.expiry}</Td>
                        <Td>{it.quantity}</Td>
                        <Td>{formatCurrency(it.unitSellingCost)}</Td>
                        <Td>{formatCurrency(it.sellingCost)}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}
      {returnModalBill && (
        <ModalOverlay onClick={() => setReturnModalBill(null)}>
          <ModalContainer
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 900 }}
          >
            <ModalHeader>
              <ModalTitle>
                Sales Return — {returnModalBill.bill_number}
              </ModalTitle>
              <button
                onClick={() => setReturnModalBill(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </ModalHeader>
            <ModalBody>
              <TableWrapper>
                <Table>
                  <thead>
                    <Tr>
                      {[
                        "Item",
                        "HSN",
                        "Batch",
                        "Expiry",
                        "Billed Qty",
                        "Return Qty",
                        "Unit Cost",
                      ].map((h) => (
                        <Th key={h}>{h}</Th>
                      ))}
                    </Tr>
                  </thead>
                  <tbody>
                    {returnLines.map((l) => (
                      <Tr key={l.lineId}>
                        <Td style={{ fontWeight: 600 }}>{l.name}</Td>
                        <Td>{l.hsn}</Td>
                        <Td>{l.batch_no}</Td>
                        <Td>{l.expiry}</Td>
                        <Td>{l.maxQuantity}</Td>
                        <Td>
                          <Input
                            type="number"
                            min="0"
                            max={l.maxQuantity}
                            value={l.quantity}
                            onChange={(e) =>
                              handleReturnQtyChange(l.lineId, e.target.value)
                            }
                            style={{ width: 90 }}
                          />
                        </Td>
                        <Td>
                          ₹{parseFloat(l.unitSellingCost || 0).toFixed(2)}
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 16,
                }}
              >
                <Button secondary onClick={() => setReturnModalBill(null)}>
                  Cancel
                </Button>
                <Button onClick={submitReturn} disabled={returnLoading}>
                  {returnLoading ? "Processing…" : "Confirm Return"}
                </Button>
              </div>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default SalesReport;
