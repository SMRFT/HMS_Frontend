import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import apiRequest from "../../Auth/apiRequest";
import styled, { keyframes } from "styled-components";
import DischargeBillPrintModal from "./DischargeBillPrintModal";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  primary:   "#0f766e",
  primaryDk: "#0d5f58",
  primaryLt: "#ccfbf1",
  amber:     "#d97706",
  amberLt:   "#fef3c7",
  danger:    "#dc2626",
  dangerLt:  "#fee2e2",
  success:   "#16a34a",
  successLt: "#dcfce7",
  blue:      "#2563eb",
  blueLt:    "#dbeafe",
  border:    "#e2e8f0",
  bg:        "#f8fafc",
  surface:   "#ffffff",
  textMain:  "#0f172a",
  textMid:   "#475569",
  textMuted: "#94a3b8",
  radius:    "8px",
  shadow:    "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:  "0 4px 16px rgba(0,0,0,0.10)",
};

const spin      = keyframes`to { transform: rotate(360deg); }`;
const fadeUp    = keyframes`from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); }`;
const slideDown = keyframes`from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); }`;

const Toast = styled.div`
  position: fixed; top: 14px; right: 16px; z-index: 99999;
  padding: 10px 18px; border-radius: ${T.radius}; color: #fff;
  font-weight: 600; font-size: 0.84rem; max-width: 380px;
  background: ${p => p.$err ? T.danger : T.success};
  box-shadow: ${T.shadowMd}; animation: ${slideDown} 0.2s ease;
`;

// ─── Styled components ──────────────────────────────────────────────────────────
const Card = styled.div`
  background: ${T.surface}; border: 1px solid ${T.border};
  border-radius: 10px; box-shadow: ${T.shadow};
  overflow: hidden; animation: ${fadeUp} 0.2s ease;
  transition: box-shadow 0.2s ease;
  &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
`;
const CardHead = styled.div`
  background: #f8fafc; border-bottom: 1px solid ${T.border};
  padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 8px;
`;
const CardTitle = styled.span`
  font-size: 0.72rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.5px; color: ${T.primary}; display: flex; align-items: center; gap: 6px;
`;

const TopScrollContainer = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  height: 12px;
  background: #f8fafc;
  border-top: 1px solid ${T.border};
  border-bottom: 1px solid ${T.border};
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const TScrollWrap = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
    height: 0;
    width: 0;
  }
`;
const LTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.8rem;
`;
const LTH = styled.th`
  padding: 9px 12px; text-align: left; font-size: 0.65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.4px; color: ${T.textMuted};
  border-bottom: 2px solid ${T.border}; background: #f8fafc; white-space: nowrap;
`;
const StickyLTH = styled(LTH)`
  position: sticky;
  left: ${p => p.$left || "0px"};
  z-index: 10;
  background: #f8fafc;
  ${p => p.$shadow && `box-shadow: 3px 0 6px -2px rgba(0,0,0,0.12); border-right: 1px solid ${T.border};`}
`;
const LTR = styled.tr`
  border-bottom: 1px solid ${T.border};
  background: ${p => p.$cancelled ? "#fff5f5" : "#ffffff"};
  opacity: ${p => p.$cancelled ? 0.75 : 1};
  &:hover { background: ${p => p.$cancelled ? "#ffebeb" : "#f8fbff"}; }
  &:hover > td { background: ${p => p.$cancelled ? "#ffebeb" : "#f8fbff"} !important; }
  &:last-child { border-bottom: none; }
`;
const LTD = styled.td`
  padding: 9px 12px;
  color: ${T.textMain};
  vertical-align: middle;
  white-space: nowrap;
  border-bottom: 1px solid ${T.border};
  background: #ffffff;
`;
const StickyLTD = styled(LTD)`
  position: sticky;
  left: ${p => p.$left || "0px"};
  z-index: 5;
  background: ${p => p.$bg || "#ffffff"};
  ${p => p.$shadow && `box-shadow: 3px 0 6px -2px rgba(0,0,0,0.12); border-right: 1px solid ${T.border};`}
`;
const StickyRightLTH = styled(LTH)`
  position: sticky;
  right: ${p => p.$right || "0px"};
  z-index: 10;
  background: #f8fafc;
  box-shadow: -3px 0 6px -2px rgba(0,0,0,0.12);
  border-left: 1px solid ${T.border};
`;
const StickyRightLTD = styled(LTD)`
  position: sticky;
  right: ${p => p.$right || "0px"};
  z-index: 5;
  background: ${p => p.$bg || "#ffffff"};
  box-shadow: -3px 0 6px -2px rgba(0,0,0,0.12);
  border-left: 1px solid ${T.border};
`;
const Mono = styled.span`font-family: 'Courier New', monospace; font-size: 0.78rem;`;

