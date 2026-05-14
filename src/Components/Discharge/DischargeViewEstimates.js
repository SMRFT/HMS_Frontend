import React, { useState, useEffect, useCallback } from "react";
import apiRequest from "../../Auth/apiRequest";
import styled, { keyframes } from "styled-components";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  primary:   "#0f766e",
  amber:     "#d97706",
  danger:    "#dc2626",
  success:   "#16a34a",
  blue:      "#2563eb",
  border:    "#e2e8f0",
  bg:        "#f8fafc",
  surface:   "#ffffff",
  textMain:  "#0f172a",
  textMid:   "#475569",
  textMuted: "#94a3b8",
  radius:    "8px",
  shadow:    "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
};

const spin    = keyframes`to { transform: rotate(360deg); }`;
const fadeUp  = keyframes`from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); }`;

// ─── Styled components ──────────────────────────────────────────────────────────
const Card = styled.div`
  background:${T.surface}; border:1px solid ${T.border};
  border-radius:${T.radius}; box-shadow:${T.shadow};
  overflow:hidden; animation:${fadeUp} 0.2s ease;
`;
const CardHead = styled.div`
  background:#f8fafc; border-bottom:1px solid ${T.border};
  padding:8px 14px; display:flex; align-items:center; justify-content:space-between;
`;
const CardTitle = styled.span`
  font-size:0.69rem; font-weight:700; text-transform:uppercase;
  letter-spacing:0.5px; color:${T.textMuted};
`;
const TScrollWrap = styled.div`overflow-x:auto;`;
const LTable  = styled.table`width:100%; border-collapse:collapse; font-size:0.8rem;`;
const LTH     = styled.th`
  padding:8px 10px; text-align:left; font-size:0.65rem; font-weight:700;
  text-transform:uppercase; letter-spacing:0.4px; color:${T.textMuted};
  border-bottom:2px solid ${T.border}; background:#f8fafc; white-space:nowrap;
`;
const LTR = styled.tr`
  border-bottom:1px solid ${T.border};
  &:hover { background:#f8fbff; }
  &:last-child { border-bottom:none; }
`;
const LTD   = styled.td`padding:8px 10px; color:${T.textMain}; vertical-align:middle;`;
const Mono  = styled.span`font-family:'Courier New',monospace; font-size:0.78rem;`;
const Badge = styled.span`
  display:inline-flex; align-items:center; padding:2px 8px;
  border-radius:20px; font-size:0.66rem; font-weight:700;
  background:${p=>({estimate:"#fef3c7",billed:"#dcfce7",pending:"#dbeafe",manual:"#f1f5f9"}[p.$v]||"#f1f5f9")};
  color:${p=>({estimate:T.amber,billed:T.success,pending:T.blue,manual:T.textMuted}[p.$v]||T.textMuted)};
`;
const DateBar = styled.div`
  display:flex; align-items:flex-end; gap:10px; flex-wrap:wrap;
  padding:10px 14px; background:#fafafa; border-bottom:1px solid ${T.border};
`;
const FG = styled.div`
  display:flex; flex-direction:column; gap:3px;
  min-width:${p=>p.$w||"150px"}; flex:${p=>p.$flex||"none"};
`;
const FL = styled.label`
  font-size:0.66rem; font-weight:700; color:${T.textMuted};
  text-transform:uppercase; letter-spacing:0.4px;
`;
const FInput = styled.input`
  height:32px; padding:0 10px; font-size:0.82rem;
  border:1px solid ${T.border}; border-radius:6px; outline:none;
  background:#fff; color:${T.textMain}; transition:border 0.12s;
  &:focus { border-color:${T.primary}; box-shadow:0 0 0 2px rgba(15,118,110,0.12); }
  &[type=date] { cursor:pointer; }
  &::placeholder { color:${T.textMuted}; }
`;
const Btn = styled.button`
  height:${p=>p.$sm?"28px":"34px"};
  padding:0 ${p=>p.$sm?"10px":"16px"};
  border-radius:6px; font-size:${p=>p.$sm?"0.74rem":"0.81rem"};
  font-weight:600; cursor:pointer; border:1.5px solid transparent;
  display:inline-flex; align-items:center; gap:5px; transition:all 0.13s;
  ${p=>p.$amber   && `background:${T.amber};   color:#fff; border-color:${T.amber};`}
  ${p=>p.$outline && `background:#fff; color:${T.primary}; border-color:${T.primary};`}
  ${p=>p.$ghost   && `background:#f1f5f9; color:${T.textMid}; border-color:${T.border};`}
  ${p=>p.$pag     && `background:${p.$active?T.primary:"#fff"}; color:${p.$active?"#fff":T.textMid}; border-color:${p.$active?T.primary:T.border}; min-width:32px; height:30px; padding:0 8px;`}
  &:hover { opacity:0.88; }
  &:disabled { opacity:0.45; cursor:not-allowed; }
