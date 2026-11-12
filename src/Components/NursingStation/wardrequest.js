import { toast } from "react-toastify";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import LabWardRequest from "./LabWardRequest";
import MedicineWardRequest from "./WardRequestPage";
import RadiologyWardRequest from "./RadiologyWardRequest";
import DietOrderModal from "./DietOrderModal";
import RoomShifting from "./RoomShifting";
import LaundryWardRequest from "./LaundryWardRequest";
import ImplantWardRequest from "./ImplantWardRequest";
import IPClinicalNotesModal from "../IPEMR/IPClinicalNotesModal";
import IPNursingNotesModal from "../IPEMR/IPNursingNotesModal";
import GeoVerificationModal from "./GeoVerificationModal";
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
  FiTrendingUp,
  FiChevronDown,
  FiCamera
} from "react-icons/fi";
import {
  MdOutlineScience,
  MdOutlineMedication,
  MdOutlineRestaurant,
  MdLocalLaundryService,
  MdTransferWithinAStation,
  MdManageAccounts,
  MdAssignment,
  MdOutlineLocalHospital,
  MdOutlineAssignmentInd
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

  .ns-select-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 3px 10px;

    label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      white-space: nowrap;
    }

    select {
      border: none;
      background: transparent;
      outline: none;
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      cursor: pointer;
      padding: 4px 2px;
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
  border-radius: 20px;
  width: 100%;
  max-width: 860px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${modalUp} 0.25s ease-out;

  @media (max-width: 900px) {
    max-width: 94%;
  }

  .modal-banner {
    background: #0d8a7a;
    color: white;
    padding: 18px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .patient-header {
      display: flex;
      align-items: center;
      gap: 14px;

      .circle-avatar {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.18);
        border: 2px solid rgba(255, 255, 255, 0.35);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 17px;
        font-weight: 800;
        color: white;
        flex-shrink: 0;
      }

      .info {
        .name {
          font-size: 20px;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.3px;
        }
        .bed-details {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          margin-top: 2px;
        }
      }
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      color: white;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s;
      &:hover { background: rgba(255, 255, 255, 0.35); }
    }
  }

  .modal-body {
    padding: 22px 28px;

    .section-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .most-used-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .featured-card {
      background: #f0fdf9;
      border: 1.5px solid #d1fae5;
      border-radius: 16px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      transition: all 0.2s ease-in-out;

      &:hover {
        background: #e6f9f3;
        border-color: #0d8a7a;
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(13, 138, 122, 0.12);
      }

      .icon-badge {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: #0d8a7a;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 800;
        flex-shrink: 0;
      }

      .meta {
        .title {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
        }
        .sub {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          margin-top: 2px;
        }
      }
    }

    .request-types-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .type-card {
      background: white;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: all 0.2s ease-in-out;

      &:hover {
        border-color: #0d8a7a;
        background: #fcfdfd;
        box-shadow: 0 6px 16px rgba(13, 138, 122, 0.12);
        transform: translateY(-2px);

        .title {
          color: #0d8a7a;
        }
      }

      .pill-badge {
        background: #e6f9f3;
        color: #0d8a7a;
        font-size: 11px;
        font-weight: 800;
        padding: 3px 8px;
        border-radius: 8px;
        width: fit-content;
        margin-bottom: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .title {
        font-size: 14px;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.2;
        margin-bottom: 2px;
        transition: color 0.2s ease;
      }

      .sub {
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
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
  padding: 16px;
`;

const RequestSubModalCard = styled.div`
  background: white;
  border-radius: 20px;
  width: 95%;
  max-width: 1100px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${modalUp} 0.2s ease-out;

  .submodal-header {
    background: #0d8a7a;
    color: white;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .back-btn {
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 6px 14px;
      border-radius: 8px;
      color: white;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      &:hover {
        background: rgba(255, 255, 255, 0.32);
        border-color: rgba(255, 255, 255, 0.6);
      }
    }

    .title-group {
      display: flex;
      flex-direction: column;
      gap: 3px;

      h3 {
        color: white;
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.2px;
      }

      .patient-sub {
        color: rgba(255, 255, 255, 0.88);
        font-size: 13px;
        font-weight: 400;
      }
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      color: white;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
      &:hover { background: rgba(255, 255, 255, 0.35); }
    }
  }

  .submodal-body {
    flex: 1;
    overflow-y: auto;
    background: #f8fafc;
    padding: 18px 24px;
  }
`;

const DrawerContent = styled.div`
  width: 380px;
  height: 100vh;
  background: white;
  box-shadow: -10px 0 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: ${slideInRight} 0.25s ease-out;

  .drawer-header {
    padding: 18px 22px;
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

    .active-badge {
      background: #e6f9f3;
      color: #0d9488;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
    }

    button {
      background: none;
      border: none;
      font-size: 18px;
      color: #64748b;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.15s;
      &:hover { color: #0f172a; background: #f1f5f9; }
    }
  }

  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 18px;

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .group-title {
          font-size: 11.5px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .clear-btn {
          background: none;
          border: none;
          color: #0d9488;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          padding: 0 4px;
          &:hover {
            text-decoration: underline;
          }
        }
      }

      .filter-select-wrapper {
        position: relative;
        width: 100%;

        select {
          width: 100%;
          padding: 10px 36px 10px 14px;
          font-size: 13px;
          font-weight: 500;
          color: #1e293b;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          outline: none;
          appearance: none;
          cursor: pointer;
          transition: all 0.2s ease;

          &.is-active {
            background: #f0fdfa;
            border-color: #0d9488;
            color: #0f766e;
            font-weight: 600;
          }

          &:focus {
            border-color: #0d9488;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
          }

          &:hover:not(:focus) {
            border-color: #cbd5e1;
            background: #ffffff;
          }
        }

        .select-arrow {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #64748b;
          font-size: 16px;
        }
      }
    }
  }

  .drawer-footer {
    padding: 16px 22px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 12px;
    background: #ffffff;

    .btn-reset {
      flex: 1;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 11px;
      font-size: 13px;
      font-weight: 700;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s;
      &:hover { background: #f1f5f9; border-color: #cbd5e1; }
    }

    .btn-apply {
      flex: 2;
      background: #0d9488;
      border: none;
      border-radius: 10px;
      padding: 11px;
      font-size: 13px;
      font-weight: 700;
      color: white;
      cursor: pointer;
      transition: all 0.15s;
      box-shadow: 0 2px 4px rgba(13, 148, 136, 0.2);
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
  const [selectedNursingStation, setSelectedNursingStation] = useState("ALL");
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
  const [showDoctorNotesModal, setShowDoctorNotesModal] = useState(false);
  const [showNursingNotesModal, setShowNursingNotesModal] = useState(false);
  const [showGeoModal, setShowGeoModal] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [clearanceLoading, setClearanceLoading] = useState(false);
  const [clearanceData, setClearanceData] = useState(null);

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

  const fetchBillingClearance = useCallback(async (ipNumber, uhid) => {
    if (!ipNumber && !uhid) return;
    setClearanceLoading(true);
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}check-patient-billing-clearance/?ipNumber=${encodeURIComponent(ipNumber || "")}&uhid=${encodeURIComponent(uhid || "")}`,
        "GET"
      );
      if (res && res.success) {
        const payload = res.data?.streams ? res.data : (res.streams ? res : res.data);
        setClearanceData(payload);
      } else {
        setClearanceData(null);
      }
    } catch (err) {
      console.error("Failed to check billing clearance", err);
      setClearanceData(null);
    } finally {
      setClearanceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showStatusModal && selectedPatient) {
      const ip = getField(selectedPatient, "ipNumber") || selectedPatient?.ipNumber || "";
      const uhid = getField(selectedPatient, "uhid") || selectedPatient?.uhid || "";
      fetchBillingClearance(ip, uhid);
    } else {
      setClearanceData(null);
      setClearanceLoading(false);
    }
  }, [showStatusModal, selectedPatient, fetchBillingClearance]);

  useEffect(() => {
    let bc;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("hms_billing_channel");
        bc.onmessage = () => {
          if (showStatusModal && selectedPatient) {
            const ip = getField(selectedPatient, "ipNumber") || selectedPatient?.ipNumber || "";
            const uhid = getField(selectedPatient, "uhid") || selectedPatient?.uhid || "";
            if (ip || uhid) fetchBillingClearance(ip, uhid);
          }
        };
      } catch (e) {}
    }
    return () => {
      if (bc) try { bc.close(); } catch (e) {}
    };
  }, [showStatusModal, selectedPatient, fetchBillingClearance]);

  const handleUpdateStatus = async () => {
    if (!statusToUpdate || !selectedPatient) return toast.warning("Please select a status");
    const isCleared = clearanceData?.is_clear_for_billing ?? clearanceData?.data?.is_clear_for_billing;
    if (statusToUpdate === "Sent for billing" && isCleared === false) {
      return toast.error("Cannot send for billing. Please complete or cancel pending items first.");
    }
    try {
      const ip = getField(selectedPatient, "ipNumber") || selectedPatient?.ipNumber || "";
      const res = await apiRequest(`${HmsBaseUrl}update_admission_status/`, "POST", {
        ip_number: ip,
        status: statusToUpdate
      });
      if (res.success || res.message) {
        toast.success("Status updated successfully");
        setShowStatusModal(false);
        setStatusToUpdate("");
        setClearanceData(null);
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

  // Resolve Nursing Station from admission or fallback to location mapping
  const getAdmNursingStation = useCallback((adm) => {
    let ns = getField(adm, "nursing_station") || adm.nursing_station || adm.nursingStation;
    if (!ns || !String(ns).trim()) {
      const rNo = String(getField(adm, "room_no") || adm.room_no || "").trim();
      if (rNo && Array.isArray(locationMapping)) {
        const matchLoc = locationMapping.find(l => String(l.room_no || l.room_number || "").trim() === rNo);
        if (matchLoc && (matchLoc.nursing_station || matchLoc.nursingStation)) {
          ns = matchLoc.nursing_station || matchLoc.nursingStation;
        }
      }
    }
    return String(ns || "").trim();
  }, [locationMapping]);

  // Dynamic options for Filter Drawer derived from actual data
  const availableNursingStations = useMemo(() => {
    const set = new Set(["ALL"]);
    admissions.forEach(a => {
      const ns = getAdmNursingStation(a);
      if (ns && String(ns).trim()) set.add(String(ns).trim());
    });
    locationMapping.forEach(l => {
      const ns = l.nursing_station || l.nursingStation;
      if (ns && String(ns).trim()) set.add(String(ns).trim());
    });
    return Array.from(set);
  }, [admissions, locationMapping, getAdmNursingStation]);

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

  // Active filters count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedNursingStation !== "ALL") count++;
    if (selectedBlock !== "ALL") count++;
    if (selectedCategory !== "ALL") count++;
    if (selectedDoctor !== "ALL") count++;
    if (selectedPayment !== "ALL") count++;
    if (selectedWardStatus !== "ALL") count++;
    return count;
  }, [selectedNursingStation, selectedBlock, selectedCategory, selectedDoctor, selectedPayment, selectedWardStatus]);

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
      if (selectedNursingStation !== "ALL") {
        const ns = getAdmNursingStation(item);
        if (String(ns).toLowerCase().trim() !== String(selectedNursingStation).toLowerCase().trim()) return false;
      }

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
  }, [admissions, search, statusFilter, selectedNursingStation, selectedBlock, selectedCategory, selectedDoctor, selectedPayment, selectedWardStatus, getAdmNursingStation]);

  // Group Rooms for Grid View
  const roomGroups = useMemo(() => {
    const groupsMap = new Map();

    const getOrCreateRoom = (roomNum, roomCat, blockName, nsName) => {
      const key = String(roomNum || "101").trim();
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          room_no: key,
          room_category: roomCat || "General",
          block: blockName || "Main Block",
          nursing_station: nsName || "",
          total_capacity: 0,
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
        const nsName = loc.nursing_station || loc.nursingStation || "";

        // Advanced Filter Drawer and Controls filtering
        if (selectedBlock !== "ALL") {
          const b = blockName || "Main Block";
          if (String(b).toLowerCase().trim() !== String(selectedBlock).toLowerCase().trim()) return;
        }
        if (selectedCategory !== "ALL") {
          const c = roomCat || "";
          if (String(c).toLowerCase().trim() !== String(selectedCategory).toLowerCase().trim()) return;
        }
        if (selectedNursingStation !== "ALL") {
          if (String(nsName).toLowerCase().trim() !== String(selectedNursingStation).toLowerCase().trim()) return;
        }

        const isRoomBlocked = Boolean(loc.is_blocked || String(loc.room_status || loc.status).toLowerCase() === "blocked");
        const roomObj = getOrCreateRoom(roomNum, roomCat, blockName, nsName);

        const rawBeds = Array.isArray(loc.beds) && loc.beds.length > 0 ? loc.beds : [loc];
        roomObj.total_capacity = Math.max(roomObj.total_capacity, rawBeds.length);

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
      const nsName = getAdmNursingStation(adm);

      const roomObj = getOrCreateRoom(roomNum, roomCat, blockName, nsName);

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

    let rooms = Array.from(groupsMap.values()).sort((a, b) =>
      String(a.room_no).localeCompare(String(b.room_no), undefined, { numeric: true })
    );

    // CRITICAL USER REQUIREMENT:
    // When "admitted" filter is clicked: show ONLY admitted beds, NOT all beds (exclude vacant/free beds)
    if (statusFilter === "admitted") {
      rooms = rooms
        .map(room => ({
          ...room,
          beds: room.beds.filter(b => b.admission && !getField(b.admission, "is_discharged"))
        }))
        .filter(room => room.beds.length > 0);
    } else if (statusFilter === "discharged") {
      rooms = rooms
        .map(room => ({
          ...room,
          beds: room.beds.filter(b => b.admission && getField(b.admission, "is_discharged"))
        }))
        .filter(room => room.beds.length > 0);
    }

    return rooms;
  }, [locationMapping, filteredAdmissions, selectedBlock, selectedCategory, selectedNursingStation, statusFilter, getAdmNursingStation]);

  // Compute KPI Summary Metrics
  const kpiRoomsCount = roomGroups.length;
  const kpiPatientsCount = filteredAdmissions.filter(a => !getField(a, "is_discharged")).length;

  const allMasterBedsCount = useMemo(() => {
    if (!Array.isArray(locationMapping) || locationMapping.length === 0) return 0;
    return locationMapping.reduce((acc, loc) => {
      const bName = loc.block || loc.block_name || "Main Block";
      const cName = loc.room_category || loc.category || "General";
      const nsName = loc.nursing_station || loc.nursingStation || "";

      if (selectedBlock !== "ALL" && String(bName).toLowerCase().trim() !== String(selectedBlock).toLowerCase().trim()) return acc;
      if (selectedCategory !== "ALL" && String(cName).toLowerCase().trim() !== String(selectedCategory).toLowerCase().trim()) return acc;
      if (selectedNursingStation !== "ALL" && String(nsName).toLowerCase().trim() !== String(selectedNursingStation).toLowerCase().trim()) return acc;

      const beds = Array.isArray(loc.beds) && loc.beds.length > 0 ? loc.beds.length : 1;
      return acc + beds;
    }, 0);
  }, [locationMapping, selectedBlock, selectedCategory, selectedNursingStation]);

  const totalBedsCount = allMasterBedsCount > 0
    ? allMasterBedsCount
    : roomGroups.reduce((acc, r) => acc + (r.total_capacity || r.beds?.length || 1), 0);

  const kpiFreeBedsCount = Math.max(0, totalBedsCount - kpiPatientsCount);
  const kpiOpenRequestsCount = filteredAdmissions.filter(a =>
    getField(a, "ward_status") === "Mark for discharge" || getField(a, "ward_status") === "Sent for billing"
  ).length;

  // Patient click handler -> Opens Action Modal (Image 2)
  const handleOpenActionModal = (patientObj) => {
    setSelectedPatient(patientObj);
    setShowActionModal(true);
  };

  const handleActionOption = (actionType) => {
    setShowActionModal(false);
    if (!selectedPatient) return;

    const patientState = {
      patient: selectedPatient,
      ipNo: getField(selectedPatient, "ipNumber") || getField(selectedPatient, "ipNo") || selectedPatient?.ipNumber || selectedPatient?.ipNo || "",
      uhid: getField(selectedPatient, "uhid") || selectedPatient?.uhid || "",
      from: "/wardrequest"
    };

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
      case "discharge_summary":
        navigate("/Summary", { state: patientState });
        break;
      case "doctor_notes":
        setShowDoctorNotesModal(true);
        break;
      case "nursing_notes":
        setShowNursingNotesModal(true);
        break;
      case "geo_verification":
        setShowGeoModal(true);
        break;
      case "billing":
        navigate("/DischargeBilling", { state: patientState });
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
            <span className="val" style={{ color: "#10b981" }}>{kpiFreeBedsCount}</span>
            <span className="sub">of {totalBedsCount}</span>
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

        <div className="ns-select-wrapper">
          <label htmlFor="ns-filter-select">Station:</label>
          <select
            id="ns-filter-select"
            value={selectedNursingStation}
            onChange={e => setSelectedNursingStation(e.target.value)}
          >
            <option value="ALL">All Stations</option>
            {availableNursingStations.filter(ns => ns !== "ALL").map(ns => (
              <option key={ns} value={ns}>{ns}</option>
            ))}
          </select>
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
            <FiSettings /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
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
          {roomGroups.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", color: "#64748b", width: "100%", gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>No rooms or beds found</div>
              <div style={{ fontSize: "13px" }}>No beds match the current filter criteria ({statusFilter !== "all" ? `Status: ${statusFilter}` : ""}{selectedNursingStation !== "ALL" ? `, Station: ${selectedNursingStation}` : ""}).</div>
            </div>
          ) : (
            roomGroups.map(room => {
            const usedBeds = room.beds.filter(b => b.admission).length;
            const totalBeds = room.total_capacity || room.beds.length || 1;

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
          }))}
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
                <div className="featured-card" onClick={() => handleActionOption("pharmacy")}>
                  <div className="icon-badge">Rx</div>
                  <div className="meta">
                    <div className="title">Pharmacy</div>
                    <div className="sub">Medication request</div>
                  </div>
                </div>

                <div className="featured-card" onClick={() => handleActionOption("lab")}>
                  <div className="icon-badge">Lab</div>
                  <div className="meta">
                    <div className="title">Laboratory</div>
                    <div className="sub">Pathology & lab</div>
                  </div>
                </div>
              </div>

              <div className="section-title" style={{ marginTop: "18px" }}>ALL REQUEST TYPES</div>
              <div className="request-types-grid">
                <div className="type-card" onClick={() => handleActionOption("radiology")}>
                  <div className="pill-badge">XR</div>
                  <div className="title">Radiology</div>
                  <div className="sub">Imaging</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("dietary")}>
                  <div className="pill-badge">Dt</div>
                  <div className="title">Dietary</div>
                  <div className="sub">Meal plan</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("laundry")}>
                  <div className="pill-badge">Ln</div>
                  <div className="title">Laundry</div>
                  <div className="sub">Linen</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("implant")}>
                  <div className="pill-badge">Im</div>
                  <div className="title">Implant</div>
                  <div className="sub">Surgical</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("status")}>
                  <div className="pill-badge">St</div>
                  <div className="title">Update status</div>
                  <div className="sub">Condition</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("shift")}>
                  <div className="pill-badge">Sh</div>
                  <div className="title">Room shift</div>
                  <div className="sub">Transfer</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("discharge_summary")}>
                  <div className="pill-badge">DS</div>
                  <div className="title">Discharge summary</div>
                  <div className="sub">View / edit</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("nursing_notes")}>
                  <div className="pill-badge">NN</div>
                  <div className="title">Nursing Notes</div>
                  <div className="sub">Vitals & Pain Scale</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("doctor_notes")}>
                  <div className="pill-badge">DN</div>
                  <div className="title">Doctor Notes</div>
                  <div className="sub">IP EMR / Notes</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("geo_verification")}>
                  <div className="pill-badge" style={{ background: "#ccfbf1", color: "#0d9488" }}>
                    <FiCamera size={15} />
                  </div>
                  <div className="title">Geo Verification</div>
                  <div className="sub">Bedside photo & GPS</div>
                </div>

                <div className="type-card" onClick={() => handleActionOption("billing")}>
                  <div className="pill-badge">DB</div>
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3>Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="active-badge">{activeFiltersCount} active</span>
                )}
              </div>
              <button onClick={() => setShowFilterDrawer(false)} title="Close">✕</button>
            </div>

            <div className="drawer-body">
              {/* 1. Nursing Station */}
              <div className="filter-group">
                <div className="group-header">
                  <span className="group-title">NURSING STATION</span>
                  {selectedNursingStation !== "ALL" && (
                    <button className="clear-btn" onClick={() => setSelectedNursingStation("ALL")}>Reset</button>
                  )}
                </div>
                <div className="filter-select-wrapper">
                  <select
                    className={selectedNursingStation !== "ALL" ? "is-active" : ""}
                    value={selectedNursingStation}
                    onChange={e => setSelectedNursingStation(e.target.value)}
                  >
                    <option value="ALL">All Stations</option>
                    {availableNursingStations.filter(ns => ns !== "ALL").map(ns => (
                      <option key={ns} value={ns}>{ns}</option>
                    ))}
                  </select>
                  <FiChevronDown className="select-arrow" />
                </div>
              </div>

              {/* 2. Block */}
              <div className="filter-group">
                <div className="group-header">
                  <span className="group-title">BLOCK</span>
                  {selectedBlock !== "ALL" && (
                    <button className="clear-btn" onClick={() => setSelectedBlock("ALL")}>Reset</button>
                  )}
                </div>
                <div className="filter-select-wrapper">
                  <select
                    className={selectedBlock !== "ALL" ? "is-active" : ""}
                    value={selectedBlock}
                    onChange={e => setSelectedBlock(e.target.value)}
                  >
                    <option value="ALL">All Blocks</option>
                    {availableBlocks.filter(b => b !== "ALL").map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <FiChevronDown className="select-arrow" />
                </div>
              </div>

              {/* 3. Room Category */}
              <div className="filter-group">
                <div className="group-header">
                  <span className="group-title">ROOM CATEGORY</span>
                  {selectedCategory !== "ALL" && (
                    <button className="clear-btn" onClick={() => setSelectedCategory("ALL")}>Reset</button>
                  )}
                </div>
                <div className="filter-select-wrapper">
                  <select
                    className={selectedCategory !== "ALL" ? "is-active" : ""}
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    <option value="ALL">All Categories</option>
                    {availableCategories.filter(cat => cat !== "ALL").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <FiChevronDown className="select-arrow" />
                </div>
              </div>

              {/* 4. Doctor */}
              <div className="filter-group">
                <div className="group-header">
                  <span className="group-title">DOCTOR</span>
                  {selectedDoctor !== "ALL" && (
                    <button className="clear-btn" onClick={() => setSelectedDoctor("ALL")}>Reset</button>
                  )}
                </div>
                <div className="filter-select-wrapper">
                  <select
                    className={selectedDoctor !== "ALL" ? "is-active" : ""}
                    value={selectedDoctor}
                    onChange={e => setSelectedDoctor(e.target.value)}
                  >
                    <option value="ALL">All Doctors</option>
                    {availableDoctors.filter(doc => doc !== "ALL").map(doc => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                  <FiChevronDown className="select-arrow" />
                </div>
              </div>

              {/* 5. Payment */}
              <div className="filter-group">
                <div className="group-header">
                  <span className="group-title">PAYMENT</span>
                  {selectedPayment !== "ALL" && (
                    <button className="clear-btn" onClick={() => setSelectedPayment("ALL")}>Reset</button>
                  )}
                </div>
                <div className="filter-select-wrapper">
                  <select
                    className={selectedPayment !== "ALL" ? "is-active" : ""}
                    value={selectedPayment}
                    onChange={e => setSelectedPayment(e.target.value)}
                  >
                    <option value="ALL">All Payments</option>
                    {availablePaymentTypes.filter(pay => pay !== "ALL").map(pay => (
                      <option key={pay} value={pay}>{pay}</option>
                    ))}
                  </select>
                  <FiChevronDown className="select-arrow" />
                </div>
              </div>

              {/* 6. Ward Status */}
              <div className="filter-group">
                <div className="group-header">
                  <span className="group-title">WARD STATUS</span>
                  {selectedWardStatus !== "ALL" && (
                    <button className="clear-btn" onClick={() => setSelectedWardStatus("ALL")}>Reset</button>
                  )}
                </div>
                <div className="filter-select-wrapper">
                  <select
                    className={selectedWardStatus !== "ALL" ? "is-active" : ""}
                    value={selectedWardStatus}
                    onChange={e => setSelectedWardStatus(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    {availableWardStatuses.filter(st => st !== "ALL").map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <FiChevronDown className="select-arrow" />
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                className="btn-reset"
                onClick={() => {
                  setSelectedNursingStation("ALL");
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
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => {
                    setShowLabModal(false);
                    setShowActionModal(true);
                  }}
                  title="Return to Actions Menu"
                >
                  <i className="bi bi-arrow-left"></i> Back to Actions
                </button>
                <div className="title-group">
                  <h3>Lab Ward Request</h3>
                  <span className="patient-sub">{getPatientFullName(selectedPatient)} · Room {getField(selectedPatient, "room_no") || "-"} · Bed {getField(selectedPatient, "bed_no") || "-"}</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowLabModal(false)} title="Close">✕</button>
            </div>
            <div className="submodal-body">
              <LabWardRequest
                patient={selectedPatient}
                onClose={() => setShowLabModal(false)}
                onBack={() => {
                  setShowLabModal(false);
                  setShowActionModal(true);
                }}
              />
            </div>
          </RequestSubModalCard>
        </ModalOverlayContainer>
      )}

      {showMedicineModal && selectedPatient && (
        <ModalOverlayContainer onClick={() => setShowMedicineModal(false)}>
          <RequestSubModalCard onClick={e => e.stopPropagation()} style={{ maxWidth: "1280px" }}>
            <div className="submodal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => {
                    setShowMedicineModal(false);
                    setShowActionModal(true);
                  }}
                  title="Return to Actions Menu"
                >
                  <i className="bi bi-arrow-left"></i> Back to Actions
                </button>
                <div className="title-group">
                  <h3>Medicine / Pharmacy Ward Request</h3>
                  <span className="patient-sub">{getPatientFullName(selectedPatient)} · Room {getField(selectedPatient, "room_no") || "-"} · Bed {getField(selectedPatient, "bed_no") || "-"}</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowMedicineModal(false)} title="Close">✕</button>
            </div>
            <div className="submodal-body">
              <MedicineWardRequest
                patient={selectedPatient}
                onClose={() => setShowMedicineModal(false)}
                onBack={() => {
                  setShowMedicineModal(false);
                  setShowActionModal(true);
                }}
              />
            </div>
          </RequestSubModalCard>
        </ModalOverlayContainer>
      )}

      {showRadiologyModal && selectedPatient && (
        <ModalOverlayContainer onClick={() => setShowRadiologyModal(false)}>
          <RequestSubModalCard onClick={e => e.stopPropagation()}>
            <div className="submodal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => {
                    setShowRadiologyModal(false);
                    setShowActionModal(true);
                  }}
                  title="Return to Actions Menu"
                >
                  <i className="bi bi-arrow-left"></i> Back to Actions
                </button>
                <div className="title-group">
                  <h3>Radiology Ward Request</h3>
                  <span className="patient-sub">{getPatientFullName(selectedPatient)} · Room {getField(selectedPatient, "room_no") || "-"} · Bed {getField(selectedPatient, "bed_no") || "-"}</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowRadiologyModal(false)} title="Close">✕</button>
            </div>
            <div className="submodal-body">
              <RadiologyWardRequest
                patient={selectedPatient}
                onClose={() => setShowRadiologyModal(false)}
                onBack={() => {
                  setShowRadiologyModal(false);
                  setShowActionModal(true);
                }}
              />
            </div>
          </RequestSubModalCard>
        </ModalOverlayContainer>
      )}

      {showLaundryModal && selectedPatient && (
        <ModalOverlayContainer onClick={() => setShowLaundryModal(false)}>
          <RequestSubModalCard onClick={e => e.stopPropagation()}>
            <div className="submodal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => {
                    setShowLaundryModal(false);
                    setShowActionModal(true);
                  }}
                  title="Return to Actions Menu"
                >
                  <i className="bi bi-arrow-left"></i> Back to Actions
                </button>
                <div className="title-group">
                  <h3>Laundry Ward Request</h3>
                  <span className="patient-sub">{getPatientFullName(selectedPatient)} · Room {getField(selectedPatient, "room_no") || "-"} · Bed {getField(selectedPatient, "bed_no") || "-"}</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowLaundryModal(false)} title="Close">✕</button>
            </div>
            <div className="submodal-body">
              <LaundryWardRequest
                patient={selectedPatient}
                onClose={() => setShowLaundryModal(false)}
                onBack={() => {
                  setShowLaundryModal(false);
                  setShowActionModal(true);
                }}
              />
            </div>
          </RequestSubModalCard>
        </ModalOverlayContainer>
      )}

      {showImplantModal && selectedPatient && (
        <ModalOverlayContainer onClick={() => setShowImplantModal(false)}>
          <RequestSubModalCard onClick={e => e.stopPropagation()}>
            <div className="submodal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => {
                    setShowImplantModal(false);
                    setShowActionModal(true);
                  }}
                  title="Return to Actions Menu"
                >
                  <i className="bi bi-arrow-left"></i> Back to Actions
                </button>
                <div className="title-group">
                  <h3>Implant Ward Request</h3>
                  <span className="patient-sub">{getPatientFullName(selectedPatient)} · Room {getField(selectedPatient, "room_no") || "-"} · Bed {getField(selectedPatient, "bed_no") || "-"}</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowImplantModal(false)} title="Close">✕</button>
            </div>
            <div className="submodal-body">
              <ImplantWardRequest
                patient={selectedPatient}
                onClose={() => setShowImplantModal(false)}
                onBack={() => {
                  setShowImplantModal(false);
                  setShowActionModal(true);
                }}
              />
            </div>
          </RequestSubModalCard>
        </ModalOverlayContainer>
      )}

      {showDietModal && selectedPatient && (
        <DietOrderModal
          patient={selectedPatient}
          HmsBaseUrl={HmsBaseUrl}
          onClose={() => setShowDietModal(false)}
          onSaved={() => {
            setShowDietModal(false);
            setShowActionModal(true);
          }}
          onBack={() => {
            setShowDietModal(false);
            setShowActionModal(true);
          }}
        />
      )}

      {showRoomShiftModal && selectedPatient && (
        <ModalOverlayContainer onClick={() => setShowRoomShiftModal(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "95vw",
              maxWidth: "1280px",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              position: "relative"
            }}
          >
            <RoomShifting
              patient={selectedPatient}
              onClose={() => setShowRoomShiftModal(false)}
              onSaved={() => {
                fetchAdmissions();
                setShowRoomShiftModal(false);
                setShowActionModal(true);
              }}
              onBack={() => {
                setShowRoomShiftModal(false);
                setShowActionModal(true);
              }}
            />
          </div>
        </ModalOverlayContainer>
      )}

      {showStatusModal && selectedPatient && (
        <ModalOverlayContainer onClick={() => { setShowStatusModal(false); setClearanceData(null); }}>
          <ActionModalCard onClick={e => e.stopPropagation()} style={{ maxWidth: "760px", width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="modal-banner" style={{ background: "#0d9488", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusModal(false);
                    setClearanceData(null);
                    setShowActionModal(true);
                  }}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                  title="Return to Actions Menu"
                >
                  <i className="bi bi-arrow-left"></i> Back to Actions
                </button>
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
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  disabled={clearanceLoading}
                  onClick={() => {
                    const pIp = getField(selectedPatient, "ipNumber") || getField(selectedPatient, "ipNo") || selectedPatient?.ipNumber || selectedPatient?.ipNo;
                    const pUhid = getField(selectedPatient, "uhid") || selectedPatient?.uhid;
                    fetchBillingClearance(pIp, pUhid);
                    fetchAdmissions();
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#0f766e",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: clearanceLoading ? "not-allowed" : "pointer"
                  }}
                  title="Refresh status & clearance"
                >
                  <FiRefreshCcw size={12} className={clearanceLoading ? "spin" : ""} />
                  Refresh
                </button>
                <button className="close-btn" onClick={() => { setShowStatusModal(false); setClearanceData(null); }}>✕</button>
              </div>
            </div>
            <div className="modal-body" style={{ padding: "20px", overflowY: "auto" }}>
              {/* Patient Info & Current Status */}
              <div style={{ marginBottom: "16px", padding: "12px 16px", background: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                    Current Status
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: "#047857" }}>
                    {getField(selectedPatient, "ward_status") || (getField(selectedPatient, "is_discharged") ? "Discharged" : "Admitted")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>IP NUMBER</div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                    {getField(selectedPatient, "ipNumber") || "-"}
                  </div>
                </div>
              </div>

              {/* Billing Clearance Status Section */}
              {(() => {
                const clearance = clearanceData?.streams ? clearanceData : (clearanceData?.data?.streams ? clearanceData.data : clearanceData);
                return (
                  <>
                    <div style={{ marginBottom: "18px", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px", background: "#f8fafc" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <i className="bi bi-shield-check" style={{ fontSize: "16px", color: "#0d9488" }}></i>
                          <span style={{ fontSize: "12px", fontWeight: "800", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Billing & Service Clearance Check
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button
                            type="button"
                            disabled={clearanceLoading}
                            onClick={() => {
                              const pIp = getField(selectedPatient, "ipNumber") || getField(selectedPatient, "ipNo") || selectedPatient?.ipNumber || selectedPatient?.ipNo;
                              const pUhid = getField(selectedPatient, "uhid") || selectedPatient?.uhid;
                              fetchBillingClearance(pIp, pUhid);
                              fetchAdmissions();
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              color: "#0f766e",
                              fontSize: "11px",
                              fontWeight: "700",
                              cursor: clearanceLoading ? "not-allowed" : "pointer"
                            }}
                            title="Re-check clearance"
                          >
                            <FiRefreshCcw size={11} className={clearanceLoading ? "spin" : ""} />
                            Re-check
                          </button>
                          {clearanceLoading ? (
                            <span style={{ fontSize: "11px", color: "#0d9488", fontWeight: "700" }}>
                              <i className="bi bi-arrow-repeat spin" style={{ marginRight: "4px" }}></i> Verifying...
                            </span>
                          ) : clearance ? (
                            clearance.is_clear_for_billing ? (
                              <span style={{ fontSize: "11px", fontWeight: "800", background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: "20px", border: "1px solid #86efac", display: "flex", alignItems: "center", gap: "4px" }}>
                                <i className="bi bi-check-circle-fill"></i> Ready for Billing
                              </span>
                            ) : (
                              <span style={{ fontSize: "11px", fontWeight: "800", background: "#fee2e2", color: "#b91c1c", padding: "3px 8px", borderRadius: "20px", border: "1px solid #fca5a5", display: "flex", alignItems: "center", gap: "4px" }}>
                                <i className="bi bi-exclamation-triangle-fill"></i> {clearance.pending_total || 0} Item{Number(clearance.pending_total) === 1 ? "" : "s"} Pending
                              </span>
                            )
                          ) : null}
                        </div>
                      </div>

                {clearanceLoading ? (
                  <div style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "12px" }}>
                    <span className="spinner-border spinner-border-sm text-primary" role="status" style={{ marginRight: "8px" }}></span>
                    Checking Lab, Radiology, Pharmacy, Implants, Diet & Laundry...
                  </div>
                ) : clearance && clearance.streams ? (
                  <>
                    {/* 6 Streams Grid with Rich In-Place Bills & Items */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                      {Object.entries(clearance.streams).map(([key, info]) => {
                        const isOk = info.is_cleared;
                        const hasBills = Array.isArray(info.bills) && info.bills.length > 0;
                        const hasItems = Array.isArray(info.items) && info.items.length > 0;
                        return (
                          <div
                            key={key}
                            style={{
                              padding: "10px 12px",
                              borderRadius: "10px",
                              background: isOk ? "#ffffff" : "#fff1f2",
                              border: `1.5px solid ${isOk ? "#e2e8f0" : "#fecdd3"}`,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "flex-start",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                              gridColumn: isOk ? "span 1" : "span 2"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <i className={`bi ${info.icon || "bi-dot"}`} style={{ fontSize: "15px", color: isOk ? "#059669" : "#e11d48" }}></i>
                                <span style={{ fontSize: "12.5px", fontWeight: "800", color: isOk ? "#334155" : "#991b1b" }}>
                                  {info.name}
                                </span>
                              </div>
                              {isOk ? (
                                <span style={{ fontSize: "11px", fontWeight: "700", color: "#059669", display: "flex", alignItems: "center", gap: "2px", background: "#f0fdf4", padding: "2px 7px", borderRadius: "6px" }}>
                                  <i className="bi bi-check2"></i> Cleared
                                </span>
                              ) : (
                                <span style={{ fontSize: "10.5px", fontWeight: "800", color: "#b91c1c", background: "#fee2e2", padding: "2px 7px", borderRadius: "6px", border: "1px solid #fca5a5" }}>
                                  {info.pending_count} Pending
                                </span>
                              )}
                            </div>

                            {/* In-place pending bills & items */}
                            {!isOk && (
                              <div style={{ marginTop: "8px", paddingTop: "6px", borderTop: "1px dashed #fca5a5" }}>
                                {hasBills ? (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {info.bills.map((bill, bIdx) => (
                                      <div
                                        key={bIdx}
                                        style={{
                                          background: "#ffffff",
                                          borderRadius: "8px",
                                          border: "1px solid #fed7aa",
                                          padding: "8px 10px",
                                          boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                                        }}
                                      >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                            <span style={{ fontWeight: "800", color: "#9a3412", fontSize: "12px" }}>
                                              📄 {bill.bill_no}
                                            </span>
                                            {bill.status && (
                                              <span style={{ fontSize: "9.5px", fontWeight: "700", background: "#ffedd5", color: "#c2410c", padding: "1px 5px", borderRadius: "4px", border: "1px solid #fed7aa" }}>
                                                {bill.status}
                                              </span>
                                            )}
                                          </div>
                                          {bill.total && (
                                            <span style={{ fontSize: "11px", fontWeight: "800", color: "#0f172a", background: "#f8fafc", padding: "1px 6px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                                              {bill.total}
                                            </span>
                                          )}
                                        </div>

                                        {bill.date && (
                                          <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px" }}>
                                            <i className="bi bi-clock" style={{ marginRight: "3px" }}></i>{bill.date}
                                          </div>
                                        )}

                                        {bill.items && bill.items.length > 0 && (
                                          <div style={{ background: "#fff7ed", borderRadius: "6px", padding: "5px 8px", border: "1px solid #ffedd5" }}>
                                            <div style={{ fontSize: "9.5px", fontWeight: "800", color: "#c2410c", textTransform: "uppercase", letterSpacing: "0.2px", marginBottom: "2px" }}>
                                              Pending Items ({bill.items.length}):
                                            </div>
                                            <div style={{ maxHeight: "85px", overflowY: "auto", paddingRight: "4px" }}>
                                              {bill.items.map((it, itIdx) => {
                                                const match = typeof it === "string" ? it.match(/^(.*?)\s*\[(.*?)\]$/) : null;
                                                const itemNamePart = match ? match[1] : it;
                                                const statusPart = match ? match[2] : null;
                                                return (
                                                  <div key={itIdx} style={{ fontSize: "11px", color: "#334155", lineHeight: "1.35", marginBottom: "3px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "4px", minWidth: 0 }}>
                                                      <span style={{ color: "#ea580c", fontWeight: "800", flexShrink: 0 }}>•</span>
                                                      <span style={{ wordBreak: "break-word" }}>{itemNamePart}</span>
                                                    </div>
                                                    {statusPart && (
                                                      <span style={{ fontSize: "9px", fontWeight: "700", background: statusPart === "Result Pending" ? "#fef3c7" : "#ffedd5", color: statusPart === "Result Pending" ? "#b45309" : "#c2410c", padding: "1px 5px", borderRadius: "4px", border: "1px solid #fed7aa", whiteSpace: "nowrap", flexShrink: 0 }}>
                                                        {statusPart}
                                                      </span>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : hasItems ? (
                                  <div style={{ maxHeight: "75px", overflowY: "auto", paddingRight: "4px" }}>
                                    {info.items.map((it, idx) => (
                                      <div key={idx} style={{ fontSize: "11px", color: "#334155", lineHeight: "1.35", marginBottom: "3px", display: "flex", alignItems: "flex-start", gap: "4px" }}>
                                        <span style={{ color: "#e11d48", fontWeight: "800" }}>•</span>
                                        <span style={{ wordBreak: "break-word" }}>{it}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Pending Items Breakdown Alert */}
                    {!clearance.is_clear_for_billing && (
                      <div style={{ marginTop: "12px", padding: "10px 12px", background: "#fff1f2", borderRadius: "8px", border: "1px solid #fecdd3" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "700", color: "#be123c" }}>
                          <i className="bi bi-exclamation-octagon-fill"></i>
                          <span>{clearance.pending_total} item(s) pending across departments. Status cannot be set to "Sent for billing".</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              {/* Status Selector */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "13px", color: "#0f172a" }}>
                  Select New Status
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    background: "#f8fafc"
                  }}
                  value={statusToUpdate}
                  onChange={(e) => setStatusToUpdate(e.target.value)}
                >
                  <option value="">Select status...</option>
                  <option value="Mark for discharge">Mark for discharge</option>
                  <option value="Discharge confirmation">Discharge confirmation</option>
                  <option
                    value="Sent for billing"
                    disabled={clearanceLoading || (clearance && !clearance.is_clear_for_billing)}
                    style={{
                      color: (!clearanceLoading && clearance && !clearance.is_clear_for_billing) ? "#94a3b8" : "inherit"
                    }}
                  >
                    Sent for billing {!clearanceLoading && clearance && !clearance.is_clear_for_billing ? "🔒 (Blocked: Pending Items)" : ""}
                  </option>
                </select>
                {!clearanceLoading && clearance && !clearance.is_clear_for_billing && (
                  <div style={{ marginTop: "4px", fontSize: "11px", color: "#e11d48", fontWeight: "600" }}>
                    * "Sent for billing" is locked until all pending requests are completed or cancelled.
                  </div>
                )}
              </div>
                  </>
                );
              })()}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => { setShowStatusModal(false); setClearanceData(null); setShowActionModal(true); }}
                  style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f1f5f9", cursor: "pointer", fontWeight: "700", color: "#334155", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <i className="bi bi-arrow-left"></i> Back to Actions
                </button>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => { setShowStatusModal(false); setClearanceData(null); }}
                    style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: "700", color: "#475569", fontSize: "13px" }}
                  >
                    Cancel
                  </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={statusToUpdate === "Sent for billing" && ((clearanceData?.is_clear_for_billing === false) || (clearanceData?.data?.is_clear_for_billing === false))}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: (statusToUpdate === "Sent for billing" && ((clearanceData?.is_clear_for_billing === false) || (clearanceData?.data?.is_clear_for_billing === false))) ? "#94a3b8" : "#0d9488",
                    color: "#fff",
                    cursor: (statusToUpdate === "Sent for billing" && ((clearanceData?.is_clear_for_billing === false) || (clearanceData?.data?.is_clear_for_billing === false))) ? "not-allowed" : "pointer",
                    fontWeight: "700",
                    fontSize: "13px"
                  }}
                >
                  Save Status
                </button>
                </div>
              </div>
            </div>
          </ActionModalCard>
        </ModalOverlayContainer>
      )}

      {/* IP DOCTOR CLINICAL NOTES / IP EMR MODAL */}
      {showDoctorNotesModal && selectedPatient && (
        <IPClinicalNotesModal
          patient={selectedPatient}
          onClose={() => {
            setShowDoctorNotesModal(false);
            setShowActionModal(true);
          }}
        />
      )}

      {/* IP NURSING NOTES & PAIN SCALE MODAL */}
      {showNursingNotesModal && selectedPatient && (
        <IPNursingNotesModal
          patient={selectedPatient}
          onClose={() => {
            setShowNursingNotesModal(false);
            setShowActionModal(true);
          }}
        />
      )}

      {/* WARD GEO VERIFICATION MODAL */}
      {showGeoModal && selectedPatient && (
        <GeoVerificationModal
          patient={selectedPatient}
          onClose={() => setShowGeoModal(false)}
          onSaved={() => {
            fetchAdmissions();
            setShowGeoModal(false);
            setShowActionModal(true);
          }}
        />
      )}
    </PageWrapper>
  );
};

export default WardRequest;
