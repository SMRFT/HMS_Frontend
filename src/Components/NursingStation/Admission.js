import { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../../Auth/apiRequest";
import RoomShifting from "./RoomShifting";          // ← Room Shifting component
import IPAdvance from "./IPAdvance";                // ← IP Advance component
import {
  PageWrapper, Container, ModalOverlay, ModalContainer,
  ModalHeader, ModalTitle, CloseButton, ModalBody,
} from "../GlobalStyles";

// ─── Animations ────────────────────────────────────────────────────────────────
const fadeIn   = keyframes`from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}`;
const pulse    = keyframes`0%,100%{opacity:1}50%{opacity:.45}`;
const slideUp2 = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const openAnim = keyframes`from{max-height:0;opacity:0}to{max-height:2400px;opacity:1}`;
const popIn    = keyframes`from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}`;

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

// ─── Stat Cards ────────────────────────────────────────────────────────────────
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
const FilterBar  = styled.div`display:flex;gap:10px;align-items:flex-end;padding:12px 20px;border-bottom:1px solid #e5e7eb;flex-wrap:wrap;background:#fafafa;`;
const FF         = styled.div`display:flex;flex-direction:column;gap:3px;flex:${p=>p.flex||'1 1 140px'};`;
const FL         = styled.label`font-size:.68rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;`;
const FSel       = styled.select`height:32px;padding:0 8px;font-size:.78rem;border:1px solid #d1d5db;border-radius:5px;background:#fff;color:#111827;outline:none;&:focus{border-color:#0d9488;}`;
const FInp       = styled.input`height:32px;padding:0 8px;font-size:.78rem;border:1px solid #d1d5db;border-radius:5px;background:#fff;color:#111827;outline:none;&:focus{border-color:#0d9488;}`;
const SearchBtn  = styled.button`height:32px;padding:0 18px;font-size:.78rem;font-weight:600;background:#0d9488;color:#fff;border:none;border-radius:5px;cursor:pointer;display:flex;align-items:center;gap:5px;&:hover{background:#0f766e;}`;

// ─── Form Panel ────────────────────────────────────────────────────────────────
const FormPanel = styled.div`overflow:hidden;border-bottom:2px solid #0d9488;animation:${openAnim} .4s ease both;`;
const FPHead    = styled.div`display:flex;align-items:center;justify-content:space-between;padding:9px 20px;background:#f0fdf4;border-bottom:1px solid #d1fae5;`;
const FPTitle   = styled.div`font-size:.82rem;font-weight:700;color:#0d9488;display:flex;align-items:center;gap:8px;`;
const CloseFP   = styled.button`width:26px;height:26px;border-radius:50%;border:1px solid #d1fae5;background:#fff;cursor:pointer;font-size:1rem;color:#6b7280;display:flex;align-items:center;justify-content:center;&:hover{background:#fee2e2;color:#dc2626;}`;
const FGrid     = styled.div`display:grid;grid-template-columns:repeat(6,1fr);gap:6px 12px;padding:14px 20px;`;
const Field     = styled.div`display:flex;flex-direction:column;gap:2px;grid-column:span ${p=>p.span||1};`;
const Lbl       = styled.label`font-size:.7rem;font-weight:600;color:#374151;&::after{content:${p=>p.req?'" *"':'""'};color:#ef4444;}`;
const Inp       = styled.input`height:28px;padding:0 7px;font-size:.75rem;border:1px solid #d1d5db;border-radius:4px;background:${p=>p.readOnly?'#f3f4f6':'#fff'};color:${p=>p.readOnly?'#6b7280':'#111827'};outline:none;width:100%;box-sizing:border-box;&:focus{border-color:#0d9488;box-shadow:0 0 0 2px #ccfbf1;}`;
const Sel       = styled.select`height:28px;padding:0 4px;font-size:.75rem;border:1px solid #d1d5db;border-radius:4px;background:#fff;color:#111827;outline:none;width:100%;box-sizing:border-box;&:focus{border-color:#0d9488;}&:disabled{background:#f3f4f6;color:#6b7280;}`;
const Txta      = styled.textarea`padding:4px 7px;font-size:.75rem;border:1px solid #d1d5db;border-radius:4px;resize:vertical;min-height:44px;width:100%;box-sizing:border-box;&:focus{border-color:#0d9488;outline:none;}`;
const SecDiv    = styled.div`grid-column:span 6;border-top:1px solid #e5e7eb;margin:4px 0 2px;padding-top:6px;font-size:.7rem;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.05em;`;
const IRow      = styled.div`display:flex;align-items:center;gap:3px;`;
const IconBtn   = styled.button`height:28px;padding:0 9px;font-size:.72rem;background:#0d9488;color:#fff;border:none;border-radius:4px;cursor:pointer;white-space:nowrap;flex-shrink:0;&:hover{background:#0f766e;}&:disabled{opacity:.5;cursor:not-allowed;}`;
const FActions  = styled.div`display:flex;gap:8px;justify-content:flex-end;padding:10px 20px 16px;border-top:1px solid #e5e7eb;margin-top:4px;`;
const SmBtn     = styled.button`height:30px;padding:0 18px;font-size:.75rem;font-weight:600;border-radius:4px;border:none;cursor:pointer;background:${p=>p.secondary?'#e5e7eb':'#0d9488'};color:${p=>p.secondary?'#374151':'#fff'};&:hover{opacity:.88;}&:disabled{opacity:.5;cursor:not-allowed;}`;

// ─── Active Admission Banner ───────────────────────────────────────────────────
const ActiveBanner = styled.div`
  grid-column:span 6;
  background:#fef9c3;border:1.5px solid #fde047;border-radius:7px;
  padding:10px 14px;display:flex;align-items:center;gap:10px;
  font-size:.78rem;color:#713f12;font-weight:500;
`;

// ─── Room History Timeline ─────────────────────────────────────────────────────
const TimelineWrap  = styled.div`grid-column:span 6;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin-top:6px;`;
const TimelineTitle = styled.div`font-size:.72rem;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;display:flex;align-items:center;gap:8px;`;
const TLList        = styled.div`display:flex;flex-direction:column;`;
const TLItem        = styled.div`
  display:flex;align-items:flex-start;gap:12px;position:relative;
  padding-bottom:${p=>p.last?'0':'18px'};
  &:not(:last-child)::before{content:"";position:absolute;left:10px;top:24px;bottom:0;width:2px;background:${p=>p.active?'linear-gradient(#0d9488,#e5e7eb)':'#e5e7eb'};}
`;
const TLDot    = styled.div`width:22px;height:22px;border-radius:50%;flex-shrink:0;margin-top:1px;background:${p=>p.active?'#0d9488':p.shift?'#7e22ce':'#94a3b8'};border:3px solid ${p=>p.active?'#ccfbf1':p.shift?'#e9d5ff':'#e5e7eb'};`;
const TLBody   = styled.div`flex:1;min-width:0;`;
const TLRoomNo = styled.div`font-size:.8rem;font-weight:700;color:#111827;display:flex;align-items:center;gap:6px;flex-wrap:wrap;`;
const TLMeta   = styled.div`font-size:.67rem;color:#6b7280;margin-top:3px;display:flex;flex-wrap:wrap;gap:8px;`;
const TLBadge  = styled.span`padding:1px 8px;border-radius:10px;font-size:.6rem;font-weight:700;background:${p=>p.active?'#dcfce7':p.shift?'#f3e8ff':p.cleaned?'#eff6ff':'#f3f4f6'};color:${p=>p.active?'#166534':p.shift?'#7e22ce':p.cleaned?'#1d4ed8':'#6b7280'};`;
const TLDays   = styled.span`padding:1px 8px;border-radius:10px;font-size:.6rem;font-weight:700;background:#fef3c7;color:#92400e;`;

// ─── Already Admitted Modal ────────────────────────────────────────────────────
const AlertMC   = styled(ModalContainer)`max-width:420px;animation:${popIn} .22s ease;`;
const AlertBody = styled(ModalBody)`padding:24px;text-align:center;`;
const AlertIcon = styled.div`font-size:3rem;margin-bottom:12px;`;
const AlertMsg  = styled.div`font-size:.88rem;color:#374151;line-height:1.6;margin-bottom:16px;`;
const AlertIP   = styled.div`display:inline-block;padding:6px 18px;border-radius:20px;background:#fef3c7;border:1px solid #fde68a;font-size:.85rem;font-weight:800;color:#92400e;letter-spacing:.04em;margin-bottom:6px;`;
const AlertMeta = styled.div`font-size:.72rem;color:#6b7280;margin-bottom:20px;`;
const AlertBtns = styled.div`display:flex;gap:10px;justify-content:center;`;
const ABtn      = styled.button`height:34px;padding:0 20px;font-size:.78rem;font-weight:700;border-radius:6px;border:none;cursor:pointer;background:${p=>p.primary?'#0d9488':'#e5e7eb'};color:${p=>p.primary?'#fff':'#374151'};&:hover{opacity:.88;}`;

// ─── Generic Confirm Modal ─────────────────────────────────────────────────────
const ConfirmMC   = styled(ModalContainer)`max-width:440px;animation:${popIn} .22s ease;`;
const ConfirmBody = styled(ModalBody)`padding:28px 24px 20px;text-align:center;`;
const ConfirmIcon = styled.div`font-size:2.8rem;margin-bottom:12px;`;
const ConfirmTitle= styled.div`font-size:1rem;font-weight:700;color:#111827;margin-bottom:8px;`;
const ConfirmMsg  = styled.div`font-size:.83rem;color:#6b7280;line-height:1.65;margin-bottom:20px;`;
const ConfirmBtns = styled.div`display:flex;gap:10px;justify-content:center;`;
const CBtn        = styled.button`height:34px;padding:0 22px;font-size:.78rem;font-weight:700;border-radius:6px;border:none;cursor:pointer;background:${p=>p.danger?'#dc2626':p.primary?'#0d9488':'#e5e7eb'};color:${p=>(p.danger||p.primary)?'#fff':'#374151'};&:hover{opacity:.88;}`;

// ─── Generic Info Modal ────────────────────────────────────────────────────────
const InfoMC   = styled(ModalContainer)`max-width:400px;animation:${popIn} .22s ease;`;
const InfoBody = styled(ModalBody)`padding:28px 24px 20px;text-align:center;`;
const InfoIcon = styled.div`font-size:2.8rem;margin-bottom:12px;`;
const InfoTitle= styled.div`font-size:1rem;font-weight:700;color:#111827;margin-bottom:8px;`;
const InfoMsg  = styled.div`font-size:.83rem;color:#6b7280;line-height:1.65;margin-bottom:20px;`;
const InfoBtns = styled.div`display:flex;gap:10px;justify-content:center;`;
const IBtn     = styled.button`height:34px;padding:0 22px;font-size:.78rem;font-weight:700;border-radius:6px;border:none;cursor:pointer;background:${p=>p.primary?'#0d9488':'#e5e7eb'};color:${p=>p.primary?'#fff':'#374151'};&:hover{opacity:.88;}`;

// ─── Reason Modal (shared for Cancel and Edit) ────────────────────────────────
const ReasonMC   = styled(ModalContainer)`max-width:460px;animation:${popIn} .22s ease;`;
const ReasonBody = styled(ModalBody)`padding:24px;`;
const ReasonTxta = styled.textarea`width:100%;box-sizing:border-box;padding:8px 10px;font-size:.8rem;border:1.5px solid #d1d5db;border-radius:6px;resize:vertical;min-height:80px;outline:none;&:focus{border-color:#0d9488;}`;
const ReasonBtns = styled.div`display:flex;gap:10px;justify-content:flex-end;margin-top:14px;`;

// ─── Table ─────────────────────────────────────────────────────────────────────
const TTBar = styled.div`display:flex;align-items:center;justify-content:space-between;padding:10px 20px;border-bottom:1px solid #e5e7eb;flex-wrap:wrap;gap:8px;`;
const TWrap = styled.div`overflow-x:auto;`;
const Tbl   = styled.table`width:100%;border-collapse:collapse;font-size:.78rem;`;
const Thead = styled.thead`background:#f9fafb;`;
const Th    = styled.th`padding:9px 12px;text-align:left;font-size:.68rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb;white-space:nowrap;`;
const Tr    = styled.tr`border-bottom:1px solid #f3f4f6;animation:${fadeIn} .28s ease both;animation-delay:${p=>p.i*.035}s;&:hover{background:#f0fdf4;}`;
const Td    = styled.td`padding:8px 12px;color:#374151;white-space:nowrap;`;
const Badge = styled.span`padding:2px 10px;border-radius:20px;font-size:.67rem;font-weight:700;background:${p=>p.t==='admitted'?'#dcfce7':p.t==='discharged'?'#dbeafe':'#fee2e2'};color:${p=>p.t==='admitted'?'#166534':p.t==='discharged'?'#1d4ed8':'#991b1b'};`;
const RoomHistBtn   = styled.button`height:22px;padding:0 9px;font-size:.62rem;font-weight:600;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:10px;cursor:pointer;&:hover{background:#dbeafe;}`;
const RoomSourceTag = styled.span`font-size:.55rem;font-weight:700;padding:1px 5px;border-radius:6px;margin-left:4px;vertical-align:middle;background:${p=>p.src==='shifting'?'#f3e8ff':'#f0fdf4'};color:${p=>p.src==='shifting'?'#7e22ce':'#166534'};`;

// ─── Dropdown ──────────────────────────────────────────────────────────────────
const AW   = styled.div`position:relative;display:inline-block;`;
const DotB = styled.button`width:28px;height:28px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;color:#6b7280;&:hover{background:#f3f4f6;}`;
const Drop = styled.div`position:fixed;top:${p=>p.top}px;left:${p=>p.left}px;background:#fff;border:1px solid #e5e7eb;border-radius:7px;box-shadow:0 8px 28px rgba(0,0,0,.16);z-index:9999;min-width:200px;overflow:hidden;animation:${fadeIn} .14s ease;`;
const DI   = styled.button`width:100%;padding:9px 14px;text-align:left;font-size:.78rem;font-weight:500;background:none;border:none;display:flex;align-items:center;gap:8px;color:${p=>p.disabled?'#9ca3af':p.danger?'#dc2626':'#374151'};cursor:${p=>p.disabled?'not-allowed':'pointer'};&:hover:not(:disabled){background:${p=>p.danger?'#fff1f2':'#f0fdf4'};}`;

// ─── Pagination ────────────────────────────────────────────────────────────────
const Pager = styled.div`display:flex;align-items:center;justify-content:space-between;padding:10px 20px;border-top:1px solid #e5e7eb;font-size:.75rem;color:#6b7280;flex-wrap:wrap;gap:6px;`;
const PB    = styled.button`height:28px;padding:0 13px;font-size:.75rem;border:1px solid #e5e7eb;border-radius:4px;background:${p=>p.active?'#0d9488':'#fff'};color:${p=>p.active?'#fff':'#374151'};cursor:pointer;&:disabled{opacity:.45;cursor:default;}&:hover:not(:disabled){background:${p=>p.active?'#0d9488':'#f3f4f6'};}`;

// ─── Room Picker ───────────────────────────────────────────────────────────────
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
const rC   = {
  available:     { bg:"#f0fdf4", br:"#86efac", hd:"#dcfce7" },
  "not-cleaned": { bg:"#fefce8", br:"#fde047", hd:"#fef9c3" },
  occupied:      { bg:"#fff1f2", br:"#fca5a5", hd:"#fee2e2" },
  maintenance:   { bg:"#f3f4f6", br:"#9ca3af", hd:"#e5e7eb" },
  partial:       { bg:"#eff6ff", br:"#93c5fd", hd:"#dbeafe" },
  reserved:      { bg:"#faf5ff", br:"#c084fc", hd:"#f3e8ff" },
};
const RC   = styled.div`border:1.5px solid ${p=>rC[p.s]?.br||'#e5e7eb'};border-radius:7px;overflow:hidden;cursor:${p=>(p.s==='maintenance'||p.noavail)?'not-allowed':'pointer'};opacity:${p=>(p.s==='maintenance'||p.noavail)?.72:1};background:${p=>rC[p.s]?.bg||'#fff'};transition:box-shadow .18s,transform .18s;${p=>(p.s!=='maintenance'&&!p.noavail)&&'&:hover{box-shadow:0 4px 14px rgba(0,0,0,.13);transform:translateY(-2px);}'}`;
const RCT  = styled.div`display:flex;align-items:center;justify-content:space-between;padding:5px 8px;background:${p=>rC[p.s]?.hd||'#f1f5f9'};border-bottom:1px solid ${p=>rC[p.s]?.br||'#e5e7eb'};`;
const RNum = styled.span`font-size:.78rem;font-weight:700;color:#111827;`;
const RSP  = styled.span`font-size:.6rem;font-weight:700;padding:1px 6px;border-radius:10px;background:${p=>p.s==='available'?'#22c55e':p.s==='occupied'?'#ef4444':p.s==='maintenance'?'#9ca3af':p.s==='reserved'?'#9333ea':p.s==='partial'?'#3b82f6':p.s==='not-cleaned'?'#eab308':'#eab308'};color:#fff;text-transform:capitalize;`;
const BRow = styled.div`display:flex;flex-wrap:wrap;gap:4px;padding:6px 8px;`;
const BC   = styled.button`flex:1 1 auto;min-width:44px;text-align:center;padding:4px 5px;border-radius:5px;font-size:.67rem;font-weight:700;border:none;cursor:${p=>p.disabled?'not-allowed':'pointer'};color:#fff;background:${p=>p.bs==='Available'?'#22c55e':p.bs==='Occupied'?'#ef4444':p.bs==='Available - Not Cleaned'?'#eab308':p.bs==='Reserved'?'#9333ea':p.bs==='Maintenance'?'#9ca3af':'#9ca3af'};opacity:${p=>p.disabled?.55:1};transition:filter .15s,transform .15s;&:hover:not(:disabled){filter:brightness(1.1);transform:scale(1.06);}`;
const RT2  = styled.span`font-size:.6rem;color:#6b7280;padding:0 8px 4px;display:block;`;
const Skel = styled.div`height:100px;border-radius:7px;background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:${pulse} 1.4s ease-in-out infinite;`;
const NR   = styled.div`text-align:center;padding:30px;color:#6b7280;font-size:.8rem;`;

// ─── Room History Modal ────────────────────────────────────────────────────────
const RHModal = styled(ModalContainer)`max-width:620px;max-height:90vh;`;
const RHBody  = styled(ModalBody)`padding:0;background:#f8fafc;overflow-y:auto;max-height:calc(90vh - 56px);`;
const RHSection = styled.div`padding:10px 20px 6px;font-size:.7rem;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.08em;background:${p=>p.shift?'linear-gradient(90deg,#7e22ce,#9333ea)':'linear-gradient(90deg,#0d9488,#0f766e)'};display:flex;align-items:center;gap:8px;position:sticky;top:0;z-index:2;`;
const RHSectionCount = styled.span`background:rgba(255,255,255,.25);padding:1px 8px;border-radius:10px;font-size:.65rem;`;
const RHCard   = styled.div`margin:10px 16px;background:#fff;border-radius:8px;border:1.5px solid ${p=>p.active?'#0d9488':p.shift?'#c084fc':'#e5e7eb'};overflow:hidden;animation:${fadeIn} .2s ease both;animation-delay:${p=>p.i*.05}s;box-shadow:${p=>p.active?'0 0 0 3px #ccfbf1':'none'};`;
const RHCardHead = styled.div`display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:${p=>p.active?'#f0fdf4':p.shift?'#faf5ff':'#f9fafb'};border-bottom:1px solid ${p=>p.active?'#bbf7d0':p.shift?'#e9d5ff':'#f3f4f6'};`;
const RHRoomLabel = styled.div`font-size:.9rem;font-weight:800;color:#111827;`;
const RHRoomSub   = styled.div`font-size:.64rem;color:#9ca3af;margin-top:1px;`;
const RHStatusPill= styled.span`padding:3px 10px;border-radius:12px;font-size:.64rem;font-weight:700;white-space:nowrap;background:${p=>p.active?'#dcfce7':p.cleaned?'#dbeafe':p.shift?'#f3e8ff':'#f3f4f6'};color:${p=>p.active?'#166534':p.cleaned?'#1d4ed8':p.shift?'#7e22ce':'#6b7280'};`;
const RHGrid  = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#f3f4f6;`;
const RHCell  = styled.div`padding:9px 14px;background:#fff;`;
const RHCLbl  = styled.div`font-size:.6rem;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;`;
const RHCVal  = styled.div`font-size:.76rem;color:#111827;font-weight:600;margin-top:2px;`;
const RHFooter= styled.div`padding:8px 14px;background:${p=>p.active?'#f0fdf4':p.shift?'#faf5ff':'#f8fafc'};border-top:1px solid ${p=>p.active?'#bbf7d0':p.shift?'#e9d5ff':'#f3f4f6'};font-size:.7rem;font-weight:600;color:${p=>p.active?'#166534':p.shift?'#7e22ce':'#374151'};display:flex;align-items:center;gap:8px;`;

// ─── Print Slip ────────────────────────────────────────────────────────────────
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

// ─── Room Shifting Modal wrapper ───────────────────────────────────────────────
const ShiftMC = styled(ModalContainer)`max-width:860px;max-height:92vh;`;
const ShiftMB = styled(ModalBody)`padding:0;overflow-y:auto;background:#f8fafc;`;

// ─── Code128B Barcode ──────────────────────────────────────────────────────────
const CODE128_PATTERNS = [
  "11011001100","11001101100","11001100110","10010011000","10010001100","10001001100","10011001000","10011000100","10001100100","11001001000",
  "11001000100","11000100100","10110011100","10011011100","10011001110","10111001100","10011101100","10011100110","11001110010","11001011100",
  "11001001110","11011100100","11001110100","11101101110","11101001100","11100101100","11100100110","11101100100","11100110100","11100110010",
  "11011011000","11011000110","11000110110","10100011000","10001011000","10001000110","10110001000","10001101000","10001100010","11010001000",
  "11000101000","11000100010","10110111000","10110001110","10001101110","10111011000","10111000110","10001110110","11101110110","11010001110",
  "11000101110","11011101000","11011100010","11011101110","11101011000","11101000110","11100010110","11101101000","11101100010","11100011010",
  "11101111010","11001000010","11110001010","10100110000","10100001100","10010110000","10010000110","10000101100","10000100110","10110010000",
  "10110000100","10011010000","10011000010","10000110100","10000110010","11000010010","11001010000","11110111010","11000010100","10001111010",
  "10100111100","10010111100","10010011110","10111100100","10011110100","10011110010","11110100100","11110010100","11110010010","11011011110",
  "11011110110","11110110110","10101111000","10100011110","10001011110","10111101000","10111100010","11110101000","11110100010","10111011110",
  "10111101110","11101011110","11110101110","11010000100","11010010000","11010011100","1100011101011",
];
const START_B = 104;
function encodeCode128(text) {
  const bars = ["11010010000"];
  let checksum = START_B;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i) - 32;
    if (c < 0 || c > 95) continue;
    checksum += (i + 1) * c;
    bars.push(CODE128_PATTERNS[c] || CODE128_PATTERNS[0]);
  }
  bars.push(CODE128_PATTERNS[checksum % 103] || CODE128_PATTERNS[0]);
  bars.push("1100011101011");
  return bars.join("");
}
function BarcodeSVG({ value = "", width = 240, height = 64, showText = true }) {
  if (!value) return null;
  const encoded = encodeCode128(value);
  const modW = width / (encoded.length || 1);
  const barH = showText ? height - 16 : height;
  const rects = [];
  let x = 0;
  for (let i = 0; i < encoded.length; i++) {
    if (i % 2 === 0) rects.push({ x, w: modW });
    x += modW;
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}
      style={{ display:"block" }} viewBox={`0 0 ${width} ${height}`}>
      {rects.map((r, i) => (
        <rect key={i} x={r.x.toFixed(2)} y={0} width={Math.max(r.w, 0.6).toFixed(2)} height={barH} fill="#000" />
      ))}
      {showText && (
        <text x={width/2} y={height} textAnchor="middle"
          fontFamily="'Courier New',monospace" fontSize="10" fill="#000" letterSpacing="1.5">
          {value}
        </text>
      )}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════
const EMPTY = {
  uhid:"", ipNumber:"", admittingDoctor:"", consultingDoctor:"",
  roomNo:"", bedNo:"", reasonForAdmission:"",
  packageNo:"", packageName:"",
  mlc_type:"", mlc_doc:null, mlc_remarks:"",
  salutation:"", firstName:"", middleName:"", lastName:"",
  dob:"", age:"", gender:"", mobilePhone:"", permanent_address:"",
  area:"", zipcode:"", city:"", state:"",
  customerType:"", insuranceCompanyName:"", company_code:"",
  room_details:[], roomShitingDetails:[],
};

function safeParseList(value) {
  if (Array.isArray(value)) return value;
  if (!value || value === "[]" || value === "") return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
    } catch (_) {}
    try {
      const j = value
        .replace(/OrderedDict\(\[/g, "{").replace(/\]\)/g, "}")
        .replace(/'/g, '"').replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false").replace(/\bNone\b/g, "null")
        .replace(/,\s*([}\]])/g, "$1");
      const parsed = JSON.parse(j);
      return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
    } catch (_) {}
  }
  return [];
}

