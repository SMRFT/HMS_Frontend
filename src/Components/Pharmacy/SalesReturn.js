import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import apiRequest from "../../Auth/apiRequest";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Global ─────────────────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #f4f6f9; color: #333; }
`;

// ─── Animations ──────────────────────────────────────────────────────────────
const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Toast Notification ───────────────────────────────────────────────────────
const ToastContainer = styled.div`
  position: fixed;
  top: 28px;
  right: 28px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
`;

const ToastItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: ${p => p.$type === "success" ? "#1b5e20" : p.$type === "error" ? "#b71c1c" : "#e65100"};
  color: #fff;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 13px;
  min-width: 280px;
  max-width: 380px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.22);
  animation: ${slideUp} 0.25s ease;
  pointer-events: all;
  line-height: 1.45;
`;

const ToastIcon = styled.span`
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
`;

const ToastMsg = styled.span`
  flex: 1;
`;

let _toastId = 0;

function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info", duration = 3500) => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  };

  const ToastPortal = () => (
    <ToastContainer>
      {toasts.map(t => (
        <ToastItem key={t.id} $type={t.type}>
          <ToastIcon>
            {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "⚠️"}
          </ToastIcon>
          <ToastMsg>{t.message}</ToastMsg>
        </ToastItem>
      ))}
    </ToastContainer>
  );

  return { showToast, ToastPortal };
}

// ─── Page Layout ─────────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  padding: 0;
  min-height: 100vh;
  background: #f4f6f9;
