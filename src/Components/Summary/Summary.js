import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
import ICD11SearchComponent from './ICD11SearchComponent';

const Summary = () => {
  const currentDate = new Date().toLocaleDateString();
  const [selectedField, setSelectedField] = useState("");
  const [summaries, setSummaries] = useState([]);
  const navigate = useNavigate();
  const [showInvestigations, setShowInvestigations] = useState(false);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvestigations, setSelectedInvestigations] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingIpNo, setEditingIpNo] = useState(null);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // Summary type options
  const summaryTypeOptions = [
    "DISCHARGE SUMMARY",
    "DISCHARGE SUMMARY (BABY)",
    "DISCHARGE SUMMARY (INSURANCE)",
    "OPERATION NOTES",
    "MASTER HEALTH CHECK UP",
    "DISCHARGE SUMMARY (TKT)",
    "DEATH SUMMARY",
    "DISCHARGE SUMMARY AGAINST MEDICAL ADVICE",
    "DISCHARGE SUMMARY - BABY"
  ];

  const [formData, setFormData] = useState({
    date: "",
    ipNo: "",
    uhid: "",
    patient: "",
    doa: "",
    doaTime: "",
    dod: "",
    dodTime: "",
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

    const result = await apiRequest(
      `${HMSURL}ip-patient/${encodedipNo}/`,
      "GET"
    );

    if (result.success) {
      const data = result.data;
      const salutation = data.salutation || "";
      const firstName = data.firstName || "";
      const lastName = data.lastName || "";
      const fullName = `${salutation} ${firstName} ${lastName}`
        .trim()
        .replace(/\s+/g, " ");

      // Construct full address from area, city, state
      const addressParts = [
        data.area,
        data.city,
        data.state
      ].filter(part => part && part.trim() !== "");
      const fullAddress = addressParts.join(", ");

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
        doaTime: data.admissionTime || "",
        doctor: data.admittingDoctor || "",
        address: fullAddress,
      });
    } else {
      alert("Patient not found");
      console.error("Error fetching patient data:", result.error);
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

    const result = await apiRequest(
      `${HMSURL}patient-investigations/${encodeURIComponent(formData.ipNo)}/`,
      "GET"
    );

    setLoading(false);

    if (result.success) {
      const data = result.data;
      if (Array.isArray(data) && data.length > 0) {
        setInvestigations(data);
        setShowInvestigations(true);
      } else {
        alert("No investigations found for this patient");
        setShowInvestigations(false);
        setInvestigations([]);
      }
    } else {
      const errorMessage =
        result.error || "Error fetching investigation details";
      alert(errorMessage);
      console.error("API error:", result.error);
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

    let investigationsText = "INVESTIGATIONS:\n";
    selectedInvestigations.forEach((investigation, index) => {
      if (index > 0) {
        investigationsText += "\n---------------------\n";
      }

      investigationsText += `${investigation.reportType}: 
${investigation.investigation || "No details available"}

Impression: 
${investigation.impression || "No impression available"}

Status: ${investigation.is_approved
          ? "Approved"
          : "PENDING APPROVAL - Results not finalized"
        }
`;
    });

    if (formData.currentField === "INVESTIGATIONS") {
      const updatedNotes = formData.notes
        ? `${formData.notes}\n\n${investigationsText}`
        : investigationsText;

      setFormData({ ...formData, notes: updatedNotes });
    } else {
      setFormData((prev) => {
        const updatedFieldsData = {
          ...prev.fieldsData,
          [prev.currentField]: prev.notes,
        };

        const existingInvestigations =
          updatedFieldsData["INVESTIGATIONS"] || "";
        updatedFieldsData["INVESTIGATIONS"] = existingInvestigations
          ? `${existingInvestigations}\n\n${investigationsText}`
          : investigationsText;

        return {
          ...prev,
          fieldsData: updatedFieldsData,
          currentField: "INVESTIGATIONS",
          notes: updatedFieldsData["INVESTIGATIONS"],
        };
      });

      setSelectedField("INVESTIGATIONS");
    }

    setShowInvestigations(false);
    setSelectedInvestigations([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleButtonClick = (fieldName) => {
    setSelectedField(fieldName);
    setFormData((prev) => ({
      ...prev,
      fieldsData: {
        ...prev.fieldsData,
        [prev.currentField]: prev.notes,
      },
      currentField: fieldName,
      notes: prev.fieldsData[fieldName] || "",
    }));

    notesRef.current.focus();
  };

  const fetchSummaries = async () => {
    const result = await apiRequest(`${HMSURL}summaries/`, "GET");

    if (result.success) {
      setSummaries(result.data);
    } else {
      console.error("Error fetching summaries:", result.error);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const prepareDiseasesPayload = () => {
    if (selectedDiseases.length === 0) {
      return { diseaseCode: "", disease: "" };
    }

    const codes = selectedDiseases.map(d => d.code).join(", ");
    const names = selectedDiseases.map(d => d.name).join("; ");

    return {
      diseaseCode: codes,
      disease: names
    };
  };

  // Update handleSubmit function
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

    const currentDateTime = new Date().toISOString();
    const diseasesPayload = prepareDiseasesPayload();

    const summaryData = {
      ...formData,
      date: currentDateTime,
      diseaseCode: diseasesPayload.diseaseCode,
      disease: diseasesPayload.disease,
      selectedDiseases: selectedDiseases, // Optional: if you want to store the full array
    };

    summaryData.fieldsData = Object.fromEntries(
      Object.entries(summaryData.fieldsData).filter(
        ([key, value]) => key !== "undefined" && value !== ""
      )
    );

    const result = await apiRequest(
      `${HMSURL}summaries/create/`,
      "POST",
      summaryData
    );

    if (result.success) {
      console.log("Submitted Data:", result.data);
      alert("Summary successfully created!");
      resetForm();
      setSelectedDiseases([]); // Reset selected diseases
      fetchSummaries();
    } else {
      console.error("Error:", result.error);
      alert(result.error || "Failed to submit summary.");
    }
  };

  // Update handleUpdate function
  const handleUpdate = async () => {
    // First, save current field's notes to fieldsData before submitting
    const updatedFieldsData = {
      ...formData.fieldsData,
      [formData.currentField]: formData.notes,
    };

    // Filter out empty fields
    const filteredFieldsData = Object.fromEntries(
      Object.entries(updatedFieldsData).filter(
        ([key, value]) => value !== undefined && value !== "" && key !== "undefined"
      )
    );

    if (Object.keys(filteredFieldsData).length === 0) {
      alert("Please fill in the required fields.");
      return;
    }

    const diseasesPayload = prepareDiseasesPayload();

    // Prepare the complete payload with all form data
    const updatePayload = {
      ipNo: formData.ipNo,
      uhid: formData.uhid,
      patient: formData.patient,
      doa: formData.doa,
      doaTime: formData.doaTime,
      dod: formData.dod,
      dodTime: formData.dodTime,
      roomNo: formData.roomNo,
      age: formData.age,
      surgeryDate: formData.surgeryDate,
      nextReviewDate: formData.nextReviewDate,
      doctor: formData.doctor,
      gender: formData.gender,
      summaryType: formData.summaryType,
      heading: formData.heading,
      address: formData.address,
      diseaseCode: diseasesPayload.diseaseCode,
      disease: diseasesPayload.disease,
      selectedDiseases: selectedDiseases, // Optional: if you want to store the full array
      fieldsData: filteredFieldsData
    };

    const result = await apiRequest(
      `${HMSURL}update-summary/${editingIpNo}/`,
      "PATCH",
      updatePayload
    );

    if (result.success) {
      alert("Summary updated successfully!");
      setIsEditMode(false);
      setEditingIpNo(null);
      resetForm();
      setSelectedDiseases([]); // Reset selected diseases
      fetchSummaries();
    } else {
      alert(`Failed to update summary: ${result.error || "Unknown error"}`);
    }
  };

  // Update resetForm function to also reset selectedDiseases
  const resetForm = () => {
    setFormData({
      date: "",
      ipNo: "",
      uhid: "",
      patient: "",
      doa: "",
      doaTime: "",
      dod: "",
      dodTime: "",
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
    setSelectedField("");
    setIsEditMode(false);
    setEditingIpNo(null);
    setSelectedDiseases([]); // Add this line
  };

  // Update handleEdit function to restore selectedDiseases when editing
  const handleEdit = async (ipNo) => {
    const encodedIpNo = encodeURIComponent(ipNo);

    const result = await apiRequest(
      `${HMSURL}get-editsummary/${encodedIpNo}/`,
      "GET"
    );

    if (result.success) {
      const data = result.data;

      // Parse fieldsData if it's a string
      let parsedFieldsData = {};
      if (data.fieldsData) {
        try {
          parsedFieldsData = typeof data.fieldsData === 'string'
            ? JSON.parse(data.fieldsData)
            : data.fieldsData;
        } catch (error) {
          console.error("Error parsing fieldsData:", error);
          parsedFieldsData = {};
        }
      }

      // Parse selectedDiseases if it exists
      let parsedDiseases = [];
      if (data.selectedDiseases) {
        try {
          parsedDiseases = typeof data.selectedDiseases === 'string'
            ? JSON.parse(data.selectedDiseases)
            : data.selectedDiseases;
        } catch (error) {
          console.error("Error parsing selectedDiseases:", error);
          // If parsing fails, try to reconstruct from diseaseCode and disease
          if (data.diseaseCode && data.disease) {
            const codes = data.diseaseCode.split(", ");
            const names = data.disease.split("; ");
            parsedDiseases = codes.map((code, idx) => ({
              id: `${code}-${Date.now()}-${idx}`,
              code: code,
              name: names[idx] || ""
            }));
          }
        }
      } else if (data.diseaseCode && data.disease) {
        // Reconstruct from diseaseCode and disease if selectedDiseases doesn't exist
        const codes = data.diseaseCode.split(", ");
        const names = data.disease.split("; ");
        parsedDiseases = codes.map((code, idx) => ({
          id: `${code}-${Date.now()}-${idx}`,
          code: code,
          name: names[idx] || ""
        }));
      }

      setFormData({
        date: data.date || "",
        ipNo: data.ipNo || "",
        uhid: data.uhid || "",
        patient: data.patient || "",
        doa: data.doa || "",
        doaTime: data.doaTime || "",
        dod: data.dod || "",
        dodTime: data.dodTime || "",
        roomNo: data.roomNo || "",
        age: data.age || "",
        surgeryDate: data.surgeryDate || "",
        nextReviewDate: data.nextReviewDate || "",
        doctor: data.doctor || "",
        gender: data.gender || "",
        summaryType: data.summaryType || "",
        heading: data.heading || "",
        address: data.address || "",
        diseaseCode: data.diseaseCode || "",
        disease: data.disease || "",
        specialNeeds: data.specialNeeds || "",
        vaccinationHistory: data.vaccinationHistory || "",
        dischargeType: data.dischargeType || "",
        admissionDiagnosis: data.admissionDiagnosis || "",
        dischargeDiagnosis: data.dischargeDiagnosis || "",
        consultant: data.consultant || "",
        briefHistory: data.briefHistory || "",
        pastMedicalHistory: data.pastMedicalHistory || "",
        generalExamination: data.generalExamination || "",
        vitals: data.vitals || "",
        hospitalCourse: data.hospitalCourse || "",
        investigations: data.investigations || "",
        proceduresPerformed: data.proceduresPerformed || "",
        specificMedications: data.specificMedications || "",
        conditionOnDischarge: data.conditionOnDischarge || "",
        adviceOnDischarge: data.adviceOnDischarge || "",
        notes: "",
        fieldsData: parsedFieldsData,
        currentField: "",
        approve: data.approve || false,
        approve_time: data.approve_time || null,
      });

      setSelectedDiseases(parsedDiseases); // Set the parsed diseases
      setIsEditMode(true);
      setEditingIpNo(ipNo);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      alert("Summary not found");
      console.error("Error fetching summary:", result.error);
    }
  };

  const handlePrint = (ipNo) => {
    const encodedIpNo = encodeURIComponent(ipNo);
    navigate(`/SummaryPrint/${encodedIpNo}`);
  };

  const handleDelete = async (ipNo) => {
    if (window.confirm("Are you sure you want to delete this summary?")) {
      const result = await apiRequest(
        `${HMSURL}delete-summary/${ipNo}/`,
        "PATCH"
      );

      if (result.success) {
        alert("Summary deleted successfully");
        setSummaries((prevSummaries) =>
          prevSummaries.filter((summary) => summary.ipNo !== ipNo)
        );
      } else {
        alert("Error deleting summary: " + result.error);
        console.error("Error deleting summary:", result.error);
      }
    }
  };

  const handleApprove = async (ipNo) => {
    const result = await apiRequest(
      `${HMSURL}approve-summary/${ipNo}/`,
      "PATCH",
      {
        approve: true,
        approve_time: new Date().toISOString(),
      }
    );

    if (result.success) {
      console.log("Summary approved:", result.data);
      setSummaries((prevSummaries) =>
        prevSummaries.map((summary) =>
          summary.ipNo === ipNo ? { ...summary, approve: true } : summary
        )
      );
      alert("Summary approved successfully!");
    } else {
      console.error("Error approving summary:", result.error);
      alert("Error approving summary: " + result.error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]:
        type === "file" ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  const handleCancelEdit = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel editing? All unsaved changes will be lost."
      )
    ) {
      resetForm();
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">
        {isEditMode ? "Edit Summary" : "Summary"}
      </h2>

      {isEditMode && (
        <div className="alert alert-info" role="alert">
          You are currently editing the summary for IP No: <strong>{editingIpNo}</strong>
        </div>
      )}

      <div className="card p-4 shadow-sm">
        <div className="row mb-3">
          <div className="col-md-2">
            <label className="form-label">Summary Date</label>
            <input
              type="text"
              className="form-control"
              value={isEditMode ? formData.date : currentDate}
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
              readOnly={isEditMode}
            />
            {!isEditMode && (
              <button
                type="button"
                onClick={fetchIpPatient}
                className="btn btn-primary mt-2"
              >
                Search
              </button>
            )}
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
            <label className="form-label">D.O.A </label>
            <input
              type="text"
              className="form-control"
              name="doa"
              value={formData.doa}
              onChange={handleChange}
              placeholder="Enter D.O.A"
            />
          </div>

          <div className="col-md-1">
            <label className="form-label">Time</label>
            <input
              type="text"
              className="form-control"
              name="doaTime"
              value={formData.doaTime}
              onChange={handleChange}
              placeholder="Time"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">D.O.D </label>
            <input
              type="date"
              className="form-control"
              name="dod"
              value={formData.dod}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-1">
            <label className="form-label">Time</label>
            <input
              type="time"
              className="form-control"
              name="dodTime"
              value={formData.dodTime}
              onChange={handleChange}
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
        </div>

        <div className="row mb-3">
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

          <div className="col-md-3">
            <label className="form-label">Summary Type *</label>
            <select
              className="form-select"
              name="summaryType"
              value={formData.summaryType}
              onChange={handleChange}
              required
            >
              <option value="">Select Summary Type</option>
              {summaryTypeOptions.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
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

          <div className="col-md-3">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-control"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
            />
          </div>

        </div>

        <div className="row mb-3">

          {/* Add after the Disease input field */}
          <div className="col-md-12 mt-3">
            <ICD11SearchComponent
              onDiseasesChange={(diseases) => setSelectedDiseases(diseases)}
              initialDiseases={selectedDiseases}
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
                  className={`list-group-item ${selectedField === field ? "active" : ""
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
              <div className="d-flex justify-content-end gap-2">
                {isEditMode && (
                  <button
                    className="btn btn-danger"
                    onClick={handleCancelEdit}
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={isEditMode ? handleUpdate : handleSubmit}
                >
                  {isEditMode ? "Update Summary" : "Upload Summary"}
                </button>
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
                            className={`list-group-item list-group-item-action ${!investigation.is_approved
                              ? "list-group-item-warning"
                              : ""
                              } ${selectedInvestigations.some(
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
                              {!investigation.is_approved && (
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
                  {summaries.map((summary, index) => (
                    <tr key={summary.id || index}>
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
                            className={`btn btn-sm ${summary.approve ? "btn-secondary" : "btn-primary"
                              }`}
                            onClick={() => handleEdit(summary.ipNo)}
                            disabled={summary.approve}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(summary.ipNo)}
                            disabled={summary.approve}
                          >
                            Delete
                          </button>
                          <button
                            className={`btn btn-sm ${summary.approve ? "btn-secondary" : "btn-success"
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