import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container, PageWrapper,
  TableWrapper, Table, Th, Td, Tr,
  Button,
} from "../GlobalStyles";
import styled from "styled-components";

// ── Styled Components ─────────────────────────────────────────────────────────

const PageHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 18px 24px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
`;

const PageSubtitle = styled.p`
  margin: 3px 0 0;
  font-size: 0.8rem;
  opacity: 0.8;
`;

const SectionTitle = styled.h4`
  color: #0d9488;
  margin: 0 0 16px;
  font-size: 0.95rem;
  font-weight: 700;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid ${({ active }) => (active ? "#0d9488" : "#e5e7eb")};
  background: ${({ active }) => (active ? "#0d9488" : "white")};
  color: ${({ active }) => (active ? "white" : "#6b7280")};
  transition: all 0.15s;
  &:hover { border-color: #0d9488; color: #0d9488; background: white; }
  ${({ active }) => active && `&:hover { color: white; background: #0d9488; }`}
`;

const TTBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 12px;
  background: #fff;
`;

const TableSelect = styled.select`
  height: 32px;
  width: 72px;
  padding: 0 8px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #1f2937;
  cursor: pointer;
  outline: none;
  &:focus {
    border-color: #0d9488;
  }
`;

const Pager = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-top: 1px solid #e5e7eb;
  font-size: 0.82rem;
  color: #6b7280;
  flex-wrap: wrap;
  gap: 8px;
  background: #fff;
`;

const PB = styled.button`
  height: 32px;
  padding: 0 14px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: ${(p) => (p.active ? "#0d9488" : "#fff")};
  color: ${(p) => (p.active ? "#fff" : "#374151")};
  cursor: pointer;
  transition: all 0.15s;
  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
  &:hover:not(:disabled) {
    background: ${(p) => (p.active ? "#0f766e" : "#f3f4f6")};
  }
`;

const SearchBox = styled.input`
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
  outline: none;
  min-width: 240px;
  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ status }) => {
    if (status === "approved") return "#d1fae5";
    if (status === "rejected") return "#fee2e2";
    return "#fef9c3";
  }};
  color: ${({ status }) => {
    if (status === "approved") return "#065f46";
    if (status === "rejected") return "#991b1b";
    return "#92400e";
  }};
