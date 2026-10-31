"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import styled from "styled-components"
import JsBarcode from "jsbarcode"
import apiRequest from "../../Auth/apiRequest"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Info,
  User,
  MapPin,
  UserPlus,
  AlertTriangle,
  Baby,
  QrCode,
  List,
  Printer,
  FileText,
  Edit,
  RotateCcw,
  History,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Globe,
  Share2,
  Megaphone
} from "lucide-react"
import ReactSelect from 'react-select'
import ReferenceDoctorForm from "./ReferenceDoctorForm"
import QRRegistrationModal from "./QRRegistrationModal"
import QRRegistrationSidebar from "./QRRegistrationSidebar"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import CreateABHAModal from "./CreateABHAModal"
import { INDIAN_STATES, DISTRICTS_BY_STATE, searchLocations } from "../../data/indiaLocations"

// Modal component for search results and overlays
const Modal = ({ show, onClose, title, children, footer, maxWidth }) => {
  if (!show) return null

  return (
    <ModalOverlay>
      <ModalContainer maxWidth={maxWidth}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </ModalOverlay>
  )
}

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const cleanMobileNumber = (val) => {
  if (!val) return "";
  let s = String(val).trim();
  if (s.startsWith("+91")) s = s.slice(3).trim();
  if (s.startsWith("91") && s.replace(/\D/g, "").length > 10) {
    s = s.slice(2).trim();
  }
  return s.replace(/\D/g, "").slice(0, 10);
};

const getDoctorConsultingFee = (doc, custType) => {
  if (!doc) return 0;
  const isInsurance = (custType || "").toLowerCase() === "insurance";
  if (isInsurance && doc.insuranceConsultingFee !== undefined && doc.insuranceConsultingFee !== null && Number(doc.insuranceConsultingFee) > 0) {
    return Number(doc.insuranceConsultingFee);
  }
  return Number(doc.consultingFee) || 0;
};

const formatDoctorDisplayName = (name) => {
  if (!name) return "Doctor";
  let clean = String(name).trim();
  clean = clean.replace(/^(dr\b\.?|doctor\b\.?)\s*/gi, "").trim();
  while (/^(dr\b\.?|doctor\b\.?)\s*/gi.test(clean)) {
    clean = clean.replace(/^(dr\b\.?|doctor\b\.?)\s*/gi, "").trim();
  }
  return clean ? `Dr. ${clean}` : "Doctor";
};

const getDoctorRawName = (name) => {
  if (!name) return "";
  let clean = String(name).trim();
  clean = clean.replace(/^(dr\b\.?|doctor\b\.?)\s*/gi, "").trim();
  while (/^(dr\b\.?|doctor\b\.?)\s*/gi.test(clean)) {
    clean = clean.replace(/^(dr\b\.?|doctor\b\.?)\s*/gi, "").trim();
  }
  return clean;
};

