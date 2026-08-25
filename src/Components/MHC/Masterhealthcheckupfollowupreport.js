import React, { useState, useCallback, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToday = () => new Date().toISOString().split("T")[0];

const fmt = (v) =>
  v != null && v !== ""
    ? parseFloat(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })
    : "—";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const spin = keyframes`to { transform: rotate(360deg); }`;

// ─── Styled Components ────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdfa 0%, #f8fafc 60%, #ecfdf5 100%);
  padding: 1.5rem 1rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const HeaderCard = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 60%, #065f46 100%);
  border-radius: 20px;
  padding: 1.4rem 2rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  box-shadow: 0 8px 32px rgba(13, 148, 136, 0.25);
  animation: ${fadeIn} 0.35s ease;
`;

const HeaderLeft  = styled.div`display: flex; align-items: center; gap: 1rem;`;
const HeaderIcon  = styled.div`font-size: 2.2rem;`;
const HeaderTitle = styled.h1`font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0;`;
const HeaderSub   = styled.p`font-size: 0.82rem; color: rgba(255,255,255,0.78); margin: 0.15rem 0 0;`;

const Badge = styled.span`
  background: rgba(255,255,255,0.18);
  color: #fff;
  border-radius: 20px;
  padding: 0.3rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 700;
  backdrop-filter: blur(4px);
`;

const FilterCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  animation: ${fadeIn} 0.4s ease;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 160px;
`;

const Label = styled.label`
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const DateInput = styled.input`
  padding: 0.52rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.88rem;
  font-family: inherit;
  color: #1e293b;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
    background: #fff;
  }
`;

const SearchInput = styled(DateInput)`min-width: 220px;`;

const Btn = styled.button`
  padding: 0.55rem 1.3rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const SearchBtn = styled(Btn)`
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: #fff;
  box-shadow: 0 4px 12px rgba(13,148,136,0.28);
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(13,148,136,0.38); }
`;

const QuickRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.85rem;
  align-items: center;
`;

const QuickLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-right: 0.25rem;
`;

const QuickBtn = styled(Btn)`
  background: ${p => p.active ? "#0d9488" : "#f1f5f9"};
  color: ${p => p.active ? "#fff" : "#475569"};
  border: 1.5px solid ${p => p.active ? "#0d9488" : "#e2e8f0"};
  padding: 0.45rem 1rem;
  font-size: 0.78rem;
  &:hover:not(:disabled) { background: ${p => p.active ? "#0f766e" : "#e2e8f0"}; }
`;

/* ── Stats ── */
const StatsRow = styled.div`
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
`;

const StatCard = styled.div`
  flex: 1;
  min-width: 140px;
  background: ${p => p.bg || "#fff"};
  border: 1.5px solid ${p => p.border || "#e2e8f0"};
  border-radius: 14px;
  padding: 0.85rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  animation: ${fadeIn} 0.45s ease;
`;

const StatNum = styled.div`
  font-size: 1.35rem;
  font-weight: 800;
  color: ${p => p.color || "#0f766e"};
`;

const StatLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/* ── Table ── */
const TableCard = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease;
`;

const TableScroll = styled.div`overflow-x: auto;`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
`;

