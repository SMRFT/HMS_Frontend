import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container, PageWrapper, FormContent, FormRow,
  InputWrapper, Label, Input, Button, ButtonContainer,
  TableWrapper, Table, Th, Td, Tr,
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

const SearchBar = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 280px;
  outline: none;
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 2px rgba(13,148,136,0.15); }
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
  background: ${({ edited }) => (edited ? "#f0fdfa" : "white")};
  border-color: ${({ edited }) => (edited ? "#0d9488" : "#d1d5db")};
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 2px rgba(13,148,136,0.1); }
`;

const ActionIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ color }) => color || "#0d9488"};
  font-size: 1rem;
  padding: 4px 6px;
  border-radius: 4px;
  &:hover { background: #f0fdfa; }
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

const PhysicalStockEntry = () => {
  const [searchName, setSearchName]   = useState("");
  const [batches, setBatches]         = useState([]);   // fetched from API
  const [rows, setRows]               = useState([]);   // working rows (editable)
  const [editingIdx, setEditingIdx]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const searchRef = useRef(null);

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const today = new Date().toISOString().split("T")[0];

  // ── Fetch batches ──────────────────────────────────────────────────────
  const handleFetch = async () => {
    if (!searchName.trim()) {
      toast.warning("Enter a medicine name to search");
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}pharmacy-stock-batches/?item_name=${encodeURIComponent(searchName.trim())}`,
        "GET"
      );
      const data = response && !response.error && Array.isArray(response.data)
        ? response.data
        : [];

      if (data.length === 0) {
        toast.info("No batches found for this medicine");
        setBatches([]);
        setRows([]);
        return;
      }

      setBatches(data);
      // Initialise rows — physical_stock starts empty (null)
      setRows(
        data.map((b) => ({
          ...b,
          physical_stock: "",
          stock_date: today,
          saved: false,
          entry_id: null,
        }))
      );
    } catch {
      toast.error("Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  };

  // ── Row field change ───────────────────────────────────────────────────
  const handleRowChange = (idx, field, value) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  // ── Save single row ────────────────────────────────────────────────────
  const handleSaveRow = async (idx) => {
    const row = rows[idx];
    if (row.physical_stock === "" || row.physical_stock === null) {
      toast.warning("Enter physical stock before saving");
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
        // update existing
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

      if (response && !response.error) {
        const saved = response.data || response;
        toast.success(`Batch ${row.batch_number} saved`);
        setRows((prev) =>
          prev.map((r, i) =>
            i === idx
              ? { ...r, saved: true, entry_id: saved.entry_id ?? r.entry_id }
              : r
          )
        );
        setEditingIdx(null);
      } else {
        toast.error(response?.error || "Save failed");
      }
    } catch {
      toast.error("Failed to save entry");
    }
  };

  // ── Save all rows at once ──────────────────────────────────────────────
  const handleSaveAll = async () => {
    const toSave = rows.filter(
      (r) => !r.saved && r.physical_stock !== "" && r.physical_stock !== null
    );
    if (toSave.length === 0) {
      toast.warning("No unsaved rows with physical stock entered");
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

      if (response && !response.error) {
        const savedList = Array.isArray(response.data) ? response.data : [response.data];
        toast.success(`${savedList.length} entries saved successfully`);

        // Mark saved rows
        const savedBatches = new Set(savedList.map((s) => s.batch_number));
        setRows((prev) =>
          prev.map((r) =>
            savedBatches.has(r.batch_number) ? { ...r, saved: true } : r
          )
        );
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
    setSearchName("");
    setBatches([]);
    setRows([]);
    setEditingIdx(null);
    if (searchRef.current) searchRef.current.focus();
  };

  const unsavedCount = rows.filter(
    (r) => !r.saved && r.physical_stock !== "" && r.physical_stock !== null
  ).length;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>

        {/* Header */}
        <PageHeader>
          <div>
            <PageTitle>📦 Physical Stock Entry</PageTitle>
            <PageSubtitle>Search medicine and record physical stock counts</PageSubtitle>
          </div>
        </PageHeader>

        {/* Search */}
        <FormContent>
          <SectionTitle>Search Medicine</SectionTitle>
          <SearchBar>
            <InputWrapper style={{ margin: 0 }}>
              <Label>Product Name</Label>
              <SearchInput
                ref={searchRef}
                type="text"
                placeholder="Type medicine name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              />
            </InputWrapper>
            <FetchButton onClick={handleFetch} disabled={loading}>
              🔍 {loading ? "Fetching..." : "Fetch"}
            </FetchButton>
            <ResetButton onClick={handleReset}>Reset</ResetButton>
          </SearchBar>
        </FormContent>

        {/* Table */}
        {rows.length > 0 && (
          <div style={{ padding: "0 24px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <SectionTitle style={{ margin: 0 }}>
                Batch List — {rows[0]?.item_name}
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
              ℹ️ Computer Stock = Total Stock − Sold − Transferred Out − GRN Return − Blocked + Sales Return. Enter Physical Stock manually. Entries will be visible after manager approval.
            </InfoBox>

            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Batch No</Th>
                    <Th>Expiry Date</Th>
                    <Th>Computer Stock</Th>
                    <Th>Physical Stock</Th>
                    <Th>Stock Date</Th>
                    <Th>Status</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const isEditing = editingIdx === idx || !row.saved;
                    return (
                      <Tr key={`${row.batch_number}-${idx}`}>
                        <Td>{idx + 1}</Td>
                        <Td>
                          <Input
                            value={row.batch_number}
                            readOnly
                            style={{ background: "#f9fafb", width: 120 }}
                          />
                        </Td>
                        <Td style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                          {row.expiry_date || "—"}
                        </Td>
                        <Td>
                          <Input
                            value={row.computer_stock}
                            readOnly
                            style={{ background: "#f9fafb", width: 90, textAlign: "center" }}
                          />
                        </Td>
                        <Td>
                          <PhysicalInput
                            type="number"
                            min="0"
                            value={row.physical_stock}
                            edited={row.physical_stock !== "" ? 1 : 0}
                            disabled={row.saved && editingIdx !== idx}
                            onChange={(e) =>
                              handleRowChange(idx, "physical_stock", e.target.value)
                            }
                            placeholder="Enter"
                          />
                        </Td>
                        <Td>
                          <input
                            type="date"
                            value={row.stock_date}
                            disabled={row.saved && editingIdx !== idx}
                            onChange={(e) =>
                              handleRowChange(idx, "stock_date", e.target.value)
                            }
                            style={{
                              padding: "5px 8px",
                              border: "1px solid #d1d5db",
                              borderRadius: 5,
                              fontSize: "0.85rem",
                              outline: "none",
                            }}
                          />
                        </Td>
                        <Td>
                          {row.saved ? (
                            <StatusBadge approved={0}>Pending Approval</StatusBadge>
                          ) : (
                            <StatusBadge>Unsaved</StatusBadge>
                          )}
                        </Td>
                        <Td>
                          <div style={{ display: "flex", gap: 4 }}>
                            {/* Save icon */}
                            <ActionIcon
                              title="Save this row"
                              color="#0d9488"
                              onClick={() => handleSaveRow(idx)}
                            >
                              💾
                            </ActionIcon>
                            {/* Edit icon — re-enable editing for saved row */}
                            {row.saved && (
                              <ActionIcon
                                title="Edit"
                                color="#0d9488"
                                onClick={() => {
                                  setRows((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, saved: false } : r
                                    )
                                  );
                                  setEditingIdx(idx);
                                }}
                              >
                                ✏️
                              </ActionIcon>
                            )}
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>
          </div>
        )}

        {rows.length === 0 && !loading && (
          <div style={{ padding: "32px 24px", textAlign: "center", color: "#9ca3af", fontSize: "0.9rem" }}>
            Search a medicine name above and click <strong>Fetch</strong> to load batches.
          </div>
        )}

      </Container>
    </PageWrapper>
  );
};

export default PhysicalStockEntry;