function normalizeAdm(adm) {
  if (!adm) return adm;
  adm.room_details       = safeParseList(adm.room_details);
  adm.roomShitingDetails = safeParseList(adm.roomShitingDetails);
  return adm;
}

const getRoomStatus = beds => {
  if (!beds?.length) return "available";
  const s = beds.map(b => b.status);
  if (s.every(x => x === "Maintenance"))             return "maintenance";
  if (s.every(x => x === "Occupied"))                return "occupied";
  if (s.every(x => x === "Reserved"))                return "reserved";
  if (s.every(x => x === "Available - Not Cleaned")) return "not-cleaned";
  if (s.some(x => x === "Occupied") && s.some(x => x === "Available" || x === "Available - Not Cleaned")) return "partial";
  if (s.some(x => x === "Occupied"))                 return "partial";
  if (s.some(x => x === "Reserved"))                 return "reserved";
  if (s.some(x => x === "Available - Not Cleaned"))  return "not-cleaned";
  return "available";
};

const getActiveRoom = adm => {
  const shifts = safeParseList(adm.roomShitingDetails);
  for (const s of shifts) {
    if (s && s.is_roomActive === true)
      return { roomNo: s.newRoomNo||"-", bedNo: s.newBedNo||"-", source:"shifting" };
  }
  const rooms = safeParseList(adm.room_details);
  for (const r of rooms) {
    if (r && r.is_roomActive === true)
      return { roomNo: r.roomNo||"-", bedNo: r.bedNo||"-", source:"room_details" };
  }
  return { roomNo: adm.roomNo||"-", bedNo: adm.bedNo||"-", source:"fallback" };
};

