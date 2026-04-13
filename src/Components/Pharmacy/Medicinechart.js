import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import apiRequest from "../../Auth/apiRequest";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Global Font ──────────────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
`;

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideDown = keyframes`
  from { opacity: 0; max-height: 0; }
  to   { opacity: 1; max-height: 2000px; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const Wrapper = styled.div`
  padding: 24px;
  font-family: 'DM Sans', sans-serif;
  background: #f0f4f8;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f766e;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  &::before {
    content: '💊';
    font-size: 1.2rem;
  }
`;

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.18s;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const SpinIcon = styled.span`
  display: inline-block;
  animation: ${spin} 0.8s linear infinite;
`;

const TableCard = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 16px rgba(15, 118, 110, 0.08);
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.845rem;
`;

const Thead = styled.thead`
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%);
  color: #fff;
  th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    font-size: 0.8rem;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }
`;

const PatientRow = styled.tr`
  cursor: pointer;
  background: ${({ $active }) => ($active ? "#e6faf8" : "#fff")};
  border-bottom: 1px solid #e8f0ef;
  transition: background 0.15s;
  &:hover {
    background: #f0faf8;
  }
  td {
    padding: 11px 16px;
    color: #374151;
    font-size: 0.85rem;
    white-space: nowrap;
  }
`;

const UHIDCell = styled.td`
  font-family: 'DM Mono', monospace;
  font-size: 0.8rem !important;
  color: #0f766e !important;
  font-weight: 500;
`;

const PrintIcon = styled.td`
  color: #64748b;
  font-size: 1rem;
  text-align: center;
  width: 40px;
`;

const MedicinesBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: ${({ $active }) => ($active ? "#0f766e" : "linear-gradient(135deg,#e0f2f0,#ccfbf1)")};
  color: ${({ $active }) => ($active ? "#fff" : "#0f766e")};
  border: 1.5px solid #99f6e4;
  border-radius: 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
  &:hover {
    background: #0f766e;
    color: #fff;
  }
`;

// ─── Expandable medicine detail panel ────────────────────────────────────────
const DetailPanel = styled.tr`
  background: #f8fffe;
`;

const DetailCell = styled.td`
  padding: 0 !important;
  border-bottom: 3px solid #14b8a6;
`;

const DetailInner = styled.div`
  animation: ${slideDown} 0.3s ease;
  overflow: hidden;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 8px;
  background: linear-gradient(90deg, #e6faf8, #f0faf8);
  border-bottom: 1px solid #ccfbf1;
`;

const DetailTitle = styled.span`
  font-weight: 700;
  color: #0f766e;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PatientMeta = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const MetaBadge = styled.span`
  background: #ccfbf1;
  color: #0f766e;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ItemTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.825rem;
  overflow: visible;
`;

const ItemThead = styled.thead`
  background: #f1faf9;
  th {
    padding: 9px 14px;
    text-align: left;
    font-weight: 600;
    color: #374151;
    font-size: 0.78rem;
    letter-spacing: 0.02em;
    border-bottom: 1.5px solid #d1fae5;
    white-space: nowrap;
  }
