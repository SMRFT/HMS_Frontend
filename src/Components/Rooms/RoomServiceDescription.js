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

const RoomServiceDescription = () => {
  const [descriptions, setDescriptions] = useState([]);
  const [formData, setFormData]         = useState({ description_name: "" });
  const [editingId, setEditingId]       = useState(null);
  const [page, setPage]                 = useState(1);
  const [perPage, setPerPage]           = useState(10);
  const [tSearch, setTSearch]           = useState("");

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchDescriptions(); }, []);

  const fetchDescriptions = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}roomservice-description/`, "GET");
      setDescriptions(response && !response.error && Array.isArray(response.data)
        ? response.data : []);
    } catch {
      toast.error("Failed to fetch room service descriptions");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (desc) => {
    setEditingId(desc.description_id);
    setFormData({ description_name: desc.description_name });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (desc) => {
    if (!window.confirm("Are you sure you want to delete this description?")) return;
    try {
      const response = await apiRequest(`${HmsBaseUrl}roomservice-description/${desc.description_id}/`, "DELETE");
      if (response && !response.error) {
        toast.success("Description deleted successfully");
        fetchDescriptions();
      } else {
        toast.error(response?.error || "Failed to delete description");
      }
    } catch {
      toast.error("Failed to delete description");
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({ description_name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await apiRequest(`${HmsBaseUrl}roomservice-description/${editingId}/`, "PUT", formData);
        if (response && !response.error) {
          toast.success("Description updated successfully");
          handleReset();
          fetchDescriptions();
        } else {
          toast.error(response?.error || "Update failed");
        }
      } else {
        const response = await apiRequest(`${HmsBaseUrl}roomservice-description/`, "POST", formData);
        if (response && !response.error) {
          toast.success("Description added successfully");
          handleReset();
          fetchDescriptions();
        } else {
          toast.error(response?.error || "Create failed");
        }
      }
    } catch {
      toast.error("Failed to save description");
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
    if (!tSearch.trim()) return descriptions;
    const q = tSearch.toLowerCase().trim();
    return descriptions.filter((d) =>
      String(d.description_id || "").toLowerCase().includes(q) ||
      String(d.description_name || "").toLowerCase().includes(q)
    );
  }, [descriptions, tSearch]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  return (
    <PageWrapper>
      <Container>
        <PageHeader>
          <PageTitle>🏥 Room Service Description Management</PageTitle>
        </PageHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow columns="1fr">
              <InputWrapper>
                <Label required>Description Name</Label>
                <Input
                  type="text"
                  name="description_name"
                  value={formData.description_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter Description Name"
                />
              </InputWrapper>
            </FormRow>

            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>Reset</Button>
              <Button type="submit">
                {editingId ? "Update Description" : "Add Description"}
              </Button>
            </ButtonContainer>
          </form>
        </FormContent>

        <div style={{ padding: "0 24px 24px" }}>
          <h4 style={{ color: "#0d9488", marginBottom: "12px" }}>Room Service Description List</h4>

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
                placeholder="Search Description ID / Name…"
                style={{ width: "260px", height: 28, padding: "0 10px", fontSize: ".75rem", border: "1px solid #d1d5db", borderRadius: 4, outline: "none", background: "#fff" }}
              />
            </div>
          </TTBar>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th style={{ width: "120px" }}>Description ID</Th>
                  <Th>Description Name</Th>
                  <Th style={{ width: "160px" }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <Tr>
                    <Td colSpan="3" style={{ textAlign: "center", padding: "20px 0" }}>
                      No descriptions found
                    </Td>
                  </Tr>
                ) : (
                  paginated.map((desc) => (
                    <Tr key={desc.description_id}>
                      <Td style={{ fontWeight: 600 }}>{desc.description_id}</Td>
                      <Td>{desc.description_name}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleEdit(desc)}
                          >Edit</Button>
                          <Button
                            danger
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleDelete(desc)}
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

export default RoomServiceDescription;