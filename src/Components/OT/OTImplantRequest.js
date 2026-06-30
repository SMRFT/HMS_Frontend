import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Eye, Trash2 } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";

// ─── Color palette (mirrors OTMedicineBilling) ───────────────────────────────
const colors = {
  primary: "#136A63",
  primaryDark: "#0B4C47",
  orange: "#F88C22",
  orangeHover: "#E67D1E",
  dark: "#37474F",
  border: "#CFD8DC",
  background: "#F5F7F8",
  textMain: "#263238",
  textMuted: "#78909C",
  white: "#FFFFFF",
  headerBg: "#546E7A",
  legPending: "#FFC107",
  legBilled: "#28A745",
  legCancelled: "#6C757D",
  legProcessed: "#8b5edd",
};

// ─── Layout ───────────────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${colors.background};
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: #ffffff;
  border-bottom: 1px solid ${colors.border};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid ${colors.primary};
  color: ${colors.primary};
  border-radius: 6px;
  padding: 5px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: ${colors.primary};
    color: #fff;
  }
`;

const PageTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SurgeryRefChip = styled.span`
  font-size: 0.74rem;
  font-weight: 600;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 20px;
  padding: 2px 10px;
`;

const EmergencyChip = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  border-radius: 20px;
  padding: 2px 10px;
  animation: blink 1s step-start infinite;
  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;

// ─── Patient panel ────────────────────────────────────────────────────────────
const PatientPanel = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 15px 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
`;
const PatientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px 16px;
  @media (max-width: 1300px) {
    grid-template-columns: repeat(4, 2fr);
  }
`;
const FieldBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const FieldLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;
const FieldValue = styled.div`
  background: #f1f5f7;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 0.85rem;
  color: ${colors.textMain};
  min-height: 32px;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

// ─── Form ─────────────────────────────────────────────────────────────────────
const TopActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
`;
const RequestBtn = styled.button`
  background: ${colors.orange};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    transform 0.1s,
    background 0.2s;
  box-shadow: 0 4px 6px rgba(248, 140, 34, 0.2);
  &:hover {
    background: ${colors.orangeHover};
    transform: translateY(-1px);
  }
`;

const EditModeBanner = styled.div`
  background: #fffbeb;
  border: 1.5px solid #f59e0b;
  border-radius: 8px;
  padding: 10px 18px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #92400e;
`;

const RequestFormWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 0;
  border: 1px solid ${colors.border};
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 25px;
  background: ${colors.white};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
`;
const FormPanel = styled.div`
  padding: 24px;
  border-right: 1px solid ${colors.border};
`;
const SidePanel = styled.div`
  background: #fdfdfd;
  display: flex;
  flex-direction: column;
`;
const SidePanelHeader = styled.div`
  background: #f1f5f7;
  padding: 12px 20px;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${colors.dark};
  border-bottom: 1px solid ${colors.border};
`;
const SidePanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 480px;
`;
const SidePanelFooter = styled.div`
  padding: 20px;
  border-top: 1px solid ${colors.border};
  background: #f9fbfc;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px 20px;
  margin-bottom: 20px;
`;
const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`;
const FormLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${colors.textMuted};
`;

const StyledInput = styled.input`
  border: 1px solid ${colors.border};
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(19, 106, 99, 0.1);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;
const AddBtn = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: ${colors.primaryDark};
  }
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;
const CancelBtn = styled.button`
  background: ${colors.textMuted};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-weight: 600;
  cursor: pointer;
`;

// ─── Searchable implant dropdown ──────────────────────────────────────────────
const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
`;
const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${colors.primary};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 240px;
  overflow-y: auto;
  z-index: 1000;
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: 0 0 6px 6px;
`;
const DropdownItem = styled.li`
  padding: 10px 15px;
  font-size: 0.88rem;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  color: ${colors.textMain};
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: ${colors.background};
    color: ${colors.primaryDark};
    font-weight: 600;
  }
`;

// ─── Selected items table ─────────────────────────────────────────────────────
const SelectedTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
`;
const SelTh = styled.th`
  background: ${colors.headerBg};
  color: white;
  padding: 9px 12px;
  text-align: left;
  font-size: 0.77rem;
  font-weight: 600;
  &:last-child {
    text-align: center;
  }
`;
const SelTd = styled.td`
  padding: 9px 12px;
  border-bottom: 1px solid #edf2f4;
  color: ${colors.textMain};
  vertical-align: middle;
  &:last-child {
    text-align: center;
  }
