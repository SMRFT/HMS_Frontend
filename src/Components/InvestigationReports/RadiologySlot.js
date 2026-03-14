import React, { useEffect, useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
  PageWrapper,
  Container,
  Button,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
} from "../GlobalStyles";

// ─── Scan Type Config ─────────────────────────────────────────────────────────

const SCAN_TYPES = [
  {
    label: "CT Scan",
    value: "CT01",
    icon: "🔬",
    color: "#00897b",
    accent: "#e0f2f1",
  },
  {
    label: "MRI Scan",
    value: "MRI01",
    icon: "🧲",
    color: "#1e88e5",
    accent: "#e3f2fd",
  },
  {
    label: "USG Scan",
    value: "USG01",
    icon: "🔊",
    color: "#8e24aa",
    accent: "#f3e5f5",
  },
  {
    label: "X-Ray",
    value: "XRAY01",
    icon: "☢️",
    color: "#f57c00",
    accent: "#fff3e0",
  },
];

// ─── Layout ───────────────────────────────────────────────────────────────────

const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.1rem;
  padding-bottom: 0.9rem;
  border-bottom: 2px solid #f0f0f0;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  font-size: 1.45rem;
  font-weight: 800;
  background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

// ── Scan Type Dropdown ────────────────────────────────────────────────────────

const ScanTypeWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const ScanTypeSelect = styled.select`
  appearance: none;
  padding: 0.42rem 2rem 0.42rem 0.8rem;
  border: 2px solid ${(p) => p.borderColor || "#7c4dff"};
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${(p) => p.textColor || "#5e35b1"};
  background: ${(p) => p.bg || "#ede7f6"};
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  &:focus {
    box-shadow: 0 0 0 3px ${(p) => p.shadowColor || "rgba(124,77,255,0.18)"};
  }
`;

const SelectArrow = styled.span`
  position: absolute;
  right: 0.5rem;
  pointer-events: none;
  font-size: 0.6rem;
  color: ${(p) => p.color || "#7c4dff"};
`;

const IpBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.22rem 0.6rem;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 700;
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffcc80;
`;

// ── Filter bar ────────────────────────────────────────────────────────────────

const FilterContainer = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: flex-end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FilterLabel = styled.label`
  color: #7c4dff;
  font-weight: 600;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const DateInput = styled.input`
  padding: 0.38rem 0.6rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #555;
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    border-color: #7c4dff;
    box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.12);
  }
`;

const ResetButton = styled(Button)`
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
  padding: 0.38rem 0.9rem;
  font-size: 0.78rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  &:hover {
    background: linear-gradient(135deg, #616161, #424242);
    transform: translateY(-1px);
  }
`;

// ── Column search ─────────────────────────────────────────────────────────────

const SearchInput = styled.input`
  width: 100%;
  padding: 0.38rem 0.55rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 7px;
  font-size: 0.78rem;
  color: #444;
  background: #fafafa;
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: #7c4dff;
    box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.12);
    background: #fff;
  }
  &::placeholder {
    color: #c0b0e0;
    font-style: italic;
    font-size: 0.75rem;
  }
`;

const SearchSelect = styled.select`
  width: 100%;
  padding: 0.38rem 0.45rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 7px;
  font-size: 0.78rem;
  color: #444;
  background: #fafafa;
  box-sizing: border-box;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: #7c4dff;
    box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.12);
  }
`;

const SearchTh = styled.th`
  padding: 0.38rem 0.5rem 0.55rem;
  background: #faf8ff;
  border-bottom: 2px solid #ede7f6;
`;

// ── Badges ────────────────────────────────────────────────────────────────────

const StatusBadge = styled.span`
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  text-transform: uppercase;
  white-space: nowrap;
  ${(p) => {
    if (!p.hasReport)
      return "background:linear-gradient(135deg,#e3f2fd,#bbdefb);color:#1565c0;";
    if (p.approved)
      return "background:linear-gradient(135deg,#c8e6c9,#a5d6a7);color:#2e7d32;";
    return "background:linear-gradient(135deg,#fff9c4,#fff59d);color:#f57f17;";
  }}
`;

