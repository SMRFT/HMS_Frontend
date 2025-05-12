import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditSummary = () => {
  const { ipNo } = useParams();
  const decodedIpNo = decodeURIComponent(ipNo); // Decode the parameter
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState(null);
  const [editedFieldsData, setEditedFieldsData] = useState({}); // To store the field data
  const [selectedField, setSelectedField] = useState(null); // To keep track of selected field
  const [formData, setFormData] = useState({ notes: "" }); // Form state to bind to the text area
  const notesRef = useRef(null); // Reference to the notes text area
  const [fieldData, setFieldData] = useState({}); // Store the data being typed for each field

  // Investigation related states
  const [showInvestigations, setShowInvestigations] = useState(false);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvestigations, setSelectedInvestigations] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/edit-editsummary/${ipNo}/`
        );
        if (response.ok) {
          const data = await response.json();
          setSummaryData(data);
          setEditedFieldsData(data.fieldsData || {}); // Initialize fieldsData
        } else {
          alert("Summary not found");
        }
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };

    fetchSummary();
  }, [ipNo]);

  // Check if summaryData exists and has the date field before accessing
  if (!summaryData || !summaryData.date) {
    return <div>Loading...</div>; // Show loading or placeholder if data is not available
  }

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedFieldsData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle field selection from the list (click event)
  const handleButtonClick = (fieldName) => {
    // First save the current field's data
    if (formData.currentField) {
      setEditedFieldsData((prev) => ({
        ...prev,
        [formData.currentField]: formData.notes,
      }));
    }

    setSelectedField(fieldName); // Set the selected field

    // Ensure formData gets the current field and its notes
    setFormData((prev) => ({
      ...prev,
      currentField: fieldName, // Set the active field
      notes: fieldData[fieldName] || editedFieldsData[fieldName] || "", // Use the field data being typed or fallback to existing data
    }));

    // Move the cursor to the text area
    notesRef.current.focus();
  };

  // Handle changes in the notes (typing in the text area)
  const handleNotesChange = (e) => {
    const updatedNotes = e.target.value;
    setFormData((prev) => ({
      ...prev,
      notes: updatedNotes, // Update the notes in the state
    }));

    // Store the typed data in the fieldData object
    setFieldData((prevData) => ({
      ...prevData,
      [formData.currentField]: updatedNotes, // Save the typed data for the selected field
    }));
  };

  // Save notes when the user switches fields or submits
  const saveNotes = () => {
    if (formData.currentField) {
      setEditedFieldsData((prev) => ({
        ...prev,
        [formData.currentField]: formData.notes, // Save the notes for the selected field
      }));
    }
  };

  // Fetch all investigations for a patient
  const fetchInvestigations = async () => {
    if (!summaryData.ipNo || summaryData.ipNo.trim() === "") {
      alert("Please enter a valid IP Number first");
      return;
    }

    setLoading(true);
    setInvestigations([]);
    setSelectedInvestigations([]);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/patient-investigations/${encodeURIComponent(
          summaryData.ipNo
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

      // Update fieldData for INVESTIGATIONS
      setFieldData((prev) => ({
        ...prev,
        INVESTIGATIONS: updatedNotes,
      }));
    } else {
      // Save current field's data first
      saveNotes();

      // Then add investigations to the INVESTIGATIONS field in editedFieldsData
      setEditedFieldsData((prev) => {
        // If INVESTIGATIONS already exists in editedFieldsData, append to it
        const existingInvestigations = prev["INVESTIGATIONS"] || "";
        const updatedInvestigations = existingInvestigations
          ? `${existingInvestigations}\n\n${investigationsText}`
          : investigationsText;

        return {
          ...prev,
          INVESTIGATIONS: updatedInvestigations,
        };
      });

      // Update form to show INVESTIGATIONS field
      setFormData({
        ...formData,
        currentField: "INVESTIGATIONS",
        notes: editedFieldsData["INVESTIGATIONS"] || investigationsText,
      });

      // Update fieldData for INVESTIGATIONS
      setFieldData((prev) => ({
        ...prev,
        INVESTIGATIONS:
          editedFieldsData["INVESTIGATIONS"] || investigationsText,
      }));

      setSelectedField("INVESTIGATIONS");
    }

    // Close the investigations modal
    setShowInvestigations(false);
    // Clear selections for next time
    setSelectedInvestigations([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // First save the current field's data
    saveNotes();

    // Ensure fieldsData includes all updates
    const updatedFieldsData = {
      ...summaryData.fieldsData,
      ...editedFieldsData,
    };

    // Filter out any undefined or empty fields
    const filteredFieldsData = Object.fromEntries(
      Object.entries(updatedFieldsData).filter(
        ([key, value]) => value !== undefined && value !== ""
      )
    );

    // Check if filteredFieldsData is empty
    if (Object.keys(filteredFieldsData).length === 0) {
      alert("Please fill in the required fields.");
      return; // Don't proceed with submission if fields are empty
    }

    try {
      // Use the filtered fieldsData for submission
      const response = await fetch(
        `http://127.0.0.1:8000/update-summary/${ipNo}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fieldsData: filteredFieldsData }),
        }
      );

      if (response.ok) {
        alert("Summary updated successfully!");
        navigate("/summary"); // Navigate back to the summary page
      } else {
        const errorData = await response.json();
        alert(
          `Failed to update summary: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error updating summary:", error);
      alert("An error occurred while updating the summary.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Edit Summary</h2>

      <div className="card p-4 shadow-sm">
        <div className="row mb-3">
          <div className="col-md-2">
            <label className="form-label">Summary Date</label>
            <input
              type="text"
              className="form-control"
              value={summaryData.date}
              readOnly
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">IP No</label>
            <input
              type="text"
              className="form-control"
              name="ipNo"
              value={editedFieldsData.ipNo || summaryData.ipNo}
              onChange={handleChange}
              placeholder="Search IP No"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">UHID</label>
            <input
              type="text"
              className="form-control"
              name="uhid"
              value={editedFieldsData.uhid || summaryData.uhid}
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
              value={editedFieldsData.patient || summaryData.patient}
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
              value={editedFieldsData.age || summaryData.age}
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
              value={editedFieldsData.roomNo || summaryData.roomNo}
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
              value={editedFieldsData.doa || summaryData.doa}
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
              value={editedFieldsData.dod || summaryData.dod}
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
              value={editedFieldsData.surgeryDate || summaryData.surgeryDate}
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
              value={
                editedFieldsData.nextReviewDate || summaryData.nextReviewDate
              }
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
              value={editedFieldsData.doctor || summaryData.doctor}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Gender</label>
            <input
              type="text"
              className="form-control"
              name="gender"
              value={editedFieldsData.gender || summaryData.gender}
              onChange={handleChange}
            />
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
                    onClick={() => handleButtonClick(field)} // Field selection on click
                    style={{
                      cursor: "pointer",
                      fontSize: "0.85rem", // Reduced font size
                      padding: "0.4rem 0.5rem", // Reduced padding
                      fontWeight: "bold", // Bold font
                    }}
                  >
                    {field}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="col-md-9 d-flex flex-column"
              style={{ flexGrow: 1 }}
            >
              <div className="card p-4 shadow-sm" style={{ flexGrow: 1 }}>
                <h5 className="mb-3">{selectedField || "Summary Notes"}</h5>
                <textarea
                  ref={notesRef}
                  className="form-control mb-3"
                  style={{ flexGrow: 1, resize: "none", minHeight: "200px" }}
                  name="notes"
                  placeholder="Add notes here"
                  value={formData.notes} // Bind notes to the state
                  onChange={handleNotesChange} // Handle changes to notes
                  onBlur={saveNotes} // Save notes when textarea loses focus
                ></textarea>
                {/* Buttons for additional features */}
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
              </div>
            </div>
          </div>
        </div>

        {/* Investigations Modal */}
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

        {/* Submit and cancel buttons */}
        <div className="d-flex justify-content-end mt-3">
          <button
            className="btn btn-danger me-2"
            onClick={() => navigate("/summary")}
          >
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Update Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSummary;
