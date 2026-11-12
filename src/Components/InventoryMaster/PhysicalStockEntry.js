import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container, PageWrapper, FormContent, InputWrapper, Label, Input,
  TableWrapper, Table, Th, Td, Tr,
} from "../GlobalStyles";
import styled from "styled-components";
import { InvTopToolbar, InvPagination, InvActionGroup, InvEditBtn, InvSaveBtn, getTodayDateString } from "./InventoryUIHelper";
import SearchSelect from "../Common/SearchSelect";

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

const SearchBar = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`;

const FetchButton = styled.button`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const SaveAllButton = styled.button`
  background: #0d9488;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #0f766e; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const ResetButton = styled.button`
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #f9fafb; }
`;

const AddEntryButton = styled.button`
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.25);
  &:hover { opacity: 0.92; }
`;

const FilterBar = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
`;

const FilterLeft = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
`;

const SearchInputBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
  background: #ffffff;
  height: 36px;
  min-width: 240px;
  &:focus-within {
    border-color: #0d9488;
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
  }
  & input {
    border: none;
    outline: none;
    padding: 0 10px;
    font-size: 0.86rem;
    flex: 1;
    min-width: 0;
    height: 100%;
  }
  & span {
    padding: 0 10px;
    color: #64748b;
    background: #f8fafc;
    border-left: 1px solid #e2e8f0;
    height: 100%;
    display: flex;
    align-items: center;
    font-size: 0.85rem;
  }
`;

const DateField = styled.input`
  height: 36px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.86rem;
  outline: none;
  background: #ffffff;
  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
  }
`;

const EntryPanel = styled.div`
  margin: 16px 24px;
  border: 1.5px solid #99f6e4;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.08);
  overflow: visible;
`;

const EntryPanelHeader = styled.div`
  background: #f0fdfa;
  border-bottom: 1px solid #ccfbf1;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px 8px 0 0;
`;

const VarianceChip = styled.span`
  font-weight: 700;
  font-size: 0.84rem;
  color: ${({ val }) => (val > 0 ? "#059669" : val < 0 ? "#dc2626" : "#64748b")};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ approved }) => (approved ? "#d1fae5" : "#fef9c3")};
  color: ${({ approved }) => (approved ? "#065f46" : "#92400e")};
`;

const PhysicalInput = styled.input`
  padding: 5px 8px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  font-size: 0.88rem;
  width: 90px;
  text-align: center;
  outline: none;
  background: ${({ disabled, edited }) => (disabled ? "#f1f5f9" : edited ? "#f0fdfa" : "white")};
  color: ${({ disabled }) => (disabled ? "#475569" : "#0f172a")};
  border-color: ${({ disabled, edited }) => (disabled ? "#e2e8f0" : edited ? "#0d9488" : "#d1d5db")};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "text")};
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 2px rgba(13,148,136,0.1); }
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

const InfoBox = styled.div`
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 6px;
  padding: 10px 16px;
  color: #0f766e;
  font-size: 0.85rem;
  margin-bottom: 12px;
