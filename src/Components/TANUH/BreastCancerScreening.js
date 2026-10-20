import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import {
  FaHeartbeat,
  FaUserInjured,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaUserCheck,
  FaExclamationTriangle,
  FaShieldAlt,
  FaCalendarAlt,
  FaSearch,
  FaPrint,
  FaSyncAlt,
  FaFileMedical,
  FaCheckCircle,
  FaClipboardList,
  FaFileExport,
  FaIdCard,
  FaUserGraduate,
} from "react-icons/fa";
import { MdOutlineMedicalServices, MdClose } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../../Auth/apiRequest";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "/";

// ── Colors & Design Tokens ──────────────────────────────────────────
const theme = {
  primary: "#e11d48", // Rose 600
  primaryHover: "#be123c", // Rose 700
  primaryLight: "#fff1f2", // Rose 50
  primaryBorder: "#fecdd3", // Rose 200
  accentPink: "#ec4899", // Pink 500
  accentTeal: "#0d9488", // Teal 600
  darkSlate: "#0f172a", // Slate 900
  textPrimary: "#1e293b", // Slate 800
  textSecondary: "#64748b", // Slate 500
  border: "#e2e8f0", // Slate 200
  bgLight: "#f8fafc", // Slate 50
  cardBg: "#ffffff",
  highRisk: "#e11d48",
  highRiskBg: "#fff1f2",
  highRiskBorder: "#fca5a5",
  lowRisk: "#059669",
  lowRiskBg: "#ecfdf5",
  lowRiskBorder: "#a7f3d0",
};

// ── Styled Components ───────────────────────────────────────────────
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fff1f2 0%, #f8fafc 40%, #fdf2f8 100%);
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: ${theme.textPrimary};

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const HeaderBanner = styled.div`
  background: linear-gradient(135deg, #be123c 0%, #e11d48 45%, #ec4899 100%);
  border-radius: 18px;
  padding: 28px 32px;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 14px 28px -6px rgba(225, 29, 72, 0.35);
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
  }

  .title-content {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .ribbon-badge {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    border: 1.5px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  h1 {
    font-size: 1.65rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  p {
    margin: 6px 0 0;
    font-size: 0.92rem;
    color: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tag-partner {
    background: rgba(255, 255, 255, 0.25);
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
`;

const TabNavigation = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 2px solid ${theme.border};
  padding-bottom: 12px;
`;

const TabButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${(props) => (props.$active ? theme.primary : "transparent")};
  color: ${(props) => (props.$active ? "#ffffff" : theme.textSecondary)};
  box-shadow: ${(props) => (props.$active ? "0 4px 14px rgba(225, 29, 72, 0.3)" : "none")};

  &:hover {
    background: ${(props) => (props.$active ? theme.primaryHover : theme.primaryLight)};
    color: ${(props) => (props.$active ? "#ffffff" : theme.primary)};
  }
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const MetricCard = styled.div`
  background: ${theme.cardBg};
  border-radius: 16px;
  padding: 18px 22px;
  border: 1px solid ${(props) => props.$borderColor || theme.border};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }

  .metric-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${(props) => props.$bg || theme.primaryLight};
    color: ${(props) => props.$color || theme.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }

  .metric-info {
    h3 {
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0;
      color: ${theme.textPrimary};
    }
    p {
      font-size: 0.8rem;
      color: ${theme.textSecondary};
      margin: 2px 0 0;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
  }
`;

const FormCard = styled.div`
  background: ${theme.cardBg};
  border-radius: 18px;
  padding: 26px 30px;
  border: 1px solid ${theme.border};
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 22px;
    padding-bottom: 14px;
    border-bottom: 1.5px solid ${theme.bgLight};

    .section-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: ${theme.primaryLight};
      color: ${theme.primary};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    h2 {
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0;
      color: ${theme.darkSlate};
    }

    span {
      font-size: 0.82rem;
      color: ${theme.textSecondary};
      margin-left: auto;
    }
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 18px;

  label {
    font-size: 0.86rem;
    font-weight: 600;
    color: ${theme.textPrimary};
    display: flex;
    align-items: center;
    gap: 4px;

    .required {
      color: ${theme.primary};
      font-weight: 700;
    }
  }

  input,
  textarea,
  select {
    padding: 11px 14px;
    border-radius: 10px;
    border: 1.5px solid ${(props) => (props.$error ? theme.highRisk : theme.border)};
    background: #ffffff;
    font-size: 0.92rem;
    color: ${theme.textPrimary};
    transition: all 0.2s;
    outline: none;

    &:focus {
      border-color: ${theme.primary};
      box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.12);
    }

    &::placeholder {
      color: #94a3b8;
    }
  }

  textarea {
    min-height: 85px;
    resize: vertical;
  }

  .input-with-button {
    display: flex;
    gap: 8px;

    input {
      flex: 1;
    }

    button {
      padding: 0 14px;
      background: ${theme.bgLight};
      border: 1.5px solid ${theme.border};
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 600;
      color: ${theme.textSecondary};
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;

      &:hover {
        background: ${theme.primaryLight};
        color: ${theme.primary};
        border-color: ${theme.primaryBorder};
      }
    }
  }

  .error-text {
    font-size: 0.76rem;
    color: ${theme.highRisk};
    font-weight: 500;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
`;

const RiskSelectorContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 8px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const RiskCard = styled.div`
  border: 2px solid ${(props) => (props.$selected ? (props.$isHigh ? theme.highRisk : theme.lowRisk) : theme.border)};
  background: ${(props) => (props.$selected ? (props.$isHigh ? theme.highRiskBg : theme.lowRiskBg) : "#ffffff")};
  border-radius: 14px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: ${(props) =>
    props.$selected
      ? props.$isHigh
        ? "0 6px 20px rgba(225, 29, 72, 0.18)"
        : "0 6px 20px rgba(5, 150, 105, 0.18)"
      : "0 2px 8px rgba(0, 0, 0, 0.02)"};

  &:hover {
    border-color: ${(props) => (props.$isHigh ? theme.highRisk : theme.lowRisk)};
    transform: translateY(-2px);
  }

  .risk-radio {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid ${(props) => (props.$selected ? (props.$isHigh ? theme.highRisk : theme.lowRisk) : "#cbd5e1")};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &::after {
      content: "";
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: ${(props) => (props.$isHigh ? theme.highRisk : theme.lowRisk)};
      display: ${(props) => (props.$selected ? "block" : "none")};
    }
  }

  .risk-details {
    h4 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: ${(props) => (props.$isHigh ? theme.highRisk : theme.lowRisk)};
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
`;

const SubmitBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 10px;
  padding-top: 18px;
  border-top: 1px solid ${theme.border};
`;

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.accentPink} 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(225, 29, 72, 0.35);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${theme.primaryHover} 0%, ${theme.primary} 100%);
    box-shadow: 0 6px 20px rgba(225, 29, 72, 0.45);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  border-radius: 12px;
  background: #ffffff;
  color: ${theme.textSecondary};
  font-weight: 600;
  font-size: 0.92rem;
  border: 1.5px solid ${theme.border};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.bgLight};
    color: ${theme.textPrimary};
  }
