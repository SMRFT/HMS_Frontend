import { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../../Auth/apiRequest";
import {
  PageWrapper, Container, Button, TableWrapper, Table, Th, Td, Tr,
  ModalOverlay, ModalContainer, ModalHeader, ModalTitle,
  CloseButton, ModalBody, SearchRow, SearchInput, NoResults, colors,
} from "../GlobalStyles";

// ─── Animations ───────────────────────────────────────────────────────────────
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
`;

// ─── Form Styles ──────────────────────────────────────────────────────────────

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px 10px;
  padding: 12px 16px;
  align-items: end;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  grid-column: span ${({ span }) => span || 1};
`;

const Lbl = styled.label`
  font-size: 0.7rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  &::after {
    content: ${({ required }) => (required ? '" *"' : '""')};
    color: #ef4444;
  }
`;

const Inp = styled.input`
  height: 28px;
  padding: 0 7px;
  font-size: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: ${({ readOnly }) => (readOnly ? "#f3f4f6" : "#fff")};
  color: #111827;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 2px #ccfbf1; }
`;

const Sel = styled.select`
  height: 28px;
  padding: 0 4px;
  font-size: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #111827;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: #0d9488; }
`;

const Txta = styled.textarea`
  padding: 4px 7px;
  font-size: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  resize: vertical;
  min-height: 44px;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: #0d9488; outline: none; }
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const IconBtn = styled.button`
  height: 28px;
  padding: 0 7px;
  font-size: 0.72rem;
  background: #0d9488;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover { background: #0f766e; }
`;

const SectionDivider = styled.div`
  grid-column: span 6;
  border-top: 1px solid #e5e7eb;
  margin: 4px 0 2px;
  padding-top: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #0d9488;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 8px 16px 12px;
  border-top: 1px solid #e5e7eb;
`;

const SmBtn = styled.button`
  height: 30px;
  padding: 0 14px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: ${({ secondary }) => (secondary ? "#e5e7eb" : "#0d9488")};
  color: ${({ secondary }) => (secondary ? "#374151" : "#fff")};
  &:hover { opacity: 0.88; }
`;

const PrintBtn = styled.button`
  height: 30px;
  padding: 0 14px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: #7c3aed;
  color: #fff;
  &:hover { opacity: 0.88; }
`;

const TableSection = styled.div`
  border-top: 1px solid #e5e7eb;
  padding: 12px 16px;
`;

const TableTitle = styled.h3`
  font-size: 0.8rem;
  font-weight: 700;
  color: #0d9488;
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StatusBadge = styled.span`
  padding: 2px 7px;
  border-radius: 10px;
  font-size: 0.68rem;
  font-weight: 700;
  background: ${({ active }) => (active ? "#dcfce7" : "#fee2e2")};
  color: ${({ active }) => (active ? "#166534" : "#991b1b")};
`;

const MiniBtn = styled.button`
  height: 24px;
  padding: 0 8px;
  font-size: 0.68rem;
  font-weight: 600;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  background: ${({ danger }) => (danger ? "#ef4444" : ({ print: pr }) => pr ? "#7c3aed" : "#0d9488")};
  color: #fff;
  &:disabled { opacity: 0.4; cursor: default; }
  &:hover:not(:disabled) { opacity: 0.85; }
`;

const MiniBtnPrint = styled.button`
  height: 24px;
  padding: 0 8px;
  font-size: 0.68rem;
  font-weight: 600;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  background: #7c3aed;
  color: #fff;
  &:hover { opacity: 0.85; }
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  padding: 10px 16px;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PageTitleEl = styled.h2`
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: 0.04em;
`;

const ClockDisplay = styled.div`
  font-size: 0.75rem;
  color: #ccfbf1;
  font-weight: 600;
  font-family: monospace;
`;

// ─── Room Grid Modal Styles ───────────────────────────────────────────────────

const RoomModalContainer = styled(ModalContainer)`
  max-width: 960px;
  max-height: 88vh;
`;

const RoomModalBody = styled(ModalBody)`
  background: ${colors.background};
  padding: 14px;
`;

/* Filter bar */
const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  align-items: flex-end;
`;

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1 1 120px;
`;

const FilterLabel = styled.label`
  font-size: 0.68rem;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const FilterInput = styled.input`
  height: 28px;
  padding: 0 7px;
  font-size: 0.75rem;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  background: ${colors.surface};
  outline: none;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: ${colors.primary}; }
`;

const FilterBtn = styled.button`
  height: 28px;
  padding: 0 14px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: ${colors.primary};
  color: #fff;
  align-self: flex-end;
  &:hover { background: ${colors.primaryDark}; }
`;

/* Legend */
const LegendBar = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  padding: 6px 12px;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 6px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 500;
  color: ${colors.textMuted};
`;

const LegendDot = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${(p) => p.color};
  flex-shrink: 0;
`;

/* Block section */
const BlockSection = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  margin-bottom: 14px;
  overflow: hidden;
  animation: ${slideUp} 0.25s ease both;
  animation-delay: ${(p) => p.idx * 40}ms;
`;

const BlockHeader = styled.div`
  padding: 7px 12px;
  background: ${colors.tabBg};
  border-bottom: 1px solid ${colors.border};
  font-size: 0.78rem;
  font-weight: 700;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FloorGroup = styled.div`
  padding: 10px 12px;
`;

const FloorLabel = styled.div`
  font-size: 0.68rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${colors.border};
  }
`;

const RoomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 8px;
  margin-bottom: 10px;
`;

/* Room card — colour by status */
const roomColors = {
  available:  { bg: "#f0fdf4", border: "#86efac", header: "#dcfce7", dot: "#22c55e" },
  occupied:   { bg: "#fff1f2", border: "#fca5a5", header: "#fee2e2", dot: "#ef4444" },
  maintenance:{ bg: "#fffbeb", border: "#fcd34d", header: "#fef3c7", dot: "#f59e0b" },
  partial:    { bg: "#eff6ff", border: "#93c5fd", header: "#dbeafe", dot: "#3b82f6" },
};

const RoomCard = styled.div`
  border: 1.5px solid ${(p) => roomColors[p.status]?.border || colors.border};
  border-radius: 7px;
  overflow: hidden;
  cursor: ${(p) => (p.status === "occupied" || p.status === "maintenance") ? "not-allowed" : "pointer"};
  transition: box-shadow 0.18s, transform 0.18s;
  opacity: ${(p) => (p.status === "occupied" || p.status === "maintenance") ? 0.72 : 1};
  background: ${(p) => roomColors[p.status]?.bg || "#fff"};

  ${(p) => (p.status !== "occupied" && p.status !== "maintenance") && `
    &:hover {
      box-shadow: 0 4px 14px rgba(0,0,0,0.13);
      transform: translateY(-2px);
    }
  `}
`;

const RoomCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 8px;
  background: ${(p) => roomColors[p.status]?.header || "#f1f5f9"};
  border-bottom: 1px solid ${(p) => roomColors[p.status]?.border || colors.border};
`;

const RoomNum = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${colors.textMain};
`;

const RoomStatusPill = styled.span`
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  background: ${(p) => roomColors[p.status]?.dot || "#ccc"};
  color: #fff;
  text-transform: capitalize;
`;

const BedRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px 8px;
`;

const BedChip = styled.button`
  flex: 1 1 auto;
  min-width: 44px;
  text-align: center;
  padding: 3px 5px;
  border-radius: 4px;
  font-size: 0.67rem;
  font-weight: 600;
  border: 1.5px solid transparent;
  cursor: ${(p) => p.disabled ? "not-allowed" : "pointer"};
  transition: filter 0.15s, border-color 0.15s;
  color: #fff;
  background: ${(p) =>
    p.bedStatus === "Available" ? "#22c55e"
    : p.bedStatus === "Occupied" ? "#ef4444"
    : "#f59e0b"};
  opacity: ${(p) => p.disabled ? 0.55 : 1};

  &:hover:not(:disabled) {
    filter: brightness(1.1);
    border-color: rgba(0,0,0,0.2);
  }
`;

/* Room type tag */
const RoomType = styled.span`
  font-size: 0.6rem;
  color: ${colors.textMuted};
  padding: 0 8px 4px;
  display: block;
`;

/* Skeleton */
const Skeleton = styled.div`
  height: 100px;
  border-radius: 7px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: ${pulse} 1.4s ease-in-out infinite;
`;

// ─── Print Style ──────────────────────────────────────────────────────────────
const PRINT_STYLE = `
  @media print {
    body * { visibility: hidden !important; }
    #admission-print-slip, #admission-print-slip * { visibility: visible !important; }
    #admission-print-slip {
      position: fixed !important;
      left: 0; top: 0;
      width: 100vw;
      padding: 0;
      margin: 0;
    }
  }
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  uhid: "", ipNumber: "", admittingDoctor: "", consultingDoctor: "",
  roomNo: "", bedNo: "", reasonForAdmission: "", packageName: "",
  mlc_type: "", mlc_doc: null, mlc_remarks: "",
  salutation: "", firstName: "", middleName: "", lastName: "",
  age: "", gender: "", phone: "", permanent_address: "",
  area: "", zipcode: "", city: "", state: "",
  customerType: "", insuranceCompany: "", privilegedCustomerId: "",
};

// ─── Room status helpers ───────────────────────────────────────────────────────
function getRoomStatus(beds) {
  if (!beds || beds.length === 0) return "available";
  const statuses = beds.map((b) => b.status);
  const allOcc  = statuses.every((s) => s === "Occupied");
  const allMaint= statuses.every((s) => s === "Maintenance");
  const anyOcc  = statuses.some((s) => s === "Occupied");
  const anyAvail= statuses.some((s) => s === "Available");
  if (allMaint) return "maintenance";
  if (allOcc)   return "occupied";
  if (anyOcc && anyAvail) return "partial";
  return "available";
}

// ─── Component ────────────────────────────────────────────────────────────────
const Admission = () => {
  const [formData, setFormData]   = useState(EMPTY_FORM);
  const [doctors, setDoctors]     = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [now, setNow]             = useState(new Date());

  // Room modal
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomFilter, setRoomFilter]       = useState({ room_number: "", block: "", floor: "" });
  const [allRooms, setAllRooms]           = useState([]);   // raw flat list from API
  const [loadingRooms, setLoadingRooms]   = useState(false);

  // Bed modal
  const [showBedModal, setShowBedModal]   = useState(false);
  const [selectedRoom, setSelectedRoom]   = useState(null);

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchNextIpNumber();
    fetchDoctors();
    fetchAdmissions();
    const style = document.createElement("style");
    style.innerHTML = PRINT_STYLE;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatClock = (d) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate  = (d) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const getDoctorName = (id) => {
    const doc = doctors.find((d) => String(d.employeeId) === String(id));
    return doc ? doc.employeeName : id;
  };

  // ── Fetches ────────────────────────────────────────────────────────────────
  const fetchDoctors = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}autoipNumber/`, "GET");
      if (response.success) {
        setFormData(prev => ({ ...prev, ipNumber: response.data.next_ipNumber }));
      } else {
        throw new Error(response.error || "Failed to fetch IP number");
      }
    } catch (error) {
      console.error("Error fetching IP number:", error.message);
      toast.error("Error fetching IP number");
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
      if (response.success) {
        setDoctors(response.data || []);
      } else {
        throw new Error(response.error || "Failed to fetch doctors");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error.message);
      toast.error("Error fetching doctors");
    }
  };

  // Load ALL rooms (no filter) once when modal opens
  const fetchAllRooms = async (filterOverride = {}) => {
    setLoadingRooms(true);
    try {
      const f = { ...roomFilter, ...filterOverride };
      const params = new URLSearchParams();
      if (f.room_number) params.append("room_number", f.room_number);
      if (f.block)       params.append("block", f.block);
      if (f.floor)       params.append("floor", f.floor);
      const q = params.toString() ? `?${params.toString()}` : "";
      const res = await apiRequest(`${HmsBaseUrl}search-rooms/${q}`, "GET");
      // The API returns a flat list; we group by block → floor
      setAllRooms(Array.isArray(res) ? res : (res.data || []));
    } catch {
      setAllRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  } catch (error) {
    console.error("Error searching rooms:", error.message);
    toast.error("Failed to search rooms");
    setRoomResults([]);
  } finally {
    setLoadingRooms(false);
  }
};

  const openRoomModal = () => {
    setShowRoomModal(true);
    fetchAllRooms();
  };

  // ── Group rooms: block → floor → [rooms] ──────────────────────────────────
  const groupedRooms = (() => {
    const grouped = {};
    allRooms.forEach((room) => {
      const block = room.block || "UNKNOWN";
      const floor = room.floor ?? "?";
      if (!grouped[block]) grouped[block] = {};
      if (!grouped[block][floor]) grouped[block][floor] = [];
      grouped[block][floor].push(room);
    });
    return grouped;
  })();

  // ── Room / Bed selection ───────────────────────────────────────────────────
  const handleRoomClick = (room) => {
    const status = getRoomStatus(room.beds);
    if (status === "occupied" || status === "maintenance") return;
    setSelectedRoom(room);
    setShowRoomModal(false);
    setShowBedModal(true);
  };

  const handleBedSelect = (bedNumber) => {
    setFormData((prev) => ({ ...prev, roomNo: selectedRoom.room_number, bedNo: bedNumber }));
    setShowBedModal(false);
    toast.success(`Room ${selectedRoom.room_number} / Bed ${bedNumber} selected`);
  };

  // ── Patient lookup ─────────────────────────────────────────────────────────
  const fetchPatientByUHID = async () => {
    if (!formData.uhid) return toast.warning("Enter UHID");
    try {
      const already = admissions.find((a) => a.uhid === formData.uhid && a.is_active !== false);
      if (already) toast.error(`Patient already admitted (IP: ${already.ipNumber})`);
      const res = await apiRequest(`${HmsBaseUrl}op-patient/${encodeURIComponent(formData.uhid)}/`, "GET");
      if (!res.success) throw new Error(res.error || "Not found");
      const d = res.data;
      setFormData((prev) => ({ ...prev, ...d }));
      toast.success("Patient details loaded");
    } catch { toast.error("Patient not found"); }
  };

  const fetchAdmissionByIP = async () => {
    if (!formData.ipNumber) return toast.warning("Enter IP Number");
    try {
      const res = await apiRequest(`${HmsBaseUrl}admission/?ip_number=${encodeURIComponent(formData.ipNumber)}`, "GET");
      if (!res.success) throw new Error();
      const list = res.data || [];
      if (!list.length) return toast.error("No admission found");
      const adm = list[0];
      setEditingId(adm._id || adm.id);
      setFormData({ ...EMPTY_FORM, ...adm });
      toast.success(`Loaded: ${adm.ipNumber}`);
    } catch { toast.error("Admission not found"); }
  };

  // ── Form ───────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "file" ? files[0] : value }));
  };

  const handleReset  = () => { setFormData(EMPTY_FORM); setEditingId(null); setLastSaved(null); };
  const handleEdit   = (adm) => {
    setEditingId(adm._id || adm.id);
    setFormData({ ...EMPTY_FORM, ...adm });
    window.scrollTo(0, 0);
    toast.info("Editing admission");
  };
  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this admission?")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}admission/${id}/`, "DELETE");
      if (res.success) { toast.success("Admission cancelled"); fetchAdmissions(); }
    } catch { toast.error("Failed to cancel"); }
  };

  const handleSubmit = async () => {
    if (!formData.uhid)            return toast.warning("UHID is required");
    if (!formData.admittingDoctor) return toast.warning("Admitting Doctor is required");
    if (!formData.roomNo)          return toast.warning("Room is required");
    if (!formData.bedNo)           return toast.warning("Bed is required");

    const admissionDateTime = now.toISOString();
    const payload = new FormData();
    ["uhid","admittingDoctor","consultingDoctor","roomNo","bedNo",
     "reasonForAdmission","packageName","mlc_type","mlc_remarks"].forEach((k) => {
      if (formData[k]) payload.append(k, formData[k]);
    });
    payload.append("admissionDateTime", admissionDateTime);
    if (formData.mlc_doc instanceof File) payload.append("mlc_doc", formData.mlc_doc);

    try {
      const url  = editingId ? `${HmsBaseUrl}admission/${editingId}/` : `${HmsBaseUrl}admission/`;
      const meth = editingId ? "PUT" : "POST";
      const res  = await apiRequest(url, meth, payload);
      if (res.success) {
        toast.success(editingId ? "Updated!" : "Saved!");
        setLastSaved({
          ...res.data,
          ...formData,
          admittingDoctorName: getDoctorName(formData.admittingDoctor),
          admissionDateTime,
        });
        fetchAdmissions();
      } else throw new Error(res.error);
    } catch { toast.error("Failed to save admission"); }
  };

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = (admData) => {
    const printData = admData || lastSaved;
    if (!printData) return;
    const patientName = [printData.salutation,printData.firstName,printData.middleName,printData.lastName].filter(Boolean).join(" ");
    const admDT = printData.admissionDateTime ? new Date(printData.admissionDateTime) : new Date();
    const barcodeLines = generateBarcodeSVG(printData.ipNumber || "");
    const pw = window.open("", "_blank", "width=600,height=400");
    pw.document.write(`<!DOCTYPE html><html><head><title>IP Admission Slip</title>
      <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;font-size:13px;padding:20px;}
      .slip{width:540px;margin:0 auto;border:1px solid #000;padding:16px;}
      .row{display:flex;justify-content:space-between;margin-bottom:12px;}
      .bold{font-weight:bold;}.big{font-size:18px;font-weight:bold;}
      @media print{body{padding:0;}.slip{border:none;}}
      </style></head><body><div class="slip"><div class="row">
      <div class="left">${barcodeLines}<div class="bold">${patientName}</div>
      <div>${printData.age||""} ${printData.gender||""}</div>
      <div>${printData.permanent_address||""}</div>
      <div>${[printData.area,printData.city,printData.state].filter(Boolean).join(", ")}</div>
      <div>${printData.phone||""}</div>
      <div>Admitted: ${printData.admittingDoctorName||""}</div></div>
      <div class="right"><div class="big">IP NO: ${printData.ipNumber||""}</div>
      <div class="bold">${printData.customerType||""}</div>
      <div>UHID: ${printData.uhid||""}</div>
      <div>DOA: ${admDT.toLocaleDateString("en-IN")}</div>
      <div>TIME: ${admDT.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})}</div>
      <div>Room: ${printData.roomNo||""} / Bed: ${printData.bedNo||""}</div>
      </div></div></div>
      <script>window.onload=function(){window.print();window.close();};</script>
      </body></html>`);
    pw.document.close();
  };

  const generateBarcodeSVG = (text) => {
    if (!text) return "";
    const w = 220, h = 50; let bars = "", x = 0;
    text.split("").forEach((ch, i) => {
      const code = ch.charCodeAt(0);
      for (let b = 0; b < 4; b++) {
        const bw = ((code >> b) & 1) ? 3 : 1.5;
        if (i % 2 === 0) bars += `<rect x="${x.toFixed(1)}" y="0" width="${bw}" height="${h}" fill="black"/>`;
        x += bw + 1;
        if (x > w - 10) break;
      }
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${bars}</svg>`;
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container style={{ padding: 0 }}>

        {/* Header */}
        <PageHeader>
          <PageTitleEl>{editingId ? "✏️ Edit Admission" : "🏥 New Admission"}</PageTitleEl>
          <ClockDisplay>{formatDate(now)} &nbsp; {formatClock(now)}</ClockDisplay>
        </PageHeader>

        <FormGrid>

          {/* Patient Search */}
          <Field span={2}>
            <Lbl required>UHID</Lbl>
            <InputRow>
              <Inp name="uhid" value={formData.uhid} onChange={handleChange} placeholder="Enter UHID" readOnly={!!editingId} />
              <IconBtn type="button" onClick={fetchPatientByUHID}>🔍 Search</IconBtn>
            </InputRow>
          </Field>

          <Field span={2}>
            <Lbl>IP Number</Lbl>
            <InputRow>
              <Inp name="ipNumber" value={formData.ipNumber} onChange={handleChange} placeholder="Search by IP" readOnly={!editingId} />
              <IconBtn type="button" onClick={fetchAdmissionByIP}>🔍</IconBtn>
            </InputRow>
          </Field>

          <Field span={2}>
            <Lbl>Date &amp; Time</Lbl>
            <Inp value={`${formatDate(now)}  ${formatClock(now)}`} readOnly style={{ fontFamily: "monospace", background: "#f3f4f6" }} />
          </Field>

          {/* Patient Info */}
          <SectionDivider>Patient Details (auto-filled from UHID)</SectionDivider>

          <Field span={3}>
            <Lbl>Patient Name</Lbl>
            <Inp value={[formData.salutation,formData.firstName,formData.middleName,formData.lastName].filter(Boolean).join(" ")} readOnly />
          </Field>
          <Field><Lbl>Age</Lbl><Inp value={formData.age} readOnly /></Field>
          <Field><Lbl>Gender</Lbl><Inp value={formData.gender} readOnly /></Field>
          <Field><Lbl>Customer Type</Lbl><Inp value={formData.customerType} readOnly /></Field>

          <Field span={2}><Lbl>Insurance Company</Lbl><Inp value={formData.insuranceCompany} readOnly /></Field>
          <Field span={2}><Lbl>Privileged Customer ID</Lbl><Inp value={formData.privilegedCustomerId} readOnly /></Field>
          <Field span={2}><Lbl>Phone</Lbl><Inp value={formData.phone} readOnly /></Field>

          <Field span={3}><Lbl>Permanent Address</Lbl><Inp value={formData.permanent_address} readOnly /></Field>
          <Field span={2}><Lbl>Area</Lbl><Inp value={formData.area} readOnly /></Field>
          <Field><Lbl>City</Lbl><Inp value={formData.city} readOnly /></Field>
          <Field><Lbl>State</Lbl><Inp value={formData.state} readOnly /></Field>
          <Field><Lbl>Zip</Lbl><Inp value={formData.zipcode} readOnly /></Field>

          {/* Clinical */}
          <SectionDivider>Clinical</SectionDivider>

          <Field span={3}>
            <Lbl required>Admitting Doctor</Lbl>
            <Sel name="admittingDoctor" value={formData.admittingDoctor} onChange={handleChange}>
              <option value="">Select Doctor</option>
              {doctors.map((d) => <option key={d.employeeId} value={d.employeeId}>{d.employeeName}</option>)}
            </Sel>
          </Field>

          <Field span={3}>
            <Lbl>Consulting Doctor</Lbl>
            <Sel name="consultingDoctor" value={formData.consultingDoctor} onChange={handleChange}>
              <option value="">Select Doctor</option>
              {doctors.map((d) => <option key={d.employeeId} value={d.employeeId}>{d.employeeName}</option>)}
            </Sel>
          </Field>

          {/* Room & Bed — visual picker */}
          <SectionDivider>Room &amp; Bed</SectionDivider>

          <Field span={2}>
            <Lbl required>Room No.</Lbl>
            <InputRow>
              <Inp name="roomNo" value={formData.roomNo} onChange={handleChange} placeholder="Click 🔍 to pick" />
              <IconBtn type="button" onClick={openRoomModal}>🔍</IconBtn>
            </InputRow>
          </Field>

          <Field span={2}>
            <Lbl required>Bed No.</Lbl>
            <Inp name="bedNo" value={formData.bedNo} readOnly placeholder="Auto-filled on bed select" style={{ background: "#f3f4f6" }} />
          </Field>

          {/* Reason & Package */}
          <Field span={3}>
            <Lbl>Reason for Admission</Lbl>
            <Txta name="reasonForAdmission" value={formData.reasonForAdmission} onChange={handleChange} rows={2} />
          </Field>

          <Field span={3}>
            <Lbl>Package Name</Lbl>
            <Sel name="packageName" value={formData.packageName} onChange={handleChange}>
              <option value=""></option>
              <option>General Package</option>
              <option>ECHS Package</option>
              <option>Insurance Package</option>
            </Sel>
          </Field>

          {/* MLC */}
          <SectionDivider>MLC (if applicable)</SectionDivider>

          <Field span={2}>
            <Lbl>MLC Type</Lbl>
            <Sel name="mlc_type" value={formData.mlc_type} onChange={handleChange}>
              <option value=""></option>
              <option value="Accident">Accident</option>
              <option value="Assault">Assault</option>
              <option value="Other">Other</option>
            </Sel>
          </Field>

          <Field span={2}>
            <Lbl>MLC Document</Lbl>
            <Inp type="file" name="mlc_doc" onChange={handleChange} style={{ paddingTop: 3, height: "auto" }} />
          </Field>

          <Field span={2}>
            <Lbl>MLC Remarks</Lbl>
            <Txta name="mlc_remarks" value={formData.mlc_remarks} onChange={handleChange} rows={2} />
          </Field>

        </FormGrid>

        <ActionBar>
          {lastSaved && <PrintBtn onClick={() => handlePrint(lastSaved)}>🖨️ Print Slip</PrintBtn>}
          <SmBtn secondary onClick={handleReset}>↺ Reset</SmBtn>
          <SmBtn onClick={handleSubmit}>{editingId ? "💾 Update" : "💾 Save Admission"}</SmBtn>
        </ActionBar>

        {/* Admitted Patients Table */}
        <TableSection>
          <TableTitle>Admitted Patients</TableTitle>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>UHID</Th><Th>IP Number</Th><Th>Patient Name</Th>
                  <Th>Adm. Date &amp; Time</Th><Th>Room / Bed</Th>
                  <Th>Doctor</Th><Th>Status</Th><Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {admissions.length === 0 ? (
                  <Tr><Td colSpan="8" style={{ textAlign:"center", padding:"24px" }}>No admissions found</Td></Tr>
                ) : admissions.map((adm, idx) => (
                  <Tr key={idx}>
                    <Td>{adm.uhid}</Td>
                    <Td>{adm.ipNumber}</Td>
                    <Td>{[adm.salutation,adm.firstName,adm.middleName,adm.lastName].filter(Boolean).join(" ") || "-"}</Td>
                    <Td>{adm.admissionDateTime ? new Date(adm.admissionDateTime).toLocaleString("en-IN") : "-"}</Td>
                    <Td>{`${adm.roomNo||"-"} / ${adm.bedNo||"-"}`}</Td>
                    <Td>{adm.admittingDoctorName || getDoctorName(adm.admittingDoctor) || "-"}</Td>
                    <Td><StatusBadge active={adm.is_active !== false}>{adm.is_active !== false ? "Active" : "Cancelled"}</StatusBadge></Td>
                    <Td>
                      <div style={{ display:"flex", gap:5 }}>
                        <MiniBtn onClick={() => handleEdit(adm)} disabled={adm.is_active === false}>✏️ Edit</MiniBtn>
                        <MiniBtnPrint onClick={() => handlePrint(adm)}>🖨️</MiniBtnPrint>
                        <MiniBtn danger onClick={() => handleCancel(adm._id || adm.id)} disabled={adm.is_active === false}>🗑️ Cancel</MiniBtn>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </TableSection>

      </Container>

      {/* ════════════════════════════════════════════════════════
          VISUAL ROOM PICKER MODAL
      ════════════════════════════════════════════════════════ */}
      {showRoomModal && (
        <ModalOverlay onClick={() => setShowRoomModal(false)}>
          <RoomModalContainer onClick={(e) => e.stopPropagation()}>

            <ModalHeader>
              <ModalTitle>🏨 Select Room</ModalTitle>
              <CloseButton onClick={() => setShowRoomModal(false)}>×</CloseButton>
            </ModalHeader>

            <RoomModalBody>

              {/* Filter Bar */}
              <FilterBar>
                <FilterField>
                  <FilterLabel>Room Number</FilterLabel>
                  <FilterInput
                    placeholder="e.g. 101"
                    value={roomFilter.room_number}
                    onChange={(e) => setRoomFilter((p) => ({ ...p, room_number: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && fetchAllRooms()}
                  />
                </FilterField>
                <FilterField>
                  <FilterLabel>Block</FilterLabel>
                  <FilterInput
                    placeholder="e.g. A"
                    value={roomFilter.block}
                    onChange={(e) => setRoomFilter((p) => ({ ...p, block: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && fetchAllRooms()}
                  />
                </FilterField>
                <FilterField>
                  <FilterLabel>Floor</FilterLabel>
                  <FilterInput
                    type="number"
                    placeholder="e.g. 2"
                    value={roomFilter.floor}
                    onChange={(e) => setRoomFilter((p) => ({ ...p, floor: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && fetchAllRooms()}
                  />
                </FilterField>
                <FilterBtn onClick={() => fetchAllRooms()}>Search</FilterBtn>
                <FilterBtn
                  onClick={() => { setRoomFilter({ room_number:"", block:"", floor:"" }); fetchAllRooms({ room_number:"", block:"", floor:"" }); }}
                  style={{ background: colors.textMuted }}
                >
                  Clear
                </FilterBtn>
              </FilterBar>

              {/* Legend */}
              <LegendBar>
                <LegendItem><LegendDot color="#22c55e" />Available (click to select)</LegendItem>
                <LegendItem><LegendDot color="#3b82f6" />Partially Available (click to select bed)</LegendItem>
                <LegendItem><LegendDot color="#ef4444" />Fully Occupied</LegendItem>
                <LegendItem><LegendDot color="#f59e0b" />Maintenance</LegendItem>
              </LegendBar>

              {/* Room Grid */}
              {loadingRooms ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))", gap:8 }}>
                  {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} />)}
                </div>
              ) : Object.keys(groupedRooms).length === 0 ? (
                <NoResults>No rooms found.</NoResults>
              ) : (
                Object.entries(groupedRooms).map(([block, floors], bIdx) => (
                  <BlockSection key={block} idx={bIdx}>
                    <BlockHeader>🏢 Block {block}</BlockHeader>
                    {Object.entries(floors).sort(([a],[b]) => Number(a)-Number(b)).map(([floor, rooms]) => (
                      <FloorGroup key={floor}>
                        <FloorLabel>Floor {floor}</FloorLabel>
                        <RoomGrid>
                          {rooms.map((room) => {
                            const status = getRoomStatus(room.beds);
                            return (
                              <RoomCard
                                key={room.room_number}
                                status={status}
                                onClick={() => handleRoomClick(room)}
                                title={
                                  status === "occupied"    ? "Room fully occupied — cannot select" :
                                  status === "maintenance" ? "Room under maintenance — cannot select" :
                                  status === "partial"     ? "Partially available — click to choose a bed" :
                                  "Available — click to choose a bed"
                                }
                              >
                                <RoomCardTop status={status}>
                                  <RoomNum>{room.room_number}</RoomNum>
                                  <RoomStatusPill status={status}>
                                    {status === "partial" ? "Partial" : status}
                                  </RoomStatusPill>
                                </RoomCardTop>
                                <RoomType>{room.room_type}{room.room_category ? ` · ${room.room_category}` : ""}</RoomType>
                                <BedRow>
                                  {(room.beds || []).map((bed, i) => (
                                    <BedChip
                                      key={i}
                                      bedStatus={bed.status}
                                      disabled={bed.status !== "Available"}
                                      title={`Bed ${bed.bed_number} — ${bed.status}`}
                                      onClick={(e) => {
                                        // If clicking directly on an available bed chip, skip room modal selection step
                                        if (bed.status === "Available") {
                                          e.stopPropagation();
                                          setSelectedRoom(room);
                                          handleBedSelect(bed.bed_number);
                                          setShowRoomModal(false);
                                        }
                                      }}
                                    >
                                      {bed.bed_number}
                                    </BedChip>
                                  ))}
                                </BedRow>
                              </RoomCard>
                            );
                          })}
                        </RoomGrid>
                      </FloorGroup>
                    ))}
                  </BlockSection>
                ))
              )}
            </RoomModalBody>
          </RoomModalContainer>
        </ModalOverlay>
      )}

      {/* ── Bed Select Modal (fallback if room card clicked without direct bed tap) ── */}
      {showBedModal && selectedRoom && (
        <ModalOverlay onClick={() => setShowBedModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <ModalHeader>
              <ModalTitle>Select Bed — Room {selectedRoom.room_number}</ModalTitle>
              <CloseButton onClick={() => setShowBedModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10, padding:12 }}>
                {(selectedRoom.beds || []).map((bed, i) => {
                  const avail = bed.status === "Available";
                  return (
                    <BedChip
                      key={i}
                      bedStatus={bed.status}
                      disabled={!avail}
                      style={{ minWidth:70, height:42, fontSize:"0.82rem", flex:"1 1 70px" }}
                      onClick={() => avail && handleBedSelect(bed.bed_number)}
                      title={`${bed.bed_number} — ${bed.status}`}
                    >
                      {bed.bed_number}
                      <br />
                      <span style={{ fontSize:"0.6rem", opacity:0.85 }}>{bed.status}</span>
                    </BedChip>
                  );
                })}
                {(!selectedRoom.beds || selectedRoom.beds.length === 0) && (
                  <NoResults>No beds configured for this room.</NoResults>
                )}
              </div>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}

    </PageWrapper>
  );
};

export default Admission;