const SlotBadge = styled.span`
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.66rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  background: linear-gradient(135deg, #ede7f6, #d1c4e9);
  color: #4527a0;
  white-space: nowrap;
`;

// ── Preview Icon Button ───────────────────────────────────────────────────────

const PreviewBtn = styled.button`
  position: relative;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  background: linear-gradient(135deg, #26a69a, #00897b);
  color: white;
  box-shadow: 0 2px 7px rgba(0, 137, 123, 0.25);
  transition:
    transform 0.15s,
    box-shadow 0.15s,
    filter 0.15s;

  &:hover {
    transform: translateY(-2px) scale(1.08);
    box-shadow: 0 5px 14px rgba(0, 137, 123, 0.35);
    filter: brightness(1.08);
  }
  &:active {
    transform: translateY(0) scale(1);
  }

  /* Tooltip */
  &::after {
    content: "Preview Report";
    position: absolute;
    bottom: calc(100% + 7px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 20, 0.88);
    color: #fff;
    font-size: 0.68rem;
    font-weight: 600;
    white-space: nowrap;
    padding: 3px 8px;
    border-radius: 5px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    z-index: 9999;
  }
  &::before {
    content: "";
    position: absolute;
    bottom: calc(100% + 1px);
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(20, 20, 20, 0.88);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    z-index: 9999;
  }
  &:hover::after,
  &:hover::before {
    opacity: 1;
  }
`;

// ── Empty / footer ────────────────────────────────────────────────────────────

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  p {
    font-size: 0.95rem;
    font-weight: 500;
    color: #888;
    margin-top: 0.6rem;
  }
`;

const TableFooter = styled.div`
  margin-top: 0.6rem;
  font-size: 0.72rem;
  color: #bbb;
  text-align: right;
  font-weight: 600;
