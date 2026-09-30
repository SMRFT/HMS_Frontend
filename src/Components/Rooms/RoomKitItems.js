import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container, PageWrapper, FormContent, FormRow,
  InputWrapper, Label, Input, Button, ButtonContainer,
  TableWrapper, Table, Th, Td, Tr, SectionHeader,
} from "../GlobalStyles";
import styled from "styled-components";

const PageHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  padding: 11px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px 6px 0 0;
  margin-bottom: 16px;
`;
const PageTitle = styled.h2`
  font-size: .92rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: .04em;
`;

const TTBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const TableSelect = styled.select`
  height: 28px;
  width: 72px;
  padding: 0 6px;
  font-size: .75rem;
  font-weight: 600;
  border: 1px solid #d1d5db;
  border-radius: 4px;
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
  padding: 12px 0;
  border-top: 1px solid #e5e7eb;
  font-size: .75rem;
  color: #6b7280;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const PB = styled.button`
  height: 28px;
  padding: 0 13px;
  font-size: .75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: ${p => p.active ? '#0d9488' : '#fff'};
  color: ${p => p.active ? '#fff' : '#374151'};
  cursor: pointer;
  &:disabled {
    opacity: .45;
    cursor: default;
  }
  &:hover:not(:disabled) {
    background: ${p => p.active ? '#0d9488' : '#f3f4f6'};
  }
`;

const RoomKitItems = () => {
  const [kitItems, setKitItems]   = useState([]);
  const [formData, setFormData]   = useState({ kit_name: "" });
  const [editingId, setEditingId] = useState(null);
  const [page, setPage]           = useState(1);
  const [perPage, setPerPage]     = useState(10);
  const [tSearch, setTSearch]     = useState("");

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchKitItems(); }, []);

  const fetchKitItems = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}room-kititems/`, "GET");
      setKitItems(response && !response.error && Array.isArray(response.data)
        ? response.data : []);
    } catch {
      toast.error("Failed to fetch room kit items");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (item) => {
    setEditingId(item.kit_id);
    setFormData({ kit_name: item.kit_name });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Are you sure you want to delete this kit item?")) return;
    try {
      const response = await apiRequest(`${HmsBaseUrl}room-kititems/${item.kit_id}/`, "DELETE");
      if (response && !response.error) {
        toast.success("Kit item deleted successfully");
        fetchKitItems();
      } else {
        toast.error(response?.error || "Failed to delete kit item");
      }
    } catch {
      toast.error("Failed to delete kit item");
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({ kit_name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await apiRequest(`${HmsBaseUrl}room-kititems/${editingId}/`, "PUT", formData);
        if (response && !response.error) {
          toast.success("Kit item updated successfully");
          handleReset();
          fetchKitItems();
        } else {
          toast.error(response?.error || "Update failed");
        }
      } else {
        const response = await apiRequest(`${HmsBaseUrl}room-kititems/`, "POST", formData);
        if (response && !response.error) {
          toast.success("Kit item added successfully");
          handleReset();
          fetchKitItems();
        } else {
          toast.error(response?.error || "Create failed");
        }
      }
    } catch {
      toast.error("Failed to save kit item");
    }
  };

  const getPaginationItems = (currentPage, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", total];
    }
    if (currentPage >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", total];
  };

  const filtered = useMemo(() => {
    if (!tSearch.trim()) return kitItems;
    const q = tSearch.toLowerCase().trim();
    return kitItems.filter((k) =>
      String(k.kit_id || "").toLowerCase().includes(q) ||
      String(k.kit_name || "").toLowerCase().includes(q)
    );
  }, [kitItems, tSearch]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  return (
    <PageWrapper>
      <Container>
        <PageHeader>
          <PageTitle>🏥 Room Kit Items Management</PageTitle>
        </PageHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow columns="1fr">
              <InputWrapper>
                <Label required>Kit Name</Label>
                <Input
                  type="text"
                  name="kit_name"
                  value={formData.kit_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter Kit Name"
                />
              </InputWrapper>
            </FormRow>

            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>Reset</Button>
              <Button type="submit">
                {editingId ? "Update Kit Item" : "Add Kit Item"}
              </Button>
            </ButtonContainer>
          </form>
        </FormContent>

        <div style={{ padding: "0 24px 24px" }}>
          <h4 style={{ color: "#0d9488", marginBottom: "12px" }}>Room Kit Items List</h4>

          {/* ── Table Controls ── */}
          <TTBar>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".75rem", color: "#6b7280" }}>
              Show up to&nbsp;
              <TableSelect value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
                {[10, 15, 20, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </TableSelect>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".75rem", color: "#6b7280" }}>
              Search:&nbsp;
              <input
                value={tSearch}
                onChange={e => { setTSearch(e.target.value); setPage(1); }}
                placeholder="Search Kit ID / Name…"
                style={{ width: "260px", height: 28, padding: "0 10px", fontSize: ".75rem", border: "1px solid #d1d5db", borderRadius: 4, outline: "none", background: "#fff" }}
              />
            </div>
          </TTBar>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th style={{ width: "120px" }}>Kit ID</Th>
                  <Th>Kit Name</Th>
                  <Th style={{ width: "160px" }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <Tr>
                    <Td colSpan="3" style={{ textAlign: "center", padding: "20px 0" }}>
                      No kit items found
                    </Td>
                  </Tr>
                ) : (
                  paginated.map((item) => (
                    <Tr key={item.kit_id}>
                      <Td style={{ fontWeight: 600 }}>{item.kit_id}</Td>
                      <Td>{item.kit_name}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleEdit(item)}
                          >Edit</Button>
                          <Button
                            danger
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleDelete(item)}
                          >Delete</Button>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>

          {/* ── Pagination Footer ── */}
          <Pager>
            <span>Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} entries</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <PB onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</PB>
              {getPaginationItems(page, totalPages).map((item, idx) => {
                if (item === "...") {
                  return (
                    <PB key={`ellipsis-${idx}`} disabled style={{ cursor: "default", opacity: 0.8, color: "#6b7280" }}>
                      ...
                    </PB>
                  );
                }
                return (
                  <PB key={item} active={item === page} onClick={() => setPage(item)}>
                    {item}
                  </PB>
                );
              })}
              <PB onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>Next</PB>
            </div>
          </Pager>
        </div>
      </Container>
    </PageWrapper>
  );
};

export default RoomKitItems;