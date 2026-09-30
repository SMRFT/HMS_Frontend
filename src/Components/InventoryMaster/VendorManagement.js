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
  InvBadge,
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
  InvSelect,
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

const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
const SUPPLIER_TYPES = ["SUPPLIER", "MANUFACTURER"];
const PAYMENT_TERMS = ["CHEQUE", "CASH", "DD", "CREDIT 30 DAYS", "CREDIT 60 DAYS", "NET 15"];
const COUNTRY = "India";

const EMPTY_FORM = {
  vendor_type: "",
  name: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  contact_person: "",
  phone: "",
  email: "",
  gstin: "",
  payment_terms: "",
};

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [vendorTypeFilter, setVendorTypeFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

  // Dynamic States & Cities
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch Vendors from Backend ──────────────────────────────────────────
  const fetchVendors = useCallback(
    async (page = currentPage, size = pageSize, q = search, vType = vendorTypeFilter) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(page),
          page_size: String(size),
        });

        if (q && q.trim()) query.append("search", q.trim());
        if (vType && vType.trim()) query.append("vendor_type", vType.trim());

        const response = await apiRequest(`${baseUrl}vendors/?${query.toString()}`, "GET");
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

          setVendors(list);
          setTotalCount(total);
          setTotalPages(pages);
          setCurrentPage(payload?.current_page || page);
        } else {
          setVendors([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
        showToast("Failed to fetch vendors", "error");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, search, vendorTypeFilter]
  );

  useEffect(() => {
    fetchVendors(currentPage, pageSize, search, vendorTypeFilter);
  }, [currentPage, pageSize, search, vendorTypeFilter, fetchVendors]);

  // ── Load India States on Mount ──────────────────────────────────────────
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: COUNTRY }),
        });
        const data = await res.json();
        if (!data.error && data.data?.states) {
          setStates(data.data.states.map((s) => s.name).sort());
        }
      } catch {
        console.error("Failed to load states");
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, []);

  // ── Load Cities When State Changes ──────────────────────────────────────
  useEffect(() => {
    if (!form.state) {
      setCities([]);
      return;
    }
    const fetchCities = async () => {
      setLoadingCities(true);
      setCities([]);
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: COUNTRY, state: form.state }),
        });
        const data = await res.json();
        if (!data.error && Array.isArray(data.data)) {
          setCities(data.data.sort());
        }
      } catch {
        console.error("Failed to load cities");
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [form.state]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handlePageChange = (p) => {
    setCurrentPage(p);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (vendor) => {
    setForm({
      vendor_type: vendor.vendor_type || "",
      name: vendor.name || "",
      address_line1: vendor.address_line1 || vendor.address_line_1 || "",
      address_line2: vendor.address_line2 || vendor.address_line_2 || "",
      city: vendor.city || "",
      state: vendor.state || "",
      pincode: vendor.pincode || "",
      contact_person: vendor.contact_person || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      gstin: vendor.gstin || "",
      payment_terms: vendor.payment_terms || "",
    });
    setEditId(vendor.vendor_id || vendor.id);
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      const response = await apiRequest(`${baseUrl}vendors/${id}/`, "DELETE");
      if (response && response.success) {
        showToast("Vendor deleted successfully");
        fetchVendors();
      } else {
        showToast(response?.error || "Delete failed", "error");
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
      showToast("Delete failed", "error");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "state") updated.city = "";
      return updated;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errs = {};
    if (!form.vendor_type) errs.vendor_type = "Vendor type is required";
    if (!form.name.trim()) errs.name = "Vendor name is required";
    if (!form.address_line1.trim()) errs.address_line1 = "Address is required";
    if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin.trim())) {
      errs.gstin = "Invalid GSTIN format (e.g. 33AAHCA7054L1ZJ)";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Invalid email format";
    }
    if (form.phone && !/^\+?[0-9]{7,15}$/.test(form.phone.trim())) {
      errs.phone = "Invalid phone number";
    }
    return errs;
  };

  const handleFormSubmit = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const url = editId ? `${baseUrl}vendors/${editId}/` : `${baseUrl}vendors/`;
      const method = editId ? "PUT" : "POST";
      const response = await apiRequest(url, method, form);
      if (response && response.success) {
        showToast(editId ? "Vendor updated successfully" : "Vendor added successfully");
        setShowModal(false);
        setForm(EMPTY_FORM);
        setEditId(null);
        fetchVendors();
      } else {
        showToast(JSON.stringify(response?.data || response?.error || "Save failed"), "error");
      }
    } catch (error) {
      console.error("Error saving vendor:", error);
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  const startIdx = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  return (
    <PageContainer>
      {toast && <InvToast error={toast.type === "error"}>{toast.msg}</InvToast>}

      <ContentCard>
        {/* ── Page Header ── */}
        <InvPageHeader>
          <div>
            <InvPageTitle>🏢 Vendor Management</InvPageTitle>
            <InvPageSubtitle>Manage suppliers, manufacturers, contact details, and payment terms</InvPageSubtitle>
          </div>
          <InvAddBtn onClick={handleOpenAdd}>+ Add Vendor</InvAddBtn>
        </InvPageHeader>

        {/* ── Top Toolbar (Show Upto, Search, Filters) ── */}
        <InvTopToolbar
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 25, 50, 100]}
          search={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search name, GSTIN, city, phone..."
          totalRecords={totalCount}
          customFilters={
            <InvSelect
              value={vendorTypeFilter}
              onChange={(e) => {
                setVendorTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Types</option>
              {SUPPLIER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </InvSelect>
          }
        />

        {/* ── Table ── */}
        <InvTableWrapper>
          <InvTable>
            <thead>
              <tr>
                <InvTh style={{ width: 50 }}>#</InvTh>
                <InvTh>Vendor Name</InvTh>
                <InvTh>Type</InvTh>
                <InvTh>Address</InvTh>
                <InvTh>City / State</InvTh>
                <InvTh>GSTIN</InvTh>
                <InvTh>Contact Person</InvTh>
                <InvTh>Phone / Email</InvTh>
                <InvTh>Payment Terms</InvTh>
                <InvTh style={{ textAlign: "center", width: 140 }}>Actions</InvTh>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <InvTd colSpan={10} style={{ textAlign: "center", padding: "40px" }}>
                    Loading vendor records...
                  </InvTd>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <InvTd colSpan={10}>
                    <InvEmptyState>
                      No vendors found for the selected criteria.
                    </InvEmptyState>
                  </InvTd>
                </tr>
              ) : (
                vendors.map((v, idx) => (
                  <InvTr key={v.vendor_id || v._id || idx}>
                    <InvTd>{startIdx + idx}</InvTd>
                    <InvTd style={{ fontWeight: 700, color: InvTheme.primaryDark }}>{v.name}</InvTd>
                    <InvTd>
                      <InvBadge
                        bg={v.vendor_type === "SUPPLIER" ? "#dbeafe" : "#fef3c7"}
                        color={v.vendor_type === "SUPPLIER" ? "#1e40af" : "#92400e"}
                        border={v.vendor_type === "SUPPLIER" ? "#bfdbfe" : "#fde68a"}
                      >
                        {v.vendor_type || "SUPPLIER"}
                      </InvBadge>
                    </InvTd>
                    <InvTd style={{ maxWidth: 220, fontSize: "0.8rem" }}>
                      {[v.address_line1 || v.address_line_1, v.address_line2 || v.address_line_2]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </InvTd>
                    <InvTd>{[v.city, v.state].filter(Boolean).join(", ") || "—"}</InvTd>
                    <InvTd style={{ fontFamily: "monospace", fontWeight: 600 }}>{v.gstin || "—"}</InvTd>
                    <InvTd>{v.contact_person || "—"}</InvTd>
                    <InvTd style={{ fontSize: "0.8rem" }}>
                      <div>{v.phone || "—"}</div>
                      {v.email && <div style={{ color: InvTheme.textMuted, fontSize: "0.75rem" }}>{v.email}</div>}
                    </InvTd>
                    <InvTd>{v.payment_terms || "—"}</InvTd>
                    <InvTd style={{ textAlign: "center" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <InvActionBtn onClick={() => handleEdit(v)}>Edit</InvActionBtn>
                        <InvActionBtn danger onClick={() => handleDelete(v.vendor_id || v._id)}>
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
          onPageChange={handlePageChange}
        />
      </ContentCard>

      {/* ── Add / Edit Vendor Modal ── */}
      {showModal && (
        <InvModalOverlay onClick={() => setShowModal(false)}>
          <InvModalContainer maxWidth="880px" onClick={(e) => e.stopPropagation()}>
            <InvModalHeader>
              <InvModalTitle>🏢 {editId ? "Edit Vendor Details" : "Add New Vendor"}</InvModalTitle>
              <InvModalCloseBtn onClick={() => setShowModal(false)}>✕</InvModalCloseBtn>
            </InvModalHeader>

            <InvModalBody>
              <InvFormGrid minWidth="240px">
                <InvFormField>
                  <InvFormLabel required>Supplier / Manufacturer</InvFormLabel>
                  <InvSelect
                    name="vendor_type"
                    value={form.vendor_type}
                    onChange={handleFormChange}
                    style={errors.vendor_type ? { borderColor: InvTheme.danger } : {}}
                  >
                    <option value="">-- Select Type --</option>
                    {SUPPLIER_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </InvSelect>
                  {errors.vendor_type && <InvFormError>{errors.vendor_type}</InvFormError>}
                </InvFormField>

                <InvFormField>
                  <InvFormLabel required>Vendor Name</InvFormLabel>
                  <InvInput
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Enter vendor / company name"
                    style={errors.name ? { borderColor: InvTheme.danger } : {}}
                  />
                  {errors.name && <InvFormError>{errors.name}</InvFormError>}
                </InvFormField>

                <InvFormField>
                  <InvFormLabel required>Address Line 1</InvFormLabel>
                  <InvInput
                    name="address_line1"
                    value={form.address_line1}
                    onChange={handleFormChange}
                    placeholder="Door No. / Building / Street"
                    style={errors.address_line1 ? { borderColor: InvTheme.danger } : {}}
                  />
                  {errors.address_line1 && <InvFormError>{errors.address_line1}</InvFormError>}
                </InvFormField>

                <InvFormField>
                  <InvFormLabel>Address Line 2</InvFormLabel>
                  <InvInput
                    name="address_line2"
                    value={form.address_line2}
                    onChange={handleFormChange}
                    placeholder="Area / Landmark"
                  />
                </InvFormField>

                <InvFormField>
                  <InvFormLabel>State</InvFormLabel>
                  <InvSelect
                    name="state"
                    value={form.state}
                    onChange={handleFormChange}
                    disabled={loadingStates}
                  >
                    <option value="">{loadingStates ? "Loading states..." : "-- Select State --"}</option>
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </InvSelect>
                </InvFormField>

                <InvFormField>
                  <InvFormLabel>City</InvFormLabel>
                  <InvSelect
                    name="city"
                    value={form.city}
                    onChange={handleFormChange}
                    disabled={!form.state || loadingCities}
                  >
                    <option value="">
                      {loadingCities
                        ? "Loading cities..."
                        : !form.state
                        ? "Select state first"
                        : "-- Select City --"}
                    </option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </InvSelect>
                </InvFormField>

                <InvFormField>
                  <InvFormLabel>Pincode</InvFormLabel>
                  <InvInput
                    name="pincode"
                    value={form.pincode}
                    onChange={handleFormChange}
                    placeholder="e.g. 636007"
                    maxLength={10}
                  />
                </InvFormField>

                <InvFormField>
                  <InvFormLabel>Contact Person</InvFormLabel>
                  <InvInput
                    name="contact_person"
                    value={form.contact_person}
                    onChange={handleFormChange}
                    placeholder="Representative name"
                  />
                </InvFormField>

                <InvFormField>
                  <InvFormLabel>Phone Number</InvFormLabel>
                  <InvInput
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="e.g. 09876543210"
                    style={errors.phone ? { borderColor: InvTheme.danger } : {}}
                  />
                  {errors.phone && <InvFormError>{errors.phone}</InvFormError>}
                </InvFormField>

                <InvFormField>
                  <InvFormLabel>Email Address</InvFormLabel>
                  <InvInput
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="vendor@company.com"
                    style={errors.email ? { borderColor: InvTheme.danger } : {}}
                  />
                  {errors.email && <InvFormError>{errors.email}</InvFormError>}
                </InvFormField>

                <InvFormField>
                  <InvFormLabel>GSTIN</InvFormLabel>
                  <InvInput
                    name="gstin"
                    value={form.gstin}
                    onChange={(e) =>
                      handleFormChange({
                        target: { name: "gstin", value: e.target.value.toUpperCase() },
                      })
                    }
                    placeholder="e.g. 33AAHCA7054L1ZJ"
                    maxLength={15}
                    style={errors.gstin ? { borderColor: InvTheme.danger } : {}}
                  />
                  {errors.gstin && <InvFormError>{errors.gstin}</InvFormError>}
                </InvFormField>

                <InvFormField>
                  <InvFormLabel>Payment Terms</InvFormLabel>
                  <InvSelect
                    name="payment_terms"
                    value={form.payment_terms}
                    onChange={handleFormChange}
                  >
                    <option value="">-- Select Terms --</option>
                    {PAYMENT_TERMS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </InvSelect>
                </InvFormField>
              </InvFormGrid>
            </InvModalBody>

            <InvModalFooter>
              <InvAddBtn secondary onClick={() => setShowModal(false)}>
                Cancel
              </InvAddBtn>
              <InvAddBtn onClick={handleFormSubmit} disabled={loading}>
                {loading ? "Saving..." : editId ? "Update Vendor" : "Save Vendor"}
              </InvAddBtn>
            </InvModalFooter>
          </InvModalContainer>
        </InvModalOverlay>
      )}
    </PageContainer>
  );
};

export default VendorManagement;