`;

// ─── Request history table ────────────────────────────────────────────────────
const TabsBar = styled.div`
  display: flex;
  gap: 15px;
  margin: 30px 0 15px 0;
  border-bottom: 2px solid ${colors.border};
`;
const Tab = styled.div`
  padding: 8px 25px;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${(p) => (p.active ? colors.primary : colors.textMuted)};
  border-bottom: 3px solid ${(p) => (p.active ? colors.primary : "transparent")};
  margin-bottom: -2px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  th {
    background: ${colors.headerBg};
    color: white;
    padding: 12px 15px;
    text-align: left;
    font-size: 0.8rem;
    font-weight: 600;
  }
  td {
    padding: 12px 15px;
    font-size: 0.88rem;
    border-bottom: 1px solid #edf2f4;
    color: ${colors.textMain};
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tbody tr:hover {
    background: #f8fafb;
  }
`;

const StatusChip = styled.span`
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${(p) =>
    p.s === "Pending"
      ? "#FFF3CD"
      : p.s === "Processed"
        ? "#ede9fe"
        : p.s === "Cancelled"
          ? "#f3f4f6"
          : "#dcfce7"};
  color: ${(p) =>
    p.s === "Pending"
      ? "#856404"
      : p.s === "Processed"
        ? "#6d28d9"
        : p.s === "Cancelled"
          ? "#6b7280"
          : "#166534"};
`;

// ─── View modal ───────────────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;
const ModalContainer = styled.div`
  background: ${colors.background};
  width: 96%;
  max-width: 700px;
  height: auto;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  background: ${colors.primary};
  color: white;
  button {
    background: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }
`;
const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

// ─── Implant search field ─────────────────────────────────────────────────────
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
  const listRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      listRef.current
        .querySelector(`[data-idx="${activeIdx}"]`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

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
      setActiveIdx((p) => (p + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((p) => (p - 1 + total) % total);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && searchResults[activeIdx])
        selectItem(searchResults[activeIdx]);
      else if (searchResults.length === 1) selectItem(searchResults[0]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIdx(-1);
    } else if (e.key === "Tab") {
      setIsOpen(false);
      setActiveIdx(-1);
    }
  };

  return (
    <SearchWrapper ref={wrapperRef}>
      <StyledInput
        type="text"
        placeholder="Search implant item (min 2 chars)..."
        value={selectedItem ? selectedItem.itemName : searchQuery}
        onChange={handleChange}
        onFocus={() => {
          if (searchQuery.length >= 2 || searchResults.length > 0)
            setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
      />
      {isOpen && (
        <DropdownList ref={listRef} role="listbox">
          {searchResults.length === 0 && searchQuery.length >= 2 && (
            <DropdownItem
              style={{
                color: colors.textMuted,
                fontStyle: "italic",
                cursor: "default",
              }}
            >
              No implant items found
            </DropdownItem>
          )}
          {searchResults.map((item, i) => (
            <DropdownItem
              key={item.id || item._id || i}
              data-idx={i}
              role="option"
              aria-selected={activeIdx === i}
              style={{
                background: activeIdx === i ? "#f0fdf4" : undefined,
                fontWeight: activeIdx === i ? 600 : undefined,
                color: activeIdx === i ? colors.primary : undefined,
              }}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => selectItem(item)}
            >
              <span style={{ fontWeight: 600 }}>{item.itemName}</span>
              {item.hsn && (
                <span
                  style={{
                    fontSize: "0.74rem",
                    color: colors.textMuted,
                    marginLeft: 8,
                  }}
                >
                  HSN: {item.hsn}
                </span>
              )}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </SearchWrapper>
  );
};

// ─── View Items Modal ─────────────────────────────────────────────────────────
const ViewItemsModal = ({ request, onClose }) => {
  if (!request) return null;
  const items = request.items || [];

  return (
    <ModalOverlay style={{ zIndex: 2100 }}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Eye size={18} />
            <span style={{ fontWeight: 700, fontSize: "1rem" }}>
              Implant Items — {request.reqDate} {request.reqTime}
            </span>
          </div>
          <button onClick={onClose}>×</button>
        </ModalHeader>
        <ModalBody>
          {items.length > 0 ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.88rem",
              }}
            >
              <thead>
                <tr style={{ background: colors.headerBg, color: "#fff" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left" }}>
                    Sl.No
                  </th>
                  <th style={{ padding: "10px 14px", textAlign: "left" }}>
                    Item Name
                  </th>
                  <th style={{ padding: "10px 14px", textAlign: "left" }}>
                    HSN
                  </th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: `1px solid ${colors.border}` }}
                  >
                    <td
                      style={{ padding: "10px 14px", color: colors.textMuted }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        fontWeight: 600,
                        color: colors.primary,
                      }}
                    >
                      {it.itemName}
                    </td>
                    <td
                      style={{ padding: "10px 14px", color: colors.textMuted }}
                    >
                      {it.hsn || "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      {it.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: colors.textMuted,
              }}
            >
              No items found for this request.
            </div>
          )}
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OTImplantRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const pd = location.state?.patientData || {};
  const resolvedPatient = {
    ipNo: pd.ipNumber || "-",
    uhid: pd.uhid || "-",
    name: pd.patient_name || pd.firstName || "Unknown Patient",
    age: pd.age || "-",
    gender: pd.gender || "-",
    surgeonName: pd.surgeonName || "-",
    surgeonId: pd.surgeonId || "-",
    roomBed: `${pd.roomNo || "-"} | ${pd.bedNo || "-"}`,
    customerType: pd.customerType || pd.customer_type || "-",
    companyName: pd.companyName || pd.company_name || "-",
    surgeryRef: pd.surgeryRef || "",
    is_emergency: !!pd.is_emergency,
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [requests, setRequests] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [searchResults, setSearchResults] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [viewingRequest, setViewingRequest] = useState(null);

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchRequests();
  }, []); // eslint-disable-line

  // ── API: fetch existing requests ───────────────────────────────────────────
  const fetchRequests = async () => {
    const res = await apiRequest(
      `${HmsBaseUrl}get_implant_requests/?uhid=${pd.uhid || ""}&ipNumber=${pd.ipNumber || ""}`,
      "GET",
    );
    if (res.success) setRequests(res.data?.data || []);
  };

  // ── API: search implant items ──────────────────────────────────────────────
  const handleImplantSearch = async (val) => {
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    const res = await apiRequest(
      `${HmsBaseUrl}get_implant_items/?search=${encodeURIComponent(val)}`,
      "GET",
    );
    const list = res.success
      ? Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : []
      : [];
    setSearchResults(list);
  };

  // ── Add item to selection ──────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!selectedItem) return alert("Please select an implant item.");
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) return alert("Enter a valid quantity.");
    // Prevent duplicate items
    if (
      selectedItems.find(
        (i) =>
          (i.item_id || i.itemName) ===
          (selectedItem.item_id || selectedItem.itemName),
      )
    ) {
      return alert("Item already added. Remove it first to change quantity.");
    }
    setSelectedItems((prev) => [
      ...prev,
      {
        item_id:
          selectedItem.item_id || selectedItem.id || selectedItem._id || "",
        itemName: selectedItem.itemName,
        hsn: selectedItem.hsn || "",
        quantity: qty,
      },
    ]);
    resetItemFields();
  };

  const resetItemFields = () => {
    setSelectedItem(null);
    setSearchQuery("");
    setQuantity("1");
    setSearchResults([]);
  };

  const removeItem = (idx) =>
    setSelectedItems((prev) => prev.filter((_, i) => i !== idx));

  const resetForm = () => {
    resetItemFields();
    setSelectedItems([]);
    setEditMode(false);
    setEditingRequestId(null);
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEditModal = (req) => {
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (req) => {
    if (
      !window.confirm("Are you sure you want to delete this implant request?")
    )
      return;
    const res = await apiRequest(
      `${HmsBaseUrl}delete_implant_request/`,
      "PATCH",
      { request_id: req.request_id },
    );
    if (res.success) {
      alert("Implant request deleted successfully");
      fetchRequests();
    } else alert(res.error || res.message || "Delete failed");
  };

  // ── Confirm / Update ───────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!selectedItems.length) return alert("No items added.");

    if (editMode) {
      const res = await apiRequest(
        `${HmsBaseUrl}update_implant_request/`,
        "PUT",
        {
          request_id: editingRequestId,
          items: selectedItems,
        },
      );
      if (res.success) {
        alert("Implant request updated successfully");
        resetForm();
        setShowForm(false);
        fetchRequests();
      } else alert(res.error || "Update failed");
    } else {
      const res = await apiRequest(
        `${HmsBaseUrl}save_implant_request/`,
        "POST",
        {
          uhid: resolvedPatient.uhid,
          ipNumber: resolvedPatient.ipNo,
          surgeon_id: resolvedPatient.surgeonId,
          surgeryRef: resolvedPatient.surgeryRef,
          items: selectedItems,
        },
      );
      if (res.success) {
        alert("Implant request saved successfully");
        resetForm();
        setShowForm(false);
        fetchRequests();
      }
    }
  };

  const handleToggleForm = () => {
    if (showForm) {
      setShowForm(false);
      resetForm();
    } else {
      setEditMode(false);
      setShowForm(true);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Pending") return colors.legPending;
    if (status === "Processed") return colors.legProcessed;
    if (status === "Cancelled") return colors.legCancelled;
    return colors.legBilled;
  };

  // ─── JSX ───────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      {/* ── Top bar ── */}
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>← Back</BackBtn>
        <PageTitle>
          🔩 OT Implant Request
          {resolvedPatient.surgeryRef && (
            <SurgeryRefChip>🔗 {resolvedPatient.surgeryRef}</SurgeryRefChip>
          )}
          {resolvedPatient.is_emergency && (
            <EmergencyChip>⚡ EMERGENCY</EmergencyChip>
          )}
        </PageTitle>
      </TopBar>

      <div style={{ padding: "20px" }}>
        {/* ── Patient panel ── */}
        <PatientPanel>
          <PatientGrid>
            {[
              ["IP No", resolvedPatient.ipNo],
              ["UHID", resolvedPatient.uhid],
              ["Name", resolvedPatient.name],
              ["Age", resolvedPatient.age],
              ["Gender", resolvedPatient.gender],
              ["Surgeon", resolvedPatient.surgeonName],
              ["Room | Bed", resolvedPatient.roomBed],
              ["Customer Type", resolvedPatient.customerType],
              ["Company", resolvedPatient.companyName],
            ].map(([label, val]) => (
              <FieldBox key={label}>
                <FieldLabel>{label}</FieldLabel>
                <FieldValue>{val}</FieldValue>
              </FieldBox>
            ))}
          </PatientGrid>
        </PatientPanel>

        {/* ── Toggle button ── */}
        <TopActionBar>
          <RequestBtn onClick={handleToggleForm}>
            {showForm
              ? "✕ Close Form"
              : editMode
                ? "✏️ Edit Implant Request"
                : "＋ New Implant Request"}
          </RequestBtn>
        </TopActionBar>

        {/* ── Form ── */}
        {showForm && (
          <>
            {editMode && (
              <EditModeBanner>
                ✏️ You are editing an existing request. Modify the items in the
                panel on the right, then click <strong>Update Request</strong>{" "}
                to save.
              </EditModeBanner>
            )}

            <RequestFormWrapper>
              {/* Left: search & add */}
              <FormPanel>
                <FormGrid>
                  {/* Implant search — full width */}
                  <FormItem style={{ gridColumn: "span 2" }}>
                    <FormLabel>Search Implant Item (min 2 chars)</FormLabel>
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
                    <FormLabel>Quantity</FormLabel>
                    <StyledInput
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter quantity"
                    />
                  </FormItem>

                  {/* HSN display — readonly */}
                  <FormItem>
                    <FormLabel>HSN Code</FormLabel>
                    <StyledInput
                      value={selectedItem?.hsn || ""}
                      readOnly
                      style={{ background: "#f1f5f7", color: colors.textMuted }}
                      placeholder="Auto-filled"
                    />
                  </FormItem>
                </FormGrid>

                <ActionButtons>
                  <CancelBtn onClick={resetItemFields}>✕ Reset</CancelBtn>
                  <AddBtn onClick={handleAddItem}>＋ Add Item</AddBtn>
                </ActionButtons>
              </FormPanel>

              {/* Right: selected items */}
              <SidePanel>
                <SidePanelHeader>
                  {editMode ? "✏️ Editing Items" : "Selected Implant Items"} (
                  {selectedItems.length})
                </SidePanelHeader>
                <SidePanelContent>
                  {selectedItems.length === 0 ? (
                    <div
                      style={{
                        padding: "40px 20px",
                        textAlign: "center",
                        color: colors.textMuted,
                        fontSize: "0.85rem",
                      }}
                    >
                      {editMode
                        ? "All items removed. Add new ones using the form."
                        : "No items added yet."}
                    </div>
                  ) : (
                    <SelectedTable>
                      <thead>
                        <tr>
                          <SelTh style={{ width: 40 }}>Sl.No</SelTh>
                          <SelTh>Item Name</SelTh>
                          <SelTh style={{ width: 70, textAlign: "right" }}>
                            Qty
                          </SelTh>
                          <SelTh style={{ width: 44 }}>✕</SelTh>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((it, i) => (
                          <tr key={i}>
                            <SelTd
                              style={{
                                color: colors.textMuted,
                                fontWeight: 600,
                              }}
                            >
                              {i + 1}
                            </SelTd>
                            <SelTd>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: colors.primary,
                                  fontSize: "0.84rem",
                                }}
                              >
                                {it.itemName}
                              </div>
                              {it.hsn && (
                                <div
                                  style={{
                                    fontSize: "0.72rem",
                                    color: colors.textMuted,
                                  }}
                                >
                                  HSN: {it.hsn}
                                </div>
                              )}
                            </SelTd>
                            <SelTd
                              style={{ textAlign: "right", fontWeight: 700 }}
                            >
                              {it.quantity}
                            </SelTd>
                            <SelTd>
                              <button
                                onClick={() => removeItem(i)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#e53935",
                                  cursor: "pointer",
                                  padding: "2px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </SelTd>
                          </tr>
                        ))}
                      </tbody>
                    </SelectedTable>
                  )}
                </SidePanelContent>
                <SidePanelFooter>
                  <AddBtn
                    style={{ width: "100%", padding: "12px" }}
                    onClick={handleConfirm}
                  >
                    {editMode ? "💾 Update Request" : "✅ Confirm Request"}
                  </AddBtn>
                </SidePanelFooter>
              </SidePanel>
            </RequestFormWrapper>
          </>
        )}

        {/* ── Request History ── */}
        <TabsBar>
          <Tab active={true}>Request History</Tab>
        </TabsBar>

        <StyledTable>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Request Date &amp; Time</th>
              <th>Items</th>
              <th>Surgery Ref</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: colors.textMuted,
                  }}
                >
                  No implant request history found.
                </td>
              </tr>
            ) : (
              requests.map((req, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: colors.primary }}>
                    {req.request_id}
                  </td>
                  <td>
                    {req.reqDate} {req.reqTime}
                  </td>
                  <td>
                    <button
                      title="View items"
                      onClick={() => setViewingRequest(req)}
                      style={{
                        background: "none",
                        border: `1px solid ${colors.primary}`,
                        color: colors.primary,
                        borderRadius: 5,
                        padding: "3px 10px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Eye size={13} /> View ({(req.items || []).length})
                    </button>
                  </td>
                  <td>{req.surgeryRef || "—"}</td>
                  <td>
                    <StatusChip s={req.status || "Pending"}>
                      {req.status || "Pending"}
                    </StatusChip>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        disabled={(req.status || "Pending") !== "Pending"}
                        onClick={() => openEditModal(req)}
                        style={{
                          background:
                            (req.status || "Pending") === "Pending"
                              ? colors.primary
                              : "#cbd5e1",
                          color: "white",
                          border: "none",
                          borderRadius: 5,
                          padding: "5px 12px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor:
                            (req.status || "Pending") === "Pending"
                              ? "pointer"
                              : "not-allowed",
                          opacity:
                            (req.status || "Pending") === "Pending" ? 1 : 0.5,
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        disabled={(req.status || "Pending") !== "Pending"}
                        onClick={() => handleDelete(req)}
                        style={{
                          background:
                            (req.status || "Pending") === "Pending"
                              ? "#e53935"
                              : "#cbd5e1",
                          color: "white",
                          border: "none",
                          borderRadius: 5,
                          padding: "5px 12px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor:
                            (req.status || "Pending") === "Pending"
                              ? "pointer"
                              : "not-allowed",
                          opacity:
                            (req.status || "Pending") === "Pending" ? 1 : 0.5,
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </StyledTable>
      </div>

      {/* ── View Items Modal ── */}
      {viewingRequest && (
        <ViewItemsModal
          request={viewingRequest}
          onClose={() => setViewingRequest(null)}
        />
      )}
    </PageWrapper>
  );
};

export default OTImplantRequest;
