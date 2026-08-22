import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { createPortal } from "react-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import JsBarcode from "jsbarcode";
import { format } from "date-fns";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import headerImage from "../Images/Header.png";
import FooterImage from "../Images/Footer.png";
import {
  PageWrapper,
  Container,
  Button,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  Label,
  TextArea,
  ButtonContainer,
  colors,
} from "../GlobalStyles";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToday = () => new Date().toISOString().split("T")[0];

const formatDisplayDate = (d) => {
  if (!d) return "";
  try {
    return format(new Date(d), "dd/MM/yyyy");
  } catch {
    return d;
  }
};

const formatDisplayTime = (d) => {
  if (!d) return "";
  try {
    return format(new Date(d), "hh:mm a");
  } catch {
    return "";
  }
};

// ─── Styled Components ────────────────────────────────────────────────────────
const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.3s ease;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.1rem;
  padding-bottom: 0.9rem;
  border-bottom: 2px solid #f0f0f0;
`;

const PageTitle = styled.h1`
  font-size: 1.45rem;
  font-weight: 800;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &::before {
    content: "🩺";
    font-size: 1.3rem;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
`;

const StatCard = styled.div`
  flex: 1;
  min-width: 120px;
  background: ${(p) => p.bg || "#f8fafc"};
  border: 1.5px solid ${(p) => p.border || "#e2e8f0"};
  border-radius: 14px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StatNum = styled.div`
  font-size: 1.4rem;
  font-weight: 800;
  color: ${(p) => p.color || "#0f766e"};
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const FilterLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
`;

const FilterInput = styled.input`
  padding: 0.45rem 0.75rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.82rem;
  outline: none;
  transition: all 0.2s;
  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
  }
`;

const FilterSelect = styled.select`
  padding: 0.45rem 0.75rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.82rem;
  background: white;
  outline: none;
  cursor: pointer;
  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
  }
`;

const QuickFilterRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  align-items: center;
`;

const QuickFilterBtn = styled.button`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1.5px solid ${(p) => (p.active ? "#0d9488" : "#cbd5e1")};
  background: ${(p) => (p.active ? "#0d9488" : "#ffffff")};
  color: ${(p) => (p.active ? "#ffffff" : "#475569")};
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: ${(p) => (p.active ? "#0f766e" : "#f1f5f9")};
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  text-align: center;
  background: ${(p) => p.bg || "#f1f5f9"};
  color: ${(p) => p.color || "#475569"};
  border: 1px solid ${(p) => p.border || "transparent"};
`;

const ActionBtn = styled.button`
  padding: 0.35rem 0.7rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s;
  background: ${(p) => p.bg || "#0d9488"};
  color: ${(p) => p.color || "white"};
  &:hover {
    filter: brightness(0.92);
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  align-items: center;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.3rem;
  align-items: center;
  flex-wrap: nowrap;
`;

const IconBtn = styled.button`
  position: relative;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  transition:
    transform 0.15s,
    opacity 0.15s;
  flex-shrink: 0;
  background: transparent;
  box-shadow: none;
  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.15);
    opacity: 0.8;
  }
  &:active:not(:disabled) {
    transform: translateY(0) scale(1);
  }
  &:disabled {
    opacity: 0.25;
    cursor: not-allowed;
    transform: none;
  }
  &::after {
    content: attr(data-tip);
    position: absolute;
    bottom: calc(100% + 7px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 20, 0.9);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
    padding: 4px 9px;
    border-radius: 6px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.18s;
    z-index: 99999;
  }
  &::before {
    content: "";
    position: absolute;
    bottom: calc(100% + 1px);
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(20, 20, 20, 0.9);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.18s;
    z-index: 99999;
  }
  &:hover:not(:disabled)::after,
  &:hover:not(:disabled)::before {
    opacity: 1;
  }
`;

const PrintDropdownWrapper = styled.div`
  position: relative;
`;

const PortalDropdownMenu = styled.div`
  position: fixed;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  min-width: 200px;
  z-index: 99999;
  overflow: hidden;
  border: 1px solid #e9ecef;
  padding-top: 6px;
  margin-top: -6px;
`;

const DropdownItem = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  border: none;
  background-color: white;
  color: black;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: #e9ecef;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
  font-size: 0.95rem;
`;

// ─── Print Modal Styled Components ────────────────────────────────────────────
const PrintModalCard = styled.div`
  background: white;
  width: 960px;
  max-width: 95vw;
  max-height: 92vh;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
`;

const PrintPreviewScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: #525659;
  display: block;
`;

const PrintSheet = styled.div`
  background: white;
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  padding: 2.5rem 3rem;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  font-family: "Segoe UI", Arial, sans-serif;
  color: #1e293b;
  box-sizing: border-box;

  @media print {
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
  }
