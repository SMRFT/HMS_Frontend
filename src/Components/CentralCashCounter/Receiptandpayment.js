import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Search, Mic } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Styled Components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24px;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const CardTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const TealButton = styled.button`
  background-color: #0d9488;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
  &:hover { background-color: #0f766e; }
  &:disabled { background-color: #9ca3af; cursor: not-allowed; }
`;

const OrangeButton = styled.button`
  background-color: #f97316;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
  &:hover { background-color: #ea580c; }
`;

// ─── Form Controls Section ────────────────────────────────────────────────────

const FormSection = styled.div`
  padding: 16px 24px;
  background-color: #f0fafa;
  border-bottom: 1px solid #e5e7eb;
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 160px;
`;

const FormLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 8px 0;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
  color: #374151;
`;

const RadioInput = styled.input`
  accent-color: #0d9488;
  width: 15px;
  height: 15px;
  cursor: pointer;
`;

const StyledSelect = styled.select`
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  min-width: 200px;
  background-color: white;
  color: #1f2937;
  cursor: pointer;
  &:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 2px rgba(13,148,136,0.15); }
`;

const StyledInput = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  min-width: 180px;
  background-color: white;
  color: #1f2937;
  &:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 2px rgba(13,148,136,0.15); }
`;

// ─── Table Section ────────────────────────────────────────────────────────────

const TableSection = styled.div`
  padding: 16px 24px;
`;

const TableControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ShowEntriesGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
`;

const SearchGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
`;

const SearchInputWrapper = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 6px 40px 6px 12px;
  font-size: 14px;
  width: 200px;
`;

const MicButton = styled.button`
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  padding: 3px 6px;
  background-color: #4b5563;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const Th = styled.th`
  border: 1px solid #d1d5db;
  padding: 10px 14px;
  background-color: #f3f4f6;
  font-weight: 600;
  text-align: left;
  color: #374151;
  white-space: nowrap;
`;

const Td = styled.td`
  border: 1px solid #d1d5db;
  padding: 10px 14px;
  color: ${(p) => (p.muted ? "#9ca3af" : "#374151")};
  text-align: ${(p) => (p.center ? "center" : "left")};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 13px;
  color: #6b7280;
