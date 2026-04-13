import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../../Auth/apiRequest";
import { FaTrashAlt, FaPills, FaSearch, FaPrint, FaSave, FaTimes } from "react-icons/fa";
import styled from "styled-components";
import {
  PageWrapper,
  colors,
  fadeIn,
  FormRow,
  InputWrapper,
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
  CloseButton,
  ModalBody,
  SearchRow,
  SearchInput,
  NoResults,
  ButtonContainer,
} from "../GlobalStyles";

// ─── Local Styled Components ─────────────────────────────────────────────────

const Card = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgba(15, 118, 110, 0.06),
    0 8px 32px rgba(15, 118, 110, 0.10),
    0 0 0 1px rgba(15, 118, 110, 0.07);
  overflow: hidden;
  animation: ${fadeIn} 0.45s cubic-bezier(0.22, 1, 0.36, 1);
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px 10px 32px;
  background: #ffffff;
  border-bottom: 1px solid #f0fdfa;
`;

const PageTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #0f766e;
  letter-spacing: -0.01em;

  svg {
    background: #f0fdfa;
    padding: 7px;
    border-radius: 10px;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    color: #0f766e;
  }
`;

const LastBilledBadge = styled.div`
  font-size: 0.82rem;
  font-weight: 500;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 24px;
  padding: 7px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #0f766e;
  transition: background 0.2s;

  &:hover {
    background: #ccfbf1;
  }

  span.link {
    color: #0f766e;
    cursor: pointer;
    font-weight: 700;
    text-decoration: none;
    border-bottom: 1px dashed #0f766e;
    transition: color 0.15s, border-color 0.15s;
    &:hover {
      color: #0d9488;
      border-color: #0d9488;
    }
  }
`;

const FormSection = styled.div`
  padding: 22px 32px;
  border-bottom: 1px solid #f0fdfa;
  background: #ffffff;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, #0f766e, #14b8a6);
    border-radius: 0 2px 2px 0;
    opacity: 0;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #0f766e;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, #ccfbf1, transparent);
  }
`;

const MedicineSearchWrapper = styled.div`
  padding: 18px 32px 22px;
  background: linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%);
  border-bottom: 1px solid #e2e8f0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #0f766e, #14b8a6, transparent);
  }
`;

const SearchHint = styled.p`
  font-size: 0.77rem;
  color: #64748b;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    color: #0f766e;
    opacity: 0.7;
  }

  strong {
    color: #0f766e;
    font-weight: 700;
  }
`;

const SearchInputStyled = styled(Input)`
  width: 100%;
  padding-left: 16px;
  padding-right: 14px;
  cursor: ${props => props.disabled ? "not-allowed" : "text"};
  background-color: ${props => props.disabled ? "#f8fafc" : "#ffffff"};
  border-right: none;
  border-radius: 10px 0 0 10px;
  flex: 1;
  border-color: #cbd5e1;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    box-shadow: none;
    border-color: #0f766e;
    background-color: #ffffff;
    z-index: 1;
  }

  &::placeholder {
    color: #94a3b8;
    font-style: italic;
  }
`;

const SearchInputRow = styled.div`
  display: flex;
  align-items: stretch;
  max-width: 500px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(15, 118, 110, 0.10), 0 0 0 1px #e2e8f0;
  transition: box-shadow 0.2s;

  &:focus-within {
    box-shadow: 0 2px 12px rgba(15, 118, 110, 0.18), 0 0 0 2px #0f766e;
  }
`;

const SearchIconBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  gap: 8px;
  background: ${props => props.disabled
    ? "linear-gradient(135deg, #e2e8f0, #f1f5f9)"
    : "linear-gradient(135deg, #0f766e, #0d9488)"};
  color: ${props => props.disabled ? "#94a3b8" : "white"};
  border: 1px solid ${props => props.disabled ? "#cbd5e1" : "#0f766e"};
  border-left: none;
  border-radius: 0 10px 10px 0;
  cursor: ${props => props.disabled ? "not-allowed" : "pointer"};
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: all 0.2s;

  svg {
    font-size: 0.9rem;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0d9488, #14b8a6);
    box-shadow: 0 2px 8px rgba(15, 118, 110, 0.3);
    transform: translateX(1px);
  }

  &:active:not(:disabled) {
    transform: translateX(0);
  }
`;

const MedicinesTableSection = styled.div`
  padding: 22px 32px 32px;
  background: #fafafa;
`;

const NetAmountRow = styled.tr`
  background: linear-gradient(135deg, #f0fdfa, #f8fafc);
  td {
    font-weight: 700;
    font-size: 0.93rem;
    color: #0f766e;
    padding: 14px 12px;
  }
`;

const QtyInput = styled(Input)`
  width: 82px;
  padding: 6px 8px;
  text-align: center;
  font-size: 0.88rem;
  border-radius: 7px;
  border-color: #d1fae5;
  background: #f0fdfa;
  color: #0f766e;
  font-weight: 600;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: #0f766e;
    box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
    outline: none;
    background: #fff;
  }
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: #f87171;
  cursor: pointer;
  padding: 7px;
  border-radius: 8px;
  transition: background 0.18s, color 0.18s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #fef2f2;
    color: #dc2626;
    transform: scale(1.15);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const StockBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: ${props => props.low ? "#fef2f2" : "#f0fdf4"};
  color: ${props => props.low ? "#dc2626" : "#15803d"};
  border: 1px solid ${props => props.low ? "#fecaca" : "#bbf7d0"};
`;

const ModalResultCount = styled.p`
  font-size: 0.82rem;
  color: #64748b;
  margin: 0 0 12px;
  font-style: italic;
`;

const ModalCheckbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #0f766e;
  border-radius: 4px;
`;

const ModalFooterBar = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #f0fdfa;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: linear-gradient(135deg, #f0fdfa, #f8fafc);
`;

const ConfirmModalOverlay = styled(ModalOverlay)``;

const ConfirmBox = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 36px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(15, 118, 110, 0.08);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
  }

  h4 {
    margin: 0 0 10px;
    font-size: 1.15rem;
    color: #0f172a;
    font-weight: 800;
    letter-spacing: -0.01em;
  }
  p {
    color: #64748b;
    font-size: 0.93rem;
    margin-bottom: 28px;
    line-height: 1.6;
  }
`;

const ConfirmBtns = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

