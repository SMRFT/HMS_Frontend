import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const Summary = () => {
  const currentDate = new Date().toLocaleDateString();
  const [selectedField, setSelectedField] = useState("");
  const [summaries, setSummaries] = useState([]);
  const navigate = useNavigate();
  const [showInvestigations, setShowInvestigations] = useState(false);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvestigations, setSelectedInvestigations] = useState([]);

  const [formData, setFormData] = useState({
    date: "",
    ipNo: "", // This is the IP number field we'll use for searching
    uhid: "",
    patient: "",
    doa: "",
    dod: "",
    roomNo: "",
    age: "",
    surgeryDate: "",
    nextReviewDate: "",
    doctor: "",
    gender: "",
    summaryType: "",
    heading: "",
    address: "",
    diseaseCode: "",
    disease: "",
    specialNeeds: "",
    vaccinationHistory: "",
    dischargeType: "",
    admissionDiagnosis: "",
    dischargeDiagnosis: "",
    consultant: "",
    briefHistory: "",
    pastMedicalHistory: "",
    generalExamination: "",
    vitals: "",
    hospitalCourse: "",
    investigations: "",
    proceduresPerformed: "",
    specificMedications: "",
    conditionOnDischarge: "",
    adviceOnDischarge: "",
    notes: "",
    fieldsData: {},
    currentField: "",
    approve: false,
    approve_time: null,
  });

  const notesRef = useRef(null);

  // Fetch patient data by IP number
  const fetchIpPatient = async () => {
    if (!formData.ipNo) {
      alert("Please enter IP Number");
      return;
    }

    const encodedipNo = encodeURIComponent(formData.ipNo);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/ip-patient/${encodedipNo}/`
      );
      if (response.ok) {
        const data = await response.json();

        const salutation = data.salutation || "";
        const firstName = data.firstName || "";
        const lastName = data.lastName || "";
        const fullName = `${salutation} ${firstName} ${lastName}`
          .trim()
          .replace(/\s+/g, " ");

        setFormData({
          ...formData,
          uhid: data.uhid || "",
          salutation,
          firstName,
          lastName,
          patient: fullName,
          age: data.age || "",
          gender: data.gender || "",
          roomNo: data.roomNo || "",
          doa: data.admissionDate || "",
          doctor: data.consultingDoctor || "",
        });
      } else {
        alert("Patient not found");
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      alert("Error fetching patient details");
    }
  };

  // Fetch all investigations for a patient
  const fetchInvestigations = async () => {
    if (!formData.ipNo || formData.ipNo.trim() === "") {
      alert("Please enter a valid IP Number first");
      return;
    }

    setLoading(true);
    setInvestigations([]);
    setSelectedInvestigations([]);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/patient-investigations/${encodeURIComponent(
          formData.ipNo
        )}/`
      );

      const data = await response.json();

      if (response.ok) {
        if (Array.isArray(data) && data.length > 0) {
          setInvestigations(data);
          setShowInvestigations(true);
        } else {
          alert("No investigations found for this patient");
          setShowInvestigations(false);
          setInvestigations([]);
        }
      } else {
        // Handle error response
        const errorMessage =
          data.error || "Error fetching investigation details";
        alert(errorMessage);
        console.error("API error:", data);
      }
    } catch (error) {
      console.error("Error fetching investigations:", error);
      alert("Network or server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection of an investigation
  const toggleInvestigationSelection = (investigation) => {
    setSelectedInvestigations((prev) => {
      const exists = prev.some(
        (i) =>
          i.reportType === investigation.reportType &&
          i.investigation === investigation.investigation
      );

      if (exists) {
        return prev.filter(
          (i) =>
            !(
              i.reportType === investigation.reportType &&
              i.investigation === investigation.investigation
            )
        );
      } else {
        return [...prev, investigation];
      }
    });
  };

  // Add selected investigations to notes
  const addInvestigationsToNotes = () => {
    if (selectedInvestigations.length === 0) {
      alert("Please select at least one investigation to add");
      return;
    }

    // Create formatted text for all selected investigations
    let investigationsText = "INVESTIGATIONS:\n";
    selectedInvestigations.forEach((investigation, index) => {
      // Add separator between investigations
      if (index > 0) {
        investigationsText += "\n---------------------\n";
      }

      investigationsText += `${investigation.reportType}: 
${investigation.investigation || "No details available"}

Impression: 
${investigation.impression || "No impression available"}

Status: ${
        investigation.approve
          ? "Approved"
          : "PENDING APPROVAL - Results not finalized"
      }
`;
    });

    // If the current field is "INVESTIGATIONS", add it there
    if (formData.currentField === "INVESTIGATIONS") {
      const updatedNotes = formData.notes
        ? `${formData.notes}\n\n${investigationsText}`
        : investigationsText;

      setFormData({ ...formData, notes: updatedNotes });
    } else {
      // If not on investigations field, save current notes and switch to investigations
      setFormData((prev) => ({
        ...prev,
        fieldsData: {
          ...prev.fieldsData,
          [prev.currentField]: prev.notes,
        },
        currentField: "INVESTIGATIONS",
        notes:
          prev.fieldsData["INVESTIGATIONS"] || ""
            ? prev.fieldsData["INVESTIGATIONS"] + "\n\n" + investigationsText
            : investigationsText,
      }));
      setSelectedField("INVESTIGATIONS");
    }

    // Close the investigations modal
    setShowInvestigations(false);
    // Clear selections for next time
    setSelectedInvestigations([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleButtonClick = (fieldName) => {
    setSelectedField(fieldName);
    // Save the current notes into the specific field's data
    setFormData((prev) => ({
      ...prev,
      fieldsData: {
        ...prev.fieldsData,
        [prev.currentField]: prev.notes,
      },
      currentField: fieldName,
      notes: prev.fieldsData[fieldName] || "",
    }));

    // Move cursor to the text area
    notesRef.current.focus();
  };

  const handleSubmit = async () => {
    if (formData.currentField && formData.notes) {
      setFormData((prev) => ({
        ...prev,
        fieldsData: {
          ...prev.fieldsData,
          [prev.currentField]: prev.notes,
        },
      }));
    }

    // Get current date and time
    const currentDateTime = new Date().toISOString();

    // Prepare data for submission
    const summaryData = {
      ...formData,
      date: currentDateTime,
    };

    // Filter out any undefined fields from summaryData
    summaryData.fieldsData = Object.fromEntries(
      Object.entries(summaryData.fieldsData).filter(
        ([key, value]) => key !== "undefined" && value !== ""
      )
    );

    try {
      const response = await fetch("http://127.0.0.1:8000/summaries/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(summaryData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Submitted Data:", data);
        alert("Summary successfully updated!");

        // Reset the form after successful submission
        setFormData({
          date: "",
          ipNo: "",
          uhid: "",
          patient: "",
          doa: "",
          dod: "",
          roomNo: "",
          age: "",
          surgeryDate: "",
          nextReviewDate: "",
          doctor: "",
          gender: "",
          summaryType: "",
          heading: "",
          address: "",
          diseaseCode: "",
          disease: "",
          specialNeeds: "",
          vaccinationHistory: "",
          dischargeType: "",
          admissionDiagnosis: "",
          dischargeDiagnosis: "",
          consultant: "",
          briefHistory: "",
          pastMedicalHistory: "",
          generalExamination: "",
          vitals: "",
          hospitalCourse: "",
          investigations: "",
          proceduresPerformed: "",
          specificMedications: "",
          conditionOnDischarge: "",
          adviceOnDischarge: "",
          notes: "",
          fieldsData: {},
          currentField: "",
          approve: false,
          approve_time: null,
        });
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);
        alert("Failed to submit summary.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/summaries/")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setSummaries(data))
      .catch((error) => console.error("Error fetching summaries:", error));
  }, []);

  const handleEdit = (ipNo) => {
    const encodedIpNo = encodeURIComponent(ipNo);
    navigate(`/EditSummary/${encodedIpNo}`);
  };

  const handlePrint = (ipNo) => {
    const encodedIpNo = encodeURIComponent(ipNo);
    navigate(`/SummaryPrint/${encodedIpNo}`);
  };

  const handleDelete = (ipNo) => {
    if (window.confirm("Are you sure you want to delete this summary?")) {
      fetch(`http://127.0.0.1:8000/delete-summary/${ipNo}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Failed to delete summary");
        })
        .then((data) => {
          alert("Summary deleted successfully");
          setSummaries((prevSummaries) =>
            prevSummaries.filter((summary) => summary.ipNo !== ipNo)
          );
        })
        .catch((error) => {
          alert("Error deleting summary: " + error.message);
          console.error("Error deleting summary:", error);
        });
    }
  };

  const handleApprove = (ipNo) => {
    fetch(`http://127.0.0.1:8000/approve-summary/${ipNo}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        approve: true,
        approve_time: new Date().toISOString(),
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Failed to approve summary");
      })
      .then((data) => {
        console.log("Summary approved:", data);
        setSummaries((prevSummaries) =>
          prevSummaries.map((summary) =>
            summary.ipNo === ipNo ? { ...summary, approve: true } : summary
          )
        );
        alert("Summary approved successfully!");
      })
      .catch((error) => {
        console.error("Error approving summary:", error);
        alert("Error approving summary: " + error.message);
      });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]:
        type === "file" ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Summary</h2>

      <div className="card p-4 shadow-sm">
        <div className="row mb-3">
          <div className="col-md-2">
            <label className="form-label">Summary Date</label>
            <input
              type="text"
              className="form-control"
              value={currentDate}
              readOnly
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">IP Number:</label>
            <input
              type="text"
              name="ipNo"
              value={formData.ipNo}
              onChange={handleInputChange}
              className="form-control"
            />
            <button
              type="button"
              onClick={fetchIpPatient}
              className="btn btn-primary mt-2"
            >
              Search
            </button>
          </div>

          <div className="col-md-2">
            <label className="form-label">UHID</label>
            <input
              type="text"
              className="form-control"
              name="uhid"
              value={formData.uhid}
              onChange={handleChange}
              placeholder="Search UHID"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Patient</label>
            <input
              type="text"
              className="form-control"
              name="patient"
              value={formData.patient}
              onChange={handleChange}
              placeholder="Enter Patient"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Age</label>
            <input
              type="text"
              className="form-control"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter Age"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Room No</label>
            <input
              type="text"
              className="form-control"
              name="roomNo"
              value={formData.roomNo}
              onChange={handleChange}
              placeholder="Enter Room No"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-2">
            <label className="form-label">D.O.A</label>
            <input
              type="text"
              className="form-control"
              name="doa"
              value={formData.doa}
              onChange={handleChange}
              placeholder="Enter D.O.A"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">D.O.D</label>
            <input
              type="text"
              className="form-control"
              name="dod"
              value={formData.dod}
              onChange={handleChange}
              placeholder="Enter D.O.D"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Surgery Date</label>
            <input
              type="text"
              className="form-control"
              name="surgeryDate"
              value={formData.surgeryDate}
              onChange={handleChange}
              placeholder="Enter Surgery Date"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Next Review Date</label>
            <input
              type="text"
              className="form-control"
              name="nextReviewDate"
              value={formData.nextReviewDate}
              onChange={handleChange}
              placeholder="Enter Next Review Date"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Doctor</label>
            <input
              type="text"
              className="form-control"
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              placeholder="Enter Doctor"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Gender</label>
            <input
              type="text"
              className="form-control"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              placeholder="Enter Gender"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-2">
            <label className="form-label">Summary Type</label>
            <input
              type="text"
              className="form-control"
              name="summaryType"
              value={formData.summaryType}
              onChange={handleChange}
              placeholder="Enter Summary Type"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Heading</label>
            <input
              type="text"
              className="form-control"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              placeholder="Enter Heading"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-control"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter Address"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Disease Code</label>
            <input
              type="text"
              className="form-control"
              name="diseaseCode"
              value={formData.diseaseCode}
              onChange={handleChange}
              placeholder="Enter Disease Code"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Disease</label>
            <input
              type="text"
              className="form-control"
              name="disease"
              value={formData.disease}
              onChange={handleChange}
              placeholder="Enter Disease"
            />
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          <div className="col-md-3">
            <ul className="list-group">
              {[
                "ONCOLOGY NOTES",
                "SPECIAL NEEDS AFTER DISCHARGE",
                "VACCINATION HISTORY",
                "DISCHARGE TYPE",
                "ADMISSION DIAGNOSIS",
                "DISCHARGE DIAGNOSIS",
                "CONSULTANT",
                "BRIEF HISTORY",
                "SIGNIFICANT PAST MEDICAL AND SURGICAL HISTORY",
                "GENERAL EXAMINATION",
                "VITALS",
                "COURSE IN THE HOSPITAL",
                "INVESTIGATIONS",
                "SURGERIES / PROCEDURES PERFORMED",
                "SPECIFIC MEDICATION GIVEN DURING HOSPITAL STAY",
                "CONDITION ON DISCHARGE",
                "ADVICE ON DISCHARGE",
                "DOA AND DOD",
              ].map((field) => (
                <li
                  key={field}
                  className={`list-group-item ${
                    selectedField === field ? "active" : ""
                  }`}
                  onClick={() => handleButtonClick(field)}
                  style={{
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    padding: "0.4rem 0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  {field}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-md-9 d-flex flex-column" style={{ flexGrow: 1 }}>
            <div className="card p-4 shadow-sm" style={{ flexGrow: 1 }}>
              <h5 className="mb-3">{selectedField || "Summary Notes"}</h5>
              <textarea
                ref={notesRef}
                className="form-control mb-3"
                style={{ flexGrow: 1, resize: "none", minHeight: "200px" }}
                name="notes"
                placeholder="Add notes here"
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
              <div className="d-flex gap-2 mb-3">
                <button
                  className="btn btn-outline-secondary"
                  onClick={fetchInvestigations}
                >
                  Add Investigations
                </button>
                <button className="btn btn-outline-secondary">
                  Add Medicines
                </button>
                <button className="btn btn-outline-secondary">
                  Discharge Medicines
                </button>
              </div>
              <div className="d-flex justify-content-end">
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Upload Summary
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Improved Investigations Modal */}
        {showInvestigations && (
          <div
            className="modal"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Patient Investigations</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowInvestigations(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : investigations.length === 0 ? (
                    <p className="text-center">
                      No investigations found for this patient.
                    </p>
                  ) : (
                    <div>
                      <div className="mb-3">
                        <p className="text-muted">
                          Select investigations to add to the summary.
                          Unapproved investigations are highlighted in yellow.
                        </p>
                      </div>
                      <div className="list-group">
                        {investigations.map((investigation, index) => (
                          <div
                            key={index}
                            className={`list-group-item list-group-item-action ${
                              !investigation.approve
                                ? "list-group-item-warning"
                                : ""
                            } ${
                              selectedInvestigations.some(
                                (i) =>
                                  i.reportType === investigation.reportType &&
                                  i.investigation ===
                                    investigation.investigation
                              )
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              toggleInvestigationSelection(investigation)
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <div className="d-flex w-100 justify-content-between">
                              <h5 className="mb-1">
                                {investigation.reportType}
                              </h5>
                              {!investigation.approve && (
                                <span className="badge bg-warning text-dark">
                                  Pending Approval
                                </span>
                              )}
                            </div>
                            <p
                              className="mb-1"
                              style={{ whiteSpace: "pre-wrap" }}
                            >
                              {investigation.investigation.length > 100
                                ? `${investigation.investigation.substring(
                                    0,
                                    100
                                  )}...`
                                : investigation.investigation}
                            </p>
                            <small className="text-muted">
                              Impression:{" "}
                              {investigation.impression.length > 50
                                ? `${investigation.impression.substring(
                                    0,
                                    50
                                  )}...`
                                : investigation.impression}
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <span className="me-auto">
                    {selectedInvestigations.length > 0 &&
                      `${selectedInvestigations.length} investigation(s) selected`}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowInvestigations(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={addInvestigationsToNotes}
                    disabled={selectedInvestigations.length === 0}
                  >
                    Add Selected to Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container my-4">
          <h2 className="mb-4 text-center">Summary Reports</h2>
          <div className="table-responsive">
            {summaries.length === 0 ? (
              <p className="text-center">No Summary Reports Found</p>
            ) : (
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient Name</th>
                    <th>Approve Status</th>
                    <th>Summary Type</th>
                    <th>UHID</th>
                    <th>IP No</th>
                    <th>Approve Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((summary) => (
                    <tr key={summary._id.$oid}>
                      <td>
                        {summary.date
                          ? new Date(summary.date).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "N/A"}
                      </td>
                      <td>{summary.patient}</td>
                      <td>
                        <span
                          style={{
                            color: summary.approve ? "green" : "red",
                            fontWeight: "bold",
                          }}
                        >
                          {summary.approve ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td>{summary.summaryType}</td>
                      <td>{summary.uhid}</td>
                      <td>{summary.ipNo}</td>
                      <td>
                        {summary.approve_time
                          ? new Date(summary.approve_time).toLocaleString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )
                          : "N/A"}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className={`btn btn-sm ${
                              summary.approve ? "btn-secondary" : "btn-primary"
                            }`}
                            onClick={() => handleEdit(summary.ipNo)}
                            disabled={summary.approve}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(summary.ipNo)}
                          >
                            Delete
                          </button>
                          <button
                            className={`btn btn-sm ${
                              summary.approve ? "btn-secondary" : "btn-success"
                            }`}
                            onClick={() => handleApprove(summary.ipNo)}
                            disabled={summary.approve}
                          >
                            Approve
                          </button>

                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handlePrint(summary.ipNo)}
                          >
                            Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
