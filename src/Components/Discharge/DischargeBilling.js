import { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../../Auth/apiRequest";
import {
  PageWrapper, Container, Button, TableWrapper, Table, Th, Td, Tr,
  ModalOverlay, ModalContainer, ModalHeader, ModalTitle,
  CloseButton, ModalBody, NoResults, colors,
} from "../GlobalStyles";

// ─── Animations ───────────────────────────────────────────────────────────────
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
`;
const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────
const PageHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 60%, #065f46 100%);
  padding: 12px 20px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(13,148,136,0.3);
`;
const PageTitle = styled.h2`
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.03em;
`;
const ClockDisplay = styled.div`
  font-size: 0.75rem;
  color: #ccfbf1;
  font-weight: 600;
  font-family: monospace;
  background: rgba(255,255,255,0.12);
  padding: 4px 10px;
  border-radius: 20px;
`;

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = styled.div`
  margin: 0 14px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  animation: ${slideUp} 0.3s ease both;
  animation-delay: ${p => p.delay || 0}ms;
`;
const SectionHead = styled.div`
  background: linear-gradient(90deg, #f0fdf9 0%, #e0f2f1 100%);
  padding: 7px 14px;
  border-bottom: 1px solid #ccfbf1;
  font-size: 0.72rem;
  font-weight: 700;
  color: #0d9488;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 6px;
`;
const SectionBody = styled.div`
  padding: 10px 14px 12px;
`;

// ─── Form Grid ────────────────────────────────────────────────────────────────
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px 12px;
  align-items: end;
`;
const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  grid-column: span ${p => p.span || 1};
`;
const Lbl = styled.label`
  font-size: 0.68rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  &::after {
    content: ${p => p.required ? '" *"' : '""'};
    color: #ef4444;
    font-size: 0.75rem;
  }
`;
const Inp = styled.input`
  height: 30px;
  padding: 0 8px;
  font-size: 0.78rem;
  border: 1.5px solid ${p => p.error ? '#ef4444' : '#d1d5db'};
  border-radius: 5px;
  background: ${p => p.readOnly ? '#f8fafc' : '#fff'};
  color: #111827;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.18s, box-shadow 0.18s;
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.12); }
`;
const Sel = styled.select`
  height: 30px;
  padding: 0 6px;
  font-size: 0.78rem;
  border: 1.5px solid #d1d5db;
  border-radius: 5px;
  background: #fff;
  color: #111827;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.18s;
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.12); }
`;
const Txta = styled.textarea`
  padding: 6px 8px;
  font-size: 0.78rem;
  border: 1.5px solid #d1d5db;
  border-radius: 5px;
  resize: vertical;
  min-height: 48px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.18s;
  &:focus { border-color: #0d9488; outline: none; box-shadow: 0 0 0 3px rgba(13,148,136,0.12); }
`;
const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
const IconBtn = styled.button`
  height: 30px;
  padding: 0 10px;
  font-size: 0.72rem;
  font-weight: 600;
  background: #0d9488;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.18s;
  &:hover { background: #0f766e; }
  &:disabled { opacity: 0.5; cursor: default; }
`;

// ─── Patient Info Card ────────────────────────────────────────────────────────
const PatientCard = styled.div`
  background: linear-gradient(135deg, #f0fdf9 0%, #e0f2f1 100%);
  border: 1.5px solid #99f6e4;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 2px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px 14px;
  animation: ${slideUp} 0.25s ease;
`;
const PatInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;
const PatLabel = styled.span`
  font-size: 0.64rem;
  font-weight: 700;
  color: #0f766e;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
const PatValue = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #134e4a;
`;

// ─── Action Bar ───────────────────────────────────────────────────────────────
const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 14px 14px;
`;
const SaveBtn = styled.button`
  height: 34px;
  padding: 0 20px;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: #fff;
  box-shadow: 0 2px 8px rgba(13,148,136,0.35);
  transition: all 0.18s;
  &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(13,148,136,0.45); }
  &:active { transform: translateY(0); }
