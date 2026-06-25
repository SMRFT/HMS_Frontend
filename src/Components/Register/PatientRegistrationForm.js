"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"
import apiRequest from "../../Auth/apiRequest"
import { useNavigate } from "react-router-dom"
import { Search, Plus, ChevronDown, ChevronUp, Info, User, MapPin, UserPlus, AlertTriangle, Baby, QrCode, List, Printer, FileText, Edit, RotateCcw, History } from "lucide-react"
import ReferenceDoctorForm from "./ReferenceDoctorForm";

import QRRegistrationModal from "./QRRegistrationModal";
import QRRegistrationSidebar from "./QRRegistrationSidebar";
import { toast } from "react-toastify";
import Swal from "sweetalert2";


// Modal component for search results
const Modal = ({ show, onClose, title, children, footer }) => {
    if (!show) return null

    return (
        <ModalOverlay>
            <ModalContainer>
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



// Collapsible Section Component
const CollapsibleSection = ({ title, children, defaultOpen = true, icon }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <SectionWrapper>
            <SectionHeader onClick={() => setIsOpen(!isOpen)}>
                {icon && <SectionIcon>{icon}</SectionIcon>}
                <SectionTitle>{title}</SectionTitle>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </SectionHeader>
            {isOpen && <SectionContent>{children}</SectionContent>}
        </SectionWrapper>
    )
}

const LastUhidBadge = styled.div`
  margin-left: auto;
  font-size: 14px;
  font-weight: 600;
  color: #0d9488;
  background: #f0fdfa;
  padding: 8px 16px;
  border-radius: 9999px;
  border: 1px solid #ccfbf1;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border-color: #99f6e4;
  }

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #0d9488;
    display: block;
  }
`;

const SmallStatBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: ${props => props.color};
  border: 1px solid ${props => props.borderColor};
  color: ${props => props.textColor};
  font-size: 13px;
  font-weight: 600;
  height: 40px;
  white-space: nowrap;
`;

const StatsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    color: #0d9488;
    border-color: #ccfbf1;
  }
`;

const StatsSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const StatCard = styled.div`
  background: ${props => props.bgColor || '#f8fafc'};
  padding: 20px;
  border-radius: 12px;
  border: 1px solid ${props => props.borderColor || '#cbd5e1'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const StatValue = styled.h3`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.color || '#1e293b'};
  margin: 0;
`;

const StatLabel = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
`;

// const StatsButton = styled.button`
//   background: #0d9488;
//   color: white;
//   border: none;
//   border-radius: 8px;
//   padding: 10px 16px;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.2s;
//   display: flex;
//   align-items: center;
//   gap: 8px;

//   &:hover {
//     background: #0f766e;
//     transform: translateY(-1px);
//   }
// `;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: #64748b;
`;

const DetailValue = styled.span`
  color: #1e293b;
  font-weight: 600;
