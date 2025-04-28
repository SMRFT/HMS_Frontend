import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MRIList.css';

const Modal = ({ report, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h4>MRI Report for {report.patientName}</h4>
        <p><strong>Patient ID:</strong> {report.patientId}</p>
        <p><strong>Investigation:</strong> {report.investigation}</p>
        <p><strong>Impression:</strong> {report.impression}</p>    
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
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
    fetch('http://localhost:8000/mri_investigations/')
      .then((response) => response.json())
      .then((data) => setInvestigations(data))
      .catch((error) => console.error('Error fetching investigations:', error));
  }, []);

  useEffect(() => {
    const fetchMRIReports = async () => {
      try {
        const url = patientId
          ? `http://localhost:8000/mri_reports/${patientId}/`
          : 'http://localhost:8000/mri_reports/';

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
      const response = await fetch(`http://localhost:8000/mri-reports/${encodedPatientId}/approve/`, {
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
    <div className="mri-list-container">
      <h1>MRI Investigations</h1>
      <table className="investigation-table">
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
                  <button
                    className="report-btn"
                    onClick={() => handleGoToReport(investigation.UHID)}
                  >
                    Go to Report
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <h2>MRI Reports</h2>
      <table className="mri-report-table">
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
                  <button className="me-2" onClick={() => handlePreview(report)}>Preview</button>
                  <button className="me-2" onClick={() => handleEdit(report)}>Edit</button>
                  <button className="me-2"
                    onClick={() => handleApprove(report)}
                    disabled={report.approve}
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No reports available</td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && selectedReport && (
        <Modal report={selectedReport} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default MRIList;
