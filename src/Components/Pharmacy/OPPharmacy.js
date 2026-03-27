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

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: linear-gradient(130deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%);
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 160px;
    height: 160px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 50%;
    pointer-events: none;
  }
  &::after {
    content: '';
    position: absolute;
    bottom: -60px;
    right: 80px;
    width: 120px;
    height: 120px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 50%;
    pointer-events: none;
  }
`;

const PageTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  letter-spacing: -0.01em;

  svg {
    background: rgba(255, 255, 255, 0.18);
    padding: 7px;
    border-radius: 10px;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }
`;

const LastBilledBadge = styled.div`
  font-size: 0.82rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 24px;
  padding: 7px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }

  span.link {
    color: #fde68a;
    cursor: pointer;
    font-weight: 700;
    text-decoration: none;
    border-bottom: 1px dashed rgba(253, 230, 138, 0.6);
    transition: color 0.15s, border-color 0.15s;
    &:hover {
      color: #fef3c7;
      border-color: #fef3c7;
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

// ── Billing Type Toggle ───────────────────────────────────────────────────────
const BillingTypeToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  border: 1.5px solid #0f766e;
  border-radius: 10px;
  overflow: hidden;
  width: fit-content;
`;

const BillingTypeBtn = styled.button`
  padding: 8px 22px;
  font-size: 0.88rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  background: ${props => props.active ? "linear-gradient(135deg, #0f766e, #0d9488)" : "#ffffff"};
  color: ${props => props.active ? "#ffffff" : "#0f766e"};
  letter-spacing: 0.01em;

  &:hover {
    background: ${props => props.active ? "linear-gradient(135deg, #0f766e, #0d9488)" : "#f0fdfa"};
  }
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

const OPPharmacy = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

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
  const [estimates, setEstimates] = useState([]);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qtyErrors, setQtyErrors] = useState({});
  const [showNilStock, setShowNilStock] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const MODAL_PAGE_SIZE = 9;

  // ── NEW: billing mode state ────────────────────────────────────────────────
  // "Direct" = save as billed directly
  // "Estimate" = save as estimate
  const [billingType, setBillingType] = useState("Direct");

  // ── NEW: loaded estimate tracking (for convert flow) ──────────────────────
  // When user clicks Convert in estimate modal, we store the estimate_no here.
  // This tells the backend: convert this estimate → bill
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
  const [admissionStatus, setAdmissionStatus] = useState("NOT ADMITTED");

  const [isEditMode, setIsEditMode] = useState(false);

  const [recordId, setRecordId] = useState(null);

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

          // ✅ AUTO SET FIRST BILL TYPE
          if (data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              billType: data[0].bill_type,
              billTypeName: data[0].bill_name
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

  // UHID Modal: fetch all patients then filter client-side for partial UHID match
  const handleUHIDSearch = async () => {
    setUhidSearchLoading(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}create/`, "GET");
      const allPatients = res.success && Array.isArray(res.data) ? res.data : [];

      let filtered = allPatients;

      if (uhidSearchInput.trim()) {
        const searchVal = uhidSearchInput.trim().toLowerCase();
        filtered = filtered.filter(p => {
          const uhidStr = (p.uhid || p.UHID || "").toLowerCase();
          return uhidStr.includes(searchVal);
        });
      }

      if (uhidNamePhone.trim()) {
        const nameVal = uhidNamePhone.trim().toLowerCase();
        filtered = filtered.filter(p => {
          const fullName = `${p.salutation || ""} ${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
          const mobile = (p.mobile || p.phone || p.mobileNumber || "").toLowerCase();
          return fullName.includes(nameVal) || mobile.includes(nameVal);
        });
      }

      if (uhidAdmitted) {
        filtered = filtered.filter(p => Boolean(p.ip_number || p.admitted));
      }

      setUhidSearchResults(filtered);
    } catch (err) {
      console.error("UHID search failed", err);
      setUhidSearchResults([]);
    } finally {
      setUhidSearchLoading(false);
    }
  };

  const fetchAdmissionStatus = async (uhid) => {
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}uhidadmissionstatus/?uhid=${uhid}`,
        "GET"
      );

      if (res.success) {
        if (res.data.admitted === true) {
          setAdmissionStatus("ADMITTED");
        } else {
          setAdmissionStatus("NOT ADMITTED");
        }
      }
    } catch (error) {
      console.error("Error fetching admission status:", error);
    }
  };



  const handleUHIDSelect = (p) => {
    const fullName = `${p.salutation || ""} ${p.firstName || ""} ${p.lastName || ""}`.trim();

    setFormData(prev => ({
      ...prev,
      uhid: p.uhid || "",
      name: fullName,
      inpatientNo: p.ip_number || "",
      doctor_id: p.doctor_id || "",
      roomNo: p.room_no || ""
    }));

    setPatientType(p.customer_type || "");
    setAddress(p.permanent_address || "");
    setPlace(p.area || "");

    fetchAdmissionStatus(p.uhid);

    setShowUHIDModal(false);
  };

  const openUHIDModal = () => {
    setUhidSearchInput(formData.uhid || "");
    setUhidNamePhone("");
    setUhidAdmitted(false);
    setUhidSearchResults([]);
    setShowUHIDModal(true);
    setTimeout(() => {
      setUhidSearchLoading(true);
      apiRequest(`${HmsBaseUrl}create/`, "GET")
        .then(res => {
          const allPatients = res.success && Array.isArray(res.data) ? res.data : [];
          const searchVal = (formData.uhid || "").trim().toLowerCase();
          const filtered = searchVal
            ? allPatients.filter(p => (p.uhid || p.UHID || "").toLowerCase().includes(searchVal))
            : allPatients;
          setUhidSearchResults(filtered);
        })
        .catch(() => setUhidSearchResults([]))
        .finally(() => setUhidSearchLoading(false));
    }, 0);
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
        const response = await apiRequest(`${HmsBaseUrl}get_oppharmacy_stock/`, "GET");

        const medicineArray = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        if (response.success && medicineArray.length >= 0) {
          const formattedMedicines = medicineArray.map((item) => ({
            name:
              item.item_name ||
              `${item.item_first_name || ""} ${item.item_last_name || ""}`.trim() ||
              "",
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
            group: item.group || "",
            category: item.category || "",
            classification: item.classification || "PHARMACY",
            dosage: item.dosage || "",
            reorder_level: item.reorder_level || 0,
            total_stock: Number(item.total_stock ?? 0),
            available_stock: item.available_stock != null ? Number(item.available_stock) : null,
            is_low_stock: item.is_low_stock === true,
            is_nil_stock: item.available_stock != null ? Number(item.available_stock) <= 0 : false,
            high_risk: item.high_risk === true,
            look_alike: item.look_alike === true,
            sound_alike: item.sound_alike === true,
            quantity: 0,
            total: 0,
          }));

          setMedicines(formattedMedicines);
        } else {
          console.error("Failed to fetch medicines:", response);
        }
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };

    fetchMedicines();
  }, [HmsBaseUrl]);




  // Unique key per medicine row
  const getMedicineKey = (m) => `${m.item_id}_${m.batch_number}`;

  const handleMedicineInput = (e) => {
    setSearchTerm(e.target.value);
  };

  const openMedicineModal = (term) => {
    const normalizedTerm = (term ?? "").trim().toLowerCase();

    console.log("Search term:", normalizedTerm);
    console.log("Medicines count:", medicines.length);

    const filtered = normalizedTerm
      ? medicines.filter((m) =>
        (m.name || "").toLowerCase().includes(normalizedTerm)
      )
      : medicines;

    console.log("Filtered count:", filtered.length);

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

    // Check if already added to the bill table
    const alreadyInBill = addedMedicines.some((m) => getMedicineKey(m) === key);
    if (alreadyInBill) {
      toast.warning(`"${medicine.name}" is already added to the bill!`);
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

    // Real-time stock excess warning (no clamping — user can still type)
    if (
      medicine.available_stock !== 9999 &&
      medicine.available_stock != null &&
      quantity > medicine.available_stock
    ) {
      toast.warning(
        `"${medicine.name}" has only ${medicine.available_stock} units in stock. Please enter ${medicine.available_stock} or less.`,
        { toastId: `stock-excess-${index}` }
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
        toast.error("Error fetching doctor_names");
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
    setAdmissionStatus("NOT ADMITTED");
    setBillingType("Direct");
    setLoadedEstimateNo(null);
    setRecordId(null);
    setIsEditMode(false);
    setQtyErrors({});
  };

  const handleSave = async (intentStatus) => {

    if (saving) return;

    if (!formData.billType) {
      toast.error("Bill Type is mandatory!");
      return;
    }

    setSaving(true);

    try {
      if (addedMedicines.length === 0) {
        toast.error("Please add at least one medicine!");
        setSaving(false);
        return;
      }

      const errorMap = {};
      addedMedicines.forEach((m, i) => {
        if (!m.quantity || m.quantity <= 0) errorMap[i] = true;
      });

      if (Object.keys(errorMap).length > 0) {
        setQtyErrors(errorMap);
        const first = addedMedicines.find((m) => !m.quantity || m.quantity <= 0);
        toast.error(`Quantity is required for "${first.name}".`);
        setSaving(false);
        return;
      }

      setQtyErrors({});

      const invalidStock = addedMedicines.some(
        (m) => m.available_stock !== 9999 && m.quantity > m.available_stock
      );

      if (invalidStock) {
        toast.error("Quantity exceeds available stock!");
        setSaving(false);
        return;
      }

      // Build medicine_particulars as a plain array of plain objects.
      // Do NOT JSON.stringify here — apiRequest must send Content-Type: application/json
      // so Django REST Framework receives this as a list, not a string.
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

      let status = "";
      let billing_mode = "";

      if (intentStatus === "Estimate") {
        status = "Estimate";
        billing_mode = "ESTIMATE";
      } else {
        status = "Billed";
        billing_mode = loadedEstimateNo ? "ESTIMATE" : "DIRECT";
      }

      const basePayload = {
        status,
        billing_mode,



        patient_name: formData.name,
        bill_date: formData.billDate,
        bill_type: formData.billType,
        bill_name: formData.billTypeName,
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

        net_amount: parseFloat(netAmount.toFixed(2)),
      };

      let response;

      // ======================================================
      // API METHOD DECISION TABLE:
      //
      // Case 1 — Convert to Bill:
      //   intentStatus="Billed" + loadedEstimateNo set + recordId set
      //   → PATCH with Bill_id  (update estimate record → bill)
      //
      // Case 2 — Save Bill (direct, brand new):
      //   intentStatus="Billed" + no loadedEstimateNo + no recordId
      //   → POST
      //
      // Case 3 — Save Estimate again (re-save / edit):
      //   intentStatus="Estimate" + recordId already set from prior save
      //   → PATCH with Bill_id
      //
      // Case 4 — Save Estimate (first time, new):
      //   intentStatus="Estimate" + no recordId
      //   → POST
      // ======================================================

      // ✅ Robust check: treat 0, null, undefined, "" all as "no Bill_id"
      const hasBillId = recordId !== undefined && recordId !== null && recordId !== "" && recordId !== 0;

      console.log(
        "💾 handleSave | intent:", intentStatus,
        "| recordId:", recordId,
        "| hasBillId:", hasBillId,
        "| loadedEstimateNo:", loadedEstimateNo
      );

      if (hasBillId) {
        // Cases 1 & 3: always PATCH when we have a Bill_id
        console.log("PATCH API CALL 🔁 Bill_id:", recordId, "| intent:", intentStatus);

        const patchPayload = {
          ...basePayload,
          Bill_id: parseInt(recordId),
        };

        response = await apiRequest(
          `${HmsBaseUrl}save_oppharmacy_bill/`,
          "PATCH",
          patchPayload
        );
      } else {
        // Cases 2 & 4: POST when no Bill_id exists yet
        console.log("POST API CALL 🆕 | intent:", intentStatus);

        response = await apiRequest(
          `${HmsBaseUrl}save_oppharmacy_bill/`,
          "POST",
          basePayload
        );
      }

      console.log("API RESPONSE:", response);

      // ✅ Store Bill_id from POST response — handles both response shapes:
      //    { success, data: { Bill_id } }  or  { success, Bill_id }
      if (!hasBillId) {
        const newBillId = response?.data?.Bill_id ?? response?.Bill_id ?? null;
        if (newBillId) {
          console.log("✅ New Bill_id stored from POST:", newBillId);
          setRecordId(newBillId);
        }
      }

      if (response.success) {

        if (status === "Estimate") {
          // Case 3 (re-save) or Case 4 (first save) — stay in estimate mode
          const estNo = response.data?.estimate_no || loadedEstimateNo || "";
          setLoadedEstimateNo(estNo);
          setIsEditMode(true);
          toast.success(`Estimate saved! #${estNo}`);

        } else if (loadedEstimateNo) {
          // Case 1 — Convert to Bill succeeded
          toast.success(`Estimate converted to Bill! #${response.data?.bill_no || ""}`);
          resetForm();
          setTodayBillDate();

        } else {
          // Case 2 — Direct bill saved
          toast.success(`Bill saved successfully! #${response.data?.bill_no || ""}`);
          resetForm();
          setTodayBillDate();
        }

      } else {
        toast.error(response.error || "Save failed.");
      }

    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save.");
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



  // ── Fetch Estimates ───────────────────────────────────────────────────────
  const fetchEstimates = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_estimate_bills/`, "GET");

      console.log("Estimate API:", res);

      const data = res.data ?? res;
      setEstimates(Array.isArray(data) ? data : []);
      setShowEstimateModal(true);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (showEstimateModal) {
      fetchEstimates();
    }
  }, [showEstimateModal]);

  // ── Convert Estimate → load into form ────────────────────────────────────
  // Loads the estimate data into the form. recordId = Bill_id ensures PATCH is used.
  // loadedEstimateNo ensures "Convert to Bill" label and correct billing_mode on backend.
  const convertEstimate = (estimate) => {
    // ── Guard: Bill_id must exist (comes from get_estimate_bills API)
    if (!estimate.Bill_id) {
      toast.error("Estimate is missing Bill_id — cannot load.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      name: estimate.patient_name || "",
      uhid: estimate.uhid || "",
      inpatientNo: estimate.inpatient_number || "",
      doctor_id: estimate.doctor_id || "",
      roomNo: estimate.room_no || "",
      billType: estimate.bill_type || "",
      billTypeName: estimate.bill_name || "",
    }));

    // medicine_particulars comes from the backend as an array (JSONField).
    // The typeof string guard below is a safety net only — it should not be needed
    // once apiRequest sends Content-Type: application/json on all PATCH/POST calls.
    let rawMeds = estimate.medicine_particulars || [];
    if (typeof rawMeds === "string") {
      try { rawMeds = JSON.parse(rawMeds); } catch { rawMeds = []; }
    }

    const loadedMedicines = rawMeds.map((m) => {
      const price = parseFloat(m.price || m.Price || m.mrp || 0);
      const qty = parseFloat(m.qty || 0);
      return {
        item_id: m.item_id,
        name: m.item_name || m.name || "",
        batch_number: m.batch_number || "",
        quantity: qty,
        price: price,
        mrp: price,
        total: qty * price,
        // ✅ Sentinel so stock validation passes for loaded estimates
        available_stock: 9999,
        edit_history: m.edit_history || [],
      };
    });

    setAddedMedicines(loadedMedicines);
    setOverallDiscountType(estimate.overall_discount_type || "percent");
    setOverallDiscountValue(
      estimate.overall_discount_value != null ? String(estimate.overall_discount_value) : ""
    );

    // ✅ CRITICAL: Store Bill_id so every subsequent save uses PATCH (not POST)
    setRecordId(estimate.Bill_id);

    // ✅ Store estimate_no so "Convert to Bill" button label shows and backend
    //    sets billing_mode = "ESTIMATE" correctly
    setLoadedEstimateNo(estimate.estimate_no);

    // ✅ Keep billingType as "Estimate" — user can re-save as estimate OR
    //    click the purple "Convert to Bill" button (which calls handleSave("Billed"))
    setBillingType("Estimate");

    setIsEditMode(true);
    setShowEstimateModal(false);

    console.log(
      "✅ Estimate loaded | Bill_id:", estimate.Bill_id,
      "| estimate_no:", estimate.estimate_no
    );
  };
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

  // Label for save button based on current mode
  const saveButtonLabel = () => {

    if (saving) return "Saving...";

    // Loaded estimate
    if (loadedEstimateNo) {
      if (billingType === "Estimate") return "Save Estimate";
      return "Proceed Bill";
    }

    // New
    if (billingType === "Estimate") return "Save Estimate";

    return "Save Bill";
  };

  return (
    <PageWrapper>
      <StyledToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
      <Card>
        {/* ── Header ── */}
        <CardHeader>
          <PageTitle>
            <FaPills />
            Pharmacy Billing
          </PageTitle>
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
        </CardHeader>

        {/* ── Billing Type Toggle ── */}
        <FormSection>
          <SectionLabel>Billing Type</SectionLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <BillingTypeToggle>
              <BillingTypeBtn
                active={billingType === "Direct"}
                onClick={() => {
                  setBillingType("Direct");
                  // If user switches to Direct while in estimate mode, clear loaded estimate
                  if (billingType === "Estimate") setLoadedEstimateNo(null);
                }}
              >
                Direct Billing
              </BillingTypeBtn>
              <BillingTypeBtn
                active={billingType === "Estimate"}
                onClick={() => {
                  setBillingType("Estimate");
                  // setLoadedEstimateNo(null); // estimate save never needs an existing estimate_no
                }}
              >
                Estimate Billing
              </BillingTypeBtn>
            </BillingTypeToggle>

            {/* Show banner if loaded from estimate (convert flow) */}
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
          </div>
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
              <Label>Room No</Label>
              <Input
                type="text"
                name="roomNo"
                placeholder="Enter Room No"
                value={formData.roomNo}
                onChange={handleChange}
              />
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
                value={formData.billTypeName}
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
          </FormRow>
        </FormSection>

        {/* ── Medicine Search ── */}
        <MedicineSearchWrapper>
          <SearchHint>
            <FaSearch style={{ marginRight: 5 }} />
            Type medicine name, then click <strong>Search</strong> or press <strong>Enter</strong> to open results
            {!isMedicineSearchEnabled && <span style={{ color: "#ef4444" }}> — Select Bill Type &amp; Doctor first</span>}
          </SearchHint>
          <SearchInputRow>
            <SearchInputStyled
              type="text"
              placeholder={
                isMedicineSearchEnabled
                  ? "Type medicine name and press Enter or click "
                  : "Select Bill Type and Doctor first"
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
                        ? "#fee2e2"   // 🔴 NIL STOCK
                        : isLowStock
                          ? "#fff7ed"   // 🟠 LOW STOCK
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

                            // Instant stock exceeded warning
                            if (
                              medicine.available_stock !== 9999 &&
                              medicine.available_stock != null &&
                              newQty > medicine.available_stock
                            ) {
                              toast.warning(
                                `"${medicine.name}" has only ${medicine.available_stock} units in stock. Please enter ${medicine.available_stock} or less.`,
                                { toastId: `stock-excess-${index}` }
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

            {/* View Estimate button — always visible */}
            <Button onClick={() => {
              fetchEstimates();
              setShowEstimateModal(true);
            }}>
              View Estimates
            </Button>

            {/* Save Estimate button — always visible */}
            <Button
              primary
              onClick={() => handleSave("Estimate")}
              disabled={saving}
            >
              <FaSave /> {saving ? "Saving..." : "Save Estimate"}
            </Button>

            {/* Save Bill button — always visible */}
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

            <Button onClick={handlePrint}>
              <FaPrint /> Print
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
                                  ? "#fff7ed"   // 🟠 LOW STOCK COLOR
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

      {/* ── View Estimates Modal ── */}
      {showEstimateModal && (
        <ModalOverlay onClick={() => setShowEstimateModal(false)}>
          <ModalContainer style={{ maxWidth: 900 }} onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Active Estimates</ModalTitle>
              <CloseButton onClick={() => setShowEstimateModal(false)}>×</CloseButton>
            </ModalHeader>

            <ModalBody>
              {estimates.length === 0 ? (
                <NoResults>No active estimates found.</NoResults>
              ) : (
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Estimate No</Th>
                        <Th>Patient</Th>
                        <Th>UHID</Th>
                        <Th>Date</Th>
                        <Th>Net Amount</Th>
                        <Th>Action</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {estimates.map((estimate, index) => (
                        <Tr key={index}>
                          <Td style={{ fontWeight: 600 }}>{estimate.estimate_no}</Td>
                          <Td>{estimate.patient_name}</Td>
                          <Td>{estimate.uhid}</Td>
                          <Td style={{ fontSize: "0.82rem", color: "#64748b" }}>
                            {estimate.bill_date
                              ? new Date(estimate.bill_date).toLocaleDateString("en-IN")
                              : estimate.created_date
                                ? new Date(estimate.created_date).toLocaleDateString("en-IN")
                                : "—"}
                          </Td>
                          <Td style={{ fontWeight: 700, color: "#0f766e" }}>
                            ₹{parseFloat(estimate.net_amount || estimate.total_amount || 0).toFixed(2)}
                          </Td>
                          <Td>
                            <Button
                              style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                              onClick={() => convertEstimate(estimate)}
                            >
                              Edit / Convert
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>
              )}
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
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
                          const mobile = p.mobile || p.phone || p.mobileNumber || "";
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

    </PageWrapper>
  );
};

export default OPPharmacy;