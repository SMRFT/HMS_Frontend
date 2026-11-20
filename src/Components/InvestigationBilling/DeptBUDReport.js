import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import styled from "styled-components";
import Swal from "sweetalert2";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
  PageWrapper,
  FormRow,
  InputWrapper,
  Label,
  Select,
  Button,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  colors,
} from "../GlobalStyles";

// ─── Layout ───────────────────────────────────────────────────────────────────

const PageContainer = styled(PageWrapper)`
  background: #f0f2f5;
  padding: 12px;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 8px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const PageTitle = styled.h1`
  font-size: 1rem;
  font-weight: 700;
  color: ${colors.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 2px solid ${colors.primary};
  padding-bottom: 6px;
`;

const BackButton = styled(Button)`
  background: ${colors.primary};
  font-size: 0.78rem;
  padding: 5px 12px;
  &:hover {
    background: ${colors.primaryDark};
  }
`;

// ─── Audit Navigation Tabs ────────────────────────────────────────────────────

const AuditTabNav = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const AuditTabBtn = styled.button`
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid ${(props) => (props.$active ? colors.primary : colors.border)};
  background: ${(props) => (props.$active ? colors.primary : "white")};
  color: ${(props) => (props.$active ? "white" : colors.text)};
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.$active ? "0 2px 4px rgba(13, 148, 136, 0.25)" : "none"};
  &:hover {
    border-color: ${colors.primary};
    background: ${(props) => (props.$active ? colors.primaryDark : "#f8fafc")};
  }
`;

// ─── Filter bar ───────────────────────────────────────────────────────────────

const FilterBar = styled(FormRow)`
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  margin-bottom: 10px;
  align-items: flex-end;
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  height: 28px;
  .ant-picker-input input {
    font-size: 0.78rem;
    padding: 0 6px;
  }
  &.ant-picker {
    border: 1px solid ${colors.border};
    border-radius: 6px;
    padding: 0 6px;
    height: 28px;
    &:hover,
    &.ant-picker-focused {
      border-color: ${colors.primary};
      box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1);
    }
  }
`;

// ─── Table header row with print button ───────────────────────────────────────

const TableTopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const TableTitle = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PrintBtn = styled(Button)`
  background: ${colors.primary};
  font-size: 0.75rem;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover {
    background: ${colors.primaryDark};
  }
`;

// ─── Badges & Status Displays ─────────────────────────────────────────────────

const DeletedBadge = styled.span`
  display: inline-block;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 4px;
  padding: 2px 7px;
  font-size: 0.72rem;
  font-weight: 600;
`;

const EditedBadge = styled.span`
  display: inline-block;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  padding: 2px 7px;
  font-size: 0.72rem;
  font-weight: 600;
`;

const RefundBadge = styled.span`
  display: inline-block;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
  padding: 2px 7px;
  font-size: 0.72rem;
  font-weight: 600;
`;

const ApprovedStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 0.73rem;
  font-weight: 700;
  white-space: nowrap;
`;

const PendingBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 0.73rem;
  font-weight: 700;
  white-space: nowrap;
`;

const ApprovedByBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.25;
  .approver-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: #166534;
  }
  .approver-date {
    font-size: 0.68rem;
    color: ${colors.textMuted};
  }
`;

const ApproveBtn = styled.button`
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s ease;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(22, 163, 74, 0.3);
  &:hover:not(:disabled) {
    background: #15803d;
    box-shadow: 0 2px 4px rgba(22, 163, 74, 0.4);
  }
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

// ─── Frozen / Sticky Column Styling ──────────────────────────────────────────

const FrozenTh = styled(Th)`
  position: sticky;
  right: 0;
  background: #f1f5f9;
  z-index: 4;
  box-shadow: -3px 0 6px rgba(0, 0, 0, 0.08);
  text-align: center;
  min-width: 105px;
`;

const FrozenTd = styled(Td)`
  position: sticky;
  right: 0;
  background: white;
  z-index: 3;
  box-shadow: -3px 0 6px rgba(0, 0, 0, 0.08);
  text-align: center;
  white-space: nowrap;
`;

const StyledTr = styled(Tr)`
  &:hover ${FrozenTd} {
    background: #f8fafc;
  }
`;

// ─── Remarks cell ─────────────────────────────────────────────────────────────

const RemarksTd = styled(Td)`
  min-width: 170px;
  max-width: 240px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
  font-size: 0.76rem;
  color: ${colors.textMuted};
  vertical-align: top;
  padding-top: 6px;
`;

const RemarksTh = styled(Th)`
  min-width: 170px;