`;

const Breadcrumb = styled.div`
  background: #fff;
  padding: 10px 20px;
  font-size: 13px;
  color: #555;
  border-bottom: 1px solid #e0e0e0;
  span { color: #999; margin: 0 5px; }
  a { color: #007bff; text-decoration: none; }
`;

const ContentArea = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  flex-wrap: wrap;
`;

const DateGroup = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
`;

const FieldWrap = styled.div``;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #555;
  display: block;
  margin-bottom: 4px;
`;

const DateInput = styled.input`
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 13px;
  color: #333;
  outline: none;
  &:focus { border-color: #2e7d32; }
`;

const SearchBtn = styled.button`
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  transition: background 0.2s;
  &:hover { background: #1b5e20; }
`;

// Donut
const DonutWrapper = styled.div`
  width: 90px;
  height: 90px;
  flex-shrink: 0;
`;

const DonutSvg = styled.svg`
  transform: rotate(-90deg);
`;

const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
`;

const Dot = styled.span`
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: ${p => p.color};
  flex-shrink: 0;
`;

const LegendLabel = styled.span`
  flex: 1;
  color: #444;
`;

const LegendCount = styled.span`
  font-weight: 700;
  color: #222;
  min-width: 18px;
  text-align: right;
`;

// New Return Button
const NewReturnBtn = styled.button`
  margin-left: auto;
  background: ${p => p.$open ? '#bf360c' : '#f57c00'};
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
  &:hover { background: ${p => p.$open ? '#9a1e05' : '#e65100'}; }
`;

// ─── Inline Form Card ─────────────────────────────────────────────────────────
const FormCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  animation: ${slideDown} 0.25s ease;
`;

const FormBody = styled.div`
  padding: 20px 24px 24px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 14px 20px;
  margin-bottom: 18px;
`;

const BillRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px 20px;
  margin-bottom: 18px;
`;

const BillTypeOnlyRow = styled.div`
  display: grid;
  grid-template-columns: minmax(170px, 220px);
  gap: 14px 20px;
  margin-bottom: 18px;
`;

const FormGroup = styled.div``;

const InputRow = styled.div`
  display: flex;
  gap: 4px;
`;

const FormInput = styled.input`
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 13px;
  outline: none;
  background: ${p => p.readOnly ? '#f5f5f5' : '#fff'};
  color: #333;
  &:focus { border-color: #00796b; }
`;

const IconBtn = styled.button`
  padding: 0 9px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  background: #f5f5f5;
  font-size: 13px;
  flex-shrink: 0;
  &:hover { background: #e0e0e0; }
`;

const FormSelect = styled.select`
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 13px;
  outline: none;
  background: #fff;
  color: #333;
  &:focus { border-color: #00796b; }
`;

const AgeRow = styled.div`
  display: flex;
  gap: 5px;
  input { width: 52px; text-align: center; }
`;

const RadioGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 6px;
  label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    cursor: pointer;
  }
  input[type="radio"] { accent-color: #00796b; cursor: pointer; }
`;

const FormActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 4px;
`;

const ResetBtn = styled.button`
  background: #616161;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
  &:hover { background: #424242; }
`;

const FormSearchBtn = styled.button`
  background: #00796b;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
  &:hover { background: #004d40; }
`;

const SaveBtn = styled.button`
  background: #1565c0;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
  &:hover { background: #0d47a1; }
  &:disabled { background: #90a4ae; cursor: not-allowed; }
`;

const BillItemsFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 10px 12px;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
`;

// ─── Table Card ───────────────────────────────────────────────────────────────
const TableCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const TableToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 14px 16px 10px;
  gap: 10px;
  flex-wrap: wrap;
`;

const ModeBtn = styled.button`
  border: 2px solid ${p => p.color};
  background: ${p => p.$active ? p.color : '#fff'};
  color: ${p => p.$active ? '#fff' : p.color};
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${p => p.color}; color: #fff; }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
  input {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 13px;
    outline: none;
    min-width: 160px;
    &:focus { border-color: #007bff; }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  background: #fafafa;
  border-top: 1px solid #ebebeb;
  border-bottom: 1px solid #ebebeb;
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  color: #444;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 10px 14px;
  border-bottom: 1px solid #f2f2f2;
  color: #333;
  vertical-align: middle;
`;

const CashBadge = styled.span`
  background: ${p =>
    p.$mode === "IP Credit" ? "#f9a825" :
    p.$mode === "Other Mode" ? "#5c6bc0" :
    "#00796b"};
  color: #fff;
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  min-width: 80px;
  text-align: center;
`;

const NoRecords = styled.div`
  text-align: center;
  padding: 32px;
  color: #999;
  font-size: 13px;
`;

const ShowingText = styled.div`
  padding: 10px 16px;
  font-size: 12px;
  color: #666;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 16px 14px;
  gap: 4px;
`;

const PageBtn = styled.button`
  border: 1px solid #ddd;
  background: ${p => p.$active ? '#007bff' : '#fff'};
  color: ${p => p.$active ? '#fff' : '#333'};
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 13px;
  cursor: ${p => p.disabled ? 'default' : 'pointer'};
  opacity: ${p => p.disabled ? 0.5 : 1};
`;

// ─── Bill Items Table ─────────────────────────────────────────────────────────
const BillItemsSection = styled.div`
  margin-top: 18px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
`;

const BillItemsTitle = styled.div`
  background: #f5f5f5;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #444;
  border-bottom: 1px solid #e0e0e0;
`;

const PartialReturnBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff8e1;
  border-left: 4px solid #f9a825;
  padding: 9px 14px;
  font-size: 12.5px;
  color: #5d4037;
  border-bottom: 1px solid #ffe082;
`;

/* Small inline badge shown next to item name when partially returned */
const PartialBadge = styled.span`
  display: inline-block;
  margin-left: 6px;
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffcc80;
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 700;
  vertical-align: middle;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

/* Shows how many units were already returned, in a muted red chip */
const AlreadyReturnedBadge = styled.span`
  display: inline-block;
  background: #fbe9e7;
  color: #bf360c;
  border: 1px solid #ffab91;
  border-radius: 10px;
  padding: 1px 9px;
  font-size: 12px;
  font-weight: 700;
`;

const BillItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const BillItemsTh = styled.th`
  background: #fafafa;
  padding: 9px 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 1px solid #e8e8e8;
  white-space: nowrap;
`;

const BillItemsTd = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid #f2f2f2;
  color: #333;
  vertical-align: middle;
`;

const ReturnQtyInput = styled.input`
  width: 80px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 13px;
  outline: none;
  text-align: center;
  &:focus { border-color: #00796b; }
`;

// ─── UHID Modal ───────────────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  background: #fff;
  border-radius: 8px;
  width: 680px;
  max-width: 96vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 40px rgba(0,0,0,0.22);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  background: #00695c;
  color: #fff;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalCloseBtn = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
  &:hover { opacity: 0.75; }
`;

const ModalBody = styled.div`
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
`;

const ModalTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const ModalTh = styled.th`
  background: #f5f5f5;
  padding: 9px 12px;
  text-align: left;
  font-weight: 600;
  color: #444;
  border-bottom: 2px solid #e0e0e0;
  white-space: nowrap;
`;

const ModalTd = styled.td`
  padding: 9px 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  vertical-align: middle;
`;

const SelectBillBtn = styled.button`
  background: #00796b;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
  &:hover { background: #004d40; }
`;

const ModalFooter = styled.div`
  padding: 10px 20px;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #888;
  background: #fafafa;
`;

// ─── Donut Component ──────────────────────────────────────────────────────────
function DonutChart({ cashCount, ipCount, otherCount }) {
  const r = 36, cx = 45, cy = 45;
  const circumference = 2 * Math.PI * r;
  const total = cashCount + ipCount + otherCount;

  if (!total) {
    return (
      <DonutWrapper>
        <DonutSvg width="90" height="90" viewBox="0 0 90 90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e0e0e0" strokeWidth="10" />
        </DonutSvg>
      </DonutWrapper>
    );
  }

  const segments = [
    { count: cashCount,  color: "#00796b" },
    { count: ipCount,    color: "#f9a825" },
    { count: otherCount, color: "#4dd0e1" },
  ];

  let accumulated = 0;
  return (
    <DonutWrapper>
      <DonutSvg width="90" height="90" viewBox="0 0 90 90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e0e0e0" strokeWidth="10" />
        {segments.map((seg, i) => {
          if (!seg.count) return null;
          const len = (seg.count / total) * circumference;
          const offset = -accumulated;
          accumulated += len;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </DonutSvg>
    </DonutWrapper>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SalesReturn = () => {
  const today        = new Date().toISOString().split("T")[0];
  const todayDisplay = today.split("-").reverse().join("-");

  const [fromDate, setFromDate]         = useState(today);
  const [toDate, setToDate]             = useState(today);
  const [returnList, setReturnList]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const formRef = useRef(null);

  const [fetchingPatient, setFetchingPatient]     = useState(false);
  const [fetchingBill, setFetchingBill]           = useState(false);
  const [billTypes, setBillTypes]                 = useState([]);
  const [billItems, setBillItems]                 = useState([]);
  const [partialReturnWarning, setPartialReturnWarning] = useState("");

  // ── UHID Bills Modal State ──────────────────────────────────────────────────
  const [showUhidModal, setShowUhidModal]     = useState(false);
  const [uhidBills, setUhidBills]             = useState([]);
  const [loadingUhidBills, setLoadingUhidBills] = useState(false);

  const { showToast, ToastPortal } = useToast();

  const [form, setForm] = useState({
    uhidNo: "", ipNumber: "", name: "",
    ageY: "", ageM: "", ageD: "",
    gender: "", requestNo: "", paymentType: "Cash",
    billType: "", billName: "", billNumber: "", billAmount: "",
  });

  useEffect(() => {
    const fetchBillTypes = async () => {
      try {
        const response = await apiRequest(`${HmsBaseUrl}get_pharmacy_BillType/`, "GET");
        if (response.success && Array.isArray(response.data?.data)) {
          const data = response.data.data;
          setBillTypes(data);
          if (data.length > 0) {
            setForm((prev) => ({
              ...prev,
              billType: data[0].bill_type,
              billName: data[0].bill_name,
            }));
          }
        } else {
          setBillTypes([]);
        }
      } catch (error) {
        console.error("Error fetching bill types:", error);
        setBillTypes([]);
      }
    };
    fetchBillTypes();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(
        `${HmsBaseUrl}get_salesreturn_details/?from_date=${fromDate}&to_date=${toDate}`,
        "GET"
      );
      const data = res.data;
      setReturnList(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error("Sales return fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── FIX #2: normalise partial UHID/bill — support typing after slash ─────────
  // Accepts: "7878" → searches as-is (partial match on backend)
  // Accepts: "S025/007878" → searches full string
  // Accepts: "007878" (after slash part only) → backend handles partial match
  const normalizeSearchValue = (val) => val?.trim() ?? "";

  // ── Step 1: fetch patient info + open bill-selection modal ───────────────────
  const fetchPatientDetails = async (uhid) => {
    const uhidVal = normalizeSearchValue(uhid);
    if (!uhidVal) {
      showToast("Please enter a UHID to search.", "warning");
      return;
    }

    try {
      setFetchingPatient(true);

      // Fetch patient basic info
      const res = await apiRequest(
        `${HmsBaseUrl}salesreturn_get_patientdetails/?uhid=${encodeURIComponent(uhidVal)}`,
        "GET"
      );
      const data = res.data;

      if (data?.status === "success") {
        const d = data.data;
        setForm(prev => ({
          ...prev,
          uhidNo:   d.uhid     || uhidVal,
          ipNumber: d.ip_number || "",
          name:     d.name     || "",
          gender:   d.gender   || "",
          ageY:     d.age?.years  ?? "",
          ageM:     d.age?.months ?? "",
          ageD:     d.age?.days   ?? "",
        }));
      }

      // Step 2: fetch all bills within 30 days for this UHID and show modal
      await fetchUhidBills(uhidVal);

    } catch (err) {
      console.error("Fetch patient error:", err);
      showToast("Server error while fetching patient details.", "error");
    } finally {
      setFetchingPatient(false);
    }
  };

  // ── Fetch all bills for UHID within 30 days ──────────────────────────────────
  const fetchUhidBills = async (uhidVal) => {
    try {
      setLoadingUhidBills(true);
      setUhidBills([]);
      setShowUhidModal(true);

      const res = await apiRequest(
        `${HmsBaseUrl}salesreturn_get_uhid_bills/?uhid=${encodeURIComponent(uhidVal)}`,
        "GET"
      );
      const data = res.data;

      if (data?.status === "success" && Array.isArray(data.data)) {
        setUhidBills(data.data);
        if (data.data.length === 0) {
          showToast("No paid bills found within the last 30 days for this UHID.", "warning");
        }
      } else {
        showToast(data?.message || "No bills found for this UHID.", "warning");
        setUhidBills([]);
      }
    } catch (err) {
      console.error("Fetch UHID bills error:", err);
      showToast("Server error while fetching bills for this UHID.", "error");
    } finally {
      setLoadingUhidBills(false);
    }
  };

  // ── User selects a bill from the modal ───────────────────────────────────────
  const handleSelectBill = async (bill) => {
    setShowUhidModal(false);
    setForm(prev => ({
      ...prev,
      billNumber: bill.bill_no,
      uhidNo:     bill.uhid || prev.uhidNo,
    }));
    // Auto-fetch bill details
    await fetchBillDetails(bill.bill_no);
  };

  // ─── Fetch Bill Details from hospital_pharmacybilling ────────────────────────
  const fetchBillDetails = async (billNo) => {
    const billVal = normalizeSearchValue(billNo);
    if (!billVal) {
      showToast("Please enter a Bill Number to search.", "warning");
      return;
    }
    try {
      setFetchingBill(true);
      setBillItems([]);
      setPartialReturnWarning("");
      const res = await apiRequest(
        `${HmsBaseUrl}get_salesreturn_billdetails/`,
        "POST",
        { bill_no: billVal }
      );
      const data = res.data;

      if (data?.status === "success") {
        const d = data.data;
        setForm(prev => ({
          ...prev,
          billAmount:  d.net_amount  ?? d.total_amount ?? "",
          billType:    d.bill_type   ?? prev.billType,
          billName:    d.bill_name   ?? prev.billName,
          uhidNo:      prev.uhidNo   || d.uhid             || "",
          ipNumber:    prev.ipNumber || d.inpatient_number  || "",
        }));
        const items = (d.items || []).map(item => ({ ...item, returnQty: "" }));
        setBillItems(items);

        // ⚠️ Some items were already returned — show info banner
        if (d.partially_returned) {
          setPartialReturnWarning(
            data.message || "Some items in this bill have already been returned and are excluded below."
          );
        }
      } else {
        // All errors from backend (30-day, fully returned, not found) shown as toast
        showToast(data?.message || "Bill not found or not eligible for return.", "error");
      }
    } catch (err) {
      console.error("Fetch bill error:", err);
      showToast("Server error while fetching bill details.", "error");
    } finally {
      setFetchingBill(false);
    }
  };

  const handleReturnQtyChange = (index, value) => {
    const enteredQty = parseFloat(value);
    const item       = billItems[index];

    if (!item) return;

    const returnableQty = parseFloat(item.qty || 0); // remaining returnable qty from API

    // ❌ Exceeds returnable qty → toast ONCE (outside setState) then clamp
    if (!isNaN(enteredQty) && enteredQty > returnableQty) {
      showToast(
        `Return quantity cannot exceed ${returnableQty} for "${item.item_name || "this item"}" (Batch: ${item.batch_number || "—"}).`,
        "error"
      );
      setBillItems(prev =>
        prev.map((it, i) => i === index ? { ...it, returnQty: String(returnableQty) } : it)
      );
      return;
    }

    // ❌ Negative → silently reset to 0
    if (!isNaN(enteredQty) && enteredQty < 0) {
      setBillItems(prev =>
        prev.map((it, i) => i === index ? { ...it, returnQty: "0" } : it)
      );
      return;
    }

    // ✅ Valid value
    setBillItems(prev =>
      prev.map((it, i) => i === index ? { ...it, returnQty: value } : it)
    );
  };

  useEffect(() => { handleSearch(); }, []);

  // Smooth scroll to form on open
  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 60);
    }
  }, [showForm]);

  const cashCount  = returnList.filter(r => r.mode === "Cash Return").length;
  const ipCount    = returnList.filter(r => r.mode === "IP Credit").length;
  const otherCount = returnList.filter(r => r.mode === "Other Mode").length;

  const filtered = returnList.filter(r =>
    !searchFilter ||
    (r.patient_name || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
    (r.uhid || "").toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleFormChange = (field, val) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const handleFormReset = () => {
    setBillItems([]);
    setUhidBills([]);
    setShowUhidModal(false);
    setPartialReturnWarning("");
    setForm({
      uhidNo: "", ipNumber: "", name: "",
      ageY: "", ageM: "", ageD: "",
      gender: "", requestNo: "", paymentType: "Cash",
      billType: billTypes.length > 0 ? billTypes[0].bill_type : "",
      billName: billTypes.length > 0 ? billTypes[0].bill_name : "",
      billNumber: "", billAmount: "",
    });
  };

  const handleFormSearch = async () => {
    try {
      const params = new URLSearchParams({
        uhid_no:      form.uhidNo,
        ip_number:    form.ipNumber,
        name:         form.name,
        age_y:        form.ageY,
        age_m:        form.ageM,
        age_d:        form.ageD,
        gender:       form.gender,
        request_no:   form.requestNo,
        payment_type: form.paymentType,
      });
      const data = await apiRequest(
        `${HmsBaseUrl}sales_return_medicine/new_return/?${params}`,
        "GET"
      );
      console.log("New return search result:", data);
    } catch (err) {
      console.error("New return search error:", err);
    }
  };

  const handleSave = async () => {
    if (!form.billNumber?.trim()) {
      showToast("Please enter a Bill Number before saving.", "warning");
      return;
    }
    if (!billItems.length) {
      showToast("No bill items to save.", "warning");
      return;
    }
    const hasReturn = billItems.some(item => Number(item.returnQty) > 0);
    if (!hasReturn) {
      showToast("Please enter return quantity for at least one item.", "warning");
      return;
    }

    // return_amount per line = return_qty × per-unit price
    // item.billed_qty  = original qty on the bill (e.g. 5)   — from get_salesreturn_billdetails API
    // item.qty         = remaining returnable qty (e.g. 4)    — after previous returns deducted
    // item.calculated_price = pro-rated price for remaining qty (from API)
    const medicine_particulars = billItems
      .filter(item => Number(item.returnQty) > 0)
      .map(item => {
        const returnableQty   = parseFloat(item.qty ?? 0);               // remaining qty (for price calc)
        const originalBilledQty = parseFloat(item.billed_qty ?? item.qty ?? 1); // ✅ original bill qty
        const calculatedPrice = parseFloat(item.calculated_price ?? 0);  // pro-rated to remaining qty
        const perUnitPrice    = returnableQty > 0 ? calculatedPrice / returnableQty : 0;
        const returnQty       = Number(item.returnQty);
        const returnAmount    = parseFloat((returnQty * perUnitPrice).toFixed(2));
        return {
          item_id:        item.item_id      ?? item.id ?? "",
          batch_number:   item.batch_number ?? "",
          billed_qty:     originalBilledQty, // ✅ always the original billed qty (5, 7 etc.)
          return_qty:     returnQty,         // ✅ what the user is returning now
          return_amount:  returnAmount,
        };
      });

    const totalReturnAmount = medicine_particulars.reduce(
      (sum, item) => sum + item.return_amount, 0
    );

    const payload = {
      bill_no:               form.billNumber,
      uhid:                  form.uhidNo,
      bill_type:             form.billType, 
      return_amount:         totalReturnAmount.toFixed(2),
      medicine_particulars,
      payment_type:          form.paymentType, 
    };

    try {
      const res = await apiRequest(
        `${HmsBaseUrl}OP_salesreturn_billdetails/`,
        "POST",
        payload
      );
      const data = res.data;
      if (data?.status === "success" || res.status === 200 || res.status === 201) {
        showToast(data?.message || "Sales return saved successfully.", "success");
        handleFormReset();
        setShowForm(false);
        handleSearch();
      } else {
        showToast(data?.message || "Failed to save sales return.", "error");
      }
    } catch (err) {
      console.error("Save sales return error:", err);
      const errMsg = err?.response?.data?.message || "Server error while saving.";
      showToast(errMsg, "error");
    }
  };

  const formatDate = iso => {
    if (!iso) return "—";
    const date = new Date(iso);
    if (isNaN(date)) return iso;
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <>
      <GlobalStyle />
      <ToastPortal />

      {/* ── UHID Bills Selection Modal ────────────────────────────────────────── */}
      {showUhidModal && (
        <ModalOverlay onClick={() => setShowUhidModal(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalHeader>
              Select Bill — {form.uhidNo || form.name || "UHID Bills (Last 30 Days)"}
              <ModalCloseBtn onClick={() => setShowUhidModal(false)}>✕</ModalCloseBtn>
            </ModalHeader>
            <ModalBody>
              {loadingUhidBills ? (
                <NoRecords>Loading bills…</NoRecords>
              ) : uhidBills.length === 0 ? (
                <NoRecords>No paid bills found within the last 30 days.</NoRecords>
              ) : (
                <ModalTable>
                  <thead>
                    <tr>
                      <ModalTh>#</ModalTh>
                      <ModalTh>Bill No</ModalTh>
                      <ModalTh>Bill Date</ModalTh>
                      <ModalTh>Billing Mode</ModalTh>
                      <ModalTh>Net Amount (₹)</ModalTh>
                      <ModalTh>Action</ModalTh>
                    </tr>
                  </thead>
                  <tbody>
                    {uhidBills.map((bill, idx) => (
                      <tr key={idx}>
                        <ModalTd>{idx + 1}</ModalTd>
                        <ModalTd>{bill.bill_no}</ModalTd>
                        <ModalTd>{formatDate(bill.bill_date)}</ModalTd>
                        <ModalTd>{bill.billing_mode || "—"}</ModalTd>
                        <ModalTd>₹ {parseFloat(bill.net_amount || 0).toFixed(2)}</ModalTd>
                        <ModalTd>
                          <SelectBillBtn onClick={() => handleSelectBill(bill)}>
                            Select
                          </SelectBillBtn>
                        </ModalTd>
                      </tr>
                    ))}
                  </tbody>
                </ModalTable>
              )}
            </ModalBody>
            <ModalFooter>
              Showing {uhidBills.length} bill(s) within the last 30 days &nbsp;·&nbsp;
              Only <strong>Paid</strong> bills are eligible for return.
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}

      <PageWrapper>

        {/* Breadcrumb */}
        <Breadcrumb>
          <a href="/">Home</a>
          <span>/</span>
          Sales Return
        </Breadcrumb>

        <ContentArea>

          {/* ── Summary Card ── */}
          <SummaryCard>
            <DateGroup>
              <FieldWrap>
                <Label>From Date</Label>
                <DateInput
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
              </FieldWrap>
              <FieldWrap>
                <Label>To Date</Label>
                <DateInput
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                />
              </FieldWrap>
              <SearchBtn onClick={handleSearch}>
                🔍 Search
              </SearchBtn>
            </DateGroup>

            <DonutChart
              cashCount={cashCount}
              ipCount={ipCount}
              otherCount={otherCount}
            />

            <LegendList>
              <LegendItem>
                <Dot color="#00796b" />
                <LegendLabel>Cash Return</LegendLabel>
                <LegendCount>{cashCount}</LegendCount>
              </LegendItem>
              <LegendItem>
                <Dot color="#f9a825" />
                <LegendLabel>IP Credit</LegendLabel>
                <LegendCount>{ipCount}</LegendCount>
              </LegendItem>
              <LegendItem>
                <Dot color="#4dd0e1" />
                <LegendLabel>Other Mode</LegendLabel>
                <LegendCount>{otherCount}</LegendCount>
              </LegendItem>
            </LegendList>

            <NewReturnBtn
              $open={showForm}
              onClick={() => setShowForm(prev => !prev)}
            >
              {showForm ? "− New Return" : "+ New Return"}
            </NewReturnBtn>
          </SummaryCard>

          {/* ── Inline New Return Form ── */}
          {showForm && (
            <FormCard ref={formRef}>
              <FormBody>
                <FormGrid>

                  {/* UHID — triggers patient fetch + bill modal */}
                  <FormGroup>
                    <Label>UHID No</Label>
                    <InputRow>
                      <FormInput
                        value={form.uhidNo}
                        onChange={e => handleFormChange("uhidNo", e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            fetchPatientDetails(form.uhidNo);
                          }
                        }}
                        placeholder="Enter UHID & press Enter"
                      />
                      <IconBtn
                        type="button"
                        onClick={() => fetchPatientDetails(form.uhidNo)}
                        disabled={fetchingPatient}
                        title="Fetch patient details & bills"
                      >
                        {fetchingPatient ? "⏳" : "🔍"}
                      </IconBtn>
                    </InputRow>
                  </FormGroup>

                  <FormGroup>
                    <Label>IP Number</Label>
                    <InputRow>
                      <FormInput
                        value={form.ipNumber}
                        onChange={e => handleFormChange("ipNumber", e.target.value)}
                      />
                      <IconBtn type="button">🔍</IconBtn>
                      <IconBtn
                        type="button"
                        style={{ background: "#bdbdbd", color: "#fff" }}
                      >
                        ⊞
                      </IconBtn>
                    </InputRow>
                  </FormGroup>

                  <FormGroup>
                    <Label>Name</Label>
                    <FormInput
                      value={form.name}
                      onChange={e => handleFormChange("name", e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Age</Label>
                    <AgeRow>
                      <FormInput
                        value={form.ageY}
                        placeholder="Y"
                        onChange={e => handleFormChange("ageY", e.target.value)}
                      />
                      <FormInput
                        value={form.ageM}
                        placeholder="M"
                        onChange={e => handleFormChange("ageM", e.target.value)}
                      />
                      <FormInput
                        value={form.ageD}
                        placeholder="D"
                        onChange={e => handleFormChange("ageD", e.target.value)}
                      />
                    </AgeRow>
                  </FormGroup>

                  <FormGroup>
                    <Label>Gender</Label>
                    <FormSelect
                      value={form.gender}
                      onChange={e => handleFormChange("gender", e.target.value)}
                    >
                      <option value=""></option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <Label>Date</Label>
                    <FormInput value={todayDisplay} readOnly />
                  </FormGroup>

                  <FormGroup>
                    <Label>Request No</Label>
                    <InputRow>
                      <FormInput
                        value={form.requestNo}
                        onChange={e => handleFormChange("requestNo", e.target.value)}
                      />
                      <IconBtn type="button">🔍</IconBtn>
                    </InputRow>
                  </FormGroup>

                  <FormGroup style={{ gridColumn: "span 2" }}>
                    <Label>Payment Type</Label>
                    <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
                      <RadioGroup>
                        <label>
                          <input
                            type="radio"
                            name="paymentType"
                            value="Cash"
                            checked={form.paymentType === "Cash"}
                            onChange={() => handleFormChange("paymentType", "Cash")}
                          />
                          Cash
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="paymentType"
                            value="Credit"
                            checked={form.paymentType === "Other"}
                            onChange={() => handleFormChange("paymentType", "Credit")}
                          />
                          Credit
                        </label>
                      </RadioGroup>
                      <ResetBtn type="button" onClick={handleFormReset}>
                        ↺ Reset
                      </ResetBtn>
                      <FormSearchBtn type="button" onClick={handleFormSearch}>
                        🔍 Search
                      </FormSearchBtn>
                    </div>
                  </FormGroup>

                </FormGrid>

                {/* ── Bill Type | Bill Number | Bill Amount ── */}
                <BillRow>
                  <FormGroup>
                    <Label>Bill Type</Label>
                    <FormInput
                      value={form.billName || form.billType || ""}
                      readOnly
                      placeholder="—"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Bill Number</Label>
                    <InputRow>
                      <FormInput
                        value={form.billNumber}
                        onChange={e => handleFormChange("billNumber", e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            fetchBillDetails(form.billNumber);
                          }
                        }}
                        onBlur={() => {
                          if (form.billNumber.trim()) fetchBillDetails(form.billNumber);
                        }}
                        placeholder="Enter Bill No & press Enter"
                      />
                      <IconBtn
                        type="button"
                        title="Search Bill"
                        onClick={() => fetchBillDetails(form.billNumber)}
                        disabled={fetchingBill}
                      >
                        {fetchingBill ? "⏳" : "🔍"}
                      </IconBtn>
                    </InputRow>
                  </FormGroup>
                  <FormGroup>
                    <Label>Bill Amount</Label>
                    <FormInput
                      value={form.billAmount}
                      onChange={e => handleFormChange("billAmount", e.target.value)}
                      placeholder="0.00"
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </FormGroup>
                </BillRow>

                {/* ── Bill Items Table ── */}
                {billItems.length > 0 && (
                  <BillItemsSection>
                    <BillItemsTitle>Bill Items</BillItemsTitle>
                    {/* ⚠️ Partial return warning — shown when some items were already returned */}
                    {partialReturnWarning && (
                      <PartialReturnBanner>
                        ⚠️ {partialReturnWarning}
                      </PartialReturnBanner>
                    )}
                    <BillItemsTable>
                      <thead>
                        <tr>
                          <BillItemsTh>#</BillItemsTh>
                          <BillItemsTh>Item Name</BillItemsTh>
                          <BillItemsTh>Batch No</BillItemsTh>
                          <BillItemsTh>Billed Qty</BillItemsTh>
                          <BillItemsTh>Already Returned</BillItemsTh>
                          <BillItemsTh>Returnable Qty</BillItemsTh>
                          <BillItemsTh>Calculated Price (₹)</BillItemsTh>
                          <BillItemsTh>Return Qty</BillItemsTh>
                          <BillItemsTh>Return Amount (₹)</BillItemsTh>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let totalRetQty = 0;
                          let totalRetAmt = 0;
                          const rows = billItems.map((item, index) => {
                            const retQty         = parseFloat(item.returnQty || 0);
                            const returnableQty  = parseFloat(item.qty || 0);          // remaining qty from API
                            const billedQty      = parseFloat(item.billed_qty ?? item.qty ?? 0);
                            const alreadyRet     = parseFloat(item.already_returned || 0);
                            const calcPrice      = parseFloat(item.calculated_price ?? 0); // already pro-rated
                            const perUnitPrice   = returnableQty > 0 ? calcPrice / returnableQty : 0;
                            const retAmount      = retQty * perUnitPrice;
                            totalRetQty += retQty;
                            totalRetAmt += retAmount;
                            const isPartial      = item.is_partial_return;
                            return (
                              <tr key={index} style={isPartial ? { background: "#fffde7" } : {}}>
                                <BillItemsTd>{index + 1}</BillItemsTd>
                                <BillItemsTd>
                                  {item.item_name || "—"}
                                  {isPartial && (
                                    <PartialBadge>partial</PartialBadge>
                                  )}
                                </BillItemsTd>
                                <BillItemsTd>{item.batch_number || "—"}</BillItemsTd>
                                {/* Original billed qty */}
                                <BillItemsTd>{billedQty || "—"}</BillItemsTd>
                                {/* How many already returned */}
                                <BillItemsTd>
                                  {alreadyRet > 0
                                    ? <AlreadyReturnedBadge>{alreadyRet}</AlreadyReturnedBadge>
                                    : <span style={{ color: "#aaa" }}>—</span>
                                  }
                                </BillItemsTd>
                                {/* Remaining qty available for return */}
                                <BillItemsTd style={{ fontWeight: 600, color: "#00695c" }}>
                                  {returnableQty}
                                </BillItemsTd>
                                {/* Pro-rated calculated price for the remaining qty */}
                                <BillItemsTd>{calcPrice.toFixed(2)}</BillItemsTd>
                                <BillItemsTd>
                                  <ReturnQtyInput
                                    type="number"
                                    min="0"
                                    max={returnableQty}
                                    value={item.returnQty}
                                    placeholder="0"
                                    onChange={e => handleReturnQtyChange(index, e.target.value)}
                                  />
                                </BillItemsTd>
                                <BillItemsTd>
                                  {retQty > 0 ? retAmount.toFixed(2) : "—"}
                                </BillItemsTd>
                              </tr>
                            );
                          });
                          return (
                            <>
                              {rows}
                              {totalRetQty > 0 && (
                                <tr style={{ background: "#f0faf8", fontWeight: 700 }}>
                                  <BillItemsTd colSpan={6} style={{ textAlign: "right", color: "#00695c" }}>
                                    Total Return
                                  </BillItemsTd>
                                  <BillItemsTd />
                                  <BillItemsTd style={{ color: "#00695c" }}>
                                    {totalRetQty}
                                  </BillItemsTd>
                                  <BillItemsTd style={{ color: "#00695c" }}>
                                    ₹ {totalRetAmt.toFixed(2)}
                                  </BillItemsTd>
                                </tr>
                              )}
                            </>
                          );
                        })()}
                      </tbody>
                    </BillItemsTable>
                    <BillItemsFooter>
                      <SaveBtn type="button" onClick={handleSave}>
                        💾 Save
                      </SaveBtn>
                    </BillItemsFooter>
                  </BillItemsSection>
                )}
              </FormBody>
            </FormCard>
          )}

          {/* ── Table Card ── */}
          <TableCard>
            <TableToolbar>
              <ModeBtn color="#00796b" $active>■ Cash Return</ModeBtn>
              <ModeBtn color="#f9a825">■ IP Credit</ModeBtn>
              <ModeBtn color="#4dd0e1">■ Other Mode</ModeBtn>
              <SearchBox>
                Search:
                <input
                  placeholder="Search By Patient"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                />
              </SearchBox>
            </TableToolbar>

            <Table>
              <thead>
                <tr>
                  <Th>Mode</Th>
                  <Th>Return Date</Th>
                  <Th>Return NO</Th>
                  <Th>Patient</Th>
                  <Th>UHID</Th>
                  <Th>IP No/SL No</Th>
                  <Th>Return Amount</Th>
                  <Th>User</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <Td colSpan={8}><NoRecords>Loading…</NoRecords></Td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <Td colSpan={8}><NoRecords>No records found</NoRecords></Td>
                  </tr>
                ) : (
                  filtered.map((row, i) => (
                    <tr key={i}>
                      <Td><CashBadge $mode={row.mode || "Cash Return"}>{row.mode || "Cash Return"}</CashBadge></Td>
                      <Td>{formatDate(row.return_bill_date)}</Td>
                      <Td>{row.return_bill_no}</Td>
                      <Td>{row.patient_name || "—"}</Td>
                      <Td>{row.uhid || "—"}</Td>
                      <Td>{row.bill_no || "—"}</Td>
                      <Td>₹ {parseFloat(row.return_amount || 0).toFixed(2)}</Td>
                      <Td>{row.pharmacist_name || row.created_by || "—"}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            <ShowingText>
              Showing 1 to {filtered.length} of {filtered.length} entries
            </ShowingText>
            <Pagination>
              <PageBtn disabled>Previous</PageBtn>
              <PageBtn $active>1</PageBtn>
              <PageBtn disabled>Next</PageBtn>
            </Pagination>
          </TableCard>

        </ContentArea>
      </PageWrapper>
    </>
  );
};

export default SalesReturn;