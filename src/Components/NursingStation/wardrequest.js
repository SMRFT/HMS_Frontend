import React, { useEffect, useRef, useState, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import LabWardRequest from "./LabWardRequest";
import MedicineWardRequest from "./WardRequestPage";
import RadiologyWardRequest from "./RadiologyWardRequest";
import DietOrderModal from "./DietOrderModal";
import { PageWrapper, Container, colors, Table, Th, Td, Tr, Button, Input, Select, ModalOverlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody, NoResults } from "../GlobalStyles";

// Modern Icons
import {
  FiSearch,
  FiMoreVertical,
  FiX,
  FiActivity,
  FiPlusCircle,
  FiFileText,
  FiUser,
  FiClock,
  FiFilter,
  FiGrid,
  FiList,
  FiCheckCircle
} from "react-icons/fi";
import { MdOutlineScience, MdOutlineMedication, MdOutlineRestaurant } from "react-icons/md";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalSlideUp = keyframes`
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

// ─── Styled Components ───────────────────────────────────────────────────────
const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0 16px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid ${colors.border};

  h2 {
    margin: 0;
    color: ${colors.textMain};
    font-size: 1.6rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 12px;
    
    .icon-container {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px ${colors.primary}40;
    }
  }
`;

const Card = styled.div`
  background: ${colors.surface}cc;
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 24px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
`;

const FilterGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 160px;

  label {
    font-size: 0.8rem;
    font-weight: 600;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

// const StyledInput = styled.input`...`
// const StyledSelect = styled.select`...`
// const PrimaryButton = styled.button`...`

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
`;

const SegmentedControl = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid ${colors.border};
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
`;

const SegmentButton = styled.button`
  padding: 10px 18px;
  border: none;
  background: ${(props) => (props.$active ? colors.surface : "transparent")};
  color: ${(props) => (props.$active ? props.$activeColor || colors.textMain : colors.textMuted)};
  font-weight: 700;
  font-size: 0.82rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${(props) => (props.$active ? "0 4px 12px rgba(0,0,0,0.08)" : "none")};
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: ${(props) => (props.$active ? props.$activeColor || colors.textMain : colors.primary)};
    background: ${(props) => (props.$active ? colors.surface : "rgba(13, 148, 136, 0.05)")};
  }

  span.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(props) => (props.$active ? props.$activeColor || colors.primary : "#cbd5e1")};
    box-shadow: ${(props) => (props.$active ? `0 0 8px ${props.$activeColor || colors.primary}80` : "none")};
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 10px 0;
  animation: ${fadeIn} 0.4s ease-out;
`;

const RoomCard = styled.div`
  background: ${colors.surface}cc;
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: visible;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
    border-color: ${colors.primary}50;
    z-index: 10;
  }

  &::before {
    content: "";
    position: absolute;
    top: 24px;
    left: 0;
    width: 6px;
    height: calc(100% - 48px);
    background: ${(props) => (props.$occupancy === 100 ? "linear-gradient(to bottom, #ef4444, #b91c1c)" : props.$occupancy === 0 ? "linear-gradient(to bottom, #10b981, #059669)" : "linear-gradient(to bottom, " + colors.primary + ", " + colors.primaryDark + ")")};
    box-shadow: 2px 0 12px ${(props) => (props.$occupancy === 100 ? "#ef4444" : props.$occupancy === 0 ? "#10b981" : colors.primary)}40;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-left: 8px;

  .room-info {
    h3 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 900;
      color: ${colors.textMain};
      letter-spacing: -0.5px;
      line-height: 1.2;
    }
    small {
      color: ${colors.textMuted};
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
      display: block;
    }
  }

  .status-tag {
    font-size: 0.7rem;
    font-weight: 800;
    padding: 6px 14px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${(props) => (props.$occupancy === 100 ? colors.danger + "15" : props.$occupancy === 0 ? colors.success + "15" : colors.primary + "15")};
    color: ${(props) => (props.$occupancy === 100 ? colors.danger : props.$occupancy === 0 ? colors.success : colors.primary)};
    border: 1px solid ${(props) => (props.$occupancy === 100 ? colors.danger + "30" : props.$occupancy === 0 ? colors.success + "30" : colors.primary + "30")};
    box-shadow: 0 4px 8px ${(props) => (props.$occupancy === 100 ? colors.danger : props.$occupancy === 0 ? colors.success : colors.primary)}10;
  }
`;

const BedsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
`;

const BedItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: ${(props) => (props.$occupied ? "pointer" : "default")};
  position: relative;
  padding: 12px 8px;
  border-radius: 12px;
  background: ${(props) => (props.$occupied ? "rgba(13, 148, 136, 0.03)" : "transparent")};
  border: 1px solid ${(props) => (props.$occupied ? "rgba(13, 148, 136, 0.1)" : "transparent")};
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.$occupied ? "rgba(13, 148, 136, 0.08)" : "rgba(0,0,0,0.02)")};
    border-color: ${(props) => (props.$occupied ? colors.primary + "30" : "transparent")};
  }

  .bed-icon {
    width: 54px;
    height: 38px;
    background: ${(props) => (props.$occupied ? "linear-gradient(135deg, " + colors.primary + ", " + colors.primaryDark + ")" : props.$blocked ? "linear-gradient(135deg, " + colors.secondary + ", #d97706)" : "linear-gradient(135deg, " + colors.success + ", #15803d)")};
    border-radius: 10px 10px 6px 6px;
    position: relative;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);

    &::before {
      content: "";
      position: absolute;
      top: 4px;
      left: 6px;
      width: 16px;
      height: 8px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 3px;
    }

    &::after {
      content: "";
      position: absolute;
      top: 55%;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(255, 255, 255, 0.15);
    }
  }

  .bed-label {
    font-size: 0.7rem;
    font-weight: 800;
    color: ${colors.textMain};
    background: ${colors.background};
    padding: 2px 8px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .patient-initials {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -85%);
    color: white;
    font-size: 0.8rem;
    font-weight: 900;
    pointer-events: none;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }

  .patient-name {
    font-size: 0.75rem;
    font-weight: 700;
    color: ${colors.textMain};
    text-align: center;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 2px;
  }

  /* Tooltip logic */
  &:hover .bed-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const BedTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(8px);
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 12px 32px rgba(0,0,0,0.25);
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: ${colors.textMain};
  }

  div {
    margin-bottom: 2px;
    &:last-child { margin-bottom: 0; }
  }
  strong { color: ${colors.secondary}; }
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 12px;
    color: ${colors.textMuted};
  }

  input {
    padding: 10px 14px 10px 36px;
    border: 1px solid ${colors.border};
    border-radius: 8px;
    font-size: 0.9rem;
    width: 250px;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px "rgba(13, 148, 136, 0.1)";
    }
  }
`;

// const ModernTable = styled.table`...`

const PatientCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .avatar {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: ${colors.primary}15;
    color: ${colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.95rem;
    border: 1px solid ${colors.primary}30;
  }

  .info {
    display: flex;
    flex-direction: column;
    strong { font-weight: 600; color: ${colors.textMain}; }
    small { font-size: 0.75rem; color: ${colors.textMuted}; }
  }
`;

const StatusBadge = styled.span`
  background: ${(props) => (props.$isDischarged ? "#fff7ed" : "#f0fdfa")};
  color: ${(props) => (props.$isDischarged ? colors.secondary : colors.primary)};
  border: 1px solid ${(props) => (props.$isDischarged ? "#ffedd5" : "#ccfbf1")};
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${colors.textMuted};
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${colors.background};
    color: ${colors.textMain};
  }
`;

const DropdownMenu = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 220px;
  padding: 8px;
  z-index: 9999;
  animation: ${fadeIn} 0.2s ease-out;

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    color: ${colors.textMain};
    font-size: 0.85rem;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;

    svg {
      color: ${colors.textMuted};
      font-size: 1.1rem;
    }

    &:hover {
      background: ${colors.background};
      color: ${colors.primary};
      svg { color: ${colors.primary}; }
    }
  }
`;

// const ModalHeader = styled.div`...`
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const SummaryCard = styled.div`
  flex: 1;
  min-width: 200px;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.06);
    border-color: ${colors.primary}30;
  }

  &::after {
    content: "";
    position: absolute;
    right: -20px;
    top: -20px;
    width: 80px;
    height: 80px;
    background: ${(props) => props.$gradient || colors.primary}10;
    border-radius: 50%;
  }

  .icon-box {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: ${(props) => props.$gradient || `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    box-shadow: 0 8px 16px ${(props) => props.$color || colors.primary}30;
    flex-shrink: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    
    .label { 
      font-size: 0.7rem; 
      font-weight: 700; 
      color: ${colors.textMuted}; 
      text-transform: uppercase; 
      letter-spacing: 1px;
    }
    
    .details { 
      display: flex; 
      align-items: baseline; 
      gap: 6px;
    }
    
    .value { 
      font-size: 1.6rem; 
      font-weight: 800; 
      color: ${colors.textMain}; 
      line-height: 1;
    }
    
    .name { 
      font-size: 0.8rem; 
      font-weight: 500; 
      color: ${colors.textMuted}; 
    }
  }
`;

// ─── Helper Functions ────────────────────────────────────────────────────────
const getField = (item, field) => {
  if (item[field] !== null && item[field] !== undefined) return item[field];
  if (item.patient_details && item.patient_details[field] !== null && item.patient_details[field] !== undefined)
    return item.patient_details[field];
  return null;
};

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
};

// ─── Main Component ──────────────────────────────────────────────────────────
const WardRequest = () => {
  const [admissions, setAdmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [nursingStation, setNursingStation] = useState("ALL");
  const [roomCategory, setRoomCategory] = useState("ALL");
  const [block, setBlock] = useState("ALL");
  const [roomNo, setRoomNo] = useState("ALL");
  const [wards, setWards] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [roomCategories, setRoomCategories] = useState([]);
  const [locationMapping, setLocationMapping] = useState([]); // Master map
  const [statusFilter, setStatusFilter] = useState("all");
  const [showUpTo, setShowUpTo] = useState(15);
  const [loading, setLoading] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showLabModal, setShowLabModal] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showRadiologyModal, setShowRadiologyModal] = useState(false);
  const [showDietModal, setShowDietModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "list" or "grid"
  const [rooms, setRooms] = useState([]);

  const menuRef = useRef(null);

  const [showActionModal, setShowActionModal] = useState(false);

  const fetchWards = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_wards_list/`, "GET");
      if (res.success) {
        const wardList = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
        setWards(wardList);
      }
    } catch (err) { console.error("Ward fetch failed", err); }
  };

  const fetchBlocks = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}block/`, "GET");
      if (res) {
        const blockList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setBlocks(blockList);
      }
    } catch (err) { console.error("Block fetch failed", err); }
  };

  const fetchRoomCategories = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}room-category/`, "GET");
      if (res) {
        const categoryList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setRoomCategories(categoryList);
      }
    } catch (err) { console.error("Room category fetch failed", err); }
  };

  const fetchLocationMapping = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}location-mapping/`, "GET");
      if (res.success) setLocationMapping(res.data || []);
    } catch (err) { console.error("Location mapping fetch failed", err); }
  };

  const fetchRooms = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}room/`, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setRooms(list.filter((r) => r.is_active !== false));
    } catch (err) { console.error("Rooms fetch failed", err); }
  };

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const url = `${HmsBaseUrl}wardrequest/`;
      const res = await apiRequest(url, "GET");
      if (res.success) {
        setAdmissions(res.data.data || []);
      }
    } catch (err) {
      console.error("Admission fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  useEffect(() => {
    fetchWards();
    fetchBlocks();
    fetchRoomCategories();
    fetchLocationMapping();
    fetchRooms();
  }, []);

  // availableWards depends on selected Block, RoomCategory and RoomNo
  const availableWards = useMemo(() => {
    if (block === "ALL" && roomCategory === "ALL" && roomNo === "ALL") return wards;

    let base = locationMapping;
    if (block !== "ALL") base = base.filter(m => String(m.block_id) === block);
    if (roomCategory !== "ALL") base = base.filter(m => String(m.room_category_id) === roomCategory);
    if (roomNo !== "ALL") base = base.filter(m => String(m.room_no) === roomNo);

    const validWardIds = new Set(base.map(m => String(m.nursing_station_id)).filter(Boolean));
    const filtered = wards.filter(w => validWardIds.has(String(w.id)));
    return filtered.length > 0 ? filtered : wards;
  }, [block, roomCategory, roomNo, wards, locationMapping]);

  // availableBlocks depends on selected NursingStation, RoomCategory and RoomNo
  const availableBlocks = useMemo(() => {
    if (nursingStation === "ALL" && roomCategory === "ALL" && roomNo === "ALL") return blocks;

    let base = locationMapping;
    if (nursingStation !== "ALL") base = base.filter(m => String(m.nursing_station_id) === nursingStation);
    if (roomCategory !== "ALL") base = base.filter(m => String(m.room_category_id) === roomCategory);
    if (roomNo !== "ALL") base = base.filter(m => String(m.room_no) === roomNo);

    const validBlockIds = new Set(base.map(m => String(m.block_id)).filter(Boolean));
    const filtered = blocks.filter(b => {
      const id = b.id || b.block_id;
      return validBlockIds.has(String(id));
    });
    return filtered.length > 0 ? filtered : blocks;
  }, [nursingStation, roomCategory, roomNo, blocks, locationMapping]);

  // availableRoomCategories depends on selected NursingStation, Block and RoomNo
  const availableRoomCategories = useMemo(() => {
    if (nursingStation === "ALL" && block === "ALL" && roomNo === "ALL") return roomCategories;

    let base = locationMapping;
    if (nursingStation !== "ALL") base = base.filter(m => String(m.nursing_station_id) === nursingStation);
    if (block !== "ALL") base = base.filter(m => String(m.block_id) === block);
    if (roomNo !== "ALL") base = base.filter(m => String(m.room_no) === roomNo);

    const validCatIds = new Set(base.map(m => String(m.room_category_id)).filter(Boolean));
    const filtered = roomCategories.filter(c => {
      const id = c.id || c.room_category_id || c._id;
      return validCatIds.has(String(id));
    });
    return filtered.length > 0 ? filtered : roomCategories;
  }, [nursingStation, block, roomNo, roomCategories, locationMapping]);

  const availableRoomNumbers = useMemo(() => {
    let base = locationMapping;
    if (nursingStation !== "ALL") base = base.filter(m => String(m.nursing_station_id) === nursingStation);
    if (block !== "ALL") base = base.filter(m => String(m.block_id) === block);
    if (roomCategory !== "ALL") base = base.filter(m => String(m.room_category_id) === roomCategory);

    if (base.length === 0 && locationMapping.length > 0) return Array.from(new Set(locationMapping.map(m => m.room_no))).filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));

    const rooms = Array.from(new Set(base.map(m => m.room_no))).filter(Boolean);
    return rooms.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  }, [nursingStation, block, roomCategory, locationMapping]);

  const locationSummary = useMemo(() => {
    const targetAdmissions = admissions.filter(a => nursingStation === "ALL" || String(getField(a, "nursing_station_id")) === nursingStation);
    const summary = {};
    targetAdmissions.forEach(a => {
      const b = getField(a, "block") || "Other";
      const c = getField(a, "room_category") || "Other";
      const key = `${b}|${c}`;
      summary[key] = (summary[key] || 0) + 1;
    });
    return Object.entries(summary).map(([key, count]) => {
      const [block, category] = key.split("|");
      return { block, category, count };
    }).sort((a, b) => b.count - a.count);
  }, [admissions, nursingStation]);

  // --- Auto-Reset Dependent Filters ---
  useEffect(() => {
    if (nursingStation !== "ALL" && !availableWards.some(w => String(w.id) === nursingStation)) {
      setNursingStation("ALL");
    }
  }, [availableWards, nursingStation]);

  useEffect(() => {
    if (block !== "ALL" && !availableBlocks.some(b => String(b.id || b.block_id) === block)) {
      setBlock("ALL");
    }
  }, [availableBlocks, block]);

  useEffect(() => {
    if (roomCategory !== "ALL" && !availableRoomCategories.some(c => String(c.id || c.room_category_id || c._id) === roomCategory)) {
      setRoomCategory("ALL");
    }
  }, [availableRoomCategories, roomCategory]);

  useEffect(() => {
    if (roomNo !== "ALL" && !availableRoomNumbers.includes(roomNo)) {
      setRoomNo("ALL");
    }
  }, [availableRoomNumbers, roomNo]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAdmissions = admissions.filter((item) => {
    const patientName = [
      getField(item, "salutation"), getField(item, "firstName"),
      getField(item, "middleName"), getField(item, "lastName"),
    ].filter(Boolean).join(" ");

    const uhid = getField(item, "uhid") || "";
    const ipNumber = item.ipNumber || "";

    const matchesSearch =
      !search ||
      ipNumber.toLowerCase().includes(search.toLowerCase()) ||
      patientName.toLowerCase().includes(search.toLowerCase()) ||
      uhid.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const isDischarged = getField(item, "is_discharged");
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "admitted" && (isDischarged === false || isDischarged === null)) ||
      (statusFilter === "discharged" && isDischarged === true);
    if (!matchesStatus) return false;

    const stationId = getField(item, "nursing_station_id") || item.nursing_station_id;
    const matchesStation = nursingStation === "ALL" || String(stationId) === String(nursingStation);
    if (!matchesStation) return false;

    const catId = getField(item, "room_category_id") || item.room_category_id;
    const matchesCategory = roomCategory === "ALL" || String(catId) === String(roomCategory);
    if (!matchesCategory) return false;

    const blkId = getField(item, "block_id") || item.block_id;
    const matchesBlock = block === "ALL" || String(blkId) === String(block);
    if (!matchesBlock) return false;

    const currentRoomNo = getField(item, "roomNo");
    const matchesRoom = roomNo === "ALL" || String(currentRoomNo) === String(roomNo);
    if (!matchesRoom) return false;

    return true;
  });

  const displayedAdmissions = filteredAdmissions.slice(0, showUpTo);

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  // ─── Shared Grid Logic (Moved up for Summary Cards) ────────────────────────
  const roomOccupancy = useMemo(() => {
    const map = {};
    admissions.forEach(adm => {
      const rNo = getField(adm, "roomNo");
      if (rNo) {
        if (!map[rNo]) map[rNo] = [];
        map[rNo].push(adm);
      }
    });
    return map;
  }, [admissions]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesBlock = block === "ALL" || String(room.block_id || room.block) === String(block);
      return matchesBlock;
    });
  }, [rooms, block]);

  const WardGridView = () => {
    if (loading) return <NoResults>Loading Grid Data...</NoResults>;

    return (
      <GridContainer>
        {filteredRooms.map((room, idx) => {
          const occupants = roomOccupancy[room.room_number] || [];
          const capacity = parseInt(room.capacity || 0);
          const occupancyPercent = capacity > 0 ? (occupants.length / capacity) * 100 : 0;

          return (
            <RoomCard key={idx} $occupancy={occupancyPercent} style={{ animationDelay: `${idx * 0.05}s` }}>
              <RoomHeader $occupancy={occupancyPercent}>
                <div className="room-info">
                  <h3>Room {room.room_number}</h3>
                  <small>{room.room_category} • {room.block}</small>
                </div>
                <div className="status-tag">
                  {occupants.length} / {capacity} Beds
                </div>
              </RoomHeader>

              <BedsGrid>
                {(room.beds || []).map((bed, bIdx) => {
                  const occupant = occupants.find(o => String(getField(o, "bedNo")) === String(bed.bed_number));
                  const initials = occupant ? getInitials(`${getField(occupant, "firstName") || ""} ${getField(occupant, "lastName") || ""}`.trim()) : "";

                  return (
                    <BedItem
                      key={bIdx}
                      $occupied={!!occupant}
                      $blocked={bed.blocked}
                      onClick={() => {
                        if (occupant) {
                          setSelectedPatient(occupant);
                          setShowActionModal(true);
                        }
                      }}
                    >
                      <div className="bed-icon" />
                      {/* {initials && <div className="patient-initials">{initials}</div>} */}
                      <div className="bed-label">{bed.bed_number}</div>
                      {occupant && (
                        <div className="patient-name">
                          {[getField(occupant, "firstName"), getField(occupant, "lastName")].filter(Boolean).join(" ")}
                        </div>
                      )}

                      {occupant && (
                        <BedTooltip className="bed-tooltip">
                          <div><strong>Patient:</strong> {[getField(occupant, "salutation"), getField(occupant, "firstName"), getField(occupant, "lastName")].filter(Boolean).join(" ")}</div>
                          <div><strong>UHID:</strong> {getField(occupant, "uhid")}</div>
                          <div><strong>IP No:</strong> {occupant.ipNumber}</div>
                          <div><strong>Doctor:</strong> {getField(occupant, "doctorName")}</div>
                        </BedTooltip>
                      )}
                    </BedItem>
                  );
                })}
              </BedsGrid>
            </RoomCard>
          );
        })}
        {filteredRooms.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: colors.textMuted }}>
            No rooms found matching the current filters.
          </div>
        )}
      </GridContainer>
    );
  };

  return (
    <PageWrapper>
      <Container>
        <div style={{ padding: "0 24px" }}>
          <PageHeader>
            <h2>
              <div className="icon-container">
                <FiActivity size={24} />
              </div>
              Ward Request Management
            </h2>
          </PageHeader>

          <div style={{ display: "flex", gap: "20px", marginBottom: "24px", flexWrap: "wrap" }}>
            <SummaryCard $gradient="linear-gradient(135deg, #0ea5e9, #0284c7)" $color="#0ea5e9">
              <div className="icon-box">
                <FiGrid />
              </div>
              <div className="content">
                <span className="label">Total Rooms</span>
                <div className="details">
                  <span className="value">{filteredRooms.length}</span>
                  <span className="name">Filtered</span>
                </div>
              </div>
            </SummaryCard>

            <SummaryCard $gradient="linear-gradient(135deg, #f43f5e, #e11d48)" $color="#f43f5e">
              <div className="icon-box">
                <FiUser />
              </div>
              <div className="content">
                <span className="label">Occupied Beds</span>
                <div className="details">
                  <span className="value">{filteredAdmissions.length}</span>
                  <span className="name">Patients</span>
                </div>
              </div>
            </SummaryCard>

            <SummaryCard $gradient="linear-gradient(135deg, #10b981, #059669)" $color="#10b981">
              <div className="icon-box">
                <FiCheckCircle />
              </div>
              <div className="content">
                <span className="label">Available Beds</span>
                <div className="details">
                  <span className="value">
                    {filteredRooms.reduce((acc, r) => acc + (parseInt(r.capacity || 0) - (roomOccupancy[r.room_number]?.length || 0)), 0)}
                  </span>
                  <span className="name">Ready</span>
                </div>
              </div>
            </SummaryCard>
          </div>

          <Toolbar>
            <div style={{ display: "flex", gap: "12px" }}>
              <SegmentedControl>
                <SegmentButton
                  $active={statusFilter === "all"}
                  onClick={() => setStatusFilter("all")}
                >
                  All Admissions
                </SegmentButton>
                <SegmentButton
                  $active={statusFilter === "admitted"}
                  $activeColor={colors.primary}
                  onClick={() => setStatusFilter("admitted")}
                >
                  <span className="dot" /> Admitted
                </SegmentButton>
                <SegmentButton
                  $active={statusFilter === "discharged"}
                  $activeColor={colors.secondary}
                  onClick={() => setStatusFilter("discharged")}
                >
                  <span className="dot" /> Discharged
                </SegmentButton>
              </SegmentedControl>

              <SegmentedControl>
                <SegmentButton
                  $active={viewMode === "grid"}
                  onClick={() => setViewMode("grid")}
                >
                  <FiGrid /> Grid View
                </SegmentButton>
                <SegmentButton
                  $active={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                >
                  <FiList /> List View
                </SegmentButton>
              </SegmentedControl>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Select
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                style={{ width: "160px", height: "45px", borderRadius: "12px", margin: 0 }}
              >
                <option value="ALL">All Blocks</option>
                {availableBlocks.map((blk, i) => {
                  const id = blk.id || blk.block_id;
                  return <option key={i} value={id}>{blk.block_name}</option>;
                })}
              </Select>

              <Button
                primary
                onClick={fetchAdmissions}
                disabled={loading}
                style={{ height: "45px", minWidth: "120px", borderRadius: "12px", padding: "0 16px", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <FiClock /> {loading ? "..." : "Refresh"}
              </Button>

              <SearchBox>
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </SearchBox>

              <Select
                value={showUpTo}
                onChange={(e) => setShowUpTo(Number(e.target.value))}
                style={{ width: "80px", height: "45px", borderRadius: "12px", margin: 0 }}
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </div>
          </Toolbar>

          <Card style={{ padding: viewMode === "list" ? 0 : "20px", overflow: "visible", background: viewMode === "list" ? colors.surface : "transparent", border: viewMode === "list" ? `1px solid ${colors.border}` : "none", boxShadow: viewMode === "list" ? "0 4px 12px rgba(0,0,0,0.03)" : "none" }}>
            {viewMode === "list" ? (
              <Table>
                <thead>
                  <Tr>
                    <Th>Patient Info</Th>
                    <Th>UHID / IP No</Th>
                    <Th>Admitted On</Th>
                    <Th>Room & Bed</Th>
                    <Th>Doctor</Th>
                    <Th>Status</Th>
                    <Th style={{ textAlign: "center" }}>Actions</Th>
                  </Tr>
                </thead>
                <tbody>
                  {displayedAdmissions.length === 0 ? (
                    <Tr>
                      <Td colSpan="7" style={{ textAlign: "center", padding: "40px 0", color: colors.textMuted }}>
                        No admissions found matching your criteria.
                      </Td>
                    </Tr>
                  ) : (
                    displayedAdmissions.map((item, index) => {
                      const fullName = [
                        getField(item, "salutation"), getField(item, "firstName"),
                        getField(item, "middleName"), getField(item, "lastName")
                      ].filter(Boolean).join(" ");

                      const isDischarged = getField(item, "is_discharged");

                      return (
                        <Tr key={item.id || index}>
                          <Td>
                            <PatientCell>
                              {/* <div className="avatar">{getInitials(fullName)}</div> */}
                              <div className="info">
                                <strong>{fullName || "Unknown"}</strong>
                                <small>{getField(item, "gender")} • {getField(item, "age") || "-"} yrs</small>
                              </div>
                            </PatientCell>
                          </Td>
                          <Td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ fontWeight: 500 }}>{getField(item, "uhid") || "-"}</span>
                              <span style={{ fontSize: "0.8rem", color: colors.textMuted }}>{item.ipNumber || "-"}</span>
                            </div>
                          </Td>
                          <Td>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMuted }}>
                              <FiClock /> {formatDateTime(getField(item, "admissionDateTime"))}
                            </div>
                          </Td>
                          <Td>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <strong style={{ color: colors.textMain }}>{getField(item, "roomNo") || "-"}</strong>
                              <small style={{ color: colors.textMuted }}>Bed: {getField(item, "bedNo") || "-"}</small>
                            </div>
                          </Td>
                          <Td>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <FiUser color={colors.primary} />
                              {getField(item, "doctorName") || "-"}
                            </div>
                          </Td>
                          <Td>
                            <StatusBadge $isDischarged={isDischarged}>
                              {isDischarged ? "Discharged" : "Admitted"}
                            </StatusBadge>
                          </Td>
                          <Td style={{ textAlign: "center" }}>
                            <Button
                              style={{ margin: "0 auto", padding: "6px 12px", borderRadius: "20px", fontSize: "0.75rem", background: colors.primary + "15", color: colors.primary, border: `1px solid ${colors.primary}30` }}
                              onClick={() => {
                                setSelectedPatient(item);
                                setShowActionModal(true);
                              }}
                            >
                              Select Request
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            ) : (
              <WardGridView />
            )}
          </Card>
        </div>
      </Container>

      {showActionModal && selectedPatient && (
        <ModalOverlay onClick={() => setShowActionModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", padding: "0", borderRadius: "24px", overflow: "hidden", border: "none", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)" }}>
            <div style={{ background: "linear-gradient(135deg, #136A63, #0d9488)", padding: "20px 24px", color: "white", position: "relative" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 900, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)" }}>
                  {getInitials(selectedPatient.firstName + " " + selectedPatient.lastName)}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1.2 }}>{selectedPatient.salutation} {selectedPatient.firstName} {selectedPatient.lastName}</h2>
                  <div style={{ opacity: 0.9, fontSize: "0.75rem", marginTop: "2px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <span>Patient Name: <strong>{getField(selectedPatient, "patient_name")}</strong></span>
                    <span style={{ width: "3px", height: "3px", background: "rgba(255,255,255,0.4)", borderRadius: "50%" }} />
                    <span>UHID: <strong>{getField(selectedPatient, "uhid")}</strong></span>
                    <span style={{ width: "3px", height: "3px", background: "rgba(255,255,255,0.4)", borderRadius: "50%" }} />
                    <span>IP: <strong>{selectedPatient.ipNumber}</strong></span>
                    <span style={{ width: "3px", height: "3px", background: "rgba(255,255,255,0.4)", borderRadius: "50%" }} />
                    {/* <span>Gender: <strong>{getField(selectedPatient, "gender")}</strong></span>
                    <span style={{ width: "3px", height: "3px", background: "rgba(255,255,255,0.4)", borderRadius: "50%" }} /> */}

                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowActionModal(false)}
                style={{ position: "absolute", top: "16px", right: "16px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
              >
                <FiX size={16} />
              </button>
            </div>

            <div style={{ padding: "24px", background: "#ffffff" }}>
              <div style={{ marginBottom: "16px", fontWeight: 800, color: colors.textMuted, textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "1.2px" }}>Select Request Type</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div
                  style={{
                    padding: "16px", background: "#f8fafc", borderRadius: "16px", border: `1px solid #e2e8f0`, textAlign: "center", cursor: "pointer", transition: "all 0.2s ease"
                  }}
                  onClick={() => { setShowLabModal(true); setShowActionModal(false); }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(13, 148, 136, 0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: colors.primary + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                    <MdOutlineScience size={24} color={colors.primary} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: colors.textMain }}>Laboratory</div>
                  <div style={{ fontSize: "0.7rem", color: colors.textMuted, marginTop: "2px" }}>Pathology & Lab</div>
                </div>

                <div
                  style={{
                    padding: "16px", background: "#f8fafc", borderRadius: "16px", border: `1px solid #e2e8f0`, textAlign: "center", cursor: "pointer", transition: "all 0.2s ease"
                  }}
                  onClick={() => { setShowMedicineModal(true); setShowActionModal(false); }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(13, 148, 136, 0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: colors.primary + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                    <MdOutlineMedication size={24} color={colors.primary} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: colors.textMain }}>Pharmacy</div>
                  <div style={{ fontSize: "0.7rem", color: colors.textMuted, marginTop: "2px" }}>Medications</div>
                </div>

                <div
                  style={{
                    padding: "16px", background: "#f8fafc", borderRadius: "16px", border: `1px solid #e2e8f0`, textAlign: "center", cursor: "pointer", transition: "all 0.2s ease"
                  }}
                  onClick={() => { setShowRadiologyModal(true); setShowActionModal(false); }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(13, 148, 136, 0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: colors.primary + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                    <FiFileText size={24} color={colors.primary} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: colors.textMain }}>Radiology</div>
                  <div style={{ fontSize: "0.7rem", color: colors.textMuted, marginTop: "2px" }}>Imaging Services</div>
                </div>

                <div
                  style={{
                    padding: "16px", background: "#f8fafc", borderRadius: "16px", border: `1px solid #e2e8f0`, textAlign: "center", cursor: "pointer", transition: "all 0.2s ease"
                  }}
                  onClick={() => { setShowDietModal(true); setShowActionModal(false); }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(13, 148, 136, 0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: colors.primary + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                    <MdOutlineRestaurant size={24} color={colors.primary} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: colors.textMain }}>Dietary</div>
                  <div style={{ fontSize: "0.7rem", color: colors.textMuted, marginTop: "2px" }}>Meal Planning</div>
                </div>
              </div>

              <div style={{ marginTop: "20px", padding: "12px 16px", background: colors.primary + "05", borderRadius: "12px", border: `1px dashed ${colors.primary}30`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: colors.textMuted }}>Assigned Doctor:</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: colors.primary }}>Dr. {getField(selectedPatient, "doctorName") || "-"}</span>
              </div>
            </div>
          </ModalContainer>
        </ModalOverlay>
      )}

      {showLabModal && selectedPatient && (
        <ModalOverlay onClick={() => setShowLabModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()} style={{ maxWidth: "1200px", width: "95%" }}>
            <ModalHeader $bg="#136A63">
              <h3 style={{ color: "#fff" }}>
                <MdOutlineScience size={22} />
                Lab Ward Request
                <span className="subtitle" style={{ color: "rgba(255,255,255,0.8)", fontSize: '0.85rem' }}>| {getField(selectedPatient, "firstName")} {getField(selectedPatient, "lastName")} | Dr. {getField(selectedPatient, "doctorName") || "-"}</span>
              </h3>
              <CloseButton
                onClick={() => setShowLabModal(false)}
                style={{ color: "rgba(255,255,255,0.8)", transition: 'all 0.2s', background: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <FiX />
              </CloseButton>
            </ModalHeader>
            <div style={{ flex: 1, overflowY: "auto", background: colors.background }}>
              <LabWardRequest patient={selectedPatient} onClose={() => setShowLabModal(false)} />
            </div>
          </ModalContainer>
        </ModalOverlay>
      )}

      {showMedicineModal && selectedPatient && (
        <ModalOverlay onClick={() => setShowMedicineModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()} style={{ maxWidth: "1200px", width: "95%" }}>
            <ModalHeader $bg="#136A63">
              <h3 style={{ color: "#fff" }}>
                <MdOutlineMedication size={22} />
                Medicine Ward Request
                <span className="subtitle" style={{ color: "rgba(255,255,255,0.8)", fontSize: '0.85rem' }}>| {getField(selectedPatient, "firstName")} {getField(selectedPatient, "lastName")} | Dr. {getField(selectedPatient, "doctorName") || "-"}</span>
              </h3>
              <CloseButton
                onClick={() => setShowMedicineModal(false)}
                style={{ color: "rgba(255,255,255,0.8)", transition: 'all 0.2s', background: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <FiX />
              </CloseButton>
            </ModalHeader>
            <div style={{ flex: 1, overflowY: "auto", background: colors.background }}>
              <MedicineWardRequest patient={selectedPatient} onClose={() => setShowMedicineModal(false)} />
            </div>
          </ModalContainer>
        </ModalOverlay>
      )}

      {showRadiologyModal && selectedPatient && (
        <ModalOverlay onClick={() => setShowRadiologyModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()} style={{ maxWidth: "1200px", width: "95%" }}>
            <ModalHeader $bg="#136A63">
              <h3 style={{ color: "#fff" }}>
                <FiFileText size={22} />
                Radiology Ward Request
                <span className="subtitle" style={{ color: "rgba(255,255,255,0.8)", fontSize: '0.85rem' }}>| {getField(selectedPatient, "firstName")} {getField(selectedPatient, "lastName")} | Dr. {getField(selectedPatient, "doctorName") || "-"}</span>
              </h3>
              <CloseButton
                onClick={() => setShowRadiologyModal(false)}
                style={{ color: "rgba(255,255,255,0.8)", transition: 'all 0.2s', background: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <FiX />
              </CloseButton>
            </ModalHeader>
            <div style={{ flex: 1, overflowY: "auto", background: colors.background }}>
              <RadiologyWardRequest patient={selectedPatient} onClose={() => setShowRadiologyModal(false)} />
            </div>
          </ModalContainer>
        </ModalOverlay>
      )}
      {showDietModal && selectedPatient && (
        <DietOrderModal
          patient={selectedPatient}
          HmsBaseUrl={HmsBaseUrl}
          onClose={() => setShowDietModal(false)}
          onSaved={() => {
            setShowDietModal(false);
            // Optionally refresh a list if needed
          }}
        />
      )}
    </PageWrapper>
  );
};

export default WardRequest;