`;

// ─── Main Component ───────────────────────────────────────────────────────────
const MHCList = () => {
  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(getToday);
  const [toDate, setToDate] = useState(getToday);

  // Search filters
  const [searchBillNo, setSearchBillNo] = useState("");
  const [searchUhid, setSearchUhid] = useState("");
  const [searchIpNumber, setSearchIpNumber] = useState("");
  const [searchPatient, setSearchPatient] = useState("");
  const [searchPackage, setSearchPackage] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchPaymentStatus, setSearchPaymentStatus] = useState("");
  const [searchPaymentMethod, setSearchPaymentMethod] = useState("");
  const [searchDoctor, setSearchDoctor] = useState("");

  // Modals
  const [viewModalRow, setViewModalRow] = useState(null);
  const [printRow, setPrintRow] = useState(null);
  const [printDetails, setPrintDetails] = useState(null);
  const [printSignature, setPrintSignature] = useState(null);
  const [loadingPrint, setLoadingPrint] = useState(false);

  const barcodeRef = useRef(null);

  // ── Fetch Investigations ─────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from_date: fromDate,
        to_date: toDate,
      });
      const result = await apiRequest(
        `${HMSURL}mhc-investigations/?${params.toString()}`,
        "GET",
      );
      if (result.success && Array.isArray(result.data)) {
        setRows(result.data);
      } else {
        setRows([]);
        if (result.error) toast.error(result.error);
      }
    } catch {
      toast.error("Failed to load MHC investigations");
    } finally {
      setLoading(false);
    }
  }, [HMSURL, fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Quick Date Filters ───────────────────────────────────────────────────────
  const setQuickDate = (type) => {
    const now = new Date();
    if (type === "today") {
      const t = getToday();
      setFromDate(t);
      setToDate(t);
    } else if (type === "yesterday") {
      const y = new Date(now.setDate(now.getDate() - 1))
        .toISOString()
        .split("T")[0];
      setFromDate(y);
      setToDate(y);
    } else if (type === "week") {
      const past = new Date(now.setDate(now.getDate() - 7))
        .toISOString()
        .split("T")[0];
      setFromDate(past);
      setToDate(getToday());
    } else if (type === "month") {
      const past = new Date(now.setMonth(now.getMonth() - 1))
        .toISOString()
        .split("T")[0];
      setFromDate(past);
      setToDate(getToday());
    }
  };

  const paymentMethodOptions = useMemo(() => {
    const methods = rows.map((r) => r.paymentMethod).filter(Boolean);
    return [...new Set(methods)].sort();
  }, [rows]);

  // ── Filtered Rows ────────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchBillNo =
        !searchBillNo ||
        (r.investBillNo || "")
          .toLowerCase()
          .includes(searchBillNo.toLowerCase());
      const matchUhid =
        !searchUhid ||
        (r.uhid || "").toLowerCase().includes(searchUhid.toLowerCase());
      const matchIpNumber =
        !searchIpNumber ||
        (r.ipNumber || "")
          .toLowerCase()
          .includes(searchIpNumber.toLowerCase());
      const matchPatient =
        !searchPatient ||
        (r.patientName || "")
          .toLowerCase()
          .includes(searchPatient.toLowerCase());
      const matchPackage =
        !searchPackage ||
        (r.packageName || "")
          .toLowerCase()
          .includes(searchPackage.toLowerCase()) ||
        String(r.package_id || "").includes(searchPackage);
      const matchPayment =
        !searchPaymentStatus || r.paymentStatus === searchPaymentStatus;
      const matchPaymentMethod =
        !searchPaymentMethod || r.paymentMethod === searchPaymentMethod;
      const matchDoctor =
        !searchDoctor ||
        (r.doctorName || "")
          .toLowerCase()
          .includes(searchDoctor.toLowerCase()) ||
        (r.referredByName || "")
          .toLowerCase()
          .includes(searchDoctor.toLowerCase());

      // Status matching
      let currentStatus = "Pending";
      if (r.is_Dispatched || r.dispatch_DateTime) currentStatus = "Dispatched";
      else if (r.is_approved) currentStatus = "Approved";
      else if (r.has_report) currentStatus = "Report Generated";

      const matchStatus = !searchStatus || currentStatus === searchStatus;

      return (
        matchBillNo &&
        matchUhid &&
        matchIpNumber &&
        matchPatient &&
        matchPackage &&
        matchPayment &&
        matchPaymentMethod &&
        matchDoctor &&
        matchStatus
      );
    });
  }, [
    rows,
    searchBillNo,
    searchUhid,
    searchIpNumber,
    searchPatient,
    searchPackage,
    searchStatus,
    searchPaymentStatus,
    searchPaymentMethod,
    searchDoctor,
  ]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => !r.has_report).length;
    const completed = rows.filter((r) => r.has_report && !r.is_approved).length;
    const approved = rows.filter((r) => r.is_approved && !(r.is_Dispatched || r.dispatch_DateTime)).length;
    const dispatched = rows.filter((r) => r.is_Dispatched || r.dispatch_DateTime).length;
    return { total, pending, completed, approved, dispatched };
  }, [rows]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const isPaymentAllowed = (paymentMethod, paymentStatus) => {
    const method = (paymentMethod || "").trim().toLowerCase();
    const status = (paymentStatus || "").trim().toLowerCase();
    if (method === "credit") return true;
    return status === "paid";
  };

  const handleNavigateToForm = (row) => {
    if (!isPaymentAllowed(row.paymentMethod, row.paymentStatus)) {
      toast.warning("Cannot open report: Payment is pending.");
      return;
    }
    const pkgId =
      row.package_id ||
      (row.items && row.items[0]?.package_id) ||
      (row.item && row.item[0]?.package_id) ||
      "0";
    const billClean = (row.investBillNo || "na").replace(/\//g, "-");
    navigate(`/MHCReportForm/${pkgId}/${billClean}`, {
      state: {
        investBillNo: row.investBillNo,
        investBillDate: row.investBillDate,
        uhid: row.uhid,
        patientName: row.patientName,
        age: row.age,
        age_type: row.age_type || "Y",
        gender: row.gender,
        doctor: row.doctor,
        doctorName: row.doctorName,
        referredBy: row.referredBy,
        referredByName: row.referredByName,
        package_id: pkgId,
        packageName: row.packageName,
        next_due_date: row.next_due_date,
      },
    });
  };

  const handlePatientCheckIn = async (row) => {
    if (!isPaymentAllowed(row.paymentMethod, row.paymentStatus)) {
      toast.warning("Cannot check in: Payment is pending.");
      return;
    }
    try {
      const result = await apiRequest(
        `${HMSURL}mhc-reports/checkin/${encodeURIComponent(row.investBillNo)}/`,
        "PATCH",
        {
          uhid: row.uhid,
          package_id: row.package_id,
          packageName: row.packageName,
        },
      );
      if (result.success) {
        toast.success("Patient Check-in marked! ✓");
        fetchData();
      } else {
        toast.error(result.error || "Check-in failed");
      }
    } catch {
      toast.error("Check-in failed");
    }
  };

  const handleApproveReport = async (row) => {
    if (
      !window.confirm(
        `Approve MHC report for ${row.patientName} (${row.investBillNo})?`,
      )
    )
      return;
    try {
      const result = await apiRequest(
        `${HMSURL}mhc-reports/approve/${encodeURIComponent(row.investBillNo)}/`,
        "PATCH",
      );
      if (result.success) {
        toast.success("Report approved successfully! ✓");
        fetchData();
      } else {
        toast.error(result.error || "Approval failed");
      }
    } catch {
      toast.error("Approval failed");
    }
  };

  const handleDispatchReport = async (row) => {
    if (!row.is_approved) {
      toast.warning("Only approved reports can be dispatched.");
      return;
    }
    if (row.is_Dispatched || row.dispatch_DateTime) {
      toast.info("Report is already dispatched.");
      return;
    }
    try {
      const result = await apiRequest(
        `${HMSURL}mhc-reports/dispatch/${encodeURIComponent(row.investBillNo)}/`,
        "PATCH",
        {},
      );
      if (result.error) {
        toast.error(result.error || "Dispatch failed");
        return;
      }
      toast.success("Report dispatched successfully! 📤");
      fetchData();
    } catch {
      toast.error("An error occurred while dispatching the report.");
    }
  };

  const handleDeleteReport = async (row) => {
    const reason = window.prompt("Reason for deleting report:");
    if (reason === null) return;
    try {
      const result = await apiRequest(
        `${HMSURL}mhc-reports/delete/${encodeURIComponent(row.investBillNo)}/`,
        "PATCH",
        { reason },
      );
      if (result.success) {
        toast.success("Report deleted successfully");
        fetchData();
      } else {
        toast.error(result.error || "Failed to delete report");
      }
    } catch {
      toast.error("Failed to delete report");
    }
  };

  // ── Format Map for Print & PDF ──────────────────────────────────────────────
  const [printFormat, setPrintFormat] = useState({});

  // ── Print Dropdown State ───────────────────────────────────────────────────
  const [printDropdownPos, setPrintDropdownPos] = useState({ top: 0, left: 0 });
  const [activePrintRowId, setActivePrintRowId] = useState(null);

  const showPrintDropdown = (row, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPrintDropdownPos({ top: rect.bottom - 2, left: rect.right - 200 });
    setActivePrintRowId(row.investBillNo);
  };

  const hidePrintDropdown = () => {
    setActivePrintRowId(null);
  };

  const activePrintRow = useMemo(
    () => rows.find((r) => r.investBillNo === activePrintRowId) || null,
    [rows, activePrintRowId],
  );

  // ── Open Print Preview ───────────────────────────────────────────────────────
  const handleOpenPrint = async (row) => {
    // Fallback: If patientName or gender is missing/N-A, fetch from patient_details
    if (!row.patientName || row.patientName === "N/A" || !row.gender || row.gender === "N/A") {
      try {
        const pRes = await apiRequest(`${HMSURL}patient_details/?uhid=${encodeURIComponent(row.uhid)}`, "GET");
        const pData = pRes.data?.data || (Array.isArray(pRes.data) ? pRes.data[0] : pRes.data) || {};
        if (pData) {
          const sal = pData.salutation || "";
          const fn = pData.firstName || pData.first_name || pData.patient_name || "";
          const mn = pData.middleName || pData.middle_name || "";
          const ln = pData.lastName || pData.last_name || "";
          const builtName = [sal, fn, mn, ln].filter(Boolean).join(" ");
          if (builtName) row.patientName = builtName;
          else if (pData.patient_name) row.patientName = pData.patient_name;
          if (pData.gender || pData.Gender) row.gender = pData.gender || pData.Gender;
          if (pData.age) row.age = pData.age;
          if (pData.age_type) row.age_type = pData.age_type;
        }
      } catch (err) {
        console.warn("Patient fallback fetch failed:", err);
      }
    }

    setPrintRow(row);
    setLoadingPrint(true);
    setPrintSignature(null);
    try {
      const pkgId = row.package_id || "579";
      const gender = (row.gender || "male").toLowerCase();

      const [reportRes, formatRes] = await Promise.all([
        apiRequest(`${HMSURL}mhc-reports/${encodeURIComponent(row.investBillNo)}/`, "GET"),
        apiRequest(
          `${HMSURL}mhc-reports/format/?package_id=${encodeURIComponent(pkgId)}&gender=${encodeURIComponent(gender)}`,
          "GET",
        ),
      ]);

      const repData = reportRes.data?.data || reportRes.data || row.report || null;
      const fmtData = formatRes.data?.sections || formatRes.sections || {};

      setPrintDetails(repData);
      setPrintFormat(fmtData);

      // Fetch employee signature
      const approverId =
        repData?.approved_by ||
        row.report?.approved_by ||
        repData?.created_by ||
        row.doctor ||
        row.doctor_id;

      if (approverId && approverId !== "system") {
        try {
          const sigRes = await apiRequest(
            `${HMSURL}employee-signature/?employee_id=${encodeURIComponent(approverId)}`,
            "GET",
          );
          if (sigRes.success && sigRes.data) {
            setPrintSignature(sigRes.data);
          }
        } catch (e) {
          console.warn("Could not fetch signature for preview:", e);
        }
      }
    } catch {
      setPrintDetails(row.report || null);
    } finally {
      setLoadingPrint(false);
    }
  };

  // ── Print Report in New Window (With / Without Letterpad) ───────────────────
  const handlePrintMHCReport = async (row, withLetterpad = true, downloadDirect = false) => {
    try {
      // Fallback: If patientName or gender is missing/N-A, fetch from patient_details
      if (!row.patientName || row.patientName === "N/A" || !row.gender || row.gender === "N/A") {
        try {
          const pRes = await apiRequest(`${HMSURL}patient_details/?uhid=${encodeURIComponent(row.uhid)}`, "GET");
          const pData = pRes.data?.data || (Array.isArray(pRes.data) ? pRes.data[0] : pRes.data) || {};
          if (pData) {
            const sal = pData.salutation || "";
            const fn = pData.firstName || pData.first_name || pData.patient_name || "";
            const mn = pData.middleName || pData.middle_name || "";
            const ln = pData.lastName || pData.last_name || "";
            const builtName = [sal, fn, mn, ln].filter(Boolean).join(" ");
            if (builtName) row.patientName = builtName;
            else if (pData.patient_name) row.patientName = pData.patient_name;
            if (pData.gender || pData.Gender) row.gender = pData.gender || pData.Gender;
            if (pData.age) row.age = pData.age;
            if (pData.age_type) row.age_type = pData.age_type;
          }
        } catch (err) {
          console.warn("Patient fallback fetch failed:", err);
        }
      }

      const pkgId = row.package_id || "579";
      const gender = (row.gender || "male").toLowerCase();

      let repData = row.report;
      let fmtData = printFormat;

      if (!repData || Object.keys(fmtData).length === 0 || printRow?.investBillNo !== row.investBillNo) {
        const [reportRes, formatRes] = await Promise.all([
          apiRequest(`${HMSURL}mhc-reports/${encodeURIComponent(row.investBillNo)}/`, "GET"),
          apiRequest(
            `${HMSURL}mhc-reports/format/?package_id=${encodeURIComponent(pkgId)}&gender=${encodeURIComponent(gender)}`,
            "GET",
          ),
        ]);
        repData = reportRes.data?.data || reportRes.data || row.report || null;
        fmtData = formatRes.data?.sections || formatRes.sections || {};
        if (!fmtData || Object.keys(fmtData).length === 0) {
          const errMsg =
            formatRes.error ||
            formatRes.data?.error ||
            "There is no format for this package";
          toast.error(errMsg);
          return;
        }
      }

      if (!repData) {
        toast.error("No report details available to print.");
        return;
      }

      // ── Fetch Employee Signature if available ──
      let signatureData = null;
      const approverId =
        repData?.approved_by ||
        row.report?.approved_by ||
        repData?.created_by ||
        row.doctor ||
        row.doctor_id;

      if (approverId && approverId !== "system") {
        try {
          const sigRes = await apiRequest(
            `${HMSURL}employee-signature/?employee_id=${encodeURIComponent(approverId)}`,
            "GET",
          );
          if (sigRes.success && sigRes.data) {
            signatureData = sigRes.data;
          }
        } catch (err) {
          console.warn("Could not fetch employee signature:", err);
        }
      }

      const valuedetails = repData.valuedetails || {};

      // Value extraction helper
      const getVal = (secKey, testCode, pmCode = null) => {
        const sec = valuedetails[secKey];
        if (!sec) return "";
        if (Array.isArray(sec)) {
          const item = sec.find((i) => i.test_code === testCode);
          if (!item) return "";
          if (pmCode && Array.isArray(item.parameter)) {
            const p = item.parameter.find((x) => x.pm_code === pmCode);
            return p?.value ?? "";
          }
          if (Array.isArray(item.value)) return item.value.join(", ");
          return item.value ?? "";
        }
        if (typeof sec === "object") {
          return sec[testCode] ?? "";
        }
        return "";
      };

      const getResult = (secKey, testCode, pmCode) => {
        const sec = valuedetails[secKey];
        if (!sec) return "";
        if (Array.isArray(sec)) {
          const item = sec.find((i) => i.test_code === testCode);
          if (!item) return "";
          if (pmCode && Array.isArray(item.parameter)) {
            const p = item.parameter.find((x) => x.pm_code === pmCode);
            return p?.result ?? "";
          }
        }
        return "";
      };

      // ── Build Fine-Grained Atomic Flow Blocks for 100% Continuous Natural Pagination ──
      const flowBlocks = [];

      // 1. Demographics Grid (Top of Page 1)
      flowBlocks.push(`
        <div class="flow-item" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px 10px; background: #f0fdfa; border: 1.5px solid #99f6e4; border-top: 1px dashed #99f6e4; border-radius: 0 0 6px 6px; padding: 4px 8px; font-size: 9.5px; margin-top: -3px; margin-bottom: 6px;">
          <div><span style="color:#0f766e; font-weight:700; font-size:8.5px; text-transform:uppercase; display:block;">Bill No</span><strong style="color: #0f172a;">${row.investBillNo || "N/A"}</strong></div>
          <div><span style="color:#0f766e; font-weight:700; font-size:8.5px; text-transform:uppercase; display:block;">Bill Date</span><strong style="color: #0f172a;">${row.investBillDate || "N/A"}</strong></div>
          <div><span style="color:#0f766e; font-weight:700; font-size:8.5px; text-transform:uppercase; display:block;">Package</span><strong style="color: #0f172a;">${row.packageName || `Package #${row.package_id || ""}`}</strong></div>
          <div><span style="color:#0f766e; font-weight:700; font-size:8.5px; text-transform:uppercase; display:block;">Doctor</span><strong style="color: #0f172a;">${row.doctorName || row.doctor || "SELF"}</strong></div>
          <div><span style="color:#0f766e; font-weight:700; font-size:8.5px; text-transform:uppercase; display:block;">Referred By</span><strong style="color: #0f172a;">${row.referredByName || row.referredBy || "SELF"}</strong></div>
          <div><span style="color:#0f766e; font-weight:700; font-size:8.5px; text-transform:uppercase; display:block;">Report Status</span><strong style="color: ${row.is_approved ? "#059669" : "#d97706"};">${row.is_approved ? "Approved" : "Completed"}</strong></div>
        </div>
      `);

      // 2. Vitals Check
      const vitalsItems = fmtData["vitals_check"] || [];
      if (vitalsItems.length > 0) {
        const vitalsRows = [];
        for (let i = 0; i < vitalsItems.length; i += 2) {
          const item1 = vitalsItems[i];
          const item2 = vitalsItems[i + 1] || null;

          const cell1 = `
            <td style="background: #e8f0fe; color: #1e293b; font-weight: 700; padding: 4px 6px; border: 1px solid #cbd5e1; width: 25%; font-size: 10px;">${item1.test_name}</td>
            <td style="background: #ffffff; color: #0f172a; padding: 4px 6px; border: 1px solid #cbd5e1; width: 25%; font-weight: 600; font-size: 10px;">${getVal("vitals_check", item1.test_code) || "-"}</td>
          `;

          const cell2 = item2
            ? `
            <td style="background: #e8f0fe; color: #1e293b; font-weight: 700; padding: 4px 6px; border: 1px solid #cbd5e1; width: 25%; font-size: 10px;">${item2.test_name}</td>
            <td style="background: #ffffff; color: #0f172a; padding: 4px 6px; border: 1px solid #cbd5e1; width: 25%; font-weight: 600; font-size: 10px;">${getVal("vitals_check", item2.test_code) || "-"}</td>
          `
            : `
            <td style="background: #f8fafc; border: 1px solid #cbd5e1; width: 25%;"></td>
            <td style="background: #f8fafc; border: 1px solid #cbd5e1; width: 25%;"></td>
          `;

          vitalsRows.push(`<tr>${cell1}${cell2}</tr>`);
        }

        flowBlocks.push(`
          <div class="flow-item" style="margin-bottom: 6px;">
            <div class="sec-title">1. Vitals Check</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1;">
              <tbody>
                ${vitalsRows.join("")}
              </tbody>
            </table>
          </div>
        `);
      }

      // 3. Previous Medical History (Granular item-level emission)
      const prevItems = fmtData["previous_medical_history"] || [];
      if (prevItems.length > 0) {
        prevItems.forEach((item, idx) => {
          const hasParams = Array.isArray(item.parameter) && item.parameter.length > 0;
          const hasOptions = Array.isArray(item.value_options) && item.value_options.length > 0;
          let itemContent = "";

          if (hasParams) {
            itemContent = `
              <div style="margin-bottom: 2px;">
                <div style="font-size: 10px; font-weight: 700; color: #1e3a8a; margin-bottom: 2px;">${item.test_name}:</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1;">
                  <thead>
                    <tr style="background-color: #1e3a8a !important; color: #ffffff !important;">
                      ${item.parameter
                        .map(
                          (p) =>
                            `<th style="background-color: #1e3a8a !important; color: #ffffff !important; padding: 4px 6px; text-align: center; font-weight: 800; border: 1px solid #cbd5e1; font-size: 9.5px;">${p.pm_name}</th>`,
                        )
                        .join("")}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      ${item.parameter
                        .map(
                          (p) =>
                            `<td style="padding: 4px 6px; text-align: center; font-weight: 700; color: #0f172a; border: 1px solid #cbd5e1; background: #ffffff; font-size: 9.5px;">${getVal("previous_medical_history", item.test_code, p.pm_code) || "-"}</td>`,
                        )
                        .join("")}
                    </tr>
                  </tbody>
                </table>
              </div>
            `;
          } else if (hasOptions) {
            const rawVal = getVal("previous_medical_history", item.test_code);
            const selectedOpts = Array.isArray(rawVal) ? rawVal : rawVal ? [rawVal] : [];
            if (selectedOpts.length > 0) {
              itemContent = `
                <div style="margin-bottom: 3px;">
                  <div style="font-size: 10px; font-weight: 700; color: #1e3a8a; margin-bottom: 2px;">${item.test_name}:</div>
                  <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                    ${selectedOpts
                      .map(
                        (c) =>
                          `<span style="background: #f0fdfa; border: 1px solid #0d9488; color: #0f766e; padding: 1px 6px; border-radius: 10px; font-size: 9.5px; font-weight: 700;">✓ ${c}</span>`,
                      )
                      .join("")}
                  </div>
                </div>
              `;
            }
          } else {
            const val = getVal("previous_medical_history", item.test_code);
            itemContent = `
              <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1; margin-bottom: 3px;">
                <tbody>
                  <tr>
                    <td style="background: #e8f0fe; color: #1e293b; font-weight: 700; padding: 4px 6px; border: 1px solid #cbd5e1; width: 35%; font-size: 10px;">${item.test_name}</td>
                    <td style="background: #ffffff; color: #0f172a; padding: 4px 6px; border: 1px solid #cbd5e1; width: 65%; font-size: 10px;">${val || "-"}</td>
                  </tr>
                </tbody>
              </table>
            `;
          }

          if (itemContent) {
            const titlePrefix = idx === 0 ? `<div class="sec-title">2. Previous Medical History</div>` : "";
            flowBlocks.push(`
              <div class="flow-item" style="margin-bottom: 4px;">
                ${titlePrefix}
                ${itemContent}
              </div>
            `);
          }
        });
      }

      // 4. Physical Examination
      const physItems = fmtData["physical_examination"] || [];
      if (physItems.length > 0) {
        flowBlocks.push(`
          <div class="flow-item" style="margin-bottom: 6px;">
            <div class="sec-title">3. Physical Examination</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1;">
              <thead>
                <tr style="background-color: #1e3a8a !important; color: #ffffff !important;">
                  <th style="background-color: #1e3a8a !important; color: #ffffff !important; font-weight: 800; padding: 4px 6px; text-align: left; font-size: 10px; border: 1px solid #cbd5e1; width: 30%;">System / Category</th>
                  <th style="background-color: #1e3a8a !important; color: #ffffff !important; font-weight: 800; padding: 4px 6px; text-align: left; font-size: 10px; border: 1px solid #cbd5e1; width: 70%;">Clinical Findings / Assessment</th>
                </tr>
              </thead>
              <tbody>
                ${physItems
                  .map(
                    (it) => `
                  <tr>
                    <td style="background: #e8f0fe; color: #1e293b; font-weight: 700; padding: 3.5px 6px; border: 1px solid #cbd5e1; width: 30%; font-size: 10px;">${it.test_name}</td>
                    <td style="background: #ffffff; color: #0f172a; padding: 3.5px 6px; border: 1px solid #cbd5e1; width: 70%; font-size: 10px;">${getVal("physical_examination", it.test_code) || "-"}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `);
      }

      // 5. Vaccination Status
      const vaccineItems = fmtData["vaccination_status"] || [];
      if (vaccineItems.length > 0) {
        const vacRows = vaccineItems
          .map((vGroup) =>
            (vGroup.parameter || [])
              .map(
                (vac) => `
                <tr>
                  <td style="background: #e8f0fe; color: #1e293b; font-weight: 700; padding: 3.5px 6px; border: 1px solid #cbd5e1; width: 40%; font-size: 10px;">${vac.pm_name}</td>
                  <td style="background: #ffffff; color: #0f172a; padding: 3.5px 6px; border: 1px solid #cbd5e1; width: 60%; font-size: 10px;">${getVal("vaccination_status", vGroup.test_code, vac.pm_code) || "-"}</td>
                </tr>
              `,
              )
              .join(""),
          )
          .join("");

        if (vacRows) {
          flowBlocks.push(`
            <div class="flow-item" style="margin-bottom: 6px;">
              <div class="sec-title">4. Vaccination History</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1;">
                <thead>
                  <tr style="background-color: #1e3a8a !important; color: #ffffff !important;">
                    <th style="background-color: #1e3a8a !important; color: #ffffff !important; font-weight: 800; padding: 4px 6px; text-align: left; font-size: 10px; border: 1px solid #cbd5e1; width: 40%;">Vaccine</th>
                    <th style="background-color: #1e3a8a !important; color: #ffffff !important; font-weight: 800; padding: 4px 6px; text-align: left; font-size: 10px; border: 1px solid #cbd5e1; width: 60%;">Doses & Date / Status</th>
                  </tr>
                </thead>
                <tbody>${vacRows}</tbody>
              </table>
            </div>
          `);
        }
      }

      // 6. Investigations
      const investItems = fmtData["investigations"] || [];
      if (investItems.length > 0) {
        investItems.forEach((inv, idx) => {
          const titlePrefix =
            idx === 0
              ? `
            <div class="sec-title">5. Investigations</div>
            <div style="font-size: 9px; color: #475569; font-style: italic; margin-top: 1px; margin-bottom: 4px; line-height: 1.3;">
              Laboratory panel to be attached separately as lab report. Special investigations below to be recorded here.
            </div>
          `
              : "";

          if (Array.isArray(inv.parameter) && inv.parameter.length > 0) {
            const rows = inv.parameter
              .map((p) => {
                const val = getVal("investigations", inv.test_code, p.pm_code);
                const res = getResult("investigations", inv.test_code, p.pm_code);
                const isAbnormal = res === "Abnormal";
                return `
                  <tr>
                    <td style="background: #e8f0fe; color: #1e293b; font-weight: 700; padding: 3px 6px; border: 1px solid #cbd5e1; width: 40%; font-size: 10px;">${p.pm_name}</td>
                    <td style="background: #ffffff; color: #0f172a; padding: 3px 6px; border: 1px solid #cbd5e1; width: 35%; font-size: 10px;">${val || "-"}</td>
                    <td style="background: #ffffff; padding: 3px 6px; border: 1px solid #cbd5e1; width: 25%; font-size: 10px; font-weight: 700; color: ${isAbnormal ? "#dc2626" : "#0d9488"};">${res || "-"}</td>
                  </tr>
                `;
              })
              .join("");

            flowBlocks.push(`
              <div class="flow-item" style="margin-bottom: 5px;">
                ${titlePrefix}
                <div style="font-size: 10px; font-weight: 700; color: #1e3a8a; background: #eff6ff; padding: 2px 6px; border-left: 3px solid #3b82f6; margin-bottom: 2px;">
                  5.${idx + 1} ${inv.test_name}
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1;">
                  <thead>
                    <tr style="background-color: #1e3a8a !important; color: #ffffff !important;">
                      <th style="background-color: #1e3a8a !important; color: #ffffff !important; font-weight: 800; padding: 3px 6px; text-align: left; font-size: 9.5px; border: 1px solid #cbd5e1; width: 40%;">Parameter</th>
                      <th style="background-color: #1e3a8a !important; color: #ffffff !important; font-weight: 800; padding: 3px 6px; text-align: left; font-size: 9.5px; border: 1px solid #cbd5e1; width: 35%;">Finding / Value</th>
                      <th style="background-color: #1e3a8a !important; color: #ffffff !important; font-weight: 800; padding: 3px 6px; text-align: left; font-size: 9.5px; border: 1px solid #cbd5e1; width: 25%;">Normal / Abnormal</th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
              </div>
            `);
          } else {
            const val = getVal("investigations", inv.test_code);
            flowBlocks.push(`
              <div class="flow-item" style="margin-bottom: 4px; font-size: 10px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px 6px; background: #f8fafc;">
                ${titlePrefix}
                <strong style="color: #1e3a8a;">5.${idx + 1} ${inv.test_name}:</strong> <span style="color: #0f172a; margin-left: 6px;">${val || "-"}</span>
              </div>
            `);
          }
        });
      }

      // 7. Summary of Review & Recommendations
      const reviewItems = fmtData["summary_of_review"] || [];
      const procedureItems = fmtData["procedure_or_suregery_advised"] || [];
      const pediatricItems = fmtData["pediatric_master_health_check-up"] || [];
      const consultItems = fmtData["consultant_opinion"] || [];
      const dueSec = valuedetails["next_master_health_check-up_due"] || [];

      if (reviewItems.length > 0) {
        const rows = reviewItems
          .map((it) => {
            const v = getVal("summary_of_review", it.test_code);
            return `
              <tr>
                <td style="background: #e8f0fe; color: #1e293b; font-weight: 700; padding: 3px 6px; border: 1px solid #cbd5e1; width: 30%; font-size: 10px;">${it.test_name}</td>
                <td style="background: #ffffff; color: #0f172a; padding: 3px 6px; border: 1px solid #cbd5e1; width: 70%; font-size: 10px;">${v || "-"}</td>
              </tr>
            `;
          })
          .join("");

        flowBlocks.push(`
          <div class="flow-item" style="margin-bottom: 4px;">
            <div class="sec-title">6. Summary of Review & Recommendations</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1;">
              <tbody>${rows}</tbody>
            </table>
          </div>
        `);
      }

      if (procedureItems.length > 0) {
        const rows = procedureItems
          .map((it) => {
            const v = getVal("procedure_or_suregery_advised", it.test_code);
            return `
              <tr>
                <td style="background: #e8f0fe; color: #1e293b; font-weight: 700; padding: 3px 6px; border: 1px solid #cbd5e1; width: 35%; font-size: 10px;">${it.test_name}</td>
                <td style="background: #ffffff; color: #0f172a; padding: 3px 6px; border: 1px solid #cbd5e1; width: 65%; font-size: 10px;">${v || "-"}</td>
              </tr>
            `;
          })
          .join("");

        flowBlocks.push(`
          <div class="flow-item" style="margin-bottom: 4px;">
            <div style="font-size: 10px; font-weight: 700; color: #1e3a8a; margin: 2px 0;">Procedure / Surgery Advised</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1;">
              <tbody>${rows}</tbody>
            </table>
          </div>
        `);
      }

      const dueItem = Array.isArray(dueSec) ? dueSec.find((i) => i.test_code === "NMHCD01") : null;
      const dateItem = Array.isArray(dueSec) ? dueSec.find((i) => i.test_code === "NMHCD02") : null;
      const dueVal = dueItem?.value || (dueSec["NMHCD01"] || "");
      const dateVal = dateItem?.value || (dueSec["NMHCD02"] || "");

      if (dueVal || dateVal) {
        flowBlocks.push(`
          <div class="flow-item" style="margin: 3px 0; background: #f0fdfa; border: 1.5px solid #0d9488; border-radius: 5px; padding: 3px 8px; display: flex; justify-content: space-between; align-items: center; font-size: 10px;">
            <div><strong style="color: #0f766e;">Next Master Health Check-up Due:</strong> <span>${dueVal || "Routine"}</span></div>
            ${dateVal ? `<div><strong style="color: #0f766e;">📅 Review Date:</strong> <span style="font-weight: 700;">${dateVal}</span></div>` : ""}
          </div>
        `);
      }

      if (pediatricItems.length > 0) {
        const rows = pediatricItems
          .map((it) => {
            const v = getVal("pediatric_master_health_check-up", it.test_code);
            return `
              <tr>
                <td style="background: #e8f0fe; color: #1e293b; font-weight: 700; padding: 3px 6px; border: 1px solid #cbd5e1; width: 35%; font-size: 10px;">${it.test_name}</td>
                <td style="background: #ffffff; color: #0f172a; padding: 3px 6px; border: 1px solid #cbd5e1; width: 65%; font-size: 10px;">${v || "-"}</td>
              </tr>
            `;
          })
          .join("");

        flowBlocks.push(`
          <div class="flow-item" style="margin-bottom: 4px;">
            <div style="font-size: 10px; font-weight: 700; color: #1e3a8a; margin: 2px 0;">Pediatric Master Health Check-up</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1;">
              <tbody>${rows}</tbody>
            </table>
          </div>
        `);
      }

      if (consultItems.length > 0) {
        const rows = consultItems
          .map((it) => {
            const v = getVal("consultant_opinion", it.test_code);
            return `
              <tr>
                <td style="background: #e8f0fe; color: #1e293b; font-weight: 700; padding: 3px 6px; border: 1px solid #cbd5e1; width: 30%; font-size: 10px;">${it.test_name}</td>
                <td style="background: #ffffff; color: #0f172a; padding: 3px 6px; border: 1px solid #cbd5e1; width: 70%; font-size: 10px;">${v || "-"}</td>
              </tr>
            `;
          })
          .join("");

        flowBlocks.push(`
          <div class="flow-item" style="margin-bottom: 4px;">
            <div style="font-size: 10px; font-weight: 700; color: #1e3a8a; margin: 2px 0;">Consultant Opinion</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1;">
              <tbody>${rows}</tbody>
            </table>
          </div>
        `);
      }

      // 8. Overall Impression
      if (repData.impression || row.impression) {
        flowBlocks.push(`
          <div class="flow-item" style="margin-bottom: 5px; padding: 5px 8px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 5px;">
            <div style="font-size: 10.5px; font-weight: 800; color: #1e3a8a; margin-bottom: 2px; text-transform: uppercase;">
              7. OVERALL IMPRESSION, CLINICAL ASSESSMENT & ADVICE
            </div>
            <div style="font-size: 10px; line-height: 1.35; color: #1e293b;">
              ${repData.impression || row.impression || ""}
            </div>
          </div>
        `);
      }

      // 9. Doctor Signature Block
      flowBlocks.push(`
        <div class="flow-item" style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 6px; padding-top: 4px; page-break-inside: avoid; break-inside: avoid;">
          <div style="font-size: 8.5px; color: #64748b;">
            Report Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
          </div>
          <div style="text-align: center; min-width: 180px;">
            ${
              signatureData?.signatureBase64
                ? `<img src="data:image/png;base64,${signatureData.signatureBase64}" style="max-height: 36px; max-width: 130px; object-fit: contain; margin-bottom: 2px;" />`
                : `<div style="height: 25px;"></div>`
            }
            <div style="border-top: 1.5px solid #0f172a; width: 100%; padding-top: 2px;">
              <strong style="font-size: 10px; color: #0f172a; display: block;">
                ${signatureData?.employeeName || row.doctorName || row.doctor || "Consultant Physician"}
              </strong>
              <div style="font-size: 8.5px; color: #475569; margin-top: 1px;">
                ${signatureData?.designation || "Consultant Physician / MHC"}
              </div>
              ${
                signatureData?.registrationNumber
                  ? `<div style="font-size: 8px; color: #64748b; margin-top: 1px;">Reg. No: ${signatureData.registrationNumber}</div>`
                  : ""
              }
            </div>
          </div>
        </div>
      `);

      // ── Header & Footer Blocks ──
      const headerImgBlock = withLetterpad
        ? `<div style="text-align: center; margin-bottom: 2px; width: 100%;">
             <img src="${headerImage}" alt="Header" style="width: 100%; max-width: 100%; height: auto; max-height: 80px; object-fit: fill; display: block;" />
           </div>`
        : `<div style="height: 82px;"></div>`;

      const footerImgBlock = withLetterpad
        ? `<div style="width: 100%; text-align: center;">
             <img src="${FooterImage}" alt="Footer" style="width: 100%; max-width: 100%; height: auto; max-height: 52px; object-fit: fill; display: block; margin: 0 auto;" />
           </div>`
        : `<div style="height: 52px;"></div>`;

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Popup blocked! Please allow popups for this site to print.");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>MHC Report — ${row.patientName || row.investBillNo}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 5mm 8mm 5mm 8mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              font-family: "Segoe UI", Arial, sans-serif;
              font-size: 10px;
              color: #0f172a;
              background: #f1f5f9;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .a4-page {
              width: 100%;
              max-width: 100%;
              min-height: 1030px;
              max-height: 1050px;
              height: 1040px;
              position: relative;
              background: white;
              padding: 0 4px;
              box-sizing: border-box;
              page-break-after: always;
              break-after: page;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              overflow: hidden;
            }
            .a4-page:last-child {
              page-break-after: avoid;
              break-after: avoid;
            }
            .page-top-container {
              flex-shrink: 0;
            }
            .page-body-container {
              flex-grow: 1;
              margin-bottom: 4px;
            }
            .page-footer-container {
              flex-shrink: 0;
              width: 100%;
              padding-top: 2px;
              margin-top: auto;
            }
            th {
              background-color: #1e3a8a !important;
              color: #ffffff !important;
              font-weight: 800 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .sec-title {
              font-size: 11px;
              font-weight: 800;
              color: #1e3a8a;
              border-bottom: 2px solid #1e3a8a;
              padding-bottom: 1.5px;
              margin-bottom: 3px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            @media print {
              body {
                background: white;
                padding: 0;
              }
              .a4-page {
                box-shadow: none;
                margin: 0;
                width: 100%;
                min-height: 100vh;
                height: 100vh;
                max-height: 100vh;
                page-break-after: always;
                break-after: page;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
            }
          </style>
        </head>
        <body>
          <!-- Hidden measurement container for raw content blocks -->
          <div id="raw-content" style="position: absolute; left: -9999px; top: -9999px; width: 730px; visibility: hidden;">
            ${flowBlocks.join("")}
          </div>

          <!-- Paged output container rendered by client script -->
          <div id="pages-root"></div>

          <script>
            window.onload = function() {
              try {
                var raw = document.getElementById("raw-content");
                var root = document.getElementById("pages-root");
                var items = Array.from(raw.children);

                function createHeaderHtml(pageNum, totalPages) {
                  return \`
                    <div class="page-top-container">
                      ${headerImgBlock}
                      <div style="text-align: center; font-size: 12.5px; font-weight: 800; color: #1e3a8a; margin: 1px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                        MASTER HEALTH CHECK-UP REPORT
                      </div>
                      <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 2px 8px; background: #f0fdfa; border: 1.5px solid #99f6e4; border-radius: 5px; padding: 3px 8px; font-size: 9.5px;">
                        <div><span style="color:#0f766e; font-weight:700; font-size:8.5px; text-transform:uppercase; margin-right: 4px;">Patient Name:</span><strong style="color: #0f172a; font-size: 10px;">${row.patientName || "N/A"}</strong></div>
                        <div><span style="color:#0f766e; font-weight:700; font-size:8.5px; text-transform:uppercase; margin-right: 4px;">UHID:</span><strong style="color: #0f172a; font-size: 10px;">${row.uhid || "N/A"}</strong></div>
                        <div><span style="color:#0f766e; font-weight:700; font-size:8.5px; text-transform:uppercase; margin-right: 4px;">Age / Gender:</span><strong style="color: #0f172a; font-size: 10px;">${row.age || ""} ${row.age_type || "Y"} / ${row.gender || "N/A"}</strong></div>
                      </div>
                      <div style="display: flex; justify-content: flex-end; align-items: center; margin: 1px 0 2px; padding-right: 2px; font-size: 8.5px; font-weight: 700; color: #475569;">
                        Page \${pageNum} of \${totalPages}
                      </div>
                    </div>
                  \`;
                }

                var footerHtml = \`
                  <div class="page-footer-container">
                    ${footerImgBlock}
                  </div>
                \`;

                // Smart table splitter function
                function splitTableElement(itemEl, availSpace) {
                  var tableEl = itemEl.querySelector('table');
                  if (!tableEl) return null;

                  var theadEl = tableEl.querySelector('thead');
                  var theadHtml = theadEl ? theadEl.outerHTML : '';
                  var theadHeight = theadEl ? theadEl.offsetHeight : 22;

                  var titleEl = itemEl.querySelector('.sec-title');
                  var titleHtml = titleEl ? titleEl.outerHTML : '';
                  var titleText = titleEl ? titleEl.innerText : '';
                  var titleHeight = titleEl ? titleEl.offsetHeight : 0;

                  var subNoteEl = itemEl.querySelector('div[style*="font-style: italic"]');
                  var subNoteHtml = subNoteEl ? subNoteEl.outerHTML : '';
                  var subNoteHeight = subNoteEl ? subNoteEl.offsetHeight : 0;

                  var subHeaderEl = itemEl.querySelector('div[style*="border-left"]');
                  var subHeaderHtml = subHeaderEl ? subHeaderEl.outerHTML : '';
                  var subHeaderHeight = subHeaderEl ? subHeaderEl.offsetHeight : 0;

                  var headerCost = titleHeight + subNoteHeight + subHeaderHeight + theadHeight + 8;
                  if (availSpace <= headerCost + 20) return null;

                  var tbodyEl = tableEl.querySelector('tbody');
                  if (!tbodyEl) return null;

                  var rows = Array.from(tbodyEl.querySelectorAll('tr'));
                  if (rows.length <= 1) return null;

                  var tableStyle = tableEl.getAttribute('style') || 'width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1;';
                  var itemStyle = itemEl.getAttribute('style') || 'margin-bottom: 6px;';

                  var fitRows = [];
                  var remRows = [];
                  var accHeight = headerCost;

                  rows.forEach(function(r) {
                    var rH = r.offsetHeight || 20;
                    if (accHeight + rH <= availSpace && remRows.length === 0) {
                      fitRows.push(r.outerHTML);
                      accHeight += rH;
                    } else {
                      remRows.push(r.outerHTML);
                    }
                  });

                  if (fitRows.length === 0 || remRows.length === 0) return null;

                  var part1 = '<div class="flow-item" style="' + itemStyle + '">' +
                    titleHtml +
                    subNoteHtml +
                    subHeaderHtml +
                    '<table style="' + tableStyle + '">' +
                      theadHtml +
                      '<tbody>' + fitRows.join('') + '</tbody>' +
                    '</table>' +
                  '</div>';

                  var contdTitle = titleText ? '<div class="sec-title">' + titleText + ' (Contd.)</div>' : '';
                  var part2 = '<div class="flow-item" style="' + itemStyle + '">' +
                    contdTitle +
                    subHeaderHtml +
                    '<table style="' + tableStyle + '">' +
                      theadHtml +
                      '<tbody>' + remRows.join('') + '</tbody>' +
                    '</table>' +
                  '</div>';

                  return { part1: part1, part2: part2 };
                }

                var pages = [];
                var currentPageItems = [];
                var currentHeight = 0;
                var maxPageHeight = 820; // Safe optimal height threshold preventing any footer overlap

                var queue = items.slice();

                while (queue.length > 0) {
                  var item = queue.shift();
                  var itemHeight = item.offsetHeight || 22;

                  if (currentHeight + itemHeight <= maxPageHeight) {
                    currentPageItems.push(item.outerHTML || item);
                    currentHeight += itemHeight;
                  } else {
                    var avail = maxPageHeight - currentHeight;
                    var split = (avail >= 60 && item.querySelector) ? splitTableElement(item, avail) : null;

                    if (split) {
                      currentPageItems.push(split.part1);
                      pages.push(currentPageItems);

                      var tempEl = document.createElement("div");
                      tempEl.innerHTML = split.part2;
                      raw.appendChild(tempEl);
                      var newChild = tempEl.firstElementChild || tempEl;

                      currentPageItems = [];
                      currentHeight = 0;
                      queue.unshift(newChild);
                    } else {
                      if (currentPageItems.length > 0) {
                        pages.push(currentPageItems);
                        currentPageItems = [item.outerHTML || item];
                        currentHeight = itemHeight;
                      } else {
                        pages.push([item.outerHTML || item]);
                        currentPageItems = [];
                        currentHeight = 0;
                      }
                    }
                  }
                }

                if (currentPageItems.length > 0) {
                  pages.push(currentPageItems);
                }

                var totalPages = pages.length || 1;

                // Render each discrete page with exact Page X of Y
                pages.forEach(function(pageItems, pIdx) {
                  var pageNum = pIdx + 1;
                  var pageDiv = document.createElement("div");
                  pageDiv.className = "a4-page";
                  pageDiv.innerHTML = createHeaderHtml(pageNum, totalPages) +
                    '<div class="page-body-container">' + pageItems.join("") + '</div>' +
                    footerHtml;
                  root.appendChild(pageDiv);
                });

                raw.remove();

                setTimeout(function() {
                  window.print();
                }, 350);
              } catch (err) {
                console.error("Pagination error:", err);
                window.print();
              }
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("Print MHC Report error:", err);
      toast.error("Failed to generate MHC Report printout.");
    }
  };

  return (
    <PageWrapper>
      <Container>
        <ContentCard>
          <TopBar>
            <PageTitle>Master Health Check-up (MHC) Reports</PageTitle>
            <ActionGroup>
              <ActionBtn
                onClick={() => navigate("/MHCReviewList")}
                bg="#0d9488"
                style={{ fontWeight: 700 }}
                title="View Next Due & Review Schedule"
              >
                📅 Review & Due Reminders
              </ActionBtn>
              <ActionBtn onClick={fetchData} bg="#0f766e">
                🔄 Refresh
              </ActionBtn>
              <ActionBtn
                onClick={() => navigate("/InvestigationBilling")}
                bg="#0284c7"
              >
                + New Package Bill
              </ActionBtn>
            </ActionGroup>
          </TopBar>

          {/* Quick Date Presets */}
          <QuickFilterRow>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>
              Quick Dates:
            </span>
            <QuickFilterBtn
              active={fromDate === getToday() && toDate === getToday()}
              onClick={() => setQuickDate("today")}
            >
              Today
            </QuickFilterBtn>
            <QuickFilterBtn onClick={() => setQuickDate("yesterday")}>
              Yesterday
            </QuickFilterBtn>
            <QuickFilterBtn onClick={() => setQuickDate("week")}>
              Last 7 Days
            </QuickFilterBtn>
            <QuickFilterBtn onClick={() => setQuickDate("month")}>
              Last 30 Days
            </QuickFilterBtn>
          </QuickFilterRow>

          {/* Stats Bar */}
          <StatsRow>
            <StatCard bg="#f0fdf4" border="#bbf7d0">
              <StatNum color="#16a34a">{stats.total}</StatNum>
              <StatLabel>Total Patients</StatLabel>
            </StatCard>
            <StatCard bg="#fffbeb" border="#fde68a">
              <StatNum color="#d97706">{stats.pending}</StatNum>
              <StatLabel>Pending Reports</StatLabel>
            </StatCard>
            <StatCard bg="#eff6ff" border="#bfdbfe">
              <StatNum color="#2563eb">{stats.completed}</StatNum>
              <StatLabel>Completed Drafts</StatLabel>
            </StatCard>
            <StatCard bg="#f0fdfa" border="#99f6e4">
              <StatNum color="#0d9488">{stats.approved}</StatNum>
              <StatLabel>Approved Reports</StatLabel>
            </StatCard>
            <StatCard bg="#fdf2f8" border="#fbcfe8">
              <StatNum color="#db2777">{stats.dispatched}</StatNum>
              <StatLabel>Dispatched</StatLabel>
            </StatCard>
          </StatsRow>

          {/* Filter Bar */}
          <FilterGrid>
            <FilterField>
              <FilterLabel>From Date</FilterLabel>
              <FilterInput
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </FilterField>
            <FilterField>
              <FilterLabel>To Date</FilterLabel>
              <FilterInput
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </FilterField>
            <FilterField>
              <FilterLabel>Bill No</FilterLabel>
              <FilterInput
                placeholder="Search Bill No..."
                value={searchBillNo}
                onChange={(e) => setSearchBillNo(e.target.value)}
              />
            </FilterField>
            <FilterField>
              <FilterLabel>UHID</FilterLabel>
              <FilterInput
                placeholder="Search UHID..."
                value={searchUhid}
                onChange={(e) => setSearchUhid(e.target.value)}
              />
            </FilterField>
            <FilterField>
              <FilterLabel>Patient Name</FilterLabel>
              <FilterInput
                placeholder="Search Name..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
              />
            </FilterField>
            <FilterField>
              <FilterLabel>Package</FilterLabel>
              <FilterInput
                placeholder="Search Package..."
                value={searchPackage}
                onChange={(e) => setSearchPackage(e.target.value)}
              />
            </FilterField>
            <FilterField>
              <FilterLabel>Report Status</FilterLabel>
              <FilterSelect
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Report Generated">Report Generated</option>
                <option value="Approved">Approved</option>
                <option value="Dispatched">Dispatched</option>
              </FilterSelect>
            </FilterField>
            <FilterField>
              <FilterLabel>Payment Method</FilterLabel>
              <FilterSelect
                value={searchPaymentMethod}
                onChange={(e) => setSearchPaymentMethod(e.target.value)}
              >
                <option value="">All Methods</option>
                {paymentMethodOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </FilterSelect>
            </FilterField>
            <FilterField>
              <FilterLabel>Payment Status</FilterLabel>
              <FilterSelect
                value={searchPaymentStatus}
                onChange={(e) => setSearchPaymentStatus(e.target.value)}
              >
                <option value="">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </FilterSelect>
            </FilterField>
          </FilterGrid>

          {/* Data Table */}
          {loading ? (
            <EmptyState>Loading MHC Patient Investigations...</EmptyState>
          ) : filteredRows.length === 0 ? (
            <EmptyState>
              No MHC patient investigations found for selected filters.
            </EmptyState>
          ) : (
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>Bill No</Th>
                    <Th>Date & Time</Th>
                    <Th>UHID / IP</Th>
                    <Th>Patient Name</Th>
                    <Th>Package</Th>
                    <Th>Doctor / Ref.</Th>
                    <Th>Payment</Th>
                    <Th>Next Due Date</Th>
                    <Th>Report Status</Th>
                    <Th style={{ textAlign: "center" }}>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, idx) => {
                    const isApproved = !!row.is_approved;
                    const hasReport = !!row.has_report;
                    const isPaymentValid = isPaymentAllowed(row.paymentMethod, row.paymentStatus);

                    return (
                      <Tr key={idx}>
                        <Td>
                          <strong style={{ color: "#0f766e" }}>
                            {row.investBillNo}
                          </strong>
                        </Td>
                        <Td>
                          <div style={{ fontSize: "0.82rem" }}>
                            {row.investBillDate}
                          </div>
                        </Td>
                        <Td>
                          <div style={{ fontWeight: 700 }}>{row.uhid}</div>
                          {row.ipNumber && (
                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                              IP: {row.ipNumber}
                            </div>
                          )}
                        </Td>
                        <Td>
                          <div style={{ fontWeight: 700 }}>
                            {row.patientName}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {row.gender} • {row.age} {row.age_type || "Y"}
                          </div>
                        </Td>
                        <Td>
                          <Badge bg="#e0f2fe" color="#0369a1" border="#bae6fd">
                            {row.packageName || `Package #${row.package_id}`}
                          </Badge>
                        </Td>
                        <Td>
                          <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            {row.doctorName || row.doctor || "SELF"}
                          </div>
                          {row.referredByName &&
                            row.referredByName !== row.doctorName && (
                              <div
                                style={{ fontSize: "0.72rem", color: "#64748b" }}
                              >
                                Ref: {row.referredByName}
                              </div>
                            )}
                        </Td>
                        <Td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-start" }}>
                            <Badge
                              bg={
                                (row.paymentMethod || "").toLowerCase() === "credit"
                                  ? "#ede9fe"
                                  : "#e0f2fe"
                              }
                              color={
                                (row.paymentMethod || "").toLowerCase() === "credit"
                                  ? "#6d28d9"
                                  : "#0369a1"
                              }
                            >
                              💳 {row.paymentMethod || "Cash"}
                            </Badge>
                            <Badge
                              bg={
                                row.paymentStatus === "Paid"
                                  ? "#dcfce7"
                                  : "#fef3c7"
                              }
                              color={
                                row.paymentStatus === "Paid"
                                  ? "#15803d"
                                  : "#b45309"
                              }
                            >
                              {row.paymentStatus || "Pending"}
                            </Badge>
                          </div>
                        </Td>
                        <Td>
                          {row.next_due_date ? (
                            <Badge bg="#f0fdfa" color="#0f766e" border="#99f6e4">
                              📅 {row.next_due_date}
                            </Badge>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>—</span>
                          )}
                        </Td>
                        <Td>
                          {row.is_Dispatched || row.dispatch_DateTime ? (
                            <Badge
                              bg="#fdf2f8"
                              color="#db2777"
                              border="#fbcfe8"
                            >
                              📤 Dispatched
                            </Badge>
                          ) : isApproved ? (
                            <Badge
                              bg="#ccfbf1"
                              color="#0f766e"
                              border="#99f6e4"
                            >
                              ✓ Approved
                            </Badge>
                          ) : hasReport ? (
                            <Badge
                              bg="#dbeafe"
                              color="#1d4ed8"
                              border="#bfdbfe"
                            >
                              📝 Report Done
                            </Badge>
                          ) : (
                            <Badge
                              bg="#f1f5f9"
                              color="#475569"
                              border="#cbd5e1"
                            >
                              ⏳ Pending
                            </Badge>
                          )}
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          <ActionRow style={{ justifyContent: "center" }}>
                            {!hasReport && !row.patientIn_DateTime && (
                              <IconBtn
                                onClick={() => isPaymentValid && handlePatientCheckIn(row)}
                                disabled={!isPaymentValid}
                                data-tip={!isPaymentValid ? "Payment Pending" : "Check-in Patient"}
                              >
                                ✓
                              </IconBtn>
                            )}
                            <IconBtn
                              onClick={() => !hasReport && !isApproved && isPaymentValid && handleNavigateToForm(row)}
                              disabled={hasReport || isApproved || !isPaymentValid}
                              data-tip={
                                !isPaymentValid
                                  ? "Payment Pending"
                                  : hasReport
                                  ? "Report Already Saved"
                                  : isApproved
                                  ? "Already Approved"
                                  : "Go to Report"
                              }
                            >
                              📋
                            </IconBtn>
                            <IconBtn
                              onClick={() => handleOpenPrint(row)}
                              disabled={!hasReport}
                              data-tip="Preview Report"
                            >
                              👁
                            </IconBtn>
                            <IconBtn
                              onClick={() => handleApproveReport(row)}
                              disabled={!hasReport || isApproved}
                              data-tip={
                                isApproved
                                  ? "Already Approved"
                                  : "Approve Report"
                              }
                            >
                              ✅
                            </IconBtn>
                            <IconBtn
                              onClick={() => handleNavigateToForm(row)}
                              disabled={!hasReport || isApproved}
                              data-tip="Edit Report"
                            >
                              ✏️
                            </IconBtn>
                            <PrintDropdownWrapper
                              onMouseEnter={(e) =>
                                isApproved && showPrintDropdown(row, e)
                              }
                              onMouseLeave={hidePrintDropdown}
                            >
                              <IconBtn
                                disabled={!isApproved}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isApproved) {
                                    if (activePrintRowId === row.investBillNo) {
                                      hidePrintDropdown();
                                    } else {
                                      showPrintDropdown(row, e);
                                    }
                                  }
                                }}
                                data-tip={
                                  !isApproved
                                    ? "Approve report first to print"
                                    : "Print Options"
                                }
                              >
                                🖨️
                              </IconBtn>
                            </PrintDropdownWrapper>
                            <IconBtn
                              onClick={() => handleDispatchReport(row)}
                              disabled={!isApproved || !!(row.is_Dispatched || row.dispatch_DateTime)}
                              data-tip={
                                row.is_Dispatched || row.dispatch_DateTime
                                  ? "Already Dispatched"
                                  : isApproved
                                  ? "Dispatch Report"
                                  : "Approve report first to dispatch"
                              }
                            >
                              📤
                            </IconBtn>
                            <IconBtn
                              onClick={() => handleDeleteReport(row)}
                              disabled={!hasReport || isApproved}
                              data-tip="Delete Report"
                            >
                              🗑️
                            </IconBtn>
                          </ActionRow>
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>
          )}
        </ContentCard>
      </Container>

      {/* ── Print Preview Modal ── */}
      {printRow && (
        <ModalOverlay onClick={() => setPrintRow(null)}>
          <PrintModalCard onClick={(e) => e.stopPropagation()}>
            <ModalHeader style={{ background: "#0f766e", color: "white" }}>
              <ModalTitle style={{ color: "white" }}>
                🖨 MHC Report Preview — {printRow.patientName} (
                {printRow.investBillNo})
              </ModalTitle>
              <CloseButton
                style={{ color: "white" }}
                onClick={() => setPrintRow(null)}
              >
                &times;
              </CloseButton>
            </ModalHeader>

            <PrintPreviewScroll>
              <PrintSheet>
                <div>
                  <img
                    src={headerImage}
                    alt="Header"
                    style={{ width: "100%", maxHeight: "110px", objectFit: "contain" }}
                  />
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "1.2rem",
                      fontWeight: 800,
                      color: "#0f766e",
                      margin: "1rem 0 0.5rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    MASTER HEALTH CHECK-UP REPORT
                  </div>

                  {/* Unified Patient Information Card */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr",
                      gap: "0.4rem 0.8rem",
                      background: "#f0fdfa",
                      border: "1.5px solid #99f6e4",
                      borderRadius: "6px 6px 0 0",
                      padding: "0.5rem 0.8rem",
                      fontSize: "0.82rem",
                      margin: "0.5rem 0 0",
                    }}
                  >
                    <div>
                      <span style={{ color: "#0f766e", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", marginRight: "4px" }}>
                        Patient Name:
                      </span>
                      <strong style={{ color: "#0f172a" }}>{printRow.patientName || "N/A"}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#0f766e", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", marginRight: "4px" }}>
                        UHID:
                      </span>
                      <strong style={{ color: "#0f172a" }}>{printRow.uhid || "N/A"}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#0f766e", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", marginRight: "4px" }}>
                        Age / Gender:
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        {printRow.age || ""} {printRow.age_type || "Y"} / {printRow.gender || "N/A"}
                      </strong>
                    </div>
                  </div>

                  {/* Full Registration Demographics Connected Seamlessly */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "0.4rem 0.8rem",
                      background: "#f0fdfa",
                      border: "1.5px solid #99f6e4",
                      borderTop: "1px dashed #99f6e4",
                      borderRadius: "0 0 6px 6px",
                      padding: "0.5rem 0.8rem",
                      fontSize: "0.8rem",
                      marginBottom: "0.4rem",
                    }}
                  >
                    <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", display: "block" }}>Bill No</span><strong style={{ color: "#0f172a" }}>{printRow.investBillNo || "N/A"}</strong></div>
                    <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", display: "block" }}>Bill Date</span><strong style={{ color: "#0f172a" }}>{printRow.investBillDate || "N/A"}</strong></div>
                    <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", display: "block" }}>Package</span><strong style={{ color: "#0f172a" }}>{printRow.packageName || `Package #${printRow.package_id || ""}`}</strong></div>
                    <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", display: "block" }}>Doctor</span><strong style={{ color: "#0f172a" }}>{printRow.doctorName || printRow.doctor || "SELF"}</strong></div>
                    <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", display: "block" }}>Referred By</span><strong style={{ color: "#0f172a" }}>{printRow.referredByName || printRow.referredBy || "SELF"}</strong></div>
                    <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", display: "block" }}>Status</span><strong style={{ color: printRow.is_approved ? "#059669" : "#d97706" }}>{printRow.is_approved ? "Approved" : "Completed"}</strong></div>
                  </div>

                  {/* Page No below patient info */}
                  <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", paddingRight: "4px", marginBottom: "0.85rem" }}>
                    Page 1 of 1
                  </div>

                  {/* Structured Clinical Sections */}
                  {loadingPrint ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                      Loading report details...
                    </div>
                  ) : (
                    (() => {
                      const valuedetails = printDetails?.valuedetails || {};

                      const getModalVal = (secKey, testCode, pmCode = null) => {
                        const sec = valuedetails[secKey];
                        if (!sec) return "";
                        if (Array.isArray(sec)) {
                          const item = sec.find((i) => i.test_code === testCode);
                          if (!item) return "";
                          if (pmCode && Array.isArray(item.parameter)) {
                            const p = item.parameter.find((x) => x.pm_code === pmCode);
                            return p?.value ?? "";
                          }
                          if (Array.isArray(item.value)) return item.value.join(", ");
                          return item.value ?? "";
                        }
                        if (typeof sec === "object") {
                          return sec[testCode] ?? "";
                        }
                        return "";
                      };

                      const getModalResult = (secKey, testCode, pmCode) => {
                        const sec = valuedetails[secKey];
                        if (!sec) return "";
                        if (Array.isArray(sec)) {
                          const item = sec.find((i) => i.test_code === testCode);
                          if (!item) return "";
                          if (pmCode && Array.isArray(item.parameter)) {
                            const p = item.parameter.find((x) => x.pm_code === pmCode);
                            return p?.result ?? "";
                          }
                        }
                        return "";
                      };

                      const vitalsItems = printFormat["vitals_check"] || [];
                      const prevItems = printFormat["previous_medical_history"] || [];
                      const physItems = printFormat["physical_examination"] || [];
                      const vaccineItems = printFormat["vaccination_status"] || [];
                      const investItems = printFormat["investigations"] || [];
                      const reviewItems = printFormat["summary_of_review"] || [];
                      const procedureItems = printFormat["procedure_or_suregery_advised"] || [];
                      const pediatricItems = printFormat["pediatric_master_health_check-up"] || [];
                      const consultItems = printFormat["consultant_opinion"] || [];
                      const dueSec = valuedetails["next_master_health_check-up_due"] || [];
                      const dueItem = Array.isArray(dueSec) ? dueSec.find((i) => i.test_code === "NMHCD01") : null;
                      const dateItem = Array.isArray(dueSec) ? dueSec.find((i) => i.test_code === "NMHCD02") : null;
                      const dueVal = dueItem?.value || (dueSec["NMHCD01"] || "");
                      const dateVal = dateItem?.value || (dueSec["NMHCD02"] || "");

                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                          {/* 1. Vitals Check (Dynamic from response format) */}
                          {vitalsItems.length > 0 && (
                            <div>
                              <div
                                style={{
                                  fontSize: "0.95rem",
                                  fontWeight: 800,
                                  color: "#1e3a8a",
                                  borderBottom: "2px solid #1e3a8a",
                                  paddingBottom: "0.25rem",
                                  marginBottom: "0.5rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                1. Vitals Check
                              </div>
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                  fontSize: "0.82rem",
                                  border: "1px solid #cbd5e1",
                                }}
                              >
                                <tbody>
                                  {(() => {
                                    const rows = [];
                                    for (let i = 0; i < vitalsItems.length; i += 2) {
                                      const item1 = vitalsItems[i];
                                      const item2 = vitalsItems[i + 1] || null;
                                      rows.push(
                                        <tr key={i}>
                                          <td style={{ background: "#e8f0fe", color: "#1e293b", fontWeight: 700, padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "25%" }}>
                                            {item1.test_name}
                                          </td>
                                          <td style={{ background: "#ffffff", color: "#0f172a", padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "25%", fontWeight: 600 }}>
                                            {getModalVal("vitals_check", item1.test_code) || "-"}
                                          </td>
                                          {item2 ? (
                                            <>
                                              <td style={{ background: "#e8f0fe", color: "#1e293b", fontWeight: 700, padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "25%" }}>
                                                {item2.test_name}
                                              </td>
                                              <td style={{ background: "#ffffff", color: "#0f172a", padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "25%", fontWeight: 600 }}>
                                                {getModalVal("vitals_check", item2.test_code) || "-"}
                                              </td>
                                            </>
                                          ) : (
                                            <>
                                              <td style={{ background: "#f8fafc", border: "1px solid #cbd5e1", width: "25%" }} />
                                              <td style={{ background: "#f8fafc", border: "1px solid #cbd5e1", width: "25%" }} />
                                            </>
                                          )}
                                        </tr>
                                      );
                                    }
                                    return rows;
                                  })()}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* 2. Previous Medical History (Dynamic from response format) */}
                          {prevItems.length > 0 && (
                            <div>
                              <div
                                style={{
                                  fontSize: "0.95rem",
                                  fontWeight: 800,
                                  color: "#1e3a8a",
                                  borderBottom: "2px solid #1e3a8a",
                                  paddingBottom: "0.25rem",
                                  marginBottom: "0.5rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                2. Previous Medical History
                              </div>

                              {prevItems.map((item, idx) => {
                                const hasParams = Array.isArray(item.parameter) && item.parameter.length > 0;
                                const hasOptions = Array.isArray(item.value_options) && item.value_options.length > 0;

                                if (hasParams) {
                                  return (
                                    <div key={idx} style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                                      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e3a8a", marginBottom: "0.25rem" }}>
                                        {item.test_name}:
                                      </div>
                                      <table
                                        style={{
                                          width: "100%",
                                          borderCollapse: "collapse",
                                          fontSize: "0.8rem",
                                          border: "1px solid #cbd5e1",
                                        }}
                                      >
                                        <thead>
                                          <tr style={{ background: "#1e3a8a", color: "#ffffff" }}>
                                            {item.parameter.map((p, pIdx) => (
                                              <th key={pIdx} style={{ padding: "0.35rem 0.5rem", textAlign: "center", color: "#ffffff", background: "#1e3a8a", fontWeight: 800, border: "1px solid #1e3a8a" }}>
                                                {p.pm_name}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            {item.parameter.map((p, pIdx) => (
                                              <td key={pIdx} style={{ padding: "0.35rem 0.5rem", textAlign: "center", fontWeight: 700, color: "#0f172a", border: "1px solid #cbd5e1", background: "#ffffff" }}>
                                                {getModalVal("previous_medical_history", item.test_code, p.pm_code) || "-"}
                                              </td>
                                            ))}
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  );
                                }

                                if (hasOptions) {
                                  const rawVal = getModalVal("previous_medical_history", item.test_code);
                                  const selectedOpts = Array.isArray(rawVal) ? rawVal : rawVal ? [rawVal] : [];
                                  if (selectedOpts.length === 0) return null;
                                  return (
                                    <div key={idx} style={{ marginBottom: "0.5rem" }}>
                                      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e3a8a", marginBottom: "0.25rem" }}>
                                        {item.test_name}:
                                      </div>
                                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                        {selectedOpts.map((c, cIdx) => (
                                          <span
                                            key={cIdx}
                                            style={{
                                              background: "#f0fdfa",
                                              border: "1px solid #0d9488",
                                              color: "#0f766e",
                                              padding: "0.15rem 0.6rem",
                                              borderRadius: "12px",
                                              fontSize: "0.78rem",
                                              fontWeight: 700,
                                            }}
                                          >
                                            ✓ {c}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                }

                                const val = getModalVal("previous_medical_history", item.test_code);
                                return (
                                  <table
                                    key={idx}
                                    style={{
                                      width: "100%",
                                      borderCollapse: "collapse",
                                      fontSize: "0.82rem",
                                      border: "1px solid #cbd5e1",
                                      marginBottom: "0.35rem",
                                    }}
                                  >
                                    <tbody>
                                      <tr>
                                        <td style={{ background: "#e8f0fe", color: "#1e293b", fontWeight: 700, padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "35%" }}>
                                          {item.test_name}
                                        </td>
                                        <td style={{ background: "#ffffff", color: "#0f172a", padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "65%" }}>
                                          {val || "-"}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                );
                              })}
                            </div>
                          )}

                          {/* 3. Physical Examination (Matching Image 3 & MHCReportForm.js) */}
                          {physItems.length > 0 && (
                            <div>
                              <div
                                style={{
                                  fontSize: "0.95rem",
                                  fontWeight: 800,
                                  color: "#1e3a8a",
                                  borderBottom: "2px solid #1e3a8a",
                                  paddingBottom: "0.25rem",
                                  marginBottom: "0.5rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                3. Physical Examination
                              </div>
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                  fontSize: "0.82rem",
                                  border: "1px solid #cbd5e1",
                                }}
                              >
                                <thead>
                                  <tr style={{ background: "#1e3a8a", color: "#ffffff" }}>
                                    <th style={{ padding: "0.4rem 0.6rem", textAlign: "left", width: "30%", border: "1px solid #1e3a8a", background: "#1e3a8a", color: "#ffffff", fontWeight: 800 }}>
                                      System / Category
                                    </th>
                                    <th style={{ padding: "0.4rem 0.6rem", textAlign: "left", width: "70%", border: "1px solid #1e3a8a", background: "#1e3a8a", color: "#ffffff", fontWeight: 800 }}>
                                      Clinical Findings / Assessment
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {physItems.map((item, idx) => (
                                    <tr key={idx}>
                                      <td style={{ background: "#e8f0fe", color: "#1e293b", fontWeight: 700, padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "30%" }}>
                                        {item.test_name}
                                      </td>
                                      <td style={{ background: "#ffffff", color: "#0f172a", padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "70%" }}>
                                        {getModalVal("physical_examination", item.test_code) || "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* 4. Vaccination Status (Matching MHCReportForm.js) */}
                          {vaccineItems.length > 0 && (
                            <div>
                              <div
                                style={{
                                  fontSize: "0.95rem",
                                  fontWeight: 800,
                                  color: "#1e3a8a",
                                  borderBottom: "2px solid #1e3a8a",
                                  paddingBottom: "0.25rem",
                                  marginBottom: "0.5rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                4. Vaccination History
                              </div>
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                  fontSize: "0.82rem",
                                  border: "1px solid #cbd5e1",
                                }}
                              >
                                <thead>
                                  <tr style={{ background: "#1e3a8a", color: "#ffffff" }}>
                                    <th style={{ padding: "0.4rem 0.6rem", textAlign: "left", width: "40%", border: "1px solid #1e3a8a", background: "#1e3a8a", color: "#ffffff", fontWeight: 800 }}>
                                      Vaccine
                                    </th>
                                    <th style={{ padding: "0.4rem 0.6rem", textAlign: "left", width: "60%", border: "1px solid #1e3a8a", background: "#1e3a8a", color: "#ffffff", fontWeight: 800 }}>
                                      Doses & Date / Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {vaccineItems.map((vGroup, gIdx) =>
                                    (vGroup.parameter || []).map((vac, vIdx) => (
                                      <tr key={`${gIdx}-${vIdx}`}>
                                        <td style={{ background: "#e8f0fe", color: "#1e293b", fontWeight: 700, padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "40%" }}>
                                          {vac.pm_name}
                                        </td>
                                        <td style={{ background: "#ffffff", color: "#0f172a", padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "60%" }}>
                                          {getModalVal("vaccination_status", vGroup.test_code, vac.pm_code) || "-"}
                                        </td>
                                      </tr>
                                    )),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* 5. Investigations (Matching Image 4 & MHCReportForm.js) */}
                          {investItems.length > 0 && (
                            <div>
                              <div
                                style={{
                                  fontSize: "0.95rem",
                                  fontWeight: 800,
                                  color: "#1e3a8a",
                                  borderBottom: "2px solid #1e3a8a",
                                  paddingBottom: "0.25rem",
                                  marginBottom: "0.25rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                5. Investigations
                              </div>
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  color: "#475569",
                                  fontStyle: "italic",
                                  marginBottom: "0.6rem",
                                  lineHeight: 1.4,
                                }}
                              >
                                Laboratory panel to be attached separately as lab report. Special investigations below to be recorded here.
                              </div>

                              {investItems.map((inv, iIdx) => {
                                const hasParams = Array.isArray(inv.parameter) && inv.parameter.length > 0;

                                return (
                                  <div key={iIdx} style={{ marginBottom: "0.85rem" }}>
                                    <div
                                      style={{
                                        fontSize: "0.85rem",
                                        fontWeight: 700,
                                        color: "#1e3a8a",
                                        background: "#eff6ff",
                                        padding: "0.25rem 0.6rem",
                                        borderLeft: "3px solid #3b82f6",
                                        marginBottom: "0.3rem",
                                      }}
                                    >
                                      5.{iIdx + 1} {inv.test_name}
                                    </div>

                                    {hasParams ? (
                                      <table
                                        style={{
                                          width: "100%",
                                          borderCollapse: "collapse",
                                          fontSize: "0.8rem",
                                          border: "1px solid #cbd5e1",
                                        }}
                                      >
                                        <thead>
                                          <tr style={{ background: "#1e3a8a", color: "#ffffff" }}>
                                            <th style={{ padding: "0.35rem 0.6rem", textAlign: "left", width: "40%", border: "1px solid #1e3a8a", background: "#1e3a8a", color: "#ffffff", fontWeight: 800 }}>
                                              Parameter
                                            </th>
                                            <th style={{ padding: "0.35rem 0.6rem", textAlign: "left", width: "35%", border: "1px solid #1e3a8a", background: "#1e3a8a", color: "#ffffff", fontWeight: 800 }}>
                                              Finding / Value
                                            </th>
                                            <th style={{ padding: "0.35rem 0.6rem", textAlign: "left", width: "25%", border: "1px solid #1e3a8a", background: "#1e3a8a", color: "#ffffff", fontWeight: 800 }}>
                                              Normal / Abnormal
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {inv.parameter.map((p, pIdx) => {
                                            const pVal = getModalVal("investigations", inv.test_code, p.pm_code);
                                            const pRes = getModalResult("investigations", inv.test_code, p.pm_code);
                                            const isAbnormal = pRes === "Abnormal";

                                            return (
                                              <tr key={pIdx}>
                                                <td style={{ background: "#e8f0fe", color: "#1e293b", fontWeight: 700, padding: "0.35rem 0.6rem", border: "1px solid #cbd5e1", width: "40%" }}>
                                                  {p.pm_name}
                                                </td>
                                                <td style={{ background: "#ffffff", color: "#0f172a", padding: "0.35rem 0.6rem", border: "1px solid #cbd5e1", width: "35%" }}>
                                                  {pVal || "-"}
                                                </td>
                                                <td style={{ background: "#ffffff", padding: "0.35rem 0.6rem", border: "1px solid #cbd5e1", width: "25%", fontWeight: 700, color: isAbnormal ? "#dc2626" : "#0d9488" }}>
                                                  {pRes || "-"}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    ) : (
                                      <div style={{ fontSize: "0.82rem", padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", borderRadius: "4px", background: "#f8fafc" }}>
                                        <strong style={{ color: "#1e3a8a" }}>Value:</strong> {getModalVal("investigations", inv.test_code) || "-"}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* 6. Summary of Review & Recommendations (Matching MHCReportForm.js) */}
                          <div>
                            <div
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: 800,
                                color: "#1e3a8a",
                                borderBottom: "2px solid #1e3a8a",
                                paddingBottom: "0.25rem",
                                marginBottom: "0.5rem",
                                textTransform: "uppercase",
                              }}
                            >
                              6. Summary of Review & Recommendations
                            </div>

                            {/* Summary of Review Table */}
                            {reviewItems.length > 0 && (
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                  fontSize: "0.82rem",
                                  border: "1px solid #cbd5e1",
                                  marginBottom: "0.6rem",
                                }}
                              >
                                <tbody>
                                  {reviewItems.map((item, idx) => (
                                    <tr key={idx}>
                                      <td style={{ background: "#e8f0fe", color: "#1e293b", fontWeight: 700, padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "30%" }}>
                                        {item.test_name}
                                      </td>
                                      <td style={{ background: "#ffffff", color: "#0f172a", padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "70%" }}>
                                        {getModalVal("summary_of_review", item.test_code) || "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}

                            {/* Procedure / Surgery Advised Table */}
                            {procedureItems.length > 0 && (
                              <div style={{ marginTop: "0.6rem" }}>
                                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e3a8a", marginBottom: "0.3rem" }}>
                                  Procedure / Surgery Advised
                                </div>
                                <table
                                  style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "0.82rem",
                                    border: "1px solid #cbd5e1",
                                    marginBottom: "0.6rem",
                                  }}
                                >
                                  <tbody>
                                    {procedureItems.map((item, idx) => (
                                      <tr key={idx}>
                                        <td style={{ background: "#e8f0fe", color: "#1e293b", fontWeight: 700, padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "35%" }}>
                                          {item.test_name}
                                        </td>
                                        <td style={{ background: "#ffffff", color: "#0f172a", padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "65%" }}>
                                          {getModalVal("procedure_or_suregery_advised", item.test_code) || "-"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Pediatric Master Health Check-up Table */}
                            {pediatricItems.length > 0 && (
                              <div style={{ marginTop: "0.6rem" }}>
                                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e3a8a", marginBottom: "0.3rem" }}>
                                  Pediatric Master Health Check-up
                                </div>
                                <table
                                  style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "0.82rem",
                                    border: "1px solid #cbd5e1",
                                    marginBottom: "0.6rem",
                                  }}
                                >
                                  <tbody>
                                    {pediatricItems.map((item, idx) => (
                                      <tr key={idx}>
                                        <td style={{ background: "#e8f0fe", color: "#1e293b", fontWeight: 700, padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "35%" }}>
                                          {item.test_name}
                                        </td>
                                        <td style={{ background: "#ffffff", color: "#0f172a", padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "65%" }}>
                                          {getModalVal("pediatric_master_health_check-up", item.test_code) || "-"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Next MHC Due Banner */}
                            {(dueVal || dateVal) && (
                              <div
                                style={{
                                  background: "#f0fdfa",
                                  border: "1.5px solid #0d9488",
                                  borderRadius: "8px",
                                  padding: "0.6rem 1rem",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  fontSize: "0.85rem",
                                  margin: "0.6rem 0",
                                }}
                              >
                                <div>
                                  <strong style={{ color: "#0f766e" }}>Next Master Health Check-up Due:</strong>{" "}
                                  <span>{dueVal || "Routine"}</span>
                                </div>
                                {dateVal && (
                                  <div>
                                    <strong style={{ color: "#0f766e" }}>📅 Review Date:</strong>{" "}
                                    <span style={{ fontWeight: 700 }}>{dateVal}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Consultant Opinion Table */}
                            {consultItems.length > 0 && (
                              <div style={{ marginTop: "0.6rem" }}>
                                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e3a8a", marginBottom: "0.3rem" }}>
                                  Consultant Opinion
                                </div>
                                <table
                                  style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "0.82rem",
                                    border: "1px solid #cbd5e1",
                                    marginBottom: "0.6rem",
                                  }}
                                >
                                  <tbody>
                                    {consultItems.map((item, idx) => (
                                      <tr key={idx}>
                                        <td style={{ background: "#e8f0fe", color: "#1e293b", fontWeight: 700, padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "30%" }}>
                                          {item.test_name}
                                        </td>
                                        <td style={{ background: "#ffffff", color: "#0f172a", padding: "0.4rem 0.6rem", border: "1px solid #cbd5e1", width: "70%" }}>
                                          {getModalVal("consultant_opinion", item.test_code) || "-"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>

                          {/* 7. Overall Impression & Advice */}
                          {(printDetails?.impression || printRow.impression) && (
                            <div
                              style={{
                                padding: "0.8rem 1rem",
                                background: "#f8fafc",
                                border: "1.5px solid #cbd5e1",
                                borderRadius: "8px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.92rem",
                                  fontWeight: 800,
                                  color: "#1e3a8a",
                                  marginBottom: "0.4rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                7. Overall Impression, Clinical Assessment & Advice
                              </div>
                              <div
                                style={{ fontSize: "0.85rem", lineHeight: "1.6", color: "#1e293b" }}
                                dangerouslySetInnerHTML={{
                                  __html:
                                    printDetails?.impression ||
                                    printRow.impression ||
                                    "",
                                }}
                              />
                            </div>
                          )}

                          {/* Doctor Signature Block */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-end",
                              marginTop: "1.5rem",
                              paddingTop: "1rem",
                              borderTop: "1px dashed #cbd5e1",
                            }}
                          >
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              Report Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                            </div>
                            <div style={{ textAlign: "center", minWidth: "200px" }}>
                              {printSignature?.signatureBase64 ? (
                                <img
                                  src={`data:image/png;base64,${printSignature.signatureBase64}`}
                                  alt="Doctor Signature"
                                  style={{
                                    maxHeight: "48px",
                                    maxWidth: "160px",
                                    objectFit: "contain",
                                    marginBottom: "4px",
                                  }}
                                />
                              ) : (
                                <div style={{ height: "40px" }} />
                              )}
                              <div style={{ borderTop: "1.5px solid #0f172a", width: "100%", paddingTop: "0.2rem" }}>
                                <strong style={{ fontSize: "0.85rem", color: "#0f172a", display: "block" }}>
                                  {printSignature?.employeeName || printRow.doctorName || printRow.doctor || "Consultant Physician"}
                                </strong>
                                <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: "1px" }}>
                                  {printSignature?.designation || "Consultant Physician / MHC"}
                                </div>
                                {printSignature?.registrationNumber && (
                                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "1px" }}>
                                    Reg. No: {printSignature.registrationNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>

                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  <img
                    src={FooterImage}
                    alt="Footer"
                    style={{ width: "100%", maxHeight: "80px", objectFit: "fill" }}
                  />
                </div>
              </PrintSheet>
            </PrintPreviewScroll>
          </PrintModalCard>
        </ModalOverlay>
      )}

      {/* ── Print Options Dropdown Portal ── */}
      {activePrintRowId &&
        activePrintRow &&
        createPortal(
          <PortalDropdownMenu
            style={{ top: printDropdownPos.top, left: printDropdownPos.left }}
            onMouseEnter={() => setActivePrintRowId(activePrintRowId)}
            onMouseLeave={hidePrintDropdown}
          >
            <DropdownItem
              onClick={() => {
                handlePrintMHCReport(activePrintRow, true);
                hidePrintDropdown();
              }}
            >
              🖨️ Print with Letterpad
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                handlePrintMHCReport(activePrintRow, false);
                hidePrintDropdown();
              }}
            >
              📄 Print without Letterpad
            </DropdownItem>
          </PortalDropdownMenu>,
          document.body,
        )}
    </PageWrapper>
  );
};

export default MHCList;
