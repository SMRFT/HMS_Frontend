import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Search,
  Printer,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  X,
  History,
  ArrowLeft,
  CheckCircle, // ← add CheckCircle
  ShoppingCart,
  RotateCcw,
} from "lucide-react";

import {
  Container,
  InputWrapper,
  Label,
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
  ButtonContainer,
  colors,
} from "../GlobalStyles";

import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const parseItems = (items) => {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const formatDate = (date) => {
  if (!date || new Date(date).toString() === "Invalid Date") return "N/A";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatDateTime = (dateStr) => {
  if (!dateStr || isNaN(new Date(dateStr))) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value) =>
  `₹${parseFloat(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

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
  const convert = (n) => {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100) return tens[Math.floor(n / 10)] + " " + ones[n % 10] + " ";
    if (n < 1000)
      return ones[Math.floor(n / 100)] + " Hundred " + convert(n % 100);
    if (n < 100000)
      return convert(Math.floor(n / 1000)) + "Thousand " + convert(n % 1000);
    if (n < 10000000)
      return convert(Math.floor(n / 100000)) + "Lakh " + convert(n % 100000);
    return convert(Math.floor(n / 10000000)) + "Crore " + convert(n % 10000000);
  };
  const amount = parseFloat(num || 0);
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let result = convert(rupees).trim() + " Rupees";
  if (paise > 0) result += " and " + convert(paise).trim() + " Paise";
  return result + " Only";
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared orientation toolbar
// ─────────────────────────────────────────────────────────────────────────────
const ORIENTATION_TOOLBAR = `
<div class="no-print" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;
  margin-bottom:14px;padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px">
  <span style="font-size:12px;font-weight:600;color:#555;margin-right:2px">Orientation:</span>
  <button id="btn-portrait" onclick="setOrientation('portrait')"
    style="padding:5px 14px;font-size:12px;font-weight:700;
           border:2px solid #0ea5e9;border-radius:5px;
           background:#e0f2fe;color:#1e40af;cursor:pointer">
    Portrait
  </button>
  <button id="btn-landscape" onclick="setOrientation('landscape')"
    style="padding:5px 14px;font-size:12px;font-weight:700;
           border:2px solid #cbd5e1;border-radius:5px;
           background:#fff;color:#64748b;cursor:pointer">
    Landscape
  </button>
  <button onclick="window.print()"
    style="padding:5px 18px;font-size:12px;font-weight:700;border:none;
           border-radius:5px;background:#0ea5e9;color:#fff;cursor:pointer;margin-left:8px">
    🖨 Print
  </button>
</div>
<script>
  function setOrientation(mode) {
    document.getElementById('orientation-style').textContent =
      '@page { size: ' + mode + '; }';
    var isP = mode === 'portrait';
    var pb = document.getElementById('btn-portrait');
    var lb = document.getElementById('btn-landscape');
    pb.style.background  = isP  ? '#e0f2fe' : '#fff';
    pb.style.borderColor = isP  ? '#0ea5e9' : '#cbd5e1';
    pb.style.color       = isP  ? '#1e40af' : '#64748b';
    lb.style.background  = !isP ? '#e0f2fe' : '#fff';
    lb.style.borderColor = !isP ? '#0ea5e9' : '#cbd5e1';
    lb.style.color       = !isP ? '#1e40af' : '#64748b';
  }
<\/script>`;

const PRINT_BASE_CSS = `
  @media print { .no-print { display:none !important } body { margin:0 } }
  @page { size: portrait; margin: 10mm }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Inline style helpers
// ─────────────────────────────────────────────────────────────────────────────
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
  transition: "all 0.15s",
};
const detailGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: 12,
  marginTop: 8,
};
const detailItem = {
  background: "#f8fafc",
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  padding: "8px 12px",
};
const detailLabel = {
  fontSize: "0.72rem",
  color: colors.textMuted,
  fontWeight: 600,
  marginBottom: 3,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: 0.4,
};
const detailValue = {
  fontSize: "0.85rem",
  color: colors.textMain,
  fontWeight: 500,
};
const sectionTitle = {
  fontSize: "0.88rem",
  fontWeight: 700,
  color: colors.primary,
  margin: "18px 0 6px",
  paddingBottom: 6,
  borderBottom: `2px solid ${colors.border}`,
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
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 16px",
  background: "#fff",
  borderBottom: `1px solid ${colors.border}`,
};
const paginationBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 16px",
  background: "#fff",
  borderTop: `1px solid ${colors.border}`,
  borderRadius: "0 0 8px 8px",
};
const loadingBox = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 60,
  gap: 14,
};
const spinnerStyle = {
  width: 32,
  height: 32,
  border: "3px solid #e2e8f0",
  borderTop: `3px solid ${colors.primary}`,
  borderRadius: "50%",
  animation: "velavan-spin 0.8s linear infinite",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const InvoiceReport = () => {
  const today = new Date().toISOString().split("T")[0];

  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from_date: today,
    to_date: today,
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [returnModalRecord, setReturnModalRecord] = useState(null);
  const [returnLines, setReturnLines] = useState([]);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnLinesLoading, setReturnLinesLoading] = useState(false);
  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]",
  );
  const canPurReturn = allowedActions.includes("HMS-P-VIN-RW");
  const canView = allowedActions.includes("HMS-P-VEV");
  const canPurP = allowedActions.includes("HMS-P-VPP");
  const canSalBil = allowedActions.includes("HMS-P-VS-RW");
  const canEdit = allowedActions.includes("HMS-P-VINE-RW");
  const canApprove = allowedActions.includes("HMS-P-VINA-RW");

  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    const id = "velavan-spin-style";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `@keyframes velavan-spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }
  }, []);

  // ── History ──────────────────────────────────────────────────────
  const fetchPreviousPurchases = async (itemId, hsn, itemName) => {
    setHistoryLoading(true);
    try {
      const url = `${HMSURL}velavan/previous-purchases/?item_id=${encodeURIComponent(itemId || "")}&hsn=${encodeURIComponent(hsn || "")}&item_name=${encodeURIComponent(itemName || "")}`;
      const result = await apiRequest(url, "GET");
      if (!result.success) return [];
      return result.data?.status === "success" ? result.data.data || [] : [];
    } catch {
      return [];
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleShowHistory = async (item) => {
    const itemId = item?.item_id;
    const hsn = String(item?.hsn ?? "").trim();
    const itemName = String(item?.name ?? "").trim();
    if (!itemId && !(hsn && itemName)) {
      toast.error("Item ID or HSN + item name is required");
      return;
    }
    setSelectedItemForHistory({ hsn, name: itemName, item_id: itemId });
    setShowHistoryModal(true);
    setHistoryData(await fetchPreviousPurchases(itemId, hsn, itemName));
  };

  // ── Fetch ────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (fromDate, toDate) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: 1, page_size: 1000 });
        if (fromDate) params.append("from_date", fromDate);
        if (toDate) params.append("to_date", toDate);

        const response = await apiRequest(
          `${HMSURL}velavan/invoices/list/?${params.toString()}`,
          "GET",
        );
        if (!response.success)
          throw new Error(response.error || "API request failed");
        if (response.data?.status !== "success")
          throw new Error(response.data?.message || "Backend error");
        if (!Array.isArray(response.data?.data))
          throw new Error("Invalid data format");

        // Normalize items field to always be an array
        const data = response.data.data.map((record) => ({
          ...record,
          items: parseItems(record.items),
        }));

        const sorted = [...data].sort(
          (a, b) => new Date(b.invoice_date) - new Date(a.invoice_date),
        );
        setAllData(sorted);
        setFilteredData(sorted);
        if (data.length === 0)
          toast.info("No records found for the selected date range");
      } catch (err) {
        toast.error(err.message || "Failed to fetch records");
        setAllData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    },
    [HMSURL],
  );

  useEffect(() => {
    fetchData(today, today);
  }, [fetchData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Client-side search ───────────────────────────────────────────
  const applySearch = useCallback(() => {
    if (!filters.search.trim()) {
      setFilteredData(allData);
      setCurrentPage(1);
      return;
    }
    const s = filters.search.toLowerCase().trim();
    setFilteredData(
      [
        ...allData.filter(
          (item) =>
            item.grn_number?.toLowerCase().includes(s) ||
            item.invoice_no?.toLowerCase().includes(s) ||
            item.vendor?.toLowerCase().includes(s) ||
            item.vendor_id?.toLowerCase().includes(s) ||
            item.patient_name?.toLowerCase().includes(s) ||
            item.surgeon_name?.toLowerCase().includes(s) ||
            item.surgeon_id?.toLowerCase().includes(s) ||
            item.ip_number?.toLowerCase().includes(s) ||
            parseItems(item.items).some((i) =>
              i.batch_no?.toLowerCase().includes(s),
            ),
        ),
      ].sort((a, b) => new Date(b.invoice_date) - new Date(a.invoice_date)),
    );
    setCurrentPage(1);
  }, [allData, filters.search]);

  useEffect(() => {
    applySearch();
  }, [applySearch]);

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleDateSearch = () => {
    fetchData(filters.from_date, filters.to_date);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ from_date: "", to_date: "", search: "" });
    fetchData("", "");
    setCurrentPage(1);
  };

  // ── CRUD ─────────────────────────────────────────────────────────
  const handleView = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };
  const handleEdit = (record) =>
    navigate("/InvoiceGeneration", { state: { record } });

  const handleApprove = async (record) => {
    if (record.is_approved) return;
    const confirm = window.confirm(
      `Approve GRN ${record.grn_number}?\nThis cannot be undone.`,
    );
    if (!confirm) return;

    try {
      const response = await apiRequest(
        `${HMSURL}velavan/invoices/approve/${encodeURIComponent(record.grn_number)}/`,
        "PATCH",
      );
      if (!response.success || response.data?.status !== "success") {
        throw new Error(response.data?.message || "Approval failed");
      }
      toast.success(`${record.grn_number} approved successfully`);
      // Refresh local state
      setAllData((prev) =>
        prev.map((r) =>
          r.grn_number === record.grn_number
            ? {
                ...r,
                is_approved: true,
                approved_by: response.data.data?.approved_by,
              }
            : r,
        ),
      );
      setFilteredData((prev) =>
        prev.map((r) =>
          r.grn_number === record.grn_number ? { ...r, is_approved: true } : r,
        ),
      );
    } catch (err) {
      toast.error(err.message || "Approval failed");
    }
  };

  const openPurchaseReturnModal = async (record) => {
    setReturnModalRecord(record);
    setReturnLines([]);
    setReturnLinesLoading(true);
    try {
      const url = `${HMSURL}velavan/stock/by-grn/?grn_number=${encodeURIComponent(record.grn_number)}`;
      const result = await apiRequest(url, "GET");
      const stockRows =
        result.success && result.data?.status === "success"
          ? result.data.data || []
          : [];

      const invoiceItems = parseItems(record.items);

      const lines = stockRows.map((s) => {
        // pricing fields (cgstPercent, unitCostWithGst, etc.) live on the
        // invoice item, not on the stock doc — match by item_id + batch_no
        const match =
          invoiceItems.find(
            (it) =>
              String(it.item_id) === String(s.item_id) &&
              it.batch_no === s.batch_no,
          ) || {};
        return {
          lineId: `${s.item_id}-${s.batch_no}`,
          item_id: s.item_id,
          name: s.itemName || match.name,
          hsn: s.hsn || match.hsn,
          batch_no: s.batch_no,
          expiry: s.expiry,
          maxQuantity: parseFloat(s.available_quantity) || 0,
          quantity: 0,
          cgstPercent: match.cgstPercent,
          sgstPercent: match.sgstPercent,
          unitCostWithGst: match.unitCostWithGst,
        };
      });

      if (lines.length === 0) {
        toast.info("No returnable stock available for this GRN");
      }
      setReturnLines(lines);
    } catch {
      toast.error("Failed to load available stock for this GRN");
    } finally {
      setReturnLinesLoading(false);
    }
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

  const computePurchaseReturnLine = (line) => {
    const unitCostWithGst = parseFloat(line.unitCostWithGst) || 0;
    const cgstP = parseFloat(line.cgstPercent) || 0;
    const sgstP = parseFloat(line.sgstPercent) || 0;
    const gstRate = cgstP + sgstP;
    const qty = parseFloat(line.quantity) || 0;
    const lineTotal = unitCostWithGst * qty;
    const lineBeforeGst =
      gstRate > 0 ? lineTotal / (1 + gstRate / 100) : lineTotal;
    return {
      lineBeforeGst: lineBeforeGst.toFixed(2),
      lineCgst: (lineBeforeGst * (cgstP / 100)).toFixed(2),
      lineSgst: (lineBeforeGst * (sgstP / 100)).toFixed(2),
      lineTotal: lineTotal.toFixed(2),
    };
  };

  const submitPurchaseReturn = async () => {
    const toReturn = returnLines.filter((l) => l.quantity > 0);
    if (toReturn.length === 0) {
      toast.error("Select at least one item with quantity > 0");
      return;
    }
    const computed = toReturn.map((l) => ({
      ...l,
      calc: computePurchaseReturnLine(l),
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

    const decimal = rawTotals.totalAmount - Math.floor(rawTotals.totalAmount);
    const roundAmount = decimal >= 0.5 ? 1 - decimal : -decimal;
    const summary = {
      ...rawTotals,
      roundAmount,
      totalAmount: rawTotals.totalAmount + roundAmount,
    };

    const payload = {
      grn_number: returnModalRecord.grn_number,
      items: computed.map((l) => ({
        item_id: l.item_id,
        hsn: l.hsn,
        batch_no: l.batch_no,
        expiry: l.expiry,
        quantity: l.quantity,
        cgstPercent: l.cgstPercent,
        cgstAmt: l.calc.lineCgst,
        sgstPercent: l.sgstPercent,
        sgstAmt: l.calc.lineSgst,
        unitCostWithGst: l.unitCostWithGst,
        taxableAmount: l.calc.lineBeforeGst,
        totalAmount: l.calc.lineTotal,
      })),
      summary,
      "auth-user-id": localStorage.getItem("employeeId"),
    };

    setReturnLoading(true);
    try {
      const r = await apiRequest(
        `${HMSURL}velavan/purchase-return/`,
        "POST",
        payload,
      );
      if (r.success) {
        toast.success(`Return ${r.data?.return_number} created`);
        setReturnModalRecord(null);
        fetchData(filters.from_date, filters.to_date);
      } else {
        toast.error(r.error || "Failed to create purchase return");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setReturnLoading(false);
    }
  };

  // ── Open print window ────────────────────────────────────────────
  const openPrintWindow = (title, css, bodyHtml) => {
    const pw = window.open("", "", "width=1000,height=750");
    pw.document.write(`<!DOCTYPE html><html><head>
      <title>${title}</title>
      <style>${css}${PRINT_BASE_CSS}</style>
      <style id="orientation-style">@page { size: portrait; }</style>
    </head><body>
      ${ORIENTATION_TOOLBAR}
      ${bodyHtml}
    </body></html>`);
    pw.document.close();
  };

  const cleanAddress = (address) => {
    if (!address) return "N/A";
    return (
      address
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part && part.toLowerCase() !== "none")
        .join(", ") || "N/A"
    );
  };

  // ── Date range label helper ──────────────────────────────────────
  const getDateRangeLabel = () => {
    const from = filters.from_date ? formatDate(filters.from_date) : null;
    const to = filters.to_date ? formatDate(filters.to_date) : null;
    if (from && to) return from === to ? from : `${from} to ${to}`;
    if (from) return `From ${from}`;
    if (to) return `To ${to}`;
    return "All Dates";
  };

  // ── GRN Print ────────────────────────────────────────────────────
  const handleGRNPrint = (record) => {
    const items = parseItems(record.items); // ← always an array
    const vendorDisplay = record.vendor || record.vendor_id || "N/A";

    const css = `
      body{font-family:Arial,sans-serif;margin:20px;font-size:12px;line-height:1.4}
      h1{font-size:18px;font-weight:bold;color:#1e40af;text-align:center;margin:0 0 5px}
      .address{text-align:center;font-size:11px;margin:2px 0}
      .doctype{font-size:14px;font-weight:bold;margin:15px 0;padding:8px;
        background:#e0f2fe;border:2px solid #0ea5e9;color:#1e40af;text-align:center}
      .grid{display:grid;grid-template-columns:1fr 1fr 1fr;border:2px solid #0ea5e9;margin-bottom:10px}
      .sec{border-right:1px solid #0ea5e9}.sec:last-child{border-right:none}
      .hdr{background:#e0f2fe;padding:5px 8px;font-weight:bold;border-bottom:1px solid #0ea5e9;text-align:center;color:#1e40af}
      .cnt{padding:8px}.row{margin:3px 0;font-size:11px}
      table{width:100%;border-collapse:collapse;margin:16px 0;font-size:10px;border:2px solid #0ea5e9}
      th,td{border:1px solid #0ea5e9;padding:5px 4px;text-align:center;vertical-align:middle}
      th{background:#e0f2fe;font-weight:bold;color:#1e40af;font-size:9px}
      .r{text-align:right;padding-right:6px}.l{text-align:left;padding-left:6px}
      .tot{background:#f0f9ff;font-weight:bold}
      .col-grp{border-left:2px solid #0ea5e9}
      .summary{display:flex;gap:10px;margin-top:16px}
      .gst{flex:1;border:2px solid #0ea5e9;background:#e0f2fe;padding:12px}
      .gst-row{display:flex;justify-content:space-between;margin:4px 0;font-size:11px;font-weight:bold;color:#1e40af}
      .amts{min-width:260px;border:2px solid #0ea5e9}
      .amt-row{display:flex;justify-content:space-between;border-bottom:1px solid #0ea5e9;font-size:11px;padding:7px 12px;font-weight:bold}
      .amt-row:last-child{border-bottom:none;background:#e0f2fe;color:#1e40af}
      .words{margin:12px 0;padding:10px;background:#e0f2fe;border:2px solid #0ea5e9}
      .footer{display:flex;justify-content:space-between;margin-top:24px;padding-top:16px}
    `;

    const hasPatient =
      record.ip_number ||
      record.patient_name ||
      record.surgeon_name ||
      record.surgeon_id;

    const itemsHtml =
      items.length > 0
        ? `
      <table>
        <thead>
          <tr>
            <th rowspan="2">Sl.</th>
            <th rowspan="2" class="l" style="min-width:120px">Product</th>
            <th rowspan="2">HSN</th>
            <th rowspan="2">Batch No</th>
            <th rowspan="2">Expiry</th>
            <th rowspan="2">Qty</th>
            <th rowspan="2">Unit Price</th><th rowspan="2">MRP</th>
            <th rowspan="2">Discount %</th><th rowspan="2">Disc. Amt</th>
            <th rowspan="2">Non-Taxable Amt</th>
            <th colspan="2" class="col-grp">Purchase Tax (${items[0]?.tax || 0}%)</th>
            <th colspan="2">Selling Tax (${items[0]?.sellingTax || 0}%)</th>
            <th rowspan="2">Unit Cost<br/>(with GST)</th>
            <th rowspan="2" class="col-grp">Purchase<br/>Cost</th>
            <th rowspan="2">Unit Selling<br/>Cost</th>
            <th rowspan="2">Selling<br/>Cost</th>
          </tr>
          <tr>
            <th class="col-grp">CGST ${items[0]?.cgstPercent || 0}%</th>
            <th>SGST ${items[0]?.sgstPercent || 0}%</th>
            <th>CGST ${items[0]?.sellingCgstPercent || 0}%</th>
            <th>SGST ${items[0]?.sellingsgstPercent || 0}%</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map((item, i) => {
              const qty = parseFloat(item.quantity || 0);
              const unitPrice = parseFloat(item.unitPrice || 0);
              const taxableAmt = unitPrice * qty;
              return `<tr>
              <td>${i + 1}</td>
              <td class="l">${item.name || "N/A"}</td>
              <td>${item.hsn || "N/A"}</td>
              <td>${item.batch_no || "—"}</td>
              <td>${item.expiry || "—"}</td>
              <td><b>${item.quantity || 0}</b></td>
              <td class="r">₹${unitPrice.toFixed(2)}</td>
              <td class="r">₹${parseFloat(item.mrp || 0).toFixed(2)}</td>
              <td class="r">${item.purchaseDiscountPercent || "0"}%</td>
              <td class="r">₹${parseFloat(item.discountedAmt || 0).toFixed(2)}</td>
              <td class="r">₹${taxableAmt.toFixed(2)}</td>
              <td class="r col-grp">${item.cgstPercent || 0}% / ₹${parseFloat(item.cgstAmt || 0).toFixed(2)}</td>
              <td class="r">${item.sgstPercent || 0}% / ₹${parseFloat(item.sgstAmt || 0).toFixed(2)}</td>
              <td class="r">${item.sellingCgstPercent || 0}% / ₹${parseFloat(item.sellingCgstAmt || 0).toFixed(2)}</td>
              <td class="r">${item.sellingsgstPercent || 0}% / ₹${parseFloat(item.sellingSgstAmt || 0).toFixed(2)}</td>
              <td class="r">₹${parseFloat(item.unitCostWithGst || 0).toFixed(2)}</td>
              <td class="r col-grp"><b>₹${parseFloat(item.purchaseCost || 0).toFixed(2)}</b></td>
              <td class="r">₹${parseFloat(item.unitSellingCost || 0).toFixed(2)}</td>
              <td class="r"><b>₹${parseFloat(item.sellingCost || 0).toFixed(2)}</b></td>
            </tr>`;
            })
            .join("")}
          <tr class="tot">
            <td colspan="10" class="r"><b>TOTAL</b></td>
            <td class="r">₹${parseFloat(record.non_taxable_amount || 0).toFixed(2)}</td>
            <td class="r col-grp">₹${parseFloat(record.cgst || 0).toFixed(2)}</td>
            <td class="r">₹${parseFloat(record.sgst || 0).toFixed(2)}</td>
            <td colspan="2"></td><td></td>
            <td class="r col-grp"><b>₹${parseFloat(record.total_amount || 0).toFixed(2)}</b></td>
            <td colspan="2"class="r"><b>₹${items.reduce((s, i) => s + parseFloat(i.unitSellingCost || 0) * parseFloat(i.quantity || 0), 0).toFixed(2)}</b></td>
          </tr>
        </tbody>
      </table>`
        : "<p style='text-align:center;color:#888'>No items</p>";

    const body = `
      <h1>SHANMUGA HOSPITAL LIMITED</h1>
      <div class="address">51/24, Saradha College Road, Salem - 636007</div>
      <div class="address">Phone: 04272706666 | info@smrft.org</div>
      <div class="doctype">PURCHASE INVOICE — ${record.grn_number}</div>
      <div class="grid" style="grid-template-columns:${hasPatient ? "1fr 1fr 1fr" : "1fr 1fr"}">
        <div class="sec">
          <div class="hdr">Invoice Details</div>
          <div class="cnt">
            <div class="row"><b>Invoice No:</b> ${record.invoice_no || "N/A"}</div>
            <div class="row"><b>Invoice Date:</b> ${formatDate(record.invoice_date)}</div>
            <div class="row"><b>Purchase Date:</b> ${formatDate(record.date)}</div>
            <div class="row"><b>Payment Mode:</b> ${record.payment_mode || "N/A"}</div>
            <div class="row"><b>Remarks:</b> ${record.remarks || "—"}</div>
          </div>
        </div>
        <div class="sec">
          <div class="hdr">Supplier Details</div>
          <div class="cnt">
            <div class="row"><b>Vendor:</b> ${vendorDisplay}</div>
            <div class="row"><b>Address:</b> ${cleanAddress(record.address)}</div>
            <div class="row"><b>Contact:</b> ${record.contact_person || "N/A"}</div>
            <div class="row"><b>Phone:</b> ${record.phone || "N/A"}</div>
          </div>
        </div>
        ${
          hasPatient
            ? `
        <div class="sec">
          <div class="hdr">Patient Details</div>
          <div class="cnt">
            ${record.ip_number ? `<div class="row"><b>IP Number:</b> ${record.ip_number}</div>` : ""}
            ${record.patient_name ? `<div class="row"><b>Patient:</b> ${record.patient_name}</div>` : ""}
            ${record.customer_type ? `<div class="row"><b>Customer Type:</b> ${record.customer_type} -  ${record.company_name}</div>` : ""}
            ${record.surgeon_id ? `<div class="row"><b>Surgeon:</b> ${record.surgeon_name || record.surgeon_id}</div>` : ""}
          </div>
        </div>`
            : ""
        }
      </div>
      ${itemsHtml}
      <div class="summary">
        <div class="gst">
          <div style="font-weight:bold;font-size:12px;margin-bottom:8px;color:#1e40af;border-bottom:1px solid #0ea5e9;padding-bottom:4px">GST Summary</div>
          <div class="gst-row"><span>CGST</span><span>₹${parseFloat(record.cgst || 0).toFixed(2)}</span></div>
          <div class="gst-row"><span>SGST</span><span>₹${parseFloat(record.sgst || 0).toFixed(2)}</span></div>
          <div class="gst-row"><span>IGST</span><span>₹${parseFloat(record.igst || 0).toFixed(2)}</span></div>
          <div class="gst-row"><span>CESS</span><span>₹${parseFloat(record.cess || 0).toFixed(2)}</span></div>
          <div class="gst-row" style="border-top:1px solid #0ea5e9;padding-top:4px;margin-top:4px">
            <span>Total GST</span>
            <span>₹${(parseFloat(record.cgst || 0) + parseFloat(record.sgst || 0) + parseFloat(record.igst || 0)).toFixed(2)}</span>
          </div>
          <div class="gst-row"><span>Tax Paid to Supplier</span><span>₹${parseFloat(record.tax_paid_to_supplier || 0).toFixed(2)}</span></div>
        </div>
        <div class="amts">
          <div class="amt-row"><span>Non-Taxable Amount</span><span>₹${parseFloat(record.non_taxable_amount || 0).toFixed(2)}</span></div>
          <div class="amt-row"><span>Taxable Amount</span><span>₹${parseFloat(record.taxable_amount || 0).toFixed(2)}</span></div>
          <div class="amt-row"><span>Total Discount</span><span>₹${parseFloat(record.total_discount || 0).toFixed(2)}</span></div>
          <div class="amt-row"><span>Local Tax</span><span>₹${parseFloat(record.local_tax || 0).toFixed(2)}</span></div>
          <div class="amt-row"><span>Courier / Transport</span><span>₹${parseFloat(record.courier_transport_charge || 0).toFixed(2)}</span></div>
          <div class="amt-row"><span>Round Off</span><span>₹${parseFloat(record.round_amount || 0).toFixed(2)}</span></div>
          <div class="amt-row"><span>Total Amount</span><span>₹${parseFloat(record.total_amount || 0).toFixed(2)}</span></div>
          <div class="amt-row"><span><b>Net Invoice Amount</b></span><span><b>₹${parseFloat(record.net_invoice_amount || record.total_amount || 0).toFixed(2)}</b></span></div>
        </div>
      </div>
      <div class="words"><b>Amount in Words:</b> ${numberToWords(record.net_invoice_amount || record.total_amount)}</div>
      <div class="footer">
        <div><b>Prepared By:</b> ${record.created_by || "N/A"}</div>
        <div style="text-align:center"><b>Authorized Signatory</b><br/><br/>________________________</div>
      </div>`;

    openPrintWindow(`GRN Invoice - ${record.grn_number}`, css, body);
  };
  // ── Velavan Purchase Report ──────────────────────────────────────
  const handlePurchasePrint = () => {
    const sortedData = [...filteredData].sort((a, b) =>
      (a.vendor || a.vendor_id || "")
        .toLowerCase()
        .localeCompare((b.vendor || b.vendor_id || "").toLowerCase()),
    );
    const vendorGroups = {};
    let grandTotal = 0;
    sortedData.forEach((row) => {
      const vendor = row.vendor || row.vendor_id || "N/A";
      if (!vendorGroups[vendor]) vendorGroups[vendor] = { rows: [], total: 0 };
      vendorGroups[vendor].rows.push(row);
      const amt = parseFloat(row.net_invoice_amount || 0);
      vendorGroups[vendor].total += amt;
      grandTotal += amt;
    });

    let tableRows = "";
    let sl = 1;
    let grandReturn = 0;
    let grandNet = 0;
    Object.keys(vendorGroups).forEach((vendor) => {
      const { rows, total } = vendorGroups[vendor];
      rows.sort((a, b) =>
        (a.grn_number || "").localeCompare(b.grn_number || ""),
      );
      tableRows += `<tr style="background:#e0f2fe">
      <td colspan="7" style="font-weight:bold;padding:8px;color:#1e40af">${vendor}</td>
    </tr>`;

      let vendorReturn = 0;
      let vendorNet = 0;
      rows.forEach((row) => {
        const ret = parseFloat(row.purchase_return_amount || 0);
        const net = parseFloat(
          row.net_amount_after_return ??
            parseFloat(row.net_invoice_amount || 0) - ret,
        );
        vendorReturn += ret;
        vendorNet += net;
        grandReturn += ret;
        grandNet += net;

        tableRows += `<tr>
        <td style="text-align:center">${sl++}</td>
        <td>${row.grn_number || "N/A"}</td>
        <td>${row.invoice_no || "N/A"}</td>
        <td>${formatDate(row.invoice_date)}</td>
        <td style="text-align:right">${formatCurrency(row.net_invoice_amount)}</td>
        <td style="text-align:right;color:#dc2626">${ret > 0 ? "- " + formatCurrency(ret) : "—"}</td>
        <td style="text-align:right;font-weight:bold">${formatCurrency(net)}</td>
      </tr>`;
      });

      tableRows += `<tr style="background:#fff3cd;font-weight:bold">
      <td colspan="4" style="text-align:right;padding:8px;border:1px solid #000">Total</td>
      <td style="text-align:right;padding:8px;border:1px solid #000">${formatCurrency(total)}</td>
      <td style="text-align:right;padding:8px;border:1px solid #000">${vendorReturn > 0 ? "- " + formatCurrency(vendorReturn) : "—"}</td>
      <td style="text-align:right;padding:8px;border:1px solid #000">${formatCurrency(vendorNet)}</td>
    </tr>`;
    });

    const css = `
    body{font-family:Arial,sans-serif;padding:10px;font-size:18px}
    h1{text-align:center;font-size:21px;margin:10px 0}
    h2{text-align:center;font-size:18px;color:#555;margin:0 0 10px}
    table{border-collapse:collapse;width:100%;border:1px solid #333;font-size:15px}
    th,td{border:1px dashed #999;padding:8px 13px;vertical-align:top;word-wrap:break-word}
    th{background:#e0e0e0;font-weight:bold;text-align:center}
  `;
    const body = `
    <h1>Velavan Purchase Report</h1>
    <h2>${getDateRangeLabel()}</h2>
    <table>
      <thead><tr>
        <th>Sl.</th><th>GRN Number</th><th>Invoice No</th>
        <th>Inv. Date</th>
        <th style="text-align:right">Bill Amount</th>
        <th style="text-align:right">Return Amt</th>
        <th style="text-align:right">Net Amount</th>
      </tr></thead>
      <tbody>
        ${tableRows}
        <tr style="background:#d4edda;font-weight:bold">
          <td colspan="4" style="text-align:right;padding:8px">Grand Total:</td>
          <td style="text-align:right;padding:8px">${formatCurrency(grandTotal)}</td>
          <td style="text-align:right;padding:8px">${grandReturn > 0 ? "- " + formatCurrency(grandReturn) : "—"}</td>
          <td style="text-align:right;padding:8px">${formatCurrency(grandNet)}</td>
        </tr>
      </tbody>
    </table>`;

    openPrintWindow("Velavan Purchase Report", css, body);
  };
  // ── Export CSV ───────────────────────────────────────────────────
  const exportToExcel = () => {
    const headers = [
      "Date",
      "GRN Number",
      "Vendor",
      "Invoice No",
      "Patient",
      "Surgeon",
      "IP Number",
      "Total Amount",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        [
          formatDate(row.date),
          row.grn_number,
          `"${row.vendor || row.vendor_id || "N/A"}"`,
          row.invoice_no,
          `"${row.patient_name || "N/A"}"`,
          `"${row.surgeon_name || row.surgeon_id || "N/A"}"`,
          row.ip_number || "N/A",
          parseFloat(row.net_invoice_amount || 0).toFixed(2),
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VelavanInvoice_Report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ── Pagination ───────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const currentData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // ─────────────────────────────────────────────────────────────────
  // History Modal
  // ─────────────────────────────────────────────────────────────────
  const HistoryModal = ({ show, onClose, item, historyData, loading }) => {
    if (!show || !item) return null;
    const prices = historyData.map((h) =>
      parseFloat(h.matched_item?.unitPrice || 0),
    );
    const stats = prices.length
      ? {
          min: Math.min(...prices),
          max: Math.max(...prices),
          avg: prices.reduce((a, b) => a + b, 0) / prices.length,
        }
      : { min: 0, max: 0, avg: 0 };
    const totalStock = historyData.reduce(
      (t, h) => t + parseInt(h.matched_item?.totalstock || 0),
      0,
    );
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContainer
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: 1000,
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ModalHeader>
            <div>
              <ModalTitle>
                Purchase History — {item.name} (HSN: {item.hsn})
              </ModalTitle>
              <div
                style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}
              >
                Total Stock: <b>{totalStock}</b> &nbsp;|&nbsp; Range: ₹
                {stats.min.toFixed(2)} – ₹{stats.max.toFixed(2)} &nbsp;|&nbsp;
                Avg: ₹{stats.avg.toFixed(2)}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: colors.textMuted,
              }}
            >
              <X size={20} />
            </button>
          </ModalHeader>
          <ModalBody style={{ overflowX: "auto" }}>
            {loading ? (
              <div style={loadingBox}>
                <div style={spinnerStyle} />
                <span style={{ color: colors.textMuted, fontSize: "0.85rem" }}>
                  Loading history…
                </span>
              </div>
            ) : historyData.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 40,
                  color: colors.textMuted,
                }}
              >
                No previous purchase history found.
              </div>
            ) : (
              <TableWrapper style={{ marginTop: 0 }}>
                <Table>
                  <thead>
                    <Tr>
                      {[
                        "GRN",
                        "Date",
                        "Vendor",
                        "Item",
                        "Unit Price",
                        "P.Cost",
                        "Qty",
                        "MRP",
                      ].map((h) => (
                        <Th key={h}>{h}</Th>
                      ))}
                    </Tr>
                  </thead>
                  <tbody>
                    {historyData.map((hi, idx) => {
                      const it = hi.matched_item || {};
                      const up = parseFloat(it.unitPrice || 0);
                      const isHigh = up === stats.max && stats.max > stats.min;
                      const isLow = up === stats.min && stats.max > stats.min;
                      return (
                        <Tr key={idx}>
                          <Td>{hi.grn_number || "N/A"}</Td>
                          <Td>
                            {new Date(hi.date).toLocaleDateString("en-IN")}
                          </Td>
                          <Td>{hi.vendor || hi.vendor_name || "N/A"}</Td>
                          <Td>{it.name || "N/A"}</Td>
                          <Td
                            style={{
                              fontWeight: 700,
                              color: isHigh
                                ? "#dc2626"
                                : isLow
                                  ? "#16a34a"
                                  : colors.textMain,
                              background: isHigh
                                ? "#fff1f2"
                                : isLow
                                  ? "#f0fdf4"
                                  : "transparent",
                            }}
                          >
                            ₹
                            {up.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </Td>
                          <Td>
                            ₹
                            {parseFloat(it.purchaseCost || 0).toLocaleString(
                              "en-IN",
                              { minimumFractionDigits: 2 },
                            )}
                          </Td>
                          <Td>{it.quantity || "N/A"}</Td>
                          <Td>
                            ₹
                            {parseFloat(it.mrp || 0).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </Table>
              </TableWrapper>
            )}
          </ModalBody>
        </ModalContainer>
      </ModalOverlay>
    );
  };

  // ─────────────────────────────────────────────────────────────────
  // View Modal
  // ─────────────────────────────────────────────────────────────────
  const ViewModal = ({ showModal, selectedRecord, onClose }) => {
    if (!showModal || !selectedRecord) return null;
    // Normalize items to always be an array inside the modal
    const r = { ...selectedRecord, items: parseItems(selectedRecord.items) };
    const vendorDisplay = r.vendor || r.vendor_id || "N/A";
    const hasPatient =
      r.ip_number || r.patient_name || r.surgeon_name || r.surgeon_id;
    const InfoRow = ({ label, value }) => (
      <div style={detailItem}>
        <span style={detailLabel}>{label}</span>
        <span style={detailValue}>{value ?? "N/A"}</span>
      </div>
    );
    return (
      <ModalOverlay onClick={onClose} style={{ zIndex: 1000 }}>
        <ModalContainer
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: 920,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ModalHeader>
            <ModalTitle>Invoice — {r.grn_number || "N/A"}</ModalTitle>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: colors.textMuted,
              }}
            >
              <X size={20} />
            </button>
          </ModalHeader>
          <ModalBody>
            <p style={sectionTitle}>📋 Invoice Information</p>
            <div style={detailGrid}>
              <InfoRow label="GRN Number" value={r.grn_number} />
              <InfoRow label="Vendor" value={vendorDisplay} />
              <InfoRow label="Invoice No" value={r.invoice_no} />
              <InfoRow
                label="Invoice Date"
                value={formatDate(r.invoice_date)}
              />
              <InfoRow label="Purchase Date" value={formatDate(r.date)} />
              <InfoRow label="Payment Mode" value={r.payment_mode} />
              <InfoRow label="Remarks" value={r.remarks || "—"} />
            </div>

            <p style={sectionTitle}>🏢 Supplier Details</p>
            <div style={detailGrid}>
              <InfoRow label="Contact Person" value={r.contact_person} />
              <InfoRow label="Phone" value={r.phone} />
              <InfoRow label="Address" value={r.address} />
            </div>

            {hasPatient && (
              <>
                <p style={sectionTitle}>🏥 Patient Details</p>
                <div style={detailGrid}>
                  {r.ip_number && (
                    <InfoRow label="IP Number" value={r.ip_number} />
                  )}
                  {r.patient_name && (
                    <InfoRow label="Patient Name" value={r.patient_name} />
                  )}
                  {r.surgeon_name && (
                    <InfoRow label="Surgeon" value={r.surgeon_name} />
                  )}
                  {r.surgeon_id && !r.surgeon_name && (
                    <InfoRow label="Surgeon" value={r.surgeon_id} />
                  )}
                </div>
              </>
            )}

            <p style={sectionTitle}>💰 Financial Breakdown</p>
            <div style={detailGrid}>
              <InfoRow
                label="Non-Taxable Amt"
                value={formatCurrency(r.non_taxable_amount)}
              />
              <InfoRow
                label="Taxable Amount"
                value={formatCurrency(r.taxable_amount)}
              />
              <InfoRow
                label="Tax Paid to Supplier"
                value={formatCurrency(r.tax_paid_to_supplier)}
              />
              <InfoRow label="CGST" value={formatCurrency(r.cgst)} />
              <InfoRow label="SGST" value={formatCurrency(r.sgst)} />
              <InfoRow label="IGST" value={formatCurrency(r.igst)} />
              <InfoRow label="CESS" value={formatCurrency(r.cess)} />
              <InfoRow
                label="Total Discount"
                value={formatCurrency(r.total_discount)}
              />
              <InfoRow label="Local Tax" value={formatCurrency(r.local_tax)} />
              <InfoRow
                label="Round Off"
                value={formatCurrency(r.round_amount)}
              />
              <InfoRow
                label="Courier Charge"
                value={formatCurrency(r.courier_transport_charge)}
              />
              <InfoRow
                label="Total Amount"
                value={formatCurrency(r.total_amount)}
              />
              <div
                style={{
                  ...detailItem,
                  background: "#e0f2fe",
                  border: "2px solid #000",
                  gridColumn: "span 2",
                }}
              >
                <span style={{ ...detailLabel, color: "#000" }}>
                  Net Invoice Amount
                </span>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#000" }}>
                  {formatCurrency(r.net_invoice_amount || r.total_amount)}
                </span>
              </div>
            </div>

            <p style={sectionTitle}>📦 Items ({r.items?.length || 0})</p>
            <TableWrapper style={{ marginTop: 4 }}>
              <Table>
                <thead>
                  <Tr>
                    {[
                      "#",
                      "Item",
                      "HSN",
                      "Batch No",
                      "Expiry",
                      "Qty",
                      "Unit Price",
                      "MRP",
                      "Tax%",
                      "CGST%",
                      "CGST Amt",
                      "SGST%",
                      "SGST Amt",
                      "P.Discount",
                      "P.Cost",
                      "S.Cost",
                      "History",
                    ].map((h) => (
                      <Th key={h}>{h}</Th>
                    ))}
                  </Tr>
                </thead>
                <tbody>
                  {r.items?.length > 0 ? (
                    r.items.map((item, i) => (
                      <Tr key={i}>
                        <Td>{i + 1}</Td>
                        <Td style={{ fontWeight: 600, minWidth: 120 }}>
                          {item.name || "N/A"}
                        </Td>
                        <Td>{item.hsn || "N/A"}</Td>
                        <Td>{item.batch_no || "—"}</Td>
                        <Td>{item.expiry || "—"}</Td>
                        <Td style={{ textAlign: "center", fontWeight: 700 }}>
                          {item.quantity || "N/A"}
                        </Td>
                        <Td style={{ textAlign: "right" }}>
                          ₹{parseFloat(item.unitPrice || 0).toFixed(2)}
                        </Td>
                        <Td style={{ textAlign: "right" }}>
                          ₹{parseFloat(item.mrp || 0).toFixed(2)}
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          {item.tax || 0}%
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          {item.cgstPercent || 0}%
                        </Td>
                        <Td style={{ textAlign: "right" }}>
                          ₹{parseFloat(item.cgstAmt || 0).toFixed(2)}
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          {item.sgstPercent || 0}%
                        </Td>
                        <Td style={{ textAlign: "right" }}>
                          ₹{parseFloat(item.sgstAmt || 0).toFixed(2)}
                        </Td>
                        <Td style={{ textAlign: "right" }}>
                          {item.purchaseDiscountPercent || "0"}%
                        </Td>
                        <Td
                          style={{
                            textAlign: "right",
                            fontWeight: 700,
                            color: "#1d4ed8",
                          }}
                        >
                          ₹{parseFloat(item.purchaseCost || 0).toFixed(2)}
                        </Td>
                        <Td
                          style={{
                            textAlign: "right",
                            fontWeight: 700,
                            color: "#166534",
                          }}
                        >
                          ₹{parseFloat(item.sellingCost || 0).toFixed(2)}
                        </Td>
                        <Td>
                          <Button
                            onClick={() => handleShowHistory(item)}
                            style={{
                              padding: "3px 10px",
                              fontSize: "0.75rem",
                              gap: 4,
                            }}
                          >
                            <History size={13} /> History
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td
                        colSpan="17"
                        style={{ textAlign: "center", color: colors.textMuted }}
                      >
                        No items found
                      </Td>
                    </Tr>
                  )}
                </tbody>
              </Table>
            </TableWrapper>

            <p style={sectionTitle}>📝 Audit</p>
            <div style={detailGrid}>
              <InfoRow label="Created By" value={r.created_by} />
              <InfoRow
                label="Created Date"
                value={formatDateTime(r.created_date)}
              />
              <InfoRow
                label="Last Modified Date"
                value={formatDateTime(r.lastmodified_date)}
              />
            </div>
          </ModalBody>
        </ModalContainer>
      </ModalOverlay>
    );
  };

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────
  return (
    <Container>
      {/* ── Page Header ── */}
      <div style={pageHeader}>
        <h2
          style={{
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: 700,
            color: colors.textMain,
          }}
        >
          Velavan Invoice Report
        </h2>
        <Button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.82rem",
            padding: "6px 14px",
          }}
        >
          <ArrowLeft size={14} />
          Back
        </Button>
      </div>

      {/* ── Filters Bar ── */}
      <div style={filtersBar}>
        <div style={filterGroup}>
          <Label>From Date</Label>
          <div style={{ position: "relative" }}>
            <Input
              type="date"
              value={filters.from_date}
              onChange={(e) => handleFilterChange("from_date", e.target.value)}
              style={{ paddingLeft: 30 }}
            />
            <Calendar
              size={13}
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: colors.textMuted,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        <div style={filterGroup}>
          <Label>To Date</Label>
          <div style={{ position: "relative" }}>
            <Input
              type="date"
              value={filters.to_date}
              onChange={(e) => handleFilterChange("to_date", e.target.value)}
              style={{ paddingLeft: 30 }}
            />
            <Calendar
              size={13}
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: colors.textMuted,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        <Button
          onClick={handleDateSearch}
          style={{
            alignSelf: "flex-end",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Search size={13} /> Search
        </Button>

        <div style={{ ...filterGroup, minWidth: 340 }}>
          <Label>Search</Label>
          <div style={{ position: "relative" }}>
            <Input
              type="text"
              placeholder="GRN, Invoice No, Batch No, Vendor, Patient, Surgeon…"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              style={{ paddingLeft: 30, width: "100%" }}
            />
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: colors.textMuted,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        <Button
          secondary
          onClick={clearFilters}
          style={{ alignSelf: "flex-end" }}
        >
          Clear
        </Button>
      </div>

      {/* ── Actions Bar ── */}
      <div style={actionsBar}>
        <span style={{ fontSize: "0.82rem", color: colors.textMuted }}>
          {filteredData.length === 0
            ? "No records found"
            : `Showing ${currentData.length} of ${filteredData.length} records`}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {canPurP && (
            <Button success onClick={handlePurchasePrint}>
              <Printer size={14} /> Purchase Report
            </Button>
          )}

          {canPurP && (
            <Button onClick={exportToExcel}>
              <Download size={14} /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={loadingBox}>
          <div style={spinnerStyle} />
          <span style={{ color: colors.textMuted, fontSize: "0.85rem" }}>
            Loading…
          </span>
        </div>
      ) : (
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
                  "Date",
                  "GRN Number",
                  "Vendor",
                  "Invoice Date",
                  "Invoice No",
                  "Patient",
                  "Surgeon",
                  "IP Number",
                  "Purchase Amount",
                  "Purchase Return Amount",
                  "Amount To Be Paid",
                  "Actions",
                ].map((h) => (
                  <Th key={h} style={{ whiteSpace: "nowrap" }}>
                    {h}
                  </Th>
                ))}
              </Tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <Tr>
                  <Td
                    colSpan="11"
                    style={{
                      textAlign: "center",
                      padding: 30,
                      color: colors.textMuted,
                    }}
                  >
                    No records found
                  </Td>
                </Tr>
              ) : (
                currentData.map((row, idx) => (
                  <Tr key={row.grn_number || idx}>
                    <Td style={{ whiteSpace: "nowrap" }}>
                      {formatDate(row.date)}
                    </Td>
                    <Td style={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                      {row.grn_number || "N/A"}
                    </Td>
                    <Td style={{ minWidth: 160 }}>
                      {row.vendor || row.vendor_id || "N/A"}
                    </Td>
                    <Td style={{ whiteSpace: "nowrap" }}>
                      {formatDate(row.invoice_date)}
                    </Td>
                    <Td>{row.invoice_no || "N/A"}</Td>
                    <Td style={{ minWidth: 100 }}>{row.patient_name || "—"}</Td>
                    <Td style={{ minWidth: 100 }}>
                      {row.surgeon_name || row.surgeon_id || "—"}
                    </Td>
                    <Td>{row.ip_number || "—"}</Td>
                    <Td style={{ textAlign: "right", fontWeight: 600 }}>
                      {formatCurrency(row.net_invoice_amount)}
                    </Td>
                    <Td
                      style={{
                        textAlign: "right",
                        color:
                          row.purchase_return_amount > 0
                            ? "#dc2626"
                            : colors.textMuted,
                      }}
                    >
                      {row.purchase_return_amount > 0
                        ? `- ${formatCurrency(row.purchase_return_amount)}`
                        : "—"}
                    </Td>
                    <Td
                      style={{
                        textAlign: "right",
                        fontWeight: 700,
                        color:
                          row.net_amount_after_return <= 0
                            ? "#16a34a"
                            : colors.textMain,
                      }}
                    >
                      {formatCurrency(row.net_amount_after_return)}
                    </Td>
                    <Td style={{ whiteSpace: "nowrap" }}>
                      {/* View */}
                      {canView && (
                        <button
                          style={actionBtn}
                          title="View"
                          onClick={() => handleView(row)}
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      {/* Edit — disabled when approved */}
                      {canEdit && (
                        <button
                          style={{
                            ...actionBtn,
                            opacity: row.is_approved ? 0.35 : 1,
                            cursor: row.is_approved ? "not-allowed" : "pointer",
                            color: row.is_approved
                              ? colors.textMuted
                              : actionBtn.color,
                          }}
                          title={
                            row.is_approved
                              ? "Approved — editing locked"
                              : "Edit"
                          }
                          onClick={() => !row.is_approved && handleEdit(row)}
                          disabled={row.is_approved}
                        >
                          <Edit3 size={14} />
                        </button>
                      )}

                      {/* Approve toggle */}
                      {canApprove && (
                        <button
                          style={{
                            ...actionBtn,
                            color: row.is_approved ? "#16a34a" : "#d97706",
                            borderColor: row.is_approved
                              ? "#16a34a"
                              : "#d97706",
                            cursor: row.is_approved ? "default" : "pointer",
                          }}
                          title={
                            row.is_approved
                              ? `Approved by ${row.approved_by || "—"}`
                              : "Click to Approve"
                          }
                          onClick={() => !row.is_approved && handleApprove(row)}
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}

                      {/* GRN Print */}
                      {canPurP && (
                        <button
                          style={actionBtn}
                          title="GRN Print"
                          onClick={() => handleGRNPrint(row)}
                        >
                          <Printer size={14} />
                        </button>
                      )}

                      {(() => {
                        const amountToBePaid = parseFloat(
                          row.net_amount_after_return || 0,
                        );
                        const canBill =
                          row.is_approved &&
                          !row.has_sales_bill &&
                          amountToBePaid > 0;

                        const canReturnStock =
                          row.is_approved && row.has_returnable_stock;

                        const cartTitle =
                          amountToBePaid <= 0
                            ? "Nothing to bill — amount to be paid is ₹0"
                            : row.has_sales_bill
                              ? "Already billed — a sales bill exists for this GRN"
                              : row.is_approved
                                ? "Bill this invoice"
                                : "Approve invoice to enable billing";

                        const returnTitle = !row.is_approved
                          ? "Approve invoice to enable purchase return"
                          : !row.has_returnable_stock
                            ? "No returnable stock remaining for this GRN"
                            : "Purchase Return";

                        return (
                          <>
                            {canSalBil && (
                              <button
                                type="button"
                                style={{
                                  ...actionBtn,
                                  color: canBill ? "#0891b2" : colors.textMuted,
                                  borderColor: canBill
                                    ? "#0891b2"
                                    : colors.border,
                                  opacity: canBill ? 1 : 0.35,
                                  cursor: canBill ? "pointer" : "not-allowed",
                                }}
                                title={cartTitle}
                                onClick={() =>
                                  canBill &&
                                  navigate("/SalesBilling", {
                                    state: { record: row },
                                  })
                                }
                                disabled={!canBill}
                              >
                                <ShoppingCart size={14} />
                              </button>
                            )}

                            {canPurReturn && (
                              <button
                                type="button"
                                style={{
                                  ...actionBtn,
                                  color: canReturnStock
                                    ? "#dc2626"
                                    : colors.textMuted,
                                  borderColor: canReturnStock
                                    ? "#dc2626"
                                    : colors.border,
                                  opacity: canReturnStock ? 1 : 0.35,
                                  cursor: canReturnStock
                                    ? "pointer"
                                    : "not-allowed",
                                }}
                                title={returnTitle}
                                onClick={() =>
                                  canReturnStock && openPurchaseReturnModal(row)
                                }
                                disabled={!canReturnStock}
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
      )}

      {/* ── Pagination ── */}
      <div style={paginationBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.82rem", color: colors.textMuted }}>
            Rows per page:
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: "3px 6px",
              borderRadius: 4,
              border: `1px solid ${colors.border}`,
              fontSize: "0.82rem",
            }}
          >
            {[10, 20, 50, 100].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button
            secondary
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{ padding: "4px 8px" }}
          >
            <ChevronLeft size={15} />
          </Button>
          <span style={{ fontSize: "0.82rem", color: colors.textMuted }}>
            {currentPage} of {totalPages || 1}
          </span>
          <Button
            secondary
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            style={{ padding: "4px 8px" }}
          >
            <ChevronRight size={15} />
          </Button>
        </div>
      </div>

      <ViewModal
        showModal={showModal}
        selectedRecord={selectedRecord}
        onClose={() => setShowModal(false)}
      />
      <HistoryModal
        show={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setHistoryData([]);
          setSelectedItemForHistory(null);
        }}
        item={selectedItemForHistory}
        historyData={historyData}
        loading={historyLoading}
      />
      {returnModalRecord && (
        <ModalOverlay onClick={() => setReturnModalRecord(null)}>
          <ModalContainer
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 900 }}
          >
            <ModalHeader>
              <ModalTitle>
                Purchase Return — {returnModalRecord.grn_number}
              </ModalTitle>
              <button
                onClick={() => setReturnModalRecord(null)}
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
                        "Purchased Qty",
                        "Return Qty",
                        "Unit Cost (w/ GST)",
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
                          ₹{parseFloat(l.unitCostWithGst || 0).toFixed(2)}
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
                <Button secondary onClick={() => setReturnModalRecord(null)}>
                  Cancel
                </Button>
                <Button onClick={submitPurchaseReturn} disabled={returnLoading}>
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

export default InvoiceReport;