`;

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = styled.div`
  text-align: center;
  padding: 2.5rem;
  color: ${colors.textMuted};
  font-size: 0.82rem;
  &::before {
    content: "📭";
    font-size: 2.5rem;
    display: block;
    margin-bottom: 8px;
  }
`;

const PlaceholderState = styled.div`
  text-align: center;
  padding: 2.5rem;
  color: ${colors.textMuted};
  font-size: 0.82rem;
  &::before {
    content: "📋";
    font-size: 2.5rem;
    display: block;
    margin-bottom: 8px;
  }
`;

const ExpandBtn = styled(Button)`
  font-size: 0.72rem;
  padding: 3px 8px;
  background: transparent;
  color: ${colors.primary};
  border: 1px solid ${colors.primary};
  white-space: nowrap;
  &:hover {
    background: ${colors.primary};
    color: white;
  }
`;

// ─── Beautiful Audit Diff UI ──────────────────────────────────────────────────

const HistoryPanel = styled.div`
  background: #f8fafc;
  padding: 12px 16px;
  border-top: 1px solid ${colors.border};
`;

const HistoryCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  &:last-child {
    margin-bottom: 0;
  }
`;

const HistoryCardHeader = styled.div`
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.76rem;
`;

const EditNumBadge = styled.span`
  background: #ede9fe;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
  border-radius: 4px;
  padding: 2px 8px;
  font-weight: 700;
  font-size: 0.73rem;
`;

const RemarksPill = styled.span`
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 0.73rem;
  font-weight: 600;
`;

const ChangesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.76rem;
  th {
    padding: 8px 14px;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
    font-weight: 600;
    font-size: 0.74rem;
  }
  td {
    padding: 8px 14px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }
  tr:last-child td {
    border-bottom: none;
  }
`;

const DiffBox = styled.div`
  display: inline-block;
  width: 100%;
  line-height: 1.45;
`;

const EmptyValSpan = styled.span`
  color: #94a3b8;
  font-style: italic;
  font-size: 0.72rem;
`;

const ItemsListWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ItemChip = styled.div`
  display: inline-block;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 0.72rem;
  background: ${(props) => (props.$isNew ? "#dcfce7" : "#fee2e2")};
  color: ${(props) => (props.$isNew ? "#166534" : "#991b1b")};
  border: 1px solid ${(props) => (props.$isNew ? "#bbf7d0" : "#fecaca")};
  font-weight: 500;
`;

const ValueText = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.73rem;
  background: ${(props) => (props.$isNew ? "#dcfce7" : "#fee2e2")};
  color: ${(props) => (props.$isNew ? "#166534" : "#991b1b")};
  border: 1px solid ${(props) => (props.$isNew ? "#bbf7d0" : "#fecaca")};
  font-weight: 600;
`;

const DateValSpan = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.72rem;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  font-weight: 500;
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FIELD_LABELS = {
  total: "Total Amount (₹)",
  finalPrice: "Final Price (₹)",
  item: "Investigation Items",
  items: "Investigation Items",
  EstBillNo: "Estimate Bill No",
  investBillDate: "Bill Date & Time",
  doctor: "Doctor / Consultant",
  paymentMethod: "Payment Method",
  discount: "Discount (₹)",
  concession: "Concession (₹)",
  paidAmount: "Paid Amount (₹)",
  balanceAmount: "Balance Amount (₹)",
  remarks: "Remarks",
  editRemarks: "Edit Remarks",
};

const formatFieldName = (fieldName) => {
  if (FIELD_LABELS[fieldName]) return FIELD_LABELS[fieldName];
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const normalized =
    dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z";
  return new Date(normalized)
    .toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    })
    .toUpperCase();
};

const getRemarks = (bill, reportType) => {
  if (reportType === "deleted") return bill.deleteRemarks || "—";
  if (reportType === "refund") return bill.refundRemarks || "—";
  if (bill.editRemarks && String(bill.editRemarks).trim()) return bill.editRemarks;
  if (Array.isArray(bill.history) && bill.history.length > 0) {
    for (let i = bill.history.length - 1; i >= 0; i--) {
      if (bill.history[i]?.editRemarks && String(bill.history[i].editRemarks).trim()) {
        return bill.history[i].editRemarks;
      }
    }
  }
  return "—";
};

