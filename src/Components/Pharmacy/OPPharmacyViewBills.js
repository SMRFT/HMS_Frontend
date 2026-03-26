import React, { useState, useEffect, useCallback } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Global ────────────────────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #f0f4f8;
    color: #2d3748;
    font-size: 13px;
  }
`;

// ─── Animations ────────────────────────────────────────────────────────────────
const fadeIn = keyframes`from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; }`;
const spin    = keyframes`to { transform:rotate(360deg); }`;

// ─── Layout ────────────────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  padding: 18px 24px;
  min-height: 100vh;
  background: #f0f4f8;
`;

const PageTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 14px;
  letter-spacing: 0.3px;
`;

// ─── Filter Bar ────────────────────────────────────────────────────────────────
const FilterCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const Select = styled.select`
  height: 34px;
  border: 1px solid #cbd5e0;
  border-radius: 5px;
  padding: 0 28px 0 9px;
  font-size: 13px;
  color: #2d3748;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23718096'/%3E%3C/svg%3E") no-repeat right 9px center;
  appearance: none;
  cursor: pointer;
  outline: none;
  &:focus { border-color:#3182ce; box-shadow:0 0 0 2px rgba(49,130,206,0.15); }
`;

const Input = styled.input`
  height: 34px;
  border: 1px solid #cbd5e0;
  border-radius: 5px;
  padding: 0 9px;
  font-size: 13px;
  color: #2d3748;
  outline: none;
  &:focus { border-color:#3182ce; box-shadow:0 0 0 2px rgba(49,130,206,0.15); }
`;

const SearchBtn = styled.button`
  height: 34px;
  padding: 0 20px;
  background: #2b6cb0;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.18s;
  &:hover  { background: #2c5282; }
  &:active { background: #1a365d; }
`;

// ─── Table Card ────────────────────────────────────────────────────────────────
const TableCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease;
`;

const TableToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 8px;
`;

const ShowEntries = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #4a5568;
  select { width: 64px; }
`;

const SelectedBadge = styled.div`
  background: #ebf8ff;
  border: 1px solid #bee3f8;
  color: #2b6cb0;
  font-size: 12px;
  font-weight: 600;
  border-radius: 5px;
  padding: 4px 12px;
`;

const TableSearch = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #4a5568;
  input { width: 180px; }
`;

const TableWrapper = styled.div`overflow-x: auto;`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 960px;
`;

const Thead = styled.thead`background: #edf2f7;`;

const Th = styled.th`
  padding: 10px 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  &:hover { color: #2b6cb0; }
`;

const Tr = styled.tr`
  border-bottom: 1px solid #edf2f7;
  transition: background 0.12s;
  &:hover { background: #f7fafc; }
  &:last-child { border-bottom: none; }
`;

const Td = styled.td`
  padding: 9px 12px;
  font-size: 13px;
  color: #2d3748;
  white-space: nowrap;
`;

// ─── Badges ────────────────────────────────────────────────────────────────────
const Badge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  ${({ variant }) => {
    switch (variant) {
      case "cash":     return "background:#c6f6d5; color:#276749; border:1px solid #9ae6b4;";
      case "multiple": return "background:#e0e7ff; color:#3730a3; border:1px solid #c7d2fe;";
      case "card":     return "background:#dbeafe; color:#1e40af; border:1px solid #93c5fd;";
      case "upi":      return "background:#ede9fe; color:#5b21b6; border:1px solid #c4b5fd;";
      case "ip":       return "background:#fef3c7; color:#92400e; border:1px solid #fcd34d;";
      case "paid":     return "background:#c6f6d5; color:#276749; border:1px solid #9ae6b4;";
      case "billed":   return "background:#e2e8f0; color:#4a5568; border:1px solid #cbd5e0;";
      case "estimate": return "background:#fef9c3; color:#854d0e; border:1px solid #fde047;";
      case "direct":   return "background:#d1fae5; color:#065f46; border:1px solid #6ee7b7;";
      case "return":   return "background:#fee2e2; color:#991b1b; border:1px solid #fca5a5;";
      default:         return "background:#e2e8f0; color:#4a5568; border:1px solid #cbd5e0;";
    }
  }}
`;

// ─── Action Buttons ────────────────────────────────────────────────────────────
const ActionGroup = styled.div`display:flex; gap:5px; align-items:center;`;

const IconBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 5px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
  background: none;
  ${({ variant }) => {
    switch (variant) {
      case "edit":   return "background:#ebf8ff; border-color:#bee3f8; color:#2b6cb0; &:hover{background:#bee3f8;}";
      case "delete": return "background:#fff5f5; border-color:#fed7d7; color:#c53030; &:hover{background:#fed7d7;}";
      case "print":  return "background:#f0fff4; border-color:#c6f6d5; color:#276749; &:hover{background:#c6f6d5;}";
      case "copy":   return "background:#faf5ff; border-color:#e9d8fd; color:#6b46c1; &:hover{background:#e9d8fd;}";
      default:       return "background:#f7fafc; border-color:#e2e8f0; color:#4a5568;";
    }
  }}
`;

// ─── Pagination ────────────────────────────────────────────────────────────────
const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
  flex-wrap: wrap;
  gap: 8px;
`;

const PaginationInfo = styled.span`font-size:12px; color:#718096;`;
const PaginationBtns = styled.div`display:flex; gap:4px;`;

const PageBtn = styled.button`
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  border-radius: 5px;
  border: 1px solid ${({ active }) => (active ? "#2b6cb0" : "#e2e8f0")};
  background: ${({ active }) => (active ? "#2b6cb0" : "#fff")};
  color: ${({ active }) => (active ? "#fff" : "#4a5568")};
  font-size: 12px;
  font-weight: ${({ active }) => (active ? "700" : "400")};
  cursor: pointer;
  transition: all 0.15s;
  &:hover:not(:disabled) { background:${({ active }) => (active ? "#2c5282" : "#edf2f7")}; }
  &:disabled { opacity:0.45; cursor:not-allowed; }
`;

// ─── Misc ──────────────────────────────────────────────────────────────────────
const Spinner = styled.div`
  width:32px; height:32px;
  border:3px solid #e2e8f0; border-top-color:#2b6cb0;
  border-radius:50%; animation:${spin} 0.7s linear infinite;
  margin:40px auto;
`;

const EmptyMsg = styled.div`
  text-align:center; padding:40px; color:#a0aec0; font-size:14px;
`;

const AmountCell = styled.span`font-variant-numeric:tabular-nums; font-weight:500;`;

const StatPill = styled.span`
  display:inline-flex; align-items:center;
  padding:4px 12px; border-radius:20px;
  font-size:12px; font-weight:700;
  background:${({ bg }) => bg};
  color:${({ color }) => color};
  border:1px solid ${({ border }) => border};
`;

// ─── Pure helpers (no state) ───────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

const formatTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
};

/**
 * payment_details arrives as a Python OrderedDict string, e.g.:
 *   "OrderedDict([('method', 'cash'), ('Paid_amount', 103)])"
 *   "OrderedDict([('method', 'Multiple Payment'), ...])"
 * Extract the method value with a simple regex.
 */
const parsePaymentMethod = (raw) => {
  if (!raw) return null;
  const match = raw.match(/'method',\s*'([^']+)'/);
  return match ? match[1] : null;
};

const paymentVariant = (method) => {
  if (!method) return "default";
  const m = method.toLowerCase();
  if (m.includes("multiple")) return "multiple";
  if (m.includes("cash"))     return "cash";
  if (m.includes("card"))     return "card";
  if (m.includes("upi"))      return "upi";
  if (m.includes("ip") || m.includes("credit")) return "ip";
  return "default";
};

/**
 * Map bill_type numeric codes → readable labels.
 * Add more codes here as you discover them from the API.
 */
const BILL_TYPE_LABELS = {
  "42": "PHARMACY OP BILL",
  "43": "PHARMACY IP BILL",
  "44": "PHARMACY OTC BILL",
};

const billTypeLabel = (code) => BILL_TYPE_LABELS[code] || `Bill Type ${code}`;

// ─── Search-by options (label shown in UI, value sent to API) ─────────────────
const SEARCH_BY_OPTIONS = [
  { label: "Bill Date",    value: "bill_date"    },
  { label: "Patient Name", value: "patient_name" },
  { label: "UHID",         value: "uhid"         },
  { label: "Bill Number",  value: "bill_no"      },
];

const ENTRIES_OPTIONS = [10, 25, 50, 100];

// ─── formatBillData — maps exact API field names to internal shape ─────────────
const formatBillData = (bills) =>
  bills.map((b) => ({
    id:             b.Bill_id,                               // API: Bill_id
    bill_date:      b.bill_date      || b.created_date || "",// API: bill_date (ISO with tz)
    uhid:           b.uhid           || "",                  // API: uhid
    patient_name:   b.patient_name   || "",                  // API: patient_name (added by view)
    payment_method: parsePaymentMethod(b.payment_details),   // parsed from OrderedDict string
    payment_details: b.payment_details || null,              // raw string, kept for future modal
    billing_status: b.billing_status || "",                  // "Paid" | "Billed"
    billing_mode:   b.billing_mode   || "",                  // "DIRECT" | "ESTIMATE"
    bill_number:    b.bill_no        || "",                  // API: bill_no
    bill_type:      b.bill_type      || "",                  // API: bill_type (e.g. "42")
    estimate_no:    b.estimate_no    || null,                // API: estimate_no
    total_amount:   parseFloat(b.total_amount ?? 0),         // API: total_amount
    net_amount:     parseFloat(b.net_amount   ?? 0),         // API: net_amount
    discount:       parseFloat(b.overall_discount_amount ?? 0),
    doctor_id:      b.doctor_id      || "",
  }));

// ─── Component ────────────────────────────────────────────────────────────────
export default function OPPharmacyViewBills() {
  const [fromDate,       setFromDate]       = useState(today());
  const [toDate,         setToDate]         = useState(today());
  const [searchBy,       setSearchBy]       = useState(SEARCH_BY_OPTIONS[0].value);
  const [searchText,     setSearchText]     = useState("");

  // Bill-type filter populated dynamically from API data — no hardcoding
  const [billTypeFilter, setBillTypeFilter] = useState("ALL");
  const [billTypeCodes,  setBillTypeCodes]  = useState([]);

  const [allBills,       setAllBills]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");

  const [tableSearch,    setTableSearch]    = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [sortKey,        setSortKey]        = useState("bill_date");
  const [sortDir,        setSortDir]        = useState("desc");

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}OPPharmacy_pending_bills/`,
        "GET"
      );

      const billsArray = Array.isArray(response?.data) ? response.data : [];
      console.log("Raw pending bills data:", response?.data);

      const formatted = formatBillData(billsArray);
      setAllBills(formatted);
      setCurrentPage(1);

      // Derive unique bill_type codes from actual data — no hardcoding needed
      const codes = [...new Set(billsArray.map((b) => b.bill_type).filter(Boolean))];
      setBillTypeCodes(codes);

    } catch (err) {
      console.error("Pending bills error:", err);
      setError("Unable to connect to HMS server");
      setAllBills([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, searchBy, searchText]);

  useEffect(() => { fetchBills(); }, []); // eslint-disable-line

  // ── Client-side filtering ────────────────────────────────────────────────
  const filtered = allBills.filter((b) => {
    if (billTypeFilter !== "ALL" && b.bill_type !== billTypeFilter) return false;
    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      return (
        (b.patient_name   || "").toLowerCase().includes(q) ||
        (b.uhid           || "").toLowerCase().includes(q) ||
        (b.bill_number    || "").toLowerCase().includes(q) ||
        (b.payment_method || "").toLowerCase().includes(q) ||
        (b.billing_status || "").toLowerCase().includes(q) ||
        (b.billing_mode   || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortKey] ?? "";
    let bv = b[sortKey] ?? "";
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ?  1 : -1;
    return 0;
  });

  // ── Paginate ──────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / entriesPerPage));
  const paginated  = sorted.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }) =>
    sortKey !== col
      ? <span style={{ opacity:0.3 }}> ↕</span>
      : <span style={{ color:"#2b6cb0" }}>{sortDir === "asc" ? " ↑" : " ↓"}</span>;

  const paidCount   = allBills.filter((b) => b.billing_status === "Paid").length;
  const billedCount = allBills.filter((b) => b.billing_status === "Billed").length;

  const getPageNums = () => {
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= delta)
        pages.push(i);
      else if (pages[pages.length - 1] !== "...")
        pages.push("...");
    }
    return pages;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <GlobalStyle />
      <PageWrapper>
        <PageTitle>Pharmacy OP Bills — View Bills</PageTitle>

        {/* ── Filter Bar ── */}
        <FilterCard>
          {/* Bill Type — options derived from API data, zero hardcoding */}
          <FieldGroup>
            <Label>Bill Type</Label>
            <Select
              value={billTypeFilter}
              onChange={(e) => { setBillTypeFilter(e.target.value); setCurrentPage(1); }}
              style={{ minWidth: 200 }}
            >
              <option value="ALL">All Types</option>
              {billTypeCodes.map((code) => (
                <option key={code} value={code}>{billTypeLabel(code)}</option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label>From</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <Label>To</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <Label>Search By</Label>
            <Select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              style={{ minWidth: 150 }}
            >
              {SEARCH_BY_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup style={{ flex:1, minWidth:180 }}>
            <Label>Search Value</Label>
            <Input
              type="text"
              placeholder={`Search by ${SEARCH_BY_OPTIONS.find(s => s.value === searchBy)?.label}...`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchBills()}
            />
          </FieldGroup>

          <SearchBtn onClick={fetchBills}>
            <span>🔍</span> Search
          </SearchBtn>
        </FilterCard>

        {/* ── Stats Row ── */}
        {!loading && allBills.length > 0 && (
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <StatPill color="#276749" bg="#c6f6d5" border="#9ae6b4">Paid: {paidCount}</StatPill>
            <StatPill color="#744210" bg="#fefcbf" border="#f6e05e">Billed: {billedCount}</StatPill>
            <StatPill color="#2b6cb0" bg="#ebf8ff" border="#bee3f8">Total: {allBills.length}</StatPill>
          </div>
        )}

        {/* ── Table ── */}
        <TableCard>
          <TableToolbar>
            <ShowEntries>
              Show
              <Select
                value={entriesPerPage}
                onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{ width:64 }}
              >
                {ENTRIES_OPTIONS.map((n) => <option key={n}>{n}</option>)}
              </Select>
              entries
            </ShowEntries>

            <SelectedBadge>{filtered.length} SELECTED</SelectedBadge>

            <TableSearch>
              Search:
              <Input
                type="text"
                value={tableSearch}
                onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Filter table..."
              />
            </TableSearch>
          </TableToolbar>

          {error && (
            <div style={{ padding:"12px 16px", background:"#fff5f5", color:"#c53030", fontSize:13 }}>
              ⚠ {error}
            </div>
          )}

          {loading ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <EmptyMsg>No bills found for the selected criteria.</EmptyMsg>
          ) : (
            <TableWrapper>
              <Table>
                <Thead>
                  <tr>
                    <Th onClick={() => handleSort("bill_date")}>Bill Date <SortIcon col="bill_date" /></Th>
                    <Th onClick={() => handleSort("bill_date")}>Bill Time <SortIcon col="bill_date" /></Th>
                    <Th onClick={() => handleSort("uhid")}>UHID No <SortIcon col="uhid" /></Th>
                    <Th onClick={() => handleSort("patient_name")}>Patient <SortIcon col="patient_name" /></Th>
                    <Th onClick={() => handleSort("payment_method")}>Payment Mode <SortIcon col="payment_method" /></Th>
                    <Th onClick={() => handleSort("billing_mode")}>Billing Mode <SortIcon col="billing_mode" /></Th>
                    <Th onClick={() => handleSort("billing_status")}>Status <SortIcon col="billing_status" /></Th>
                    <Th onClick={() => handleSort("bill_number")}>Bill Number <SortIcon col="bill_number" /></Th>
                    <Th onClick={() => handleSort("total_amount")}>Bill Amount <SortIcon col="total_amount" /></Th>
                    <Th onClick={() => handleSort("net_amount")}>Net Amount <SortIcon col="net_amount" /></Th>
                    <Th>Actions</Th>
                  </tr>
                </Thead>
                <tbody>
                  {paginated.map((bill, idx) => (
                    <Tr key={bill.id ?? idx}>
                      {/* bill_date — date part */}
                      <Td>{formatDate(bill.bill_date)}</Td>

                      {/* bill_date — time part (API has no separate bill_time field) */}
                      <Td>{formatTime(bill.bill_date)}</Td>

                      <Td style={{ color:"#2b6cb0", fontWeight:500 }}>
                        {bill.uhid || "—"}
                      </Td>

                      <Td style={{ fontWeight:500 }}>
                        {bill.patient_name || "—"}
                      </Td>

                      {/* payment_method parsed from payment_details OrderedDict string */}
                      <Td>
                        {bill.payment_method ? (
                          <Badge variant={paymentVariant(bill.payment_method)}>
                            {bill.payment_method}
                          </Badge>
                        ) : (
                          <span style={{ color:"#a0aec0" }}>—</span>
                        )}
                      </Td>

                      {/* billing_mode: DIRECT | ESTIMATE */}
                      <Td>
                        <Badge variant={bill.billing_mode === "ESTIMATE" ? "estimate" : "direct"}>
                          {bill.billing_mode || "—"}
                        </Badge>
                      </Td>

                      {/* billing_status: Paid | Billed */}
                      <Td>
                        <Badge variant={bill.billing_status === "Paid" ? "paid" : "billed"}>
                          {bill.billing_status || "—"}
                        </Badge>
                      </Td>

                      {/* bill_no from API */}
                      <Td style={{ fontFamily:"monospace", fontSize:12 }}>
                        {bill.bill_number || "—"}
                      </Td>

                      {/* total_amount from API */}
                      <Td><AmountCell>₹ {bill.total_amount.toFixed(2)}</AmountCell></Td>

                      {/* net_amount from API */}
                      <Td><AmountCell>₹ {bill.net_amount.toFixed(2)}</AmountCell></Td>

                      <Td>
                        <ActionGroup>
                          <IconBtn variant="edit"   title="Edit"
                            onClick={() => alert(`Edit: ${bill.bill_number}`)}>✏️</IconBtn>
                          <IconBtn variant="delete" title="Delete"
                            onClick={() => alert(`Delete: ${bill.bill_number}`)}>🗑️</IconBtn>
                          <IconBtn variant="print"  title="Print"
                            onClick={() => window.print()}>🖨️</IconBtn>
                          <IconBtn variant="copy"   title="Duplicate"
                            onClick={() => alert(`Duplicate: ${bill.bill_number}`)}>📋</IconBtn>
                        </ActionGroup>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          )}

          {/* ── Pagination ── */}
          {!loading && filtered.length > 0 && (
            <PaginationBar>
              <PaginationInfo>
                Showing {Math.min((currentPage - 1) * entriesPerPage + 1, filtered.length)} to{" "}
                {Math.min(currentPage * entriesPerPage, filtered.length)} of {filtered.length} entries
                {filtered.length < allBills.length && ` (filtered from ${allBills.length} total)`}
              </PaginationInfo>
              <PaginationBtns>
                <PageBtn
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </PageBtn>
                {getPageNums().map((p, i) =>
                  p === "..." ? (
                    <PageBtn key={`e${i}`} disabled>…</PageBtn>
                  ) : (
                    <PageBtn key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>
                      {p}
                    </PageBtn>
                  )
                )}
                <PageBtn
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </PageBtn>
              </PaginationBtns>
            </PaginationBar>
          )}
        </TableCard>
      </PageWrapper>
    </>
  );
}