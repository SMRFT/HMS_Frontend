import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import styled from "styled-components";
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

// ─── Filter bar ───────────────────────────────────────────────────────────────

const FilterBar = styled(FormRow)`
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
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
  margin-bottom: 6px;
`;

const TableTitle = styled.span`
  font-size: 0.82rem;
  font-weight: 700;
  color: ${colors.primary};
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

// ─── Badges ───────────────────────────────────────────────────────────────────

const DeletedBadge = styled.span`
  display: inline-block;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 4px;
  padding: 1px 7px;
  font-size: 0.72rem;
  font-weight: 600;
`;

const EditedBadge = styled.span`
  display: inline-block;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  padding: 1px 7px;
  font-size: 0.72rem;
  font-weight: 600;
`;

// ─── Remarks cell ─────────────────────────────────────────────────────────────

const RemarksTd = styled(Td)`
  min-width: 220px;
  max-width: 300px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.45;
  font-size: 0.76rem;
  color: ${colors.textMuted};
  vertical-align: top;
  padding-top: 6px;
`;

const RemarksTh = styled(Th)`
  min-width: 220px;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    })
    .toUpperCase();
};

// ─── Print handler ────────────────────────────────────────────────────────────

const printTable = (rows, reportType, fromDate, toDate) => {
  const title =
    reportType === "deleted"
      ? "Department Bill — Deleted List"
      : "Department Bill — Edited List";

  const dateRange = `${fromDate.format("DD-MM-YYYY")} to ${toDate.format("DD-MM-YYYY")}`;

  const isDeleted = reportType === "deleted";
  const actionLabel = isDeleted ? "Deleted By" : "Edited By";
  const dateLabel = isDeleted
    ? "Deleted Date & Time"
    : "Last Modified Date & Time";

  const rowsHtml = rows
    .map(
      (bill, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${bill.investBillNo || "—"}</td>
        <td>${bill.uhid || "—"}</td>
        <td>${bill.bill_name || bill.bill_type || "—"}</td>
        <td>${isDeleted ? bill.deletedByName || bill.deletedBy || "—" : bill.lastmodified_by_name || bill.lastmodified_by || "—"}</td>
        <td>${isDeleted ? bill.deleteRemarks || "—" : bill.editRemarks || "—"}</td>
        <td>${
          isDeleted
            ? formatDateTime(bill.deletedAt)
            : formatDateTime(bill.lastmodified_date)
        }</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 10px; }
      .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 10px; }
      .hospital-name { font-weight: bold; font-size: 14px; margin-bottom: 3px; }
      .report-title { font-weight: bold; font-size: 13px; color: ${isDeleted ? "#b91c1c" : "#92400e"}; margin: 4px 0; }
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
        <thead>
          <tr>
            <th>Sl.No</th>
            <th>Bill No</th>
            <th>UHID</th>
            <th>Bill Type</th>
            <th>${actionLabel}</th>
            <th>${isDeleted ? "Delete Remarks" : "Edited Remarks"}</th>
            <th>${dateLabel}</th>
          </tr>
        </thead>
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
  const [reportType, setReportType] = useState(""); // "deleted" | "edited" | ""
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Fetch whenever type or dates change ─────────────────────────────────────
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
        const result = await apiRequest(
          `${HMSURL}dept-budr/?${qp.toString()}`,
          "GET",
        );
        if (result.success) {
          setBills(result.data);
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
  }, [reportType, fromDate, toDate, HMSURL]); // eslint-disable-line

  const handleDateChange = (date, type) => {
    if (!date) return;
    type === "from" ? setFromDate(date) : setToDate(date);
  };

  const isDeleted = reportType === "deleted";

  const tableTitle =
    reportType === "deleted"
      ? "🗑 Department Bill — Deleted List"
      : reportType === "edited"
        ? "✏️ Department Bill — Edited List"
        : "";

  return (
    <PageContainer>
      <HeaderContainer>
        <PageTitle>📊 Dept Bill Update / Delete Report</PageTitle>
        <BackButton onClick={() => navigate(-1)}>← Back</BackButton>
      </HeaderContainer>

      <ContentCard>
        {/* ── Filters ── */}
        <FilterBar>
          <InputWrapper>
            <Label>Report Type</Label>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="">— Select Type —</option>
              <option value="deleted">🗑 Deleted Bills</option>
              <option value="edited">✏️ Edited Bills</option>
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

        {/* ── Table ── */}
        {!reportType ? (
          <PlaceholderState>
            <p>Select a report type to view data</p>
          </PlaceholderState>
        ) : loading ? (
          <PlaceholderState>
            <p>Loading...</p>
          </PlaceholderState>
        ) : bills.length === 0 ? (
          <EmptyState>
            <p>No records found for the selected period</p>
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
                    <Th>Sl.No</Th>
                    <Th>Bill No</Th>
                    <Th>UHID</Th>
                    <Th>Bill Type</Th>
                    <Th>{isDeleted ? "Deleted By" : "Edited By"}</Th>
                    <RemarksTh>
                      {isDeleted ? "Delete Remarks" : "Edited Remarks"}
                    </RemarksTh>
                    <Th style={{ minWidth: 160 }}>
                      {isDeleted
                        ? "Deleted Date & Time"
                        : "Last Modified Date & Time"}
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill, index) => (
                    <Tr key={index}>
                      <Td>{index + 1}</Td>
                      <Td>{bill.investBillNo || "—"}</Td>
                      <Td>{bill.uhid || "—"}</Td>
                      <Td>{bill.bill_name || bill.bill_type || "—"}</Td>
                      <Td>
                        {isDeleted ? (
                          <DeletedBadge title={bill.deletedBy}>
                            {bill.deletedByName || bill.deletedBy || "—"}
                          </DeletedBadge>
                        ) : (
                          <EditedBadge title={bill.lastmodified_by}>
                            {bill.lastmodified_by_name ||
                              bill.lastmodified_by ||
                              "—"}
                          </EditedBadge>
                        )}
                      </Td>
                      <RemarksTd>
                        {isDeleted
                          ? bill.deleteRemarks || "—"
                          : bill.editRemarks || "—"}
                      </RemarksTd>
                      <Td>
                        {isDeleted
                          ? formatDateTime(bill.deletedAt)
                          : formatDateTime(bill.lastmodified_date)}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            <div
              style={{
                fontSize: "0.75rem",
                color: colors.textMuted,
                textAlign: "right",
                marginTop: 6,
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
