import React, { useState, useEffect } from "react";
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

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchEntries(); }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}physical-stock-approval/`,
        "GET"
      );
      setEntries(
        response && !response.error && Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch {
      toast.error("Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  };

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
        fetchEntries();
      } else {
        toast.error(response?.error || `${action} failed`);
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────
  const filtered = entries.filter((e) => {
    if (filter === "pending")  return !e.is_approved;
    if (filter === "approved") return e.is_approved;
    return true;
  });

  const pendingCount  = entries.filter((e) => !e.is_approved).length;
  const approvedCount = entries.filter((e) => e.is_approved).length;

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
            onClick={fetchEntries}
          >
            🔄 Refresh
          </Button>
        </PageHeader>

        <div style={{ padding: "20px 24px 0" }}>

          {/* Stats */}
          <StatsRow>
            <StatCard>
              <StatValue color="#0d9488">{entries.length}</StatValue>
              <StatLabel>Total Entries</StatLabel>
            </StatCard>
            <StatCard bg="#fef9c3" border="#fde68a">
              <StatValue color="#b45309">{pendingCount}</StatValue>
              <StatLabel>Pending</StatLabel>
            </StatCard>
            <StatCard bg="#d1fae5" border="#6ee7b7">
              <StatValue color="#065f46">{approvedCount}</StatValue>
              <StatLabel>Approved</StatLabel>
            </StatCard>
          </StatsRow>

          {/* Filter */}
          <FilterBar>
            <FilterButton active={filter === "all"}      onClick={() => setFilter("all")}>All</FilterButton>
            <FilterButton active={filter === "pending"}  onClick={() => setFilter("pending")}>
              Pending ({pendingCount})
            </FilterButton>
            <FilterButton active={filter === "approved"} onClick={() => setFilter("approved")}>
              Approved ({approvedCount})
            </FilterButton>
          </FilterBar>

          <SectionTitle>Stock Entries</SectionTitle>
        </div>

        {/* Table */}
        <div style={{ padding: "0 24px 24px" }}>
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
                  {filtered.length === 0 ? (
                    <Tr>
                      <Td colSpan="11" style={{ textAlign: "center", color: "#9ca3af" }}>
                        {filter === "pending" ? "No pending entries" : "No entries found"}
                      </Td>
                    </Tr>
                  ) : (
                    filtered.map((entry, idx) => (
                      <Tr key={entry.entry_id}>
                        <Td>{idx + 1}</Td>
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
        </div>

      </Container>
    </PageWrapper>
  );
};

export default PhysicalStockApproval;