const PatientRegistrationForm = () => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [modalFilterTerm, setModalFilterTerm] = useState("")
  const [modalSearchLoading, setModalSearchLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [highlightedDoctorIndex, setHighlightedDoctorIndex] = useState(-1)

  // Clock state
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Patient state
  const [patient, setPatient] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    name: "",
    dob: new Date().toISOString().split('T')[0],
    age: "",
    gender: "",
    permanentAddress: "",
    area: "",
    zipcode: "",
    city: "",
    district: "",
    state: "Tamil Nadu",
    email: "",
    mobilePhone: "",
    homePhone: "",
    bloodGroup: "",
    guardianType: "W/o",
    guardianName: "",
    spouseName: "",
    occupation: "",
    annualIncome: "",
    referredBy: "",
    doctorName: "",
    doctorId: "",
    registrationFee: 0,
    consultingFee: 0,
    totalFees: 0,
    mlcType: "",
    mlcDoc: null,
    mlcRemarks: "",
    passAlertToAuthority: false,
    birthTime: "",
    birthTimeAmPm: "AM",
    weight: "",
    weightUnit: "kg",
    mothersUhidNo: "",
    pediatricianResponsible: "",
    emergencyContact: "",
    referredDoctorPhone: "",
    sourceOfVisit: "",
    customerType: "General",
    insuranceProviderCode: "",
    visitType: "New",
    department: "",
    isNewborn: false,
  })

  const [isMlc, setIsMlc] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Search states
  const [uhid, setUhid] = useState("")
  const [ipNumber, setIpNumber] = useState("")
  const [mobile, setMobile] = useState("")
  const [patients, setPatients] = useState([])
  const [motherName, setMotherName] = useState("")
  const [searchDoctorTerm, setSearchDoctorTerm] = useState("")
  const [isRefDoctorDropdownOpen, setIsRefDoctorDropdownOpen] = useState(false)
  const [refDoctorSearchQuery, setRefDoctorSearchQuery] = useState("")
  const [lastUhid, setLastUhid] = useState("")
  const [insuranceProviders, setInsuranceProviders] = useState([])
  const [customerTypes, setCustomerTypes] = useState([])
  const [areaOptions, setAreaOptions] = useState([])

  // Location autocomplete & cascading states
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");

  // Available districts for currently selected state
  const availableDistricts = useMemo(() => {
    const st = patient.state || "Tamil Nadu";
    return DISTRICTS_BY_STATE[st] || [];
  }, [patient.state]);

  // Matching locations based on city search query, district, state
  const matchingLocations = useMemo(() => {
    const q = citySearchQuery !== "" ? citySearchQuery : (patient.city || "");
    return searchLocations(q, patient.state || null, patient.district || null, 30);
  }, [citySearchQuery, patient.city, patient.state, patient.district]);

  // Location handlers
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setPatient(prev => ({
      ...prev,
      state: selectedState,
      district: "",
      city: ""
    }));
    setCitySearchQuery("");
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setPatient(prev => ({
      ...prev,
      district: selectedDistrict,
      state: prev.state || "Tamil Nadu"
    }));
  };

  const handleSelectLocation = (loc) => {
    setPatient(prev => ({
      ...prev,
      city: loc.city,
      district: loc.district,
      state: loc.state
    }));
    setCitySearchQuery("");
    setIsCityDropdownOpen(false);
  };

  const handleCityInputChange = (e) => {
    const val = e.target.value.toUpperCase();
    setCitySearchQuery(val);
    setPatient(prev => ({ ...prev, city: val }));
    setIsCityDropdownOpen(true);
  };

  // Referral Sources configuration
  const REFERRAL_SOURCES = useMemo(() => [
    { id: "walk-in", label: "Walk-in / Direct", icon: "🚶", value: "Direct / Walk-in", defaultRef: "Self / Walk-in" },
    {
      id: "website",
      label: "Website",
      icon: "🌐",
      value: "Website",
      defaultRef: "Website (Hospital Website)",
      subChannels: [
        "Hospital Website",
        "Google Search / Maps",
        "Online Booking Portal",
        "Other Online"
      ]
    },
    {
      id: "social-media",
      label: "Social Media",
      icon: "📱",
      value: "Social Media",
      defaultRef: "Social Media (Instagram)",
      subChannels: [
        "Instagram",
        "Facebook",
        "YouTube",
        "WhatsApp",
        "Twitter / X"
      ]
    },
    {
      id: "advertisement",
      label: "Advertisement",
      icon: "📢",
      value: "Advertisement",
      defaultRef: "Advertisement (Newspaper)",
      subChannels: [
        "Newspaper Ad",
        "Digital Ad",
        "Billboard / Hoarding",
        "TV / Cable Ad",
        "Pamphlet / Flyer"
      ]
    },
    { id: "doctor", label: "Doctor Referral", icon: "🩺", value: "Doctor Referral", defaultRef: "" },
    { id: "friend", label: "Friend / Relative", icon: "👥", value: "Friend / Relative", defaultRef: "Friend / Relative" },
    { id: "camp", label: "Camp / Outreach", icon: "🏕️", value: "Camp / Outreach", defaultRef: "Camp / Outreach" },
    { id: "corporate", label: "Corporate / Insurance", icon: "🏢", value: "Corporate / Insurance", defaultRef: "Corporate / Insurance" },
    { id: "other", label: "Other", icon: "✨", value: "Other", defaultRef: "Other" }
  ], []);

  const handleSelectReferralSource = (sourceItem) => {
    const val = typeof sourceItem === "string" ? sourceItem : sourceItem.value;
    const item = REFERRAL_SOURCES.find(s => s.value === val);

    if (val === "Doctor Referral") {
      const isKnownDoc = allDoctors.some(d => d.name && patient.referredBy && d.name.toLowerCase() === patient.referredBy.toLowerCase());
      setPatient(prev => ({
        ...prev,
        sourceOfVisit: val,
        referredBy: isKnownDoc ? prev.referredBy : "",
        referredDoctorPhone: isKnownDoc ? prev.referredDoctorPhone : ""
      }));
      setRefDoctorSearchQuery(isKnownDoc ? (patient.referredBy || "") : "");
      setSearchDoctorTerm(isKnownDoc ? (patient.referredBy || "") : "");
      setIsRefDoctorDropdownOpen(true);
    } else {
      const defaultRefVal = item ? (item.subChannels ? `${item.value} (${item.subChannels[0]})` : item.defaultRef) : val;
      setPatient(prev => ({
        ...prev,
        sourceOfVisit: val,
        referredBy: defaultRefVal,
        referredDoctorPhone: ""
      }));
      setRefDoctorSearchQuery("");
      setSearchDoctorTerm("");
      setIsRefDoctorDropdownOpen(false);
      if (validationErrors.referredBy) {
        setValidationErrors(prev => ({ ...prev, referredBy: false }));
      }
    }
  };

  const handleSelectSubChannel = (sub) => {
    const currentSource = patient.sourceOfVisit || "Website";
    const refVal = `${currentSource} (${sub})`;
    setPatient(prev => ({
      ...prev,
      referredBy: refVal
    }));
    if (validationErrors.referredBy) {
      setValidationErrors(prev => ({ ...prev, referredBy: false }));
    }
  };

  // Stats State
  const [stats, setStats] = useState({ new_visit: 0, existing_visit: 0, total_visit: 0 });
  const [filterDate, setFilterDate] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [filterDoctor, setFilterDoctor] = useState("");
  const [showVisitList, setShowVisitList] = useState(false);
  const [visitList, setVisitList] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [isDoctorSearching, setIsDoctorSearching] = useState(false);
  const [showABHAModal, setShowABHAModal] = useState(false);
  const [unusedQRCount, setUnusedQRCount] = useState(0);
  const [showEditVisitModal, setShowEditVisitModal] = useState(false);
  const [showRefundVisitModal, setShowRefundVisitModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundRemarks, setRefundRemarks] = useState("Patient Request");
  const [editingDoctor, setEditingDoctor] = useState("");

  // Doctor & Fee states
  const [doctors, setDoctors] = useState([])
  const [referenceDoctors, setReferenceDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState({})
  const [registrationFee, setRegistrationFee] = useState(0)
  const [consultingFee, setConsultingFee] = useState(0)
  const [totalFees, setTotalFees] = useState(0)
  const [includeRegFee, setIncludeRegFee] = useState(false)
  const [includeConsFee, setIncludeConsFee] = useState(true)
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false)
  const doctorDropdownListRef = useRef(null)

  // Auto-scroll dropdown list so highlighted doctor is visible during Up/Down arrow navigation
  useEffect(() => {
    if (isDoctorDropdownOpen && doctorDropdownListRef.current && highlightedDoctorIndex >= 0) {
      const listEl = doctorDropdownListRef.current;
      const itemEl = listEl.children[highlightedDoctorIndex];
      if (itemEl && typeof itemEl.scrollIntoView === "function") {
        itemEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedDoctorIndex, isDoctorDropdownOpen]);

  // Dynamic Required Fields Calculation
  const getRequiredCounts = () => {
    let identityLeft = 0;
    if (!patient.customerType) identityLeft++;
    if (!patient.salutation) identityLeft++;
    if (!patient.firstName) identityLeft++;
    if (!patient.lastName) identityLeft++;
    if (!patient.dob) identityLeft++;
    if (!patient.gender) identityLeft++;

    let addressLeft = 0;
    if (!patient.zipcode) addressLeft++;
    if (!patient.mobilePhone) addressLeft++;
    if (!patient.emergencyContact || cleanMobileNumber(patient.emergencyContact).length !== 10) addressLeft++;

    let doctorLeft = (!patient.doctorId && !patient.doctorName) ? 1 : 0;
    let referredLeft = !patient.referredBy ? 1 : 0;

    return {
      identityLeft,
      addressLeft,
      doctorLeft,
      referredLeft,
      totalLeft: identityLeft + addressLeft + doctorLeft + referredLeft
    };
  };

  const counts = getRequiredCounts();

  const handleQRDataReceived = (data) => {
    setPatient(prev => {
      let updated = { ...prev, ...data };
      if (data.firstName || data.lastName) {
        const f = data.firstName !== undefined ? data.firstName : prev.firstName;
        const l = data.lastName !== undefined ? data.lastName : prev.lastName;
        updated.firstName = f;
        updated.lastName = l;
        updated.name = `${f} ${l}`.trim();
      }
      if (data.dob) updated.age = calculateAgeFromDOB(data.dob);

      if (data.weight) {
        let w = data.weight.toString().trim();
        if (w.endsWith(" kg")) {
          updated.weight = w.replace(" kg", "");
          updated.weightUnit = "kg";
        } else if (w.endsWith(" g")) {
          updated.weight = w.replace(" g", "");
          updated.weightUnit = "g";
        } else {
          updated.weight = w;
        }
      }
      return updated;
    });
  };

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await apiRequest(`${Hmsbaseurl}get-pending-qr-registrations/?status=pending`, "GET");
        if (response.success && Array.isArray(response.data)) {
          setUnusedQRCount(response.data.length);
        }
      } catch (e) { console.error(e); }
    };
    fetchCount();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const query = `fromDate=${filterDate.from}&toDate=${filterDate.to}&doctorId=${filterDoctor}`;
      const result = await apiRequest(`${Hmsbaseurl}patient-registration-stats/?${query}`);
      if (result.success) {
        setStats(result.data);
      }
    };
    fetchStats();
  }, [filterDate, filterDoctor]);

  const handleViewList = async () => {
    const query = `fromDate=${filterDate.from}&toDate=${filterDate.to}&doctorId=${filterDoctor}`;
    const result = await apiRequest(`${Hmsbaseurl}patient-visit-list/?${query}`);
    if (result.success) {
      setVisitList(result.data);
      setShowVisitList(true);
    }
  };

  const handleUpdateVisit = async () => {
    try {
      if (!editingDoctor) {
        alert("Please select a doctor");
        return;
      }
      const doc = doctors.find(d => String(d.id) === String(editingDoctor));
      const regFee = doc && doc.registrationFee !== undefined ? doc.registrationFee : (selectedVisit ? Number(selectedVisit.registrationFee) || 0 : 0);
      const consFee = doc && doc.consultingFee !== undefined ? doc.consultingFee : (selectedVisit ? Number(selectedVisit.consultingFee) || 0 : 0);
      const totalFees = (Number(regFee) || 0) + (Number(consFee) || 0);

      const payload = {
        bill_number: selectedVisit.billNumber,
        doctor_id: editingDoctor,
        doctorName: doc ? doc.name : "",
        registrationFee: regFee,
        consultingFee: consFee,
        totalFees: totalFees
      };

      const result = await apiRequest(`${Hmsbaseurl}update-registration-visit/`, "POST", payload);
      if (result.success) {
        alert("Visit updated successfully");
        setShowEditVisitModal(false);
        handleViewList();
      } else {
        alert(result.error || result.message || "Update failed");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating visit");
    }
  };

  const handleProcessRefund = async () => {
    try {
      if (Number(refundAmount) <= 0) {
        alert("Please enter a valid refund amount");
        return;
      }
      const payload = {
        bill_no: selectedVisit.billNumber,
        uhid: selectedVisit.uhid,
        refund_amount: refundAmount,
        remarks: refundRemarks
      };

      const result = await apiRequest(`${Hmsbaseurl}process-registration-refund/`, "POST", payload);
      if (result.success) {
        alert(`Refund processed successfully. Refund Bill No: ${result.refund_bill_no}`);
        setShowRefundVisitModal(false);
        handleViewList();
      } else {
        alert(result.error || result.message || "Refund failed");
      }
    } catch (e) {
      console.error(e);
      alert("Error processing refund");
    }
  };

  const handlePatientClick = (visit) => {
    setSelectedVisit(visit);
    setShowDetailModal(true);
  };

  const handlePrintSticker = (visit) => {
    if (!visit || !visit.uhid) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    // Generate Code128 Barcode via local JsBarcode synchronously (no CDN required)
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    try {
      JsBarcode(svg, String(visit.uhid || ""), {
        format: "CODE128",
        displayValue: false,
        height: 30,
        width: 1.6,
        margin: 0
      });
    } catch (bcErr) {
      console.error("Barcode generation error:", bcErr);
    }
    const barcodeSvgHtml = new XMLSerializer().serializeToString(svg);
    const hospName = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL";

    const printDocument = iframe.contentWindow.document;
    printDocument.open();
    printDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode Sticker - ${visit.uhid}</title>
          <style>
            @page { size: auto; margin: 0; }
            @media print {
              html, body { margin: 0; padding: 0; }
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 4px 6px;
              width: 55mm;
              max-width: 100%;
              box-sizing: border-box;
              color: #000;
              background-color: #fff;
            }
            .sticker-content {
              width: 100%;
              overflow: hidden;
            }
            .hosp-title {
              font-size: 10px;
              font-weight: 900;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 2px;
              line-height: 1.1;
            }
            .barcode-box {
              text-align: center;
              margin: 2px 0 1px 0;
            }
            .barcode-box svg {
              max-width: 100%;
              height: 28px;
              display: block;
              margin: 0 auto;
            }
            .uhid-txt {
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.5px;
              text-align: center;
              font-family: monospace;
              margin-top: 1px;
            }
            .info-line {
              font-size: 9px;
              line-height: 1.25;
              display: flex;
              justify-content: space-between;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .info-line.bold {
              font-weight: 700;
            }
            .patient-name {
              font-weight: 800;
              font-size: 9.5px;
              text-transform: uppercase;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          </style>
        </head>
        <body>
          <div class="sticker-content">
            <div class="hosp-title">${hospName}</div>
            <div class="barcode-box">
              ${barcodeSvgHtml}
              <div class="uhid-txt">UHID : ${visit.uhid}</div>
            </div>
            <div class="info-line bold">
              <span class="patient-name">${visit.patientName || ''}</span>
              <span>${visit.age !== undefined && visit.age !== null && visit.age !== '' ? `${visit.age}Y` : ''}/${visit.gender ? (String(visit.gender).toUpperCase().startsWith('M') ? 'M' : (String(visit.gender).toUpperCase().startsWith('F') ? 'F' : visit.gender)) : ''}</span>
            </div>
            ${(visit.guardianName || visit.spouseName) ? `
            <div class="info-line">
              <span>${visit.guardianType || 'W/o'}: ${(visit.guardianName || visit.spouseName || '').toUpperCase()}</span>
            </div>` : ''}
            <div class="info-line">
              <span>Dr. ${(visit.doctorName || visit.doctor || '').replace(/^(dr\\b\\.?|doctor\\b\\.?)\\s*/gi, '')}</span>
            </div>
            <div class="info-line">
              <span>Ph: +91${visit.mobile || ''}</span>
              <span>${visit.date || ''}</span>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() {
                if (window.frameElement) window.frameElement.remove();
              }, 1200);
            };
          </script>
        </body>
      </html>
    `);
    printDocument.close();
  };

  const handlePrintBill = (visit) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const printDocument = iframe.contentWindow.document;
    printDocument.open();

    const consFee = parseFloat(visit.consultingFee) || 0;
    const regFee = parseFloat(visit.registrationFee) || 0;
    let sNo = 1;

    printDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Bill</title>
          <style>
            @page { size: auto; margin: 5mm; }
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 10px; background-color: white; width: 320px; }
            .center { text-align: center; }
            .header { font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
            .sub-header { font-size: 12px; margin-bottom: 2px; }
            .bill-type { margin: 8px 0; font-weight: bold; font-size: 14px; }
            .info-table { width: 100%; font-size: 13px; margin-bottom: 10px; }
            .info-table td { padding: 2px 0; vertical-align: top; }
            .info-table td:first-child { width: 90px; }
            .items-table { width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 10px; border-top: 1px solid black; border-bottom: 1px solid black; }
            .items-table th, .items-table td { padding: 5px; text-align: left; }
            .items-table th { border-bottom: 1px solid black; }
            .text-right { text-align: right !important; }
            .totals-table { width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 5px; }
            .totals-table td { padding: 5px; }
            .footer { margin-top: 15px; font-size: 11px; font-style: italic; line-height: 1.3; }
            .signature { margin-top: 20px; display: flex; justify-content: space-between; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="header">SHANMUGA HOSPITAL LIMITED</div>
            <div class="sub-header">51/24. Saradha College Road, Salem - 636007</div>
            <div class="sub-header"><u>CIN: L85110TZ2020PLC033974</u></div>
            <div class="sub-header"><u>GST No : 33ABDCS8326A1ZP</u></div>
            <div class="bill-type">*${visit.paymentMethod} Bill*</div>
          </div>
          <table class="info-table">
            <tr><td>Bill Number</td><td>: ${visit.billNumber || visit.bill_number || visit.bill_no || 'N/A'}</td></tr>
            <tr><td>UHID</td><td>: ${visit.uhid || 'N/A'}</td></tr>
            <tr><td>Bill Date</td><td>: ${visit.date}</td></tr>
            <tr><td>Name</td><td>: ${visit.patientName}</td></tr>
            <tr><td>Doctor</td><td>: ${formatDoctorDisplayName(visit.doctorName || visit.doctor)}</td></tr>
          </table>
          <table class="items-table">
            <thead>
              <tr>
                <th>SlNo</th><th>Description</th><th class="text-right">Qty</th><th class="text-right">Cost</th><th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${consFee > 0 ? "<tr><td>" + (sNo++) + "</td><td>CONSULTATION FEE</td><td class='text-right'>1</td><td class='text-right'>" + consFee.toFixed(2) + "</td><td class='text-right'>" + consFee.toFixed(2) + "</td></tr>" : ""}
              ${regFee > 0 ? "<tr><td>" + (sNo++) + "</td><td>REGISTRATION FEE</td><td class='text-right'>1</td><td class='text-right'>" + regFee.toFixed(2) + "</td><td class='text-right'>" + regFee.toFixed(2) + "</td></tr>" : ""}
              ${(consFee === 0 && regFee === 0 && parseFloat(visit.billAmount) > 0) ? "<tr><td>" + (sNo++) + "</td><td>OTHER FEES</td><td class='text-right'>1</td><td class='text-right'>" + parseFloat(visit.billAmount).toFixed(2) + "</td><td class='text-right'>" + parseFloat(visit.billAmount).toFixed(2) + "</td></tr>" : ""}
            </tbody>
          </table>
          <table class="totals-table">
            <tr>
              <td class="text-right" style="width: 70%; font-weight: bold; padding-right: 15px;">Total</td>
              <td class="text-right" style="width: 10px;">:</td>
              <td class="text-right" style="font-weight: bold;">${parseFloat(visit.billAmount || 0).toFixed(2)}</td>
            </tr>
          </table>
          <div style="border-bottom: 1px solid black; margin: 5px 0;"></div>
          <table class="totals-table">
            <tr>
              <td class="text-right" style="width: 70%; font-weight: bold; padding-right: 15px;">Net Amount</td>
              <td class="text-right" style="width: 10px;">:</td>
              <td class="text-right" style="font-weight: bold;">${parseFloat(visit.billAmount || 0).toFixed(2)}</td>
            </tr>
          </table>
          <div style="border-bottom: 1px solid black; margin: 5px 0;"></div>
          <div class="signature">
            <div>60222</div>
            <div>(Signature)</div>
          </div>
          <div class="footer">
            Health care services provided by a clinical establishment are exempt under Notification No. 12/2017-Central Tax (Rate). This is a GST-Exempt Invoice
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                setTimeout(function() { if(window.frameElement) window.frameElement.remove(); }, 1000);
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printDocument.close();
  };

  useEffect(() => {
    const fetchLastUhid = async () => {
      const result = await apiRequest(`${Hmsbaseurl}get-last-uhid/`);
      if (result.success && result.data && result.data.uhid) {
        setLastUhid(result.data.uhid);
      }
    };
    fetchLastUhid();
  }, []);

  const calculateAgeFromDOB = (dob) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDifference = today.getMonth() - birthDate.getMonth()
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 0 ? age : ""
  }

  const calculateDOBFromAge = (age) => {
    const numericAge = parseInt(age, 10)
    if (isNaN(numericAge) || numericAge < 0) return ""
    const today = new Date()
    const birthYear = today.getFullYear() - numericAge
    return new Date(birthYear, today.getMonth(), today.getDate()).toISOString().split("T")[0]
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: false }))
    }

    if (name === "salutation") {
      let autoGender = undefined;
      const s = String(value).trim().toLowerCase();
      if (s === "mr." || s === "mr") autoGender = "Male";
      else if (s === "mrs." || s === "mrs") autoGender = "Female";
      else if (s === "miss." || s === "miss") autoGender = "Female";
      else if (s === "ms." || s === "ms") autoGender = "Female";
      else if (s === "master") autoGender = "Male";

      setPatient(prev => ({
        ...prev,
        salutation: value,
        ...(autoGender ? { gender: autoGender } : {})
      }));

      if (autoGender && validationErrors.gender) {
        setValidationErrors(prev => ({ ...prev, gender: false }));
      }
      return;
    }

    if (name === "firstName" || name === "lastName") {
      const upperVal = typeof value === "string" ? value.toUpperCase() : value;
      const newPatient = { ...patient, [name]: upperVal }
      const fullName = `${newPatient.firstName || ""} ${newPatient.lastName || ""}`.trim()
      setPatient({ ...newPatient, name: fullName })
    } else if (name === "dob") {
      const calculatedAge = calculateAgeFromDOB(value)
      setPatient({ ...patient, dob: value, age: calculatedAge })
    } else if (name === "age") {
      const calculatedDOB = value !== "" ? calculateDOBFromAge(value) : ""
      setPatient({ ...patient, age: value, dob: calculatedDOB })
    } else if (name === "zipcode") {
      setPatient(prev => ({ ...prev, zipcode: value }))
    } else if (name === "emergencyContact") {
      const cleanEmergency = cleanMobileNumber(value)
      setPatient(prev => ({ ...prev, emergencyContact: cleanEmergency }))
    } else if (name === "mobilePhone") {
      const cleanMobile = cleanMobileNumber(value)
      setPatient(prev => ({ ...prev, mobilePhone: cleanMobile }))
    } else if (type === "checkbox") {
      setPatient({ ...patient, [name]: checked })
    } else if (e.target.tagName === "SELECT" || type === "select-one") {
      // Keep select dropdown values exactly as defined in their option elements
      setPatient({ ...patient, [name]: value })
    } else {
      const upperVal = typeof value === "string" ? value.toUpperCase() : value;
      setPatient({ ...patient, [name]: upperVal })
    }
  }

  const handleFileChange = (e) => {
    setPatient({ ...patient, mlcDoc: e.target.files[0] })
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    const errors = {}

    if (!patient.customerType) errors.customerType = true
    if (patient.customerType === "Insurance" && !patient.insuranceProviderCode) errors.insuranceProviderCode = true
    if (!patient.salutation) errors.salutation = true
    if (!patient.firstName || !patient.firstName.trim()) errors.firstName = true
    if (!patient.lastName || !patient.lastName.trim()) errors.lastName = true
    if (!patient.dob) errors.dob = true
    if (!patient.gender) errors.gender = true
    if (!patient.zipcode || !patient.zipcode.trim()) errors.zipcode = true

    const cleanMobile = (patient.mobilePhone || "").replace(/\D/g, "")
    if (!cleanMobile || cleanMobile.length !== 10) errors.mobilePhone = true

    const cleanEmergency = cleanMobileNumber(patient.emergencyContact)
    if (!cleanEmergency || cleanEmergency.length !== 10) errors.emergencyContact = true
    if (!patient.referredBy || !patient.referredBy.trim()) errors.referredBy = true
    if (!patient.doctorId && !patient.doctorName) errors.consultingDoctor = true

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)

      const fieldOrder = [
        "customerType",
        "insuranceProviderCode",
        "salutation",
        "firstName",
        "lastName",
        "dob",
        "gender",
        "zipcode",
        "mobilePhone",
        "emergencyContact",
        "referredBy",
        "consultingDoctor"
      ]

      const firstErrorKey = fieldOrder.find(k => errors[k])
      if (firstErrorKey) {
        const elementId = firstErrorKey === "referredBy" ? "referredByContainer" : firstErrorKey
        const el = document.getElementById(elementId) || document.getElementById(firstErrorKey)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setTimeout(() => {
            const inputEl = el.tagName === "INPUT" || el.tagName === "SELECT" ? el : el.querySelector("input, select")
            if (inputEl) inputEl.focus()
            else el.focus()
          }, 350)
        }
      }

      toast.error("Please fill all mandatory fields marked in red.")
      return
    }

    setValidationErrors({})

    const confirmResult = await Swal.fire({
      title: 'Confirm Registration Details',
      html: `
        <div style="text-align: left; line-height: 1.6; font-size: 14px;">
          <p><b>Name:</b> ${patient.salutation || ""} ${patient.firstName || ""} ${patient.lastName || ""}</p>
          <p><b>Mobile:</b> ${patient.mobilePhone || "N/A"}</p>
          <p><b>Age:</b> ${patient.age || "N/A"}</p>
          <p><b>DOB:</b> ${patient.dob || "N/A"}</p>
          <p><b>Consulting Doctor:</b> ${patient.doctorName || "N/A"}</p>
          <p><b>Total Fees:</b> ₹${totalFees}</p>
          <p><b>Emergency Contact:</b> ${patient.emergencyContact || "N/A"}</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#004d40',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Register Patient!'
    });

    if (!confirmResult.isConfirmed) return;

    setSubmitting(true)
    try {
      const formData = new FormData()
      const backendKeys = {
        salutation: "salutation",
        permanentAddress: "permanent_address",
        district: "district",
        homePhone: "home_phone",
        bloodGroup: "blood_group",
        guardianType: "guardian_type",
        guardianName: "guardian_name",
        spouseName: "spouse_name",
        mlcType: "mlc_type",
        mlcDoc: "mlc_doc",
        mlcRemarks: "mlc_remarks",
        passAlertToAuthority: "pass_alert_to_authority",
        birthTime: "birth_time",
        birthTimeAmPm: "birth_time_am_pm",
        mothersUhidNo: "mothers_uhid_no",
        pediatricianResponsible: "pediatrician_responsible",
        doctorId: "employeeId",
        emergencyContact: "emergency_contact",
        referredDoctorPhone: "referred_doctor_phone",
        sourceOfVisit: "source_of_visit",
        customerType: "customer_type",
        insuranceProviderCode: "company_code",
        abhaNumber: "abha_number",
      }

      Object.keys(patient).forEach((key) => {
        const backendKey = backendKeys[key] || key
        if (key === "weightUnit") return;
        if (!isMlc && (key.startsWith('mlc') || key === 'passAlertToAuthority')) return;

        if (key === "weight" && patient[key]) {
          const finalWeight = `${patient.weight} ${patient.weightUnit || 'kg'}`;
          formData.append("weight", finalWeight);
        } else if (key === "mlcDoc" && patient[key]) {
          formData.append(backendKey, patient[key])
        } else if (patient[key] !== null && patient[key] !== undefined) {
          formData.append(backendKey, patient[key])
        }
      })

      const result = await apiRequest(`${Hmsbaseurl}patients/register/`, "POST", formData);

      if (result.success) {
        const formattedAddress = [patient.permanentAddress, patient.area, patient.city, patient.district, patient.state, patient.zipcode].filter(Boolean).join(", ");
        const visitObj = {
          uhid: result.data.uhid,
          billNumber: result.data.bill_number,
          patientName: `${patient.salutation} ${patient.firstName} ${patient.lastName}`.trim(),
          age: patient.age,
          gender: patient.gender,
          guardianType: patient.guardianType || "W/o",
          guardianName: patient.guardianName || patient.spouseName || "",
          spouseName: patient.guardianName || patient.spouseName || "",
          address: formattedAddress || patient.permanentAddress,
          mobile: patient.mobilePhone,
          doctorName: patient.doctorName,
          consultingFee: consultingFee,
          registrationFee: registrationFee,
          billAmount: totalFees,
          date: new Date().toLocaleDateString('en-GB'),
          dateTime: new Date().toLocaleString('en-GB'),
          paymentMethod: "Cash"
        };

        // Automatically generate and print the barcode label (Vikas format)
        handlePrintSticker(visitObj);

        // Prompt if staff also wants to print the registration bill
        const resultConfirm = await Swal.fire({
          title: 'Registration Successful!',
          html: `Patient registered with UHID: <strong>${result.data.uhid}</strong><br/><br/>Barcode label sent to printer.<br/>Do you also want to print the OP Bill receipt?`,
          icon: 'success',
          showCancelButton: true,
          confirmButtonColor: '#004d40',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Yes, print bill receipt',
          cancelButtonText: 'No, thanks'
        });

        if (resultConfirm.isConfirmed) {
          handlePrintBill(visitObj);
        } else {
          toast.success("Registration completed!");
        }

        // Reset form
        setPatient({
          salutation: "",
          firstName: "",
          lastName: "",
          name: "",
          dob: "",
          age: "",
          gender: "",
          permanentAddress: "",
          area: "",
          zipcode: "",
          city: "",
          district: "",
          state: "Tamil Nadu",
          email: "",
          mobilePhone: "",
          homePhone: "",
          bloodGroup: "",
          guardianType: "W/o",
          guardianName: "",
          spouseName: "",
          referredBy: "",
          doctorName: "",
          doctorId: "",
          registrationFee: 0,
          consultingFee: 0,
          totalFees: 0,
          mlcType: "",
          mlcDoc: null,
          mlcRemarks: "",
          passAlertToAuthority: false,
          birthTime: "",
          birthTimeAmPm: "AM",
          weight: "",
          weightUnit: "kg",
          mothersUhidNo: "",
          pediatricianResponsible: "",
          emergencyContact: "",
          referredDoctorPhone: "",
          sourceOfVisit: "",
          customerType: "General",
          visitType: "New",
          department: "",
          isNewborn: false,
        })
        setIsMlc(false)
        resetFeeCalculator(true)
      } else {
        alert("Error registering patient: " + (result.error || "Check console for details."))
      }
    } catch (error) {
      console.error("Registration failed:", error)
      alert("An error occurred during registration. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const fetchPatients = async (queryOverride) => {
    const params = new URLSearchParams()
    if (uhid && typeof uhid === "string" && uhid.trim()) params.append("uhid", uhid.trim())
    if (ipNumber && typeof ipNumber === "string" && ipNumber.trim()) params.append("ip_number", ipNumber.trim())
    if (mobile && typeof mobile === "string" && mobile.trim()) params.append("mobile", mobile.trim())

    const customText = typeof queryOverride === "string" ? queryOverride.trim() : ""
    if (customText) {
      params.append("q", customText)
    }

    if (!uhid?.trim() && !ipNumber?.trim() && !mobile?.trim() && !customText) {
      toast.info("Please enter UHID, IP Number, or Mobile (last 4 digits accepted) to search.")
      return
    }

    setModalSearchLoading(true)
    const result = await apiRequest(`${Hmsbaseurl}create/?${params.toString()}`)
    setModalSearchLoading(false)
    if (result.success) {
      setPatients(result.data || [])
      setModalFilterTerm(customText || "")
      setShowSearchModal(true)
    } else {
      toast.error(result.error || "Search failed.")
    }
  }

  const handleModalSearch = async (termToSearch) => {
    const rawTerm = typeof termToSearch === "string" ? termToSearch : (modalFilterTerm || "")
    const term = (typeof rawTerm === "string" ? rawTerm : "").trim()
    if (!term) {
      toast.info("Please enter search text (UHID, IP Number, Mobile, or Name).")
      return
    }
    setModalSearchLoading(true)
    try {
      const result = await apiRequest(`${Hmsbaseurl}create/?q=${encodeURIComponent(term)}`)
      if (result.success) {
        setPatients(result.data || [])
        if ((result.data || []).length === 0) {
          toast.info("No matching patients found.")
        }
      } else {
        toast.error(result.error || "Search failed.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error performing search.")
    } finally {
      setModalSearchLoading(false)
    }
  }

  const filteredModalPatients = useMemo(() => {
    if (!modalFilterTerm || !modalFilterTerm.trim()) return patients
    const term = modalFilterTerm.trim().toLowerCase()
    const isDigits = /^\d+$/.test(term)
    const isShortDigits = isDigits && term.length >= 2 && term.length <= 5

    return patients.filter((p) => {
      const uhidVal = (p.uhid || "").toLowerCase()
      const ipVal = (p.ip_number || "").toLowerCase()
      const mobVal = (p.mobilePhone || "").replace(/\D/g, "")
      const nameVal = `${p.salutation || ""} ${p.firstName || ""} ${p.lastName || ""}`.toLowerCase()

      // When searching 2-5 digits, prioritize suffix matching (last digits)!
      if (isShortDigits) {
        return (
          mobVal.endsWith(term) ||
          uhidVal.endsWith(term) ||
          uhidVal.endsWith(`/${term}`) ||
          ipVal.endsWith(term)
        )
      }

      // 10 digits
      if (isDigits && term.length >= 10) {
        return mobVal.includes(term) || uhidVal.includes(term)
      }

      return (
        uhidVal.includes(term) ||
        ipVal.includes(term) ||
        mobVal.includes(term) ||
        nameVal.includes(term)
      )
    })
  }, [patients, modalFilterTerm])

  const handleSelectPatient = (selectedPatient) => {
    const fullName = `${selectedPatient.salutation || ""} ${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim()
    let parsedWeight = selectedPatient.weight || ""
    let parsedWeightUnit = "kg"
    if (parsedWeight && typeof parsedWeight === 'string') {
      const w = parsedWeight.trim()
      if (w.endsWith(" kg")) {
        parsedWeight = w.replace(" kg", "")
        parsedWeightUnit = "kg"
      } else if (w.endsWith(" g")) {
        parsedWeight = w.replace(" g", "")
        parsedWeightUnit = "g"
      }
    }

    const mappedPatient = {
      ...selectedPatient,
      salutation: selectedPatient.salutation || "",
      firstName: selectedPatient.firstName || selectedPatient.first_name || "",
      lastName: selectedPatient.lastName || selectedPatient.last_name || "",
      dob: selectedPatient.dob || selectedPatient.date_of_birth || "",
      age: selectedPatient.age || "",
      gender: selectedPatient.gender || "",
      permanentAddress: selectedPatient.permanentAddress || selectedPatient.permanent_address || "",
      area: selectedPatient.area || "",
      zipcode: selectedPatient.zipcode || "",
      city: selectedPatient.city || "",
      district: selectedPatient.district || "",
      state: selectedPatient.state || "Tamil Nadu",
      email: selectedPatient.email || "",
      mobilePhone: cleanMobileNumber(selectedPatient.mobilePhone || selectedPatient.mobile_phone || ""),
      homePhone: selectedPatient.homePhone || selectedPatient.home_phone || "",
      bloodGroup: selectedPatient.bloodGroup || selectedPatient.blood_group || "",
      guardianType: selectedPatient.guardian_type || selectedPatient.guardianType || "W/o",
      guardianName: selectedPatient.guardian_name || selectedPatient.guardianName || selectedPatient.spouse_name || selectedPatient.spouseName || "",
      spouseName: selectedPatient.guardian_name || selectedPatient.spouse_name || selectedPatient.spouseName || "",
      occupation: selectedPatient.occupation || "",
      annualIncome: selectedPatient.annualIncome || selectedPatient.annual_income || "",
      referredBy: selectedPatient.referredBy || selectedPatient.referred_by || "",
      referredDoctorPhone: selectedPatient.referredDoctorPhone || selectedPatient.referred_doctor_phone || "",
      sourceOfVisit: selectedPatient.sourceOfVisit || selectedPatient.source_of_visit || "",
      emergencyContact: cleanMobileNumber(selectedPatient.emergencyContact || selectedPatient.emergency_contact || ""),
      customerType: selectedPatient.customerType || selectedPatient.customer_type || "General",
      insuranceProviderCode: selectedPatient.insuranceProviderCode || selectedPatient.company_code || "",
      abhaNumber: selectedPatient.abhaNumber || selectedPatient.abha_number || "",
      weight: parsedWeight,
      weightUnit: parsedWeightUnit,
      name: fullName
    }

    setPatient(mappedPatient)
    if (mappedPatient.emergencyContact && cleanMobileNumber(mappedPatient.emergencyContact).length === 10) {
      setValidationErrors(prev => ({ ...prev, emergencyContact: false }))
    }
    if (selectedPatient.uhid) setUhid(selectedPatient.uhid)
    if (selectedPatient.ip_number) setIpNumber(selectedPatient.ip_number)
    if (selectedPatient.mobilePhone || selectedPatient.mobile_phone) {
      setMobile(cleanMobileNumber(selectedPatient.mobilePhone || selectedPatient.mobile_phone))
    }
    setRefDoctorSearchQuery(selectedPatient.referredBy || selectedPatient.referred_by || "")
    setIsRefDoctorDropdownOpen(false)
    setModalFilterTerm("")
    setShowSearchModal(false)
  }

  const loadDoctors = async () => {
    try {
      const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const result = await apiRequest(`${Hmsbaseurl}doctor_schedule/`);
      const rawList = Array.isArray(result?.data) ? result.data : (Array.isArray(result?.data?.data) ? result.data.data : []);
      if (result?.success && rawList.length > 0) {
        const doctorsData = rawList.map((doctor) => {
          let fullName = (doctor.employeeName || `${doctor.first_name || ""} ${doctor.middle_name || ""} ${doctor.last_name || ""}`).trim();
          if (!fullName) fullName = doctor.employeeId || "Doctor";
          const displayName = formatDoctorDisplayName(fullName);
          const rawName = getDoctorRawName(fullName);
          const isScheduledToday = Boolean(doctor.day_schedule && doctor.day_schedule.includes(todayDay));
          return {
            id: doctor.employeeId,
            employeeId: doctor.employeeId,
            name: displayName,
            rawName: rawName,
            registrationFee: Number.parseFloat(doctor.registration_fee) || 0,
            consultingFee: Number.parseFloat(doctor.consulting_fee) || 0,
            insuranceConsultingFee: Number.parseFloat(doctor.insurance_consulting_fee) || 0,
            specialty: doctor.specialty || doctor.department || "General",
            department: doctor.department || "",
            daySchedule: doctor.day_schedule || [],
            isScheduledToday: isScheduledToday,
            type: "Internal"
          };
        });

        // Sort all doctors strictly in alphabetical order by name (A-Z)
        doctorsData.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

        setDoctors(doctorsData);
      }
    } catch (err) {
      console.error("Error loading doctor schedule:", err);
    }
  };

  const loadReferenceDoctors = async () => {
    try {
      const result = await apiRequest(`${Hmsbaseurl}get-reference-doctors/`);
      if (result?.success) {
        const rawList = Array.isArray(result.data) ? result.data : (Array.isArray(result.data?.data) ? result.data.data : []);
        const formattedRefs = rawList.map((d, idx) => ({
          ...d,
          id: d.id || d.doctor || `ref-${idx}`,
          name: d.doctor || "Doctor",
          type: "Reference"
        }));
        setReferenceDoctors(formattedRefs);
      }
    } catch (err) {
      console.error("Error loading reference doctors:", err);
    }
  };

  const loadInsuranceProviders = async () => {
    try {
      const result = await apiRequest(`${Hmsbaseurl}insurance-providers/`);
      if (result?.success) {
        const fetchedData = result.data?.data || result.data;
        const activeProviders = Array.isArray(fetchedData) ? fetchedData.filter(p => !p.blocked) : [];
        setInsuranceProviders(activeProviders);
      }
    } catch (err) {
      console.error("Error loading insurance providers:", err);
    }
  };

  const loadCustomerTypes = async () => {
    try {
      const result = await apiRequest(`${Hmsbaseurl}customer-types/`);
      if (result?.success) {
        const rawList = Array.isArray(result.data) ? result.data : (Array.isArray(result.data?.data) ? result.data.data : []);
        setCustomerTypes(rawList.filter(t => t.is_active));
      }
    } catch (err) {
      console.error("Error loading customer types:", err);
    }
  };

  useEffect(() => {
    loadDoctors();
    loadReferenceDoctors();
    loadInsuranceProviders();
    loadCustomerTypes();
  }, [])

  const allDoctors = [
    ...doctors.map(d => ({ ...d, label: `${d.name} (Internal)` })),
    ...referenceDoctors.map(d => ({ ...d, label: `${d.name} (${d.qualification || 'Ext'}) - ${d.area || ''}` }))
  ];

  const handleRefDoctorSelect = (doc) => {
    let phone = patient.referredDoctorPhone;
    if (doc.type === "Reference") {
      phone = doc.clinic_phone || doc.mobile1 || doc.mobile || "";
    }
    setPatient(prev => ({
      ...prev,
      referredBy: doc.name,
      referredDoctorPhone: phone
    }));
    setRefDoctorSearchQuery(doc.name);
    setSearchDoctorTerm(doc.name);
    if (validationErrors.referredBy) {
      setValidationErrors(prev => ({ ...prev, referredBy: false }));
    }
    setIsRefDoctorDropdownOpen(false);
  };

  const handleClearRefDoctor = (e) => {
    if (e) e.stopPropagation();
    setPatient(prev => ({
      ...prev,
      referredBy: "",
      referredDoctorPhone: ""
    }));
    setRefDoctorSearchQuery("");
    setSearchDoctorTerm("");
  };

  const filteredDoctors = useMemo(() => {
    const rawQuery = (doctorSearchQuery !== undefined && doctorSearchQuery !== null ? doctorSearchQuery : "").trim();
    if (!isDoctorSearching || !rawQuery) {
      return doctors;
    }
    const q = rawQuery.toLowerCase();
    const cleanQ = q.replace(/^(dr\b\.?|doctor\b\.?)\s*/i, "").trim();

    const scored = [];
    for (const doc of doctors) {
      const docName = (doc.name || "").toLowerCase();
      const rawName = (doc.rawName || "").toLowerCase();
      const specialty = (doc.specialty || "").toLowerCase();
      const dept = (doc.department || "").toLowerCase();
      const empId = String(doc.employeeId || doc.id || "").toLowerCase();

      let score = -1;
      if (cleanQ && rawName.startsWith(cleanQ)) {
        score = 1;
      } else if (cleanQ && docName.startsWith(cleanQ)) {
        score = 2;
      } else if (docName.startsWith(q)) {
        score = 3;
      } else if (cleanQ && (rawName.includes(cleanQ) || docName.includes(cleanQ))) {
        score = 4;
      } else if (docName.includes(q)) {
        score = 5;
      } else if (cleanQ && (specialty.startsWith(cleanQ) || dept.startsWith(cleanQ))) {
        score = 6;
      } else if (specialty.includes(q) || dept.includes(q) || (cleanQ && (specialty.includes(cleanQ) || dept.includes(cleanQ)))) {
        score = 7;
      } else if (empId.includes(q) || (cleanQ && empId.includes(cleanQ))) {
        score = 8;
      }

      if (score !== -1) {
        scored.push({ doc, score });
      }
    }

    scored.sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return a.doc.name.localeCompare(b.doc.name);
    });

    return scored.map(s => s.doc);
  }, [doctors, doctorSearchQuery, isDoctorSearching]);

  const handleDoctorKeyDown = (e) => {
    if (!isDoctorDropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsDoctorSearching(false);
        setIsDoctorDropdownOpen(true);
        setHighlightedDoctorIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedDoctorIndex((prev) => (prev < 0 ? 0 : (prev < filteredDoctors.length - 1 ? prev + 1 : 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedDoctorIndex((prev) => (prev <= 0 ? filteredDoctors.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedDoctorIndex >= 0 && highlightedDoctorIndex < filteredDoctors.length) {
        handleDoctorSelect(filteredDoctors[highlightedDoctorIndex]);
      } else if (filteredDoctors.length > 0) {
        handleDoctorSelect(filteredDoctors[0]);
      }
    } else if (e.key === "Escape") {
      setIsDoctorDropdownOpen(false);
      setIsDoctorSearching(false);
    }
  };

  const handleDoctorChange = (event) => {
    const doctorName = event.target.value.toUpperCase();
    setIsDoctorSearching(true);
    setDoctorSearchQuery(doctorName);
    setPatient(prev => ({ ...prev, doctorName, doctorId: "" }));
    setSelectedDoctor(null);
    setIsDoctorDropdownOpen(true);
    setHighlightedDoctorIndex(0);

    const selected = doctors.find((doctor) =>
      doctor.name.toLowerCase() === doctorName.toLowerCase() ||
      (doctor.rawName && doctor.rawName.toLowerCase() === doctorName.toLowerCase())
    );
    if (selected) {
      handleDoctorSelect(selected);
    } else {
      resetFeeCalculator(false);
    }
  };

  const handleClearDoctor = (e) => {
    if (e) e.stopPropagation();
    resetFeeCalculator(true);
    setSelectedDoctor(null);
    setIsDoctorSearching(false);
    setDoctorSearchQuery("");
    setHighlightedDoctorIndex(-1);
    setIsDoctorDropdownOpen(true);
  };

  const handleDoctorSelect = (selected) => {
    const docFee = getDoctorConsultingFee(selected, patient.customerType);
    const regFee = includeRegFee ? (registrationFee || selected.registrationFee || 0) : 0;
    const consFee = includeConsFee ? docFee : 0;
    const total = regFee + consFee;

    setSelectedDoctor(selected);
    setRegistrationFee(regFee);
    setConsultingFee(consFee);
    setTotalFees(total);
    setDoctorSearchQuery(selected.name);
    setIsDoctorSearching(false);

    setPatient(prev => ({
      ...prev,
      doctorName: selected.name,
      doctorId: selected.id,
      registrationFee: regFee,
      consultingFee: consFee,
      totalFees: total,
    }));
    setHighlightedDoctorIndex(-1);
    setIsDoctorDropdownOpen(false);
    if (validationErrors.consultingDoctor) {
      setValidationErrors(prev => ({ ...prev, consultingDoctor: false }));
    }
  };

  const handleToggleRegFee = (checked) => {
    setIncludeRegFee(checked)
    const effectiveRegFee = checked ? (selectedDoctor.registrationFee || 0) : 0
    setRegistrationFee(effectiveRegFee)
    const newTotal = effectiveRegFee + (includeConsFee ? consultingFee : 0)
    setTotalFees(newTotal)
    setPatient(prev => ({
      ...prev,
      registrationFee: effectiveRegFee,
      totalFees: newTotal
    }))
  }

  const handleToggleConsFee = (checked) => {
    setIncludeConsFee(checked)
    const docFee = getDoctorConsultingFee(selectedDoctor, patient.customerType)
    const effectiveConsFee = checked ? docFee : 0
    setConsultingFee(effectiveConsFee)
    const newTotal = (includeRegFee ? registrationFee : 0) + effectiveConsFee
    setTotalFees(newTotal)
    setPatient(prev => ({
      ...prev,
      consultingFee: effectiveConsFee,
      totalFees: newTotal
    }))
  }

  const handleFeeChange = (feeType, value) => {
    const newFee = Number.parseFloat(value) || 0

    if (feeType === "registration") {
      setRegistrationFee(newFee)
      const newTotal = newFee + (includeConsFee ? consultingFee : 0)
      setTotalFees(newTotal)
      setPatient({
        ...patient,
        registrationFee: newFee,
        totalFees: newTotal,
      })
    } else if (feeType === "consulting") {
      setConsultingFee(newFee)
      const newTotal = (includeRegFee ? registrationFee : 0) + newFee
      setTotalFees(newTotal)
      setPatient({
        ...patient,
        consultingFee: newFee,
        totalFees: newTotal,
      })
    }
  }

  const resetFeeCalculator = (clearName = true) => {
    setSelectedDoctor(null)
    setRegistrationFee(0)
    setConsultingFee(0)
    setTotalFees(0)
    if (clearName) {
      setDoctorSearchQuery("")
      setIsDoctorSearching(false)
    }

    setPatient(prev => ({
      ...prev,
      doctorName: clearName ? "" : prev.doctorName,
      doctorId: "",
      registrationFee: 0,
      consultingFee: 0,
      totalFees: 0,
    }))
  }

  const searchMotherUhid = async () => {
    if (!patient.mothersUhidNo) {
      Swal.fire({
        icon: 'warning',
        title: 'Required',
        text: 'Please enter Mother\'s UHID first.'
      });
      return;
    }

    try {
      const response = await apiRequest(`${Hmsbaseurl}create/?uhid=${patient.mothersUhidNo}`, "GET");
      if (response.success && response.data && response.data.length > 0) {
        const mother = response.data[0];
        const mName = `${mother.salutation || ""} ${mother.firstName || ""} ${mother.lastName || ""}`.trim();
        setMotherName(mName);
        Swal.fire({
          icon: 'success',
          title: 'Mother Found',
          text: `Mother's Name: ${mName}`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        setMotherName("Not Found");
        Swal.fire({
          icon: 'error',
          title: 'Not Found',
          text: 'No patient found with this UHID.'
        });
      }
    } catch (error) {
      setMotherName("Error fetching");
    }
  }

  const clearWholeForm = () => {
    setPatient({
      salutation: "",
      firstName: "",
      lastName: "",
      name: "",
      dob: new Date().toISOString().split('T')[0],
      age: "",
      gender: "",
      permanentAddress: "",
      area: "",
      zipcode: "",
      city: "",
      district: "",
      state: "Tamil Nadu",
      email: "",
      mobilePhone: "",
      homePhone: "",
      bloodGroup: "",
      guardianType: "W/o",
      guardianName: "",
      spouseName: "",
      occupation: "",
      annualIncome: "",
      referredBy: "",
      doctorName: "",
      doctorId: "",
      registrationFee: 0,
      consultingFee: 0,
      totalFees: 0,
      mlcType: "",
      mlcDoc: null,
      mlcRemarks: "",
      passAlertToAuthority: false,
      birthTime: "",
      birthTimeAmPm: "AM",
      weight: "",
      weightUnit: "kg",
      mothersUhidNo: "",
      pediatricianResponsible: "",
      emergencyContact: "",
      referredDoctorPhone: "",
      sourceOfVisit: "",
      customerType: "General",
      insuranceProviderCode: "",
      visitType: "New",
      department: "",
      isNewborn: false,
    });
    setUhid("");
    setIpNumber("");
    setMobile("");
    setRefDoctorSearchQuery("");
    setIsRefDoctorDropdownOpen(false);
    setIsMlc(false);
    resetFeeCalculator(true);
    toast.info("Form cleared");
  };

  return (
    <PageWrapper>
      {/* Top Header Bar */}
      <TopHeaderBar>
        <HeaderLeft>
          <BrandTitle>
            SHANMUGA <span>· FRONT OFFICE</span>
          </BrandTitle>
          <SubBreadcrumb>Patient registration</SubBreadcrumb>
        </HeaderLeft>

        <HeaderRight>
          <StatsPillGroup>
            <StatPill color="#0d9488">
              <span className="label">NEW</span>
              <span className="value">{String(stats.new_visit || 8).padStart(2, '0')}</span>
            </StatPill>
            <StatPill color="#2563eb">
              <span className="label">REVISIT</span>
              <span className="value">{String(stats.existing_visit || 4).padStart(2, '0')}</span>
            </StatPill>
            <StatPill color="#1e293b">
              <span className="label">TOTAL</span>
              <span className="value">{String(stats.total_visit || 12).padStart(2, '0')}</span>
            </StatPill>
            {lastUhid && (
              <StatPill color="#d97706">
                <span className="label">LAST</span>
                <span className="value">{lastUhid}</span>
              </StatPill>
            )}
          </StatsPillGroup>

          <ClockBox>
            <Clock size={14} />
            <span>{currentTime || "10:27:17"}</span>
          </ClockBox>

          <HeaderActionButtons>
            <HeaderBtn onClick={handleViewList}>Visited list</HeaderBtn>
            <HeaderBtn onClick={() => setShowQRModal(true)}>
              <QrCode size={14} />
              QR scan
              {unusedQRCount > 0 && <BadgeDot>{unusedQRCount}</BadgeDot>}
            </HeaderBtn>
            <HeaderBtn onClick={() => setShowABHAModal(true)}>
              <Sparkles size={14} /> Link ABHA
            </HeaderBtn>
          </HeaderActionButtons>
        </HeaderRight>
      </TopHeaderBar>

      {/* Integrated Search / Lookup Row */}
      <LookupPanel>
        <LookupTag>LOOKUP</LookupTag>
        <LookupField>
          <LookupInput
            type="text"
            placeholder="UHID / Last 4 digits"
            value={uhid}
            onChange={(e) => setUhid(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && fetchPatients()}
          />
        </LookupField>
        <LookupField>
          <LookupInput
            type="text"
            placeholder="IP number / Last 4 digits"
            value={ipNumber}
            onChange={(e) => setIpNumber(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && fetchPatients()}
          />
        </LookupField>
        <LookupField>
          <LookupInput
            type="text"
            placeholder="Mobile / Last 4 digits"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPatients()}
          />
        </LookupField>
        <SearchBtn onClick={() => fetchPatients()}>
          <Search size={14} /> Search
        </SearchBtn>
        <ClearBtn onClick={clearWholeForm}>Clear form</ClearBtn>
      </LookupPanel>

      {/* Main Grid Content Area */}
      <MainGrid>
        {/* Left Section: Numbered Collapsible Form Cards */}
        <LeftFormColumn>
          {/* 01 · IDENTITY */}
          <DenseCardSection>
            <CardHeaderRow>
              <CardTitleGroup>
                <SectionNumber>01</SectionNumber>
                <SectionName>IDENTITY</SectionName>
              </CardTitleGroup>
              {counts.identityLeft > 0 ? (
                <RequiredBadge>{counts.identityLeft} required left</RequiredBadge>
              ) : (
                <CompletedBadge><CheckCircle2 size={12} /> Complete</CompletedBadge>
              )}
            </CardHeaderRow>

            <FormGrid columns={3}>
              <FormGroup>
                <FormLabel htmlFor="customerType">Customer type <ReqAsterisk>*</ReqAsterisk></FormLabel>
                <FormSelect
                  id="customerType"
                  name="customerType"
                  $hasError={Boolean(validationErrors.customerType)}
                  value={patient.customerType}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    if (validationErrors.customerType) {
                      setValidationErrors(prev => ({ ...prev, customerType: false }));
                    }
                    const typeObj = customerTypes.find(t => t.type_name === selectedValue);
                    const fee = typeObj ? parseFloat(typeObj.registration_fee) : 0;
                    setRegistrationFee(fee);

                    let newConsFee = consultingFee;
                    if (selectedDoctor && (selectedDoctor.name || selectedDoctor.id)) {
                      const docFee = getDoctorConsultingFee(selectedDoctor, selectedValue);
                      newConsFee = includeConsFee ? docFee : 0;
                      setConsultingFee(newConsFee);
                    }

                    const total = fee + newConsFee;
                    setTotalFees(total);
                    setPatient(prev => ({
                      ...prev,
                      customerType: selectedValue,
                      registrationFee: fee,
                      consultingFee: newConsFee,
                      totalFees: total
                    }));
                  }}
                  required
                >
                  <option value="">Select</option>
                  {customerTypes.map(ct => (
                    <option key={ct.type_id} value={ct.type_name}>{ct.type_name}</option>
                  ))}
                  {customerTypes.length === 0 && (
                    <>
                      <option value="New">New</option>
                      <option value="Insurance">Insurance</option>
                    </>
                  )}
                </FormSelect>
              </FormGroup>

              {patient.customerType === "Insurance" && (
                <FormGroup>
                  <FormLabel htmlFor="insuranceProviderCode">Insurance Provider <ReqAsterisk>*</ReqAsterisk></FormLabel>
                  <FormSelect
                    id="insuranceProviderCode"
                    name="insuranceProviderCode"
                    $hasError={Boolean(validationErrors.insuranceProviderCode)}
                    value={patient.insuranceProviderCode}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Provider</option>
                    {insuranceProviders.map((provider, index) => (
                      <option key={index} value={provider.company_code}>
                        {provider.company_name}
                      </option>
                    ))}
                  </FormSelect>
                </FormGroup>
              )}

              <FormGroup>
                <FormLabel htmlFor="salutation">Salutation <ReqAsterisk>*</ReqAsterisk></FormLabel>
                <FormSelect
                  id="salutation"
                  name="salutation"
                  $hasError={Boolean(validationErrors.salutation)}
                  value={
                    patient.salutation
                      ? (["Mr.", "Mrs.", "Miss", "Ms.", "Dr.", "Master", "Baby"].find(
                        s => s.toLowerCase() === String(patient.salutation).toLowerCase()
                      ) || patient.salutation)
                      : ""
                  }
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Miss">Miss</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Master">Master</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Baby">Baby</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="firstName">First name <ReqAsterisk>*</ReqAsterisk></FormLabel>
                <FormInput
                  type="text"
                  id="firstName"
                  name="firstName"
                  $hasError={Boolean(validationErrors.firstName)}
                  value={patient.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="lastName">Last name <ReqAsterisk>*</ReqAsterisk></FormLabel>
                <FormInput
                  type="text"
                  id="lastName"
                  name="lastName"
                  $hasError={Boolean(validationErrors.lastName)}
                  value={patient.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="dob">Date of birth <ReqAsterisk>*</ReqAsterisk></FormLabel>
                <FormInput
                  type="date"
                  id="dob"
                  name="dob"
                  $hasError={Boolean(validationErrors.dob)}
                  value={patient.dob}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="age">Age</FormLabel>
                <FormInput
                  type="number"
                  id="age"
                  name="age"
                  value={patient.age !== undefined && patient.age !== null ? patient.age : ""}
                  onChange={handleChange}
                  placeholder="Enter age"
                  min="0"
                  max="120"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="gender">Gender <ReqAsterisk>*</ReqAsterisk></FormLabel>
                <FormSelect
                  id="gender"
                  name="gender"
                  $hasError={Boolean(validationErrors.gender)}
                  value={
                    patient.gender
                      ? (String(patient.gender).toLowerCase() === "male"
                        ? "Male"
                        : String(patient.gender).toLowerCase() === "female"
                          ? "Female"
                          : String(patient.gender).toLowerCase() === "other"
                            ? "Other"
                            : patient.gender)
                      : ""
                  }
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="bloodGroup">Blood group</FormLabel>
                <FormSelect
                  id="bloodGroup"
                  name="bloodGroup"
                  value={patient.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="guardianName">Guardian</FormLabel>
                <GuardianInputWrapper>
                  <GuardianTypeSelect
                    id="guardianType"
                    name="guardianType"
                    value={patient.guardianType || "W/o"}
                    onChange={handleChange}
                    title="Guardian Relation"
                  >
                    <option value="S/o">S/o</option>
                    <option value="W/o">W/o</option>
                    <option value="D/o">D/o</option>
                    <option value="C/o">C/o</option>
                    <option value="H/o">H/o</option>
                  </GuardianTypeSelect>
                  <GuardianNameInput
                    type="text"
                    id="guardianName"
                    name="guardianName"
                    value={patient.guardianName || patient.spouseName || ""}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setPatient(prev => ({
                        ...prev,
                        guardianName: val,
                        spouseName: val
                      }));
                    }}
                    placeholder="Guardian / Spouse name"
                  />
                </GuardianInputWrapper>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="occupation">Occupation</FormLabel>
                <FormSelect
                  id="occupation"
                  name="occupation"
                  value={patient.occupation || ""}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Government / Public Sector">Government / Public Sector</option>
                  <option value="Private Sector">Private Sector</option>
                  <option value="Business / Self-Employed">Business / Self-Employed</option>
                  <option value="Professional">Professional</option>
                  <option value="Agriculture / Farmer">Agriculture / Farmer</option>
                  <option value="Daily Wage / Laborer">Daily Wage / Laborer</option>
                  <option value="Student">Student</option>
                  <option value="Homemaker">Homemaker</option>
                  <option value="Retired">Retired</option>
                  <option value="Others">Others</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="annualIncome">Yearly income</FormLabel>
                <FormSelect
                  id="annualIncome"
                  name="annualIncome"
                  value={patient.annualIncome}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Below ₹ 1 Lakh">Below ₹ 1 Lakh</option>
                  <option value="₹ 1 Lakh - ₹ 3 Lakhs">₹ 1 Lakh - ₹ 3 Lakhs</option>
                  <option value="₹ 3 Lakhs - ₹ 5 Lakhs">₹ 3 Lakhs - ₹ 5 Lakhs</option>
                  <option value="₹ 5 Lakhs - ₹ 10 Lakhs">₹ 5 Lakhs - ₹ 10 Lakhs</option>
                  <option value="Above ₹ 10 Lakhs">Above ₹ 10 Lakhs</option>
                </FormSelect>
              </FormGroup>
            </FormGrid>
          </DenseCardSection>

          {/* 02 · ADDRESS & CONTACT */}
          <DenseCardSection>
            <CardHeaderRow>
              <CardTitleGroup>
                <SectionNumber>02</SectionNumber>
                <SectionName>ADDRESS & CONTACT</SectionName>
              </CardTitleGroup>
              {counts.addressLeft > 0 ? (
                <RequiredBadge>{counts.addressLeft} required left</RequiredBadge>
              ) : (
                <CompletedBadge><CheckCircle2 size={12} /> Complete</CompletedBadge>
              )}
            </CardHeaderRow>

            <FormGrid columns={3}>
              <FormGroup className="full-width">
                <FormLabel htmlFor="permanentAddress">Permanent address</FormLabel>
                <FormInput
                  type="text"
                  id="permanentAddress"
                  name="permanentAddress"
                  value={patient.permanentAddress}
                  onChange={handleChange}
                  placeholder="Door no, street"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="area">Area</FormLabel>
                <FormInput
                  list="area-options"
                  type="text"
                  id="area"
                  name="area"
                  value={patient.area}
                  onChange={handleChange}
                  placeholder="Area"
                />
                {areaOptions.length > 0 && (
                  <datalist id="area-options">
                    {areaOptions.map((areaName, idx) => (
                      <option key={idx} value={areaName} />
                    ))}
                  </datalist>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="zipcode">Post code <ReqAsterisk>*</ReqAsterisk></FormLabel>
                <FormInput
                  type="text"
                  id="zipcode"
                  name="zipcode"
                  $hasError={Boolean(validationErrors.zipcode)}
                  value={patient.zipcode}
                  onChange={handleChange}
                  placeholder="6 digits"
                  maxLength={6}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="state">State</FormLabel>
                <FormSelect
                  id="state"
                  name="state"
                  value={patient.state || "Tamil Nadu"}
                  onChange={handleStateChange}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="district">District</FormLabel>
                <FormSelect
                  id="district"
                  name="district"
                  value={patient.district || ""}
                  onChange={handleDistrictChange}
                >
                  <option value="">Select District</option>
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="city">
                  City / Taluk
                  {patient.city && (
                    <span style={{ fontSize: '10px', color: '#004d40', marginLeft: '6px', fontWeight: '500' }}>
                      ({patient.district || "District"}, {patient.state || "State"})
                    </span>
                  )}
                </FormLabel>
                <SearchableSelectWrapper>
                  <FormInput
                    type="text"
                    id="city"
                    name="city"
                    value={citySearchQuery !== "" ? citySearchQuery : (patient.city || "")}
                    onChange={handleCityInputChange}
                    onFocus={() => setIsCityDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsCityDropdownOpen(false), 250)}
                    placeholder="Search city/taluk (e.g. Salem, Sankagiri, Namakkal)..."
                    autoComplete="off"
                    style={{ paddingRight: patient.city ? '28px' : '8px' }}
                  />
                  {patient.city && (
                    <ClearRefDoctorBtn
                      type="button"
                      onClick={() => {
                        setPatient(prev => ({ ...prev, city: "", district: "" }));
                        setCitySearchQuery("");
                      }}
                      title="Clear city"
                    >
                      <X size={14} />
                    </ClearRefDoctorBtn>
                  )}
                  {isCityDropdownOpen && (
                    <LightDropdownList>
                      {matchingLocations.map((loc, idx) => (
                        <LightDropdownItem key={idx} onMouseDown={() => handleSelectLocation(loc)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', color: '#111827', fontSize: '12px' }}>
                              {loc.city}
                            </span>
                            <LocationBadge>
                              {loc.district}, {loc.state}
                            </LocationBadge>
                          </div>
                          {loc.aliases && loc.aliases.length > 0 && (
                            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                              Also known as: {loc.aliases.join(", ")}
                            </div>
                          )}
                        </LightDropdownItem>
                      ))}
                      {matchingLocations.length === 0 && (
                        <div style={{ padding: '8px 12px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                          No predefined location found. Type freely to enter a custom city or village.
                        </div>
                      )}
                    </LightDropdownList>
                  )}
                </SearchableSelectWrapper>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormInput
                  type="email"
                  id="email"
                  name="email"
                  value={patient.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="mobilePhone">Mobile phone <ReqAsterisk>*</ReqAsterisk></FormLabel>
                <PhoneInputWrapper id="mobilePhoneWrapper" $hasError={Boolean(validationErrors.mobilePhone)}>
                  <CountryCodePrefix>+91</CountryCodePrefix>
                  <PhoneInput
                    type="text"
                    id="mobilePhone"
                    name="mobilePhone"
                    value={cleanMobileNumber(patient.mobilePhone)}
                    onChange={(e) => {
                      const val = cleanMobileNumber(e.target.value);
                      if (validationErrors.mobilePhone) {
                        setValidationErrors(prev => ({ ...prev, mobilePhone: false }));
                      }
                      setPatient(prev => ({ ...prev, mobilePhone: val }));
                    }}
                    placeholder="10 digit mobile number"
                    maxLength={10}
                    required
                  />
                </PhoneInputWrapper>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="homePhone">Home phone</FormLabel>
                <FormInput
                  type="text"
                  id="homePhone"
                  name="homePhone"
                  value={patient.homePhone}
                  onChange={handleChange}
                  placeholder="Landline"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="emergencyContact">Emergency contact <ReqAsterisk>*</ReqAsterisk></FormLabel>
                <FormInput
                  type="tel"
                  id="emergencyContact"
                  name="emergencyContact"
                  $hasError={Boolean(validationErrors.emergencyContact)}
                  value={cleanMobileNumber(patient.emergencyContact)}
                  onChange={handleChange}
                  placeholder="10-digit emergency number"
                  maxLength={10}
                  inputMode="numeric"
                  required
                />
              </FormGroup>
            </FormGrid>
          </DenseCardSection>

          {/* 03 · REFERRAL */}
          <DenseCardSection>
            <CardHeaderRow>
              <CardTitleGroup>
                <SectionNumber>03</SectionNumber>
                <SectionName>REFERRAL</SectionName>
              </CardTitleGroup>
              <InfoBadge>{patient.sourceOfVisit || "Select referral channel"}</InfoBadge>
            </CardHeaderRow>

            {/* Quick Referral Source Chips */}
            <ReferralChipContainer>
              {REFERRAL_SOURCES.map((source) => {
                const isActive = patient.sourceOfVisit === source.value ||
                  (!patient.sourceOfVisit && source.value === "Direct / Walk-in");
                return (
                  <ReferralChip
                    key={source.id}
                    type="button"
                    $active={isActive}
                    onClick={() => handleSelectReferralSource(source)}
                  >
                    <span>{source.icon}</span>
                    <span>{source.label}</span>
                  </ReferralChip>
                );
              })}
            </ReferralChipContainer>

            {/* Sub-channel pills when Website, Social Media, or Advertisement is selected */}
            {(() => {
              const currentSourceObj = REFERRAL_SOURCES.find(s => s.value === patient.sourceOfVisit);
              if (currentSourceObj && currentSourceObj.subChannels) {
                return (
                  <SubChannelPillContainer>
                    <SubChannelPillLabel>
                      {currentSourceObj.label} Channel:
                    </SubChannelPillLabel>
                    {currentSourceObj.subChannels.map((sub, sIdx) => {
                      const isActive = (patient.referredBy || "").includes(sub);
                      return (
                        <SubChannelPill
                          key={sIdx}
                          type="button"
                          $active={isActive}
                          onClick={() => handleSelectSubChannel(sub)}
                        >
                          {sub}
                        </SubChannelPill>
                      );
                    })}
                  </SubChannelPillContainer>
                );
              }
              return null;
            })()}

            <FormGrid columns={2}>
              <FormGroup>
                <FormLabel htmlFor="sourceOfVisit">Source of visit / Referral Channel</FormLabel>
                <FormSelect
                  id="sourceOfVisit"
                  name="sourceOfVisit"
                  value={patient.sourceOfVisit || ""}
                  onChange={(e) => handleSelectReferralSource(e.target.value)}
                >
                  <option value="">Select source of visit</option>
                  {REFERRAL_SOURCES.map((s) => (
                    <option key={s.id} value={s.value}>{s.label}</option>
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="referredBy">
                  {patient.sourceOfVisit === "Doctor Referral" ? "Referring Doctor / Hospital" : "Referred by / Referral Detail"}{" "}
                  <ReqAsterisk>*</ReqAsterisk>
                </FormLabel>
                {patient.sourceOfVisit === "Doctor Referral" ? (
                  <InputGroupInline id="referredByContainer">
                    <SearchableSelectWrapper style={{ flex: 1 }}>
                      <FormInput
                        type="text"
                        id="referredBy"
                        name="referredBy"
                        placeholder="Search or select doctor / hospital"
                        value={patient.referredBy || ""}
                        $hasError={Boolean(validationErrors.referredBy)}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setRefDoctorSearchQuery(val);
                          setPatient(prev => ({ ...prev, referredBy: val }));
                          setSearchDoctorTerm(val);
                          if (validationErrors.referredBy) {
                            setValidationErrors(prev => ({ ...prev, referredBy: false }));
                          }
                          setIsRefDoctorDropdownOpen(true);
                        }}
                        onFocus={() => setIsRefDoctorDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsRefDoctorDropdownOpen(false), 250)}
                        style={{ paddingRight: patient.referredBy ? '28px' : '8px' }}
                        autoComplete="off"
                      />
                      {patient.referredBy && (
                        <ClearRefDoctorBtn onClick={handleClearRefDoctor} type="button" title="Clear doctor">
                          <X size={14} />
                        </ClearRefDoctorBtn>
                      )}
                      {isRefDoctorDropdownOpen && (
                        <LightDropdownList>
                          {allDoctors
                            .filter(doc => {
                              const query = (refDoctorSearchQuery || patient.referredBy || "").toLowerCase();
                              if (!query) return true;
                              const name = (doc.name || "").toLowerCase();
                              const qual = (doc.qualification || doc.specialty || "").toLowerCase();
                              const area = (doc.area || "").toLowerCase();
                              const clinic = (doc.clinic_name || "").toLowerCase();
                              return name.includes(query) || qual.includes(query) || area.includes(query) || clinic.includes(query);
                            })
                            .map((doc, index) => (
                              <LightDropdownItem key={index} onMouseDown={() => handleRefDoctorSelect(doc)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontWeight: '600', color: '#111827', fontSize: '12px' }}>{doc.name}</span>
                                  <DoctorTypeTag isRef={doc.type === "Reference"}>
                                    {doc.type === "Reference" ? "External" : "Internal"}
                                  </DoctorTypeTag>
                                </div>
                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                  {[doc.qualification || doc.specialty, doc.area, doc.clinic_name].filter(Boolean).join(" · ")}
                                </div>
                              </LightDropdownItem>
                            ))}
                          {allDoctors.filter(doc => {
                            const query = (refDoctorSearchQuery || patient.referredBy || "").toLowerCase();
                            if (!query) return true;
                            const name = (doc.name || "").toLowerCase();
                            const qual = (doc.qualification || doc.specialty || "").toLowerCase();
                            const area = (doc.area || "").toLowerCase();
                            const clinic = (doc.clinic_name || "").toLowerCase();
                            return name.includes(query) || qual.includes(query) || area.includes(query) || clinic.includes(query);
                          }).length === 0 && (
                              <div style={{ padding: '10px 12px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                                No matching doctor. Type freely or click + to add.
                              </div>
                            )}
                        </LightDropdownList>
                      )}
                    </SearchableSelectWrapper>
                    <AddDoctorBtn type="button" onClick={() => setIsModalOpen(true)} title="Add Ref Doctor">
                      <Plus size={14} />
                    </AddDoctorBtn>
                  </InputGroupInline>
                ) : (
                  <SearchableSelectWrapper>
                    <FormInput
                      type="text"
                      id="referredBy"
                      name="referredBy"
                      placeholder="e.g. Website, Social Media, Self, Friend"
                      value={patient.referredBy || ""}
                      $hasError={Boolean(validationErrors.referredBy)}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setPatient(prev => ({ ...prev, referredBy: val }));
                        if (validationErrors.referredBy) {
                          setValidationErrors(prev => ({ ...prev, referredBy: false }));
                        }
                      }}
                    />
                    {patient.referredBy && (
                      <ClearRefDoctorBtn
                        type="button"
                        onClick={() => setPatient(prev => ({ ...prev, referredBy: "" }))}
                        title="Clear"
                      >
                        <X size={14} />
                      </ClearRefDoctorBtn>
                    )}
                  </SearchableSelectWrapper>
                )}
              </FormGroup>

              {patient.sourceOfVisit === "Doctor Referral" && (
                <FormGroup>
                  <FormLabel htmlFor="referredDoctorPhone">Referred doctor phone</FormLabel>
                  <FormInput
                    type="text"
                    id="referredDoctorPhone"
                    name="referredDoctorPhone"
                    value={patient.referredDoctorPhone}
                    onChange={handleChange}
                    placeholder="Optional 10-digit phone"
                    maxLength={10}
                  />
                </FormGroup>
              )}

              <FormGroup className={patient.sourceOfVisit === "Doctor Referral" ? "" : "span-two"}>
                <CheckboxCard>
                  <input
                    type="checkbox"
                    id="isMlc"
                    checked={isMlc}
                    onChange={(e) => setIsMlc(e.target.checked)}
                  />
                  <label htmlFor="isMlc">Medico-legal case (MLC)</label>
                </CheckboxCard>
              </FormGroup>
            </FormGrid>

            {/* Extended MLC Drawer */}
            {isMlc && (
              <MlcDrawer>
                <DrawerTitle><AlertTriangle size={14} color="#d97706" /> MLC Case Information</DrawerTitle>
                <FormGrid columns={3}>
                  <FormGroup>
                    <FormLabel>MLC Type</FormLabel>
                    <FormSelect name="mlcType" value={patient.mlcType} onChange={handleChange}>
                      <option value="">Select MLC Type</option>
                      <option value="RTA">RTA (Road Traffic Accident)</option>
                      <option value="Assault">Assault</option>
                      <option value="Poisoning">Poisoning</option>
                      <option value="Burns">Burns</option>
                      <option value="Fall">Fall</option>
                      <option value="Electric Shock">Electric Shock</option>
                      <option value="Drowning">Drowning</option>
                      <option value="Suicide">Suicide Attempt</option>
                      <option value="Other">Other</option>
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>MLC Document</FormLabel>
                    <FormInput type="file" name="mlcDoc" onChange={handleFileChange} />
                  </FormGroup>

                  <FormGroup className="full-width">
                    <CheckboxCard>
                      <input
                        type="checkbox"
                        id="passAlertToAuthority"
                        name="passAlertToAuthority"
                        checked={patient.passAlertToAuthority}
                        onChange={handleChange}
                      />
                      <label htmlFor="passAlertToAuthority">Pass alert to authority</label>
                    </CheckboxCard>
                  </FormGroup>

                  <FormGroup className="full-width">
                    <FormLabel>MLC Remarks</FormLabel>
                    <FormInput
                      type="text"
                      name="mlcRemarks"
                      value={patient.mlcRemarks}
                      onChange={handleChange}
                      placeholder="Enter remarks..."
                    />
                  </FormGroup>
                </FormGrid>
              </MlcDrawer>
            )}
          </DenseCardSection>

          {/* 04 · NEWBORN */}
          <DenseCardSection>
            <CardHeaderRow>
              <CardTitleGroup>
                <SectionNumber>04</SectionNumber>
                <SectionName>NEWBORN</SectionName>
              </CardTitleGroup>
              <CheckboxInline>
                <input
                  type="checkbox"
                  id="isNewborn"
                  name="isNewborn"
                  checked={patient.isNewborn}
                  onChange={handleChange}
                />
                <label htmlFor="isNewborn">This is a newborn</label>
              </CheckboxInline>
            </CardHeaderRow>

            {patient.isNewborn && (
              <FormGrid columns={3} style={{ marginTop: '14px' }}>
                <FormGroup>
                  <FormLabel>Mother's UHID</FormLabel>
                  <InputGroupInline>
                    <FormInput
                      type="text"
                      name="mothersUhidNo"
                      value={patient.mothersUhidNo}
                      onChange={handleChange}
                      placeholder="Mother's UHID"
                    />
                    <AddDoctorBtn type="button" onClick={searchMotherUhid}>
                      <Search size={14} />
                    </AddDoctorBtn>
                  </InputGroupInline>
                  {motherName && (
                    <SubTextStatus isError={motherName === 'Not Found' || motherName === 'Error fetching'}>
                      {motherName}
                    </SubTextStatus>
                  )}
                </FormGroup>

                <FormGroup>
                  <FormLabel>Birth Time</FormLabel>
                  <InputGroupInline>
                    <FormInput
                      type="time"
                      name="birthTime"
                      value={patient.birthTime}
                      onChange={handleChange}
                    />
                    <FormSelect
                      name="birthTimeAmPm"
                      value={patient.birthTimeAmPm}
                      onChange={handleChange}
                      style={{ width: '70px' }}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </FormSelect>
                  </InputGroupInline>
                </FormGroup>

                <FormGroup>
                  <FormLabel>Birth Weight</FormLabel>
                  <InputGroupInline>
                    <FormInput
                      type="number"
                      name="weight"
                      value={patient.weight}
                      onChange={handleChange}
                      placeholder="Weight"
                      step="any"
                    />
                    <FormSelect
                      name="weightUnit"
                      value={patient.weightUnit}
                      onChange={handleChange}
                      style={{ width: '70px' }}
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                    </FormSelect>
                  </InputGroupInline>
                </FormGroup>

                <FormGroup className="full-width">
                  <FormLabel>Pediatrician Responsible</FormLabel>
                  <ReactSelect
                    value={patient.pediatricianResponsible ? { label: patient.pediatricianResponsible, value: patient.pediatricianResponsible } : null}
                    onChange={(selected) => setPatient(prev => ({ ...prev, pediatricianResponsible: selected ? selected.value : "" }))}
                    options={doctors.map(d => ({ label: d.name, value: d.name }))}
                    placeholder="Select Pediatrician"
                    isClearable
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        borderRadius: '6px',
                        borderColor: '#d1d5db',
                        minHeight: '38px',
                        fontSize: '13px'
                      })
                    }}
                  />
                </FormGroup>
              </FormGrid>
            )}
          </DenseCardSection>
        </LeftFormColumn>

        {/* Right Sidebar Column */}
        <RightSidebarColumn>
          {/* FEE CALCULATOR CARD */}
          <DarkFeeCard>
            <FeeCardHeader>FEE CALCULATOR</FeeCardHeader>

            <FeeFieldGroup>
              <FeeLabel htmlFor="consultingDoctor">Consulting doctor <ReqAsterisk>*</ReqAsterisk></FeeLabel>
              <SearchableSelectWrapper>
                <FeeSelectInput
                  type="text"
                  id="consultingDoctor"
                  $hasError={Boolean(validationErrors.consultingDoctor)}
                  placeholder="Search or select doctor"
                  value={doctorSearchQuery !== "" ? doctorSearchQuery : (patient.doctorName || "")}
                  onChange={handleDoctorChange}
                  onKeyDown={handleDoctorKeyDown}
                  onFocus={(e) => {
                    setIsDoctorSearching(false);
                    setIsDoctorDropdownOpen(true);
                    if (highlightedDoctorIndex < 0 && filteredDoctors.length > 0) {
                      setHighlightedDoctorIndex(0);
                    }
                    e.target.select();
                  }}
                  onClick={(e) => {
                    setIsDoctorSearching(false);
                    setIsDoctorDropdownOpen(true);
                    if (highlightedDoctorIndex < 0 && filteredDoctors.length > 0) {
                      setHighlightedDoctorIndex(0);
                    }
                    e.target.select();
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setIsDoctorDropdownOpen(false);
                      setIsDoctorSearching(false);
                    }, 250);
                  }}
                  style={{ paddingRight: (patient.doctorName || doctorSearchQuery) ? '28px' : '8px' }}
                  autoComplete="off"
                />
                {(patient.doctorName || doctorSearchQuery) && (
                  <ClearDoctorBtn onClick={handleClearDoctor} type="button" title="Change or clear doctor">
                    <X size={14} />
                  </ClearDoctorBtn>
                )}
                {isDoctorDropdownOpen && (
                  <DarkDropdownList ref={doctorDropdownListRef}>
                    {filteredDoctors.map((doctor, index) => (
                      <DarkDropdownItem
                        key={doctor.id || index}
                        $isHighlighted={highlightedDoctorIndex === index}
                        onMouseDown={() => handleDoctorSelect(doctor)}
                        onMouseEnter={() => setHighlightedDoctorIndex(index)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '600' }}>{doctor.name}</span>
                          {doctor.isScheduledToday && (
                            <span style={{ fontSize: '10px', color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '1px 5px', borderRadius: '3px' }}>
                              Today
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                          {[
                            doctor.specialty || doctor.department,
                            (patient.customerType || "").toLowerCase() === "insurance" && Number(doctor.insuranceConsultingFee) > 0
                              ? `Insurance Consulting: ₹${doctor.insuranceConsultingFee}`
                              : `Consulting: ₹${doctor.consultingFee || 0}`
                          ].filter(Boolean).join(" · ")}
                        </div>
                      </DarkDropdownItem>
                    ))}
                    {filteredDoctors.length === 0 && (
                      <DarkDropdownItem style={{ color: '#9ca3af', cursor: 'default' }}>No doctors found</DarkDropdownItem>
                    )}
                  </DarkDropdownList>
                )}
              </SearchableSelectWrapper>
            </FeeFieldGroup>

            <FeeCheckboxRow>
              <label>
                <input
                  type="checkbox"
                  checked={includeRegFee}
                  onChange={(e) => handleToggleRegFee(e.target.checked)}
                />
                <span>Registration fee ₹</span>
              </label>
              <FeeInputBox
                type="number"
                disabled={!includeRegFee}
                value={includeRegFee ? registrationFee : 0}
                onChange={(e) => handleFeeChange("registration", e.target.value)}
              />
            </FeeCheckboxRow>

            <FeeCheckboxRow>
              <label>
                <input
                  type="checkbox"
                  checked={includeConsFee}
                  onChange={(e) => handleToggleConsFee(e.target.checked)}
                />
                <span>Consulting fee ₹</span>
              </label>
              <FeeInputBox
                type="number"
                disabled={!includeConsFee}
                value={includeConsFee ? consultingFee : 0}
                onChange={(e) => handleFeeChange("consulting", e.target.value)}
              />
            </FeeCheckboxRow>

            <TotalFeeDisplayRow>
              <span className="label">Total fees</span>
              <span className="amount">₹{totalFees}</span>
            </TotalFeeDisplayRow>
          </DarkFeeCard>

          {/* CHECKLIST CARD */}
          <ChecklistCard>
            <ChecklistTitle>CHECKLIST</ChecklistTitle>
            <ChecklistItem>
              <StatusDot isDone={counts.identityLeft === 0} />
              <span className="name">Identity</span>
              <span className="count">{counts.identityLeft > 0 ? `${counts.identityLeft} left` : 'Done'}</span>
            </ChecklistItem>
            <ChecklistItem>
              <StatusDot isDone={counts.addressLeft === 0} />
              <span className="name">Address & contact</span>
              <span className="count">{counts.addressLeft > 0 ? `${counts.addressLeft} left` : 'Done'}</span>
            </ChecklistItem>
            <ChecklistItem>
              <StatusDot isDone={counts.doctorLeft === 0} />
              <span className="name">Consulting doctor</span>
              <span className="count">{counts.doctorLeft > 0 ? `${counts.doctorLeft} left` : 'Done'}</span>
            </ChecklistItem>
            <ChecklistItem>
              <StatusDot isDone={true} />
              <span className="name">Fees</span>
              <span className="count">none</span>
            </ChecklistItem>
          </ChecklistCard>


        </RightSidebarColumn>
      </MainGrid>

      {/* Sticky Bottom Action Footer Bar */}
      <StickyFooterBar>
        <FooterLeftText>
          {counts.totalLeft > 0 ? (
            `${counts.totalLeft} required fields remaining`
          ) : (
            <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} /> All required fields completed
            </span>
          )}
        </FooterLeftText>

        <FooterRightActions>
          <CancelBtn type="button" onClick={() => navigate(-1)}>Cancel</CancelBtn>
          <SavePatientBtn type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : (patient.isNewborn ? "Save newborn & patient" : "Save patient")}
          </SavePatientBtn>
        </FooterRightActions>
      </StickyFooterBar>

      {/* MODALS */}
      <Modal
        show={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        title="Search Results"
        footer={<CancelBtn onClick={() => setShowSearchModal(false)}>Close</CancelBtn>}
      >
        <ModalSearchContainer>
          <ModalSearchInputWrapper>
            <Search size={15} color="#004d40" />
            <ModalSearchInput
              type="text"
              placeholder="Search or filter in modal (UHID, IP Number, Mobile, Name)..."
              value={modalFilterTerm}
              onChange={(e) => setModalFilterTerm(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleModalSearch(modalFilterTerm);
                }
              }}
              autoFocus
            />
            {modalFilterTerm && (
              <ModalClearBtn type="button" onClick={() => setModalFilterTerm("")} title="Clear filter">
                <X size={14} />
              </ModalClearBtn>
            )}
          </ModalSearchInputWrapper>
          <SearchBtn
            type="button"
            onClick={() => handleModalSearch(modalFilterTerm)}
            disabled={modalSearchLoading}
            style={{ height: '36px', whiteSpace: 'nowrap' }}
          >
            <Search size={14} />
            {modalSearchLoading ? "Searching..." : "Search"}
          </SearchBtn>
        </ModalSearchContainer>

        <ModalResultCountBar>
          <span>
            {filteredModalPatients.length === patients.length ? (
              `Showing all ${patients.length} results`
            ) : (
              `Filtered ${filteredModalPatients.length} of ${patients.length} results`
            )}
          </span>
          {modalFilterTerm && (
            <span style={{ color: '#0d9488' }}>
              Filter: "<strong>{modalFilterTerm}</strong>"
            </span>
          )}
        </ModalResultCountBar>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>UHID</TableHeaderCell>
              <TableHeaderCell>IP Number</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Gender</TableHeaderCell>
              <TableHeaderCell>Mobile</TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredModalPatients.length > 0 ? (
              filteredModalPatients.map((p, idx) => (
                <TableRow key={idx}>
                  <TableCell><strong>{p.uhid}</strong></TableCell>
                  <TableCell>{p.ip_number || "-"}</TableCell>
                  <TableCell>{`${p.salutation || ""} ${p.firstName || ""} ${p.lastName || ""}`.trim()}</TableCell>
                  <TableCell>{p.gender}</TableCell>
                  <TableCell>
                    <div>{p.mobilePhone || p.mobile_phone || "-"}</div>
                    {(p.emergencyContact || p.emergency_contact) && (
                      <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: '500' }}>
                        Emg: {p.emergencyContact || p.emergency_contact}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <HeaderBtn small onClick={() => handleSelectPatient(p)}>Select / Renew</HeaderBtn>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center" style={{ padding: '24px 12px', color: '#6b7280' }}>
                  {patients.length > 0
                    ? `No loaded patients match "${modalFilterTerm}". Click "Search" above to query server.`
                    : "No patients found. Try searching with another UHID, Mobile number, or IP Number."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Modal>

      {/* Visit List Modal */}
      <Modal
        show={showVisitList}
        onClose={() => setShowVisitList(false)}
        title="Visited Patients List"
      >
        <div style={{ paddingBottom: '14px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <FormGroup style={{ flex: 1 }}>
            <FormLabel>From Date</FormLabel>
            <FormInput
              type="date"
              value={filterDate.from}
              onChange={(e) => setFilterDate({ ...filterDate, from: e.target.value })}
            />
          </FormGroup>
          <FormGroup style={{ flex: 1 }}>
            <FormLabel>To Date</FormLabel>
            <FormInput
              type="date"
              value={filterDate.to}
              onChange={(e) => setFilterDate({ ...filterDate, to: e.target.value })}
            />
          </FormGroup>
          <FormGroup style={{ flex: 1 }}>
            <FormLabel>Doctor</FormLabel>
            <FormSelect
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
            >
              <option value="">All Doctors</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </FormSelect>
          </FormGroup>
          <SearchBtn onClick={handleViewList} style={{ marginTop: 'auto', height: '38px' }}>
            <Search size={14} /> Filter
          </SearchBtn>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>UHID</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Doctor</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Action</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitList.length > 0 ? (
                visitList.map((visit, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{visit.date}</TableCell>
                    <TableCell style={{ fontWeight: 600 }}>{visit.uhid}</TableCell>
                    <TableCell style={{ color: '#0d9488', cursor: 'pointer', fontWeight: 600 }} onClick={() => handlePatientClick(visit)}>
                      {visit.patientName} ({visit.age}/{visit.gender})
                    </TableCell>
                    <TableCell>{visit.doctorName || visit.doctor}</TableCell>
                    <TableCell>{visit.visitType}</TableCell>
                    <TableCell>₹{visit.billAmount}</TableCell>
                    <TableCell style={{ color: visit.paymentStatus === 'Paid' ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                      {visit.paymentStatus}
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <HeaderBtn small onClick={() => handlePrintSticker(visit)} title="Print Sticker"><Printer size={14} /></HeaderBtn>
                        <HeaderBtn small onClick={() => handlePrintBill(visit)} title="Print Bill"><FileText size={14} /></HeaderBtn>
                        <HeaderBtn small onClick={() => { setSelectedVisit(visit); setShowHistoryModal(true); }} title="History"><History size={14} /></HeaderBtn>
                        {visit.paymentStatus !== 'Paid' && (
                          <HeaderBtn small onClick={() => { setSelectedVisit(visit); setEditingDoctor(visit.doctor || ""); setShowEditVisitModal(true); }} title="Edit"><Edit size={14} /></HeaderBtn>
                        )}
                        {visit.paymentStatus === 'Paid' && (
                          <HeaderBtn small onClick={() => { setSelectedVisit(visit); setRefundAmount(visit.billAmount); setShowRefundVisitModal(true); }} title="Refund"><RotateCcw size={14} /></HeaderBtn>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">No visits found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Modal>

      {/* Patient Detail Modal */}
      <Modal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Patient Visit Details"
      >
        {selectedVisit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <DetailLine><span>UHID:</span> <strong>{selectedVisit.uhid}</strong></DetailLine>
            <DetailLine><span>Patient Name:</span> <strong>{selectedVisit.patientName}</strong></DetailLine>
            <DetailLine><span>Age / Gender:</span> <strong>{selectedVisit.age} / {selectedVisit.gender}</strong></DetailLine>
            <DetailLine><span>Mobile:</span> <strong>{selectedVisit.mobile}</strong></DetailLine>
            <DetailLine><span>Visited Date:</span> <strong>{selectedVisit.date}</strong></DetailLine>
            <DetailLine><span>Doctor:</span> <strong>{selectedVisit.doctor}</strong></DetailLine>
            <DetailLine><span>Bill Amount:</span> <strong>₹{selectedVisit.billAmount}</strong></DetailLine>
          </div>
        )}
      </Modal>

      {/* Edit Visit Doctor Modal */}
      <Modal
        show={showEditVisitModal}
        onClose={() => setShowEditVisitModal(false)}
        title="Edit Visit (Doctor Change)"
        footer={<SavePatientBtn onClick={handleUpdateVisit}>Update Visit</SavePatientBtn>}
      >
        {selectedVisit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FormGroup>
              <FormLabel>Select New Doctor</FormLabel>
              <FormSelect value={editingDoctor} onChange={(e) => setEditingDoctor(e.target.value)}>
                <option value="">Select Doctor</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</option>
                ))}
              </FormSelect>
            </FormGroup>
          </div>
        )}
      </Modal>

      {/* Refund Modal */}
      <Modal
        show={showRefundVisitModal}
        onClose={() => setShowRefundVisitModal(false)}
        title="Process Refund"
        footer={<SavePatientBtn style={{ background: '#dc2626' }} onClick={handleProcessRefund}>Process Refund</SavePatientBtn>}
      >
        {selectedVisit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FormGroup>
              <FormLabel>Refund Amount</FormLabel>
              <FormInput
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={selectedVisit.billAmount}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Remarks / Reason</FormLabel>
              <FormInput
                type="text"
                value={refundRemarks}
                onChange={(e) => setRefundRemarks(e.target.value)}
                placeholder="Enter reason..."
              />
            </FormGroup>
          </div>
        )}
      </Modal>

      {/* History Modal */}
      <Modal
        show={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Visit History & Refunds"
      >
        {selectedVisit && (
          <div>
            <h4>Edit History</h4>
            <p>{selectedVisit.editHistory?.length > 0 ? JSON.stringify(selectedVisit.editHistory) : "No edit history."}</p>
            <h4>Refunds</h4>
            <p>{selectedVisit.refunds?.length > 0 ? JSON.stringify(selectedVisit.refunds) : "No refunds found."}</p>
          </div>
        )}
      </Modal>

      <QRRegistrationModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        onDataReceived={handleQRDataReceived}
      />

      <CreateABHAModal
        show={showABHAModal}
        onClose={() => setShowABHAModal(false)}
        onSuccess={(abhaData) => {
          setPatient(prev => ({
            ...prev,
            firstName: abhaData.firstName || prev.firstName,
            lastName: abhaData.lastName || prev.lastName,
            dob: abhaData.dob || abhaData.yearOfBirth ? `${abhaData.yearOfBirth}-01-01` : prev.dob,
            gender: abhaData.gender === 'M' ? 'Male' : abhaData.gender === 'F' ? 'Female' : prev.gender,
            permanentAddress: abhaData.address || prev.permanentAddress,
            mobilePhone: cleanMobileNumber(abhaData.mobile) || prev.mobilePhone,
            zipcode: abhaData.pinCode || abhaData.pincode || prev.zipcode,
            city: abhaData.districtName || prev.city,
            district: abhaData.districtName || prev.district,
            state: abhaData.stateName || prev.state,
            abhaNumber: abhaData.ABHANumber || abhaData.abhaNumber || prev.abhaNumber,
          }));
          toast.success("ABHA Profile Linked & Auto-filled!");
        }}
      />

      {isModalOpen && (
        <ReferenceDoctorForm
          closeModal={() => setIsModalOpen(false)}
          setReferredBy={(name) => {
            setPatient(prev => ({ ...prev, referredBy: name }));
            setRefDoctorSearchQuery(name);
            setSearchDoctorTerm(name);
          }}
          fetchReferenceDoctors={loadReferenceDoctors}
          areaOptions={areaOptions}
        />
      )}
    </PageWrapper>
  )
}

// STYLED COMPONENTS - Ultra Modern & High Density Hospital Front Office Design System

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f4f6f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #1f2937;
  padding: 12px 16px 80px 16px;
  box-sizing: border-box;
`

const TopHeaderBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #17231e;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  margin-bottom: 10px;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`

const BrandTitle = styled.h1`
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin: 0;
  color: #ffffff;

  span {
    color: #a7f3d0;
    font-weight: 500;
  }
`

const SubBreadcrumb = styled.span`
  font-size: 12px;
  color: #9ca3af;
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const StatsPillGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const StatPill = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;

  .label {
    color: #9ca3af;
    font-weight: 600;
  }

  .value {
    color: #ffffff;
    font-weight: 800;
  }
`

const ClockBox = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #9ca3af;
  font-family: monospace;
`

const HeaderActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const HeaderBtn = styled.button`
  background: #ffffff;
  color: #111827;
  border: none;
  border-radius: 4px;
  padding: ${props => props.small ? '4px 8px' : '5px 12px'};
  font-size: ${props => props.small ? '11px' : '12px'};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  transition: all 0.15s;

  &:hover {
    background: #f3f4f6;
  }
`

const BadgeDot = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`

const LookupPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 12px;
`

const LookupTag = styled.span`
  font-size: 11px;
  font-weight: 800;
  color: #4b5563;
  letter-spacing: 0.5px;
`

const LookupField = styled.div`
  flex: 1;
  max-width: 200px;
`

const LookupInput = styled.input`
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  text-transform: uppercase;

  &::placeholder {
    text-transform: none;
  }

  &:focus {
    border-color: #004d40;
  }
`

const SearchBtn = styled.button`
  background: #004d40;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 16px;
  height: 32px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #00362d;
  }
`

const ClearBtn = styled.button`
  background: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0 14px;
  height: 32px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
`

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 12px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const LeftFormColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const RightSidebarColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const DenseCardSection = styled.div`
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 12px 16px;
`

const CardHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f3f4f6;
`

const CardTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const SectionNumber = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: #111827;
`

const SectionName = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  letter-spacing: 0.5px;
`

const RequiredBadge = styled.span`
  background: #fef3c7;
  color: #b45309;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
`

const CompletedBadge = styled.span`
  background: #d1fae5;
  color: #047857;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 3px;
`

const InfoBadge = styled.span`
  background: #fef3c7;
  color: #b45309;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 3}, 1fr);
  gap: 10px 12px;

  .full-width {
    grid-column: 1 / -1;
  }

  .span-two {
    grid-column: span 2;
  }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const FormLabel = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: #4b5563;
  display: flex;
  align-items: center;
`

const ReqAsterisk = styled.span`
  color: #ef4444;
  font-weight: 700;
  margin-left: 3px;
  font-size: 13px;
`

const FormInput = styled.input`
  height: 32px;
  padding: 0 8px;
  border: 1px solid ${props => props.$hasError ? '#ef4444' : '#d1d5db'};
  background-color: ${props => props.$hasError ? '#fef2f2' : '#ffffff'};
  border-radius: 4px;
  font-size: 12px;
  color: #111827;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.15s ease;
  text-transform: uppercase;

  &::placeholder {
    text-transform: none;
  }

  &:focus {
    border-color: ${props => props.$hasError ? '#ef4444' : '#004d40'};
    box-shadow: ${props => props.$hasError ? '0 0 0 2px rgba(239, 68, 68, 0.25)' : 'none'};
  }
`

const PhoneInputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${props => props.$hasError ? '#ef4444' : '#d1d5db'};
  background-color: ${props => props.$hasError ? '#fef2f2' : 'white'};
  border-radius: 4px;
  overflow: hidden;
  height: 32px;
  box-sizing: border-box;
  transition: all 0.15s ease;

  &:focus-within {
    border-color: ${props => props.$hasError ? '#ef4444' : '#004d40'};
    box-shadow: ${props => props.$hasError ? '0 0 0 2px rgba(239, 68, 68, 0.25)' : '0 0 0 1px #004d40'};
  }
`

const CountryCodePrefix = styled.span`
  background-color: #f3f4f6;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
  padding: 0 8px;
  height: 100%;
  display: flex;
  align-items: center;
  border-right: 1px solid #d1d5db;
  user-select: none;
  white-space: nowrap;
`

const PhoneInput = styled.input`
  height: 100%;
  padding: 0 8px;
  border: none;
  font-size: 12px;
  color: #111827;
  outline: none;
  width: 100%;
  box-sizing: border-box;
`

const FormSelect = styled.select`
  height: 32px;
  padding: 0 8px;
  border: 1px solid ${props => props.$hasError ? '#ef4444' : '#d1d5db'};
  background-color: ${props => props.$hasError ? '#fef2f2' : 'white'};
  border-radius: 4px;
  font-size: 12px;
  color: #111827;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.15s ease;

  &:focus {
    border-color: ${props => props.$hasError ? '#ef4444' : '#004d40'};
    box-shadow: ${props => props.$hasError ? '0 0 0 2px rgba(239, 68, 68, 0.25)' : 'none'};
  }
`

const InputGroupInline = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const AddDoctorBtn = styled.button`
  background: #004d40;
  color: white;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: #00362d;
  }
`

const CheckboxCard = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #f9fafb;

  input {
    accent-color: #004d40;
  }

  label {
    font-size: 11px;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
  }
`

const CheckboxInline = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  input {
    accent-color: #004d40;
  }

  label {
    font-size: 11px;
    font-weight: 600;
    color: #374151;
  }
`

const MlcDrawer = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 4px;
`

const DrawerTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #b45309;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`

const SubTextStatus = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: ${props => props.isError ? '#ef4444' : '#059669'};
  margin-top: 2px;
`

// RIGHT SIDEBAR CARDS
const DarkFeeCard = styled.div`
  background: #17231e;
  color: white;
  border-radius: 8px;
  padding: 14px;
`

const FeeCardHeader = styled.h3`
  font-size: 11px;
  font-weight: 800;
  color: #9ca3af;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
`

const FeeFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
`

const FeeLabel = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: #e5e7eb;
  display: flex;
  align-items: center;
`

const FeeSelectInput = styled.input`
  width: 100%;
  height: 32px;
  padding: 0 8px;
  background: ${props => props.$hasError ? '#451a1a' : '#24342d'};
  border: 1px solid ${props => props.$hasError ? '#ef4444' : '#374151'};
  border-radius: 4px;
  color: white;
  font-size: 12px;
  outline: none;
  box-sizing: border-box;
  box-shadow: ${props => props.$hasError ? '0 0 0 2px rgba(239, 68, 68, 0.3)' : 'none'};
  transition: all 0.15s ease;
  text-transform: uppercase;

  &::placeholder {
    color: #9ca3af;
    text-transform: none;
  }
`

const SearchableSelectWrapper = styled.div`
  position: relative;
  width: 100%;
`

const ClearDoctorBtn = styled.button`
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 50%;
  z-index: 5;

  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
`

const ClearRefDoctorBtn = styled.button`
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 50%;
  z-index: 5;

  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
`

const LightDropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 220px;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 9999;
  list-style: none;
  padding: 4px 0;
  margin: 4px 0 0 0;
`

const LightDropdownItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.12s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f0fdfa;
  }
`

const DoctorTypeTag = styled.span`
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  background: ${props => props.isRef ? '#e0f2fe' : '#d1fae5'};
  color: ${props => props.isRef ? '#0369a1' : '#047857'};
`

const DarkDropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 220px;
  overflow-y: auto;
  background: #17231e;
  border: 1px solid #374151;
  border-radius: 4px;
  z-index: 100;
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
`

const DarkDropdownItem = styled.li`
  padding: 8px 10px;
  font-size: 11px;
  color: ${props => props.$isHighlighted ? '#34d399' : '#e5e7eb'};
  cursor: pointer;
  border-bottom: 1px solid #24342d;
  background: ${props => props.$isHighlighted ? '#1e382b' : 'transparent'};

  &:hover {
    background: #1e382b;
    color: #34d399;
  }
`

const GuardianInputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  background-color: white;
  border-radius: 4px;
  overflow: hidden;
  height: 32px;
  box-sizing: border-box;
  transition: all 0.15s ease;

  &:focus-within {
    border-color: #004d40;
    box-shadow: 0 0 0 1px #004d40;
  }
`

const GuardianTypeSelect = styled.select`
  height: 100%;
  padding: 0 6px;
  border: none;
  border-right: 1px solid #d1d5db;
  background-color: #f8fafc;
  color: #1e293b;
  font-size: 12px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  white-space: nowrap;

  &:focus {
    background-color: #f1f5f9;
  }
`

const GuardianNameInput = styled.input`
  height: 100%;
  padding: 0 8px;
  border: none;
  outline: none;
  font-size: 12px;
  color: #1f2937;
  flex: 1;
  width: 100%;
  background: transparent;
  text-transform: uppercase;

  &::placeholder {
    color: #9ca3af;
    text-transform: none;
  }
`

const FeeCheckboxRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #e5e7eb;
    cursor: pointer;

    input {
      accent-color: #34d399;
    }
  }
`

const FeeInputBox = styled.input`
  width: 80px;
  height: 30px;
  padding: 0 6px;
  background: #24342d;
  border: 1px solid #374151;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  text-align: right;
  outline: none;
`

const TotalFeeDisplayRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #374151;

  .label {
    font-size: 11px;
    color: #9ca3af;
  }

  .amount {
    font-size: 24px;
    font-weight: 800;
    color: #ffffff;
  }
`

const ChecklistCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 12px 14px;
`

const ChecklistTitle = styled.h4`
  font-size: 11px;
  font-weight: 800;
  color: #4b5563;
  letter-spacing: 0.5px;
  margin: 0 0 10px 0;
`

const ChecklistItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  padding: 4px 0;

  .name {
    flex: 1;
    color: #374151;
    font-weight: 500;
  }

  .count {
    color: #9ca3af;
  }
`

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.isDone ? '#34d399' : '#d1d5db'};
`

const SmartRegistrationCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 12px 14px;
`

const SmartCardTitle = styled.h4`
  font-size: 11px;
  font-weight: 800;
  color: #4b5563;
  letter-spacing: 0.5px;
  margin: 0 0 8px 0;
`

const SmartCardRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;

  .label {
    color: #374151;
  }

  .value {
    font-weight: 800;
    color: #111827;
  }
`

const SmartCardSubtext = styled.p`
  margin: 6px 0 0 0;
  font-size: 10px;
  color: #9ca3af;
`

// STICKY FOOTER
const StickyFooterBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
`

const FooterLeftText = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
`

const FooterRightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const CancelBtn = styled.button`
  background: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0 16px;
  height: 36px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
`

const SavePatientBtn = styled.button`
  background: #004d40;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 20px;
  height: 36px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #00362d;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

// MODAL STYLES
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
`

const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  width: 90vw;
  max-width: ${props => props.maxWidth || '800px'};
  max-height: 85vh;
  display: flex;
  flex-direction: column;
`

const ModalHeader = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ModalTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;

  &:hover {
    color: #111827;
  }
`

const ModalBody = styled.div`
  padding: 16px 18px;
  overflow-y: auto;
  flex: 1;
`

const ModalFooter = styled.div`
  padding: 12px 18px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
`

const TableHeader = styled.thead`
  background: #f9fafb;
`

const TableHeaderCell = styled.th`
  padding: 8px 10px;
  text-align: left;
  font-weight: 600;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
`

const TableBody = styled.tbody``

const TableRow = styled.tr`
  &:hover {
    background: #f9fafb;
  }
`

const TableCell = styled.td`
  padding: 8px 10px;
  color: #111827;
  border-bottom: 1px solid #f3f4f6;

  &.text-center {
    text-align: center;
  }
`

const DetailLine = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 4px 0;
  border-bottom: 1px solid #f3f4f6;

  span {
    color: #6b7280;
  }

  strong {
    color: #111827;
  }
`

const ModalSearchContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
`

const ModalSearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0 10px;
  height: 36px;
  box-sizing: border-box;
  transition: all 0.15s ease;

  &:focus-within {
    border-color: #004d40;
    background: #ffffff;
    box-shadow: 0 0 0 2px rgba(0, 77, 64, 0.15);
  }
`

const ModalSearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #111827;
  width: 100%;
  text-transform: uppercase;

  &::placeholder {
    color: #9ca3af;
    text-transform: none;
  }
`

const ModalClearBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 50%;

  &:hover {
    color: #ef4444;
  }
`

const ModalResultCountBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 10px;
  padding: 0 2px;
`

const LocationBadge = styled.span`
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #475569;
`

const ReferralChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`

const ReferralChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 16px;
  cursor: pointer;
  border: 1px solid ${props => props.$active ? '#004d40' : '#e2e8f0'};
  background: ${props => props.$active ? '#004d40' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#475569'};
  transition: all 0.15s ease;

  &:hover {
    border-color: #004d40;
    color: ${props => props.$active ? '#ffffff' : '#004d40'};
    background: ${props => props.$active ? '#004d40' : '#f0fdfa'};
  }
`

const SubChannelPillContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: -4px;
  margin-bottom: 12px;
  padding: 6px 10px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
`

const SubChannelPillLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-right: 4px;
`

const SubChannelPill = styled.button`
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid ${props => props.$active ? '#004d40' : '#d1d5db'};
  background: ${props => props.$active ? '#e6f4f1' : '#ffffff'};
  color: ${props => props.$active ? '#004d40' : '#374151'};
  transition: all 0.15s ease;

  &:hover {
    border-color: #004d40;
    color: #004d40;
  }
`

export default PatientRegistrationForm
