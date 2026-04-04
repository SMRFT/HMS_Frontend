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

const PrintIcon = styled(ActionIcon)`
  color: ${colors.primary};
`;
const ViewIcon = styled(ActionIcon)`
  color: #7c3aed;
`;
const EditIcon = styled(ActionIcon)`
  color: ${colors.secondary};
`;
const DeleteIcon = styled(ActionIcon)`
  color: ${colors.danger};
`;

// ─── Frozen-column table ──────────────────────────────────────────────────────
// border-collapse:separate is required for position:sticky to work on td/th.

const FrozenTableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 6px;
  border: 1px solid ${colors.border};

  table {
    border-collapse: separate;
    border-spacing: 0;
    min-width: 1500px;
    width: 100%;
  }
`;

// Frozen columns and their cumulative left offsets
//  Col 1  Sl.No        44px   left:   0
//  Col 2  Date/Time   150px   left:  44
//  Col 3  Bill No     130px   left: 194
//  Col 4  UHID No     100px   left: 324
//  Col 5  IP No        80px   left: 424
//  Col 6  Patient Name 160px  left: 504  ← last frozen (shadow here)

const COL = {
  slNo: { width: 44, left: 0 },
  dateTime: { width: 150, left: 44 },
  billNo: { width: 130, left: 194 },
  uhid: { width: 100, left: 324 },
  ipNo: { width: 80, left: 424 },
  patientName: { width: 160, left: 504 },
};

const frozenShadow = `
  &::after {
    content: "";
    position: absolute;
    top: 0; right: -6px;
    width: 6px; height: 100%;
    background: linear-gradient(to right, rgba(0,0,0,0.09), transparent);
    pointer-events: none;
  }
`;

const StickyTh = styled(Th)`
  position: sticky;
  left: ${({ $left }) => $left}px;
  min-width: ${({ $width }) => $width}px;
  max-width: ${({ $width }) => $width}px;
  z-index: 3;
  background: ${colors.tabBg || "#f1f5f9"};
  white-space: nowrap;
  border-right: 1px solid ${colors.border};
  ${({ $last }) => ($last ? frozenShadow : "")}
`;

const StickyTd = styled(Td)`
  position: sticky;
  left: ${({ $left }) => $left}px;
  min-width: ${({ $width }) => $width}px;
  max-width: ${({ $width }) => $width}px;
  z-index: 2;
  background: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-right: 1px solid ${colors.border};
  ${({ $last }) => ($last ? frozenShadow : "")}
`;

// Sticky td background for striped/hover rows — match Tr background
const StickyTdAlt = styled(StickyTd)`
  tr:hover & {
    background: ${colors.rowHover || "#f8fafc"};
  }
`;

// Remarks — wide, wraps text, muted colour
const RemarksTh = styled(Th)`
  min-width: 240px;
`;

const RemarksTd = styled(Td)`
  min-width: 240px;
  max-width: 320px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
  font-size: 0.76rem;
  color: ${colors.textMuted};
  vertical-align: top;
  padding-top: 6px;
`;

// ─── Modals ───────────────────────────────────────────────────────────────────

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

// ─── Remarks edit modal ───────────────────────────────────────────────────────

const RemarksModalBox = styled(ModalBox)`
  max-width: 420px;
  max-height: unset;
`;

const RemarksModalBody = styled(ModalBody)`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RemarksTextarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  resize: vertical;
  border: 1px solid ${({ $error }) => ($error ? colors.danger : colors.border)};
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 0.82rem;
  color: ${colors.textMain};
  font-family: inherit;
  line-height: 1.5;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: ${({ $error }) => ($error ? colors.danger : colors.primary)};
    box-shadow: 0 0 0 2px
      ${({ $error }) =>
        $error ? "rgba(239,68,68,0.12)" : "rgba(13,148,136,0.1)"};
  }
`;

const ErrorText = styled.span`
  font-size: 0.74rem;
  color: ${colors.danger};
  margin-top: -6px;
