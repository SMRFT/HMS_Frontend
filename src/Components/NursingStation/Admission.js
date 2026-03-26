import { useState, useEffect, useRef } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../../Auth/apiRequest";
import {
  PageWrapper, Container, ModalOverlay, ModalContainer,
  ModalHeader, ModalTitle, CloseButton, ModalBody, colors,
} from "../GlobalStyles";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}`;
const pulse  = keyframes`0%,100%{opacity:1}50%{opacity:.45}`;
const slideUp = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;

// ─── Global Print Style ────────────────────────────────────────────────────────
const GlobalPrint = createGlobalStyle`
  @media print {
    body > *:not(#print-root) { display: none !important; }
    #print-root { display: block !important; }
  }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────
const PageHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px 6px 0 0;
`;
const PageTitleEl = styled.h2`
  font-size: 0.9rem;font-weight:700;color:#fff;margin:0;letter-spacing:.04em;
`;
const NewAdmBtn = styled.button`
  height:32px;padding:0 16px;font-size:.8rem;font-weight:700;
  background:#f97316;color:#fff;border:none;border-radius:5px;cursor:pointer;
  display:flex;align-items:center;gap:6px;
  &:hover{background:#ea6c0a;}
`;

// ─── Stats Row ─────────────────────────────────────────────────────────────────
const StatsRow = styled.div`
  display:grid;grid-template-columns:repeat(4,1fr);gap:0;
  border-bottom:1px solid #e5e7eb;
`;
const StatCard = styled.div`
  padding:14px 20px;display:flex;align-items:center;gap:14px;
  border-right:1px solid #e5e7eb;
  &:last-child{border-right:none;}
  animation:${fadeIn} .4s ease both;
  animation-delay:${p=>p.idx*.08}s;
`;
const StatIcon = styled.div`
  width:42px;height:42px;border-radius:10px;
  background:${p=>p.bg||'#f0fdf4'};
  display:flex;align-items:center;justify-content:center;
  font-size:1.3rem;flex-shrink:0;
`;
const StatInfo = styled.div``;
const StatLabel = styled.div`font-size:.68rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;`;
const StatValue = styled.div`font-size:1.6rem;font-weight:800;color:#111827;line-height:1.1;`;

// ─── Filter Bar ────────────────────────────────────────────────────────────────
const FilterBar = styled.div`
  display:flex;gap:10px;align-items:flex-end;padding:14px 20px;
  border-bottom:1px solid #e5e7eb;flex-wrap:wrap;background:#fafafa;
`;
const FField = styled.div`display:flex;flex-direction:column;gap:3px;flex:${p=>p.flex||'1 1 140px'};`;
const FLabel = styled.label`font-size:.68rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;`;
const FSelect = styled.select`
  height:32px;padding:0 8px;font-size:.78rem;border:1px solid #d1d5db;
  border-radius:5px;background:#fff;color:#111827;outline:none;
  &:focus{border-color:#0d9488;}
`;
const FInput = styled.input`
  height:32px;padding:0 8px;font-size:.78rem;border:1px solid #d1d5db;
  border-radius:5px;background:#fff;color:#111827;outline:none;
  &:focus{border-color:#0d9488;}
`;
const SearchBtn = styled.button`
  height:32px;padding:0 18px;font-size:.78rem;font-weight:600;
  background:#0d9488;color:#fff;border:none;border-radius:5px;cursor:pointer;
  display:flex;align-items:center;gap:5px;
  &:hover{background:#0f766e;}
`;

// ─── Table ─────────────────────────────────────────────────────────────────────
const TableWrap = styled.div`overflow-x:auto;`;
const Table = styled.table`width:100%;border-collapse:collapse;font-size:.78rem;`;
const Thead = styled.thead`background:#f9fafb;`;
const Th = styled.th`
  padding:9px 12px;text-align:left;font-size:.7rem;font-weight:700;
  color:#6b7280;text-transform:uppercase;letter-spacing:.05em;
  border-bottom:2px solid #e5e7eb;white-space:nowrap;
`;
const Tr = styled.tr`
  border-bottom:1px solid #f3f4f6;
  animation:${fadeIn} .3s ease both;
  animation-delay:${p=>p.idx*.04}s;
  &:hover{background:#f0fdf4;}
`;
const Td = styled.td`padding:9px 12px;color:#374151;white-space:nowrap;`;

const AdmBadge = styled.span`
  padding:3px 10px;border-radius:20px;font-size:.68rem;font-weight:700;
  background:${p=>p.active?'#dcfce7':'#fee2e2'};
  color:${p=>p.active?'#166534':'#991b1b'};
`;

// ─── Show count + search ───────────────────────────────────────────────────────
const TableTopBar = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 20px;border-bottom:1px solid #e5e7eb;
`;
const ShowSelect = styled.div`
  display:flex;align-items:center;gap:6px;font-size:.75rem;color:#6b7280;
`;
const SearchBox = styled.div`display:flex;align-items:center;gap:6px;font-size:.75rem;color:#6b7280;`;
const SInput = styled.input`
  height:28px;padding:0 8px;font-size:.75rem;border:1px solid #d1d5db;
  border-radius:4px;outline:none;&:focus{border-color:#0d9488;}
`;

// ─── Action Menu ───────────────────────────────────────────────────────────────
const ActionWrap = styled.div`position:relative;display:inline-block;`;
const DotBtn = styled.button`
  width:28px;height:28px;border-radius:50%;border:1px solid #e5e7eb;
  background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
  font-size:1rem;color:#6b7280;
  &:hover{background:#f3f4f6;}
`;
const DropMenu = styled.div`
  position:absolute;right:0;top:32px;background:#fff;border:1px solid #e5e7eb;
  border-radius:7px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:200;
  min-width:170px;overflow:hidden;animation:${fadeIn} .15s ease;
`;
const DropItem = styled.button`
  width:100%;padding:9px 14px;text-align:left;font-size:.78rem;font-weight:500;
  background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:8px;
  color:${p=>p.danger?'#dc2626':'#374151'};
  &:hover{background:${p=>p.danger?'#fff1f2':'#f0fdf4'};}
`;

// ─── Pagination ────────────────────────────────────────────────────────────────
const Pager = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 20px;border-top:1px solid #e5e7eb;font-size:.75rem;color:#6b7280;
`;
const PBtn = styled.button`
  height:28px;padding:0 14px;font-size:.75rem;border:1px solid #e5e7eb;
  border-radius:4px;background:${p=>p.active?'#0d9488':'#fff'};
  color:${p=>p.active?'#fff':'#374151'};cursor:pointer;
  &:disabled{opacity:.45;cursor:default;}
  &:hover:not(:disabled):not([data-active]){background:#f3f4f6;}
`;

// ─── Form Modal ────────────────────────────────────────────────────────────────
const FormModal = styled(ModalContainer)`max-width:860px;max-height:90vh;overflow-y:auto;`;
const FormGrid = styled.div`
  display:grid;grid-template-columns:repeat(6,1fr);gap:6px 12px;padding:16px;
`;
const Field = styled.div`display:flex;flex-direction:column;gap:2px;grid-column:span ${p=>p.span||1};`;
const Lbl = styled.label`
  font-size:.7rem;font-weight:600;color:#374151;
  &::after{content:${p=>p.required?'" *"':'""'};color:#ef4444;}
`;
const Inp = styled.input`
  height:28px;padding:0 7px;font-size:.75rem;border:1px solid #d1d5db;border-radius:4px;
  background:${p=>p.readOnly?'#f3f4f6':'#fff'};color:${p=>p.readOnly?'#6b7280':'#111827'};
  outline:none;width:100%;box-sizing:border-box;
  &:focus{border-color:#0d9488;box-shadow:0 0 0 2px #ccfbf1;}
`;
const Sel = styled.select`
  height:28px;padding:0 4px;font-size:.75rem;border:1px solid #d1d5db;border-radius:4px;
  background:#fff;color:#111827;outline:none;width:100%;box-sizing:border-box;
  &:focus{border-color:#0d9488;}
  &:disabled{background:#f3f4f6;color:#6b7280;}
`;
const Txta = styled.textarea`
  padding:4px 7px;font-size:.75rem;border:1px solid #d1d5db;border-radius:4px;
  resize:vertical;min-height:44px;width:100%;box-sizing:border-box;
  &:focus{border-color:#0d9488;outline:none;}
`;
const SecDiv = styled.div`
  grid-column:span 6;border-top:1px solid #e5e7eb;
  margin:4px 0 2px;padding-top:6px;font-size:.7rem;font-weight:700;
  color:#0d9488;text-transform:uppercase;letter-spacing:.05em;
`;
const FormActions = styled.div`
  display:flex;gap:8px;justify-content:flex-end;padding:10px 16px;
  border-top:1px solid #e5e7eb;
`;
const SmBtn = styled.button`
  height:30px;padding:0 16px;font-size:.75rem;font-weight:600;border-radius:4px;
  border:none;cursor:pointer;
  background:${p=>p.secondary?'#e5e7eb':'#0d9488'};
  color:${p=>p.secondary?'#374151':'#fff'};
  &:hover{opacity:.88;}
  &:disabled{opacity:.5;cursor:not-allowed;}
`;

// ─── Room Modal ────────────────────────────────────────────────────────────────
const RoomModalContainer = styled(ModalContainer)`max-width:960px;max-height:88vh;`;
const RoomModalBody = styled(ModalBody)`background:#f8fafc;padding:14px;`;

const FilterBarR = styled.div`display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:flex-end;`;
const FilterFieldR = styled.div`display:flex;flex-direction:column;gap:2px;flex:1 1 120px;`;
const FilterLabelR = styled.label`font-size:.68rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;`;
const FilterInputR = styled.input`
  height:28px;padding:0 7px;font-size:.75rem;border:1px solid #d1d5db;border-radius:4px;
  background:#fff;outline:none;width:100%;box-sizing:border-box;&:focus{border-color:#0d9488;}
`;
const FilterBtnR = styled.button`
  height:28px;padding:0 14px;font-size:.75rem;font-weight:600;border-radius:4px;
  border:none;cursor:pointer;background:#0d9488;color:#fff;align-self:flex-end;
  &:hover{background:#0f766e;}
`;
const LegendBar = styled.div`
  display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;padding:6px 12px;
  background:#fff;border:1px solid #e5e7eb;border-radius:6px;
`;
const LegendItem = styled.div`display:flex;align-items:center;gap:5px;font-size:.72rem;font-weight:500;color:#6b7280;`;
const LegendDot = styled.span`display:inline-block;width:12px;height:12px;border-radius:3px;background:${p=>p.color};flex-shrink:0;`;
const BlockSection = styled.div`
  background:#fff;border:1px solid #e5e7eb;border-radius:8px;
  margin-bottom:14px;overflow:hidden;
  animation:${slideUp} .25s ease both;animation-delay:${p=>p.idx*40}ms;
`;
const BlockHeader = styled.div`
  padding:7px 12px;background:#f0fdf4;border-bottom:1px solid #e5e7eb;
  font-size:.78rem;font-weight:700;color:#0d9488;
`;
const FloorGroup = styled.div`padding:10px 12px;`;
const FloorLabel = styled.div`
  font-size:.68rem;font-weight:700;color:#6b7280;text-transform:uppercase;
  letter-spacing:.06em;margin-bottom:8px;display:flex;align-items:center;gap:6px;
  &::after{content:"";flex:1;height:1px;background:#e5e7eb;}
`;
const RoomGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:8px;margin-bottom:10px;`;

const roomColors = {
  available:   {bg:"#f0fdf4",border:"#86efac",header:"#dcfce7"},
  occupied:    {bg:"#fff1f2",border:"#fca5a5",header:"#fee2e2"},
  maintenance: {bg:"#fffbeb",border:"#fcd34d",header:"#fef3c7"},
  partial:     {bg:"#eff6ff",border:"#93c5fd",header:"#dbeafe"},
};
const RoomCard = styled.div`
  border:1.5px solid ${p=>roomColors[p.status]?.border||'#e5e7eb'};
  border-radius:7px;overflow:hidden;
  cursor:${p=>(p.status==='occupied'||p.status==='maintenance')?'not-allowed':'pointer'};
  opacity:${p=>(p.status==='occupied'||p.status==='maintenance')?.72:1};
  background:${p=>roomColors[p.status]?.bg||'#fff'};
  transition:box-shadow .18s,transform .18s;
  ${p=>(p.status!=='occupied'&&p.status!=='maintenance')&&`&:hover{box-shadow:0 4px 14px rgba(0,0,0,.13);transform:translateY(-2px);}`}
`;
const RoomCardTop = styled.div`
  display:flex;align-items:center;justify-content:space-between;padding:5px 8px;
  background:${p=>roomColors[p.status]?.header||'#f1f5f9'};
  border-bottom:1px solid ${p=>roomColors[p.status]?.border||'#e5e7eb'};
`;
const RoomNum = styled.span`font-size:.78rem;font-weight:700;color:#111827;`;
const RoomStatusPill = styled.span`
  font-size:.6rem;font-weight:700;padding:1px 6px;border-radius:10px;
  background:${p=>p.status==='available'?'#22c55e':p.status==='occupied'?'#ef4444':p.status==='maintenance'?'#f59e0b':'#3b82f6'};
  color:#fff;text-transform:capitalize;
`;
const BedRow = styled.div`display:flex;flex-wrap:wrap;gap:4px;padding:6px 8px;`;
const BedChip = styled.button`
  flex:1 1 auto;min-width:44px;text-align:center;padding:3px 5px;border-radius:4px;
  font-size:.67rem;font-weight:600;border:1.5px solid transparent;
  cursor:${p=>p.disabled?'not-allowed':'pointer'};transition:filter .15s,border-color .15s;
  color:#fff;
  background:${p=>p.bedStatus==='Available'?'#22c55e':p.bedStatus==='Occupied'?'#ef4444':'#f59e0b'};
  opacity:${p=>p.disabled?.55:1};
  &:hover:not(:disabled){filter:brightness(1.1);border-color:rgba(0,0,0,.2);}
`;
const RoomType = styled.span`font-size:.6rem;color:#6b7280;padding:0 8px 4px;display:block;`;
const Skeleton = styled.div`
  height:100px;border-radius:7px;
  background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);
  background-size:200% 100%;animation:${pulse} 1.4s ease-in-out infinite;
`;
const InputRow = styled.div`display:flex;align-items:center;gap:3px;`;
const IconBtn = styled.button`
  height:28px;padding:0 7px;font-size:.72rem;background:#0d9488;color:#fff;
  border:none;border-radius:4px;cursor:pointer;white-space:nowrap;flex-shrink:0;
  &:hover{background:#0f766e;}&:disabled{opacity:.5;cursor:not-allowed;}
`;
const NoResults = styled.div`text-align:center;padding:30px;color:#6b7280;font-size:.8rem;`;

// ─── Print Slip Modal ──────────────────────────────────────────────────────────
const PrintModalContainer = styled(ModalContainer)`max-width:520px;`;
const PrintModalBody = styled(ModalBody)`padding:0;background:#fff;`;
const PrintSlip = styled.div`
  padding:16px;font-family:'Courier New',monospace;font-size:12px;color:#000;
  border:2px solid #000;margin:16px;
  @media print{margin:0;border:none;}
`;
const SlipRow = styled.div`display:flex;justify-content:space-between;gap:12px;`;
const SlipLeft = styled.div`flex:1;`;
const SlipRight = styled.div`text-align:right;`;
const SlipBig = styled.div`font-size:18px;font-weight:900;letter-spacing:.5px;`;
const SlipLine = styled.div`margin:2px 0;font-size:11px;`;
const SlipBold = styled.div`font-weight:700;margin:2px 0;font-size:12px;`;
const PrintActions = styled.div`
  display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;
  border-top:1px solid #e5e7eb;
`;
const PrintBtn2 = styled.button`
  height:32px;padding:0 16px;font-size:.78rem;font-weight:600;border-radius:4px;
  border:none;cursor:pointer;
  background:${p=>p.secondary?'#e5e7eb':'#7c3aed'};
  color:${p=>p.secondary?'#374151':'#fff'};
  &:hover{opacity:.88;}
`;

// ─── Barcode SVG ───────────────────────────────────────────────────────────────
function BarcodeSVG({ value, width = 200, height = 48 }) {
  if (!value) return null;
  const bars = [];
  let x = 0;
  for (let i = 0; i < value.length && x < width - 8; i++) {
    const code = value.charCodeAt(i);
    for (let b = 0; b < 7 && x < width - 8; b++) {
      const bw = ((code >> b) & 1) ? 2.5 : 1.2;
      if (i % 2 === 0) bars.push({ x: x.toFixed(1), w: bw });
      x += bw + 0.8;
    }
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} style={{ display: "block" }}>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={height} fill="black" />
      ))}
    </svg>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  uhid:"",ipNumber:"",admittingDoctor:"",consultingDoctor:"",
  roomNo:"",bedNo:"",reasonForAdmission:"",packageName:"",packageNo:"",
  mlc_type:"",mlc_doc:null,mlc_remarks:"",
  salutation:"",firstName:"",middleName:"",lastName:"",
  age:"",gender:"",phone:"",permanent_address:"",
  area:"",zipcode:"",city:"",state:"",
  customerType:"",insuranceCompany:"",insuranceCompanyName:"",
  company_id:"",privilegedCustomerId:"",
};

function getRoomStatus(beds) {
  if (!beds||beds.length===0) return "available";
  const s = beds.map(b=>b.status);
  if (s.every(x=>x==="Maintenance")) return "maintenance";
  if (s.every(x=>x==="Occupied"))    return "occupied";
  if (s.some(x=>x==="Occupied")&&s.some(x=>x==="Available")) return "partial";
  return "available";
}

// ─── Component ────────────────────────────────────────────────────────────────
const Admission = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // state
  const [admissions, setAdmissions]     = useState([]);
  const [doctors, setDoctors]           = useState([]);
  const [packages, setPackages]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(false);

  // filters
  const [filterDoctor, setFilterDoctor] = useState("ALL");
  const [filterFrom,   setFilterFrom]   = useState(new Date().toISOString().slice(0,10));
  const [filterTo,     setFilterTo]     = useState(new Date().toISOString().slice(0,10));
  const [filterStatus, setFilterStatus] = useState("All");
  const [tableSearch,  setTableSearch]  = useState("");
  const [perPage,      setPerPage]      = useState(15);
  const [page,         setPage]         = useState(1);

  // form modal
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData,  setFormData]  = useState(EMPTY_FORM);

  // room / bed
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomFilter, setRoomFilter] = useState({room_number:"",block:"",floor:""});
  const [allRooms, setAllRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showBedModal,   setShowBedModal]   = useState(false);
  const [selectedRoom,   setSelectedRoom]   = useState(null);

  // print
  const [printData, setPrintData] = useState(null);

  // action dropdown
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const now = new Date();
  const fmt  = d => new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"});
  const fmtT = d => new Date(d).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});

  const getDoctorName = id =>
    doctors.find(d=>String(d.employeeId)===String(id))?.employeeName || String(id||"-");

  const pName = d =>
    [d.salutation,d.firstName,d.middleName,d.lastName].filter(Boolean).join(" ") || "-";

  // ── Click outside menu ─────────────────────────────────────────────────────
  useEffect(()=>{
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown",handler);
    return ()=>document.removeEventListener("mousedown",handler);
  },[]);

  // ── Init fetches ───────────────────────────────────────────────────────────
  useEffect(()=>{ fetchDoctors(); fetchAdmissions(); fetchPackages(); },[]);

  const fetchDoctors = async ()=>{
    try{
      const res = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`,"GET");
      if(res.success) setDoctors(res.data||[]);
    }catch{}
  };

  const fetchAdmissions = async ()=>{
    setLoading(true);
    try{
      const res = await apiRequest(`${HmsBaseUrl}admission/`,"GET");
      // Handle both response shapes
      const list =
        res?.data        && Array.isArray(res.data)        ? res.data :
        res?.admissions  && Array.isArray(res.admissions)  ? res.admissions :
        res?.data?.admissions && Array.isArray(res.data.admissions) ? res.data.admissions :
        Array.isArray(res) ? res : [];
      setAdmissions(list);
    }catch{ setAdmissions([]); }
    finally{ setLoading(false); }
  };

  const fetchPackages = async ()=>{
    try{
      const res = await apiRequest(`${HmsBaseUrl}packages/`,"GET");
      const list = res?.packages||res?.data?.packages||res?.data||[];
      setPackages(Array.isArray(list)?list:[]);
    }catch{ setPackages([]); }
  };

  const fetchAllRooms = async (fo={})=>{
    setLoadingRooms(true);
    try{
      const f={...roomFilter,...fo};
      const params=new URLSearchParams();
      if(f.room_number) params.append("room_number",f.room_number);
      if(f.block)       params.append("block",f.block);
      if(f.floor)       params.append("floor",f.floor);
      const q=params.toString()?`?${params.toString()}`:"";
      const res=await apiRequest(`${HmsBaseUrl}search-rooms/${q}`,"GET");
      setAllRooms(Array.isArray(res)?res:(res.data||[]));
    }catch{ setAllRooms([]); }
    finally{ setLoadingRooms(false); }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().slice(0,10);
  const stats = {
    totalRequests: admissions.length,
    todayAdmissions: admissions.filter(a=>(a.admissionDateTime||"").slice(0,10)===todayStr).length,
    todayDischarge:  admissions.filter(a=>a.is_discharged&&(a.lastmodified_date||"").slice(0,10)===todayStr).length,
    avgStay: 5,
  };

  // ── Filtered admissions ────────────────────────────────────────────────────
  const filtered = admissions.filter(a=>{
    if(filterDoctor!=="ALL" && String(a.admittingDoctor)!==String(filterDoctor)) return false;
    if(filterStatus==="Admitted" && !a.is_admissionActive) return false;
    if(filterStatus==="Discharged" && !a.is_discharged) return false;
    if(filterFrom){const d=(a.admissionDateTime||"").slice(0,10);if(d<filterFrom)return false;}
    if(filterTo  ){const d=(a.admissionDateTime||"").slice(0,10);if(d>filterTo  )return false;}
    if(tableSearch){
      const q=tableSearch.toLowerCase();
      const row=`${a.uhid} ${a.ipNumber} ${pName(a)} ${getDoctorName(a.admittingDoctor)} ${a.roomNo||""} ${a.bedNo|""}`.toLowerCase();
      if(!row.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1,Math.ceil(filtered.length/perPage));
  const paginated  = filtered.slice((page-1)*perPage, page*perPage);

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = adm => {
    setOpenMenuId(null);
    setEditingId(adm.ipNumber);
    setFormData({
      ...EMPTY_FORM,
      uhid:              adm.uhid||"",
      ipNumber:          adm.ipNumber||"",
      admittingDoctor:   adm.admittingDoctor||"",
      consultingDoctor:  adm.consultingDoctor||"",
      roomNo:            adm.roomNo||"",
      bedNo:             adm.bedNo||"",
      reasonForAdmission:adm.reasonForAdmission||"",
      packageName:       adm.packageName||"",
      mlc_type:          adm.mlc_type||"",
      mlc_remarks:       adm.mlc_remarks||"",
      salutation:        adm.salutation||"",
      firstName:         adm.firstName||"",
      middleName:        adm.middleName||"",
      lastName:          adm.lastName||"",
      age:               adm.age||"",
      gender:            adm.gender||"",
      phone:             adm.phone||adm.mobilePhone||"",
      permanent_address: adm.permanent_address||"",
      area:              adm.area||"",
      zipcode:           adm.zipcode||"",
      city:              adm.city||"",
      state:             adm.state||"",
      customerType:      adm.customerType||adm.customer_type||"",
      insuranceCompany:  adm.insuranceCompany||"",
      insuranceCompanyName:adm.insuranceCompanyName||"",
    });
    setShowForm(true);
  };

  // ── Cancel ─────────────────────────────────────────────────────────────────
  const handleCancel = async adm => {
    setOpenMenuId(null);
    if(!window.confirm(`Cancel admission for ${pName(adm)}?`)) return;
    try{
      const res=await apiRequest(`${HmsBaseUrl}admission/${encodeURIComponent(adm.ipNumber)}/`,"DELETE");
      if(res.success){ toast.success("Admission cancelled"); fetchAdmissions(); }
      else toast.error(res.error||"Failed to cancel");
    }catch{ toast.error("Failed to cancel"); }
  };

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = adm => {
    setOpenMenuId(null);
    setPrintData({
      ...adm,
      admittingDoctorName: getDoctorName(adm.admittingDoctor),
    });
  };

  // ── Submit form ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if(!formData.admittingDoctor) return toast.warning("Admitting Doctor is required");
    if(!formData.roomNo)          return toast.warning("Room is required");
    if(!formData.bedNo)           return toast.warning("Bed is required");
    setSaving(true);
    const payload=new FormData();
    ["uhid","admittingDoctor","consultingDoctor","roomNo","bedNo",
     "reasonForAdmission","packageName","mlc_type","mlc_remarks"].forEach(k=>{
      if(formData[k]) payload.append(k,formData[k]);
    });
    payload.append("admissionDateTime",new Date().toISOString());
    if(formData.mlc_doc instanceof File) payload.append("mlc_doc",formData.mlc_doc);
    try{
      let res;
      if(editingId){
        res=await apiRequest(`${HmsBaseUrl}admission/${encodeURIComponent(editingId)}/`,"PUT",payload);
      }else{
        if(!formData.uhid) return toast.warning("UHID is required");
        res=await apiRequest(`${HmsBaseUrl}admission/`,"POST",payload);
      }
      if(res.success){
        toast.success(editingId?"Admission updated!":"Admission saved!");
        setShowForm(false);
        setEditingId(null);
        setFormData(EMPTY_FORM);
        fetchAdmissions();
      }else toast.error(res.error||"Failed to save");
    }catch{ toast.error("Failed to save"); }
    finally{ setSaving(false); }
  };

  // ── Fetch patient by UHID ──────────────────────────────────────────────────
  const fetchPatientByUHID = async ()=>{
    const uhid=formData.uhid.trim();
    if(!uhid) return toast.warning("Enter UHID");
    try{
      const res=await apiRequest(`${HmsBaseUrl}op-patient/${encodeURIComponent(uhid)}/`,"GET");
      if(!res.success){ toast.error(res.error||"Patient not found"); return; }
      const d=res.data;
      setFormData(prev=>({
        ...prev,
        salutation:d.salutation||"",firstName:d.firstName||"",
        middleName:d.middleName||"",lastName:d.lastName||"",
        age:d.age||"",gender:d.gender||"",phone:d.phone||d.mobilePhone||"",
        permanent_address:d.permanent_address||"",area:d.area||"",
        zipcode:d.zipcode||"",city:d.city||"",state:d.state||"",
        customerType:d.customerType||d.customer_type||"",
        insuranceCompany:d.insuranceCompany||"",
        insuranceCompanyName:d.insuranceCompanyName||"",
        company_id:d.company_id||"",
      }));
      toast.success("Patient loaded");
    }catch{ toast.error("Failed to fetch patient"); }
  };

  // ── Room helpers ───────────────────────────────────────────────────────────
  const openRoomModal = ()=>{ setShowRoomModal(true); fetchAllRooms(); };

  const groupedRooms = (()=>{
    const g={};
    allRooms.forEach(room=>{
      const block=room.block||"UNKNOWN";
      const floor=room.floor??"?";
      if(!g[block]) g[block]={};
      if(!g[block][floor]) g[block][floor]=[];
      g[block][floor].push(room);
    });
    return g;
  })();

  const handleRoomClick = room=>{
    const status=getRoomStatus(room.beds);
    if(status==="occupied"||status==="maintenance") return;
    setSelectedRoom(room);
    setShowRoomModal(false);
    setShowBedModal(true);
  };

  const handleBedSelect = (bedNumber,room)=>{
    const r=room||selectedRoom;
    if(!r) return;
    setFormData(prev=>({...prev,roomNo:r.room_number,bedNo:bedNumber}));
    setShowBedModal(false);
    setShowRoomModal(false);
    toast.success(`Room ${r.room_number} / Bed ${bedNumber} selected`);
  };

  const handleFormChange = e=>{
    const{name,value,type,files}=e.target;
    if(name==="packageNo"){
      const sel=packages.find(p=>String(p.packageNo)===value);
      setFormData(prev=>({...prev,packageNo:value,packageName:sel?sel.packageName:""}));
    }else{
      setFormData(prev=>({...prev,[name]:type==="file"?files[0]:value}));
    }
  };

  // ─── Print actual browser print ────────────────────────────────────────────
  const doPrint = ()=>{
    const w=window.open("","_blank","width=600,height=400");
    const pd=printData;
    const admDT=pd.admissionDateTime?new Date(pd.admissionDateTime):new Date();
    // Simple barcode bars
    let barsHtml="";
    const ipStr=pd.ipNumber||"";
    let xPos=0;
    for(let i=0;i<ipStr.length&&xPos<190;i++){
      const code=ipStr.charCodeAt(i);
      for(let b=0;b<7&&xPos<190;b++){
        const bw=((code>>b)&1)?2.5:1.2;
        if(i%2===0) barsHtml+=`<rect x="${xPos.toFixed(1)}" y="0" width="${bw}" height="44" fill="black"/>`;
        xPos+=bw+0.8;
      }
    }
    w.document.write(`<!DOCTYPE html><html><head><title>IP Admission Slip</title>
      <style>*{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:'Courier New',monospace;font-size:12px;padding:20px;}
      .slip{width:500px;border:2px solid #000;padding:14px;}
      .row{display:flex;justify-content:space-between;gap:12px;}
      .right{text-align:right;}
      .big{font-size:18px;font-weight:900;letter-spacing:.5px;}
      .bold{font-weight:700;font-size:12px;}
      .line{margin:2px 0;font-size:11px;}
      @media print{body{padding:0;}.slip{border:none;}}
      </style></head><body>
      <div class="slip">
        <div class="row">
          <div class="left">
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="44">${barsHtml}</svg>
            <div class="bold">${pName(pd)}</div>
            <div class="line">${pd.age||""} ${pd.gender||""}</div>
            <div class="line">S/o. ${pd.lastName||""}</div>
            <div class="line">${pd.permanent_address||""}</div>
            <div class="line">${[pd.area,pd.city,pd.state].filter(Boolean).join(", ")}</div>
            <div class="line">${pd.phone||pd.mobilePhone||""}</div>
            <div class="line">${pd.customerType||pd.customer_type||""}</div>
            <div class="line">Dr. ${pd.admittingDoctorName||getDoctorName(pd.admittingDoctor)}</div>
          </div>
          <div class="right">
            <div class="big">IP NO: ${pd.ipNumber||""}</div>
            <div class="line">${pd.insuranceCompanyName||""}</div>
            <div class="line">UHID : ${pd.uhid||""}</div>
            <div class="line">DOA : ${admDT.toLocaleDateString("en-IN")}</div>
            <div class="line">TIME: ${admDT.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})}</div>
            <div class="line">Room: ${pd.roomNo||""} / ${pd.bedNo||""}</div>
            ${pd.packageName?`<div class="line">Pkg: ${pd.packageName}</div>`:''}
            <div class="line">Adhar Number :</div>
          </div>
        </div>
      </div>
      <script>window.onload=function(){window.print();window.close();};<\/script>
      </body></html>`);
    w.document.close();
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <GlobalPrint />
      <Container style={{ padding:0 }}>

        {/* Header */}
        <PageHeader>
          <PageTitleEl>🏥 Admission Requests</PageTitleEl>
          <NewAdmBtn onClick={()=>{ setEditingId(null); setFormData(EMPTY_FORM); setShowForm(true); }}>
            + New Admission
          </NewAdmBtn>
        </PageHeader>

        {/* Stats */}
        <StatsRow>
          {[
            { label:"Total Admission Requests", value:stats.totalRequests,   icon:"👤", bg:"#eff6ff" },
            { label:"Todays Admissions",         value:stats.todayAdmissions, icon:"📅", bg:"#f0fdf4" },
            { label:"Todays Discharge",          value:stats.todayDischarge,  icon:"↗️", bg:"#fef9c3" },
            { label:"Avg Length of Stay",        value:stats.avgStay,         icon:"⏱️", bg:"#fdf4ff" },
          ].map((s,i)=>(
            <StatCard key={i} idx={i}>
              <StatIcon bg={s.bg}>{s.icon}</StatIcon>
              <StatInfo>
                <StatLabel>{s.label}</StatLabel>
                <StatValue>{s.value}</StatValue>
              </StatInfo>
            </StatCard>
          ))}
        </StatsRow>

        {/* Filters */}
        <FilterBar>
          <FField flex="1 1 180px">
            <FLabel>Admitting Doctor</FLabel>
            <FSelect value={filterDoctor} onChange={e=>{setFilterDoctor(e.target.value);setPage(1);}}>
              <option value="ALL">ALL</option>
              {doctors.map(d=>(
                <option key={d.employeeId} value={String(d.employeeId)}>{d.employeeName}</option>
              ))}
            </FSelect>
          </FField>
          <FField flex="0 0 150px">
            <FLabel>From Date</FLabel>
            <FInput type="date" value={filterFrom} onChange={e=>{setFilterFrom(e.target.value);setPage(1);}} />
          </FField>
          <FField flex="0 0 150px">
            <FLabel>To Date</FLabel>
            <FInput type="date" value={filterTo} onChange={e=>{setFilterTo(e.target.value);setPage(1);}} />
          </FField>
          <FField flex="0 0 140px">
            <FLabel>Status</FLabel>
            <FSelect value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setPage(1);}}>
              <option>All</option>
              <option>Admitted</option>
              <option>Discharged</option>
            </FSelect>
          </FField>
          <SearchBtn onClick={fetchAdmissions}>🔍 Search</SearchBtn>
        </FilterBar>

        {/* Table Top Bar */}
        <TableTopBar>
          <ShowSelect>
            Show up to&nbsp;
            <FSelect style={{width:60,height:26}} value={perPage} onChange={e=>{setPerPage(Number(e.target.value));setPage(1);}}>
              {[10,15,25,50].map(n=><option key={n}>{n}</option>)}
            </FSelect>
          </ShowSelect>
          <SearchBox>
            Search:&nbsp;
            <SInput value={tableSearch} onChange={e=>{setTableSearch(e.target.value);setPage(1);}} placeholder="Name / UHID…"/>
          </SearchBox>
        </TableTopBar>

        {/* Table */}
        <TableWrap>
          <Table>
            <Thead>
              <tr>
                <Th>Status</Th>
                <Th>Adm Date</Th>
                <Th>Time</Th>
                <Th>UHID</Th>
                <Th>Name</Th>
                <Th>Age</Th>
                <Th>Gender</Th>
                <Th>Admitting Dr.</Th>
                <Th>Room/Bed</Th>
                <Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {loading ? (
                <tr><Td colSpan={10} style={{textAlign:"center",padding:24}}>Loading…</Td></tr>
              ) : paginated.length===0 ? (
                <tr><Td colSpan={10} style={{textAlign:"center",padding:24,color:"#6b7280"}}>No admissions found</Td></tr>
              ) : paginated.map((adm,idx)=>(
                <Tr key={adm.ipNumber||idx} idx={idx}>
                  <Td>
                    <AdmBadge active={adm.is_admissionActive&&!adm.is_discharged}>
                      {adm.is_discharged?"Discharged":adm.is_admissionActive?"Admitted":"Cancelled"}
                    </AdmBadge>
                  </Td>
                  <Td>{adm.admissionDateTime?fmt(adm.admissionDateTime):"-"}</Td>
                  <Td>{adm.admissionDateTime?fmtT(adm.admissionDateTime):"-"}</Td>
                  <Td style={{fontWeight:600,color:"#0d9488"}}>{adm.uhid||"-"}</Td>
                  <Td style={{fontWeight:600}}>{pName(adm)}</Td>
                  <Td>{adm.age||"-"}</Td>
                  <Td>{adm.gender||"-"}</Td>
                  <Td>{adm.admittingDoctorName||getDoctorName(adm.admittingDoctor)}</Td>
                  <Td>{`${adm.roomNo||"-"}/${adm.bedNo||"-"}`}</Td>
                  <Td>
                    <ActionWrap ref={openMenuId===adm.ipNumber?menuRef:null}>
                      <DotBtn onClick={()=>setOpenMenuId(openMenuId===adm.ipNumber?null:adm.ipNumber)}>⋮</DotBtn>
                      {openMenuId===adm.ipNumber&&(
                        <DropMenu>
                          <DropItem onClick={()=>handleEdit(adm)}>✏️ Edit</DropItem>
                          <DropItem onClick={()=>handleCancel(adm)} danger disabled={!adm.is_admissionActive}>
                            🗑️ Cancel
                          </DropItem>
                          <DropItem onClick={()=>handlePrint(adm)}>🖨️ Print Admission Slip</DropItem>
                        </DropMenu>
                      )}
                    </ActionWrap>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>

        {/* Pagination */}
        <Pager>
          <span>Showing {Math.min((page-1)*perPage+1,filtered.length)}–{Math.min(page*perPage,filtered.length)} of {filtered.length} entries</span>
          <div style={{display:"flex",gap:4}}>
            <PBtn onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Previous</PBtn>
            {Array.from({length:totalPages},(_,i)=>i+1).slice(Math.max(0,page-3),page+2).map(n=>(
              <PBtn key={n} active={n===page} data-active={n===page||undefined} onClick={()=>setPage(n)}>{n}</PBtn>
            ))}
            <PBtn onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Next</PBtn>
          </div>
        </Pager>
      </Container>

      {/* ══ FORM MODAL ══════════════════════════════════════════════════ */}
      {showForm&&(
        <ModalOverlay onClick={()=>setShowForm(false)}>
          <FormModal onClick={e=>e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingId?"✏️ Edit Admission":"🏥 New Admission"}</ModalTitle>
              <CloseButton onClick={()=>setShowForm(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody style={{padding:0}}>
              <FormGrid>
                {/* Search */}
                <Field span={2}>
                  <Lbl required>UHID</Lbl>
                  <InputRow>
                    <Inp name="uhid" value={formData.uhid} onChange={handleFormChange}
                      placeholder="Enter UHID" readOnly={!!editingId}/>
                    <IconBtn type="button" onClick={fetchPatientByUHID} disabled={!!editingId}>🔍</IconBtn>
                  </InputRow>
                </Field>
                <Field span={2}>
                  <Lbl>IP Number</Lbl>
                  <Inp value={formData.ipNumber} readOnly style={{background:"#f3f4f6"}}/>
                </Field>
                <Field span={2}>
                  <Lbl>Date &amp; Time</Lbl>
                  <Inp value={`${fmt(now)}  ${now.toLocaleTimeString("en-IN")}`} readOnly style={{fontFamily:"monospace",background:"#f3f4f6"}}/>
                </Field>

                <SecDiv>Patient Details</SecDiv>
                <Field span={3}><Lbl>Patient Name</Lbl><Inp value={pName(formData)} readOnly/></Field>
                <Field><Lbl>Age</Lbl><Inp value={formData.age} readOnly/></Field>
                <Field><Lbl>Gender</Lbl><Inp value={formData.gender} readOnly/></Field>
                <Field><Lbl>Customer Type</Lbl><Inp value={formData.customerType} readOnly/></Field>
                <Field span={3}><Lbl>Insurance</Lbl><Inp value={formData.insuranceCompanyName||formData.insuranceCompany||""} readOnly placeholder="—"/></Field>
                <Field span={2}><Lbl>Phone</Lbl><Inp value={formData.phone} readOnly/></Field>
                <Field span={4}><Lbl>Address</Lbl><Inp value={formData.permanent_address} readOnly/></Field>
                <Field span={2}><Lbl>Area</Lbl><Inp value={formData.area} readOnly/></Field>
                <Field><Lbl>City</Lbl><Inp value={formData.city} readOnly/></Field>
                <Field><Lbl>State</Lbl><Inp value={formData.state} readOnly/></Field>
                <Field><Lbl>Zip</Lbl><Inp value={formData.zipcode} readOnly/></Field>

                <SecDiv>Clinical</SecDiv>
                <Field span={3}>
                  <Lbl required>Admitting Doctor</Lbl>
                  <Sel name="admittingDoctor" value={formData.admittingDoctor} onChange={handleFormChange}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d=><option key={d.employeeId} value={d.employeeId}>{d.employeeName}</option>)}
                  </Sel>
                </Field>
                <Field span={3}>
                  <Lbl>Consulting Doctor</Lbl>
                  <Sel name="consultingDoctor" value={formData.consultingDoctor} onChange={handleFormChange}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d=><option key={d.employeeId} value={d.employeeId}>{d.employeeName}</option>)}
                  </Sel>
                </Field>

                <SecDiv>Room &amp; Bed</SecDiv>
                <Field span={2}>
                  <Lbl required>Room No.</Lbl>
                  <InputRow>
                    <Inp name="roomNo" value={formData.roomNo} onChange={handleFormChange} placeholder="Click 🔍 to pick"/>
                    <IconBtn type="button" onClick={openRoomModal}>🔍</IconBtn>
                  </InputRow>
                </Field>
                <Field span={2}>
                  <Lbl required>Bed No.</Lbl>
                  <Inp name="bedNo" value={formData.bedNo} readOnly style={{background:"#f3f4f6"}} placeholder="Auto-filled"/>
                </Field>

                <SecDiv>Admission &amp; Package</SecDiv>
                <Field span={3}>
                  <Lbl>Reason for Admission</Lbl>
                  <Txta name="reasonForAdmission" value={formData.reasonForAdmission} onChange={handleFormChange} rows={2}/>
                </Field>
                <Field span={3}>
                  <Lbl>Package</Lbl>
                  <Sel name="packageNo" value={formData.packageNo} onChange={handleFormChange}>
                    <option value="">— Select Package —</option>
                    {packages.map(pkg=>(
                      <option key={pkg.packageNo} value={String(pkg.packageNo)}>
                        {pkg.packageName}{pkg.totalPrice?` (₹${pkg.totalPrice})`:""}
                      </option>
                    ))}
                  </Sel>
                  {formData.packageName&&!formData.packageNo&&(
                    <span style={{fontSize:".68rem",color:"#6b7280",marginTop:2}}>Current: {formData.packageName}</span>
                  )}
                </Field>

                <SecDiv>MLC (if applicable)</SecDiv>
                <Field span={2}>
                  <Lbl>MLC Type</Lbl>
                  <Sel name="mlc_type" value={formData.mlc_type} onChange={handleFormChange}>
                    <option value=""/>
                    <option value="Accident">Accident</option>
                    <option value="Assault">Assault</option>
                    <option value="Other">Other</option>
                  </Sel>
                </Field>
                <Field span={2}>
                  <Lbl>MLC Document</Lbl>
                  <Inp type="file" name="mlc_doc" onChange={handleFormChange} style={{paddingTop:3,height:"auto"}}/>
                </Field>
                <Field span={2}>
                  <Lbl>MLC Remarks</Lbl>
                  <Txta name="mlc_remarks" value={formData.mlc_remarks} onChange={handleFormChange} rows={2}/>
                </Field>
              </FormGrid>
              <FormActions>
                <SmBtn secondary onClick={()=>{setShowForm(false);setEditingId(null);setFormData(EMPTY_FORM);}}>Cancel</SmBtn>
                <SmBtn onClick={handleSubmit} disabled={saving}>{saving?"Saving…":editingId?"Update Admission":"Save Admission"}</SmBtn>
              </FormActions>
            </ModalBody>
          </FormModal>
        </ModalOverlay>
      )}

      {/* ══ ROOM PICKER MODAL ═══════════════════════════════════════════ */}
      {showRoomModal&&(
        <ModalOverlay onClick={()=>setShowRoomModal(false)}>
          <RoomModalContainer onClick={e=>e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🏨 Select Room</ModalTitle>
              <CloseButton onClick={()=>setShowRoomModal(false)}>×</CloseButton>
            </ModalHeader>
            <RoomModalBody>
              <FilterBarR>
                <FilterFieldR>
                  <FilterLabelR>Room Number</FilterLabelR>
                  <FilterInputR placeholder="e.g. 101" value={roomFilter.room_number}
                    onChange={e=>setRoomFilter(p=>({...p,room_number:e.target.value}))}
                    onKeyDown={e=>e.key==="Enter"&&fetchAllRooms()}/>
                </FilterFieldR>
                <FilterFieldR>
                  <FilterLabelR>Block</FilterLabelR>
                  <FilterInputR placeholder="e.g. A" value={roomFilter.block}
                    onChange={e=>setRoomFilter(p=>({...p,block:e.target.value}))}
                    onKeyDown={e=>e.key==="Enter"&&fetchAllRooms()}/>
                </FilterFieldR>
                <FilterFieldR>
                  <FilterLabelR>Floor</FilterLabelR>
                  <FilterInputR type="number" placeholder="e.g. 2" value={roomFilter.floor}
                    onChange={e=>setRoomFilter(p=>({...p,floor:e.target.value}))}
                    onKeyDown={e=>e.key==="Enter"&&fetchAllRooms()}/>
                </FilterFieldR>
                <FilterBtnR onClick={()=>fetchAllRooms()}>Search</FilterBtnR>
                <FilterBtnR style={{background:"#6b7280"}}
                  onClick={()=>{setRoomFilter({room_number:"",block:"",floor:""});fetchAllRooms({room_number:"",block:"",floor:""});}}>
                  Clear
                </FilterBtnR>
              </FilterBarR>
              <LegendBar>
                <LegendItem><LegendDot color="#22c55e"/>Available</LegendItem>
                <LegendItem><LegendDot color="#3b82f6"/>Partially Available</LegendItem>
                <LegendItem><LegendDot color="#ef4444"/>Fully Occupied</LegendItem>
                <LegendItem><LegendDot color="#f59e0b"/>Maintenance</LegendItem>
              </LegendBar>
              {loadingRooms?(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:8}}>
                  {Array.from({length:12}).map((_,i)=><Skeleton key={i}/>)}
                </div>
              ):Object.keys(groupedRooms).length===0?(
                <NoResults>No rooms found.</NoResults>
              ):Object.entries(groupedRooms).map(([block,floors],bIdx)=>(
                <BlockSection key={block} idx={bIdx}>
                  <BlockHeader>🏢 Block {block}</BlockHeader>
                  {Object.entries(floors).sort(([a],[b])=>Number(a)-Number(b)).map(([floor,rooms])=>(
                    <FloorGroup key={floor}>
                      <FloorLabel>Floor {floor}</FloorLabel>
                      <RoomGrid>
                        {rooms.map(room=>{
                          const status=getRoomStatus(room.beds);
                          return(
                            <RoomCard key={room.room_number} status={status} onClick={()=>handleRoomClick(room)}>
                              <RoomCardTop status={status}>
                                <RoomNum>{room.room_number}</RoomNum>
                                <RoomStatusPill status={status}>{status==="partial"?"Partial":status}</RoomStatusPill>
                              </RoomCardTop>
                              <RoomType>{room.room_type}{room.room_category?` · ${room.room_category}`:""}</RoomType>
                              <BedRow>
                                {(room.beds||[]).map((bed,i)=>(
                                  <BedChip key={i} bedStatus={bed.status} disabled={bed.status!=="Available"}
                                    onClick={e=>{
                                      if(bed.status==="Available"){
                                        e.stopPropagation();
                                        handleBedSelect(bed.bed_number,room);
                                      }
                                    }}>
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
              ))}
            </RoomModalBody>
          </RoomModalContainer>
        </ModalOverlay>
      )}

      {/* ══ BED SELECT FALLBACK MODAL ════════════════════════════════════ */}
      {showBedModal&&selectedRoom&&(
        <ModalOverlay onClick={()=>setShowBedModal(false)}>
          <ModalContainer onClick={e=>e.stopPropagation()} style={{maxWidth:420}}>
            <ModalHeader>
              <ModalTitle>Select Bed — Room {selectedRoom.room_number}</ModalTitle>
              <CloseButton onClick={()=>setShowBedModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{display:"flex",flexWrap:"wrap",gap:10,padding:12}}>
                {(selectedRoom.beds||[]).map((bed,i)=>{
                  const avail=bed.status==="Available";
                  return(
                    <BedChip key={i} bedStatus={bed.status} disabled={!avail}
                      style={{minWidth:70,height:42,fontSize:".82rem",flex:"1 1 70px"}}
                      onClick={()=>avail&&handleBedSelect(bed.bed_number,selectedRoom)}>
                      {bed.bed_number}<br/>
                      <span style={{fontSize:".6rem",opacity:.85}}>{bed.status}</span>
                    </BedChip>
                  );
                })}
                {(!selectedRoom.beds||selectedRoom.beds.length===0)&&<NoResults>No beds configured.</NoResults>}
              </div>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* ══ PRINT SLIP MODAL ════════════════════════════════════════════ */}
      {printData&&(
        <ModalOverlay onClick={()=>setPrintData(null)}>
          <PrintModalContainer onClick={e=>e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🖨️ Admission Slip</ModalTitle>
              <CloseButton onClick={()=>setPrintData(null)}>×</CloseButton>
            </ModalHeader>
            <PrintModalBody>
              <PrintSlip id="print-slip-content">
                <SlipRow>
                  <SlipLeft>
                    <BarcodeSVG value={printData.ipNumber} width={200} height={44}/>
                    <SlipBold>{pName(printData)}</SlipBold>
                    <SlipLine>{printData.age||""} {printData.gender||""}</SlipLine>
                    <SlipLine>S/o. {printData.lastName||""}</SlipLine>
                    <SlipLine>MAVAR 147, {printData.permanent_address||""}</SlipLine>
                    <SlipLine>{[printData.area,printData.city,printData.state].filter(Boolean).join(", ")}</SlipLine>
                    <SlipLine>{printData.phone||printData.mobilePhone||""}</SlipLine>
                    <SlipLine>{printData.customerType||printData.customer_type||""}</SlipLine>
                    <SlipLine>Dr. {printData.admittingDoctorName||getDoctorName(printData.admittingDoctor)}</SlipLine>
                  </SlipLeft>
                  <SlipRight>
                    <SlipBig>IP NO: {printData.ipNumber||""}</SlipBig>
                    <SlipLine>{printData.insuranceCompanyName||""}</SlipLine>
                    <SlipLine>UHID : {printData.uhid||""}</SlipLine>
                    <SlipLine>DOA : {printData.admissionDateTime?
                      new Date(printData.admissionDateTime).toLocaleDateString("en-IN"):"-"}</SlipLine>
                    <SlipLine>TIME: {printData.admissionDateTime?
                      new Date(printData.admissionDateTime).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}):"-"}</SlipLine>
                    <SlipLine>Room: {printData.roomNo||"-"}</SlipLine>
                    {printData.packageName&&<SlipLine>Pkg: {printData.packageName}</SlipLine>}
                    <SlipLine>Adhar Number :</SlipLine>
                  </SlipRight>
                </SlipRow>
              </PrintSlip>
              <PrintActions>
                <PrintBtn2 secondary onClick={()=>setPrintData(null)}>Close</PrintBtn2>
                <PrintBtn2 onClick={doPrint}>🖨️ Print</PrintBtn2>
              </PrintActions>
            </PrintModalBody>
          </PrintModalContainer>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default Admission;