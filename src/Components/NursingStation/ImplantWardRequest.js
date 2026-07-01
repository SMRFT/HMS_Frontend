import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import {
  colors,
  Button as GlobalButton,
  Input,
  Table,
  Th,
  Td,
  Tr
} from "../GlobalStyles";
import { FiTrash2, FiEdit2, FiPlus, FiSearch, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const Body = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: 'Inter', -apple-system, sans-serif;
`;

const PatientCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Value = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${colors.textMain};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 2px solid ${colors.border}50;
  padding-bottom: 8px;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 800;
    color: ${colors.primary};
  }
`;

const FormContainer = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 220px;
  overflow-y: auto;
  margin-top: 4px;
`;

const DropdownItem = styled.div`
  padding: 10px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  border-bottom: 1px solid ${colors.border}30;
  color: ${colors.textMain};

  &:hover {
    background: ${colors.tabBg};
    color: ${colors.primaryDark};
  }
`;

const SelectedItemsTableWrapper = styled.div`
  border: 1px solid ${colors.border};
  border-radius: 12px;
  overflow: hidden;
  margin-top: 16px;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
  border: 1.5px solid currentColor;
  
  ${(props) => {
    switch (props.$status?.toLowerCase()) {
      case "billed":
        return `color: ${colors.success}; background: ${colors.success}10;`;
      case "cancelled":
        return `color: ${colors.danger}; background: ${colors.danger}10;`;
      case "processed":
        return `color: #8b5edd; background: #8b5edd10;`;
      default: // Pending
        return `color: ${colors.secondary}; background: ${colors.secondary}10;`;
    }
  }}
`;

const TableWrapper = styled.div`
  border: 1px solid ${colors.border};
  border-radius: 12px;
  overflow: hidden;
  background: ${colors.surface};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
`;

const ReqItemBadge = styled.span`
  display: inline-block;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.78rem;
  font-weight: 500;
  margin-right: 6px;
  margin-bottom: 4px;
  color: ${colors.textMain};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: ${colors.textMuted};
  background: ${colors.surface};
  border: 1.5px dashed ${colors.border};
  border-radius: 16px;

  svg {
    font-size: 2.5rem;
    margin-bottom: 12px;
    color: ${colors.primary}50;
  }
`;

// ─── Custom Implant Search Dropdown ───
const ImplantSearchField = ({
  searchQuery,
  setSearchQuery,
  selectedItem,
  setSelectedItem,
  onSearch,
  searchResults,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const clickHandler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", clickHandler);
    return () => document.removeEventListener("mousedown", clickHandler);
  }, []);

  const selectItem = (item) => {
    setSelectedItem(item);
    setSearchQuery(item.itemName);
    setIsOpen(false);
    setActiveIdx(-1);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (selectedItem) setSelectedItem(null);
    setSearchQuery(val);
    setActiveIdx(-1);
    clearTimeout(debounceRef.current);
    if (val.length >= 2) {
      setIsOpen(true);
      debounceRef.current = setTimeout(() => onSearch(val), 300);
    } else {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    const total = searchResults.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIdx((prev) => (prev + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => (prev - 1 + total) % total);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && searchResults[activeIdx]) {
        selectItem(searchResults[activeIdx]);
      } else if (searchResults.length === 1) {
        selectItem(searchResults[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <SearchWrapper ref={wrapperRef}>
      <Input
        type="text"
        placeholder="Search implant item by name..."
        value={selectedItem ? selectedItem.itemName : searchQuery}
        onChange={handleChange}
        onFocus={() => {
          if (searchQuery.length >= 2 || searchResults.length > 0) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {isOpen && (
        <DropdownList>
          {searchResults.length === 0 && searchQuery.length >= 2 && (
            <DropdownItem style={{ color: colors.textMuted, fontStyle: "italic", cursor: "default" }}>
              No implant items found
            </DropdownItem>
          )}
          {searchResults.map((item, idx) => (
            <DropdownItem
              key={item.id || item.item_id || idx}
              style={{
                background: activeIdx === idx ? colors.tabBg : undefined,
                fontWeight: activeIdx === idx ? 600 : undefined,
                color: activeIdx === idx ? colors.primaryDark : undefined,
              }}
              onClick={() => selectItem(item)}
              onMouseEnter={() => setActiveIdx(idx)}
            >
              {item.itemName} {item.hsn ? `(${item.hsn})` : ""}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </SearchWrapper>
  );
};

export default function ImplantWardRequest({ patient, onClose }) {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const pd = patient?.patient_details || {};
  const rp = {
    uhid: patient?.uhid || pd.uhid || "-",
    ipNo: patient?.ipNumber || pd.ipNumber || "-",
    name: [
      patient?.salutation ?? pd.salutation,
      patient?.firstName ?? pd.firstName,
      patient?.lastName ?? pd.lastName,
    ].filter(Boolean).join(" ") || "Patient",
    doctor: patient?.doctorName || pd.doctorName || patient?.admittingDoctor || pd.admittingDoctor || "-",
    roomBed: `${patient?.roomNo || "-"} | ${patient?.bedNo || "-"}`,
    customerType: patient?.customerType || pd.customer_type || "Normal",
    companyName: patient?.companyName || pd.company_code || pd.insuranceCompanyName || "-",
  };

  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [selectedItems, setSelectedItems] = useState([]);

  // Edit State
  const [editMode, setEditMode] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchDoctors();
  }, [patient]); // eslint-disable-line

  const fetchDoctors = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
      if (res.success && Array.isArray(res.data)) {
        setDoctors(res.data);
      }
    } catch (e) {
      console.error("Error fetching doctors:", e);
    }
  };

  const getDoctorName = (surgeonId) => {
    if (!surgeonId) return "-";
    const found = doctors.find(doc => String(doc.employeeId) === String(surgeonId));
    return found ? found.employeeName : surgeonId;
  };

  const fetchRequests = async () => {
    if (!rp.uhid || rp.uhid === "-") return;
    setLoading(true);
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}get_implant_requests/?uhid=${rp.uhid}&ipNumber=${rp.ipNo}`,
        "GET"
      );
      if (res.success) {
        setRequests(res.data?.data || []);
      }
    } catch (e) {
      console.error("Error fetching implant requests:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleImplantSearch = async (val) => {
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}get_implant_items/?search=${encodeURIComponent(val)}`,
        "GET"
      );
      const list = res.success
        ? Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : []
        : [];
      setSearchResults(list);
    } catch (e) {
      console.error("Error searching implant items:", e);
      setSearchResults([]);
    }
  };

  const handleAddItem = () => {
    if (!selectedItem) {
      alert("Please search and select an implant item.");
      return;
    }
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      alert("Please enter a valid quantity.");
      return;
    }

    const exists = selectedItems.find(
      (i) => (i.item_id || i.itemName) === (selectedItem.item_id || selectedItem.itemName)
    );
    if (exists) {
      alert("This item is already added to the list. Remove it first to update quantity.");
      return;
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        item_id: selectedItem.item_id || selectedItem.id || selectedItem._id || "",
        itemName: selectedItem.itemName,
        hsn: selectedItem.hsn || "",
        quantity: qty,
      },
    ]);

    // Reset Item Fields
    setSelectedItem(null);
    setSearchQuery("");
    setQuantity("1");
    setSearchResults([]);
  };

  const handleRemoveItem = (idx) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setSelectedItem(null);
    setSearchQuery("");
    setQuantity("1");
    setSearchResults([]);
    setSelectedItems([]);
    setEditMode(false);
    setEditingRequestId(null);
    setShowForm(false);
  };

  const handleEditRequest = (req) => {
    const prefilled = (req.items || []).map((it) => ({
      item_id: it.item_id || "",
      itemName: it.itemName,
      hsn: it.hsn || "",
      quantity: it.quantity,
    }));
    setSelectedItems(prefilled);
    setEditMode(true);
    setEditingRequestId(req.request_id);
    setShowForm(true);
  };

  const handleDeleteRequest = async (req) => {
    if (!window.confirm("Are you sure you want to delete this implant request?")) return;
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}delete_implant_request/`,
        "PATCH",
        { request_id: req.request_id }
      );
      if (res.success) {
        alert("Implant request deleted successfully!");
        fetchRequests();
      } else {
        alert(res.error || res.message || "Failed to delete request.");
      }
    } catch (e) {
      console.error("Delete Request Error:", e);
      alert("An error occurred while deleting.");
    }
  };

  const handleSaveRequest = async () => {
    if (!selectedItems.length) {
      alert("Please add at least one implant item.");
      return;
    }

    try {
      if (editMode) {
        const res = await apiRequest(
          `${HmsBaseUrl}update_implant_request/`,
          "PUT",
          {
            request_id: editingRequestId,
            items: selectedItems,
          }
        );
        if (res.success) {
          alert("Implant request updated successfully!");
          resetForm();
          fetchRequests();
        } else {
          alert(res.error || "Failed to update implant request.");
        }
      } else {
        const res = await apiRequest(
          `${HmsBaseUrl}save_implant_request/`,
          "POST",
          {
            uhid: rp.uhid,
            ipNumber: rp.ipNo,
            surgeon_id: rp.doctor !== "-" ? rp.doctor : "",
            surgeryRef: "",
            items: selectedItems,
          }
        );
        if (res.success) {
          alert("Implant request saved successfully!");
          resetForm();
          fetchRequests();
        } else {
          alert(res.error || "Failed to save implant request.");
        }
      }
    } catch (e) {
      console.error("Save Implant Request Error:", e);
      alert("An error occurred while saving.");
    }
  };

  return (
    <Body>
      {/* Patient Information Card */}
      <PatientCard>
        <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: `1px dashed ${colors.border}` }}>
          <Label>Patient Information</Label>
          <h2 style={{ margin: "4px 0 0 0", color: colors.primary, fontSize: "1.4rem", fontWeight: 800 }}>
            {rp.name}
          </h2>
        </div>
        <InfoGrid>
          <InfoItem>
            <Label>UHID</Label>
            <Value>{rp.uhid}</Value>
          </InfoItem>
          <InfoItem>
            <Label>IP Number</Label>
            <Value>{rp.ipNo}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Assigned Doctor</Label>
            <Value>{rp.doctor}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Room / Bed</Label>
            <Value>{rp.roomBed}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Customer Type</Label>
            <Value>{rp.customerType}</Value>
          </InfoItem>
          {rp.companyName !== "-" && (
            <InfoItem>
              <Label>Insurance / Company</Label>
              <Value>{rp.companyName}</Value>
            </InfoItem>
          )}
        </InfoGrid>
      </PatientCard>

      {/* Requests History List / Form Section */}
      {!showForm ? (
        <>
          <SectionHeader>
            <h3>Implant Requests History</h3>
          </SectionHeader>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
              Loading implant requests...
            </div>
          ) : requests.length === 0 ? (
            <EmptyState>
              <FiAlertCircle />
              <h3>No Implant Requests Found</h3>
              <p style={{ margin: "4px 0 16px", fontSize: "0.85rem" }}>
                No active implant requests have been submitted for this patient yet.
              </p>
            </EmptyState>
          ) : (
            <TableWrapper>
              <Table>
                <thead>
                  <Tr>
                    <Th style={{ width: "80px" }}>Req ID</Th>
                    <Th style={{ width: "120px" }}>Date & Time</Th>
                    <Th style={{ width: "140px" }}>Doctor</Th>
                    <Th>Requested Items</Th>
                    <Th style={{ width: "100px", textAlign: "center" }}>Status</Th>
                  </Tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <Tr key={req.request_id}>
                      <Td style={{ fontWeight: 700 }}>#{req.request_id}</Td>
                      <Td>
                        <div>{req.reqDate}</div>
                        <div style={{ fontSize: "0.75rem", color: colors.textMuted, marginTop: "2px" }}>{req.reqTime}</div>
                      </Td>
                      <Td style={{ fontWeight: 500 }}>
                        <div>{getDoctorName(req.surgeon_id)}</div>
                        {req.surgeryRef && (
                          <div style={{ fontSize: "0.75rem", color: colors.textMuted, marginTop: "2px" }}>
                            OT Ref: {req.surgeryRef}
                          </div>
                        )}
                      </Td>
                      <Td>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          {(req.items || []).map((it, idx) => (
                            <ReqItemBadge key={idx}>
                              {it.itemName} <strong style={{ color: colors.primary }}>x{it.quantity}</strong>
                            </ReqItemBadge>
                          ))}
                        </div>
                      </Td>
                      <Td style={{ textAlign: "center" }}>
                        <StatusBadge $status={req.status}>{req.status}</StatusBadge>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          )}
        </>
      ) : (
        <FormContainer>
          <SectionHeader>
            <h3>{editMode ? "✏️ Edit Implant Request" : "🛠️ New Implant Request"}</h3>
          </SectionHeader>

          <FormGrid>
            {/* Implant Search Field */}
            <FormItem style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: colors.textMuted }}>Search Implant Item</label>
              <ImplantSearchField
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                onSearch={handleImplantSearch}
                searchResults={searchResults}
              />
            </FormItem>

            {/* Quantity */}
            <FormItem>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: colors.textMuted }}>Quantity</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </FormItem>

            {/* HSN Code (Read Only) */}
            <FormItem>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: colors.textMuted }}>HSN Code</label>
              <Input
                value={selectedItem?.hsn || ""}
                readOnly
                style={{ background: "#f1f5f9", color: colors.textMuted }}
                placeholder="Auto-filled"
              />
            </FormItem>
          </FormGrid>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "20px" }}>
            <GlobalButton secondary onClick={() => { setSelectedItem(null); setSearchQuery(""); setQuantity("1"); setSearchResults([]); }}>
              Reset
            </GlobalButton>
            <GlobalButton onClick={handleAddItem}>
              <FiPlus /> Add Item
            </GlobalButton>
          </div>

          <SectionHeader>
            <h3>Added Implant Items ({selectedItems.length})</h3>
          </SectionHeader>

          {selectedItems.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: colors.textMuted, background: "#f8fafc", borderRadius: "12px", border: `1px solid ${colors.border}` }}>
              No items added. Search and add implant items above.
            </div>
          ) : (
            <SelectedItemsTableWrapper>
              <Table>
                <thead>
                  <Tr>
                    <Th>Item Name</Th>
                    <Th style={{ width: "120px" }}>HSN Code</Th>
                    <Th style={{ width: "100px", textAlign: "center" }}>Quantity</Th>
                    <Th style={{ width: "80px", textAlign: "center" }}>Remove</Th>
                  </Tr>
                </thead>
                <tbody>
                  {selectedItems.map((it, idx) => (
                    <Tr key={idx}>
                      <Td style={{ fontWeight: 600 }}>{it.itemName}</Td>
                      <Td>{it.hsn || "-"}</Td>
                      <Td style={{ textAlign: "center", fontWeight: 700 }}>{it.quantity}</Td>
                      <Td style={{ textAlign: "center" }}>
                        <GlobalButton
                          style={{ padding: "4px 8px", background: colors.danger + "15", color: colors.danger, border: `1px solid ${colors.danger}30`, margin: "0 auto" }}
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <FiTrash2 size={12} />
                        </GlobalButton>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </SelectedItemsTableWrapper>
          )}

          {/* Footer buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: `1px solid ${colors.border}50` }}>
            <GlobalButton secondary onClick={resetForm}>
              Cancel
            </GlobalButton>
            <GlobalButton success onClick={handleSaveRequest}>
              <FiCheckCircle /> {editMode ? "Update Request" : "Save Request"}
            </GlobalButton>
          </div>
        </FormContainer>
      )}

      {/* Modal Footer */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px", padding: "12px 0", borderTop: `1px solid ${colors.border}30` }}>
        <GlobalButton secondary onClick={onClose}>
          Close Modal
        </GlobalButton>
      </div>
    </Body>
  );
}
