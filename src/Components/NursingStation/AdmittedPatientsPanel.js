import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";

const T = {
  primary:   "#0f766e",
  primaryLt: "#f0fdfa",
  teal:      "#0d9488",
  border:    "#e2e8f0",
  bgLight:   "#f8fafc",
  textMain:  "#0f172a",
  textMid:   "#475569",
  textMuted: "#94a3b8",
  success:   "#10b981",
  danger:    "#ef4444",
};

const spin = keyframes`to { transform: rotate(360deg); }`;

const SearchSectionWrap = styled.div`
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const TopSearchRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const FG = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  min-width: 0;
`;

const FL = styled.label`
  font-size: 0.68rem;
  font-weight: 700;
  color: ${T.textMid};
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
`;

const SearchInputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const FInput = styled.input`
  height: 36px;
  padding: 0 40px 0 11px;
  font-size: 0.84rem;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  border: 1px solid ${T.border};
  border-radius: 6px;
  outline: none;
  background: #fff;
  color: ${T.textMain};
  transition: border 0.12s, box-shadow 0.12s;
  &:focus {
    border-color: ${T.primary};
    box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.12);
  }
  &::placeholder {
    color: ${T.textMuted};
  }
`;

const SearchActionBtn = styled.button`
  position: absolute;
  right: 4px;
  top: 4px;
  bottom: 4px;
  width: 32px;
  border-radius: 5px;
  border: none;
  background: ${T.primary};
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  transition: all 0.15s ease;
  &:hover { background: ${T.teal}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const MiniSpinner = styled.div`
  width: 11px;
  height: 11px;
  border: 2px solid #cbd5e1;
  border-top-color: ${T.primary};
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
  display: inline-block;
`;

const PatientProfileCard = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f0fdfa 100%);
  border: 1px solid #ccfbf1;
  border-radius: 10px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(15, 118, 110, 0.04);
  min-width: 0;
  box-sizing: border-box;
`;

const PatientAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
  color: #fff;
  font-weight: 800;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(15, 118, 110, 0.25);
`;

const PatientMainInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 220px;
  flex: 1;
`;

const PatientNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const PatientNameText = styled.span`
  font-size: 1.02rem;
  font-weight: 800;
  color: ${T.textMain};
  letter-spacing: -0.2px;
`;

const PatientMetaPills = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.76rem;
  color: ${T.textMid};
  flex-wrap: wrap;
`;

const MetaChip = styled.span`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 2px 8px;
  border-radius: 5px;
  font-family: ${p => p.$mono ? "monospace" : "inherit"};
  font-size: 0.74rem;
  font-weight: 600;
  color: ${T.textMain};
