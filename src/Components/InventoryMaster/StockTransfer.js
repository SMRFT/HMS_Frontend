import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container,
  PageWrapper,
  FormContent,
  FormRow,
  InputWrapper,
  Label,
  Input,
  Button,
  ButtonContainer,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
} from "../GlobalStyles";
import styled from "styled-components";

// ─── Styled Components ────────────────────────────────────────────────────────

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

const NewTransferBtn = styled.button`
  background: #f97316;
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #ea6c0a;
  }
`;

const SectionTitle = styled.h4`
  color: #0d9488;
  margin: 0 0 16px;
  font-size: 0.95rem;
  font-weight: 700;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ status }) =>
    status === "Approved"
      ? "#0d9488"
      : status === "Pending"
      ? "#f59e0b"
      : "#6b7280"};
  color: white;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
`;

const FilterLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
`;

const FilterInput = styled.input`
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #374151;
  outline: none;
  &:focus {
    border-color: #0d9488;
  }
`;

const FilterSelect = styled.select`
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #374151;
  outline: none;
  &:focus {
    border-color: #0d9488;
  }
`;

const SearchBtn = styled.button`
  background: #0d9488;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  height: 34px;
  align-self: flex-end;
  &:hover {
    background: #0f766e;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 16px 22px;
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalClose = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
  line-height: 1;
`;

const ModalBody = styled.div`
  padding: 22px;
`;

const SearchDropdown = styled.div`
  position: absolute;
  z-index: 999;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  top: calc(100% + 2px);
  left: 0;
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  color: #374151;
  &:hover {
    background: #f0fdfa;
    color: #0d9488;
  }
`;

const RelativeWrapper = styled.div`
  position: relative;
`;

const AddedItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
`;

const ATh = styled.th`
  background: #f0fdfa;
  color: #0f766e;
  padding: 8px 10px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #d1fae5;
`;

const ATd = styled.td`
  padding: 7px 10px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
`;

const RemoveBtn = styled.button`
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #fca5a5;
  }
`;

const AddBtn = styled.button`
  background: #d1fae5;
  color: #059669;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #6ee7b7;
  }
`;

const ActionMenuWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const ActionMenuBtn = styled.button`
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 1rem;
  color: #6b7280;
  &:hover {
    background: #f3f4f6;
  }
`;

const ActionMenu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 130px;
`;

const ActionMenuItem = styled.div`
  padding: 8px 14px;
  font-size: 0.82rem;
  color: #374151;
  cursor: pointer;
  &:hover {
    background: #f0fdfa;
    color: #0d9488;
  }
`;

// ─── Print Slip Styles (injected at runtime) ──────────────────────────────────
const PRINT_STYLES = `
  @media print {
    body * { visibility: hidden !important; }
    #stock-transfer-slip, #stock-transfer-slip * { visibility: visible !important; }
    #stock-transfer-slip {
      position: fixed; left: 0; top: 0; width: 100%;
      font-family: monospace; font-size: 12px; padding: 10px;
    }
  }