const Th = styled.th`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: #fff;
  padding: 0.75rem 0.9rem;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

const Tr = styled.tr`
  &:nth-child(even) { background: #f8fafc; }
  &:hover { background: #f0fdfa; transition: background 0.15s; }
`;

const Td = styled.td`
  padding: 0.65rem 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  white-space: nowrap;
  vertical-align: middle;
`;

const TdBold = styled(Td)`font-weight: 700; color: #0f766e;`;

const DescriptionTag = styled.div`
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  color: #334155;
  white-space: pre-wrap;
  max-width: 280px;
  line-height: 1.3;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3.5rem 1rem;
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 600;
`;

const Spinner = styled.div`
  width: 36px; height: 36px;
  border: 3.5px solid #e2e8f0;
  border-top-color: #0d9488;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 3rem auto;
`;

const TableFooter = styled.div`
  padding: 0.85rem 1.25rem;
  border-top: 1.5px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function Masterhealthcheckupfollowupreport() {
  const [fromDate, setFromDate]       = useState(getToday);
  const [toDate, setToDate]           = useState(getToday);
  const [search, setSearch]           = useState("");
  const [rows, setRows]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [quickActive, setQuickActive] = useState("today");

  const fetchReport = useCallback(async (fd, td) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from_date: fd, to_date: td });
      const res = await apiRequest(`${Hmsbaseurl}mhc_report/?${params}`, "GET");
      if (res.success && Array.isArray(res.data)) {
        setRows(res.data);
      } else {
        setRows([]);
        toast.error(res.error || "Failed to load follow-up report");
      }
    } catch {
      toast.error("Network error fetching follow-up report");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(fromDate, toDate);
  }, []); // eslint-disable-line

  const applyQuick = (type) => {
    setQuickActive(type);
    const now = new Date();
    const iso = (d) => d.toISOString().split("T")[0];
    let fd, td;
    if (type === "today") {
      fd = td = getToday();
    } else if (type === "yesterday") {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      fd = td = iso(y);
    } else if (type === "week") {
      const w = new Date(now); w.setDate(w.getDate() - 6);
      fd = iso(w); td = getToday();
    } else if (type === "month") {
      const m = new Date(now); m.setDate(1);
      fd = iso(m); td = getToday();
    }
    setFromDate(fd); setToDate(td);
    fetchReport(fd, td);
  };

  const handleSearch = () => {
    setQuickActive("");
    fetchReport(fromDate, toDate);
  };

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (r.patient_name || "").toLowerCase().includes(q) ||
      (r.op_number    || "").toLowerCase().includes(q) ||
      (r.package      || "").toLowerCase().includes(q) ||
      (r.contact_number || "").includes(q) ||
      (r.description  || "").toLowerCase().includes(q) ||
      (r.follow_up    || "").includes(q)
    );
  });

  const totalPatientsWithDesc = filtered.filter(r => Boolean(r.description?.trim())).length;
  const totalFollowups        = filtered.filter(r => Boolean(r.follow_up?.trim())).length;
  const totalFees             = filtered.reduce((acc, r) => acc + (parseFloat(r.total_fees) || 0), 0);

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <PageWrapper>
      {/* Header */}
      <HeaderCard>
        <HeaderLeft>
          <HeaderIcon>📊</HeaderIcon>
          <div>
            <HeaderTitle>MHC Follow-up Report</HeaderTitle>
            <HeaderSub>Detailed report of patient follow-ups and description notes</HeaderSub>
          </div>
        </HeaderLeft>
        <Badge>📋 {filtered.length} Records</Badge>
      </HeaderCard>

      {/* Filter */}
      <FilterCard>
        <FilterRow>
          <FieldGroup>
            <Label>From Date</Label>
            <DateInput
              id="mhc-fur-from"
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setQuickActive(""); }}
            />
          </FieldGroup>

          <FieldGroup>
            <Label>To Date</Label>
            <DateInput
              id="mhc-fur-to"
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setQuickActive(""); }}
            />
          </FieldGroup>

          <FieldGroup>
            <Label>Search</Label>
            <SearchInput
              id="mhc-fur-search"
              type="text"
              placeholder="Name / OP / Package / Description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </FieldGroup>

          <SearchBtn onClick={handleSearch} disabled={loading}>
            {loading ? "⏳" : "🔍"} Search
          </SearchBtn>
        </FilterRow>

        <QuickRow>
          <QuickLabel>Quick:</QuickLabel>
          {[
            { key: "today",     label: "Today" },
            { key: "yesterday", label: "Yesterday" },
            { key: "week",      label: "Last 7 Days" },
            { key: "month",     label: "This Month" },
          ].map((q) => (
            <QuickBtn
              key={q.key}
              active={quickActive === q.key}
              onClick={() => applyQuick(q.key)}
              disabled={loading}
            >
              {q.label}
            </QuickBtn>
          ))}
        </QuickRow>
      </FilterCard>

      {/* Stats */}
      {!loading && (
        <StatsRow>
          <StatCard bg="#f0fdfa" border="#a7f3d0">
            <StatNum color="#0f766e">{filtered.length}</StatNum>
            <StatLabel>Total Patients</StatLabel>
          </StatCard>
          <StatCard bg="#eff6ff" border="#bfdbfe">
            <StatNum color="#1d4ed8">{totalFollowups}</StatNum>
            <StatLabel>Follow-ups Scheduled</StatLabel>
          </StatCard>
          <StatCard bg="#faf5ff" border="#e9d5ff">
            <StatNum color="#7c3aed">{totalPatientsWithDesc}</StatNum>
            <StatLabel>With Notes / Description</StatLabel>
          </StatCard>
          <StatCard bg="#ecfdf5" border="#6ee7b7">
            <StatNum color="#065f46">
              ₹ {totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </StatNum>
            <StatLabel>Total Fees</StatLabel>
          </StatCard>
        </StatsRow>
      )}

      {/* Table */}
      <TableCard>
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState>📭 No records found for the selected date range.</EmptyState>
        ) : (
          <>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Date</Th>
                    <Th>Patient Name</Th>
                    <Th>Age / Gender</Th>
                    <Th>Contact</Th>
                    <Th>OP Number</Th>
                    <Th>Package</Th>
                    <Th>Follow Up Date</Th>
                    <Th>Description / Notes</Th>
                    <Th>Total Fees (₹)</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <Tr key={r.id || r._id || i}>
                      <Td style={{ color: "#94a3b8", fontWeight: 600 }}>{i + 1}</Td>
                      <Td>{formatDate(r.created_date)}</Td>
                      <Td style={{ fontWeight: 700, color: "#1e293b" }}>{r.patient_name || "—"}</Td>
                      <Td>{r.age ? `${r.age} Yrs` : "—"} / {r.gender || "—"}</Td>
                      <Td>{r.contact_number || "—"}</Td>
                      <Td style={{ fontWeight: 600, color: "#0d9488" }}>{r.op_number || "—"}</Td>
                      <Td style={{ fontWeight: 700 }}>{r.package || "—"}</Td>
                      <Td style={{ color: "#0f766e", fontWeight: 700 }}>{r.follow_up || "—"}</Td>
                      <Td>
                        {r.description ? (
                          <DescriptionTag>{r.description}</DescriptionTag>
                        ) : (
                          <span style={{ color: "#94a3b8", fontStyle: "italic" }}>—</span>
                        )}
                      </Td>
                      <TdBold>₹ {fmt(r.total_fees)}</TdBold>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
            <TableFooter>
              <span>Showing {filtered.length} of {rows.length} records</span>
              <span style={{ color: "#0f766e", fontWeight: 800 }}>
                Total Revenue: ₹ {totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </TableFooter>
          </>
        )}
      </TableCard>
    </PageWrapper>
  );
}
