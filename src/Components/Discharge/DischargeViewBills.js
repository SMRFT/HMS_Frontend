import React, { useState, useEffect, useCallback } from "react";
import apiRequest from "../../Auth/apiRequest";
import styled, { keyframes } from "styled-components";

// ─── Design tokens (shared) ────────────────────────────────────────────────────
const T = {
  primary:   "#0f766e",
  primaryDk: "#0d5f58",
  primaryLt: "#ccfbf1",
  amber:     "#d97706",
  amberLt:   "#fef3c7",
  danger:    "#dc2626",
  dangerLt:  "#fee2e2",
  success:   "#16a34a",
  successLt: "#dcfce7",
  blue:      "#2563eb",
  blueLt:    "#dbeafe",
  border:    "#e2e8f0",
  bg:        "#f8fafc",
  surface:   "#ffffff",
  textMain:  "#0f172a",
  textMid:   "#475569",
  textMuted: "#94a3b8",
  radius:    "8px",
  shadow:    "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:  "0 4px 16px rgba(0,0,0,0.10)",
};

const spin = keyframes`to { transform: rotate(360deg); }`;
const fadeUp = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); }`;

// ─── Styled components ─────────────────────────────────────────────────────────
const Card = styled.div`
  background: ${T.surface}; border: 1px solid ${T.border};
  border-radius: ${T.radius}; box-shadow: ${T.shadow};
  overflow: hidden; animation: ${fadeUp} 0.2s ease;
`;
const TScrollWrap = styled.div`overflow-x: auto;`;
const LTable = styled.table`width: 100%; border-collapse: collapse; font-size: 0.8rem;`;
const LTH = styled.th`
  padding: 8px 10px; text-align: left; font-size: 0.65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.4px; color: ${T.textMuted};
  border-bottom: 2px solid ${T.border}; background: #f8fafc; white-space: nowrap;
