import { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../../Auth/apiRequest";
import {
  PageWrapper, Container, ModalOverlay, ModalContainer,
  ModalHeader, ModalTitle, CloseButton, ModalBody, colors,
} from "../GlobalStyles";

// ─── Animations ────────────────────────────────────────────────────────────────
const fadeIn   = keyframes`from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}`;
const pulse    = keyframes`0%,100%{opacity:1}50%{opacity:.45}`;
const slideUp2 = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const openAnim = keyframes`from{max-height:0;opacity:0}to{max-height:2200px;opacity:1}`;

// ─── Page Shell ────────────────────────────────────────────────────────────────
const PageHeader = styled.div`
  background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);
  padding:11px 20px;display:flex;align-items:center;justify-content:space-between;
  border-radius:6px 6px 0 0;
`;
const PageTitle = styled.h2`font-size:.92rem;font-weight:700;color:#fff;margin:0;letter-spacing:.04em;`;
const NewAdmBtn = styled.button`
  height:32px;padding:0 16px;font-size:.8rem;font-weight:700;
  background:#f97316;color:#fff;border:none;border-radius:5px;cursor:pointer;
  display:flex;align-items:center;gap:6px;transition:background .2s;
  &:hover{background:#ea6c0a;}
`;

// ─── 2 Stat Cards ──────────────────────────────────────────────────────────────
const StatStrip = styled.div`display:grid;grid-template-columns:repeat(2,1fr);border-bottom:1px solid #e5e7eb;`;
const StatCard  = styled.div`
  padding:14px 22px;display:flex;align-items:center;gap:14px;
  border-right:1px solid #e5e7eb;&:last-child{border-right:none;}
  animation:${fadeIn} .35s ease both;animation-delay:${p=>p.i*.08}s;
`;
const SIcon  = styled.div`width:44px;height:44px;border-radius:10px;background:${p=>p.bg||'#f0fdf4'};display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;`;
const SLabel = styled.div`font-size:.68rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;`;
const SValue = styled.div`font-size:1.7rem;font-weight:800;color:#111827;line-height:1.1;`;

// ─── Filter Bar ────────────────────────────────────────────────────────────────
const FilterBar = styled.div`display:flex;gap:10px;align-items:flex-end;padding:12px 20px;border-bottom:1px solid #e5e7eb;flex-wrap:wrap;background:#fafafa;`;
const FF  = styled.div`display:flex;flex-direction:column;gap:3px;flex:${p=>p.flex||'1 1 140px'};`;
const FL  = styled.label`font-size:.68rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;`;
const FSel= styled.select`height:32px;padding:0 8px;font-size:.78rem;border:1px solid #d1d5db;border-radius:5px;background:#fff;color:#111827;outline:none;&:focus{border-color:#0d9488;}`;
const FInp= styled.input`height:32px;padding:0 8px;font-size:.78rem;border:1px solid #d1d5db;border-radius:5px;background:#fff;color:#111827;outline:none;&:focus{border-color:#0d9488;}`;
const SearchBtn=styled.button`height:32px;padding:0 18px;font-size:.78rem;font-weight:600;background:#0d9488;color:#fff;border:none;border-radius:5px;cursor:pointer;display:flex;align-items:center;gap:5px;&:hover{background:#0f766e;}`;

// ─── Slide-down Form Panel ──────────────────────────────────────────────────────
const FormPanel = styled.div`
  overflow:hidden;border-bottom:2px solid #0d9488;
  animation:${openAnim} .4s ease both;
`;
const FPHead = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  padding:9px 20px;background:#f0fdf4;border-bottom:1px solid #d1fae5;
`;
const FPTitle = styled.div`font-size:.82rem;font-weight:700;color:#0d9488;display:flex;align-items:center;gap:8px;`;
const CloseFP = styled.button`width:26px;height:26px;border-radius:50%;border:1px solid #d1fae5;background:#fff;cursor:pointer;font-size:1rem;color:#6b7280;display:flex;align-items:center;justify-content:center;&:hover{background:#fee2e2;color:#dc2626;}`;
// ─── Form internals ────────────────────────────────────────────────────────────
const FGrid  = styled.div`display:grid;grid-template-columns:repeat(6,1fr);gap:6px 12px;padding:14px 20px;`;
const Field  = styled.div`display:flex;flex-direction:column;gap:2px;grid-column:span ${p=>p.span||1};`;
const Lbl    = styled.label`font-size:.7rem;font-weight:600;color:#374151;&::after{content:${p=>p.req?'" *"':'""'};color:#ef4444;}`;
const Inp    = styled.input`height:28px;padding:0 7px;font-size:.75rem;border:1px solid #d1d5db;border-radius:4px;background:${p=>p.readOnly?'#f3f4f6':'#fff'};color:${p=>p.readOnly?'#6b7280':'#111827'};outline:none;width:100%;box-sizing:border-box;&:focus{border-color:#0d9488;box-shadow:0 0 0 2px #ccfbf1;}`;
const Sel    = styled.select`height:28px;padding:0 4px;font-size:.75rem;border:1px solid #d1d5db;border-radius:4px;background:#fff;color:#111827;outline:none;width:100%;box-sizing:border-box;&:focus{border-color:#0d9488;}&:disabled{background:#f3f4f6;color:#6b7280;}`;
const Txta   = styled.textarea`padding:4px 7px;font-size:.75rem;border:1px solid #d1d5db;border-radius:4px;resize:vertical;min-height:44px;width:100%;box-sizing:border-box;&:focus{border-color:#0d9488;outline:none;}`;
const SecDiv = styled.div`grid-column:span 6;border-top:1px solid #e5e7eb;margin:4px 0 2px;padding-top:6px;font-size:.7rem;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.05em;`;
const IRow   = styled.div`display:flex;align-items:center;gap:3px;`;
const IconBtn= styled.button`height:28px;padding:0 9px;font-size:.72rem;background:#0d9488;color:#fff;border:none;border-radius:4px;cursor:pointer;white-space:nowrap;flex-shrink:0;&:hover{background:#0f766e;}&:disabled{opacity:.5;cursor:not-allowed;}`;
const FActions=styled.div`display:flex;gap:8px;justify-content:flex-end;padding:10px 20px 16px;border-top:1px solid #e5e7eb;margin-top:4px;`;
const SmBtn  = styled.button`height:30px;padding:0 18px;font-size:.75rem;font-weight:600;border-radius:4px;border:none;cursor:pointer;background:${p=>p.secondary?'#e5e7eb':'#0d9488'};color:${p=>p.secondary?'#374151':'#fff'};&:hover{opacity:.88;}&:disabled{opacity:.5;cursor:not-allowed;}`;

// ─── Table ─────────────────────────────────────────────────────────────────────
const TTBar = styled.div`display:flex;align-items:center;justify-content:space-between;padding:10px 20px;border-bottom:1px solid #e5e7eb;`;
const TWrap = styled.div`overflow-x:auto;`;
const Tbl   = styled.table`width:100%;border-collapse:collapse;font-size:.78rem;`;
const Thead = styled.thead`background:#f9fafb;`;
const Th    = styled.th`padding:9px 12px;text-align:left;font-size:.68rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb;white-space:nowrap;`;
const Tr    = styled.tr`border-bottom:1px solid #f3f4f6;animation:${fadeIn} .28s ease both;animation-delay:${p=>p.i*.035}s;&:hover{background:#f0fdf4;}`;
const Td    = styled.td`padding:8px 12px;color:#374151;white-space:nowrap;`;
const Badge = styled.span`
  padding:2px 10px;border-radius:20px;font-size:.67rem;font-weight:700;
  background:${p=>p.t==='admitted'?'#dcfce7':p.t==='discharged'?'#dbeafe':'#fee2e2'};
  color:${p=>p.t==='admitted'?'#166534':p.t==='discharged'?'#1d4ed8':'#991b1b'};
`;

// ─── FIX #4: Action menu uses fixed positioning to avoid table clipping ─────────
const AW   = styled.div`position:relative;display:inline-block;`;
const DotB = styled.button`width:28px;height:28px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;color:#6b7280;&:hover{background:#f3f4f6;}`;
const Drop = styled.div`
  position:fixed;
  top:${p=>p.top}px;
  left:${p=>p.left}px;
  background:#fff;border:1px solid #e5e7eb;border-radius:7px;
  box-shadow:0 8px 28px rgba(0,0,0,.16);
  z-index:9999;min-width:190px;overflow:hidden;
  animation:${fadeIn} .14s ease;
`;
const DI = styled.button`
  width:100%;padding:9px 14px;text-align:left;font-size:.78rem;font-weight:500;
  background:none;border:none;display:flex;align-items:center;gap:8px;
  color:${p=>p.disabled?'#9ca3af':p.danger?'#dc2626':'#374151'};
  cursor:${p=>p.disabled?'not-allowed':'pointer'};
  &:hover:not(:disabled){background:${p=>p.danger?'#fff1f2':'#f0fdf4'};}
`;

// ─── Pagination ────────────────────────────────────────────────────────────────
const Pager = styled.div`display:flex;align-items:center;justify-content:space-between;padding:10px 20px;border-top:1px solid #e5e7eb;font-size:.75rem;color:#6b7280;`;
const PB    = styled.button`height:28px;padding:0 13px;font-size:.75rem;border:1px solid #e5e7eb;border-radius:4px;background:${p=>p.active?'#0d9488':'#fff'};color:${p=>p.active?'#fff':'#374151'};cursor:pointer;&:disabled{opacity:.45;cursor:default;}&:hover:not(:disabled){background:${p=>p.active?'#0d9488':'#f3f4f6'};}`;

// ─── Room Picker Modal ──────────────────────────────────────────────────────────
const RMC  = styled(ModalContainer)`max-width:960px;max-height:88vh;`;
const RMB  = styled(ModalBody)`background:#f8fafc;padding:14px;`;
const FBR  = styled.div`display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:flex-end;`;
const FFR  = styled.div`display:flex;flex-direction:column;gap:2px;flex:1 1 120px;`;
const FLR  = styled.label`font-size:.68rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;`;
const FIR  = styled.input`height:28px;padding:0 7px;font-size:.75rem;border:1px solid #d1d5db;border-radius:4px;background:#fff;outline:none;width:100%;box-sizing:border-box;&:focus{border-color:#0d9488;}`;
const FBR2 = styled.button`height:28px;padding:0 14px;font-size:.75rem;font-weight:600;border-radius:4px;border:none;cursor:pointer;background:${p=>p.clear?'#6b7280':'#0d9488'};color:#fff;align-self:flex-end;&:hover{opacity:.88;}`;
const LBar = styled.div`display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;padding:6px 12px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;`;
const LI   = styled.div`display:flex;align-items:center;gap:5px;font-size:.72rem;font-weight:500;color:#6b7280;`;
const LD   = styled.span`display:inline-block;width:12px;height:12px;border-radius:3px;background:${p=>p.c};flex-shrink:0;`;
const BS2  = styled.div`background:#fff;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:14px;overflow:hidden;animation:${slideUp2} .25s ease both;animation-delay:${p=>p.i*40}ms;`;
const BH2  = styled.div`padding:7px 12px;background:#f0fdf4;border-bottom:1px solid #e5e7eb;font-size:.78rem;font-weight:700;color:#0d9488;`;
const FG2  = styled.div`padding:10px 12px;`;
const FL2  = styled.div`font-size:.68rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;display:flex;align-items:center;gap:6px;&::after{content:"";flex:1;height:1px;background:#e5e7eb;}`;
const RG2  = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:8px;margin-bottom:10px;`;
const rC = {
  available:     { bg:"#f0fdf4", br:"#86efac", hd:"#dcfce7", dot:"#22c55e" },
  "available-not-cleaned": { bg:"#fefce8", br:"#fde047", hd:"#fef9c3", dot:"#eab308" },
  occupied:      { bg:"#fff1f2", br:"#fca5a5", hd:"#fee2e2", dot:"#ef4444" },
  maintenance:   { bg:"#f3f4f6", br:"#9ca3af", hd:"#e5e7eb", dot:"#9ca3af" },
  partial:       { bg:"#eff6ff", br:"#93c5fd", hd:"#dbeafe", dot:"#3b82f6" },
  reserved:      { bg:"#faf5ff", br:"#c084fc", hd:"#f3e8ff", dot:"#9333ea" },
};
const RC = styled.div`
  border:1.5px solid ${p=>rC[p.s]?.br||'#e5e7eb'};border-radius:7px;overflow:hidden;
  cursor:${p=>(p.s==='occupied'||p.s==='maintenance'||p.s==='reserved')?'not-allowed':'pointer'};
  opacity:${p=>(p.s==='occupied'||p.s==='maintenance'||p.s==='reserved')?.72:1};
  background:${p=>rC[p.s]?.bg||'#fff'};
  transition:box-shadow .18s,transform .18s;
  ${p=>(p.s!=='occupied'&&p.s!=='maintenance'&&p.s!=='reserved')&&'&:hover{box-shadow:0 4px 14px rgba(0,0,0,.13);transform:translateY(-2px);}'}
`;
const RCT  = styled.div`display:flex;align-items:center;justify-content:space-between;padding:5px 8px;background:${p=>rC[p.s]?.hd||'#f1f5f9'};border-bottom:1px solid ${p=>rC[p.s]?.br||'#e5e7eb'};`;
const RNum = styled.span`font-size:.78rem;font-weight:700;color:#111827;`;
const RSP = styled.span`
  font-size:.6rem;font-weight:700;padding:1px 6px;border-radius:10px;
  background:${p=>
    p.s==='available'           ? '#22c55e'
  : p.s==='occupied'            ? '#ef4444'
  : p.s==='maintenance'         ? '#9ca3af'
  : p.s==='reserved'            ? '#9333ea'
  : p.s==='partial'             ? '#3b82f6'
  : '#eab308'};
  color:#fff;text-transform:capitalize;
`;
const BRow = styled.div`display:flex;flex-wrap:wrap;gap:4px;padding:6px 8px;`;
const BC = styled.button`
  flex:1 1 auto;min-width:44px;text-align:center;padding:4px 5px;border-radius:5px;
  font-size:.67rem;font-weight:700;border:none;
  cursor:${p=>p.disabled?'not-allowed':'pointer'};color:#fff;
  background:${p=>
    p.bs==='Available'                 ? '#22c55e'
  : p.bs==='Occupied'                  ? '#ef4444'
  : p.bs==='Available - Not Cleaned'   ? '#eab308'
  : p.bs==='Reserved'                  ? '#9333ea'
  : '#9ca3af'};
  opacity:${p=>p.disabled?.55:1};
  transition:filter .15s,transform .15s,box-shadow .15s;
  &:hover:not(:disabled){filter:brightness(1.1);transform:scale(1.06);box-shadow:0 2px 8px rgba(0,0,0,.18);}
`;
const RT2  = styled.span`font-size:.6rem;color:#6b7280;padding:0 8px 4px;display:block;`;
const Skel = styled.div`height:100px;border-radius:7px;background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:${pulse} 1.4s ease-in-out infinite;`;
const NR   = styled.div`text-align:center;padding:30px;color:#6b7280;font-size:.8rem;`;

// ─── Print Slip Modal ───────────────────────────────────────────────────────────
const PMC  = styled(ModalContainer)`max-width:520px;`;
const PMB  = styled(ModalBody)`padding:0;background:#fff;`;
const Slip = styled.div`padding:16px;font-family:'Courier New',monospace;font-size:12px;color:#000;border:2px solid #000;margin:16px;`;
const SR   = styled.div`display:flex;justify-content:space-between;gap:12px;`;
const SL   = styled.div`flex:1;`;
const SRt  = styled.div`text-align:right;`;
const SBig = styled.div`font-size:18px;font-weight:900;letter-spacing:.5px;`;
const SLn  = styled.div`margin:2px 0;font-size:11px;`;
const SBold= styled.div`font-weight:700;margin:2px 0;font-size:12px;`;
const PA   = styled.div`display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid #e5e7eb;`;
const PBt  = styled.button`height:32px;padding:0 16px;font-size:.78rem;font-weight:600;border-radius:4px;border:none;cursor:pointer;background:${p=>p.sec?'#e5e7eb':'#7c3aed'};color:${p=>p.sec?'#374151':'#fff'};&:hover{opacity:.88;}`;

// ─── FIX #3: Code 128B Barcode — scanning returns the encoded IP number ──────────
const CODE128_PATTERNS = [
  "11011001100","11001101100","11001100110","10010011000","10010001100",
  "10001001100","10011001000","10011000100","10001100100","11001001000",
  "11001000100","11000100100","10110011100","10011011100","10011001110",
  "10111001100","10011101100","10011100110","11001110010","11001011100",
  "11001001110","11011100100","11001110100","11101101110","11101001100",
  "11100101100","11100100110","11101100100","11100110100","11100110010",
  "11011011000","11011000110","11000110110","10100011000","10001011000",
  "10001000110","10110001000","10001101000","10001100010","11010001000",
  "11000101000","11000100010","10110111000","10110001110","10001101110",
  "10111011000","10111000110","10001110110","11101110110","11010001110",
  "11000101110","11011101000","11011100010","11011101110","11101011000",
  "11101000110","11100010110","11101101000","11101100010","11100011010",
  "11101111010","11001000010","11110001010","10100110000","10100001100",
  "10010110000","10010000110","10000101100","10000100110","10110010000",
  "10110000100","10011010000","10011000010","10000110100","10000110010",
  "11000010010","11001010000","11110111010","11000010100","10001111010",
  "10100111100","10010111100","10010011110","10111100100","10011110100",
  "10011110010","11110100100","11110010100","11110010010","11011011110",
  "11011110110","11110110110","10101111000","10100011110","10001011110",
  "10111101000","10111100010","11110101000","11110100010","10111011110",
  "10111101110","11101011110","11110101110","11010000100","11010010000",
  "11010011100","1100011101011",
];
const START_B       = 104;
const START_PATTERN = "11010010000";
const STOP_PATTERN  = "1100011101011";

function encodeCode128(text) {
  const bars = [START_PATTERN];
  let checksum = START_B;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i) - 32;
    if (c < 0 || c > 95) continue;
    checksum += (i + 1) * c;
    bars.push(CODE128_PATTERNS[c] || CODE128_PATTERNS[0]);
  }
  bars.push(CODE128_PATTERNS[checksum % 103] || CODE128_PATTERNS[0]);
  bars.push(STOP_PATTERN);
  return bars.join("");
}

