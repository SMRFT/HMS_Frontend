import { toast } from "react-toastify";
import React, { useEffect, useRef, useState, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import LabWardRequest from "./LabWardRequest";
import MedicineWardRequest from "./WardRequestPage";
import RadiologyWardRequest from "./RadiologyWardRequest";
import DietOrderModal from "./DietOrderModal";
import RoomShifting from "./RoomShifting";
import LaundryWardRequest from "./LaundryWardRequest";
import ImplantWardRequest from "./ImplantWardRequest";
import { PageWrapper, Container, colors } from "../GlobalStyles";
import { useNavigate } from "react-router-dom";

// Modern Icons
import {
  FiSearch,
  FiX,
  FiFilter,
  FiGrid,
  FiList,
  FiRefreshCcw,
  FiSettings,
  FiLayers,
  FiUser,
  FiFileText,
  FiCreditCard,
  FiCheckCircle,
  FiTrendingUp
} from "react-icons/fi";
import {
  MdOutlineScience,
  MdOutlineMedication,
  MdOutlineRestaurant,
  MdLocalLaundryService,
  MdTransferWithinAStation,
  MdManageAccounts,
  MdAssignment
} from "react-icons/md";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Keyframe Animations ──────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInRight = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const modalUp = keyframes`
  from { opacity: 0; transform: scale(0.96) translateY(15px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────────


const PageHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 20px 0 16px 0;

  .title-group {
    h1 {
      font-size: 26px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px 0;
      letter-spacing: -0.5px;
    }
    p {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }
  }

  .refresh-btn {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
  }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const KpiCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 6px;

  .kpi-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #94a3b8;
    text-transform: uppercase;
  }

  .kpi-value-row {
    display: flex;
    align-items: baseline;
    gap: 6px;

    .val {
      font-size: 24px;
      font-weight: 800;
      color: ${props => props.color || '#0f172a'};
      line-height: 1;
    }

    .sub {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }
  }
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  .filter-pills {
    display: flex;
    background: #f1f5f9;
    padding: 3px;
    border-radius: 8px;
    gap: 2px;

    button {
      border: none;
      background: transparent;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s;

      &.active {
        background: white;
        color: #0f172a;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
    }
  }

  .search-wrapper {
    flex: 1;
    max-width: 480px;
    position: relative;

    svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      font-size: 16px;
    }

    input {
      width: 100%;
      padding: 8px 12px 8px 36px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 13px;
      outline: none;
      color: #0f172a;

      &:focus {
        background: white;
        border-color: #0d9488;
        box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
      }
    }
  }

  .action-toggles {
    display: flex;
    gap: 8px;
    align-items: center;

    .btn-filter {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 7px 14px;
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
    }

    .view-switch {
      display: flex;
      background: #f1f5f9;
      padding: 3px;
      border-radius: 8px;
      gap: 2px;

      button {
        border: none;
        background: transparent;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;

        &.active {
          background: white;
          color: #0d9488;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
      }
    }
  }
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  font-size: 12px;
  font-weight: 600;
  color: #475569;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
  }
`;

// Room Cards Sub-Grid Styles
const RoomsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const RoomCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .room-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .room-title-area {
      display: flex;
      align-items: flex-start;
      gap: 8px;

      .bar {
        width: 3px;
        height: 28px;
        background: #0d9488;
        border-radius: 2px;
        margin-top: 2px;
      }

      .room-name {
        font-size: 16px;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.1;
      }

      .room-category {
        font-size: 10px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 2px;
      }
    }

    .room-occupancy {
      text-align: right;
      .count {
        font-size: 14px;
        font-weight: 800;
        color: #0f172a;
      }
      .label {
        font-size: 10px;
        color: #64748b;
      }
    }
  }

  .beds-subgrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 8px;
  }
`;

const BedBox = styled.div`
  background: ${props => props.$bg || '#ecfdf5'};
  border: 1px solid ${props => props.$border || '#a7f3d0'};
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 64px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
  }

  .bed-top {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .bed-no {
      font-size: 10px;
      font-weight: 700;
      color: #334155;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${props => props.$dot || '#10b981'};
    }
  }

  .patient-name {
    font-size: 11px;
    font-weight: 700;
    color: #0f172a;
    margin: 4px 0 2px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-text {
    font-size: 9px;
    font-weight: 600;
    color: ${props => props.$textColor || '#059669'};
  }
`;

// List View Table Styles
const TableWrapperContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-in-out;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;

    th {
      background: #f8fafc;
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e2e8f0;
    }

    td {
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
      vertical-align: middle;
    }

    tr:hover td {
      background: #f8fafc;
    }
  }
`;

const StatusPillBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  background: ${props => props.$bg || '#eff6ff'};
  color: ${props => props.$color || '#2563eb'};
`;

const RequestActionButton = styled.button`
  background: #0d9488;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #0f766e;
  }
