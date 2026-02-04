import { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../../Auth/apiRequest";
import {
  PageWrapper, Container, FormContent, FormRow, InputWrapper, Label, Input,
  Select, TextArea, Button, SectionTitle, SectionHeader, TableWrapper, Table, Th, Td, Tr,
  SearchButton, ModalOverlay, ModalContainer, ModalHeader, ModalTitle,
  CloseButton, ModalBody, SearchRow, SearchInput, NoResults,
  CollapsibleSection, SectionContent, CheckboxWrapper, Checkbox, FileInput,
  ButtonContainer, InfoIcon, TabContainer, Tab
} from "../GlobalStyles";


const Admission = () => {
  const [activeTab, setActiveTab] = useState("admission");
  const [mlcVisible, setMlcVisible] = useState(false);
  const [newBornVisible, setNewBornVisible] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomSearchQuery, setRoomSearchQuery] = useState("");
  const [roomResults, setRoomResults] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [editingId, setEditingId] = useState(null); // Track if editing an admission

  // Get base URL from environment
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [formData, setFormData] = useState({
    uhid: "",
    ipNumber: "",
    salutation: "",
    firstName: "",
    middleName: "",
    lastName: "",
    admissionDate: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    customerType: "GENERAL",
    admittingDoctor: "",
    consultingDoctor: "",
    roomNo: "",
    bedNo: "",
    extensionNumber: "",
    callRelease: "Local",
    nursingStation: "",
    presentComplaints: "",
    reasonForAdmission: "",
    admissionFee: "0.0",
    creditLimit: "200000.00",
    advance: "0.0",
    expectedDischargeDate: new Date().toISOString().split('T')[0],
    packageName: "",
    echsPackageFromDate: new Date().toISOString().split('T')[0],
    echsPackageToDate: new Date().toISOString().split('T')[0],
    admissionRemarks: "",
    mlcType: "",
    mlcRemarks: "",
    uploadMLCDoc: null,
    passAlertToAuthority: false,
    birthTime: "",
    weight: "",
    mothersUHIDNo: "",
    pediatricianResponsible: "",
    age: "",
    gender: "",
  });

  useEffect(() => {
    fetchNextIpNumber();
    fetchDoctors();
    fetchAdmissions();
  }, []);

  const fetchNextIpNumber = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}autoipNumber/`, "GET");
      if (response.success) {
        setFormData(prev => ({ ...prev, ipNumber: response.data.next_ipNumber }));
      } else {
        throw new Error(response.error || "Failed to fetch IP number");
      }
    } catch (error) {
      console.error("Error fetching IP number:", error.message);
      toast.error("Error fetching IP number");
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
      if (response.success) {
        setDoctors(response.data || []);
      } else {
        throw new Error(response.error || "Failed to fetch doctors");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error.message);
      toast.error("Error fetching doctors");
    }
  };

  const fetchAdmissions = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}admission/`, "GET");
      if (response.success) {
        setAdmissions(response.data || []);
      } else {
        throw new Error(response.error || "Failed to fetch admissions");
      }
    } catch (error) {
      console.error("Error fetching admissions:", error.message);
      toast.error("Error fetching admissions");
    }
  };

  const fetchPatientDetails = async () => {
    if (!formData.uhid) {
      toast.warning("Please enter UHID");
      return;
    }

    try {
      const response = await apiRequest(`${HmsBaseUrl}op-patient/${encodeURIComponent(formData.uhid)}/`, "GET");
      if (response.success) {
        const data = response.data;
        setFormData(prev => ({
          ...prev,
          salutation: data.salutation || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          age: data.age || "",
          gender: data.gender || "",
        }));
        toast.success("Patient details loaded successfully");
      } else {
        throw new Error(response.error || "Patient not found");
      }
    } catch (error) {
      console.error("Error fetching patient:", error.message);
      toast.error("Patient not found");
    }
  };

  const searchRooms = async () => {
    setLoadingRooms(true);
    try {
      const queryParam = roomSearchQuery ? `?room_number=${encodeURIComponent(roomSearchQuery)}` : "";
      const response = await apiRequest(`${HmsBaseUrl}search-rooms/${queryParam}`, "GET");
      if (response.success) {
        setRoomResults(response.data || []);
        if (response.data.length === 0) {
          toast.info("No rooms found");
        }
      } else {
        throw new Error(response.error || "Failed to search rooms");
      }
    } catch (error) {
      console.error("Error searching rooms:", error.message);
      toast.error("Failed to search rooms");
      setRoomResults([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleRoomSelect = (room) => {
    setFormData(prev => ({
      ...prev,
      roomNo: room.room_number,
      extensionNumber: room.phone_extension || "",
      nursingStation: room.nursing_station || "",
      admissionFee: room.admission_fee || "0.0",
    }));
    setShowRoomModal(false);
    setRoomSearchQuery("");
    setRoomResults([]);
    toast.success(`Room ${room.room_number} selected`);
  };

  const openRoomSearchModal = () => {
    setShowRoomModal(true);
    searchRooms(); // Load all rooms initially
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value
    }));
  };

  const handleReset = () => {
    setFormData({
      uhid: "",
      ipNumber: formData.ipNumber,
      salutation: "",
      firstName: "",
      middleName: "",
      lastName: "",
      admissionDate: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      customerType: "GENERAL",
      admittingDoctor: "",
      consultingDoctor: "",
      roomNo: "",
      bedNo: "",
      extensionNumber: "",
      callRelease: "Local",
      nursingStation: "",
      presentComplaints: "",
      reasonForAdmission: "",
      admissionFee: "0.0",
      creditLimit: "200000.00",
      advance: "0.0",
      expectedDischargeDate: new Date().toISOString().split('T')[0],
      packageName: "",
      echsPackageFromDate: new Date().toISOString().split('T')[0],
      echsPackageToDate: new Date().toISOString().split('T')[0],
      admissionRemarks: "",
      mlcType: "",
      mlcRemarks: "",
      uploadMLCDoc: null,
      passAlertToAuthority: false,
      birthTime: "",
      weight: "",
      mothersUHIDNo: "",
      pediatricianResponsible: "",
      age: "",
      gender: "",
    });
  };

  // Handle Edit/Cancel
  const handleEdit = (admission) => {
    setEditingId(admission._id || admission.id || admission.uhid); // Prioritize ID

    // Map admission data back to form
    const [room, bed] = (admission.roomNo || "").split("/");

    setFormData(prev => ({
      ...prev,
      ...admission,
      roomNo: room || admission.roomNo || "",
      bedNo: bed || admission.bedNo || "",
      // Ensure dates are formatted for input type="date"
      admissionDate: admission.admissionDate ? admission.admissionDate.split('T')[0] : "",
      echsPackageFromDate: admission.echsPackageFromDate ? admission.echsPackageFromDate.split('T')[0] : "",
      echsPackageToDate: admission.echsPackageToDate ? admission.echsPackageToDate.split('T')[0] : "",
      expectedDischargeDate: admission.expectedDischargeDate ? admission.expectedDischargeDate.split('T')[0] : "",
      birthTime: admission.birthTime || "",
    }));

    window.scrollTo(0, 0);
    toast.info("Editing admission record");
  };

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this admission?")) {
      try {
        const response = await apiRequest(`${HmsBaseUrl}admission/${id}/`, "DELETE");
        if (response.success) {
          toast.success("Admission cancelled successfully");
          fetchAdmissions(); // Refresh list
        } else {
          throw new Error(response.error || "Failed to cancel admission");
        }
      } catch (error) {
        console.error("Error cancelling admission:", error.message);
        toast.error("Failed to cancel admission");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formPayload = new FormData();
    Object.keys(formData).forEach(key => {
      // Exclude internal keys or handle specific ones if needed
      if (formData[key] !== null && formData[key] !== undefined) {
        formPayload.append(key, formData[key]);
      }
    });

    try {
      let response;
      if (editingId) {
        // Update
        response = await apiRequest(`${HmsBaseUrl}admission/${editingId}/`, "PUT", formPayload);
      } else {
        // Create
        response = await apiRequest(`${HmsBaseUrl}admission/`, "POST", formPayload);
      }

      if (response.success) {
        toast.success(editingId ? "Admission updated successfully!" : "Admission saved successfully!");
        setEditingId(null);
        handleReset();
        fetchNextIpNumber();
        fetchAdmissions();
      } else {
        throw new Error(response.error || "Failed to save admission");
      }
    } catch (error) {
      console.error("Error saving admission:", error.message);
      toast.error("Failed to save admission. Please try again.");
    }
  };

  return (
    <PageWrapper>
      <Container>
        <TabContainer>
          <Tab active={activeTab === "admission"} onClick={() => setActiveTab("admission")}>
            Admission
          </Tab>
          <Tab active={activeTab === "basicDetails"} onClick={() => setActiveTab("basicDetails")}>
            Basic Details
          </Tab>
        </TabContainer>

        {activeTab === "admission" && (
          <FormContent>
            <form onSubmit={handleSubmit}>
              {/* Row 1 */}
              <FormRow>
                <InputWrapper>
                  <Label required>UHID</Label>
                  <Input
                    type="text"
                    name="uhid"
                    value={formData.uhid}
                    onChange={handleInputChange}
                  />
                  <SearchButton type="button" onClick={fetchPatientDetails}>
                    🔍
                  </SearchButton>
                </InputWrapper>

                <InputWrapper>
                  <Label>IP Number</Label>
                  <Input
                    type="text"
                    name="ipNumber"
                    value={formData.ipNumber}
                    readOnly
                  />
                  <SearchButton type="button">🔍</SearchButton>
                </InputWrapper>

                <InputWrapper>
                  <Label>First Name</Label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label>Middle Name</Label>
                  <Input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                  />
                </InputWrapper>
              </FormRow>

              {/* Row 2 */}
              <FormRow>
                <InputWrapper>
                  <Label>Last Name</Label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label required>Admission Date</Label>
                  <Input
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleInputChange}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label required>Time</Label>
                  <Input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label required>Customer Type</Label>
                  <Select
                    name="customerType"
                    value={formData.customerType}
                    onChange={handleInputChange}
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="Insurance">Insurance</option>
                  </Select>
                </InputWrapper>
              </FormRow>

              {/* Row 3 */}
              <FormRow>
                <InputWrapper>
                  <Label required>Admitting Doctor</Label>
                  <Select
                    name="admittingDoctor"
                    value={formData.admittingDoctor}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.employeeId} value={doctor.employeeName}>
                        {doctor.employeeName}
                      </option>
                    ))}
                  </Select>
                </InputWrapper>

                <InputWrapper>
                  <Label required>Consulting Doctor</Label>
                  <Select
                    name="consultingDoctor"
                    value={formData.consultingDoctor}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.employeeId} value={doctor.employeeName}>
                        {doctor.employeeName}
                      </option>
                    ))}
                  </Select>
                </InputWrapper>

                <InputWrapper>
                  <Label required>Room No.</Label>
                  <Input
                    type="text"
                    name="roomNo"
                    value={formData.roomNo}
                    onChange={handleInputChange}
                  />
                  <SearchButton type="button" onClick={openRoomSearchModal}>🔍</SearchButton>
                </InputWrapper>

                <InputWrapper>
                  <Label required>Bed No.</Label>
                  <Input
                    type="text"
                    name="bedNo"
                    value={formData.bedNo}
                    onChange={handleInputChange}
                  />
                </InputWrapper>
              </FormRow>

              {/* Row 4 */}
              <FormRow>
                <InputWrapper>
                  <Label>Extension Number</Label>
                  <Input
                    type="text"
                    name="extensionNumber"
                    value={formData.extensionNumber}
                    onChange={handleInputChange}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label>Call Release</Label>
                  <Select
                    name="callRelease"
                    value={formData.callRelease}
                    onChange={handleInputChange}
                  >
                    <option value="Local">Local</option>
                    <option value="STD">STD</option>
                    <option value="ISD">ISD</option>
                  </Select>
                </InputWrapper>

                <InputWrapper span={2}>
                  <Label>Nursing Station</Label>
                  <Input
                    type="text"
                    name="nursingStation"
                    value={formData.nursingStation}
                    onChange={handleInputChange}
                  />
                </InputWrapper>
              </FormRow>

              {/* Row 5 */}
              <FormRow columns="1fr 1fr">
                <InputWrapper>
                  <Label>Present Complaints</Label>
                  <TextArea
                    name="presentComplaints"
                    value={formData.presentComplaints}
                    onChange={handleInputChange}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label>Reason for admission</Label>
                  <TextArea
                    name="reasonForAdmission"
                    value={formData.reasonForAdmission}
                    onChange={handleInputChange}
                  />
                </InputWrapper>
              </FormRow>

              {/* Row 6 */}
              <FormRow>
                <InputWrapper>
                  <Label>Admission Fee</Label>
                  <Input
                    type="number"
                    step="0.01"
                    name="admissionFee"
                    value={formData.admissionFee}
                    onChange={handleInputChange}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label>Credit Limit</Label>
                  <Input
                    type="number"
                    step="0.01"
                    name="creditLimit"
                    value={formData.creditLimit}
                    onChange={handleInputChange}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label>Advance</Label>
                  <Input
                    type="number"
                    step="0.01"
                    name="advance"
                    value={formData.advance}
                    onChange={handleInputChange}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label>Expected Discharge Date</Label>
                  <Input
                    type="date"
                    name="expectedDischargeDate"
                    value={formData.expectedDischargeDate}
                    onChange={handleInputChange}
                  />
                </InputWrapper>
              </FormRow>

              {/* Row 7 */}
              <FormRow>
                <InputWrapper span={2}>
                  <Label>Package Name</Label>
                  <Input
                    type="text"
                    name="packageName"
                    value={formData.packageName}
                    onChange={handleInputChange}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label>ECHS Package From Date</Label>
                  <Input
                    type="date"
                    name="echsPackageFromDate"
                    value={formData.echsPackageFromDate}
                    onChange={handleInputChange}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label>ECHS Package To Date</Label>
                  <Input
                    type="date"
                    name="echsPackageToDate"
                    value={formData.echsPackageToDate}
                    onChange={handleInputChange}
                  />
                </InputWrapper>
              </FormRow>

              {/* Row 8 */}
              <FormRow columns="1fr">
                <InputWrapper>
                  <Label>Admission Remarks</Label>
                  <TextArea
                    name="admissionRemarks"
                    value={formData.admissionRemarks}
                    onChange={handleInputChange}
                  />
                </InputWrapper>
              </FormRow>

              {/* Collapsible Sections */}
              <FormRow columns="1fr 1fr">
                <CollapsibleSection>
                  <SectionHeader onClick={() => setMlcVisible(!mlcVisible)}>
                    <SectionTitle>MLC</SectionTitle>
                    <span>{mlcVisible ? "▲" : "▼"}</span>
                  </SectionHeader>
                  <SectionContent visible={mlcVisible}>
                    <InputWrapper>
                      <Label>MLC Type</Label>
                      <Select
                        name="mlcType"
                        value={formData.mlcType}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="Accident">Accident</option>
                        <option value="Assault">Assault</option>
                        <option value="Other">Other</option>
                      </Select>
                    </InputWrapper>

                    <InputWrapper style={{ marginTop: '12px' }}>
                      <Label>
                        Upload MLC Doc
                        <InfoIcon>?</InfoIcon>
                      </Label>
                      <FileInput
                        type="file"
                        name="uploadMLCDoc"
                        onChange={handleInputChange}
                      />
                    </InputWrapper>

                    <CheckboxWrapper>
                      <Checkbox
                        type="checkbox"
                        name="passAlertToAuthority"
                        checked={formData.passAlertToAuthority}
                        onChange={handleInputChange}
                      />
                      <Label style={{ margin: 0 }}>Pass alert to authority</Label>
                    </CheckboxWrapper>

                    <InputWrapper style={{ marginTop: '12px' }}>
                      <Label>MLC Remarks</Label>
                      <TextArea
                        name="mlcRemarks"
                        value={formData.mlcRemarks}
                        onChange={handleInputChange}
                      />
                    </InputWrapper>
                  </SectionContent>
                </CollapsibleSection>

                <CollapsibleSection>
                  <SectionHeader onClick={() => setNewBornVisible(!newBornVisible)}>
                    <SectionTitle>New Born</SectionTitle>
                    <span>{newBornVisible ? "▲" : "▼"}</span>
                  </SectionHeader>
                  <SectionContent visible={newBornVisible}>
                    <FormRow columns="1fr 1fr">
                      <InputWrapper>
                        <Label>Birth Time</Label>
                        <Input
                          type="time"
                          name="birthTime"
                          value={formData.birthTime}
                          onChange={handleInputChange}
                        />
                      </InputWrapper>

                      <InputWrapper>
                        <Label>
                          Weight
                          <InfoIcon>?</InfoIcon>
                        </Label>
                        <Input
                          type="text"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                        />
                      </InputWrapper>
                    </FormRow>

                    <FormRow columns="1fr 1fr" style={{ marginTop: '12px' }}>
                      <InputWrapper>
                        <Label>Mother's UHID No</Label>
                        <Input
                          type="text"
                          name="mothersUHIDNo"
                          value={formData.mothersUHIDNo}
                          onChange={handleInputChange}
                        />
                        <SearchButton type="button">🔍</SearchButton>
                      </InputWrapper>

                      <InputWrapper>
                        <Label>Pediatrician Responsible</Label>
                        <Select
                          name="pediatricianResponsible"
                          value={formData.pediatricianResponsible}
                          onChange={handleInputChange}
                        >
                          <option value="">Select</option>
                          <option value="Dr. Smith">Dr. Smith</option>
                          <option value="Dr. Johnson">Dr. Johnson</option>
                        </Select>
                      </InputWrapper>
                    </FormRow>
                  </SectionContent>
                </CollapsibleSection>
              </FormRow>

              <ButtonContainer>
                <Button secondary type="button" onClick={handleReset}>
                  🔄 Reset
                </Button>
                <Button type="submit">
                  {editingId ? "💾 Update Admission" : "💾 Save Admission"}
                </Button>
              </ButtonContainer>
            </form>
          </FormContent>
        )}

        <div style={{ padding: '24px', borderTop: `1px solid ${'#e2e8f0'}` }}>
          <h3 style={{ color: '#0d9488', marginBottom: '20px' }}>Admitted Patients</h3>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>UHID</Th>
                  <Th>IP Number</Th>
                  <Th>Patient Name</Th>
                  <Th>Admission Date</Th>
                  <Th>Room/Bed</Th>
                  <Th>Doctor</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {admissions.length === 0 ? (
                  <Tr>
                    <Td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                      No admission records found
                    </Td>
                  </Tr>
                ) : (
                  admissions.map((admission, idx) => (
                    <Tr key={idx}>
                      <Td>{admission.uhid}</Td>
                      <Td>{admission.ipNumber}</Td>
                      <Td>{`${admission.firstName || ''} ${admission.middleName || ''} ${admission.lastName || ''}`.trim()}</Td>
                      <Td>{admission.admissionDate ? new Date(admission.admissionDate).toLocaleDateString() : '-'}</Td>
                      <Td>{`${admission.roomNo || '-'}/${admission.bedNo || '-'}`}</Td>
                      <Td>{admission.admittingDoctor || '-'}</Td>
                      <Td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: admission.is_active !== false ? '#dcfce7' : '#fee2e2',
                          color: admission.is_active !== false ? '#166534' : '#991b1b'
                        }}>
                          {admission.is_active !== false ? 'Active' : 'Cancelled'}
                        </span>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                            onClick={() => handleEdit(admission)}
                            disabled={admission.is_active === false}
                          >
                            ✏️ Edit
                          </Button>
                          <Button
                            secondary
                            danger
                            style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#ef4444', color: 'white' }}
                            onClick={() => handleCancel(admission._id || admission.id)}
                            disabled={admission.is_active === false}
                          >
                            🗑️ Cancel
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </div>
      </Container>

      {/* Room Search Modal */}
      {showRoomModal && (
        <ModalOverlay onClick={() => setShowRoomModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Search Rooms</ModalTitle>
              <CloseButton onClick={() => setShowRoomModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <SearchRow>
                <SearchInput
                  type="text"
                  placeholder="Enter room number..."
                  value={roomSearchQuery}
                  onChange={(e) => setRoomSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchRooms()}
                />
                <Button type="button" onClick={searchRooms} disabled={loadingRooms}>
                  {loadingRooms ? "Searching..." : "Search"}
                </Button>
              </SearchRow>

              {loadingRooms ? (
                <NoResults>Loading rooms...</NoResults>
              ) : roomResults.length > 0 ? (
                <Table>
                  <thead>
                    <tr>
                      <Th>Room No.</Th>
                      <Th>Category</Th>
                      <Th>Block</Th>
                      <Th>Floor</Th>
                      <Th>Capacity</Th>
                      <Th>Nursing Station</Th>
                      <Th>Fee</Th>
                      <Th>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomResults.map((room, index) => (
                      <tr key={index}>
                        <Td>{room.room_number}</Td>
                        <Td>{room.room_category}</Td>
                        <Td>{room.block}</Td>
                        <Td>{room.floor}</Td>
                        <Td>{room.capacity}</Td>
                        <Td>{room.nursing_station}</Td>
                        <Td>₹{room.admission_fee}</Td>
                        <Td>
                          <Button success onClick={() => handleRoomSelect(room)}>
                            Select
                          </Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <NoResults>No rooms found. Try a different search.</NoResults>
              )}
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default Admission;