function BarcodeSVG({ value = "", width = 240, height = 64, showText = true }) {
  if (!value) return null;
  const encoded  = encodeCode128(value);
  const modW     = width / (encoded.length || 1);
  const barH     = showText ? height - 16 : height;
  const rects    = [];
  let x = 0;
  for (let i = 0; i < encoded.length; i++) {
    if (i % 2 === 0) rects.push({ x, w: modW });
    x += modW;
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}
      style={{ display: "block" }} viewBox={`0 0 ${width} ${height}`}>
      {rects.map((r, i) => (
        <rect key={i} x={r.x.toFixed(2)} y={0}
          width={Math.max(r.w, 0.6).toFixed(2)} height={barH} fill="#000" />
      ))}
      {showText && (
        <text x={width / 2} y={height} textAnchor="middle"
          fontFamily="'Courier New',monospace" fontSize="10" fill="#000" letterSpacing="1.5">
          {value}
        </text>
      )}
    </svg>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function parseJsonField(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  if (typeof value === "string") {
    try { const p = JSON.parse(value); return Array.isArray(p) ? p : [p]; } catch { return []; }
  }
  return [];
}

const EMPTY = {
  uhid:"",ipNumber:"",admittingDoctor:"",consultingDoctor:"",
  roomNo:"",bedNo:"",reasonForAdmission:"",packageName:"",packageNo:"",
  mlc_type:"",mlc_doc:null,mlc_remarks:"",
  salutation:"",firstName:"",middleName:"",lastName:"",
  age:"",gender:"",mobilePhone:"",permanent_address:"",
  area:"",zipcode:"",city:"",state:"",
  customerType:"",insuranceCompanyName:"",company_code:"",
};

const getRoomStatus = beds => {
  if (!beds?.length) return "available";
  const s = beds.map(b => b.status);
  if (s.every(x => x === "Maintenance"))                    return "maintenance";
  if (s.every(x => x === "Occupied"))                       return "occupied";
  if (s.every(x => x === "Reserved"))                       return "reserved";
  if (s.every(x => x === "Available - Not Cleaned"))        return "available-not-cleaned";
  if (s.some(x => x === "Occupied") && s.some(x => x !== "Occupied")) return "partial";
  if (s.some(x => x === "Reserved") && !s.some(x => x === "Occupied")) return "reserved";
  if (s.some(x => x === "Available - Not Cleaned") && !s.some(x => x === "Occupied")) return "available-not-cleaned";
  return "available";
};

const fmtDate = d => new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"2-digit", year:"numeric" });
const fmtTime = d => new Date(d).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });

// ─── Component ─────────────────────────────────────────────────────────────────
export default function Admission() {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [admissions, setAdmissions] = useState([]);
  const [doctors,    setDoctors]    = useState([]);
  const [packages,   setPackages]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const [fDoctor, setFDoctor] = useState("ALL");
  const [fFrom,   setFFrom]   = useState(today);
  const [fTo,     setFTo]     = useState(today);
  const [fStatus, setFStatus] = useState("All");
  const [tSearch, setTSearch] = useState("");
  const [perPage, setPerPage] = useState(15);
  const [page,    setPage]    = useState(1);

  const [formOpen,   setFormOpen]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(EMPTY);

  const [showRoom,   setShowRoom]   = useState(false);
  const [rFilter,    setRFilter]    = useState({ room_number:"", block:"", floor:"" });
  const [allRooms,   setAllRooms]   = useState([]);
  const [loadRooms,  setLoadRooms]  = useState(false);
  const [showBed,    setShowBed]    = useState(false);
  const [selRoom,    setSelRoom]    = useState(null);

  const [printData,  setPrintData]  = useState(null);

  // ── FIX #4 state: track which row's menu is open + fixed pixel coords ────────
  const [openMenu, setOpenMenu] = useState(null);   // ipNumber string | null
  const [menuPos,  setMenuPos]  = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  const handleMenuToggle = (ipNumber, e) => {
    if (openMenu === ipNumber) { setOpenMenu(null); return; }
    const rect      = e.currentTarget.getBoundingClientRect();
    const menuWidth = 190;
    let left = rect.right - menuWidth;
    let top  = rect.bottom + 4;
    if (left < 8) left = 8;
    if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
    setMenuPos({ top, left });
    setOpenMenu(ipNumber);
  };

  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { fetchDoctors(); fetchAdmissions(); fetchPackages(); }, []);

  // ── API ──────────────────────────────────────────────────────────────────────
  const fetchDoctors = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
      if (res.success) setDoctors(res.data || []);
    } catch {}
  };

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (fFrom)         p.append("from_date",        fFrom);
      if (fTo)           p.append("to_date",           fTo);
      if (fDoctor !== "ALL") p.append("admitting_doctor", fDoctor);
      if (fStatus !== "All") p.append("status",           fStatus);
      const q = p.toString() ? `?${p.toString()}` : "";
      const res = await apiRequest(`${HmsBaseUrl}admission/${q}`, "GET");
      setAdmissions(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch { setAdmissions([]); }
    finally { setLoading(false); }
  };

  const fetchPackages = async () => {
    try {
      const res  = await apiRequest(`${HmsBaseUrl}packages/`, "GET");
      const list = res?.packages || res?.data?.packages || res?.data || [];
      setPackages(Array.isArray(list) ? list : []);
    } catch { setPackages([]); }
  };