const DateBar = styled.div`
  display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap;
  padding: 10px 14px; background: #fafafa; border-bottom: 1px solid ${T.border};
`;
const FG = styled.div`
  display: flex; flex-direction: column; gap: 3px;
  min-width: ${p => p.$w || "140px"}; flex: ${p => p.$flex || "none"};
  @media (max-width: 600px) { min-width: 100%; flex: 1 1 100%; }
`;
const FL = styled.label`
  font-size: 0.66rem; font-weight: 700; color: ${T.textMuted};
  text-transform: uppercase; letter-spacing: 0.4px;
`;
const FInput = styled.input`
  height: 32px; padding: 0 10px; font-size: 0.82rem;
  border: 1px solid ${T.border}; border-radius: 6px; outline: none;
  background: #fff; color: ${T.textMain}; transition: border 0.12s;
  &:focus { border-color: ${T.primary}; box-shadow: 0 0 0 2px rgba(15,118,110,0.12); }
  &[type=date] { cursor: pointer; }
  &::placeholder { color: ${T.textMuted}; }
`;
const FSelect = styled.select`
  height: 32px; padding: 0 8px; font-size: 0.82rem;
  border: 1px solid ${T.border}; border-radius: 6px; outline: none;
  background: #fff; color: ${T.textMain}; cursor: pointer; transition: border 0.12s;
  &:focus { border-color: ${T.primary}; box-shadow: 0 0 0 2px rgba(15,118,110,0.12); }
`;
const Btn = styled.button`
  height: ${p => p.$sm ? "28px" : "34px"};
  padding: 0 ${p => p.$sm ? "10px" : "14px"};
  border-radius: 6px; font-size: ${p => p.$sm ? "0.74rem" : "0.81rem"};
  font-weight: 600; cursor: pointer; border: 1.5px solid transparent;
  display: inline-flex; align-items: center; gap: 5px; transition: all 0.13s;
  ${p => p.$primary && `background:${T.primary}; color:#fff; border-color:${T.primary};`}
  ${p => p.$amber   && `background:${T.amber};   color:#fff; border-color:${T.amber};`}
  ${p => p.$danger  && `background:${T.danger};  color:#fff; border-color:${T.danger};`}
  ${p => p.$outline && `background:#fff; color:${T.primary}; border-color:${T.primary};`}
  ${p => p.$ghost   && `background:#f1f5f9; color:${T.textMid}; border-color:${T.border};`}
  ${p => p.$pag     && `background:${p.$active ? T.primary : "#fff"}; color:${p.$active ? "#fff" : T.textMid}; border-color:${p.$active ? T.primary : T.border}; min-width:32px; height:30px; padding:0 8px;`}
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;
const Badge = styled.span`
  display: inline-flex; align-items: center; padding: 2px 8px;
  border-radius: 20px; font-size: 0.66rem; font-weight: 700;
  background: ${p => ({ estimate: "#fef3c7", billed: "#dcfce7", cancelled: "#fee2e2" }[p.$v] || "#f1f5f9")};
  color:      ${p => ({ estimate: T.amber,   billed: T.success, cancelled: T.danger  }[p.$v] || T.textMuted)};
`;
const Spinner = styled.div`
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff; border-radius: 50%; animation: ${spin} 0.6s linear infinite;
`;
const NoResults = styled.div`text-align: center; padding: 36px; color: ${T.textMuted}; font-size: 0.84rem;`;
const LoadSpinner = styled.div`
  width: 16px; height: 16px;
  border: 2px solid ${T.primary}; border-top-color: transparent;
  border-radius: 50%; animation: ${spin} 0.6s linear infinite;
`;
const PaginationBar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; background: #fafafa; border-top: 1px solid ${T.border};
  flex-wrap: wrap; gap: 8px;
`;
const PaginationInfo = styled.span`font-size: 0.76rem; color: ${T.textMuted};`;
const PaginationBtns = styled.div`display: flex; gap: 4px; align-items: center; flex-wrap: wrap;`;
const PerPageSelect = styled.select`
  height: 30px; padding: 0 8px; font-size: 0.78rem;
  border: 1px solid ${T.border}; border-radius: 6px; outline: none;
  background: #fff; color: ${T.textMain};
  &:focus { border-color: ${T.primary}; }
`;

// Summary cards
const SummaryRow = styled.div`
  display: flex; gap: 10px; padding: 10px 14px; background: #f0fdf4;
  border-bottom: 1px solid ${T.border}; flex-wrap: wrap;
`;
const SummaryCard = styled.div`
  flex: 1; min-width: 120px; background: #fff; border: 1px solid ${T.border};
  border-radius: 8px; padding: 8px 12px;
`;
const SummaryLabel = styled.div`font-size: 0.62rem; font-weight: 700; color: ${T.textMuted}; text-transform: uppercase; letter-spacing: 0.4px;`;
const SummaryValue = styled.div`font-size: 0.9rem; font-weight: 700; color: ${p => p.$color || T.textMain}; margin-top: 2px;`;

// Modals
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px); z-index: 10000; display: flex;
  align-items: center; justify-content: center; padding: 16px;
`;
const ModalBox = styled.div`
  background: #fff; border-radius: 12px; width: 100%;
  max-width: ${p => p.$w || "600px"}; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.22); animation: ${fadeUp} 0.2s ease;
`;
const ModalHead = styled.div`
  padding: 14px 20px; background: #f8fafc; border-bottom: 1px solid ${T.border};
  display: flex; align-items: center; justify-content: space-between;
`;
const ModalTitle = styled.h3`font-size: 0.95rem; font-weight: 700; color: ${T.textMain};`;
const ModalClose = styled.button`
  border: none; background: transparent; font-size: 1.2rem; cursor: pointer; color: ${T.textMuted};
  &:hover { color: ${T.danger}; }
`;
const ModalBody = styled.div`padding: 20px; overflow-y: auto; flex: 1;`;
const ModalFoot = styled.div`
  padding: 12px 20px; background: #f8fafc; border-top: 1px solid ${T.border};
  display: flex; justify-content: flex-end; gap: 10px;
`;

