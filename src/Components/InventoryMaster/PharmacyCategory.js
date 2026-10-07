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
  InvActionGroup,
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

const PharmacyCategory = () => {
  const [categories, setCategories] = useState([]);
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
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCategories = useCallback(
    async (p = currentPage, size = pageSize, q = search) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(p),
          page_size: String(size),
        });
        if (q && q.trim()) query.append("search", q.trim());

        const response = await apiRequest(`${HmsBaseUrl}pharmacy-category/?${query.toString()}`, "GET");
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

          setCategories(list);
          setTotalCount(total);
          setTotalPages(pages);
          setCurrentPage(payload?.current_page || p);
        } else {
          setCategories([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        showToast("Failed to fetch categories", "error");
      } finally {
        setLoading(false);
      }
    },
    [HmsBaseUrl, currentPage, pageSize, search]
  );

  useEffect(() => {
    fetchCategories(currentPage, pageSize, search);
  }, [currentPage, pageSize, search, fetchCategories]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setCategoryName("");
    setError("");
    setShowModal(true);
  };

  const handleEdit = (cat) => {
    setEditingId(cat.category_id);
    setCategoryName(cat.category_name || "");
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.category_name}"?`)) return;
    try {
      const response = await apiRequest(`${HmsBaseUrl}pharmacy-category/${cat.category_id}/`, "DELETE");
      if (response && !response.error) {
        showToast("Category deleted successfully");
        fetchCategories();
      } else {
        showToast(response?.error || "Failed to delete category", "error");
      }
    } catch {
      showToast("Failed to delete category", "error");
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        const response = await apiRequest(
          `${HmsBaseUrl}pharmacy-category/${editingId}/`,
          "PUT",
          { category_name: categoryName.trim() }
        );
        if (response && !response.error) {
          showToast("Category updated successfully");
          setShowModal(false);
          fetchCategories();
        } else {
          showToast(response?.error || "Update failed", "error");
        }
      } else {
        const response = await apiRequest(
          `${HmsBaseUrl}pharmacy-category/`,
          "POST",
          { category_name: categoryName.trim() }
        );
        if (response && !response.error) {
          showToast("Category added successfully");
          setShowModal(false);
          fetchCategories(1, pageSize, "");
        } else {
          showToast(response?.error || "Create failed", "error");
        }
      }
    } catch {
      showToast("Failed to save category", "error");
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
            <InvPageTitle>🗂️ Pharmacy Category Master</InvPageTitle>
            <InvPageSubtitle>Categorize medicines, surgical items, consumables, and drugs</InvPageSubtitle>
          </div>
          <InvAddBtn onClick={handleOpenAdd}>+ Add Category</InvAddBtn>
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
          searchPlaceholder="Search Category ID / Name..."
          totalRecords={totalCount}
        />

        {/* ── Table ── */}
        <InvTableWrapper>
          <InvTable>
            <thead>
              <tr>
                <InvTh style={{ width: 60 }}>#</InvTh>
                <InvTh style={{ width: 140 }}>Category ID</InvTh>
                <InvTh>Category Name</InvTh>
                <InvTh style={{ textAlign: "center", width: 150 }}>Actions</InvTh>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <InvTd colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                    Loading categories...
                  </InvTd>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <InvTd colSpan={4}>
                    <InvEmptyState>
                      No categories found for the selected filter.
                    </InvEmptyState>
                  </InvTd>
                </tr>
              ) : (
                categories.map((cat, idx) => (
                  <InvTr key={cat.category_id || idx}>
                    <InvTd>{startIdx + idx}</InvTd>
                    <InvTd style={{ fontWeight: 700, color: InvTheme.primaryDark }}>
                      CAT-{cat.category_id}
                    </InvTd>
                    <InvTd style={{ fontWeight: 600 }}>{cat.category_name}</InvTd>
                    <InvTd style={{ textAlign: "center" }}>
                      <InvActionGroup>
                        <InvActionBtn variant="edit" onClick={() => handleEdit(cat)} title="Edit Category">
                          ✏️ Edit
                        </InvActionBtn>
                        <InvActionBtn variant="delete" onClick={() => handleDelete(cat)} title="Delete Category">
                          🗑️ Delete
                        </InvActionBtn>
                      </InvActionGroup>
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
          <InvModalContainer maxWidth="500px" onClick={(e) => e.stopPropagation()}>
            <InvModalHeader>
              <InvModalTitle>
                🗂️ {editingId ? "Edit Pharmacy Category" : "Add Pharmacy Category"}
              </InvModalTitle>
              <InvModalCloseBtn onClick={() => setShowModal(false)}>✕</InvModalCloseBtn>
            </InvModalHeader>

            <form onSubmit={handleSubmit}>
              <InvModalBody>
                <InvFormGrid minWidth="100%">
                  <InvFormField>
                    <InvFormLabel required>Category Name</InvFormLabel>
                    <InvInput
                      autoFocus
                      value={categoryName}
                      onChange={(e) => {
                        setCategoryName(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="e.g. TABLETS, SYRUPS, INJECTIONS, SURGICAL"
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
                  {loading ? "Saving..." : editingId ? "Update Category" : "Save Category"}
                </InvAddBtn>
              </InvModalFooter>
            </form>
          </InvModalContainer>
        </InvModalOverlay>
      )}
    </PageContainer>
  );
};

export default PharmacyCategory;