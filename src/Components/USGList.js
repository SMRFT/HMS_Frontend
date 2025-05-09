import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./USGList.css";

const Modal = ({ report, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h4>USG Report for {report.patientName}</h4>
        <p>
          <strong>Patient ID:</strong> {report.patientId}
        </p>
        <p>
          <strong>Investigation:</strong> {report.investigation}
        </p>
        <p>
          <strong>Impression:</strong> {report.impression}
        </p>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

const USGList = ({ patientId }) => {
  const [investigations, setInvestigations] = useState([]);
  const [usgReports, setUsgReports] = useState([]);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/usg_investigations/")
      .then((response) => response.json())
      .then((data) => setInvestigations(data))
      .catch((error) => console.error("Error fetching investigations:", error));
  }, []);

  useEffect(() => {
    const fetchUSGReports = async () => {
      try {
        const url = patientId
          ? `http://localhost:8000/usg_reports/${patientId}/`
          : "http://localhost:8000/usg_reports/";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Error fetching USG reports");
        }

        const data = await response.json();
        setUsgReports(data);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching USG reports:", error);
      }
    };

    fetchUSGReports();
  }, [patientId]);

  const handleGoToReport = (uhid, itemName) => {
    const parts = uhid.split("/");
    const subUhid = parts[1];

    navigate(`/USGList/${parts[0]}/${subUhid}`, {
      state: {
        uhid: parts[0],
        subUhid: subUhid,
        itemName: itemName,
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

  const handleEdit = (report) => {};
  const handleDelete = async (report) => {
    try {
      const encodedPatientId = encodeURIComponent(report.patientId);
      const investigation = report.investigation;

      if (!investigation) {
        alert("Investigation type is required for deletion");
        return;
      }

      const response = await fetch(
        `http://localhost:8000/usg-reports/${encodedPatientId}/delete/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            investigation: investigation,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete the report");
      }

      const deletedReport = await response.json();
      alert(`Report for patient ID ${report.patientId} deleted successfully!`);

      // Update the UI by removing the deleted report
      setUsgReports((prevReports) =>
        prevReports.filter(
          (r) =>
            r.patientId !== report.patientId ||
            r.investigation !== report.investigation
        )
      );
    } catch (error) {
      console.error("Error deleting the report:", error);
      alert(
        `Error: ${
          error.message ||
          "An error occurred while deleting the report. Please try again."
        }`
      );
    }
  };

  const handleApprove = async (report) => {
    try {
      const encodedPatientId = encodeURIComponent(report.patientId);
      const response = await fetch(
        `http://localhost:8000/usg-reports/${encodedPatientId}/approve/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const updatedReport = await response.json();
        alert(`Report for ${updatedReport.patientName} approved successfully!`);
        setUsgReports((prevReports) =>
          prevReports.map((r) =>
            r.patientId === updatedReport.patientId ? updatedReport : r
          )
        );
      } else {
        throw new Error("Failed to approve the report.");
      }
    } catch (error) {
      console.error("Error approving the report:", error);
      alert("An error occurred while approving the report. Please try again.");
    }
  };

  return (
    <div className="usg-list-container">
      <h1>USG Investigations</h1>
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
          {investigations.map((investigation) => (
            <tr key={investigation.uhid}>
              <td>{investigation.uhid}</td>
              <td>{`${investigation.salutation} ${investigation.firstName} ${
                investigation.middleName ? investigation.middleName + " " : ""
              }${investigation.lastName}`}</td>
              <td>
                {JSON.parse(investigation.item).map((item, index) => (
                  <div key={index}>{item.itemName}</div>
                ))}
              </td>
              <td>
                {JSON.parse(investigation.item).map((item, index) => (
                  <div key={index}>
                    <button
                      className="report-btn"
                      onClick={() =>
                        handleGoToReport(investigation.uhid, item.itemName)
                      }
                    >
                      Go to Report
                    </button>
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>USG Reports</h2>
      <table className="usg-report-table">
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
          {Array.isArray(usgReports) && usgReports.length > 0 ? (
            usgReports.map((report) => (
              <tr key={report.patientId}>
                <td>{report.patientId}</td>
                <td>{report.patientName}</td>
                <td>{report.investigation}</td>
                <td>{report.approve ? "Approved" : "Pending"}</td>
                <td>
                  <button
                    onClick={() => handlePreview(report)}
                    className="me-2"
                  >
                    Preview
                  </button>
                  <button
                    className="me-2"
                    onClick={() => handleApprove(report)}
                    disabled={report.approve}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDelete(report)}
                    className="me-2"
                    disabled={report.approve}
                  >
                    Delete
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

export default USGList;