`;
const LTR = styled.tr`
  border-bottom: 1px solid ${T.border};
  &:hover { background: #f8fbff; }
  &:last-child { border-bottom: none; }
`;
const LTD = styled.td`padding: 8px 10px; color: ${T.textMain}; vertical-align: middle;`;
const Mono = styled.span`font-family: 'Courier New', monospace; font-size: 0.78rem;`;

const DateBar = styled.div`
  display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap;
  padding: 10px 14px; background: #fafafa; border-bottom: 1px solid ${T.border};
`;
const FG = styled.div`
  display: flex; flex-direction: column; gap: 3px;
  min-width: ${p => p.$w || "150px"}; flex: ${p => p.$flex || "none"};
`;
const FL = styled.label`
  font-size: 0.66rem; font-weight: 700; color: ${T.textMuted};
  text-transform: uppercase; letter-spacing: 0.4px;
`;
const FInput = styled.input`
  height: 32px; padding: 0 10px; font-size: 0.82rem;
  border: 1px solid ${T.border}; border-radius: 6px; outline: none;
  background: #fff; color: ${T.textMain}; transition: border 0.12s;
  &:focus { border-color: ${T.primary}; box-shadow: 0 0 0 2px rgba(15,118,110,0.12); }
  &[type=date] { cursor: pointer; }
  &::placeholder { color: ${T.textMuted}; }
`;
const Btn = styled.button`
  height: ${p => p.$sm ? "28px" : "34px"};
  padding: 0 ${p => p.$sm ? "10px" : "16px"};
  border-radius: 6px; font-size: ${p => p.$sm ? "0.74rem" : "0.81rem"};
  font-weight: 600; cursor: pointer; border: 1.5px solid transparent;
  display: inline-flex; align-items: center; gap: 5px; transition: all 0.13s;
  ${p => p.$primary && `background:${T.primary}; color:#fff; border-color:${T.primary};`}
  ${p => p.$outline && `background:#fff; color:${T.primary}; border-color:${T.primary};`}
  ${p => p.$ghost   && `background:#f1f5f9; color:${T.textMid}; border-color:${T.border};`}
  ${p => p.$pag     && `background:${p.$active ? T.primary : "#fff"}; color:${p.$active ? "#fff" : T.textMid}; border-color:${p.$active ? T.primary : T.border}; min-width:32px; height:30px; padding:0 8px;`}
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;
const Badge = styled.span`
  display: inline-flex; align-items: center; padding: 2px 8px;
  border-radius: 20px; font-size: 0.66rem; font-weight: 700;
  background: ${p => ({ estimate: "#fef3c7", billed: "#dcfce7", pending: "#dbeafe" }[p.$v] || "#f1f5f9")};
  color:      ${p => ({ estimate: T.amber,   billed: T.success, pending: T.blue   }[p.$v] || T.textMuted)};
`;
const Spinner = styled.div`
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff; border-radius: 50%; animation: ${spin} 0.6s linear infinite;
`;
const NoResults = styled.div`text-align: center; padding: 36px; color: ${T.textMuted}; font-size: 0.84rem;`;
const LoadSpinner = styled.div`
  width: 16px; height: 16px;
  border: 2px solid ${T.primary}; border-top-color: transparent;
  border-radius: 50%; animation: ${spin} 0.6s linear infinite;
`;
const PaginationBar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; background: #fafafa; border-top: 1px solid ${T.border};
  flex-wrap: wrap; gap: 8px;
`;
const PaginationInfo = styled.span`font-size: 0.76rem; color: ${T.textMuted};`;
const PaginationBtns = styled.div`display: flex; gap: 4px; align-items: center;`;
const PerPageSelect = styled.select`
  height: 30px; padding: 0 8px; font-size: 0.78rem;
  border: 1px solid ${T.border}; border-radius: 6px; outline: none;
  background: #fff; color: ${T.textMain};
  &:focus { border-color: ${T.primary}; }
`;
const CardHead = styled.div`
  background: #f8fafc; border-bottom: 1px solid ${T.border};
  padding: 8px 14px; display: flex; align-items: center; justify-content: space-between;
`;
const CardTitle = styled.span`
  font-size: 0.69rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; color: ${T.textMuted};
`;

// Summary cards
const SummaryRow = styled.div`
  display: flex; gap: 10px; padding: 10px 14px; background: #f0fdf4;
  border-bottom: 1px solid ${T.border}; flex-wrap: wrap;
`;
const SummaryCard = styled.div`
  flex: 1; min-width: 120px; background: #fff; border: 1px solid ${T.border};
  border-radius: 8px; padding: 8px 12px;
`;
const SummaryLabel = styled.div`font-size: 0.62rem; font-weight: 700; color: ${T.textMuted}; text-transform: uppercase; letter-spacing: 0.4px;`;
const SummaryValue = styled.div`font-size: 0.9rem; font-weight: 700; color: ${p => p.$color || T.textMain}; margin-top: 2px;`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
const fmt  = v => (parseFloat(v) || 0).toFixed(2);
const fmtCurrency = v => `₹${Number(parseFloat(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().split("T")[0];

// ═════════════════════════════════════════════════════════════════════════════
// ViewBills Component
// ═════════════════════════════════════════════════════════════════════════════

const ViewBills = ({ onRefreshTrigger }) => {
  const [bills,    setBills]    = useState([]);
  const [listBusy, setListBusy] = useState(false);
  const [listErr,  setListErr]  = useState("");

  // Filters — both From and To default to today
  const [from, setFrom] = useState(today());
  const [to,   setTo]   = useState(today());
  const [q,    setQ]    = useState("");

  // Pagination
  const [page,    setPage]    = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchBills = useCallback(async () => {
    setListBusy(true);
    setListErr("");
    try {
      const res  = await apiRequest(`${BASE}discharge-billing/?status=Billed`, "GET");
      const list = res.success && res.data && Array.isArray(res.data.data) ? res.data.data : [];
      setBills(list);
    } catch {
      setListErr("Failed to load bills. Please try again.");
    } finally {
      setListBusy(false);
    }
  }, []);

  useEffect(() => { fetchBills(); }, [fetchBills, onRefreshTrigger]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [from, to, q]);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = bills.filter(b => {
    if (from && b.bill_date && new Date(b.bill_date) < new Date(from)) return false;
    if (to   && b.bill_date && new Date(b.bill_date) > new Date(to + "T23:59:59")) return false;
    if (q) {
      const lq = q.toLowerCase();
      const pd = b.patient_details || {};
      return [b.bill_no || "", b.uhid || "", b.ip_number || "", pd.patient_name || ""]
        .some(v => v.toLowerCase().includes(lq));
    }
    return true;
  });

  // ── Summary totals (from filtered set) ────────────────────────────────────
  const summary = filtered.reduce((acc, b) => ({
    total:    acc.total    + (parseFloat(b.total_amount)  || 0),
    advance:  acc.advance  + (parseFloat(b.advance_amount)|| 0),
    discount: acc.discount + (parseFloat(b.total_disc)    || 0),
    net:      acc.net      + (parseFloat(b.net_amount)    || 0),
    gst:      acc.gst      + (parseFloat(b.gst_amount)    || 0),
  }), { total: 0, advance: 0, discount: 0, net: 0, gst: 0 });

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const pageStart  = (safePage - 1) * perPage;
  const paginated  = filtered.slice(pageStart, pageStart + perPage);

  const goPage = p => setPage(Math.max(1, Math.min(p, totalPages)));

  const pageButtons = () => {
    const pages = [];
    const delta = 2;
    const left  = Math.max(1, safePage - delta);
    const right = Math.min(totalPages, safePage + delta);
    if (left > 1)          { pages.push(1); if (left > 2) pages.push("..."); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages){ if (right < totalPages - 1) pages.push("..."); pages.push(totalPages); }
    return pages;
  };

  return (
    <Card>
      {/* Header */}
      <CardHead>
        <CardTitle>
          ✅ Final Bills
          {bills.length > 0 && (
            <Badge $v="billed" style={{ marginLeft: 8 }}>{bills.length}</Badge>
          )}
        </CardTitle>
        <span style={{ fontSize: "0.72rem", color: T.textMuted }}>
          Showing {filtered.length} of {bills.length} records
        </span>
      </CardHead>

      {/* Filter bar */}
      <DateBar>
        <FG $w="135px">
          <FL>From</FL>
          <FInput type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </FG>
        <FG $w="135px">
          <FL>To</FL>
          <FInput type="date" value={to} onChange={e => setTo(e.target.value)} />
        </FG>
        <FG $flex="1" style={{ minWidth: 210 }}>
          <FL>Search</FL>
          <FInput
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Name, UHID, IP, Bill No…"
          />
        </FG>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn $ghost $sm onClick={() => { setFrom(today()); setTo(today()); setQ(""); }}>
            ↺ Reset
          </Btn>
          <Btn $outline onClick={fetchBills} disabled={listBusy}>
            {listBusy ? <Spinner /> : "↻"} Refresh
          </Btn>
        </div>
      </DateBar>

      {/* Error */}
      {listErr && (
        <div style={{ color: T.danger, fontSize: "0.76rem", padding: "8px 14px", background: "#fee2e2", borderBottom: `1px solid #fecaca` }}>
          ⚠ {listErr}
        </div>
      )}

      {/* Summary row — only shown when filtered has data */}
      {filtered.length > 0 && (
        <SummaryRow>
          <SummaryCard>
            <SummaryLabel>Total Amount</SummaryLabel>
            <SummaryValue>{fmtCurrency(summary.total)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Total Advance</SummaryLabel>
            <SummaryValue $color={T.danger}>{fmtCurrency(summary.advance)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Total Discount</SummaryLabel>
            <SummaryValue $color={T.danger}>{fmtCurrency(summary.discount)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Total GST</SummaryLabel>
            <SummaryValue $color={T.blue}>{fmtCurrency(summary.gst)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Net Collected</SummaryLabel>
            <SummaryValue $color={T.success}>{fmtCurrency(summary.net)}</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>Bill Count</SummaryLabel>
            <SummaryValue $color={T.primary}>{filtered.length}</SummaryValue>
          </SummaryCard>
        </SummaryRow>
      )}

      {/* Table */}
      <TScrollWrap>
        <LTable>
          <thead>
            <tr>
              <LTH style={{ width: 42 }}>#</LTH>
              <LTH>Bill No.</LTH>
              <LTH>Estimate No.</LTH>
              <LTH>UHID / IP</LTH>
              <LTH>Patient</LTH>
              <LTH>Total</LTH>
              <LTH>Advance</LTH>
              <LTH>Discount</LTH>
              <LTH>GST</LTH>
              <LTH>Net Amount</LTH>
              <LTH>Bill Date</LTH>
              <LTH>Status</LTH>
            </tr>
          </thead>
          <tbody>
            {listBusy ? (
              <tr>
                <td colSpan={12}>
                  <NoResults>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <LoadSpinner />
                      Loading bills…
                    </div>
                  </NoResults>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={12}>
                  <NoResults>
                    {filtered.length === 0 && bills.length > 0
                      ? "No bills match your filters."
                      : "No bills found."}
                  </NoResults>
                </td>
              </tr>
            ) : paginated.map((b, i) => {
              const pd = b.patient_details || {};
              return (
                <LTR key={b.id}>
                  <LTD style={{ color: T.textMuted, fontWeight: 600, fontSize: "0.74rem" }}>
                    {pageStart + i + 1}
                  </LTD>
                  <LTD>
                    <Mono style={{ color: T.primary, fontWeight: 700 }}>{b.bill_no}</Mono>
                  </LTD>
                  <LTD>
                    <Mono style={{ fontSize: "0.73rem", color: T.textMuted }}>
                      {b.estimate_number || "—"}
                    </Mono>
                  </LTD>
                  <LTD style={{ fontSize: "0.77rem" }}>
                    {b.uhid || "—"} / {b.ip_number || "—"}
                  </LTD>
                  <LTD style={{ fontWeight: 600 }}>{pd.patient_name || "—"}</LTD>
                  <LTD>₹{fmt(b.total_amount)}</LTD>
                  <LTD style={{ color: T.danger }}>₹{fmt(b.advance_amount)}</LTD>
                  <LTD style={{ color: T.danger }}>₹{fmt(b.total_disc)}</LTD>
                  <LTD style={{ color: T.blue }}>₹{fmt(b.gst_amount)}</LTD>
                  <LTD style={{ fontWeight: 700, color: T.success }}>₹{fmt(b.net_amount)}</LTD>
                  <LTD style={{ fontSize: "0.77rem" }}>
                    {b.bill_date ? new Date(b.bill_date).toLocaleDateString("en-IN") : "—"}
                  </LTD>
                  <LTD><Badge $v="billed">Billed</Badge></LTD>
                </LTR>
              );
            })}
          </tbody>
        </LTable>
      </TScrollWrap>

      {/* Pagination */}
      {filtered.length > 0 && (
        <PaginationBar>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PaginationInfo>
              Showing {pageStart + 1}–{Math.min(pageStart + perPage, filtered.length)} of {filtered.length}
            </PaginationInfo>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.72rem", color: T.textMuted }}>Per page:</span>
              <PerPageSelect
                value={perPage}
                onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              >
                {[10, 25, 50, 100].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </PerPageSelect>
            </div>
          </div>
          <PaginationBtns>
            <Btn $pag onClick={() => goPage(1)}            disabled={safePage === 1}>«</Btn>
            <Btn $pag onClick={() => goPage(safePage - 1)} disabled={safePage === 1}>‹</Btn>
            {pageButtons().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: T.textMuted, fontSize: "0.8rem" }}>…</span>
              ) : (
                <Btn $pag $active={p === safePage} key={p} onClick={() => goPage(p)}>{p}</Btn>
              )
            )}
            <Btn $pag onClick={() => goPage(safePage + 1)} disabled={safePage === totalPages}>›</Btn>
            <Btn $pag onClick={() => goPage(totalPages)}   disabled={safePage === totalPages}>»</Btn>
          </PaginationBtns>
        </PaginationBar>
      )}
    </Card>
  );
};

export default ViewBills;