`;

const ApproveBtn = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #059669; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const RejectBtn = styled.button`
  background: white;
  color: #ef4444;
  border: 1.5px solid #ef4444;
  border-radius: 5px;
  padding: 5px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #fee2e2; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const NotesInput = styled.input`
  padding: 5px 8px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  font-size: 0.82rem;
  width: 160px;
  outline: none;
  &:focus { border-color: #0d9488; }
`;

const VarianceChip = styled.span`
  font-size: 0.82rem;
  font-weight: 700;
  color: ${({ val }) => (val > 0 ? "#059669" : val < 0 ? "#dc2626" : "#6b7280")};
`;

const StatsRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: ${({ bg }) => bg || "#f0fdfa"};
  border: 1px solid ${({ border }) => border || "#99f6e4"};
  border-radius: 8px;
  padding: 10px 20px;
  min-width: 120px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ color }) => color || "#0d9488"};
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
`;

// ── Component ─────────────────────────────────────────────────────────────────

const PhysicalStockApproval = () => {
  const [entries, setEntries]   = useState([]);
  const [filter, setFilter]     = useState("pending");   // "all" | "pending" | "approved"
  const [notes, setNotes]       = useState({});          // { entry_id: noteText }
  const [loading, setLoading]   = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQ, setSearchQ]   = useState("");

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchEntries = useCallback(async (p = page, size = pageSize, q = searchQ, flt = filter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: p,
        page_size: size,
      });
      if (flt && flt !== "all") params.append("status", flt);
      if (q && q.trim()) params.append("search", q.trim());

      const response = await apiRequest(
        `${HmsBaseUrl}physical-stock-approval/?${params.toString()}`,
        "GET"
      );
      const payload = response?.data;
      const rows = payload?.data ?? (Array.isArray(payload) ? payload : (Array.isArray(response?.data) ? response.data : []));
      const all = Array.isArray(rows) ? rows : [];
      setEntries(all);
      const count = payload?.count !== undefined ? payload.count : (response?.count !== undefined ? response.count : all.length);
      setTotalCount(count);
      setTotalPages(payload?.total_pages || Math.ceil(count / size) || 1);
      setPage(payload?.current_page || p);
    } catch {
      toast.error("Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  }, [HmsBaseUrl, page, pageSize, searchQ, filter]);

  useEffect(() => {
    fetchEntries(page, pageSize, searchQ, filter);
  }, [page, pageSize, searchQ, filter]); // eslint-disable-line

  // ── Approve / Reject ───────────────────────────────────────────────────
  const handleAction = async (entry, action) => {
    setActionLoading(entry.entry_id);
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}physical-stock-approval/${entry.entry_id}/`,
        "PUT",
        {
          action,
          approval_notes: notes[entry.entry_id] || "",
        }
      );
      if (response && !response.error) {
        toast.success(
          action === "approve"
            ? `Batch ${entry.batch_number} approved ✅`
            : `Batch ${entry.batch_number} rejected`
        );
        fetchEntries(page, pageSize, searchQ, filter);
      } else {
        toast.error(response?.error || `${action} failed`);
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>

        {/* Header */}
        <PageHeader>
          <div>
            <PageTitle>✅ Physical Stock Approval</PageTitle>
            <PageSubtitle>Review and approve physical stock count entries</PageSubtitle>
          </div>
          <Button
            style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", color: "white", fontSize: "0.82rem", padding: "6px 14px" }}
            onClick={() => fetchEntries(page, pageSize, searchQ, filter)}
          >
            🔄 Refresh
          </Button>
        </PageHeader>

        <div style={{ padding: "20px 24px 0" }}>

          {/* Filter */}
          <FilterBar>
            <FilterButton
              active={filter === "all"}
              onClick={() => { setFilter("all"); setPage(1); }}
            >
              All
            </FilterButton>
            <FilterButton
              active={filter === "pending"}
              onClick={() => { setFilter("pending"); setPage(1); }}
            >
              Pending
            </FilterButton>
            <FilterButton
              active={filter === "approved"}
              onClick={() => { setFilter("approved"); setPage(1); }}
            >
              Approved
            </FilterButton>
          </FilterBar>

          <SectionTitle>
            Stock Entries
            <span style={{
              background: "#e5e7eb", color: "#6b7280",
              fontSize: "0.75rem", padding: "2px 10px", borderRadius: 12, fontWeight: 600, marginLeft: 8,
            }}>
              {totalCount}
            </span>
          </SectionTitle>
        </div>

        {/* TTBar and Table */}
        <div style={{ padding: "0 24px 24px" }}>
          <TTBar>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.85rem", color: "#4b5563" }}>Show</span>
              <TableSelect
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 25, 50, 100].map((sz) => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </TableSelect>
              <span style={{ fontSize: "0.85rem", color: "#4b5563" }}>entries</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SearchBox
                type="text"
                placeholder="Search item, batch, notes..."
                value={searchQ}
                onChange={(e) => {
                  setSearchQ(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </TTBar>

          {loading ? (
            <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>
              Loading entries...
            </div>
          ) : (
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Item Name</Th>
                    <Th>Batch No</Th>
                    <Th>Computer Stock</Th>
                    {/* Physical Stock shown only after approval */}
                    <Th>Physical Stock</Th>
                    <Th>Variance</Th>
                    <Th>Stock Date</Th>
                    <Th>Status</Th>
                    <Th>Approved By</Th>
                    <Th>Notes</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <Tr>
                      <Td colSpan="11" style={{ textAlign: "center", color: "#9ca3af" }}>
                        {filter === "pending" ? "No pending entries" : "No entries found"}
                      </Td>
                    </Tr>
                  ) : (
                    entries.map((entry, idx) => (
                      <Tr key={entry.entry_id || idx}>
                        <Td style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                          {(page - 1) * pageSize + idx + 1}
                        </Td>
                        <Td style={{ fontWeight: 600, color: "#0f766e" }}>
                          {entry.item_name}
                        </Td>
                        <Td>{entry.batch_number}</Td>
                        <Td style={{ textAlign: "center" }}>{entry.computer_stock}</Td>

                        {/* Physical Stock — hidden until approved */}
                        <Td style={{ textAlign: "center" }}>
                          {entry.is_approved ? (
                            <span style={{ fontWeight: 700, color: "#065f46" }}>
                              {entry.physical_stock}
                            </span>
                          ) : (
                            <span
                              title="Available after approval"
                              style={{
                                display: "inline-block",
                                background: "#f3f4f6",
                                color: "#9ca3af",
                                borderRadius: 4,
                                padding: "2px 10px",
                                fontSize: "0.8rem",
                                letterSpacing: "0.1em",
                              }}
                            >
                              ••••
                            </span>
                          )}
                        </Td>

                        {/* Variance — hidden until approved */}
                        <Td style={{ textAlign: "center" }}>
                          {entry.is_approved ? (
                            <VarianceChip val={entry.variance}>
                              {entry.variance > 0 ? "+" : ""}
                              {entry.variance}
                            </VarianceChip>
                          ) : (
                            <span style={{ color: "#d1d5db" }}>—</span>
                          )}
                        </Td>

                        <Td style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                          {entry.stock_date}
                        </Td>

                        <Td>
                          <StatusBadge status={entry.is_approved ? "approved" : "pending"}>
                            {entry.is_approved ? "Approved" : "Pending"}
                          </StatusBadge>
                        </Td>

                        <Td style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                          {entry.approved_by || "—"}
                        </Td>

                        <Td>
                          {!entry.is_approved && (
                            <NotesInput
                              placeholder="Approval note..."
                              value={notes[entry.entry_id] || ""}
                              onChange={(e) =>
                                setNotes((prev) => ({
                                  ...prev,
                                  [entry.entry_id]: e.target.value,
                                }))
                              }
                            />
                          )}
                          {entry.is_approved && (
                            <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                              {entry.approval_notes || "—"}
                            </span>
                          )}
                        </Td>

                        <Td>
                          {!entry.is_approved && (
                            <div style={{ display: "flex", gap: 6 }}>
                              <ApproveBtn
                                disabled={actionLoading === entry.entry_id}
                                onClick={() => handleAction(entry, "approve")}
                              >
                                {actionLoading === entry.entry_id ? "..." : "Approve"}
                              </ApproveBtn>
                              <RejectBtn
                                disabled={actionLoading === entry.entry_id}
                                onClick={() => handleAction(entry, "reject")}
                              >
                                Reject
                              </RejectBtn>
                            </div>
                          )}
                          {entry.is_approved && (
                            <span style={{ fontSize: "0.82rem", color: "#10b981", fontWeight: 600 }}>
                              ✅ Done
                            </span>
                          )}
                        </Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableWrapper>
          )}

          <Pager>
            <div>
              Showing {totalCount === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, totalCount)} of {totalCount} entries
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <PB
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </PB>
              {(() => {
                const pages = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (page > 3) pages.push("...");
                  const start = Math.max(2, page - 1);
                  const end = Math.min(totalPages - 1, page + 1);
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (page < totalPages - 2) pages.push("...");
                  pages.push(totalPages);
                }
                return pages.map((pNum, i) =>
                  pNum === "..." ? (
                    <span key={`dots-${i}`} style={{ padding: "0 6px", alignSelf: "center" }}>...</span>
                  ) : (
                    <PB
                      key={pNum}
                      active={page === pNum}
                      onClick={() => setPage(pNum)}
                    >
                      {pNum}
                    </PB>
                  )
                );
              })()}
              <PB
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </PB>
            </div>
          </Pager>
        </div>

      </Container>
    </PageWrapper>
  );
};

export default PhysicalStockApproval;