`;

const PatientMetrics2Col = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const MetricBox = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 7px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const MetricLabel = styled.div`
  font-size: 0.62rem;
  font-weight: 700;
  color: ${T.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
`;

const MetricVal = styled.div`
  font-size: 0.81rem;
  font-weight: 700;
  color: ${T.textMain};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const PatientEmptyState = styled.div`
  padding: 22px 18px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
  color: ${T.textMid};
  font-size: 0.83rem;
  font-weight: 500;
`;

const getInitials = (name = "") => {
  const parts = String(name)
    .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Baby|Master)\s+/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "P";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const AdmittedPatientSummaryCard = ({
  uhid,
  onUhidChange,
  onUhidSearch,
  onUhidEnter,
  ipNumber,
  onIpChange,
  onIpSearch,
  onIpEnter,
  searching = false,
  onReset,
  patient = null,
  onBrowseAdmitted,
  admittedCount = 0,
}) => {
  return (
    <SearchSectionWrap>
      <TopSearchRow>
        <FG>
          <FL>UHID *</FL>
          <SearchInputWrap>
            <FInput
              value={uhid || ""}
              onChange={(e) => onUhidChange(e.target.value)}
              placeholder="Enter UHID (e.g. S026/006474) or press 🔍"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (onUhidEnter || onUhidSearch)();
                }
              }}
            />
            <SearchActionBtn
              type="button"
              onClick={onUhidSearch}
              disabled={searching}
              title="Search by UHID"
            >
              {searching ? <MiniSpinner /> : "🔍"}
            </SearchActionBtn>
          </SearchInputWrap>
        </FG>

        <FG>
          <FL>IP Number *</FL>
          <SearchInputWrap>
            <FInput
              value={ipNumber || ""}
              onChange={(e) => onIpChange(e.target.value)}
              placeholder="Enter IP Number (e.g. S026/500226) or press 🔍"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (onIpEnter || onIpSearch)();
                }
              }}
            />
            <SearchActionBtn
              type="button"
              onClick={onIpSearch}
              disabled={searching}
              title="Search by IP Number"
            >
              {searching ? <MiniSpinner /> : "🔍"}
            </SearchActionBtn>
          </SearchInputWrap>
        </FG>
      </TopSearchRow>

      {patient ? (
        <PatientProfileCard>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
              <PatientAvatar>{getInitials(patient.name)}</PatientAvatar>
              <PatientMainInfo>
                <PatientNameRow>
                  <PatientNameText>{patient.name || "—"}</PatientNameText>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: T.textMid }}>
                    {patient.age || "—"} {patient.ageType || "Y"} / {patient.gender || "—"}
                  </span>
                  {patient.ipSerial && (
                    <span style={{
                      background: "#dcfce7",
                      color: "#15803d",
                      border: "1px solid #bbf7d0",
                      borderRadius: 999,
                      padding: "1px 8px",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                    }}>
                      IP Serial #{patient.ipSerial}
                    </span>
                  )}
                </PatientNameRow>
                <PatientMetaPills>
                  <MetaChip $mono>UHID: {patient.uhid || "—"}</MetaChip>
                  <MetaChip $mono>IP: {patient.ipNumber || "—"}</MetaChip>
                  {patient.mobile && <span>📞 {patient.mobile}</span>}
                  {patient.address && (
                    <span title={patient.address} style={{ maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      📍 {patient.address}
                    </span>
                  )}
                </PatientMetaPills>
              </PatientMainInfo>
            </div>

            {onReset && (
              <button
                type="button"
                onClick={onReset}
                style={{
                  background: "#fff",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  padding: "5px 11px",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ↺ Clear Patient
              </button>
            )}
          </div>

          <PatientMetrics2Col>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <MetricBox>
                <MetricLabel>👨‍⚕️ Attending Doctor</MetricLabel>
                <MetricVal title={patient.doctor}>{patient.doctor || "—"}</MetricVal>
              </MetricBox>
              <MetricBox>
                <MetricLabel>📅 Admission Date</MetricLabel>
                <MetricVal>{patient.admissionDate || "—"}</MetricVal>
              </MetricBox>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <MetricBox>
                <MetricLabel>🛏️ Room &amp; Stay</MetricLabel>
                <MetricVal>
                  {patient.roomNo
                    ? `Room ${patient.roomNo}${patient.bedNo ? ` · Bed ${patient.bedNo}` : ""}`
                    : "—"}
                  {patient.totalDays ? ` · ${patient.totalDays} Days` : ""}
                </MetricVal>
              </MetricBox>
              <MetricBox>
                <MetricLabel>🏢 Billing Type</MetricLabel>
                <MetricVal
                  style={{ color: T.primary, textTransform: "uppercase" }}
                  title={patient.company || patient.customerType}
                >
                  {patient.customerType || "General"}
                  {patient.company ? ` / ${patient.company}` : ""}
                </MetricVal>
              </MetricBox>
            </div>
          </PatientMetrics2Col>
        </PatientProfileCard>
      ) : (
        <PatientEmptyState>
          <span>
            🔍 Search by <strong>UHID</strong> or <strong>IP Number</strong> above to load patient details, or pick directly from{" "}
            <strong>Admitted Patients</strong>.
          </span>
          {onBrowseAdmitted && (
            <button
              type="button"
              onClick={onBrowseAdmitted}
              style={{
                background: "#f0fdfa",
                color: T.primary,
                border: "1px solid #99f6e4",
                borderRadius: 6,
                padding: "5px 14px",
                fontSize: "0.76rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🏥 Browse Admitted Patients ({admittedCount}) →
            </button>
          )}
        </PatientEmptyState>
      )}
    </SearchSectionWrap>
  );
};

// ── Admitted Patients Quick-Access List Styles (matches Discharge Requests) ───
const TTBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid ${T.border};
  background: #f8fafc;
`;

const TableSelect = styled.select`
  padding: 4px 8px;
  border: 1px solid ${T.border};
  border-radius: 5px;
  font-size: 0.78rem;
  color: ${T.textMain};
  background: #fff;
  cursor: pointer;
`;

const TWrap = styled.div`
  overflow-x: auto;
  width: 100%;
`;

const Tbl = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: ${T.bgLight};
  border-bottom: 2px solid ${T.border};
`;

const Th = styled.th`
  padding: 10px 14px;
  font-size: 0.72rem;
  font-weight: 700;
  color: ${T.textMid};
  text-transform: uppercase;
  letter-spacing: 0.4px;
  text-align: ${p => p.$right ? "right" : "left"};
  white-space: nowrap;
`;

const SortTh = styled.th`
  padding: 10px 14px;
  font-size: 0.72rem;
  font-weight: 700;
  color: ${T.textMid};
  text-transform: uppercase;
  letter-spacing: 0.4px;
  text-align: ${p => p.$right ? "right" : "left"};
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  &:hover {
    color: ${T.primary};
    background: #eef2f7;
  }
`;

const Tr = styled.tr`
  border-bottom: 1px solid ${T.border};
  &:nth-child(even) { background: #fbfcfd; }
  &:hover { background: #f0fdfa; }
  cursor: pointer;
`;

const Td = styled.td`
  padding: 10px 14px;
  font-size: 0.81rem;
  color: ${T.textMain};
  text-align: ${p => p.$right ? "right" : "left"};
  vertical-align: middle;
`;

const ConvertActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #16a34a;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: #16a34a;
    color: #fff;
    border-color: #16a34a;
  }
`;

const Pager = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid ${T.border};
  background: #fff;
`;

const PB = styled.button`
  padding: 4px 10px;
  border-radius: 5px;
  border: 1px solid ${p => p.$a ? T.primary : T.border};
  background: ${p => p.$a ? T.primary : "#fff"};
  color: ${p => p.$a ? "#fff" : T.textMid};
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  &:hover:not(:disabled) {
    border-color: ${T.primary};
    color: ${p => p.$a ? "#fff" : T.primary};
  }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const PanelCard = styled.div`
  background: #ffffff;
  border: 1px solid ${T.border};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const getISTTodayDate = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export const AdmittedPatientsPanel = ({
  baseUrl,
  onSelectPatient,
  onCountChange,
  refreshKey = 0,
  actionTitle = "Select patient",
}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState("all"); // default all currently admitted
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("admissionDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchAdmitted = useCallback(async (dateOverride) => {
    setLoading(true);
    try {
      const targetDate = dateOverride !== undefined ? dateOverride : filterDate;
      const qs = new URLSearchParams({ date: targetDate || "all" }).toString();
      const res = await apiRequest(`${baseUrl}admitted-patients/?${qs}`, "GET");
      if (res.success && Array.isArray(res.data?.data)) {
        const list = res.data.data;
        setRows(list);
        if (onCountChange) onCountChange(list.length);
      } else {
        setRows([]);
        if (onCountChange) onCountChange(0);
        if (!res.success && res.error) toast.error(res.error);
      }
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, filterDate, onCountChange]);

  useEffect(() => {
    fetchAdmitted();
  }, [fetchAdmitted, refreshKey]);

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(o => o === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  };

  const filtered = useMemo(() => {
    let list = [...rows];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(r =>
        (r.uhid || "").toLowerCase().includes(q) ||
        (r.ipNumber || "").toLowerCase().includes(q) ||
        (r.patientName || "").toLowerCase().includes(q) ||
        (r.doctor || "").toLowerCase().includes(q) ||
        (r.roomNo || "").toLowerCase().includes(q) ||
        (r.mobile || "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const va = String(a[sortBy] || "").toLowerCase();
      const vb = String(b[sortBy] || "").toLowerCase();
      if (va < vb) return sortOrder === "asc" ? -1 : 1;
      if (va > vb) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [rows, search, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, safePage, perPage]);

  const sortArrow = (col) =>
    sortBy === col ? (sortOrder === "asc" ? " ▲" : " ▼") : " ⇅";

  return (
    <PanelCard>
      <TTBar>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: "0.78rem", color: T.textMid }}>
          <span>Show up to</span>
          <TableSelect
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
          >
            {[10, 25, 50, 100].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </TableSelect>

          <span style={{ marginLeft: 4 }}>Admission Date:</span>
          <input
            type="date"
            value={filterDate === "all" ? "" : filterDate}
            onChange={(e) => {
              const val = e.target.value || "all";
              setFilterDate(val);
              setPage(1);
            }}
            style={{
              height: 30,
              padding: "0 8px",
              fontSize: "0.78rem",
              border: "1px solid #cbd5e1",
              borderRadius: 5,
              outline: "none",
              color: T.textMain,
              background: "#fff",
            }}
          />
          <button
            type="button"
            onClick={() => { setFilterDate(getISTTodayDate()); setPage(1); }}
            style={{
              height: 30,
              padding: "0 10px",
              fontSize: "0.74rem",
              fontWeight: 700,
              border: `1px solid ${filterDate === getISTTodayDate() ? T.primary : "#cbd5e1"}`,
              borderRadius: 5,
              background: filterDate === getISTTodayDate() ? T.primary : "#fff",
              color: filterDate === getISTTodayDate() ? "#fff" : T.textMain,
              cursor: "pointer",
            }}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => { setFilterDate("all"); setPage(1); }}
            style={{
              height: 30,
              padding: "0 10px",
              fontSize: "0.74rem",
              fontWeight: 700,
              border: `1px solid ${filterDate === "all" ? T.primary : "#cbd5e1"}`,
              borderRadius: 5,
              background: filterDate === "all" ? T.primary : "#fff",
              color: filterDate === "all" ? "#fff" : T.textMain,
              cursor: "pointer",
            }}
          >
            All Dates
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: T.textMid }}>
          <span>Search:</span>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search UHID / IP / Patient Name / Doctor / Room..."
              style={{
                width: 280,
                height: 30,
                padding: "0 26px 0 9px",
                fontSize: "0.78rem",
                border: "1px solid #cbd5e1",
                borderRadius: 5,
                outline: "none",
                background: "#fff",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); setPage(1); }}
                style={{
                  position: "absolute",
                  right: 6,
                  background: "none",
                  border: "none",
                  color: "#dc2626",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontSize: "0.78rem",
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => fetchAdmitted()}
            disabled={loading}
            style={{
              height: 30,
              padding: "0 10px",
              border: "1px solid #cbd5e1",
              borderRadius: 5,
              background: "#fff",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
            title="Refresh Admitted Patients"
          >
            {loading ? "⏳" : "🔄"}
          </button>
        </div>
      </TTBar>

      <TWrap>
        <Tbl>
          <Thead>
            <tr>
              <SortTh onClick={() => handleSort("uhid")}>UHID{sortArrow("uhid")}</SortTh>
              <SortTh onClick={() => handleSort("patientName")}>PATIENT NAME{sortArrow("patientName")}</SortTh>
              <SortTh onClick={() => handleSort("doctor")}>DOCTOR{sortArrow("doctor")}</SortTh>
              <Th $right style={{ width: 90 }}>ACTIONS</Th>
            </tr>
          </Thead>
          <tbody>
            {loading ? (
              <tr>
                <Td colSpan={4} style={{ textAlign: "center", padding: 36, color: T.textMuted }}>
                  Loading admitted patients…
                </Td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <Td colSpan={4} style={{ textAlign: "center", padding: 36, color: T.textMuted }}>
                  No currently admitted patients found.
                </Td>
              </tr>
            ) : (
              paginated.map((row) => (
                <Tr
                  key={row.ipNumber || row.uhid}
                  onClick={() => onSelectPatient && onSelectPatient(row)}
                  title={actionTitle}
                >
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ color: "#0f766e", fontWeight: 700, fontFamily: "monospace", fontSize: "0.82rem" }}>
                        {row.uhid}
                      </span>
                      {row.ipNumber && (
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          background: "#dcfce7",
                          color: "#15803d",
                          borderRadius: 999,
                          fontSize: "0.69rem",
                          fontWeight: 700,
                          border: "1px solid #bbf7d0",
                        }}>
                          Admitted (IP: {row.ipNumber})
                        </span>
                      )}
                      {row.roomNo && (
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          borderRadius: 999,
                          fontSize: "0.69rem",
                          fontWeight: 700,
                          border: "1px solid #bfdbfe",
                        }}>
                          🛏️ Room {row.roomNo}{row.bedNo ? ` · ${row.bedNo}` : ""}
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, color: T.textMain }}>{row.patientName}</span>
                      {(row.age || row.gender) && (
                        <span style={{ fontSize: "0.74rem", color: T.textMid }}>
                          ({row.age} {row.age_type || "Y"}{row.gender ? `, ${row.gender}` : ""})
                        </span>
                      )}
                      {(row.admissionDateDisplay || row.admissionTime) && (
                        <span style={{ fontSize: "0.73rem", color: "#64748b" }}>
                          🕒 {row.admissionDateDisplay ? `${row.admissionDateDisplay} ` : ""}{row.admissionTime}
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600 }}>{row.doctor || "—"}</span>
                      {row.customerType && row.customerType.toLowerCase() !== "general" && (
                        <span style={{
                          fontSize: "0.67rem",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: 4,
                          background: "#fef3c7",
                          color: "#b45309",
                          border: "1px solid #fde68a",
                        }}>
                          {row.customerType}{row.company ? ` / ${row.company}` : ""}
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td $right>
                    <ConvertActionBtn
                      type="button"
                      title={actionTitle}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPatient && onSelectPatient(row);
                      }}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </ConvertActionBtn>
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Tbl>
      </TWrap>

      {filtered.length > 0 && (
        <Pager>
          <span style={{ fontSize: "0.76rem", color: T.textMid }}>
            Showing {(safePage - 1) * perPage + 1} to {Math.min(safePage * perPage, filtered.length)} of {filtered.length} admitted patients
          </span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <PB type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
              Previous
            </PB>
            <PB type="button" $a>{safePage} / {totalPages}</PB>
            <PB type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}>
              Next
            </PB>
          </div>
        </Pager>
      )}
    </PanelCard>
  );
};

export default AdmittedPatientsPanel;