const fetchAllRooms = async (fo = {}) => {
  setLoadRooms(true);
  try {
    const f = { ...rFilter, ...fo };
    const p = new URLSearchParams();
    if (f.room_number) p.append("room_number", f.room_number);
    if (f.block)       p.append("block",        f.block);
    if (f.floor)       p.append("floor",        f.floor);
    const q   = p.toString() ? `?${p.toString()}` : "";
    const res = await apiRequest(`${HmsBaseUrl}search-rooms/${q}`, "GET");
    
    // Robustly extract the array from whatever shape the response has
    let rooms = [];
    if (Array.isArray(res))            rooms = res;
    else if (Array.isArray(res?.data)) rooms = res.data;
    else if (Array.isArray(res?.data?.data)) rooms = res.data.data;
    
    setAllRooms(rooms);
  } catch { setAllRooms([]); }
  finally { setLoadRooms(false); }
};
  const fetchPatientByUHID = async () => {
    const uhid = form.uhid.trim();
    if (!uhid) return toast.warning("Enter UHID");
    try {
      const res = await apiRequest(`${HmsBaseUrl}op-patient/${encodeURIComponent(uhid)}/`, "GET");
      if (!res.success) { toast.error(res.error || "Patient not found"); return; }
      const d = res.data;
      setForm(p => ({
        ...p,
        salutation: d.salutation || "", firstName: d.firstName || "",
        middleName: d.middleName || "", lastName: d.lastName || "",
        age: d.age || "", gender: d.gender || "",
        mobilePhone: d.mobilePhone || d.phone || "",
        permanent_address: d.permanent_address || "", area: d.area || "",
        zipcode: d.zipcode || "", city: d.city || "", state: d.state || "",
        customerType: d.customerType || d.customer_type || "",
        insuranceCompanyName: d.insuranceCompanyName || "",
        company_code: d.company_code || "",
      }));
      toast.success("Patient loaded");
    } catch { toast.error("Failed to fetch patient"); }
  };

  // ── FIX #1: Search admission by IP Number ────────────────────────────────────
  const fetchAdmissionByIP = async () => {
    const ip = form.ipNumber.trim();
    if (!ip) return toast.warning("Enter IP Number");
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}admission/?ip_number=${encodeURIComponent(ip)}`, "GET"
      );
      if (!res.success) throw new Error(res.error || "Not found");
      const list = Array.isArray(res.data?.data) ? res.data.data
                 : Array.isArray(res.data)        ? res.data
                 : [];
      if (!list.length) return toast.error("No admission found for this IP Number");
      const adm = list[0];
      setEditingId(adm.ipNumber || ip);
      setForm({
        ...EMPTY,
        uhid:                 adm.uhid                || "",
        ipNumber:             adm.ipNumber            || ip,
        admittingDoctor:      adm.admittingDoctor      || "",
        consultingDoctor:     adm.consultingDoctor     || "",
        roomNo:               adm.roomNo              || "",
        bedNo:                adm.bedNo               || "",
        reasonForAdmission:   adm.reasonForAdmission  || "",
        packageName:          adm.packageName         || "",
        packageNo:            adm.packageNo           || "",
        mlc_type:             adm.mlc_type            || "",
        mlc_remarks:          adm.mlc_remarks         || "",
        salutation:           adm.salutation          || "",
        firstName:            adm.firstName           || "",
        middleName:           adm.middleName          || "",
        lastName:             adm.lastName            || "",
        age:                  adm.age                 || "",
        gender:               adm.gender              || "",
        mobilePhone:          adm.mobilePhone         || "",
        permanent_address:    adm.permanent_address   || "",
        area:                 adm.area                || "",
        zipcode:              adm.zipcode             || "",
        city:                 adm.city                || "",
        state:                adm.state               || "",
        customerType:         adm.customerType        || "",
        insuranceCompanyName: adm.insuranceCompanyName|| "",
        company_code:         adm.company_code        || "",
      });
      toast.success(`Admission loaded: ${adm.ipNumber || ip}`);
    } catch (err) {
      toast.error(err.message || "Admission not found");
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = {
    admitted:   admissions.filter(a => a.is_admitted || (a.is_admissionActive && !a.is_discharged)).length,
    discharged: admissions.filter(a => a.is_discharged).length,
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getDrName = id => doctors.find(d => String(d.employeeId) === String(id))?.employeeName || String(id || "-");
  const pName = d => [d.salutation, d.firstName, d.middleName, d.lastName].filter(Boolean).join(" ") || "-";

  // ── FIX #2: Derive cancelled status cleanly ───────────────────────────────────
  const getAdmStatus = adm =>
    adm.is_discharged      ? "discharged"
  : adm.is_admissionActive  ? "admitted"
  :                           "cancelled";

  // ── Client-side search ───────────────────────────────────────────────────────
  const filtered = admissions.filter(a => {
    if (!tSearch) return true;
    const q = tSearch.toLowerCase();
    return `${a.uhid} ${a.ipNumber} ${pName(a)} ${getDrName(a.admittingDoctor)} ${a.roomNo||""} ${a.bedNo||""}`.toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const openNewForm  = () => { setEditingId(null); setForm(EMPTY); setFormOpen(true); };
  const openEditForm = adm => {
    setOpenMenu(null); setEditingId(adm.ipNumber);
    setForm({
      ...EMPTY,
      uhid: adm.uhid || "", ipNumber: adm.ipNumber || "",
      admittingDoctor: adm.admittingDoctor || "", consultingDoctor: adm.consultingDoctor || "",
      roomNo: adm.roomNo || "", bedNo: adm.bedNo || "",
      reasonForAdmission: adm.reasonForAdmission || "", packageName: adm.packageName || "",
      mlc_type: adm.mlc_type || "", mlc_remarks: adm.mlc_remarks || "",
      salutation: adm.salutation || "", firstName: adm.firstName || "", lastName: adm.lastName || "",
      age: adm.age || "", gender: adm.gender || "", mobilePhone: adm.mobilePhone || "",
      permanent_address: adm.permanent_address || "", area: adm.area || "",
      zipcode: adm.zipcode || "", city: adm.city || "", state: adm.state || "",
      customerType: adm.customerType || "", insuranceCompanyName: adm.insuranceCompanyName || "",
    });
    setFormOpen(true); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const closeForm = () => { setFormOpen(false); setEditingId(null); setForm(EMPTY); };

  const handleFormChange = e => {
    const { name, value, type, files } = e.target;
    if (name === "packageNo") {
      const sel = packages.find(p => String(p.packageNo) === value);
      setForm(p => ({ ...p, packageNo: value, packageName: sel ? sel.packageName : "" }));
    } else {
      setForm(p => ({ ...p, [name]: type === "file" ? files[0] : value }));
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!editingId && !form.uhid) return toast.warning("UHID is required");
    if (!form.admittingDoctor)    return toast.warning("Admitting Doctor is required");
    if (!form.roomNo)             return toast.warning("Room is required");
    if (!form.bedNo)              return toast.warning("Bed is required");
    setSaving(true);
    const payload = new FormData();
    ["uhid","admittingDoctor","consultingDoctor","roomNo","bedNo",
     "reasonForAdmission","packageName","mlc_type","mlc_remarks"]
      .forEach(k => { if (form[k]) payload.append(k, form[k]); });
    payload.append("admissionDateTime", new Date().toISOString());
    if (form.mlc_doc instanceof File) payload.append("mlc_doc", form.mlc_doc);
    try {
      let res;
      if (editingId) res = await apiRequest(`${HmsBaseUrl}admission/${encodeURIComponent(editingId)}/`, "PUT",  payload);
      else           res = await apiRequest(`${HmsBaseUrl}admission/`,                                   "POST", payload);
      if (res.success) { toast.success(editingId ? "Admission updated!" : "Admission saved!"); closeForm(); fetchAdmissions(); }
      else toast.error(res.error || "Failed to save");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleCancel = async adm => {
    setOpenMenu(null);
    if (!window.confirm(`Cancel admission for ${pName(adm)}?`)) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}admission/${encodeURIComponent(adm.ipNumber)}/`, "DELETE");
      if (res.success) { toast.success("Admission cancelled"); fetchAdmissions(); }
      else toast.error(res.error || "Failed");
    } catch { toast.error("Failed to cancel"); }
  };

  const handlePrint = adm => {
    setOpenMenu(null);
    setPrintData({ ...adm, admittingDoctorName: getDrName(adm.admittingDoctor) });
  };

  // ── Print window ─────────────────────────────────────────────────────────────
  const doPrint = () => {
    const pd    = printData;
    const admDT = pd.admissionDateTime ? new Date(pd.admissionDateTime) : new Date();
    const ipStr = pd.ipNumber || "";

    const encoded = encodeCode128(ipStr);
    const bW      = 240;
    const modW    = bW / encoded.length;
    let barsHtml  = "";
    let xPos      = 0;
    for (let i = 0; i < encoded.length; i++) {
      if (i % 2 === 0)
        barsHtml += `<rect x="${xPos.toFixed(2)}" y="0" width="${Math.max(modW, 0.6).toFixed(2)}" height="50" fill="black"/>`;
      xPos += modW;
    }

    const w = window.open("", "_blank", "width=640,height=440");
    w.document.write(`<!DOCTYPE html><html><head><title>IP Admission Slip</title>
<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Courier New',monospace;font-size:12px;padding:20px;}
.slip{width:540px;border:2px solid #000;padding:14px;}.row{display:flex;justify-content:space-between;gap:14px;}
.right{text-align:right;}.big{font-size:18px;font-weight:900;letter-spacing:.5px;}.bold{font-weight:700;font-size:12px;}
.line{margin:2px 0;font-size:11px;}.bc-label{font-family:'Courier New',monospace;font-size:9px;text-align:center;display:block;letter-spacing:1.5px;margin-bottom:4px;}
@media print{body{padding:0;}.slip{border:none;}}</style>
</head><body><div class="slip"><div class="row">
<div class="left">
  <svg xmlns="http://www.w3.org/2000/svg" width="${bW}" height="50" viewBox="0 0 ${bW} 50">${barsHtml}</svg>
  <span class="bc-label">${ipStr}</span>
  <div class="bold">${pName(pd)}</div>
  <div class="line">${pd.age || ""} ${pd.gender || ""}</div>
  <div class="line">${pd.permanent_address || ""}</div>
  <div class="line">${[pd.area, pd.city, pd.state].filter(Boolean).join(", ")}</div>
  <div class="line">${pd.mobilePhone || ""}</div>
  <div class="line">Admitted: Dr. ${pd.admittingDoctorName || getDrName(pd.admittingDoctor)}</div>
</div>
<div class="right">
  <div class="big">IP NO: ${ipStr}</div>
  <div class="line">${pd.insuranceCompanyName || ""}</div>
  <div class="line">UHID : ${pd.uhid || ""}</div>
  <div class="line">DOA  : ${admDT.toLocaleDateString("en-IN")}</div>
  <div class="line">TIME : ${admDT.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})}</div>
  <div class="line">Room : ${pd.roomNo || "-"} / ${pd.bedNo || "-"}</div>
</div></div></div>
<script>window.onload=function(){window.print();window.close();};<\/script></body></html>`);
    w.document.close();
  };

  // ── Room helpers ─────────────────────────────────────────────────────────────
  const openRoomModal = () => { setShowRoom(true); fetchAllRooms(); };
  const grouped = (() => {
    const g = {};
    allRooms.forEach(r => {
      const bl = r.block || "UNKNOWN", fl = r.floor ?? "?";
      if (!g[bl]) g[bl] = {};
      if (!g[bl][fl]) g[bl][fl] = [];
      g[bl][fl].push(r);
    });
    return g;
  })();
  const handleRoomClick = room => {
    const s = getRoomStatus(room.beds);
    if (s === "occupied" || s === "maintenance" || s === "reserved") return;
    setSelRoom(room); setShowRoom(false); setShowBed(true);
  };
  const handleBedSelect = (bedNo, room) => {
    const r = room || selRoom;
    if (!r) return;
    setForm(p => ({ ...p, roomNo: r.room_number, bedNo }));
    setShowBed(false); setShowRoom(false);
    toast.success(`Room ${r.room_number} / Bed ${bedNo} selected`);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container style={{ padding: 0 }}>

        {/* Header */}
        <PageHeader>
          <PageTitle>🏥 Admission</PageTitle>
          <NewAdmBtn onClick={() => { formOpen ? closeForm() : openNewForm(); }}>
            {formOpen ? "− New Admission" : "+ New Admission"}
          </NewAdmBtn>
        </PageHeader>

        {/* 2 Stats */}
        <StatStrip>
          {[
            { label:"Total Admissions", value:stats.admitted,   icon:"🛏️", bg:"#f0fdf4" },
            { label:"Total Discharges", value:stats.discharged, icon:"📤", bg:"#eff6ff" },
          ].map((s, i) => (
            <StatCard key={i} i={i}>
              <SIcon bg={s.bg}>{s.icon}</SIcon>
              <div><SLabel>{s.label}</SLabel><SValue>{s.value}</SValue></div>
            </StatCard>
          ))}
        </StatStrip>

        {/* Filters */}
        <FilterBar>
          <FF flex="1 1 180px">
            <FL>Admitting Doctor</FL>
            <FSel value={fDoctor} onChange={e => { setFDoctor(e.target.value); setPage(1); }}>
              <option value="ALL">ALL</option>
              {doctors.map(d => <option key={d.employeeId} value={String(d.employeeId)}>{d.employeeName}</option>)}
            </FSel>
          </FF>
          <FF flex="0 0 150px"><FL>From Date</FL><FInp type="date" value={fFrom} onChange={e => { setFFrom(e.target.value); setPage(1); }}/></FF>
          <FF flex="0 0 150px"><FL>To Date</FL><FInp type="date" value={fTo} onChange={e => { setFTo(e.target.value); setPage(1); }}/></FF>
          <FF flex="0 0 140px">
            <FL>Status</FL>
            <FSel value={fStatus} onChange={e => { setFStatus(e.target.value); setPage(1); }}>
              <option>All</option><option>Admitted</option><option>Discharged</option>
            </FSel>
          </FF>
          <SearchBtn onClick={fetchAdmissions}>🔍 Search</SearchBtn>
        </FilterBar>

        {/* ══ SLIDE-DOWN FORM ══════════════════════════════════════════ */}
        {formOpen && (
          <FormPanel>
            <FPHead>
              <FPTitle>
                {editingId ? "✏️ Edit Admission" : "🏥 New Admission"}
                {editingId && <span style={{ fontWeight:400, color:"#6b7280", fontSize:".72rem" }}>  IP: {editingId}</span>}
              </FPTitle>
              <CloseFP onClick={closeForm}>×</CloseFP>
            </FPHead>
            <div style={{ background:"linear-gradient(180deg,#f0fdf4 0%,#fff 80px)" }}>
              <FGrid>

                {/* UHID */}
                <Field span={2}>
                  <Lbl req>UHID</Lbl>
                  <IRow>
                    <Inp name="uhid" value={form.uhid} onChange={handleFormChange}
                      placeholder="Enter UHID" readOnly={!!editingId} />
                    <IconBtn type="button" onClick={fetchPatientByUHID} disabled={!!editingId}>🔍</IconBtn>
                  </IRow>
                </Field>

                {/* ── FIX #1: IP Number with search button (only when not editing) ── */}
                <Field span={2}>
                  <Lbl>IP Number</Lbl>
                  <IRow>
                    <Inp
                      name="ipNumber"
                      value={form.ipNumber}
                      onChange={handleFormChange}
                      placeholder={editingId ? "" : "Enter IP to load admission"}
                      readOnly={!!editingId}
                      style={editingId ? { background:"#f3f4f6" } : {}}
                    />
                    {!editingId && (
                      <IconBtn type="button" onClick={fetchAdmissionByIP} title="Search admission by IP Number">
                        🔍
                      </IconBtn>
                    )}
                  </IRow>
                </Field>

                <Field span={2}>
                  <Lbl>Date &amp; Time</Lbl>
                  <Inp value={`${fmtDate(new Date())}  ${fmtTime(new Date())}`} readOnly style={{ fontFamily:"monospace", background:"#f3f4f6" }} />
                </Field>

                <SecDiv>Patient Details (auto-filled from UHID)</SecDiv>
                <Field span={3}><Lbl>Patient Name</Lbl><Inp value={pName(form)} readOnly /></Field>
                <Field><Lbl>Age</Lbl><Inp value={form.age} readOnly /></Field>
                <Field><Lbl>Gender</Lbl><Inp value={form.gender} readOnly /></Field>
                <Field><Lbl>Customer Type</Lbl><Inp value={form.customerType} readOnly /></Field>
                <Field span={3}><Lbl>Insurance</Lbl><Inp value={form.insuranceCompanyName || ""} readOnly placeholder="—" /></Field>
                <Field span={2}><Lbl>Phone</Lbl><Inp value={form.mobilePhone} readOnly /></Field>
                <Field span={4}><Lbl>Address</Lbl><Inp value={form.permanent_address} readOnly /></Field>
                <Field span={2}><Lbl>Area</Lbl><Inp value={form.area} readOnly /></Field>
                <Field><Lbl>City</Lbl><Inp value={form.city} readOnly /></Field>
                <Field><Lbl>State</Lbl><Inp value={form.state} readOnly /></Field>
                <Field><Lbl>Zip</Lbl><Inp value={form.zipcode} readOnly /></Field>

                <SecDiv>Clinical</SecDiv>
                <Field span={3}>
                  <Lbl req>Admitting Doctor</Lbl>
                  <Sel name="admittingDoctor" value={form.admittingDoctor} onChange={handleFormChange}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d.employeeId} value={d.employeeId}>{d.employeeName}</option>)}
                  </Sel>
                </Field>
                <Field span={3}>
                  <Lbl>Consulting Doctor</Lbl>
                  <Sel name="consultingDoctor" value={form.consultingDoctor} onChange={handleFormChange}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d.employeeId} value={d.employeeId}>{d.employeeName}</option>)}
                  </Sel>
                </Field>

                <SecDiv>Room &amp; Bed</SecDiv>
                <Field span={2}>
                  <Lbl req>Room No.</Lbl>
                  <IRow>
                    <Inp name="roomNo" value={form.roomNo} onChange={handleFormChange} placeholder="Click 🔍 to pick" />
                    <IconBtn type="button" onClick={openRoomModal}>🔍</IconBtn>
                  </IRow>
                </Field>
                <Field span={2}>
                  <Lbl req>Bed No.</Lbl>
                  <Inp name="bedNo" value={form.bedNo} readOnly style={{ background:"#f3f4f6" }} placeholder="Auto-filled" />
                </Field>

                <SecDiv>Admission &amp; Package</SecDiv>
                <Field span={3}>
                  <Lbl>Reason for Admission</Lbl>
                  <Txta name="reasonForAdmission" value={form.reasonForAdmission} onChange={handleFormChange} rows={2} />
                </Field>
                <Field span={3}>
                  <Lbl>Package</Lbl>
                  <Sel name="packageNo" value={form.packageNo} onChange={handleFormChange}>
                    <option value="">— Select Package —</option>
                    {packages.map(pkg => (
                      <option key={pkg.packageNo} value={String(pkg.packageNo)}>
                        {pkg.packageName}{pkg.totalPrice ? ` (₹${pkg.totalPrice})` : ""}
                      </option>
                    ))}
                  </Sel>
                  {form.packageName && !form.packageNo && (
                    <span style={{ fontSize:".68rem", color:"#6b7280", marginTop:2 }}>Current: {form.packageName}</span>
                  )}
                </Field>

                <SecDiv>MLC (if applicable)</SecDiv>
                <Field span={2}>
                  <Lbl>MLC Type</Lbl>
                  <Sel name="mlc_type" value={form.mlc_type} onChange={handleFormChange}>
                    <option value="" /><option value="Accident">Accident</option>
                    <option value="Assault">Assault</option><option value="Other">Other</option>
                  </Sel>
                </Field>
                <Field span={2}>
                  <Lbl>MLC Document</Lbl>
                  <Inp type="file" name="mlc_doc" onChange={handleFormChange} style={{ paddingTop:3, height:"auto" }} />
                </Field>
                <Field span={2}>
                  <Lbl>MLC Remarks</Lbl>
                  <Txta name="mlc_remarks" value={form.mlc_remarks} onChange={handleFormChange} rows={2} />
                </Field>

              </FGrid>
              <FActions>
                <SmBtn secondary onClick={closeForm}>Discard</SmBtn>
                <SmBtn onClick={handleSubmit} disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Update Admission" : "Save Admission"}
                </SmBtn>
              </FActions>
            </div>
          </FormPanel>
        )}

        {/* Table controls */}
        <TTBar>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:".75rem", color:"#6b7280" }}>
            Show&nbsp;
            <FSel style={{ width:60, height:28 }} value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
              {[10,15,25,50].map(n => <option key={n}>{n}</option>)}
            </FSel>
            &nbsp;entries
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:".75rem", color:"#6b7280" }}>
            Search:&nbsp;
            <input value={tSearch} onChange={e => { setTSearch(e.target.value); setPage(1); }}
              placeholder="Name / UHID / IP…"
              style={{ height:28, padding:"0 8px", fontSize:".75rem", border:"1px solid #d1d5db", borderRadius:4, outline:"none" }} />
          </div>
        </TTBar>

        {/* Table */}
        <TWrap>
          <Tbl>
            <Thead>
              <tr>
                <Th>Status</Th><Th>Adm Date</Th><Th>Time</Th>
                <Th>UHID</Th><Th>IP No.</Th><Th>Name</Th><Th>Age</Th><Th>Gender</Th>
                <Th>Admitting Dr.</Th><Th>Room/Bed</Th><Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {loading ? (
                <tr><Td colSpan={11} style={{ textAlign:"center", padding:28 }}>Loading…</Td></tr>
              ) : paginated.length === 0 ? (
                <tr><Td colSpan={11} style={{ textAlign:"center", padding:28, color:"#6b7280" }}>No admissions found</Td></tr>
              ) : paginated.map((adm, idx) => {
                const t = getAdmStatus(adm);
                return (
                  <Tr key={adm.ipNumber || idx} i={idx}>
                    <Td><Badge t={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</Badge></Td>
                    <Td>{adm.admissionDateTime ? fmtDate(adm.admissionDateTime) : "-"}</Td>
                    <Td>{adm.admissionDateTime ? fmtTime(adm.admissionDateTime) : "-"}</Td>
                    <Td style={{ fontWeight:600, color:"#0d9488" }}>{adm.uhid || "-"}</Td>
                    <Td style={{ fontWeight:600, color:"#6d28d9" }}>{adm.ipNumber || "-"}</Td>
                    <Td style={{ fontWeight:600 }}>{pName(adm)}</Td>
                    <Td>{adm.age || "-"}</Td>
                    <Td>{adm.gender || "-"}</Td>
                    <Td>{adm.admittingDoctorName || getDrName(adm.admittingDoctor)}</Td>
                    <Td>{`${adm.roomNo||"-"}/${adm.bedNo||"-"}`}</Td>
                    <Td>
                      {/* ── FIX #4: pass event to capture button coords ── */}
                      <AW>
                        <DotB onClick={e => handleMenuToggle(adm.ipNumber, e)}>⋮</DotB>
                      </AW>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Tbl>
        </TWrap>

        {/* Pagination */}
        <Pager>
          <span>
            Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} entries
          </span>
          <div style={{ display:"flex", gap:4 }}>
            <PB onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</PB>
            {Array.from({ length:totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), page + 2)
              .map(n => <PB key={n} active={n === page} onClick={() => setPage(n)}>{n}</PB>)}
            <PB onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</PB>
          </div>
        </Pager>
      </Container>

      {/* ── FIX #4: Dropdown rendered OUTSIDE table via fixed positioning ───────── */}
      {openMenu !== null && (() => {
        const adm = paginated.find(a => a.ipNumber === openMenu);
        if (!adm) return null;
        const t           = getAdmStatus(adm);
        const isCancelled = t === "cancelled";
        return (
          <Drop ref={menuRef} top={menuPos.top} left={menuPos.left}>
            {/* ── FIX #2: Edit & Print disabled for cancelled ── */}
            <DI
              onClick={() => { if (!isCancelled) openEditForm(adm); }}
              disabled={isCancelled}
              title={isCancelled ? "Cannot edit a cancelled admission" : "Edit admission"}
            >
              ✏️ Edit
            </DI>
            <DI
              onClick={() => { if (adm.is_admissionActive && !isCancelled) handleCancel(adm); }}
              danger
              disabled={!adm.is_admissionActive || isCancelled}
            >
              🗑️ Cancel Admission
            </DI>
            <DI
              onClick={() => { if (!isCancelled) handlePrint(adm); }}
              disabled={isCancelled}
              title={isCancelled ? "Cannot print slip for cancelled admission" : "Print admission slip"}
            >
              🖨️ Print Admission Slip
            </DI>
          </Drop>
        );
      })()}

      {/* ══ ROOM PICKER MODAL ════════════════════════════════════════════ */}
      {showRoom && (
        <ModalOverlay onClick={() => setShowRoom(false)}>
          <RMC onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🏨 Select Room</ModalTitle>
              <CloseButton onClick={() => setShowRoom(false)}>×</CloseButton>
            </ModalHeader>
            <RMB>
              <FBR>
                {[["room_number","Room Number","e.g. 101"],["block","Block","e.g. A"]].map(([k,lbl,ph]) => (
                  <FFR key={k}>
                    <FLR>{lbl}</FLR>
                    <FIR placeholder={ph} value={rFilter[k]}
                      onChange={e => setRFilter(p => ({ ...p, [k]:e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && fetchAllRooms()} />
                  </FFR>
                ))}
                <FFR>
                  <FLR>Floor</FLR>
                  <FIR type="number" placeholder="e.g. 2" value={rFilter.floor}
                    onChange={e => setRFilter(p => ({ ...p, floor:e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && fetchAllRooms()} />
                </FFR>
                <FBR2 onClick={() => fetchAllRooms()}>Search</FBR2>
                <FBR2 clear onClick={() => { setRFilter({ room_number:"", block:"", floor:"" }); fetchAllRooms({ room_number:"", block:"", floor:"" }); }}>Clear</FBR2>
              </FBR>
                <LBar>
                  {[
                    ["#22c55e","Available"],
                    ["#eab308","Not Cleaned"],
                    ["#3b82f6","Partial"],
                    ["#9333ea","Reserved"],
                    ["#ef4444","Occupied"],
                    ["#9ca3af","Maintenance"],
                  ].map(([c,l]) => (
                    <LI key={l}><LD c={c}/>{l}</LI>
                  ))}
                </LBar>
              {loadRooms ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))", gap:8 }}>
                  {Array.from({ length:12 }).map((_, i) => <Skel key={i} />)}
                </div>
              ) : Object.keys(grouped).length === 0 ? <NR>No rooms found.</NR>
              : Object.entries(grouped).map(([block, floors], bIdx) => (
                <BS2 key={block} i={bIdx}>
                  <BH2>🏢 Block {block}</BH2>
                  {Object.entries(floors).sort(([a],[b]) => Number(a) - Number(b)).map(([floor, rooms]) => (
                    <FG2 key={floor}>
                      <FL2>Floor {floor}</FL2>
                      <RG2>
                        {rooms.map(room => {
                          const s = getRoomStatus(room.beds);
                          const bedSummary = (room.beds || []).reduce((acc, b) => {
                            acc[b.status] = (acc[b.status] || 0) + 1; return acc;
                          }, {});
                          const tipLines = Object.entries(bedSummary)
                            .map(([st, cnt]) => `${cnt} ${st}`).join(" · ");
                          const roomTip =
                            s === "available"              ? `✅ Available · ${tipLines}`
                          : s === "occupied"               ? `🔴 Fully Occupied · ${tipLines}`
                          : s === "available-not-cleaned"  ? `🟡 Needs Cleaning · ${tipLines}`
                          : s === "maintenance"            ? `🔧 Under Maintenance`
                          : s === "partial"                ? `🔵 Partially Occupied · ${tipLines}`
                          : tipLines;
                          return (
                            <div key={room.room_number} style={{ position:"relative" }}
                              onMouseEnter={e => {
                                const t = e.currentTarget.querySelector(".room-tip");
                                if (t) t.style.display = "block";
                              }}
                              onMouseLeave={e => {
                                const t = e.currentTarget.querySelector(".room-tip");
                                if (t) t.style.display = "none";
                              }}
                            >
                              <RC s={s} onClick={() => handleRoomClick(room)}>
                                <RCT s={s}>
                                  <RNum>{room.room_number}</RNum>
                                  <RSP s={s}>
                                    {s === "partial"               ? "Partial"
                                  : s === "available-not-cleaned" ? "Not Cleaned"
                                  : s === "reserved"              ? "Reserved"
                                  : s}
                                  </RSP>
                                </RCT>
                                <RT2>{room.room_type}{room.room_category ? ` · ${room.room_category}` : ""}</RT2>
                                <BRow>
                                  {(room.beds || []).map((bed, i) => (
                                    <BC
                                      key={i}
                                      bs={bed.status}
                                      disabled={bed.status !== "Available"}
                                      title={
                                        bed.status === "Available"               ? "✅ Ready to assign"
                                      : bed.status === "Occupied"                ? "🔴 Patient admitted"
                                      : bed.status === "Available - Not Cleaned" ? "🟡 Needs housekeeping"
                                      : bed.status === "Reserved"                ? "🟣 Reserved for patient"
                                      : "🔧 Maintenance"
                                      }
                                      onClick={e => {
                                        if (bed.status === "Available") {
                                          e.stopPropagation();
                                          handleBedSelect(bed.bed_number, room);
                                        }
                                      }}
                                    >
                                      {bed.bed_number}
                                    </BC>
                                  ))}
                                </BRow>
                              </RC>
                              {/* Room-level tooltip */}
                              <div className="room-tip" style={{
                                display:"none", position:"absolute", bottom:"calc(100% + 6px)", left:"50%",
                                transform:"translateX(-50%)", background:"#1e293b", color:"#fff",
                                fontSize:".65rem", fontWeight:500, borderRadius:5, padding:"5px 10px",
                                whiteSpace:"nowrap", zIndex:10000, pointerEvents:"none", lineHeight:1.6,
                                boxShadow:"0 4px 14px rgba(0,0,0,.28)"
                              }}>
                                <div style={{ fontWeight:700, marginBottom:2 }}>Room {room.room_number}</div>
                                {tipLines && <div>{tipLines}</div>}
                                  {(s === "occupied" || s === "maintenance" || s === "reserved") && 
                                    <div style={{ color:"#fca5a5", marginTop:2 }}>Cannot select</div>}
                              </div>
                            </div>
                          );
                        })}
                      </RG2>
                    </FG2>
                  ))}
                </BS2>
              ))}
            </RMB>
          </RMC>
        </ModalOverlay>
      )}

      {/* ══ BED FALLBACK MODAL ════════════════════════════════════════════ */}
      {showBed && selRoom && (
        <ModalOverlay onClick={() => setShowBed(false)}>
          <ModalContainer onClick={e => e.stopPropagation()} style={{ maxWidth:420 }}>
            <ModalHeader>
              <ModalTitle>Select Bed — Room {selRoom.room_number}</ModalTitle>
              <CloseButton onClick={() => setShowBed(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10, padding:12 }}>
                {(selRoom.beds || []).map((bed, i) => {
                  const avail = bed.status === "Available";
                  return (
                    <BC key={i} bs={bed.status} disabled={!avail}
                      style={{ minWidth:70, height:42, fontSize:".82rem", flex:"1 1 70px" }}
                      onClick={() => avail && handleBedSelect(bed.bed_number, selRoom)}>
                      {bed.bed_number}<br />
                      <span style={{ fontSize:".6rem", opacity:.85 }}>{bed.status}</span>
                    </BC>
                  );
                })}
                {(!selRoom.beds || selRoom.beds.length === 0) && <NR>No beds configured.</NR>}
              </div>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* ══ PRINT SLIP MODAL ══════════════════════════════════════════════ */}
      {printData && (
        <ModalOverlay onClick={() => setPrintData(null)}>
          <PMC onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🖨️ Admission Slip</ModalTitle>
              <CloseButton onClick={() => setPrintData(null)}>×</CloseButton>
            </ModalHeader>
            <PMB>
              <Slip>
                <SR>
                  <SL>
                    {/* ── FIX #3: Code 128B barcode — scanner returns IP number ── */}
                    <BarcodeSVG value={printData.ipNumber} width={240} height={64} showText={true} />
                    <SBold>{pName(printData)}</SBold>
                    <SLn>{printData.age || ""} {printData.gender || ""}</SLn>
                    <SLn>{printData.permanent_address || ""}</SLn>
                    <SLn>{[printData.area, printData.city, printData.state].filter(Boolean).join(", ")}</SLn>
                    <SLn>{printData.mobilePhone || ""}</SLn>
                    <SLn>Admitted: Dr. {printData.admittingDoctorName || getDrName(printData.admittingDoctor)}</SLn>
                  </SL>
                  <SRt>
                    <SBig>IP NO: {printData.ipNumber || ""}</SBig>
                    <SLn>{printData.insuranceCompanyName || ""}</SLn>
                    <SLn>UHID : {printData.uhid || ""}</SLn>
                    <SLn>DOA  : {printData.admissionDateTime ? fmtDate(printData.admissionDateTime) : "-"}</SLn>
                    <SLn>TIME : {printData.admissionDateTime
                      ? new Date(printData.admissionDateTime).toLocaleTimeString("en-IN",{ hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false })
                      : "-"}</SLn>
                    <SLn>Room : {printData.roomNo || "-"} / {printData.bedNo || "-"}</SLn>
                  </SRt>
                </SR>
              </Slip>
              <PA>
                <PBt sec onClick={() => setPrintData(null)}>Close</PBt>
                <PBt onClick={doPrint}>🖨️ Print</PBt>
              </PA>
            </PMB>
          </PMC>
        </ModalOverlay>
      )}

    </PageWrapper>
  );
}