`;

const RemarksModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid ${colors.border};
`;

const CancelBtn = styled(Button)`
  background: ${colors.textMuted};
  font-size: 0.78rem;
  padding: 5px 14px;
  &:hover {
    background: #475569;
  }
`;

const ConfirmBtn = styled(Button)`
  background: ${colors.secondary};
  font-size: 0.78rem;
  padding: 5px 14px;
  &:hover {
    background: #d97706;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

const BillsReport = () => {
  const [estimateBills, setEstimateBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [filters, setFilters] = useState({
    billType: "",
    doctor: "",
    patientType: "ALL",
    uhid: "",
  });
  const [billTypes, setBillTypes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [viewBill, setViewBill] = useState(null);
  const [remarksBill, setRemarksBill] = useState(null);
  const [remarksValue, setRemarksValue] = useState("");
  const [remarksError, setRemarksError] = useState(false);

  // Delete remarks modal state
  const [deleteBill, setDeleteBill] = useState(null);
  const [deleteRemarks, setDeleteRemarks] = useState("");
  const [deleteRemarksErr, setDeleteRemarksErr] = useState(false);

  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const formatBillDate = (dateStr) => {
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

  // ── Fetch bills ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const qp = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v && v !== "ALL") qp.append(k, v);
        });
        qp.append("start_date", fromDate.format("YYYY-MM-DD"));
        qp.append("end_date", toDate.format("YYYY-MM-DD"));

        const result = await apiRequest(
          `${HMSURL}investBillingGet/?${qp.toString()}`,
          "GET",
        );
        if (result.success) {
          setEstimateBills(result.data);
          setFilteredBills(result.data);
        } else {
          toast.error(result.error || "Failed to fetch bills");
        }
      } catch {
        toast.error("An unexpected error occurred");
      }
    };
    fetchBills();
  }, [filters, fromDate, toDate, HMSURL]); // eslint-disable-line

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const btRes = await apiRequest(`${HMSURL}bill-types/`, "GET");
        if (btRes.success) setBillTypes(btRes.data.billTypes || []);
        const drRes = await apiRequest(
          `${HMSURL}doctor_list_diagnostics/`,
          "GET",
        );
        if (drRes.success) setDoctors(drRes.data);
      } catch {
        toast.error("An unexpected error occurred");
      }
    };
    fetchMeta();
  }, [HMSURL]);

  // belt-and-suspenders client side IP/OP filter
  useEffect(() => {
    setFilteredBills(
      estimateBills.filter((bill) => {
        if (filters.patientType === "IP" && !(bill.uhid && bill.ipNumber))
          return false;
        if (filters.patientType === "OP" && !(bill.uhid && !bill.ipNumber))
          return false;
        return true;
      }),
    );
  }, [estimateBills, filters.patientType]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, dateType) => {
    if (!date) return;
    dateType === "from" ? setFromDate(date) : setToDate(date);
  };

  // ── Print ────────────────────────────────────────────────────────────────────
  const handlePrint = (bill) => {
    const pw = window.open("", "_blank", "height=600,width=800");
    const fmtDT = (s) => {
      if (!s) return "";
      const n = s.endsWith("Z") || s.includes("+") ? s : s + "Z";
      return new Date(n)
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
    pw.document.write(`<!DOCTYPE html><html><head><title>Bill Print</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:12px;margin:0;padding:10px;}
        .header{text-align:center;border-bottom:1px solid #000;padding-bottom:5px;margin-bottom:10px;}
        .hospital-name{font-weight:bold;font-size:14px;margin-bottom:3px;}
        .bill-row{display:flex;margin-bottom:5px;}
        .bill-label{font-weight:bold;width:120px;}
        .bill-value{flex-grow:1;}
        table{width:100%;border-collapse:collapse;margin-bottom:15px;}
        th,td{border:1px solid #000;padding:5px;text-align:left;}
        th{background:#f2f2f2;}
        .total-row{display:flex;justify-content:space-between;margin-bottom:5px;}
        .total-label{font-weight:bold;}
        .net-amount{font-weight:bold;font-size:14px;border-top:1px solid #000;padding-top:5px;}
        .signature{display:flex;justify-content:space-between;margin-top:30px;}
      </style></head><body>
      <div class="header">
        <div class="hospital-name">SHANMUGA HOSPITAL LIMITED</div>
        <div>51/24.Saradha College Road, Salem - 636007</div>
        <div>CIN: U85110TZ20PLC033974</div>
      </div>
      <div><b>"${bill.paymentMethod || "NIL"}"</b>&nbsp;&nbsp;<b>${bill.bill_name || "NIL"}</b></div>
      <div style="margin:10px 0">
        <div class="bill-row"><div class="bill-label">Bill Number</div><div class="bill-value">: ${bill.investBillNo || bill.EstBillNo || ""}</div></div>
        <div class="bill-row"><div class="bill-label">OP Number</div><div class="bill-value">: ${bill.uhid || ""}</div></div>
        <div class="bill-row"><div class="bill-label">Bill Date</div><div class="bill-value">: ${fmtDT(bill.investBillDate || bill.EstBillDate)}</div></div>
        <div class="bill-row"><div class="bill-label">Name/Age/Gender</div><div class="bill-value">: ${fmtName(bill.salutation, bill.firstName, bill.middleName, bill.lastName)} / ${bill.age}Y / ${bill.gender}</div></div>
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
      <div style="border-top:1px solid #000;padding-top:5px;">
        <div class="total-row"><div class="total-label">Total</div><div>${parseFloat(bill.total || 0).toFixed(2)}</div></div>
        <div class="total-row"><div class="total-label">Discount</div><div>${bill.discount || "0.00"}</div></div>
        <div class="total-row net-amount"><div class="total-label">Net Amount</div><div>${bill.finalPrice || "0.00"}</div></div>
      </div>
      <div class="signature"><div>${bill.created_by}</div><div>(Signature)</div></div>
      </body></html>`);
    pw.document.close();
    setTimeout(() => pw.print(), 500);
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const handleEdit = (bill) => {
    setRemarksBill({ ...bill });
    setRemarksValue("");
    setRemarksError(false);
  };

  const handleRemarksCancel = () => {
    setRemarksBill(null);
    setRemarksValue("");
    setRemarksError(false);
  };

  const handleRemarksConfirm = () => {
    if (!remarksValue.trim()) {
      setRemarksError(true);
      return;
    }
    navigate("/InvestigationBilling", {
      state: {
        patientData: { ...remarksBill, editRemarks: remarksValue.trim() },
      },
    });
    setRemarksBill(null);
    setRemarksValue("");
    setRemarksError(false);
  };

  // ── Delete (remarks modal) ───────────────────────────────────────────────────
  const handleDelete = (bill) => {
    setDeleteBill({ ...bill });
    setDeleteRemarks("");
    setDeleteRemarksErr(false);
  };

  const handleDeleteCancel = () => {
    setDeleteBill(null);
    setDeleteRemarks("");
    setDeleteRemarksErr(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRemarks.trim()) {
      setDeleteRemarksErr(true);
      return;
    }
    try {
      const result = await apiRequest(`${HMSURL}delete-bill/`, "PATCH", {
        investBillNo: deleteBill.investBillNo || deleteBill.EstBillNo,
        deleteRemarks: deleteRemarks.trim(),
      });
      if (result.success) {
        toast.success("Bill deleted.");
        const billNo = deleteBill.investBillNo || deleteBill.EstBillNo;
        setEstimateBills((prev) =>
          prev.filter((b) => (b.investBillNo || b.EstBillNo) !== billNo),
        );
        handleDeleteCancel();
      } else {
        toast.error(result.error || "Failed to delete bill");
      }
    } catch {
      toast.error("An error occurred while deleting the bill.");
    }
  };

  const fmtName = (s, f, m, l) =>
    `${s || ""} ${f || ""} ${m ? m + " " : ""}${l || ""}`.trim();

  // ─── JSX ──────────────────────────────────────────────────────────────────────

  return (
    <PageContainer>
      <HeaderContainer>
        <PageTitle>📄 Bills Report</PageTitle>
        <BackButton onClick={() => navigate(-1)}>← Back to Billing</BackButton>
      </HeaderContainer>

      <ContentCard>
        {/* Filters */}
        <FilterGrid>
          <InputWrapper>
            <Label>From Date</Label>
            <StyledDatePicker
              value={fromDate}
              onChange={(date) => handleDateChange(date, "from")}
              format="DD-MM-YYYY"
              allowClear={false}
            />
          </InputWrapper>

          <InputWrapper>
            <Label>To Date</Label>
            <StyledDatePicker
              value={toDate}
              onChange={(date) => handleDateChange(date, "to")}
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

        {/* Table */}
        {filteredBills.length > 0 ? (
          <FrozenTableWrapper>
            <table>
              <thead>
                <tr>
                  {/* ── Frozen header cells ── */}
                  <StickyTh $left={COL.slNo.left} $width={COL.slNo.width}>
                    Sl.No
                  </StickyTh>
                  <StickyTh
                    $left={COL.dateTime.left}
                    $width={COL.dateTime.width}
                  >
                    Date / Time
                  </StickyTh>
                  <StickyTh $left={COL.billNo.left} $width={COL.billNo.width}>
                    Bill No
                  </StickyTh>
                  <StickyTh $left={COL.uhid.left} $width={COL.uhid.width}>
                    UHID No
                  </StickyTh>
                  <StickyTh $left={COL.ipNo.left} $width={COL.ipNo.width}>
                    IP No
                  </StickyTh>
                  <StickyTh
                    $left={COL.patientName.left}
                    $width={COL.patientName.width}
                    $last
                  >
                    Patient Name
                  </StickyTh>
                  {/* ── Scrollable header cells ── */}
                  <Th>Age</Th>
                  <Th>Bill Type</Th>
                  <Th>Bill Amount</Th>
                  <Th>Payment Method</Th>
                  <Th>Doctor</Th>
                  <Th>Billed By</Th>
                  <Th>Edited By</Th>
                  <RemarksTh>Remarks</RemarksTh>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill, index) => (
                  <Tr key={index}>
                    {/* ── Frozen body cells ── */}
                    <StickyTd $left={COL.slNo.left} $width={COL.slNo.width}>
                      {index + 1}
                    </StickyTd>
                    <StickyTd
                      $left={COL.dateTime.left}
                      $width={COL.dateTime.width}
                    >
                      {formatBillDate(bill.investBillDate || bill.EstBillDate)}
                    </StickyTd>
                    <StickyTd $left={COL.billNo.left} $width={COL.billNo.width}>
                      {bill.investBillNo || bill.EstBillNo}
                    </StickyTd>
                    <StickyTd $left={COL.uhid.left} $width={COL.uhid.width}>
                      {bill.uhid}
                    </StickyTd>
                    <StickyTd $left={COL.ipNo.left} $width={COL.ipNo.width}>
                      {bill.ipNumber}
                    </StickyTd>
                    <StickyTd
                      $left={COL.patientName.left}
                      $width={COL.patientName.width}
                      $last
                    >
                      {fmtName(
                        bill.salutation,
                        bill.firstName,
                        bill.middleName,
                        bill.lastName,
                      )}
                    </StickyTd>
                    {/* ── Scrollable body cells ── */}
                    <Td>{bill.age}</Td>
                    <Td>{bill.bill_name}</Td>
                    <Td>₹ {bill.finalPrice}</Td>
                    <Td>{bill.paymentMethod}</Td>
                    <Td>{bill.doctor}</Td>
                    <Td>{bill.created_by}</Td>
                    <Td>{bill.lastmodified_by}</Td>
                    <RemarksTd>{bill.editRemarks}</RemarksTd>
                    <Td>
                      <ActionGroup>
                        <PrintIcon
                          onClick={() => handlePrint(bill)}
                          title="Print"
                        >
                          🖨
                        </PrintIcon>
                        <ViewIcon
                          onClick={() => setViewBill(bill)}
                          title="View Items"
                        >
                          👁
                        </ViewIcon>
                        <EditIcon onClick={() => handleEdit(bill)} title="Edit">
                          ✏️
                        </EditIcon>
                        <DeleteIcon
                          onClick={() => handleDelete(bill)}
                          title="Delete"
                        >
                          🗑️
                        </DeleteIcon>
                      </ActionGroup>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </table>
          </FrozenTableWrapper>
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
                🔬 Items — Bill No:{" "}
                {viewBill.investBillNo || viewBill.EstBillNo}
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
                <span>Total:</span>
                <span>₹ {parseFloat(viewBill.total || 0).toFixed(2)}</span>
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

      {/* ── Delete Remarks Modal ── */}
      {deleteBill && (
        <ModalOverlay onClick={handleDeleteCancel}>
          <RemarksModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader style={{ background: colors.danger }}>
              <ModalTitle>
                🗑️ Delete Remarks — Bill No:{" "}
                {deleteBill.investBillNo || deleteBill.EstBillNo}
              </ModalTitle>
              <ModalClose onClick={handleDeleteCancel}>✕</ModalClose>
            </ModalHeader>
            <RemarksModalBody>
              <Label>
                Reason for Deletion{" "}
                <span style={{ color: colors.danger, marginLeft: 2 }}>*</span>
              </Label>
              <RemarksTextarea
                $error={deleteRemarksErr}
                placeholder="Enter reason for deleting this bill..."
                value={deleteRemarks}
                onChange={(e) => {
                  setDeleteRemarks(e.target.value);
                  if (e.target.value.trim()) setDeleteRemarksErr(false);
                }}
                autoFocus
              />
              {deleteRemarksErr && (
                <ErrorText>
                  ⚠ Reason is required to proceed with deletion.
                </ErrorText>
              )}
            </RemarksModalBody>
            <RemarksModalFooter>
              <CancelBtn type="button" onClick={handleDeleteCancel}>
                Cancel
              </CancelBtn>
              <ConfirmBtn
                type="button"
                onClick={handleDeleteConfirm}
                style={{ background: colors.danger }}
              >
                🗑️ Confirm Delete
              </ConfirmBtn>
            </RemarksModalFooter>
          </RemarksModalBox>
        </ModalOverlay>
      )}

      {/* ── Edit Remarks Modal ── */}
      {remarksBill && (
        <ModalOverlay onClick={handleRemarksCancel}>
          <RemarksModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                ✏️ Edit Remarks — Bill No:{" "}
                {remarksBill.investBillNo || remarksBill.EstBillNo}
              </ModalTitle>
              <ModalClose onClick={handleRemarksCancel}>✕</ModalClose>
            </ModalHeader>
            <RemarksModalBody>
              <Label>
                Remarks{" "}
                <span style={{ color: colors.danger, marginLeft: 2 }}>*</span>
              </Label>
              <RemarksTextarea
                $error={remarksError}
                placeholder="Enter reason for editing this bill..."
                value={remarksValue}
                onChange={(e) => {
                  setRemarksValue(e.target.value);
                  if (e.target.value.trim()) setRemarksError(false);
                }}
                autoFocus
              />
              {remarksError && (
                <ErrorText>
                  ⚠ Remarks is required to proceed with edit.
                </ErrorText>
              )}
            </RemarksModalBody>
            <RemarksModalFooter>
              <CancelBtn type="button" onClick={handleRemarksCancel}>
                Cancel
              </CancelBtn>
              <ConfirmBtn type="button" onClick={handleRemarksConfirm}>
                ✏️ Proceed to Edit
              </ConfirmBtn>
            </RemarksModalFooter>
          </RemarksModalBox>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default BillsReport;