// ── Estimate banner (shown when loaded from estimate) ─────────────────────────
const EstimateBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 0;

  button {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    color: #b45309;
    font-size: 1rem;
    padding: 0 4px;
    &:hover { color: #92400e; }
  }
`;

// ─── Component ─────────────────────────────────────────────────────────────────

const StyledToastContainer = styled(ToastContainer)`
  .Toastify__toast {
    border-radius: 10px;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 14px 18px;
    min-height: unset;
  }
  .Toastify__toast--success {
    background: #f0fdf4;
    color: #166534;
    border-left: 5px solid #22c55e;
  }
  .Toastify__toast--success .Toastify__toast-icon svg { fill: #22c55e; }
  .Toastify__toast--success .Toastify__progress-bar { background: #22c55e; }
  .Toastify__toast--success .Toastify__close-button { color: #166534; }
  .Toastify__toast--error {
    background: #fef2f2;
    color: #991b1b;
    border-left: 5px solid #ef4444;
  }
  .Toastify__toast--error .Toastify__toast-icon svg { fill: #ef4444; }
  .Toastify__toast--error .Toastify__progress-bar { background: #ef4444; }
  .Toastify__toast--error .Toastify__close-button { color: #991b1b; }
  .Toastify__toast--warning {
    background: #fffbeb;
    color: #92400e;
    border-left: 5px solid #f59e0b;
  }
  .Toastify__toast--warning .Toastify__toast-icon svg { fill: #f59e0b; }
  .Toastify__toast--warning .Toastify__progress-bar { background: #f59e0b; }
`;

const OPPharmacy = ({ estimateToLoad, onEstimateLoaded, billToEdit, onBillEditLoaded, wardRequestToLoad, onWardRequestLoaded }) => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const selectedBranch = localStorage.getItem("selected_branch") || "";
 

  const [medicines, setMedicines] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [billTypes, setBillTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addedMedicines, setAddedMedicines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [filteredModalMedicines, setFilteredModalMedicines] = useState([]);
  const [doctor_names, setdoctor_names] = useState([]);
  const [lastBilled, setLastBilled] = useState(null);
  const [modalSearch, setModalSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [qtyErrors, setQtyErrors] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("cash");
  const [pendingBillIntent, setPendingBillIntent] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printBillData, setPrintBillData] = useState(null);
  const [showNilStock, setShowNilStock] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const MODAL_PAGE_SIZE = 9;

  // billingType is set internally based on which button is clicked:
  // "Estimate" when Save Estimate is clicked, "Direct" when Save Bill is clicked
  const [billingType, setBillingType] = useState("Direct");

  // loaded estimate tracking (for convert flow)
  const [loadedEstimateNo, setLoadedEstimateNo] = useState(null);

  // UHID Search Modal
  const [showUHIDModal, setShowUHIDModal] = useState(false);
  const [uhidSearchInput, setUhidSearchInput] = useState("");
  const [uhidNamePhone, setUhidNamePhone] = useState("");
  const [uhidAdmitted, setUhidAdmitted] = useState(false);
  const [uhidSearchResults, setUhidSearchResults] = useState([]);
  const [uhidSearchLoading, setUhidSearchLoading] = useState(false);

  // Overall discount state
  const [overallDiscountType, setOverallDiscountType] = useState("percent");
  const [overallDiscountValue, setOverallDiscountValue] = useState("");

  const [patientType, setPatientType] = useState("");
  const [address, setAddress] = useState("");
  const [place, setPlace] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [admissionStatus, setAdmissionStatus] = useState("NOT ADMITTED");
  const [admissionRoomNo, setAdmissionRoomNo] = useState("");
  const [admissionDateTime, setAdmissionDateTime] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [editReason, setEditReason] = useState("");
  const [isWardRequest, setIsWardRequest] = useState(false);

   const branch_code = localStorage.getItem("selected_branch");
   const outlet_code = localStorage.getItem("outlet_code");
   console.log(outlet_code);

  const [formData, setFormData] = useState({
    uhid: "",
    inpatientNo: "",
    name: "",
    doctor_id: "",
    roomNo: "",
    billDate: "",
    billType: "",
    billTypeName: ""
  });




  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCancelConfirm = () => {
    resetForm();
    setTodayBillDate();
    setShowCancelModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  useEffect(() => {
    const fetchBillTypes = async () => {
      try {
        const response = await apiRequest(`${HmsBaseUrl}get_pharmacy_BillType/`, "GET");

        if (response.success && Array.isArray(response.data?.data)) {
          const data = response.data.data;
          setBillTypes(data);

          if (data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              billType: data[0].bill_type,
              billName: data[0].bill_name
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
  }, [formData.uhid, isEditMode]);

  // UHID Modal: fetch all patients then filter client-side for partial UHID match
  const handleUHIDSearch = async (directUhidVal) => {
  const uhidVal = (directUhidVal !== undefined ? directUhidVal : uhidSearchInput).trim();
  const nameVal = uhidNamePhone.trim();

  // ✅ Require at least one search param
  if (!uhidVal && !nameVal) {
    toast.warning("Please enter a UHID or name to search.");
    return;
  }

  setUhidSearchLoading(true);
  try {
    let url = `${HmsBaseUrl}patient_details/`;
    const params = [];

    if (uhidVal) params.push(`uhid=${encodeURIComponent(uhidVal)}`);
    if (nameVal)  params.push(`name=${encodeURIComponent(nameVal)}`);
    if (nameVal)  params.push(`mobile=${encodeURIComponent(nameVal)}`);

    if (params.length > 0) url += `?${params.join("&")}`;

    const res = await apiRequest(url, "GET");
    // ✅ FIX: API returns { success, data: [...] }
    // apiRequest wraps it so the array lives at res.data.data
    const resBody = res.data || res;
    let results = Array.isArray(resBody?.data)
      ? resBody.data
      : Array.isArray(resBody)
        ? resBody
        : [];

    if (uhidAdmitted) {
      results = results.filter(p => Boolean(p.ip_number));
    }

    setUhidSearchResults(results);

    // Always show results in modal — let user pick, even if only 1 result
    if (results.length === 0) {
      toast.info("No patients found for the given UHID.");
    }
    // Modal stays open so user can see and select from the list

  } catch (err) {
    console.error("UHID search failed", err);
    setUhidSearchResults([]);
    toast.error("Search failed. Please try again.");
  } finally {
    setUhidSearchLoading(false);
  }
};


  const fetchAdmissionStatus = async (uhid) => {
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}admissionstatus/?uhid=${uhid}`,
        "GET"
      );

      if (res.success) {
        if (res.data.admitted === true) {
          setAdmissionStatus("ADMITTED");

          const admData = res.data.data;

          // ── Admission Date & Time ──────────────────────────────────────
          if (admData?.admissionDateTime) {
            const dt = new Date(admData.admissionDateTime);
            const formatted = dt.toLocaleString("en-IN", {
              day: "2-digit", month: "2-digit", year: "numeric",
              hour: "2-digit", minute: "2-digit", hour12: true
            });
            setAdmissionDateTime(formatted);
          } else {
            setAdmissionDateTime("");
          }

          // ── Active Room No ─────────────────────────────────────────────
          // Primary source: room_details (fields: roomNo, bedNo)
          // Fallback: roomShitingDetails (fields: newRoomNo, newBedNo)
          const roomDetails     = admData?.room_details;
          const shiftingDetails = admData?.roomShitingDetails;
          const activeFromRoom  = Array.isArray(roomDetails)
            ? roomDetails.find(r => r.is_roomActive === true) : null;
          const activeFromShift = Array.isArray(shiftingDetails)
            ? shiftingDetails.find(r => r.is_roomActive === true) : null;

          if (activeFromRoom) {
            setAdmissionRoomNo(`${activeFromRoom.roomNo} / Bed ${activeFromRoom.bedNo}`);
          } else if (activeFromShift) {
            setAdmissionRoomNo(`${activeFromShift.newRoomNo} / Bed ${activeFromShift.newBedNo}`);
          } else {
            setAdmissionRoomNo("");
          }

        } else {
          setAdmissionStatus("NOT ADMITTED");
          setAdmissionRoomNo("");
          setAdmissionDateTime("");
        }
      }
    } catch (error) {
      console.error("Error fetching admission status:", error);
    }
  };

  const handleUHIDSelect = (p) => {
    const fullName = `${p.salutation || ""} ${p.firstName || ""} ${p.lastName || ""}`.trim();

    // ── Resolve doctor from most recent billing with a valid doctor_id ──────
    let resolvedDoctorId = "";
    if (Array.isArray(p.billing) && p.billing.length > 0) {
      const billingsWithDoctor = p.billing.filter(b => b.doctor_id);
      if (billingsWithDoctor.length > 0) {
        // Sort descending by billed_date and pick latest
        const sorted = [...billingsWithDoctor].sort(
          (a, b) => new Date(b.billed_date) - new Date(a.billed_date)
        );
        resolvedDoctorId = sorted[0].doctor_id;
      }
    }

    setFormData(prev => ({
      ...prev,
      uhid: p.uhid || "",
      name: fullName,
      inpatientNo: p.ip_number || "",
      doctor_id: resolvedDoctorId,
      roomNo: p.room_no || ""
    }));

    setPatientType(p.customer_type || "");
    setAddress(p.permanent_address || "");
    setPlace(p.area || "");
    setMobilePhone(p.mobilePhone || p.mobile || "");

    // Calculate age from dob
    if (p.dob) {
      const dob = new Date(p.dob);
      const today = new Date();
      let years = today.getFullYear() - dob.getFullYear();
      let months = today.getMonth() - dob.getMonth();
      let days = today.getDate() - dob.getDate();
      if (days < 0) { months -= 1; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
      if (months < 0) { years -= 1; months += 12; }
      setPatientAge(`${years}Y ${months}M ${days}D`);
    } else {
      setPatientAge("");
    }

    fetchAdmissionStatus(p.uhid);

    setShowUHIDModal(false);
  };

  const openUHIDModal = () => {
  const currentUhid = formData.uhid || "";
  setUhidSearchInput(currentUhid);
  setUhidNamePhone("");
  setUhidAdmitted(false);
  setUhidSearchResults([]);
  setShowUHIDModal(true);

  // Auto-search if UHID already typed in form — pass value directly to avoid stale closure
  if (currentUhid.trim()) {
    setTimeout(() => handleUHIDSearch(currentUhid.trim()), 0);
  }
};
  const handleLastUHIDClick = () => {
    if (formData.uhid) {
      const ok = window.confirm("Replace current UHID with last billed UHID?");
      if (!ok) return;
    }
    setFormData(prev => ({
      ...prev,
      uhid: lastBilled.uhid,
      name: lastBilled.patient_name,
      inpatientNo: lastBilled.inpatient_number || "",
      doctor_id: lastBilled.doctor_id || "",
      roomNo: lastBilled.room_no || "",
      billType: lastBilled.bill_type || "",
      billNo: lastBilled.bill_no || "",
      billTypeName: lastBilled.bill_name || ""
    }));
    setAddedMedicines([]);
  };

  useEffect(() => {
    const fetchLastBilledUHID = async () => {
      try {
        const res = await apiRequest(
          `${HmsBaseUrl}get_last_billed_uhid/`,
          "GET"
        );

        if (res.success && res.data?.data) {
          setLastBilled(res.data.data);
        }
      } catch (err) {
        console.error("Last billed UHID fetch failed", err);
      }
    };

    fetchLastBilledUHID();
  }, []);

  useEffect(() => {
    console.log("LAST BILLED STATE =>", lastBilled);
  }, [lastBilled]);

  const isMedicineSearchEnabled = Boolean(formData.doctor_id);

  useEffect(() => {
  if (!HmsBaseUrl) return;

  const fetchMedicines = async () => {
    try {
      // ❌ DO NOT send branch/outlet manually
      // apiRequest already sends:
      // Authorization, Branch-Code, Outlet-Code
      // + auth-* fields in body

      const response = await apiRequest(
        `${HmsBaseUrl}get_oppharmacy_stock/`,
        "POST"
      );

      const medicineArray = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      if (response.success) {
        const formattedMedicines = medicineArray.map((item) => ({
          name:
            item.item_name ||
            `${item.item_first_name || ""} ${item.item_last_name || ""}`.trim(),

          item_id: item.item_id,
          batch_number: item.batch_number || "N/A",
          grn_number: item.grn_number || "",
          expiry_date: item.expiry_date || "N/A",

          mrp: parseFloat(item.mrp || 0),
          price: parseFloat(item.price || item.mrp || 0),

          hsn_code: item.hsn_code || "—",

          cgst_rate: item.CGST_Percentage || 0,
          cgst_amount: item.CGST_Amt || 0,
          sgst_rate: item.SGST_Percentage || 0,
          sgst_amount: item.SGST_Amt || 0,

          category: item.category || "",

          reorder_level: item.reorder_level || 0,
          total_stock: Number(item.total_stock ?? 0),
          available_stock:
            item.available_stock != null
              ? Number(item.available_stock)
              : 0,

          is_low_stock: item.is_low_stock === true,
          is_nil_stock:
            item.available_stock != null
              ? Number(item.available_stock) <= 0
              : false,

          high_risk: item.high_risk === true,
          look_alike: item.look_alike === true,
          sound_alike: item.sound_alike === true,

          quantity: 0,
          total: 0,
        }));

        setMedicines(formattedMedicines);
      } else {
        console.error("API failed:", response.error);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
  };

  fetchMedicines();
}, [HmsBaseUrl]);


  useEffect(() => {
    const fetchBillTypes = async () => {
      try {
        const response = await apiRequest(`${HmsBaseUrl}get_pharmacy_BillType/`, "GET");
        if (response.success && Array.isArray(response.data?.data)) {
          const data = response.data.data;
          setBillTypes(data);

          if (data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              billType: data[0].bill_type,
              billTypeName: data[0].bill_name
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching bill types:", error);
      }
    };

    fetchBillTypes();
  }, [formData.uhid, isEditMode]);

  // Unique key per medicine row
  const getMedicineKey = (m) => `${m.item_id}_${m.batch_number}`;

  const handleMedicineInput = (e) => {
    setSearchTerm(e.target.value);
  };

  const openMedicineModal = (term) => {
    const normalizedTerm = (term ?? "").trim().toLowerCase();

    const filtered = normalizedTerm
      ? medicines.filter((m) =>
        (m.name || "").toLowerCase().includes(normalizedTerm)
      )
      : medicines;

    setFilteredModalMedicines(filtered);
    setSelectedMedicines([]);
    setModalSearch("");
    setModalPage(1);
    setShowNilStock(false);
    setShowModal(true);
  };

  const handleKeyPress = (e) => {
    if (!isMedicineSearchEnabled) return;

    if (e.key === "Enter") {
      e.preventDefault();
      const term = searchTerm;
      setSearchTerm("");
      openMedicineModal(term);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedMedicines([]);
    setModalSearch("");
  };

  const handleModalCloseAndClear = () => {
    setShowModal(false);
    setSelectedMedicines([]);
    setSearchTerm("");
    setModalSearch("");
    setShowNilStock(false);
    setModalPage(1);
  };

  const handleMedicineSelect = (medicine) => {
    const key = getMedicineKey(medicine);

    const alreadyInBill = addedMedicines.some((m) => getMedicineKey(m) === key);
    if (alreadyInBill) {
      toast.warning(`"${medicine.name}" is already added to the bill!`, { autoClose: 2000 });
      return;
    }

    const isSelected = selectedMedicines.some((m) => getMedicineKey(m) === key);
    if (isSelected) {
      setSelectedMedicines(selectedMedicines.filter((m) => getMedicineKey(m) !== key));
    } else {
      setSelectedMedicines([...selectedMedicines, medicine]);
    }
  };

  const handleAddSelected = () => {
    const medicinesToAdd = selectedMedicines.filter(
      (medicine) => !addedMedicines.some((m) => getMedicineKey(m) === getMedicineKey(medicine))
    );
    const medicinesWithQuantity = medicinesToAdd.map((medicine) => ({
      ...medicine,
      quantity: 0,
      total: 0
    }));
    setAddedMedicines([...addedMedicines, ...medicinesWithQuantity]);
    handleModalClose();
  };

  const handleQuantityChange = (index, value) => {
    const updatedMedicines = [...addedMedicines];
    const quantity = Math.max(0, parseInt(value, 10) || 0);
    const medicine = updatedMedicines[index];

    if (
      medicine.available_stock !== 9999 &&
      medicine.available_stock != null &&
      quantity > medicine.available_stock
    ) {
      toast.warning(
        `"${medicine.name}" has only ${medicine.available_stock} units in stock. Please enter ${medicine.available_stock} or less.`,
        { toastId: `stock-excess-${index}`, autoClose: 2000 }
      );
    }

    updatedMedicines[index] = { ...medicine, quantity };
    setAddedMedicines(updatedMedicines);
  };

  useEffect(() => {
    const fetchdoctor_names = async () => {
      try {
        const response = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
        if (response.success) {
          setdoctor_names(response.data || []);
        } else {
          throw new Error(response.error || "Failed to fetch doctor_names");
        }
      } catch (error) {
        console.error("Error fetching doctor_names:", error.message);
        toast.error("Error fetching doctor_names", { autoClose: 2000 });
      }
    };
    fetchdoctor_names();
  }, []);

  const resetForm = () => {
    setFormData({
      uhid: "",
      inpatientNo: "",
      name: "",
      doctor_id: "",
      roomNo: "",
      billNo: "",
      billDate: "",
      billType: "",
      billTypeName: "",
    });
    setAddedMedicines([]);
    setSearchTerm("");
    setSelectedMedicines([]);
    setFilteredModalMedicines([]);
    setOverallDiscountType("percent");
    setOverallDiscountValue("");
    setPatientType("");
    setAddress("");
    setPlace("");
    setMobilePhone("");
    setPatientAge("");
    setAdmissionStatus("NOT ADMITTED");
    setAdmissionRoomNo("");
    setAdmissionDateTime("");
    setBillingType("Direct");
    setLoadedEstimateNo(null);
    setRecordId(null);
    setIsEditMode(false);
    setEditReason("");
    setIsWardRequest(false);
    setQtyErrors({});
  };

  // Load estimate passed in from ViewEstimate tab
  useEffect(() => {
    if (!estimateToLoad) return;
    convertEstimate(estimateToLoad);
    if (typeof onEstimateLoaded === "function") onEstimateLoaded();
  }, [estimateToLoad]);

  const handleSave = async (intentStatus) => {
    if (saving) return;

    if (!formData.billType) {
      toast.error("Bill Type is mandatory!", { autoClose: 2000 });
      return;
    }

    if (addedMedicines.length === 0) {
      toast.error("Please add at least one medicine!", { autoClose: 2000 });
      return;
    }

    const errorMap = {};
    addedMedicines.forEach((m, i) => {
      if (!m.quantity || m.quantity <= 0) errorMap[i] = true;
    });

    if (Object.keys(errorMap).length > 0) {
      setQtyErrors(errorMap);
      const first = addedMedicines.find((m) => !m.quantity || m.quantity <= 0);
      toast.error(`Quantity is required for "${first.name}".`, { autoClose: 2000 });
      return;
    }

    setQtyErrors({});

    const invalidStock = addedMedicines.some(
      (m) => m.available_stock !== 9999 && m.quantity > m.available_stock
    );

    if (invalidStock) {
      toast.error("Quantity exceeds available stock!", { autoClose: 2000 });
      return;
    }

    // For Direct bill → show payment mode modal first
    if (intentStatus !== "Estimate") {
      setPendingBillIntent(intentStatus);
      setSelectedPaymentMode("cash");
      setShowPaymentModal(true);
      return;
    }

    // For Estimate → save directly (no payment mode needed)
    await executeSave(intentStatus, null);
  };

  const executeSave = async (intentStatus, paymentMode) => {
    setSaving(true);

    try {
      const finalItems = addedMedicines.map((m) => ({
        item_id: Number(m.item_id),
        batch_number: String(m.batch_number),
        qty: Number(m.quantity),
        price: parseFloat(m.price || 0),
      }));

      const overallDiscAmtFinal =
        overallDiscountType === "amount"
          ? parseFloat(overallDiscountValue || 0)
          : totalAmount * (parseFloat(overallDiscountValue || 0) / 100);

      const rawNetAmount = totalAmount - overallDiscAmtFinal;
      const roundedNet = Math.round(rawNetAmount);
      const roundOffValue = parseFloat((roundedNet - rawNetAmount).toFixed(2));

      let status = "";
      let billing_mode = "";

      if (intentStatus === "Estimate") {
        status = "Estimate";
        billing_mode = "ESTIMATE";
      } else {
        status = "Billed";
        if (isWardRequest) {
          billing_mode = "WARD_REQUEST";
        } else if (loadedEstimateNo) {
          billing_mode = "ESTIMATE";
        } else {
          billing_mode = "DIRECT";
        }
      }

     const paymentFields = {
      payment_mode: paymentMode === "cash" ? "Cash" : paymentMode === "credit" ? "Credit" : null
    };
      const basePayload = {
        bill_date: formData.billDate,
        bill_type: formData.billType,
        uhid: formData.uhid,
        inpatient_number: formData.inpatientNo,
        doctor_id: formData.doctor_id,
        room_no: formData.roomNo,
        medicine_particulars: finalItems,
        total_amount: parseFloat(totalAmount.toFixed(2)),
        overall_discount_type: overallDiscountValue && parseFloat(overallDiscountValue) > 0
          ? overallDiscountType
          : null,
        overall_discount_value: parseFloat(overallDiscountValue || 0),
        overall_discount_amount: parseFloat(overallDiscAmtFinal.toFixed(2)),
        actual_net_amount: parseFloat(rawNetAmount.toFixed(2)),
        round_off: roundOffValue,
        net_amount: roundedNet,
        status,
        billing_mode,
        ...paymentFields,
      };

      let response;

      const hasBillId = recordId !== undefined && recordId !== null && recordId !== "" && recordId !== 0;

      console.log(
        "💾 executeSave | intent:", intentStatus,
        "| paymentMode:", paymentMode,
        "| recordId:", recordId,
        "| hasBillId:", hasBillId,
        "| loadedEstimateNo:", loadedEstimateNo
      );

      if (hasBillId) {
        const patchPayload = {
          ...basePayload,
          Bill_id: parseInt(recordId),
          edit_reason: editReason.trim() || undefined,
        };
        response = await apiRequest(`${HmsBaseUrl}save_oppharmacy_bill/`, "PATCH", patchPayload);
      } else {
        response = await apiRequest(`${HmsBaseUrl}save_oppharmacy_bill/`, "POST", basePayload);
      }

      console.log("API RESPONSE:", response);

      if (!hasBillId) {
        const newBillId = response?.data?.Bill_id ?? response?.Bill_id ?? null;
        if (newBillId) {
          setRecordId(newBillId);
        }
      }

      if (response.success) {
        const backendMsg = response.data?.message || response.message;
        if (status === "Estimate") {
          toast.success(backendMsg || `Estimate saved! #${response.data?.estimate_no || ""}`, { autoClose: 2000 });
          resetForm();
          setTodayBillDate();
        } else {
          toast.success(backendMsg || `Bill saved successfully! #${response.data?.bill_no || ""}`, { autoClose: 2000 });
          const savedBillNo = response.data?.bill_no || response.bill_no || "";
          const selectedDoctor = doctor_names.find(d => String(d.employeeId) === String(formData.doctor_id));
          const doctorName = selectedDoctor ? selectedDoctor.employeeName : formData.doctor_id || "—";
          setPrintBillData({
            billNo: savedBillNo,
            billDate: formData.billDate,
            patientName: formData.name,
            uhid: formData.uhid,
            doctorName,
            cashierId: formData.cashier_id || "",
            medicines: [...addedMedicines],
            totalAmount,
            totalItemDiscount,
            overallDiscountType,
            overallDiscountValue,
            netAmount,
            paymentMode,
          });
          setShowPrintModal(true);
          resetForm();
          setTodayBillDate();
        }
      } else {
        const backendErr = response.data?.error || response.error;
        toast.error(backendErr || "Save failed.", { autoClose: 2000 });
      }

    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save.", { autoClose: 2000 });
    } finally {
      setSaving(false);
    }
  };

  const setTodayBillDate = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData(prev => ({ ...prev, billDate: today }));
  };

  useEffect(() => {
    setTodayBillDate();
  }, []);

  const parseOrderedDictMeds = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;

    try { return JSON.parse(raw); } catch { /* fall through */ }

    const results = [];
    const dictPattern = /OrderedDict\(\[([^\]]*(?:\[[^\]]*\][^\]]*)*)\]\)/g;
    let dictMatch;
    while ((dictMatch = dictPattern.exec(raw)) !== null) {
      const inner = dictMatch[1];
      const obj = {};
      const pairPattern = /\('([^']+)',\s*([^)]+?)\s*\)(?=\s*(?:,|\]))/g;
      let pairMatch;
      while ((pairMatch = pairPattern.exec(inner)) !== null) {
        const key = pairMatch[1];
        let val = pairMatch[2].trim();
        if      (val === "None")            val = null;
        else if (val === "True")            val = true;
        else if (val === "False")           val = false;
        else if (/^\[/.test(val))           val = [];
        else if (/^'(.*)'$/.test(val))      val = val.slice(1, -1);
        else if (!isNaN(Number(val)))       val = Number(val);
        obj[key] = val;
      }
      if (Object.keys(obj).length > 0) results.push(obj);
    }

    if (results.length > 0) return results;

    try {
      const jsonLike = raw
        .replace(/OrderedDict\(\[/g, "[")
        .replace(/\]\)/g, "]")
        .replace(/'/g, '"')
        .replace(/True/g, "true")
        .replace(/False/g, "false")
        .replace(/None/g, "null");
      return JSON.parse(jsonLike);
    } catch { /* give up */ }

    console.warn("parseOrderedDictMeds: failed to parse", raw);
    return [];
  };

  const convertEstimate = async (estimate) => {
    if (!estimate.Bill_id) {
      toast.error("Estimate is missing Bill_id — cannot load.", { autoClose: 2000 });
      return;
    }

    const resolvedEstimateBillTypeName =
      estimate.bill_type_name ||
      estimate.bill_name ||
      billTypes.find(bt => String(bt.bill_type) === String(estimate.bill_type))?.bill_name ||
      "";

    // ── Step 1: Set the bill/form header fields first ─────────────────────────
    setFormData((prev) => ({
      ...prev,
      name:        estimate.patient_name      || "",
      uhid:        estimate.uhid              || "",
      inpatientNo: estimate.inpatient_number  || "",
      doctor_id:   estimate.doctor_id         || "",
      roomNo:      estimate.room_no           || "",
      billType:    estimate.bill_type         || "",
      billTypeName: resolvedEstimateBillTypeName,
    }));

    // ── Step 2: Fetch full patient record to populate Additional Details ──────
    // This mirrors what handleUHIDSelect does after picking a patient from the
    // UHID modal — we need address, mobile, age, customer_type, etc.
    if (estimate.uhid) {
      try {
        const res = await apiRequest(
          `${HmsBaseUrl}patient_details/?uhid=${encodeURIComponent(estimate.uhid)}`,
          "GET"
        );

        // API returns { success, data: [...] }; apiRequest may wrap it one level deeper
        const resBody = res.data ?? res;
        const patients = res.success
          ? Array.isArray(resBody?.data)
            ? resBody.data
            : Array.isArray(resBody)
              ? resBody
              : []
          : [];

        const p = patients.length > 0 ? patients[0] : null;

        if (p) {
          setPatientType(p.customer_type || "");
          setAddress(p.permanent_address || "");
          setPlace(p.area || "");
          setMobilePhone(p.mobilePhone || p.mobile || "");

          // ✅ Age calculation
          if (p.dob) {
            const dob = new Date(p.dob);
            const today = new Date();

            let years = today.getFullYear() - dob.getFullYear();
            let months = today.getMonth() - dob.getMonth();
            let days = today.getDate() - dob.getDate();

            if (days < 0) {
              months -= 1;
              days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
            }

            if (months < 0) {
              years -= 1;
              months += 12;
            }

            setPatientAge(`${years}Y ${months}M ${days}D`);
          } else if (p.age) {
            setPatientAge(String(p.age));
          } else {
            setPatientAge("");
          }
        }

      } catch (err) {
        console.warn("convertEstimate: could not fetch patient details —", err);
      }

      // ✅ Admission status
      fetchAdmissionStatus(estimate.uhid);
    }

    // ── Step 4: Resolve medicine rows ─────────────────────────────────────────
    const rawMeds = parseOrderedDictMeds(estimate.medicine_particulars);

    const loadedMedicines = rawMeds.map((m) => {
      const price = parseFloat(m.price || m.Price || m.mrp || 0);
      const qty   = parseFloat(m.qty   || m.quantity || 0);

      const stockMatch =
        medicines.find(
          (s) =>
            String(s.item_id)     === String(m.item_id) &&
            String(s.batch_number) === String(m.batch_number)
        ) ||
        medicines.find((s) => String(s.item_id) === String(m.item_id));

      return {
        item_id:         m.item_id,
        name:            stockMatch?.name     || m.item_name || m.name || `Item #${m.item_id}`,
        batch_number:    m.batch_number       || "",
        quantity:        qty,
        price:           price,
        mrp:             stockMatch?.mrp      ?? price,
        hsn_code:        stockMatch?.hsn_code    || "—",
        cgst_rate:       stockMatch?.cgst_rate   || 0,
        cgst_amount:     stockMatch?.cgst_amount || 0,
        sgst_rate:       stockMatch?.sgst_rate   || 0,
        sgst_amount:     stockMatch?.sgst_amount || 0,
        expiry_date:     stockMatch?.expiry_date || "—",
        total:           qty * price,
        available_stock: 9999,
        edit_history:    m.edit_history || [],
      };
    });

    setAddedMedicines(loadedMedicines);
    setOverallDiscountType(estimate.overall_discount_type || "percent");
    setOverallDiscountValue(
      estimate.overall_discount_value != null ? String(estimate.overall_discount_value) : ""
    );

    setRecordId(estimate.Bill_id);
    setLoadedEstimateNo(estimate.estimate_no);
    setBillingType("Estimate");
    setIsEditMode(true);

    console.log(
      "✅ Estimate loaded | Bill_id:", estimate.Bill_id,
      "| estimate_no:", estimate.estimate_no,
      "| uhid:", estimate.uhid
    );
  };

  // ── Convert Ward Request → Bill ────────────────────────────────────────────
  const convertWardRequest = async (wardReq) => {
    if (!wardReq) return;

    // ── 1. Fill header fields immediately so the form is not blank ────────
    const billDateStr = wardReq.bill_date
      ? wardReq.bill_date.split("T")[0]
      : new Date().toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      uhid:         wardReq.uhid             || "",
      inpatientNo:  wardReq.inpatient_number || "",
      name:         wardReq.patient_name || wardReq.patient_details?.patient_name || "",
      doctor_id:    wardReq.doctor_id        || "",
      roomNo:       wardReq.room_no          || wardReq.ward_name || "",
      billType:     wardReq.bill_type        || "",
      billTypeName: wardReq.bill_name        || "",
      billDate:     billDateStr,
    }));

    // ── 2. Fetch full patient details from API (same as convertEstimate) ──
    // This guarantees all Additional-Details fields are populated from the
    // live API response — not from pre-enriched data that may be partial.
    if (wardReq.uhid) {
      try {
        const res = await apiRequest(
          `${HmsBaseUrl}patient_details/?uhid=${encodeURIComponent(wardReq.uhid)}`,
          "GET"
        );

        // API returns { success, data: [...] }
        // apiRequest may wrap it one level deeper: res = { success, data: { success, data: [...] } }
        const resBody = res.data ?? res;
        const patients = res.success
          ? Array.isArray(resBody?.data)
            ? resBody.data
            : Array.isArray(resBody)
              ? resBody
              : []
          : [];

        const p = patients.length > 0 ? patients[0] : null;

        if (p) {
          // Update name in formData with fully resolved name from API
          const fullName = `${p.salutation || ""} ${p.firstName || ""} ${p.lastName || ""}`.trim();
          setFormData((prev) => ({
            ...prev,
            name: fullName || prev.name,
          }));

          setPatientType(p.customer_type || "");
          setAddress(p.permanent_address || p.area || "");
          setPlace(p.area || "");
          setMobilePhone(p.mobilePhone || p.mobile || "");

          // Calculate age from dob
          if (p.dob) {
            const dob = new Date(p.dob);
            const today = new Date();
            let years  = today.getFullYear() - dob.getFullYear();
            let months = today.getMonth()    - dob.getMonth();
            let days   = today.getDate()     - dob.getDate();
            if (days   < 0) { months -= 1; days   += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
            if (months < 0) { years  -= 1; months += 12; }
            setPatientAge(`${years}Y ${months}M ${days}D`);
          } else if (p.age) {
            setPatientAge(String(p.age));
          } else {
            setPatientAge("");
          }
        }
      } catch (err) {
        console.warn("convertWardRequest: could not fetch patient details —", err);
      }

      // ── Fetch admission status (same as convertEstimate) ─────────────────
      fetchAdmissionStatus(wardReq.uhid);
    }

    // ── 2. Map medicine_items to addedMedicines format ─────────────────────
    // ✅ FIX: Always default to [] and filter out any null/undefined entries
    const items = Array.isArray(wardReq.medicine_items)
      ? wardReq.medicine_items.filter(Boolean)
      : [];

    const loadedMedicines = items.map((item) => {
      // ✅ FIX: item is guaranteed non-null due to .filter(Boolean) above
      // Try to find full stock info from already-fetched medicines list
      const stockMatch =
        medicines.find(
          (s) =>
            String(s.item_id) === String(item.item_id) &&
            String(s.batch_number) === String(item.batch_number)
        ) ||
        medicines.find((s) => String(s.item_id) === String(item.item_id));

      const price  = parseFloat(stockMatch?.price || stockMatch?.mrp || 0);
      const qty    = Number(item.qty || item.quantity || 0);

      return {
        item_id:         item.item_id,
        name:            stockMatch?.name || item.item_name || `Item #${item.item_id}`,
        batch_number:    item.batch_number || stockMatch?.batch_number || "",
        quantity:        qty,
        price:           price,
        mrp:             stockMatch?.mrp ?? price,
        hsn_code:        stockMatch?.hsn_code    || "—",
        cgst_rate:       item.CGST_Percentage    ?? stockMatch?.cgst_rate   ?? 0,
        cgst_amount:     item.CGST_Amt           ?? stockMatch?.cgst_amount ?? 0,
        sgst_rate:       item.SGST_Percentage    ?? stockMatch?.sgst_rate   ?? 0,
        sgst_amount:     item.SGST_Amt           ?? stockMatch?.sgst_amount ?? 0,
        expiry_date:     stockMatch?.expiry_date  || "—",
        available_stock: item.available_stock     ?? stockMatch?.available_stock ?? 9999,
        dosage:          item.dosage              || stockMatch?.dosage || "",
        noOfDays:        item.noOfDays            || "",
        total:           qty * price,
        edit_history:    [],
      };
    });

    setAddedMedicines(loadedMedicines);

    // ── 3. Carry over discount if present ─────────────────────────────────
    setOverallDiscountType(wardReq.overall_discount_type || "percent");
    setOverallDiscountValue(
      wardReq.overall_discount_value != null
        ? String(wardReq.overall_discount_value)
        : ""
    );

    // ── 4. If the ward/medicine-chart record already has a Bill_id, wire up
    //       PATCH so we update the existing record instead of creating a duplicate.
    //       If there is no Bill_id this is a genuinely new bill → POST.
    const existingBillId = wardReq.Bill_id || wardReq.bill_id || null;

    if (existingBillId) {
      // ✅ MedicineChart → Convert to Bill: existing record → PATCH
      setRecordId(existingBillId);
      setIsEditMode(true);
      console.log("🔁 Ward request has Bill_id:", existingBillId, "— will PATCH on save.");
    } else {
      // Fresh ward request with no prior bill → POST
      setRecordId(null);
      setIsEditMode(false);
      console.log("🆕 Ward request has no Bill_id — will POST on save.");
    }

    setLoadedEstimateNo(null);
    setBillingType("Direct");
    setIsWardRequest(true);

    toast.info(`Ward request loaded for ${wardReq.patient_name || wardReq.patient_details?.patient_name || wardReq.uhid}. Review and save as bill.`, { autoClose: 2000 });

    console.log("✅ Ward request loaded for billing | uhid:", wardReq.uhid, "| Bill_id:", existingBillId);
  };

  // Trigger convertWardRequest when wardRequestToLoad prop changes
  useEffect(() => {
    if (!wardRequestToLoad) return;
    convertWardRequest(wardRequestToLoad).then(() => {
      if (typeof onWardRequestLoaded === "function") onWardRequestLoaded();
    });
  }, [wardRequestToLoad]);

  const loadBillForEdit = async (bill) => {
    if (!bill.Bill_id) {
      toast.error("Bill is missing Bill_id — cannot load for edit.", { autoClose: 2000 });
      return;
    }

    // Resolve bill type name: prefer bill_type_name from API, then bill_name,
    // then look up from already-fetched billTypes list by bill_type code.
    const resolvedBillTypeName =
      bill.bill_type_name ||
      bill.bill_name ||
      billTypes.find(bt => String(bt.bill_type) === String(bill.bill_type))?.bill_name ||
      "";

    setFormData((prev) => ({
      ...prev,
      name:         bill.patient_name     || "",
      uhid:         bill.uhid             || "",
      inpatientNo:  bill.inpatient_number || "",
      doctor_id:    bill.doctor_id        || "",
      roomNo:       bill.room_no          || "",
      billType:     bill.bill_type        || "",
      billTypeName: resolvedBillTypeName,
      billNo:       bill.bill_no          || bill.bill_number || "",
      billDate: bill.bill_date
        ? bill.bill_date.split("T")[0]
        : new Date().toISOString().split("T")[0],
    }));

    // ── Fetch full patient record to populate Patient Information &
    //    Patient Additional Details (address, mobile, age, patientType, etc.)
    //    Mirrors the same pattern used in convertEstimate / convertWardRequest.
    if (bill.uhid) {
      try {
        const res = await apiRequest(
          `${HmsBaseUrl}patient_details/?uhid=${encodeURIComponent(bill.uhid)}`,
          "GET"
        );

        const resBody = res.data ?? res;
        const patients = res.success
          ? Array.isArray(resBody?.data)
            ? resBody.data
            : Array.isArray(resBody)
              ? resBody
              : []
          : [];

        const p = patients.length > 0 ? patients[0] : null;

        if (p) {
          // Build full patient name from API (salutation + firstName + lastName)
          const fullName = `${p.salutation || ""} ${p.firstName || ""} ${p.lastName || ""}`.trim();
          setFormData((prev) => ({
            ...prev,
            name: fullName || prev.name,
          }));

          setPatientType(p.customer_type || "");
          setAddress(p.permanent_address || "");
          setPlace(p.area || "");
          setMobilePhone(p.mobilePhone || p.mobile || "");

          // Age from dob
          if (p.dob) {
            const dob = new Date(p.dob);
            const today = new Date();
            let years  = today.getFullYear() - dob.getFullYear();
            let months = today.getMonth()    - dob.getMonth();
            let days   = today.getDate()     - dob.getDate();
            if (days   < 0) { months -= 1; days   += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
            if (months < 0) { years  -= 1; months += 12; }
            setPatientAge(`${years}Y ${months}M ${days}D`);
          } else if (p.age) {
            setPatientAge(String(p.age));
          } else {
            setPatientAge("");
          }

          // ── Resolve doctor_id from most recent billing entry with a doctor_id
          //    (use bill.doctor_id from ViewBills if already set; otherwise derive)
          if (!bill.doctor_id && Array.isArray(p.billing) && p.billing.length > 0) {
            const billingsWithDoctor = p.billing.filter(b => b.doctor_id);
            if (billingsWithDoctor.length > 0) {
              const sorted = [...billingsWithDoctor].sort(
                (a, b) => new Date(b.billed_date) - new Date(a.billed_date)
              );
              setFormData((prev) => ({
                ...prev,
                doctor_id: sorted[0].doctor_id,
              }));
            }
          }
        }
      } catch (err) {
        console.warn("loadBillForEdit: could not fetch patient details —", err);
      }

      // ── Fetch admission status (same as convertEstimate) ──────────────────
      fetchAdmissionStatus(bill.uhid);
    }

    const rawMeds = parseOrderedDictMeds(bill.medicine_particulars);

    const loadedMedicines = rawMeds.map((m) => {
      const price = parseFloat(m.price || m.Price || m.mrp || 0);
      const qty   = parseFloat(m.qty   || m.quantity || 0);

      const stockMatch = medicines.find(
        (s) =>
          String(s.item_id) === String(m.item_id) &&
          String(s.batch_number) === String(m.batch_number)
      ) || medicines.find(
        (s) => String(s.item_id) === String(m.item_id)
      );

      return {
        item_id:         m.item_id,
        name:            stockMatch?.name || m.item_name || m.name || `Item #${m.item_id}`,
        batch_number:    m.batch_number || "",
        quantity:        qty,
        price:           price,
        mrp:             stockMatch?.mrp ?? price,
        hsn_code:        stockMatch?.hsn_code || "—",
        cgst_rate:       stockMatch?.cgst_rate || 0,
        cgst_amount:     stockMatch?.cgst_amount || 0,
        sgst_rate:       stockMatch?.sgst_rate || 0,
        sgst_amount:     stockMatch?.sgst_amount || 0,
        expiry_date:     stockMatch?.expiry_date || "—",
        total:           qty * price,
        available_stock: 9999,
        edit_history:    m.edit_history || [],
      };
    });

    setAddedMedicines(loadedMedicines);

    setOverallDiscountType(bill.overall_discount_type || "percent");
    setOverallDiscountValue(
      bill.overall_discount_value != null
        ? String(bill.overall_discount_value)
        : ""
    );

    setRecordId(bill.Bill_id);

    // ── Store the edit reason typed in ViewBills confirmation modal ──────────
    if (bill.editReason) setEditReason(bill.editReason);

    if (bill.billing_mode === "ESTIMATE" && bill.estimate_no) {
      setLoadedEstimateNo(bill.estimate_no);
      setBillingType("Estimate");
    } else {
      setLoadedEstimateNo(null);
      setBillingType("Direct");
    }

    setIsEditMode(true);

    console.log(
      "✅ Bill loaded for edit | Bill_id:", bill.Bill_id,
      "| bill_no:", bill.bill_no || bill.bill_number,
      "| billing_mode:", bill.billing_mode,
      "| editReason:", bill.editReason || "(none)",
      "| medicines resolved:", loadedMedicines.map(m => ({ id: m.item_id, name: m.name, qty: m.quantity }))
    );
  };

  useEffect(() => {
    if (!billToEdit) return;
    loadBillForEdit(billToEdit).then(() => {
      if (typeof onBillEditLoaded === "function") onBillEditLoaded();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billToEdit]);

  const handlePrint = () => {
    const selectedDoctor = doctor_names.find(d => String(d.employeeId) === String(formData.doctor_id));
    const doctorName = selectedDoctor ? selectedDoctor.employeeName : formData.doctor_id || "—";

    const overallDiscAmtPrint = overallDiscountType === "amount"
      ? parseFloat(overallDiscountValue || 0)
      : totalAmount * (parseFloat(overallDiscountValue || 0) / 100);

    const medicineRows = addedMedicines.map((medicine, index) => {
      const itemGross = (medicine.quantity || 0) * (medicine.mrp || 0);
      const discVal = parseFloat(medicine.discount_value || 0);
      const discAmt = medicine.discount_type === "amount"
        ? discVal
        : itemGross * (discVal / 100);
      const discPct = medicine.discount_type === "percent"
        ? discVal
        : itemGross > 0 ? ((discVal / itemGross) * 100) : 0;

      return `
        <tr>
          <td>${medicine.name || ""}</td>
          <td>${medicine.hsn_code || "—"}</td>
          <td>${medicine.batch_number || "—"}</td>
          <td>${medicine.expiry_date || "—"}</td>
          <td style="text-align:center">${medicine.quantity}</td>
          <td style="text-align:right">${medicine.mrp.toFixed(2)}</td>
          <td style="text-align:center">${discPct.toFixed(1)}</td>
          <td style="text-align:right">${medicine.cgst_rate.toFixed(2)}</td>
          <td style="text-align:right">${medicine.cgst_amount.toFixed(2)}</td>
          <td style="text-align:right">${medicine.sgst_rate.toFixed(2)}</td>
          <td style="text-align:right">${medicine.sgst_amount.toFixed(2)}</td>
          <td style="text-align:right">${(itemGross).toFixed(2)}</td>
          <td style="text-align:right">${medicine.total.toFixed(2)}</td>
        </tr>`;
    }).join("");

    const printableContent = `
      <html>
      <head>
        <title>Pharmacy Bill</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #000; font-size: 11px; padding: 12px; }
          .container { width: 100%; max-width: 900px; margin: 0 auto; border: 1px solid #000; padding: 10px; }
          .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 8px; margin-bottom: 8px; }
          .header h1 { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
          .header p { font-size: 10px; line-height: 1.5; }
          .badge { font-size: 12px; font-weight: bold; margin: 4px 0; border: 1px solid #000; display: inline-block; padding: 2px 10px; }
          .info-grid { display: flex; justify-content: space-between; margin: 8px 0; border-bottom: 1px solid #ccc; padding-bottom: 6px; }
          .info-col { flex: 1; }
          .info-row { display: flex; font-size: 10px; margin-bottom: 3px; }
          .info-label { font-weight: bold; min-width: 90px; }
          .info-val { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 10px; }
          th { border: 1px solid #000; padding: 4px 5px; background: #f0f0f0; text-align: left; font-size: 10px; }
          td { border: 1px solid #ccc; padding: 3px 5px; font-size: 10px; }
          .totals-section { margin-top: 8px; display: flex; justify-content: flex-end; }
          .totals-table { width: 260px; border-collapse: collapse; }
          .totals-table td { border: 1px solid #ccc; padding: 4px 8px; font-size: 11px; }
          .totals-table .label { font-weight: bold; text-align: right; background: #f9f9f9; }
          .totals-table .value { text-align: right; }
          .totals-table .net-row td { font-weight: bold; background: #e8f5e9; font-size: 12px; }
          .footer { margin-top: 12px; border-top: 1px solid #ccc; padding-top: 6px; display: flex; justify-content: space-between; font-size: 10px; }
          .sign { text-align: right; }
          .notice { font-style: italic; font-size: 10px; color: #555; margin-top: 8px; text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SHANMUGA HOSPITAL LIMITED</h1>
            <p>51/24, Saradha College Road, Salem - 636007 &nbsp;|&nbsp; Ph No: 0427 2706666</p>
            <p>SLS 7788 20,21 3993 20B 3848 21B &nbsp;|&nbsp; CIN: L85110TZ2020PLC033974</p>
            <p>GST NO: 33ABDCS8326A1ZP &nbsp;&nbsp; No. RM/3G/012</p>
            <div class="badge">PHARMACY OP GST INVOICE</div>
          </div>

          <div class="info-grid">
            <div class="info-col">
              <div class="info-row"><span class="info-label">Patient</span><span class="info-val">: ${formData.name || "—"}</span></div>
              <div class="info-row"><span class="info-label">UHID No</span><span class="info-val">: ${formData.uhid || "—"}</span></div>
              <div class="info-row"><span class="info-label">Doctor</span><span class="info-val">: ${doctorName}</span></div>
            </div>
            <div class="info-col" style="text-align:right">
              <div class="info-row" style="justify-content:flex-end"><span class="info-label">Bill No</span><span class="info-val" style="min-width:unset; margin-left:8px">: ${formData.billNo || "—"}</span></div>
              <div class="info-row" style="justify-content:flex-end"><span class="info-label">Date</span><span class="info-val" style="min-width:unset; margin-left:8px">: ${formData.billDate || "—"}</span></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Particulars</th>
                <th>HSN Code</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Disc%</th>
                <th>CGST%</th>
                <th>CGST Amt</th>
                <th>SGST%</th>
                <th>SGST Amt</th>
                <th>Amount</th>
                <th>Net Amt</th>
              </tr>
            </thead>
            <tbody>
              ${medicineRows}
            </tbody>
          </table>

          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td class="label">Total :</td>
                <td class="value">₹${totalAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label">Discount Amt :</td>
                <td class="value">₹${(totalItemDiscount + overallDiscAmtPrint).toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label">Overall Discount :</td>
                <td class="value">₹${overallDiscAmtPrint.toFixed(2)}</td>
              </tr>
              <tr class="net-row">
                <td class="label">Net Amount (Payable) :</td>
                <td class="value">₹${netAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label">Amount Collected :</td>
                <td class="value"></td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <div>
              <p>Payment Mode :</p>
              <p style="margin-top:6px">Prepared by : <strong>${formData.cashier_id || ""}</strong></p>
            </div>
            <div class="sign">
              <p style="margin-top:30px">_____________________</p>
              <p>(Sign-pharmacist)</p>
            </div>
          </div>
          <p class="notice">"Goods once sold will not be taken back"</p>
        </div>
      </body>
      </html>`;
    const printWindow = window.open("", "", "width=960,height=700");
    printWindow.document.write(printableContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const handleDelete = (key) => {
    setAddedMedicines(prev => prev.filter((m) => getMedicineKey(m) !== key));
  };

  const totalAmount = addedMedicines.reduce((sum, m) => sum + (m.total || 0), 0);

  const totalItemDiscount = addedMedicines.reduce((sum, m) => {
    const itemTotal = (m.quantity || 0) * (m.mrp || 0);
    const disc = m.discount_type === "amount"
      ? parseFloat(m.discount_value || 0)
      : itemTotal * (parseFloat(m.discount_value || 0) / 100);
    return sum + disc;
  }, 0);

  const overallDiscAmt = overallDiscountType === "amount"
    ? parseFloat(overallDiscountValue || 0)
    : totalAmount * (parseFloat(overallDiscountValue || 0) / 100);

  const netAmount = Math.max(0, totalAmount - overallDiscAmt);

  const nilStockCount = filteredModalMedicines.filter(m => m.is_nil_stock).length;

  const visibleModalMedicines = filteredModalMedicines.filter((m) => {
    if (m.is_nil_stock && !showNilStock) return false;
    if (modalSearch.trim()) {
      return (m.name || "").toLowerCase().includes(modalSearch.trim().toLowerCase());
    }
    return true;
  });

  const modalTotalPages = Math.max(1, Math.ceil(visibleModalMedicines.length / MODAL_PAGE_SIZE));
  const safeModalPage = Math.min(modalPage, modalTotalPages);
  const displayedModalMedicines = visibleModalMedicines.slice(
    (safeModalPage - 1) * MODAL_PAGE_SIZE,
    safeModalPage * MODAL_PAGE_SIZE
  );

  return (
    <PageWrapper>
      <StyledToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover />
      <Card>

        {/* ── Top Bar: Title + Last Billed UHID ── */}
        <TopBar>
          {lastBilled && (
            <LastBilledBadge>
              Last Billed UHID:&nbsp;
              <span
                className="link"
                onClick={handleLastUHIDClick}
              >
                {lastBilled.uhid}
              </span>
            </LastBilledBadge>
          )}
        </TopBar>

        {/* ── Estimate Banner + Edit Mode Banner ── */}
        <FormSection>
          {loadedEstimateNo && (
            <EstimateBanner>
              📋 Loaded from Estimate <strong>#{loadedEstimateNo}</strong> — edit medicines if needed, then click <strong>Convert to Bill</strong>
              <button
                title="Clear estimate and start fresh"
                onClick={() => {
                  setLoadedEstimateNo(null);
                  setAddedMedicines([]);
                }}
              >
                ×
              </button>
            </EstimateBanner>
          )}

          {/* Edit Mode Banner */}
          {isEditMode && formData.billNo && (
            <div style={{
              marginTop: loadedEstimateNo ? 14 : 0,
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              background: "#eff6ff",
              border: "1.5px solid #bfdbfe",
              borderRadius: 10,
              padding: "11px 16px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 4,
                background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
                borderRadius: "4px 0 0 4px"
              }} />
              <span style={{ fontSize: 20, marginLeft: 4, flexShrink: 0 }}>✏️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#1e40af" }}>
                  Editing Bill{" "}
                  <span style={{
                    fontFamily: "monospace", background: "#dbeafe",
                    padding: "1px 8px", borderRadius: 5,
                    border: "1px solid #93c5fd", fontSize: 12.5
                  }}>
                    {formData.billNo}
                  </span>
                </div>
                {editReason && (
                  <div style={{ fontSize: 12, color: "#3b82f6", marginTop: 4 }}>
                    <span style={{ fontWeight: 600, color: "#1e40af" }}>Reason: </span>
                    {editReason}
                  </div>
                )}
                <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 4 }}>
                  Modify the details below and click <strong>Update Bill</strong> to save changes.
                </div>
              </div>
              <button
                title="Cancel edit and reset form"
                onClick={() => { resetForm(); setTodayBillDate(); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#93c5fd", fontSize: 18, padding: "0 2px",
                  lineHeight: 1, flexShrink: 0,
                  transition: "color 0.15s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#2563eb"}
                onMouseLeave={e => e.currentTarget.style.color = "#93c5fd"}
              >
                ×
              </button>
            </div>
          )}

          {/* Show empty state placeholder if neither banner is visible */}
          {!loadedEstimateNo && !(isEditMode && formData.billNo) && (
            <div style={{ height: 0 }} />
          )}
        </FormSection>

        {/* ── Patient Details Form ── */}
        <FormSection>
          <SectionLabel>Patient Information</SectionLabel>
          <FormRow>
            <InputWrapper>
              <Label required>UHID Number</Label>
              <Input
                type="text"
                name="uhid"
                placeholder="Type UHID and press Enter to search"
                value={formData.uhid}
                onChange={handleChange}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    openUHIDModal();
                  }
                }}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Inpatient No</Label>
              <Input
                type="text"
                name="inpatientNo"
                placeholder="Enter Inpatient No"
                value={formData.inpatientNo}
                onChange={handleChange}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Name</Label>
              <Input
                type="text"
                name="name"
                placeholder="Patient name"
                value={formData.name}
                onChange={handleChange}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Mobile</Label>
              <Input value={mobilePhone} disabled />
            </InputWrapper>

            <InputWrapper>
              <Label>Age</Label>
              <Input value={patientAge} disabled />
            </InputWrapper>

           
            <InputWrapper>
              <Label>Bill Date</Label>
              <Input
                type="date"
                name="billDate"
                value={formData.billDate}
                disabled
              />
            </InputWrapper>

            <InputWrapper>
              <Label required>Bill Type</Label>
              <Input
                type="text"
                name="billTypeName"
                value={
                  // Prefer live lookup from billTypes list so it always shows
                  // correct name even if billTypeName was missing in API response
                  billTypes.find(bt => String(bt.bill_type) === String(formData.billType))?.bill_name ||
                  formData.billTypeName ||
                  ""
                }
                disabled
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Doctor Name</Label>
              <Select
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Doctor</option>
                {doctor_names.map((doc) => (
                  <option key={doc.employeeId} value={doc.employeeId}>
                    {doc.employeeName}
                  </option>
                ))}
              </Select>
            </InputWrapper>
          </FormRow>
        </FormSection>

        <FormSection>
          <SectionLabel>Patient Additional Details</SectionLabel>

          <FormRow>
            <InputWrapper>
              <Label>Patient Type</Label>
              <Input value={patientType} disabled />
            </InputWrapper>

            <InputWrapper>
              <Label>Address</Label>
              <Input value={address} disabled />
            </InputWrapper>

            <InputWrapper>
              <Label>Place</Label>
              <Input value={place} disabled />
            </InputWrapper>

            <InputWrapper>
              <Label>Admission Status</Label>
              <Input
                value={admissionStatus}
                disabled
                style={{
                  color: admissionStatus === "ADMITTED" ? "green" : "red",
                  fontWeight: "bold"
                }}
              />
            </InputWrapper>

            {admissionRoomNo && (
              <InputWrapper>
                <Label>Room No / Bed</Label>
                <Input
                  value={admissionRoomNo}
                  disabled
                  style={{ color: "#0f766e", fontWeight: "bold" }}
                />
              </InputWrapper>
            )}

            {admissionDateTime && (
              <InputWrapper>
                <Label>Admission Date &amp; Time</Label>
                <Input
                  value={admissionDateTime}
                  disabled
                  style={{ color: "#0f766e", fontWeight: "600" }}
                />
              </InputWrapper>
            )}
          </FormRow>
        </FormSection>

        {/* ── Medicine Search ── */}
        <MedicineSearchWrapper>
          <SearchHint>
            <FaSearch style={{ marginRight: 5 }} />
            Type medicine name, then click <strong>Search</strong> or press <strong>Enter</strong> to open results
            {!isMedicineSearchEnabled && <span style={{ color: "#ef4444" }}> — Select Doctor first</span>}
          </SearchHint>
          <SearchInputRow>
            <SearchInputStyled
              type="text"
              placeholder={
                isMedicineSearchEnabled
                  ? "Type medicine name and press Enter or click Search"
                  : "Select Doctor first"
              }
              value={searchTerm}
              onChange={handleMedicineInput}
              onKeyDown={handleKeyPress}
              disabled={!isMedicineSearchEnabled}
            />
            {searchTerm && isMedicineSearchEnabled && (
              <button
                type="button"
                onClick={() => { setSearchTerm(""); setShowModal(false); setFilteredModalMedicines([]); }}
                style={{
                  background: "none", border: "1px solid #cbd5e1", borderLeft: "none", borderRight: "none",
                  color: "#94a3b8", cursor: "pointer", padding: "0 10px", fontSize: "1rem",
                  display: "flex", alignItems: "center"
                }}
                title="Clear search"
              >×</button>
            )}
            <SearchIconBtn
              type="button"
              disabled={!isMedicineSearchEnabled}
              onClick={() => {
                if (!isMedicineSearchEnabled) return;
                const term = searchTerm;
                setSearchTerm("");
                openMedicineModal(term);
              }}
              title="Search medicines"
            >
              <FaSearch />
            </SearchIconBtn>
          </SearchInputRow>
        </MedicineSearchWrapper>

        {/* ── Added Medicines Table ── */}
        <MedicinesTableSection>
          <SectionLabel>Added Medicines</SectionLabel>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Particulars</Th>
                  <Th>Batch</Th>
                  <Th>Qty</Th>
                  <Th>MRP</Th>
                  <Th>Price</Th>
                  <Th>Disc Type</Th>
                  <Th>Disc Value</Th>
                  <Th>CGST%</Th>
                  <Th>CGST Amt</Th>
                  <Th>SGST%</Th>
                  <Th>SGST Amt</Th>
                  <Th>Total</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {addedMedicines.map((medicine, index) => {

                  const isNilStock = Number(medicine.available_stock) <= 0;
                  const isLowStock = medicine.is_low_stock;

                  const itemGross = (medicine.quantity || 0) * (medicine.mrp || 0);
                  const discVal = parseFloat(medicine.discount_value || 0);
                  const discAmt = medicine.discount_type === "amount"
                    ? discVal
                    : itemGross * (discVal / 100);
                  return (
                    <Tr key={index} style={{
                      background: isNilStock
                        ? "#fee2e2"
                        : isLowStock
                          ? "#fff7ed"
                          : undefined
                    }}>
                      <Td>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                          {medicine.name}
                          {Number(medicine.available_stock) <= 0 && (
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#b91c1c" }}>(NIL)</span>
                          )}
                          {medicine.is_low_stock && Number(medicine.available_stock) > 0 && (
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#b45309" }}>(LOW)</span>
                          )}
                          {medicine.high_risk && (
                            <span title="High Risk Medicine" style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444", display: "inline-block", flexShrink: 0 }} />
                          )}
                          {medicine.look_alike && (
                            <span title="Look-Alike Medicine" style={{ width: 9, height: 9, borderRadius: "50%", background: "#eab308", display: "inline-block", flexShrink: 0 }} />
                          )}
                          {medicine.sound_alike && (
                            <span title="Sound-Alike Medicine" style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e", display: "inline-block", flexShrink: 0 }} />
                          )}
                        </div>
                      </Td>
                      <Td>{medicine.batch_number}</Td>
                      <Td>
                        <QtyInput
                          type="number"
                          min="0"
                          value={medicine.quantity || ""}
                          style={qtyErrors[index] ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.18)", background: "#fff5f5" } : {}}
                          onChange={(e) => {
                            const newQty = parseFloat(e.target.value) || 0;

                            if (
                              medicine.available_stock !== 9999 &&
                              medicine.available_stock != null &&
                              newQty > medicine.available_stock
                            ) {
                              toast.warning(
                                `"${medicine.name}" has only ${medicine.available_stock} units in stock. Please enter ${medicine.available_stock} or less.`,
                                { toastId: `stock-excess-${index}`, autoClose: 2000 }
                              );
                            }

                            const gross = newQty * medicine.mrp;
                            const dVal = parseFloat(medicine.discount_value || 0);
                            const dAmt = (medicine.discount_type || "percent") === "amount"
                              ? dVal : gross * (dVal / 100);
                            const newTotal = Math.max(0, gross - dAmt);
                            setAddedMedicines((prev) =>
                              prev.map((m, i) =>
                                i === index ? { ...m, quantity: newQty, total: newTotal } : m
                              )
                            );
                            if (newQty > 0) setQtyErrors(prev => { const n = { ...prev }; delete n[index]; return n; });
                          }}
                        />
                      </Td>
                      <Td>₹{(parseFloat(medicine.mrp) || 0).toFixed(2)}</Td>
                      <Td>₹{(itemGross || 0).toFixed(2)}</Td>
                      <Td>
                        <Select
                          style={{ width: 80, padding: "4px 6px", fontSize: "0.82rem" }}
                          value={medicine.discount_type || "percent"}
                          onChange={(e) => {
                            const dType = e.target.value;
                            const gross = (medicine.quantity || 0) * medicine.mrp;
                            const dVal = parseFloat(medicine.discount_value || 0);
                            const dAmt = dType === "amount" ? dVal : gross * (dVal / 100);
                            const newTotal = Math.max(0, gross - dAmt);
                            setAddedMedicines((prev) =>
                              prev.map((m, i) =>
                                i === index ? { ...m, discount_type: dType, total: newTotal } : m
                              )
                            );
                          }}
                        >
                          <option value="percent">%</option>
                          <option value="amount">Amt</option>
                        </Select>
                      </Td>
                      <Td>
                        <QtyInput
                          type="number"
                          min="0"
                          value={medicine.discount_value || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const dVal = parseFloat(e.target.value) || 0;
                            const gross = (medicine.quantity || 0) * medicine.mrp;
                            const dType = medicine.discount_type || "percent";
                            const dAmt = dType === "amount" ? dVal : gross * (dVal / 100);
                            const newTotal = Math.max(0, gross - dAmt);
                            setAddedMedicines((prev) =>
                              prev.map((m, i) =>
                                i === index ? { ...m, discount_value: dVal, total: newTotal } : m
                              )
                            );
                          }}
                        />
                      </Td>
                      <Td>{(parseFloat(medicine.cgst_rate) || 0).toFixed(2)}</Td>
                      <Td>{(parseFloat(medicine.cgst_amount) || 0).toFixed(2)}</Td>
                      <Td>{(parseFloat(medicine.sgst_rate) || 0).toFixed(2)}</Td>
                      <Td>{(parseFloat(medicine.sgst_amount) || 0).toFixed(2)}</Td>
                      <Td style={{ fontWeight: 600 }}>₹{(parseFloat(medicine.total) || 0).toFixed(2)}</Td>
                      <Td>
                        <DeleteBtn onClick={() => handleDelete(getMedicineKey(medicine))}>
                          <FaTrashAlt />
                        </DeleteBtn>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
              <tfoot>
                <NetAmountRow>
                  <Td colSpan="12" style={{ textAlign: "right", color: "#64748b", fontSize: "0.85rem" }}>
                    {addedMedicines.length === 0 ? "No medicines added yet." : `${addedMedicines.length} item(s)`}
                  </Td>
                  <Td />
                </NetAmountRow>
              </tfoot>
            </Table>
          </TableWrapper>

          {/* ── Summary Panel ── */}
          {addedMedicines.length > 0 && (
            <div style={{
              marginTop: 20,
              background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)",
              border: "1px solid #cbd5e1",
              borderRadius: 10,
              padding: "16px 24px",
              display: "flex",
              flexWrap: "wrap",
              gap: "0 40px",
              alignItems: "center",
              justifyContent: "flex-end",
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>Total</span>
                <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f766e" }}>₹{totalAmount.toFixed(2)}</span>
              </div>

              <div style={{ width: 1, height: 40, background: "#cbd5e1" }} />

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>Item Disc</span>
                <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#dc2626" }}>₹{totalItemDiscount.toFixed(2)}</span>
              </div>

              <div style={{ width: 1, height: 40, background: "#cbd5e1" }} />

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>Overall Discount</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Select
                    style={{ width: 68, padding: "4px 4px", fontSize: "0.82rem", borderRadius: 6, border: "1px solid #cbd5e1" }}
                    value={overallDiscountType}
                    onChange={e => setOverallDiscountType(e.target.value)}
                  >
                    <option value="percent">%</option>
                    <option value="amount">Amt</option>
                  </Select>
                  <QtyInput
                    type="number"
                    min="0"
                    placeholder="0"
                    value={overallDiscountValue}
                    onChange={e => setOverallDiscountValue(e.target.value)}
                    style={{ width: 90 }}
                  />
                </div>
              </div>

              <div style={{ width: 1, height: 40, background: "#cbd5e1" }} />

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>Overall Disc Amt</span>
                <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#dc2626" }}>₹{overallDiscAmt.toFixed(2)}</span>
              </div>

              <div style={{ width: 1, height: 40, background: "#cbd5e1" }} />

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>Net Amount (Payable)</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f766e" }}>₹{netAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <ButtonContainer>
            {(addedMedicines.length > 0 || formData.name) && (
              <Button danger onClick={() => setShowCancelModal(true)}>
                <FaTimes /> Cancel
              </Button>
            )}

            {/* Save Estimate button — sets billingType = "Estimate" internally */}
            <Button
              primary
              onClick={() => handleSave("Estimate")}
              disabled={saving}
            >
              <FaSave /> {saving ? "Saving..." : "Save Estimate"}
            </Button>

            {/* Save Bill button — sets billingType = "Direct" internally */}
            <Button
              success
              onClick={() => handleSave("Billed")}
              disabled={saving}
              style={
                loadedEstimateNo
                  ? { background: "linear-gradient(135deg, #7c3aed, #9333ea)", color: "#fff", border: "none" }
                  : {}
              }
            >
              <FaSave /> {saving ? "Saving..." : loadedEstimateNo ? "Convert to Bill" : "Save Bill"}
            </Button>

          </ButtonContainer>
        </MedicinesTableSection>

      </Card>

      {/* ── Medicine Selection Modal ── */}
      {showModal && (
        <ModalOverlay onClick={handleModalCloseAndClear}>
          <ModalContainer style={{ maxWidth: 960 }} onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Items Query — Select Medicines</ModalTitle>
              <CloseButton onClick={handleModalCloseAndClear}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                <SearchRow style={{ flex: 1, margin: 0 }}>
                  <SearchInput
                    placeholder="Filter results..."
                    value={modalSearch}
                    onChange={e => { setModalSearch(e.target.value); setModalPage(1); }}
                    autoFocus
                    style={{ width: "100%" }}
                  />
                </SearchRow>
                <label style={{
                  display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                  fontSize: "0.82rem", fontWeight: 600,
                  color: showNilStock ? "#dc2626" : "#64748b",
                  background: showNilStock ? "#fef2f2" : "#f1f5f9",
                  border: `1.5px solid ${showNilStock ? "#fca5a5" : "#cbd5e1"}`,
                  borderRadius: 8, padding: "6px 14px", userSelect: "none",
                  transition: "all 0.2s", whiteSpace: "nowrap", minWidth: 190,
                  boxShadow: showNilStock ? "0 0 0 3px rgba(220,38,38,0.08)" : "none"
                }}>
                  <input
                    type="checkbox"
                    checked={showNilStock}
                    onChange={e => { setShowNilStock(e.target.checked); setModalPage(1); }}
                    style={{ accentColor: "#dc2626", width: 15, height: 15, cursor: "pointer" }}
                  />
                  <span>
                    List the Nil Stock
                    {nilStockCount > 0 && (
                      <span style={{
                        marginLeft: 6,
                        background: showNilStock ? "#dc2626" : "#94a3b8",
                        color: "#fff", borderRadius: 10,
                        padding: "1px 7px", fontSize: "0.72rem", fontWeight: 700,
                      }}>{nilStockCount}</span>
                    )}
                  </span>
                </label>
              </div>

              <ModalResultCount>
                Showing {visibleModalMedicines.length === 0 ? 0 : (safeModalPage - 1) * MODAL_PAGE_SIZE + 1}–{Math.min(safeModalPage * MODAL_PAGE_SIZE, visibleModalMedicines.length)} of {visibleModalMedicines.length} entries
                {!showNilStock && nilStockCount > 0 && (
                  <span style={{ marginLeft: 8, color: "#dc2626", fontSize: "0.78rem" }}>
                    · {nilStockCount} nil-stock item{nilStockCount > 1 ? "s" : ""} hidden — tick <strong>List the Nil Stock</strong> to show
                  </span>
                )}
              </ModalResultCount>

              {visibleModalMedicines.length === 0 ? (
                <NoResults>
                  {nilStockCount === filteredModalMedicines.length && !showNilStock
                    ? 'All matching medicines have nil stock. Tick "List the Nil Stock" to view them.'
                    : "No medicines found matching your search."}
                </NoResults>
              ) : (
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <Th style={{ width: 48 }}>Select</Th>
                        <Th>Item Name</Th>
                        <Th>Batch No</Th>
                        <Th>Expiry</Th>
                        <Th>MRP</Th>
                        <Th>Avail. Stock</Th>
                        <Th>HSN Code</Th>
                        <Th>Classification</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedModalMedicines.map((medicine, index) => {
                        const isNilStock = medicine.is_nil_stock;
                        const isLowStock = !isNilStock && medicine.is_low_stock;
                        return (
                          <Tr
                            key={getMedicineKey(medicine) || index}
                            style={{
                              cursor: isNilStock ? "not-allowed" : "pointer",
                              opacity: isNilStock ? 0.55 : 1,
                              background: isNilStock
                                ? "#fff5f5"
                                : isLowStock
                                  ? "#fff7ed"
                                  : undefined,
                            }}
                            onClick={() => { if (!isNilStock) handleMedicineSelect(medicine); }}
                          >
                            <Td onClick={e => e.stopPropagation()}>
                              <ModalCheckbox
                                type="checkbox"
                                checked={selectedMedicines.some((m) => getMedicineKey(m) === getMedicineKey(medicine))}
                                onChange={() => { if (!isNilStock) handleMedicineSelect(medicine); }}
                                disabled={isNilStock}
                                title={isNilStock ? "Out of stock — cannot select" : ""}
                                style={{ cursor: isNilStock ? "not-allowed" : "pointer" }}
                              />
                            </Td>
                            <Td style={{ fontWeight: 500 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                {medicine.name}
                                {medicine.dosage && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>({medicine.dosage})</span>}
                                {!isNilStock && isLowStock && (
                                  <span style={{
                                    fontSize: "0.7rem", fontWeight: 700, color: "#b45309",
                                    background: "#fff7ed", border: "1px solid #fdba74",
                                    borderRadius: 4, padding: "1px 6px"
                                  }}>LOW STOCK</span>
                                )}
                                {medicine.high_risk && (
                                  <span title="High Risk Medicine" style={{
                                    width: 10, height: 10, borderRadius: "50%",
                                    background: "#ef4444", display: "inline-block", flexShrink: 0
                                  }} />
                                )}
                                {medicine.look_alike && (
                                  <span title="Look-Alike Medicine" style={{
                                    width: 10, height: 10, borderRadius: "50%",
                                    background: "#eab308", display: "inline-block", flexShrink: 0
                                  }} />
                                )}
                                {medicine.sound_alike && (
                                  <span title="Sound-Alike Medicine" style={{
                                    width: 10, height: 10, borderRadius: "50%",
                                    background: "#22c55e", display: "inline-block", flexShrink: 0
                                  }} />
                                )}
                              </div>
                            </Td>
                            <Td>{medicine.batch_number}</Td>
                            <Td style={{ fontSize: "0.82rem", color: "#64748b" }}>{medicine.expiry_date?.split("T")[0]}</Td>
                            <Td>₹{medicine.mrp.toFixed(2)}</Td>
                            <Td>
                              <StockBadge
                                low={isNilStock}
                                style={
                                  isNilStock
                                    ? { background: "#fef2f2", color: "#dc2626", fontWeight: 700, border: "1px solid #fecaca" }
                                    : isLowStock
                                      ? { background: "#fff7ed", color: "#b45309", fontWeight: 700, border: "1px solid #fdba74" }
                                      : {}
                                }
                              >
                                {isNilStock ? "0 (Nil)" : medicine.available_stock ?? "—"}
                              </StockBadge>
                            </Td>
                            <Td>{medicine.hsn_code || "—"}</Td>
                            <Td>{medicine.classification || "PHARMACY"}</Td>
                          </Tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </TableWrapper>
              )}
            </ModalBody>
            <ModalFooterBar style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              {/* ── Legend ── */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                {[
                  { color: "#ef4444", label: "High Risk Medicine" },
                  { color: "#94a3b8", label: "RoI Reached Medicine" },
                  { color: "#eab308", label: "LA (Look-Alike Medicine)" },
                  { color: "#22c55e", label: "SA (Sound-Alike Medicine)" },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
              {/* ── Pagination ── */}
              {modalTotalPages > 1 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    onClick={() => setModalPage(p => Math.max(1, p - 1))}
                    disabled={safeModalPage === 1}
                    style={{
                      padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1",
                      background: safeModalPage === 1 ? "#f1f5f9" : "#fff",
                      color: safeModalPage === 1 ? "#94a3b8" : "#0f766e",
                      fontWeight: 600, fontSize: "0.85rem",
                      cursor: safeModalPage === 1 ? "not-allowed" : "pointer",
                      transition: "all 0.15s"
                    }}
                  >Previous</button>
                  {Array.from({ length: modalTotalPages }, (_, i) => i + 1).map(pg => (
                    <button
                      key={pg}
                      onClick={() => setModalPage(pg)}
                      style={{
                        width: 34, height: 34, borderRadius: 6,
                        border: pg === safeModalPage ? "none" : "1px solid #cbd5e1",
                        background: pg === safeModalPage
                          ? "linear-gradient(135deg, #0f766e, #0d9488)" : "#fff",
                        color: pg === safeModalPage ? "#fff" : "#374151",
                        fontWeight: pg === safeModalPage ? 700 : 500,
                        fontSize: "0.88rem", cursor: "pointer",
                        boxShadow: pg === safeModalPage ? "0 2px 8px rgba(15,118,110,0.25)" : "none",
                        transition: "all 0.15s"
                      }}
                    >{pg}</button>
                  ))}
                  <button
                    onClick={() => setModalPage(p => Math.min(modalTotalPages, p + 1))}
                    disabled={safeModalPage === modalTotalPages}
                    style={{
                      padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1",
                      background: safeModalPage === modalTotalPages ? "#f1f5f9" : "#fff",
                      color: safeModalPage === modalTotalPages ? "#94a3b8" : "#0f766e",
                      fontWeight: 600, fontSize: "0.85rem",
                      cursor: safeModalPage === modalTotalPages ? "not-allowed" : "pointer",
                      transition: "all 0.15s"
                    }}
                  >Next</button>
                </div>
              ) : <div />}
              {/* ── Action Buttons ── */}
              <div style={{ display: "flex", gap: 10 }}>
                <Button secondary onClick={handleModalCloseAndClear}>
                  <FaTimes /> Close
                </Button>
                <Button
                  onClick={handleAddSelected}
                  disabled={selectedMedicines.length === 0}
                >
                  Add Selected ({selectedMedicines.length})
                </Button>
              </div>
            </ModalFooterBar>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* ── Cancel Confirmation Modal ── */}
      {showCancelModal && (
        <ConfirmModalOverlay>
          <ConfirmBox>
            <h4>⚠ Cancel Entries?</h4>
            <p>Current entries will be cancelled. Are you sure you want to continue?</p>
            <ConfirmBtns>
              <Button success onClick={handleCancelConfirm}>Yes, Cancel</Button>
              <Button secondary onClick={() => setShowCancelModal(false)}>Go Back</Button>
            </ConfirmBtns>
          </ConfirmBox>
        </ConfirmModalOverlay>
      )}

      {/* ── UHID Search Modal ── */}
      {showUHIDModal && (
        <ModalOverlay onClick={() => setShowUHIDModal(false)}>
          <ModalContainer style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Select UHID</ModalTitle>
              <CloseButton onClick={() => setShowUHIDModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 160px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>UHID</label>
                  <Input
                    type="text"
                    placeholder="e.g. 7987"
                    value={uhidSearchInput}
                    onChange={e => {
                      setUhidSearchInput(e.target.value);
                    }}
                    onKeyDown={e => e.key === "Enter" && handleUHIDSearch()}
                    autoFocus
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 160px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>Name / Phone</label>
                  <Input
                    type="text"
                    placeholder="Name or phone"
                    value={uhidNamePhone}
                    onChange={e => setUhidNamePhone(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleUHIDSearch()}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 2 }}>
                  <ModalCheckbox
                    type="checkbox"
                    id="uhid-admitted"
                    checked={uhidAdmitted}
                    onChange={e => {
                      setUhidAdmitted(e.target.checked);
                      setTimeout(() => handleUHIDSearch(), 0);
                    }}
                  />
                  <label htmlFor="uhid-admitted" style={{ fontSize: "0.85rem", fontWeight: 500, cursor: "pointer" }}>Admitted</label>
                </div>
              </div>

              {uhidSearchLoading ? (
                <NoResults>Searching...</NoResults>
              ) : uhidSearchResults.length === 0 ? (
                <NoResults>No patients found. Try a different UHID or name.</NoResults>
              ) : (
                <>
                  <ModalResultCount>
                    Showing 1 to {uhidSearchResults.length} of {uhidSearchResults.length} entries
                  </ModalResultCount>
                  <TableWrapper>
                    <Table>
                      <thead>
                        <tr>
                          <Th>Action</Th>
                          <Th>UHID No</Th>
                          <Th>Patient</Th>
                          <Th>Mobile</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {uhidSearchResults.map((p, i) => {
                          const fullName = `${p.salutation || ""} ${p.firstName || ""} ${p.lastName || ""}`.trim();
                          const uhidNo = p.uhid || p.UHID || "";
                          const mobile = p.mobilePhone || p.mobile || p.phone || p.mobileNumber || "";
                          const isAdmitted = Boolean(p.ip_number || p.admitted);
                          return (
                            <Tr
                              key={i}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleUHIDSelect(p)}
                            >
                              <Td>
                                <div
                                  style={{
                                    width: 28, height: 28, borderRadius: "50%",
                                    background: isAdmitted ? "#0f766e" : "#94a3b8",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "white", fontSize: "0.9rem", cursor: "pointer"
                                  }}
                                  title={isAdmitted ? "Admitted" : "Select"}
                                >
                                  ✓
                                </div>
                              </Td>
                              <Td style={{ fontWeight: 600 }}>{uhidNo}</Td>
                              <Td>{fullName || "—"}</Td>
                              <Td>{mobile || "—"}</Td>
                            </Tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </TableWrapper>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#0f766e" }} />
                    <span style={{ fontSize: "0.8rem", color: "#475569" }}>Admitted</span>
                  </div>
                </>
              )}
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* ── Payment Mode Modal ── */}
      {showPaymentModal && (
        <ModalOverlay onClick={() => setShowPaymentModal(false)}>
          <ModalContainer style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <ModalHeader style={{ background: "linear-gradient(135deg, #0f766e, #0d9488)" }}>
              <ModalTitle style={{ color: "#fff" }}>Select Payment Mode</ModalTitle>
              <CloseButton onClick={() => setShowPaymentModal(false)} style={{ color: "#fff" }}>×</CloseButton>
            </ModalHeader>
            <ModalBody style={{ padding: "32px 36px" }}>
              <div style={{ marginBottom: 24, color: "#475569", fontSize: "0.93rem" }}>
                Choose how the patient will pay for this bill:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { value: "cash", label: "Pay Now", desc: "Patient pays immediately (Cash / Card / UPI)" },
                  { value: "credit", label: "Pay Later", desc: "Bill on credit — patient pays at a later date" },
                ].map(opt => (
                  <label
                    key={opt.value}
                    onClick={() => setSelectedPaymentMode(opt.value)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "14px 18px",
                      borderRadius: 12,
                      border: `2px solid ${selectedPaymentMode === opt.value ? "#0f766e" : "#e2e8f0"}`,
                      background: selectedPaymentMode === opt.value ? "#f0fdfa" : "#fff",
                      cursor: "pointer",
                      transition: "all 0.18s",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value={opt.value}
                      checked={selectedPaymentMode === opt.value}
                      onChange={() => setSelectedPaymentMode(opt.value)}
                      style={{ accentColor: "#0f766e", marginTop: 3, width: 17, height: 17 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.97rem" }}>{opt.label}</div>
                      <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 3 }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </ModalBody>
            <ModalFooterBar style={{ justifyContent: "flex-end", gap: 10 }}>
              <Button secondary onClick={() => setShowPaymentModal(false)}>
                <FaTimes /> Cancel
              </Button>
              <Button
                disabled={saving}
                onClick={async () => {
                  setShowPaymentModal(false);
                  await executeSave(pendingBillIntent, selectedPaymentMode);
                }}
                style={{ background: "linear-gradient(135deg, #0f766e, #0d9488)", color: "#fff", border: "none", opacity: saving ? 0.7 : 1 }}
              >
                <FaSave /> {saving ? "Saving…" : "Confirm & Save Bill"}
              </Button>
            </ModalFooterBar>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* ── Print Modal ── */}
      {showPrintModal && printBillData && (
        <ModalOverlay onClick={() => setShowPrintModal(false)}>
          <ModalContainer style={{ maxWidth: 820 }} onClick={e => e.stopPropagation()}>
            <ModalHeader style={{ background: "linear-gradient(135deg, #0f766e, #0d9488)" }}>
              <ModalTitle style={{ color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                <FaPrint /> Bill Saved — Ready to Print
              </ModalTitle>
              <CloseButton onClick={() => setShowPrintModal(false)} style={{ color: "#fff" }}>×</CloseButton>
            </ModalHeader>
            <ModalBody style={{ padding: "0" }}>
              {/* Bill Preview */}
              <div style={{
                padding: "20px 28px",
                fontFamily: "Arial, sans-serif",
                fontSize: 11,
                color: "#000",
                background: "#fff",
              }}>
                {/* Hospital Header */}
                <div style={{ textAlign: "center", borderBottom: "1px solid #000", paddingBottom: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: "bold" }}>SHANMUGA HOSPITAL LIMITED</div>
                  <div style={{ fontSize: 10, lineHeight: 1.6 }}>51/24, Saradha College Road, Salem - 636007 &nbsp;|&nbsp; Ph No: 0427 2706666</div>
                  <div style={{ fontSize: 10 }}>SLS 7788 20,21 3993 20B 3848 21B &nbsp;|&nbsp; CIN: L85110TZ2020PLC033974</div>
                  <div style={{ fontSize: 10 }}>GST NO: 33ABDCS8326A1ZP &nbsp;&nbsp; No. RM/3G/012</div>
                  <div style={{
                    display: "inline-block", margin: "4px 0",
                    border: "1px solid #000", padding: "2px 14px",
                    fontWeight: "bold", fontSize: 12
                  }}>PHARMACY OP GST INVOICE</div>
                </div>

                {/* Patient & Bill Info */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, borderBottom: "1px solid #ccc", paddingBottom: 6 }}>
                  <div>
                    {[
                      ["Patient", printBillData.patientName || "—"],
                      ["UHID No", printBillData.uhid || "—"],
                      ["Doctor", printBillData.doctorName || "—"],
                    ].map(([lbl, val]) => (
                      <div key={lbl} style={{ display: "flex", fontSize: 10, marginBottom: 3 }}>
                        <span style={{ fontWeight: "bold", minWidth: 80 }}>{lbl}</span>
                        <span>: {val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {[
                      ["Bill No", printBillData.billNo || "—"],
                      ["Date", printBillData.billDate || "—"],
                    ].map(([lbl, val]) => (
                      <div key={lbl} style={{ display: "flex", fontSize: 10, marginBottom: 3, justifyContent: "flex-end" }}>
                        <span style={{ fontWeight: "bold", minWidth: 60 }}>{lbl}</span>
                        <span style={{ marginLeft: 8 }}>: {val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medicines Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                  <thead>
                    <tr>
                      {["Particulars", "HSN Code", "Batch", "Expiry", "Qty", "Rate", "CGST%", "CGST Amt", "SGST%", "SGST Amt", "Amount"].map(h => (
                        <th key={h} style={{ border: "1px solid #000", padding: "3px 5px", background: "#f0f0f0", textAlign: "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {printBillData.medicines.map((m, i) => (
                      <tr key={i}>
                        <td style={{ border: "1px solid #ccc", padding: "3px 5px" }}>{m.name}</td>
                        <td style={{ border: "1px solid #ccc", padding: "3px 5px" }}>{m.hsn_code || "—"}</td>
                        <td style={{ border: "1px solid #ccc", padding: "3px 5px" }}>{m.batch_number || "—"}</td>
                        <td style={{ border: "1px solid #ccc", padding: "3px 5px" }}>{m.expiry_date || "—"}</td>
                        <td style={{ border: "1px solid #ccc", padding: "3px 5px", textAlign: "center" }}>{m.quantity}</td>
                        <td style={{ border: "1px solid #ccc", padding: "3px 5px", textAlign: "right" }}>{(m.mrp || 0).toFixed(2)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "3px 5px", textAlign: "right" }}>{(m.cgst_rate || 0).toFixed(2)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "3px 5px", textAlign: "right" }}>{(m.cgst_amount || 0).toFixed(2)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "3px 5px", textAlign: "right" }}>{(m.sgst_rate || 0).toFixed(2)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "3px 5px", textAlign: "right" }}>{(m.sgst_amount || 0).toFixed(2)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "3px 5px", textAlign: "right" }}>{(m.total || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <table style={{ width: 260, borderCollapse: "collapse" }}>
                    {[
                      ["Total :", `₹${printBillData.totalAmount.toFixed(2)}`, false],
                      ["Discount Amt :", `₹${(printBillData.totalItemDiscount + (
                        printBillData.overallDiscountType === "amount"
                          ? parseFloat(printBillData.overallDiscountValue || 0)
                          : printBillData.totalAmount * (parseFloat(printBillData.overallDiscountValue || 0) / 100)
                      )).toFixed(2)}`, false],
                      ["Net Amount (Payable) :", `₹${printBillData.netAmount.toFixed(2)}`, true],
                      ["Amount Collected :", "0.00", false],
                    ].map(([lbl, val, isNet]) => (
                      <tr key={lbl} style={isNet ? { background: "#e8f5e9" } : {}}>
                        <td style={{ border: "1px solid #ccc", padding: "4px 8px", fontWeight: "bold", textAlign: "right", background: isNet ? "#e8f5e9" : "#f9f9f9", fontSize: isNet ? 12 : 11 }}>{lbl}</td>
                        <td style={{ border: "1px solid #ccc", padding: "4px 8px", textAlign: "right", fontWeight: isNet ? "bold" : "normal", fontSize: isNet ? 12 : 11 }}>{val}</td>
                      </tr>
                    ))}
                  </table>
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, borderTop: "1px solid #ccc", paddingTop: 6, fontSize: 10 }}>
                  <div>
                    <div>Payment Mode :</div>
                    {printBillData.cashierId && <div style={{ marginTop: 4 }}>Prepared by : <strong>{printBillData.cashierId}</strong></div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginTop: 30 }}>_____________________</div>
                    <div>(Sign-pharmacist)</div>
                  </div>
                </div>
                <div style={{ textAlign: "center", fontStyle: "italic", fontSize: 10, color: "#555", marginTop: 8 }}>
                  "Goods once sold will not be taken back"
                </div>
              </div>
            </ModalBody>
            {/* Modal Footer Actions */}
            <ModalFooterBar style={{ justifyContent: "flex-end", gap: 10 }}>
              <Button secondary onClick={() => setShowPrintModal(false)}>
                <FaTimes /> Close
              </Button>
              <Button
                onClick={() => {
                  const d = printBillData;
                  const overallDiscAmtPrint = d.overallDiscountType === "amount"
                    ? parseFloat(d.overallDiscountValue || 0)
                    : d.totalAmount * (parseFloat(d.overallDiscountValue || 0) / 100);

                  const medicineRows = d.medicines.map(m => `
                    <tr>
                      <td>${m.name || ""}</td>
                      <td>${m.hsn_code || "—"}</td>
                      <td>${m.batch_number || "—"}</td>
                      <td>${m.expiry_date || "—"}</td>
                      <td style="text-align:center">${m.quantity}</td>
                      <td style="text-align:right">${(m.mrp || 0).toFixed(2)}</td>
                      <td style="text-align:right">${(m.cgst_rate || 0).toFixed(2)}</td>
                      <td style="text-align:right">${(m.cgst_amount || 0).toFixed(2)}</td>
                      <td style="text-align:right">${(m.sgst_rate || 0).toFixed(2)}</td>
                      <td style="text-align:right">${(m.sgst_amount || 0).toFixed(2)}</td>
                      <td style="text-align:right">${(m.total || 0).toFixed(2)}</td>
                    </tr>`).join("");

                  const printContent = `<html><head><title>Pharmacy Bill</title>
                    <style>
                      *{margin:0;padding:0;box-sizing:border-box}
                      body{font-family:Arial,sans-serif;color:#000;font-size:11px;padding:12px}
                      .container{width:100%;max-width:900px;margin:0 auto;border:1px solid #000;padding:10px}
                      .header{text-align:center;border-bottom:1px solid #000;padding-bottom:8px;margin-bottom:8px}
                      .header h1{font-size:16px;font-weight:bold;margin-bottom:2px}
                      .header p{font-size:10px;line-height:1.5}
                      .badge{font-size:12px;font-weight:bold;margin:4px 0;border:1px solid #000;display:inline-block;padding:2px 10px}
                      .info-grid{display:flex;justify-content:space-between;margin:8px 0;border-bottom:1px solid #ccc;padding-bottom:6px}
                      .info-col{flex:1}
                      .info-row{display:flex;font-size:10px;margin-bottom:3px}
                      .info-label{font-weight:bold;min-width:90px}
                      table{width:100%;border-collapse:collapse;margin-top:6px;font-size:10px}
                      th{border:1px solid #000;padding:4px 5px;background:#f0f0f0;text-align:left;font-size:10px}
                      td{border:1px solid #ccc;padding:3px 5px;font-size:10px}
                      .totals-section{margin-top:8px;display:flex;justify-content:flex-end}
                      .totals-table{width:260px;border-collapse:collapse}
                      .totals-table td{border:1px solid #ccc;padding:4px 8px;font-size:11px}
                      .totals-table .label{font-weight:bold;text-align:right;background:#f9f9f9}
                      .totals-table .value{text-align:right}
                      .totals-table .net-row td{font-weight:bold;background:#e8f5e9;font-size:12px}
                      .footer{margin-top:12px;border-top:1px solid #ccc;padding-top:6px;display:flex;justify-content:space-between;font-size:10px}
                      .notice{font-style:italic;font-size:10px;color:#555;margin-top:8px;text-align:center}
                      @media print{body{padding:0}}
                    </style></head><body>
                    <div class="container">
                      <div class="header">
                        <h1>SHANMUGA HOSPITAL LIMITED</h1>
                        <p>51/24, Saradha College Road, Salem - 636007 &nbsp;|&nbsp; Ph No: 0427 2706666</p>
                        <p>SLS 7788 20,21 3993 20B 3848 21B &nbsp;|&nbsp; CIN: L85110TZ2020PLC033974</p>
                        <p>GST NO: 33ABDCS8326A1ZP &nbsp;&nbsp; No. RM/3G/012</p>
                        <div class="badge">PHARMACY OP GST INVOICE</div>
                      </div>
                      <div class="info-grid">
                        <div class="info-col">
                          <div class="info-row"><span class="info-label">Patient</span><span>: ${d.patientName || "—"}</span></div>
                          <div class="info-row"><span class="info-label">UHID No</span><span>: ${d.uhid || "—"}</span></div>
                          <div class="info-row"><span class="info-label">Doctor</span><span>: ${d.doctorName || "—"}</span></div>
                        </div>
                        <div class="info-col" style="text-align:right">
                          <div class="info-row" style="justify-content:flex-end"><span class="info-label">Bill No</span><span style="margin-left:8px">: ${d.billNo || "—"}</span></div>
                          <div class="info-row" style="justify-content:flex-end"><span class="info-label">Date</span><span style="margin-left:8px">: ${d.billDate || "—"}</span></div>
                        </div>
                      </div>
                      <table>
                        <thead><tr>
                          <th>Particulars</th><th>HSN Code</th><th>Batch</th><th>Expiry</th>
                          <th>Qty</th><th>Rate</th><th>CGST%</th><th>CGST Amt</th>
                          <th>SGST%</th><th>SGST Amt</th><th>Amount</th>
                        </tr></thead>
                        <tbody>${medicineRows}</tbody>
                      </table>
                      <div class="totals-section">
                        <table class="totals-table">
                          <tr><td class="label">Total :</td><td class="value">₹${d.totalAmount.toFixed(2)}</td></tr>
                          <tr><td class="label">Discount Amt :</td><td class="value">₹${(d.totalItemDiscount + overallDiscAmtPrint).toFixed(2)}</td></tr>
                          <tr class="net-row"><td class="label">Net Amount (Payable) :</td><td class="value">₹${d.netAmount.toFixed(2)}</td></tr>
                          <tr><td class="label">Amount Collected :</td><td class="value">0.00</td></tr>
                        </table>
                      </div>
                      <div class="footer">
                        <div><p>Payment Mode :</p>${d.cashierId ? `<p style="margin-top:6px">Prepared by : <strong>${d.cashierId}</strong></p>` : ""}</div>
                        <div style="text-align:right"><p style="margin-top:30px">_____________________</p><p>(Sign-pharmacist)</p></div>
                      </div>
                      <p class="notice">"Goods once sold will not be taken back"</p>
                    </div></body></html>`;

                  const pw = window.open("", "", "width=960,height=700");
                  pw.document.write(printContent);
                  pw.document.close();
                  pw.print();
                  pw.close();
                }}
                style={{ background: "linear-gradient(135deg, #0f766e, #0d9488)", color: "#fff", border: "none" }}
              >
                <FaPrint /> Print Bill
              </Button>
            </ModalFooterBar>
          </ModalContainer>
        </ModalOverlay>
      )}

    </PageWrapper>
  );
};

export default OPPharmacy;