`;

// ── Table & Report Styles ──────────────────────────────────────────
const TableContainer = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid ${theme.border};
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
`;

const FilterToolbar = styled.div`
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid ${theme.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;

  .search-box {
    position: relative;
    flex: 1;
    min-width: 240px;

    input {
      width: 100%;
      padding: 9px 12px 9px 36px;
      border-radius: 10px;
      border: 1.5px solid ${theme.border};
      font-size: 0.88rem;
      outline: none;
      transition: all 0.2s;

      &:focus {
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.12);
      }
    }

    svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }
  }

  .filters {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;

    select,
    input {
      padding: 8px 12px;
      border-radius: 10px;
      border: 1.5px solid ${theme.border};
      font-size: 0.86rem;
      color: ${theme.textPrimary};
      outline: none;
    }
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.88rem;

  thead {
    background: ${theme.bgLight};
    th {
      padding: 12px 16px;
      font-weight: 700;
      color: ${theme.textSecondary};
      border-bottom: 1px solid ${theme.border};
      text-transform: uppercase;
      font-size: 0.74rem;
      letter-spacing: 0.5px;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.15s;

      &:hover {
        background: #fff1f2;
      }
    }

    td {
      padding: 14px 16px;
      color: ${theme.textPrimary};
      vertical-align: middle;
    }
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;

  ${(props) =>
    props.$type === "High Risk"
      ? `
    background: ${theme.highRiskBg};
    color: ${theme.highRisk};
    border: 1px solid ${theme.highRiskBorder};
  `
      : `
    background: ${theme.lowRiskBg};
    color: ${theme.lowRisk};
    border: 1px solid ${theme.lowRiskBorder};
  `}
`;

// ── Modal Styles ───────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;

  @media print {
    position: static !important;
    background: transparent !important;
    backdrop-filter: none !important;
    padding: 0 !important;
    display: block !important;
  }
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 20px;
  max-width: 650px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 30px;
  position: relative;

  @media print {
    position: static !important;
    max-height: none !important;
    overflow: visible !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    padding: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
  }

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: ${theme.bgLight};
    border: none;
    border-radius: 50%;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: ${theme.textSecondary};

    &:hover {
      background: #e2e8f0;
      color: ${theme.textPrimary};
    }

    @media print {
      display: none !important;
    }
  }
`;

const ReceiptPaper = styled.div`
  background: #ffffff;
  color: #000000;
  padding: 24px 30px;
  max-width: 520px;
  margin: 16px auto 0;
  border: 1px solid #d1d5db;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

  @media print {
    margin: 0 auto !important;
    border: 1.5px solid #000000 !important;
    box-shadow: none !important;
    page-break-inside: avoid !important;
  }

  .receipt-header {
    text-align: center;
    margin-bottom: 8px;

    h2 {
      font-size: 1.12rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin: 0;
      color: #000;
      text-transform: uppercase;
    }
    .sub-addr {
      font-size: 0.8rem;
      margin-top: 3px;
      color: #222;
      font-weight: 500;
    }
    .cin-text {
      font-size: 0.78rem;
      margin-top: 2px;
      font-weight: 600;
      color: #333;
    }
  }

  .bill-title-bar {
    border-top: 1.5px solid #000000;
    border-bottom: 1.5px solid #000000;
    padding: 5px 0;
    text-align: center;
    margin: 10px 0 14px;

    h3 {
      font-size: 0.95rem;
      font-weight: 800;
      margin: 0;
      color: #000;
      letter-spacing: 0.2px;
    }
  }

  .meta-table {
    width: 100%;
    margin-bottom: 14px;
    font-size: 0.88rem;
    border-collapse: collapse;

    td {
      padding: 3px 0;
      vertical-align: top;
    }
    .meta-lbl {
      width: 35%;
      font-weight: 700;
      color: #000;
    }
    .meta-val {
      width: 65%;
      font-weight: 600;
      color: #000;
      text-align: right;
    }
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    font-size: 0.88rem;

    thead tr {
      border-top: 1.5px solid #000000;
      border-bottom: 1.5px solid #000000;
    }

    th {
      padding: 6px 2px;
      font-weight: 800;
      color: #000;
      text-align: left;
    }

    tbody tr {
      border-bottom: 1.5px solid #000000;
    }

    td {
      padding: 7px 2px;
      color: #000;
      font-weight: 500;
    }
  }

  .totals-bar {
    border-bottom: 1.5px solid #000000;
    padding: 6px 0;
    margin-top: 2px;

    .total-row {
      display: flex;
      justify-content: flex-end;
      gap: 36px;
      padding: 2px 0;
      font-size: 0.9rem;
      font-weight: 700;

      &.net {
        font-weight: 800;
      }

      .lbl {
        min-width: 90px;
        text-align: right;
      }
      .amt {
        min-width: 80px;
        text-align: right;
        font-weight: 800;
      }
    }
  }

  .signature-area {
    margin-top: 40px;
    font-size: 0.88rem;
    font-weight: 700;
    color: #000;
  }