const getAdmStatus = adm => {
  if (adm.is_discharged)  return "discharged";
  if (adm.is_cancelled)   return "cancelled";
  if (adm.is_admitted)    return "admitted";
  return "cancelled";
};

const fmtDate     = d => { try { return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"}); } catch{return "-";} };
const fmtTime     = d => { try { return new Date(d).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}); } catch{return "-";} };
const fmtDateTime = d => { if(!d) return "—"; try { return `${fmtDate(d)}, ${fmtTime(d)}`; } catch{return "—";} };

function calcDuration(start, end) {
  if (!start) return null;
  const ms = (end ? new Date(end) : new Date()) - new Date(start);
  if (ms < 0) return { days:0, hours:0 };
  return { days: Math.floor(ms/86400000), hours: Math.floor((ms%86400000)/3600000) };
}

function pName(d) {
  return [d.salutation, d.firstName, d.middleName, d.lastName].filter(Boolean).join(" ") || "-";
}

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════
function ConfirmModal({ icon="⚠️", title, message, confirmLabel="Confirm", cancelLabel="Cancel", onConfirm, onCancel, danger=false }) {
  return (
    <ModalOverlay onClick={onCancel}>
      <ConfirmMC onClick={e=>e.stopPropagation()}>
        <ConfirmBody>
          <ConfirmIcon>{icon}</ConfirmIcon>
          <ConfirmTitle>{title}</ConfirmTitle>
          <ConfirmMsg>{message}</ConfirmMsg>
          <ConfirmBtns>
            <CBtn onClick={onCancel}>{cancelLabel}</CBtn>
            <CBtn danger={danger} primary={!danger} onClick={onConfirm}>{confirmLabel}</CBtn>
          </ConfirmBtns>
        </ConfirmBody>
      </ConfirmMC>
    </ModalOverlay>
  );
}

function InfoModal({ icon="ℹ️", title, message, onClose, type="info" }) {
  const iconMap = { warning:"⚠️", error:"❌", success:"✅", info:"ℹ️" };
  return (
    <ModalOverlay onClick={onClose}>
      <InfoMC onClick={e=>e.stopPropagation()}>
        <InfoBody>
          <InfoIcon>{iconMap[type] || icon}</InfoIcon>
          <InfoTitle>{title}</InfoTitle>
          <InfoMsg>{message}</InfoMsg>
          <InfoBtns><IBtn primary onClick={onClose}>OK</IBtn></InfoBtns>
        </InfoBody>
      </InfoMC>
    </ModalOverlay>
  );
}

