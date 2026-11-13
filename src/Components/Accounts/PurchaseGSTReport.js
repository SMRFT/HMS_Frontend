import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import { DatePicker, Select, Input as AntInput } from "antd";
import {
  Search,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  FileText,
  Layers,
  Calendar,
  Tag,
  Boxes
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";

// ── Styled Components ────────────────────────────────────────────────────────
const PageContainer = styled.div`
  padding: ${(props) => (props.$isModal ? "12px 16px" : "24px")};
  background: #f8fafc;
  min-height: ${(props) => (props.$isModal ? "auto" : "100vh")};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1e293b;

  @media print {
    padding: 0;
    background: #ffffff;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;

  @media print {
    margin-bottom: 12px;
  }
`;

const TitleArea = styled.div`
  h1 {
    font-size: 1.55rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  p {
    font-size: 0.86rem;
    color: #64748b;
    margin: 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  @media print {
    display: none;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  border: 1px solid transparent;

  ${(props) =>
    props.$variant === "primary"
      ? `
    background: #0d9488;
    color: #ffffff;
    box-shadow: 0 2px 4px rgba(13, 148, 136, 0.2);
    &:hover:not(:disabled) { background: #0f766e; }
  `
      : props.$variant === "excel"
      ? `
    background: #107c41;
    color: #ffffff;
    box-shadow: 0 2px 4px rgba(16, 124, 65, 0.2);
    &:hover:not(:disabled) { background: #0c6133; }
  `
      : `
    background: #ffffff;
    color: #334155;
    border-color: #cbd5e1;
    &:hover:not(:disabled) { background: #f1f5f9; border-color: #94a3b8; }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FilterCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-end;

  @media print {
    display: none;
  }
`;

const FilterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: ${(props) => props.$minWidth || "160px"};
  flex: ${(props) => props.$flex || "none"};

  label {
    font-size: 0.78rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;

const TableCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  @media print {
    border: none;
    box-shadow: none;
  }
`;

const TableResponsive = styled.div`
  overflow-x: auto;
  max-height: 720px;

  @media print {
    overflow-x: visible;
    max-height: none;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  text-align: left;

  th {
    background: #0f766e;
    color: #ffffff;
    font-weight: 700;
    padding: 10px 12px;
    border-bottom: 1px solid #0d9488;
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  td {
    padding: 9px 12px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    white-space: nowrap;
  }

  tr:hover td {
    background: #f0fdfa;
  }

  tr:nth-child(even) td {
    background: #fafafa;
  }

  tr:nth-child(even):hover td {
    background: #f0fdfa;
  }

  tfoot td {
    background: #f8fafc;
    font-weight: 800;
    color: #0f172a;
    border-top: 2px solid #cbd5e1;
    position: sticky;
    bottom: 0;
    z-index: 1;
  }
`;

const SourceTag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  ${(props) =>
    props.$type === "Drug Purchase"
      ? "background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;"
      : "background: #fef3c7; color: #b45309; border: 1px solid #fde68a;"}
`;

const PrintHeader = styled.div`
  display: none;

  @media print {
    display: block;
    text-align: center;
    border-bottom: 2px solid #0f766e;
    padding-bottom: 12px;
    margin-bottom: 16px;

    h2 {
      margin: 0;
      color: #0f766e;
      font-size: 1.3rem;
      font-weight: 800;
    }

    h3 {
      margin: 2px 0;
      color: #334155;
      font-size: 1rem;
      font-weight: 700;
    }

    p {
      margin: 2px 0;
      color: #64748b;
      font-size: 0.8rem;
    }
  }
`;

// ── Master Component ────────────────────────────────────────────────────────
export default function PurchaseGSTReport({
  isModalView = false,
  startDate,
  endDate,
  defaultSourceType,
  defaultTab,
}) {
  const HMS_URL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const location = useLocation();

  // Route-based auto configuration
  const pathname = location?.pathname || "";
  const queryParams = useMemo(() => new URLSearchParams(location?.search || ""), [location?.search]);
  const urlSource = queryParams.get("source");
  const urlTab = queryParams.get("tab");

  // Determine initial scope & tab from path, prop, or query param
  const routeConfig = useMemo(() => {
    const p = pathname.toLowerCase();
    if (p.includes("drug") && p.includes("b2b")) return { scope: "drug", tab: "b2b" };
    if (p.includes("drug") && p.includes("hsn")) return { scope: "drug", tab: "hsn" };
    if (p.includes("drug") && (p.includes("doc") || p.includes("summary"))) return { scope: "drug", tab: "docs" };
    if (p.includes("store") && p.includes("b2b")) return { scope: "stores", tab: "b2b" };
    if (p.includes("store") && p.includes("hsn")) return { scope: "stores", tab: "hsn" };
    if (p.includes("store") && (p.includes("doc") || p.includes("summary"))) return { scope: "stores", tab: "docs" };

    const sc = defaultSourceType || urlSource || "all";
    const tb = defaultTab || urlTab || "b2b";
    return {
      scope: ["drug", "stores", "all"].includes(sc) ? sc : "all",
      tab: ["b2b", "hsn", "docs"].includes(tb) ? tb : "b2b",
    };
  }, [pathname, defaultSourceType, defaultTab, urlSource, urlTab]);

  // ── States ──────────────────────────────────────────────────────────────
  const [sourceType, setSourceType] = useState(routeConfig.scope); // "drug" | "stores" | "all"
  const [activeTab, setActiveTab] = useState(routeConfig.tab); // "b2b" | "hsn" | "docs"
  const [fromDate, setFromDate] = useState(() => (startDate ? dayjs(startDate) : dayjs().startOf("month")));
  const [toDate, setToDate] = useState(() => (endDate ? dayjs(endDate) : dayjs()));
  const [taxRateFilter, setTaxRateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    summary: {},
    b2b_data: [],
    hsn_data: [],
    docs_data: [],
  });

  // Keep state synced when route changes
  useEffect(() => {
    setSourceType(routeConfig.scope);
    setActiveTab(routeConfig.tab);
  }, [routeConfig]);

  // ── Fetch Report from Backend ───────────────────────────────────────────
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("from_date", fromDate.format("YYYY-MM-DD"));
      if (toDate) params.append("to_date", toDate.format("YYYY-MM-DD"));
      params.append("source_type", "all");
      if (taxRateFilter !== "all") params.append("tax_rate", taxRateFilter);
      if (searchTerm) params.append("search", searchTerm);

      const res = await apiRequest(`${HMS_URL}purchase-gst-report/?${params.toString()}`, "GET");

      const payload =
        res?.data && typeof res.data === "object" && ("b2b_data" in res.data || "summary" in res.data)
          ? res.data
          : res && typeof res === "object" && ("b2b_data" in res || "summary" in res)
          ? res
          : res?.data || {};

      if (res?.success || payload?.success || Array.isArray(payload?.b2b_data)) {
        setReportData({
          summary: payload.summary || {},
          b2b_data: Array.isArray(payload.b2b_data) ? payload.b2b_data : [],
          hsn_data: Array.isArray(payload.hsn_data) ? payload.hsn_data : [],
          docs_data: Array.isArray(payload.docs_data) ? payload.docs_data : [],
        });
      } else {
        toast.error(res?.error || payload?.error || res?.message || "Failed to load Purchase GST report.");
      }
    } catch (err) {
      console.error("Error fetching purchase GST report:", err);
      toast.error("Network error while fetching Purchase GST report.");
    } finally {
      setLoading(false);
    }
  }, [HMS_URL, fromDate, toDate, taxRateFilter, searchTerm]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // ── Scoped Dataset (Filtered by Drug Purchase vs General Stores vs All) ───
  const scopedData = useMemo(() => {
    const rawB2B = reportData.b2b_data || [];
    const rawHSN = reportData.hsn_data || [];
    const rawDocs = reportData.docs_data || [];

    let b2b = rawB2B;
    let hsn = rawHSN;
    let docs = rawDocs;

    if (sourceType === "drug") {
      b2b = rawB2B.filter((r) => r.source_type === "Drug Purchase");
      hsn = rawHSN.filter((r) => r.source_type === "Drug Purchase");
      docs = rawDocs.filter((r) => (r.particulars || "").includes("Drug Purchase"));
    } else if (sourceType === "stores") {
      b2b = rawB2B.filter((r) => r.source_type === "General Stores");
      hsn = rawHSN.filter((r) => r.source_type === "General Stores");
      docs = rawDocs.filter((r) => (r.particulars || "").includes("General Stores"));
    }

    return { b2b, hsn, docs };
  }, [reportData, sourceType]);

  // ── Filtered Views with Tax Rate & Search ────────────────────────────────
  const filteredB2B = useMemo(() => {
    let list = scopedData.b2b;
    if (taxRateFilter !== "all") {
      const target = parseFloat(taxRateFilter);
      list = list.filter((r) => Math.abs(r.tax_rate - target) < 0.01);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          (r.invoice_no && r.invoice_no.toLowerCase().includes(q)) ||
          (r.customer_name && r.customer_name.toLowerCase().includes(q)) ||
          (r.gstin && r.gstin.toLowerCase().includes(q)) ||
          (r.grn_number && r.grn_number.toLowerCase().includes(q))
      );
    }
    return list;
  }, [scopedData.b2b, taxRateFilter, searchTerm]);

  const filteredHSN = useMemo(() => {
    let list = scopedData.hsn;
    if (taxRateFilter !== "all") {
      const target = parseFloat(taxRateFilter);
      list = list.filter((r) => Math.abs(r.tax_rate - target) < 0.01);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          (r.hsn && r.hsn.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [scopedData.hsn, taxRateFilter, searchTerm]);

  // ── Calculated Totals for Footers ───────────────────────────────────────
  const b2bTotals = useMemo(() => {
    return filteredB2B.reduce(
      (acc, r) => ({
        taxable: acc.taxable + (r.taxable_value || 0),
        cgst: acc.cgst + (r.cgst || 0),
        sgst: acc.sgst + (r.sgst || 0),
        igst: acc.igst + (r.igst || 0),
        invoiceValue: acc.invoiceValue + (r.invoice_value || 0),
      }),
      { taxable: 0, cgst: 0, sgst: 0, igst: 0, invoiceValue: 0 }
    );
  }, [filteredB2B]);

  const hsnTotals = useMemo(() => {
    return filteredHSN.reduce(
      (acc, r) => ({
        qty: acc.qty + (r.total_quantity || 0),
        taxable: acc.taxable + (r.taxable_value || 0),
        cgst: acc.cgst + (r.cgst || 0),
        sgst: acc.sgst + (r.sgst || 0),
        igst: acc.igst + (r.igst || 0),
      }),
      { qty: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0 }
    );
  }, [filteredHSN]);

  // ── Excel Export (Matches Winman CA-ERP Templates specifically for the active page) ──
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const scopePrefix = sourceType === "drug" ? "Drug" : sourceType === "stores" ? "Store" : "Consolidated";

    if (activeTab === "b2b") {
      if (!filteredB2B.length) {
        toast.warn("No B2B data available to export.");
        return;
      }
      const b2bHeaders = [
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
        "GRN No."
      ];
      const b2bRows = filteredB2B.map((r) => [
        r.invoice_no || "",
        r.customer_name || "",
        r.gstin || "",
        r.invoice_date || "",
        r.invoice_value || 0,
        r.tax_rate || 0,
        r.taxable_value || 0,
        r.igst || "",
        r.cgst || 0,
        r.sgst || 0,
        r.cess || "",
        r.state_of_supply || "Tamil Nadu",
        r.reverse_charge || "N",
        r.grn_number || ""
      ]);
      const ws = XLSX.utils.aoa_to_sheet([b2bHeaders, ...b2bRows]);
      XLSX.utils.book_append_sheet(wb, ws, "B2B");

      const fileName = `${scopePrefix}_B2B_Invoices_${fromDate.format("YYYYMMDD")}_to_${toDate.format("YYYYMMDD")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Exported ${fileName} successfully!`);
      return;
    }

    if (activeTab === "hsn") {
      if (!filteredHSN.length) {
        toast.warn("No HSN data available to export.");
        return;
      }
      const hsnHeaders = [
        "Description",
        "HSN",
        "Unit of measurement",
        "Total Quantity",
        "Tax Rate (%)",
        "Total Taxable Value",
        "IGST",
        "Central Tax",
        "State Tax",
        "Cess"
      ];
      const hsnRows = filteredHSN.map((r) => [
        r.description || "",
        r.hsn || "",
        r.uom || "Numbers",
        r.total_quantity || 0,
        r.tax_rate || 0,
        r.taxable_value || 0,
        r.igst || "",
        r.cgst || 0,
        r.sgst || 0,
        r.cess || ""
      ]);
      const ws = XLSX.utils.aoa_to_sheet([hsnHeaders, ...hsnRows]);
      XLSX.utils.book_append_sheet(wb, ws, "HSN - regd. supplies");

      const fileName = `${scopePrefix}_HSN_Summary_${fromDate.format("YYYYMMDD")}_to_${toDate.format("YYYYMMDD")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Exported ${fileName} successfully!`);
      return;
    }

    if (activeTab === "docs") {
      if (!scopedData.docs.length) {
        toast.warn("No document summary available to export.");
        return;
      }
      const docsHeaders = [
        "Particulars",
        "Sl. No. From",
        "Sl. No. To",
        "Total count",
        "Cancelled",
        "Net issued"
      ];
      const docsRows = scopedData.docs.map((r) => [
        r.particulars || "",
        r.sl_no_from || "",
        r.sl_no_to || "",
        r.total_count || 0,
        r.cancelled || 0,
        r.net_issued || 0
      ]);
      const ws = XLSX.utils.aoa_to_sheet([docsHeaders, ...docsRows]);
      XLSX.utils.book_append_sheet(wb, ws, "Documents");

      const fileName = `${scopePrefix}_Document_Summary_${fromDate.format("YYYYMMDD")}_to_${toDate.format("YYYYMMDD")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Exported ${fileName} successfully!`);
      return;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Human-readable titles according to active page
  const getPageTitle = () => {
    const scopePrefix = sourceType === "drug" ? "Drug Purchase (Pharmacy)" : sourceType === "stores" ? "General Stores" : "Consolidated";
    if (activeTab === "b2b") return `${scopePrefix} - B2B Invoices`;
    if (activeTab === "hsn") return `${scopePrefix} - HSN Wise Summary`;
    return `${scopePrefix} - Document Summary`;
  };

  const getPageIcon = () => {
    if (activeTab === "hsn") return <Boxes color="#0d9488" size={26} />;
    if (activeTab === "docs") return <Layers color="#0d9488" size={26} />;
    return <FileText color="#0d9488" size={26} />;
  };

  return (
    <PageContainer $isModal={isModalView}>
      {/* ── Print Header ────────────────────────────────────────────── */}
      <PrintHeader>
        <h2>SHANMUGA HOSPITAL</h2>
        <h3>{getPageTitle().toUpperCase()}</h3>
        <p>
          Period: {fromDate.format("DD/MM/YYYY")} to {toDate.format("DD/MM/YYYY")} | Winman CA-ERP GSTR-1 Format
        </p>
      </PrintHeader>

      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <HeaderSection>
        <TitleArea>
          <h1>
            {getPageIcon()}
            {getPageTitle()}
          </h1>
          <p>
            Winman CA-ERP GSTR-1 purchase register report for <strong>{sourceType === "drug" ? "Drug Purchase" : sourceType === "stores" ? "General Stores" : "All Purchases"}</strong>.
          </p>
        </TitleArea>

        <ActionButtons>
          <Button onClick={fetchReport} disabled={loading}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
          <Button $variant="excel" onClick={handleExportExcel} disabled={loading}>
            <FileSpreadsheet size={15} /> Export Winman Excel ({activeTab.toUpperCase()})
          </Button>
          <Button $variant="primary" onClick={handlePrint} disabled={loading}>
            <Printer size={15} /> Print Report
          </Button>
        </ActionButtons>
      </HeaderSection>

      {/* ── Filter Bar ──────────────────────────────────────────────── */}
      <FilterCard>
        <FilterItem $minWidth="130px">
          <label>
            <Calendar size={13} /> From Date
          </label>
          <DatePicker
            value={fromDate}
            onChange={(d) => setFromDate(d)}
            format="DD/MM/YYYY"
            allowClear={false}
            style={{ width: "100%", height: 38 }}
          />
        </FilterItem>

        <FilterItem $minWidth="130px">
          <label>
            <Calendar size={13} /> To Date
          </label>
          <DatePicker
            value={toDate}
            onChange={(d) => setToDate(d)}
            format="DD/MM/YYYY"
            allowClear={false}
            style={{ width: "100%", height: 38 }}
          />
        </FilterItem>

        {activeTab !== "docs" && (
          <FilterItem $minWidth="120px">
            <label>
              <Tag size={13} /> Tax Rate
            </label>
            <Select
              value={taxRateFilter}
              onChange={(val) => setTaxRateFilter(val)}
              style={{ width: "100%", height: 38 }}
              options={[
                { value: "all", label: "All Rates" },
                { value: "0", label: "0% (Exempt)" },
                { value: "5", label: "5%" },
                { value: "12", label: "12%" },
                { value: "18", label: "18%" },
                { value: "28", label: "28%" },
              ]}
            />
          </FilterItem>
        )}

        <FilterItem $flex="1" $minWidth="200px">
          <label>
            <Search size={13} /> Quick Search
          </label>
          <AntInput
            placeholder={
              activeTab === "hsn"
                ? "Search Description, HSN Code..."
                : activeTab === "docs"
                ? "Search Document Particulars, Series..."
                : "Search Invoice No, Vendor Name, GSTIN, GRN..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ height: 38 }}
          />
        </FilterItem>
      </FilterCard>

      {/* ── Table Content ─────────────────────────────────────────────── */}
      <TableCard>
        <TableResponsive>
          {/* TAB 1: B2B Purchase Invoices */}
          {activeTab === "b2b" && (
            <StyledTable>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Invoice No.</th>
                  <th>Customer Name / Vendor</th>
                  <th>GSTIN</th>
                  <th>Invoice Date</th>
                  <th style={{ textAlign: "right" }}>Invoice Value</th>
                  <th style={{ textAlign: "center" }}>Tax Rate(%)</th>
                  <th style={{ textAlign: "right" }}>Taxable Value</th>
                  <th style={{ textAlign: "right" }}>IGST</th>
                  <th style={{ textAlign: "right" }}>Central Tax (CGST)</th>
                  <th style={{ textAlign: "right" }}>State Tax (SGST)</th>
                  <th style={{ textAlign: "right" }}>Cess</th>
                  <th>State of Supply</th>
                  <th style={{ textAlign: "center" }}>Reverse Charge</th>
                  <th>GRN No.</th>
                </tr>
              </thead>
              <tbody>
                {filteredB2B.length === 0 ? (
                  <tr>
                    <td colSpan={15} style={{ textAlign: "center", padding: "36px 12px", color: "#64748b" }}>
                      {loading
                        ? "Loading purchase records..."
                        : `No ${sourceType === "drug" ? "Drug Purchase" : sourceType === "stores" ? "General Stores" : ""} B2B invoices found for the selected criteria.`}
                    </td>
                  </tr>
                ) : (
                  filteredB2B.map((r, idx) => (
                    <tr key={r.id || idx}>
                      <td style={{ color: "#94a3b8" }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: "#0f172a" }}>{r.invoice_no}</td>
                      <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }} title={r.customer_name}>
                        {r.customer_name}
                      </td>
                      <td style={{ fontFamily: "monospace", color: "#0f766e", fontWeight: 600 }}>{r.gstin || "-"}</td>
                      <td>{r.invoice_date}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>
                        ₹{Number(r.invoice_value || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                          {r.tax_rate}%
                        </span>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        ₹{Number(r.taxable_value || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right", color: r.igst ? "#0284c7" : "#94a3b8" }}>
                        {r.igst ? `₹${Number(r.igst).toFixed(2)}` : "-"}
                      </td>
                      <td style={{ textAlign: "right", color: "#10b981", fontWeight: 600 }}>
                        ₹{Number(r.cgst || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right", color: "#f59e0b", fontWeight: 600 }}>
                        ₹{Number(r.sgst || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right", color: "#94a3b8" }}>
                        {r.cess ? `₹${Number(r.cess).toFixed(2)}` : "-"}
                      </td>
                      <td>{r.state_of_supply || "Tamil Nadu"}</td>
                      <td style={{ textAlign: "center" }}>{r.reverse_charge || "N"}</td>
                      <td style={{ color: "#475569" }}>{r.grn_number || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredB2B.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={5} style={{ textAlign: "right" }}>
                      TOTAL ({filteredB2B.length} entries):
                    </td>
                    <td style={{ textAlign: "right" }}>₹{b2bTotals.invoiceValue.toFixed(2)}</td>
                    <td></td>
                    <td style={{ textAlign: "right" }}>₹{b2bTotals.taxable.toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>
                      {b2bTotals.igst > 0 ? `₹${b2bTotals.igst.toFixed(2)}` : "-"}
                    </td>
                    <td style={{ textAlign: "right", color: "#10b981" }}>₹{b2bTotals.cgst.toFixed(2)}</td>
                    <td style={{ textAlign: "right", color: "#f59e0b" }}>₹{b2bTotals.sgst.toFixed(2)}</td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              )}
            </StyledTable>
          )}

          {/* TAB 2: HSN Wise Summary */}
          {activeTab === "hsn" && (
            <StyledTable>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>HSN Code</th>
                  <th>Unit of Measurement (UOM)</th>
                  <th style={{ textAlign: "right" }}>Total Quantity</th>
                  <th style={{ textAlign: "center" }}>Tax Rate (%)</th>
                  <th style={{ textAlign: "right" }}>Total Taxable Value</th>
                  <th style={{ textAlign: "right" }}>IGST</th>
                  <th style={{ textAlign: "right" }}>Central Tax (CGST)</th>
                  <th style={{ textAlign: "right" }}>State Tax (SGST)</th>
                  <th style={{ textAlign: "right" }}>Cess</th>
                </tr>
              </thead>
              <tbody>
                {filteredHSN.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: "center", padding: "36px 12px", color: "#64748b" }}>
                      {loading
                        ? "Loading HSN records..."
                        : `No ${sourceType === "drug" ? "Drug Purchase" : sourceType === "stores" ? "General Stores" : ""} HSN data found for the selected criteria.`}
                    </td>
                  </tr>
                ) : (
                  filteredHSN.map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ color: "#94a3b8" }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: "#0f172a" }}>{r.description}</td>
                      <td style={{ fontFamily: "monospace", color: "#0f766e", fontWeight: 700 }}>{r.hsn || "-"}</td>
                      <td>{r.uom || "Numbers"}</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{r.total_quantity}</td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                          {r.tax_rate}%
                        </span>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>
                        ₹{Number(r.taxable_value || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right", color: r.igst ? "#0284c7" : "#94a3b8" }}>
                        {r.igst ? `₹${Number(r.igst).toFixed(2)}` : "-"}
                      </td>
                      <td style={{ textAlign: "right", color: "#10b981", fontWeight: 600 }}>
                        ₹{Number(r.cgst || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right", color: "#f59e0b", fontWeight: 600 }}>
                        ₹{Number(r.sgst || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right", color: "#94a3b8" }}>
                        {r.cess ? `₹${Number(r.cess).toFixed(2)}` : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredHSN.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: "right" }}>
                      TOTAL ({filteredHSN.length} HSN items):
                    </td>
                    <td style={{ textAlign: "right" }}>{hsnTotals.qty.toFixed(2)}</td>
                    <td></td>
                    <td style={{ textAlign: "right" }}>₹{hsnTotals.taxable.toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>
                      {hsnTotals.igst > 0 ? `₹${hsnTotals.igst.toFixed(2)}` : "-"}
                    </td>
                    <td style={{ textAlign: "right", color: "#10b981" }}>₹{hsnTotals.cgst.toFixed(2)}</td>
                    <td style={{ textAlign: "right", color: "#f59e0b" }}>₹{hsnTotals.sgst.toFixed(2)}</td>
                    <td colSpan={1}></td>
                  </tr>
                </tfoot>
              )}
            </StyledTable>
          )}

          {/* TAB 3: Document Summary (Docs) */}
          {activeTab === "docs" && (
            <StyledTable>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Particulars / Nature of Document</th>
                  <th>Sl. No. From</th>
                  <th>Sl. No. To</th>
                  <th style={{ textAlign: "right" }}>Total Count</th>
                  <th style={{ textAlign: "right" }}>Cancelled</th>
                  <th style={{ textAlign: "right" }}>Net Issued / Processed</th>
                </tr>
              </thead>
              <tbody>
                {scopedData.docs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "36px 12px", color: "#64748b" }}>
                      {loading
                        ? "Loading documents summary..."
                        : `No document summary available for ${sourceType === "drug" ? "Drug Purchase" : sourceType === "stores" ? "General Stores" : "Purchases"}.`}
                    </td>
                  </tr>
                ) : (
                  scopedData.docs.map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ color: "#94a3b8" }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: "#0f172a" }}>{r.particulars}</td>
                      <td style={{ fontFamily: "monospace", color: "#0284c7", fontWeight: 600 }}>{r.sl_no_from}</td>
                      <td style={{ fontFamily: "monospace", color: "#0284c7", fontWeight: 600 }}>{r.sl_no_to}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>{r.total_count}</td>
                      <td style={{ textAlign: "right", color: r.cancelled > 0 ? "#ef4444" : "#94a3b8" }}>
                        {r.cancelled}
                      </td>
                      <td style={{ textAlign: "right", color: "#10b981", fontWeight: 800 }}>{r.net_issued}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </StyledTable>
          )}
        </TableResponsive>
      </TableCard>
    </PageContainer>
  );
}

// ── 6 Dedicated Exported Components for Standalone Routes & Modals ───────────
export const DrugB2BReport = (props) => (
  <PurchaseGSTReport {...props} defaultSourceType="drug" defaultTab="b2b" />
);

export const DrugHSNReport = (props) => (
  <PurchaseGSTReport {...props} defaultSourceType="drug" defaultTab="hsn" />
);

export const DrugDocsReport = (props) => (
  <PurchaseGSTReport {...props} defaultSourceType="drug" defaultTab="docs" />
);

export const StoreB2BReport = (props) => (
  <PurchaseGSTReport {...props} defaultSourceType="stores" defaultTab="b2b" />
);

export const StoreHSNReport = (props) => (
  <PurchaseGSTReport {...props} defaultSourceType="stores" defaultTab="hsn" />
);

export const StoreDocsReport = (props) => (
  <PurchaseGSTReport {...props} defaultSourceType="stores" defaultTab="docs" />
);
