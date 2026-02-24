import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
  PageWrapper,
  Container,
  Button,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  Label,
  TextArea,
  ButtonContainer,
  colors,
} from "../GlobalStyles";

// ─── Local Styled Components (page-specific) ──────────────────────────────────

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  &::before {
    content: "🔬";
    font-size: 2.5rem;
  }
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 0 1.5rem 0;
  padding-bottom: 1rem;
  border-bottom: 3px solid #f0f0f0;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: -1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 5px;
    height: 100%;
    background: linear-gradient(180deg, #00897b 0%, #00695c 100%);
    border-radius: 3px;
  }
`;

const SectionIcon = styled.span`
  font-size: 1.5rem;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: flex-end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  color: #00897b;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DateInput = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.938rem;
  color: #555;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
`;

const ResetButton = styled(Button)`
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    background: linear-gradient(135deg, #616161 0%, #424242 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ActionButton = styled(Button)`
  padding: 0.5rem 0.875rem;
  margin: 0.2rem;
  font-size: 0.813rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const GoToReportButton = styled(ActionButton)`
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #00796b 0%, #004d40 100%);
  }
  &::before {
    content: "📋";
  }
`;

const PreviewButton = styled(ActionButton)`
  background: linear-gradient(135deg, #26a69a 0%, #00897b 100%);
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #00897b 0%, #00796b 100%);
  }
  &::before {
    content: "👁";
  }
`;

const ApproveButton = styled(ActionButton)`
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  }
  &::before {
    content: "✓";
    font-weight: bold;
  }
`;

const EditButton = styled(ActionButton)`
  background: linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%);
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
  }
  &::before {
    content: "✏️";
  }
`;

const DeleteButton = styled(ActionButton)`
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  }
  &::before {
    content: "🗑";
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  align-items: center;
`;

const StatusBadge = styled.span`
  padding: 0.35rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-transform: uppercase;
  white-space: nowrap;

  ${(props) => {
    if (!props.hasReport)
      return `
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      color: #1565c0;
      &::before { content: '⏳'; font-size: 0.875rem; }
    `;
    if (props.approved)
      return `
      background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
      color: #2e7d32;
      &::before {
        content: '✓';
        font-weight: bold;
        background: #2e7d32;
        color: white;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
      }
    `;
    return `
      background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
      color: #f57f17;
      &::before { content: '⏱'; font-size: 0.875rem; }
    `;
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #999;

  &::before {
    content: "📭";
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.125rem;
    font-weight: 500;
    color: #666;
  }
`;

// ─── Modal Styles (local overrides of GlobalStyles modal) ─────────────────────

const StyledModalOverlay = styled(ModalOverlay)`
  background: linear-gradient(
    135deg,
    rgba(0, 137, 123, 0.9) 0%,
    rgba(0, 105, 92, 0.9) 100%
  );
  backdrop-filter: blur(10px);
`;

const StyledModalContent = styled(ModalContainer)`
  border-radius: 24px;
  padding: 3rem;
  max-width: 700px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  max-height: unset;
  overflow: visible;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideUp {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const StyledModalHeader = styled(ModalHeader)`
  border-bottom: 2px solid #f0f0f0;
  background: transparent;
  padding: 0 0 1rem 0;
  margin-bottom: 2rem;
`;

const ModalIcon = styled.span`
  font-size: 2rem;
`;

const InfoRow = styled.div`
  display: flex;
  padding: 0.875rem 0;
  border-bottom: 1px solid #f5f5f5;
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: #00897b;
  font-weight: 700;
  font-size: 0.875rem;
  min-width: 150px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  color: #555;
  font-size: 0.938rem;
  flex: 1;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const ModalCloseButton = styled(CloseButton)`
  margin-top: 2rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  color: white;
  border-radius: 12px;
  font-size: 1.063rem;
  font-weight: 700;
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 6px 20px rgba(0, 137, 123, 0.4);
  height: auto;

  &:hover {
    background: linear-gradient(135deg, #00796b 0%, #004d40 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 137, 123, 0.5);
    color: white;
  }
`;

const EditModalContent = styled(StyledModalContent)`
  max-width: 600px;
`;

const StyledTextArea = styled(TextArea)`
  width: 100%;
  min-height: 200px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  box-sizing: border-box;

  &:focus {
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
`;

const ModalButtonGroup = styled(ButtonContainer)`
  gap: 1rem;
  margin-top: 2rem;
  border-top: none;
  padding-top: 0;
`;

const SaveButton = styled(ModalCloseButton)`
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  &:hover {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  }
`;

const CancelModalButton = styled(ModalCloseButton)`
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
  &:hover {
    background: linear-gradient(135deg, #616161 0%, #424242 100%);
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date) => {
  if (!date) return "";
  if (typeof date === "string") return date.split("T")[0];
  if (date instanceof Date) return date.toISOString().split("T")[0];
  return "";
};

const getToday = () => new Date().toISOString().split("T")[0];

// ─── Preview Modal ────────────────────────────────────────────────────────────

const Modal = ({ row, onClose }) => {
  const report = row.report;
  return (
    <StyledModalOverlay onClick={onClose}>
      <StyledModalContent onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <ModalIcon>🏥</ModalIcon>
          <ModalTitle>CT Report Details</ModalTitle>
        </StyledModalHeader>
        <ModalBody style={{ padding: 0, overflow: "visible" }}>
          <InfoRow>
            <InfoLabel>Bill No</InfoLabel>
            <InfoValue>{row.investBillNo}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Patient Name</InfoLabel>
            <InfoValue>{row.patientName}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>UHID</InfoLabel>
            <InfoValue>{row.uhid}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>IP Number</InfoLabel>
            <InfoValue>{row.ipNumber}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Age</InfoLabel>
            <InfoValue>{row.age || "N/A"}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Gender</InfoLabel>
            <InfoValue>{row.gender || "N/A"}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Report Date</InfoLabel>
            <InfoValue>
              {report?.date ? formatDate(report.date) : "N/A"}
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Impression</InfoLabel>
            <InfoValue>{report?.impression || "N/A"}</InfoValue>
          </InfoRow>
        </ModalBody>
        <ModalCloseButton onClick={onClose}>Close</ModalCloseButton>
      </StyledModalContent>
    </StyledModalOverlay>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const EditModal = ({ row, onClose, onSave }) => {
  const [impression, setImpression] = useState(row.report?.impression || "");

  return (
    <StyledModalOverlay onClick={onClose}>
      <EditModalContent onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <ModalIcon>✏️</ModalIcon>
          <ModalTitle>Edit Impression</ModalTitle>
        </StyledModalHeader>
        <ModalBody style={{ padding: 0, overflow: "visible" }}>
          <InfoRow>
            <InfoLabel>Patient Name</InfoLabel>
            <InfoValue>{row.patientName}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Bill No</InfoLabel>
            <InfoValue>{row.investBillNo}</InfoValue>
          </InfoRow>
          <div style={{ marginTop: "1.5rem" }}>
            <Label style={{ display: "block", marginBottom: "0.5rem" }}>
              Impression
            </Label>
            <StyledTextArea
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="Enter impression..."
            />
          </div>
        </ModalBody>
        <ModalButtonGroup>
          <SaveButton onClick={() => onSave(impression)}>
            Save Changes
          </SaveButton>
          <CancelModalButton onClick={onClose}>Cancel</CancelModalButton>
        </ModalButtonGroup>
      </EditModalContent>
    </StyledModalOverlay>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CTList = ({ billTypeNo = "CT01", investBillNo: investBillNoFilter }) => {
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [fromDate, setFromDate] = useState(getToday);
  const [toDate, setToDate] = useState(getToday);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        billTypeNo,
        from_date: fromDate,
        to_date: toDate,
      });

      if (investBillNoFilter) {
        params.append("investBillNo", investBillNoFilter);
      }

      const result = await apiRequest(
        `${HMSURL}investigations/?${params.toString()}`,
        "GET",
      );

      if (!result.success) {
        toast.error(result.error || "Failed to fetch data");
        return;
      }

      // In fetchData, replace the merged map:
      const merged = (result.data || []).map((row) => ({
        investBillNo: row.investBillNo,
        uhid: row.uhid,
        ipNumber: row.ipNumber,
        investBillDate: row.investBillDate,
        item: row.item,
        itemName: row.itemName || "", // ← comes directly from backend now
        patientName:
          `${row.salutation || ""} ${row.firstName || ""} ${row.lastName || ""}`.trim(),
        age: row.age,
        gender: row.gender,
        report: row.report || null,
        hasReport: !!row.hasReport,
      }));
      setRows(merged);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An unexpected error occurred");
    }
  }, [HMSURL, billTypeNo, investBillNoFilter, fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResetFilter = () => {
    setFromDate(getToday());
    setToDate(getToday());
  };

  const handleGoToReport = (row) => {
    const parts = (row.uhid || "").split("/");
    const uhidBase = parts[0] || "";
    const subUhid = parts[1] || "";

    navigate(`/CTReportForm/${uhidBase}/${subUhid}`, {
      state: {
        uhid: uhidBase,
        subUhid,
        itemName: row.itemName,
        ipNumber: row.ipNumber,
        investBillNo: row.investBillNo,
        salutation: "",
        firstName: row.patientName,
        middleName: "",
        lastName: "",
        age: row.age,
        gender: row.gender,
        investBillDate: row.investBillDate,
        billTypeNo,
      },
    });
  };

  const handlePreview = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingRow(row);
    setIsEditModalOpen(true);
  };

  const handleApprove = async (row) => {
    try {
      const encodedBill = encodeURIComponent(row.investBillNo);
      const encodedItem = encodeURIComponent(row.itemName);
      const result = await apiRequest(
        `${HMSURL}scan-reports/approve/${encodedBill}/${encodedItem}/`,
        "PATCH",
        {},
      );
      if (!result.success) throw new Error(result.error || "Failed to approve");

      toast.success("Report approved successfully!");
      setRows((prev) =>
        prev.map((r) =>
          r.investBillNo === row.investBillNo && r.itemName === row.itemName
            ? { ...r, report: { ...r.report, is_approved: true } }
            : r,
        ),
      );
    } catch (error) {
      toast.error("An error occurred while approving. Please try again.");
    }
  };

  const handleSaveEdit = async (newImpression) => {
    try {
      const encodedBill = encodeURIComponent(editingRow.investBillNo);
      const encodedItem = encodeURIComponent(editingRow.itemName);
      const result = await apiRequest(
        `${HMSURL}scan-reports/edit/${encodedBill}/${encodedItem}/`,
        "PATCH",
        { impression: newImpression },
      );
      if (!result.success) throw new Error(result.error || "Failed to update");

      toast.success("Report updated successfully!");
      setRows((prev) =>
        prev.map((r) =>
          r.investBillNo === editingRow.investBillNo &&
          r.itemName === editingRow.itemName
            ? { ...r, report: { ...r.report, impression: newImpression } }
            : r,
        ),
      );
      setIsEditModalOpen(false);
      setEditingRow(null);
    } catch (error) {
      toast.error("An error occurred while updating. Please try again.");
    }
  };

  const handleDelete = async (row) => {
    try {
      const encodedBill = encodeURIComponent(row.investBillNo);
      const encodedItem = encodeURIComponent(row.itemName);
      const result = await apiRequest(
        `${HMSURL}scan-reports/delete/${encodedBill}/${encodedItem}/`,
        "PATCH",
        {},
      );
      if (!result.success) throw new Error(result.error || "Failed to delete");

      toast.success("Report deleted successfully!");
      setRows((prev) =>
        prev.map((r) =>
          r.investBillNo === row.investBillNo && r.itemName === row.itemName
            ? { ...r, report: null, hasReport: false }
            : r,
        ),
      );
    } catch (error) {
      toast.error("An error occurred while deleting. Please try again.");
    }
  };

  return (
    <PageWrapper>
      <Container>
        <ContentCard>
          <PageTitle>CT Investigations</PageTitle>

          <SectionHeader>
            <SectionIcon>🔬</SectionIcon>
            <SectionTitle>CT Investigation List</SectionTitle>
          </SectionHeader>

          <FilterContainer>
            <FilterGroup>
              <FilterLabel>From Date</FilterLabel>
              <DateInput
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>To Date</FilterLabel>
              <DateInput
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>&nbsp;</FilterLabel>
              <ResetButton onClick={handleResetFilter}>Reset</ResetButton>
            </FilterGroup>
          </FilterContainer>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Bill No</Th>
                  <Th>UHID</Th>
                  <Th>IP Number</Th>
                  <Th>Patient Name</Th>
                  <Th>Age</Th>
                  <Th>Gender</Th>
                  <Th>Item</Th>
                  <Th>Bill Date</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <Tr
                      key={`${row.investBillNo}-${row.itemName}-${index}`}
                      style={{
                        background: row.hasReport
                          ? "linear-gradient(135deg, #f1f8f4 0%, #e8f5e9 100%)"
                          : "white",
                      }}
                    >
                      <Td>{row.investBillNo}</Td>
                      <Td>{row.uhid}</Td>
                      <Td>{row.ipNumber}</Td>
                      <Td>{row.patientName}</Td>
                      <Td>{row.age || "N/A"}</Td>
                      <Td>{row.gender || "N/A"}</Td>
                      <Td>{row.itemName || "—"}</Td>
                      <Td>{formatDate(row.investBillDate)}</Td>
                      <Td>
                        {!row.hasReport ? (
                          <StatusBadge hasReport={false}>Pending</StatusBadge>
                        ) : row.report?.is_approved ? (
                          <StatusBadge hasReport approved>
                            Approved
                          </StatusBadge>
                        ) : (
                          <StatusBadge hasReport>Reported</StatusBadge>
                        )}
                      </Td>
                      <Td>
                        <ActionButtonsContainer>
                          <GoToReportButton
                            onClick={() => handleGoToReport(row)}
                            disabled={row.hasReport}
                            title={
                              row.hasReport
                                ? "Report already submitted"
                                : "Create report"
                            }
                          >
                            Go to Report
                          </GoToReportButton>
                          <PreviewButton
                            onClick={() => handlePreview(row)}
                            disabled={!row.hasReport}
                            title="Preview report"
                          >
                            Preview
                          </PreviewButton>
                          <ApproveButton
                            onClick={() => handleApprove(row)}
                            disabled={!row.hasReport || row.report?.is_approved}
                            title={
                              row.report?.is_approved
                                ? "Already approved"
                                : "Approve report"
                            }
                          >
                            Approve
                          </ApproveButton>
                          <EditButton
                            onClick={() => handleEdit(row)}
                            disabled={!row.hasReport || row.report?.is_approved}
                            title="Edit impression"
                          >
                            Edit
                          </EditButton>
                          <DeleteButton
                            onClick={() => handleDelete(row)}
                            disabled={!row.hasReport || row.report?.is_approved}
                            title="Delete report"
                          >
                            Delete
                          </DeleteButton>
                        </ActionButtonsContainer>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <tr>
                    <Td colSpan="10">
                      <EmptyState>
                        <p>No investigations found for selected date range</p>
                      </EmptyState>
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </ContentCard>
      </Container>

      {isModalOpen && selectedRow && (
        <Modal
          row={selectedRow}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRow(null);
          }}
        />
      )}

      {isEditModalOpen && editingRow && (
        <EditModal
          row={editingRow}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingRow(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </PageWrapper>
  );
};

export default CTList;