`;

const PrintStyleWrapper = styled.div`
  @media print {
    @page {
      size: A4 portrait;
      margin: 15mm 20mm;
    }
    body {
      background: #ffffff !important;
      color: #000000 !important;
    }
    body * {
      visibility: hidden !important;
    }
    #printable-receipt,
    #printable-receipt * {
      visibility: visible !important;
    }
    #printable-receipt {
      position: absolute !important;
      left: 50% !important;
      top: 0 !important;
      transform: translateX(-50%) !important;
      width: 100% !important;
      max-width: 560px !important;
      margin: 0 auto !important;
      padding: 24px 28px !important;
      border: 1.5px solid #000000 !important;
      box-shadow: none !important;
      background: #ffffff !important;
      page-break-inside: avoid !important;
    }
    .no-print {
      display: none !important;
    }
  }
`;

// ── Main Component ──────────────────────────────────────────────────
export default function BreastCancerScreening({ isPublic = false }) {
  const [activeTab, setActiveTab] = useState("form"); // "form", "student", or "records"
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [nextBillNo, setNextBillNo] = useState("");

  // When access_token is present (admin/staff), show View Slip action. When no access_token (student/public), do not display View Slip.
  const hasAccessToken = Boolean(
    localStorage.getItem("access_token") &&
    localStorage.getItem("access_token").trim() !== ""
  );
  const showActions = hasAccessToken;

  // ── Tab 2: Student Registration Surveyor State ───────────────────────
  const initialStudentForm = {
    institute_name: "",
    course_name_year: "",
    surveyor_name: "",
    subject_id: "",
  };
  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [studentErrors, setStudentErrors] = useState({});
  const [studentRecords, setStudentRecords] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);

  // Form State
  const initialForm = {
    date: new Date().toISOString().slice(0, 10),
    bill_number: "",
    uhid: "",
    patientname: "",
    age: "",
    gender: "Female",
    subject_id: "",
    subject_phone_number: "",
    subject_address: "",
    surveyor_name: "",
    risk_level: "",
    remarks: "",
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  // Helper to extract success/error message solely from backend response
  const getBackendErrorMessage = (res, err) => {
    // If axios network or promise error
    if (err) {
      if (err.response?.data?.message) return err.response.data.message;
      if (err.response?.data?.error) return err.response.data.error;
      if (err.response?.data?.detail) return err.response.data.detail;
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        if (typeof errors === "object") {
          return Object.entries(errors)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("; ");
        }
        return String(errors);
      }
      return err.message || null;
    }

    // From apiRequest response object
    if (res?.data?.message) return res.data.message;
    if (res?.data?.error) return res.data.error;
    if (res?.data?.detail) return res.data.detail;
    if (res?.error) return res.error;
    if (res?.data?.errors) {
      const errors = res.data.errors;
      if (typeof errors === "object") {
        return Object.entries(errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("; ");
      }
      return String(errors);
    }
    return null;
  };

  // Fetch Screening Records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const url = `${HmsBaseUrl}tanuh_breast_cancer_screening/`;
      const res = await apiRequest(url, "GET");
      if (res.success && Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        setRecords([]);
        if (!res.success) {
          const errorMsg = getBackendErrorMessage(res);
          if (errorMsg) {
            toast.error(errorMsg);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch screening records:", err);
      setRecords([]);
      const errorMsg = getBackendErrorMessage(null, err);
      if (errorMsg) {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch Next Sequential Bill / Receipt Number
  const fetchNextBillNo = async () => {
    try {
      const url = `${HmsBaseUrl}tanuh_breast_cancer_screening/?action=next_bill_no`;
      const res = await apiRequest(url, "GET");
      if (res.success && res.data && res.data.next_bill_number) {
        setNextBillNo(res.data.next_bill_number);
      } else if (!res.success) {
        const errorMsg = getBackendErrorMessage(res);
        if (errorMsg) {
          toast.error(errorMsg);
        }
      }
    } catch (err) {
      console.error("Failed to fetch next bill no:", err);
      const errorMsg = getBackendErrorMessage(null, err);
      if (errorMsg) {
        toast.error(errorMsg);
      }
    }
  };

  // Fetch Registered Student Surveyors (Stored Separately, accessible via PUBLIC_ROUTES)
  const fetchStudentRecords = async () => {
    try {
      setStudentLoading(true);
      const url = `${HmsBaseUrl}tanuh_student_surveyor_registration/`;
      let res = await apiRequest(url, "GET");
      if (res && res.success && Array.isArray(res.data)) {
        setStudentRecords(res.data);
      } else {
        // Direct fetch fallback for public routes without token
        try {
          const raw = await fetch(url);
          if (raw.ok) {
            const data = await raw.json();
            if (Array.isArray(data)) {
              setStudentRecords(data);
              return;
            }
          }
        } catch (_) {}
        setStudentRecords([]);
      }
    } catch (err) {
      console.error("Failed to fetch student surveyor records:", err);
      try {
        const raw = await fetch(`${HmsBaseUrl}tanuh_student_surveyor_registration/`);
        if (raw.ok) {
          const data = await raw.json();
          if (Array.isArray(data)) {
            setStudentRecords(data);
            return;
          }
        }
      } catch (_) {}
      setStudentRecords([]);
    } finally {
      setStudentLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchNextBillNo();
    if (hasAccessToken) {
      fetchStudentRecords();
    }
  }, [hasAccessToken]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Student Surveyor Form Handlers
  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({ ...prev, [name]: value }));
    if (studentErrors[name]) {
      setStudentErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateStudentForm = () => {
    const errs = {};
    if (!studentForm.institute_name || !studentForm.institute_name.trim()) {
      errs.institute_name = "Institute Name is required";
    }
    if (!studentForm.course_name_year || !studentForm.course_name_year.trim()) {
      errs.course_name_year = "Course Name & Year is required";
    }
    if (!studentForm.surveyor_name || !studentForm.surveyor_name.trim()) {
      errs.surveyor_name = "Surveyor Name is required";
    }
    if (!studentForm.subject_id || !studentForm.subject_id.trim()) {
      errs.subject_id = "Subject ID is required";
    }
    setStudentErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!validateStudentForm()) {
      toast.error("Please fill all required student surveyor fields");
      return;
    }

    try {
      setStudentLoading(true);
      const url = `${HmsBaseUrl}tanuh_student_surveyor_registration/`;
      let res = await apiRequest(url, "POST", studentForm);
      let success = res?.success;
      let msg = res?.data?.message || res?.message;

      if (!success) {
        // Direct fetch fallback for public routes without token
        try {
          const raw = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(studentForm),
          });
          if (raw.ok) {
            const data = await raw.json();
            success = true;
            msg = data.message || "Student Surveyor registered successfully";
          }
        } catch (_) {}
      }

      if (success) {
        const successMsg = msg || "Student Surveyor registered successfully";
        toast.success(successMsg);
        // Pre-fill surveyor name & subject ID in screening form if empty
        setForm((prev) => ({
          ...prev,
          surveyor_name: prev.surveyor_name || studentForm.surveyor_name,
          subject_id: prev.subject_id || studentForm.subject_id,
        }));
        setStudentForm(initialStudentForm);
        if (hasAccessToken) {
          fetchStudentRecords();
          // Switch to the Registered Student Surveyors tab for authenticated users
          setActiveTab("registered_students");
        }
      } else {
        const errorMsg = getBackendErrorMessage(res);
        if (errorMsg) toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Student surveyor registration error:", err);
      const errorMsg = getBackendErrorMessage(null, err);
      if (errorMsg) toast.error(errorMsg);
    } finally {
      setStudentLoading(false);
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!form.subject_id.trim()) newErrors.subject_id = "Subject ID is required (Manual Entry)";
    if (!form.subject_phone_number.trim()) {
      newErrors.subject_phone_number = "Phone number is required";
    } else if (!/^\d{10,12}$/.test(form.subject_phone_number.replace(/\D/g, ""))) {
      newErrors.subject_phone_number = "Enter a valid 10-digit mobile number";
    }
    if (!form.subject_address.trim()) newErrors.subject_address = "Address is required";
    if (!form.surveyor_name.trim()) newErrors.surveyor_name = "Surveyor name is required";
    if (!form.risk_level) newErrors.risk_level = "Please assess and select risk level";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const url = `${HmsBaseUrl}tanuh_breast_cancer_screening/`;
      // bill_number is auto-generated on model save; do not pass blank string
      const payload = { ...form };
      if (!payload.bill_number) {
        delete payload.bill_number;
      }
      const res = await apiRequest(url, "POST", payload);

      if (res.success) {
        // Success message obtained from backend response
        const successMsg = res.data?.message || res.message;
        if (successMsg) {
          toast.success(successMsg);
        }
        setForm(initialForm);
        fetchRecords();
        fetchNextBillNo();
        setActiveTab("records");
      } else {
        // Error message obtained from backend response
        const errorMsg = getBackendErrorMessage(res);
        if (errorMsg) {
          toast.error(errorMsg);
        }
      }
    } catch (err) {
      console.error("Submit failed:", err);
      const errorMsg = getBackendErrorMessage(null, err);
      if (errorMsg) {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const total = records.length;
    const high = records.filter((r) => r.risk_level === "High Risk").length;
    const low = records.filter((r) => r.risk_level === "Low risk" || r.risk_level === "Low Risk").length;
    const today = records.filter((r) => (r.date || "").startsWith(todayStr)).length;
    return { total, high, low, today };
  }, [records]);

  // Filtered Records List
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        (r.subject_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.subject_phone_number || "").includes(searchTerm) ||
        (r.surveyor_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.patientname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.subject_address || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchRisk =
        riskFilter === "all" ||
        (riskFilter === "High Risk" && r.risk_level === "High Risk") ||
        (riskFilter === "Low risk" && (r.risk_level === "Low risk" || r.risk_level === "Low Risk"));

      return matchSearch && matchRisk;
    });
  }, [records, searchTerm, riskFilter]);

  // Filtered Student Surveyor Records
  const filteredStudentRecords = useMemo(() => {
    if (!studentSearchTerm.trim()) return studentRecords;
    const term = studentSearchTerm.toLowerCase();
    return studentRecords.filter(
      (r) =>
        (r.institute_name || "").toLowerCase().includes(term) ||
        (r.course_name_year || "").toLowerCase().includes(term) ||
        (r.surveyor_name || "").toLowerCase().includes(term) ||
        (r.subject_id || "").toLowerCase().includes(term)
    );
  }, [studentRecords, studentSearchTerm]);

  // View Slip Modal Trigger
  const handleOpenSlip = (rec) => {
    setSelectedRecord(rec);
    setShowSlipModal(true);
  };

  const handlePrint = () => {
    const printArea = document.getElementById("printable-receipt");
    if (!printArea) {
      window.print();
      return;
    }

    // Clean up any existing print iframe
    const oldIframe = document.getElementById("tanuh-slip-print-frame");
    if (oldIframe) {
      oldIframe.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "tanuh-slip-print-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mammogram Test Bill - ${selectedRecord?.bill_number || "Slip"}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 20mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
              color: #000000;
              background: #ffffff;
              font-size: 13px;
              line-height: 1.4;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .slip-card {
              max-width: 560px;
              margin: 0 auto;
              border: 1.5px solid #000000;
              padding: 24px 28px;
              background: #ffffff;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 8px;
            }
            .receipt-header h2 {
              font-size: 16px;
              font-weight: 800;
              letter-spacing: 0.5px;
              margin: 0;
              color: #000000;
              text-transform: uppercase;
            }
            .receipt-header .sub-addr {
              font-size: 11.5px;
              margin-top: 3px;
              color: #222222;
              font-weight: 500;
            }
            .receipt-header .cin-text {
              font-size: 11px;
              margin-top: 2px;
              font-weight: 600;
              color: #333333;
            }
            .bill-title-bar {
              border-top: 1.5px solid #000000;
              border-bottom: 1.5px solid #000000;
              padding: 5px 0;
              text-align: center;
              margin: 10px 0 14px;
            }
            .bill-title-bar h3 {
              font-size: 13.5px;
              font-weight: 800;
              margin: 0;
              color: #000000;
              letter-spacing: 0.2px;
            }
            .meta-table {
              width: 100%;
              margin-bottom: 14px;
              font-size: 12.5px;
              border-collapse: collapse;
            }
            .meta-table td {
              padding: 3px 0;
              vertical-align: top;
            }
            .meta-table .meta-lbl {
              width: 35%;
              font-weight: 700;
              color: #000000;
            }
            .meta-table .meta-val {
              width: 65%;
              font-weight: 600;
              color: #000000;
              text-align: right;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
              font-size: 12.5px;
            }
            .items-table thead tr {
              border-top: 1.5px solid #000000;
              border-bottom: 1.5px solid #000000;
            }
            .items-table th {
              padding: 6px 4px;
              font-weight: 800;
              color: #000000;
              text-align: left;
            }
            .items-table tbody tr {
              border-bottom: 1.5px solid #000000;
            }
            .items-table td {
              padding: 7px 4px;
              color: #000000;
              font-weight: 500;
            }
            .totals-bar {
              border-bottom: 1.5px solid #000000;
              padding: 6px 0;
              margin-top: 2px;
            }
            .totals-bar .total-row {
              display: flex;
              justify-content: flex-end;
              gap: 36px;
              padding: 2px 0;
              font-size: 12.5px;
              font-weight: 700;
            }
            .totals-bar .total-row.net {
              font-weight: 800;
            }
            .totals-bar .total-row .lbl {
              min-width: 90px;
              text-align: right;
            }
            .totals-bar .total-row .amt {
              min-width: 80px;
              text-align: right;
              font-weight: 800;
            }
            .signature-area {
              margin-top: 40px;
              font-size: 12.5px;
              font-weight: 700;
              color: #000000;
            }
          </style>
        </head>
        <body>
          <div class="slip-card">
            ${printArea.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error("Iframe print error:", err);
        window.print();
      }
    }, 250);
  };

  return (
    <PageContainer>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {/* ── Top Header Banner ─────────────────────────────────── */}
      <HeaderBanner>
        <div className="title-content">
          <div className="ribbon-badge">🎗️</div>
          <div>
            <h1>
              Breast Cancer Screening
              <span className="tag-partner">TANUH × Shanmuga Hospital</span>
            </h1>
            <p>
              <FaHeartbeat /> Early Clinical Assessment & Risk Stratification Programme
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <SecondaryBtn
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}
            onClick={fetchRecords}
          >
            <FaSyncAlt /> Refresh Data
          </SecondaryBtn>
        </div>
      </HeaderBanner>

      {/* ── Metrics Cards ─────────────────────────────────────── */}
      <MetricGrid>
        <MetricCard>
          <div className="metric-icon">
            <FaClipboardList />
          </div>
          <div className="metric-info">
            <h3>{metrics.total}</h3>
            <p>Total Screened</p>
          </div>
        </MetricCard>

        <MetricCard $bg={theme.highRiskBg} $color={theme.highRisk} $borderColor={theme.highRiskBorder}>
          <div className="metric-icon">
            <FaExclamationTriangle />
          </div>
          <div className="metric-info">
            <h3 style={{ color: theme.highRisk }}>{metrics.high}</h3>
            <p style={{ color: theme.highRisk }}>High Risk Cases</p>
          </div>
        </MetricCard>

        <MetricCard $bg={theme.lowRiskBg} $color={theme.lowRisk} $borderColor={theme.lowRiskBorder}>
          <div className="metric-icon">
            <FaShieldAlt />
          </div>
          <div className="metric-info">
            <h3 style={{ color: theme.lowRisk }}>{metrics.low}</h3>
            <p style={{ color: theme.lowRisk }}>Low Risk Cases</p>
          </div>
        </MetricCard>

        <MetricCard $bg="#f0f9ff" $color="#0284c7" $borderColor="#bae6fd">
          <div className="metric-icon">
            <FaCalendarAlt />
          </div>
          <div className="metric-info">
            <h3>{metrics.today}</h3>
            <p>Screened Today</p>
          </div>
        </MetricCard>
      </MetricGrid>

      {/* ── Tab Navigation ────────────────────────────────────── */}
      <TabNavigation>
        <TabButton $active={activeTab === "form"} onClick={() => setActiveTab("form")}>
          <FaFileMedical /> New Screening Form
        </TabButton>
        <TabButton $active={activeTab === "student"} onClick={() => setActiveTab("student")}>
          <FaUserGraduate /> Student Registration Surveyor
        </TabButton>
        {hasAccessToken && (
          <TabButton $active={activeTab === "registered_students"} onClick={() => setActiveTab("registered_students")}>
            <FaClipboardList /> Registered Student Surveyors ({studentRecords.length})
          </TabButton>
        )}
        <TabButton $active={activeTab === "records"} onClick={() => setActiveTab("records")}>
          <FaHeartbeat /> Screening Records & Reports ({records.length})
        </TabButton>
      </TabNavigation>

      {/* ── TAB 1: NEW SCREENING FORM ─────────────────────────── */}
      {activeTab === "form" && (
        <form onSubmit={handleSubmit}>
          {/* Card 1: Subject Identification */}
          <FormCard>
            <div className="section-header">
              <div className="section-icon">
                <FaIdCard />
              </div>
              <h2>Subject Identification</h2>
              <span>* Indicates required question</span>
            </div>

            <FormRow>
              <FormGroup $error={!!errors.subject_id}>
                <label>
                  Subject ID <span className="required">*</span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "0.72rem",
                      background: "#f1f5f9",
                      color: "#475569",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontWeight: 600,
                    }}
                  >
                    Manual Entry
                  </span>
                </label>
                <input
                  type="text"
                  name="subject_id"
                  value={form.subject_id}
                  onChange={handleChange}
                  placeholder="Enter Subject ID manually (e.g. TBCS0101)"
                />
                {errors.subject_id && <span className="error-text">{errors.subject_id}</span>}
              </FormGroup>

              <FormGroup $error={!!errors.subject_phone_number}>
                <label>
                  Subject Phone Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="subject_phone_number"
                  value={form.subject_phone_number}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  maxLength={12}
                />
                {errors.subject_phone_number && <span className="error-text">{errors.subject_phone_number}</span>}
              </FormGroup>

              <FormGroup>
                <label>Patient / Subject Name</label>
                <input
                  type="text"
                  name="patientname"
                  value={form.patientname}
                  onChange={handleChange}
                  placeholder="Optional Name"
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="e.g. 45"
                  min="1"
                  max="120"
                />
              </FormGroup>

              <FormGroup>
                <label>
                  Gender
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "0.72rem",
                      background: "#f1f5f9",
                      color: "#475569",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontWeight: 600,
                    }}
                  >
                    Fixed
                  </span>
                </label>
                <input
                  type="text"
                  name="gender"
                  value={form.gender || "Female"}
                  readOnly
                  style={{
                    background: "#f8fafc",
                    cursor: "not-allowed",
                    color: "#0f172a",
                    fontWeight: 600,
                  }}
                  title="Gender is fixed to Female for Breast Cancer Screening"
                />
              </FormGroup>

              <FormGroup>
                <label>UHID / Patient ID</label>
                <input
                  type="text"
                  name="uhid"
                  value={form.uhid}
                  onChange={handleChange}
                  placeholder="e.g. 1920/004085"
                />
              </FormGroup>

              <FormGroup>
                <label>
                  Bill  No
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "0.72rem",
                      background: "#e0f2fe",
                      color: "#0369a1",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontWeight: 700,
                    }}
                  >

                  </span>
                </label>
                <input
                  type="text"
                  name="bill_number"
                  value={nextBillNo || "Auto-generating on save (e.g. 2627/01)..."}
                  readOnly
                  style={{
                    background: "#f8fafc",
                    cursor: "not-allowed",
                    color: "#0f172a",
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                  title="Auto-generated sequential bill number for current financial year"
                />
              </FormGroup>
            </FormRow>
          </FormCard>

          {/* Card 2: Location & Surveyor Details */}
          <FormCard>
            <div className="section-header">
              <div className="section-icon">
                <FaMapMarkerAlt />
              </div>
              <h2>Location & Surveyor Details</h2>
            </div>

            <FormGroup $error={!!errors.subject_address}>
              <label>
                Subject Address <span className="required">*</span>
              </label>
              <textarea
                name="subject_address"
                value={form.subject_address}
                onChange={handleChange}
                placeholder="Enter complete residential address, ward, village, or town..."
              />
              {errors.subject_address && <span className="error-text">{errors.subject_address}</span>}
            </FormGroup>

            <FormRow>
              <FormGroup $error={!!errors.surveyor_name}>
                <label>
                  Surveyor Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="surveyor_name"
                  value={form.surveyor_name}
                  onChange={handleChange}
                  placeholder="Enter name of healthcare surveyor / nurse..."
                />
                {errors.surveyor_name && <span className="error-text">{errors.surveyor_name}</span>}
              </FormGroup>

              <FormGroup>
                <label>Screening Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} />
              </FormGroup>
            </FormRow>
          </FormCard>

          {/* Card 3: Clinical Risk Assessment (From Screenshot) */}
          <FormCard>
            <div className="section-header">
              <div className="section-icon">
                <FaHeartbeat />
              </div>
              <h2>Clinical Risk Level Assessment</h2>
              <span style={{ color: theme.primary, fontWeight: 700 }}>* Mandatory Evaluation</span>
            </div>

            <FormGroup $error={!!errors.risk_level}>
              <label>
                Risk level <span className="required">*</span>
              </label>

              <RiskSelectorContainer>
                <RiskCard
                  $isHigh={true}
                  $selected={form.risk_level === "High Risk"}
                  onClick={() => setForm((p) => ({ ...p, risk_level: "High Risk" }))}
                >
                  <div className="risk-radio" />
                  <div className="risk-details">
                    <h4>
                      <FaExclamationTriangle /> High Risk
                    </h4>
                  </div>
                </RiskCard>

                <RiskCard
                  $isHigh={false}
                  $selected={form.risk_level === "Low risk"}
                  onClick={() => setForm((p) => ({ ...p, risk_level: "Low risk" }))}
                >
                  <div className="risk-radio" />
                  <div className="risk-details">
                    <h4>
                      <FaShieldAlt /> Low risk
                    </h4>
                  </div>
                </RiskCard>
              </RiskSelectorContainer>
              {errors.risk_level && <span className="error-text">{errors.risk_level}</span>}
            </FormGroup>

            <FormGroup style={{ marginTop: "20px" }}>
              <label>Clinical Observations / Surveyor Remarks</label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Additional notes, specific complaints, family history, or recommendation instructions..."
              />
            </FormGroup>

            <SubmitBar>
              <SecondaryBtn type="button" onClick={() => setForm(initialForm)}>
                Clear Form
              </SecondaryBtn>
              <PrimaryBtn type="submit" disabled={loading}>
                <FaCheckCircle /> {loading ? "Submitting..." : "Submit Screening Record"}
              </PrimaryBtn>
            </SubmitBar>
          </FormCard>
        </form>
      )}

      {/* ── TAB 2: STUDENT REGISTRATION SURVEYOR ──────────────── */}
      {activeTab === "student" && (
        <>
          <form onSubmit={handleStudentSubmit}>
            <FormCard>
              <div className="section-header">
                <div className="section-icon">
                  <FaUserGraduate />
                </div>
                <h2>Student Registration Surveyor</h2>
                <span>* Indicates required question</span>
              </div>

              <FormRow>
                <FormGroup $error={!!studentErrors.institute_name}>
                  <label>
                    Institute Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="institute_name"
                    value={studentForm.institute_name}
                    onChange={handleStudentChange}
                    placeholder="e.g. Shanmuga College of Nursing / Medical College"
                  />
                  {studentErrors.institute_name && (
                    <span className="error-text">{studentErrors.institute_name}</span>
                  )}
                </FormGroup>

                <FormGroup $error={!!studentErrors.course_name_year}>
                  <label>
                    Course Name and Year <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="course_name_year"
                    value={studentForm.course_name_year}
                    onChange={handleStudentChange}
                    placeholder="e.g. B.Sc Nursing - 3rd Year / MBBS Final Year"
                  />
                  {studentErrors.course_name_year && (
                    <span className="error-text">{studentErrors.course_name_year}</span>
                  )}
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup $error={!!studentErrors.surveyor_name}>
                  <label>
                    Surveyor Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="surveyor_name"
                    value={studentForm.surveyor_name}
                    onChange={handleStudentChange}
                    placeholder="e.g. Student / Surveyor Full Name"
                  />
                  {studentErrors.surveyor_name && (
                    <span className="error-text">{studentErrors.surveyor_name}</span>
                  )}
                </FormGroup>

                <FormGroup $error={!!studentErrors.subject_id}>
                  <label>
                    Subject ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject_id"
                    value={studentForm.subject_id}
                    onChange={handleStudentChange}
                    placeholder="e.g. TBCS0101"
                  />
                  {studentErrors.subject_id && (
                    <span className="error-text">{studentErrors.subject_id}</span>
                  )}
                </FormGroup>
              </FormRow>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  marginTop: "24px",
                  paddingTop: "16px",
                  borderTop: `1px solid ${theme.border}`,
                }}
              >
                <SecondaryBtn
                  type="button"
                  onClick={() => {
                    setStudentForm(initialStudentForm);
                    setStudentErrors({});
                  }}
                >
                  <FaSyncAlt /> Clear Form
                </SecondaryBtn>
                <PrimaryBtn type="submit" disabled={studentLoading}>
                  <FaUserCheck /> {studentLoading ? "Registering..." : "Register Student Surveyor"}
                </PrimaryBtn>
              </div>
            </FormCard>
          </form>
        </>
      )}

      {/* ── TAB 3: REGISTERED STUDENT SURVEYORS (STORED SEPARATELY) ── */}
      {hasAccessToken && activeTab === "registered_students" && (
        <TableContainer>
          <div className="table-header">
            <div className="table-title">
              <h2>Registered Student Surveyors</h2>
              <p>List of all student surveyors registered for screening program (stored separately)</p>
            </div>

            <div className="table-actions">
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search by Institute, Course, Surveyor, Subject ID..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                />
              </div>

              <SecondaryBtn onClick={fetchStudentRecords} disabled={studentLoading}>
                <FaSyncAlt className={studentLoading ? "fa-spin" : ""} /> Refresh
              </SecondaryBtn>
            </div>
          </div>

          {filteredStudentRecords.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", color: theme.textSecondary }}>
              <FaClipboardList style={{ fontSize: "42px", color: "#cbd5e1", marginBottom: "12px" }} />
              <h3 style={{ margin: "0 0 6px 0", color: theme.textPrimary }}>No Student Surveyors Found</h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "0.9rem" }}>
                {studentSearchTerm
                  ? "No student surveyors matching your search criteria."
                  : "No student surveyors registered yet. Click below to register a student surveyor."}
              </p>
              <PrimaryBtn style={{ margin: "0 auto" }} onClick={() => setActiveTab("student")}>
                <FaUserGraduate /> Go to Student Registration
              </PrimaryBtn>
            </div>
          ) : (
            <StyledTable>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Institute Name</th>
                  <th>Course Name & Year</th>
                  <th>Surveyor Name</th>
                  <th>Subject ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudentRecords.map((s) => (
                  <tr key={s.id || s._id || `${s.subject_id}-${s.surveyor_name}`}>
                    <td>
                      <strong>{s.date || "—"}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: theme.darkSlate }}>
                        {s.institute_name || "—"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#f1f5f9",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#334155",
                        }}
                      >
                        {s.course_name_year || "—"}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: theme.primary }}>{s.surveyor_name || "—"}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color: "#0f172a",
                          background: "#fff1f2",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                          border: `1px solid ${theme.primaryBorder}`,
                        }}
                      >
                        {s.subject_id || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          )}
        </TableContainer>
      )}

      {/* ── TAB 4: SCREENING RECORDS & REPORTS ────────────────── */}
      {activeTab === "records" && (
        <TableContainer>
          <FilterToolbar>
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search by Subject ID, Phone, Surveyor, or Address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filters">
              <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
                <option value="all">All Risk Levels</option>
                <option value="High Risk">High Risk Only</option>
                <option value="Low risk">Low Risk Only</option>
              </select>

              <SecondaryBtn onClick={fetchRecords}>
                <FaSyncAlt /> Refresh
              </SecondaryBtn>
            </div>
          </FilterToolbar>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: theme.textSecondary }}>
              Loading screening records...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: theme.textSecondary }}>
              <MdOutlineMedicalServices style={{ fontSize: "48px", color: "#cbd5e1", marginBottom: "12px" }} />
              <h3 style={{ margin: "0 0 6px", color: theme.textPrimary }}>No Screening Records Found</h3>
              <p style={{ margin: 0 }}>Start by filling out a new screening assessment form above.</p>
            </div>
          ) : (
            <StyledTable>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bill / Receipt No</th>
                  <th>Subject ID</th>
                  <th>Subject Details</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Surveyor</th>
                  <th>Risk Level</th>
                  {showActions && <th style={{ textAlign: "right" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id || r._id || r.bill_number || r.subject_id}>
                    <td>
                      <strong>{r.date || "—"}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color: "#0f172a",
                          background: "#f1f5f9",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {r.bill_number || "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: theme.primary }}>{r.subject_id}</span>
                    </td>
                    <td>
                      <strong>{r.patientname || "—"}</strong>
                      {r.age && <span style={{ color: theme.textSecondary }}> ({r.age} yrs)</span>}
                      {r.uhid && (
                        <div style={{ fontSize: "0.72rem", color: theme.textSecondary }}>UHID: {r.uhid}</div>
                      )}
                    </td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <FaPhoneAlt style={{ fontSize: "11px", color: theme.textSecondary }} />
                        {r.subject_phone_number}
                      </span>
                    </td>
                    <td style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.subject_address}
                    </td>
                    <td>{r.surveyor_name}</td>
                    <td>
                      <Badge $type={r.risk_level}>
                        {r.risk_level === "High Risk" ? <FaExclamationTriangle /> : <FaShieldAlt />}
                        {r.risk_level || "Not Assessed"}
                      </Badge>
                    </td>
                    {showActions && (
                      <td style={{ textAlign: "right" }}>
                        <SecondaryBtn style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => handleOpenSlip(r)}>
                          <FaPrint /> View Slip
                        </SecondaryBtn>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          )}
        </TableContainer>
      )}

      {/* ── PRINTABLE SLIP MODAL ──────────────────────────────── */}
      {showSlipModal && selectedRecord && (
        <ModalOverlay onClick={() => setShowSlipModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <button className="close-btn no-print" onClick={() => setShowSlipModal(false)}>
              <MdClose />
            </button>

            <div
              className="no-print"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: theme.darkSlate }}>
                Mammogram Test Bill Preview
              </h2>
              <PrimaryBtn style={{ padding: "8px 18px", fontSize: "0.85rem" }} onClick={handlePrint}>
                <FaPrint /> Print Slip
              </PrimaryBtn>
            </div>

            <PrintStyleWrapper>
              <ReceiptPaper id="printable-receipt">
                <div className="receipt-header">
                  <h2>SHANMUGA HOSPITAL LIMITED</h2>
                  <div className="sub-addr">51/24, Saradha College Road, Salem - 636007</div>
                  <div className="cin-text">CIN: L85110TZ2020PLC033974</div>
                </div>

                <div className="bill-title-bar">
                  <h3>Mammogram Test Tanuh Bill(SH)</h3>
                </div>

                <table className="meta-table">
                  <tbody>
                    <tr>
                      <td className="meta-lbl">Bill Number:</td>
                      <td className="meta-val">{selectedRecord.bill_number || "—"}</td>
                    </tr>
                    <tr>
                      <td className="meta-lbl">Subject ID:</td>
                      <td className="meta-val">{selectedRecord.subject_id || "—"}</td>
                    </tr>
                    <tr>
                      <td className="meta-lbl">Bill Date:</td>
                      <td className="meta-val">
                        {selectedRecord.date || new Date().toISOString().slice(0, 10)}
                      </td>
                    </tr>
                    <tr>
                      <td className="meta-lbl">Patient Name:</td>
                      <td className="meta-val">{selectedRecord.patientname || "—"}</td>
                    </tr>
                    <tr>
                      <td className="meta-lbl">Gender:</td>
                      <td className="meta-val">{selectedRecord.gender || "Female"}</td>
                    </tr>
                    <tr>
                      <td className="meta-lbl">Age:</td>
                      <td className="meta-val">{selectedRecord.age || "—"}</td>
                    </tr>
                  </tbody>
                </table>

                <table className="items-table">
                  <thead>
                    <tr>
                      <th style={{ width: "8%" }}>No</th>
                      <th style={{ width: "52%" }}>Description</th>
                      <th style={{ width: "12%", textAlign: "right" }}>Qty</th>
                      <th style={{ width: "14%", textAlign: "right" }}>Cost</th>
                      <th style={{ width: "14%", textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td style={{ fontWeight: 700 }}>Mammogram Test</td>
                      <td style={{ textAlign: "right" }}>1</td>
                      <td style={{ textAlign: "right" }}>0.00</td>
                      <td style={{ textAlign: "right" }}>0.00</td>
                    </tr>
                  </tbody>
                </table>

                <div className="totals-bar">
                  <div className="total-row">
                    <span className="lbl">Total:</span>
                    <span className="amt">₹0.00</span>
                  </div>
                  <div className="total-row net">
                    <span className="lbl">Net Amount:</span>
                    <span className="amt">₹0.00</span>
                  </div>
                </div>

                <div className="signature-area">
                  Signature: __________________________
                </div>
              </ReceiptPaper>
            </PrintStyleWrapper>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}