// ─── Reason Modal — used for both Cancel and Edit ─────────────────────────────
function ReasonModal({ mode="cancel", onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  const isCancel = mode === "cancel";
  return (
    <ModalOverlay onClick={onCancel}>
      <ReasonMC onClick={e=>e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{isCancel ? "🗑️ Cancel Admission" : "✏️ Edit Admission"}</ModalTitle>
          <CloseButton onClick={onCancel}>×</CloseButton>
        </ModalHeader>
        <ReasonBody>
          <div style={{fontSize:".8rem",color:"#374151",marginBottom:8}}>
            <strong>{isCancel ? "Cancellation" : "Edit"} Reason</strong>
            <span style={{color:"#ef4444",marginLeft:3}}>*</span>
          </div>
          <ReasonTxta
            placeholder={isCancel
              ? "Enter mandatory reason for cancellation…"
              : "Enter mandatory reason for editing this admission…"}
            value={reason}
            onChange={e => setReason(e.target.value)}
            autoFocus
          />
          <ReasonBtns>
            <CBtn onClick={onCancel}>Back</CBtn>
            <CBtn
              danger={isCancel}
              primary={!isCancel}
              disabled={!reason.trim()}
              onClick={() => reason.trim() && onConfirm(reason.trim())}
            >
              {isCancel ? "Confirm Cancel" : "Proceed to Edit"}
            </CBtn>
          </ReasonBtns>
        </ReasonBody>
      </ReasonMC>
    </ModalOverlay>
  );
}

function RoomTimeline({ roomDetails=[], shiftingDetails=[] }) {
  const roomEntries = roomDetails.map(r => ({
    key:`rd-${r.room_entry_id??Math.random()}`, roomNo:r.roomNo||"—", bedNo:r.bedNo||"—",
    isActive:Boolean(r.is_roomActive), isCleaned:Boolean(r.is_roomCleaned),
    start:r.startDateTime, end:r.endDateTime,
    label:`Entry #${r.room_entry_id||"?"}`, isShift:false,
  }));
  const shiftEntries = shiftingDetails.map(s => ({
    key:`sh-${s.shifting_id}`, roomNo:s.newRoomNo||"—", bedNo:s.newBedNo||"—",
    isActive:Boolean(s.is_roomActive), isCleaned:Boolean(s.is_roomCleaned),
    start:s.startDateTime, end:s.endDateTime,
    label:`Shifted from ${s.oldRoomNo||"?"}/${s.oldBedNo||"?"}`,
    shiftId:s.shifting_id, isShift:true,
  }));
  const all = [...roomEntries,...shiftEntries].sort((a,b)=>new Date(a.start||0)-new Date(b.start||0));
  if (!all.length) return null;
  return (
    <TimelineWrap>
      <TimelineTitle>🏨 Room Stay History
        <span style={{fontWeight:400,color:"#6b7280",textTransform:"none",fontSize:".7rem"}}>
          ({roomEntries.length} detail{roomEntries.length!==1?"s":""} · {shiftEntries.length} shifting{shiftEntries.length!==1?"s":""})
        </span>
      </TimelineTitle>
      <TLList>
        {all.map((r,idx) => {
          const dur = calcDuration(r.start, r.end);
          return (
            <TLItem key={r.key} active={r.isActive} last={idx===all.length-1}>
              <TLDot active={r.isActive} shift={r.isShift&&!r.isActive}/>
              <TLBody>
                <TLRoomNo>
                  Room <strong>{r.roomNo}</strong> / Bed <strong>{r.bedNo}</strong>
                  {r.isActive&&<TLBadge active>🟢 Current</TLBadge>}
                  {!r.isActive&&r.isCleaned&&<TLBadge cleaned>✅ Cleaned</TLBadge>}
                  {!r.isActive&&!r.isCleaned&&<TLBadge>Past</TLBadge>}
                  {r.isShift&&<TLBadge shift>🔄 Shifted · {r.shiftId}</TLBadge>}
                  {dur&&<TLDays>⏱ {dur.days}d {dur.hours}h</TLDays>}
                </TLRoomNo>
                <TLMeta>
                  <span>{r.label}</span>
                  <span>In: {fmtDateTime(r.start)}</span>
                  {r.end?<span>Out: {fmtDateTime(r.end)}</span>:r.isActive&&<span style={{color:"#0d9488",fontWeight:600}}>Still occupied</span>}
                </TLMeta>
              </TLBody>
            </TLItem>
          );
        })}
      </TLList>
    </TimelineWrap>
  );
}

function RoomHistoryModal({ adm, onClose }) {
  const roomDetails  = Array.isArray(adm.room_details)       ? adm.room_details       : [];
  const shiftDetails = Array.isArray(adm.roomShitingDetails) ? adm.roomShitingDetails : [];
  const totalCount   = roomDetails.length + shiftDetails.length;

  const roomEntries = roomDetails.map((r,idx) => ({
    key:`rd-${r.room_entry_id??idx}`, roomNo:r.roomNo||"—", bedNo:r.bedNo||"—",
    isActive:Boolean(r.is_roomActive), isCleaned:Boolean(r.is_roomCleaned),
    start:r.startDateTime, end:r.endDateTime,
    label:`Admission room entry #${r.room_entry_id||idx+1}`, isShift:false,
  })).sort((a,b)=>new Date(a.start||0)-new Date(b.start||0));

  const shiftEntries = shiftDetails.map((s,idx) => ({
    key:`sh-${s.shifting_id??idx}`, roomNo:s.newRoomNo||"—", bedNo:s.newBedNo||"—",
    isActive:Boolean(s.is_roomActive), isCleaned:Boolean(s.is_roomCleaned),
    start:s.startDateTime, end:s.endDateTime,
    label:`Shifted from Room ${s.oldRoomNo||"?"}/${s.oldBedNo||"?"}`,
    shiftId:s.shifting_id, isShift:true,
  })).sort((a,b)=>new Date(a.start||0)-new Date(b.start||0));

  const renderCard = (r,i) => {
    const dur = calcDuration(r.start, r.end);
    return (
      <RHCard key={r.key} i={i} active={r.isActive} shift={r.isShift}>
        <RHCardHead active={r.isActive} shift={r.isShift}>
          <div>
            <RHRoomLabel>Room {r.roomNo} / Bed {r.bedNo}</RHRoomLabel>
            <RHRoomSub>{r.label}{r.shiftId?` · ID: ${r.shiftId}`:""}</RHRoomSub>
          </div>
          <RHStatusPill active={r.isActive} cleaned={r.isCleaned} shift={r.isShift&&!r.isActive}>
            {r.isActive?"🟢 Currently Active":r.isCleaned?"✅ Cleaned":r.isShift?"🔄 Shifted":"⬜ Past"}
          </RHStatusPill>
        </RHCardHead>
        <RHGrid>
          <RHCell><RHCLbl>Check-In</RHCLbl><RHCVal>{fmtDateTime(r.start)}</RHCVal></RHCell>
          <RHCell><RHCLbl>Check-Out</RHCLbl><RHCVal>{r.end?fmtDateTime(r.end):"—"}</RHCVal></RHCell>
        </RHGrid>
        <RHFooter active={r.isActive} shift={r.isShift&&!r.isActive}>
          ⏱ Duration: {dur?`${dur.days}d ${dur.hours}h`:"—"}
          {r.isActive&&" (ongoing)"}{!r.isActive&&!r.end&&" · no checkout recorded"}
        </RHFooter>
      </RHCard>
    );
  };

  return (
    <ModalOverlay onClick={onClose}>
      <RHModal onClick={e=>e.stopPropagation()}>
        <ModalHeader style={{borderBottom:"none",paddingBottom:8}}>
          <div>
            <ModalTitle>🏨 Room History — {adm.ipNumber}</ModalTitle>
            <div style={{fontSize:".7rem",color:"#6b7280",marginTop:2}}>
              {pName(adm)} &nbsp;·&nbsp; {totalCount} total record{totalCount!==1?"s":""}
            </div>
          </div>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <div style={{display:"flex",gap:8,padding:"6px 20px 10px",borderBottom:"1px solid #e5e7eb",flexWrap:"wrap"}}>
          <span style={{fontSize:".72rem",padding:"3px 10px",borderRadius:10,background:"#f0fdf4",border:"1px solid #bbf7d0",color:"#166534",fontWeight:600}}>
            📋 {roomEntries.length} room detail{roomEntries.length!==1?"s":""}
          </span>
          <span style={{fontSize:".72rem",padding:"3px 10px",borderRadius:10,background:"#f3e8ff",border:"1px solid #e9d5ff",color:"#7e22ce",fontWeight:600}}>
            🔄 {shiftEntries.length} shifting{shiftEntries.length!==1?"s":""}
          </span>
          {(()=>{const{roomNo,bedNo,source}=getActiveRoom(adm);return(
            <span style={{fontSize:".72rem",padding:"3px 10px",borderRadius:10,background:"#dcfce7",border:"1px solid #86efac",color:"#166534",fontWeight:700}}>
              🟢 Active: Room {roomNo} / Bed {bedNo}{source==="shifting"&&" 🔄"}
            </span>
          );})()}
        </div>
        <RHBody>
          {totalCount===0&&<NR>No room history found.</NR>}
          {roomEntries.length>0&&<><RHSection>📋 Room Details<RHSectionCount>{roomEntries.length} entr{roomEntries.length!==1?"ies":"y"}</RHSectionCount></RHSection>{roomEntries.map((r,i)=>renderCard(r,i))}</>}
          {shiftEntries.length>0&&<><RHSection shift>🔄 Room Shiftings<RHSectionCount>{shiftEntries.length} entr{shiftEntries.length!==1?"ies":"y"}</RHSectionCount></RHSection>{shiftEntries.map((r,i)=>renderCard(r,i))}</>}
          <div style={{height:12}}/>
        </RHBody>
      </RHModal>
    </ModalOverlay>
  );
}

function AlreadyAdmittedModal({ info, onClose, onEdit }) {
  return (
    <ModalOverlay onClick={onClose}>
      <AlertMC onClick={e=>e.stopPropagation()}>
        <ModalHeader><ModalTitle>⚠️ Already Admitted</ModalTitle><CloseButton onClick={onClose}>×</CloseButton></ModalHeader>
        <AlertBody>
          <AlertIcon>🏥</AlertIcon>
          <AlertMsg>This patient already has an <strong>active admission</strong>. A new admission cannot be created until the current one is discharged or cancelled.</AlertMsg>
          <AlertIP>IP: {info.ipNumber}</AlertIP>
          <AlertMeta>
            {info.admissionDateTime&&<>{fmtDateTime(info.admissionDateTime)}<br/></>}
            {(info.roomNo||info.bedNo)&&<>Room: {info.roomNo} / Bed: {info.bedNo}</>}
          </AlertMeta>
          <AlertBtns>
            <ABtn onClick={onClose}>Close</ABtn>
            {onEdit&&<ABtn primary onClick={()=>{onClose();onEdit(info);}}>✏️ Edit Existing Admission</ABtn>}
          </AlertBtns>
        </AlertBody>
      </AlertMC>
    </ModalOverlay>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function Admission() {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const API_ADMISSION_LIST   = `${HmsBaseUrl}admission-list/`;
  const API_ADMISSION_DETAIL = (ipNumber) => `${HmsBaseUrl}admission-detail/${encodeURIComponent(ipNumber)}/`;
  const API_ROOM_SEARCH      = `${HmsBaseUrl}admission-room-search/`;

  const [admissions,     setAdmissions]     = useState([]);
  const [doctors,        setDoctors]        = useState([]);
  const [packages,       setPackages]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [saving,         setSaving]         = useState(false);

  const today = new Date().toISOString().slice(0,10);
  const [fDoctor, setFDoctor] = useState("ALL");
  const [fFrom,   setFFrom]   = useState(today);
  const [fTo,     setFTo]     = useState(today);
  const [fStatus, setFStatus] = useState("All");
  const [tSearch, setTSearch] = useState("");
  const [perPage, setPerPage] = useState(15);
  const [page,    setPage]    = useState(1);

  const [formOpen,  setFormOpen]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState(EMPTY);

  // ── When form is in edit mode, store the editReason until submit ──────────
  const [pendingEditReason, setPendingEditReason] = useState("");

  const [showRoom,  setShowRoom]  = useState(false);
  const [rFilter,   setRFilter]   = useState({ room_number:"", block:"", floor:"" });
  const [allRooms,  setAllRooms]  = useState([]);
  const [loadRooms, setLoadRooms] = useState(false);
  const [showBed,   setShowBed]   = useState(false);
  const [selRoom,   setSelRoom]   = useState(null);

  const [printData,      setPrintData]      = useState(null);
  const [historyAdm,     setHistoryAdm]     = useState(null);
  const [alreadyAdmInfo, setAlreadyAdmInfo] = useState(null);
  const [confirmModal,   setConfirmModal]   = useState(null);
  const [infoModal,      setInfoModal]      = useState(null);
  const [openMenu,       setOpenMenu]       = useState(null);
  const [menuPos,        setMenuPos]        = useState({ top:0, left:0 });
  const menuRef = useRef(null);

  // ── Reason modals ─────────────────────────────────────────────────────────
  const [reasonModal,    setReasonModal]    = useState(null); // { mode:"cancel"|"edit", adm }

  // ── Room Shifting modal ───────────────────────────────────────────────────
  const [shiftAdm,       setShiftAdm]       = useState(null); // adm object to prefill

  // ── IP Advance modal ─────────────────────────────────────────────────────
  const [ipAdvAdm,       setIpAdvAdm]       = useState(null); // adm object to prefill

  const showConfirm = (opts) => new Promise(resolve => {
    setConfirmModal({
      ...opts,
      onConfirm: () => { setConfirmModal(null); resolve(true); },
      onCancel:  () => { setConfirmModal(null); resolve(false); },
    });
  });
  const showInfo = (opts) => { setInfoModal({ ...opts, onClose: () => setInfoModal(null) }); };

  const resolvePackageName = (packageNo) => {
    if (!packageNo) return "";
    const pkg = packages.find(p => String(p.packageNo) === String(packageNo));
    return pkg ? pkg.packageName : "";
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
      if (fFrom)             p.append("from_date",        fFrom);
      if (fTo)               p.append("to_date",          fTo);
      if (fDoctor !== "ALL") p.append("admitting_doctor", fDoctor);
      if (fStatus !== "All") p.append("status",           fStatus);
      const q   = p.toString() ? `?${p.toString()}` : "";
      const res = await apiRequest(`${API_ADMISSION_LIST}${q}`, "GET");
      const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
      setAdmissions(list.map(normalizeAdm));
    } catch { setAdmissions([]); }
    finally  { setLoading(false); }
  };

  const fetchPackages = async () => {
    try {
      const res  = await apiRequest(`${HmsBaseUrl}packages/`, "GET");
      const list = res?.packages || res?.data?.packages || res?.data || [];
      setPackages(Array.isArray(list) ? list : []);
    } catch { setPackages([]); }
  };

  const fetchAllRooms = async (fo={}) => {
    setLoadRooms(true);
    try {
      const f = { ...rFilter, ...fo };
      const p = new URLSearchParams();
      if (f.room_number) p.append("room_number", f.room_number);
      if (f.block)       p.append("block",        f.block);
      if (f.floor)       p.append("floor",        f.floor);
      const q   = p.toString() ? `?${p.toString()}` : "";
      const res = await apiRequest(`${API_ROOM_SEARCH}${q}`, "GET");
      let rooms = [];
      if (Array.isArray(res))              rooms = res;
      else if (Array.isArray(res?.data))   rooms = res.data;
      else if (Array.isArray(res?.data?.data)) rooms = res.data.data;
      setAllRooms(rooms);
    } catch { setAllRooms([]); }
    finally  { setLoadRooms(false); }
  };

  // ── Fetch patient by UHID — also checks for active admission ─────────────
  const fetchPatientByUHID = async () => {
    const uhid = form.uhid.trim();
    if (!uhid) { showInfo({ type:"warning", title:"UHID Required", message:"Please enter a UHID before searching." }); return; }
    try {
      const res = await apiRequest(`${HmsBaseUrl}op-patient/${encodeURIComponent(uhid)}/`, "GET");
      if (!res.success) { showInfo({ type:"error", title:"Patient Not Found", message: res.error||"No patient found for this UHID." }); return; }
      const d = res.data;

      // ── Check if patient has active admission ──────────────────────────────
      const activeAdm = admissions.find(a =>
        String(a.uhid).trim() === String(uhid).trim()
        && a.is_admitted
        && !a.is_discharged
        && !a.is_cancelled
      );
      if (activeAdm) {
        setAlreadyAdmInfo({
          ipNumber: activeAdm.ipNumber,
          admissionDateTime: activeAdm.admissionDateTime,
          roomNo: getActiveRoom(activeAdm).roomNo,
          bedNo:  getActiveRoom(activeAdm).bedNo,
        });
      }

      setForm(p => ({
        ...p,
        salutation: d.salutation||"", firstName: d.firstName||"",
        middleName: d.middleName||"", lastName:  d.lastName||"",
        dob:  d.dob||"",
        age:  d.age||"",             // Already calculated from DOB by backend
        gender: d.gender||"",
        mobilePhone: d.mobilePhone||d.phone||"",
        permanent_address: d.permanent_address||"", area: d.area||"",
        zipcode: d.zipcode||"", city: d.city||"", state: d.state||"",
        customerType: d.customerType||d.customer_type||"",
        insuranceCompanyName: d.insuranceCompanyName||d.company_name||"",
        company_code: d.company_code||"",
      }));
      toast.success("Patient loaded");
    } catch { showInfo({ type:"error", title:"Error", message:"Failed to fetch patient details." }); }
  };

  const fetchAdmissionByIP = async () => {
    const ip = form.ipNumber.trim();
    if (!ip) { showInfo({ type:"warning", title:"IP Number Required", message:"Please enter an IP Number before searching." }); return; }
    try {
      const res = await apiRequest(`${API_ADMISSION_LIST}?ip_number=${encodeURIComponent(ip)}`, "GET");
      if (!res.success) throw new Error(res.error||"Not found");
      const list = Array.isArray(res.data?.data)?res.data.data:Array.isArray(res.data)?res.data:[];
      if (!list.length) { showInfo({ type:"error", title:"Not Found", message:"No admission found for this IP Number." }); return; }
      const found = list[0];

      // If the found admission is active, show warning and enter edit mode
      if (found.is_admitted && !found.is_discharged && !found.is_cancelled) {
        setAlreadyAdmInfo({
          ipNumber: found.ipNumber,
          admissionDateTime: found.admissionDateTime,
          roomNo: getActiveRoom(found).roomNo,
          bedNo:  getActiveRoom(found).bedNo,
        });
      }
      loadAdmissionIntoForm(found);
      toast.success(`Admission loaded: ${found.ipNumber||ip}`);
    } catch(err) { showInfo({ type:"error", title:"Admission Not Found", message: err.message||"Could not retrieve admission." }); }
  };

  function loadAdmissionIntoForm(adm) {
    setEditingId(adm.ipNumber);
    const { roomNo, bedNo } = getActiveRoom(adm);
    const storedPackageNo = adm.packageNo || "";
    const resolvedName    = resolvePackageName(storedPackageNo);
    setPendingEditReason("");
    setForm({
      ...EMPTY,
      uhid:                 adm.uhid                ||"",
      ipNumber:             adm.ipNumber            ||"",
      admittingDoctor:      adm.admittingDoctor      ||"",
      consultingDoctor:     adm.consultingDoctor     ||"",
      roomNo,
      bedNo,
      reasonForAdmission:   adm.reasonForAdmission  ||"",
      packageNo:            storedPackageNo,
      packageName:          resolvedName,
      mlc_type:             adm.mlc_type            ||"",
      mlc_remarks:          adm.mlc_remarks         ||"",
      salutation:           adm.salutation          ||"",
      firstName:            adm.firstName           ||"",
      middleName:           adm.middleName          ||"",
      lastName:             adm.lastName            ||"",
      dob:                  adm.dob                 ||"",
      age:                  adm.age                 ||"",
      gender:               adm.gender              ||"",
      mobilePhone:          adm.mobilePhone         ||"",
      permanent_address:    adm.permanent_address   ||"",
      area:                 adm.area                ||"",
      zipcode:              adm.zipcode             ||"",
      city:                 adm.city                ||"",
      state:                adm.state               ||"",
      customerType:         adm.customerType        ||"",
      insuranceCompanyName: adm.insuranceCompanyName||"",
      company_code:         adm.company_code        ||"",
      room_details:       safeParseList(adm.room_details),
      roomShitingDetails: safeParseList(adm.roomShitingDetails),
    });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    admitted:   admissions.filter(a => getAdmStatus(a)==="admitted").length,
    discharged: admissions.filter(a => a.is_discharged).length,
  };

  const getDrName = id =>
    doctors.find(d => String(d.employeeId)===String(id))?.employeeName || String(id||"-");

  const filtered = admissions.filter(a => {
    if (!tSearch) return true;
    const q = tSearch.toLowerCase();
    const { roomNo, bedNo } = getActiveRoom(a);
    return `${a.uhid} ${a.ipNumber} ${pName(a)} ${getDrName(a.admittingDoctor)} ${roomNo} ${bedNo}`
      .toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  const paginated  = filtered.slice((page-1)*perPage, page*perPage);

  // ── Form helpers ──────────────────────────────────────────────────────────
  const openNewForm  = () => { setEditingId(null); setForm(EMPTY); setPendingEditReason(""); setFormOpen(true); };
  const openEditForm = adm => { setOpenMenu(null); loadAdmissionIntoForm(adm); setFormOpen(true); window.scrollTo({top:0,behavior:"smooth"}); };
  const closeForm    = () => { setFormOpen(false); setEditingId(null); setForm(EMPTY); setPendingEditReason(""); };

  const handleFormChange = e => {
    const { name, value, type, files } = e.target;
    if (name === "packageNo") {
      const resolvedName = resolvePackageName(value);
      setForm(p => ({ ...p, packageNo: value, packageName: resolvedName }));
    } else {
      setForm(p => ({ ...p, [name]: type==="file" ? files[0] : value }));
    }
  };

  // ── Submit (new) ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!editingId && !form.uhid) { showInfo({ type:"warning", title:"UHID Required", message:"Please enter a UHID to proceed." }); return; }
    if (!form.admittingDoctor)    { showInfo({ type:"warning", title:"Doctor Required", message:"Please select an Admitting Doctor." }); return; }
    if (!form.roomNo)             { showInfo({ type:"warning", title:"Room Required", message:"Please select a room before saving." }); return; }
    if (!form.bedNo)              { showInfo({ type:"warning", title:"Bed Required", message:"Please select a bed before saving." }); return; }

    // Edit requires a reason — prompt via ReasonModal first
    if (editingId) {
      setReasonModal({ mode:"edit", adm: null });
      return;
    }

    await _doSave();
  };

  // Called after edit reason is confirmed
  const handleEditConfirmed = async (reason) => {
    setReasonModal(null);
    setPendingEditReason(reason);
    await _doSave(reason);
  };

  const _doSave = async (editReason = "") => {
    setSaving(true);
    const payload = new FormData();
    ["uhid","admittingDoctor","consultingDoctor","roomNo","bedNo",
     "reasonForAdmission","mlc_type","mlc_remarks"].forEach(k => { if (form[k]) payload.append(k, form[k]); });
    if (form.packageNo) payload.append("packageNo", form.packageNo);
    payload.append("admissionDateTime", new Date().toISOString());
    if (form.mlc_doc instanceof File) payload.append("mlc_doc", form.mlc_doc);

    if (editingId) {
      payload.append("action", "edit");
      payload.append("edited_Reason", editReason || pendingEditReason);
    }

    try {
      let res;
      if (editingId) {
        res = await apiRequest(API_ADMISSION_DETAIL(editingId), "PUT", payload);
      } else {
        res = await apiRequest(API_ADMISSION_LIST, "POST", payload);
      }

      if (res.success) {
        toast.success(editingId ? "Admission updated!" : "Admission saved!");
        closeForm();
        fetchAdmissions();
      } else if (res.already_admitted) {
        setAlreadyAdmInfo({ ipNumber:res.ipNumber, admissionDateTime:res.admissionDateTime, roomNo:res.roomNo, bedNo:res.bedNo });
      } else {
        showInfo({ type:"error", title:"Save Failed", message: res.error||"Failed to save admission. Please try again." });
      }
    } catch {
      showInfo({ type:"error", title:"Error", message:"An unexpected error occurred while saving. Please try again." });
    }
    finally { setSaving(false); }
  };

  // ── Cancel ────────────────────────────────────────────────────────────────
  // Opens ReasonModal first, then sends PUT action=cancel with reason
  const handleCancel = (adm) => {
    setOpenMenu(null);
    setReasonModal({ mode:"cancel", adm });
  };

  const handleCancelConfirmed = async (adm, reason) => {
    setReasonModal(null);
    try {
      const res = await apiRequest(API_ADMISSION_DETAIL(adm.ipNumber), "PUT", {
        action: "cancel",
        cancelled_Reason: reason,
      });
      if (res.success) { toast.success("Admission cancelled"); fetchAdmissions(); }
      else showInfo({ type:"error", title:"Cancel Failed", message: res.error||"Failed to cancel admission." });
    } catch { showInfo({ type:"error", title:"Error", message:"Failed to cancel admission. Please try again." }); }
  };

  const handlePrint = adm => { setOpenMenu(null); setPrintData({ ...adm, admittingDoctorName: getDrName(adm.admittingDoctor) }); };

  const handleMenuToggle = (ipNumber, e) => {
    if (openMenu === ipNumber) { setOpenMenu(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const mw   = 200;
    let left   = rect.right - mw;
    let top    = rect.bottom + 4;
    if (left < 8) left = 8;
    if (left + mw > window.innerWidth - 8) left = window.innerWidth - mw - 8;
    setMenuPos({ top, left });
    setOpenMenu(ipNumber);
  };

  const doPrint = () => {
    const pd    = printData;
    const admDT = pd.admissionDateTime ? new Date(pd.admissionDateTime) : new Date();
    const ipStr = pd.ipNumber||"";
    const { roomNo, bedNo } = getActiveRoom(pd);
    const encoded = encodeCode128(ipStr);
    const bW = 240, modW = bW/encoded.length;
    let barsHtml="", xPos=0;
    for (let i=0;i<encoded.length;i++) { if(i%2===0) barsHtml+=`<rect x="${xPos.toFixed(2)}" y="0" width="${Math.max(modW,0.6).toFixed(2)}" height="50" fill="black"/>`; xPos+=modW; }
    const w = window.open("","_blank","width=640,height=440");
    w.document.write(`<!DOCTYPE html><html><head><title>IP Admission Slip</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Courier New',monospace;font-size:12px;padding:20px;}.slip{width:540px;border:2px solid #000;padding:14px;}.row{display:flex;justify-content:space-between;gap:14px;}.right{text-align:right;}.big{font-size:18px;font-weight:900;letter-spacing:.5px;}.bold{font-weight:700;font-size:12px;}.line{margin:2px 0;font-size:11px;}.bc-label{font-family:'Courier New',monospace;font-size:9px;text-align:center;display:block;letter-spacing:1.5px;margin-bottom:4px;}@media print{body{padding:0;}.slip{border:none;}}</style></head><body><div class="slip"><div class="row"><div class="left"><svg xmlns="http://www.w3.org/2000/svg" width="${bW}" height="50" viewBox="0 0 ${bW} 50">${barsHtml}</svg><span class="bc-label">${ipStr}</span><div class="bold">${pName(pd)}</div><div class="line">${pd.age||""} ${pd.gender||""}</div><div class="line">${pd.permanent_address||""}</div><div class="line">${[pd.area,pd.city,pd.state].filter(Boolean).join(", ")}</div><div class="line">${pd.mobilePhone||""}</div><div class="line">Admitted: Dr. ${pd.admittingDoctorName||getDrName(pd.admittingDoctor)}</div></div><div class="right"><div class="big">IP NO: ${ipStr}</div><div class="line">${pd.insuranceCompanyName||""}</div><div class="line">UHID : ${pd.uhid||""}</div><div class="line">DOB  : ${pd.dob||"-"}</div><div class="line">Age  : ${pd.age||"-"}</div><div class="line">DOA  : ${admDT.toLocaleDateString("en-IN")}</div><div class="line">TIME : ${admDT.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})}</div><div class="line">Room : ${roomNo} / ${bedNo}</div></div></div></div><script>window.onload=function(){window.print();window.close();};<\/script></body></html>`);
    w.document.close();
  };

  const openRoomModal = () => { setShowRoom(true); fetchAllRooms(); };
  const grouped = (() => {
    const g={};
    allRooms.forEach(r => { const bl=r.block||"UNKNOWN",fl=r.floor??"?"; if(!g[bl])g[bl]={}; if(!g[bl][fl])g[bl][fl]=[]; g[bl][fl].push(r); });
    return g;
  })();
  const handleRoomClick = room => {
    if (getRoomStatus(room.beds) === "maintenance") return;
    const hasAvail = (room.beds||[]).some(b => b.status === "Available");
    if (!hasAvail) return;
    setSelRoom(room); setShowRoom(false); setShowBed(true);
  };
  const handleBedSelect = (bedNo, room) => {
    const r = room||selRoom;
    if (!r) return;
    setForm(p => ({ ...p, roomNo: r.room_number, bedNo }));
    setShowBed(false); setShowRoom(false);
    toast.success(`Room ${r.room_number} / Bed ${bedNo} selected`);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container style={{ padding:0 }}>

        <PageHeader>
          <PageTitle>🏥 Admission</PageTitle>
          <NewAdmBtn onClick={() => { formOpen ? closeForm() : openNewForm(); }}>
            {formOpen ? "− Close Form" : "+ New Admission"}
          </NewAdmBtn>
        </PageHeader>

        <StatStrip>
          {[
            { label:"Total Admissions", value:stats.admitted,   icon:"🛏️", bg:"#f0fdf4" },
            { label:"Total Discharges", value:stats.discharged, icon:"📤", bg:"#eff6ff" },
          ].map((s,i) => (
            <StatCard key={i} i={i}>
              <SIcon bg={s.bg}>{s.icon}</SIcon>
              <div><SLabel>{s.label}</SLabel><SValue>{s.value}</SValue></div>
            </StatCard>
          ))}
        </StatStrip>

        <FilterBar>
          <FF flex="1 1 180px">
            <FL>Admitting Doctor</FL>
            <FSel value={fDoctor} onChange={e=>{setFDoctor(e.target.value);setPage(1);}}>
              <option value="ALL">ALL</option>
              {doctors.map(d=><option key={d.employeeId} value={String(d.employeeId)}>{d.employeeName}</option>)}
            </FSel>
          </FF>
          <FF flex="0 0 150px"><FL>From Date</FL><FInp type="date" value={fFrom} onChange={e=>{setFFrom(e.target.value);setPage(1);}}/></FF>
          <FF flex="0 0 150px"><FL>To Date</FL><FInp type="date" value={fTo} onChange={e=>{setFTo(e.target.value);setPage(1);}}/></FF>
          <FF flex="0 0 140px">
            <FL>Status</FL>
            <FSel value={fStatus} onChange={e=>{setFStatus(e.target.value);setPage(1);}}>
              <option>All</option><option>Admitted</option><option>Discharged</option>
            </FSel>
          </FF>
          <SearchBtn onClick={fetchAdmissions}>🔍 Search</SearchBtn>
        </FilterBar>

        {/* ══ FORM PANEL ══ */}
        {formOpen && (
          <FormPanel>
            <FPHead>
              <FPTitle>
                {editingId ? "✏️ Edit Admission" : "🏥 New Admission"}
                {editingId && <span style={{fontWeight:400,color:"#6b7280",fontSize:".72rem"}}>&nbsp; IP: {editingId}</span>}
                {editingId && form.is_cancelled && <span style={{background:"#fee2e2",color:"#991b1b",fontSize:".68rem",padding:"1px 8px",borderRadius:10,marginLeft:4}}>Cancelled</span>}
              </FPTitle>
              <CloseFP onClick={closeForm}>×</CloseFP>
            </FPHead>

            <div style={{background:"linear-gradient(180deg,#f0fdf4 0%,#fff 80px)"}}>
              <FGrid>

                {/* ── Active admission warning banner ── */}
                {editingId && (()=>{
                  const activeExists = admissions.find(a =>
                    String(a.uhid).trim() === String(form.uhid).trim()
                    && a.is_admitted && !a.is_discharged && !a.is_cancelled
                    && a.ipNumber !== editingId
                  );
                  if (!activeExists) return null;
                  return (
                    <ActiveBanner>
                      ⚠️ <strong>Already Has Active Admission</strong> — IP: {activeExists.ipNumber}.
                      &nbsp;You are currently editing a different record.
                    </ActiveBanner>
                  );
                })()}

                <Field span={2}>
                  <Lbl req>UHID</Lbl>
                  <IRow>
                    <Inp name="uhid" value={form.uhid} onChange={handleFormChange} placeholder="Enter UHID" readOnly={!!editingId}/>
                    <IconBtn type="button" onClick={fetchPatientByUHID} disabled={!!editingId}>🔍</IconBtn>
                  </IRow>
                </Field>

                <Field span={2}>
                  <Lbl>IP Number</Lbl>
                  <IRow>
                    <Inp name="ipNumber" value={form.ipNumber} onChange={handleFormChange}
                      placeholder={editingId?"":"Enter IP to load admission"} readOnly={!!editingId}
                      style={editingId?{background:"#f3f4f6"}:{}}/>
                    {!editingId&&<IconBtn type="button" onClick={fetchAdmissionByIP} title="Search by IP">🔍</IconBtn>}
                  </IRow>
                </Field>

                <Field span={2}>
                  <Lbl>Date &amp; Time</Lbl>
                  <Inp value={`${fmtDate(new Date())}  ${fmtTime(new Date())}`} readOnly style={{fontFamily:"monospace",background:"#f3f4f6"}}/>
                </Field>

                <SecDiv>Patient Details (auto-filled from UHID)</SecDiv>
                <Field span={3}><Lbl>Patient Name</Lbl><Inp value={pName(form)} readOnly/></Field>
                <Field><Lbl>DOB</Lbl><Inp value={form.dob||""} readOnly style={{background:"#f3f4f6"}}/></Field>
                <Field>
                  <Lbl>Age (calculated)</Lbl>
                  <Inp value={form.age||""} readOnly
                    style={{background:"#f0fdf4",fontWeight:700,color:"#0d9488"}}
                    title="Automatically calculated from Date of Birth"/>
                </Field>
                <Field><Lbl>Gender</Lbl><Inp value={form.gender} readOnly/></Field>
                <Field span={2}><Lbl>Customer Type</Lbl><Inp value={form.customerType} readOnly/></Field>
                <Field span={4}><Lbl>Insurance</Lbl><Inp value={form.insuranceCompanyName||""} readOnly placeholder="—"/></Field>
                <Field span={2}><Lbl>Phone</Lbl><Inp value={form.mobilePhone} readOnly/></Field>
                <Field span={4}><Lbl>Address</Lbl><Inp value={form.permanent_address} readOnly/></Field>
                <Field span={2}><Lbl>Area</Lbl><Inp value={form.area} readOnly/></Field>
                <Field><Lbl>City</Lbl><Inp value={form.city} readOnly/></Field>
                <Field><Lbl>State</Lbl><Inp value={form.state} readOnly/></Field>
                <Field><Lbl>Zip</Lbl><Inp value={form.zipcode} readOnly/></Field>

                <SecDiv>Clinical</SecDiv>
                <Field span={3}>
                  <Lbl req>Admitting Doctor</Lbl>
                  <Sel name="admittingDoctor" value={form.admittingDoctor} onChange={handleFormChange}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d=><option key={d.employeeId} value={d.employeeId}>{d.employeeName}</option>)}
                  </Sel>
                </Field>
                <Field span={3}>
                  <Lbl>Consulting Doctor</Lbl>
                  <Sel name="consultingDoctor" value={form.consultingDoctor} onChange={handleFormChange}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d=><option key={d.employeeId} value={d.employeeId}>{d.employeeName}</option>)}
                  </Sel>
                </Field>

                <SecDiv>Room &amp; Bed</SecDiv>
                <Field span={2}>
                  <Lbl req>Room No.</Lbl>
                  <IRow>
                    <Inp name="roomNo" value={form.roomNo} onChange={handleFormChange} placeholder="Click 🔍 to pick"/>
                    <IconBtn type="button" onClick={openRoomModal}>🔍</IconBtn>
                  </IRow>
                </Field>
                <Field span={2}>
                  <Lbl req>Bed No.</Lbl>
                  <Inp name="bedNo" value={form.bedNo} readOnly style={{background:"#f3f4f6"}} placeholder="Auto-filled"/>
                </Field>
                <Field span={2}/>

                {editingId && (
                  <RoomTimeline roomDetails={form.room_details} shiftingDetails={form.roomShitingDetails}/>
                )}

                <SecDiv>Admission &amp; Package</SecDiv>
                <Field span={3}>
                  <Lbl>Reason for Admission</Lbl>
                  <Txta name="reasonForAdmission" value={form.reasonForAdmission} onChange={handleFormChange} rows={2}/>
                </Field>
                <Field span={3}>
                  <Lbl>Package</Lbl>
                  <Sel name="packageNo" value={form.packageNo} onChange={handleFormChange}>
                    <option value="">— Select Package —</option>
                    {packages.map(pkg => (
                      <option key={pkg.packageNo} value={String(pkg.packageNo)}>
                        {pkg.packageName}{pkg.totalPrice?` (₹${pkg.totalPrice})`:""}
                      </option>
                    ))}
                  </Sel>
                  {form.packageNo && (
                    <span style={{fontSize:".68rem",color:"#6b7280",marginTop:2}}>
                      Selected: {resolvePackageName(form.packageNo) || form.packageName || "—"}
                    </span>
                  )}
                </Field>

                <SecDiv>MLC (if applicable)</SecDiv>
                <Field span={2}>
                  <Lbl>MLC Type</Lbl>
                  <Sel name="mlc_type" value={form.mlc_type} onChange={handleFormChange}>
                    <option value=""/><option value="Accident">Accident</option>
                    <option value="Assault">Assault</option><option value="Other">Other</option>
                  </Sel>
                </Field>
                <Field span={2}>
                  <Lbl>MLC Document</Lbl>
                  <Inp type="file" name="mlc_doc" onChange={handleFormChange} style={{paddingTop:3,height:"auto"}}/>
                </Field>
                <Field span={2}>
                  <Lbl>MLC Remarks</Lbl>
                  <Txta name="mlc_remarks" value={form.mlc_remarks} onChange={handleFormChange} rows={2}/>
                </Field>

              </FGrid>

              <FActions>
                <SmBtn secondary onClick={closeForm}>Discard</SmBtn>
                <SmBtn onClick={handleSubmit} disabled={saving}>
                  {saving?"Saving…":editingId?"Update Admission":"Save Admission"}
                </SmBtn>
              </FActions>
            </div>
          </FormPanel>
        )}

        {/* ── Table Controls ── */}
        <TTBar>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:".75rem",color:"#6b7280"}}>
            Show&nbsp;
            <FSel style={{width:60,height:28}} value={perPage} onChange={e=>{setPerPage(Number(e.target.value));setPage(1);}}>
              {[10,15,25,50].map(n=><option key={n}>{n}</option>)}
            </FSel>
            &nbsp;entries
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:".75rem",color:"#6b7280"}}>
            Search:&nbsp;
            <input value={tSearch} onChange={e=>{setTSearch(e.target.value);setPage(1);}}
              placeholder="Name / UHID / IP / Room…"
              style={{height:28,padding:"0 8px",fontSize:".75rem",border:"1px solid #d1d5db",borderRadius:4,outline:"none"}}/>
          </div>
        </TTBar>

        {/* ── Table ── */}
        <TWrap>
          <Tbl>
            <Thead>
              <tr>
                <Th>Status</Th><Th>Adm Date</Th><Th>Time</Th>
                <Th>UHID</Th><Th>IP No.</Th><Th>Name</Th><Th>Age</Th><Th>Gender</Th>
                <Th>Admitting Dr.</Th><Th>Active Room / Bed</Th><Th>Room History</Th><Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {loading ? (
                <tr><Td colSpan={12} style={{textAlign:"center",padding:28}}>Loading…</Td></tr>
              ) : paginated.length===0 ? (
                <tr><Td colSpan={12} style={{textAlign:"center",padding:28,color:"#6b7280"}}>No admissions found</Td></tr>
              ) : paginated.map((adm,idx) => {
                const t = getAdmStatus(adm);
                const { roomNo, bedNo, source } = getActiveRoom(adm);
                const rdCount    = Array.isArray(adm.room_details)       ? adm.room_details.length       : 0;
                const shCount    = Array.isArray(adm.roomShitingDetails) ? adm.roomShitingDetails.length : 0;
                const totalCount = rdCount + shCount;

                return (
                  <Tr key={adm.ipNumber||idx} i={idx}>
                    <Td><Badge t={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</Badge></Td>
                    <Td>{adm.admissionDateTime ? fmtDate(adm.admissionDateTime) : "-"}</Td>
                    <Td>{adm.admissionDateTime ? fmtTime(adm.admissionDateTime) : "-"}</Td>
                    <Td style={{fontWeight:600,color:"#0d9488"}}>{adm.uhid||"-"}</Td>
                    <Td style={{fontWeight:600,color:"#6d28d9"}}>{adm.ipNumber||"-"}</Td>
                    <Td style={{fontWeight:600}}>{pName(adm)}</Td>
                    <Td>{adm.age||"-"}</Td>
                    <Td>{adm.gender||"-"}</Td>
                    <Td>{adm.admittingDoctorName||getDrName(adm.admittingDoctor)}</Td>
                    <Td>
                      {roomNo!=="-" ? (
                        <span>
                          <span style={{fontWeight:700}}>{roomNo}</span>
                          <span style={{color:"#6b7280"}}>/</span>
                          <span style={{fontWeight:700}}>{bedNo}</span>
                          {source==="shifting"&&<RoomSourceTag src="shifting" title="Room from shifting record">🔄</RoomSourceTag>}
                          {source==="room_details"&&<RoomSourceTag src="room_details" title="Room from admission details">📋</RoomSourceTag>}
                        </span>
                      ) : <span style={{color:"#9ca3af",fontSize:".72rem"}}>—</span>}
                    </Td>
                    <Td>
                      {totalCount>0 ? (
                        <RoomHistBtn onClick={()=>setHistoryAdm(adm)}>
                          🏨 {totalCount} entr{totalCount>1?"ies":"y"}
                          {shCount>0&&<span style={{marginLeft:4,opacity:.7}}>({rdCount}+{shCount})</span>}
                        </RoomHistBtn>
                      ) : <span style={{color:"#9ca3af",fontSize:".72rem"}}>—</span>}
                    </Td>
                    <Td>
                      <AW><DotB onClick={e=>handleMenuToggle(adm.ipNumber,e)}>⋮</DotB></AW>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Tbl>
        </TWrap>

        <Pager>
          <span>Showing {filtered.length===0?0:(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)} of {filtered.length} entries</span>
          <div style={{display:"flex",gap:4}}>
            <PB onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Previous</PB>
            {Array.from({length:totalPages},(_,i)=>i+1).slice(Math.max(0,page-3),page+2).map(n=><PB key={n} active={n===page} onClick={()=>setPage(n)}>{n}</PB>)}
            <PB onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Next</PB>
          </div>
        </Pager>
      </Container>

      {/* ══ ACTION DROPDOWN ══ */}
{openMenu!==null&&(()=>{
         const adm = paginated.find(a=>a.ipNumber===openMenu);
         if (!adm) return null;
         const t = getAdmStatus(adm);
         const isAdmitted = t==="admitted";
         return (
           <Drop ref={menuRef} top={menuPos.top} left={menuPos.left}>
             <DI onClick={()=>{if(isAdmitted)openEditForm(adm);}} disabled={!isAdmitted}
               title={!isAdmitted?`Cannot edit — admission is ${t}`:"Edit admission"}>
               ✏️ Edit{!isAdmitted&&<span style={{fontSize:".62rem",color:"#9ca3af",marginLeft:"auto"}}>({t})</span>}
             </DI>
             <DI onClick={()=>{setOpenMenu(null);setHistoryAdm(adm);}}>🏨 Room History</DI>
             {/* ── Room Shifting ── */}
             <DI onClick={()=>{setOpenMenu(null); setShiftAdm(adm);}} disabled={!isAdmitted}
               title={!isAdmitted?`Cannot shift — admission is ${t}`:"Shift room"}>
               🔄 Room Shifting{!isAdmitted&&<span style={{fontSize:".62rem",color:"#9ca3af",marginLeft:"auto"}}>({t})</span>}
             </DI>
             {/* ── IP Advance ── */}
             <DI onClick={()=>{setOpenMenu(null); setIpAdvAdm(adm);}} disabled={!isAdmitted}
               title={!isAdmitted?`Cannot add advance — admission is ${t}`:"Add IP Advance"}>
               💳 IP Advance{!isAdmitted&&<span style={{fontSize:".62rem",color:"#9ca3af",marginLeft:"auto"}}>({t})</span>}
             </DI>
             <DI danger onClick={()=>{if(isAdmitted)handleCancel(adm);}} disabled={!isAdmitted}
               title={!isAdmitted?`Cannot cancel — admission is ${t}`:"Cancel admission"}>
               🗑️ Cancel Admission{!isAdmitted&&<span style={{fontSize:".62rem",color:"#fca5a5",marginLeft:"auto"}}>({t})</span>}
             </DI>
             <DI onClick={()=>handlePrint(adm)}>🖨️ Print Slip</DI>
           </Drop>
         );
       })()}

      {confirmModal&&<ConfirmModal {...confirmModal}/>}
      {infoModal&&<InfoModal {...infoModal}/>}

      {/* ── Reason Modal (cancel or edit) ── */}
      {reasonModal&&(
        <ReasonModal
          mode={reasonModal.mode}
          onCancel={()=>setReasonModal(null)}
          onConfirm={reason=>{
            if (reasonModal.mode==="cancel") handleCancelConfirmed(reasonModal.adm, reason);
            else handleEditConfirmed(reason);
          }}
        />
      )}

      {alreadyAdmInfo&&(
        <AlreadyAdmittedModal info={alreadyAdmInfo} onClose={()=>setAlreadyAdmInfo(null)}
          onEdit={info=>{const existing=admissions.find(a=>a.ipNumber===info.ipNumber);if(existing)openEditForm(existing);}}/>
      )}

      {historyAdm&&<RoomHistoryModal adm={historyAdm} onClose={()=>setHistoryAdm(null)}/>}

      {/* ══ ROOM SHIFTING MODAL ══ */}
      {shiftAdm&&(
        <ModalOverlay onClick={()=>setShiftAdm(null)}>
          <ShiftMC onClick={e=>e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🔄 Room Shifting — {shiftAdm.ipNumber}</ModalTitle>
              <CloseButton onClick={()=>setShiftAdm(null)}>×</CloseButton>
            </ModalHeader>
            <ShiftMB>
              {/*
                Pass the admission as `patient` prop so RoomShifting
                pre-fills UHID / IP and loads the admission automatically.
                onSaved triggers a refresh and closes the modal.
              */}
              <RoomShifting
                patient={{
                  uhid:     shiftAdm.uhid,
                  ipNumber: shiftAdm.ipNumber,
                  patient_details: {
                    uhid:     shiftAdm.uhid,
                    ipNumber: shiftAdm.ipNumber,
                  }
                }}
                onClose={()=>setShiftAdm(null)}
                onSaved={()=>{ setShiftAdm(null); fetchAdmissions(); }}
              />
            </ShiftMB>
</ShiftMC>
         </ModalOverlay>
       )}

       {/* ── IP ADVANCE MODAL ── */}
       {ipAdvAdm&&(
         <ModalOverlay onClick={()=>setIpAdvAdm(null)}>
           <ShiftMC onClick={e=>e.stopPropagation()}>
             <ModalHeader>
               <ModalTitle>💳 IP Advance — {ipAdvAdm.ipNumber}</ModalTitle>
               <CloseButton onClick={()=>setIpAdvAdm(null)}>×</CloseButton>
             </ModalHeader>
             <ShiftMB>
               {/*
                 Pass the admission as `patient` prop so IPAdvance
                 pre-fills UHID / IP and loads the admission automatically.
                 onSaved triggers a refresh and closes the modal.
               */}
               <IPAdvance
                 patient={{
                   uhid:     ipAdvAdm.uhid,
                   ipNumber: ipAdvAdm.ipNumber,
                   patient_details: {
                     uhid:     ipAdvAdm.uhid,
                     ipNumber: ipAdvAdm.ipNumber,
                   }
                 }}
                 onClose={()=>setIpAdvAdm(null)}
                 onSaved={()=>{ setIpAdvAdm(null); fetchAdmissions(); }}
               />
             </ShiftMB>
           </ShiftMC>
         </ModalOverlay>
       )}

       {/* ══ ROOM PICKER ══ */}
      {showRoom&&(
        <ModalOverlay onClick={()=>setShowRoom(false)}>
          <RMC onClick={e=>e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🏨 Select Room</ModalTitle>
              <CloseButton onClick={()=>setShowRoom(false)}>×</CloseButton>
            </ModalHeader>
            <RMB>
              <FBR>
                {[["room_number","Room Number","e.g. 101"],["block","Block","e.g. A"]].map(([k,lbl,ph])=>(
                  <FFR key={k}><FLR>{lbl}</FLR>
                    <FIR placeholder={ph} value={rFilter[k]} onChange={e=>setRFilter(p=>({...p,[k]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&fetchAllRooms()}/>
                  </FFR>
                ))}
                <FFR><FLR>Floor</FLR><FIR type="number" placeholder="e.g. 2" value={rFilter.floor} onChange={e=>setRFilter(p=>({...p,floor:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&fetchAllRooms()}/></FFR>
                <FBR2 onClick={()=>fetchAllRooms()}>Search</FBR2>
                <FBR2 clear onClick={()=>{setRFilter({room_number:"",block:"",floor:""});fetchAllRooms({room_number:"",block:"",floor:""});}}>Clear</FBR2>
              </FBR>
              <LBar>
                {[["#22c55e","Available"],["#eab308","Not Cleaned"],["#3b82f6","Partial"],["#9333ea","Reserved"],["#ef4444","Occupied"],["#9ca3af","Maintenance"]].map(([c,l])=>(
                  <LI key={l}><LD c={c}/>{l}</LI>
                ))}
              </LBar>
              {loadRooms ? (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:8}}>
                  {Array.from({length:12}).map((_,i)=><Skel key={i}/>)}
                </div>
              ) : Object.keys(grouped).length===0 ? <NR>No rooms found.</NR>
              : Object.entries(grouped).map(([block,floors],bIdx)=>(
                <BS2 key={block} i={bIdx}>
                  <BH2>🏢 Block {block}</BH2>
                  {Object.entries(floors).sort(([a],[b])=>Number(a)-Number(b)).map(([floor,rooms])=>(
                    <FG2 key={floor}>
                      <FL2>Floor {floor}</FL2>
                      <RG2>
                        {rooms.map(room=>{
                          const s = getRoomStatus(room.beds);
                          const bedSummary=(room.beds||[]).reduce((acc,b)=>{acc[b.status]=(acc[b.status]||0)+1;return acc;},{});
                          const tipLines=Object.entries(bedSummary).map(([st,cnt])=>`${cnt} ${st}`).join(" · ");
                          return (
                            <div key={room.room_number} style={{position:"relative"}}
                              onMouseEnter={e=>{const t=e.currentTarget.querySelector(".room-tip");if(t)t.style.display="block";}}
                              onMouseLeave={e=>{const t=e.currentTarget.querySelector(".room-tip");if(t)t.style.display="none";}}>
                              <RC s={s} noavail={!(room.beds||[]).some(b=>b.status==="Available")?1:0} onClick={()=>handleRoomClick(room)}>
                                <RCT s={s}><RNum>{room.room_number}</RNum><RSP s={s}>{s==="partial"?"Partial":s==="not-cleaned"?"Not Cleaned":s==="reserved"?"Reserved":s==="maintenance"?"Maintenance":s==="occupied"?"Occupied":"Available"}</RSP></RCT>
                                <RT2>{room.room_type}{room.room_category?` · ${room.room_category}`:""}</RT2>
                                <BRow>
                                  {(room.beds||[]).map((bed,i)=>(
                                    <BC key={i} bs={bed.status} disabled={bed.status!=="Available"}
                                      title={bed.status==="Available"?"✅ Ready":bed.status==="Occupied"?"🔴 Occupied":bed.status==="Available - Not Cleaned"?"🟡 Needs cleaning":bed.status==="Reserved"?"🟣 Reserved":bed.status==="Maintenance"?"🔧 Maintenance":"❓ Unknown"}
                                      onClick={e=>{if(bed.status==="Available"){e.stopPropagation();handleBedSelect(bed.bed_number,room);}}}>
                                      {bed.bed_number}
                                    </BC>
                                  ))}
                                </BRow>
                              </RC>
                              <div className="room-tip" style={{display:"none",position:"absolute",bottom:"calc(100% + 6px)",left:"50%",transform:"translateX(-50%)",background:"#1e293b",color:"#fff",fontSize:".65rem",fontWeight:500,borderRadius:5,padding:"5px 10px",whiteSpace:"nowrap",zIndex:10000,pointerEvents:"none",lineHeight:1.6,boxShadow:"0 4px 14px rgba(0,0,0,.28)"}}>
                                <div style={{fontWeight:700,marginBottom:2}}>Room {room.room_number}</div>
                                {tipLines&&<div>{tipLines}</div>}
                                {!(room.beds||[]).some(b=>b.status==="Available")&&<div style={{color:"#fca5a5",marginTop:2}}>No available beds</div>}
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

      {/* ══ BED FALLBACK ══ */}
      {showBed&&selRoom&&(
        <ModalOverlay onClick={()=>setShowBed(false)}>
          <ModalContainer onClick={e=>e.stopPropagation()} style={{maxWidth:420}}>
            <ModalHeader>
              <ModalTitle>Select Bed — Room {selRoom.room_number}</ModalTitle>
              <CloseButton onClick={()=>setShowBed(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{display:"flex",flexWrap:"wrap",gap:10,padding:12}}>
                {(selRoom.beds||[]).map((bed,i)=>{
                  const avail=bed.status==="Available";
                  return (
                    <BC key={i} bs={bed.status} disabled={!avail}
                      style={{minWidth:70,height:42,fontSize:".82rem",flex:"1 1 70px"}}
                      onClick={()=>avail&&handleBedSelect(bed.bed_number,selRoom)}>
                      {bed.bed_number}<br/><span style={{fontSize:".6rem",opacity:.85}}>{bed.status}</span>
                    </BC>
                  );
                })}
                {(!selRoom.beds||selRoom.beds.length===0)&&<NR>No beds configured.</NR>}
              </div>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* ══ PRINT SLIP ══ */}
      {printData&&(()=>{
        const {roomNo,bedNo}=getActiveRoom(printData);
        return (
          <ModalOverlay onClick={()=>setPrintData(null)}>
            <PMC onClick={e=>e.stopPropagation()}>
              <ModalHeader><ModalTitle>🖨️ Admission Slip</ModalTitle><CloseButton onClick={()=>setPrintData(null)}>×</CloseButton></ModalHeader>
              <PMB>
                <Slip>
                  <SR>
                    <SL>
                      <BarcodeSVG value={printData.ipNumber} width={240} height={64} showText/>
                      <SBold>{pName(printData)}</SBold>
                      <SLn>
                        {printData.dob ? `DOB: ${printData.dob}  ` : ""}
                        {printData.age ? `Age: ${printData.age}` : ""}
                        {printData.gender ? `  ${printData.gender}` : ""}
                      </SLn>
                      <SLn>{printData.permanent_address||""}</SLn>
                      <SLn>{[printData.area,printData.city,printData.state].filter(Boolean).join(", ")}</SLn>
                      <SLn>{printData.mobilePhone||""}</SLn>
                      <SLn>Admitted: Dr. {printData.admittingDoctorName||getDrName(printData.admittingDoctor)}</SLn>
                    </SL>
                    <SRt>
                      <SBig>IP NO: {printData.ipNumber||""}</SBig>
                      <SLn>{printData.insuranceCompanyName||""}</SLn>
                      <SLn>UHID : {printData.uhid||""}</SLn>
                      <SLn>DOA  : {printData.admissionDateTime?fmtDate(printData.admissionDateTime):"-"}</SLn>
                      <SLn>TIME : {printData.admissionDateTime?new Date(printData.admissionDateTime).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}):"-"}</SLn>
                      <SLn>Room : {roomNo} / {bedNo}</SLn>
                    </SRt>
                  </SR>
                </Slip>
                <PA><PBt sec onClick={()=>setPrintData(null)}>Close</PBt><PBt onClick={doPrint}>🖨️ Print</PBt></PA>
              </PMB>
            </PMC>
          </ModalOverlay>
        );
      })()}

    </PageWrapper>
  );
}