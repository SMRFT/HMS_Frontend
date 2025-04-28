import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";


const Summary = () => {
    const currentDate = new Date().toLocaleDateString();
    const [selectedField, setSelectedField] = useState(''); // State for the selected field
    const [summaries, setSummaries] = useState([]);
    const navigate = useNavigate(); // Initialize navigate

    const [formData, setFormData] = useState({
        date:"",
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
        notes: "", // Current text area content
        fieldsData: {}, // Stores data for each field
        approve: false,  // Set approve as false
        approve_time: null,  // Set approve_time as null
    });

    const notesRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleButtonClick = (fieldName) => {
        setSelectedField(fieldName); // Update selected field when a list item is clicked
        // Save the current notes into the specific field's data
        setFormData((prev) => ({
            ...prev,
            fieldsData: {
                ...prev.fieldsData,
                [prev.currentField]: prev.notes,
            },
            currentField: fieldName, // Set the new active field
            notes: prev.fieldsData[fieldName] || "", // Load notes for the selected field
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
        const currentDateTime = new Date().toISOString(); // ISO format: 'YYYY-MM-DDTHH:mm:ss.sssZ'
    
        // Include currentDateTime in the summaryData
        const summaryData = { ...formData, date: currentDateTime };
    
        // Filter out any undefined fields from summaryData
        summaryData.fieldsData = Object.fromEntries(
            Object.entries(summaryData.fieldsData).filter(([key, value]) => key !== "undefined" && value !== "")
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
                    date: "", // Reset date field
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
        // Correct the URL
        fetch("http://127.0.0.1:8000/summaries/") // Ensure this is the correct API endpoint
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
        const encodedIpNo = encodeURIComponent(ipNo); // Encode the parameter
        navigate(`/EditSummary/${encodedIpNo}`);
    };
    
    const handlePrint = (ipNo) => {
        const encodedIpNo = encodeURIComponent(ipNo); // Encode the parameter
        navigate(`/SummaryPrint/${encodedIpNo}`);
    };
        

    const handleDelete = (ipNo) => {
        if (window.confirm("Are you sure you want to delete this summary?")) {
            fetch(`http://127.0.0.1:8000/delete-summary/${ipNo}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // Add CSRF token if required
                }
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error("Failed to delete summary");
                })
                .then((data) => {
                    alert("Summary deleted successfully");
                    // Handle success (e.g., remove the deleted summary from the UI)
                    setSummaries(prevSummaries =>
                        prevSummaries.filter(summary => summary.ipNo !== ipNo)
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
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
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
                // Update state to reflect approval status
                setSummaries(prevSummaries =>
                    prevSummaries.map(summary =>
                        summary.ipNo === ipNo ? { ...summary, approve: true } : summary
                    )
                );
                // Success alert
                alert("Summary approved successfully!");
            })
            .catch((error) => {
                console.error("Error approving summary:", error);
                alert("Error approving summary: " + error.message);
            });
    };


    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Summary</h2>

            <div className="card p-4 shadow-sm">
                <div className="row mb-3">
                    <div className="col-md-2">
                        <label className="form-label">Summary Date</label>
                        <input type="text" className="form-control" value={currentDate} readOnly />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label">IP No</label>
                        <input
                            type="text"
                            className="form-control"
                            name="ipNo"
                            value={formData.ipNo}
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
                        <select
                            className="form-select"
                            name="doctor"
                            value={formData.doctor}
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
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
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
                                    className="list-group-item"
                                    onClick={() => handleButtonClick(field)}
                                    style={{
                                        cursor: "pointer",
                                        fontSize: "0.85rem",  // Reduced font size
                                        padding: "0.4rem 0.5rem", // Reduced padding
                                        fontWeight: "bold", // Bold font
                                    }}
                                >
                                    {field}
                                </li>
                            ))}
                        </ul>
                    </div>


                    <div className="col-md-9 d-flex flex-column" style={{ flexGrow: 1 }}>
                        <div className="card p-4 shadow-sm" style={{ flexGrow: 1 }}>
                            <h5 className="mb-3">{selectedField || 'Summary Notes'}</h5> {/* Display selected field or default 'Summary Notes' */}
                            <textarea
                                ref={notesRef}
                                className="form-control mb-3"
                                style={{ flexGrow: 1, resize: "none" }}
                                name="notes"
                                placeholder="Add notes here"
                                value={formData.notes}
                                onChange={handleChange}
                            ></textarea>

                            <div className="d-flex gap-2 mb-3">
                                <button className="btn btn-outline-secondary">Add Investigations</button>
                                <button className="btn btn-outline-secondary">Add Medicines</button>
                                <button className="btn btn-outline-secondary">Load Scanning Details</button>
                                <button className="btn btn-outline-secondary">Discharge Medicines</button>
                            </div>

                            <div className="d-flex justify-content-end">
                                {/* <button className="btn btn-danger me-2">Cancel</button> */}
                                <button className="btn btn-primary" onClick={handleSubmit}>
                                    Upload Summary
                                </button>
                            </div>
                        </div>
                    </div>
                </div>



                <div className="container my-4">
                    <h2 className="mb-4 text-center">Summary Reports</h2>
                    <div className="table-responsive">
                        {summaries.length === 0 ? ( // Check if summaries is empty
                            <p className="text-center">No Summary Reports Found</p>  // Display message if no reports
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
                                                    ? new Date(summary.approve_time).toLocaleString("en-GB", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })
                                                    : "N/A"}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button                                                       
                                                        className={`btn btn-sm ${summary.approve ? 'btn-secondary' : 'btn-primary'}`} // Change class based on approval status
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
                                                        className={`btn btn-sm ${summary.approve ? 'btn-secondary' : 'btn-success'}`} // Change class based on approval status
                                                        onClick={() => handleApprove(summary.ipNo)}  // Passing ipNo here
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

