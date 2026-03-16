import React, { useState, useEffect } from "react";
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
  Input,
  Select,
  Button,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  colors,
} from "../GlobalStyles";

// ─── Page Layout ──────────────────────────────────────────────────────────────

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

// ─── Filters ──────────────────────────────────────────────────────────────────

const FilterGrid = styled(FormRow)`
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  margin-bottom: 10px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 2px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 0.78rem;
  color: ${colors.textMain};
  input {
    cursor: pointer;
    width: 14px;
    height: 14px;
    accent-color: ${colors.primary};
  }
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

// ─── Table extras ─────────────────────────────────────────────────────────────

const ActionGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const ActionIcon = styled.span`
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  &:hover {
    transform: scale(1.15);
    background: #f0f0f0;
  }
`;

const ViewIcon = styled(ActionIcon)`
  color: #7c3aed;
`;

const PrintBtn = styled(Button)`
  background: ${colors.primary};
  padding: 3px 10px;
  font-size: 0.72rem;
  margin-right: 4px;
  &:hover {
    background: ${colors.primaryDark};
  }
`;

const ConvertBtn = styled(Button)`
  background: ${colors.secondary};
  padding: 3px 10px;
  font-size: 0.72rem;
  &:hover {
    background: #d97706;
  }
`;

// ─── Modal ────────────────────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 560px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: ${colors.primary};
  color: white;
`;

const ModalTitle = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
`;
const ModalClose = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  &:hover {
    opacity: 0.8;
  }
`;

const ModalBody = styled.div`
  padding: 12px;
  overflow-y: auto;
  flex: 1;
`;

const ModalTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
`;
const ModalTh = styled.th`
  background: ${colors.tabBg};
  padding: 6px 8px;
  text-align: left;
  font-weight: 600;
  color: ${colors.textMain};
  border-bottom: 2px solid ${colors.border};
  font-size: 0.72rem;
  white-space: nowrap;
`;
const ModalTd = styled.td`
  padding: 5px 8px;
  border-bottom: 1px solid ${colors.border};
  color: ${colors.textMain};
