import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Search,
  Printer,
  Download,
  Eye,
  X,
  ArrowLeft,
} from "lucide-react";
import {
  Container,
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
  colors,
} from "../GlobalStyles";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// ─── Helpers ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["Pending", "Processed", "Cancelled", "Billed"];

const getStatusStyle = (status) => {
  const map = {
    Pending: { bg: "#FFF3CD", color: "#856404" },
    Processed: { bg: "#ede9fe", color: "#6d28d9" },
    Cancelled: { bg: "#f3f4f6", color: "#6b7280" },
    Billed: { bg: "#dcfce7", color: "#166534" },
  };
  return map[status] || { bg: "#f3f4f6", color: "#374151" };
};

// ─── Print toolbar (shared pattern) ────────────────────────────────────────
const ORIENTATION_TOOLBAR = `
<div class="no-print" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;
  margin-bottom:14px;padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px">
  <button onclick="window.print()"
    style="padding:5px 18px;font-size:12px;font-weight:700;border:none;
           border-radius:5px;background:#0ea5e9;color:#fff;cursor:pointer">
    🖨 Print
  </button>
</div>`;

const PRINT_BASE_CSS = `
  @media print { .no-print { display:none !important } body { margin:0 } }
  @page { size: landscape; margin: 10mm }
`;

const actionBtn = {
  background: "none",
  border: `1px solid ${colors.border}`,
  borderRadius: 4,
  padding: "3px 7px",
  cursor: "pointer",
  color: colors.textMuted,
  fontSize: "0.78rem",
  display: "inline-flex",
  alignItems: "center",
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
const pageHeader = {
  padding: "14px 18px",
  borderBottom: `2px solid ${colors.border}`,
  background: colors.tabBg,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderRadius: "8px 8px 0 0",
};
const actionsBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 16px",
  background: "#fff",
  borderBottom: `1px solid ${colors.border}`,
};

const ImplantRequestReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from_date: today,
    to_date: today,
    status: "",
    search: "",
  });
  const [viewingRequest, setViewingRequest] = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (fromDate, toDate, status) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (fromDate) params.append("from_date", fromDate);
        if (toDate) params.append("to_date", toDate);
        if (status) params.append("status", status);

        const response = await apiRequest(
          `${HMSURL}implant/requests/report/?${params.toString()}`,
          "GET",
        );
        if (!response.success)
          throw new Error(response.error || "Request failed");
        if (response.data?.success !== true)
          throw new Error(response.data?.error || "Backend error");

        const data = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setAllData(data);
        setFilteredData(data);
        if (data.length === 0)
          toast.info("No implant requests found for the selected filters");
      } catch (err) {
        toast.error(err.message || "Failed to fetch implant requests");
        setAllData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    },
    [HMSURL],
  );

  useEffect(() => {
    fetchData(today, today, "");
  }, [fetchData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Client-side search ──────────────────────────────────────────────────
  const applySearch = useCallback(() => {
    if (!filters.search.trim()) {
      setFilteredData(allData);
      return;
    }
    const s = filters.search.toLowerCase().trim();
    setFilteredData(
      allData.filter(
        (r) =>
          r.request_id?.toString().includes(s) ||
          r.uhid?.toLowerCase().includes(s) ||
          r.ipNumber?.toLowerCase().includes(s) ||
          r.patientName?.toLowerCase().includes(s) ||
          r.surgeonName?.toLowerCase().includes(s) ||
          r.surgeryRef?.toLowerCase().includes(s) ||
          (r.items || []).some((it) => it.itemName?.toLowerCase().includes(s)),
      ),
    );
  }, [allData, filters.search]);

  useEffect(() => {
    applySearch();
  }, [applySearch]);

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleSearchClick = () => {
    fetchData(filters.from_date, filters.to_date, filters.status);
  };

  const clearFilters = () => {
    setFilters({ from_date: "", to_date: "", status: "", search: "" });
    fetchData("", "", "");
  };

  const getDateRangeLabel = () => {
    const from = filters.from_date;
    const to = filters.to_date;
    if (from && to) return from === to ? from : `${from} to ${to}`;
    if (from) return `From ${from}`;
    if (to) return `To ${to}`;
    return "All Dates";
  };

  // ── Print ────────────────────────────────────────────────────────────────
  const openPrintWindow = (title, css, bodyHtml) => {
    const pw = window.open("", "", "width=1100,height=750");
    pw.document.write(`<!DOCTYPE html><html><head>
      <title>${title}</title>
      <style>${css}${PRINT_BASE_CSS}</style>
    </head><body>
      ${ORIENTATION_TOOLBAR}
      ${bodyHtml}
    </body></html>`);
    pw.document.close();
  };

  // ── Print — grouped card format (one card per request) ─────────────────
  const handlePrint = () => {
    const css = `
      body{font-family:Arial,sans-serif;margin:24px;font-size:12px;color:#1e293b}
      h1{font-size:19px;font-weight:700;margin:0 0 4px;color:#1e293b}
      h2{font-size:12px;font-weight:400;color:#64748b;margin:0 0 20px}
      .card{margin-bottom:26px;page-break-inside:avoid}
      .hdr-table{width:100%;border-collapse:collapse;margin-bottom:10px}
      .hdr-table th{
        background:#f8fafc;color:#334155;font-weight:700;font-size:10.5px;
        text-align:left;padding:8px 10px;border:1px solid #e2e8f0;
        text-transform:uppercase;letter-spacing:0.3px
      }
      .hdr-table td{
        padding:8px 10px;border:1px solid #e2e8f0;font-size:11.5px;
        color:#1e293b;font-weight:600
      }
      .items-label{
        font-size:11px;font-weight:700;color:#334155;margin:0 0 6px;
        text-transform:uppercase;letter-spacing:0.3px
      }
      .items-table{width:100%;border-collapse:collapse}
      .items-table th{
        background:#f8fafc;color:#334155;font-weight:700;font-size:10.5px;
        text-align:left;padding:7px 10px;border:1px solid #e2e8f0;
        text-transform:uppercase;letter-spacing:0.3px
      }
      .items-table td{
        padding:7px 10px;border:1px solid #e2e8f0;font-size:11px;color:#1e293b
      }
      .id-col{color:#2563eb;font-weight:600;width:60px}
      .status-pending{color:#856404;font-weight:700}
      .status-processed{color:#6d28d9;font-weight:700}
      .status-cancelled{color:#6b7280;font-weight:700}
      .status-billed{color:#166534;font-weight:700}
    `;

    const statusClass = (s) => `status-${(s || "pending").toLowerCase()}`;

    const cards = filteredData
      .map((r) => {
        const items = r.items || [];
        const itemsRows = items.length
          ? items
              .map(
                (it, i) => `
              <tr>
                <td class="id-col">#${i + 1}</td>
                <td>${it.itemName || "N/A"}</td>
                <td>${it.hsn || "—"}</td>
                <td style="text-align:right">${it.quantity ?? 0}</td>
              </tr>`,
              )
              .join("")
          : `<tr><td colspan="4" style="text-align:center;color:#94a3b8">No items</td></tr>`;

        return `
        <div class="card">
          <table class="hdr-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Date / Time</th>
                <th>UHID</th>
                <th>IP Number</th>
                <th>Patient</th>
                <th>Surgeon</th>
                <th>Surgery Ref</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${r.request_id}</td>
                <td>${r.reqDate} ${r.reqTime}</td>
                <td>${r.uhid || "—"}</td>
                <td>${r.ipNumber || "—"}</td>
                <td>${r.patientName || "—"}</td>
                <td>${r.surgeonName || "—"}</td>
                <td>${r.surgeryRef || "—"}</td>
                <td class="${statusClass(r.status)}">${r.status || "—"}</td>
              </tr>
            </tbody>
          </table>

          <div class="items-label">Items (${items.length})</div>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width:60px">ID</th>
                <th>Item Name</th>
                <th style="width:120px">HSN</th>
                <th style="width:70px;text-align:right">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
        </div>`;
      })
      .join("");

    const body = `
      <h1>Implant Request Report</h1>
      <h2>${getDateRangeLabel()}${filters.status ? ` — Status: ${filters.status}` : ""} &nbsp;|&nbsp; ${filteredData.length} request${filteredData.length !== 1 ? "s" : ""}</h2>
      ${cards || `<div style="text-align:center;padding:40px;color:#94a3b8">No records found</div>`}`;

    openPrintWindow("Implant Request Report", css, body);
  };
  // ── Export CSV ───────────────────────────────────────────────────────────
  // ── Export — grouped card format written to Excel via SheetJS ───────────
  const exportToExcel = () => {
    const XLSX = require("xlsx");

    const wsData = [];
    const merges = [];
    let rowIdx = 0;

    // Title row
    wsData.push([
      `Implant Request Report — ${getDateRangeLabel()}${filters.status ? ` (Status: ${filters.status})` : ""}`,
    ]);
    merges.push({ s: { r: rowIdx, c: 0 }, e: { r: rowIdx, c: 3 } });
    rowIdx += 1;
    wsData.push([]); // spacer
    rowIdx += 1;

    filteredData.forEach((r) => {
      const items = r.items || [];

      // ── Header block: label row + value row (mirrors the card's info table) ──
      wsData.push(["Request ID", "Date / Time", "UHID", "IP Number"]);
      rowIdx += 1;
      wsData.push([
        r.request_id,
        `${r.reqDate} ${r.reqTime}`,
        r.uhid || "—",
        r.ipNumber || "—",
      ]);
      rowIdx += 1;
      wsData.push(["Patient", "Surgeon", "Surgery Ref", "Status"]);
      rowIdx += 1;
      wsData.push([
        r.patientName || "—",
        r.surgeonName || "—",
        r.surgeryRef || "—",
        r.status || "—",
      ]);
      rowIdx += 1;

      wsData.push([]); // spacer
      rowIdx += 1;

      // ── Items block ──
      wsData.push([`Items (${items.length})`]);
      merges.push({ s: { r: rowIdx, c: 0 }, e: { r: rowIdx, c: 3 } });
      rowIdx += 1;

      wsData.push(["ID", "Item Name", "HSN", "Qty"]);
      rowIdx += 1;

      if (items.length) {
        items.forEach((it, i) => {
          wsData.push([
            `#${i + 1}`,
            it.itemName || "N/A",
            it.hsn || "—",
            it.quantity ?? 0,
          ]);
          rowIdx += 1;
        });
      } else {
        wsData.push(["—", "No items", "—", "—"]);
        rowIdx += 1;
      }

      wsData.push([]); // spacer between cards
      rowIdx += 1;
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!merges"] = merges;
    ws["!cols"] = [{ wch: 14 }, { wch: 30 }, { wch: 16 }, { wch: 12 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Implant Requests");
    XLSX.writeFile(
      wb,
      `ImplantRequestReport_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // ── Print — single request (per-row action) ─────────────────────────────
  const handleSingleRequestPrint = (r) => {
    const items = r.items || [];

    const statusClass = (s) =>
      `status-${(s || "pending").toLowerCase().replace(/\s+/g, "-")}`;

    const css = `
      body{font-family:Arial,sans-serif;margin:24px;font-size:12px;color:#1e293b}
      h1{font-size:19px;font-weight:700;margin:0 0 4px;color:#1e293b;text-align:center}
      h2{font-size:12px;font-weight:400;color:#64748b;margin:0 0 20px;text-align:center}
      .hdr-table{width:100%;border-collapse:collapse;margin-bottom:14px}
      .hdr-table th{
        background:#f8fafc;color:#334155;font-weight:700;font-size:10.5px;
        text-align:left;padding:8px 10px;border:1px solid #e2e8f0;
        text-transform:uppercase;letter-spacing:0.3px
      }
      .hdr-table td{
        padding:8px 10px;border:1px solid #e2e8f0;font-size:11.5px;
        color:#1e293b;font-weight:600
      }
      .items-label{
        font-size:12px;font-weight:700;color:#334155;margin:16px 0 6px;
        text-transform:uppercase;letter-spacing:0.3px
      }
      .items-table{width:100%;border-collapse:collapse}
      .items-table th{
        background:#f8fafc;color:#334155;font-weight:700;font-size:10.5px;
        text-align:left;padding:7px 10px;border:1px solid #e2e8f0;
        text-transform:uppercase;letter-spacing:0.3px
      }
      .items-table td{
        padding:7px 10px;border:1px solid #e2e8f0;font-size:11px;color:#1e293b
      }
      .id-col{color:#2563eb;font-weight:600;width:60px}
      .status-pending{color:#856404;font-weight:700}
      .status-processed{color:#6d28d9;font-weight:700}
      .status-cancelled{color:#6b7280;font-weight:700}
      .status-billed{color:#166534;font-weight:700}
      .status-invoice-generated{color:#1d4ed8;font-weight:700}
      .footer{display:flex;justify-content:space-between;margin-top:32px;padding-top:14px;border-top:1px dashed #94a3b8;font-size:11px;color:#475569}
    `;

    const itemsRows = items.length
      ? items
          .map(
            (it, i) => `
          <tr>
            <td class="id-col">#${i + 1}</td>
            <td>${it.itemName || "N/A"}</td>
            <td>${it.hsn || "—"}</td>
            <td style="text-align:right">${it.quantity ?? 0}</td>
          </tr>`,
          )
          .join("")
      : `<tr><td colspan="4" style="text-align:center;color:#94a3b8">No items</td></tr>`;

    const body = `
      <h1>Implant Request Slip</h1>
      <h2>Request #${r.request_id} &nbsp;|&nbsp; ${r.reqDate} ${r.reqTime}</h2>

      <table class="hdr-table">
        <thead>
          <tr>
            <th>UHID</th>
            <th>IP Number</th>
            <th>Patient Name</th>
            <th>Gender / Age</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${r.uhid || "—"}</td>
            <td>${r.ipNumber || "—"}</td>
            <td>${r.patientName || "—"}</td>
            <td>${[r.gender, r.age].filter(Boolean).join(" / ") || "—"}</td>
          </tr>
        </tbody>
      </table>

      <table class="hdr-table">
        <thead>
          <tr>
            <th>Surgeon</th>
            <th>Surgery Ref</th>
            <th>Customer Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${r.surgeonName || "—"}</td>
            <td>${r.surgeryRef || "—"}</td>
            <td>${[r.customerType, r.companyName].filter(Boolean).join(" - ") || "—"}</td>
            <td class="${statusClass(r.status)}">${r.status || "—"}</td>
          </tr>
        </tbody>
      </table>

      <div class="items-label">Items (${items.length})</div>
      <table class="items-table">
        <thead>
          <tr>
            <th style="width:60px">ID</th>
            <th>Item Name</th>
            <th style="width:120px">HSN</th>
            <th style="width:70px;text-align:right">Qty</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="footer">
        <div><b>Requested By:</b> ${r.created_by || "N/A"}</div>
        <div style="text-align:center"><b>Authorized Signatory</b><br/><br/>________________________</div>
      </div>`;

    openPrintWindow(`Implant Request - ${r.request_id}`, css, body);
  };

  // ── View Items Modal ─────────────────────────────────────────────────────
  const ViewModal = ({ request, onClose }) => {
    if (!request) return null;
    const items = request.items || [];
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContainer
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: 700 }}
        >
          <ModalHeader>
            <ModalTitle>
              Implant Request #{request.request_id} — {request.reqDate}{" "}
              {request.reqTime}
            </ModalTitle>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "white",
              }}
            >
              <X size={20} />
            </button>
          </ModalHeader>
          <ModalBody>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 10,
                marginBottom: 16,
                fontSize: "0.85rem",
              }}
            >
              {[
                ["UHID", request.uhid],
                ["IP Number", request.ipNumber],
                ["Patient", request.patientName],
                ["Surgeon", request.surgeonName],
                ["Surgery Ref", request.surgeryRef],
                ["Status", request.status],
              ].map(([label, val]) => (
                <div
                  key={label}
                  style={{
                    background: "#f8fafc",
                    border: `1px solid ${colors.border}`,
                    borderRadius: 6,
                    padding: "8px 10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: colors.textMuted,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ fontWeight: 600 }}>{val || "N/A"}</div>
                </div>
              ))}
            </div>
            <Table>
              <thead>
                <Tr>
                  <Th>#</Th>
                  <Th>Item Name</Th>
                  <Th>HSN</Th>
                  <Th style={{ textAlign: "right" }}>Qty</Th>
                </Tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((it, i) => (
                    <Tr key={i}>
                      <Td>{i + 1}</Td>
                      <Td style={{ fontWeight: 600 }}>
                        {it.itemName || "N/A"}
                      </Td>
                      <Td>{it.hsn || "—"}</Td>
                      <Td style={{ textAlign: "right" }}>{it.quantity}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td
                      colSpan={4}
                      style={{ textAlign: "center", color: colors.textMuted }}
                    >
                      No items
                    </Td>
                  </Tr>
                )}
              </tbody>
            </Table>
          </ModalBody>
        </ModalContainer>
      </ModalOverlay>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Container>
      <div style={pageHeader}>
        <h2
          style={{
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: 700,
            color: colors.textMain,
          }}
        >
          Implant Request Report
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
          <ArrowLeft size={14} /> Back
        </Button>
      </div>

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

        <div style={filterGroup}>
          <Label>Status</Label>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        <Button
          onClick={handleSearchClick}
          style={{
            alignSelf: "flex-end",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Search size={13} /> Search
        </Button>

        <div style={{ ...filterGroup, minWidth: 300 }}>
          <Label>Search</Label>
          <div style={{ position: "relative" }}>
            <Input
              type="text"
              placeholder="Req ID, UHID, IP, Patient, Surgeon, Item…"
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

      <div style={actionsBar}>
        <span style={{ fontSize: "0.82rem", color: colors.textMuted }}>
          {filteredData.length === 0
            ? "No records found"
            : `Showing ${filteredData.length} records`}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <Button success onClick={handlePrint}>
            <Printer size={14} /> Print
          </Button>
          <Button onClick={exportToExcel}>
            <Download size={14} /> Export Excel
          </Button>
        </div>
      </div>

      {loading ? (
        <div
          style={{ textAlign: "center", padding: 60, color: colors.textMuted }}
        >
          Loading…
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
                  "Req ID",
                  "Date / Time",
                  "UHID",
                  "IP Number",
                  "Patient",
                  "Gender/Age",
                  "Surgeon",
                  "Surgery Ref",
                  "Items",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <Th key={h} style={{ whiteSpace: "nowrap" }}>
                    {h}
                  </Th>
                ))}
              </Tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
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
                filteredData.map((r) => {
                  const st = getStatusStyle(r.status);
                  return (
                    <Tr key={r.request_id}>
                      <Td style={{ fontWeight: 600 }}>{r.request_id}</Td>
                      <Td style={{ whiteSpace: "nowrap" }}>
                        {r.reqDate} {r.reqTime}
                      </Td>
                      <Td>{r.uhid || "—"}</Td>
                      <Td>{r.ipNumber || "—"}</Td>
                      <Td style={{ minWidth: 120 }}>{r.patientName || "—"}</Td>
                      <Td>
                        {[r.gender, r.age].filter(Boolean).join(" / ") || "—"}
                      </Td>
                      <Td style={{ minWidth: 100 }}>{r.surgeonName || "—"}</Td>
                      <Td>{r.surgeryRef || "—"}</Td>
                      <Td>
                        {(r.items || []).length} item
                        {(r.items || []).length !== 1 ? "s" : ""}
                      </Td>
                      <Td>
                        <span
                          style={{
                            background: st.bg,
                            color: st.color,
                            padding: "2px 10px",
                            borderRadius: 20,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {r.status}
                        </span>
                      </Td>
                      <Td>
                        <button
                          style={actionBtn}
                          title="View"
                          onClick={() => setViewingRequest(r)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          style={actionBtn}
                          title="Print Implant Request"
                          onClick={() => handleSingleRequestPrint(r)}
                        >
                          <Printer size={14} />
                        </button>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      <ViewModal
        request={viewingRequest}
        onClose={() => setViewingRequest(null)}
      />
    </Container>
  );
};

export default ImplantRequestReport;