`;
const Spinner = styled.div`
  width:14px; height:14px; border:2px solid rgba(255,255,255,0.35);
  border-top-color:#fff; border-radius:50%; animation:${spin} 0.6s linear infinite;
`;
const LoadSpinner = styled.div`
  width:16px; height:16px;
  border:2px solid ${T.primary}; border-top-color:transparent;
  border-radius:50%; animation:${spin} 0.6s linear infinite;
`;
const NoResults = styled.div`text-align:center; padding:36px; color:${T.textMuted}; font-size:0.84rem;`;
const PaginationBar = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  padding:10px 14px; background:#fafafa; border-top:1px solid ${T.border};
  flex-wrap:wrap; gap:8px;
`;
const PaginationInfo  = styled.span`font-size:0.76rem; color:${T.textMuted};`;
const PaginationBtns  = styled.div`display:flex; gap:4px; align-items:center;`;
const PerPageSelect   = styled.select`
  height:30px; padding:0 8px; font-size:0.78rem;
  border:1px solid ${T.border}; border-radius:6px; outline:none;
  background:#fff; color:${T.textMain};
  &:focus { border-color:${T.primary}; }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const BASE     = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
const fmt      = v => (parseFloat(v)||0).toFixed(2);
const todayStr = () => new Date().toISOString().split("T")[0];

const parseItems = raw => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

const DischargeViewEstimates = ({ onEditConvert, onRefreshTrigger }) => {
  const [estimates, setEstimates] = useState([]);
  const [listBusy,  setListBusy]  = useState(false);
  const [listErr,   setListErr]   = useState("");

  // Filters — default to today
  const [from, setFrom] = useState(todayStr());
  const [to,   setTo]   = useState(todayStr());
  const [q,    setQ]    = useState("");

  // Pagination
  const [page,    setPage]    = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchEstimates = useCallback(async () => {
    setListBusy(true); setListErr("");
    try {
      const res  = await apiRequest(`${BASE}discharge-billing/?status=Estimate`, "GET");
      const list = res.success && res.data && Array.isArray(res.data.data) ? res.data.data : [];
      setEstimates(list);
    } catch {
      setListErr("Failed to load estimates. Please try again.");
    } finally { setListBusy(false); }
  }, []);

  useEffect(() => { fetchEstimates(); }, [fetchEstimates, onRefreshTrigger]);
  useEffect(() => { setPage(1); }, [from, to, q]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = estimates.filter(e => {
    if (from && e.bill_date && new Date(e.bill_date) < new Date(from))            return false;
    if (to   && e.bill_date && new Date(e.bill_date) > new Date(to+"T23:59:59")) return false;
    if (q) {
      const lq = q.toLowerCase();
      const pd = e.patient_details || {};
      return [e.estimate_number||"", e.uhid||"", e.ip_number||"", pd.patient_name||""]
        .some(v => v.toLowerCase().includes(lq));
    }
    return true;
  });

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const pageStart  = (safePage - 1) * perPage;
  const paginated  = filtered.slice(pageStart, pageStart + perPage);
  const goPage     = p => setPage(Math.max(1, Math.min(p, totalPages)));

  const pageButtons = () => {
    const pages = [], delta = 2;
    const left  = Math.max(1, safePage - delta);
    const right = Math.min(totalPages, safePage + delta);
    if (left  > 1)          { pages.push(1);          if (left  > 2)              pages.push("..."); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) { if (right < totalPages - 1) pages.push("..."); pages.push(totalPages); }
    return pages;
  };

  // ── Handle Edit/Convert click ──────────────────────────────────────────────
  // Calls parent handler which switches tab to "create" and pre-fills form
  const handleEditConvert = est => {
    if (onEditConvert) onEditConvert(est);
  };

  return (
    <Card>
      {/* Header */}
      <CardHead>
        <CardTitle>
          📋 Estimates
          {estimates.length > 0 && (
            <Badge $v="estimate" style={{marginLeft:8}}>{estimates.length}</Badge>
          )}
        </CardTitle>
        <span style={{fontSize:"0.72rem",color:T.textMuted}}>
          Showing {filtered.length} of {estimates.length} records
        </span>
      </CardHead>

      {/* Filter bar */}
      <DateBar>
        <FG $w="135px">
          <FL>From</FL>
          <FInput type="date" value={from} onChange={e=>setFrom(e.target.value)}/>
        </FG>
        <FG $w="135px">
          <FL>To</FL>
          <FInput type="date" value={to} onChange={e=>setTo(e.target.value)}/>
        </FG>
        <FG $flex="1" style={{minWidth:210}}>
          <FL>Search</FL>
          <FInput value={q} onChange={e=>setQ(e.target.value)} placeholder="Name, UHID, IP, Estimate No…"/>
        </FG>
        <div style={{display:"flex",gap:6}}>
          <Btn $ghost $sm onClick={()=>{setFrom(todayStr()); setTo(todayStr()); setQ("");}}>
            ↺ Reset
          </Btn>
          <Btn $outline onClick={fetchEstimates} disabled={listBusy}>
            {listBusy?<Spinner/>:"↻"} Refresh
          </Btn>
        </div>
      </DateBar>

      {/* Error */}
      {listErr && (
        <div style={{color:T.danger,fontSize:"0.76rem",padding:"8px 14px",background:"#fee2e2",borderBottom:"1px solid #fecaca"}}>
          ⚠ {listErr}
        </div>
      )}

      {/* Table */}
      <TScrollWrap>
        <LTable>
          <thead>
            <tr>
              <LTH style={{width:42}}>#</LTH>
              <LTH>Estimate No.</LTH>
              <LTH>UHID / IP</LTH>
              <LTH>Patient</LTH>
              <LTH>Items</LTH>
              <LTH>Total</LTH>
              <LTH>Discount</LTH>
              <LTH>Net Amount</LTH>
              <LTH>Date</LTH>
              <LTH>Status</LTH>
              <LTH>Action</LTH>
            </tr>
          </thead>
          <tbody>
            {listBusy ? (
              <tr><td colSpan={11}>
                <NoResults>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    <LoadSpinner/> Loading estimates…
                  </div>
                </NoResults>
              </td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={11}>
                <NoResults>
                  {filtered.length === 0 && estimates.length > 0
                    ? "No estimates match your filters."
                    : "No estimates found."}
                </NoResults>
              </td></tr>
            ) : paginated.map((e, i) => {
              const pd = e.patient_details || {};
              return (
                <LTR key={e.id}>
                  <LTD style={{color:T.textMuted,fontWeight:600,fontSize:"0.74rem"}}>{pageStart+i+1}</LTD>
                  <LTD><Mono>{e.estimate_number}</Mono></LTD>
                  <LTD style={{fontSize:"0.77rem"}}>{e.uhid||"—"} / {e.ip_number||"—"}</LTD>
                  <LTD style={{fontWeight:600}}>{pd.patient_name||"—"}</LTD>
                  <LTD style={{color:T.textMid}}>{parseItems(e.items).length}</LTD>
                  <LTD>₹{fmt(e.total_amount)}</LTD>
                  <LTD style={{color:T.danger}}>₹{fmt(e.total_disc)}</LTD>
                  <LTD style={{fontWeight:700}}>₹{fmt(e.net_amount)}</LTD>
                  <LTD style={{fontSize:"0.77rem"}}>
                    {e.bill_date ? new Date(e.bill_date).toLocaleDateString("en-IN") : "—"}
                  </LTD>
                  <LTD><Badge $v="estimate">Estimate</Badge></LTD>
                  <LTD>
                    <Btn $sm $amber onClick={()=>handleEditConvert(e)}>
                      ✏️ Edit / Convert
                    </Btn>
                  </LTD>
                </LTR>
              );
            })}
          </tbody>
        </LTable>
      </TScrollWrap>

      {/* Pagination */}
      {filtered.length > 0 && (
        <PaginationBar>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <PaginationInfo>
              Showing {pageStart+1}–{Math.min(pageStart+perPage, filtered.length)} of {filtered.length}
            </PaginationInfo>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:"0.72rem",color:T.textMuted}}>Per page:</span>
              <PerPageSelect value={perPage} onChange={e=>{setPerPage(Number(e.target.value)); setPage(1);}}>
                {[10,25,50,100].map(n=><option key={n} value={n}>{n}</option>)}
              </PerPageSelect>
            </div>
          </div>
          <PaginationBtns>
            <Btn $pag onClick={()=>goPage(1)}            disabled={safePage===1}>«</Btn>
            <Btn $pag onClick={()=>goPage(safePage-1)}   disabled={safePage===1}>‹</Btn>
            {pageButtons().map((p,i)=>
              p==="..." ? (
                <span key={`el-${i}`} style={{padding:"0 4px",color:T.textMuted,fontSize:"0.8rem"}}>…</span>
              ) : (
                <Btn $pag $active={p===safePage} key={p} onClick={()=>goPage(p)}>{p}</Btn>
              )
            )}
            <Btn $pag onClick={()=>goPage(safePage+1)}  disabled={safePage===totalPages}>›</Btn>
            <Btn $pag onClick={()=>goPage(totalPages)}   disabled={safePage===totalPages}>»</Btn>
          </PaginationBtns>
        </PaginationBar>
      )}
    </Card>
  );
};

export default DischargeViewEstimates;