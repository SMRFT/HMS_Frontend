import { useState, useEffect, useRef } from "react";
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

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  background: ${({ secondary }) => (secondary ? "#e5e7eb" : ({ print }) => print ? "#7c3aed" : "#0d9488")};
  color: ${({ secondary }) => (secondary ? "#374151" : "#fff")};
  &:hover { opacity: 0.88; }
`;

const PrintBtn = styled.button`
  height: 30px;
  padding: 0 14px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: #7c3aed;
  color: #fff;
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
  background: ${({ danger }) => (danger ? "#ef4444" : ({ print }) => print ? "#7c3aed" : "#0d9488")};
  color: #fff;
  &:disabled { opacity: 0.4; cursor: default; }
  &:hover:not(:disabled) { opacity: 0.85; }
`;

const MiniBtnPrint = styled.button`
  height: 24px;
  padding: 0 8px;
  font-size: 0.68rem;
  font-weight: 600;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  background: #7c3aed;
  color: #fff;
  &:hover { opacity: 0.85; }
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

const ClockDisplay = styled.div`
  font-size: 0.75rem;
  color: #ccfbf1;
  font-weight: 600;
  font-family: monospace;
`;

// ─── Print Styles (injected into <head>) ──────────────────────────────────────

const PRINT_STYLE = `
  @media print {
    body * { visibility: hidden !important; }
    #admission-print-slip, #admission-print-slip * { visibility: visible !important; }
    #admission-print-slip {
      position: fixed !important;
      left: 0; top: 0;
      width: 100vw;
      padding: 0;
      margin: 0;
    }
  }
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  uhid: "",
  ipNumber: "",
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
  salutation: "",
  firstName: "",
  middleName: "",
  lastName: "",
  age: "",
  gender: "",
  phone: "",
  permanent_address: "",
  area: "",
  zipcode: "",
  city: "",
  state: "",
  customerType: "",
  insuranceCompany: "",
  privilegedCustomerId: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

const Admission = () => {
  const [activeTab, setActiveTab] = useState("admission");
  const [mlcVisible, setMlcVisible] = useState(false);
  const [newBornVisible, setNewBornVisible] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [lastSaved, setLastSaved] = useState(null); // admission data after save for print
  const [now, setNow] = useState(new Date());

  // Room modal
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomSearchQuery, setRoomSearchQuery] = useState("");
  const [roomResults, setRoomResults] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [editingId, setEditingId] = useState(null); // Track if editing an admission

  // Bed modal
  const [showBedModal, setShowBedModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const printRef = useRef(null);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Running clock ──────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchNextIpNumber();
    fetchDoctors();
    fetchAdmissions();

    // Inject print style
    const style = document.createElement("style");
    style.innerHTML = PRINT_STYLE;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const formatClock = (d) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (d) =>
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const getDoctorName = (employeeId) => {
    const doc = doctors.find((d) => String(d.employeeId) === String(employeeId));
    return doc ? doc.employeeName : employeeId;
  };

  // ── Fetches ────────────────────────────────────────────────────────────────

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

  const fetchPatientByUHID = async () => {
    if (!formData.uhid) return toast.warning("Enter UHID first");
    try {
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
    } catch {
      toast.error("Patient not found");
    }
  };

  const fetchAdmissions = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}admission/`, "GET");
      if (res.success) {
        setAdmissions(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch admissions:", error);
    }
  };

  const fetchAdmissionByIP = async () => {
    if (!formData.ipNumber) return toast.warning("Enter IP Number first");
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
        // patient fields come enriched from backend GET
        salutation: adm.salutation || "",
        firstName: adm.firstName || "",
        middleName: adm.middleName || "",
        lastName: adm.lastName || "",
        age: adm.age || "",
        gender: adm.gender || "",
        phone: adm.phone || "",
        permanent_address: adm.permanent_address || "",
        area: adm.area || "",
        city: adm.city || "",
        state: adm.state || "",
        zipcode: adm.zipcode || "",
      });
      toast.success(`Admission loaded: ${adm.ipNumber}`);
    } catch {
      toast.error("Admission not found");
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
    setSelectedRoom(room);
    setFormData((prev) => ({ ...prev, roomNo: room.room_number, bedNo: "" }));
    setShowRoomModal(false);
    setShowBedModal(true);
  };

  const handleBedSelect = (bed) => {
    setFormData((prev) => ({ ...prev, bedNo: bed }));
    setShowBedModal(false);
    toast.success(`Room ${formData.roomNo} / Bed ${bed} selected`);
  };

  const openRoomSearchModal = () => {
    setShowRoomModal(true);
    searchRooms(); // Load all rooms initially
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value
    }));
  };

  const handleReset = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setLastSaved(null);
  };

  const handleEdit = (adm) => {
    setEditingId(adm._id || adm.id);
    setFormData({ ...EMPTY_FORM, ...adm });
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

  const handleSubmit = async () => {
    if (!formData.uhid) return toast.warning("UHID is required");
    if (!formData.admittingDoctor) return toast.warning("Admitting Doctor is required");
    if (!formData.roomNo) return toast.warning("Room is required");
    if (!formData.bedNo) return toast.warning("Bed is required");

    // Build admissionDateTime from current time
    const admissionDateTime = now.toISOString();

    const payload = new FormData();
    const fieldsToSend = [
      "uhid",
      "admittingDoctor",   // employeeId
      "consultingDoctor",  // employeeId
      "roomNo", "bedNo",
      "reasonForAdmission", "packageName",
      "mlc_type", "mlc_remarks",
    ];
    fieldsToSend.forEach((k) => {
      if (formData[k] !== null && formData[k] !== undefined && formData[k] !== "") {
        payload.append(k, formData[k]);
      }
    });
    payload.append("admissionDateTime", admissionDateTime);

    if (formData.mlc_doc instanceof File) {
      payload.append("mlc_doc", formData.mlc_doc);
    }

    try {
      let response;
      if (editingId) {
        // Update
        response = await apiRequest(`${HmsBaseUrl}admission/${editingId}/`, "PUT", payload);
      } else {
        // Create
        response = await apiRequest(`${HmsBaseUrl}admission/`, "POST", payload);
      }
      if (response.success) {
        toast.success(editingId ? "Admission updated!" : "Admission saved!");
        const savedData = response.data || {};
        // Enrich with patient + doctor info for print
        setLastSaved({
          ...savedData,
          salutation: formData.salutation,
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          age: formData.age,
          gender: formData.gender,
          phone: formData.phone,
          permanent_address: formData.permanent_address,
          area: formData.area,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipcode,
          customerType: formData.customerType,
          admittingDoctorName: getDoctorName(formData.admittingDoctor),
          roomNo: formData.roomNo,
          bedNo: formData.bedNo,
          admissionDateTime,
          uhid: formData.uhid,
        });
        fetchAdmissions();
      } else {
        throw new Error(response.error || "Failed to save admission");
      }
    } catch {
      toast.error("Failed to save admission");
    }
  };

  // ── Print ─────────────────────────────────────────────────────────────────

  const handlePrint = (admData) => {
    // Build barcode SVG inline using simple line pattern (Code128-like visual)
    const printData = admData || lastSaved;
    if (!printData) return;

    const ipNum = printData.ipNumber || "";
    const patientName = [printData.salutation, printData.firstName, printData.middleName, printData.lastName]
      .filter(Boolean).join(" ");
    const admDT = printData.admissionDateTime ? new Date(printData.admissionDateTime) : new Date();
    const admDateStr = admDT.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const admTimeStr = admDT.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const admittedBy = printData.admittingDoctorName || getDoctorName(printData.admittingDoctor) || "";

    // Generate simple barcode-like pattern from IP number string
    const barcodeLines = generateBarcodeSVG(ipNum);

    const printWindow = window.open("", "_blank", "width=600,height=400");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>IP Admission Slip</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 13px; padding: 20px; }
          .slip { width: 540px; margin: 0 auto; border: 1px solid #000; padding: 16px; }
          .row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
          .left { flex: 1; }
          .right { flex: 1; text-align: right; }
          .bold { font-weight: bold; }
          .big { font-size: 18px; font-weight: bold; }
          .line { margin-bottom: 5px; }
          .barcode-wrap { margin-bottom: 8px; }
          svg { display: block; }
          hr { border: none; border-top: 1px solid #000; margin: 8px 0; }
          @media print {
            body { padding: 0; }
            .slip { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="slip">
          <div class="row">
            <div class="left">
              <div class="barcode-wrap">${barcodeLines}</div>
              <div class="bold">${patientName}</div>
              ${printData.age || printData.gender ? `<div>${printData.age ? printData.age + " " : ""}${printData.gender || ""}</div>` : ""}
              ${printData.permanent_address ? `<div>${printData.permanent_address}</div>` : ""}
              ${printData.area || printData.city ? `<div>${[printData.area, printData.city, printData.state].filter(Boolean).join(", ")}</div>` : ""}
              ${printData.phone ? `<div>${printData.phone}</div>` : ""}
              ${admittedBy ? `<div class="line">Admitted : ${admittedBy}</div>` : ""}
              <div>Adhar Number :</div>
            </div>
            <div class="right">
              <div class="big">IP NO: ${ipNum}</div>
              ${printData.customerType ? `<div class="bold">${printData.customerType}</div>` : ""}
              <br/>
              <div>UHID : ${printData.uhid || ""}</div>
              <div>DOA : ${admDateStr}</div>
              <div>AD.TIME: ${admTimeStr}</div>
              <div>Room: ${printData.roomNo || ""}</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Simple barcode SVG generator (Code-like visual bars from string)
  const generateBarcodeSVG = (text) => {
    if (!text) return "";
    const width = 220;
    const height = 50;
    // Generate bar pattern from char codes
    let bars = "";
    let x = 0;
    const chars = text.split("");
    chars.forEach((ch, i) => {
      const code = ch.charCodeAt(0);
      // Alternating narrow/wide bars based on char code bits
      for (let b = 0; b < 4; b++) {
        const barW = ((code >> b) & 1) ? 3 : 1.5;
        if (i % 2 === 0) {
          bars += `<rect x="${x.toFixed(1)}" y="0" width="${barW}" height="${height}" fill="black"/>`;
        }
        x += barW + 1;
        if (x > width - 10) break;
      }
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${bars}</svg>`;
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      <Container style={{ padding: 0 }}>
        <PageHeader>
          <PageTitle>
            {editingId ? "✏️ Edit Admission" : "🏥 New Admission"}
          </PageTitle>
          <ClockDisplay>
            {formatDate(now)} &nbsp; {formatClock(now)}
          </ClockDisplay>
        </PageHeader>

        <FormGrid>

          {/* ── Patient Search ─────────────────────────────────────── */}
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
                readOnly={!editingId}
              />
              <IconBtn type="button" onClick={fetchAdmissionByIP}>🔍</IconBtn>
            </InputRow>
          </Field>

          <Field span={2}>
            <Lbl>Date &amp; Time</Lbl>
            <Inp
              value={`${formatDate(now)}  ${formatClock(now)}`}
              readOnly
              style={{ fontFamily: "monospace", background: "#f3f4f6" }}
            />
          </Field>

          {/* ── Patient Info (read-only from lookup) ───────────────── */}
          <SectionDivider>Patient Details (auto-filled from UHID)</SectionDivider>

          <Field span={3}>
            <Lbl>Patient Name</Lbl>
            <Inp
              value={[formData.salutation, formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(" ")}
              readOnly
            />
          </Field>

          <Field>
            <Lbl>Age</Lbl>
            <Inp value={formData.age} readOnly />
          </Field>

          <Field>
            <Lbl>Gender</Lbl>
            <Inp value={formData.gender} readOnly />
          </Field>

          <Field>
            <Lbl>Customer Type</Lbl>
            <Inp value={formData.customerType} readOnly />
          </Field>

          <Field span={2}>
            <Lbl>Insurance Company</Lbl>
            <Inp value={formData.insuranceCompany} readOnly />
          </Field>

          <Field span={2}>
            <Lbl>Privileged Customer ID</Lbl>
            <Inp value={formData.privilegedCustomerId} readOnly />
          </Field>

          <Field span={2}>
            <Lbl>Phone</Lbl>
            <Inp value={formData.phone} readOnly />
          </Field>

          <Field span={3}>
            <Lbl>Permanent Address</Lbl>
            <Inp value={formData.permanent_address} readOnly />
          </Field>

          <Field span={2}>
            <Lbl>Area</Lbl>
            <Inp value={formData.area} readOnly />
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

          {/* ── Doctors ───────────────────────────────────────────── */}
          <SectionDivider>Clinical</SectionDivider>

          <Field span={3}>
            <Lbl required>Admitting Doctor</Lbl>
            <Sel name="admittingDoctor" value={formData.admittingDoctor} onChange={handleChange}>
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.employeeId} value={d.employeeId}>
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
                <option key={d.employeeId} value={d.employeeId}>
                  {d.employeeName}
                </option>
              ))}
            </Sel>
          </Field>

          {/* ── Room / Bed ──────────────────────────────────────── */}
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

          {/* ── Reason & Package ───────────────────────────────── */}
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

          {/* ── MLC ──────────────────────────────────────────── */}
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
          {lastSaved && (
            <PrintBtn onClick={() => handlePrint(lastSaved)}>
              🖨️ Print Slip
            </PrintBtn>
          )}
          <SmBtn secondary onClick={handleReset}>↺ Reset</SmBtn>
          <SmBtn onClick={handleSubmit}>
            {editingId ? "💾 Update" : "💾 Save Admission"}
          </SmBtn>
        </ActionBar>

        {/* ── Admitted Patients Table ─────────────────────────────── */}
        <TableSection>
          <TableTitle>Admitted Patients</TableTitle>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>UHID</Th>
                  <Th>IP Number</Th>
                  <Th>Patient Name</Th>
                  <Th>Adm. Date &amp; Time</Th>
                  <Th>Room / Bed</Th>
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
                  admissions.map((adm, idx) => (
                    <Tr key={idx}>
                      <Td>{adm.uhid}</Td>
                      <Td>{adm.ipNumber}</Td>
                      <Td>
                        {[adm.salutation, adm.firstName, adm.middleName, adm.lastName].filter(Boolean).join(" ") || "-"}
                      </Td>
                      <Td>
                        {adm.admissionDateTime
                          ? new Date(adm.admissionDateTime).toLocaleString("en-IN")
                          : "-"}
                      </Td>
                      <Td>{`${adm.roomNo || "-"} / ${adm.bedNo || "-"}`}</Td>
                      <Td>{adm.admittingDoctorName || getDoctorName(adm.admittingDoctor) || "-"}</Td>
                      <Td>
                        <StatusBadge active={adm.is_active !== false}>
                          {adm.is_active !== false ? "Active" : "Cancelled"}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <MiniBtn onClick={() => handleEdit(adm)} disabled={adm.is_active === false}>
                            ✏️
                          </MiniBtn>
                          <MiniBtnPrint onClick={() => handlePrint(adm)}>
                            🖨️
                          </MiniBtnPrint>
                          <MiniBtn danger onClick={() => handleCancel(adm._id || adm.id)} disabled={adm.is_active === false}>
                            🗑️
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

      {/* ── Room Search Modal ──────────────────────────────────────── */}
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
                          <MiniBtn onClick={() => handleRoomSelect(room)}>Select</MiniBtn>
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

      {/* ── Bed Select Modal ───────────────────────────────────────── */}
      {showBedModal && selectedRoom && (
        <ModalOverlay onClick={() => setShowBedModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <ModalHeader>
              <ModalTitle>Select Bed — Room {selectedRoom.room_number}</ModalTitle>
              <CloseButton onClick={() => setShowBedModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 12 }}>
                {(selectedRoom.beds || []).map((bed, i) => (
                  <MiniBtn
                    key={i}
                    onClick={() => handleBedSelect(bed.bed_number || bed)}
                    disabled={bed.is_occupied}
                    style={{ height: 36, padding: "0 14px", fontSize: "0.8rem" }}
                  >
                    {bed.bed_number || bed}
                    {bed.is_occupied ? " (Occ.)" : ""}
                  </MiniBtn>
                ))}
                {(!selectedRoom.beds || selectedRoom.beds.length === 0) && (
                  <NoResults>No beds configured for this room.</NoResults>
                )}
              </div>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default Admission;