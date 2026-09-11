import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToday = () => new Date().toISOString().split("T")[0];

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const spin = keyframes`to { transform: rotate(360deg); }`;

// ─── Styled Components ────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdfa 0%, #f8fafc 60%, #ecfdf5 100%);
  padding: 1.5rem 1rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const HeaderCard = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 60%, #065f46 100%);
  border-radius: 20px;
  padding: 1.4rem 2rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  box-shadow: 0 8px 32px rgba(13, 148, 136, 0.25);
  animation: ${fadeIn} 0.35s ease;
`;

const HeaderLeft = styled.div`display: flex; align-items: center; gap: 1rem;`;
const HeaderIcon = styled.div`font-size: 2.2rem;`;
const HeaderTitle = styled.h1`font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0;`;
const HeaderSub = styled.p`font-size: 0.82rem; color: rgba(255,255,255,0.78); margin: 0.15rem 0 0;`;

const FilterCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  animation: ${fadeIn} 0.4s ease;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 160px;
`;

const Label = styled.label`
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const DateInput = styled.input`
  padding: 0.52rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.88rem;
  font-family: inherit;
  color: #1e293b;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
    background: #fff;
  }
`;

const SearchInput = styled(DateInput)`min-width: 220px;`;

const Btn = styled.button`
  padding: 0.55rem 1.3rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const SearchBtn = styled(Btn)`
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: #fff;
  box-shadow: 0 4px 12px rgba(13,148,136,0.28);
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(13,148,136,0.38); }
`;

const ActionBtn = styled.button`
  padding: 0.38rem 0.85rem;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: #0d9488;
  color: #fff;
  transition: all 0.15s;
  &:hover { background: #0f766e; }
`;

/* ── Table ── */
const TableCard = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease;
`;

const TableScroll = styled.div`overflow-x: auto;`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
`;

