import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../../Auth/apiRequest";
import {
  PageWrapper, Container, Button, TableWrapper, Table, Th, Td, Tr,
  ModalOverlay, ModalContainer, ModalHeader, ModalTitle,
  CloseButton, ModalBody, SearchRow, SearchInput, NoResults,
} from "../GlobalStyles";

// ─── Compact local styles ────────────────────────────────────────────────────

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px 10px;
  padding: 12px 16px;
  align-items: end;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  grid-column: span ${({ span }) => span || 1};
`;

const Lbl = styled.label`
  font-size: 0.7rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  &::after {
    content: ${({ required }) => (required ? '" *"' : '""')};
    color: #ef4444;
  }
`;

const Inp = styled.input`
  height: 28px;
  padding: 0 7px;
  font-size: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: ${({ readOnly }) => (readOnly ? "#f3f4f6" : "#fff")};
  color: #111827;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 2px #ccfbf1; }
`;

const Sel = styled.select`
  height: 28px;
  padding: 0 4px;
  font-size: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #111827;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: #0d9488; }
`;

const Txta = styled.textarea`
  padding: 4px 7px;
  font-size: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  resize: vertical;
  min-height: 44px;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: #0d9488; outline: none; }
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const IconBtn = styled.button`
  height: 28px;
  padding: 0 7px;
  font-size: 0.72rem;
  background: #0d9488;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover { background: #0f766e; }
`;

const SectionDivider = styled.div`
  grid-column: span 6;
  border-top: 1px solid #e5e7eb;
  margin: 4px 0 2px;
  padding-top: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #0d9488;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 8px 16px 12px;
  border-top: 1px solid #e5e7eb;
`;

const SmBtn = styled.button`
  height: 30px;
  padding: 0 14px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: ${({ secondary }) => (secondary ? "#e5e7eb" : "#0d9488")};
  color: ${({ secondary }) => (secondary ? "#374151" : "#fff")};
  &:hover { opacity: 0.88; }
`;

const TableSection = styled.div`
  border-top: 1px solid #e5e7eb;
  padding: 12px 16px;
`;

const TableTitle = styled.h3`
  font-size: 0.8rem;
  font-weight: 700;
  color: #0d9488;
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StatusBadge = styled.span`
  padding: 2px 7px;
  border-radius: 10px;
  font-size: 0.68rem;
  font-weight: 700;
  background: ${({ active }) => (active ? "#dcfce7" : "#fee2e2")};
  color: ${({ active }) => (active ? "#166534" : "#991b1b")};
`;

const MiniBtn = styled.button`
  height: 24px;
  padding: 0 8px;
  font-size: 0.68rem;
  font-weight: 600;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  background: ${({ danger }) => (danger ? "#ef4444" : "#0d9488")};
  color: #fff;
  &:disabled { opacity: 0.4; cursor: default; }
  &:hover:not(:disabled) { opacity: 0.85; }
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  padding: 10px 16px;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PageTitle = styled.h2`
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: 0.04em;
`;

// ─── Component ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  uhid: "",
  ipNumber: "",
  salutation: "",
  firstName: "",
  middleName: "",
  lastName: "",
  customerType: "",
  insuranceCompany: "",
  privilegedCustomerId: "",
  admissionDate: new Date().toISOString().split("T")[0],
  time: new Date().toTimeString().slice(0, 5),
  admittingDoctor: "",
  consultingDoctor: "",
  roomNo: "",
  bedNo: "",
  reasonForAdmission: "",
  packageName: "",
  mlc_type: "",
  mlc_doc: null,
  mlc_remarks: "",
  // read-only from patient
  age: "",
  gender: "",
  phone: "",
  permanent_address: "",
  area: "",
  zipcode: "",
  city: "",
  state: "",
};