`;

// ── Component ─────────────────────────────────────────────────────────────────

const getMonthStartDateString = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
};

const formatDisplayDate = (val) => {
  if (!val) return "—";
  const s = String(val).slice(0, 10);
  const parts = s.split("-");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return s;
};

const PhysicalStockEntry = () => {
  const [showEntryForm, setShowEntryForm] = useState(false);

  // ── Date-wise History List state ──────────────────────────────────────
  const [historyRows, setHistoryRows]       = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [filterSearch, setFilterSearch]     = useState("");
  const [fromDate, setFromDate]             = useState(getMonthStartDateString());
  const [toDate, setToDate]                 = useState(getTodayDateString());
  const [histPage, setHistPage]             = useState(1);
  const [histPageSize, setHistPageSize]     = useState(10);
  const [histTotalCount, setHistTotalCount] = useState(0);
  const [histTotalPages, setHistTotalPages] = useState(1);

  // ── Entry Form state ──────────────────────────────────────────────────
  const [medicines, setMedicines]           = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [, setBatches]                      = useState([]);   // fetched from API
  const [rows, setRows]                     = useState([]);   // working rows
  const [editingIdx, setEditingIdx]         = useState(null);
  const [loading, setLoading]               = useState(false);
  const [saving, setSaving]                 = useState(false);
  const physicalInputRefs                   = useRef({});

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const today = new Date().toISOString().split("T")[0];

  // ── Fetch date-wise Physical Stock Entries ────────────────────────────
  const fetchHistory = useCallback(async (
    p = histPage,
    size = histPageSize,
    q = filterSearch,
    fDate = fromDate,
    tDate = toDate
  ) => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({
        page: p,
        page_size: size,
      });
      if (q && q.trim()) params.append("search", q.trim());
      if (fDate) params.append("from_date", fDate);
      if (tDate) params.append("to_date", tDate);

      const response = await apiRequest(
        `${HmsBaseUrl}physical-stock-entry/?${params.toString()}`,
        "GET"
      );
      const payload = response?.data;
      const list = payload?.data ?? (Array.isArray(payload) ? payload : []);
      const normalized = Array.isArray(list) ? list : [];
      setHistoryRows(normalized);
      const count = payload?.count !== undefined ? payload.count : normalized.length;
      setHistTotalCount(count);
      setHistTotalPages(payload?.total_pages || Math.max(1, Math.ceil(count / size)));
      setHistPage(payload?.current_page || p);
    } catch {
      toast.error("Failed to fetch physical stock entries");
    } finally {
      setHistoryLoading(false);
    }
  }, [HmsBaseUrl, histPage, histPageSize, filterSearch, fromDate, toDate]);

  useEffect(() => {
    fetchHistory(histPage, histPageSize, filterSearch, fromDate, toDate);
  }, [histPage, histPageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load medicine master for searchable dropdown ──────────────────────
  const fetchMedicines = useCallback(async () => {
    try {
      const r = await apiRequest(`${HmsBaseUrl}pharmacy_items/`, "GET");
      const payload = r?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.results)
        ? payload.results
        : [];
      const sorted = (Array.isArray(list) ? list : [])
        .map((m) => ({
          ...m,
          item_name: m.item_name ? String(m.item_name).toUpperCase() : m.item_name,
          item_last_name: m.item_last_name ? String(m.item_last_name).toUpperCase() : m.item_last_name,
        }))
        .sort((a, b) =>
          String(a.item_name || "").localeCompare(String(b.item_name || ""), undefined, { sensitivity: "base" })
        );
      if (r?.success) setMedicines(sorted);
    } catch {
      // keep dropdown empty on error
    }
  }, [HmsBaseUrl]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const medicineOptions = useMemo(
    () =>
      medicines.map((m) => ({
        value: String(m.item_id),
        label: `${String(m.item_name || "").toUpperCase()} ${String(m.item_last_name || "").toUpperCase()}`.trim(),
        sub: m.hsn ? `HSN:${m.hsn}` : "",
      })),
    [medicines]
  );

  // ── Fetch active GRN batches for selected medicine ────────────────────
  const handleFetch = useCallback(async (itemIdOverride) => {
    const targetId = String(itemIdOverride ?? selectedItemId ?? "").trim();
    if (!targetId) {
      toast.warning("Select a medicine to load batches");
      return;
    }
    setLoading(true);
    setEditingIdx(null);
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}pharmacy-stock-batches/?item_id=${encodeURIComponent(targetId)}`,
        "GET"
      );
      const payload = response?.data;
      const data = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);

      if (data.length === 0) {
        toast.info("No active GRN batches found for this medicine");
        setBatches([]);
        setRows([]);
        return;
      }

      setBatches(data);
      // Pre-fill Physical Stock with current system Computer Stock; locked until Edit is clicked
      setRows(
        data.map((b) => ({
          ...b,
          physical_stock: String(b.computer_stock ?? 0),
          stock_date: today,
          saved: false,
          dirty: false,
          entry_id: null,
        }))
      );
    } catch {
      toast.error("Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  }, [HmsBaseUrl, selectedItemId, today]);

  const handleMedicineSelect = (e) => {
    const val = String(e.target.value || "").trim();
    setSelectedItemId(val);
    setPage(1);
    setEditingIdx(null);
    if (!val) {
      setBatches([]);
      setRows([]);
      return;
    }
    handleFetch(val);
  };

  // ── Row field change ───────────────────────────────────────────────────
  const handleRowChange = (idx, field, value) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value, dirty: true, saved: false } : r))
    );
  };

  // ── Unlock row for editing ────────────────────────────────────────────
  const handleEditRow = (idx) => {
    setEditingIdx(idx);
    setTimeout(() => {
      const el = physicalInputRefs.current[idx];
      if (el) {
        el.focus();
        el.select();
      }
    }, 20);
  };

  // ── Save single row ────────────────────────────────────────────────────
  const handleSaveRow = async (idx) => {
    const row = rows[idx];
    if (row.physical_stock === "" || row.physical_stock === null || Number.isNaN(Number(row.physical_stock))) {
      toast.warning("Enter physical stock before saving");
      return;
    }
    if (Number(row.physical_stock) < 0) {
      toast.warning("Physical stock cannot be negative");
      return;
    }
    try {
      const payload = {
        item_id:        row.item_id,
        item_name:      row.item_name,
        batch_number:   row.batch_number,
        stock_id:       row.stock_id,
        computer_stock: row.computer_stock,
        physical_stock: Number(row.physical_stock),
        stock_date:     row.stock_date || today,
      };

      let response;
      if (row.entry_id) {
        response = await apiRequest(
          `${HmsBaseUrl}physical-stock-entry/${row.entry_id}/`,
          "PUT",
          payload
        );
      } else {
        response = await apiRequest(
          `${HmsBaseUrl}physical-stock-entry/`,
          "POST",
          payload
        );
      }

      if (response && response.success !== false && !response.error) {
        const saved = response.data || response;
        toast.success(`Batch ${row.batch_number} saved for approval`);
        setRows((prev) =>
          prev.map((r, i) =>
            i === idx
              ? {
                  ...r,
                  physical_stock: String(Number(row.physical_stock)),
                  saved: true,
                  dirty: false,
                  entry_id: saved.entry_id ?? r.entry_id,
                }
              : r
          )
        );
        setEditingIdx(null);
        fetchHistory(1, histPageSize, filterSearch, fromDate, toDate);
      } else {
        toast.error(response?.error || "Save failed");
      }
    } catch {
      toast.error("Failed to save entry");
    }
  };

  // ── Save all edited rows at once ──────────────────────────────────────
  const handleSaveAll = async () => {
    const toSave = rows.filter(
      (r) => r.dirty && r.physical_stock !== "" && r.physical_stock !== null
    );
    if (toSave.length === 0) {
      toast.warning("No edited rows to save");
      return;
    }
    setSaving(true);
    try {
      const payload = toSave.map((r) => ({
        item_id:        r.item_id,
        item_name:      r.item_name,
        batch_number:   r.batch_number,
        stock_id:       r.stock_id,
        computer_stock: r.computer_stock,
        physical_stock: Number(r.physical_stock),
        stock_date:     r.stock_date || today,
      }));

      const response = await apiRequest(
        `${HmsBaseUrl}physical-stock-entry/`,
        "POST",
        payload
      );

      if (response && response.success !== false && !response.error) {
        const savedList = Array.isArray(response.data) ? response.data : [response.data];
        toast.success(`${savedList.length} entries saved for approval`);

        const savedByStockId = new Map(savedList.map((s) => [String(s.stock_id || s.batch_number), s]));
        setRows((prev) =>
          prev.map((r) => {
            const match = savedByStockId.get(String(r.stock_id || r.batch_number));
            if (!match) return r;
            return {
              ...r,
              saved: true,
              dirty: false,
              entry_id: match.entry_id ?? r.entry_id,
            };
          })
        );
        setEditingIdx(null);
        fetchHistory(1, histPageSize, filterSearch, fromDate, toDate);
      } else {
        toast.error(response?.error || "Save failed");
      }
    } catch {
      toast.error("Failed to save entries");
    } finally {
      setSaving(false);
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSelectedItemId("");
    setBatches([]);
    setRows([]);
    setEditingIdx(null);
  };

  const unsavedCount = rows.filter(
    (r) => r.dirty && r.physical_stock !== "" && r.physical_stock !== null
  ).length;

  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalBatches = rows.length;
  const totalPages   = Math.max(1, Math.ceil(totalBatches / pageSize));
  const pagedRows    = rows.slice((page - 1) * pageSize, page * pageSize);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>

        {/* Header */}
        <PageHeader style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <PageTitle>📦 Physical Stock Entry</PageTitle>
            <PageSubtitle>View date-wise physical stock entries or record new batch counts</PageSubtitle>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AddEntryButton
              type="button"
              onClick={() => setShowEntryForm((prev) => !prev)}
            >
              {showEntryForm ? "✕ Close Entry" : "+ Physical Stock Entry"}
            </AddEntryButton>
          </div>
        </PageHeader>

        {/* Collapsible Physical Stock Entry Form */}
        {showEntryForm && (
          <EntryPanel>
            <EntryPanelHeader>
              <SectionTitle style={{ margin: 0 }}>
                📦 New Physical Stock Entry
              </SectionTitle>
              <ResetButton
                type="button"
                style={{ padding: "5px 12px", fontSize: "0.82rem" }}
                onClick={() => setShowEntryForm(false)}
              >
                ✕ Close
              </ResetButton>
            </EntryPanelHeader>

            <FormContent style={{ paddingBottom: 14 }}>
              <SearchBar>
                <InputWrapper style={{ margin: 0, minWidth: 340, flex: "0 1 420px" }}>
                  <Label>Medicine Name</Label>
                  <SearchSelect
                    name="item_id"
                    value={selectedItemId}
                    onChange={handleMedicineSelect}
                    options={medicineOptions}
                    placeholder="Search & select medicine..."
                    style={{ fontSize: "0.88rem" }}
                  />
                </InputWrapper>
                <FetchButton onClick={() => { setPage(1); handleFetch(); }} disabled={loading || !selectedItemId}>
                  🔍 {loading ? "Fetching..." : "Fetch"}
                </FetchButton>
                <ResetButton onClick={() => { setPage(1); handleReset(); }}>Reset</ResetButton>
              </SearchBar>
            </FormContent>

            {rows.length > 0 && (
              <div style={{ padding: "0 24px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <SectionTitle style={{ margin: 0, textTransform: "uppercase" }}>
                    Batch List — {rows[0]?.item_name ? String(rows[0].item_name).toUpperCase() : ""}
                    <span style={{
                      background: "#e5e7eb", color: "#6b7280",
                      fontSize: "0.75rem", padding: "2px 10px", borderRadius: 12, fontWeight: 600, marginLeft: 8,
                    }}>
                      {totalBatches}
                    </span>
                  </SectionTitle>
                  <div style={{ display: "flex", gap: 10 }}>
                    {unsavedCount > 0 && (
                      <SaveAllButton onClick={handleSaveAll} disabled={saving}>
                        {saving ? "Saving..." : `💾 Save All (${unsavedCount})`}
                      </SaveAllButton>
                    )}
                  </div>
                </div>

                <InfoBox>
                  ℹ️ Batches are ordered by most recently added GRN. Click <strong>Edit</strong> on a batch row to update Physical Stock, then click <strong>Save</strong>. Pharmacy <code>total_stock</code> will update after manager approval.
                </InfoBox>

                <InvTopToolbar
                  pageSize={pageSize}
                  onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
                  totalRecords={totalBatches}
                />

                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Product Sl No</Th>
                        <Th>GRN No</Th>
                        <Th>Batch No</Th>
                        <Th>Computer Stock</Th>
                        <Th>Physical Stock</Th>
                        <Th>Stock Date</Th>
                        <Th style={{ textAlign: "center" }}>Action</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRows.map((row, pIdx) => {
                        const idx = (page - 1) * pageSize + pIdx;
                        const isRowEditing = editingIdx === idx;
                        return (
                          <Tr key={`${row.stock_id || row.batch_number}-${idx}`}>
                            <Td>
                              <Input
                                value={row.stock_id ?? (idx + 1)}
                                readOnly
                                style={{ background: "#f1f5f9", color: "#475569", width: 85, borderColor: "#e2e8f0" }}
                              />
                            </Td>
                            <Td style={{ fontSize: "0.84rem", color: "#334155", fontWeight: 600 }}>
                              {row.grn_number || "—"}
                            </Td>
                            <Td>
                              <Input
                                value={row.batch_number}
                                readOnly
                                style={{ background: "#f1f5f9", color: "#475569", width: 130, borderColor: "#e2e8f0" }}
                              />
                            </Td>
                            <Td>
                              <Input
                                value={row.computer_stock}
                                readOnly
                                style={{ background: "#f1f5f9", color: "#475569", width: 90, textAlign: "center", borderColor: "#e2e8f0" }}
                              />
                            </Td>
                            <Td>
                              <PhysicalInput
                                ref={(el) => { physicalInputRefs.current[idx] = el; }}
                                type="number"
                                value={row.physical_stock}
                                edited={isRowEditing ? 1 : 0}
                                disabled={!isRowEditing}
                                onChange={(e) =>
                                  handleRowChange(idx, "physical_stock", e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && isRowEditing) {
                                    handleSaveRow(idx);
                                  }
                                }}
                                placeholder="Enter"
                              />
                            </Td>
                            <Td>
                              <input
                                type="date"
                                value={row.stock_date}
                                disabled
                                style={{
                                  padding: "5px 8px",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: 5,
                                  fontSize: "0.85rem",
                                  outline: "none",
                                  background: "#f1f5f9",
                                  color: "#475569",
                                  cursor: "not-allowed",
                                }}
                              />
                            </Td>
                            <Td style={{ textAlign: "center" }}>
                              <InvActionGroup>
                                <InvSaveBtn
                                  size={16}
                                  title={isRowEditing ? "Save physical stock" : "Click Edit first"}
                                  disabled={!isRowEditing}
                                  style={{
                                    opacity: isRowEditing ? 1 : 0.35,
                                    cursor: isRowEditing ? "pointer" : "not-allowed",
                                  }}
                                  onClick={() => isRowEditing && handleSaveRow(idx)}
                                />
                                <InvEditBtn
                                  size={16}
                                  title="Edit Physical Stock"
                                  onClick={() => handleEditRow(idx)}
                                />
                              </InvActionGroup>
                            </Td>
                          </Tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </TableWrapper>

                <InvPagination
                  currentPage={page}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalRecords={totalBatches}
                  onPageChange={setPage}
                />
              </div>
            )}

            {rows.length === 0 && !loading && (
              <div style={{ padding: "12px 24px 24px", textAlign: "center", color: "#9ca3af", fontSize: "0.88rem" }}>
                Search and select a medicine above to load active GRN batches.
              </div>
            )}
          </EntryPanel>
        )}

        {/* Date-wise Physical Stock Entry List */}
        <div style={{ padding: "16px 24px 24px" }}>
          <InvTopToolbar
            pageSize={histPageSize}
            onPageSizeChange={(sz) => {
              setHistPageSize(sz);
              setHistPage(1);
            }}
            fromDate={fromDate}
            toDate={toDate}
            onFromDateChange={(val) => {
              setFromDate(val);
              setHistPage(1);
              fetchHistory(1, histPageSize, filterSearch, val, toDate);
            }}
            onToDateChange={(val) => {
              setToDate(val);
              setHistPage(1);
              fetchHistory(1, histPageSize, filterSearch, fromDate, val);
            }}
            onSetToday={() => {
              const t = getTodayDateString();
              setFromDate(t);
              setToDate(t);
              setHistPage(1);
              fetchHistory(1, histPageSize, filterSearch, t, t);
            }}
            onClearDate={() => {
              setFromDate("");
              setToDate("");
              setHistPage(1);
              fetchHistory(1, histPageSize, filterSearch, "", "");
            }}
            search={filterSearch}
            onSearchChange={(val) => {
              setFilterSearch(val);
              setHistPage(1);
              fetchHistory(1, histPageSize, val, fromDate, toDate);
            }}
            searchPlaceholder="Search product / batch..."
            totalRecords={histTotalCount}
          />

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th style={{ width: 60 }}>#</Th>
                  <Th>Stock Date</Th>
                  <Th>Product Name</Th>
                  <Th>Batch No</Th>
                  <Th>Stock ID</Th>
                  <Th style={{ textAlign: "center" }}>Computer Stock</Th>
                  <Th style={{ textAlign: "center" }}>Physical Stock</Th>
                  <Th style={{ textAlign: "center" }}>Variance</Th>
                  <Th>Entered By</Th>
                  <Th style={{ textAlign: "center" }}>Status</Th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr>
                    <Td colSpan={10} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      Loading physical stock entries...
                    </Td>
                  </tr>
                ) : historyRows.length === 0 ? (
                  <tr>
                    <Td colSpan={10} style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                      No physical stock entries found for the selected date range.
                    </Td>
                  </tr>
                ) : (
                  historyRows.map((entry, idx) => {
                    const varianceVal = Number(entry.variance ?? (Number(entry.physical_stock || 0) - Number(entry.computer_stock || 0)));
                    return (
                      <Tr key={entry.entry_id || entry._id || idx}>
                        <Td>{(histPage - 1) * histPageSize + idx + 1}</Td>
                        <Td style={{ fontWeight: 600, color: "#334155", whiteSpace: "nowrap" }}>
                          {formatDisplayDate(entry.stock_date || entry.created_date)}
                        </Td>
                        <Td style={{ fontWeight: 600, textTransform: "uppercase" }}>
                          {entry.item_name || "—"}
                        </Td>
                        <Td>{entry.batch_number || "—"}</Td>
                        <Td style={{ color: "#64748b" }}>{entry.stock_id ?? "—"}</Td>
                        <Td style={{ textAlign: "center" }}>{entry.computer_stock ?? 0}</Td>
                        <Td style={{ textAlign: "center", fontWeight: 700, color: "#0f766e" }}>
                          {entry.physical_stock ?? 0}
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          <VarianceChip val={varianceVal}>
                            {varianceVal > 0 ? `+${varianceVal}` : varianceVal}
                          </VarianceChip>
                        </Td>
                        <Td style={{ fontSize: "0.84rem", color: "#475569" }}>
                          {entry.created_by_name || entry.created_by || "—"}
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          <StatusBadge approved={entry.is_approved ? 1 : 0}>
                            {entry.is_approved ? "Approved" : "Saved"}
                          </StatusBadge>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </TableWrapper>

          <InvPagination
            currentPage={histPage}
            totalPages={histTotalPages}
            pageSize={histPageSize}
            totalRecords={histTotalCount}
            onPageChange={setHistPage}
          />
        </div>

      </Container>
    </PageWrapper>
  );
};

export default PhysicalStockEntry;