`;
const ResetBtn = styled.button`
  height: 34px;
  padding: 0 16px;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  border: 1.5px solid #e2e8f0;
  cursor: pointer;
  background: #fff;
  color: #64748b;
  transition: all 0.18s;
  &:hover { border-color: #94a3b8; color: #334155; }
`;
const PrintBtn = styled.button`
  height: 34px;
  padding: 0 16px;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: #fff;
  box-shadow: 0 2px 8px rgba(124,58,237,0.3);
  transition: all 0.18s;
  &:hover { transform: translateY(-1px); }
`;

// ─── Table ────────────────────────────────────────────────────────────────────
const TableSection = styled.div`
  margin: 0 0 0 0;
  border-top: 2px solid #e0f2f1;
  padding: 14px 14px;
  background: #f8fafc;
`;
const TableTitle = styled.h3`
  font-size: 0.82rem;
  font-weight: 700;
  color: #0d9488;
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 6px;
`;
const StatusBadge = styled.span`
  padding: 2px 9px;
  border-radius: 12px;
  font-size: 0.68rem;
  font-weight: 700;
  background: ${p => p.active ? '#dcfce7' : '#fee2e2'};
  color: ${p => p.active ? '#166534' : '#991b1b'};
`;
const MiniBtn = styled.button`
  height: 25px;
  padding: 0 9px;
  font-size: 0.68rem;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: ${p => p.danger ? '#ef4444' : p.purple ? '#7c3aed' : '#0d9488'};
  color: #fff;
  transition: opacity 0.15s;
  &:disabled { opacity: 0.35; cursor: default; }
  &:hover:not(:disabled) { opacity: 0.82; }
`;

// ─── Room Modal ───────────────────────────────────────────────────────────────
const RoomModalContainer = styled(ModalContainer)`
  max-width: 980px;
  max-height: 90vh;
`;
const RoomModalBody = styled(ModalBody)`
  background: ${colors.background};
  padding: 14px;
`;
const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  align-items: flex-end;
`;
const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1 1 110px;
`;
const FilterLabel = styled.label`
  font-size: 0.66rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;
const FilterInput = styled.input`
  height: 28px;
  padding: 0 7px;
  font-size: 0.75rem;
  border: 1px solid ${colors.border};
  border-radius: 5px;
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
  border-radius: 5px;
  border: none;
  cursor: pointer;
  background: ${p => p.muted ? colors.textMuted : colors.primary};
  color: #fff;
  align-self: flex-end;
  transition: opacity 0.15s;
  &:hover { opacity: 0.85; }
`;
const LegendBar = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding: 6px 12px;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 6px;
`;
const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  font-weight: 500;
  color: ${colors.textMuted};
`;
const LegendDot = styled.span`
  width: 12px; height: 12px;
  border-radius: 3px;
  background: ${p => p.color};
  flex-shrink: 0;
`;
const BlockSection = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  animation: ${slideUp} 0.22s ease both;
  animation-delay: ${p => p.idx * 35}ms;
`;
const BlockHeader = styled.div`
  padding: 7px 12px;
  background: linear-gradient(90deg, #e0f2f1, #f0fdf9);
  border-bottom: 1px solid ${colors.border};
  font-size: 0.78rem;
  font-weight: 700;
  color: ${colors.primary};
`;
const FloorGroup = styled.div`padding: 10px 12px;`;
const FloorLabel = styled.div`
  font-size: 0.66rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  &::after { content: ""; flex: 1; height: 1px; background: ${colors.border}; }
`;
const RoomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 8px;
  margin-bottom: 8px;
`;
const roomColors = {
  available:   { bg: "#f0fdf4", border: "#86efac", header: "#dcfce7" },
  occupied:    { bg: "#fff1f2", border: "#fca5a5", header: "#fee2e2" },
  maintenance: { bg: "#fffbeb", border: "#fcd34d", header: "#fef3c7" },
  partial:     { bg: "#eff6ff", border: "#93c5fd", header: "#dbeafe" },
};
const RoomCard = styled.div`
  border: 1.5px solid ${p => roomColors[p.status]?.border || colors.border};
  border-radius: 7px;
  overflow: hidden;
  cursor: ${p => (p.status === "occupied" || p.status === "maintenance") ? "not-allowed" : "pointer"};
  opacity: ${p => (p.status === "occupied" || p.status === "maintenance") ? 0.68 : 1};
  background: ${p => roomColors[p.status]?.bg || "#fff"};
  transition: box-shadow 0.18s, transform 0.18s;
  ${p => (p.status !== "occupied" && p.status !== "maintenance") && `
    &:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.12); transform: translateY(-2px); }
  `}
`;
const RoomCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 8px;
  background: ${p => roomColors[p.status]?.header || "#f1f5f9"};
  border-bottom: 1px solid ${p => roomColors[p.status]?.border || colors.border};