`;

const PaginationButton = styled.button`
  padding: 5px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  color: #6b7280;
  cursor: pointer;
  font-size: 13px;
  &:hover { background-color: #f3f4f6; }
`;

// ─── Alert / Feedback ─────────────────────────────────────────────────────────

const AlertBox = styled.div`
  padding: 10px 16px;
  border-radius: 4px;
  margin: 0 24px 16px;
  font-size: 14px;
  background-color: ${({ type }) => type === "error" ? "#fef2f2" : "#f0fdf4"};
  color: ${({ type }) => type === "error" ? "#dc2626" : "#166534"};
  border: 1px solid ${({ type }) => type === "error" ? "#fecaca" : "#bbf7d0"};
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
`;

// ─── Voucher Modal ─────────────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  width: 480px;
  max-width: 95vw;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: white;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 700;
`;

const CloseButton = styled.button`
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  &:hover { background: rgba(255,255,255,0.35); }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const ModalFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 16px;
`;

const ModalLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
`;

const ModalInput = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 9px 12px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  &:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 2px rgba(13,148,136,0.15); }
`;

const ModalSelect = styled.select`
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 9px 12px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  background: white;
  &:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 2px rgba(13,148,136,0.15); }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const CancelButton = styled.button`
  padding: 8px 20px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  &:hover { background: #f3f4f6; }
`;

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ReceiptAndPayment() {
  // ── Form state ──
  const [receiptType, setReceiptType] = useState("Receipt");
  const [accountHeads, setAccountHeads]   = useState([]);  // [{account_head, "S.No"}]
  const [selectedHeadSNo, setSelectedHeadSNo] = useState(""); // stores S.No
  const [amount, setAmount]           = useState("");

  // Dynamic description fields
  const [descriptionFields, setDescriptionFields] = useState({});
  // descriptionFields shape depends on selected account_head:
  //  - "ROOM ACCESS": { patient_name: "", room_no: "" }
  //  - "MISCELLANEOUS INCOME": { description: "" }
  //  - others: {}

  // ── Table state ──
  const [records, setRecords]       = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEntries, setShowEntries] = useState("10");

  // ── UI state ──
  const [alert, setAlert]     = useState(null); // { type: "error"|"success", msg }
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Voucher modal state ──
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherSearch, setVoucherSearch] = useState("");
  const [voucherList, setVoucherList] = useState([]);
  const [voucherLoading, setVoucherLoading] = useState(false);

  // ── Derived: selected head object ──
  const selectedHead = accountHeads.find((h) => h["S.No"] === selectedHeadSNo) || null;
  const selectedHeadName = selectedHead ? selectedHead.account_head : "";

  // ── Load account heads on mount ──
  useEffect(() => {
    const fetchHeads = async () => {
      try {
        const res = await apiRequest(`${HmsBaseUrl}get_active_account_heads/`, "GET");
        if (Array.isArray(res)) {
          setAccountHeads(res);
          if (res.length > 0) setSelectedHeadSNo(res[0]["S.No"]);
        } else if (res?.data && Array.isArray(res.data)) {
          setAccountHeads(res.data);
          if (res.data.length > 0) setSelectedHeadSNo(res.data[0]["S.No"]);
        }
      } catch (err) {
        console.error("Failed to fetch account heads:", err);
      }
    };
    fetchHeads();
  }, []);

  // ── Load existing records ──
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_receipt_payments/`, "GET");
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.results)) list = res.results;
      setRecords(list);
    } catch (err) {
      console.error("Failed to fetch records:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // ── When account head changes, reset description fields ──
  useEffect(() => {
    if (selectedHeadName === "ROOM ACCESS") {
      setDescriptionFields({ patient_name: "", room_no: "" });
    } else if (selectedHeadName === "MISCELLANEOUS INCOME") {
      setDescriptionFields({ description: "" });
    } else {
      setDescriptionFields({});
    }
  }, [selectedHeadName]);

  const handleDescriptionChange = (key, value) => {
    setDescriptionFields((prev) => ({ ...prev, [key]: value }));
  };

  // ── Save ──
  const handleSave = async () => {
    if (!selectedHeadSNo) return showAlert("error", "Please select an Account Head.");
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0)
      return showAlert("error", "Please enter a valid Amount.");

    const CashCounter = localStorage.getItem("selected_outlet") || "";

    // Build description JSON
    let description = null;
    if (selectedHeadName === "ROOM ACCESS") {
      if (!descriptionFields.patient_name || !descriptionFields.room_no)
        return showAlert("error", "Please fill in Patient Name and Room No.");
      description = { patient_name: descriptionFields.patient_name, room_no: descriptionFields.room_no };
    } else if (selectedHeadName === "MISCELLANEOUS INCOME") {
      description = { description: descriptionFields.description || "" };
    }

    const payload = {
      receipt_type: receiptType,
      account_head: selectedHeadSNo,   // send S.No
      description,
      amount: parseFloat(amount),
      CashCounter,
    };

    setSaving(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}post_receipt_payments/`, "POST", payload);
      if (res?.status === "success" || res?.data) {
        showAlert("success", res?.message || "Saved successfully.");
        setAmount("");
        setDescriptionFields(selectedHeadName === "ROOM ACCESS"
          ? { patient_name: "", room_no: "" }
          : selectedHeadName === "MISCELLANEOUS INCOME"
          ? { description: "" }
          : {});
        fetchRecords();
      } else {
        showAlert("error", res?.message || "Failed to save. Please try again.");
      }
    } catch (err) {
      console.error("Save error:", err);
      showAlert("error", "Server error. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  // ── View Previous Vouchers ──
  const openVoucherModal = async () => {
    setShowVoucherModal(true);
    setVoucherLoading(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_receipt_payments/`, "GET");
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.results)) list = res.results;
      setVoucherList(list);
    } catch (err) {
      console.error("Failed to load vouchers:", err);
      setVoucherList([]);
    } finally {
      setVoucherLoading(false);
    }
  };

  // ── Table filtering ──
  const filteredRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      (r.account_head || "").toLowerCase().includes(term) ||
      (r.voucher_no || "").toLowerCase().includes(term) ||
      (r.description?.patient_name || "").toLowerCase().includes(term)
    );
  });

  const displayedRecords = filteredRecords.slice(0, parseInt(showEntries, 10));

  const filteredVouchers = voucherList.filter((v) => {
    const term = voucherSearch.toLowerCase();
    if (!term) return true;
    return (
      (v.account_head || "").toLowerCase().includes(term) ||
      (v.voucher_no || "").toLowerCase().includes(term) ||
      (v.description?.patient_name || "").toLowerCase().includes(term)
    );
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      <Card>
        {/* Header */}
        <CardHeader>
          <CardTitle>Receipt / Payment</CardTitle>
          <HeaderButtons>
            <TealButton onClick={openVoucherModal}>
              <Search size={14} />
              View Previous Vouchers
            </TealButton>
            <OrangeButton onClick={() => setShowVoucherModal(true)}>
              — Voucher
            </OrangeButton>
          </HeaderButtons>
        </CardHeader>

        {/* Alert */}
        {alert && (
          <AlertBox type={alert.type}>
            {alert.type === "error" ? "⚠️" : "✅"} {alert.msg}
          </AlertBox>
        )}

        {/* Form Controls */}
        <FormSection>
          <FormRow>
            {/* Receipt Type */}
            <FormGroup>
              <FormLabel>Receipt Type</FormLabel>
              <RadioGroup>
                <RadioLabel>
                  <RadioInput
                    type="radio"
                    name="receiptType"
                    value="Receipt"
                    checked={receiptType === "Receipt"}
                    onChange={() => setReceiptType("Receipt")}
                  />
                  Receipt
                </RadioLabel>
                <RadioLabel>
                  <RadioInput
                    type="radio"
                    name="receiptType"
                    value="Payment"
                    checked={receiptType === "Payment"}
                    onChange={() => setReceiptType("Payment")}
                  />
                  Payment
                </RadioLabel>
              </RadioGroup>
            </FormGroup>

            {/* Account Head */}
            <FormGroup>
              <FormLabel>Account Head</FormLabel>
              <StyledSelect
                value={selectedHeadSNo}
                onChange={(e) => setSelectedHeadSNo(e.target.value)}
              >
                {accountHeads.length === 0 && (
                  <option value="">Loading...</option>
                )}
                {accountHeads.map((h) => (
                  <option key={h["S.No"]} value={h["S.No"]}>
                    {h.account_head}
                  </option>
                ))}
              </StyledSelect>
            </FormGroup>

            {/* Dynamic Description Fields */}
            {selectedHeadName === "ROOM ACCESS" && (
              <>
                <FormGroup>
                  <FormLabel>Patient Name</FormLabel>
                  <StyledInput
                    type="text"
                    placeholder="Enter patient name"
                    value={descriptionFields.patient_name || ""}
                    onChange={(e) => handleDescriptionChange("patient_name", e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Room No</FormLabel>
                  <StyledInput
                    type="text"
                    placeholder="Enter room no"
                    value={descriptionFields.room_no || ""}
                    onChange={(e) => handleDescriptionChange("room_no", e.target.value)}
                    style={{ minWidth: 120 }}
                  />
                </FormGroup>
              </>
            )}

            {selectedHeadName === "MISCELLANEOUS INCOME" && (
              <FormGroup style={{ minWidth: 240 }}>
                <FormLabel>Description</FormLabel>
                <StyledInput
                  type="text"
                  placeholder="Enter description"
                  value={descriptionFields.description || ""}
                  onChange={(e) => handleDescriptionChange("description", e.target.value)}
                  style={{ minWidth: 240 }}
                />
              </FormGroup>
            )}

            {/* Amount */}
            <FormGroup>
              <FormLabel>Amount</FormLabel>
              <StyledInput
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ minWidth: 130 }}
              />
            </FormGroup>

            {/* Save Button */}
            <FormGroup>
              <FormLabel>&nbsp;</FormLabel>
              <TealButton onClick={handleSave} disabled={saving}>
                {saving ? <LoadingSpinner /> : "💾"}
                Save
              </TealButton>
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Table */}
        <TableSection>
          <TableControls>
            <ShowEntriesGroup>
              Show up to&nbsp;
              <StyledSelect
                value={showEntries}
                onChange={(e) => setShowEntries(e.target.value)}
                style={{ minWidth: 70, padding: "5px 8px" }}
              >
                {["10", "25", "50", "100"].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </StyledSelect>
            </ShowEntriesGroup>

            <SearchGroup>
              Search:&nbsp;
              <SearchInputWrapper>
                <SearchInput
                  type="text"
                  placeholder="Patient Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MicButton>
                  <Mic size={12} />
                </MicButton>
              </SearchInputWrapper>
            </SearchGroup>
          </TableControls>

          <Table>
            <thead>
              <tr>
                <Th>Account Name ↕</Th>
                <Th>Voucher ↕</Th>
                <Th>Receipts ↕</Th>
                <Th>Payments ↕</Th>
                <Th>Description ↕</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <Td center muted colSpan={6}>Loading...</Td>
                </tr>
              ) : displayedRecords.length === 0 ? (
                <tr>
                  <Td center muted colSpan={6}>No data available in table</Td>
                </tr>
              ) : (
                displayedRecords.map((r, idx) => (
                  <tr key={r._id || r.voucher_no || idx}>
                    <Td>{r.account_head || "—"}</Td>
                    <Td>{r.voucher_no || "—"}</Td>
                    <Td>
                      {r.receipt_type === "Receipt"
                        ? `₹${parseFloat(r.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                        : "—"}
                    </Td>
                    <Td>
                      {r.receipt_type === "Payment"
                        ? `₹${parseFloat(r.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                        : "—"}
                    </Td>
                    <Td>
                      {r.description
                        ? typeof r.description === "object"
                          ? Object.entries(r.description)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(", ")
                          : r.description
                        : "—"}
                    </Td>
                    <Td center>
                      <TealButton
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => {/* view action */}}
                      >
                        View
                      </TealButton>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <Pagination>
            <span>
              Showing {displayedRecords.length} of {filteredRecords.length} entries
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <PaginationButton>Previous</PaginationButton>
              <PaginationButton>Next</PaginationButton>
            </div>
          </Pagination>
        </TableSection>
      </Card>

      {/* ─── Voucher Modal ─────────────────────────────────────────────────────── */}
      {showVoucherModal && (
        <ModalOverlay onClick={() => setShowVoucherModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🧾 Previous Vouchers</ModalTitle>
              <CloseButton onClick={() => setShowVoucherModal(false)}>✕</CloseButton>
            </ModalHeader>

            <ModalBody>
              {/* Narration field — only visible inside Voucher modal */}
              <ModalFormGroup>
                <ModalLabel>Narration</ModalLabel>
                <ModalInput type="text" placeholder="Enter narration" />
              </ModalFormGroup>

              {/* Search */}
              <ModalFormGroup>
                <ModalLabel>Search</ModalLabel>
                <ModalInput
                  type="text"
                  placeholder="Search by account head, voucher no, patient..."
                  value={voucherSearch}
                  onChange={(e) => setVoucherSearch(e.target.value)}
                />
              </ModalFormGroup>

              {/* Voucher Table */}
              {voucherLoading ? (
                <div style={{ textAlign: "center", padding: 20, color: "#6b7280" }}>
                  Loading vouchers...
                </div>
              ) : (
                <div style={{ overflowX: "auto", maxHeight: 340, overflowY: "auto" }}>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Voucher No</Th>
                        <Th>Date</Th>
                        <Th>Account Head</Th>
                        <Th>Type</Th>
                        <Th>Amount</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVouchers.length === 0 ? (
                        <tr>
                          <Td center muted colSpan={5}>No vouchers found</Td>
                        </tr>
                      ) : (
                        filteredVouchers.map((v, idx) => (
                          <tr key={v._id || v.voucher_no || idx}>
                            <Td>{v.voucher_no || "—"}</Td>
                            <Td>
                              {v.voucher_date
                                ? new Date(v.voucher_date).toLocaleDateString("en-IN")
                                : "—"}
                            </Td>
                            <Td>{v.account_head || "—"}</Td>
                            <Td>{v.receipt_type || "—"}</Td>
                            <Td>
                              ₹{parseFloat(v.amount || 0).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </Td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setShowVoucherModal(false)}>Close</CancelButton>
            </ModalFooter>
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}