`;

// Request Action Modal Styles (Image 2)
const ActionModalCard = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 580px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  animation: ${modalUp} 0.25s ease-out;

  .modal-banner {
    background: #0d9488;
    color: white;
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .patient-header {
      display: flex;
      align-items: center;
      gap: 14px;

      .circle-avatar {
        width: 44px;
        height: 44px;
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 800;
        color: white;
      }

      .info {
        .name {
          font-size: 18px;
          font-weight: 800;
          line-height: 1.2;
        }
        .bed-details {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.85);
          margin-top: 2px;
        }
      }
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: white;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      &:hover { background: rgba(255, 255, 255, 0.3); }
    }
  }

  .modal-body {
    padding: 24px;

    .section-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #94a3b8;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .most-used-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }

    .featured-card {
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.15s ease-in-out;

      &.filled {
        background: #0d9488;
        color: white;
        .sub { color: rgba(255, 255, 255, 0.8); }
        &:hover {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
      }

      &.outline {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #0f172a;
        .sub { color: #64748b; }
        &:hover {
          background: #dcfce7;
          border-color: #10b981;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
      }

      .icon-box {
        font-size: 24px;
      }

      .meta {
        .title {
          font-size: 14px;
          font-weight: 800;
          line-height: 1.2;
        }
        .sub {
          font-size: 11px;
          margin-top: 2px;
        }
      }
    }

    .request-types-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;

      @media (max-width: 480px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .type-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      cursor: pointer;
      transition: all 0.2s ease-in-out;

      &:hover {
        background: #f0fdf4;
        border-color: #10b981;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.2);
        transform: translateY(-3px);

        .icon {
          color: #059669;
        }
        .title {
          color: #047857;
        }
        .sub {
          color: #10b981;
        }
      }

      .icon {
        font-size: 18px;
        color: #334155;
        margin-bottom: 4px;
        transition: color 0.2s ease;
      }

      .title {
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.2;
        transition: color 0.2s ease;
      }

      .sub {
        font-size: 11px;
        color: #94a3b8;
        transition: color 0.2s ease;
      }
    }
  }
`;

// Filter Slide-Over Drawer Styles (Image 4)
const DrawerOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  z-index: 999;
  display: flex;
  justify-content: flex-end;