`;
const RoomNum = styled.span`font-size: 0.78rem; font-weight: 700; color: ${colors.textMain};`;
const RoomStatusPill = styled.span`
  font-size: 0.58rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  background: ${p =>
    p.status === "available" ? "#22c55e" :
    p.status === "occupied"  ? "#ef4444" :
    p.status === "partial"   ? "#3b82f6" : "#f59e0b"};
  color: #fff;
  text-transform: capitalize;
`;
const RoomType = styled.span`font-size: 0.6rem; color: ${colors.textMuted}; padding: 0 8px 4px; display: block;`;
const BedRow = styled.div`display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px;`;
const BedChip = styled.button`
  flex: 1 1 auto;
  min-width: 42px;
  text-align: center;
  padding: 3px 4px;
  border-radius: 4px;
  font-size: 0.66rem;
  font-weight: 600;
  border: 1.5px solid transparent;
  cursor: ${p => p.disabled ? "not-allowed" : "pointer"};
  color: #fff;
  background: ${p =>
    p.bedStatus === "Available" ? "#22c55e" :
    p.bedStatus === "Occupied"  ? "#ef4444" : "#f59e0b"};
  opacity: ${p => p.disabled ? 0.5 : 1};
  transition: filter 0.15s, border-color 0.15s;
  &:hover:not(:disabled) { filter: brightness(1.1); border-color: rgba(0,0,0,0.2); }
`;
const SkeletonCard = styled.div`
  height: 100px;
  border-radius: 7px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY = {
  uhid: "", ipNumber: "", admittingDoctor: "", consultingDoctor: "",
  roomNo: "", bedNo: "", reasonForAdmission: "", packageName: "",
  mlc_type: "", mlc_doc: null, mlc_remarks: "",
  salutation: "", firstName: "", middleName: "", lastName: "",
  age: "", gender: "", phone: "", permanent_address: "",
  area: "", zipcode: "", city: "", state: "",
  customerType: "", insuranceCompany: "", insuranceCompanyName: "",
  company_id: "", privilegedCustomerId: "",
};

function getRoomStatus(beds) {
  if (!beds || !beds.length) return "available";
  const s = beds.map(b => b.status);
  if (s.every(x => x === "Occupied"))    return "occupied";
  if (s.every(x => x === "Maintenance")) return "maintenance";
  if (s.some(x => x === "Occupied") && s.some(x => x === "Available")) return "partial";
  return "available";
}

