import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Search, X, Check } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";

// ─── Modal Overlay & Container ───────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.18s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: ${(props) => (props.$isIpMode ? "880px" : "780px")};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(15, 118, 110, 0.1);
  animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from { transform: translateY(16px) scale(0.98); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }
`;

const ModalHeader = styled.div`
  background: #0f766e;
  color: #ffffff;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

// ─── Filter Bar ──────────────────────────────────────────────────────────────

const FilterBar = styled.div`
  display: flex;
  gap: 14px;
  align-items: flex-end;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: ${(props) => props.$flex || "1 1 180px"};
  min-width: 130px;
`;

const FilterLabel = styled.label`
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
`;

const FilterInput = styled.input`
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 0.88rem;
  color: #0f172a;
  outline: none;
  background: #ffffff;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: #0f766e;
    box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 4px;
`;

const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #0f766e;
  cursor: pointer;
`;

const SearchBtn = styled.button`
  background: #0f766e;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 7px 18px;
  font-size: 0.88rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  height: 36px;
  transition: background 0.15s, transform 0.1s;

  &:hover {
    background: #115e59;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// ─── Table ───────────────────────────────────────────────────────────────────

const TableContainer = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow-x: auto;
  margin-top: 4px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
  text-align: left;
`;

const Th = styled.th`
  background: #f1f5f9;
  color: #334155;
  font-weight: 700;
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.12s;

  &:hover {
    background: #f0fdfa;

    .select-btn {
      background: #0f766e;
      color: #ffffff;
      border-color: #0f766e;
    }
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Td = styled.td`
  padding: 10px 14px;
  color: #1e293b;
  vertical-align: middle;
  white-space: nowrap;
`;

const SelectButton = styled.button`
  background: #f8fafc;
  color: #0f766e;
  border: 1.5px solid #0f766e;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #0f766e;
    color: #ffffff;
  }
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  background: ${(props) =>
    props.$status === "admitted"
      ? "#f0fdf4"
      : props.$status === "discharged"
      ? "#fef2f2"
      : "#f8fafc"};
  color: ${(props) =>
    props.$status === "admitted"
      ? "#15803d"
      : props.$status === "discharged"
      ? "#dc2626"
      : "#475569"};
  border: 1px solid
    ${(props) =>
      props.$status === "admitted"
        ? "#bbf7d0"
        : props.$status === "discharged"
        ? "#fecaca"
        : "#e2e8f0"};

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(props) =>
      props.$status === "admitted"
        ? "#16a34a"
        : props.$status === "discharged"
        ? "#dc2626"
        : "#94a3b8"};
  }
`;

// ─── Footer & Pagination ─────────────────────────────────────────────────────

const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  flex-wrap: wrap;
  gap: 10px;
`;

const ShowingText = styled.span`
  font-size: 0.83rem;
  color: #64748b;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageBtn = styled.button`
  border: 1px solid #cbd5e1;
  background: ${(props) => (props.$active ? "#0f766e" : "#ffffff")};
  color: ${(props) => (props.$active ? "#ffffff" : "#334155")};
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  font-size: 0.82rem;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  min-width: 32px;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: ${(props) => (props.$active ? "#0f766e" : "#f1f5f9")};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 14px;
  font-size: 0.82rem;
  color: #475569;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const LegendDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(props) => props.$color || "#0f766e"};
  display: inline-block;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 36px 16px;
  color: #64748b;
  font-size: 0.88rem;
`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function PatientSearchModal({
  isOpen,
  onClose,
  onSelect,
  initialQuery = "",
  mode = "uhid", // "uhid" | "ip"
  title,
}) {
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const isIpMode = mode === "ip";
  const modalTitle = title || (isIpMode ? "Select IP Number" : "Select UHID");

  const [primaryInput, setPrimaryInput] = useState(initialQuery);
  const [namePhoneInput, setNamePhoneInput] = useState("");
  const [isAdmittedFilter, setIsAdmittedFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const formatName = (salutation, first, last) => {
    const parts = [salutation, first, last].filter(Boolean);
    return parts.join(" ").trim() || "—";
  };

  const executeSearch = useCallback(
    async (overridePrimary, overrideName, overrideAdmitted) => {
      const qPrimary = (overridePrimary !== undefined ? overridePrimary : primaryInput).trim();
      const qName = (overrideName !== undefined ? overrideName : namePhoneInput).trim();
      const qAdmitted = overrideAdmitted !== undefined ? overrideAdmitted : isAdmittedFilter;

      setLoading(true);
      try {
        let list = [];

        if (isIpMode) {
          const params = ["search=1"];
          if (qPrimary) params.push(`ip_number=${encodeURIComponent(qPrimary)}`);
          if (qName) {
            params.push(`name=${encodeURIComponent(qName)}`);
            params.push(`mobile=${encodeURIComponent(qName)}`);
          }

          if (params.length === 1 && !qPrimary && !qName) {
            setResults([]);
            setLoading(false);
            return;
          }

          const res = await apiRequest(
            `${HMSURL}ip-patient/search/?${params.join("&")}`,
            "GET"
          );
          const rawData = res.data || res;
          list = Array.isArray(rawData?.data)
            ? rawData.data
            : Array.isArray(rawData?.results)
            ? rawData.results
            : Array.isArray(rawData)
            ? rawData
            : [];
        } else {
          const params = ["search=1"];
          if (qPrimary) params.push(`uhid=${encodeURIComponent(qPrimary)}`);
          if (qName) {
            params.push(`name=${encodeURIComponent(qName)}`);
            params.push(`mobile=${encodeURIComponent(qName)}`);
          }
          if (qAdmitted) params.push("admitted=true");

          if (params.length === 1 && !qPrimary && !qName) {
            setResults([]);
            setLoading(false);
            return;
          }

          const url = `${HMSURL}op-patient/search/?${params.join("&")}`;
          const res = await apiRequest(url, "GET");

          const rawData = res.data || res;
          list = Array.isArray(rawData?.data)
            ? rawData.data
            : Array.isArray(rawData?.results)
            ? rawData.results
            : Array.isArray(rawData)
            ? rawData
            : [];
        }

        if (qAdmitted) {
          list = list.filter((p) => {
            if (p.admitted !== undefined) return p.admitted;
            if (p.is_admitted !== undefined) return p.is_admitted && !p.is_discharged;
            return Boolean(p.ip_number);
          });
        }

        setResults(list);
        setCurrentPage(1);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [HMSURL, isIpMode, primaryInput, namePhoneInput, isAdmittedFilter]
  );

  useEffect(() => {
    if (isOpen) {
      setPrimaryInput(initialQuery || "");
      setNamePhoneInput("");
      setIsAdmittedFilter(false);
      setResults([]);
      setCurrentPage(1);

      if (initialQuery && initialQuery.trim()) {
        executeSearch(initialQuery.trim(), "", false);
      }
    }
  }, [isOpen, initialQuery]); // eslint-disable-line

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalEntries = results.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentRecords = results.slice(startIndex, startIndex + pageSize);

  const handleRowClick = (item) => {
    onSelect(item);
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer $isIpMode={isIpMode} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{modalTitle}</ModalTitle>
          <CloseButton onClick={onClose} aria-label="Close">
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {/* Top Filter Bar */}
          <FilterBar>
            <FilterField $flex="1 1 180px">
              <FilterLabel>{isIpMode ? "IP Number" : "UHID"}</FilterLabel>
              <FilterInput
                type="text"
                placeholder={isIpMode ? "e.g. 022 or IP0022" : "e.g. 022 or 22"}
                value={primaryInput}
                onChange={(e) => setPrimaryInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && executeSearch()}
                autoFocus
              />
            </FilterField>

            <FilterField $flex="1 1 200px">
              <FilterLabel>Name / Phone</FilterLabel>
              <FilterInput
                type="text"
                placeholder="Name or Phone"
                value={namePhoneInput}
                onChange={(e) => setNamePhoneInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && executeSearch()}
              />
            </FilterField>

            <CheckboxWrapper>
              <FilterLabel style={{ cursor: "pointer" }} htmlFor="admitted-filter-chk">
                Admitted Only
              </FilterLabel>
              <CheckboxInput
                id="admitted-filter-chk"
                type="checkbox"
                checked={isAdmittedFilter}
                onChange={(e) => {
                  const val = e.target.checked;
                  setIsAdmittedFilter(val);
                  executeSearch(undefined, undefined, val);
                }}
              />
            </CheckboxWrapper>

            <SearchBtn
              type="button"
              onClick={() => executeSearch()}
              disabled={loading || (!primaryInput.trim() && !namePhoneInput.trim())}
            >
              <Search size={15} /> Search
            </SearchBtn>
          </FilterBar>

          {/* Results Table / Empty State */}
          {loading ? (
            <EmptyState>🔍 Searching records...</EmptyState>
          ) : results.length === 0 ? (
            <EmptyState>No records found. Try searching with a different value.</EmptyState>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <Th style={{ width: 85, textAlign: "center" }}>Action</Th>
                      {isIpMode && <Th>IP Number</Th>}
                      <Th>UHID No</Th>
                      <Th>Patient</Th>
                      <Th>Mobile</Th>
                      {isIpMode && <Th>Room / Bed</Th>}
                      <Th style={{ textAlign: "center" }}>Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((p, idx) => {
                      const uhidNo = p.uhid || p.UHID || "—";
                      const ipNo = p.ipNumber || p.ip_number || "—";
                      const fullName = formatName(
                        p.salutation,
                        p.firstName || p.first_name,
                        p.lastName || p.last_name
                      );
                      const mobile = p.mobilePhone || p.mobile || p.phone || p.mobileNumber || "—";

                      // Resolve Status: 'admitted', 'discharged', or 'op'
                      let statusType = "op";
                      let statusLabel = "Outpatient";

                      if (p.admitted === true || (p.is_admitted && !p.is_discharged)) {
                        statusType = "admitted";
                        statusLabel = "Admitted";
                      } else if (p.is_discharged === true || p.discharged === true) {
                        statusType = "discharged";
                        statusLabel = "Discharged";
                      }

                      // Room calculation if IP mode
                      let roomLabel = "—";
                      if (isIpMode) {
                        const activeRoom = Array.isArray(p.room_details)
                          ? p.room_details.find((r) => r.is_roomActive)
                          : null;
                        const activeShift = Array.isArray(p.roomShitingDetails)
                          ? p.roomShitingDetails.find((r) => r.is_roomActive)
                          : null;
                        roomLabel = activeRoom
                          ? `${activeRoom.roomNo} / Bed ${activeRoom.bedNo}`
                          : activeShift
                          ? `${activeShift.newRoomNo} / Bed ${activeShift.newBedNo}`
                          : p.room_no || "—";
                      }

                      return (
                        <Tr key={p.id || p.uhid || idx} onClick={() => handleRowClick(p)}>
                          <Td style={{ textAlign: "center" }}>
                            <SelectButton className="select-btn" type="button">
                              <Check size={13} strokeWidth={3} /> Select
                            </SelectButton>
                          </Td>
                          {isIpMode && (
                            <Td style={{ fontWeight: 700, color: "#0f766e", fontFamily: "monospace" }}>
                              {ipNo}
                            </Td>
                          )}
                          <Td style={{ fontWeight: 600, fontFamily: "monospace" }}>{uhidNo}</Td>
                          <Td style={{ fontWeight: 500 }}>{fullName}</Td>
                          <Td>{mobile}</Td>
                          {isIpMode && <Td style={{ fontSize: "0.83rem" }}>{roomLabel}</Td>}
                          <Td style={{ textAlign: "center" }}>
                            <StatusPill $status={statusType}>{statusLabel}</StatusPill>
                          </Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </Table>
              </TableContainer>

              {/* Pagination Row */}
              <FooterRow>
                <ShowingText>
                  Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalEntries)} of{" "}
                  {totalEntries} entries
                </ShowingText>

                {totalPages > 1 && (
                  <Pagination>
                    <PageBtn
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </PageBtn>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <PageBtn
                        key={pageNum}
                        $active={pageNum === currentPage}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PageBtn>
                    ))}
                    <PageBtn
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </PageBtn>
                  </Pagination>
                )}
              </FooterRow>

              {/* Legend */}
              <LegendRow>
                <LegendItem>
                  <LegendDot $color="#16a34a" />
                  <span>Admitted</span>
                </LegendItem>
                <LegendItem>
                  <LegendDot $color="#dc2626" />
                  <span>Discharged</span>
                </LegendItem>
                <LegendItem>
                  <LegendDot $color="#94a3b8" />
                  <span>Outpatient</span>
                </LegendItem>
              </LegendRow>
            </>
          )}
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
}
