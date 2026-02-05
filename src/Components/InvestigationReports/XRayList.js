import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";

// Page Container with gradient background
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #b2dfdb 100%);
  padding: 2rem;
`;

// Card Container
const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

// Modern Page Title
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
    content: '🔬';
    font-size: 2.5rem;
  }
`;

// Section Header
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 3rem 0 1.5rem 0;
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
    content: '';
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

// Filter Container
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

const FilterButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 137, 123, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #00796b 0%, #004d40 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 137, 123, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ResetButton = styled(FilterButton)`
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
  
  &:hover {
    background: linear-gradient(135deg, #616161 0%, #424242 100%);
  }
`;

// Enhanced Table Styles
const ModernTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const TableHead = styled.thead`
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  
  th {
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 1.25rem 1rem;
    font-size: 0.875rem;
    border: none;
    text-align: left;
    
    &:first-child {
      border-top-left-radius: 12px;
    }
    
    &:last-child {
      border-top-right-radius: 12px;
    }
  }
`;

const TableRow = styled.tr`
  background: white;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
    transform: scale(1.01);
    box-shadow: 0 4px 12px rgba(0, 137, 123, 0.1);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1.25rem 1rem;
  color: #555;
  font-size: 0.938rem;
  vertical-align: middle;
`;

// Button Styles
const ActionButton = styled.button`
  padding: 0.65rem 1.5rem;
  margin: 0.25rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`;

const GoToReportButton = styled(ActionButton)`
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  color: white;
  width: 100%;
  justify-content: center;
  margin-bottom: 0.5rem;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #00796b 0%, #004d40 100%);
  }
  
  &::before {
    content: '📋';
  }
`;

const PreviewButton = styled(ActionButton)`
  background: linear-gradient(135deg, #26a69a 0%, #00897b 100%);
  color: white;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #00897b 0%, #00796b 100%);
  }
  
  &::before {
    content: '👁';
  }
`;

const ApproveButton = styled(ActionButton)`
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  color: white;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  }
  
  &::before {
    content: '✓';
    font-weight: bold;
  }
`;

const DeleteButton = styled(ActionButton)`
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
  color: white;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  }
  
  &::before {
    content: '🗑';
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: center;
`;

// Status Badge
const StatusBadge = styled.span`
  padding: 0.5rem 1.25rem;
  border-radius: 25px;
  font-size: 0.813rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  
  ${props => props.approved ? `
    background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
    color: #2e7d32;
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
    
    &::before {
      content: '✓';
      font-size: 1rem;
      font-weight: bold;
      background: #2e7d32;
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  ` : `
    background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
    color: #f57f17;
    box-shadow: 0 4px 12px rgba(245, 127, 23, 0.2);
    
    &::before {
      content: '⏱';
      font-size: 1rem;
    }
  `}
`;

// Empty State
const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
  
  &::before {
    content: '📭';
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

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 137, 123, 0.9) 0%, rgba(0, 105, 92, 0.9) 100%);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 24px;
  max-width: 700px;
  width: 90%;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
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

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 1.75rem;
  font-weight: 700;
  flex: 1;
`;

const ModalIcon = styled.span`
  font-size: 2rem;
`;

const ModalBody = styled.div`
  margin: 1.5rem 0;
`;

const InfoRow = styled.div`
  display: flex;
  padding: 1rem 0;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: #00897b;
  font-weight: 700;
  font-size: 0.938rem;
  min-width: 160px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  color: #555;
  font-size: 1rem;
  flex: 1;
  line-height: 1.6;
`;

const CloseButton = styled.button`
  margin-top: 2rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.063rem;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 137, 123, 0.4);
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover {
    background: linear-gradient(135deg, #00796b 0%, #004d40 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 137, 123, 0.5);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const EditButton = styled(ActionButton)`
  background: linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%);
  color: white;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
  }
  
  &::before {
    content: '✏️';
  }
`;

const EditModalContent = styled(ModalContent)`
  max-width: 600px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  color: #555;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
`;

const ModalButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const SaveButton = styled(CloseButton)`
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  
  &:hover {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  }