// ─── 3-Dots Action Dropdown ────────────────────────────────────────────────────
const AW   = styled.div`position: relative; display: inline-block;`;
const DotB = styled.button`
  width: 30px; height: 30px; border-radius: 50%; border: 1px solid ${T.border};
  background: #fff; cursor: pointer; display: flex; align-items: center;
  justify-content: center; font-size: 1.1rem; color: ${T.textMid}; font-weight: bold;
  transition: all 0.15s ease;
  &:hover { background: #f1f5f9; color: ${T.primary}; border-color: ${T.primary}; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
`;
const Drop = styled.div`
  position: fixed;
  ${p => p.placement === "top" ? `bottom: ${p.bottom}px;` : `top: ${p.top}px;`}
  left: ${p => p.left}px;
  background: #fff; border: 1px solid ${T.border}; border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.18); z-index: 99999;
  min-width: 170px; max-height: ${p => p.maxHeight || 280}px;
  overflow-y: auto; animation: ${fadeUp} 0.14s ease;
`;
const DI   = styled.button`
  width: 100%; padding: 9px 14px; text-align: left; font-size: 0.78rem; font-weight: 600;
  background: none; border: none; display: flex; align-items: center; gap: 8px;
  color: ${p => p.disabled ? '#9ca3af' : p.danger ? T.danger : T.textMain};
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  &:hover:not(:disabled) { background: ${p => p.danger ? '#fff1f2' : '#f0fdf4'}; color: ${p => p.danger ? T.danger : T.primary}; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
const fmt  = v => (parseFloat(v) || 0).toFixed(2);
const fmtCurrency = v => `₹${Number(parseFloat(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const parseBillDateIST = (d) => {
  if (!d) return null;
  let str = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(str) && !/[Zz]|[+-]\d{2}/.test(str)) {
    str = str.replace(" ", "T") + "Z";
  }
  const dt = new Date(str);
  return isNaN(dt.getTime()) ? null : dt;
};
const formatBillDate = (d) => {
  const dt = parseBillDateIST(d);
  return dt ? dt.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }) : "—";
};
const formatBillTime = (d) => {
  const dt = parseBillDateIST(d);
  return dt ? dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }) : "—";
};


// ═════════════════════════════════════════════════════════════════════════════
// ViewBills Component
// ═════════════════════════════════════════════════════════════════════════════

