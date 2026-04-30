import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container, PageWrapper, FormContent, FormRow,
  InputWrapper, Label, Input, Button, ButtonContainer,
  TableWrapper, Table, Th, Td, Tr,
} from "../GlobalStyles";
import styled from "styled-components";

// ─── Header ───────────────────────────────────────────────────────────────────
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

// ─── Pagination Styles ────────────────────────────────────────────────────────
const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 4px;
  flex-wrap: wrap;
  gap: 12px;
`;

const PaginationInfo = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageBtn = styled.button`
  min-width: 34px;
  height: 34px;
  padding: 0 8px;
  border: 1px solid ${(p) => (p.active ? "#0d9488" : "#d1d5db")};
  border-radius: 6px;
  background: ${(p) => (p.active ? "#0d9488" : "#ffffff")};
  color: ${(p) => (p.active ? "white" : "#374151")};
  font-size: 0.82rem;
  font-weight: ${(p) => (p.active ? 700 : 400)};
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.disabled ? 0.4 : 1)};
  transition: all 0.15s;
  &:hover:not(:disabled) {
    background: ${(p) => (p.active ? "#0f766e" : "#f0fdf4")};
    border-color: #0d9488;
  }
`;

const PageSizeSelect = styled.select`
  height: 30px;
  padding: 0 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.82rem;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
`;

// ─── Pagination Hook ──────────────────────────────────────────────────────────
const usePagination = (data, defaultPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  useEffect(() => { setCurrentPage(1); }, [data.length, pageSize]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const pageData = data.slice(startIdx, startIdx + pageSize);

  const goTo = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => setPageSize(Number(size));

  return { currentPage, pageSize, totalPages, pageData, goTo, handlePageSizeChange, startIdx };
};

// ─── Pagination Component ─────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, pageSize, totalItems, startIdx, goTo, onPageSizeChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const endIdx = Math.min(startIdx + pageSize, totalItems);

  return (
    <PaginationWrapper>
      <PaginationInfo>
        Showing <strong>{totalItems === 0 ? 0 : startIdx + 1}–{endIdx}</strong> of{" "}
        <strong>{totalItems}</strong> composition(s)
        &nbsp;|&nbsp; Rows per page:{" "}
        <PageSizeSelect value={pageSize} onChange={(e) => onPageSizeChange(e.target.value)}>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </PageSizeSelect>
      </PaginationInfo>

      <PaginationControls>
        <PageBtn onClick={() => goTo(1)} disabled={currentPage === 1}>«</PageBtn>
        <PageBtn onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}>‹</PageBtn>
        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <PageBtn key={`e-${idx}`} disabled style={{ cursor: "default" }}>…</PageBtn>
          ) : (
            <PageBtn key={p} active={p === currentPage} onClick={() => goTo(p)}>{p}</PageBtn>
          )
        )}
        <PageBtn onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages}>›</PageBtn>
        <PageBtn onClick={() => goTo(totalPages)} disabled={currentPage === totalPages}>»</PageBtn>
      </PaginationControls>
    </PaginationWrapper>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ChemicalComposition = () => {
  const [compositions, setCompositions] = useState([]);
  const [formData, setFormData]         = useState({ composition_name: "" });
  const [editingId, setEditingId]       = useState(null);

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchCompositions(); }, []);

  // Sorted alphabetically, then paginated
  const sorted = [...compositions].sort((a, b) =>
    (a.composition_name || "").localeCompare(b.composition_name || "")
  );

  const { currentPage, pageSize, totalPages, pageData, goTo, handlePageSizeChange, startIdx } =
    usePagination(sorted, 10);

  // ── API ───────────────────────────────────────────────────────────────────

  const fetchCompositions = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}chemical-composition/`, "GET");
      setCompositions(
        response && !response.error && Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch {
      toast.error("Failed to fetch compositions");
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (composition) => {
    setEditingId(composition.composition_id);
    setFormData({ composition_name: composition.composition_name });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (composition) => {
    if (!window.confirm("Are you sure you want to delete this composition?")) return;
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}chemical-composition/${composition.composition_id}/`,
        "DELETE"
      );
      if (response && !response.error) {
        toast.success("Composition deleted successfully");
        fetchCompositions();
      } else {
        toast.error(response?.error || "Failed to delete composition");
      }
    } catch {
      toast.error("Failed to delete composition");
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({ composition_name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.composition_name.trim()) {
      toast.error("Composition name is required");
      return;
    }
    try {
      if (editingId) {
        const response = await apiRequest(
          `${HmsBaseUrl}chemical-composition/${editingId}/`,
          "PUT",
          formData
        );
        if (response && !response.error) {
          toast.success("Composition updated successfully");
          handleReset();
          fetchCompositions();
        } else {
          toast.error(response?.error || "Update failed");
        }
      } else {
        const response = await apiRequest(
          `${HmsBaseUrl}chemical-composition/`,
          "POST",
          formData
        );
        if (response && !response.error) {
          toast.success("Composition added successfully");
          handleReset();
          fetchCompositions();
        } else {
          toast.error(response?.error || "Create failed");
        }
      }
    } catch {
      toast.error("Failed to save composition");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      <Container>

        {/* ── Header ── */}
        <PageHeader>
          <div>
            <PageTitle>🧪 Chemical Composition</PageTitle>
            <PageSubtitle>Manage chemical composition master data</PageSubtitle>
          </div>
        </PageHeader>

        {/* ── Form ── */}
        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow columns="1fr">
              <InputWrapper>
                <Label required>Composition Name</Label>
                <Input
                  type="text"
                  name="composition_name"
                  value={formData.composition_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter Composition Name (e.g. Paracetamol 500mg)"
                />
              </InputWrapper>
            </FormRow>

            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit">
                {editingId ? "Update Composition" : "Add Composition"}
              </Button>
            </ButtonContainer>
          </form>
        </FormContent>

        {/* ── Table ── */}
        <div style={{ padding: "0 24px 24px" }}>
          <SectionTitle>Composition List</SectionTitle>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Composition Name ↑</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <Tr>
                    <Td colSpan="3" style={{ textAlign: "center" }}>
                      No compositions found
                    </Td>
                  </Tr>
                ) : (
                  pageData.map((comp, idx) => (
                    <Tr key={comp.composition_id}>
                      <Td>{startIdx + idx + 1}</Td>
                      <Td>{comp.composition_name}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleEdit(comp)}
                          >
                            Edit
                          </Button>
                          <Button
                            danger
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleDelete(comp)}
                          >
                            Delete
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>

          {/* ── Pagination ── */}
          {sorted.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={sorted.length}
              startIdx={startIdx}
              goTo={goTo}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>

      </Container>
    </PageWrapper>
  );
};

export default ChemicalComposition;