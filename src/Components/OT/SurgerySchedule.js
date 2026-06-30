import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RotateCcw,
  Save,
  X,
  FileDown,
  Pencil,
  Trash2,
  CheckCircle,
  CalendarClock,
  PackageCheck,
  PackageOpen,
  UserCircle,
  CheckCheck,
  Printer,
  FlaskConical,
  Pill,
  Hammer,
} from "lucide-react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import styled from "styled-components";
import {
  colors,
  Container,
  Button,
  Label,
  Input,
  Select,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  NoResults,
} from "../GlobalStyles";

// ─── Layout ────────────────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  width: 100%;
  padding: 16px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const DateRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SmallLabel = styled.span`
  font-size: 0.78rem;
  color: ${colors.textMuted};
  font-weight: 500;
`;

const DateInput = styled.input`
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.84rem;
  color: ${colors.textMain};
  background: ${colors.background};
  outline: none;
  &:focus {
    border-color: ${colors.primary};
  }
`;

const TimeInput = styled.input`
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.84rem;
  width: 110px;
  color: ${colors.textMain};
  background: ${colors.background};
  outline: none;
  &:focus {
    border-color: ${colors.primary};
  }
`;

const IconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: none;
  border-radius: 6px;
  padding: 7px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover {
    opacity: 0.85;
  }
`;

const GreenBtn = styled(IconBtn)`
  background: #16a34a;
  color: #fff;
`;
const TealBtn = styled(IconBtn)`
  background: #0d9488;
  color: #fff;
`;
const OrangeBtn = styled(IconBtn)`
  background: #ea580c;
  color: #fff;
`;
const DarkBtn = styled(IconBtn)`
  background: #334155;
  color: #fff;
`;
const DangerBtn = styled(IconBtn)`
  background: ${colors.danger};
  color: #fff;
  padding: 3px 8px;
  font-size: 0.75rem;
`;
const EditBtn = styled(IconBtn)`
  background: ${colors.secondary};
  color: #fff;
  padding: 3px 8px;
  font-size: 0.75rem;
`;

// ─── Form Panel ────────────────────────────────────────────────────────────────
const FormPanel = styled.div`
  background: #e8eff5;
  border: 1px solid ${colors.border};
  border-radius: 10px;
  padding: 16px 20px 20px;
  margin-bottom: 18px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 10px 12px;
  align-items: end;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  grid-column: span ${({ span }) => span || 2};
`;

const Required = styled.span`
  color: ${colors.danger};
  margin-left: 2px;
`;

const SearchIconInput = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  & input {
    flex: 1;
    border: none;
    padding: 6px 8px;
    font-size: 0.84rem;
    outline: none;
    background: transparent;
    color: ${colors.textMain};
  }
  & button {
    background: #334155;
    border: none;
    color: #fff;
    padding: 6px 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    &:hover {
      background: #1e293b;
    }
  }
`;

const AgeGroup = styled.div`
  display: flex;
  gap: 4px;
  & input {
    width: 56px;
    border: 1px solid ${colors.border};
    border-radius: 6px;
    padding: 6px 6px;
    font-size: 0.82rem;
    outline: none;
    background: #f1f5f9;
    color: ${colors.textMain};
    text-align: center;
    &:focus {
      border-color: ${colors.primary};
    }
  }
`;

const ReadonlyInput = styled.input`
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.84rem;
  background: #f1f5f9;
  color: ${colors.textMuted};
  width: 100%;
  outline: none;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 7px 0;
  & label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.84rem;
    cursor: pointer;
    color: ${colors.textMain};
  }
`;

const CheckLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.84rem;
  cursor: pointer;
  color: ${colors.textMain};
`;

// ─── Additional Staff Section ──────────────────────────────────────────────────
const StaffSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 14px;
`;

const StaffCard = styled.div`
  background: #f8fafc;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 12px 14px;
`;

const StaffTitle = styled.div`
  font-size: 0.82rem;
  font-weight: 700;
  color: ${colors.textMain};
  margin-bottom: 10px;
`;

const StaffRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
`;

const TagChip = styled.span`
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  & button {
    background: none;
    border: none;
    cursor: pointer;
    color: #1d4ed8;
    font-size: 0.85rem;
    padding: 0;
    line-height: 1;
    &:hover {
      color: #dc2626;
    }
  }
`;

// ─── Table Section ─────────────────────────────────────────────────────────────
const TableCard = styled.div`
  background: ${colors.surface};
  border-radius: 10px;
  border: 1px solid ${colors.border};
  padding: 14px 16px;
`;

const TableTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.82rem;
  color: ${colors.textMain};
  cursor: pointer;
`;

const TableSearchInput = styled.input`
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 0.82rem;
  outline: none;
  width: 200px;
  &:focus {
    border-color: ${colors.primary};
  }
`;

const StatusBadge = styled.span`
  padding: 2px 9px;
  border-radius: 20px;
  font-size: 0.71rem;
  font-weight: 600;
  background: ${({ s }) =>
    s === "Scheduled"
      ? "#dbeafe"
      : s === "Confirmed"
        ? "#dcfce7"
        : s === "Completed"
          ? "#dcfce7"
          : s === "Postponed"
            ? "#ede9fe"
            : s === "Cancelled"
              ? "#fee2e2"
              : "#f1f5f9"};
  color: ${({ s }) =>
    s === "Scheduled"
      ? "#1d4ed8"
      : s === "Confirmed"
        ? "#15803d"
        : s === "Completed"
          ? "#16a34a"
          : s === "Postponed"
            ? "#7c3aed"
            : s === "Cancelled"
              ? "#dc2626"
              : "#374151"};
`;

const AdmissionBadge = styled.span`
  padding: 2px 9px;
  border-radius: 20px;
  font-size: 0.71rem;
  font-weight: 600;
  background: ${({ a }) =>
    a === "Admitted" ? "#dcfce7" : a === "Discharged" ? "#dbeafe" : "#fee2e2"};
  color: ${({ a }) =>
    a === "Admitted" ? "#16a34a" : a === "Discharged" ? "#1d4ed8" : "#dc2626"};
`;
// Blinking red dot for emergency cases
const EmergencyDot = styled.span`
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #dc2626;
  margin-left: 5px;
  vertical-align: middle;
  animation: emergencyBlink 1s step-start infinite;
  @keyframes emergencyBlink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;

// Emergency label shown beside status badge
const EmergencyTag = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  color: #dc2626;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 4px;
  animation: emergencyBlink 1s step-start infinite;
  @keyframes emergencyBlink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;

const ActionBtnRow = styled.div`
  display: flex;
  gap: 3px;
  align-items: center;
`;

// Individual icon button — tooltip shown via title attribute
const IconAction = styled.button`
  background: none;
  border: none;
  padding: 4px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    transform 0.1s;
  color: ${({ col, disabled }) => (disabled ? "#cbd5e1" : col || "#64748b")};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.45 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
  &:hover {
    background: ${({ col, disabled }) =>
      disabled ? "none" : col ? col + "18" : "#f1f5f9"};
    transform: ${({ disabled }) => (disabled ? "none" : "scale(1.15)")};
  }
