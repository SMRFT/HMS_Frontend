import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import {
  Search,
  Plus,
  ArrowLeft,
  Save,
  CheckCircle,
  Printer,
  Trash2,
  Edit,
  Eye,
  FileText,
  AlertCircle,
  Calendar,
  User,
  Activity,
  Check,
  Building,
  ChevronDown,
  Layers,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import PatientSearchModal from "../Common/PatientSearchModal";
import headerImage from "../Images/Header.png";
import footerImage from "../Images/Footer.png";

// ─── Styled Components (Mobile Responsive) ────────────────────────────────────

const Container = styled.div`
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
  box-sizing: border-box;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }

  @media print {
    padding: 0;
    background: #fff;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  gap: 0.75rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 0.85rem 1rem;
  }

  @media print {
    display: none;
  }
`;

const Title = styled.h1`
  font-size: clamp(1.15rem, 3vw, 1.45rem);
  color: #0f766e;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  word-break: break-word;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    > button, > div {
      flex: 1 1 calc(50% - 0.5rem);
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    > button, > div {
      flex: 1 1 100%;
    }
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  white-space: nowrap;

  ${(props) =>
    props.$variant === "primary" &&
    `
    background: #0f766e;
    color: white;
    &:hover { background: #115e59; }
  `}

  ${(props) =>
    props.$variant === "success" &&
    `
    background: #16a34a;
    color: white;
    &:hover { background: #15803d; }
  `}

  ${(props) =>
    props.$variant === "outline" &&
    `
    background: white;
    border-color: #cbd5e1;
    color: #334155;
    &:hover { background: #f1f5f9; border-color: #94a3b8; }
  `}

  ${(props) =>
    props.$variant === "danger" &&
    `
    background: #ef4444;
    color: white;
    &:hover { background: #dc2626; }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  padding: clamp(0.75rem, 2.5vw, 1.25rem);
  margin-bottom: 1.25rem;
  box-sizing: border-box;
  width: 100%;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.85rem;
  align-items: flex-end;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  grid-column: span ${(props) => props.$cols || 1};
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    grid-column: span ${(props) => Math.min(12, Math.max(6, (props.$cols || 1) * 2))};
  }

  @media (max-width: 768px) {
    grid-column: 1 / -1 !important;
  }
`;

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
  background: white;
  transition: border-color 0.15s;

  &:focus {
    border-color: #0f766e;
    box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.15);
  }

  &:disabled {
    background: #f8fafc;
    color: #64748b;
  }
`;

const Select = styled.select`
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
  background: white;
  transition: border-color 0.15s;

  &:focus {
    border-color: #0f766e;
    box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.15);
  }

  &:disabled {
    background: #f8fafc;
    color: #64748b;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
  background: white;
  resize: vertical;
  min-height: ${(props) => (props.rows ? `${props.rows * 24}px` : "72px")};
  font-family: inherit;

  &:focus {
    border-color: #0f766e;
    box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.15);
  }

  &:disabled {
    background: #f8fafc;
    color: #64748b;
  }
`;

const InputWithSearch = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
`;

const SearchTriggerBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #0f766e;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
  flex-shrink: 0;

  &:hover {
    background: #115e59;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TableResponsiveContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  text-align: left;
  min-width: 650px;
`;

const Th = styled.th`
  background: #f1f5f9;
  color: #334155;
  font-weight: 700;
  padding: 0.7rem 0.85rem;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.7rem 0.85rem;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
  background: ${(props) => (props.$approved ? "#dcfce7" : "#fef3c7")};
  color: ${(props) => (props.$approved ? "#15803d" : "#b45309")};
  border: 1px solid ${(props) => (props.$approved ? "#86efac" : "#fde68a")};
  white-space: nowrap;
`;

const FormSectionHeader = styled.div`
  background: #0f766e;
  color: white;
  padding: 0.55rem 0.9rem;
  font-weight: 700;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  border-radius: 6px;
  margin-top: 1.25rem;
  margin-bottom: 0.85rem;
  word-break: break-word;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.85rem;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const QuickSearchCard = styled(Card)`
  background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%);
  border: 1px solid #99f6e4;
`;

const QuickSearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CheckboxInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: #1e293b;
  cursor: pointer;
  min-width: 170px;
  flex-shrink: 0;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #0f766e;
  }
`;

// ─── Modal Styles for Template Selection ──────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 620px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
`;

const ModalBody = styled.div`
  padding: 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TemplateCard = styled.div`
  border: 1.5px solid ${(props) => (props.$selected ? "#0f766e" : "#e2e8f0")};
  background: ${(props) => (props.$selected ? "#f0fdfa" : "white")};
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #0f766e;
    background: #f0fdfa;
  }
`;

// ─── Print Dropdown / Popover ─────────────────────────────────────────────────

const PrintDropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const PrintDropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 220px;
  overflow: hidden;
`;

const PrintDropdownItem = styled.div`
  padding: 0.6rem 0.9rem;
  font-size: 0.85rem;
  color: #334155;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.15s;

  &:hover {
    background: #f1f5f9;
    color: #0f766e;
    font-weight: 600;
  }
`;

const PortalDropdownMenu = styled.div`
  position: fixed;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  min-width: 210px;
  z-index: 99999;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  padding: 4px 0;
`;

const PortalDropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0.7rem 1rem;
  text-align: left;
  border: none;
  background-color: white;
  color: #1e293b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #f1f5f9;
    color: #0f766e;
  }
`;

const PrintModalCard = styled.div`
  background: white;
  width: 960px;
  max-width: 95vw;
  max-height: 92vh;
  border-radius: 14px;
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
  display: flex;
  justify-content: center;
`;

const PrintSheet = styled.div`
  background: white;
  width: 100%;
  max-width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  font-family: "Segoe UI", Arial, sans-serif;
  color: #0f172a;
  box-sizing: border-box;

  @media print {
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
  }
`;

// ─── Print Layout Container ───────────────────────────────────────────────────

const PrintCertificateContainer = styled.div`
  display: none;

  @media print {
    display: block;
    padding: 0;
    margin: 0;
    font-family: "Segoe UI", Arial, sans-serif;
    color: #0f172a;
    line-height: 1.4;

    /* If withLetterpad is false, leave top padding for physical pre-printed letterhead */
    ${(props) =>
    !props.$withLetterpad &&
    `
      padding-top: 105px;
    `}
  }

  .sec-title {
    font-size: 11.5px;
    font-weight: 800;
    color: #1e3a8a;
    border-bottom: 2px solid #1e3a8a;
    padding-bottom: 2px;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
`;

// ─── Gender Normalizer Helper ─────────────────────────────────────────────────

const normalizeGender = (g, salutation) => {
  if (g !== undefined && g !== null && String(g).trim() !== "") {
    const s = String(g).trim().toUpperCase();
    if (s === "FEMALE" || s === "F" || s === "WOMAN" || s.startsWith("FEM")) return "Female";
    if (s === "MALE" || s === "M" || s === "MAN" || s.startsWith("MAL")) return "Male";
    if (
      s === "OTHER" ||
      s === "OTHERS" ||
      s === "O" ||
      s === "TRANS" ||
      s === "TRANSGENDER" ||
      s === "TG" ||
      s === "T"
    )
      return "Other";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  if (salutation) {
    const sal = String(salutation).toLowerCase().replace(/[^a-z]/g, "");
    if (["mr", "master", "sir", "baba"].includes(sal)) return "Male";
    if (["mrs", "ms", "miss", "selvi", "dr", "smt", "madam"].includes(sal)) return "Female";
  }
  return "";
};

// ─── Doctor Reg. No & Signature Formatter (RDPrint Centered Format) ───────────
const formatDoctorReg = (reg, hasDoctorName = false) => {
  if (!reg || !String(reg).trim()) {
    return hasDoctorName ? "" : "Reg. No: ____________";
  }
  const clean = String(reg).trim();
  if (/^reg\.?\s*no\.?:?/i.test(clean)) {
    return clean;
  }
  return `Reg. No: ${clean}`;
};

const formatDoctorRegNo = formatDoctorReg;

// ─── Oncology & Hospital Consultants Master Directory ─────────────────────────
const ONCOLOGY_DOCTORS_MASTER = [
  // Medical Oncology
  {
    name: "Dr. R. Vidhya, MD(RT), DM.",
    searchTerms: ["vidhya"],
    specialty: "Medical Oncology",
    department: "Medical Oncology",
    designation: "Medical Oncologist",
    regNo: "63108",
    category: "medical_oncology",
  },
  // Radiation Oncology
  {
    name: "Dr. Srikanth Shankar, MD(RT)",
    searchTerms: ["srikant", "srikanth", "shankar"],
    specialty: "Radiation Oncology",
    department: "Radiation Oncology",
    designation: "Radiation Oncologist",
    regNo: "456789",
    category: "radiation_oncology",
  },
  {
    name: "Dr. Dharmaraj A, MBBS, MD",
    searchTerms: ["dharmaraj"],
    specialty: "Radiation Oncology",
    department: "Radiation Oncology",
    designation: "Radiation Oncologist",
    regNo: "58291",
    category: "radiation_oncology",
  },
  {
    name: "Dr. K. Satheesh Babu, MD, DMRT",
    searchTerms: ["satheesh", "babu"],
    specialty: "Radiation Oncology",
    department: "Radiation Oncology",
    designation: "Radiation Oncologist",
    regNo: "42110",
    category: "radiation_oncology",
  },
  {
    name: "Dr. Venkatesan, MD(RT)",
    searchTerms: ["venkatesan"],
    specialty: "Radiation Oncology",
    department: "Radiation Oncology",
    designation: "Radiation Oncologist",
    regNo: "39812",
    category: "radiation_oncology",
  },
  {
    name: "Dr. Vijayaveeran P, MD(RT)",
    searchTerms: ["vijayaveeran"],
    specialty: "Radiation Oncology",
    department: "Radiation Oncology",
    designation: "Radiation Oncologist",
    regNo: "61204",
    category: "radiation_oncology",
  },
  {
    name: "Dr. Sridhar, DNB RT",
    searchTerms: ["sridhar"],
    specialty: "Radiation Oncology",
    department: "Radiation Oncology",
    designation: "Radiation Oncologist",
    regNo: "54321",
    category: "radiation_oncology",
  },
  // Surgical Oncology
  {
    name: "Dr. G. Prasanna, MS, DNB (Onco)",
    searchTerms: ["prasanna"],
    specialty: "Surgical Oncology",
    department: "Surgical Oncology",
    designation: "Surgical Oncologist",
    regNo: "4521464",
    category: "surgical_oncology",
  },
  {
    name: "Dr. P. Arunraj, MS, MCh (Surg Gastro)",
    searchTerms: ["arunraj"],
    specialty: "Surgical Gastroenterology",
    department: "Surgical Gastroenterology",
    designation: "Surgical Gastroenterologist",
    regNo: "47120",
    category: "surgical_oncology",
  },
  // Other Hospital Consultants
  {
    name: "Dr. P. S. Panneer Selvam, MS, FICS, FAIGES",
    searchTerms: ["panneer"],
    specialty: "General Surgery",
    department: "General Surgery",
    designation: "General Surgeon",
    regNo: "38910",
    category: "general_consultant",
  },
  {
    name: "Dr. R. Murugavel, MS, FAIGES",
    searchTerms: ["murugavel"],
    specialty: "General Surgery",
    department: "General Surgery",
    designation: "General Surgeon",
    regNo: "41235",
    category: "general_consultant",
  },
  {
    name: "Dr. Ramesh Ethiraj, MCh",
    searchTerms: ["ramesh", "ethiraj"],
    specialty: "Urology",
    department: "Urology",
    designation: "Urologist",
    regNo: "49201",
    category: "general_consultant",
  },
  {
    name: "Dr. Arun Kumar B, MD, DNB",
    searchTerms: ["arun kumar"],
    specialty: "Cardiology",
    department: "Cardiology",
    designation: "Cardiologist",
    regNo: "52140",
    category: "general_consultant",
  },
  {
    name: "Dr. S. Nerthiha, DNB",
    searchTerms: ["nerthiha"],
    specialty: "Emergency Medicine",
    department: "Emergency Medicine",
    designation: "Consultant Emergency Medicine",
    regNo: "65412",
    category: "general_consultant",
  },
  {
    name: "Dr. Harihara Sudhan",
    searchTerms: ["harihara"],
    specialty: "Neuro Surgery",
    department: "Neuro Surgery",
    designation: "Neuro Surgeon",
    regNo: "51289",
    category: "general_consultant",
  },
  {
    name: "Dr. Vengatesan, MD, DM",
    searchTerms: ["vengatesan"],
    specialty: "Neurology",
    department: "Neurology",
    designation: "Neurologist",
    regNo: "43290",
    category: "general_consultant",
  },
  {
    name: "Dr. Mahesh, MD, DM",
    searchTerms: ["mahesh"],
    specialty: "Rheumatology",
    department: "Rheumatology",
    designation: "Rheumatologist",
    regNo: "48102",
    category: "general_consultant",
  },
  {
    name: "Dr. Narendran P, MS",
    searchTerms: ["narendran"],
    specialty: "Orthopedics",
    department: "Orthopedics",
    designation: "Orthopedic Surgeon",
    regNo: "44321",
    category: "general_consultant",
  },
  {
    name: "Dr. P. Prabu Sankar, MS, MRCS",
    searchTerms: ["prabu"],
    specialty: "General Medicine",
    department: "General Medicine",
    designation: "Physician",
    regNo: "46781",
    category: "general_consultant",
  },
  {
    name: "Dr. Pavithra, DNB",
    searchTerms: ["pavithra"],
    specialty: "Obstetrics and Gynecology",
    department: "Obstetrics and Gynecology",
    designation: "Gynecologist",
    regNo: "53412",
    category: "general_consultant",
  },
  {
    name: "Dr. Priyadharshini, DCH, DNB",
    searchTerms: ["priyadharshini"],
    specialty: "Paediatrics",
    department: "Paediatrics",
    designation: "Paediatrician",
    regNo: "55120",
    category: "general_consultant",
  },
  {
    name: "Dr. Ranganathan, MD",
    searchTerms: ["ranganathan"],
    specialty: "General Medicine",
    department: "General Medicine",
    designation: "Physician",
    regNo: "37890",
    category: "general_consultant",
  },
  {
    name: "Dr. Sangeetha, MD",
    searchTerms: ["sangeetha"],
    specialty: "General Medicine",
    department: "General Medicine",
    designation: "Physician",
    regNo: "50192",
    category: "general_consultant",
  },
  {
    name: "Dr. Sathian, MBBS, MRCP",
    searchTerms: ["sathian"],
    specialty: "Endocrinology",
    department: "Endocrinology",
    designation: "Endocrinologist",
    regNo: "48920",
    category: "general_consultant",
  },
  {
    name: "Dr. Shanmuga Priyan, MD",
    searchTerms: ["shanmuga priyan"],
    specialty: "Dermatology",
    department: "Dermatology",
    designation: "Dermatologist",
    regNo: "57210",
    category: "general_consultant",
  },
  {
    name: "Dr. Shikha K.C, MBBS, DNB",
    searchTerms: ["shikha"],
    specialty: "Pulmonology",
    department: "Pulmonology",
    designation: "Pulmonologist",
    regNo: "59340",
    category: "general_consultant",
  },
  {
    name: "Dr. Siddharth, MD, DM",
    searchTerms: ["siddharth"],
    specialty: "Medical Gastroenterology",
    department: "Medical Gastroenterology",
    designation: "Medical Gastroenterologist",
    regNo: "56123",
    category: "general_consultant",
  },
  {
    name: "Dr. Sivakumar",
    searchTerms: ["sivakumar"],
    specialty: "ENT",
    department: "ENT",
    designation: "ENT Specialist",
    regNo: "40215",
    category: "general_consultant",
  },
  {
    name: "Dr. Velraj, MD",
    searchTerms: ["velraj"],
    specialty: "Pulmonology",
    department: "Pulmonology",
    designation: "Pulmonologist",
    regNo: "45129",
    category: "general_consultant",
  },
  {
    name: "Dr. Vidhya Prabhakar",
    searchTerms: ["vidhya prabhakar"],
    specialty: "Obstetrics and Gynecology",
    department: "Obstetrics and Gynecology",
    designation: "Gynecologist",
    regNo: "41982",
    category: "general_consultant",
  },
  {
    name: "Dr. Vignesh D, MS",
    searchTerms: ["vignesh.d", "vignesh d"],
    specialty: "Orthopedics",
    department: "Orthopedics",
    designation: "Orthopedic Surgeon",
    regNo: "53201",
    category: "general_consultant",
  },
  {
    name: "Dr. Vigneshwaran",
    searchTerms: ["vigneshwaran"],
    specialty: "Cardiothoracic and Vascular Surgery",
    department: "Cardiothoracic and Vascular Surgery",
    designation: "Cardiothoracic Surgeon",
    regNo: "52981",
    category: "general_consultant",
  },
  {
    name: "Dr. Vijay Kannan",
    searchTerms: ["vijay kannan"],
    specialty: "Plastic Surgery",
    department: "Plastic Surgery",
    designation: "Plastic Surgeon",
    regNo: "47812",
    category: "general_consultant",
  },
  {
    name: "Dr. Bhuvaneswari, MDS",
    searchTerms: ["bhuvaneswari"],
    specialty: "Dental",
    department: "Dental",
    designation: "Dental Surgeon",
    regNo: "36120",
    category: "general_consultant",
  },
  {
    name: "Dr. Elakeswari, BDS",
    searchTerms: ["elakeswari"],
    specialty: "Dental",
    department: "Dental",
    designation: "Dental Surgeon",
    regNo: "35912",
    category: "general_consultant",
  },
  {
    name: "Dr. Chakravarthi",
    searchTerms: ["chakravarthi"],
    specialty: "Nephrology",
    department: "Nephrology",
    designation: "Nephrologist",
    regNo: "44102",
    category: "general_consultant",
  },
  {
    name: "Dr. J. Jegapriya",
    searchTerms: ["jegapriya"],
    specialty: "General Medicine",
    department: "General Medicine",
    designation: "Physician",
    regNo: "49821",
    category: "general_consultant",
  },
  {
    name: "Dr. Suresh Kumar",
    searchTerms: ["suresh kumar"],
    specialty: "Anesthesiology",
    department: "Anesthesiology",
    designation: "Anesthesiologist",
    regNo: "41902",
    category: "general_consultant",
  },
  {
    name: "Dr. Karthick V, MBBS",
    searchTerms: ["karthick"],
    specialty: "Anesthesiology",
    department: "Anesthesiology",
    designation: "Anesthesiologist",
    regNo: "51092",
    category: "general_consultant",
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function TumourBoardCertificaiton() {
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // View state: "list" | "form"
  const [viewMode, setViewMode] = useState("list");

  // Templates from hospital_tumourTemplate collection
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // List filters
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    uhid: "",
    patientName: "",
    status: "",
  });

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Doctors directory state & custom text mode tracker
  const [doctorsList, setDoctorsList] = useState(ONCOLOGY_DOCTORS_MASTER);
  const [customDoctorFields, setCustomDoctorFields] = useState({});

  // Print mode state: withLetterpad (true/false)
  const [withLetterpad, setWithLetterpad] = useState(true);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const printMenuRef = useRef(null);

  // ── Preview Modal & Action Row Print Dropdown State ─────────────────────────
  const [previewCert, setPreviewCert] = useState(null);
  const [printDropdownPos, setPrintDropdownPos] = useState({ top: 0, left: 0 });
  const [activePrintRowId, setActivePrintRowId] = useState(null);

  const showRowPrintDropdown = (cert, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPrintDropdownPos({ top: rect.bottom + 4, left: rect.right - 210 });
    setActivePrintRowId(cert.id || cert.certificate_id);
  };

  const hideRowPrintDropdown = () => setActivePrintRowId(null);

  const activePrintCert = useMemo(
    () => certificates.find((c) => (c.id || c.certificate_id) === activePrintRowId) || null,
    [certificates, activePrintRowId]
  );

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (
        activePrintRowId &&
        !e.target.closest(".portal-print-dropdown") &&
        !e.target.closest(".print-action-trigger")
      ) {
        setActivePrintRowId(null);
      }
    };
    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("scroll", handleGlobalClick, true);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("scroll", handleGlobalClick, true);
    };
  }, [activePrintRowId]);

  // ── Permissions Mapping ─────────────────────────────────────────────────────
  // HMS-P-TBC (GET - POST) : General access, view certificates, load templates, search, create
  // HMS-P-TBCE (EDIT)      : Edit draft certificates
  // HMS-P-TBCA (APPROVE)   : Approve certificates
  // ── Role & Action Permissions (Verified with SalesReport.js) ───────────────
  // HMS-P-TBC  (GET & POST) : Access page, view certificates & create new certificates
  // canEdit    : HMS-P-TBCE-RW
  // canApprove : HMS-P-TBCA-RW
  // canDelete  : HMS-P-TBCD-RW
  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]"
  );

  const isSuperAdmin =
    allowedActions.includes("HMS-R-SA") ||
    allowedActions.includes("SUPERADMIN");

  const canAccess =
    isSuperAdmin ||
    allowedActions.includes("HMS-P-TBC") ||
    allowedActions.includes("HMS-P-TBC-RW") ||
    allowedActions.includes("HMS-P-TBC-R");

  const canCreate =
    isSuperAdmin ||
    allowedActions.includes("HMS-P-TBC-RW") ||
    allowedActions.includes("HMS-P-TBC");

  const canEdit =
    isSuperAdmin ||
    allowedActions.includes("HMS-P-TBCE-RW") ||
    allowedActions.includes("HMS-P-TBCE");

  const canApprove =
    isSuperAdmin ||
    allowedActions.includes("HMS-P-TBCA-RW") ||
    allowedActions.includes("HMS-P-TBCA");

  const canDelete =
    isSuperAdmin ||
    allowedActions.includes("HMS-P-TBCD-RW") ||
    allowedActions.includes("HMS-P-TBCD");

  // Form state
  const [currentId, setCurrentId] = useState("");
  const [certData, setCertData] = useState({
    certificate_id: "",
    uhid: "",
    ip_op_number: "",
    patient_name: "",
    age: "",
    gender: "",
    phone: "",
    certificate_date: new Date().toISOString().split("T")[0],
    meeting_date: new Date().toISOString().split("T")[0],
    tms_case_ref_no: "",
    scheme_name: "CMCHIS",
    scheme_card_id: "",
    primary_referral_dept: "",
    treating_consultant: "",
    template_id: 1,
    template_name: "TUMOUR BOARD CERTIFICATE (For AB-PMJAY/State Health Schemes)",
    primary_site: "",
    stage: "Stage II",
    board_remarks: "",
    is_approved: false,
    field_values: {
      site_of_malignancy: "",
      histopathology_ihc_details: "",
      tnm_staging: "",
      stage: "Stage II",
      package_code: "",
      procedure_regimen_name: "",
      surgical_oncology: "",
      surgical_oncology_checked: false,
      medical_oncology: "",
      medical_oncology_checked: false,
      radiation_oncology: "",
      radiation_oncology_checked: false,
      palliative_care: "",
      palliative_care_checked: false,
      board_remarks: "",
      certification_statement:
        "We hereby certify that the case details of the aforementioned patient have been reviewed thoroughly by the Multidisciplinary Tumour Board, and the recommended treatment modalities conform to established oncology guidelines for standard patient care.",
      medical_oncologist_name: "",
      medical_oncologist_reg: "",
      radiation_oncologist_name: "",
      radiation_oncologist_reg: "",
      surgical_oncologist_name: "",
      surgical_oncologist_reg: "",
      medical_superintendent_name: "Medical Superintendent / Director",
    },
  });

  // ── PatientSearchModal State ────────────────────────────────────────────────
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientSearchMode, setPatientSearchMode] = useState("uhid"); // "uhid" | "ip"
  const [patientSearchQuery, setPatientSearchQuery] = useState("");

  const openUhidSearch = (queryVal) => {
    setPatientSearchMode("uhid");
    setPatientSearchQuery(typeof queryVal === "string" ? queryVal : certData.uhid || "");
    setShowPatientModal(true);
  };

  const openIpSearch = (queryVal) => {
    setPatientSearchMode("ip");
    setPatientSearchQuery(typeof queryVal === "string" ? queryVal : certData.ip_op_number || "");
    setShowPatientModal(true);
  };

  // Close print dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (printMenuRef.current && !printMenuRef.current.contains(e.target)) {
        setShowPrintMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Fetch Templates from hospital_tumourTemplate collection ─────────────────
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await apiRequest(`${HMSURL}tumour-board-templates/`, "GET");
      const raw = res?.data ?? res;
      const list = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.results)
          ? raw.results
          : Array.isArray(raw)
            ? raw
            : [];
      setTemplates(list);
      if (list.length > 0 && !selectedTemplate) {
        setSelectedTemplate(list[0]);
      }
    } catch (err) {
      console.error("Error fetching tumour board templates:", err);
    }
  }, [HMSURL, selectedTemplate]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // ── Fetch Live Doctors from Diagnostics / Hospital API ───────────────────────
  useEffect(() => {
    const fetchLiveDoctors = async () => {
      try {
        const res = await apiRequest(`${HMSURL}doctor_list_diagnostics/`, "GET");
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (list.length > 0) {
          setDoctorsList((prev) => {
            const combined = [...prev];
            const existingNames = new Set(prev.map((d) => d.name.toLowerCase()));
            list.forEach((doc) => {
              const dName = doc.employeeName || doc.doctor_name || doc.name || "";
              if (dName && !existingNames.has(dName.toLowerCase())) {
                combined.push({
                  name: dName,
                  specialty: doc.specialty || doc.department || "Consultant",
                  department: doc.department || "Consultant",
                  designation: doc.designation || "Doctor",
                  regNo: doc.registrationNumber || "",
                  employeeId: doc.employeeId || "",
                  category: "general_consultant",
                });
                existingNames.add(dName.toLowerCase());
              }
            });
            return combined;
          });
        }
      } catch (err) {
        console.warn("Could not fetch live doctors list, using master directory:", err);
      }
    };
    fetchLiveDoctors();
  }, [HMSURL]);

  // ── Doctor Select Handler (Auto-Fills Registration Number Below) ──────────────
  const handleDoctorSelect = async (fieldKey, doctorName) => {
    const updatedValues = { [fieldKey]: doctorName };

    // Find matching doctor from master list
    const cleanTarget = (doctorName || "").toLowerCase().trim();
    const doc = doctorsList.find(
      (d) =>
        d.name === doctorName ||
        (d.name && d.name.toLowerCase().trim() === cleanTarget) ||
        (d.searchTerms && d.searchTerms.some((st) => cleanTarget.includes(st)))
    );

    let regFieldKey = "";
    if (fieldKey === "medical_oncologist_name") regFieldKey = "medical_oncologist_reg";
    else if (fieldKey === "radiation_oncologist_name") regFieldKey = "radiation_oncologist_reg";
    else if (fieldKey === "surgical_oncologist_name") regFieldKey = "surgical_oncologist_reg";

    if (regFieldKey) {
      let regNo = doc?.regNo || "";
      if (!regNo && doc?.employeeId) {
        try {
          const sigRes = await apiRequest(`${HMSURL}employee-signature/?employee_id=${doc.employeeId}`, "GET");
          if (sigRes?.registrationNumber) {
            regNo = sigRes.registrationNumber;
          }
        } catch (e) {
          console.warn("Error fetching employee signature regNo:", e);
        }
      }
      if (regNo) {
        updatedValues[regFieldKey] = regNo;
      }
    }

    setCertData((prev) => ({
      ...prev,
      field_values: {
        ...prev.field_values,
        ...updatedValues,
      },
    }));
  };

  // ── Helper to build initial values from template fields ─────────────────────
  const buildInitialValuesFromTemplate = (tmpl) => {
    const vals = {};
    (tmpl?.header_fields || []).forEach((hf) => {
      vals[hf.key] = hf.default_value !== undefined ? hf.default_value : "";
    });
    (tmpl?.fields || []).forEach((f) => {
      vals[f.key] = f.default_value !== undefined ? f.default_value : "";
      if (f.type === "checkbox_text") {
        vals[`${f.key}_checked`] = Boolean(f.checked_default);
      }
    });
    return vals;
  };

  const handleHeaderFieldChange = (key, value) => {
    const val = key === "gender" ? normalizeGender(value) : value;
    setCertData((prev) => {
      const updatedFields = { ...prev.field_values, [key]: val };
      const topUpdates = { [key]: val };
      if (key === "meeting_date") topUpdates.certificate_date = val;
      return {
        ...prev,
        ...topUpdates,
        field_values: updatedFields,
      };
    });
  };

  // Group selected template fields by section dynamically
  const groupedSections = React.useMemo(() => {
    const groups = {};
    (selectedTemplate?.fields || []).forEach((field) => {
      const sec = field.section || "Clinical Details & Plan";
      if (!groups[sec]) {
        groups[sec] = [];
      }
      groups[sec].push(field);
    });
    return groups;
  }, [selectedTemplate]);

  // ── Handle Patient Selected from PatientSearchModal ─────────────────────────
  const handlePatientModalSelect = async (patientItem) => {
    setShowPatientModal(false);
    if (!patientItem) return;

    const rawUhid = patientItem.uhid || patientItem.UHID || "";
    const rawIp =
      patientItem.ipNumber ||
      patientItem.ip_number ||
      patientItem.ipOpNumber ||
      "";
    const pName = (
      patientItem.patient_name ||
      [
        patientItem.salutation,
        patientItem.firstName || patientItem.first_name,
        patientItem.lastName || patientItem.last_name,
      ]
        .filter(Boolean)
        .join(" ") ||
      patientItem.name ||
      ""
    ).trim();

    let pAge = String(patientItem.age || patientItem.calculatedAge || "");
    const rawGender =
      patientItem.gender ||
      patientItem.Sex ||
      patientItem.sex ||
      patientItem.patient_details?.gender ||
      patientItem.patient?.gender ||
      patientItem.patientGender ||
      "";
    let pGender = normalizeGender(rawGender, patientItem.salutation);
    const pPhone =
      patientItem.phone ||
      patientItem.mobile ||
      patientItem.mobilePhone ||
      patientItem.contactNumber ||
      "";

    // Immediate update from modal item
    setCertData((prev) => ({
      ...prev,
      uhid: rawUhid || prev.uhid,
      ip_op_number: rawIp || prev.ip_op_number,
      patient_name: pName || prev.patient_name,
      age: pAge || prev.age,
      gender: pGender || prev.gender,
      phone: pPhone || prev.phone,
      field_values: {
        ...prev.field_values,
        uhid: rawUhid || prev.field_values?.uhid || prev.uhid,
        ip_op_number: rawIp || prev.field_values?.ip_op_number || prev.ip_op_number,
        patient_name: pName || prev.field_values?.patient_name || prev.patient_name,
        age: pAge || prev.field_values?.age || prev.age,
        gender: pGender || prev.field_values?.gender || prev.gender,
        phone: pPhone || prev.field_values?.phone || prev.phone,
      },
    }));

    toast.success(`Patient ${pName || rawUhid} selected.`);

    // If gender or age is missing and UHID exists, fetch full details from backend as auto-fallback
    if ((!pGender || !pAge) && rawUhid) {
      try {
        const detailRes = await apiRequest(
          `${HMSURL}tumour-board-patient-detail/?uhid=${encodeURIComponent(rawUhid)}`,
          "GET"
        );
        const dData = detailRes?.data || detailRes;
        if (dData) {
          const fetchedGender = normalizeGender(dData.gender, dData.salutation || patientItem.salutation);
          const fetchedAge = String(dData.age || "");
          if (fetchedGender || fetchedAge) {
            setCertData((prev) => ({
              ...prev,
              age: fetchedAge || prev.age,
              gender: fetchedGender || prev.gender,
              field_values: {
                ...prev.field_values,
                age: fetchedAge || prev.field_values?.age || prev.age,
                gender: fetchedGender || prev.field_values?.gender || prev.gender,
              },
            }));
          }
        }
      } catch (err) {
        console.warn("Auto-fallback fetch patient details failed:", err);
      }
    }
  };

  // ── Fetch Certificates List ─────────────────────────────────────────────────
  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.append("from_date", filters.fromDate);
      if (filters.toDate) params.append("to_date", filters.toDate);
      if (filters.uhid) params.append("uhid", filters.uhid);
      if (filters.patientName) params.append("patient_name", filters.patientName);
      if (filters.status) params.append("status", filters.status);

      const res = await apiRequest(
        `${HMSURL}tumour-board-certificates/?${params.toString()}`,
        "GET"
      );
      const raw = res?.data ?? res;
      const list = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.results)
          ? raw.results
          : Array.isArray(raw)
            ? raw
            : [];
      setCertificates(list);
    } catch (err) {
      console.error("Error fetching certificates:", err);
      setCertificates([]);
      toast.error("Failed to load Tumour Board certificates.");
    } finally {
      setLoading(false);
    }
  }, [HMSURL, filters]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // ── Start New Certificate ───────────────────────────────────────────────────
  const handleNewCertificateClick = () => {
    if (!canAccess) {
      toast.error("You do not have permission (HMS-P-TBC) to create certificates.");
      return;
    }
    if (templates.length > 1) {
      // If multiple templates available, show template selection modal
      setShowTemplateModal(true);
    } else if (templates.length === 1) {
      // Single template, use it directly
      startCertificateWithTemplate(templates[0]);
    } else {
      // Fallback
      startCertificateWithTemplate(null);
    }
  };

  const startCertificateWithTemplate = (tmpl) => {
    setShowTemplateModal(false);
    const chosen = tmpl || selectedTemplate;
    if (chosen) setSelectedTemplate(chosen);

    const initialFields = buildInitialValuesFromTemplate(chosen);

    setCurrentId("");
    setCertData({
      certificate_id: "",
      uhid: "",
      ip_op_number: "",
      patient_name: "",
      age: "",
      gender: "",
      phone: "",
      certificate_date: new Date().toISOString().split("T")[0],
      meeting_date: new Date().toISOString().split("T")[0],
      tms_case_ref_no: "",
      scheme_name: "CMCHIS",
      scheme_card_id: "",
      primary_referral_dept: "",
      treating_consultant: "",
      template_id: chosen ? chosen.template_id : 1,
      template_name: chosen
        ? chosen.template_name
        : "TUMOUR BOARD CERTIFICATE (For AB-PMJAY/State Health Schemes)",
      primary_site: initialFields.site_of_malignancy || "",
      stage: initialFields.stage || "Stage II",
      board_remarks: initialFields.board_remarks || "",
      is_approved: false,
      field_values: initialFields,
    });
    setViewMode("form");
  };

  const handleEditCertificate = (cert) => {
    setCurrentId(cert.id || cert.certificate_id);

    // Find matching template if available
    const matched = templates.find((t) => t.template_id === cert.template_id);
    if (matched) setSelectedTemplate(matched);

    const fv = cert.field_values || {};

    setCertData({
      certificate_id: cert.certificate_id,
      uhid: cert.uhid,
      ip_op_number: cert.ip_op_number,
      patient_name: cert.patient_name,
      age: cert.age,
      gender: normalizeGender(cert.gender),
      phone: cert.phone,
      certificate_date: cert.certificate_date || new Date().toISOString().split("T")[0],
      meeting_date: cert.meeting_date || cert.certificate_date || new Date().toISOString().split("T")[0],
      tms_case_ref_no: cert.tms_case_ref_no || fv.tms_case_ref_no || "",
      scheme_name: cert.scheme_name || fv.scheme_name || "CMCHIS",
      scheme_card_id: cert.scheme_card_id || fv.scheme_card_id || "",
      primary_referral_dept: cert.primary_referral_dept || fv.primary_referral_dept || "",
      treating_consultant: cert.treating_consultant || fv.treating_consultant || "",
      template_id: cert.template_id || 1,
      template_name: cert.template_name || "TUMOUR BOARD CERTIFICATE (For AB-PMJAY/State Health Schemes)",
      primary_site: cert.primary_site || fv.site_of_malignancy || "",
      stage: cert.stage || fv.stage || "Stage II",
      board_remarks: cert.board_remarks || fv.board_remarks || "",
      is_approved: cert.is_approved,
      field_values: { ...fv },
    });
    setViewMode("form");
  };

  const handleFieldValueChange = (key, value) => {
    setCertData((prev) => {
      const updated = { ...prev.field_values, [key]: value };
      const topUpdates = {};
      if (key === "site_of_malignancy") topUpdates.primary_site = value;
      if (key === "stage") topUpdates.stage = value;
      if (key === "board_remarks") topUpdates.board_remarks = value;

      return {
        ...prev,
        ...topUpdates,
        field_values: updated,
      };
    });
  };

  const handleSaveCertificate = async () => {
    if (!certData.uhid.trim()) {
      toast.warning("UHID is required!");
      return;
    }
    if (!certData.patient_name.trim()) {
      toast.warning("Patient Name is required!");
      return;
    }

    if (currentId && !canEdit) {
      toast.error("You do not have permission (HMS-P-TBCE-RW) to edit certificates.");
      return;
    }
    if (!currentId && !canCreate) {
      toast.error("You do not have permission (HMS-P-TBC-RW) to create certificates.");
      return;
    }

    try {
      const payload = {
        id: currentId,
        ...certData,
        primary_site: certData.field_values.site_of_malignancy || certData.primary_site,
        stage: certData.field_values.stage || certData.stage,
        board_remarks: certData.field_values.board_remarks || certData.board_remarks,
      };
      const endpoint = currentId
        ? `${HMSURL}tumour-board-certificates/edit/`
        : `${HMSURL}tumour-board-certificates/save/`;
      const res = await apiRequest(endpoint, "POST", payload);
      if (res && res.success) {
        toast.success(res.message || "Certificate saved successfully.");
        if (res.id) setCurrentId(res.id);
        if (res.certificate_id) {
          setCertData((prev) => ({ ...prev, certificate_id: res.certificate_id }));
        }
        fetchCertificates();
      } else {
        toast.error(res?.error || "Failed to save certificate.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while saving certificate.");
    }
  };

  const handleApproveCertificate = async (certId) => {
    if (!canApprove) {
      toast.error("You do not have permission (HMS-P-TBCA-RW) to approve certificates.");
      return;
    }

    const idToApprove = certId || currentId;
    if (!idToApprove) {
      toast.warning("Please save the certificate first before approving.");
      return;
    }

    const confirm = await Swal.fire({
      title: "Approve Certificate?",
      text: "Once approved, the certificate is permanently locked for modifications and ready for printing.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f766e",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Approve",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiRequest(
        `${HMSURL}tumour-board-certificates/approve/${encodeURIComponent(idToApprove)}/`,
        "POST"
      );
      if (res && res.success) {
        toast.success("Tumour Board Certificate Approved successfully!");
        setCertData((prev) => ({ ...prev, is_approved: true }));
        fetchCertificates();
      } else {
        toast.error(res?.error || "Failed to approve certificate.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error approving certificate.");
    }
  };

  const handleDeleteCertificate = async (certId) => {
    if (!canDelete) {
      toast.error("You do not have permission (HMS-P-TBCD-RW) to delete certificates.");
      return;
    }

    const confirm = await Swal.fire({
      title: "Delete Certificate?",
      text: "Are you sure you want to delete this draft certificate? (Soft Delete)",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiRequest(
        `${HMSURL}tumour-board-certificates/delete/${encodeURIComponent(certId)}/`,
        "DELETE"
      );
      if (res && res.success) {
        toast.success(res.message || "Certificate deleted successfully.");
        if (viewMode === "form") setViewMode("list");
        fetchCertificates();
      } else {
        toast.error(res?.error || "Failed to delete certificate.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting certificate.");
    }
  };

  // ── Convert image URL to Base64 (matching InternshipDashboard) ─────────────
  const getBase64FromUrl = (url) => {
    return new Promise((resolve) => {
      if (!url) return resolve("");
      if (typeof url === "string" && url.startsWith("data:")) return resolve(url);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width || 794;
          canvas.height = img.naturalHeight || img.height || 140;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (e) {
          resolve(url);
        }
      };
      img.onerror = () => resolve(url);
      img.src = url;
    });
  };

  const formatDateForPrint = (dStr) => {
    if (!dStr) return "/  /";
    if (typeof dStr === "string" && dStr.includes("-")) {
      const parts = dStr.split("T")[0].split("-");
      if (parts.length === 3) {
        return `${parts[2]} / ${parts[1]} / ${parts[0]}`;
      }
    }
    return dStr;
  };

  // ── Dedicated Print Window (Matching InternshipDashboard & Attachments 100%) ──
  const handleDirectPrintCertificate = async (certToPrint, withLetterpadOption = true, previewMode = false) => {
    setShowPrintMenu(false);
    setWithLetterpad(withLetterpadOption);

    const target = certToPrint || certData;
    if (!target) {
      toast.warning("No certificate data to print.");
      return;
    }

    let headerSrc = headerImage;
    let footerSrc = footerImage;
    if (withLetterpadOption) {
      try {
        headerSrc = await getBase64FromUrl(headerImage);
        footerSrc = await getBase64FromUrl(footerImage);
      } catch (e) {
        console.warn("Base64 image conversion error:", e);
      }
    }

    const fv = target.field_values || {};
    const patientName = target.patient_name || "";
    const rawMeetingDate = target.meeting_date || target.certificate_date || "";
    const formattedMeetingDate = formatDateForPrint(rawMeetingDate);
    const tmsCaseRefNo = target.tms_case_ref_no || fv.tms_case_ref_no || target.certificate_id || "";
    const ageGender = [target.age, target.gender].filter(Boolean).join(" / ") || "—";
    const rawSchemeName = target.scheme_name || fv.scheme_name || "CMCHIS";
    const schemeUpper = String(rawSchemeName).toUpperCase();
    const isCmchis = schemeUpper.includes("CMCHIS");
    const isPmjay = schemeUpper.includes("PM-JAY") || schemeUpper.includes("PMJAY");
    const isCghs = schemeUpper.includes("CGHS");
    const selectedSchemeName = isCmchis ? "CMCHIS" : isPmjay ? "PM-JAY" : isCghs ? "CGHS" : rawSchemeName;
    const ipRegNo = target.ip_op_number || target.uhid || "";
    const schemeCardId = target.scheme_card_id || fv.scheme_card_id || "—";
    const primaryReferralDept = target.primary_referral_dept || fv.primary_referral_dept || "—";
    const treatingConsultant = target.treating_consultant || fv.treating_consultant || "—";

    // Section 1
    const siteOfMalignancy = fv.site_of_malignancy || target.primary_site || "—";
    const histopathology = fv.histopathology_ihc_details || "—";
    const tnmStaging = fv.tnm_staging || "—";
    const stageVal = fv.stage || target.stage || "Stage II";

    // Section 2
    const packageCode = fv.package_code || "—";
    const procedureRegimenName = fv.procedure_regimen_name || "—";

    // Section 3
    const surgVal = fv.surgical_oncology || "";
    const isSurg = Boolean(fv.surgical_oncology_checked || surgVal);
    const medVal = fv.medical_oncology || "";
    const isMed = Boolean(fv.medical_oncology_checked || medVal);
    const radVal = fv.radiation_oncology || "";
    const isRad = Boolean(fv.radiation_oncology_checked || radVal);
    const pallVal = fv.palliative_care || "";
    const isPall = Boolean(fv.palliative_care_checked || pallVal);

    // Section 4 (Page 2)
    const boardRemarks = (fv.board_remarks || target.board_remarks || "").trim();
    const certStatement =
      fv.certification_statement ||
      "We hereby certify that the case details of the aforementioned patient have been reviewed thoroughly by the Multidisciplinary Tumour Board, and the recommended treatment modalities conform to established oncology guidelines for standard patient care.";

    // Signatures
    const medOncName = fv.medical_oncologist_name || "";
    const medOncReg = fv.medical_oncologist_reg || "";
    const radOncName = fv.radiation_oncologist_name || "";
    const radOncReg = fv.radiation_oncologist_reg || "";
    const surgOncName = fv.surgical_oncologist_name || "";
    const surgOncReg = fv.surgical_oncologist_reg || "";
    const medSuperintendent = fv.medical_superintendent_name || "Medical Superintendent / Director";

    // Header & Footer HTML (matching InternshipDashboard & MHCList pattern)
    const pageHeaderHtml = withLetterpadOption
      ? `
        <div style="text-align: center; margin-bottom: 4px; width: 100%;">
          <img src="${headerSrc}" alt="Hospital Header" style="width: 100%; height: auto; max-height: 80px; object-fit: fill; display: block;" />
        </div>
      `
      : `
        <div style="height: 105px; margin-bottom: 4px;"></div>
      `;

    const pageFooterHtml = withLetterpadOption
      ? `
        <div style="position: absolute; bottom: 4mm; left: 12mm; right: 12mm; width: calc(100% - 24mm); box-sizing: border-box; text-align: center;">
          <div style="font-size: 8.5px; color: #64748b; font-style: italic; text-align: left; margin-bottom: 2px;">
            * This is an electronically generated Tumour Board Certificate.
          </div>
          <img src="${footerSrc}" alt="Hospital Footer" style="width: 100%; height: auto; max-height: 48px; object-fit: fill; display: block; margin: 0 auto;" />
        </div>
      `
      : ``;

    // ── SINGLE PAGE TUMOUR BOARD CERTIFICATE (Matches MHCList.js Report Print System) ──
    const singlePageHtml = `
      <div class="cert-page" style="height: 297mm; max-height: 297mm; box-sizing: border-box; position: relative; padding: 6mm 12mm 20mm 12mm; font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; background: #fff;">
        ${pageHeaderHtml}

        <!-- Certificate Title -->
        <div style="text-align: center; margin: 3px 0 8px 0;">
          <div style="font-size: 16px; font-weight: 800; color: #1e3a8a; letter-spacing: 0.8px; text-transform: uppercase;">
            TUMOUR BOARD CERTIFICATE
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 2px;">
            (For AB-PMJAY / State Health Schemes)
          </div>
        </div>

        <!-- Patient Demographics Card (MHCList.js Report Style) -->
        <div style="background: #f0fdfa; border: 1.5px solid #5eead4; border-radius: 7px; padding: 7px 12px; margin-bottom: 8px;">
          <!-- Tier 1 -->
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 4px 12px; padding-bottom: 5px; border-bottom: 1px dashed #99f6e4;">
            <div><span style="color:#0f766e; font-weight:700; font-size:9.5px; text-transform:uppercase; display:block; margin-bottom: 1px;">Patient Name</span><strong style="color: #0f172a; font-size: 12.5px; text-transform: uppercase;">${patientName || "—"}</strong></div>
            <div><span style="color:#0f766e; font-weight:700; font-size:9.5px; text-transform:uppercase; display:block; margin-bottom: 1px;">IPD / Reg. No</span><strong style="color: #0f172a; font-size: 12px;">${ipRegNo || "—"}</strong></div>
            <div><span style="color:#0f766e; font-weight:700; font-size:9.5px; text-transform:uppercase; display:block; margin-bottom: 1px;">Age / Gender</span><strong style="color: #0f172a; font-size: 12px;">${ageGender}</strong></div>
          </div>
          <!-- Tier 2 -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px 12px; padding-top: 5px; font-size: 10px;">
            <div><span style="color:#0f766e; font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom: 1px;">Date of Board Meeting</span><strong style="color: #0f172a; font-size: 11px;">${formattedMeetingDate || "—"}</strong></div>
            <div><span style="color:#0f766e; font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom: 1px;">TMS Case / Ref. No</span><strong style="color: #0f172a; font-size: 11px;">${tmsCaseRefNo || "—"}</strong></div>
            <div><span style="color:#0f766e; font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom: 1px;">Scheme Name</span><strong style="color: #0f172a; font-size: 11px;">${selectedSchemeName || "—"}</strong></div>
            <div><span style="color:#0f766e; font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom: 1px;">Patient Scheme Card ID / URN</span><strong style="color: #0f172a; font-size: 11px;">${schemeCardId || "—"}</strong></div>
            <div><span style="color:#0f766e; font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom: 1px;">Primary Referral Dept</span><strong style="color: #0f172a; font-size: 11px;">${primaryReferralDept || "—"}</strong></div>
            <div><span style="color:#0f766e; font-weight:700; font-size:9px; text-transform:uppercase; display:block; margin-bottom: 1px;">Treating Consultant</span><strong style="color: #0f172a; font-size: 11px;">${treatingConsultant || "—"}</strong></div>
          </div>
        </div>

        <!-- ── 1. CLINICAL DIAGNOSIS & STAGING ── -->
        <div style="margin-bottom: 8px;">
          <div class="sec-title">1. CLINICAL DIAGNOSIS &amp; STAGING</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; border: 1px solid #cbd5e1;">
            <tbody>
              <tr>
                <td style="background: #f1f5f9; color: #1e293b; font-weight: 700; padding: 5px 8px; border: 1px solid #cbd5e1; width: 28%;">Site of Malignancy</td>
                <td style="background: #ffffff; color: #0f172a; padding: 5px 8px; border: 1px solid #cbd5e1; width: 72%; font-weight: 600;">${siteOfMalignancy || "—"}</td>
              </tr>
              <tr>
                <td style="background: #f1f5f9; color: #1e293b; font-weight: 700; padding: 5px 8px; border: 1px solid #cbd5e1; width: 28%;">Histopathology (HPE) / IHC Report Details</td>
                <td style="background: #ffffff; color: #0f172a; padding: 5px 8px; border: 1px solid #cbd5e1; width: 72%; font-weight: 600;">${histopathology || "—"}</td>
              </tr>
              <tr>
                <td style="background: #f1f5f9; color: #1e293b; font-weight: 700; padding: 5px 8px; border: 1px solid #cbd5e1; width: 28%;">TNM Staging &amp; Stage</td>
                <td style="background: #ffffff; color: #0f172a; padding: 5px 8px; border: 1px solid #cbd5e1; width: 72%; font-weight: 600;">
                  TNM: <strong style="color: #1e3a8a;">[ ${tnmStaging || "—"} ]</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Stage: <strong style="color: #1e3a8a;">[ ${stageVal || "—"} ]</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ── 2. PROPOSED ONCOLOGY PACKAGE DETAILS ── -->
        <div style="margin-bottom: 8px;">
          <div class="sec-title">2. PROPOSED ONCOLOGY PACKAGE DETAILS</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; border: 1px solid #cbd5e1;">
            <tbody>
              <tr>
                <td style="background: #f1f5f9; color: #1e293b; font-weight: 700; padding: 5px 8px; border: 1px solid #cbd5e1; width: 28%;">${selectedSchemeName || "Scheme"} Package Code</td>
                <td style="background: #ffffff; color: #0f172a; padding: 5px 8px; border: 1px solid #cbd5e1; width: 72%; font-weight: 700; font-family: monospace; font-size: 11.5px;">${packageCode || "—"}</td>
              </tr>
              <tr>
                <td style="background: #f1f5f9; color: #1e293b; font-weight: 700; padding: 5px 8px; border: 1px solid #cbd5e1; width: 28%;">Name of Procedure / Regimen</td>
                <td style="background: #ffffff; color: #0f172a; padding: 5px 8px; border: 1px solid #cbd5e1; width: 72%; font-weight: 600;">${procedureRegimenName || "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ── 3. MULTI-MODAL MANAGEMENT PLAN APPROVED BY THE BOARD ── -->
        <div style="margin-bottom: 8px;">
          <div class="sec-title">3. MULTI-MODAL MANAGEMENT PLAN APPROVED BY THE BOARD</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; border: 1px solid #cbd5e1;">
            <tbody>
              <tr>
                <td style="background: #f1f5f9; color: #1e293b; font-weight: 700; padding: 5px 8px; border: 1px solid #cbd5e1; width: 22%;">Surgical Oncology</td>
                <td style="background: #ffffff; color: #0f172a; padding: 5px 8px; border: 1px solid #cbd5e1; width: 28%; font-weight: 600;">${surgVal || (isSurg ? "RECOMMENDED" : "—")}</td>
                <td style="background: #f1f5f9; color: #1e293b; font-weight: 700; padding: 5px 8px; border: 1px solid #cbd5e1; width: 22%;">Medical Oncology</td>
                <td style="background: #ffffff; color: #0f172a; padding: 5px 8px; border: 1px solid #cbd5e1; width: 28%; font-weight: 600;">${medVal || (isMed ? "RECOMMENDED" : "—")}</td>
              </tr>
              <tr>
                <td style="background: #f1f5f9; color: #1e293b; font-weight: 700; padding: 5px 8px; border: 1px solid #cbd5e1; width: 22%;">Radiation Oncology</td>
                <td style="background: #ffffff; color: #0f172a; padding: 5px 8px; border: 1px solid #cbd5e1; width: 28%; font-weight: 600;">${radVal || (isRad ? "RECOMMENDED" : "—")}</td>
                <td style="background: #f1f5f9; color: #1e293b; font-weight: 700; padding: 5px 8px; border: 1px solid #cbd5e1; width: 22%;">Palliative Care</td>
                <td style="background: #ffffff; color: #0f172a; padding: 5px 8px; border: 1px solid #cbd5e1; width: 28%; font-weight: 600;">${pallVal || (isPall ? "RECOMMENDED" : "—")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ── 4. SPECIFIC RECOMMENDATIONS / BOARD REMARKS ── -->
        <div style="margin-bottom: 7px;">
          <div class="sec-title">4. SPECIFIC RECOMMENDATIONS / BOARD REMARKS</div>
          <div style="text-align: left; border: 1px solid #cbd5e1; background: #ffffff; border-radius: 5px; min-height: 48px; max-height: 62px; padding: 6px 10px; font-size: 11px; line-height: 1.45; box-sizing: border-box; white-space: pre-line; word-break: break-word; color: #0f172a; font-weight: 600; overflow: hidden;">${boardRemarks || "—"}</div>
        </div>

        <!-- Declaration Statement -->
        <div style="font-size: 9.5px; line-height: 1.4; color: #334155; text-align: justify; margin: 4px 0 6px 0; font-style: italic;">
          ${certStatement}
        </div>

        <!-- 3 Doctor Signatures (RDPrint Centered Format - Name, Designation, Reg. No without labels) -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 8px; font-size: 10px;">
          <!-- Medical Oncologist -->
          <div style="text-align: center; width: 31%;">
            <div style="height: 34px;"></div>
            <div style="border-top: 1px dashed #94a3b8; margin-bottom: 3px; width: 85%; margin-left: auto; margin-right: auto;"></div>
            <div style="font-size: 8.5px; color: #64748b; margin-bottom: 3px;">[Signature &amp; Stamp]</div>
            <div style="font-weight: 800; font-size: 11.5px; color: #0f172a; line-height: 1.35;">
              ${medOncName || "________________________"}
            </div>
            <div style="font-weight: 700; font-size: 10px; color: #1e3a8a; line-height: 1.35;">
              Medical Oncologist
            </div>
            <div style="font-size: 9.5px; color: #334155; line-height: 1.35;">
              ${formatDoctorReg(medOncReg, Boolean(medOncName))}
            </div>
          </div>

          <!-- Radiation Oncologist -->
          <div style="text-align: center; width: 31%;">
            <div style="height: 34px;"></div>
            <div style="border-top: 1px dashed #94a3b8; margin-bottom: 3px; width: 85%; margin-left: auto; margin-right: auto;"></div>
            <div style="font-size: 8.5px; color: #64748b; margin-bottom: 3px;">[Signature &amp; Stamp]</div>
            <div style="font-weight: 800; font-size: 11.5px; color: #0f172a; line-height: 1.35;">
              ${radOncName || "________________________"}
            </div>
            <div style="font-weight: 700; font-size: 10px; color: #1e3a8a; line-height: 1.35;">
              Radiation Oncologist
            </div>
            <div style="font-size: 9.5px; color: #334155; line-height: 1.35;">
              ${formatDoctorReg(radOncReg, Boolean(radOncName))}
            </div>
          </div>

          <!-- Surgical Oncologist -->
          <div style="text-align: center; width: 31%;">
            <div style="height: 34px;"></div>
            <div style="border-top: 1px dashed #94a3b8; margin-bottom: 3px; width: 85%; margin-left: auto; margin-right: auto;"></div>
            <div style="font-size: 8.5px; color: #64748b; margin-bottom: 3px;">[Signature &amp; Stamp]</div>
            <div style="font-weight: 800; font-size: 11.5px; color: #0f172a; line-height: 1.35;">
              ${surgOncName || "________________________"}
            </div>
            <div style="font-weight: 700; font-size: 10px; color: #1e3a8a; line-height: 1.35;">
              Surgical Oncologist
            </div>
            <div style="font-size: 9.5px; color: #334155; line-height: 1.35;">
              ${formatDoctorReg(surgOncReg, Boolean(surgOncName))}
            </div>
          </div>
        </div>

        <!-- Center Counter Signature: Medical Superintendent / Director -->
        <div style="text-align: center; width: 50%; margin: 8px auto 0 auto; font-size: 10px;">
          <div style="height: 28px;"></div>
          <div style="border-top: 1px dashed #94a3b8; margin-bottom: 3px; width: 100%;"></div>
          <div style="font-size: 8.5px; color: #64748b;">[Counter Signature &amp; Stamp]</div>
          <div style="font-weight: 800; font-size: 11px; color: #1e3a8a; margin-top: 1px;">
            ${medSuperintendent}
          </div>
        </div>

        ${pageFooterHtml}
      </div>
    `;

    const css = `
      @page {
        size: A4 portrait;
        margin: 0;
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        margin: 0;
        padding: 0;
        background: #f1f5f9;
        font-family: 'Segoe UI', Arial, sans-serif;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .cert-page {
        width: 210mm;
        height: 297mm;
        max-height: 297mm;
        margin: 10px auto;
        box-shadow: 0 4px 14px rgba(0,0,0,0.12);
        box-sizing: border-box;
        background: #fff;
        overflow: hidden;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      .sec-title {
        font-size: 11.5px;
        font-weight: 800;
        color: #1e3a8a;
        border-bottom: 2px solid #1e3a8a;
        padding-bottom: 2px;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
      @media print {
        .no-print { display: none !important; }
        body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
        .cert-page {
          box-shadow: none !important;
          margin: 0 !important;
          width: 210mm !important;
          height: 297mm !important;
          max-height: 297mm !important;
          page-break-after: avoid !important;
          break-after: avoid !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          overflow: hidden !important;
        }
        @page { size: portrait; margin: 0; }
      }
    `;

    const pw = window.open("", "_blank", "width=920,height=880");
    if (!pw) {
      toast.error("Popup blocked! Please allow popups to preview and print the certificate.");
      return;
    }

    pw.document.write(`<!DOCTYPE html>
      <html>
      <head>
        <title>Tumour Board Certificate - ${patientName || "Print"}</title>
        <style>${css}</style>
        <style id="orientation-style">@page { size: portrait; margin: 0; }</style>
      </head>
      <body>
        <div class="no-print" style="position: sticky; top: 0; z-index: 9999; display: flex; gap: 10px; justify-content: flex-end; align-items: center; padding: 10px 16px; background: #0f172a; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="font-size: 13px; font-weight: 600; margin-right: 6px;">Print Preview: ${withLetterpadOption ? "With Letterpad" : "Without Letterpad"}</span>
          <span style="font-size: 12px; color: #94a3b8; margin-right: 4px;">Orientation:</span>
          <button id="btn-portrait" onclick="setOrientation('portrait')"
            style="padding: 5px 14px; font-size: 12px; font-weight: 700; border: 2px solid #0ea5e9; border-radius: 5px; background: #e0f2fe; color: #1e40af; cursor: pointer;">
            Portrait
          </button>
          <button id="btn-landscape" onclick="setOrientation('landscape')"
            style="padding: 5px 14px; font-size: 12px; font-weight: 700; border: 1px solid #475569; border-radius: 5px; background: #1e293b; color: #cbd5e1; cursor: pointer;">
            Landscape
          </button>
          <button onclick="window.print()"
            style="padding: 6px 20px; font-size: 12px; font-weight: 700; border: none; border-radius: 5px; background: #0f766e; color: #fff; cursor: pointer; margin-left: 10px; display: inline-flex; align-items: center; gap: 5px;">
            🖨 Print
          </button>
        </div>

        <script>
          function setOrientation(mode) {
            document.getElementById('orientation-style').textContent =
              '@page { size: ' + mode + '; margin: 0; }';
            var isP = mode === 'portrait';
            var pb = document.getElementById('btn-portrait');
            var lb = document.getElementById('btn-landscape');
            pb.style.background  = isP  ? '#e0f2fe' : '#1e293b';
            pb.style.borderColor = isP  ? '#0ea5e9' : '#475569';
            pb.style.color       = isP  ? '#1e40af' : '#cbd5e1';
            lb.style.background  = !isP ? '#e0f2fe' : '#1e293b';
            lb.style.borderColor = !isP ? '#0ea5e9' : '#475569';
            lb.style.color       = !isP ? '#1e40af' : '#cbd5e1';
          }
          ${
            previewMode
              ? ""
              : `setTimeout(function() {
            window.print();
          }, 450);`
          }
        <\/script>

        ${singlePageHtml}
      </body>
      </html>
    `);
    pw.document.close();
  };

  // ── Fallback in-page Print trigger ─────────────────────────────────────────
  const handlePrint = (withLetterpadOption = true) => {
    handleDirectPrintCertificate(certData, withLetterpadOption);
  };

  return (
    <Container>
      {/* ── Top Header ── */}
      <Header>
        <Title>
          <Activity size={24} /> Multidisciplinary Tumour Board Certification
        </Title>
        <ButtonGroup>
          {viewMode === "form" ? (
            <>
              <Button $variant="outline" onClick={() => setViewMode("list")}>
                <ArrowLeft size={16} /> Back to List
              </Button>
              {!certData.is_approved && ((currentId && canEdit) || (!currentId && canCreate)) && (
                <Button
                  $variant="primary"
                  onClick={handleSaveCertificate}
                >
                  <Save size={16} /> {currentId ? "Update Draft" : "Save Draft"}
                </Button>
              )}
              {certData.is_approved && (
                <Badge $approved={true} style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}>
                  <CheckCircle size={15} /> Approved &amp; Locked
                </Badge>
              )}
            </>
          ) : (
            canCreate && (
              <Button $variant="primary" onClick={handleNewCertificateClick}>
                <Plus size={16} /> New Certificate
              </Button>
            )
          )}
        </ButtonGroup>
      </Header>

      {/* ── View: Certificates List ── */}
      {viewMode === "list" && (
        <>
          <Card>
            <FilterGrid>
              <FormGroup>
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>UHID</Label>
                <Input
                  type="text"
                  placeholder="Filter UHID"
                  value={filters.uhid}
                  onChange={(e) => setFilters({ ...filters, uhid: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Patient Name</Label>
                <Input
                  type="text"
                  placeholder="Filter Name"
                  value={filters.patientName}
                  onChange={(e) => setFilters({ ...filters, patientName: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                </Select>
              </FormGroup>
            </FilterGrid>
          </Card>

          <Card>
            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                Loading certificates...
              </div>
            ) : !Array.isArray(certificates) || certificates.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem", color: "#64748b" }}>
                No Tumour Board certificates found. Click <strong>"New Certificate"</strong> to create one.
              </div>
            ) : (
              <TableResponsiveContainer>
                <Table>
                  <thead>
                    <tr>
                      <Th>Cert. ID</Th>
                      <Th>Date</Th>
                      <Th>UHID</Th>
                      <Th>Patient Name</Th>
                      <Th>Age/Gender</Th>
                      <Th>Scheme</Th>
                      <Th>Site / Stage</Th>
                      <Th style={{ minWidth: "190px" }}>Prepared / Modified / Approved By</Th>
                      <Th>Status</Th>
                      <Th style={{ textAlign: "center" }}>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(certificates) ? certificates : []).map((cert) => (
                      <tr key={cert.id || cert.certificate_id}>
                        <Td style={{ fontWeight: 700, color: "#0f766e" }}>{cert.certificate_id}</Td>
                        <Td>{cert.certificate_date || cert.meeting_date || "—"}</Td>
                        <Td style={{ fontFamily: "monospace" }}>{cert.uhid}</Td>
                        <Td style={{ fontWeight: 600 }}>{cert.patient_name}</Td>
                        <Td>{[cert.age, cert.gender].filter(Boolean).join(" / ") || "—"}</Td>
                        <Td>
                          <span style={{ fontWeight: 600, color: "#0284c7" }}>
                            {cert.scheme_name || cert.field_values?.scheme_name || "CMCHIS"}
                          </span>
                        </Td>
                        <Td>
                          <div style={{ fontWeight: 600 }}>{cert.primary_site || cert.field_values?.site_of_malignancy || "—"}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{cert.stage || cert.field_values?.stage || "Stage II"}</div>
                        </Td>
                        <Td style={{ fontSize: "0.78rem", lineHeight: "1.45" }}>
                          <div style={{ marginBottom: "3px" }}>
                            <span style={{ color: "#64748b", fontWeight: 600 }}>Prepared: </span>
                            <strong style={{ color: "#0f766e" }}>{cert.created_by_name || cert.created_by || "—"}</strong>
                            {cert.created_at && (
                              <span style={{ fontSize: "0.72rem", color: "#94a3b8", display: "block" }}>
                                {new Date(cert.created_at).toLocaleDateString()} {new Date(cert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          {(cert.lastmodified_by_name || cert.lastmodified_by) && (
                            <div style={{ marginBottom: "3px" }}>
                              <span style={{ color: "#64748b", fontWeight: 600 }}>Modified: </span>
                              <strong style={{ color: "#0284c7" }}>{cert.lastmodified_by_name || cert.lastmodified_by}</strong>
                              {cert.lastmodified_date && (
                                <span style={{ fontSize: "0.72rem", color: "#94a3b8", display: "block" }}>
                                  {new Date(cert.lastmodified_date).toLocaleDateString()} {new Date(cert.lastmodified_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          )}
                          <div>
                            <span style={{ color: "#64748b", fontWeight: 600 }}>Approved: </span>
                            {cert.is_approved ? (
                              <>
                                <strong style={{ color: "#16a34a" }}>{cert.approved_by_name || cert.approved_by || "Approved"}</strong>
                                {cert.approved_date && (
                                  <span style={{ fontSize: "0.72rem", color: "#16a34a", display: "block" }}>
                                    {new Date(cert.approved_date).toLocaleDateString()} {new Date(cert.approved_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span style={{ color: "#d97706", fontWeight: 600, fontSize: "0.75rem" }}>Pending</span>
                            )}
                          </div>
                        </Td>
                        <Td>
                          <Badge $approved={cert.is_approved}>
                            {cert.is_approved ? (
                              <>
                                <Check size={12} /> Approved
                              </>
                            ) : (
                              "Draft"
                            )}
                          </Badge>
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          <div style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center" }}>
                            {/* 1. Eye Icon: Preview Certificate (Before & After Approval) */}
                            <Button
                              $variant="outline"
                              style={{ padding: "0.3rem 0.6rem" }}
                              title="Preview Certificate"
                              onClick={() => setPreviewCert(cert)}
                            >
                              <Eye size={14} />
                            </Button>

                            {!cert.is_approved ? (
                              <>
                                {canEdit && (
                                  <Button
                                    $variant="outline"
                                    style={{ padding: "0.3rem 0.6rem" }}
                                    title="Edit Draft"
                                    onClick={() => handleEditCertificate(cert)}
                                  >
                                    <Edit size={14} />
                                  </Button>
                                )}
                                {canApprove && (
                                  <Button
                                    $variant="success"
                                    style={{ padding: "0.3rem 0.6rem" }}
                                    title="Approve Certificate"
                                    onClick={() => handleApproveCertificate(cert.id || cert.certificate_id)}
                                  >
                                    <CheckCircle size={14} />
                                  </Button>
                                )}
                                {canDelete && (
                                  <Button
                                    $variant="danger"
                                    style={{ padding: "0.3rem 0.6rem" }}
                                    title="Delete Draft"
                                    onClick={() => handleDeleteCertificate(cert.id || cert.certificate_id)}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                )}
                                {/* Print disabled before approval */}
                                <Button
                                  $variant="outline"
                                  disabled={true}
                                  style={{
                                    padding: "0.3rem 0.6rem",
                                    opacity: 0.45,
                                    cursor: "not-allowed",
                                    borderColor: "#cbd5e1",
                                    color: "#94a3b8",
                                  }}
                                  title="Approve certificate first to print"
                                >
                                  <Printer size={14} />
                                </Button>
                              </>
                            ) : (
                              <>
                                {/* Approved: Single Print Icon with Two Options */}
                                <Button
                                  className="print-action-trigger"
                                  $variant="primary"
                                  style={{
                                    padding: "0.3rem 0.6rem",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "2px",
                                  }}
                                  title="Print Options (With / Without LetterPad)"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const cId = cert.id || cert.certificate_id;
                                    if (activePrintRowId === cId) {
                                      hideRowPrintDropdown();
                                    } else {
                                      showRowPrintDropdown(cert, e);
                                    }
                                  }}
                                >
                                  <Printer size={14} />
                                  <ChevronDown size={12} />
                                </Button>
                              </>
                            )}
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableResponsiveContainer>
            )}
          </Card>
        </>
      )}

      {/* ── View: Certificate Form ── */}
      {viewMode === "form" && (
        <>
          {certData.is_approved && (
            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                padding: "0.75rem 1rem",
                borderRadius: "6px",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: 600,
              }}
            >
              <CheckCircle size={18} /> This certificate is APPROVED and locked. You can print the certificate below.
            </div>
          )}

          {/* Quick Patient Search Launch Card */}
          {!certData.is_approved && (
            <QuickSearchCard>
              <QuickSearchRow>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#0f766e", fontSize: "0.95rem" }}>
                    🔍 Patient Search (PatientSearchModal)
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "2px" }}>
                    Search and select patient by UHID, IP Number, Name, or Mobile to auto-fill details.
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <SearchTriggerBtn
                    type="button"
                    onClick={() => openUhidSearch(certData.uhid)}
                    title="Search across all OP & Registered Patients"
                  >
                    <Search size={14} /> Search by UHID
                  </SearchTriggerBtn>
                  <SearchTriggerBtn
                    type="button"
                    style={{ background: "#0284c7" }}
                    onClick={() => openIpSearch(certData.ip_op_number)}
                    title="Search currently Admitted Inpatients"
                  >
                    <Building size={14} /> Search Inpatient (IP)
                  </SearchTriggerBtn>
                </div>
              </QuickSearchRow>
            </QuickSearchCard>
          )}

          {/* ── Dynamic Certificate Header & Scheme Details from hospital_tumourTemplate ── */}
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#0f766e",
                  fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <User size={18} /> Certificate Header &amp; Scheme Details
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <Badge $approved={true}>{certData.template_name}</Badge>
                {templates.length > 1 && !certData.is_approved && (
                  <Button
                    $variant="outline"
                    style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                    onClick={() => setShowTemplateModal(true)}
                    title="Select or Switch Template"
                  >
                    <Layers size={13} /> Select Template
                  </Button>
                )}
              </div>
            </div>

            <SectionGrid>
              {(selectedTemplate?.header_fields || []).map((hf) => {
                const colSpan = Number(hf.grid_cols) || 3;
                let curVal =
                  certData[hf.key] !== undefined && certData[hf.key] !== ""
                    ? certData[hf.key]
                    : certData.field_values?.[hf.key] || "";

                if (hf.key === "gender") {
                  curVal = normalizeGender(curVal);
                }

                // Treating Consultant Dropdown Selection
                if (hf.key === "treating_consultant") {
                  const isCustom = Boolean(customDoctorFields["treating_consultant"]);
                  const cleanCur = (curVal || "").toLowerCase().trim();
                  const matchedDoc = doctorsList.find(
                    (d) =>
                      d.name === curVal ||
                      (d.name && d.name.toLowerCase().trim() === cleanCur) ||
                      (d.searchTerms && d.searchTerms.some((st) => cleanCur.includes(st)))
                  );

                  return (
                    <FormGroup key={hf.key} $cols={colSpan}>
                      <Label>
                        {hf.label} {hf.required && "*"}
                      </Label>
                      {isCustom ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Input
                            type="text"
                            placeholder="Enter Treating Consultant..."
                            value={curVal}
                            onChange={(e) => handleHeaderFieldChange(hf.key, e.target.value)}
                            disabled={certData.is_approved}
                            style={{ flex: 1 }}
                          />
                          <Button
                            type="button"
                            $variant="outline"
                            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                            onClick={() =>
                              setCustomDoctorFields((prev) => ({ ...prev, treating_consultant: false }))
                            }
                            title="Switch to Dropdown List"
                          >
                            List
                          </Button>
                        </div>
                      ) : (
                        <Select
                          value={curVal}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "__custom__") {
                              setCustomDoctorFields((prev) => ({ ...prev, treating_consultant: true }));
                            } else {
                              handleHeaderFieldChange(hf.key, val);
                            }
                          }}
                          disabled={certData.is_approved}
                        >
                          <option value="">Select Treating Consultant</option>
                          {curVal && !doctorsList.some((d) => d.name === curVal) && (
                            <option value={curVal}>{curVal} (Current)</option>
                          )}
                          <optgroup label="Oncology Specialists">
                            {doctorsList
                              .filter((d) =>
                                ["medical_oncology", "radiation_oncology", "surgical_oncology"].includes(d.category)
                              )
                              .map((d) => (
                                <option key={d.name} value={d.name}>
                                  {d.name} — {d.specialty || d.department} {d.regNo ? `(Reg. No: ${d.regNo})` : ""}
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="Hospital Consultants & Surgeons">
                            {doctorsList
                              .filter(
                                (d) =>
                                  !["medical_oncology", "radiation_oncology", "surgical_oncology"].includes(d.category)
                              )
                              .map((d) => (
                                <option key={d.name} value={d.name}>
                                  {d.name} — {d.specialty || d.department} {d.regNo ? `(Reg. No: ${d.regNo})` : ""}
                                </option>
                              ))}
                          </optgroup>
                          <option value="__custom__">➕ Type Custom Doctor...</option>
                        </Select>
                      )}
                      {matchedDoc?.regNo && (
                        <div style={{ fontSize: "0.75rem", color: "#0f766e", fontWeight: 600, marginTop: "2px" }}>
                          Reg. No: {matchedDoc.regNo}
                        </div>
                      )}
                    </FormGroup>
                  );
                }

                if (hf.type === "select") {
                  return (
                    <FormGroup key={hf.key} $cols={colSpan}>
                      <Label>
                        {hf.label} {hf.required && "*"}
                      </Label>
                      <Select
                        value={curVal || hf.default_value || ""}
                        onChange={(e) => handleHeaderFieldChange(hf.key, e.target.value)}
                        disabled={certData.is_approved}
                      >
                        {!(hf.value_options || []).includes(curVal) && (
                          <option value="">Select</option>
                        )}
                        {(hf.value_options || []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Select>
                    </FormGroup>
                  );
                }

                return (
                  <FormGroup key={hf.key} $cols={colSpan}>
                    <Label>
                      {hf.label} {hf.required && "*"}
                    </Label>
                    <Input
                      type={hf.type === "date" ? "date" : "text"}
                      placeholder={hf.placeholder || ""}
                      value={curVal}
                      onChange={(e) => handleHeaderFieldChange(hf.key, e.target.value)}
                      disabled={certData.is_approved}
                    />
                  </FormGroup>
                );
              })}
            </SectionGrid>
          </Card>

          {/* ── Dynamic Clinical Sections & Fields from hospital_tumourTemplate.fields ── */}
          {Object.entries(groupedSections).map(([sectionTitle, sectionFields]) => (
            <Card key={sectionTitle}>
              <FormSectionHeader>{sectionTitle}</FormSectionHeader>
              <SectionGrid>
                {sectionFields.map((field) => {
                  const colSpan = Number(field.grid_cols) || 6;
                  const curVal = certData.field_values?.[field.key] ?? field.default_value ?? "";

                  if (field.type === "declaration") {
                    return (
                      <FormGroup key={field.key} $cols={colSpan}>
                        <div
                          style={{
                            fontStyle: "italic",
                            background: "#f8fafc",
                            padding: "0.85rem",
                            borderRadius: "6px",
                            border: "1px dashed #cbd5e1",
                            fontSize: "0.9rem",
                            color: "#334155",
                            lineHeight: "1.5",
                          }}
                        >
                          "{curVal || field.default_value}"
                        </div>
                      </FormGroup>
                    );
                  }

                  if (field.type === "checkbox_text") {
                    return (
                      <FormGroup key={field.key} $cols={colSpan}>
                        <CheckboxInputRow>
                          <CheckboxLabel>
                            <input
                              type="checkbox"
                              checked={Boolean(certData.field_values?.[`${field.key}_checked`])}
                              onChange={(e) =>
                                handleFieldValueChange(`${field.key}_checked`, e.target.checked)
                              }
                              disabled={certData.is_approved}
                            />
                            {field.check_label ? `[ ] ${field.check_label}:` : (field.label || field.key)}
                          </CheckboxLabel>
                          <Input
                            type="text"
                            placeholder={
                              field.placeholder ||
                              `Enter ${field.check_label || field.label}...`
                            }
                            value={curVal}
                            onChange={(e) => handleFieldValueChange(field.key, e.target.value)}
                            disabled={certData.is_approved}
                          />
                        </CheckboxInputRow>
                      </FormGroup>
                    );
                  }

                  if (field.type === "textarea") {
                    return (
                      <FormGroup key={field.key} $cols={colSpan}>
                        <Label>
                          {field.label} {field.required && "*"}
                        </Label>
                        <TextArea
                          rows={Number(field.rows) || 3}
                          placeholder={field.placeholder || ""}
                          value={curVal}
                          onChange={(e) => handleFieldValueChange(field.key, e.target.value)}
                          disabled={certData.is_approved}
                        />
                      </FormGroup>
                    );
                  }

                  if (field.type === "select") {
                    return (
                      <FormGroup key={field.key} $cols={colSpan}>
                        <Label>
                          {field.label} {field.required && "*"}
                        </Label>
                        <Select
                          value={curVal || field.default_value || ""}
                          onChange={(e) => handleFieldValueChange(field.key, e.target.value)}
                          disabled={certData.is_approved}
                        >
                          {!(field.value_options || []).includes(curVal) && (
                            <option value="">Select</option>
                          )}
                          {(field.value_options || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </Select>
                      </FormGroup>
                    );
                  }

                  if (field.type === "date") {
                    return (
                      <FormGroup key={field.key} $cols={colSpan}>
                        <Label>
                          {field.label} {field.required && "*"}
                        </Label>
                        <Input
                          type="date"
                          value={curVal}
                          onChange={(e) => handleFieldValueChange(field.key, e.target.value)}
                          disabled={certData.is_approved}
                        />
                      </FormGroup>
                    );
                  }

                  // If this is a standalone doctor Reg. No field, skip it because it is rendered directly under its doctor name
                  if (
                    ["medical_oncologist_reg", "radiation_oncologist_reg", "surgical_oncologist_reg"].includes(
                      field.key
                    )
                  ) {
                    return null;
                  }

                  // Doctor Name Dropdown Selection (Medical / Radiation / Surgical Oncologist)
                  const doctorFieldCategories = {
                    medical_oncologist_name: "medical_oncology",
                    radiation_oncologist_name: "radiation_oncology",
                    surgical_oncologist_name: "surgical_oncology",
                  };

                  const doctorRegFieldKeys = {
                    medical_oncologist_name: "medical_oncologist_reg",
                    radiation_oncologist_name: "radiation_oncologist_reg",
                    surgical_oncologist_name: "surgical_oncologist_reg",
                  };

                  const doctorRegLabels = {
                    medical_oncologist_name: "Medical Oncologist Reg. No",
                    radiation_oncologist_name: "Radiation Oncologist Reg. No",
                    surgical_oncologist_name: "Surgical Oncologist Reg. No",
                  };

                  if (doctorFieldCategories[field.key]) {
                    const primaryCat = doctorFieldCategories[field.key];
                    const regKey = doctorRegFieldKeys[field.key];
                    const regLabel = doctorRegLabels[field.key] || "Reg. No";
                    const primaryDocs = doctorsList.filter((d) => d.category === primaryCat);
                    const otherDocs = doctorsList.filter((d) => d.category !== primaryCat);
                    const isCustom = Boolean(customDoctorFields[field.key]);
                    const regVal = certData.field_values?.[regKey] ?? "";

                    return (
                      <FormGroup key={field.key} $cols={4}>
                        <Label>
                          {field.label} {field.required && "*"}
                        </Label>
                        {isCustom ? (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <Input
                              type="text"
                              placeholder={`Enter ${field.label}...`}
                              value={curVal}
                              onChange={(e) => handleFieldValueChange(field.key, e.target.value)}
                              disabled={certData.is_approved}
                              style={{ flex: 1 }}
                            />
                            <Button
                              type="button"
                              $variant="outline"
                              style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                              onClick={() =>
                                setCustomDoctorFields((prev) => ({ ...prev, [field.key]: false }))
                              }
                              title="Switch to Dropdown List"
                            >
                              List
                            </Button>
                          </div>
                        ) : (
                          <Select
                            value={curVal}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "__custom__") {
                                setCustomDoctorFields((prev) => ({ ...prev, [field.key]: true }));
                              } else {
                                handleDoctorSelect(field.key, val);
                              }
                            }}
                            disabled={certData.is_approved}
                          >
                            <option value="">Select {field.label.replace(" Name", "")}</option>
                            {curVal && !doctorsList.some((d) => d.name === curVal) && (
                              <option value={curVal}>{curVal} (Current)</option>
                            )}
                            <optgroup label="Recommended Specialists">
                              {primaryDocs.map((d) => (
                                <option key={d.name} value={d.name}>
                                  {d.name} {d.regNo ? `(Reg. No: ${d.regNo})` : ""}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Other Hospital Doctors & Oncologists">
                              {otherDocs.map((d) => (
                                <option key={d.name} value={d.name}>
                                  {d.name} — {d.specialty || d.department} {d.regNo ? `(Reg. No: ${d.regNo})` : ""}
                                </option>
                              ))}
                            </optgroup>
                            <option value="__custom__">➕ Type Custom Doctor Name...</option>
                          </Select>
                        )}

                        {/* Display Reg. No directly under the respective doctor's name */}
                        <div style={{ marginTop: "0.65rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                          <Label>
                            {regLabel}
                          </Label>
                          <Input
                            type="text"
                            placeholder={`Enter ${regLabel}...`}
                            value={regVal}
                            onChange={(e) => handleFieldValueChange(regKey, e.target.value)}
                            disabled={certData.is_approved}
                          />
                        </div>
                      </FormGroup>
                    );
                  }

                  // Default text input
                  return (
                    <FormGroup key={field.key} $cols={colSpan}>
                      <Label>
                        {field.label} {field.required && "*"}
                      </Label>
                      <Input
                        type="text"
                        placeholder={field.placeholder || ""}
                        value={curVal}
                        onChange={(e) => handleFieldValueChange(field.key, e.target.value)}
                        disabled={certData.is_approved}
                      />
                    </FormGroup>
                  );
                })}
              </SectionGrid>
            </Card>
          ))}
        </>
      )}

      {/* ── Template Selection Modal ── */}
      {showTemplateModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Layers size={20} color="#0f766e" />
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#0f766e" }}>
                  Select Tumour Board Template
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </ModalHeader>
            <ModalBody>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#475569" }}>
                Please choose the certification template to use for this case:
              </p>
              {templates.map((tmpl) => (
                <TemplateCard
                  key={tmpl.template_id || tmpl.id}
                  $selected={selectedTemplate?.template_id === tmpl.template_id}
                  onClick={() => startCertificateWithTemplate(tmpl)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700, color: "#0f766e", fontSize: "1rem" }}>
                      {tmpl.template_name}
                    </div>
                    <Badge $approved={true}>v{tmpl.version || "1.0"}</Badge>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: "4px" }}>
                    {tmpl.description || "Clinical Assessment & Multidisciplinary Certification"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#0f766e", marginTop: "8px", fontWeight: 600 }}>
                    {(tmpl.fields || []).length} structured fields &bull; Click to Select &rarr;
                  </div>
                </TemplateCard>
              ))}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* ── PatientSearchModal for UHID / IP Number Searching ── */}
      <PatientSearchModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        onSelect={handlePatientModalSelect}
        initialQuery={patientSearchQuery}
        mode={patientSearchMode}
      />

      {/* ── Printable Certificate Sheet (Matches MHCList.js Report Layout for Ctrl+P) ── */}
      {(() => {
        const rawPrintScheme = certData.scheme_name || (certData.field_values && certData.field_values.scheme_name) || "CMCHIS";
        const printSchemeUpper = String(rawPrintScheme).toUpperCase();
        const isPrintCmchis = printSchemeUpper.includes("CMCHIS");
        const isPrintPmjay = printSchemeUpper.includes("PM-JAY") || printSchemeUpper.includes("PMJAY");
        const isPrintCghs = printSchemeUpper.includes("CGHS");
        const printSchemeName = isPrintCmchis ? "CMCHIS" : isPrintPmjay ? "PM-JAY" : isPrintCghs ? "CGHS" : rawPrintScheme;
        const printSurgVal = certData.field_values.surgical_oncology || "";
        const isPrintSurg = Boolean(certData.field_values.surgical_oncology_checked || printSurgVal);
        const printMedVal = certData.field_values.medical_oncology || "";
        const isPrintMed = Boolean(certData.field_values.medical_oncology_checked || printMedVal);
        const printRadVal = certData.field_values.radiation_oncology || "";
        const isPrintRad = Boolean(certData.field_values.radiation_oncology_checked || printRadVal);
        const printPallVal = certData.field_values.palliative_care || "";
        const isPrintPall = Boolean(certData.field_values.palliative_care_checked || printPallVal);
        const printAgeGender = [certData.age, certData.gender].filter(Boolean).join(" / ") || "—";
        const printMeetingDate = formatDateForPrint(certData.meeting_date || certData.certificate_date) || "—";

        return (
          <PrintCertificateContainer $withLetterpad={withLetterpad}>
            <div
              style={{
                height: "297mm",
                maxHeight: "297mm",
                position: "relative",
                boxSizing: "border-box",
                padding: "6mm 12mm 20mm 12mm",
                fontFamily: "'Segoe UI', Arial, sans-serif",
                color: "#0f172a",
                background: "#fff",
                pageBreakInside: "avoid",
                breakInside: "avoid",
                overflow: "hidden",
              }}
            >
              {/* Top Header Banner (Only printed if withLetterpad is true) */}
              {withLetterpad ? (
                <div style={{ textAlign: "center", marginBottom: 4, width: "100%" }}>
                  <img
                    src={headerImage}
                    alt="Hospital Header"
                    style={{ width: "100%", height: "auto", maxHeight: "80px", objectFit: "fill", display: "block" }}
                  />
                </div>
              ) : (
                <div style={{ height: "105px", marginBottom: "4px" }} />
              )}

              {/* Certificate Title */}
              <div style={{ textAlign: "center", margin: "3px 0 8px 0" }}>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#1e3a8a", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                  TUMOUR BOARD CERTIFICATE
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569", marginTop: 2 }}>
                  (For AB-PMJAY / State Health Schemes)
                </div>
              </div>

              {/* Patient Demographics Card (MHCList.js Report Style) */}
              <div style={{ background: "#f0fdfa", border: "1.5px solid #5eead4", borderRadius: "7px", padding: "7px 12px", marginBottom: "8px" }}>
                {/* Tier 1 */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "4px 12px", paddingBottom: "5px", borderBottom: "1px dashed #99f6e4" }}>
                  <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "9.5px", textTransform: "uppercase", display: "block", marginBottom: "1px" }}>Patient Name</span><strong style={{ color: "#0f172a", fontSize: "12.5px", textTransform: "uppercase" }}>{certData.patient_name || "—"}</strong></div>
                  <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "9.5px", textTransform: "uppercase", display: "block", marginBottom: "1px" }}>IPD / Reg. No</span><strong style={{ color: "#0f172a", fontSize: "12px" }}>{certData.ip_op_number || certData.uhid || "—"}</strong></div>
                  <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "9.5px", textTransform: "uppercase", display: "block", marginBottom: "1px" }}>Age / Gender</span><strong style={{ color: "#0f172a", fontSize: "12px" }}>{printAgeGender}</strong></div>
                </div>
                {/* Tier 2 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5px 12px", paddingTop: "5px", fontSize: "10px" }}>
                  <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "9px", textTransform: "uppercase", display: "block", marginBottom: "1px" }}>Date of Board Meeting</span><strong style={{ color: "#0f172a", fontSize: "11px" }}>{printMeetingDate}</strong></div>
                  <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "9px", textTransform: "uppercase", display: "block", marginBottom: "1px" }}>TMS Case / Ref. No</span><strong style={{ color: "#0f172a", fontSize: "11px" }}>{certData.tms_case_ref_no || certData.certificate_id || "—"}</strong></div>
                  <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "9px", textTransform: "uppercase", display: "block", marginBottom: "1px" }}>Scheme Name</span><strong style={{ color: "#0f172a", fontSize: "11px" }}>{printSchemeName}</strong></div>
                  <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "9px", textTransform: "uppercase", display: "block", marginBottom: "1px" }}>Patient Scheme Card ID / URN</span><strong style={{ color: "#0f172a", fontSize: "11px" }}>{certData.scheme_card_id || "—"}</strong></div>
                  <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "9px", textTransform: "uppercase", display: "block", marginBottom: "1px" }}>Primary Referral Dept</span><strong style={{ color: "#0f172a", fontSize: "11px" }}>{certData.primary_referral_dept || "—"}</strong></div>
                  <div><span style={{ color: "#0f766e", fontWeight: 700, fontSize: "9px", textTransform: "uppercase", display: "block", marginBottom: "1px" }}>Treating Consultant</span><strong style={{ color: "#0f172a", fontSize: "11px" }}>{certData.treating_consultant || "—"}</strong></div>
                </div>
              </div>

              {/* ── 1. CLINICAL DIAGNOSIS & STAGING ── */}
              <div style={{ marginBottom: 8 }}>
                <div className="sec-title">1. CLINICAL DIAGNOSIS &amp; STAGING</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px", border: "1px solid #cbd5e1" }}>
                  <tbody>
                    <tr>
                      <td style={{ background: "#f1f5f9", color: "#1e293b", fontWeight: 700, padding: "5px 8px", border: "1px solid #cbd5e1", width: "28%" }}>Site of Malignancy</td>
                      <td style={{ background: "#ffffff", color: "#0f172a", padding: "5px 8px", border: "1px solid #cbd5e1", width: "72%", fontWeight: 600 }}>{certData.field_values.site_of_malignancy || certData.primary_site || "—"}</td>
                    </tr>
                    <tr>
                      <td style={{ background: "#f1f5f9", color: "#1e293b", fontWeight: 700, padding: "5px 8px", border: "1px solid #cbd5e1", width: "28%" }}>Histopathology (HPE) / IHC Report Details</td>
                      <td style={{ background: "#ffffff", color: "#0f172a", padding: "5px 8px", border: "1px solid #cbd5e1", width: "72%", fontWeight: 600 }}>{certData.field_values.histopathology_ihc_details || "—"}</td>
                    </tr>
                    <tr>
                      <td style={{ background: "#f1f5f9", color: "#1e293b", fontWeight: 700, padding: "5px 8px", border: "1px solid #cbd5e1", width: "28%" }}>TNM Staging &amp; Stage</td>
                      <td style={{ background: "#ffffff", color: "#0f172a", padding: "5px 8px", border: "1px solid #cbd5e1", width: "72%", fontWeight: 600 }}>
                        TNM: <strong style={{ color: "#1e3a8a" }}>[ {certData.field_values.tnm_staging || "—"} ]</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Stage: <strong style={{ color: "#1e3a8a" }}>[ {certData.field_values.stage || certData.stage || "Stage II"} ]</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ── 2. PROPOSED ONCOLOGY PACKAGE DETAILS ── */}
              <div style={{ marginBottom: 8 }}>
                <div className="sec-title">2. PROPOSED ONCOLOGY PACKAGE DETAILS</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px", border: "1px solid #cbd5e1" }}>
                  <tbody>
                    <tr>
                      <td style={{ background: "#f1f5f9", color: "#1e293b", fontWeight: 700, padding: "5px 8px", border: "1px solid #cbd5e1", width: "28%" }}>{printSchemeName || "Scheme"} Package Code</td>
                      <td style={{ background: "#ffffff", color: "#0f172a", padding: "5px 8px", border: "1px solid #cbd5e1", width: "72%", fontWeight: 700, fontFamily: "monospace", fontSize: "11.5px" }}>{certData.field_values.package_code || "—"}</td>
                    </tr>
                    <tr>
                      <td style={{ background: "#f1f5f9", color: "#1e293b", fontWeight: 700, padding: "5px 8px", border: "1px solid #cbd5e1", width: "28%" }}>Name of Procedure / Regimen</td>
                      <td style={{ background: "#ffffff", color: "#0f172a", padding: "5px 8px", border: "1px solid #cbd5e1", width: "72%", fontWeight: 600 }}>{certData.field_values.procedure_regimen_name || "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ── 3. MULTI-MODAL MANAGEMENT PLAN APPROVED BY THE BOARD ── */}
              <div style={{ marginBottom: 8 }}>
                <div className="sec-title">3. MULTI-MODAL MANAGEMENT PLAN APPROVED BY THE BOARD</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px", border: "1px solid #cbd5e1" }}>
                  <tbody>
                    <tr>
                      <td style={{ background: "#f1f5f9", color: "#1e293b", fontWeight: 700, padding: "5px 8px", border: "1px solid #cbd5e1", width: "22%" }}>Surgical Oncology</td>
                      <td style={{ background: "#ffffff", color: "#0f172a", padding: "5px 8px", border: "1px solid #cbd5e1", width: "28%", fontWeight: 600 }}>{printSurgVal || (isPrintSurg ? "RECOMMENDED" : "—")}</td>
                      <td style={{ background: "#f1f5f9", color: "#1e293b", fontWeight: 700, padding: "5px 8px", border: "1px solid #cbd5e1", width: "22%" }}>Medical Oncology</td>
                      <td style={{ background: "#ffffff", color: "#0f172a", padding: "5px 8px", border: "1px solid #cbd5e1", width: "28%", fontWeight: 600 }}>{printMedVal || (isPrintMed ? "RECOMMENDED" : "—")}</td>
                    </tr>
                    <tr>
                      <td style={{ background: "#f1f5f9", color: "#1e293b", fontWeight: 700, padding: "5px 8px", border: "1px solid #cbd5e1", width: "22%" }}>Radiation Oncology</td>
                      <td style={{ background: "#ffffff", color: "#0f172a", padding: "5px 8px", border: "1px solid #cbd5e1", width: "28%", fontWeight: 600 }}>{printRadVal || (isPrintRad ? "RECOMMENDED" : "—")}</td>
                      <td style={{ background: "#f1f5f9", color: "#1e293b", fontWeight: 700, padding: "5px 8px", border: "1px solid #cbd5e1", width: "22%" }}>Palliative Care</td>
                      <td style={{ background: "#ffffff", color: "#0f172a", padding: "5px 8px", border: "1px solid #cbd5e1", width: "28%", fontWeight: 600 }}>{printPallVal || (isPrintPall ? "RECOMMENDED" : "—")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ── 4. SPECIFIC RECOMMENDATIONS / BOARD REMARKS ── */}
              <div style={{ marginBottom: 7 }}>
                <div className="sec-title">4. SPECIFIC RECOMMENDATIONS / BOARD REMARKS</div>
                <div
                  style={{
                    textAlign: "left",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    borderRadius: "5px",
                    minHeight: "48px",
                    maxHeight: "62px",
                    padding: "6px 10px",
                    fontSize: "11px",
                    lineHeight: 1.45,
                    boxSizing: "border-box",
                    whiteSpace: "pre-line",
                    wordBreak: "break-word",
                    color: "#0f172a",
                    fontWeight: 600,
                    overflow: "hidden",
                  }}
                >
                  {(certData.field_values.board_remarks || certData.board_remarks || "—").trim()}
                </div>
              </div>

              {/* Declaration Statement */}
              <div style={{ fontSize: "9.5px", lineHeight: 1.4, color: "#334155", textAlign: "justify", margin: "4px 0 6px 0", fontStyle: "italic" }}>
                {certData.field_values.certification_statement ||
                  "We hereby certify that the case details of the aforementioned patient have been reviewed thoroughly by the Multidisciplinary Tumour Board, and the recommended treatment modalities conform to established oncology guidelines for standard patient care."}
              </div>

              {/* Signatures Block (RDPrint Centered Format - Name, Designation, Reg. No without labels) */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8, fontSize: "10px" }}>
                {/* Medical Oncologist */}
                <div style={{ textAlign: "center", width: "31%" }}>
                  <div style={{ height: "34px" }}></div>
                  <div style={{ borderTop: "1px dashed #94a3b8", marginBottom: 3, width: "85%", marginLeft: "auto", marginRight: "auto" }}></div>
                  <div style={{ fontSize: "8.5px", color: "#64748b", marginBottom: 3 }}>[Signature &amp; Stamp]</div>
                  <div style={{ fontWeight: 800, fontSize: "11.5px", color: "#0f172a", lineHeight: 1.35 }}>
                    {certData.field_values.medical_oncologist_name || "________________________"}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "10px", color: "#1e3a8a", lineHeight: 1.35 }}>
                    Medical Oncologist
                  </div>
                  <div style={{ fontSize: "9.5px", color: "#334155", lineHeight: 1.35 }}>
                    {formatDoctorReg(certData.field_values.medical_oncologist_reg, Boolean(certData.field_values.medical_oncologist_name))}
                  </div>
                </div>

                {/* Radiation Oncologist */}
                <div style={{ textAlign: "center", width: "31%" }}>
                  <div style={{ height: "34px" }}></div>
                  <div style={{ borderTop: "1px dashed #94a3b8", marginBottom: 3, width: "85%", marginLeft: "auto", marginRight: "auto" }}></div>
                  <div style={{ fontSize: "8.5px", color: "#64748b", marginBottom: 3 }}>[Signature &amp; Stamp]</div>
                  <div style={{ fontWeight: 800, fontSize: "11.5px", color: "#0f172a", lineHeight: 1.35 }}>
                    {certData.field_values.radiation_oncologist_name || "________________________"}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "10px", color: "#1e3a8a", lineHeight: 1.35 }}>
                    Radiation Oncologist
                  </div>
                  <div style={{ fontSize: "9.5px", color: "#334155", lineHeight: 1.35 }}>
                    {formatDoctorReg(certData.field_values.radiation_oncologist_reg, Boolean(certData.field_values.radiation_oncologist_name))}
                  </div>
                </div>

                {/* Surgical Oncologist */}
                <div style={{ textAlign: "center", width: "31%" }}>
                  <div style={{ height: "34px" }}></div>
                  <div style={{ borderTop: "1px dashed #94a3b8", marginBottom: 3, width: "85%", marginLeft: "auto", marginRight: "auto" }}></div>
                  <div style={{ fontSize: "8.5px", color: "#64748b", marginBottom: 3 }}>[Signature &amp; Stamp]</div>
                  <div style={{ fontWeight: 800, fontSize: "11.5px", color: "#0f172a", lineHeight: 1.35 }}>
                    {certData.field_values.surgical_oncologist_name || "________________________"}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "10px", color: "#1e3a8a", lineHeight: 1.35 }}>
                    Surgical Oncologist
                  </div>
                  <div style={{ fontSize: "9.5px", color: "#334155", lineHeight: 1.35 }}>
                    {formatDoctorReg(certData.field_values.surgical_oncologist_reg, Boolean(certData.field_values.surgical_oncologist_name))}
                  </div>
                </div>
              </div>

              {/* Center Counter Signature: Medical Superintendent / Director */}
              <div style={{ textAlign: "center", width: "50%", margin: "8px auto 0 auto", fontSize: "10px" }}>
                <div style={{ height: "28px" }}></div>
                <div style={{ borderTop: "1px dashed #94a3b8", marginBottom: 3, width: "100%" }}></div>
                <div style={{ fontSize: "8.5px", color: "#64748b" }}>[Counter Signature &amp; Stamp]</div>
                <div style={{ fontWeight: 800, fontSize: "11px", color: "#1e3a8a", margin: "1px 0" }}>
                  {certData.field_values.medical_superintendent_name || "Medical Superintendent / Director"}
                </div>
              </div>

              {/* Bottom Footer (Only printed if withLetterpad is true) */}
              {withLetterpad && (
                <div style={{ position: "absolute", bottom: "4mm", left: "12mm", right: "12mm", width: "calc(100% - 24mm)", boxSizing: "border-box", textAlign: "center" }}>
                  <div style={{ fontSize: "8.5px", color: "#64748b", fontStyle: "italic", textAlign: "left", marginBottom: "2px" }}>
                    * This is an electronically generated Tumour Board Certificate.
                  </div>
                  <img
                    src={footerImage}
                    alt="Hospital Footer"
                    style={{ width: "100%", height: "auto", maxHeight: "48px", objectFit: "fill", display: "block", margin: "0 auto" }}
                  />
                </div>
              )}
            </div>
          </PrintCertificateContainer>
        );
      })()}

      {/* ── Tumour Board Certificate Preview Modal ── */}
      {previewCert && (
        <ModalOverlay onClick={() => setPreviewCert(null)}>
          <PrintModalCard onClick={(e) => e.stopPropagation()}>
            <ModalHeader style={{ background: "#0f766e", color: "white", padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Eye size={20} style={{ color: "#99f6e4" }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "white" }}>
                    Tumour Board Certificate Preview
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#ccfbf1", marginTop: "2px" }}>
                    {previewCert.patient_name || "Patient"} • UHID: {previewCert.uhid || "—"} • {previewCert.is_approved ? "✓ Approved" : "Draft (Pending Approval)"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {previewCert.is_approved ? (
                  <>
                    <Button
                      $variant="primary"
                      style={{
                        background: "#0d9488",
                        border: "1px solid #14b8a6",
                        fontSize: "0.82rem",
                        padding: "0.4rem 0.8rem",
                      }}
                      onClick={() => handleDirectPrintCertificate(previewCert, true)}
                    >
                      <Printer size={14} /> Print with LetterPad
                    </Button>
                    <Button
                      $variant="outline"
                      style={{
                        background: "white",
                        color: "#0f766e",
                        borderColor: "white",
                        fontSize: "0.82rem",
                        padding: "0.4rem 0.8rem",
                      }}
                      onClick={() => handleDirectPrintCertificate(previewCert, false)}
                    >
                      <FileText size={14} /> Print without LetterPad
                    </Button>
                  </>
                ) : (
                  <Badge
                    $approved={false}
                    style={{
                      background: "#fef3c7",
                      color: "#92400e",
                      border: "1px solid #fde68a",
                      fontSize: "0.8rem",
                      padding: "0.35rem 0.75rem",
                    }}
                  >
                    Draft Preview (Pending Approval)
                  </Badge>
                )}
                <Button
                  $variant="outline"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    borderColor: "rgba(255,255,255,0.3)",
                    padding: "0.4rem 0.6rem",
                  }}
                  onClick={() => setPreviewCert(null)}
                  title="Close Preview"
                >
                  <X size={18} />
                </Button>
              </div>
            </ModalHeader>

            <PrintPreviewScroll>
              {(() => {
                const target = previewCert;
                const fv = target.field_values || {};
                const rawScheme = target.scheme_name || fv.scheme_name || "CMCHIS";
                const schemeUpper = String(rawScheme).toUpperCase();
                const isCmchis = schemeUpper.includes("CMCHIS");
                const isPmjay = schemeUpper.includes("PM-JAY") || schemeUpper.includes("PMJAY");
                const isCghs = schemeUpper.includes("CGHS");
                const schemeDisplayName = isCmchis ? "CMCHIS" : isPmjay ? "PM-JAY" : isCghs ? "CGHS" : rawScheme;

                const surgVal = fv.surgical_oncology || "";
                const isSurg = Boolean(fv.surgical_oncology_checked || surgVal);
                const medVal = fv.medical_oncology || "";
                const isMed = Boolean(fv.medical_oncology_checked || medVal);
                const radVal = fv.radiation_oncology || "";
                const isRad = Boolean(fv.radiation_oncology_checked || radVal);
                const pallVal = fv.palliative_care || "";
                const isPall = Boolean(fv.palliative_care_checked || pallVal);

                const boardRemarks = (fv.board_remarks || target.board_remarks || "").trim();
                const certStatement =
                  fv.certification_statement ||
                  "We hereby certify that the case details of the aforementioned patient have been reviewed thoroughly by the Multidisciplinary Tumour Board, and the recommended treatment modalities conform to established oncology guidelines for standard patient care.";

                const medOncName = fv.medical_oncologist_name || "";
                const medOncReg = fv.medical_oncologist_reg || "";
                const radOncName = fv.radiation_oncologist_name || "";
                const radOncReg = fv.radiation_oncologist_reg || "";
                const surgOncName = fv.surgical_oncologist_name || "";
                const surgOncReg = fv.surgical_oncologist_reg || "";
                const medSuperintendent = fv.medical_superintendent_name || "Medical Superintendent / Director";

                return (
                  <PrintSheet style={{ padding: "6mm 12mm 20mm 12mm", position: "relative", minHeight: "297mm", boxSizing: "border-box" }}>
                    {/* Header Image */}
                    <div style={{ textAlign: "center", marginBottom: 4, width: "100%" }}>
                      <img
                        src={headerImage}
                        alt="Hospital Header"
                        style={{ width: "100%", height: "auto", maxHeight: "80px", objectFit: "fill", display: "block" }}
                      />
                    </div>

                    {/* Certificate Title */}
                    <div style={{ textAlign: "center", margin: "3px 0 8px 0" }}>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#1e3a8a", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                        TUMOUR BOARD CERTIFICATE
                      </div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569", marginTop: "2px" }}>
                        (For AB-PMJAY / State Health Schemes)
                      </div>
                    </div>

                    {/* Patient Info Card */}
                    <div
                      style={{
                        border: "1.5px solid #0d9488",
                        borderRadius: "8px",
                        background: "#f0fdfa",
                        padding: "6px 12px",
                        marginBottom: "6px",
                      }}
                    >
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: "2.5px 4px", width: "38%", verticalAlign: "top" }}>
                              <div style={{ fontSize: "9px", fontWeight: 800, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                PATIENT NAME
                              </div>
                              <div style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a" }}>
                                {target.patient_name || "—"}
                              </div>
                            </td>
                            <td style={{ padding: "2.5px 4px", width: "32%", verticalAlign: "top" }}>
                              <div style={{ fontSize: "9px", fontWeight: 800, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                IPD / REG. NO
                              </div>
                              <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#0f172a", fontFamily: "monospace" }}>
                                {target.ip_op_number || target.uhid || "—"}
                              </div>
                            </td>
                            <td style={{ padding: "2.5px 4px", width: "30%", verticalAlign: "top" }}>
                              <div style={{ fontSize: "9px", fontWeight: 800, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                AGE / GENDER
                              </div>
                              <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#0f172a" }}>
                                {[target.age, target.gender].filter(Boolean).join(" / ") || "—"}
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "2.5px 4px", verticalAlign: "top" }}>
                              <div style={{ fontSize: "9px", fontWeight: 800, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                DATE OF BOARD MEETING
                              </div>
                              <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>
                                {formatDateForPrint(target.meeting_date || target.certificate_date) || "—"}
                              </div>
                            </td>
                            <td style={{ padding: "2.5px 4px", verticalAlign: "top" }}>
                              <div style={{ fontSize: "9px", fontWeight: 800, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                TMS CASE / REF. NO
                              </div>
                              <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>
                                {target.tms_case_ref_no || "—"}
                              </div>
                            </td>
                            <td style={{ padding: "2.5px 4px", verticalAlign: "top" }}>
                              <div style={{ fontSize: "9px", fontWeight: 800, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                SCHEME NAME
                              </div>
                              <div style={{ fontSize: "11px", fontWeight: 800, color: "#1e40af" }}>
                                {schemeDisplayName}
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "2.5px 4px", verticalAlign: "top" }}>
                              <div style={{ fontSize: "9px", fontWeight: 800, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                PATIENT SCHEME CARD ID / URN
                              </div>
                              <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>
                                {target.scheme_card_id || "—"}
                              </div>
                            </td>
                            <td style={{ padding: "2.5px 4px", verticalAlign: "top" }}>
                              <div style={{ fontSize: "9px", fontWeight: 800, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                PRIMARY REFERRAL DEPT
                              </div>
                              <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>
                                {target.primary_referral_dept || "—"}
                              </div>
                            </td>
                            <td style={{ padding: "2.5px 4px", verticalAlign: "top" }}>
                              <div style={{ fontSize: "9px", fontWeight: 800, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                TREATING CONSULTANT
                              </div>
                              <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a" }}>
                                {target.treating_consultant || "—"}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Section 1: Clinical Diagnosis & Staging */}
                    <div style={{ marginBottom: "5px" }}>
                      <div className="sec-title" style={{ fontSize: "11.5px", fontWeight: 800, color: "#1e3a8a", borderBottom: "2px solid #1e3a8a", paddingBottom: "2px", marginBottom: "4px", textTransform: "uppercase" }}>
                        1. CLINICAL DIAGNOSIS &amp; STAGING
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px", border: "1px solid #1e3a8a" }}>
                        <tbody>
                          <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                            <td style={{ padding: "4px 8px", width: "32%", fontWeight: 700, color: "#0f172a", borderRight: "1px solid #cbd5e1" }}>
                              Site of Malignancy
                            </td>
                            <td style={{ padding: "4px 8px", color: "#0f172a", fontWeight: 600 }}>
                              {fv.site_of_malignancy || target.primary_site || "—"}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                            <td style={{ padding: "4px 8px", fontWeight: 700, color: "#0f172a", borderRight: "1px solid #cbd5e1" }}>
                              Histopathology (HPE) / IHC Report Details
                            </td>
                            <td style={{ padding: "4px 8px", color: "#0f172a", fontWeight: 600 }}>
                              {fv.histopathology_ihc_details || "—"}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "4px 8px", fontWeight: 700, color: "#0f172a", borderRight: "1px solid #cbd5e1" }}>
                              TNM Staging &amp; Stage
                            </td>
                            <td style={{ padding: "4px 8px", color: "#0f172a" }}>
                              <span style={{ fontWeight: 700 }}>TNM: </span>
                              <strong style={{ color: "#1e40af" }}>[ {fv.tnm_staging || "—"} ]</strong>
                              &nbsp;&nbsp;&nbsp;&nbsp;
                              <span style={{ fontWeight: 700 }}>Stage: </span>
                              <strong style={{ color: "#1e40af" }}>[ {fv.stage || target.stage || "—"} ]</strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Section 2: Proposed Oncology Package Details */}
                    <div style={{ marginBottom: "5px" }}>
                      <div className="sec-title" style={{ fontSize: "11.5px", fontWeight: 800, color: "#1e3a8a", borderBottom: "2px solid #1e3a8a", paddingBottom: "2px", marginBottom: "4px", textTransform: "uppercase" }}>
                        2. PROPOSED ONCOLOGY PACKAGE DETAILS
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px", border: "1px solid #1e3a8a" }}>
                        <tbody>
                          <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                            <td style={{ padding: "4px 8px", width: "32%", fontWeight: 700, color: "#0f172a", borderRight: "1px solid #cbd5e1" }}>
                              {schemeDisplayName} Package Code
                            </td>
                            <td style={{ padding: "4px 8px", color: "#0f172a", fontWeight: 600 }}>
                              {fv.package_code || "—"}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "4px 8px", fontWeight: 700, color: "#0f172a", borderRight: "1px solid #cbd5e1" }}>
                              Name of Procedure / Regimen
                            </td>
                            <td style={{ padding: "4px 8px", color: "#0f172a", fontWeight: 600 }}>
                              {fv.procedure_regimen_name || "—"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Section 3: Multi-Modal Management Plan Approved by the Board */}
                    <div style={{ marginBottom: "5px" }}>
                      <div className="sec-title" style={{ fontSize: "11.5px", fontWeight: 800, color: "#1e3a8a", borderBottom: "2px solid #1e3a8a", paddingBottom: "2px", marginBottom: "4px", textTransform: "uppercase" }}>
                        3. MULTI-MODAL MANAGEMENT PLAN APPROVED BY THE BOARD
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px", border: "1px solid #1e3a8a" }}>
                        <tbody>
                          <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                            <td style={{ padding: "4px 8px", width: "22%", fontWeight: 700, color: "#0f172a", borderRight: "1px solid #cbd5e1" }}>
                              Surgical Oncology
                            </td>
                            <td style={{ padding: "4px 8px", width: "28%", color: "#0f172a", borderRight: "1px solid #cbd5e1", fontWeight: isSurg ? 700 : 400 }}>
                              {isSurg ? surgVal || "✓ Indicated" : "—"}
                            </td>
                            <td style={{ padding: "4px 8px", width: "22%", fontWeight: 700, color: "#0f172a", borderRight: "1px solid #cbd5e1" }}>
                              Medical Oncology
                            </td>
                            <td style={{ padding: "4px 8px", width: "28%", color: "#0f172a", fontWeight: isMed ? 700 : 400 }}>
                              {isMed ? medVal || "✓ Indicated" : "—"}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "4px 8px", fontWeight: 700, color: "#0f172a", borderRight: "1px solid #cbd5e1" }}>
                              Radiation Oncology
                            </td>
                            <td style={{ padding: "4px 8px", color: "#0f172a", borderRight: "1px solid #cbd5e1", fontWeight: isRad ? 700 : 400 }}>
                              {isRad ? radVal || "✓ Indicated" : "—"}
                            </td>
                            <td style={{ padding: "4px 8px", fontWeight: 700, color: "#0f172a", borderRight: "1px solid #cbd5e1" }}>
                              Palliative Care
                            </td>
                            <td style={{ padding: "4px 8px", color: "#0f172a", fontWeight: isPall ? 700 : 400 }}>
                              {isPall ? pallVal || "✓ Indicated" : "—"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Section 4: Specific Recommendations / Board Remarks */}
                    <div style={{ marginBottom: "5px" }}>
                      <div className="sec-title" style={{ fontSize: "11.5px", fontWeight: 800, color: "#1e3a8a", borderBottom: "2px solid #1e3a8a", paddingBottom: "2px", marginBottom: "4px", textTransform: "uppercase" }}>
                        4. SPECIFIC RECOMMENDATIONS / BOARD REMARKS
                      </div>
                      <div
                        style={{
                          border: "1px solid #1e3a8a",
                          borderRadius: "4px",
                          padding: "6px 8px",
                          fontSize: "10.5px",
                          lineHeight: "1.45",
                          color: "#0f172a",
                          minHeight: "36px",
                          textAlign: "left",
                        }}
                      >
                        {boardRemarks ? (
                          <div style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>
                            {boardRemarks}
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                            No specific remarks recorded.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Certification Statement */}
                    <div style={{ fontStyle: "italic", fontSize: "9px", color: "#475569", lineHeight: "1.35", margin: "4px 0 10px 0", textAlign: "justify" }}>
                      {certStatement}
                    </div>

                    {/* Doctor Signatures */}
                    <div style={{ marginTop: "12px", paddingTop: "6px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                        <tbody>
                          <tr>
                            <td style={{ textAlign: "center", verticalAlign: "bottom", padding: "0 4px", width: "33.33%" }}>
                              <div style={{ borderTop: "1px dotted #94a3b8", paddingTop: "3px" }}>
                                <div style={{ fontSize: "8.5px", color: "#64748b", textTransform: "uppercase" }}>
                                  [Signature &amp; Stamp]
                                </div>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                                  {medOncName || "Dr. R. Vidhya, MD(RT), DM."}
                                </div>
                                <div style={{ fontSize: "9.5px", color: "#334155", fontWeight: 600 }}>
                                  Medical Oncologist
                                </div>
                                <div style={{ fontSize: "9px", color: "#64748b", fontWeight: 500 }}>
                                  {formatDoctorReg(medOncReg || "63108", Boolean(medOncName))}
                                </div>
                              </div>
                            </td>
                            <td style={{ textAlign: "center", verticalAlign: "bottom", padding: "0 4px", width: "33.33%" }}>
                              <div style={{ borderTop: "1px dotted #94a3b8", paddingTop: "3px" }}>
                                <div style={{ fontSize: "8.5px", color: "#64748b", textTransform: "uppercase" }}>
                                  [Signature &amp; Stamp]
                                </div>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                                  {radOncName || "Dr. Venkatesan, MD(RT)"}
                                </div>
                                <div style={{ fontSize: "9.5px", color: "#334155", fontWeight: 600 }}>
                                  Radiation Oncologist
                                </div>
                                <div style={{ fontSize: "9px", color: "#64748b", fontWeight: 500 }}>
                                  {formatDoctorReg(radOncReg || "39812", Boolean(radOncName))}
                                </div>
                              </div>
                            </td>
                            <td style={{ textAlign: "center", verticalAlign: "bottom", padding: "0 4px", width: "33.33%" }}>
                              <div style={{ borderTop: "1px dotted #94a3b8", paddingTop: "3px" }}>
                                <div style={{ fontSize: "8.5px", color: "#64748b", textTransform: "uppercase" }}>
                                  [Signature &amp; Stamp]
                                </div>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                                  {surgOncName || "Dr. G. Prasanna, MS, DNB (Onco)"}
                                </div>
                                <div style={{ fontSize: "9.5px", color: "#334155", fontWeight: 600 }}>
                                  Surgical Oncologist
                                </div>
                                <div style={{ fontSize: "9px", color: "#64748b", fontWeight: 500 }}>
                                  {formatDoctorReg(surgOncReg || "4521464", Boolean(surgOncName))}
                                </div>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={3} style={{ textAlign: "center", verticalAlign: "bottom", paddingTop: "14px" }}>
                              <div style={{ display: "inline-block", minWidth: "260px", borderTop: "1px dotted #94a3b8", paddingTop: "3px" }}>
                                <div style={{ fontSize: "8.5px", color: "#64748b", textTransform: "uppercase" }}>
                                  [Counter Signature &amp; Stamp]
                                </div>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                                  {medSuperintendent}
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Footer Image */}
                    <div style={{ marginTop: "auto", paddingTop: "10px", textAlign: "center", width: "100%" }}>
                      <div style={{ fontSize: "8.5px", color: "#64748b", fontStyle: "italic", textAlign: "left", marginBottom: "2px" }}>
                        * This is an electronically generated Tumour Board Certificate.
                      </div>
                      <img
                        src={footerImage}
                        alt="Hospital Footer"
                        style={{ width: "100%", height: "auto", maxHeight: "48px", objectFit: "fill", display: "block", margin: "0 auto" }}
                      />
                    </div>
                  </PrintSheet>
                );
              })()}
            </PrintPreviewScroll>
          </PrintModalCard>
        </ModalOverlay>
      )}

      {/* ── Print Options Dropdown Portal (for Approved Certificates) ── */}
      {activePrintRowId &&
        activePrintCert &&
        createPortal(
          <PortalDropdownMenu
            className="portal-print-dropdown"
            style={{ top: printDropdownPos.top, left: printDropdownPos.left }}
            onMouseEnter={() => setActivePrintRowId(activePrintRowId)}
            onMouseLeave={hideRowPrintDropdown}
          >
            <PortalDropdownItem
              onClick={() => {
                handleDirectPrintCertificate(activePrintCert, true);
                hideRowPrintDropdown();
              }}
            >
              <Printer size={15} style={{ color: "#0f766e" }} />
              🖨️ Print with LetterPad
            </PortalDropdownItem>
            <PortalDropdownItem
              onClick={() => {
                handleDirectPrintCertificate(activePrintCert, false);
                hideRowPrintDropdown();
              }}
            >
              <FileText size={15} style={{ color: "#0284c7" }} />
              📄 Print without LetterPad
            </PortalDropdownItem>
          </PortalDropdownMenu>,
          document.body
        )}
    </Container>
  );
}