`;

// ─── Financial Year Helper ─────────────────────────────────────────────────────
function getCurrentFinYear() {
  const today = new Date();
  const fromYr = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  return `${String(fromYr).slice(-2)}${String(fromYr + 1).slice(-2)}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const StockTransfer = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── State ──────────────────────────────────────────────────────────────────
  const [outlets, setOutlets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [fromOutlet, setFromOutlet] = useState("Drug Purchase");
  const [toOutlet, setToOutlet] = useState("");
  const [transferRefNumber, setTransferRefNumber] = useState("");
  const [addedItems, setAddedItems] = useState([]);

  // Medicine search state
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineResults, setMedicineResults] = useState([]);
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [batchInfo, setBatchInfo] = useState({ batch_number: "", hsn_code: "" });
  const [transferQty, setTransferQty] = useState("");
  const medicineSearchRef = useRef(null);

  // Filter state
  const [filterFromOutlet, setFilterFromOutlet] = useState("All");
  const [filterToOutlet, setFilterToOutlet] = useState("All");
  const [filterFromDate, setFilterFromDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-04-01`;
  });
  const [filterToDate, setFilterToDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  // Action menu
  const [openMenuId, setOpenMenuId] = useState(null);
  const [printSlip, setPrintSlip] = useState(null);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchOutlets();
    fetchTransfers();
    injectPrintStyles();
  }, []);

  useEffect(() => {
    if (showModal) generateRefNumber();
  }, [showModal]);

  useEffect(() => {
    const handler = (e) => {
      if (medicineSearchRef.current && !medicineSearchRef.current.contains(e.target)) {
        setShowMedDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function injectPrintStyles() {
    if (!document.getElementById("stock-transfer-print-style")) {
      const style = document.createElement("style");
      style.id = "stock-transfer-print-style";
      style.innerHTML = PRINT_STYLES;
      document.head.appendChild(style);
    }
  }

  // ── API Calls ──────────────────────────────────────────────────────────────

  const fetchOutlets = async () => {
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}get_active_outlets/`,
        "GET"
      );
      if (response && !response.error && Array.isArray(response.data)) {
        setOutlets(response.data);
      }
    } catch {
      toast.error("Failed to fetch outlets");
    }
  };

  const fetchTransfers = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.from_outlet && filters.from_outlet !== "All")
        params.append("from_outlet", filters.from_outlet);
      if (filters.to_outlet && filters.to_outlet !== "All")
        params.append("to_outlet", filters.to_outlet);
      if (filters.from_date) params.append("from_date", filters.from_date);
      if (filters.to_date) params.append("to_date", filters.to_date);

      const url = `${HmsBaseUrl}stock-transfer/${params.toString() ? "?" + params.toString() : ""}`;
      const response = await apiRequest(url, "GET");
      if (response && !response.error && Array.isArray(response.data)) {
        setTransfers(response.data);
      } else {
        setTransfers([]);
      }
    } catch {
      toast.error("Failed to fetch transfers");
    }
  };

  const generateRefNumber = async () => {
    try {
      const finYear = getCurrentFinYear();
      const prefix = `${finYear}/`;
      const response = await apiRequest(
        `${HmsBaseUrl}stock-transfer/?ref_prefix=${finYear}`,
        "GET"
      );
      let maxSeq = 0;
      if (response && !response.error && Array.isArray(response.data)) {
        response.data.forEach((t) => {
          if (t.transfer_ref_number && t.transfer_ref_number.startsWith(prefix)) {
            const seq = parseInt(t.transfer_ref_number.split("/")[1] || "0", 10);
            if (seq > maxSeq) maxSeq = seq;
          }
        });
      }
      setTransferRefNumber(`${finYear}/${String(maxSeq + 1).padStart(6, "0")}`);
    } catch {
      const finYear = getCurrentFinYear();
      setTransferRefNumber(`${finYear}/000001`);
    }
  };

  const searchMedicines = async (query) => {
    if (!query || query.length < 2) {
      setMedicineResults([]);
      setShowMedDropdown(false);
      return;
    }
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}pharmacy-item/?search=${encodeURIComponent(query)}`,
        "GET"
      );
      if (response && !response.error && Array.isArray(response.data)) {
        setMedicineResults(response.data);
        setShowMedDropdown(true);
      } else {
        setMedicineResults([]);
        setShowMedDropdown(false);
      }
    } catch {
      setMedicineResults([]);
    }
  };

  const fetchBatchInfo = async (itemId) => {
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}pharmacy-stock/?item_id=${itemId}`,
        "GET"
      );
      if (response && !response.error && Array.isArray(response.data) && response.data.length > 0) {
        const stock = response.data[0];
        setBatchInfo({
          batch_number: stock.batch_number || "",
          hsn_code: stock.hsn_code || "",
        });
      } else {
        setBatchInfo({ batch_number: "", hsn_code: "" });
      }
    } catch {
      setBatchInfo({ batch_number: "", hsn_code: "" });
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleMedicineSearch = (e) => {
    const val = e.target.value;
    setMedicineSearch(val);
    setSelectedMedicine(null);
    setBatchInfo({ batch_number: "", hsn_code: "" });
    searchMedicines(val);
  };

  const handleSelectMedicine = (med) => {
    setSelectedMedicine(med);
    setMedicineSearch(med.item_name);
    setShowMedDropdown(false);
    fetchBatchInfo(med.item_id);
  };

  const handleAddItem = () => {
    if (!selectedMedicine) {
      toast.error("Please select a medicine");
      return;
    }
    if (!transferQty || isNaN(transferQty) || Number(transferQty) <= 0) {
      toast.error("Enter a valid transfer quantity");
      return;
    }
    const alreadyExists = addedItems.find(
      (i) => i.item_id === selectedMedicine.item_id && i.batch_number === batchInfo.batch_number
    );
    if (alreadyExists) {
      toast.warning("This medicine with same batch is already added");
      return;
    }
    setAddedItems([
      ...addedItems,
      {
        item_id: selectedMedicine.item_id,
        item_name: selectedMedicine.item_name,
        batch_number: batchInfo.batch_number,
        hsn_code: batchInfo.hsn_code,
        transfer_quantity: Number(transferQty),
      },
    ]);
    setMedicineSearch("");
    setSelectedMedicine(null);
    setBatchInfo({ batch_number: "", hsn_code: "" });
    setTransferQty("");
  };

  const handleRemoveItem = (index) => {
    setAddedItems(addedItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!fromOutlet) {
      toast.error("Please select From Outlet");
      return;
    }
    if (!toOutlet) {
      toast.error("Please select To Outlet");
      return;
    }
    if (fromOutlet === toOutlet) {
      toast.error("From and To outlets cannot be the same");
      return;
    }
    if (addedItems.length === 0) {
      toast.error("Please add at least one medicine");
      return;
    }
    try {
      const payload = {
        from_outlet: fromOutlet,
        to_outlet: toOutlet,
        transfer_ref_number: transferRefNumber,
        items: addedItems.map((i) => ({
          item_id: i.item_id,
          batch_number: i.batch_number,
          transfer_quantity: i.transfer_quantity,
        })),
        is_verified: "Draft",
      };
      const response = await apiRequest(`${HmsBaseUrl}stock-transfer/`, "POST", payload);
      if (response && !response.error) {
        toast.success("Stock Transfer saved successfully");
        handleCancel();
        fetchTransfers();
      } else {
        toast.error(response?.error || "Failed to save transfer");
      }
    } catch {
      toast.error("Failed to save transfer");
    }
  };

  const handleCancel = () => {
    setFromOutlet("Drug Purchase");
    setToOutlet("");
    setAddedItems([]);
    setMedicineSearch("");
    setSelectedMedicine(null);
    setBatchInfo({ batch_number: "", hsn_code: "" });
    setTransferQty("");
    setShowModal(false);
  };

  const handleSearch = () => {
    fetchTransfers({
      from_outlet: filterFromOutlet,
      to_outlet: filterToOutlet,
      from_date: filterFromDate,
      to_date: filterToDate,
    });
  };

  const handlePrintSlip = (transfer) => {
    setPrintSlip(transfer);
    setOpenMenuId(null);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // ── Outlet Options ─────────────────────────────────────────────────────────
  const outletOptions = [{ outlet_name: "Drug Purchase", outlet_code: "DRUG_PURCHASE" }, ...outlets];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>
        {/* ── Header ── */}
        <PageHeader>
          <div>
            <PageTitle>📦 Stock Transfer</PageTitle>
            <PageSubtitle>Manage inter-outlet stock transfers</PageSubtitle>
          </div>
          <NewTransferBtn onClick={() => setShowModal(true)}>+ New Transfer</NewTransferBtn>
        </PageHeader>

        {/* ── Filters ── */}
        <FilterRow>
          <FilterGroup>
            <FilterLabel>From Outlet</FilterLabel>
            <FilterSelect
              value={filterFromOutlet}
              onChange={(e) => setFilterFromOutlet(e.target.value)}
            >
              <option value="All">All</option>
              {outletOptions.map((o) => (
                <option key={o.outlet_code || o.outlet_name} value={o.outlet_name}>
                  {o.outlet_name}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>To Outlet</FilterLabel>
            <FilterSelect
              value={filterToOutlet}
              onChange={(e) => setFilterToOutlet(e.target.value)}
            >
              <option value="All">All</option>
              {outletOptions.map((o) => (
                <option key={o.outlet_code || o.outlet_name} value={o.outlet_name}>
                  {o.outlet_name}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>From Date</FilterLabel>
            <FilterInput
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>To Date</FilterLabel>
            <FilterInput
              type="date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
            />
          </FilterGroup>

          <SearchBtn onClick={handleSearch}>🔍 Search</SearchBtn>
        </FilterRow>

        {/* ── Transfer List Table ── */}
        <div style={{ padding: "20px 24px 24px" }}>
          <SectionTitle>Transfer Records</SectionTitle>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th>Ref No</Th>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {transfers.length === 0 ? (
                  <Tr>
                    <Td colSpan="6" style={{ textAlign: "center", color: "#9ca3af" }}>
                      No transfer records found
                    </Td>
                  </Tr>
                ) : (
                  transfers.map((t) => (
                    <Tr key={t.id || t.transfer_ref_number}>
                      <Td>
                        <StatusBadge status={t.is_verified === "Draft" ? "Pending" : "Approved"}>
                          {t.is_verified === "Draft" ? "Draft" : "Approved"}
                        </StatusBadge>
                      </Td>
                      <Td>{t.created_date ? new Date(t.created_date).toLocaleDateString("en-GB") : "-"}</Td>
                      <Td style={{ fontWeight: 600, color: "#0d9488" }}>{t.transfer_ref_number}</Td>
                      <Td>{t.from_outlet}</Td>
                      <Td>{t.to_outlet}</Td>
                      <Td>
                        <ActionMenuWrapper>
                          <ActionMenuBtn
                            onClick={() =>
                              setOpenMenuId(openMenuId === (t.id || t.transfer_ref_number) ? null : (t.id || t.transfer_ref_number))
                            }
                          >
                            ⋮
                          </ActionMenuBtn>
                          {openMenuId === (t.id || t.transfer_ref_number) && (
                            <ActionMenu>
                              <ActionMenuItem onClick={() => handlePrintSlip(t)}>
                                🖨️ Print Slip
                              </ActionMenuItem>
                            </ActionMenu>
                          )}
                        </ActionMenuWrapper>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </div>
      </Container>

      {/* ── New Transfer Modal ── */}
      {showModal && (
        <ModalOverlay onClick={(e) => e.target === e.currentTarget && handleCancel()}>
          <ModalBox>
            <ModalHeader>
              <div>
                <PageTitle style={{ fontSize: "1rem" }}>📦 New Stock Transfer</PageTitle>
                <p style={{ margin: "2px 0 0", fontSize: "0.78rem", opacity: 0.8 }}>
                  Ref: {transferRefNumber}
                </p>
              </div>
              <ModalClose onClick={handleCancel}>✕</ModalClose>
            </ModalHeader>

            <ModalBody>
              {/* ── Outlets Row ── */}
              <FormRow columns="1fr 1fr">
                <InputWrapper>
                  <Label required>From Outlet</Label>
                  <FilterSelect
                    style={{ width: "100%", padding: "9px 10px", fontSize: "0.9rem" }}
                    value={fromOutlet}
                    onChange={(e) => setFromOutlet(e.target.value)}
                  >
                    {outletOptions.map((o) => (
                      <option key={o.outlet_code || o.outlet_name} value={o.outlet_name}>
                        {o.outlet_name}
                      </option>
                    ))}
                  </FilterSelect>
                </InputWrapper>

                <InputWrapper>
                  <Label required>To Outlet</Label>
                  <FilterSelect
                    style={{ width: "100%", padding: "9px 10px", fontSize: "0.9rem" }}
                    value={toOutlet}
                    onChange={(e) => setToOutlet(e.target.value)}
                  >
                    <option value="">-- Select Outlet --</option>
                    {outletOptions.map((o) => (
                      <option key={o.outlet_code || o.outlet_name} value={o.outlet_name}>
                        {o.outlet_name}
                      </option>
                    ))}
                  </FilterSelect>
                </InputWrapper>
              </FormRow>

              {/* ── Medicine Search Row ── */}
              <div
                style={{
                  background: "#f0fdfa",
                  border: "1px solid #d1fae5",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <SectionTitle style={{ marginBottom: 12 }}>Add Medicine</SectionTitle>
                <FormRow columns="2fr 1fr 1fr auto">
                  {/* Medicine Search */}
                  <InputWrapper>
                    <Label required>Medicine</Label>
                    <RelativeWrapper ref={medicineSearchRef}>
                      <Input
                        type="text"
                        value={medicineSearch}
                        onChange={handleMedicineSearch}
                        placeholder="Search medicine..."
                        autoComplete="off"
                      />
                      {showMedDropdown && medicineResults.length > 0 && (
                        <SearchDropdown>
                          {medicineResults.map((med) => (
                            <DropdownItem
                              key={med.item_id}
                              onMouseDown={() => handleSelectMedicine(med)}
                            >
                              {med.item_name}
                            </DropdownItem>
                          ))}
                        </SearchDropdown>
                      )}
                    </RelativeWrapper>
                  </InputWrapper>

                  {/* Batch Number */}
                  <InputWrapper>
                    <Label>Batch No.</Label>
                    <Input
                      type="text"
                      value={batchInfo.batch_number}
                      readOnly
                      style={{ background: "#e5e7eb", cursor: "not-allowed" }}
                      placeholder="Auto-filled"
                    />
                  </InputWrapper>

                  {/* HSN Code */}
                  <InputWrapper>
                    <Label>HSN Code</Label>
                    <Input
                      type="text"
                      value={batchInfo.hsn_code}
                      readOnly
                      style={{ background: "#e5e7eb", cursor: "not-allowed" }}
                      placeholder="Auto-filled"
                    />
                  </InputWrapper>

                  {/* Transfer Qty */}
                  <InputWrapper>
                    <Label required>Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={transferQty}
                      onChange={(e) => setTransferQty(e.target.value)}
                      placeholder="0"
                      style={{ width: 80 }}
                    />
                  </InputWrapper>
                </FormRow>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    style={{ padding: "7px 20px", fontSize: "0.85rem" }}
                  >
                    + Add
                  </Button>
                </div>
              </div>

              {/* ── Added Items Table ── */}
              {addedItems.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <SectionTitle>Added Medicines</SectionTitle>
                  <AddedItemsTable>
                    <thead>
                      <tr>
                        <ATh>#</ATh>
                        <ATh>Medicine</ATh>
                        <ATh>Batch</ATh>
                        <ATh>HSN</ATh>
                        <ATh>Qty</ATh>
                        <ATh>Action</ATh>
                      </tr>
                    </thead>
                    <tbody>
                      {addedItems.map((item, idx) => (
                        <tr key={idx}>
                          <ATd>{idx + 1}</ATd>
                          <ATd style={{ fontWeight: 600 }}>{item.item_name}</ATd>
                          <ATd>{item.batch_number || "-"}</ATd>
                          <ATd>{item.hsn_code || "-"}</ATd>
                          <ATd>{item.transfer_quantity}</ATd>
                          <ATd>
                            <RemoveBtn onClick={() => handleRemoveItem(idx)}>Remove</RemoveBtn>
                          </ATd>
                        </tr>
                      ))}
                    </tbody>
                  </AddedItemsTable>
                </div>
              )}

              {/* ── Modal Buttons ── */}
              <ButtonContainer>
                <Button secondary type="button" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave}>
                  Save Transfer
                </Button>
              </ButtonContainer>
            </ModalBody>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* ── Print Slip (hidden, only shown during print) ── */}
      {printSlip && (
        <div id="stock-transfer-slip" style={{ display: "none" }}>
          <div style={{ fontFamily: "monospace", fontSize: 12, padding: 10 }}>
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 14, marginBottom: 4 }}>
              SHANMUGA HOSPITAL LIMITED
            </div>
            <div style={{ textAlign: "center", marginBottom: 8 }}>04272706666</div>
            <div style={{ textAlign: "center", fontWeight: "bold", marginBottom: 4 }}>
              STOCK TRANSFER SLIP
            </div>
            <div>{"=".repeat(70)}</div>
            <div style={{ marginTop: 6 }}>
              <div>Source : {printSlip.from_outlet}</div>
              <div>Date   : {printSlip.created_date ? new Date(printSlip.created_date).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}</div>
              <div>Destination : {printSlip.to_outlet}</div>
              <div>Ref.   : {printSlip.transfer_ref_number}</div>
            </div>
            <div style={{ marginTop: 6 }}>{"=".repeat(70)}</div>
            <div style={{ marginTop: 4 }}>
              <span style={{ display: "inline-block", width: 30 }}>Sl</span>
              <span style={{ display: "inline-block", width: 180 }}>Particulars</span>
              <span style={{ display: "inline-block", width: 80 }}>Batch</span>
              <span style={{ display: "inline-block", width: 60 }}>Qty</span>
            </div>
            <div>{"-".repeat(70)}</div>
            {(printSlip.items || []).map((item, idx) => (
              <div key={idx}>
                <span style={{ display: "inline-block", width: 30 }}>{idx + 1}</span>
                <span style={{ display: "inline-block", width: 180 }}>
                  {item.item_name || `Item #${item.item_id}`}
                </span>
                <span style={{ display: "inline-block", width: 80 }}>{item.batch_number || "-"}</span>
                <span style={{ display: "inline-block", width: 60 }}>{item.transfer_quantity}</span>
              </div>
            ))}
            <div style={{ marginTop: 6 }}>{"-".repeat(70)}</div>
            <div style={{ marginTop: 4 }}>
              Total Items : {(printSlip.items || []).length}
            </div>
            <div>
              Total Qty   :{" "}
              {(printSlip.items || []).reduce((s, i) => s + Number(i.transfer_quantity || 0), 0)}
            </div>
            <div style={{ marginTop: 6 }}>{"-".repeat(70)}</div>
            <div style={{ marginTop: 6, fontSize: 11, color: "#666" }}>
              Status: {printSlip.is_verified || "Draft"}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default StockTransfer;