import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditSummary = () => {
    const { ipNo } = useParams();
    const decodedIpNo = decodeURIComponent(ipNo); // Decode the parameter
    const navigate = useNavigate();
    const [summaryData, setSummaryData] = useState(null);
    const [editedFieldsData, setEditedFieldsData] = useState({});  // To store the field data
    const [selectedField, setSelectedField] = useState(null);  // To keep track of selected field
    const [formData, setFormData] = useState({ notes: "" });  // Form state to bind to the text area
    const notesRef = useRef(null);  // Reference to the notes text area
    const [fieldData, setFieldData] = useState({});  // Store the data being typed for each field

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await fetch(`https://hms.shinovadatabase.in/edit-editsummary/${ipNo}/`);
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
        setSelectedField(fieldName);  // Set the selected field

        // Ensure formData gets the current field and its notes
        setFormData((prev) => ({
            ...prev,
            currentField: fieldName,  // Set the active field
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
            notes: updatedNotes,  // Update the notes in the state
        }));

        // Store the typed data in the fieldData object
        setFieldData((prevData) => ({
            ...prevData,
            [formData.currentField]: updatedNotes,  // Save the typed data for the selected field
        }));
    };

    // Save notes when the user switches fields or submits
    const saveNotes = () => {
        setEditedFieldsData((prev) => ({
            ...prev,
            [formData.currentField]: formData.notes,  // Save the notes for the selected field
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Ensure fieldsData is not empty and filter out any undefined or empty fields
        const filteredFieldsData = Object.fromEntries(
            Object.entries(summaryData.fieldsData || {}).filter(([key, value]) => value !== undefined && value !== "")
        );
    
        // Check if filteredFieldsData is empty, if so, return an error or handle accordingly
        if (Object.keys(filteredFieldsData).length === 0) {
            alert("Please fill in the required fields.");
            return; // Don't proceed with submission if fields are empty
        }
    
        try {
            // Use the filtered fieldsData for submission
            const response = await fetch(`https://hms.shinovadatabase.in/update-summary/${ipNo}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fieldsData: filteredFieldsData }), // Wrap in an object if needed by the API
            });
    
            if (response.ok) {
                alert("Summary updated successfully!");
                navigate("/summary"); // Navigate back to the summary page
            } else {
                const errorData = await response.json();
                alert(`Failed to update summary: ${errorData.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error updating summary:", error);
            alert("An error occurred while updating the summary.");
        }
    };
    



    return (
        <div style={{ marginLeft: '250px',marginTop:'60px' }}>
        <div className="container mt-4">
            <h2 className="text-center mb-4">Edit Summary</h2>

            <div className="card p-4 shadow-sm">
                <div className="row mb-3">
                    <div className="col-md-2">
                        <label className="form-label">Summary Date</label>
                        <input type="text" className="form-control" value={summaryData.date} readOnly />
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

                {/* Continue adding other fields similarly */}
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
                            value={editedFieldsData.nextReviewDate || summaryData.nextReviewDate}
                            onChange={handleChange}
                            placeholder="Enter Next Review Date"
                        />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label">Doctor</label>
                        <select
                            className="form-select"
                            name="doctor"
                            value={editedFieldsData.doctor || summaryData.doctor}
                            onChange={handleChange}
                        >
                            <option value="">Select Doctor</option>
                            <option value="Dr. Smith">Dr. Smith</option>
                            <option value="Dr. Jones">Dr. Jones</option>
                        </select>
                    </div>

                    <div className="col-md-2">
                        <label className="form-label">Gender</label>
                        <select
                            className="form-select"
                            name="gender"
                            value={editedFieldsData.gender || summaryData.gender}
                            onChange={handleChange}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
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
                                        className="list-group-item"
                                        onClick={() => handleButtonClick(field)}  // Field selection on click
                                        style={{
                                            cursor: "pointer",
                                            fontSize: "0.85rem",  // Reduced font size
                                            padding: "0.4rem 0.5rem",  // Reduced padding
                                            fontWeight: "bold",  // Bold font
                                        }}
                                    >
                                        {field}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="col-md-9 d-flex flex-column" style={{ flexGrow: 1 }}>
                            <div className="card p-4 shadow-sm" style={{ flexGrow: 1 }}>
                                <h5 className="mb-3">{selectedField || 'Summary Notes'}</h5>
                                <textarea
                                    ref={notesRef}
                                    className="form-control mb-3"
                                    style={{ flexGrow: 1, resize: "none" }}
                                    name="notes"
                                    placeholder="Add notes here"
                                    value={formData.notes}  // Bind notes to the state
                                    onChange={handleNotesChange}  // Handle changes to notes
                                    onBlur={saveNotes}  // Optionally save notes when textarea loses focus
                                ></textarea>
                                {/* Buttons for additional features */}
                                <div className="d-flex gap-2 mb-3">
                                    <button className="btn btn-outline-secondary">Add Investigations</button>
                                    <button className="btn btn-outline-secondary">Add Medicines</button>
                                    <button className="btn btn-outline-secondary">Load Scanning Details</button>
                                    <button className="btn btn-outline-secondary">Discharge Medicines</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit and cancel buttons */}
                <div className="d-flex justify-content-end">
                    <button className="btn btn-danger me-2" onClick={() => navigate("/summary")}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        Update Summary
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
};

export default EditSummary;