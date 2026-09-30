import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import {
  InvTheme,
  InvPageHeader,
  InvPageTitle,
  InvPageSubtitle,
  InvAddBtn,
  InvTopToolbar,
  InvPagination,
  InvTableWrapper,
  InvTable,
  InvTh,
  InvTd,
  InvTr,
  InvActionBtn,
  InvModalOverlay,
  InvModalContainer,
  InvModalHeader,
  InvModalTitle,
  InvModalCloseBtn,
  InvModalBody,
  InvModalFooter,
  InvFormGrid,
  InvFormField,
  InvFormLabel,
  InvFormError,
  InvInput,
  InvEmptyState,
  InvToast,
  getTodayDateString,
} from "./InventoryUIHelper";

const PageContainer = styled.div`
  padding: 18px 24px;
  background: ${InvTheme.background};
  min-height: calc(100vh - 70px);
  font-family: ${InvTheme.font};
`;

const ContentCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: ${InvTheme.shadowSm};
  overflow: hidden;
  border: 1px solid ${InvTheme.border};
`;

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const ChemicalComposition = () => {
  const [compositions, setCompositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [compositionName, setCompositionName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCompositions = useCallback(
    async (p = currentPage, size = pageSize, q = search) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(p),
          page_size: String(size),
        });
        if (q && q.trim()) query.append("search", q.trim());

        const response = await apiRequest(`${HmsBaseUrl}chemical-composition/?${query.toString()}`, "GET");
        if (response && response.success) {
          const payload = response.data;
          const list = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.results)
            ? payload.results
            : [];
          const total =
            payload?.total_records ??
            payload?.count ??
            response?.count ??
            (Array.isArray(payload) ? payload.length : list.length);
          const pages = payload?.total_pages ?? response?.total_pages ?? Math.max(1, Math.ceil(total / size));

          setCompositions(list);
          setTotalCount(total);
          setTotalPages(pages);
          setCurrentPage(payload?.current_page || p);
        } else {
          setCompositions([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Failed to fetch compositions:", err);
        showToast("Failed to fetch compositions", "error");
      } finally {
        setLoading(false);
      }
    },
    [HmsBaseUrl, currentPage, pageSize, search]
  );

  useEffect(() => {
    fetchCompositions(currentPage, pageSize, search);
  }, [currentPage, pageSize, search, fetchCompositions]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setCompositionName("");
    setError("");
    setShowModal(true);
  };

  const handleEdit = (comp) => {
    setEditingId(comp.composition_id);
    setCompositionName(comp.composition_name || "");
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (comp) => {
    if (!window.confirm(`Are you sure you want to delete composition "${comp.composition_name}"?`)) return;
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}chemical-composition/${comp.composition_id}/`,
        "DELETE"
      );
      if (response && !response.error) {
        showToast("Composition deleted successfully");
        fetchCompositions();
      } else {
        showToast(response?.error || "Failed to delete composition", "error");
      }
    } catch {
      showToast("Failed to delete composition", "error");
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!compositionName.trim()) {
      setError("Composition name is required");
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        const response = await apiRequest(
          `${HmsBaseUrl}chemical-composition/${editingId}/`,
          "PUT",
          { composition_name: compositionName.trim() }
        );
        if (response && !response.error) {
          showToast("Composition updated successfully");
          setShowModal(false);
          fetchCompositions();
        } else {
          showToast(response?.error || "Update failed", "error");
        }
      } else {
        const response = await apiRequest(
          `${HmsBaseUrl}chemical-composition/`,
          "POST",
          { composition_name: compositionName.trim() }
        );
        if (response && !response.error) {
          showToast("Composition added successfully");
          setShowModal(false);
          fetchCompositions(1, pageSize, "");
        } else {
          showToast(response?.error || "Create failed", "error");
        }
      }
    } catch {
      showToast("Failed to save composition", "error");
    } finally {
      setLoading(false);
    }
  };

  const startIdx = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  return (
    <PageContainer>
      {toast && <InvToast error={toast.type === "error"}>{toast.msg}</InvToast>}

      <ContentCard>
        {/* ── Header ── */}
        <InvPageHeader>
          <div>
            <InvPageTitle>🧪 Chemical Composition Master</InvPageTitle>
            <InvPageSubtitle>Manage active chemical ingredients, generic formulations, and salt names</InvPageSubtitle>
          </div>
          <InvAddBtn onClick={handleOpenAdd}>+ Add Composition</InvAddBtn>
        </InvPageHeader>

        {/* ── Top Toolbar (Show Upto, Search) ── */}
        <InvTopToolbar
          pageSize={pageSize}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          searchPlaceholder="Search Composition Name..."
          totalRecords={totalCount}
        />

        {/* ── Table ── */}
        <InvTableWrapper>
          <InvTable>
            <thead>
              <tr>
                <InvTh style={{ width: 60 }}>#</InvTh>
                <InvTh style={{ width: 140 }}>Composition ID</InvTh>
                <InvTh>Chemical / Generic Composition Name</InvTh>
                <InvTh style={{ textAlign: "center", width: 150 }}>Actions</InvTh>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <InvTd colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                    Loading chemical compositions...
                  </InvTd>
                </tr>
              ) : compositions.length === 0 ? (
                <tr>
                  <InvTd colSpan={4}>
                    <InvEmptyState>
                      No chemical compositions found for the selected criteria.
                    </InvEmptyState>
                  </InvTd>
                </tr>
              ) : (
                compositions.map((comp, idx) => (
                  <InvTr key={comp.composition_id || idx}>
                    <InvTd>{startIdx + idx}</InvTd>
                    <InvTd style={{ fontWeight: 700, color: InvTheme.primaryDark }}>
                      CMP-{comp.composition_id}
                    </InvTd>
                    <InvTd style={{ fontWeight: 600 }}>{comp.composition_name}</InvTd>
                    <InvTd style={{ textAlign: "center" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <InvActionBtn onClick={() => handleEdit(comp)}>Edit</InvActionBtn>
                        <InvActionBtn danger onClick={() => handleDelete(comp)}>
                          Delete
                        </InvActionBtn>
                      </div>
                    </InvTd>
                  </InvTr>
                ))
              )}
            </tbody>
          </InvTable>
        </InvTableWrapper>

        {/* ── Bottom Pagination ── */}
        <InvPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={totalCount}
          onPageChange={setCurrentPage}
        />
      </ContentCard>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <InvModalOverlay onClick={() => setShowModal(false)}>
          <InvModalContainer maxWidth="520px" onClick={(e) => e.stopPropagation()}>
            <InvModalHeader>
              <InvModalTitle>
                🧪 {editingId ? "Edit Chemical Composition" : "Add Chemical Composition"}
              </InvModalTitle>
              <InvModalCloseBtn onClick={() => setShowModal(false)}>✕</InvModalCloseBtn>
            </InvModalHeader>

            <form onSubmit={handleSubmit}>
              <InvModalBody>
                <InvFormGrid minWidth="100%">
                  <InvFormField>
                    <InvFormLabel required>Composition / Generic Name</InvFormLabel>
                    <InvInput
                      autoFocus
                      value={compositionName}
                      onChange={(e) => {
                        setCompositionName(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="e.g. Paracetamol 500mg, Amoxicillin 250mg"
                      style={error ? { borderColor: InvTheme.danger } : {}}
                    />
                    {error && <InvFormError>{error}</InvFormError>}
                  </InvFormField>
                </InvFormGrid>
              </InvModalBody>

              <InvModalFooter>
                <InvAddBtn secondary type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </InvAddBtn>
                <InvAddBtn type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update Composition" : "Save Composition"}
                </InvAddBtn>
              </InvModalFooter>
            </form>
          </InvModalContainer>
        </InvModalOverlay>
      )}
    </PageContainer>
  );
};

export default ChemicalComposition;