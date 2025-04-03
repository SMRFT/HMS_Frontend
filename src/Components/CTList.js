import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const CTListContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top:60px;
  padding-left: 280px; /* Sidebar width */
  padding-right: 20px;
  @media (max-width: 768px) {
    padding-left: 0; /* Adjust for smaller screens */
  }
`;

const Title = styled.h1`
  text-align: center;
  color: #15616d;
`;

const Table = styled.table`
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  @media (max-width: 768px) {
    font-size: 14px; /* Adjust font size for smaller screens */
  }
`;

const TableHead = styled.th`
  text-align: left;
  padding: 8px;
  background-color: #15616d;
  color: white;
  font-weight: bold;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const TableData = styled.td`
  padding: 8px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  background-color: #15616d;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-right: 8px;

  &:hover {
    background-color: #1d7686;
  }

  &:disabled {
    background-color: #b0c4b1;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;

  @media (max-width: 768px) {
    width: 90%;
  }
`;

const CloseButton = styled.button`
  background-color: #15616d;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-top: 10px;
  display: block;
  width: 100%;
  
  &:hover {
    background-color: #1d7686;
  }
`;

const CTList = ({ patientId }) => {
  const [investigations, setInvestigations] = useState([]);
  const [ctReports, setCtReports] = useState([]);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://hms.shinovadatabase.in/investigations/')
      .then((response) => response.json())
      .then((data) => setInvestigations(data))
      .catch((error) => console.error('Error fetching investigations:', error));
  }, []);

  useEffect(() => {
    const fetchCTReports = async () => {
      try {
        const url = patientId
          ? `https://hms.shinovadatabase.in/ct_reports/${patientId}/`
          : 'https://hms.shinovadatabase.in/ct_reports/';

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Error fetching CT reports');
        }

        const data = await response.json();
        setCtReports(data);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching CT reports:', error);
      }
    };

    fetchCTReports();
  }, [patientId]);

  const handleGoToReport = (uhid) => {
    const parts = uhid.split('/');
    const subUhid = parts[1];
    navigate(`/CTList/${parts[0]}/${subUhid}`);
  };

  const handlePreview = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEdit = (report) => {
    navigate(`/edit-ct-report/${report.patientId}`);
  };

  const handleApprove = async (report) => {
    try {
      const encodedPatientId = encodeURIComponent(report.patientId);
      const response = await fetch(`https://hms.shinovadatabase.in/ct-reports/${encodedPatientId}/approve/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedReport = await response.json();
        alert(`Report for ${updatedReport.patientName} approved successfully!`);
        setCtReports((prevReports) =>
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
    <CTListContainer>
      <Title>CT Investigations</Title>
      <Table>
        <thead>
          <tr>
            <TableHead>UHID</TableHead>
            <TableHead>Patient Name</TableHead>
            <TableHead>Investigation</TableHead>
            <TableHead>Actions</TableHead>
          </tr>
        </thead>
        <tbody>
          {investigations
            .filter((investigation) => investigation['Type of Investigation'] === 'CT')
            .map((investigation) => (
              <TableRow key={investigation.UHID}>
                <TableData>{investigation.UHID}</TableData>
                <TableData>{`${investigation.salutation} ${investigation['Patient name']}`}</TableData>
                <TableData>{investigation.Investigation}</TableData>
                <TableData>
                  <Button onClick={() => handleGoToReport(investigation.UHID)}>Go to Report</Button>
                </TableData>
              </TableRow>
            ))}
        </tbody>
      </Table>

      <Title>CT Reports</Title>
      <Table>
        <thead>
          <tr>
            <TableHead>Patient ID</TableHead>
            <TableHead>Patient Name</TableHead>
            <TableHead>Investigation</TableHead>
            <TableHead>Approval Status</TableHead>
            <TableHead>Actions</TableHead>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(ctReports) && ctReports.length > 0 ? (
            ctReports.map((report) => (
              <TableRow key={report.patientId}>
                <TableData>{report.patientId}</TableData>
                <TableData>{report.patientName}</TableData>
                <TableData>{report.investigation}</TableData>
                <TableData>{report.approve ? 'Approved' : 'Pending'}</TableData>
                <TableData>
                  <Button onClick={() => handlePreview(report)} className="me-2">Preview</Button>
                  <Button onClick={() => handleEdit(report)} className="me-2">Edit</Button>
                  <Button
                    onClick={() => handleApprove(report)}
                    disabled={report.approve}
                  >
                    Approve
                  </Button>
                </TableData>
              </TableRow>
            ))
          ) : (
            <tr>
              <TableData colSpan="5">No reports available</TableData>
            </tr>
          )}
        </tbody>
      </Table>

      {isModalOpen && selectedReport && (
        <ModalOverlay>
          <ModalContent>
            <h4>CT Report for {selectedReport.patientName}</h4>
            <p><strong>Patient ID:</strong> {selectedReport.patientId}</p>
            <p><strong>Investigation:</strong> {selectedReport.investigation}</p>
            <p><strong>Impression:</strong> {selectedReport.impression}</p>    
            <CloseButton onClick={handleCloseModal}>Close</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </CTListContainer>
  );
};

export default CTList;