`;



const PatientRegistrationForm = () => {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showSearchModal, setShowSearchModal] = useState(false)

    // Patient state - UPDATED with firstName and lastName
    const [patient, setPatient] = useState({
        salutation: "",
        firstName: "",
        lastName: "",
        name: "", // Keep for backward compatibility
        dob: "",
        age: "",
        gender: "",
        permanentAddress: "",
        area: "",
        zipcode: "",
        city: "",
        state: "",
        email: "",
        mobilePhone: "",
        homePhone: "",
        bloodGroup: "",
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
        mothersUhidNo: "",
        pediatricianResponsible: "",
        emergencyContact: "",
        referredDoctorPhone: "",
        customerType: "New", // Default to "New"
        insuranceProviderCode: "",
    })

    const [isMlc, setIsMlc] = useState(false)

    // Search states
    const [uhid, setUhid] = useState("")
    const [ipNumber, setIpNumber] = useState("")
    const [mobile, setMobile] = useState("")
    const [patients, setPatients] = useState([])
    const [searchDoctorTerm, setSearchDoctorTerm] = useState("") // New state for searching referredBy
    const [lastUhid, setLastUhid] = useState("") // State for last UHID
    const [insuranceProviders, setInsuranceProviders] = useState([]) // New state for insurance
    const [customerTypes, setCustomerTypes] = useState([]) // Dynamic customer types

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
    const [unusedQRCount, setUnusedQRCount] = useState(0);
    const [showEditVisitModal, setShowEditVisitModal] = useState(false);
    const [showRefundVisitModal, setShowRefundVisitModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [refundAmount, setRefundAmount] = useState("");
    const [refundRemarks, setRefundRemarks] = useState("Patient Request");
    const [editingDoctor, setEditingDoctor] = useState("");

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
            return updated;
        });
    };

    // Fetch unused QR count once on mount
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


    // Fetch stats
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

    // Fetch list
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
            const doc = doctors.find(d => d.id === editingDoctor);
            const payload = {
                bill_number: selectedVisit.billNumber,
                doctor_id: editingDoctor,
                doctorName: doc ? doc.name : "",
                registrationFee: doc ? doc.registrationFee : 0,
                consultingFee: doc ? doc.consultingFee : 0,
                totalFees: doc ? (doc.registrationFee + doc.consultingFee) : 0
            };

            const result = await apiRequest(`${Hmsbaseurl}update-registration-visit/`, "POST", payload);
            if (result.success) {
                alert("Visit updated successfully");
                setShowEditVisitModal(false);
                handleViewList(); // Refresh list
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
                handleViewList(); // Refresh list
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
        // Create an invisible iframe
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
        printDocument.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Print Sticker</title>
                    <style>
                        @page {
                            size: auto;
                            margin: 0mm;
                        }
                        body {
                            font-family: 'Arial', sans-serif;
                            margin: 0;
                            padding: 10px;
                            background-color: white;
                        }
                        .sticker-content {
                            max-width: 380px;
                        }
                        .header-row {
                            display: flex;
                            align-items: center; /* Center horizontally/vertically */
                            margin-bottom: 15px;
                        }
                        .uhid-text {
                            font-size: 18px;
                            font-weight: 500;
                            margin-left: 15px;
                            font-family: monospace;
                        }
                        .patient-name-row {
                            font-size: 15px;
                            font-weight: 600;
                            text-transform: uppercase;
                            margin-bottom: 5px;
                            letter-spacing: 0.5px;
                        }
                        .spouse-row {
                            font-size: 14px;
                            text-transform: uppercase;
                            margin-bottom: 5px;
                        }
                        .address-row {
                            font-size: 14px;
                            text-transform: uppercase;
                            margin-bottom: 5px;
                            line-height: 1.4;
                        }
                        .phone-row {
                            font-size: 14px;
                            margin-bottom: 5px;
                        }
                        .doctor-row {
                            font-size: 15px;
                            font-weight: 600;
                            text-transform: uppercase;
                        }
                        /* Reset svg constraints to allow crisp barcode */
                        svg {
                            display: block;
                        }
                    </style>
                    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
                </head>
                <body>
                    <div class="sticker-content">
                        <div class="header-row">
                            <svg id="barcode"></svg>
                            <span class="uhid-text">UHID : ${visit.uhid}</span>
                        </div>
                        <div class="patient-name-row">
                            ${visit.patientName} &nbsp;&nbsp;/ ${visit.age} ${visit.age <= 1 ? "YEAR" : "YEARS"}/${visit.gender}
                        </div>
                        ${visit.spouseName ? '<div class="spouse-row">W/o ' + visit.spouseName + '</div>' : ''}
                        <div class="address-row">
                            ${visit.address || ''}
                        </div>
                        <div class="phone-row">
                            Ph.+91${visit.mobile}
                        </div>
                        <div class="doctor-row">
                            DR ${visit.doctorName || visit.doctor}
                        </div>
                    </div>
                    <script>
                        window.onload = function() {
                            // Generate barcode. 
                            // Important: Do NOT constrain width via CSS so the bars render crisply!
                            JsBarcode("#barcode", "${visit.uhid}", {
                                format: "CODE128",
                                displayValue: false,
                                height: 50,
                                width: 2,      // Standard bar width
                                margin: 0
                            });
                            
                            // Trigger print
                            setTimeout(function() {
                                window.focus();
                                window.print();
                                
                                // Auto-remove iframe
                                setTimeout(function() {
                                    if(window.frameElement) {
                                        window.frameElement.remove();
                                    }
                                }, 1000);
                            }, 500);
                        }
                    </script>
                </body>
            </html>
        `);
        printDocument.close();
    };

    const handlePrintBill = (visit) => {
        // Create an invisible iframe
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
                        @page {
                            size: auto;
                            margin: 5mm;
                        }
                        body {
                            font-family: 'Arial', sans-serif;
                            margin: 0;
                            padding: 10px;
                            background-color: white;
                            width: 320px; /* thermal printer width approximate */
                        }
                        .center {
                            text-align: center;
                        }
                        .header {
                            font-size: 14px;
                            font-weight: bold;
                            text-transform: uppercase;
                            margin-bottom: 2px;
                        }
                        .sub-header {
                            font-size: 12px;
                            margin-bottom: 2px;
                        }
                        .bill-type {
                            margin: 8px 0;
                            font-weight: bold;
                            font-size: 14px;
                        }
                        .info-table {
                            width: 100%;
                            font-size: 13px;
                            margin-bottom: 10px;
                        }
                        .info-table td {
                            padding: 2px 0;
                            vertical-align: top;
                        }
                        .info-table td:first-child {
                            width: 90px;
                        }
                        .items-table {
                            width: 100%;
                            font-size: 13px;
                            border-collapse: collapse;
                            margin-bottom: 10px;
                            border-top: 1px solid black;
                            border-bottom: 1px solid black;
                        }
                        .items-table th, .items-table td {
                            padding: 5px;
                            text-align: left;
                        }
                        .items-table th {
                            border-bottom: 1px solid black;
                        }
                        .text-right {
                            text-align: right !important;
                        }
                        .totals-table {
                            width: 100%;
                            font-size: 14px;
                            border-collapse: collapse;
                            margin-bottom: 5px;
                        }
                        .totals-table td {
                            padding: 5px;
                        }
                        .footer {
                            margin-top: 15px;
                            font-size: 11px;
                            font-style: italic;
                            line-height: 1.3;
                        }
                        .signature {
                            margin-top: 20px;
                            display: flex;
                            justify-content: space-between;
                            font-size: 13px;
                        }
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
                        <tr>
                            <td>Bill Number</td>
                            <td>: ${visit.billNumber || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Op Number</td>
                            <td>: ${visit.uhid}</td>
                        </tr>
                        <tr>
                            <td>Bill Date</td>
                            <td>: ${visit.date}</td>
                        </tr>
                        <tr>
                            <td>Name</td>
                            <td>: ${visit.patientName}</td>
                        </tr>
                        <tr>
                            <td>Doctor</td>
                            <td>: DR ${visit.doctorName || visit.doctor}</td>
                        </tr>
                    </table>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>SlNo</th>
                                <th>Description</th>
                                <th class="text-right">Qty</th>
                                <th class="text-right">Cost</th>
                                <th class="text-right">Amount</th>
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
                                
                                setTimeout(function() {
                                    if(window.frameElement) {
                                        window.frameElement.remove();
                                    }
                                }, 1000);
                            }, 500);
                        }
                    </script>
                </body>
            </html>
        `);
        printDocument.close();
    };


    const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false); // State for custom dropdown visibility

    // Fetch Last UHID on mount
    useEffect(() => {
        const fetchLastUhid = async () => {
            const result = await apiRequest(`${Hmsbaseurl}get-last-uhid/`);
            if (result.success && result.data && result.data.uhid) {
                setLastUhid(result.data.uhid);
            }
        };
        fetchLastUhid();
    }, []);

    // Doctor and fee states
    const [doctors, setDoctors] = useState([])
    const [referenceDoctors, setReferenceDoctors] = useState([])
    const [selectedDoctor, setSelectedDoctor] = useState({})
    const [registrationFee, setRegistrationFee] = useState(0)
    const [consultingFee, setConsultingFee] = useState(0)
    const [totalFees, setTotalFees] = useState(0)

    // Age calculation functions
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
        const today = new Date()
        const birthYear = today.getFullYear() - age
        return new Date(birthYear, today.getMonth(), today.getDate()).toISOString().split("T")[0]
    }

    // Handle form field changes - UPDATED to handle firstName and lastName
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        if (name === "firstName" || name === "lastName") {
            // Auto-update full name when first or last name changes
            const newPatient = { ...patient, [name]: value }
            const fullName = `${newPatient.firstName} ${newPatient.lastName}`.trim()
            setPatient({ ...newPatient, name: fullName })
        } else if (name === "dob") {
            const calculatedAge = calculateAgeFromDOB(value)
            setPatient({ ...patient, dob: value, age: calculatedAge })
        } else if (name === "age") {
            const calculatedDOB = calculateDOBFromAge(value)
            setPatient({ ...patient, age: value, dob: calculatedDOB })
        } else if (type === "checkbox") {
            setPatient({ ...patient, [name]: checked })
        } else {
            setPatient({ ...patient, [name]: value })
        }
    }

    // Handle file upload
    const handleFileChange = (e) => {
        setPatient({ ...patient, mlcDoc: e.target.files[0] })
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!patient.emergencyContact) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter an Emergency Contact.'
            });
            return;
        }

        if (!patient.referredBy) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a Referred By doctor.'
            });
            return;
        }

        const formData = new FormData()

        const backendKeys = {
            salutation: "salutation",
            permanentAddress: "permanent_address",
            homePhone: "home_phone",
            bloodGroup: "blood_group",
            spouseName: "spouse_name",
            mlcType: "mlc_type",
            mlcDoc: "mlc_doc",
            mlcRemarks: "mlc_remarks",
            passAlertToAuthority: "pass_alert_to_authority",
            birthTime: "birth_time",
            birthTimeAmPm: "birth_time_am_pm",
            mothersUhidNo: "mothers_uhid_no",
            pediatricianResponsible: "pediatrician_responsible",
            doctorId: "employeeId", // Map to backend field
            emergencyContact: "emergency_contact",
            referredDoctorPhone: "referred_doctor_phone",
            customerType: "customer_type",
            insuranceProviderCode: "company_code",
        }

        // Append all patient data to formData
        Object.keys(patient).forEach((key) => {
            const backendKey = backendKeys[key] || key

            // Skip MLC fields if isMlc is false
            if (!isMlc && (key.startsWith('mlc') || key === 'passAlertToAuthority')) {
                return;
            }

            if (key === "mlcDoc" && patient[key]) {
                formData.append(backendKey, patient[key])
            } else if (patient[key] !== null && patient[key] !== undefined) {
                formData.append(backendKey, patient[key])
            }
        })

        const result = await apiRequest(`${Hmsbaseurl}patients/register/`, "POST", formData);

        if (result.success) {
            console.log("Patient Registered:", result.data)

            const resultConfirm = await Swal.fire({
                title: 'Registration successful!',
                html: `Patient registered successfully with UHID: <strong>${result.data.uhid}</strong><br/><br/>Do you need a print?`,
                icon: 'success',
                showCancelButton: true,
                confirmButtonColor: '#0d9488',
                cancelButtonColor: '#ef4444',
                confirmButtonText: 'Yes, print it!',
                cancelButtonText: 'No, thanks'
            });

            if (resultConfirm.isConfirmed) {
                const visitObj = {
                    uhid: result.data.uhid,
                    patientName: `${patient.salutation} ${patient.firstName} ${patient.lastName}`.trim(),
                    age: patient.age,
                    gender: patient.gender,
                    spouseName: patient.spouseName,
                    address: patient.permanentAddress,
                    mobile: patient.mobilePhone,
                    doctorName: patient.doctorName,
                    consultingFee: consultingFee,
                    registrationFee: registrationFee,
                    billAmount: totalFees,
                    date: new Date().toLocaleDateString(),
                    paymentMethod: "Cash"
                };
                handlePrintBill(visitObj);
            } else {
                toast.success("Registration successful!");
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
                state: "",
                email: "",
                mobilePhone: "",
                homePhone: "",
                bloodGroup: "",
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
                mothersUhidNo: "",
                pediatricianResponsible: "",
            })
            setIsMlc(false)

            // Reset fee calculator
            setSelectedDoctor({})
            setRegistrationFee(0)
            setConsultingFee(0)
            setTotalFees(0)
        } else {
            console.error("Error:", result.error)
            alert("Error registering patient: " + (result.error || "Check console for details."))
        }
    }

    // Fetch patients based on search criteria
    const fetchPatients = async () => {
        let query = ""
        if (uhid) {
            query = `uhid=${uhid}`
        } else if (ipNumber) {
            query = `ip_number=${ipNumber}`
        } else if (mobile) {
            query = `mobile=${mobile}`
        }

        const result = await apiRequest(`${Hmsbaseurl}create/?${query}`)
        if (result.success) {
            setPatients(result.data)
            setShowSearchModal(true)
        }
    }

    // Select patient from search results
    const handleSelectPatient = (selectedPatient) => {
        const fullName = `${selectedPatient.salutation || ""} ${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim()

        // Map backend registration_date to frontend regDate if it exists
        const mappedPatient = {
            ...selectedPatient,
            name: fullName
        }

        setPatient(mappedPatient)
        setShowSearchModal(false)
    }

    // Load doctors and reference doctors
    const loadDoctors = async () => {
        const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const result = await apiRequest(`${Hmsbaseurl}doctor_schedule/`);
        if (result.success) {
            const doctorsData = result.data
                .filter((doctor) => doctor.day_schedule && doctor.day_schedule.includes(todayDay))
                .map((doctor) => ({
                    id: doctor.employeeId, // Capture employeeId
                    name: `${doctor.first_name} ${doctor.middle_name || ""} ${doctor.last_name}`.trim(),
                    registrationFee: Number.parseFloat(doctor.registration_fee),
                    consultingFee: Number.parseFloat(doctor.consulting_fee),
                    specialty: doctor.specialty,
                    type: "Internal"
                }))
            setDoctors(doctorsData)
        }
    };

    const loadReferenceDoctors = async () => {
        const result = await apiRequest(`${Hmsbaseurl}get-reference-doctors/`);
        if (result.success) {
            // Ensure shape matches expectation
            const formattedRefs = result.data.map(d => ({
                ...d,
                id: d.id, // Ensure ID is captured for reference doctors too if needed
                name: d.doctor, // Map 'doctor' field to 'name' for consistent usage
                type: "Reference"
            }));
            setReferenceDoctors(formattedRefs)
        }
    }
    const loadInsuranceProviders = async () => {
        const result = await apiRequest(`${Hmsbaseurl}insurance-providers/`);
        if (result.success) {
            const fetchedData = result.data.data || result.data;
            const activeProviders = Array.isArray(fetchedData) ? fetchedData.filter(p => !p.blocked) : [];
            setInsuranceProviders(activeProviders);
        }
    };

    const loadCustomerTypes = async () => {
        const result = await apiRequest(`${Hmsbaseurl}customer-types/`);
        if (result.success) {
            setCustomerTypes(result.data.filter(t => t.is_active));
        }
    };

    // Fetch doctors on component mount
    useEffect(() => {
        loadDoctors();
        loadReferenceDoctors();
        loadInsuranceProviders();
        loadCustomerTypes();
    }, [])

    // Combine lists for Referred By search
    const allDoctors = [
        ...doctors.map(d => ({ ...d, label: `${d.name} (Internal)` })),
        ...referenceDoctors.map(d => ({ ...d, label: `${d.name} (${d.qualification || 'Ext'}) - ${d.area || ''}` }))
    ];

    const filteredDoctors = allDoctors.filter(doc =>
        doc.name.toLowerCase().includes(searchDoctorTerm.toLowerCase())
    );

    // Handle doctor selection for fee calculation
    const handleDoctorChange = (event) => {
        const doctorName = event.target.value
        setPatient({ ...patient, doctorName }) // Update text immediately for search
        setIsDoctorDropdownOpen(true) // Open dropdown when typing

        // Check if typed name matches exactly (optional, but good for quick type-match)
        const selected = doctors.find((doctor) => doctor.name === doctorName)
        if (selected) {
            handleDoctorSelect(selected)
        } else {
            // If not found, reset fees but keep the name typed
            resetFeeCalculator(false) // Pass false to NOT clear the name
        }
    }

    const handleDoctorSelect = (selected) => {
        const regFee = selected.registrationFee || 0
        const consFee = selected.consultingFee || 0
        const total = regFee + consFee

        setSelectedDoctor(selected)
        setRegistrationFee(regFee)
        setConsultingFee(consFee)
        setTotalFees(total)

        setPatient(prev => ({
            ...prev,
            doctorName: selected.name,
            doctorId: selected.id,
            registrationFee: regFee,
            consultingFee: consFee,
            totalFees: total,
        }))
        setIsDoctorDropdownOpen(false) // Close dropdown
    }

    // Handle fee changes
    const handleFeeChange = (feeType, value) => {
        const newFee = Number.parseFloat(value) || 0

        if (feeType === "registration") {
            setRegistrationFee(newFee)
            setTotalFees(newFee + consultingFee)
            setPatient({
                ...patient,
                registrationFee: newFee,
                totalFees: newFee + consultingFee,
            })
        } else if (feeType === "consulting") {
            setConsultingFee(newFee)
            setTotalFees(registrationFee + newFee)
            setPatient({
                ...patient,
                consultingFee: newFee,
                totalFees: registrationFee + newFee,
            })
        }
    }

    // Reset fee calculator
    const resetFeeCalculator = (clearName = true) => {
        setSelectedDoctor({})
        setRegistrationFee(0)
        setConsultingFee(0)
        setTotalFees(0)

        setPatient(prev => ({
            ...prev,
            doctorName: clearName ? "" : prev.doctorName,
            doctorId: "",
            registrationFee: 0,
            consultingFee: 0,
            totalFees: 0,
        }))
    }

    const searchMotherUhid = () => {
        console.log("Searching for mother's UHID:", patient.mothersUhidNo)
    }

    const handleNewBornRegistration = () => {
        console.log("Registering newborn with details:", {
            birthTime: patient.birthTime,
            birthTimeAmPm: patient.birthTimeAmPm,
            weight: patient.weight,
            mothersUhidNo: patient.mothersUhidNo,
            pediatricianResponsible: patient.pediatricianResponsible,
        })
    }

    return (
        <PageContainer>
            <PageHeader>
                <PageTitle>Patient <span>Registration</span></PageTitle>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '8px', marginRight: '8px', flexWrap: 'wrap' }}>
                        <SmallStatBadge color="#eff6ff" borderColor="#bfdbfe" textColor="#1e40af">
                            <span style={{ fontWeight: 400, color: '#64748b' }}>New:</span>
                            <span>{stats.new_visit}</span>
                        </SmallStatBadge>
                        <SmallStatBadge color="#f0fdf4" borderColor="#bbf7d0" textColor="#166534">
                            <span style={{ fontWeight: 400, color: '#64748b' }}>Revisit:</span>
                            <span>{stats.existing_visit}</span>
                        </SmallStatBadge>
                        <SmallStatBadge color="#fdf2f8" borderColor="#fbcfe8" textColor="#9d174d">
                            <span style={{ fontWeight: 400, color: '#64748b' }}>Total:</span>
                            <span>{stats.total_visit}</span>
                        </SmallStatBadge>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <StatsButton onClick={handleViewList} style={{ background: 'white', color: '#6366f1', border: '1px solid #e0e7ff', height: '40px' }}>
                            <List size={20} />
                            <span>Visited List</span>
                        </StatsButton>
                        <StatsButton
                            onClick={() => setShowQRModal(true)}
                            style={{
                                background: 'white',
                                color: '#0d9488',
                                border: '1px solid #ccfbf1',
                                height: '40px',
                                position: 'relative'
                            }}
                        >
                            <QrCode size={20} />
                            <span>QR Scan</span>
                            {unusedQRCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    background: '#ef4444',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    fontSize: '11px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    fontWeight: 'bold'
                                }}>
                                    {unusedQRCount}
                                </span>
                            )}
                        </StatsButton>
                    </div>
                    {lastUhid && <LastUhidBadge>Last Created UHID: {lastUhid}</LastUhidBadge>}
                </div>
            </PageHeader>



            <MainContentWrapper>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Visit List Modal */}
                    <Modal
                        show={showVisitList}
                        onClose={() => setShowVisitList(false)}
                        title="Visited Patients List"
                    >
                        <div style={{ padding: '0 0 16px 0' }}>
                            <FiltersContainer style={{ borderBottom: 'none', paddingBottom: '16px' }}>
                                <FilterGroup>
                                    <Label>From Date</Label>
                                    <Input
                                        type="date"
                                        value={filterDate.from}
                                        onChange={(e) => setFilterDate({ ...filterDate, from: e.target.value })}
                                    />
                                </FilterGroup>
                                <FilterGroup>
                                    <Label>To Date</Label>
                                    <Input
                                        type="date"
                                        value={filterDate.to}
                                        onChange={(e) => setFilterDate({ ...filterDate, to: e.target.value })}
                                    />
                                </FilterGroup>
                                <FilterGroup>
                                    <Label>Doctor</Label>
                                    <Select
                                        value={filterDoctor}
                                        onChange={(e) => setFilterDoctor(e.target.value)}
                                    >
                                        <option value="">All Doctors</option>
                                        {doctors.map(doc => (
                                            <option key={doc.id} value={doc.id}>{doc.name}</option>
                                        ))}
                                    </Select>
                                </FilterGroup>
                                <StatsButton
                                    onClick={handleViewList}
                                    style={{ marginTop: 'auto', height: '42px' }}
                                >
                                    <Search size={16} /> Filter
                                </StatsButton>
                            </FiltersContainer>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>UHID</th>
                                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Doctor</th>
                                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Type</th>
                                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Amount</th>
                                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                                        <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visitList.length > 0 ? (
                                        visitList.map((visit, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px' }}>{visit.date}</td>
                                                <td style={{ padding: '12px', fontWeight: '500' }}>{visit.uhid}</td>
                                                <td
                                                    style={{ padding: '12px', color: '#0d9488', cursor: 'pointer', fontWeight: '600' }}
                                                    onClick={() => handlePatientClick(visit)}
                                                >
                                                    {visit.patientName} ({visit.age}/{visit.gender})
                                                </td>
                                                <td style={{ padding: '12px' }}>{visit.doctor}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '99px',
                                                        fontSize: '12px',
                                                        background: visit.visitType === 'New' ? '#dbeafe' : '#f1f5f9',
                                                        color: visit.visitType === 'New' ? '#1e40af' : '#475569'
                                                    }}>
                                                        {visit.visitType}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px' }}>₹{visit.billAmount}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        color: visit.paymentStatus === 'Paid' ? '#16a34a' : '#ca8a04',
                                                        fontWeight: '600'
                                                    }}>
                                                        {visit.paymentStatus}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => handlePrintSticker(visit)}
                                                            style={{
                                                                background: '#f0fdf4',
                                                                border: '1px solid #bbf7d0',
                                                                cursor: 'pointer',
                                                                color: '#16a34a',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                padding: '6px',
                                                                borderRadius: '6px'
                                                            }}
                                                            title="Print Sticker"
                                                        >
                                                            <Printer size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePrintBill(visit)}
                                                            style={{
                                                                background: '#eff6ff',
                                                                border: '1px solid #bfdbfe',
                                                                cursor: 'pointer',
                                                                color: '#2563eb',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                padding: '6px',
                                                                borderRadius: '6px'
                                                            }}
                                                            title="Print Bill"
                                                        >
                                                            <FileText size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedVisit(visit);
                                                                setShowHistoryModal(true);
                                                            }}
                                                            style={{
                                                                background: '#f1f5f9',
                                                                border: '1px solid #e2e8f0',
                                                                cursor: 'pointer',
                                                                color: '#64748b',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                padding: '6px',
                                                                borderRadius: '6px'
                                                            }}
                                                            title="View History"
                                                        >
                                                            <History size={16} />
                                                        </button>
                                                        {visit.paymentStatus !== 'Paid' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedVisit(visit);
                                                                    setEditingDoctor(visit.doctor || "");
                                                                    setShowEditVisitModal(true);
                                                                }}
                                                                style={{
                                                                    background: '#fef3c7',
                                                                    border: '1px solid #fde68a',
                                                                    cursor: 'pointer',
                                                                    color: '#d97706',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    padding: '6px',
                                                                    borderRadius: '6px'
                                                                }}
                                                                title="Edit Doctor"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                        )}
                                                        {visit.paymentStatus === 'Paid' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedVisit(visit);
                                                                    setRefundAmount(visit.billAmount);
                                                                    setShowRefundVisitModal(true);
                                                                }}
                                                                style={{
                                                                    background: '#fee2e2',
                                                                    border: '1px solid #fecaca',
                                                                    cursor: 'pointer',
                                                                    color: '#dc2626',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    padding: '6px',
                                                                    borderRadius: '6px'
                                                                }}
                                                                title="Refund"
                                                            >
                                                                <RotateCcw size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                                No visits found for the selected criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Modal>

                    {/* Visit Detail Modal */}
                    <Modal
                        show={showDetailModal}
                        onClose={() => setShowDetailModal(false)}
                        title="Patient Visit Details"
                    >
                        {selectedVisit && (
                            <div style={{ padding: '10px' }}>
                                <DetailRow>
                                    <DetailLabel>UHID</DetailLabel>
                                    <DetailValue>{selectedVisit.uhid}</DetailValue>
                                </DetailRow>
                                <DetailRow>
                                    <DetailLabel>Patient Name</DetailLabel>
                                    <DetailValue>{selectedVisit.patientName}</DetailValue>
                                </DetailRow>
                                <DetailRow>
                                    <DetailLabel>Age / Gender</DetailLabel>
                                    <DetailValue>{selectedVisit.age} / {selectedVisit.gender}</DetailValue>
                                </DetailRow>
                                <DetailRow>
                                    <DetailLabel>Mobile</DetailLabel>
                                    <DetailValue>{selectedVisit.mobile}</DetailValue>
                                </DetailRow>
                                <DetailRow>
                                    <DetailLabel>Visited Date</DetailLabel>
                                    <DetailValue>{selectedVisit.date}</DetailValue>
                                </DetailRow>
                                <DetailRow>
                                    <DetailLabel>Doctor</DetailLabel>
                                    <DetailValue>{selectedVisit.doctor}</DetailValue>
                                </DetailRow>
                                <DetailRow>
                                    <DetailLabel>Visit Type</DetailLabel>
                                    <DetailValue>{selectedVisit.visitType}</DetailValue>
                                </DetailRow>
                                <DetailRow>
                                    <DetailLabel>Bill Amount</DetailLabel>
                                    <DetailValue>₹{selectedVisit.billAmount}</DetailValue>
                                </DetailRow>
                                <DetailRow>
                                    <DetailLabel>Payment Status</DetailLabel>
                                    <DetailValue style={{
                                        color: selectedVisit.paymentStatus === 'Paid' ? '#16a34a' : '#ca8a04'
                                    }}>
                                        {selectedVisit.paymentStatus}
                                    </DetailValue>
                                </DetailRow>
                            </div>
                        )}
                    </Modal>

                    {/* Edit Visit Modal */}
                    <Modal
                        show={showEditVisitModal}
                        onClose={() => setShowEditVisitModal(false)}
                        title="Edit Visit (Doctor Change)"
                        footer={
                            <StatsButton onClick={handleUpdateVisit} style={{ background: '#0d9488', color: 'white', width: '100%' }}>
                                Update Visit
                            </StatsButton>
                        }
                    >
                        {selectedVisit && (
                            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>Patient</p>
                                    <p style={{ margin: 0, fontWeight: '600' }}>{selectedVisit.patientName} ({selectedVisit.uhid})</p>
                                </div>

                                <FilterGroup>
                                    <Label>Select New Doctor</Label>
                                    <Select
                                        value={editingDoctor}
                                        onChange={(e) => setEditingDoctor(e.target.value)}
                                    >
                                        <option value="">Select Doctor</option>
                                        {doctors.map(doc => (
                                            <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</option>
                                        ))}
                                    </Select>
                                </FilterGroup>

                                {editingDoctor && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div style={{ background: '#f0fdfa', padding: '10px', borderRadius: '8px' }}>
                                            <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#0d9488' }}>Reg. Fee</p>
                                            <p style={{ margin: 0, fontWeight: '600' }}>₹{doctors.find(d => d.id === editingDoctor)?.registrationFee || 0}</p>
                                        </div>
                                        <div style={{ background: '#f0fdfa', padding: '10px', borderRadius: '8px' }}>
                                            <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#0d9488' }}>Cons. Fee</p>
                                            <p style={{ margin: 0, fontWeight: '600' }}>₹{doctors.find(d => d.id === editingDoctor)?.consultingFee || 0}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Modal>

                    {/* Refund Modal */}
                    <Modal
                        show={showRefundVisitModal}
                        onClose={() => setShowRefundVisitModal(false)}
                        title="Process Refund"
                        footer={
                            <StatsButton onClick={handleProcessRefund} style={{ background: '#dc2626', color: 'white', width: '100%' }}>
                                Process Refund
                            </StatsButton>
                        }
                    >
                        {selectedVisit && (
                            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#991b1b' }}>Refunding for Bill: {selectedVisit.billNumber}</p>
                                    <p style={{ margin: 0, fontWeight: '600' }}>{selectedVisit.patientName} (₹{selectedVisit.billAmount})</p>
                                </div>

                                <FilterGroup>
                                    <Label>Refund Amount</Label>
                                    <Input
                                        type="number"
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(e.target.value)}
                                        max={selectedVisit.billAmount}
                                    />
                                </FilterGroup>

                                <FilterGroup>
                                    <Label>Remarks / Reason</Label>
                                    <TextArea
                                        value={refundRemarks}
                                        onChange={(e) => setRefundRemarks(e.target.value)}
                                        placeholder="Enter reason for refund..."
                                        rows={3}
                                    />
                                </FilterGroup>
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
                            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Edit History Section */}
                                <div>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <History size={16} /> Edit History
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {selectedVisit.editHistory && selectedVisit.editHistory.length > 0 ? (
                                            selectedVisit.editHistory.map((edit, idx) => (
                                                <div key={idx} style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{edit.date}</span>
                                                        <span style={{ color: '#64748b' }}>by {edit.user}</span>
                                                    </div>
                                                    <ul style={{ margin: 0, paddingLeft: '18px', color: '#334155' }}>
                                                        {Object.entries(edit.changes).map(([field, values]) => (
                                                            <li key={field}>
                                                                Changed <strong>{field.replace('_', ' ')}</strong> from <em>{values.old}</em> to <strong>{values.new}</strong>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>No edit history available.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Refunds Section */}
                                <div>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <RotateCcw size={16} /> Refunds
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {selectedVisit.refunds && selectedVisit.refunds.length > 0 ? (
                                            <>
                                                {selectedVisit.refunds.map((refund, idx) => (
                                                    <div key={idx} style={{ background: '#fff5f5', padding: '10px', borderRadius: '8px', border: '1px solid #feb2b2', fontSize: '13px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                            <span style={{ fontWeight: '600', color: '#991b1b' }}>{refund.refund_bill_no}</span>
                                                            <span style={{ color: '#dc2626', fontWeight: '600' }}>₹{refund.amount}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12px' }}>
                                                            <span>{refund.date}</span>
                                                            <span>Status: <strong>{refund.status}</strong></span>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div style={{ marginTop: '10px', padding: '10px', borderTop: '2px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontWeight: '600' }}>Total Refunded:</span>
                                                    <span style={{ fontWeight: '700', color: '#dc2626' }}>₹{selectedVisit.totalRefunded}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>No refunds found for this visit.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>

                    {/* Search Container */}
                    <SearchContainer>
                        <SearchRow>
                            <InputWrapper>
                                <Label htmlFor="uhid">UHID No</Label>
                                <InputGroup>
                                    <Input
                                        type="text"
                                        id="uhid"
                                        placeholder="Enter UHID No"
                                        value={uhid}
                                        onChange={(e) => setUhid(e.target.value)}
                                    />
                                    <InputAddon onClick={fetchPatients}>
                                        <Search size={16} />
                                    </InputAddon>
                                </InputGroup>
                            </InputWrapper>

                            <InputWrapper>
                                <Label htmlFor="ipNumber">IP Number</Label>
                                <InputGroup>
                                    <Input
                                        type="text"
                                        id="ipNumber"
                                        placeholder="Enter IP Number"
                                        value={ipNumber}
                                        onChange={(e) => setIpNumber(e.target.value)}
                                    />
                                    <InputAddon onClick={fetchPatients}>
                                        <Search size={16} />
                                    </InputAddon>
                                </InputGroup>
                            </InputWrapper>

                            <InputWrapper>
                                <Label htmlFor="mobile">Mobile</Label>
                                <InputGroup>
                                    <Input
                                        type="text"
                                        id="mobile"
                                        placeholder="Enter Mobile"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                    />
                                    <InputAddon onClick={fetchPatients}>
                                        <Search size={16} />
                                    </InputAddon>
                                </InputGroup>
                            </InputWrapper>
                        </SearchRow>
                    </SearchContainer >


                    {/* Patient Registration Form */}
                    < FormContainer >
                        {/* <ContainerTitle>Patient Registration</ContainerTitle> */}
                        <form onSubmit={handleSubmit}>
                            {/* Basic Information Section Removed */}

                            {/* Personal Information Section - UPDATED WITH FIRST AND LAST NAME */}
                            <CollapsibleSection title="Personal Information" icon={<User size={20} />}>
                                <FormGrid columns={3}>
                                    <InputWrapper>
                                        <Label htmlFor="customerType">Customer Type<RequiredAsterisk>*</RequiredAsterisk></Label>
                                        <Select
                                            id="customerType"
                                            name="customerType"
                                            value={patient.customerType}
                                            onChange={(e) => {
                                                const selectedValue = e.target.value;
                                                const typeObj = customerTypes.find(t => t.type_name === selectedValue);
                                                const fee = typeObj ? parseFloat(typeObj.registration_fee) : 0;

                                                setRegistrationFee(fee);
                                                const total = fee + consultingFee;
                                                setTotalFees(total);

                                                setPatient(prev => ({
                                                    ...prev,
                                                    customerType: selectedValue,
                                                    registrationFee: fee,
                                                    totalFees: total
                                                }));
                                            }}
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            {customerTypes.map(ct => (
                                                <option key={ct.type_id} value={ct.type_name}>
                                                    {ct.type_name}
                                                </option>
                                            ))}
                                        </Select>
                                    </InputWrapper>
                                    {patient.customerType === "Insurance" && (
                                        <InputWrapper>
                                            <Label htmlFor="insuranceProviderCode">Select Insurance Provider</Label>
                                            <Input
                                                id="insuranceProviderCode"
                                                name="insuranceProviderCode"
                                                list="insurance-providers-list"
                                                value={patient.insuranceProviderCode}
                                                onChange={handleChange}
                                                placeholder="Search and select..."
                                                autoComplete="off"
                                                required
                                            />
                                            <datalist id="insurance-providers-list">
                                                {insuranceProviders.map((prov) => (
                                                    <option key={prov.company_code} value={prov.company_code}>
                                                        {prov.company_name}
                                                    </option>
                                                ))}
                                            </datalist>
                                        </InputWrapper>
                                    )}
                                    <InputWrapper>
                                        <Label htmlFor="salutation">Salutation<RequiredAsterisk>*</RequiredAsterisk></Label>
                                        <Select
                                            id="salutation"
                                            name="salutation"
                                            value={patient.salutation}
                                            required
                                            onChange={handleChange}
                                        >
                                            <option value="">Select</option>
                                            <option value="Mr.">Mr.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="Ms.">Ms.</option>
                                            <option value="Dr.">Dr.</option>
                                            <option value="Master">Master</option>
                                            <option value="Baby">Baby</option>
                                        </Select>
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="firstName">
                                            First Name <RequiredAsterisk>*</RequiredAsterisk>
                                        </Label>
                                        <Input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={patient.firstName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter first name"
                                        />
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="lastName">
                                            Last Name <RequiredAsterisk>*</RequiredAsterisk>
                                        </Label>
                                        <Input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={patient.lastName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter last name"
                                        />
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="dob">
                                            Date of Birth <RequiredAsterisk>*</RequiredAsterisk>
                                        </Label>
                                        <Input type="date" id="dob" name="dob" value={patient.dob} onChange={handleChange} required />
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="age">
                                            Age <RequiredAsterisk>*</RequiredAsterisk>
                                        </Label>
                                        <Input type="number" id="age" name="age" value={patient.age} onChange={handleChange} required placeholder="Auto-calculated" />
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="gender">
                                            Gender <RequiredAsterisk>*</RequiredAsterisk>
                                        </Label>
                                        <Select id="gender" name="gender" value={patient.gender} onChange={handleChange} required>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </Select>
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="bloodGroup">Blood Group</Label>
                                        <Select id="bloodGroup" name="bloodGroup" value={patient.bloodGroup} onChange={handleChange}>
                                            <option value="">Select Blood Group</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </Select>
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="spouseName">Spouse Name</Label>
                                        <Input
                                            type="text"
                                            id="spouseName"
                                            name="spouseName"
                                            value={patient.spouseName}
                                            onChange={handleChange}
                                            placeholder="Enter spouse name"
                                        />
                                    </InputWrapper>
                                </FormGrid>
                            </CollapsibleSection>

                            {/* Address & Contact Information */}
                            <CollapsibleSection title="Address & Contact Information" icon={<MapPin size={20} />}>
                                <FormGrid columns={3}>
                                    <InputWrapper className="span-full">
                                        <Label htmlFor="permanentAddress">Permanent Address</Label>
                                        <Input
                                            type="text"
                                            id="permanentAddress"
                                            name="permanentAddress"
                                            value={patient.permanentAddress}
                                            onChange={handleChange}
                                            placeholder="Enter full address"
                                        />
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="area">Area</Label>
                                        <Input type="text" id="area" name="area" value={patient.area} onChange={handleChange} placeholder="Enter area" />
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="zipcode">Post Code<RequiredAsterisk>*</RequiredAsterisk></Label>
                                        <Input type="text" id="zipcode" name="zipcode" value={patient.zipcode} onChange={handleChange} required placeholder="Enter zipcode" />
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="city">City</Label>
                                        <Input type="text" id="city" name="city" value={patient.city} onChange={handleChange} placeholder="Enter city" />
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="state">State</Label>
                                        <Input type="text" id="state" name="state" value={patient.state} onChange={handleChange} placeholder="Enter state" />
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="email">Email</Label>
                                        <Input type="email" id="email" name="email" value={patient.email} onChange={handleChange} placeholder="example@email.com" />
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="mobilePhone">
                                            Mobile Phone <RequiredAsterisk>*</RequiredAsterisk>
                                        </Label>
                                        <Input
                                            type="text"
                                            id="mobilePhone"
                                            name="mobilePhone"
                                            value={patient.mobilePhone}
                                            onChange={handleChange}
                                            required
                                            placeholder="10-digit mobile number"
                                            maxLength={10}
                                        />
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="homePhone">Home Phone</Label>
                                        <Input
                                            type="text"
                                            id="homePhone"
                                            name="homePhone"
                                            value={patient.homePhone}
                                            onChange={handleChange}
                                            placeholder="Enter home phone"
                                        />
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="emergencyContact">Emergency Contact<RequiredAsterisk>*</RequiredAsterisk></Label>
                                        <Input
                                            type="text"
                                            id="emergencyContact"
                                            name="emergencyContact"
                                            value={patient.emergencyContact}
                                            onChange={handleChange}
                                            placeholder="Enter emergency contact"
                                            maxLength={10}
                                            required
                                        />
                                    </InputWrapper>
                                </FormGrid>
                            </CollapsibleSection>

                            {/* Referred Section */}
                            {/* Referred Section */}
                            <CollapsibleSection title="Referred Information" icon={<UserPlus size={20} />}>
                                <FormGrid>
                                    <InputWrapper className="span-full">
                                        <Label htmlFor="referredBy">Referred By<RequiredAsterisk>*</RequiredAsterisk></Label>
                                        <InputGroup>
                                            <Input
                                                list="doctor-options"
                                                id="referredBy"
                                                name="referredBy"
                                                value={patient.referredBy}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    setSearchDoctorTerm(e.target.value);
                                                }}
                                                placeholder="Search or Select Doctor"
                                                onClick={() => setSearchDoctorTerm("")}
                                                required
                                            />
                                            <datalist id="doctor-options">
                                                {allDoctors.map((doc, index) => (
                                                    <option key={index} value={doc.name}>
                                                        {doc.label}
                                                    </option>
                                                ))}
                                            </datalist>
                                            <InputAddon onClick={() => setIsModalOpen(true)} title="Add New Doctor">
                                                <Plus size={16} />
                                            </InputAddon>
                                        </InputGroup>
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label htmlFor="referredDoctorPhone">Referred Doctor Phone</Label>
                                        <Input
                                            type="text"
                                            id="referredDoctorPhone"
                                            name="referredDoctorPhone"
                                            value={patient.referredDoctorPhone}
                                            onChange={handleChange}
                                            placeholder="Enter doctor's phone"
                                            maxLength={10}
                                        />
                                    </InputWrapper>
                                </FormGrid>
                            </CollapsibleSection>

                            {/* MLC Section */}
                            {/* MLC Section */}
                            <div style={{ marginBottom: "24px" }}>
                                <CheckboxWrapper>
                                    <Checkbox
                                        type="checkbox"
                                        id="isMlc"
                                        checked={isMlc}
                                        onChange={(e) => setIsMlc(e.target.checked)}
                                    />
                                    <CheckboxLabel htmlFor="isMlc">Is Medico-Legal Case (MLC)?</CheckboxLabel>
                                </CheckboxWrapper>

                                {isMlc && (
                                    <CollapsibleSection title="MLC Information" defaultOpen={true} icon={<AlertTriangle size={20} />}>
                                        <FormGrid>
                                            <InputWrapper>
                                                <Label htmlFor="mlcType">MLC Type</Label>
                                                <Select id="mlcType" name="mlcType" value={patient.mlcType} onChange={handleChange}>
                                                    <option value="">Select MLC Type</option>
                                                    <option value="RTA">RTA (Road Traffic Accident)</option>
                                                    <option value="Assault">Assault</option>
                                                    <option value="Poisoning">Poisoning</option>
                                                    <option value="Burns">Burns</option>
                                                    <option value="Fall">Fall</option>
                                                    <option value="Electric Shock">Electric Shock</option>
                                                    <option value="Drowning">Drowning</option>
                                                    <option value="Suicide">Suicide Attempt</option>
                                                    <option value="Workplace Injury">Workplace Injury</option>
                                                    <option value="Other">Other</option>
                                                </Select>
                                            </InputWrapper>
                                            <InputWrapper>
                                                <Label htmlFor="mlcDoc">Upload MLC Doc</Label>
                                                <FileInput type="file" id="mlcDoc" name="mlcDoc" onChange={handleFileChange} />
                                            </InputWrapper>
                                            <InputWrapper className="span-full">
                                                <CheckboxWrapper>
                                                    <Checkbox
                                                        type="checkbox"
                                                        id="passAlertToAuthority"
                                                        name="passAlertToAuthority"
                                                        checked={patient.passAlertToAuthority}
                                                        onChange={handleChange}
                                                    />
                                                    <CheckboxLabel htmlFor="passAlertToAuthority">Pass alert to authority</CheckboxLabel>
                                                </CheckboxWrapper>
                                            </InputWrapper>
                                            <InputWrapper className="span-full">
                                                <Label htmlFor="mlcRemarks">MLC Remarks</Label>
                                                <Textarea
                                                    id="mlcRemarks"
                                                    name="mlcRemarks"
                                                    value={patient.mlcRemarks}
                                                    onChange={handleChange}
                                                    rows={3}
                                                    placeholder="Enter MLC remarks..."
                                                />
                                            </InputWrapper>
                                        </FormGrid>
                                    </CollapsibleSection>
                                )}
                            </div>

                            {/* Next of Kin Section Removed */}

                            {/* New Born Section */}
                            <CollapsibleSection
                                title={
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        New Born
                                        <Tooltip style={{ marginLeft: "8px" }}>
                                            <Info size={16} className="tooltip-icon" />
                                            <span className="tooltip-text">
                                                Register a newborn baby with mother's information. The mother must be registered in the system
                                                with a valid UHID.
                                            </span>
                                        </Tooltip>
                                    </div>
                                }
                                defaultOpen={false}
                                icon={<Baby size={20} />}
                            >
                                <FormGrid>
                                    <InputWrapper>
                                        <Label htmlFor="birthTime">Birth Time</Label>
                                        <InputGroup>
                                            <Input
                                                type="time"
                                                id="birthTime"
                                                name="birthTime"
                                                value={patient.birthTime || ""}
                                                onChange={handleChange}
                                            />
                                            <Select
                                                id="birthTimeAmPm"
                                                name="birthTimeAmPm"
                                                value={patient.birthTimeAmPm || "AM"}
                                                onChange={handleChange}
                                            >
                                                <option value="AM">AM</option>
                                                <option value="PM">PM</option>
                                            </Select>
                                        </InputGroup>
                                    </InputWrapper>

                                    <InputWrapper>
                                        <Label htmlFor="weight">Weight</Label>
                                        <Select id="weight" name="weight" value={patient.weight || ""} onChange={handleChange}>
                                            <option value="">Select Weight</option>
                                            <option value="1">1 kg</option>
                                            <option value="1.5">1.5 kg</option>
                                            <option value="2">2 kg</option>
                                            <option value="2.5">2.5 kg</option>
                                            <option value="3">3 kg</option>
                                            <option value="3.5">3.5 kg</option>
                                            <option value="4">4 kg</option>
                                            <option value="4.5">4.5 kg</option>
                                        </Select>
                                    </InputWrapper>

                                    <InputWrapper>
                                        <Label htmlFor="mothersUhidNo">Mother's UHID No</Label>
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                id="mothersUhidNo"
                                                name="mothersUhidNo"
                                                value={patient.mothersUhidNo || ""}
                                                onChange={handleChange}
                                                placeholder="Enter Mother's UHID"
                                            />
                                            <InputAddon onClick={searchMotherUhid}>
                                                <Search size={16} />
                                            </InputAddon>
                                        </InputGroup>
                                    </InputWrapper>

                                    <InputWrapper>
                                        <Label htmlFor="pediatricianResponsible">Pediatrician Responsible</Label>
                                        <Select
                                            id="pediatricianResponsible"
                                            name="pediatricianResponsible"
                                            value={patient.pediatricianResponsible || ""}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Pediatrician</option>
                                            {doctors
                                                .filter((doctor) => doctor.specialty === "Pediatrician")
                                                .map((doctor, index) => (
                                                    <option key={`ped-${index}`} value={doctor.name}>
                                                        {doctor.name}
                                                    </option>
                                                ))}
                                            {doctors.filter((doctor) => doctor.specialty === "Pediatrician").length === 0 &&
                                                doctors.map((doctor, index) => (
                                                    <option key={index} value={doctor.name}>
                                                        {doctor.name}
                                                    </option>
                                                ))}
                                        </Select>
                                    </InputWrapper>
                                </FormGrid>

                                <ButtonContainer>
                                    <Button type="button" onClick={handleNewBornRegistration} style={{ backgroundColor: '#be185d', color: 'white' }}>
                                        Confirm New Born Details
                                    </Button>
                                </ButtonContainer>
                            </CollapsibleSection>

                            <ButtonContainer>
                                <Button type="submit" primary>
                                    {patient.mothersUhidNo ? "Save New Born & Patient" : "Save Patient"}
                                </Button>
                                <Button type="button" onClick={() => navigate(-1)}>
                                    Cancel
                                </Button>
                            </ButtonContainer>
                        </form>
                    </FormContainer >



                </div>

                <SidebarWrapper>
                    {/* Doctor Fee Calculator */}
                    < DoctorContainer >
                        <ContainerTitle>Doctor Fee Calculator</ContainerTitle>
                        <FormGrid columns={1}>
                            <InputWrapper>
                                <Label htmlFor="doctorSelect">Doctor</Label>
                                <SearchableSelectWrapper>
                                    <Input
                                        type="text"
                                        id="doctorSelect"
                                        onChange={handleDoctorChange}
                                        value={patient.doctorName || ""}
                                        placeholder="Type to search doctor..."
                                        autoComplete="off"
                                        onFocus={() => setIsDoctorDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setIsDoctorDropdownOpen(false), 200)} // Delay to allow click
                                    />
                                    {isDoctorDropdownOpen && (
                                        <DropdownList>
                                            {doctors
                                                .filter(doc => doc.name.toLowerCase().includes((patient.doctorName || "").toLowerCase()))
                                                .map((doctor, index) => (
                                                    <DropdownItem key={index} onClick={() => handleDoctorSelect(doctor)}>
                                                        {doctor.name}
                                                    </DropdownItem>
                                                ))}
                                            {doctors.length > 0 && doctors.filter(doc => doc.name.toLowerCase().includes((patient.doctorName || "").toLowerCase())).length === 0 && (
                                                <div style={{ padding: "10px 16px", color: "#64748b", fontSize: "14px" }}>No doctors found</div>
                                            )}
                                        </DropdownList>
                                    )}
                                </SearchableSelectWrapper>
                            </InputWrapper>

                            <FeeContainer>
                                <FeeItem>
                                    <Label htmlFor="registrationFee">Registration Fee (₹)</Label>
                                    <Input
                                        id="registrationFee"
                                        type="number"
                                        value={registrationFee.toFixed(2)}
                                        onChange={(e) => handleFeeChange("registration", e.target.value)}
                                    />
                                </FeeItem>
                                <FeeItem>
                                    <Label htmlFor="consultingFee">Consulting Fee (₹)</Label>
                                    <Input
                                        id="consultingFee"
                                        type="number"
                                        value={consultingFee.toFixed(2)}
                                        onChange={(e) => handleFeeChange("consulting", e.target.value)}
                                    />
                                </FeeItem>

                                <TotalFeeItem>
                                    <Label htmlFor="totalFee">Total Fees (₹)</Label>
                                    <Input id="totalFee" type="number" value={totalFees.toFixed(2)} readOnly />
                                </TotalFeeItem>
                            </FeeContainer>


                        </FormGrid>
                    </DoctorContainer >

                    <div style={{ marginTop: '24px' }}>
                        <QRRegistrationSidebar onDataReceived={handleQRDataReceived} />
                    </div>
                </SidebarWrapper>

            </MainContentWrapper >

            {/* Search Results Modal */}
            < Modal
                show={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                title="Search Results"
                footer={
                    < Button type="button" onClick={() => setShowSearchModal(false)}>
                        Close
                    </Button >
                }
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>UHID</TableHeaderCell>
                            <TableHeaderCell>Name</TableHeaderCell>
                            <TableHeaderCell>Gender</TableHeaderCell>
                            <TableHeaderCell>Mobile</TableHeaderCell>
                            <TableHeaderCell>Action</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patients.length > 0 ? (
                            patients.map((p, index) => (
                                <TableRow key={index}>
                                    <TableCell>{p.uhid}</TableCell>
                                    <TableCell>{`${p.salutation || ""} ${p.firstName} ${p.lastName}`}</TableCell>
                                    <TableCell>{p.gender}</TableCell>
                                    <TableCell>{p.mobilePhone}</TableCell>
                                    <TableCell>
                                        <Button type="button" small onClick={() => handleSelectPatient(p)}>
                                            Renew
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    No patients found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Modal >

            <QRRegistrationModal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                onDataReceived={handleQRDataReceived}
            />

            {/* Reference Doctor Form Modal */}
            {
                isModalOpen && (
                    <ReferenceDoctorForm
                        closeModal={() => setIsModalOpen(false)}
                        setReferredBy={(name) => {
                            setPatient(prev => ({ ...prev, referredBy: name }));
                            setSearchDoctorTerm(name);
                        }}
                        fetchReferenceDoctors={loadReferenceDoctors}
                    />
                )
            }
        </PageContainer >
    )
}

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  padding: 24px;
`

const PageHeader = styled.header`
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const PageTitle = styled.h1`
  color: #0f172a;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.8px;
  margin: 0;
  
  span {
    color: #0d9488;
  }
`

const MainContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: start;
  
  @media (min-width: 1280px) {
    grid-template-columns: 1fr 360px;
  }
`

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const DoctorContainer = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 24px;
  border: 1px solid #e2e8f0;
  position: sticky;
  top: 24px;
`

const SearchContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 8px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  margin-bottom: 12px;
`

const SearchRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  align-items: end;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const ContainerTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f5f9;
  letter-spacing: -0.5px;
`

const SectionWrapper = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  margin-bottom: 24px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
  }
`

const SectionHeader = styled.div`
  padding: 20px 24px;
  background: #fff;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  
  &:hover {
    background-color: #f8fafc;
  }
`

const SectionIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f0fdfa;
  color: #0d9488;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  
  svg {
    width: 20px;
    height: 20px;
  }
`

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  flex: 1;
`

const SectionContent = styled.div`
  padding: 28px;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 2}, 1fr);
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  .span-full {
    grid-column: 1 / -1;
  }
`

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  &.span-full {
    grid-column: 1 / -1;
  }
`

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-left: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
`

const RequiredAsterisk = styled.span`
  color: #fb7185;
`

const Input = styled.input`
  height: 48px;
  padding: 0 16px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 15px;
  color: #334155;
  background: #fff;
  transition: all 0.2s ease-in-out;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }
  
  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: #cbd5e1;
  }
`

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 15px;
  color: #334155;
  background: #fff;
  transition: all 0.2s ease-in-out;
  width: 100%;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }
`

const Select = styled.select`
  height: 48px;
  padding: 0 16px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 15px;
  color: #334155;
  background-color: #fff;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }

  &.age-unit {
    width: 90px;
    flex-shrink: 0;
  }
`

const Textarea = styled.textarea`
  padding: 16px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 15px;
  color: #334155;
  min-height: 120px;
  resize: vertical;
  width: 100%;
  transition: all 0.2s;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }
`

const InputGroup = styled.div`
  display: flex;
  gap: 0;
  
  ${Input}, ${Select} {
    border-radius: 12px 0 0 12px;
    border-right: none;
  }
  
  ${Select}.age-unit {
    border-radius: 0 12px 12px 0;
    border: 1px solid #cbd5e1;
    border-left: none;
  }

  &:focus-within {
     ${Input}, ${Select} {
        border-color: #0d9488;
     }
  }
`

const InputAddon = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 0 12px 12px 0;
  padding: 0 20px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #1e293b;
  }
  
  svg {
    width: 20px;
  }
`

const FileInput = styled.input`
  font-size: 14px;
  width: 100%;
  color: #64748b;
  
  &::file-selector-button {
    margin-right: 16px;
    padding: 10px 20px;
    border-radius: 10px;
    background: #f1f5f9;
    color: #475569;
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
    
    &:hover {
      background: #e2e8f0;
    }
  }
`

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-top: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #cbd5e1;
    background: #f1f5f9;
  }
`

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-right: 12px;
  accent-color: #0d9488;
`

const CheckboxLabel = styled.label`
  font-size: 15px;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  display: flex;
  flex: 1;
`

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
`

const Button = styled.button`
  height: 48px;
  padding: 0 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  ${props => props.primary ? `
    background: #0d9488;
    color: white;
    border: none;
    box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.2);
    
    &:hover {
      background: #0f766e;
      transform: translateY(-1px);
      box-shadow: 0 6px 8px -1px rgba(13, 148, 136, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  ` : props.small ? `
    height: 36px;
    padding: 0 16px;
    font-size: 13px;
    background: white;
    border: 1px solid #cbd5e1;
    color: #475569;
    
    &:hover {
      border-color: #94a3b8;
      background: #f8fafc;
      color: #0f172a;
    }
  ` : `
    background: white;
    border: 2px solid #e2e8f0;
    color: #64748b;
    
    &:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
      color: #0f172a;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

const FeeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`

const FeeItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const TotalFeeItem = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px dashed #cbd5e1;
  
  ${Label} {
    font-size: 16px;
    color: #0f172a;
    margin-bottom: 8px;
  }
  
  ${Input} {
    font-size: 24px;
    font-weight: 700;
    color: #0d9488;
    border: 2px solid #0d9488;
    background: #f0fdfa;
    height: 64px;
    text-align: right;
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
`

const ModalContainer = styled.div`
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`

const CloseButton = styled.button`
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  
  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
`

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`

const ModalFooter = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-collapse: separate;
  border-spacing: 0;
`

const SearchableSelectWrapper = styled.div`
  position: relative;
  width: 100%;
`

const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
`

const DropdownItem = styled.li`
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #1e293b;
  transition: background 0.2s;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8fafc;
    color: #0d9488;
  }
`

const TableHeader = styled.thead`
  background: #f8fafc;
`

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
`

const TableBody = styled.tbody``

const TableRow = styled.tr`
  &:hover {
    background: #f8fafc;
  }
`

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #334155;
  border-bottom: 1px solid #e2e8f0;
  
  ${TableRow}:last-child & {
    border-bottom: none;
  }
  
  &.text-center {
    text-align: center;
  }
`

const Tooltip = styled.div`
  position: relative;
  display: inline-flex;
  margin-left: 8px;
  
  .tooltip-icon {
    color: #94a3b8;
    cursor: help;
    transition: color 0.2s;
    
    &:hover {
      color: #0d9488;
    }
  }
`

const SidebarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export default PatientRegistrationForm