`;
const ModalTotalRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 4px 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${colors.textMain};
  border-top: 1px solid ${colors.border};
  margin-top: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${colors.textMuted};
  font-size: 0.82rem;
  &::before {
    content: "📭";
    font-size: 2.5rem;
    display: block;
    margin-bottom: 8px;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

const EstimateBillsReport = () => {
  // Initialize dates as dayjs objects directly — avoids the race condition
  // where useEffect sets them after the first fetch already fired with "".
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());

  const [filters, setFilters] = useState({
    billType: "",
    doctor: "",
    patientType: "ALL",
    uhid: "",
  });

  const [bills, setBills] = useState([]);
  const [billTypes, setBillTypes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [viewBill, setViewBill] = useState(null);

  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Fetch metadata once ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [btRes, drRes] = await Promise.all([
          apiRequest(`${HMSURL}bill-types/`, "GET"),
          apiRequest(`${HMSURL}doctor_list_diagnostics/`, "GET"),
        ]);
        if (btRes.success) setBillTypes(btRes.data.billTypes || []);
        if (drRes.success) setDoctors(drRes.data);
      } catch {
        toast.error("Failed to load filter options");
      }
    };
    fetchMeta();
  }, [HMSURL]); // eslint-disable-line

  // ── Fetch bills whenever any filter or date changes ──────────────────────────
  // All filtering is done server-side — no client-side filter useEffect needed.
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const qp = new URLSearchParams();

        // Dates — always sent (initialized to today so always valid)
        qp.append("fromDate", fromDate.format("YYYY-MM-DD"));
        qp.append("toDate", toDate.format("YYYY-MM-DD"));

        // Optional filters — only append when set
        if (filters.billType) qp.append("billType", filters.billType);
        if (filters.doctor) qp.append("doctor", filters.doctor);
        if (filters.uhid) qp.append("uhid", filters.uhid);
        if (filters.patientType !== "ALL")
          qp.append("patientType", filters.patientType);

        const result = await apiRequest(
          `${HMSURL}get-estimate-billings/?${qp.toString()}`,
          "GET",
        );

        if (result.success) {
          setBills(result.data);
        } else {
          toast.error(result.error || "Failed to fetch estimate bills");
          setBills([]);
        }
      } catch {
        toast.error("An unexpected error occurred");
        setBills([]);
      }
    };

    fetchBills();
  }, [filters, fromDate, toDate, HMSURL]); // eslint-disable-line

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, type) => {
    if (!date) return;
    type === "from" ? setFromDate(date) : setToDate(date);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
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

  const fmtName = (s, f, m, l) =>
    `${s || ""} ${f || ""} ${m ? m + " " : ""}${l || ""}`.trim();

  // ── Print ─────────────────────────────────────────────────────────────────────
  const handlePrint = (bill) => {
    const pw = window.open("", "_blank", "height=600,width=800");
    const getTotalPrice = (items) =>
      Array.isArray(items)
        ? items.reduce(
            (t, i) => t + parseFloat(i.price) * parseInt(i.quantity || 1),
            0,
          )
        : 0;

    pw.document
      .write(`<!DOCTYPE html><html><head><title>Estimate Bill Print</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:12px;margin:0;padding:10px;}
        .header{text-align:center;border-bottom:1px solid #000;padding-bottom:5px;margin-bottom:10px;}
        .hospital-name{font-weight:bold;font-size:14px;margin-bottom:3px;}
        .estimate-label{font-weight:bold;font-size:16px;color:#ff9800;text-align:center;margin:10px 0;text-decoration:underline;}
        .bill-row{display:flex;margin-bottom:5px;}
        .bill-label{font-weight:bold;width:130px;}
        .bill-value{flex-grow:1;}
        table{width:100%;border-collapse:collapse;margin-bottom:15px;}
        th,td{border:1px solid #000;padding:5px;text-align:left;}
        th{background-color:#fff3e0;}
        .total-section{margin-top:10px;border-top:1px solid #000;padding-top:5px;}
        .total-row{display:flex;justify-content:space-between;margin-bottom:5px;}
        .total-label{font-weight:bold;}
        .net-amount{font-weight:bold;font-size:14px;border-top:1px solid #000;padding-top:5px;}
        .note{margin-top:20px;padding:10px;background-color:#fff3e0;border-left:4px solid #ff9800;font-style:italic;}
        .signature{display:flex;justify-content:space-between;margin-top:30px;}
      </style></head><body>
      <div class="header">
        <div class="hospital-name">SHANMUGA HOSPITAL LIMITED</div>
        <div>51/24.Saradha College Road, Salem - 636007</div>
        <div>CIN: U85110TZ20PLC033974</div>
      </div>
      <div class="estimate-label">*** ESTIMATE BILL ***</div>
      <div><b>"${bill.paymentMethod || "NIL"}"</b>&nbsp;&nbsp;<b>${bill.bill_name || "NIL"}</b></div>
      <div style="margin:10px 0">
        <div class="bill-row"><div class="bill-label">Estimate Number</div><div class="bill-value">: ${bill.EstBillNo || ""}</div></div>
        <div class="bill-row"><div class="bill-label">OP Number</div><div class="bill-value">: ${bill.uhid || ""}</div></div>
        <div class="bill-row"><div class="bill-label">Estimate Date</div><div class="bill-value">: ${formatDateTime(bill.EstBillDate)}</div></div>
        <div class="bill-row"><div class="bill-label">Name</div><div class="bill-value">: ${fmtName(bill.salutation, bill.firstName, bill.middleName, bill.lastName)}</div></div>
        <div class="bill-row"><div class="bill-label">Doctor</div><div class="bill-value">: ${bill.doctor || ""}</div></div>
      </div>
      <table><thead><tr><th>SlNo</th><th>Description</th><th>Qty</th><th>Cost</th><th>Amount</th></tr></thead>
      <tbody>${
        Array.isArray(bill.item)
          ? bill.item
              .map(
                (it, i) =>
                  `<tr><td>${i + 1}</td><td>${it.itemName || ""}</td><td>${it.quantity || 1}</td><td>${parseFloat(it.price).toFixed(2)}</td><td>${(parseFloat(it.price) * parseInt(it.quantity || 1)).toFixed(2)}</td></tr>`,
              )
              .join("")
          : '<tr><td colspan="5">No Items</td></tr>'
      }</tbody></table>
      <div class="total-section">
        <div class="total-row"><div class="total-label">Total</div><div>${getTotalPrice(bill.item).toFixed(2)}</div></div>
        <div class="total-row"><div class="total-label">Discount</div><div>${bill.discount || "0.00"}</div></div>
        <div class="total-row net-amount"><div class="total-label">Estimated Net Amount</div><div>${bill.finalPrice || "0.00"}</div></div>
      </div>
      <div class="note"><strong>Note:</strong> This is an estimate bill. Final charges may vary. Please convert to a final bill at the time of payment.</div>
      <div class="signature"><div>${bill.uhid || ""}</div><div>(Authorized Signature)</div></div>
    </body></html>`);
    pw.document.close();
    setTimeout(() => pw.print(), 500);
  };

  const handleConvert = (bill) => {
    navigate("/InvestigationBilling", { state: { patientData: bill } });
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────────

  return (
    <PageContainer>
      <HeaderContainer>
        <PageTitle>📊 Estimate Bills</PageTitle>
        <BackButton onClick={() => navigate("/InvestigationBilling")}>
          ← Back to Billing
        </BackButton>
      </HeaderContainer>

      <ContentCard>
        <FilterGrid>
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

          <InputWrapper>
            <Label>Bill Type</Label>
            <Select
              name="billType"
              value={filters.billType}
              onChange={handleFilterChange}
            >
              <option value="">Select Bill Type</option>
              {billTypes.map((b) => (
                <option key={b.bill_type} value={b.bill_type}>
                  {b.bill_name}
                </option>
              ))}
            </Select>
          </InputWrapper>

          <InputWrapper>
            <Label>Doctor</Label>
            <Select
              name="doctor"
              value={filters.doctor}
              onChange={handleFilterChange}
            >
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.employeeId} value={d.employeeName}>
                  {d.employeeName}
                </option>
              ))}
            </Select>
          </InputWrapper>

          <InputWrapper>
            <Label>UHID</Label>
            <Input
              type="text"
              name="uhid"
              value={filters.uhid}
              onChange={handleFilterChange}
            />
          </InputWrapper>

          <InputWrapper>
            <Label>Patient Type</Label>
            <RadioGroup>
              {["OP", "IP", "ALL"].map((type) => (
                <RadioLabel key={type}>
                  <input
                    type="radio"
                    name="patientType"
                    value={type}
                    checked={filters.patientType === type}
                    onChange={handleFilterChange}
                  />
                  {type}
                </RadioLabel>
              ))}
            </RadioGroup>
          </InputWrapper>
        </FilterGrid>

        {bills.length > 0 ? (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Sl.No</Th>
                  <Th>Date / Time</Th>
                  <Th>Est.Bill No</Th>
                  <Th>UHID</Th>
                  <Th>IP No</Th>
                  <Th>Patient Name</Th>
                  <Th>Age</Th>
                  <Th>Bill Type</Th>
                  <Th>Estimate Amount</Th>
                  <Th>Doctor</Th>
                  <Th>Billed By</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill, index) => (
                  <Tr key={index}>
                    <Td>{index + 1}</Td>
                    <Td>{formatDateTime(bill.EstBillDate)}</Td>
                    <Td>{bill.EstBillNo}</Td>
                    <Td>{bill.uhid}</Td>
                    <Td>{bill.ipNumber}</Td>
                    <Td>
                      {fmtName(
                        bill.salutation,
                        bill.firstName,
                        bill.middleName,
                        bill.lastName,
                      )}
                    </Td>
                    <Td>{bill.age}</Td>
                    <Td>{bill.bill_name}</Td>
                    <Td>₹ {bill.finalPrice}</Td>
                    <Td>{bill.doctor}</Td>
                    <Td>{bill.created_by}</Td>
                    <Td>
                      <ActionGroup>
                        <PrintBtn onClick={() => handlePrint(bill)}>
                          🖨 Print
                        </PrintBtn>
                        <ViewIcon
                          onClick={() => setViewBill(bill)}
                          title="View Items"
                        >
                          👁
                        </ViewIcon>
                        <ConvertBtn onClick={() => handleConvert(bill)}>
                          🔄 Convert
                        </ConvertBtn>
                      </ActionGroup>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        ) : (
          <EmptyState>
            <p>No matching records found</p>
          </EmptyState>
        )}
      </ContentCard>

      {/* ── View Items Modal ── */}
      {viewBill && (
        <ModalOverlay onClick={() => setViewBill(null)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                🔬 Items — Estimate No: {viewBill.EstBillNo}
              </ModalTitle>
              <ModalClose onClick={() => setViewBill(null)}>✕</ModalClose>
            </ModalHeader>
            <ModalBody>
              <ModalTable>
                <thead>
                  <tr>
                    <ModalTh>Sl.No</ModalTh>
                    <ModalTh>Item Name</ModalTh>
                    <ModalTh>Qty</ModalTh>
                    <ModalTh>Price</ModalTh>
                    <ModalTh>Amount</ModalTh>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(viewBill.item) && viewBill.item.length > 0 ? (
                    viewBill.item.map((item, idx) => (
                      <tr key={idx}>
                        <ModalTd>{idx + 1}</ModalTd>
                        <ModalTd>{item.itemName}</ModalTd>
                        <ModalTd>{item.quantity || 1}</ModalTd>
                        <ModalTd>₹ {parseFloat(item.price).toFixed(2)}</ModalTd>
                        <ModalTd>
                          ₹{" "}
                          {(
                            parseFloat(item.price) *
                            parseInt(item.quantity || 1)
                          ).toFixed(2)}
                        </ModalTd>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <ModalTd
                        colSpan={5}
                        style={{ textAlign: "center", color: colors.textMuted }}
                      >
                        No items found
                      </ModalTd>
                    </tr>
                  )}
                </tbody>
              </ModalTable>
              <ModalTotalRow>
                <span>
                  Total: ₹ {parseFloat(viewBill.total || 0).toFixed(2)}
                </span>
                <span style={{ marginLeft: 12 }}>
                  Discount: ₹ {viewBill.discount || "0.00"}
                </span>
                <span style={{ marginLeft: 12, color: colors.primary }}>
                  Net: ₹ {viewBill.finalPrice || "0.00"}
                </span>
              </ModalTotalRow>
            </ModalBody>
          </ModalBox>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default EstimateBillsReport;
