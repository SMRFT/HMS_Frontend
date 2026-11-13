import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import {
  FileText,
  Boxes,
  Layers,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  Calendar,
  Percent,
  CheckCircle,
  Hash,
  CreditCard,
  User,
} from "lucide-react";
import styled from "styled-components";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";

// ── Styled Components ────────────────────────────────────────────────────────
const PageContainer = styled.div`
  padding: ${(props) => (props.$isModal ? "8px" : "24px")};
  background: #f8fafc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1e293b;

  @media print {
    padding: 0;
    background: #ffffff;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;

  @media print {
    margin-bottom: 12px;
  }
`;

const TitleBlock = styled.div`
  h1 {
    font-size: 1.65rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  p {
    margin: 4px 0 0 0;
    color: #64748b;
    font-size: 0.88rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;

  @media print {
    display: none;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  ${(props) => {
    switch (props.$variant) {
      case "primary":
        return `
          background: #0f766e;
          color: #ffffff;
          &:hover { background: #115e59; }
        `;
      case "excel":
        return `
          background: #16a34a;
          color: #ffffff;
          &:hover { background: #15803d; }
        `;
      case "outline":
      default:
        return `
          background: #ffffff;
          color: #334155;
          border-color: #cbd5e1;
          &:hover { background: #f1f5f9; border-color: #94a3b8; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const TabNav = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media print {
    display: none;
  }
`;

const TabItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: transparent;
  border: none;
  border-bottom: 3px solid ${(props) => (props.$active ? "#0f766e" : "transparent")};
  color: ${(props) => (props.$active ? "#0f766e" : "#64748b")};
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  font-size: 0.92rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -2px;

  &:hover {
    color: #0f766e;
    background: #f0fdfa;
  }

  .badge {
    background: ${(props) => (props.$active ? "#ccfbf1" : "#f1f5f9")};
    color: ${(props) => (props.$active ? "#0f766e" : "#64748b")};
    padding: 2px 7px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 700;
  }
`;

const FilterCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  @media print {
    display: none;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  input,
  select {
    padding: 7px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 0.85rem;
    color: #1e293b;
    background: #ffffff;
    min-width: 140px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #0f766e;
      box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.15);
    }
  }
`;

const TableCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  @media print {
    border: none;
    box-shadow: none;
  }
`;

const TableResponsive = styled.div`
  overflow-x: auto;
  width: 100%;

  @media print {
    overflow: visible;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  text-align: left;

  thead th {
    background: #0f766e;
    color: #ffffff;
    font-weight: 700;
    padding: 11px 12px;
    border-bottom: 2px solid #0d9488;
    white-space: nowrap;
  }

  tbody td {
    padding: 9px 12px;
    border-bottom: 1px solid #e2e8f0;
    color: #1e293b;
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
    white-space: nowrap;
  }
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
export default function OPPharmacySalesReport({
  isModalView = false,
  startDate,
  endDate,
  defaultTab = "invoices",
}) {
  const HMS_URL = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "";
  const location = useLocation();

  const pathname = location?.pathname || "";
  const queryParams = useMemo(() => new URLSearchParams(location?.search || ""), [location?.search]);
  const urlTab = queryParams.get("tab");

  const routeTab = useMemo(() => {
    const p = pathname.toLowerCase();
    if (p.includes("hsn")) return "hsn";
    if (p.includes("doc") || p.includes("summary")) return "docs";
    const t = (defaultTab || urlTab || "invoices").toLowerCase();
    return t === "b2b" ? "invoices" : t;
  }, [pathname, defaultTab, urlTab]);

  const [activeTab, setActiveTab] = useState(routeTab);
  const [fromDate, setFromDate] = useState(() => (startDate ? dayjs(startDate) : dayjs().subtract(90, "days")));
  const [toDate, setToDate] = useState(() => (endDate ? dayjs(endDate) : dayjs()));
  const [taxRateFilter, setTaxRateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    summary: {},
    invoices_data: [],
    hsn_data: [],
    docs_data: [],
  });

  useEffect(() => {
    setActiveTab(routeTab);
  }, [routeTab]);

  // ── Fetch Report from Backend ───────────────────────────────────────────
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("from_date", fromDate.format("YYYY-MM-DD"));
      if (toDate) params.append("to_date", toDate.format("YYYY-MM-DD"));
      if (taxRateFilter !== "all") params.append("tax_rate", taxRateFilter);
      if (searchTerm) params.append("search", searchTerm);

      const baseUrl = HMS_URL.replace(/\/$/, "");
      const res = await apiRequest(`${baseUrl}/op-pharmacy-sales-report/?${params.toString()}`, "GET");

      // Robust unwrapping across apiRequest and Django Response layers
      const rawPayload = res?.data?.data || res?.data || res || {};
      const payload = typeof rawPayload === "object" ? rawPayload : {};

      const invoices =
        payload.sales_data ||
        payload.invoices_data ||
        payload.b2b_data ||
        (Array.isArray(payload) ? payload : []);
      const hsn = payload.hsn_data || [];
      const docs = payload.docs_data || [];
      const summary = payload.summary || {};

      if (res?.success || payload?.success || Array.isArray(invoices)) {
        setReportData({
          summary: summary,
          invoices_data: Array.isArray(invoices) ? invoices : [],
          hsn_data: Array.isArray(hsn) ? hsn : [],
          docs_data: Array.isArray(docs) ? docs : [],
        });
      } else {
        toast.error(res?.error || payload?.error || res?.message || "Failed to load OP Pharmacy sales report.");
      }
    } catch (err) {
      console.error("Error fetching OP Pharmacy sales report:", err);
      toast.error("Network error while fetching OP Pharmacy sales report.");
    } finally {
      setLoading(false);
    }
  }, [HMS_URL, fromDate, toDate, taxRateFilter, searchTerm]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // ── Filtered Datasets ───────────────────────────────────────────────────
  const filteredInvoices = useMemo(() => {
    let list = reportData.invoices_data || [];
    if (taxRateFilter !== "all") {
      const targetRate = parseFloat(taxRateFilter);
      list = list.filter((r) => Math.abs(parseFloat(r.tax_rate || 0) - targetRate) < 0.01);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          (r.invoice_no && r.invoice_no.toLowerCase().includes(q)) ||
          (r.customer_name && r.customer_name.toLowerCase().includes(q)) ||
          (r.gstin && r.gstin.toLowerCase().includes(q))
      );
    }
    return list;
  }, [reportData.invoices_data, taxRateFilter, searchTerm]);

  const filteredHSN = useMemo(() => {
    let list = reportData.hsn_data || [];
    if (taxRateFilter !== "all") {
      const targetRate = parseFloat(taxRateFilter);
      list = list.filter((r) => Math.abs(parseFloat(r.tax_rate || 0) - targetRate) < 0.01);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          (r.hsn && r.hsn.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [reportData.hsn_data, taxRateFilter, searchTerm]);

  // Totals calculations
  const invoiceTotals = useMemo(() => {
    return filteredInvoices.reduce(
      (acc, r) => ({
        invoiceValue: acc.invoiceValue + Number(r.invoice_value || 0),
        taxable: acc.taxable + Number(r.taxable_value || 0),
        igst: acc.igst + Number(r.igst || 0),
        cgst: acc.cgst + Number(r.cgst || 0),
        sgst: acc.sgst + Number(r.sgst || 0),
        cess: acc.cess + Number(r.cess || 0),
      }),
      { invoiceValue: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 }
    );
  }, [filteredInvoices]);

  const hsnTotals = useMemo(() => {
    return filteredHSN.reduce(
      (acc, r) => ({
        qty: acc.qty + Number(r.total_quantity || 0),
        taxable: acc.taxable + Number(r.taxable_value || 0),
        igst: acc.igst + Number(r.igst || 0),
        cgst: acc.cgst + Number(r.cgst || 0),
        sgst: acc.sgst + Number(r.sgst || 0),
        cess: acc.cess + Number(r.cess || 0),
      }),
      { qty: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 }
    );
  }, [filteredHSN]);

  // ── Excel Export (Winman CA-ERP Layout) ───────────────────────────────────
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    if (activeTab === "invoices") {
      if (!filteredInvoices.length) {
        toast.warn("No sales invoice data available to export.");
        return;
      }
      const invHeaders = [
        "Invoice number",
        "Customer Name",
        "GSTIN of recipient",
        "Invoice date",
        "Invoice Value",
        "Tax Rate(%)",
        "Taxable value",
        "IGST",
        "Central Tax",
        "State Tax",
        "Cess",
        "State of supply",
        "Reverse Charge"
      ];
      const invRows = filteredInvoices.map((r) => [
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
        r.reverse_charge || "N"
      ]);
      const ws = XLSX.utils.aoa_to_sheet([invHeaders, ...invRows]);
      XLSX.utils.book_append_sheet(wb, ws, "Invoices");

      const fileName = `OP_Pharmacy_Sales_Invoices_${fromDate.format("YYYYMMDD")}_to_${toDate.format("YYYYMMDD")}.xlsx`;
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

      const fileName = `OP_Pharmacy_Sales_HSN_${fromDate.format("YYYYMMDD")}_to_${toDate.format("YYYYMMDD")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Exported ${fileName} successfully!`);
      return;
    }

    if (activeTab === "docs") {
      if (!reportData.docs_data.length) {
        toast.warn("No document summary available to export.");
        return;
      }
      const docsHeaders = [
        "Nature of Document",
        "Sr. No. From",
        "Sr. No. To",
        "Total number",
        "Cancelled",
        "Net Issued"
      ];
      const docsRows = reportData.docs_data.map((r) => [
        r.particulars || "",
        r.sl_no_from || "",
        r.sl_no_to || "",
        r.total_count || 0,
        r.cancelled || 0,
        r.net_issued || 0,
      ]);
      const ws = XLSX.utils.aoa_to_sheet([docsHeaders, ...docsRows]);
      XLSX.utils.book_append_sheet(wb, ws, "Docs");

      const fileName = `OP_Pharmacy_Sales_Docs_${fromDate.format("YYYYMMDD")}_to_${toDate.format("YYYYMMDD")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Exported ${fileName} successfully!`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "hsn":
        return "OP Pharmacy Sales - HSN Wise Summary";
      case "docs":
        return "OP Pharmacy Sales - Document Summary";
      case "invoices":
      default:
        return "OP Pharmacy Sales - Tax Invoices (Sales Register)";
    }
  };

  return (
    <PageContainer $isModal={isModalView}>
      {/* ── Print Header ────────────────────────────────────────── */}
      <PrintHeader>
        <h2>SHANMUGA HOSPITAL</h2>
        <h3>{getPageTitle().toUpperCase()}</h3>
        <p>
          Period: {fromDate.format("DD/MM/YYYY")} to {toDate.format("DD/MM/YYYY")} | Winman CA-ERP GSTR-1 Format
        </p>
      </PrintHeader>

      {/* ── Top Bar ────────────────────────────────────────────── */}
      <TopBar>
        <TitleBlock>
          <h1>
            <FileText size={26} color="#0f766e" />
            {getPageTitle()}
          </h1>
          <p>
            GST Outward Supplies Register (GSTR-1 Format) &bull; Outlet: OP PHARMACY
          </p>
        </TitleBlock>

        <ActionButtons>
          <Button $variant="outline" onClick={fetchReport} disabled={loading} title="Reload Data">
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
          </Button>
          <Button $variant="excel" onClick={handleExportExcel} disabled={loading}>
            <FileSpreadsheet size={15} /> Export Winman Excel ({activeTab === "invoices" ? "Invoices" : activeTab.toUpperCase()})
          </Button>
          <Button $variant="primary" onClick={handlePrint} disabled={loading}>
            <Printer size={15} /> Print Report
          </Button>
        </ActionButtons>
      </TopBar>

      {/* ── Tab Navigation ─────────────────────────────────────── */}
      <TabNav>
        <TabItem $active={activeTab === "invoices"} onClick={() => setActiveTab("invoices")}>
          <FileText size={16} />
          Sales Invoices
          <span className="badge">{filteredInvoices.length}</span>
        </TabItem>
        <TabItem $active={activeTab === "hsn"} onClick={() => setActiveTab("hsn")}>
          <Boxes size={16} />
          HSN Wise Summary
          <span className="badge">{filteredHSN.length}</span>
        </TabItem>
        <TabItem $active={activeTab === "docs"} onClick={() => setActiveTab("docs")}>
          <Layers size={16} />
          Document Summary
          <span className="badge">{reportData.docs_data.length}</span>
        </TabItem>
      </TabNav>

      {/* ── Filter Bar ─────────────────────────────────────────── */}
      <FilterCard>
        <FilterGroup>
          <label>From Date</label>
          <input
            type="date"
            value={fromDate ? fromDate.format("YYYY-MM-DD") : ""}
            onChange={(e) => setFromDate(e.target.value ? dayjs(e.target.value) : null)}
          />
        </FilterGroup>

        <FilterGroup>
          <label>To Date</label>
          <input
            type="date"
            value={toDate ? toDate.format("YYYY-MM-DD") : ""}
            onChange={(e) => setToDate(e.target.value ? dayjs(e.target.value) : null)}
          />
        </FilterGroup>

        <FilterGroup>
          <label>Tax Rate (%)</label>
          <select value={taxRateFilter} onChange={(e) => setTaxRateFilter(e.target.value)}>
            <option value="all">All Rates</option>
            <option value="0">0% (Nil / Exempt)</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </FilterGroup>

        <FilterGroup style={{ flex: 1, minWidth: "220px" }}>
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by Bill No, Customer, GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FilterGroup>
      </FilterCard>

      {/* ── Table Area ─────────────────────────────────────────── */}
      <TableCard>
        <TableResponsive>
          {/* TAB 1: Invoices */}
          {activeTab === "invoices" && (
            <StyledTable>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Invoice No (Bill No)</th>
                  <th>Customer Name</th>
                  <th>GSTIN No</th>
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
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={14} style={{ textAlign: "center", padding: "36px 12px", color: "#64748b" }}>
                      {loading
                        ? "Loading OP Pharmacy sales records..."
                        : "No OP Pharmacy sales invoices found for the selected criteria."}
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((r, idx) => (
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
                    </tr>
                  ))
                )}
              </tbody>
              {filteredInvoices.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={5} style={{ textAlign: "right" }}>
                      TOTAL ({filteredInvoices.length} entries):
                    </td>
                    <td style={{ textAlign: "right" }}>₹{invoiceTotals.invoiceValue.toFixed(2)}</td>
                    <td></td>
                    <td style={{ textAlign: "right" }}>₹{invoiceTotals.taxable.toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>
                      {invoiceTotals.igst > 0 ? `₹${invoiceTotals.igst.toFixed(2)}` : "-"}
                    </td>
                    <td style={{ textAlign: "right", color: "#10b981" }}>₹{invoiceTotals.cgst.toFixed(2)}</td>
                    <td style={{ textAlign: "right", color: "#f59e0b" }}>₹{invoiceTotals.sgst.toFixed(2)}</td>
                    <td colSpan={3}></td>
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
                        : "No OP Pharmacy sales HSN data found for the selected criteria."}
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
                {reportData.docs_data.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "36px 12px", color: "#64748b" }}>
                      {loading ? "Loading document summary..." : "No document summary available for OP Pharmacy Sales."}
                    </td>
                  </tr>
                ) : (
                  reportData.docs_data.map((r, idx) => (
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

// ── Standalone Exported Components for Modals / Standalone Routes ───────────
export const OPPharmacyInvoicesReport = (props) => (
  <OPPharmacySalesReport {...props} defaultTab="invoices" />
);

export const OPPharmacyB2BReport = OPPharmacyInvoicesReport;

export const OPPharmacyHSNReport = (props) => (
  <OPPharmacySalesReport {...props} defaultTab="hsn" />
);

export const OPPharmacyDocsReport = (props) => (
  <OPPharmacySalesReport {...props} defaultTab="docs" />
);

