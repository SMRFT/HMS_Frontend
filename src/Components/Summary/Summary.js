import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
import ICD11SearchComponent from "./ICD11SearchComponent";
import {
  PageWrapper,
  Container,
  FormContent,
  FormRow,
  InputWrapper,
  Label,
  Input,
  Select,
  Button,
  SectionHeader,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  ButtonContainer,
} from "../GlobalStyles"; // adjust path as needed

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

  const summaryTypeOptions = [
    "DISCHARGE SUMMARY",
    "DISCHARGE SUMMARY (BABY)",
    "DISCHARGE SUMMARY (INSURANCE)",
    "OPERATION NOTES",
    "MASTER HEALTH CHECK UP",
    "DISCHARGE SUMMARY (TKT)",
    "DEATH SUMMARY",
    "DISCHARGE SUMMARY AGAINST MEDICAL ADVICE",
    "DISCHARGE SUMMARY - BABY",
  ];

  const [formData, setFormData] = useState({
    date: "",
    ipNo: "",
    uhid: "",
    patient: "",
    doa: "",
    doaTime: "",
    dod: "",
    dodTime: "17:00", // default 5 PM
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

  const fetchIpPatient = async () => {
    if (!formData.ipNo) {
      alert("Please enter IP Number");
      return;
    }

    const encodedipNo = encodeURIComponent(formData.ipNo);
    const result = await apiRequest(
      `${HMSURL}ip-patient/${encodedipNo}/`,
      "GET",
    );

    if (result.success) {
      const data = result.data;
      const salutation = data.salutation || "";
      const firstName = data.firstName || "";
      const lastName = data.lastName || "";
      const fullName = `${salutation} ${firstName} ${lastName}`
        .trim()
        .replace(/\s+/g, " ");
      const addressParts = [data.area, data.city, data.state].filter(
        (part) => part && part.trim() !== "",
      );
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
      "GET",
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
      alert(result.error || "Error fetching investigation details");
      console.error("API error:", result.error);
    }
  };

  const toggleInvestigationSelection = (investigation) => {
    setSelectedInvestigations((prev) => {
      const exists = prev.some(
        (i) =>
          i.reportType === investigation.reportType &&
          i.investigation === investigation.investigation,
      );
      if (exists) {
        return prev.filter(
          (i) =>
            !(
              i.reportType === investigation.reportType &&
              i.investigation === investigation.investigation
            ),
        );
      } else {
        return [...prev, investigation];
      }
    });
  };

  const addInvestigationsToNotes = () => {
    if (selectedInvestigations.length === 0) {
      alert("Please select at least one investigation to add");
      return;
    }

    let investigationsText = "INVESTIGATIONS:\n";
    selectedInvestigations.forEach((investigation, index) => {
      if (index > 0) investigationsText += "\n---------------------\n";
      investigationsText += `${investigation.reportType}: 
${investigation.investigation || "No details available"}

Impression: 
${investigation.impression || "No impression available"}

Status: ${investigation.is_approved ? "Approved" : "PENDING APPROVAL - Results not finalized"}
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
      fieldsData: { ...prev.fieldsData, [prev.currentField]: prev.notes },
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
    if (selectedDiseases.length === 0) return { diseaseCode: "", disease: "" };
    return {
      diseaseCode: selectedDiseases.map((d) => d.code).join(", "),
      disease: selectedDiseases.map((d) => d.name).join("; "),
    };
  };

  const handleSubmit = async () => {
    if (formData.currentField && formData.notes) {
      setFormData((prev) => ({
        ...prev,
        fieldsData: { ...prev.fieldsData, [prev.currentField]: prev.notes },
      }));
    }

    const diseasesPayload = prepareDiseasesPayload();
    const summaryData = {
      ...formData,
      date: new Date().toISOString(),
      diseaseCode: diseasesPayload.diseaseCode,
      disease: diseasesPayload.disease,
      selectedDiseases,
    };

    summaryData.fieldsData = Object.fromEntries(
      Object.entries(summaryData.fieldsData).filter(
        ([key, value]) => key !== "undefined" && value !== "",
      ),
    );

    const result = await apiRequest(
      `${HMSURL}summaries/create/`,
      "POST",
      summaryData,
    );
    if (result.success) {
      alert("Summary successfully created!");
      resetForm();
      fetchSummaries();
    } else {
      alert(result.error || "Failed to submit summary.");
    }
  };

  const handleUpdate = async () => {
    const updatedFieldsData = {
      ...formData.fieldsData,
      [formData.currentField]: formData.notes,
    };
    const filteredFieldsData = Object.fromEntries(
      Object.entries(updatedFieldsData).filter(
        ([key, value]) =>
          value !== undefined && value !== "" && key !== "undefined",
      ),
    );

    if (Object.keys(filteredFieldsData).length === 0) {
      alert("Please fill in the required fields.");
      return;
    }

    const diseasesPayload = prepareDiseasesPayload();
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
      selectedDiseases,
      fieldsData: filteredFieldsData,
    };

    const result = await apiRequest(
      `${HMSURL}update-summary/${editingIpNo}/`,
      "PATCH",
      updatePayload,
    );
    if (result.success) {
      alert("Summary updated successfully!");
      setIsEditMode(false);
      setEditingIpNo(null);
      resetForm();
      fetchSummaries();
    } else {
      alert(`Failed to update summary: ${result.error || "Unknown error"}`);
    }
  };

  const resetForm = () => {
    setFormData({
      date: "",
      ipNo: "",
      uhid: "",
      patient: "",
      doa: "",
      doaTime: "",
      dod: "",
      dodTime: "17:00", // reset to default 5 PM
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
    setSelectedDiseases([]);
  };

  const handleEdit = async (ipNo) => {
    const encodedIpNo = encodeURIComponent(ipNo);
    const result = await apiRequest(
      `${HMSURL}get-editsummary/${encodedIpNo}/`,
      "GET",
    );

    if (result.success) {
      const data = result.data;

      let parsedFieldsData = {};
      if (data.fieldsData) {
        try {
          parsedFieldsData =
            typeof data.fieldsData === "string"
              ? JSON.parse(data.fieldsData)
              : data.fieldsData;
        } catch (error) {
          parsedFieldsData = {};
        }
      }

      let parsedDiseases = [];
      if (data.selectedDiseases) {
        try {
          parsedDiseases =
            typeof data.selectedDiseases === "string"
              ? JSON.parse(data.selectedDiseases)
              : data.selectedDiseases;
        } catch (error) {
          if (data.diseaseCode && data.disease) {
            const codes = data.diseaseCode.split(", ");
            const names = data.disease.split("; ");
            parsedDiseases = codes.map((code, idx) => ({
              id: `${code}-${Date.now()}-${idx}`,
              code,
              name: names[idx] || "",
            }));
          }
        }
      } else if (data.diseaseCode && data.disease) {
        const codes = data.diseaseCode.split(", ");
        const names = data.disease.split("; ");
        parsedDiseases = codes.map((code, idx) => ({
          id: `${code}-${Date.now()}-${idx}`,
          code,
          name: names[idx] || "",
        }));
      }

      setFormData({
        ...data,
        dodTime: data.dodTime || "17:00", // fallback to 5 PM if empty
        notes: "",
        fieldsData: parsedFieldsData,
        currentField: "",
      });

      setSelectedDiseases(parsedDiseases);
      setIsEditMode(true);
      setEditingIpNo(ipNo);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      alert("Summary not found");
    }
  };

  const handlePrint = (ipNo) =>
    navigate(`/SummaryPrint/${encodeURIComponent(ipNo)}`);

  const handleDelete = async (ipNo) => {
    if (window.confirm("Are you sure you want to delete this summary?")) {
      const result = await apiRequest(
        `${HMSURL}delete-summary/${ipNo}/`,
        "PATCH",
      );
      if (result.success) {
        alert("Summary deleted successfully");
        setSummaries((prev) => prev.filter((s) => s.ipNo !== ipNo));
      } else {
        alert("Error deleting summary: " + result.error);
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
      },
    );

    if (result.success) {
      setSummaries((prev) =>
        prev.map((s) => (s.ipNo === ipNo ? { ...s, approve: true } : s)),
      );
      alert("Summary approved successfully!");
    } else {
      alert("Error approving summary: " + result.error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "file" ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  const handleCancelEdit = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel editing? All unsaved changes will be lost.",
      )
    ) {
      resetForm();
    }
  };

  return (
    <PageWrapper>
      <Container>
        <div className="p-4">
          <h2 className="text-center mb-4">
            {isEditMode ? "Edit Summary" : "Summary"}
          </h2>

          {isEditMode && (
            <div className="alert alert-info" role="alert">
              You are currently editing the summary for IP No:{" "}
              <strong>{editingIpNo}</strong>
            </div>
          )}

          {/* Top Form Card */}
          <div className="card p-4 shadow-sm mb-4">
            {/* Row 1 */}
            <div className="row mb-3">
              <div className="col-md-2">
                <Label>Summary Date</Label>
                <Input
                  type="text"
                  value={isEditMode ? formData.date : currentDate}
                  readOnly
                  style={{ width: "100%" }}
                />
              </div>

              <div className="col-md-2">
                <Label>IP Number</Label>
                <Input
                  type="text"
                  name="ipNo"
                  value={formData.ipNo}
                  onChange={handleInputChange}
                  readOnly={isEditMode}
                  style={{ width: "100%" }}
                />
                {!isEditMode && (
                  <Button
                    type="button"
                    onClick={fetchIpPatient}
                    style={{ marginTop: "8px" }}
                  >
                    Search
                  </Button>
                )}
              </div>

              <div className="col-md-2">
                <Label>UHID</Label>
                <Input
                  type="text"
                  name="uhid"
                  value={formData.uhid}
                  onChange={handleChange}
                  placeholder="Search UHID"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="col-md-2">
                <Label>Patient</Label>
                <Input
                  type="text"
                  name="patient"
                  value={formData.patient}
                  onChange={handleChange}
                  placeholder="Enter Patient"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="col-md-2">
                <Label>Age</Label>
                <Input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter Age"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="col-md-2">
                <Label>Room No</Label>
                <Input
                  type="text"
                  name="roomNo"
                  value={formData.roomNo}
                  onChange={handleChange}
                  placeholder="Enter Room No"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="row mb-3">
              <div className="col-md-2">
                <Label>D.O.A</Label>
                <Input
                  type="text"
                  name="doa"
                  value={formData.doa}
                  onChange={handleChange}
                  placeholder="Enter D.O.A"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="col-md-1">
                <Label>Time</Label>
                <Input
                  type="text"
                  name="doaTime"
                  value={formData.doaTime}
                  onChange={handleChange}
                  placeholder="Time"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="col-md-2">
                <Label>D.O.D</Label>
                <Input
                  type="date"
                  name="dod"
                  value={formData.dod}
                  onChange={handleChange}
                  style={{ width: "100%" }}
                />
              </div>

              {/* DOD Time — defaults to 17:00 (5 PM) */}
              <div className="col-md-1">
                <Label>DOD Time</Label>
                <Input
                  type="time"
                  name="dodTime"
                  value={formData.dodTime}
                  onChange={handleChange}
                  style={{ width: "100%" }}
                />
              </div>

              {/* Surgery Date — date picker */}
              <div className="col-md-2">
                <Label>Surgery Date</Label>
                <Input
                  type="date"
                  name="surgeryDate"
                  value={formData.surgeryDate}
                  onChange={handleChange}
                  style={{ width: "100%" }}
                />
              </div>

              {/* Next Review Date — date picker */}
              <div className="col-md-2">
                <Label>Next Review Date</Label>
                <Input
                  type="date"
                  name="nextReviewDate"
                  value={formData.nextReviewDate}
                  onChange={handleChange}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="col-md-2">
                <Label>Doctor</Label>
                <Input
                  type="text"
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  placeholder="Enter Doctor"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="row mb-3">
              <div className="col-md-2">
                <Label>Gender</Label>
                <Input
                  type="text"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  placeholder="Enter Gender"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="col-md-3">
                <Label required>Summary Type</Label>
                <Select
                  name="summaryType"
                  value={formData.summaryType}
                  onChange={handleChange}
                  style={{ width: "100%" }}
                >
                  <option value="">Select Summary Type</option>
                  {summaryTypeOptions.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="col-md-2">
                <Label>Heading</Label>
                <Input
                  type="text"
                  name="heading"
                  value={formData.heading}
                  onChange={handleChange}
                  placeholder="Enter Heading"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="col-md-3">
                <Label>Address</Label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            {/* ICD11 Search */}
            <div className="row mb-3">
              <div className="col-md-12 mt-3">
                <ICD11SearchComponent
                  onDiseasesChange={(diseases) => setSelectedDiseases(diseases)}
                  initialDiseases={selectedDiseases}
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
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
                    className={`list-group-item ${selectedField === field ? "active" : ""}`}
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

            <div className="col-md-9 d-flex flex-column">
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
                />
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
                    <Button danger onClick={handleCancelEdit}>
                      Cancel Edit
                    </Button>
                  )}
                  <Button onClick={isEditMode ? handleUpdate : handleSubmit}>
                    {isEditMode ? "Update Summary" : "Upload Summary"}
                  </Button>
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
                    />
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
                        <p className="text-muted mb-3">
                          Select investigations to add to the summary.
                          Unapproved investigations are highlighted in yellow.
                        </p>
                        <div className="list-group">
                          {investigations.map((investigation, index) => (
                            <div
                              key={index}
                              className={`list-group-item list-group-item-action ${!investigation.is_approved ? "list-group-item-warning" : ""} ${
                                selectedInvestigations.some(
                                  (i) =>
                                    i.reportType === investigation.reportType &&
                                    i.investigation ===
                                      investigation.investigation,
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
                                  ? `${investigation.investigation.substring(0, 100)}...`
                                  : investigation.investigation}
                              </p>
                              <small className="text-muted">
                                Impression:{" "}
                                {investigation.impression.length > 50
                                  ? `${investigation.impression.substring(0, 50)}...`
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

          {/* Summary Reports Table */}
          <div className="my-4">
            <h2 className="mb-4 text-center">Summary Reports</h2>
            <TableWrapper>
              {summaries.length === 0 ? (
                <p className="text-center p-4">No Summary Reports Found</p>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <Th>Date</Th>
                      <Th>Patient Name</Th>
                      <Th>Approve Status</Th>
                      <Th>Summary Type</Th>
                      <Th>UHID</Th>
                      <Th>IP No</Th>
                      <Th>Approve Date</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.map((summary, index) => (
                      <Tr key={summary.id || index}>
                        <Td>
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
                        </Td>
                        <Td>{summary.patient}</Td>
                        <Td>
                          <span
                            style={{
                              color: summary.approve ? "green" : "red",
                              fontWeight: "bold",
                            }}
                          >
                            {summary.approve ? "Approved" : "Pending"}
                          </span>
                        </Td>
                        <Td>{summary.summaryType}</Td>
                        <Td>{summary.uhid}</Td>
                        <Td>{summary.ipNo}</Td>
                        <Td>
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
                                },
                              )
                            : "N/A"}
                        </Td>
                        <Td>
                          <div className="d-flex gap-2">
                            <Button
                              secondary={summary.approve}
                              onClick={() => handleEdit(summary.ipNo)}
                              disabled={summary.approve}
                              style={{
                                padding: "6px 12px",
                                fontSize: "0.85rem",
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              danger
                              onClick={() => handleDelete(summary.ipNo)}
                              disabled={summary.approve}
                              style={{
                                padding: "6px 12px",
                                fontSize: "0.85rem",
                              }}
                            >
                              Delete
                            </Button>
                            <Button
                              success={!summary.approve}
                              secondary={summary.approve}
                              onClick={() => handleApprove(summary.ipNo)}
                              disabled={summary.approve}
                              style={{
                                padding: "6px 12px",
                                fontSize: "0.85rem",
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              secondary
                              onClick={() => handlePrint(summary.ipNo)}
                              style={{
                                padding: "6px 12px",
                                fontSize: "0.85rem",
                              }}
                            >
                              Print
                            </Button>
                          </div>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </TableWrapper>
          </div>
        </div>
      </Container>
    </PageWrapper>
  );
};

export default Summary;