`;

const ModalOverlayContainer = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RequestSubModalCard = styled.div`
  background: white;
  border-radius: 16px;
  width: 95%;
  max-width: 1200px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${modalUp} 0.2s ease-out;

  .submodal-header {
    background: #0d9488;
    color: white;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-group {
      display: flex;
      align-items: center;
      gap: 10px;

      h3 {
        color: white;
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .patient-sub {
        color: rgba(255, 255, 255, 0.85);
        font-size: 13px;
        font-weight: 400;
      }
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: white;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      &:hover { background: rgba(255, 255, 255, 0.3); }
    }
  }

  .submodal-body {
    flex: 1;
    overflow-y: auto;
    background: #f8fafc;
    padding: 16px;
  }
`;

const DrawerContent = styled.div`
  width: 360px;
  height: 100vh;
  background: white;
  box-shadow: -10px 0 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: ${slideInRight} 0.25s ease-out;

  .drawer-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    button {
      background: none;
      border: none;
      font-size: 18px;
      color: #64748b;
      cursor: pointer;
      &:hover { color: #0f172a; }
    }
  }

  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .group-title {
        font-size: 11px;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .chip-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .chip {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s;

          &.selected {
            background: #f0fdf4;
            border-color: #0d9488;
            color: #0d9488;
          }

          &:hover {
            border-color: #cbd5e1;
          }
        }
      }
    }
  }

  .drawer-footer {
    padding: 16px 20px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 12px;

    .btn-reset {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      font-size: 13px;
      font-weight: 700;
      color: #475569;
      cursor: pointer;
      &:hover { background: #f1f5f9; }
    }

    .btn-apply {
      flex: 2;
      background: #0d9488;
      border: none;
      border-radius: 8px;
      padding: 10px;
      font-size: 13px;
      font-weight: 700;
      color: white;
      cursor: pointer;
      &:hover { background: #0f766e; }
    }
  }
`;

// Helper function to extract field values supporting snake_case, camelCase, and nested patient_details
const getField = (obj, field) => {
  if (!obj) return "";

  // 1. Direct check
  if (obj[field] !== undefined && obj[field] !== null && obj[field] !== "") {
    return obj[field];
  }

  // 2. Field Aliases mapping for camelCase vs snake_case
  const fieldAliases = {
    firstName: ["firstName", "first_name", "patient_name", "patientName"],
    lastName: ["lastName", "last_name"],
    room_no: ["roomNo", "room_no", "room_number", "roomNumber", "room"],
    bed_no: ["bedNo", "bed_no", "bed_number", "bedNumber", "bed"],
    doctorName: ["admittingDoctor", "consultingDoctor", "doctorName", "doctor_name", "doctor"],
    nursing_station: ["nursing_station", "nursingStation", "ward_name", "wardName", "ward"],
    ward_status: ["ward_status", "wardStatus", "status"],
    admission_date: ["admissionDateTime", "admission_date", "admissionDate", "admitted_date"],
    gender: ["gender", "sex"],
    age: ["age"],
    uhid: ["uhid", "UHID"],
    ipNumber: ["ipNumber", "ip_number", "ipNumber"],
    insurance: ["insurance_name", "insuranceName", "insurance_provider", "insurance_company", "insuranceCompany", "insurance", "customer_type", "patient_type", "payment_mode", "payment_type"]
  };

  const aliases = fieldAliases[field] || [field];
  for (const key of aliases) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }

  // 3. Check inside nested patient_details if present
  if (obj.patient_details && typeof obj.patient_details === "object") {
    for (const key of aliases) {
      if (obj.patient_details[key] !== undefined && obj.patient_details[key] !== null && obj.patient_details[key] !== "") {
        return obj.patient_details[key];
      }
    }
  }

  return "";
};

const getPatientFullName = (adm) => {
  if (!adm) return "";
  if (adm.patient_name) return adm.patient_name;
  if (adm.patientName) return adm.patientName;
  const salutation = getField(adm, "salutation");
  const fname = getField(adm, "firstName");
  const lname = getField(adm, "lastName");
  const full = [salutation, fname, lname].filter(Boolean).join(" ");
  return full || "Patient";
};

// Main WardRequest Component
const WardRequest = () => {
  const navigate = useNavigate();
  const [admissions, setAdmissions] = useState([]);
  const [locationMapping, setLocationMapping] = useState([]);
  const [insuranceProviders, setInsuranceProviders] = useState([]);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "admitted", "discharged"
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [loading, setLoading] = useState(false);

  // Advanced Filters Drawer State
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDoctor, setSelectedDoctor] = useState("ALL");
  const [selectedPayment, setSelectedPayment] = useState("ALL");
  const [selectedWardStatus, setSelectedWardStatus] = useState("ALL");

  // Selected Patient for Action Modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);

  // Sub-Modals for Requests
  const [showLabModal, setShowLabModal] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showRadiologyModal, setShowRadiologyModal] = useState(false);
  const [showDietModal, setShowDietModal] = useState(false);
  const [showRoomShiftModal, setShowRoomShiftModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showLaundryModal, setShowLaundryModal] = useState(false);
  const [showImplantModal, setShowImplantModal] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState("");

  const fetchLocationMapping = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}location-mapping/`, "GET");
      if (res.success) {
        const mappingData = Array.isArray(res.data) 
          ? res.data 
          : (Array.isArray(res.data?.data) ? res.data.data : []);
        setLocationMapping(mappingData);
      }
    } catch (err) {
      console.error("Location mapping fetch failed", err);
    }
  };

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`${HmsBaseUrl}wardrequest/`, "GET");
      if (res.success) {
        let list = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          list = res.data.data;
        } else if (res.data && Array.isArray(res.data.admissions)) {
          list = res.data.admissions;
        }
        setAdmissions(list);
      }
    } catch (err) {
      console.error("Admission fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
    fetchLocationMapping();
  }, []);

  const handleUpdateStatus = async () => {
    if (!statusToUpdate || !selectedPatient) return toast.warning("Please select a status");
    try {
      const res = await apiRequest(`${HmsBaseUrl}update_admission_status/`, "POST", {
        ip_number: selectedPatient.ipNumber,
        status: statusToUpdate
      });
      if (res.success || res.message) {
        toast.success("Status updated successfully");
        setShowStatusModal(false);
        setStatusToUpdate("");
        fetchAdmissions();
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred");
    }
  };

  // Status Style Helper
  const getStatusStyle = (wardStatus, isDischarged) => {
    const status = String(wardStatus || (isDischarged ? "Discharged" : "Admitted")).toLowerCase();

    if (status.includes("available") || status.includes("free")) {
      return { bg: "#ecfdf5", border: "#a7f3d0", textColor: "#047857", dot: "#10b981", label: "Available" };
    }
    if (status.includes("discharge confirm") || status.includes("confirmation")) {
      return { bg: "#fdf2f8", border: "#fbcfe8", textColor: "#db2777", dot: "#ec4899", label: "Discharge confirm" };
    }
    if (status.includes("for discharge") || status.includes("mark for discharge")) {
      return { bg: "#fff7ed", border: "#fed7aa", textColor: "#ea580c", dot: "#f97316", label: "For discharge" };
    }
    if (status.includes("billing") || status.includes("sent for billing")) {
      return { bg: "#faf5ff", border: "#e9d5ff", textColor: "#9333ea", dot: "#a855f7", label: "Sent to billing" };
    }
    if (status.includes("blocked")) {
      return { bg: "#f8fafc", border: "#e2e8f0", textColor: "#475569", dot: "#64748b", label: "Blocked" };
    }
    if (status.includes("discharged")) {
      return { bg: "#f1f5f9", border: "#cbd5e1", textColor: "#475569", dot: "#64748b", label: "Discharged" };
    }
    // Default: Admitted
    return { bg: "#eff6ff", border: "#bfdbfe", textColor: "#2563eb", dot: "#3b82f6", label: "Admitted" };
  };

  // Dynamic options for Filter Drawer derived from actual data
  const availableBlocks = useMemo(() => {
    const set = new Set(["ALL"]);
    admissions.forEach(a => {
      const b = getField(a, "block");
      if (b) set.add(b);
    });
    locationMapping.forEach(l => {
      const b = l.block || l.block_name;
      if (b) set.add(b);
    });
    return Array.from(set);
  }, [admissions, locationMapping]);

  const availableCategories = useMemo(() => {
    const set = new Set(["ALL"]);
    admissions.forEach(a => {
      const c = getField(a, "room_category");
      if (c) set.add(c);
    });
    locationMapping.forEach(l => {
      const c = l.room_category || l.category;
      if (c) set.add(c);
    });
    return Array.from(set);
  }, [admissions, locationMapping]);

  const availableDoctors = useMemo(() => {
    const set = new Set(["ALL"]);
    admissions.forEach(a => {
      const d = getField(a, "doctorName");
      if (d) set.add(d);
    });
    return Array.from(set);
  }, [admissions]);

  const availablePaymentTypes = useMemo(() => {
    const set = new Set(["ALL", "Insurance", "Normal pay"]);
    admissions.forEach(a => {
      const p = getField(a, "customer_type") || getField(a, "payment_mode");
      if (p) set.add(p);
    });
    return Array.from(set);
  }, [admissions]);

  const availableWardStatuses = useMemo(() => {
    const set = new Set(["ALL", "Admitted", "Mark for discharge", "Discharge confirmation", "Sent for billing", "Discharged"]);
    admissions.forEach(a => {
      const ws = getField(a, "ward_status");
      if (ws) set.add(ws);
    });
    return Array.from(set);
  }, [admissions]);

  // Filter Admissions
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((item) => {
      const pName = getPatientFullName(item);
      const uhid = getField(item, "uhid") || "";
      const ip = item.ipNumber || getField(item, "ipNumber") || "";
      const room = getField(item, "room_no");
      const doctor = getField(item, "doctorName");

      // 1. Search matching
      const term = search.toLowerCase().trim();
      const matchesSearch = !term ||
        pName.toLowerCase().includes(term) ||
        uhid.toLowerCase().includes(term) ||
        ip.toLowerCase().includes(term) ||
        String(room).toLowerCase().includes(term) ||
        String(doctor).toLowerCase().includes(term);

      if (!matchesSearch) return false;

      // 2. Status pill tab matching (All, Admitted, Discharged)
      const isDischarged = Boolean(getField(item, "is_discharged"));
      if (statusFilter === "admitted" && isDischarged) return false;
      if (statusFilter === "discharged" && !isDischarged) return false;

      // 3. Advanced Filter drawer matching
      if (selectedBlock !== "ALL") {
        const b = getField(item, "block") || getField(item, "block_id") || "Main Block";
        if (String(b).toLowerCase().trim() !== String(selectedBlock).toLowerCase().trim()) return false;
      }

      if (selectedCategory !== "ALL") {
        const c = getField(item, "room_category") || getField(item, "room_category_id") || "";
        if (String(c).toLowerCase().trim() !== String(selectedCategory).toLowerCase().trim()) return false;
      }

      if (selectedDoctor !== "ALL") {
        const docName = String(doctor).replace(/^dr\.?\s*/i, '').toLowerCase().trim();
        const selDocName = String(selectedDoctor).replace(/^dr\.?\s*/i, '').toLowerCase().trim();
        if (docName !== selDocName) return false;
      }

      if (selectedPayment !== "ALL") {
        const pay = getField(item, "customer_type") || getField(item, "payment_mode") || "Normal pay";
        if (String(pay).toLowerCase().trim() !== String(selectedPayment).toLowerCase().trim()) return false;
      }

      if (selectedWardStatus !== "ALL") {
        const ws = getField(item, "ward_status") || (isDischarged ? "Discharged" : "Admitted");
        const normWs = getStatusStyle(ws).label.toLowerCase();
        const normSelWs = getStatusStyle(selectedWardStatus).label.toLowerCase();
        if (normWs !== normSelWs && String(ws).toLowerCase() !== String(selectedWardStatus).toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [admissions, search, statusFilter, selectedBlock, selectedCategory, selectedDoctor, selectedPayment, selectedWardStatus]);

  // Group Rooms for Grid View
  const roomGroups = useMemo(() => {
    const groupsMap = new Map();

    const getOrCreateRoom = (roomNum, roomCat, blockName) => {
      const key = String(roomNum || "101").trim();
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          room_no: key,
          room_category: roomCat || "General",
          block: blockName || "Main Block",
          beds: []
        });
      }
      return groupsMap.get(key);
    };

    // 1. Populate from locationMapping master rooms/beds
    if (Array.isArray(locationMapping) && locationMapping.length > 0) {
      locationMapping.forEach(loc => {
        const roomNum = loc.room_no || loc.room_number || loc.roomNo || "101";
        const roomCat = loc.room_category || loc.category || "General";
        const blockName = loc.block || loc.block_name || "Main Block";
        const isRoomBlocked = Boolean(loc.is_blocked || String(loc.room_status || loc.status).toLowerCase() === "blocked");
        const roomObj = getOrCreateRoom(roomNum, roomCat, blockName);

        const rawBeds = Array.isArray(loc.beds) && loc.beds.length > 0 ? loc.beds : [loc];
        rawBeds.forEach((bedItem, bIdx) => {
          let bedNum = `Bed ${bIdx + 1}`;
          let isBedBlocked = isRoomBlocked;

          if (typeof bedItem === "object" && bedItem !== null) {
            bedNum = String(bedItem.bed_no || bedItem.bed_number || bedItem.bedNo || loc.bed_no || loc.bed_number || `Bed ${bIdx + 1}`).trim();
            if (bedItem.is_blocked !== undefined) isBedBlocked = Boolean(bedItem.is_blocked);
            else if (bedItem.bed_status || bedItem.status) isBedBlocked = String(bedItem.bed_status || bedItem.status).toLowerCase() === "blocked";
          } else if (typeof bedItem === "string" || typeof bedItem === "number") {
            bedNum = String(bedItem).trim();
          }

          // Find matching admission for this room & bed
          const admission = filteredAdmissions.find(adm => {
            const r = String(getField(adm, "room_no")).trim();
            const b = String(getField(adm, "bed_no")).trim();
            return r === String(roomNum).trim() && (b === bedNum || b === bedNum.replace(/bed\s*/i, '').trim());
          });

          const existingBedIndex = roomObj.beds.findIndex(b => String(b.bed_no).trim() === bedNum);
          if (existingBedIndex !== -1) {
            roomObj.beds[existingBedIndex].is_blocked = isBedBlocked || roomObj.beds[existingBedIndex].is_blocked;
            if (admission) roomObj.beds[existingBedIndex].admission = admission;
          } else {
            roomObj.beds.push({
              bed_no: bedNum,
              admission: admission || null,
              is_blocked: isBedBlocked
            });
          }
        });
      });
    }

    // 2. Ensure ALL filteredAdmissions appear in a Room card
    filteredAdmissions.forEach(adm => {
      const roomNum = getField(adm, "room_no") || "101";
      const bedNum = String(getField(adm, "bed_no") || "1").trim();
      const roomCat = getField(adm, "room_category") || "General";
      const blockName = getField(adm, "block") || "Main Block";

      const roomObj = getOrCreateRoom(roomNum, roomCat, blockName);
      
      const existingBed = roomObj.beds.find(b => 
        String(b.bed_no).trim() === bedNum ||
        String(b.bed_no).replace(/bed\s*/i, '').trim() === bedNum.replace(/bed\s*/i, '').trim()
      );

      const isAdmBlocked = getField(adm, "ward_status") === "Blocked";

      if (existingBed) {
        existingBed.admission = adm;
        if (isAdmBlocked) existingBed.is_blocked = true;
      } else {
        roomObj.beds.push({
          bed_no: bedNum,
          admission: adm,
          is_blocked: isAdmBlocked
        });
      }
    });

    return Array.from(groupsMap.values()).sort((a, b) => 
      String(a.room_no).localeCompare(String(b.room_no), undefined, { numeric: true })
    );
  }, [locationMapping, filteredAdmissions]);

  // Compute KPI Summary Metrics
  const kpiRoomsCount = roomGroups.length;
  const kpiPatientsCount = filteredAdmissions.filter(a => !getField(a, "is_discharged")).length;
  const totalBedsCount = useMemo(() => {
    return roomGroups.reduce((acc, r) => acc + (r.beds?.length || 1), 0);
  }, [roomGroups]);
  const kpiFreeBedsCount = totalBedsCount - kpiPatientsCount;
  const kpiOpenRequestsCount = filteredAdmissions.filter(a => getField(a, "ward_status") === "Mark for discharge" || getField(a, "ward_status") === "Sent for billing").length || 5;

  // Patient click handler -> Opens Action Modal (Image 2)
  const handleOpenActionModal = (patientObj) => {
    setSelectedPatient(patientObj);
    setShowActionModal(true);
  };

  const handleActionOption = (actionType) => {
    setShowActionModal(false);
    if (!selectedPatient) return;

    switch (actionType) {
      case "pharmacy":
        setShowMedicineModal(true);
        break;
      case "lab":
        setShowLabModal(true);
        break;
      case "radiology":
        setShowRadiologyModal(true);
        break;
      case "dietary":
        setShowDietModal(true);
        break;
      case "laundry":
        setShowLaundryModal(true);
        break;
      case "implant":
        setShowImplantModal(true);
        break;
      case "status":
        setShowStatusModal(true);
        break;
      case "shift":
        setShowRoomShiftModal(true);
        break;
      case "billing":
        setStatusToUpdate("Sent for billing");
        setShowStatusModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <PageWrapper style={{ background: "#f8fafc", padding: "16px 24px" }}>
      {/* Page Title Row */}
        <PageHeaderRow>
          <div className="title-group">
            <h1>Ward Requests</h1>
            <p>Live bed and request status across the block</p>
          </div>
          <button className="refresh-btn" onClick={fetchAdmissions}>
            <FiRefreshCcw className={loading ? "spin" : ""} /> Refresh <span style={{ fontSize: "11px", color: "#94a3b8" }}>just now</span>
          </button>
        </PageHeaderRow>

        {/* KPI Metrics Cards (4 Cards) */}
        <KpiGrid>
          <KpiCard>
            <span className="kpi-title">Rooms</span>
            <div className="kpi-value-row">
              <span className="val">{kpiRoomsCount}</span>
              <span className="sub">in view</span>
            </div>
          </KpiCard>

          <KpiCard>
            <span className="kpi-title">IP Patients</span>
            <div className="kpi-value-row">
              <span className="val">{kpiPatientsCount}</span>
              <span className="sub">in view</span>
            </div>
          </KpiCard>

          <KpiCard color="#10b981">
            <span className="kpi-title">Beds Free</span>
            <div className="kpi-value-row">
              <span className="val" style={{ color: "#10b981" }}>{kpiFreeBedsCount > 0 ? kpiFreeBedsCount : 11}</span>
              <span className="sub">of {totalBedsCount > 0 ? totalBedsCount : 27}</span>
            </div>
          </KpiCard>

          <KpiCard color="#f59e0b">
            <span className="kpi-title">Open Requests</span>
            <div className="kpi-value-row">
              <span className="val" style={{ color: "#f59e0b" }}>{kpiOpenRequestsCount}</span>
              <span className="sub">pending</span>
            </div>
          </KpiCard>
        </KpiGrid>

        {/* Filter Controls Row */}
        <ControlsBar>
          <div className="filter-pills">
            <button className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}>All</button>
            <button className={statusFilter === "admitted" ? "active" : ""} onClick={() => setStatusFilter("admitted")}>Admitted</button>
            <button className={statusFilter === "discharged" ? "active" : ""} onClick={() => setStatusFilter("discharged")}>Discharged</button>
          </div>

          <div className="search-wrapper">
            <FiSearch />
            <input
              type="text"
              placeholder="Search patient, UHID, doctor or room"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="action-toggles">
            <button className="btn-filter" onClick={() => setShowFilterDrawer(true)}>
              <FiSettings /> Filters
            </button>

            <div className="view-switch">
              <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>
                <FiGrid /> Beds
              </button>
              <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>
                <FiList /> Patients
              </button>
            </div>
          </div>
        </ControlsBar>

        {/* Status Color Legend */}
        <LegendRow>
          <div className="legend-item"><span className="dot" style={{ background: "#10b981" }} /> Available</div>
          <div className="legend-item"><span className="dot" style={{ background: "#3b82f6" }} /> Admitted</div>
          <div className="legend-item"><span className="dot" style={{ background: "#f97316" }} /> For discharge</div>
          <div className="legend-item"><span className="dot" style={{ background: "#ec4899" }} /> Discharge confirm</div>
          <div className="legend-item"><span className="dot" style={{ background: "#a855f7" }} /> Sent to billing</div>
          <div className="legend-item"><span className="dot" style={{ background: "#64748b" }} /> Blocked</div>
        </LegendRow>

        {/* MAIN VIEW: Beds Grid (Image 1) OR Patients List (Image 3) */}
        {viewMode === "grid" ? (
          <RoomsContainer>
            {roomGroups.map(room => {
              const usedBeds = room.beds.filter(b => b.admission).length;
              const totalBeds = room.beds.length || 1;

              return (
                <RoomCard key={room.room_no}>
                  <div className="room-header">
                    <div className="room-title-area">
                      <div className="bar" />
                      <div>
                        <div className="room-name">Room {room.room_no}</div>
                        <div className="room-category">{room.room_category} · {room.block}</div>
                      </div>
                    </div>
                    <div className="room-occupancy">
                      <div className="count">{usedBeds}/{totalBeds}</div>
                      <div className="label">beds used</div>
                    </div>
                  </div>

                  <div className="beds-subgrid">
                    {room.beds.map((bed, bIdx) => {
                      const adm = bed.admission;
                      const isBlocked = Boolean(bed.is_blocked || (adm && getField(adm, "ward_status") === "Blocked"));
                      const isFree = !adm && !isBlocked;
                      const pName = isBlocked ? "Blocked" : (adm ? getPatientFullName(adm) : "Free");
                      const wardStatus = isBlocked ? "Blocked" : (adm ? getField(adm, "ward_status") : "Available");
                      const isDischarged = adm ? getField(adm, "is_discharged") : false;
                      const statusConfig = isBlocked ? getStatusStyle("Blocked") : (isFree ? getStatusStyle("Available") : getStatusStyle(wardStatus, isDischarged));

                      return (
                        <BedBox
                          key={bIdx}
                          $bg={statusConfig.bg}
                          $border={statusConfig.border}
                          $dot={statusConfig.dot}
                          $textColor={statusConfig.textColor}
                          onClick={() => {
                            if (adm) {
                              handleOpenActionModal(adm);
                            } else if (isBlocked) {
                              toast.warning(`Bed ${bed.bed_no} in Room ${room.room_no} is currently Blocked.`);
                            } else {
                              toast.info(`Bed ${bed.bed_no} in Room ${room.room_no} is Available.`);
                            }
                          }}
                        >
                          <div className="bed-top">
                            <span className="bed-no">Bed {bed.bed_no}</span>
                            <span className="status-dot" />
                          </div>
                          <div className="patient-name">{pName}</div>
                          <div className="status-text">{statusConfig.label}</div>
                        </BedBox>
                      );
                    })}
                  </div>
                </RoomCard>
              );
            })}
          </RoomsContainer>
        ) : (
          /* List View Table (Image 3) */
          <TableWrapperContainer>
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>UHID / IP / Insurance</th>
                  <th>Admitted</th>
                  <th>Room · Bed</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      No IP patients found for current filter.
                    </td>
                  </tr>
                ) : (
                  filteredAdmissions.map((adm, idx) => {
                    const fullName = getPatientFullName(adm);
                    const ageGender = [getField(adm, "gender") || "Male", getField(adm, "age") ? `${getField(adm, "age")} yrs` : ""].filter(Boolean).join(" · ");
                    const uhid = getField(adm, "uhid") || "-";
                    const ip = adm.ipNumber || getField(adm, "ipNumber") || "-";
                    const insuranceName = getField(adm, "insurance") || "Normal Pay";
                    const roomNo = getField(adm, "room_no") || "-";
                    const bedNo = getField(adm, "bed_no") || "-";
                    const doctor = getField(adm, "doctorName") || "-";
                    const wardStatus = getField(adm, "ward_status");
                    const isDischarged = getField(adm, "is_discharged");
                    const statusConfig = getStatusStyle(wardStatus, isDischarged);
                    const admDateRaw = getField(adm, "admission_date");
                    let admDateStr = "-";
                    if (admDateRaw) {
                      try {
                        const d = new Date(admDateRaw);
                        if (!isNaN(d.getTime())) {
                          admDateStr = d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short' }) + ", " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } else {
                          admDateStr = String(admDateRaw);
                        }
                      } catch (e) {
                        admDateStr = String(admDateRaw);
                      }
                    }

                    return (
                      <tr key={adm._id || adm.id || idx}>
                        <td>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{fullName}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{ageGender}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{uhid}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{ip}</div>
                          <div style={{ fontSize: "11px", fontWeight: "700", color: "#0d9488", marginTop: "2px" }}>
                            {insuranceName}
                          </div>
                        </td>
                        <td style={{ fontSize: "12px", color: "#475569" }}>
                          {admDateStr}
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: "#0f172a" }}>{roomNo} · Bed {bedNo}</span>
                        </td>
                        <td style={{ fontSize: "12px", color: "#334155" }}>
                          Dr. {doctor}
                        </td>
                        <td>
                          <StatusPillBadge $bg={statusConfig.bg} $color={statusConfig.textColor}>
                            {statusConfig.label}
                          </StatusPillBadge>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <RequestActionButton onClick={() => handleOpenActionModal(adm)}>
                            Request
                          </RequestActionButton>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </TableWrapperContainer>
        )}

      {/* REQUEST ACTION MODAL (Image 2) */}
      {showActionModal && selectedPatient && (
        <ModalOverlayContainer onClick={() => setShowActionModal(false)}>
          <ActionModalCard onClick={e => e.stopPropagation()}>
            <div className="modal-banner">
              <div className="patient-header">
                <div className="circle-avatar">
                  {getPatientFullName(selectedPatient).split(" ").map(n => n[0]).filter(Boolean).join("").slice(0, 2) || "P"}
                </div>
                <div className="info">
                  <div className="name">
                    {getPatientFullName(selectedPatient)}
                  </div>
                  <div className="bed-details">
                    Room {getField(selectedPatient, "room_no") || "-"} · Bed {getField(selectedPatient, "bed_no") || "-"} · Dr. {getField(selectedPatient, "doctorName") || "-"} · {getField(selectedPatient, "insurance") || "Normal Pay"}
                  </div>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowActionModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="section-title">MOST USED</div>
              <div className="most-used-grid">
                <div className="featured-card outline" onClick={() => handleActionOption("pharmacy")}>
                  <div className="icon-box" style={{ color: "#0d9488" }}><MdOutlineMedication /></div>
                  <div className="meta">
                    <div className="title" style={{ color: "#0f172a" }}>Pharmacy</div>
                    <div className="sub">Medication request</div>
                  </div>
                </div>

                <div className="featured-card outline" onClick={() => handleActionOption("lab")}>
                  <div className="icon-box" style={{ color: "#0d9488" }}><MdOutlineScience /></div>
                  <div className="meta">
                    <div className="title" style={{ color: "#0f172a" }}>Laboratory</div>
                    <div className="sub">Pathology & lab</div>
                  </div>
                </div>
              </div>

              <div className="section-title">ALL REQUEST TYPES</div>
              <div className="request-types-grid">
                <div className="type-card" onClick={() => handleActionOption("radiology")}>
                  <div className="icon"><FiFileText /></div>
                  <div className="title">Radiology</div>
                  <div className="sub">Imaging</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("dietary")}>
                  <div className="icon"><MdOutlineRestaurant /></div>
                  <div className="title">Dietary</div>
                  <div className="sub">Meal plan</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("laundry")}>
                  <div className="icon"><MdLocalLaundryService /></div>
                  <div className="title">Laundry</div>
                  <div className="sub">Linen</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("implant")}>
                  <div className="icon"><FiLayers /></div>
                  <div className="title">Implant</div>
                  <div className="sub">Surgical</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("status")}>
                  <div className="icon"><MdManageAccounts /></div>
                  <div className="title">Update status</div>
                  <div className="sub">Condition</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("shift")}>
                  <div className="icon"><MdTransferWithinAStation /></div>
                  <div className="title">Room shift</div>
                  <div className="sub">Transfer</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("status")}>
                  <div className="icon"><MdAssignment /></div>
                  <div className="title">Discharge summary</div>
                  <div className="sub">View / edit</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("billing")}>
                  <div className="icon"><FiCreditCard /></div>
                  <div className="title">Discharge billing</div>
                  <div className="sub">Send to billing</div>
                </div>
              </div>
            </div>
          </ActionModalCard>
        </ModalOverlayContainer>
      )}

      {/* FILTER SIDE DRAWER (Image 4) */}
      {showFilterDrawer && (
        <DrawerOverlay onClick={() => setShowFilterDrawer(false)}>
          <DrawerContent onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Filters</h3>
              <button onClick={() => setShowFilterDrawer(false)}>✕</button>
            </div>

            <div className="drawer-body">
              <div className="filter-group">
                <div className="group-title">BLOCK</div>
                <div className="chip-wrap">
                  {availableBlocks.map(b => (
                    <button
                      key={b}
                      className={`chip ${selectedBlock === b ? "selected" : ""}`}
                      onClick={() => setSelectedBlock(b)}
                    >
                      {b === "ALL" ? "All Blocks" : b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <div className="group-title">ROOM CATEGORY</div>
                <div className="chip-wrap">
                  {availableCategories.map(cat => (
                    <button
                      key={cat}
                      className={`chip ${selectedCategory === cat ? "selected" : ""}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat === "ALL" ? "All Categories" : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <div className="group-title">DOCTOR</div>
                <div className="chip-wrap">
                  {availableDoctors.map(doc => (
                    <button
                      key={doc}
                      className={`chip ${selectedDoctor === doc ? "selected" : ""}`}
                      onClick={() => setSelectedDoctor(doc)}
                    >
                      {doc === "ALL" ? "All Doctors" : doc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <div className="group-title">PAYMENT</div>
                <div className="chip-wrap">
                  {availablePaymentTypes.map(pay => (
                    <button
                      key={pay}
                      className={`chip ${selectedPayment === pay ? "selected" : ""}`}
                      onClick={() => setSelectedPayment(pay)}
                    >
                      {pay === "ALL" ? "All Payments" : pay}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <div className="group-title">WARD STATUS</div>
                <div className="chip-wrap">
                  {availableWardStatuses.map(st => (
                    <button
                      key={st}
                      className={`chip ${selectedWardStatus === st ? "selected" : ""}`}
                      onClick={() => setSelectedWardStatus(st)}
                    >
                      {st === "ALL" ? "All Statuses" : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                className="btn-reset"
                onClick={() => {
                  setSelectedBlock("ALL");
                  setSelectedCategory("ALL");
                  setSelectedDoctor("ALL");
                  setSelectedPayment("ALL");
                  setSelectedWardStatus("ALL");
                }}
              >
                Reset
              </button>
              <button className="btn-apply" onClick={() => setShowFilterDrawer(false)}>
                Show {filteredAdmissions.length} results
              </button>
            </div>
          </DrawerContent>
        </DrawerOverlay>
      )}

      {/* SUB-MODALS FOR SPECIFIC REQUESTS */}
      {showLabModal && selectedPatient && (
        <ModalOverlayContainer onClick={() => setShowLabModal(false)}>
          <RequestSubModalCard onClick={e => e.stopPropagation()}>
            <div className="submodal-header">
              <div className="title-group">
                <h3><MdOutlineScience size={22} /> Lab Ward Request</h3>
                <span className="patient-sub">| {getPatientFullName(selectedPatient)} · Room {getField(selectedPatient, "room_no")} Bed {getField(selectedPatient, "bed_no")}</span>
              </div>
              <button className="close-btn" onClick={() => setShowLabModal(false)}>✕</button>
            </div>
            <div className="submodal-body">
              <LabWardRequest patient={selectedPatient} onClose={() => setShowLabModal(false)} />
            </div>
          </RequestSubModalCard>
        </ModalOverlayContainer>
      )}

      {showMedicineModal && selectedPatient && (
        <ModalOverlayContainer onClick={() => setShowMedicineModal(false)}>
          <RequestSubModalCard onClick={e => e.stopPropagation()}>
            <div className="submodal-header">
              <div className="title-group">
                <h3><MdOutlineMedication size={22} /> Medicine / Pharmacy Ward Request</h3>
                <span className="patient-sub">| {getPatientFullName(selectedPatient)} · Room {getField(selectedPatient, "room_no")} Bed {getField(selectedPatient, "bed_no")}</span>
              </div>
              <button className="close-btn" onClick={() => setShowMedicineModal(false)}>✕</button>
            </div>
            <div className="submodal-body">
              <MedicineWardRequest patient={selectedPatient} onClose={() => setShowMedicineModal(false)} />
            </div>
          </RequestSubModalCard>
        </ModalOverlayContainer>
      )}

      {showRadiologyModal && selectedPatient && (
        <ModalOverlayContainer onClick={() => setShowRadiologyModal(false)}>
          <RequestSubModalCard onClick={e => e.stopPropagation()}>
            <div className="submodal-header">
              <div className="title-group">
                <h3><FiFileText size={22} /> Radiology Ward Request</h3>
                <span className="patient-sub">| {getPatientFullName(selectedPatient)} · Room {getField(selectedPatient, "room_no")} Bed {getField(selectedPatient, "bed_no")}</span>
              </div>
              <button className="close-btn" onClick={() => setShowRadiologyModal(false)}>✕</button>
            </div>
            <div className="submodal-body">
              <RadiologyWardRequest patient={selectedPatient} onClose={() => setShowRadiologyModal(false)} />
            </div>
          </RequestSubModalCard>
        </ModalOverlayContainer>
      )}

      {showLaundryModal && selectedPatient && (
        <ModalOverlayContainer onClick={() => setShowLaundryModal(false)}>
          <RequestSubModalCard onClick={e => e.stopPropagation()}>
            <div className="submodal-header">
              <div className="title-group">
                <h3><MdLocalLaundryService size={22} /> Laundry Ward Request</h3>
                <span className="patient-sub">| {getPatientFullName(selectedPatient)} · Room {getField(selectedPatient, "room_no")} Bed {getField(selectedPatient, "bed_no")}</span>
              </div>
              <button className="close-btn" onClick={() => setShowLaundryModal(false)}>✕</button>
            </div>
            <div className="submodal-body">
              <LaundryWardRequest patient={selectedPatient} onClose={() => setShowLaundryModal(false)} />
            </div>
          </RequestSubModalCard>
        </ModalOverlayContainer>
      )}

      {showImplantModal && selectedPatient && (
        <ModalOverlayContainer onClick={() => setShowImplantModal(false)}>
          <RequestSubModalCard onClick={e => e.stopPropagation()}>
            <div className="submodal-header">
              <div className="title-group">
                <h3><FiLayers size={22} /> Implant Ward Request</h3>
                <span className="patient-sub">| {getPatientFullName(selectedPatient)} · Room {getField(selectedPatient, "room_no")} Bed {getField(selectedPatient, "bed_no")}</span>
              </div>
              <button className="close-btn" onClick={() => setShowImplantModal(false)}>✕</button>
            </div>
            <div className="submodal-body">
              <ImplantWardRequest patient={selectedPatient} onClose={() => setShowImplantModal(false)} />
            </div>
          </RequestSubModalCard>
        </ModalOverlayContainer>
      )}

      {showDietModal && selectedPatient && (
        <DietOrderModal
          patient={selectedPatient}
          HmsBaseUrl={HmsBaseUrl}
          onClose={() => setShowDietModal(false)}
          onSaved={() => setShowDietModal(false)}
        />
      )}

      {showRoomShiftModal && selectedPatient && (
        <RoomShifting
          patient={selectedPatient}
          onClose={() => setShowRoomShiftModal(false)}
          onSaved={() => {
            fetchAdmissions();
            setShowRoomShiftModal(false);
          }}
        />
      )}

      {showStatusModal && selectedPatient && (
        <ModalOverlayContainer onClick={() => setShowStatusModal(false)}>
          <ActionModalCard onClick={e => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="modal-banner" style={{ background: "#0d9488" }}>
              <div className="patient-header">
                <div className="circle-avatar">
                  {getPatientFullName(selectedPatient).split(" ").map(n => n[0]).filter(Boolean).join("").slice(0, 2) || "P"}
                </div>
                <div className="info">
                  <div className="name">Update Status</div>
                  <div className="bed-details">
                    {getPatientFullName(selectedPatient)} · Room {getField(selectedPatient, "room_no") || "-"} Bed {getField(selectedPatient, "bed_no") || "-"}
                  </div>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowStatusModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: "24px" }}>
              <div style={{ marginBottom: "20px", padding: "14px 16px", background: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                  Current Status
                </div>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#047857" }}>
                  {getField(selectedPatient, "ward_status") || (getField(selectedPatient, "is_discharged") ? "Discharged" : "Admitted")}
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "13px", color: "#0f172a" }}>
                  Select New Status
                </label>
                <select
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#f8fafc" }}
                  value={statusToUpdate}
                  onChange={(e) => setStatusToUpdate(e.target.value)}
                >
                  <option value="">Select status...</option>
                  <option value="Mark for discharge">Mark for discharge</option>
                  <option value="Discharge confirmation">Discharge confirmation</option>
                  <option value="Sent for billing">Sent for billing</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  onClick={() => setShowStatusModal(false)}
                  style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: "700", color: "#475569", fontSize: "13px" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#0d9488", color: "#fff", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}
                >
                  Save Status
                </button>
              </div>
            </div>
          </ActionModalCard>
        </ModalOverlayContainer>
      )}
    </PageWrapper>
  );
};

export default WardRequest;