`;

const CancelButton = styled(CloseButton)`
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
  
  &:hover {
    background: linear-gradient(135deg, #616161 0%, #424242 100%);
  }
`;

// Modal Component
const Modal = ({ report, onClose }) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalIcon>🏥</ModalIcon>
          <ModalTitle>X-Ray Report Details</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <InfoRow>
            <InfoLabel>Bill No</InfoLabel>
            <InfoValue>{report.investBillNo}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Patient Name</InfoLabel>
            <InfoValue>{report.patientName}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>UHID</InfoLabel>
            <InfoValue>{report.patientId}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>IP Number</InfoLabel>
            <InfoValue>{report.ipNumber}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Age</InfoLabel>
            <InfoValue>{report.age || 'N/A'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Gender</InfoLabel>
            <InfoValue>{report.gender || 'N/A'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Investigation</InfoLabel>
            <InfoValue>{report.investigation}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Impression</InfoLabel>
            <InfoValue>{report.impression}</InfoValue>
          </InfoRow>
        </ModalBody>

        <CloseButton onClick={onClose}>
          Close
        </CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

// Edit Modal Component
const EditModal = ({ report, onClose, onSave }) => {
  const [impression, setImpression] = useState(report.impression || '');

  const handleSave = () => {
    onSave(impression);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <EditModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalIcon>✏️</ModalIcon>
          <ModalTitle>Edit Impression</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <InfoRow>
            <InfoLabel>Patient Name</InfoLabel>
            <InfoValue>{report.patientName}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Investigation</InfoLabel>
            <InfoValue>{report.investigation}</InfoValue>
          </InfoRow>

          <div style={{ marginTop: '1.5rem' }}>
            <FilterLabel style={{ display: 'block', marginBottom: '0.5rem' }}>
              Impression
            </FilterLabel>
            <TextArea
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="Enter impression..."
            />
          </div>
        </ModalBody>

        <ModalButtonGroup>
          <SaveButton onClick={handleSave}>
            Save Changes
          </SaveButton>
          <CancelButton onClick={onClose}>
            Cancel
          </CancelButton>
        </ModalButtonGroup>
      </EditModalContent>
    </ModalOverlay>
  );
};

// Utility function to format date to YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return '';
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return '';
};

// Main Component
const XRayList = ({ patientId }) => {
  const [investigations, setInvestigations] = useState([]);
  const [xrayReports, setXrayReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // Date filter states
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  useEffect(() => {
    const fetchInvestigations = async () => {
      const result = await apiRequest(`${HMSURL}x_ray_investigations/`, "GET");

      if (result.success) {
        setInvestigations(result.data);
      } else {
        console.error("Error fetching investigations:", result.error);
        toast.error(result.error || "Failed to fetch investigations");
      }
    };

    fetchInvestigations();
  }, [HMSURL]);

  useEffect(() => {
    const fetchXRayReports = async () => {
      try {
        const url = patientId
          ? `${HMSURL}x_ray_reports/${patientId}/`
          : `${HMSURL}x_ray_reports/`;

        const result = await apiRequest(url, "GET");

        if (result.success) {
          // Filter out deleted reports and construct patientName
          const reportsWithPatientName = result.data
            .filter(report => !report.is_deleted)
            .map(report => ({
              ...report,
              patientName: `${report.salutation || ''} ${report.firstName || ''} ${report.lastName || ''}`.trim()
            }));

          setXrayReports(reportsWithPatientName);
        } else {
          console.error("Error fetching X-Ray reports:", result.error);
          toast.error(result.error || "Failed to fetch X-Ray reports");
        }
      } catch (error) {
        console.error("Error fetching X-Ray reports:", error);
        toast.error("An unexpected error occurred");
      }
    };

    fetchXRayReports();
  }, [patientId, HMSURL]);



  const filterReportsByDate = useCallback(() => {
    if (!fromDate || !toDate) {
      setFilteredReports(xrayReports);
      return;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Set time to start and end of day for accurate comparison
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    const filtered = xrayReports.filter(report => {
      const reportDate = new Date(formatDate(report.date));
      reportDate.setHours(0, 0, 0, 0);
      return reportDate >= from && reportDate <= to;
    });

    setFilteredReports(filtered);
  }, [xrayReports, fromDate, toDate]);

  // Apply date filter whenever XRayReports, fromDate, or toDate changes
  useEffect(() => {
    filterReportsByDate();
  }, [filterReportsByDate]);

  const handleResetFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
  };

  const handleGoToReport = (investigation, itemName) => {
    const parts = investigation.uhid.split("/");
    const subUhid = parts[1];

    navigate(`/XRayList/${parts[0]}/${subUhid}`, {
      state: {
        uhid: parts[0],
        subUhid: subUhid,
        itemName: itemName,
        ipNumber: investigation.ipNumber,
        investBillNo: investigation.investBillNo,
        salutation: investigation.salutation,
        firstName: investigation.firstName,
        middleName: investigation.middleName,
        lastName: investigation.lastName,
        age: investigation.age,
        gender: investigation.gender,
        investBillDate: investigation.investBillDate,
      },
    });
  };

  const handlePreview = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (report) => {
    try {
      const encodedinvestBillNo = encodeURIComponent(report.investBillNo);
      const investigation = report.investigation;

      if (!investigation) {
        alert("Investigation type is required for deletion");
        return;
      }

      const result = await apiRequest(
        `${HMSURL}x_ray-reports/delete/${encodedinvestBillNo}/`,
        "PATCH",
        { investigation: investigation }
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to delete the report");
      }

      alert(`Report deleted successfully!`);
      window.location.reload();

      setXrayReports((prevReports) =>
        prevReports.filter(
          (r) =>
            r.patientId !== report.patientId ||
            r.investigation !== report.investigation
        )
      );
    } catch (error) {
      console.error("Error deleting the report:", error);
      alert(`Error: ${error.message || "An error occurred while deleting the report."}`);
    }
  };

  const handleApprove = async (report) => {
    try {
      const encodedinvestBillNo = encodeURIComponent(report.investBillNo);
      const formattedDate = formatDate(report.date);

      console.log('Approving report with date:', formattedDate);

      const result = await apiRequest(
        `${HMSURL}x_ray-reports/approve/${encodedinvestBillNo}/`,
        "PATCH",
        {
          investigation: report.investigation,
          date: formattedDate,
        }
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to approve the report.");
      }

      const updatedReport = result.data;
      alert(`Report approved successfully!`);

      setXrayReports((prevReports) =>
        prevReports.map((r) => {
          const rDate = formatDate(r.date);
          const updatedDate = formatDate(updatedReport.date);

          if (r.patientId === updatedReport.patientId &&
            r.investigation === updatedReport.investigation &&
            rDate === updatedDate) {
            return { ...r, ...updatedReport };
          }

          return r;
        })
      );
    } catch (error) {
      console.error("Error approving the report:", error);
      alert("An error occurred while approving the report. Please try again.");
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (newImpression) => {
    try {
      const encodedinvestBillNo = encodeURIComponent(editingReport.investBillNo);
      const formattedDate = formatDate(editingReport.date);

      const result = await apiRequest(
        `${HMSURL}x_ray-reports/edit/${encodedinvestBillNo}/`,
        "PATCH",
        {
          investigation: editingReport.investigation,
          date: formattedDate,
          impression: newImpression,
        }
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update the report.");
      }

      const updatedReport = result.data;
      toast.success("Report updated successfully!");

      setXrayReports((prevReports) =>
        prevReports.map((r) => {
          const rDate = formatDate(r.date);
          const updatedDate = formatDate(updatedReport.date);

          if (r.patientId === updatedReport.patientId &&
            r.investigation === updatedReport.investigation &&
            rDate === updatedDate) {
            return { ...r, ...updatedReport };
          }

          return r;
        })
      );

      setIsEditModalOpen(false);
      setEditingReport(null);
    } catch (error) {
      console.error("Error updating the report:", error);
      toast.error("An error occurred while updating the report. Please try again.");
    }
  };

  return (
    <PageContainer>
      <PageTitle>X-Ray Investigations</PageTitle>

      <ContentCard>
        <SectionHeader>
          <SectionIcon>📋</SectionIcon>
          <SectionTitle>Pending Investigations</SectionTitle>
        </SectionHeader>

        <ModernTable>
          <TableHead>
            <tr>
              <th>Bill No</th>
              <th>UHID</th>
              <th>IP Number</th>
              <th>Patient Name</th>
              <th>Investigation</th>
              <th>Actions</th>
            </tr>
          </TableHead>
          <tbody>
            {investigations.length > 0 ? (
              investigations.map((investigation) => (
                <TableRow key={investigation.uhid}>
                  <TableCell>{investigation.investBillNo}</TableCell>
                  <TableCell>{investigation.uhid}</TableCell>
                  <TableCell>{investigation.ipNumber}</TableCell>
                  <TableCell>
                    {`${investigation.salutation} ${investigation.firstName} ${investigation.middleName ? investigation.middleName + " " : ""
                      }${investigation.lastName}`}
                  </TableCell>
                  <TableCell>
                    {JSON.parse(investigation.item).map((item, index) => (
                      <div key={index} style={{ marginBottom: '0.5rem' }}>
                        {item.itemName}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    {JSON.parse(investigation.item).map((item, index) => (
                      <div key={index}>
                        <GoToReportButton
                          onClick={() => handleGoToReport(investigation, item.itemName)}
                        >
                          Go to Report
                        </GoToReportButton>
                      </div>
                    ))}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5">
                  <EmptyState>
                    <p>No pending investigations</p>
                  </EmptyState>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </ModernTable>
      </ContentCard>

      <ContentCard>
        <SectionHeader>
          <SectionIcon>📄</SectionIcon>
          <SectionTitle>X-Ray Reports</SectionTitle>
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <ResetButton onClick={handleResetFilter}>
                Reset
              </ResetButton>
            </div>
          </FilterGroup>
        </FilterContainer>

        <ModernTable>
          <TableHead>
            <tr>
              <th>Bill No</th>
              <th>UHID</th>
              <th>IP Number</th>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Investigation</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </TableHead>
          <tbody>
            {Array.isArray(filteredReports) && filteredReports.length > 0 ? (
              filteredReports.map((report, index) => (
                <TableRow key={`${report.patientId}-${report.investigation}-${index}`}>
                  <TableCell>{report.investBillNo}</TableCell>
                  <TableCell>{report.patientId}</TableCell>
                  <TableCell>{report.ipNumber}</TableCell>
                  <TableCell>{report.patientName}</TableCell>
                  <TableCell>{report.age || 'N/A'}</TableCell>
                  <TableCell>{report.gender || 'N/A'}</TableCell>
                  <TableCell>{report.investigation}</TableCell>
                  <TableCell>{formatDate(report.date)}</TableCell>
                  <TableCell>
                    <StatusBadge approved={report.is_approved}>
                      {report.is_approved ? "Approved" : "Pending"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <ActionButtonsContainer>
                      <PreviewButton onClick={() => handlePreview(report)}>
                        Preview
                      </PreviewButton>
                      <ApproveButton
                        onClick={() => handleApprove(report)}
                        disabled={report.is_approved}
                      >
                        Approve
                      </ApproveButton>
                      <EditButton
                        onClick={() => handleEdit(report)}
                        disabled={report.is_approved}
                      >
                        Edit
                      </EditButton>
                      <DeleteButton
                        onClick={() => handleDelete(report)}
                        disabled={report.is_approved}
                      >
                        Delete
                      </DeleteButton>
                    </ActionButtonsContainer>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="9">
                  <EmptyState>
                    <p>No reports available for selected date range</p>
                  </EmptyState>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </ModernTable>
      </ContentCard>

      {isModalOpen && selectedReport && (
        <Modal report={selectedReport} onClose={handleCloseModal} />
      )}
      {isEditModalOpen && editingReport && (
        <EditModal
          report={editingReport}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingReport(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </PageContainer>
  );
};

export default XRayList;