const Admission = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [doctors, setDoctors] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Room modal
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomQuery, setRoomQuery] = useState("");
  const [roomResults, setRoomResults] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    fetchDoctors();
    fetchAdmissions();
  }, []);

  // ── Fetches ────────────────────────────────────────────────────────────────

  const fetchDoctors = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
      if (res.success) setDoctors(res.data || []);
    } catch {}
  };

  const fetchAdmissions = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}admission/`, "GET");
      if (res.success) setAdmissions(res.data || []);
    } catch {}
  };

  // ── Patient lookup by UHID ────────────────────────────────────────────────

  const fetchPatientByUHID = async () => {
    if (!formData.uhid) return toast.warning("Enter UHID");
    try {
      // Check already admitted
      const already = admissions.find(
        (a) => a.uhid === formData.uhid && a.is_active !== false
      );
      if (already)
        toast.error(
          `Patient ${already.firstName} is ALREADY ADMITTED (IP: ${already.ipNumber})`
        );

      const res = await apiRequest(
        `${HmsBaseUrl}op-patient/${encodeURIComponent(formData.uhid)}/`,
        "GET"
      );
      if (!res.success) throw new Error(res.error || "Not found");
      const d = res.data;
      setFormData((prev) => ({
        ...prev,
        salutation: d.salutation || "",
        firstName: d.firstName || "",
        middleName: d.middleName || "",
        lastName: d.lastName || "",
        customerType: d.customerType || "",
        insuranceCompany: d.insuranceCompany || "",
        privilegedCustomerId: d.privilegedCustomerId || "",
        admittingDoctor: d.admittingDoctor || prev.admittingDoctor,
        consultingDoctor: d.consultingDoctor || prev.consultingDoctor,
        age: d.age || "",
        gender: d.gender || "",
        phone: d.phone || "",
        permanent_address: d.permanent_address || "",
        area: d.area || "",
        zipcode: d.zipcode || "",
        city: d.city || "",
        state: d.state || "",
      }));
      toast.success("Patient details loaded");
    } catch (e) {
      toast.error("Patient not found");
    }
  };

  // ── Admission lookup by IP Number ────────────────────────────────────────

  const fetchAdmissionByIP = async () => {
    if (!formData.ipNumber) return toast.warning("Enter IP Number");
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}admission/?ip_number=${encodeURIComponent(formData.ipNumber)}`,
        "GET"
      );
      if (!res.success) throw new Error(res.error || "Not found");
      const list = res.data || [];
      if (list.length === 0) return toast.error("No admission found for this IP Number");
      const adm = list[0];
      setEditingId(adm._id || adm.id);
      setFormData({
        ...EMPTY_FORM,
        ...adm,
        admissionDate: adm.admissionDate ? adm.admissionDate.split("T")[0] : "",
      });
      toast.success(`Admission loaded: ${adm.ipNumber}`);
    } catch {
      toast.error("Admission not found");
    }
  };

  // ── Room search ───────────────────────────────────────────────────────────

  const searchRooms = async () => {
    setLoadingRooms(true);
    try {
      const q = roomQuery ? `?room_number=${encodeURIComponent(roomQuery)}` : "";
      const res = await apiRequest(`${HmsBaseUrl}search-rooms/${q}`, "GET");
      if (res.success) setRoomResults(res.data || []);
      else setRoomResults([]);
    } catch {
      setRoomResults([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleRoomSelect = (room) => {
    setFormData((prev) => ({
      ...prev,
      roomNo: room.room_number,
      bedNo: "",          // user must select bed explicitly
    }));
    setShowRoomModal(false);
    setRoomQuery("");
    setRoomResults([]);
    toast.success(`Room ${room.room_number} selected — please choose a bed`);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleReset = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };

  const handleEdit = (adm) => {
    setEditingId(adm._id || adm.id);
    setFormData({
      ...EMPTY_FORM,
      ...adm,
      admissionDate: adm.admissionDate
        ? adm.admissionDate.split("T")[0]
        : EMPTY_FORM.admissionDate,
    });
    window.scrollTo(0, 0);
    toast.info("Editing admission");
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this admission?")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}admission/${id}/`, "DELETE");
      if (res.success) {
        toast.success("Admission cancelled");
        fetchAdmissions();
      }
    } catch {
      toast.error("Failed to cancel");
    }
  };

  const handleSubmit = async () => {
    if (!formData.uhid) return toast.warning("UHID is required");
    if (!formData.admittingDoctor) return toast.warning("Admitting Doctor is required");
    if (!formData.roomNo) return toast.warning("Room is required");
    if (!formData.bedNo) return toast.warning("Bed is required");

    const payload = new FormData();
    const fieldsToSend = [
      "uhid", "admissionDate", "time",
      "salutation", "firstName", "middleName", "lastName",
      "customerType", "insuranceCompany", "privilegedCustomerId",
      "admittingDoctor", "consultingDoctor",
      "roomNo", "bedNo",
      "reasonForAdmission", "packageName",
      "mlc_type", "mlc_remarks",
    ];
    fieldsToSend.forEach((k) => {
      if (formData[k] !== null && formData[k] !== undefined && formData[k] !== "") {
        payload.append(k, formData[k]);
      }
    });
    if (formData.mlc_doc instanceof File) {
      payload.append("mlc_doc", formData.mlc_doc);
    }

    try {
      let res;
      if (editingId) {
        res = await apiRequest(`${HmsBaseUrl}admission/${editingId}/`, "PUT", payload);
      } else {
        res = await apiRequest(`${HmsBaseUrl}admission/`, "POST", payload);
      }
      if (res.success) {
        toast.success(editingId ? "Admission updated!" : "Admission saved!");
        handleReset();
        fetchAdmissions();
      } else {
        throw new Error(res.error);
      }
    } catch (e) {
      toast.error("Failed to save admission");
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      <Container style={{ padding: 0 }}>
        <PageHeader>
          <PageTitle>
            {editingId ? "✏️ Edit Admission" : "🏥 New Admission"}
          </PageTitle>
          {editingId && (
            <span style={{ fontSize: "0.7rem", color: "#ccfbf1" }}>
              Editing: {formData.ipNumber}
            </span>
          )}
        </PageHeader>

        <FormGrid>

          {/* ── Patient Search ─────────────────────────────────────────── */}
          <Field span={2}>
            <Lbl required>UHID</Lbl>
            <InputRow>
              <Inp
                name="uhid"
                value={formData.uhid}
                onChange={handleChange}
                placeholder="Enter UHID"
                readOnly={!!editingId}
              />
              <IconBtn type="button" onClick={fetchPatientByUHID}>🔍 Search</IconBtn>
            </InputRow>
          </Field>

          <Field span={2}>
            <Lbl>IP Number</Lbl>
            <InputRow>
              <Inp
                name="ipNumber"
                value={formData.ipNumber}
                onChange={handleChange}
                placeholder="Search by IP Number"
              />
              <IconBtn type="button" onClick={fetchAdmissionByIP}>🔍</IconBtn>
            </InputRow>
          </Field>

          <Field>
            <Lbl>Admission Date</Lbl>
            <Inp type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} />
          </Field>

          <Field>
            <Lbl>Time</Lbl>
            <Inp type="time" name="time" value={formData.time} onChange={handleChange} />
          </Field>

          {/* ── Patient Info ───────────────────────────────────────────── */}
          <SectionDivider>Patient Details</SectionDivider>

          <Field>
            <Lbl>Salutation</Lbl>
            <Sel name="salutation" value={formData.salutation} onChange={handleChange}>
              <option value=""></option>
              {["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Sel>
          </Field>

          <Field span={2}>
            <Lbl>First Name</Lbl>
            <Inp name="firstName" value={formData.firstName} onChange={handleChange} />
          </Field>

          <Field>
            <Lbl>Middle Name</Lbl>
            <Inp name="middleName" value={formData.middleName} onChange={handleChange} />
          </Field>

          <Field span={2}>
            <Lbl>Last Name</Lbl>
            <Inp name="lastName" value={formData.lastName} onChange={handleChange} />
          </Field>

          <Field span={2}>
            <Lbl>Customer Type</Lbl>
            <Inp value={formData.customerType} readOnly />
          </Field>

          <Field span={2}>
            <Lbl>Insurance Company</Lbl>
            <Inp name="insuranceCompany" readOnly />
          </Field>

          <Field span={2}>
            <Lbl>Privileged Customer ID</Lbl>
            <Inp name="privilegedCustomerId" readOnly />
          </Field>

          {/* Read-only patient data */}
          <Field>
            <Lbl>Age</Lbl>
            <Inp value={formData.age} readOnly />
          </Field>

          <Field>
            <Lbl>Gender</Lbl>
            <Inp value={formData.gender} readOnly />
          </Field>

          <Field span={2}>
            <Lbl>Phone</Lbl>
            <Inp value={formData.phone} readOnly />
          </Field>

          <Field span={2}>
            <Lbl>Area</Lbl>
            <Inp value={formData.area} readOnly />
          </Field>

          <Field span={3}>
            <Lbl>Permanent Address</Lbl>
            <Inp value={formData.permanent_address} readOnly />
          </Field>

          <Field>
            <Lbl>City</Lbl>
            <Inp value={formData.city} readOnly />
          </Field>

          <Field>
            <Lbl>State</Lbl>
            <Inp value={formData.state} readOnly />
          </Field>

          <Field>
            <Lbl>Zip Code</Lbl>
            <Inp value={formData.zipcode} readOnly />
          </Field>

          {/* ── Doctors ────────────────────────────────────────────────── */}
          <SectionDivider>Clinical</SectionDivider>

          <Field span={3} required>
            <Lbl required>Admitting Doctor</Lbl>
            <Sel name="admittingDoctor" value={formData.admittingDoctor} onChange={handleChange}>
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.employeeId} value={d.employeeName}>
                  {d.employeeName}
                </option>
              ))}
            </Sel>
          </Field>

          <Field span={3}>
            <Lbl>Consulting Doctor</Lbl>
            <Sel name="consultingDoctor" value={formData.consultingDoctor} onChange={handleChange}>
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.employeeId} value={d.employeeName}>
                  {d.employeeName}
                </option>
              ))}
            </Sel>
          </Field>

          {/* ── Room / Bed ─────────────────────────────────────────────── */}
          <SectionDivider>Room &amp; Bed</SectionDivider>

          <Field span={2}>
            <Lbl required>Room No.</Lbl>
            <InputRow>
              <Inp
                name="roomNo"
                value={formData.roomNo}
                onChange={handleChange}
                placeholder="Select room"
              />
              <IconBtn
                type="button"
                onClick={() => { setShowRoomModal(true); searchRooms(); }}
              >
                🔍
              </IconBtn>
            </InputRow>
          </Field>

          <Field span={2}>
            <Lbl required>Bed No.</Lbl>
            <Inp
              name="bedNo"
              value={formData.bedNo}
              onChange={handleChange}
              placeholder="Enter bed number"
            />
          </Field>

          {/* ── Reason & Package ───────────────────────────────────────── */}
          <Field span={3}>
            <Lbl>Reason for Admission</Lbl>
            <Txta name="reasonForAdmission" value={formData.reasonForAdmission} onChange={handleChange} rows={2} />
          </Field>

          <Field span={3}>
            <Lbl>Package Name</Lbl>
            <Sel name="packageName" value={formData.packageName} onChange={handleChange}>
              <option value=""></option>
              <option>General Package</option>
              <option>ECHS Package</option>
              <option>Insurance Package</option>
            </Sel>
          </Field>

          {/* ── MLC ────────────────────────────────────────────────────── */}
          <SectionDivider>MLC (if applicable)</SectionDivider>

          <Field span={2}>
            <Lbl>MLC Type</Lbl>
            <Sel name="mlc_type" value={formData.mlc_type} onChange={handleChange}>
              <option value=""></option>
              <option value="Accident">Accident</option>
              <option value="Assault">Assault</option>
              <option value="Other">Other</option>
            </Sel>
          </Field>

          <Field span={2}>
            <Lbl>MLC Document</Lbl>
            <Inp
              type="file"
              name="mlc_doc"
              onChange={handleChange}
              style={{ paddingTop: 3, height: "auto" }}
            />
          </Field>

          <Field span={2}>
            <Lbl>MLC Remarks</Lbl>
            <Txta name="mlc_remarks" value={formData.mlc_remarks} onChange={handleChange} rows={2} />
          </Field>

        </FormGrid>

        <ActionBar>
          <SmBtn secondary onClick={handleReset}>↺ Reset</SmBtn>
          <SmBtn onClick={handleSubmit}>
            {editingId ? "💾 Update" : "💾 Save Admission"}
          </SmBtn>
        </ActionBar>

        {/* ── Admitted Patients Table ──────────────────────────────────── */}
        <TableSection>
          <TableTitle>Admitted Patients</TableTitle>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>UHID</Th>
                  <Th>IP Number</Th>
                  <Th>Patient Name</Th>
                  <Th>Adm. Date</Th>
                  <Th>Room / Bed</Th>
                  <Th>Doctor</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {admissions.length === 0 ? (
                  <Tr>
                    <Td colSpan="8" style={{ textAlign: "center", padding: "24px" }}>
                      No admissions found
                    </Td>
                  </Tr>
                ) : (
                  admissions.map((adm, idx) => (
                    <Tr key={idx}>
                      <Td>{adm.uhid}</Td>
                      <Td>{adm.ipNumber}</Td>
                      <Td>
                        {`${adm.salutation || ""} ${adm.firstName || ""} ${adm.middleName || ""} ${adm.lastName || ""}`.trim()}
                      </Td>
                      <Td>
                        {adm.admissionDate
                          ? new Date(adm.admissionDate).toLocaleDateString("en-IN")
                          : "-"}
                      </Td>
                      <Td>{`${adm.roomNo || "-"} / ${adm.bedNo || "-"}`}</Td>
                      <Td>{adm.admittingDoctor || "-"}</Td>
                      <Td>
                        <StatusBadge active={adm.is_active !== false}>
                          {adm.is_active !== false ? "Active" : "Cancelled"}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <MiniBtn
                            onClick={() => handleEdit(adm)}
                            disabled={adm.is_active === false}
                          >
                            ✏️ Edit
                          </MiniBtn>
                          <MiniBtn
                            danger
                            onClick={() => handleCancel(adm._id || adm.id)}
                            disabled={adm.is_active === false}
                          >
                            🗑️ Cancel
                          </MiniBtn>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </TableSection>
      </Container>

      {/* ── Room Search Modal ──────────────────────────────────────────── */}
      {showRoomModal && (
        <ModalOverlay onClick={() => setShowRoomModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <ModalHeader>
              <ModalTitle>Search Rooms (Active Only)</ModalTitle>
              <CloseButton onClick={() => setShowRoomModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <SearchRow>
                <SearchInput
                  type="text"
                  placeholder="Room number..."
                  value={roomQuery}
                  onChange={(e) => setRoomQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchRooms()}
                />
                <Button type="button" onClick={searchRooms} disabled={loadingRooms}>
                  {loadingRooms ? "…" : "Search"}
                </Button>
              </SearchRow>

              {loadingRooms ? (
                <NoResults>Loading…</NoResults>
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
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomResults.map((room, i) => (
                      <tr key={i}>
                        <Td>{room.room_number}</Td>
                        <Td>{room.room_category}</Td>
                        <Td>{room.block}</Td>
                        <Td>{room.floor}</Td>
                        <Td>{room.capacity}</Td>
                        <Td>{room.nursing_station}</Td>
                        <Td>₹{room.admission_fee}</Td>
                        <Td>
                          <MiniBtn onClick={() => handleRoomSelect(room)}>
                            Select
                          </MiniBtn>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <NoResults>No active rooms found.</NoResults>
              )}
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default Admission;