const renderVal = (v, isNew) => {
  if (
    v === null ||
    v === undefined ||
    v === "" ||
    (Array.isArray(v) && v.length === 0)
  ) {
    return <EmptyValSpan>— Empty / None —</EmptyValSpan>;
  }

  // If array of items
  if (Array.isArray(v)) {
    return (
      <ItemsListWrap>
        {v.map((item, idx) => {
          const name =
            typeof item === "string"
              ? item
              : item?.itemName || item?.test_name || JSON.stringify(item);
          const price = item?.price
            ? ` (₹ ${parseFloat(item.price).toFixed(2)})`
            : "";
          return (
            <ItemChip key={idx} $isNew={isNew}>
              • {name}
              {price}
            </ItemChip>
          );
        })}
      </ItemsListWrap>
    );
  }

  // If comma-separated tests string for item
  if (typeof v === "string" && v.includes(",") && !v.includes("T")) {
    const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1) {
      return (
        <ItemsListWrap>
          {parts.map((p, idx) => (
            <ItemChip key={idx} $isNew={isNew}>
              • {p}
            </ItemChip>
          ))}
        </ItemsListWrap>
      );
    }
  }

  // If ISO date string
  if (
    typeof v === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)
  ) {
    const normalized = v.endsWith("Z") || v.includes("+") ? v : v + "Z";
    return (
      <DateValSpan>
        🕒{" "}
        {new Date(normalized)
          .toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          })
          .toUpperCase()}
      </DateValSpan>
    );
  }

  return <ValueText $isNew={isNew}>{String(v)}</ValueText>;
};

// ─── Print handler ────────────────────────────────────────────────────────────