`;

const ItemRow = styled.tr`
  border-bottom: 1px solid #f0faf8;
  transition: background 0.12s;
  &:hover { background: #f0faf8; }
  td {
    padding: 9px 14px;
    color: #374151;
    vertical-align: middle;
  }
`;

const StatusDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  background: ${({ $type }) =>
    $type === "substitute"  ? "#3b82f6" :
    $type === "emergency"   ? "#ef4444" :
    $type === "insurance"   ? "#22c55e" :
    "#f97316"};
  margin-right: 4px;
`;

const ActionBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid #d1d5db;
  background: #f8fafc;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1;
  transition: all 0.15s;
  user-select: none;
  &:hover {
    border-color: #0f766e;
    background: #f0fdf4;
    color: #0f766e;
    box-shadow: 0 2px 6px rgba(15,118,110,0.12);
  }
  &:active {
    transform: scale(0.95);
  }
`;

const ActionMenuWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownMenu = styled.div`
  position: fixed;
  z-index: 99999;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(15, 118, 110, 0.22), 0 2px 8px rgba(0,0,0,0.12);
  min-width: 190px;
  padding: 5px 0;
  animation: ${fadeIn} 0.15s ease;
  border: 1px solid #d1fae5;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 1px solid #f0faf8;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.84rem;
  font-weight: 600;
  color: #1e293b;
  text-align: left;
  white-space: nowrap;
  transition: background 0.12s, color 0.12s;
  &:last-child { border-bottom: none; }
  &:hover {
    background: #f0fdf4;
    color: #0f766e;
  }
`;

const QtyBadge = styled.span`
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 6px;
  padding: 2px 8px;
  font-weight: 600;
  font-family: 'DM Mono', monospace;
  font-size: 0.8rem;
`;

const StockBadge = styled.span`
  background: ${({ $low }) => ($low ? "#fee2e2" : "#dcfce7")};
  color: ${({ $low }) => ($low ? "#dc2626" : "#16a34a")};
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.78rem;
  font-weight: 500;
  font-family: 'DM Mono', monospace;
`;

const PendingBadge = styled.span`
  background: #fef9c3;
  color: #b45309;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.78rem;
  font-weight: 600;
`;

const BillingStatusBadge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  white-space: nowrap;
  background: ${({ $status }) =>
    $status === "Pending"   ? "#fef3c7" :
    $status === "Approved"  ? "#dcfce7" :
    $status === "Cancelled" ? "#fee2e2" :
    $status === "Billed"    ? "#dbeafe" :
    "#f1f5f9"};
  color: ${({ $status }) =>
    $status === "Pending"   ? "#b45309" :
    $status === "Approved"  ? "#16a34a" :
    $status === "Cancelled" ? "#dc2626" :
    $status === "Billed"    ? "#1d4ed8" :
    "#64748b"};
  border: 1px solid ${({ $status }) =>
    $status === "Pending"   ? "#fcd34d" :
    $status === "Approved"  ? "#86efac" :
    $status === "Cancelled" ? "#fca5a5" :
    $status === "Billed"    ? "#93c5fd" :
    "#e2e8f0"};
`;

const Legend = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding: 12px 20px;
  margin-top: 12px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(15, 118, 110, 0.07);
  border: 1px solid #e8f0ef;
  font-size: 0.8rem;
  color: #64748b;
`;

const LegendItem = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  color: #94a3b8;
  font-size: 0.95rem;
`;

const ErrorMsg = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.875rem;
`;

// ─── Date Filter Bar ──────────────────────────────────────────────────────────
const DateFilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const DateLabel = styled.label`
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DateInput = styled.input`
  padding: 7px 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.83rem;
  color: #374151;
  background: #fff;
  cursor: pointer;
  outline: none;
  &:focus { border-color: #14b8a6; }
`;

// ─── Print Modal ──────────────────────────────────────────────────────────────
const PrintOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PrintModalBox = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.22);
  width: 680px;
  max-width: 96vw;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${fadeIn} 0.2s ease;
`;

const PrintModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
`;

const PrintModalTitle = styled.span`
  font-weight: 700;
  font-size: 1rem;
  color: #0f766e;
`;

const PrintCloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  color: #64748b;
  line-height: 1;
  &:hover { color: #dc2626; }
`;

const PrintContent = styled.div`
  padding: 24px 28px;
  font-family: Arial, sans-serif;
  font-size: 0.85rem;
  color: #1e293b;
`;

const PrintHospitalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
`;

const PrintHospitalLogo = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.4rem;
  flex-shrink: 0;
`;

const PrintHospitalInfo = styled.div`
  flex: 1;
`;

const PrintHospitalName = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f766e;
  letter-spacing: 0.02em;
`;

const PrintHospitalSub = styled.div`
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 2px;
`;

const PrintSectionTitle = styled.div`
  background: #e5e7eb;
  text-align: right;
  padding: 4px 10px;
  font-weight: 700;
  font-size: 0.82rem;
  color: #374151;
  margin-bottom: 10px;
`;

const PrintMetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 24px;
  margin-bottom: 12px;
  font-size: 0.82rem;
`;

const PrintMetaRow = styled.div`
  display: flex;
  gap: 6px;
`;

const PrintMetaKey = styled.span`
  color: #64748b;
  white-space: nowrap;
  min-width: 80px;
`;

const PrintMetaVal = styled.span`
  font-weight: 600;
  color: #1e293b;
`;

const PrintDateRow = styled.div`
  font-weight: 700;
  font-size: 0.82rem;
  margin-bottom: 2px;
  color: #1e293b;
`;

const PrintDoctorRow = styled.div`
  font-weight: 700;
  font-size: 0.84rem;
  color: #0f766e;
  margin-bottom: 12px;
`;

const PrintItemTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  margin-bottom: 12px;
`;

const PrintItemTh = styled.th`
  border: 1px solid #d1d5db;
  padding: 6px 10px;
  background: #f9fafb;
  text-align: left;
  font-weight: 700;
  font-size: 0.78rem;
`;

const PrintItemTd = styled.td`
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
`;

const PrintFooterBtns = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid #e5e7eb;
`;

const PrintBtn = styled.button`
  padding: 8px 20px;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { opacity: 0.88; }
`;

const CancelBtn = styled.button`
  padding: 8px 20px;
  background: #f1f5f9;
  color: #374151;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #e2e8f0; }
`;

const PrintIconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px 8px;
  border-radius: 6px;
  color: #0f766e;
  transition: background 0.12s;
  &:hover { background: #e6faf8; }
`;

// ─── Portal Dropdown — renders into document.body to escape overflow:hidden ────
const PortalDropdown = ({ menuKey, openActionMenu, pos, children }) => {
  if (openActionMenu !== menuKey || !pos) return null;
  return createPortal(
    <DropdownMenu style={{ top: pos.top, left: pos.left }}>
      {children}
    </DropdownMenu>,
    document.body
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MedicineChart = ({ onConvertToBill }) => {
  const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD for input[type=date]

  const [medicineData, setMedicineData] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [expandedKey, setExpandedKey]   = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null); // { key, top, left }
  const [fromDate, setFromDate]         = useState(todayStr);
  const [toDate, setToDate]             = useState(todayStr);
  const [printPatient, setPrintPatient] = useState(null); // patient to print

  // ─── Helper: fetch patient_details for a single UHID ─────────────────────
  const fetchPatientDetails = async (uhid) => {
    try {
      const res = await apiRequest(
        `${Hmsbaseurl}patient_details/?uhid=${encodeURIComponent(uhid)}`,
        "GET"
      );
      // API returns { success, data: [...] }
      const resBody = res.data ?? res;
      const list = res.success
        ? Array.isArray(resBody?.data)
          ? resBody.data
          : Array.isArray(resBody)
            ? resBody
            : []
        : [];
      return list.length > 0 ? list[0] : null;
    } catch {
      return null;
    }
  };

  // ─── Helper: fetch admissionstatus for a single UHID ──────────────────────
  const fetchAdmissionDetails = async (uhid) => {
    try {
      const res = await apiRequest(
        `${Hmsbaseurl}admissionstatus/?uhid=${encodeURIComponent(uhid)}`,
        "GET"
      );
      if (!res.success) return null;
      const admitted = res.data?.admitted ?? res.admitted ?? false;
      if (!admitted) return { admitted: false };

      const admData = res.data?.data ?? res.data ?? {};

      // ── Resolve active room ────────────────────────────────────────────
      // Primary: room_details (fields: roomNo, bedNo)
      // Fallback: roomShitingDetails (fields: newRoomNo, newBedNo)
      const roomDetails     = admData?.room_details;
      const shiftingDetails = admData?.roomShitingDetails;
      const activeFromRoom  = Array.isArray(roomDetails)
        ? roomDetails.find(r => r.is_roomActive === true) : null;
      const activeFromShift = Array.isArray(shiftingDetails)
        ? shiftingDetails.find(r => r.is_roomActive === true) : null;

      let roomLabel = "";
      if (activeFromRoom) {
        roomLabel = `${activeFromRoom.roomNo} / Bed ${activeFromRoom.bedNo}`;
      } else if (activeFromShift) {
        roomLabel = `${activeFromShift.newRoomNo} / Bed ${activeFromShift.newBedNo}`;
      }

      return {
        admitted:         true,
        ipNumber:         admData?.ipNumber         || "",
        admissionDateTime: admData?.admissionDateTime || "",
        admittingDoctor:  admData?.admittingDoctor   || "",
        consultingDoctor: admData?.consultingDoctor  || "",
        roomLabel,
      };
    } catch {
      return null;
    }
  };

  // ─── Calculate age string from dob ────────────────────────────────────────
  const calcAge = (dob) => {
    if (!dob) return "";
    const d = new Date(dob);
    const today = new Date();
    let years  = today.getFullYear() - d.getFullYear();
    let months = today.getMonth()    - d.getMonth();
    let days   = today.getDate()     - d.getDate();
    if (days   < 0) { months -= 1; days  += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (months < 0) { years  -= 1; months += 12; }
    return `${years}Y ${months}M ${days}D`;
  };

  // 🔹 Fetch patients + their medicine items, then enrich with patient & admission data
  const fetchMedicineChart = async () => {
    try {
      setLoading(true);
      setError(null);

          const response = await apiRequest(
      `${Hmsbaseurl}pharmacy_medicinechart/`,
      "POST",
      {}
    );

      if (!response.success) {
        setError(response.error || "Failed to load data.");
        return;
      }

      const rawList = response.data?.data || [];

      // ── Enrich each patient in parallel ──────────────────────────────────
      const enriched = await Promise.all(
        rawList.map(async (patient) => {
          const uhid = patient.uhid;
          if (!uhid) return patient;

          // Run both API calls concurrently
          const [pd, adm] = await Promise.all([
            fetchPatientDetails(uhid),
            fetchAdmissionDetails(uhid),
          ]);

          // ── Merge patient_details fields ────────────────────────────────
          const pdMerge = pd
            ? {
                // patient_details sub-object (used in UI)
                patient_details: {
                  patient_name: `${pd.salutation || ""} ${pd.firstName || ""} ${pd.lastName || ""}`.trim(),
                  address:      pd.permanent_address || pd.area || "",
                  mobile:       pd.mobilePhone || pd.mobile || "",
                },
                // top-level fields used by convertWardRequest in OPPharmacy
                patient_name:      `${pd.salutation || ""} ${pd.firstName || ""} ${pd.lastName || ""}`.trim(),
                address:           pd.permanent_address || "",
                place:             pd.area              || "",
                mobile:            pd.mobilePhone       || pd.mobile || "",
                customer_type:     pd.customer_type     || "",
                age:               pd.dob ? calcAge(pd.dob) : pd.age ? String(pd.age) : "",
                // doctor from latest billing entry
                doctor_id: (() => {
                  if (!Array.isArray(pd.billing) || pd.billing.length === 0)
                    return patient.doctor_id || "";
                  const withDoc = pd.billing.filter(b => b.doctor_id);
                  if (!withDoc.length) return patient.doctor_id || "";
                  const sorted = [...withDoc].sort(
                    (a, b) => new Date(b.billed_date) - new Date(a.billed_date)
                  );
                  return sorted[0].doctor_id;
                })(),
              }
            : {};

          // ── Merge admissionstatus fields ────────────────────────────────
          const admMerge = adm
            ? {
                admission_status:   adm.admitted ? "ADMITTED" : "NOT ADMITTED",
                inpatient_number:   adm.ipNumber            || patient.inpatient_number || "",
                admission_datetime: adm.admissionDateTime   || "",
                room_no:            adm.roomLabel           || patient.room_no || patient.ward_name || "",
                ward_name:          adm.roomLabel           || patient.ward_name || patient.room_no || "",
              }
            : {};

          return { ...patient, ...pdMerge, ...admMerge };
        })
      );

      setMedicineData(enriched);
    } catch (err) {
      console.error("Error fetching medicine chart:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicineChart(); }, []);

  // ── Frontend date filter based on ward_request_date ───────────────────────
  const filteredData = medicineData.filter((patient) => {
    const raw = patient.ward_request_date || patient.created_date;
    if (!raw) return true; // no date → always show
    const wardDate = new Date(raw).toLocaleDateString("en-CA"); // YYYY-MM-DD
    if (fromDate && wardDate < fromDate) return false;
    if (toDate   && wardDate > toDate)   return false;
    return true;
  });

  // Close action dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenActionMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Toggle expanded row
  const handleToggleMedicines = (key) => {
    setExpandedKey(prev => (prev === key ? null : key));
    setOpenActionMenu(null);
  };

  // ✅ FIX: Safe Convert to Bill handler
  // Validates medicine_items before passing to parent,
  // so parent never receives a patient with undefined/empty items.
  const handleConvertToBillSafe = useCallback((patient) => {
    if (typeof onConvertToBill !== "function") return;

    // Safely resolve medicine_items — never undefined
    const items = Array.isArray(patient?.medicine_items) ? patient.medicine_items : [];

    if (items.length === 0) {
      alert(
        `No medicine items found for patient ${
          patient?.patient_details?.patient_name || patient?.uhid || ""
        }. Cannot convert to bill.`
      );
      return;
    }

    // Pass full patient record — OPPharmacy's convertWardRequest handles the mapping
    onConvertToBill({ ...patient, medicine_items: items });
  }, [onConvertToBill]);

  return (
    <>
      <GlobalStyle />
      <Wrapper>
        <Header>
          <Title>Pharmacy Medicine Chart</Title>
          <DateFilterBar>
            <DateLabel>
              From
              <DateInput
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
            </DateLabel>
            <DateLabel>
              To
              <DateInput
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </DateLabel>
            <RefreshBtn onClick={fetchMedicineChart} disabled={loading} style={{ alignSelf: "flex-end" }}>
              {loading ? <SpinIcon>⟳</SpinIcon> : "⟳"} Refresh
            </RefreshBtn>
          </DateFilterBar>
        </Header>

        {error && <ErrorMsg>⚠ {error}</ErrorMsg>}

        <TableCard>
          <StyledTable>
            <Thead>
              <tr>
                <th>Print</th>
                <th>UHID</th>
                <th>Patient Name</th>
                <th>Address</th>
                <th>Ward / Room</th>
                <th>IP Number</th>
                <th>Mobile</th>
                <th>Status</th>
                <th></th>
              </tr>
            </Thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9">
                    <EmptyState>Loading...</EmptyState>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <EmptyState>No Data Available</EmptyState>
                  </td>
                </tr>
              ) : (
                filteredData.map((patient, idx) => {
                  const patientKey = `${patient.uhid || "row"}-${idx}`;
                  const isExpanded = expandedKey === patientKey;

                  // ✅ FIX: Always default to [] — never undefined
                  const items = Array.isArray(patient?.medicine_items)
                    ? patient.medicine_items
                    : [];

                  return (
                    <React.Fragment key={`${patient.uhid || "row"}-${idx}`}>
                      {/* ── Patient Row ── */}
                      <PatientRow
                        $active={isExpanded}
                        onClick={() => handleToggleMedicines(patientKey)}
                      >
                        <PrintIcon>
                          <PrintIconBtn
                            title="Print"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrintPatient(patient);
                            }}
                          >
                            🖨
                          </PrintIconBtn>
                        </PrintIcon>
                        <UHIDCell>{patient.uhid}</UHIDCell>
                        <td style={{ fontWeight: isExpanded ? 700 : 500 }}>
                          {patient.patient_details?.patient_name || patient.patient_name || `Patient (${patient.uhid})`}
                        </td>
                        <td>{patient.patient_details?.address || patient.address || "-"}</td>
                        <td>{patient.ward_name || patient.room_no || "-"}</td>
                        <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem" }}>
                          {patient.inpatient_number || patient.ip_number || "-"}
                        </td>
                        <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem" }}>
                          {patient.patient_details?.mobile || patient.ip_serial_no || patient.estimate_no || "-"}
                        </td>
                        <td>
                          {patient.billing_status ? (
                            <BillingStatusBadge $status={patient.billing_status}>
                              {patient.billing_status}
                            </BillingStatusBadge>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>-</span>
                          )}
                        </td>
                        <td>
                          <MedicinesBtn
                            $active={isExpanded}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleMedicines(patientKey);
                            }}
                          >
                            💊 Medicines {isExpanded ? "▲" : "▼"}
                          </MedicinesBtn>
                        </td>
                      </PatientRow>

                      {/* ── Expandable Medicine Detail Panel ── */}
                      {isExpanded && (
                        <DetailPanel onClick={(e) => e.stopPropagation()}>
                          <DetailCell colSpan="9">
                            <DetailInner>


                              {/* Medicine items table */}
                              <ItemTable>
                                <ItemThead>
                                  <tr>
                                   
                                    <th>Action</th>
                                    <th>Item Name</th>
                                    <th>Qty</th>
                                    <th>Available Stock</th>
                                    <th>Dosage</th>
                                    <th>Ward Request Date</th>
                                    <th>Time</th>
                                  </tr>
                                </ItemThead>
                                <tbody>
                                  {items.length > 0 ? (
                                    items.map((item, i) => {
                                      // ✅ FIX: Guard against null/undefined item in array
                                      if (!item) return null;

                                      const wardReqRaw = patient.ward_request_date || patient.created_date;
                                      let wardDateStr = "-";
                                      let wardTimeStr = "-";
                                      if (wardReqRaw) {
                                        const d = new Date(wardReqRaw);
                                        wardDateStr = d.toLocaleDateString("en-GB"); // DD/MM/YYYY
                                        wardTimeStr = d.toLocaleTimeString("en-IN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          second: "2-digit",
                                          hour12: true,
                                        });
                                      }

                                      const stockLow = item.available_stock !== undefined && item.available_stock < 10;

                                      const dotType =
                                        item.is_substitute || item.substituted
                                          ? "substitute"
                                          : item.is_emergency
                                          ? "emergency"
                                          : item.is_insurance
                                          ? "insurance"
                                          : "regular";

                                      const menuKey = `${patientKey}-${i}`;

                                      return (
                                        <ItemRow key={`${item.item_id ?? i}-${i}`}>
                                         
                                          <td>
                                            <ActionMenuWrapper>
                                              <ActionBtn
                                                title="Actions"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (openActionMenu?.key === menuKey) {
                                                    setOpenActionMenu(null);
                                                  } else {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setOpenActionMenu({
                                                      key: menuKey,
                                                      top: rect.bottom + window.scrollY + 4,
                                                      left: rect.left + window.scrollX,
                                                    });
                                                  }
                                                }}
                                              >
                                                ⋮
                                              </ActionBtn>
                                              <PortalDropdown
                                                menuKey={menuKey}
                                                openActionMenu={openActionMenu?.key}
                                                pos={openActionMenu?.key === menuKey ? { top: openActionMenu.top, left: openActionMenu.left } : null}
                                              >
                                                <DropdownItem
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenActionMenu(null);
                                                  }}
                                                >
                                                  🔄 Substitute
                                                </DropdownItem>
                                                <DropdownItem
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenActionMenu(null);
                                                    // ✅ FIX: Use safe handler — validates items before calling parent
                                                    handleConvertToBillSafe(patient);
                                                  }}
                                                >
                                                  🧾 Convert to Bill
                                                </DropdownItem>
                                              </PortalDropdown>
                                            </ActionMenuWrapper>
                                          </td>
                                          <td style={{ fontWeight: 600, color: "#1e293b" }}>
                                            {item.item_name || item.medicine_name || "-"}
                                          </td>
                                          <td>
                                            <QtyBadge>{item.qty ?? item.quantity ?? "-"}</QtyBadge>
                                          </td>
                                          <td>
                                            {item.available_stock !== undefined && item.available_stock !== null ? (
                                              <StockBadge $low={stockLow}>{item.available_stock}</StockBadge>
                                            ) : (
                                              <span style={{ color: "#94a3b8" }}>-</span>
                                            )}
                                          </td>
                                          <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem" }}>
                                            {item.dosage || item.dose || <span style={{ color: "#cbd5e1" }}>—</span>}
                                          </td>
                                          <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#64748b" }}>
                                            {wardDateStr}
                                          </td>
                                          <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#64748b" }}>
                                            {wardTimeStr}
                                          </td>
                                        </ItemRow>
                                      );
                                    })
                                  ) : (
                                    <tr>
                                      <td colSpan="8">
                                        <EmptyState style={{ padding: "24px" }}>
                                          No medicine items found for this patient.
                                        </EmptyState>
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </ItemTable>

                            </DetailInner>
                          </DetailCell>
                        </DetailPanel>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </StyledTable>
        </TableCard>

        {/* Legend — rendered once at the very bottom of the page */}
        <Legend>
          <LegendItem><StatusDot $type="substitute" /> Substitute Given</LegendItem>
          <LegendItem><StatusDot $type="emergency" /> Emergency Medicine</LegendItem>
          <LegendItem><StatusDot $type="insurance" /> Insurance</LegendItem>
          <LegendItem><StatusDot $type="regular" /> Regular Medicine</LegendItem>
        </Legend>

      </Wrapper>

      {/* ── Print Modal ── */}
      {printPatient && (() => {
        const p = printPatient;
        const items = Array.isArray(p?.medicine_items) ? p.medicine_items : [];
        const wardReqRaw = p.ward_request_date || p.created_date;
        let wardDateStr = "-", wardTimeStr = "-";
        if (wardReqRaw) {
          const d = new Date(wardReqRaw);
          wardDateStr = d.toLocaleDateString("en-GB");
          wardTimeStr = d.toLocaleTimeString("en-IN", {
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
          });
        }

        const handlePrint = () => {
          const printWindow = window.open("", "_blank", "width=800,height=600");
          const html = `
            <html><head><title>Ward Prescription</title>
            <style>
              body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; padding: 24px; }
              .hosp-header { display: flex; align-items: flex-start; gap: 14px; border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 10px; }
              .hosp-name { font-size: 18px; font-weight: 800; color: #0f766e; }
              .hosp-sub { font-size: 12px; color: #666; }
              .section-title { background: #e5e7eb; text-align: right; padding: 3px 10px; font-weight: 700; font-size: 12px; margin-bottom: 10px; }
              .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; margin-bottom: 10px; }
              .meta-row { display: flex; gap: 6px; font-size: 12px; }
              .meta-key { color: #666; min-width: 80px; }
              .meta-val { font-weight: 600; }
              .bold { font-weight: 700; margin-bottom: 4px; }
              .doctor { font-weight: 700; color: #0f766e; margin-bottom: 14px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th { border: 1px solid #ccc; padding: 6px 8px; background: #f3f4f6; text-align: left; }
              td { border: 1px solid #e5e7eb; padding: 6px 8px; }
            </style></head><body>
            <div class="hosp-header">
              <div>
                <div class="hosp-name">SHANMUGA HOSPITAL LIMITED</div>
                <div class="hosp-sub">51/24, Saradha College Road, Salem - 636007</div>
                <div class="hosp-sub">Ph: 04272706666</div>
              </div>
            </div>
            <div class="section-title">**Ward Prescription Details</div>
            <div class="meta-grid">
              <div class="meta-row"><span class="meta-key">UHID</span><span>:</span><span class="meta-val">${p.uhid || "-"}</span></div>
              <div class="meta-row"><span class="meta-key">Age/Gender</span><span>:</span><span class="meta-val">${p.age || "-"} / ${p.gender || "-"}</span></div>
              <div class="meta-row"><span class="meta-key">Name</span><span>:</span><span class="meta-val">${p.patient_details?.patient_name || p.patient_name || "-"}</span></div>
              <div class="meta-row"><span class="meta-key">Req Ref</span><span>:</span><span class="meta-val">${p.Bill_id || p.bill_no || "-"}</span></div>
              <div class="meta-row"><span class="meta-key">Address</span><span>:</span><span class="meta-val">${p.patient_details?.address || p.address || "-"}</span></div>
              <div class="meta-row"><span class="meta-key">Ward Name</span><span>:</span><span class="meta-val">${p.ward_name || p.room_no || "-"}</span></div>
            </div>
            <div class="bold">${wardDateStr} &nbsp; ${wardTimeStr}</div>
            <div class="doctor">Dr. ${p.doctor_name || "-"}</div>
            <table>
              <thead><tr><th>Sl</th><th>Brand Name</th><th>Dosage</th><th>Qty</th><th>Remarks</th></tr></thead>
              <tbody>
                ${items.map((item, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${item.item_name || item.medicine_name || "-"}</td>
                    <td>${item.dosage || item.dose || "-"}</td>
                    <td>${item.qty ?? item.quantity ?? "-"}</td>
                    <td>${item.remark || ""}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </body></html>`;
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        };

        return createPortal(
          <PrintOverlay onClick={() => setPrintPatient(null)}>
            <PrintModalBox onClick={e => e.stopPropagation()}>
              <PrintModalHeader>
                <PrintModalTitle>🖨 Ward Prescription Details</PrintModalTitle>
                <PrintCloseBtn onClick={() => setPrintPatient(null)}>✕</PrintCloseBtn>
              </PrintModalHeader>
              <PrintContent>
                <PrintHospitalHeader>
                  <PrintHospitalLogo>🏥</PrintHospitalLogo>
                  <PrintHospitalInfo>
                    <PrintHospitalName>SHANMUGA HOSPITAL LIMITED</PrintHospitalName>
                    <PrintHospitalSub>51/24, Saradha College Road, Salem - 636007</PrintHospitalSub>
                    <PrintHospitalSub>Ph: 04272706666</PrintHospitalSub>
                  </PrintHospitalInfo>
                </PrintHospitalHeader>

                <PrintSectionTitle>**Ward Prescription Details</PrintSectionTitle>

                <PrintMetaGrid>
                  <PrintMetaRow>
                    <PrintMetaKey>UHID</PrintMetaKey>
                    <span>:</span>
                    <PrintMetaVal>{p.uhid || "-"}</PrintMetaVal>
                  </PrintMetaRow>
                  <PrintMetaRow>
                    <PrintMetaKey>Age/Gender</PrintMetaKey>
                    <span>:</span>
                    <PrintMetaVal>{p.age || "-"} / {p.gender || "-"}</PrintMetaVal>
                  </PrintMetaRow>
                  <PrintMetaRow>
                    <PrintMetaKey>Name</PrintMetaKey>
                    <span>:</span>
                    <PrintMetaVal>{p.patient_details?.patient_name || p.patient_name || "-"}</PrintMetaVal>
                  </PrintMetaRow>
                  <PrintMetaRow>
                    <PrintMetaKey>Req Ref</PrintMetaKey>
                    <span>:</span>
                    <PrintMetaVal>{p.Bill_id || p.bill_no || "-"}</PrintMetaVal>
                  </PrintMetaRow>
                  <PrintMetaRow>
                    <PrintMetaKey>Address</PrintMetaKey>
                    <span>:</span>
                    <PrintMetaVal>{p.patient_details?.address || p.address || "-"}</PrintMetaVal>
                  </PrintMetaRow>
                  <PrintMetaRow>
                    <PrintMetaKey>Ward Name</PrintMetaKey>
                    <span>:</span>
                    <PrintMetaVal>{p.ward_name || p.room_no || "-"}</PrintMetaVal>
                  </PrintMetaRow>
                </PrintMetaGrid>

                <PrintDateRow>{wardDateStr} &nbsp; {wardTimeStr}</PrintDateRow>
                <PrintDoctorRow>Dr. {p.doctor_name || "-"}</PrintDoctorRow>

                <PrintItemTable>
                  <thead>
                    <tr>
                      <PrintItemTh>Sl</PrintItemTh>
                      <PrintItemTh>Brand Name</PrintItemTh>
                      <PrintItemTh>Dosage</PrintItemTh>
                      <PrintItemTh>Qty</PrintItemTh>
                      <PrintItemTh>Remarks</PrintItemTh>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i}>
                        <PrintItemTd>{i + 1}</PrintItemTd>
                        <PrintItemTd style={{ fontWeight: 600 }}>{item.item_name || item.medicine_name || "-"}</PrintItemTd>
                        <PrintItemTd>{item.dosage || item.dose || "-"}</PrintItemTd>
                        <PrintItemTd>{item.qty ?? item.quantity ?? "-"}</PrintItemTd>
                        <PrintItemTd>{item.remark || ""}</PrintItemTd>
                      </tr>
                    ))}
                  </tbody>
                </PrintItemTable>
              </PrintContent>
              <PrintFooterBtns>
                <CancelBtn onClick={() => setPrintPatient(null)}>Cancel</CancelBtn>
                <PrintBtn onClick={handlePrint}>🖨 Print</PrintBtn>
              </PrintFooterBtns>
            </PrintModalBox>
          </PrintOverlay>,
          document.body
        );
      })()}
    </>
  );
};

export default MedicineChart;