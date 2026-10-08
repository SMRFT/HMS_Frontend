import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
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
import { toast, ToastContainer } from "react-toastify";
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
  position: "relative",
  zIndex: 50,
};

const dropdownWrap = { position: "relative", zIndex: 60 };
const dropdownMenu = {
  position: "absolute",
  top: "calc(100% + 4px)",
  right: 0,
  background: "#fff",
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
  zIndex: 2000,
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
  const [returnRemarks, setReturnRemarks] = useState("");
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

  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const reportDropdownRef = useRef(null);
  const reportMenuRef = useRef(null);
  const [reportMenuPos, setReportMenuPos] = useState({ top: 0, left: 0 });
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef(null);
  const exportMenuRef = useRef(null);
  const [exportMenuPos, setExportMenuPos] = useState({ top: 0, left: 0 });

  const MENU_WIDTH = 210;
  const positionMenuFromRef = (ref) => {
    if (!ref.current) return { top: 0, left: 0 };
    const rect = ref.current.getBoundingClientRect();
    return {
      top: rect.bottom + 4,
      left: Math.max(8, rect.right - MENU_WIDTH),
    };
  };
  const toggleReportDropdown = () => {
    setShowExportDropdown(false);
    setShowReportDropdown((v) => {
      const next = !v;
      if (next) setReportMenuPos(positionMenuFromRef(reportDropdownRef));
      return next;
    });
  };
  const toggleExportDropdown = () => {
    setShowReportDropdown(false);
    setShowExportDropdown((v) => {
      const next = !v;
      if (next) setExportMenuPos(positionMenuFromRef(exportDropdownRef));
      return next;
    });
  };

  useEffect(() => {
    const handler = (e) => {
      const reportOutside =
        (!reportDropdownRef.current ||
          !reportDropdownRef.current.contains(e.target)) &&
        (!reportMenuRef.current || !reportMenuRef.current.contains(e.target));
      if (reportOutside) setShowReportDropdown(false);

      const exportOutside =
        (!exportDropdownRef.current ||
          !exportDropdownRef.current.contains(e.target)) &&
        (!exportMenuRef.current || !exportMenuRef.current.contains(e.target));
      if (exportOutside) setShowExportDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!showReportDropdown && !showExportDropdown) return;
    const reposition = () => {
      if (showReportDropdown)
        setReportMenuPos(positionMenuFromRef(reportDropdownRef));
      if (showExportDropdown)
        setExportMenuPos(positionMenuFromRef(exportDropdownRef));
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [showReportDropdown, showExportDropdown]);

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
      fetchData(filters.from_date, filters.to_date);
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
    setReturnRemarks("");
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
    if (!returnRemarks.trim()) {
      toast.error("Remarks is required");
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
      remarks: returnRemarks.trim(),
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
      remarks: returnRemarks.trim(),
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
        ${hasPatient
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
  // ── Fetch Purchase Returns in Date Range ─────────────────────────
  const fetchReturnsForRegister = async () => {
    const params = new URLSearchParams();
    if (filters.from_date) params.append("from_date", filters.from_date);
    if (filters.to_date) params.append("to_date", filters.to_date);
    const r = await apiRequest(
      `${HMSURL}velavan/purchase-return/list/?${params.toString()}`,
      "GET",
    );
    return r.success && r.data?.status === "success" ? r.data.data || [] : [];
  };

  // ── Build Grouped Purchase Data ──────────────────────────────────
  const buildPurchaseReportGroups = (returnsList = []) => {
    const idToNameMap = {};
    const nameToIdMap = {};

    [...filteredData, ...returnsList].forEach((item) => {
      const vid = item.vendor_id ? String(item.vendor_id).trim() : "";
      const name = (
        item.vendor_company ||
        item.vendor_name ||
        item.vendor ||
        ""
      ).trim();

      if (vid && name && name !== "N/A") {
        idToNameMap[vid] = name;
        nameToIdMap[name.toLowerCase()] = vid;
      }
    });

    const getVendorKeyAndName = (item) => {
      let vid = item.vendor_id ? String(item.vendor_id).trim() : "";
      let name = (
        item.vendor_company ||
        item.vendor_name ||
        item.vendor ||
        ""
      ).trim();

      if (vid && idToNameMap[vid]) {
        name = idToNameMap[vid];
      } else if (!vid && name && nameToIdMap[name.toLowerCase()]) {
        vid = nameToIdMap[name.toLowerCase()];
        if (idToNameMap[vid]) name = idToNameMap[vid];
      }

      const finalName = name || (vid ? `Vendor #${vid}` : "N/A");
      const key = vid ? `ID_${vid}` : `NAME_${finalName.toLowerCase()}`;
      return { key, displayName: finalName };
    };

    const vendorGroups = {};

    filteredData.forEach((row) => {
      const { key, displayName } = getVendorKeyAndName(row);
      if (!vendorGroups[key]) {
        vendorGroups[key] = {
          vendorName: displayName,
          purchaseRows: [],
          returnRows: [],
          purchaseTotal: 0,
          returnTotal: 0,
          netTotal: 0,
        };
      }
      if (vendorGroups[key].vendorName === "N/A" && displayName !== "N/A") {
        vendorGroups[key].vendorName = displayName;
      }
      vendorGroups[key].purchaseRows.push(row);
      vendorGroups[key].purchaseTotal += parseFloat(
        row.net_invoice_amount || row.total_amount || 0,
      );
    });

    const grnInfoMap = {};
    filteredData.forEach((row) => {
      if (row.grn_number) {
        grnInfoMap[row.grn_number] = {
          invoice_no: row.invoice_no,
          invoice_date: row.invoice_date,
          date: row.date,
        };
      }
    });

    returnsList.forEach((r) => {
      if (r.grn_number && grnInfoMap[r.grn_number]) {
        if (!r.invoice_no) r.invoice_no = grnInfoMap[r.grn_number].invoice_no;
        if (!r.invoice_date)
          r.invoice_date = grnInfoMap[r.grn_number].invoice_date;
        if (!r.grn_date) r.grn_date = grnInfoMap[r.grn_number].date;
      }
      const { key, displayName } = getVendorKeyAndName(r);
      if (!vendorGroups[key]) {
        vendorGroups[key] = {
          vendorName: displayName,
          purchaseRows: [],
          returnRows: [],
          purchaseTotal: 0,
          returnTotal: 0,
          netTotal: 0,
        };
      }
      if (vendorGroups[key].vendorName === "N/A" && displayName !== "N/A") {
        vendorGroups[key].vendorName = displayName;
      }
      vendorGroups[key].returnRows.push(r);
      vendorGroups[key].returnTotal += parseFloat(r.total_amount || 0);
    });

    let grandPurchase = 0;
    let grandReturn = 0;
    let grandNet = 0;

    const sortedVendorKeys = Object.keys(vendorGroups).sort((a, b) =>
      vendorGroups[a].vendorName
        .toLowerCase()
        .localeCompare(vendorGroups[b].vendorName.toLowerCase()),
    );

    sortedVendorKeys.forEach((key) => {
      const grp = vendorGroups[key];
      grp.purchaseRows.sort((a, b) =>
        (a.grn_number || "").localeCompare(b.grn_number || ""),
      );
      grp.returnRows.sort((a, b) =>
        (a.grn_number || "").localeCompare(b.grn_number || ""),
      );
      grp.netTotal = grp.purchaseTotal - grp.returnTotal;

      grandPurchase += grp.purchaseTotal;
      grandReturn += grp.returnTotal;
      grandNet += grp.netTotal;
    });

    return {
      vendorGroups,
      sortedVendorKeys,
      grandPurchase,
      grandReturn,
      grandNet,
    };
  };

  // ── Velavan Purchase Report ──────────────────────────────────────
  const handlePurchasePrint = async () => {
    let returnsList = [];
    try {
      returnsList = await fetchReturnsForRegister();
    } catch {
      returnsList = [];
    }
    const {
      vendorGroups,
      sortedVendorKeys,
      grandNet,
    } = buildPurchaseReportGroups(returnsList);

    let tableRows = "";
    let sl = 1;

    sortedVendorKeys.forEach((key) => {
      const {
        vendorName,
        purchaseRows,
        returnRows,
        purchaseTotal,
        returnTotal,
        netTotal,
      } = vendorGroups[key];

      const hasPurchase = purchaseRows.length > 0;
      const hasReturns = returnRows.length > 0;

      // 1. Vendor Header Row
      tableRows += `<tr style="background:#e0f2fe">
        <td colspan="4" style="font-weight:bold;padding:7px 10px;color:#1e40af;font-size:13px">${vendorName}</td>
      </tr>`;

      // 2. Purchase Section
      if (hasPurchase) {
        tableRows += `<tr style="background:#f8fafc;font-weight:bold">
          <td colspan="4" style="padding:4px 10px;color:#1e293b;border-top:1px dashed #ccc;border-bottom:1px dashed #ccc">Purchase:</td>
        </tr>`;

        purchaseRows.forEach((row) => {
          tableRows += `<tr>
            <td style="text-align:center">${sl++}</td>
            <td style="text-align:center">${row.grn_number || row.invoice_no || "—"}</td>
            <td style="text-align:center">${formatDate(row.invoice_date || row.date)}</td>
            <td style="text-align:right">${formatCurrency(row.net_invoice_amount || row.total_amount)}</td>
          </tr>`;
        });

        tableRows += `<tr style="background:#fffbe0;font-weight:bold">
          <td colspan="3" style="text-align:right;padding:6px 10px;border:1px solid #999">Total</td>
          <td style="text-align:right;padding:6px 10px;border:1px solid #999">${formatCurrency(purchaseTotal)}</td>
        </tr>`;
      }

      // 3. Purchase Return Section
      if (hasReturns) {
        tableRows += `<tr style="background:#fef2f2;font-weight:bold">
          <td colspan="4" style="padding:4px 10px;color:#991b1b;border-top:1px dashed #ccc;border-bottom:1px dashed #ccc">Purchase Return:</td>
        </tr>`;

        returnRows.forEach((r) => {
          tableRows += `<tr>
            <td style="text-align:center;vertical-align:middle">${sl++}</td>
            <td style="text-align:center;line-height:1.4">
              <div><b>Bill No:</b> ${r.grn_number || r.invoice_no || "—"}</div>
              <div><b>Rtn No:</b> ${r.return_number || "—"}</div>
              ${r.remarks ? `<div style="color:#555;font-size:11px"><b>Remarks:</b> ${r.remarks}</div>` : ""}
            </td>
            <td style="text-align:center;line-height:1.4;white-space:nowrap">
              <div><b>B.D:</b> ${formatDate(r.invoice_date || r.grn_date) || "—"}</div>
              <div><b>R.D:</b> ${formatDate(r.return_date) || "—"}</div>
            </td>
            <td style="text-align:right;color:#dc2626">- ${formatCurrency(r.total_amount)}</td>
          </tr>`;
        });

        tableRows += `<tr style="background:#fee2e2;font-weight:bold">
          <td colspan="3" style="text-align:right;padding:6px 10px;border:1px solid #999">Total</td>
          <td style="text-align:right;padding:6px 10px;border:1px solid #999;color:#dc2626">- ${formatCurrency(returnTotal)}</td>
        </tr>`;
      }

      // 4. Final Amount Row after Purchase Return total
      if (hasPurchase && hasReturns) {
        tableRows += `<tr style="background:#fff3cd;font-weight:bold">
          <td colspan="3" style="text-align:right;padding:7px 10px;border:1px solid #000">Final Amount</td>
          <td style="text-align:right;padding:7px 10px;border:1px solid #000">${formatCurrency(netTotal)}</td>
        </tr>`;
      }
    });

    const css = `
      body{font-family:Arial,sans-serif;padding:10px;font-size:12.5px}
      h1{text-align:center;font-size:18px;margin:8px 0;text-decoration:underline}
      h2{text-align:center;font-size:13px;color:#555;margin:0 0 14px}
      table{border-collapse:collapse;width:100%;border:1px solid #333}
      th,td{border:1px dashed #999;padding:6px 10px}
      th{background:#d0d0d0;font-weight:bold;text-align:center;font-size:12px}
      .grand-row td{background:#d4edda;font-weight:bold}
    `;

    const body = `
      <h1>Velavan Party-wise Purchase Report</h1>
      <h2>${getDateRangeLabel()}</h2>
      <table>
        <thead>
          <tr>
            <th style="width:45px">Sl.</th>
            <th>Bill No</th>
            <th>Bill Date</th>
            <th style="text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr class="grand-row">
            <td colspan="3" style="text-align:right;padding:8px">Grand Total:</td>
            <td style="text-align:right;padding:8px">${formatCurrency(grandNet)}</td>
          </tr>
        </tbody>
      </table>
    `;

    openPrintWindow("Velavan Purchase Report", css, body);
  };

  // ── Export Excel / CSV ───────────────────────────────────────────
  const exportToExcel = async () => {
    const XLSX = require("xlsx");
    let returnsList = [];
    try {
      returnsList = await fetchReturnsForRegister();
    } catch {
      returnsList = [];
    }
    const {
      vendorGroups,
      sortedVendorKeys,
      grandNet,
    } = buildPurchaseReportGroups(returnsList);

    const wsData = [
      [`Velavan Party-wise Purchase Report - ${getDateRangeLabel()}`],
      [],
      ["Sl.", "Bill No", "Bill Date", "Amount"],
    ];

    let sl = 1;
    sortedVendorKeys.forEach((key) => {
      const {
        vendorName,
        purchaseRows,
        returnRows,
        purchaseTotal,
        returnTotal,
        netTotal,
      } = vendorGroups[key];

      const hasPurchase = purchaseRows.length > 0;
      const hasReturns = returnRows.length > 0;

      wsData.push([vendorName]);

      if (hasPurchase) {
        wsData.push(["Purchase:"]);
        purchaseRows.forEach((row) => {
          wsData.push([
            sl++,
            row.grn_number || row.invoice_no || "—",
            formatDate(row.invoice_date || row.date),
            parseFloat(
              parseFloat(
                row.net_invoice_amount || row.total_amount || 0,
              ).toFixed(2),
            ),
          ]);
        });
        wsData.push([
          "",
          "",
          "Total",
          parseFloat(purchaseTotal.toFixed(2)),
        ]);
      }

      if (hasReturns) {
        wsData.push(["Purchase Return:"]);
        returnRows.forEach((r) => {
          const docText = `Bill No: ${r.grn_number || r.invoice_no || "—"}\nRtn No: ${r.return_number || "—"}${r.remarks ? `\nRemarks: ${r.remarks}` : ""}`;
          const dateText = `B.D: ${formatDate(r.invoice_date || r.grn_date) || "—"}\nR.D: ${formatDate(r.return_date) || "—"}`;
          wsData.push([
            sl++,
            docText,
            dateText,
            -parseFloat(parseFloat(r.total_amount || 0).toFixed(2)),
          ]);
        });
        wsData.push([
          "",
          "",
          "Total",
          -parseFloat(returnTotal.toFixed(2)),
        ]);
      }

      if (hasPurchase && hasReturns) {
        wsData.push([
          "",
          "",
          "Final Amount",
          parseFloat(netTotal.toFixed(2)),
        ]);
      }
      wsData.push([]);
    });

    wsData.push([
      "",
      "",
      "Grand Total:",
      parseFloat(grandNet.toFixed(2)),
    ]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 20 },
      { wch: 18 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Report");
    XLSX.writeFile(
      wb,
      `PurchaseReport_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // ── Helper: Item Tax Extraction ──────────────────────────────────────────
  const getItemTaxInfo = (item) => {
    const qty = parseFloat(item.quantity || item.qty || 0);
    const up = parseFloat(item.unitPrice || 0);
    const pc = parseFloat(item.purchaseCost || 0);
    const ucWithGst = parseFloat(item.unitCostWithGst || 0);
    const cgstP = parseFloat(item.cgstPercent || 0);
    const sgstP = parseFloat(item.sgstPercent || 0);
    const igstP = parseFloat(item.igstPercent || 0);
    const rawTax =
      item.tax !== undefined && item.tax !== null && item.tax !== ""
        ? parseFloat(item.tax)
        : (item.purchase_tax_rate !== undefined && item.purchase_tax_rate !== null && item.purchase_tax_rate !== ""
            ? parseFloat(item.purchase_tax_rate)
            : null);
    const taxRate = rawTax !== null ? rawTax : cgstP + sgstP + igstP;

    let taxable = 0;
    let total = 0;
    let cgst = parseFloat(item.cgstAmt || 0);
    let sgst = parseFloat(item.sgstAmt || 0);
    let igst = parseFloat(item.igstAmt || 0);

    if (
      item.purchaseCostBeforeGst !== undefined &&
      item.purchaseCostBeforeGst !== null &&
      item.purchaseCostBeforeGst !== ""
    ) {
      taxable = parseFloat(item.purchaseCostBeforeGst || 0);
    } else if (
      item.taxable_amount !== undefined &&
      item.taxable_amount !== null &&
      item.taxable_amount !== ""
    ) {
      taxable = parseFloat(item.taxable_amount || 0);
    } else if (pc > 0) {
      taxable = taxRate > 0 ? pc / (1 + taxRate / 100) : pc;
    } else if (up > 0 && qty > 0) {
      const discP = parseFloat(item.purchaseDiscountPercent || 0);
      taxable = up * qty * (1 - discP / 100);
    } else if (ucWithGst > 0 && qty > 0) {
      const lineTot = ucWithGst * qty;
      taxable = taxRate > 0 ? lineTot / (1 + taxRate / 100) : lineTot;
    }

    if (cgst === 0 && cgstP > 0 && taxable > 0) {
      cgst = taxable * (cgstP / 100);
    }
    if (sgst === 0 && sgstP > 0 && taxable > 0) {
      sgst = taxable * (sgstP / 100);
    }
    if (igst === 0 && igstP > 0 && taxable > 0) {
      igst = taxable * (igstP / 100);
    }

    total = parseFloat(item.total_amount || item.lineTotal || item.purchaseCost || 0);
    if (total === 0) {
      total = taxable + cgst + sgst + igst;
    }

    return { qty, taxRate, taxable, cgst, sgst, igst, total };
  };

  const getBucketKey = (rate) => {
    const r = parseFloat(rate || 0);
    if (r === 0) return "exempt";
    if (r <= 6) return "5";
    if (r <= 13) return "12";
    return "18";
  };

  const getNumericBucketKey = (rate) => {
    const r = parseFloat(rate || 0);
    if (r === 0) return "0";
    if (r <= 6) return "5";
    if (r <= 13) return "12";
    return "18";
  };

  // ── Purchase Tax Register — grouped by invoice_date / date ────────────────
  const buildPurchaseTaxRegisterData = () => {
    const dateGroups = {};
    filteredData.forEach((row) => {
      const key = (row.invoice_date || row.date || "").substring(0, 10);
      if (!dateGroups[key]) dateGroups[key] = [];
      dateGroups[key].push(row);
    });
    const emptyBucket = () => ({ amount: 0, sgst: 0, cgst: 0, total: 0 });
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
      const dayInvoices = dateGroups[dateKey];
      const nums = dayInvoices
        .map((b) => b.grn_number || b.invoice_no)
        .filter(Boolean)
        .sort();
      const grnRange =
        nums.length <= 1
          ? nums[0] || "N/A"
          : `${nums[0]} - ${nums[nums.length - 1].split("/").pop()}`;
      const buckets = {
        exempt: emptyBucket(),
        5: emptyBucket(),
        12: emptyBucket(),
        18: emptyBucket(),
      };
      dayInvoices.forEach((inv) => {
        const items = parseItems(inv.items);
        if (items.length > 0) {
          items.forEach((item) => {
            const { taxRate, taxable, cgst, sgst, total } = getItemTaxInfo(item);
            const key = getBucketKey(taxRate);
            buckets[key].amount += taxable;
            buckets[key].sgst += sgst;
            buckets[key].cgst += cgst;
            buckets[key].total += total;
          });
        } else {
          const invTaxable = parseFloat(inv.taxable_amount || 0);
          const invCgst = parseFloat(inv.cgst || 0);
          const invSgst = parseFloat(inv.sgst || 0);
          const invTotal = parseFloat(
            inv.net_invoice_amount || inv.total_amount || 0,
          );
          const rate =
            invTaxable > 0 ? ((invCgst + invSgst) / invTaxable) * 100 : 0;
          const key = getBucketKey(rate);
          buckets[key].amount += invTaxable;
          buckets[key].cgst += invCgst;
          buckets[key].sgst += invSgst;
          buckets[key].total += invTotal;
        }
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
      return { dateKey, grnRange, buckets, rowTotal };
    });
    return { rows, grand, RATE_BUCKETS };
  };

  const handlePurchaseTaxRegisterPrint = () => {
    const { rows, grand } = buildPurchaseTaxRegisterData();
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
        ({ dateKey, grnRange, buckets, rowTotal }) => `
      <tr>
        <td class="c">${formatDate(dateKey)}</td><td class="c">VELAVAN HOSPITAL NEEDS</td>
        <td class="billcol">${grnRange}</td>
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
        <div class="report-title">Purchase Tax Register From ${getDateRangeLabel()}</div>
        <div class="page-info">Page : 1/1</div>
      </div>
      <table>
        <thead>
          <tr><th rowspan="2">PURCHASE DATE</th><th rowspan="2">NAME</th><th rowspan="2">GRN RANGE</th>
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
    openPrintWindow("Purchase Tax Register", css, body);
  };

  const exportPurchaseTaxRegisterExcel = () => {
    const XLSX = require("xlsx");
    const { rows, grand } = buildPurchaseTaxRegisterData();
    const f = (n) => (n === 0 ? "" : parseFloat(n.toFixed(2)));
    const fG = (n) => parseFloat(n.toFixed(2));

    const dataRows = rows.map(({ dateKey, grnRange, buckets, rowTotal }) => [
      formatDate(dateKey),
      "VELAVAN HOSPITAL NEEDS",
      grnRange,
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
    const titleRow = [`Purchase Tax Register - ${getDateRangeLabel()}`];
    const groupRow = [
      "PURCHASE DATE",
      "NAME",
      "GRN RANGE",
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
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Tax Register");
    XLSX.writeFile(
      wb,
      `PurchaseTaxRegister_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // ── Purchase Return Register ─────────────────────────────────────────────
  const buildPurchaseReturnRegisterData = (returns) => {
    const dateGroups = {};
    returns.forEach((rr) => {
      const key = (rr.return_date || "").substring(0, 10);
      if (!dateGroups[key]) dateGroups[key] = [];
      dateGroups[key].push(rr);
    });
    const emptyBucket = () => ({ amount: 0, sgst: 0, cgst: 0, total: 0 });
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
        const items = parseItems(rr.items);
        if (items.length > 0) {
          items.forEach((item) => {
            const { taxRate, taxable, cgst, sgst, total } = getItemTaxInfo(item);
            const key = getBucketKey(taxRate);
            buckets[key].amount += taxable;
            buckets[key].sgst += sgst;
            buckets[key].cgst += cgst;
            buckets[key].total += total;
          });
        } else {
          const retTaxable = parseFloat(rr.taxable_amount || 0);
          const retCgst = parseFloat(rr.cgst || 0);
          const retSgst = parseFloat(rr.sgst || 0);
          const retTotal = parseFloat(rr.total_amount || 0);
          const rate =
            retTaxable > 0 ? ((retCgst + retSgst) / retTaxable) * 100 : 0;
          const key = getBucketKey(rate);
          buckets[key].amount += retTaxable;
          buckets[key].cgst += retCgst;
          buckets[key].sgst += retSgst;
          buckets[key].total += retTotal;
        }
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

  const handlePurchaseReturnRegisterPrint = async () => {
    let returns = [];
    try {
      returns = await fetchReturnsForRegister();
    } catch {
      returns = [];
    }
    const { rows, grand } = buildPurchaseReturnRegisterData(returns);
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
      <div class="report-title">Purchase Return Register From ${getDateRangeLabel()}</div>
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
    openPrintWindow("Purchase Return Register", css, body);
  };

  const exportPurchaseReturnRegisterExcel = async () => {
    const XLSX = require("xlsx");
    let returns = [];
    try {
      returns = await fetchReturnsForRegister();
    } catch {
      returns = [];
    }
    const { rows, grand } = buildPurchaseReturnRegisterData(returns);
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
    const titleRow = [`Purchase Return Register - ${getDateRangeLabel()}`];
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
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Return Register");
    XLSX.writeFile(
      wb,
      `PurchaseReturnRegister_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // ── GSTR1 B2B for Purchase (Invoice-wise offline tool layout) ────────────
  const buildGSTR1B2BData = () => {
    const rows = [];
    filteredData.forEach((b) => {
      const items = parseItems(b.items);
      const invoiceNo = b.invoice_no || b.grn_number;
      const supplierName =
        b.vendor || b.vendor_name || b.vendor_company || b.vendor_id || "N/A";
      const gstin = b.vendor_gstin || b.gstin || "";
      const invoiceDate = formatDate(b.invoice_date || b.date);
      const invoiceValue = parseFloat(
        b.net_invoice_amount ?? b.total_amount ?? 0,
      );
      const stateOfSupply =
        b.state_of_supply || b.vendor_state || "Tamil Nadu";
      const isInterState = stateOfSupply.toLowerCase() !== "tamil nadu";
      const reverseCharge = b.reverse_charge || "N";

      if (items.length === 0) {
        const taxable = parseFloat(b.taxable_amount || 0);
        const cgst = parseFloat(b.cgst || 0);
        const sgst = parseFloat(b.sgst || 0);
        const igst = parseFloat(b.igst || (isInterState ? cgst + sgst : 0));
        const rate =
          taxable > 0 ? Math.round(((cgst + sgst + igst) / taxable) * 100) : 0;
        rows.push({
          invoiceNo,
          invoiceDateRaw: b.invoice_date || b.date,
          customerName: supplierName,
          gstin,
          invoiceDate,
          invoiceValue,
          taxRate: rate,
          taxableValue: taxable,
          igst: isInterState ? igst : 0,
          centralTax: isInterState ? 0 : cgst,
          stateTax: isInterState ? 0 : sgst,
          cess: 0,
          stateOfSupply,
          reverseCharge,
        });
        return;
      }

      const buckets = {};
      items.forEach((item) => {
        const { taxRate, taxable, cgst, sgst } = getItemTaxInfo(item);
        const key = getNumericBucketKey(taxRate);
        if (!buckets[key]) buckets[key] = { amount: 0, cgst: 0, sgst: 0 };
        buckets[key].amount += taxable;
        buckets[key].cgst += cgst;
        buckets[key].sgst += sgst;
      });

      Object.keys(buckets).forEach((key) => {
        const bucket = buckets[key];
        rows.push({
          invoiceNo,
          invoiceDateRaw: b.invoice_date || b.date,
          customerName: supplierName,
          gstin,
          invoiceDate,
          invoiceValue,
          taxRate: parseFloat(key),
          taxableValue: bucket.amount,
          igst: isInterState ? bucket.cgst + bucket.sgst : 0,
          centralTax: isInterState ? 0 : bucket.cgst,
          stateTax: isInterState ? 0 : bucket.sgst,
          cess: 0,
          stateOfSupply,
          reverseCharge,
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
      <div class="report-title">GSTR1 - B2B Invoices (Purchase) From ${getDateRangeLabel()}</div>
      <table>
        <thead>
          <tr>
            <th>Invoice No.</th><th>Supplier Name</th><th>GSTIN</th><th>Invoice Date</th>
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
      "Supplier Name",
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
    const titleRow = [`GSTR1_B2B (Purchase) - ${getDateRangeLabel()}`];
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
      `GSTR1_B2B_Purchase_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // ── GSTR1 HSN-wise Summary for Purchase ──────────────────────────────────
  const buildGSTR1HSNData = () => {
    const groups = {};
    filteredData.forEach((b) => {
      const items = parseItems(b.items);
      const stateOfSupply =
        b.state_of_supply || b.vendor_state || "Tamil Nadu";
      const isInterState = stateOfSupply.toLowerCase() !== "tamil nadu";
      items.forEach((item) => {
        const hsn = item.hsn || "N/A";
        const { qty, taxRate, taxable, cgst, sgst } = getItemTaxInfo(item);
        const rateKey = getNumericBucketKey(taxRate);
        const key = `${hsn}|${rateKey}`;
        if (!groups[key])
          groups[key] = {
            hsn,
            taxRate: parseFloat(rateKey),
            quantity: 0,
            taxableValue: 0,
            igst: 0,
            centralTax: 0,
            stateTax: 0,
            cess: 0,
          };
        groups[key].quantity += qty;
        groups[key].taxableValue += taxable;
        if (isInterState) groups[key].igst += cgst + sgst;
        else {
          groups[key].centralTax += cgst;
          groups[key].stateTax += sgst;
        }
      });
    });

    const rows = Object.values(groups).sort(
      (a, b) => a.hsn.localeCompare(b.hsn) || a.taxRate - b.taxRate,
    );

    const grand = rows.reduce(
      (acc, r) => ({
        quantity: acc.quantity + r.quantity,
        taxableValue: acc.taxableValue + r.taxableValue,
        igst: acc.igst + r.igst,
        centralTax: acc.centralTax + r.centralTax,
        stateTax: acc.stateTax + r.stateTax,
        cess: acc.cess + r.cess,
      }),
      {
        quantity: 0,
        taxableValue: 0,
        igst: 0,
        centralTax: 0,
        stateTax: 0,
        cess: 0,
      },
    );

    return { rows, grand };
  };

  const handleGSTR1HSNPrint = () => {
    const { rows, grand } = buildGSTR1HSNData();
    const fmt = (n) =>
      parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
    const fmtQ = (n) =>
      parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 });

    const tableRows = rows
      .map(
        (r) => `
      <tr>
        <td class="l">SURGICAL / IMPLANT</td>
        <td class="c">${r.hsn}</td>
        <td class="c">Numbers</td>
        <td class="r">${fmtQ(r.quantity)}</td>
        <td class="c">${r.taxRate}</td>
        <td class="r">${fmt(r.taxableValue)}</td>
        <td class="r">${r.igst > 0 ? fmt(r.igst) : ""}</td>
        <td class="r">${r.centralTax > 0 ? fmt(r.centralTax) : ""}</td>
        <td class="r">${r.stateTax > 0 ? fmt(r.stateTax) : ""}</td>
        <td class="r">${r.cess > 0 ? fmt(r.cess) : ""}</td>
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
      .section-row td{font-weight:bold;color:#1e40af;border:none;padding:4px 6px}
      .grand-row td{font-weight:bold;background:#d9ead3}
    `;
    const body = `
      <div class="report-title">GSTR1 - HSN Summary (Purchase) From ${getDateRangeLabel()}</div>
      <table>
        <thead>
          <tr>
            <th class="l">Description</th><th>HSN</th><th>Unit of measurement</th>
            <th>Total Quantity</th><th>Tax Rate(%)</th><th>Total Taxable Value</th>
            <th>IGST</th><th>Central Tax</th><th>State Tax</th><th>Cess</th>
          </tr>
        </thead>
        <tbody>
          <tr class="section-row"><td colspan="10">Registered Supplies</td></tr>
          ${tableRows}
          <tr class="grand-row">
            <td colspan="3" style="text-align:right">Grand Total</td>
            <td class="r">${fmtQ(grand.quantity)}</td>
            <td></td>
            <td class="r">${fmt(grand.taxableValue)}</td>
            <td class="r">${fmt(grand.igst)}</td>
            <td class="r">${fmt(grand.centralTax)}</td>
            <td class="r">${fmt(grand.stateTax)}</td>
            <td class="r">${fmt(grand.cess)}</td>
          </tr>
        </tbody>
      </table>`;
    openPrintWindow("GSTR1_HSN_wise", css, body);
  };

  const exportGSTR1HSNExcel = () => {
    const XLSX = require("xlsx");
    const { rows, grand } = buildGSTR1HSNData();
    const f = (n) => parseFloat((n || 0).toFixed(2));
    const fQ = (n) => parseFloat((n || 0).toFixed(0));

    const header = [
      "Description",
      "HSN",
      "Unit of measurement",
      "Total Quantity",
      "Tax Rate(%)",
      "Total Taxable Value",
      "IGST",
      "Central Tax",
      "State Tax",
      "Cess",
    ];
    const sectionRow = ["Registered Supplies", "", "", "", "", "", "", "", "", ""];
    const dataRows = rows.map((r) => [
      "SURGICAL / IMPLANT",
      r.hsn,
      "Numbers",
      fQ(r.quantity),
      r.taxRate,
      f(r.taxableValue),
      r.igst > 0 ? f(r.igst) : "",
      r.centralTax > 0 ? f(r.centralTax) : "",
      r.stateTax > 0 ? f(r.stateTax) : "",
      r.cess > 0 ? f(r.cess) : "",
    ]);
    const grandRow = [
      "Grand Total",
      "",
      "",
      fQ(grand.quantity),
      "",
      f(grand.taxableValue),
      f(grand.igst),
      f(grand.centralTax),
      f(grand.stateTax),
      f(grand.cess),
    ];
    const titleRow = [`GSTR1_HSN_wise (Purchase) - ${getDateRangeLabel()}`];
    const wsData = [titleRow, [], header, sectionRow, ...dataRows, grandRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } },
    ];
    ws["!cols"] = [
      { wch: 22 },
      { wch: 14 },
      { wch: 20 },
      { wch: 14 },
      { wch: 12 },
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GSTR1_HSN_wise");
    XLSX.writeFile(
      wb,
      `GSTR1_HSN_wise_Purchase_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // ── GSTR1 Doc Issued Summary for Purchase ────────────────────────────────
  const buildGSTR1DocsData = () => {
    const nums = filteredData
      .map((b) => b.grn_number || b.invoice_no)
      .filter(Boolean)
      .sort();
    const totalCount = filteredData.length;
    const cancelled = 0;
    const netIssued = totalCount - cancelled;
    return {
      rows: [
        {
          particulars: "Invoices for inward supplies (GRN)",
          slNoFrom: nums[0] || "N/A",
          slNoTo: nums[nums.length - 1] || "N/A",
          totalCount,
          cancelled,
          netIssued,
        },
      ],
    };
  };

  const handleGSTR1DocsPrint = () => {
    const { rows } = buildGSTR1DocsData();

    const tableRows = rows
      .map(
        (r) => `
      <tr>
        <td class="l">${r.particulars}</td>
        <td class="c">${r.slNoFrom}</td>
        <td class="c">${r.slNoTo}</td>
        <td class="r">${r.totalCount}</td>
        <td class="r">${r.cancelled}</td>
        <td class="r">${r.netIssued}</td>
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
      .section-row td{font-weight:bold;color:#1e40af;border:none;padding:4px 6px}
    `;
    const body = `
      <div class="report-title">GSTR1 - Documents Issued Summary (Purchase) From ${getDateRangeLabel()}</div>
      <table>
        <thead>
          <tr>
            <th style="text-align:left">Particulars</th><th>Sl. No. From</th><th>Sl. No. To</th>
            <th>Total count</th><th>Cancelled</th><th>Net issued</th>
          </tr>
        </thead>
        <tbody>
          <tr class="section-row"><td colspan="6">Nature of document</td></tr>
          ${tableRows}
        </tbody>
      </table>`;
    openPrintWindow("GSTR1_Docs", css, body);
  };

  const exportGSTR1DocsExcel = () => {
    const XLSX = require("xlsx");
    const { rows } = buildGSTR1DocsData();

    const header = [
      "Particulars",
      "Sl. No. From",
      "Sl. No. To",
      "Total count",
      "Cancelled",
      "Net issued",
    ];
    const sectionRow = ["Nature of document", "", "", "", "", ""];
    const dataRows = rows.map((r) => [
      r.particulars,
      r.slNoFrom,
      r.slNoTo,
      r.totalCount,
      r.cancelled,
      r.netIssued,
    ]);
    const titleRow = [`GSTR1_Docs (Purchase) - ${getDateRangeLabel()}`];
    const wsData = [titleRow, [], header, sectionRow, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
    ws["!cols"] = [
      { wch: 32 },
      { wch: 16 },
      { wch: 16 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GSTR1_Docs");
    XLSX.writeFile(
      wb,
      `GSTR1_Docs_Purchase_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
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
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {canPurP && (
            <div ref={reportDropdownRef} style={dropdownWrap}>
              <Button
                style={{
                  background: "#0891b2",
                  borderColor: "#0891b2",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
                onClick={toggleReportDropdown}
              >
                <Printer size={14} /> Report{" "}
                <span style={{ fontSize: "0.7rem" }}>▾</span>
              </Button>
            </div>
          )}

          {canPurP &&
            showReportDropdown &&
            createPortal(
              <div
                ref={reportMenuRef}
                style={{
                  ...dropdownMenu,
                  position: "fixed",
                  top: reportMenuPos.top,
                  left: reportMenuPos.left,
                }}
              >
                <button
                  style={dropdownItem}
                  onClick={() => {
                    handlePurchasePrint();
                    setShowReportDropdown(false);
                  }}
                >
                  <Printer size={14} color="#7c3aed" /> Purchase Report
                </button>
                <button
                  style={dropdownItem}
                  onClick={() => {
                    handlePurchaseTaxRegisterPrint();
                    setShowReportDropdown(false);
                  }}
                >
                  <Printer size={14} color="#0891b2" /> Purchase Tax Register
                </button>
                <button
                  style={dropdownItem}
                  onClick={() => {
                    handlePurchaseReturnRegisterPrint();
                    setShowReportDropdown(false);
                  }}
                >
                  <RotateCcw size={14} color="#dc2626" /> Purchase Return Register
                </button>
                <button
                  style={dropdownItem}
                  onClick={() => {
                    handleGSTR1B2BPrint();
                    setShowReportDropdown(false);
                  }}
                >
                  <Printer size={14} color="#b45309" /> GSTR1_B2B
                </button>
                <button
                  style={dropdownItem}
                  onClick={() => {
                    handleGSTR1HSNPrint();
                    setShowReportDropdown(false);
                  }}
                >
                  <Printer size={14} color="#059669" /> GSTR1_HSN_wise
                </button>
                <button
                  style={dropdownItemLast}
                  onClick={() => {
                    handleGSTR1DocsPrint();
                    setShowReportDropdown(false);
                  }}
                >
                  <Printer size={14} color="#4338ca" /> GSTR1_Docs
                </button>
              </div>,
              document.body,
            )}

          {canPurP && (
            <div ref={exportDropdownRef} style={dropdownWrap}>
              <Button
                success
                onClick={toggleExportDropdown}
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
            </div>
          )}

          {canPurP &&
            showExportDropdown &&
            createPortal(
              <div
                ref={exportMenuRef}
                style={{
                  ...dropdownMenu,
                  position: "fixed",
                  top: exportMenuPos.top,
                  left: exportMenuPos.left,
                }}
              >
                <button
                  style={dropdownItem}
                  onClick={() => {
                    exportToExcel();
                    setShowExportDropdown(false);
                  }}
                >
                  <Download size={14} color="#7c3aed" /> Purchase Report
                </button>
                <button
                  style={dropdownItem}
                  onClick={() => {
                    exportPurchaseTaxRegisterExcel();
                    setShowExportDropdown(false);
                  }}
                >
                  <Download size={14} color="#0891b2" /> Purchase Tax Register
                </button>
                <button
                  style={dropdownItem}
                  onClick={() => {
                    exportPurchaseReturnRegisterExcel();
                    setShowExportDropdown(false);
                  }}
                >
                  <Download size={14} color="#dc2626" /> Purchase Return Register
                </button>
                <button
                  style={dropdownItem}
                  onClick={() => {
                    exportGSTR1B2BExcel();
                    setShowExportDropdown(false);
                  }}
                >
                  <Download size={14} color="#b45309" /> GSTR1_B2B
                </button>
                <button
                  style={dropdownItem}
                  onClick={() => {
                    exportGSTR1HSNExcel();
                    setShowExportDropdown(false);
                  }}
                >
                  <Download size={14} color="#059669" /> GSTR1_HSN_wise
                </button>
                <button
                  style={dropdownItemLast}
                  onClick={() => {
                    exportGSTR1DocsExcel();
                    setShowExportDropdown(false);
                  }}
                >
                  <Download size={14} color="#4338ca" /> GSTR1_Docs
                </button>
              </div>,
              document.body,
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
              <div style={{ marginTop: 14 }}>
                <Label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
                  Remarks <span style={{ color: "#dc2626" }}>*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter purchase return remarks / reason"
                  value={returnRemarks}
                  onChange={(e) => setReturnRemarks(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
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
      <ToastContainer position="top-right" autoClose={1500} />
    </Container>
  );
};

export default InvoiceReport;