const printTable = (rows, reportType, fromDate, toDate) => {
  let title = "Department Bill — Edited Audit List";
  if (reportType === "deleted") {
    title = "Department Bill — Deleted Audit List";
  } else if (reportType === "refund") {
    title = "Department Bill — Refund Audit List";
  }

  const dateRange = `${fromDate.format("DD-MM-YYYY")} to ${toDate.format("DD-MM-YYYY")}`;

  let theadHtml = "";
  let rowsHtml = "";

  if (reportType === "refund") {
    theadHtml = `
      <tr>
        <th>Sl.No</th>
        <th>Refund Bill No</th>
        <th>Original Bill No</th>
        <th>UHID</th>
        <th>Patient Name</th>
        <th>Outlet</th>
        <th>Bill Type</th>
        <th>Refund Amount (₹)</th>
        <th>Refunded By</th>
        <th>Refund Remarks</th>
        <th>Refund Date & Time</th>
        <th>Approval Status</th>
        <th>Approved By</th>
        <th>Approved Date & Time</th>
      </tr>
    `;
    rowsHtml = rows
      .map(
        (bill, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${bill.refundBillNo || "—"}</td>
          <td>${bill.investBillNo || "—"}</td>
          <td>${bill.uhid || "—"}</td>
          <td>${bill.patientName || "—"}</td>
          <td>${bill.outlet_name || "—"}</td>
          <td>${bill.bill_name || bill.bill_type || "—"}</td>
          <td style="text-align: right; font-weight: bold;">₹ ${parseFloat(bill.refund_finalPrice || 0).toFixed(2)}</td>
          <td>${bill.created_by_name || bill.created_by || "—"}</td>
          <td>${bill.refundRemarks || "—"}</td>
          <td>${formatDateTime(bill.refundBillDate || bill.created_date)}</td>
          <td>${bill.is_approved ? '<span style="color:#166534;font-weight:bold;">Approved</span>' : '<span style="color:#b45309;font-weight:bold;">Pending</span>'}</td>
          <td>${bill.is_approved ? bill.approved_by_name || bill.approvedByName || bill.approved_by || "—" : "—"}</td>
          <td>${bill.is_approved ? formatDateTime(bill.approved_date || bill.approvedDate) : "—"}</td>
        </tr>`,
      )
      .join("");
  } else if (reportType === "deleted") {
    theadHtml = `
      <tr>
        <th>Sl.No</th>
        <th>Bill No</th>
        <th>UHID</th>
        <th>Patient Name</th>
        <th>Outlet</th>
        <th>Bill Type</th>
        <th>Deleted By</th>
        <th>Delete Remarks</th>
        <th>Deleted Date & Time</th>
        <th>Approval Status</th>
        <th>Approved By</th>
        <th>Approved Date & Time</th>
      </tr>
    `;
    rowsHtml = rows
      .map(
        (bill, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${bill.investBillNo || bill.EstBillNo || "—"}</td>
          <td>${bill.uhid || "—"}</td>
          <td>${bill.patientName || "—"}</td>
          <td>${bill.outlet_name || "—"}</td>
          <td>${bill.bill_name || bill.bill_type || "—"}</td>
          <td>${bill.deletedByName || bill.deletedBy || "—"}</td>
          <td>${bill.deleteRemarks || "—"}</td>
          <td>${formatDateTime(bill.deletedAt || bill.lastmodified_date)}</td>
          <td>${bill.is_approved ? '<span style="color:#166534;font-weight:bold;">Approved</span>' : '<span style="color:#b45309;font-weight:bold;">Pending</span>'}</td>
          <td>${bill.is_approved ? bill.approved_by_name || bill.approvedByName || bill.approved_by || "—" : "—"}</td>
          <td>${bill.is_approved ? formatDateTime(bill.approved_date || bill.approvedDate) : "—"}</td>
        </tr>`,
      )
      .join("");
  } else {
    // edited
    theadHtml = `
      <tr>
        <th>Sl.No</th>
        <th>Bill No</th>
        <th>UHID</th>
        <th>Patient Name</th>
        <th>Outlet</th>
        <th>Bill Type</th>
        <th>Edited By</th>
        <th>Edit Remarks</th>
        <th>Last Modified Date & Time</th>
        <th>Approval Status</th>
        <th>Approved By</th>
        <th>Approved Date & Time</th>
      </tr>
    `;
    rowsHtml = rows
      .map(
        (bill, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${bill.investBillNo || bill.EstBillNo || "—"}</td>
          <td>${bill.uhid || "—"}</td>
          <td>${bill.patientName || "—"}</td>
          <td>${bill.outlet_name || "—"}</td>
          <td>${bill.bill_name || bill.bill_type || "—"}</td>
          <td>${bill.lastmodified_by_name || bill.lastmodified_by || "—"}</td>
          <td>${getRemarks(bill, reportType)}</td>
          <td>${formatDateTime(bill.lastmodified_date)}</td>
          <td>${bill.is_approved ? '<span style="color:#166534;font-weight:bold;">Approved</span>' : '<span style="color:#b45309;font-weight:bold;">Pending</span>'}</td>
          <td>${bill.is_approved ? bill.approved_by_name || bill.approvedByName || bill.approved_by || "—" : "—"}</td>
          <td>${bill.is_approved ? formatDateTime(bill.approved_date || bill.approvedDate) : "—"}</td>
        </tr>`,
      )
      .join("");
  }

  const html = `<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 10px; }
      .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 10px; }
      .hospital-name { font-weight: bold; font-size: 14px; margin-bottom: 3px; }
      .report-title { font-weight: bold; font-size: 13px; color: ${reportType === "deleted" ? "#b91c1c" : reportType === "refund" ? "#0369a1" : "#92400e"}; margin: 4px 0; }
      .date-range { font-size: 11px; color: #555; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #ccc; padding: 5px 7px; text-align: left; }
      th { background: #f2f2f2; font-weight: bold; }
      tr:nth-child(even) { background: #fafafa; }
    </style></head>
    <body>
      <div class="header">
        <div class="hospital-name">SHANMUGA HOSPITAL LIMITED</div>
        <div>51/24.Saradha College Road, Salem - 636007</div>
        <div class="report-title">${title}</div>
        <div class="date-range">Period: ${dateRange}</div>
      </div>
      <table>
        <thead>${theadHtml}</thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div style="margin-top:16px;font-size:10px;color:#888;">
        Total Records: ${rows.length} &nbsp;|&nbsp; Printed on: ${new Date().toLocaleString("en-IN")}
      </div>
    </body></html>`;

  const pw = window.open("", "_blank", "height=700,width=1000");
  pw.document.write(html);
  pw.document.close();
  setTimeout(() => pw.print(), 500);
};

// ─── Component ────────────────────────────────────────────────────────────────

const DeptBUDReport = () => {
  const [reportType, setReportType] = useState("edited"); // "edited" | "deleted" | "refund"
  const [approvalStatus, setApprovalStatus] = useState("all"); // "all" | "pending" | "approved"
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const [expandedRows, setExpandedRows] = useState(new Set());
  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]",
  );
  const canApprove = allowedActions.includes("HMS-P-DBUDA-RW");

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Fetch whenever type, status or dates change ─────────────────────────────
  useEffect(() => {
    if (!reportType) {
      setBills([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const qp = new URLSearchParams({
          report_type: reportType,
          start_date: fromDate.format("YYYY-MM-DD"),
          end_date: toDate.format("YYYY-MM-DD"),
        });
        if (approvalStatus !== "all") {
          qp.append("approval_status", approvalStatus);
        }
        const result = await apiRequest(
          `${HMSURL}dept-budr/?${qp.toString()}`,
          "GET",
        );
        if (result.success) {
          setBills(result.data || []);
        } else {
          toast.error(result.error || "Failed to fetch report");
          setBills([]);
        }
      } catch {
        toast.error("An unexpected error occurred");
        setBills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportType, approvalStatus, fromDate, toDate, HMSURL]);

  const handleDateChange = (date, type) => {
    if (!date) return;
    type === "from" ? setFromDate(date) : setToDate(date);
  };

  // ── Handle Approve Request ──────────────────────────────────────────────────
  const handleApprove = async (bill) => {
    if (!canApprove) {
      toast.warning("You do not have permission to approve.");
      return;
    }
    const billIdentifier =
      bill.refundBillNo || bill.investBillNo || bill.EstBillNo || bill._id;
    const actionLabel =
      reportType === "edited"
        ? "Edit"
        : reportType === "deleted"
          ? "Delete"
          : "Refund";

    const confirmRes = await Swal.fire({
      title: `Approve ${actionLabel}?`,
      text: `Are you sure you want to approve this ${actionLabel} request for ${billIdentifier}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
    });

    if (!confirmRes.isConfirmed) return;

    try {
      setApprovingId(bill._id);
      const res = await apiRequest(`${HMSURL}dept-budr-approve/`, "PATCH", {
        action_type: reportType,
        billNo: billIdentifier,
        _id: bill._id,
      });

      if (res.success || res.status === 200 || res.data?.success) {
        toast.success(res.data?.message || `${actionLabel} approved successfully!`);
        const approverName = res.data?.approved_by_name || "Approved";
        const approvedAt = res.data?.approved_date || new Date().toISOString();
        setBills((prev) =>
          prev.map((b) =>
            b._id === bill._id
              ? {
                ...b,
                is_approved: true,
                approved_by_name: approverName,
                approvedByName: approverName,
                approved_date: approvedAt,
                approvedDate: approvedAt,
              }
              : b,
          ),
        );
      } else {
        toast.error(res.error || res.data?.error || "Failed to approve request");
      }
    } catch (err) {
      toast.error(err?.message || "An error occurred during approval");
    } finally {
      setApprovingId(null);
    }
  };

  const tableTitle =
    reportType === "deleted"
      ? "🗑 Department Bill — Delete Audit List"
      : reportType === "refund"
        ? "💸 Department Bill — Refund Audit List"
        : "✏️ Department Bill — Edit Audit List";

  return (
    <PageContainer>
      <HeaderContainer>
        <PageTitle>📊 Dept Bill Update / Delete / Refund Audit</PageTitle>
        <BackButton onClick={() => navigate(-1)}>← Back</BackButton>
      </HeaderContainer>

      {/* ── Audit Navigation Tabs ── */}
      <AuditTabNav>
        <AuditTabBtn
          type="button"
          $active={reportType === "edited"}
          onClick={() => setReportType("edited")}
        >
          ✏️ Edit Audit
        </AuditTabBtn>
        <AuditTabBtn
          type="button"
          $active={reportType === "deleted"}
          onClick={() => setReportType("deleted")}
        >
          🗑️ Delete Audit
        </AuditTabBtn>
        <AuditTabBtn
          type="button"
          $active={reportType === "refund"}
          onClick={() => setReportType("refund")}
        >
          💸 Refund Audit
        </AuditTabBtn>
      </AuditTabNav>

      <ContentCard>
        {/* ── Filters ── */}
        <FilterBar>
          <InputWrapper>
            <Label>Audit Type</Label>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="edited">✏️ Edit Audit (Edited Bills)</option>
              <option value="deleted">🗑️ Delete Audit (Deleted Bills)</option>
              <option value="refund">💸 Refund Audit (Refunded Bills)</option>
            </Select>
          </InputWrapper>

          <InputWrapper>
            <Label>Approval Status</Label>
            <Select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">⏳ Pending Approval</option>
              <option value="approved">✓ Approved</option>
            </Select>
          </InputWrapper>

          <InputWrapper>
            <Label>From Date</Label>
            <StyledDatePicker
              value={fromDate}
              onChange={(d) => handleDateChange(d, "from")}
              format="DD-MM-YYYY"
              allowClear={false}
            />
          </InputWrapper>

          <InputWrapper>
            <Label>To Date</Label>
            <StyledDatePicker
              value={toDate}
              onChange={(d) => handleDateChange(d, "to")}
              format="DD-MM-YYYY"
              allowClear={false}
            />
          </InputWrapper>
        </FilterBar>

        {/* ── Table Content ── */}
        {!reportType ? (
          <PlaceholderState>
            <p>Select an audit type to view data</p>
          </PlaceholderState>
        ) : loading ? (
          <PlaceholderState>
            <p>Loading records...</p>
          </PlaceholderState>
        ) : bills.length === 0 ? (
          <EmptyState>
            <p>No audit records found for the selected criteria</p>
          </EmptyState>
        ) : (
          <>
            <TableTopBar>
              <TableTitle>{tableTitle}</TableTitle>
              <PrintBtn
                type="button"
                onClick={() => printTable(bills, reportType, fromDate, toDate)}
              >
                🖨 Print
              </PrintBtn>
            </TableTopBar>

            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th style={{ width: 45 }}>Sl.No</Th>
                    {reportType === "refund" ? (
                      <>
                        <Th style={{ minWidth: 125 }}>Refund Bill No</Th>
                        <Th style={{ minWidth: 125 }}>Original Bill No</Th>
                      </>
                    ) : (
                      <Th style={{ minWidth: 125 }}>Bill No</Th>
                    )}
                    <Th style={{ minWidth: 105 }}>UHID</Th>
                    <Th style={{ minWidth: 135 }}>Patient Name</Th>
                    <Th style={{ minWidth: 100 }}>OUTLET</Th>
                    <Th style={{ minWidth: 110 }}>Bill Type</Th>
                    {reportType === "refund" && (
                      <Th style={{ minWidth: 110 }}>Refund Amount</Th>
                    )}
                    <Th style={{ minWidth: 110 }}>
                      {reportType === "deleted"
                        ? "Deleted By"
                        : reportType === "refund"
                          ? "Refunded By"
                          : "Edited By"}
                    </Th>
                    <RemarksTh>
                      {reportType === "deleted"
                        ? "Delete Remarks"
                        : reportType === "refund"
                          ? "Refund Remarks"
                          : "Edit Remarks"}
                    </RemarksTh>
                    <Th style={{ minWidth: 150 }}>
                      {reportType === "deleted"
                        ? "Deleted Date & Time"
                        : reportType === "refund"
                          ? "Refund Date & Time"
                          : "Last Modified Date & Time"}
                    </Th>
                    {(reportType === "edited" || reportType === "refund") && (
                      <Th style={{ width: 85, textAlign: "center" }}>Details</Th>
                    )}
                    <Th style={{ minWidth: 130 }}>Approval Status</Th>
                    <Th style={{ minWidth: 145 }}>Approved By</Th>
                    <FrozenTh>Action</FrozenTh>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill, index) => {
                    const isApproved = Boolean(bill.is_approved);
                    const billId = bill._id;

                    return (
                      <React.Fragment key={billId || index}>
                        <StyledTr>
                          <Td>{index + 1}</Td>
                          {reportType === "refund" ? (
                            <>
                              <Td style={{ fontWeight: 600 }}>
                                {bill.refundBillNo || "—"}
                              </Td>
                              <Td>{bill.investBillNo || "—"}</Td>
                            </>
                          ) : (
                            <Td style={{ fontWeight: 600 }}>
                              {bill.investBillNo || bill.EstBillNo || "—"}
                            </Td>
                          )}
                          <Td>{bill.uhid || "—"}</Td>
                          <Td style={{ fontWeight: 500 }}>
                            {bill.patientName || "—"}
                          </Td>
                          <Td>{bill.outlet_name || "—"}</Td>
                          <Td>{bill.bill_name || bill.bill_type || "—"}</Td>
                          {reportType === "refund" && (
                            <Td style={{ fontWeight: 700, color: "#0369a1" }}>
                              ₹ {parseFloat(bill.refund_finalPrice || 0).toFixed(2)}
                            </Td>
                          )}
                          <Td>
                            {reportType === "deleted" ? (
                              <DeletedBadge title={bill.deletedBy}>
                                {bill.deletedByName || bill.deletedBy || "—"}
                              </DeletedBadge>
                            ) : reportType === "refund" ? (
                              <RefundBadge title={bill.created_by}>
                                {bill.created_by_name || bill.created_by || "—"}
                              </RefundBadge>
                            ) : (
                              <EditedBadge title={bill.lastmodified_by}>
                                {bill.lastmodified_by_name ||
                                  bill.lastmodified_by ||
                                  "—"}
                              </EditedBadge>
                            )}
                          </Td>
                          <RemarksTd>
                            {getRemarks(bill, reportType)}
                          </RemarksTd>
                          <Td>
                            {formatDateTime(
                              reportType === "deleted"
                                ? bill.deletedAt || bill.lastmodified_date
                                : reportType === "refund"
                                  ? bill.refundBillDate || bill.created_date
                                  : bill.lastmodified_date,
                            )}
                          </Td>
                          {reportType === "edited" && (
                            <Td style={{ textAlign: "center" }}>
                              {bill.history?.length > 0 && (
                                <ExpandBtn onClick={() => toggleRow(bill._id)}>
                                  {expandedRows.has(bill._id)
                                    ? "▲ Hide"
                                    : "▼ History"}{" "}
                                  ({bill.history.length})
                                </ExpandBtn>
                              )}
                            </Td>
                          )}
                          {reportType === "refund" && (
                            <Td style={{ textAlign: "center" }}>
                              {Array.isArray(bill.item) && bill.item.length > 0 && (
                                <ExpandBtn onClick={() => toggleRow(bill._id)}>
                                  {expandedRows.has(bill._id)
                                    ? "▲ Hide"
                                    : "▼ Items"}{" "}
                                  ({bill.item.length})
                                </ExpandBtn>
                              )}
                            </Td>
                          )}
                          <Td>
                            {isApproved ? (
                              <ApprovedStatusBadge>✓ Approved</ApprovedStatusBadge>
                            ) : (
                              <PendingBadge>⏳ Pending Approval</PendingBadge>
                            )}
                          </Td>
                          <Td>
                            {isApproved ? (
                              <ApprovedByBox>
                                <span className="approver-name">
                                  {bill.approved_by_name ||
                                    bill.approvedByName ||
                                    bill.approved_by ||
                                    "—"}
                                </span>
                                <span className="approver-date">
                                  {formatDateTime(
                                    bill.approved_date || bill.approvedDate,
                                  )}
                                </span>
                              </ApprovedByBox>
                            ) : (
                              <span style={{ color: colors.textMuted }}>—</span>
                            )}
                          </Td>
                          <FrozenTd>
                            {isApproved ? (
                              <span
                                style={{ color: "#166534", fontWeight: 700, fontSize: "0.75rem" }}
                              >
                                ✓ Approved
                              </span>
                            ) : (
                              <ApproveBtn
                                type="button"
                                disabled={!canApprove || approvingId === bill._id}
                                title={
                                  canApprove ? "Approve this request" : "You don't have approve permission"
                                }
                                onClick={() => handleApprove(bill)}
                              >
                                {approvingId === bill._id ? "Approving..." : "✓ Approve"}
                              </ApproveBtn>
                            )}
                          </FrozenTd>
                        </StyledTr>

                        {/* ── Edit History Accordion ── */}
                        {reportType === "edited" && expandedRows.has(bill._id) && (
                          <tr>
                            <td colSpan={13} style={{ padding: 0 }}>
                              <HistoryPanel>
                                {[...bill.history].reverse().map((entry, i) => (
                                  <HistoryCard key={i}>
                                    <HistoryCardHeader>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 10,
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        <EditNumBadge>
                                          Edit #{bill.history.length - i}
                                        </EditNumBadge>
                                        <span>
                                          🕒{" "}
                                          <strong>
                                            {formatDateTime(entry.modified_date)}
                                          </strong>
                                        </span>
                                        <span>
                                          👤 Edited by:{" "}
                                          <strong>
                                            {entry.modified_by_name ||
                                              entry.modified_by}
                                            {entry.modified_by_name &&
                                              entry.modified_by_name !==
                                              entry.modified_by
                                              ? ` (${entry.modified_by})`
                                              : ""}
                                          </strong>
                                        </span>
                                      </div>
                                      {entry.editRemarks && (
                                        <RemarksPill>
                                          Remarks: <strong>{entry.editRemarks}</strong>
                                        </RemarksPill>
                                      )}
                                    </HistoryCardHeader>
                                    <ChangesTable>
                                      <thead>
                                        <tr>
                                          <th
                                            style={{
                                              width: "22%",
                                              minWidth: 160,
                                              background: "#f8fafc",
                                              color: colors.text,
                                            }}
                                          >
                                            Field / Attribute
                                          </th>
                                          <th
                                            style={{
                                              width: "39%",
                                              background: "#fff1f2",
                                              color: "#9f1239",
                                            }}
                                          >
                                            ⏮️ Previous Value (Before Edit)
                                          </th>
                                          <th
                                            style={{
                                              width: "39%",
                                              background: "#f0fdf4",
                                              color: "#166534",
                                            }}
                                          >
                                            ⏭️ Updated Value (After Edit)
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {Object.entries(
                                          entry.changes || {},
                                        ).map(([key, oldVal]) => (
                                          <tr key={key}>
                                            <td
                                              style={{
                                                fontWeight: 600,
                                                color: colors.text,
                                              }}
                                            >
                                              {formatFieldName(key)}
                                            </td>
                                            <td
                                              style={{
                                                background: "#fffafb",
                                              }}
                                            >
                                              <DiffBox>
                                                {renderVal(oldVal, false)}
                                              </DiffBox>
                                            </td>
                                            <td
                                              style={{
                                                background: "#fcfdfc",
                                              }}
                                            >
                                              <DiffBox>
                                                {renderVal(bill[key], true)}
                                              </DiffBox>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </ChangesTable>
                                  </HistoryCard>
                                ))}
                              </HistoryPanel>
                            </td>
                          </tr>
                        )}

                        {/* ── Refund Items Accordion ── */}
                        {reportType === "refund" && expandedRows.has(bill._id) && (
                          <tr>
                            <td colSpan={15} style={{ padding: 0 }}>
                              <HistoryPanel>
                                <HistoryCard>
                                  <HistoryCardHeader>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                      }}
                                    >
                                      <span
                                        style={{
                                          background: "#e0f2fe",
                                          color: "#0369a1",
                                          padding: "2px 8px",
                                          borderRadius: 4,
                                          fontWeight: 700,
                                          fontSize: "0.75rem",
                                        }}
                                      >
                                        📦 Refunded Items
                                      </span>
                                      <span
                                        style={{
                                          fontSize: "0.78rem",
                                          color: colors.textMuted,
                                        }}
                                      >
                                        Total{" "}
                                        {Array.isArray(bill.item)
                                          ? bill.item.length
                                          : 0}{" "}
                                        item(s) refunded
                                      </span>
                                    </div>
                                    {bill.refundRemarks && (
                                      <RemarksPill>
                                        Remarks: <strong>{bill.refundRemarks}</strong>
                                      </RemarksPill>
                                    )}
                                  </HistoryCardHeader>
                                  <ChangesTable>
                                    <thead>
                                      <tr>
                                        <th
                                          style={{
                                            width: 45,
                                            textAlign: "center",
                                            background: "#f8fafc",
                                          }}
                                        >
                                          #
                                        </th>
                                        <th style={{ background: "#f8fafc" }}>
                                          Item / Test Name
                                        </th>
                                        <th
                                          style={{
                                            width: 140,
                                            background: "#f8fafc",
                                          }}
                                        >
                                          Item Code / ID
                                        </th>
                                        <th
                                          style={{
                                            width: 120,
                                            textAlign: "right",
                                            background: "#f8fafc",
                                          }}
                                        >
                                          Price (₹)
                                        </th>
                                        <th
                                          style={{
                                            width: 80,
                                            textAlign: "center",
                                            background: "#f8fafc",
                                          }}
                                        >
                                          Quantity
                                        </th>
                                        <th
                                          style={{
                                            width: 130,
                                            textAlign: "right",
                                            background: "#f8fafc",
                                          }}
                                        >
                                          Total (₹)
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Array.isArray(bill.item) &&
                                        bill.item.map((it, idx) => (
                                          <tr key={idx}>
                                            <td
                                              style={{
                                                textAlign: "center",
                                                color: colors.textMuted,
                                              }}
                                            >
                                              {idx + 1}
                                            </td>
                                            <td
                                              style={{
                                                fontWeight: 600,
                                                color: colors.text,
                                              }}
                                            >
                                              {it.itemName ||
                                                it.test_name ||
                                                it.item_name ||
                                                "—"}
                                            </td>
                                            <td
                                              style={{
                                                color: colors.textMuted,
                                              }}
                                            >
                                              {it.test_id ||
                                                it.item_id ||
                                                it.itemCode ||
                                                "—"}
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                              ₹{" "}
                                              {parseFloat(
                                                it.price || 0,
                                              ).toFixed(2)}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                              {it.quantity || 1}
                                            </td>
                                            <td
                                              style={{
                                                textAlign: "right",
                                                fontWeight: 700,
                                                color: "#0369a1",
                                              }}
                                            >
                                              ₹{" "}
                                              {(
                                                parseFloat(it.price || 0) *
                                                parseInt(it.quantity || 1, 10)
                                              ).toFixed(2)}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </ChangesTable>
                                </HistoryCard>
                              </HistoryPanel>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>

            <div
              style={{
                fontSize: "0.75rem",
                color: colors.textMuted,
                textAlign: "right",
                marginTop: 8,
              }}
            >
              Total: <strong>{bills.length}</strong> record
              {bills.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </ContentCard>
    </PageContainer>
  );
};

export default DeptBUDReport;
