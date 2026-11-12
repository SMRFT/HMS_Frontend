import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container, PageWrapper,
  TableWrapper, Table, Th, Td, Tr,
  Button,
} from "../GlobalStyles";
import styled from "styled-components";
import {  InvTopToolbar, InvPagination, getTodayDateString , useInvDropMenu, InvDropBtn, InvDropMenu, InvMenuItem, InvCodePill, InvStatusBadge } from "./InventoryUIHelper";

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
// ── Component ─────────────────────────────────────────────────────────────────

const PhysicalStockApproval = () => {
  const { openId: menuOpenId, menuPos, openMenu, closeMenu } = useInvDropMenu();
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
  const [fromDate, setFromDate] = useState(getTodayDateString());
  const [toDate, setToDate]     = useState(getTodayDateString());

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
      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);

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
  }, [HmsBaseUrl, page, pageSize, searchQ, filter, fromDate, toDate]);

  useEffect(() => {
    fetchEntries(page, pageSize, searchQ, filter);
  }, [page, pageSize, searchQ, filter, fromDate, toDate]); // eslint-disable-line

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

        <div style={{ padding: "16px 24px 0" }}>
          <InvTopToolbar
            pageSize={pageSize}
            onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
            search={searchQ}
            onSearchChange={(q) => { setSearchQ(q); setPage(1); }}
            searchPlaceholder="Search item, batch, notes..."
            fromDate={fromDate}
            toDate={toDate}
            onFromDateChange={(d) => { setFromDate(d); setPage(1); }}
            onToDateChange={(d) => { setToDate(d); setPage(1); }}
            onClearDate={() => { setFromDate(""); setToDate(""); setPage(1); }}
            onSetToday={() => { const t = getTodayDateString(); setFromDate(t); setToDate(t); setPage(1); }}
            totalRecords={totalCount}
            customFilters={
              <select
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                style={{
                  height: 30,
                  padding: "0 10px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f766e",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="all">All</option>
              </select>
            }
          />
        </div>
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
                          {entry.approved_by_name || entry.approved_by || "-"}
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

                        <Td style={{ textAlign: "center" }}>
                          <InvDropBtn onClick={(e) => openMenu(e, entry.entry_id)} title="Actions">
                            ⋮
                          </InvDropBtn>
                        </Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableWrapper>
          )}

          <InvPagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalRecords={totalCount}
            onPageChange={setPage}
          />
        </div>

      </Container>
      {/* ══ Action Dropdown (Admission / PO style) ══ */}
      {menuOpenId && (() => {
        const entry = entries.find((e) => e.entry_id === menuOpenId);
        if (!entry) return null;
        return (
          <InvDropMenu {...menuPos}>
            {!entry.is_approved ? (
              <>
                <InvMenuItem
                  $success
                  onClick={() => {
                    closeMenu();
                    handleAction(entry, "approve");
                  }}
                >
                  ✔ Approve Entry
                </InvMenuItem>
                <InvMenuItem
                  danger
                  onClick={() => {
                    closeMenu();
                    handleAction(entry, "reject");
                  }}
                >
                  ✕ Reject Entry
                </InvMenuItem>
              </>
            ) : (
              <InvMenuItem disabled>
                🔒 Already Approved
              </InvMenuItem>
            )}
          </InvDropMenu>
        );
      })()}

    </PageWrapper>
  );
};

export default PhysicalStockApproval;