const Th = styled.th`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: #fff;
  padding: 0.75rem 0.9rem;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

const Tr = styled.tr`
  &:nth-child(even) { background: #f8fafc; }
  &:hover { background: #f0fdfa; transition: background 0.15s; }
`;

const Td = styled.td`
  padding: 0.65rem 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  white-space: nowrap;
  vertical-align: middle;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3.5rem 1rem;
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 600;
`;

const Spinner = styled.div`
  width: 36px; height: 36px;
  border: 3.5px solid #e2e8f0;
  border-top-color: #0d9488;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 3rem auto;
`;

/* Modal */
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
  animation: ${fadeIn} 0.2s ease;
`;

const ModalContainer = styled.div`
  background: #fff;
  border-radius: 20px;
  width: 100%; max-width: 520px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: #fff;
  padding: 1.25rem 1.5rem;
  display: flex; justify-content: space-between; align-items: center;
`;

const ModalTitle = styled.h3`margin: 0; font-size: 1.1rem; font-weight: 800;`;

const ModalClose = styled.button`
  background: transparent; border: none; color: #fff;
  font-size: 1.2rem; cursor: pointer; opacity: 0.8;
  &:hover { opacity: 1; }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  display: flex; flex-direction: column; gap: 1.1rem;
`;

const PatientBanner = styled.div`
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  display: flex; flex-direction: column; gap: 0.25rem;
  font-size: 0.85rem;
`;

const BannerRow = styled.div`
  display: flex; justify-content: space-between; color: #334155;
`;

const Textarea = styled.textarea`
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.88rem;
  font-family: inherit;
  color: #1e293b;
  min-height: 90px;
  outline: none;
  resize: vertical;
  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
  }
`;

const ModalFooter = styled.div`
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 1rem 1.5rem 1.25rem;
  border-top: 1px solid #f1f5f9;
`;

const SaveBtn = styled(Btn)`
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: #fff;
  &:hover:not(:disabled) { box-shadow: 0 4px 14px rgba(13,148,136,0.3); }
`;

const CancelBtn = styled(Btn)`
  background: #f1f5f9; color: #475569;
  &:hover { background: #e2e8f0; }
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function Masterhealthcheckupfollowup() {
  const [fromDate, setFromDate] = useState(getToday);
  const [toDate, setToDate]     = useState(getToday);
  const [search, setSearch]     = useState("");
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [activeModalRow, setActiveModalRow] = useState(null);
  const [followUpDate, setFollowUpDate]     = useState("");
  const [description, setDescription]       = useState("");
  const [saving, setSaving]                 = useState(false);

  // ── Fetch Patients ───────────────────────────────────────────────────────
  const fetchReport = useCallback(async (fd, td) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from_date: fd, to_date: td });
      const res = await apiRequest(`${Hmsbaseurl}mhc_report/?${params}`, "GET");
      if (res.success && Array.isArray(res.data)) {
        setRows(res.data);
      } else {
        setRows([]);
        toast.error(res.error || "Failed to load MHC data");
      }
    } catch {
      toast.error("Network error fetching MHC data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(fromDate, toDate);
  }, []); // eslint-disable-line

  const handleSearch = () => {
    fetchReport(fromDate, toDate);
  };

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (r.patient_name || "").toLowerCase().includes(q) ||
      (r.op_number    || "").toLowerCase().includes(q) ||
      (r.package      || "").toLowerCase().includes(q) ||
      (r.contact_number || "").includes(q) ||
      (r.description  || "").toLowerCase().includes(q)
    );
  });

  const openModal = (row) => {
    setActiveModalRow(row);
    setFollowUpDate(row.follow_up || getToday());
    setDescription(row.description || "");
  };

  const closeModal = () => {
    setActiveModalRow(null);
  };

  const handleSaveFollowup = async () => {
    if (!activeModalRow) return;
    setSaving(true);
    try {
      const employeeId = localStorage.getItem("employee_id") || "";
      const payload = {
        "auth-user-id": employeeId,
        mhc_no: activeModalRow.mhc_no,
        id: activeModalRow.id || activeModalRow._id,
        follow_up: followUpDate,
        // Only include description if it has actual content
        ...(description.trim() ? { description: description.trim() } : {}),
        // telecaller_id and telecaller_date are stored by the backend from auth-user-id
        telecaller_id: employeeId,
      };

      // Use PATCH since this is an update to an existing record
      const res = await apiRequest(`${Hmsbaseurl}mhc_save_details/`, "PATCH", payload);
      if (res.success) {
        toast.success("Follow-up details saved successfully!");
        closeModal();
        fetchReport(fromDate, toDate);
      } else {
        toast.error(res.error || "Failed to update follow-up");
      }
    } catch {
      toast.error("Unexpected error updating follow-up");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper>
      {/* Header */}
      <HeaderCard>
        <HeaderLeft>
          <HeaderIcon>📝</HeaderIcon>
          <div>
            <HeaderTitle>MHC Follow-up Management</HeaderTitle>
            <HeaderSub>Add &amp; update patient follow-up dates and descriptions</HeaderSub>
          </div>
        </HeaderLeft>
      </HeaderCard>

      {/* Filter */}
      <FilterCard>
        <FilterRow>
          <FieldGroup>
            <Label>From Date</Label>
            <DateInput
              id="mhc-fu-from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup>
            <Label>To Date</Label>
            <DateInput
              id="mhc-fu-to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup>
            <Label>Search</Label>
            <SearchInput
              id="mhc-fu-search"
              type="text"
              placeholder="Name / OP / Package / Description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </FieldGroup>

          <SearchBtn onClick={handleSearch} disabled={loading}>
            {loading ? "⏳" : "🔍"} Search
          </SearchBtn>
        </FilterRow>
      </FilterCard>

      {/* Table */}
      <TableCard>
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState>📭 No patient records found for the selected dates.</EmptyState>
        ) : (
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Patient Name</Th>
                  <Th>OP Number</Th>
                  <Th>Contact</Th>
                  <Th>Package</Th>
                  <Th>Reg Date</Th>
                  <Th>Follow Up Date</Th>
                  <Th>Description</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <Tr key={r.id || r._id || i}>
                    <Td style={{ color: "#94a3b8", fontWeight: 600 }}>{i + 1}</Td>
                    <Td style={{ fontWeight: 700, color: "#1e293b" }}>{r.patient_name || "—"}</Td>
                    <Td style={{ fontWeight: 600, color: "#0d9488" }}>{r.op_number || "—"}</Td>
                    <Td>{r.contact_number || "—"}</Td>
                    <Td style={{ fontWeight: 700 }}>{r.package || "—"}</Td>
                    <Td>{r.registration_date || "—"}</Td>
                    <Td style={{ color: "#0f766e", fontWeight: 700 }}>{r.follow_up || "—"}</Td>
                    <Td style={{ fontStyle: r.description ? "normal" : "italic", color: r.description ? "#334155" : "#94a3b8", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.description || "No notes added"}
                    </Td>
                    <Td>
                      <ActionBtn onClick={() => openModal(r)}>
                        ✏️ Add / Edit
                      </ActionBtn>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        )}
      </TableCard>

      {/* Follow-up Edit Modal */}
      {activeModalRow && (
        <ModalOverlay>
          <ModalContainer>
            <ModalHeader>
              <ModalTitle>Update Follow-up &amp; Description</ModalTitle>
              <ModalClose onClick={closeModal}>✕</ModalClose>
            </ModalHeader>
            <ModalBody>
              <PatientBanner>
                <BannerRow>
                  <strong>Patient:</strong>
                  <span>{activeModalRow.patient_name} ({activeModalRow.op_number || "No OP"})</span>
                </BannerRow>
                <BannerRow>
                  <strong>Package:</strong>
                  <span>{activeModalRow.package || "N/A"}</span>
                </BannerRow>
                <BannerRow>
                  <strong>Contact:</strong>
                  <span>{activeModalRow.contact_number || "N/A"}</span>
                </BannerRow>
              </PatientBanner>

              <FieldGroup>
                <Label>Follow Up Date</Label>
                <DateInput
                  id="mhc-modal-followup-date"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Description / Follow-up Notes</Label>
                <Textarea
                  id="mhc-modal-description"
                  placeholder="Enter detailed description, symptoms, doctor advice or follow-up notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FieldGroup>
            </ModalBody>
            <ModalFooter>
              <CancelBtn onClick={closeModal} disabled={saving}>Cancel</CancelBtn>
              <SaveBtn onClick={handleSaveFollowup} disabled={saving}>
                {saving ? "⏳ Saving..." : "💾 Save Changes"}
              </SaveBtn>
            </ModalFooter>
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}
