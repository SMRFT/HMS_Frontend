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

const RoomCategory = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData]     = useState({ name: "" });
  const [editingId, setEditingId]   = useState(null);
  const [page, setPage]             = useState(1);
  const [perPage, setPerPage]       = useState(10);
  const [tSearch, setTSearch]       = useState("");

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}room-category/`, "GET");
      setCategories(response && !response.error && Array.isArray(response.data)
        ? response.data : []);
    } catch {
      toast.error("Failed to fetch room categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (category) => {
    setEditingId(category.room_category_id);
    setFormData({ name: category.name });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (category) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}room-category/${category.room_category_id}/`, "DELETE"
      );
      if (response && !response.error) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        toast.error(response?.error || "Failed to delete category");
      }
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({ name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await apiRequest(
          `${HmsBaseUrl}room-category/${editingId}/`, "PUT", formData
        );
        if (response && !response.error) {
          toast.success("Category updated successfully");
          handleReset();
          fetchCategories();
        } else {
          toast.error(response?.error || "Update failed");
        }
      } else {
        const response = await apiRequest(
          `${HmsBaseUrl}room-category/`, "POST", formData
        );
        if (response && !response.error) {
          toast.success("Category added successfully");
          handleReset();
          fetchCategories();
        } else {
          toast.error(response?.error || "Create failed");
        }
      }
    } catch {
      toast.error("Failed to save category");
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
    if (!tSearch.trim()) return categories;
    const q = tSearch.toLowerCase().trim();
    return categories.filter((c) =>
      String(c.room_category_id || "").toLowerCase().includes(q) ||
      String(c.name || "").toLowerCase().includes(q)
    );
  }, [categories, tSearch]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  return (
    <PageWrapper>
      <Container>
        <PageHeader>
          <PageTitle>🏥 Room Category Management</PageTitle>
        </PageHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow columns="1fr">
              <InputWrapper>
                <Label required>Room Category Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter Room Category Name"
                />
              </InputWrapper>
            </FormRow>

            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>Reset</Button>
              <Button type="submit">
                {editingId ? "Update Category" : "Add Category"}
              </Button>
            </ButtonContainer>
          </form>
        </FormContent>

        <div style={{ padding: "0 24px 24px" }}>
          <h4 style={{ color: "#0d9488", marginBottom: "12px" }}>Category List</h4>

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
                placeholder="Search Category ID / Name…"
                style={{ width: "260px", height: 28, padding: "0 10px", fontSize: ".75rem", border: "1px solid #d1d5db", borderRadius: 4, outline: "none", background: "#fff" }}
              />
            </div>
          </TTBar>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th style={{ width: "120px" }}>Category ID</Th>
                  <Th>Room Category Name</Th>
                  <Th style={{ width: "120px" }}>Status</Th>
                  <Th style={{ width: "160px" }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <Tr>
                    <Td colSpan="4" style={{ textAlign: "center", padding: "20px 0" }}>
                      No categories found
                    </Td>
                  </Tr>
                ) : (
                  paginated.map((cat) => (
                    <Tr key={cat.room_category_id}>
                      <Td style={{ fontWeight: 600 }}>{cat.room_category_id}</Td>
                      <Td>{cat.name}</Td>
                      <Td>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: ".72rem",
                          fontWeight: 700,
                          background: cat.is_active ? "#dcfce7" : "#fee2e2",
                          color: cat.is_active ? "#15803d" : "#b91c1c"
                        }}>
                          {cat.is_active ? "Active" : "Inactive"}
                        </span>
                      </Td>
                      <Td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleEdit(cat)}
                          >Edit</Button>
                          <Button
                            danger
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleDelete(cat)}
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

export default RoomCategory;