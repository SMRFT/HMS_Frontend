import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Modal = ({ report, onClose }) => {
  return (
    <ModalOverlay>
      <ModalContent>
        <h4>MRI Report for {report.patientName}</h4>
        <p><strong>Patient ID:</strong> {report.patientId}</p>
        <p><strong>Investigation:</strong> {report.investigation}</p>
        <p><strong>Impression:</strong> {report.impression}</p>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

const MRIList = ({ patientId }) => {
  const [investigations, setInvestigations] = useState([]);
  const [mriReports, setMriReports] = useState([]);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://hms.shinovadatabase.in/mri_investigations/')
      .then((response) => response.json())
      .then((data) => setInvestigations(data))
      .catch((error) => console.error('Error fetching investigations:', error));
  }, []);

  useEffect(() => {
    const fetchMRIReports = async () => {
      try {
        const url = patientId
          ? `https://hms.shinovadatabase.in/mri_reports/${patientId}/`
          : 'https://hms.shinovadatabase.in/mri_reports/';

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Error fetching MRI reports');
        }

        const data = await response.json();
        setMriReports(data);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching MRI reports:', error);
      }
    };

    fetchMRIReports();
  }, [patientId]);

  const handleGoToReport = (uhid) => {
    const parts = uhid.split('/');
    const subUhid = parts[1];
    navigate(`/MRIList/${parts[0]}/${subUhid}`);
  };

  const handlePreview = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEdit = (report) => {
    navigate(`/edit-mri-report/${report.patientId}`);
  };

  const handleApprove = async (report) => {
    try {
      const encodedPatientId = encodeURIComponent(report.patientId);
      const response = await fetch(`https://hms.shinovadatabase.in/mri-reports/${encodedPatientId}/approve/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedReport = await response.json();
        alert(`Report for ${updatedReport.patientName} approved successfully!`);
        setMriReports((prevReports) =>
          prevReports.map((r) => (r.patientId === updatedReport.patientId ? updatedReport : r))
        );
      } else {
        throw new Error('Failed to approve the report.');
      }
    } catch (error) {
      console.error('Error approving the report:', error);
      alert('An error occurred while approving the report. Please try again.');
    }
  };

  return (
    <Container>
      <Title>MRI Investigations</Title>
      <Table>
        <thead>
          <tr>
            <th>UHID</th>
            <th>Patient Name</th>
            <th>Investigation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {investigations
            .filter((investigation) => investigation['Type of Investigation'] === 'MRI')
            .map((investigation) => (
              <tr key={investigation.UHID}>
                <td>{investigation.UHID}</td>
                <td>{`${investigation.salutation} ${investigation['Patient name']}`}</td>
                <td>{investigation.Investigation}</td>
                <td>
                  <Button onClick={() => handleGoToReport(investigation.UHID)}>Go to Report</Button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      <h2>MRI Reports</h2>
      <Table>
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Patient Name</th>
            <th>Investigation</th>
            <th>Approval Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(mriReports) && mriReports.length > 0 ? (
            mriReports.map((report) => (
              <tr key={report.patientId}>
                <td>{report.patientId}</td>
                <td>{report.patientName}</td>
                <td>{report.investigation}</td>
                <td>{report.approve ? 'Approved' : 'Pending'}</td>
                <td>
                <ButtonContainer>
                  <StyledButton onClick={() => handlePreview(report)}>Preview</StyledButton>
                  <StyledButton onClick={() => handleEdit(report)}>Edit</StyledButton>
                  <StyledButton onClick={() => handleApprove(report)} disabled={report.approve}>
                    Approve
                  </StyledButton>
                </ButtonContainer>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No reports available</td>
            </tr>
          )}
        </tbody>
      </Table>

      {isModalOpen && selectedReport && (
        <Modal report={selectedReport} onClose={handleCloseModal} />
      )}
    </Container>
  );
};

export default MRIList;

// Styled Components
const Container = styled.div`
  margin-left: 250px;
  margin-top:60px;
  padding: 20px;
  h1 {
    color: #004d46;
    font-size: 24px;
  }
  h2 {
    color: #006b63;
    font-size: 20px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  border: 1px solid #ddd;
  th, td {
    padding: 12px;
    text-align: left;
  }
  th {
    background-color: #15616d;
    color: #fff;
  }
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const Button = styled.button`
  background-color: #15616d;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #004d46;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  text-align: left;
`;

const CloseButton = styled.button`
  background-color: #006b63;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #004d46;
  }
`;

const mediaQuery = `
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 10px;
    h1, h2 {
      font-size: 18px;
    }
    table {
      font-size: 14px;
    }
  }
`;
const ButtonContainer = styled.div`
  display: flex;
  gap: 10px; /* Adds spacing between buttons */
`;

const StyledButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  background-color: #15616d;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #004d46;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;
const Title = styled.h1`
  text-align: center;
  color: #15616d;
`;