// ─── Component ────────────────────────────────────────────────────────────────
const Admission = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [form,       setForm]       = useState(EMPTY);
  const [editingIP,  setEditingIP]  = useState(null); // ip_number for edit
  const [lastSaved,  setLastSaved]  = useState(null);
  const [now,        setNow]        = useState(new Date());

  const [doctors,    setDoctors]    = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [packages,   setPackages]   = useState([]);

  // Room modal
  const [showRoomModal,  setShowRoomModal]  = useState(false);
  const [roomFilter,     setRoomFilter]     = useState({ room_number: "", block: "", floor: "" });
  const [allRooms,       setAllRooms]       = useState([]);
  const [loadingRooms,   setLoadingRooms]   = useState(false);

  // Bed modal
  const [showBedModal,   setShowBedModal]   = useState(false);
  const [selectedRoom,   setSelectedRoom]   = useState(null);

  // Search loading flags
  const [searchingUHID,  setSearchingUHID]  = useState(false);
  const [searchingIP,    setSearchingIP]    = useState(false);

  // ── Clock ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchDoctors();
    fetchAdmissions();
    fetchPackages();
  }, []);

  const formatClock = d => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate  = d => d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const getDoctorName = id => {
    const doc = doctors.find(d => String(d.employeeId) === String(id));
    return doc ? doc.employeeName : id;
  };

  // ── Fetches ───────────────────────────────────────────────────────────────
  const fetchDoctors = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
      if (res.success) setDoctors(res.data || []);
    } catch {}
  };

  const fetchAdmissions = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}admission/`, "GET");
      if (res.success) setAdmissions(res.data || []);
    } catch {}
  };

  const fetchPackages = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}packages/`, "GET");
      if (res.success) setPackages(res.packages || []);
    } catch {}
  };

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
      setAllRooms(Array.isArray(res) ? res : (res.data || []));
    } catch {
      setAllRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  // ── Group rooms ───────────────────────────────────────────────────────────
  const groupedRooms = (() => {
    const g = {};
    allRooms.forEach(room => {
      const b = room.block || "MAIN";
      const f = room.floor ?? "G";
      if (!g[b]) g[b] = {};
      if (!g[b][f]) g[b][f] = [];
      g[b][f].push(room);
    });
    return g;
  })();

  // ── Search by UHID ────────────────────────────────────────────────────────
  const handleSearchByUHID = async () => {
    const uhid = form.uhid.trim();
    if (!uhid) return toast.warning("Enter UHID");
    setSearchingUHID(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}op-patient/${encodeURIComponent(uhid)}/`, "GET");
      if (res.already_admitted) {
        toast.error(res.error);
        return;
      }
      if (!res.success) throw new Error(res.error || "Not found");
      const d = res.data;
      setForm(prev => ({
        ...prev,
        ...d,
        ipNumber: "",  // will be auto-generated on save
      }));
      toast.success("Patient loaded from UHID");
    } catch (e) {
      toast.error(e.message || "Patient not found");
    } finally {
      setSearchingUHID(false);
    }
  };

  // ── Search by IP Number ───────────────────────────────────────────────────
  const handleSearchByIP = async () => {
    const ip = form.ipNumber.trim();
    if (!ip) return toast.warning("Enter IP Number");
    setSearchingIP(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}admission-by-ip/${encodeURIComponent(ip)}/`, "GET");
      if (!res.success) throw new Error(res.error || "Not found");
      const d = res.data;
      setEditingIP(d.ipNumber);
      setForm({ ...EMPTY, ...d });
      toast.success(`Loaded admission: ${d.ipNumber}`);
    } catch (e) {
      toast.error(e.message || "Admission not found");
    } finally {
      setSearchingIP(false);
    }
  };

  // ── Room / Bed selection ──────────────────────────────────────────────────
  const openRoomModal = () => { setShowRoomModal(true); fetchAllRooms(); };

  const handleRoomClick = room => {
    const s = getRoomStatus(room.beds);
    if (s === "occupied" || s === "maintenance") return;
    setSelectedRoom(room);
    setShowRoomModal(false);
    setShowBedModal(true);
  };

  const handleBedSelect = bedNumber => {
    setForm(prev => ({ ...prev, roomNo: selectedRoom.room_number, bedNo: bedNumber }));
    setShowBedModal(false);
    toast.success(`Room ${selectedRoom.room_number} / Bed ${bedNumber} selected`);
  };

  // ── Form ──────────────────────────────────────────────────────────────────
  const handleChange = e => {
    const { name, value, type, files } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "file" ? files[0] : value }));
  };

  const handleReset = () => { setForm(EMPTY); setEditingIP(null); setLastSaved(null); };

  const handleEdit = adm => {
    setEditingIP(adm.ipNumber);
    setForm({ ...EMPTY, ...adm });
    window.scrollTo(0, 0);
    toast.info(`Editing: ${adm.ipNumber}`);
  };

  const handleCancel = async ipNumber => {
    if (!window.confirm("Cancel this admission?")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}admission/${ipNumber}/`, "DELETE");
      if (res.success) { toast.success("Admission cancelled"); fetchAdmissions(); }
    } catch { toast.error("Failed to cancel"); }
  };

  const handleSubmit = async () => {
    if (!form.uhid)            return toast.warning("UHID is required");
    if (!form.admittingDoctor) return toast.warning("Admitting Doctor is required");
    if (!form.roomNo)          return toast.warning("Room is required");
    if (!form.bedNo)           return toast.warning("Bed is required");

    const admissionDateTime = now.toISOString();
    const payload = new FormData();
    ["uhid", "admittingDoctor", "consultingDoctor", "roomNo", "bedNo",
      "reasonForAdmission", "packageName", "mlc_type", "mlc_remarks"].forEach(k => {
        if (form[k]) payload.append(k, form[k]);
    });
    payload.append("admissionDateTime", admissionDateTime);
    if (form.mlc_doc instanceof File) payload.append("mlc_doc", form.mlc_doc);

    try {
      const url  = editingIP ? `${HmsBaseUrl}admission/${editingIP}/` : `${HmsBaseUrl}admission/`;
      const meth = editingIP ? "PUT" : "POST";
      const res  = await apiRequest(url, meth, payload);
      if (res.success) {
        toast.success(editingIP ? "Admission updated!" : "Admission saved!");
        setLastSaved({
          ...res.data,
          admittingDoctorName: getDoctorName(form.admittingDoctor),
          admissionDateTime,
        });
        fetchAdmissions();
        if (!editingIP) handleReset();
      } else throw new Error(res.error);
    } catch (e) { toast.error(e.message || "Failed to save"); }
  };

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = admData => {
    const d = admData || lastSaved;
    if (!d) return;
    const name   = [d.salutation, d.firstName, d.middleName, d.lastName].filter(Boolean).join(" ");
    const admDT  = d.admissionDateTime ? new Date(d.admissionDateTime) : new Date();
    const pw = window.open("", "_blank", "width=600,height=420");
    pw.document.write(`<!DOCTYPE html><html><head><title>IP Slip</title>
      <style>*{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:Arial,sans-serif;font-size:13px;padding:20px;}
      .slip{width:540px;margin:0 auto;border:1px solid #000;padding:16px;}
      .row{display:flex;justify-content:space-between;margin-bottom:12px;}
      .bold{font-weight:bold;}.big{font-size:20px;font-weight:bold;color:#0d9488;}
      hr{border:none;border-top:1px solid #ccc;margin:10px 0;}
      @media print{body{padding:0;}.slip{border:none;}}
      </style></head><body><div class="slip">
      <div style="text-align:center;padding-bottom:10px;border-bottom:2px solid #0d9488;">
        <div class="big">🏥 IP Admission Slip</div>
      </div>
      <hr/>
      <div class="row">
        <div>
          <div class="bold">${name}</div>
          <div>${d.age || ""} / ${d.gender || ""}</div>
          <div>${d.phone || ""}</div>
          <div>${d.permanent_address || ""}</div>
          <div>${[d.area, d.city, d.state].filter(Boolean).join(", ")}</div>
          <div>Dr. ${d.admittingDoctorName || ""}</div>
        </div>
        <div style="text-align:right;">
          <div class="big">IP: ${d.ipNumber || ""}</div>
          <div class="bold">${d.customerType || ""}</div>
          <div>UHID: ${d.uhid || ""}</div>
          <div>Date: ${admDT.toLocaleDateString("en-IN")}</div>
          <div>Time: ${admDT.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })}</div>
          <div>Room: ${d.roomNo || ""} / Bed: ${d.bedNo || ""}</div>
        </div>
      </div>
      </div>
      <script>window.onload=function(){window.print();window.close();};</script>
      </body></html>`);
    pw.document.close();
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  const patientName = [form.salutation, form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ");
  const hasPatient  = !!form.firstName;

  return (
    <PageWrapper>
      <Container style={{ padding: 0 }}>

        {/* Header */}
        <PageHeader>
          <PageTitle>
            <span>🏥</span>
            {editingIP ? `Editing Admission — ${editingIP}` : "New IP Admission"}
          </PageTitle>
          <ClockDisplay>{formatDate(now)} &nbsp; {formatClock(now)}</ClockDisplay>
        </PageHeader>

        {/* ── Search ── */}
        <SectionCard delay={0}>
          <SectionHead>🔍 Patient / Admission Search</SectionHead>
          <SectionBody>
            <FormGrid>
              <Field span={3}>
                <Lbl required>Search by UHID</Lbl>
                <InputRow>
                  <Inp
                    name="uhid"
                    value={form.uhid}
                    onChange={handleChange}
                    placeholder="Enter UHID (e.g. S026/0000003)"
                    readOnly={!!editingIP}
                    onKeyDown={e => e.key === "Enter" && handleSearchByUHID()}
                  />
                  <IconBtn type="button" onClick={handleSearchByUHID} disabled={searchingUHID || !!editingIP}>
                    {searchingUHID ? "..." : "🔍 Fetch"}
                  </IconBtn>
                </InputRow>
              </Field>
              <Field span={3}>
                <Lbl>Search by IP Number (to edit)</Lbl>
                <InputRow>
                  <Inp
                    name="ipNumber"
                    value={form.ipNumber}
                    onChange={handleChange}
                    placeholder="Enter IP Number (e.g. S026/500003)"
                    onKeyDown={e => e.key === "Enter" && handleSearchByIP()}
                  />
                  <IconBtn type="button" onClick={handleSearchByIP} disabled={searchingIP}>
                    {searchingIP ? "..." : "🔍 Load"}
                  </IconBtn>
                </InputRow>
              </Field>
            </FormGrid>
          </SectionBody>
        </SectionCard>

        {/* ── Patient Info ── */}
        {hasPatient && (
          <SectionCard delay={40}>
            <SectionHead>👤 Patient Details</SectionHead>
            <SectionBody style={{ paddingBottom: 10 }}>
              <PatientCard>
                <PatInfoItem>
                  <PatLabel>Patient Name</PatLabel>
                  <PatValue>{patientName || "—"}</PatValue>
                </PatInfoItem>
                <PatInfoItem>
                  <PatLabel>UHID</PatLabel>
                  <PatValue>{form.uhid || "—"}</PatValue>
                </PatInfoItem>
                <PatInfoItem>
                  <PatLabel>Age / Gender</PatLabel>
                  <PatValue>{[form.age, form.gender].filter(Boolean).join(" / ") || "—"}</PatValue>
                </PatInfoItem>
                <PatInfoItem>
                  <PatLabel>Phone</PatLabel>
                  <PatValue>{form.phone || "—"}</PatValue>
                </PatInfoItem>
                <PatInfoItem>
                  <PatLabel>Customer Type</PatLabel>
                  <PatValue>{form.customerType || "—"}</PatValue>
                </PatInfoItem>
                <PatInfoItem>
                  <PatLabel>Insurance</PatLabel>
                  <PatValue>{form.insuranceCompanyName || form.insuranceCompany || "—"}</PatValue>
                </PatInfoItem>
                <PatInfoItem style={{ gridColumn: "span 2" }}>
                  <PatLabel>Address</PatLabel>
                  <PatValue style={{ fontSize: "0.72rem" }}>
                    {[form.permanent_address, form.area, form.city, form.state, form.zipcode].filter(Boolean).join(", ") || "—"}
                  </PatValue>
                </PatInfoItem>
              </PatientCard>
            </SectionBody>
          </SectionCard>
        )}

        {/* ── Clinical ── */}
        <SectionCard delay={80}>
          <SectionHead>🩺 Clinical Details</SectionHead>
          <SectionBody>
            <FormGrid>
              <Field span={3}>
                <Lbl required>Admitting Doctor</Lbl>
                <Sel name="admittingDoctor" value={form.admittingDoctor} onChange={handleChange}>
                  <option value="">— Select Doctor —</option>
                  {doctors.map(d => <option key={d.employeeId} value={d.employeeId}>{d.employeeName}</option>)}
                </Sel>
              </Field>
              <Field span={3}>
                <Lbl>Consulting Doctor</Lbl>
                <Sel name="consultingDoctor" value={form.consultingDoctor} onChange={handleChange}>
                  <option value="">— Select Doctor —</option>
                  {doctors.map(d => <option key={d.employeeId} value={d.employeeId}>{d.employeeName}</option>)}
                </Sel>
              </Field>
              <Field span={3}>
                <Lbl>Reason for Admission</Lbl>
                <Txta name="reasonForAdmission" value={form.reasonForAdmission} onChange={handleChange} rows={2} />
              </Field>
              <Field span={3}>
                <Lbl>Package</Lbl>
                <Sel name="packageName" value={form.packageName} onChange={handleChange}>
                  <option value="">— No Package —</option>
                  {packages.map(p => (
                    <option key={p.packageNo} value={p.packageName}>
                      {p.packageName}{p.department ? ` (${p.department})` : ""}
                    </option>
                  ))}
                </Sel>
              </Field>
            </FormGrid>
          </SectionBody>
        </SectionCard>

        {/* ── Room & Bed ── */}
        <SectionCard delay={120}>
          <SectionHead>🛏️ Room &amp; Bed Assignment</SectionHead>
          <SectionBody>
            <FormGrid>
              <Field span={3}>
                <Lbl required>Room Number</Lbl>
                <InputRow>
                  <Inp
                    name="roomNo"
                    value={form.roomNo}
                    onChange={handleChange}
                    placeholder="Click 🔍 to open room picker"
                  />
                  <IconBtn type="button" onClick={openRoomModal}>🔍 Pick Room</IconBtn>
                </InputRow>
              </Field>
              <Field span={3}>
                <Lbl required>Bed Number</Lbl>
                <Inp
                  name="bedNo"
                  value={form.bedNo}
                  readOnly
                  placeholder="Auto-filled on bed selection"
                  style={{ background: "#f8fafc" }}
                />
              </Field>
            </FormGrid>
          </SectionBody>
        </SectionCard>

        {/* ── MLC ── */}
        <SectionCard delay={160}>
          <SectionHead>⚖️ MLC Details (if applicable)</SectionHead>
          <SectionBody>
            <FormGrid>
              <Field span={2}>
                <Lbl>MLC Type</Lbl>
                <Sel name="mlc_type" value={form.mlc_type} onChange={handleChange}>
                  <option value="">— None —</option>
                  <option value="Accident">Accident</option>
                  <option value="Assault">Assault</option>
                  <option value="Other">Other</option>
                </Sel>
              </Field>
              <Field span={2}>
                <Lbl>MLC Document</Lbl>
                <Inp type="file" name="mlc_doc" onChange={handleChange} style={{ paddingTop: 4, height: "auto" }} />
              </Field>
              <Field span={2}>
                <Lbl>MLC Remarks</Lbl>
                <Txta name="mlc_remarks" value={form.mlc_remarks} onChange={handleChange} rows={2} />
              </Field>
            </FormGrid>
          </SectionBody>
        </SectionCard>

        {/* ── Action Bar ── */}
        <ActionBar>
          {lastSaved && (
            <PrintBtn onClick={() => handlePrint(lastSaved)}>🖨️ Print Slip</PrintBtn>
          )}
          <ResetBtn onClick={handleReset}>↺ Reset</ResetBtn>
          <SaveBtn onClick={handleSubmit}>
            {editingIP ? "💾 Update Admission" : "💾 Save Admission"}
          </SaveBtn>
        </ActionBar>

        {/* ── Admitted Patients Table ── */}
        <TableSection>
          <TableTitle>📋 Admitted Patients ({admissions.length})</TableTitle>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>UHID</Th>
                  <Th>IP Number</Th>
                  <Th>Patient Name</Th>
                  <Th>Admission Date &amp; Time</Th>
                  <Th>Room / Bed</Th>
                  <Th>Doctor</Th>
                  <Th>Package</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {admissions.length === 0 ? (
                  <Tr><Td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    No admissions found
                  </Td></Tr>
                ) : admissions.map((adm, idx) => (
                  <Tr key={idx}>
                    <Td style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{adm.uhid}</Td>
                    <Td style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, color: "#0d9488" }}>{adm.ipNumber}</Td>
                    <Td>{[adm.salutation, adm.firstName, adm.middleName, adm.lastName].filter(Boolean).join(" ") || "—"}</Td>
                    <Td style={{ fontSize: "0.74rem" }}>{adm.admissionDateTime ? new Date(adm.admissionDateTime).toLocaleString("en-IN") : "—"}</Td>
                    <Td>{`${adm.roomNo || "—"} / ${adm.bedNo || "—"}`}</Td>
                    <Td style={{ fontSize: "0.74rem" }}>{adm.admittingDoctorName || getDoctorName(adm.admittingDoctor) || "—"}</Td>
                    <Td style={{ fontSize: "0.74rem" }}>{adm.packageName || "—"}</Td>
                    <Td>
                      <StatusBadge active={adm.is_admissionActive !== false && !adm.is_discharged}>
                        {adm.is_discharged ? "Discharged" : adm.is_admissionActive !== false ? "Active" : "Cancelled"}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <div style={{ display: "flex", gap: 5 }}>
                        <MiniBtn
                          onClick={() => handleEdit(adm)}
                          disabled={adm.is_admissionActive === false || adm.is_discharged}
                        >✏️ Edit</MiniBtn>
                        <MiniBtn purple onClick={() => handlePrint(adm)}>🖨️</MiniBtn>
                        <MiniBtn
                          danger
                          onClick={() => handleCancel(adm.ipNumber)}
                          disabled={adm.is_admissionActive === false || adm.is_discharged}
                        >🗑️</MiniBtn>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </TableSection>

      </Container>

      {/* ════ ROOM PICKER MODAL ════ */}
      {showRoomModal && (
        <ModalOverlay onClick={() => setShowRoomModal(false)}>
          <RoomModalContainer onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🏨 Select Room &amp; Bed</ModalTitle>
              <CloseButton onClick={() => setShowRoomModal(false)}>×</CloseButton>
            </ModalHeader>
            <RoomModalBody>
              {/* Filters */}
              <FilterBar>
                <FilterField>
                  <FilterLabel>Room Number</FilterLabel>
                  <FilterInput
                    placeholder="e.g. 101"
                    value={roomFilter.room_number}
                    onChange={e => setRoomFilter(p => ({ ...p, room_number: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && fetchAllRooms()}
                  />
                </FilterField>
                <FilterField>
                  <FilterLabel>Block</FilterLabel>
                  <FilterInput
                    placeholder="e.g. A"
                    value={roomFilter.block}
                    onChange={e => setRoomFilter(p => ({ ...p, block: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && fetchAllRooms()}
                  />
                </FilterField>
                <FilterField>
                  <FilterLabel>Floor</FilterLabel>
                  <FilterInput
                    type="number"
                    placeholder="e.g. 2"
                    value={roomFilter.floor}
                    onChange={e => setRoomFilter(p => ({ ...p, floor: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && fetchAllRooms()}
                  />
                </FilterField>
                <FilterBtn onClick={() => fetchAllRooms()}>Search</FilterBtn>
                <FilterBtn muted onClick={() => { setRoomFilter({ room_number: "", block: "", floor: "" }); fetchAllRooms({ room_number: "", block: "", floor: "" }); }}>
                  Clear
                </FilterBtn>
              </FilterBar>

              {/* Legend */}
              <LegendBar>
                <LegendItem><LegendDot color="#22c55e" />Available</LegendItem>
                <LegendItem><LegendDot color="#3b82f6" />Partially Available</LegendItem>
                <LegendItem><LegendDot color="#ef4444" />Fully Occupied</LegendItem>
                <LegendItem><LegendDot color="#f59e0b" />Maintenance</LegendItem>
                <span style={{ fontSize: "0.68rem", color: "#94a3b8", marginLeft: "auto" }}>
                  Click a green bed chip to select instantly
                </span>
              </LegendBar>

              {/* Rooms */}
              {loadingRooms ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px,1fr))", gap: 8 }}>
                  {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : Object.keys(groupedRooms).length === 0 ? (
                <NoResults>No rooms found. Try clearing filters.</NoResults>
              ) : (
                Object.entries(groupedRooms).map(([block, floors], bIdx) => (
                  <BlockSection key={block} idx={bIdx}>
                    <BlockHeader>🏢 Block {block}</BlockHeader>
                    {Object.entries(floors).sort(([a], [b]) => Number(a) - Number(b)).map(([floor, rooms]) => (
                      <FloorGroup key={floor}>
                        <FloorLabel>Floor {floor}</FloorLabel>
                        <RoomGrid>
                          {rooms.map(room => {
                            const status = getRoomStatus(room.beds);
                            return (
                              <RoomCard
                                key={room.room_number}
                                status={status}
                                onClick={() => handleRoomClick(room)}
                                title={
                                  status === "occupied"    ? "Fully occupied" :
                                  status === "maintenance" ? "Under maintenance" :
                                  status === "partial"     ? "Partially available — pick a bed" :
                                  "Available — pick a bed"
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
                                      onClick={e => {
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

      {/* ════ BED SELECT MODAL ════ */}
      {showBedModal && selectedRoom && (
        <ModalOverlay onClick={() => setShowBedModal(false)}>
          <ModalContainer onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <ModalHeader>
              <ModalTitle>🛏️ Select Bed — Room {selectedRoom.room_number}</ModalTitle>
              <CloseButton onClick={() => setShowBedModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: 12 }}>
                {(selectedRoom.beds || []).map((bed, i) => {
                  const avail = bed.status === "Available";
                  return (
                    <BedChip
                      key={i}
                      bedStatus={bed.status}
                      disabled={!avail}
                      style={{ minWidth: 72, height: 44, fontSize: "0.8rem", flex: "1 1 72px" }}
                      onClick={() => avail && handleBedSelect(bed.bed_number)}
                      title={`${bed.bed_number} — ${bed.status}`}
                    >
                      {bed.bed_number}
                      <br />
                      <span style={{ fontSize: "0.58rem", opacity: 0.9 }}>{bed.status}</span>
                    </BedChip>
                  );
                })}
                {(!selectedRoom.beds || !selectedRoom.beds.length) && (
                  <NoResults>No beds configured.</NoResults>
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