const ViewBills = ({ onEditBill, onRefreshTrigger, autoPrintBill }) => {
  const [bills,    setBills]    = useState([]);
  const [listBusy, setListBusy] = useState(false);
  const [listErr,  setListErr]  = useState("");

  // Filter input states (default to current date)
  const [inputFrom, setInputFrom] = useState(today());
  const [inputTo,   setInputTo]   = useState(today());
  const [inputQ,    setInputQ]    = useState("");
  const [selectedCustomerType, setSelectedCustomerType] = useState("ALL");
  const [customerTypes, setCustomerTypes] = useState([]);

  // Fetch customer types from backend (same as Admission)
  useEffect(() => {
    const fetchCustomerTypes = async () => {
      try {
        const res = await apiRequest(`${BASE}customer-types/`, "GET");
        const list = res?.data || res || [];
        if (Array.isArray(list)) {
          setCustomerTypes(list.filter(t => t.is_active !== false));
        }
      } catch (err) {
        console.error("fetchCustomerTypes error:", err);
      }
    };
    fetchCustomerTypes();
  }, []);

  // Options for customer type filter (same as Admission)
  const customerTypeOptions = useMemo(() => {
    const base = ["GENERAL", "INSURANCE"];
    const extra = customerTypes
      .filter(ct => {
        const u = (ct.type_name || "").trim().toUpperCase();
        return u !== "GENERAL" && u !== "INSURANCE";
      })
      .map(ct => (ct.type_name || "").trim().toUpperCase());
    return [...base, ...extra];
  }, [customerTypes]);

  // Pagination
  const [page,    setPage]    = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modals state
  const [printBill,  setPrintBill]  = useState(null);
  const [cancelBill, setCancelBill] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelBusy, setCancelBusy] = useState(false);
  const [auditBill,  setAuditBill]  = useState(null);
  const [doctors,    setDoctors]    = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await apiRequest(`${BASE}doctor_list_diagnostics/`, "GET");
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setDoctors(list);
      } catch (err) {
        console.error("fetchDoctors error:", err);
      }
    };
    fetchDoctors();
  }, []);

  // Toast notification state
  const [toast, setToast] = useState(null);
  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3800);
  };

  // 3-dots Menu State
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPos, setMenuPos]   = useState({ top: 0, bottom: 0, left: 0, placement: "bottom", maxHeight: 280 });
  const menuRef = useRef(null);

  const fetchBills = useCallback(async (
    fromDate = inputFrom, 
    toDate = inputTo, 
    searchQuery = inputQ,
    custType = selectedCustomerType
  ) => {
    setListBusy(true);
    setListErr("");
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);
      if (searchQuery && searchQuery.trim()) params.append("search", searchQuery.trim());
      if (custType && custType !== "ALL") params.append("customer_type", custType);

      const res = await apiRequest(`${BASE}discharge-billing/?${params.toString()}`, "GET");
      let list = [];
      if (res && res.success) {
        if (Array.isArray(res.data?.data)) {
          list = res.data.data;
        } else if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.data?.results)) {
          list = res.data.results;
        }
      }
      setBills(list);
      setPage(1);
    } catch (err) {
      console.error("fetchBills error:", err);
      setListErr("Failed to load bills. Please try again.");
    } finally {
      setListBusy(false);
    }
  }, [inputFrom, inputTo, inputQ, selectedCustomerType]);

  const handleOpenPrint = async (b, defaultViewMode = "NORMAL") => {
    let updatedBill = { ...b };
    const ipVal = (b.ip_number || b.ipNumber || b.patient_details?.ip_number || b.patient_details?.ipNumber || "").trim();
    const uhidVal = (b.uhid || b.patient_details?.uhid || "").trim();

    // Preserve the bill's own immutable historical episode details
    const origAdmDate = b.admission_date || b.admissionDateTime || b.patient_details?.admission_date || b.patient_details?.admissionDateTime;
    const origDischDate = b.discharge_date || b.dischargeDateTime || b.patient_details?.discharge_date || b.patient_details?.dischargeDateTime;
    const origRoom = b.room_no || b.patient_details?.room_no || b.patient_details?.roomNo;
    const origDoctor = b.doctor || b.patient_details?.doctor;
    const origDepartment = b.department || b.patient_details?.department;

    if (ipVal || uhidVal) {
      try {
        const queryParams = new URLSearchParams({ for_print: "true" });
        if (ipVal) queryParams.set("ipNumber", ipVal);
        if (uhidVal) queryParams.set("uhid", uhidVal);
        const raw = await apiRequest(`${BASE}search-discharge-patient/?${queryParams.toString()}`, "GET");
        const res = raw?.success && raw?.data?.success ? raw.data.data : (raw?.success ? raw.data : raw);
        if (res?.patient) {
          // Spread res.patient first as supplementary base, then preserve the bill's own patient_details on top
          updatedBill.patient_details = {
            ...res.patient,
            ...(b.patient_details || {}),
          };
        }
        const existingMeds = Array.isArray(b.pharmacy_medicines) ? b.pharmacy_medicines : [];
        const hasGoodMeds = existingMeds.length > 0 && !existingMeds.every(m => /^medicine\s+\d+$/i.test(m.itemName || m.name || m.item_name || ""));
        if (!hasGoodMeds) {
          const meds = res?.pharmacy_medicines || res?.patient?.pharmacy_medicines;
          if (Array.isArray(meds) && meds.length > 0) {
            updatedBill.pharmacy_medicines = meds;
          }
        }
      } catch (err) {
        console.error("Print patient details fetch error:", err);
      }
    }

    // Always enforce the bill's own admission date, discharge date, room, doctor, and IP number
    if (origAdmDate) {
      updatedBill.admission_date = origAdmDate;
      if (!updatedBill.patient_details) updatedBill.patient_details = {};
      updatedBill.patient_details.admission_date = origAdmDate;
      updatedBill.patient_details.doa = origAdmDate;
    }
    if (origDischDate) {
      updatedBill.discharge_date = origDischDate;
      if (!updatedBill.patient_details) updatedBill.patient_details = {};
      updatedBill.patient_details.discharge_date = origDischDate;
      updatedBill.patient_details.dod = origDischDate;
    }
    if (origRoom) {
      updatedBill.room_no = origRoom;
      if (!updatedBill.patient_details) updatedBill.patient_details = {};
      updatedBill.patient_details.room_no = origRoom;
      updatedBill.patient_details.roomNo = origRoom;
    }
    if (origDoctor) {
      updatedBill.doctor = origDoctor;
      if (!updatedBill.patient_details) updatedBill.patient_details = {};
      updatedBill.patient_details.doctor = origDoctor;
    }
    if (origDepartment) {
      updatedBill.department = origDepartment;
      if (!updatedBill.patient_details) updatedBill.patient_details = {};
      updatedBill.patient_details.department = origDepartment;
    }
    if (ipVal) {
      updatedBill.ip_number = ipVal;
      updatedBill.ipNumber = ipVal;
      if (!updatedBill.patient_details) updatedBill.patient_details = {};
      updatedBill.patient_details.ip_number = ipVal;
      updatedBill.patient_details.ipNumber = ipVal;
    }

    setPrintBill({ bill: updatedBill, defaultViewMode });
  };


  useEffect(() => { 
    fetchBills(inputFrom, inputTo, inputQ, selectedCustomerType); 
  }, [onRefreshTrigger]);

  useEffect(() => {
    if (autoPrintBill) {
      handleOpenPrint(autoPrintBill, "NORMAL");
    }
  }, [autoPrintBill]);

  const handleSearch = () => {
    fetchBills(inputFrom, inputTo, inputQ, selectedCustomerType);
  };

  const handleCustomerTypeChange = (e) => {
    const val = e.target.value;
    setSelectedCustomerType(val);
    fetchBills(inputFrom, inputTo, inputQ, val);
  };

  const handleReset = () => {
    setInputFrom(today());
    setInputTo(today());
    setInputQ("");
    setSelectedCustomerType("ALL");
    fetchBills(today(), today(), "", "ALL");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // ── 3-dots Menu positioning & toggle ─────────────────────────────────────────
  const handleMenuToggle = (id, e) => {
    e.stopPropagation();
    if (openMenu === id) { setOpenMenu(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuEstWidth = 180;
    const menuEstHeight = 160;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = rect.left - menuEstWidth + rect.width;
    if (left < 10) left = rect.left;
    if (left + menuEstWidth > windowWidth - 10) left = windowWidth - menuEstWidth - 10;

    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;

    let placement = "bottom";
    let top = rect.bottom + 4;
    let bottom = 0;
    let maxHeight = Math.min(280, spaceBelow - 12);

    if (spaceBelow < menuEstHeight && spaceAbove > spaceBelow) {
      placement = "top";
      bottom = windowHeight - rect.top + 4;
      maxHeight = Math.min(280, spaceAbove - 12);
    } else {
      maxHeight = Math.max(120, maxHeight);
    }

    setMenuPos({ top, bottom, left, placement, maxHeight });
    setOpenMenu(id);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    const handleScroll = () => { if (openMenu !== null) setOpenMenu(null); };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [openMenu]);

  // ── Filtering (Safety local client-side filter + in-memory instant search) ───
  const filtered = useMemo(() => {
    let list = bills;

    if (selectedCustomerType !== "ALL") {
      list = list.filter(b => {
        const ct = (b.customer_type || b.patient_details?.customer_type || "").toUpperCase();
        if (selectedCustomerType === "GENERAL") {
          if (b.is_insurance_bill || (ct && !ct.includes("GENERAL"))) return false;
        } else if (selectedCustomerType === "INSURANCE") {
          if (!b.is_insurance_bill && !ct.includes("INSURANCE")) return false;
        } else {
          const comp = (b.company_name || b.patient_details?.company || b.patient_details?.company_name || "").toUpperCase();
          if (!ct.includes(selectedCustomerType.toUpperCase()) && !comp.includes(selectedCustomerType.toUpperCase())) return false;
        }
        return true;
      });
    }

    if (inputQ && inputQ.trim()) {
      const q = inputQ.trim().toLowerCase();
      list = list.filter(b => {
        const pd = b.patient_details || {};
        const pName = pd.patient_name || pd.name || b.patient_name || "";
        const fName = pd.firstName || "";
        const lName = pd.lastName || "";
        const docName = b.doctor || pd.doctor || pd.admittingDoctorName || "";
        const fullSearchString = [
          b.uhid,
          b.ip_number,
          b.bill_no,
          b.estimate_number,
          b.insurance_bill_number,
          pName,
          fName,
          lName,
          docName,
          b.customer_type,
          pd.customer_type,
          b.company_name,
          pd.company,
          pd.company_name,
          pd.claim_number,
          pd.id_card_number,
          pd.card_no,
          pd.referral_number,
          pd.mobilePhone,
          pd.mobile,
          pd.phone,
          pd.address,
          pd.room_no,
          b.status,
          b.bill_date,
          b.created_by,
          b.created_by_name,
        ].filter(Boolean).join(" ").toLowerCase();

        return fullSearchString.includes(q);
      });
    }

    return list;
  }, [bills, selectedCustomerType, inputQ]);

  // ── Summary totals ─────────────────────────────────────────────────────────
  const summary = filtered.reduce((acc, b) => {
    if (b.is_cancelled) return acc;
    return {
      total:    acc.total    + (parseFloat(b.total_amount)  || 0),
      advance:  acc.advance  + (parseFloat(b.advance_amount)|| 0),
      discount: acc.discount + (parseFloat(b.discount_amount)|| 0),
      net:      acc.net      + (parseFloat(b.net_amount)    || 0),
      gst:      acc.gst      + (parseFloat(b.gst_amount)    || 0),
    };
  }, { total: 0, advance: 0, discount: 0, net: 0, gst: 0 });

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const pageStart  = (safePage - 1) * perPage;
  const paginated  = filtered.slice(pageStart, pageStart + perPage);

  const goPage = p => setPage(Math.max(1, Math.min(p, totalPages)));

  const pageButtons = () => {
    const pages = [];
    const delta = 2;
    const left  = Math.max(1, safePage - delta);
    const right = Math.min(totalPages, safePage + delta);
    if (left > 1)          { pages.push(1); if (left > 2) pages.push("..."); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages){ if (right < totalPages - 1) pages.push("..."); pages.push(totalPages); }
    return pages;
  };

  // ── Cancel Action ──────────────────────────────────────────────────────────
  const handleConfirmCancel = async () => {
    if (!cancelBill || !cancelReason.trim()) return;
    setCancelBusy(true);
    try {
      const res = await apiRequest(`${BASE}discharge-billing/${cancelBill.id}/cancel/`, "POST", {
        cancelled_reason: cancelReason.trim(),
      });
      if (res.success) {
        setCancelBill(null);
        setCancelReason("");
        fetchBills();
      } else {
        alert(res.error || "Failed to cancel bill");
      }
    } catch {
      alert("Error cancelling bill");
    } finally {
      setCancelBusy(false);
    }
  };

  // ── Synchronized Top Horizontal Scrollbar ──────────────────────────────────
  const topScrollRef = useRef(null);
  const tableScrollRef = useRef(null);
  const isSyncingTop = useRef(false);
  const isSyncingTable = useRef(false);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);

  const handleTopScroll = () => {
    if (isSyncingTable.current) {
      isSyncingTable.current = false;
      return;
    }
    if (topScrollRef.current && tableScrollRef.current) {
      isSyncingTop.current = true;
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const handleTableScroll = () => {
    if (isSyncingTop.current) {
      isSyncingTop.current = false;
      return;
    }
    if (topScrollRef.current && tableScrollRef.current) {
      isSyncingTable.current = true;
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  };

  const updateScrollWidth = useCallback(() => {
    if (tableScrollRef.current) {
      const sw = tableScrollRef.current.scrollWidth;
      const cw = tableScrollRef.current.clientWidth;
      setTableScrollWidth(sw);
      setHasHorizontalScroll(sw > cw);
    }
  }, []);

  useEffect(() => {
    updateScrollWidth();
    const el = tableScrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updateScrollWidth());
    ro.observe(el);
    window.addEventListener("resize", updateScrollWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateScrollWidth);
    };
  }, [updateScrollWidth, filtered, paginated]);


  return (
    <Card>
      {toast && <Toast $err={toast.err}>{toast.msg}</Toast>}
      {/* Header */}
      <CardHead>
        <CardTitle>
          ✅ Final Bills
          {bills.length > 0 && (
            <Badge $v="billed" style={{ marginLeft: 8 }}>{bills.length}</Badge>
          )}
        </CardTitle>
        <span style={{ fontSize: "0.72rem", color: T.textMuted }}>
          Showing {filtered.length} of {bills.length} records
        </span>
      </CardHead>

      {/* Filter bar */}
      <DateBar>
        <FG $w="130px">
          <FL>From</FL>
          <FInput 
            type="date" 
            value={inputFrom} 
            onChange={e => setInputFrom(e.target.value)} 
            onKeyDown={handleKeyDown}
          />
        </FG>
        <FG $w="130px">
          <FL>To</FL>
          <FInput 
            type="date" 
            value={inputTo} 
            onChange={e => setInputTo(e.target.value)} 
            onKeyDown={handleKeyDown}
          />
        </FG>
        <FG $w="160px">
          <FL>Customer Type</FL>
          <FSelect
            value={selectedCustomerType}
            onChange={handleCustomerTypeChange}
          >
            <option value="ALL">ALL</option>
            <option value="GENERAL">GENERAL</option>
            <option value="INSURANCE">INSURANCE</option>
            {customerTypes
              .filter(ct => {
                const u = (ct.type_name || "").trim().toUpperCase();
                return u !== "GENERAL" && u !== "INSURANCE";
              })
              .map((ct, idx) => {
                const name = (ct.type_name || "").trim().toUpperCase();
                return <option key={ct.id || idx} value={name}>{name}</option>;
              })}
          </FSelect>
        </FG>
        <FG $flex="1" style={{ minWidth: 180 }}>
          <FL>Search</FL>
          <FInput
            value={inputQ}
            onChange={e => { setInputQ(e.target.value); setPage(1); }}
            onKeyDown={handleKeyDown}
            placeholder="Name, UHID, IP, Bill No, Doctor…"
          />
        </FG>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Btn $primary onClick={handleSearch}>
            🔍 Search
          </Btn>
          <Btn $ghost onClick={handleReset}>
            ↺ Reset
          </Btn>
          <Btn $outline onClick={() => fetchBills(inputFrom, inputTo, inputQ, selectedCustomerType)} disabled={listBusy}>
            {listBusy ? <Spinner /> : "↻"} Refresh
          </Btn>
        </div>
      </DateBar>

      {/* Error */}
      {listErr && (
        <div style={{ color: T.danger, fontSize: "0.76rem", padding: "8px 14px", background: "#fee2e2", borderBottom: `1px solid #fecaca` }}>
          ⚠ {listErr}
        </div>
      )}

      {/* Summary row */}
      {filtered.length > 0 && (
        <SummaryRow>
          <SummaryCard>
            <SummaryLabel>Total Amount</SummaryLabel>
            <SummaryValue>{fmtCurrency(summary.total)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Total Advance</SummaryLabel>
            <SummaryValue $color={T.danger}>{fmtCurrency(summary.advance)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Total Discount</SummaryLabel>
            <SummaryValue $color={T.danger}>{fmtCurrency(summary.discount)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Total GST</SummaryLabel>
            <SummaryValue $color={T.blue}>{fmtCurrency(summary.gst)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Net Collected</SummaryLabel>
            <SummaryValue $color={T.success}>{fmtCurrency(summary.net)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Bill Count</SummaryLabel>
            <SummaryValue $color={T.primary}>{filtered.length}</SummaryValue>
          </SummaryCard>
        </SummaryRow>
      )}

      {/* Top Horizontal Scrollbar */}
      {hasHorizontalScroll && (
        <TopScrollContainer
          ref={topScrollRef}
          onScroll={handleTopScroll}
          title="Scroll table horizontally"
        >
          <div style={{ width: `${tableScrollWidth}px`, height: "1px" }} />
        </TopScrollContainer>
      )}

      {/* Table */}
      <TScrollWrap ref={tableScrollRef} onScroll={handleTableScroll}>
        <LTable>
          <thead>
            <tr>
              <StickyLTH $left="0px" style={{ width: 44, minWidth: 44, maxWidth: 44 }}>#</StickyLTH>
              <StickyLTH $left="44px" style={{ width: 90, minWidth: 90, maxWidth: 90 }}>Bill Date</StickyLTH>
              <StickyLTH $left="134px" style={{ width: 82, minWidth: 82, maxWidth: 82 }}>Bill Time</StickyLTH>
              <StickyLTH $left="216px" style={{ width: 145, minWidth: 145, maxWidth: 145 }}>Bill No.</StickyLTH>
              <StickyLTH $left="361px" style={{ width: 125, minWidth: 125, maxWidth: 125 }}>UHID / IP</StickyLTH>
              <StickyLTH $left="486px" $shadow style={{ width: 160, minWidth: 160, maxWidth: 160 }}>Patient</StickyLTH>
              <LTH>Total</LTH>
              <LTH>Advance</LTH>
              <LTH>Discount</LTH>
              <LTH>GST</LTH>
              <LTH>Net Amount</LTH>
              <LTH>Status</LTH>
              <StickyRightLTH style={{ textAlign: "center", width: 60, minWidth: 60 }}>Action</StickyRightLTH>
            </tr>
          </thead>
          <tbody>
            {listBusy ? (
              <tr>
                <td colSpan={13}>
                  <NoResults>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <LoadSpinner />
                      Loading bills…
                    </div>
                  </NoResults>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={13}>
                  <NoResults>
                    {filtered.length === 0 && bills.length > 0
                      ? "No bills match your filters."
                      : "No bills found."}
                  </NoResults>
                </td>
              </tr>
            ) : paginated.map((b, i) => {
              const pd = b.patient_details || {};
              const isCanc = b.is_cancelled || b.status === "Cancelled";
              const stickyBg = isCanc ? "#fff5f5" : "#ffffff";
              return (
                <LTR key={b.id} $cancelled={isCanc}>
                  <StickyLTD $left="0px" $bg={stickyBg} style={{ color: T.textMuted, fontWeight: 600, fontSize: "0.74rem", width: 44, minWidth: 44, maxWidth: 44 }}>
                    {pageStart + i + 1}
                  </StickyLTD>
                  {/* Bill Date */}
                  <StickyLTD $left="44px" $bg={stickyBg} style={{ fontSize: "0.77rem", fontWeight: 600, width: 90, minWidth: 90, maxWidth: 90 }}>
                    {formatBillDate(b.bill_date)}
                  </StickyLTD>
                  {/* Bill Time */}
                  <StickyLTD $left="134px" $bg={stickyBg} style={{ fontSize: "0.75rem", color: T.textMid, width: 82, minWidth: 82, maxWidth: 82 }}>
                    {formatBillTime(b.bill_date)}
                  </StickyLTD>
                  {/* Bill No. */}
                  <StickyLTD $left="216px" $bg={stickyBg} style={{ width: 145, minWidth: 145, maxWidth: 145 }}>
                    {b.is_insurance_bill && String(b.customer_type || b.patient_details?.customer_type || "").toUpperCase().includes("INSURANCE") ? (
                      <div>
                        <Mono style={{ color: "#065f46", fontWeight: 700, fontSize: "0.82rem" }}>
                          {(b.insurance_bill_number || b.bill_no || "").replace(/\//g, "")}
                        </Mono>
                        <div style={{ fontSize: "0.68rem", color: T.textMuted }}>
                          SH-Bill: {(b.bill_no || "").replace(/\//g, "")}
                        </div>
                        <span style={{
                          display: "inline-block",
                          fontSize: "0.64rem",
                          background: "#ecfdf5",
                          color: "#065f46",
                          border: "1px solid #a7f3d0",
                          padding: "1px 5px",
                          borderRadius: 3,
                          fontWeight: 700,
                          marginTop: 2,
                          maxWidth: "135px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }} title={`Insurance: ${b.company_name || b.patient_details?.company || ""} | Claim: ${b.claim_number || b.patient_details?.claim_number || ""}`}>
                          🛡️ {b.company_name || b.patient_details?.company || "INS"}
                        </span>
                      </div>
                    ) : (
                      <Mono style={{ color: isCanc ? T.textMuted : T.primary, fontWeight: 700 }}>
                        {(b.bill_no || "").replace(/\//g, "")}
                      </Mono>
                    )}
                  </StickyLTD>
                  {/* UHID / IP */}
                  <StickyLTD $left="361px" $bg={stickyBg} style={{ width: 125, minWidth: 125, maxWidth: 125 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", lineHeight: 1.25 }}>
                      <span style={{ fontWeight: 600, color: "#0d9488", fontSize: "0.77rem" }}>{b.uhid || "—"}</span>
                      <span style={{ fontWeight: 600, color: "#6d28d9", fontSize: "0.73rem" }}>{b.ip_number || "—"}</span>
                    </div>
                  </StickyLTD>
                  {/* Patient */}
                  <StickyLTD $left="486px" $shadow $bg={stickyBg} style={{ fontWeight: 600, width: 160, minWidth: 160, maxWidth: 160 }}>
                    <div style={{ maxWidth: 145, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={pd.patient_name || ""}>
                      {pd.patient_name || "—"}
                    </div>
                  </StickyLTD>
                  {/* Total */}
                  <LTD>₹{fmt(b.total_amount)}</LTD>
                  {/* Advance */}
                  <LTD style={{ color: T.danger }}>₹{fmt(b.advance_amount)}</LTD>
                  {/* Discount */}
                  <LTD style={{ color: T.danger }}>₹{fmt(b.discount_amount)}</LTD>
                  {/* GST */}
                  <LTD style={{ color: T.blue }}>₹{fmt(b.gst_amount)}</LTD>
                  {/* Net Amount */}
                  <LTD style={{ fontWeight: 700, color: isCanc ? T.textMuted : (parseFloat(b.net_amount) < 0 ? T.danger : T.success) }}>
                    ₹{fmt(b.net_amount)}
                    {parseFloat(b.net_amount) < 0 && (
                      <span style={{ fontSize: "0.68rem", marginLeft: 4, color: T.danger, fontWeight: 800 }}>
                        (Refund)
                      </span>
                    )}
                  </LTD>
                  {/* Status */}
                  <LTD>
                    <Badge $v={isCanc ? "cancelled" : "billed"}>
                      {isCanc ? "Cancelled" : "Billed"}
                    </Badge>
                  </LTD>
                  {/* Action */}
                  <StickyRightLTD $bg={stickyBg} style={{ textAlign: "center", width: 60, minWidth: 60 }}>
                    <AW>
                      <DotB onClick={e => handleMenuToggle(b.id, e)} title="Actions">⋮</DotB>
                    </AW>
                  </StickyRightLTD>
                </LTR>
              );
            })}
          </tbody>
        </LTable>
      </TScrollWrap>

      {/* Pagination */}
      {filtered.length > 0 && (
        <PaginationBar>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PaginationInfo>
              Showing {pageStart + 1}–{Math.min(pageStart + perPage, filtered.length)} of {filtered.length}
            </PaginationInfo>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.72rem", color: T.textMuted }}>Per page:</span>
              <PerPageSelect
                value={perPage}
                onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              >
                {[10, 25, 50, 100].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </PerPageSelect>
            </div>
          </div>
          <PaginationBtns>
            <Btn $pag onClick={() => goPage(1)}            disabled={safePage === 1}>«</Btn>
            <Btn $pag onClick={() => goPage(safePage - 1)} disabled={safePage === 1}>‹</Btn>
            {pageButtons().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: T.textMuted, fontSize: "0.8rem" }}>…</span>
              ) : (
                <Btn $pag $active={p === safePage} key={p} onClick={() => goPage(p)}>{p}</Btn>
              )
            )}
            <Btn $pag onClick={() => goPage(safePage + 1)} disabled={safePage === totalPages}>›</Btn>
            <Btn $pag onClick={() => goPage(totalPages)}   disabled={safePage === totalPages}>»</Btn>
          </PaginationBtns>
        </PaginationBar>
      )}

      {/* ── 3-Dots Action Dropdown Menu ── */}
      {openMenu !== null && (() => {
        const b = paginated.find(x => x.id === openMenu);
        if (!b) return null;
        const isCanc = b.is_cancelled || b.status === "Cancelled";
        return (
          <Drop
            ref={menuRef}
            top={menuPos.top}
            bottom={menuPos.bottom}
            left={menuPos.left}
            placement={menuPos.placement}
            maxHeight={menuPos.maxHeight}
          >
            {!isCanc && onEditBill && (
              <DI onClick={() => { setOpenMenu(null); onEditBill(b); }}>
                ✏️ Edit Bill
              </DI>
            )}
            <DI onClick={() => { setOpenMenu(null); handleOpenPrint(b, "NORMAL"); }}>
              🖨️ Print Bill
            </DI>
            {(b.is_insurance_bill || b.insurance_bill_number) && String(b.customer_type || b.patient_details?.customer_type || "").toUpperCase().includes("INSURANCE") && (
              <DI onClick={() => { setOpenMenu(null); handleOpenPrint(b, "INSURANCE_CLAIM"); }}>
                🛡️ Insurance Print Bill
              </DI>
            )}
            <DI onClick={() => { setOpenMenu(null); setAuditBill(b); }}>
              📜 Audit History
            </DI>
            {!isCanc && (
              <DI danger onClick={() => { setOpenMenu(null); setCancelBill(b); }}>
                🚫 Cancel Bill
              </DI>
            )}
          </Drop>
        );
      })()}

      {/* ── Cancel Modal ── */}
      {cancelBill && (
        <ModalOverlay onClick={() => setCancelBill(null)}>
          <ModalBox $w="460px" onClick={e => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle>🚫 Cancel Bill — #{cancelBill.bill_no}</ModalTitle>
              <ModalClose onClick={() => setCancelBill(null)}>✕</ModalClose>
            </ModalHead>
            <ModalBody>
              <p style={{ fontSize: "0.82rem", color: T.textMid, marginBottom: 12 }}>
                Are you sure you want to cancel this bill? Please enter the reason for cancellation:
              </p>
              <FG>
                <FL>Reason for Cancellation *</FL>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Enter detailed reason for cancellation…"
                  style={{
                    width: "100%", padding: "8px 10px", fontSize: "0.83rem",
                    borderRadius: 6, border: `1px solid ${T.border}`, outline: "none"
                  }}
                />
              </FG>
            </ModalBody>
            <ModalFoot>
              <Btn $ghost onClick={() => setCancelBill(null)}>Cancel</Btn>
              <Btn $danger onClick={handleConfirmCancel} disabled={cancelBusy || !cancelReason.trim()}>
                {cancelBusy ? <Spinner /> : "Confirm Cancel"}
              </Btn>
            </ModalFoot>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* ── Edit History Modal ── */}
      {auditBill && (
        <ModalOverlay onClick={() => setAuditBill(null)}>
          <ModalBox $w="740px" onClick={e => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle>📜 Edit History — #{auditBill.bill_no || auditBill.estimate_number}</ModalTitle>
              <ModalClose onClick={() => setAuditBill(null)}>✕</ModalClose>
            </ModalHead>
            <ModalBody>
              <h4 style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: 12, color: T.primary }}>
                Edit History Log ({auditBill.edit_history ? auditBill.edit_history.length : 0})
              </h4>
              {(!auditBill.edit_history || auditBill.edit_history.length === 0) ? (
                <div style={{ fontSize: "0.78rem", color: T.textMuted, fontStyle: "italic", textAlign: "center", padding: 16 }}>
                  No edits recorded for this document yet.
                </div>
              ) : (
                <LTable>
                  <thead>
                    <tr>
                      <LTH>#</LTH>
                      <LTH>Edited By</LTH>
                      <LTH>Edited Date</LTH>
                      <LTH>Reason for Edit</LTH>
                      <LTH>Field</LTH>
                      <LTH>Before</LTH>
                      <LTH>After</LTH>
                    </tr>
                  </thead>
                  <tbody>
                    {auditBill.edit_history.map((h, idx) => (
                      <LTR key={idx}>
                        <LTD>{idx + 1}</LTD>
                        <LTD style={{ fontWeight: 600 }}>{h.edited_by || "—"}</LTD>
                        <LTD style={{ fontSize: "0.75rem" }}>{h.edited_date ? new Date(h.edited_date).toLocaleString() : "—"}</LTD>
                        <LTD style={{ fontWeight: 600, color: T.amber }}>{h.edit_reason || "—"}</LTD>
                        <LTD style={{ fontWeight: 600, color: T.primary }}>{h.field_name || "—"}</LTD>
                        <LTD style={{ color: T.danger }}>{h.before_value || "—"}</LTD>
                        <LTD style={{ color: T.success }}>{h.after_value || "—"}</LTD>
                      </LTR>
                    ))}
                  </tbody>
                </LTable>
              )}
            </ModalBody>
            <ModalFoot>
              <Btn $ghost onClick={() => setAuditBill(null)}>Close</Btn>
            </ModalFoot>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* ── Discharge Bill Print Modal ── */}
      <DischargeBillPrintModal
        isOpen={Boolean(printBill)}
        bill={printBill?.bill || printBill}
        defaultViewMode={printBill?.defaultViewMode || "NORMAL"}
        onClose={() => setPrintBill(null)}
        doctors={doctors}
      />

    </Card>
  );
};

export default ViewBills;