`;

// Postpone date modal overlay
const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PostponeBox = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px 28px;
  width: 340px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
`;

const PostponeTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${colors.textMain};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PostponeBtns = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
`;

// ─── Consts ────────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

const emptyForm = {
  uhid_no: "",
  ip_number: "",
  patient_name: "",
  address: "",
  age: "",
  age_type: "",
  gender: "",
  customer_type: "",
  company_name: "",
  company_code: "",
  ot_id: "",
  surgery_name: "",
  surgeon_id: "",
  scheduled_date: today(),
  startTime: "",
  endTime: "",
  surgery_type: "Minor",
  is_emergency: false,
  anaesthetist_id: "",
  anesthesia_id: "",
  diagnosis: "",
  remarks: "",
  billTypeNo: "",
  is_pack_request_CSSD: false,
  is_pack_return_CSSD: false,
};

const ActionPopover = ({
  s,
  anchorEl,
  onClose,
  onEdit,
  onCancel,
  onPostpone,
  onCssdReq,
  onCssdReturn,
  onConfirm,
  onLab,
  onMedicine,
  onImplant,
  canEdit,
  canDelete,
  canSchedule,
  canApprove,
  canLab,
  canMedicine,
  canImplant,
}) => {
  const isConfirmed = s.status === "Confirmed";
  const isCancelled = s.status === "Cancelled";
  const lockMain = isConfirmed || isCancelled;
  const lockConfirm = isConfirmed || isCancelled;
  const lockCssd = s.is_pack_request_CSSD && s.is_pack_return_CSSD;
  // Admission / discharge gating for request icons (Lab / Medicine / Implant)
  const admissionCancelled = !s.is_admitted && !s.is_discharged;
  const discharged = !s.is_admitted && s.is_discharged;
  const requestLockReason = admissionCancelled
    ? "Admission cancelled"
    : discharged
      ? "Discharged"
      : "";
  const requestsDisabled = !isConfirmed || admissionCancelled || discharged;

  const [pos, setPos] = React.useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX,
      });
    }
  }, [anchorEl]);

  const groups = [
    {
      title: "Schedule actions",
      items: [
        canEdit && {
          icon: <Pencil size={15} />,
          label: "Edit",
          color: "#0d9488",
          disabled: lockMain,
          onClick: onEdit,
        },
        canDelete && {
          icon: <X size={15} />,
          label: "Cancel",
          color: "#dc2626",
          disabled: lockMain,
          onClick: onCancel,
        },
        canSchedule && {
          icon: <CalendarClock size={15} />,
          label: "Postpone",
          color: "#7c3aed",
          disabled: lockMain,
          onClick: onPostpone,
        },
        canApprove && {
          icon: <CheckCheck size={15} />,
          label: "Confirm",
          color: "#ea580c",
          disabled: lockConfirm,
          onClick: onConfirm,
        },
      ].filter(Boolean),
    },
    {
      title: "CSSD",
      items: [
        {
          icon: <PackageCheck size={15} />,
          label: "Pack request",
          color: s.is_pack_request_CSSD ? "#16a34a" : "#94a3b8",
          disabled: lockCssd,
          onClick: onCssdReq,
        },
        {
          icon: <PackageOpen size={15} />,
          label: "Pack return",
          color: s.is_pack_return_CSSD ? "#16a34a" : "#94a3b8",
          disabled: lockCssd,
          onClick: onCssdReturn,
        },
      ],
    },
    {
      title: "Requests",
      items: [
        canLab && {
          icon: <FlaskConical size={15} />,
          label: requestLockReason || "Lab request",
          color: "#0891b2",
          disabled: requestsDisabled,
          onClick: onLab,
        },
        canMedicine && {
          icon: <Pill size={15} />,
          label: requestLockReason || "Medicine",
          color: "#7c3aed",
          disabled: requestsDisabled,
          onClick: onMedicine,
        },
        canImplant && {
          icon: <Hammer size={15} />,
          label: requestLockReason || "Implant",
          color: "#b45309",
          disabled: requestsDisabled,
          onClick: onImplant,
        },
      ].filter(Boolean),
    },
  ];

  const popover = (
    <div
      className="ot-action-popover"
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        transform: "translateX(-100%)",
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "10px 12px",
        zIndex: 99999,
        minWidth: 230,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      }}
    >
      {groups.map((group, gi) => (
        <div key={gi}>
          {gi > 0 && (
            <div style={{ borderTop: "1px solid #f1f5f9", margin: "8px 0" }} />
          )}
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 6,
            }}
          >
            {group.title}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${group.items.length <= 2 ? group.items.length : 4}, 1fr)`,
              gap: 4,
            }}
          >
            {group.items.map((item, ii) => (
              <button
                key={ii}
                disabled={item.disabled}
                title={item.label}
                onMouseDown={(e) => {
                  {
                    /* ← CHANGE onClick → onMouseDown */
                  }
                  e.stopPropagation();
                  if (!item.disabled) {
                    item.onClick();
                  }
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "8px 6px",
                  border: "1px solid transparent",
                  borderRadius: 8,
                  background: "none",
                  cursor: item.disabled ? "not-allowed" : "pointer",
                  opacity: item.disabled ? 0.38 : 1,
                  transition: "background 0.12s, border-color 0.12s",
                  color: item.color,
                }}
                onMouseEnter={(e) => {
                  if (!item.disabled) {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                {item.icon}
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "#64748b",
                    lineHeight: 1.2,
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return createPortal(popover, document.body);
};
// ─────────────────────────────────────────────────────────────────────────────
const SurgerySchedule = () => {
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const navigate = useNavigate();

  // ── Raise Lab Request → navigate to InvestigationBilling ─────────────────
  const raiseLabRequest = (s) => {
    navigate("/OTLabBilling", {
      state: {
        patientData: {
          // Patient info — s comes from _enrich() so uses enriched field names
          uhid: s.uhid || "",
          ipNumber: s.ip_number || "",
          patient_name: s.patient_name || "", // full resolved name from _enrich
          firstName: s.patient_name || "",
          lastName: "",
          salutation: "",
          age: String(s.age || ""),
          age_type: String(s.age_type || ""),
          gender: s.gender || "",
          ot_name: s.ot_name || "",
          // Company / insurance
          customer_type: s.customer_type || "",
          company_name: s.company_name || "",
          company_code: s.company_code || "",
          // Emergency flag
          is_emergency: !!s.is_emergency,
          // Pre-set doctor from surgeon
          doctor: s.surgeon_name || s.surgeon_id || "",
          // Source reference
          surgeryRef: s.reference_no || "",
        },
      },
    });
  };

  // ── Raise Medicine Request → navigate to OTMedicineBilling ──────────────
  const raiseMedicineRequest = (s) => {
    navigate("/OTMedicineBilling", {
      state: {
        patientData: {
          // ── Patient info (same fields as raiseLabRequest) ──────────────
          uhid: s.uhid || "",
          ipNumber: s.ip_number || "",
          patient_name: s.patient_name || "",
          firstName: s.patient_name || "",
          lastName: "",
          salutation: "",
          age: String(s.age || ""),
          age_type: String(s.age_type || ""),
          gender: s.gender || "",
          // ── Company / insurance ────────────────────────────────────────
          customer_type: s.customer_type || "",
          customerType: s.customer_type || "", // MedicineWardRequest uses camelCase
          company_name: s.company_name || "",
          companyName: s.company_name || "", // MedicineWardRequest uses camelCase
          company_code: s.company_code || "",
          // ── Emergency flag ─────────────────────────────────────────────
          is_emergency: !!s.is_emergency,
          // ── Doctor / OT (ward request specific fields) ─────────────────
          admittingDoctor: s.surgeon_name || s.surgeon_id || "",
          roomNo: s.ot_name || s.ot_id || "",
          bedNo: "",
          // ── Source reference ───────────────────────────────────────────
          surgeryRef: s.reference_no || "",
        },
      },
    });
  };

  // ── Raise Implant Request → navigate to OTImplantRequest ────────────────
  const raiseImplantRequest = (s) => {
    navigate("/OTImplantRequest", {
      state: {
        patientData: {
          uhid: s.uhid || "",
          ipNumber: s.ip_number || "",
          patient_name: s.patient_name || "",
          firstName: s.patient_name || "",
          lastName: "",
          salutation: "",
          age: String(s.age || ""),
          age_type: String(s.age_type || ""),
          gender: s.gender || "",
          customer_type: s.customer_type || "",
          customerType: s.customer_type || "",
          company_name: s.company_name || "",
          companyName: s.company_name || "",
          company_code: s.company_code || "",
          is_emergency: !!s.is_emergency,
          surgeonName: s.surgeon_name || "",
          surgeonId: s.surgeon_id || "",
          roomNo: s.ot_name || s.ot_id || "",
          bedNo: "",
          surgeryRef: s.reference_no || "",
        },
      },
    });
  };

  // Date filter
  const [fromDate, setFromDate] = useState(today());
  const [toDate, setToDate] = useState(today());
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errorMsg, setErrorMsg] = useState("");
  const [addAnes, setAddAnes] = useState([]); // [{ id, name }]
  const [addDoctors, setAddDoctors] = useState([]); // [{ id, name }]
  const [anesInput, setAnesInput] = useState("");
  const [docInput, setDocInput] = useState("");
  const [scheduleList, setScheduleList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [openPopover, setOpenPopover] = useState(null);
  const anchorRefs = React.useRef({});
  const [popoverData, setPopoverData] = useState(null);
  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]",
  );
  const canEdit = allowedActions.includes("HMS-P-OTSSE-RW");
  const canDelete = allowedActions.includes("HMS-P-OTSSD-RW");
  const canSchedule = allowedActions.includes("HMS-P-OTSSU-RW");
  const canApprove = allowedActions.includes("HMS-P-OTSSA-RW");
  const canLab = allowedActions.includes("HMS-P-IB-RW");
  const canMedicine = allowedActions.includes("HMS-P-OTMB-RW");
  const canImplant = allowedActions.includes("HMS-P-OTIR-RW");

  const toggleFilter = (key) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };
  const [tableSearch, setTableSearch] = useState("");

  // Dropdown options
  const [otOptions, setOtOptions] = useState([]);
  const [surgicalItems, setSurgicalItems] = useState([]); // from investigation-items API
  const [doctorOptions, setDoctorOptions] = useState([]); // shared: surgeon + anaesthetist + staff
  const [anesNameOptions, setAnesNameOptions] = useState([]);
  const [diagnosisOptions, setDiagnosisOptions] = useState([]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Safely extract array from any API response shape
  const toArray = (res) => {
    if (!res || !res.success) return [];
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.results)) return d.results;
    return [];
  };

  // Normalize doctor shape → always { id, name }
  // Handles: { employeeId, employeeName } OR { doctor_id, doctor_name } OR { id, name }
  const normalizeDoctors = (arr) =>
    arr.map((d) => ({
      id: d.employeeId || d.doctor_id || d.id || "",
      name: d.employeeName || d.doctor_name || d.name || "",
    }));

  useEffect(() => {
    const handler = (e) => {
      // Allow clicks inside the popover portal (rendered in body)
      if (e.target.closest(".action-popover-wrap")) return;
      if (e.target.closest(".ot-action-popover")) return;
      setOpenPopover(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch masters ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [otRes, doctorRes, anesNameRes, surgicalRes, diagnosisRes] =
          await Promise.all([
            apiRequest(`${HMSURL}list_ots/`, "GET"),
            apiRequest(`${HMSURL}doctor_list_diagnostics/`, "GET"),
            apiRequest(`${HMSURL}list_anes/`, "GET"),
            apiRequest(
              `${HMSURL}investigation-items/?billTypeNo=SUR01&billType=61`,
              "GET",
            ),
            apiRequest(`${HMSURL}list_diagnosis/`, "GET"),
          ]);

        setOtOptions(toArray(otRes));
        setAnesNameOptions(toArray(anesNameRes));

        // One doctor list feeds: Scheduled Surgeon, Anaesthetist, and both staff cards
        const doctors = normalizeDoctors(toArray(doctorRes));
        setDoctorOptions(doctors);

        // Surgery Name items — API returns { items: [...] } with itemName + price
        const rawSurgical =
          surgicalRes?.items ||
          surgicalRes?.data?.items ||
          toArray(surgicalRes);
        setSurgicalItems(Array.isArray(rawSurgical) ? rawSurgical : []);

        // Diagnosis list — { diagnostics_id, diagnostics_name }
        setDiagnosisOptions(toArray(diagnosisRes));
      } catch {
        // Non-blocking — dropdowns stay empty if API fails
      }
    };
    fetchMasters();
  }, [HMSURL]);

  // ── Fetch schedule list ───────────────────────────────────────────────────
  const fetchSchedules = useCallback(
    async (fd = fromDate, td = toDate) => {
      setLoading(true);
      try {
        const url = `${HMSURL}list_surgery_schedules/?from_date=${fd}&to_date=${td}`;
        const result = await apiRequest(url, "GET");
        if (result.success) {
          setScheduleList(
            Array.isArray(result.data) ? result.data : result.data?.data || [],
          );
        } else {
          toast.error(result.message || "Failed to fetch schedules");
        }
      } catch {
        toast.error("Failed to fetch surgery schedules");
      } finally {
        setLoading(false);
      }
    },
    [HMSURL, fromDate, toDate],
  );

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // ── Patient lookup ────────────────────────────────────────────────────────
  // Maps API response fields (firstName, lastName, age, etc.) to form state
  const applyPatientData = (p, extra = {}) => {
    // Build address line from area / city / state / zipcode
    const addressParts = [p.area, p.city, p.state, p.zipcode].filter(Boolean);
    const addressLine = addressParts.join(", ");

    setFormData((prev) => ({
      ...prev,
      patient_name:
        `${p.salutation || ""} ${p.firstName || ""} ${p.lastName || ""}`.trim(),
      gender: p.gender || "",
      age: String(p.age || ""),
      age_type: String(p.age_type || ""),
      customer_type: p.customer_type || "",
      company_name: p.company_name || "",
      company_code: p.company_code || "",
      address: addressLine,
      ...extra,
    }));
  };

  const lookupByUHID = async () => {
    if (!formData.uhid_no.trim()) {
      toast.error("Enter UHID No");
      return;
    }
    try {
      const res = await apiRequest(
        `${HMSURL}op-patient/${encodeURIComponent(formData.uhid_no)}/`,
        "GET",
      );
      if (res.success && res.data) {
        applyPatientData(res.data);
      } else {
        toast.error(res.error || "Patient not found");
      }
    } catch {
      toast.error("UHID lookup failed");
    }
  };

  const lookupByIP = async () => {
    if (!formData.ip_number.trim()) {
      toast.error("Enter IP No");
      return;
    }
    try {
      const res = await apiRequest(
        `${HMSURL}ip-patient/${encodeURIComponent(formData.ip_number)}/`,
        "GET",
      );
      if (res.success && res.data) {
        // IP lookup also fills UHID back into the form
        applyPatientData(res.data, { uhid_no: res.data.uhid || "" });
      } else {
        toast.error(res.error || "Patient not found");
      }
    } catch {
      toast.error("IP lookup failed");
    }
  };

  // ── Form helpers ──────────────────────────────────────────────────────────
  const openNew = () => {
    setEditItem(null);
    setFormData(emptyForm);
    setAddAnes([]);
    setAddDoctors([]);
    setAnesInput("");
    setDocInput("");
    setErrorMsg("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditItem(item);

    // Parse additional staff JSON → [{ id, name }]
    let parsedAnes = [];
    let parsedDocs = [];
    try {
      const aa =
        typeof item.additional_anaesthetists === "string"
          ? JSON.parse(item.additional_anaesthetists)
          : item.additional_anaesthetists || {};
      parsedAnes = Object.values(aa).map((id) => {
        const found = doctorOptions.find((d) => d.id === id);
        return { id, name: found ? found.name : id };
      });
    } catch {}
    try {
      const ad =
        typeof item.additional_doctors === "string"
          ? JSON.parse(item.additional_doctors)
          : item.additional_doctors || {};
      parsedDocs = Object.values(ad).map((id) => {
        const found = doctorOptions.find((d) => d.id === id);
        return { id, name: found ? found.name : id };
      });
    } catch {}

    setAddAnes(parsedAnes);
    setAddDoctors(parsedDocs);
    setAnesInput("");
    setDocInput("");

    setFormData({
      uhid_no: item.uhid_no || "",
      ip_number: item.ip_number || "",
      patient_name: item.patient_name || "",
      address: item.address || "",
      age: "",
      age_type: "",
      gender: item.gender || "",
      ot_id: item.ot_id || "",
      surgery_name: item.surgery_name || "",
      surgeon_id: item.surgeon_id || "",
      scheduled_date: item.scheduled_date || today(),
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      surgery_type: item.surgery_type || "Minor",
      is_emergency: !!item.is_emergency,
      anaesthetist_id: item.anaesthetist_id || "",
      anesthesia_id: item.anesthesia_id || "",
      diagnosis: item.diagnosis || "",
      remarks: item.remarks || "",
      billTypeNo: item.billTypeNo || "",
      is_pack_request_CSSD: !!item.is_pack_request_CSSD,
      is_pack_return_CSSD: !!item.is_pack_return_CSSD,
    });
    setErrorMsg("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditItem(null);
    setErrorMsg("");
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setAddAnes([]);
    setAddDoctors([]);
    setAnesInput("");
    setDocInput("");
    setErrorMsg("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrorMsg("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ── Additional staff ──────────────────────────────────────────────────────
  const addAnesEntry = () => {
    if (!anesInput) return;
    if (addAnes.find((a) => a.id === anesInput)) {
      toast.error("Already added");
      return;
    }
    const found = doctorOptions.find((d) => d.id === anesInput);
    setAddAnes((prev) => [
      ...prev,
      { id: anesInput, name: found ? found.name : anesInput },
    ]);
    setAnesInput("");
  };

  const removeAnes = (id) =>
    setAddAnes((prev) => prev.filter((a) => a.id !== id));

  const addDoctorEntry = () => {
    if (!docInput) return;
    if (addDoctors.find((d) => d.id === docInput)) {
      toast.error("Already added");
      return;
    }
    const found = doctorOptions.find((d) => d.id === docInput);
    setAddDoctors((prev) => [
      ...prev,
      { id: docInput, name: found ? found.name : docInput },
    ]);
    setDocInput("");
  };

  const removeDoctor = (id) =>
    setAddDoctors((prev) => prev.filter((d) => d.id !== id));

  // Serialize staff array → { "1": id, "2": id, ... }
  const serializeStaff = (arr) => {
    const obj = {};
    arr.forEach((item, i) => {
      obj[String(i + 1)] = item.id;
    });
    return JSON.stringify(obj);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const missing = [];
    if (!formData.ip_number.trim()) missing.push("IP No");
    if (!formData.ot_id.trim()) missing.push("Operation Theater");
    if (!formData.surgery_name.trim()) missing.push("Surgery Name");
    if (!formData.surgeon_id.trim()) missing.push("Scheduled Surgeon");
    if (!formData.scheduled_date) missing.push("Scheduled Date");
    if (missing.length) {
      toast.error(`Required: ${missing.join(", ")}`);
      return;
    }

    const payload = {
      ...formData,
      additional_anaesthetists: serializeStaff(addAnes),
      additional_doctors: serializeStaff(addDoctors),
    };

    try {
      let result;
      if (editItem) {
        // reference_no passed in body (not URL) to avoid slash routing issues
        result = await apiRequest(`${HMSURL}update_surgery_schedule/`, "PUT", {
          ...payload,
          reference_no: editItem.reference_no,
        });
      } else {
        result = await apiRequest(
          `${HMSURL}create_surgery_schedule/`,
          "POST",
          payload,
        );
      }

      if (result.success) {
        toast.success(editItem ? "Schedule updated!" : "Schedule created!");
        cancelForm();
        fetchSchedules();
      } else {
        setErrorMsg(result.message || result.error || "Unknown error");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  // ── Cancel schedule ───────────────────────────────────────────────────────
  const handleCancel = async (item) => {
    if (
      !window.confirm(`Cancel "${item.reference_no}" — ${item.surgery_name}?`)
    )
      return;
    try {
      // reference_no passed in body (not URL) to avoid slash routing issues
      const result = await apiRequest(
        `${HMSURL}cancel_surgery_schedule/`,
        "DELETE",
        { reference_no: item.reference_no },
      );
      if (result.success) {
        toast.success("Schedule cancelled!");
        fetchSchedules();
      } else toast.error(result.message || "Cancel failed");
    } catch {
      toast.error("Cancel failed.");
    }
  };

  // ── Postpone modal state ─────────────────────────────────────────────────
  const [postponeTarget, setPostponeTarget] = useState(null);
  const [postponeDate, setPostponeDate] = useState("");
  const [postponeStartTime, setPostponeStartTime] = useState("");
  const [postponeEndTime, setPostponeEndTime] = useState("");

  const openPostpone = (s) => {
    setPostponeTarget(s);
    setPostponeDate(s.postponed_date || s.scheduled_date || "");
    setPostponeStartTime(s.post_startTime || s.startTime || "");
    setPostponeEndTime(s.post_endTime || s.endTime || "");
  };

  const submitPostpone = async () => {
    if (!postponeDate) {
      toast.error("Select a postponed date");
      return;
    }
    if (!postponeStartTime) {
      toast.error("Select a start time");
      return;
    }
    if (!postponeEndTime) {
      toast.error("Select an end time");
      return;
    }
    try {
      const result = await apiRequest(
        `${HMSURL}update_schedule_status/`,
        "PATCH",
        {
          reference_no: postponeTarget.reference_no,
          status: "Postponed",
          postponed_date: postponeDate,
          post_startTime: postponeStartTime,
          post_endTime: postponeEndTime,
        },
      );
      if (result.success) {
        toast.success("Schedule postponed!");
        setPostponeTarget(null);
        fetchSchedules();
      } else {
        toast.error(result.message || "Failed to postpone");
      }
    } catch {
      toast.error("Error postponing schedule");
    }
  };

  // ── CSSD pack request toggle ───────────────────────────────────────────────
  const toggleCssdRequest = async (s) => {
    const newVal = !s.is_pack_request_CSSD;
    try {
      const result = await apiRequest(
        `${HMSURL}update_surgery_schedule/`,
        "PUT",
        {
          reference_no: s.reference_no,
          is_pack_request_CSSD: newVal,
        },
      );
      if (result.success) {
        toast.success(
          newVal ? "Pack request sent to CSSD!" : "Pack request removed",
        );
        fetchSchedules();
      } else toast.error(result.message || "Failed");
    } catch {
      toast.error("Error updating CSSD request");
    }
  };

  // ── CSSD pack return toggle ────────────────────────────────────────────────
  const toggleCssdReturn = async (s) => {
    const newVal = !s.is_pack_return_CSSD;
    try {
      const result = await apiRequest(
        `${HMSURL}update_surgery_schedule/`,
        "PUT",
        {
          reference_no: s.reference_no,
          is_pack_return_CSSD: newVal,
        },
      );
      if (result.success) {
        toast.success(
          newVal ? "Pack return confirmed!" : "Pack return removed",
        );
        fetchSchedules();
      } else toast.error(result.message || "Failed");
    } catch {
      toast.error("Error updating CSSD return");
    }
  };

  // ── Confirm schedule → status = "Confirmed", is_active = true ──────────────
  const confirmSchedule = async (s) => {
    if (!window.confirm(`Confirm schedule "${s.reference_no}"?`)) return;
    try {
      const result = await apiRequest(
        `${HMSURL}update_schedule_status/`,
        "PATCH",
        {
          reference_no: s.reference_no,
          status: "Confirmed",
          is_active: true,
        },
      );
      if (result.success) {
        toast.success("Schedule confirmed!");
        fetchSchedules();
      } else toast.error(result.message || "Failed to confirm");
    } catch {
      toast.error("Error confirming schedule");
    }
  };

  // ── Table filter ──────────────────────────────────────────────────────────
  const filtered = scheduleList.filter((s) => {
    // Status / emergency chip filters
    if (activeFilters.size > 0) {
      const matchScheduled =
        activeFilters.has("Scheduled") && s.status === "Scheduled";
      const matchConfirmed =
        activeFilters.has("Confirmed") && s.status === "Confirmed";
      const matchCancelled =
        activeFilters.has("Cancelled") && s.status === "Cancelled";
      const matchPostponed =
        activeFilters.has("Postponed") && s.status === "Postponed";
      const matchEmergency = activeFilters.has("Emergency") && !!s.is_emergency;
      if (
        !matchScheduled &&
        !matchConfirmed &&
        !matchCancelled &&
        !matchPostponed &&
        !matchEmergency
      )
        return false;
    }
    // Text search
    if (tableSearch) {
      return [
        s.reference_no,
        s.status,
        s.patient_name,
        s.ip_number,
        s.surgery_name,
        s.anesthesia_name,
        s.ot_name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(tableSearch.toLowerCase());
    }
    return true;
  });

  // ── Print filtered table ─────────────────────────────────────────────────
  const handlePrint = () => {
    const headers = [
      "Reference No",
      "Status",
      "Patient Name",
      "IP No | SI No",
      "Date & Time",
      "Surgery Name",
      "Anesthesia",
      "Theater",
    ];

    const rows = filtered.map((s) => {
      // Build date/time cell text
      let dateTime = s.scheduled_date || "";
      if (s.startTime || s.endTime) {
        dateTime += `  ${s.startTime ? s.startTime.slice(0, 5) : "--:--"} – ${s.endTime ? s.endTime.slice(0, 5) : "--:--"}`;
      }
      if (s.postponed_date) {
        dateTime += `\nPostponed: ${s.postponed_date}`;
        if (s.post_startTime || s.post_endTime) {
          dateTime += `  ${s.post_startTime ? s.post_startTime.slice(0, 5) : "--:--"} – ${s.post_endTime ? s.post_endTime.slice(0, 5) : "--:--"}`;
        }
      }

      return [
        s.reference_no || "",
        s.status || "",
        s.patient_name || "—",
        s.ip_number || "",
        dateTime,
        s.surgery_name || "",
        s.anesthesia_name || s.anesthesia_id || "—",
        s.ot_name || s.ot_id || "",
      ];
    });

    const tableRows = rows
      .map(
        (cells) =>
          `<tr>${cells
            .map(
              (c) =>
                `<td style="padding:6px 10px;border:1px solid #cbd5e1;font-size:12px;vertical-align:top;white-space:pre-line">${c}</td>`,
            )
            .join("")}</tr>`,
      )
      .join("");

    const tableHeaders = headers
      .map(
        (h) =>
          `<th style="padding:7px 10px;border:1px solid #94a3b8;background:#1e293b;color:#fff;font-size:12px;text-align:left">${h}</th>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Surgery Schedule</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h2   { font-size: 16px; margin-bottom: 4px; color: #1e293b; }
    p    { font-size: 11px; color: #64748b; margin: 0 0 12px; }
    table { border-collapse: collapse; width: 100%; }
    @media print {
      body { margin: 10px; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
  <h2>Surgery Schedule</h2>
  <p>Date range: ${fromDate} to ${toDate} &nbsp;|&nbsp; Printed: ${new Date().toLocaleString()}</p>
  <table>
    <thead><tr>${tableHeaders}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

    const win = window.open("", "_blank", "width=1000,height=700");
    win.document.write(html);
    win.document.close();
  };

  const getAdmissionStatus = (s) => {
    if (s.is_admitted) return "Admitted";
    if (s.is_discharged) return "Discharged";
    return "Cancelled";
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Container>
      <PageWrapper>
        {/* ── Top Filter Bar ──────────────────────────────────────────────── */}
        <TopBar>
          <DateRow>
            <FieldGroup>
              <SmallLabel>From Date</SmallLabel>
              <DateInput
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </FieldGroup>
            <FieldGroup>
              <SmallLabel>To Date</SmallLabel>
              <DateInput
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </FieldGroup>
            <TealBtn
              onClick={() => {
                setFromDate(today());
                setToDate(today());
              }}
            >
              <RotateCcw size={14} /> Reset
            </TealBtn>
            <TealBtn onClick={() => fetchSchedules(fromDate, toDate)}>
              <Search size={14} /> Search
            </TealBtn>
          </DateRow>

          {!showForm && (
            <OrangeBtn onClick={openNew}>
              <Plus size={14} /> New Surgery Schedule
            </OrangeBtn>
          )}
        </TopBar>

        {/* ── Form Panel ──────────────────────────────────────────────────── */}
        {showForm && (
          <FormPanel>
            <FormGrid>
              {/* UHID */}
              {/* <FormGroup span={2}>
                <Label>
                  UHID No <Required>*</Required>
                </Label>
                <SearchIconInput>
                  <input
                    name="uhid_no"
                    value={formData.uhid_no}
                    onChange={handleChange}
                  />
                  <button onClick={lookupByUHID}>
                    <Search size={14} />
                  </button>
                </SearchIconInput>
              </FormGroup> */}

              {/* IP No */}
              <FormGroup span={2}>
                <Label>IP No</Label>
                <SearchIconInput>
                  <input
                    name="ip_number"
                    value={formData.ip_number}
                    onChange={handleChange}
                  />
                  <button onClick={lookupByIP}>
                    <Search size={14} />
                  </button>
                </SearchIconInput>
              </FormGroup>

              {/* Patient Name */}
              <FormGroup span={3}>
                <Label>Patient Name</Label>
                <ReadonlyInput value={formData.patient_name} readOnly />
              </FormGroup>

              {/* Address */}
              <FormGroup span={2}>
                <Label>Address Line 1</Label>
                <ReadonlyInput value={formData.address} readOnly />
              </FormGroup>

              {/* Age */}
              <FormGroup span={1}>
                <Label>Age</Label>
                <AgeGroup>
                  <input placeholder="Year" value={formData.age} readOnly />
                  <input
                    placeholder="Age Type"
                    value={formData.age_type}
                    readOnly
                  />
                </AgeGroup>
              </FormGroup>

              {/* Gender */}
              <FormGroup span={1}>
                <Label>Gender</Label>
                <ReadonlyInput value={formData.gender} readOnly />
              </FormGroup>

              {/* Operation Theater */}
              <FormGroup span={2}>
                <Label>
                  Operation Theater <Required>*</Required>
                </Label>
                <Select
                  name="ot_id"
                  value={formData.ot_id}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  {otOptions.map((o) => (
                    <option key={o.ot_id} value={o.ot_id}>
                      {o.ot_name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              {/* Surgery Name — populated from investigation-items API */}
              <FormGroup span={2}>
                <Label>
                  Surgery Name <Required>*</Required>
                </Label>
                <Select
                  name="surgery_name"
                  value={formData.surgery_name}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  {surgicalItems.map((s) => (
                    <option key={s.itemName} value={s.itemName}>
                      {s.itemName}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              {/* Scheduled Surgeon — uses doctorOptions */}
              <FormGroup span={3}>
                <Label>
                  Scheduled Surgeon <Required>*</Required>
                </Label>
                <Select
                  name="surgeon_id"
                  value={formData.surgeon_id}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  {doctorOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              {/* Scheduled Date */}
              <FormGroup span={2}>
                <Label>
                  Scheduled Date <Required>*</Required>
                </Label>
                <DateInput
                  type="date"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleChange}
                  style={{ width: "100%" }}
                />
              </FormGroup>

              {/* Start Time */}
              <FormGroup span={2}>
                <Label>Start Time</Label>
                <SearchIconInput>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                  />
                  <button type="button">
                    <Search size={14} />
                  </button>
                </SearchIconInput>
              </FormGroup>

              {/* End Time */}
              <FormGroup span={1}>
                <Label>End Time</Label>
                <TimeInput
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </FormGroup>

              {/* Surgery Type */}
              <FormGroup span={2}>
                <Label>Surgery Type</Label>
                <RadioGroup>
                  <label>
                    <input
                      type="radio"
                      name="surgery_type"
                      value="Major"
                      checked={formData.surgery_type === "Major"}
                      onChange={handleChange}
                    />
                    Major
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="surgery_type"
                      value="Minor"
                      checked={formData.surgery_type === "Minor"}
                      onChange={handleChange}
                    />
                    Minor
                  </label>
                </RadioGroup>
              </FormGroup>

              {/* Emergency Case */}
              <FormGroup span={1}>
                <Label>&nbsp;</Label>
                <CheckLabel>
                  <input
                    type="checkbox"
                    name="is_emergency"
                    checked={formData.is_emergency}
                    onChange={handleChange}
                  />
                  Emergency Case
                </CheckLabel>
              </FormGroup>

              {/* Anaesthetist — uses doctorOptions */}
              <FormGroup span={2}>
                <Label>Anaesthetist</Label>
                <Select
                  name="anaesthetist_id"
                  value={formData.anaesthetist_id}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  {doctorOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              {/* Anesthesia Name */}
              <FormGroup span={3}>
                <Label>Anesthesia Name</Label>
                <Select
                  name="anesthesia_id"
                  value={formData.anesthesia_id}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  {anesNameOptions.map((a) => (
                    <option key={a.anesthesia_id} value={a.anesthesia_id}>
                      {a.anesthesia_name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              {/* Diagnosis */}
              <FormGroup span={2}>
                <Label>Diagnosis</Label>
                <Select
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  {diagnosisOptions.map((d) => (
                    <option
                      key={d.diagnostics_id ?? d.id ?? d.diagnostics_name}
                      value={d.diagnostics_name}
                    >
                      {d.diagnostics_name}
                    </option>
                  ))}
                  {/* Fallback: show saved value if not in current list */}
                  {formData.diagnosis &&
                    !diagnosisOptions.find(
                      (d) => d.diagnostics_name === formData.diagnosis,
                    ) && (
                      <option value={formData.diagnosis}>
                        {formData.diagnosis}
                      </option>
                    )}
                </Select>
              </FormGroup>

              {/* Patient Type Info — shown in the empty grid space next to Diagnosis */}
              <FormGroup span={3} style={{ justifyContent: "flex-end" }}>
                {formData.customer_type ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: 7,
                      padding: "5px 12px",
                      alignSelf: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "#64748b",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Customer Type
                    </span>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "#1d4ed8",
                      }}
                    >
                      {formData.customer_type}
                      {formData.company_name && (
                        <span
                          style={{
                            fontWeight: 500,
                            color: "#3b82f6",
                            marginLeft: 6,
                          }}
                        >
                          · {formData.company_name}
                        </span>
                      )}
                    </span>
                  </div>
                ) : (
                  <div /> /* empty placeholder keeps grid alignment */
                )}
              </FormGroup>

              {/* Remarks */}
              <FormGroup span={4}>
                <Label>Remarks</Label>
                <Input
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  style={{ width: "100%" }}
                />
              </FormGroup>

              {/* Action Buttons */}
              <FormGroup
                span={3}
                style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}
              >
                <DarkBtn onClick={cancelForm}>
                  <X size={13} /> Cancel
                </DarkBtn>
                <GreenBtn onClick={handleSubmit}>
                  <Save size={13} /> Save
                </GreenBtn>
                <TealBtn onClick={resetForm}>
                  <RotateCcw size={13} /> Reset
                </TealBtn>
              </FormGroup>
            </FormGrid>

            {/* Error banner */}
            {errorMsg && (
              <div
                style={{
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                  color: "#dc2626",
                  borderRadius: 8,
                  padding: "8px 14px",
                  marginTop: 10,
                  fontSize: "0.84rem",
                }}
              >
                ⚠️ {errorMsg}
              </div>
            )}

            {/* ── Additional Staff ──────────────────────────────────────── */}
            <StaffSection>
              {/* Anaesthetist card — uses doctorOptions */}
              <StaffCard>
                <StaffTitle>
                  Anesthetist <Required>*</Required>
                </StaffTitle>
                <StaffRow>
                  <Select
                    value={anesInput}
                    onChange={(e) => setAnesInput(e.target.value)}
                    style={{ flex: 1, fontSize: "0.82rem" }}
                  >
                    <option value="">-- Select --</option>
                    {doctorOptions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Select>
                  <GreenBtn
                    onClick={addAnesEntry}
                    style={{ padding: "6px 12px" }}
                  >
                    <Plus size={13} /> Add
                  </GreenBtn>
                </StaffRow>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {addAnes.map((a) => (
                    <TagChip key={a.id}>
                      {a.name}
                      <button onClick={() => removeAnes(a.id)}>×</button>
                    </TagChip>
                  ))}
                </div>
              </StaffCard>

              {/* Doctor card — uses doctorOptions */}
              <StaffCard>
                <StaffTitle>
                  Doctor <Required>*</Required>
                </StaffTitle>
                <StaffRow>
                  <Select
                    value={docInput}
                    onChange={(e) => setDocInput(e.target.value)}
                    style={{ flex: 1, fontSize: "0.82rem" }}
                  >
                    <option value="">-- Select --</option>
                    {doctorOptions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Select>
                  <GreenBtn
                    onClick={addDoctorEntry}
                    style={{ padding: "6px 12px" }}
                  >
                    <Plus size={13} /> Add
                  </GreenBtn>
                </StaffRow>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {addDoctors.map((d) => (
                    <TagChip key={d.id}>
                      {d.name}
                      <button onClick={() => removeDoctor(d.id)}>×</button>
                    </TagChip>
                  ))}
                </div>
              </StaffCard>
            </StaffSection>
          </FormPanel>
        )}

        {/* ── Table Section ────────────────────────────────────────────────── */}
        <TableCard>
          <TableTopRow>
            {/* Status / Emergency filter chips */}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {[
                {
                  key: "Scheduled",
                  bg: "#dbeafe",
                  color: "#1d4ed8",
                  activeBg: "#1d4ed8",
                },
                {
                  key: "Confirmed",
                  bg: "#dcfce7",
                  color: "#15803d",
                  activeBg: "#15803d",
                },
                {
                  key: "Postponed",
                  bg: "#ede9fe",
                  color: "#7c3aed",
                  activeBg: "#7c3aed",
                },
                {
                  key: "Cancelled",
                  bg: "#fee2e2",
                  color: "#dc2626",
                  activeBg: "#dc2626",
                },
                {
                  key: "Emergency",
                  bg: "#fee2e2",
                  color: "#dc2626",
                  activeBg: "#dc2626",
                },
              ].map(({ key, bg, color, activeBg }) => {
                const active = activeFilters.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleFilter(key)}
                    style={{
                      padding: "3px 12px",
                      borderRadius: 20,
                      border: `1.5px solid ${active ? activeBg : color}`,
                      background: active ? activeBg : bg,
                      color: active ? "#fff" : color,
                      fontWeight: 600,
                      fontSize: "0.74rem",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {key}
                  </button>
                );
              })}
              {activeFilters.size > 0 && (
                <button
                  onClick={() => setActiveFilters(new Set())}
                  style={{
                    padding: "3px 10px",
                    borderRadius: 20,
                    border: "1.5px solid #94a3b8",
                    background: "#f1f5f9",
                    color: "#64748b",
                    fontWeight: 600,
                    fontSize: "0.72rem",
                    cursor: "pointer",
                  }}
                >
                  ✕ Clear
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <GreenBtn style={{ padding: "5px 12px", fontSize: "0.78rem" }}>
                <FileDown size={13} /> Export Data
              </GreenBtn>
              <TealBtn
                onClick={handlePrint}
                style={{ padding: "5px 12px", fontSize: "0.78rem" }}
                title="Print filtered table"
              >
                <Printer size={13} /> Print
              </TealBtn>
              <span style={{ fontSize: "0.82rem", color: colors.textMuted }}>
                Search:
              </span>
              <TableSearchInput
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>
          </TableTopRow>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Reference No</Th>
                  <Th>Status</Th>
                  <Th>Patient Name</Th>
                  <Th>IP No | SI No</Th>
                  <Th>Date &amp; Time</Th>
                  <Th>Surgery Name</Th>
                  <Th>Anesthesia</Th>
                  <Th>Theater</Th>
                  <Th>Admission Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <Td
                      colSpan={9}
                      style={{ textAlign: "center", padding: 24 }}
                    >
                      Loading…
                    </Td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <Td colSpan={9}>
                      <NoResults>No data available in table</NoResults>
                    </Td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <Tr key={s.reference_no}>
                      <Td style={{ fontWeight: 600, color: colors.primary }}>
                        {s.reference_no}
                      </Td>
                      <Td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <StatusBadge s={s.status}>{s.status}</StatusBadge>
                          {s.is_emergency && (
                            <EmergencyTag title="Emergency Case">
                              <EmergencyDot />
                              EMRG
                            </EmergencyTag>
                          )}
                        </div>
                      </Td>
                      <Td>{s.patient_name || "—"}</Td>
                      <Td>{s.ip_number}</Td>
                      <Td style={{ minWidth: 160 }}>
                        {/* Scheduled row */}
                        <div style={{ marginBottom: s.postponed_date ? 5 : 0 }}>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              color: "#64748b",
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              display: "block",
                              marginBottom: 1,
                            }}
                          >
                            Scheduled
                          </span>
                          <span
                            style={{
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              fontWeight: 500,
                            }}
                          >
                            {s.scheduled_date || "—"}
                          </span>
                          {(s.startTime || s.endTime) && (
                            <span
                              style={{
                                fontSize: "0.76rem",
                                color: "#475569",
                                marginLeft: 4,
                              }}
                            >
                              {s.startTime ? s.startTime.slice(0, 5) : "--:--"}
                              {" – "}
                              {s.endTime ? s.endTime.slice(0, 5) : "--:--"}
                            </span>
                          )}
                        </div>

                        {/* Postponed row — only if postponed_date exists */}
                        {s.postponed_date && (
                          <div
                            style={{
                              borderTop: "1px dashed #e2e8f0",
                              paddingTop: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                color: "#7c3aed",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                display: "block",
                                marginBottom: 1,
                              }}
                            >
                              Postponed
                            </span>
                            <span
                              style={{
                                fontSize: "0.82rem",
                                color: "#7c3aed",
                                fontWeight: 500,
                              }}
                            >
                              {s.postponed_date}
                            </span>
                            {(s.post_startTime || s.post_endTime) && (
                              <span
                                style={{
                                  fontSize: "0.76rem",
                                  color: "#7c3aed",
                                  marginLeft: 4,
                                  opacity: 0.85,
                                }}
                              >
                                {s.post_startTime
                                  ? s.post_startTime.slice(0, 5)
                                  : "--:--"}
                                {" – "}
                                {s.post_endTime
                                  ? s.post_endTime.slice(0, 5)
                                  : "--:--"}
                              </span>
                            )}
                          </div>
                        )}
                      </Td>
                      <Td>{s.surgery_name}</Td>
                      <Td>{s.anesthesia_name || s.anesthesia_id || "—"}</Td>
                      <Td>{s.ot_name || s.ot_id}</Td>
                      <Td>
                        <AdmissionBadge a={getAdmissionStatus(s)}>
                          {getAdmissionStatus(s)}
                        </AdmissionBadge>
                      </Td>
                      <Td>
                        <div
                          className="action-popover-wrap"
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
                        >
                          <button
                            ref={(el) => {
                              anchorRefs.current[s.reference_no] = el;
                            }}
                            onClick={() => {
                              if (openPopover === s.reference_no) {
                                setOpenPopover(null);
                                setPopoverData(null);
                              } else {
                                setOpenPopover(s.reference_no);
                                setPopoverData(s); // ← freeze snapshot at open time
                              }
                            }}
                            style={{
                              background: "#f1f5f9",
                              border: "1px solid #e2e8f0",
                              borderRadius: 6,
                              padding: "4px 10px",
                              cursor: "pointer",
                              fontSize: 18,
                              letterSpacing: 2,
                              color: "#64748b",
                              lineHeight: 1,
                              transition: "background 0.15s",
                            }}
                            title="Actions"
                          >
                            ···
                          </button>

                          {openPopover === s.reference_no && popoverData && (
                            <ActionPopover
                              s={popoverData}
                              anchorEl={anchorRefs.current[s.reference_no]}
                              onClose={() => {
                                setOpenPopover(null);
                                setPopoverData(null);
                              }}
                              canEdit={canEdit}
                              canDelete={canDelete}
                              canSchedule={canSchedule}
                              canApprove={canApprove}
                              canLab={canLab}
                              canMedicine={canMedicine}
                              canImplant={canImplant}
                              onEdit={() => {
                                openEdit(popoverData);
                                setOpenPopover(null);
                                setPopoverData(null);
                              }}
                              onCancel={() => {
                                handleCancel(popoverData);
                                setOpenPopover(null);
                                setPopoverData(null);
                              }}
                              onPostpone={() => {
                                openPostpone(popoverData);
                                setOpenPopover(null);
                                setPopoverData(null);
                              }}
                              onCssdReq={() => {
                                toggleCssdRequest(popoverData);
                                setOpenPopover(null);
                                setPopoverData(null);
                              }}
                              onCssdReturn={() => {
                                toggleCssdReturn(popoverData);
                                setOpenPopover(null);
                                setPopoverData(null);
                              }}
                              onConfirm={() => {
                                confirmSchedule(popoverData);
                                setOpenPopover(null);
                                setPopoverData(null);
                              }}
                              onLab={() => {
                                raiseLabRequest(popoverData);
                                setOpenPopover(null);
                                setPopoverData(null);
                              }}
                              onMedicine={() => {
                                raiseMedicineRequest(popoverData);
                                setOpenPopover(null);
                                setPopoverData(null);
                              }}
                              onImplant={() => {
                                raiseImplantRequest(popoverData);
                                setOpenPopover(null);
                                setPopoverData(null);
                              }}
                            />
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </TableCard>
      </PageWrapper>

      {/* ── Postpone Date Modal ───────────────────────────────────────────── */}
      {postponeTarget && (
        <ModalBackdrop onClick={() => setPostponeTarget(null)}>
          <PostponeBox onClick={(e) => e.stopPropagation()}>
            <PostponeTitle>
              <CalendarClock size={18} color="#7c3aed" />
              Set Postponed Date
            </PostponeTitle>
            <div style={{ marginBottom: 6 }}>
              {/* Info strip */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  padding: "6px 10px",
                  marginBottom: 12,
                  fontSize: "0.78rem",
                  color: "#475569",
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  {postponeTarget.reference_no}
                </span>
                {" · "}
                {postponeTarget.patient_name || postponeTarget.ip_number}
              </div>

              {/* Postponed Date */}
              <div style={{ marginBottom: 10 }}>
                <Label
                  style={{
                    fontSize: "0.82rem",
                    display: "block",
                    marginBottom: 3,
                  }}
                >
                  Postponed Date <span style={{ color: "#dc2626" }}>*</span>
                </Label>
                <DateInput
                  type="date"
                  value={postponeDate}
                  onChange={(e) => setPostponeDate(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              {/* Start Time + End Time side by side */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <Label
                    style={{
                      fontSize: "0.82rem",
                      display: "block",
                      marginBottom: 3,
                    }}
                  >
                    Start Time <span style={{ color: "#dc2626" }}>*</span>
                  </Label>
                  <TimeInput
                    type="time"
                    value={postponeStartTime}
                    onChange={(e) => setPostponeStartTime(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <Label
                    style={{
                      fontSize: "0.82rem",
                      display: "block",
                      marginBottom: 3,
                    }}
                  >
                    End Time <span style={{ color: "#dc2626" }}>*</span>
                  </Label>
                  <TimeInput
                    type="time"
                    value={postponeEndTime}
                    onChange={(e) => setPostponeEndTime(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
            <PostponeBtns>
              <DarkBtn
                onClick={() => setPostponeTarget(null)}
                style={{ padding: "6px 14px", fontSize: "0.82rem" }}
              >
                <X size={13} /> Cancel
              </DarkBtn>
              <GreenBtn
                onClick={submitPostpone}
                style={{ padding: "6px 14px", fontSize: "0.82rem" }}
              >
                <CheckCircle size={13} /> Confirm Postpone
              </GreenBtn>
            </PostponeBtns>
          </PostponeBox>
        </ModalBackdrop>
      )}
      <div id="popover-root" />
    </Container>
  );
};

export default SurgerySchedule;