`;

// ─── Preview Modal Styles ─────────────────────────────────────────────────────

const ModalOverlayStyled = styled(ModalOverlay)`
  background: linear-gradient(
    135deg,
    rgba(0, 137, 123, 0.88),
    rgba(0, 105, 92, 0.88)
  );
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 1rem;
`;

const ModalBox = styled(ModalContainer)`
  border-radius: 22px;
  padding: 2rem 2.5rem;
  max-width: 580px;
  width: 100%;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  margin: auto;
  animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  @keyframes slideUp {
    from {
      transform: translateY(40px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const MHeader = styled(ModalHeader)`
  border-bottom: 2px solid #e0f2f1;
  background: transparent;
  padding: 0 0 1rem 0;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const MIcon = styled.span`
  font-size: 1.6rem;
`;

const InfoRow = styled.div`
  display: flex;
  padding: 0.65rem 0;
  border-bottom: 1px solid #f5f5f5;
  &:last-child {
    border-bottom: none;
  }
`;

const InfoKey = styled.span`
  color: #00897b;
  font-weight: 700;
  font-size: 0.78rem;
  min-width: 140px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const InfoVal = styled.span`
  color: #444;
  font-size: 0.9rem;
  flex: 1;
  line-height: 1.55;
  white-space: pre-wrap;
`;

const CloseModalBtn = styled(CloseButton)`
  margin-top: 1.75rem;
  padding: 0.85rem 1.5rem;
  background: linear-gradient(135deg, #00897b, #00695c);
  color: white;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  width: 100%;
  height: auto;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  box-shadow: 0 4px 14px rgba(0, 137, 123, 0.3);
  &:hover {
    background: linear-gradient(135deg, #00796b, #004d40);
    transform: translateY(-2px);
    color: white;
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToday = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => (!d ? "" : typeof d === "string" ? d.split("T")[0] : "");
const fmtSlot = (s) => {
  if (!s) return null;
  try {
    // Strip timezone offset entirely — read the stored digits as-is.
    // "2026-03-09T16:40:00.000Z" → treat "16:40" as the user-entered local time.
    const raw = typeof s === "string" ? s : new Date(s).toISOString();
    const parts = raw.replace("Z", "").split("T");
    const [yyyy, mm, dd] = parts[0].split("-");
    const [hh, min] = parts[1].split(":");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const h = parseInt(hh, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${dd} ${months[parseInt(mm, 10) - 1]} ${yyyy}, ${h12}:${min} ${ampm}`;
  } catch {
    return s;
  }
};

// ─── Preview Modal ────────────────────────────────────────────────────────────

const PreviewModal = ({ row, onClose }) => {
  const r = row.report;
  return (
    <ModalOverlayStyled onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <MHeader>
          <MIcon>🏥</MIcon>
          <ModalTitle>Report Preview</ModalTitle>
        </MHeader>
        <ModalBody style={{ padding: 0 }}>
          <InfoRow>
            <InfoKey>Bill No</InfoKey> <InfoVal>{row.investBillNo}</InfoVal>
          </InfoRow>
          <InfoRow>
            <InfoKey>Patient Name</InfoKey> <InfoVal>{row.patientName}</InfoVal>
          </InfoRow>
          <InfoRow>
            <InfoKey>UHID</InfoKey> <InfoVal>{row.uhid}</InfoVal>
          </InfoRow>
          <InfoRow>
            <InfoKey>IP Number</InfoKey> <InfoVal>{row.ipNumber}</InfoVal>
          </InfoRow>
          <InfoRow>
            <InfoKey>Age</InfoKey> <InfoVal>{row.age || "N/A"}</InfoVal>
          </InfoRow>
          <InfoRow>
            <InfoKey>Gender</InfoKey> <InfoVal>{row.gender || "N/A"}</InfoVal>
          </InfoRow>
          <InfoRow>
            <InfoKey>Scan Type</InfoKey> <InfoVal>{row.scanLabel}</InfoVal>
          </InfoRow>
          <InfoRow>
            <InfoKey>Item</InfoKey> <InfoVal>{row.itemName || "—"}</InfoVal>
          </InfoRow>
          <InfoRow>
            <InfoKey>Bill Date</InfoKey>{" "}
            <InfoVal>{fmtDate(row.investBillDate)}</InfoVal>
          </InfoRow>
          <InfoRow>
            <InfoKey>Slot</InfoKey>{" "}
            <InfoVal>
              {r?.slot_DateTime ? fmtSlot(r.slot_DateTime) : "Not scheduled"}
            </InfoVal>
          </InfoRow>
          <InfoRow>
            <InfoKey>Report Date</InfoKey>{" "}
            <InfoVal>{r?.date ? fmtDate(r.date) : "N/A"}</InfoVal>
          </InfoRow>
          <InfoRow>
            <InfoKey>Impression</InfoKey>{" "}
            <InfoVal>{r?.impression || "N/A"}</InfoVal>
          </InfoRow>
        </ModalBody>
        <CloseModalBtn onClick={onClose}>Close</CloseModalBtn>
      </ModalBox>
    </ModalOverlayStyled>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const RadiologySlot = () => {
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [selectedScanType, setSelectedScanType] = useState(SCAN_TYPES[0]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(getToday);
  const [toDate, setToDate] = useState(getToday);

  // Column search
  const [searchBillNo, setSearchBillNo] = useState("");
  const [searchUhid, setSearchUhid] = useState("");
  const [searchIpNumber, setSearchIpNumber] = useState("");
  const [searchPatient, setSearchPatient] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  // Preview modal
  const [previewRow, setPreviewRow] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // ── Fetch — IP patients only ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        billTypeNo: selectedScanType.value,
        from_date: fromDate,
        to_date: toDate,
      });
      const result = await apiRequest(
        `${HMSURL}investigations/?${params.toString()}`,
        "GET",
      );
      if (!result.success) {
        toast.error(result.error || "Failed to fetch data");
        return;
      }

      const merged = (result.data || [])
        .filter((r) => !!r.ipNumber)
        .map((r) => ({
          investBillNo: r.investBillNo,
          uhid: r.uhid,
          ipNumber: r.ipNumber,
          investBillDate: r.investBillDate,
          itemName: r.itemName || "",
          billTypeNo: r.billTypeNo || selectedScanType.value,
          scanLabel: selectedScanType.label,
          patientName:
            `${r.salutation || ""} ${r.firstName || ""} ${r.lastName || ""}`.trim(),
          age: r.age,
          gender: r.gender,
          report: r.report || null,
          hasReport: !!r.hasReport,
        }));

      setRows(merged);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [HMSURL, selectedScanType, fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleScanTypeChange = (e) => {
    const found = SCAN_TYPES.find((s) => s.value === e.target.value);
    if (found) {
      setSelectedScanType(found);
      setRows([]);
      setSearchBillNo("");
      setSearchUhid("");
      setSearchIpNumber("");
      setSearchPatient("");
      setSearchStatus("");
    }
  };

  const handleReset = () => {
    setFromDate(getToday());
    setToDate(getToday());
    setSearchBillNo("");
    setSearchUhid("");
    setSearchIpNumber("");
    setSearchPatient("");
    setSearchStatus("");
  };

  // ── Client-side filter ─────────────────────────────────────────────────────
  const filteredRows = useMemo(
    () =>
      rows.filter((r) => {
        const sl = !r.hasReport
          ? "pending"
          : r.report?.is_approved
            ? "approved"
            : "reported";
        return (
          (!searchBillNo ||
            (r.investBillNo || "")
              .toLowerCase()
              .includes(searchBillNo.toLowerCase())) &&
          (!searchUhid ||
            (r.uhid || "").toLowerCase().includes(searchUhid.toLowerCase())) &&
          (!searchIpNumber ||
            (r.ipNumber || "")
              .toLowerCase()
              .includes(searchIpNumber.toLowerCase())) &&
          (!searchPatient ||
            (r.patientName || "")
              .toLowerCase()
              .includes(searchPatient.toLowerCase())) &&
          (!searchStatus || sl === searchStatus)
        );
      }),
    [
      rows,
      searchBillNo,
      searchUhid,
      searchIpNumber,
      searchPatient,
      searchStatus,
    ],
  );

  const meta = selectedScanType;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>
        <ContentCard>
          {/* Top bar */}
          <TopBar>
            <TitleGroup>
              <PageTitle>
                <span>{meta.icon}</span> Radiology Slot
              </PageTitle>

              <ScanTypeWrapper>
                <ScanTypeSelect
                  value={selectedScanType.value}
                  onChange={handleScanTypeChange}
                  borderColor={meta.color}
                  textColor={meta.color}
                  bg={meta.accent}
                  shadowColor={`${meta.color}33`}
                >
                  {SCAN_TYPES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.icon} {s.label}
                    </option>
                  ))}
                </ScanTypeSelect>
                <SelectArrow color={meta.color}>▼</SelectArrow>
              </ScanTypeWrapper>

              <IpBadge>🏥 IP Patients Only</IpBadge>
            </TitleGroup>

            <FilterContainer>
              <FilterGroup>
                <FilterLabel>From</FilterLabel>
                <DateInput
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </FilterGroup>
              <FilterGroup>
                <FilterLabel>To</FilterLabel>
                <DateInput
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </FilterGroup>
              <ResetButton onClick={handleReset}>↺ Reset</ResetButton>
            </FilterContainer>
          </TopBar>

          {/* Table */}
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Bill No</Th>
                  <Th>UHID</Th>
                  <Th>IP Number</Th>
                  <Th>Patient Name</Th>
                  <Th>Age</Th>
                  <Th>Gender</Th>
                  <Th>Item</Th>
                  <Th>Bill Date</Th>
                  <Th>Slot</Th>
                  <Th>Status</Th>
                  <Th>Preview</Th>
                </tr>

                {/* Search row */}
                <tr>
                  <SearchTh />
                  <SearchTh>
                    <SearchInput
                      placeholder="🔍 Bill No"
                      value={searchBillNo}
                      onChange={(e) => setSearchBillNo(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh>
                    <SearchInput
                      placeholder="🔍 UHID"
                      value={searchUhid}
                      onChange={(e) => setSearchUhid(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh>
                    <SearchInput
                      placeholder="🔍 IP No"
                      value={searchIpNumber}
                      onChange={(e) => setSearchIpNumber(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh>
                    <SearchInput
                      placeholder="🔍 Patient"
                      value={searchPatient}
                      onChange={(e) => setSearchPatient(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh />
                  <SearchTh />
                  <SearchTh />
                  <SearchTh />
                  <SearchTh />
                  <SearchTh>
                    <SearchSelect
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="pending">⏳ Pending</option>
                      <option value="reported">⏱ Reported</option>
                      <option value="approved">✓ Approved</option>
                    </SearchSelect>
                  </SearchTh>
                  <SearchTh />
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <Td colSpan="12">
                      <EmptyState>
                        <div style={{ fontSize: "2.5rem" }}>⏳</div>
                        <p>Loading {meta.label} patients…</p>
                      </EmptyState>
                    </Td>
                  </tr>
                ) : filteredRows.length > 0 ? (
                  filteredRows.map((row, index) => (
                    <Tr
                      key={`${row.investBillNo}-${row.itemName}-${index}`}
                      style={{
                        background: row.report?.slot_DateTime
                          ? "linear-gradient(135deg,#f5f0ff 0%,#ede7f6 100%)"
                          : "white",
                      }}
                    >
                      <Td
                        style={{
                          color: "#bbb",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {index + 1}
                      </Td>
                      <Td>{row.investBillNo}</Td>
                      <Td>{row.uhid}</Td>
                      <Td>
                        <span style={{ fontWeight: 700, color: meta.color }}>
                          {row.ipNumber}
                        </span>
                      </Td>
                      <Td>{row.patientName}</Td>
                      <Td>{row.age || "—"}</Td>
                      <Td>{row.gender || "—"}</Td>
                      <Td>{row.itemName || "—"}</Td>
                      <Td>{fmtDate(row.investBillDate)}</Td>

                      {/* Slot — display only */}
                      <Td>
                        {row.report?.slot_DateTime ? (
                          <SlotBadge>
                            🕐 {fmtSlot(row.report.slot_DateTime)}
                          </SlotBadge>
                        ) : (
                          <span style={{ color: "#ccc", fontSize: "0.74rem" }}>
                            —
                          </span>
                        )}
                      </Td>

                      {/* Status */}
                      <Td>
                        {!row.hasReport ? (
                          <StatusBadge hasReport={false}>
                            ⏳ Pending
                          </StatusBadge>
                        ) : row.report?.is_approved ? (
                          <StatusBadge hasReport approved>
                            ✓ Approved
                          </StatusBadge>
                        ) : (
                          <StatusBadge hasReport>⏱ Reported</StatusBadge>
                        )}
                      </Td>

                      {/* Preview — only if approved */}
                      <Td>
                        {row.report?.is_approved ? (
                          <PreviewBtn
                            onClick={() => {
                              setPreviewRow(row);
                              setPreviewOpen(true);
                            }}
                          >
                            👁
                          </PreviewBtn>
                        ) : (
                          <span
                            style={{ color: "#e0e0e0", fontSize: "0.72rem" }}
                          >
                            —
                          </span>
                        )}
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <tr>
                    <Td colSpan="12">
                      <EmptyState>
                        <div style={{ fontSize: "3rem" }}>{meta.icon}</div>
                        <p>
                          {rows.length > 0
                            ? "No results match your search"
                            : `No IP patients found for ${meta.label} in selected date range`}
                        </p>
                      </EmptyState>
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableWrapper>

          {filteredRows.length > 0 && (
            <TableFooter>
              Showing {filteredRows.length} of {rows.length} IP patient
              {rows.length !== 1 ? "s" : ""} · {meta.icon} {meta.label}
            </TableFooter>
          )}
        </ContentCard>
      </Container>

      {previewOpen && previewRow && (
        <PreviewModal
          row={previewRow}
          onClose={() => {
            setPreviewOpen(false);
            setPreviewRow(null);
          }}
        />
      )}
    </PageWrapper>
  );
};

export default RadiologySlot;
